import os
import re
import json
import pdfplumber

def extract_text_from_pdf(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
            return text.strip()
    except Exception as e:
        print(f"Error extracting {pdf_path}: {e}")
        return ""

def clean_filename(name):
    name = re.sub(r'[\\/*?:"<>|]', '', name)
    name = re.sub(r'\s+', '-', name)
    return name[:100]

def extract_reading_passages(text):
    passages = []
    
    patterns = [
        r'(Reading\s+Passage\s+\d+\s*[:：]?\s*.*?)(?=\n\nReading\s+Passage\s+\d+|\n\nQuestions?\s+\d+|\n\nSection\s+\d+|\Z)',
        r'(Passage\s+\d+\s*[:：]?\s*.*?)(?=\n\nPassage\s+\d+|\n\nQuestions?\s+\d+|\n\nSection\s+\d+|\Z)',
        r'(READING\s+PASSAGE\s+\d+\s*[:：]?\s*.*?)(?=\n\nREADING\s+PASSAGE\s+\d+|\n\nQuestions?\s+\d+|\Z)',
        r'(READING\s+PASSAGE\s+\d+\n\n.*?)(?=\n\nREADING\s+PASSAGE\s+\d+|\n\nQuestions\s+\d+|\Z)',
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.DOTALL | re.IGNORECASE)
        for match in matches:
            content = match.group(1).strip()
            if len(content) > 500:
                lines = content.split('\n')
                title = lines[0] if lines else f"Passage {len(passages)+1}"
                
                if re.match(r'^Reading\s+Passage\s+\d+', title, re.IGNORECASE):
                    if len(lines) > 1:
                        title = lines[1].strip()
                
                passages.append({
                    'title': title.strip(),
                    'content': content
                })
    
    if not passages:
        sections = re.split(r'(?:Reading\s+)?Passage\s+\d+\s*[:：]?', text, flags=re.IGNORECASE)
        for i, section in enumerate(sections[1:], 1):
            section = section.strip()
            if len(section) > 500:
                lines = section.split('\n')
                title = lines[0].strip() if lines else f"Passage {i}"
                
                if title.lower() in ['questions', 'section', 'reading'] or len(title) < 3:
                    title = f"IELTS Reading Passage {i}"
                
                passages.append({
                    'title': title,
                    'content': section
                })
    
    return passages

def clean_passage_content(content):
    lines = content.split('\n')
    cleaned_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        if re.match(r'^\d+$', stripped):
            continue
        
        if re.match(r'^Questions?\s+\d+[-–—]\s*\d+', stripped, re.IGNORECASE):
            break
        
        if re.match(r'^You should spend about \d+ minutes', stripped, re.IGNORECASE):
            continue
        
        if re.match(r'^Write NO MORE THAN', stripped, re.IGNORECASE):
            continue
        
        if stripped.lower() in ['questions', 'reading', 'passage', 'section']:
            continue
        
        if len(stripped) > 0:
            cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines).strip()

def main():
    base_path = "data/imported_ielts"
    output_dir = "data/imported_ielts/extracted_full"
    articles_dir = "articles"
    
    os.makedirs(output_dir, exist_ok=True)
    
    all_passages = []
    
    pdf_files = []
    for root, dirs, files in os.walk(base_path):
        if ".git" in root:
            continue
        for f in files:
            if f.lower().endswith(".pdf") and ("剑桥" in f or "cambridge" in f.lower() or "ielts" in f.lower()):
                pdf_files.append(os.path.join(root, f))
    
    print(f"Found {len(pdf_files)} IELTS PDF files")
    
    for pdf_path in pdf_files:
        print(f"\nProcessing: {os.path.basename(pdf_path)}")
        text = extract_text_from_pdf(pdf_path)
        
        if not text:
            print("  No text extracted")
            continue
        
        passages = extract_reading_passages(text)
        print(f"  Found {len(passages)} passages")
        
        source_name = os.path.splitext(os.path.basename(pdf_path))[0]
        
        for i, passage in enumerate(passages, 1):
            cleaned_content = clean_passage_content(passage['content'])
            
            if len(cleaned_content) < 300:
                continue
            
            article_slug = f"ielts-full-{clean_filename(source_name)}-{i}"
            article_slug = article_slug[:80].lower()
            
            summary = cleaned_content[:150].replace('\n', ' ').replace('"', "'")
            
            article_content = f"""---
title: "{passage['title']}"
category: "雅思"
difficulty: "7"
summary: "{summary}..."
source: "雅思"
---

{cleaned_content}
"""
            
            article_path = os.path.join(articles_dir, f"{article_slug}.md")
            
            if not os.path.exists(article_path):
                with open(article_path, 'w', encoding='utf-8') as f:
                    f.write(article_content)
                print(f"  Created: {article_slug}.md")
                all_passages.append({
                    'source': source_name,
                    'title': passage['title'],
                    'slug': article_slug
                })
    
    with open(os.path.join(output_dir, "all_passages.json"), 'w', encoding='utf-8') as f:
        json.dump(all_passages, f, ensure_ascii=False, indent=2)
    
    print(f"\nTotal passages extracted: {len(all_passages)}")

if __name__ == "__main__":
    main()