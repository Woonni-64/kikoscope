import fs from "node:fs";
import path from "node:path";
import { parseArticleParagraphs } from "./articles";
import type { Article, ArticleMeta } from "./articles";

const RACE_DIR = path.join(process.cwd(), "data", "RACE");

type RaceSplit = "train" | "dev" | "test";
type RaceLevel = "middle" | "high";

interface RawRaceData {
  article: string;
  questions: string[];
  options: string[][];
  answers: string[];
  id?: string;
}

export interface RaceArticleRaw {
  id: string;
  split: RaceSplit;
  level: RaceLevel;
  article: string;
  questions: string[];
  options: string[][];
  answers: string[];
}

export interface RaceQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const RACE_SLUG_PREFIX = "race";

const THEME_KEYWORDS: Record<string, string[]> = {
  科技: [
    "technology", "internet", "computer", "phone", "smartphone", "robot", "ai", "artificial intelligence",
    "digital", "online", "software", "device", "machine", "science", "experiment", "research", "invention",
    "space", "scientist", "engineer", "tech", "app", "social media", "website", "virtual", "3d",
  ],
  环境: [
    "environment", "climate", "pollution", "plastic", "recycle", "ocean", "sea", "forest", "tree", "animal",
    "wildlife", "nature", "global warming", "carbon", "sustain", "green", "eco", "weather", "storm",
    "flood", "drought", "earthquake", "disaster", "species", "endangered", "conservation", "microplastic",
  ],
  教育: [
    "school", "student", "teacher", "class", "lesson", "learn", "study", "education", "college", "university",
    "exam", "test", "homework", "book", "library", "knowledge", "skill", "training", "campus", "professor",
    "degree", "graduate", "classroom", "curriculum", "tutor",
  ],
  健康: [
    "health", "doctor", "hospital", "medicine", "disease", "illness", "patient", "treatment", "exercise",
    "diet", "sleep", "stress", "mental", "body", "fitness", "virus", "bacteria", "immune", "vaccine",
    "nutrition", "calorie", "obesity", "diabetes", "heart", "cancer",
  ],
  社会: [
    "society", "people", "family", "friend", "community", "culture", "tradition", "government", "law",
    "city", "country", "world", "global", "nation", "citizen", "right", "equality", "justice", "charity",
    "volunteer", "neighbor", "relationship", "marriage", "parent", "child", "teenager",
  ],
  生活: [
    "life", "day", "week", "morning", "evening", "time", "money", "work", "job", "career", "home", "house",
    "apartment", "shop", "shopping", "food", "restaurant", "travel", "trip", "holiday", "vacation", "hobby",
    "friendship", "love", "dream", "goal", "happiness", "success",
  ],
  故事: [
    "story", "once upon", "one day", "there was", "said to", "thought to", "decided to", "went to", "came back",
    "suddenly", "finally", "after that", "the next day", "little boy", "little girl", "young man", "old man",
    "king", "queen", "prince", "princess", "animal", "dog", "cat", "bird", "fox", "wolf", "bear",
  ],
};

function detectTheme(content: string): string {
  const lowerContent = content.toLowerCase();
  const themeScores: Record<string, number> = {};

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = lowerContent.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    themeScores[theme] = score;
  }

  let topTheme = "故事";
  let topScore = 0;

  for (const [theme, score] of Object.entries(themeScores)) {
    if (score > topScore) {
      topScore = score;
      topTheme = theme;
    }
  }

  return topTheme;
}

function generateRaceTitle(article: string, level: RaceLevel, id: string): string {
  const levelLabel = level === "high" ? "高中" : "初中";
  
  const themes = detectTheme(article);
  const themeLabel = themes || "阅读";
  
  return `${levelLabel}${themeLabel}练习 - Article ${id}`;
}

export function getRaceSlug(split: RaceSplit, level: RaceLevel, id: string): string {
  return `${RACE_SLUG_PREFIX}-${split}-${level}-${id}`;
}

export function parseRaceSlug(
  slug: string,
): { split: RaceSplit; level: RaceLevel; id: string } | null {
  const parts = slug.split("-");
  if (parts.length < 4 || parts[0] !== RACE_SLUG_PREFIX) {
    return null;
  }

  const split = parts[1] as RaceSplit;
  const level = parts[2] as RaceLevel;
  const id = parts.slice(3).join("-");

  if (!["train", "dev", "test"].includes(split)) return null;
  if (!["middle", "high"].includes(level)) return null;

  return { split, level, id };
}

export function isRaceSlug(slug: string): boolean {
  return slug.startsWith(`${RACE_SLUG_PREFIX}-`);
}

