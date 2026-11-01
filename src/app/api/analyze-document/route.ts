import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { analyzeDocument, ieltsExtractionPrompt, splitSentences } from '@/lib/analyze-text';
export const runtime = "nodejs";
export const maxDuration = 60;

import { parseDocument } from '@/lib/document-parser';
import { RecognitionError } from '@/lib/document-recognition';

interface VocabularyItem {
  word: string;
  phonetic: string;
  pos: string;
  chineseMeaning: string;
  definition: string;
  example: string;
}

interface SentenceAnalysis {
  sentence: string;
  translation: string;
  analysis: string;
  clauses: { type: string; text: string }[];
}

interface Question {
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  reference: string;
}

interface AnalysisResult {
  id: string;
  fileName: string;
  analyzedAt: string;
  extractedText: string;
  quizRaw: string;
  title: string;
  category: string;
  vocabulary: VocabularyItem[];
  sentences: SentenceAnalysis[];
  questions: Question[];
}

type SplitAnalysis = {
  titleText: string;
  articleText: string;
  questionText: string;
};

function generateAnalysisId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function escapeFrontMatter(value: string) {
  return value.replace(/"/g, '\\"').replace(/\n/g, " ");
}

function yamlBlock(value: string) {
  const lines = value.trim().split("\n");
  if (lines.length === 0 || !value.trim()) return '""';
  return `|-\n${lines.map((line) => `  ${line}`).join("\n")}`;
}

function splitIntoSentences(text: string) {
  return splitSentences(text);
}

function buildSentenceAnalyses(articleText: string): SentenceAnalysis[] {
  return splitIntoSentences(articleText).map((sentence) => ({
    sentence,
    translation: "",
    analysis: "",
    clauses: [],
  }));
}

function extractTitle(titleText: string, articleText: string, fileName: string) {
  if (titleText.trim()) return titleText.trim().replace(/^#+\s*/, "");
  const firstLine = articleText
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  if (firstLine && firstLine.length <= 90 && !/[.!?]$/.test(firstLine)) {
    return firstLine.replace(/^#+\s*/, "");
  }
  return fileName.replace(/\.[^.]+$/, "");
}

function inferCategory(text: string) {
  const lower = text.toLowerCase();
  if (/climate|environment|species|animal|pollution|energy|ocean|bear/.test(lower)) return "Environment";
  if (/technology|digital|computer|ai|artificial intelligence|robot/.test(lower)) return "Technology";
  if (/science|research|experiment|biology|medicine|health/.test(lower)) return "Science";
  if (/history|ancient|archaeology|culture|language/.test(lower)) return "Culture";
  if (/education|student|school|university|learning/.test(lower)) return "Education";
  return "General";
}

function writeCuratedArticle(result: AnalysisResult) {
  const curatedDir = path.join(process.cwd(), "articles", "curated");
  if (!fs.existsSync(curatedDir)) {
    fs.mkdirSync(curatedDir, { recursive: true });
  }

  const body = splitIntoSentences(result.extractedText).join("\n");
  const markdown = `---\ntitle: "${escapeFrontMatter(result.title)}"\ncategory: "${escapeFrontMatter(result.category)}"\ndifficulty: "B2"\ndate: "${new Date().toISOString().slice(0, 10)}"\nsummary: "由 Kiki 从上传资料中整理出的精读文章。"\nsource: "User Upload"\nquiz_raw: ${yamlBlock(result.quizRaw)}\nsentences: ${JSON.stringify(splitIntoSentences(result.extractedText))}\n---\n\n${body}\n`;

  fs.writeFileSync(path.join(curatedDir, `${result.id}.md`), markdown, "utf-8");
}

function splitArticleAndQuestions(text: string): SplitAnalysis {
  const result = analyzeDocument(text);
  return {
    titleText: result.titleText,
    articleText: result.articleText,
    questionText: result.questionText,
  };
}

async function splitWithDeepSeek(rawText: string): Promise<SplitAnalysis> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return splitArticleAndQuestions(rawText);

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      signal: AbortSignal.timeout(25000),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是精准的雅思真题正文和题目提取工具，只按要求返回内容。" },
          { role: "user", content: `${ieltsExtractionPrompt}\n\n待处理文本：\n${rawText}` },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) throw new Error(`DeepSeek failed with ${response.status}`);
    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    return splitArticleAndQuestions(data.choices?.[0]?.message?.content || rawText);
  } catch (error) {
    console.error("DeepSeek split failed, using local splitter:", error);
    return splitArticleAndQuestions(rawText);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择要上传的文件" }, { status: 400 });
    }

    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "文件超过4MB，请分成较小的文件或粘贴原文。" }, { status: 413 });
    const originalName = formData.get("originalName");
    const fileName = typeof originalName === "string" ? originalName.slice(0, 255) : file.name;
    const parsedText = await parseDocument(file);
    if (!parsedText.trim() || parsedText.length > 250000) return NextResponse.json({ error: "没有可读正文，或文本过长，请分段上传。" }, { status: 422 });
    const split = await splitWithDeepSeek(parsedText);
    const extractedText = split.articleText;
    const quizRaw = split.questionText;
    if (!extractedText.trim() && !quizRaw.trim()) return NextResponse.json({ error: "没有识别到正文或题目，请换清晰图片或粘贴原文。" }, { status: 422 });
    // Do not return fixed demo vocabulary or unrelated library questions.
    const vocabulary: VocabularyItem[] = [];
    const sentences = buildSentenceAnalyses(extractedText);
    const questions: Question[] = [];
    const title = extractTitle(split.titleText, extractedText, fileName);
    const category = inferCategory(`${extractedText}\n${quizRaw}`);

    const analysisId = generateAnalysisId();
    const result: AnalysisResult = {
      id: analysisId,
      fileName,
      analyzedAt: new Date().toLocaleString("zh-CN"),
      extractedText,
      quizRaw,
      title,
      category,
      vocabulary,
      sentences,
      questions
    };

    let storageMode: "browser" | "server" = "browser";
    if (!process.env.VERCEL) {
      try {
        const analysisDir = path.join(process.cwd(), "data", "analyses");
        fs.mkdirSync(analysisDir, { recursive: true });
        fs.writeFileSync(path.join(analysisDir, `${analysisId}.json`), JSON.stringify(result, null, 2), "utf-8");
        writeCuratedArticle(result);
        storageMode = "server";
      } catch { console.warn("Server storage unavailable; returning analysis for browser storage."); }
    }
    return NextResponse.json({ success: true, analysisId, slug: analysisId, analysis: result, storageMode,
      warning: "原题已保留，但未自动生成答案或词汇清单；可在精读页点击单词查词。" });
  } catch (error) {
    if (error instanceof RecognitionError) {
      console.warn("Document recognition failed:", error.code);
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("Analysis failed:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: error instanceof Error && !/api.?key|token|authorization/i.test(error.message) ? error.message.slice(0, 400) : "解析服务暂时不可用，请稍后重试。" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id && !/^analysis_[A-Za-z0-9_-]+$/.test(id)) return NextResponse.json({ error: "无效的资料编号" }, { status: 400 });

  if (!id) {
    try {
      const analysisDir = path.join(process.cwd(), "data", "analyses");
      if (!fs.existsSync(analysisDir)) {
        return NextResponse.json({ documents: [] });
      }

      const documents = fs
        .readdirSync(analysisDir)
        .filter((file) => file.startsWith("analysis_") && file.endsWith(".json"))
        .map((file) => {
          const filePath = path.join(analysisDir, file);
          const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as AnalysisResult;
          return {
            id: data.id,
            name: data.fileName,
            uploadedAt: data.analyzedAt,
            status: "completed" as const,
            analysisId: data.id,
          };
        })
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

      return NextResponse.json({ documents }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
  }

  try {
    const filePath = path.join(process.cwd(), "data", "analyses", `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "分析结果不存在" }, { status: 404 });
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const result = JSON.parse(data) as AnalysisResult;
    
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
