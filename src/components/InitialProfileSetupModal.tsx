import React, { useState } from 'react';
import { Sparkles, CheckCircle2, User, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { generateRandomNickname } from '../services/avatarService';
import { sound } from '../services/soundService';
import { validateNicknameWithAI } from '../services/geminiService';
import { useLanguage } from '../services/i18n';

interface InitialProfileSetupModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onSave: (newName: string, starterAvatarId: string) => Promise<void>;
  isLoading: boolean;
}

export const InitialProfileSetupModal: React.FC<InitialProfileSetupModalProps> = ({
  isOpen,
  user,
  onSave,
  isLoading,
}) => {
  const { language, t } = useLanguage();
  const [name, setName] = useState<string>(user?.name || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(user?.currentAvatarId || 'lion');
  const [error, setError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  const STARTER_AVATARS = language === 'en' ? [
    { id: 'lion', name: 'Lion', icon: '🦁', desc: 'Brave Learner' },
    { id: 'cat', name: 'Kitty', icon: '🐱', desc: 'Curious Analyst' },
    { id: 'fire', name: 'Fire', icon: '🔥', desc: 'Passionate Challenger' },
    { id: 'robot', name: 'Robot', icon: '🤖', desc: 'Grammar Master' },
  ] : [
    { id: 'lion', name: '라이언', icon: '🦁', desc: '용기있는 학습자' },
    { id: 'cat', name: '냥이', icon: '🐱', desc: '호기심 많은 분석가' },
    { id: 'fire', name: '파이어', icon: '🔥', desc: '열정적인 도전자' },
    { id: 'robot', name: '로봇', icon: '🤖', desc: '철저한 문법 마스터' },
  ];

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
      setError(language === 'en' ? 'Please enter a nickname.' : '닉네임을 입력해 주세요.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 12) {
      setError(language === 'en' ? 'Nickname must be between 2 and 12 characters.' : '닉네임은 2자 이상 12자 이하로 입력해 주세요.');
      return;
    }

    setError('');
    setIsValidating(true);
    const val = await validateNicknameWithAI(trimmed);
    setIsValidating(false);

    if (!val.isValid) {
      setError(val.reason || (language === 'en' ? 'Inappropriate nicknames are not allowed.' : '부적절한 단어가 포함된 닉네임은 사용할 수 없습니다.'));
      return;
    }

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
          <span>{language === 'en' ? 'One-Time Free Profile Setup' : '최초 1회 무료 프로필 설정'}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
          {language === 'en' ? 'Welcome to Ppokae! 🎉' : '환영합니다! 🎉'}
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm font-medium mb-5">
          {language === 'en'
            ? 'Choose your nickname and starter avatar to begin your journey!'
            : '뽀개에서 활동할 나만의 닉네임과 대표 캐릭터를 선택하세요! (최초 1회 무료)'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* 1. Nickname Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'en' ? 'Set Nickname' : '활동 닉네임 설정'}</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">{language === 'en' ? 'Free' : '무료 변경'}</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  const randName = generateRandomNickname();
                  setName(randName);
                  if (error) setError('');
                }}
                className="text-[11px] font-bold text-indigo-300 hover:text-indigo-200 bg-indigo-500/20 hover:bg-indigo-500/30 px-2.5 py-1 rounded-xl border border-indigo-500/40 transition-all flex items-center gap-1 active:scale-95"
              >
                <span>🎲 {language === 'en' ? 'Random' : '랜덤 생성'}</span>
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              maxLength={12}
              placeholder={language === 'en' ? 'Enter a cool nickname (2~12 chars)' : '멋진 닉네임을 입력하세요 (2~12자)'}
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
              <span>{language === 'en' ? 'Choose Starter Avatar' : '대표 스타터 아바타 선택'}</span>
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
                    <span className="text-3xl filter drop-shadow">{av.icon}</span>
                    <div>
                      <div className="text-xs font-black text-white">{av.name}</div>
                      <div className="text-[10px] text-slate-400">{av.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isValidating}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading || isValidating ? (language === 'en' ? 'Saving...' : '저장하는 중...') : (language === 'en' ? 'Start Learning' : '시작하기')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
