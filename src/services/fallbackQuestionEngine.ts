import { Question, ExpressionItem } from '../types';
import { inferGrammarCategory, getGrammarTagInfo } from './grammarTagService';
import { shuffleOptions, normalizeAndFixQuestion } from './geminiService';

export interface FallbackTemplate {
  form: number;
  grammarCategory: string;
  grammarTag: string;
  difficulty: string; // 'Level 1 (입문/초급)' | 'Level 2 (실력 중급)' | 'Level 3 (고득점 도약)' | 'Level 4 (실전 마스터)'
  sentenceTemplate: (ctx: any) => string;
  correctAnswer: (ctx: any) => string;
  distractors: (ctx: any) => string[];
  translation: (ctx: any) => string;
  correctFeedback: (ctx: any) => string;
  distractorFeedbacks: (ctx: any) => string[];
  chunk_pattern: string;
  nuance: string;
}

// 📚 Dynamic Context Generators
const SUBJECTS_PLURAL = ['The board members', 'The senior engineers', 'The project managers', 'The marketing specialists', 'The research analysts', 'The international delegates'];
const SUBJECTS_SINGULAR = ['The executive director', 'The chief financial officer', 'The lead architect', 'The principal investigator', 'The operations supervisor'];
const COMPANIES = ['Nexus Corp', 'Apex Global', 'Vanguard Solutions', 'Hyperion Tech', 'Aegis Bio'];
const DEPARTMENTS = ['human resources', 'quality assurance', 'product development', 'strategic planning', 'financial auditing'];
const TOPICS = ['the quarterly revenue report', 'the renewable energy initiative', 'the safety compliance audit', 'the cloud migration project', 'the global expansion proposal'];

