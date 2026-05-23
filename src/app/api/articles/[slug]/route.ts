import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Article {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  date: string;
  summary: string;
  content: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const articlesDir = path.join(process.cwd(), 'articles');
    const files = fs.readdirSync(articlesDir);

    for (const file of files) {
      if (file.endsWith('.md') && file.replace('.md', '') === slug) {
        const filePath = path.join(articlesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const metaMatch = content.match(/---\n([\s\S]*?)\n---/);
        if (metaMatch) {
          const metaContent = metaMatch[1];
          const contentWithoutMeta = content.replace(/---\n[\s\S]*?\n---/, '').trim();

          const metaLines = metaContent.split('\n');
          const meta: Record<string, string> = {};

          for (const line of metaLines) {
            const [key, value] = line.split(': ');
            if (key && value) {
              meta[key.trim()] = value.trim().replace(/"/g, '');
            }
          }

          const article: Article = {
            slug: file.replace('.md', ''),
            title: meta.title || '',
            category: meta.category || '',
            difficulty: meta.difficulty || '',
            date: meta.date || '',
            summary: meta.summary || '',
            content: contentWithoutMeta,
          };

          return NextResponse.json(article);
        }
      }
    }

    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  } catch (error) {
    console.error('Error loading article:', error);
    return NextResponse.json({ error: 'Failed to load article' }, { status: 500 });
  }
}