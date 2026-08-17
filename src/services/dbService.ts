import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  writeBatch, 
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc,
  arrayUnion,
  runTransaction,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { signInAnonymously, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, User } from 'firebase/auth';
import { 
  UserProfile, 
  Question, 
  WeaknessRecord, 
  WeaknessAnalysis, 
  RankingItem,
  CycleInfo,
  ExpressionItem,
  BookmarkItem,
  FormMastery,
  AvatarItem,
  SystemSettings,
  PushAnnouncement
} from '../types';
import { sanitizeForm, generateRankingCycleQuestions, generateBulkQuestions, shuffleOptions, normalizeAndFixQuestion } from './geminiService';
import { STARTER_AVATAR_IDS, performGachaDraw, AVATAR_DATABASE, generateRandomNickname } from './avatarService';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 🛡️ Firestore 안전 저장을 위한 undefined 재귀적 제거 헬퍼 (Unsupported field value: undefined 방지)
export function removeUndefinedDeep<T = any>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => removeUndefinedDeep(item)) as any;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedDeep(value);
      }
    }
    return cleaned;
  }
  return obj;
}

export function getCurrentCycleInfo(): CycleInfo {
  const now = new Date();
  const hour = now.getHours();
  const todayStr = getTodayDateString();

  let cycleIndex: 1 | 2 | 3 = 1;
  let cycleName = '';
  let startTimeStr = '';
  let endTimeStr = '';
  let endHour = 10;

  if (hour >= 18) {
    cycleIndex = 3;
    cycleName = '3차전 (18:00 ~ 24:00)';
    startTimeStr = '18:00';
    endTimeStr = '24:00';
    endHour = 24;
  } else if (hour >= 10) {
    cycleIndex = 2;
    cycleName = '2차전 (10:00 ~ 18:00)';
    startTimeStr = '10:00';
    endTimeStr = '18:00';
    endHour = 18;
  } else {
    cycleIndex = 1;
    cycleName = '1차전 (00:00 ~ 10:00)';
    startTimeStr = '00:00';
    endTimeStr = '10:00';
    endHour = 10;
  }

  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour === 24 ? 23 : endHour, endHour === 24 ? 59 : 0, 59);
  const diffMs = Math.max(0, endDate.getTime() - now.getTime());
  const remainingMinutes = Math.floor(diffMs / (1000 * 60));
  const rHours = Math.floor(remainingMinutes / 60);
  const rMins = remainingMinutes % 60;
  const remainingTimeFormatted = rHours > 0 ? `${rHours}시간 ${rMins}분 남음` : `${rMins}분 남음`;

  return {
    cycleId: `${todayStr}_cycle${cycleIndex}`,
    cycleIndex,
    cycleName,
    startTimeStr,
    endTimeStr,
    remainingMinutes,
    remainingTimeFormatted
  };
}

// 🌐 랭킹전 차전 및 잔여 시간 다국어 포맷터 (한국어 / 영어)
export function getCycleStatusText(cycle: CycleInfo, language: 'ko' | 'en' = 'ko'): {
  roundLabel: string;
  timeRange: string;
  inProgressText: string;
  remainingText: string;
} {
  const roundLabel = language === 'en' ? `Round ${cycle.cycleIndex}` : `${cycle.cycleIndex}차전`;
  const timeRange = `${cycle.startTimeStr} ~ ${cycle.endTimeStr}`;
  const inProgressText = language === 'en' 
    ? `${roundLabel} (${timeRange}) In Progress`
    : `현재 ${roundLabel} (${timeRange}) 진행 중`;

  const rHours = Math.floor(cycle.remainingMinutes / 60);
  const rMins = cycle.remainingMinutes % 60;
  
  let remainingText = '';
  if (language === 'en') {
    if (rHours > 0 && rMins > 0) {
      remainingText = `${rHours}h ${rMins}m left`;
    } else if (rHours > 0) {
      remainingText = `${rHours}h left`;
    } else {
      remainingText = `${rMins}m left`;
    }
  } else {
    if (rHours > 0 && rMins > 0) {
      remainingText = `${rHours}시간 ${rMins}분 남음`;
    } else if (rHours > 0) {
      remainingText = `${rHours}시간 남음`;
    } else {
      remainingText = `${rMins}분 남음`;
    }
  }

  return {
    roundLabel,
    timeRange,
    inProgressText,
    remainingText
  };
}

export interface TierStats {
  lvl1Correct?: number;
  lvl2Correct?: number;
  lvl3Correct?: number;
  lvl4Correct?: number;
}

// 🏆 티어 계산기 (3개월 꾸준한 학습 시 마스터 티어 달성 & 난이도별 상한선 캡 적용)
export function calculateTier(xp: number = 0, levelStats?: TierStats): { 
  tier: string; 
  minXp: number; 
  maxXp: number; 
  progress: number; 
  badgeColor: string; 
  icon: string;
  capNotice?: string;
} {
  const lvl2Plus = (levelStats?.lvl2Correct || 0) + (levelStats?.lvl3Correct || 0) + (levelStats?.lvl4Correct || 0);
  const lvl3Plus = (levelStats?.lvl3Correct || 0) + (levelStats?.lvl4Correct || 0);
  const lvl4 = levelStats?.lvl4Correct || 0;

  // 1) Master: 7500+ XP (4단계 실전 문제 20개 이상 정답 필수)
  if (xp >= 7500) {
    if (!levelStats || lvl4 >= 20) {
      return { tier: 'Master', minXp: 7500, maxXp: 15000, progress: 100, badgeColor: 'from-amber-400 via-rose-500 to-purple-600', icon: '👑' };
    } else {
      return { 
        tier: 'Diamond', 
        minXp: 4500, 
        maxXp: 7500, 
        progress: 100, 
        badgeColor: 'from-cyan-400 to-blue-500', 
        icon: '💎',
        capNotice: `마스터 승급을 위해 4단계 문제 ${Math.max(0, 20 - lvl4)}개 정답이 더 필요합니다.`
      };
    }
  } 
  // 2) Diamond: 4500 ~ 7499 XP (3단계 이상 문제 25개 이상 정답 필수)
  else if (xp >= 4500) {
    if (!levelStats || lvl3Plus >= 25) {
      const progress = Math.min(100, Math.round(((xp - 4500) / 3000) * 100));
      return { tier: 'Diamond', minXp: 4500, maxXp: 7500, progress, badgeColor: 'from-cyan-400 to-blue-500', icon: '💎' };
    } else {
      return {
        tier: 'Gold',
        minXp: 800,
        maxXp: 2000,
        progress: 100,
        badgeColor: 'from-amber-400 to-yellow-500',
        icon: '🥇',
        capNotice: `다이아 승급을 위해 3단계 이상 문제 ${Math.max(0, 25 - lvl3Plus)}개 정답이 더 필요합니다.`
      };
    }
  } 
  // 3) Platinum: 2000 ~ 4499 XP (3단계 이상 문제 10개 이상 정답 필수)
  else if (xp >= 2000) {
    if (!levelStats || lvl3Plus >= 10) {
      const progress = Math.min(100, Math.round(((xp - 2000) / 2500) * 100));
      return { tier: 'Platinum', minXp: 2000, maxXp: 4500, progress, badgeColor: 'from-emerald-400 to-teal-500', icon: '🏆' };
    } else {
      return {
        tier: 'Gold',
        minXp: 800,
        maxXp: 2000,
        progress: 100,
        badgeColor: 'from-amber-400 to-yellow-500',
        icon: '🥇',
        capNotice: `플래티넘 승급을 위해 3단계 이상 문제 ${Math.max(0, 10 - lvl3Plus)}개 정답이 더 필요합니다.`
      };
    }
  } 
  // 4) Gold: 800 ~ 1999 XP (2단계 이상 문제 10개 이상 정답 필수)
  else if (xp >= 800) {
    if (!levelStats || lvl2Plus >= 10) {
      const progress = Math.min(100, Math.round(((xp - 800) / 1200) * 100));
      return { tier: 'Gold', minXp: 800, maxXp: 2000, progress, badgeColor: 'from-amber-400 to-yellow-500', icon: '🥇' };
    } else {
      return {
        tier: 'Silver',
        minXp: 200,
        maxXp: 800,
        progress: 100,
        badgeColor: 'from-slate-300 to-slate-400',
        icon: '🥈',
        capNotice: `골드 승급을 위해 2단계 이상 문제 ${Math.max(0, 10 - lvl2Plus)}개 정답이 더 필요합니다.`
      };
    }
  } 
  // 5) Silver: 200 ~ 799 XP (1단계 문제로 달성 가능)
  else if (xp >= 200) {
    const progress = Math.min(100, Math.round(((xp - 200) / 600) * 100));
    return { tier: 'Silver', minXp: 200, maxXp: 800, progress, badgeColor: 'from-slate-300 to-slate-400', icon: '🥈' };
  } 
  // 6) Bronze: 0 ~ 199 XP
  else {
    const progress = Math.min(100, Math.round((xp / 200) * 100));
    return { tier: 'Bronze', minXp: 0, maxXp: 200, progress, badgeColor: 'from-amber-700 to-orange-800', icon: '🥉' };
  }
}

// 1. 사용자 인증 (기본 200 코인 & 기본 50칸 북마크 & 4대 스타터 아바타 기본 지급 및 선택 아바타 즉시 장착)
export async function authenticateUser(
  name: string, 
  pin: string, 
  starterAvatarId?: string
): Promise<{ success: boolean; profile?: UserProfile; isNew?: boolean; error?: string }> {
  try {
    // 🔒 이전 구글 세션이 남아있다면 안전하게 초기화 후 익명 세션 생성
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      await auth.signOut();
    }
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    const trimmedName = name.trim();
    const formattedPin = String(pin).padStart(6, '0');

    const userRef = doc(db, 'users', trimmedName);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const isPinMatch = data.pin === formattedPin || data.pin === pin || data.pin === String(pin).padStart(4, '0');
      
      if (isPinMatch) {
        const userCoins = typeof data.coins === 'number' ? data.coins : 200;
        const bLimit = typeof data.bookmarkLimit === 'number' ? data.bookmarkLimit : 50;
        const currentXp = typeof data.xp === 'number' ? data.xp : 0;
        const avatar = data.avatar || '🦁';
        const currentAvatarId = data.currentAvatarId || 'lion';
        const dailyGoal = data.dailyGoal || 10;
        const totalSolved = typeof data.totalSolved === 'number' ? data.totalSolved : 0;
        const totalCorrect = typeof data.totalCorrect === 'number' ? data.totalCorrect : 0;
        const unlockedAvatars = Array.isArray(data.unlockedAvatars) && data.unlockedAvatars.length > 0 
          ? Array.from(new Set([...STARTER_AVATAR_IDS, ...data.unlockedAvatars]))
          : STARTER_AVATAR_IDS;
        const isAdmin = checkIsAdmin({ name: trimmedName, pin: formattedPin, email: data.email, isAdmin: data.isAdmin });

        const profile: UserProfile = { 
          name: trimmedName, 
          pin: formattedPin, 
          coins: userCoins,
          bookmarkLimit: bLimit,
          avatar,
          currentAvatarId,
          unlockedAvatars,
          xp: currentXp,
          tier: calculateTier(currentXp).tier,
          dailyGoal,
          totalSolved,
          totalCorrect,
          email: data.email,
          photoURL: data.photoURL,
          isAdmin,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : typeof data.createdAt === 'number' ? data.createdAt : undefined
        };

        await setDoc(userRef, {
          coins: userCoins,
          bookmarkLimit: bLimit,
          avatar,
          currentAvatarId,
          dailyGoal,
          unlockedAvatars,
          isAdmin,
          updatedAt: serverTimestamp()
        }, { merge: true });

        return { 
          success: true, 
          isNew: false, 
          profile
        };
      } else {
        return { success: false, error: "PIN 번호가 일치하지 않습니다." };
      }
    } else {
      const isAdmin = checkIsAdmin({ name: trimmedName, pin: formattedPin });
      const selectedStarter = AVATAR_DATABASE.find(a => a.id === starterAvatarId) || AVATAR_DATABASE.find(a => a.id === 'lion');

      const newProfile: UserProfile = {
        name: trimmedName,
        pin: formattedPin,
        coins: 200,
        bookmarkLimit: 50,
        avatar: selectedStarter?.icon || '🦁',
        currentAvatarId: selectedStarter?.id || 'lion',
        unlockedAvatars: STARTER_AVATAR_IDS,
        xp: 0,
        tier: 'Bronze',
        dailyGoal: 10,
        totalSolved: 0,
        totalCorrect: 0,
        isAdmin
      };

      const cleanPayload = removeUndefinedDeep({
        ...newProfile,
        createdAt: serverTimestamp()
      });

      await setDoc(userRef, cleanPayload, { merge: true });

      return { 
        success: true, 
        isNew: true, 
        profile: newProfile
      };
    }
  } catch (error: any) {
    console.error("authenticateUser Error:", error);
    return { success: false, error: error.message || "로그인 처리 중 오류가 발생했습니다." };
  }
}

// 🔐 1-0. Google User Profile Creator / Getter (UID 및 displayName 양방향 완벽 동기화 및 데이터 유실 방지)
export async function createOrGetGoogleUserProfile(gUser: User): Promise<{ profile: UserProfile; isNew: boolean }> {
  const displayName = gUser.displayName || (gUser.email ? gUser.email.split('@')[0] : '학습자');
  const uidRef = doc(db, 'users', gUser.uid);
  const nameRef = doc(db, 'users', displayName);

  const [uidSnap, nameSnap] = await Promise.all([getDoc(uidRef), getDoc(nameRef)]);
  const uidData = uidSnap.exists() ? uidSnap.data() : {};
  const nameData = nameSnap.exists() ? nameSnap.data() : {};
  const hasExisting = uidSnap.exists() || nameSnap.exists();
  const hasCompletedInitialSetup = !!(nameData.hasCompletedInitialSetup || uidData.hasCompletedInitialSetup);

  if (hasExisting) {
    const currentXp = Math.max(nameData.xp || 0, uidData.xp || 0);
    const coins = Math.max(nameData.coins ?? 200, uidData.coins ?? 200);
    const bookmarkLimit = Math.max(nameData.bookmarkLimit || 50, uidData.bookmarkLimit || 50);
    const totalSolved = Math.max(nameData.totalSolved || 0, uidData.totalSolved || 0);
    const totalCorrect = Math.max(nameData.totalCorrect || 0, uidData.totalCorrect || 0);
    const dailyGoal = nameData.dailyGoal || uidData.dailyGoal || 10;

    const unlockedAvatars = Array.from(new Set([
      ...STARTER_AVATAR_IDS,
      ...(Array.isArray(nameData.unlockedAvatars) ? nameData.unlockedAvatars : []),
      ...(Array.isArray(uidData.unlockedAvatars) ? uidData.unlockedAvatars : [])
    ]));

    const avatar = nameData.avatar || uidData.avatar || '🦁';
    const currentAvatarId = nameData.currentAvatarId || uidData.currentAvatarId || 'lion';
    const isAdmin = checkIsAdmin({ name: displayName, email: gUser.email || undefined, isAdmin: nameData.isAdmin || uidData.isAdmin });

    // 문형별 마스터리 통계 양방향 병합
    const formStats: Record<string, number> = {};
    for (let f = 1; f <= 5; f++) {
      const tot = Math.max(nameData[`stats_form_${f}_total`] || 0, uidData[`stats_form_${f}_total`] || 0);
      const cor = Math.max(nameData[`stats_form_${f}_correct`] || 0, uidData[`stats_form_${f}_correct`] || 0);
      if (tot > 0) formStats[`stats_form_${f}_total`] = tot;
      if (cor > 0) formStats[`stats_form_${f}_correct`] = cor;
    }

    const profile: UserProfile = {
      name: nameData.name || displayName,
      pin: nameData.pin || uidData.pin || '000000',
      coins,
      bookmarkLimit,
      avatar,
      currentAvatarId,
      unlockedAvatars,
      xp: currentXp,
      tier: calculateTier(currentXp).tier,
      dailyGoal,
      totalSolved,
      totalCorrect,
      email: gUser.email || undefined,
      photoURL: gUser.photoURL || undefined,
      isAdmin,
      hasCompletedInitialSetup,
      createdAt: nameData.createdAt?.toMillis ? nameData.createdAt.toMillis() : uidData.createdAt?.toMillis ? uidData.createdAt.toMillis() : Date.now()
    };

    const cleanPayload = removeUndefinedDeep({
      ...profile,
      ...formStats,
      uid: gUser.uid,
      email: gUser.email || null,
      photoURL: gUser.photoURL || null,
      updatedAt: serverTimestamp()
    });

    await Promise.all([
      setDoc(uidRef, cleanPayload, { merge: true }),
      setDoc(nameRef, cleanPayload, { merge: true })
    ]);

    return { profile, isNew: !hasCompletedInitialSetup };
  } else {
    const isAdmin = checkIsAdmin({ name: displayName, email: gUser.email || undefined });
    const newProfile: UserProfile = {
      name: displayName,
      pin: '000000',
      coins: 300, // 🪙 기본 200 + 구글 가입 특별 보너스 100 = 총 300 코인 지급!
      bookmarkLimit: 50,
      avatar: '🦁',
      currentAvatarId: 'lion',
      unlockedAvatars: STARTER_AVATAR_IDS,
      xp: 0,
      tier: 'Bronze',
      dailyGoal: 10,
      totalSolved: 0,
      totalCorrect: 0,
      email: gUser.email || undefined,
      photoURL: gUser.photoURL || undefined,
      isAdmin,
      hasCompletedInitialSetup: false
    };

    const cleanPayload = removeUndefinedDeep({
      ...newProfile,
      uid: gUser.uid,
      email: gUser.email || null,
      photoURL: gUser.photoURL || null,
      createdAt: serverTimestamp()
    });

    await Promise.all([
      setDoc(uidRef, cleanPayload, { merge: true }),
      setDoc(nameRef, cleanPayload, { merge: true })
    ]);

    return { profile: newProfile, isNew: true };
  }
}

