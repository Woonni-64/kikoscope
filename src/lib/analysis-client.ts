"use client";
import { downloadBlob } from "./vocabulary-export";

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
  const learningData: Record<string, string> = {};
  for (const key of learningKeys) {
    const value = localStorage.getItem(key);
    if (value !== null) learningData[key] = value;
  }
  const data = { version: 2, exportedAt: new Date().toISOString(), documents: JSON.parse(localStorage.getItem("kikoscope_documents") || "[]"), analyses, learningData };
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), "kikoscope-learning-backup.json");
}

const learningKeys = ["vocabulary", "flashcard-progress", "flashcard-progress-ielts", "flashcard-daily-plan", "flashcard-daily-plan-ielts", "flashcard-imported-ielts"];
export function restoreAnalysisBackup(text: string) {
  let backup;
  try { backup = JSON.parse(text); } catch { throw new Error("备份不是有效的JSON文件。"); }
  if (![1, 2].includes(backup?.version) || !Array.isArray(backup.documents) || !Array.isArray(backup.analyses)) throw new Error("这不是Kikoscope学习备份。");
  const pending = new Map<string, string>();
  for (const analysis of backup.analyses) {
    if (!analysis || typeof analysis.id !== "string" || !/^analysis_[A-Za-z0-9_-]+$/.test(analysis.id) || typeof analysis.extractedText !== "string" || !Array.isArray(analysis.sentences)) throw new Error("备份中的文章数据不完整，尚未恢复任何内容。");
    if (!localStorage.getItem(prefix + analysis.id)) pending.set(prefix + analysis.id, JSON.stringify({...analysis, vocabulary: analysis.vocabulary || [], questions: analysis.questions || [], quizRaw: analysis.quizRaw || ""}));
  }
  const oldDocs = JSON.parse(localStorage.getItem("kikoscope_documents") || "[]");
  const documents = [...oldDocs];
  const ids = new Set(documents.map((d: {analysisId?: string; id: string}) => d.analysisId || d.id));
  for (const doc of backup.documents) {
    if (!doc || typeof doc.id !== "string" || typeof doc.name !== "string" || (doc.analysisId && !/^analysis_[A-Za-z0-9_-]+$/.test(doc.analysisId))) throw new Error("备份中的文件列表无效，尚未恢复任何内容。");
    const id = doc.analysisId || doc.id;
    if (!ids.has(id)) { documents.push(doc); ids.add(id); }
  }
  pending.set("kikoscope_documents", JSON.stringify(documents));
  let newWords = 0;
  for (const key of learningKeys) {
    if (typeof backup.learningData?.[key] !== "string") continue;
    const incoming = JSON.parse(backup.learningData[key]);
    const current = JSON.parse(localStorage.getItem(key) || (Array.isArray(incoming) ? "[]" : "{}"));
    if (key === "vocabulary" || key === "flashcard-imported-ielts") {
      if (!Array.isArray(incoming) || !Array.isArray(current)) throw new Error("备份词库格式无效。");
      const merged = [...current];
      const words = new Set(current.map((w: {word?:string;english?:string}) => (w.word || w.english || "").toLowerCase()));
      for (const word of incoming) {
        const name = word?.word || word?.english;
        if (typeof name !== "string" || !name.trim()) throw new Error("备份包含无效单词。");
        if (!words.has(name.toLowerCase())) { merged.push(word); words.add(name.toLowerCase()); if (key === "vocabulary") newWords++; }
      }
      pending.set(key, JSON.stringify(merged));
    } else if (key.includes("progress")) {
      if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) throw new Error("备份复习进度无效。");
      const merged = {...incoming, ...current};
      for (const name of Object.keys(incoming)) if (incoming[name]?.reviewedAt > (current[name]?.reviewedAt || 0)) merged[name] = incoming[name];
      pending.set(key, JSON.stringify(merged));
    } else if (!localStorage.getItem(key)) pending.set(key, JSON.stringify(incoming));
  }
  const original = new Map([...pending.keys()].map(key => [key, localStorage.getItem(key)]));
  try { for (const [key, value] of pending) localStorage.setItem(key, value); }
  catch {
    for (const key of pending.keys()) localStorage.removeItem(key);
    for (const [key, value] of original) if (value !== null) localStorage.setItem(key, value);
    throw new Error("存储空间不足，恢复未完成；原有数据已保留。");
  }
  return { articles: [...pending.keys()].filter(key => key.startsWith(prefix)).length, words: newWords };
}
