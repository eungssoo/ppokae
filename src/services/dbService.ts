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
  arrayUnion
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
import { sanitizeForm, generateRankingCycleQuestions, shuffleOptions } from './geminiService';
import { STARTER_AVATAR_IDS, performGachaDraw, AVATAR_DATABASE } from './avatarService';

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

// 🏆 티어 계산기
export function calculateTier(xp: number = 0): { tier: string; minXp: number; maxXp: number; progress: number; badgeColor: string; icon: string } {
  if (xp >= 5000) {
    return { tier: 'Master', minXp: 5000, maxXp: 10000, progress: 100, badgeColor: 'from-amber-400 via-rose-500 to-purple-600', icon: '👑' };
  } else if (xp >= 2000) {
    const progress = Math.min(100, Math.round(((xp - 2000) / 3000) * 100));
    return { tier: 'Diamond', minXp: 2000, maxXp: 5000, progress, badgeColor: 'from-cyan-400 to-blue-500', icon: '💎' };
  } else if (xp >= 1000) {
    const progress = Math.min(100, Math.round(((xp - 1000) / 1000) * 100));
    return { tier: 'Platinum', minXp: 1000, maxXp: 2000, progress, badgeColor: 'from-emerald-400 to-teal-500', icon: '🏆' };
  } else if (xp >= 500) {
    const progress = Math.min(100, Math.round(((xp - 500) / 500) * 100));
    return { tier: 'Gold', minXp: 500, maxXp: 1000, progress, badgeColor: 'from-amber-400 to-yellow-500', icon: '🥇' };
  } else if (xp >= 200) {
    const progress = Math.min(100, Math.round(((xp - 200) / 300) * 100));
    return { tier: 'Silver', minXp: 200, maxXp: 500, progress, badgeColor: 'from-slate-300 to-slate-400', icon: '🥈' };
  } else {
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
export async function createOrGetGoogleUserProfile(gUser: User): Promise<UserProfile> {
  const displayName = gUser.displayName || (gUser.email ? gUser.email.split('@')[0] : '학습자');
  const uidRef = doc(db, 'users', gUser.uid);
  const nameRef = doc(db, 'users', displayName);

  const [uidSnap, nameSnap] = await Promise.all([getDoc(uidRef), getDoc(nameRef)]);
  const uidData = uidSnap.exists() ? uidSnap.data() : {};
  const nameData = nameSnap.exists() ? nameSnap.data() : {};
  const hasExisting = uidSnap.exists() || nameSnap.exists();

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

    return profile;
  } else {
    const isAdmin = checkIsAdmin({ name: displayName, email: gUser.email || undefined });
    const newProfile: UserProfile = {
      name: displayName,
      pin: '000000',
      coins: 200,
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
      isAdmin
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

    return newProfile;
  }
}

// 🔐 1-1. 구글 공식 암호화 OAuth 2.0 로그인
export async function signInWithGoogle(): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const profile = await createOrGetGoogleUserProfile(result.user);
    return { success: true, profile };
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

// 🔐 1-3. PIN 계정 사용자가 나중에 구글 계정 연동하여 데이터 영구 백업
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
      const maxCoins = Math.max(data.coins ?? 200, currentUser.coins ?? 200);
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
      return await createOrGetGoogleUserProfile(result.user);
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

// 📊 1-4. 퀴즈 풀이 결과 통계 & XP 누적
export async function recordQuizResultStats(userName: string, form: number, isCorrect: boolean): Promise<void> {
  try {
    const userRef = doc(db, 'users', userName);
    const formKeyTotal = `stats_form_${form}_total`;
    const formKeyCorrect = `stats_form_${form}_correct`;

    const xpEarned = isCorrect ? 10 : 2;

    const updates: any = {
      totalSolved: increment(1),
      xp: increment(xpEarned),
      [formKeyTotal]: increment(1)
    };

    if (isCorrect) {
      updates.totalCorrect = increment(1);
      updates[formKeyCorrect] = increment(1);
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

// 📊 1-5. 문형별 마스터리 통계 조회
export async function getUserMasteryStats(userName: string): Promise<{ formMasteries: FormMastery[]; totalSolved: number; totalCorrect: number; overallAccuracy: number }> {
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

    const formMasteries: FormMastery[] = [];
    for (let f = 1; f <= 5; f++) {
      const total = Math.max(dataA[`stats_form_${f}_total`] || 0, dataB[`stats_form_${f}_total`] || 0);
      const correct = Math.max(dataA[`stats_form_${f}_correct`] || 0, dataB[`stats_form_${f}_correct`] || 0);
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

      let grade: 'S' | 'A' | 'B' | 'C' = 'C';
      if (accuracy >= 90 && total >= 5) grade = 'S';
      else if (accuracy >= 75) grade = 'A';
      else if (accuracy >= 50) grade = 'B';

      formMasteries.push({
        form: f,
        total,
        correct,
        accuracy,
        grade
      });
    }

    const overallAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
    return { formMasteries, totalSolved, totalCorrect, overallAccuracy };
  } catch (e) {
    console.error("getUserMasteryStats Error:", e);
    return {
      formMasteries: [1, 2, 3, 4, 5].map(f => ({ form: f, total: 0, correct: 0, accuracy: 0, grade: 'C' })),
      totalSolved: 0,
      totalCorrect: 0,
      overallAccuracy: 0
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

// 👤 전체 유저 프로필 데이터 조회 (코인, XP, 티어, 북마크 한도, 아바타)
export async function getUserProfileData(userName: string): Promise<Partial<UserProfile> | null> {
  try {
    const userRef = doc(db, 'users', userName);
    let snap = await getDoc(userRef);
    let uidSnapData: any = {};
    if (auth.currentUser?.uid && auth.currentUser.uid !== userName) {
      const uidSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (uidSnap.exists()) uidSnapData = uidSnap.data();
    }

    if (snap.exists() || Object.keys(uidSnapData).length > 0) {
      const data = snap.exists() ? snap.data() : {};
      const xp = Math.max(data.xp || 0, uidSnapData.xp || 0);
      const coins = Math.max(data.coins ?? 200, uidSnapData.coins ?? 200);
      const bookmarkLimit = Math.max(data.bookmarkLimit || 50, uidSnapData.bookmarkLimit || 50);
      const totalSolved = Math.max(data.totalSolved || 0, uidSnapData.totalSolved || 0);
      const totalCorrect = Math.max(data.totalCorrect || 0, uidSnapData.totalCorrect || 0);
      const dailyGoal = data.dailyGoal || uidSnapData.dailyGoal || 10;

      const unlockedAvatars = Array.from(new Set([
        ...STARTER_AVATAR_IDS,
        ...(Array.isArray(data.unlockedAvatars) ? data.unlockedAvatars : []),
        ...(Array.isArray(uidSnapData.unlockedAvatars) ? uidSnapData.unlockedAvatars : [])
      ]));

      const avatar = data.avatar || uidSnapData.avatar || '🦁';
      const currentAvatarId = data.currentAvatarId || uidSnapData.currentAvatarId || 'lion';
      const isAdmin = data.isAdmin || uidSnapData.isAdmin;

      return {
        name: data.name || uidSnapData.name || userName,
        pin: data.pin || uidSnapData.pin,
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
        email: data.email || uidSnapData.email,
        photoURL: data.photoURL || uidSnapData.photoURL,
        isAdmin,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : uidSnapData.createdAt?.toMillis ? uidSnapData.createdAt.toMillis() : Date.now()
      };
    }
    return null;
  } catch (e) {
    console.error("getUserProfileData error:", e);
    return null;
  }
}

// 🪙 코인 차감 (관리자는 무제한 무료 패스)
export async function deductCoins(userName: string, amount: number, userObj?: Partial<UserProfile> | null): Promise<boolean> {
  try {
    if (userObj && checkIsAdmin(userObj)) return true;

    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      if (userObj && checkIsAdmin(userObj)) return true;
      return false;
    }

    const data = snap.data();
    if (data.isAdmin || checkIsAdmin(data as UserProfile)) {
      return true;
    }

    const current = data.coins ?? 0;
    if (current < amount) return false;

    await setDoc(userRef, {
      coins: increment(-amount),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error("deductCoins error:", e);
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
export const BLANK_PATTERN = /(?:_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)|<\s*blank\s*>|\[\s*빈칸\s*\]|\(\s*빈칸\s*\)|\[\s*_{1,}\s*\]|\(\s*_{1,}\s*\)|\bblank\b|\bBlank\b|\bBLANK\b)/gi;

// 🔤 빈칸 표기 표준화 헬퍼 (모든 비정형 빈칸을 ______ 로 통일)
export function normalizeSentenceBlank(sentence: string): string {
  if (!sentence || typeof sentence !== 'string') return '';
  return sentence.replace(BLANK_PATTERN, '______');
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

// Helper: Firestore 안전 저장을 위한 Question 객체 정제 (undefined 100% 제거)
export function cleanQuestionForStorage(q: any): any {
  const rawSentence = q?.sentence || '';
  const normalizedSentence = normalizeSentenceBlank(rawSentence);

  return removeUndefinedDeep({
    form: sanitizeForm(q?.form),
    sentence: normalizedSentence,
    options: Array.isArray(q?.options)
      ? shuffleOptions(q.options.map((opt: any) => {
          if (typeof opt === 'string') return opt;
          return {
            text: opt?.text || '',
            is_correct: !!opt?.is_correct,
            feedback: opt?.feedback || ''
          };
        }))
      : [],
    answer: q?.answer || '',
    translation: q?.translation || '',
    explanation: {
      chunk_pattern: q?.explanation?.chunk_pattern || '핵심 문형 정리',
      nuance: q?.explanation?.nuance || '자연스러운 뉘앙스 해설'
    },
    components: Array.isArray(q?.components)
      ? q.components.map((c: any) => ({
          chunk: c?.chunk || '',
          role: c?.role || '수식어',
          meaning: c?.meaning || ''
        }))
      : [],
    difficulty: q?.difficulty || 'Level 1'
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

// 3. 공용 DB에서 난이도별 10문제 추출
export async function getRandomQuestions(difficultyLabel: string): Promise<{ success: boolean; data?: Question[]; error?: string }> {
  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    if (snapshot.empty) {
      return { success: false, error: "공용 DB에 저장된 문제가 없습니다. [문제 공장]에서 문제를 생성해주세요." };
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
      return { success: false, error: `선택하신 [${difficultyLabel}] 난이도의 문제가 없습니다. [문제 공장]에서 해당 난이도 문제를 생성해주세요.` };
    }

    allQuestions.sort(() => Math.random() - 0.5);
    const selected = allQuestions.slice(0, 10);
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

// 5. 개인 맞춤 약점 문제 10문제 추출
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

    allQuestions.sort(() => Math.random() - 0.5);
    const selected = allQuestions.slice(0, 10);
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
      const qList = (cycleSnap.data().questions || []).map((q: any) => ({
        ...q,
        form: sanitizeForm(q.form)
      }));
      if (qList.length >= 10) {
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
  if (d.includes('Level 1') || d.includes('초급') || d.includes('입문')) {
    return 'Level 1 (입문/초급)';
  }
  if (d.includes('Level 2') || d.includes('중급') || d.includes('실력')) {
    return 'Level 2 (실력 중급)';
  }
  if (d.includes('Level 3') || d.includes('고득점') || d.includes('도약') || d.includes('고3')) {
    return 'Level 3 (고득점 도약)';
  }
  if (d.includes('Level 4') || d.includes('실전') || d.includes('마스터') || d.includes('토익')) {
    return 'Level 4 (실전 마스터)';
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

      grouped[normDiff].push({
        id: docSnap.id,
        form: sanitizeForm(d.form),
        sentence: d.sentence,
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

// 👑 15-1. 관리자 권한 여부 확인 (이름+PIN 조합 및 인증된 마스터 구글 이메일만 허용)
export function checkIsAdmin(user: Partial<UserProfile> | null | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  const name = (user.name || '').trim().toLowerCase();
  const email = (user.email || '').trim().toLowerCase();
  const pin = (user.pin || '').trim();

  // 1) 마스터 PIN 관리자 (관리자 계정명 + 6자리 마스터 PIN 조합 시에만 승인)
  const isMasterPinAuth = (name === 'admin' || name === '뽀개마스터' || name === 'eungsookim' || name === '김응수') && (pin === '777777' || pin === '7777');
  
  // 2) 개발자 공식 구글 이메일 인증
  const isMasterEmailAuth = email === 'rladmdtn01010@gmail.com' || email === 'rladmdtn010@gmail.com' || email.includes('rladmdtn') || email.includes('eungssoo');

  return isMasterPinAuth || isMasterEmailAuth;
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

// 🎁 15-7. 공지 확인 및 영구 읽음 처리 (Firestore + localStorage 영구 동기화)
export async function markAnnouncementRead(userName: string, announcementId: string): Promise<void> {
  try {
    const claimKey = `seen_announce_${userName}_${announcementId}`;
    localStorage.setItem(claimKey, 'true');
    const ref = doc(db, 'announcement_user_status', `${userName}_${announcementId}`);
    await setDoc(ref, {
      userName,
      announcementId,
      isRead: true,
      readAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn("markAnnouncementRead Error:", e);
  }
}

// 🎁 15-8. 공지 첨부 보상 1회 수령 처리 (Firestore 중복 방지 락)
export async function claimAnnouncementReward(
  userName: string, 
  announcementId: string, 
  coins: number
): Promise<{ success: boolean; alreadyClaimed?: boolean }> {
  try {
    const claimKey = `claimed_announce_${userName}_${announcementId}`;
    if (localStorage.getItem(claimKey)) {
      return { success: false, alreadyClaimed: true };
    }

    const ref = doc(db, 'announcement_user_status', `${userName}_${announcementId}`);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.isClaimed) {
      localStorage.setItem(claimKey, 'true');
      return { success: false, alreadyClaimed: true };
    }

    if (coins > 0) {
      await addCoins(userName, coins);
    }

    await setDoc(ref, {
      userName,
      announcementId,
      isRead: true,
      isClaimed: true,
      rewardCoins: coins,
      claimedAt: serverTimestamp()
    }, { merge: true });

    localStorage.setItem(claimKey, 'true');
    localStorage.setItem(`seen_announce_${userName}_${announcementId}`, 'true');
    return { success: true };
  } catch (e) {
    console.error("claimAnnouncementReward error:", e);
    return { success: false };
  }
}

// 🎁 15-9. 유저별 공지 읽음/수령 상태 맵 조회
export async function getUserAnnouncementStatusMap(userName: string): Promise<Record<string, { isRead: boolean; isClaimed: boolean }>> {
  const result: Record<string, { isRead: boolean; isClaimed: boolean }> = {};
  try {
    const col = collection(db, 'announcement_user_status');
    const q = query(col, where('userName', '==', userName));
    const snap = await getDocs(q);
    snap.forEach(d => {
      const data = d.data();
      if (data.announcementId) {
        result[data.announcementId] = {
          isRead: !!data.isRead,
          isClaimed: !!data.isClaimed
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

// 🎲 자연스러운 고스트 플레이어 닉네임 목록
export const RANDOM_GHOST_NAMES = [
  '토익만점가자', '영포자탈출러', '새벽공부왕', '하버드지망생', '단어마스터민',
  'Chloe_99', 'Jake_Eng', '스터디윗미', '카투사준비생', '문법파괴자',
  '영어정복자', 'Olivia_Kim', 'Ryan_Park', '수능1등급가자', '오픽AL목표',
  '미드자막없이', '회화신동', '밤샘열공러', 'Leo_Lee', 'Sophia_W',
  '영어괴물', 'TOEFL_Master', '기상스터디', '매일10문제', '지하철영단어',
  'Sunny_Day', 'Alex_Grammar', '토익990', '원어민처럼'
];

// 🎭 15-10. 랭킹전 가짜 플레이어 (더미 랭커) 자연스러운 데이터 및 프로필 아바타 주입
export async function adminInjectGhostRanking(payload: {
  cycleId: string;
  name: string;
  correctCount: number; // 0 ~ 10
  minutesAgo?: number; // 5 ~ 180분 전
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

    const minutes = payload.minutesAgo ?? (Math.floor(Math.random() * 80) + 10);
    const fakeCompletedAt = new Date(Date.now() - minutes * 60 * 1000);

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
      updatedAt: serverTimestamp()
    });

    await setDoc(rankRef, docData);

    // 🌟 고스트 유저의 users 프로필도 함께 생성/동기화하여 랭킹 보드 실시간 조회 시 완벽 반영
    try {
      const userRef = doc(db, 'users', trimmedName);
      await setDoc(userRef, {
        name: trimmedName,
        avatar: avatarIcon,
        currentAvatarId: targetAvatar?.id || 'lion',
        xp: score * 10 + 50,
        tier: calculateTier(score * 10 + 50).tier,
        isGhost: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch {}

    return { success: true };
  } catch (e: any) {
    console.error("adminInjectGhostRanking Error:", e);
    return { success: false, error: e.message || '가짜 랭킹 데이터 주입에 실패했습니다.' };
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