function pickRand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const FALLBACK_TEMPLATES: FallbackTemplate[] = [
  // ==========================================
  // LEVEL 1: 입문/초급
  // ==========================================
  {
    form: 1,
    grammarCategory: 'tense_voice',
    grammarTag: '시제 · 태',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `${ctx.name} ______ to the downtown office every morning by subway.`,
    correctAnswer: () => 'goes',
    distractors: () => ['go', 'going', 'gone'],
    translation: (ctx) => `${ctx.name}은(는) 매일 아침 지하철을 타고 시내 사무실로 출근합니다.`,
    correctFeedback: () => '3인칭 단수 주어 뒤에는 현재 시제 동사원형에 -(e)s가 붙은 "goes"가 와야 합니다.',
    distractorFeedbacks: () => [
      '"go"는 복수 주어 또는 1/2인칭에 쓰이는 원형입니다.',
      '"going"은 단독으로 문장의 본동사가 될 수 없는 현재분사/동명사입니다.',
      '"gone"은 be동사나 have 없이 단독으로 쓰일 수 없는 과거분사입니다.'
    ],
    chunk_pattern: '주어 (S) + 1형식 완전자동사 (goes) + 장소 부사구 (to the office) + 시간 부사구 (every morning)',
    nuance: '매일 반복되는 일상적인 습관을 나타내므로 현재 시제 3인칭 단수형을 사용합니다.'
  },
  {
    form: 2,
    grammarCategory: 'parts_of_speech',
    grammarTag: '품사 · 어휘',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The newly renovated meeting room looks extremely ______ and spacious.`,
    correctAnswer: () => 'clean',
    distractors: () => ['cleanly', 'cleanness', 'cleaning'],
    translation: () => '새로 리모델링된 회의실은 매우 깨끗하고 넓어 보입니다.',
    correctFeedback: () => '2형식 감각동사 look 뒤에는 주격 보어로 형용사 "clean"이 와야 합니다.',
    distractorFeedbacks: () => [
      '"cleanly"는 부사로, 2형식 감각동사의 보어 자리에 올 수 없습니다.',
      '"cleanness"는 명사로 주어와 동격 관계가 아니므로 보어로 부적합합니다.',
      '"cleaning"은 청소하는 동작을 뜻해 방의 상태를 묘사하기에 부자연스럽습니다.'
    ],
    chunk_pattern: '주어 (S) + 2형식 감각동사 (looks) + 부사 (extremely) + 형용사 보어 (clean)',
    nuance: '감각동사 뒤에는 한국어로 "~하게"로 해석되더라도 반드시 형용사 보어가 옵니다.'
  },
  {
    form: 3,
    grammarCategory: 'verbals',
    grammarTag: '준동사 핵심',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `${ctx.name} wants ______ the upcoming workshop on digital marketing.`,
    correctAnswer: () => 'to attend',
    distractors: () => ['attending', 'attended', 'attend'],
    translation: (ctx) => `${ctx.name}은(는) 다가오는 디지털 마케팅 워크숍에 참석하기를 원합니다.`,
    correctFeedback: () => '동사 want는 미래 지향적 목적어로 to부정사 "to attend"를 취합니다.',
    distractorFeedbacks: () => [
      '"attending"은 동명사로 want의 목적어로 쓰이지 않습니다.',
      '"attended"는 과거형 또는 과거분사로 목적어 자리에 올 수 없습니다.',
      '"attend"는 동사원형으로 want 뒤에 바로 이어질 수 없습니다.'
    ],
    chunk_pattern: '주어 (S) + 3형식 타동사 (wants) + to부정사 목적어 (to attend the workshop)',
    nuance: 'want, hope, plan, decide 등은 목적어로 to부정사를 취합니다.'
  },
  {
    form: 4,
    grammarCategory: 'subject_verb_agreement',
    grammarTag: '수일치 핵심',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The company ______ each new employee a welcome gift bag.`,
    correctAnswer: () => 'gives',
    distractors: () => ['give', 'giving', 'given'],
    translation: () => '그 회사는 신입 사원 각자에게 웰컴 선물 가방을 줍니다.',
    correctFeedback: () => '단수 주어 The company에 일치하는 4형식 수여동사 "gives"가 정답입니다.',
    distractorFeedbacks: () => [
      '"give"는 복수형 동사입니다.',
      '"giving"은 본동사가 될 수 없습니다.',
      '"given"은 수동태나 완료 시제 없이 단독으로 본동사가 될 수 없습니다.'
    ],
    chunk_pattern: '주어 (S) + 4형식 수여동사 (gives) + 간접목적어 (I.O) + 직접목적어 (D.O)',
    nuance: '회사나 조직과 같은 단수 명사는 단수 동사를 취합니다.'
  },
  {
    form: 5,
    grammarCategory: 'verbals',
    grammarTag: '준동사 핵심',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The teacher helped the students ______ the difficult problem.`,
    correctAnswer: () => 'solve',
    distractors: () => ['solved', 'solving', 'solution'],
    translation: () => '선생님은 학생들이 그 어려운 문제를 해결하도록 도와주었습니다.',
    correctFeedback: () => '준사역동사 help는 목적격 보어로 동사원형 또는 to부정사를 취하므로 "solve"가 정답입니다.',
    distractorFeedbacks: () => [
      '"solved"는 과거분사로 능동 관계에 적합하지 않습니다.',
      '"solving"은 현재분사로 help의 일반적인 목적격 보어로 쓰이지 않습니다.',
      '"solution"은 명사로 적절한 보어 역할을 하지 못합니다.'
    ],
    chunk_pattern: '주어 (S) + 5형식 준사역동사 (helped) + 목적어 (O) + 목적격보어 원형 (solve)',
    nuance: 'help + 목적어 + (to) 동사원형 공식입니다.'
  },

  // ==========================================
  // LEVEL 2: 실력 중급
  // ==========================================
  {
    form: 2,
    grammarCategory: 'parts_of_speech',
    grammarTag: '품사 · 어휘',
    difficulty: 'Level 2 (실력 중급)',
    sentenceTemplate: (ctx) => `All employees are strongly encouraged to remain ______ during the safety inspection.`,
    correctAnswer: () => 'attentive',
    distractors: () => ['attentively', 'attention', 'attentiveness'],
    translation: () => '모든 직원들은 안전 점검 동안 세심하게 주의를 기울인 상태를 유지하도록 강력히 권고됩니다.',
    correctFeedback: () => '2형식 상태유지 동사 remain 뒤에는 주격 보어로 형용사 "attentive"가 옵니다.',
    distractorFeedbacks: () => [
      '"attentively"는 부사로 2형식 동사 remain의 보어가 될 수 없습니다.',
      '"attention"은 명사로 사람 주어의 상태를 설명하는 보어로 어색합니다.',
      '"attentiveness"는 추상명사로 부적절합니다.'
    ],
    chunk_pattern: '주어 (S) + to부정사 상태유지동사 (remain) + 형용사 보어 (attentive)',
    nuance: 'remain, keep, stay 뒤에는 형용사 보어가 연결됩니다.'
  },
  {
    form: 3,
    grammarCategory: 'connectors',
    grammarTag: '접속사 vs 전치사',
    difficulty: 'Level 2 (실력 중급)',
    sentenceTemplate: (ctx) => `The delivery arrived on schedule ______ the severe weather conditions.`,
    correctAnswer: () => 'despite',
    distractors: () => ['although', 'even though', 'because'],
    translation: () => '악천후에도 불구하고 배송은 예정대로 정시에 도착했습니다.',
    correctFeedback: () => '뒤에 명사구(the severe weather conditions)가 이어지므로 양보 전치사 "despite"가 정답입니다.',
    distractorFeedbacks: () => [
      '"although"는 접속사로 뒤에 [주어+동사] 절이 와야 합니다.',
      '"even though" 역시 접속사이므로 명사구 앞에는 올 수 없습니다.',
      '"because"는 접속사이자 인과 관계이므로 문맥과 문법 모두 맞지 않습니다.'
    ],
    chunk_pattern: '주어 (S) + 동사 (arrived) + 전치사구 (despite + 명사구)',
    nuance: 'despite / in spite of (+ 명사구) vs although / even though (+ 주어 + 동사) 구별 문제입니다.'
  },
  {
    form: 5,
    grammarCategory: 'verbals',
    grammarTag: '준동사 핵심',
    difficulty: 'Level 2 (실력 중급)',
    sentenceTemplate: (ctx) => `The new software enables team members ______ large data files in real time.`,
    correctAnswer: () => 'to process',
    distractors: () => ['processing', 'process', 'processed'],
    translation: () => '새 소프트웨어는 팀원들이 대용량 데이터 파일을 실시간으로 처리할 수 있도록 해줍니다.',
    correctFeedback: () => 'enable + 목적어 + to부정사 구문으로 목적격 보어 자리에 "to process"가 와야 합니다.',
    distractorFeedbacks: () => [
      '"processing"은 동명사로 enable의 목적격 보어로 쓸 수 없습니다.',
      '"process"는 동사원형으로 사역/지각동사가 아니므로 올 수 없습니다.',
      '"processed"는 과거분사로 능동 관계에 맞지 않습니다.'
    ],
    chunk_pattern: '주어 (The software) + 5형식 동사 (enables) + 목적어 (team members) + 목적격보어 (to process)',
    nuance: 'allow, enable, encourage, require, cause + O + to-V 필수 5형식 문형입니다.'
  },
  {
    form: 3,
    grammarCategory: 'clauses_relatives',
    grammarTag: '관계사 · 명사절',
    difficulty: 'Level 2 (실력 중급)',
    sentenceTemplate: (ctx) => `The architect ______ designed the cultural center received an international award.`,
    correctAnswer: () => 'who',
    distractors: () => ['which', 'whom', 'whose'],
    translation: () => '그 문화 센터를 설계한 건축가는 국제상을 받았습니다.',
    correctFeedback: () => '선행사가 사람(The architect)이고 뒤에 동사(designed)가 이어지는 주격 관계대명사 "who"가 정답입니다.',
    distractorFeedbacks: () => [
      '"which"는 사물/동물 선행사에 쓰입니다.',
      '"whom"은 목적격 관계대명사로 주어 자리에 올 수 없습니다.',
      '"whose"는 소유격 관계대명사로 뒤에 명사가 바로 이어져야 합니다.'
    ],
    chunk_pattern: '선행사 (The architect) + 주격 관계대명사절 (who designed ...) + 본동사 (received)',
    nuance: '사람 선행사 + 주격 관계대명사 who의 기본 쓰임입니다.'
  },

  // ==========================================
  // LEVEL 3: 고득점 도약
  // ==========================================
  {
    form: 3,
    grammarCategory: 'modals_subjunctive',
    grammarTag: '가정법 · 조동사',
    difficulty: 'Level 3 (고득점 도약)',
    sentenceTemplate: (ctx) => `The executive board insisted that the entire marketing budget ______ allocated transparently across all departments.`,
    correctAnswer: () => 'be',
    distractors: () => ['was', 'is', 'has been'],
    translation: () => '이사회는 전체 마케팅 예산이 모든 부서에 걸쳐 투명하게 배정되어야 한다고 강력히 주장했습니다.',
    correctFeedback: () => '주장/요구/제안 동사 insist 뒤의 that절에는 당위성을 뜻하는 (should) + 동사원형이 오므로 수동태 원형인 "be"가 정답입니다.',
    distractorFeedbacks: () => [
      '"was"는 단순 과거 시제로 당위성 주장 구문에 맞지 않습니다.',
      '"is"는 시제 일치 및 당위성 원형 규칙에 위배됩니다.',
      '"has been"은 완료 시제로 원형 동사가 요구되는 자리에 올 수 없습니다.'
    ],
    chunk_pattern: '주장동사 (insisted that) + 주어 (the budget) + (should 생략) + 동사원형 수동태 (be allocated)',
    nuance: 'insist, suggest, demand, require, order + that + S + (should) + 동사원형 수능/토익 빈출 공식입니다.'
  },
  {
    form: 1,
    grammarCategory: 'special_structures',
    grammarTag: '특수구문 · 도치',
    difficulty: 'Level 3 (고득점 도약)',
    sentenceTemplate: (ctx) => `Hardly ______ the presentation when the potential investors began asking critical financial questions.`,
    correctAnswer: () => 'had she finished',
    distractors: () => ['she had finished', 'did she finish', 'has she finished'],
    translation: () => '그녀가 발표를 마치자마자 잠재적 투자자들이 중대한 재무 관련 질문들을 쏟아내기 시작했습니다.',
    correctFeedback: () => '부정어 Hardly가 문두에 위치하면 [조동사(had) + 주어 + 과거분사]의 도치 구조가 되어야 합니다.',
    distractorFeedbacks: () => [
      '"she had finished"는 도치가 일어나지 않은 평서문 어순이므로 틀립니다.',
      '"did she finish"는 when절의 과거 시점보다 앞선 대과거를 나타내지 못합니다.',
      '"has she finished"는 현재완료로 과거 시점인 began과 호응하지 않습니다.'
    ],
    chunk_pattern: '부정어 (Hardly) + 조동사 (had) + 주어 (she) + p.p. (finished) + when + 과거동사',
    nuance: 'Hardly / Scarcely had S p.p. when/before S 과거동사 (~하자마자 ~했다) 특수 도치 구문입니다.'
  },
  {
    form: 3,
    grammarCategory: 'clauses_relatives',
    grammarTag: '관계사 · 명사절',
    difficulty: 'Level 3 (고득점 도약)',
    sentenceTemplate: (ctx) => `The research team discussed ______ factor contributed most significantly to the unexpected outcome.`,
    correctAnswer: () => 'which',
    distractors: () => ['that', 'what', 'where'],
    translation: () => '연구팀은 어떤 요인이 예상치 못한 결과에 가장 크게 기여했는지를 논의했습니다.',
    correctFeedback: () => '정해진 범위 내에서 명사(factor)를 수식하는 의문형용사 역할을 하므로 "which"가 정답입니다.',
    distractorFeedbacks: () => [
      '"that"은 의문형용사로 쓰여 질문적 선택의 뉘앙스를 전달하지 못합니다.',
      '"what"은 무제한적 범위에 쓰이며, 제한된 실험 변수들 중 선택에는 which가 우선합니다.',
      '"where"는 관계부사/의문부사로 명사 factor를 수식할 수 없습니다.'
    ],
    chunk_pattern: '타동사 (discussed) + 의문형용사 명사절 (which factor contributed ...)',
    nuance: '선택의 범위가 주어졌을 때 명사를 수식하는 의문형용사 which의 쓰임입니다.'
  },
  {
    form: 3,
    grammarCategory: 'verbals',
    grammarTag: '준동사 핵심',
    difficulty: 'Level 3 (고득점 도약)',
    sentenceTemplate: (ctx) => `With digital security threats ______ worldwide, corporations must strengthen their cyber defenses.`,
    correctAnswer: () => 'escalating',
    distractors: () => ['escalate', 'escalated', 'escalation'],
    translation: () => '전 세계적으로 디지털 보안 위협이 고조됨에 따라, 기업들은 사이버 방어망을 강화해야 합니다.',
    correctFeedback: () => 'With + 목적어(digital security threats) + 분사 구문에서 위협이 능동적으로 증가하고 있으므로 현재분사 "escalating"이 정답입니다.',
    distractorFeedbacks: () => [
      '"escalate"는 동사원형으로 전치사 with의 보어로 올 수 없습니다.',
      '"escalated"는 수동태로 자동사적 증가의 뉘앙스에 부적합합니다.',
      '"escalation"은 명사로 목적어와 연속되는 명사 중복이 됩니다.'
    ],
    chunk_pattern: 'With + 명사 목적어 (threats) + 현재분사 (escalating) + 부사구 (worldwide)',
    nuance: 'With + O + ~ing/p.p. (부대상황 분사구문)의 대표적 고급 문형입니다.'
  },

  // ==========================================
  // LEVEL 4: 실전 마스터
  // ==========================================
  {
    form: 3,
    grammarCategory: 'modals_subjunctive',
    grammarTag: '가정법 · 조동사',
    difficulty: 'Level 4 (실전 마스터)',
    sentenceTemplate: (ctx) => `______ any discrepancy arise during the fiscal compliance audit, the legal counsel should be notified immediately.`,
    correctAnswer: () => 'Should',
    distractors: () => ['Were', 'Had', 'Would'],
    translation: () => '회계 규정 준수 감사 중 어떠한 불일치라도 발생할 경우, 즉시 법률 고문에게 통보되어야 합니다.',
    correctFeedback: () => 'If가 생략된 가정법 미래 도치 구문 [Should + 주어 + 동사원형] 구조로, 단수 주어(any discrepancy)임에도 동사원형 arise가 왔으므로 "Should"가 정답입니다.',
    distractorFeedbacks: () => [
      '"Were"는 Were S to-V 또는 Were S 보어 형태여야 하므로 동사원형 arise와 결합할 수 없습니다.',
      '"Had"는 Had S p.p. 형태의 과거완료 도치여야 하므로 부적합합니다.',
      '"Would"는 조건절의 도치를 이끄는 조동사로 쓰이지 않습니다.'
    ],
    chunk_pattern: '가정법 도치 (Should) + 주어 (any discrepancy) + 동사원형 (arise) + 귀결절 (S + should be p.p.)',
    nuance: 'If S should V -> Should S V (혹시라도 ~한다면) 토익 900+/편입 1위 킬러 도치 구문입니다.'
  },
  {
    form: 3,
    grammarCategory: 'verb_patterns',
    grammarTag: '자·타동사 콜로케이션',
    difficulty: 'Level 4 (실전 마스터)',
    sentenceTemplate: (ctx) => `The executive director is fully committed to ______ the long-term sustainability goals of the international organization.`,
    correctAnswer: () => 'achieving',
    distractors: () => ['achieve', 'achievement', 'achieved'],
    translation: () => '상임이사는 국제기구의 장기적인 지속가능성 목표를 달성하는 데 전적으로 헌신하고 있습니다.',
    correctFeedback: () => 'be committed to의 to는 전치사이므로 뒤에 명사 또는 동명사 목적어인 "achieving"이 와야 합니다.',
    distractorFeedbacks: () => [
      '"achieve"는 동사원형으로 전치사 to 뒤에 올 수 없습니다.',
      '"achievement"는 뒤에 목적어(the goals)를 직접 취할 수 없는 순수 명사입니다.',
      '"achieved"는 과거분사로 전치사의 목적어가 될 수 없습니다.'
    ],
    chunk_pattern: '주어 (S) + be committed to (전치사) + 동명사 목적어 (achieving the goals)',
    nuance: 'be dedicated/committed/devoted to -ing, look forward to -ing (전치사 to 구별 킬러)'
  },
  {
    form: 3,
    grammarCategory: 'modals_subjunctive',
    grammarTag: '가정법 · 조동사',
    difficulty: 'Level 4 (실전 마스터)',
    sentenceTemplate: (ctx) => `Had the venture capital firm not intervened in time, the startup ______ bankrupt before the third quarter.`,
    correctAnswer: () => 'would have gone',
    distractors: () => ['went', 'will go', 'would go'],
    translation: () => '벤처 캐피털 회사가 제때 개입하지 않았더라면, 그 스타트업은 3분기가 되기 전에 파산했을 것입니다.',
    correctFeedback: () => 'If가 생략된 가정법 과거완료 도치절(Had S not p.p.)에 호응하는 주절은 [S + would have p.p.]인 "would have gone"이 정답입니다.',
    distractorFeedbacks: () => [
      '"went"는 단순 과거 시제로 가정법 주절에 올 수 없습니다.',
      '"will go"는 단순 미래 시제로 과거 사실의 반대 가정에 맞지 않습니다.',
      '"would go"는 가정법 과거 귀결절로 대과거 조건절과 시제가 불일치합니다.'
    ],
    chunk_pattern: '가정법 대과거 조건절 (Had S not p.p.) + 주절 (S + would have p.p.)',
    nuance: 'Had S (not) p.p. ~ S would/could/might have p.p. (가정법 과거완료 If 생략 도치)'
  },
  {
    form: 3,
    grammarCategory: 'parallel_agreement',
    grammarTag: '병렬 · 상관접속',
    difficulty: 'Level 4 (실전 마스터)',
    sentenceTemplate: (ctx) => `The financial performance of the newly acquired enterprise is significantly higher than ______ of its regional competitors.`,
    correctAnswer: () => 'that',
    distractors: () => ['those', 'this', 'these'],
    translation: () => '새로 인수한 기업의 재무 성과는 해당 지역 경쟁업체들의 재무 성과보다 훨씬 더 높습니다.',
    correctFeedback: () => '비교 대상인 단수 명사 "The financial performance"를 대신하는 대명사이므로 "that"이 정답입니다.',
    distractorFeedbacks: () => [
      '"those"는 복수 명사를 대신할 때 쓰입니다.',
      '"this"는 비교 구문에서 후치 수식어구의 한정을 받는 대명사로 쓰이지 않습니다.',
      '"these"는 복수 지시대명사로 비교 대명사 용법에 맞지 않습니다.'
    ],
    chunk_pattern: '단수명사 (The performance) + is higher than + 비교대명사 (that of competitors)',
    nuance: '비교 대상의 일치: 앞선 단수명사 대신 that of, 복수명사 대신 those of (토익/편입 빈출)'
  }
];

// 🚀 Generate robust questions covering requested parameters
export function generateFallbackQuestions(
  difficultyLabel: string,
  count: number = 40,
  weaknessFocus?: string,
  targetForms?: number[]
): Question[] {
  const normDiff = difficultyLabel.includes('Level 4') || difficultyLabel.includes('실전') ? 'Level 4 (실전 마스터)'
    : difficultyLabel.includes('Level 3') || difficultyLabel.includes('고득점') ? 'Level 3 (고득점 도약)'
    : difficultyLabel.includes('Level 2') || difficultyLabel.includes('중급') ? 'Level 2 (실력 중급)'
    : 'Level 1 (입문/초급)';

  let pool = FALLBACK_TEMPLATES.filter(t => t.difficulty === normDiff);
  if (pool.length === 0) pool = FALLBACK_TEMPLATES;

  const result: Question[] = [];

  for (let i = 0; i < count; i++) {
    const tmpl = pool[i % pool.length];
    const ctx = {
      name: Math.random() > 0.5 ? pickRand(['David', 'Sarah', 'Alex', 'Elena', 'Michael', 'Rachel']) : pickRand(SUBJECTS_SINGULAR),
      company: pickRand(COMPANIES),
      dept: pickRand(DEPARTMENTS),
      topic: pickRand(TOPICS)
    };

    const sentence = tmpl.sentenceTemplate(ctx);
    const ans = tmpl.correctAnswer(ctx);
    const dist = tmpl.distractors(ctx);
    const trans = tmpl.translation(ctx);
    const cFeed = tmpl.correctFeedback(ctx);
    const dFeeds = tmpl.distractorFeedbacks(ctx);

    const rawOptions = [
      { text: ans, is_correct: true, feedback: cFeed },
      ...dist.map((d, idx) => ({
        text: d,
        is_correct: false,
        feedback: dFeeds[idx] || `${d}는 문법적으로 적절하지 않습니다.`
      }))
    ];

    const formNum = targetForms && targetForms.length > 0 
      ? targetForms[i % targetForms.length]
      : tmpl.form;

    const baseQ: Question = {
      form: formNum,
      difficulty: normDiff,
      level: normDiff,
      grammarCategory: tmpl.grammarCategory,
      grammarTag: tmpl.grammarTag,
      sentence,
      options: rawOptions,
      answer: ans,
      translation: trans,
      explanation: {
        chunk_pattern: tmpl.chunk_pattern,
        nuance: tmpl.nuance
      }
    };

    const cleaned = normalizeAndFixQuestion(baseQ);
    result.push({
      ...cleaned,
      options: shuffleOptions(cleaned.options)
    });
  }

  return result;
}

// 🎯 Generate topic questions on demand
export function generateFallbackTopicQuestions(
  topicId: string,
  levelNumber: number = 2,
  count: number = 10
): Question[] {
  const catInfo = getGrammarTagInfo(topicId);
  const lvlLabel = levelNumber === 4 ? 'Level 4 (실전 마스터)'
    : levelNumber === 3 ? 'Level 3 (고득점 도약)'
    : levelNumber === 2 ? 'Level 2 (실력 중급)'
    : 'Level 1 (입문/초급)';

  const generated = generateFallbackQuestions(lvlLabel, count);
  return generated.map(q => ({
    ...q,
    grammarCategory: catInfo.id,
    grammarTag: catInfo.badgeKo
  }));
}
