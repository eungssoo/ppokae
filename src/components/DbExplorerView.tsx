import React, { useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, Sparkles } from 'lucide-react';
import { Question } from '../types';

interface DbExplorerViewProps {
  dbData: Record<string, Question[]>;
  onBack: () => void;
}

export const DbExplorerView: React.FC<DbExplorerViewProps> = ({
  dbData,
  onBack,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (diff: string) => {
    setOpenSections(prev => ({
      ...prev,
      [diff]: !prev[diff]
    }));
  };

  const LEVEL_ORDER = [
    'Level 1 (입문/초급)',
    'Level 2 (실력 중급)',
    'Level 3 (고득점 도약)',
    'Level 4 (실전 마스터)'
  ];

  const diffKeys = Object.keys(dbData).sort((a, b) => {
    const idxA = LEVEL_ORDER.indexOf(a);
    const idxB = LEVEL_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-animated-gradient flex justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl w-full">
        
        {/* Header */}
        <header className="flex justify-between items-center glass-card p-4 sm:p-5 rounded-[2rem] border border-slate-700/80 mb-6 sticky top-4 z-20 shadow-lg">
          <button
            onClick={onBack}
            className="text-slate-400 font-bold hover:bg-slate-800 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>메인으로</span>
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              공용 문제집 탐색
            </h1>
          </div>
        </header>

        {/* Accordions */}
        {diffKeys.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] p-12 text-center border border-slate-700/60 shadow-xl">
            <span className="text-5xl mb-3 block">텅!</span>
            <h3 className="font-extrabold text-xl text-white">저장된 문제가 없습니다.</h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              [문제 공장]에서 새로운 난이도의 문제를 생성해 보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {diffKeys.map((diff) => {
              const questions = dbData[diff] || [];
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
                        {questions.length}문제
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
                    <div className="p-5 sm:p-6 bg-slate-950/40 border-t border-slate-700/60 max-h-[600px] overflow-y-auto space-y-3.5">
                      {questions.map((q, i) => (
                        <div
                          key={q.id || i}
                          className="bg-slate-800/70 p-4 sm:p-5 rounded-2xl border border-slate-700 hover:border-indigo-500/40 transition-all"
                        >
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <p className="font-bold text-base sm:text-lg text-white leading-relaxed font-serif">
                              {q.sentence.replace(/_{2,}/, `[ ${q.answer} ]`)}
                            </p>
                            {q.createdAt && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded whitespace-nowrap border border-slate-800">
                                {q.createdAt}
                              </span>
                            )}
                          </div>

                          <p className="text-slate-300 font-medium text-sm mb-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                            {q.translation}
                          </p>

                          <div className="flex gap-2">
                            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-md border border-indigo-500/30">
                              {q.form}형식
                            </span>
                          </div>
                        </div>
                      ))}
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
