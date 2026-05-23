#!/usr/bin/env python3
"""
导入CET四六级数据
"""

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
        start = content.find('const questionBank = ')
        end = content.rfind('};') + 2

        if start < 0 or end < 0:
            print("无法找到CET数据")
            return 0

        json_str = content[start + len('const questionBank = '):end]

        # 处理JS模板字符串（反引号） - 转换为普通字符串
        # 简单的处理方式：移除反引号
        json_str = json_str.replace('`', '"')

        # 解析（会有一些语法错误，但我们可以手动解析）
        imported = 0

        # 按set解析
        set_pattern = r'set(\d+):\s*\{'
        sets = re.findall(set_pattern, json_str)

        for set_num in sets[:10]:  # 只处理前10个set
            set_match = re.search(rf'set{set_num}:\s*\{{([^}}]+)\}}', json_str)
            if not set_match:
                continue

            set_content = set_match.group(1)

            # 找题型
            for qtype in ['wordFilling', 'clozeTest', 'readingComprehension']:
                if qtype in set_content:
                    # 提取 passage
                    passage_match = re.search(rf'{qtype}}:\s*\{{[^}}]*passage:\s*"([^"]+)"', set_content)
                    if passage_match:
                        passage = passage_match.group(1)

                        title = f"CET四级-set{set_num}-{qtype}"

                        content_md = f"# {title}\n\n## Passage\n{passage}\n\n"

                        # 提取选项或答案
                        options_match = re.findall(r'\{([^}]+)\}', set_content)
                        if options_match:
                            content_md += "## Options\n"
                            for opt in options_match[:10]:
                                content_md += f"- {opt}\n"

                        summary = passage[:150] + "..."

                        filename = f"cet4-{sanitize_filename(title)}.md"
                        filepath = DATA_DIR / filename

                        frontmatter = f'''---
title: "{title}"
category: "四六级"
difficulty: "600"
summary: "{summary}"
source: "CET4 Practice Tool"
---

{content_md}
'''

                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(frontmatter)

                        imported += 1
                        print(f"  导入: {title[:50]}")

        print(f"CET完成: {imported} 篇")
        return imported

    except Exception as e:
        print(f"CET导入失败: {e}")
        return 0

if __name__ == '__main__':
    print("="*50)
    import_cet()
    print("="*50)
