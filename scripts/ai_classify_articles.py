#!/usr/bin/env python3
"""
基于文章内容的智能分类
"""

import re
from pathlib import Path

# 定义分类关键词
CATEGORY_KEYWORDS = {
    '科技': ['technology', 'science', 'scientific', 'computer', 'internet', 'digital', 'robot', 'ai', 'artificial intelligence', 'software', 'app', 'online', 'web', 'data', 'cyber', 'electronic', 'machine', 'innovation', 'innovative'],
    '教育': ['education', 'school', 'student', 'teacher', 'learning', 'study', 'academic', 'college', 'university', 'class', 'lesson', 'exam', 'test', 'homework', 'knowledge', 'teach', 'learn'],
    '历史': ['history', 'historical', 'war', 'ancient', 'century', 'era', 'civilization', 'empire', 'king', 'queen', 'dynasty', 'revolution', 'world war', 'battle'],
    '文学': ['story', 'novel', 'fiction', 'tale', 'narrative', 'character', 'plot', 'author', 'writer', 'book', 'chapter', 'literary', 'poetry', 'poem'],
    '社会': ['society', 'social', 'community', 'people', 'population', 'economy', 'economic', 'politics', 'political', 'government', 'policy', 'society', 'culture'],
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
            # 计算关键词出现次数
            pattern = r'\b' + re.escape(keyword) + r'\b'
            matches = re.findall(pattern, content_lower)
            score += len(matches)

        if score > 0:
            category_scores[category] = score

    if category_scores:
        # 返回得分最高的分类
        best_category = max(category_scores, key=category_scores.get)
        return best_category

    return '其他'

def reclassify_articles():
    """重新分类所有RACE和CLEAR文章"""
    articles_path = Path('articles')
    md_files = list(articles_path.glob('*.md'))

    print(f"总文件数: {len(md_files)}")

    race_updated = 0
    clear_updated = 0
    other_updated = 0

    category_stats = {}

    for idx, file in enumerate(md_files):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()

            # 只处理RACE和CLEAR文章
            if not (file.name.startswith('race-') or file.name.startswith('clear-')):
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

            # 更新分类统计
            if category not in category_stats:
                category_stats[category] = {'race': 0, 'clear': 0}

            # 更新文件frontmatter中的category
            lines = content.split('\n')
            new_lines = []
            updated = False

            for line in lines:
                if line.startswith('category:'):
                    if file.name.startswith('race-'):
                        new_category = f"RACE/{category}"
                        category_stats[category]['race'] += 1
                    elif file.name.startswith('clear-'):
                        new_category = f"CLEAR/{category}"
                        category_stats[category]['clear'] += 1
                    else:
                        new_category = line

                    new_lines.append(f'category: "{new_category}"')
                    updated = True
                else:
                    new_lines.append(line)

            if updated:
                with open(file, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(new_lines))

                if file.name.startswith('race-'):
                    race_updated += 1
                elif file.name.startswith('clear-'):
                    clear_updated += 1
                else:
                    other_updated += 1

        except Exception as e:
            print(f"错误: {file.name} - {str(e)}")

        if (idx + 1) % 5000 == 0:
            print(f"进度: {idx + 1}/{len(md_files)}")

    print(f"\n分类完成!")
    print(f"RACE更新: {race_updated}")
    print(f"CLEAR更新: {clear_updated}")
    print(f"其他更新: {other_updated}")

    print("\n分类统计:")
    for cat, stats in sorted(category_stats.items()):
        print(f"  {cat}: RACE={stats['race']}, CLEAR={stats['clear']}")

if __name__ == '__main__':
    reclassify_articles()
