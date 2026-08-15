import React from 'react';
import { ArrowLeft, ArrowRight, Zap, Sparkles, Target, PenTool, Clock, Coins, BookOpen } from 'lucide-react';
import { DifficultyLevel, ViewType } from '../types';
import { sound } from '../services/soundService';

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: 1, label: 'Level 1 (입문/초급)', desc: '기본적인 어휘와 단순한 문장 구조 (중2~중3 수준)' },
  { level: 2, label: 'Level 2 (실력 중급)', desc: '다양한 어휘와 약간 복잡한 문장 (고1~고2 수준)' },
  { level: 3, label: 'Level 3 (고득점 도약)', desc: '추상적 어휘와 복합 문장 (고3~수능 수준)' },
  { level: 4, label: 'Level 4 (실전 마스터)', desc: '학술적/전문적 어휘와 고난도 문장 (토익/편입 수준)' },
];

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
  const getHeaderInfo = () => {
    switch (view) {
      case 'generate':
        return {
          title: '문제 공장 (AI 문법 문제 대량 생성)',
          subtitle: 'Gemini AI가 난이도별 40문제를 공용 DB에 즉시 생성합니다.',
          icon: <Zap className="w-6 h-6 text-indigo-400" />,
          badge: '공용 문제 생성 (🪙 50 소모)',
        };
      case 'solve_personal_select':
        return {
          title: '내 약점 퀴즈 풀기',
          subtitle: '나만을 위한 개인 DB에 조제된 약점 문제를 풉니다.',
          icon: <Target className="w-6 h-6 text-purple-400" />,
          badge: '개인 맞춤 처방 퀴즈',
        };
      case 'solve_select':
      default:
        return {
          title: '일반 퀴즈 풀기',
          subtitle: '공용 DB에서 선택한 난이도의 10문제를 무작위로 추출하여 풉니다.',
          icon: <PenTool className="w-6 h-6 text-emerald-400" />,
          badge: '정답 시 문제당 +5 코인 적립',
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
            className="text-slate-400 hover:text-white font-bold transition-all flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-xl shadow-sm border border-slate-700 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>메인으로</span>
          </button>

          {view === 'generate' && cooldownSeconds > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>생성 쿨타임: {Math.floor(cooldownSeconds / 60)}분 {cooldownSeconds % 60}초</span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
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

        {/* Level List */}
        <div className="flex flex-col gap-3.5">
          {DIFFICULTY_LEVELS.map((levelInfo) => {
            const count = getCountForLevel(levelInfo.level);

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
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-500/30">
                      {levelInfo.level}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {levelInfo.label}
                    </h3>
                    <span className="bg-slate-700/80 text-slate-300 border border-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-400" />
                      <span>{count}문제 준비됨</span>
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium">
                    {levelInfo.desc}
                  </p>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
