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
  BookMarked
} from 'lucide-react';
import { UserProfile, ViewType, CycleInfo } from '../types';
import { calculateTier, checkIsAdmin } from '../services/dbService';
import { sound } from '../services/soundService';

interface MainMenuViewProps {
  user: UserProfile;
  totalPublicQuestions: number;
  currentCycle: CycleInfo;
  bookmarkCount?: number;
  onNavigate: (view: ViewType) => void;
  onStartDailyChallenge: () => void;
  onOpenReportCenter?: () => void;
  onOpenAdminCenter?: () => void;
  onLogout: () => void;
}

export const MainMenuView: React.FC<MainMenuViewProps> = ({
  user,
  totalPublicQuestions,
  currentCycle,
  bookmarkCount = 0,
  onNavigate,
  onStartDailyChallenge,
  onOpenReportCenter,
  onOpenAdminCenter,
  onLogout,
}) => {
  const currentXp = user.xp || 0;
  const tierInfo = calculateTier(currentXp);
  const isAdmin = checkIsAdmin(user);

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="max-w-3xl w-full glass-card rounded-[2.5rem] p-5 sm:p-8 relative border border-slate-700/60 shadow-2xl">
        
        {/* Top Header Bar */}
        <div className="flex justify-between items-center mb-5 border-b border-slate-700/60 pb-3.5">
          <div className="flex items-center gap-2">
            {/* ⚡ App Brand Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-500/40 mr-1">
              <span className="text-sm">⚡</span>
              <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300 font-serif">
                뽀개
              </span>
            </div>

            {/* 👑 마스터 관리자 사령탑 버튼 (관리자만 노출) */}
            {isAdmin && onOpenAdminCenter && (
              <button
                onClick={() => {
                  sound.playReward();
                  onOpenAdminCenter();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/40 border border-amber-200 active:scale-95 transition-all animate-pulse"
                title="마스터 관리자 사령탑 열기"
              >
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                <span>👑 관리자 사령탑</span>
              </button>
            )}

            {/* User Profile Button */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('profile_view');
              }}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 px-3.5 py-1.5 rounded-full shadow-sm transition-all active:scale-95 text-left"
              title="내 프로필 관리"
            >
              <span className="text-base">{user.avatar || '🤖'}</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">{user.name}님</span>
              <span className={`bg-gradient-to-r ${tierInfo.badgeColor} text-white font-black text-[9px] px-1.5 py-0.2 rounded-full`}>
                {tierInfo.tier}
              </span>
            </button>

            {/* 🪙 코인 잔액 배지 */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full shadow-sm">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs sm:text-sm font-black text-amber-300">
                {user.coins ?? 200}
                <span className="text-[10px] font-normal text-amber-200/80 ml-0.5">코인</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Growth Analytics Quick Button */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('analytics_view');
              }}
              className="p-2 text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-all"
              title="성장 분석 대시보드"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 px-2.5 py-2 rounded-xl transition-all"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 🏆 1. Top Hero Card: 실시간 랭킹전 (최상단 강조) */}
        <button
          onClick={() => {
            sound.playClick();
            onStartDailyChallenge();
          }}
          className="w-full mb-5 group p-5 sm:p-6 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 rounded-[2rem] transition-all shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_15px_40px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 active:scale-[0.99] text-left relative overflow-hidden border border-orange-400/40"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white mb-2.5 border border-white/20">
            <Clock className="w-3.5 h-3.5 text-yellow-200" />
            <span>현재 {currentCycle.cycleName} 진행 중</span>
            <span className="bg-rose-500 text-white px-2 py-0.2 rounded-full text-[10px] font-black">
              {currentCycle.remainingTimeFormatted}
            </span>
          </div>

          <div className="relative z-10 flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-200 animate-bounce" />
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow tracking-tight">
                실시간 랭킹전 (10문제 타임어택)
              </h2>
            </div>
            <span className="text-2xl filter drop-shadow">🔥</span>
          </div>
          
          <p className="relative z-10 text-orange-100 font-medium text-xs sm:text-sm leading-relaxed">
            모두에게 똑같은 공식 10문제! 빠른 완주로 1위 탈환 & <strong>보상 코인</strong> 획득! ⚡
          </p>
        </button>

        {/* 🚀 2. Core Study Hub: 문제 풀이 핵심 존 (2x2 그리드 최상단 배치) */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-black uppercase tracking-wider mb-2.5 px-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>실전 문제 풀이 (Study & Practice)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* A. 일반 퀴즈 풀기 */}
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
                  정답 시 +5 코인
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mb-0.5 group-hover:text-emerald-300 transition-colors">
                일반 퀴즈 풀기
              </h3>
              <p className="text-emerald-200/70 text-xs font-medium leading-relaxed">
                Level 1~4 난이도 선택 10문제 풀기
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
                  미드 • 비즈니스 • 꿀패턴
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mb-0.5 group-hover:text-purple-300 transition-colors">
                원어민 표현 마스터
              </h3>
              <p className="text-purple-200/70 text-xs font-medium leading-relaxed">
                실전 A/B 롤플레이 & 플래시카드 & 표현 퀴즈
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
                    <h3 className="text-sm sm:text-base font-extrabold text-white">내 약점 집중 퀴즈</h3>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  오답 기반 맞춤 조제된 약점 문제를 풉니다.
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
                    <h3 className="text-sm sm:text-base font-extrabold text-amber-200">즐겨찾기 보관함</h3>
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                    {bookmarkCount}개
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  별표 표시한 중요 문항 무한 반복 복습
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* 📊 3. Analytics & Utility Hub: 학습 분석 & 도구 (하단 보조 메뉴) */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-black uppercase tracking-wider mb-2.5 px-1">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>학습 분석 & 문제 관리 (Analytics & Tools)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
            
            {/* 성장 분석 대시보드 */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('analytics_view');
              }}
              className="p-3.5 bg-slate-800/60 hover:bg-indigo-500/10 border border-slate-700/80 rounded-2xl transition-all text-left flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">📊</span>
                  <h4 className="text-xs font-extrabold text-indigo-200">성장 분석</h4>
                </div>
                <p className="text-slate-400 text-[10px]">1~5형식 마스터리 & 티어</p>
              </div>
              <span className={`bg-gradient-to-r ${tierInfo.badgeColor} text-white font-black text-[9px] px-1.5 py-0.2 rounded-full`}>
                {tierInfo.tier}
              </span>
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
                  <h4 className="text-xs font-extrabold text-amber-200">명예의 전당</h4>
                </div>
                <p className="text-slate-400 text-[10px]">1/2/3차전 랭킹 순위</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* 문제 공장 */}
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('generate');
              }}
              className="p-3.5 bg-slate-800/60 hover:bg-indigo-500/10 border border-slate-700/80 rounded-2xl transition-all text-left flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Factory className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-extrabold text-white">AI 문제 공장</h4>
                </div>
                <p className="text-slate-400 text-[10px]">40문제 출제 (🪙 50)</p>
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
              <span className="text-[11px] font-bold text-slate-300 block">전체 문제집</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('weakness_view');
              }}
              className="p-2.5 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 rounded-xl transition-all text-center"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mx-auto mb-0.5" />
              <span className="text-[11px] font-bold text-rose-300 block">약점 진단</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('incorrect_list');
              }}
              className="p-2.5 bg-slate-900/60 hover:bg-amber-500/10 border border-slate-800 rounded-xl transition-all text-center"
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
              <span className="text-[11px] font-bold text-amber-300 block">오답 노트</span>
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
                      <span>AI 문제 검수 & 제보 보상함</span>
                      <span className="bg-rose-500/20 text-rose-300 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-rose-500/30">
                        00시 심사 (🪙 50)
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      내가 제보한 문제의 AI 검수 결과 확인 및 보상 코인 받기
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
