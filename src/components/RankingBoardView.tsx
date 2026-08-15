import React, { useState } from 'react';
import { Crown, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { RankingItem, UserProfile, CycleInfo } from '../types';

interface RankingBoardViewProps {
  user: UserProfile;
  rankingData: RankingItem[];
  currentCycle: CycleInfo;
  selectedCycleIndex: 1 | 2 | 3;
  onChangeCycleTab: (cycleIndex: 1 | 2 | 3) => void;
  onBack: () => void;
  onStartChallenge: () => void;
}

export const RankingBoardView: React.FC<RankingBoardViewProps> = ({
  user,
  rankingData,
  currentCycle,
  selectedCycleIndex,
  onChangeCycleTab,
  onBack,
  onStartChallenge,
}) => {
  const CYCLES: { index: 1 | 2 | 3; label: string; time: string }[] = [
    { index: 1, label: '1차전', time: '00:00 ~ 10:00' },
    { index: 2, label: '2차전', time: '10:00 ~ 18:00' },
    { index: 3, label: '3차전', time: '18:00 ~ 24:00' },
  ];

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full glass-card rounded-[2.5rem] p-6 sm:p-10 relative border border-slate-700/60 shadow-2xl overflow-hidden">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-5 text-slate-400 hover:text-white font-bold transition-all flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-xl shadow-sm border border-slate-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>메인으로</span>
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>오늘의 실시간 명예의 전당</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-400 tracking-tight pb-1">
            Hall of Fame 👑
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
            ⚡ 점수가 같을 경우 <strong>먼저 마친 사람</strong>이 더 높은 순위에 오릅니다!
          </p>
        </div>

        {/* Cycle Tabs (1차전, 2차전, 3차전) */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 mb-6">
          {CYCLES.map((c) => {
            const isSelected = selectedCycleIndex === c.index;
            const isCurrent = currentCycle.cycleIndex === c.index;

            return (
              <button
                key={c.index}
                onClick={() => onChangeCycleTab(c.index)}
                className={`py-2.5 px-2 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs sm:text-sm">{c.label}</span>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">{c.time}</div>
              </button>
            );
          })}
        </div>

        {/* Leaderboard content */}
        {rankingData.length === 0 ? (
          <div className="bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-700 p-8 sm:p-10 text-center text-slate-400">
            <span className="text-4xl mb-2 block">👀</span>
            <p className="font-extrabold text-base sm:text-lg text-white">
              {CYCLES.find(c => c.index === selectedCycleIndex)?.label} 참여자가 아직 없습니다!
            </p>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              지금 바로 도전해서 영광의 1위 자리를 선점하세요!
            </p>
            {selectedCycleIndex === currentCycle.cycleIndex && (
              <button
                onClick={onStartChallenge}
                className="mt-5 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs sm:text-sm rounded-xl hover:shadow-[0_8px_20px_rgba(249,115,22,0.35)] transition-all active:scale-[0.98]"
              >
                🔥 지금 바로 랭킹전 도전하기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {rankingData.map((rank, index) => {
              const isCurrentUser = user.name === rank.name;
              let badge: React.ReactNode = (
                <span className="w-7 h-7 flex items-center justify-center bg-slate-800 rounded-full text-slate-400 font-bold text-xs border border-slate-700">
                  {index + 1}
                </span>
              );
              let rowStyle = 'bg-slate-800/60 border-slate-700/80';
              let textStyle = 'text-slate-200';

              if (index === 0) {
                badge = <span className="text-2xl sm:text-3xl filter drop-shadow">🥇</span>;
                rowStyle = 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30';
                textStyle = 'text-amber-200';
              } else if (index === 1) {
                badge = <span className="text-2xl sm:text-3xl filter drop-shadow">🥈</span>;
                rowStyle = 'bg-gradient-to-r from-slate-700/40 to-slate-800/40 border-slate-500/40';
                textStyle = 'text-slate-100';
              } else if (index === 2) {
                badge = <span className="text-2xl sm:text-3xl filter drop-shadow">🥉</span>;
                rowStyle = 'bg-gradient-to-r from-orange-950/40 to-slate-800/40 border-orange-700/40';
                textStyle = 'text-orange-200';
              }

              return (
                <div
                  key={index}
                  className={`flex justify-between items-center px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border transition-all ${rowStyle} ${
                    isCurrentUser ? 'ring-2 ring-indigo-500/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {badge}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm sm:text-base font-black tracking-tight ${textStyle}`}>
                          {rank.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] bg-indigo-600 text-white font-black px-1.5 py-0.5 rounded-full shadow-sm">
                            ME
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>완료 {rank.completedAtFormatted || '--:--:--'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
                      {rank.score}
                      <span className="text-xs font-bold text-slate-400 ml-1">점</span>
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
