export type ReadingSentence = { index: number; text: string };
export type ReadingChunk = { id: number; sentences: ReadingSentence[] };
export type ReadingOverview = { summary: string; purpose: string; logic: string; structure: { id: number; mainIdea: string; role: string; quote: string }[] };
export type ReadingDetail = { id: number; explanation: string; sentences: { index: number; translation: string; grammar: string }[] };
export type ReadingCache = { version: 1; source: string; overview?: ReadingOverview; details: Record<number, ReadingDetail> };

/** No slice(0,N): every nonempty source sentence belongs to exactly one chunk. */
export function readingChunks(text: string): ReadingChunk[] {
  const sentences = (text.replace(/\r\n/g, "\n").match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g) || [])
    .map(value => value.replace(/\s+/g, " ").trim()).filter(Boolean);
  const chunks: ReadingChunk[] = [];
  let current: ReadingSentence[] = [];
  let size = 0;
  for (const [index, sentence] of sentences.entries()) {
    if (current.length && (size + sentence.length > 2400 || current.length >= 12)) {
      chunks.push({ id: chunks.length + 1, sentences: current }); current = []; size = 0;
    }
    current.push({ index: index + 1, text: sentence }); size += sentence.length;
  }
  if (current.length) chunks.push({ id: chunks.length + 1, sentences: current });
  return chunks;
}
const filled = (value: unknown): value is string => typeof value === "string" && !!value.trim();
export function validateOverview(input: unknown, chunks: ReadingChunk[]): ReadingOverview {
  const value = input as ReadingOverview;
  if (!value || ![value.summary, value.purpose, value.logic].every(filled) || !Array.isArray(value.structure) || value.structure.length !== chunks.length) throw new Error("全文结构未覆盖所有部分，请重试。");
  const seen = new Set<number>();
  for (const item of value.structure) {
    const chunk = chunks.find(chunk => chunk.id === item.id);
    if (!chunk || seen.has(item.id) || ![item.mainIdea, item.role, item.quote].every(filled) || !chunk.sentences.map(s => s.text).join(" ").includes(item.quote)) throw new Error("全文分析的部分编号或原文证据无效，请重试。");
    seen.add(item.id);
  }
  return { ...value, structure: [...value.structure].sort((a,b) => a.id-b.id) };
}
export function validateDetail(input: unknown, chunk: ReadingChunk): ReadingDetail {
  const value = input as ReadingDetail;
  if (!value || value.id !== chunk.id || !filled(value.explanation) || !Array.isArray(value.sentences) || value.sentences.length !== chunk.sentences.length) throw new Error("本部分解读不完整，尚未标记完成，请重试。");
  const seen = new Set<number>();
  for (const item of value.sentences) {
    if (!chunk.sentences.some(sentence => sentence.index === item.index) || seen.has(item.index) || !filled(item.translation) || !filled(item.grammar)) throw new Error("本部分有句子漏解或编号重复，请重试。");
    seen.add(item.index);
  }
  return { ...value, sentences: [...value.sentences].sort((a,b) => a.index-b.index) };
}
