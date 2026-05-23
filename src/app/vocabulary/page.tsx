"use client";

import { type CSSProperties, useRef, useState, useEffect, useMemo } from "react";

import Nav from "@/components/Nav";

type Definition = {
  word: string;
  phonetic: string;
  audioUrl?: string;
  pos: string;
  meaning: string;
  chineseMeaning?: string;
  synonyms: string[];
  exams?: string[];
  source?: string;
  topic?: string;
};

const pdfWrapperStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#111111",
  padding: 32,
  width: 794,
};

const pdfTableStyle: CSSProperties = {
  borderCollapse: "collapse",
  fontSize: 14,
  textAlign: "left",
  width: "100%",
};

const pdfHeaderCellStyle: CSSProperties = {
  backgroundColor: "#f5f5f5",
  border: "1px solid #d4d4d4",
  color: "#404040",
  fontWeight: 600,
  padding: "12px 16px",
};

const pdfCellStyle: CSSProperties = {
  border: "1px solid #d4d4d4",
  color: "#111111",
  padding: "12px 16px",
  verticalAlign: "top",
};

const pdfTextCellStyle: CSSProperties = {
  ...pdfCellStyle,
  lineHeight: 1.55,
};

export default function VocabularyPage() {
  const [vocabulary, setVocabulary] = useState<Definition[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [isClient, setIsClient] = useState(false);
  const pdfTableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = window.localStorage.getItem("vocabulary");
    if (stored) {
      const parsedVocabulary = JSON.parse(stored) as Definition[];
      setVocabulary(parsedVocabulary);
      setSelectedWords(new Set(parsedVocabulary.map((item) => item.word.toLowerCase())));
    }
  }, []);

  const topics = useMemo(() => {
    const topicSet = new Set<string>();
    topicSet.add("all");
    vocabulary.forEach((item) => {
      if (item.topic) {
        topicSet.add(item.topic);
      }
    });
    return Array.from(topicSet);
  }, [vocabulary]);

  const filteredVocabulary = selectedTopic === "all" 
    ? vocabulary 
    : vocabulary.filter((item) => item.topic === selectedTopic);

  const selectedVocabulary = filteredVocabulary.filter((item) =>
    selectedWords.has(item.word.toLowerCase()),
  );

  const exportPdf = async () => {
  if (!pdfTableRef.current || selectedVocabulary.length === 0) {
      return;
    }

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(pdfTableRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imageWidth = pageWidth - 20;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    pdf.addImage(imageData, "PNG", 10, 10, imageWidth, imageHeight);
    pdf.save("kikoscope-vocabulary.pdf");
  };

  const handleToggleWord = (word: string) => {
    setSelectedWords((prev) => {
      const newSet = new Set(prev);
      const key = word.toLowerCase();
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleToggleAll = () => {
    if (selectedWords.size === filteredVocabulary.length) {
      setSelectedWords(new Set());
    } else {
      setSelectedWords(new Set(filteredVocabulary.map((item) => item.word.toLowerCase())));
    }
  };

  const handleDeleteWord = (word: string) => {
    if (confirm(`确定要删除单词 "${word}" 吗？`)) {
      const updatedVocabulary = vocabulary.filter((item) => item.word.toLowerCase() !== word.toLowerCase());
      setVocabulary(updatedVocabulary);
      setSelectedWords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(word.toLowerCase());
        return newSet;
      });
      window.localStorage.setItem("vocabulary", JSON.stringify(updatedVocabulary));
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <Nav />

      <section className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="sf text-3xl font-bold text-[#8B5E3C]">My Vocabulary Shelf</h2>
          <button
            type="button"
            onClick={exportPdf}
            disabled={!isClient || selectedVocabulary.length === 0}
            className="bg-[#8B5E3C] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            导出 PDF ({selectedVocabulary.length})
          </button>
        </div>
        
        {vocabulary.length > 0 && topics.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedTopic === topic
                    ? "bg-[#8B5E3C] text-white"
                    : "bg-[#EEDDCC] text-[#8D7B6B] hover:bg-[#E5D5C0]"
                }`}
              >
                {topic === "all" ? "全部话题" : topic}
              </button>
            ))}
          </div>
        )}
        
        {filteredVocabulary.length > 0 && (
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={filteredVocabulary.length > 0 && selectedWords.size === filteredVocabulary.length}
              onChange={handleToggleAll}
              className="mr-2 accent-[#8B5E3C]"
            />
            <span className="text-sm text-[#8D7B6B]">选择全部</span>
          </div>
        )}
        
        {vocabulary.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-8xl mb-4">🐾</div>
            <h3 className="sf text-xl font-bold text-[#8B5E3C] mb-2">你还没有收藏单词</h3>
            <p className="text-[#8D7B6B]">去读点什么吧。</p>
          </div>
        ) : filteredVocabulary.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-8xl mb-4">🐾</div>
            <p className="text-[#8D7B6B]">该话题暂无单词</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7]">
                  <th className="border border-[#EEDDCC] p-3 text-center text-xs font-bold text-[#8D7B6B] w-12">
                    选择
                  </th>
                  <th className="border border-[#EEDDCC] p-3 text-left text-xs font-bold text-[#8D7B6B]">
                    单词
                  </th>
                  <th className="border border-[#EEDDCC] p-3 text-left text-xs font-bold text-[#8D7B6B] w-20">
                    词性
                  </th>
                  <th className="border border-[#EEDDCC] p-3 text-left text-xs font-bold text-[#8D7B6B]">
                    中文释义
                  </th>
                  <th className="border border-[#EEDDCC] p-3 text-left text-xs font-bold text-[#8D7B6B] w-24">
                    来源
                  </th>
                  <th className="border border-[#EEDDCC] p-3 text-center text-xs font-bold text-[#8D7B6B] w-16">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVocabulary.map((item) => (
                  <tr key={item.word} className="hover:bg-[#FDFBF7]">
                    <td className="border border-[#EEDDCC] p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedWords.has(item.word.toLowerCase())}
                        onChange={() => handleToggleWord(item.word)}
                        className="accent-[#8B5E3C]"
                      />
                    </td>
                    <td className="border border-[#EEDDCC] p-3 sf font-bold text-[#8B5E3C]">
                      {item.word}
                    </td>
                    <td className="border border-[#EEDDCC] p-3 text-sm text-[#8D7B6B]">
                      {item.pos || "-"}
                    </td>
                    <td className="border border-[#EEDDCC] p-3 text-sm text-[#8D7B6B]">
                      {item.chineseMeaning || "-"}
                    </td>
                    <td className="border border-[#EEDDCC] p-3 text-sm text-[#8D7B6B]">
                      {item.source || "-"}
                    </td>
                    <td className="border border-[#EEDDCC] p-3 text-center">
                      <button
                        onClick={() => handleDeleteWord(item.word)}
                        className="text-[#8D7B6B] hover:text-red-500 text-sm transition-colors"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isClient && (
          <div
            ref={pdfTableRef}
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] top-0"
            style={pdfWrapperStyle}
          >
            <h2 className="mb-5 text-2xl font-semibold" style={{ color: "#111111" }}>
              My Vocabulary Shelf
            </h2>
            <table style={pdfTableStyle}>
              <thead>
                <tr>
                  <th style={pdfHeaderCellStyle}>单词</th>
                  <th style={pdfHeaderCellStyle}>词性</th>
                  <th style={pdfHeaderCellStyle}>中文释义</th>
                  <th style={pdfHeaderCellStyle}>来源</th>
                </tr>
              </thead>
              <tbody>
                {selectedVocabulary.map((item) => (
                  <tr key={item.word}>
                    <td style={{ ...pdfCellStyle, fontWeight: 600 }}>
                      {item.word}
                    </td>
                    <td style={pdfCellStyle}>
                      {item.pos || "-"}
                    </td>
                    <td style={pdfTextCellStyle}>
                      {item.chineseMeaning || "-"}
                    </td>
                    <td style={pdfCellStyle}>
                      {item.source || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="text-center py-8 text-[#8D7B6B] text-sm">
        Made with 🐾 by Kikoscope · 一个安静的雅思阅读角落
      </footer>
    </main>
  );
}
