#!/usr/bin/env python3
"""分析articles目录中的文章分类"""

from pathlib import Path
from collections import Counter

def analyze_articles():
    articles_dir = Path('articles')
    md_files = list(articles_dir.glob('*.md'))

    print(f"总文章数: {len(md_files)}")

    # 分析RACE分类
    race_categories = Counter()
    race_difficulties = Counter()

    # 分析CLEAR分类
    clear_categories = Counter()

    for file in md_files:
        if file.name.startswith('race-'):
            # 读取frontmatter
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                for line in content.split('\n'):
                    if line.startswith('category:'):
                        cat = line.split(':', 1)[1].strip().replace('"', '')
                        race_categories[cat] += 1
                    elif line.startswith('difficulty:'):
                        diff = line.split(':', 1)[1].strip().replace('"', '')
                        race_difficulties[diff] += 1

        elif file.name.startswith('clear-'):
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                for line in content.split('\n'):
                    if line.startswith('category:'):
                        cat = line.split(':', 1)[1].strip().replace('"', '')
                        clear_categories[cat] += 1

    print("\n=== RACE数据集分类 ===")
    print(f"总文章数: {sum(race_categories.values())}")
    print("\n按类别:")
    for cat, count in race_categories.most_common(10):
        print(f"  {cat}: {count}")

    print("\n按难度:")
    for diff, count in race_difficulties.most_common():
        print(f"  {diff}: {count}")

    print("\n=== CLEAR数据集分类 ===")
    print(f"总文章数: {sum(clear_categories.values())}")
    for cat, count in clear_categories.most_common():
        print(f"  {cat}: {count}")

if __name__ == '__main__':
    analyze_articles()
