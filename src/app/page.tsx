"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
}

interface VocabularyItem {
  word: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function getDaysSinceFirstVisit(): number {
  const firstVisit = localStorage.getItem("kikoscope_first_visit");
  if (!firstVisit) {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("kikoscope_first_visit", today);
    return 1;
  }
  
  const firstDate = new Date(firstVisit);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - firstDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
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

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [greeting, setGreeting] = useState("早上好");
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
        const unlearned = vocabItems.filter((v: any) => v.learned !== true).length;
        setUnlearnedCount(unlearned);
      } catch {
        setUnlearnedCount(0);
      }
    }
  }, []);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newDocs: Document[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      uploadedAt: new Date().toLocaleString("zh-CN"),
    }));

    const updatedDocs = [...newDocs, ...documents];
    setDocuments(updatedDocs);
    localStorage.setItem("kikoscope_documents", JSON.stringify(updatedDocs));
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [documents]);

  const hasData = documents.length > 0 || vocabCount > 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Nav />
      
      <main className="mx-auto max-w-4xl px-6 py-12">
        {hasData ? (
          <>
            <section className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#3E2723] mb-2">
                {greeting}，Kiki 陪你学雅思
              </h1>
              <p className="text-[#8D7B6B]">
                <span className="sf text-lg">Kikoscope</span> · 你的雅思阅读角落
              </p>
            </section>

            <section className="bg-[#EEDDCC]/30 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-[#3E2723] mb-4">学习概览</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#8B5E3C]">{daysVisited}</div>
                  <div className="text-sm text-[#8D7B6B] mt-1">坚持天数</div>
                </div>
                <div className="text-center border-x border-[#EEDDCC]">
                  <div className="text-3xl font-bold text-[#8B5E3C]">{vocabCount}</div>
                  <div className="text-sm text-[#8D7B6B] mt-1">复习考点词</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#8B5E3C]">{documents.length}</div>
                  <div className="text-sm text-[#8D7B6B] mt-1">归档真题</div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-[#EEDDCC] rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#3E2723]">今日推荐</h2>
                  <p className="text-[#8D7B6B] mt-1">
                    继续复习词汇闪卡，还有 <span className="text-[#8B5E3C] font-medium">{unlearnedCount}</span> 个词待记忆
                  </p>
                </div>
                <Link 
                  href="/ielts-flashcards"
                  className="bg-[#8B5E3C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  去复习 →
                </Link>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4 mb-8">
              <Link 
                href="/import"
                className="bg-white border border-[#EEDDCC] rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="text-4xl mb-3">📁</div>
                <h3 className="text-lg font-semibold text-[#3E2723] mb-1">归档真题</h3>
                <p className="text-[#8D7B6B] text-sm">已归档 {documents.length} 份</p>
              </Link>
              
              <Link 
                href="/ielts-flashcards"
                className="bg-white border border-[#EEDDCC] rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="text-4xl mb-3">📚</div>
                <h3 className="text-lg font-semibold text-[#3E2723] mb-1">词汇闪卡</h3>
                <p className="text-[#8D7B6B] text-sm">已掌握 {vocabCount - unlearnedCount} 词</p>
              </Link>
            </section>

            <section className="text-center py-8">
              <p className="text-[#8D7B6B] text-lg">
                🐾 "慢慢来，Kiki 一直在。"
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="text-center mb-12">
              <div className="text-8xl mb-4">🐈</div>
              <h1 className="text-3xl font-bold text-[#3E2723] mb-2">欢迎来到 Kikoscope</h1>
              <p className="text-[#8D7B6B]">
                <span className="sf text-lg">Your IELTS Reading Corner</span>
              </p>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <Link 
                href="/import"
                className="bg-white border border-[#EEDDCC] rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all text-center"
              >
                <div className="text-5xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-[#3E2723]">归档真题</h3>
              </Link>
              
              <Link 
                href="/ielts-flashcards"
                className="bg-white border border-[#EEDDCC] rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all text-center"
              >
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-[#3E2723]">词汇闪卡</h3>
              </Link>
            </section>
          </>
        )}
      </main>

      <footer className="text-center py-8 text-[#8D7B6B] text-sm">
        Made with 🐾 by Kikoscope · 一个安静的雅思阅读角落
      </footer>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#8B5E3C] text-white px-4 py-3 rounded-lg shadow-lg toast z-50">
          🐾 Kiki 已归档
        </div>
      )}
    </div>
  );
}