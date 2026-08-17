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
import { addCoins, removeUndefinedDeep, adminUpdateQuestionEverywhere } from './dbService';

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
  isAnonymous?: boolean;
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

export const REPORT_TYPE_LABELS: Record<string, string> = {
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
    const q1 = query(collection(db, 'question_reports'), where('reporterName', '==', userName), where('dateStr', '==', today));
    const snap = await getDocs(q1);

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

// 2. 문제 오류 신고 제출 (Firestore 'question_reports' 및 'reports' 동시 안전 보관)
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
    const newDocRef = doc(collection(db, 'question_reports'));

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
      isAnonymous: true,
      reportType,
      userFeedback,
      status: 'pending',
      rewardClaimed: false,
      createdAt: serverTimestamp(),
      dateStr: today
    };

    const cleanData = removeUndefinedDeep(reportData);

    // 🔒 두 컬렉션에 동시 저장하여 규칙 차단 및 누락 0% 방어
    await Promise.allSettled([
      setDoc(newDocRef, cleanData),
      setDoc(doc(db, 'reports', newDocRef.id), cleanData)
    ]);

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
  const models = ['gemini-3.5-flash-lite', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];

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

// 5. 유저별 신고 내역 및 보상 수령 (question_reports & reports 양쪽 전수 조회)
export async function getUserReports(userName: string): Promise<QuestionReport[]> {
  try {
    const listMap = new Map<string, QuestionReport>();

    // 1) question_reports 조회
    try {
      const q1 = query(collection(db, 'question_reports'), where('reporterName', '==', userName));
      const snap1 = await getDocs(q1);
      snap1.forEach(d => {
        listMap.set(d.id, { id: d.id, ...d.data() } as QuestionReport);
      });
    } catch (e1) {
      console.warn("getUserReports q1 warn:", e1);
    }

    // 2) reports 조회 (하위 호환)
    try {
      const q2 = query(collection(db, 'reports'), where('reporterName', '==', userName));
      const snap2 = await getDocs(q2);
      snap2.forEach(d => {
        if (!listMap.has(d.id)) {
          listMap.set(d.id, { id: d.id, ...d.data() } as QuestionReport);
        }
      });
    } catch (e2) {
      console.warn("getUserReports q2 warn:", e2);
    }

    // 3) 로컬 백업 병합
    try {
      const local = JSON.parse(localStorage.getItem('user_reports') || '[]');
      local.forEach((r: QuestionReport) => {
        if (r.reporterName === userName && r.id && !listMap.has(r.id)) {
          listMap.set(r.id, r);
        }
      });
    } catch {}

    const list = Array.from(listMap.values());
    return list.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0));
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0));
      return timeB - timeA;
    });
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
    await Promise.allSettled([
      updateDoc(doc(db, 'question_reports', reportId), { rewardClaimed: true }),
      updateDoc(doc(db, 'reports', reportId), { rewardClaimed: true })
    ]);
    const newCoins = await addCoins(userName, rewardAmount);
    return { success: true, newCoins };
  } catch (e) {
    console.error("claimReportReward error:", e);
    return { success: false };
  }
}

// 7. 👑 관리자용 전체 신고 목록 조회 (question_reports 및 reports 전수 병합 조회)
export async function getPendingReports(): Promise<QuestionReport[]> {
  try {
    const listMap = new Map<string, QuestionReport>();

    // 1) question_reports 컬렉션 조회
    try {
      const snap1 = await getDocs(collection(db, 'question_reports'));
      snap1.forEach(d => {
        listMap.set(d.id, { id: d.id, ...d.data() } as QuestionReport);
      });
    } catch (e1) {
      console.warn("getPendingReports question_reports warn:", e1);
    }

    // 2) reports 컬렉션 조회 (하위 호환)
    try {
      const snap2 = await getDocs(collection(db, 'reports'));
      snap2.forEach(d => {
        if (!listMap.has(d.id)) {
          listMap.set(d.id, { id: d.id, ...d.data() } as QuestionReport);
        }
      });
    } catch (e2) {
      console.warn("getPendingReports reports warn:", e2);
    }

    // 3) 로컬 백업 병합
    try {
      const local = JSON.parse(localStorage.getItem('user_reports') || '[]');
      local.forEach((r: QuestionReport) => {
        if (r.id && !listMap.has(r.id)) {
          listMap.set(r.id, r);
        }
      });
    } catch {}

    const list = Array.from(listMap.values());
    return list.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0));
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0));
      return timeB - timeA;
    });
  } catch (e) {
    console.error("getPendingReports error:", e);
    return [];
  }
}

