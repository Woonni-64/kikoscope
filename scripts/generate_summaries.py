#!/usr/bin/env python3
"""
分析文章内容，生成一句话摘要
"""

from pathlib import Path
import re

# 简单的内容分析关键词
CATEGORY_KEYWORDS = {
    '科技': ['technology', 'science', 'computer', 'internet', 'robot', 'digital', 'software', 'app', 'online', 'data', 'electronic', 'machine', 'innovation', 'scientific', 'research'],
    '教育': ['education', 'school', 'student', 'teacher', 'learning', 'study', 'academic', 'college', 'university', 'class', 'lesson', 'exam', 'test', 'homework', 'knowledge', 'teach'],
    '历史': ['history', 'historical', 'war', 'ancient', 'century', 'era', 'civilization', 'empire', 'king', 'queen', 'dynasty', 'revolution', 'battle', 'past'],
    '文学': ['story', 'novel', 'fiction', 'tale', 'narrative', 'character', 'plot', 'author', 'writer', 'book', 'chapter', 'literary', 'poetry', 'poem', 'story'],
    '社会': ['society', 'social', 'community', 'people', 'population', 'economy', 'economic', 'politics', 'political', 'government', 'policy', 'culture', 'life'],
    '环境': ['environment', 'climate', 'nature', 'animal', 'plant', 'ecology', 'ecological', 'ocean', 'forest', 'wildlife', 'conservation', 'pollution', 'earth'],
    '健康': ['health', 'medical', 'medicine', 'doctor', 'hospital', 'disease', 'treatment', 'patient', 'healthcare', 'wellness', 'fitness', 'exercise', 'body'],
    '商业': ['business', 'company', 'industry', 'market', 'trade', 'commerce', 'enterprise', 'corporate', 'investment', 'financial', 'bank', 'economy', 'money'],
    '体育': ['sport', 'game', 'football', 'basketball', 'soccer', 'tennis', 'player', 'team', 'championship', 'olympic', 'fitness', 'competition', 'match'],
    '艺术': ['art', 'music', 'painting', 'artist', 'gallery', 'museum', 'cultural', 'performance', 'theater', 'dance', 'creative', 'culture', 'movie', 'film'],
}

def extract_first_sentence(text):
    """提取第一句话"""
    # 去掉开头可能的空格和换行
    text = text.strip()
    # 找到第一个句子结束符
    match = re.search(r'[.!?]\s+', text)
    if match:
        first_sentence = text[:match.end()].strip()
        # 如果太长，截取前100个字符
        if len(first_sentence) > 100:
            first_sentence = first_sentence[:100].rsplit(' ', 1)[0] + '...'
        return first_sentence
    # 如果没有句子结束符，取前100个字符
    if len(text) > 100:
        return text[:100].rsplit(' ', 1)[0] + '...'
    return text

def analyze_and_summarize(content, title):
    """分析文章内容，生成一句话摘要"""
    # 去掉frontmatter
    lines = content.split('\n')
    body_lines = []
    in_frontmatter = False
    frontmatter_count = 0

    for line in lines:
        if line.strip() == '---':
            frontmatter_count += 1
            if frontmatter_count == 1:
                in_frontmatter = True
            elif frontmatter_count == 2:
                in_frontmatter = False
            continue
        if not in_frontmatter:
            body_lines.append(line)

    body = ' '.join(body_lines).strip()

    if not body:
        return f"关于{title}的文章"

    # 提取第一句话作为摘要
    summary = extract_first_sentence(body)

    # 确保首字母大写
    if summary and summary[0].islower():
        summary = summary[0].upper() + summary[1:]

    return summary

def process_articles():
    """处理所有文章"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    updated = 0

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 提取frontmatter
            parts = content.split('---')
            if len(parts) < 3:
                continue

            frontmatter_str = parts[1]
            body = '---'.join(parts[2:])

            # 解析frontmatter
            frontmatter = {}
            for line in frontmatter_str.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    frontmatter[key] = value

            title = frontmatter.get('title', '')

            # 分析内容生成摘要
            summary = analyze_and_summarize(body, title)

            # 更新frontmatter中的summary
            frontmatter['summary'] = summary

            # 重新构建文件
            output = ['---']
            for k, v in frontmatter.items():
                output.append(f'{k}: "{v}"')
            output.append('---')
            output.append(body)

            # 写回
            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))

            updated += 1

            if updated <= 5:
                print(f"更新: {title[:40]}...")
                print(f"  摘要: {summary[:60]}...")

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n处理完成!")
    print(f"共处理: {updated} 篇文章")

if __name__ == '__main__':
    process_articles()
