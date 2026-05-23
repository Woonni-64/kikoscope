"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

interface VocabularyItem {
  word: string;
  phonetic: string;
  pos: string;
  chineseMeaning: string;
  definition: string;
  example: string;
}

interface SentenceAnalysis {
  sentence: string;
  translation: string;
  analysis: string;
  clauses: { type: string; text: string }[];
}

interface Question {
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  reference: string;
}

interface AnalysisResult {
  id: string;
  fileName: string;
  analyzedAt: string;
  extractedText: string;
  vocabulary: VocabularyItem[];
  sentences: SentenceAnalysis[];
  questions: Question[];
}

export default function AnalysisResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(new Set());
  const [favoritedWords, setFavoritedWords] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analyze-document?id=${id}`);
        if (!response.ok) {
          throw new Error("获取分析结果失败");
        }
        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "未知错误");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();

    const storedVocab = localStorage.getItem("vocabulary");
    if (storedVocab) {
      try {
        const vocab = JSON.parse(storedVocab) as VocabularyItem[];
        setFavoritedWords(new Set(vocab.map((item) => item.word.toLowerCase())));
      } catch {
        setFavoritedWords(new Set());
      }
    }
  }, [id]);

  const toggleSentenceExpand = (index: number) => {
    setExpandedSentences((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleFavoriteWord = (word: VocabularyItem) => {
    const isFavorited = favoritedWords.has(word.word.toLowerCase());
    
    const storedVocab = localStorage.getItem("vocabulary");
    const vocab = storedVocab ? (JSON.parse(storedVocab) as VocabularyItem[]) : [];
    
    let newVocab;
    if (isFavorited) {
      newVocab = vocab.filter((item) => item.word.toLowerCase() !== word.word.toLowerCase());
      setFavoritedWords((prev) => {
        const next = new Set(prev);
        next.delete(word.word.toLowerCase());
        return next;
      });
    } else {
      newVocab = [...vocab, word];
      setFavoritedWords((prev) => new Set([...prev, word.word.toLowerCase()]));
    }
    
    localStorage.setItem("vocabulary", JSON.stringify(newVocab));
    
    if (!isFavorited) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Nav />
        <main className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-[#8D7B6B]">Kiki 正在帮你整理...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Nav />
        <main className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-[#8D7B6B]">{error || "分析结果不存在"}</p>
            <Link href="/import" className="text-[#8B5E3C] hover:underline">
              回到交给Kiki
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Nav />
      
      <main className="mx-auto max-w-4xl px-6 py-12">
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="sf text-3xl font-bold text-[#8B5E3C] mb-2">Kiki 整理好了</h1>
              <p className="text-[#8D7B6B]">
                文件：{analysis.fileName} | 分析时间：{analysis.analyzedAt}
              </p>
            </div>
            <Link
              href={`/article/${id}`}
              className="bg-[#8B5E3C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              去精读 →
            </Link>
          </div>
        </section>

        {analysis.vocabulary.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#3E2723] mb-4 flex items-center gap-2">
              <span>📚</span>
              遇见的生词
              <span className="text-sm font-normal text-[#8D7B6B]">({analysis.vocabulary.length}个)</span>
            </h2>
            <div className="grid gap-4">
              {analysis.vocabulary.map((word, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#EEDDCC] rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="sf text-xl font-bold text-[#8B5E3C]">{word.word}</span>
                        <span className="text-[#8D7B6B] text-sm">{word.phonetic}</span>
                        <span className="bg-[#EEDDCC] text-[#8B5E3C] text-xs px-2 py-0.5 rounded">
                          {word.pos}
                        </span>
                      </div>
                      <p className="text-[#8B5E3C] mb-2">{word.chineseMeaning}</p>
                      <p className="text-[#8D7B6B] text-sm mb-2">{word.definition}</p>
                      <p className="text-[#8D7B6B] text-sm italic">例：{word.example}</p>
                    </div>
                    <button
                      onClick={() => toggleFavoriteWord(word)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                        favoritedWords.has(word.word.toLowerCase())
                          ? "border-yellow-400 bg-yellow-50 text-yellow-500"
                          : "border-[#EEDDCC] text-[#8D7B6B] hover:border-[#8B5E3C] hover:text-[#8B5E3C]"
                      }`}
                    >
                      {favoritedWords.has(word.word.toLowerCase()) ? "★" : "☆"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {analysis.sentences.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#3E2723] mb-4 flex items-center gap-2">
              <span>📝</span>
              句子小纸条
              <span className="text-sm font-normal text-[#8D7B6B]">({analysis.sentences.length}句)</span>
            </h2>
            <div className="space-y-4">
              {analysis.sentences.map((sentence, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#EEDDCC] rounded-xl overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-[#FDFBF7] transition-colors"
                    onClick={() => toggleSentenceExpand(index)}
                  >
                    <p className="text-[#3E2723] mb-2">{sentence.sentence}</p>
                    <p className="text-[#8D7B6B]">{sentence.translation}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-[#8B5E3C]">
                      <span>{expandedSentences.has(index) ? "收起" : "看看结构"}</span>
                      <span>{expandedSentences.has(index) ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {expandedSentences.has(index) && (
                    <div className="border-t border-[#EEDDCC] p-4 bg-[#FDFBF7]">
                      <p className="text-[#8D7B6B] mb-3">{sentence.analysis}</p>
                      <div className="space-y-2">
                        {sentence.clauses.map((clause, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="bg-[#EEDDCC] text-[#8B5E3C] text-xs px-2 py-0.5 rounded shrink-0">
                              {clause.type}
                            </span>
                            <span className="text-[#3E2723]">{clause.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {analysis.questions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#3E2723] mb-4 flex items-center gap-2">
              <span>❓</span>
              练习小纸条
              <span className="text-sm font-normal text-[#8D7B6B]">({analysis.questions.length}题)</span>
            </h2>
            <div className="space-y-4">
              {analysis.questions.map((question, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#EEDDCC] rounded-xl p-4"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className="bg-[#8B5E3C] text-white text-xs px-2 py-0.5 rounded shrink-0">
                      {question.type === "multiple-choice" ? "选择题" : 
                       question.type === "true-false" ? "判断题" : "填空题"}
                    </span>
                    <span className="text-[#3E2723]">{question.question}</span>
                  </div>
                  {question.options && (
                    <div className="ml-8 mb-3 space-y-2">
                      {question.options.map((option, i) => (
                        <div key={i} className={`text-sm ${
                          String.fromCharCode(65 + i) === question.answer 
                            ? "text-green-600 font-medium" 
                            : "text-[#8D7B6B]"
                        }`}>
                          {String.fromCharCode(65 + i)}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#8D7B6B]">答案：</span>
                      <span className="text-green-600 font-medium">{question.answer}</span>
                    </div>
                    <div>
                      <span className="text-sm text-[#8D7B6B]">解析：</span>
                      <p className="text-sm text-[#3E2723]">{question.explanation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#8D7B6B]">原文依据：</span>
                      <span className="text-sm text-[#8B5E3C]">{question.reference}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="text-center py-8">
          <Link
            href={`/article/${id}`}
            className="bg-[#8B5E3C] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <span>📖</span>
            去精读
            <span>→</span>
          </Link>
        </section>
      </main>

      <footer className="text-center py-8 text-[#8D7B6B] text-sm">
        Made with 🐾 by Kikoscope · 一个安静的雅思阅读角落
      </footer>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#8B5E3C] text-white px-4 py-3 rounded-lg shadow-lg toast z-50">
          🐾 已收进词库
        </div>
      )}
    </div>
  );
}
