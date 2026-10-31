"use client";

const prefix = "kikoscope_analysis_v1_";
export function cachedAnalysis<T>(id: string): T | null {
  try { const raw = localStorage.getItem(prefix + id); return raw ? JSON.parse(raw) as T : null; }
  catch { return null; }
}
export function saveAnalysis(result: { id: string }) {
  try { localStorage.setItem(prefix + result.id, JSON.stringify(result)); }
  catch { throw new Error("浏览器存储空间不足，解析结果未能保存。请先备份学习资料后再重试，不要直接清空浏览器数据。"); }
}
export function removeCachedAnalysis(id: string) { localStorage.removeItem(prefix + id); }
export async function loadAnalysis<T>(id: string): Promise<T> {
  const local = cachedAnalysis<T>(id);
  if (local) return local;
  const response = await fetch(`/api/analyze-document?id=${encodeURIComponent(id)}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "读取解析结果失败");
  return data as T;
}
export function downloadAnalysisBackup() {
  const analyses = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      try { analyses.push(JSON.parse(localStorage.getItem(key) || "null")); } catch { /* retain other entries */ }
    }
  }
  const data = { version: 1, exportedAt: new Date().toISOString(), documents: JSON.parse(localStorage.getItem("kikoscope_documents") || "[]"), analyses };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = "kikoscope-analysis-backup.json"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
