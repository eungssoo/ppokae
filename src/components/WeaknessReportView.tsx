import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, ArrowRight, Pill, Sparkles, BookOpen, CheckCircle2, ShieldAlert, Play, Zap, X, Award, ChevronRight } from 'lucide-react';
import { DifficultyLevel, WeaknessAnalysis } from '../types';
import { getDifficultyLevels } from './DifficultySelectView';
import { useLanguage } from '../services/i18n';
import { PRACTICAL_GRAMMAR_CATEGORIES, getGrammarTagInfo } from '../services/grammarTagService';
import { sound } from '../services/soundService';

interface WeaknessReportViewProps {
  weaknessData: WeaknessAnalysis;
  onBack: () => void;
  onGeneratePrescription: (level: DifficultyLevel) => void;
  onStartThemePractice?: (topicId: string, levelNumber: number) => void;
  isLoading: boolean;
}

export const WeaknessReportView: React.FC<WeaknessReportViewProps> = ({
  weaknessData,
  onBack,
  onGeneratePrescription,
  onStartThemePractice,
  isLoading,
}) => {
  const { language, t } = useLanguage();
  const levels = getDifficultyLevels(language);
  const hasWeakness = weaknessData && weaknessData.total > 0;

  // 선택된 문법 테마의 난이도 선택 팝업 상태
  const [selectedTopicForLevel, setSelectedTopicForLevel] = useState<string | null>(null);

  // 실전 문법 카테고리별 오답 수 내림차순 정렬
  const catEntries = Object.entries(weaknessData.categories || {}).sort((a, b) => b[1] - a[1]);
  const topWeakCatId = catEntries.length > 0 ? catEntries[0][0] : 'subject_verb_agreement';
  const topWeakCatInfo = getGrammarTagInfo(topWeakCatId);
  const topWeakMistakes = catEntries.length > 0 ? catEntries[0][1] : 0;

  const activeTopicInfo = selectedTopicForLevel ? getGrammarTagInfo(selectedTopicForLevel) : null;

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-10 relative border border-slate-200 dark:border-slate-800 shadow-2xl text-left">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={isLoading}
          className="mb-6 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-all flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('home')}</span>
        </button>

        {/* Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>{language === 'en' ? 'Grammar Topic Weakness & Practice' : '취약점 분석 & 테마별 실전 풀이'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {language === 'en' ? 'Grammar Weakness Analysis' : '실전 취약점 정밀 분석 & 테마 훈련'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
            {language === 'en'
              ? 'Select any grammar topic to choose your difficulty level (Level 1~4) and practice 10 focused questions.'
              : '원하는 문법 주제를 먼저 선택하고, 그 안에서 난이도(1~4단계)를 골라 10문제를 집중 훈련할 수 있습니다.'}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Stats Summary Cards (when user has recorded errors) */}
          {hasWeakness ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-5 rounded-2xl text-center shadow-sm">
                <p className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
                  {language === 'en' ? 'Total Cumulative Mistakes' : '누적 오답 수'}
                </p>
                <p className="text-3xl sm:text-4xl font-black text-rose-800 dark:text-rose-200">
                  {weaknessData.total}
                  <span className="text-sm text-rose-600 dark:text-rose-400 ml-1">{language === 'en' ? 'Qs' : '개'}</span>
                </p>
              </div>

              {/* 🏷️ 1순위: 가장 취약한 실전 문법 주제 */}
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 p-5 rounded-2xl text-center flex flex-col justify-between shadow-sm">
                <div>
                  <p className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                    <span>{topWeakCatInfo.icon}</span>
                    <span>{language === 'en' ? '1st Priority Weak Topic' : '1순위 집중 보완 테마'}</span>
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-indigo-100 mt-0.5">
                    {language === 'en' ? topWeakCatInfo.nameEn : topWeakCatInfo.nameKo}
                  </p>
                  <span className="inline-block text-[11px] text-rose-700 dark:text-rose-300 font-black mt-1 bg-rose-100 dark:bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-500/30">
                    {language === 'en' ? `${topWeakMistakes} mistakes recorded` : `오답 ${topWeakMistakes}건 발생`}
                  </span>
                </div>

                {onStartThemePractice && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedTopicForLevel(topWeakCatId);
                    }}
                    className="mt-3 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{language === 'en' ? 'Practice Weakest Topic Now' : '1순위 취약 테마 난이도 선택 ➔'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                💡 {language === 'en' ? 'Select any grammar topic below to choose your difficulty and start a 10-question practice set!' : '아래 10대 문법 테마 중 하나를 선택하면 원하는 난이도(1~4단계)를 골라 10문제를 풀 수 있습니다!'}
              </p>
            </div>
          )}

          {/* 10 Practical Grammar Topics Interactive Practice Hub */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === 'en' ? '10 Grammar Themes (Tap to Select Level & Practice)' : '10대 문법 테마 (선택 후 난이도별 풀기)'}
                </h4>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-black">
                {language === 'en' ? 'Level 1~4 Available' : '1~4단계 선택 가능'}
              </span>
            </div>

            <div className="space-y-3">
              {PRACTICAL_GRAMMAR_CATEGORIES.map((cat) => {
                const count = (weaknessData?.categories && weaknessData.categories[cat.id]) || 0;
                const percentage = (weaknessData?.total && weaknessData.total > 0) ? (count / weaknessData.total) * 100 : 0;
                
                // Status badge
                let statusBadge = (
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{language === 'en' ? 'Good' : '안정'}</span>
                  </span>
                );
                if (percentage >= 25) {
                  statusBadge = (
                    <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-500/40 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-600" />
                      <span>{language === 'en' ? 'Critical' : '🚨 취약'}</span>
                    </span>
                  );
                } else if (percentage > 0) {
                  statusBadge = (
                    <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/40 flex items-center gap-1">
                      <span>⚠️ 주의</span>
                    </span>
                  );
                }

                return (
                  <div 
                    key={cat.id} 
                    onClick={() => {
                      sound.playClick();
                      setSelectedTopicForLevel(cat.id);
                    }}
                    className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 hover:border-indigo-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-sm cursor-pointer active:scale-[0.99]"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors">
                          {language === 'en' ? cat.nameEn : cat.nameKo}
                        </span>
                        {statusBadge}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {language === 'en' ? cat.descEn : cat.descKo}
                      </p>

                      {/* Small progress bar if user has errors */}
                      {hasWeakness && (
                        <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-300 dark:border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentage >= 25 
                                ? 'bg-rose-500' 
                                : percentage > 0 
                                  ? 'bg-indigo-500' 
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(percentage, 3)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-slate-800 group-hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 group-hover:text-white font-black text-xs shadow-sm border border-indigo-200 dark:border-slate-700 group-hover:border-indigo-500 flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0">
                      <Play className="w-3 h-3 fill-current" />
                      <span>{language === 'en' ? 'Select Level ➔' : '난이도 선택 ➔'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prescription Generator Card */}
          <div className="bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-500/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {language === 'en' ? '1:1 Custom Topic Targeted Prescription' : '1:1 맞춤형 약점 테마 집중 처방'}
              </h3>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
              {language === 'en' ? (
                <>
                  Synthesizes 40 intensive practice questions focusing 70%+ on your weakest topic <strong className="text-indigo-700 dark:text-indigo-300">[{topWeakCatInfo.nameEn}]</strong> into your <strong>Personal Weakness DB</strong>.
                </>
              ) : (
                <>
                  가장 취약한 <strong className="text-indigo-700 dark:text-indigo-300">[{topWeakCatInfo.nameKo}]</strong> 출제 포인트를 70% 이상 집중 반영한 특별 훈련 문제 40개를 생성하여 <strong>나만의 개인 맞춤 DB</strong>에 저장합니다.
                </>
              )}
            </p>

            <div className="flex flex-col gap-3 pt-1">
              {levels.map((diff) => (
                <button
                  key={diff.level}
                  onClick={() => onGeneratePrescription(diff)}
                  disabled={isLoading}
                  className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-500/50 text-left transition-all flex justify-between items-center active:scale-[0.99] shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-indigo-100">
                        {diff.label}
                      </h4>
                      <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-300 dark:border-indigo-500/30">
                        {language === 'en' ? 'Personal DB' : '개인 맞춤 DB'}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-xs mt-1">
                      {diff.desc}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 group-hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 🎯 문법 테마별 난이도(1~4단계) 선택 인터랙티브 팝업 모달 */}
      {selectedTopicForLevel && activeTopicInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative text-left animate-scale-up">
            
            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedTopicForLevel(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Selected Topic Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                <span>{activeTopicInfo.icon}</span>
                <span>{activeTopicInfo.badgeKo}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'en' ? activeTopicInfo.nameEn : activeTopicInfo.nameKo}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                {language === 'en' ? activeTopicInfo.descEn : activeTopicInfo.descKo}
              </p>
            </div>

            <div className="text-xs font-black text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>{language === 'en' ? 'Select Difficulty Level for this Topic' : '도전할 난이도 (1~4단계) 선택'}</span>
            </div>

            {/* 4 Difficulty Level Buttons */}
            <div className="flex flex-col gap-2.5">
              {levels.map((lvl) => {
                return (
                  <button
                    key={lvl.level}
                    onClick={() => {
                      sound.playClick();
                      const topicId = selectedTopicForLevel;
                      setSelectedTopicForLevel(null);
                      if (onStartThemePractice) {
                        onStartThemePractice(topicId, lvl.level);
                      }
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 flex items-center justify-between text-left transition-all group active:scale-[0.99] shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 group-hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 group-hover:text-white font-black text-sm flex items-center justify-center transition-colors">
                        {lvl.level}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                            {lvl.label}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {language === 'en' ? `Level ${lvl.level}` : `${lvl.level}단계`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {lvl.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

