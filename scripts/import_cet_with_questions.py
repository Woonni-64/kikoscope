#!/usr/bin/env python3
"""导入四六级真题文章和题目，建立关联"""

import re
import json
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
    return '四六级'

def generate_summary(text):
    """生成摘要"""
    sentences = re.split(r'[.!?]+', text)
    first_sentence = sentences[0].strip()
    if len(first_sentence) < 20:
        first_sentence = ' '.join([s.strip() for s in sentences[:2] if s.strip()])
    return first_sentence[:200]

def import_cet_with_questions():
    """导入文章和题目"""
    base_dir = Path(__file__).parent.parent
    data_dir = base_dir / 'data' / 'english-exem-md'
    articles_dir = base_dir / 'articles'
    quiz_data_dir = base_dir / 'quiz_data'
    
    quiz_data_dir.mkdir(exist_ok=True)
    
    all_questions = {}
    article_count = 0
    question_count = 0
    
    for cet_type in ['CET4', 'CET6']:
        cet_dir = data_dir / cet_type
        if not cet_dir.exists():
            continue
        
        print(f"处理 {cet_type}...")
        
        for month_dir in cet_dir.iterdir():
            if not month_dir.is_dir():
                continue
            
            for md_file in month_dir.glob('*.md'):
                print(f"  处理 {month_dir.name} {md_file.name}...")
                
                with open(md_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 提取阅读部分
                reading_match = re.search(r'## Part III / Reading Comprehension.*?(?=## Part IV)', content, re.DOTALL)
                if not reading_match:
                    continue
                
                reading_content = reading_match.group(0)
                
                # 提取 Section C 的仔细阅读
                passages = re.findall(r'#### Passage (One|Two)\n\n(.*?)(?=#### Passage|## Part IV|$)', reading_content, re.DOTALL)
                
                for passage_name, passage_content in passages:
                    # 提取文章内容（在 "Questions X to Y" 之前）
                    questions_start = passage_content.find('**Questions')
                    if questions_start > 0:
                        article_text = passage_content[:questions_start].strip()
                    else:
                        article_text = passage_content.strip()
                    
                    if len(article_text) < 100:
                        continue
                    
                    # 生成文章标题和slug
                    title = f"{cet_type} {month_dir.name} 仔细阅读 ({passage_name})"
                    filename_base = clean_filename(title)
                    slug = filename_base
                    
                    # 写入文章文件
                    category = analyze_content_category(article_text)
                    summary = generate_summary(article_text)
                    escaped_summary = summary.replace('"', '\\"')
                    
                    frontmatter = f"""---
title: {title}
date: {datetime.now().strftime('%Y-%m-%d')}
category: {category}
source: {cet_type}
summary: {escaped_summary}
quiz_key: {cet_type}_{month_dir.name}_{md_file.stem}_{passage_name}
---

"""
                    
                    filepath = articles_dir / f"{filename_base}.md"
                    i = 1
                    while filepath.exists():
                        filepath = articles_dir / f"{filename_base}-{i}.md"
                        slug = f"{filename_base}-{i}"
                        i += 1
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(frontmatter + article_text)
                    
                    article_count += 1
                    print(f"    ✓ 写入文章: {filepath.name}")
                    
                    # 提取题目
                    q_blocks = re.findall(r'(\d{2})\.\s+(.*?)(?=\n\n\d{2}\.|$)', passage_content, re.DOTALL)
                    questions = []
                    
                    for q_num, q_content in q_blocks:
                        options_pattern = r'\n\s*([A-D])\)\s+(.+?)(?=\n\s*[A-D]\)|$)'
                        options = re.findall(options_pattern, q_content)
                        
                        if len(options) >= 4:
                            question_text = re.sub(r'\n\s*[A-D]\)\s+.+?', '', q_content).strip()
                            question_text = re.sub(r'\s+', ' ', question_text)
                            
                            questions.append({
                                'question_num': q_num,
                                'question': question_text,
                                'options': [opt[1].strip() for opt in options[:4]],
                                'correct_answer': -1
                            })
                    
                    if questions:
                        quiz_key = f"{cet_type}_{month_dir.name}_{md_file.stem}_{passage_name}"
                        all_questions[quiz_key] = {
                            'slug': slug,
                            'title': title,
                            'questions': questions
                        }
                        question_count += len(questions)
                        print(f"    ✓ 提取到 {len(questions)} 道题目")
    
    # 保存题目数据
    output_file = quiz_data_dir / 'cet_questions_full.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 共导入 {article_count} 篇文章，{question_count} 道题目")
    print(f"题目数据保存到: {output_file}")

if __name__ == '__main__':
    import_cet_with_questions()
