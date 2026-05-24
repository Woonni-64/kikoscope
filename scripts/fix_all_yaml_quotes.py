#!/usr/bin/env python3
"""
修复YAML格式错误 - 转义summary中的引号
"""

from pathlib import Path
import re

def fix_yaml_quotes():
    """修复所有摘要中的引号问题"""
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

            # 检查并修复summary中的引号
            if 'summary' in frontmatter:
                summary = frontmatter['summary']
                # 如果summary中有双引号，需要转义
                if '"' in summary:
                    summary = summary.replace('"', '\\"')
                    frontmatter['summary'] = summary

                    # 重新构建文件
                    output = ['---']
                    for k, v in frontmatter.items():
                        # 如果value包含特殊字符，重新包装引号
                        if '\\' in v or '"' in v:
                            output.append(f'{k}: "{v}"')
                        else:
                            output.append(f'{k}: "{v}"')
                    output.append('---')
                    output.append(body)

                    with open(file, 'w', encoding='utf-8') as f:
                        f.write('\n'.join(output))

                    fixed += 1
                    if fixed <= 10:
                        print(f"修复: {file.name}")
                        print(f"  摘要: {summary[:50]}...")

        except Exception as e:
            pass

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n修复完成!")
    print(f"共修复: {fixed} 篇文章")

if __name__ == '__main__':
    fix_yaml_quotes()
