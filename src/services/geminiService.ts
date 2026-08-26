import { Question, ExpressionItem } from '../types';
import { inferGrammarCategory, getGrammarTagInfo } from './grammarTagService';

const LEVEL_RULES: Record<string, string> = {
  'Level 1 (입문/초급)': `
[🎯 Level 1 - 중학교 기초 영문법]
- 문장 길이: 7~10단어 단순 단문
- 출제 문법 범위:
  1) 3인칭 단수 현재 시제 수일치 (He/She/It + verb-s/es)
  2) 명백한 시제 단서 (yesterday, last night, every morning, tomorrow)
  3) 기본 조동사 (can, must, should + 동사원형)
  4) 기본 to부정사/동명사 목적어 (want to-V, hope to-V, enjoy -ing, finish -ing)
  5) 기초 1~3형식 문형
- 절대 금지: 복잡한 분사구문, 도치, 가정법, 전문 어휘 사용 금지.
- 예시: "He ______ to the library every morning before breakfast." (정답: goes)`,

  'Level 2 (실력 중급)': `
[🎯 Level 2 - 고교 1~2학년 / 토익 550~650 실력 중급]
- 문장 길이: 11~16단어 복문
- 출제 문법 범위:
  1) 관계대명사(who, which, that, whose, what) 및 관계부사(where, when, why)의 격과 쓰임
  2) 5형식 목적격 보어 (사역동사 make/have/let + 동사원형, 지각동사 see/hear/watch + 동사원형/-ing, 일반 5형식 enable/allow/encourage/require + to-V)
  3) 수동태 (be + p.p., 조동사 + be p.p.)
  4) 현재완료 완료/경험/계속/결과 (since + 과거시점, for + 기간)
  5) 접속사 vs 전치사 구별 (although vs despite, because vs because of, while vs during)
  6) 감정 분사형용사 (confusing vs confused, exciting vs excited, satisfying vs satisfied)
- 절대 금지: "yesterday", "every day" 같은 단순 중학 시제 단서 금지.
- 예시: "The company policy does not allow employees ______ confidential files outside the office." (정답: to access)`,

  'Level 3 (고득점 도약)': `
[🎯 Level 3 - 고3 수능 1등급 / 토익 750~850 고난도 도약]
- 문장 길이: 16~24단어의 길고 구조가 복잡한 수능/토익 복합 지문형 문장 (절대 12단어 이하 단문 금지!)
- 출제 문맥: 학술 연구, 심리학, 환경 정책, 비즈니스 이메일/보고서, 기술 혁신
- 출제 문법 범위 (10대 핵심 영역을 다양하게 분산 출제):
  1) 분사구문 (능동 -ing, 수동 p.p., 완료형 Having p.p., With + O + O.C. 분사)
  2) 가정법 (가정법 과거 If S were/did, 가정법 과거완료 If S had p.p., 혼합가정법, Without/But for 가정법)
  3) 부정어/한정어 도치 (Never/Hardly/Scarcely/Seldom/Little/No sooner + 조동사 + S + V, Only 부사구 도치)
  4) 당위성 주장/제안/요구/명령 동사 (insist, suggest, demand, require, recommend + that + S + (should) 동사원형)
  5) 명사절 vs 관계사 완결성 분석 (that vs what, in which vs which, whoever/whatever)
  6) 접속사 vs 복합 전치사구 (provided that, in case of, given that, regardless of)
  7) The 비교급 The 비교급 및 비교 대상의 일치 (that of / those of)
- 절대 금지: 단순 주어+동사+목적어의 중학 수준 단문 출제 절대 불가!
- 예시 1: "The senior committee insisted that the new safety protocol ______ implemented across all laboratories without delay." (정답: be)
- 예시 2: "Hardly ______ the presentation when the foreign investors began inquiring about the quarterly revenue." (정답: had she finished)
- 예시 3: "With consumer preferences rapidly ______, the retail brand had to adjust its digital marketing strategy." (정답: shifting)`,

  'Level 4 (실전 마스터)': `
[🎯 Level 4 - 토익 900+ 만점 대비 / 명문대 편입영어(서강·성균·한양·중앙·외대 등) / 7·9급 공무원 킬러 실전]
- 문장 길이: 18~30단어의 고난도 전문 비즈니스, 법률 계약서, 학술 논문, 철학/사회과학 비평 실전 문장 (절대 14단어 이하 단문 금지!)
- 출제 문맥: 다국적 기업 인수합병, 금융 위기 분석, 생명윤리 논쟁, 지정학적 협약, 영미 학술 에세이
- 출제 핵심 10대 킬러 유형 (매우 다양하게 골고루 출제):
  1) If 생략 가정법 도치:
     - Had S p.p. ~ S would have p.p. (예: "Had the directors known the risk, ...")
     - Were S to-V / Were it not for (예: "Were any technical fault to occur, ...")
     - Should S V (예: "Should you require further documentation, ...")
  2) 자·타동사 혼동 & 전치사 오용 함정:
     - lay - laid - laid vs lie - lay - lain vs lie - lied - lied
     - raise - raised - raised vs rise - rose - risen
     - sit - sat - sat vs set - set - set
     - 전치사 불가 타동사: discuss about(X), mention about(X), marry with(X), reach to(X), accompany with(X), explain about(X)
     - 전치사 필수 자동사: object to, participate in, account for, dispose of, refrain from, interfere with
  3) 전치사 to vs to부정사 to 구별 관용 표현:
     - look forward to -ing, be dedicated/committed/devoted to -ing, object to -ing, with a view to -ing, when it comes to -ing, be accustomed to -ing
  4) 고난도 혼동 파생어 및 품사 자리:
     - sensible(분별있는) vs sensitive(민감한)
     - considerate(사려깊은) vs considerable(상당한)
     - respectable(존경할만한) vs respectful(공손한) vs respective(각각의)
     - economic(경제의) vs economical(절약되는/경제적인)
     - successful(성공적인) vs successive(연속적인)
  5) 특수 도치 및 강조 구문:
     - Not until... did S + V, Only after... did S + V
     - 장소/방향 부사구 도치 (Among the guests was the renowned author.)
     - 보어 도치 (Enclosed is a copy of the contract.)
     - Scarcely/Hardly ... when/before, No sooner ... than
  6) 심화 가정법 구문 & 관용구:
     - lest S (should) 동사원형 (~하지 않도록) / for fear that S should V
     - It is (high) time that S + 과거동사 / should 동사원형
     - as if / as though + 가정법 과거/과거완료
     - cannot help -ing / cannot but + 동사원형
  7) 고난도 분사구문 & 절대 분사구문:
     - 의미상 주어가 다른 독립분사구문 (Weather permitting, All things considered)
     - with + 목적어 + 분사/형용사/전치사구 (With the deadline approaching)
     - need -ing (= need to be p.p., 수동 의미의 동명사)
  8) 비교 대상의 일치 & 병렬 구조:
     - The GDP of South Korea is significantly larger than that of developing nations. (that/those 대용)
     - not only A but also B, not so much A as B, prefer A to B, rather than V
  9) 복합관계사 & 명사절 완결성 판별:
     - whoever vs whomever vs whatever vs whichever (주격/목적격 판별 및 삽입절 'whoever they believe is competent')
     - that(완전절) vs what(불완전절) vs where/when(관계부사 완전절)
  10) 특수 수일치 & 수량 표현:
     - A number of + 복수명사 + 복수동사 vs The number of + 복수명사 + 단수동사
     - portion expressions (two-thirds of the apples are / two-thirds of the water is)
     - every / each + 단수명사 + 단수동사
     - many a + 단수명사 + 단수동사
- 예시 1: "______ any unexpected complications arise during the international merger, our legal team will intervene immediately." (정답: Should)
- 예시 2: "The university provost is deeply committed to ______ academic integrity and ethical leadership across all faculties." (정답: upholding)
- 예시 3: "Had the investigative journalists not revealed the financial discrepancy, the fraudulent transaction ______ undetected." (정답: would have remained)
- 예시 4: "The energy consumption of the newly developed electric motor is far lower than ______ of conventional models." (정답: that)
- 예시 5: "The executive committee insisted that the confidential proposal ______ discussed thoroughly before the press release." (정답: be)`
};

