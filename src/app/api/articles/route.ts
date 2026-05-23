import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 文章类型
interface Article {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  date: string;
  summary: string;
  content: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || 'gaokao';

    // 读取 articles 目录
    const articlesDir = path.join(process.cwd(), 'articles');
    const files = fs.readdirSync(articlesDir);

    const articles: Article[] = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(articlesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // 解析 Markdown 元数据
        const metaMatch = content.match(/---\n([\s\S]*?)\n---/);
        if (metaMatch) {
          const metaContent = metaMatch[1];
          const contentWithoutMeta = content.replace(/---\n[\s\S]*?\n---/, '').trim();

          // 解析元数据
          const metaLines = metaContent.split('\n');
          const meta: Record<string, string> = {};

          for (const line of metaLines) {
            const [key, value] = line.split(': ');
            if (key && value) {
              meta[key.trim()] = value.trim().replace(/"/g, '');
            }
          }

          // 根据科目筛选文章
          let match = false;
          switch (subject) {
            case 'gaokao':
              match = meta.category?.includes('高考') || meta.difficulty?.includes('高中');
              break;
            case 'cet':
              match = meta.category?.includes('四六级') || meta.difficulty?.includes('CET');
              break;
            case 'ielts':
              match = meta.category?.includes('雅思') || meta.difficulty?.includes('IELTS');
              break;
            case 'toefl':
              match = meta.category?.includes('托福') || meta.difficulty?.includes('TOEFL');
              break;
            default:
              match = true;
          }

          if (match) {
            articles.push({
              slug: file.replace('.md', ''),
              title: meta.title || '',
              category: meta.category || '',
              difficulty: meta.difficulty || '',
              date: meta.date || '',
              summary: meta.summary || '',
              content: contentWithoutMeta,
            });
          }
        }
      }
    }

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error loading articles:', error);
    return NextResponse.json({ error: 'Failed to load articles' }, { status: 500 });
  }
}
