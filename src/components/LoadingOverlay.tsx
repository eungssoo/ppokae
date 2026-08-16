import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface LoadingOverlayProps {
  text?: string;
  progress?: number;
}

const STAGE_MESSAGES = [
  { icon: '⚡', text: '수능 & 토익 최신 빈출 킬러 문형을 스캔하고 있습니다...' },
  { icon: '🧠', text: '1~5형식 문법 원리와 매력적인 오답 함정을 정밀 설계 중입니다...' },
  { icon: '🎯', text: '100% 한국어 맞춤 해설과 청크 패턴 뉘앙스를 검수하는 중입니다...' },
  { icon: '💎', text: '단 1개의 유일 정답과 4지선다 보기를 최적화하고 있습니다...' },
  { icon: '🚀', text: '초고속 병렬 AI 엔진이 문제 팩을 패키징 중입니다...' },
  { icon: '✨', text: '마무리 검수가 완료되었습니다! 곧 문제가 열립니다...' },
];

const GRAMMAR_TIPS = [
  {
    tag: '5형식 사역동사',
    tip: 'make, have, let 뒤에 오는 목적격 보어는 반드시 [동사원형]입니다!',
    example: 'She made him clean the room. (to clean ❌)'
  },
  {
    tag: '시제 일치 주의',
    tip: 'yesterday, ago, last night 같은 명백한 과거 단어는 현재완료(have p.p.)와 절대 함께 쓰지 못합니다!',
    example: 'I met him yesterday. (I have met him yesterday ❌)'
  },
  {
    tag: '4형식 ➔ 3형식 전치사',
    tip: 'make, buy, cook, get, find는 3형식 전환 시 간접목적어 앞에 전치사 [for]를 씁니다!',
    example: 'He made a cake for me.'
  },
  {
    tag: '감각동사 + 형용사',
    tip: 'look, sound, smell, feel, taste 뒤에는 부사(well, nicely)가 아닌 [형용사]가 옵니다!',
    example: 'The music sounds sweet. (sweetly ❌)'
  },
  {
    tag: '준사역동사 help',
    tip: 'help는 목적격 보어로 [to부정사]와 [동사원형] 둘 다 쓸 수 있는 만능 동사입니다!',
    example: 'He helped me (to) finish the project.'
  },
  {
    tag: '전치사의 목적어',
    tip: '전치사(in, at, for, of, without 등) 바로 뒤에는 [동명사 -ing] 또는 [명사]만 올 수 있습니다!',
    example: 'Thank you for helping me.'
  },
  {
    tag: '당위성 동사 + should 생략',
    tip: 'insist, suggest, demand, order 뒤 that절에는 [동사원형]이 옵니다! (should 생략)',
    example: 'She insisted that he be on time. (was ❌)'
  },
  {
    tag: '부정어 도치 공식',
    tip: 'Never, Seldom, Hardly, Not only가 문두에 오면 [조동사/be동사 + 주어 + 본동사]로 도치됩니다!',
    example: 'Never have I seen such a beautiful sight.'
  }
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ text = '처리 중...', progress = 0 }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(progress > 0 ? progress : 10);

  // 1. Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // 2. Stage messages rotation (every 3s)
  useEffect(() => {
    const stageTimer = setInterval(() => {
      setStageIdx(prev => (prev + 1) % STAGE_MESSAGES.length);
    }, 3000);
    return () => clearInterval(stageTimer);
  }, []);

  // 3. Grammar tip rotation (여유롭게 읽을 수 있도록 8.5초로 연장 + 마우스 올리면 일시정지)
  useEffect(() => {
    if (isPaused) return;
    const tipTimer = setInterval(() => {
      setTipIdx(prev => (prev + 1) % GRAMMAR_TIPS.length);
    }, 8500);
    return () => clearInterval(tipTimer);
  }, [isPaused]);

  // 4. Smooth visual progress animation
  useEffect(() => {
    if (progress > 0) {
      setSmoothProgress(progress);
    } else {
      const progressTimer = setInterval(() => {
        setSmoothProgress(prev => {
          if (prev >= 92) return 92;
          return prev + Math.random() * 6 + 1.5;
        });
      }, 500);
      return () => clearInterval(progressTimer);
    }
  }, [progress]);

  const handlePrevTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIdx(prev => (prev - 1 + GRAMMAR_TIPS.length) % GRAMMAR_TIPS.length);
  };

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIdx(prev => (prev + 1) % GRAMMAR_TIPS.length);
  };

  const currentStage = STAGE_MESSAGES[stageIdx];
  const currentTip = GRAMMAR_TIPS[tipIdx];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in text-center select-none">
      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-6 sm:p-8 border border-indigo-500/40 shadow-[0_0_60px_rgba(99,102,241,0.25)] relative overflow-hidden flex flex-col items-center">
        
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Central Animated Hologram Core */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Pulsing Aura */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500/30 via-purple-500/20 to-pink-500/30 animate-ping opacity-60 pointer-events-none" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-[2px] shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <span className="text-3xl animate-bounce">{currentStage.icon}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Title & Stage Status */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />
            <span>AI 1타 강사 출제 센터</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {text}
          </h3>

          <p className="text-indigo-200 text-xs sm:text-sm font-medium mt-1.5 min-h-[40px] flex items-center justify-center transition-all duration-300">
            {currentStage.text}
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full mb-5">
          <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-400 mb-1.5 px-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>{elapsed.toFixed(1)}초 경과</span>
            </span>
            <span className="text-indigo-300">{Math.round(smoothProgress)}%</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
              style={{ width: `${smoothProgress}%` }}
            />
          </div>
        </div>

        {/* 💡 1타 강사 실전 꿀팁 카드 (여유로운 8.5초 회전 + 수동 이전/다음 탐색 지원) */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left shadow-lg relative overflow-hidden transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-wide">
                1타 강사 족집게 Tip
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px] font-black">
                {currentTip.tag}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {tipIdx + 1}/{GRAMMAR_TIPS.length}
              </span>
            </div>
          </div>

          <p className="text-slate-200 text-xs font-bold leading-relaxed mb-2">
            {currentTip.tip}
          </p>

          <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 mb-2">
            <span className="text-[10px] font-mono text-emerald-400 block font-bold">
              예시: {currentTip.example}
            </span>
          </div>

          {/* Tips Navigation Controls */}
          <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400">
            <span className="text-[9px] text-slate-500">
              {isPaused ? '⏸️ 일시정지됨' : '⏱️ 8.5초마다 자동 회전 (마우스 올리면 멈춤)'}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevTip}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
                title="이전 팁"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleNextTip}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
                title="다음 팁"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
