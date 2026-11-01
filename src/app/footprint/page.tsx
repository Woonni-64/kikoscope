"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { getWordbook } from "@/lib/wordbook";
import { downloadAnalysisBackup, restoreAnalysisBackup } from "@/lib/analysis-client";

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
  const [backupText, setBackupText] = useState("");
  const [backupName, setBackupName] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [dataError, setDataError] = useState("");

  const refreshStats = () => {
    const documents = readDocuments();
    setStats({
      completedArticles: documents.filter((doc) => doc.status === "completed").length,
      collectedWords: getWordbook().length,
      masteredWords: readMasteredWords(),
      streakDays: readStreakDays(),
    });
  };
  useEffect(() => { refreshStats(); }, []);

  const importBackup = () => {
    setDataMessage("");setDataError("");
    try {
      const result = restoreAnalysisBackup(backupText);
      refreshStats();
      setDataMessage(`导入完成：新增${result.articles}篇文章、${result.words}个单词，原有资料已保留。`);
      setBackupText("");setBackupName("");
    } catch (error) { setDataError(error instanceof Error ? error.message : "导入失败，原有资料已保留。"); }
  };

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

        <details id="data-management" className="mt-8 rounded-2xl border border-[#EEDDCC] bg-white p-5">
          <summary className="cursor-pointer font-medium text-[#8B5E3C]">数据管理</summary>
          <p className="mt-3 text-sm leading-6 text-[#8D7B6B]">文章、生词和复习记录保存在当前浏览器。换设备或清理浏览器前，可以先导出备份；以后在这里导入即可找回已备份的资料。</p>
          <button type="button" className="mt-4 rounded-full border border-[#EEDDCC] px-5 py-2 text-sm text-[#8B5E3C]" onClick={() => {
            setDataError("");setDataMessage("");
            try { downloadAnalysisBackup();setDataMessage("备份已生成并发起下载，请保存好文件。"); }
            catch { setDataError("备份未能生成，请稍后重试。"); }
          }}>导出备份</button>
          <details className="mt-4 border-t border-[#EEDDCC] pt-4">
            <summary className="cursor-pointer text-sm font-medium text-[#8B5E3C]">导入旧备份</summary>
            <p className="mt-3 text-sm leading-6 text-[#8D7B6B]">仅接受本网站导出的 JSON 备份，会与现有资料合并。阅读 PDF、Word 或图片请去“交给Kiki”上传。</p>
            <label className="mt-3 block text-sm text-[#8D7B6B]">选择备份文件
              <input aria-label="选择备份文件" type="file" accept=".json,application/json" className="mt-2 block w-full text-sm" onChange={async event => {
                const input=event.currentTarget;const file=input.files?.[0];
                setBackupText("");setBackupName("");setDataMessage("");setDataError("");
                if (!file) return;
                try {
                  if (file.size > 20*1024*1024) throw new Error("备份超过20MB，请使用较小的备份文件。");
                  setBackupText(await file.text());setBackupName(file.name);
                } catch(error) { setDataError(error instanceof Error ? error.message : "无法读取备份文件，请重新选择。"); }
                finally { input.value=""; }
              }} />
            </label>
            {backupName&&<p className="mt-2 text-sm text-[#8D7B6B]">已选择：{backupName}</p>}
            <details className="mt-3 text-sm text-[#8D7B6B]">
              <summary className="cursor-pointer">粘贴备份内容（可选）</summary>
              <textarea aria-label="备份内容" value={backupText} onChange={event=>{setBackupText(event.target.value);setBackupName("");setDataMessage("");setDataError("");}} placeholder="粘贴之前导出的备份内容" className="mt-3 min-h-24 w-full rounded border border-[#EEDDCC] p-3" />
            </details>
            <button type="button" disabled={!backupText.trim()} onClick={importBackup} className="mt-3 rounded-full bg-[#8B5E3C] px-5 py-2 text-sm text-white disabled:opacity-50">导入并合并</button>
          </details>
          {dataMessage&&<p role="status" className="mt-3 text-sm text-[#8B5E3C]">{dataMessage}</p>}
          {dataError&&<p role="alert" className="mt-3 text-sm text-red-700">{dataError}</p>}
        </details>

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
