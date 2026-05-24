import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { generateSlug, parseArticleParagraphs } from "../src/lib/articles";
import {
  buildSummary,
  countWords,
  inferDifficulty,
} from "./utils/article-processor";

type FrontMatter = Record<string, unknown> & {
  title?: string;
  category?: string;
  difficulty?: string;
  source?: string;
  summary?: string;
  license?: string;
  word_count?: number;
  slug?: string;
};

type CleanupStats = {
  scanned: number;
  restored?: number;
  hidden: number;
  splitPending: number;
  preservedIeltsToefl: number;
  updated: number;
  examTemplateHidden: number;
  literaryHidden: number;
};

const articlesDirectory = path.join(process.cwd(), "articles");
const ieltsKeywords = /(ielts|toefl|雅思|托福)/i;
const literatureKeywords = /(literature|fiction|novel|poetry|文学|小说|诗歌)/i;
const examTitleKeywords =
  /(section|passage|mock\s*test|真题|模考|you should spend about 20 minutes|ielts academic reading|reading passage)/i;
const examBodyKeywords = [
  /you should spend about 20 minutes/i,
  /questions?\s+\d+/i,
  /choose (one|no more than)/i,
  /write your answers/i,
  /true\/false\/not given/i,
  /matching headings/i,
  /section [a-z0-9]/i,
  /passage [0-9ivx]+/i,
  /mock test/i,
  /真题/i,
  /模考/i,
];

function getMarkdownFiles(dir: string) {
  return fs
    .readdirSync(dir)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();
}

function inferSource(source: string | undefined, fileName: string) {
  const normalizedSource = (source ?? "").trim();
  if (normalizedSource) {
    return normalizedSource;
  }

  const lowerFileName = fileName.toLowerCase();
  if (lowerFileName.startsWith("bbc-")) return "BBC";
  if (lowerFileName.startsWith("guardian-")) return "The Guardian";
  if (lowerFileName.startsWith("nyt-")) return "The New York Times";
  if (lowerFileName.startsWith("gutenberg-")) return "Project Gutenberg";
  if (lowerFileName.startsWith("ielts-")) return "雅思";
  if (lowerFileName.startsWith("cet-")) return "CET";
  if (lowerFileName.startsWith("gaokao-")) return "高考";

  return "";
}

function getLicense(source: string | undefined) {
  const normalized = (source ?? "").toLowerCase();

  if (normalized.includes("project gutenberg")) {
    return "Public Domain";
  }

  if (normalized.includes("race")) {
    return "Academic use (fair use)";
  }

  if (normalized.includes("guardian")) {
    return "Non-commercial use only";
  }

  if (normalized.includes("wikipedia")) {
    return "CC BY-SA";
  }

  return "Unknown";
}

function normalizeCategory(category: string | undefined) {
  const normalized = (category ?? "").trim().toLowerCase();

  if (
    normalized.includes("tech") ||
    normalized.includes("science") ||
    normalized.includes("科技")
  ) {
    return "Science & Technology";
  }

  if (
    normalized.includes("environment") ||
    normalized.includes("nature") ||
    normalized.includes("环境") ||
    normalized.includes("自然")
  ) {
    return "Environment";
  }

  if (normalized.includes("psychology") || normalized.includes("心理")) {
    return "Psychology";
  }

  if (
    normalized.includes("health") ||
    normalized.includes("medical") ||
    normalized.includes("健康")
  ) {
    return "Health";
  }

  if (
    normalized.includes("history") ||
    normalized.includes("society") ||
    normalized.includes("culture") ||
    normalized.includes("社会") ||
    normalized.includes("历史") ||
    normalized.includes("文化") ||
    normalized.includes("教育")
  ) {
    return "Society";
  }

  switch (normalized) {
    default:
      return category?.trim() || "Society";
  }
}

function isExamTemplate(title: string, content: string, source: string, fileName: string) {
  const titleOrFile = `${title}\n${fileName}\n${source}`;
  if (examTitleKeywords.test(titleOrFile)) {
    return true;
  }

  const bodyHits = examBodyKeywords.reduce((count, pattern) => {
    return count + (pattern.test(content) ? 1 : 0);
  }, 0);

  return bodyHits >= 2;
}

