#!/usr/bin/env python3
"""
修正source字段位置到frontmatter内部
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
        if filename.startswith('race-'):
            source = "RACE"
        elif filename.startswith('clear-'):
            source = "CLEAR Corpus"
        else:
            # 保留原有文章
            continue

        # 重新构建frontmatter，确保source在里面
        lines = content.split('\n')
        new_lines = []
        in_frontmatter = False
        frontmatter_lines = []
        frontmatter_ended = False
        body_lines = []
        
        for line in lines:
            if line.strip() == '---' and not frontmatter_ended:
                if in_frontmatter:
                    # 结束frontmatter，先添加source（如果没有的话）
                    has_source = any(l.startswith('source:') for l in frontmatter_lines)
                    if not has_source:
                        frontmatter_lines.append(f'source: "{source}"')
                    # 写入frontmatter
                    new_lines.append('---')
                    new_lines.extend(frontmatter_lines)
                    new_lines.append('---')
                    frontmatter_ended = True
                in_frontmatter = not in_frontmatter
                if not in_frontmatter and not frontmatter_ended:
                    # 开始frontmatter
                    pass
            elif in_frontmatter and not frontmatter_ended:
                if not line.startswith('source:'):  # 忽略外部的source
                    frontmatter_lines.append(line)
            elif frontmatter_ended:
                if line.strip() != '' or len(body_lines) > 0:  # 跳过前面的空行
                    body_lines.append(line)
        
        # 写回文件
        with open(file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines + body_lines))
        
        updated += 1

    except Exception as e:
        print(f"错误: {file.name} - {str(e)}")

    if (idx + 1) % 5000 == 0:
        print(f"进度: {idx + 1}/{len(md_files)}")

print(f"\n修正完成!")
print(f"共修正: {updated} 篇文章")
