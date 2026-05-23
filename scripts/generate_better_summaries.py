#!/usr/bin/env python3
"""
生成文章梗概 - 总结文章主要内容
"""

from pathlib import Path
import re

# 常见主题关键词映射
TOPIC_PATTERNS = {
    '教育': {
        'keywords': ['student', 'school', 'teacher', 'education', 'learning', 'study', 'exam', 'college', 'university'],
        'patterns': [
            (r'(\w+)\s+(?:students?|children|kids)\s+(?:learn|study|are)\s+([^.]+)', r'\1的学生\2'),
            (r'(?:The\s+)?(\w+)\s+(?:is|are)\s+(?:teaching|learning)\s+([^.]+)', r'关于\1的教学'),
            (r'(\w+)\s+(?:passed|took|failed)\s+(?:the\s+)?exam', r'\1考试相关的故事'),
        ]
    },
    '科技': {
        'keywords': ['technology', 'science', 'computer', 'internet', 'robot', 'digital', 'research', 'scientist'],
        'patterns': [
            (r'(?:Scientists?|Researchers?)\s+([^.]+?)(?:discovered|found|developed|created|made)', r'科学家\1'),
            (r'(?:The\s+)?(\w+)\s+(?:is|are)\s+(?:a\s+)?(?:new|latest)?\s*([^.]+?)(?:technology|invention|device)', r'\1的\2技术'),
        ]
    },
    '社会': {
        'keywords': ['people', 'society', 'community', 'family', 'friend', 'life', 'work', 'job'],
        'patterns': [
            (r'(\w+)\s+(?:has|have)\s+a\s+(?:new|great|important)\s+([^.]+)', r'\1有一个重要的\2'),
            (r'(?:Many|Some)\s+(\w+)\s+(?:are|like to|want to|prefer to)\s+([^.]+)', r'许多\1\2'),
        ]
    },
    '健康': {
        'keywords': ['health', 'medical', 'doctor', 'hospital', 'disease', 'body', 'food', 'eat'],
        'patterns': [
            (r'(\w+)\s+(?:is|are)\s+(?:good|bad|healthy|unhealthy)\s+for\s+([^.]+)', r'\1对\2的影响'),
            (r'(?:The\s+)?(\w+)\s+(?:can|cannot|may|should)\s+([^.]+?)(?:health|disease|body)', r'\1与健康的关系'),
        ]
    },
    '环境': {
        'keywords': ['environment', 'climate', 'nature', 'animal', 'plant', 'earth', 'ocean', 'forest'],
        'patterns': [
            (r'(?:The\s+)?(\w+)\s+(?:is|are)\s+(?:in\s+)?danger\s+of\s+([^.]+)', r'\1面临\2的危险'),
            (r'(\w+)\s+(?:is|are)\s+(?:important|essential)\s+for\s+([^.]+)', r'\1对\2的重要性'),
        ]
    },
    '历史': {
        'keywords': ['history', 'ancient', 'war', 'century', 'king', 'queen', 'empire', 'battle'],
        'patterns': [
            (r'(?:In\s+)?(\d{4})s?\s*,?\s*([^.]+?)(?:became|was|were)\s+([^.]+)', r'\1年\2\3'),
            (r'(?:The\s+)?(\w+)\s+(?:was|were)\s+(?:a\s+)?(?:famous|great|important)\s+([^.]+)', r'著名的\1\2'),
        ]
    },
    '文学': {
        'keywords': ['story', 'tale', 'character', 'author', 'book', 'novel', 'narrative'],
        'patterns': [
            (r'(?:A|The)\s+(?:story|tale)\s+about\s+([^.]+)', r'关于\1的故事'),
            (r'(\w+)\s+(?:is|was)\s+(?:a\s+)?(?:young|old|great|kind|clever)\s+([^.]+)', r'\1是一个\2的角色'),
        ]
    }
}

def extract_meaningful_sentences(text, max_chars=150):
    """提取有意义的句子"""
    sentences = re.findall(r'[^.!?]+[.!?]', text)
    if not sentences:
        return text[:max_chars]

    # 优先选择包含主题关键词的句子
    best_sentence = sentences[0] if sentences else text[:max_chars]

    for sentence in sentences:
        sentence_lower = sentence.lower()
        # 检查是否包含多个关键词
        keyword_count = sum(1 for topic in TOPIC_PATTERNS.values()
                          for kw in topic['keywords']
                          if kw in sentence_lower)

        if keyword_count > 0 and len(sentence) <= max_chars + 50:
            best_sentence = sentence
            break
        elif keyword_count > 0 and len(sentence) < len(best_sentence):
            best_sentence = sentence

    # 清理和截断
    best_sentence = best_sentence.strip()
    if len(best_sentence) > max_chars:
        # 在单词边界处截断
        truncated = best_sentence[:max_chars].rsplit(' ', 1)[0]
        best_sentence = truncated + '...'
    else:
        best_sentence = best_sentence.rstrip('.,;:')

    return best_sentence

def identify_topic(content):
    """识别文章主题"""
    content_lower = content.lower()
    topic_scores = {}

    for topic, data in TOPIC_PATTERNS.items():
        score = sum(1 for kw in data['keywords'] if kw in content_lower)
        if score > 0:
            topic_scores[topic] = score

    if topic_scores:
        return max(topic_scores, key=topic_scores.get)
    return 'general'

def generate_summary(content, title):
    """生成文章梗概"""
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

    # 识别主题
    topic = identify_topic(body)

    # 提取有意义的句子
    summary = extract_meaningful_sentences(body)

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

            # 生成梗概
            summary = generate_summary(body, title)

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

            if updated <= 10:
                print(f"\n标题: {title[:50]}...")
                print(f"  梗概: {summary[:80]}...")

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

        if (idx + 1) % 5000 == 0:
            print(f"\n进度: {idx + 1}/{len(md_files)}")

    print(f"\n处理完成!")
    print(f"共处理: {updated} 篇文章")

if __name__ == '__main__':
    process_articles()
