'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  status: string;
  analysisId?: string;
  error?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('kikoscope_documents');
    if (saved) {
      setDocuments(JSON.parse(saved));
    }
  }, []);

  const saveToLocalStorage = (docs: Document[]) => {
    localStorage.setItem('kikoscope_documents', JSON.stringify(docs));
  };

  const getStatusText = (doc: Document) => {
    switch (doc.status) {
      case 'uploading':
        return '上传中...';
      case 'analyzing':
        return '分析中...';
      case 'completed':
        return '分析完成';
      case 'error':
        return doc.error || '分析失败';
      default:
        return doc.status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-500';
      case 'uploading':
      case 'analyzing':
        return 'text-yellow-600';
      default:
        return 'text-gray-500';
    }
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '');
    });

    if (validFiles.length === 0) {
      alert('只支持 PDF、Word、TXT、Markdown 格式');
      return;
    }

    const tempDocs: Document[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      uploadedAt: new Date().toLocaleDateString('zh-CN') + ' ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'uploading',
    }));

    setDocuments(prev => {
      const updated = [...tempDocs, ...prev];
      saveToLocalStorage(updated);
      return updated;
    });

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const tempDoc = tempDocs[i];

      try {
        const formData = new FormData();
        formData.append('file', file);

        setDocuments(prev => {
          const updated = prev.map(doc =>
            doc.id === tempDoc.id ? { ...doc, status: 'analyzing' } : doc
          );
          saveToLocalStorage(updated);
          return updated;
        });

        const response = await fetch('/api/analyze-document', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setDocuments(prev => {
            const updated = prev.map(doc =>
              doc.id === tempDoc.id
                ? { ...doc, id: data.analysisId, analysisId: data.analysisId, status: 'completed' }
                : doc
            );
            saveToLocalStorage(updated);
            return updated;
          });

          router.push(`/analysis/${data.analysisId}`);
        } else {
          setDocuments(prev => {
            const updated = prev.map(doc =>
              doc.id === tempDoc.id
                ? { ...doc, status: 'error', error: data.error || '分析失败' }
                : doc
            );
            saveToLocalStorage(updated);
            return updated;
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
        setDocuments(prev => {
          const updated = prev.map(doc =>
            doc.id === tempDoc.id
              ? { ...doc, status: 'error', error: '网络错误' }
              : doc
          );
          saveToLocalStorage(updated);
          return updated;
        });
      }
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [router]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDocumentClick = (doc: Document) => {
    if (doc.status === 'completed' && doc.analysisId) {
      router.push(`/analysis/${doc.analysisId}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个文件吗？')) return;

    try {
      if (doc.analysisId) {
        await fetch('/api/delete-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId: doc.analysisId }),
        });
      }

      setDocuments(prev => {
        const updated = prev.filter(d => d.id !== doc.id);
        saveToLocalStorage(updated);
        return updated;
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFAF5]">
      <header className="bg-white border-b border-[#D4C4B0] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-[#8D7B6B] hover:text-[#6B5B4F]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-[#4A3F35]">交给 Kiki</h1>
          </div>
          <span className="text-sm text-[#8D7B6B]">上传文件，Kiki 帮你分析</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#C9A96E] bg-[#FDF8EE]'
              : 'border-[#D4C4B0] hover:border-[#C9A96E] hover:bg-[#FDF8EE]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <div className="text-6xl mb-4">📄</div>
          <p className="text-lg text-[#4A3F35] mb-2">拖拽文件到此处，或点击选择文件</p>
          <p className="text-sm text-[#8D7B6B]">支持 PDF、Word、TXT、Markdown 格式</p>
        </div>

        {documents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-[#4A3F35] mb-4">My Documents</h2>
            <div className="bg-white rounded-xl border border-[#E8DFD4] overflow-hidden">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`px-4 py-3 flex items-center justify-between hover:bg-[#FEFAF5] transition-colors ${
                    doc.status === 'completed' ? 'cursor-pointer' : 'cursor-default'
                  } ${documents.indexOf(doc) !== documents.length - 1 ? 'border-b border-[#E8DFD4]' : ''}`}
                  onClick={() => handleDocumentClick(doc)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {doc.name.endsWith('.pdf') ? '📕' : doc.name.endsWith('.doc') || doc.name.endsWith('.docx') ? '📘' : '📄'}
                    </span>
                    <div>
                      <p className="text-[#4A3F35] font-medium">{doc.name}</p>
                      <p className="text-sm text-[#8D7B6B]">{doc.uploadedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${getStatusColor(doc.status)}`}>
                      {getStatusText(doc)}
                    </span>
                    {doc.status !== 'uploading' && doc.status !== 'analyzing' && (
                      <button
                        onClick={(e) => handleDelete(e, doc)}
                        className="text-[#8D7B6B] hover:text-[#C48B7D] transition-colors p-1"
                        title="删除"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#4A3F35] text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          📄 已归档，Kiki 帮你收好了
        </div>
      )}
    </div>
  );
}
