#!/usr/bin/env python3
"""
彻底修复YAML格式 - 处理所有特殊字符
"""

from pathlib import Path
import re

def sanitize_yaml_string(text):
    """清理文本，确保符合YAML字符串格式"""
    if not text:
        return ""

    # 替换换行符为单个空格
    text = re.sub(r'[\n\r\t]+', ' ', text)
    # 替换多个空格为单个
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    # 转义双引号
    text = text.replace('"', '\\"')

    # 如果包含冒号、井号等YAML敏感字符，用双引号包裹
    needs_quotes = any(c in text for c in [':', '#', '&', '*', '!', '|', '>', "'", '%', '@', '`'])

    if needs_quotes:
        # 确保转义后的文本用双引号包裹
        return f'"{text}"'
    else:
        return f'"{text}"'

def process_articles():
    """处理所有文章"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    fixed = 0

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            parts = content.split('---')
            if len(parts) < 3:
                continue

            frontmatter_str = parts[1]
            body = '---'.join(parts[2:])

            # 解析frontmatter
            frontmatter = {}
            for line in frontmatter_str.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip()
                    # 去掉引号
                    if value.startswith('"') and value.endswith('"'):
                        value = value[1:-1]
                    elif value.startswith('"'):
                        value = value[1:]
                    frontmatter[key] = value

            # 重新构建frontmatter，确保所有值都被正确转义
            output = ['---']
            for k, v in frontmatter.items():
                output.append(f'{k}: {sanitize_yaml_string(v)}')
            output.append('---')
            output.append(body)

            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))

            fixed += 1

        except Exception as e:
            pass

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n修复完成!")
    print(f"共处理: {fixed} 篇文章")

if __name__ == '__main__':
    process_articles()
