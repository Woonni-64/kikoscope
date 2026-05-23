#!/usr/bin/env python3
"""导入 english-exem-md 的四六级真题"""

import re
import os
from pathlib import Path
from datetime import datetime

def clean_filename(text):
    """清理文件名"""
    text = re.sub(r'[^\w\- ]', '', text)
    text = re.sub(r'\s+', '-', text.strip())
    text = text[:100]
    return text.lower()

def analyze_content_category(text):
    """根据内容分析分类"""
    text = text.lower()
    
    categories = {
        '教育': ['education', 'university', 'school', 'student', 'teacher', 'study', 'learning', 'college'],
        '科技': ['technology', 'internet', 'computer', 'digital', 'ai', 'artificial', 'machine', 'software'],
        '社会': ['society', 'social', 'people', 'culture', 'community', 'life'],
        '环境': ['environment', 'climate', 'planet', 'earth', 'pollution', 'green', 'nature'],
        '健康': ['health', 'medical', 'doctor', 'disease', 'exercise', 'fitness'],
        '商业': ['business', 'company', 'market', 'economy', 'money', 'financial'],
    }
    
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in text:
                return category
    return '其他'

def generate_summary(text):
    """生成摘要"""
    sentences = re.split(r'[.!?]+', text)
    first_sentence = sentences[0].strip()
    if len(first_sentence) < 20:
        first_sentence = ' '.join([s.strip() for s in sentences[:2] if s.strip()])
    return first_sentence[:200]

