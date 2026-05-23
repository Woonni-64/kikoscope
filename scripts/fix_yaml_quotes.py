#!/usr/bin/env python3
"""
修复YAML格式错误 - 转义summary中的特殊字符
"""

from pathlib import Path
import re

def fix_yaml_format():
    """修复YAML格式"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    fixed = 0
    error_count = 0

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 检查是否需要修复（含有问题的summary）
            if '"YOUR' in content or '"Your' in content or "summary:" not in content:
                # 重新构建文件
                parts = content.split('---')
                if len(parts) < 3:
                    continue

                frontmatter_str = parts[1]
                body = '---'.join(parts[2:])

                # 解析frontmatter
                frontmatter = {}
                for line in frontmatter_str.strip().split('\n'):
                    if ':' in line:
                        # 处理含有引号的行
                        if line.startswith('summary:'):
                            # 提取key和value
                            key = 'summary'
                            # 找到冒号后的所有内容作为value
                            value_part = line[len('summary:'):].strip()
                            # 去掉首尾引号
                            if value_part.startswith('"') and value_part.endswith('"'):
                                value_part = value_part[1:-1]
                            elif value_part.startswith('"'):
                                value_part = value_part[1:]

                            # 转义内部的双引号
                            value_part = value_part.replace('"', '\\"')
                            # 重新包装引号
                            value = f'"{value_part}"'
                            frontmatter[key] = value
                        else:
                            key, value = line.split(':', 1)
                            key = key.strip()
                            value = value.strip().strip('"').strip("'")
                            frontmatter[key] = value

                # 重新构建文件
                output = ['---']
                for k, v in frontmatter.items():
                    output.append(f'{k}: "{v}"')
                output.append('---')
                output.append(body)

                # 写回
                with open(file, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(output))

                fixed += 1
                if fixed <= 5:
                    print(f"修复: {file.name}")

        except Exception as e:
            error_count += 1

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n修复完成!")
    print(f"共修复: {fixed} 篇文章")
    print(f"错误: {error_count} 篇")

if __name__ == '__main__':
    fix_yaml_format()
