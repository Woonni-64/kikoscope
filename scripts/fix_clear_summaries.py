#!/usr/bin/env python3
"""
重新处理CLEAR文章的摘要 - 基于标题和其他元数据生成更好的摘要
"""

from pathlib import Path
import re

def clean_title(title):
    """清理标题，去除特殊字符"""
    # 去掉RACE/CLEAR等前缀词
    title = re.sub(r'^(RACE|CLEAR|高考|四六级|雅思|托福)\s*', '', title, flags=re.IGNORECASE)
    # 替换下划线和特殊字符
    title = title.replace('_', ' ').replace('-', ' ')
    # 清理多余空格
    title = ' '.join(title.split())
    return title

def extract_topic_from_title(title):
    """从标题中提取主题"""
    title_lower = title.lower()

    topic_keywords = {
        '科技': ['technology', 'computer', 'science', 'robot', 'digital', 'internet', 'data', 'machine', 'science', 'scientific'],
        '教育': ['learning', 'study', 'school', 'education', 'teach', 'student', 'college', 'university'],
        '历史': ['history', 'historical', 'war', 'ancient', 'century', 'king', 'queen', 'empire'],
        '文学': ['story', 'tale', 'novel', 'fiction', 'author', 'writer', 'book', 'narrative'],
        '社会': ['society', 'social', 'community', 'people', 'life', 'work', 'job'],
        '环境': ['environment', 'climate', 'nature', 'animal', 'plant', 'ecology', 'ocean', 'forest'],
        '健康': ['health', 'medical', 'doctor', 'hospital', 'disease', 'body', 'food'],
        '商业': ['business', 'company', 'market', 'trade', 'economy', 'money', 'financial'],
        '体育': ['sport', 'game', 'football', 'basketball', 'soccer', 'tennis', 'team'],
        '艺术': ['art', 'music', 'painting', 'artist', 'museum', 'cultural', 'movie', 'film']
    }

    for topic, keywords in topic_keywords.items():
        for kw in keywords:
            if kw in title_lower:
                return topic
    return None

def generate_summary_from_title(title, category, author):
    """基于标题、分类、作者生成摘要"""
    cleaned_title = clean_title(title)

    # 尝试从标题提取主题
    topic = extract_topic_from_title(cleaned_title)

    # 根据主题生成不同的摘要模板
    if topic:
        templates = {
            '科技': f"探讨{cleaned_title}相关的科学技术知识",
            '教育': f"关于{cleaned_title}的学习和教育话题",
            '历史': f"讲述{cleaned_title}的历史故事",
            '文学': f"讲述{cleaned_title}的文学作品",
            '社会': f"探讨{cleaned_title}相关的社会现象",
            '环境': f"关于{cleaned_title}与自然环境的关系",
            '健康': f"介绍{cleaned_title}相关的健康知识",
            '商业': f"探讨{cleaned_title}的商业和经济话题",
            '体育': f"关于{cleaned_title}的体育运动",
            '艺术': f"关于{cleaned_title}的艺术文化"
        }
        return templates.get(topic, f"关于{cleaned_title}的文章")

    # 默认模板
    if author:
        return f"{author}所著的{cleaned_title}"
    else:
        return f"关于{cleaned_title}的文章"

def process_clear_articles():
    """重新处理CLEAR文章的摘要"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    updated = 0
    clear_updated = 0

    for idx, file in enumerate(md_files):
        try:
            filename = file.name

            # 只处理CLEAR文章
            if not filename.startswith('clear-'):
                continue

            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 提取frontmatter
            parts = content.split('---')
            if len(parts) < 3:
                continue

            frontmatter_str = parts[1]
            body = '---'.join(parts[2:])

            # 检查body是否有实质内容（超过50个字符）
            if len(body.strip()) > 50:
                continue  # 有内容的保持原样

            # 解析frontmatter
            frontmatter = {}
            for line in frontmatter_str.strip().split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    frontmatter[key] = value

            title = frontmatter.get('title', '')
            category = frontmatter.get('category', '')
            author = frontmatter.get('author', '')

            # 生成新摘要
            summary = generate_summary_from_title(title, category, author)

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
            clear_updated += 1

            if clear_updated <= 10:
                print(f"更新: {title[:40]}...")
                print(f"  新摘要: {summary[:50]}...")

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

        if (idx + 1) % 1000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n处理完成!")
    print(f"共更新: {updated} 篇 CLEAR 文章")

if __name__ == '__main__':
    process_clear_articles()
