#!/usr/bin/env python3
import os
import re
import time
import signal
import wikipedia
from datetime import datetime
from multiprocessing import Pool, cpu_count

MIN_WORDS = 550
MAX_WORDS = 3000
TARGET_COUNT = 500

KEYWORDS = [
    'science', 'technology', 'environment', 'psychology', 'society', 'health',
    'history', 'nature', 'climate', 'space', 'animal', 'human', 'research',
    'education', 'culture', 'economic', 'political', 'global', 'energy',
    'ocean', 'disease', 'medicine', 'computer', 'internet', 'robot', 'ancient',
    'modern', 'future', 'theory', 'experiment'
]

wikipedia.set_lang("simple")

class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError("Request timed out")

def count_words(text):
    words = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", text)
    return len(words)

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s]+", "-", text)
    text = re.sub(r"-+", "-", text)
    text = text.strip("-")
    if len(text) > 60:
        text = text[:60]
    return text

def get_difficulty(word_count):
    if word_count <= 1500:
        return "Evening Read"
    else:
        return "Deep Read"

def matches_keywords(title, content):
    text = (title + " " + content).lower()
    matched = []
    for keyword in KEYWORDS:
        if keyword in text:
            matched.append(keyword)
    return matched if matched else None

def create_frontmatter(title, slug, category, difficulty, word_count):
    return f'''---
title: "{title}"
slug: "{slug}"
category: "{category}"
difficulty: "{difficulty}"
source: "Simple Wikipedia"
license: "CC BY-SA"
word_count: {word_count}
---
'''

def clean_content(content):
    content = re.sub(r"\[\[File:.*?\]\]", "", content, flags=re.IGNORECASE)
    content = re.sub(r"\[\[Image:.*?\]\]", "", content, flags=re.IGNORECASE)
    content = re.sub(r"\[\[([^|\]]+?)\]\]", r"\1", content)
    content = re.sub(r"\[\[([^|]+?)\|([^\]]+?)\]\]", r"\2", content)
    content = re.sub(r"\{\{[^}]+\}\}", "", content)
    content = re.sub(r"=+\s*[^=]+\s*=", "", content)
    content = re.sub(r"''+", "", content)
    content = re.sub(r"\n\n+", "\n\n", content)
    content = content.strip()
    return content

def process_article(args):
    title, output_dir = args
    try:
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(10)
        
        page = wikipedia.page(title)
        content = clean_content(page.content)
        word_count = count_words(content)
        
        signal.alarm(0)
        
        if word_count < MIN_WORDS or word_count > MAX_WORDS:
            return None
        
        matched_keywords = matches_keywords(title, content)
        if not matched_keywords:
            return None
        
        category = matched_keywords[0]
        slug = slugify(title)
        difficulty = get_difficulty(word_count)
        
        filename = f"{slug}.md"
        filepath = os.path.join(output_dir, filename)
        
        counter = 1
        while os.path.exists(filepath):
            filename = f"{slug}-{counter}.md"
            filepath = os.path.join(output_dir, filename)
            counter += 1
        
        frontmatter = create_frontmatter(
            title, 
            filename[:-3],
            category.title(),
            difficulty,
            word_count
        )
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(frontmatter)
            f.write(content)
        
        return {
            "title": title,
            "word_count": word_count,
            "category": category
        }
        
    except (TimeoutError, wikipedia.exceptions.DisambiguationError, wikipedia.exceptions.PageError):
        return None
    except Exception as e:
        return None
    finally:
        signal.alarm(0)

def import_wikipedia():
    output_dir = "articles/simplewiki"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Searching Simple Wikipedia for articles...")
    print(f"Keywords: {', '.join(KEYWORDS)}")
    print(f"Word count range: {MIN_WORDS}-{MAX_WORDS}")
    print(f"Target: {TARGET_COUNT} articles")
    print("-" * 60)
    
    all_titles = set()
    
    for term in KEYWORDS:
        try:
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(5)
            results = wikipedia.search(term, results=10)
            signal.alarm(0)
            all_titles.update(results)
        except (TimeoutError, Exception):
            signal.alarm(0)
            continue
    
    print(f"Found {len(all_titles)} potential articles to process")
    
    args_list = [(title, output_dir) for title in all_titles]
    
    imported = 0
    imported_articles = []
    
    for args in args_list:
        if imported >= TARGET_COUNT:
            break
        
        result = process_article(args)
        
        if result:
            imported += 1
            imported_articles.append(result)
            
            if imported % 50 == 0:
                print(f"Progress: {imported}/{TARGET_COUNT} articles imported")
        
        time.sleep(0.2)
    
    print("\n" + "=" * 60)
    print("Import completed!")
    print(f"Successfully imported: {imported}")
    print("=" * 60)
    
    if imported_articles:
        print("\nSample articles imported:")
        for article in imported_articles[:5]:
            print(f"  - {article['title']} ({article['word_count']} words, {article['category']})")
    
    return imported

if __name__ == "__main__":
    count = import_wikipedia()