// Helper: 문장 형식 1~5 정규화
export function sanitizeForm(form: any): number {
  const num = parseInt(String(form), 10);
  if (!isNaN(num) && num >= 1 && num <= 5) {
    return num;
  }
  return 3;
}

// 🔤 빈칸 표기 표준화 헬퍼 ([blank], (blank), (is / are), [is/are], ___ 등을 ______ 로 완벽 통일)
export function normalizeSentenceBlank(sentence: string, answerText?: string): string {
  if (!sentence || typeof sentence !== 'string') return '';
  let s = sentence;

  // 1. (is / are), (want / wants), [is / are / were] 등 괄호 안에 슬래시(/)로 보기가 들어간 구문을 ______ 로 치환
  s = s.replace(/[\(\[]\s*[\w\s\-']+(?:\s*\/\s*[\w\s\-']+)+\s*[\)\]]/gi, '______');

  // 2. [blank], (blank), <blank>, [빈칸], (빈칸), (___), [___], __ 등을 ______ 로 통일
  s = s.replace(/(?:_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)|<\s*blank\s*>|\[\s*빈칸\s*\]|\(\s*빈칸\s*\)|\(\s*_{1,}\s*\)|\[\s*_{1,}\s*\]|\[\s*___+\s*\]|\bblank\b|\bBlank\b|\bBLANK\b)/gi, '______');

  // 3. 만약 여전히 빈칸이 없는 경우, 정답 단어가 문장에 온전하게 들어가 있다면 정답 단어 자리를 ______ 로 치환
  if (!s.includes('______') && answerText && typeof answerText === 'string') {
    const trimmedAns = answerText.trim();
    if (trimmedAns && trimmedAns.length >= 2) {
      const escaped = trimmedAns.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      s = s.replace(new RegExp(`\\b${escaped}\\b`, 'i'), '______');
    }
  }

  return s;
}

