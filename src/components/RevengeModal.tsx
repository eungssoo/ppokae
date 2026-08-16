import React from 'react';
import { Flame, Coins, Zap, X, Trophy } from 'lucide-react';
import { CycleInfo } from '../types';
import { useLanguage } from '../services/i18n';

interface RevengeModalProps {
  isOpen: boolean;
  cycleInfo: CycleInfo;
  previousScore: number;
  userCoins: number;
  onConfirm: () => void;
  onClose: () => void;
}

export const RevengeModal: React.FC<RevengeModalProps> = ({
  isOpen,
  cycleInfo,
  previousScore,
  userCoins,
  onConfirm,
  onClose,
}) => {
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  const REQUIRED_COINS = 50;
  const canAfford = userCoins >= REQUIRED_COINS;
  const cycleLabel = language === 'en' ? `Round ${cycleInfo.cycleIndex}` : cycleInfo.cycleName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-6 sm:p-8 border-2 border-orange-500/50 shadow-[0_0_50px_rgba(249,115,22,0.3)] relative overflow-hidden text-center">
        
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-all border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge & Icon */}
        <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4">
          <Flame className="w-4 h-4 animate-bounce" />
          <span>{language === 'en' ? 'REVENGE MATCH CHANCE' : 'REVENGE MATCH CHANCE'}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {language === 'en' ? 'Revenge Rematch 🎟️' : '리벤지(Revenge) 재도전 🎟️'}
        </h3>

        <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-4">
          {language === 'en' ? (
            <>
              You have already completed <strong className="text-amber-300">[{cycleLabel}]</strong>!<br />
              Spend <span className="text-orange-400 font-bold">50 Coins</span> to use your <span className="underline decoration-orange-400 decoration-2 underline-offset-2">1-time revenge retry chance</span> for this round?
            </>
          ) : (
            <>
              이미 이번 <strong className="text-amber-300">[{cycleInfo.cycleName}]</strong>에 응시하셨습니다!<br />
              <span className="text-orange-400 font-bold">50 코인</span>을 소모하여 <span className="underline decoration-orange-400 decoration-2 underline-offset-2">회차당 딱 1번만 주어지는 재도전 기회</span>를 사용하시겠습니까?
            </>
          )}
        </p>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-[11px] text-amber-200 font-medium mb-4 flex items-center justify-center gap-1.5">
          <span>⚠️</span>
          <span>{language === 'en' ? 'This is your final attempt for this round. (Max 2 attempts).' : '이번 회차의 마지막 재도전 기회입니다. (최대 2회 완료 시 다음 회차 오픈)'}</span>
        </div>

        {/* Status Card */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 mb-6 flex justify-around items-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{language === 'en' ? 'Previous High Score' : '내 현재 최고 기록'}</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              {previousScore} {language === 'en' ? 'PTS' : '점'}
            </span>
          </div>

          <div className="w-[1px] h-10 bg-slate-800" />

          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-0.5">{language === 'en' ? 'Available Coins' : '내 보유 코인'}</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-300 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              {userCoins} {language === 'en' ? 'Coins' : '개'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            disabled={!canAfford}
            className={`w-full p-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
              canAfford
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-[0_8px_25px_rgba(249,115,22,0.4)]'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Zap className="w-5 h-5 text-yellow-300" />
            <span>
              {canAfford 
                ? (language === 'en' ? 'Spend 🪙 50 Coins & Start Revenge Match!' : '🪙 50 코인 쓰고 마지막 1위 탈환 도전!') 
                : (language === 'en' ? 'Insufficient Coins (Need 50 Coins)' : '코인이 부족합니다 (필요: 50개)')}
            </span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            {language === 'en' ? 'Maybe later' : '다음에 도전하기'}
          </button>
        </div>

        {!canAfford && (
          <p className="mt-3 text-[11px] text-indigo-300 font-medium">
            {language === 'en' ? '💡 Earn 5 coins per correct answer in standard quiz practice!' : '💡 [일반 퀴즈 풀기]에서 정답을 맞추면 문제당 5 코인을 획득할 수 있습니다!'}
          </p>
        )}

      </div>
    </div>
  );
};
