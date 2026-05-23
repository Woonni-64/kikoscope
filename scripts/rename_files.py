#!/usr/bin/env python3
"""
修改文件名：将数字ID改成race或clear
"""

from pathlib import Path

articles_path = Path('articles')
md_files = list(articles_path.glob('*.md'))

print(f"总文件数: {len(md_files)}")

updated = 0

for idx, file in enumerate(md_files):
    try:
        filename = file.name

        # 只处理race和clear文件
        if not (filename.startswith('race-') or filename.startswith('clear-')):
            continue

        # 检查文件名是否包含数字
        if '-test-' in filename or '-train-' in filename or '-dev-' in filename:
            # RACE文件格式: race-train-标题-数字.md -> race-train-标题.md
            # 或 race-test-标题-数字.md -> race-test-标题.md
            import re
            # 匹配 race-(train|test|dev)-标题-数字.md
            pattern = r'^(race)-(train|test|dev)-(.+?)-\d+\.md$'
            match = re.match(pattern, filename)
            if match:
                new_filename = f"{match.group(1)}-{match.group(2)}-{match.group(3)}.md"
                new_path = file.parent / new_filename
                file.rename(new_path)
                updated += 1
                if updated <= 10:
                    print(f"重命名: {filename} -> {new_filename}")
        elif filename.startswith('clear-'):
            # CLEAR文件格式: clear-标题-数字.md -> clear-标题.md
            import re
            # 匹配 clear-标题-数字.md
            pattern = r'^(clear)-(.+?)-\d+\.md$'
            match = re.match(pattern, filename)
            if match:
                new_filename = f"{match.group(1)}-{match.group(2)}.md"
                new_path = file.parent / new_filename
                file.rename(new_path)
                updated += 1
                if updated <= 10:
                    print(f"重命名: {filename} -> {new_filename}")

    except Exception as e:
        print(f"错误: {file.name} - {str(e)}")

    if (idx + 1) % 5000 == 0:
        print(f"进度: {idx + 1}/{len(md_files)}")

print(f"\n重命名完成!")
print(f"共重命名: {updated} 篇文章")