// 🔐 1-1. 구글 공식 암호화 OAuth 2.0 로그인
export async function signInWithGoogle(): Promise<{ success: boolean; profile?: UserProfile; isNew?: boolean; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const { profile, isNew } = await createOrGetGoogleUserProfile(result.user);
    return { success: true, profile, isNew };
  } catch (error: any) {
    console.error("signInWithGoogle Error:", error);
    const code = error.code || '';
    
    if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
      return { 
        success: false, 
        error: "Firebase 콘솔(daybreak-72ea7)의 [Authentication > Sign-in method]에서 'Google' 제공업체가 활성화되지 않았습니다. 콘솔에서 Google 로그인을 켜주세요." 
      };
    } else if (code === 'auth/popup-closed-by-user') {
      return { success: false, error: "구글 로그인 창이 닫혔습니다." };
    } else if (code === 'auth/popup-blocked') {
      return { success: false, error: "브라우저에서 구글 로그인 팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해 주세요." };
    } else if (code === 'auth/unauthorized-domain') {
      return { 
        success: false, 
        error: "Firebase [승인된 도메인]에 현재 도메인(IP)이 등록되어 있지 않습니다. Firebase 콘솔의 Authentication > Settings > Authorized domains에 현재 IP/도메인을 추가해 주세요." 
      };
    }
    
    return { success: false, error: error.message || "구글 로그인에 실패했습니다." };
  }
}

// ✨ 1-1-1. 구글 첫 로그인 사용자 무료 프로필 최초 설정 (닉네임 & 스타터 아바타 1회 무료 확정)
export async function completeInitialGoogleSetup(
  currentName: string,
  newName: string,
  starterAvatarId: string
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const trimmed = newName.trim();
    if (!trimmed) return { success: false, error: "닉네임을 입력해 주세요." };

    const selectedStarter = AVATAR_DATABASE.find(a => a.id === starterAvatarId) || AVATAR_DATABASE.find(a => a.id === 'lion');
    const avatar = selectedStarter?.icon || '🦁';
    const currentAvatarId = selectedStarter?.id || 'lion';

    // 닉네임이 변경된 경우
    if (trimmed !== currentName) {
      const targetRef = doc(db, 'users', trimmed);
      const targetSnap = await getDoc(targetRef);
      if (targetSnap.exists()) {
        return { success: false, error: "이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요." };
      }

      const oldRef = doc(db, 'users', currentName);
      const oldSnap = await getDoc(oldRef);
      const oldData = oldSnap.exists() ? oldSnap.data() : {};

      const updatedPayload = removeUndefinedDeep({
        ...oldData,
        name: trimmed,
        avatar,
        currentAvatarId,
        unlockedAvatars: STARTER_AVATAR_IDS,
        hasCompletedInitialSetup: true,
        updatedAt: serverTimestamp()
      });

      await setDoc(targetRef, updatedPayload, { merge: true });
      if (auth.currentUser?.uid) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), updatedPayload, { merge: true });
      }

      if (oldSnap.exists()) {
        await deleteDoc(oldRef);
      }

      const newProfile: UserProfile = {
        ...oldData,
        name: trimmed,
        pin: oldData.pin || '000000',
        coins: oldData.coins ?? 300,
        bookmarkLimit: oldData.bookmarkLimit || 50,
        avatar,
        currentAvatarId,
        unlockedAvatars: STARTER_AVATAR_IDS,
        xp: oldData.xp || 0,
        tier: oldData.tier || 'Bronze',
        dailyGoal: oldData.dailyGoal || 10,
        totalSolved: oldData.totalSolved || 0,
        totalCorrect: oldData.totalCorrect || 0,
        email: oldData.email || auth.currentUser?.email || undefined,
        photoURL: oldData.photoURL || auth.currentUser?.photoURL || undefined,
        isAdmin: checkIsAdmin({ name: trimmed, email: oldData.email || auth.currentUser?.email || undefined }),
        hasCompletedInitialSetup: true
      };

      return { success: true, profile: newProfile };
    } else {
      // 닉네임 변경 없이 아바타만 선택한 경우
      const userRef = doc(db, 'users', currentName);
      const snap = await getDoc(userRef);
      const data = snap.exists() ? snap.data() : {};

      const updatedPayload = removeUndefinedDeep({
        avatar,
        currentAvatarId,
        unlockedAvatars: STARTER_AVATAR_IDS,
        hasCompletedInitialSetup: true,
        updatedAt: serverTimestamp()
      });

      await setDoc(userRef, updatedPayload, { merge: true });
      if (auth.currentUser?.uid) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), updatedPayload, { merge: true });
      }

      const updatedProfile: UserProfile = {
        ...data,
        name: currentName,
        pin: data.pin || '000000',
        coins: data.coins ?? 300,
        bookmarkLimit: data.bookmarkLimit || 50,
        avatar,
        currentAvatarId,
        unlockedAvatars: STARTER_AVATAR_IDS,
        xp: data.xp || 0,
        tier: data.tier || 'Bronze',
        dailyGoal: data.dailyGoal || 10,
        totalSolved: data.totalSolved || 0,
        totalCorrect: data.totalCorrect || 0,
        email: data.email || auth.currentUser?.email || undefined,
        photoURL: data.photoURL || auth.currentUser?.photoURL || undefined,
        isAdmin: checkIsAdmin({ name: currentName, email: data.email || auth.currentUser?.email || undefined }),
        hasCompletedInitialSetup: true
      };

      return { success: true, profile: updatedProfile };
    }
  } catch (e: any) {
    console.error("completeInitialGoogleSetup Error:", e);
    return { success: false, error: e.message || "프로필 설정 처리 중 오류가 발생했습니다." };
  }
}

// 🔐 1-3. PIN 계정 사용자가 나중에 구글 계정 연동하여 데이터 영구 백업 (+100 구글 연동 보너스 코인 지급)
export async function linkGoogleAccount(currentUser: UserProfile): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const gUser = result.user;

    const userRef = doc(db, 'users', currentUser.name);
    const snap = await getDoc(userRef);

    let updatedProfile: UserProfile;
    const isAdmin = checkIsAdmin({ name: currentUser.name, email: gUser.email || undefined, isAdmin: currentUser.isAdmin });

    if (snap.exists()) {
      const data = snap.data();
      const mergedUnlocked = Array.from(new Set([
        ...STARTER_AVATAR_IDS,
        ...(data.unlockedAvatars || []),
        ...(currentUser.unlockedAvatars || [])
      ]));
      const alreadyGotLinkBonus = !!data.hasLinkedGoogleBonus;
      const baseCoins = Math.max(data.coins ?? 200, currentUser.coins ?? 200);
      const maxCoins = alreadyGotLinkBonus ? baseCoins : baseCoins + 100;
      const maxXp = Math.max(data.xp || 0, currentUser.xp || 0);

      updatedProfile = {
        name: currentUser.name || data.name || gUser.displayName || '학습자',
        pin: currentUser.pin || '000000',
        coins: maxCoins,
        bookmarkLimit: Math.max(data.bookmarkLimit ?? 50, currentUser.bookmarkLimit ?? 50),
        avatar: currentUser.avatar || data.avatar || '🦁',
        currentAvatarId: currentUser.currentAvatarId || data.currentAvatarId || 'lion',
        unlockedAvatars: mergedUnlocked,
        xp: maxXp,
        tier: calculateTier(maxXp).tier,
        dailyGoal: currentUser.dailyGoal || data.dailyGoal || 10,
        email: gUser.email || undefined,
        photoURL: gUser.photoURL || undefined,
        isAdmin
      };

      const cleanPayload = removeUndefinedDeep({
        name: updatedProfile.name,
        pin: updatedProfile.pin,
        coins: updatedProfile.coins,
        bookmarkLimit: updatedProfile.bookmarkLimit,
        avatar: updatedProfile.avatar,
        currentAvatarId: updatedProfile.currentAvatarId,
        unlockedAvatars: updatedProfile.unlockedAvatars,
        xp: updatedProfile.xp,
        tier: updatedProfile.tier,
        dailyGoal: updatedProfile.dailyGoal,
        email: gUser.email || null,
        photoURL: gUser.photoURL || null,
        isAdmin,
        hasLinkedGoogleBonus: true,
        lastLinkedAt: serverTimestamp()
      });

      await updateDoc(userRef, cleanPayload);
    } else {
      updatedProfile = {
        ...currentUser,
        email: gUser.email || undefined,
        photoURL: gUser.photoURL || undefined,
        isAdmin
      };

      const cleanPayload = removeUndefinedDeep({
        name: updatedProfile.name,
        pin: updatedProfile.pin,
        coins: updatedProfile.coins,
        bookmarkLimit: updatedProfile.bookmarkLimit,
        avatar: updatedProfile.avatar,
        currentAvatarId: updatedProfile.currentAvatarId,
        unlockedAvatars: updatedProfile.unlockedAvatars,
        xp: updatedProfile.xp,
        tier: updatedProfile.tier,
        dailyGoal: updatedProfile.dailyGoal,
        email: gUser.email || null,
        photoURL: gUser.photoURL || null,
        isAdmin,
        createdAt: serverTimestamp(),
        lastLinkedAt: serverTimestamp()
      });

      await setDoc(userRef, cleanPayload);
    }

    return { success: true, profile: updatedProfile };
  } catch (error: any) {
    console.error("linkGoogleAccount Error:", error);
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: '구글 연동 창이 닫혔습니다.' };
    }
    return { success: false, error: error.message || '구글 계정 연동에 실패했습니다.' };
  }
}

// 🔐 1-2. 리디렉트 복귀 시 구글 인증 결과 자동 확인
export async function checkGoogleRedirectResult(): Promise<UserProfile | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const { profile } = await createOrGetGoogleUserProfile(result.user);
      return profile;
    }
    return null;
  } catch (e) {
    console.error("checkGoogleRedirectResult Error:", e);
    return null;
  }
}

// 👤 1-2. 프로필 정보 업데이트
export async function updateUserProfile(userName: string, updates: Partial<UserProfile>): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userName);
    await updateDoc(userRef, {
      ...updates
    });
    return true;
  } catch (e) {
    console.error("updateUserProfile Error:", e);
    return false;
  }
}

// ✏️ 1-2-1. 닉네임 변경 (코인 30 소모)
export async function changeUserNickname(
  currentName: string, 
  newName: string, 
  cost: number = 30
): Promise<{ success: boolean; newName?: string; newCoins?: number; error?: string }> {
  try {
    const trimmed = newName.trim();
    if (!trimmed) return { success: false, error: "닉네임을 입력해 주세요." };
    if (trimmed === currentName) return { success: true, newName: currentName };

    const currentCoins = await getUserCoins(currentName);
    if (currentCoins < cost) {
      return { success: false, error: `코인이 부족합니다! (필요: ${cost} 코인 / 보유: ${currentCoins} 코인)` };
    }

    // 중복 닉네임 체크
    const targetRef = doc(db, 'users', trimmed);
    const targetSnap = await getDoc(targetRef);
    if (targetSnap.exists()) {
      return { success: false, error: "이미 사용 중인 닉네임입니다. 다른 이름을 입력해 주세요." };
    }

    // 현재 사용자 데이터 복사 및 이전
    const oldRef = doc(db, 'users', currentName);
    const oldSnap = await getDoc(oldRef);
    if (!oldSnap.exists()) {
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const userData = oldSnap.data();
    const updatedCoins = Math.max(0, currentCoins - cost);

    // 새 문서 생성
    await setDoc(targetRef, removeUndefinedDeep({
      ...userData,
      name: trimmed,
      coins: updatedCoins,
      updatedAt: serverTimestamp()
    }));

    if (auth.currentUser?.uid) {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        name: trimmed,
        coins: updatedCoins,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 기존 문서 삭제
    await deleteDoc(oldRef);

    // 🔄 랭킹 및 각종 사용자 기록 컬렉션 닉네임 일괄 동기화 (비동기 병렬 처리)
    try {
      // 1) cycle_rankings 컬렉션 이름 변경
      const cycleRankQuery = query(collection(db, 'cycle_rankings'), where('name', '==', currentName));
      const cycleRankSnap = await getDocs(cycleRankQuery);
      if (!cycleRankSnap.empty) {
        const batch = writeBatch(db);
        cycleRankSnap.forEach(d => {
          batch.update(d.ref, { name: trimmed });
        });
        await batch.commit();
      }

      // 2) rankings 컬렉션 이름 변경
      const rankQuery = query(collection(db, 'rankings'), where('name', '==', currentName));
      const rankSnap = await getDocs(rankQuery);
      if (!rankSnap.empty) {
        const batch = writeBatch(db);
        rankSnap.forEach(d => {
          batch.update(d.ref, { name: trimmed });
        });
        await batch.commit();
      }

      // 3) incorrect_questions 오답노트 이름 동기화
      const incQuery = query(collection(db, 'incorrect_questions'), where('userName', '==', currentName));
      const incSnap = await getDocs(incQuery);
      if (!incSnap.empty) {
        const batch = writeBatch(db);
        incSnap.forEach(d => {
          batch.update(d.ref, { userName: trimmed });
        });
        await batch.commit();
      }

      // 4) bookmarks 북마크 이름 동기화
      const bmQuery = query(collection(db, 'bookmarks'), where('userName', '==', currentName));
      const bmSnap = await getDocs(bmQuery);
      if (!bmSnap.empty) {
        const batch = writeBatch(db);
        bmSnap.forEach(d => {
          batch.update(d.ref, { userName: trimmed });
        });
        await batch.commit();
      }
    } catch (syncErr) {
      console.warn("Ranking/History collection nickname sync error:", syncErr);
    }

    return { success: true, newName: trimmed, newCoins: updatedCoins };
  } catch (e: any) {
    return { success: false, error: e.message || "닉네임 변경 실패" };
  }
}

// 🎰 1-2-2. 아바타 가챠 뽑기 (1회 🪙 30 / 10회 🪙 270, 관리자 무료)
export async function drawGachaAvatar(
  userName: string, 
  drawCount: 1 | 10 = 1
): Promise<{ 
  success: boolean; 
  results?: Array<{ avatar: AvatarItem; isDuplicate: boolean; refundAmount: number }>; 
  newCoins?: number;
  totalRefund?: number;
  newlyUnlockedIds?: string[];
  error?: string 
}> {
  try {
    const cost = drawCount === 10 ? 270 : 30;

    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);
    let data: any = {};
    if (snap.exists()) {
      data = snap.data();
    } else {
      data = {
        name: userName,
        coins: 200,
        unlockedAvatars: STARTER_AVATAR_IDS,
        avatar: '🦁',
        currentAvatarId: 'lion',
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, data);
    }

    const isAdmin = data.isAdmin || checkIsAdmin(data as UserProfile) || userName === 'admin';
    const finalDrawCost = isAdmin ? 0 : cost;

    const currentCoins = data.coins ?? 200;
    if (!isAdmin && currentCoins < finalDrawCost) {
      return { success: false, error: `코인이 부족합니다! (필요: ${finalDrawCost} 코인 / 보유: ${currentCoins} 코인)` };
    }

    const currentUnlocked: string[] = Array.isArray(data.unlockedAvatars) 
      ? Array.from(new Set([...STARTER_AVATAR_IDS, ...data.unlockedAvatars])) 
      : [...STARTER_AVATAR_IDS];

    const results: Array<{ avatar: AvatarItem; isDuplicate: boolean; refundAmount: number }> = [];
    let totalRefund = 0;
    const newlyUnlockedSet = new Set<string>();

    for (let i = 0; i < drawCount; i++) {
      const allKnown = Array.from(new Set([...currentUnlocked, ...Array.from(newlyUnlockedSet)]));
      const draw = performGachaDraw(allKnown);
      results.push(draw);

      if (!draw.isDuplicate) {
        newlyUnlockedSet.add(draw.avatar.id);
      } else {
        totalRefund += draw.refundAmount;
      }
    }

    const netCost = isAdmin ? 0 : Math.max(0, cost - totalRefund);
    const finalCoins = isAdmin ? 999999 : Math.max(0, currentCoins - netCost);

    const newlyUnlockedArr = Array.from(newlyUnlockedSet);
    const updatedUnlockedList = Array.from(new Set([...currentUnlocked, ...newlyUnlockedArr]));

    const writePayload = {
      coins: finalCoins,
      unlockedAvatars: updatedUnlockedList,
      updatedAt: serverTimestamp()
    };

    const writePromises = [setDoc(userRef, writePayload, { merge: true })];
    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      writePromises.push(setDoc(doc(db, 'users', auth.currentUser.uid), writePayload, { merge: true }));
    }
    await Promise.all(writePromises);

    return {
      success: true,
      results,
      newCoins: finalCoins,
      totalRefund,
      newlyUnlockedIds: newlyUnlockedArr
    };
  } catch (e: any) {
    console.error("drawGachaAvatar Error:", e);
    return { success: false, error: e.message || "가챠 뽑기 중 오류가 발생했습니다." };
  }
}

