#!/usr/bin/env python3
"""
处理日期：RACE真题保留日期，非真题删除日期
"""

from pathlib import Path

articles_path = Path('articles')
md_files = list(articles_path.glob('*.md'))

print(f"总文件数: {len(md_files)}")

updated = 0

for idx, file in enumerate(md_files):
    try:
        filename = file.name

        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 判断是否是RACE真题
        is_race = filename.startswith('race-')
        is_clear = filename.startswith('clear-')

        if not (is_race or is_clear):
            continue  # 跳过原有文章

        # 找到frontmatter和body
        parts = content.split('---')
        if len(parts) >= 3:
            frontmatter_str = parts[1]
            body_str = '---'.join(parts[2:])

            # 解析frontmatter
            frontmatter = {}
            for line in frontmatter_str.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    frontmatter[key] = value

            # RACE真题保留日期，非真题删除日期
            if is_race:
                # 确保有日期
                if 'date' not in frontmatter or not frontmatter['date']:
                    frontmatter['date'] = '2024-01-01'
            elif is_clear:
                # 删除日期
                if 'date' in frontmatter:
                    del frontmatter['date']

            # 重新构建
            output = ['---']
            for k, v in frontmatter.items():
                output.append(f'{k}: "{v}"')
            output.append('---')

            # 添加body
            body_lines = body_str.strip().split('\n')
            for line in body_lines:
                if line.strip():
                    output.append(line)

            # 写回
            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))

            updated += 1

    except Exception as e:
        print(f"错误: {file.name} - {str(e)}")

    if (idx + 1) % 5000 == 0:
        print(f"进度: {idx + 1}/{len(md_files)}")

print(f"\n处理完成!")
print(f"共处理: {updated} 篇文章")
