import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  X, 
  Zap, 
  Sliders, 
  Send, 
  ShieldAlert, 
  Users, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  PlusCircle, 
  Trash2, 
  Gift, 
  Flame, 
  Bot, 
  Check, 
  Clock, 
  ChevronRight, 
  Search,
  MessageSquare,
  Trophy,
  Shuffle,
  BarChart3,
  Activity,
  Smartphone
} from 'lucide-react';
import { UserProfile, SystemSettings, PushAnnouncement, RankingItem } from '../types';
import { 
  getSystemSettings, 
  updateSystemSettings, 
  grantAdminGodMode, 
  sendGlobalAnnouncement, 
  getActiveAnnouncements, 
  getAllUsersList, 
  adminUpdateUserCoins,
  adminInjectGhostRanking,
  RANDOM_GHOST_NAMES,
  getCycleRankings,
  getTodayDateString,
  DEFAULT_SYSTEM_SETTINGS
} from '../services/dbService';
import { getPendingReports, approveReportAndReward, rejectReport, QuestionReport } from '../services/reportService';
import { AVATAR_DATABASE } from '../services/avatarService';
import { getAllUserAnalytics, UserAnalyticsSummary } from '../services/analyticsService';
import { sound } from '../services/soundService';

interface AdminCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUserUpdate: (updated: UserProfile) => void;
  onShowToast: (title: string, msg: string, type?: 'coin' | 'info' | 'error') => void;
}

