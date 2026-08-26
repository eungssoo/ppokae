import React from 'react';
import { ArrowLeft, ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WeaknessRecord } from '../types';
import { useLanguage } from '../services/i18n';
import { getGrammarTagInfo, inferGrammarCategory } from '../services/grammarTagService';

interface IncorrectListViewProps {
  incorrectList: WeaknessRecord[];
  onBack: () => void;
}

export const IncorrectListView: React.FC<IncorrectListViewProps> = ({
  incorrectList,
  onBack,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-animated-gradient flex justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl w-full">
        
        {/* Sticky Header */}
        <header className="flex justify-between items-center glass-card p-4 sm:p-5 rounded-[2rem] border border-slate-700/80 mb-6 sticky top-4 z-20 shadow-lg">
          <button
            onClick={onBack}
            className="text-slate-400 font-bold hover:bg-slate-800 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {language === 'en' ? 'Incorrect Review Notes' : '내 오답 노트'}
            </h1>
          </div>
        </header>

        {/* List Content */}
        {incorrectList.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] p-12 text-center border border-slate-700/60 shadow-xl">
            <span className="text-5xl mb-3 block">🎉</span>
            <h3 className="font-extrabold text-xl text-white">
              {language === 'en' ? 'No incorrect questions recorded!' : '오답 기록이 없습니다!'}
            </h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              {language === 'en'
                ? 'Incorrect questions will be collected here automatically for smart review.'
                : '틀린 문제들이 여기에 자동으로 모여 복습할 수 있게 정리됩니다.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incorrectList.map((q, i) => {
              const tagInfo = q.grammarCategory
                ? getGrammarTagInfo(q.grammarCategory)
                : inferGrammarCategory({
                    form: q.form,
                    sentence: q.sentence,
                    answer: q.correctAnswer,
                    grammarTag: q.grammarTag
                  });

              return (
                <div
                  key={q.id || i}
                  className="glass-card rounded-[2rem] p-5 sm:p-7 border border-slate-700/80 shadow-md hover:border-slate-600 transition-all"
                >
                  {/* Sentence & Date */}
                  <div className="flex justify-between items-start mb-4 gap-4 border-b border-slate-700/60 pb-3.5">
                    <p className="font-bold text-base sm:text-lg text-white leading-relaxed font-serif">
                      {(() => {
                        const BLANK_REGEX = /(?:_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)|<\s*blank\s*>|\[\s*빈칸\s*\]|\(\s*빈칸\s*\)|\[\s*_{1,}\s*\]|\(\s*_{1,}\s*\)|\bblank\b|\bBlank\b|\bBLANK\b)/gi;
                        const parts = q.sentence.split(BLANK_REGEX);
                        if (parts.length <= 1) {
                          return <span>{q.sentence} <span className="text-emerald-400 font-black">({q.correctAnswer})</span></span>;
                        }
                        return (
                          <span>
                            {parts.map((part, idx) => (
                              <React.Fragment key={idx}>
                                {part}
                                {idx < parts.length - 1 && (
                                  <span className="inline-block mx-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black font-sans text-sm sm:text-base shadow-sm">
                                    {q.correctAnswer}
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </span>
                        );
                      })()}
                    </p>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 whitespace-nowrap">
                      {q.date || (language === 'en' ? 'Record' : '기록')}
                    </span>
                  </div>

                  {/* Wrong Answer vs Correct Answer comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                      <span className="block text-[10px] font-black text-rose-400 uppercase tracking-wider mb-1">
                        {language === 'en' ? 'My Selected Choice' : '내가 고른 오답'}
                      </span>
                      <span className="text-slate-400 line-through font-bold text-base">
                        {q.wrongAnswer}
                      </span>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                      <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-1">
                        {language === 'en' ? 'Correct Answer' : '올바른 정답'}
                      </span>
                      <span className="font-black text-emerald-300 text-lg">
                        {q.correctAnswer}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* 🏷️ 실전 문법 핵심 태그 (1순위 강조) */}
                    <span className={`text-xs font-black px-3 py-1 rounded-lg border flex items-center gap-1.5 ${tagInfo.bgColor} ${tagInfo.textColor} ${tagInfo.borderColor}`}>
                      <span>{tagInfo.icon}</span>
                      <span>{language === 'en' ? tagInfo.nameEn : tagInfo.nameKo}</span>
                    </span>

                    {/* 문장 형식 배지 */}
                    <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-lg border border-slate-700">
                      {language === 'en' ? `Form ${q.form}` : `${q.form}형식`}
                    </span>

                    <span className="bg-slate-800/80 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-700/60">
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
