import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ArticleSentence = {
  text: string;
};

export type ArticleParagraph = {
  text: string;
  sentences: ArticleSentence[];
};

export type ArticleMeta = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  date: string;
  summary: string;
  readingTime: string;
  quizKey?: string;
  source?: string;
};

export type Article = ArticleMeta & {
  content: string;
  paragraphs: ArticleParagraph[];
};

const articlesDirectory = path.join(process.cwd(), "articles");

type ArticleFrontMatter = {
  title?: string;
  category?: string;
  difficulty?: string;
  date?: string | Date;
  summary?: string;
  quiz_key?: string;
  source?: string;
};

function ensureArticlesDirectory(): string[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const results: string[] = [];
  
  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const relativePath = path.relative(articlesDirectory, fullPath);
        results.push(relativePath);
      }
    }
  }
  
  scanDirectory(articlesDirectory);
  return results;
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

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/[*_~]/g, "")
    .trim();
}

function splitSentences(paragraph: string) {
  const matches =
    paragraph.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map((sentence) =>
      sentence.trim(),
    ) ?? [];

  const sentences = matches.filter(Boolean).map((text) => ({ text }));
  
  // 如果没有匹配到句子，返回整个段落作为一个句子
  if (sentences.length === 0 && paragraph.trim()) {
    return [{ text: paragraph.trim() }];
  }
  
  return sentences;
}

export function parseArticleParagraphs(content: string): ArticleParagraph[] {
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((paragraph) => stripMarkdown(paragraph))
    .filter(Boolean)
    .map((text) => ({
      text,
      sentences: splitSentences(text),
    }));
}

function readArticle(fileName: string): Article {
  const fullPath = path.join(articlesDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const frontMatter = data as ArticleFrontMatter;

  return {
    slug: fileName.replace(/\.md$/, ""),
    title: frontMatter.title ?? path.basename(fileName, ".md"),
    category: frontMatter.category ?? "未分类",
    difficulty: frontMatter.difficulty ?? "未标注",
    date: formatDate(frontMatter.date),
    summary: frontMatter.summary ?? "",
    readingTime: getReadingTime(content),
    quizKey: frontMatter.quiz_key,
    source: frontMatter.source,
    content,
    paragraphs: parseArticleParagraphs(content),
  };
}

export function getAllArticles() {
  return ensureArticlesDirectory()
    .map(readArticle)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllArticleMetas(): ArticleMeta[] {
  return getAllArticles().map((article) => ({
    slug: article.slug,
    title: article.title,
    category: article.category,
    difficulty: article.difficulty,
    date: article.date,
    summary: article.summary,
    readingTime: article.readingTime,
    quizKey: article.quizKey,
    source: article.source,
  }));
}

export function getArticleBySlug(slug: string) {
  const articles = ensureArticlesDirectory();
  
  let fileName = `${slug}.md`;
  
  if (articles.includes(fileName)) {
    return readArticle(fileName);
  }
  
  const matchingFile = articles.find(file => file.endsWith(`/${slug}.md`) || file === fileName);
  if (matchingFile) {
    return readArticle(matchingFile);
  }

  return null;
}

export function getArticleCategories() {
  const categories = new Set<string>();
  const articles = getAllArticleMetas();
  
  articles.forEach((article) => {
    const categoryParts = article.category.split("/");
    // 添加主分类
    categories.add(categoryParts[0]);
    
    // 如果是科技类，只添加科技类一个大类
    if (categoryParts[0] !== "科技类") {
      // 对于其他类别，添加考试类别作为单独类别
      if (categoryParts.length > 1) {
        categories.add(categoryParts[1]);
      }
    }
  });
  
  return Array.from(categories).sort();
}
