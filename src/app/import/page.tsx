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
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function ImportPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [dragover, setDragover] = useState(false);
  const router = useRouter();

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

    const validFiles = Array.from(files).filter(file => ACCEPTED_TYPES.includes(file.type));
    
    if (validFiles.length === 0) {
      alert("Kiki 现在能收图片、PDF 和 Word 文件");
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
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [router]);

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
            accept="image/*,.pdf,.docx"
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
                  className={`card group p-4 flex items-center justify-between hover:shadow-sm ${
                    doc.status === "completed" ? "hover:border-[#8B5E3C]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getStatusIcon(doc.status)}</span>
                    {doc.status === "completed" && doc.analysisId ? (
                      <Link
                        href={`/article/${doc.analysisId}`}
                        className="text-[#3E2723] underline-offset-4 transition hover:text-[#8B5E3C] hover:underline"
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

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#8B5E3C] text-white px-4 py-3 rounded-lg shadow-lg toast z-50">
          📄 已归档，Kiki 帮你收好了
        </div>
      )}
    </div>
  );
}
