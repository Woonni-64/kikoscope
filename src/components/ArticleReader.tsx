"use client";

import {
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ArticleParagraph } from "@/lib/articles";

type Definition = {
  word: string;
  phonetic: string;
  audioUrl?: string;
  pos: string;
  meaning: string;
  chineseMeaning?: string;
  synonyms: string[];
  exams?: string[];
  source?: string;
};

type PopupState = {
  x: number;
  y: number;
  loading: boolean;
  error: string;
  definition: Definition | null;
};

type ArticleReaderProps = {
  paragraphs: ArticleParagraph[];
};

const mockTranslations: Record<string, string> = {
  "Public libraries are no longer quiet rooms filled only with printed books.":
    "公共图书馆不再只是摆满纸质书的安静房间。",
  "In many modern cities, libraries now provide digital catalogues, online lectures, language learning platforms, and shared study spaces for local residents.":
    "在许多现代城市中，图书馆现在为当地居民提供数字目录、在线讲座、语言学习平台和共享自习空间。",
  "These changes make reading more convenient and more inclusive.":
    "这些变化让阅读更加便利，也更具包容性。",
  "Students can borrow e-books after school, older readers can join online courses, and busy workers can reserve seats before they arrive.":
    "学生可以放学后借阅电子书，年长读者可以参加在线课程，忙碌的上班族也可以提前预约座位。",
  "However, technology should not replace the human value of libraries.":
    "然而，技术不应该取代图书馆的人文价值。",
  "A good library still needs patient librarians, reliable public services, and a welcoming atmosphere where people feel encouraged to learn.":
    "一个好的图书馆仍然需要耐心的 librarians、可靠的公共服务和一个鼓励人们学习的欢迎氛围。",
  "As cities become denser, access to urban nature has become an important question for public policy.":
    "随着城市变得更加密集，能否接触城市自然环境已经成为公共政策中的重要问题。",
  "Parks, riverside paths, and community gardens are not merely decorative spaces; they can shape how residents exercise, socialize, and recover from daily stress.":
    "公园、河畔步道和社区花园不只是装饰性空间；它们会影响居民锻炼、社交以及从日常压力中恢复的方式。",
  "Research in environmental psychology suggests that regular contact with green spaces may reduce anxiety and improve attention.":
    "环境心理学研究表明，定期接触绿色空间可能会减少焦虑并提高注意力。",
  "This does not mean that a small park can solve every urban problem, but it can become part of a broader strategy for public health.":
    "这并不意味着一个小公园可以解决所有城市问题，但它可以成为更广泛的公共健康战略的一部分。",
  "City planners therefore need to treat nature as essential infrastructure.":
    "因此，城市规划者需要将自然视为 essential 基础设施。",
  "If green spaces are distributed fairly and maintained consistently, they can support both ecological resilience and social well-being.":
    "如果绿色空间分布公平且维护一致，它们可以支持生态弹性和社会福祉。",
  "Many students believe that success depends on a few important exams or several long nights of hard work.":
    "许多学生认为成功取决于几场重要考试，或几个熬夜苦学的夜晚。",
  "In fact, steady progress often comes from small habits that are repeated every day.":
    "事实上，稳定的进步往往来自每天重复的小习惯。",
  "For example, a student who reads English for fifteen minutes each morning may learn more words than someone who only studies before a test.":
    "例如，每天早上读15分钟英语的学生可能比只在考试前学习的人学到更多单词。",
  "A student who reviews mistakes after homework can also understand problems more deeply.":
    "在 homework 后复习错误的学生也能更深刻地理解问题。",
  "Good habits are powerful because they reduce pressure.":
    "好习惯很强大，因为它们能减少压力。",
  "When learning becomes part of daily life, students can build confidence step by step and prepare for challenges with a calmer mind.":
    "当学习成为日常生活的一部分时，学生可以逐步建立信心，以更平静的心态准备应对挑战。",
};

function cleanWord(word: string) {
  return word.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
}

function formatPartOfSpeech(pos: string) {
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

  return abbreviations[normalizedPos] ?? pos;
}

function saveVocabulary(definition: Definition, setIsFavorited: (isFavorited: boolean) => void) {
  const stored = window.localStorage.getItem("vocabulary");
  const vocabulary = stored ? (JSON.parse(stored) as Definition[]) : [];
  const exists = vocabulary.some(
    (item) => item.word.toLowerCase() === definition.word.toLowerCase(),
  );

  let newVocabulary: Definition[];
  let isFavorited: boolean;

  if (exists) {
    // 如果单词已存在，从词库中移除（取消收藏）
    newVocabulary = vocabulary.filter(
      (item) => item.word.toLowerCase() !== definition.word.toLowerCase(),
    );
    isFavorited = false;
  } else {
    // 如果单词不存在，添加到词库（收藏）
    newVocabulary = [...vocabulary, definition];
    isFavorited = true;
  }

  window.localStorage.setItem("vocabulary", JSON.stringify(newVocabulary));
  setIsFavorited(isFavorited);
}

