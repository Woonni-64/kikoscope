import os
import re

CATEGORY_KEYWORDS = {
    '科技': ['technology', 'computer', 'internet', 'software', 'AI', 'artificial intelligence', 'machine learning', 'robot', 'digital', 'innovation', 'tech', 'science', 'scientific', 'research', 'discovery', 'invention', 'engineering', 'engineer', 'technology', 'electronic', 'data', 'algorithm', 'network', 'system'],
    '教育': ['education', 'school', 'university', 'student', 'learning', 'teaching', 'study', 'academic', 'knowledge', 'curriculum', 'degree', 'course', 'exam', 'training', 'teacher', 'professor', 'campus', 'education', 'educational'],
    '历史': ['history', 'ancient', 'century', 'past', 'king', 'empire', 'civilization', 'culture', 'tradition', 'museum', 'archaeology', 'historical', 'heritage', 'monument', 'temple', 'castle', 'dynasty', 'war', 'revolution'],
    '自然': ['nature', 'environment', 'ecology', 'wildlife', 'animal', 'plant', 'forest', 'ocean', 'climate', 'weather', 'natural', 'species', 'ecosystem', 'biodiversity', 'conservation', 'pollution', 'earth', 'planet'],
    '健康': ['health', 'medical', 'medicine', 'disease', 'hospital', 'doctor', 'patient', 'treatment', 'therapy', 'pharmaceutical', 'healthcare', 'wellness', 'fitness', 'nutrition', 'mental', 'physical', 'illness', 'sickness'],
    '商业': ['business', 'economy', 'market', 'company', 'corporation', 'finance', 'investment', 'money', 'trade', 'industry', 'market', 'consumer', 'profit', 'sales', 'management', 'entrepreneur', 'startup', 'stock'],
    '社会': ['society', 'social', 'community', 'people', 'population', 'culture', 'tradition', 'human', 'life', 'family', 'government', 'policy', 'law', 'rights', 'democracy', 'politics', 'justice', 'equality'],
    '艺术': ['art', 'music', 'painting', 'literature', 'theater', 'film', 'museum', 'gallery', 'artist', 'creative', 'design', 'architecture', 'poetry', 'novel', 'opera', 'dance', 'photography', 'sculpture'],
    '体育': ['sport', 'football', 'basketball', 'olympics', 'athlete', 'competition', 'game', 'match', 'team', 'player', 'training', 'championship', 'tournament', 'record', 'world cup'],
    '环境': ['environment', 'climate', 'pollution', 'conservation', 'sustainability', 'green', 'recycle', 'energy', 'carbon', 'global warming', 'ecology', 'natural resources', 'waste', 'emission'],
    '其他': []
}

def analyze_content_category(content):
    content_lower = content.lower()
    category_scores = {}
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        if category == '其他':
            continue
        score = sum(1 for kw in keywords if kw.lower() in content_lower)
        if score > 0:
            category_scores[category] = score
    
    return max(category_scores, key=category_scores.get) if category_scores else '其他'

def clean_directions(content):
    patterns_to_remove = [
        r'You should spend about \d+ minutes on Questions? \d+[-–—]\d+\.',
        r'Read the text below and answer Questions? \d+[-–—]\d+\.',
        r'Read the passage below and answer the questions\.',
        r'Questions? \d+[-–—]\d+\s*',
        r'Answer the questions\.',
        r'This section contains\s+\d+\s+questions?\.?',
        r'Write your answers in boxes? \d+ to \d+ on your answer sheet\.?',
        r'Choose the correct letter,\s*[A-Z](?:, [A-Z])*(?: or [A-Z])?\.?',
        r'Write NO MORE THAN (THREE|TWO|ONE) WORDS(?: AND/OR A NUMBER)? for each answer\.?',
        r'Write ONE WORD ONLY for each answer\.?',
        r'Complete the sentences below\.?',
        r'Complete the summary below\.?',
        r'Complete the table below\.?',
        r'Complete the notes below\.?',
        r'Label the diagram below\.?',
        r'Which paragraph contains the following information\?',
        r'Match each statement with the correct person\.?',
        r'Do the following statements agree with the information given\?',
        r'YES|NO|NOT GIVEN|TRUE|FALSE',
        r'Choose TWO letters\.\s*',
        r'Choose THREE letters\.\s*',
        r'Write your answers in the spaces provided\.',
        r'Section \d+\s*',
        r'Test \d+\s*',
        r'Questions \d+\s*',
    ]
    
    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE)
    
    lines = content.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if len(stripped) < 5 and (stripped.isdigit() or stripped.count('.') == 1 and stripped.replace('.', '').isdigit()):
            continue
        if stripped.lower() in ['section', 'questions', 'passage', 'reading', 'listening']:
            continue
        if 'minute' in stripped.lower() and 'spend' in stripped.lower():
            continue
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines).strip()

def process_article(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if not content.startswith('---'):
        return
    
    end_frontmatter = content.find('\n---\n')
    if end_frontmatter == -1:
        return
    
    frontmatter = content[:end_frontmatter + 5]
    body = content[end_frontmatter + 5:].strip()
    
    cleaned_body = clean_directions(body)
    
    category = analyze_content_category(cleaned_body)
    
    title = frontmatter.split('title:')[1].split('"')[1]
    summary_text = cleaned_body[:150].replace('\n', ' ').replace('"', "'")
    new_frontmatter = f"""---
title: "{title}"
category: "{category}"
difficulty: "7"
summary: "{summary_text}..."
source: "雅思"
---

{cleaned_body}
"""
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_frontmatter)
    
    return category

def main():
    articles_dir = "articles"
    category_counts = {}
    
    for filename in os.listdir(articles_dir):
        if not filename.startswith('ielts-') or not filename.endswith('.md'):
            continue
        
        file_path = os.path.join(articles_dir, filename)
        category = process_article(file_path)
        
        if category:
            category_counts[category] = category_counts.get(category, 0) + 1
            print(f"Processed: {filename} -> {category}")
    
    print("\n分类统计:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count} 篇")

if __name__ == "__main__":
    main()