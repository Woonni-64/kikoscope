#!/usr/bin/env python3
"""
重新分类：只保留内容分类，去除RACE/CLEAR前缀
"""

from pathlib import Path

articles_path = Path('articles')
md_files = list(articles_path.glob('*.md'))

print(f"总文件数: {len(md_files)}")

updated = 0
category_stats = {}

for idx, file in enumerate(md_files):
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')
        new_lines = []
        changed = False

        for line in lines:
            if line.startswith('category:'):
                # 提取当前分类
                parts = line.split(':', 1)
                current_cat = parts[1].strip().replace('"', '')

                # 只保留内容分类，去除前缀
                if '/' in current_cat:
                    sub_cat = current_cat.split('/')[-1]
                    new_cat = f'category: "{sub_cat}"'
                    new_lines.append(new_cat)
                    changed = True

                    # 更新统计
                    if sub_cat not in category_stats:
                        category_stats[sub_cat] = 0
                    category_stats[sub_cat] += 1
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)

        if changed:
            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))
            updated += 1

    except Exception as e:
        print(f"错误: {file.name} - {str(e)}")

    if (idx + 1) % 5000 == 0:
        print(f"进度: {idx + 1}/{len(md_files)}")

print(f"\n更新完成!")
print(f"共更新: {updated} 篇文章")

print("\n分类统计:")
for cat, count in sorted(category_stats.items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count}")
