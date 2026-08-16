import React from 'react';
import { ArrowLeft, Trophy, Sparkles, Target, Zap, CheckCircle2, TrendingUp, Award, BarChart3, Star, Coins } from 'lucide-react';
import { UserProfile, FormMastery } from '../types';
import { calculateTier } from '../services/dbService';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';

interface AnalyticsDashboardViewProps {
  user: UserProfile;
  masteryStats: {
    formMasteries: FormMastery[];
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

  const FORM_NAMES: Record<number, { name: string; structure: string; desc: string }> = language === 'en' ? {
    1: { name: 'Form 1', structure: 'S + V', desc: 'Subject + Intransitive Verb (Adverbials)' },
    2: { name: 'Form 2', structure: 'S + V + C', desc: 'Subject + Linking Verb + Subject Complement' },
    3: { name: 'Form 3', structure: 'S + V + O', desc: 'Subject + Transitive Verb + Direct Object' },
    4: { name: 'Form 4', structure: 'S + V + IO + DO', desc: 'Subject + Dative Verb + Indirect + Direct Object' },
    5: { name: 'Form 5', structure: 'S + V + O + OC', desc: 'Subject + Transitive Verb + Object + Object Complement' }
  } : {
    1: { name: '1형식', structure: 'S + V', desc: '주어 + 완전자동사 (부사구 수식)' },
    2: { name: '2형식', structure: 'S + V + C', desc: '주어 + 불완전자동사 + 주격보어' },
    3: { name: '3형식', structure: 'S + V + O', desc: '주어 + 완전타동사 + 목적어' },
    4: { name: '4형식', structure: 'S + V + IO + DO', desc: '주어 + 수여동사 + 간접목적어 + 직접목적어' },
    5: { name: '5형식', structure: 'S + V + O + OC', desc: '주어 + 불완전타동사 + 목적어 + 목적격보어' }
  };

  // Find weakest form
  const weakestForm = [...masteryStats.formMasteries].sort((a, b) => a.accuracy - b.accuracy)[0] || { form: 5, accuracy: 0 };

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
            <span>Learning Growth & Mastery Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {language === 'en' ? 'Growth Analytics Dashboard 📊' : '성장 분석 대시보드 📊'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
            {language === 'en'
              ? 'Analyze your cumulative study stats and sentence form masteries at a glance.'
              : '내 누적 학습 데이터와 문장 형식별 마스터리를 한눈에 분석합니다.'}
          </p>
        </div>

        {/* 🏆 1. Tier & XP Hero Card */}
        <div className="bg-gradient-to-br from-indigo-900/60 via-purple-950/80 to-slate-900/90 rounded-3xl p-6 border border-purple-500/30 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg border border-yellow-300/40 flex-shrink-0">
                {tierInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-300">
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
            <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-slate-700/80">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${tierInfo.progress}%` }}
              />
            </div>
            {tierInfo.capNotice && (
              <div className="mt-3 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
                <span>🔒</span>
                <span>{tierInfo.capNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* 📈 2. Key Metrics 4-Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 text-center">
            <Target className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 font-medium block">{language === 'en' ? 'Total Solved' : '총 푼 문제'}</span>
            <span className="text-lg sm:text-xl font-black text-white">{masteryStats.totalSolved} {language === 'en' ? 'Qs' : '문제'}</span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 font-medium block">{language === 'en' ? 'Overall Accuracy' : '전체 정답률'}</span>
            <span className="text-lg sm:text-xl font-black text-emerald-300">{masteryStats.overallAccuracy}%</span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 text-center">
            <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 font-medium block">{language === 'en' ? 'Bookmarks' : '보관된 즐겨찾기'}</span>
            <span className="text-lg sm:text-xl font-black text-amber-300">{bookmarkCount} {language === 'en' ? 'Items' : '개'}</span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 text-center">
            <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400 font-medium block">{language === 'en' ? 'Coins' : '보유 코인'}</span>
            <span className="text-lg sm:text-xl font-black text-yellow-300">{user.coins ?? 200}</span>
          </div>
        </div>

        {/* 🧩 3. 1~5형식 문법 마스터리 카드 리스트 */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{language === 'en' ? 'Forms 1–5 Mastery Analysis' : '1~5형식 문형별 마스터리 분석'}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'en'
                  ? 'Mastery score increases with correct answers to advance to S-Rank (150 Correct).'
                  : '문제를 풀 때마다 누적 정답 수와 숙련도 점수가 상승하여 S랭크(150정답)로 승급합니다.'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {masteryStats.formMasteries.map((fm) => {
              const info = FORM_NAMES[fm.form];
              let gradeBg = 'bg-slate-700 text-slate-300';
              let gradeLabel = language === 'en' ? 'Novice' : '입문';
              if (fm.grade === 'S') {
                gradeBg = 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-amber-300';
                gradeLabel = language === 'en' ? 'Master 👑' : '마스터 👑';
              } else if (fm.grade === 'A') {
                gradeBg = 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black shadow-md';
                gradeLabel = language === 'en' ? 'Expert' : '전문가';
              } else if (fm.grade === 'B') {
                gradeBg = 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold shadow-md';
                gradeLabel = language === 'en' ? 'Skilled' : '숙련';
              }

              const score = fm.masteryScore ?? ((fm.correct * 10) + Math.round(fm.accuracy * 5));
              const target = fm.nextGradeTarget ?? 150;
              const remainingToTarget = Math.max(0, target - fm.correct);

              return (
                <div
                  key={fm.form}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-600 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${gradeBg}`}>
                        {fm.grade}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 mt-1">
                        {gradeLabel}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm sm:text-base">
                          {info.name}
                        </span>
                        <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {info.structure}
                        </span>
                        <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {score.toLocaleString()} PTS
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {info.desc}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-52 flex-shrink-0">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300 font-mono">
                        {language === 'en' ? `${fm.correct} Correct` : `누적 ${fm.correct}문제 정답`}
                      </span>
                      <span className="text-emerald-400 font-black">
                        {fm.accuracy}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fm.grade === 'S' 
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300' 
                            : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                        }`}
                        style={{ width: `${fm.grade === 'S' ? 100 : Math.min(100, Math.round((fm.correct / target) * 100))}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-1 text-right">
                      {fm.grade === 'S' ? (
                        <span className="text-amber-300 font-black">✨ {language === 'en' ? 'Full Mastery!' : '완전 정복 달성!'}</span>
                      ) : (
                        <span>{language === 'en' ? `${remainingToTarget} more needed for next rank` : `다음 승급까지 ${remainingToTarget}문제 정답 필요`}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 💡 4. AI 1타 강사의 맞춤 학습 처방 */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-2 text-amber-300 font-black text-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{language === 'en' ? 'Master AI Tutor Advice' : '1타 강사의 맞춤 학습 조언'}</span>
          </div>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
            {language === 'en' ? (
              <>
                Currently, concentrating on <strong className="text-amber-300">Form {weakestForm.form} (Accuracy: {weakestForm.accuracy}%)</strong> will yield the highest growth boost for {user.name}!
              </>
            ) : (
              <>
                현재 <strong>{user.name}님</strong>은{' '}
                <strong className="text-amber-300">{weakestForm.form}형식 (정답률 {weakestForm.accuracy}%)</strong>에 대한 집중 보완이 가장 큰 성장을 이끌어낼 수 있는 핵심 구간입니다!
              </>
            )}
          </p>

          <button
            onClick={() => {
              sound.playClick();
              onGoSolveWeakness();
            }}
            className="mt-4 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <span>{language === 'en' ? 'Practice Weakness Questions' : '내 약점 퀴즈 바로 풀러 가기'}</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

      </div>
    </div>
  );
};
