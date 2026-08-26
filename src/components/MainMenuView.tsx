import React from 'react';
import { 
  Trophy, 
  Flame, 
  Factory, 
  PenTool, 
  Target, 
  Crown, 
  BookOpen, 
  AlertTriangle, 
  ClipboardList, 
  LogOut, 
  Sparkles,
  ArrowRight,
  Clock,
  Coins,
  Star,
  BarChart3,
  User,
  Zap,
  BookMarked,
  Smartphone,
  Bell,
  MessageSquare,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile, ViewType, CycleInfo } from '../types';
import { calculateTier, checkIsAdmin, getCycleStatusText } from '../services/dbService';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';
import { useTheme } from '../services/themeService';

interface MainMenuViewProps {
  user: UserProfile;
  totalPublicQuestions: number;
  currentCycle: CycleInfo;
  bookmarkCount?: number;
  unreadNotificationCount?: number;
  isStandalone?: boolean;
  onNavigate: (view: ViewType) => void;
  onStartDailyChallenge: () => void;
  onOpenGachaModal?: () => void;
  onOpenInquiryModal?: () => void;
  onOpenInstallModal?: () => void;
  onOpenReportCenter?: () => void;
  onOpenAdminCenter?: () => void;
  onLogout: () => void;
}

export const MainMenuView: React.FC<MainMenuViewProps> = ({
  user,
  totalPublicQuestions,
  currentCycle,
  bookmarkCount = 0,
  isStandalone = false,
  onNavigate,
  onStartDailyChallenge,
  onOpenGachaModal,
  onOpenInquiryModal,
  onOpenInstallModal,
  onOpenReportCenter,
  onOpenAdminCenter,
  onLogout,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const currentXp = user.xp || 0;
  const tierInfo = calculateTier(currentXp);
  const isAdmin = checkIsAdmin(user);

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="max-w-3xl w-full glass-card rounded-[2.5rem] p-5 sm:p-8 relative border border-slate-700/60 shadow-2xl">
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 border-b border-slate-700/60 pb-3.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* ⚡ App Brand Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30">
              <span className="text-xs sm:text-sm">⚡</span>
              <span className="text-xs font-black text-indigo-200 font-sans tracking-wide">
                {language === 'en' ? 'Ppokae AI English' : '뽀개 AI 영어'}
              </span>
            </div>

            {/* 👑 마스터 관리자 사령탑 버튼 (관리자만 노출) */}
            {isAdmin && onOpenAdminCenter && (
              <button
                onClick={() => {
                  sound.playReward();
                  onOpenAdminCenter();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-[11px] sm:text-xs shadow-md border border-amber-200 active:scale-95 transition-all"
                title="마스터 관리자 사령탑 열기"
              >
                <Crown className="w-3 h-3 fill-slate-950" />
                <span>{language === 'en' ? 'Admin' : '관리자'}</span>
              </button>
            )}

            {/* User Profile Button */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('profile_view');
              }}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 px-2.5 sm:px-3 py-1 rounded-full shadow-sm transition-all active:scale-95 text-left"
              title={t('myProfile')}
            >
              <span className="text-sm sm:text-base">{user.avatar || '🤖'}</span>
              <span className="text-xs font-bold text-white tracking-tight">{user.name}</span>
              <span className={`bg-gradient-to-r ${tierInfo.badgeColor} text-white font-black text-[9px] px-1.5 py-0.2 rounded-full`}>
                {tierInfo.tier}
              </span>
            </button>

            {/* 🪙 코인 잔액 배지 */}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full shadow-sm">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-black text-amber-300">
                {user.coins ?? 200}
                <span className="text-[10px] font-normal text-amber-200/80 ml-0.5">🪙</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">

            {/* ☀️ / 🌙 테마 전환 버튼 (Dark / Light) */}
            <button
              onClick={() => {
                sound.playClick();
                toggleTheme();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/90 hover:border-amber-400 text-slate-300 hover:text-white font-black text-xs shadow-sm active:scale-95 transition-all"
              title={theme === 'dark' ? '밝은 테마로 전환' : '다크 모드로 전환'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>☀️</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>🌙</span>
                </>
              )}
            </button>

            {/* 🌐 언어 전환 버튼 (KO / EN) */}
            <button
              onClick={() => {
                sound.playClick();
                setLanguage(language === 'ko' ? 'en' : 'ko');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/90 hover:border-cyan-400 text-slate-300 hover:text-white font-black text-xs shadow-sm active:scale-95 transition-all"
              title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ko' ? '🇺🇸 EN' : '🇰🇷 한'}</span>
            </button>

            {/* 💌 문의하기 / 피드백 Quick Button */}
            {onOpenInquiryModal && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenInquiryModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/90 hover:border-indigo-400 text-slate-300 hover:text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
                title="문의 및 피드백"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('inquiryBtn')}</span>
              </button>
            )}

            {/* 🌟 아바타 컬렉션 & 보상 소환 Quick Button */}
            {onOpenGachaModal && (
              <button
                onClick={() => {
                  sound.playStar();
                  onOpenGachaModal();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-sm border border-indigo-400/40 active:scale-95 transition-all"
                title="아바타 보상 컬렉션"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                <span>{language === 'en' ? 'Avatars' : '아바타 보상'}</span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              className="flex items-center justify-center p-2 text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 rounded-xl transition-all"
              title={t('logout')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 🏆 1. Top Hero Card: 실시간 랭킹 챌린지 (신뢰감 있는 에듀테크 스타일) */}
        <div className="w-full mb-4 p-5 sm:p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-indigo-900/90 dark:via-indigo-950 dark:to-slate-900 rounded-[2.2rem] shadow-xl border border-indigo-400/50 dark:border-indigo-500/40 text-left relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          {/* Cycle Status & Countdown */}
          {(() => {
            const status = getCycleStatusText(currentCycle, language);
            return (
              <div className="inline-flex items-center gap-1.5 bg-black/25 dark:bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white mb-3 border border-white/20 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>{status.inProgressText}</span>
                <span className="bg-indigo-500 text-white px-2 py-0.2 rounded-full text-[10px] font-black">
                  {status.remainingText}
                </span>
              </div>
            );
          })()}

          {/* Title & Desc */}
          <div className="relative z-10 flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-300" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t('rankingHeroTitle')}
              </h2>
            </div>
            <span className="text-2xl">🔥</span>
          </div>
          
          <p className="relative z-10 text-indigo-100 font-medium text-xs sm:text-sm leading-relaxed mb-4">
            {t('rankingHeroDesc')}
          </p>

          {/* ⚔️ Dual Action Buttons inside Ranking Card */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* 1. 랭킹전 풀기 버튼 */}
            <button
              onClick={() => {
                sound.playClick();
                onStartDailyChallenge();
              }}
              className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
            >
              <span>{language === 'en' ? 'Start 10 Qs Challenge' : '10문제 랭킹 챌린지 도전'}</span>
              <ArrowRight className="w-4 h-4 text-slate-900 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {/* 2. 명예의 전당 (순위표) 바로가기 버튼 */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('ranking_board');
              }}
              className="py-3 px-4 bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm rounded-2xl border border-white/30 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 backdrop-blur-md group/btn"
            >
              <Crown className="w-4 h-4 text-amber-300 fill-amber-300 group-hover/btn:scale-110 transition-transform" />
              <span>{language === 'en' ? 'Live Leaderboard 👑' : '실시간 명예의 전당 👑'}</span>
              <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* 📊 1.5. 나의 실시간 티어 & 성장 대시보드 (Highlight Growth & Tier Progress) */}
        <div 
          onClick={() => {
            sound.playClick();
            onNavigate('analytics_view');
          }}
          className="w-full mb-5 cursor-pointer group p-4 sm:p-5 bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-white dark:from-indigo-950/70 dark:via-purple-950/80 dark:to-slate-900/90 rounded-[2rem] border border-indigo-200 dark:border-indigo-500/40 hover:border-indigo-400 shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all text-left relative overflow-hidden active:scale-[0.99]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-md flex-shrink-0">
                {tierInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-indigo-800 dark:text-purple-300">
                    {t('myGrowthReport')}
                  </span>
                  <span className={`bg-gradient-to-r ${tierInfo.badgeColor} text-white font-black text-[10px] px-2 py-0.2 rounded-full`}>
                    {tierInfo.tier}
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {language === 'en' 
                    ? `Total ${currentXp.toLocaleString()} XP • Accuracy ${user.totalSolved ? Math.round(((user.totalCorrect || 0) / user.totalSolved) * 100) : 100}%`
                    : `누적 ${currentXp.toLocaleString()} XP • 정답률 ${user.totalSolved ? Math.round(((user.totalCorrect || 0) / user.totalSolved) * 100) : 100}%`}
                </div>
              </div>
            </div>

            <div className="text-xs font-black text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-900 dark:group-hover:text-white flex items-center gap-1 bg-indigo-100 dark:bg-indigo-500/20 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/40 transition-all">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t('growthDashboardBtn')}</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-950/80 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${tierInfo.progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-mono">
            <span>{tierInfo.tier}</span>
            <span>
              {tierInfo.maxXp === Infinity 
                ? t('maxTierReached')
                : `${Math.max(0, tierInfo.maxXp - currentXp).toLocaleString()} ${t('xpRemaining')} (${tierInfo.progress}%)`}
            </span>
          </div>
        </div>

        {/* 📲 정식 모바일 앱 설치 안내 배너 (웹 브라우저에서만 표시) */}
        {!isStandalone && onOpenInstallModal && (
          <div className="mb-4">
            <button
              onClick={() => {
                sound.playStar();
                onOpenInstallModal();
              }}
              className="w-full p-3 sm:p-3.5 rounded-2xl bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-950/80 dark:via-purple-950/80 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/50 hover:border-pink-400 flex items-center justify-between shadow-sm transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-lg shadow-md shrink-0">
                  🪐
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{t('pwaInstallTitle')}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {t('pwaInstallDesc')}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white font-black text-xs shrink-0 shadow-md flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t('installNow')}</span>
              </span>
            </button>
          </div>
        )}

        {/* 🚀 2. Core Study Hub: 핵심 학습 존 */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-black uppercase tracking-wider mb-2.5 px-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'Core Study & Practice' : '실전 문제 풀이 (Study & Practice)'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* A. 1일 문법 챌린지 */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('solve_select');
              }}
              className="group p-4 sm:p-5 bg-gradient-to-br from-emerald-950/60 to-slate-900/90 hover:from-emerald-900/70 hover:to-slate-800/90 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-3xl transition-all shadow-md hover:-translate-y-0.5 active:scale-[0.98] text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">✍️</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {language === 'en' ? 'On Correct +5 Coins' : '정답 시 +5 코인'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mb-0.5 group-hover:text-emerald-300 transition-colors">
                {t('dailyChallengeTitle')}
              </h3>
              <p className="text-emerald-200/70 text-xs font-medium leading-relaxed">
                {t('dailyChallengeDesc')}
              </p>
            </button>

            {/* B. 원어민 표현 마스터 */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('expression_select');
              }}
              className="group p-4 sm:p-5 bg-gradient-to-br from-purple-950/60 to-slate-900/90 hover:from-purple-900/70 hover:to-slate-800/90 border-2 border-purple-500/40 hover:border-purple-400 rounded-3xl transition-all shadow-md hover:-translate-y-0.5 active:scale-[0.98] text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🌟</span>
                <span className="bg-purple-500/20 text-purple-200 border border-purple-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {language === 'en' ? 'Drama • Office • Native' : '미드 • 비즈니스 • 꿀패턴'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mb-0.5 group-hover:text-purple-300 transition-colors">
                {t('expressionLabHeroTitle')}
              </h3>
              <p className="text-purple-200/70 text-xs font-medium leading-relaxed">
                {t('expressionLabHeroDesc')}
              </p>
            </button>

            {/* C. 내 약점 퀴즈 */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('solve_personal_select');
              }}
              className="group p-4 sm:p-5 bg-slate-800/60 hover:bg-rose-500/10 border border-slate-700/80 hover:border-rose-500/40 rounded-2xl transition-all shadow-sm hover:shadow-md text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {t('weaknessHeroTitle')}
                    </h3>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  {t('weaknessHeroDesc')}
                </p>
              </div>
            </button>

            {/* D. 내 즐겨찾기 보관함 */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('bookmark_view');
              }}
              className="group p-4 sm:p-5 bg-slate-800/60 hover:bg-amber-500/10 border border-slate-700/80 hover:border-amber-500/40 rounded-2xl transition-all shadow-sm hover:shadow-md text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <h3 className="text-sm sm:text-base font-extrabold text-amber-200">
                      {t('bookmarkHeroTitle')}
                    </h3>
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                    {bookmarkCount}{language === 'en' ? ' saved' : '개'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  {t('bookmarkHeroDesc')}
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* 🏭 🔥 AI 문제 공장 강조 하이라이트 배너 */}
        <div className="mb-5">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('generate');
            }}
            className="w-full group p-4 sm:p-5 bg-gradient-to-r from-blue-950/70 via-indigo-950/80 to-purple-950/70 hover:from-blue-900/80 hover:to-indigo-900/80 border-2 border-indigo-500/50 hover:border-indigo-400 rounded-3xl transition-all shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-[0.99] text-left flex items-center justify-between gap-3 relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 relative z-10 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-2xl shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                🏭
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-cyan-200 transition-colors">
                    {language === 'en' ? 'AI Question Factory (40 Qs Generator) 🏭' : 'AI 맞춤 문제 공장 (40문제 대량 생산) 🏭'}
                  </h3>
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black px-2 py-0.2 rounded-full">
                    {language === 'en' ? 'Infinite Questions' : '무제한 출제 지원'}
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-medium line-clamp-1">
                  {language === 'en'
                    ? '1-Click generates 40 high-yield questions for TOEIC, Transfer, or CSAT levels instantly ➔'
                    : '토익/편입/수능 원하는 난이도를 선택하면 AI가 1클릭으로 고품질 40문제를 즉시 출제합니다 ➔'}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 relative z-10 flex items-center gap-1 text-xs font-black text-cyan-300 bg-slate-900/90 px-3 py-2 rounded-2xl border border-indigo-500/40 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <span>{language === 'en' ? 'Produce Now' : '공장 가동'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* ⚡ 듀얼 특강 존: [문법 딸깍 보관소] + [💬 채팅 영어 & 슬랭 라운지] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          
          {/* 1. 문법 딸깍 보관소 */}
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('grammar_skill_vault');
            }}
            className="group p-4 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 hover:from-amber-900/50 border border-amber-500/40 hover:border-amber-400 rounded-3xl transition-all shadow-md hover:-translate-y-0.5 active:scale-[0.99] text-left flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⚡</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                3초 정답 공식
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-200 transition-colors mb-0.5">
              {language === 'en' ? 'Grammar Click & Solve Vault ⚡' : '문법 딸깍 보관소 ⚡'}
            </h3>
            <p className="text-slate-300 text-xs line-clamp-1">
              {language === 'en' ? 'Instant 3-sec slot rules & killer shortcuts' : '빈칸 앞뒤 보고 3초 만에 찍는 실전 공식 12선'}
            </p>
          </button>

          {/* 2. 채팅 영어 & 슬랭 라운지 */}
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('chat_english');
            }}
            className="group p-4 bg-gradient-to-br from-pink-950/40 via-slate-900 to-slate-900 hover:from-pink-900/50 border border-pink-500/40 hover:border-pink-400 rounded-3xl transition-all shadow-md hover:-translate-y-0.5 active:scale-[0.99] text-left flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💬</span>
              <span className="bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                줄임말 & 대화체
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-pink-200 transition-colors mb-0.5">
              {language === 'en' ? 'Chat English & Slang Lounge 💬' : '채팅 영어 & 슬랭 라운지 💬'}
            </h3>
            <p className="text-slate-300 text-xs line-clamp-1">
              {language === 'en' ? 'Master tbh, idk, ngl & texting slang' : '외국인 필수 줄임말(tbh, ngl, fr) 톡 시뮬레이션'}
            </p>
          </button>

        </div>

        {/* 📊 3. Analytics & Utility Hub: 학습 분석 & 도구 */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-black uppercase tracking-wider mb-2.5 px-1">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'en' ? 'Analytics & Tools' : '학습 분석 & 문제 관리 (Analytics & Tools)'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
            
            {/* 🌟 아바타 보상 컬렉션 */}
            <button
              onClick={() => {
                sound.playStar();
                if (onOpenGachaModal) onOpenGachaModal();
                else onNavigate('profile_view');
              }}
              className="p-3.5 bg-slate-800/70 hover:bg-indigo-500/10 border border-slate-700/90 hover:border-indigo-400 rounded-2xl transition-all text-left flex items-center justify-between shadow-sm group active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">🌟</span>
                  <h4 className="text-xs font-black text-indigo-200">
                    {language === 'en' ? 'Avatar Collection' : '아바타 보상 소환'}
                  </h4>
                </div>
                <p className="text-slate-400 text-[10px]">
                  {language === 'en' ? 'Special Ranks & Avatars' : '레전드 & 스페셜 아바타'}
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </button>

            {/* 명예의 전당 */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('ranking_board');
              }}
              className="p-3.5 bg-slate-800/60 hover:bg-amber-500/10 border border-slate-700/80 rounded-2xl transition-all text-left flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-extrabold text-amber-200">
                    {language === 'en' ? 'Hall of Fame' : '명예의 전당'}
                  </h4>
                </div>
                <p className="text-slate-400 text-[10px]">
                  {language === 'en' ? 'Live Rankings Leaderboard' : '1/2/3차전 랭킹 순위'}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

          </div>

          {/* 3-Mini buttons: 전체 문제집 / 약점 분석 / 오답 노트 */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('db_view');
              }}
              className="p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all text-center"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
              <span className="text-[11px] font-bold text-slate-300 block">
                {language === 'en' ? 'Public Bank' : '전체 문제집'}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('weakness_view');
              }}
              className="p-2.5 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 rounded-xl transition-all text-center"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mx-auto mb-0.5" />
              <span className="text-[11px] font-bold text-rose-300 block">
                {language === 'en' ? 'Weakness' : '약점 진단'}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('incorrect_list');
              }}
              className="p-2.5 bg-slate-900/60 hover:bg-amber-500/10 border border-slate-800 rounded-xl transition-all text-center"
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
              <span className="text-[11px] font-bold text-amber-300 block">
                {t('incorrectHeroTitle')}
              </span>
            </button>
          </div>

          {/* 📋 AI 문제 검수 & 보상 센터 버튼 */}
          {onOpenReportCenter && (
            <div className="mt-3">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenReportCenter();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-950/40 via-purple-950/50 to-slate-900 hover:from-rose-900/50 hover:to-purple-900/50 border border-rose-500/30 hover:border-rose-500/50 rounded-2xl transition-all flex items-center justify-between text-left group active:scale-98 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📋</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-rose-200 group-hover:text-rose-100 flex items-center gap-1.5">
                      <span>{language === 'en' ? 'AI Review & Report Rewards' : 'AI 문제 검수 & 제보 보상함'}</span>
                      <span className="bg-rose-500/20 text-rose-300 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-rose-500/30">
                        {language === 'en' ? 'Audit at 00:00 (🪙 50)' : '00시 심사 (🪙 50)'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {language === 'en' 
                        ? 'Check your error reports and claim coin rewards'
                        : '내가 제보한 문제의 AI 검수 결과 확인 및 보상 코인 받기'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
