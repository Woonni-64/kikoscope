#!/usr/bin/env python3
"""
完整修复YAML格式 - 处理摘要中的换行符和特殊字符
"""

from pathlib import Path
import re

def clean_text(text):
    """清理文本中的特殊字符"""
    if not text:
        return text

    # 替换换行符和多余空白
    text = re.sub(r'\s+', ' ', text)
    # 转义双引号
    text = text.replace('"', '\\"')
    return text

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

            # 清理summary
            if 'summary' in frontmatter:
                frontmatter['summary'] = clean_text(frontmatter['summary'])

            # 重新构建文件
            output = ['---']
            for k, v in frontmatter.items():
                # 转义并包装引号
                safe_v = v.replace('"', '\\"')
                output.append(f'{k}: "{safe_v}"')
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
