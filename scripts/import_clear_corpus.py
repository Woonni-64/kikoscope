#!/usr/bin/env python3
"""
CLEAR-Corpus数据集导入脚本
处理Excel文件并转换为Markdown文章格式
"""

import pandas as pd
import json
from pathlib import Path
from typing import Dict, List, Any

def load_clear_corpus(file_path: str) -> pd.DataFrame:
    """加载CLEAR-Corpus Excel文件"""
    df = pd.read_excel(file_path)
    return df

def analyze_clear_corpus(df: pd.DataFrame):
    """分析CLEAR-Corpus数据结构"""
    print(f"总行数: {len(df)}")
    print(f"列名: {df.columns.tolist()}")
    print(f"\n前3行数据:")
    print(df.head(3))
    print(f"\n数据类型:")
    print(df.dtypes)

def convert_to_markdown(row: pd.Series, idx: int) -> str:
    """将CLEAR-Corpus单行转换为Markdown"""
    # 获取各列数据
    title = row.get('Title', f'CLEAR Article {idx}')
    content = row.get('Excerpt', '')  # 使用Excerpt作为文章内容
    category = row.get('Categ', row.get('Sub Cat', '其他'))
    difficulty = row.get('Lexile Band', 'CLEAR')
    author = row.get('Author', 'Unknown')
    pub_year = row.get('Pub Year', '')

    if pd.isna(content) or not content or len(str(content)) < 50:
        return None

    markdown = f'''---
title: "{title}"
category: "CLEAR/{category}"
difficulty: "{difficulty}"
date: "{pub_year if not pd.isna(pub_year) else '2024-01-01'}"
author: "{author}"
summary: "CLEAR Corpus dataset article"
---

{content}
'''

    return markdown

def process_clear_corpus(excel_file: str, output_dir: str):
    """处理CLEAR-Corpus数据集"""
    print(f"加载Excel文件: {excel_file}")
    df = load_clear_corpus(excel_file)

    # 分析数据结构
    analyze_clear_corpus(df)

    # 创建输出目录
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # 统计信息
    total_rows = len(df)
    successful = 0
    failed = 0

    print(f"\n开始转换 {total_rows} 篇文章...")

    for idx, row in df.iterrows():
        try:
            markdown = convert_to_markdown(row, idx)
            if markdown:
                # 生成文件名
                title = row.get('title', row.get('Title', f'clear-{idx}'))
                if pd.isna(title):
                    title = f'clear-{idx}'
                # 清理文件名
                safe_title = str(title).replace('/', '-').replace('\\', '-')[:50]
                filename = f"clear-{safe_title}-{idx}.md"

                # 保存文件
                md_file = output_path / filename
                with open(md_file, 'w', encoding='utf-8') as f:
                    f.write(markdown)
                successful += 1
            else:
                failed += 1

        except Exception as e:
            print(f"处理第{idx}行失败: {str(e)}")
            failed += 1

        if (idx + 1) % 100 == 0:
            print(f"进度: {idx + 1}/{total_rows}")

    print(f"\n处理完成!")
    print(f"成功转换: {successful} 篇文章")
    print(f"失败: {failed} 篇")

    return {
        'total': total_rows,
        'successful': successful,
        'failed': failed
    }

if __name__ == '__main__':
    # 配置路径
    EXCEL_FILE = 'data/CLEAR-Corpus-main/CLEAR_corpus_final.xlsx'
    OUTPUT_DIR = 'articles'

    # 执行处理
    result = process_clear_corpus(EXCEL_FILE, OUTPUT_DIR)
    print(f"\n结果: {result}")