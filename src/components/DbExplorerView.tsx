import React, { useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, Trash2, Sparkles, Check, X, ShieldAlert, Bot, PlayCircle } from 'lucide-react';
import { Question } from '../types';
import { useLanguage } from '../services/i18n';
import { sound } from '../services/soundService';
import { regenerateQuestionWithAI } from '../services/reportService';
import { adminUpdateQuestionEverywhere } from '../services/dbService';

interface DbExplorerViewProps {
  dbData: Record<string, Question[]>;
  isAdmin?: boolean;
  onBack: () => void;
  onSolveQuestion?: (question: Question) => void;
  onDeleteQuestion?: (question: Question, difficulty: string) => Promise<any> | void;
}

export const DbExplorerView: React.FC<DbExplorerViewProps> = ({
  dbData: initialDbData,
  isAdmin = false,
  onBack,
  onSolveQuestion,
  onDeleteQuestion
}) => {
  const { language, t } = useLanguage();
  const [dbData, setDbData] = useState<Record<string, Question[]>>(initialDbData);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const toggleSection = (diff: string) => {
    setOpenSections(prev => ({
      ...prev,
      [diff]: !prev[diff]
    }));
  };

  const handleRegenerate = async (q: Question, diff: string) => {
    const qKey = q.id || q.sentence;
    sound.playClick();
    setRegeneratingId(qKey);
    try {
      const res = await regenerateQuestionWithAI({
        sentence: q.sentence,
        form: q.form,
        currentAnswer: q.answer
      });
      if (res.success && res.question) {
        sound.playStar();
        const fixedQ: Question = {
          ...res.question,
          difficulty: q.difficulty || diff,
          level: q.level || diff
        };
        await adminUpdateQuestionEverywhere(fixedQ, q.sentence);
        setDbData(prev => {
          const nextList = (prev[diff] || []).map(item => (item.id && q.id ? item.id === q.id : item.sentence === q.sentence) ? fixedQ : item);
          return {
            ...prev,
            [diff]: nextList
          };
        });
        alert('🤖 AI 문제 재구성 및 DB 반영이 완료되었습니다!');
      } else {
        alert(`재구성 실패: ${res.error || 'AI 응답 오류'}`);
      }
    } catch (e: any) {
      alert(`오류: ${e.message}`);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDelete = async (q: Question, diff: string) => {
    const qKey = q.id || q.sentence;
    if (!window.confirm(`⚠️ [관리자 권한]\n이 문제("${q.sentence}")를 공용 문제집 및 랭킹전 회차 DB에서 영구 삭제하시겠습니까?`)) {
      return;
    }

    sound.playClick();
    setDeletingId(qKey);
    try {
      if (onDeleteQuestion) {
        await onDeleteQuestion(q, diff);
      }
      // Remove from local view
      setDbData(prev => {
        const nextList = (prev[diff] || []).filter(item => (item.id && q.id ? item.id !== q.id : item.sentence !== q.sentence));
        return {
          ...prev,
          [diff]: nextList
        };
      });
    } catch (e: any) {
      alert(`삭제 실패: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const LEVEL_ORDER = [
    'Level 1 (입문/초급)',
    'Level 2 (실력 중급)',
    'Level 3 (고득점 도약)',
    'Level 4 (실전 마스터)',
    'Level 1 (Beginner)',
    'Level 2 (Intermediate)',
    'Level 3 (Advanced)',
    'Level 4 (Mastery)'
  ];

  const diffKeys = Object.keys(dbData).sort((a, b) => {
    const idxA = LEVEL_ORDER.indexOf(a);
    const idxB = LEVEL_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return a.localeCompare(b);
  });

  const totalQuestions = Object.values(dbData).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="min-h-screen bg-animated-gradient flex justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center glass-card p-4 sm:p-5 rounded-[2rem] border border-slate-700/80 sticky top-4 z-20 shadow-lg backdrop-blur-xl">
          <button
            onClick={onBack}
            className="text-slate-400 font-bold hover:bg-slate-800 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h1 className="text-base sm:text-xl font-black text-white tracking-tight">
                {language === 'en' ? 'Public Question Library' : '공용 문제집 보관소'}
              </h1>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black">
              총 {totalQuestions}문제
            </span>
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                👑 관리자 삭제 모드
              </span>
            )}
          </div>
        </header>

        {/* Accordions */}
        {diffKeys.length === 0 || totalQuestions === 0 ? (
          <div className="glass-card rounded-[2.5rem] p-12 text-center border border-slate-700/60 shadow-xl space-y-3">
            <span className="text-5xl block">📚</span>
            <h3 className="font-extrabold text-xl text-white">
              {language === 'en' ? 'No saved questions found.' : '저장된 문제가 없습니다.'}
            </h3>
            <p className="text-slate-400 text-sm font-medium max-w-md mx-auto">
              {language === 'en' 
                ? 'Generate new questions from the Question Factory or start a Quiz to auto-populate!' 
                : '공용 문제집이 비어 있습니다. [문제 공장]에서 난이도별 문제를 생성하거나 랭킹전을 시작하면 새 문제가 등록됩니다!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {diffKeys.map((diff) => {
              const questions = dbData[diff] || [];
              if (questions.length === 0) return null;
              const isOpen = !!openSections[diff];

              return (
                <div
                  key={diff}
                  className="glass-card rounded-[2rem] border border-slate-700/80 overflow-hidden transition-all shadow-md"
                >
                  {/* Summary Bar */}
                  <button
                    onClick={() => toggleSection(diff)}
                    className="w-full p-5 sm:p-6 font-extrabold flex justify-between items-center text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base sm:text-lg text-white font-black">{diff}</span>
                      <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
                        {questions.length} {language === 'en' ? 'Questions' : '문제'}
                      </span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 bg-indigo-500 text-white' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Expanded Questions List */}
                  {isOpen && (
                    <div className="p-5 sm:p-6 bg-slate-950/50 border-t border-slate-700/60 max-h-[700px] overflow-y-auto space-y-4">
                      {questions.map((q, i) => {
                        const qKey = q.id || q.sentence;
                        const isDeleting = deletingId === qKey;
                        const isRegenerating = regeneratingId === qKey;

                        return (
                          <div
                            key={q.id || i}
                            className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md"
                          >
                            {/* Top info & Actions */}
                            <div className="flex flex-wrap justify-between items-center gap-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                                  #{q.form}형식
                                </span>
                                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-500/40">
                                  정답: "{q.answer}"
                                </span>
                                {q.createdAt && (
                                  <span className="text-[10px] text-slate-500">
                                    {typeof q.createdAt === 'string' ? q.createdAt : ''}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {/* 🎯 누구나 클릭하여 이 문제 바로 풀기 */}
                                {onSolveQuestion && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      sound.playClick();
                                      onSolveQuestion(q);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                                    title="이 문제를 직접 퀴즈 화면에서 풀어보기"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    <span>{language === 'en' ? 'Solve This' : '이 문제 풀기'}</span>
                                  </button>
                                )}

                                {/* 🤖 관리자 전용 AI 선지/정답/해설 즉시 재구성 */}
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleRegenerate(q, diff)}
                                    disabled={isRegenerating || isDeleting}
                                    className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                                    title="이 문제의 선지/정답/해설을 AI로 즉시 재구성하여 DB에 반영"
                                  >
                                    <Bot className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                                    <span>{isRegenerating ? '재구성 중...' : 'AI 재구성'}</span>
                                  </button>
                                )}

                                {/* 🗑️ 관리자 전용 단건 즉시 삭제 버튼 */}
                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(q, diff)}
                                    disabled={isRegenerating || isDeleting}
                                    className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                                    title="이 불량/오류 문제를 DB에서 영구 삭제"
                                  >
                                    <Trash2 className={`w-3.5 h-3.5 ${isDeleting ? 'animate-spin' : ''}`} />
                                    <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Sentence */}
                            <div className="font-bold text-base text-white leading-relaxed font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
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
                                          <span className="inline-block mx-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-black font-sans text-sm shadow-sm">
                                            {q.answer}
                                          </span>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </span>
                                );
                              })()}
                            </div>

                            {/* Translation */}
                            {q.translation && (
                              <p className="text-slate-300 font-medium text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                                🇰🇷 {q.translation}
                              </p>
                            )}

                            {/* 4 Options Grid */}
                            {Array.isArray(q.options) && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {q.options.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className={`p-2 rounded-xl border text-xs space-y-0.5 ${
                                      opt.is_correct || opt.text === q.answer
                                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between font-bold">
                                      <span>{oIdx + 1}. {opt.text}</span>
                                      <span>{opt.is_correct || opt.text === q.answer ? '✅ 정답' : '❌'}</span>
                                    </div>
                                    {opt.feedback && (
                                      <p className="text-[10px] text-slate-400 leading-tight">
                                        {opt.feedback}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Pattern / Nuance */}
                            {(q.explanation?.chunk_pattern || q.explanation?.nuance) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                {q.explanation?.chunk_pattern && (
                                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200">
                                    <span className="font-bold text-amber-300 block">🧩 패턴:</span>
                                    <span>{q.explanation.chunk_pattern}</span>
                                  </div>
                                )}
                                {q.explanation?.nuance && (
                                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-200">
                                    <span className="font-bold text-cyan-300 block">💡 뉘앙스:</span>
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
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
