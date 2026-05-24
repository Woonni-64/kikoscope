#!/usr/bin/env python3
"""
处理文章摘要 - 没有正文就留空
"""

from pathlib import Path
import re

def extract_first_sentence(text):
    """提取第一句话"""
    if not text:
        return None

    text = text.strip()
    if len(text) < 20:
        return None

    match = re.search(r'^[^.!?]+[.!?](?:\s|$)', text)
    if match:
        sentence = match.group(0).strip()
        if len(sentence) > 100:
            sentence = sentence[:100].rsplit(' ', 1)[0] + '...'
        return sentence

    if len(text) > 100:
        return text[:100].rsplit(' ', 1)[0] + '...'
    return text

def process_articles():
    """处理所有文章"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    updated = 0
    empty_summary = 0

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            parts = content.split('---')
            if len(parts) < 3:
                continue

            frontmatter_str = parts[1]
            body = '---'.join(parts[2:]).strip()

            frontmatter = {}
            for line in frontmatter_str.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    frontmatter[key] = value

            summary = extract_first_sentence(body)

            # 如果没有正文，摘要留空（不生成"关于xxx的文章"）
            frontmatter['summary'] = summary if summary else ""

            output = ['---']
            for k, v in frontmatter.items():
                output.append(f'{k}: "{v}"')
            output.append('---')
            if body:
                output.append(body)

            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))

            updated += 1
            if not summary:
                empty_summary += 1

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n处理完成!")
    print(f"共更新: {updated} 篇文章")
    print(f"其中摘要为空: {empty_summary} 篇")

if __name__ == '__main__':
    process_articles()
