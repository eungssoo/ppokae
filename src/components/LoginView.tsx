import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, User, KeyRound, UserPlus, LogIn, Link2 } from 'lucide-react';
import { sound } from '../services/soundService';

interface LoginViewProps {
  onLogin: (name: string, pin: string) => void;
  onGoogleLogin?: () => void;
  isLoading: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onGoogleLogin,
  isLoading,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!name.trim() || !pin.trim()) return;
    onLogin(name.trim(), pin.trim());
  };

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-6 sm:p-10 border border-slate-700/60 shadow-2xl relative overflow-hidden text-center">
        
        {/* Background Ambient Light */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Title */}
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 text-amber-300 border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>AI English Mastery • PPOKAE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-2 font-serif">
            뽀개 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 font-black">PPOKAE</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            문법부터 단어, 회화 표현까지 전부 뽀개보자!<br />
            가입 즉시 <strong>🪙 200 코인</strong> & 스타터 아바타 4종 무료 지급!
          </p>
        </div>

        {/* 🔐 1. Official Cryptographic Google OAuth Login Button */}
        {onGoogleLogin && (
          <div className="mb-5 relative z-10">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onGoogleLogin();
              }}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2.5 border border-slate-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>구글 계정으로 로그인</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-700/60" />
              <span className="px-3 text-[11px] text-slate-500 font-bold">또는 닉네임 & PIN으로 이용</span>
              <div className="flex-1 border-t border-slate-700/60" />
            </div>
          </div>
        )}

        {/* 🔀 Auth Mode Toggle (로그인 vs 계정 만들기) */}
        <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-700/80 shadow-inner mb-4 relative z-10">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setAuthMode('login');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>기존 계정 로그인</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setAuthMode('register');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>계정 만들기 (신규)</span>
          </button>
        </div>

        {/* 2. PIN Login / Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 (닉네임)"
              required
              className="w-full pl-11 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
            />
          </div>

          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder={authMode === 'register' ? "비밀번호로 사용할 4자리 숫자 PIN (예: 1234)" : "4자리 숫자 PIN"}
              required
              maxLength={4}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 tracking-widest transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || pin.length < 4 || isLoading}
            className={`w-full py-4 text-white rounded-2xl font-black text-sm sm:text-base transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-2 ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600'
            }`}
          >
            <span>{authMode === 'register' ? '계정 만들고 🪙 200 코인 받기' : 'PIN으로 로그인'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 💡 PIN to Google Account Link Notification Banner */}
        <div className="mt-5 p-3.5 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl text-left relative z-10 flex items-start gap-2.5">
          <Link2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-amber-300">데이터 백업 안내</strong>: 닉네임과 PIN으로 가입한 후에도, 언제든지 <strong>[설정]</strong> 창에서 구글 계정을 연동하여 소중한 학습 기록과 코인을 안전하게 지킬 수 있습니다!
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-slate-500 text-[11px] font-medium relative z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>모든 학습 데이터는 클라우드에 실시간 안전하게 저장됩니다.</span>
        </div>

      </div>
    </div>
  );
};
