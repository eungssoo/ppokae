import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ko' | 'en';

export const TRANSLATIONS = {
  ko: {
    // 🌐 공통 & 헤더
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
    exit: '종료하기',
    exitConfirmTitle: '학습을 종료하시겠습니까?',
    exitConfirmDesc: '진행 중인 문제는 저장되지 않을 수 있습니다.',

    // 📱 메인 메뉴
    rankingHeroTitle: '실시간 랭킹전 (10문제 타임어택)',
    rankingHeroDesc: '모두에게 똑같은 공식 10문제! 빠른 완주로 1위 탈환 & 보상 코인 획득! ⚡',
    inProgress: '진행 중',
    currentCycleLabel: '현재',
    myGrowthReport: '나의 실시간 성장 리포트',
    growthDashboardBtn: '성장 분석 대시보드 ➔',
    cumulativeXp: '누적',
    accuracyLabel: '정답률',
    maxTierReached: '최고 티어 도달 👑',
    xpRemaining: 'XP 남음',
    dailyChallengeTitle: '1일 문법 챌린지',
    dailyChallengeDesc: '난이도별 5단계 맞춤형 퀴즈 & 매일 1타 강사 AI 피드백',
    expressionLabHeroTitle: '원어민 실전 표현 연구소',
    expressionLabHeroDesc: '미드/비즈니스/여행/원어민 꿀패턴 500종 집중 마스터',
    incorrectHeroTitle: '틀린 문제 오답 노트',
    incorrectHeroDesc: '오답을 완벽 정복하고 오답률을 0%로 줄이세요',
    weaknessHeroTitle: '5형식 취약점 분석',
    weaknessHeroDesc: 'AI가 진단한 나의 1~5형식 문법 영역별 숙련도 리포트',
    bookmarkHeroTitle: '중요 문제 북마크',
    bookmarkHeroDesc: '나만의 보관함에 저장된 고난도 킬러 문항 집중 복습',
    publicDbTitle: '공용 문제 은행 탐색',
    publicDbDesc: '전국 수험생들과 함께 푸는 빅데이터 문법 아카이브',
    rankingLeaderboardTitle: '오늘 실시간 순위표',
    viewFullRankings: '전체 순위 보기 ➔',
    pwaInstallTitle: '📲 홈 화면에 앱 설치하기',
    pwaInstallDesc: '브라우저 없이 앱 아이콘으로 1초 만에 바로 실행!',
    installNow: '지금 설치',
    todayGoalLabel: '오늘의 목표 달성도',
    avatarGachaBtn: '🎰 아바타 소환소',
    avatarCatalogBtn: '🪐 104종 도감',
    adminCenterBtn: '👑 관리자 센터',
    inquiryBtn: '💬 문의 & 건의',
    noRankingData: '아직 등록된 랭킹 기록이 없습니다. 지금 1위를 선점하세요!',
    rankUnit: '위',

    // 🔑 로그인
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

    // 👤 프로필
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

    // 🎰 아바타 소환소 & 도감
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

    // 📝 퀴즈 뷰
    submitAnswer: '정답 확인하기',
    nextQuestion: '다음 문제로 넘어가기 ➔',
    finishQuiz: '결과 확인 및 완료 ➔',
    explanation: 'AI 상세 문법 해설',
    keyPoint: '핵심 문법 포인트',
    grammarForm: '문법 영역',
    bookmark: '즐겨찾기',
    bookmarked: '보관됨',
    reportQuestion: '오류 제보',
    streak: '연속 정답!',
    correct: 'Perfect! 정답입니다 🎯',
    incorrect: 'Incorrect! 오답입니다 🚨',
    correctAnswerIs: '올바른 정답:',
    formSentence: '형식 문장',
    correctCoinReward: '정답 시 +',
    coinsText: '코인',
    tierCap: '승급 한도:',
    translationTitle: '한국어 번역',
    englishMeaningTitle: '🇺🇸 English Paraphrase & Meaning',
    optionAnalysis: 'Option Analysis (보기별 상세 해설)',
    chunkPattern: '🧩 Chunk Pattern',
    nuance: '💡 Nuance',
    aiTutorTitle: '1타 강사 AI 튜터 1:1 질문',
    aiTutorDesc: '해설을 봐도 헷갈린다면 AI 튜터에게 무엇이든 물어보세요!',
    aiTutorAskPlaceholder: '이 문제에 대해 궁금한 점을 질문해 보세요...',
    sendBtn: '질문 전송',

    // 🏆 랭킹보드
    rankingBoardTitle: '오늘의 실시간 랭킹전',
    rankingBoardDesc: '매일 3차전! 전국의 고수들과 영문법 실시간 랭킹 대결',
    cycle1: '1차전 (06:00~14:00)',
    cycle2: '2차전 (14:00~22:00)',
    cycle3: '3차전 (22:00~06:00)',
    myRank: '내 순위',
    points: '점',
    timeTaken: '소요 시간',

    // 🎯 난이도 선택
    selectDifficultyTitle: '난이도 선택',
    selectDifficultyDesc: '내 실력에 딱 맞는 단계부터 차근차근 마스터하세요',
    startChallenge: '챌린지 시작하기 ➔'
  },
  en: {
    // 🌐 Common & Header
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
    exit: 'Exit',
    exitConfirmTitle: 'Do you want to exit the quiz?',
    exitConfirmDesc: 'Progress for the current quiz may not be saved.',

    // 📱 Main Menu
    rankingHeroTitle: 'Live Ranking Battle (10 Qs Time Attack)',
    rankingHeroDesc: 'Identical 10 official questions for all! Finish fast to claim 1st place & bonus coins! ⚡',
    inProgress: 'In Progress',
    currentCycleLabel: 'Current',
    myGrowthReport: 'My Live Growth Report',
    growthDashboardBtn: 'Growth Analytics Dashboard ➔',
    cumulativeXp: 'Total',
    accuracyLabel: 'Accuracy',
    maxTierReached: 'Max Tier Reached 👑',
    xpRemaining: 'XP Remaining',
    dailyChallengeTitle: 'Daily Grammar Challenge',
    dailyChallengeDesc: '5-level adaptive grammar quizzes with instant AI tutor feedback',
    expressionLabHeroTitle: 'Native Expression Lab',
    expressionLabHeroDesc: 'Master 500+ idioms, business terms, and conversational patterns',
    incorrectHeroTitle: 'Incorrect Review Notes',
    incorrectHeroDesc: 'Review missed questions and reduce error rate to 0%',
    weaknessHeroTitle: '5-Form Weakness Analysis',
    weaknessHeroDesc: 'AI diagnostic report on your mastery across 5 sentence forms',
    bookmarkHeroTitle: 'Important Bookmarks',
    bookmarkHeroDesc: 'Intensive review of saved killer questions in your vault',
    publicDbTitle: 'Public Question Bank',
    publicDbDesc: 'Big data grammar archive shared with learners nationwide',
    rankingLeaderboardTitle: "Today's Live Leaderboard",
    viewFullRankings: 'View Full Rankings ➔',
    pwaInstallTitle: '📲 Install App to Home Screen',
    pwaInstallDesc: 'Launch instantly from your home screen like a native app!',
    installNow: 'Install Now',
    todayGoalLabel: 'Daily Goal Progress',
    avatarGachaBtn: '🎰 Avatar Summon Shop',
    avatarCatalogBtn: '🪐 104 Collection',
    adminCenterBtn: '👑 Admin Center',
    inquiryBtn: '💬 Help & Feedback',
    noRankingData: 'No ranking records yet. Be the first to claim 1st place!',
    rankUnit: '',

    // 🔑 Login
    welcomeTitle: 'English Grammar Pro',
    welcomeSubtitle: 'AI-Powered Adaptive English Mastery Platform',
    googleLogin: 'Continue with Google in 1s',
    pinLogin: 'Simple PIN Login',
    enterName: 'Enter Nickname',
    enterPin: 'PIN (4 digits)',
    loginBtn: 'Sign In',
    registerBtn: 'Create Free Account',
    randomNickname: '🎲 Random Name',
    guestNotice: 'Your learning progress is synced automatically to the cloud across all devices.',

    // 👤 Profile
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

    // 🎰 Avatar Gacha & Catalog
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

    // 📝 Quiz View
    submitAnswer: 'Submit Answer',
    nextQuestion: 'Next Question ➔',
    finishQuiz: 'Finish & View Results ➔',
    explanation: 'AI Detailed Explanation',
    keyPoint: 'Key Grammar Focus',
    grammarForm: 'Grammar Category',
    bookmark: 'Bookmark',
    bookmarked: 'Bookmarked',
    reportQuestion: 'Report Error',
    streak: 'Streak!',
    correct: 'Perfect! Correct Answer 🎯',
    incorrect: 'Incorrect! Wrong Answer 🚨',
    correctAnswerIs: 'Correct Answer:',
    formSentence: 'Sentence Form',
    correctCoinReward: 'On Correct +',
    coinsText: 'Coins',
    tierCap: 'Tier Cap:',
    translationTitle: 'Korean Translation',
    englishMeaningTitle: '🇺🇸 English Paraphrase & Meaning',
    optionAnalysis: 'Option Analysis',
    chunkPattern: '🧩 Grammar Chunk Pattern',
    nuance: '💡 Native Nuance & Usage',
    aiTutorTitle: 'Master AI Tutor 1:1 Q&A',
    aiTutorDesc: 'Ask anything if you need extra clarification on this grammar point!',
    aiTutorAskPlaceholder: 'Ask a question about this grammar question...',
    sendBtn: 'Send Question',

    // 🏆 Ranking Board
    rankingBoardTitle: "Today's Live Ranking Battle",
    rankingBoardDesc: '3 rounds daily! Compete live in English grammar with top players',
    cycle1: 'Round 1 (06:00~14:00)',
    cycle2: 'Round 2 (14:00~22:00)',
    cycle3: 'Round 3 (22:00~06:00)',
    myRank: 'My Rank',
    points: 'PTS',
    timeTaken: 'Time Elapsed',

    // 🎯 Difficulty Selection
    selectDifficultyTitle: 'Select Difficulty',
    selectDifficultyDesc: 'Master English step-by-step with adaptive training for your level',
    startChallenge: 'Start Challenge ➔'
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
    const dict = TRANSLATIONS[language] || TRANSLATIONS.ko;
    return dict[key] || TRANSLATIONS.ko[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
