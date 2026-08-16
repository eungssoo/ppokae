import React, { useState } from 'react';
import { Sparkles, CheckCircle2, User, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { UserProfile } from '../types';
import { AVATAR_DATABASE } from '../services/avatarService';
import { sound } from '../services/soundService';

interface InitialProfileSetupModalProps {
  isOpen: boolean;
  user: UserProfile;
  onSave: (newName: string, starterAvatarId: string) => Promise<void>;
  isLoading: boolean;
}

const STARTER_AVATARS = [
  { id: 'lion', name: '라이언', icon: '🦁', desc: '용기있는 학습자', color: 'from-amber-400 to-orange-500' },
  { id: 'cat', name: '냥이', icon: '🐱', desc: '호기심 많은 분석가', color: 'from-pink-400 to-rose-500' },
  { id: 'fire', name: '파이어', icon: '🔥', desc: '열정적인 도전자', color: 'from-red-500 to-amber-500' },
  { id: 'robot', name: '로봇', icon: '🤖', desc: '철저한 문법 마스터', color: 'from-cyan-400 to-blue-500' },
];

export const InitialProfileSetupModal: React.FC<InitialProfileSetupModalProps> = ({
  isOpen,
  user,
  onSave,
  isLoading,
}) => {
  const [name, setName] = useState<string>(user?.name || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(user?.currentAvatarId || 'lion');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.currentAvatarId) setSelectedAvatarId(user.currentAvatarId);
  }, [user?.name, user?.currentAvatarId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('닉네임을 입력해 주세요.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 12) {
      setError('닉네임은 2자 이상 12자 이하로 입력해 주세요.');
      return;
    }
    setError('');
    await onSave(trimmed, selectedAvatarId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-6 sm:p-8 border border-purple-500/40 shadow-2xl relative overflow-hidden text-center">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 text-amber-300 border border-amber-500/40">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
          <span>최초 1회 무료 프로필 설정</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
          환영합니다! 🎉
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm font-medium mb-5">
          뽀개에서 활동할 <strong className="text-amber-300">나만의 닉네임</strong>과 <strong className="text-purple-300">대표 캐릭터</strong>를 선택하세요! (최초 1회 무료)
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* 1. Nickname Input */}
          <div>
            <label className="block text-xs font-black text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>활동 닉네임 설정</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">무료 변경</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              maxLength={12}
              placeholder="멋진 닉네임을 입력하세요 (2~12자)"
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl text-white font-bold text-sm transition-all outline-none"
            />
            {error && (
              <p className="text-rose-400 text-xs font-bold mt-1.5">
                {error}
              </p>
            )}
          </div>

          {/* 2. Starter Avatar Selection */}
          <div>
            <label className="block text-xs font-black text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>대표 스타터 아바타 선택</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {STARTER_AVATARS.map((av) => {
                const isSelected = selectedAvatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatarId(av.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex items-center gap-2.5 ${
                      isSelected 
                        ? 'bg-indigo-500/20 border-indigo-400 shadow-lg scale-[1.02]' 
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="text-3xl flex-shrink-0">
                      {av.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white flex items-center gap-1">
                        <span>{av.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 ml-auto" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">
                        {av.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bonus Coins Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-amber-200">
            <span className="text-2xl animate-bounce">🪙</span>
            <div>
              <span className="font-black text-amber-300">구글 가입 특별 웰컴 보너스</span>
              <p className="text-[11px] text-amber-200/90">
                기본 200C + 구글 보너스 100C = 총 <strong className="text-yellow-300 font-black text-xs">🪙 300 코인</strong> 지급!
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-2xl font-black text-sm sm:text-base shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? '저장하는 중...' : '설정 완료하고 뽀개 시작하기'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
