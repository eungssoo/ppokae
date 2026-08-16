import React, { useState } from 'react';
import { Crown, ArrowLeft, Clock, Sparkles, Gift, Trophy, Medal } from 'lucide-react';
import { RankingItem, UserProfile, CycleInfo } from '../types';
import { calculateCycleReward, isCycleRewardClaimed, claimCycleRankingReward, getTodayDateString } from '../services/dbService';
import { sound } from '../services/soundService';

interface RankingBoardViewProps {
  user: UserProfile;
  rankingData: RankingItem[];
  currentCycle: CycleInfo;
  selectedCycleIndex: 1 | 2 | 3;
  onChangeCycleTab: (cycleIndex: 1 | 2 | 3) => void;
  onBack: () => void;
  onStartChallenge: () => void;
  onClaimReward?: (cycleId: string, rank: number) => void;
}

export const RankingBoardView: React.FC<RankingBoardViewProps> = ({
  user,
  rankingData,
  currentCycle,
  selectedCycleIndex,
  onChangeCycleTab,
  onBack,
  onStartChallenge,
  onClaimReward,
}) => {
  const CYCLES: { index: 1 | 2 | 3; label: string; time: string }[] = [
    { index: 1, label: '1차전', time: '00:00 ~ 10:00' },
    { index: 2, label: '2차전', time: '10:00 ~ 18:00' },
    { index: 3, label: '3차전', time: '18:00 ~ 24:00' },
  ];

  const [hasClaimedCurrent, setHasClaimedCurrent] = useState(false);

  // 🏆 종료된 차전인지 여부 확인
  const isCycleEnded = selectedCycleIndex < currentCycle.cycleIndex;
  const cycleId = `${getTodayDateString()}_cycle${selectedCycleIndex}`;

  // 현재 유저의 순위 확인
  const userRankIndex = rankingData.findIndex(r => r.name === user.name);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;
  const isClaimed = hasClaimedCurrent || isCycleRewardClaimed(user.name, cycleId);
  const cycleReward = userRank ? calculateCycleReward(userRank) : null;

  const handleClaimCycleReward = async () => {
    if (!userRank || isClaimed) return;
    sound.playReward();
    const res = await claimCycleRankingReward(user.name, cycleId, userRank);
    if (res.success) {
      setHasClaimedCurrent(true);
      if (onClaimReward) {
        onClaimReward(cycleId, userRank);
      }
    }
  };

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
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>오늘의 실시간 명예의 전당</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-400 tracking-tight pb-1 font-serif">
            Hall of Fame 👑
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
            ⚡ 점수가 같을 경우 <strong>먼저 마친 사람</strong>이 더 높은 순위에 오릅니다!
          </p>
        </div>

        {/* 🎁 종료된 차전 차등 순위 보상 수령 배너 */}
        {isCycleEnded && userRank && !isClaimed && cycleReward && (
          <div className="mb-5 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-orange-500/25 border-2 border-amber-400/80 shadow-xl flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">🎁</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-200 border border-amber-400 text-[10px] font-black uppercase">
                    {selectedCycleIndex}차전 종료 차등 보상
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white">{userRank}위 달성!</span>
                </div>
                <p className="text-xs text-amber-200 mt-0.5">
                  보상: <strong>🪙 +{cycleReward.coins} 코인</strong> & <strong>🏆 +{cycleReward.xp} XP</strong>
                </p>
              </div>
            </div>
            <button
              onClick={handleClaimCycleReward}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>보상 받기</span>
            </button>
          </div>
        )}

        {isCycleEnded && isClaimed && userRank && (
          <div className="mb-5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center text-xs font-bold text-slate-400">
            ✓ {selectedCycleIndex}차전 순위 보상(🪙 +{cycleReward?.coins} 코인) 수령을 완료했습니다.
          </div>
        )}

        {/* Cycle Tabs (1차전, 2차전, 3차전) */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 mb-3">
          {CYCLES.map((c) => {
            const isSelected = selectedCycleIndex === c.index;
            const isCurrent = currentCycle.cycleIndex === c.index;
            const isEnded = c.index < currentCycle.cycleIndex;

            return (
              <button
                key={c.index}
                onClick={() => {
                  sound.playClick();
                  onChangeCycleTab(c.index);
                }}
                className={`py-2.5 px-2 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs sm:text-sm">{c.label}</span>
                  {isCurrent ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ) : isEnded ? (
                    <span className="text-[9px] text-amber-300 font-bold">종료</span>
                  ) : null}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">{c.time}</div>
              </button>
            );
          })}
        </div>

        {/* 🏆 차등 보상 안내 배지 바 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 mb-5 flex items-center justify-between overflow-x-auto text-[11px] font-bold text-slate-400 gap-2 scrollbar-none">
          <div className="flex items-center gap-1 text-amber-300 shrink-0">
            <span>🥇 1위: 🪙200</span>
          </div>
          <div className="flex items-center gap-1 text-slate-200 shrink-0">
            <span>🥈 2위: 🪙120</span>
          </div>
          <div className="flex items-center gap-1 text-orange-300 shrink-0">
            <span>🥉 3위: 🪙80</span>
          </div>
          <div className="flex items-center gap-1 text-purple-300 shrink-0">
            <span>4~10위: 🪙40</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <span>참가: 🪙15</span>
          </div>
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
