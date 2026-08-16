import { Question, ExpressionItem } from '../types';

const LEVEL_RULES: Record<string, string> = {
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

// Helper: 문장 형식 1~5 정규화
export function sanitizeForm(form: any): number {
  const num = parseInt(String(form), 10);
  if (!isNaN(num) && num >= 1 && num <= 5) {
    return num;
  }
  return 3;
}

// 🔒 보안 프록시 호출 헬퍼 (API Key 브라우저 노출 100% 차단)
export async function callGeminiProxy(model: string, payload: any): Promise<any> {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, payload })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Proxy Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function generateBulkQuestions(
  difficultyLabel: string,
  weaknessFocus: string = "",
  count: number = 40
): Promise<{ success: boolean; questions?: Question[]; error?: string }> {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  
  let matchedRule = LEVEL_RULES['Level 1 (입문/초급)'];
  for (const [key, rule] of Object.entries(LEVEL_RULES)) {
    if (difficultyLabel.includes(key.split(' ')[0])) {
      matchedRule = rule;
      break;
    }
  }

  const systemPrompt = `당신은 대한민국 최고의 수능/토익 영문법 1타 강사 및 출제위원장입니다.
제시된 난이도 규칙에 맞춰 객관식 4지선다 영문법 문제를 정확히 ${count}개 생성하세요.

[🚨 절대 위반 불가 4대 출제 원칙 - 위반 시 무효]
1. [100% 한국어 상세 해설 의무화]
   - 모든 보기별 해설(feedback), 청크 설명(chunk_pattern), 뉘앙스 및 문법 포인트(nuance), 한국어 번역(translation)은 반드시 100% 자연스럽고 친절하며 명쾌한 한국어로 작성해야 합니다.
   - 각 보기가 왜 정답인지, 왜 오답인지 문법적 이유(예: '주어가 3인칭 단수이므로 동사원형은 수일치 오류', 'yesterday라는 명백한 과거 시점 부사가 있으므로 과거동사 필요')를 한국어로 상세히 적으세요.
2. [문장 형식 엄격 제한 - 오직 1, 2, 3, 4, 5형식만 허용]
   - 'form' 필드는 반드시 한국의 전통 5형식 문형(1=1형식 S+V, 2=2형식 S+V+C, 3=3형식 S+V+O, 4=4형식 S+V+IO+DO, 5=5형식 S+V+O+OC)에 따라 숫자 1, 2, 3, 4, 5 중 하나만 입력해야 합니다.
   - 9형식, 12형식, 13형식 같은 문법 챕터 번호나 5를 초과하는 숫자는 절대 입력 금지입니다!
3. [복수 정답 원천 차단 - 문맥/시간 단서 의무화]
   - 시제 관련 문제에는 반드시 'yesterday', 'every morning', 'since 2021', 'right now', 'last night', 'tomorrow' 등 명백한 시간 부사어/문맥을 포함하세요.
   - 시간 단서 없이 'He _____ her a flower (sends / sent)' 처럼 시제에 따라 둘 다 정답이 되는 애매한 문제는 절대 출제 금지입니다!
4. [단 1개의 수학적 유일 정답 & 명백한 오답]
   - 정답은 오직 1개여야 하며, 나머지 3개 오답 보기는 해당 빈칸에 넣었을 때 문법적으로 100% 명백한 오류(비문)여야 합니다.`;

  let userPrompt = `난이도: ${difficultyLabel}
[난이도별 출제 기준]
${matchedRule}\n`;

  if (weaknessFocus) {
    userPrompt += `[특별 맞춤 조건] 사용자의 취약 문법 형식(${weaknessFocus})을 70% 이상 집중적으로 포함하여 출제하세요.\n`;
  }

  userPrompt += `[문제 생성 조건 - 정확히 ${count}개 꽉 채워서 생성]
1. form 필드는 1, 2, 3, 4, 5 정수만 허용.
2. 빈칸은 문장에 단 1개("____")만 뚫으세요.
3. 4개의 보기(options)는 단답형 단어나 구로 구성하고, 각각 is_correct와 친절한 한국어 해설(feedback)을 작성하세요.
4. explanation에 chunk_pattern(핵심 문형/청크 한국어 설명)과 nuance(뉘앙스 및 쓰임새 한국어 설명)를 명시하세요.
5. translation은 자연스러운 표준 한국어 번역문이어야 합니다.`;

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

  let lastError = "";

  for (const model of models) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("AI 응답 본문이 비어 있습니다.");
      }

      const parsed: Question[] = JSON.parse(rawText);
      
      const sanitizedQuestions: Question[] = parsed.map(q => ({
        ...q,
        form: sanitizeForm(q.form)
      }));

      return { success: true, questions: sanitizedQuestions };
    } catch (e: any) {
      console.warn(`Error with model ${model} via proxy:`, e);
      lastError = e.message || String(e);
    }
  }

  return { success: false, error: lastError || "문제 생성 중 오류가 발생했습니다." };
}

// 🌟 5개 원어민 실전 표현 AI 생성 함수 (보안 프록시 호출)
export async function generateNativeExpressions(
  category: 'daily' | 'business' | 'travel' | 'pattern',
  existingExpressions: string[] = [],
  count: number = 5
): Promise<{ success: boolean; expressions?: ExpressionItem[]; error?: string }> {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];

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

