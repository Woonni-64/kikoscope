#!/usr/bin/env python3
"""
分步导入数据集
"""

import urllib.request
import json
import time
import re
from pathlib import Path

DATA_DIR = Path("articles")
DATA_DIR.mkdir(exist_ok=True)

def sanitize_filename(title):
    title = re.sub(r'[<>:"/\\|?*]', '', title)
    title = title.strip()[:80]
    return title

def fetch_json(url):
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"请求失败: {e}")
        return None

def download_gutenberg():
    print("从Project Gutenberg导入（第一批30本）...")

    data = fetch_json("https://gutendex.com/books?languages=en&sort=popular")
    if not data:
        print("获取失败")
        return 0

    books = data.get("results", [])[:30]
    downloaded = 0

    for book in books:
        try:
            title = book.get("title", "Unknown")[:50]
            authors = book.get("authors", [])
            author = authors[0]["name"] if authors else "Unknown"
            book_id = book.get("id")

            formats = book.get("formats", {})
            text_url = formats.get("text/plain; charset=utf-8") or formats.get("text/plain")

            if not text_url:
                continue

            print(f"下载: {title}...")
            try:
                with urllib.request.urlopen(text_url, timeout=30) as resp:
                    content = resp.read().decode('utf-8', errors='ignore')
            except:
                continue

            if len(content) < 500:
                continue

            start = re.search(r'\*\*\*\s*START.*?\*\*\*', content, re.IGNORECASE | re.DOTALL)
            end = re.search(r'\*\*\*\s*END', content, re.IGNORECASE)
            if start and end:
                content = content[start.end():end.start()]

            content = re.sub(r'\r\n', '\n', content)
            content = re.sub(r'\n{3,}', '\n\n', content)
            content = content.strip()

            if len(content) < 500:
                continue

            summary = content[:200].replace('"', '\\"') + "..."

            filename = f"gutenberg-{book_id}-{sanitize_filename(title)}.md"
            filepath = DATA_DIR / filename

            frontmatter = f'''---
title: "{title}"
category: "文学"
difficulty: "1200"
author: "{author}"
summary: "{summary}"
source: "Project Gutenberg"
---

{content}
'''

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(frontmatter)

            downloaded += 1
            time.sleep(0.3)

        except Exception as e:
            continue

    print(f"Gutenberg完成: {downloaded} 篇")
    return downloaded

def download_ielts():
    print("\n从IELTS AI Dataset导入...")

    url = "https://raw.githubusercontent.com/LuchoBazz/ielts-ai-dataset/main/practice_drills/reading/ielts_reading_academic_band_9.0_test_001.json"
    data = fetch_json(url)

    if not data:
        print("IELTS数据获取失败")
        return 0

    downloaded = 0
    try:
        title = data.get("title", "IELTS Reading")
        text = data.get("text", "")
        questions = data.get("questions", [])

        if text and len(text) > 100:
            summary = text[:200].replace('"', '\\"') + "..."

            questions_text = ""
            for i, q in enumerate(questions[:15], 1):
                q_text = q.get("question", "")
                options = q.get("options", [])
                questions_text += f"\n\n### Question {i}\n{q_text}\n"
                if options:
                    for opt in options:
                        questions_text += f"- {opt}\n"

            content = f"{text}\n\n## Questions{questions_text}"

            filename = f"ielts-reading-1.md"
            filepath = DATA_DIR / filename

            frontmatter = f'''---
title: "{title}"
category: "雅思"
difficulty: "700"
summary: "{summary}"
source: "IELTS AI Dataset"
---

{content}
'''

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(frontmatter)

            downloaded = 1
            print(f"导入: IELTS Reading Sample")

    except Exception as e:
        print(f"处理失败: {e}")

    print(f"IELTS完成: {downloaded} 篇")
    return downloaded

def download_gaokao():
    print("\n从GAOKAO-Bench导入...")

    # 尝试不同的URL
    urls = [
        "https://raw.githubusercontent.com/OpenLMLab/GAOKAO-Bench/main/GAOKAO.json",
        "https://raw.githubusercontent.com/OpenEduAI/GAOKAO-Bench/main/GAOKAO.json",
    ]

    data = None
    for url in urls:
        print(f"尝试: {url}")
        data = fetch_json(url)
        if data:
            break

    if not data:
        print("GAOKAO数据获取失败")
        return 0

    downloaded = 0
    try:
        if isinstance(data, list):
            items = data[:100]
        else:
            items = data.get("results", data.get("data", []))[:100]

        for idx, item in enumerate(items):
            try:
                if isinstance(item, str):
                    continue

                question = item.get("question", "")[:100]
                category = item.get("category", "英语")
                year = item.get("year", "")

                if question and len(question) > 10:
                    content = f"## {category} - {year}\n\n### 题目\n{question}\n\n"

                    if "choices" in item:
                        for choice in item["choices"]:
                            content += f"- {choice}\n"

                    if "standard_answer" in item:
                        content += f"\n### 标准答案\n{item['standard_answer']}\n"

                    summary = question[:100].replace('"', '\\"') + "..."

                    filename = f"gaokao-{year}-{idx}.md"
                    filepath = DATA_DIR / filename

                    frontmatter = f'''---
title: "高考英语 - {year}"
category: "高考"
difficulty: "800"
summary: "{summary}"
source: "GAOKAO-Bench"
---

{content}
'''

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(frontmatter)

                    downloaded += 1
                    if downloaded <= 5:
                        print(f"导入: {filename}")

            except:
                continue

    except Exception as e:
        print(f"处理失败: {e}")

    print(f"GAOKAO完成: {downloaded} 篇")
    return downloaded

if __name__ == '__main__':
    print("="*50)
    print("开始导入开源数据集...")
    print("="*50)

    total = 0
    total += download_gutenberg()
    total += download_ielts()
    total += download_gaokao()

    print("\n" + "="*50)
    print(f"总计导入: {total} 篇")
    print("="*50)