// 🎲 4지선다 보기 랜덤 셔플 헬퍼 (정답 1번 편중 100% 원천 차단)
export function shuffleOptions<T = any>(options: T[]): T[] {
  if (!Array.isArray(options) || options.length <= 1) return options || [];
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 🎯 문제 정답, 보기 4종 및 해설 100% 동기화 보정 헬퍼 (해설-정답 불일치 및 보기 셔플 오류 100% 원천 차단)
export function normalizeAndFixQuestion(q: any): Question {
  const rawOptions = Array.isArray(q?.options) ? [...q.options] : [];
  let options = rawOptions.map((opt: any) => {
    if (typeof opt === 'string') {
      return { text: opt.trim(), is_correct: false, feedback: '' };
    }
    return {
      text: String(opt?.text || opt?.word || opt?.value || opt?.choice || '').trim(),
      is_correct: !!opt?.is_correct,
      feedback: String(opt?.feedback || '').trim()
    };
  });

  let rawAnswer = String(q?.answer || '').trim();
  let resolvedAnswer = rawAnswer;

  // 1. answer가 "1", "2", "3", "4", "1번", "(1)", "A", "B", "C", "D" 등 번호/기호인 경우
  const numMatch = rawAnswer.match(/^[(\[]?([1-4])[)\]번]?$/);
  const letterMatch = rawAnswer.match(/^[(\[]?([A-Da-d])[)\]]?$/);

  if (numMatch) {
    const idx = parseInt(numMatch[1], 10) - 1;
    if (options[idx]) {
      resolvedAnswer = options[idx].text;
    }
  } else if (letterMatch) {
    const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
    if (options[idx]) {
      resolvedAnswer = options[idx].text;
    }
  }

  // 2. resolvedAnswer가 options 중 하나와 일치하는지 확인
  let matchedIndex = options.findIndex(o => o.text.toLowerCase() === resolvedAnswer.toLowerCase());
  
  // 만약 일치하는 보기가 없으면, is_correct: true 인 보기를 정답으로 채택
  if (matchedIndex === -1) {
    const trueIndex = options.findIndex(o => o.is_correct === true);
    if (trueIndex !== -1) {
      matchedIndex = trueIndex;
      resolvedAnswer = options[trueIndex].text;
    } else if (options.length > 0) {
      matchedIndex = 0;
      resolvedAnswer = options[0].text;
    }
  }

  // 3. 오직 단 1개의 정답 보기만 is_correct: true, 나머지는 100% is_correct: false 로 강제 통일
  options = options.map((opt, idx) => {
    const isThisCorrect = idx === matchedIndex;
    let feedback = opt.feedback;

    // 4. 해설-정답 모순 자동 교정 (정답인데 오답 해설이 들어가 있거나, 오답인데 정답 해설이 들어가 있는 경우 즉시 정정)
    if (isThisCorrect) {
      if (!feedback || feedback.startsWith('오답') || feedback.includes('틀린') || feedback.includes('부적절')) {
        feedback = `정답입니다! "${opt.text}"가 이 문장의 문법 규칙 및 문맥에 완벽하게 일치합니다.`;
      }
    } else {
      if (!feedback || feedback.startsWith('정답') || feedback.includes('올바른') || feedback.includes('맞습니다')) {
        feedback = `오답입니다. "${opt.text}"는 문법적 역할, 위치 또는 시제에 맞지 않습니다.`;
      }
    }

    return {
      text: opt.text,
      is_correct: isThisCorrect,
      feedback
    };
  });

  const tagInfo = inferGrammarCategory(q || {});

  return {
    ...q,
    form: sanitizeForm(q?.form),
    grammarTag: q?.grammarTag || tagInfo.badgeKo,
    grammarCategory: q?.grammarCategory || tagInfo.id,
    sentence: normalizeSentenceBlank(q?.sentence || '', resolvedAnswer),
    options,
    answer: resolvedAnswer,
    translation: q?.translation || '',
    explanation: q?.explanation || { chunk_pattern: '핵심 문형 정리', nuance: '자연스러운 뉘앙스 해설' }
  };
}

import { generateFallbackQuestions, generateFallbackTopicQuestions } from './fallbackQuestionEngine';

// 🔒 보안 프록시 호출 헬퍼 (API Key 브라우저 노출 100% 차단 및 커스텀 키 지원)
export async function callGeminiProxy(model: string, payload: any): Promise<any> {
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('custom_gemini_api_key') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (customKey && customKey.trim()) {
    headers['x-gemini-api-key'] = customKey.trim();
  }

  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, payload, apiKey: customKey ? customKey.trim() : undefined })
  });

  if (!response.ok) {
    const errorText = await response.text();
    // If proxy failed and customKey is valid, try direct fetch
    if (customKey && customKey.trim().length > 15) {
      try {
        const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${customKey.trim()}`;
        const directRes = await fetch(directUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (directRes.ok) {
          return await directRes.json();
        }
      } catch (directErr) {
        // continue
      }
    }
    throw new Error(`Proxy Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

const ACTIVE_GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'];

// ⚡ 단일 배치 문제 생성 헬퍼 함수
async function generateSingleBatch(
  difficultyLabel: string,
  weaknessFocus: string = "",
  batchCount: number = 20,
  targetForms?: number[],
  forbiddenSentences?: string[]
): Promise<Question[]> {
  const models = ACTIVE_GEMINI_MODELS;
  
  let matchedRule = LEVEL_RULES['Level 1 (입문/초급)'];
  if (difficultyLabel.includes('Level 4') || difficultyLabel.includes('4단계') || difficultyLabel.includes('실전') || difficultyLabel.includes('Mastery')) {
    matchedRule = LEVEL_RULES['Level 4 (실전 마스터)'];
  } else if (difficultyLabel.includes('Level 3') || difficultyLabel.includes('3단계') || difficultyLabel.includes('고득점') || difficultyLabel.includes('Advanced')) {
    matchedRule = LEVEL_RULES['Level 3 (고득점 도약)'];
  } else if (difficultyLabel.includes('Level 2') || difficultyLabel.includes('2단계') || difficultyLabel.includes('중급') || difficultyLabel.includes('Intermediate')) {
    matchedRule = LEVEL_RULES['Level 2 (실력 중급)'];
  } else {
    matchedRule = LEVEL_RULES['Level 1 (입문/초급)'];
  }

  const systemPrompt = `당신은 대한민국 최고 수준의 수능/토익(Part 5&6 990점 만점)/대학 편입영어(서강·성균·한양·중앙·외대 등)/공무원 영어 전문 1타 강사이자 국가공인 출제위원장입니다.
제시된 [난이도 기준]을 100% 엄격하게 준수하여 객관식 4지선다 영문법 문제를 정확히 ${batchCount}개 생성하세요.

[🚨 난이도 절대 준수 및 다양성 원칙]
- 만약 난이도가 Level 4(실전 마스터)라면:
  * 토익 900+ Part 5 고난도 함정 및 명문대 편입영어 문법 킬러 문항 수준으로 출제하세요.
  * 주제를 다양하게 분산하세요: 비즈니스/재무/계약서, 생명공학/IT기술, 지정학/외교, 서양철학/비평문, 사회과학 에세이.
  * 10대 핵심 킬러 유형(If생략 도치, 자/타동사 함정, 전치사 to vs to-V, 혼동 파생어, 특수 도치, 심화 가정법, 독립분사구문, 비교 that/those, 복합관계사, 특수 수일치)을 골고루 섞어 출제하세요.
  * 4개의 보기(options)는 실제 시험처럼 '매력적인 오답 함정(고난도 문법 트랩)'을 갖추어야 합니다.
- 만약 난이도가 Level 3(고득점 도약)라면:
  * 수능 1등급 및 토익 750~850 도약 수준의 16~24단어 복합문으로 [분사구문, 가정법, 부정어 도치, 당위성 동사원형, that vs what]을 출제하세요.
- Level 2: 11~16단어의 고교 중급/기본 토익 복문으로 출제하세요.
- Level 1: 7~10단어의 중학 기초 단문으로 출제하세요.

[🚨 출제 및 정답-해설 일치 엄격 원칙]
1. [실전 문법 포인트 태그]: grammarTag(예: '주어-동사 수일치', '시제 · 태', '준동사', '관계사 · 명사절', '접속사 vs 전치사', '품사 · 어휘', '가정법 · 조동사', '특수구문 · 도치', '자·타동사 콜로케이션', '병렬 · 상관접속')와 grammarCategory(예: 'subject_verb_agreement', 'tense_voice', 'verbals', 'clauses_relatives', 'connectors', 'parts_of_speech', 'modals_subjunctive', 'special_structures', 'verb_patterns', 'parallel_agreement')를 정확히 지정하세요.
2. [정답 텍스트 일치]: answer 필드는 1, 2, A 같은 번호가 아니라 반드시 '정답 영어 보기 텍스트 그 자체'를 정확하게 넣으세요.
3. [단 1개의 정답 플래그]: options 4개 중 오직 1개만 is_correct: true 로 지정하고, 나머지 3개는 is_correct: false 로 지정하세요.
4. [상세하고 깊이 있는 해설]:
   - options의 is_correct: true 항목의 feedback은 '정답인 핵심 문법적 원리와 문맥적 이유'를 친절하고 상세하게 설명하세요.
   - is_correct: false 항목들은 '각각 왜 오답인지(수일치 불일치, 품사 부적합, 시제 오류, 자/타동사 전치사 오류 등)'를 명확하고 상세하게 설명하세요.
5. [문형 및 뉘앙스]: explanation의 chunk_pattern(문장 성분/구문 덩어리 구조 분석)과 nuance(원어민의 자연스러운 쓰임과 맥락 뉘앙스)는 반드시 정답을 기준으로 상세하게 작성하세요.
6. [1~5형식]: form 필드는 1, 2, 3, 4, 5 정수만 허용.
7. [빈칸 표기]: sentence의 빈칸은 반드시 '______' 로 작성하세요.`;

  let userPrompt = `난이도: ${difficultyLabel}\n[기준]\n${matchedRule}\n`;
  if (weaknessFocus) {
    userPrompt += `[맞춤] 취약 문법 영역(${weaknessFocus})을 집중 포함하세요.\n`;
  }
  if (targetForms && targetForms.length > 0) {
    userPrompt += `[🚨 형식 균등 배분 필수] 반드시 ${targetForms.map(f => `${f}형식`).join(', ')} 문장을 균등하게 집중 출제하세요. (form 필드 값에 ${targetForms.join(', ')} 중 하나를 부여)\n`;
  } else {
    userPrompt += `[🚨 1~5형식 골고루 출제 필수] 1형식, 2형식, 3형식, 4형식, 5형식 문장을 치우침 없이 골고루 균등하게 섞어서 출제하세요.\n`;
  }
  if (forbiddenSentences && forbiddenSentences.length > 0) {
    const sample = forbiddenSentences.slice(0, 25).map(s => `- ${s}`).join('\n');
    userPrompt += `\n[🚨 중복 출제 100% 원천 차단] 다음 기존 출제 문장들과 유사하거나 동일한 문장은 절대 생성하지 마세요:\n${sample}\n`;
  }
  userPrompt += `정확히 ${batchCount}개의 4지선다 JSON 배열을 생성하세요. sentence의 빈칸 자리는 반드시 '______' 로 작성하세요.`;

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
            grammarTag: { type: "STRING" },
            grammarCategory: { type: "STRING" },
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
      },
      temperature: 0.4
    }
  };

  const isLvl4 = difficultyLabel.includes('Level 4') || difficultyLabel.includes('4단계') || difficultyLabel.includes('실전') || difficultyLabel.includes('Mastery');
  const isLvl3 = difficultyLabel.includes('Level 3') || difficultyLabel.includes('3단계') || difficultyLabel.includes('고득점') || difficultyLabel.includes('Advanced');
  const isLvl2 = difficultyLabel.includes('Level 2') || difficultyLabel.includes('2단계') || difficultyLabel.includes('중급') || difficultyLabel.includes('Intermediate');
  const isLvl1 = !isLvl4 && !isLvl3 && !isLvl2;

  for (const model of models) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed: Question[] = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed.filter(q => {
            const words = (q.sentence || '').trim().split(/\s+/).length;
            if (isLvl4 && words < 15) return false;
            if (isLvl3 && words < 13) return false;
            if (isLvl1 && words > 13) return false;
            return true;
          });

          const targetList = validated.length >= Math.floor(batchCount * 0.5) ? validated : parsed;

          return targetList.map(q => {
            const normalized = normalizeAndFixQuestion(q);
            return {
              ...normalized,
              difficulty: difficultyLabel,
              level: difficultyLabel,
              options: shuffleOptions(normalized.options)
            };
          });
        }
      }
    } catch (e: any) {
      console.warn(`Single batch error with model ${model}:`, e);
    }
  }

  return [];
}

