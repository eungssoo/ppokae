import React, { useState } from 'react';
import { Crown, ArrowLeft, Clock, Sparkles, Gift, Trophy, Medal } from 'lucide-react';
import { RankingItem, UserProfile, CycleInfo } from '../types';
import { calculateCycleReward, isCycleRewardClaimed, claimCycleRankingReward, getTodayDateString } from '../services/dbService';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';

interface RankingBoardViewProps {
  user: UserProfile;
  rankingData: RankingItem[];
  currentCycle: CycleInfo;
  selectedCycleIndex: 1 | 2 | 3;
  onChangeCycleTab: (cycleIndex: 1 | 2 | 3) => void;
  onBack: () => void;
  onStartChallenge: () => void;
  onOpenGachaModal?: () => void;
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
  onOpenGachaModal,
  onClaimReward,
}) => {
  const { language, t } = useLanguage();

  const CYCLES: { index: 1 | 2 | 3; label: string; time: string }[] = language === 'en' ? [
    { index: 1, label: 'Round 1', time: '00:00 ~ 10:00' },
    { index: 2, label: 'Round 2', time: '10:00 ~ 18:00' },
    { index: 3, label: 'Round 3', time: '18:00 ~ 24:00' },
  ] : [
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
          className="mb-5 text-slate-400 hover:text-white font-bold transition-all flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-xl shadow-sm border border-slate-700 text-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('home')}</span>
        </button>

        {/* Title */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'en' ? "Today's Live Hall of Fame" : '오늘의 실시간 명예의 전당'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-400 tracking-tight pb-1 font-serif">
            Hall of Fame 👑
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
            {language === 'en'
              ? '⚡ In case of tie scores, the player who finishes earlier ranks higher!'
              : '⚡ 점수가 같을 경우 먼저 마친 사람이 더 높은 순위에 오릅니다!'}
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
                    {language === 'en' ? `Round ${selectedCycleIndex} Reward` : `${selectedCycleIndex}차전 종료 차등 보상`}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white">{language === 'en' ? `Ranked #${userRank}!` : `${userRank}위 달성!`}</span>
                </div>
                <p className="text-xs text-amber-200 mt-0.5">
                  {language === 'en' ? `Reward: 🪙 +${cycleReward.coins} Coins & 🏆 +${cycleReward.xp} XP` : `보상: 🪙 +${cycleReward.coins} 코인 & 🏆 +${cycleReward.xp} XP`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClaimCycleReward}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{language === 'en' ? 'Claim' : '보상 받기'}</span>
            </button>
          </div>
        )}

        {isCycleEnded && isClaimed && userRank && (
          <div className="mb-5 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-center text-xs font-bold text-slate-400">
            ✓ {language === 'en' ? `Round ${selectedCycleIndex} reward (+${cycleReward?.coins} Coins) claimed.` : `${selectedCycleIndex}차전 순위 보상(🪙 +${cycleReward?.coins} 코인) 수령을 완료했습니다.`}
          </div>
        )}

        {/* 🎰 신화 아바타 소환 바로가기 배너 */}
        {onOpenGachaModal && (
          <button
            onClick={() => {
              sound.playStar();
              onOpenGachaModal();
            }}
            className="w-full mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-pink-950/70 to-slate-900 border border-purple-500/40 hover:border-pink-400 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-md transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl animate-bounce">🎰</span>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300">
                    {language === 'en' ? 'Show off your unique Avatar' : '나만의 대표 아바타 뽐내기'}
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {language === 'en' ? '0.05% Transcendent' : '0.05% 초월'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  {language === 'en' ? 'Summon rare avatars and customize your leaderboard profile!' : '가챠에서 뽑은 아바타로 랭킹 보드 프로필을 즉시 꾸며보세요!'}
                </p>
              </div>
            </div>
            <span className="text-amber-300 font-black text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
              <span>{language === 'en' ? 'Summon Shop ➔' : '소환소 ➔'}</span>
            </span>
          </button>
        )}

        {/* Cycle Tabs (1차전, 2차전, 3차전) */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-3">
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
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs sm:text-sm">{c.label}</span>
                  {isCurrent ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ) : isEnded ? (
                    <span className="text-[9px] text-amber-700 dark:text-amber-300 font-bold">{language === 'en' ? 'Ended' : '종료'}</span>
                  ) : null}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">{c.time}</div>
              </button>
            );
          })}
        </div>

        {/* 🏆 회차별 차등 순위 보상표 */}
        <div className="bg-white dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-3.5 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{language === 'en' ? `Round ${selectedCycleIndex} Rewards` : `${selectedCycleIndex}차전 종료 시 지급 순위 보상`}</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{language === 'en' ? 'Auto Claim on Round End' : '회차 마감 시 자동 정산'}</span>
          </div>
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-[11px]">
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center min-w-0">
              <div className="font-black text-amber-800 dark:text-amber-300 truncate">{language === 'en' ? '🥇 1st' : '🥇 1위'}</div>
              <div className="text-slate-900 dark:text-white font-black text-xs mt-0.5">🪙 200</div>
              <div className="text-[8px] sm:text-[9px] text-amber-700 dark:text-amber-200/80 font-bold truncate">+150 XP</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700/30 border border-slate-300 dark:border-slate-500/30 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center min-w-0">
              <div className="font-black text-slate-700 dark:text-slate-200 truncate">{language === 'en' ? '🥈 2nd' : '🥈 2위'}</div>
              <div className="text-slate-900 dark:text-white font-black text-xs mt-0.5">🪙 120</div>
              <div className="text-[8px] sm:text-[9px] text-slate-600 dark:text-slate-300/80 font-bold truncate">+100 XP</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-500/30 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center min-w-0">
              <div className="font-black text-orange-800 dark:text-orange-300 truncate">{language === 'en' ? '🥉 3rd' : '🥉 3위'}</div>
              <div className="text-slate-900 dark:text-white font-black text-xs mt-0.5">🪙 80</div>
              <div className="text-[8px] sm:text-[9px] text-orange-700 dark:text-orange-200/80 font-bold truncate">+60 XP</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center min-w-0">
              <div className="font-black text-purple-800 dark:text-purple-300 truncate">{language === 'en' ? '4th~10th' : '4~10위'}</div>
              <div className="text-slate-900 dark:text-white font-black text-xs mt-0.5">🪙 40</div>
              <div className="text-[8px] sm:text-[9px] text-purple-700 dark:text-purple-200/80 font-bold truncate">+30 XP</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 rounded-xl p-1.5 sm:p-2 flex flex-col justify-center min-w-0">
              <div className="font-black text-slate-600 dark:text-slate-400 truncate">{language === 'en' ? 'Entry' : '참가'}</div>
              <div className="text-slate-900 dark:text-white font-black text-xs mt-0.5">🪙 15</div>
              <div className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-bold truncate">+10 XP</div>
            </div>
          </div>
        </div>

        {/* Leaderboard content */}
        {rankingData.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-10 text-center text-slate-500 dark:text-slate-400">
            <span className="text-4xl mb-2 block">👀</span>
            <p className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
              {language === 'en' ? 'No participants in this round yet!' : `${CYCLES.find(c => c.index === selectedCycleIndex)?.label} 참여자가 아직 없습니다!`}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
              {language === 'en' ? 'Challenge now and claim 1st place!' : '지금 바로 도전해서 영광의 1위 자리를 선점하세요!'}
            </p>
            {selectedCycleIndex === currentCycle.cycleIndex && (
              <button
                onClick={onStartChallenge}
                className="mt-5 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs sm:text-sm rounded-xl hover:shadow-[0_8px_20px_rgba(249,115,22,0.35)] transition-all active:scale-[0.98]"
              >
                {language === 'en' ? '🔥 Start Ranking Battle Now' : '🔥 지금 바로 랭킹전 도전하기'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {rankingData.map((rank, index) => {
              const isCurrentUser = user.name === rank.name;
              let badge: React.ReactNode = (
                <span className="w-7 h-7 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-400 font-bold text-xs border border-slate-300 dark:border-slate-700 shrink-0">
                  {index + 1}
                </span>
              );
              let rowStyle = 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80';
              let textStyle = 'text-slate-900 dark:text-slate-200';

              if (index === 0) {
                badge = <span className="text-2xl sm:text-3xl filter drop-shadow shrink-0">🥇</span>;
                rowStyle = 'bg-amber-50/90 dark:bg-amber-500/20 border-amber-300 dark:border-amber-400/50 shadow-sm ring-1 ring-amber-400/30';
                textStyle = 'text-amber-950 dark:text-amber-300 font-black';
              } else if (index === 1) {
                badge = <span className="text-2xl sm:text-3xl filter drop-shadow shrink-0">🥈</span>;
                rowStyle = 'bg-slate-50 dark:bg-slate-700/40 border-slate-300 dark:border-slate-500/40';
                textStyle = 'text-slate-900 dark:text-slate-100 font-black';
              } else if (index === 2) {
                badge = <span className="text-2xl sm:text-3xl filter drop-shadow shrink-0">🥉</span>;
                rowStyle = 'bg-orange-50/90 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700/40';
                textStyle = 'text-orange-950 dark:text-orange-200 font-black';
              }

              return (
                <div
                  key={index}
                  className={`flex justify-between items-center px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border transition-all ${rowStyle} ${
                    isCurrentUser ? 'ring-2 ring-indigo-500/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {badge}

                    {/* 🌟 장착된 아바타 프로필 아이콘 & 등급 테두리 */}
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br ${rank.avatarBgGradient || 'from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-slate-300 dark:border-slate-600'} border flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0 relative`}>
                      <span>{rank.avatarIcon || '🦁'}</span>
                      {rank.avatarGrade && rank.avatarGrade !== 'starter' && rank.avatarGrade !== 'common' && (
                        <span className="absolute -bottom-1 -right-1 text-[8px] font-black px-1 rounded-full bg-slate-950 border border-amber-400 text-amber-300 uppercase leading-tight shadow-sm">
                          {rank.avatarGrade === 'transcendent' ? (language === 'en' ? 'Transcendent' : '초월') : rank.avatarGrade === 'mythic' ? (language === 'en' ? 'Mythic' : '신화') : rank.avatarGrade === 'legendary' ? (language === 'en' ? 'Legend' : '전설') : (language === 'en' ? 'Epic' : '에픽')}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm sm:text-base font-black tracking-tight truncate ${textStyle}`}>
                          {rank.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] bg-indigo-600 text-white font-black px-1.5 py-0.5 rounded-full shadow-sm shrink-0">
                            ME
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[100px] sm:max-w-none">{rank.avatarName || (language === 'en' ? 'Avatar' : '아바타')}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-500 dark:text-slate-400 font-medium">{rank.completedAtFormatted || '--:--:--'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {rank.score}
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{language === 'en' ? 'PTS' : '점'}</span>
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
