import React from 'react';
import { ArrowLeft, ArrowRight, Zap, Sparkles, Target, PenTool, Clock, Coins, BookOpen, ShieldAlert, Award } from 'lucide-react';
import { DifficultyLevel, ViewType } from '../types';
import { sound } from '../services/soundService';
import { getLevelGatingInfo } from '../services/dbService';
import { useLanguage } from '../services/i18n';

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 1, label: 'Level 1 (기초 탄탄)', desc: '중학 기초 ~ 고1 기본 (기본 시제, 단/복수 수일치, 조동사, 기초 품사 / 일상 어휘)' },
  { level: 2, label: 'Level 2 (수능 기본 & 토익 중급)', desc: '고교 수능 & 토익 650~750 (관계사, 수동태, to-V/동명사, 접속사 vs 전치사 / 수능 어휘)' },
  { level: 3, label: 'Level 3 (수능 1등급 & 토익 고득점)', desc: '수능 킬러 & 토익 800~900 (분사구문, 가정법, 부정어 도치, that vs what / 고급 비즈니스 어휘)' },
  { level: 4, label: 'Level 4 (토익 990 & 명문대 편입)', desc: '토익 만점 & 편입/공무원 킬러 (If생략 도치, 자/타동사 함정, 전치사 to, 혼동 파생어 / 편입·GRE 어휘)' },
];

export const getDifficultyLevels = (language: 'ko' | 'en'): DifficultyLevel[] => {
  if (language === 'en') {
    return [
      { level: 1, label: 'Level 1 (Core Basics)', desc: 'Middle school to Grade 10: Tenses, subject-verb agreement & modals' },
      { level: 2, label: 'Level 2 (Intermediate)', desc: 'CSAT Basic & TOEIC 700: Relative clauses, passives, verbals & connectors' },
      { level: 3, label: 'Level 3 (Advanced)', desc: 'CSAT Tier 1 & TOEIC 850+: Participles, conditionals, inversion & business vocabulary' },
      { level: 4, label: 'Level 4 (Mastery 990 & Transfer)', desc: 'TOEIC 990 & University Transfer: Inverted subjunctives, transitive traps & GRE vocabulary' },
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
          subtitle: language === 'en' ? 'Solve 10 questions balanced across key grammar points.' : '공용 DB에서 선택한 난이도의 실전 핵심 문법 10문제를 풉니다.',
          icon: <PenTool className="w-6 h-6 text-emerald-400" />,
          badge: language === 'en' ? 'Differential Coin Rewards (Up to +7)' : '난이도별 코인 차등 지급 (최대 +7 코인)',
        };
    }
  };

  const header = getHeaderInfo();

  const getCountForLevel = (level: number): number => {
    const direct = questionCounts[`Level ${level}`];
    if (typeof direct === 'number') return direct;
    for (const [k, v] of Object.entries(questionCounts)) {
      if (k.includes(`Level ${level}`) || k.includes(`${level}단계`)) {
        return v;
      }
    }
    return 40;
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
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-all flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>

          {view === 'generate' && cooldownSeconds > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 px-3 py-1.5 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{language === 'en' ? `Cooldown: ${Math.floor(cooldownSeconds / 60)}m ${cooldownSeconds % 60}s` : `생성 쿨타임: ${Math.floor(cooldownSeconds / 60)}분 ${cooldownSeconds % 60}초`}</span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{header.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            {header.icon}
            <span>{header.title}</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium mt-2">
            {header.subtitle}
          </p>
        </div>

        {/* 💡 난이도 & 랭크 승급 한도 친절 가이드 배너 */}
        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 text-left shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-amber-700 dark:text-amber-300 font-black text-xs sm:text-sm">
            <Award className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{language === 'en' ? '💡 Tier Promotion Caps & Level Guide' : '💡 난이도별 승급 한도 & 레벨 해금 규칙'}</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
            {language === 'en' ? (
              <>
                Challenging higher difficulty levels unlocks higher rank ceilings: <strong className="text-slate-900 dark:text-slate-200">Level 1 (Silver Cap)</strong> ➔ <strong className="text-amber-600 dark:text-yellow-300">Level 2 (Gold Cap)</strong> ➔ <strong className="text-cyan-600 dark:text-cyan-300">Level 3 (Diamond Cap)</strong> ➔ <strong className="text-pink-600 dark:text-pink-300">Level 4 (👑 Master Tier Cap)</strong>!
              </>
            ) : (
              <>
                쉬운 문제만 반복해서 풀면 승급 한도가 제한됩니다. <strong className="text-slate-900 dark:text-slate-200">1단계(실버까지)</strong> ➔ <strong className="text-amber-600 dark:text-yellow-300">2단계(골드까지)</strong> ➔ <strong className="text-cyan-600 dark:text-cyan-300">3단계(다이아까지)</strong> ➔ <strong className="text-pink-600 dark:text-pink-300">4단계(👑 마스터 최종 승급)</strong> 등 상위 난이도에 도전하여 최고의 랭크에 도달해 보세요!
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
                className="group p-5 bg-white dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-500/10 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/50 rounded-2xl transition-all shadow-sm hover:shadow-md text-left flex items-center justify-between active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex-1 pr-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-500/30">
                      {levelInfo.level}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                      {levelInfo.label}
                    </h3>
                    
                    {/* 코인 & 경험치 보상 */}
                    <span className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-500" />
                      <span>{language === 'en' ? `+${gating.coinsReward} Coins (+${gating.xpReward} XP)` : `정답 시 +${gating.coinsReward} 코인 (+${gating.xpReward} XP)`}</span>
                    </span>

                    {/* 승급 한도 뱃지 */}
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${gating.badgeBg} ${gating.badgeText} ${gating.badgeBorder}`}>
                      📈 {gating.tierCap}
                    </span>

                    <span className="bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-500" />
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
