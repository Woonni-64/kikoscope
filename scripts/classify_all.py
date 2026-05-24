#!/usr/bin/env python3
"""
基于文章内容的智能分类 - 处理所有文章
"""

import re
from pathlib import Path

# 定义分类关键词
CATEGORY_KEYWORDS = {
    '科技': ['technology', 'science', 'scientific', 'computer', 'internet', 'digital', 'robot', 'ai', 'artificial intelligence', 'software', 'app', 'online', 'web', 'data', 'cyber', 'electronic', 'machine', 'innovation', 'innovative'],
    '教育': ['education', 'school', 'student', 'teacher', 'learning', 'study', 'academic', 'college', 'university', 'class', 'lesson', 'exam', 'test', 'homework', 'knowledge', 'teach', 'learn'],
    '历史': ['history', 'historical', 'war', 'ancient', 'century', 'era', 'civilization', 'empire', 'king', 'queen', 'dynasty', 'revolution', 'world war', 'battle'],
    '文学': ['story', 'novel', 'fiction', 'tale', 'narrative', 'character', 'plot', 'author', 'writer', 'book', 'chapter', 'literary', 'poetry', 'poem'],
    '社会': ['society', 'social', 'community', 'people', 'population', 'economy', 'economic', 'politics', 'political', 'government', 'policy', 'culture'],
    '环境': ['environment', 'climate', 'nature', 'animal', 'plant', 'ecology', 'ecological', 'ocean', 'forest', 'wildlife', 'conservation', 'pollution'],
    '健康': ['health', 'medical', 'medicine', 'doctor', 'hospital', 'disease', 'treatment', 'patient', 'healthcare', 'wellness', 'fitness', 'exercise'],
    '商业': ['business', 'company', 'industry', 'market', 'trade', 'commerce', 'enterprise', 'corporate', 'investment', 'financial', 'bank', 'economy'],
    '体育': ['sport', 'game', 'football', 'basketball', 'soccer', 'tennis', 'player', 'team', 'championship', 'olympic', 'fitness', 'competition'],
    '艺术': ['art', 'music', 'painting', 'artist', 'gallery', 'museum', 'cultural', 'performance', 'theater', 'dance', 'creative']
}

def analyze_content_category(content: str) -> str:
    """分析文章内容，返回最可能的分类"""
    content_lower = content.lower()

    category_scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            pattern = r'\b' + re.escape(keyword) + r'\b'
            matches = re.findall(pattern, content_lower)
            score += len(matches)

        if score > 0:
            category_scores[category] = score

    if category_scores:
        best_category = max(category_scores, key=category_scores.get)
        return best_category

    return '其他'

def escape_yaml_string(s):
    s = s.replace('"', '\\"')
    s = s.replace('\n', ' ')
    return s

def classify_articles():
    """分类所有文章"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    updated = 0
    category_stats = {}

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 只处理还没有内容分类的文章
            if 'category:' not in content:
                continue
                
            # 检查是否已经有内容分类（包含 / 或者是 "四六级" 等特殊分类）
            if 'category: "四六级"' in content or 'category: "高考"' in content or 'category: "雅思"' in content:
                # 这些是考试类文章，保留其分类
                pass
            elif '/"' in content or 'RACE' in content or 'CLEAR' in content:
                # 已经有分类了，跳过
                continue

            # 提取文章正文（去除frontmatter）
            lines = content.split('\n')
            body_start = 0
            for i, line in enumerate(lines):
                if line.strip() == '---':
                    if body_start == 0:
                        body_start = i + 1
                    else:
                        break

            article_body = '\n'.join(lines[body_start:])

            # 分析内容分类
            category = analyze_content_category(article_body)

            # 确定来源
            source = "Unknown"
            if file.name.startswith('race-'):
                source = "RACE"
            elif file.name.startswith('clear-'):
                source = "CLEAR"
            elif file.name.startswith('cet4-'):
                source = "CET4"
            elif file.name.startswith('gaokao-'):
                source = "GAOKAO"

            # 更新分类统计
            if category not in category_stats:
                category_stats[category] = 0
            category_stats[category] += 1

            # 更新文件frontmatter
            lines = content.split('\n')
            new_lines = []
            category_updated = False
            source_updated = False

            for line in lines:
                if line.startswith('category:') and not category_updated:
                    if source in ['RACE', 'CLEAR']:
                        new_category = f"{source}/{category}"
                    elif source == "CET4":
                        new_category = "四六级"
                    elif source == "GAOKAO":
                        new_category = "高考"
                    else:
                        new_category = category
                    new_lines.append(f'category: "{new_category}"')
                    category_updated = True
                elif line.startswith('source:') and not source_updated:
                    new_lines.append(f'source: "{source}"')
                    source_updated = True
                else:
                    new_lines.append(line)

            # 确保有source字段
            if not source_updated:
                # 在category后面插入source
                for i, line in enumerate(new_lines):
                    if line.startswith('category:'):
                        new_lines.insert(i + 1, f'source: "{source}"')
                        break

            with open(file, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines))

            updated += 1

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

        if (idx + 1) % 100 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}, 更新: {updated}")

    print(f"\n分类完成!")
    print(f"更新: {updated}")

    print("\n分类统计:")
    for cat, count in sorted(category_stats.items()):
        print(f"  {cat}: {count}")

if __name__ == '__main__':
    classify_articles()
