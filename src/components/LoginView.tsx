import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, User, KeyRound, UserPlus, Link2, ArrowLeft } from 'lucide-react';
import { sound } from '../services/soundService';

interface LoginViewProps {
  onLogin: (name: string, pin: string, starterAvatarId?: string) => void;
  onGoogleLogin?: () => void;
  onOpenInstallModal?: () => void;
  isLoading: boolean;
}

const STARTER_AVATARS = [
  { id: 'lion', name: '라이언', icon: '🦁', desc: '용기있는 학습자' },
  { id: 'cat', name: '냥이', icon: '🐱', desc: '호기심 많은 분석가' },
  { id: 'fire', name: '파이어', icon: '🔥', desc: '열정적인 도전자' },
  { id: 'robot', name: '로봇', icon: '🤖', desc: '철저한 문법 마스터' },
];

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onGoogleLogin,
  onOpenInstallModal,
  isLoading,
}) => {
  const [showPinRegister, setShowPinRegister] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [selectedStarterId, setSelectedStarterId] = useState('lion');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!name.trim() || !pin.trim()) return;
    onLogin(name.trim(), pin.trim(), selectedStarterId);
  };

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-6 sm:p-10 border border-slate-700/60 shadow-2xl relative overflow-hidden text-center transition-all duration-300">
        
        {/* Background Ambient Light */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Title */}
        <div className="relative z-10 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 text-amber-300 border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>AI English Mastery • PPOKAE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-2 font-serif">
            뽀개 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 font-black">PPOKAE</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-4">
            문법부터 단어, 회화 표현까지 전부 뽀개보자!<br />
            가입 즉시 <strong>🪙 200 코인</strong> & 스타터 아바타 4종 무료 지급!
          </p>

          {/* 📲 PWA 모바일 앱 무료 다운로드 / 설치 퀵 배너 */}
          {onOpenInstallModal && (
            <button
              type="button"
              onClick={() => {
                sound.playStar();
                onOpenInstallModal();
              }}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-pink-950/80 border border-indigo-500/50 hover:border-pink-400 text-white font-bold text-xs flex items-center justify-between shadow-md transition-all active:scale-95 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-base animate-bounce">📲</span>
                <span className="text-slate-200 text-left text-[11px] sm:text-xs">
                  스마트폰 앱으로 더 편하게! <strong className="text-amber-300 underline underline-offset-2">1초 무료 설치</strong>
                </span>
              </div>
              <span className="text-pink-300 font-black text-[11px] group-hover:translate-x-1 transition-transform shrink-0">
                다운로드 ➔
              </span>
            </button>
          )}
        </div>

        {!showPinRegister ? (
          /* 🌟 1. 기본 첫 화면: 깔끔한 구글 로그인 + 계정 만들기 버튼만 표시 */
          <div className="space-y-4 relative z-10">
            {onGoogleLogin && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onGoogleLogin();
                }}
                disabled={isLoading}
                className="w-full py-4 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl active:scale-95 flex items-center justify-between gap-2 border border-slate-200 group"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>구글 계정으로 로그인</span>
                </div>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-black text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                  🪙 300C 지급
                </span>
              </button>
            )}

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-700/60" />
              <span className="px-3 text-[11px] text-slate-500 font-bold">또는</span>
              <div className="flex-1 border-t border-slate-700/60" />
            </div>

            {/* 계정 생성 / PIN 로그인 버튼 (클릭 시 닉네임/PIN 입력창 열림) */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowPinRegister(true);
              }}
              className="w-full py-3.5 px-4 bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white rounded-2xl font-black text-xs sm:text-sm transition-all border border-slate-700 active:scale-95 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-purple-400" />
              <span>무료 계정 생성 / PIN 로그인</span>
            </button>
          </div>
        ) : (
          /* 📝 2. 계정 생성 / PIN 로그인 클릭 시 펼쳐지는 아이디 & PIN 입력창 및 데이터 백업 안내 */
          <div className="space-y-4 relative z-10 text-left animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-pink-400" />
                <span>계정 생성 / PIN 로그인</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowPinRegister(false);
                }}
                className="text-[11px] text-slate-400 hover:text-white font-bold flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-all"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>뒤로</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                  1. 닉네임 설정 (무료)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="원하는 닉네임 입력"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                  2. 6자리 비밀 PIN 번호
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="숫자 6자리 (예: 123456)"
                    required
                    maxLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 tracking-widest transition-all"
                  />
                </div>
              </div>

              {/* 🦁 4종 스타터 아바타 선택 섹션 */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>3. 대표 스타터 아바타 선택 (무료)</span>
                  <span className="text-[10px] text-purple-300">4종 중 택1</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {STARTER_AVATARS.map((avatar) => {
                    const isSelected = selectedStarterId === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedStarterId(avatar.id);
                        }}
                        className={`p-2 rounded-2xl border transition-all text-center flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-gradient-to-b from-purple-600/30 to-pink-600/30 border-pink-400 shadow-md shadow-pink-500/20 scale-105'
                            : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span className="text-2xl">{avatar.icon}</span>
                        <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                          {avatar.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 💡 가챠 아바타 변경 안내 */}
              <div className="p-3 bg-purple-950/50 border border-purple-500/30 rounded-2xl text-left flex items-start gap-2 shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-pink-300">아바타 & 닉네임 변경</strong>: 닉네임과 아바타는 가입 후 언제든지 <strong>[🎰 아바타 소환소]</strong>에서 전설/신화 아바타를 소환하여 무료로 자유롭게 변경할 수 있습니다!
                </p>
              </div>

              <button
                type="submit"
                disabled={!name.trim() || pin.length < 6 || isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:grayscale flex items-center justify-center gap-2"
              >
                <span>시작하기 (신규 가입 시 🪙 200 코인 지급)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* 💡 PIN 가입자 전용 데이터 백업 안내 배너 */}
            <div className="p-3 bg-indigo-950/70 border border-indigo-500/30 rounded-2xl text-left flex items-start gap-2.5 shadow-inner">
              <Link2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-amber-300">데이터 백업 안내</strong>: 가입 후 <strong>[프로필 설정]</strong>에서 구글 계정을 연동하면 학습 기록과 코인을 안전하게 영구 백업할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-500 text-[11px] font-medium relative z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
          <span>모든 학습 데이터는 클라우드에 실시간 안전하게 저장됩니다.</span>
        </div>

      </div>
    </div>
  );
};
