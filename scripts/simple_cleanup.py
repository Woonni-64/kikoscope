#!/usr/bin/env python3
"""
简单直接地清理所有文章
"""

from pathlib import Path

articles_path = Path('articles')
md_files = list(articles_path.glob('*.md'))

print(f"总文件数: {len(md_files)}")

updated = 0

for idx, file in enumerate(md_files):
    try:
        filename = file.name
        if not (filename.startswith('race-') or filename.startswith('clear-')):
            continue
        
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 找到两个---之间的frontmatter
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
            
            # 处理body - 去掉开头可能的重复内容
            body_lines = body_str.strip().split('\n')
            clean_body = []
            for line in body_lines:
                if not line.startswith('source:'):  # 去掉重复的source行
                    clean_body.append(line)
            
            # 确保source在frontmatter里
            if filename.startswith('race-'):
                frontmatter['source'] = 'RACE'
                if 'title' in frontmatter and not frontmatter['title'].startswith('[RACE真题]'):
                    frontmatter['title'] = '[RACE真题] ' + frontmatter['title']
            elif filename.startswith('clear-'):
                frontmatter['source'] = 'CLEAR Corpus'
            
            # 重新构建
            output = ['---']
            for k, v in frontmatter.items():
                output.append(f'{k}: "{v}"')
            output.append('---')
            output.extend(clean_body)
            
            # 写回
            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))
            
            updated += 1

    except Exception as e:
        print(f"错误: {file.name} - {str(e)}")

    if (idx + 1) % 5000 == 0:
        print(f"进度: {idx + 1}/{len(md_files)}")

print(f"\n清理完成!")
print(f"共清理: {updated} 篇文章")