// 🚀 초고속 2채널 병렬 대량 문제 생성 함수 (1~5형식 완벽 균형 배분)
export async function generateBulkQuestions(
  difficultyLabel: string,
  weaknessFocus: string = "",
  count: number = 40,
  formStats?: { countsByForm: Record<number, number>; underrepresentedForms: number[] },
  forbiddenSentences?: string[]
): Promise<{ success: boolean; questions?: Question[]; error?: string }> {
  try {
    if (count >= 20) {
      // ⚡ 2채널(20개 x 2) 고속 병렬 호출
      const halfCount = Math.ceil(count / 2);
      const batches = await Promise.all([
        generateSingleBatch(difficultyLabel, weaknessFocus, halfCount, [1, 2, 3], forbiddenSentences),
        generateSingleBatch(difficultyLabel, weaknessFocus, halfCount, [3, 4, 5], forbiddenSentences)
      ]);

      const merged = batches.flat();
      if (merged.length > 0) {
        return { success: true, questions: merged };
      }
    }

    // 단일 배치 생성
    const singleResult = await generateSingleBatch(difficultyLabel, weaknessFocus, count, [1, 2, 3, 4, 5], forbiddenSentences);
    if (singleResult.length > 0) {
      return { success: true, questions: singleResult };
    }

    // 🛡️ Gemini API 키 만료/차단 시: 자체 고품질 출제 엔진(Fallback Question Engine)으로 즉시 100% 정상 생성
    console.warn(`[generateBulkQuestions]: Live AI call unavailable. Synthesizing ${count} questions via High-Precision Question Engine for [${difficultyLabel}]...`);
    const fallbackList = generateFallbackQuestions(difficultyLabel, count, weaknessFocus, formStats?.underrepresentedForms);
    if (fallbackList.length > 0) {
      return { success: true, questions: fallbackList };
    }

    return { success: false, error: "AI 문제 생성 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요." };
  } catch (err: any) {
    // 🛡️ 예외 발생 시에도 고품질 출제 엔진으로 100% 정상 복구
    console.warn(`[generateBulkQuestions error fallback]:`, err);
    const fallbackList = generateFallbackQuestions(difficultyLabel, count, weaknessFocus, formStats?.underrepresentedForms);
    if (fallbackList.length > 0) {
      return { success: true, questions: fallbackList };
    }
    return { success: false, error: err.message || "문제 생성 중 오류가 발생했습니다." };
  }
}

