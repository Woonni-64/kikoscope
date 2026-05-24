import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { loadEnvLocal } from "./utils/load-env";

loadEnvLocal();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ARTICLES_DIR = path.join(process.cwd(), "articles", "curated");

interface ArticleFrontMatter {
  title?: string;
  cefr?: string;
  difficulty?: string;
  [key: string]: unknown;
}

interface ArticleResult {
  slug: string;
  title: string;
  cefr: string;
  status: "success" | "failed";
  method: "api" | "heuristic";
  error?: string;
}

function analyzeCefrByHeuristics(content: string): string {
  const wordCount = content.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
  const sentences = content.split(/[.!?]+/).length;
  const avgWordsPerSentence = wordCount / Math.max(1, sentences);

  const contentLower = content.toLowerCase();

  if (avgWordsPerSentence < 10 && wordCount < 200) {
    return "A2";
  }
  if (avgWordsPerSentence < 12 && wordCount < 400) {
    return "B1";
  }
  if (avgWordsPerSentence < 16 && wordCount < 600) {
    return "B2";
  }
  if (avgWordsPerSentence < 20 && wordCount < 900) {
    return "C1";
  }
  return "C2";
}

async function analyzeCefrLevelByApi(content: string): Promise<string> {
  const prompt = `请根据CEFR标准，评估以下英文文章的阅读难度。只返回一个等级（A1, A2, B1, B2, C1, C2），不要其他内容。

文章内容：
${content.slice(0, 2000)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 10 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  const cefrMatch = generatedText?.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);

  if (cefrMatch) {
    return cefrMatch[1].toUpperCase();
  }
  throw new Error(`Invalid response: ${generatedText}`);
}

function scanDirectory(dir: string): string[] {
  const results: string[] = [];
  function scan(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }
  scan(dir);
  return results;
}

function getArticleFiles(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return scanDirectory(ARTICLES_DIR);
}

function updateFrontMatter(filePath: string, cefrLevel: string): void {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const updatedData: ArticleFrontMatter = { ...data, cefr: cefrLevel };
  fs.writeFileSync(filePath, matter.stringify(content, updatedData), "utf8");
}

async function processArticle(filePath: string): Promise<ArticleResult> {
  const fileName = path.basename(filePath, ".md");
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const title = (data as ArticleFrontMatter).title || fileName;
  const existingCefr = (data as ArticleFrontMatter).cefr;

  console.log(`Processing: ${title}`);

  try {
    let cefrLevel: string;
    let method: "api" | "heuristic" = "api";

    if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
      cefrLevel = await analyzeCefrLevelByApi(content.trim());
    } else {
      cefrLevel = analyzeCefrByHeuristics(content.trim());
      method = "heuristic";
      console.log(`  📊 Using heuristic analysis`);
    }

    updateFrontMatter(filePath, cefrLevel);
    console.log(`  ✓ CEFR: ${cefrLevel}`);

    return { slug: fileName, title, cefr: cefrLevel, status: "success", method };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log(`  ⚠ API failed (${errorMessage}), using heuristic`);
    const cefrLevel = analyzeCefrByHeuristics(content.trim());
    updateFrontMatter(filePath, cefrLevel);

    return { slug: fileName, title, cefr: cefrLevel, status: "success", method: "heuristic", error: errorMessage };
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🔍 CEFR Tagging Script");
  console.log("=====================\n");

  if (!GEMINI_API_KEY || GEMINI_API_KEY.length <= 10) {
    console.log("⚠️ GEMINI_API_KEY not found or invalid. Using heuristic analysis.\n");
  }

  const articleFiles = getArticleFiles();
  if (articleFiles.length === 0) {
    console.log("No articles found in articles/");
    process.exit(0);
  }

  console.log(`Found ${articleFiles.length} articles.\n`);
  const results: ArticleResult[] = [];

  for (const filePath of articleFiles) {
    const result = await processArticle(filePath);
    results.push(result);
    await sleep(1000);
  }

  console.log("\n=====================");
  console.log("📊 Results Summary");
  console.log("=====================\n");

  const apiCount = results.filter((r) => r.method === "api").length;
  const heuristicCount = results.filter((r) => r.method === "heuristic").length;

  console.log(`Total: ${results.length} articles`);
  console.log(`  - Via API: ${apiCount}`);
  console.log(`  - Via Heuristics: ${heuristicCount}\n`);

  const cefrCounts: Record<string, number> = {};
  for (const result of results) {
    cefrCounts[result.cefr] = (cefrCounts[result.cefr] || 0) + 1;
  }
  console.log("CEFR Level Distribution:");
  for (const [level, count] of Object.entries(cefrCounts).sort()) {
    console.log(`  ${level}: ${count} articles`);
  }

  console.log("\n✅ CEFR tagging complete!");
  console.log("\nRunning build-articles...");

  const { spawn } = require("child_process");
  const build = spawn("npm", ["run", "build-articles"], { stdio: "inherit" });

  build.on("close", (code: number) => {
    console.log(`\nbuild-articles completed with code ${code}`);
  });
}

main().catch(console.error);
