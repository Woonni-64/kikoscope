import { loadEnvLocal } from "./utils/load-env";
import { processArticle } from "./utils/article-processor";

loadEnvLocal();

const API_KEY = process.env.SMITHSONIAN_API_KEY;
const BASE_URL = "https://api.si.edu/openaccess/api/v1.0/search";

const TOPICS = [
  "science", "history", "nature", "space", "animal",
  "technology", "culture", "education", "medicine", "research",
  "climate", "environment", "psychology", "health", "ancient"
];

const MIN_WORDS = 550;

function normalizeContent(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join("\n\n");
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value ?? "");
}

function countWords(text: string): number {
  return text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
}

async function fetchSmithsonian() {
  if (!API_KEY) {
    throw new Error("Missing SMITHSONIAN_API_KEY in .env.local");
  }

  let successCount = 0;
  let failureCount = 0;

  for (const topic of TOPICS) {
    console.log(`Fetching ${topic} articles from Smithsonian...`);
    
    const url = `${BASE_URL}?q=${encodeURIComponent(topic)}&api_key=${API_KEY}&rows=50`;
    const res = await fetch(url);
    const data = await res.json();
    const rows = data?.response?.rows || [];

    for (const row of rows) {
      const title = row.title;
      const content = normalizeContent(row.content || row.description || row.summary || "");
      const wordCount = countWords(content);

      if (!title || wordCount < MIN_WORDS) {
        failureCount += 1;
        continue;
      }

      try {
        await processArticle(
          {
            title,
            content,
            source: "Smithsonian",
            license: "CC0",
            topic,
          },
          "articles/smithsonian",
        );
        successCount += 1;
      } catch (error) {
        failureCount += 1;
        console.error(`Smithsonian article failed: ${title}`, error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(
    JSON.stringify({ source: "Smithsonian", successCount, failureCount }, null, 2)
  );
  console.log("Smithsonian 抓取完成");
  
  return { successCount, failureCount };
}

fetchSmithsonian().catch(console.error);
