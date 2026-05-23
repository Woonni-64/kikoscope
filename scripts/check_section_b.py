#!/usr/bin/env python3
"""检查 Section B 的内容"""

import re

with open('data/english-exem-md/CET4/2023.12/cet4-2023-12-1.md', 'r', encoding='utf-8') as f:
    content = f.read()

section_b_match = re.search(r'### Section B\n\n(.*?)(?=\n\n### Section C)', content, re.DOTALL)
if section_b_match:
    section_content = section_b_match.group(1).strip()
    print("=== Section B 内容 ===")
    print(section_content[:500])
    print("\n=== 问题部分 ===")
    print(section_content[-500:])
