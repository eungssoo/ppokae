import React from 'react';
import { ArrowLeft, ArrowRight, Zap, Sparkles, Target, PenTool, Clock, Coins, BookOpen, ShieldAlert, Award } from 'lucide-react';
import { DifficultyLevel, ViewType } from '../types';
import { sound } from '../services/soundService';
import { getLevelGatingInfo } from '../services/dbService';
import { useLanguage } from '../services/i18n';

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 1, label: 'Level 1 (입문/초급)', desc: '기본적인 어휘와 단순한 문장 구조 (중2~중3 수준)' },
  { level: 2, label: 'Level 2 (실력 중급)', desc: '다양한 어휘와 약간 복잡한 문장 (고1~고2 수준)' },
  { level: 3, label: 'Level 3 (고득점 도약)', desc: '추상적 어휘와 복합 문장 (고3~수능 수준)' },
  { level: 4, label: 'Level 4 (실전 마스터)', desc: '학술적/전문적 어휘와 고난도 문장 (토익/편입 수준)' },
];

export const getDifficultyLevels = (language: 'ko' | 'en'): DifficultyLevel[] => {
  if (language === 'en') {
    return [
      { level: 1, label: 'Level 1 (Beginner)', desc: 'Fundamental vocabulary & essential simple structures' },
      { level: 2, label: 'Level 2 (Intermediate)', desc: 'Rich vocabulary & compound sentence structures' },
      { level: 3, label: 'Level 3 (Advanced)', desc: 'Complex structures, participles & subjunctive mood' },
      { level: 4, label: 'Level 4 (Mastery)', desc: 'Academic/business grammar, parallel structures & inversion' },
    ];
  }
  return DIFFICULTY_LEVELS;
};

interface DifficultySelectViewProps {
  view: ViewType;
  questionCounts?: Record<string, number>;
  cooldownSeconds?: number;
  onBack: () => void;
  onSelectLevel: (levelInfo: DifficultyLevel) => void;
  isLoading: boolean;
}

