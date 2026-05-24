#!/usr/bin/env python3
"""
调试CET解析
"""

import re
from pathlib import Path

cet_file = Path("data/cet4-practice-tool-main/data/questions.js")
with open(cet_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 找到set1
set1_start = content.find('set1:')
set1_end = content.find('set2:')
set1_content = content[set1_start:set1_end]

# 找到readingComprehension
rc_start = set1_content.find('readingComprehension:')
rc_content = set1_content[rc_start:]

print("=== Reading Comprehension 部分 ===")
print(rc_content[:3000])

print("\n\n=== 尝试匹配 questions ===")
q_arr_match = re.search(r'questions:\s*\[(.*?)\]', rc_content, re.DOTALL)
if q_arr_match:
    q_arr_text = q_arr_match.group(1)
    print("找到 questions 数组:")
    print(q_arr_text[:2000])
    
    # 查找 question 字段
    print("\n\n=== 查找所有 question: ===")
    q_text_matches = re.findall(r'question:\s*"([^"]+)"', q_arr_text)
    print(f"找到 {len(q_text_matches)} 个 question")
    for i, q in enumerate(q_text_matches):
        print(f"{i+1}. {q}")
