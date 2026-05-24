#!/usr/bin/env python3
"""检查 CET6 2023.06 Section B"""

import re

with open('data/english-exem-md/CET6/2023.06/cet6-2023-06-2.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 找 Part III
reading_match = re.search(r'## Part III / Reading Comprehension.*?(?=## Part IV)', content, re.DOTALL)
if reading_match:
    reading_content = reading_match.group(0)
    
    # 找 Section B
    section_b_match = re.search(r'### Section B\n\n(.*?)(?=### Section C)', reading_content, re.DOTALL)
    if section_b_match:
        section_content = section_b_match.group(1).strip()
        print("=== CET6 2023.06 Section B 字符数 ===")
        print(len(section_content))
        print("\n=== 内容前500字符 ===")
        print(section_content[:500])
