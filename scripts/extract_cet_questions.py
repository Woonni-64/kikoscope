#!/usr/bin/env python3
"""从四六级真题中提取题目并与文章关联"""

import re
import json
from pathlib import Path

def extract_reading_questions(content):
    """提取阅读部分的题目"""
    questions = []
    
    # 找 Part III / Reading Comprehension
    reading_match = re.search(r'## Part III / Reading Comprehension.*?(?=## Part IV)', content, re.DOTALL)
    if not reading_match:
        return questions
    
    reading_content = reading_match.group(0)
    
    # 提取 Section C 的仔细阅读题目
    passages = re.findall(r'#### Passage (One|Two)\n\n(.*?)(?=#### Passage|## Part IV|$)', reading_content, re.DOTALL)
    
    for passage_name, passage_content in passages:
        # 先提取文章内容（在 "Questions X to Y" 之前）
        article_end = passage_content.find('**Questions')
        if article_end > 0:
            article_text = passage_content[:article_end].strip()
        else:
            article_text = ""
        
        # 提取问题块
        q_blocks = re.findall(r'(\d{2})\.\s+(.*?)(?=\n\n\d{2}\.|$)', passage_content, re.DOTALL)
        
        for q_num, q_content in q_blocks:
            # 提取选项（缩进的 A) B) C) D)）
            options_pattern = r'\n\s*([A-D])\)\s+(.+?)(?=\n\s*[A-D]\)|$)'
            options = re.findall(options_pattern, q_content)
            
            if len(options) >= 4:
                # 提取问题文本（去掉选项部分）
                question_text = re.sub(r'\n\s*[A-D]\)\s+.+?', '', q_content).strip()
                question_text = re.sub(r'\s+', ' ', question_text)
                
                questions.append({
                    'passage': passage_name,
                    'question_num': q_num,
                    'question': question_text,
                    'options': [opt[1].strip() for opt in options[:4]],
                    'correct_answer': -1  # 需要手动添加答案
                })
    
    return questions

def process_all_cet_files():
    """处理所有CET文件"""
    base_dir = Path(__file__).parent.parent
    data_dir = base_dir / 'data' / 'english-exem-md'
    output_dir = base_dir / 'quiz_data'
    
    output_dir.mkdir(exist_ok=True)
    
    all_questions = {}
    
    for cet_type in ['CET4', 'CET6']:
        cet_dir = data_dir / cet_type
        if not cet_dir.exists():
            continue
        
        for month_dir in cet_dir.iterdir():
            if not month_dir.is_dir():
                continue
            
            for md_file in month_dir.glob('*.md'):
                print(f"处理 {cet_type} {month_dir.name} {md_file.name}...")
                
                with open(md_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                questions = extract_reading_questions(content)
                
                if questions:
                    key = f"{cet_type}_{month_dir.name}_{md_file.stem}"
                    all_questions[key] = questions
                    print(f"  ✓ 提取到 {len(questions)} 道题目")
    
    # 保存题目数据
    output_file = output_dir / 'cet_questions.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    
    total_questions = sum(len(q) for q in all_questions.values())
    print(f"\n✅ 共提取 {total_questions} 道题目，保存到 {output_file}")

if __name__ == '__main__':
    process_all_cet_files()
