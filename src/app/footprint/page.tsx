"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { getWordbook } from "@/lib/wordbook";

type DocumentRecord = {
  id: string;
  name: string;
  uploadedAt: string;
  status: "uploading" | "analyzing" | "completed" | "error";
  analysisId?: string;
};

type FootprintStats = {
  completedArticles: number;
  collectedWords: number;
  masteredWords: number;
  streakDays: number;
};

const emptyStats: FootprintStats = {
  completedArticles: 0,
  collectedWords: 0,
  masteredWords: 0,
  streakDays: 1,
};

function readDocuments(): DocumentRecord[] {
  try {
    const raw = localStorage.getItem("kikoscope_documents");
    return raw ? (JSON.parse(raw) as DocumentRecord[]) : [];
  } catch {
    return [];
  }
}

function readMasteredWords() {
  try {
    const raw = localStorage.getItem("flashcard-progress") || localStorage.getItem("flashcard-progress-ielts");
    const progress = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const mastered = new Set(Object.entries(progress).filter(([, value]) => {
      return typeof value === "object" && value !== null && "mastered" in value && Boolean((value as { mastered?: boolean }).mastered);
    }).map(([key]) => key.split(":").slice(1).join(":")));
    return mastered.size;
  } catch {
    return 0;
  }
}

function readStreakDays() {
  const storedDailyStreak = localStorage.getItem("dailyStreak");
  const firstVisit =
    storedDailyStreak && !storedDailyStreak.trim().startsWith("{")
      ? storedDailyStreak
      : localStorage.getItem("kikoscope_first_visit");
  if (!firstVisit) {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("dailyStreak", today);
    localStorage.setItem("kikoscope_first_visit", today);
    return 1;
  }
  const start = new Date(firstVisit).getTime();
  const diff = Date.now() - start;
  return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export default function FootprintPage() {
  const [stats, setStats] = useState<FootprintStats>(emptyStats);
  const router = useRouter();

  useEffect(() => {
    const documents = readDocuments();
    setStats({
      completedArticles: documents.filter((doc) => doc.status === "completed").length,
      collectedWords: getWordbook().length,
      masteredWords: readMasteredWords(),
      streakDays: readStreakDays(),
    });
  }, []);

  const cards: Array<{
    label: string;
    value: number;
    unit: string;
    helper: string;
    action?: () => void;
  }> = [
    {
      label: "📖 读过的文章",
      value: stats.completedArticles,
      unit: "篇",
      helper: "Kiki 轻轻记着",
    },
    {
      label: "✅ 掌握的词",
      value: stats.masteredWords,
      unit: "词",
      helper: "一张张卡片留下的痕迹",
    },
    {
      label: "🔥 坚持的日子",
      value: stats.streakDays,
      unit: "天",
      helper: "从第一次见到 Kiki 开始",
    },
    {
      label: "📝 我的词库",
      value: stats.collectedWords,
      unit: "词",
      helper: "查看收藏的词汇 →",
      action: () => router.push("/vocabulary"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Nav />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <section className="text-center mb-12">
          <h1 className="sf text-3xl font-bold text-[#8B5E3C] mb-2">我的足迹</h1>
          <p className="text-[#8D7B6B]">
          Kiki 把你的阅读痕迹轻轻收好
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={card.action}
              className={`card p-6 text-left ${card.action ? "cursor-pointer hover:border-[#8B5E3C]" : "cursor-default"}`}
            >
              <p className="text-sm text-[#8D7B6B] mb-3">{card.label}</p>
              <p className="sf text-4xl font-bold text-[#8B5E3C] mb-3">
                {card.value} <span className="text-base font-normal text-[#8D7B6B]">{card.unit}</span>
              </p>
              <p className="text-sm text-[#8D7B6B]">{card.helper}</p>
            </button>
          ))}
        </section>

        <p className="mt-10 text-center text-[#8D7B6B]">
          🐾 每一步，都算数。
        </p>
      </main>

      <footer className="text-center py-8 text-[#8D7B6B] text-sm">
        Made with 🐾 by Kikoscope · 一个安静的雅思阅读角落
      </footer>
    </div>
  );
}
