#!/usr/bin/env python3
"""检查阅读 Section B"""

import re

with open('data/english-exem-md/CET4/2023.12/cet4-2023-12-1.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 找 Part III / Reading Comprehension
reading_match = re.search(r'## Part III / Reading Comprehension.*?### Section B\n\n(.*?)(?=\n\n### Section C)', content, re.DOTALL)
if reading_match:
    section_content = reading_match.group(1).strip()
    print("=== 阅读 Section B ===")
    print(section_content[:800])
    print("\n\n=== 末尾 ===")
    print(section_content[-800:])
