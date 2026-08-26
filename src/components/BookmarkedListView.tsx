import React, { useState } from 'react';
import { ArrowLeft, Star, Volume2, Plus, Sparkles, ChevronDown, ChevronUp, Play, Trash2, CheckCircle2 } from 'lucide-react';
import { BookmarkItem, Question } from '../types';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';

interface BookmarkedListViewProps {
  bookmarks: BookmarkItem[];
  bookmarkLimit: number;
  userCoins: number;
  onBack: () => void;
  onRemoveBookmark: (question: Question) => void;
  onExpandLimit: () => void;
  onStartPractice: (question: Question) => void;
}

export const BookmarkedListView: React.FC<BookmarkedListViewProps> = ({
  bookmarks,
  bookmarkLimit,
  userCoins,
  onBack,
  onRemoveBookmark,
  onExpandLimit,
  onStartPractice,
}) => {
  const { language, t } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    sound.playClick();
    setOpenId(prev => (prev === id ? null : id));
  };

  const playAudio = (sentence: string, answer: string) => {
    sound.playClick();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const BLANK_REGEX = /(?:_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)|<\s*blank\s*>|\[\s*빈칸\s*\]|\(\s*빈칸\s*\)|\[\s*_{1,}\s*\]|\(\s*_{1,}\s*\)|\bblank\b|\bBlank\b|\bBLANK\b)/gi;
    const fullText = sentence.replace(BLANK_REGEX, answer || '');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const usagePercent = Math.min(100, Math.round((bookmarks.length / bookmarkLimit) * 100));

  return (
    <div className="min-h-screen bg-slate-950 bg-animated-gradient flex items-center justify-center p-3 sm:p-6 md:p-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-3xl w-full glass-card rounded-[2.5rem] p-5 sm:p-8 relative border border-slate-700/60 shadow-2xl text-left">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-5 border-b border-slate-700/60 pb-3.5">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="text-slate-300 hover:text-white font-bold transition-all flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs sm:text-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{bookmarks.length} / {bookmarkLimit}</span>
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>My Starred Collection</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {language === 'en' ? 'Important Bookmarks ⭐' : '내 즐겨찾기 보관함 ⭐'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1">
            {language === 'en' ? 'Saved questions for revision and quick review!' : '중요하거나 다시 보고 싶은 문제를 나만의 단어장에 쏙!'}
          </p>
        </div>

        {/* Capacity Bar & Expand Button */}
        <div className="bg-slate-850 rounded-2xl p-4 border border-slate-750 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black text-slate-200">
              {language === 'en' ? `Capacity Gauge (${usagePercent}%)` : `보관함 용량 게이지 (${usagePercent}%)`}
            </span>
            <span className="text-xs text-slate-400 font-bold">
              {language === 'en' ? `${bookmarkLimit - bookmarks.length} slots remaining` : `잔여 ${bookmarkLimit - bookmarks.length}칸`}
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden mb-3 border border-slate-750">
            <div
              className={`h-full transition-all duration-300 ${
                usagePercent >= 90
                  ? 'bg-rose-500'
                  : usagePercent >= 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">
              {language === 'en' ? 'Need more space?' : '보관함이 부족하신가요?'}
            </span>
            <button
              onClick={onExpandLimit}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl font-black flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Expand Limit (🪙 50)' : '보관함 +10칸 확장 (🪙 50)'}</span>
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-10 border border-slate-800 text-center text-slate-400 shadow-sm">
            <Star className="w-10 h-10 mx-auto text-slate-500 mb-3" />
            <p className="font-black text-base text-white mb-1">
              {language === 'en' ? 'No bookmarked questions yet.' : '즐겨찾기한 문제가 없습니다.'}
            </p>
            <p className="text-xs text-slate-400">
              {language === 'en' ? 'Click the ⭐ star button during quiz to save tricky questions!' : '퀴즈를 풀면서 헷갈리는 문제가 나오면 상단 ⭐ 별표를 눌러 저장해보세요!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => {
              const q = bm.question;
              const isOpen = openId === bm.id;

              return (
                <div
                  key={bm.id}
                  className="bg-slate-850 rounded-2xl p-4 border border-slate-700/80 shadow-sm hover:border-indigo-500/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                          {language === 'en' ? `Form ${q.form}` : `${q.form}형식`}
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                          {language === 'en' ? `Answer: ${q.answer}` : `정답: ${q.answer}`}
                        </span>
                      </div>

                      <p className="font-bold text-white text-sm sm:text-base font-serif mb-1">
                        {q.sentence}
                      </p>
                      {language === 'ko' && (
                        <p className="text-xs text-slate-300 font-medium">
                          {q.translation}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => playAudio(q.sentence, q.answer)}
                        className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700"
                        title={language === 'en' ? 'Listen audio' : '발음 듣기'}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          onStartPractice(q);
                        }}
                        className="p-2 text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-600 rounded-xl border border-indigo-500/30 transition-colors"
                        title={language === 'en' ? 'Practice question' : '단독 풀기'}
                      >
                        <Play className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          onRemoveBookmark(q);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 rounded-xl border border-slate-700 transition-colors"
                        title={language === 'en' ? 'Delete' : '삭제'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => bm.id && toggleAccordion(bm.id)}
                        className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Explanation Content */}
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 text-left space-y-2 text-xs text-slate-300">
                      {q.explanation?.chunk_pattern && (
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-750">
                          <span className="font-bold text-indigo-300">{language === 'en' ? '🧩 Pattern: ' : '🧩 패턴: '}</span>
                          <span>{q.explanation.chunk_pattern}</span>
                        </div>
                      )}
                      {q.explanation?.nuance && (
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-750">
                          <span className="font-bold text-amber-300">{language === 'en' ? '💡 Nuance: ' : '💡 뉘앙스: '}</span>
                          <span>{q.explanation.nuance}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
