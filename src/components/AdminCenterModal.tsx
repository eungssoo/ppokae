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
  Smartphone,
  Download,
  Upload,
  FileJson,
  Edit3,
  Shield,
  Award,
  BookOpen
} from 'lucide-react';
import { UserProfile, SystemSettings, PushAnnouncement, RankingItem, Question } from '../types';
import { 
  getSystemSettings, 
  updateSystemSettings, 
  grantAdminGodMode, 
  sendGlobalAnnouncement, 
  getActiveAnnouncements, 
  deleteAnnouncement,
  getAllUsersList, 
  adminUpdateUserCoins,
  adminUpdateUserXp,
  adminUpdateUserBookmarkLimit,
  adminUnlockUserAvatar,
  adminDeleteUserDirect,
  adminBulkImportQuestions,
  adminExportAllQuestions,
  adminPurgeAndResetAllQuestionsAndCycles,
  adminInjectGhostRanking,
  adminBatchInjectGhostRankings,
  adminClearGhostRankings,
  RANDOM_GHOST_NAMES,
  getCycleRankings,
  getTodayDateString,
  DEFAULT_SYSTEM_SETTINGS
} from '../services/dbService';
import { 
  getPendingReports, 
  approveReportAndReward, 
  rejectReport, 
  regenerateQuestionWithAI, 
  QuestionReport, 
  REPORT_TYPE_LABELS,
  getAllUserInquiries, 
  deleteUserInquiry, 
  UserInquiry 
} from '../services/reportService';
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
  const [activeTab, setActiveTab] = useState<'god_mode' | 'variables' | 'announcements' | 'inquiries' | 'reports' | 'users' | 'ghost_rankings' | 'analytics'>('god_mode');
  const [isLoading, setIsLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Inquiries & Feedback State
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);

  // Announcements State
  const [announcements, setAnnouncements] = useState<PushAnnouncement[]>([]);
  const [newAnnounceTitle, setNewAnnounceTitle] = useState('');
  const [newAnnounceContent, setNewAnnounceContent] = useState('');
  const [newAnnounceBadge, setNewAnnounceBadge] = useState<'event' | 'notice' | 'update' | 'maintenance'>('notice');
  const [newAnnounceReward, setNewAnnounceReward] = useState<number>(50);
  const [announceTargetType, setAnnounceTargetType] = useState<'all' | 'individual'>('all');
  const [targetUserName, setTargetUserName] = useState<string>('');

  // Reports State & AI Regeneration
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [regeneratingReportId, setRegeneratingReportId] = useState<string | null>(null);
  const [regeneratedQuestionsMap, setRegeneratedQuestionsMap] = useState<Record<string, Question>>({});

  // Users State & Super Control
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserProfile | null>(null);
  const [editUserCoins, setEditUserCoins] = useState<number>(200);
  const [editUserXp, setEditUserXp] = useState<number>(0);
  const [editUserBookmarkLimit, setEditUserBookmarkLimit] = useState<number>(50);
  const [selectedAvatarToGift, setSelectedAvatarToGift] = useState<string>('gemini_god');

  // Question Bank Pro State (Import / Export)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportJsonText, setBulkImportJsonText] = useState('');
  const [isExportingQuestions, setIsExportingQuestions] = useState(false);
  const [isImportingQuestions, setIsImportingQuestions] = useState(false);

  // Ghost Rankings State
  const [ghostMode, setGhostMode] = useState<'batch' | 'single'>('batch');
  const [ghostCycleIndex, setGhostCycleIndex] = useState<1 | 2 | 3>(1);
  const [ghostName, setGhostName] = useState<string>('토익만점가자');
  const [ghostAvatarId, setGhostAvatarId] = useState<string>('gemini_god');
  const [ghostCorrectCount, setGhostCorrectCount] = useState<number>(9);
  const [ghostMinutesAgo, setGhostMinutesAgo] = useState<number>(25);
  const [ghostLeaderboard, setGhostLeaderboard] = useState<RankingItem[]>([]);
  const [isInjectingGhost, setIsInjectingGhost] = useState<boolean>(false);

  // 👥 Batch Ghost Generation States
  const [ghostBatchCount, setGhostBatchCount] = useState<number>(10);
  const [ghostMinCorrect, setGhostMinCorrect] = useState<number>(4);
  const [ghostMaxCorrect, setGhostMaxCorrect] = useState<number>(10);
  const [ghostMinMinutesAgo, setGhostMinMinutesAgo] = useState<number>(5);
  const [ghostMaxMinutesAgo, setGhostMaxMinutesAgo] = useState<number>(360);
  const [isBatchInjecting, setIsBatchInjecting] = useState<boolean>(false);
  const [isClearingGhosts, setIsClearingGhosts] = useState<boolean>(false);

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
      const [fetchedSettings, fetchedAnnouncements, fetchedReports, fetchedUsers, fetchedInquiries] = await Promise.all([
        getSystemSettings(),
        getActiveAnnouncements(),
        getPendingReports(),
        getAllUsersList(),
        getAllUserInquiries()
      ]);
      setSettings(fetchedSettings);
      setAnnouncements(fetchedAnnouncements);
      setReports(fetchedReports);
      setUserList(fetchedUsers);
      setInquiries(fetchedInquiries);
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

  const handleBatchInjectGhosts = async () => {
    sound.playReward();
    setIsBatchInjecting(true);

    try {
      const cycleId = `${getTodayDateString()}_cycle${ghostCycleIndex}`;
      const res = await adminBatchInjectGhostRankings({
        cycleId,
        count: ghostBatchCount,
        minCorrect: ghostMinCorrect,
        maxCorrect: ghostMaxCorrect,
        minMinutesAgo: ghostMinMinutesAgo,
        maxMinutesAgo: ghostMaxMinutesAgo
      });

      if (res.success) {
        onShowToast('👥 고스트 대량 투입 성공!', `오늘 ${ghostCycleIndex}차전에 중복 없는 고스트 ${res.injectedCount}명이 고유 시간/점수로 일괄 배치되었습니다!`, 'coin');
        await loadGhostLeaderboard(ghostCycleIndex);
      } else {
        onShowToast('오류', res.error || '고스트 일괄 투입 실패', 'error');
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsBatchInjecting(false);
    }
  };

  const handleClearGhosts = async () => {
    if (!window.confirm(`정말로 오늘 ${ghostCycleIndex}차전의 모든 고스트 랭커 데이터를 일괄 삭제하시겠습니까?`)) return;
    sound.playClick();
    setIsClearingGhosts(true);

    try {
      const cycleId = `${getTodayDateString()}_cycle${ghostCycleIndex}`;
      const res = await adminClearGhostRankings(cycleId);
      if (res.success) {
        onShowToast('🧹 고스트 청소 완료', `오늘 ${ghostCycleIndex}차전에서 고스트 랭커 ${res.deletedCount}명이 삭제되었습니다.`, 'info');
        await loadGhostLeaderboard(ghostCycleIndex);
      } else {
        onShowToast('오류', res.error || '고스트 삭제 실패', 'error');
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsClearingGhosts(false);
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
        onShowToast('⚡ 갓 모드(God Mode) 발동 완료!', `🪙 999,999 코인 + 전 아바타 ${AVATAR_DATABASE.length}종 올 언락 + 마스터 티어가 적용되었습니다.`, 'coin');
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

  // 📢 3. 전체 또는 개인 공지 발송 핸들러
  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounceTitle.trim() || !newAnnounceContent.trim()) return;
    if (announceTargetType === 'individual' && !targetUserName.trim()) {
      onShowToast('안내', '발송할 대상 유저를 선택해 주세요.', 'error');
      return;
    }

    sound.playReward();
    setIsLoading(true);

    try {
      const res = await sendGlobalAnnouncement({
        title: newAnnounceTitle.trim(),
        content: newAnnounceContent.trim(),
        badgeType: newAnnounceBadge,
        rewardCoins: newAnnounceReward > 0 ? newAnnounceReward : undefined,
        authorName: user.name,
        targetUserName: announceTargetType === 'individual' ? targetUserName.trim() : undefined
      });

      if (res.success) {
        const targetMsg = announceTargetType === 'individual' 
          ? `[${targetUserName}] 님에게 개인 맞춤 푸시 발송 완료!` 
          : '모든 접속자 화면에 공지 팝업이 실시간 브로드캐스트됩니다.';
        onShowToast('📢 푸시 공지 발송 완료!', targetMsg, 'coin');
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

  // 🗑️ 공지 삭제/비활성화 핸들러
  const handleDeleteAnnouncement = async (announcementId: string) => {
    sound.playClick();
    setIsLoading(true);
    try {
      const ok = await deleteAnnouncement(announcementId);
      if (ok) {
        onShowToast('✓ 공지 비활성화 완료', '공지가 성공적으로 비활성화되었습니다.', 'info');
        const updated = await getActiveAnnouncements();
        setAnnouncements(updated);
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 🤖 4-0. AI 문제 선지/해설/정답 즉시 재구성 핸들러
  const handleRegenerateQuestionForReport = async (report: QuestionReport) => {
    if (!report.id) return;
    sound.playClick();
    setRegeneratingReportId(report.id);
    try {
      const res = await regenerateQuestionWithAI({
        sentence: report.questionSentence,
        form: report.questionForm,
        currentAnswer: report.questionAnswer,
        userFeedback: report.userFeedback
      });
      if (res.success && res.question) {
        sound.playStar();
        setRegeneratedQuestionsMap(prev => ({ ...prev, [report.id!]: res.question! }));
        onShowToast('🤖 AI 문제 재구성 완료!', '4개 선지, 검증된 정답 및 1타 강사 해설이 새롭게 생성되었습니다.', 'coin');
      } else {
        onShowToast('AI 생성 실패', res.error || '문제 재구성에 실패했습니다.', 'error');
      }
    } catch (e: any) {
      onShowToast('오류', e.message, 'error');
    } finally {
      setRegeneratingReportId(null);
    }
  };

  // 🚨 4. 문제 신고 승인 및 코인 보상 지급 (+ AI 교정본 적용 옵션)
  const handleApproveReport = async (report: QuestionReport, useAiFixed: boolean = false) => {
    sound.playReward();
    setIsLoading(true);
    try {
      const fixedQ = useAiFixed && report.id ? regeneratedQuestionsMap[report.id] : undefined;
      const res = await approveReportAndReward(
        report.id || '', 
        report.reporterName, 
        50, 
        fixedQ ? '관리자 승인 (AI 정밀 교정안 적용)' : '관리자 사령탑 직접 승인',
        fixedQ
      );
      if (res.success) {
        onShowToast('✓ 신고 승인 완료', `제보자에게 포상금 🪙 50 코인이 자동 지급되었습니다.`, 'coin');
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

  // 👥 6. 유저 통합 슈퍼 제어 (코인, XP, 티어, 북마크, 아바타, 계정 삭제)
  const handleOpenUserDetail = (u: UserProfile) => {
    sound.playClick();
    setSelectedUserForDetail(u);
    setEditUserCoins(u.coins ?? 200);
    setEditUserXp(u.xp || 0);
    setEditUserBookmarkLimit(u.bookmarkLimit || 50);
  };

  const handleSaveUserDetail = async () => {
    if (!selectedUserForDetail) return;
    sound.playReward();
    setIsLoading(true);
    try {
      const targetName = selectedUserForDetail.name;
      await Promise.all([
        adminUpdateUserCoins(targetName, editUserCoins),
        adminUpdateUserXp(targetName, editUserXp),
        adminUpdateUserBookmarkLimit(targetName, editUserBookmarkLimit)
      ]);
      onShowToast('👑 유저 프로필 수정 완료', `[${targetName}]님의 코인(${editUserCoins}), XP(${editUserXp}), 보관함(${editUserBookmarkLimit}칸)이 즉시 반영되었습니다.`, 'coin');
      setSelectedUserForDetail(null);
      const updatedUsers = await getAllUsersList();
      setUserList(updatedUsers);
    } catch (e: any) {
      onShowToast('수정 실패', e.message || '오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 🎁 6-1. 유저 아바타 즉시 선물 / 전체 해금
  const handleGiftAvatarToUser = async (avatarIdOrAll: string | 'ALL') => {
    if (!selectedUserForDetail) return;
    sound.playReward();
    setIsLoading(true);
    try {
      const targetName = selectedUserForDetail.name;
      const success = await adminUnlockUserAvatar(targetName, avatarIdOrAll);
      if (success) {
        const avatarName = avatarIdOrAll === 'ALL' ? `${AVATAR_DATABASE.length}종 전체 아바타` : AVATAR_DATABASE.find(a => a.id === avatarIdOrAll)?.name || avatarIdOrAll;
        onShowToast('🎁 아바타 선물 완료', `[${targetName}]님에게 [${avatarName}]이(가) 즉시 해금되었습니다!`, 'coin');
        const updatedUsers = await getAllUsersList();
        setUserList(updatedUsers);
        const updatedSelf = updatedUsers.find(u => u.name === targetName);
        if (updatedSelf) setSelectedUserForDetail(updatedSelf);
      }
    } catch (e: any) {
      onShowToast('해금 오류', e.message || '오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 🗑️ 6-2. 유저 계정 강제 삭제
  const handleDeleteUserDirectly = async (targetName: string) => {
    if (!window.confirm(`정말로 [${targetName}] 유저의 계정과 학습 데이터를 완전 삭제하시겠습니까? (되돌릴 수 없습니다)`)) {
      return;
    }
    sound.playClick();
    setIsLoading(true);
    try {
      const success = await adminDeleteUserDirect(targetName);
      if (success) {
        onShowToast('🗑️ 계정 삭제 완료', `[${targetName}] 계정이 영구 삭제되었습니다.`, 'info');
        setSelectedUserForDetail(null);
        const updatedUsers = await getAllUsersList();
        setUserList(updatedUsers);
      }
    } catch (e: any) {
      onShowToast('삭제 오류', e.message || '오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 📥 7. 문제 데이터 전체 백업 다운로드 (Export JSON)
  const handleExportQuestions = async () => {
    sound.playReward();
    setIsExportingQuestions(true);
    try {
      const questions = await adminExportAllQuestions();
      const jsonStr = JSON.stringify(questions, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ppokae_grammar_questions_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      onShowToast('📥 백업 다운로드 완료', `총 ${questions.length}개의 문제 데이터가 JSON 파일로 저장되었습니다.`, 'coin');
    } catch (e: any) {
      onShowToast('백업 오류', e.message || '문제 추출 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsExportingQuestions(false);
    }
  };

  // 📤 8. 문제 데이터 일괄 대량 등록 (Bulk Import JSON)
  const handleBulkImportQuestions = async () => {
    if (!bulkImportJsonText.trim()) {
      onShowToast('오류', 'JSON 문제 데이터를 입력해 주세요.', 'error');
      return;
    }
    sound.playReward();
    setIsImportingQuestions(true);
    try {
      const parsed = JSON.parse(bulkImportJsonText);
      const questionsArr = Array.isArray(parsed) ? parsed : [parsed];
      const res = await adminBulkImportQuestions(questionsArr);
      onShowToast('📤 일괄 등록 완료', `총 ${res.importedCount}개 문제가 성공적으로 등록되었습니다! (오류: ${res.errors}개)`, 'coin');
      setBulkImportJsonText('');
      setIsBulkImportOpen(false);
    } catch (e: any) {
      onShowToast('JSON 구문 오류', '올바른 JSON 배열 형식인지 확인해 주세요. (예: [{"sentence": "...", "answer": "...", "options": [...] }])', 'error');
    } finally {
      setIsImportingQuestions(false);
    }
  };

  // 💥 9. 문제 및 랭킹 회차 데이터 전면 삭제 & 클린 리셋 핸들러
  const handlePurgeAllQuestions = async () => {
    if (!window.confirm("⚠️ 경고: Firestore의 모든 문제(questions), 랭킹 회차(cycle_challenges), 오류 제보(reports) 및 로컬 캐시를 완전히 영구 삭제하고 클린 리셋하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.")) {
      return;
    }
    sound.playClick();
    setIsLoading(true);
    try {
      const res = await adminPurgeAndResetAllQuestionsAndCycles();
      if (res.success) {
        onShowToast(
          '💥 전면 초기화 완료!', 
          `문제 ${res.deletedQuestions}개, 랭킹 회차 ${res.deletedCycles}개, 제보 ${res.deletedReports}개가 완전히 삭제 및 초기화되었습니다.`, 
          'coin'
        );
        const updatedReports = await getPendingReports();
        setReports(updatedReports);
      } else {
        onShowToast('초기화 실패', res.error || '오류가 발생했습니다.', 'error');
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
            onClick={() => { sound.playClick(); setActiveTab('inquiries'); }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-300" />
            <span>💌 유저 문의 & 건의함 ({inquiries.length})</span>
          </button>

          <button
            onClick={() => { 
              sound.playClick(); 
              setActiveTab('reports'); 
              getPendingReports().then(setReports).catch(() => {});
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>🚨 문제 오류 신고 ({reports.filter(r => r.status === 'pending').length})</span>
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
                      버튼 클릭 한 번으로 내 관리자 계정에 <strong>🪙 999,999 코인</strong>, <strong>전체 {AVATAR_DATABASE.length}종 아바타 올 해금</strong>, <strong>마스터 티어</strong>, <strong>즐겨찾기 9,999칸</strong>을 즉시 부여합니다.
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
                    <h4 className="text-xl font-black text-purple-300">{(user.unlockedAvatars || []).length} / {AVATAR_DATABASE.length} 종</h4>
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

              {/* 📚 문제 데이터베이스 백업 & 일괄 대량 주입 (Pro Tools) */}
              <div className="p-5 rounded-3xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-black text-white">문제 은행 백업 & 대량 등록 (Pro Tools)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">JSON 데이터베이스 연동</span>
                </div>
                <p className="text-xs text-slate-400">
                  Firestore에 등록된 모든 문제(1~4레벨, 1~5형식)를 백업 파일로 추출하거나, JSON 포맷의 문제를 수십~수백 개씩 일괄 대량 등록합니다.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleExportQuestions}
                    disabled={isExportingQuestions}
                    className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{isExportingQuestions ? '데이터 추출 중...' : '📥 전체 문제 JSON 백업 다운로드'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setIsBulkImportOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md"
                  >
                    <Upload className="w-4 h-4 text-cyan-300" />
                    <span>📤 문제 JSON 일괄 대량 등록</span>
                  </button>
                </div>
              </div>

              {/* 💥 Danger Zone: 문제 및 랭킹 회차 데이터 전면 완전 삭제 & 클린 리셋 */}
              <div className="p-6 rounded-3xl bg-rose-950/40 border-2 border-rose-500/50 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black tracking-wider uppercase">
                        DANGER ZONE (초강력 리셋)
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        💥 문제 & 랭킹 회차 데이터 전면 삭제
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      기존에 생성되어 누적된 모든 이전 문제(questions), 랭킹전 회차(cycle_challenges), 오류 제보(reports) 및 로컬 캐시를 100% 완전 영구 삭제하고 청정 초기 상태로 클린 리셋합니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePurgeAllQuestions}
                    disabled={isLoading}
                    className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>💥 문제/회차 전면 완전 삭제</span>
                  </button>
                </div>
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
                  <span>실시간 푸시 공지 & 개인 맞춤 알림 발송</span>
                </h3>

                {/* 🎯 발송 대상 선택 (전체 유저 vs 특정 개인 유저) */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🎯 발송 대상자 선택</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAnnounceTargetType('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        announceTargetType === 'all'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🌐 전체 접속 유저 (전체 방송)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnounceTargetType('individual')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        announceTargetType === 'individual'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      👤 특정 개인 유저 지정 발송
                    </button>
                  </div>

                  {announceTargetType === 'individual' && (
                    <div className="pt-2 animate-in fade-in">
                      <label className="text-[10px] text-slate-400 mb-1 block">발송 대상 유저 선택:</label>
                      <select
                        value={targetUserName}
                        onChange={e => setTargetUserName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-indigo-500/50 rounded-xl text-xs font-bold text-indigo-200 focus:outline-none"
                      >
                        <option value="">-- 발송할 유저를 선택하세요 --</option>
                        {userList.map(u => (
                          <option key={u.name} value={u.name}>
                            {u.name} ({u.coins ?? 200} 코인, {u.tier || 'Bronze'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

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
                    placeholder="알림 팝업 및 보관함에 표시될 상세 내용을 입력하세요."
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
                    disabled={isLoading || !newAnnounceTitle.trim() || (announceTargetType === 'individual' && !targetUserName.trim())}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{announceTargetType === 'individual' ? `[${targetUserName || '유저 선택'}] 개인 푸시 발송` : '전체 유저에게 푸시 발송'}</span>
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase">
                              {ann.badgeType}
                            </span>
                            {ann.targetUserName ? (
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black">
                                👤 {ann.targetUserName} 전용
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black">
                                🌐 전체 대상
                              </span>
                            )}
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

                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all shrink-0"
                          title="공지 삭제 / 비활성화"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 💌 TAB 4. 유저 문의 & 건의함 (User Inquiries & Voices) */}
          {/* ========================================================================= */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <span>유저의 목소리함 (문의 / 건의 / 피드백 총 {inquiries.length}건)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    유저들이 '문의하기'를 통해 보낸 기능 제안, 버그 제보, 질문, 응원 메시지를 실시간 확인합니다.
                  </p>
                </div>

                <button
                  onClick={loadInitialData}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>새로고침</span>
                </button>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-slate-800 text-slate-500 text-sm">
                  아직 접수된 유저 문의가 없습니다. 뽀개가 순항 중입니다! ✨
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map(inq => {
                    const categoryBadge = 
                      inq.category === 'idea' ? { label: '💡 기능 제안', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' } :
                      inq.category === 'bug' ? { label: '🐛 버그 제보', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' } :
                      inq.category === 'question' ? { label: '❓ 질문/문의', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' } :
                      { label: '❤️ 응원 피드백', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };

                    return (
                      <div key={inq.id} className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black ${categoryBadge.color}`}>
                              {categoryBadge.label}
                            </span>
                            <span className="text-xs font-black text-white">
                              작성자: <strong className="text-indigo-300">{inq.userName}</strong>
                            </span>
                            {inq.userEmail && (
                              <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                                ✉️ {inq.userEmail}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 ml-auto">{inq.dateStr || '최근'}</span>
                          </div>

                          <button
                            onClick={async () => {
                              if (!inq.id) return;
                              if (window.confirm("이 문의 내역을 삭제하시겠습니까?")) {
                                const ok = await deleteUserInquiry(inq.id);
                                if (ok) {
                                  onShowToast("삭제 완료", "문의 내역이 삭제되었습니다.", "info");
                                  loadInitialData();
                                }
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-700/60 transition-colors"
                            title="문의 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-3.5 bg-slate-900/80 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed border border-slate-800 whitespace-pre-wrap font-sans">
                          {inq.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🚨 TAB 5. 문의 & 문제 신고 관리 (Reports & Support Center) */}
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
                    유저들이 접수한 문제 오류 제보를 검토하고, AI로 문제 선지/해설을 재구성하거나 승인 시 포상금(🪙 50 코인)을 즉시 지급합니다. (제보자는 100% 익명 보호)
                  </p>
                </div>

                <button
                  onClick={async () => {
                    sound.playClick();
                    setIsLoading(true);
                    try {
                      const updated = await getPendingReports();
                      setReports(updated);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-slate-800 text-slate-500 text-sm">
                  접수된 문제 오류 신고가 없습니다. 시스템이 아주 깨끗합니다! 🎉
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => {
                    const aiFixed = report.id ? regeneratedQuestionsMap[report.id] : null;
                    const isRegenerating = regeneratingReportId === report.id;

                    return (
                      <div key={report.id} className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4 shadow-lg">
                        
                        {/* Header info */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                                {REPORT_TYPE_LABELS[report.reportType] || report.reportType}
                              </span>
                              <span className="text-xs font-black text-slate-300 flex items-center gap-1">
                                제보자: <strong className="text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">익명의 제보자 🕵️</strong>
                              </span>
                              <span className="text-[10px] text-slate-500">{report.dateStr}</span>
                            </div>

                            {/* Question sentence */}
                            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-purple-300 font-bold">문항 #{report.questionForm}형식</span>
                                <span className="text-emerald-400 font-bold">현재 정답: "{report.questionAnswer}"</span>
                              </div>
                              <h4 className="text-sm font-bold text-white font-mono">
                                "{report.questionSentence}"
                              </h4>
                              {report.questionTranslation && (
                                <p className="text-xs text-slate-400">
                                  {report.questionTranslation}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* 🤖 AI 선지/해설 재구성 버튼 */}
                            <button
                              onClick={() => handleRegenerateQuestionForReport(report)}
                              disabled={isRegenerating}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {isRegenerating ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>AI 선지/해설 재구성 중...</span>
                                </>
                              ) : (
                                <>
                                  <Bot className="w-3.5 h-3.5 text-indigo-200" />
                                  <span>🤖 AI로 선지/해설/정답 재구성</span>
                                </>
                              )}
                            </button>

                            {report.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApproveReport(report, false)}
                                  disabled={isLoading}
                                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>승인 (🪙 50 지급)</span>
                                </button>
                                <button
                                  onClick={() => handleRejectReport(report.id || '')}
                                  disabled={isLoading}
                                  className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-all active:scale-95"
                                >
                                  <span>반려</span>
                                </button>
                              </>
                            ) : (
                              <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                                report.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-slate-400'
                              }`}>
                                {report.status === 'approved' ? '✓ 승인 완료 (🪙 50 지급됨)' : '✕ 반려됨'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* User Feedback */}
                        <div className="p-3.5 bg-slate-900/60 rounded-2xl text-xs space-y-1 border border-slate-800/80">
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                            <span>💬 익명 제보자의 피드백:</span>
                          </span>
                          <p className="text-slate-200 font-medium leading-relaxed">{report.userFeedback}</p>
                        </div>

                        {/* 🤖 AI 정밀 교정안 카드 (AI Regenerated Preview) */}
                        {aiFixed && (
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border-2 border-indigo-500/50 shadow-xl space-y-3 animate-in fade-in">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-500/30">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-xs font-black flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                  AI 정밀 교정본 (100% 정답-해설 동기화)
                                </span>
                                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/40">
                                  정답: {aiFixed.answer}
                                </span>
                              </div>

                              <button
                                onClick={() => handleApproveReport(report, true)}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>💾 이 AI 교정안으로 DB 적용 및 승인 (🪙 50 지급)</span>
                              </button>
                            </div>

                            <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-500/30 space-y-1">
                              <p className="text-sm font-bold text-white font-mono">
                                {aiFixed.sentence}
                              </p>
                              <p className="text-xs text-slate-300">
                                {aiFixed.translation}
                              </p>
                            </div>

                            {/* 4 Options Breakdown */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {aiFixed.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                                    opt.is_correct
                                      ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200 shadow-sm'
                                      : 'bg-slate-900/70 border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-bold">
                                    <span>{oIdx + 1}. {opt.text}</span>
                                    <span>{opt.is_correct ? '✅ 정답' : '❌ 오답'}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-tight">
                                    {opt.feedback}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Chunk pattern & Nuance */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200">
                                <span className="font-bold text-amber-300 block mb-0.5">🧩 핵심 문형 패턴</span>
                                <span>{aiFixed.explanation?.chunk_pattern}</span>
                              </div>
                              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-200">
                                <span className="font-bold text-cyan-300 block mb-0.5">💡 원어민 뉘앙스</span>
                                <span>{aiFixed.explanation?.nuance}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AI 1st Audit Summary if existed */}
                        {report.auditResult && !aiFixed && (
                          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                              <Bot className="w-3.5 h-3.5" />
                              <span>AI 1차 심사 소견 ({report.auditResult.isAccepted ? '승인 권고' : '반려 권고'})</span>
                            </div>
                            <p className="text-slate-300 text-[11px]">{report.auditResult.reason}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                      <th className="p-3.5">아바타 보유수</th>
                      <th className="p-3.5">보관함 용량</th>
                      <th className="p-3.5 text-right">슈퍼 제어</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">
                          검색 조건에 일치하는 등록 유저가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 flex items-center gap-2.5">
                            <span className="text-2xl">{u.avatar || '🦁'}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-white">{u.name}</span>
                                {u.isAdmin && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                                    👑 관리자
                                  </span>
                                )}
                                {u.email && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">
                                    구글
                                  </span>
                                )}
                              </div>
                              {u.email && <p className="text-[10px] text-slate-500">{u.email}</p>}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-black text-amber-300">🪙 {(u.coins ?? 200).toLocaleString()}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-purple-300">{u.tier || 'Bronze'}</span>
                            <span className="text-[10px] text-slate-500 block">{(u.xp || 0).toLocaleString()} XP</span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-300">
                            {u.totalSolved || 0}문제 
                            <span className="text-[10px] text-emerald-400 block font-normal">
                              ({u.totalSolved ? Math.round(((u.totalCorrect || 0) / u.totalSolved) * 100) : 0}% 정답)
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-300">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                              {(u.unlockedAvatars || []).length} / {AVATAR_DATABASE.length}종
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-emerald-300 font-mono">
                            {u.bookmarkLimit || 50}칸
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleOpenUserDetail(u)}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-black text-xs transition-all active:scale-95 flex items-center gap-1.5 ml-auto shadow-md"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-cyan-300" />
                              <span>관리 & 제어</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 👑 User Super Control Modal Overlay */}
              {selectedUserForDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                  <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-5 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{selectedUserForDetail.avatar || '🦁'}</span>
                        <div>
                          <h4 className="text-base font-black text-white flex items-center gap-2">
                            <span>[{selectedUserForDetail.name}] 슈퍼 제어 콘솔</span>
                          </h4>
                          <p className="text-xs text-slate-400">
                            {selectedUserForDetail.email || 'PIN 로그인 계정'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUserForDetail(null)}
                        className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs custom-scrollbar">
                      
                      {/* 1. 코인 조정 */}
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                        <label className="font-black text-amber-300 flex items-center gap-1.5">
                          <Coins className="w-4 h-4" />
                          <span>보유 코인 직접 설정</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editUserCoins}
                            onChange={e => setEditUserCoins(parseInt(e.target.value) || 0)}
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-black text-amber-300 focus:outline-none"
                          />
                          <span className="text-xs font-bold text-amber-400 shrink-0">코인</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[+100, +500, +1000, +5000].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setEditUserCoins(prev => Math.max(0, prev + amt))}
                              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-[11px] text-amber-300"
                            >
                              +{amt}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setEditUserCoins(999999)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[11px]"
                          >
                            999,999 맥스
                          </button>
                        </div>
                      </div>

                      {/* 2. 경험치 (XP) & 티어 설정 */}
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                        <label className="font-black text-purple-300 flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          <span>경험치(XP) 및 티어 직접 설정</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editUserXp}
                            onChange={e => setEditUserXp(parseInt(e.target.value) || 0)}
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-black text-purple-300 focus:outline-none"
                          />
                          <span className="text-xs font-bold text-purple-400 shrink-0">XP</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          {[
                            { label: '🥉 Bronze', xp: 0 },
                            { label: '🥈 Silver', xp: 200 },
                            { label: '🥇 Gold', xp: 500 },
                            { label: '💎 Platinum', xp: 1000 },
                            { label: '🔷 Diamond', xp: 2000 },
                            { label: '👑 Master', xp: 3500 },
                            { label: '🔮 GM', xp: 5000 },
                            { label: '⚡ Challenger', xp: 8000 },
                          ].map(t => (
                            <button
                              key={t.label}
                              type="button"
                              onClick={() => setEditUserXp(t.xp)}
                              className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                editUserXp === t.xp 
                                  ? 'bg-purple-600 text-white border-purple-400' 
                                  : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300 border-slate-600'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. 북마크 보관함 용량 */}
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                        <label className="font-black text-emerald-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>즐겨찾기 보관함 용량 한도</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {[50, 100, 200, 500, 9999].map(limit => (
                            <button
                              key={limit}
                              type="button"
                              onClick={() => setEditUserBookmarkLimit(limit)}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                editUserBookmarkLimit === limit
                                  ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400'
                                  : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300 border-slate-600'
                              }`}
                            >
                              {limit}칸
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4. 아바타 선물 & 전체 올 해금 */}
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                        <label className="font-black text-pink-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Gift className="w-4 h-4" />
                            <span>아바타 강제 해금 & 선물</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            보유: {(selectedUserForDetail.unlockedAvatars || []).length}/{AVATAR_DATABASE.length}종
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={selectedAvatarToGift}
                            onChange={e => setSelectedAvatarToGift(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                          >
                            <optgroup label="✨ 신화 / 전설 / 에픽 아바타">
                              {AVATAR_DATABASE.filter(a => a.grade !== 'starter').map(a => (
                                <option key={a.id} value={a.id}>
                                  {a.icon} {a.name} [{a.grade.toUpperCase()}]
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleGiftAvatarToUser(selectedAvatarToGift)}
                            className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shrink-0 shadow-md"
                          >
                            🎁 해금 선물
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleGiftAvatarToUser('ALL')}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-xs shadow-md active:scale-95 transition-all"
                        >
                          ✨ {AVATAR_DATABASE.length}종 전설 아바타 전체 올 해금 (God Mode)
                        </button>
                      </div>

                      {/* 5. 위험 구역: 계정 영구 삭제 */}
                      <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-600/40 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-rose-300 block text-xs">계정 및 학습 기록 완전 삭제</span>
                          <span className="text-[10px] text-slate-400">오답노트, 북마크, 랭킹 기록 포함 삭제</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteUserDirectly(selectedUserForDetail.name)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0"
                        >
                          🗑️ 계정 삭제
                        </button>
                      </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-800 flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForDetail(null)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                      >
                        닫기
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveUserDetail}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all"
                      >
                        👑 변경사항 즉시 저장
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
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>랭킹전 고스트 플레이어 (더미 랭커) 사령탑</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    실제 유저와 100% 동일한 데이터 스키마로 자연스러운 고유 랭킹 데이터를 실시간 일괄 생성 및 주입합니다.
                  </p>
                </div>

                {/* 모드 전환 탭 */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setGhostMode('batch')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      ghostMode === 'batch'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👥 N명 일괄 자동 투입</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGhostMode('single')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      ghostMode === 'single'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🎯 1명 정밀 수동 주입</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 📝 1. 일괄 자동 투입 모드 */}
                {ghostMode === 'batch' ? (
                  <div className="p-5 rounded-3xl bg-slate-800/80 border border-amber-500/30 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span>고스트 여러 마리 일괄 투입 설정</span>
                      </h4>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        중복 0% & 시간 분산 보장
                      </span>
                    </div>

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

                    {/* 투입 인원 수 프리셋 & 슬라이더 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">투입할 고스트 인원 수</label>
                        <span className="text-sm font-black text-amber-300 font-mono">
                          {ghostBatchCount} 명
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={50}
                        value={ghostBatchCount}
                        onChange={e => setGhostBatchCount(parseInt(e.target.value) || 1)}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    {/* 정답 문제 수 (점수 범위) 설정 */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">점수 난수 범위 (맞힌 문제 수)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-1">최소 정답 수</span>
                          <select
                            value={ghostMinCorrect}
                            onChange={e => setGhostMinCorrect(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <option key={n} value={n}>{n}문제 ({[10, 10, 15, 15, 15, 25, 25, 25, 30, 30].slice(0, n).reduce((a, b) => a + b, 0)}점)</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-1">최대 정답 수</span>
                          <select
                            value={ghostMaxCorrect}
                            onChange={e => setGhostMaxCorrect(parseInt(e.target.value) || 10)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <option key={n} value={n}>{n}문제 ({[10, 10, 15, 15, 15, 25, 25, 25, 30, 30].slice(0, n).reduce((a, b) => a + b, 0)}점)</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        * 각 고스트는 {ghostMinCorrect}문제~{ghostMaxCorrect}문제 사이에서 고유한 점수를 부여받습니다.
                      </p>
                    </div>

                    {/* 시간 분산 범위 설정 */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">완료 시간 분산 간격</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-1">최소 경과 시간</span>
                          <select
                            value={ghostMinMinutesAgo}
                            onChange={e => setGhostMinMinutesAgo(parseInt(e.target.value) || 5)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                          >
                            <option value={5}>5분 전</option>
                            <option value={15}>15분 전</option>
                            <option value={30}>30분 전</option>
                            <option value={60}>1시간 전</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-1">최대 경과 시간</span>
                          <select
                            value={ghostMaxMinutesAgo}
                            onChange={e => setGhostMaxMinutesAgo(parseInt(e.target.value) || 360)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                          >
                            <option value={120}>2시간 전까지</option>
                            <option value={240}>4시간 전까지</option>
                            <option value={360}>6시간 전까지</option>
                            <option value={480}>8시간 전까지</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 3대 안심 특성 뱃지 */}
                    <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700/60 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-300 font-bold">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-amber-400 text-sm">🔒</span>
                        <span>중복 닉네임 0%</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-cyan-400 text-sm">⏱️</span>
                        <span>시간대 100% 분산</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-purple-400 text-sm">🪐</span>
                        <span>104종 아바타 착용</span>
                      </div>
                    </div>

                    {/* 일괄 투입 & 청소 버튼 */}
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={handleBatchInjectGhosts}
                        disabled={isBatchInjecting}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Trophy className="w-4 h-4 fill-slate-950" />
                        <span>{isBatchInjecting ? '대량 투입 중...' : `오늘 ${ghostCycleIndex}차전에 고스트 ${ghostBatchCount}명 일괄 투입하기 🚀`}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearGhosts}
                        disabled={isClearingGhosts}
                        className="w-full py-2 bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isClearingGhosts ? '청소 중...' : `오늘 ${ghostCycleIndex}차전 고스트 랭커 데이터 전체 삭제 (클린업)`}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 📝 2. 단일 1명 정밀 수동 주입 폼 */
                  <form onSubmit={handleInjectGhostPlayer} className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
                    <h4 className="text-sm font-black text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>단일 고스트 1명 프로필 & 점수 수동 설정</span>
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
                                ? 'bg-purple-500 text-white font-black shadow-md'
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
                          className="text-[11px] text-purple-300 hover:text-purple-200 font-bold flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/30 transition-all"
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
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* 🎭 고스트 대표 아바타 프로필 설정 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">장착할 대표 아바타 프로필</label>
                        <span className="text-[11px] text-purple-300 font-bold">
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
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-400"
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
                        <optgroup label="🔮 영웅 (15.0% 에픽 아바타)">
                          {AVATAR_DATABASE.filter(a => a.grade === 'epic').map(a => (
                            <option key={a.id} value={a.id}>{a.icon} {a.name} [에픽]</option>
                          ))}
                        </optgroup>
                        <optgroup label="🎖️ 희귀 (30.0% 희귀 아바타)">
                          {AVATAR_DATABASE.filter(a => a.grade === 'rare').map(a => (
                            <option key={a.id} value={a.id}>{a.icon} {a.name} [희귀]</option>
                          ))}
                        </optgroup>
                        <optgroup label="🌿 일반 (48.95% 일반 아바타)">
                          {AVATAR_DATABASE.filter(a => a.grade === 'common').map(a => (
                            <option key={a.id} value={a.id}>{a.icon} {a.name} [일반]</option>
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
                        <span className="text-xs font-black text-purple-300 font-mono">
                          {ghostCorrectCount}문제 / 10문제 ({[10, 10, 15, 15, 15, 25, 25, 25, 30, 30].slice(0, ghostCorrectCount).reduce((a, b) => a + b, 0)}점)
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={ghostCorrectCount}
                        onChange={e => setGhostCorrectCount(parseInt(e.target.value) || 1)}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>1개(10점)</span>
                        <span>5개(65점)</span>
                        <span>8개(140점)</span>
                        <span>10개(200점 만점)</span>
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
                      className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>{isInjectingGhost ? '주입 중...' : `오늘 ${ghostCycleIndex}차전에 [${ghostName}] (${ghostCorrectCount * 10}점) 단일 주입`}</span>
                    </button>
                  </form>
                )}

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

        {/* 📤 문제 JSON 일괄 대량 등록 모달 (Bulk Import Modal) */}
        {isBulkImportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 border-2 border-indigo-500/70 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">문제 데이터 JSON 일괄 대량 등록 (Bulk Import)</h4>
                    <p className="text-xs text-slate-400">JSON 형식의 문제 배열을 입력하여 Firestore에 즉시 등록합니다.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBulkImportOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>JSON 배열 형식 (form: 1~5, level: level1~4, sentence, answer, options)</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = [
                        {
                          form: 1,
                          level: "level1",
                          sentence: "The train ___ on time every morning.",
                          answer: "arrives",
                          korean: "그 기차는 매일 아침 정시에 도착한다.",
                          options: [
                            { text: "arrives", isCorrect: true, feedback: "1형식 완전자동사 arrives가 올바릅니다." },
                            { text: "arrive", isCorrect: false, feedback: "3인칭 단수 주어입니다." },
                            { text: "arriving", isCorrect: false, feedback: "본동사 자리입니다." },
                            { text: "arrival", isCorrect: false, feedback: "명사는 동사 자리에 올 수 없습니다." }
                          ]
                        }
                      ];
                      setBulkImportJsonText(JSON.stringify(sample, null, 2));
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline"
                  >
                    샘플 템플릿 채우기
                  </button>
                </div>

                <textarea
                  value={bulkImportJsonText}
                  onChange={e => setBulkImportJsonText(e.target.value)}
                  placeholder='[\n  {\n    "form": 1,\n    "level": "level1",\n    "sentence": "The dog ___ loudly.",\n    "answer": "barked",\n    "options": [\n      { "text": "barked", "isCorrect": true, "feedback": "1형식 동사입니다." },\n      { "text": "barking", "isCorrect": false, "feedback": "동사 자리입니다." }\n    ]\n  }\n]'
                  className="w-full flex-1 min-h-[220px] p-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-400 custom-scrollbar"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleBulkImportQuestions}
                  disabled={isImportingQuestions || !bulkImportJsonText.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isImportingQuestions ? '데이터 등록 중...' : '📤 Firestore에 일괄 등록 실행'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
