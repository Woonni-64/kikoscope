"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Nav from "@/components/Nav";
import FullReading from "@/components/FullReading";
import { loadAnalysis } from "@/lib/analysis-client";
import SpeakerIcon from "@/components/SpeakerIcon";
import { addToWordbook, getWordbook, isInWordbook, removeFromWordbook, updateWordDefinition } from "@/lib/wordbook";

type VocabularyItem = {
  word: string;
  phonetic: string;
  pos: string;
  chineseMeaning: string;
  definition: string;
  example: string;
  audioUrl?: string;
  lookupPending?: boolean;
  lookupError?: boolean;
  source?: string;
};

type SentenceAnalysis = {
  sentence: string;
  translation: string;
  analysis: string;
  clauses: { type: string; text: string }[];
};

type AnalysisResult = {
  id: string;
  fileName: string;
  title?: string;
  category?: string;
  analyzedAt: string;
  extractedText: string;
  vocabulary: VocabularyItem[];
  sentences: SentenceAnalysis[];
};

type SentenceBlock = {
  globalIndex: number;
  sentence: string;
};

const invalidLinePattern =
  /^\s*(?:Reading\s+Passage\s+\d+\b|Passage\s+\d+\b|You should spend\b|Questions?\s+\d+\b|Questions?\s*[:：]?\s*$|Page\s+\d+(?:\s+of\s+\d+)?\s*$|第\s*\d+\s*页\s*$|TRUE\s*\/\s*FALSE|YES\s*\/\s*NO|NOT\s+GIVEN\s*$|Choose the correct\b|Complete the\b|Do the following statements agree\b)/i;