def import_cet_md_files():
    """导入所有四六级真题"""
    base_dir = Path(__file__).parent.parent
    data_dir = base_dir / 'data' / 'english-exem-md'
    articles_dir = base_dir / 'articles'
    
    if not data_dir.exists():
        print(f"数据目录不存在: {data_dir}")
        return
    
    article_count = 0
    
    # 处理 CET4 和 CET6
    for cet_type in ['CET4', 'CET6']:
        cet_dir = data_dir / cet_type
        if not cet_dir.exists():
            continue
            
        print(f"处理 {cet_type}...")
        
        # 遍历每个月份的文件夹
        for month_dir in cet_dir.iterdir():
            if not month_dir.is_dir():
                continue
                
            print(f"  处理 {month_dir.name}...")
            
            # 遍历每个套题文件
            for md_file in month_dir.glob('*.md'):
                print(f"    导入 {md_file.name}...")
                
                with open(md_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 提取文章
                article_count += extract_articles_from_cet(content, articles_dir, cet_type, month_dir.name, md_file.name)
    
    print(f"\n✅ 共导入 {article_count} 篇文章！")

def clean_article_text(article_text):
    """清理文章内容，移除所有问题和选项"""
    # 移除 Directions (单独一行或开头部分的)
    article_text = re.sub(r'\*\*Directions:\*\*.*?\n\n', '', article_text, flags=re.DOTALL)
    article_text = re.sub(r'\*\*Directions\*\*.*?\n\n', '', article_text, flags=re.DOTALL)
    
    # 移除 Questions 标题
    article_text = re.sub(r'\*\*Questions \d+ to \d+ are based on the following passage\.\*\*\n\n', '', article_text)
    
    # 移除问题行 (数字开头，如 36. 46. 等)
    article_text = re.sub(r'\n\d{2}\.\s+.*', '', article_text)
    
    # 移除问题选项 (数字后跟选项，如 36. A) 或 36. B) 等)
    article_text = re.sub(r'\n\s*\d+\.\s+[A-Z]\)\s.*', '', article_text)
    
    # 移除选项表格 (Section A)
    article_text = re.sub(r'\n\|.*?\|\n', '', article_text, flags=re.DOTALL)
    
    # 移除填空标记
    article_text = re.sub(r'<u>&emsp;\d+&emsp;</u>', '_____', article_text)
    
    # 清理多余空行
    article_text = re.sub(r'\n{3,}', '\n\n', article_text).strip()
    return article_text

def extract_articles_from_cet(content, articles_dir, cet_type, month, filename):
    """从 CET 真题文件中提取文章"""
    count = 0
    
    # 先提取 Part III / Reading Comprehension 部分
    reading_match = re.search(r'## Part III / Reading Comprehension.*?(?=## Part IV)', content, re.DOTALL)
    if not reading_match:
        return 0
    
    reading_content = reading_match.group(0)
    
    # 1. 提取 Section A (选词填空)
    section_a_match = re.search(r'### Section A\n\n(.*?)(?=### Section B)', reading_content, re.DOTALL)
    if section_a_match:
        article_text = section_a_match.group(1).strip()
        article_text = clean_article_text(article_text)
        
        if len(article_text) > 100:
            title = f"{cet_type} {month} 选词填空"
            write_article(articles_dir, title, article_text, cet_type, '选词填空')
            count += 1
    
    # 2. 提取 Section B (段落匹配) - 更精确地提取标题
    section_b_match = re.search(r'### Section B\n\n(.*?)(?=### Section C)', reading_content, re.DOTALL)
    if section_b_match:
        section_content = section_b_match.group(1).strip()
        
        # 提取标题 - 找第一个**之间的文本，后面紧跟段落字母A
        title_match = re.search(r'^\*\*(.+?)\*\*\s*\n\n([A-Z])', section_content)
        if title_match:
            article_title = title_match.group(1).strip()
            if 'question' in article_title.lower():
                article_title = "段落匹配"
        else:
            article_title = "段落匹配"
        
        article_text = clean_article_text(section_content)
        
        if len(article_text) > 100:
            title = f"{cet_type} {month} {article_title}"
            write_article(articles_dir, title, article_text, cet_type, '段落匹配')
            count += 1
    
    # 3. 提取 Section C (仔细阅读) - Passage One
    passage_one_match = re.search(r'#### Passage One\n\n(.*?)(?=#### Passage Two)', reading_content, re.DOTALL)
    if passage_one_match:
        article_text = passage_one_match.group(1).strip()
        article_text = clean_article_text(article_text)
        
        if len(article_text) > 100:
            title = f"{cet_type} {month} 仔细阅读 (一)"
            write_article(articles_dir, title, article_text, cet_type, '仔细阅读')
            count += 1
    
    # 4. 提取 Section C (仔细阅读) - Passage Two
    passage_two_match = re.search(r'#### Passage Two\n\n(.*?)(?=## Part IV)', reading_content, re.DOTALL)
    if passage_two_match:
        article_text = passage_two_match.group(1).strip()
        article_text = clean_article_text(article_text)
        
        if len(article_text) > 100:
            title = f"{cet_type} {month} 仔细阅读 (二)"
            write_article(articles_dir, title, article_text, cet_type, '仔细阅读')
            count += 1
    
    return count

def write_article(articles_dir, title, article_text, source, question_type):
    """写入文章文件"""
    category = analyze_content_category(article_text)
    summary = generate_summary(article_text)
    
    # 生成文件名
    filename_base = clean_filename(title)
    filepath = articles_dir / f"{filename_base}.md"
    
    # 避免文件名冲突
    i = 1
    while filepath.exists():
        filepath = articles_dir / f"{filename_base}-{i}.md"
        i += 1
    
    # 写入 frontmatter 和内容
    escaped_summary = summary.replace('"', '\\"')
    frontmatter = """---
title: {title}
date: {date}
category: {category}
source: {source}
summary: {escaped_summary}
---

""".format(
        title=title,
        date=datetime.now().strftime('%Y-%m-%d'),
        category=category,
        source=source,
        escaped_summary=escaped_summary
    )
    
    content = frontmatter + article_text.strip()
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"      ✓ 写入: {filepath.name} (字符数: {len(article_text)})")

if __name__ == '__main__':
    import_cet_md_files()