export const DifficultySelectView: React.FC<DifficultySelectViewProps> = ({
  view,
  questionCounts = {},
  cooldownSeconds = 0,
  onBack,
  onSelectLevel,
  isLoading,
}) => {
  const { language, t } = useLanguage();
  const levels = getDifficultyLevels(language);

  const getHeaderInfo = () => {
    switch (view) {
      case 'generate':
        return {
          title: language === 'en' ? 'AI Question Factory (Batch Generation)' : '문제 공장 (AI 문법 문제 대량 생성)',
          subtitle: language === 'en' ? 'Gemini AI generates 40 questions to the public database.' : 'Gemini AI가 난이도별 40문제를 공용 DB에 즉시 생성합니다.',
          icon: <Zap className="w-6 h-6 text-indigo-400" />,
          badge: language === 'en' ? 'Generate Public Questions (🪙 50)' : '공용 문제 생성 (🪙 50 소모)',
        };
      case 'solve_personal_select':
        return {
          title: language === 'en' ? 'Weakness Target Quiz' : '내 약점 퀴즈 풀기',
          subtitle: language === 'en' ? 'Solve personalized questions formulated for your weak areas.' : '나만을 위한 개인 DB에 조제된 약점 문제를 풉니다.',
          icon: <Target className="w-6 h-6 text-purple-400" />,
          badge: language === 'en' ? 'Personalized Prescription Quiz' : '개인 맞춤 처방 퀴즈',
        };
      case 'solve_select':
      default:
        return {
          title: language === 'en' ? 'Standard Grammar Quiz' : '일반 퀴즈 풀기',
          subtitle: language === 'en' ? 'Solve 10 questions evenly distributed across Forms 1 to 5.' : '공용 DB에서 선택한 난이도의 10문제를 1~5형식 골고루 추출하여 풉니다.',
          icon: <PenTool className="w-6 h-6 text-emerald-400" />,
          badge: language === 'en' ? 'Differential Coin Rewards (Up to +7)' : '난이도별 코인 차등 지급 (최대 +7 코인)',
        };
    }
  };

  const header = getHeaderInfo();

  const getCountForLevel = (level: number): number => {
    const key = `Level ${level}`;
    return questionCounts[key] ?? 15;
  };

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full glass-card rounded-[2.5rem] p-6 sm:p-10 relative border border-slate-700/60 shadow-2xl">
        
        {/* Back Button & Cooldown Timer */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="text-slate-400 hover:text-white font-bold transition-all flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-xl shadow-sm border border-slate-700 text-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>

          {view === 'generate' && cooldownSeconds > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{language === 'en' ? `Cooldown: ${Math.floor(cooldownSeconds / 60)}m ${cooldownSeconds % 60}s` : `생성 쿨타임: ${Math.floor(cooldownSeconds / 60)}분 ${cooldownSeconds % 60}초`}</span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{header.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            {header.icon}
            <span>{header.title}</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-2">
            {header.subtitle}
          </p>
        </div>

        {/* 💡 난이도 & 랭크 승급 한도 친절 가이드 배너 */}
        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 text-left shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-amber-300 font-black text-xs sm:text-sm">
            <Award className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{language === 'en' ? '💡 Tier Promotion Caps & Level Guide' : '💡 난이도별 승급 한도 & 레벨 해금 규칙'}</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            {language === 'en' ? (
              <>
                Challenging higher difficulty levels unlocks higher rank ceilings: <strong className="text-slate-200">Level 1 (Silver Cap)</strong> ➔ <strong className="text-yellow-300">Level 2 (Gold Cap)</strong> ➔ <strong className="text-cyan-300">Level 3 (Diamond Cap)</strong> ➔ <strong className="text-pink-300">Level 4 (👑 Master Tier Cap)</strong>!
              </>
            ) : (
              <>
                쉬운 문제만 반복해서 풀면 승급 한도가 제한됩니다. <strong className="text-slate-200">1단계(실버까지)</strong> ➔ <strong className="text-yellow-300">2단계(골드까지)</strong> ➔ <strong className="text-cyan-300">3단계(다이아까지)</strong> ➔ <strong className="text-pink-300">4단계(👑 마스터 최종 승급)</strong> 등 상위 난이도에 도전하여 최고의 랭크에 도달해 보세요!
              </>
            )}
          </p>
        </div>

        {/* Level List */}
        <div className="flex flex-col gap-3.5">
          {levels.map((levelInfo) => {
            const count = getCountForLevel(levelInfo.level);
            const gating = getLevelGatingInfo(levelInfo.level);

            return (
              <button
                key={levelInfo.level}
                onClick={() => {
                  sound.playClick();
                  onSelectLevel(levelInfo);
                }}
                disabled={isLoading}
                className="group p-5 bg-slate-800/60 hover:bg-indigo-500/10 border border-slate-700/80 hover:border-indigo-500/50 rounded-2xl transition-all shadow-sm hover:shadow-md text-left flex items-center justify-between active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex-1 pr-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-500/30">
                      {levelInfo.level}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {levelInfo.label}
                    </h3>
                    
                    {/* 코인 & 경험치 보상 */}
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>{language === 'en' ? `+${gating.coinsReward} Coins (+${gating.xpReward} XP)` : `정답 시 +${gating.coinsReward} 코인 (+${gating.xpReward} XP)`}</span>
                    </span>

                    {/* 승급 한도 뱃지 */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${gating.badgeBg} ${gating.badgeText} ${gating.badgeBorder}`}>
                      📈 {gating.tierCap}
                    </span>

                    <span className="bg-slate-700/80 text-slate-300 border border-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                      <span>{count} {language === 'en' ? 'Questions' : '문제 준비됨'}</span>
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm font-medium mb-1">
                    {levelInfo.desc}
                  </p>

                  {/* 승급 친절 가이드 */}
                  <div className="text-[11px] text-indigo-300/90 font-medium flex items-center gap-1.5 mt-1">
                    <span className="text-amber-300">🎯</span>
                    <span>{gating.tierCapNotice}</span>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
