"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createVocabularyDocx, createVocabularyPdf, downloadBlob } from "@/lib/vocabulary-export";
import Nav from "@/components/Nav";
import { getWordbook, type WordEntry } from "@/lib/wordbook";

function getSource(word: WordEntry) {
  return word.fromArticle || word.source || "手动导入";
}

export default function VocabularyPage() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [download, setDownload] = useState<{url:string;name:string} | null>(null);
  useEffect(() => () => { if (download) URL.revokeObjectURL(download.url); }, [download]);
  const [exporting, setExporting] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    setWords(getWordbook());
  }, []);

  const sources = useMemo(() => {
    return Array.from(new Set(words.map(getSource)));
  }, [words]);

  const filteredWords = useMemo(() => {
    return words.filter((word) => sourceFilter === "all" || getSource(word) === sourceFilter);
  }, [sourceFilter, words]);

  const exportFile = async (format: "pdf" | "docx") => {
    if (exporting) return;
    setExporting(format); setExportMessage("");
    try {
      const blob = format === "pdf" ? await createVocabularyPdf(filteredWords) : await createVocabularyDocx(filteredWords);
      setDownload({url: URL.createObjectURL(blob), name: `kikoscope-vocabulary.${format}`});
      downloadBlob(blob, `kikoscope-vocabulary.${format}`);
      setExportMessage("文件已生成并发起下载；请查看浏览器下载列表。");
    } catch { setExportMessage("导出失败，请稍后重试。词库数据仍然保留。"); }
    finally { setExporting(""); }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/footprint" className="mb-4 inline-block text-sm text-[#8D7B6B] hover:text-[#8B5E3C]">
              ← 返回我的足迹
            </Link>
            <h1 className="sf text-3xl font-bold text-[#8B5E3C] mb-2">我的词库</h1>
            <p className="text-[#8D7B6B]">这些词，都是在阅读里遇见的</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void exportFile("pdf")}
              disabled={filteredWords.length === 0 || !!exporting}
              className="rounded-full bg-[#8B5E3C] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#6D4A2F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting === "pdf" ? "正在生成 PDF…" : "导出 PDF"}
            </button>
            <button
              onClick={() => void exportFile("docx")}
              disabled={filteredWords.length === 0 || !!exporting}
              className="rounded-full bg-[#EEDDCC] px-5 py-2 text-sm font-medium text-[#8B5E3C] transition hover:bg-[#E5D5C0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting === "docx" ? "正在生成 Word…" : "导出 Word（DOCX）"}
            </button>
          </div>
        </section>

        {download && <a className="mb-3 inline-block text-[#8B5E3C] underline" href={download.url} download={download.name}>下载刚生成的文件</a>}
        {exportMessage && <p role="status" className="mb-4 text-sm text-[#8B5E3C]">{exportMessage}</p>}
        <section className="mb-6">
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-xl border border-[#EEDDCC] bg-white px-4 py-2.5 text-sm text-[#8B5E3C] focus:border-[#8B5E3C] focus:outline-none"
          >
            <option value="all">全部文章</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#EEDDCC] bg-white">
          {filteredWords.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="mb-2 text-lg font-medium text-[#8B5E3C]">词库还空着，去读篇文章吧</h2>
              <p className="text-sm text-[#8D7B6B]">读文章时收藏的单词，会出现在这里</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-[#FDFBF7] text-[#8B5E3C]">
                  <tr>
                    <th className="border-b border-[#EEDDCC] px-5 py-4 font-medium">单词</th>
                    <th className="border-b border-[#EEDDCC] px-5 py-4 font-medium">音标</th>
                    <th className="border-b border-[#EEDDCC] px-5 py-4 font-medium">释义</th>
                    <th className="border-b border-[#EEDDCC] px-5 py-4 font-medium">来自</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWords.map((word) => (
                    <tr key={`${word.word}-${getSource(word)}`} className="transition hover:bg-[#FDFBF7]">
                      <td className="border-b border-[#EEDDCC] px-5 py-4">
                        <Link href={`/word/${encodeURIComponent(word.word)}`} className="sf text-base font-semibold text-[#3E2723] hover:text-[#8B5E3C]">
                          {word.word}
                        </Link>
                      </td>
                      <td className="border-b border-[#EEDDCC] px-5 py-4 text-[#8D7B6B]">{word.phonetic}</td>
                      <td className="border-b border-[#EEDDCC] px-5 py-4 text-[#3E2723]">{word.chineseMeaning || word.meaning}</td>
                      <td className="border-b border-[#EEDDCC] px-5 py-4 text-[#8D7B6B]">{getSource(word)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <footer className="text-center py-8 text-[#8D7B6B] text-sm">
        Made with 🐾 by Kikoscope · 一个安静的雅思阅读角落
      </footer>
    </div>
  );
}
