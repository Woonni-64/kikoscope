import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import crypto from 'crypto';

function extractSimpleAnalysis(text: string) {
  const lines = text.split('\n').filter(l => l.trim());
  const title = lines[0]?.trim() || "英语文章";
  
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => {
    const clean = s.trim();
    return clean.length > 10 && 
           !/^[\d\s\-\–\—]+$/.test(clean) &&
           !/page|Page|第.*页/i.test(clean);
  });

  return {
    title,
    article: text,
    questions: "",
    sentences
  };
}

function splitSentences(text: string) {
  return text.split(/(?<=[.!?])\s+/).filter(s => {
    const clean = s.trim();
    return clean.length > 10 && 
           !/^[\d\s\-\–\—]+$/.test(clean) &&
           !/page|Page|第.*页/i.test(clean);
  });
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有上传文件' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    const tempFile = path.join(uploadDir, `upload-${Date.now()}.${ext}`);
    await fs.writeFile(tempFile, buffer);

    let text = '';
    
    try {
      const pythonScript = path.join(process.cwd(), 'scripts', 'doc_processor.py');
      const pythonResult = await new Promise<string>((resolve, reject) => {
        const process = spawn('python3', [pythonScript, tempFile], {
          cwd: process.cwd()
        });
        
        let output = '';
        let error = '';
        
        process.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        process.stderr.on('data', (data) => {
          error += data.toString();
        });
        
        process.on('close', (code) => {
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(error || 'Python script failed'));
          }
        });
        
        setTimeout(() => {
          process.kill();
          reject(new Error('Python script timeout'));
        }, 60000);
      });
      
      text = pythonResult.trim();
    } catch (pythonError) {
      console.error('Python conversion failed:', pythonError);
      text = buffer.toString('utf-8');
    }

    try {
      await fs.unlink(tempFile);
    } catch {}

    const analysis = extractSimpleAnalysis(text);
    const analysisId = crypto.randomBytes(8).toString('hex');
    const slug = slugify(analysis.title) + '-' + analysisId;

    const dataDir = path.join(process.cwd(), 'data', 'analyses');
    await fs.mkdir(dataDir, { recursive: true });
    
    const analysisData = {
      id: analysisId,
      title: analysis.title,
      article: analysis.article,
      questions: analysis.questions,
      sentences: analysis.sentences,
      slug,
      createdAt: new Date().toISOString(),
    };
    
    await fs.writeFile(
      path.join(dataDir, `${analysisId}.json`),
      JSON.stringify(analysisData, null, 2)
    );

    const articlesDir = path.join(process.cwd(), 'articles', 'curated');
    await fs.mkdir(articlesDir, { recursive: true });
    
    const markdownContent = `# ${analysis.title}\n\n${analysis.article}\n\n---\n\n## Questions\n\n${analysis.questions}`;
    
    await fs.writeFile(
      path.join(articlesDir, `${slug}.md`),
      markdownContent
    );

    return NextResponse.json({
      success: true,
      analysisId,
      slug,
      title: analysis.title,
      sentenceCount: analysis.sentences.length,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { success: false, error: '分析失败' },
      { status: 500 }
    );
  }
}
