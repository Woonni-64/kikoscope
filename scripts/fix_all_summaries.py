#!/usr/bin/env python3
"""
重新处理CLEAR文章：用文章第一句话作为摘要
"""

from pathlib import Path
import re

def extract_first_sentence(text):
    """提取第一句话"""
    if not text or len(text.strip()) < 10:
        return None

    # 清理文本
    text = text.strip()

    # 查找第一个完整的句子
    # 匹配 . ! ? 后跟空格或字符串结束
    match = re.search(r'^[^.!?]+[.!?](?:\s|$)', text)
    if match:
        sentence = match.group(0).strip()
        # 如果太长，截取前100个字符
        if len(sentence) > 100:
            sentence = sentence[:100].rsplit(' ', 1)[0] + '...'
        return sentence

    # 如果没有找到完整句子，取前100个字符
    if len(text) > 100:
        return text[:100].rsplit(' ', 1)[0] + '...'
    return text if text else None

def fix_clear_summaries():
    """重新处理所有文章的摘要"""
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

            # 检查body是否有实质内容
            body_text = re.sub(r'\s+', ' ', body)  # 合并空白字符
            if len(body_text) < 20:
                continue  # 内容太少，跳过

            # 解析frontmatter
            frontmatter = {}
            for line in frontmatter_str.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    frontmatter[key] = value

            # 提取第一句话
            summary = extract_first_sentence(body_text)

            if not summary:
                continue

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
            output.append(body)

            # 写回
            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))

            updated += 1

            if updated <= 10:
                print(f"更新摘要: {summary[:60]}...")

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n处理完成!")
    print(f"共更新: {updated} 篇文章")

if __name__ == '__main__':
    fix_clear_summaries()
