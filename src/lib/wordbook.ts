export interface WordEntry {
   word: string;
   phonetic: string;
   audioUrl?: string;
   pos: string;
   meaning: string;
   chineseMeaning?: string;
   synonyms: string[];
   exams?: string[];
   source?: string;
   addedAt?: number;
   fromArticle?: string;
}

const STORAGE_KEY = "vocabulary";

function getSupabaseConfig() {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

async function saveToSupabase(entry: WordEntry) {
  const config = getSupabaseConfig();
  if (!config) return;

  await fetch(`${config.url}/rest/v1/vocabulary`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      word: entry.word,
      phonetic: entry.phonetic,
      chinese: entry.chineseMeaning,
      definition: entry.meaning,
      example: "",
      article_slug: entry.fromArticle || entry.source,
      created_at: new Date(entry.addedAt ?? Date.now()).toISOString(),
    }),
  }).catch(() => undefined);
}

async function removeFromSupabase(word: string) {
  const config = getSupabaseConfig();
  if (!config) return;

  await fetch(`${config.url}/rest/v1/vocabulary?word=eq.${encodeURIComponent(word)}`, {
    method: "DELETE",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
    },
  }).catch(() => undefined);
}

export function getWordbook(): WordEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WordEntry[]) : [];
  } catch {
    return [];
  }
}

export function isInWordbook(word: string): boolean {
  return getWordbook().some(
    (w) => w.word.toLowerCase() === word.toLowerCase()
  );
}

export function addToWordbook(entry: WordEntry): boolean {
  if (isInWordbook(entry.word)) return false;
  const list = getWordbook();
  const savedEntry = { ...entry, addedAt: Date.now() };
  list.unshift(savedEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  void saveToSupabase(savedEntry);
  return true;
}

export function removeFromWordbook(word: string): void {
  const list = getWordbook().filter(
    (w) => w.word.toLowerCase() !== word.toLowerCase()
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  void removeFromSupabase(word);
}

export function toggleWordbook(entry: WordEntry): boolean {
  if (isInWordbook(entry.word)) {
    removeFromWordbook(entry.word);
    return false;
  } else {
    addToWordbook(entry);
    return true;
  }
}

export function importFromCSV(csvText: string): number {
  const lines = csvText.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 2) return 0;
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
  const col = (row: string[], name: string) => {
    const aliases: Record<string, string[]> = {
      word:           ["word", "单词", "english"],
      phonetic:       ["phonetic", "音标"],
      pos:            ["pos", "词性"],
      meaning:        ["meaning", "definition", "释义", "英文释义"],
      chinesemeaning: ["chinesemeaning", "chinese", "中文", "中文释义"],
    };
    const keys = aliases[name] ?? [name];
    const idx = headers.findIndex((h) => keys.includes(h));
    return idx >= 0 ? (row[idx] ?? "").trim().replace(/^"|"$/g, "") : "";
  };
  const existing = getWordbook();
  const existingWords = new Set(existing.map((w) => w.word.toLowerCase()));
  const newEntries: WordEntry[] = [];
  for (const line of lines.slice(1)) {
    const row = line.split(",");
    const word = col(row, "word");
    if (!word || existingWords.has(word.toLowerCase())) continue;
    newEntries.push({
      word,
      phonetic: col(row, "phonetic"),
      pos: col(row, "pos"),
      meaning: col(row, "meaning"),
      chineseMeaning: col(row, "chinesemeaning"),
      synonyms: [],
      addedAt: Date.now(),
      source: "CSV import",
    });
    existingWords.add(word.toLowerCase());
  }
  if (newEntries.length > 0) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...newEntries, ...existing])
    );
  }
  return newEntries.length;
}

export function exportToCSV(list?: WordEntry[]): string {
  const words = list ?? getWordbook();
  const header = "word,phonetic,pos,meaning,chineseMeaning";
  const rows = words.map((w) =>
    [w.word, w.phonetic, w.pos, w.meaning, w.chineseMeaning ?? ""]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...rows].join("\n");
}
