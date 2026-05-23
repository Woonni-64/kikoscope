#!/usr/bin/env python3
"""
彻底修复所有YAML格式问题
"""

from pathlib import Path
import re

def fix_file(content):
    """修复单个文件"""
    parts = content.split('---')
    if len(parts) < 3:
        return content

    frontmatter_str = parts[1]
    body = '---'.join(parts[2:])

    # 解析frontmatter - 只保留需要的字段
    frontmatter = {}
    for line in frontmatter_str.strip().split('\n'):
        if ':' in line:
            # 找到第一个冒号
            idx = line.index(':')
            key = line[:idx].strip()
            value = line[idx+1:].strip()

            # 去掉首尾引号
            if value.startswith('"') and value.endswith('"'):
                value = value[1:-1]
            elif value.startswith('"'):
                value = value[1:]

            # 清理值中的特殊字符
            value = re.sub(r'[\n\r\t]+', ' ', value)
            value = re.sub(r'\s+', ' ', value)

            frontmatter[key] = value

    # 重新构建frontmatter
    output = ['---']
    for k, v in frontmatter.items():
        # 转义双引号
        safe_v = v.replace('"', '\\"')
        output.append(f'{k}: "{safe_v}"')
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

            # 检查是否需要修复
            if '"YOUR' in content or '"Your' in content or '\nsummary:' in content or 'summary: "' not in content:
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
