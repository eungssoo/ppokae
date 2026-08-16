import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ko' | 'en';

export const TRANSLATIONS = {
  ko: {
    // 공통 및 헤더
    appName: '영문법 뽀개기 Pro',
    appSubtitle: 'AI 실전 영문법 플랫폼',
    coins: '코인',
    login: '로그인',
    logout: '로그아웃',
    myProfile: '내 프로필',
    home: '홈',
    back: '뒤로가기',
    close: '닫기',
    confirm: '확인',
    cancel: '취소',
    save: '저장',
    settings: '설정',
    language: '언어 설정',
    korean: '한국어 🇰🇷',
    english: 'English 🇺🇸',
    langChangeSuccess: '언어 설정이 변경되었습니다.',

    // 메인 메뉴
    dailyRankingTitle: '🔥 실시간 랭킹전 (10제)',
    dailyRankingDesc: '매일 3차전! 전국의 고수들과 영문법 실시간 랭킹 대결',
    grammarQuizTitle: '🎯 1일 문법 챌린지',
    grammarQuizDesc: '내 실력에 딱 맞춘 난이도별 5단계 맞춤 트레이닝',
    expressionLabTitle: '💡 표현 연구소',
    expressionLabDesc: '원어민 뉘앙스 & 토익 핵심 빈출 표현 완벽 마스터',
    incorrectNotesTitle: '📝 오답 노트',
    incorrectNotesDesc: '틀린 문제를 다시 풀고 취약점을 완벽하게 극복하세요',
    weaknessReportTitle: '📊 약점 분석 리포트',
    weaknessReportDesc: 'AI가 진단한 나의 5대 문법 영역별 숙련도와 정답률',
    bookmarkedTitle: '⭐ 중요 북마크',
    bookmarkedDesc: '언제든 다시 보고 싶은 문제들을 나만의 보관함에 저장',
    avatarGachaBtn: '🎰 아바타 소환소',
    avatarCatalogBtn: '🪐 104종 도감',
    adminCenterBtn: '👑 관리자 센터',
    inquiryBtn: '💬 문의 & 건의',
    todayGoal: '오늘의 목표',
    solved: '문제 완료',
    appInstallBanner: '📲 앱으로 더 빠르게 학습하기',

    // 로그인
    welcomeTitle: '영문법 뽀개기 Pro',
    welcomeSubtitle: 'AI 맞춤형 실전 영문법 마스터 플랫폼',
    googleLogin: 'Google 계정으로 1초 시작',
    pinLogin: '간편 PIN 로그인',
    enterName: '닉네임 입력',
    enterPin: 'PIN 번호 (숫자 4자리)',
    loginBtn: '로그인',
    registerBtn: '무료 계정 생성',
    randomNickname: '🎲 랜덤 닉네임',
    guestNotice: '기기 상관없이 언제 어디서나 학습 기록이 클라우드에 자동 동기화됩니다.',

    // 프로필
    profileTitle: '내 프로필 & 학습 통계',
    nickname: '닉네임',
    changeNickname: '닉네임 변경',
    tierRank: '현재 티어',
    totalSolved: '총 푼 문제 수',
    accuracy: '정답률',
    changeAvatar: '장착 아바타 변경',
    unlockedAvatars: '해금된 아바타',
    dailyGoalSetting: '일일 목표 문제 수',
    bookmarkVault: '북마크 보관함 용량',
    expandVault: '용량 확장 (+5개)',
    logoutConfirm: '정말 로그아웃 하시겠습니까?',
    languageSetting: '앱 기본 언어 설정',
    languageDesc: '한국어와 English 중 원하는 언어를 선택할 수 있습니다.',

    // 아바타 소환소 & 도감
    gachaTitle: '아바타 소환소',
    summon1: '1회 소환 (50 코인)',
    summon10: '10회 연속 소환 (450 코인 - 10%할인)',
    collectionRate: '도감 수집률',
    ratesTitle: '소환 확률 안내',
    transcendent: '초월',
    mythic: '신화',
    legendary: '전설',
    epic: '영웅',
    rare: '희귀',
    common: '일반',
    starter: '스타터',
    equip: '장착하기',
    equipped: '장착 중',
    duplicateRefund: '중복 획득 시 코인 환급',

    // 퀴즈 & 랭킹전
    submitAnswer: '정답 제출',
    nextQuestion: '다음 문제',
    explanation: 'AI 상세 해설',
    keyPoint: '핵심 문법 포인트',
    grammarForm: '문법 영역',
    bookmark: '북마크',
    reportQuestion: '문제 신고',
    streak: '연속 정답!',
    correct: '정답입니다! 🎉',
    incorrect: '아쉽네요! 오답입니다 😢',
    finalScore: '최종 점수',
    rankingTitle: '오늘의 랭킹전 리더보드',
    currentCycle: '현재 진행 중인 차전',
    round1: '1차전 (아침 06:00~14:00)',
    round2: '2차전 (오후 14:00~22:00)',
    round3: '3차전 (야간 22:00~06:00)',
    rankReward: '차전별 순위 보상'
  },
  en: {
    // Common & Header
    appName: 'English Grammar Pro',
    appSubtitle: 'AI Practical English Platform',
    coins: 'Coins',
    login: 'Login',
    logout: 'Logout',
    myProfile: 'My Profile',
    home: 'Home',
    back: 'Back',
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    settings: 'Settings',
    language: 'Language Settings',
    korean: 'Korean 🇰🇷',
    english: 'English 🇺🇸',
    langChangeSuccess: 'Language preference has been saved.',

    // Main Menu
    dailyRankingTitle: '🔥 Live Ranking Battle (10 Qs)',
    dailyRankingDesc: '3 rounds daily! Compete live in English grammar with top players',
    grammarQuizTitle: '🎯 Daily Grammar Challenge',
    grammarQuizDesc: '5-level adaptive training tailored to your exact proficiency',
    expressionLabTitle: '💡 Expression Lab',
    expressionLabDesc: 'Master native nuances & essential high-frequency TOEIC idioms',
    incorrectNotesTitle: '📝 Incorrect Notes',
    incorrectNotesDesc: 'Retry missed questions and completely conquer your weak areas',
    weaknessReportTitle: '📊 Weakness Analysis Report',
    weaknessReportDesc: 'AI diagnostic report on your 5 core grammar mastery fields',
    bookmarkedTitle: '⭐ Saved Bookmarks',
    bookmarkedDesc: 'Save and review key questions anytime in your private vault',
    avatarGachaBtn: '🎰 Avatar Summon Shop',
    avatarCatalogBtn: '🪐 104 Collection',
    adminCenterBtn: '👑 Admin Center',
    inquiryBtn: '💬 Help & Feedback',
    todayGoal: 'Daily Goal',
    solved: 'Solved',
    appInstallBanner: '📲 Install App for Faster Learning',

    // Login
    welcomeTitle: 'English Grammar Pro',
    welcomeSubtitle: 'AI-Powered Adaptive English Mastery Platform',
    googleLogin: 'Continue with Google',
    pinLogin: 'Simple PIN Login',
    enterName: 'Enter Nickname',
    enterPin: 'PIN (4 digits)',
    loginBtn: 'Sign In',
    registerBtn: 'Create Free Account',
    randomNickname: '🎲 Random Name',
    guestNotice: 'Your learning progress is synced automatically to the cloud across all devices.',

    // Profile
    profileTitle: 'My Profile & Stats',
    nickname: 'Nickname',
    changeNickname: 'Change Nickname',
    tierRank: 'Current Tier',
    totalSolved: 'Total Solved',
    accuracy: 'Accuracy',
    changeAvatar: 'Change Equipped Avatar',
    unlockedAvatars: 'Unlocked Avatars',
    dailyGoalSetting: 'Daily Goal Target',
    bookmarkVault: 'Bookmark Vault Limit',
    expandVault: 'Expand Vault (+5)',
    logoutConfirm: 'Are you sure you want to log out?',
    languageSetting: 'App Language Setting',
    languageDesc: 'Choose your preferred display language between Korean and English.',

    // Avatar Gacha & Catalog
    gachaTitle: 'Avatar Summon Shop',
    summon1: 'Summon x1 (50 Coins)',
    summon10: 'Summon x10 (450 Coins - 10% OFF)',
    collectionRate: 'Collection Progress',
    ratesTitle: 'Summon Drop Rates',
    transcendent: 'Transcendent',
    mythic: 'Mythic',
    legendary: 'Legendary',
    epic: 'Epic',
    rare: 'Rare',
    common: 'Common',
    starter: 'Starter',
    equip: 'Equip',
    equipped: 'Equipped',
    duplicateRefund: 'Duplicate Refund in Coins',

    // Quiz & Ranking Battle
    submitAnswer: 'Submit Answer',
    nextQuestion: 'Next Question',
    explanation: 'AI Detailed Explanation',
    keyPoint: 'Key Grammar Focus',
    grammarForm: 'Grammar Category',
    bookmark: 'Bookmark',
    reportQuestion: 'Report Question',
    streak: 'Streak!',
    correct: 'Correct! 🎉',
    incorrect: 'Incorrect! 😢',
    finalScore: 'Final Score',
    rankingTitle: "Today's Ranking Leaderboard",
    currentCycle: 'Active Match Round',
    round1: 'Round 1 (Morning 06:00~14:00)',
    round2: 'Round 2 (Afternoon 14:00~22:00)',
    round3: 'Round 3 (Night 22:00~06:00)',
    rankReward: 'Round Rank Rewards'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS.ko) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ko',
  setLanguage: () => {},
  t: (key) => TRANSLATIONS.ko[key] || String(key)
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('ppokae_language');
      if (saved === 'en' || saved === 'ko') return saved;
      // 브라우저 언어 감지
      if (navigator.language && navigator.language.startsWith('en')) {
        return 'en';
      }
    } catch {}
    return 'ko';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ppokae_language', lang);
    } catch {}
  };

  const t = (key: keyof typeof TRANSLATIONS.ko): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.ko[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
