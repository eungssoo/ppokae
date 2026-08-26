import React from 'react';
import { ArrowLeft, AlertTriangle, ArrowRight, Pill, Sparkles, BookOpen, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DifficultyLevel, WeaknessAnalysis } from '../types';
import { getDifficultyLevels } from './DifficultySelectView';
import { useLanguage } from '../services/i18n';
import { PRACTICAL_GRAMMAR_CATEGORIES, getGrammarTagInfo } from '../services/grammarTagService';

interface WeaknessReportViewProps {
  weaknessData: WeaknessAnalysis;
  onBack: () => void;
  onGeneratePrescription: (level: DifficultyLevel) => void;
  isLoading: boolean;
}

export const WeaknessReportView: React.FC<WeaknessReportViewProps> = ({
  weaknessData,
  onBack,
  onGeneratePrescription,
  isLoading,
}) => {
  const { language, t } = useLanguage();
  const levels = getDifficultyLevels(language);
  const hasWeakness = weaknessData && weaknessData.total > 0;

  // 실전 문법 카테고리별 오답 수 내림차순 정렬
  const catEntries = Object.entries(weaknessData.categories || {}).sort((a, b) => b[1] - a[1]);
  const topWeakCatId = catEntries.length > 0 ? catEntries[0][0] : 'subject_verb_agreement';
  const topWeakCatInfo = getGrammarTagInfo(topWeakCatId);
  const topWeakMistakes = catEntries.length > 0 ? catEntries[0][1] : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-2xl w-full bg-slate-900/90 rounded-3xl p-6 sm:p-10 relative border border-slate-800 shadow-2xl text-left">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={isLoading}
          className="mb-6 text-slate-400 hover:text-white font-bold transition-all flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-xl shadow-sm border border-slate-700 text-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('home')}</span>
        </button>

        {/* Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === 'en' ? 'AI Topic Precision Diagnosis' : 'AI 문법 주제별 정밀 진단'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            {language === 'en' ? 'Grammar Topic Weakness Report' : '실전 문법 주제별 약점 분석 리포트'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
            {language === 'en'
              ? 'Analyzes your vulnerable exam grammar topics (agreement, tense, verbals, clauses) based on your real quiz mistakes.'
              : '오답 데이터를 정밀 분석하여 10대 핵심 문법 주제별 취약점을 진단하고 맞춤 훈련을 제공합니다.'}
          </p>
        </div>

        {/* Content */}
        {!hasWeakness ? (
          <div className="text-center p-10 sm:p-12 bg-slate-950/60 rounded-3xl border border-dashed border-slate-800">
            <span className="text-5xl mb-3 block">🎉</span>
            <h3 className="text-xl text-white font-black">
              {language === 'en' ? 'No incorrect questions recorded!' : '아직 기록된 오답이 없습니다!'}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-medium leading-relaxed">
              {language === 'en'
                ? 'Solve quizzes and when mistakes occur, AI will analyze your vulnerable grammar topics and generate 1:1 tailored practice questions.'
                : '퀴즈를 풀고 오답이 발생하면, AI가 가장 취약한 실전 문법 주제(수일치, 시제, 준동사 등)를 자동 분석하여 1:1 집중 처방 문제를 조제해 드립니다.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl text-center">
                <p className="text-xs font-black text-rose-400 uppercase tracking-wider mb-1">
                  {language === 'en' ? 'Total Cumulative Mistakes' : '누적 오답 수'}
                </p>
                <p className="text-3xl sm:text-4xl font-black text-rose-200">
                  {weaknessData.total}
                  <span className="text-sm text-rose-400 ml-1">{language === 'en' ? 'Qs' : '개'}</span>
                </p>
              </div>

              {/* 🏷️ 1순위: 가장 취약한 실전 문법 주제 */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-5 rounded-2xl text-center">
                <p className="text-xs font-black text-indigo-300 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                  <span>{topWeakCatInfo.icon}</span>
                  <span>{language === 'en' ? '1st Priority Weak Topic' : '1순위 집중 보완 문법'}</span>
                </p>
                <p className="text-xl sm:text-2xl font-black text-indigo-100 mt-1">
                  {language === 'en' ? topWeakCatInfo.nameEn : topWeakCatInfo.nameKo}
                </p>
                <span className="inline-block text-[11px] text-rose-300 font-bold mt-1 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  {language === 'en' ? `${topWeakMistakes} mistakes recorded` : `오답 ${topWeakMistakes}건 집중 발생`}
                </span>
              </div>
            </div>

            {/* 10 Practical Grammar Topics Breakdown */}
            <div className="bg-slate-950/80 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    {language === 'en' ? '10 Grammar Topics Mistake Distribution' : '10대 실전 문법 주제별 오답 분포'}
                  </h4>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'en' ? 'Share of Total Mistakes' : '오답 비중(%)'}
                </span>
              </div>

              <div className="space-y-3">
                {PRACTICAL_GRAMMAR_CATEGORIES.map((cat) => {
                  const count = (weaknessData.categories && weaknessData.categories[cat.id]) || 0;
                  const percentage = weaknessData.total > 0 ? (count / weaknessData.total) * 100 : 0;
                  
                  // Status badge based on mistake frequency
                  let statusBadge = (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{language === 'en' ? 'Good' : '안정'}</span>
                    </span>
                  );
                  if (percentage >= 25) {
                    statusBadge = (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>{language === 'en' ? 'Critical' : '🚨 취약'}</span>
                      </span>
                    );
                  } else if (percentage > 0) {
                    statusBadge = (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                        <span>⚠️ 주의</span>
                      </span>
                    );
                  }

                  return (
                    <div key={cat.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cat.icon}</span>
                          <span className="text-xs font-bold text-slate-200">
                            {language === 'en' ? cat.nameEn : cat.nameKo}
                          </span>
                          {statusBadge}
                        </div>
                        <span className="text-xs font-black text-indigo-300 font-mono">
                          {count}{language === 'en' ? ' Qs' : '개'} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage >= 25 
                              ? 'bg-gradient-to-r from-rose-500 to-red-500' 
                              : percentage > 0 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                                : 'bg-emerald-500/50'
                          }`}
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prescription Generator Card */}
            <div className="bg-slate-900/90 p-6 rounded-3xl border border-indigo-500/30 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-lg text-white">
                  {language === 'en' ? '1:1 Custom Topic Targeted Prescription' : '1:1 맞춤형 약점 주제 집중 처방'}
                </h3>
              </div>
              
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                {language === 'en' ? (
                  <>
                    Synthesizes 40 intensive practice questions focusing 70%+ on your weakest topic <strong className="text-indigo-300">[{topWeakCatInfo.nameEn}]</strong> into your <strong>Personal Weakness DB</strong>.
                  </>
                ) : (
                  <>
                    가장 취약한 <strong className="text-indigo-300">[{topWeakCatInfo.nameKo}]</strong> 출제 포인트를 70% 이상 집중 반영한 특별 훈련 문제 40개를 생성하여 <strong>나만의 개인 약점 DB</strong>에 저장합니다.
                  </>
                )}
              </p>

              <div className="flex flex-col gap-3 pt-1">
                {levels.map((diff) => (
                  <button
                    key={diff.level}
                    onClick={() => onGeneratePrescription(diff)}
                    disabled={isLoading}
                    className="group p-4 rounded-2xl border border-slate-800 bg-slate-950/80 hover:bg-indigo-950/40 hover:border-indigo-500/50 text-left transition-all flex justify-between items-center active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-indigo-100">
                          {diff.label}
                        </h4>
                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-500/30">
                          {language === 'en' ? 'Personal DB' : '개인 맞춤 DB'}
                        </span>
                      </div>
                      <p className="text-slate-400 font-medium text-xs mt-1">
                        {diff.desc}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-md">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
