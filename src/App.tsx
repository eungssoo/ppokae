import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  ViewType, 
  QuizMode, 
  Question, 
  DifficultyLevel, 
  WeaknessAnalysis, 
  WeaknessRecord, 
  RankingItem,
  CycleInfo,
  ExpressionItem,
  BookmarkItem,
  FormMastery,
  AvatarItem
} from './types';
import { 
  authenticateUser, 
  signInWithGoogle,
  linkGoogleAccount,
  updateUserProfile,
  deleteUserAccount,
  recordQuizResultStats,
  getUserMasteryStats,
  saveQuestionsToFirestore, 
  getRandomQuestions, 
  savePersonalQuestionsToFirestore, 
  getRandomPersonalQuestions, 
  getOrCreateCycleQuestions, 
  saveIncorrectQuestion, 
  getWeaknessAnalysis, 
  getUserIncorrectQuestions, 
  saveAndGetCycleRankings, 
  getCycleRankings, 
  getAllSavedQuestions,
  getCurrentCycleInfo,
  getTodayDateString,
  addCoins,
  deductCoins,
  hasUserCompletedCycle,
  recordCycleAttemptStart,
  getUserCoins,
  getExpressionsByCategory,
  getExpressionCounts,
  getQuestionCountsByLevel,
  saveExpressionsToFirestore,
  checkGenerationCooldown,
  recordGenerationTimestamp,
  toggleBookmark,
  getBookmarks,
  getBookmarkLimit,
  expandBookmarkLimit,
  changeUserNickname,
  drawGachaAvatar,
  equipUserAvatar,
  checkGoogleRedirectResult,
  getSystemSettings,
  DEFAULT_SYSTEM_SETTINGS,
  checkIsAdmin,
  calculateCycleReward,
  addXp,
  getUserProfileData,
  calculateTier,
  getQuestionFormStatsByLevel,
  getRankingQuestionPoints
} from './services/dbService';
import { auth } from './config/firebase';
import { STARTER_AVATAR_IDS } from './services/avatarService';
import { generateBulkQuestions, generateNativeExpressions } from './services/geminiService';
import { trackUserAction } from './services/analyticsService';
import { sound } from './services/soundService';

// Components
import { LoadingOverlay } from './components/LoadingOverlay';
import { LoginView } from './components/LoginView';
import { MainMenuView } from './components/MainMenuView';
import { DifficultySelectView } from './components/DifficultySelectView';
import { QuizView } from './components/QuizView';
import { RankingBoardView } from './components/RankingBoardView';
import { WeaknessReportView } from './components/WeaknessReportView';
import { IncorrectListView } from './components/IncorrectListView';
import { DbExplorerView } from './components/DbExplorerView';
import { RevengeModal } from './components/RevengeModal';
import { ExpressionSelectView, EXPRESSION_CATEGORIES } from './components/ExpressionSelectView';
import { ExpressionStudyView } from './components/ExpressionStudyView';
import { BookmarkedListView } from './components/BookmarkedListView';
import { ActionConfirmModal, ActionModalConfig } from './components/ActionConfirmModal';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { ProfileView } from './components/ProfileView';
import { AvatarGachaModal } from './components/AvatarGachaModal';
import { ReportCenterModal } from './components/ReportCenterModal';
import { AdminCenterModal } from './components/AdminCenterModal';
import { AddToHomeScreenModal } from './components/AddToHomeScreenModal';
import { ToastProvider, useToast } from './components/ToastContainer';
import { SystemSettings } from './types';

