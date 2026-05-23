#!/usr/bin/env python3
"""
修复CLEAR-Corpus文章中的frontmatter格式问题
清理标题中的非法YAML字符
"""

import re
from pathlib import Path

def fix_frontmatter_issues(content: str) -> str:
    """修复frontmatter中的格式问题"""
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

    # 修复frontmatter部分
    fixed_lines = []
    for i in range(end_idx + 1):
        line = lines[i]

        # 修复title字段中的多余引号
        if line.startswith('title:') and '""' in line:
            # 提取title内容
            match = re.match(r'(title:\s*)"(.+)?"', line)
            if match:
                prefix = match.group(1)
                title_content = match.group(2)
                if title_content:
                    # 移除title中的多余引号
                    title_content = title_content.strip('"')
                    # 清理特殊字符
                    title_content = title_content.replace('"', "'").replace('\n', ' ')
                    line = f'{prefix}"{title_content}"'

        # 修复其他可能包含非法字符的字段
        if ': "' in line:
            key = line.split(':')[0].strip()
            if key in ['title', 'category', 'author', 'summary']:
                # 确保值用双引号包裹且内部没有换行
                parts = line.split(': ', 1)
                if len(parts) == 2:
                    value_part = parts[1]
                    # 移除前导和尾随引号
                    if value_part.startswith('"') and value_part.endswith('"'):
                        inner = value_part[1:-1]
                        # 清理内部引号
                        inner = inner.replace('""', '"').replace('\n', ' ').strip()
                        line = f'{parts[0]}: "{inner}"'

        fixed_lines.append(line)

    # 重组内容
    return '\n'.join(fixed_lines[:end_idx + 1]) + '\n' + '\n'.join(fixed_lines[end_idx + 1:])

def process_clear_articles(articles_dir: str):
    """处理所有CLEAR文章文件"""
    articles_path = Path(articles_dir)

    # 找到所有clear-开头的md文件
    clear_files = list(articles_path.glob('clear-*.md'))

    print(f"找到 {len(clear_files)} 个CLEAR文章文件")

    fixed_count = 0
    error_files = []

    for idx, file in enumerate(clear_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 修复frontmatter
            fixed_content = fix_frontmatter_issues(content)

            # 如果有变化，写回文件
            if fixed_content != content:
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                fixed_count += 1
                print(f"✓ 修复: {file.name}")

        except Exception as e:
            print(f"✗ 错误: {file.name} - {str(e)}")
            error_files.append((file.name, str(e)))

        if (idx + 1) % 100 == 0:
            print(f"进度: {idx + 1}/{len(clear_files)}")

    print(f"\n修复完成!")
    print(f"修复文件数: {fixed_count}")
    print(f"错误文件数: {len(error_files)}")

    if error_files:
        print(f"\n错误文件列表:")
        for fname, error in error_files[:10]:
            print(f"  - {fname}: {error}")

if __name__ == '__main__':
    process_clear_articles('articles')