import os
import re
import json
import pdfplumber
from pathlib import Path

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

def find_cambridge_pdfs(base_path):
    pdfs = []
    for root, dirs, files in os.walk(base_path):
        if ".git" in root:
            continue
        for f in files:
            if f.lower().endswith(".pdf") and ("剑桥" in f or "cambridge" in f.lower() or "ielts" in f.lower()):
                pdfs.append(os.path.join(root, f))
    return pdfs

def parse_ielts_reading(text):
    passages = []
    questions = []
    
    patterns = {
        'passage': re.compile(r'(Passage\s*\d+|Section\s*\d+)\s*[:：]\s*(.*?)(?=\n\nPassage|\n\nSection|\n\nQuestions|\Z)', re.DOTALL),
        'questions': re.compile(r'(Questions?\s*\d+[-–—]\s*\d+|Questions?\s*\d+\s*[-–—]\s*\d+)\s*(.*?)(?=\n\nPassage|\n\nSection|\n\nQuestions|\Z)', re.DOTALL),
        'q_type': re.compile(r'(TRUE/FALSE/NOT GIVEN|YES/NO/NOT GIVEN|Multiple Choice|Matching|Summary|Sentence Completion)')
    }
    
    for match in patterns['passage'].finditer(text):
        passages.append({
            'title': match.group(2).strip() if match.group(2) else f"Passage {len(passages)+1}",
            'content': match.group(0)
        })
    
    for match in patterns['questions'].finditer(text):
        questions.append({
            'range': match.group(1),
            'content': match.group(2).strip()
        })
    
    return passages, questions

def main():
    base_path = "data/imported_ielts"
    output_dir = "data/imported_ielts/extracted"
    os.makedirs(output_dir, exist_ok=True)
    
    pdfs = find_cambridge_pdfs(base_path)
    print(f"Found {len(pdfs)} IELTS PDF files")
    
    all_data = []
    
    for i, pdf_path in enumerate(pdfs):
        print(f"Processing {i+1}/{len(pdfs)}: {os.path.basename(pdf_path)}")
        text = extract_text_from_pdf(pdf_path)
        
        if not text:
            print(f"  No text extracted from {pdf_path}")
            continue
        
        passages, questions = parse_ielts_reading(text)
        
        base_name = clean_filename(os.path.splitext(os.path.basename(pdf_path))[0])
        
        text_output = os.path.join(output_dir, f"{base_name}.txt")
        with open(text_output, 'w', encoding='utf-8') as f:
            f.write(text)
        
        data = {
            'filename': os.path.basename(pdf_path),
            'passages': passages,
            'questions': questions,
            'text_length': len(text)
        }
        all_data.append(data)
        
        print(f"  Extracted {len(passages)} passages, {len(questions)} question groups")
    
    with open(os.path.join(output_dir, "ielts_data.json"), 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nExtraction complete! Results saved to {output_dir}")

if __name__ == "__main__":
    main()