import { loadEnvLocal } from "./utils/load-env";
import { processArticle } from "./utils/article-processor";

loadEnvLocal();

const API_KEY = process.env.WEBZ_API_KEY;
const BASE_URL = "https://api.webz.io/newsApiLite";

const KEYWORDS = [
  "technology", "science", "environment", "society", "psychology",
  "health", "education", "climate", "nature", "history",
  "space", "medicine", "business", "culture", "research"
];

const MIN_WORDS = 550;

function countWords(text: string): number {
  return text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
}

async function fetchWebz() {
  if (!API_KEY || API_KEY === "your_webz_api_key_here") {
    console.error("Missing WEBZ_API_KEY in .env.local");
    console.log("Please add your Webz.io API key to .env.local");
    return { successCount: 0, failureCount: 0 };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const keyword of KEYWORDS) {
    console.log(`Fetching ${keyword} articles from Webz.io...`);
    
    try {
      const url = `${BASE_URL}?token=${API_KEY}&q=${encodeURIComponent(keyword)}&size=10`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Webz.io API returned ${res.status}`);
      }
      
      const data = await res.json();
      const posts = data?.posts || [];
      
      for (const post of posts) {
        const title = post.title || "";
        const content = post.text || post.content || post.thread?.text || "";
        const wordCount = countWords(content);
        
        if (!title || wordCount < MIN_WORDS) {
          failureCount++;
          continue;
        }
        
        try {
          await processArticle(
            {
              title,
              content,
              source: "Webz.io",
              license: "Free tier terms",
              topic: keyword,
            },
            "articles/webz",
          );
          successCount++;
        } catch (error) {
          failureCount++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error fetching ${keyword}:`, error);
      failureCount += 10;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(
    JSON.stringify({ source: "Webz.io", successCount, failureCount }, null, 2)
  );
  console.log("Webz.io 抓取完成");
  
  return { successCount, failureCount };
}

fetchWebz().catch(console.error);
