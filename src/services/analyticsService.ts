import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  Timestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { UserProfile } from '../types';

export interface UserActionLog {
  action: string;
  details?: string;
  timestamp: string; // ISO string for easy rendering
}

export interface UserAnalyticsSummary {
  userId: string;
  userName: string;
  authUid?: string;
  totalVisits: number;
  totalSolved: number;
  totalCorrect: number;
  rankingPlayedCount: number;
  expressionStudiedCount: number;
  gachaPullsCount: number;
  bookmarkCount: number;
  addToHomeClicks: number;
  isStandalone: boolean;
  platform: string;
  lastActiveAt?: any;
  firstSeenAt?: any;
  recentActions: UserActionLog[];
}

// 🌐 Helper to detect environment
function getClientEnvironment() {
  if (typeof window === 'undefined') return { platform: 'unknown', isStandalone: false };
  const ua = window.navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  
  let platform = 'Desktop Web';
  if (isIOS) platform = isStandalone ? 'iOS (홈화면 PWA)' : 'iOS (Safari/Web)';
  else if (isAndroid) platform = isStandalone ? 'Android (홈화면 PWA)' : 'Android (Chrome/Web)';
  else if (isStandalone) platform = 'Desktop PWA';

  return { platform, isStandalone };
}

/**
 * 📊 1. 유저 행동 이벤트 실시간 기록 및 누적 집계
 */
export async function trackUserAction(
  action: string,
  details: string = '',
  user?: UserProfile | null
) {
  try {
    const authUid = auth.currentUser?.uid || '';
    const userId = authUid || (user ? user.name : 'anonymous');
    const userName = user?.name || (auth.currentUser?.displayName || '게스트');
    
    if (!userId || userId === 'anonymous') return;

    const env = getClientEnvironment();
    const docRef = doc(db, 'user_analytics', userId);

    const newActionLog: UserActionLog = {
      action,
      details,
      timestamp: new Date().toISOString()
    };

    // Check if document exists
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      // Create new analytics doc
      const initialData: Partial<UserAnalyticsSummary> = {
        userId,
        userName,
        authUid,
        totalVisits: 1,
        totalSolved: action === 'SOLVE_COMPLETE' ? 10 : 0,
        totalCorrect: 0,
        rankingPlayedCount: action === 'RANKING_PLAY' ? 1 : 0,
        expressionStudiedCount: action === 'EXPRESSION_STUDY' ? 1 : 0,
        gachaPullsCount: action === 'GACHA_PULL' ? 1 : 0,
        bookmarkCount: action === 'BOOKMARK_ADD' ? 1 : 0,
        addToHomeClicks: action === 'ADD_TO_HOME_CLICK' ? 1 : 0,
        isStandalone: env.isStandalone,
        platform: env.platform,
        firstSeenAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        recentActions: [newActionLog]
      };
      await setDoc(docRef, initialData);
    } else {
      // Update existing analytics doc with increments
      const updates: any = {
        userName,
        authUid: authUid || snap.data()?.authUid || '',
        isStandalone: env.isStandalone,
        platform: env.platform,
        lastActiveAt: serverTimestamp()
      };

      if (action === 'VISIT' || action === 'LOGIN') {
        updates.totalVisits = increment(1);
      } else if (action === 'SOLVE_COMPLETE') {
        updates.totalSolved = increment(10);
      } else if (action === 'RANKING_PLAY') {
        updates.rankingPlayedCount = increment(1);
        updates.totalSolved = increment(10);
      } else if (action === 'EXPRESSION_STUDY') {
        updates.expressionStudiedCount = increment(1);
      } else if (action === 'GACHA_PULL') {
        updates.gachaPullsCount = increment(1);
      } else if (action === 'BOOKMARK_ADD') {
        updates.bookmarkCount = increment(1);
      } else if (action === 'ADD_TO_HOME_CLICK') {
        updates.addToHomeClicks = increment(1);
      }

      // Maintain up to 20 recent action logs
      const existingLogs: UserActionLog[] = snap.data()?.recentActions || [];
      const updatedLogs = [newActionLog, ...existingLogs].slice(0, 20);
      updates.recentActions = updatedLogs;

      await updateDoc(docRef, updates);
    }
  } catch (err) {
    // Fail silently so it never interrupts the learner's experience
    console.warn('Telemetry track error:', err);
  }
}

/**
 * 📊 2. 관리자 페이지용 전체 유저 행동 지표 목록 조회 (중복 사용자 완벽 병합)
 */
export async function getAllUserAnalytics(): Promise<UserAnalyticsSummary[]> {
  try {
    const colRef = collection(db, 'user_analytics');
    const q = query(colRef, orderBy('lastActiveAt', 'desc'), limit(150));
    const snap = await getDocs(q);

    const map = new Map<string, UserAnalyticsSummary>();

    snap.forEach((d) => {
      const data = d.data();
      const rawName = (data.userName || d.id).trim();
      const authUid = data.authUid || (d.id.length > 20 ? d.id : '');
      const dedupeKey = (rawName && rawName !== 'anonymous' && rawName !== '게스트') ? `name_${rawName}` : `uid_${authUid || d.id}`;

      const existing = map.get(dedupeKey) || (authUid ? map.get(`uid_${authUid}`) : null);

      const merged: UserAnalyticsSummary = {
        userId: d.id,
        userName: (rawName && rawName !== '게스트') ? rawName : (existing?.userName || rawName),
        authUid: authUid || existing?.authUid || '',
        totalVisits: (existing?.totalVisits || 0) + (data.totalVisits || 1),
        totalSolved: Math.max(existing?.totalSolved || 0, data.totalSolved || 0),
        totalCorrect: Math.max(existing?.totalCorrect || 0, data.totalCorrect || 0),
        rankingPlayedCount: Math.max(existing?.rankingPlayedCount || 0, data.rankingPlayedCount || 0),
        expressionStudiedCount: Math.max(existing?.expressionStudiedCount || 0, data.expressionStudiedCount || 0),
        gachaPullsCount: Math.max(existing?.gachaPullsCount || 0, data.gachaPullsCount || 0),
        bookmarkCount: Math.max(existing?.bookmarkCount || 0, data.bookmarkCount || 0),
        addToHomeClicks: Math.max(existing?.addToHomeClicks || 0, data.addToHomeClicks || 0),
        isStandalone: !!data.isStandalone || !!existing?.isStandalone,
        platform: data.platform && data.platform !== 'Web' ? data.platform : (existing?.platform || data.platform || 'Web'),
        lastActiveAt: data.lastActiveAt || existing?.lastActiveAt,
        firstSeenAt: existing?.firstSeenAt || data.firstSeenAt,
        recentActions: [...(data.recentActions || []), ...(existing?.recentActions || [])]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 25)
      };

      map.set(dedupeKey, merged);
      if (authUid) map.set(`uid_${authUid}`, merged);
      if (rawName) map.set(`name_${rawName}`, merged);
    });

    const uniqueList = Array.from(new Set(map.values()));
    return uniqueList.sort((a, b) => {
      const timeA = a.lastActiveAt?.toMillis ? a.lastActiveAt.toMillis() : 0;
      const timeB = b.lastActiveAt?.toMillis ? b.lastActiveAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('getAllUserAnalytics error:', err);
    return [];
  }
}
