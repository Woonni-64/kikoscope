#!/usr/bin/env python3
"""
导入GAOKAO数据
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

def import_gaokao():
    """导入GAOKAO数据"""
    print("导入GAOKAO...")

    obj_file = Path("data/GAOKAO-Bench-main/Data/Objective_Questions/2010-2022_English_Reading_Comp.json")
    cloze_file = Path("data/GAOKAO-Bench-main/Data/Objective_Questions/2012-2022_English_Cloze_Test.json")

    imported = 0

    for gaokao_file in [obj_file, cloze_file]:
        if not gaokao_file.exists():
            print(f"文件不存在: {gaokao_file}")
            continue

        print(f"处理: {gaokao_file.name}")

        try:
            with open(gaokao_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if not isinstance(data, list):
                print(f"  数据格式不对")
                continue

            for idx, item in enumerate(data):
                try:
                    year = item.get("year", "")
                    category = item.get("category", "")
                    question = item.get("question", "")
                    answers = item.get("answer", [])
                    analysis = item.get("analysis", "")

                    if not question or len(question) < 50:
                        continue

                    # 提取文章内容（去掉选项部分）
                    # 问题通常以选项A B C D结尾
                    content = question

                    # 添加答案
                    if answers:
                        content += "\n\n### 答案\n"
                        for i, ans in enumerate(answers, 1):
                            content += f"{i}. {ans}\n"

                    # 添加解析
                    if analysis:
                        content += f"\n### 解析\n{analysis}\n"

                    # 生成摘要
                    summary = question[:150].replace('"', '\\"') + "..."

                    filename = f"gaokao-{year}-{idx}.md"
                    filepath = DATA_DIR / filename

                    frontmatter = f'''---
title: "高考英语 - {year} {category}"
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

                except Exception as e:
                    continue

        except Exception as e:
            print(f"  失败: {e}")
            continue

    print(f"GAOKAO完成: {imported} 篇")
    return imported

if __name__ == '__main__':
    print("="*50)
    import_gaokao()
    print("="*50)
