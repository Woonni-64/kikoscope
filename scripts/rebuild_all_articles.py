#!/usr/bin/env python3
"""
重新整理所有文章，确保格式正确
"""

from pathlib import Path

articles_path = Path('articles')
md_files = list(articles_path.glob('*.md'))

print(f"总文件数: {len(md_files)}")

updated = 0

for idx, file in enumerate(md_files):
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        filename = file.name
        
        # 判断文章来源
        source = None
        if filename.startswith('race-'):
            source = "RACE"
        elif filename.startswith('clear-'):
            source = "CLEAR Corpus"
        else:
            continue  # 跳过原有文章

        # 重新构建整个文件
        # 先找到frontmatter
        lines = content.split('\n')
        frontmatter = {}
        body = []
        in_frontmatter = False
        frontmatter_count = 0
        
        for line in lines:
            if line.strip() == '---':
                frontmatter_count += 1
                if frontmatter_count == 1:
                    in_frontmatter = True
                elif frontmatter_count == 2:
                    in_frontmatter = False
                continue
            
            if in_frontmatter:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    frontmatter[key] = value
            else:
                if not (line.strip() == '' and len(body) == 0):
                    body.append(line)
        
        # 确保有必要的字段
        if 'title' in frontmatter:
            # 给RACE文章标题加前缀
            if source == 'RACE' and not frontmatter['title'].startswith('[RACE真题]'):
                frontmatter['title'] = '[RACE真题] ' + frontmatter['title']
        
        # 添加source
        frontmatter['source'] = source
        
        # 重新构建文件
        output = ['---']
        for key, value in frontmatter.items():
            if value:
                output.append(f'{key}: "{value}"')
        output.append('---')
        output.extend(body)
        
        # 写回
        with open(file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(output))
        
        updated += 1

    except Exception as e:
        print(f"错误: {file.name} - {str(e)}")

    if (idx + 1) % 5000 == 0:
        print(f"进度: {idx + 1}/{len(md_files)}")

print(f"\n更新完成!")
print(f"共更新: {updated} 篇文章")
