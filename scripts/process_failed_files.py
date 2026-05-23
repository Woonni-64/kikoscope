#!/usr/bin/env python3
"""
处理失败文件的脚本
"""

import json
import os
from pathlib import Path

def process_failed_file(file_path: str, output_dir: str):
    """处理单个失败的文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read().strip()

    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSON解析失败: {file_path}, 错误: {e}")
        return None

    article = data.get('article', '')
    questions = data.get('questions', [])
    options = data.get('options', [])
    answers = data.get('answers', [])

    if not article:
        print(f"文章内容为空: {file_path}")
        return None

    # 确定难度
    difficulty = 'RACE-High'
    category = 'RACE/高考'
    dataset = 'train'

    # 生成slug
    title_words = article.split()[:8]
    title = ' '.join(title_words)
    import re
    title = re.sub(r'[^\w\s-]', '', title)
    title = title.lower().replace(' ', '-')
    title = title[:40] if len(title) > 40 else title
    slug = f"race-{dataset}-{title}-failed"

    # 生成Markdown
    markdown = f'''---
title: "{slug.replace('-', ' ').title()}"
category: "{category}"
difficulty: "{difficulty}"
date: "2024-01-01"
summary: "RACE {dataset} dataset article"
---

{article}
'''

    # 保存文件
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    md_file = output_path / f"{slug}.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(markdown)

    print(f"成功转换文章: {slug}.md")
    print(f"题目数量: {len(questions)}")
    print(f"文章长度: {len(article)} 字符")

    return {
        'slug': slug,
        'questions_count': len(questions),
        'article_length': len(article)
    }

if __name__ == '__main__':
    # 处理两个失败的文件
    files = [
        'data/RACE/train/high/15946.txt',
        'data/RACE/train/high/16528.txt'
    ]

    output_dir = 'articles'

    for file_path in files:
        print(f"\n处理文件: {file_path}")
        result = process_failed_file(file_path, output_dir)
        if result:
            print(f"✓ 成功: {result['slug']}")
        else:
            print(f"✗ 失败")
        print("-" * 50)