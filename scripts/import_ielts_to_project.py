import os
import re
import json
from datetime import datetime

def parse_ielts_reading_text(text):
    passages = []
    questions = []
    
    reading_sections = re.split(r'READING\s+PASSAGE\s+\d+', text)
    
    for i, section in enumerate(reading_sections[1:], 1):
        section = section.strip()
        if not section:
            continue
        
        content_end = section.find('\n\nQuestions ')
        if content_end == -1:
            content_end = section.find('\n\nQuestions\n')
        if content_end == -1:
            content_end = section.find('\n\nChoose ')
        if content_end == -1:
            content_end = len(section)
        
        passage_content = section[:content_end].strip()
        question_content = section[content_end:].strip()
        
        lines = passage_content.split('\n')
        title = lines[0] if lines else f"IELTS Reading Passage {i}"
        
        if len(passage_content) > 100:
            passages.append({
                'id': f'ielts-passage-{i}',
                'title': title,
                'content': passage_content,
                'section': i
            })
        
        if question_content:
            questions.append({
                'passage_id': f'ielts-passage-{i}',
                'content': question_content
            })
    
    return passages, questions

def parse_questions(question_text):
    parsed = []
    q_patterns = [
        (r'(TRUE/FALSE/NOT GIVEN|YES/NO/NOT GIVEN)', 'tfng'),
        (r'Multiple Choice', 'multiple_choice'),
        (r'Matching', 'matching'),
        (r'Summary', 'summary'),
        (r'Sentence Completion', 'sentence_completion'),
        (r'Choose the correct letter', 'multiple_choice')
    ]
    
    for pattern, q_type in q_patterns:
        if re.search(pattern, question_text):
            parsed.append({'type': q_type, 'content': question_text})
            break
    
    if not parsed:
        parsed.append({'type': 'unknown', 'content': question_text})
    
    return parsed

def create_article_md(passage, source="Cambridge IELTS"):
    summary = passage['content'][:200].replace('\n', ' ') + '...' if len(passage['content']) > 200 else passage['content']
    
    frontmatter = f"""---
title: "{passage['title']}"
category: "雅思"
difficulty: "7"
summary: "{summary}"
source: "{source}"
---

{passage['content']}
"""
    return frontmatter

def main():
    extracted_dir = "data/imported_ielts/extracted"
    articles_dir = "articles"
    quiz_data_dir = "quiz_data"
    
    os.makedirs(articles_dir, exist_ok=True)
    os.makedirs(quiz_data_dir, exist_ok=True)
    
    all_quiz_data = []
    
    for txt_file in os.listdir(extracted_dir):
        if not txt_file.endswith('.txt') or txt_file == 'ielts_data.json':
            continue
        
        txt_path = os.path.join(extracted_dir, txt_file)
        with open(txt_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        if 'READING PASSAGE' not in text:
            continue
        
        passages, questions = parse_ielts_reading_text(text)
        print(f"Processing {txt_file}: {len(passages)} passages, {len(questions)} question groups")
        
        source_name = txt_file.replace('.txt', '').replace('.pdf', '')
        
        for passage in passages:
            article_slug = f"ielts-{passage['section']}-{re.sub(r'[^a-zA-Z0-9]+', '-', passage['title'])[:50]}".lower()
            article_slug = re.sub(r'-+', '-', article_slug).strip('-')
            
            article_content = create_article_md(passage, source=source_name)
            article_path = os.path.join(articles_dir, f"{article_slug}.md")
            
            if not os.path.exists(article_path):
                with open(article_path, 'w', encoding='utf-8') as f:
                    f.write(article_content)
                print(f"  Created article: {article_slug}")
            
            quiz_entry = {
                'quizKey': article_slug,
                'title': passage['title'],
                'passage': passage['content'],
                'questions': parse_questions(questions[passage['section']-1]['content']) if passage['section'] <= len(questions) else []
            }
            all_quiz_data.append(quiz_entry)
    
    quiz_data_path = os.path.join(quiz_data_dir, "ielts_quiz_data.json")
    with open(quiz_data_path, 'w', encoding='utf-8') as f:
        json.dump(all_quiz_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nImport completed! Created {len(all_quiz_data)} articles and quiz entries")

if __name__ == "__main__":
    main()