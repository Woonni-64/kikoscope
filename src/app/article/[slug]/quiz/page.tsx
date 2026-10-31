"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { isCorrectAnswer } from "@/lib/quiz";
import { loadAnalysis, saveAnalysis } from "@/lib/analysis-client";
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
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await loadAnalysis<AnalysisResult>(slug);
        setAnalysis(data);
        setSavedWords(new Set(data.vocabulary.filter((word) => isInWordbook(word.word)).map((word) => word.word.toLowerCase())));
      } catch (error) { setError(error instanceof Error ? error.message : "读取练习失败"); }
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
      fromArticle: analysis?.title || analysis?.fileName,
      articleId: slug,
    });
    setSavedWords((prev) => new Set([...prev, word.word.toLowerCase()]));
    if (added) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const generateQuiz = async () => {
    if (!analysis || generating) return;
    setGenerating(true); setGenerationError("");
    try {
      const response = await fetch("/api/generate-quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({article: analysis.extractedText, quizRaw: analysis.quizRaw}) });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.questions) || !data.questions.length) throw new Error(data.error || "没有生成有效题目");
      const next = {...analysis, questions: data.questions};
      saveAnalysis(next); setAnalysis(next); setAnswers({}); setSubmitted(false);
    } catch (error) { setGenerationError(error instanceof Error ? error.message : "练习生成失败，请重试。"); }
    finally { setGenerating(false); }
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Nav />
        <main className="mx-auto max-w-3xl px-6 py-12 text-center text-[#8D7B6B]">{error || "Kiki 正在铺开练习纸..."}</main>
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

        <section className="mb-6 rounded-2xl border border-[#EEDDCC] p-5">
          <p>{analysis.questions.length ? "AI参考答案，可展开原文证据核对，不代表官方答案。" : "原题已保留。点击生成练习后可以答题评分，AI参考答案不代表官方答案。"}</p>
          {!analysis.questions.length && <button disabled={generating} onClick={() => void generateQuiz()} className="mt-3 rounded-full bg-[#8B5E3C] px-5 py-2 text-white disabled:opacity-50">{generating ? "正在生成练习…" : "生成可评分练习"}</button>}
          {generationError && <p role="alert" className="mt-3">{generationError}</p>}
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
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [index]: question.type === "true-false" ? option : label }))}
                        className={`block w-full rounded-xl border px-4 py-2 text-left text-sm transition ${answers[index] === (question.type === "true-false" ? option : label) ? "border-[#8B5E3C] bg-[#F0E8D8] text-[#3E2723]" : "border-[#EEDDCC] text-[#8D7B6B] hover:border-[#8B5E3C]"}`}
                      >
                        {question.type === "true-false" ? option : `${label}. ${option}`}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  disabled={submitted}
                  aria-label={`第${index + 1}题答案`}
                  value={answers[index] ?? ""}
                  onChange={(event) => setAnswers((prev) => ({ ...prev, [index]: event.target.value }))}
                  className="w-full rounded-xl border border-[#EEDDCC] bg-white px-4 py-2 text-sm text-[#3E2723] focus:border-[#8B5E3C] focus:outline-none"
                  placeholder="写下你的答案"
                />
              )}
              {submitted && (
                <div className="mt-4 rounded-xl bg-[#FDFBF7] p-4 text-sm">
                  <p className="text-[#8B5E3C]">{isCorrectAnswer(question, answers[index] || "") ? "回答正确" : "回答错误"} · 参考答案：{question.answer}</p>
                  <p className="mt-2 text-[#8D7B6B]">{question.explanation}</p><blockquote className="mt-2 border-l-2 pl-3">原文证据：{question.reference}</blockquote>
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

        {submitted && <p role="status" className="mb-4 text-center">得分：{analysis.questions.filter((q, i) => isCorrectAnswer(q, answers[i] || "")).length} / {analysis.questions.length}</p>}
        <section className="text-center flex items-center justify-center gap-3">
          {analysis.questions.length > 0 && <button onClick={() => { if (submitted) { setAnswers({}); setSubmitted(false); } else setSubmitted(true); }} disabled={generating || (!submitted && analysis.questions.some((_, i) => !answers[i]?.trim()))} className="rounded-full bg-[#8B5E3C] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50">{submitted ? "重新作答" : "交卷"}</button>}
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
