#!/usr/bin/env python3
"""
导入本地数据集
"""

import json
import re
from pathlib import Path

DATA_DIR = Path("articles")
DATA_DIR.mkdir(exist_ok=True)

def sanitize_filename(title):
    title = re.sub(r'[<>:"/\\|?*]', '', title)
    title = title.strip()[:80]
    return title

def import_ielts():
    """导入IELTS数据"""
    print("导入IELTS...")

    reading_dir = Path("data/ielts-ai-dataset-main/practice_drills/reading")
    if not reading_dir.exists():
        print("IELTS目录不存在")
        return 0

    files = list(reading_dir.glob("*.json"))
    print(f"找到 {len(files)} 个IELTS文件")

    imported = 0
    for idx, file in enumerate(files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            title = data.get("title", f"IELTS Reading {idx+1}")
            text = data.get("text", "")
            questions = data.get("questions", [])

            if not text or len(text) < 100:
                continue

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

            filename = f"ielts-{idx+1}-{sanitize_filename(title)}.md"
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

            imported += 1
            print(f"  导入: {title[:40]}")

        except Exception as e:
            print(f"  失败: {file.name} - {e}")
            continue

    print(f"IELTS完成: {imported} 篇")
    return imported

def import_gaokao():
    """导入GAOKAO数据"""
    print("\n导入GAOKAO...")

    obj_dir = Path("data/GAOKAO-Bench-main/Data/Objective_Questions")
    sub_dir = Path("data/GAOKAO-Bench-main/Data/Subjective_Questions")

    imported = 0

    for data_dir in [obj_dir, sub_dir]:
        if not data_dir.exists():
            continue

        files = list(data_dir.glob("*.json"))
        print(f"从 {data_dir.name} 找到 {len(files)} 个文件")

        for file in files:
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                if isinstance(data, list):
                    items = data
                else:
                    items = data.get("results", [])

                for idx, item in enumerate(items[:50]):  # 每类取前50条
                    try:
                        question = item.get("question", item.get("Question", ""))[:200]
                        category = item.get("category", item.get("Category", "英语"))
                        year = item.get("year", item.get("Year", ""))

                        if not question or len(question) < 20:
                            continue

                        content = f"## {category} - {year}\n\n### 题目\n{question}\n\n"

                        choices = item.get("choices", item.get("Choices", []))
                        if choices:
                            for choice in choices:
                                content += f"- {choice}\n"

                        answer = item.get("standard_answer", item.get("Standard Answer", ""))
                        if answer:
                            content += f"\n### 标准答案\n{answer}\n"

                        analysis = item.get("analysis", item.get("Analysis", ""))
                        if analysis:
                            content += f"\n### 解析\n{analysis}\n"

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

                        imported += 1
                        if imported <= 10:
                            print(f"  导入: {filename}")

                    except:
                        continue

            except Exception as e:
                print(f"  失败: {file.name} - {e}")
                continue

    print(f"GAOKAO完成: {imported} 篇")
    return imported

def import_cet():
    """导入CET四六级数据"""
    print("\n导入CET四六级...")

    cet_file = Path("data/cet4-practice-tool-main/data/questions.js")
    if not cet_file.exists():
        print("CET文件不存在")
        return 0

    try:
        with open(cet_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 解析JS文件
        data = json.loads(content)

        imported = 0
        for idx, exam in enumerate(data):
            try:
                title = exam.get("title", f"CET四级模拟题 {idx+1}")
                questions = exam.get("questions", [])

                if not questions:
                    continue

                content = f"# {title}\n\n"

                for q in questions:
                    q_type = q.get("type", "选择题")
                    q_text = q.get("question", "")
                    options = q.get("options", [])

                    content += f"\n## {q_type}\n{q_text}\n"
                    if options:
                        for opt in options:
                            content += f"- {opt}\n"

                summary = content[:150].replace('"', '\\"') + "..."

                filename = f"cet4-{idx+1}-{sanitize_filename(title)}.md"
                filepath = DATA_DIR / filename

                frontmatter = f'''---
title: "{title}"
category: "四六级"
difficulty: "600"
summary: "{summary}"
source: "CET4 Practice Tool"
---

{content}
'''

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(frontmatter)

                imported += 1
                print(f"  导入: {title[:40]}")

            except:
                continue

        print(f"CET完成: {imported} 篇")
        return imported

    except Exception as e:
        print(f"CET导入失败: {e}")
        return 0

if __name__ == '__main__':
    print("="*50)
    print("开始导入本地数据集...")
    print("="*50)

    total = 0
    total += import_ielts()
    total += import_gaokao()
    total += import_cet()

    print("\n" + "="*50)
    print(f"总计导入: {total} 篇")
    print("="*50)