function AppContent() {
  const toast = useToast();

  // User Profile
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ai_grammar_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Cycle Info State
  const [currentCycle, setCurrentCycle] = useState<CycleInfo>(() => getCurrentCycleInfo());
  const [selectedCycleTab, setSelectedCycleTab] = useState<1 | 2 | 3>(() => getCurrentCycleInfo().cycleIndex);

  // Revenge Modal State
  const [isRevengeModalOpen, setIsRevengeModalOpen] = useState<boolean>(false);
  const [previousCycleScore, setPreviousCycleScore] = useState<number>(0);

  // Gacha & Report & Admin & Notification Modal State
  const [isGachaModalOpen, setIsGachaModalOpen] = useState<boolean>(false);
  const [isReportCenterOpen, setIsReportCenterOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);

  // PWA Home Screen Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAddToHomeModalOpen, setIsAddToHomeModalOpen] = useState<boolean>(false);
  const [quizCompletionStats, setQuizCompletionStats] = useState<{
    correctCount: number;
    totalQuestions: number;
    earnedCoins: number;
    earnedXp: number;
  }>({ correctCount: 0, totalQuestions: 10, earnedCoins: 0, earnedXp: 0 });

  // Action Confirmation Modal State
  const [actionModalConfig, setActionModalConfig] = useState<ActionModalConfig | null>(null);

  // Expression Lab State
  const [selectedExpCategory, setSelectedExpCategory] = useState<'daily' | 'business' | 'travel' | 'pattern'>('daily');
  const [expressions, setExpressions] = useState<ExpressionItem[]>([]);
  const [expressionCounts, setExpressionCounts] = useState<Record<string, number>>({ daily: 0, business: 0, travel: 0, pattern: 0 });
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({ 'Level 1': 0, 'Level 2': 0, 'Level 3': 0, 'Level 4': 0 });

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bookmarkLimit, setBookmarkLimit] = useState<number>(50);

  // Mastery Analytics State
  const [masteryStats, setMasteryStats] = useState<{ formMasteries: FormMastery[]; totalSolved: number; totalCorrect: number; overallAccuracy: number }>({
    formMasteries: [1, 2, 3, 4, 5].map(f => ({ form: f, total: 0, correct: 0, accuracy: 0, grade: 'C' })),
    totalSolved: 0,
    totalCorrect: 0,
    overallAccuracy: 0
  });

  // Cooldown State
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Navigation & View
  const [view, setView] = useState<ViewType>('login');
  const [quizMode, setQuizMode] = useState<QuizMode>('normal');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  // Loading & Progress
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('처리 중...');
  const [progress, setProgress] = useState<number>(0);

  // Quiz Session State
  const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // Data Collections State
  const [totalPublicQuestions, setTotalPublicQuestions] = useState<number>(0);
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [weaknessData, setWeaknessData] = useState<WeaknessAnalysis>({ total: 0, forms: {} });
  const [incorrectList, setIncorrectList] = useState<WeaknessRecord[]>([]);
  const [dbData, setDbData] = useState<Record<string, Question[]>>({});

  // Refresh user data & counts from DB (코인, 경험치 XP, 티어, 북마크 완벽 동기화)
  const refreshUserData = async (userName: string) => {
    const prof = await getUserProfileData(userName);
    const bList = await getBookmarks(userName);
    const mStats = await getUserMasteryStats(userName);
    const expCounts = await getExpressionCounts();
    const qCounts = await getQuestionCountsByLevel();

    setBookmarks(bList);
    setBookmarkLimit(prof?.bookmarkLimit || 50);
    setMasteryStats(mStats);
    setExpressionCounts(expCounts);
    setUser(prev => {
      if (!prof && !prev) return null;
      const updated: UserProfile = {
        name: prof?.name || prev?.name || userName,
        pin: prof?.pin || prev?.pin || '000000',
        coins: prof?.coins ?? prev?.coins ?? 200,
        xp: prof?.xp ?? prev?.xp ?? 0,
        tier: prof?.tier || prev?.tier || 'Bronze',
        bookmarkLimit: prof?.bookmarkLimit ?? prev?.bookmarkLimit ?? 50,
        avatar: prof?.avatar || prev?.avatar || '🦁',
        currentAvatarId: prof?.currentAvatarId || prev?.currentAvatarId || 'lion',
        unlockedAvatars: prof?.unlockedAvatars || prev?.unlockedAvatars || STARTER_AVATAR_IDS,
        totalSolved: mStats.totalSolved || prof?.totalSolved || prev?.totalSolved || 0,
        totalCorrect: mStats.totalCorrect || prof?.totalCorrect || prev?.totalCorrect || 0,
        dailyGoal: prof?.dailyGoal ?? prev?.dailyGoal ?? 10,
        email: prof?.email || prev?.email,
        photoURL: prof?.photoURL || prev?.photoURL,
        isAdmin: !!prof?.isAdmin,
        createdAt: prof?.createdAt || prev?.createdAt
      };
      localStorage.setItem('ai_grammar_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Cooldown timer & Cycle timer tick
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = getCurrentCycleInfo();
      setCurrentCycle(updated);

      if (user) {
        const cd = await checkGenerationCooldown(user.name);
        setCooldownSeconds(cd.remainingSeconds);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.name]);

  // Sync user view & counts & load global system settings
  useEffect(() => {
    // ⚙️ Load live system settings
    getSystemSettings().then(setSystemSettings);

    if (user) {
      setView('menu');
      loadTotalPublicQuestions();
      refreshUserData(user.name);
    } else {
      setView('login');
    }
  }, [user?.name]);

  // Simulated progress timer when loading
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setProgress(10);
      timer = setInterval(() => {
        setProgress(old => (old >= 92 ? old : old + Math.floor(Math.random() * 6) + 2));
      }, 400);
    } else {
      setProgress(100);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  // Load question counts
  const loadTotalPublicQuestions = async () => {
    try {
      const allQ = await getAllSavedQuestions();
      let count = 0;
      Object.values(allQ).forEach(arr => { count += arr.length; });
      setTotalPublicQuestions(count);
      const qCounts = await getQuestionCountsByLevel();
      setQuestionCounts(qCounts);
    } catch (e) {
      console.error(e);
    }
  };

  // 1. PIN Login / Account Creation Handler
  const handleLogin = async (name: string, pin: string, starterAvatarId?: string) => {
    sound.playClick();
    setIsLoading(true);
    setLoadingText('로그인 확인 중...');
    const result = await authenticateUser(name, pin, starterAvatarId);
    setIsLoading(false);

    if (result.success && result.profile) {
      localStorage.setItem('ai_grammar_user', JSON.stringify(result.profile));
      setUser(result.profile);
      setBookmarkLimit(result.profile.bookmarkLimit || 50);
      setView('menu');
      await refreshUserData(result.profile.name);
      toast.coin(`환영합니다, ${result.profile.name}님!`, `🪙 ${result.profile.coins} 코인이 충전되었습니다.`);
      trackUserAction('LOGIN', `PIN Login: ${result.profile.name}`, result.profile);
    } else {
      toast.error('로그인 실패', result.error || 'PIN 번호를 확인해 주세요.');
    }
  };

  // 🔐 Check Google Redirect Auth Result on app startup
  useEffect(() => {
    checkGoogleRedirectResult().then(async profile => {
      if (profile) {
        localStorage.setItem('ai_grammar_user', JSON.stringify(profile));
        setUser(profile);
        setBookmarkLimit(profile.bookmarkLimit || 50);
        setView('menu');
        await refreshUserData(profile.name);
        toast.coin(`구글 로그인 완료! 🎉`, `환영합니다, ${profile.name}님!`);
        trackUserAction('LOGIN', `Google Redirect: ${profile.name}`, profile);
      }
    });
  }, []);

  // 📲 1-1. PWA Home Screen Prompt Event Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 🔐 1-2. Official Cryptographic Google OAuth Login Handler
  const handleGoogleLogin = async () => {
    sound.playClick();
    setIsLoading(true);
    setLoadingText('구글 계정 인증 중...');

    try {
      const result = await signInWithGoogle();
      if (result.success && result.profile) {
        localStorage.setItem('ai_grammar_user', JSON.stringify(result.profile));
        setUser(result.profile);
        setBookmarkLimit(result.profile.bookmarkLimit || 50);
        setView('menu');
        await refreshUserData(result.profile.name);
        toast.coin(`구글 로그인 성공! 🎉`, `환영합니다, ${result.profile.name}님!`);
        trackUserAction('LOGIN', `Google OAuth: ${result.profile.name}`, result.profile);
      } else {
        toast.error('구글 로그인 안내', result.error || '구글 인증이 취소되었습니다.');
      }
    } catch (e: any) {
      toast.error('구글 로그인 오류', e.message || '인증 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔐 1-3. Link Google Account to PIN User Profile Handler
  const handleLinkGoogleAccount = async () => {
    if (!user) return;
    sound.playClick();
    setIsLoading(true);
    setLoadingText('구글 계정 연동 중...');

    try {
      const result = await linkGoogleAccount(user);
      if (result.success && result.profile) {
        localStorage.setItem('ai_grammar_user', JSON.stringify(result.profile));
        setUser(result.profile);
        toast.coin('구글 계정 연동 완료! 🎉', `모든 학습 데이터와 코인이 안전하게 영구 보관됩니다.`);
      } else {
        toast.error('구글 연동 안내', result.error || '구글 연동이 취소되었습니다.');
      }
    } catch (e: any) {
      toast.error('구글 연동 오류', e.message || '연동 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Handler (Firebase Auth 세션 및 로컬 세션 완전 초기화)
  const handleLogout = async () => {
    sound.playClick();
    localStorage.removeItem('ai_grammar_user');
    try {
      await auth.signOut();
    } catch (e) {
      console.warn("auth.signOut error:", e);
    }
    setUser(null);
    setView('login');
    toast.info('로그아웃되었습니다.');
  };

  // 🎯 Update Daily Goal
  const handleUpdateDailyGoal = async (goal: number) => {
    if (!user) return;
    await updateUserProfile(user.name, { dailyGoal: goal });
    setUser(prev => prev ? { ...prev, dailyGoal: goal } : null);
    toast.success('학습 목표 갱신', `하루 ${goal}문제 목표가 저장되었습니다.`);
  };

  // ✏️ 닉네임 변경 요청 핸들러 (코인 30 소모)
  const handleRequestChangeNickname = (newName: string) => {
    if (!user) return;

    setActionModalConfig({
      isOpen: true,
      type: 'custom',
      title: '닉네임 변경 확인',
      subtitle: `닉네임을 [${user.name}]에서 [${newName}] (으)로 변경하시겠습니까?`,
      cost: 30,
      icon: '✏️',
      confirmButtonText: '닉네임 변경 (🪙 30 소모)',
      notices: [
        '변경 즉시 🪙 30 코인이 차감됩니다.',
        '명예의 전당 랭킹 및 오답 노트 등 모든 기록이 새 닉네임으로 승계됩니다.'
      ],
      onConfirm: async () => {
        setActionModalConfig(null);
        setIsLoading(true);
        setLoadingText('닉네임 변경 및 데이터 이전 중...');
        const res = await changeUserNickname(user.name, newName, 30);
        setIsLoading(false);

        if (res.success && res.newName) {
          const updatedUser: UserProfile = {
            ...user,
            name: res.newName,
            coins: res.newCoins ?? user.coins
          };
          localStorage.setItem('ai_grammar_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          toast.coin('닉네임 변경 완료! 🎉', `새로운 닉네임 [${res.newName}] (으)로 활동합니다.`);
        } else {
          toast.error('변경 실패', res.error || '닉네임을 변경할 수 없습니다.');
        }
      },
      onClose: () => setActionModalConfig(null),
      onEarnCoins: () => {
        setActionModalConfig(null);
        setView('solve_select');
      }
    });
  };

  // 🎰 아바타 가챠 뽑기 실행
  const handleDrawGacha = async (count: 1 | 10) => {
    if (!user) return { success: false, error: "로그인이 필요합니다." };

    const res = await drawGachaAvatar(user.name, count);
    if (res.success) {
      await refreshUserData(user.name);
      if (res.newlyUnlockedIds && res.newlyUnlockedIds.length > 0) {
        setUser(prev => prev ? {
          ...prev,
          coins: res.newCoins,
          unlockedAvatars: Array.from(new Set([...(prev.unlockedAvatars || STARTER_AVATAR_IDS), ...res.newlyUnlockedIds!]))
        } : null);
      }
    }
    return res;
  };

  // 👕 아바타 장착 핸들러 (보유 중인 모든 아바타는 100% 무료로 즉시 장착)
  const handleEquipAvatar = async (avatar: AvatarItem) => {
    if (!user) return;
    executeEquipAvatar(avatar, 0);
  };

  const executeEquipAvatar = async (avatar: AvatarItem, cost: number) => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText('아바타 변경 중...');
    const res = await equipUserAvatar(user.name, avatar, cost);
    setIsLoading(false);

    if (res.success) {
      setUser(prev => prev ? {
        ...prev,
        avatar: avatar.icon,
        currentAvatarId: avatar.id,
        coins: res.newCoins ?? prev.coins
      } : null);
      toast.success('아바타 장착 완료! ✨', `[${avatar.icon} ${avatar.name}] (으)로 대표 프로필이 변경되었습니다.`);
    } else {
      toast.error('장착 실패', res.error || '코인이 부족합니다.');
    }
  };

  // 🗑️ Account Deletion Handler
  const handleDeleteAccount = async () => {
    if (!user) return;
    setActionModalConfig({
      isOpen: true,
      type: 'danger',
      title: '회원 탈퇴 및 계정 삭제',
      subtitle: '정말로 탈퇴하시겠습니까? 저장된 오답 노트, 즐겨찾기, 보유 코인 등 모든 학습 데이터가 영구적으로 삭제됩니다.',
      cost: 0,
      icon: '⚠️',
      confirmButtonText: '탈퇴 및 모든 데이터 영구 삭제',
      notices: [
        '삭제된 계정 데이터는 복구가 절대 불가능합니다.',
        '구글 플레이 개인정보 보호 정책에 따라 즉시 데이터베이스에서 파기됩니다.'
      ],
      onConfirm: async () => {
        setActionModalConfig(null);
        setIsLoading(true);
        setLoadingText('계정 및 학습 데이터 영구 삭제 중...');
        await deleteUserAccount(user.name);
        setIsLoading(false);
        handleLogout();
        toast.info('계정 삭제 완료', '모든 개인 데이터가 안전하게 삭제되었습니다.');
      },
      onClose: () => setActionModalConfig(null)
    });
  };

  // 📊 View Analytics Dashboard
  const handleViewAnalytics = async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText('성장 데이터를 분석하는 중...');
    const mStats = await getUserMasteryStats(user.name);
    setMasteryStats(mStats);
    setIsLoading(false);
    setView('analytics_view');
  };

  // ⭐ 즐겨찾기 토글 핸들러
  const handleToggleBookmark = async (question: Question) => {
    if (!user) return;
    const res = await toggleBookmark(user.name, question);
    if (res.limitExceeded) {
      setActionModalConfig({
        isOpen: true,
        type: 'expand_bookmark',
        title: '즐겨찾기 보관함 +50칸 확장',
        subtitle: `현재 보관함 용량(${bookmarkLimit}개)이 꽉 찼습니다. 🪙 100 코인으로 슬롯을 50칸 확장하시겠습니까?`,
        cost: 100,
        icon: '⭐',
        confirmButtonText: '보관함 50칸 확장 (🪙 100 소모)',
        notices: [
          '확장 시 보관함 용량이 즉시 +50칸 늘어납니다.',
          '확장된 슬롯은 계정에 영구적으로 유지됩니다.'
        ],
        onConfirm: () => {
          setActionModalConfig(null);
          executeExpandBookmarkLimit();
        },
        onClose: () => setActionModalConfig(null),
        onEarnCoins: () => {
          setActionModalConfig(null);
          setView('solve_select');
        }
      });
    } else {
      const updatedBookmarks = await getBookmarks(user.name);
      setBookmarks(updatedBookmarks);
      if (res.bookmarked) {
        toast.success('즐겨찾기 등록 완료 ⭐', '내 즐겨찾기 보관함에 안전하게 저장되었습니다.');
      } else {
        toast.info('즐겨찾기 해제됨', '보관함에서 문제가 제거되었습니다.');
      }
    }
  };

  // ⭐ 보관함 확장 실행
  const executeExpandBookmarkLimit = async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText('보관함 슬롯 확장 중...');
    const res = await expandBookmarkLimit(user.name, 100);
    setIsLoading(false);

    if (res.success) {
      await refreshUserData(user.name);
      toast.coin('보관함 확장 완료! 🎉', `총 ${res.newLimit}칸으로 업그레이드되었습니다.`);
    } else {
      toast.error('확장 실패', res.error || '코인이 부족합니다.');
    }
  };

  // 2. Open Grammar Question Generation Modal
  const handlePromptGenerateBulk = async (levelInfo: DifficultyLevel, isWeakness: boolean = false) => {
    if (!user) return;

    const isAdminUser = checkIsAdmin(user);
    if (!isAdminUser) {
      const cd = await checkGenerationCooldown(user);
      if (!cd.canGenerate) {
        toast.warning(
          '생성 쿨타임 진행 중 ⏱️',
          `${Math.floor(cd.remainingSeconds / 60)}분 ${cd.remainingSeconds % 60}초 후에 다시 생성할 수 있습니다.`
        );
        return;
      }
    }

    const genCost = isAdminUser ? 0 : 50;

    setActionModalConfig({
      isOpen: true,
      type: 'generate_grammar',
      title: `[${levelInfo.label}] 40문제 AI 출제`,
      subtitle: `Gemini AI가 ${levelInfo.label} 수준의 고품질 영문법 40문제를 생성하여 공용 DB에 즉시 적재합니다.`,
      cost: genCost,
      icon: '⚡',
      confirmButtonText: isAdminUser ? '40문제 생성 시작 (관리자 무료)' : '40문제 생성 시작 (🪙 50 소모)',
      notices: [
        isAdminUser ? '👑 관리자 권한: 코인 소모 및 쿨타임이 완전 면제됩니다.' : '시작 즉시 🪙 50 코인이 차감되며 3분의 생성 쿨타임이 적용됩니다.',
        '생성된 문제는 공용 DB에 영구 보관되어 모든 학습자가 함께 풀 수 있습니다.',
        '100% 한국어 상세 해설 및 1~5형식 표준 문형 검증이 자동 적용됩니다.'
      ],
      onConfirm: () => {
        setActionModalConfig(null);
        executeGenerateBulk(levelInfo, isWeakness);
      },
      onClose: () => setActionModalConfig(null),
      onEarnCoins: () => {
        setActionModalConfig(null);
        setView('solve_select');
      }
    });
  };

  // Execute Grammar Generation
  const executeGenerateBulk = async (levelInfo: DifficultyLevel, isWeakness: boolean = false) => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText('코인 차감 및 AI 문제 출제 준비 중...');

    const isAdminUser = checkIsAdmin(user);
    const genCost = isAdminUser ? 0 : 50;

    const deducted = await deductCoins(user.name, genCost, user);
    if (!deducted) {
      setIsLoading(false);
      toast.error('코인 부족', '보유 코인이 부족하여 생성할 수 없습니다.');
      return;
    }

    if (!isAdminUser) {
      await recordGenerationTimestamp(user.name);
    }
    await refreshUserData(user.name);

    // 📊 난이도별 1~5형식 분포 통계 분석 (부족한 문형 자동 파악 및 균등 배분)
    const formStats = await getQuestionFormStatsByLevel(levelInfo.label);
    const formSummary = Object.entries(formStats.countsByForm).map(([f, cnt]) => `${f}형식(${cnt}개)`).join(' ');
    console.log(`[DB Form Analysis for ${levelInfo.label}]:`, formSummary);

    setLoadingText(`Gemini AI가 [${levelInfo.label}] 1~5형식 문형 균형을 맞춰 40문제를 생성하고 있습니다...`);

    let focus = '';
    if (isWeakness && weaknessData.total > 0) {
      const sortedForms = Object.entries(weaknessData.forms).sort((a, b) => b[1] - a[1]);
      focus = sortedForms.slice(0, 2).map(f => `${f[0]}형식`).join(', ');
    }

    const genResult = await generateBulkQuestions(levelInfo.label, focus, 40, formStats);

    if (!genResult.success || !genResult.questions) {
      setIsLoading(false);
      toast.error('문제 생성 실패', genResult.error || '잠시 후 다시 시도해 주세요.');
      return;
    }

    setLoadingText('Firestore 데이터베이스에 저장 중...');
    try {
      if (isWeakness) {
        await savePersonalQuestionsToFirestore(user.name, genResult.questions, levelInfo.label);
        setIsLoading(false);
        toast.coin('약점 맞춤 문제 40개 생성 완료! 🎉', '개인 DB에 성공적으로 저장되었습니다.');
        setView('menu');
      } else {
        await saveQuestionsToFirestore(genResult.questions, levelInfo.label);
        await loadTotalPublicQuestions();
        setIsLoading(false);
        toast.coin('공용 문제 40개 생성 완료! 🎉', '공용 DB에 성공적으로 추가되었습니다.');
        setView('menu');
      }
    } catch (e: any) {
      setIsLoading(false);
      toast.error('저장 오류', e.message);
    }
  };

  // 🌟 3. Open Expression Generation Modal
  const handlePromptGenerateExpressions = async (category: 'daily' | 'business' | 'travel' | 'pattern') => {
    if (!user) return;

    const isAdminUser = checkIsAdmin(user);
    if (!isAdminUser) {
      const cd = await checkGenerationCooldown(user);
      if (!cd.canGenerate) {
        toast.warning(
          '생성 쿨타임 진행 중 ⏱️',
          `${Math.floor(cd.remainingSeconds / 60)}분 ${cd.remainingSeconds % 60}초 후에 다시 생성할 수 있습니다.`
        );
        return;
      }
    }

    const catName = EXPRESSION_CATEGORIES.find(c => c.id === category)?.title || category;
    const genCost = isAdminUser ? 0 : 50;

    setActionModalConfig({
      isOpen: true,
      type: 'generate_expression',
      title: `[${catName}] 새 표현 5개 AI 생성`,
      subtitle: `이미 배운 표현과 중복되지 않는 현지 원어민 실전 표현 5개를 새롭게 조제합니다.`,
      cost: genCost,
      icon: '🌟',
      confirmButtonText: isAdminUser ? '새 표현 5개 생성 (관리자 무료)' : '새 표현 5개 생성 (🪙 50 소모)',
      notices: [
        isAdminUser ? '👑 관리자 권한: 코인 소모 및 쿨타임이 완전 면제됩니다.' : '시작 즉시 🪙 50 코인이 차감되며 3분의 생성 쿨타임이 적용됩니다.',
        '기존 DB 표현과의 중복 배제 필터링이 자동 적용됩니다.',
        '원어민 TTS 발음, A/B 롤플레이 대화문 및 4지선다 퀴즈가 함께 생성됩니다.'
      ],
      onConfirm: () => {
        setActionModalConfig(null);
        executeGenerateExpressions(category);
      },
      onClose: () => setActionModalConfig(null),
      onEarnCoins: () => {
        setActionModalConfig(null);
        setView('solve_select');
      }
    });
  };

  // Execute Expression Generation
  const executeGenerateExpressions = async (category: 'daily' | 'business' | 'travel' | 'pattern') => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText('코인 차감 및 기존 표현 중복 검사 중...');

    const isAdminUser = checkIsAdmin(user);
    const genCost = isAdminUser ? 0 : 50;

    const deducted = await deductCoins(user.name, genCost, user);
    if (!deducted) {
      setIsLoading(false);
      toast.error('코인 부족', '보유 코인이 부족합니다.');
      return;
    }

    if (!isAdminUser) {
      await recordGenerationTimestamp(user.name);
    }
    await refreshUserData(user.name);

    const existingList = await getExpressionsByCategory(category);
    const existingNames = existingList.map(e => e.expression);

    setLoadingText('Gemini AI가 중복 없는 생생한 원어민 표현 5개를 생성하는 중...');
    const genResult = await generateNativeExpressions(category, existingNames, 5);

    if (!genResult.success || !genResult.expressions) {
      setIsLoading(false);
      toast.error('표현 생성 실패', genResult.error || '잠시 후 다시 시도해 주세요.');
      return;
    }

    setLoadingText('데이터베이스에 저장 중...');
    await saveExpressionsToFirestore(genResult.expressions);
    setIsLoading(false);
    toast.coin('원어민 표현 5개 추가 완료! 🌟', '플래시카드와 표현 퀴즈에서 바로 학습할 수 있습니다.');

    handleSelectExpressionCategory(category, 'study');
  };

  // 4. Start Normal Quiz
  const handleStartQuiz = async (levelInfo: DifficultyLevel) => {
    setIsLoading(true);
    setLoadingText(`[${levelInfo.label}] 문제를 불러오는 중...`);
    setSelectedDifficulty(levelInfo.label);
    setQuizMode('normal');

    const result = await getRandomQuestions(levelInfo.label);
    setIsLoading(false);

    if (result.success && result.data && result.data.length > 0) {
      setQuestionQueue(result.data.slice(1));
      setCurrentQ(result.data[0]);
      setQuestionCount(1);
      setScore(0);
      setCorrectCount(0);
      setView('solve');
    } else {
      toast.error('문제 로딩 실패', result.error || '문제를 불러오지 못했습니다.');
      setView('menu');
    }
  };

  // 5. Start Personal Weakness Quiz
  const handleStartPersonalQuiz = async (levelInfo: DifficultyLevel) => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText(`나만의 [${levelInfo.label}] 약점 문제를 불러오는 중...`);
    setSelectedDifficulty(levelInfo.label);
    setQuizMode('personal');

    const result = await getRandomPersonalQuestions(user.name, levelInfo.label);
    setIsLoading(false);

    if (result.success && result.data && result.data.length > 0) {
      setQuestionQueue(result.data.slice(1));
      setCurrentQ(result.data[0]);
      setQuestionCount(1);
      setScore(0);
      setCorrectCount(0);
      setView('solve');
    } else {
      toast.error('약점 문제 없음', result.error || '약점 문제를 먼저 생성해주세요.');
      setView('menu');
    }
  };

  // 6. 🔥 3사이클 랭킹전 시작 파이프라인
  const launchRankingQuizSession = async (cycle: CycleInfo) => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText(`${cycle.cycleName} 공식 10문제를 준비하는 중...`);
    setSelectedDifficulty(cycle.cycleName);
    setQuizMode('daily');

    // 🔒 도전 시작 즉시 시도 횟수 등록 (중도 이탈 시 기권 처리 및 무제한 재시작 방지)
    await recordCycleAttemptStart(cycle.cycleId, user.name, user.currentAvatarId || user.avatar || 'lion');

    const result = await getOrCreateCycleQuestions(cycle);
    setIsLoading(false);

    if (result.success && result.data && result.data.length > 0) {
      setQuestionQueue(result.data.slice(1));
      setCurrentQ(result.data[0]);
      setQuestionCount(1);
      setScore(0);
      setCorrectCount(0);
      setView('solve');
    } else {
      toast.error('랭킹전 준비 실패', result.error || '문제가 부족합니다.');
      setView('menu');
    }
  };

  const handleStartDailyChallenge = async (isRevenge: boolean = false) => {
    if (!user) return;
    const cycle = getCurrentCycleInfo();
    setCurrentCycle(cycle);

    if (!isRevenge) {
      setIsLoading(true);
      setLoadingText('응시 기록 확인 중...');
      const check = await hasUserCompletedCycle(cycle.cycleId, user.name);
      setIsLoading(false);

      if (check.completed) {
        if (!check.canRetry) {
          toast.warning(
            '도전 횟수 완료',
            `이번 ${cycle.cycleName}의 모든 도전 기회(무료 1회 + 50코인 재도전 1회)를 완료하셨습니다! 실시간 명예의 전당으로 이동합니다.`
          );
          const ranks = await getCycleRankings(cycle.cycleId);
          setRankingData(ranks);
          setSelectedCycleTab(cycle.cycleIndex);
          setView('ranking_board');
          return;
        }

        setPreviousCycleScore(check.score || 0);
        setIsRevengeModalOpen(true);
        return;
      }

      // 🏆 1회차 무료 도전 전 규칙 및 주의사항 사전 안내 모달
      setActionModalConfig({
        isOpen: true,
        type: 'custom',
        title: `${cycle.cycleName} 랭킹전 도전`,
        subtitle: '오늘의 영광스러운 명예의 전당 1위 자리에 도전하세요!',
        cost: 0,
        icon: '🏆',
        confirmButtonText: '🔥 1회차 무료 도전 시작',
        notices: [
          '• 회차당 최대 2회까지 도전할 수 있습니다. (1회차: 무료 / 2회차: 🪙 50 코인)',
          '• 🚨 문제 풀이 도중 나가거나 브라우저를 닫으면 도전 기회가 즉시 소멸(기권 처리)됩니다.',
          '• 10문제 총점 및 풀이 소요 시간으로 실시간 순위가 결정됩니다.',
          '• 회차 마감 시 🥇 1위 🪙 200, 🥈 2위 🪙 120, 🥉 3위 🪙 80, 4~10위 🪙 40, 참가 🪙 15 코인이 지급됩니다.'
        ],
        onConfirm: async () => {
          setActionModalConfig(null);
          await launchRankingQuizSession(cycle);
        },
        onClose: () => setActionModalConfig(null)
      });
      return;
    }

    // 리벤지(2회차) 시작
    await launchRankingQuizSession(cycle);
  };

  // 🎟️ 리벤지 재도전 확인 핸들러 (50코인 결제 후 2회차 시작)
  const handleConfirmRevenge = async () => {
    if (!user) return;
    setIsRevengeModalOpen(false);
    setIsLoading(true);
    setLoadingText('🎟️ 50 코인을 사용하여 리벤지 재도전권을 발급 중...');

    const success = await deductCoins(user.name, 50);
    if (success) {
      await refreshUserData(user.name);
      setIsLoading(false);
      handleStartDailyChallenge(true);
    } else {
      setIsLoading(false);
      toast.error('코인 부족', '코인이 부족합니다! [일반 퀴즈]에서 문제를 풀어보세요.');
    }
  };

  // 🌟 7. 원어민 표현 카테고리 선택
  const handleSelectExpressionCategory = async (category: 'daily' | 'business' | 'travel' | 'pattern', mode: 'study' | 'quiz') => {
    setIsLoading(true);
    setSelectedExpCategory(category);
    setLoadingText('원어민 실전 표현을 불러오는 중...');

    const expList = await getExpressionsByCategory(category);
    const expCounts = await getExpressionCounts();
    setExpressions(expList);
    setExpressionCounts(expCounts);
    setIsLoading(false);

    if (expList.length === 0) {
      toast.info('표현 데이터 없음', '[새 표현 5개 AI 생성] 버튼을 눌러 표현을 추가해 보세요!');
      setView('expression_select');
      return;
    }

    if (mode === 'study') {
      setView('expression_study');
    } else {
      const quizQuestions: Question[] = expList
        .filter(e => e.quizQuestion)
        .map(e => ({
          form: 3,
          sentence: e.quizQuestion!.sentence,
          options: e.quizQuestion!.options,
          answer: e.quizQuestion!.answer,
          translation: `[${e.expression}] ${e.meaning}`,
          explanation: {
            chunk_pattern: e.expression,
            nuance: e.nuance
          }
        }));

      if (quizQuestions.length === 0) {
        toast.warning('퀴즈 미준비', '플래시카드로 먼저 학습해 보세요!');
        setView('expression_study');
        return;
      }

      setSelectedDifficulty(`원어민 표현 (${category})`);
      setQuizMode('expression');
      setQuestionQueue(quizQuestions.slice(1));
      setCurrentQ(quizQuestions[0]);
      setQuestionCount(1);
      setScore(0);
      setCorrectCount(0);
      setView('solve');
    }
  };

  // 8. View Rankings
  const handleViewRanking = async (cycleIdx?: 1 | 2 | 3) => {
    setIsLoading(true);
    const targetIdx = cycleIdx || currentCycle.cycleIndex;
    setSelectedCycleTab(targetIdx);

    const todayStr = getTodayDateString();
    const cycleId = `${todayStr}_cycle${targetIdx}`;

    setLoadingText(`${targetIdx}차전 랭킹을 불러오는 중...`);
    const data = await getCycleRankings(cycleId);
    setRankingData(data);
    setIsLoading(false);
    setView('ranking_board');
  };

  // 9. View All DB
  const handleViewDB = async () => {
    setIsLoading(true);
    setLoadingText('공용 문제집을 불러오는 중...');
    const data = await getAllSavedQuestions();
    setDbData(data);
    setIsLoading(false);
    setView('db_view');
  };

  // 10. View Weakness Report
  const handleViewWeakness = async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText('약점을 정밀 분석하는 중...');
    const data = await getWeaknessAnalysis(user.name);
    setWeaknessData(data);
    setIsLoading(false);
    setView('weakness_view');
  };

  // 11. View Incorrect List
  const handleViewIncorrectList = async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadingText('내 오답 노트를 불러오는 중...');
    const data = await getUserIncorrectQuestions(user.name);
    setIncorrectList(data);
    setIsLoading(false);
    setView('incorrect_list');
  };

  // 12. Check Answer in Quiz & Record Analytics (실시간 경험치 누적 및 티어 업데이트)
  const handleCheckAnswer = (userInput: string) => {
    if (!currentQ || !user) return { isCorrect: false };
    const isCorrect = userInput.trim() === currentQ.answer;

    // Record stats and XP in Firestore
    recordQuizResultStats(user.name, currentQ.form, isCorrect);

    const xpEarned = isCorrect ? 10 : 2;
    setUser(prev => {
      if (!prev) return null;
      const nextXp = (prev.xp || 0) + xpEarned;
      const updated = {
        ...prev,
        xp: nextXp,
        tier: calculateTier(nextXp).tier
      };
      localStorage.setItem('ai_grammar_user', JSON.stringify(updated));
      return updated;
    });

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      if (quizMode === 'daily') {
        const qPoints = getRankingQuestionPoints(currentQ, questionCount).points;
        setScore(prev => prev + qPoints);
      }
    } else {
      saveIncorrectQuestion(user.name, currentQ, userInput, selectedDifficulty);
    }

    return { isCorrect };
  };

  // 13. Next Question Handler
  const handleNextQuestion = async () => {
    if (questionQueue.length > 0) {
      setCurrentQ(questionQueue[0]);
      setQuestionQueue(prev => prev.slice(1));
      setQuestionCount(prev => prev + 1);
    } else {
      if (!user) return;

      const coinRate = typeof systemSettings.rewardCoinsPerQuestion === 'number' ? systemSettings.rewardCoinsPerQuestion : 3;

      if (quizMode === 'daily') {
        setIsLoading(true);
        setLoadingText('실시간 랭킹 순위 등록 & 코인/XP 보상 지급 중...');
        
        const rewardCoins = correctCount * coinRate;
        if (rewardCoins > 0) {
          await addCoins(user.name, rewardCoins);
        }
        // 랭킹전 완주 보너스 +50 XP
        await addXp(user.name, 50);
        await refreshUserData(user.name);

        const updatedLeaderboard = await saveAndGetCycleRankings(
          currentCycle.cycleId, 
          user.name, 
          score,
          user.currentAvatarId || user.avatar || 'lion'
        );
        setRankingData(updatedLeaderboard);
        setSelectedCycleTab(currentCycle.cycleIndex);
        setIsLoading(false);
        setView('ranking_board');
        toast.coin(`🏆 ${currentCycle.cycleName} 랭킹전 완료!`, `정답 ${correctCount}개 맞춤 ➔ 🪙 +${rewardCoins} 코인 & 🏆 +50 XP 획득!`);
        trackUserAction('RANKING_PLAY', `${currentCycle.cycleName}: ${score}점 (정답 ${correctCount}개)`, user);
      } else {
        const earnedCoins = correctCount * coinRate;
        if (earnedCoins > 0) {
          await addCoins(user.name, earnedCoins);
          await refreshUserData(user.name);
          toast.coin('학습 완료! 🎉', `정답 ${correctCount}개 맞춤 ➔ 🪙 +${earnedCoins} 코인 획득!`);
        } else {
          await refreshUserData(user.name);
          toast.info('학습 완료! 🎉', '준비된 모든 문제를 풀었습니다.');
        }
        setView(quizMode === 'expression' ? 'expression_select' : quizMode === 'bookmark' ? 'bookmark_view' : 'menu');
        trackUserAction('SOLVE_COMPLETE', `모드: ${quizMode}, 정답: ${correctCount}/${questionCount}개`, user);
      }

      // 📲 퀴즈 1세트 완료 시 홈 화면 바로가기 추가 유도 (PWA standalone 아니며 이번 세션에 닫지 않은 유저 대상)
      try {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
        if (!isStandalone && !isDismissed) {
          setQuizCompletionStats({
            correctCount,
            totalQuestions: questionCount,
            earnedCoins: correctCount * coinRate,
            earnedXp: quizMode === 'daily' ? 50 : 0
          });
          setTimeout(() => {
            setIsAddToHomeModalOpen(true);
          }, 1200);
        }
      } catch (e) {
        console.warn("PWA prompt check warning:", e);
      }
    }
  };

  const currentCategoryInfo = EXPRESSION_CATEGORIES.find(c => c.id === selectedExpCategory);
  const isCurrentQBookmarked = currentQ 
    ? bookmarks.some(b => (b.sentence || b.question?.sentence || '').trim() === (currentQ.sentence || '').trim()) 
    : false;

  // 📲 Check if app is running in PWA standalone mode or installed
  const isAppStandalone = typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as any).standalone === true || 
    localStorage.getItem('pwa_installed') === 'true'
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {isLoading && <LoadingOverlay text={loadingText} progress={progress} />}

      {/* Action Confirmation Modal */}
      {user && (
        <ActionConfirmModal
          config={actionModalConfig}
          userCoins={user.coins ?? 200}
        />
      )}

      {/* Revenge Modal */}
      {user && (
        <RevengeModal
          isOpen={isRevengeModalOpen}
          cycleInfo={currentCycle}
          previousScore={previousCycleScore}
          userCoins={user.coins ?? 200}
          onConfirm={handleConfirmRevenge}
          onClose={() => setIsRevengeModalOpen(false)}
        />
      )}

      {/* 🎰 Avatar Gacha Modal */}
      {user && (
        <AvatarGachaModal
          isOpen={isGachaModalOpen}
          userCoins={user.coins ?? 200}
          currentAvatarId={user.currentAvatarId}
          onDraw={handleDrawGacha}
          onEquipDirect={handleEquipAvatar}
          onClose={() => setIsGachaModalOpen(false)}
          onGoCollection={() => {
            setIsGachaModalOpen(false);
            setView('profile_view');
          }}
        />
      )}

      {/* 📋 AI Quality Assurance & Report Center Modal */}
      {user && (
        <ReportCenterModal
          isOpen={isReportCenterOpen}
          userName={user.name}
          onClose={() => setIsReportCenterOpen(false)}
          onCoinsUpdated={(newCoins) => {
            setUser(prev => prev ? { ...prev, coins: newCoins } : null);
            toast.coin('보상금 수령 완료! 🪙', `현재 보유 코인: ${newCoins} 코인`);
          }}
        />
      )}

      {/* 👑 Master Admin Command Center Modal */}
      {user && (
        <AdminCenterModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          user={user}
          onUserUpdate={(updated) => {
            setUser(updated);
            localStorage.setItem('ai_grammar_user', JSON.stringify(updated));
          }}
          onShowToast={(title, msg, type) => {
            if (type === 'coin') toast.coin(title, msg);
            else if (type === 'error') toast.error(title, msg);
            else toast.info(title, msg);
          }}
        />
      )}

      {/* 0. Login */}
      {view === 'login' && (
        <LoginView
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onOpenInstallModal={() => setIsAddToHomeModalOpen(true)}
          isLoading={isLoading}
        />
      )}

      {/* 1. Main Menu */}
      {user && view === 'menu' && (
        <MainMenuView
          user={user}
          totalPublicQuestions={totalPublicQuestions}
          currentCycle={currentCycle}
          bookmarkCount={bookmarks.length}
          isStandalone={isAppStandalone}
          onNavigate={(targetView) => {
            if (targetView === 'ranking_board') handleViewRanking();
            else if (targetView === 'db_view') handleViewDB();
            else if (targetView === 'weakness_view') handleViewWeakness();
            else if (targetView === 'incorrect_list') handleViewIncorrectList();
            else if (targetView === 'analytics_view') handleViewAnalytics();
            else if (targetView === 'expression_select') {
              getExpressionCounts().then(setExpressionCounts);
              setView('expression_select');
            }
            else setView(targetView);
          }}
          onStartDailyChallenge={() => handleStartDailyChallenge(false)}
          onOpenGachaModal={() => setIsGachaModalOpen(true)}
          onOpenInstallModal={() => setIsAddToHomeModalOpen(true)}
          onOpenReportCenter={() => setIsReportCenterOpen(true)}
          onOpenAdminCenter={() => setIsAdminModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* 📊 2. Growth Analytics Dashboard */}
      {view === 'analytics_view' && user && (
        <AnalyticsDashboardView
          user={user}
          masteryStats={masteryStats}
          bookmarkCount={bookmarks.length}
          onBack={() => setView('menu')}
          onGoSolveWeakness={() => setView('solve_personal_select')}
        />
      )}

      {/* 👤 3. Profile & Account Management & Avatar Collection */}
      {view === 'profile_view' && user && (
        <ProfileView
          user={user}
          masteryStats={masteryStats}
          bookmarkCount={bookmarks.length}
          onBack={() => setView('menu')}
          onUpdateDailyGoal={handleUpdateDailyGoal}
          onRequestChangeNickname={handleRequestChangeNickname}
          onEquipAvatar={handleEquipAvatar}
          onOpenGachaModal={() => setIsGachaModalOpen(true)}
          onDeleteAccount={handleDeleteAccount}
          onLinkGoogleAccount={handleLinkGoogleAccount}
          onOpenAdminCenter={() => setIsAdminModalOpen(true)}
          onOpenInstallModal={() => setIsAddToHomeModalOpen(true)}
          onGoAnalytics={() => setView('analytics_view')}
        />
      )}

      {/* ⭐ 4. Bookmarked List View */}
      {view === 'bookmark_view' && user && (
        <BookmarkedListView
          bookmarks={bookmarks}
          bookmarkLimit={bookmarkLimit}
          userCoins={user.coins ?? 200}
          onBack={() => setView('menu')}
          onRemoveBookmark={handleToggleBookmark}
          onExpandLimit={() => {
            setActionModalConfig({
              isOpen: true,
              type: 'expand_bookmark',
              title: '즐겨찾기 보관함 +50칸 확장',
              subtitle: `나만의 단어장에 더 많은 문제를 영구 보관할 수 있도록 슬롯을 50칸 확장합니다.`,
              cost: 100,
              icon: '⭐',
              confirmButtonText: '보관함 50칸 확장 (🪙 100 소모)',
              notices: [
                '확장 즉시 🪙 100 코인이 차감되며 보관함 용량이 +50칸 늘어납니다.',
                '확장된 슬롯은 영구적으로 유지됩니다.'
              ],
              onConfirm: () => {
                setActionModalConfig(null);
                executeExpandBookmarkLimit();
              },
              onClose: () => setActionModalConfig(null),
              onEarnCoins: () => {
                setActionModalConfig(null);
                setView('solve_select');
              }
            });
          }}
          onStartPractice={(q) => {
            setSelectedDifficulty('즐겨찾기 복습');
            setQuizMode('bookmark');
            setCurrentQ(q);
            setQuestionQueue([]);
            setQuestionCount(1);
            setScore(0);
            setCorrectCount(0);
            setView('solve');
          }}
        />
      )}

      {/* 🌟 5. Native Expression Category Select */}
      {view === 'expression_select' && (
        <ExpressionSelectView
          expressionCounts={expressionCounts}
          cooldownSeconds={cooldownSeconds}
          onBack={() => setView('menu')}
          onSelectCategory={handleSelectExpressionCategory}
          onGenerateExpressions={handlePromptGenerateExpressions}
        />
      )}

      {/* 🌟 6. Native Expression Study */}
      {view === 'expression_study' && (
        <ExpressionStudyView
          categoryTitle={currentCategoryInfo?.title || '원어민 표현'}
          expressions={expressions}
          isBookmarked={isCurrentQBookmarked}
          onToggleBookmark={handleToggleBookmark}
          onBack={() => setView('expression_select')}
          onStartQuiz={() => handleSelectExpressionCategory(selectedExpCategory, 'quiz')}
        />
      )}

      {/* 7. Difficulty Select */}
      {(view === 'generate' || view === 'solve_select' || view === 'solve_personal_select') && (
        <DifficultySelectView
          view={view}
          questionCounts={questionCounts}
          cooldownSeconds={cooldownSeconds}
          onBack={() => setView('menu')}
          onSelectLevel={(level) => {
            if (view === 'generate') handlePromptGenerateBulk(level, false);
            else if (view === 'solve_select') handleStartQuiz(level);
            else if (view === 'solve_personal_select') handleStartPersonalQuiz(level);
          }}
          isLoading={isLoading}
        />
      )}

      {/* 8. Quiz Solving */}
      {view === 'solve' && currentQ && (
        <QuizView
          currentQuestion={currentQ}
          questionIndex={questionCount}
          totalQuestions={questionCount + questionQueue.length}
          quizMode={quizMode}
          score={score}
          userName={user?.name || '학습자'}
          isBookmarked={isCurrentQBookmarked}
          onToggleBookmark={handleToggleBookmark}
          onCheckAnswer={handleCheckAnswer}
          onNextQuestion={handleNextQuestion}
          onExit={() => setView(quizMode === 'expression' ? 'expression_select' : quizMode === 'bookmark' ? 'bookmark_view' : 'menu')}
        />
      )}

      {/* 9. Ranking Board */}
      {user && view === 'ranking_board' && (
        <RankingBoardView
          user={user}
          rankingData={rankingData}
          currentCycle={currentCycle}
          selectedCycleIndex={selectedCycleTab}
          onChangeCycleTab={(idx) => handleViewRanking(idx)}
          onBack={() => setView('menu')}
          onStartChallenge={() => handleStartDailyChallenge(false)}
          onOpenGachaModal={() => setIsGachaModalOpen(true)}
          onClaimReward={async (cycleId, rank) => {
            const reward = calculateCycleReward(rank);
            setUser(prev => prev ? { ...prev, coins: (prev.coins ?? 0) + reward.coins, xp: (prev.xp ?? 0) + reward.xp } : prev);
            toast.coin('🎁 랭킹전 순위 보상 수령!', `${selectedCycleTab}차전 ${rank}위 달성 보상으로 🪙 +${reward.coins} 코인 & 🏆 +${reward.xp} XP를 획득했습니다!`);
          }}
        />
      )}

      {/* 10. Weakness Report */}
      {view === 'weakness_view' && (
        <WeaknessReportView
          weaknessData={weaknessData}
          onBack={() => setView('menu')}
          onGeneratePrescription={(level) => handlePromptGenerateBulk(level, true)}
          isLoading={isLoading}
        />
      )}

      {/* 11. Incorrect List */}
      {view === 'incorrect_list' && (
        <IncorrectListView
          incorrectList={incorrectList}
          onBack={() => setView('menu')}
        />
      )}

      {/* 12. Public DB Explorer */}
      {view === 'db_view' && (
        <DbExplorerView
          dbData={dbData}
          onBack={() => setView('menu')}
        />
      )}

      {/* 📲 PWA 홈 화면 바로가기 추가 유도 모달 */}
      <AddToHomeScreenModal
        isOpen={isAddToHomeModalOpen}
        onClose={() => setIsAddToHomeModalOpen(false)}
        deferredPrompt={deferredPrompt}
        correctCount={quizCompletionStats.correctCount}
        totalQuestions={quizCompletionStats.totalQuestions}
        earnedCoins={quizCompletionStats.earnedCoins}
        earnedXp={quizCompletionStats.earnedXp}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
