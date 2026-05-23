'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface AnalysisData {
  title: string;
  article: string;
  questions: string;
  sentences: string[];
  slug?: string;
}

interface WordInfo {
  word: string;
  phonetic?: string;
  audio?: string;
  partOfSpeech?: string;
  definition?: string;
  example?: string;
  chinese?: string;
  synonyms?: string[];
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null);
  const [wordPosition, setWordPosition] = useState({ x: 0, y: 0 });
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({});
  const [vocabulary, setVocabulary] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/articles/${id}`);
        if (!response.ok) {
          throw new Error('文章不存在');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem('kikoscope_vocabulary');
    if (saved) {
      const words = JSON.parse(saved);
      setVocabulary(new Set(words.map((w: any) => w.english)));
    }
  }, []);

  const handleWordClick = async (word: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setWordPosition({
      x: Math.min(rect.right + 10, window.innerWidth - 350),
      y: Math.min(rect.bottom + 10, window.innerHeight - 400),
    });
    setSelectedWord({ word });

    try {
      const [dictRes, transRes] = await Promise.all([
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`),
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh`),
      ]);

      if (dictRes.ok) {
        const dictData = await dictRes.json();
        const entry = dictData[0];
        setSelectedWord({
          word,
          phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
          audio: entry.phonetics?.[0]?.audio,
          partOfSpeech: entry.meanings?.[0]?.partOfSpeech,
          definition: entry.meanings?.[0]?.definitions?.[0]?.definition,
          example: entry.meanings?.[0]?.definitions?.[0]?.example,
          synonyms: entry.meanings?.[0]?.synonyms?.slice(0, 5),
        });
      }

      if (transRes.ok) {
        const transData = await transRes.json();
        setSelectedWord(prev => ({
          ...prev!,
          chinese: transData.responseData?.translatedText,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch word info:', err);
    }
  };

  const playAudio = () => {
    if (selectedWord?.audio && audioRef.current) {
      audioRef.current.src = selectedWord.audio;
      audioRef.current.play();
    }
  };

  const translateSentence = async (sentence: string, index: number) => {
    if (translations[index]) {
      setShowTranslations(prev => ({ ...prev, [index]: !prev[index] }));
      return;
    }

    try {
      const response = await fetch('/api/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence }),
      });
      const data = await response.json();
      if (data.translation) {
        setTranslations(prev => ({ ...prev, [index]: data.translation }));
        setShowTranslations(prev => ({ ...prev, [index]: true }));
      }
    } catch (err) {
      console.error('Translation error:', err);
    }
  };

  const addToVocabulary = () => {
    if (!selectedWord) return;
    
    const newWord = {
      english: selectedWord.word,
      chinese: selectedWord.chinese,
      phonetic: selectedWord.phonetic,
      partOfSpeech: selectedWord.partOfSpeech,
      definition: selectedWord.definition,
    };

    const saved = localStorage.getItem('kikoscope_vocabulary');
    const words = saved ? JSON.parse(saved) : [];
    
    if (!words.some((w: any) => w.english === selectedWord.word)) {
      words.push(newWord);
      localStorage.setItem('kikoscope_vocabulary', JSON.stringify(words));
      setVocabulary(prev => new Set([...prev, selectedWord.word]));
    }

    setSelectedWord(null);
  };

  const isInVocabulary = selectedWord && vocabulary.has(selectedWord.word);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFAF5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <p className="text-[#8D7B6B]">正在加载...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FEFAF5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😿</div>
          <p className="text-[#8D7B6B] mb-4">{error || '文章不存在'}</p>
          <button
            onClick={() => router.push('/import')}
            className="px-6 py-2 bg-[#4A3F35] text-white rounded-lg hover:bg-[#3A2F25] transition-colors"
          >
            去上传
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFAF5]">
      <header className="bg-white border-b border-[#D4C4B0] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/import')} className="text-[#8D7B6B] hover:text-[#6B5B4F]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-[#4A3F35]">{data.title}</h1>
          </div>
          <button
            onClick={() => router.push(`/analysis/${id}/quiz`)}
            className="px-4 py-2 bg-[#4A3F35] text-white rounded-lg hover:bg-[#3A2F25] transition-colors text-sm"
          >
            去练习 →
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium text-[#4A3F35] mb-4">精读</h2>
            <div className="space-y-4">
              {data.sentences.map((sentence, index) => (
                <div key={index} className="bg-white rounded-xl border border-[#E8DFD4] p-4">
                  <p className="text-[#4A3F35] leading-relaxed mb-3">
                    {sentence.split(' ').map((word, wordIndex) => {
                      const cleanWord = word.replace(/[^a-zA-Z'-]/g, '');
                      if (!cleanWord) return word + ' ';
                      
                      return (
                        <span
                          key={wordIndex}
                          onClick={(e) => handleWordClick(cleanWord, e)}
                          className="cursor-pointer hover:bg-[#F5EFE7] hover:text-[#C9A96E] transition-colors rounded px-0.5"
                          title={`点击查看 ${cleanWord} 的释义`}
                        >
                          {word}{' '}
                        </span>
                      );
                    })}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => translateSentence(sentence, index)}
                      className="text-sm px-3 py-1 bg-[#F5EFE7] text-[#8D7B6B] rounded hover:bg-[#E8DFD4] transition-colors"
                    >
                      {showTranslations[index] ? '隐藏' : '译'}
                    </button>
                    {translations[index] && showTranslations[index] && (
                      <p className="text-sm text-[#6B5B4F]">{translations[index]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[#4A3F35] mb-4">本文生词</h2>
            <div className="bg-white rounded-xl border border-[#E8DFD4] p-4">
              {vocabulary.size === 0 ? (
                <p className="text-[#8D7B6B] text-sm text-center py-4">
                  点击句子中的单词收藏
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Array.from(vocabulary).map((word) => (
                    <span
                      key={word}
                      className="px-3 py-1 bg-[#F5EFE7] text-[#4A3F35] rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => router.push('/ielts-flashcards')}
                className="w-full px-4 py-3 bg-[#C9A96E] text-white rounded-lg hover:bg-[#B8995E] transition-colors text-center"
              >
                🃏 去背单词
              </button>
            </div>
          </div>
        </div>
      </main>

      {selectedWord && (
        <div
          className="fixed bg-white rounded-xl shadow-xl p-6 w-80 z-50 border border-[#E8DFD4]"
          style={{
            left: wordPosition.x,
            top: wordPosition.y,
            maxWidth: 'calc(100vw - 40px)',
          }}
        >
          <button
            onClick={() => setSelectedWord(null)}
            className="absolute top-2 right-2 text-[#8D7B6B] hover:text-[#4A3F35]"
          >
            ✕
          </button>

          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-[#4A3F35]">{selectedWord.word}</h3>
            {selectedWord.phonetic && (
              <p className="text-[#8D7B6B]">{selectedWord.phonetic}</p>
            )}
            <button
              onClick={playAudio}
              className="mt-2 text-2xl hover:scale-110 transition-transform"
              disabled={!selectedWord.audio}
            >
              🔊
            </button>
          </div>

          {selectedWord.partOfSpeech && (
            <div className="mb-3">
              <span className="px-2 py-1 bg-[#F5EFE7] text-[#C9A96E] text-xs rounded">
                {selectedWord.partOfSpeech}
              </span>
            </div>
          )}

          {selectedWord.chinese && (
            <p className="text-lg text-[#4A3F35] mb-3">{selectedWord.chinese}</p>
          )}

          {selectedWord.definition && (
            <div className="mb-3">
              <p className="text-sm text-[#6B5B4F]">{selectedWord.definition}</p>
            </div>
          )}

          {selectedWord.example && (
            <p className="text-sm text-[#8D7B6B] italic mb-3">例: {selectedWord.example}</p>
          )}

          {selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-[#8D7B6B] mb-1">近义词:</p>
              <div className="flex flex-wrap gap-1">
                {selectedWord.synonyms.map((syn) => (
                  <span key={syn} className="px-2 py-0.5 bg-[#F5EFE7] text-[#8D7B6B] text-xs rounded">
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addToVocabulary}
            className={`w-full py-2 rounded-lg transition-colors ${
              isInVocabulary
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#4A3F35] text-white hover:bg-[#3A2F25]'
            }`}
            disabled={isInVocabulary}
          >
            {isInVocabulary ? '已收藏' : '☆ 收藏'}
          </button>

          <audio ref={audioRef} />
        </div>
      )}

      {selectedWord && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}
