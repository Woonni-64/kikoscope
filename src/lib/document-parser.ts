import { GoogleGenerativeAI } from "@google/generative-ai";
import { execFile } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const markdownExtensions = new Set([".md", ".markdown"]);

type PythonParseResult = {
  text?: string;
  method?: string;
};

function getExtension(file: File) {
  return path.extname(file.name || "").toLowerCase();
}

function cleanText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function writeTempFile(file: File) {
  const extension = getExtension(file) || ".bin";
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "kikoscope-doc-"));
  const tempPath = path.join(tempDir, `upload${extension}`);
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(tempPath, bytes);
  return { tempDir, tempPath, bytes };
}

async function parseWithPython(tempPath: string) {
  if (process.env.VERCEL) throw new Error("线上环境不提供 Python 文件识别，请用图片识别或粘贴原文。");
  const scriptPath = path.join(process.cwd(), "scripts", "parse_document.py");
  const { stdout } = await execFileAsync("python3", [scriptPath, tempPath], {
    maxBuffer: 1024 * 1024 * 20,
  });
  const payload = JSON.parse(stdout) as PythonParseResult;
  return cleanText(payload.text || "");
}

async function parseWithGeminiOcr(file: File, bytes: Buffer) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("服务端图片识别尚未配置。请通过上传页的浏览器识别，或粘贴英文原文。");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_OCR_MODEL || "gemini-2.5-flash" });
  const result = await model.generateContent([
    "请精准提取并还原以下图片中的英文文本内容，保持原有的段落和句子结构，不要总结或翻译。",
    {
      inlineData: {
        data: bytes.toString("base64"),
        mimeType: file.type || "application/octet-stream",
      },
    },
  ]);

  return cleanText(result.response.text());
}

async function readMarkdown(file: File) {
  return cleanText(await file.text());
}

export async function parseDocument(file: File) {
  const extension = getExtension(file);

  if (markdownExtensions.has(extension) || extension === ".txt") {
    return readMarkdown(file);
  }

  const { tempDir, tempPath, bytes } = await writeTempFile(file);

  try {
    if (imageExtensions.has(extension)) {
      if (process.env.VERCEL) {
        try {
          const text = await parseWithGeminiOcr(file, bytes);
          if (!text) throw new Error("图片未识别到正文");
          return text;
        } catch { throw new Error("服务端图片识别不可用，请从上传页使用浏览器识别，或粘贴英文原文。"); }
      }
      const geminiText = await parseWithGeminiOcr(file, bytes).catch(() => "");
      if (geminiText) return geminiText;
      const localText = await parseWithPython(tempPath);
      if (!localText) throw new Error("没有识别到图片文字，请使用清晰图片或粘贴原文。");
      return localText;
    }

    const pythonText = await parseWithPython(tempPath).catch(() => "");
    if (pythonText) return pythonText;

    if (extension === ".pdf") {
      const geminiText = await parseWithGeminiOcr(file, bytes).catch(() => "");
      if (geminiText) return geminiText;
    }

    throw new Error("未能读取这个文件。请先将 PDF 或 Word 中的英文正文复制到粘贴原文区域，或上传清晰图片。");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
