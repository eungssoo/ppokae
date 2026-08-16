import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Question, UserProfile } from '../types';
import { callGeminiProxy } from './geminiService';
import { addCoins, removeUndefinedDeep } from './dbService';

export interface QuestionReport {
  id?: string;
  questionId?: string;
  questionSentence: string;
  questionForm: number;
  questionAnswer: string;
  questionOptions: any[];
  questionTranslation: string;
  questionExplanation: any;
  difficulty?: string;
  
  reporterName: string;
  reportType: 'wrong_answer' | 'awkward_explanation' | 'typo' | 'translation_error' | 'other';
  userFeedback: string;
  
  status: 'pending' | 'approved' | 'rejected';
  auditResult?: {
    isAccepted: boolean;
    reason: string;
    fixedQuestion?: Partial<Question>;
    rewardCoins: number;
    auditedAt: number;
  };
  rewardClaimed?: boolean;
  createdAt: any;
  dateStr: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  wrong_answer: '정답 및 오답 보기 오류',
  awkward_explanation: '해설 내용이 어색하거나 불명확함',
  typo: '문장 내 오탈자 및 철자 오류',
  translation_error: '한국어 해석 및 뉘앙스 오류',
  other: '기타 개선 의견'
};

// 1. 일일 신고 접수 가능 횟수 확인 (하루 최대 10개 제한)
export async function checkDailyReportLimit(userName: string): Promise<{ canReport: boolean; count: number; maxCount: number }> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const reportsCol = collection(db, 'reports');
    const q = query(reportsCol, where('reporterName', '==', userName), where('dateStr', '==', today));
    const snap = await getDocs(q);

    const count = snap.size;
    const maxCount = 10;

    return {
      canReport: count < maxCount,
      count,
      maxCount
    };
  } catch (e) {
    console.error("checkDailyReportLimit error:", e);
    return { canReport: true, count: 0, maxCount: 10 };
  }
}

// 2. 문제 오류 신고 제출 (Firestore 'reports' 컬렉션에 영구 보관)
export async function submitQuestionReport(
  userName: string,
  question: Question,
  reportType: 'wrong_answer' | 'awkward_explanation' | 'typo' | 'translation_error' | 'other',
  userFeedback: string
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const limit = await checkDailyReportLimit(userName);
    if (!limit.canReport) {
      return { 
        success: false, 
        error: `하루 최대 신고 한도(${limit.maxCount}건)를 초과했습니다. 내일 다시 제보해 주세요!` 
      };
    }

    const today = new Date().toISOString().slice(0, 10);
    const reportsCol = collection(db, 'reports');
    const newDocRef = doc(reportsCol);

    const reportData: QuestionReport = {
      id: newDocRef.id,
      questionId: question.id || '',
      questionSentence: question.sentence,
      questionForm: question.form,
      questionAnswer: question.answer,
      questionOptions: question.options,
      questionTranslation: question.translation,
      questionExplanation: question.explanation,
      difficulty: question.difficulty || 'Level 1',
      reporterName: userName,
      reportType,
      userFeedback,
      status: 'pending',
      rewardClaimed: false,
      createdAt: serverTimestamp(),
      dateStr: today
    };

    await setDoc(newDocRef, removeUndefinedDeep(reportData));

    // Save locally as backup
    try {
      const localReports = JSON.parse(localStorage.getItem('user_reports') || '[]');
      localReports.unshift({ ...reportData, createdAt: Date.now() });
      localStorage.setItem('user_reports', JSON.stringify(localReports.slice(0, 30)));
    } catch {}

    return { success: true, reportId: newDocRef.id };
  } catch (error: any) {
    console.error("submitQuestionReport Error:", error);
    return { success: false, error: error.message || "신고 접수 중 오류가 발생했습니다." };
  }
}

