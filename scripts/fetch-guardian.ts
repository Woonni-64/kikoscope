import { loadEnvLocal } from "./utils/load-env";
import { processArticle } from "./utils/article-processor";

loadEnvLocal();

const API_KEY = process.env.GUARDIAN_API_KEY;
const BASE_URL = "https://content.guardianapis.com/search";

const KEYWORDS = [
  "technology", "science", "environment", "society", "psychology",
  "health", "education", "climate", "nature", "history",
  "space", "medicine", "business", "culture", "research"
];

const MIN_WORDS = 550;

function countWords(text: string): number {
  return text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
}

async function fetchGuardian() {
  if (!API_KEY) {
    throw new Error("Missing GUARDIAN_API_KEY in .env.local");
  }

  let successCount = 0;
  let failureCount = 0;

  for (const keyword of KEYWORDS) {
    console.log(`Fetching ${keyword} articles from Guardian...`);
    
    const url = `${BASE_URL}?q=${encodeURIComponent(keyword)}&api-key=${API_KEY}&page-size=50&show-fields=body,headline,standfirst,wordcount`;
    const res = await fetch(url);
    const data = await res.json();
    const articles = data?.response?.results || [];

    for (const article of articles) {
      const title = article.fields?.headline || article.webTitle;
      const content = article.fields?.body || "";
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
            source: "The Guardian",
            license: "Non-commercial use only",
            topic: keyword,
            summary: article.fields?.standfirst ?? undefined,
          },
          "articles/guardian",
        );
        successCount += 1;
      } catch (error) {
        failureCount += 1;
        console.error(`Guardian article failed: ${title}`, error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(
    JSON.stringify({ source: "The Guardian", successCount, failureCount }, null, 2)
  );
  console.log("Guardian 抓取完成");
  
  return { successCount, failureCount };
}

fetchGuardian().catch(console.error);
