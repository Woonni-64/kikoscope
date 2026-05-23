#!/usr/bin/env python3
"""
删除没有正文的RACE和CLEAR文章
"""

from pathlib import Path

def delete_empty_articles():
    """删除没有正文的文章"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    deleted = 0

    for file in md_files:
        try:
            filename = file.name

            # 只处理RACE和CLEAR文章
            if not (filename.startswith('race-') or filename.startswith('clear-')):
                continue

            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 检查是否有正文（frontmatter之后的非空内容）
            parts = content.split('---')
            if len(parts) >= 3:
                body = '---'.join(parts[2:]).strip()

                # 如果body为空或只有少量内容（少于20个字符），删除文件
                if len(body) < 20:
                    print(f"删除: {filename} (正文长度: {len(body)})")
                    file.unlink()
                    deleted += 1

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

    print(f"\n删除完成!")
    print(f"共删除: {deleted} 篇文章")

if __name__ == '__main__':
    delete_empty_articles()
