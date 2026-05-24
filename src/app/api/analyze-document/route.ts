import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { analyzeDocument, ieltsExtractionPrompt, splitSentences } from '@/lib/analyze-text';
import { parseDocument } from '@/lib/document-parser';

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

const mockVocabulary: VocabularyItem[] = [
  {
    word: "comprehensive",
    phonetic: "/ˌkɒmprɪˈhensɪv/",
    pos: "adjective",
    chineseMeaning: "全面的，综合的",
    definition: "covering all aspects of a subject",
    example: "The report provides a comprehensive analysis of the market."
  },
  {
    word: "substantial",
    phonetic: "/səbˈstænʃl/",
    pos: "adjective",
    chineseMeaning: "大量的，实质的",
    definition: "large in size, amount, or degree",
    example: "There has been a substantial increase in sales."
  },
  {
    word: "controversy",
    phonetic: "/ˈkɒntrəvɜːsi/",
    pos: "noun",
    chineseMeaning: "争议，争论",
    definition: "a disagreement, typically one that is public",
    example: "The decision caused considerable controversy."
  },
  {
    word: "phenomenon",
    phonetic: "/fɪˈnɒmɪnən/",
    pos: "noun",
    chineseMeaning: "现象",
    definition: "a fact or situation that is observed to exist",
    example: "This natural phenomenon occurs every winter."
  },
  {
    word: "perspective",
    phonetic: "/pəˈspektɪv/",
    pos: "noun",
    chineseMeaning: "观点，视角",
    definition: "a particular way of considering something",
    example: "Try to see things from a different perspective."
  },
];

const mockQuestions: Question[] = [
  {
    type: "multiple-choice",
    question: "What do modern libraries provide according to the passage?",
    options: ["Only printed books", "Digital catalogues and online lectures", "Coffee shops", "Gym facilities"],
    answer: "B",
    explanation: "根据文章第二段，现代图书馆提供数字目录、在线讲座、语言学习平台和共享自习空间。选项B正确。",
    reference: "第二段第一句"
  },
  {
    type: "true-false",
    question: "Public libraries today are still only quiet rooms filled with printed books.",
    answer: "False",
    explanation: "文章第一段明确指出公共图书馆不再只是摆满纸质书的安静房间。",
    reference: "第一段第一句"
  }
];

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

async function analyzeVocabulary(text: string): Promise<VocabularyItem[]> {
  void text;
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockVocabulary;
}

async function extractQuestions(text: string): Promise<Question[]> {
  void text;
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockQuestions;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "请选择要上传的文件" }, { status: 400 });
    }

    const parsedText = await parseDocument(file);
    const split = await splitWithDeepSeek(parsedText);
    const extractedText = split.articleText;
    const quizRaw = split.questionText;
    const vocabulary = await analyzeVocabulary(extractedText || quizRaw);
    const sentences = buildSentenceAnalyses(extractedText);
    const questions = await extractQuestions(quizRaw || extractedText);
    const title = extractTitle(split.titleText, extractedText, file.name);
    const category = inferCategory(`${extractedText}\n${quizRaw}`);

    const analysisId = generateAnalysisId();
    const result: AnalysisResult = {
      id: analysisId,
      fileName: file.name,
      analyzedAt: new Date().toLocaleString("zh-CN"),
      extractedText,
      quizRaw,
      title,
      category,
      vocabulary,
      sentences,
      questions
    };

    const analysisDir = path.join(process.cwd(), "data", "analyses");
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }

    const filePath = path.join(analysisDir, `${analysisId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
    writeCuratedArticle(result);

    return NextResponse.json({ success: true, analysisId, slug: analysisId });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

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

      return NextResponse.json({ documents });
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
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