function listRaceFiles(): Array<{
  filePath: string;
  split: RaceSplit;
  level: RaceLevel;
  id: string;
}> {
  if (!fs.existsSync(RACE_DIR)) {
    return [];
  }

  const files: Array<{
    filePath: string;
    split: RaceSplit;
    level: RaceLevel;
    id: string;
  }> = [];

  const splits: RaceSplit[] = ["train", "dev", "test"];
  const levels: RaceLevel[] = ["middle", "high"];

  for (const split of splits) {
    for (const level of levels) {
      const dirPath = path.join(RACE_DIR, split, level);
      if (!fs.existsSync(dirPath)) continue;

      const dirFiles = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith(".txt"));

      for (const file of dirFiles) {
        const id = file.replace(/\.txt$/, "");
        files.push({
          filePath: path.join(dirPath, file),
          split,
          level,
          id,
        });
      }
    }
  }

  return files;
}

function readRaceFile(fileInfo: {
  filePath: string;
  split: RaceSplit;
  level: RaceLevel;
  id: string;
}): RaceArticleRaw | null {
  try {
    const content = fs.readFileSync(fileInfo.filePath, "utf-8");
    const data = JSON.parse(content) as RawRaceData;

    return {
      id: fileInfo.id,
      split: fileInfo.split,
      level: fileInfo.level,
      article: data.article,
      questions: data.questions,
      options: data.options,
      answers: data.answers,
    };
  } catch (error) {
    console.error(`Error reading RACE file ${fileInfo.filePath}:`, error);
    return null;
  }
}

export function getAllRaceArticles(limit?: number): RaceArticleRaw[] {
  const files = listRaceFiles();
  const articles: RaceArticleRaw[] = [];

  const maxFiles = limit && limit > 0 ? Math.min(limit, files.length) : files.length;

  for (let i = 0; i < maxFiles; i++) {
    const article = readRaceFile(files[i]);
    if (article) {
      articles.push(article);
    }
  }

  return articles;
}

export function getRaceArticleBySlug(slug: string): RaceArticleRaw | null {
  const parsed = parseRaceSlug(slug);
  if (!parsed) return null;

  const filePath = path.join(RACE_DIR, parsed.split, parsed.level, `${parsed.id}.txt`);
  if (!fs.existsSync(filePath)) return null;

  return readRaceFile({
    filePath,
    split: parsed.split,
    level: parsed.level,
    id: parsed.id,
  });
}

export function convertRaceToArticle(race: RaceArticleRaw): Article {
  const slug = getRaceSlug(race.split, race.level, race.id);
  const title = generateRaceTitle(race.article, race.level, race.id);
  const theme = detectTheme(race.article);
  const firstParagraph = race.article.split(/\n+/)[0] || "";
  const summary =
    firstParagraph.slice(0, 150) + (firstParagraph.length > 150 ? "..." : "");

  const words = race.article.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(words / 180));

  return {
    slug,
    title,
    category: `${theme}/英语阅读`,
    difficulty: race.level === "high" ? "困难" : "中等",
    date: "2024-01-01",
    summary,
    readingTime: `${minutes} min read`,
    source: "RACE",
    quizKey: slug,
    content: race.article,
    paragraphs: parseArticleParagraphs(race.article),
  };
}

export function convertRaceToArticleMeta(race: RaceArticleRaw): ArticleMeta {
  const slug = getRaceSlug(race.split, race.level, race.id);
  const title = generateRaceTitle(race.article, race.level, race.id);
  const theme = detectTheme(race.article);
  const firstParagraph = race.article.split(/\n+/)[0] || "";
  const summary =
    firstParagraph.slice(0, 150) + (firstParagraph.length > 150 ? "..." : "");

  const words = race.article.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(words / 180));

  return {
    slug,
    title,
    category: `${theme}/英语阅读`,
    difficulty: race.level === "high" ? "困难" : "中等",
    date: "2024-01-01",
    summary,
    readingTime: `${minutes} min read`,
    source: "RACE",
    quizKey: slug,
  };
}

function answerLetterToIndex(answer: string): number {
  const normalized = answer.trim().toUpperCase();
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  return map[normalized] ?? 0;
}

export function getRaceQuestions(slug: string): RaceQuestion[] {
  const article = getRaceArticleBySlug(slug);
  if (!article) return [];

  return article.questions.map((question, index) => ({
    question,
    options: article.options[index] ?? [],
    correctAnswer: answerLetterToIndex(article.answers[index] ?? "A"),
  }));
}
