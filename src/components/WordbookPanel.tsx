"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  exportToCSV,
  getWordbook,
  importFromCSV,
  removeFromWordbook,
  type WordEntry,
} from "@/lib/wordbook";

type WordbookPanelProps = {
  compact?: boolean;
};

export default function WordbookPanel({ compact = false }: WordbookPanelProps) {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => setWords(getWordbook()), []);

  useEffect(() => {
    reload();
  }, [reload]);

  const sources = Array.from(new Set(words.map((word) => word.fromArticle || word.source || "手动导入")));

  const filtered = words.filter((w) => {
    const source = w.fromArticle || w.source || "手动导入";
    const matchesSource = sourceFilter === "all" || source === sourceFilter;
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.chineseMeaning ?? "").includes(searchQuery);
    return matchesSource && matchesSearch;
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const count = importFromCSV(ev.target?.result as string);
      setImportMsg(count === 0 ? "未发现新单词（格式错误或全部重复）" : `成功导入 ${count} 个新单词`);
      setTimeout(() => setImportMsg(null), 3000);
      reload();
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const handleExport = () => {
    const blob = new Blob([exportToCSV(words)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kikoscope-vocabulary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const printable = window.open("", "_blank", "width=900,height=700");
    if (!printable) return;
    const rows = filtered
      .map((word) => {
        const source = word.fromArticle || word.source || "手动导入";
        return `<tr><td>${word.word}</td><td>${word.chineseMeaning ?? ""}</td><td>${word.meaning ?? ""}</td><td>${source}</td></tr>`;
      })
      .join("");
    printable.document.write(`
      <html>
        <head>
          <title>Kikoscope Vocabulary</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; color: #3E2723; padding: 32px; }
            h1 { color: #8B5E3C; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px solid #EEDDCC; padding: 10px; text-align: left; vertical-align: top; }
            th { color: #8B5E3C; }
          </style>
        </head>
        <body>
          <h1>Kikoscope 我的词库</h1>
          <table>
            <thead><tr><th>单词</th><th>释义</th><th>英文释义</th><th>来自</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printable.document.close();
    printable.focus();
    printable.print();
  };

  return (
    <section className={compact ? "" : "mx-auto max-w-3xl px-6 py-12"}>
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="sf text-2xl font-bold text-[#8B5E3C] mb-1">我的词库</h2>
          <p className="text-[#8D7B6B] text-sm">
            共 {words.length} 个单词 · 阅读时遇见的词会住在这里
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {words.length > 0 && (
            <Link
              href="/ielts-flashcards?source=wordbook"
              className="px-4 py-2 rounded-full bg-[#8B5E3C] text-white text-sm font-medium hover:bg-[#6D4A2F] transition-all"
            >
              去背单词
            </Link>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-full bg-[#EEDDCC] text-[#8B5E3C] text-sm font-medium hover:bg-[#E5D5C0] transition-all"
          >
            导入 CSV
          </button>
          {words.length > 0 && (
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-full bg-[#EEDDCC] text-[#8B5E3C] text-sm font-medium hover:bg-[#E5D5C0] transition-all"
            >
              导出 CSV
            </button>
          )}
          {words.length > 0 && (
            <button
              onClick={handleExportPdf}
              className="px-4 py-2 rounded-full bg-[#EEDDCC] text-[#8B5E3C] text-sm font-medium hover:bg-[#E5D5C0] transition-all"
            >
              导出 PDF
            </button>
          )}
        </div>
      </div>

      {importMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-[#F0E8D8] text-[#8B5E3C] text-sm">
          {importMsg}
        </div>
      )}

      {words.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            placeholder="搜索单词或释义…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#EEDDCC] bg-white text-[#3E2723] text-sm placeholder-[#C4B5A5] focus:outline-none focus:border-[#8B5E3C] transition-colors"
          />
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-xl border border-[#EEDDCC] bg-white px-4 py-2.5 text-sm text-[#8B5E3C] focus:border-[#8B5E3C] focus:outline-none"
          >
            <option value="all">全部文章</option>
            {sources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
      )}

      {words.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border border-[#EEDDCC] bg-white">
          <div className="text-5xl mb-4">📖</div>
          <h3 className="text-lg font-medium text-[#8B5E3C] mb-2">词库还空着，去读篇文章吧</h3>
          <p className="text-[#8D7B6B] text-sm mb-6">
            读文章时收藏的单词，会出现在这里
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-6 py-2.5 rounded-full bg-[#8B5E3C] text-white text-sm font-medium hover:bg-[#6D4A2F] transition-all"
          >
            导入 CSV
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-[#8D7B6B]">没有匹配的单词</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <div
              key={w.word}
              className="group flex items-start justify-between gap-4 p-4 rounded-xl bg-white border border-[#EEDDCC] hover:border-[#8B5E3C]/30 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Link
                    href={`/word/${encodeURIComponent(w.word)}`}
                    className="sf text-lg font-semibold text-[#3E2723] hover:text-[#8B5E3C] transition-colors"
                  >
                    {w.word}
                  </Link>
                  {w.phonetic && <span className="text-xs text-[#8D7B6B]">{w.phonetic}</span>}
                  {w.pos && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[#EEDDCC] text-[#8B5E3C]">
                      {w.pos}
                    </span>
                  )}
                  {w.fromArticle && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[#F0E8D8] text-[#8D7B6B]">
                      {w.fromArticle}
                    </span>
                  )}
                </div>
                {w.chineseMeaning && <p className="text-sm font-medium text-[#8B5E3C]">{w.chineseMeaning}</p>}
                {w.meaning && <p className="text-xs text-[#8D7B6B] mt-0.5 line-clamp-1">{w.meaning}</p>}
              </div>
              <button
                onClick={() => {
                  removeFromWordbook(w.word);
                  reload();
                }}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1 text-[#C4B5A5] hover:text-[#C0735A] transition-all text-lg leading-none"
                aria-label={`移除 ${w.word}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
