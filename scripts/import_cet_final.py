#!/usr/bin/env python3
"""
导入CET四六级数据 - 只导入完整阅读理解文章，不带题目
"""

import re
from pathlib import Path

DATA_DIR = Path("articles")
DATA_DIR.mkdir(exist_ok=True)

def escape_yaml_string(s):
    s = s.replace('"', '\\"')
    s = s.replace('\n', ' ')
    return s

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

        imported = 0

        # 提取所有set
        set_pattern = r'set(\d+):\s*\{'
        sets = re.findall(set_pattern, content)
        print(f"找到 {len(sets)} 套题")

        for set_num in sets:
            print(f"\n处理 Set {set_num}...")
            
            # 提取该set的完整内容
            start_marker = f'set{set_num}:'
            start_idx = content.find(start_marker)
            if start_idx < 0:
                continue
                
            next_set_num = int(set_num) + 1
            end_marker = f'set{next_set_num}:'
            end_idx = content.find(end_marker, start_idx)
            if end_idx < 0:
                end_idx = len(content)
            
            set_content = content[start_idx:end_idx]

            # === 只处理 readingComprehension (阅读理解) ===
            rc_start = set_content.find('readingComprehension:')
            if rc_start >= 0:
                rc_content = set_content[rc_start:]
                
                # 找到所有 article: "..." 的部分
                # 使用非贪婪匹配，找到 article: 后面跟着的双引号字符串
                article_matches = []
                i = 0
                while True:
                    article_start = rc_content.find('article:', i)
                    if article_start < 0:
                        break
                    
                    # 找到 article: 后面的 "
                    quote_start = rc_content.find('"', article_start)
                    if quote_start < 0:
                        i = article_start + 1
                        continue
                    
                    # 找到配对的 "
                    # 从 quote_start + 1 开始，找到下一个 " 后面跟着 , 或 }
                    quote_end = -1
                    j = quote_start + 1
                    while j < len(rc_content):
                        if rc_content[j] == '"':
                            # 检查后面的字符
                            k = j + 1
                            while k < len(rc_content) and rc_content[k].isspace():
                                k += 1
                            if k < len(rc_content) and rc_content[k] in ',}':
                                quote_end = j
                                break
                        j += 1
                    
                    if quote_end > quote_start:
                        article_text = rc_content[quote_start + 1:quote_end]
                        article_matches.append(article_text)
                        i = quote_end + 1
                    else:
                        i = quote_start + 1
                
                rc_idx = 1
                for article in article_matches:
                    title = f"CET四级-Set{set_num}-阅读理解{rc_idx}"
                    summary = article[:200].replace('\n', ' ').strip()
                    if len(summary) == 200:
                        summary += "..."
                    
                    content_md = f"# {title}\n\n{article}"
                    
                    filename = f"cet4-set{set_num}-reading-{rc_idx}.md"
                    filepath = DATA_DIR / filename
                    
                    frontmatter = f'''---
title: "{escape_yaml_string(title)}"
category: "四六级"
difficulty: "600"
summary: "{escape_yaml_string(summary)}"
source: "CET4"
---

{content_md}
'''
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(frontmatter)
                    imported += 1
                    print(f"  ✓ 阅读理解{rc_idx}: {title} (文章长度: {len(article)} 字符)")
                    rc_idx += 1

        print(f"\nCET完成: 共导入 {imported} 篇")
        return imported

    except Exception as e:
        print(f"CET导入失败: {e}")
        import traceback
        traceback.print_exc()
        return 0

if __name__ == '__main__':
    print("="*50)
    import_cet()
    print("="*50)
