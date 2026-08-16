import React, { useState } from 'react';
import { ArrowLeft, Star, Volume2, Plus, Sparkles, ChevronDown, ChevronUp, Play, Trash2, CheckCircle2 } from 'lucide-react';
import { BookmarkItem, Question } from '../types';
import { sound } from '../services/soundService';

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
            className="text-slate-400 hover:text-white font-bold transition-all flex items-center gap-1.5 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>메인으로</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{bookmarks.length} / {bookmarkLimit}개</span>
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
            내 즐겨찾기 보관함 ⭐
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
            중요하거나 다시 보고 싶은 문제를 나만의 단어장에 쏙!
          </p>
        </div>

        {/* Capacity Bar & Expand Button */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-300">
              보관함 용량 게이지 ({usagePercent}%)
            </span>
            <span className="text-xs text-slate-400">
              잔여 {bookmarkLimit - bookmarks.length}칸
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
              💡 100 코인으로 보관함을 <strong>+50칸 확장</strong>할 수 있습니다.
            </span>

            <button
              onClick={() => {
                sound.playClick();
                onExpandLimit();
              }}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>50칸 확장 (🪙 100)</span>
            </button>
          </div>
        </div>

        {/* Bookmarked Questions List */}
        {bookmarks.length === 0 ? (
          <div className="bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-700 p-8 sm:p-12 text-center text-slate-400">
            <span className="text-4xl mb-2 block">⭐</span>
            <p className="font-extrabold text-base sm:text-lg text-white">
              아직 즐겨찾기한 문제가 없습니다!
            </p>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              퀴즈나 문제집을 보다가 상단의 <strong>⭐ 버튼</strong>을 누르면 언제든 여기에 보관됩니다.
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
                          {q.form}형식
                        </span>
                        {q.difficulty && (
                          <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {q.difficulty}
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px]">
                          {bm.dateStr || '최근 저장'}
                        </span>
                      </div>

                      <p className="text-white font-bold text-sm sm:text-base leading-snug">
                        {(() => {
                          const BLANK_REGEX = /(?:_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)|<\s*blank\s*>|\[\s*빈칸\s*\]|\(\s*빈칸\s*\)|\[\s*_{1,}\s*\]|\(\s*_{1,}\s*\)|\bblank\b|\bBlank\b|\bBLANK\b)/gi;
                          const parts = q.sentence.split(BLANK_REGEX);
                          if (parts.length <= 1) {
                            return <span>{q.sentence} <span className="text-emerald-400 font-black">({q.answer})</span></span>;
                          }
                          return (
                            <span>
                              {parts.map((part, idx) => (
                                <React.Fragment key={idx}>
                                  {part}
                                  {idx < parts.length - 1 && (
                                    <span className="inline-block mx-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black font-sans text-xs sm:text-sm shadow-sm">
                                      {q.answer}
                                    </span>
                                  )}
                                </React.Fragment>
                              ))}
                            </span>
                          );
                        })()}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {q.translation}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => playAudio(q.sentence, q.answer)}
                        className="p-2 text-slate-400 hover:text-indigo-300 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all"
                        title="발음 듣기"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          sound.playStar();
                          onRemoveBookmark(q);
                        }}
                        className="p-2 text-amber-400 hover:text-rose-400 bg-amber-500/10 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="즐겨찾기 해제"
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>

                      <button
                        onClick={() => bm.id && toggleAccordion(bm.id)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Detail */}
                  {isOpen && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-700 text-xs space-y-2.5 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                          <span className="font-black text-amber-300 block mb-0.5">🧩 청크 패턴</span>
                          <p className="text-amber-100">{q.explanation?.chunk_pattern}</p>
                        </div>
                        <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                          <span className="font-black text-cyan-300 block mb-0.5">💡 뉘앙스/포인트</span>
                          <p className="text-cyan-100">{q.explanation?.nuance}</p>
                        </div>
                      </div>

                      {q.options && q.options.length > 0 && (
                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          <span className="font-black text-slate-300 block mb-1.5">보기별 해설:</span>
                          <div className="space-y-1">
                            {q.options.map((opt, i) => (
                              <div key={i} className="text-slate-300 leading-relaxed">
                                <span className={opt.is_correct ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                                  {opt.text} {opt.is_correct ? '✅' : '❌'}:
                                </span>{' '}
                                <span className="text-slate-400">{opt.feedback}</span>
                              </div>
                            ))}
                          </div>
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
