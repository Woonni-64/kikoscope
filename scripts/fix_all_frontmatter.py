#!/usr/bin/env python3
"""
修复所有frontmatter中的多行title问题
"""

import re
from pathlib import Path

def fix_multiline_frontmatter(content: str) -> str:
    """修复frontmatter中的多行title和其他多行字段"""
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

    # 重构frontmatter
    new_frontmatter = ['---']
    body_lines = []

    i = 1
    while i < end_idx:
        line = lines[i].strip()

        # 跳过空行
        if not line:
            i += 1
            continue

        # 检查是否是key: value格式
        if ': ' in line or (':"' in line and not line.rstrip().endswith('"')):
            match = re.match(r'^(\w+):\s*(.*)$', line, re.DOTALL)
            if match:
                key = match.group(1)
                value = match.group(2).strip()

                # 检查value是否未闭合
                if value.startswith('"') and not value.endswith('"'):
                    # 收集多行直到找到结束引号
                    collected_lines = [value]
                    j = i + 1
                    while j < end_idx:
                        next_line = lines[j].strip()
                        collected_lines.append(next_line)
                        if next_line.endswith('"'):
                            break
                        j += 1

                    # 合并并清理
                    full_value = ' '.join(collected_lines)
                    # 移除首尾引号并清理内部
                    if full_value.startswith('"'):
                        full_value = full_value[1:]
                    if full_value.endswith('"'):
                        full_value = full_value[:-1]

                    # 移除所有内部换行和多余引号
                    full_value = full_value.replace('\n', ' ').replace('\r', ' ')
                    full_value = re.sub(r'\s+', ' ', full_value)
                    full_value = full_value.replace('"', "'").strip()

                    new_frontmatter.append(f'{key}: "{full_value}"')
                    i = j + 1
                    continue
                elif value.startswith('"') and value.endswith('"'):
                    # 清理value中的多余引号和换行
                    inner = value[1:-1]
                    inner = inner.replace('\n', ' ').replace('\r', ' ')
                    inner = re.sub(r'\s+', ' ', inner)
                    inner = inner.strip()
                    new_frontmatter.append(f'{key}: "{inner}"')
                    i += 1
                    continue
                else:
                    # 没有引号的情况，清理换行
                    value = value.replace('\n', ' ').replace('\r', ' ')
                    value = re.sub(r'\s+', ' ', value).strip()
                    new_frontmatter.append(f'{key}: "{value}"')
                    i += 1
                    continue
            else:
                # 无法解析的行，清理并添加
                cleaned = line.replace('\n', ' ').replace('\r', ' ')
                cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                if cleaned:
                    new_frontmatter.append(cleaned)
                i += 1
                continue
        else:
            # 其他行（可能是未闭合的引号）
            if line.startswith('"') and not line.endswith('"'):
                # 收集多行直到结束
                collected_lines = [line]
                j = i + 1
                while j < end_idx:
                    next_line = lines[j].strip()
                    collected_lines.append(next_line)
                    if next_line.endswith('"'):
                        break
                    j += 1

                full_text = ' '.join(collected_lines)
                # 移除首尾引号
                if full_text.startswith('"'):
                    full_text = full_text[1:]
                if full_text.endswith('"'):
                    full_text = full_text[:-1]

                # 清理并添加为title
                full_text = full_text.replace('\n', ' ').replace('\r', ' ')
                full_text = re.sub(r'\s+', ' ', full_text)
                full_text = full_text.replace('"', "'").strip()
                new_frontmatter.append(f'title: "{full_text}"')
                i = j + 1
                continue
            else:
                # 清理并添加
                cleaned = line.replace('\n', ' ').replace('\r', ' ')
                cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                if cleaned:
                    new_frontmatter.append(cleaned)
                i += 1
                continue

    # 添加frontmatter结束标记
    new_frontmatter.append('---')

    # 收集body内容
    for j in range(end_idx + 1, len(lines)):
        if lines[j]:
            body_lines.append(lines[j])

    return '\n'.join(new_frontmatter) + '\n\n' + '\n'.join(body_lines)

def process_all_md_files(articles_dir: str):
    """处理所有Markdown文件"""
    articles_path = Path(articles_dir)

    # 找到所有md文件
    md_files = list(articles_path.glob('*.md'))

    print(f"找到 {len(md_files)} 个Markdown文件")

    fixed_count = 0
    error_files = []

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 修复frontmatter
            fixed_content = fix_multiline_frontmatter(content)

            # 如果有变化，写回文件
            if fixed_content != content:
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                fixed_count += 1
                if fixed_count <= 10:
                    print(f"✓ 修复: {file.name}")

        except Exception as e:
            error_files.append((file.name, str(e)))

        if (idx + 1) % 1000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n修复完成!")
    print(f"修复文件数: {fixed_count}")
    print(f"错误文件数: {len(error_files)}")

    if error_files:
        print(f"\n错误文件:")
        for fname, error in error_files[:5]:
            print(f"  - {fname}: {error}")

if __name__ == '__main__':
    process_all_md_files('articles')