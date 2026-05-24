#!/usr/bin/env python3
"""
RACE数据集批量导入脚本
将RACE数据集转换为Markdown文章和Quiz题目
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any

def load_race_file(file_path: str) -> Dict[str, Any]:
    """加载单个RACE文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read().strip()

    try:
        data = json.loads(content)
        return data
    except json.JSONDecodeError:
        print(f"JSON解析失败: {file_path}")
        return None

def parse_race_article(data: Dict[str, Any], source_file: str) -> Dict[str, Any]:
    """解析RACE文章数据"""
    article = data.get('article', '')
    questions = data.get('questions', [])
    options = data.get('options', [])
    answers = data.get('answers', [])

    if not article or not questions:
        return None

    # 从文件路径提取难度等级
    difficulty = 'unknown'
    if '/high/' in source_file:
        difficulty = 'RACE-High'
        category = 'RACE/高考'
    elif '/middle/' in source_file:
        difficulty = 'RACE-Middle'
        category = 'RACE/中考'
    else:
        category = 'RACE/其他'

    # 从文件路径提取数据集类型
    dataset = 'unknown'
    if '/train/' in source_file:
        dataset = 'train'
    elif '/test/' in source_file:
        dataset = 'test'
    elif '/dev/' in source_file:
        dataset = 'dev'

    return {
        'article': article,
        'questions': questions,
        'options': options,
        'answers': answers,
        'difficulty': difficulty,
        'category': category,
        'dataset': dataset
    }

def generate_slug(article_data: Dict[str, Any], index: int) -> str:
    """生成文章slug"""
    article = article_data['article']
    dataset = article_data.get('dataset', 'unknown')
    # 取文章前50个字符作为标题
    title_words = article.split()[:8]
    title = ' '.join(title_words)
    # 清理特殊字符
    title = re.sub(r'[^\w\s-]', '', title)
    title = title.lower().replace(' ', '-')
    # 截断并添加索引确保唯一
    title = title[:40] if len(title) > 40 else title
    return f"race-{dataset}-{title}-{index}"

def convert_to_markdown(article_data: Dict[str, Any], slug: str) -> str:
    """将文章转换为Markdown格式"""
    article = article_data['article']
    difficulty = article_data['difficulty']
    category = article_data['category']
    dataset = article_data['dataset']

    # 生成frontmatter
    markdown = f'''---
title: "{slug.replace('-', ' ').title()}"
category: "{category}"
difficulty: "{difficulty}"
date: "2024-01-01"
summary: "RACE {dataset} dataset article"
---

{article}
'''

    return markdown

def extract_quiz_questions(article_data: Dict[str, Any], article_slug: str) -> List[Dict[str, Any]]:
    """提取Quiz题目"""
    questions = article_data['questions']
    options = article_data['options']
    answers = article_data['answers']

    quiz_questions = []

    for i, (question, answer) in enumerate(zip(questions, answers)):
        # 获取对应的选项
        question_options = options[i] if i < len(options) else []

        quiz_question = {
            'slug': f"{article_slug}-q{i+1}",
            'article_slug': article_slug,
            'question': question,
            'options': question_options,
            'answer': answer,
            'difficulty': article_data['difficulty'],
            'dataset': article_data['dataset']
        }

        quiz_questions.append(quiz_question)

    return quiz_questions

def process_race_dataset(data_dir: str, output_articles_dir: str, output_quiz_file: str):
    """批量处理RACE数据集"""
    data_path = Path(data_dir)
    articles_dir = Path(output_articles_dir)
    articles_dir.mkdir(parents=True, exist_ok=True)

    all_articles = []
    all_quiz_questions = []
    failed_files = []

    # 遍历所有RACE txt文件
    txt_files = list(data_path.rglob('*.txt'))
    total_files = len(txt_files)

    print(f"开始处理 {total_files} 个RACE文件...")

    for idx, txt_file in enumerate(txt_files):
        if (idx + 1) % 100 == 0:
            print(f"进度: {idx + 1}/{total_files} ({(idx+1)/total_files*100:.1f}%)")

        try:
            data = load_race_file(str(txt_file))
            if not data:
                failed_files.append(str(txt_file))
                continue

            article_data = parse_race_article(data, str(txt_file))
            if not article_data:
                failed_files.append(str(txt_file))
                continue

            # 生成slug
            slug = generate_slug(article_data, idx)

            # 转换为Markdown
            markdown = convert_to_markdown(article_data, slug)

            # 保存Markdown文件
            md_file = articles_dir / f"{slug}.md"
            with open(md_file, 'w', encoding='utf-8') as f:
                f.write(markdown)

            all_articles.append({
                'slug': slug,
                'source_file': str(txt_file),
                'difficulty': article_data['difficulty']
            })

            # 提取Quiz题目
            quiz_questions = extract_quiz_questions(article_data, slug)
            all_quiz_questions.extend(quiz_questions)

        except Exception as e:
            print(f"\n处理文件失败 {txt_file}: {str(e)}")
            failed_files.append(str(txt_file))

    # 保存Quiz题目到JSON文件
    quiz_output = {
        'total_questions': len(all_quiz_questions),
        'questions': all_quiz_questions
    }

    with open(output_quiz_file, 'w', encoding='utf-8') as f:
        json.dump(quiz_output, f, ensure_ascii=False, indent=2)

    # 统计信息
    stats = {
        'total_files_processed': total_files,
        'successful_articles': len(all_articles),
        'total_quiz_questions': len(all_quiz_questions),
        'failed_files': failed_files,
        'articles_by_difficulty': {},
        'questions_by_difficulty': {}
    }

    # 按难度统计
    for article in all_articles:
        diff = article['difficulty']
        stats['articles_by_difficulty'][diff] = stats['articles_by_difficulty'].get(diff, 0) + 1

    for question in all_quiz_questions:
        diff = question['difficulty']
        stats['questions_by_difficulty'][diff] = stats['questions_by_difficulty'].get(diff, 0) + 1

    # 保存统计信息
    stats_file = output_quiz_file.replace('.json', '_stats.json')
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    print(f"\n处理完成!")
    print(f"成功转换: {len(all_articles)} 篇文章")
    print(f"提取题目: {len(all_quiz_questions)} 道")
    print(f"失败文件: {len(failed_files)} 个")
    print(f"\n按难度统计:")
    for diff, count in stats['articles_by_difficulty'].items():
        print(f"  {diff}: {count} 篇文章")

    return stats

if __name__ == '__main__':
    # 配置路径
    DATA_DIR = 'data/RACE'
    OUTPUT_ARTICLES_DIR = 'articles'
    OUTPUT_QUIZ_FILE = 'data/processed_race_quiz.json'

    # 执行处理
    stats = process_race_dataset(DATA_DIR, OUTPUT_ARTICLES_DIR, OUTPUT_QUIZ_FILE)

    # 输出失败文件列表
    if stats['failed_files']:
        print(f"\n失败的文件列表:")
        for file in stats['failed_files'][:100]:  # 只显示前100个
            print(f"  - {file}")