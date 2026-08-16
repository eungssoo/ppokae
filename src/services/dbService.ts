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
import { sanitizeForm, generateRankingCycleQuestions } from './geminiService';
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

// 1. 사용자 인증 (기본 200 코인 & 기본 50칸 북마크 & 4대 스타터 아바타 기본 지급)
export async function authenticateUser(name: string, pin: string): Promise<{ success: boolean; profile?: UserProfile; isNew?: boolean; error?: string }> {
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
        const unlockedAvatars = Array.isArray(data.unlockedAvatars) && data.unlockedAvatars.length > 0 
          ? Array.from(new Set([...STARTER_AVATAR_IDS, ...data.unlockedAvatars]))
          : STARTER_AVATAR_IDS;
        const isAdmin = checkIsAdmin({ name: trimmedName, pin: formattedPin, email: data.email, isAdmin: data.isAdmin });

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
          profile: { 
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
            email: data.email,
            photoURL: data.photoURL,
            isAdmin
          }
        };
      } else {
        return { success: false, error: "PIN 번호가 일치하지 않습니다." };
      }
    } else {
      const isAdmin = checkIsAdmin({ name: trimmedName, pin: formattedPin });
      const newProfile: UserProfile = {
        name: trimmedName,
        pin: formattedPin,
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

// 🔐 1-0. Google User Profile Creator / Getter (UID 및 displayName 양방향 동기화)
export async function createOrGetGoogleUserProfile(gUser: User): Promise<UserProfile> {
  const displayName = gUser.displayName || (gUser.email ? gUser.email.split('@')[0] : '학습자');
  const uidRef = doc(db, 'users', gUser.uid);
  const nameRef = doc(db, 'users', displayName);

  const [uidSnap, nameSnap] = await Promise.all([getDoc(uidRef), getDoc(nameRef)]);
  const existingSnap = nameSnap.exists() ? nameSnap : uidSnap.exists() ? uidSnap : null;

  if (existingSnap && existingSnap.exists()) {
    const data = existingSnap.data();
    const currentXp = data.xp || 0;
    const unlockedAvatars = Array.isArray(data.unlockedAvatars) && data.unlockedAvatars.length > 0 
      ? Array.from(new Set([...STARTER_AVATAR_IDS, ...data.unlockedAvatars]))
      : STARTER_AVATAR_IDS;

    const isAdmin = checkIsAdmin({ name: data.name || displayName, email: gUser.email || undefined, isAdmin: data.isAdmin });

    const profile: UserProfile = {
      name: data.name || displayName,
      pin: data.pin || '000000',
      coins: data.coins ?? 200,
      bookmarkLimit: data.bookmarkLimit ?? 50,
      avatar: data.avatar || '🦁',
      currentAvatarId: data.currentAvatarId || 'lion',
      unlockedAvatars,
      xp: currentXp,
      tier: calculateTier(currentXp).tier,
      dailyGoal: data.dailyGoal || 10,
      email: gUser.email || undefined,
      photoURL: gUser.photoURL || undefined,
      isAdmin
    };

    const cleanPayload = removeUndefinedDeep({
      ...profile,
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

    // 기존 문서 삭제
    await deleteDoc(oldRef);

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

    await setDoc(userRef, {
      coins: finalCoins,
      unlockedAvatars: updatedUnlockedList,
      updatedAt: serverTimestamp()
    }, { merge: true });

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

// 👕 1-2-3. 보유 아바타 장착 / 갈아끼우기 (🪙 10 코인 소모, 스타터/관리자 무료)
export async function equipUserAvatar(
  userName: string, 
  avatar: AvatarItem, 
  cost: number = 10
): Promise<{ success: boolean; newCoins?: number; error?: string }> {
  try {
    const isStarter = STARTER_AVATAR_IDS.includes(avatar.id);
    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : {};
    const isAdmin = data.isAdmin || checkIsAdmin(data as UserProfile) || userName === 'admin';
    const finalCost = (isStarter || isAdmin) ? 0 : cost;

    if (finalCost > 0) {
      const currentCoins = data.coins ?? 200;
      if (currentCoins < finalCost) {
        return { success: false, error: `코인이 부족합니다! (필요: ${finalCost} 코인 / 보유: ${currentCoins} 코인)` };
      }
      await deductCoins(userName, finalCost);
    }

    await setDoc(userRef, {
      avatar: avatar.icon,
      currentAvatarId: avatar.id,
      updatedAt: serverTimestamp()
    }, { merge: true });

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

    await setDoc(userRef, updates, { merge: true });
  } catch (e) {
    console.error("recordQuizResultStats Error:", e);
  }
}

// 📊 1-5. 문형별 마스터리 통계 조회
export async function getUserMasteryStats(userName: string): Promise<{ formMasteries: FormMastery[]; totalSolved: number; totalCorrect: number; overallAccuracy: number }> {
  try {
    const userRef = doc(db, 'users', userName);
    const snap = await getDoc(userRef);

    const formMasteries: FormMastery[] = [];
    let totalSolved = 0;
    let totalCorrect = 0;

    if (snap.exists()) {
      const data = snap.data();
      totalSolved = data.totalSolved || 0;
      totalCorrect = data.totalCorrect || 0;

      for (let f = 1; f <= 5; f++) {
        const total = data[`stats_form_${f}_total`] || 0;
        const correct = data[`stats_form_${f}_correct`] || 0;
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
    } else {
      for (let f = 1; f <= 5; f++) {
        formMasteries.push({ form: f, total: 0, correct: 0, accuracy: 0, grade: 'C' });
      }
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
    await setDoc(userRef, {
      coins: increment(amount),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return await getUserCoins(userName);
  } catch (e) {
    console.error("addCoins error:", e);
    return 0;
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

    await updateDoc(userRef, {
      coins: increment(-amount)
    });
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

// Helper: Firestore 안전 저장을 위한 Question 객체 정제 (undefined 100% 제거)
export function cleanQuestionForStorage(q: any): any {
  return removeUndefinedDeep({
    form: sanitizeForm(q?.form),
    sentence: q?.sentence || '',
    options: Array.isArray(q?.options)
      ? q.options.map((opt: any) => {
          if (typeof opt === 'string') return opt;
          return {
            text: opt?.text || '',
            is_correct: !!opt?.is_correct,
            feedback: opt?.feedback || ''
          };
        })
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

// 🎟️ 해당 사이클 응시 여부 확인
export async function hasUserCompletedCycle(cycleId: string, userName: string): Promise<{ completed: boolean; score?: number }> {
  try {
    const rankDocId = `${cycleId}_${userName}`;
    const rankRef = doc(db, 'cycle_rankings', rankDocId);
    const snap = await getDoc(rankRef);
    if (snap.exists()) {
      return { completed: true, score: snap.data().score || 0 };
    }
    return { completed: false };
  } catch (e) {
    console.error("hasUserCompletedCycle error:", e);
    return { completed: false };
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
        'Level 1': [],
        'Level 2': [],
        'Level 3': [],
        'Level 4': []
      };

      selected10.forEach((q, idx) => {
        const lvl = (q as any).level || (idx < 2 ? 'Level 1' : idx < 5 ? 'Level 2' : idx < 8 ? 'Level 3' : 'Level 4');
        if (byLevel[lvl]) byLevel[lvl].push(q);
        else byLevel['Level 2'].push(q);
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

// 10. 🔥 3사이클 랭킹 저장 및 정렬
export async function saveAndGetCycleRankings(cycleId: string, userName: string, score: number): Promise<RankingItem[]> {
  try {
    const rankDocId = `${cycleId}_${userName}`;
    const rankRef = doc(db, 'cycle_rankings', rankDocId);

    const existingSnap = await getDoc(rankRef);
    if (existingSnap.exists()) {
      const currentScore = existingSnap.data().score || 0;
      if (score >= currentScore) {
        await setDoc(rankRef, removeUndefinedDeep({
          cycleId,
          name: userName,
          score,
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }), { merge: true });
      }
    } else {
      await setDoc(rankRef, removeUndefinedDeep({
        cycleId,
        name: userName,
        score,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }));
    }

    return await getCycleRankings(cycleId);
  } catch (error) {
    console.error("saveAndGetCycleRankings Error:", error);
    return await getCycleRankings(cycleId);
  }
}

// 11. 특정 사이클 랭킹 불러오기
export async function getCycleRankings(cycleId: string): Promise<RankingItem[]> {
  try {
    const qQuery = query(collection(db, 'cycle_rankings'), where('cycleId', '==', cycleId));
    const snapshot = await getDocs(qQuery);

    const list: RankingItem[] = [];
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
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

      list.push({
        name: d.name,
        score: Number(d.score) || 0,
        completedAt: timeVal,
        completedAtFormatted
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

// 12. 전체 공용 DB 목록
export async function getAllSavedQuestions(): Promise<Record<string, Question[]>> {
  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    const grouped: Record<string, Question[]> = {};

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const diff = d.difficulty || '기타';
      if (!grouped[diff]) grouped[diff] = [];

      let dateStr = "";
      if (d.createdAt && typeof d.createdAt.toDate === 'function') {
        const dt = d.createdAt.toDate();
        dateStr = `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      }

      grouped[diff].push({
        id: docSnap.id,
        form: sanitizeForm(d.form),
        sentence: d.sentence,
        options: d.options,
        answer: d.answer,
        translation: d.translation,
        explanation: d.explanation,
        difficulty: diff,
        createdAt: dateStr
      });
    });

    return grouped;
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

// 👑 15-1. 관리자 권한 여부 확인 (이름, PIN, 이메일 다중 검증)
export function checkIsAdmin(user: Partial<UserProfile> | null | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  const name = (user.name || '').trim().toLowerCase();
  const email = (user.email || '').trim().toLowerCase();
  const pin = (user.pin || '').trim();

  return (
    name === 'admin' ||
    name === 'eungsookim' ||
    name === 'eungsoo' ||
    name === '뽀개마스터' ||
    name === '김응수' ||
    pin === '777777' ||
    pin === '7777' ||
    email === 'rladmdtn01010@gmail.com' ||
    email === 'rladmdtn010@gmail.com' ||
    email.includes('rladmdtn') ||
    email.includes('eungssoo')
  );
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

// 📢 15-5. 전체 사용자 대상 실시간 푸시 공지 발송
export async function sendGlobalAnnouncement(announcement: {
  title: string;
  content: string;
  badgeType: 'event' | 'notice' | 'update' | 'maintenance';
  rewardCoins?: number;
  authorName: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const col = collection(db, 'system_announcements');
    const newDoc = doc(col);
    const now = Date.now();

    const payload = removeUndefinedDeep({
      id: newDoc.id,
      title: announcement.title,
      content: announcement.content,
      badgeType: announcement.badgeType,
      rewardCoins: announcement.rewardCoins || 0,
      createdAt: now,
      expiresAt: now + (7 * 24 * 60 * 60 * 1000), // 7일 후 만료
      isActive: true,
      authorName: announcement.authorName,
      serverTime: serverTimestamp()
    });

    await setDoc(newDoc, payload);
    return { success: true, id: newDoc.id };
  } catch (e: any) {
    console.error("sendGlobalAnnouncement Error:", e);
    return { success: false, error: e.message || '공지 발송 실패' };
  }
}

// 📢 15-6. 활성화된 전체 공지 목록 조회
export async function getActiveAnnouncements(): Promise<PushAnnouncement[]> {
  try {
    const col = collection(db, 'system_announcements');
    const q = query(col, where('isActive', '==', true));
    const snap = await getDocs(q);

    const list: PushAnnouncement[] = [];
    snap.forEach(d => {
      const data = d.data();
      list.push({
        id: d.id,
        title: data.title,
        content: data.content,
        badgeType: data.badgeType || 'notice',
        rewardCoins: data.rewardCoins || 0,
        createdAt: data.createdAt || Date.now(),
        expiresAt: data.expiresAt,
        isActive: data.isActive ?? true,
        authorName: data.authorName || '관리자'
      });
    });

    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  } catch (e) {
    console.warn("getActiveAnnouncements Error:", e);
    return [];
  }
}

// 🎁 15-7. 공지 첨부 보상 수령 처리
export async function claimAnnouncementReward(userName: string, announcementId: string, coins: number): Promise<{ success: boolean; alreadyClaimed?: boolean }> {
  try {
    const claimKey = `claimed_announce_${userName}_${announcementId}`;
    if (localStorage.getItem(claimKey)) {
      return { success: false, alreadyClaimed: true };
    }

    if (coins > 0) {
      await addCoins(userName, coins);
    }
    localStorage.setItem(claimKey, 'true');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

// 👥 15-8. 관리자용 전체 유저 목록 조회
export async function getAllUsersList(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach(d => {
      const data = d.data();
      list.push({
        name: data.name || d.id,
        pin: data.pin || '****',
        coins: data.coins ?? 200,
        bookmarkLimit: data.bookmarkLimit ?? 50,
        avatar: data.avatar || '🦁',
        currentAvatarId: data.currentAvatarId || 'lion',
        unlockedAvatars: data.unlockedAvatars || STARTER_AVATAR_IDS,
        xp: data.xp || 0,
        tier: data.tier || calculateTier(data.xp || 0).tier,
        dailyGoal: data.dailyGoal || 10,
        totalSolved: data.totalSolved || 0,
        totalCorrect: data.totalCorrect || 0,
        email: data.email,
        photoURL: data.photoURL,
        isAdmin: data.isAdmin
      });
    });
    return list.sort((a, b) => (b.coins || 0) - (a.coins || 0));
  } catch (e) {
    console.error("getAllUsersList Error:", e);
    return [];
  }
}

// 🪙 15-9. 관리자 권한 유저 코인 직접 지급/차감
export async function adminUpdateUserCoins(targetUserName: string, amount: number): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', targetUserName);
    await updateDoc(userRef, {
      coins: amount
    });
    return true;
  } catch (e) {
    console.error("adminUpdateUserCoins Error:", e);
    return false;
  }
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

// 🎭 15-10. 랭킹전 가짜 플레이어 (더미 랭커) 자연스러운 데이터 주입
export async function adminInjectGhostRanking(payload: {
  cycleId: string;
  name: string;
  correctCount: number; // 0 ~ 10
  minutesAgo?: number; // 5 ~ 180분 전
}): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedName = payload.name.trim();
    if (!trimmedName) return { success: false, error: '플레이어 이름을 입력해 주세요.' };

    const score = Math.max(0, Math.min(10, payload.correctCount)) * 10;
    const rankDocId = `${payload.cycleId}_${trimmedName}`;
    const rankRef = doc(db, 'cycle_rankings', rankDocId);

    const minutes = payload.minutesAgo ?? (Math.floor(Math.random() * 80) + 10);
    const fakeCompletedAt = new Date(Date.now() - minutes * 60 * 1000);

    const docData = removeUndefinedDeep({
      cycleId: payload.cycleId,
      name: trimmedName,
      score,
      completedAt: fakeCompletedAt,
      updatedAt: serverTimestamp()
    });

    await setDoc(rankRef, docData);
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
