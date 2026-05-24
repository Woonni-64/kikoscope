"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
}

interface VocabularyItem {
  word: string;
  learned?: boolean;
}

type Greeting = {
  period: "morning" | "afternoon" | "evening";
  chinese: string;
  note: string;
};

function getGreeting(): Greeting {
  const hour = new Date().getHours();
  if (hour < 12) {
    return {
      period: "morning",
      chinese: "早上好",
      note: "Kiki 陪你开启新的一天",
    };
  }
  if (hour < 18) {
    return {
      period: "afternoon",
      chinese: "下午好",
      note: "Kiki 陪你度过安静的午后",
    };
  }
  return {
    period: "evening",
    chinese: "晚上好",
    note: "Kiki 陪你结束充实的一天",
  };
}

function getDaysSinceFirstVisit(): number {
  const storedDailyStreak = localStorage.getItem("dailyStreak");
  const firstVisit =
    storedDailyStreak && !storedDailyStreak.trim().startsWith("{")
      ? storedDailyStreak
      : localStorage.getItem("kikoscope_first_visit");
  if (!firstVisit) {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("dailyStreak", today);
    localStorage.setItem("kikoscope_first_visit", today);
    return 1;
  }
  
  const firstDate = new Date(firstVisit);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - firstDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

function getVocabularyCount(): number {
  const vocab = localStorage.getItem("vocabulary");
  if (!vocab) return 0;
  try {
    return JSON.parse(vocab).length;
  } catch {
    return 0;
  }
}

function GreetingBlock({ greeting }: { greeting: Greeting }) {
  return (
    <section className="mb-10 flex items-center justify-between gap-8 text-left">
      <div>
        <h1 className="sf text-[2.5rem] font-bold leading-none text-[#3E2723]">
          Good
        </h1>
        <p className="sf ml-8 mt-1 text-[2.5rem] font-bold leading-none text-[#3E2723]">
          {greeting.period}
        </p>
        <p className="mt-4 text-[0.9rem] text-[#8D7B6B]">{greeting.note}</p>
      </div>
      <div aria-hidden="true" className="hidden text-7xl leading-none sm:block">
        🐈
      </div>
    </section>
  );
}

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [greeting, setGreeting] = useState<Greeting>({
    period: "morning",
    chinese: "早上好",
    note: "Kiki 陪你开启新的一天",
  });
  const [daysVisited, setDaysVisited] = useState(1);
  const [vocabCount, setVocabCount] = useState(0);
  const [unlearnedCount, setUnlearnedCount] = useState(0);

  useEffect(() => {
    setGreeting(getGreeting());
    setDaysVisited(getDaysSinceFirstVisit());
    setVocabCount(getVocabularyCount());
    
    const savedDocs = localStorage.getItem("kikoscope_documents");
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch {
        setDocuments([]);
      }
    }

    const vocab = localStorage.getItem("vocabulary");
    if (vocab) {
      try {
        const vocabItems = JSON.parse(vocab) as VocabularyItem[];
        const unlearned = vocabItems.filter((v) => v.learned !== true).length;
        setUnlearnedCount(unlearned);
      } catch {
        setUnlearnedCount(0);
      }
    }
  }, []);

  const hasData = documents.length > 0 || vocabCount > 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Nav />
      
      <main className="mx-auto max-w-4xl px-6 py-12">
        {hasData ? (
          <>
            <GreetingBlock greeting={greeting} />

            <section className="bg-[#EEDDCC]/30 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#3E2723] mb-2">学习概览</h2>
              <p className="mb-4 text-sm text-[#8D7B6B]">
                你已经坚持了 {daysVisited} 天
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8B5E3C]">📖</div>
                  <div className="text-sm text-[#8D7B6B] mt-1">读过的文章 · {documents.length} 篇</div>
                </div>
                <div className="text-center sm:border-l sm:border-[#EEDDCC]">
                  <div className="text-2xl font-bold text-[#8B5E3C]">✅</div>
                  <div className="text-sm text-[#8D7B6B] mt-1">掌握的词 · {Math.max(vocabCount - unlearnedCount, 0)} 词</div>
                </div>
                <div className="text-center sm:border-l sm:border-[#EEDDCC]">
                  <div className="text-2xl font-bold text-[#8B5E3C]">🔥</div>
                  <div className="text-sm text-[#8D7B6B] mt-1">坚持的日子 · {daysVisited} 天</div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4 mb-8">
              <Link 
                href="/ielts-flashcards"
                className="bg-white border border-[#EEDDCC] rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <h3 className="text-lg font-semibold text-[#3E2723] mb-1">去背单词</h3>
                <p className="text-[#8D7B6B] text-sm">Kiki 陪你翻卡片</p>
              </Link>
              
              <Link 
                href="/import"
                className="bg-white border border-[#EEDDCC] rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <h3 className="text-lg font-semibold text-[#3E2723] mb-1">归档真题</h3>
                <p className="text-[#8D7B6B] text-sm">交给Kiki慢慢收好</p>
              </Link>
            </section>

            <section className="text-center py-8">
              <p className="text-[#8D7B6B] text-lg">
                🐾 慢慢来，Kiki 一直在。
              </p>
            </section>
          </>
        ) : (
          <>
            <GreetingBlock greeting={greeting} />

            <section className="bg-[#EEDDCC]/30 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#3E2723] mb-2">学习概览</h2>
              <p className="mb-4 text-sm text-[#8D7B6B]">
                从今天开始，Kiki 陪你养成习惯
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8B5E3C]">📖</div>
                  <div className="text-sm text-[#8D7B6B] mt-1">读过的文章 · {documents.length} 篇</div>
                </div>
                <div className="text-center sm:border-l sm:border-[#EEDDCC]">
                  <div className="text-2xl font-bold text-[#8B5E3C]">✅</div>
                  <div className="text-sm text-[#8D7B6B] mt-1">掌握的词 · {Math.max(vocabCount - unlearnedCount, 0)} 词</div>
                </div>
                <div className="text-center sm:border-l sm:border-[#EEDDCC]">
                  <div className="text-2xl font-bold text-[#8B5E3C]">🔥</div>
                  <div className="text-sm text-[#8D7B6B] mt-1">坚持的日子 · {daysVisited} 天</div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <Link 
                href="/ielts-flashcards"
                className="bg-white border border-[#EEDDCC] rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all text-center"
              >
                <h3 className="text-xl font-semibold text-[#3E2723]">去背单词</h3>
              </Link>
              
              <Link 
                href="/import"
                className="bg-white border border-[#EEDDCC] rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all text-center"
              >
                <h3 className="text-xl font-semibold text-[#3E2723]">归档真题</h3>
              </Link>
            </section>
          </>
        )}
      </main>

      <footer className="text-center py-8 text-[#8D7B6B] text-sm">
        Made with 🐾 by Kikoscope · 一个安静的雅思阅读角落
      </footer>

    </div>
  );
}
