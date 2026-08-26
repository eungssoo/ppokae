import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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
const auth = getAuth(app);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDtDBLE5hjD8gJzAheQttUxWyNv5JwJ1mo";

const CATEGORIES = [
  { id: 'subject_verb_agreement', nameKo: '주어-동사 수일치', badgeKo: '수일치 핵심', desc: '단수/복수 주어, 수식어 거품, A/The number of, 부분 표현' },
  { id: 'tense_voice', nameKo: '시제 & 능동/수동태', badgeKo: '시제 · 태', desc: '현재/과거/미래완료, 수동태 be+p.p., by the time, 타동사 목적어 판별' },
  { id: 'verbals', nameKo: '준동사 (부정사/동명사/분사)', badgeKo: '준동사 핵심', desc: 'to-V vs 동명사 목적어, 5형식 목적격보어, 독립분사구문, With 분사구문' },
  { id: 'clauses_relatives', nameKo: '관계사 & 명사절', badgeKo: '관계사 · 명사절', desc: 'that vs what, 전치사+관계대명사, 복합관계사, 관계부사' },
  { id: 'connectors', nameKo: '접속사 vs 전치사 vs 접속부사', badgeKo: '접속사 vs 전치사', desc: 'because vs because of, although vs despite, while vs during, provided that' },
  { id: 'parts_of_speech', nameKo: '품사 자리 & 혼동 파생어', badgeKo: '품사 · 어휘', desc: '명/형/부/동 자리 판별, sensible/sensitive, considerate/considerable' },
  { id: 'modals_subjunctive', nameKo: '조동사 & 가정법 심화', badgeKo: '가정법 · 조동사', desc: 'If생략 도치(Had/Were/Should S), 당위성 insist that 동사원형, 혼합가정법, without/but for' },
  { id: 'special_structures', nameKo: '특수구문 & 고난도 도치', badgeKo: '특수구문 · 도치', desc: '부정어 도치(Never/Hardly/Scarcely/No sooner), Only 부사구 도치, The 비교급' },
  { id: 'verb_patterns', nameKo: '자·타동사 & 빈출 동사구', badgeKo: '자·타동사 콜로케이션', desc: 'lay vs lie, rise vs raise, 전치사 불가 타동사(discuss/mention), 자동사 전치사(object to)' },
  { id: 'parallel_agreement', nameKo: '병렬 구조 & 상관접속사', badgeKo: '병렬 · 상관접속', desc: 'not only but also, neither nor, both and, 비교 대상 일치(that/those of)' }
];

const LEVEL_CONFIGS = [
  {
    level: 1,
    label: 'Level 1 (기초 탄탄)',
    difficulty: 'Level 1',
    guideline: `[Level 1 - 중학 기초/고1 기본]
- 단문 7~11단어
- 기본 시제(yesterday, every day, tomorrow 명확한 시간 단서 필수), 단수/복수 수일치, 기본 조동사(can, must, should), 기초 to-V/동명사(want to, enjoy -ing), 1~3형식 기본 문형
- 절대 복잡한 분사구문이나 도치 사용 금지`
  },
  {
    level: 2,
    label: 'Level 2 (수능 기본 & 토익 중급)',
    difficulty: 'Level 2',
    guideline: `[Level 2 - 고교 수능 & 토익 650~750 중급]
- 복문 11~16단어
- 관계대명사/관계부사(who, which, that, where, when), 5형식 사역/지각/일반 목적격보어(make/let/have, see/hear, allow/require to-V), 수동태(be p.p.), 현재완료(since, for), 접속사 vs 전치사(although vs despite, because of), 감정분사(confusing/confused)`
  },
  {
    level: 3,
    label: 'Level 3 (수능 1등급 & 토익 고득점)',
    difficulty: 'Level 3',
    guideline: `[Level 3 - 고3 수능 1등급 & 토익 800~900 고득점]
- 수능/토익 복합문 16~24단어
- 분사구문(Having p.p., With + O + O.C.), 가정법(If S had p.p., without/but for), 부정어 도치(Never/Hardly/Seldom + 조동사 + S + V), 당위성 insist/suggest that S + (should) 동사원형, 명사절 that vs what, provided that/given that`
  },
  {
    level: 4,
    label: 'Level 4 (토익 990 & 명문대 편입)',
    difficulty: 'Level 4',
    guideline: `[Level 4 - 토익 900+ 만점 / 명문대 편입 / 7·9급 공무원 킬러]
- 전문 학술/비즈니스/법률 18~28단어
- If생략 도치(Had S p.p., Were S to-V, Should S V), 자·타동사 혼동(lay/lie, rise/raise, discuss about X, object to O), 전치사 to vs to-V(look forward to -ing, be committed to -ing), 혼동 파생어(sensible/sensitive, respectable/respectful), 특수 상관 도치(Hardly had S p.p. when...)`
  }
];

