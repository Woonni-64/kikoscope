#!/usr/bin/env python3
"""
使用yaml库正确修复YAML格式
"""

import yaml
from pathlib import Path
import re

def clean_text(text):
    """清理文本"""
    if not text:
        return ""

    # 替换换行符和其他空白
    text = re.sub(r'[\n\r\t]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def process_articles():
    """处理所有文章"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    fixed = 0
    errors = 0

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            parts = content.split('---')
            if len(parts) < 3:
                continue

            frontmatter_str = parts[1]
            body = '---'.join(parts[2:])

            # 尝试解析frontmatter
            try:
                frontmatter = yaml.safe_load('---\n' + frontmatter_str + '\n---')
                if not isinstance(frontmatter, dict):
                    frontmatter = {}
            except:
                # 如果解析失败，手动解析
                frontmatter = {}
                for line in frontmatter_str.strip().split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        key = key.strip()
                        value = value.strip().strip('"').strip("'")
                        frontmatter[key] = value

            # 清理summary
            if 'summary' in frontmatter:
                frontmatter['summary'] = clean_text(str(frontmatter['summary']))

            # 重新构建文件
            output = ['---']
            for k, v in frontmatter.items():
                output.append(f'{k}: "{v}"')
            output.append('---')
            output.append(body)

            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))

            fixed += 1

        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"错误: {file.name} - {str(e)[:100]}")

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n修复完成!")
    print(f"共处理: {fixed} 篇文章")
    print(f"错误: {errors} 篇")

if __name__ == '__main__':
    process_articles()
