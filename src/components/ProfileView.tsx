import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Sparkles, 
  Check, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  Mail, 
  Target, 
  Gift, 
  Coins, 
  Lock, 
  CheckCircle2,
  BookOpen,
  Layers,
  Star,
  Crown,
  BarChart3,
  TrendingUp,
  Zap,
  Award,
  ChevronRight,
  Globe
} from 'lucide-react';
import { UserProfile, AvatarItem, AvatarGrade, FormMastery } from '../types';
import { AVATAR_DATABASE, GRADE_CONFIG, STARTER_AVATAR_IDS, generateRandomNickname } from '../services/avatarService';
import { checkIsAdmin, calculateTier } from '../services/dbService';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';

interface ProfileViewProps {
  user: UserProfile;
  masteryStats?: {
    formMasteries: FormMastery[];
    totalSolved: number;
    totalCorrect: number;
    overallAccuracy: number;
  };
  bookmarkCount?: number;
  onBack: () => void;
  onUpdateDailyGoal: (goal: number) => void;
  onRequestChangeNickname: (newName: string) => void;
  onEquipAvatar: (avatar: AvatarItem) => void;
  onOpenGachaModal: () => void;
  onDeleteAccount: () => void;
  onLinkGoogleAccount?: () => void;
  onOpenAdminCenter?: () => void;
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
  onGoAnalytics?: () => void;
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

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  masteryStats,
  bookmarkCount = 0,
  onBack,
  onUpdateDailyGoal,
  onRequestChangeNickname,
  onEquipAvatar,
  onOpenGachaModal,
  onDeleteAccount,
  onLinkGoogleAccount,
  onOpenAdminCenter,
  onOpenInstallModal,
  isStandalone = false,
  onGoAnalytics,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [name, setName] = useState<string>(user.name);
  const [dailyGoal, setDailyGoal] = useState<number>(user.dailyGoal || 10);
  const [filterMode, setFilterMode] = useState<'all' | 'owned'>('all');

  const currentXp = user.xp || 0;
  const tierInfo = calculateTier(currentXp);

  const unlockedIds = Array.isArray(user.unlockedAvatars) && user.unlockedAvatars.length > 0 
    ? Array.from(new Set([...STARTER_AVATAR_IDS, ...user.unlockedAvatars])) 
    : STARTER_AVATAR_IDS;

  const currentAvatarId = user.currentAvatarId || 'lion';

  // Sort full database by grade hierarchy
  const sortedAvatars = [...AVATAR_DATABASE].sort((a, b) => {
    return (GRADE_ORDER[a.grade] || 99) - (GRADE_ORDER[b.grade] || 99);
  });

  const displayedAvatars = filterMode === 'owned'
    ? sortedAvatars.filter(a => unlockedIds.includes(a.id))
    : sortedAvatars;

  const unlockedCount = AVATAR_DATABASE.filter(a => unlockedIds.includes(a.id)).length;

