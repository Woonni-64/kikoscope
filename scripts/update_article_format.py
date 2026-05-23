#!/usr/bin/env python3
"""
重新整理文章格式：
- RACE文章在标题加真题标识
- 添加出处字段
- 保留内容分类
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

        # 判断文章来源
        filename = file.name
        source = ""
        title_prefix = ""
        
        if filename.startswith('race-'):
            source = "RACE"
            title_prefix = "[RACE真题] "
        elif filename.startswith('clear-'):
            source = "CLEAR Corpus"
        else:
            # 保留原有文章
            continue

        # 读取文件内容，修改frontmatter
        lines = content.split('\n')
        new_lines = []
        in_frontmatter = False
        frontmatter_ended = False
        has_source = False
        
        for line in lines:
            if line.strip() == '---' and not frontmatter_ended:
                in_frontmatter = not in_frontmatter
                if not in_frontmatter:
                    frontmatter_ended = True
                new_lines.append(line)
            elif in_frontmatter:
                if line.startswith('title:'):
                    # 给标题加前缀
                    old_title = line.split(':', 1)[1].strip().replace('"', '').replace("'", '')
                    new_title = title_prefix + old_title
                    new_lines.append(f'title: "{new_title}"')
                elif line.startswith('source:'):
                    has_source = True
                    new_lines.append(f'source: "{source}"')
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        
        # 如果没有source字段，添加一个
        if not has_source:
            # 找frontmatter结束位置插入source
            final_lines = []
            in_frontmatter = False
            source_added = False
            
            for line in new_lines:
                final_lines.append(line)
                if line.strip() == '---' and in_frontmatter and not source_added:
                    final_lines.append(f'source: "{source}"')
                    source_added = True
                elif line.strip() == '---':
                    in_frontmatter = not in_frontmatter
            new_lines = final_lines

        # 写回文件
        with open(file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        
        updated += 1

    except Exception as e:
        print(f"错误: {file.name} - {str(e)}")

    if (idx + 1) % 5000 == 0:
        print(f"进度: {idx + 1}/{len(md_files)}")

print(f"\n更新完成!")
print(f"共更新: {updated} 篇文章")
