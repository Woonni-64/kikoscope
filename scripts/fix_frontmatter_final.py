#!/usr/bin/env python3
"""
修复frontmatter中所有多行字段问题
"""

import re
from pathlib import Path

def fix_frontmatter_complete(content: str) -> str:
    """完全修复frontmatter中的所有多行问题"""
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

    # 重建frontmatter
    new_lines = ['---']

    i = 1
    while i < end_idx:
        line = lines[i]
        stripped = line.strip()

        # 跳过空行
        if not stripped:
            i += 1
            continue

        # 检查是否是key: value格式
        key_match = re.match(r'^(\w+):\s*(.*)$', stripped)
        if key_match:
            key = key_match.group(1)
            value = key_match.group(2).strip()

            # 检查value是否为空（表示后续行是value的一部分）
            if not value:
                # 收集后续行直到找到内容或结束
                collected = []
                j = i + 1
                while j < end_idx:
                    next_stripped = lines[j].strip()
                    if next_stripped:
                        # 检查是否是另一个key（不以引号开头）
                        if re.match(r'^\w+:', next_stripped) and not next_stripped.startswith('"'):
                            break
                        collected.append(next_stripped)
                        # 如果有结束引号，可以停止
                        if collected and collected[-1].endswith('"'):
                            break
                    j += 1

                if collected:
                    # 合并所有收集的行
                    full_value = ' '.join(collected)
                    # 清理
                    full_value = full_value.replace('\n', ' ').replace('\r', ' ')
                    full_value = re.sub(r'\s+', ' ', full_value).strip()
                    # 移除首尾引号
                    if full_value.startswith('"'):
                        full_value = full_value[1:]
                    if full_value.endswith('"'):
                        full_value = full_value[:-1]
                    full_value = full_value.replace('"', "'").strip()

                    new_lines.append(f'{key}: "{full_value}"')
                    i = j
                    continue
                else:
                    # 没有后续内容，设置为空
                    new_lines.append(f'{key}: ""')
                    i += 1
                    continue
            else:
                # Value不为空
                # 检查是否未闭合的引号
                if value.startswith('"') and not value.endswith('"'):
                    # 继续收集后续行
                    collected = [value]
                    j = i + 1
                    while j < end_idx:
                        next_stripped = lines[j].strip()
                        collected.append(next_stripped)
                        if next_stripped.endswith('"'):
                            break
                        j += 1

                    full_value = ' '.join(collected)
                    # 提取引号内容
                    if full_value.startswith('"'):
                        full_value = full_value[1:]
                    if full_value.endswith('"'):
                        full_value = full_value[:-1]
                    # 清理
                    full_value = full_value.replace('\n', ' ').replace('\r', ' ')
                    full_value = re.sub(r'\s+', ' ', full_value).strip()
                    full_value = full_value.replace('"', "'").strip()

                    new_lines.append(f'{key}: "{full_value}"')
                    i = j + 1
                    continue
                else:
                    # 正常的value
                    # 清理value
                    value = value.replace('\n', ' ').replace('\r', ' ')
                    value = re.sub(r'\s+', ' ', value).strip()
                    # 移除首尾引号并重新格式化
                    if value.startswith('"') and value.endswith('"') and len(value) > 1:
                        inner = value[1:-1]
                        inner = inner.replace('\n', ' ').replace('\r', ' ')
                        inner = re.sub(r'\s+', ' ', inner).strip()
                        inner = inner.replace('"', "'").strip()
                        new_lines.append(f'{key}: "{inner}"')
                    else:
                        new_lines.append(f'{key}: {value}')
                    i += 1
                    continue
        else:
            # 不是key: value格式，可能是title的延续
            # 检查前一行是否是title且未完成
            if new_lines and new_lines[-1].startswith('title:'):
                # 获取当前行的内容
                current = stripped.replace('\n', ' ').replace('\r', ' ')
                current = re.sub(r'\s+', ' ', current).strip()

                # 从new_lines获取title
                last_line = new_lines[-1]
                # 提取现有内容
                match = re.match(r'^title:\s*"?(.+?)"?$', last_line)
                if match:
                    existing = match.group(1)
                    # 合并
                    combined = existing + ' ' + current
                    combined = combined.replace('"', "'").strip()
                    new_lines[-1] = f'title: "{combined}"'

                i += 1
                continue
            else:
                # 其他情况，清理并添加
                cleaned = stripped.replace('\n', ' ').replace('\r', ' ')
                cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                if cleaned:
                    new_lines.append(cleaned)
                i += 1
                continue

    new_lines.append('---')

    # 添加body
    body_lines = []
    for j in range(end_idx + 1, len(lines)):
        if lines[j]:
            body_lines.append(lines[j])

    return '\n'.join(new_lines) + '\n\n' + '\n'.join(body_lines)

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

            fixed = fix_frontmatter_complete(content)

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

    if errors:
        print(f"\n前5个错误:")
        for fname, error in errors[:5]:
            print(f"  - {fname}: {error}")

if __name__ == '__main__':
    process_all_files('articles')