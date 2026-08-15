import React from 'react';
import { AlertTriangle, Coins, Sparkles, X, Check, ArrowRight, ShieldAlert, Trash2 } from 'lucide-react';
import { sound } from '../services/soundService';

export interface ActionModalConfig {
  isOpen: boolean;
  type: 'generate_grammar' | 'generate_expression' | 'expand_bookmark' | 'custom' | 'danger';
  title: string;
  subtitle: string;
  cost: number;
  icon?: string;
  notices: string[];
  confirmButtonText?: string;
  onConfirm: () => void;
  onClose: () => void;
  onEarnCoins?: () => void;
}

interface ActionConfirmModalProps {
  config: ActionModalConfig | null;
  userCoins: number;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  config,
  userCoins,
}) => {
  if (!config || !config.isOpen) return null;

  const isDanger = config.type === 'danger' || config.type === 'custom' || config.cost === 0;
  const hasEnoughCoins = userCoins >= config.cost;
  const remainingCoins = userCoins - config.cost;

  const handleConfirm = () => {
    sound.playClick();
    config.onConfirm();
  };

  const handleClose = () => {
    sound.playClick();
    config.onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-6 sm:p-8 border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden text-left">
        
        {/* Background Glow */}
        <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none ${isDanger ? 'bg-rose-500/15' : 'bg-purple-500/10'}`} />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-all border border-slate-700/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-inner ${
            isDanger
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : 'bg-gradient-to-br from-amber-500/20 to-purple-500/20 border-amber-500/30'
          }`}>
            {config.icon || (isDanger ? '⚠️' : '🪙')}
          </div>
          <div>
            <div className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${isDanger ? 'text-rose-400' : 'text-amber-300'}`}>
              {isDanger ? <AlertTriangle className="w-3 h-3 text-rose-400" /> : <Sparkles className="w-3 h-3 text-amber-400" />}
              <span>{isDanger ? 'Warning & Security' : 'AI Generation & Upgrade'}</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {config.title}
            </h3>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-5">
          {config.subtitle}
        </p>

        {/* Price & Balance Box (Only when cost > 0) */}
        {!isDanger && config.cost > 0 && (
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 mb-5">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">소모 코인</span>
              <span className="font-black text-rose-400 flex items-center gap-1 text-sm">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>- {config.cost} 코인</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">보유 ➔ 사용 후 잔여 코인</span>
              <span className={`font-black flex items-center gap-1 text-sm ${hasEnoughCoins ? 'text-emerald-400' : 'text-rose-400'}`}>
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>{hasEnoughCoins ? `${userCoins} ➔ ${remainingCoins} 코인` : `코인 부족 (${userCoins} / ${config.cost})`}</span>
              </span>
            </div>
          </div>
        )}

        {/* ⚠️ 주의사항 (Important Notices) */}
        {config.notices && config.notices.length > 0 && (
          <div className={`rounded-2xl p-3.5 border mb-6 ${
            isDanger
              ? 'bg-rose-500/10 border-rose-500/30'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <div className={`flex items-center gap-1.5 text-xs font-black mb-2 ${isDanger ? 'text-rose-300' : 'text-amber-300'}`}>
              <ShieldAlert className={`w-3.5 h-3.5 ${isDanger ? 'text-rose-400' : 'text-amber-400'}`} />
              <span>{isDanger ? '탈퇴 전 필수 확인 사항' : '진행 전 주의사항 & 혜택 안내'}</span>
            </div>
            <ul className={`space-y-1 text-[11px] font-medium ${isDanger ? 'text-rose-100/90' : 'text-amber-100/90'}`}>
              {config.notices.map((notice, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className={isDanger ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>•</span>
                  <span>{notice}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Insufficient Coins Warning Banner */}
        {!isDanger && !hasEnoughCoins && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-5 flex items-center gap-2.5 text-rose-200 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>보유 코인이 부족합니다! (부족분: {config.cost - userCoins} 코인)</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl font-bold text-xs sm:text-sm border border-slate-700 transition-all active:scale-95"
          >
            취소
          </button>

          {isDanger ? (
            <button
              onClick={handleConfirm}
              className="flex-[2] py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{config.confirmButtonText || '탈퇴 및 영구 삭제'}</span>
            </button>
          ) : hasEnoughCoins ? (
            <button
              onClick={handleConfirm}
              className="flex-[2] py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-[0_8px_25px_rgba(249,115,22,0.35)] active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Coins className="w-4 h-4 text-yellow-200" />
              <span>{config.confirmButtonText || `확인 (🪙 ${config.cost} 소모)`}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                handleClose();
                if (config.onEarnCoins) config.onEarnCoins();
              }}
              className="flex-[2] py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>퀴즈 풀고 코인 모으기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
