import React from 'react';
import { ArrowLeft, Trophy, Sparkles, Target, Zap, CheckCircle2, TrendingUp, Award, BarChart3, Star, Coins, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';
import { calculateTier } from '../services/dbService';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';
import { PRACTICAL_GRAMMAR_CATEGORIES } from '../services/grammarTagService';

interface AnalyticsDashboardViewProps {
  user: UserProfile;
  masteryStats: {
    totalSolved: number;
    totalCorrect: number;
    overallAccuracy: number;
    levelStats?: any;
  };
  bookmarkCount: number;
  onBack: () => void;
  onGoSolveWeakness: () => void;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  user,
  masteryStats,
  bookmarkCount,
  onBack,
  onGoSolveWeakness,
}) => {
  const { language, t } = useLanguage();
  const currentXp = user.xp || 0;
  const tierInfo = calculateTier(currentXp, masteryStats.levelStats);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 md:p-8 font-sans">
      <div className="max-w-3xl w-full bg-slate-900/90 rounded-3xl p-5 sm:p-8 relative border border-slate-800 shadow-2xl text-left">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3.5">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="text-slate-400 hover:text-white font-bold transition-all flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs sm:text-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1">
              <span>{user.avatar || '🤖'}</span>
              <span>{user.name}{language === 'en' ? "'s Growth Report" : '님의 성장 리포트'}</span>
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Grammar Topics Mastery & Growth</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {language === 'en' ? 'Growth Analytics Dashboard 📊' : '문법 주제별 성장 분석 대시보드 📊'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
            {language === 'en'
              ? 'Analyze your cumulative study stats and 10 practical grammar topic mastery at a glance.'
              : '내 누적 학습 데이터와 실전 10대 핵심 문법 주제별 마스터리를 한눈에 분석합니다.'}
          </p>
        </div>

        {/* 🏆 1. Tier & XP Hero Card */}
        <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900/90 rounded-3xl p-6 border border-indigo-500/30 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg border border-yellow-300/40 flex-shrink-0">
                {tierInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                    Current Tier
                  </span>
                  <span className={`bg-gradient-to-r ${tierInfo.badgeColor} text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm`}>
                    {tierInfo.tier}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentXp.toLocaleString()} <span className="text-sm font-bold text-slate-400">XP</span>
                </h3>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 font-medium block">
                {language === 'en' ? 'To Next Tier' : '다음 등급까지'}
              </span>
              <span className="text-xs sm:text-sm font-black text-indigo-300">
                {Math.max(0, tierInfo.maxXp - currentXp).toLocaleString()} XP {language === 'en' ? 'remaining' : '남음'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
              <span>{tierInfo.minXp} XP</span>
              <span className="text-indigo-300 font-black">{tierInfo.progress}% {language === 'en' ? 'Achieved' : '달성'}</span>
              <span>{tierInfo.maxXp} XP</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/80">
              <div
                className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${tierInfo.progress}%` }}
              />
            </div>
            {tierInfo.capNotice && (
              <div className="mt-3 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2 shadow-sm">
                <span>🔒</span>
                <span>{tierInfo.capNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* 📈 2. Key Metrics 4-Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <Target className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 font-medium block">{language === 'en' ? 'Total Solved' : '총 푼 문제'}</span>
            <span className="text-lg sm:text-xl font-black text-white">{masteryStats.totalSolved} {language === 'en' ? 'Qs' : '문제'}</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 font-medium block">{language === 'en' ? 'Overall Accuracy' : '전체 정답률'}</span>
            <span className="text-lg sm:text-xl font-black text-emerald-300">{masteryStats.overallAccuracy}%</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 font-medium block">{language === 'en' ? 'Bookmarks' : '보관된 즐겨찾기'}</span>
            <span className="text-lg sm:text-xl font-black text-amber-300">{bookmarkCount} {language === 'en' ? 'Items' : '개'}</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 font-medium block">{language === 'en' ? 'Coins' : '보유 코인'}</span>
            <span className="text-lg sm:text-xl font-black text-yellow-300">{user.coins ?? 200}</span>
          </div>
        </div>

        {/* 🧩 3. 실전 10대 문법 주제별 마스터리 그리드 */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>{language === 'en' ? '10 Practical Grammar Topics Curriculum' : '실전 10대 문법 핵심 영역 마스터리'}</span>
            </h3>
            <span className="text-xs text-indigo-300 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/30">
              10 Topics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRACTICAL_GRAMMAR_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 p-4 rounded-2xl transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{cat.icon}</span>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">
                        {language === 'en' ? cat.nameEn : cat.nameKo}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${cat.bgColor} ${cat.textColor} ${cat.borderColor}`}>
                      {language === 'en' ? cat.badgeEn : cat.badgeKo}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium line-clamp-2 mb-3">
                    {language === 'en' ? cat.descEn : cat.descKo}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span>{language === 'en' ? 'Exam Focus' : '실전 빈출 공식'}</span>
                  <span className="text-indigo-300 font-bold">100% Focused Drill</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 💡 4. AI 1타 강사의 맞춤 학습 처방 */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2 text-indigo-300 font-black text-sm">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>{language === 'en' ? 'Master AI Tutor Advice' : 'AI 튜터의 맞춤 학습 가이드'}</span>
          </div>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
            {language === 'en' ? (
              <>
                Concentrating on your weakest grammar topics (Subject-Verb Agreement, Tenses, Inversions) will boost your TOEIC & Transfer score fastest!
              </>
            ) : (
              <>
                현재 <strong>{user.name}님</strong>의 오답 데이터를 바탕으로 가장 취약한 실전 문법 주제를 집중 보완하면 토익 900+ 및 편입 합격에 가장 빠르게 도달할 수 있습니다!
              </>
            )}
          </p>

          <button
            onClick={() => {
              sound.playClick();
              onGoSolveWeakness();
            }}
            className="mt-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <span>{language === 'en' ? 'Practice Weakness Questions' : '내 약점 퀴즈 바로 풀러 가기'}</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

      </div>
    </div>
  );
};
