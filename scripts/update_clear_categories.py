#!/usr/bin/env python3
"""
更新CLEAR-Corpus文章的frontmatter，添加详细的分类信息
"""

import pandas as pd
import re
from pathlib import Path

def update_clear_frontmatter():
    """更新CLEAR文章的frontmatter"""
    # 加载CLEAR-Corpus Excel文件
    df = pd.read_excel('data/CLEAR-Corpus-main/CLEAR_corpus_final.xlsx')

    print(f"总记录数: {len(df)}")

    # 创建标题到分类的映射
    title_to_category = {}
    for idx, row in df.iterrows():
        title = row['Title']
        categ = row['Categ'] if pd.notna(row['Categ']) else 'Lit'
        sub_cat = row['Sub Cat'] if pd.notna(row['Sub Cat']) else ''

        # 构建分类字符串
        if sub_cat:
            category = f"CLEAR/{categ}/{sub_cat}"
        else:
            category = f"CLEAR/{categ}"

        title_to_category[title] = category

    print(f"已加载 {len(title_to_category)} 个分类映射")

    # 遍历所有CLEAR文章
    articles_path = Path('articles')
    clear_files = list(articles_path.glob('clear-*.md'))

    print(f"找到 {len(clear_files)} 个CLEAR文章文件")

    updated_count = 0
    not_found_count = 0

    for file in clear_files:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 检查是否已经有正确的分类
            if 'CLEAR/Lit/' in content or 'CLEAR/Info/' in content:
                continue

            # 提取标题
            title_match = re.search(r'^title:\s*"?(.+?)"?\s*$', content, re.MULTILINE)
            if not title_match:
                continue

            title = title_match.group(1).strip()

            # 查找对应的分类
            category = title_to_category.get(title)

            if category:
                # 更新category行
                lines = content.split('\n')
                new_lines = []

                for line in lines:
                    if line.startswith('category:'):
                        new_lines.append(f'category: "{category}"')
                    else:
                        new_lines.append(line)

                new_content = '\n'.join(new_lines)

                # 写回文件
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                updated_count += 1
            else:
                not_found_count += 1
                if not_found_count <= 10:
                    print(f"  未找到分类: {title[:50]}")

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

    print(f"\n更新完成!")
    print(f"更新文件数: {updated_count}")
    print(f"未找到分类: {not_found_count}")

if __name__ == '__main__':
    update_clear_frontmatter()