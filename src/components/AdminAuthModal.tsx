import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { sound } from '../services/soundService';
import { UserProfile } from '../types';
import { checkIsAdmin } from '../services/dbService';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: UserProfile | null;
}

const MASTER_PASSWORDS = [
  '7788',
  '7777',
  '777777',
  '000000',
  'ppokae2026',
  'admin7788'
];

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerifying(true);

    const inputTrimmed = password.trim();

    // 1. Check if user is verified Google admin
    const isGoogleAdmin = checkIsAdmin(user);

    // 2. Check master passwords or user PIN
    const isPasswordMatch = 
      MASTER_PASSWORDS.includes(inputTrimmed) || 
      (user?.pin && user.pin === inputTrimmed && user.isAdmin === true);

    if (isGoogleAdmin || isPasswordMatch) {
      sound.playStar();
      sessionStorage.setItem('ppokae_admin_authenticated', 'true');
      setIsVerifying(false);
      onSuccess();
    } else {
      sound.playIncorrect();
      setIsVerifying(false);
      setErrorMsg('⚠️ 관리자 마스터 비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/40 w-full max-w-sm rounded-[2rem] p-6 sm:p-7 text-center relative shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-all active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
          👑
        </div>

        {/* Header */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
            <span>관리자 마스터 인증</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            관리자 전용 사령탑에 접속하려면<br />마스터 보안 비밀번호를 입력해 주세요.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="마스터 비밀번호 입력"
              className="w-full bg-slate-950/90 border-2 border-slate-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20 rounded-2xl px-4 py-3.5 text-center text-lg font-mono font-black text-white tracking-widest outline-none transition-all placeholder:text-slate-600 placeholder:text-xs placeholder:font-sans placeholder:tracking-normal"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-bold animate-shake">
              {errorMsg}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all active:scale-95"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:from-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <span>인증 & 접속</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
