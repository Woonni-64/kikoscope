import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ResponseSchema } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface Example {
  en: string;
  zh: string;
}

interface ExamplesResponse {
  examples: Example[];
}

const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash"];

const examplesSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    examples: {
      type: SchemaType.ARRAY,
      description: "Array of example sentences with English and Chinese translations",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          en: {
            type: SchemaType.STRING,
            description: "English example sentence",
          },
          zh: {
            type: SchemaType.STRING,
            description: "Chinese translation of the example sentence",
          },
        },
        required: ["en", "zh"],
      },
    },
  },
  required: ["examples"],
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Gemini API error.";
}

async function generateExamples(apiKey: string, word: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown;

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: examplesSchema,
        },
      });

      const result = await model.generateContent(
        [
          `请为英语单词 "${word}" 生成 3 个适合英语学习者的例句，每个例句包含英文原文和中文翻译。`,
          "要求：",
          "1. 例句要自然、地道，符合真实英语使用场景",
          "2. 例句难度适中，适合中高级英语学习者",
          "3. 中文翻译要准确、通顺",
          "4. 例句要能展示单词在不同语境中的用法",
          "返回严格的 JSON 格式：{ examples: [{en: '英文例句', zh: '中文翻译'}] }",
        ].join("\n"),
      );

      return JSON.parse(result.response.text()) as ExamplesResponse;
    } catch (error) {
      lastError = error;
      console.error(`Gemini examples request failed with ${modelName}:`, error);
    }
  }

  throw new Error(getErrorMessage(lastError));
}

// 模拟例句数据，当API调用失败时使用
function getMockExamples(word: string): ExamplesResponse {
  return {
    examples: [
      {
        en: `The ${word} of technology has transformed our daily lives.`,
        zh: `技术的${word}已经改变了我们的日常生活。`
      },
      {
        en: `She has a deep understanding of the ${word} involved.`,
        zh: `她对涉及的${word}有深刻的理解。`
      },
      {
        en: `The article discusses the implications of this new ${word}.`,
        zh: `文章讨论了这个新${word}的影响。`
      }
    ]
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const word = typeof body === "object" && body !== null && "word" in body && typeof body.word === "string" ? body.word.trim() : "";

  if (!word) {
    return NextResponse.json(
      { error: "The 'word' field is required." },
      { status: 400 },
    );
  }

  if (apiKey) {
    try {
      const examples = await generateExamples(apiKey, word);
      return NextResponse.json(examples);
    } catch (error) {
      console.error("Gemini examples request failed:", error);
      // 失败时返回模拟数据
      return NextResponse.json(getMockExamples(word));
    }
  }

  // 如果没有API key，返回模拟数据
  return NextResponse.json(getMockExamples(word));
}
