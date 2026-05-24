"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  status: "uploading" | "analyzing" | "completed" | "error";
  analysisId?: string;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ACCEPTED_EXTENSIONS = [".md", ".markdown"];

export default function ImportPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("📄 已归档，Kiki 帮你收好了");
  const [dragover, setDragover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteDoc, setPendingDeleteDoc] = useState<Document | null>(null);
  const router = useRouter();

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

    const loadServerDocuments = async (localDocs: Document[]) => {
      try {
        const response = await fetch("/api/analyze-document");
        if (!response.ok) return;
        const data = (await response.json()) as { documents?: Document[] };
        if (cancelled || !data.documents) return;
        const next = mergeDocuments(localDocs, data.documents);
        setDocuments(next);
        localStorage.setItem("kikoscope_documents", JSON.stringify(next));
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

    void loadServerDocuments(localDocs);

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
      alert("Kiki 现在能收图片、PDF、Word、PPT、Excel、TXT 和 Markdown 文件");
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

    for (const doc of newDocs) {
      const file = validFiles.find(f => f.name === doc.name);
      if (!file) continue;

      const formData = new FormData();
      formData.append("file", file);

      try {
        setDocuments((prev) =>
          prev.map((d): Document =>
            d.id === doc.id ? { ...d, status: "analyzing" } : d
          )
        );

        const response = await fetch("/api/analyze-document", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.analysisId) {
          setDocuments((prev) => {
            const next: Document[] = prev.map((d) =>
              d.id === doc.id
                ? { ...d, status: "completed", analysisId: result.analysisId }
                : d
            );
            localStorage.setItem("kikoscope_documents", JSON.stringify(next));
            return next;
          });
          
          router.push(`/article/${result.analysisId}`);
        } else {
          setDocuments((prev) => {
            const next: Document[] = prev.map((d) =>
              d.id === doc.id ? { ...d, status: "error" } : d
            );
            localStorage.setItem("kikoscope_documents", JSON.stringify(next));
            return next;
          });
        }
      } catch {
        setDocuments((prev) => {
          const next: Document[] = prev.map((d) =>
            d.id === doc.id ? { ...d, status: "error" } : d
          );
          localStorage.setItem("kikoscope_documents", JSON.stringify(next));
          return next;
        });
      }
    }
    
    showTemporaryToast("📄 已归档，Kiki 帮你收好了");
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
      const response = await fetch("/api/delete-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysisId: id }),
      });

      if (!response.ok) {
        throw new Error("delete failed");
      }

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
            accept="image/*,.pdf,.docx,.pptx,.xlsx,.txt,.md,.markdown"
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