// 🎯 특정 문법 테마 + 특정 난이도 전용 10문제 초고속 AI 생성 함수 (~2초 내 완료)
export async function generateTopicQuestions(
  topicId: string,
  levelNumber: number = 2,
  count: number = 10
): Promise<{ success: boolean; questions?: Question[]; error?: string }> {
  const categoryInfo = getGrammarTagInfo(topicId);
  const lvlLabel = levelNumber === 4 ? 'Level 4 (실전 마스터)'
    : levelNumber === 3 ? 'Level 3 (고득점 도약)'
    : levelNumber === 2 ? 'Level 2 (실력 중급)'
    : 'Level 1 (입문/초급)';

  const matchedRule = LEVEL_RULES[lvlLabel] || LEVEL_RULES['Level 2 (실력 중급)'];

  const systemPrompt = `당신은 대한민국 최고의 수능/토익/편입 영문법 1타 강사이자 국가공인 출제위원장입니다.
문법 테마 [${categoryInfo.nameKo} (${categoryInfo.nameEn})]에 100% 집중된 ${lvlLabel} 객관식 4지선다 영문법 문제를 정확히 ${count}개 생성하세요.

[🚨 출제 핵심 원칙]
1. [테마 집중]: 반드시 [${categoryInfo.nameKo}] (${categoryInfo.descKo}) 범위의 핵심 포인트로만 출제하세요.
2. [카테고리 태그]: grammarCategory 필드는 반드시 '${categoryInfo.id}'로, grammarTag 필드는 반드시 '${categoryInfo.badgeKo}'로 설정하세요.
3. [정답 텍스트]: answer 필드는 1, 2 번호가 아니라 '정답 영어 보기 텍스트 그 자체'를 정확하게 넣으세요.
4. [정답 플래그]: options 4개 중 단 1개만 is_correct: true 로 지정하세요.
5. [빈칸 표기]: sentence의 빈칸은 반드시 '______' 로 작성하세요.
6. [형식]: form 필드는 1, 2, 3, 4, 5 정수 중 하나를 지정하세요.
7. [친절한 해설]: 정답 feedback 및 오답 3개의 feedback, chunk_pattern, nuance를 100% 자연스러운 한국어로 알기 쉽게 작성하세요.`;

  const userPrompt = `[문법 테마]: ${categoryInfo.nameKo} (${categoryInfo.id})
[출제 난이도]: ${lvlLabel}
[난이도 기준]:
${matchedRule}

정확히 ${count}개의 4지선다 JSON 배열을 반환하세요.`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 8192
    }
  };

  for (const model of ACTIVE_GEMINI_MODELS) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.slice(0, count).map(q => {
            const normalized = normalizeAndFixQuestion({
              ...q,
              grammarCategory: categoryInfo.id,
              grammarTag: categoryInfo.badgeKo,
              difficulty: lvlLabel,
              level: lvlLabel
            });
            return {
              ...normalized,
              options: shuffleOptions(normalized.options)
            };
          });
          return { success: true, questions: formatted };
        }
      }
    } catch (e: any) {
      console.warn(`generateTopicQuestions error with ${model}:`, e);
    }
  }

  // 🛡️ Gemini API 키 만료/차단 시: 문법 테마별 고품질 출제 엔진으로 즉시 100% 정상 생성
  console.warn(`[generateTopicQuestions]: Live AI call unavailable for [${topicId}]. Generating via High-Precision Question Engine...`);
  const fallbackTopicList = generateFallbackTopicQuestions(topicId, levelNumber, count);
  if (fallbackTopicList.length > 0) {
    return { success: true, questions: fallbackTopicList };
  }

  return { success: false, error: "문법 테마 문제를 생성하지 못했습니다." };
}

// 🌟 5개 원어민 실전 표현 AI 생성 함수 (보안 프록시 호출)
export async function generateNativeExpressions(
  category: 'daily' | 'business' | 'travel' | 'pattern',
  existingExpressions: string[] = [],
  count: number = 5
): Promise<{ success: boolean; expressions?: ExpressionItem[]; error?: string }> {
  const models = ACTIVE_GEMINI_MODELS;

  const categoryNames = {
    daily: '미드 & 일상 생활 회화 / 슬랭 / 관용구',
    business: '비즈니스 & 오피스 / 이메일 / 회의 영어',
    travel: '해외여행 & 식당 / 공항 / 호텔 / 쇼핑 영어',
    pattern: '원어민 만능 회화 꿀패턴 (핵심 구문 공식)'
  };

  const systemPrompt = `당신은 미국 현지 원어민들의 생생한 표현을 강의하는 영어 회화 전문 강사입니다.
제시된 카테고리에 맞춰 원어민들이 매일 사용하는 최고급 실전 표현/관용구/패턴을 정확히 ${count}개 생성하세요.

[🚨 절대 위반 불가 출제 원칙]
1. [중복 절대 금지] 다음 기존에 이미 존재하는 표현들과 절대 중복되지 않는 새로운 알짜 표현만 생성하세요:
   [기존 목록]: ${existingExpressions.slice(0, 40).join(', ')}
2. [100% 한국어 설명] 의미(meaning), 뉘앙스(nuance), 대화 해석(ko), 퀴즈 보기 해설(feedback)은 모두 100% 자연스러운 한국어로 작성하세요.
3. [실전 A/B 대화문] 각 표현마다 화자 A와 B의 2턴 이상의 실전 롤플레이 대화 예문을 en과 ko로 명시하세요.
4. [4지선다 퀴즈] 각 표현마다 대화 맥락 빈칸을 채우는 4지선다 퀴즈 문제를 포함하세요.`;

  const userPrompt = `카테고리: ${categoryNames[category]} (${category})
새로운 원어민 실전 표현 ${count}개를 JSON으로 생성해 주세요.`;

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
            category: { type: "STRING" },
            expression: { type: "STRING" },
            meaning: { type: "STRING" },
            nuance: { type: "STRING" },
            similarExpressions: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            dialogue: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  speaker: { type: "STRING" },
                  en: { type: "STRING" },
                  ko: { type: "STRING" }
                },
                required: ["speaker", "en", "ko"]
              }
            },
            quizQuestion: {
              type: "OBJECT",
              properties: {
                sentence: { type: "STRING" },
                answer: { type: "STRING" },
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
                }
              },
              required: ["sentence", "answer", "options"]
            }
          },
          required: ["category", "expression", "meaning", "nuance", "dialogue", "quizQuestion"]
        }
      }
    }
  };

  for (const model of models) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsed: ExpressionItem[] = JSON.parse(rawText);
      const cleaned = parsed.map(p => ({
        ...p,
        category
      }));

      return { success: true, expressions: cleaned };
    } catch (e: any) {
      console.warn(`generateNativeExpressions error with ${model}:`, e);
    }
  }

  return { success: false, error: "원어민 표현을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요." };
}

