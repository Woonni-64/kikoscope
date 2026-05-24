import os
import re
import json

def import_from_json(json_path, articles_dir, quiz_data_dir):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    all_quiz_data = []
    
    for passage in data.get('passages', []):
        title = passage.get('title', f"IELTS Reading Passage {passage.get('passage_number', 1)}")
        content = passage.get('content', '')
        
        if len(content) < 200:
            continue
        
        slug = re.sub(r'[^a-zA-Z0-9]+', '-', title)[:50].lower().strip('-')
        slug = f"ielts-{slug}"
        
        summary = content[:150].replace('\n', ' ').replace('"', "'")
        
        article_content = f"""---
title: "{title}"
category: "雅思"
difficulty: "{data.get('difficulty', '7')}"
summary: "{summary}..."
source: "雅思"
---

{content}
"""
        
        article_path = os.path.join(articles_dir, f"{slug}.md")
        
        if not os.path.exists(article_path):
            with open(article_path, 'w', encoding='utf-8') as f:
                f.write(article_content)
            print(f"Created article: {slug}.md")
        
        quiz_entry = {
            'quizKey': slug,
            'title': title,
            'passage': content,
            'questions': []
        }
        
        for q_group in passage.get('question_groups', []):
            for q in q_group.get('questions', []):
                quiz_entry['questions'].append({
                    'type': q_group.get('question_type', 'unknown'),
                    'text': q.get('text', ''),
                    'answer': q.get('answer', ''),
                    'options': q.get('accepted_answers', []),
                    'instructions': q_group.get('instructions', '')
                })
        
        all_quiz_data.append(quiz_entry)
    
    return all_quiz_data

def main():
    base_path = "data/imported_ielts/ielts-ai-dataset"
    articles_dir = "articles"
    quiz_data_dir = "quiz_data"
    
    os.makedirs(articles_dir, exist_ok=True)
    os.makedirs(quiz_data_dir, exist_ok=True)
    
    json_files = []
    for root, dirs, files in os.walk(base_path):
        for f in files:
            if f.endswith('.json') and 'reading' in root.lower():
                json_files.append(os.path.join(root, f))
    
    print(f"Found {len(json_files)} reading JSON files")
    
    all_quiz_data = []
    
    for json_file in json_files:
        print(f"\nProcessing: {os.path.basename(json_file)}")
        quiz_entries = import_from_json(json_file, articles_dir, quiz_data_dir)
        all_quiz_data.extend(quiz_entries)
        print(f"  Added {len(quiz_entries)} passages")
    
    with open(os.path.join(quiz_data_dir, "ielts_ai_quiz_data.json"), 'w', encoding='utf-8') as f:
        json.dump(all_quiz_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nTotal passages imported: {len(all_quiz_data)}")

if __name__ == "__main__":
    main()