import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const articlesDirectory = path.join(process.cwd(), "articles");

// 确保 articles 目录存在
function ensureArticlesDirectory() {
  if (!fs.existsSync(articlesDirectory)) {
    fs.mkdirSync(articlesDirectory, { recursive: true });
  }
}

// 生成唯一的文件名
function generateUniqueFileName(title: string): string {
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  const timestamp = Date.now();
  return `${sanitizedTitle}-${timestamp}.md`;
}

// 拆分句子
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);
}

// 为句子生成翻译
async function translateSentence(sentence: string): Promise<string> {
  try {
    const response = await fetch("/api/define", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word: sentence }), // 注意：这里我们使用现有的 define API 来获取翻译
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.chineseMeaning || `[翻译] ${sentence}`;
    } else {
      return `[翻译] ${sentence}`;
    }
  } catch (error) {
    console.error("翻译失败:", error);
    return `[翻译] ${sentence}`;
  }
}

// 模拟文章数据
const mockArticles = [
  {
    title: "Technology Trends in 2026",
    content: "Artificial intelligence continues to advance at a rapid pace. Machine learning algorithms are becoming more sophisticated. Quantum computing is making significant progress. The Internet of Things is connecting more devices than ever before. Cybersecurity remains a top concern for organizations worldwide.",
    description: "Latest technology trends and developments in 2026",
    publishedAt: new Date().toISOString()
  },
  {
    title: "The Future of Education",
    content: "Online learning platforms are transforming education. Virtual reality is creating immersive learning experiences. Personalized learning paths are becoming the norm. Teachers are using AI to enhance their teaching methods. Lifelong learning is becoming increasingly important in the modern world.",
    description: "How technology is changing the education landscape",
    publishedAt: new Date().toISOString()
  },
  {
    title: "Healthcare Innovations",
    content: "Telemedicine is making healthcare more accessible. Wearable devices are helping people monitor their health. AI is being used to diagnose diseases more accurately. Gene editing technology is advancing rapidly. Mental health support is becoming more integrated into primary care.",
    description: "Latest innovations in healthcare technology",
    publishedAt: new Date().toISOString()
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const keyword = body.keyword || "technology";
    
    console.log(`Received request to fetch articles for keyword: ${keyword}`);
    
    // 模拟模式：由于网络限制，使用预定义的模拟文章数据
    console.log("Using mock article data due to network restrictions");
    const articles = mockArticles;
    
    // 2. 处理文章
    const processedArticles = [];
    
    for (const article of articles) {
      if (!article.content || !article.title) {
        console.log(`Skipping article without content or title: ${article.title || 'Untitled'}`);
        continue;
      }
      
      console.log(`Processing article: ${article.title}`);
      
      // 3. 拆分句子
      const sentences = splitSentences(article.content);
      console.log(`Split into ${sentences.length} sentences`);
      
      // 4. 为每个句子生成翻译
      console.log(`Generating translations for ${sentences.length} sentences`);
      const translations = await Promise.all(
        sentences.map(sentence => translateSentence(sentence))
      );
      console.log(`Generated ${translations.length} translations`);
      
      // 5. 保存到 Markdown 文件
      ensureArticlesDirectory();
      
      const fileName = generateUniqueFileName(article.title);
      const filePath = path.join(articlesDirectory, fileName);
      console.log(`Saving article to: ${fileName}`);
      
      // 构建 Markdown 内容
      const markdownContent = `---
title: "${article.title}"
category: "${keyword}"
difficulty: "Intermediate"
date: "${new Date(article.publishedAt || new Date()).toISOString().split('T')[0]}"
summary: "${article.description || article.title}"
---

${article.content}
`;
      
      fs.writeFileSync(filePath, markdownContent);
      console.log(`Saved article to: ${filePath}`);
      
      processedArticles.push({
        title: article.title,
        fileName,
        sentences: sentences.length,
        translated: translations.length
      });
      
      // 避免请求过快，超出 API 限频
      console.log("Waiting 1 second to avoid API rate limiting");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Successfully processed ${processedArticles.length} articles`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${processedArticles.length} articles`,
      articles: processedArticles
    });
    
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: `Failed to fetch articles: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
