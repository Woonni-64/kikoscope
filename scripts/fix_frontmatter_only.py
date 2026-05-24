#!/usr/bin/env python3
"""
修复frontmatter - 只保留正确的字段，删除错误解析的内容
"""

from pathlib import Path
import re

VALID_FIELDS = {'title', 'category', 'difficulty', 'date', 'summary', 'source', 'author'}

def fix_file(content):
    """修复单个文件"""
    parts = content.split('---')
    if len(parts) < 3:
        return content

    frontmatter_str = parts[1]
    body = '---'.join(parts[2:])

    # 解析frontmatter - 只保留有效字段
    frontmatter = {}
    for line in frontmatter_str.strip().split('\n'):
        if ':' in line:
            idx = line.index(':')
            key = line[:idx].strip()
            value = line[idx+1:].strip()

            # 只保留有效字段
            if key in VALID_FIELDS:
                # 去掉首尾引号
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith('"'):
                    value = value[1:]

                # 清理值中的特殊字符
                value = re.sub(r'[\n\r\t]+', ' ', value)
                value = re.sub(r'\s+', ' ', value)
                value = value.replace('"', '\\"')

                frontmatter[key] = value

    # 重新构建frontmatter
    output = ['---']
    for k, v in frontmatter.items():
        output.append(f'{k}: "{v}"')
    output.append('---')
    output.append(body)

    return '\n'.join(output)

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

            # 检查是否需要修复（有额外字段）
            parts = content.split('---')
            if len(parts) >= 2:
                frontmatter_str = parts[1]
                # 检查是否有非有效字段
                needs_fix = False
                for line in frontmatter_str.strip().split('\n'):
                    if ':' in line:
                        idx = line.index(':')
                        key = line[:idx].strip()
                        if key not in VALID_FIELDS:
                            needs_fix = True
                            break

                if needs_fix:
                    new_content = fix_file(content)
                    with open(file, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    fixed += 1

        except Exception as e:
            pass

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n修复完成!")
    print(f"共修复: {fixed} 篇文章")

if __name__ == '__main__':
    process_articles()
