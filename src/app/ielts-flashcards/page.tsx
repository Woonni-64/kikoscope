'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Word {
  english: string;
  chinese?: string;
  phonetic?: string;
  partOfSpeech?: string;
  example?: string;
  synonyms?: string[];
}

const HONGBAO_538: Word[] = [
  { english: 'abandon', chinese: '放弃', phonetic: '/əˈbændən/', partOfSpeech: 'v.', example: 'They had to abandon the project.', synonyms: ['give up', 'quit'] },
  { english: 'ability', chinese: '能力', phonetic: '/əˈbɪləti/', partOfSpeech: 'n.', example: 'She has the ability to learn quickly.', synonyms: ['capacity', 'skill'] },
  { english: 'able', chinese: '能够', phonetic: '/ˈeɪbl/', partOfSpeech: 'adj.', example: 'He is able to speak three languages.', synonyms: ['capable', 'skilled'] },
  { english: 'about', chinese: '关于', phonetic: '/əˈbaʊt/', partOfSpeech: 'prep.', example: 'We talked about the plan.', synonyms: ['regarding', 'concerning'] },
  { english: 'above', chinese: '在...上面', phonetic: '/əˈbʌv/', partOfSpeech: 'prep.', example: 'The bird flew above the clouds.', synonyms: ['over', 'higher than'] },
  { english: 'abroad', chinese: '在国外', phonetic: '/əˈbrɔːd/', partOfSpeech: 'adv.', example: 'She studied abroad last year.', synonyms: ['overseas', 'internationally'] },
  { english: 'absence', chinese: '缺席', phonetic: '/ˈæbsəns/', partOfSpeech: 'n.', example: 'His absence was noticed.', synonyms: ['lack', 'missing'] },
  { english: 'absolute', chinese: '绝对的', phonetic: '/ˈæbsəluːt/', partOfSpeech: 'adj.', example: 'It is an absolute necessity.', synonyms: ['complete', 'total'] },
  { english: 'absorb', chinese: '吸收', phonetic: '/əbˈzɔːrb/', partOfSpeech: 'v.', example: 'Plants absorb water from the soil.', synonyms: ['take in', 'soak up'] },
  { english: 'abstract', chinese: '抽象的', phonetic: '/ˈæbstrækt/', partOfSpeech: 'adj.', example: 'The concept is too abstract.', synonyms: ['theoretical', 'conceptual'] },
  { english: 'abundant', chinese: '丰富的', phonetic: '/əˈbʌndənt/', partOfSpeech: 'adj.', example: 'The region has abundant resources.', synonyms: ['plentiful', 'rich'] },
  { english: 'academic', chinese: '学术的', phonetic: '/ˌækəˈdemɪk/', partOfSpeech: 'adj.', example: 'She has excellent academic records.', synonyms: ['educational', 'scholarly'] },
  { english: 'accept', chinese: '接受', phonetic: '/əkˈsept/', partOfSpeech: 'v.', example: 'Please accept my apology.', synonyms: ['agree to', 'take'] },
  { english: 'access', chinese: '访问', phonetic: '/ˈækses/', partOfSpeech: 'n.', example: 'You need access to the system.', synonyms: ['entry', 'approach'] },
  { english: 'accident', chinese: '事故', phonetic: '/ˈæksɪdənt/', partOfSpeech: 'n.', example: 'The accident happened on the highway.', synonyms: ['incident', 'crash'] },
  { english: 'accompany', chinese: '陪伴', phonetic: '/əˈkʌmpəni/', partOfSpeech: 'v.', example: 'She accompanied her friend to the doctor.', synonyms: ['go with', 'escort'] },
  { english: 'accomplish', chinese: '完成', phonetic: '/əˈkʌmplɪʃ/', partOfSpeech: 'v.', example: 'We accomplished our goal.', synonyms: ['achieve', 'complete'] },
  { english: 'according', chinese: '根据', phonetic: '/əˈkɔːrdɪŋ/', partOfSpeech: 'prep.', example: 'According to the weather report, it will rain.', synonyms: ['as stated by', 'based on'] },
  { english: 'account', chinese: '账户', phonetic: '/əˈkaʊnt/', partOfSpeech: 'n.', example: 'She opened a bank account.', synonyms: ['record', 'report'] },
  { english: 'accurate', chinese: '准确的', phonetic: '/ˈækjərət/', partOfSpeech: 'adj.', example: 'The data must be accurate.', synonyms: ['precise', 'correct'] },
];

