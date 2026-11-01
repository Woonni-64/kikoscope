export class RecognitionError extends Error {
  constructor(message: string, public status: number, public code: string) { super(message); }
}

/** Two bounded attempts for transient provider errors; never invent recognized text. */
export async function recognizeDocument(data: string, mimeType: string) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) throw new RecognitionError("服务端识别未配置，请使用浏览器图片识别或粘贴原文。", 503, "OCR_NOT_CONFIGURED");
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const model = process.env.GEMINI_OCR_MODEL || "gemini-2.5-flash";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST", signal: AbortSignal.timeout(16000),
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: "Extract all visible English text verbatim, including headings and questions. Preserve paragraphs. Do not translate, summarize, answer questions, or invent illegible text. Return only the extracted text. If no readable text exists, return an empty string." },
            { inlineData: { mimeType, data } },
          ] }],
          generationConfig: { temperature: 0, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
        }),
      });
      if (!response.ok) {
        if (attempt === 0 && (response.status === 429 || response.status >= 500)) continue;
        throw new RecognitionError(response.status === 429 ? "图片/PDF识别服务繁忙，请稍后重试或粘贴原文。" : "图片/PDF识别服务暂时不可用，请重试或粘贴原文。", response.status === 429 ? 429 : 503, response.status === 429 ? "OCR_RATE_LIMITED" : "OCR_UNAVAILABLE");
      }
      const result = await response.json();
      const candidate = result.candidates?.[0];
      const text = (candidate?.content?.parts || []).filter((part: {thought?:boolean}) => !part.thought).map((part: {text?:string}) => part.text || "").join("").trim();
      if (candidate?.finishReason && candidate.finishReason !== "STOP") throw new RecognitionError("识别结果不完整，请裁切为较小页面后重试。", 422, "OCR_INCOMPLETE");
      if (!text) throw new RecognitionError("未识别到可读文字，请上传清晰图片或粘贴原文。", 422, "OCR_EMPTY");
      return text;
    } catch (error) {
      if (error instanceof RecognitionError) throw error;
      const timeout = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
      if (attempt === 0) continue;
      throw new RecognitionError(timeout ? "图片/PDF识别超时，请裁切为较小页面后重试。" : "无法连接图片/PDF识别服务，请稍后重试。", timeout ? 504 : 503, timeout ? "OCR_TIMEOUT" : "OCR_UNAVAILABLE");
    }
  }
  throw new RecognitionError("识别服务暂时不可用。", 503, "OCR_UNAVAILABLE");
}
