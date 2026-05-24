#!/usr/bin/env python3
import os
import re
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

MIN_WORDS = 550
TARGET_COUNT = 200

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

CATEGORIES = {
    "culture": ["culture", "art", "music", "film", "literature", "society", "life", "people"],
    "science": ["science", "technology", "environment", "nature", "space", "medical", "health", "climate"],
    "society": ["politics", "economy", "business", "education", "social", "history", "world", "news"],
    "sports": ["sport", "football", "olympic", "game", "player", "team", "match", "championship"],
    "nature": ["animal", "plant", "climate", "weather", "ocean", "forest", "ecology", "species"]
}

def count_words(text):
    words = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", text)
    return len(words)

def slugify(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s]+", "-", text)
    text = re.sub(r"-+", "-", text)
    text = text.strip("-")
    return text[:60]

def get_category(title, content):
    text = (title + " " + content).lower()
    for category, keywords in CATEGORIES.items():
        for keyword in keywords:
            if keyword in text:
                return category
    return "Culture"

def fetch_page(url, timeout=15):
    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def scrape_linguapress():
    output_dir = "articles/linguapress"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Scraping Linguapress articles...")
    print(f"Minimum words: {MIN_WORDS}, Target: {TARGET_COUNT}")
    print("-" * 60)
    
    base_url = "https://linguapress.com"
    
    categories = [
        "intermediate/grammar/",
        "intermediate/idioms/",
        "intermediate/vocabulary/",
        "advanced/grammar/",
        "advanced/idioms/",
        "advanced/vocabulary/"
    ]
    
    all_article_urls = []
    
    for category_path in categories:
        url = urljoin(base_url, category_path)
        print(f"Fetching category: {category_path}")
        
        html = fetch_page(url)
        if not html:
            continue
        
        soup = BeautifulSoup(html, "html.parser")
        
        links = soup.find_all("a", href=True)
        for link in links:
            href = link["href"]
            if href.startswith("/") and not href.startswith("//"):
                href = urljoin(base_url, href)
            if href.startswith("http") and href not in all_article_urls:
                if "linguapress.com" in href:
                    all_article_urls.append(href)
        
        time.sleep(1)
    
    all_article_urls = list(set(all_article_urls))
    print(f"Found {len(all_article_urls)} article URLs")
    
    imported = 0
    for i, url in enumerate(all_article_urls[:TARGET_COUNT * 2]):
        if imported >= TARGET_COUNT:
            break
        
        print(f"Processing {i+1}/{min(len(all_article_urls), TARGET_COUNT * 2)}: {url[:60]}...")
        
        html = fetch_page(url)
        if not html:
            continue
        
        soup = BeautifulSoup(html, "html.parser")
        
        title_tag = soup.find("h1") or soup.find("h2") or soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else "Untitled"
        title = re.sub(r"\s*-\s*Linguapress.*$", "", title)
        title = re.sub(r"\s*\|.*$", "", title)
        
        article_body = soup.find("article") or soup.find("div", class_=re.compile(r"content|article|body|post|entry"))
        if not article_body:
            content_divs = soup.find_all("div")
            for div in content_divs:
                if len(div.find_all("p")) > 3:
                    article_body = div
                    break
        
        if article_body:
            paragraphs = article_body.find_all("p")
            content = "\n\n".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
        else:
            paragraphs = soup.find_all("p")
            content = "\n\n".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
        
        word_count = count_words(content)
        if word_count < MIN_WORDS:
            print(f"  Skipping (only {word_count} words)")
            continue
        
        category = get_category(title, content)
        slug = slugify(title)
        
        filename = f"{slug}.md"
        filepath = os.path.join(output_dir, filename)
        counter = 1
        while os.path.exists(filepath):
            filename = f"{slug}-{counter}.md"
            filepath = os.path.join(output_dir, filename)
            counter += 1
        
        frontmatter = f"""---
title: "{title}"
slug: "{filename[:-3]}"
category: "{category.title()}"
difficulty: "Evening Read"
source: "Linguapress"
license: "Free for educational use"
word_count: {word_count}
url: "{url}"
---

"""
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(frontmatter)
            f.write(content)
        
        imported += 1
        print(f"  Imported: {title[:40]}... ({word_count} words)")
        
        time.sleep(0.5)
    
    print("\n" + "=" * 60)
    print("Linguapress import completed!")
    print(f"Successfully imported: {imported}")
    print("=" * 60)
    
    return imported

if __name__ == "__main__":
    count = scrape_linguapress()