// 👕 1-2-3. 보유 아바타 장착 / 갈아끼우기 (해금된 아바타 100% 무료 장착)
export async function equipUserAvatar(
  userName: string, 
  avatar: AvatarItem, 
  cost: number = 0
): Promise<{ success: boolean; newCoins?: number; error?: string }> {
  try {
    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : {};

    if (cost > 0) {
      const currentCoins = data.coins ?? 200;
      if (currentCoins < cost) {
        return { success: false, error: `코인이 부족합니다! (필요: ${cost} 코인 / 보유: ${currentCoins} 코인)` };
      }
      await deductCoins(userName, cost);
    }

    const equipPayload = {
      avatar: avatar.icon,
      currentAvatarId: avatar.id,
      updatedAt: serverTimestamp()
    };

    const writePromises = [setDoc(userRef, equipPayload, { merge: true })];
    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      writePromises.push(setDoc(doc(db, 'users', auth.currentUser.uid), equipPayload, { merge: true }));
    }
    await Promise.all(writePromises);

    const newCoins = await getUserCoins(userName);
    return { success: true, newCoins };
  } catch (e: any) {
    return { success: false, error: e.message || "아바타 장착 실패" };
  }
}

// 🗑️ 1-3. 계정 및 데이터 완전 삭제
export async function deleteUserAccount(userName: string): Promise<boolean> {
  try {
    const weakQuery = query(collection(db, 'weaknesses'), where('userName', '==', userName));
    const weakSnap = await getDocs(weakQuery);
    const batch1 = writeBatch(db);
    weakSnap.forEach(d => batch1.delete(d.ref));
    await batch1.commit();

    const bmQuery = query(collection(db, 'bookmarks'), where('userName', '==', userName));
    const bmSnap = await getDocs(bmQuery);
    const batch2 = writeBatch(db);
    bmSnap.forEach(d => batch2.delete(d.ref));
    await batch2.commit();

    const userRef = doc(db, 'users', userName);
    await deleteDoc(userRef);
    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid));
    }

    return true;
  } catch (e) {
    console.error("deleteUserAccount Error:", e);
    return false;
  }
}

// 📊 1-4. 퀴즈 풀이 결과 통계 & XP 누적 (난이도 레벨별 통계 동시 누적)
export async function recordQuizResultStats(
  userName: string, 
  form: number, 
  isCorrect: boolean, 
  level: number = 1
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userName);
    const validLevel = Math.max(1, Math.min(4, Math.round(level) || 1));
    const formKeyTotal = `stats_form_${form}_total`;
    const formKeyCorrect = `stats_form_${form}_correct`;
    const formLevelKeyTotal = `stats_form_${form}_lvl_${validLevel}_total`;
    const formLevelKeyCorrect = `stats_form_${form}_lvl_${validLevel}_correct`;
    const levelKeyTotal = `stats_lvl_${validLevel}_total`;
    const levelKeyCorrect = `stats_lvl_${validLevel}_correct`;

    // 난이도가 높을수록 더 많은 XP 획득 (Level 1: 7XP, Level 2: 10XP, Level 3: 13XP, Level 4: 16XP)
    const xpEarned = isCorrect ? (validLevel * 3 + 4) : 2;

    const updates: any = {
      totalSolved: increment(1),
      xp: increment(xpEarned),
      [formKeyTotal]: increment(1),
      [formLevelKeyTotal]: increment(1),
      [levelKeyTotal]: increment(1)
    };

    if (isCorrect) {
      updates.totalCorrect = increment(1);
      updates[formKeyCorrect] = increment(1);
      updates[formLevelKeyCorrect] = increment(1);
      updates[levelKeyCorrect] = increment(1);
    }

    const promises = [setDoc(userRef, updates, { merge: true })];
    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      promises.push(setDoc(doc(db, 'users', auth.currentUser.uid), updates, { merge: true }));
    }
    await Promise.all(promises);
  } catch (e) {
    console.error("recordQuizResultStats Error:", e);
  }
}

// 📊 1-5. 문형별 마스터리 통계 조회 (난이도별 상한선 Gating 적용)
export async function getUserMasteryStats(userName: string): Promise<{ 
  formMasteries: FormMastery[]; 
  totalSolved: number; 
  totalCorrect: number; 
  overallAccuracy: number;
  levelStats: TierStats;
}> {
  try {
    const userRef = doc(db, 'users', userName);
    let [userSnap, uidSnap] = await Promise.all([
      getDoc(userRef),
      auth.currentUser?.uid && auth.currentUser.uid !== userName ? getDoc(doc(db, 'users', auth.currentUser.uid)) : Promise.resolve(null)
    ]);

    const dataA = userSnap.exists() ? userSnap.data() : {};
    const dataB = uidSnap && uidSnap.exists() ? uidSnap.data() : {};

    const totalSolved = Math.max(dataA.totalSolved || 0, dataB.totalSolved || 0);
    const totalCorrect = Math.max(dataA.totalCorrect || 0, dataB.totalCorrect || 0);

    const levelStats: TierStats = {
      lvl1Correct: Math.max(dataA.stats_lvl_1_correct || 0, dataB.stats_lvl_1_correct || 0),
      lvl2Correct: Math.max(dataA.stats_lvl_2_correct || 0, dataB.stats_lvl_2_correct || 0),
      lvl3Correct: Math.max(dataA.stats_lvl_3_correct || 0, dataB.stats_lvl_3_correct || 0),
      lvl4Correct: Math.max(dataA.stats_lvl_4_correct || 0, dataB.stats_lvl_4_correct || 0),
    };

    const formMasteries: FormMastery[] = [];
    for (let f = 1; f <= 5; f++) {
      const total = Math.max(dataA[`stats_form_${f}_total`] || 0, dataB[`stats_form_${f}_total`] || 0);
      const correct = Math.max(dataA[`stats_form_${f}_correct`] || 0, dataB[`stats_form_${f}_correct`] || 0);
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

      const correctLvl1 = Math.max(dataA[`stats_form_${f}_lvl_1_correct`] || 0, dataB[`stats_form_${f}_lvl_1_correct`] || 0);
      const correctLvl2 = Math.max(dataA[`stats_form_${f}_lvl_2_correct`] || 0, dataB[`stats_form_${f}_lvl_2_correct`] || 0);
      const correctLvl3 = Math.max(dataA[`stats_form_${f}_lvl_3_correct`] || 0, dataB[`stats_form_${f}_lvl_3_correct`] || 0);
      const correctLvl4 = Math.max(dataA[`stats_form_${f}_lvl_4_correct`] || 0, dataB[`stats_form_${f}_lvl_4_correct`] || 0);
      const correctLvl2Plus = correctLvl2 + correctLvl3 + correctLvl4;
      const correctLvl3Plus = correctLvl3 + correctLvl4;

      // 🎯 누적 정답 수 기반 마스터리 점수 산정
      const masteryScore = (correct * 10) + Math.round(accuracy * 5);

      // 🏆 난이도별 상한선(Gating) 적용 등급 산정:
      // 1단계만 풀면: C ~ B등급까지만 승급 가능
      // 2단계 문제 포함 시: A등급까지 승급 가능 (2단계 이상 15정답 필요)
      // 3~4단계 문제 정복 시: S등급(마스터) 승급 가능 (3단계 15정답 + 4단계 10정답 필요)
      let grade: 'S' | 'A' | 'B' | 'C' = 'C';
      let nextGradeTarget = 25;
      let progressPercent = Math.min(100, Math.round((correct / 25) * 100));
      let capNotice: string | undefined = undefined;

      if (correct >= 150) {
        if (correctLvl4 >= 10 && correctLvl3Plus >= 25) {
          grade = 'S';
          nextGradeTarget = 150;
          progressPercent = 100;
        } else if (correctLvl2Plus >= 15) {
          grade = 'A';
          nextGradeTarget = 150;
          progressPercent = Math.min(99, Math.round(((correct - 75) / 75) * 100));
          capNotice = `S등급 승급을 위해 4단계 문제 ${Math.max(0, 10 - correctLvl4)}개 정답이 더 필요합니다.`;
        } else {
          grade = 'B';
          nextGradeTarget = 75;
          progressPercent = 100;
          capNotice = `A/S등급 승급을 위해 2단계 이상 문제를 풀어주세요.`;
        }
      } else if (correct >= 75) {
        if (correctLvl2Plus >= 15) {
          grade = 'A';
          nextGradeTarget = 150;
          progressPercent = Math.min(100, Math.round(((correct - 75) / 75) * 100));
        } else {
          grade = 'B';
          nextGradeTarget = 75;
          progressPercent = 100;
          capNotice = `A등급 승급을 위해 2단계 이상 문제 ${Math.max(0, 15 - correctLvl2Plus)}개 정답이 필요합니다.`;
        }
      } else if (correct >= 25) {
        grade = 'B';
        nextGradeTarget = 75;
        progressPercent = Math.min(100, Math.round(((correct - 25) / 50) * 100));
      }

      formMasteries.push({
        form: f,
        total,
        correct,
        accuracy,
        grade,
        masteryScore,
        nextGradeTarget,
        progressPercent,
        correctLvl1,
        correctLvl2,
        correctLvl3,
        correctLvl4,
        capNotice
      });
    }

    const overallAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
    return { formMasteries, totalSolved, totalCorrect, overallAccuracy, levelStats };
  } catch (e) {
    console.error("getUserMasteryStats Error:", e);
    return {
      formMasteries: [1, 2, 3, 4, 5].map(f => ({ form: f, total: 0, correct: 0, accuracy: 0, grade: 'C' })),
      totalSolved: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      levelStats: { lvl1Correct: 0, lvl2Correct: 0, lvl3Correct: 0, lvl4Correct: 0 }
    };
  }
}

// 🪙 코인 잔액 조회
export async function getUserCoins(userName: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data().coins ?? 200;
    }
    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      const uidSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (uidSnap.exists()) return uidSnap.data().coins ?? 200;
    }
    return 200;
  } catch (e) {
    console.error("getUserCoins error:", e);
    return 200;
  }
}

// 🪙 코인 추가
export async function addCoins(userName: string, amount: number): Promise<number> {
  try {
    const userRef = doc(db, 'users', userName);
    const writePromises = [
      setDoc(userRef, { coins: increment(amount), updatedAt: serverTimestamp() }, { merge: true })
    ];
    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      writePromises.push(
        setDoc(doc(db, 'users', auth.currentUser.uid), { coins: increment(amount), updatedAt: serverTimestamp() }, { merge: true })
      );
    }
    await Promise.all(writePromises);
    return await getUserCoins(userName);
  } catch (e) {
    console.error("addCoins error:", e);
    return 0;
  }
}

// 🏆 경험치(XP) 지급 및 티어 자동 승급
export async function addXp(userName: string, amount: number): Promise<{ newXp: number; newTier: string }> {
  try {
    const userRef = doc(db, 'users', userName);
    const writePromises = [
      setDoc(userRef, { xp: increment(amount), updatedAt: serverTimestamp() }, { merge: true })
    ];
    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      writePromises.push(
        setDoc(doc(db, 'users', auth.currentUser.uid), { xp: increment(amount), updatedAt: serverTimestamp() }, { merge: true })
      );
    }
    await Promise.all(writePromises);

    const snap = await getDoc(userRef);
    const xp = snap.exists() ? (snap.data().xp || 0) : 0;
    const tier = calculateTier(xp).tier;

    const tierPromises = [setDoc(userRef, { tier, updatedAt: serverTimestamp() }, { merge: true })];
    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      tierPromises.push(setDoc(doc(db, 'users', auth.currentUser.uid), { tier, updatedAt: serverTimestamp() }, { merge: true }));
    }
    await Promise.all(tierPromises);

    return { newXp: xp, newTier: tier };
  } catch (e) {
    console.error("addXp error:", e);
    return { newXp: 0, newTier: 'Bronze' };
  }
}

// 👤 전체 유저 프로필 데이터 조회 (계정별 독립 Firestore 데이터 조회)
export async function getUserProfileData(userName: string): Promise<Partial<UserProfile> | null> {
  try {
    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      const xp = typeof data.xp === 'number' ? data.xp : 0;
      const coins = typeof data.coins === 'number' ? data.coins : 200;
      const bookmarkLimit = typeof data.bookmarkLimit === 'number' ? data.bookmarkLimit : 50;
      const totalSolved = typeof data.totalSolved === 'number' ? data.totalSolved : 0;
      const totalCorrect = typeof data.totalCorrect === 'number' ? data.totalCorrect : 0;
      const dailyGoal = typeof data.dailyGoal === 'number' ? data.dailyGoal : 10;

      const unlockedAvatars = Array.isArray(data.unlockedAvatars) && data.unlockedAvatars.length > 0 
        ? Array.from(new Set([...STARTER_AVATAR_IDS, ...data.unlockedAvatars])) 
        : STARTER_AVATAR_IDS;

      const avatar = data.avatar || '🦁';
      const currentAvatarId = data.currentAvatarId || 'lion';
      const isAdmin = checkIsAdmin({ name: data.name || userName, pin: data.pin, email: data.email, isAdmin: data.isAdmin });

      return {
        name: data.name || userName,
        pin: data.pin,
        coins,
        xp,
        tier: calculateTier(xp).tier,
        bookmarkLimit,
        avatar,
        currentAvatarId,
        unlockedAvatars,
        totalSolved,
        totalCorrect,
        dailyGoal,
        email: data.email,
        photoURL: data.photoURL,
        isAdmin,
        hasCompletedInitialSetup: !!data.hasCompletedInitialSetup,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : typeof data.createdAt === 'number' ? data.createdAt : Date.now()
      };
    }
    return null;
  } catch (e) {
    console.error("getUserProfileData error:", e);
    return null;
  }
}

// 🪙 코인 차감 (관리자는 무제한 무료 패스, 신규 유저 스타터 코인 200 지원)
export async function deductCoins(userName: string, amount: number, userObj?: Partial<UserProfile> | null): Promise<boolean> {
  try {
    if (amount <= 0) return true;
    if (userObj && checkIsAdmin(userObj)) return true;

    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      // 🚀 Firestore 문서가 아직 생성되지 않은 유저인 경우 (스타터 코인 200 기반 차감 & 즉시 DB 생성)
      const localCoins = typeof userObj?.coins === 'number' ? userObj.coins : 200;
      if (localCoins < amount) return false;

      const remaining = localCoins - amount;
      await setDoc(userRef, removeUndefinedDeep({
        ...userObj,
        name: userName,
        coins: remaining,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }), { merge: true });

      try {
        if (userObj) {
          userObj.coins = remaining;
          localStorage.setItem('ai_grammar_user', JSON.stringify({ ...userObj, coins: remaining }));
        }
      } catch {}

      return true;
    }

    const data = snap.data();
    if (data.isAdmin || checkIsAdmin(data as UserProfile)) {
      return true;
    }

    const currentCoins = typeof data.coins === 'number' 
      ? data.coins 
      : (typeof userObj?.coins === 'number' ? userObj.coins : 200);

    if (currentCoins < amount) return false;

    const newCoins = currentCoins - amount;
    await setDoc(userRef, {
      coins: newCoins,
      updatedAt: serverTimestamp()
    }, { merge: true });

    try {
      if (userObj) {
        userObj.coins = newCoins;
        localStorage.setItem('ai_grammar_user', JSON.stringify({ ...userObj, coins: newCoins }));
      }
    } catch {}

    return true;
  } catch (e) {
    console.error("deductCoins error:", e);
    // 네트워크 일시 오류 시 로컬 코인이 충분하면 차감 후 진행 허용
    if (userObj && typeof userObj.coins === 'number' && userObj.coins >= amount) {
      userObj.coins -= amount;
      try {
        localStorage.setItem('ai_grammar_user', JSON.stringify(userObj));
      } catch {}
      return true;
    }
    return false;
  }
}

// ⏱️ 3분 문제 생성 쿨타임 검사 (180초, 관리자는 0초 즉시 패스)
export async function checkGenerationCooldown(userNameOrUser: string | Partial<UserProfile>): Promise<{ canGenerate: boolean; remainingSeconds: number }> {
  try {
    if (typeof userNameOrUser === 'object' && checkIsAdmin(userNameOrUser)) {
      return { canGenerate: true, remainingSeconds: 0 };
    }
    const userName = typeof userNameOrUser === 'string' ? userNameOrUser : userNameOrUser.name || '';
    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { canGenerate: true, remainingSeconds: 0 };

    const data = snap.data();
    if (data.isAdmin || checkIsAdmin(data as UserProfile)) {
      return { canGenerate: true, remainingSeconds: 0 };
    }

    const last = data.lastGeneratedAt;
    if (!last) return { canGenerate: true, remainingSeconds: 0 };

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - last) / 1000);
    const COOLDOWN_SECONDS = 180;

    if (elapsedSeconds < COOLDOWN_SECONDS) {
      return { canGenerate: false, remainingSeconds: COOLDOWN_SECONDS - elapsedSeconds };
    }

    return { canGenerate: true, remainingSeconds: 0 };
  } catch (e) {
    return { canGenerate: true, remainingSeconds: 0 };
  }
}

