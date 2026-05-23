#!/usr/bin/env node

/**
 * 手动触发文章导入的脚本
 * 用法：node scripts/fetch-articles.js [关键词]
 * 示例：node scripts/fetch-articles.js technology
 */

// 使用 Node.js 内置的 fetch API (Node.js 18+ 可用)


async function fetchArticles(keyword = 'technology') {
  try {
    console.log(`正在从 NewsAPI.ai 导入关于 "${keyword}" 的文章...`);
    
    const response = await fetch('http://localhost:3000/api/fetch-articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword }),
    });
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ 成功导入 ${data.articles.length} 篇文章:`);
      data.articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title} (${article.fileName})`);
      });
    } else {
      console.error(`❌ 导入失败: ${data.error}`);
    }
  } catch (error) {
    console.error(`❌ 发生错误: ${error.message}`);
  }
}

// 从命令行参数获取关键词
const keyword = process.argv[2] || 'technology';

fetchArticles(keyword);
