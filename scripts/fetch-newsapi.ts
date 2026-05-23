import { loadEnvLocal } from "./utils/load-env";
import { processArticle } from "./utils/article-processor";

loadEnvLocal();

const API_KEY = process.env.NEWSAPI_API_KEY;
const BASE_URL = "https://newsapi.org/v2/everything";

const KEYWORDS = [
  "technology", "science", "environment", "society", "psychology",
  "health", "education", "climate", "nature", "history",
  "space", "medicine", "business", "culture", "research"
];

const MIN_WORDS = 550;

function countWords(text: string): number {
  return text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)?.length ?? 0;
}

async function fetchNewsAPI() {
  if (!API_KEY) {
    console.error("Missing NEWSAPI_API_KEY in .env.local");
    return { successCount: 0, failureCount: 0 };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const keyword of KEYWORDS) {
    console.log(`Fetching ${keyword} articles from NewsAPI...`);
    
    try {
      const url = `${BASE_URL}?q=${encodeURIComponent(keyword)}&apiKey=${API_KEY}&language=en&pageSize=20&sortBy=relevancy`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`NewsAPI returned ${res.status}`);
      }
      
      const data = await res.json();
      const articles = data?.articles || [];
      
      for (const article of articles) {
        const title = article.title || "";
        const content = article.content || article.description || "";
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
              source: "NewsAPI.ai",
              license: "Free tier terms",
              topic: keyword,
            },
            "articles/newsapi",
          );
          successCount++;
        } catch (error) {
          failureCount++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error fetching ${keyword}:`, error);
      failureCount += 20;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(
    JSON.stringify({ source: "NewsAPI.ai", successCount, failureCount }, null, 2)
  );
  console.log("NewsAPI.ai 抓取完成");
  
  return { successCount, failureCount };
}

fetchNewsAPI().catch(console.error);
