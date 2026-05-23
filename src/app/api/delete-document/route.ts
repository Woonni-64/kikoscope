import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { analysisId, slug } = await request.json();

    const dataDir = path.join(process.cwd(), 'data', 'analyses');
    const articlesDir = path.join(process.cwd(), 'articles', 'curated');

    const filesToDelete: string[] = [];

    if (analysisId) {
      filesToDelete.push(path.join(dataDir, `${analysisId}.json`));
    }

    if (slug) {
      filesToDelete.push(path.join(articlesDir, `${slug}.md`));
    }

    for (const file of filesToDelete) {
      try {
        await fs.unlink(file);
      } catch (err) {
        console.error(`Failed to delete ${file}:`, err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    );
  }
}
