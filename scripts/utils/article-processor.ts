import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { generateSlug } from "../../src/lib/articles";

export type SourceCategory =
  | "technology"
  | "environment"
  | "psychology"
  | "society"
  | "health"
  | "science"
  | "history"
  | "culture";

export type StandardCategory =
  | "Science & Technology"
  | "Environment"
  | "Psychology"
  | "Society"
  | "Health"
  | "Hidden";

export type StandardDifficulty =
  | "Short Read"
  | "Evening Read"
  | "Deep Read"
  | "Quiet Read"
  | "Split-Pending";

export type StandardArticleMeta = {
  title: string;
  slug: string;
  category: string;
  difficulty: StandardDifficulty | string;
  source: string;
  license: string;
  summary: string;
  word_count: number;
  translation?: string;
  date?: string;
};

export type WriteArticleInput = {
  title: string;
  content: string;
  category: string;
  source: string;
  license: string;
  summary?: string;
  translation?: string;
  date?: string;
  slug?: string;
};

export type ProcessArticleInput = {
  title: string;
  content: string;
  source: string;
  license: string;
  topic: string;
  summary?: string;
  date?: string;
  translate?: boolean;
};

const CATEGORY_MAP: Record<SourceCategory, StandardCategory> = {
  technology: "Science & Technology",
  environment: "Environment",
  psychology: "Psychology",
  society: "Society",
  health: "Health",
  science: "Science & Technology",
  history: "Society",
  culture: "Society",
};

export function splitEnglishSentences(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const sentences =
    normalized.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map((sentence) =>
      sentence.trim(),
    ) ?? [];

  return sentences.filter(Boolean);
}

export function splitEnglishParagraphs(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function countWords(text: string) {
  const str = String(text ?? "");
  return str.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
}

export function inferDifficulty(wordCount: number): StandardDifficulty {
  if (wordCount < 800) {
    return "Short Read";
  }

  if (wordCount <= 1500) {
    return "Evening Read";
  }

  if (wordCount <= 3000) {
    return "Deep Read";
  }

  return "Quiet Read";
}

export function normalizeCategory(category: string) {
  const normalized = category.trim().toLowerCase() as SourceCategory;
  return CATEGORY_MAP[normalized] ?? category;
}

export function buildSummary(content: string, maxLength = 180) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export async function translateWithMyMemory(
  text: string,
  langpair = "en|zh-CN",
) {
  if (!text.trim()) {
    return "";
  }

  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", langpair);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`MyMemory API returned ${response.status}`);
  }

  const payload = (await response.json()) as {
    responseData?: {
      translatedText?: string;
    };
  };

  return payload.responseData?.translatedText?.trim() ?? "";
}

export async function translateParagraphsWithMyMemory(content: string) {
  const paragraphs = splitEnglishParagraphs(content);
  const translatedParagraphs: string[] = [];

  for (const paragraph of paragraphs) {
    translatedParagraphs.push(await translateWithMyMemory(paragraph));
  }

  return translatedParagraphs.join("\n\n").trim();
}

export function buildStandardMeta(input: WriteArticleInput): StandardArticleMeta {
  const wordCount = countWords(input.content);

  return {
    title: input.title,
    slug: input.slug ?? generateSlug(input.title),
    category: normalizeCategory(input.category),
    difficulty: inferDifficulty(wordCount),
    source: input.source,
    license: input.license,
    summary: input.summary?.trim() || buildSummary(input.content),
    word_count: wordCount,
    translation: input.translation?.trim() || "",
    date: input.date ?? "",
  };
}

export function writeStandardMarkdownArticle(
  directory: string,
  input: WriteArticleInput,
) {
  const meta = buildStandardMeta(input);
  fs.mkdirSync(directory, { recursive: true });

  const filePath = path.join(directory, `${meta.slug}.md`);
  const body = input.content.trim();
  const fileContents = matter.stringify(body, meta);

  fs.writeFileSync(filePath, fileContents);
  return {
    filePath,
    meta,
  };
}

export async function processArticle(
  input: ProcessArticleInput,
  outputDirectory: string,
) {
  const translation = input.translate
    ? await translateParagraphsWithMyMemory(input.content)
    : undefined;

  return writeStandardMarkdownArticle(outputDirectory, {
    title: input.title,
    content: input.content,
    category: input.topic,
    source: input.source,
    license: input.license,
    summary: input.summary,
    translation,
    date: input.date,
  });
}
