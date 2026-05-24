#!/usr/bin/env python3
"""
强制重新处理所有文章的摘要
"""

from pathlib import Path
import re

def extract_first_sentence(text):
    """提取第一句话"""
    if not text:
        return None

    # 清理文本
    text = text.strip()
    if len(text) < 10:
        return None

    # 查找第一个完整的句子
    match = re.search(r'^[^.!?]+[.!?](?:\s|$)', text)
    if match:
        sentence = match.group(0).strip()
        if len(sentence) > 100:
            sentence = sentence[:100].rsplit(' ', 1)[0] + '...'
        return sentence

    # 如果没有找到完整句子
    if len(text) > 100:
        return text[:100].rsplit(' ', 1)[0] + '...'
    return text

def process_all_articles():
    """处理所有文章"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    updated = 0

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 提取frontmatter和body
            parts = content.split('---')
            if len(parts) < 3:
                continue

            frontmatter_str = parts[1]
            body = '---'.join(parts[2:]).strip()

            # 解析frontmatter
            frontmatter = {}
            for line in frontmatter_str.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    frontmatter[key] = value

            title = frontmatter.get('title', '')

            # 尝试提取第一句话
            summary = extract_first_sentence(body)

            # 如果没有正文，从标题生成
            if not summary:
                # 清理标题作为摘要
                clean_title = re.sub(r'^(RACE|CLEAR|真题)\s*', '', title, flags=re.IGNORECASE)
                clean_title = re.sub(r'[-_]', ' ', clean_title)
                clean_title = ' '.join(clean_title.split())
                summary = f"关于{clean_title}的文章" if clean_title else "暂无摘要"

            # 确保首字母大写
            if summary and summary[0].islower():
                summary = summary[0].upper() + summary[1:]

            # 更新frontmatter中的summary
            frontmatter['summary'] = summary

            # 重新构建文件
            output = ['---']
            for k, v in frontmatter.items():
                output.append(f'{k}: "{v}"')
            output.append('---')
            if body:
                output.append(body)

            # 写回
            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))

            updated += 1

            if updated <= 10:
                print(f"更新: {title[:40]}...")
                print(f"  摘要: {summary[:60]}...")

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n处理完成!")
    print(f"共更新: {updated} 篇文章")

if __name__ == '__main__':
    process_all_articles()
