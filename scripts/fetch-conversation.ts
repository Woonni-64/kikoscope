import { loadEnvLocal } from "./utils/load-env";
import { processArticle } from "./utils/article-processor";

loadEnvLocal();

const TOPICS = ["technology", "environment", "health", "psychology", "society"];
const ARTICLE_LINK_PATTERN =
  /(?:https:\/\/theconversation\.com)?\/[a-z0-9-]+(?:\/[a-z0-9-]+)*-\d+/gi;

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchConversation() {
  let successCount = 0;
  let failureCount = 0;

  for (const topic of TOPICS) {
    const url = `https://theconversation.com/uk/topics/${topic}`;
    const res = await fetch(url);
    const html = await res.text();
    const links = html.match(ARTICLE_LINK_PATTERN) || [];
    const uniqueLinks = [...new Set(links)]
      .map((link) =>
        link.startsWith("http") ? link : `https://theconversation.com${link}`,
      )
      .filter((link) => !link.includes("/topics/"))
      .slice(0, 5);

    for (const link of uniqueLinks) {
      try {
        const articleRes = await fetch(link);
        const articleHtml = await articleRes.text();
        const titleMatch = articleHtml.match(/<title>(.*?)<\/title>/);
        const title = titleMatch
          ? titleMatch[1].replace(" – The Conversation", "")
          : "";
        const paragraphs = [
          ...articleHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi),
        ].map((match) => stripTags(match[1]));
        const content = paragraphs.filter(Boolean).join("\n\n").trim();

        if (title && content) {
          await processArticle(
            {
              title,
              content,
              source: "The Conversation",
              license: "CC BY-ND",
              topic,
            },
            "articles/conversation",
          );
          successCount += 1;
        } else {
          failureCount += 1;
        }
      } catch (error) {
        failureCount += 1;
        console.error(`Conversation article failed: ${link}`, error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(
    JSON.stringify(
      {
        source: "The Conversation",
        successCount,
        failureCount,
      },
      null,
      2,
    ),
  );
  console.log("The Conversation 抓取完成");
}

fetchConversation().catch(console.error);
