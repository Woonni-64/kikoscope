import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    const dataDir = path.join(process.cwd(), 'data', 'analyses');
    const jsonFile = path.join(dataDir, `${slug}.json`);
    
    try {
      const data = await fs.readFile(jsonFile, 'utf-8');
      const analysis = JSON.parse(data);
      return NextResponse.json(analysis);
    } catch {
      const articlesDir = path.join(process.cwd(), 'articles', 'curated');
      const mdFile = path.join(articlesDir, `${slug}.md`);
      
      try {
        const content = await fs.readFile(mdFile, 'utf-8');
        
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch?.[1] || '英语文章';
        
        const questionsMatch = content.match(/## Questions\n([\s\S]*)$/);
        const questions = questionsMatch?.[1] || '';
        
        const articleContent = content
          .replace(/^#\s+.+$/m, '')
          .replace(/\n## Questions\n[\s\S]*$/, '')
          .trim();
        
        const sentences = articleContent.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
        
        return NextResponse.json({
          id: slug,
          title,
          article: articleContent,
          questions,
          sentences,
          slug,
        });
      } catch {
        return NextResponse.json(
          { error: '文章不存在' },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error('Error reading article:', error);
    return NextResponse.json(
      { error: '读取失败' },
      { status: 500 }
    );
  }
}
