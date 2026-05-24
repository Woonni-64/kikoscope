import { NextRequest, NextResponse } from "next/server";

type MyMemoryResponse = {
  responseData?: {
    translatedText?: string;
  };
};

type LibreTranslateResponse = {
  translatedText?: string;
};

async function translateWithMyMemory(text: string, langpair: string) {
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(`MyMemory failed with ${response.status}`);
  }

  const data = (await response.json()) as MyMemoryResponse;
  const translation = data.responseData?.translatedText?.trim();
  if (!translation) {
    throw new Error("MyMemory returned empty translation");
  }

  return translation;
}

async function translateWithLibreTranslate(text: string) {
  const response = await fetch("https://libretranslate.com/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "en", target: "zh", format: "text" }),
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate failed with ${response.status}`);
  }

  const data = (await response.json()) as LibreTranslateResponse;
  const translation = data.translatedText?.trim();
  if (!translation) {
    throw new Error("LibreTranslate returned empty translation");
  }

  return translation;
}

async function translate(text: string, langpair = "en|zh") {
  try {
    return await translateWithMyMemory(text, langpair);
  } catch (error) {
    console.error("MyMemory translation failed, trying LibreTranslate:", error);
    return translateWithLibreTranslate(text);
  }
}

function translationResponse(translation: string) {
  return NextResponse.json({
    translation,
    translatedText: translation,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("q")?.trim() || "";
  const langpair = searchParams.get("langpair") || "en|zh";

  if (!text) {
    return NextResponse.json({ translation: "", translatedText: "" });
  }

  try {
    return translationResponse(await translate(text, langpair));
  } catch (error) {
    console.error("Translation failed:", error);
    return NextResponse.json({ error: "翻译暂时没有成功", translation: "", translatedText: "" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string; q?: string; langpair?: string };
    const text = (body.text || body.q || "").trim();

    if (!text) {
      return NextResponse.json({ translation: "", translatedText: "" });
    }

    return translationResponse(await translate(text, body.langpair || "en|zh"));
  } catch (error) {
    console.error("Translation failed:", error);
    return NextResponse.json({ error: "翻译暂时没有成功", translation: "", translatedText: "" }, { status: 500 });
  }
}