const LEVELS_538 = [
  { name: '超高频', color: '#C9A96E', words: HONGBAO_538.slice(0, 10) },
  { name: '高频', color: '#A8936E', words: HONGBAO_538.slice(10, 20) },
  { name: '常考', color: '#8D7B6B', words: HONGBAO_538.slice(0, 15) },
];

export default function FlashcardsPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [vocabularySource, setVocabularySource] = useState<'hongbao' | 'mine' | 'import'>('hongbao');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userVocabulary, setUserVocabulary] = useState<Word[]>([]);
  const [importedWords, setImportedWords] = useState<Word[]>([]);
  const [learningData, setLearningData] = useState<Record<string, { level: number; nextReview: number }>>({});

  useEffect(() => {
    const saved = localStorage.getItem('kikoscope_vocabulary');
    if (saved) {
      setUserVocabulary(JSON.parse(saved));
    }
    const savedImported = localStorage.getItem('kikoscope_imported_words');
    if (savedImported) {
      setImportedWords(JSON.parse(savedImported));
    }
    const savedLearning = localStorage.getItem('word_learning_data');
    if (savedLearning) {
      setLearningData(JSON.parse(savedLearning));
    }
  }, []);

  const getCurrentWords = useCallback(() => {
    if (vocabularySource === 'hongbao') {
      return LEVELS_538[currentLevel].words;
    } else if (vocabularySource === 'mine') {
      return userVocabulary;
    } else {
      return importedWords;
    }
  }, [vocabularySource, currentLevel, userVocabulary, importedWords]);

  const words = getCurrentWords();
  const currentWord = words[currentIndex];

  const speakWord = async (word: string) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();
      if (data[0]?.phonetics?.[0]?.audio) {
        const audio = new Audio(data[0].phonetics[0].audio);
        audio.play();
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const getNextReviewInterval = (status: 'known' | 'familiar' | 'forgot') => {
    const now = Date.now();
    if (status === 'forgot') return now;
    if (status === 'familiar') return now + 24 * 60 * 60 * 1000;
    const intervals = [1, 2, 4, 7, 15, 30];
    const wordKey = currentWord.english;
    const currentLevel = learningData[wordKey]?.level || 0;
    const nextLevel = Math.min(currentLevel + 1, intervals.length - 1);
    return now + intervals[nextLevel] * 24 * 60 * 60 * 1000;
  };

  const handleResponse = (status: 'known' | 'familiar' | 'forgot') => {
    const wordKey = currentWord.english;
    const now = Date.now();
    const currentLevel = learningData[wordKey]?.level || 0;

    let newLevel = currentLevel;
    if (status === 'known') {
      newLevel = Math.min(currentLevel + 1, 5);
    } else if (status === 'familiar') {
      newLevel = Math.max(currentLevel - 1, 0);
    } else {
      newLevel = 0;
    }

    const newLearningData = {
      ...learningData,
      [wordKey]: {
        level: newLevel,
        nextReview: getNextReviewInterval(status),
      },
    };

    setLearningData(newLearningData);
    localStorage.setItem('word_learning_data', JSON.stringify(newLearningData));

    const filteredWords = words.filter((w, idx) => {
      const key = w.english;
      const data = newLearningData[key];
      if (!data) return true;
      return data.nextReview <= now;
    });

    if (currentIndex >= filteredWords.length - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => Math.min(prev + 1, filteredWords.length - 1));
    }

    setIsFlipped(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'Digit1' || e.code === 'Numpad1') {
        handleResponse('known');
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        handleResponse('familiar');
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        handleResponse('forgot');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, currentIndex, words]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      let words: Word[] = [];

      if (file.name.endsWith('.json')) {
        try {
          words = JSON.parse(content);
        } catch {
          alert('JSON 格式错误');
          return;
        }
      } else {
        const lines = content.split('\n').filter(l => l.trim());
        words = lines.map(word => ({ english: word.trim(), chinese: '' }));
      }

      setImportedWords(words);
      localStorage.setItem('kikoscope_imported_words', JSON.stringify(words));
      alert(`已导入 ${words.length} 个单词`);
    };
    reader.readAsText(file);
  };

  const getProgress = () => {
    const total = words.length;
    const learned = Object.keys(learningData).filter(key => {
      return learningData[key]?.level > 0 && words.some(w => w.english === key);
    }).length;
    return { total, learned, percentage: total > 0 ? Math.round((learned / total) * 100) : 0 };
  };

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-[#FEFAF5]">
      <header className="bg-white border-b border-[#D4C4B0] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-[#8D7B6B] hover:text-[#6B5B4F]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-[#4A3F35]">词汇闪卡</h1>
          </div>
          <div className="text-sm text-[#8D7B6B]">
            {progress.learned}/{progress.total} 已掌握 ({progress.percentage}%)
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setVocabularySource('hongbao')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              vocabularySource === 'hongbao'
                ? 'bg-[#4A3F35] text-white'
                : 'bg-white text-[#8D7B6B] border border-[#D4C4B0]'
            }`}
          >
            刘洪波538考点词 · {HONGBAO_538.length}词
          </button>
          <button
            onClick={() => setVocabularySource('mine')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              vocabularySource === 'mine'
                ? 'bg-[#4A3F35] text-white'
                : 'bg-white text-[#8D7B6B] border border-[#D4C4B0]'
            }`}
          >
            我的词库 · {userVocabulary.length}词
          </button>
          <button
            onClick={() => {
              setVocabularySource('import');
              fileInputRef.current?.click();
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              vocabularySource === 'import'
                ? 'bg-[#4A3F35] text-white'
                : 'bg-white text-[#8D7B6B] border border-[#D4C4B0]'
            }`}
          >
            导入词书
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt,.csv"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {vocabularySource === 'hongbao' && (
          <div className="flex gap-2 mb-6">
            {LEVELS_538.map((level, idx) => (
              <button
                key={level.name}
                onClick={() => {
                  setCurrentLevel(idx);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  currentLevel === idx
                    ? 'text-white'
                    : 'bg-white text-[#8D7B6B] border border-[#D4C4B0]'
                }`}
                style={currentLevel === idx ? { backgroundColor: level.color } : {}}
              >
                {level.name}
              </button>
            ))}
          </div>
        )}

        <div className="relative h-80 mb-6">
          <div
            className="absolute inset-0 cursor-pointer perspective-1000"
            onClick={handleFlip}
            style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s' }}
          >
            <div
              className="absolute inset-0 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-[#4A3F35] mb-2">{currentWord?.english}</h2>
                {currentWord?.phonetic && (
                  <p className="text-lg text-[#8D7B6B] mb-4">{currentWord.phonetic}</p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentWord?.english || '');
                  }}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  🔊
                </button>
              </div>
              <p className="text-sm text-[#C9A96E] mt-4">点击翻转查看答案</p>
            </div>

            <div
              className="absolute inset-0 bg-[#4A3F35] rounded-xl shadow-lg p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)' }}
            >
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4">{currentWord?.english}</h2>
                <p className="text-2xl mb-4">{currentWord?.chinese}</p>
                {currentWord?.partOfSpeech && (
                  <p className="text-lg text-[#C9A96E] mb-2">{currentWord.partOfSpeech}</p>
                )}
                {currentWord?.example && (
                  <p className="text-sm text-gray-300 mb-4">例: {currentWord.example}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => handleResponse('known')}
            className="px-8 py-3 bg-[#A3B18A] text-white rounded-lg font-medium hover:bg-[#8A9A74] transition-colors"
          >
            认识了 ✓
          </button>
          <button
            onClick={() => handleResponse('familiar')}
            className="px-8 py-3 bg-[#D4B896] text-white rounded-lg font-medium hover:bg-[#C4A886] transition-colors"
          >
            不太熟
          </button>
          <button
            onClick={() => handleResponse('forgot')}
            className="px-8 py-3 bg-[#C48B7D] text-white rounded-lg font-medium hover:bg-[#B47A6D] transition-colors"
          >
            忘记了 ✗
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#E8DFD4] p-4 text-center">
          <p className="text-sm text-[#8D7B6B] mb-2">键盘快捷键</p>
          <div className="flex justify-center gap-6 text-sm">
            <span className="text-[#4A3F35]"><kbd className="px-2 py-1 bg-gray-100 rounded">空格</kbd> 翻转</span>
            <span className="text-[#4A3F35]"><kbd className="px-2 py-1 bg-gray-100 rounded">1</kbd> 认识了</span>
            <span className="text-[#4A3F35]"><kbd className="px-2 py-1 bg-gray-100 rounded">2</kbd> 不太熟</span>
            <span className="text-[#4A3F35]"><kbd className="px-2 py-1 bg-gray-100 rounded">3</kbd> 忘记了</span>
          </div>
          <p className="text-xs text-[#8D7B6B] mt-3">
            艾宾浩斯：认识了(1→2→4→7→15→30天) / 不太熟(1天) / 忘记了(今天)
          </p>
        </div>

        <audio ref={audioRef} />
      </main>
    </div>
  );
}