  const totalSolvedCount = masteryStats?.totalSolved ?? user.totalSolved ?? 0;
  const overallAcc = masteryStats?.overallAccuracy ?? (user.totalSolved ? Math.round(((user.totalCorrect || 0) / user.totalSolved) * 100) : 0);

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!name.trim()) return;
    if (name.trim() === user.name) return;
    onRequestChangeNickname(name.trim());
  };

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="max-w-3xl w-full glass-card rounded-[2.5rem] p-4 sm:p-8 relative border border-slate-700/60 shadow-2xl">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-700/60 pb-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="text-slate-400 hover:text-white font-bold transition-all flex items-center gap-1.5 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 text-xs sm:text-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Coin Badge */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-black text-amber-300 shadow-sm">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span>{user.coins ?? 200} {language === 'en' ? 'Coins' : '코인'}</span>
            </div>
          </div>
        </div>

        {/* 🌟 1. Current User Hero Profile Banner */}
        <div className="bg-gradient-to-br from-indigo-900/70 via-purple-950/85 to-slate-900/95 rounded-3xl p-5 sm:p-6 border border-purple-500/40 shadow-xl mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-20 h-20 rounded-3xl bg-slate-800/90 border-2 border-purple-400/50 flex items-center justify-center text-5xl shadow-[0_0_25px_rgba(168,85,247,0.4)] flex-shrink-0 animate-pulse">
                {user.avatar || '🦁'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`bg-gradient-to-r ${tierInfo.badgeColor} text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1`}>
                    <span>{tierInfo.icon}</span>
                    <span>{tierInfo.tier}</span>
                  </span>
                  <span className="bg-purple-500/20 text-purple-200 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-500/30">
                    {language === 'en' ? `Catalog ${unlockedCount} / ${AVATAR_DATABASE.length} Collected` : `아바타 도감 ${unlockedCount} / ${AVATAR_DATABASE.length} 수집`}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{user.name}</span>
                </h2>
                <p className="text-xs text-purple-200/80 font-medium">
                  {tierInfo.tier} • {currentXp.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* 🎰 Gacha Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenGachaModal();
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-[0_10px_30px_rgba(236,72,153,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 border border-pink-400/50"
            >
              <Gift className="w-4 h-4 text-yellow-200 animate-bounce" />
              <span>{language === 'en' ? 'Summon Avatars 🎰' : '아바타 가챠 소환 🎰'}</span>
            </button>
          </div>
        </div>

        {/* 📊 2. 나의 실시간 영문법 성장 대시보드 */}
        <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-indigo-500/30 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm sm:text-base font-black text-white">
                {language === 'en' ? 'My Grammar Growth Dashboard 📊' : '나의 영문법 성장 대시보드 📊'}
              </h3>
            </div>
            {onGoAnalytics && (
              <button
                onClick={() => {
                  sound.playClick();
                  onGoAnalytics();
                }}
                className="text-[11px] font-black text-indigo-300 hover:text-white flex items-center gap-1 bg-indigo-500/20 hover:bg-indigo-500/30 px-2.5 py-1 rounded-xl border border-indigo-500/40 transition-all active:scale-95"
              >
                <span>{language === 'en' ? 'View Full Analytics' : '상세 분석 보기'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Tier & XP Progress Bar */}
          <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800 mb-3.5">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-slate-300 flex items-center gap-1">
                <span>{tierInfo.icon}</span>
                <span>{language === 'en' ? 'To Next Tier' : '다음 티어 승급까지'}</span>
              </span>
              <span className="text-indigo-300 font-mono">
                {tierInfo.maxXp === Infinity 
                  ? (language === 'en' ? 'Max Master Reached 👑' : '최고 마스터 도달 👑')
                  : `${Math.max(0, tierInfo.maxXp - currentXp).toLocaleString()} XP (${tierInfo.progress}%)`}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${tierInfo.progress}%` }}
              />
            </div>
          </div>

          {/* 4-Box Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
            {/* Total Solved */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                {language === 'en' ? 'Total Solved' : '총 푼 문제'}
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {totalSolvedCount} <span className="text-xs text-slate-400 font-normal">{language === 'en' ? 'Qs' : '문제'}</span>
              </div>
            </div>

            {/* Overall Accuracy */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                {language === 'en' ? 'Accuracy' : '종합 정답률'}
              </div>
              <div className={`text-base sm:text-lg font-black ${
                overallAcc >= 90 ? 'text-emerald-400' : overallAcc >= 70 ? 'text-cyan-400' : 'text-amber-400'
              }`}>
                {overallAcc}%
              </div>
            </div>

            {/* Total Coins */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                {language === 'en' ? 'Coins' : '보유 코인'}
              </div>
              <div className="text-base sm:text-lg font-black text-amber-300">
                {user.coins ?? 200} <span className="text-xs text-amber-200/80 font-normal">🪙</span>
              </div>
            </div>

            {/* Bookmark Limit */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                {language === 'en' ? 'Bookmarks' : '즐겨찾기 보관함'}
              </div>
              <div className="text-base sm:text-lg font-black text-purple-300">
                {bookmarkCount} <span className="text-xs text-slate-400 font-normal">/ {user.bookmarkLimit || 50}</span>
              </div>
            </div>
          </div>

          {/* Mastery Quick Bar */}
          {masteryStats?.formMasteries && masteryStats.formMasteries.length > 0 && (
            <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>{language === 'en' ? 'Core Grammar Mastery Progress' : '실전 문법 문형별 숙련도 현황'}</span>
                <span className="text-[10px] text-slate-500 font-normal">{language === 'en' ? 'S-Grade (90%+) A-Grade (75%+)' : 'S등급(90%+) A등급(75%+)'}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {masteryStats.formMasteries.map(m => {
                  const gradeColor = 
                    m.grade === 'S' ? 'bg-amber-500 text-slate-950' :
                    m.grade === 'A' ? 'bg-purple-500 text-white' :
                    m.grade === 'B' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-300';

                  return (
                    <div key={m.form} className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center">
                      <div className="text-[10px] font-black text-slate-400">{language === 'en' ? `Form ${m.form}` : `${m.form}형식`}</div>
                      <div className={`text-[10px] font-black px-1 py-0.2 rounded-md my-0.5 inline-block ${gradeColor}`}>
                        {m.grade}
                      </div>
                      <div className="text-[10px] font-bold text-slate-300">{m.accuracy}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 📖 3. Avatar Collection Book */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>{language === 'en' ? 'Avatar Collection Catalog' : '아바타 컬렉션 도감'}</span>
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                {language === 'en' ? 'Scroll below to inspect and equip any avatar.' : '아래 전체 창에서 스크롤하여 모든 아바타를 확인하고 장착할 수 있습니다.'}
              </p>
            </div>

            {/* 🌟 2-Way Filter Switch */}
            <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-700/80 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setFilterMode('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  filterMode === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'en' ? `All (${AVATAR_DATABASE.length})` : `전체 도감 (${AVATAR_DATABASE.length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setFilterMode('owned');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  filterMode === 'owned'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-yellow-300" />
                <span>{language === 'en' ? `Owned (${unlockedCount})` : `보유 아바타만 (${unlockedCount})`}</span>
              </button>
            </div>
          </div>

          {/* Avatars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[420px] overflow-y-auto p-1.5 custom-scrollbar border border-slate-800/80 rounded-2xl bg-slate-950/40">
            {displayedAvatars.length === 0 ? (
              <div className="col-span-2 sm:col-span-4 py-12 text-center text-slate-400 text-xs font-medium">
                {language === 'en' ? 'No avatars owned yet. Try Avatar Summon! 🎁' : '보유한 아바타가 없습니다. [아바타 가챠 소환]으로 새로운 캐릭터를 얻어보세요! 🎁'}
              </div>
            ) : (
              displayedAvatars.map(av => {
                const isUnlocked = unlockedIds.includes(av.id);
                const isEquipped = currentAvatarId === av.id || (user.avatar === av.icon && !currentAvatarId);
                const gInfo = GRADE_CONFIG[av.grade];

                return (
                  <div
                    key={av.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between text-center relative ${
                      isUnlocked
                        ? `bg-gradient-to-br ${av.bgGradient}`
                        : 'bg-slate-900/60 border-slate-800 opacity-50 grayscale'
                    }`}
                  >
                    {/* Grade Badge */}
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${gInfo.badgeBg}`}>
                        {gInfo.name.split(' ')[0]}
                      </span>
                      {isEquipped && (
                        <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-sm">
                          {language === 'en' ? 'Equipped' : '장착 중'}
                        </span>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="text-3xl sm:text-4xl my-1 filter drop-shadow">
                      {isUnlocked ? av.icon : '🔒'}
                    </div>

                    {/* Name & Quote */}
                    <h4 className={`text-xs font-black line-clamp-1 ${isUnlocked ? av.color : 'text-slate-500'}`}>
                      {av.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 italic mt-0.5">
                      {isUnlocked ? `"${av.quote}"` : `${language === 'en' ? 'Rate' : '확률'} ${gInfo.dropRate}`}
                    </p>

                    {/* Equip Button */}
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      {isUnlocked ? (
                        isEquipped ? (
                          <button
                            disabled
                            className="w-full py-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl text-[11px] font-bold border border-emerald-500/30 flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{language === 'en' ? 'Equipped' : '장착됨'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playClick();
                              onEquipAvatar(av);
                            }}
                            className="w-full py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-[11px] font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                          >
                            <span>{language === 'en' ? 'Equip' : '장착하기'}</span>
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onOpenGachaModal();
                          }}
                          className="w-full py-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[11px] font-medium transition-all flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Lock className="w-3 h-3" />
                          <span>{language === 'en' ? 'Summon in Gacha' : '가챠에서 획득'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 👑 Master Admin Command Center Card */}
        {checkIsAdmin(user) && onOpenAdminCenter && (
          <div className="bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-pink-500/20 border-2 border-amber-500/50 rounded-2xl p-4 mb-5 text-left shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-sm font-black text-amber-300">👑 Master Admin Center</span>
              </div>
              <span className="text-[10px] bg-amber-500/30 text-amber-200 font-black px-2.5 py-0.5 rounded-full border border-amber-400/40">
                God Mode Available
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              {language === 'en' ? 'Unlock unlimited coins, manage database, and control game economics.' : '무제한 코인 충전, 전 아바타 올 언락, 실시간 게임 경제/보상 배율 제어, 전체 푸시 공지 발송 및 유저 DB 관리 사령탑을 엽니다.'}
            </p>
            <button
              onClick={() => {
                sound.playReward();
                onOpenAdminCenter();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>👑 {language === 'en' ? 'Open Master Admin Center' : '관리자 사령탑 열기 (God Mode)'}</span>
            </button>
          </div>
        )}

        {/* 🔐 Google Account Linked Status */}
        {user.email ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 mb-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-emerald-300">{language === 'en' ? 'Google Account Linked (Cloud Protected)' : '구글 계정 연동 완료 (데이터 영구 보호 중)'}</div>
                <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-1 rounded-full border border-emerald-500/30">
              ✓ {language === 'en' ? 'Protected' : '보호됨'}
            </span>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-950/90 via-purple-950/80 to-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 mb-5 text-left shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                {language === 'en' ? 'Link Google Account for Cloud Sync' : '구글 계정 연동으로 데이터 지키기'}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                {language === 'en' ? 'PIN Account' : 'PIN 간편 계정'}
              </span>
            </div>
            <p className="text-slate-300 text-xs mb-3 leading-relaxed">
              {language === 'en'
                ? 'Currently using PIN account. Link your Google account to ensure your coins, avatars, and review notes are safely backed up to the cloud!'
                : '현재 PIN으로 로그인 중입니다. 구글 계정을 연동해 두시면 기기를 변경하거나 캐시가 삭제되어도 코인, 아바타 도감, 오답 노트가 100% 안전하게 복구됩니다!'}
            </p>
            {onLinkGoogleAccount && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onLinkGoogleAccount();
                }}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 border border-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{language === 'en' ? 'Link Google Account Now' : '지금 구글 계정 연동하고 데이터 영구 백업'}</span>
              </button>
            )}
          </div>
        )}

        {/* ✏️ Nickname Change Form */}
        <form onSubmit={handleNicknameSubmit} className="bg-slate-900/80 rounded-2xl p-3.5 sm:p-4 border border-slate-800 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
              {language === 'en' ? 'Change Nickname (🪙 30 Coins)' : '닉네임 변경 (🪙 30 코인 소모)'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-normal">{language === 'en' ? 'Current: ' : '현재: '}{user.name}</span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setName(generateRandomNickname());
                }}
                className="text-[10px] font-bold text-purple-300 hover:text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 px-2 py-0.5 rounded-lg border border-purple-500/40 transition-all flex items-center gap-1 active:scale-95"
              >
                <span>🎲 {language === 'en' ? 'Random' : '랜덤 추천'}</span>
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-purple-400 transition-all"
              placeholder={language === 'en' ? 'Enter new nickname' : '새로운 닉네임 입력 (최대 12자)'}
              maxLength={12}
            />
            <button
              type="submit"
              disabled={!name.trim() || name.trim() === user.name}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-40 disabled:grayscale text-white rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-1 shrink-0"
            >
              <Coins className="w-3.5 h-3.5 text-yellow-300" />
              <span>{language === 'en' ? 'Update (🪙 30)' : '변경 (🪙 30)'}</span>
            </button>
          </div>
        </form>

        {/* 🌐 앱 기본 언어 설정 */}
        <div className="mb-5 bg-slate-900/80 rounded-2xl p-3.5 sm:p-4 border border-slate-800">
          <label className="block text-xs font-black text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('languageSetting')}</span>
            </div>
            <span className="text-[11px] text-cyan-300 font-bold">
              {language === 'en' ? 'English 🇺🇸' : '한국어 🇰🇷'}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setLanguage('ko');
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                language === 'ko'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white shadow-md font-black'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <span>🇰🇷 한국어 (Korean)</span>
              {language === 'ko' && <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setLanguage('en');
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                language === 'en'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 text-white shadow-md font-black'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <span>🇺🇸 English (영어)</span>
              {language === 'en' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-left">
            * {t('languageDesc')}
          </p>
        </div>

        {/* 🎯 Daily Study Goal */}
        <div className="mb-5">
          <label className="block text-xs font-black text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('dailyGoalSetting')}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 20].map((goal) => (
              <button
                type="button"
                key={goal}
                onClick={() => {
                  sound.playClick();
                  setDailyGoal(goal);
                  onUpdateDailyGoal(goal);
                }}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                  dailyGoal === goal
                    ? 'bg-indigo-500 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {language === 'en' ? `${goal} Qs / Day` : `하루 ${goal}문제`}
              </button>
            ))}
          </div>
        </div>

        {/* 📲 스마트폰 정식 앱 설치 안내 */}
        {!isStandalone && onOpenInstallModal && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/70 to-slate-900 border border-indigo-500/40 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🪐</span>
              <div>
                <span className="text-xs font-black text-white block">{language === 'en' ? 'Install Official Mobile App' : '스마트폰 정식 앱 설치'}</span>
                <span className="text-[11px] text-slate-300">{language === 'en' ? 'Fullscreen experience without browser bar' : '주소창 없는 전체화면 & 1초 실행'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playStar();
                onOpenInstallModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 shrink-0"
            >
              <span>{language === 'en' ? 'Install' : '설치 안내'}</span>
            </button>
          </div>
        )}

        {/* 🗑️ Google Play Required Policy: Account Deletion */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              sound.playClick();
              onDeleteAccount();
            }}
            className="text-xs text-slate-500 hover:text-rose-400 transition-colors underline underline-offset-4"
          >
            {language === 'en' ? 'Delete Account and erase all study data' : '회원 탈퇴 및 모든 학습 데이터 영구 삭제'}
          </button>
        </div>

      </div>
    </div>
  );
};