// 🤖 1타 강사 AI 튜터 1:1 실시간 질문 함수 (보안 프록시 호출 & 한/영 다국어 지원)
export async function askAiTutor(
  question: Question,
  userQuestion: string,
  userChoice?: string,
  lang: 'ko' | 'en' = 'ko'
): Promise<{ success: boolean; answer?: string; error?: string }> {
  const models = ACTIVE_GEMINI_MODELS;

  const systemPrompt = lang === 'en'
    ? `You are an elite, world-class English grammar master and ESL tutor.
A student is asking a specific question regarding an English grammar problem they just attempted.
Explain the core concept, why the correct answer works, why incorrect options fail, and provide practical tips entirely in friendly, clear, concise English.

[GUIDELINES]:
1. Be encouraging, concise, and structured.
2. Clearly contrast the correct choice vs the student's choice or common traps.
3. Use markdown bolding (**words**), bullet points, and clean formatting.`
    : `당신은 대한민국 최고의 수능/토익 영문법 1타 강사이자 회화 튜터입니다.
학생이 푼 영어 문제에 대해 궁금한 점을 질문했습니다.
친절하고 명쾌하며 핵심을 찌르는 족집게 과외 선생님처럼 100% 한국어로 학생의 눈높이에 맞춰 설명해 주세요.

[답변 가이드라인]
1. 불필요한 서론/인사말을 최소화하고, 핵심 원리부터 명쾌하게 설명하세요.
2. 학생이 헷갈려하는 문법 공식/표현 쓰임새와 정답/오답의 차이점을 구체적인 예시와 함께 대조해 주세요.
3. 실전 시험 및 회화에서 낚이지 않는 '1타 강사만의 꿀팁'을 1~2줄로 요약해 주세요.
4. 가독성을 위해 마크다운 볼드(**단어**), 이모지, 글머리 기호를 적극 활용하세요.`;

  const userPrompt = lang === 'en'
    ? `[Problem Context]
- Target Sentence: ${question.sentence}
- Correct Answer: ${question.answer}
- Student's Choice: ${userChoice || 'None'}
- Form: Form ${sanitizeForm(question.form)}
- Grammar Pattern: ${question.explanation?.chunk_pattern || 'Basic Structure'}

[Student's Question]
"${userQuestion}"

Please provide a clear, helpful 1-on-1 tutoring response in English.`
    : `[문제 정보]
- 문제 문장: ${question.sentence}
- 정답: ${question.answer}
- 학생이 선택한 보기: ${userChoice || '미선택'}
- 한국어 해석: ${question.translation}
- 문장 형식: ${sanitizeForm(question.form)}형식
- 핵심 청크/표현: ${question.explanation?.chunk_pattern || '기본 문형'}

[학생의 질문]
"${userQuestion}"

위 질문에 대해 1타 강사 입장에서 가장 알기 쉽게 명쾌한 1:1 과외 답변을 작성해 주세요.`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096
    }
  };

  for (const model of models) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return { success: true, answer: rawText };
      }
    } catch (e: any) {
      console.warn(`AI Tutor error with ${model}:`, e);
    }
  }

  return { success: false, error: "AI 튜터 응답을 가져오지 못했습니다. 잠시 후 다시 질문해 주세요." };
}

