import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import {
  articleCacheDirectory,
  articleIndexPath,
  articleSlugMapPath,
  articlesDirectory,
  generateSlug,
  parseArticleParagraphs,
  stripIeltsQuestions,
  type Article,
  type ArticleIndexEntry,
  type ArticleMeta,
} from "@/lib/articles";
import {
  convertRaceToArticle,
  getAllRaceArticles,
  getRaceSlug,
} from "@/lib/race-data";

type ArticleFrontMatter = {
  title?: string;
  category?: string;
  difficulty?: string;
  date?: string | Date;
  summary?: string;
  quiz_key?: string;
  source?: string;
  translation?: string;
};

type ArticleCache = Article & {
  wordCount?: number;
  translation?: string;
};

type SlugMapEntry = {
  slug: string;
  cacheFileName: string;
  sourceType: "markdown" | "race";
  sourcePath: string;
  originalTitle: string;
};

const RACE_ARTICLE_LIMIT = 0;

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function resetCacheDirectory() {
  fs.rmSync(articleCacheDirectory, { recursive: true, force: true });
  ensureDirectory(articleCacheDirectory);
}

function formatDate(date: string | Date | undefined) {
  if (!date) {
    return "";
  }

  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }

  return date;
}

function getReadingTime(content: string) {
  const words = content.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

function extractTitleFromFilename(fileName: string): string {
  const name = fileName.replace(/\.md$/, "");

  const cleaned = name
    .replace(/^(ielts|race)-?(train|dev|test)-?/i, "")
    .replace(/^\d+[-_.]/, "")
    .replace(/^\d+-\d+-/, "")
    .replace(/you-should-spend-about-20-minutes/i, "")
    .replace(/-+/g, " ")
    .replace(
      /\b(IELTS|Academic|Reading|Practice|Advanced|Science|Band)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || name;
}

function createUniqueSlug(
  title: string,
  usedSlugs: Set<string>,
  collisionKey: string,
) {
  const baseSlug = generateSlug(title);

  if (!usedSlugs.has(baseSlug)) {
    usedSlugs.add(baseSlug);
    return baseSlug;
  }

  const suffix = crypto
    .createHash("sha1")
    .update(collisionKey)
    .digest("hex")
    .slice(0, 8);
  const uniqueSlug = `${baseSlug}-${suffix}`;
  usedSlugs.add(uniqueSlug);
  return uniqueSlug;
}

function writeArticleCache(cache: ArticleCache) {
  const cacheFileName = `${cache.slug}.json`;
  const cachePath = path.join(articleCacheDirectory, cacheFileName);
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  return cacheFileName;
}

function createIndexEntry(
  cache: ArticleMeta,
  extra: Pick<ArticleIndexEntry, "cacheFileName" | "originalTitle" | "sourceType" | "sourcePath">,
): ArticleIndexEntry {
  return {
    slug: cache.slug,
    title: cache.title,
    category: cache.category,
    difficulty: cache.difficulty,
    date: cache.date,
    summary: cache.summary,
    readingTime: cache.readingTime,
    quizKey: cache.quizKey,
    source: cache.source,
    ...extra,
  };
}

function buildMarkdownCaches(usedSlugs: Set<string>) {
  const articleFiles = fs
    .readdirSync(articlesDirectory)
    .filter((fileName) => fileName.endsWith(".md") && !fileName.startsWith("race-"));

  const indexEntries: ArticleIndexEntry[] = [];
  const slugMapEntries: SlugMapEntry[] = [];

  console.log(`Found ${articleFiles.length} markdown articles`);

  for (const fileName of articleFiles) {
    const fullPath = path.join(articlesDirectory, fileName);

    try {
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const frontMatter = data as ArticleFrontMatter;

      const title = frontMatter.title ?? extractTitleFromFilename(fileName);
      const slug = createUniqueSlug(title, usedSlugs, fileName);
      const cleanedContent = stripIeltsQuestions(content, {
        slug,
        category: frontMatter.category ?? "未分类",
        source: frontMatter.source,
      });
      const wordCount = content.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;

      const cache: ArticleCache = {
        slug,
        title,
        category: frontMatter.category ?? "未分类",
        difficulty: frontMatter.difficulty ?? "未标注",
        date: formatDate(frontMatter.date),
        summary: frontMatter.summary ?? "",
        readingTime: getReadingTime(content),
        quizKey: frontMatter.quiz_key,
        source: frontMatter.source,
        content: cleanedContent,
        paragraphs: parseArticleParagraphs(cleanedContent),
        wordCount,
        translation: frontMatter.translation,
      };

      const cacheFileName = writeArticleCache(cache);
      indexEntries.push(
        createIndexEntry(cache, {
          cacheFileName,
          originalTitle: title,
          sourceType: "markdown",
          sourcePath: fullPath,
        }),
      );
      slugMapEntries.push({
        slug,
        cacheFileName,
        sourceType: "markdown",
        sourcePath: fullPath,
        originalTitle: title,
      });
      console.log(`Processed markdown: ${fileName} -> ${slug}`);
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
    }
  }

  return { indexEntries, slugMapEntries };
}

function buildRaceCaches(usedSlugs: Set<string>) {
  const raceArticles = getAllRaceArticles(RACE_ARTICLE_LIMIT);
  const indexEntries: ArticleIndexEntry[] = [];
  const slugMapEntries: SlugMapEntry[] = [];

  console.log(`Found ${raceArticles.length} RACE articles`);

  for (const race of raceArticles) {
    const article = convertRaceToArticle(race);
    const slug = getRaceSlug(race.split, race.level, race.id);
    usedSlugs.add(slug);

    const cache: ArticleCache = {
      ...article,
      slug,
    };

    const cacheFileName = writeArticleCache(cache);
    const sourcePath = path.join(
      process.cwd(),
      "data",
      "RACE",
      race.split,
      race.level,
      `${race.id}.txt`,
    );

    indexEntries.push(
      createIndexEntry(cache, {
        cacheFileName,
        originalTitle: article.title,
        sourceType: "race",
        sourcePath,
      }),
    );
    slugMapEntries.push({
      slug,
      cacheFileName,
      sourceType: "race",
      sourcePath,
      originalTitle: article.title,
    });
  }

  return { indexEntries, slugMapEntries };
}

function main() {
  console.log("Building article cache...");

  ensureDirectory(path.dirname(articleIndexPath));
  resetCacheDirectory();

  const usedSlugs = new Set<string>();
  const markdown = buildMarkdownCaches(usedSlugs);
  const race = buildRaceCaches(usedSlugs);

  const allIndexEntries = [...markdown.indexEntries, ...race.indexEntries].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const allSlugMapEntries = [...markdown.slugMapEntries, ...race.slugMapEntries].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  fs.writeFileSync(articleIndexPath, JSON.stringify(allIndexEntries, null, 2));
  fs.writeFileSync(articleSlugMapPath, JSON.stringify(allSlugMapEntries, null, 2));

  console.log(`\n✅ Built ${allIndexEntries.length} article caches`);
  console.log(`✅ Created articles-index.json with ${allIndexEntries.length} entries`);
  console.log(`✅ Created articles-slug-map.json with ${allSlugMapEntries.length} entries`);
}

main();
