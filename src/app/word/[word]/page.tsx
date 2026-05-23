"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Definition {
  word: string;
  phonetic: string;
  audioUrl?: string;
  pos: string;
  meaning: string;
  chineseMeaning?: string;
  synonyms: string[];
  exams?: string[];
  source?: string;
}

interface Example {
  english: string;
  chinese: string;
  source?: string;
}

interface SynonymWithDetails {
  word: string;
  pos: string;
  chineseMeaning?: string;
}

interface Collocation {
  phrase: string;
}

interface AuthenticExample {
  english: string;
  chinese: string;
  source: string;
}

export default function WordDetailPage() {
  const router = useRouter();
  const { word: wordParam } = useParams<{ word: string }>();
  const word = wordParam || "";

  const [definition, setDefinition] = useState<Definition | null>(null);
  const [examples, setExamples] = useState<Example[]>([]);
  const [synonymsWithDetails, setSynonymsWithDetails] = useState<SynonymWithDetails[]>([]);
  const [collocations, setCollocations] = useState<Collocation[]>([]);
  const [authenticExamples, setAuthenticExamples] = useState<AuthenticExample[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 检查单词是否已收藏
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("vocabulary");
      if (stored) {
        const vocabulary = JSON.parse(stored) as Definition[];
        const favorited = vocabulary.some(
          (item) => item.word.toLowerCase() === word.toLowerCase()
        );
        setIsFavorited(favorited);
      }
    }
  }, [word]);

  // 获取单词定义
  useEffect(() => {
    if (!word) {
      setLoading(false);
      return;
    }

    const fetchDefinition = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/define", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ word }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch definition");
        }

        const data = await response.json();
        setDefinition(data);
      } catch (err) {
        setError("Failed to fetch word definition");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinition();
  }, [word]);

  // 生成例句
  useEffect(() => {
    if (!definition) return;

    const fetchExamples = async () => {
      try {
        const response = await fetch("/api/examples", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ word: definition.word }),
        });

        if (response.ok) {
          const data = await response.json();
          // 转换API返回的格式为我们需要的格式
          const formattedExamples = data.examples.map((example: { en: string; zh: string }) => ({
            english: example.en,
            chinese: example.zh
          }));
          setExamples(formattedExamples);
        } else {
          // 如果API调用失败，使用模拟数据
          const mockExamples: Example[] = [
            {
              english: `The ${definition.word} of technology has transformed our daily lives.`,
              chinese: `技术的${definition.chineseMeaning || definition.word}已经改变了我们的日常生活。`
            },
            {
              english: `She has a deep understanding of the ${definition.word} involved.`,
              chinese: `她对涉及的${definition.chineseMeaning || definition.word}有深刻的理解。`
            },
            {
              english: `The article discusses the implications of this new ${definition.word}.`,
              chinese: `文章讨论了这个新${definition.chineseMeaning || definition.word}的影响。`
            }
          ];
          setExamples(mockExamples);
        }
      } catch (error) {
        console.error("Failed to fetch examples:", error);
        // 发生错误时使用模拟数据
        const mockExamples: Example[] = [
          {
            english: `The ${definition.word} of technology has transformed our daily lives.`,
            chinese: `技术的${definition.chineseMeaning || definition.word}已经改变了我们的日常生活。`
          },
          {
            english: `She has a deep understanding of the ${definition.word} involved.`,
            chinese: `她对涉及的${definition.chineseMeaning || definition.word}有深刻的理解。`
          },
          {
            english: `The article discusses the implications of this new ${definition.word}.`,
            chinese: `文章讨论了这个新${definition.chineseMeaning || definition.word}的影响。`
          }
        ];
        setExamples(mockExamples);
      }
    };

    fetchExamples();
  }, [definition]);

  // 获取近义词详情
  useEffect(() => {
    if (!definition || !definition.synonyms.length) return;

    const fetchSynonymDetails = async () => {
      const details: SynonymWithDetails[] = [];
      
      // 只获取前3个近义词的详情
      const synonymsToFetch = definition.synonyms.slice(0, 3);
      
      for (const synonym of synonymsToFetch) {
        try {
          const response = await fetch("/api/define", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ word: synonym }),
          });

          if (response.ok) {
            const data = await response.json();
            details.push({
              word: data.word,
              pos: data.pos,
              chineseMeaning: data.chineseMeaning
            });
          }
        } catch (err) {
          console.error(`Failed to fetch details for synonym: ${synonym}`, err);
        }
      }

      setSynonymsWithDetails(details);
    };

    fetchSynonymDetails();
  }, [definition]);

  // 获取常见搭配
  useEffect(() => {
    if (!definition) return;

    const fetchCollocations = async () => {
      try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-lite:generateContent?key=" + process.env.GEMINI_API_KEY, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `请为单词 '${definition.word}' 提供 2-4 个最常见的学习者搭配，格式为 'word + 搭配'，如 'be adequate for'。`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedContent = data.candidates[0]?.content?.parts[0]?.text;
          
          if (generatedContent) {
            // 解析生成的内容
            const collocationList = generatedContent.split('\n').filter((line: string) => line.trim() !== '');
            const formattedCollocations = collocationList.map((collocation: string) => ({
              phrase: collocation.trim()
            }));
            setCollocations(formattedCollocations);
          }
        }
      } catch (error) {
        console.error("Failed to fetch collocations:", error);
        // 提供默认搭配
        const defaultCollocations: Collocation[] = [
          { phrase: `${definition.word} + of` },
          { phrase: `the ${definition.word} that` },
          { phrase: `very ${definition.word}` }
        ];
        setCollocations(defaultCollocations);
      }
    };

    fetchCollocations();
  }, [definition]);

  // 获取真题例句
  useEffect(() => {
    if (!definition) return;

    const fetchAuthenticExamples = async () => {
      try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-lite:generateContent?key=" + process.env.GEMINI_API_KEY, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `请为单词 '${definition.word}' 生成 2-3 个真题例句，每个例句包含英文原文、中文翻译和来源（如"雅思真题"、"外刊"等）。返回 JSON 格式：{"examples": [{"english": "...", "chinese": "...", "source": "..."}]}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedContent = data.candidates[0]?.content?.parts[0]?.text;
          
          if (generatedContent) {
            const result = JSON.parse(generatedContent);
            if (result.examples && Array.isArray(result.examples)) {
              setAuthenticExamples(result.examples);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch authentic examples:", error);
        // 提供默认真题例句
        const defaultExamples: AuthenticExample[] = [
          {
            english: `The importance of ${definition.word} cannot be overstated.`,
            chinese: `不能夸大${definition.chineseMeaning || definition.word}的重要性。`,
            source: "模拟真题"
          },
          {
            english: `According to the passage, ${definition.word} plays a crucial role.`,
            chinese: `根据文章，${definition.chineseMeaning || definition.word}发挥着关键作用。`,
            source: "模拟真题"
          }
        ];
        setAuthenticExamples(defaultExamples);
      }
    };

    fetchAuthenticExamples();
  }, [definition]);

  // 收藏单词
  const handleFavorite = () => {
    if (!definition) return;

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("vocabulary");
      const vocabulary = stored ? JSON.parse(stored) as Definition[] : [];
      
      if (!isFavorited) {
        // 收藏单词
        const updatedVocabulary = [...vocabulary, definition];
        window.localStorage.setItem("vocabulary", JSON.stringify(updatedVocabulary));
        setIsFavorited(true);
      } else {
        // 取消收藏
        const updatedVocabulary = vocabulary.filter(
          (item) => item.word.toLowerCase() !== definition.word.toLowerCase()
        );
        window.localStorage.setItem("vocabulary", JSON.stringify(updatedVocabulary));
        setIsFavorited(false);
      }
    }
  };

  // 播放读音
  const playPronunciation = () => {
    if (!definition) return;

    if (definition.audioUrl) {
      const audio = new Audio(definition.audioUrl);
      audio.play();
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(definition.word);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 格式化词性
  const formatPartOfSpeech = (pos: string) => {
    const normalizedPos = pos.trim().toLowerCase();
    const abbreviations: Record<string, string> = {
      adjective: "adj.",
      adverb: "adv.",
      conjunction: "conj.",
      determiner: "det.",
      interjection: "int.",
      noun: "n.",
      numeral: "num.",
      preposition: "prep.",
      pronoun: "pron.",
      verb: "v.",
    };

    return abbreviations[normalizedPos] || pos;
  };

  // 返回阅读页
  const handleBackToReading = () => {
    // 尝试从localStorage获取之前的文章URL
    if (typeof window !== "undefined") {
      const lastArticleUrl = window.localStorage.getItem("lastArticleUrl");
      if (lastArticleUrl) {
        router.push(lastArticleUrl);
        return;
      }
    }
    // 如果没有记录，返回首页
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !definition) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-4">
            {error || "单词不存在"}
          </h1>
          <button
            onClick={handleBackToReading}
            className="rounded-md bg-teal-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-900"
          >
            返回阅读
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-neutral-950">
      {/* 导航栏 */}
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-950">
            Kikoscope 🐾
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-neutral-600">
            <Link href="/" className="transition hover:text-neutral-950">
              首页
            </Link>
            <Link href="/vocabulary" className="transition hover:text-neutral-950">
              我的词库
            </Link>
            <Link href="/quiz" className="transition hover:text-neutral-950">
              练习
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">
        {/* 返回按钮 */}
        <div className="mb-8">
          <button
            onClick={handleBackToReading}
            className="flex items-center gap-2 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-teal-700 hover:text-teal-800"
          >
            ← 返回阅读
          </button>
        </div>

        {/* 单词核心信息 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm mb-8 relative">
          {/* 星标收藏按钮 - 右上角 */}
          <div className="absolute top-4 right-4">
            <button
              type="button"
              aria-label="收藏单词"
              title={isFavorited ? "已收藏" : "收藏"}
              onClick={handleFavorite}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${isFavorited ? 'border-yellow-400 bg-yellow-50 text-yellow-500' : 'border-neutral-300 text-teal-800 hover:border-teal-700 hover:bg-teal-50'}`}
            >
              {isFavorited ? "★" : "☆"}
            </button>
          </div>
          
          <div>
            <h1 className="text-4xl font-semibold text-neutral-950 mb-2">
              {definition.word}
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg font-medium text-neutral-700">
                {formatPartOfSpeech(definition.pos)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={playPronunciation}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 text-teal-800 transition hover:border-teal-700 hover:bg-teal-50"
                  aria-label="播放读音"
                >
                  🔊
                </button>
                {definition.phonetic && (
                  <span className="text-neutral-600">{definition.phonetic}</span>
                )}
              </div>
            </div>
            <p className="text-lg leading-7 text-neutral-800 mb-4">
              {definition.meaning}
            </p>
            {definition.chineseMeaning && (
              <div className="rounded-md bg-stone-50 p-4">
                <h3 className="text-sm font-medium text-neutral-500 mb-2">
                  中文释义
                </h3>
                <p className="text-lg leading-7 text-neutral-800">
                  {definition.chineseMeaning}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 例句 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-neutral-950 mb-6">
            例句
          </h2>
          <div className="space-y-6">
            {examples.map((example, index) => (
              <div key={index} className="border-l-2 border-teal-700 pl-4">
                <p className="leading-7 text-neutral-800 mb-2">
                  {example.english}
                </p>
                <p className="leading-7 text-neutral-600">
                  {example.chinese}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 近义词 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-neutral-950 mb-6">
            近义词
          </h2>
          <div className="space-y-4">
            {synonymsWithDetails.map((synonym, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-md hover:bg-stone-50 transition">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">
                    {synonym.word}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-neutral-600">
                      {formatPartOfSpeech(synonym.pos)}
                    </span>
                    {synonym.chineseMeaning && (
                      <span className="text-sm text-neutral-600">
                        {synonym.chineseMeaning}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/word/${synonym.word}`}
                  className="text-sm font-medium text-teal-800 transition hover:text-teal-900"
                >
                  查看详情 →
                </Link>
              </div>
            ))}
            {synonymsWithDetails.length === 0 && (
              <p className="text-neutral-600">暂无近义词数据</p>
            )}
          </div>
        </div>

        {/* 常见搭配 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-neutral-950 mb-6">
            常见搭配
          </h2>
          <div className="space-y-3">
            {collocations.map((collocation, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-md bg-stone-50">
                <span className="text-teal-800 font-medium">{index + 1}.</span>
                <span className="text-neutral-800">{collocation.phrase}</span>
              </div>
            ))}
            {collocations.length === 0 && (
              <p className="text-neutral-600">暂无搭配数据</p>
            )}
          </div>
        </div>

        {/* 真题例句 */}
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950 mb-6">
            真题例句
          </h2>
          <div className="space-y-6">
            {authenticExamples.map((example, index) => (
              <div key={index} className="border-l-2 border-teal-700 pl-4">
                <p className="leading-7 text-neutral-800 mb-2">
                  {example.english}
                </p>
                <p className="leading-7 text-neutral-600 mb-2">
                  {example.chinese}
                </p>
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-teal-50 text-teal-800">
                  {example.source}
                </span>
              </div>
            ))}
            {authenticExamples.length === 0 && (
              <p className="text-neutral-600">暂无真题例句</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