export const AdminCenterModal: React.FC<AdminCenterModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'god_mode' | 'variables' | 'announcements' | 'reports' | 'users' | 'ghost_rankings' | 'analytics'>('god_mode');
  const [isLoading, setIsLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState<PushAnnouncement[]>([]);
  const [newAnnounceTitle, setNewAnnounceTitle] = useState('');
  const [newAnnounceContent, setNewAnnounceContent] = useState('');
  const [newAnnounceBadge, setNewAnnounceBadge] = useState<'event' | 'notice' | 'update' | 'maintenance'>('notice');
  const [newAnnounceReward, setNewAnnounceReward] = useState<number>(50);

  // Reports State
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // Users State
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserForCoin, setSelectedUserForCoin] = useState<UserProfile | null>(null);
  const [manualCoinAmount, setManualCoinAmount] = useState<number>(500);

  // Ghost Rankings State
  const [ghostCycleIndex, setGhostCycleIndex] = useState<1 | 2 | 3>(1);
  const [ghostName, setGhostName] = useState<string>('토익만점가자');
  const [ghostAvatarId, setGhostAvatarId] = useState<string>('gemini_god');
  const [ghostCorrectCount, setGhostCorrectCount] = useState<number>(9);
  const [ghostMinutesAgo, setGhostMinutesAgo] = useState<number>(25);
  const [ghostLeaderboard, setGhostLeaderboard] = useState<RankingItem[]>([]);
  const [isInjectingGhost, setIsInjectingGhost] = useState<boolean>(false);

  // 📊 Analytics State
  const [analyticsList, setAnalyticsList] = useState<UserAnalyticsSummary[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [selectedUserForTimeline, setSelectedUserForTimeline] = useState<UserAnalyticsSummary | null>(null);
  const [analyticsSearch, setAnalyticsSearch] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      loadGhostLeaderboard(ghostCycleIndex);
      loadAnalyticsData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [fetchedSettings, fetchedAnnouncements, fetchedReports, fetchedUsers] = await Promise.all([
        getSystemSettings(),
        getActiveAnnouncements(),
        getPendingReports(),
        getAllUsersList()
      ]);
      setSettings(fetchedSettings);
      setAnnouncements(fetchedAnnouncements);
      setReports(fetchedReports);
      setUserList(fetchedUsers);
    } catch (e) {
      console.error("Admin loadInitialData error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    setIsLoadingAnalytics(true);
    try {
      const list = await getAllUserAnalytics();
      setAnalyticsList(list);
    } catch (e) {
      console.error("loadAnalyticsData error:", e);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const loadGhostLeaderboard = async (cIndex: 1 | 2 | 3) => {
    try {
      const cycleId = `${getTodayDateString()}_cycle${cIndex}`;
      const list = await getCycleRankings(cycleId);
      setGhostLeaderboard(list);
    } catch (e) {
      console.error("loadGhostLeaderboard error:", e);
    }
  };

  const handleRandomizeGhostName = () => {
    sound.playClick();
    const randomName = RANDOM_GHOST_NAMES[Math.floor(Math.random() * RANDOM_GHOST_NAMES.length)];
    setGhostName(randomName);
    const randomAvatar = AVATAR_DATABASE[Math.floor(Math.random() * AVATAR_DATABASE.length)];
    setGhostAvatarId(randomAvatar.id);
  };

  const handleInjectGhostPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghostName.trim()) return;
    sound.playReward();
    setIsInjectingGhost(true);

    try {
      const cycleId = `${getTodayDateString()}_cycle${ghostCycleIndex}`;
      const res = await adminInjectGhostRanking({
        cycleId,
        name: ghostName.trim(),
        correctCount: ghostCorrectCount,
        minutesAgo: ghostMinutesAgo,
        avatarId: ghostAvatarId
      });

      if (res.success) {
        onShowToast('🎭 랭커 데이터 주입 완료!', `[${ghostName.trim()}] 님이 ${ghostCycleIndex}차전(${ghostCorrectCount * 10}점)에 등록되었습니다.`, 'coin');
        await loadGhostLeaderboard(ghostCycleIndex);
        handleRandomizeGhostName();
      } else {
        onShowToast('오류', res.error || '주입 실패', 'error');
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsInjectingGhost(false);
    }
  };

  if (!isOpen) return null;

  // ⚡ 1. 갓 모드 실행 핸들러
  const handleTriggerGodMode = async () => {
    sound.playReward();
    setIsLoading(true);
    try {
      const res = await grantAdminGodMode(user.name);
      if (res.success && res.profile) {
        onUserUpdate(res.profile);
        onShowToast('⚡ 갓 모드(God Mode) 발동 완료!', '🪙 999,999 코인 + 전 아바타 24종 올 언락 + 마스터 티어가 적용되었습니다.', 'coin');
      } else {
        onShowToast('오류', res.error || '갓 모드 적용에 실패했습니다.', 'error');
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ⚙️ 2. 시스템 변수 저장 핸들러
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSavingSettings(true);
    try {
      const success = await updateSystemSettings(settings);
      if (success) {
        onShowToast('⚙️ 시스템 설정 저장 완료!', '모든 사용자에게 변경된 게임 경제와 파라미터가 실시간 적용되었습니다.', 'coin');
      } else {
        onShowToast('오류', '설정 저장 중 문제가 발생했습니다.', 'error');
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // 📢 3. 전체 공지 발송 핸들러
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounceTitle.trim() || !newAnnounceContent.trim()) return;
    sound.playReward();
    setIsLoading(true);

    try {
      const res = await sendGlobalAnnouncement({
        title: newAnnounceTitle.trim(),
        content: newAnnounceContent.trim(),
        badgeType: newAnnounceBadge,
        rewardCoins: newAnnounceReward > 0 ? newAnnounceReward : undefined,
        authorName: user.name
      });

      if (res.success) {
        onShowToast('📢 전체 푸시 공지 발송 완료!', '모든 접속자 화면에 공지 팝업이 실시간 브로드캐스트됩니다.', 'coin');
        setNewAnnounceTitle('');
        setNewAnnounceContent('');
        setNewAnnounceReward(50);
        const updated = await getActiveAnnouncements();
        setAnnouncements(updated);
      } else {
        onShowToast('오류', res.error || '공지 발송 실패', 'error');
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 4. 문제 신고 승인 및 코인 보상 지급
  const handleApproveReport = async (report: QuestionReport) => {
    sound.playReward();
    setIsLoading(true);
    try {
      const res = await approveReportAndReward(report.id || '', report.reporterName, 50, '관리자 사령탑 직접 승인');
      if (res.success) {
        onShowToast('✓ 신고 승인 완료', `${report.reporterName}님에게 포상금 🪙 50 코인이 자동 지급되었습니다.`, 'coin');
        const updated = await getPendingReports();
        setReports(updated);
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 5. 문제 신고 반려
  const handleRejectReport = async (reportId: string) => {
    sound.playClick();
    setIsLoading(true);
    try {
      const res = await rejectReport(reportId, '검토 결과 이상이 없거나 중복 신고로 확인되었습니다.');
      if (res.success) {
        onShowToast('신고 반려 완료', '해당 신고가 반려 처리되었습니다.', 'info');
        const updated = await getPendingReports();
        setReports(updated);
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 👥 6. 유저 코인 수동 변경
  const handleUpdateUserCoins = async () => {
    if (!selectedUserForCoin) return;
    sound.playReward();
    setIsLoading(true);
    try {
      const success = await adminUpdateUserCoins(selectedUserForCoin.name, manualCoinAmount);
      if (success) {
        onShowToast('🪙 코인 지급/수정 완료', `${selectedUserForCoin.name}님의 코인이 ${manualCoinAmount}개로 설정되었습니다.`, 'coin');
        setSelectedUserForCoin(null);
        const updatedUsers = await getAllUsersList();
        setUserList(updatedUsers);
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-[2.5rem] w-full max-w-5xl h-[92vh] max-h-[850px] shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden text-slate-100 relative">
        
        {/* Ambient Neon Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* 👑 Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950 font-black">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  마스터 관리자 사령탑
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                  Supreme Commander
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                PPOKAE AI 전역 변수, 갓 모드 재화, 실시간 푸시 공지 및 유저 DB 통합 관제
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🔀 Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 scrollbar-none relative z-10">
          <button
            onClick={() => { sound.playClick(); setActiveTab('god_mode'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'god_mode'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ 갓 모드 & 재화</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('variables'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'variables'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>⚙️ 경제 & 시스템 변수</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('announcements'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>📢 푸시 공지 발송</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('reports'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>🚨 문의 & 문제 신고 ({reports.filter(r => r.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('users'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 유저 목록 & DB</span>
          </button>

          <button
            onClick={() => { 
              sound.playClick(); 
              setActiveTab('ghost_rankings'); 
              loadGhostLeaderboard(ghostCycleIndex);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ghost_rankings'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span>🎭 랭킹전 고스트 주입</span>
          </button>

          <button
            onClick={() => { 
              sound.playClick(); 
              setActiveTab('analytics'); 
              loadAnalyticsData();
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-300" />
            <span>📊 유저 행동 지표 ({analyticsList.length})</span>
          </button>
        </div>

        {/* 📱 Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10">
          
          {/* ========================================================================= */}
          {/* ⚡ TAB 1. 갓 모드 (God Mode & Currency Controller) */}
          {/* ========================================================================= */}
          {activeTab === 'god_mode' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Supreme God Mode Action Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-pink-500/20 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                      <Flame className="w-3.5 h-3.5 animate-bounce" />
                      <span>UNLIMITED ADMIN PRIVILEGES</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      원클릭 갓 모드 (God Mode)
                    </h3>
                    <p className="text-sm text-slate-300 max-w-xl">
                      버튼 클릭 한 번으로 내 관리자 계정에 <strong>🪙 999,999 코인</strong>, <strong>전체 24종 아바타 올 해금</strong>, <strong>마스터 티어</strong>, <strong>즐겨찾기 9,999칸</strong>을 즉시 부여합니다.
                    </p>
                  </div>

                  <button
                    onClick={handleTriggerGodMode}
                    disabled={isLoading}
                    className="px-8 py-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center gap-3 shrink-0"
                  >
                    <Zap className="w-6 h-6 fill-slate-950" />
                    <span>⚡ 갓 모드 즉시 발동</span>
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
                    🪙
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold">내 보유 코인</span>
                    <h4 className="text-xl font-black text-amber-300">{(user.coins ?? 200).toLocaleString()} 개</h4>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl">
                    🎭
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold">해금 아바타</span>
                    <h4 className="text-xl font-black text-purple-300">{(user.unlockedAvatars || []).length} / 24 종</h4>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-2xl">
                    👑
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold">현재 티어 / XP</span>
                    <h4 className="text-xl font-black text-pink-300">{user.tier || 'Master'} ({user.xp || 0} XP)</h4>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
                    ⭐
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold">즐겨찾기 보관함</span>
                    <h4 className="text-xl font-black text-emerald-300">{user.bookmarkLimit || 50} 칸</h4>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="p-5 rounded-3xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <h4 className="text-sm font-black text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>빠른 코인 충전 프리셋</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={async () => {
                      await adminUpdateUserCoins(user.name, (user.coins || 0) + 10000);
                      onUserUpdate({ ...user, coins: (user.coins || 0) + 10000 });
                      onShowToast('🪙 +10,000 코인 충전', '관리자 계정에 코인이 추가되었습니다.', 'coin');
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold text-xs text-amber-300 transition-all active:scale-95"
                  >
                    +10,000 코인
                  </button>
                  <button
                    onClick={async () => {
                      await adminUpdateUserCoins(user.name, (user.coins || 0) + 100000);
                      onUserUpdate({ ...user, coins: (user.coins || 0) + 100000 });
                      onShowToast('🪙 +100,000 코인 충전', '관리자 계정에 코인이 추가되었습니다.', 'coin');
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold text-xs text-amber-300 transition-all active:scale-95"
                  >
                    +100,000 코인
                  </button>
                  <button
                    onClick={async () => {
                      await adminUpdateUserCoins(user.name, 999999);
                      onUserUpdate({ ...user, coins: 999999 });
                      onShowToast('🪙 맥스 코인 설정', '코인이 999,999개로 고정되었습니다.', 'coin');
                    }}
                    className="py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 font-bold text-xs text-amber-300 transition-all active:scale-95"
                  >
                    🪙 999,999 맥스
                  </button>
                  <button
                    onClick={async () => {
                      await adminUpdateUserCoins(user.name, 200);
                      onUserUpdate({ ...user, coins: 200 });
                      onShowToast('코인 초기화', '코인이 일반 유저 기본값(200개)으로 변경되었습니다.', 'info');
                    }}
                    className="py-3 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 font-bold text-xs text-rose-300 transition-all active:scale-95"
                  >
                    200 코인 원복
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* ⚙️ TAB 2. 경제 & 시스템 변수 (Game Variable Controller) */}
          {/* ========================================================================= */}
          {activeTab === 'variables' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <span>실시간 게임 경제 & 파라미터 제어기</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    여기서 변경한 수치는 서버에 즉시 동기화되어 모든 사용자의 다음 문제 풀이 및 가챠에 실시간 반영됩니다.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingSettings ? '저장 중...' : '전역 설정 실시간 배포'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. 문제 풀이 코인 보상 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <label className="text-xs font-black text-slate-200 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>문제 1개 정답 시 보상 코인</span>
                  </label>
                  <p className="text-[11px] text-slate-400">퀴즈/회화 문제를 맞혔을 때 유저에게 지급되는 코인입니다.</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={settings.rewardCoinsPerQuestion}
                      onChange={e => setSettings({ ...settings, rewardCoinsPerQuestion: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-400"
                    />
                    <span className="text-xs font-bold text-amber-300 shrink-0">코인 / 문제</span>
                  </div>
                </div>

                {/* 2. 신규 가입 보너스 코인 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <label className="text-xs font-black text-slate-200 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-pink-400" />
                    <span>신규 회원가입 축하 보너스 코인</span>
                  </label>
                  <p className="text-[11px] text-slate-400">신규 가입자가 생성될 때 최초 지급되는 스타터 코인입니다.</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={10000}
                      value={settings.starterCoins}
                      onChange={e => setSettings({ ...settings, starterCoins: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-400"
                    />
                    <span className="text-xs font-bold text-pink-300 shrink-0">스타터 코인</span>
                  </div>
                </div>

                {/* 3. 아바타 가챠 1회 비용 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <label className="text-xs font-black text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>아바타 뽑기(가챠) 1회 소모 코인</span>
                  </label>
                  <p className="text-[11px] text-slate-400">신화/전설 아바타 가챠 1회 실행에 필요한 코인입니다.</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={settings.gachaCost}
                      onChange={e => setSettings({ ...settings, gachaCost: parseInt(e.target.value) || 50 })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-400"
                    />
                    <span className="text-xs font-bold text-purple-300 shrink-0">코인 / 회</span>
                  </div>
                </div>

                {/* 4. 즐겨찾기 보관함 확장 비용 */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <label className="text-xs font-black text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>즐겨찾기 보관함 +50칸 확장 비용</span>
                  </label>
                  <p className="text-[11px] text-slate-400">보관함 슬롯을 50칸 확장할 때 소모되는 코인입니다.</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={settings.expandBookmarkCost}
                      onChange={e => setSettings({ ...settings, expandBookmarkCost: parseInt(e.target.value) || 100 })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-400"
                    />
                    <span className="text-xs font-bold text-emerald-300 shrink-0">코인 / 50칸</span>
                  </div>
                </div>
              </div>

              {/* 긴급 점검 모드 */}
              <div className="p-5 rounded-3xl bg-rose-950/30 border border-rose-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <span className="text-sm font-black text-rose-200">긴급 서버 점검 모드</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.maintenanceNotice || ''}
                  onChange={e => setSettings({ ...settings, maintenanceNotice: e.target.value })}
                  placeholder="점검 안내 문구를 입력하세요."
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-rose-700/60 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 📢 TAB 3. 전체 푸시 공지 발송 (Push Announcements) */}
          {/* ========================================================================= */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* New Announcement Form */}
              <form onSubmit={handleSendAnnouncement} className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-pink-400" />
                  <span>실시간 전역 푸시 공지 발송하기</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">공지 뱃지 유형</label>
                    <select
                      value={newAnnounceBadge}
                      onChange={e => setNewAnnounceBadge(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="notice">📢 일반 공지</option>
                      <option value="event">🎁 이벤트 / 보상</option>
                      <option value="update">🚀 신규 업데이트</option>
                      <option value="maintenance">🚧 서버 점검</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">공지 제목</label>
                    <input
                      type="text"
                      value={newAnnounceTitle}
                      onChange={e => setNewAnnounceTitle(e.target.value)}
                      placeholder="예: 🎉 뽀개 업데이트 기념 깜짝 100 코인 지급!"
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">공지 상세 본문 내용</label>
                  <textarea
                    rows={3}
                    value={newAnnounceContent}
                    onChange={e => setNewAnnounceContent(e.target.value)}
                    placeholder="모든 접속자에게 팝업으로 표시될 상세 내용을 입력하세요."
                    required
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-amber-300 shrink-0">🪙 첨부 보상 코인:</span>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={newAnnounceReward}
                      onChange={e => setNewAnnounceReward(parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 text-center focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">(0 입력 시 무보상)</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !newAnnounceTitle.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>전체 유저에게 푸시 발송</span>
                  </button>
                </div>
              </form>

              {/* Active Announcements List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  현재 활성화된 공지 목록 ({announcements.length}개)
                </h4>

                {announcements.length === 0 ? (
                  <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                    등록된 활성 공지가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {announcements.map(ann => (
                      <div key={ann.id} className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase">
                              {ann.badgeType}
                            </span>
                            <h5 className="text-sm font-bold text-white">{ann.title}</h5>
                            {ann.rewardCoins && ann.rewardCoins > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                🪙 +{ann.rewardCoins} 코인 첨부
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>
                          <span className="text-[10px] text-slate-500">
                            발송일시: {new Date(ann.createdAt).toLocaleString()} • 작성자: {ann.authorName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 🚨 TAB 4. 문의 & 문제 신고 관리 (Reports & Support Center) */}
          {/* ========================================================================= */}
          {activeTab === 'reports' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-400" />
                    <span>사용자 문제 오류 신고 & 피드백 관리 센터</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    유저들이 접수한 문제 오류 제보를 검토하고, 승인 시 포상금(🪙 50 코인)을 즉시 지급합니다.
                  </p>
                </div>

                <button
                  onClick={loadInitialData}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-slate-800 text-slate-500 text-sm">
                  접수된 문제 오류 신고가 없습니다. 시스템이 아주 깨끗합니다! 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(report => (
                    <div key={report.id} className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                              {report.reportType}
                            </span>
                            <span className="text-xs font-black text-slate-300">
                              제보자: <strong className="text-white">{report.reporterName}</strong>
                            </span>
                            <span className="text-[10px] text-slate-500">{report.dateStr}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono">
                            "{report.questionSentence}"
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {report.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveReport(report)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>승인 (🪙 50 지급)</span>
                              </button>
                              <button
                                onClick={() => handleRejectReport(report.id || '')}
                                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-all active:scale-95"
                              >
                                <span>반려</span>
                              </button>
                            </>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              report.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                            }`}>
                              {report.status === 'approved' ? '✓ 승인 완료' : '✕ 반려됨'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-2xl text-xs space-y-1">
                        <span className="text-[11px] font-bold text-slate-400">유저 제출 피드백:</span>
                        <p className="text-slate-200">{report.userFeedback}</p>
                      </div>

                      {report.auditResult && (
                        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                            <Bot className="w-3.5 h-3.5" />
                            <span>AI 1차 심사 소견 ({report.auditResult.isAccepted ? '승인 권고' : '반려 권고'})</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{report.auditResult.reason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* 👥 TAB 5. 유저 목록 & DB 관리 (User & DB Explorer) */}
          {/* ========================================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>전체 등록 유저 목록 ({userList.length}명)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    전체 회원의 코인 잔액 및 티어 현황을 실시간 조회하고 관리자 권한으로 코인을 직접 조정합니다.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={e => setUserSearchTerm(e.target.value)}
                    placeholder="닉네임 / 이메일 검색"
                    className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-bold border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">유저 / 아바타</th>
                      <th className="p-3.5">보유 코인</th>
                      <th className="p-3.5">티어 / XP</th>
                      <th className="p-3.5">푼 문제 수</th>
                      <th className="p-3.5">계정 유형</th>
                      <th className="p-3.5 text-right">코인 관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((u, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 flex items-center gap-2.5">
                          <span className="text-xl">{u.avatar || '🦁'}</span>
                          <div>
                            <span className="font-bold text-white">{u.name}</span>
                            {u.email && <p className="text-[10px] text-slate-500">{u.email}</p>}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-black text-amber-300">🪙 {(u.coins ?? 200).toLocaleString()}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-purple-300">{u.tier || 'Bronze'}</span>
                          <span className="text-[10px] text-slate-500 block">{u.xp || 0} XP</span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-300">
                          {u.totalSolved || 0}문제 ({u.totalCorrect || 0}정답)
                        </td>
                        <td className="p-3.5">
                          {u.isAdmin ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                              👑 관리자
                            </span>
                          ) : u.email ? (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                              구글 연동
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                              PIN 계정
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedUserForCoin(u);
                              setManualCoinAmount(u.coins ?? 200);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs transition-all active:scale-95"
                          >
                            코인 설정
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* User Coin Adjust Modal Overlay */}
              {selectedUserForCoin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                  <div className="bg-slate-900 border border-amber-500/60 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
                    <h4 className="text-base font-black text-white">
                      [{selectedUserForCoin.name}] 코인 직접 수정
                    </h4>
                    <p className="text-xs text-slate-400">
                      변경할 코인 수량을 입력하고 저장하면 해당 유저의 계정에 즉시 반영됩니다.
                    </p>
                    <input
                      type="number"
                      value={manualCoinAmount}
                      onChange={e => setManualCoinAmount(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-lg font-black text-amber-300 text-center focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUserForCoin(null)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 font-bold text-xs text-slate-400 hover:text-white"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleUpdateUserCoins}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg"
                      >
                        코인 저장
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* 🎭 TAB 6. 랭킹전 고스트 플레이어 주입기 (Ghost / Dummy Leaderboard Injector) */}
          {/* ========================================================================= */}
          {activeTab === 'ghost_rankings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>랭킹전 고스트 플레이어 (더미 랭커) 주입기</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    실제 일반 사용자와 100% 동일한 데이터 스키마로 자연스러운 랭킹 데이터를 실시간 생성 및 주입합니다.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 📝 주입 폼 */}
                <form onSubmit={handleInjectGhostPlayer} className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
                  <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>고스트 플레이어 프로필 & 점수 설정</span>
                  </h4>

                  {/* 차전 선택 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">대상 차전 선택</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(idx => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setGhostCycleIndex(idx as 1 | 2 | 3);
                            loadGhostLeaderboard(idx as 1 | 2 | 3);
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            ghostCycleIndex === idx
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                        >
                          오늘 {idx}차전
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 닉네임 입력 + 랜덤 생성 버튼 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">고스트 닉네임</label>
                      <button
                        type="button"
                        onClick={handleRandomizeGhostName}
                        className="text-[11px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-all"
                      >
                        <Shuffle className="w-3 h-3" />
                        <span>🎲 닉네임 & 아바타 랜덤 뽑기</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ghostName}
                      onChange={e => setGhostName(e.target.value)}
                      placeholder="플레이어 닉네임 입력"
                      required
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 🎭 고스트 대표 아바타 프로필 설정 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">장착할 대표 아바타 프로필</label>
                      <span className="text-[11px] text-amber-300 font-bold">
                        {AVATAR_DATABASE.find(a => a.id === ghostAvatarId)?.name}
                      </span>
                    </div>

                    {/* 선택된 아바타 프리뷰 카드 */}
                    {(() => {
                      const cur = AVATAR_DATABASE.find(a => a.id === ghostAvatarId) || AVATAR_DATABASE[0];
                      return (
                        <div className={`p-2.5 rounded-2xl bg-gradient-to-r ${cur.bgGradient || 'from-slate-800 to-slate-900 border-slate-700'} border flex items-center justify-between shadow-md`}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{cur.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-black ${cur.color || 'text-white'}`}>{cur.name}</span>
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-slate-950/80 text-amber-300 border border-amber-400/40">
                                  {cur.grade === 'transcendent' ? '초월' : cur.grade === 'mythic' ? '신화' : cur.grade === 'legendary' ? '전설' : cur.grade === 'epic' ? '에픽' : '스타터'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-300/80 italic line-clamp-1">"{cur.quote}"</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 아바타 선택 셀렉트 박스 */}
                    <select
                      value={ghostAvatarId}
                      onChange={e => setGhostAvatarId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      <optgroup label="🌟 초월 (0.05% 천상계 아바타)">
                        {AVATAR_DATABASE.filter(a => a.grade === 'transcendent').map(a => (
                          <option key={a.id} value={a.id}>{a.icon} {a.name} [초월]</option>
                        ))}
                      </optgroup>
                      <optgroup label="🌌 신화 (1.0% 신화 아바타)">
                        {AVATAR_DATABASE.filter(a => a.grade === 'mythic').map(a => (
                          <option key={a.id} value={a.id}>{a.icon} {a.name} [신화]</option>
                        ))}
                      </optgroup>
                      <optgroup label="🏆 전설 (5.0% 레전드 아바타)">
                        {AVATAR_DATABASE.filter(a => a.grade === 'legendary').map(a => (
                          <option key={a.id} value={a.id}>{a.icon} {a.name} [전설]</option>
                        ))}
                      </optgroup>
                      <optgroup label="🔮 에픽 (20.0% 에픽 아바타)">
                        {AVATAR_DATABASE.filter(a => a.grade === 'epic').map(a => (
                          <option key={a.id} value={a.id}>{a.icon} {a.name} [에픽]</option>
                        ))}
                      </optgroup>
                      <optgroup label="🦁 스타터 기본 아바타">
                        {AVATAR_DATABASE.filter(a => a.grade === 'starter').map(a => (
                          <option key={a.id} value={a.id}>{a.icon} {a.name} [스타터]</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* 맞힌 문제 수 & 점수 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">맞힌 문제 수 (정답 수)</label>
                      <span className="text-xs font-black text-amber-300">
                        {ghostCorrectCount}문제 / 10문제 ({ghostCorrectCount * 10}점)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={ghostCorrectCount}
                      onChange={e => setGhostCorrectCount(parseInt(e.target.value) || 1)}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>1개(10점)</span>
                      <span>5개(50점)</span>
                      <span>8개(80점)</span>
                      <span>10개(100점 만점)</span>
                    </div>
                  </div>

                  {/* 완료 시점 오프셋 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">완료 시간 설정 (얼마 전 푼 것으로 기록)</label>
                    <select
                      value={ghostMinutesAgo}
                      onChange={e => setGhostMinutesAgo(parseInt(e.target.value) || 15)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                    >
                      <option value={5}>5분 전 (방금 전 푼 느낌)</option>
                      <option value={15}>15분 전</option>
                      <option value={30}>30분 전</option>
                      <option value={60}>1시간 전</option>
                      <option value={120}>2시간 전</option>
                      <option value={240}>4시간 전</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isInjectingGhost || !ghostName.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Trophy className="w-4 h-4 fill-slate-950" />
                    <span>{isInjectingGhost ? '주입 중...' : `오늘 ${ghostCycleIndex}차전에 [${ghostName}] (${ghostCorrectCount * 10}점) 즉시 주입`}</span>
                  </button>
                </form>

                {/* 📊 대상 차전 실시간 랭킹 프리뷰 */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col h-[400px]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-black text-white">오늘 {ghostCycleIndex}차전 실시간 순위표 프리뷰</span>
                    </div>
                    <button
                      onClick={() => loadGhostLeaderboard(ghostCycleIndex)}
                      className="text-slate-400 hover:text-white p-1"
                      title="새로고침"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pt-3 custom-scrollbar">
                    {ghostLeaderboard.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                        등록된 랭킹 데이터가 없습니다. 왼쪽에서 고스트 데이터를 주입해보세요!
                      </div>
                    ) : (
                      ghostLeaderboard.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            idx === 0 
                              ? 'bg-amber-500/20 border-amber-400/50 text-amber-200' 
                              : idx === 1 
                              ? 'bg-slate-700/40 border-slate-600 text-slate-200'
                              : idx === 2
                              ? 'bg-orange-950/40 border-orange-700/50 text-orange-200'
                              : 'bg-slate-800/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-center font-black">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                            </span>
                            <span className="font-bold">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-slate-400">
                              {item.completedAtFormatted || '--:--'}
                            </span>
                            <span className="font-black text-amber-300">{item.score}점</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 📊 TAB 7: 유저 행동 지표 & 텔레메트리 (Analytics) */}
          {/* ======================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/80 to-slate-900 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-300" />
                    <span>실시간 유저 행동 지표 & 텔레메트리</span>
                  </h3>
                  <p className="text-xs text-indigo-200/80 mt-1">
                    각 유저(auth.currentUser.uid)의 방문, 문제 풀이, 랭킹전 참여, 가챠 소환, PWA 홈화면 추가 이력을 실시간 집계합니다.
                  </p>
                </div>

                <button
                  onClick={loadAnalyticsData}
                  disabled={isLoadingAnalytics}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </button>
              </div>

              {/* 5종 핵심 KPI 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">👥 누적 활동 유저</span>
                  <span className="text-xl font-black text-white">{analyticsList.length}명</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[11px] font-bold text-emerald-400 block mb-1">✍️ 누적 푼 문제</span>
                  <span className="text-xl font-black text-emerald-300">
                    {analyticsList.reduce((acc, u) => acc + (u.totalSolved || 0), 0).toLocaleString()}개
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[11px] font-bold text-amber-400 block mb-1">🏆 랭킹전 세션</span>
                  <span className="text-xl font-black text-amber-300">
                    {analyticsList.reduce((acc, u) => acc + (u.rankingPlayedCount || 0), 0)}회
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[11px] font-bold text-purple-400 block mb-1">🎰 가챠 소환</span>
                  <span className="text-xl font-black text-purple-300">
                    {analyticsList.reduce((acc, u) => acc + (u.gachaPullsCount || 0), 0)}회
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold text-pink-400 block mb-1">📲 홈화면 바로가기</span>
                  <span className="text-xl font-black text-pink-300">
                    {analyticsList.filter(u => u.isStandalone || u.addToHomeClicks > 0).length}명
                  </span>
                </div>
              </div>

              {/* 검색 바 */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={analyticsSearch}
                  onChange={e => setAnalyticsSearch(e.target.value)}
                  placeholder="유저 닉네임 또는 UID 검색..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* 유저 행동 지표 테이블 */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">유저 / UID</th>
                        <th className="py-3 px-4">디바이스 / PWA</th>
                        <th className="py-3 px-3 text-center">방문</th>
                        <th className="py-3 px-3 text-center">푼 문제</th>
                        <th className="py-3 px-3 text-center">랭킹전</th>
                        <th className="py-3 px-3 text-center">가챠</th>
                        <th className="py-3 px-4 text-center">최근 활동</th>
                        <th className="py-3 px-4 text-right">행동 로그</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                      {analyticsList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500">
                            수집된 유저 행동 데이터가 없습니다. 유저들이 활동하면 실시간으로 누적됩니다.
                          </td>
                        </tr>
                      ) : (
                        analyticsList
                          .filter(u => 
                            u.userName.toLowerCase().includes(analyticsSearch.toLowerCase()) ||
                            u.userId.toLowerCase().includes(analyticsSearch.toLowerCase())
                          )
                          .map((u) => (
                            <tr key={u.userId} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-black text-white flex items-center gap-1.5">
                                  <span>{u.userName}</span>
                                  {u.isStandalone && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                      홈화면 PWA
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[140px]">
                                  {u.authUid ? `UID: ${u.authUid}` : `ID: ${u.userId}`}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-400 text-[11px]">
                                {u.platform}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-200">
                                {u.totalVisits}회
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-emerald-300">
                                {u.totalSolved}개
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-amber-300">
                                {u.rankingPlayedCount}회
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-purple-300">
                                {u.gachaPullsCount}회
                              </td>
                              <td className="py-3 px-4 text-center text-[11px] text-slate-400 font-mono">
                                {u.lastActiveAt?.toDate ? u.lastActiveAt.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '방금 전'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => setSelectedUserForTimeline(u)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold transition-all"
                                >
                                  타임라인 ({u.recentActions?.length || 0})
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 선택된 유저 실시간 타임라인 모달 */}
              {selectedUserForTimeline && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        <h4 className="text-sm font-black text-white">
                          [{selectedUserForTimeline.userName}] 최근 행동 타임라인
                        </h4>
                      </div>
                      <button
                        onClick={() => setSelectedUserForTimeline(null)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-y-auto space-y-2 flex-1 pr-1 text-xs">
                      {selectedUserForTimeline.recentActions?.length > 0 ? (
                        selectedUserForTimeline.recentActions.map((log, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3">
                            <div>
                              <span className="font-bold text-indigo-300 block">{log.action}</span>
                              {log.details && <span className="text-[11px] text-slate-400">{log.details}</span>}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">기록된 행동 로그가 없습니다.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