function isPureCambridgeOrCetExam(title: string, content: string) {
  const combined = `${title}\n${content.slice(0, 1200)}`;
  return /(cambridge|cet)/i.test(combined) && isExamTemplate(title, content, "", "");
}

function isLiterary(frontMatter: FrontMatter, content: string) {
  const combined = [
    frontMatter.title,
    frontMatter.category,
    frontMatter.source,
    String(frontMatter.author ?? ""),
    String(frontMatter.tags ?? ""),
    String(frontMatter.summary ?? ""),
  ]
    .join("\n")
    .trim();

  if (literatureKeywords.test(combined)) {
    return true;
  }

  return (
    String(frontMatter.source ?? "").toLowerCase().includes("project gutenberg") &&
    /chapter\s+[ivxlc0-9]+|contents/i.test(content.slice(0, 3000))
  );
}

function updateFrontMatter(filePath: string, frontMatter: FrontMatter, content: string) {
  fs.writeFileSync(filePath, matter.stringify(content.trim(), frontMatter));
}

function main() {
  const stats: CleanupStats = {
    scanned: 0,
    restored: 0,
    hidden: 0,
    splitPending: 0,
    preservedIeltsToefl: 0,
    updated: 0,
    examTemplateHidden: 0,
    literaryHidden: 0,
  };

  const markdownFiles = getMarkdownFiles(articlesDirectory);

  for (const fileName of markdownFiles) {
    const filePath = path.join(articlesDirectory, fileName);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const frontMatter = data as FrontMatter;
    const title = String(frontMatter.title ?? fileName.replace(/\.md$/, ""));
    const source = inferSource(String(frontMatter.source ?? ""), fileName);
    const category = String(frontMatter.category ?? "");
    const sentenceCount = parseArticleParagraphs(content).reduce(
      (count, paragraph) => count + paragraph.sentences.length,
      0,
    );
    const wordCount = countWords(content);
    const taggedIeltsToefl = ieltsKeywords.test(
      `${title}\n${category}\n${source}\n${fileName}`,
    );
    const examTemplate = isExamTemplate(title, content, source, fileName);
    const pureCambridgeOrCetExam = isPureCambridgeOrCetExam(title, content);
    const tooShort = sentenceCount > 0 && sentenceCount < 5;
    const literary = isLiterary(frontMatter, content);
    const splitPending = sentenceCount > 500;

    stats.scanned += 1;

    if (taggedIeltsToefl && !examTemplate && !pureCambridgeOrCetExam && !tooShort) {
      stats.preservedIeltsToefl += 1;
    }

    const shouldHideForExam =
      examTemplate || pureCambridgeOrCetExam || tooShort;

    const nextFrontMatter: FrontMatter = {
      ...frontMatter,
      title,
      slug: generateSlug(title),
      category:
        literary || splitPending || shouldHideForExam
          ? "Hidden"
          : normalizeCategory(category),
      difficulty: splitPending ? "Split-Pending" : inferDifficulty(wordCount),
      source,
      license: String(frontMatter.license ?? getLicense(source)),
      summary: String(frontMatter.summary ?? buildSummary(content)),
      word_count: wordCount,
      tags: [
        ...new Set(
          [
            ...(Array.isArray(frontMatter.tags)
              ? (frontMatter.tags as string[])
              : []),
            ...(shouldHideForExam ? ["exam-template"] : []),
          ].filter(Boolean),
        ),
      ],
    };

    if (literary) {
      stats.hidden += 1;
      stats.literaryHidden += 1;
    }

    if (splitPending) {
      stats.hidden += literary ? 0 : 1;
      stats.splitPending += 1;
      if (!String(nextFrontMatter.summary).includes("待拆分")) {
        nextFrontMatter.summary = `${String(nextFrontMatter.summary)} 待拆分`;
      }
    }

    if (shouldHideForExam) {
      stats.hidden += literary || splitPending ? 0 : 1;
      stats.examTemplateHidden += 1;
    }

    updateFrontMatter(filePath, nextFrontMatter, content);
    stats.updated += 1;
  }

  console.log(JSON.stringify(stats, null, 2));
}

main();