function getPopupPosition(x: number, y: number) {
  const popupWidth = 352;
  const popupHeight = 384;
  const margin = 16;

  if (typeof window === "undefined") {
    return { x, y };
  }

  return {
    x: Math.min(
      Math.max(x, margin),
      Math.max(margin, window.innerWidth - popupWidth - margin),
    ),
    y: Math.min(
      Math.max(y, margin),
      Math.max(margin, window.innerHeight - popupHeight - margin),
    ),
  };
}

function getPositionFromElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return getPopupPosition(rect.left, rect.bottom + 8);
}

function playPronunciation(word: string, audioUrl?: string) {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play();
    return;
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }
}

function splitTextForWords(text: string) {
  return text.split(/(\s+)/);
}

function getSentenceKey(paragraphIndex: number, sentenceIndex: number) {
  return `${paragraphIndex}-${sentenceIndex}`;
}

function getMockTranslation(sentence: string) {
  return (
    mockTranslations[sentence] ??
    `[模拟翻译] ${sentence}（这里后续可以替换成真实翻译 API 返回的中文。）`
  );
}

export default function ArticleReader({ paragraphs }: ArticleReaderProps) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [visibleTranslations, setVisibleTranslations] = useState<Set<string>>(
    () => new Set(),
  );
  const [isWordFavorited, setIsWordFavorited] = useState<boolean>(false);
  const [sentenceAnalysis, setSentenceAnalysis] = useState<Record<string, { loading: boolean; error: string; result: string }>>({});
  const activeWordRef = useRef<HTMLElement | null>(null);
  const isPopupOpen = Boolean(popup);

  useEffect(() => {
    if (!isPopupOpen || !activeWordRef.current) {
      return;
    }

    const updatePopupPosition = () => {
      const element = activeWordRef.current;

      if (!element) {
        return;
      }

      const position = getPositionFromElement(element);
      setPopup((current) => (current ? { ...current, ...position } : current));
    };

    window.addEventListener("scroll", updatePopupPosition, true);
    window.addEventListener("resize", updatePopupPosition);

    return () => {
      window.removeEventListener("scroll", updatePopupPosition, true);
      window.removeEventListener("resize", updatePopupPosition);
    };
  }, [isPopupOpen]);

  const lookupWord = async (
    word: string,
    positionOrElement: { x: number; y: number } | HTMLElement,
  ) => {
    const keyword = cleanWord(word);

    if (!keyword) {
      return;
    }

    const position =
      positionOrElement instanceof HTMLElement
        ? getPositionFromElement(positionOrElement)
        : getPopupPosition(positionOrElement.x, positionOrElement.y);

    setPopup({
      ...position,
      loading: true,
      error: "",
      definition: null,
    });

    try {
      const response = await fetch("/api/define", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: keyword }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(errorBody?.error ?? "查询失败，请稍后再试。");
      }

      const definition = (await response.json()) as Definition;
      
      // 检查单词是否已经被收藏
      const stored = window.localStorage.getItem("vocabulary");
      const vocabulary = stored ? (JSON.parse(stored) as Definition[]) : [];
      const isFavorited = vocabulary.some(
        (item) => item.word.toLowerCase() === definition.word.toLowerCase(),
      );
      setIsWordFavorited(isFavorited);
      
      setPopup({ ...position, loading: false, error: "", definition });
    } catch (error) {
      setPopup({
        ...position,
        loading: false,
        error: error instanceof Error ? error.message : "查询失败，请稍后再试。",
        definition: null,
      });
    }
  };

  const handleWordClick = (
    event: MouseEvent<HTMLSpanElement>,
    rawWord: string,
  ) => {
    activeWordRef.current = event.currentTarget;
    lookupWord(rawWord, event.currentTarget);
  };

  const renderInteractiveText = (text: string) =>
    splitTextForWords(text).map((part, index) => {
      if (/^\s+$/.test(part)) {
        return part;
      }

      const word = cleanWord(part);

      if (!word) {
        return part;
      }

      return (
        <span
          key={`${part}-${index}`}
          className="cursor-pointer rounded px-1 py-0.5 transition hover:bg-[#EEDDCC] hover:text-[#8B5E3C]"
          onClick={(event) => handleWordClick(event, part)}
        >
          {part}
        </span>
      );
    });

  const toggleTranslation = (sentenceKey: string) => {
    setVisibleTranslations((current) => {
      const nextVisibleTranslations = new Set(current);

      if (nextVisibleTranslations.has(sentenceKey)) {
        nextVisibleTranslations.delete(sentenceKey);
      } else {
        nextVisibleTranslations.add(sentenceKey);
      }

      return nextVisibleTranslations;
    });
  };

  const analyzeSentence = async (sentenceKey: string, sentence: string) => {
    setSentenceAnalysis((current) => ({
      ...current,
      [sentenceKey]: {
        loading: true,
        error: "",
        result: ""
      }
    }));

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
                  text: `请分析以下英语句子的语法结构，标注主句、从句类型、修饰成分，并用中文简要说明。句子：${sentence}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
          }
        }),
      });

      if (!response.ok) {
        throw new Error("分析失败，请稍后再试。");
      }

      const data = await response.json();
      const generatedContent = data.candidates[0]?.content?.parts[0]?.text;

      if (!generatedContent) {
        throw new Error("分析失败，请稍后再试。");
      }

      setSentenceAnalysis((current) => ({
        ...current,
        [sentenceKey]: {
          loading: false,
          error: "",
          result: generatedContent
        }
      }));
    } catch (error) {
      setSentenceAnalysis((current) => ({
        ...current,
        [sentenceKey]: {
          loading: false,
          error: error instanceof Error ? error.message : "分析失败，请稍后再试。",
          result: ""
        }
      }));
    }
  };

  const clearSentenceAnalysis = (sentenceKey: string) => {
    setSentenceAnalysis((current) => {
      const newAnalysis = { ...current };
      delete newAnalysis[sentenceKey];
      return newAnalysis;
    });
  };

  return (
    <>
      <article className="cd p-7">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#EEDDCC] pb-4">
          <div>
            <h2 className="sf text-xl font-semibold">Full Passage</h2>
            <p className="mt-1 text-sm text-[#8D7B6B]">
              点击正文中的任意英文单词即可查词并收藏。
            </p>
          </div>
          <span className="bg-[#EEDDCC] px-3 py-1 text-sm font-medium text-[#8B5E3C]">
            Interactive
          </span>
        </div>

        <div className="space-y-6 text-xl leading-10">
          {paragraphs.map((paragraph, paragraphIndex) => (
            <p key={`full-paragraph-${paragraphIndex}-${paragraph.text}`}>
              {paragraph.sentences.map((sentence, sentenceIndex) => (
                <span
                  key={`full-sentence-${paragraphIndex}-${sentenceIndex}-${sentence.text}`}
                >
                  {renderInteractiveText(sentence.text)}
                  {sentenceIndex < paragraph.sentences.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          ))}
        </div>
      </article>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="cu text-2xl font-semibold">
            Sentence Structure
          </h2>
          <p className="mt-2 text-[#8D7B6B]">
            每个段落已完整拆成句子，可逐句查看模拟翻译。
          </p>
        </div>

        <div className="space-y-5">
          {paragraphs.map((paragraph, paragraphIndex) => (
            <article
              key={`paragraph-${paragraphIndex}-${paragraph.text}`}
              className="cd p-6"
            >
              <h3 className="sf text-lg font-semibold">
                Paragraph {paragraphIndex + 1}
              </h3>

              <ol className="mt-5 space-y-4">
                {paragraph.sentences.map((sentence, sentenceIndex) => {
                  const sentenceKey = getSentenceKey(paragraphIndex, sentenceIndex);
                  const isTranslationVisible =
                    visibleTranslations.has(sentenceKey);

                  const analysis = sentenceAnalysis[sentenceKey];
                  const hasAnalysis = analysis && (analysis.loading || analysis.result || analysis.error);

                  return (
                    <li
                      key={`sentence-${paragraphIndex}-${sentenceIndex}-${sentence.text}`}
                      className="border-l-2 border-[#8B5E3C] pl-4"
                    >
                      <p className="leading-7">
                        {renderInteractiveText(sentence.text)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTranslation(sentenceKey)}
                          className="border border-[#EEDDCC] px-4 py-2 text-sm font-medium text-[#8D7B6B] transition hover:border-[#8B5E3C] hover:text-[#8B5E3C] rounded"
                        >
                          {isTranslationVisible ? "隐藏翻译" : "显示翻译"}
                        </button>
                        <button
                          type="button"
                          onClick={() => analyzeSentence(sentenceKey, sentence.text)}
                          className="border border-[#EEDDCC] px-4 py-2 text-sm font-medium text-[#8D7B6B] transition hover:border-[#8B5E3C] hover:text-[#8B5E3C] rounded flex items-center gap-1"
                        >
                          🔍 句子分析
                        </button>
                        {hasAnalysis && (
                          <button
                            type="button"
                            onClick={() => clearSentenceAnalysis(sentenceKey)}
                            className="border border-[#EEDDCC] px-4 py-2 text-sm font-medium text-[#8D7B6B] transition hover:border-[#8B5E3C] hover:text-[#8B5E3C] rounded"
                          >
                            关闭分析
                          </button>
                        )}
                      </div>
                      {isTranslationVisible && (
                        <p className="mt-3 bg-[#FDFBF7] p-3 leading-7 text-[#8D7B6B] rounded">
                          {getMockTranslation(sentence.text)}
                        </p>
                      )}
                      {hasAnalysis && (
                        <div className="mt-3 bg-[#FDFBF7] p-4 leading-7 text-[#8D7B6B] rounded">
                          {analysis.loading && <p>分析中...</p>}
                          {analysis.error && <p className="text-red-600">{analysis.error}</p>}
                          {analysis.result && (
                            <div className="whitespace-pre-line">{analysis.result}</div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
        </div>
      </section>

      {popup && (
        <aside
          className="fixed z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-[#EEDDCC] bg-white p-5 shadow-xl"
          style={{
            left: popup.x,
            top: popup.y,
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#8B5E3C]">
              Definition
            </p>
            <div className="flex items-center gap-2">
              {popup.definition && (
                <button
                  type="button"
                  aria-label="收藏单词"
                  title={isWordFavorited ? "已收藏" : "收藏"}
                  onClick={() => saveVocabulary(popup.definition as Definition, setIsWordFavorited)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border transition ${isWordFavorited ? 'border-yellow-400 bg-yellow-50 text-yellow-500' : 'border-[#EEDDCC] text-[#8B5E3C] hover:border-[#8B5E3C] hover:bg-[#EEDDCC]'}`}
                >
                  {isWordFavorited ? "★" : "☆"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  activeWordRef.current = null;
                  setPopup(null);
                }}
                className="text-sm text-[#8D7B6B] transition hover:text-[#8B5E3C]"
              >
                关闭
              </button>
            </div>
          </div>

          {popup.loading && <p className="text-[#8D7B6B]">正在查询...</p>}
          {popup.error && <p className="text-sm text-red-600">{popup.error}</p>}

          {popup.definition && (
            <div className="space-y-4">
              <div>
                <h2 className="sf text-2xl font-semibold">
                  {popup.definition.word}
                </h2>
                <div className="mt-1 text-sm text-[#8D7B6B]">
                  <p className="font-medium text-[#8B5E3C]">
                    {formatPartOfSpeech(popup.definition.pos)}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="播放读音"
                      title="播放读音"
                      onClick={() =>
                        playPronunciation(
                          popup.definition?.word ?? "",
                          popup.definition?.audioUrl,
                        )
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#EEDDCC] text-[#8B5E3C] transition hover:border-[#8B5E3C] hover:bg-[#EEDDCC]"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      >
                        <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                        <path d="M16 10a3 3 0 0 1 0 4" />
                        <path d="M18.5 7.5a7 7 0 0 1 0 9" />
                      </svg>
                    </button>
                    {popup.definition.phonetic && (
                      <p>{popup.definition.phonetic}</p>
                    )}
                  </div>
                </div>
              </div>

              {popup.definition.chineseMeaning && (
                <div className="bg-[#FDFBF7] p-3 rounded">
                  <p className="leading-7 text-[#8B5E3C]">
                    {popup.definition.chineseMeaning}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#EEDDCC] flex items-center justify-start">
                {popup.definition && (
                  <button
                    type="button"
                    onClick={() => {
                      // 保存当前文章URL到localStorage，以便从单词详情页返回
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem("lastArticleUrl", window.location.href);
                      }
                      // 跳转到单词详情页
                      window.location.href = `/word/${encodeURIComponent(popup.definition?.word || "")}`;
                    }}
                    className="border border-[#EEDDCC] px-3 py-1.5 text-sm font-medium text-[#8B5E3C] transition hover:border-[#8B5E3C] hover:bg-[#EEDDCC] rounded"
                  >
                    更多
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
}