// ⏱️ 문제 생성 타임스탬프 기록
export async function recordGenerationTimestamp(userName: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userName);
    await updateDoc(userRef, {
      lastGeneratedAt: Date.now()
    });
  } catch (e) {
    console.error("recordGenerationTimestamp error:", e);
  }
}

// ⭐ 즐겨찾기 보관함 용량 한도 조회
export async function getBookmarkLimit(userName: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data().bookmarkLimit ?? 50;
    }
    return 50;
  } catch (e) {
    return 50;
  }
}

// ⭐ 즐겨찾기 보관함 50칸 확장 (100 코인 소모)
export async function expandBookmarkLimit(userName: string, cost: number = 100): Promise<{ success: boolean; newLimit: number; error?: string }> {
  try {
    const coins = await getUserCoins(userName);
    if (coins < cost) {
      return { success: false, newLimit: 50, error: `코인이 부족합니다! (필요: ${cost} 코인 / 보유: ${coins} 코인)` };
    }

    const deducted = await deductCoins(userName, cost);
    if (!deducted) return { success: false, newLimit: 50, error: "코인 차감 실패" };

    const userRef = doc(db, 'users', userName);
    await updateDoc(userRef, {
      bookmarkLimit: increment(50)
    });

    const newLimit = await getBookmarkLimit(userName);
    return { success: true, newLimit };
  } catch (e: any) {
    return { success: false, newLimit: 50, error: e.message };
  }
}

// ⭐ 즐겨찾기 여부 확인
export async function isQuestionBookmarked(userName: string, sentence: string): Promise<boolean> {
  try {
    const qQuery = query(
      collection(db, 'bookmarks'),
      where('userName', '==', userName),
      where('sentence', '==', sentence)
    );
    const snap = await getDocs(qQuery);
    return !snap.empty;
  } catch (e) {
    return false;
  }
}

// 🔤 모든 형태의 빈칸 감지 정규식 (언더스코어, [blank], [Blank], (blank), <blank>, [빈칸], 단독 blank 단어 등)
export const BLANK_PATTERN = /(?:_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)|<\s*blank\s*>|\[\s*빈칸\s*\]|\(\s*빈칸\s*\)|\[\s*_{1,}\s*\]|\(\s*_{1,}\s*\)|\bblank\b|\bBlank\b|\bBLANK\b|[\(\[]\s*[\w\s\-']+(?:\s*\/\s*[\w\s\-']+)+\s*[\)\]])/gi;

// 🔤 빈칸 표기 표준화 헬퍼 (모든 비정형 빈칸 및 (is / are) 구문을 ______ 로 통일)
export function normalizeSentenceBlank(sentence: string, answerText?: string): string {
  if (!sentence || typeof sentence !== 'string') return '';
  let s = sentence.replace(BLANK_PATTERN, '______');

  // 만약 여전히 빈칸이 없는 경우, 정답 단어가 문장에 온전하게 들어가 있다면 정답 단어 자리를 ______ 로 치환
  if (!s.includes('______') && answerText && typeof answerText === 'string') {
    const trimmedAns = answerText.trim();
    if (trimmedAns && trimmedAns.length >= 2) {
      const escaped = trimmedAns.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      s = s.replace(new RegExp(`\\b${escaped}\\b`, 'i'), '______');
    }
  }

  return s;
}

// 🔤 문장에 정답을 깔끔하게 채워 넣는 헬퍼 (문제집, 북마크, 오답노트용)
export function fillSentenceAnswer(sentence: string, answer: string): string {
  if (!sentence || typeof sentence !== 'string') return '';
  const cleanAns = (answer || '').trim();
  if (BLANK_PATTERN.test(sentence)) {
    return sentence.replace(BLANK_PATTERN, `[ ${cleanAns} ]`);
  }
  return sentence;
}

// Helper: Firestore 안전 저장을 위한 Question 객체 정제 (정답 일치화 및 undefined 100% 제거)
export function cleanQuestionForStorage(q: any): any {
  const normalized = normalizeAndFixQuestion(q);

  return removeUndefinedDeep({
    id: normalized.id,
    form: normalized.form,
    sentence: normalized.sentence,
    options: shuffleOptions(normalized.options),
    answer: normalized.answer,
    translation: normalized.translation,
    explanation: normalized.explanation,
    components: Array.isArray(normalized.components)
      ? normalized.components.map((c: any) => ({
          chunk: c?.chunk || '',
          role: c?.role || '수식어',
          meaning: c?.meaning || ''
        }))
      : [],
    difficulty: q?.difficulty || normalized.difficulty || q?.level || normalized.level || 'Level 1 (입문/초급)',
    level: q?.level || normalized.level || q?.difficulty || normalized.difficulty || 'Level 1 (입문/초급)'
  });
}

// ⭐ 즐겨찾기 토글 (추가/삭제 - Firestore + 로컬 100% 동기화)
export async function toggleBookmark(userName: string, question: Question): Promise<{ bookmarked: boolean; limitExceeded?: boolean; error?: string }> {
  try {
    const cleanedQ = cleanQuestionForStorage(question);
    const targetSentence = (cleanedQ.sentence || '').trim();
    const storageKey = `ai_grammar_bookmarks_${userName}`;

    // 1. Get Local list
    let localList: BookmarkItem[] = [];
    try {
      localList = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {}

    const localIndex = localList.findIndex(b => (b.sentence || b.question?.sentence || '').trim() === targetSentence);

    // 2. Check Firestore
    const bCol = collection(db, 'bookmarks');
    let isAlreadyBookmarked = localIndex !== -1;
    let existingDocId: string | null = null;

    try {
      const qQuery = query(bCol, where('userName', '==', userName), where('sentence', '==', targetSentence));
      const snap = await getDocs(qQuery);
      if (!snap.empty) {
        isAlreadyBookmarked = true;
        existingDocId = snap.docs[0].id;
      }
    } catch (err) {
      console.warn("Firestore bookmark query warning:", err);
    }

    if (isAlreadyBookmarked) {
      // 🗑️ Remove from bookmark
      if (localIndex !== -1) {
        localList.splice(localIndex, 1);
        localStorage.setItem(storageKey, JSON.stringify(localList));
      }

      if (existingDocId) {
        try {
          await deleteDoc(doc(db, 'bookmarks', existingDocId));
        } catch {}
      }

      return { bookmarked: false };
    } else {
      // ➕ Add to bookmark
      const limit = await getBookmarkLimit(userName);
      if (localList.length >= limit) {
        return { 
          bookmarked: false, 
          limitExceeded: true, 
          error: `즐겨찾기 보관함 용량(${limit}개)이 꽉 찼습니다! 100 코인으로 50칸을 확장해 보세요.` 
        };
      }

      const now = Date.now();
      const dt = new Date();
      const dateStr = `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

      const newBookmarkItem: BookmarkItem = {
        id: `bm_${now}_${Math.random().toString(36).slice(2, 7)}`,
        userName,
        sentence: targetSentence,
        question: cleanedQ,
        createdAt: now,
        dateStr
      };

      // Save locally
      localList.unshift(newBookmarkItem);
      localStorage.setItem(storageKey, JSON.stringify(localList));

      // Save to Firestore
      try {
        const newRef = doc(bCol);
        newBookmarkItem.id = newRef.id;
        await setDoc(newRef, removeUndefinedDeep({
          userName,
          sentence: targetSentence,
          question: cleanedQ,
          createdAt: serverTimestamp()
        }));
      } catch (err) {
        console.warn("Firestore bookmark save fallback to local:", err);
      }

      return { bookmarked: true };
    }
  } catch (e: any) {
    console.error("toggleBookmark Error:", e);
    return { bookmarked: false, error: e.message };
  }
}

// ⭐ 내 즐겨찾기 목록 조회
export async function getBookmarks(userName: string): Promise<BookmarkItem[]> {
  const storageKey = `ai_grammar_bookmarks_${userName}`;
  let localList: BookmarkItem[] = [];
  try {
    localList = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch {}

  try {
    const qQuery = query(collection(db, 'bookmarks'), where('userName', '==', userName));
    const snap = await getDocs(qQuery);
    const firestoreList: BookmarkItem[] = [];

    snap.forEach(d => {
      const data = d.data();
      let dateStr = "방금";
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        const dt = data.createdAt.toDate();
        dateStr = `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      } else if (data.createdAt) {
        dateStr = "최근";
      }

      firestoreList.push({
        id: d.id,
        userName: data.userName,
        sentence: data.sentence || data.question?.sentence || "",
        question: data.question,
        createdAt: data.createdAt,
        dateStr
      });
    });

    if (firestoreList.length > 0) {
      // Merge unique by sentence
      const mergedMap = new Map<string, BookmarkItem>();
      localList.forEach(item => mergedMap.set(item.sentence.trim(), item));
      firestoreList.forEach(item => mergedMap.set(item.sentence.trim(), item));
      const combined = Array.from(mergedMap.values()).reverse();
      localStorage.setItem(storageKey, JSON.stringify(combined));
      return combined;
    }

    return localList;
  } catch (e) {
    console.warn("getBookmarks Firestore error, returning local:", e);
    return localList;
  }
}

// 🎟️ 해당 사이클 응시 여부 및 도전 횟수 확인 (최대 2회: 1회 무료 + 1회 50코인 재도전)
export async function hasUserCompletedCycle(
  cycleId: string, 
  userName: string
): Promise<{ completed: boolean; score?: number; attempts: number; canRetry: boolean }> {
  try {
    const rankDocId = `${cycleId}_${userName}`;
    const rankRef = doc(db, 'cycle_rankings', rankDocId);
    const snap = await getDoc(rankRef);
    if (snap.exists()) {
      const data = snap.data();
      const attempts = typeof data.attempts === 'number' ? data.attempts : 1;
      const isAdmin = checkIsAdmin({ name: userName });
      return { 
        completed: true, 
        score: data.score || 0, 
        attempts, 
        canRetry: isAdmin || attempts < 2 
      };
    }
    return { completed: false, attempts: 0, canRetry: true };
  } catch (e) {
    console.error("hasUserCompletedCycle error:", e);
    return { completed: false, attempts: 0, canRetry: true };
  }
}

// 🎟️ 랭킹전 도전 시작 시도 횟수 즉시 차감 및 기록 (중도 이탈 시 악용 방지)
export async function recordCycleAttemptStart(
  cycleId: string, 
  userName: string, 
  avatarId?: string
): Promise<{ success: boolean; attemptNumber: number }> {
  try {
    const rankDocId = `${cycleId}_${userName}`;
    const rankRef = doc(db, 'cycle_rankings', rankDocId);
    const snap = await getDoc(rankRef);
    const resolvedAvatarId = avatarId || 'lion';

    let currentAttempts = 0;
    let prevScore = 0;
    if (snap.exists()) {
      const data = snap.data();
      currentAttempts = typeof data.attempts === 'number' ? data.attempts : 1;
      prevScore = data.score || 0;
    }

    const nextAttempts = currentAttempts + 1;
    await setDoc(rankRef, removeUndefinedDeep({
      cycleId,
      name: userName,
      score: prevScore,
      attempts: nextAttempts,
      avatarId: resolvedAvatarId,
      status: 'in_progress',
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), { merge: true });

    return { success: true, attemptNumber: nextAttempts };
  } catch (e) {
    console.error("recordCycleAttemptStart error:", e);
    return { success: false, attemptNumber: 1 };
  }
}

// 2. 공용 DB (Questions) 문제 저장
export async function saveQuestionsToFirestore(questions: Question[], difficulty: string): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    const questionsCol = collection(db, 'questions');

    for (const q of questions) {
      const newDocRef = doc(questionsCol);
      const cleaned = cleanQuestionForStorage({ ...q, difficulty });
      batch.set(newDocRef, {
        ...cleaned,
        difficulty: difficulty || 'Level 1',
        createdAt: serverTimestamp()
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("saveQuestionsToFirestore Error:", error);
    throw error;
  }
}

// 3. 공용 DB에서 난이도별 10문제 추출 (엄격한 난이도 & 길이 필터링 + 부족 시 AI 실시간 자동 생성 보충)
export async function getRandomQuestions(difficultyLabel: string): Promise<{ success: boolean; data?: Question[]; error?: string }> {
  try {
    const targetLvl = difficultyLabel.includes('Level 4') || difficultyLabel.includes('4단계') || difficultyLabel.includes('실전') || difficultyLabel.includes('Mastery') ? 4
      : difficultyLabel.includes('Level 3') || difficultyLabel.includes('3단계') || difficultyLabel.includes('고득점') || difficultyLabel.includes('Advanced') ? 3
      : difficultyLabel.includes('Level 2') || difficultyLabel.includes('2단계') || difficultyLabel.includes('중급') || difficultyLabel.includes('Intermediate') ? 2
      : 1;

    const snapshot = await getDocs(collection(db, 'questions'));
    const allQuestions: Question[] = [];

    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const dDiff = String(d.difficulty || d.level || '');
        const docLvl = dDiff.includes('Level 4') || dDiff.includes('4단계') || dDiff.includes('실전') || dDiff.includes('Mastery') ? 4
          : dDiff.includes('Level 3') || dDiff.includes('3단계') || dDiff.includes('고득점') || dDiff.includes('Advanced') ? 3
          : dDiff.includes('Level 2') || dDiff.includes('2단계') || dDiff.includes('중급') || dDiff.includes('Intermediate') ? 2
          : dDiff.includes('Level 1') || dDiff.includes('1단계') || dDiff.includes('초급') || dDiff.includes('Beginner') ? 1
          : 1;

        if (docLvl !== targetLvl) return;

        // 🛡️ 문장 단어 수 기반 엄격한 품질/난이도 필터링 (과거 잘못 생성된 단문 유입 원천 차단)
        const wordCount = (d.sentence || '').trim().split(/\s+/).length;
        if (targetLvl === 4 && wordCount < 15) return; // Level 4는 15단어 이상 실전 토익/공무원급
        if (targetLvl === 3 && wordCount < 13) return; // Level 3는 13단어 이상 수능 복문급
        if (targetLvl === 1 && wordCount > 13) return; // Level 1은 13단어 이하 기초 단문

        allQuestions.push({
          id: docSnap.id,
          form: sanitizeForm(d.form),
          sentence: d.sentence,
          options: shuffleOptions(d.options || []),
          answer: d.answer,
          translation: d.translation,
          explanation: d.explanation,
          components: d.components,
          difficulty: d.difficulty
        });
      });
    }

    // 🚀 DB에 유효한 고품질 문제가 10개 미만인 경우: Gemini AI를 실시간 호출하여 정확한 난이도의 10문제를 즉시 생성
    if (allQuestions.length < 10) {
      console.log(`[getRandomQuestions]: DB contains ${allQuestions.length} valid questions for [${difficultyLabel}]. Calling Gemini AI for 10 fresh questions...`);
      try {
        const aiResult = await generateBulkQuestions(difficultyLabel, '', 10);
        if (aiResult.success && aiResult.questions && aiResult.questions.length >= 5) {
          // 백그라운드로 공용 DB에도 저장하여 누적
          saveQuestionsToFirestore(aiResult.questions, difficultyLabel).catch(() => {});
          return { success: true, data: aiResult.questions.slice(0, 10) };
        }
      } catch (e) {
        console.warn("Auto AI question generation fallback failed:", e);
      }
    }

    if (allQuestions.length === 0) {
      return { success: false, error: `선택하신 [${difficultyLabel}] 난이도의 유효한 문제가 부족합니다. [문제 공장]에서 새 문제를 생성해 주세요.` };
    }

    // 🎯 1~5형식 문형별 고른 분배 알고리즘 (각 문형당 2문제씩 균등 추출)
    const formBuckets: Record<number, Question[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    allQuestions.forEach(q => {
      const f = sanitizeForm(q.form);
      if (formBuckets[f]) {
        formBuckets[f].push(q);
      } else {
        formBuckets[1].push(q);
      }
    });

    // 각 문형 버킷 셔플
    for (let f = 1; f <= 5; f++) {
      formBuckets[f].sort(() => Math.random() - 0.5);
    }

    const selected: Question[] = [];
    // 1차: 1~5형식에서 각 2문제씩 균등 추출 (5 x 2 = 10문제)
    for (let f = 1; f <= 5; f++) {
      const picked = formBuckets[f].splice(0, 2);
      selected.push(...picked);
    }

    // 특정 형식의 문제가 부족하여 10문제가 채워지지 않은 경우 남은 문제에서 보충
    if (selected.length < 10) {
      const remaining: Question[] = [];
      for (let f = 1; f <= 5; f++) {
        remaining.push(...formBuckets[f]);
      }
      remaining.sort(() => Math.random() - 0.5);
      const needed = 10 - selected.length;
      selected.push(...remaining.slice(0, needed));
    }

    // 최종 10문제의 출제 순서를 랜덤하게 섞어 실제 시험처럼 다채롭게 구성
    selected.sort(() => Math.random() - 0.5);
    return { success: true, data: selected };
  } catch (error: any) {
    console.error("getRandomQuestions Error:", error);
    return { success: false, error: error.message || "문제를 불러오지 못했습니다." };
  }
}