// 3. 🤖 AI 깐깐한 심층 검수 엔진 (Gemini 2.5 Flash를 통한 4단계 정밀 심사)
export async function auditReportWithAI(report: QuestionReport): Promise<{
  success: boolean;
  isAccepted: boolean;
  reason: string;
  fixedQuestion?: Question;
  rewardCoins: number;
}> {
  const models = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-3-flash-preview'];

  const auditPrompt = `당신은 대한민국 최고 권위의 수능/토익 영문법 출제위원장이자 엄격한 문제 검수관입니다.
사용자가 제보한 다음 영문법 문제의 오류 신고를 정밀하게 4단계로 심사하세요.

[현재 출제된 원본 문제]
- 문장: ${report.questionSentence}
- 문장 형식: ${report.questionForm}형식
- 정답: ${report.questionAnswer}
- 보기 목록: ${JSON.stringify(report.questionOptions)}
- 한국어 해석: ${report.questionTranslation}
- 해설: ${JSON.stringify(report.questionExplanation)}

[사용자 오류 제보 내용]
- 제보 유형: ${REPORT_TYPE_LABELS[report.reportType] || report.reportType}
- 제보 상세 의견: "${report.userFeedback}"

[🚨 깐깐한 심사 기준 및 채택 조건]
1. [기각 조건]: 
   - 현재 문제가 영문법 표준 규범 및 사전적 용례에 완벽히 부합하고, 사용자의 단순 오해나 착각인 경우 반드시 'isAccepted: false'로 기각하고 상세한 문법적 근거(왜 현재 문제가 맞는지)를 친절하고 명쾌하게 설명하세요.
2. [채택 및 자동 수정 조건]:
   - 만약 오타, 복수 정답 가능성, 한국어 번역 비문, 5형식 형식 분류 오류, 보기 해설 오류 등 실질적인 결함이 명백하다면 'isAccepted: true'로 채택하고, 완벽하게 교정된 수정본 문제(fixedQuestion)를 작성하세요.
   - 교정 시 1~5형식 준수, 100% 한국어 상세 해설, 단 1개의 유일 정답 원칙을 철저히 지키세요.

JSON 응답 형식:
{
  "isAccepted": boolean, // 채택 여부 (true면 문제 수정 및 코인 지급, false면 기각)
  "reason": string, // 심사 결과에 대한 명쾌한 한국어 근거 설명 (3~5문장)
  "rewardCoins": number, // 채택 시 50, 기각 시 0
  "fixedQuestion": { // isAccepted가 true일 때만 작성, false면 null
    "form": number,
    "sentence": string,
    "options": [
      { "text": string, "is_correct": boolean, "feedback": string }
    ],
    "answer": string,
    "translation": string,
    "explanation": {
      "chunk_pattern": string,
      "nuance": string
    }
  }
}`;

  const payload = {
    contents: [{ parts: [{ text: auditPrompt }] }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  let lastError = "";

  for (const model of models) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed = JSON.parse(rawText);

      return {
        success: true,
        isAccepted: !!parsed.isAccepted,
        reason: parsed.reason || "검수가 완료되었습니다.",
        fixedQuestion: parsed.fixedQuestion || undefined,
        rewardCoins: parsed.isAccepted ? (parsed.rewardCoins || 50) : 0
      };
    } catch (e: any) {
      console.warn(`Audit error with ${model}:`, e);
      lastError = e.message;
    }
  }

  return {
    success: false,
    isAccepted: false,
    reason: `AI 검수 엔진 호출 실패: ${lastError}`,
    rewardCoins: 0
  };
}

