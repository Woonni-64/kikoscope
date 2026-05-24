#!/usr/bin/env python3
"""
从多个开源API导入文章
1. Project Gutenberg (gutendex.com) - 经典文学作品
2. 尝试其他有习题的数据源
"""

import requests
import time
import re
from pathlib import Path
import json

# 保存数据的目录
DATA_DIR = Path("articles")
DATA_DIR.mkdir(exist_ok=True)

def sanitize_filename(title):
    """清理文件名"""
    # 替换特殊字符
    title = re.sub(r'[<>:"/\\|?*]', '', title)
    title = title.strip()[:100]  # 限制长度
    return title

def download_gutenberg_books():
    """从Project Gutenberg下载书籍"""
    print("从Project Gutenberg导入文章...")

    # 获取最受欢迎的书籍（英文）
    url = "https://gutendex.com/books"
    params = {
        "languages": "en",
        "sort": "popular"
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        books = data.get("results", [])[:100]  # 先导入100本

        print(f"找到 {len(books)} 本书籍")

        downloaded = 0
        for book in books:
            try:
                # 获取书籍信息
                title = book.get("title", "Unknown")
                authors = book.get("authors", [])
                author_name = authors[0]["name"] if authors else "Unknown"
                book_id = book.get("id")

                # 获取文本格式的URL
                formats = book.get("formats", {})
                text_url = formats.get("text/plain; charset=utf-8") or formats.get("text/plain")

                if not text_url:
                    # 尝试HTML格式
                    html_url = formats.get("text/html; charset=utf-8") or formats.get("text/html")
                    if html_url:
                        text_url = html_url
                    else:
                        continue

                # 下载内容
                print(f"下载: {title[:50]}... (ID: {book_id})")
                content_response = requests.get(text_url, timeout=60)
                content_response.raise_for_status()

                content = content_response.text

                # 提取正文（去掉Gutenberg的头部和尾部）
                content = extract_gutenberg_content(content)

                if len(content) < 500:  # 内容太短，跳过
                    continue

                # 生成摘要（取前200个字符）
                summary = content[:200].strip() + "..."

                # 创建markdown文件
                filename = f"gutenberg-{book_id}-{sanitize_filename(title)}.md"
                filepath = DATA_DIR / filename

                # 生成frontmatter
                frontmatter = f"""---
title: "{title}"
category: "文学"
difficulty: "1200"
author: "{author_name}"
summary: "{summary}"
source: "Project Gutenberg"
---

{content}
"""

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(frontmatter)

                downloaded += 1
                time.sleep(0.5)  # 避免请求过快

            except Exception as e:
                print(f"下载失败: {book.get('title', 'Unknown')[:30]} - {str(e)}")
                continue

        print(f"\nGutenberg导入完成! 共导入 {downloaded} 篇文章")
        return downloaded

    except Exception as e:
        print(f"获取Gutenberg数据失败: {str(e)}")
        return 0

def extract_gutenberg_content(content):
    """从Gutenberg文本中提取正文"""
    # 查找"*** START"和"*** END"标记
    start_match = re.search(r'\*\*\*\s*START.*?\*\*\*', content, re.IGNORECASE | re.DOTALL)
    end_match = re.search(r'\*\*\*\s*END', content, re.IGNORECASE)

    if start_match and end_match:
        start_idx = start_match.end()
        end_idx = end_match.start()
        content = content[start_idx:end_idx]
    else:
        # 如果没有标记，尝试查找第一个段落
        lines = content.split('\n')
        content_lines = []
        in_content = False

        for line in lines:
            if len(line.strip()) > 20:
                in_content = True
            if in_content:
                content_lines.append(line)

        content = '\n'.join(content_lines)

    # 清理内容
    content = re.sub(r'\r\n', '\n', content)
    content = re.sub(r'\n{3,}', '\n\n', content)

    return content.strip()

def main():
    """主函数"""
    print("=" * 50)
    print("开始导入开源文章...")
    print("=" * 50)

    # 1. 从Project Gutenberg导入
    gutenberg_count = download_gutenberg_books()

    print("\n" + "=" * 50)
    print(f"导入完成!")
    print(f"- Gutenberg: {gutenberg_count} 篇")
    print(f"总计: {gutenberg_count} 篇新文章")
    print("=" * 50)

if __name__ == '__main__':
    main()
