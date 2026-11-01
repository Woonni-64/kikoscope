import sharp from "sharp";
import { recognizeDocument, RecognitionError } from "./document-recognition";
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
  const isImage = imageExtensions.has(getExtension(file));
  let prepared = bytes;
  if (isImage) {
    try {
      prepared = await sharp(bytes, { limitInputPixels: 40_000_000 })
        .rotate().flatten({ background: "#ffffff" })
        .resize({ width: 2000, height: 2400, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 90 }).toBuffer();
    } catch { throw new RecognitionError("图片文件无法读取，请重新保存为 PNG 或 JPG。", 422, "INVALID_IMAGE"); }
  }
  return cleanText(await recognizeDocument(prepared.toString("base64"), isImage ? "image/jpeg" : "application/pdf"));
}

async function readMarkdown(file: File) {
  return cleanText(await file.text());
}

export async function parseDocument(file: File) {
  const extension = getExtension(file);

  if (markdownExtensions.has(extension) || extension === ".txt") {
    return readMarkdown(file);
  }

  if (extension === ".docx") {
    try {
      const { extractRawText } = await import("mammoth");
      const result = await extractRawText({ buffer: Buffer.from(await file.arrayBuffer()) });
      const text = cleanText(result.value);
      if (!text) throw new Error("empty");
      return text;
    } catch { throw new Error("Word 文件无法读取，请确认是包含英文正文的有效 DOCX 文件。"); }
  }

  const { tempDir, tempPath, bytes } = await writeTempFile(file);

  try {
    if (imageExtensions.has(extension)) {
      if (process.env.VERCEL) {
        return parseWithGeminiOcr(file, bytes);
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
      return parseWithGeminiOcr(file, bytes);
    }

    throw new Error("未能读取这个文件。请先将 PDF 或 Word 中的英文正文复制到粘贴原文区域，或上传清晰图片。");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
