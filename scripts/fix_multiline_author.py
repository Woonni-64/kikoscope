#!/usr/bin/env python3
"""
批量修复frontmatter中多行作者的问题
"""

import re
from pathlib import Path

def fix_multiline_author(content: str) -> str:
    """修复frontmatter中的多行作者问题"""
    lines = content.split('\n')

    # 检查是否是frontmatter格式
    if len(lines) < 2 or lines[0].strip() != '---':
        return content

    # 找到frontmatter的结束位置
    end_idx = -1
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            end_idx = i
            break

    if end_idx == -1:
        return content

    # 处理frontmatter部分
    in_frontmatter = True
    author_lines = []
    fixed_lines = ['---']
    i = 1

    while i < end_idx:
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            fixed_lines.append(line)
            i += 1
            continue

        # 检查是否是author字段
        if stripped.startswith('author:'):
            # 提取作者内容
            match = re.match(r'^author:\s*"?(.+?)"?$', stripped)
            if match:
                author_lines = [match.group(1).strip()]
            else:
                author_lines = []

            # 检查后续行是否也是作者
            j = i + 1
            while j < end_idx:
                next_stripped = lines[j].strip()
                # 如果不是key: value格式且不为空，可能是作者名字的延续
                if next_stripped and not re.match(r'^\w+:', next_stripped):
                    author_lines.append(next_stripped)
                    j += 1
                else:
                    break

            # 合并所有作者
            if author_lines:
                combined_author = ', '.join(author_lines).replace('"', "'").strip()
                fixed_lines.append(f'author: "{combined_author}"')
            else:
                fixed_lines.append(line)

            i = j
            continue

        # 检查是否是其他字段的延续（不是key: value格式）
        if not re.match(r'^\w+:', stripped):
            # 检查前一行是否是author字段
            if fixed_lines and fixed_lines[-1].startswith('author:'):
                # 这行应该合并到作者字段
                last_line = fixed_lines[-1]
                match = re.match(r'^author:\s*"?(.+?)"?$', last_line)
                if match:
                    existing = match.group(1).strip()
                    combined = existing + ', ' + stripped.replace('"', "'").strip()
                    fixed_lines[-1] = f'author: "{combined}"'
                    i += 1
                    continue

        fixed_lines.append(line)
        i += 1

    # 添加frontmatter结束标记
    fixed_lines.append('---')

    # 添加body内容
    for j in range(end_idx + 1, len(lines)):
        fixed_lines.append(lines[j])

    return '\n'.join(fixed_lines)

def process_all_files(articles_dir: str):
    """处理所有Markdown文件"""
    articles_path = Path(articles_dir)
    md_files = list(articles_path.glob('*.md'))

    print(f"找到 {len(md_files)} 个Markdown文件")

    fixed_count = 0
    errors = []

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            fixed = fix_multiline_author(content)

            if fixed != content:
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(fixed)
                fixed_count += 1

        except Exception as e:
            errors.append((file.name, str(e)))

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n修复完成!")
    print(f"修复文件数: {fixed_count}")
    print(f"错误文件数: {len(errors)}")

if __name__ == '__main__':
    process_all_files('articles')