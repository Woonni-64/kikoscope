#!/usr/bin/env python3
"""检查真题文件中的问题格式"""

import re

with open('data/english-exem-md/CET4/2023.12/cet4-2023-12-1.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 找 Part III / Reading Comprehension
reading_match = re.search(r'## Part III / Reading Comprehension.*?(?=## Part IV)', content, re.DOTALL)
if reading_match:
    reading_content = reading_match.group(0)
    
    # 打印 Section C 部分
    section_c_match = re.search(r'### Section C.*?(?=## Part IV)', reading_content, re.DOTALL)
    if section_c_match:
        print("=== Section C 内容 ===")
        print(section_c_match.group(0)[:3000])