// 8. 👑 관리자 직접 승인 및 코인 즉시 지급 (+ 필요 시 AI 교정 문제 DB 자동 갱신)
export async function approveReportAndReward(
  reportId: string, 
  reporterName: string, 
  rewardCoins: number = 50, 
  reason: string = '관리자 사령탑 직접 승인',
  fixedQuestion?: Partial<Question>
): Promise<{ success: boolean }> {
  try {
    const updateData: any = {
      status: 'approved',
      rewardClaimed: true,
      auditResult: {
        isAccepted: true,
        reason,
        rewardCoins,
        fixedQuestion: fixedQuestion || null,
        auditedAt: Date.now()
      }
    };

    await Promise.allSettled([
      updateDoc(doc(db, 'question_reports', reportId), removeUndefinedDeep(updateData)),
      updateDoc(doc(db, 'reports', reportId), removeUndefinedDeep(updateData))
    ]);

    // 교정본이 있으면 questions DB 및 cycle_challenges 회차 DB에 전역 동시 반영!
    if (fixedQuestion) {
      await adminUpdateQuestionEverywhere(fixedQuestion as Question);
    }

    if (reporterName) {
      await addCoins(reporterName, rewardCoins);
    }
    return { success: true };
  } catch (e) {
    console.error("approveReportAndReward error:", e);
    return { success: false };
  }
}

// 9. 👑 관리자 직접 반려
export async function rejectReport(reportId: string, reason: string = '관리자 사령탑 직접 반려'): Promise<{ success: boolean }> {
  try {
    const updateData = {
      status: 'rejected',
      auditResult: {
        isAccepted: false,
        reason,
        rewardCoins: 0,
        auditedAt: Date.now()
      }
    };

    await Promise.allSettled([
      updateDoc(doc(db, 'question_reports', reportId), updateData),
      updateDoc(doc(db, 'reports', reportId), updateData)
    ]);
    return { success: true };
  } catch (e) {
    console.error("rejectReport error:", e);
    return { success: false };
  }
}

// 10. 🤖 관리자 전용: AI로 문제 선지/해설/정답 즉시 재구성 및 교정
export async function regenerateQuestionWithAI(params: {
  sentence: string;
  form?: number;
  currentAnswer?: string;
  userFeedback?: string;
}): Promise<{ success: boolean; question?: Question; error?: string }> {
  const models = ['gemini-3.5-flash-lite', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];
  
  const form = params.form && params.form >= 1 && params.form <= 5 ? params.form : 3;
  const sentence = params.sentence.trim();

  const prompt = `당신은 대한민국 최고의 수능/토익 영문법 1타 강사이자 출제위원장입니다.
제공된 영어 문장과 사용자 제보 피드백을 엄밀히 분석하여, 논란의 여지가 없는 100% 완벽한 4지선다 영문법 문제 객관식 JSON을 생성하세요.

[원문 정보]
- 문장: ${sentence}
- 문장 형식: ${form}형식
- 기존 정답: ${params.currentAnswer || '미정'}
- 제보된 피드백: ${params.userFeedback || '정답, 오답 보기, 한국어 해석, 해설을 문법 규칙에 완벽히 일치하도록 재구성해 주세요.'}

[🚨 필수 출제 및 일치 원칙]
1. sentence 의 빈칸은 반드시 '______' (언더스코어 6개)로 표기하세요.
2. options 배열에 정확히 4개의 보기 객체를 넣으세요.
   - 오직 1개 항목만 is_correct: true 로 지정하고, 나머지 3개는 is_correct: false 로 지정하세요.
   - 각 보기의 feedback 필드에 해당 보기가 정답인 이유 또는 오답인 문법적 이유를 1타 강사 수준으로 명확히 작성하세요.
3. answer 필드에는 1, 2 같은 번호가 아니라 '정답 영어 텍스트 그 자체'를 정확하게 넣으세요.
4. translation: 자연스럽고 정확한 한국어 해석을 작성하세요.
5. explanation:
   - chunk_pattern: 문장의 핵심 문법 패턴/청크 정리
   - nuance: 원어민 실전 뉘앙스 및 쓰임새 해설`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          form: { type: "INTEGER" },
          sentence: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                text: { type: "STRING" },
                is_correct: { type: "BOOLEAN" },
                feedback: { type: "STRING" }
              },
              required: ["text", "is_correct", "feedback"]
            }
          },
          answer: { type: "STRING" },
          translation: { type: "STRING" },
          explanation: {
            type: "OBJECT",
            properties: {
              chunk_pattern: { type: "STRING" },
              nuance: { type: "STRING" }
            },
            required: ["chunk_pattern", "nuance"]
          }
        },
        required: ["form", "sentence", "options", "answer", "translation", "explanation"]
      },
      temperature: 0.2
    }
  };

  for (const model of models) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        const { normalizeAndFixQuestion } = await import('./geminiService');
        const fixed = normalizeAndFixQuestion({
          ...parsed,
          id: `ai_repaired_${Date.now()}`
        });
        return { success: true, question: fixed };
      }
    } catch (e: any) {
      console.warn(`regenerateQuestionWithAI error with ${model}:`, e);
    }
  }

  return { success: false, error: 'AI 문제 재구성 생성에 실패했습니다. 다시 시도해 주세요.' };
}

