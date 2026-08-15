import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, serverTimestamp, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyClxA4i0G4ATpxLrJ3uSNmVFsS_Qs9U-Wk",
  authDomain: "daybreak-72ea7.firebaseapp.com",
  projectId: "daybreak-72ea7",
  storageBucket: "daybreak-72ea7.firebasestorage.app",
  messagingSenderId: "452098908230",
  appId: "1:452098908230:web:e8c32ae4f68893cf5baa47",
  measurementId: "G-CJB2MJKT27"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const GEMINI_API_KEY = "AIzaSyDtDBLE5hjD8gJzAheQttUxWyNv5JwJ1mo";

const LEVEL_RULES = {
  'Level 1 (입문/초급)': `
- 대상: 중학 2~3학년 기초 수준 (단문 7~10단어)
- 문법 범위:
  1) be동사 및 일반동사의 3인칭 단수 현재 수일치 (he/she/it + -s/-es)
  2) 명백한 시간 단서가 포함된 과거/현재/미래 시제 (yesterday, last night, every day, tomorrow 등 필수 포함)
  3) 기본 조동사 (can, must, should + 동사원형)
  4) 기본 to부정사 및 동명사 목적어 (want to-V, enjoy -ing)
  5) 1~3형식 기본 문형`,

  'Level 2 (실력 중급)': `
- 대상: 고교 1~2학년 수준 (복문 10~15단어)
- 문법 범위:
  1) 관계대명사(who, which, that, whose, what) 및 관계부사(where, when, why)
  2) 5형식 목적격 보어 (사역동사 make/have/let + 원형, 지각동사 see/hear + 원형/-ing, 일반동사 allow/encourage/ask + to-V)
  3) 수동태 (be + p.p., 조동사 + be p.p.)
  4) 현재완료 시제 (since + 과거시점, for + 기간)
  5) 접속사 vs 전치사 구별 (although vs despite, because vs because of, while vs during)
  6) 감정 분사형용사 (interesting vs interested, confusing vs confused)`,

  'Level 3 (고득점 도약)': `
- 대상: 고3 수능 / 모의고사 수준 (긴 복문 14~20단어)
- 문법 범위:
  1) 분사구문 (능동 -ing, 수동 p.p., Having p.p., 접속사 생략/유지)
  2) 가정법 (가정법 과거 If S had/were..., 가정법 과거완료 If S had p.p...., 혼합가정법, without/but for)
  3) 도치 구문 (부정어 도치 Never/Hardly/Seldom + 조동사 + S + V, Only 부사구 도치)
  4) 주장/제안/요구/명령 동사 (insist, suggest, demand, require, recommend + that + S + (should) 동사원형)
  5) 복합관계대명사/부사 (whoever, whomever, whatever, wherever, however)`,

  'Level 4 (실전 마스터)': `
- 대상: 토익 850+ / 편입 / 공무원 영어 수준 (전문/학술/비즈니스 16~25단어)
- 문법 범위:
  1) 고급 접속사 및 전치사구 (provided that, as long as, in the event that, so that, given that)
  2) 어휘와 품사 자리가 결합된 구조 분석 문제 (명사/형용사/부사/동사 파생어 자리 채우기)
  3) 병렬 구조 (not only A but also B, either A or B, neither A nor B)
  4) 특수 가정법 및 도치 (Had it not been for, Were it not for, Should you have any questions)
  5) 동명사 및 부정사 관용 표현 (have difficulty -ing, look forward to -ing, be committed to -ing)`
};

function sanitizeForm(form) {
  const num = parseInt(String(form), 10);
  if (!isNaN(num) && num >= 1 && num <= 5) {
    return num;
  }
  return 3;
}

