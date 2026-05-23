"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { addToWordbook, isInWordbook, removeFromWordbook } from "@/lib/wordbook";

type VocabularyItem = {
  word: string;
  phonetic: string;
  pos: string;
  chineseMeaning: string;
  definition: string;
  example: string;
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

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [article, setArticle] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await fetch(`/api/analyze-document?id=${slug}`);
        if (!response.ok) throw new Error("这篇文章还没找到");
        const data = (await response.json()) as AnalysisResult;
        setArticle(data);
        setSavedWords(new Set(data.vocabulary.filter((word) => isInWordbook(word.word)).map((word) => word.word.toLowerCase())));
      } catch (err) {
        setError(err instanceof Error ? err.message : "这篇文章还没找到");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  const collectWord = (word: VocabularyItem) => {
    const added = addToWordbook({
      word: word.word,
      phonetic: word.phonetic,
      pos: word.pos,
      meaning: word.definition,
      chineseMeaning: word.chineseMeaning,
      synonyms: [],
      source: "精读收藏",
      fromArticle: article?.fileName,
    });
    setSavedWords((prev) => new Set([...prev, word.word.toLowerCase()]));
    if (added) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const toggleSentence = (index: number) => {
    setExpandedSentences((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const vocabularyMap = new Map(article?.vocabulary.map((word) => [word.word.toLowerCase(), word]) ?? []);
  const displaySentences = article
    ? article.sentences.length > 0
      ? article.sentences
      : article.extractedText.split(/(?<=[.!?])\s+/).filter(Boolean).map((sentence) => ({
          sentence,
          translation: "",
          analysis: "",
          clauses: [],
        }))
    : [];
  const savedArticleWords = article?.vocabulary.filter((word) => savedWords.has(word.word.toLowerCase())) ?? [];

  const clearArticleWords = () => {
    savedArticleWords.forEach((word) => removeFromWordbook(word.word));
    setSavedWords(new Set());
  };

  const focusWord = (word: VocabularyItem) => {
    setSelectedWord(word);
    const targetIndex = displaySentences.findIndex((sentence) =>
      sentence.sentence.toLowerCase().includes(word.word.toLowerCase()),
    );
    if (targetIndex >= 0) {
      document.getElementById(`sentence-${targetIndex}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const renderClickableSentence = (sentence: string) => {
    return sentence.split(/(\b[A-Za-z][A-Za-z'-]*\b)/g).map((part, index) => {
      const match = vocabularyMap.get(part.toLowerCase());
      if (!match) return <span key={`${part}-${index}`}>{part}</span>;
      return (
        <button
          key={`${part}-${index}`}
          onClick={() => setSelectedWord(match)}
          className="rounded px-1 text-[#8B5E3C] underline decoration-[#EEDDCC] underline-offset-4 transition hover:bg-[#F0E8D8]"
        >
          {part}
        </button>
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
          <h1 className="sf text-3xl font-bold text-[#8B5E3C] mb-2">
            {article.title || article.fileName.replace(/\.[^.]+$/, "")}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm text-[#8D7B6B]">
            <span>来源：{article.fileName}</span>
            <span>归档时间：{article.analyzedAt}</span>
            {article.category && <span>话题：{article.category}</span>}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,65%)_minmax(280px,35%)] lg:items-start">
          <div>
            <section className="mb-4">
              <h2 className="text-xl font-semibold text-[#3E2723]">正文精读</h2>
            </section>

            <article className="mb-10 space-y-4">
              {displaySentences.length === 0 ? (
                <section className="rounded-2xl border border-[#EEDDCC] bg-white p-5 text-[#8D7B6B]">
                  本文暂无正文
                </section>
              ) : (
                displaySentences.map((sentence, index) => (
                  <section
                    id={`sentence-${index}`}
                    key={`${sentence.sentence}-${index}`}
                    className="rounded-2xl border border-[#EEDDCC] bg-white p-5 leading-8 text-[#3E2723]"
                  >
                    <div className="mb-2 text-xs text-[#8D7B6B]">Sentence {index + 1}</div>
                    <p>{renderClickableSentence(sentence.sentence)}</p>
                    <button
                      onClick={() => toggleSentence(index)}
                      className="mt-3 text-sm text-[#8B5E3C] hover:underline"
                    >
                      译
                    </button>
                    {expandedSentences.has(index) && (
                      <div className="mt-3 rounded-xl bg-[#FDFBF7] p-4 text-sm leading-7 text-[#8D7B6B]">
                        {sentence.translation && <p>{sentence.translation}</p>}
                        {sentence.analysis && <p className="mt-2">{sentence.analysis}</p>}
                      </div>
                    )}
                  </section>
                ))
              )}
            </article>

            {selectedWord && (
              <section className="mb-10 rounded-2xl border border-[#EEDDCC] bg-white p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="sf text-2xl font-bold text-[#8B5E3C]">{selectedWord.word}</h2>
                    <p className="text-sm text-[#8D7B6B]">{selectedWord.phonetic} · {selectedWord.pos}</p>
                  </div>
                  <button onClick={() => setSelectedWord(null)} className="text-[#8D7B6B] hover:text-[#8B5E3C]">×</button>
                </div>
                <p className="font-medium text-[#3E2723]">{selectedWord.chineseMeaning}</p>
                <p className="mt-2 text-sm text-[#8D7B6B]">{selectedWord.definition}</p>
                <button
                  onClick={() => collectWord(selectedWord)}
                  className="mt-4 rounded-full bg-[#8B5E3C] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#6D4A2F]"
                >
                  {savedWords.has(selectedWord.word.toLowerCase()) ? "已收藏" : "☆ 收藏"}
                </button>
              </section>
            )}

            {article.vocabulary.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-xl font-semibold text-[#3E2723]">生词摘记</h2>
                <div className="grid gap-3">
                  {article.vocabulary.map((word) => {
                    const saved = savedWords.has(word.word.toLowerCase());
                    return (
                      <div key={word.word} className="flex items-start justify-between gap-4 rounded-xl border border-[#EEDDCC] bg-white p-4">
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="sf text-lg font-bold text-[#8B5E3C]">{word.word}</span>
                            <span className="text-xs text-[#8D7B6B]">{word.phonetic}</span>
                            <span className="rounded-full bg-[#EEDDCC] px-2 py-0.5 text-xs text-[#8B5E3C]">{word.pos}</span>
                          </div>
                          <p className="text-sm font-medium text-[#8B5E3C]">{word.chineseMeaning}</p>
                          <p className="text-xs text-[#8D7B6B]">{word.definition}</p>
                        </div>
                        <button
                          onClick={() => collectWord(word)}
                          disabled={saved}
                          className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${saved ? "bg-[#EEDDCC] text-[#8D7B6B]" : "bg-[#8B5E3C] text-white hover:bg-[#6D4A2F]"}`}
                        >
                          {saved ? "已收藏" : "☆ 收藏"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="text-center">
              <Link href={`/article/${slug}/quiz`} className="inline-flex rounded-full bg-[#8B5E3C] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#6D4A2F]">
                去练习 →
              </Link>
            </section>
          </div>

          <aside
            className={`fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-[#EEDDCC] bg-[#FDFBF7] shadow-lg lg:sticky lg:top-20 lg:inset-x-auto lg:bottom-auto lg:z-auto lg:shadow-sm ${
              sidebarCollapsed ? "p-3" : "max-h-[58vh] overflow-auto p-4 lg:max-h-[calc(100vh-7rem)]"
            }`}
          >
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="mb-3 rounded-full border border-[#EEDDCC] bg-white px-3 py-1 text-xs text-[#8B5E3C] transition hover:border-[#8B5E3C]"
            >
              {sidebarCollapsed ? "展开" : "收起"}
            </button>

            {sidebarCollapsed ? (
              <div className="text-sm font-medium text-[#8B5E3C]">📝 本文生词 · {savedArticleWords.length}</div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[#3E2723]">📝 本文生词</h2>
                  {savedArticleWords.length > 0 && (
                    <button
                      type="button"
                      onClick={clearArticleWords}
                      className="text-xs text-[#8D7B6B] hover:text-[#8B5E3C]"
                    >
                      清空
                    </button>
                  )}
                </div>

                {savedArticleWords.length === 0 ? (
                  <p className="text-sm leading-6 text-[#8D7B6B]">
                    点击正文里的单词并收藏后，会出现在这里。
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedArticleWords.map((word) => (
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
      <footer className="text-center py-8 text-[#8D7B6B] text-sm">
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
