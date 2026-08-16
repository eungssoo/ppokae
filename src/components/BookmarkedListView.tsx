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
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="max-w-3xl w-full glass-card rounded-[2.5rem] p-5 sm:p-8 relative border border-slate-700/60 shadow-2xl">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-5 border-b border-slate-700/60 pb-3.5">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="text-slate-400 hover:text-white font-bold transition-all flex items-center gap-1.5 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs sm:text-sm active:scale-95"
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
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
            {language === 'en' ? 'Saved questions for revision and quick review!' : '중요하거나 다시 보고 싶은 문제를 나만의 단어장에 쏙!'}
          </p>
        </div>

        {/* Capacity Bar & Expand Button */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-300">
              {language === 'en' ? `Capacity Gauge (${usagePercent}%)` : `보관함 용량 게이지 (${usagePercent}%)`}
            </span>
            <span className="text-xs text-slate-400">
              {language === 'en' ? `${bookmarkLimit - bookmarks.length} slots remaining` : `잔여 ${bookmarkLimit - bookmarks.length}칸`}
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-3 border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-medium">
              {language === 'en' ? '💡 Expand +50 slots for 🪙 100 Coins.' : '💡 100 코인으로 보관함을 +50칸 확장할 수 있습니다.'}
            </span>

            <button
              onClick={() => {
                sound.playClick();
                onExpandLimit();
              }}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'en' ? '+50 Slots (🪙 100)' : '50칸 확장 (🪙 100)'}</span>
            </button>
          </div>
        </div>

        {/* Bookmarked Questions List */}
        {bookmarks.length === 0 ? (
          <div className="bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-700 p-8 sm:p-12 text-center text-slate-400">
            <span className="text-4xl mb-2 block">⭐</span>
            <p className="font-extrabold text-base sm:text-lg text-white">
              {language === 'en' ? 'No bookmarked questions yet!' : '아직 즐겨찾기한 문제가 없습니다!'}
            </p>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {language === 'en'
                ? 'Click the ⭐ button on any quiz question to save it here.'
                : '퀴즈나 문제집을 보다가 상단의 ⭐ 버튼을 누르면 언제든 여기에 보관됩니다.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {bookmarks.map((bm, index) => {
              const q = bm.question;
              const isOpen = openId === bm.id;

              return (
                <div
                  key={bm.id || index}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div
                      onClick={() => bm.id && toggleAccordion(bm.id)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-500/30">
                          {language === 'en' ? `Form ${q.form}` : `${q.form}형식`}
                        </span>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {language === 'en' ? 'Answer: ' : '정답: '}{q.answer}
                        </span>
                      </div>

                      <p className="text-sm sm:text-base font-bold text-white leading-relaxed font-serif">
                        {q.sentence}
                      </p>
                      {language === 'ko' && (
                        <p className="text-xs text-slate-400 mt-1">
                          {q.translation}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => playAudio(q.sentence, q.answer)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl border border-slate-700"
                        title={language === 'en' ? 'Play audio' : '발음 듣기'}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          onStartPractice(q);
                        }}
                        className="p-2 text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/40 rounded-xl border border-indigo-500/30"
                        title={language === 'en' ? 'Practice question' : '단독 풀기'}
                      >
                        <Play className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          onRemoveBookmark(q);
                        }}
                        className="p-2 text-slate-500 hover:text-rose-400 bg-slate-800 rounded-xl border border-slate-700"
                        title={language === 'en' ? 'Delete' : '삭제'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => bm.id && toggleAccordion(bm.id)}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Explanation Content */}
                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 text-left space-y-2 text-xs text-slate-300">
                      {q.explanation?.chunk_pattern && (
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                          <span className="font-bold text-indigo-300">{language === 'en' ? '🧩 Pattern: ' : '🧩 패턴: '}</span>
                          <span>{q.explanation.chunk_pattern}</span>
                        </div>
                      )}
                      {q.explanation?.nuance && (
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
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
