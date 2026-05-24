#!/usr/bin/env python3
"""
修复文件名中的空格问题
"""

from pathlib import Path
import re

def fix_filenames():
    """修复文件名中的空格"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    fixed = 0

    for file in md_files:
        filename = file.name

        # 检查是否需要修复（开头有空格）
        if filename.startswith('clear- ') or filename.startswith('race- '):
            # 去掉开头的空格
            new_filename = re.sub(r'^(clear|race)-\s+', r'\1-', filename)
            new_path = file.parent / new_filename

            print(f"重命名: {filename} -> {new_filename}")
            file.rename(new_path)
            fixed += 1

    print(f"\n修复完成!")
    print(f"共修复: {fixed} 个文件")

if __name__ == '__main__':
    fix_filenames()