// 🌟 랭킹전 비상 보증 10문제 마스터 팩 (Level 1: 2, Level 2: 3, Level 3: 3, Level 4: 2)
export const MASTER_RANKING_FALLBACK_PACK: Question[] = [
  // 1. Level 1 (2문제)
  {
    id: "ranking_seed_q1",
    form: 1,
    sentence: "She _____ to the central library every Saturday to study grammar.",
    options: [
      { text: "goes", is_correct: true, feedback: "주어 She는 3인칭 단수이며 현재의 반복적 습관을 나타내므로 goes가 정답입니다." },
      { text: "go", is_correct: false, feedback: "3인칭 단수 주어에는 동사원형 go를 쓸 수 없습니다." },
      { text: "going", is_correct: false, feedback: "be동사 없이 단독 -ing는 문장의 본동사가 될 수 없습니다." },
      { text: "gone", is_correct: false, feedback: "have 없이 과거분사 gone 단독으로는 동사가 될 수 없습니다." }
    ],
    answer: "goes",
    translation: "그녀는 문법을 공부하기 위해 매주 토요일마다 중앙 도서관에 간다.",
    explanation: {
      chunk_pattern: "주어 + 완전자동사 (1형식 S + V)",
      nuance: "반복적인 주말 습관을 나타내는 현재 시제 기본 문형"
    },
    level: "Level 1"
  },
  {
    id: "ranking_seed_q2",
    form: 3,
    sentence: "My brother _____ a delicious pasta dinner for our family yesterday.",
    options: [
      { text: "cooked", is_correct: true, feedback: "명백한 과거 시점 부사인 yesterday가 있으므로 과거시제 cooked가 정답입니다." },
      { text: "cooks", is_correct: false, feedback: "yesterday와 현재시제는 어울리지 않습니다." },
      { text: "cooking", is_correct: false, feedback: "단독 -ing는 본동사가 될 수 없습니다." },
      { text: "cook", is_correct: false, feedback: "과거 시제 및 3인칭 단수 규칙에 어긋납니다." }
    ],
    answer: "cooked",
    translation: "우리 형은 어제 우리 가족을 위해 맛있는 파스타 저녁을 요리했다.",
    explanation: {
      chunk_pattern: "주어 + 타동사 + 목적어 (3형식 S + V + O)",
      nuance: "명백한 과거 부사어(yesterday)와 과거 시제의 호응"
    },
    level: "Level 1"
  },
  // 2. Level 2 (3문제)
  {
    id: "ranking_seed_q3",
    form: 5,
    sentence: "The director made all team members _____ the presentation before the meeting.",
    options: [
      { text: "review", is_correct: true, feedback: "사역동사 make의 목적격 보어 자리에는 능동 관계일 때 동사원형이 옵니다." },
      { text: "to review", is_correct: false, feedback: "사역동사 make는 목적격 보어로 to부정사를 취하지 않습니다." },
      { text: "reviewed", is_correct: false, feedback: "팀원들이 직접 검토하는 능동 관계이므로 과거분사는 적절하지 않습니다." },
      { text: "reviewing", is_correct: false, feedback: "사역동사 make의 보어로 -ing는 일반적으로 오지 않습니다." }
    ],
    answer: "review",
    translation: "팀장은 모든 팀원들에게 회의 전에 발표 자료를 검토하도록 했다.",
    explanation: {
      chunk_pattern: "사역동사 + 목적어 + 동사원형 (5형식 S + V + O + OC)",
      nuance: "사역동사의 목적격 보어 원형부정사 쓰임새"
    },
    level: "Level 2"
  },
  {
    id: "ranking_seed_q4",
    form: 3,
    sentence: "This modern high-speed railway _____ by renowned engineers in 2021.",
    options: [
      { text: "was built", is_correct: true, feedback: "철도는 건설되는 대상(수동)이며 in 2021 과거 시점이므로 was built가 정답입니다." },
      { text: "built", is_correct: false, feedback: "능동태로 쓰면 철도가 무언가를 지었다는 비문이 됩니다." },
      { text: "is built", is_correct: false, feedback: "in 2021 과거 시점 단서가 있으므로 현재시제는 불가합니다." },
      { text: "building", is_correct: false, feedback: "단독 -ing는 동사 역할을 할 수 없습니다." }
    ],
    answer: "was built",
    translation: "이 현대적인 고속철도는 2021년에 저명한 엔지니어들에 의해 건설되었다.",
    explanation: {
      chunk_pattern: "수동태 구문 (be + p.p. + by 행위자)",
      nuance: "과거 특정 시점(in 2021)에 완성된 수동의 행위 표현"
    },
    level: "Level 2"
  },
  {
    id: "ranking_seed_q5",
    form: 3,
    sentence: "We are looking for a software architect _____ has extensive experience in cloud systems.",
    options: [
      { text: "who", is_correct: true, feedback: "선행사가 사람(software architect)이고 관계사절 내에서 주어 역할을 하므로 주격 관계대명사 who가 정답입니다." },
      { text: "which", is_correct: false, feedback: "선행사가 사람이므로 which는 쓸 수 없습니다." },
      { text: "whom", is_correct: false, feedback: "관계사절 내에 주어가 비어 있으므로 목적격 whom은 불가합니다." },
      { text: "whose", is_correct: false, feedback: "뒤에 명사 수식 없이 바로 동사 has가 오므로 소유격 whose는 부적절합니다." }
    ],
    answer: "who",
    translation: "우리는 클라우드 시스템에 풍부한 경험을 가진 소프트웨어 아키텍트를 찾고 있습니다.",
    explanation: {
      chunk_pattern: "사람 선행사 + 주격 관계대명사 who + 동사",
      nuance: "전문직 인재를 수식하는 형용사절 수식 구조"
    },
    level: "Level 2"
  },
  // 3. Level 3 (3문제)
  {
    id: "ranking_seed_q6",
    form: 3,
    sentence: "_____ the severe winter storm, all rescue operations proceeded without delay.",
    options: [
      { text: "Despite", is_correct: true, feedback: "뒤에 명사구(the severe winter storm)가 이어지므로 양보를 나타내는 전치사 Despite가 정답입니다." },
      { text: "Although", is_correct: false, feedback: "Although는 접속사로 뒤에 주어+동사 절이 와야 합니다." },
      { text: "Even though", is_correct: false, feedback: "Even though는 접속사이므로 명사구 앞에는 불가합니다." },
      { text: "In spite", is_correct: false, feedback: "전치사구로 쓰려면 In spite of로 of까지 있어야 합니다." }
    ],
    answer: "Despite",
    translation: "극심한 겨울 폭풍에도 불구하고 모든 구조 작업은 지체 없이 진행되었다.",
    explanation: {
      chunk_pattern: "양보 전치사(Despite) + 명사구, 주절",
      nuance: "접속사(Although) vs 전치사(Despite)의 구조적 차이"
    },
    level: "Level 3"
  },
  {
    id: "ranking_seed_q7",
    form: 3,
    sentence: "Never before _____ such an extraordinary level of teamwork among our engineers.",
    options: [
      { text: "had I witnessed", is_correct: true, feedback: "부정어 Never before가 문두에 오면 [조동사/have + 주어 + 본동사] 순으로 도치됩니다." },
      { text: "I had witnessed", is_correct: false, feedback: "부정어 문두 도치 규칙을 적용하지 않은 평서문 어순입니다." },
      { text: "I witnessed", is_correct: false, feedback: "도치가 생략된 비문입니다." },
      { text: "did I witnessed", is_correct: false, feedback: "조동사 did 뒤에는 동사원형이 와야 하므로 오류입니다." }
    ],
    answer: "had I witnessed",
    translation: "우리 엔지니어들 사이에서 이토록 놀라운 수준의 팀워크를 목격한 적은 이전에는 결코 없었다.",
    explanation: {
      chunk_pattern: "부정어(Never) + had + 주어 + p.p. (부정어 강조 도치)",
      nuance: "경험의 유일무이함을 극적으로 강조하는 수능/토익 고난도 도치 문형"
    },
    level: "Level 3"
  },
  {
    id: "ranking_seed_q8",
    form: 3,
    sentence: "The committee insisted that the safety protocol _____ strictly enforced immediately.",
    options: [
      { text: "be", is_correct: true, feedback: "주장/요구 동사 insist 뒤의 that절에는 당위성을 나타내어 (should) + 동사원형 be가 옵니다." },
      { text: "is", is_correct: false, feedback: "당위성 절에는 직설법 is가 올 수 없습니다." },
      { text: "was", is_correct: false, feedback: "주절 시제가 과거라 해도 당위성 동사원형 규칙이 우선합니다." },
      { text: "to be", is_correct: false, feedback: "that절의 본동사 자리에 to부정사는 불가합니다." }
    ],
    answer: "be",
    translation: "위원회는 안전 수칙이 즉시 엄격하게 시행되어야 한다고 강력히 주장했다.",
    explanation: {
      chunk_pattern: "insist that S + (should) + 동사원형 be p.p.",
      nuance: "당위성(마땅히 ~해야 함)을 나타내는 가정법 현재 문형"
    },
    level: "Level 3"
  },
  // 4. Level 4 (2문제)
  {
    id: "ranking_seed_q9",
    form: 3,
    sentence: "_____ had the plane taken off when an emergency signal was detected by ground control.",
    options: [
      { text: "Hardly", is_correct: true, feedback: "'Hardly had S p.p. when...' 구문으로 '~하자마자 ...했다'를 나타내는 특수 도치입니다." },
      { text: "No sooner", is_correct: false, feedback: "No sooner는 뒤에 when 대신 than과 호응합니다." },
      { text: "Seldom", is_correct: false, feedback: "Seldom은 단순 빈도 부정어로 when 절과 짝을 이루지 않습니다." },
      { text: "Not only", is_correct: false, feedback: "Not only는 but also와 짝을 이룹니다." }
    ],
    answer: "Hardly",
    translation: "비행기가 이륙하자마자 지상 관제소에서 비상 신호가 감지되었다.",
    explanation: {
      chunk_pattern: "Hardly / Scarcely + had + S + p.p. ... when / before + 과거동사",
      nuance: "두 사건이 연쇄적으로 즉시 일어났음을 나타내는 최고급 시제/도치 상관구문"
    },
    level: "Level 4"
  },
  {
    id: "ranking_seed_q10",
    form: 3,
    sentence: "The investment fund agreed to finance the startup, _____ comprehensive quarterly audits are conducted.",
    options: [
      { text: "provided that", is_correct: true, feedback: "'provided that'은 '~라는 조건으로'를 뜻하는 고급 조건 접속사입니다." },
      { text: "so that", is_correct: false, feedback: "so that은 목적(~하기 위하여)을 나타내어 문맥에 맞지 않습니다." },
      { text: "in case of", is_correct: false, feedback: "in case of는 전치사이므로 뒤에 주어+동사 절이 올 수 없습니다." },
      { text: "even if", is_correct: false, feedback: "감사가 진행되는 조건 하에 투자하겠다는 문맥이므로 양보는 부적절합니다." }
    ],
    answer: "provided that",
    translation: "투자 펀드는 분기별 종합 감사가 수행된다는 조건하에 그 스타트업에 자금을 지원하기로 합의했다.",
    explanation: {
      chunk_pattern: "주절, provided that S + V (조건의 부사절)",
      nuance: "비즈니스 계약 및 토익 900+ 실전에서 자주 출제되는 고급 조건 표현"
    },
    level: "Level 4"
  }
];

