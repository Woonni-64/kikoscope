"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveAnalysis, removeCachedAnalysis, downloadAnalysisBackup, restoreAnalysisBackup } from "@/lib/analysis-client";
import { recognizeImage } from "@/lib/image-ocr";
import Nav from "@/components/Nav";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  status: "uploading" | "analyzing" | "completed" | "error";
  analysisId?: string;
  errorMessage?: string;
  storageMode?: "browser" | "server";
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ACCEPTED_EXTENSIONS = [".md", ".markdown", ".txt", ".png", ".jpg", ".jpeg", ".webp", ".pdf", ".docx"];

export default function ImportPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("📄 已归档，Kiki 帮你收好了");
  const [dragover, setDragover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<Document | null>(null);
  const router = useRouter();
  const [backupText, setBackupText] = useState("");
  const [backupMessage, setBackupMessage] = useState("");
  const [pastedText, setPastedText] = useState("");

  const showTemporaryToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const mergeDocuments = (localDocs: Document[], serverDocs: Document[]) => {
      const seen = new Set<string>();
      return [...localDocs, ...serverDocs].filter((doc) => {
        const key = doc.analysisId || doc.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const loadServerDocuments = async () => {
      try {
        const response = await fetch("/api/analyze-document");
        if (!response.ok) return;
        const data = (await response.json()) as { documents?: Document[] };
        if (cancelled || !data.documents) return;
        setDocuments(current => {
          const next = mergeDocuments(current, data.documents || []);
          localStorage.setItem("kikoscope_documents", JSON.stringify(next));
          return next;
        });
      } catch {
        // Local browser storage still keeps the page usable if the server list is unavailable.
      }
    };

    let localDocs: Document[] = [];
    const savedDocs = localStorage.getItem("kikoscope_documents");
    if (savedDocs) {
      try {
        localDocs = JSON.parse(savedDocs);
        setDocuments(localDocs);
      } catch {
        setDocuments([]);
      }
    }

    void loadServerDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(extension);
    });
    
    if (validFiles.length === 0) {
      alert("Kiki 现在能收图片、PDF、Word（DOCX）、TXT 和 Markdown 文件");
      return;
    }

    const newDocs: Document[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      uploadedAt: new Date().toLocaleString("zh-CN"),
      status: "uploading",
    }));

    setDocuments((prev) => {
      const next = [...newDocs, ...prev];
      localStorage.setItem("kikoscope_documents", JSON.stringify(next));
      return next;
    });

    let completedCount = 0;
    for (const [index, doc] of newDocs.entries()) {
      const file = validFiles[index];
      if (!file) continue;

      try {
        const formData = new FormData();
        const isImage = /\.(png|jpe?g|webp)$/i.test(file.name) || file.type.startsWith("image/");
        if (isImage) {
          setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: "analyzing" } : d));
          const text = await recognizeImage(file);
          formData.append("file", new File([text], "recognized.txt", { type: "text/plain" }));
          formData.append("originalName", file.name);
        } else {
          if (file.size > 4 * 1024 * 1024) throw new Error("文件超过4MB，请分成较小的文件或粘贴原文。");
          formData.append("file", file);
        }
        setDocuments((prev) =>
          prev.map((d): Document =>
            d.id === doc.id ? { ...d, status: "analyzing" } : d
          )
        );

        const response = await fetch("/api/analyze-document", {
          method: "POST",
          body: formData,
        });

        const result = await response.json().catch(() => ({ error: `服务器返回非JSON响应（HTTP ${response.status}），请稍后重试或缩小文件。` }));

        if (response.ok && result.analysisId && result.analysis) {
          saveAnalysis(result.analysis);
          completedCount++;
          setDocuments((prev) => {
            const next: Document[] = prev.map((d) =>
              d.id === doc.id
                ? { ...d, status: "completed", analysisId: result.analysisId, storageMode: result.storageMode }
                : d
            );
            localStorage.setItem("kikoscope_documents", JSON.stringify(next));
            return next;
          });
          
          if (newDocs.length === 1) router.push(`/article/${result.analysisId}`);
        } else { throw new Error(result.error || `解析失败（HTTP ${response.status}）`); }
      } catch (error) {
        setDocuments((prev) => {
          const next: Document[] = prev.map((d) =>
            d.id === doc.id ? { ...d, status: "error", errorMessage: error instanceof Error ? error.message : "解析失败，请重试" } : d
          );
          localStorage.setItem("kikoscope_documents", JSON.stringify(next));
          return next;
        });
      }
    }
    
    showTemporaryToast(completedCount === newDocs.length ? "资料已整理好" : `成功 ${completedCount} 份，失败 ${newDocs.length - completedCount} 份，请查看具体原因`);
  }, [router, showTemporaryToast]);

  const openDeleteModal = useCallback((doc: Document) => {
    setPendingDeleteDoc(doc);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setPendingDeleteDoc(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteDoc) return;

    const id = pendingDeleteDoc.analysisId || pendingDeleteDoc.id;

    try {
      if (pendingDeleteDoc.storageMode !== "browser") {
        const response = await fetch("/api/delete-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId: id }),
        });
        if (!response.ok) throw new Error("delete failed");
      }
      removeCachedAnalysis(id);
      setDocuments((prev) => {
        const next = prev.filter((item) => (item.analysisId || item.id) !== id);
        localStorage.setItem("kikoscope_documents", JSON.stringify(next));
        return next;
      });
      closeDeleteModal();
      showTemporaryToast("🗑️ 文件已删除");
    } catch {
      alert("这份文件暂时没有删掉，再试一次吧");
    }
  }, [closeDeleteModal, pendingDeleteDoc, showTemporaryToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragover(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragover(false);
  }, []);

  const handleFileInputChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    handleFileUpload(target.files);
    target.value = "";
  }, [handleFileUpload]);

  const fileInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.addEventListener("change", handleFileInputChange);
      return () => node.removeEventListener("change", handleFileInputChange);
    }
  }, [handleFileInputChange]);

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "uploading":
        return "📤";
      case "analyzing":
        return "🔍";
      case "completed":
        return "✅";
      case "error":
        return "❌";
      default:
        return "📄";
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Nav />
      
      <main className="mx-auto max-w-4xl px-6 py-12">
        <section className="text-center mb-12">
          <h1 className="sf text-3xl font-bold text-[#8B5E3C] mb-2">
            交给Kiki
          </h1>
          <p className="text-[#8D7B6B]">
            把你的真题交给Kiki，她会帮你整理好
          </p>
        </section>

        <details className="mb-8 rounded-2xl border border-[#EEDDCC] bg-white p-5">
          <summary className="cursor-pointer">恢复学习备份</summary>
          <p className="mt-3 text-sm">选择之前导出的备份，或粘贴备份内容。恢复会合并资料，不覆盖现有文章和词汇。未保存过的资料仍需重新导入原文件。</p>
          <input aria-label="选择学习备份" type="file" accept=".json,application/json" className="mt-3" onChange={async e => { const file = e.target.files?.[0]; if (file) setBackupText(await file.text()); }} />
          <textarea aria-label="备份内容" value={backupText} onChange={e => setBackupText(e.target.value)} placeholder="在这里粘贴之前导出的备份内容" className="mt-3 min-h-24 w-full rounded border p-3" />
          <button disabled={!backupText.trim()} className="mt-3 rounded-full bg-[#8B5E3C] px-5 py-2 text-white disabled:opacity-50" onClick={() => { try { const result = restoreAnalysisBackup(backupText); setDocuments(JSON.parse(localStorage.getItem("kikoscope_documents") || "[]")); setBackupMessage(`恢复完成：新增${result.articles}篇文章、${result.words}个单词。`); } catch (error) { setBackupMessage(error instanceof Error ? error.message : "恢复失败，原数据保留。"); } }}>合并恢复</button>
          {backupMessage && <p role="status" className="mt-3">{backupMessage}</p>}
        </details>
        <section className="mb-14">
          <div className="mb-6">
            <h2 className="sf text-2xl font-bold text-[#8B5E3C] mb-1">文件归档</h2>
            <p className="text-[#8D7B6B] text-sm">
              轻轻放在这里就好
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.docx,.txt,.md,.markdown"
            multiple
            className="hidden"
            id="file-upload"
          />
          
          <div
            onClick={() => document.getElementById("file-upload")?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`upload-zone cursor-pointer p-12 text-center transition-all ${dragover ? "border-[#8B5E3C] bg-[rgba(139,94,60,0.05)]" : ""}`}
          >
            <p className="text-[#3E2723] font-medium mb-2">
              📷 点击或拖拽，把真题交给Kiki
            </p>
            <p className="text-[#8D7B6B] text-sm">
              支持图片、PDF、Word
            </p>
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-[#EEDDCC] p-5">
          <h2 className="mb-2 text-lg text-[#8B5E3C]">也可以粘贴英文原文</h2>
          <p className="mb-3 text-sm text-[#8D7B6B]">图片在当前浏览器识别，首次使用需要下载英文识别资源。新解析结果保存在这个浏览器，不会自动跨设备同步；请及时备份。</p>
          <textarea aria-label="英文原文" className="w-full rounded border border-[#EEDDCC] bg-white p-3" rows={5} value={pastedText} onChange={e => setPastedText(e.target.value)} />
          <button className="mt-3 rounded bg-[#8B5E3C] px-4 py-2 text-white disabled:opacity-50" disabled={!pastedText.trim()} onClick={() => {
            const transfer = new DataTransfer();
            transfer.items.add(new File([pastedText], `原文-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`, { type: "text/plain" }));
            void handleFileUpload(transfer.files);
          }}>整理原文</button>
          <button className="ml-3 text-sm text-[#8B5E3C] underline" onClick={downloadAnalysisBackup}>备份本机解析结果</button>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#3E2723] mb-6 flex items-center gap-2">
            <span>📂</span>
            Kiki 帮你收着的资料
          </h2>
          
          {documents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#8D7B6B] text-lg">
                还没有资料，拍份真题交给Kiki吧
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`card group p-4 flex items-center justify-between transition duration-200 ease-in-out hover:bg-[#FDF8F3] hover:shadow-[0_2px_8px_rgba(62,39,35,0.06)] ${
                    doc.status === "completed" ? "hover:border-[#D4B896]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusIcon(doc.status)}</span>
                    {doc.status === "completed" && doc.analysisId ? (
                      <Link
                        href={`/article/${doc.analysisId}`}
                        className="rounded-md px-1 py-0.5 text-[#3E2723] no-underline transition duration-200 ease-in-out hover:bg-[#FDF8F3] hover:text-[#3E2723] hover:no-underline"
                      >
                        {doc.name}
                      </Link>
                    ) : (
                      <span className="text-[#3E2723]">{doc.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${
                      doc.status === "completed" ? "text-green-600" :
                      doc.status === "error" ? "text-red-600" :
                      doc.status === "analyzing" ? "text-blue-600" :
                      "text-[#8D7B6B]"
                    }`}>
                      {doc.status === "completed" && "分析完成"}
                      {doc.status === "analyzing" && "Kiki 正在整理"}
                      {doc.status === "uploading" && "正在收好"}
                      {doc.status === "error" && "这份资料还没收好"}
                    </span>
                    {doc.errorMessage && <span role="alert" className="max-w-md text-sm text-red-600">{doc.errorMessage}</span>}
                    <span className="text-[#8D7B6B] text-sm">{doc.uploadedAt}</span>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(doc)}
                      aria-label={`删除 ${doc.name}`}
                      className="rounded-full px-2 py-1 text-[#8D7B6B] transition hover:bg-[#FDFBF7] hover:text-[#C48B7D]"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="text-center py-8 text-[#8D7B6B] text-sm">
        Made with 🐾 by Kikoscope · 一个安静的雅思阅读角落
      </footer>

      {showDeleteModal && pendingDeleteDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-6">
          <div className="w-80 rounded-2xl border border-[#EEDDCC] bg-white p-6 text-center shadow-lg">
            <h3 className="mb-2 text-lg font-medium text-[#3E2723]">确认删除</h3>
            <p className="mb-6 text-sm text-[#8D7B6B]">删除后无法恢复，确定要继续吗？</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-full bg-[#EEDDCC] px-5 py-2 text-[#3E2723] transition hover:bg-[#D4B896]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-full bg-[#C48B7D] px-5 py-2 text-white transition hover:bg-[#B0705A]"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#8B5E3C] text-white px-4 py-3 rounded-lg shadow-lg toast z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
