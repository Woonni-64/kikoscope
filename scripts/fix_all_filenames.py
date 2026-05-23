#!/usr/bin/env python3
"""
修复文件名中的空格问题（修复所有空格）
"""

from pathlib import Path
import re

def fix_filenames():
    """修复文件名中的所有空格问题"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    fixed = 0

    for file in md_files:
        filename = file.name

        # 检查是否需要修复
        new_filename = filename

        # 去掉开头的空格
        new_filename = re.sub(r'^(clear|race)-\s+', r'\1-', new_filename)

        # 去掉结尾的空格
        new_filename = re.sub(r'\s+\.md$', '.md', new_filename)

        if new_filename != filename:
            new_path = file.parent / new_filename
            print(f"重命名: {filename} -> {new_filename}")
            file.rename(new_path)
            fixed += 1

    print(f"\n修复完成!")
    print(f"共修复: {fixed} 个文件")

if __name__ == '__main__':
    fix_filenames()
