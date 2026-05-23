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

def fetch_page(url, timeout=15):
    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def scrape_newsinlevels():
    output_dir = "articles/newsinlevels"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Scraping News in Levels (Level 3) articles...")
    print(f"Minimum words: {MIN_WORDS}, Target: {TARGET_COUNT}")
    print("-" * 60)
    
    base_url = "https://www.newsinlevels.com"
    level3_url = urljoin(base_url, "/level-3/")
    
    print(f"Fetching Level 3 index: {level3_url}")
    
    html = fetch_page(level3_url)
    if not html:
        print("Failed to fetch Level 3 index")
        return 0
    
    soup = BeautifulSoup(html, "html.parser")
    
    article_urls = []
    links = soup.find_all("a", href=True)
    
    for link in links:
        href = link["href"]
        if "level-3" in href.lower() or href.startswith("/"):
            if href.startswith("/"):
                href = urljoin(base_url, href)
            if "level-3" in href and href not in article_urls:
                article_urls.append(href)
    
    article_urls = list(set(article_urls))
    print(f"Found {len(article_urls)} Level 3 article URLs")
    
    imported = 0
    for i, url in enumerate(article_urls[:TARGET_COUNT * 2]):
        if imported >= TARGET_COUNT:
            break
        
        print(f"Processing {i+1}/{len(article_urls[:TARGET_COUNT * 2])}: {url[:60]}...")
        
        html = fetch_page(url)
        if not html:
            continue
        
        soup = BeautifulSoup(html, "html.parser")
        
        title_tag = soup.find("h1") or soup.find("h2") or soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else "Untitled"
        title = re.sub(r"\s*-\s*News in Levels.*$", "", title)
        
        content_div = soup.find("div", class_=re.compile(r"content|article|main|post|entry"))
        if not content_div:
            content_div = soup.find("article") or soup.find("main")
        
        if content_div:
            paragraphs = content_div.find_all("p")
        else:
            paragraphs = soup.find_all("p")
        
        content = "\n\n".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
        
        word_count = count_words(content)
        if word_count < MIN_WORDS:
            print(f"  Skipping (only {word_count} words)")
            continue
        
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
category: "News"
difficulty: "Evening Read"
source: "News in Levels"
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
    print("News in Levels import completed!")
    print(f"Successfully imported: {imported}")
    print("=" * 60)
    
    return imported

if __name__ == "__main__":
    count = scrape_newsinlevels()
