"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { addToWordbook, isInWordbook } from "@/lib/wordbook";

type Question = {
  type: "multiple-choice" | "true-false" | "fill-in-blank";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  reference: string;
};

type VocabularyItem = {
  word: string;
  phonetic: string;
  pos: string;
  chineseMeaning: string;
  definition: string;
  example: string;
};

type AnalysisResult = {
  id: string;
  fileName: string;
  title?: string;
  extractedText: string;
  quizRaw: string;
  vocabulary: VocabularyItem[];
  questions: Question[];
};

export default function ArticleQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      const response = await fetch(`/api/analyze-document?id=${slug}`);
      if (response.ok) {
        const data = (await response.json()) as AnalysisResult;
        setAnalysis(data);
        setSavedWords(new Set(data.vocabulary.filter((word) => isInWordbook(word.word)).map((word) => word.word.toLowerCase())));
      }
    };

    loadQuiz();
  }, [slug]);

  const collectWord = (word: VocabularyItem) => {
    const added = addToWordbook({
      word: word.word,
      phonetic: word.phonetic,
      pos: word.pos,
      meaning: word.definition,
      chineseMeaning: word.chineseMeaning,
      synonyms: [],
      source: "练习收藏",
      fromArticle: analysis?.fileName,
    });
    setSavedWords((prev) => new Set([...prev, word.word.toLowerCase()]));
    if (added) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Nav />
        <main className="mx-auto max-w-3xl px-6 py-12 text-center text-[#8D7B6B]">Kiki 正在铺开练习纸...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <section className="mb-8">
          <Link href={`/article/${slug}`} className="mb-5 inline-block text-sm text-[#8B5E3C] hover:underline">
            ← 回到文章
          </Link>
          <h1 className="sf text-3xl font-bold text-[#8B5E3C] mb-2">练一练</h1>
          <p className="text-[#8D7B6B]">{analysis.title || analysis.fileName}</p>
        </section>

        <details className="mb-6 rounded-2xl border border-[#EEDDCC] bg-white p-5">
          <summary className="cursor-pointer text-sm font-medium text-[#8B5E3C]">
            原文
          </summary>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#3E2723]">
            {analysis.extractedText || "本文暂无正文"}
          </div>
        </details>

        {analysis.quizRaw && (
          <section className="mb-8 rounded-2xl border border-[#EEDDCC] bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold text-[#3E2723]">题目原文</h2>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-[#3E2723]">
              {analysis.quizRaw}
            </pre>
          </section>
        )}

        <section className="mb-4">
          <h2 className="text-xl font-semibold text-[#3E2723]">题目练习</h2>
        </section>

        <section className="mb-10 space-y-4">
          {analysis.questions.map((question, index) => (
            <div key={question.question} className="rounded-2xl border border-[#EEDDCC] bg-white p-5">
              <p className="mb-4 font-medium text-[#3E2723]">{index + 1}. {question.question}</p>
              {question.options ? (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const label = String.fromCharCode(65 + optionIndex);
                    return (
                      <button
                        key={option}
                        onClick={() => setAnswers((prev) => ({ ...prev, [index]: label }))}
                        className={`block w-full rounded-xl border px-4 py-2 text-left text-sm transition ${answers[index] === label ? "border-[#8B5E3C] bg-[#F0E8D8] text-[#3E2723]" : "border-[#EEDDCC] text-[#8D7B6B] hover:border-[#8B5E3C]"}`}
                      >
                        {label}. {option}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  value={answers[index] ?? ""}
                  onChange={(event) => setAnswers((prev) => ({ ...prev, [index]: event.target.value }))}
                  className="w-full rounded-xl border border-[#EEDDCC] bg-white px-4 py-2 text-sm text-[#3E2723] focus:border-[#8B5E3C] focus:outline-none"
                  placeholder="写下你的答案"
                />
              )}
              {answers[index] && (
                <div className="mt-4 rounded-xl bg-[#FDFBF7] p-4 text-sm">
                  <p className="text-[#8B5E3C]">参考答案：{question.answer}</p>
                  <p className="mt-2 text-[#8D7B6B]">{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </section>

        {analysis.vocabulary.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-[#3E2723]">练习中可收藏的生词</h2>
            <div className="flex flex-wrap gap-2">
              {analysis.vocabulary.map((word) => {
                const saved = savedWords.has(word.word.toLowerCase());
                return (
                  <button
                    key={word.word}
                    onClick={() => collectWord(word)}
                    disabled={saved}
                    className={`rounded-full px-4 py-2 text-sm transition ${saved ? "bg-[#EEDDCC] text-[#8D7B6B]" : "bg-white border border-[#EEDDCC] text-[#8B5E3C] hover:border-[#8B5E3C]"}`}
                  >
                    {saved ? `${word.word} · 已收藏` : `收藏 ${word.word}`}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="text-center flex items-center justify-center gap-3">
          <button className="rounded-full bg-[#8B5E3C] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B3A2A]">
            交卷
          </button>
          <Link href={`/article/${slug}`} className="text-sm text-[#8B5E3C] hover:underline">← 回到文章</Link>
        </section>
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
