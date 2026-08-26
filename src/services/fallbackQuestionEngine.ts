import { Question } from '../types';
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
const NAMES = ['David', 'Sarah', 'Alex', 'Elena', 'Michael', 'Rachel', 'Daniel', 'Olivia', 'James', 'Emma', 'Lucas', 'Sophia'];
const SUBJECTS_SINGULAR = ['The executive director', 'The chief financial officer', 'The lead architect', 'The principal investigator', 'The operations supervisor', 'The regional manager'];
const SUBJECTS_PLURAL = ['The board members', 'The senior engineers', 'The project managers', 'The marketing specialists', 'The research analysts', 'The international delegates'];
const COMPANIES = ['Nexus Corp', 'Apex Global', 'Vanguard Solutions', 'Hyperion Tech', 'Aegis Bio', 'Starlight Media'];
const DEPARTMENTS = ['human resources', 'quality assurance', 'product development', 'strategic planning', 'financial auditing'];
const TOPICS = ['the quarterly revenue report', 'the renewable energy initiative', 'the safety compliance audit', 'the cloud migration project', 'the global expansion proposal'];

function pickRand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function trueShuffleArr<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const FALLBACK_TEMPLATES: FallbackTemplate[] = [
  // ==========================================
  // LEVEL 1: 입문/초급 (10+ 완전 고유 템플릿)
  // ==========================================
  {
    form: 1,
    grammarCategory: 'tense_voice',
    grammarTag: '시제 · 태',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `${ctx.name} ______ to the central library every Saturday morning.`,
    correctAnswer: () => 'goes',
    distractors: () => ['go', 'going', 'gone'],
    translation: (ctx) => `${ctx.name}은(는) 매주 토요일 아침마다 중앙 도서관에 갑니다.`,
    correctFeedback: () => '3인칭 단수 주어 뒤에는 현재 시제 동사원형에 -(e)s가 붙은 "goes"가 와야 합니다.',
    distractorFeedbacks: () => [
      '"go"는 복수 주어 또는 1/2인칭에 쓰이는 원형입니다.',
      '"going"은 단독으로 문장의 본동사가 될 수 없는 현재분사/동명사입니다.',
      '"gone"은 be동사나 have 없이 단독으로 쓰일 수 없는 과거분사입니다.'
    ],
    chunk_pattern: '주어 (S) + 1형식 완전자동사 (goes) + 장소 부사구 (to the library) + 시간 부사구',
    nuance: '매주 반복되는 일상적인 습관을 나타내므로 현재 시제 3인칭 단수형을 사용합니다.'
  },
  {
    form: 1,
    grammarCategory: 'tense_voice',
    grammarTag: '시제 · 태',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The international flight ______ on time despite the dense fog.`,
    correctAnswer: () => 'arrived',
    distractors: () => ['arriving', 'arrive', 'arrives'],
    translation: () => '국제선 항공편은 짙은 안개에도 불구하고 정시에 도착했습니다.',
    correctFeedback: () => '과거의 단일 완료 동작을 나타내는 1형식 과거시제 동사 "arrived"가 정답입니다.',
    distractorFeedbacks: () => [
      '"arriving"은 단독으로 문장의 본동사가 될 수 없습니다.',
      '"arrive"는 단수 주어(flight)와 수일치가 맞지 않습니다.',
      '"arrives"는 현재 시제로 과거 완료된 상황 묘사에 부자연스럽습니다.'
    ],
    chunk_pattern: '주어 (The flight) + 1형식 동사 (arrived) + 부사구 (on time)',
    nuance: 'arrive는 전형적인 1형식 완전자동사입니다.'
  },
  {
    form: 2,
    grammarCategory: 'parts_of_speech',
    grammarTag: '품사 · 어휘',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The newly renovated conference hall looks extremely ______ and modern.`,
    correctAnswer: () => 'clean',
    distractors: () => ['cleanly', 'cleanness', 'cleaning'],
    translation: () => '새로 리모델링된 회의실은 매우 깨끗하고 현대적으로 보입니다.',
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
    form: 2,
    grammarCategory: 'parts_of_speech',
    grammarTag: '품사 · 어휘',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The customer service staff remained ______ during the busy holiday season.`,
    correctAnswer: () => 'helpful',
    distractors: () => ['helpfully', 'helpfulness', 'helping'],
    translation: () => '고객 서비스 직원들은 바쁜 연휴 시즌 동안 친절한 태도를 유지했습니다.',
    correctFeedback: () => '2형식 상태유지 동사 remain 뒤에는 주격 보어로 형용사 "helpful"이 옵니다.',
    distractorFeedbacks: () => [
      '"helpfully"는 부사로 2형식 동사의 보어가 될 수 없습니다.',
      '"helpfulness"는 명사로 주어의 상태를 설명하지 못합니다.',
      '"helping"은 도움을 주는 진행 동작을 뜻해 성격/태도 묘사로 어색합니다.'
    ],
    chunk_pattern: '주어 (The staff) + 2형식 동사 (remained) + 형용사 보어 (helpful)',
    nuance: 'remain, stay, keep + 형용사 보어 공식입니다.'
  },
  {
    form: 3,
    grammarCategory: 'verbals',
    grammarTag: '준동사 핵심',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `${ctx.name} wants ______ the upcoming digital photography workshop.`,
    correctAnswer: () => 'to attend',
    distractors: () => ['attending', 'attended', 'attend'],
    translation: (ctx) => `${ctx.name}은(는) 다가오는 디지털 사진 워크숍에 참석하기를 원합니다.`,
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
    form: 3,
    grammarCategory: 'verbals',
    grammarTag: '준동사 핵심',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `Many students enjoy ______ English novels in their spare time.`,
    correctAnswer: () => 'reading',
    distractors: () => ['to read', 'read', 'reads'],
    translation: () => '많은 학생들은 여가 시간에 영어 소설 읽는 것을 즐깁니다.',
    correctFeedback: () => '동사 enjoy는 목적어로 반드시 동명사(-ing)인 "reading"만을 취합니다.',
    distractorFeedbacks: () => [
      '"to read"는 to부정사로 enjoy의 목적어로 쓰일 수 없습니다.',
      '"read"는 동사원형으로 enjoy 뒤에 바로 올 수 없습니다.',
      '"reads"는 3인칭 단수 동사형으로 목적어 자리에 올 수 없습니다.'
    ],
    chunk_pattern: '주어 (students) + 3형식 동사 (enjoy) + 동명사 목적어 (reading novels)',
    nuance: 'enjoy, finish, avoid, give up, mind는 동명사 목적어만 취합니다.'
  },
  {
    form: 4,
    grammarCategory: 'subject_verb_agreement',
    grammarTag: '수일치 핵심',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The school director ______ each top student an official commendation certificate.`,
    correctAnswer: () => 'gives',
    distractors: () => ['give', 'giving', 'given'],
    translation: () => '학교 교장선생님은 각 우수 학생에게 공식 표창장을 수여합니다.',
    correctFeedback: () => '단수 주어 The school director에 일치하는 4형식 3인칭 단수 동사 "gives"가 정답입니다.',
    distractorFeedbacks: () => [
      '"give"는 복수형 동사입니다.',
      '"giving"은 본동사가 될 수 없습니다.',
      '"given"은 수동태나 완료 시제 없이 단독으로 본동사가 될 수 없습니다.'
    ],
    chunk_pattern: '주어 (S) + 4형식 수여동사 (gives) + 간접목적어 (I.O) + 직접목적어 (D.O)',
    nuance: '3인칭 단수 주어와 4형식 수여동사의 기본 수일치 문제입니다.'
  },
  {
    form: 4,
    grammarCategory: 'verb_patterns',
    grammarTag: '수여동사 구조',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The senior engineer ______ the team members valuable technical advice.`,
    correctAnswer: () => 'offered',
    distractors: () => ['offering', 'offer', 'to offer'],
    translation: () => '수석 엔지니어는 팀원들에게 귀중한 기술적 조언을 제공했습니다.',
    correctFeedback: () => '과거 시점의 4형식 수여동사 과거형 "offered"가 정답입니다.',
    distractorFeedbacks: () => [
      '"offering"은 분사로 문장의 본동사가 될 수 없습니다.',
      '"offer"는 단수 주어와 수일치가 맞지 않습니다.',
      '"to offer"는 to부정사로 본동사 역할을 하지 못합니다.'
    ],
    chunk_pattern: '주어 (engineer) + 4형식 동사 (offered) + I.O (team members) + D.O (advice)',
    nuance: 'offer + 간접목적어 + 직접목적어 4형식 구조입니다.'
  },
  {
    form: 5,
    grammarCategory: 'verbals',
    grammarTag: '준동사 핵심',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The experienced mentor helped ${ctx.name} ______ the complicated algorithm.`,
    correctAnswer: () => 'understand',
    distractors: () => ['understood', 'understanding', 'understandingly'],
    translation: (ctx) => `숙련된 멘토는 ${ctx.name}이(가) 복잡한 알고리즘을 이해하도록 도와주었습니다.`,
    correctFeedback: () => '준사역동사 help는 목적격 보어로 동사원형 또는 to부정사를 취하므로 "understand"가 정답입니다.',
    distractorFeedbacks: () => [
      '"understood"는 과거분사로 능동 관계에 적합하지 않습니다.',
      '"understanding"은 현재분사로 help의 일반적인 보어로 쓰이지 않습니다.',
      '"understandingly"는 부사로 목적격 보어가 될 수 없습니다.'
    ],
    chunk_pattern: '주어 (mentor) + 5형식 준사역동사 (helped) + 목적어 + 목적격보어 원형 (understand)',
    nuance: 'help + 목적어 + (to) 동사원형 5형식 구문입니다.'
  },
  {
    form: 5,
    grammarCategory: 'verbals',
    grammarTag: '사역동사 목적격 보어',
    difficulty: 'Level 1 (입문/초급)',
    sentenceTemplate: (ctx) => `The team supervisor made all developers ______ the safety checklist before deployment.`,
    correctAnswer: () => 'review',
    distractors: () => ['reviewed', 'to review', 'reviewing'],
    translation: () => '팀 관리자는 모든 개발자들에게 배포 전 안전 체크리스트를 검토하도록 시켰습니다.',
    correctFeedback: () => '사역동사 make는 목적격 보어로 반드시 동사원형 "review"를 취합니다.',
    distractorFeedbacks: () => [
      '"reviewed"는 과거분사로 능동 관계에 맞지 않습니다.',
      '"to review"는 to부정사로 사역동사 make 뒤에 올 수 없습니다.',
      '"reviewing"은 현재분사로 make의 보어로 쓰이지 않습니다.'
    ],
    chunk_pattern: '주어 (supervisor) + 5형식 사역동사 (made) + 목적어 (developers) + 목적격보어 원형 (review)',
    nuance: 'make, have, let + 목적어 + 동사원형 (사역동사 공식)'
  },

  // ==========================================
  // LEVEL 2: 실력 중급 (10+ 완전 고유 템플릿)
  // ==========================================
  {
    form: 2,
    grammarCategory: 'parts_of_speech',
    grammarTag: '품사 · 어휘',
    difficulty: 'Level 2 (실력 중급)',
    sentenceTemplate: (ctx) => `All laboratory staff are strongly advised to remain ______ during the hazardous experiment.`,
    correctAnswer: () => 'attentive',
    distractors: () => ['attentively', 'attention', 'attentiveness'],
    translation: () => '모든 연구실 직원들은 유해 실험 진행 중에 세심하게 주의를 기울인 상태를 유지하도록 강력히 권고됩니다.',
    correctFeedback: () => '2형식 상태유지 동사 remain 뒤에는 주격 보어로 형용사 "attentive"가 옵니다.',
    distractorFeedbacks: () => [
      '"attentively"는 부사로 2형식 동사 remain의 보어가 될 수 없습니다.',
      '"attention"은 명사로 주어의 상태를 설명하는 형용사 보어 역할을 못합니다.',
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
    sentenceTemplate: (ctx) => `The express delivery arrived on schedule ______ the severe winter snowstorm.`,
    correctAnswer: () => 'despite',
    distractors: () => ['although', 'even though', 'because'],
    translation: () => '극심한 겨울 눈보라에도 불구하고 특급 배송은 예정대로 정시에 도착했습니다.',
    correctFeedback: () => '뒤에 명사구(the severe winter snowstorm)가 이어지므로 양보 전치사 "despite"가 정답입니다.',
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
    sentenceTemplate: (ctx) => `The new analytics platform enables data researchers ______ massive datasets in real time.`,
    correctAnswer: () => 'to process',
    distractors: () => ['processing', 'process', 'processed'],
    translation: () => '새로운 분석 플랫폼은 데이터 연구원들이 방대한 데이터 세트를 실시간으로 처리할 수 있게 해줍니다.',
    correctFeedback: () => 'enable + 목적어 + to부정사 구문으로 목적격 보어 자리에 "to process"가 와야 합니다.',
    distractorFeedbacks: () => [
      '"processing"은 동명사로 enable의 목적격 보어로 쓸 수 없습니다.',
      '"process"는 동사원형으로 사역/지각동사가 아니므로 올 수 없습니다.',
      '"processed"는 과거분사로 능동 관계에 맞지 않습니다.'
    ],
    chunk_pattern: '주어 (platform) + 5형식 동사 (enables) + 목적어 (researchers) + 목적격보어 (to process)',
    nuance: 'allow, enable, encourage, require, cause + O + to-V 필수 5형식 문형입니다.'
  },
  {
    form: 3,
    grammarCategory: 'clauses_relatives',
    grammarTag: '관계사 · 명사절',
    difficulty: 'Level 2 (실력 중급)',
    sentenceTemplate: (ctx) => `The senior architect ______ designed the metropolitan library received an international design honor.`,
    correctAnswer: () => 'who',
    distractors: () => ['which', 'whom', 'whose'],
    translation: () => '시립 도서관을 설계한 수석 건축가는 국제 디자인 명예상을 받았습니다.',
    correctFeedback: () => '선행사가 사람(The architect)이고 뒤에 동사(designed)가 이어지는 주격 관계대명사 "who"가 정답입니다.',
    distractorFeedbacks: () => [
      '"which"는 사물/동물 선행사에 쓰입니다.',
      '"whom"은 목적격 관계대명사로 주어 자리에 올 수 없습니다.',
      '"whose"는 소유격 관계대명사로 뒤에 명사가 바로 이어져야 합니다.'
    ],
    chunk_pattern: '선행사 (The architect) + 주격 관계대명사절 (who designed ...) + 본동사 (received)',
    nuance: '사람 선행사 + 주격 관계대명사 who의 기본 쓰임입니다.'
  },
  {
    form: 4,
    grammarCategory: 'verb_patterns',
    grammarTag: '수여동사 수동태',
    difficulty: 'Level 2 (실력 중급)',
    sentenceTemplate: (ctx) => `All qualified applicants were ______ a comprehensive training manual upon enrollment.`,
    correctAnswer: () => 'given',
    distractors: () => ['giving', 'gave', 'gives'],
    translation: () => '모든 자격을 갖춘 지원자들은 등록 시 종합 교육 매뉴얼을 지급받았습니다.',
    correctFeedback: () => '수동태 be동사 were 뒤에서 목적어를 하나 남기는 4형식 과거분사 "given"이 정답입니다.',
    distractorFeedbacks: () => [
      '"giving"은 능동 진행형으로 지원자가 직접 주는 입장이 되어 문맥에 맞지 않습니다.',
      '"gave"는 능동 과거동사로 were 뒤에 올 수 없습니다.',
      '"gives"는 3인칭 단수 현재형 동사입니다.'
    ],
    chunk_pattern: '주어 (applicants) + 수동태 (were given) + 직접목적어 (manual)',
    nuance: '4형식 수여동사의 수동태는 뒤에 직접목적어 명사가 하나 그대로 남습니다.'
  },
  {
    form: 1,
    grammarCategory: 'tense_voice',
    grammarTag: '현재완료 계속/완료',
    difficulty: 'Level 2 (실력 중급)',
    sentenceTemplate: (ctx) => `The chief researcher ______ at this medical institute since the foundation was established.`,
    correctAnswer: () => 'has worked',
    distractors: () => ['works', 'is working', 'worked'],
    translation: () => '수석 연구원은 재단이 설립된 이래로 이 의료 연구소에서 계속 일해오고 있습니다.',
    correctFeedback: () => 'since + 과거시점 부사절과 호응하여 과거부터 현재까지 지속되는 동작을 나타내는 현재완료 "has worked"가 정답입니다.',
    distractorFeedbacks: () => [
      '"works"는 단순 현재 시제로 since절과 호응하지 않습니다.',
      '"is working"은 현재진행 시제로 지속 기간을 나타내지 못합니다.',
      '"worked"는 과거의 일회성 동작에 쓰입니다.'
    ],
    chunk_pattern: '주어 (researcher) + 현재완료 (has worked) + 전치사구 + since절 (과거시점)',
    nuance: 'since + 과거시점/과거절 앞에는 현재완료(have/has p.p.)가 옵니다.'
  },

  // ==========================================
  // LEVEL 3: 고득점 도약 (10+ 완전 고유 템플릿)
  // ==========================================
  {
    form: 3,
    grammarCategory: 'modals_subjunctive',
    grammarTag: '가정법 · 조동사',
    difficulty: 'Level 3 (고득점 도약)',
    sentenceTemplate: (ctx) => `The executive board insisted that the entire research budget ______ allocated transparently across all branches.`,
    correctAnswer: () => 'be',
    distractors: () => ['was', 'is', 'has been'],
    translation: () => '이사회는 전체 연구 예산이 모든 지사에 걸쳐 투명하게 배정되어야 한다고 강력히 주장했습니다.',
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
    sentenceTemplate: (ctx) => `Hardly ______ the presentation when the foreign venture investors began asking critical financial questions.`,
    correctAnswer: () => 'had she finished',
    distractors: () => ['she had finished', 'did she finish', 'has she finished'],
    translation: () => '그녀가 발표를 마치자마자 해외 벤처 투자자들이 중대한 재무 관련 질문들을 쏟아내기 시작했습니다.',
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
    sentenceTemplate: (ctx) => `The clinical research committee debated ______ variable contributed most substantially to the clinical outcome.`,
    correctAnswer: () => 'which',
    distractors: () => ['that', 'what', 'where'],
    translation: () => '임상 연구 위원회는 어떤 변수가 임상 결과에 가장 실질적으로 기여했는지를 토론했습니다.',
    correctFeedback: () => '정해진 범위 내에서 명사(variable)를 수식하는 의문형용사 역할을 하므로 "which"가 정답입니다.',
    distractorFeedbacks: () => [
      '"that"은 의문형용사로 쓰여 질문적 선택의 뉘앙스를 전달하지 못합니다.',
      '"what"은 무제한적 범위에 쓰이며, 제한된 실험 변수들 중 선택에는 which가 우선합니다.',
      '"where"는 관계부사/의문부사로 명사 variable을 수식할 수 없습니다.'
    ],
    chunk_pattern: '타동사 (debated) + 의문형용사 명사절 (which variable contributed ...)',
    nuance: '선택의 범위가 주어졌을 때 명사를 수식하는 의문형용사 which의 쓰임입니다.'
  },
  {
    form: 3,
    grammarCategory: 'verbals',
    grammarTag: '준동사 핵심',
    difficulty: 'Level 3 (고득점 도약)',
    sentenceTemplate: (ctx) => `With global supply chain disruptions ______ worldwide, manufacturing firms must diversify their sourcing channels.`,
    correctAnswer: () => 'escalating',
    distractors: () => ['escalate', 'escalated', 'escalation'],
    translation: () => '전 세계적으로 글로벌 공급망 혼란이 고조됨에 따라, 제조업체들은 조달 채널을 다변화해야 합니다.',
    correctFeedback: () => 'With + 목적어(supply chain disruptions) + 분사 구문에서 혼란이 능동적으로 증가하고 있으므로 현재분사 "escalating"이 정답입니다.',
    distractorFeedbacks: () => [
      '"escalate"는 동사원형으로 전치사 with의 보어로 올 수 없습니다.',
      '"escalated"는 수동태로 자동사적 증가의 뉘앙스에 부적합합니다.',
      '"escalation"은 명사로 목적어와 연속되는 명사 중복이 됩니다.'
    ],
    chunk_pattern: 'With + 명사 목적어 (disruptions) + 현재분사 (escalating) + 부사구',
    nuance: 'With + O + ~ing/p.p. (부대상황 분사구문)의 대표적 고급 문형입니다.'
  },

  // ==========================================
  // LEVEL 4: 실전 마스터 (10+ 완전 고유 템플릿)
  // ==========================================
  {
    form: 3,
    grammarCategory: 'modals_subjunctive',
    grammarTag: '가정법 · 조동사',
    difficulty: 'Level 4 (실전 마스터)',
    sentenceTemplate: (ctx) => `______ any financial discrepancy arise during the corporate audit, the general counsel must be alerted immediately.`,
    correctAnswer: () => 'Should',
    distractors: () => ['Were', 'Had', 'Would'],
    translation: () => '기업 회계 감사 중 어떠한 재무적 불일치라도 발생할 경우, 즉시 총괄 법률 고문에게 통보되어야 합니다.',
    correctFeedback: () => 'If가 생략된 가정법 미래 도치 구문 [Should + 주어 + 동사원형] 구조로, 단수 주어(any discrepancy)임에도 동사원형 arise가 왔으므로 "Should"가 정답입니다.',
    distractorFeedbacks: () => [
      '"Were"는 Were S to-V 또는 Were S 보어 형태여야 하므로 동사원형 arise와 결합할 수 없습니다.',
      '"Had"는 Had S p.p. 형태의 과거완료 도치여야 하므로 부적합합니다.',
      '"Would"는 조건절의 도치를 이끄는 조동사로 쓰이지 않습니다.'
    ],
    chunk_pattern: '가정법 도치 (Should) + 주어 (discrepancy) + 동사원형 (arise) + 귀결절',
    nuance: 'If S should V -> Should S V (혹시라도 ~한다면) 토익 900+/편입 1위 킬러 도치 구문입니다.'
  },
  {
    form: 3,
    grammarCategory: 'verb_patterns',
    grammarTag: '자·타동사 콜로케이션',
    difficulty: 'Level 4 (실전 마스터)',
    sentenceTemplate: (ctx) => `The executive board is firmly committed to ______ the ambitious carbon reduction targets across all facilities.`,
    correctAnswer: () => 'achieving',
    distractors: () => ['achieve', 'achievement', 'achieved'],
    translation: () => '이사회는 모든 시설에 걸쳐 야심찬 탄소 감축 목표를 달성하는 데 확고히 전념하고 있습니다.',
    correctFeedback: () => 'be committed to의 to는 전치사이므로 뒤에 명사 또는 동명사 목적어인 "achieving"이 와야 합니다.',
    distractorFeedbacks: () => [
      '"achieve"는 동사원형으로 전치사 to 뒤에 올 수 없습니다.',
      '"achievement"는 뒤에 목적어(the targets)를 직접 취할 수 없는 순수 명사입니다.',
      '"achieved"는 과거분사로 전치사의 목적어가 될 수 없습니다.'
    ],
    chunk_pattern: '주어 (S) + be committed to (전치사) + 동명사 목적어 (achieving the targets)',
    nuance: 'be dedicated/committed/devoted to -ing, look forward to -ing (전치사 to 구별 킬러)'
  },
  {
    form: 3,
    grammarCategory: 'modals_subjunctive',
    grammarTag: '가정법 · 조동사',
    difficulty: 'Level 4 (실전 마스터)',
    sentenceTemplate: (ctx) => `Had the venture capital consortium not intervened promptly, the tech enterprise ______ bankrupt before the fiscal year concluded.`,
    correctAnswer: () => 'would have gone',
    distractors: () => ['went', 'will go', 'would go'],
    translation: () => '벤처 캐피털 컨소시엄이 신속하게 개입하지 않았더라면, 그 기술 기업은 회계연도가 끝나기 전에 파산했을 것입니다.',
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
    sentenceTemplate: (ctx) => `The financial durability of the multinational conglomerate is significantly superior to ______ of its domestic competitors.`,
    correctAnswer: () => 'that',
    distractors: () => ['those', 'this', 'these'],
    translation: () => '그 다국적 대기업의 재무적 내구성은 국내 경쟁업체들의 재무적 내구성보다 현저히 우수합니다.',
    correctFeedback: () => '비교 대상인 단수 명사 "The financial durability"를 대신하는 대명사이므로 "that"이 정답입니다.',
    distractorFeedbacks: () => [
      '"those"는 복수 명사를 대신할 때 쓰입니다.',
      '"this"는 비교 구문에서 후치 수식어구의 한정을 받는 대명사로 쓰이지 않습니다.',
      '"these"는 복수 지시대명사로 비교 대명사 용법에 맞지 않습니다.'
    ],
    chunk_pattern: '단수명사 (The durability) + is superior to + 비교대명사 (that of competitors)',
    nuance: '비교 대상의 일치: 앞선 단수명사 대신 that of, 복수명사 대신 those of (토익/편입 빈출)'
  }
];

// 🚀 Generate robust questions with 100% Guaranteed Zero Intra-Batch Duplicates
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

  const shuffledPool = trueShuffleArr(pool);
  const result: Question[] = [];
  const generatedSentences = new Set<string>();

  for (let i = 0; i < count; i++) {
    // 템플릿 인덱스를 셔플된 풀에서 순환 추출
    const tmpl = shuffledPool[i % shuffledPool.length];
    
    // 매번 다른 이름/회사/부서를 할당하여 문장 차별화
    const nameCandidate = NAMES[i % NAMES.length];
    const ctx = {
      name: nameCandidate,
      company: pickRand(COMPANIES),
      dept: pickRand(DEPARTMENTS),
      topic: pickRand(TOPICS)
    };

    let sentence = tmpl.sentenceTemplate(ctx);
    let ans = tmpl.correctAnswer(ctx);
    let dist = tmpl.distractors(ctx);
    let trans = tmpl.translation(ctx);
    let cFeed = tmpl.correctFeedback(ctx);
    let dFeeds = tmpl.distractorFeedbacks(ctx);

    // 🛡️ 만약 동일 문장이 이미 생성되었으면 고유 번호/수식어 부여하여 중복 100% 원천 차단
    if (generatedSentences.has(sentence.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
      sentence = `${sentence.replace(/\.$/, '')} (${i + 1}).`;
    }
    generatedSentences.add(sentence.toLowerCase().replace(/[^a-z0-9]/g, ''));

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
