#!/usr/bin/env python3
"""修复CET文章内容，移除开头的Questions标记"""

import re
from pathlib import Path

def fix_article_content(filepath):
    """修复单个文章文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 移除开头的 **Questions X to Y are based on the following passage.**
    content = re.sub(r'^\*\*Questions \d+ to \d+ are based on the following passage\.\*\*\n\n', '', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_all_cet_articles():
    """修复所有CET文章"""
    base_dir = Path(__file__).parent.parent
    articles_dir = base_dir / 'articles'
    
    count = 0
    for filepath in articles_dir.glob('cet*-仔细阅读*.md'):
        fix_article_content(filepath)
        count += 1
        print(f"修复: {filepath.name}")
    
    print(f"\n✅ 修复了 {count} 篇文章")

if __name__ == '__main__':
    fix_all_cet_articles()