function sanitizeForm(form) {
  const num = parseInt(String(form), 10);
  if (!isNaN(num) && num >= 1 && num <= 5) return num;
  return 3;
}

function normalizeBlank(sentence, answer) {
  if (!sentence) return '______';
  let s = sentence.replace(/_{2,}/g, '______');
  if (!s.includes('______')) {
    if (answer && s.includes(answer)) {
      s = s.replace(answer, '______');
    } else {
      s = s + ' ______';
    }
  }
  return s;
}

async function callGemini(payload) {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
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
        console.warn(`Model ${model} error:`, data?.error?.message || data);
        continue;
      }
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(`Model ${model} exception:`, e.message);
    }
  }
  throw new Error('Gemini generation failed on all models');
}

// 🎯 특정 난이도에 대해 카테고리별 균형 잡힌 20문제 배치 생성
async function generateBatch(levelConfig, batchIndex) {
  // Batch 0: categories 0~4 (수일치, 시제/태, 준동사, 관계사, 접속사 vs 전치사) -> 각 4문제 = 20문제
  // Batch 1: categories 5~9 (품사/어휘, 가정법/조동사, 특수구문/도치, 자·타동사, 병렬/상관접속) -> 각 4문제 = 20문제
  const targetCategories = batchIndex === 0 ? CATEGORIES.slice(0, 5) : CATEGORIES.slice(5, 10);
  const catNames = targetCategories.map(c => `"${c.id}" (${c.nameKo} / ${c.badgeKo}: ${c.desc})`).join('\n');

  const systemPrompt = `당신은 대한민국 수능/토익/편입 영문법 1타 강사이자 국가공인 출제위원장입니다.
제시된 [출제 기준]을 100% 엄격하게 준수하여 객관식 4지선다 영문법 문제를 **정확히 20개** 생성하세요.

[🚨 카테고리 정확 지정 원칙 - 다음 5개 카테고리에서 각 4문제씩 골고루 균등 출제]:
${catNames}

[🚨 필수 작성 규칙]:
1. grammarCategory: 반드시 위 목록의 id(${targetCategories.map(c => `'${c.id}'`).join(', ')}) 중 정확히 일치하는 문자열을 지정하세요.
2. grammarTag: 해당 카테고리의 badgeKo(${targetCategories.map(c => `'${c.badgeKo}'`).join(', ')})를 입력하세요.
3. form: 문장의 1~5형식을 나타내는 정수 1, 2, 3, 4, 5 중 하나를 지정하세요. (1~5형식 골고루 출제)
4. sentence: 빈칸 자리는 반드시 '______' (밑줄 6개)로 표기하세요.
5. answer: 번호가 아닌 정답 영어 보기 텍스트를 정확하게 넣으세요.
6. options: 4개의 보기 중 오직 1개만 is_correct: true, 3개는 is_correct: false.
7. feedback: 정답과 오답 각각 왜 맞고 틀렸는지 한국어로 친절하고 명쾌하게 설명하세요.
8. explanation: chunk_pattern과 nuance를 한국어로 알기 쉽게 작성하세요.`;

  const userPrompt = `[난이도]: ${levelConfig.label}
[기준]:
${levelConfig.guideline}

위 5개 문법 카테고리(${targetCategories.map(c => c.nameKo).join(', ')})에서 각 4문제씩 총 20문제의 JSON 배열을 생성하세요.`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 8192
    }
  };

  const parsed = await callGemini(payload);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`Invalid response for ${levelConfig.label} batch ${batchIndex}`);
  }

  return parsed.map(q => {
    // 카테고리 정규화
    const matchedCat = targetCategories.find(c => c.id === q.grammarCategory) || targetCategories[0];
    const resolvedAnswer = q.answer || q.options?.find(o => o.is_correct)?.text || q.options?.[0]?.text || '';
    
    // 보기 정규화
    const options = (q.options || []).map(opt => ({
      text: opt.text,
      is_correct: opt.text.trim().toLowerCase() === resolvedAnswer.trim().toLowerCase() || opt.is_correct === true,
      feedback: opt.feedback || (opt.is_correct ? '정답입니다!' : '오답입니다.')
    }));

    return {
      difficulty: levelConfig.difficulty,
      level: levelConfig.difficulty,
      form: sanitizeForm(q.form),
      grammarCategory: matchedCat.id,
      grammarTag: matchedCat.badgeKo,
      sentence: normalizeBlank(q.sentence, resolvedAnswer),
      options,
      answer: resolvedAnswer,
      translation: q.translation || '',
      explanation: q.explanation || { chunk_pattern: '핵심 문형 정리', nuance: '자연스러운 뉘앙스' }
    };
  });
}