// 🏆 랭킹전 전용 10문제 (Level 1: 2문제, Level 2: 3문제, Level 3: 3문제, Level 4: 2문제) 신규 생성
export async function generateRankingCycleQuestions(
  cycleId: string,
  cycleName: string
): Promise<{ success: boolean; questions?: Question[]; error?: string }> {
  const models = ACTIVE_GEMINI_MODELS;

  const systemPrompt = `당신은 대한민국 최고의 수능/토익 영문법 1타 강사이자 공인 랭킹전 출제위원장입니다.
오늘의 실시간 명예의 전당 랭킹전(${cycleName})을 위해 객관식 4지선다 영문법 문제를 **정확히 10문제** JSON 배열로 생성하세요.

[🚨 난이도별 엄격한 문항 배분 원칙 - 정확히 10문제]
1. 1~2번 (2문제): Level 1 (기초 수일치, 명백한 시간 단서 시제, 조동사)
2. 3~5번 (3문제): Level 2 (5형식 사역/지각, 관계대명사, 수동태)
3. 6~8번 (3문제): Level 3 (분사구문, 부정어 도치, 당위성 insist that 동사원형)
4. 9~10번 (2문제): Level 4 (특수 도치 Hardly had S p.p., 고급 조건 접속사 provided that)

[출제 및 정답-해설 일치 엄격 규칙]
1. [빈칸 절대 표기]: sentence의 빈칸은 절대로 '(is / are)', '[is / are]' 처럼 보기를 괄호 안에 나열해서 쓰지 말고, 100% 반드시 '______' (밑줄 6개)로만 작성하세요.
2. [정답 텍스트 일치]: answer 필드는 1, 2, A 같은 번호가 아니라 반드시 '정답 영어 보기 텍스트 그 자체'를 정확하게 넣으세요.
3. [단 1개의 정답 플래그]: options 4개 중 오직 1개만 is_correct: true 로 지정하고, 나머지 3개는 is_correct: false 로 지정하세요.
4. [해설 일치]: options의 is_correct: true 항목의 feedback은 '정답인 문법적 이유'를 설명하고, is_correct: false 항목들은 '오답인 이유'를 명확하게 설명하세요.
5. [문형 및 뉘앙스]: explanation의 chunk_pattern과 nuance는 반드시 정답을 기준으로 일관되게 작성하세요.
6. [1~5형식]: form 필드는 1, 2, 3, 4, 5 정수만 사용.
7. [100% 한국어 해설]: translation, feedback, chunk_pattern, nuance 모두 100% 자연스러운 한국어로 작성.`;

  const userPrompt = `오늘의 랭킹전 회차: ${cycleId} (${cycleName})
정확히 10개의 문제를 JSON 배열로 반환하세요.`;

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
      },
      temperature: 0.3
    }
  };

  let lastError = "";

  for (const model of models) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          const formatted: Question[] = parsed.slice(0, 10).map((q: any, i: number) => {
            const normalized = normalizeAndFixQuestion(q);
            return {
              ...normalized,
              id: `ranking_${cycleId}_q${i + 1}`,
              options: shuffleOptions(normalized.options),
              level: i < 2 ? 'Level 1' : i < 5 ? 'Level 2' : i < 8 ? 'Level 3' : 'Level 4'
            };
          });
          return { success: true, questions: formatted };
        }
      }
    } catch (e: any) {
      console.warn(`Ranking cycle generation error with ${model}:`, e);
      lastError = e.message || String(e);
    }
  }

  // 🛡️ AI 호출 실패 시 비상 보증 10문제 마스터 팩 즉시 공급
  console.log("Using MASTER_RANKING_FALLBACK_PACK for ranking cycle...");
  const fallbackWithCycleId = MASTER_RANKING_FALLBACK_PACK.map((q, i) => {
    const normalized = normalizeAndFixQuestion(q);
    return {
      ...normalized,
      id: `ranking_${cycleId}_q${i + 1}`,
      options: shuffleOptions(normalized.options)
    };
  });

  return { 
    success: true, 
    questions: fallbackWithCycleId 
  };
}

// ==========================================
// 🛡️ 닉네임 유해성/부적절성 AI 자동 검수 엔진
// ==========================================

const PROFANITY_REGEX = /(시발|씨발|개새|병신|느금|애미|애비|섹스|보지|자지|운지|노무|보겸|앙기모|좆|존나|개씹|씹새|호로|바보병신|fuck|bitch|dick|pussy|nigger|faggot|cunt|bastard|asshole|whore|slut)/i;

export async function validateNicknameWithAI(nickname: string): Promise<{ isValid: boolean; reason?: string }> {
  const trimmed = nickname.trim();
  if (!trimmed) {
    return { isValid: false, reason: '닉네임을 입력해 주세요.' };
  }
  if (trimmed.length < 2 || trimmed.length > 12) {
    return { isValid: false, reason: '닉네임은 2자 이상 12자 이하로 설정해 주세요.' };
  }

  // 1차: 특수문자 검사 (한글, 영문, 숫자, 밑줄, 공백 허용)
  if (!/^[a-zA-Z0-9가-힣_\s]+$/.test(trimmed)) {
    return { isValid: false, reason: '닉네임에는 한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다.' };
  }

  // 1차: 정적 금칙어 정규식 즉시 차단
  if (PROFANITY_REGEX.test(trimmed.replace(/\s+/g, ''))) {
    return { isValid: false, reason: '욕설, 비속어 또는 부적절한 표현이 포함된 닉네임은 사용할 수 없습니다.' };
  }

  // 2차: Gemini AI 정밀 유해성 / 변형어 / 우회 검수
  try {
    const prompt = `당신은 청소년 및 대학생이 이용하는 교육용 영문법 앱의 닉네임 검수 AI입니다.
다음 닉네임이 욕설, 비속어, 성적/음란성, 혐오/차별, 사회적 비하, 패드립, 타인 사칭, 불법 홍보 등에 해당하는지 엄격하게 심사하세요.
닉네임: "${trimmed}"

반드시 아래 JSON 형식으로만 응답하세요:
{
  "isValid": true 또는 false,
  "reason": "부적절한 경우 사용자에게 보여줄 정중하고 명확한 거절 사유 (적절한 경우 빈 문자열)"
}`;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    };

    const models = ACTIVE_GEMINI_MODELS;
    for (const model of models) {
      try {
        const res = await callGeminiProxy(model, payload);
        const text = res?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed.isValid === 'boolean') {
            if (!parsed.isValid) {
              return { 
                isValid: false, 
                reason: parsed.reason || '부적절하거나 유해한 표현이 포함된 닉네임입니다.' 
              };
            }
            return { isValid: true };
          }
        }
      } catch (e) {
        // try next model
      }
    }
  } catch (e) {
    console.warn("AI Nickname validation fallback to static rule:", e);
  }

  // Fallback: AI 통신 오류 시 1차 검사 통과 상태로 허용
  return { isValid: true };
}
