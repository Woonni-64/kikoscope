import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ResponseSchema } from "@google/generative-ai";
import { NextResponse } from "next/server";

type DefinitionResult = {
  word: string;
  phonetic: string;
  audioUrl?: string;
  pos: string;
  meaning: string;
  example?: string;
  chineseMeaning?: string;
  synonyms: string[];
  exams?: string[];
  source?: string;
};

const modelNames = ["gemini-2.5-flash", "gemini-2.0-flash"];
const cambridgeBaseUrl = "https://dictionary.cambridge.org/api/v1";
const defaultCambridgeDictCode = "english-chinese-simplified";
const freeDictionaryBaseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en";
const myMemoryBaseUrl = "https://api.mymemory.translated.net/get";

type FreeDictionaryEntry = {
  word?: string;
  phonetic?: string;
  phonetics?: {
    text?: string;
    audio?: string;
  }[];
  meanings?: {
    partOfSpeech?: string;
    synonyms?: string[];
    definitions?: {
      definition?: string;
      synonyms?: string[];
      example?: string;
    }[];
  }[];
};

type MyMemoryResponse = {
  responseData?: {
    translatedText?: string;
  };
  matches?: {
    translation?: string;
    match?: number;
  }[];
};

const studyMetadata: Record<
  string,
  {
    chineseMeaning: string;
    exams: string[];
  }
