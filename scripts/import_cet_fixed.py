#!/usr/bin/env python3
"""
导入CET四六级数据
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

def import_cet():
    """导入CET四六级数据"""
    print("导入CET...")

    cet_file = Path("data/cet4-practice-tool-main/data/questions.js")
    if not cet_file.exists():
        print("CET文件不存在")
        return 0

    try:
        with open(cet_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取JSON部分
        match = re.search(r'const questionBank = (\{.*\});?\s*$', content, re.DOTALL)
        if not match:
            print("无法解析CET文件格式")
            return 0

        json_str = match.group(1)
        data = json.loads(json_str)

        imported = 0
        for set_name, set_data in data.items():
            for q_type, q_info in set_data.items():
                try:
                    passage = q_info.get("passage", "")
                    word_bank = q_info.get("wordBank", [])
                    blanks = q_info.get("blanks", [])
                    sentences = q_info.get("sentences", [])
                    options = q_info.get("options", [])

                    if not passage:
                        continue

                    title = f"CET四级-{set_name}-{q_type}"

                    content = f"# {title}\n\n"
                    content += f"## Passage\n{passage}\n\n"

                    if word_bank:
                        content += "## Word Bank\n"
                        content += ", ".join(word_bank) + "\n\n"

                    if blanks:
                        content += "## Answers\n"
                        for b in blanks:
                            pos = b.get('position', '')
                            ans = b.get('answer', '')
                            content += f"- Position {pos}: {ans}\n"
                        content += "\n"

                    if sentences:
                        content += "## Sentences\n"
                        for s in sentences:
                            text = s.get('text', '')
                            ans = s.get('answer', '')
                            content += f"- {text} -> {ans}\n"
                        content += "\n"

                    if options:
                        content += "## Options\n"
                        for opt in options:
                            text = opt.get('text', '')
                            ans = opt.get('answer', '')
                            content += f"- {text} -> {ans}\n"
                        content += "\n"

                    summary = passage[:150].replace('"', '\\"') + "..."

                    filename = f"cet4-{sanitize_filename(title)}.md"
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
                    if imported <= 10:
                        print(f"  导入: {title[:50]}")

                except Exception as e:
                    continue

        print(f"CET完成: {imported} 篇")
        return imported

    except Exception as e:
        print(f"CET导入失败: {e}")
        return 0

if __name__ == '__main__':
    print("="*50)
    import_cet()
    print("="*50)