// 4. 개인 맞춤 약점 문제 저장
export async function savePersonalQuestionsToFirestore(userName: string, questions: Question[], difficulty: string): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    const personalCol = collection(db, 'personal_questions');

    for (const q of questions) {
      const newDocRef = doc(personalCol);
      const cleaned = cleanQuestionForStorage({ ...q, difficulty });
      batch.set(newDocRef, {
        ...cleaned,
        userName,
        difficulty: difficulty || 'Level 1',
        createdAt: serverTimestamp()
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("savePersonalQuestionsToFirestore Error:", error);
    throw error;
  }
}

// 5. 개인 맞춤 약점 문제 10문제 추출 (1~5형식 고른 분배 적용)
export async function getRandomPersonalQuestions(userName: string, difficultyLabel: string): Promise<{ success: boolean; data?: Question[]; error?: string }> {
  try {
    const qQuery = query(
      collection(db, 'personal_questions'),
      where('userName', '==', userName)
    );
    const snapshot = await getDocs(qQuery);

    if (snapshot.empty) {
      return { success: false, error: "저장된 나만의 약점 문제가 없습니다. [약점 분석/처방]에서 먼저 문제를 생성해주세요." };
    }

    const allQuestions: Question[] = [];
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const matches = 
        d.difficulty === difficultyLabel ||
        (difficultyLabel.includes('Level 1') && (d.difficulty?.includes('Level 1') || d.difficulty?.includes('초급'))) ||
        (difficultyLabel.includes('Level 2') && (d.difficulty?.includes('Level 2') || d.difficulty?.includes('중급'))) ||
        (difficultyLabel.includes('Level 3') && (d.difficulty?.includes('Level 3') || d.difficulty?.includes('고득점'))) ||
        (difficultyLabel.includes('Level 4') && (d.difficulty?.includes('Level 4') || d.difficulty?.includes('실전')));

      if (matches) {
        allQuestions.push({
          id: docSnap.id,
          form: sanitizeForm(d.form),
          sentence: d.sentence,
          options: [...(d.options || [])].sort(() => Math.random() - 0.5),
          answer: d.answer,
          translation: d.translation,
          explanation: d.explanation,
          components: d.components
        });
      }
    });

    if (allQuestions.length === 0) {
      return { success: false, error: `선택하신 [${difficultyLabel}] 난이도에 저장된 나만의 약점 문제가 없습니다. [약점 분석/처방]에서 먼저 생성해주세요.` };
    }

    // 🎯 1~5형식 균등 분배
    const formBuckets: Record<number, Question[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    allQuestions.forEach(q => {
      const f = sanitizeForm(q.form);
      if (formBuckets[f]) {
        formBuckets[f].push(q);
      } else {
        formBuckets[1].push(q);
      }
    });

    for (let f = 1; f <= 5; f++) {
      formBuckets[f].sort(() => Math.random() - 0.5);
    }

    const selected: Question[] = [];
    for (let f = 1; f <= 5; f++) {
      const picked = formBuckets[f].splice(0, 2);
      selected.push(...picked);
    }

    if (selected.length < 10) {
      const remaining: Question[] = [];
      for (let f = 1; f <= 5; f++) {
        remaining.push(...formBuckets[f]);
      }
      remaining.sort(() => Math.random() - 0.5);
      const needed = 10 - selected.length;
      selected.push(...remaining.slice(0, needed));
    }

    selected.sort(() => Math.random() - 0.5);
    return { success: true, data: selected };
  } catch (error: any) {
    console.error("getRandomPersonalQuestions Error:", error);
    return { success: false, error: error.message || "약점 문제를 불러오지 못했습니다." };
  }
}

// 6. 🔥 3사이클 고정 랭킹전 문제 조회 및 AI 자동 10문제 생성 (Level 1: 2문제, Level 2: 3문제, Level 3: 3문제, Level 4: 2문제)
export async function getOrCreateCycleQuestions(cycleInfo: CycleInfo): Promise<{ success: boolean; data?: Question[]; error?: string }> {
  try {
    const cycleRef = doc(db, 'cycle_challenges', cycleInfo.cycleId);
    const cycleSnap = await getDoc(cycleRef);

    if (cycleSnap.exists()) {
      const rawList = cycleSnap.data().questions || [];
      const qList = rawList.map((q: any) => normalizeAndFixQuestion(q));
      if (qList.length >= 10) {
        // 🛡️ 기존 DB에 저장된 문제 중 answer가 인덱스 번호이거나 문장에 (is / are) 등 보기가 그대로 노출되어 있던 경우 즉시 백그라운드 자동 치유 & Firestore 동기화
        const needsHealing = rawList.some((q: any) => {
          const ans = String(q?.answer || '').trim();
          const sent = String(q?.sentence || '').trim();
          const isNumAnswer = /^[(\[]?([1-4A-Da-d])[)\]번]?$/.test(ans);
          const hasChoiceInSentence = /[\(\[]\s*[\w\s\-']+(?:\s*\/\s*[\w\s\-']+)+\s*[\)\]]/i.test(sent);
          const lacksBlank = !sent.includes('______');
          return isNumAnswer || hasChoiceInSentence || lacksBlank;
        });

        if (needsHealing) {
          setDoc(cycleRef, { questions: qList }, { merge: true }).catch(() => {});
        }
        return { success: true, data: qList };
      }
    }

    // 🚀 새로운 회차가 시작되었을 때: Gemini AI를 호출하여 2, 3, 3, 2 난이도별 10문제를 전용 생성
    let selected10: Question[] = [];
    const genRes = await generateRankingCycleQuestions(cycleInfo.cycleId, cycleInfo.cycleName);

    if (genRes.success && genRes.questions && genRes.questions.length >= 10) {
      selected10 = genRes.questions.map(q => cleanQuestionForStorage(q));
    } else {
      // AI 호출 실패 시 기존 DB의 문제에서 난이도별/랜덤으로 폴백 구성
      const snapshot = await getDocs(collection(db, 'questions'));
      if (snapshot.size >= 10) {
        const allQuestions: Question[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          allQuestions.push({
            id: docSnap.id,
            form: sanitizeForm(d.form),
            sentence: d.sentence,
            options: [...(d.options || [])],
            answer: d.answer,
            translation: d.translation,
            explanation: d.explanation,
            components: d.components
          });
        });
        allQuestions.sort(() => Math.random() - 0.5);
        selected10 = allQuestions.slice(0, 10).map(q => cleanQuestionForStorage(q));
      } else {
        return { 
          success: false, 
          error: genRes.error || "랭킹전 전용 문제를 생성하지 못했습니다. 잠시 후 다시 시도해주세요." 
        };
      }
    }

    // 1) 랭킹전 전용 회차 문서(cycle_challenges)에 저장
    const cyclePayload = removeUndefinedDeep({
      cycleId: cycleInfo.cycleId,
      cycleName: cycleInfo.cycleName,
      questions: selected10,
      createdAt: serverTimestamp()
    });
    await setDoc(cycleRef, cyclePayload);

    // 2) 생성된 문제들을 난이도별로 공용 DB(questions 컬렉션)에도 영구 보관 (Level 1: 2문제, Level 2: 3문제, Level 3: 3문제, Level 4: 2문제)
    try {
      const byLevel: Record<string, Question[]> = {
        'Level 1 (입문/초급)': [],
        'Level 2 (실력 중급)': [],
        'Level 3 (고득점 도약)': [],
        'Level 4 (실전 마스터)': []
      };

      selected10.forEach((q, idx) => {
        const lvl = idx < 2 
          ? 'Level 1 (입문/초급)' 
          : idx < 5 
          ? 'Level 2 (실력 중급)' 
          : idx < 8 
          ? 'Level 3 (고득점 도약)' 
          : 'Level 4 (실전 마스터)';
        byLevel[lvl].push(q);
      });

      for (const [lvlKey, qList] of Object.entries(byLevel)) {
        if (qList.length > 0) {
          await saveQuestionsToFirestore(qList, lvlKey);
        }
      }
    } catch (saveErr) {
      console.warn("Auto-saving cycle questions to questions collection failed:", saveErr);
    }

    return { success: true, data: selected10 };
  } catch (error: any) {
    console.error("getOrCreateCycleQuestions Error:", error);
    return { success: false, error: error.message || "랭킹전 문제를 준비하지 못했습니다." };
  }
}

// 7. 오답 저장
export async function saveIncorrectQuestion(userName: string, qData: Question, wrongAnswer: string, difficulty?: string): Promise<boolean> {
  try {
    const cleanPayload = removeUndefinedDeep({
      userName,
      difficulty: difficulty || '일일 랭킹전',
      form: sanitizeForm(qData?.form),
      sentence: qData?.sentence || '',
      wrongAnswer: wrongAnswer || '',
      correctAnswer: qData?.answer || '',
      createdAt: serverTimestamp()
    });

    await addDoc(collection(db, 'weaknesses'), cleanPayload);
    return true;
  } catch (error) {
    console.error("saveIncorrectQuestion Error:", error);
    return false;
  }
}

// 8. 약점 분석 데이터 가져오기
export async function getWeaknessAnalysis(userName: string): Promise<WeaknessAnalysis> {
  try {
    const qQuery = query(collection(db, 'weaknesses'), where('userName', '==', userName));
    const snapshot = await getDocs(qQuery);

    let total = 0;
    const forms: Record<number, number> = {};

    snapshot.forEach(docSnap => {
      total++;
      const form = sanitizeForm(docSnap.data().form);
      forms[form] = (forms[form] || 0) + 1;
    });

    return { total, forms };
  } catch (error) {
    console.error("getWeaknessAnalysis Error:", error);
    return { total: 0, forms: {} };
  }
}

// 9. 내 오답 노트 불러오기
export async function getUserIncorrectQuestions(userName: string): Promise<WeaknessRecord[]> {
  try {
    const qQuery = query(collection(db, 'weaknesses'), where('userName', '==', userName));
    const snapshot = await getDocs(qQuery);

    const list: WeaknessRecord[] = [];
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      let dateStr = "방금";
      if (d.createdAt && typeof d.createdAt.toDate === 'function') {
        const dt = d.createdAt.toDate();
        dateStr = `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      }
      list.push({
        id: docSnap.id,
        userName: d.userName,
        difficulty: d.difficulty,
        form: sanitizeForm(d.form),
        sentence: d.sentence,
        wrongAnswer: d.wrongAnswer,
        correctAnswer: d.correctAnswer,
        createdAt: d.createdAt,
        date: dateStr
      });
    });

    return list.reverse();
  } catch (error) {
    console.error("getUserIncorrectQuestions Error:", error);
    return [];
  }
}

// 10. 🔥 3사이클 랭킹 저장 및 정렬 (장착된 아바타 프로필 연동)
export async function saveAndGetCycleRankings(
  cycleId: string, 
  userName: string, 
  score: number,
  avatarId?: string
): Promise<RankingItem[]> {
  try {
    const rankDocId = `${cycleId}_${userName}`;
    const rankRef = doc(db, 'cycle_rankings', rankDocId);

    const existingSnap = await getDoc(rankRef);
    const resolvedAvatarId = avatarId || 'lion';

    if (existingSnap.exists()) {
      const data = existingSnap.data();
      const currentScore = data.score || 0;
      const currentAttempts = typeof data.attempts === 'number' ? data.attempts : 1;
      const newAttempts = currentAttempts + 1;

      if (score >= currentScore) {
        await setDoc(rankRef, removeUndefinedDeep({
          cycleId,
          name: userName,
          score,
          attempts: newAttempts,
          avatarId: resolvedAvatarId,
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }), { merge: true });
      } else {
        await setDoc(rankRef, {
          attempts: newAttempts,
          avatarId: resolvedAvatarId,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } else {
      await setDoc(rankRef, removeUndefinedDeep({
        cycleId,
        name: userName,
        score,
        attempts: 1,
        avatarId: resolvedAvatarId,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }), { merge: true });
    }

    return await getCycleRankings(cycleId);
  } catch (error) {
    console.error("saveAndGetCycleRankings Error:", error);
    return await getCycleRankings(cycleId);
  }
}

// 11. 특정 사이클 랭킹 불러오기 (실시간 유저 최신 아바타/프로필 100% 실시간 동기화)
export async function getCycleRankings(cycleId: string): Promise<RankingItem[]> {
  try {
    const qQuery = query(collection(db, 'cycle_rankings'), where('cycleId', '==', cycleId));
    const snapshot = await getDocs(qQuery);

    if (snapshot.empty) return [];

    // 🔄 유저들의 최신 장착 아바타 실시간 조회를 위한 유저 문서 병렬 페칭
    const rawDocs = snapshot.docs.map(docSnap => docSnap.data());
    const uniqueUserNames = Array.from(new Set(rawDocs.map(d => d.name).filter(Boolean)));

    const userProfileMap = new Map<string, { currentAvatarId?: string; avatar?: string }>();
    await Promise.all(
      uniqueUserNames.map(async (userName) => {
        try {
          const uSnap = await getDoc(doc(db, 'users', userName));
          if (uSnap.exists()) {
            const uData = uSnap.data();
            userProfileMap.set(userName, {
              currentAvatarId: uData.currentAvatarId,
              avatar: uData.avatar
            });
          }
        } catch (e) {
          // fallback quietly
        }
      })
    );

    const list: RankingItem[] = [];
    rawDocs.forEach(d => {
      let completedAtFormatted = "--:--:--";
      let timeVal = 9999999999999;

      if (d.completedAt && typeof d.completedAt.toDate === 'function') {
        const dt = d.completedAt.toDate();
        timeVal = dt.getTime();
        completedAtFormatted = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:${String(dt.getSeconds()).padStart(2, '0')}`;
      } else if (d.updatedAt && typeof d.updatedAt.toDate === 'function') {
        const dt = d.updatedAt.toDate();
        timeVal = dt.getTime();
        completedAtFormatted = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}:${String(dt.getSeconds()).padStart(2, '0')}`;
      }

      // 👑 실시간 프로필 우선 조회 (가챠에서 뽑아 갈아끼운 최신 아바타 즉시 반영)
      const liveUserProf = userProfileMap.get(d.name);
      const avId = liveUserProf?.currentAvatarId || d.avatarId || 'lion';
      const avObj = AVATAR_DATABASE.find(a => a.id === avId);

      list.push({
        name: d.name,
        score: Number(d.score) || 0,
        completedAt: timeVal,
        completedAtFormatted,
        avatarId: avId,
        avatarIcon: liveUserProf?.avatar || avObj?.icon || '🦁',
        avatarName: avObj?.name || '라이언',
        avatarGrade: avObj?.grade || 'starter',
        avatarBgGradient: avObj?.bgGradient || 'from-slate-700 to-slate-800 border-slate-600',
        avatarColor: avObj?.color || 'text-slate-200'
      });
    });

    list.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (a.completedAt || 0) - (b.completedAt || 0);
    });

    return list;
  } catch (error) {
    console.error("getCycleRankings Error:", error);
    return [];
  }
}

// 🏷️ 난이도 라벨 4종 공식 표준화 헬퍼
export function normalizeDifficultyLabel(diff: string = ''): string {
  const d = String(diff || '').trim();
  if (d.includes('Level 4') || d.includes('4단계') || d.includes('실전') || d.includes('마스터') || d.includes('Mastery') || d.includes('토익')) {
    return 'Level 4 (실전 마스터)';
  }
  if (d.includes('Level 3') || d.includes('3단계') || d.includes('고득점') || d.includes('도약') || d.includes('고3') || d.includes('Advanced') || d.includes('수능')) {
    return 'Level 3 (고득점 도약)';
  }
  if (d.includes('Level 2') || d.includes('2단계') || d.includes('중급') || d.includes('실력') || d.includes('Intermediate')) {
    return 'Level 2 (실력 중급)';
  }
  if (d.includes('Level 1') || d.includes('1단계') || d.includes('초급') || d.includes('입문') || d.includes('Beginner')) {
    return 'Level 1 (입문/초급)';
  }
  return 'Level 1 (입문/초급)';
}

// 12. 전체 공용 DB 목록 (공식 4개 난이도로 자동 정렬/통합)
export async function getAllSavedQuestions(): Promise<Record<string, Question[]>> {
  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    const grouped: Record<string, Question[]> = {
      'Level 1 (입문/초급)': [],
      'Level 2 (실력 중급)': [],
      'Level 3 (고득점 도약)': [],
      'Level 4 (실전 마스터)': []
    };

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const normDiff = normalizeDifficultyLabel(d.difficulty);
      if (!grouped[normDiff]) grouped[normDiff] = [];

      let dateStr = "";
      if (d.createdAt && typeof d.createdAt.toDate === 'function') {
        const dt = d.createdAt.toDate();
        dateStr = `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      }

      const cleanSentence = normalizeSentenceBlank(d.sentence, d.answer);
      if (d.sentence !== cleanSentence) {
        updateDoc(docSnap.ref, { sentence: cleanSentence }).catch(() => {});
      }

      grouped[normDiff].push({
        id: docSnap.id,
        form: sanitizeForm(d.form),
        sentence: cleanSentence,
        options: d.options,
        answer: d.answer,
        translation: d.translation,
        explanation: d.explanation,
        difficulty: normDiff,
        createdAt: dateStr
      });
    });

    // 비어있지 않은 카테고리만 깔끔하게 반환
    const cleaned: Record<string, Question[]> = {};
    const LEVEL_ORDER = [
      'Level 1 (입문/초급)',
      'Level 2 (실력 중급)',
      'Level 3 (고득점 도약)',
      'Level 4 (실전 마스터)'
    ];

    for (const key of LEVEL_ORDER) {
      if (grouped[key] && grouped[key].length > 0) {
        cleaned[key] = grouped[key];
      }
    }

    return cleaned;
  } catch (error) {
    console.error("getAllSavedQuestions Error:", error);
    return {};
  }
}