> = {
  advancement: {
    chineseMeaning: "进步；发展；推进",
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  artificial: {
    chineseMeaning: "人工的；人造的；不自然的",
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  intelligence: {
    chineseMeaning: "智力；智能；情报",
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  transforming: {
    chineseMeaning: "改变；转变；使改观",
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  privacy: {
    chineseMeaning: "隐私；私密；不受打扰的状态",
    exams: ["CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  authorship: {
    chineseMeaning: "作者身份；著作权；创作来源",
    exams: ["CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  critical: {
    chineseMeaning: "批判性的；关键的；危急的",
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  implications: {
    chineseMeaning: "影响；含义；可能的后果",
    exams: ["CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  participate: {
    chineseMeaning: "参加；参与",
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  thoughtfully: {
    chineseMeaning: "深思熟虑地；体贴地",
    exams: ["CET-6", "IELTS", "TOEFL", "考研英语"],
  },
  rapid: {
    chineseMeaning: "迅速的；快速的",
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL"],
  },
  raises: {
    chineseMeaning: "提出；引起；提高",
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL"],
  },
  understanding: {
    chineseMeaning: "理解；认识；理解力",
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
  },
};

const knownPhonetics: Record<string, string> = {
  advancement: "/ədˈvænsmənt/",
  ai: "/ˌeɪ ˈaɪ/",
  also: "/ˈɔːl.soʊ/",
  and: "/ænd/",
  artificial: "/ˌɑːr.təˈfɪʃ.əl/",
  authorship: "/ˈɑː.θɚ.ʃɪp/",
  changing: "/ˈtʃeɪndʒɪŋ/",
  critical: "/ˈkrɪtɪkəl/",
  future: "/ˈfjuː.tʃɚ/",
  helps: "/hɛlps/",
  however: "/haʊˈevər/",
  how: "/haʊ/",
  implications: "/ˌɪmplɪˈkeɪʃənz/",
  important: "/ɪmˈpɔːrtənt/",
  intelligence: "/ɪnˈtelɪdʒəns/",
  is: "/ɪz/",
  it: "/ɪt/",
  learn: "/lɜːrn/",
  people: "/ˈpiːpəl/",
  participate: "/pɑːrˈtɪsɪpeɪt/",
  privacy: "/ˈpraɪvəsi/",
  questions: "/ˈkwestʃənz/",
  raises: "/ˈreɪzɪz/",
  rapid: "/ˈræpɪd/",
  read: "/riːd/",
  readers: "/ˈriːdərz/",
  reading: "/ˈriːdɪŋ/",
  thoughtfully: "/ˈθɔːtfəli/",
  thinking: "/ˈθɪŋkɪŋ/",
  transforming: "/trænsˈfɔːrmɪŋ/",
  understanding: "/ˌʌndərˈstændɪŋ/",
  work: "/wɝːk/",
  world: "/wɝːld/",
};

const fallbackDefinitions: Record<string, DefinitionResult> = {
  advancement: {
    word: "advancement",
    phonetic: "/ədˈvænsmənt/",
    audioUrl: "",
    pos: "noun",
    meaning: "The process of moving forward, improving, or developing.",
    chineseMeaning: "进步；发展；推进",
    synonyms: ["progress", "development", "improvement", "growth"],
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
  artificial: {
    word: "artificial",
    phonetic: "/ˌɑːrtɪˈfɪʃəl/",
    audioUrl: "",
    pos: "adjective",
    meaning: "Made by people rather than occurring naturally.",
    chineseMeaning: "人工的；人造的；不自然的",
    synonyms: ["synthetic", "man-made", "simulated"],
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
  intelligence: {
    word: "intelligence",
    phonetic: "/ɪnˈtelɪdʒəns/",
    audioUrl: "",
    pos: "noun",
    meaning: "The ability to learn, understand, reason, and solve problems.",
    chineseMeaning: "智力；智能；情报",
    synonyms: ["understanding", "reasoning", "insight"],
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
  transforming: {
    word: "transforming",
    phonetic: "/trænsˈfɔːrmɪŋ/",
    audioUrl: "",
    pos: "verb",
    meaning: "Changing something greatly in form, nature, or character.",
    chineseMeaning: "改变；转变；使改观",
    synonyms: ["changing", "converting", "reshaping"],
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
  privacy: {
    word: "privacy",
    phonetic: "/ˈpraɪvəsi/",
    audioUrl: "",
    pos: "noun",
    meaning: "The state of keeping personal information or life away from public attention.",
    chineseMeaning: "隐私；私密；不受打扰的状态",
    synonyms: ["secrecy", "confidentiality", "isolation"],
    exams: ["CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
  authorship: {
    word: "authorship",
    phonetic: "/ˈɔːθərʃɪp/",
    audioUrl: "",
    pos: "noun",
    meaning: "The state or fact of being the writer or creator of a work.",
    chineseMeaning: "作者身份；著作权；创作来源",
    synonyms: ["creation", "composition", "origination"],
    exams: ["CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
  critical: {
    word: "critical",
    phonetic: "/ˈkrɪtɪkəl/",
    audioUrl: "",
    pos: "adjective",
    meaning: "Involving careful judgment, analysis, or evaluation.",
    chineseMeaning: "批判性的；关键的；危急的",
    synonyms: ["analytical", "evaluative", "judicious"],
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
  implications: {
    word: "implications",
    phonetic: "/ˌɪmplɪˈkeɪʃənz/",
    audioUrl: "",
    pos: "noun",
    meaning: "Possible effects, results, or meanings connected with an action or idea.",
    chineseMeaning: "影响；含义；可能的后果",
    synonyms: ["consequences", "effects", "results"],
    exams: ["CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
  participate: {
    word: "participate",
    phonetic: "/pɑːrˈtɪsɪpeɪt/",
    audioUrl: "",
    pos: "verb",
    meaning: "To take part in an activity or event.",
    chineseMeaning: "参加；参与",
    synonyms: ["join", "engage", "contribute"],
    exams: ["CET-4", "CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
  thoughtfully: {
    word: "thoughtfully",
    phonetic: "/ˈθɔːtfəli/",
    audioUrl: "",
    pos: "adverb",
    meaning: "In a careful, reflective, or considerate way.",
    chineseMeaning: "深思熟虑地；体贴地",
    synonyms: ["carefully", "reflectively", "considerately"],
    exams: ["CET-6", "IELTS", "TOEFL", "考研英语"],
    source: "Local fallback",
  },
};

const definitionSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    word: {
      type: SchemaType.STRING,
      description: "The requested word.",
    },
    phonetic: {
      type: SchemaType.STRING,
      description: "A concise phonetic spelling or IPA-style pronunciation.",
    },
    pos: {
      type: SchemaType.STRING,
      description: "The word's primary part of speech.",
    },
    meaning: {
      type: SchemaType.STRING,
      description: "A clear, concise English definition.",
    },
    synonyms: {
      type: SchemaType.ARRAY,
      description: "A short list of close synonyms.",
      items: {
        type: SchemaType.STRING,
      },
    },
  },
  required: ["word", "phonetic", "pos", "meaning", "synonyms"],
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Gemini API error.";
}

function getFallbackDefinition(word: string): DefinitionResult {
  const normalizedWord = word.toLowerCase();
  const fallback = fallbackDefinitions[normalizedWord];

  if (fallback) {
    return fallback;
  }

  return {
    word,
    phonetic: "",
    audioUrl: "",
    pos: "unknown",
    meaning:
      "Gemini is temporarily unavailable for this word. Please try again later.",
    chineseMeaning: studyMetadata[normalizedWord]?.chineseMeaning,
    synonyms: [],
    exams: studyMetadata[normalizedWord]?.exams,
    source: "Local fallback",
  };
}

function enrichDefinition(definition: DefinitionResult): DefinitionResult {
  const normalizedWord = definition.word.toLowerCase();
  const metadata = studyMetadata[normalizedWord];
  const fallbackPhonetic = knownPhonetics[normalizedWord];

  if (!metadata) {
    return {
      ...definition,
      phonetic: fallbackPhonetic || definition.phonetic || "",
    };
  }

  return {
    ...definition,
    phonetic: fallbackPhonetic || definition.phonetic || "",
    chineseMeaning: definition.chineseMeaning ?? metadata.chineseMeaning,
    exams: definition.exams ?? metadata.exams,
  };
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripMarkup(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirst(patterns: RegExp[], content: string) {
  for (const pattern of patterns) {
    const match = content.match(pattern);

    if (match?.[1]) {
      return stripMarkup(match[1]);
    }
  }

  return "";
}

async function getCambridgeDefinition(word: string) {
  const accessKey = process.env.CAMBRIDGE_API_KEY;

  if (!accessKey) {
    return null;
  }

  const dictCode =
    process.env.CAMBRIDGE_DICT_CODE?.trim() || defaultCambridgeDictCode;
  const url = new URL(
    `${cambridgeBaseUrl}/dictionaries/${dictCode}/search/first`,
  );
  url.searchParams.set("q", word);
  url.searchParams.set("format", "html");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      accessKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Cambridge Dictionary API returned ${response.status}.`);
  }

  const entry = (await response.json()) as {
    entryContent?: string;
    entryLabel?: string;
  };
  const content = entry.entryContent ?? "";

  if (!content) {
    throw new Error("Cambridge Dictionary API returned an empty entry.");
  }

  const phonetic = extractFirst(
    [
      /<span[^>]+class="[^"]*\bipa\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
      /<ipa[^>]*>([\s\S]*?)<\/ipa>/i,
    ],
    content,
  );
  const pos = extractFirst(
    [
      /<span[^>]+class="[^"]*\bpos\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
      /<pos[^>]*>([\s\S]*?)<\/pos>/i,
    ],
    content,
  );
  const meaning = extractFirst(
    [
      /<div[^>]+class="[^"]*\bdef\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<def[^>]*>([\s\S]*?)<\/def>/i,
    ],
    content,
  );

  if (!meaning) {
    throw new Error("Cambridge Dictionary API response had no definition.");
  }

  return {
    word: stripMarkup(entry.entryLabel ?? word),
    phonetic,
    audioUrl: "",
    pos,
    meaning,
    synonyms: [],
    chineseMeaning: studyMetadata[word.toLowerCase()]?.chineseMeaning,
    exams: studyMetadata[word.toLowerCase()]?.exams,
    source: "Cambridge Dictionary API",
  } satisfies DefinitionResult;
}

async function getMyMemoryTranslation(word: string): Promise<string | undefined> {
  const url = new URL(myMemoryBaseUrl);
  url.searchParams.set("q", word);
  url.searchParams.set("langpair", "en|zh");

  const response = await fetch(url.toString());

  if (!response.ok) {
    console.error(`MyMemory API returned ${response.status}.`);
    return undefined;
  }

  const data = (await response.json()) as MyMemoryResponse;
  
  if (data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }

  if (data.matches && data.matches.length > 0) {
    const bestMatch = data.matches.find(m => m.match !== undefined && m.match > 0.5);
    if (bestMatch?.translation) {
      return bestMatch.translation;
    }
    return data.matches[0]?.translation;
  }

  return undefined;
}

async function getFreeDictionaryDefinition(word: string) {
  const response = await fetch(
    `${freeDictionaryBaseUrl}/${encodeURIComponent(word)}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Free Dictionary API returned ${response.status}.`);
  }

  const entries = (await response.json()) as FreeDictionaryEntry[];
  const entry = entries[0];
  const firstMeaning = entry?.meanings?.[0];
  const firstDefinition = firstMeaning?.definitions?.[0];
  const phonetic =
    entry?.phonetic ||
    entry?.phonetics?.find((item) => Boolean(item.text))?.text ||
    "";
  const audioUrl =
    entry?.phonetics?.find((item) => Boolean(item.audio))?.audio || "";
  const synonyms = [
    ...(firstMeaning?.synonyms ?? []),
    ...(firstDefinition?.synonyms ?? []),
  ];

  if (!entry || !firstMeaning || !firstDefinition?.definition) {
    throw new Error("Free Dictionary API response had no definition.");
  }

  const chineseMeaning = await getMyMemoryTranslation(word);

  return {
    word: entry.word ?? word,
    phonetic,
    audioUrl,
    pos: firstMeaning.partOfSpeech ?? "",
    meaning: firstDefinition.definition,
    example: firstDefinition.example,
    synonyms: [...new Set(synonyms)].slice(0, 6),
    chineseMeaning: chineseMeaning || studyMetadata[word.toLowerCase()]?.chineseMeaning,
    exams: studyMetadata[word.toLowerCase()]?.exams,
    source: "Free Dictionary API + MyMemory",
  } satisfies DefinitionResult;
}

async function generateDefinition(apiKey: string, word: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown;

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: definitionSchema,
        },
      });

      const result = await model.generateContent(
        [
          `Define the word "${word}".`,
          "Return only the requested JSON object.",
          "Keep the meaning concise and include 3 to 6 synonyms when possible.",
        ].join(" "),
      );

      return {
        ...(JSON.parse(result.response.text()) as DefinitionResult),
        audioUrl: "",
        chineseMeaning: studyMetadata[word.toLowerCase()]?.chineseMeaning,
        exams: studyMetadata[word.toLowerCase()]?.exams,
        source: "Gemini",
      };
    } catch (error) {
      lastError = error;
      console.error(`Gemini definition request failed with ${modelName}:`, error);
    }
  }

  throw new Error(getErrorMessage(lastError));
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

  const word =
    typeof body === "object" &&
    body !== null &&
    "word" in body &&
    typeof body.word === "string"
      ? body.word.trim()
      : "";

  if (!word) {
    return NextResponse.json(
      { error: "The 'word' field is required." },
      { status: 400 },
    );
  }

  try {
    const freeDictionaryDefinition = await getFreeDictionaryDefinition(word);
    return NextResponse.json(enrichDefinition(freeDictionaryDefinition));
  } catch (error) {
    console.error("Free Dictionary definition request failed:", error);
  }

  try {
    const cambridgeDefinition = await getCambridgeDefinition(word);
    if (cambridgeDefinition) {
      const chineseMeaning = await getMyMemoryTranslation(word);
      return NextResponse.json(enrichDefinition({
        ...cambridgeDefinition,
        chineseMeaning: chineseMeaning || cambridgeDefinition.chineseMeaning
      }));
    }
  } catch (error) {
    console.error("Cambridge definition request failed:", error);
  }

  if (apiKey) {
    try {
      const definition = await generateDefinition(apiKey, word);
      const chineseMeaning = await getMyMemoryTranslation(word);
      return NextResponse.json(enrichDefinition({
        ...definition,
        chineseMeaning: chineseMeaning || definition.chineseMeaning
      }));
    } catch (error) {
      console.error("Gemini definition request failed:", error);
    }
  }

  const fallback = getFallbackDefinition(word);
  const chineseMeaning = await getMyMemoryTranslation(word);
  return NextResponse.json(enrichDefinition({
    ...fallback,
    chineseMeaning: chineseMeaning || fallback.chineseMeaning
  }));
}
