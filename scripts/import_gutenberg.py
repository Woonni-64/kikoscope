#!/usr/bin/env python3
"""
从多个开源API导入文章
1. Project Gutenberg (gutendex.com) - 经典文学作品
"""

import urllib.request
import urllib.error
import json
import time
import re
from pathlib import Path

# 保存数据的目录
DATA_DIR = Path("articles")
DATA_DIR.mkdir(exist_ok=True)

def sanitize_filename(title):
    """清理文件名"""
    title = re.sub(r'[<>:"/\\|?*]', '', title)
    title = title.strip()[:100]
    return title

def fetch_json(url, params=None):
    """获取JSON数据"""
    if params:
        import urllib.parse
        url = url + "?" + urllib.parse.urlencode(params)

    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"请求失败: {e}")
        return None

def fetch_text(url):
    """获取文本内容"""
    try:
        with urllib.request.urlopen(url, timeout=60) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"下载失败: {e}")
        return None

def extract_gutenberg_content(content):
    """从Gutenberg文本中提取正文"""
    start_match = re.search(r'\*\*\*\s*START.*?\*\*\*', content, re.IGNORECASE | re.DOTALL)
    end_match = re.search(r'\*\*\*\s*END', content, re.IGNORECASE)

    if start_match and end_match:
        start_idx = start_match.end()
        end_idx = end_match.start()
        content = content[start_idx:end_idx]

    content = re.sub(r'\r\n', '\n', content)
    content = re.sub(r'\n{3,}', '\n\n', content)

    return content.strip()

def download_gutenberg_books():
    """从Project Gutenberg下载书籍"""
    print("从Project Gutenberg导入文章...")

    url = "https://gutendex.com/books"
    data = fetch_json(url, {"languages": "en", "sort": "popular"})

    if not data:
        print("获取Gutenberg数据失败")
        return 0

    books = data.get("results", [])[:50]  # 先导入50本
    print(f"找到 {len(books)} 本书籍")

    downloaded = 0
    for book in books:
        try:
            title = book.get("title", "Unknown")
            authors = book.get("authors", [])
            author_name = authors[0]["name"] if authors else "Unknown"
            book_id = book.get("id")

            formats = book.get("formats", {})
            text_url = formats.get("text/plain; charset=utf-8") or formats.get("text/plain")

            if not text_url:
                html_url = formats.get("text/html; charset=utf-8") or formats.get("text/html")
                if html_url:
                    text_url = html_url
                else:
                    continue

            print(f"下载: {title[:40]}... (ID: {book_id})")
            content = fetch_text(text_url)

            if not content or len(content) < 500:
                continue

            content = extract_gutenberg_content(content)

            if len(content) < 500:
                continue

            summary = content[:200].strip() + "..."
            summary = summary.replace('"', '\\"')

            filename = f"gutenberg-{book_id}-{sanitize_filename(title)}.md"
            filepath = DATA_DIR / filename

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
            time.sleep(0.3)

        except Exception as e:
            print(f"处理失败: {book.get('title', 'Unknown')[:30]} - {str(e)}")
            continue

    print(f"\nGutenberg导入完成! 共导入 {downloaded} 篇文章")
    return downloaded

def main():
    print("=" * 50)
    print("开始导入开源文章...")
    print("=" * 50)

    gutenberg_count = download_gutenberg_books()

    print("\n" + "=" * 50)
    print(f"导入完成! 总计导入 {gutenberg_count} 篇新文章")
    print("=" * 50)

if __name__ == '__main__':
    main()