// 12-1. ⚡ 실시간 공용 DB 문제 구독 (누군가 문제를 생성/수정/삭제했을 때 0초 즉각 동기화)
export function subscribeToPublicQuestions(
  callback: (grouped: Record<string, Question[]>, totalCount: number) => void
): () => void {
  try {
    const qRef = collection(db, 'questions');
    const unsubscribe = onSnapshot(qRef, (snapshot) => {
      const grouped: Record<string, Question[]> = {
        'Level 1 (입문/초급)': [],
        'Level 2 (실력 중급)': [],
        'Level 3 (고득점 도약)': [],
        'Level 4 (실전 마스터)': []
      };

      let count = 0;
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const normDiff = normalizeDifficultyLabel(d.difficulty);
        if (!grouped[normDiff]) grouped[normDiff] = [];

        let dateStr = "";
        if (d.createdAt && typeof d.createdAt.toDate === 'function') {
          const dt = d.createdAt.toDate();
          dateStr = `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
        }

        const cleanSentence = normalizeSentenceBlank(d.sentence, d.answer);

        grouped[normDiff].push({
          id: docSnap.id,
          form: sanitizeForm(d.form),
          sentence: cleanSentence,
          options: d.options,
          answer: d.answer,
          translation: d.translation,
          explanation: d.explanation,
          difficulty: normDiff,
          createdAt: dateStr
        });
        count++;
      });

      const cleaned: Record<string, Question[]> = {};
      const LEVEL_ORDER = [
        'Level 1 (입문/초급)',
        'Level 2 (실력 중급)',
        'Level 3 (고득점 도약)',
        'Level 4 (실전 마스터)'
      ];

      for (const key of LEVEL_ORDER) {
        if (grouped[key] && grouped[key].length > 0) {
          cleaned[key] = grouped[key];
        }
      }

      callback(cleaned, count);
    }, (error) => {
      console.warn("subscribeToPublicQuestions Error:", error);
    });

    return unsubscribe;
  } catch (err) {
    console.warn("subscribeToPublicQuestions failed to attach listener:", err);
    return () => {};
  }
}

// 📊 12-1. 난이도별 저장된 문제 수 집계
export async function getQuestionCountsByLevel(): Promise<Record<string, number>> {
  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    const counts: Record<string, number> = {
      'Level 1': 0,
      'Level 2': 0,
      'Level 3': 0,
      'Level 4': 0,
    };

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const diff = d.difficulty || '';
      if (diff.includes('Level 1') || diff.includes('초급')) counts['Level 1']++;
      else if (diff.includes('Level 2') || diff.includes('중급')) counts['Level 2']++;
      else if (diff.includes('Level 3') || diff.includes('고득점')) counts['Level 3']++;
      else if (diff.includes('Level 4') || diff.includes('실전')) counts['Level 4']++;
    });

    return counts;
  } catch (e) {
    return { 'Level 1': 15, 'Level 2': 15, 'Level 3': 19, 'Level 4': 16 };
  }
}

// 📊 12-2. 특정 난이도의 1~5형식별 문제 수 현황 집계 및 부족한 형식 분석
export async function getQuestionFormStatsByLevel(difficultyLabel: string): Promise<{
  countsByForm: Record<number, number>;
  total: number;
  underrepresentedForms: number[];
}> {
  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    const countsByForm: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const diff = d.difficulty || '';
      const matches = 
        diff === difficultyLabel ||
        (difficultyLabel.includes('Level 1') && (diff.includes('Level 1') || diff.includes('초급'))) ||
        (difficultyLabel.includes('Level 2') && (diff.includes('Level 2') || diff.includes('중급'))) ||
        (difficultyLabel.includes('Level 3') && (diff.includes('Level 3') || diff.includes('고득점'))) ||
        (difficultyLabel.includes('Level 4') && (diff.includes('Level 4') || diff.includes('실전')));

      if (matches) {
        const form = sanitizeForm(d.form);
        countsByForm[form] = (countsByForm[form] || 0) + 1;
        total++;
      }
    });

    // 부족한 형식 순위 계산 (오름차순 정렬)
    const sortedForms = [1, 2, 3, 4, 5].sort((a, b) => (countsByForm[a] || 0) - (countsByForm[b] || 0));

    return {
      countsByForm,
      total,
      underrepresentedForms: sortedForms
    };
  } catch (e) {
    console.error("getQuestionFormStatsByLevel error:", e);
    return {
      countsByForm: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      total: 0,
      underrepresentedForms: [1, 2, 3, 4, 5]
    };
  }
}

// 🌟 13. 실전 원어민 표현 테마별 목록 조회
export async function getExpressionsByCategory(category: string): Promise<ExpressionItem[]> {
  try {
    const qQuery = query(collection(db, 'expressions'), where('category', '==', category));
    const snapshot = await getDocs(qQuery);
    const list: ExpressionItem[] = [];

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      list.push({
        id: docSnap.id,
        category: d.category,
        expression: d.expression,
        meaning: d.meaning,
        nuance: d.nuance,
        dialogue: d.dialogue || [],
        similarExpressions: d.similarExpressions || [],
        quizQuestion: d.quizQuestion
      });
    });

    return list;
  } catch (error) {
    console.error("getExpressionsByCategory Error:", error);
    return [];
  }
}

// 🌟 13-1. 실전 원어민 표현 테마별 개수 집계
export async function getExpressionCounts(): Promise<Record<string, number>> {
  try {
    const snapshot = await getDocs(collection(db, 'expressions'));
    const counts: Record<string, number> = {
      daily: 0,
      business: 0,
      travel: 0,
      pattern: 0
    };

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const cat = d.category as string;
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    return counts;
  } catch (e) {
    return { daily: 3, business: 2, travel: 2, pattern: 2 };
  }
}

// 🌟 14. 실전 원어민 표현 저장
export async function saveExpressionsToFirestore(expressions: ExpressionItem[]): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    const col = collection(db, 'expressions');

    for (const exp of expressions) {
      const ref = doc(col);
      batch.set(ref, {
        category: exp.category,
        expression: exp.expression,
        meaning: exp.meaning,
        nuance: exp.nuance,
        dialogue: exp.dialogue || [],
        similarExpressions: exp.similarExpressions || [],
        quizQuestion: exp.quizQuestion || null,
        createdAt: serverTimestamp()
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("saveExpressionsToFirestore Error:", error);
    return false;
  }
}

// ==========================================
// 👑 15. 마스터 관리자 사령탑 (Admin Master System)
// ==========================================

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  rewardCoinsPerQuestion: 3,
  starterCoins: 200,
  gachaCost: 50,
  changeNicknameCost: 30,
  expandBookmarkCost: 100,
  geminiModel: 'gemini-2.5-flash',
  maintenanceMode: false,
  maintenanceNotice: '현재 시스템 점검 및 서버 업그레이드 중입니다. 잠시 후 다시 접속해 주세요.'
};

// 👑 15-1. 관리자 권한 여부 확인 (암호화 해시 검증으로 클라이언트 번들 내 이메일 노출 100% 방지)
export function checkIsAdmin(user: Partial<UserProfile> | null | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  const email = (user.email || '').trim().toLowerCase();
  if (!email) return false;

  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < email.length; i++) {
    const c = email.charCodeAt(i);
    h1 = ((h1 << 5) + h1) ^ c;
    h2 = ((h2 << 5) + h2) ^ c;
  }
  const emailHash = (Math.abs(h1).toString(16) + Math.abs(h2).toString(16)).toLowerCase();
  return emailHash === '37e41c9c3ec28042' || emailHash === '1109cf7d5b13c99f';
}

// ⚙️ 15-2. 전역 시스템 파라미터 / 게임 경제 설정 조회
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const docRef = doc(db, 'system_configs', 'global_settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return {
        ...DEFAULT_SYSTEM_SETTINGS,
        ...snap.data()
      };
    }
  } catch (e) {
    console.warn("getSystemSettings fallback:", e);
  }
  return DEFAULT_SYSTEM_SETTINGS;
}

// ⚙️ 15-3. 전역 시스템 파라미터 / 게임 경제 실시간 업데이트
export async function updateSystemSettings(updates: Partial<SystemSettings>): Promise<boolean> {
  try {
    const docRef = doc(db, 'system_configs', 'global_settings');
    const cleanUpdates = removeUndefinedDeep({
      ...updates,
      updatedAt: serverTimestamp()
    });
    await setDoc(docRef, cleanUpdates, { merge: true });
    return true;
  } catch (e) {
    console.error("updateSystemSettings Error:", e);
    return false;
  }
}

// ⚙️ 15-3-1. 전역 시스템 설정 실시간 리스너 (점검 모드 등 즉시 반응)
export function subscribeToSystemSettings(callback: (settings: SystemSettings) => void): () => void {
  try {
    const docRef = doc(db, 'system_configs', 'global_settings');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback({
          ...DEFAULT_SYSTEM_SETTINGS,
          ...snap.data()
        });
      } else {
        callback(DEFAULT_SYSTEM_SETTINGS);
      }
    }, (error) => {
      console.warn("subscribeToSystemSettings warn:", error);
    });
    return unsubscribe;
  } catch (e) {
    console.warn("subscribeToSystemSettings error:", e);
    return () => {};
  }
}

// ⚡ 15-4. 관리자 갓 모드 (God Mode) 활성화: 코인 999,999 + 전 아바타 24종 올 언락 + 마스터 티어
export async function grantAdminGodMode(userName: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const allAvatarIds = AVATAR_DATABASE.map(a => a.id);
    const godCoins = 999999;
    const godXp = 9999;

    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);

    const updates = removeUndefinedDeep({
      isAdmin: true,
      coins: godCoins,
      xp: godXp,
      tier: 'Master',
      bookmarkLimit: 9999,
      unlockedAvatars: allAvatarIds,
      avatar: '👑',
      currentAvatarId: 'emperor_dragon',
      lastGodModeAt: serverTimestamp()
    });

    if (snap.exists()) {
      await updateDoc(userRef, updates);
    } else {
      await setDoc(userRef, {
        name: userName,
        pin: '777777',
        dailyGoal: 10,
        totalSolved: 100,
        totalCorrect: 100,
        createdAt: serverTimestamp(),
        ...updates
      });
    }

    const updatedSnap = await getDoc(userRef);
    const data = updatedSnap.data() || {};

    const profile: UserProfile = {
      name: data.name || userName,
      pin: data.pin || '777777',
      coins: godCoins,
      bookmarkLimit: 9999,
      avatar: '👑',
      currentAvatarId: 'emperor_dragon',
      unlockedAvatars: allAvatarIds,
      xp: godXp,
      tier: 'Master',
      dailyGoal: data.dailyGoal || 10,
      totalSolved: data.totalSolved || 100,
      totalCorrect: data.totalCorrect || 100,
      email: data.email,
      photoURL: data.photoURL,
      isAdmin: true
    };

    return { success: true, profile };
  } catch (e: any) {
    console.error("grantAdminGodMode Error:", e);
    return { success: false, error: e.message || '갓 모드 적용에 실패했습니다.' };
  }
}

// 📢 15-5. 전체 사용자 또는 개인 타겟 실시간 푸시 공지 발송
export async function sendGlobalAnnouncement(announcement: {
  title: string;
  content: string;
  badgeType: 'event' | 'notice' | 'update' | 'maintenance';
  rewardCoins?: number;
  authorName: string;
  targetUserName?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const col = collection(db, 'system_announcements');
    const newDoc = doc(col);
    const now = Date.now();

    const payload = removeUndefinedDeep({
      id: newDoc.id,
      title: announcement.title.trim(),
      content: announcement.content.trim(),
      badgeType: announcement.badgeType || 'notice',
      rewardCoins: announcement.rewardCoins || 0,
      createdAt: now,
      expiresAt: now + (14 * 24 * 60 * 60 * 1000), // 14일 후 만료
      isActive: true,
      authorName: announcement.authorName || '관리자',
      targetUserName: announcement.targetUserName ? announcement.targetUserName.trim() : null,
      serverTime: serverTimestamp()
    });

    await setDoc(newDoc, payload);
    return { success: true, id: newDoc.id };
  } catch (e: any) {
    console.error("sendGlobalAnnouncement Error:", e);
    return { success: false, error: e.message || '공지 발송 실패' };
  }
}

// 📢 15-6. 활성화된 공지 목록 조회 (userName 전달 시 해당 유저의 개인 공지 + 전체 공지만 필터링)
export async function getActiveAnnouncements(userName?: string): Promise<PushAnnouncement[]> {
  try {
    const col = collection(db, 'system_announcements');
    const q = query(col, where('isActive', '==', true));
    const snap = await getDocs(q);

    const list: PushAnnouncement[] = [];
    snap.forEach(d => {
      const data = d.data();
      const targetUser = data.targetUserName;

      // 특정 유저 필터링 (개인 공지인 경우 본인에게만 노출)
      if (userName && targetUser && targetUser !== userName) {
        return;
      }

      list.push({
        id: d.id,
        title: data.title,
        content: data.content,
        badgeType: data.badgeType || 'notice',
        rewardCoins: data.rewardCoins || 0,
        createdAt: data.createdAt || Date.now(),
        expiresAt: data.expiresAt,
        isActive: data.isActive ?? true,
        authorName: data.authorName || '관리자',
        targetUserName: data.targetUserName || undefined
      });
    });

    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  } catch (e) {
    console.warn("getActiveAnnouncements Error:", e);
    return [];
  }
}

// 🗑️ 15-6-1. 공지 비활성화 / 삭제
export async function deleteAnnouncement(announcementId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'system_announcements', announcementId);
    await updateDoc(docRef, { isActive: false });
    return true;
  } catch (e) {
    console.error("deleteAnnouncement Error:", e);
    return false;
  }
}

// In-memory Mutex Lock for preventing rapid click concurrency exploits
const activeAnnouncementClaimLocks = new Set<string>();

// 🎁 15-7. 공지 확인 및 영구 읽음 처리 (Firestore User 문서 + status 컬렉션 + localStorage 3중 영구 동기화)
export async function markAnnouncementRead(userName: string, announcementId: string): Promise<void> {
  try {
    const claimKey = `seen_announce_${userName}_${announcementId}`;
    localStorage.setItem(claimKey, 'true');

    const statusRef = doc(db, 'announcement_user_status', `${userName}_${announcementId}`);
    const userRef = doc(db, 'users', userName);

    const promises: Promise<any>[] = [
      setDoc(statusRef, {
        userName,
        announcementId,
        isRead: true,
        readAt: serverTimestamp()
      }, { merge: true }),
      setDoc(userRef, {
        readAnnouncements: arrayUnion(announcementId),
        updatedAt: serverTimestamp()
      }, { merge: true })
    ];

    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      promises.push(
        setDoc(doc(db, 'users', auth.currentUser.uid), {
          readAnnouncements: arrayUnion(announcementId),
          updatedAt: serverTimestamp()
        }, { merge: true })
      );
    }

    await Promise.all(promises);
  } catch (e) {
    console.warn("markAnnouncementRead Error:", e);
  }
}

// 🎁 15-8. 공지 첨부 보상 1회 수령 처리 (Firestore 원자적 트랜잭션 + 인메모리 뮤텍스 락)
export async function claimAnnouncementReward(
  userName: string, 
  announcementId: string, 
  coins: number
): Promise<{ success: boolean; alreadyClaimed?: boolean; newCoins?: number; error?: string }> {
  const lockKey = `${userName}_${announcementId}`;

  // 🔒 1단계: 인메모리 초고속 동시성 락 (연타 100% 즉시 원천 차단)
  if (activeAnnouncementClaimLocks.has(lockKey)) {
    return { success: false, alreadyClaimed: true };
  }
  activeAnnouncementClaimLocks.add(lockKey);

  try {
    const claimKey = `claimed_announce_${userName}_${announcementId}`;
    if (localStorage.getItem(claimKey)) {
      activeAnnouncementClaimLocks.delete(lockKey);
      return { success: false, alreadyClaimed: true };
    }

    const userRef = doc(db, 'users', userName);
    const statusRef = doc(db, 'announcement_user_status', `${userName}_${announcementId}`);

    // 🔐 2단계: Firestore 원자적 트랜잭션 (서버 레벨 1회 한정 락)
    const result = await runTransaction(db, async (transaction) => {
      const [userSnap, statusSnap] = await Promise.all([
        transaction.get(userRef),
        transaction.get(statusRef)
      ]);

      const userData = userSnap.exists() ? userSnap.data() : {};
      const statusData = statusSnap.exists() ? statusSnap.data() : {};

      const claimedList: string[] = Array.isArray(userData.claimedAnnouncements) ? userData.claimedAnnouncements : [];

      // 이미 수령했는지 철저히 이중 검사
      if (claimedList.includes(announcementId) || statusData.isClaimed === true) {
        return { success: false, alreadyClaimed: true };
      }

      const currentCoins = userData.coins ?? 200;
      const finalCoins = currentCoins + Math.max(0, coins);

      // 1) 유저 문서 코인 증액 및 claimedAnnouncements 배열 추가
      transaction.set(userRef, {
        coins: finalCoins,
        claimedAnnouncements: arrayUnion(announcementId),
        readAnnouncements: arrayUnion(announcementId),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2) status 문서 수령 완료 마킹
      transaction.set(statusRef, {
        userName,
        announcementId,
        isRead: true,
        isClaimed: true,
        rewardCoins: coins,
        claimedAt: serverTimestamp()
      }, { merge: true });

      return { success: true, newCoins: finalCoins };
    });

    if (result.success) {
      localStorage.setItem(claimKey, 'true');
      localStorage.setItem(`seen_announce_${userName}_${announcementId}`, 'true');

      // Google UID 문서 동기화
      if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
        setDoc(doc(db, 'users', auth.currentUser.uid), {
          coins: result.newCoins,
          claimedAnnouncements: arrayUnion(announcementId),
          readAnnouncements: arrayUnion(announcementId),
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(() => {});
      }
    }

    return result;
  } catch (e: any) {
    console.error("claimAnnouncementReward error:", e);
    return { success: false, error: e.message || "보상 수령 실패" };
  } finally {
    // 락 안전 해제
    setTimeout(() => {
      activeAnnouncementClaimLocks.delete(lockKey);
    }, 1200);
  }
}

// 🎁 15-9. 유저별 공지 읽음/수령 상태 맵 조회 (User 문서 + status 컬렉션 양방향 통합)
export async function getUserAnnouncementStatusMap(userName: string): Promise<Record<string, { isRead: boolean; isClaimed: boolean }>> {
  const result: Record<string, { isRead: boolean; isClaimed: boolean }> = {};
  try {
    const userRef = doc(db, 'users', userName);
    const [userSnap, colSnap] = await Promise.all([
      getDoc(userRef),
      getDocs(query(collection(db, 'announcement_user_status'), where('userName', '==', userName)))
    ]);

    // 1) User 문서에서 claimed & read 목록 반영
    if (userSnap.exists()) {
      const data = userSnap.data();
      const claimed: string[] = Array.isArray(data.claimedAnnouncements) ? data.claimedAnnouncements : [];
      const read: string[] = Array.isArray(data.readAnnouncements) ? data.readAnnouncements : [];

      for (const id of read) {
        result[id] = { isRead: true, isClaimed: false };
      }
      for (const id of claimed) {
        result[id] = { isRead: true, isClaimed: true };
      }
    }

    // 2) announcement_user_status 컬렉션 기록도 병합
    colSnap.forEach(d => {
      const data = d.data();
      if (data.announcementId) {
        result[data.announcementId] = {
          isRead: !!data.isRead || !!result[data.announcementId]?.isRead,
          isClaimed: !!data.isClaimed || !!result[data.announcementId]?.isClaimed
        };
      }
    });
  } catch (e) {
    console.warn("getUserAnnouncementStatusMap error:", e);
  }
  return result;
}

// 👥 15-8. 관리자용 전체 유저 목록 조회 (중복 사용자 완전 병합 및 정렬)
export async function getAllUsersList(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const map = new Map<string, UserProfile>();

    snap.forEach(d => {
      const data = d.data();
      // 🚫 고스트 데이터는 실제 회원 목록에서 100% 제외
      if (data.isGhost) {
        deleteDoc(d.ref).catch(() => {}); // 자동 청소
        return;
      }
      const canonicalName = (data.name || d.id).trim();
      if (!canonicalName) return;

      const userKey = data.email ? `email_${data.email}` : (data.uid ? `uid_${data.uid}` : `name_${canonicalName}`);
      const existing = map.get(userKey) || map.get(`name_${canonicalName}`);

      const coins = Math.max(existing?.coins ?? 0, data.coins ?? 200);
      const xp = Math.max(existing?.xp ?? 0, data.xp ?? 0);
      const bookmarkLimit = Math.max(existing?.bookmarkLimit ?? 50, data.bookmarkLimit ?? 50);
      const totalSolved = Math.max(existing?.totalSolved ?? 0, data.totalSolved ?? 0);
      const totalCorrect = Math.max(existing?.totalCorrect ?? 0, data.totalCorrect || 0);
      const dailyGoal = data.dailyGoal || existing?.dailyGoal || 10;
      const avatar = (data.avatar && data.avatar !== '🦁') ? data.avatar : (existing?.avatar || data.avatar || '🦁');
      const currentAvatarId = (data.currentAvatarId && data.currentAvatarId !== 'lion') ? data.currentAvatarId : (existing?.currentAvatarId || data.currentAvatarId || 'lion');

      const unlockedAvatars = Array.from(new Set([
        ...STARTER_AVATAR_IDS,
        ...(existing?.unlockedAvatars || []),
        ...(Array.isArray(data.unlockedAvatars) ? data.unlockedAvatars : [])
      ]));

      const mergedUser: UserProfile = {
        name: canonicalName,
        pin: data.pin || existing?.pin || '****',
        coins,
        bookmarkLimit,
        avatar,
        currentAvatarId,
        unlockedAvatars,
        xp,
        tier: calculateTier(xp).tier,
        dailyGoal,
        totalSolved,
        totalCorrect,
        email: data.email || existing?.email,
        photoURL: data.photoURL || existing?.photoURL,
        isAdmin: data.isAdmin || existing?.isAdmin,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : existing?.createdAt || (typeof data.createdAt === 'number' ? data.createdAt : undefined)
      };

      map.set(userKey, mergedUser);
      map.set(`name_${canonicalName}`, mergedUser);
    });

    const uniqueUsers = Array.from(new Set(map.values()));
    const finalMap = new Map<string, UserProfile>();
    for (const u of uniqueUsers) {
      finalMap.set(u.name, u);
    }

    return Array.from(finalMap.values()).sort((a, b) => (b.coins || 0) - (a.coins || 0));
  } catch (e) {
    console.error("getAllUsersList Error:", e);
    return [];
  }
}

// 🪙 15-9. 관리자 권한 유저 코인 직접 지급/차감
export async function adminUpdateUserCoins(targetUserName: string, amount: number): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', targetUserName);
    await setDoc(userRef, {
      coins: amount,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error("adminUpdateUserCoins Error:", e);
    return false;
  }
}

// 🏆 15-9-1. 관리자 권한 유저 XP & 티어 직접 설정
export async function adminUpdateUserXp(targetUserName: string, newXp: number): Promise<boolean> {
  try {
    const tier = calculateTier(newXp).tier;
    const updates = { xp: newXp, tier, updatedAt: serverTimestamp() };
    const userRef = doc(db, 'users', targetUserName);
    await setDoc(userRef, updates, { merge: true });
    return true;
  } catch (e) {
    console.error("adminUpdateUserXp error:", e);
    return false;
  }
}

// ⭐ 15-9-2. 관리자 권한 유저 북마크 한도 직접 조정
export async function adminUpdateUserBookmarkLimit(targetUserName: string, newLimit: number): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', targetUserName);
    await setDoc(userRef, { bookmarkLimit: newLimit, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (e) {
    console.error("adminUpdateUserBookmarkLimit error:", e);
    return false;
  }
}

// 🎁 15-9-3. 관리자 권한 유저 특정 아바타 해금 또는 전체 해금
export async function adminUnlockUserAvatar(targetUserName: string, avatarIdOrAll: string | 'ALL'): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', targetUserName);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : {};
    const currentUnlocked: string[] = Array.isArray(data.unlockedAvatars) && data.unlockedAvatars.length > 0 
      ? Array.from(new Set([...STARTER_AVATAR_IDS, ...data.unlockedAvatars]))
      : STARTER_AVATAR_IDS;

    const newUnlocked = avatarIdOrAll === 'ALL'
      ? AVATAR_DATABASE.map(a => a.id)
      : Array.from(new Set([...currentUnlocked, avatarIdOrAll]));

    await setDoc(userRef, { unlockedAvatars: newUnlocked, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (e) {
    console.error("adminUnlockUserAvatar error:", e);
    return false;
  }
}

// 🗑️ 15-9-4. 관리자 권한 유저 계정 강제 삭제
export async function adminDeleteUserDirect(targetUserName: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'users', targetUserName));
    await deleteDoc(doc(db, 'user_analytics', targetUserName));
    return true;
  } catch (e) {
    console.error("adminDeleteUserDirect error:", e);
    return false;
  }
}

// 📦 15-9-5. 관리자 문제 대량 일괄 등록 (Bulk Import)
export async function adminBulkImportQuestions(questions: Question[]): Promise<{ importedCount: number; errors: number }> {
  let importedCount = 0;
  let errors = 0;
  for (const q of questions) {
    try {
      if (!q.sentence || !q.answer || !q.options || q.options.length < 2) {
        errors++;
        continue;
      }
      const lvl = q.level || 'level1';
      const colRef = collection(db, 'custom_questions', lvl, 'items');
      await setDoc(doc(colRef), removeUndefinedDeep({
        ...q,
        form: Number(q.form) || 1,
        createdAt: serverTimestamp()
      }));
      importedCount++;
    } catch {
      errors++;
    }
  }
  return { importedCount, errors };
}

// 📤 15-9-6. 관리자 전체 문제 JSON 내보내기 (Export All Questions)
export async function adminExportAllQuestions(): Promise<Question[]> {
  const levels = ['level1', 'level2', 'level3', 'level4'];
  const allList: Question[] = [];
  for (const lvl of levels) {
    try {
      const snap = await getDocs(collection(db, 'custom_questions', lvl, 'items'));
      snap.forEach(d => {
        allList.push({ id: d.id, level: lvl, ...d.data() } as Question);
      });
    } catch {}
  }
  return allList;
}

// 🎲 자연스러운 고스트 플레이어 닉네임 대규모 목록 (60종 이상)
export const RANDOM_GHOST_NAMES = [
  '토익만점가자', '영포자탈출러', '새벽공부왕', '하버드지망생', '단어마스터민',
  'Chloe_99', 'Jake_Eng', '스터디윗미', '카투사준비생', '문법파괴자',
  '영어정복자', 'Olivia_Kim', 'Ryan_Park', '수능1등급가자', '오픽AL목표',
  '미드자막없이', '회화신동', '밤샘열공러', 'Leo_Lee', 'Sophia_W',
  '영어괴물', 'TOEFL_Master', '기상스터디', '매일10문제', '지하철영단어',
  'Sunny_Day', 'Alex_Grammar', '토익990', '원어민처럼', '영단어스나이퍼',
  '5형식마스터', '토스Lv8달성', '아이엘츠7점', '강남토익커', '신촌스터디장',
  '새벽5시클럽', '영문학도진', '통번역꿈나무', '직장인야간반', '수능영어만점',
  '스피킹장인', '발음깡패', '외항사준비생', '교환학생가자', '문맥천재',
  '에타영어1타', '공부자극제', '리스닝만점러', '단어장뽀개기', '열공모드ON',
  'David_Cho', 'Emily_In_Seoul', 'Harry_Potter', 'Luna_Love', 'Ethan_Hunt',
  'Lucas_Grammar', 'Hannah_Study', 'Daniel_K', 'Grace_Lee', 'Mia_English'
];

// 🎭 15-10-0. 회차별 허용 시간대 계산기 (시작 5분 후 ~ 현재 시각)
export function getCycleTimeBounds(cycleId: string): { 
  startTime: Date; 
  minAllowedTime: Date; 
  maxAllowedTime: Date;
} {
  const parts = cycleId.split('_cycle');
  const dateStr = parts[0]; // e.g. "2026-08-17"
  const cycleIndex = parseInt(parts[1] || '1', 10);
  
  const now = new Date();
  const [year, month, day] = dateStr && dateStr.includes('-')
    ? dateStr.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1, now.getDate()];

  let startHour = 0;
  let endHour = 10;
  if (cycleIndex === 2) {
    startHour = 10;
    endHour = 18;
  } else if (cycleIndex === 3) {
    startHour = 18;
    endHour = 24;
  }

  // 1. 회차 공식 시작 시각 (00:00, 10:00, 18:00)
  const startTime = new Date(year, month - 1, day, startHour, 0, 0);
  
  // 2. 회차 시작 5분 후 시각 (00:05, 10:05, 18:05)
  const minAllowedTime = new Date(startTime.getTime() + 5 * 60 * 1000);

  // 3. 회차 공식 종료 시각
  const endTime = new Date(year, month - 1, day, endHour === 24 ? 23 : endHour, endHour === 24 ? 59 : 0, 59);

  // 4. 현재 진행 중인 회차라면 현재 시각(now)이 상한선, 이미 지난 과거 회차라면 종료 시각(endTime)이 상한선
  let maxAllowedTime = endTime;
  if (now.getTime() < endTime.getTime()) {
    maxAllowedTime = now;
  }

  // 만약 회차가 방금 시작되어 현재 시각이 시작 5분 이내라면 역전 방지
  if (maxAllowedTime.getTime() <= minAllowedTime.getTime()) {
    maxAllowedTime = new Date(minAllowedTime.getTime() + 60 * 1000);
  }

  return { startTime, minAllowedTime, maxAllowedTime };
}

// 🎭 15-10-1. 랭킹전 단일 고스트 플레이어 주입 (시작 5분 후 ~ 현재 시각 사이)
export async function adminInjectGhostRanking(payload: {
  cycleId: string;
  name: string;
  correctCount: number; // 0 ~ 10
  minutesAgo?: number; // 분 전
  avatarId?: string; // 아바타 ID (gemini_god, chronos, phoenix, lion 등)
}): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedName = payload.name.trim();
    if (!trimmedName) return { success: false, error: '플레이어 이름을 입력해 주세요.' };

    const pointsLadder = [10, 10, 15, 15, 15, 25, 25, 25, 30, 30];
    let score = 0;
    const count = Math.max(0, Math.min(10, payload.correctCount));
    for (let i = 0; i < count; i++) {
      score += pointsLadder[i];
    }
    const rankDocId = `${payload.cycleId}_${trimmedName}`;
    const rankRef = doc(db, 'cycle_rankings', rankDocId);

    // 🕒 회차 시작 5분 후 ~ 현재 시각 사이로 완료 시간 제한
    const { minAllowedTime, maxAllowedTime } = getCycleTimeBounds(payload.cycleId);
    let fakeCompletedAt: Date;

    if (typeof payload.minutesAgo === 'number') {
      const targetTime = new Date(Date.now() - payload.minutesAgo * 60 * 1000);
      const clampedMs = Math.max(minAllowedTime.getTime(), Math.min(maxAllowedTime.getTime(), targetTime.getTime()));
      fakeCompletedAt = new Date(clampedMs);
    } else {
      const span = maxAllowedTime.getTime() - minAllowedTime.getTime();
      fakeCompletedAt = new Date(minAllowedTime.getTime() + Math.random() * span);
    }

    const targetAvatar = AVATAR_DATABASE.find(a => a.id === payload.avatarId) || AVATAR_DATABASE.find(a => a.id === 'lion');
    const avatarIcon = targetAvatar?.icon || '🦁';
    const avatarName = targetAvatar?.name || '라이언';
    const avatarGrade = targetAvatar?.grade || 'starter';
    const avatarBgGradient = targetAvatar?.bgGradient || '';

    const docData = removeUndefinedDeep({
      cycleId: payload.cycleId,
      name: trimmedName,
      score,
      completedAt: fakeCompletedAt,
      avatarIcon,
      avatarName,
      avatarGrade,
      avatarBgGradient,
      currentAvatarId: targetAvatar?.id || 'lion',
      isGhost: true,
      updatedAt: serverTimestamp()
    });

    await setDoc(rankRef, docData);

    return { success: true };
  } catch (e: any) {
    console.error("adminInjectGhostRanking Error:", e);
    return { success: false, error: e.message || '가짜 랭킹 데이터 주입에 실패했습니다.' };
  }
}

// 🎭 15-10-2. 랭킹전 고스트 플레이어 N명 일괄 자동 투입 (오직 cycle_rankings 컬렉션에만 안전하게 투입)
export async function adminBatchInjectGhostRankings(payload: {
  cycleId: string;
  count: number;
  minCorrect?: number;
  maxCorrect?: number;
  minMinutesAgo?: number;
  maxMinutesAgo?: number;
}): Promise<{ success: boolean; injectedCount: number; error?: string }> {
  try {
    const { cycleId, count } = payload;
    const minCorrect = Math.max(1, Math.min(10, payload.minCorrect ?? 4));
    const maxCorrect = Math.max(minCorrect, Math.min(10, payload.maxCorrect ?? 10));

    // 1. 현재 랭킹 조회하여 닉네임 중복 완벽 배제
    const existingRankings = await getCycleRankings(cycleId);
    const existingNames = new Set(existingRankings.map(r => r.name.toLowerCase()));

    // 2. 가용한 고유 닉네임 풀 준비
    const availableNames: string[] = [];
    const shuffledPreset = [...RANDOM_GHOST_NAMES].sort(() => Math.random() - 0.5);
    for (const name of shuffledPreset) {
      if (!existingNames.has(name.toLowerCase()) && !availableNames.includes(name)) {
        availableNames.push(name);
      }
    }

    // 부족할 경우 generateRandomNickname()으로 고유 닉네임 무한 생성
    while (availableNames.length < count) {
      const rand = generateRandomNickname();
      if (!existingNames.has(rand.toLowerCase()) && !availableNames.includes(rand)) {
        availableNames.push(rand);
      }
    }

    const targetCount = Math.min(count, availableNames.length);
    const pointsLadder = [10, 10, 15, 15, 15, 25, 25, 25, 30, 30];

    // 🕒 3. 회차 시작 5분 후 ~ 현재 시각 범위 산출
    const { minAllowedTime, maxAllowedTime } = getCycleTimeBounds(cycleId);
    const timeSpanMs = Math.max(60000, maxAllowedTime.getTime() - minAllowedTime.getTime());

    // N명의 고스트에게 시작 5분 후 ~ 현재 시각 사이의 고유한 완료 시각 생성
    const generatedTimestamps: Date[] = [];
    const usedMsSet = new Set<number>();

    for (let i = 0; i < targetCount; i++) {
      let randMs = Math.floor(Math.random() * timeSpanMs);
      while (usedMsSet.has(randMs)) {
        randMs = (randMs + 1000) % timeSpanMs;
      }
      usedMsSet.add(randMs);
      generatedTimestamps.push(new Date(minAllowedTime.getTime() + randMs));
    }

    // 시간 오름차순 정렬 후 고스트들에게 배정
    generatedTimestamps.sort((a, b) => a.getTime() - b.getTime());

    const nonStarterAvatars = AVATAR_DATABASE.filter(a => a.grade !== 'starter');
    const writePromises = [];

    for (let i = 0; i < targetCount; i++) {
      const name = availableNames[i];

      // 정답 수 및 점수 계산
      const correctCount = Math.floor(Math.random() * (maxCorrect - minCorrect + 1)) + minCorrect;
      let score = 0;
      for (let c = 0; c < Math.min(10, correctCount); c++) {
        score += pointsLadder[c];
      }

      const fakeCompletedAt = generatedTimestamps[i];

      // 다양한 등급의 아바타 착용
      const targetAvatar = nonStarterAvatars[Math.floor(Math.random() * nonStarterAvatars.length)] || AVATAR_DATABASE[0];

      const rankDocId = `${cycleId}_${name}`;
      const rankRef = doc(db, 'cycle_rankings', rankDocId);

      const docData = removeUndefinedDeep({
        cycleId,
        name,
        score,
        completedAt: fakeCompletedAt,
        avatarIcon: targetAvatar.icon,
        avatarName: targetAvatar.name,
        avatarGrade: targetAvatar.grade,
        avatarBgGradient: targetAvatar.bgGradient || '',
        currentAvatarId: targetAvatar.id,
        isGhost: true,
        updatedAt: serverTimestamp()
      });

      writePromises.push(setDoc(rankRef, docData));
    }

    await Promise.all(writePromises);
    return { success: true, injectedCount: targetCount };
  } catch (e: any) {
    console.error("adminBatchInjectGhostRankings Error:", e);
    return { success: false, injectedCount: 0, error: e.message || '고스트 일괄 주입에 실패했습니다.' };
  }
}

// 🧹 15-10-3. 해당 차전 고스트 랭커 데이터 및 users 잔재 일괄 청소
export async function adminClearGhostRankings(cycleId: string): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    const q = query(collection(db, 'cycle_rankings'), where('cycleId', '==', cycleId));
    const snap = await getDocs(q);
    const deletePromises = [];
    let count = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (data.isGhost) {
        deletePromises.push(deleteDoc(docSnap.ref));
        count++;
      }
    }

    // 🧹 혹시 users 컬렉션에 남아있던 고스트 문서들도 완전 청소
    try {
      const usersGhostQuery = query(collection(db, 'users'), where('isGhost', '==', true));
      const userGhostSnap = await getDocs(usersGhostQuery);
      userGhostSnap.forEach(d => deletePromises.push(deleteDoc(d.ref)));
    } catch {}

    await Promise.all(deletePromises);
    return { success: true, deletedCount: count };
  } catch (e: any) {
    console.error("adminClearGhostRankings Error:", e);
    return { success: false, deletedCount: 0, error: e.message || '고스트 삭제에 실패했습니다.' };
  }
}

// 🏆 15-11. 랭킹전 차수별 순위 차등 보상 계산 및 수령
export function calculateCycleReward(rank: number): { coins: number; xp: number; title: string } {
  if (rank === 1) return { coins: 200, xp: 100, title: '🥇 1위 챔피언' };
  if (rank === 2) return { coins: 120, xp: 70, title: '🥈 2위 러너업' };
  if (rank === 3) return { coins: 80, xp: 50, title: '🥉 3위 포디움' };
  if (rank <= 10) return { coins: 40, xp: 30, title: '🎖️ TOP 10 랭커' };
  return { coins: 15, xp: 10, title: '🎗️ 참가상' };
}

export function isCycleRewardClaimed(userName: string, cycleId: string): boolean {
  const claimKey = `claimed_cycle_reward_${userName}_${cycleId}`;
  return localStorage.getItem(claimKey) === 'true';
}

export async function claimCycleRankingReward(
  userName: string, 
  cycleId: string, 
  rank: number
): Promise<{ success: boolean; coins?: number; reward?: { coins: number; xp: number; title: string } }> {
  try {
    const claimKey = `claimed_cycle_reward_${userName}_${cycleId}`;
    if (localStorage.getItem(claimKey)) {
      return { success: false };
    }

    const reward = calculateCycleReward(rank);
    await addCoins(userName, reward.coins);
    
    // XP update in Firestore
    try {
      const userRef = doc(db, 'users', userName);
      await updateDoc(userRef, {
        xp: increment(reward.xp)
      });
    } catch {}

    localStorage.setItem(claimKey, 'true');
    return { success: true, coins: reward.coins, reward };
  } catch (e) {
    console.error("claimCycleRankingReward error:", e);
    return { success: false };
  }
}

// 🎯 16. 랭킹전 문제별 난이도 및 차등 배점 정보 계산 (10문제 만점 = 총 200점)
// Q1~Q2: Level 1(10점 x 2 = 20점), Q3~Q5: Level 2(15점 x 3 = 45점), Q6~Q8: Level 3(25점 x 3 = 75점), Q9~Q10: Level 4(30점 x 2 = 60점) => 총 200점 만점!
export function getRankingQuestionPoints(question: Question, questionIndex?: number): {
  levelLabel: string;
  points: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
} {
  const diff = question.difficulty || question.level || '';
  const idx = typeof questionIndex === 'number' ? questionIndex : 1;

  if (diff.includes('Level 1') || diff.includes('입문') || diff.includes('초급') || idx <= 2) {
    return {
      levelLabel: 'Level 1 (입문)',
      points: 10,
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/40'
    };
  }
  if (diff.includes('Level 2') || diff.includes('중급') || (idx >= 3 && idx <= 5)) {
    return {
      levelLabel: 'Level 2 (중급)',
      points: 15,
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-300',
      badgeBorder: 'border-blue-500/40'
    };
  }
  if (diff.includes('Level 3') || diff.includes('고득점') || (idx >= 6 && idx <= 8)) {
    return {
      levelLabel: 'Level 3 (고득점)',
      points: 25,
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300',
      badgeBorder: 'border-purple-500/40'
    };
  }
  return {
    levelLabel: 'Level 4 (실전 마스터)',
    points: 30,
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-500/40'
  };
}

export interface LevelGatingInfo {
  level: number;
  levelLabel: string;
  tierCap: string;
  tierCapNotice: string;
  coinsReward: number;
  xpReward: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  targetDesc: string;
}

// 💡 17. 난이도별 승급 한도 & 보상 & 가이드 정보 조회
export function getLevelGatingInfo(level: number | string): LevelGatingInfo {
  let lvl = 1;
  if (typeof level === 'number') lvl = level;
  else if (typeof level === 'string') {
    const match = level.match(/\d+/);
    if (match) lvl = Number(match[0]);
  }

  if (lvl === 1) {
    return {
      level: 1,
      levelLabel: 'Level 1 (입문/초급)',
      tierCap: '🥈 실버 & B등급까지',
      tierCapNotice: '1단계 문제는 실버 티어 & B등급 마스터리까지 올릴 수 있습니다.',
      coinsReward: 1,
      xpReward: 7,
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/40',
      targetDesc: '중2~중3 기초 문장 구조 및 기본 어휘'
    };
  }
  if (lvl === 2) {
    return {
      level: 2,
      levelLabel: 'Level 2 (실력 중급)',
      tierCap: '🥇 골드 & A등급까지',
      tierCapNotice: '2단계 문제를 풀면 골드 티어 & A등급 마스터리까지 올릴 수 있습니다.',
      coinsReward: 3,
      xpReward: 10,
      badgeBg: 'bg-blue-500/20',
      badgeText: 'text-blue-300',
      badgeBorder: 'border-blue-500/40',
      targetDesc: '고1~고2 표준 문장 구조 및 핵심 어휘'
    };
  }
  if (lvl === 3) {
    return {
      level: 3,
      levelLabel: 'Level 3 (고득점 도약)',
      tierCap: '💎 다이아 & 플래티넘까지',
      tierCapNotice: '3단계 문제를 풀면 플래티넘 및 다이아몬드 티어까지 올릴 수 있습니다.',
      coinsReward: 5,
      xpReward: 13,
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-300',
      badgeBorder: 'border-purple-500/40',
      targetDesc: '고3~수능 심화 복합 문장 및 고급 어휘'
    };
  }
  return {
    level: 4,
    levelLabel: 'Level 4 (실전 마스터)',
    tierCap: '👑 마스터 & S등급 완전 정복!',
    tierCapNotice: '4단계 실전 문제를 풀면 천상계 마스터 티어 & S등급 절대 마스터 획득!',
    coinsReward: 7,
    xpReward: 16,
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-500/40',
    targetDesc: '토익/편입/공무원 실전 기출 수준의 고난도 문장'
  };
}

// 💥 15-11. 전면 초기화: 모든 문제 및 랭킹 회차 데이터 영구 삭제 & 클린 리셋
export async function adminPurgeAndResetAllQuestionsAndCycles(): Promise<{
  success: boolean;
  deletedQuestions: number;
  deletedCycles: number;
  deletedReports: number;
  error?: string;
}> {
  try {
    let deletedQuestions = 0;
    let deletedCycles = 0;
    let deletedReports = 0;

    // 1. Delete all questions in 'questions'
    try {
      const qSnap = await getDocs(collection(db, 'questions'));
      const qDeletes = qSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(qDeletes);
      deletedQuestions = qSnap.size;
    } catch (e) {
      console.warn("Purge questions warn:", e);
    }

    // 2. Delete all cycle documents in 'cycle_challenges'
    try {
      const cSnap = await getDocs(collection(db, 'cycle_challenges'));
      const cDeletes = cSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(cDeletes);
      deletedCycles = cSnap.size;
    } catch (e) {
      console.warn("Purge cycle_challenges warn:", e);
    }

    // 3. Delete all reports in 'question_reports' & 'reports'
    try {
      const repSnap1 = await getDocs(collection(db, 'question_reports'));
      const repDeletes1 = repSnap1.docs.map(d => deleteDoc(d.ref));
      await Promise.all(repDeletes1);
      deletedReports += repSnap1.size;
    } catch {}
    try {
      const repSnap2 = await getDocs(collection(db, 'reports'));
      const repDeletes2 = repSnap2.docs.map(d => deleteDoc(d.ref));
      await Promise.all(repDeletes2);
      deletedReports += repSnap2.size;
    } catch {}

    // 4. Clear client-side question caches in localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (
          k.includes('quiz_queue') || 
          k.includes('user_reports') || 
          k.includes('cached_questions') || 
          k.includes('ai_grammar_cached') ||
          k.includes('ppokae_en_exp_') ||
          k.includes('ranking_cycle_cache')
        )) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}

    return {
      success: true,
      deletedQuestions,
      deletedCycles,
      deletedReports
    };
  } catch (error: any) {
    console.error("adminPurgeAndResetAllQuestionsAndCycles Error:", error);
    return {
      success: false,
      deletedQuestions: 0,
      deletedCycles: 0,
      deletedReports: 0,
      error: error.message || '전면 초기화 중 오류가 발생했습니다.'
    };
  }
}

// 🔄 15-12. 문제 교정 시 questions DB, cycle_challenges 회차 DB, 제보 DB 전역 즉시 반영
export async function adminUpdateQuestionEverywhere(
  fixedQuestion: Question,
  originalSentence?: string
): Promise<{ success: boolean; updatedCycles: number }> {
  try {
    const cleaned = cleanQuestionForStorage(fixedQuestion);
    let updatedCycles = 0;

    // 1. questions 컬렉션에 업데이트/삽입
    if (cleaned.id) {
      try {
        const qRef = doc(db, 'questions', cleaned.id);
        await setDoc(qRef, { ...cleaned, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.warn("Update questions doc warn:", e);
      }
    }

    // 2. cycle_challenges 컬렉션 전체를 스캔하여 해당 문제가 포함된 회차의 문제 배열 교정
    try {
      const cyclesSnap = await getDocs(collection(db, 'cycle_challenges'));
      const updatePromises = [];

      for (const cycleDoc of cyclesSnap.docs) {
        const data = cycleDoc.data();
        const questionsList: Question[] = data.questions || [];
        let modified = false;

        const targetOrig = (originalSentence || '').trim().toLowerCase();
        const targetSent = (cleaned.sentence || '').trim().toLowerCase();
        const targetId = cleaned.id;

        const newList = questionsList.map(q => {
          const qSent = (q.sentence || '').trim().toLowerCase();
          if ((targetId && q.id === targetId) || (targetOrig && qSent === targetOrig) || (targetSent && qSent === targetSent)) {
            modified = true;
            return {
              ...cleaned,
              id: q.id || cleaned.id
            };
          }
          return q;
        });

        if (modified) {
          updatePromises.push(updateDoc(cycleDoc.ref, { questions: newList, updatedAt: serverTimestamp() }));
          updatedCycles++;
        }
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
    } catch (e) {
      console.warn("Update cycle_challenges warn:", e);
    }

    return { success: true, updatedCycles };
  } catch (error: any) {
    console.error("adminUpdateQuestionEverywhere Error:", error);
    return { success: false, updatedCycles: 0 };
  }
}

// 🗑️ 15-13. 관리자 전용: 공용 문제집 내 특정 불량/오류 문제 단건 즉시 영구 삭제
export async function adminDeleteSingleQuestion(questionId?: string, sentence?: string): Promise<boolean> {
  try {
    // 1. questionId가 있으면 직접 삭제
    if (questionId) {
      try {
        await deleteDoc(doc(db, 'questions', questionId));
      } catch (e) {
        console.warn("deleteDoc by id warn:", e);
      }
    }

    // 2. sentence 기반으로 questions 컬렉션 일치 도큐먼트 전수 검색 후 삭제
    if (sentence) {
      const targetSent = sentence.trim().toLowerCase();
      const snap = await getDocs(collection(db, 'questions'));
      const toDelete = snap.docs.filter(d => {
        const dSent = (d.data().sentence || '').trim().toLowerCase();
        return dSent === targetSent || (questionId && d.id === questionId);
      });
      if (toDelete.length > 0) {
        await Promise.all(toDelete.map(d => deleteDoc(d.ref)));
      }

      // 3. cycle_challenges 회차 DB 내에서도 해당 문제 제거/치유
      try {
        const cyclesSnap = await getDocs(collection(db, 'cycle_challenges'));
        for (const cycleDoc of cyclesSnap.docs) {
          const data = cycleDoc.data();
          const qList: Question[] = data.questions || [];
          const filtered = qList.filter(q => {
            const qSent = (q.sentence || '').trim().toLowerCase();
            return qSent !== targetSent && (!questionId || q.id !== questionId);
          });
          if (filtered.length !== qList.length) {
            await updateDoc(cycleDoc.ref, { questions: filtered, updatedAt: serverTimestamp() });
          }
        }
      } catch (e) {
        console.warn("cycle_challenges purge warn:", e);
      }
    }

    return true;
  } catch (error) {
    console.error("adminDeleteSingleQuestion Error:", error);
    return false;
  }
}
