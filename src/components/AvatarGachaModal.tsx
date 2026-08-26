import React, { useState } from 'react';
import { Sparkles, X, Coins, Gift, RefreshCw, Star, CheckCircle, ArrowRight, Flame, Check, Percent } from 'lucide-react';
import { AvatarItem, AvatarGrade } from '../types';
import { GRADE_CONFIG } from '../services/avatarService';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';

interface AvatarGachaModalProps {
  isOpen: boolean;
  userCoins: number;
  currentAvatarId?: string;
  onDraw: (count: 1 | 10) => Promise<{
    success: boolean;
    results?: Array<{ avatar: AvatarItem; isDuplicate: boolean; refundAmount: number }>;
    totalRefund?: number;
    error?: string;
  }>;
  onEquipDirect: (avatar: AvatarItem) => void;
  onClose: () => void;
  onGoCollection: () => void;
}

const GRADE_ORDER: Record<AvatarGrade, number> = {
  transcendent: 1,
  mythic: 2,
  legendary: 3,
  epic: 4,
  rare: 5,
  common: 6,
  starter: 7
};

export const AvatarGachaModal: React.FC<AvatarGachaModalProps> = ({
  isOpen,
  userCoins,
  currentAvatarId,
  onDraw,
  onEquipDirect,
  onClose,
  onGoCollection,
}) => {
  const { language, t } = useLanguage();
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawResults, setDrawResults] = useState<Array<{ avatar: AvatarItem; isDuplicate: boolean; refundAmount: number }> | null>(null);
  const [totalRefund, setTotalRefund] = useState<number>(0);
  const [lastCount, setLastCount] = useState<1 | 10>(1);
  const [equippedId, setEquippedId] = useState<string | undefined>(currentAvatarId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setEquippedId(currentAvatarId);
  }, [currentAvatarId]);

  if (!isOpen) return null;

  const handleStartDraw = async (count: 1 | 10) => {
    sound.playClick();
    setLastCount(count);
    setIsDrawing(true);
    setDrawResults(null);
    setErrorMsg(null);

    // Simulate chest opening shake & sound
    sound.playStar();
    setTimeout(async () => {
      const res = await onDraw(count);
      setIsDrawing(false);
      if (res.success && res.results) {
        // 🔥 등급이 높은 순으로 자동 정렬
        const sorted = [...res.results].sort((a, b) => {
          const orderA = GRADE_ORDER[a.avatar.grade] || 99;
          const orderB = GRADE_ORDER[b.avatar.grade] || 99;
          return orderA - orderB;
        });

        setDrawResults(sorted);
        setTotalRefund(res.totalRefund || 0);
        sound.playCoin();
      } else {
        sound.playIncorrect();
        setErrorMsg(res.error || (language === 'en' ? 'Not enough coins or draw failed.' : '코인이 부족하거나 가챠를 진행할 수 없습니다.'));
      }
    }, 1000);
  };

  const handleReset = () => {
    setDrawResults(null);
    setErrorMsg(null);
  };

  const handleDirectEquip = (avatar: AvatarItem) => {
    sound.playStar();
    setEquippedId(avatar.id);
    onEquipDirect(avatar);
  };

  const hasTranscendent = drawResults?.some(r => r.avatar.grade === 'transcendent');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-4xl w-full glass-card rounded-[3rem] p-6 sm:p-10 border border-purple-500/40 shadow-[0_25px_80px_rgba(168,85,247,0.35)] relative overflow-hidden text-center">
        
        {/* Background Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 transition-all border border-slate-700 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{language === 'en' ? 'Learner Avatar Rewards' : '학습 보상 아바타 컬렉션'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>
              {language === 'en' ? 'Avatar Rewards & Collection' : '아바타 보상 소환소'}
            </span>
            <span className="inline-block text-2xl">🌟</span>
          </h2>

          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs font-bold text-slate-400">{language === 'en' ? 'My Coins:' : '내 보유 코인:'}</span>
            <span className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/30 shadow-inner">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{userCoins} {language === 'en' ? 'Coins' : '코인'}</span>
            </span>
          </div>
        </div>

        {/* ⚠️ Error Alert Screen */}
        {errorMsg && !isDrawing && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/40 rounded-2xl animate-fade-in flex flex-col items-center justify-center gap-2">
            <div className="text-sm font-black text-rose-300 flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'en'
                ? 'Solve quizzes or join the live ranking battles to earn coins!'
                : '일반 퀴즈나 실시간 랭킹전에 참여하시면 🪙 코인을 보상으로 획득할 수 있습니다!'}
            </p>
          </div>
        )}

        {/* 🎲 Case 1: Drawing Animation Screen */}
        {isDrawing && (
          <div className="py-16 flex flex-col items-center justify-center animate-pulse">
            <div className="text-8xl mb-5 animate-bounce filter drop-shadow-[0_0_30px_rgba(245,158,11,0.9)]">
              🎁
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              {language === 'en' ? 'Summoning from 50 Mystical Avatars...' : '신비로운 50종 아바타를 소환하는 중...'}
            </h3>
            <p className="text-amber-300 text-sm font-medium">
              🌟 {language === 'en' ? 'Will the 0.05% Transcendent Miracle appear? ✨' : '0.05% 초월(Transcendent) 등급의 기적이 강림할까요? ✨'}
            </p>
          </div>
        )}

        {/* 🏆 Case 2: Draw Results Screen */}
        {!isDrawing && drawResults && (
          <div className="space-y-5 animate-fade-in">
            {hasTranscendent && (
              <div className="p-3 bg-gradient-to-r from-amber-500/30 via-pink-500/30 to-cyan-500/30 border border-amber-300 rounded-2xl animate-bounce shadow-lg">
                <span className="text-xs sm:text-sm font-black text-yellow-200 flex items-center justify-center gap-2">
                  <Flame className="w-5 h-5 text-amber-300" />
                  <span>{language === 'en' ? '🎉 Congratulations! You summoned a 0.05% Transcendent Avatar!' : '축하합니다! 0.05% 초월(Transcendent) 등급 아바타를 획득하셨습니다! 🎉'}</span>
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center px-1 gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                {language === 'en' ? `🎉 Summon Results (${drawResults.length} pulled)` : `🎉 소환 결과 (${drawResults.length}개 획득)`}
              </span>
              {totalRefund > 0 && (
                <span className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  {language === 'en' ? `Duplicate Refund: 🪙 +${totalRefund} Coins` : `중복 환급: 🪙 +${totalRefund} 코인`}
                </span>
              )}
            </div>

            {/* Results Grid */}
            <div className={`grid gap-3 sm:gap-3.5 max-h-[460px] overflow-y-auto p-2 custom-scrollbar ${
              drawResults.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-2 sm:grid-cols-5'
            }`}>
              {drawResults.map((res, idx) => {
                const av = res.avatar;
                const gInfo = GRADE_CONFIG[av.grade];
                const isCurrentlyEquipped = equippedId === av.id;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-3xl border bg-gradient-to-br ${av.bgGradient} flex flex-col justify-between items-center text-center relative group shadow-lg transition-all hover:scale-105 hover:shadow-2xl`}
                  >
                    {res.isDuplicate && (
                      <span className="absolute top-2.5 right-2.5 bg-slate-900/90 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/40 shadow-sm">
                        +{res.refundAmount}🪙
                      </span>
                    )}

                    <div>
                      {/* Avatar Icon */}
                      <div className="text-4xl sm:text-5xl my-2 filter drop-shadow">
                        {av.icon}
                      </div>

                      {/* Grade Badge */}
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border mb-1.5 inline-block ${gInfo.badgeBg}`}>
                        {gInfo.name.split(' ')[0]}
                      </span>

                      {/* Drop Rate */}
                      <div className="flex items-center justify-center gap-1 text-[10px] font-black text-amber-200 bg-black/40 px-2 py-0.5 rounded-md border border-white/10 my-1">
                        <Percent className="w-2.5 h-2.5 text-yellow-300" />
                        <span>{language === 'en' ? 'Rate' : '확률'} {gInfo.dropRate}</span>
                      </div>

                      {/* Name */}
                      <h4 className={`text-xs sm:text-sm font-black line-clamp-1 mt-1 ${av.color}`}>
                        {av.name}
                      </h4>

                      {/* Quote */}
                      <p className="text-[10px] text-slate-300 font-medium italic mt-1 line-clamp-1">
                        "{av.quote}"
                      </p>
                    </div>

                    {/* ✨ Equip Button */}
                    <div className="w-full mt-3 pt-2 border-t border-white/10">
                      {isCurrentlyEquipped ? (
                        <span className="w-full py-1.5 bg-emerald-500 text-slate-950 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Equipped' : '장착 완료'}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDirectEquip(av)}
                          className="w-full py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-[11px] font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-yellow-200" />
                          <span>{language === 'en' ? 'Equip' : '즉시 장착'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons after draw */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'en' ? 'Summon Again' : '다시 소환'}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onGoCollection();
                }}
                className="flex-[1.5] py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{language === 'en' ? 'View Avatar Catalog' : '내 도감 컬렉션 보기'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 🎰 Case 3: Initial Selection Screen */}
        {!isDrawing && !drawResults && (
          <div>
            {/* Lootbox Banner */}
            <div className="bg-gradient-to-br from-purple-900/50 via-slate-900 to-slate-900/90 border border-purple-500/30 rounded-3xl p-6 mb-6">
              <div className="flex justify-center gap-4 text-4xl sm:text-5xl mb-3 filter drop-shadow">
                <span className="animate-bounce">🪐</span>
                <span>👁️</span>
                <span>🪽</span>
                <span>🌌</span>
                <span>🐉</span>
                <span>🧙‍♂️</span>
              </div>
              <p className="text-slate-200 text-xs sm:text-base font-medium leading-relaxed">
                {language === 'en' ? (
                  <>
                    A total of <strong>50 Epic Avatars</strong> await your discovery!<br />
                    Summoned avatars are <strong>automatically sorted by rarity</strong> and can be equipped right away.
                  </>
                ) : (
                  <>
                    총 <strong>50종의 방대한 캐릭터 도감</strong>이 준비되어 있습니다!<br />
                    소환 즉시 <strong>높은 등급순으로 자동 정렬</strong>되며, <strong>결과 화면에서 바로 장착</strong>할 수 있습니다.
                  </>
                )}
              </p>

              {/* Exact Probabilities Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] sm:text-xs font-bold">
                <span className="bg-gradient-to-r from-amber-400/30 to-pink-500/30 text-amber-200 border border-amber-300 px-3 py-1 rounded-full shadow-sm animate-pulse">
                  🌟 {language === 'en' ? 'Transcendent 0.05%' : '초월 0.05%'}
                </span>
                <span className="bg-pink-500/20 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full">
                  {language === 'en' ? 'Mythic 1.00%' : '신화 1.00%'}
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                  {language === 'en' ? 'Legendary 5.00%' : '전설 5.00%'}
                </span>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                  {language === 'en' ? 'Epic 15.00%' : '영웅 15.00%'}
                </span>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full">
                  {language === 'en' ? 'Rare 30.00%' : '희귀 30.00%'}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                  {language === 'en' ? 'Common 48.95%' : '일반 48.95%'}
                </span>
              </div>
            </div>

            {/* Draw Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1 Draw */}
              <button
                onClick={() => handleStartDraw(1)}
                disabled={userCoins < 30}
                className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:grayscale text-white rounded-3xl font-black text-sm sm:text-base transition-all shadow-md active:scale-95 flex items-center justify-between border border-purple-400/40"
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="w-6 h-6 text-yellow-300" />
                  <span>{language === 'en' ? '1 Summon' : '1회 소환'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-2xl text-xs font-black text-amber-300 border border-white/10">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>30 {language === 'en' ? 'Coins' : '코인'}</span>
                </div>
              </button>

              {/* 10 Draws */}
              <button
                onClick={() => handleStartDraw(10)}
                disabled={userCoins < 270}
                className="p-5 bg-gradient-to-r from-pink-600 via-purple-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 disabled:opacity-40 disabled:grayscale text-white rounded-3xl font-black text-sm sm:text-base transition-all shadow-[0_8px_25px_rgba(236,72,153,0.35)] active:scale-95 flex items-center justify-between border border-pink-400/50"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-6 h-6 text-yellow-200 animate-spin" />
                  <div className="text-left">
                    <span>{language === 'en' ? '10 Summons' : '10연속 소환'}</span>
                    <span className="text-[10px] text-pink-200 block font-semibold">{language === 'en' ? '10% Discount & Auto Sort' : '10% 할인 & 등급순 자동 정렬'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-2xl text-xs font-black text-yellow-300 border border-white/10">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>270 {language === 'en' ? 'Coins' : '코인'}</span>
                </div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