function splitParagraphIntoSentences(paragraph: string) {
  return (
    paragraph.match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g) ?? []
  )
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function buildParagraphs(article: AnalysisResult | null) {
  if (!article) return [];

  const sourceLines = (article.extractedText || article.sentences.map((item) => item.sentence).join("\n")).split("\n");
  if (sourceLines[0]?.trim().replace(/^#+\s*/, "") === article.title?.trim()) sourceLines.shift();
  const source = sourceLines.join("\n");
  let globalIndex = 0;

  return source
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !invalidLinePattern.test(line))
        .join(" "),
    )
    .filter(Boolean)
    .map((paragraph) => ({
      sentences: splitParagraphIntoSentences(paragraph).map((sentence) => ({
        globalIndex: globalIndex++,
        sentence,
      })),
    }))
    .filter((paragraph) => paragraph.sentences.length > 0);
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [article, setArticle] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [savedWordDetails, setSavedWordDetails] = useState<Record<string, VocabularyItem>>({});
  const lookupRequest = useRef(0);
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [expandedTranslations, setExpandedTranslations] = useState<Set<number>>(new Set());
  const [expandedGrammar, setExpandedGrammar] = useState<Set<number>>(new Set());
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [grammarAnalyses, setGrammarAnalyses] = useState<Record<number, string>>({});
  const [grammarErrors, setGrammarErrors] = useState<Record<number, string>>({});
  const [translatingSentences, setTranslatingSentences] = useState<Set<number>>(new Set());
  const [analyzingGrammar, setAnalyzingGrammar] = useState<Set<number>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [resizeStart, setResizeStart] = useState<{ startX: number; startWidth: number } | null>(null);
  const [highlightedWord, setHighlightedWord] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const data = await loadAnalysis<AnalysisResult>(slug);
        const savedDetailMap: Record<string, VocabularyItem> = {};
        const savedSet = new Set<string>();

        data.vocabulary ||= [];
        const collected = getWordbook().filter(word => word.articleId === slug || word.articleIds?.includes(slug) || (!word.articleId && !word.articleIds?.length && (word.fromArticle === data.fileName || word.fromArticle === data.title)));
        for (const word of collected) {
          const key = normalizeWord(word.word);
          savedSet.add(key);
          savedDetailMap[key] = { word: word.word, phonetic: word.phonetic, pos: word.pos, chineseMeaning: word.chineseMeaning || "", definition: word.meaning, example: "", audioUrl: word.audioUrl };
        }
        data.vocabulary.forEach((word) => {
          const key = normalizeWord(word.word);
          if (isInWordbook(word.word)) {
            savedSet.add(key);
            savedDetailMap[key] = word;
          }
        });

        setArticle(data);
        setSavedWords(savedSet);
        setSavedWordDetails(savedDetailMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : "这篇文章还没找到");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  useEffect(() => {
    if (!resizeStart) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.min(500, Math.max(200, resizeStart.startWidth + resizeStart.startX - event.clientX));
      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setResizeStart(null);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizeStart]);

  const paragraphs = useMemo(() => buildParagraphs(article), [article]);
  const flatSentences = useMemo(() => paragraphs.flatMap((paragraph) => paragraph.sentences), [paragraphs]);

  const lookupWord = async (rawWord: string, sentence: string) => {
    const word = normalizeWord(rawWord);
    if (!word) return;
    const requestId = ++lookupRequest.current;
    setSelectedWord({ word, phonetic: "", pos: "", chineseMeaning: "正在按原句查词…", definition: "", example: sentence, lookupPending: true });
    try {
      const response = await fetch("/api/context-definition", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, sentence }), signal: AbortSignal.timeout(26000),
      });
      const result = await response.json();
      if (!response.ok || !result.definition || !result.chineseMeaning) throw new Error(result.error || "未能按原句选义，请重试。");
      if (lookupRequest.current === requestId) setSelectedWord({ ...result, word, example: sentence });
    } catch (error) {
      if (lookupRequest.current === requestId) setSelectedWord({ word, phonetic: "", pos: "", chineseMeaning: error instanceof Error ? error.message : "查词失败，请重试。", definition: "", example: sentence, lookupError: true });
    }
  };

  const collectWord = (word: VocabularyItem) => {
    if (word.lookupPending || word.lookupError) return;
    const key = normalizeWord(word.word);
    const added = addToWordbook({
      word: word.word,
      phonetic: word.phonetic,
      pos: word.pos,
      meaning: word.definition,
      chineseMeaning: word.chineseMeaning,
      synonyms: [],
      source: "精读收藏",
      fromArticle: article?.title || article?.fileName,
      articleId: slug,
      audioUrl: word.audioUrl,
    });

    setSavedWords((prev) => new Set([...prev, key]));
    setSavedWordDetails((prev) => ({ ...prev, [key]: word }));
    if (added) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const toggleWordCollection = (word: VocabularyItem) => {
    const key = normalizeWord(word.word);
    if (savedWords.has(key)) {
      removeFromWordbook(word.word);
      setSavedWords((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setSavedWordDetails((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    collectWord(word);
  };

  const playWordAudio = (word: VocabularyItem) => {
    if (word.audioUrl) {
      new Audio(word.audioUrl).play();
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearArticleWords = () => {
    Object.values(savedWordDetails).forEach((word) => removeFromWordbook(word.word));
    setSavedWords(new Set());
    setSavedWordDetails({});
  };

  const focusWord = (word: VocabularyItem) => {
    const key = normalizeWord(word.word);
    setHighlightedWord(key);
    const sentence = flatSentences.find(block => block.sentence.toLowerCase().split(/[^a-z’-]+/).includes(key))?.sentence;
    if (sentence) void lookupWord(word.word, sentence);
    else { lookupRequest.current++; setSelectedWord(word); }
    const target = document.querySelector(`[data-word="${key}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightedWord(""), 1800);
  };

  const translateSentence = async (block: SentenceBlock) => {
    setTranslatingSentences((prev) => new Set([...prev, block.globalIndex]));
    try {
      const response = await fetch(`/api/translate?q=${encodeURIComponent(block.sentence)}&langpair=en|zh`);
      const data = (await response.json()) as { translation?: string; translatedText?: string };
      setTranslations((prev) => ({
        ...prev,
        [block.globalIndex]: data.translation || data.translatedText || "这句暂时没翻出来",
      }));
    } catch {
      setTranslations((prev) => ({ ...prev, [block.globalIndex]: "这句暂时没翻出来" }));
    } finally {
      setTranslatingSentences((prev) => {
        const next = new Set(prev);
        next.delete(block.globalIndex);
        return next;
      });
    }
  };

  const analyzeGrammar = async (block: SentenceBlock) => {
    if (analyzingGrammar.has(block.globalIndex)) return;
    setGrammarErrors((prev) => ({ ...prev, [block.globalIndex]: "" }));
    setAnalyzingGrammar((prev) => new Set([...prev, block.globalIndex]));
    try {
      const response = await fetch(`/api/grammar-analysis?q=${encodeURIComponent(block.sentence)}`);
      const data = (await response.json()) as { analysis?: string; error?: string };
      if (!response.ok || !data.analysis?.trim()) {
        throw new Error(data.error || "AI 没有返回解析内容，请重试。");
      }
      const analysis = data.analysis;
      setGrammarAnalyses((prev) => ({
        ...prev,
        [block.globalIndex]: analysis,
      }));
    } catch (error) {
      setGrammarErrors((prev) => ({ ...prev, [block.globalIndex]: error instanceof Error ? error.message : "连接失败，请重试。" }));
    } finally {
      setAnalyzingGrammar((prev) => {
        const next = new Set(prev);
        next.delete(block.globalIndex);
        return next;
      });
    }
  };

  const toggleTranslation = (block: SentenceBlock) => {
    setExpandedTranslations((prev) => {
      const next = new Set(prev);
      if (next.has(block.globalIndex)) next.delete(block.globalIndex);
      else next.add(block.globalIndex);
      return next;
    });
    if (!expandedTranslations.has(block.globalIndex) && !translations[block.globalIndex]) {
      void translateSentence(block);
    }
  };

  const toggleGrammar = (block: SentenceBlock) => {
    setExpandedGrammar((prev) => {
      const next = new Set(prev);
      if (next.has(block.globalIndex)) next.delete(block.globalIndex);
      else next.add(block.globalIndex);
      return next;
    });
    if (!expandedGrammar.has(block.globalIndex) && !grammarAnalyses[block.globalIndex]) {
      void analyzeGrammar(block);
    }
  };

  const renderClickableSentence = (sentence: string) => {
    return sentence.split(/(\b[A-Za-z][A-Za-z'-]*\b)/g).map((part, index) => {
      const key = normalizeWord(part);
      if (!key) return <span key={`${part}-${index}`}>{part}</span>;
      return (
        <span
          key={`${part}-${index}`}
          data-word={key}
          onClick={() => void lookupWord(part, sentence)}
          className={`cursor-pointer rounded px-0.5 transition hover:bg-[#F0E8D8] hover:text-[#8B5E3C] ${
            highlightedWord === key ? "bg-[#EEDDCC] text-[#8B5E3C]" : ""
          }`}
        >
          {part}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Nav />
        <main className="mx-auto max-w-3xl px-6 py-12 text-center text-[#8D7B6B]">Kiki 正在轻轻翻开文章...</main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Nav />
        <main className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="mb-4 text-[#8D7B6B]">{error || "这篇文章还没找到"}</p>
          <Link href="/import" className="text-[#8B5E3C] hover:underline">回到交给Kiki</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-12 pb-36 lg:pb-12">
        <section className="mb-8 max-w-3xl">
          <Link href="/import" className="mb-5 inline-block text-sm text-[#8B5E3C] hover:underline">
            ← 返回文件列表
          </Link>
          <h1 className="sf mb-2 text-3xl font-bold text-[#8B5E3C]">
            {article.title || article.fileName.replace(/\.[^.]+$/, "")}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm text-[#8D7B6B]">
            <span>来源：{article.fileName}</span>
            <span>归档时间：{article.analyzedAt}</span>
            {article.category && <span>话题：{article.category}</span>}
          </div>
        </section>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <FullReading key={article.id} article={article} />
            <section className="mb-4">
              <h2 className="text-xl font-semibold text-[#3E2723]">正文精读</h2>
            </section>

            {paragraphs.length === 0 ? (
              <section className="rounded-lg border border-[#EEDDCC] bg-white p-5 text-[#8D7B6B]">
                本文暂无正文
              </section>
            ) : (
              <article>
                {paragraphs.map((paragraph, paragraphIndex) => (
                  <div key={paragraphIndex} className="mb-6 space-y-3">
                    {paragraph.sentences.map((block) => {
                      const translationOpen = expandedTranslations.has(block.globalIndex);
                      const grammarOpen = expandedGrammar.has(block.globalIndex);
                      const sentenceActive = translationOpen || grammarOpen;

                      return (
                        <section
                          id={`sentence-${block.globalIndex}`}
                          key={`${block.sentence}-${block.globalIndex}`}
                          className={`rounded-lg border p-4 leading-8 text-[#3E2723] transition duration-300 ease-in-out ${
                            sentenceActive ? "border-[#D4B896] bg-[#FDF8F3]" : "border-[#EEDDCC] bg-white"
                          }`}
                        >
                          <div className="flex flex-col gap-3">
                            <p>{renderClickableSentence(block.sentence)}</p>
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => toggleTranslation(block)}
                                className={`rounded-[20px] border px-3 py-1 text-xs transition duration-200 ease-in-out ${
                                  translationOpen
                                    ? "border-[#8B5E3C] bg-[#8B5E3C] text-white"
                                    : "border-[#EEDDCC] bg-[#FDFBF7] text-[#8D7B6B] hover:border-[#D4B896] hover:bg-[#F5EDE3] hover:text-[#8B5E3C]"
                                }`}
                              >
                                译
                              </button>
                              <button
                                onClick={() => toggleGrammar(block)}
                                className={`rounded-[20px] border px-3 py-1 text-xs transition duration-200 ease-in-out ${
                                  grammarOpen
                                    ? "border-[#8B5E3C] bg-[#8B5E3C] text-white"
                                    : "border-[#EEDDCC] bg-[#FDFBF7] text-[#8D7B6B] hover:border-[#D4B896] hover:bg-[#F5EDE3] hover:text-[#8B5E3C]"
                                }`}
                              >
                                语法分析
                              </button>
                            </div>
                          </div>

                          {translationOpen && (
                            <div className="mt-3 border-l-2 border-[#EEDDCC] pl-4 text-sm leading-7 text-[#8D7B6B]">
                              {translatingSentences.has(block.globalIndex) && !translations[block.globalIndex] ? (
                                <p>Kiki 正在翻译...</p>
                              ) : (
                                <p>{translations[block.globalIndex] || "这句暂时没翻出来"}</p>
                              )}
                            </div>
                          )}

                          {grammarOpen && (
                            <div className="mt-3 whitespace-pre-wrap rounded-xl bg-[#FDFBF7] p-4 text-sm leading-7 text-[#3E2723]">
                              {analyzingGrammar.has(block.globalIndex) ? (
                                <p className="text-[#8D7B6B]">Kiki 正在拆开这句话...</p>
                              ) : grammarErrors[block.globalIndex] ? (
                                <div role="alert">
                                  <p>{grammarErrors[block.globalIndex]}</p>
                                  <button type="button" className="mt-2 underline" onClick={() => void analyzeGrammar(block)}>重试解析</button>
                                </div>
                              ) : (
                                <div className="space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"><ReactMarkdown>{grammarAnalyses[block.globalIndex]}</ReactMarkdown></div>
                              )}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                ))}
              </article>
            )}

            <section className="mt-10 text-center">
              <Link href={`/article/${slug}/quiz`} className="inline-flex rounded-full bg-[#8B5E3C] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#6D4A2F]">
                去练习 →
              </Link>
            </section>
          </div>

          <aside
            className={`fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-[#EEDDCC] bg-[#FDFBF7] shadow-lg lg:sticky lg:top-20 lg:inset-x-auto lg:bottom-auto lg:z-auto lg:shrink-0 lg:shadow-sm ${
              sidebarCollapsed ? "p-3" : "max-h-[58vh] overflow-auto p-4 lg:max-h-[calc(100vh-7rem)]"
            }`}
            style={{ width: sidebarCollapsed ? undefined : `${sidebarWidth}px` }}
          >
            {!sidebarCollapsed && (
              <div
                className="absolute left-0 top-0 hidden h-full w-1 cursor-col-resize bg-transparent transition hover:bg-[#8B5E3C] lg:block"
                onMouseDown={(event) => setResizeStart({ startX: event.clientX, startWidth: sidebarWidth })}
                role="separator"
                aria-orientation="vertical"
                aria-label="调整生词栏宽度"
              />
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="mb-3 rounded-full border border-[#EEDDCC] bg-white px-3 py-1 text-xs text-[#8B5E3C] transition hover:border-[#8B5E3C]"
            >
              {sidebarCollapsed ? "展开" : "收起"}
            </button>

            {sidebarCollapsed ? (
              <div className="text-sm font-medium text-[#8B5E3C]">📝 本文生词 · {savedWords.size}</div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[#3E2723]">📝 本文生词</h2>
                  {savedWords.size > 0 && (
                    <button
                      type="button"
                      onClick={clearArticleWords}
                      className="text-xs text-[#8D7B6B] hover:text-[#8B5E3C]"
                    >
                      清空
                    </button>
                  )}
                </div>

                {savedWords.size === 0 ? (
                  <p className="text-sm leading-6 text-[#8D7B6B]">📝 点击单词即可收藏</p>
                ) : (
                  <div className="space-y-2">
                    {Object.values(savedWordDetails).map((word) => (
                      <button
                        key={word.word}
                        type="button"
                        onClick={() => focusWord(word)}
                        className="w-full rounded-xl border border-[#EEDDCC] bg-white p-3 text-left transition hover:border-[#8B5E3C]"
                      >
                        <span className="sf block text-base font-semibold text-[#8B5E3C]">{word.word}</span>
                        <span className="mt-1 block text-xs text-[#8D7B6B]">{word.chineseMeaning}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>

      {selectedWord && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-6 pt-24"
          onClick={() => { lookupRequest.current++; setSelectedWord(null); }}
        >
          <section
            className="w-80 rounded-2xl border border-[#EEDDCC] bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="sf text-2xl font-bold text-[#8B5E3C]">{selectedWord.word}</h2>
                <p className="text-sm text-[#8D7B6B]">{selectedWord.phonetic || "音标暂缺"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={savedWords.has(normalizeWord(selectedWord.word)) ? "取消收藏" : "收藏单词"}
                  disabled={selectedWord.lookupPending || selectedWord.lookupError}
                  onClick={() => toggleWordCollection(selectedWord)}
                  className={`text-lg leading-none transition hover:scale-110 ${
                    savedWords.has(normalizeWord(selectedWord.word)) ? "text-[#D4A017]" : "text-[#8D7B6B]"
                  }`}
                >
                  {savedWords.has(normalizeWord(selectedWord.word)) ? "★" : "☆"}
                </button>
                <button onClick={() => { lookupRequest.current++; setSelectedWord(null); }} className="text-[#8D7B6B] hover:text-[#8B5E3C]">×</button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => playWordAudio(selectedWord)}
              className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#EEDDCC] px-3 py-1 text-xs text-[#8D7B6B] transition hover:border-[#8B5E3C] hover:text-[#8B5E3C]"
            >
              <SpeakerIcon />
              发音
            </button>

            {selectedWord.source === "context" && <p className="mb-2 text-xs text-[#8B5E3C]">按文章原句选义</p>}
            {selectedWord.source === "context" && savedWords.has(normalizeWord(selectedWord.word)) && <button className="mb-2 block text-sm underline" onClick={() => {
              if (updateWordDefinition(selectedWord.word, { meaning: selectedWord.definition, chineseMeaning: selectedWord.chineseMeaning, pos: selectedWord.pos })) {
                setSavedWordDetails(prev => ({ ...prev, [normalizeWord(selectedWord.word)]: selectedWord }));
                setShowToast(true); setTimeout(() => setShowToast(false), 3000);
              }
            }}>更新已收藏词义</button>}
            {selectedWord.lookupError && <button className="mb-2 text-sm underline" onClick={() => void lookupWord(selectedWord.word, selectedWord.example)}>重试语境查词</button>}
            <p className="mb-2 text-sm text-[#8D7B6B]">{selectedWord.pos || "词性暂缺"}</p>
            <p className="font-medium text-[#3E2723]">{selectedWord.chineseMeaning || "中文释义暂缺"}</p>
            <p className="mt-2 text-sm leading-6 text-[#8D7B6B]">{selectedWord.definition || "英文释义暂缺"}</p>
            {selectedWord.example && (
              <p className="mt-3 border-l-2 border-[#EEDDCC] pl-3 text-sm leading-6 text-[#8D7B6B]">
                {selectedWord.example}
              </p>
            )}
            <div className="mt-4 text-right">
              <button
                onClick={() => { lookupRequest.current++; setSelectedWord(null); }}
                className="rounded-full border border-[#EEDDCC] px-5 py-2 text-sm font-medium text-[#8B5E3C] transition hover:border-[#8B5E3C]"
              >
                关闭
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="py-8 text-center text-sm text-[#8D7B6B]">
        Made with 🐾 by Kikoscope · 一个安静的雅思阅读角落
      </footer>
      {showToast && (
        <div className="toast fixed bottom-6 right-6 z-50 rounded-lg bg-[#8B5E3C] px-4 py-3 text-white shadow-lg">
          🐾 已收进词库
        </div>
      )}
    </div>
  );
}
