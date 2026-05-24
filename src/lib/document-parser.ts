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
  const scriptPath = path.join(process.cwd(), "scripts", "parse_document.py");
  const { stdout } = await execFileAsync("python3", [scriptPath, tempPath], {
    maxBuffer: 1024 * 1024 * 20,
  });
  const payload = JSON.parse(stdout) as PythonParseResult;
  return cleanText(payload.text || "");
}

async function parseWithGeminiOcr(file: File, bytes: Buffer) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return "";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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

  if (markdownExtensions.has(extension)) {
    return readMarkdown(file);
  }

  const { tempDir, tempPath, bytes } = await writeTempFile(file);

  try {
    if (imageExtensions.has(extension)) {
      const geminiText = await parseWithGeminiOcr(file, bytes).catch(() => "");
      if (geminiText) return geminiText;
      return await parseWithPython(tempPath);
    }

    const pythonText = await parseWithPython(tempPath).catch(() => "");
    if (pythonText) return pythonText;

    if (extension === ".pdf") {
      const geminiText = await parseWithGeminiOcr(file, bytes).catch(() => "");
      if (geminiText) return geminiText;
    }

    const fallbackText = await file.text().catch(() => "");
    return cleanText(fallbackText);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
