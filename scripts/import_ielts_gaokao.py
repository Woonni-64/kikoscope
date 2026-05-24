#!/usr/bin/env python3
"""
导入IELTS和GAOKAO数据集
"""

import urllib.request
import json
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

def download_ielts():
    print("从IELTS AI Dataset导入...")

    # 正确的URL列表
    urls = [
        "https://raw.githubusercontent.com/LuchoBazz/ielts-ai-dataset/main/practice_drills/reading/01_ielts_practice_test.json",
        "https://raw.githubusercontent.com/LuchoBazz/ielts-ai-dataset/main/practice_drills/reading/ielts_reading_academic_band_7.0_test_001.json",
        "https://raw.githubusercontent.com/LuchoBazz/ielts-ai-dataset/main/practice_drills/reading/ielts_reading_academic_band_8.0_test_001.json",
        "https://raw.githubusercontent.com/LuchoBazz/ielts-ai-dataset/main/practice_drills/reading/ielts_reading_academic_band_9.0_test_001.json",
    ]

    downloaded = 0

    for idx, url in enumerate(urls):
        print(f"下载: {url.split('/')[-1]}")
        data = fetch_json(url)

        if not data:
            continue

        try:
            title = data.get("title", f"IELTS Reading {idx+1}")
            text = data.get("text", "")
            questions = data.get("questions", [])

            if text and len(text) > 100:
                summary = text[:150].replace('"', '\\"') + "..."

                questions_text = ""
                for i, q in enumerate(questions[:20], 1):
                    q_text = q.get("question", "")
                    options = q.get("options", []) or q.get("gap_text", [])
                    questions_text += f"\n\n### Question {i}\n{q_text}\n"
                    if options:
                        for opt in options:
                            questions_text += f"- {opt}\n"

                content = f"{text}\n\n## Questions{questions_text}"

                filename = f"ielts-reading-{idx+1}.md"
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

                downloaded += 1
                print(f"  -> 导入成功: {title}")

        except Exception as e:
            print(f"处理失败: {e}")
            continue

    print(f"IELTS完成: {downloaded} 篇")
    return downloaded

def download_gaokao():
    print("\n从GAOKAO-Bench导入...")

    # 数据在Data文件夹中
    urls = [
        "https://raw.githubusercontent.com/OpenLMLab/GAOKAO-Bench/main/Data/2010-2022_English_Reading_Comprehension.json",
    ]

    downloaded = 0

    for url in urls:
        print(f"下载: {url.split('/')[-1]}")
        data = fetch_json(url)

        if not data:
            # 尝试其他URL
            print("尝试其他URL...")
            continue

        try:
            if isinstance(data, list):
                items = data[:100]  # 取前100条
            else:
                items = data.get("results", data.get("data", []))[:100]

            for idx, item in enumerate(items):
                try:
                    if isinstance(item, str):
                        continue

                    # 提取题目信息
                    question = item.get("question", item.get("Question", ""))[:150]
                    category = item.get("category", item.get("Category", "英语"))
                    year = item.get("year", item.get("Year", ""))

                    if question and len(question) > 20:
                        content = f"## {category} - {year}\n\n### 题目\n{question}\n\n"

                        # 添加选项
                        choices = item.get("choices", item.get("Choices", []))
                        if choices:
                            for choice in choices:
                                content += f"- {choice}\n"

                        # 添加答案
                        answer = item.get("standard_answer", item.get("Standard Answer", ""))
                        if answer:
                            content += f"\n### 标准答案\n{answer}\n"

                        # 添加解析
                        analysis = item.get("analysis", item.get("Analysis", ""))
                        if analysis:
                            content += f"\n### 解析\n{analysis}\n"

                        summary = question[:100].replace('"', '\\"') + "..."

                        filename = f"gaokao-{year}-{idx+1}.md"
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
                            print(f"  -> 导入: {filename}")

                except Exception as e:
                    continue

        except Exception as e:
            print(f"处理失败: {e}")

    print(f"GAOKAO完成: {downloaded} 篇")
    return downloaded

if __name__ == '__main__':
    print("="*50)
    print("导入IELTS和GAOKAO数据集...")
    print("="*50)

    total = 0
    total += download_ielts()
    total += download_gaokao()

    print("\n" + "="*50)
    print(f"总计导入: {total} 篇")
    print("="*50)
