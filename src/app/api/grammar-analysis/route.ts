import { NextRequest, NextResponse } from "next/server";

type DeepSeekResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
};

function localGrammarFallback(sentence: string) {
  return [
    `主句结构：请先看整句主干，通常可从主要名词短语和主要动词开始定位。`,
    `从句与修饰：留意 that/which/when/where/because 等连接词，以及介词短语、分词结构对名词或动作的补充。`,
    `中文翻译：${sentence}`,
  ].join("\n");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sentence = searchParams.get("q")?.trim() || "";

  if (!sentence) {
    return NextResponse.json({ analysis: "" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ analysis: localGrammarFallback(sentence), source: "local" });
  }

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
          {
            role: "system",
            content: "你是温和、准确的雅思阅读语法分析助手。回答简洁，不制造压力。",
          },
          {
            role: "user",
            content: `请分析下面英文句子的语法结构，必须包含：\n1. 主句结构（主语、谓语、宾语等）\n2. 从句类型及修饰成分\n3. 中文翻译\n\n句子：${sentence}`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek failed with ${response.status}`);
    }

    const data = (await response.json()) as DeepSeekResponse;
    const analysis = data.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ analysis: analysis || localGrammarFallback(sentence), source: "deepseek" });
  } catch (error) {
    console.error("Grammar analysis failed:", error);
    return NextResponse.json({ analysis: localGrammarFallback(sentence), source: "local" });
  }
}