async function generateLevelQuestions(levelLabel, rubric) {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  
  const systemPrompt = `당신은 대한민국 최고의 수능/토익 영문법 1타 강사 및 출제위원장입니다.
제시된 난이도 규칙에 맞춰 객관식 4지선다 영문법 문제를 정확히 15개 생성하세요.

[🚨 절대 위반 불가 4대 출제 원칙]
1. [100% 한국어 상세 해설 의무화]
   - 모든 보기별 해설(feedback), 청크 설명(chunk_pattern), 뉘앙스(nuance), 한국어 번역(translation)은 반드시 100% 자연스럽고 친절하며 명쾌한 한국어로 작성하세요.
   - 각 보기가 왜 오답인지(예: '주어가 3인칭 단수이므로 동사원형은 수일치 위반'), 왜 정답인지 문법적 이유를 한국어로 상세히 설명하세요.
2. [문장 형식 엄격 제한 - 오직 1, 2, 3, 4, 5형식만 허용]
   - 'form' 필드는 반드시 한국의 전통 5형식 문형(1=1형식 S+V, 2=2형식 S+V+C, 3=3형식 S+V+O, 4=4형식 S+V+IO+DO, 5=5형식 S+V+O+OC)에 따라 숫자 1, 2, 3, 4, 5 중 하나만 입력해야 합니다.
   - 9형식, 12형식, 13형식 같은 문법 챕터 번호나 5를 초과하는 숫자는 절대 입력 금지입니다!
3. [복수 정답 원천 차단 - 문맥/시간 단서 의무화]
   - 시제 관련 문제에는 반드시 'yesterday', 'every morning', 'since 2021', 'right now', 'last night', 'tomorrow' 등 명백한 시간 부사어/문맥을 포함하세요.
   - 시간 단서 없이 'He _____ her a flower (sends / sent)' 처럼 시제에 따라 둘 다 정답이 되는 애매한 문제는 절대 출제 금지입니다!
4. [단 1개의 수학적 유일 정답 & 명백한 오답]
   - 정답은 오직 1개여야 하며, 나머지 3개 오답 보기는 해당 빈칸에 넣었을 때 문법적으로 100% 명백한 오류(비문)여야 합니다.`;

  const userPrompt = `난이도: ${levelLabel}\n[출제 기준]\n${rubric}\n정확히 15개 4지선다 객관식 생성. 빈칸은 '____'. 보기별 한국어 feedback, explanation(chunk_pattern, nuance 한국어) 필수. form은 1~5 정수.`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
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
        }
      }
    }
  };

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn(`Model ${model} error:`, data);
        continue;
      }

      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) continue;

      return JSON.parse(raw);
    } catch (e) {
      console.warn(`Model ${model} exception:`, e.message);
    }
  }

  throw new Error(`Failed to generate questions for ${levelLabel}`);
}

async function main() {
  console.log('🧹 1. Cleaning old questions & cached cycle challenges from Firestore...');
  const oldSnap = await getDocs(collection(db, 'questions'));
  const batch1 = writeBatch(db);
  oldSnap.forEach(d => batch1.delete(d.ref));
  await batch1.commit();
  console.log(`Deleted ${oldSnap.size} old questions.`);

  const cycleSnap = await getDocs(collection(db, 'cycle_challenges'));
  const batch2 = writeBatch(db);
  cycleSnap.forEach(d => batch2.delete(d.ref));
  await batch2.commit();
  console.log(`Deleted ${cycleSnap.size} cached cycle challenges.`);

  console.log('\n🚀 2. Generating 100% Korean Detailed Feedback Unambiguous Questions (15 per level)...');
  for (const [levelLabel, rubric] of Object.entries(LEVEL_RULES)) {
    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Generating 15 questions for [${levelLabel}] (Attempt ${attempt})...`);
        const questions = await generateLevelQuestions(levelLabel, rubric);
        console.log(`Got ${questions.length} questions. Saving...`);

        const batch = writeBatch(db);
        const qCol = collection(db, 'questions');
        for (const q of questions) {
          const ref = doc(qCol);
          batch.set(ref, {
            difficulty: levelLabel,
            form: sanitizeForm(q.form),
            sentence: q.sentence,
            options: q.options || [],
            answer: q.answer,
            translation: q.translation,
            explanation: q.explanation || { chunk_pattern: '기본 문형', nuance: '자연스러운 표현' },
            createdAt: serverTimestamp()
          });
        }
        await batch.commit();
        console.log(`✅ Successfully saved [${levelLabel}]`);
        success = true;
        break;
      } catch (e) {
        console.error(`Attempt ${attempt} failed on [${levelLabel}]:`, e.message);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  const finalSnap = await getDocs(collection(db, 'questions'));
  console.log(`\n🎉 Reseed Complete! Total validated 100% Korean questions in Firestore: ${finalSnap.size}`);
}

main();