// 4. 🌙 야간 00시 일괄 자동 검수 시뮬레이터 (최대 10문제 순차 심사 및 DB 자동 갱신)
export async function runNightlyAuditBatch(limitCount: number = 10): Promise<{
  auditedCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRewardCoins: number;
  results: QuestionReport[];
}> {
  try {
    const reportsCol = collection(db, 'reports');
    const q = query(reportsCol, where('status', '==', 'pending'));
    const snap = await getDocs(q);

    const pendingReports: QuestionReport[] = [];
    snap.forEach(d => {
      pendingReports.push({ id: d.id, ...d.data() } as QuestionReport);
    });

    const targetList = pendingReports.slice(0, limitCount);
    let approved = 0;
    let rejected = 0;
    let totalCoins = 0;
    const finalResults: QuestionReport[] = [];

    for (const rep of targetList) {
      const audit = await auditReportWithAI(rep);
      
      const updatedStatus = audit.isAccepted ? 'approved' : 'rejected';
      const updatedAuditResult = {
        isAccepted: audit.isAccepted,
        reason: audit.reason,
        fixedQuestion: audit.fixedQuestion,
        rewardCoins: audit.rewardCoins,
        auditedAt: Date.now()
      };

      if (audit.isAccepted) {
        approved++;
        totalCoins += audit.rewardCoins;

        // 원본 문제가 Firestore에 있으면 즉시 교정 업데이트
        if (rep.questionId && audit.fixedQuestion) {
          try {
            const qDocRef = doc(db, 'questions', rep.questionId);
            await updateDoc(qDocRef, {
              ...audit.fixedQuestion,
              updatedAt: serverTimestamp()
            });
          } catch (e) {
            console.warn("Update original question error:", e);
          }
        }
      } else {
        rejected++;
      }

      // Update Report document
      if (rep.id) {
        const repRef = doc(db, 'reports', rep.id);
        await updateDoc(repRef, {
          status: updatedStatus,
          auditResult: updatedAuditResult
        });
      }

      finalResults.push({
        ...rep,
        status: updatedStatus,
        auditResult: updatedAuditResult
      });
    }

    return {
      auditedCount: targetList.length,
      approvedCount: approved,
      rejectedCount: rejected,
      totalRewardCoins: totalCoins,
      results: finalResults
    };
  } catch (e) {
    console.error("runNightlyAuditBatch error:", e);
    return {
      auditedCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      totalRewardCoins: 0,
      results: []
    };
  }
}

// 5. 유저별 신고 내역 및 보상 수령
export async function getUserReports(userName: string): Promise<QuestionReport[]> {
  try {
    const reportsCol = collection(db, 'reports');
    const q = query(reportsCol, where('reporterName', '==', userName));
    const snap = await getDocs(q);

    const list: QuestionReport[] = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...d.data() } as QuestionReport);
    });

    return list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  } catch (e) {
    console.warn("getUserReports error, fallback to local:", e);
    try {
      const local = JSON.parse(localStorage.getItem('user_reports') || '[]');
      return local.filter((r: QuestionReport) => r.reporterName === userName);
    } catch {
      return [];
    }
  }
}

// 6. 채택된 보상 코인(🪙 50) 수령하기
export async function claimReportReward(reportId: string, userName: string, rewardAmount: number): Promise<{ success: boolean; newCoins?: number }> {
  try {
    const repRef = doc(db, 'reports', reportId);
    await updateDoc(repRef, { rewardClaimed: true });
    const newCoins = await addCoins(userName, rewardAmount);
    return { success: true, newCoins };
  } catch (e) {
    console.error("claimReportReward error:", e);
    return { success: false };
  }
}

// 7. 👑 관리자용 전체 신고 목록 조회
export async function getPendingReports(): Promise<QuestionReport[]> {
  try {
    const reportsCol = collection(db, 'reports');
    const snap = await getDocs(reportsCol);
    const list: QuestionReport[] = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...d.data() } as QuestionReport);
    });
    return list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  } catch (e) {
    console.error("getPendingReports error:", e);
    return [];
  }
}

// 8. 👑 관리자 직접 승인 및 코인 즉시 지급
export async function approveReportAndReward(
  reportId: string, 
  reporterName: string, 
  rewardCoins: number = 50, 
  reason: string = '관리자 사령탑 직접 승인'
): Promise<{ success: boolean }> {
  try {
    const repRef = doc(db, 'reports', reportId);
    await updateDoc(repRef, {
      status: 'approved',
      rewardClaimed: true,
      auditResult: {
        isAccepted: true,
        reason,
        rewardCoins,
        auditedAt: Date.now()
      }
    });
    await addCoins(reporterName, rewardCoins);
    return { success: true };
  } catch (e) {
    console.error("approveReportAndReward error:", e);
    return { success: false };
  }
}

// 9. 👑 관리자 직접 반려
export async function rejectReport(reportId: string, reason: string = '관리자 사령탑 직접 반려'): Promise<{ success: boolean }> {
  try {
    const repRef = doc(db, 'reports', reportId);
    await updateDoc(repRef, {
      status: 'rejected',
      auditResult: {
        isAccepted: false,
        reason,
        rewardCoins: 0,
        auditedAt: Date.now()
      }
    });
    return { success: true };
  } catch (e) {
    console.error("rejectReport error:", e);
    return { success: false };
  }
}