// ==========================================
// 💌 10. 유저 1:1 문의 / 피드백 / 제안 시스템
// ==========================================

export interface UserInquiry {
  id?: string;
  userName: string;
  userEmail?: string;
  category: 'idea' | 'bug' | 'question' | 'cheer' | 'other';
  message: string;
  status?: 'new' | 'read' | 'resolved';
  createdAt?: any;
  dateStr?: string;
}

export const INQUIRY_CATEGORIES = [
  { id: 'idea', label: '💡 기능 제안 / 아이디어', desc: '새로운 기능이나 개선 바라는 점' },
  { id: 'bug', label: '🐛 버그 / 오류 제보', desc: '화면 깨짐이나 오작동 현상' },
  { id: 'question', label: '❓ 이용 문의 / 질문', desc: '게임 방법이나 계정 관련 질문' },
  { id: 'cheer', label: '❤️ 응원 / 피드백', desc: '개발자에게 전하는 따뜻한 한마디' }
] as const;

export async function submitUserInquiry(
  userName: string,
  category: 'idea' | 'bug' | 'question' | 'cheer' | 'other',
  message: string,
  userEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const colRef = collection(db, 'user_inquiries');
    const newDoc = doc(colRef);

    const inquiryData: UserInquiry = {
      id: newDoc.id,
      userName: userName || '익명 학습자',
      userEmail: userEmail || '',
      category,
      message,
      status: 'new',
      createdAt: serverTimestamp(),
      dateStr: today
    };

    await setDoc(newDoc, removeUndefinedDeep(inquiryData));
    return { success: true };
  } catch (e: any) {
    console.error("submitUserInquiry error:", e);
    return { success: false, error: e.message || "문의 접수에 실패했습니다." };
  }
}

export async function getAllUserInquiries(): Promise<UserInquiry[]> {
  try {
    const colRef = collection(db, 'user_inquiries');
    const snap = await getDocs(colRef);
    const list: UserInquiry[] = [];
    snap.forEach(d => {
      const data = d.data() as UserInquiry;
      list.push({ ...data, id: d.id });
    });
    list.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : typeof a.createdAt === 'number' ? a.createdAt : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : typeof b.createdAt === 'number' ? b.createdAt : 0;
      return bTime - aTime;
    });
    return list;
  } catch (e) {
    console.error("getAllUserInquiries error:", e);
    return [];
  }
}

export async function deleteUserInquiry(inquiryId: string): Promise<boolean> {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'user_inquiries', inquiryId));
    return true;
  } catch (e) {
    console.error("deleteUserInquiry error:", e);
    return false;
  }
}