// 🤖 1타 강사 AI 튜터 1:1 실시간 질문 함수 (보안 프록시 호출)
export async function askAiTutor(
  question: Question,
  userQuestion: string,
  userChoice?: string
): Promise<{ success: boolean; answer?: string; error?: string }> {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];

  const systemPrompt = `당신은 대한민국 최고의 수능/토익 영문법 1타 강사이자 회화 튜터입니다.
학생이 푼 영어 문제에 대해 궁금한 점을 질문했습니다.
친절하고 명쾌하며 핵심을 찌르는 족집게 과외 선생님처럼 100% 한국어로 학생의 눈높이에 맞춰 설명해 주세요.

[답변 가이드라인]
1. 불필요한 서론/인사말을 최소화하고, 핵심 원리부터 명쾌하게 설명하세요.
2. 학생이 헷갈려하는 문법 공식/표현 쓰임새와 정답/오답의 차이점을 구체적인 예시와 함께 대조해 주세요.
3. 실전 시험 및 회화에서 낚이지 않는 '1타 강사만의 꿀팁'을 1~2줄로 요약해 주세요.
4. 가독성을 위해 마크다운 볼드(**단어**), 이모지, 글머리 기호를 적극 활용하세요.`;

  const userPrompt = `[문제 정보]
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
      maxOutputTokens: 1000
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

// 🏆 랭킹전 전용 10문제 (Level 1: 2문제, Level 2: 3문제, Level 3: 3문제, Level 4: 2문제) 신규 생성
export async function generateRankingCycleQuestions(
  cycleId: string,
  cycleName: string
): Promise<{ success: boolean; questions?: Question[]; error?: string }> {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];

  const systemPrompt = `당신은 대한민국 최고의 수능/토익 영문법 1타 강사 및 공인 랭킹전 출제위원장입니다.
오늘의 실시간 명예의 전당 랭킹전(${cycleName})을 위해 객관식 4지선다 영문법 문제를 **정확히 10문제** 생성하세요.

[🚨 난이도별 엄격한 문항 배분 원칙 - 총 10문제]
1. 1~2번 문제 (2문제): Level 1 (입문/초급 - 기초 수일치, 기본 시제, 조동사, 1~3형식)
2. 3~5번 문제 (3문제): Level 2 (실력 중급 - 관계사, 5형식 사역/지각, 수동태, 현재완료, 분사)
3. 6~8번 문제 (3문제): Level 3 (고득점 도약 - 분사구문, 가정법, 부정어 도치, 제안/요구 동사)
4. 9~10번 문제 (2문제): Level 4 (실전 마스터 - 특수 도치, 혼합가정법, 고급 전치사구/관용표현)

[🚨 4대 출제 원칙]
1. 100% 한국어 상세 해설(feedback, nuance, chunk_pattern, translation)
2. 문장 형식(form)은 반드시 1, 2, 3, 4, 5 중 하나만 사용
3. 복수 정답 불가, 명백한 시간 단서/문맥 포함
4. 각 문제 객체에 "level": "Level 1" | "Level 2" | "Level 3" | "Level 4" 필드를 반드시 명시할 것`;

  const userPrompt = `오늘의 랭킹전 회차: ${cycleId} (${cycleName})
위 기준에 따라 1번부터 10번까지 완벽한 난이도 밸런스(Level 1: 2문제, Level 2: 3문제, Level 3: 3문제, Level 4: 2문제)의 랭킹전 전용 10문제를 JSON으로 출력하세요.`;

  const schema = {
    type: "OBJECT",
    properties: {
      questions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            sentence: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            answer: { type: "STRING" },
            translation: { type: "STRING" },
            form: { type: "INTEGER" },
            level: { type: "STRING" },
            explanation: {
              type: "OBJECT",
              properties: {
                correct_reason: { type: "STRING" },
                chunk_pattern: { type: "STRING" },
                feedback: {
                  type: "OBJECT",
                  properties: {
                    A: { type: "STRING" },
                    B: { type: "STRING" },
                    C: { type: "STRING" },
                    D: { type: "STRING" }
                  },
                  required: ["A", "B", "C", "D"]
                },
                nuance: { type: "STRING" }
              },
              required: ["correct_reason", "chunk_pattern", "feedback", "nuance"]
            }
          },
          required: ["sentence", "options", "answer", "translation", "form", "level", "explanation"]
        }
      }
    },
    required: ["questions"]
  };

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.3
    }
  };

  for (const model of models) {
    try {
      const resultData = await callGeminiProxy(model, payload);
      const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 10) {
          const formatted: Question[] = parsed.questions.map((q: any, i: number) => ({
            id: `ranking_${cycleId}_q${i + 1}`,
            form: sanitizeForm(q.form),
            sentence: q.sentence,
            options: q.options,
            answer: q.answer,
            translation: q.translation,
            explanation: q.explanation,
            level: q.level || (i < 2 ? 'Level 1' : i < 5 ? 'Level 2' : i < 8 ? 'Level 3' : 'Level 4')
          }));
          return { success: true, questions: formatted };
        }
      }
    } catch (e: any) {
      console.warn(`Ranking cycle generation error with ${model}:`, e);
    }
  }

  return { success: false, error: "랭킹전 문제를 AI로 생성하지 못했습니다." };
}
