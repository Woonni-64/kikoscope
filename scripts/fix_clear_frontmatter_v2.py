#!/usr/bin/env python3
"""
修复CLEAR-Corpus文章中的frontmatter格式问题 - 增强版
处理所有非法YAML格式
"""

import re
from pathlib import Path

def clean_frontmatter(content: str) -> str:
    """清理frontmatter中的所有非法格式"""
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

    # 重构frontmatter部分
    fixed_frontmatter = ['---']
    body_lines = []

    # 标记是否在frontmatter内
    in_frontmatter = True

    for i in range(1, len(lines)):
        line = lines[i]

        if i == end_idx:
            fixed_frontmatter.append('---')
            in_frontmatter = False
            continue

        if not in_frontmatter:
            body_lines.append(line)
            continue

        # 跳过空行
        if not line.strip():
            continue

        # 处理key: value格式的行
        if ': ' in line or ':"' in line or ":'" in line:
            # 分割key和value
            match = re.match(r'^(\w+)\s*:\s*(.*)$', line)
            if match:
                key = match.group(1)
                value = match.group(2).strip()

                # 清理value中的引号问题
                if value.startswith('"') and value.endswith('"') and len(value) > 1:
                    inner = value[1:-1]
                    # 移除内部的多余引号和换行
                    inner = re.sub(r'["\n\r]+', ' ', inner)
                    inner = inner.strip()
                    value = f'"{inner}"'
                elif value.startswith('"') and not value.endswith('"'):
                    # 处理开头有引号但没有结尾的情况
                    inner = value[1:]
                    # 查找对应的结束引号
                    if '"' in inner:
                        parts = inner.split('"', 1)
                        value = '"' + parts[0].strip() + '"'
                    else:
                        value = '"' + inner.replace('\n', ' ').strip() + '"'

                fixed_frontmatter.append(f'{key}: {value}')
            else:
                # 如果无法解析，尝试清理整行
                cleaned_line = re.sub(r'["\n\r]+', ' ', line)
                fixed_frontmatter.append(cleaned_line.strip())
        else:
            # 处理不包含": "的行，可能是title包含换行符
            # 查找是否是未闭合的引号开始
            if line.strip().startswith('"') and not line.strip().endswith('"'):
                # 收集多行直到找到结束引号
                combined = line
                for j in range(i + 1, end_idx):
                    if lines[j].strip().endswith('"'):
                        combined += ' ' + lines[j].strip()
                        break
                    else:
                        combined += ' ' + lines[j].strip()

                # 提取title内容
                match = re.match(r'^title:\s*"?(.+?)"?$', combined, re.DOTALL)
                if match:
                    title = match.group(1).replace('\n', ' ').replace('"', "'").strip()
                    fixed_frontmatter.append(f'title: "{title}"')
                    continue

            # 其他情况，清理并添加
            cleaned = re.sub(r'["\n\r]+', ' ', line).strip()
            if cleaned:
                fixed_frontmatter.append(cleaned)

    # 重组内容
    return '\n'.join(fixed_frontmatter) + '\n\n' + '\n'.join(body_lines)

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

            # 清理frontmatter
            fixed_content = clean_frontmatter(content)

            # 如果有变化，写回文件
            if fixed_content != content:
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                fixed_count += 1
                if fixed_count <= 20:  # 只打印前20个
                    print(f"✓ 修复: {file.name}")

        except Exception as e:
            print(f"✗ 错误: {file.name} - {str(e)}")
            error_files.append((file.name, str(e)))

        if (idx + 1) % 500 == 0:
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