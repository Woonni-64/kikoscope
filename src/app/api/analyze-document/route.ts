import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

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

const mockText = `Public libraries are no longer quiet rooms filled only with printed books. In many modern cities, libraries now provide digital catalogues, online lectures, language learning platforms, and shared study spaces for local residents. These changes make reading more convenient and more inclusive.

Students can borrow e-books after school, older readers can join online courses, and busy workers can reserve seats before they arrive. However, technology should not replace the human value of libraries. A good library still needs patient librarians, reliable public services, and a welcoming atmosphere where people feel encouraged to learn.`;

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
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .flatMap((paragraph) => paragraph.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
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

async function extractTextFromFile(file: File): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  try {
    const text = await file.text();
    const words = text.match(/[A-Za-z]+/g) ?? [];
    if (words.length >= 20) return text;
  } catch {
    // Binary PDFs/images rely on Gemini; keep the local sample as a development fallback.
  }
  return mockText;
}

function splitArticleAndQuestions(text: string): SplitAnalysis {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const titleMarker = "---TITLE---";
  const articleMarker = "---ARTICLE---";
  const questionMarker = "---QUESTIONS---";
  const titleIndex = normalized.indexOf(titleMarker);
  const articleIndex = normalized.indexOf(articleMarker);
  const questionIndex = normalized.indexOf(questionMarker);

  if (articleIndex >= 0 && questionIndex >= 0) {
    const articleStart = articleIndex + articleMarker.length;
    return {
      titleText: titleIndex >= 0 && titleIndex < articleIndex
        ? normalized.slice(titleIndex + titleMarker.length, articleIndex).trim()
        : "",
      articleText: normalized.slice(articleStart, questionIndex).trim(),
      questionText: normalized.slice(questionIndex + questionMarker.length).trim(),
    };
  }

  if (titleIndex >= 0 && articleIndex >= 0) {
    return {
      titleText: normalized.slice(titleIndex + titleMarker.length, articleIndex).trim(),
      articleText: normalized.slice(articleIndex + articleMarker.length).trim(),
      questionText: "",
    };
  }

  if (questionIndex >= 0) {
    return {
      titleText: "",
      articleText: normalized.slice(0, questionIndex).trim(),
      questionText: normalized.slice(questionIndex + questionMarker.length).trim(),
    };
  }

  const questionStart = normalized.search(
    /(^|\n)\s*(Questions?\s+\d+|QUESTIONS?\s+\d+|Questions?\b|QUESTIONS?\b|\d+\.\s+|TRUE\s*\/\s*FALSE\s*\/\s*NOT\s+GIVEN|Summary Completion|Multiple Choice)/,
  );

  if (questionStart >= 0) {
    const articleText = normalized.slice(0, questionStart).trim();
    const questionText = normalized.slice(questionStart).trim();
    return articleText
      ? { titleText: "", articleText, questionText }
      : { titleText: "", articleText: "", questionText: normalized };
  }

  return { titleText: "", articleText: normalized, questionText: "" };
}

async function analyzeWithGemini(file: File): Promise<SplitAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `请从以下图片/PDF中提取英文文章原文。要求：
- 只返回原文内容，不要任何分析、翻译、总结、解释
- 保留原文所有段落、句子、标点符号
- 保留原文标题
- 保留题目部分（如 TRUE/FALSE/NOT GIVEN、Summary Completion 等）
- 返回格式：
---TITLE---
[原文标题]
---ARTICLE---
[原文正文，按段落分行]
---QUESTIONS---
[题目内容]`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: bytes.toString("base64"),
          mimeType: file.type || "application/octet-stream",
        },
      },
    ]);

    return splitArticleAndQuestions(result.response.text());
  } catch (error) {
    console.error("Gemini analysis failed, using local fallback:", error);
    return null;
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

    const gemini = await analyzeWithGemini(file);
    const fallbackText = gemini ? "" : await extractTextFromFile(file);
    const split = gemini ?? splitArticleAndQuestions(fallbackText);
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

    return NextResponse.json({ success: true, analysisId });
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
