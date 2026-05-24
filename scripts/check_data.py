#!/usr/bin/env python3
"""检查原始数据中的文章内容"""

from pathlib import Path

cet_file = Path("data/cet4-practice-tool-main/data/questions.js")
with open(cet_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 找到 set1 的 readingComprehension
set1_start = content.find('set1:')
set2_start = content.find('set2:')
set1_content = content[set1_start:set2_start]

# 找到第一个 article
article_start = set1_content.find('article:')
print("=== article: 后面的内容 ===")
print(set1_content[article_start:article_start + 5000])