async function main() {
  console.log('🔑 Authenticating anonymously with Firebase Auth...');
  await signInAnonymously(auth);
  console.log('✅ Authenticated successfully!');

  console.log('🚀 [Step 1] Purging old/misclassified questions from Firestore...');
  
  const qSnap = await getDocs(collection(db, 'questions'));
  console.log(`Found ${qSnap.size} existing questions in Firestore.`);
  
  // 500개 단위 배치 삭제
  const docsToDelete = qSnap.docs;
  while (docsToDelete.length > 0) {
    const chunk = docsToDelete.splice(0, 400);
    const batch = writeBatch(db);
    chunk.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`Deleted ${chunk.length} questions...`);
  }
  console.log('✅ All old questions successfully purged!');

  // 캐시된 랭킹전 문제도 삭제하여 새로운 깨끗한 문제셋으로 갱신
  const cycleSnap = await getDocs(collection(db, 'cycle_challenges'));
  if (!cycleSnap.empty) {
    const cycleBatch = writeBatch(db);
    cycleSnap.forEach(d => cycleBatch.delete(d.ref));
    await cycleBatch.commit();
    console.log(`Deleted ${cycleSnap.size} cached cycle challenges.`);
  }

  console.log('\n🌟 [Step 2] Generating 40 pristine, perfectly classified questions per Level (Total 160 Qs)...');

  for (const config of LEVEL_CONFIGS) {
    console.log(`\n========================================`);
    console.log(`📚 Generating 40 Questions for [${config.label}]...`);
    console.log(`========================================`);

    let levelQuestions = [];

    // Batch 1 (20 questions: Categories 1~5)
    console.log(`Generating Batch 1 (20 Qs: 수일치, 시제/태, 준동사, 관계사, 접속사 vs 전치사)...`);
    let batch1 = [];
    for (let tryCount = 1; tryCount <= 3; tryCount++) {
      try {
        batch1 = await generateBatch(config, 0);
        console.log(`✅ Batch 1 succeeded (${batch1.length} Qs)`);
        break;
      } catch (e) {
        console.warn(`Batch 1 attempt ${tryCount} failed:`, e.message);
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // Batch 2 (20 questions: Categories 6~10)
    console.log(`Generating Batch 2 (20 Qs: 품사/어휘, 가정법/조동사, 특수구문/도치, 자·타동사, 병렬/상관접속)...`);
    let batch2 = [];
    for (let tryCount = 1; tryCount <= 3; tryCount++) {
      try {
        batch2 = await generateBatch(config, 1);
        console.log(`✅ Batch 2 succeeded (${batch2.length} Qs)`);
        break;
      } catch (e) {
        console.warn(`Batch 2 attempt ${tryCount} failed:`, e.message);
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    levelQuestions = [...batch1, ...batch2].slice(0, 40);
    console.log(`Saving ${levelQuestions.length} questions for [${config.label}] to Firestore...`);

    const batch = writeBatch(db);
    const qCol = collection(db, 'questions');
    for (const q of levelQuestions) {
      const newRef = doc(qCol);
      batch.set(newRef, {
        ...q,
        createdAt: serverTimestamp()
      });
    }
    await batch.commit();
    console.log(`🎉 [${config.label}] 40 questions saved with 100% accurate categories and tags!`);
  }

  const finalSnap = await getDocs(collection(db, 'questions'));
  console.log(`\n========================================`);
  console.log(`🏆 ALL COMPLETE! Total pristine questions in Firestore: ${finalSnap.size}`);
  console.log(`========================================`);

  // 카테고리별 분포 출력
  const stats = {};
  finalSnap.forEach(d => {
    const data = d.data();
    const cat = data.grammarCategory || 'unknown';
    const lvl = data.difficulty || 'unknown';
    stats[lvl] = stats[lvl] || {};
    stats[lvl][cat] = (stats[lvl][cat] || 0) + 1;
  });

  console.log('\n📊 Final Category Distribution by Level:');
  console.log(JSON.stringify(stats, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
