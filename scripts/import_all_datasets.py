#!/usr/bin/env python3
"""
导入多个开源数据集
1. IELTS AI Dataset (GitHub)
2. GAOKAO-Bench (GitHub)
3. Project Gutenberg (经典文学)
"""

import urllib.request
import urllib.parse
import json
import time
import re
from pathlib import Path

DATA_DIR = Path("articles")
DATA_DIR.mkdir(exist_ok=True)

def sanitize_filename(title):
    """清理文件名"""
    title = re.sub(r'[<>:"/\\|?*]', '', title)
    title = title.strip()[:80]
    return title

def fetch_json(url):
    """获取JSON数据"""
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

def download_gutenberg():
    """从Project Gutenberg下载"""
    print("\n" + "="*50)
    print("1. 从Project Gutenberg导入...")
    print("="*50)

    data = fetch_json("https://gutendex.com/books?languages=en&sort=popular")
    if not data:
        print("Gutenberg数据获取失败")
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
            text_url = formats.get("text/plain; charset=utf-8") or formats.get("text/plain") or formats.get("text/html; charset=utf-8") or formats.get("text/html")

            if not text_url:
                continue

            print(f"下载: {title}...")
            content = fetch_text(text_url)
            if not content or len(content) < 500:
                continue

            # 提取正文
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
            print(f"处理失败: {e}")
            continue

    print(f"Gutenberg导入完成: {downloaded} 篇")
    return downloaded

def download_ielts():
    """从GitHub下载IELTS数据集"""
    print("\n" + "="*50)
    print("2. 从IELTS AI Dataset导入...")
    print("="*50)

    downloaded = 0

    # IELTS Reading数据
    reading_url = "https://raw.githubusercontent.com/LuchoBazz/ielts-ai-dataset/main/practice_drills/reading/ielts_reading_academic_band_9.0_test_001.json"
    data = fetch_json(reading_url)

    if data:
        try:
            title = data.get("title", "IELTS Reading Practice")
            text = data.get("text", "")
            questions = data.get("questions", [])

            if text and len(text) > 100:
                summary = text[:200].replace('"', '\\"') + "..."

                filename = f"ielts-reading-{sanitize_filename(title)}.md"
                filepath = DATA_DIR / filename

                # 格式化题目
                questions_text = ""
                for i, q in enumerate(questions[:10], 1):  # 只取前10题
                    q_text = q.get("question", "")
                    options = q.get("options", [])
                    questions_text += f"\n\n### Question {i}\n{q_text}\n"
                    if options:
                        for opt in options:
                            questions_text += f"- {opt}\n"

                content = f"{text}\n\n## Questions{questions_text}"

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

                downloaded += 1
                print(f"导入: {title}")

        except Exception as e:
            print(f"处理IELTS失败: {e}")

    print(f"IELTS导入完成: {downloaded} 篇")
    return downloaded

def download_gaokao():
    """从GitHub下载GAOKAO数据集"""
    print("\n" + "="*50)
    print("3. 从GAOKAO-Bench导入...")
    print("="*50)

    downloaded = 0

    # 获取GAOKAO数据
    gaokao_url = "https://raw.githubusercontent.com/OpenLMLab/GAOKAO-Bench/main/GAOKAO.json"
    data = fetch_json(gaokao_url)

    if data:
        try:
            for idx, item in enumerate(data[:50]):  # 取前50条
                try:
                    question = item.get("question", "")[:100]
                    category = item.get("category", "英语")
                    year = item.get("year", "")

                    if question and len(question) > 20:
                        # 构建内容
                        content = f"## {category} - {year}\n\n### 题目\n{question}\n\n"

                        # 添加选项
                        if "choices" in item:
                            for choice in item["choices"]:
                                content += f"- {choice}\n"

                        # 添加答案和分析
                        if "standard_answer" in item:
                            content += f"\n### 标准答案\n{item['standard_answer']}\n"

                        if "analysis" in item:
                            content += f"\n### 解析\n{item['analysis']}\n"

                        summary = question[:100].replace('"', '\\"') + "..."

                        filename = f"gaokao-{year}-{sanitize_filename(question[:30])}.md"
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
                        if downloaded <= 10:
                            print(f"导入: {filename}")

                except Exception as e:
                    continue

        except Exception as e:
            print(f"处理GAOKAO失败: {e}")

    print(f"GAOKAO导入完成: {downloaded} 篇")
    return downloaded

def main():
    print("="*60)
    print("开始导入开源数据集...")
    print("="*60)

    total = 0
    total += download_gutenberg()
    total += download_ielts()
    total += download_gaokao()

    print("\n" + "="*60)
    print(f"导入完成! 总计: {total} 篇新文章")
    print("="*60)

if __name__ == '__main__':
    main()
