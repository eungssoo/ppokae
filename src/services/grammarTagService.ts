import { Question } from '../types';

export interface GrammarTagInfo {
  id: string;
  nameKo: string;
  nameEn: string;
  badgeKo: string;
  badgeEn: string;
  icon: string;
  themeColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  descKo: string;
  descEn: string;
}

export const PRACTICAL_GRAMMAR_CATEGORIES: GrammarTagInfo[] = [
  {
    id: 'subject_verb_agreement',
    nameKo: '주어-동사 수일치',
    nameEn: 'Subject-Verb Agreement',
    badgeKo: '수일치 핵심',
    badgeEn: 'S-V Agreement',
    icon: '🎯',
    themeColor: 'blue',
    textColor: 'text-sky-300',
    bgColor: 'bg-sky-500/15',
    borderColor: 'border-sky-500/30',
    descKo: '단수/복수 주어, 수식어구 거품, A/The number of, 부분/비율 표현 본동사 일치',
    descEn: 'Match verbs to head subjects despite intervening modifiers, fractions, and quantifiers.'
  },
  {
    id: 'tense_voice',
    nameKo: '시제 & 능동/수동태',
    nameEn: 'Tense & Passive Voice',
    badgeKo: '시제 · 태',
    badgeEn: 'Tense & Voice',
    icon: '⏳',
    themeColor: 'indigo',
    textColor: 'text-indigo-300',
    bgColor: 'bg-indigo-500/15',
    borderColor: 'border-indigo-500/30',
    descKo: '현재/과거/미래완료(by the time), 4·5형식 수동태, 타동사 목적어 유무 판별',
    descEn: 'Determine active vs passive voice and perfect/future-perfect tenses.'
  },
  {
    id: 'verbals',
    nameKo: '준동사 (부정사/동명사/분사)',
    nameEn: 'Verbals (Infinitive, Gerund, Participle)',
    badgeKo: '준동사 핵심',
    badgeEn: 'Verbals',
    icon: '⚡',
    themeColor: 'emerald',
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    descKo: 'to-V vs 동명사 목적어, 5형식 목적격보어, 독립분사구문, With 분사구문, Having p.p.',
    descEn: 'to-Infinitive, gerunds, absolute participles, and with-participial constructions.'
  },
  {
    id: 'clauses_relatives',
    nameKo: '관계사 & 명사절',
    nameEn: 'Relative & Noun Clauses',
    badgeKo: '관계사 · 명사절',
    badgeEn: 'Relatives & Clauses',
    icon: '🔗',
    themeColor: 'purple',
    textColor: 'text-purple-300',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/30',
    descKo: 'that vs what 구별, 전치사+관계대명사, 복합관계사(whoever/whatever), 관계부사',
    descEn: 'Relative pronouns, preposition+relative, compound relatives, and that vs what.'
  },
  {
    id: 'connectors',
    nameKo: '접속사 vs 전치사 vs 접속부사',
    nameEn: 'Conjunctions vs Prepositions',
    badgeKo: '접속사 vs 전치사',
    badgeEn: 'Connectors',
    icon: '🌉',
    themeColor: 'amber',
    textColor: 'text-amber-300',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/30',
    descKo: 'because vs because of, although vs despite, while vs during, unless vs without, 접속부사',
    descEn: 'Clauses with conjunctions vs noun phrases with prepositions and conjunctive adverbs.'
  },
  {
    id: 'parts_of_speech',
    nameKo: '품사 자리 & 혼동 파생어',
    nameEn: 'Parts of Speech & Confusable Words',
    badgeKo: '품사 · 어휘',
    badgeEn: 'Parts of Speech',
    icon: '🏷️',
    themeColor: 'teal',
    textColor: 'text-teal-300',
    bgColor: 'bg-teal-500/15',
    borderColor: 'border-teal-500/30',
    descKo: '명/형/부/동 자리 판별, 복합명사, 혼동 형용사(sensible/sensitive, considerate/considerable)',
    descEn: 'Identify slots for nouns/adjectives/adverbs and master confusable derivative words.'
  },
  {
    id: 'modals_subjunctive',
    nameKo: '조동사 & 가정법 심화',
    nameEn: 'Modals & Advanced Subjunctive',
    badgeKo: '가정법 · 조동사',
    badgeEn: 'Subjunctive',
    icon: '🪄',
    themeColor: 'rose',
    textColor: 'text-rose-300',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/30',
    descKo: 'If생략 도치(Had/Were/Should S), 혼합가정법, 당위성 주장·제안 should생략, It is high time, Without/But for',
    descEn: 'Inverted conditionals, mixed subjunctives, mandatory base verbs, and idiomatic subjunctives.'
  },
  {
    id: 'special_structures',
    nameKo: '특수구문 & 고난도 도치',
    nameEn: 'Special Inversion & Comparisons',
    badgeKo: '특수구문 · 도치',
    badgeEn: 'Special Inversion',
    icon: '✨',
    themeColor: 'cyan',
    textColor: 'text-cyan-300',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/30',
    descKo: '부정어 도치(Never/Hardly/Scarcely/No sooner/Seldom), Only 부사구 도치, 장소부사구 도치, The 비교급',
    descEn: 'Negative inversions, only-phrase inversions, locative inversions, and comparative corollaries.'
  },
  {
    id: 'verb_patterns',
    nameKo: '자·타동사 & 빈출 동사구',
    nameEn: 'Transitive/Intransitive & Verb Idioms',
    badgeKo: '자·타동사 콜로케이션',
    badgeEn: 'Verb Patterns',
    icon: '🧭',
    themeColor: 'orange',
    textColor: 'text-orange-300',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/30',
    descKo: 'lay vs lie, rise vs raise, 전치사 불가 완전타동사(discuss/mention/marry), 전치사 필수 자동사(object to)',
    descEn: 'Transitive/intransitive confusions, no-preposition transitive verbs, and obligatory prepositional verbs.'
  },
  {
    id: 'parallel_agreement',
    nameKo: '병렬 구조 & 상관접속사',
    nameEn: 'Parallelism & Correlatives',
    badgeKo: '병렬 · 상관접속',
    badgeEn: 'Parallelism',
    icon: '⚖️',
    themeColor: 'violet',
    textColor: 'text-violet-300',
    bgColor: 'bg-violet-500/15',
    borderColor: 'border-violet-500/30',
    descKo: 'not only A but also B, neither nor, both and, not A but B, 비교 대상의 일치(that/those of)',
    descEn: 'Parallel structures with correlative conjunctions and identical comparative targets (that/those of).'
  }
];

export const DEFAULT_GRAMMAR_CATEGORY = PRACTICAL_GRAMMAR_CATEGORIES[0];

/**
 * 🏷️ 주어진 카테고리 ID 또는 태그명에 해당하는 메타 정보 반환
 */
export function getGrammarTagInfo(keyOrId?: string): GrammarTagInfo {
  if (!keyOrId) return DEFAULT_GRAMMAR_CATEGORY;
  const lower = keyOrId.toLowerCase().trim();

  const found = PRACTICAL_GRAMMAR_CATEGORIES.find(c => 
    c.id.toLowerCase() === lower ||
    c.nameKo.toLowerCase().includes(lower) ||
    c.nameEn.toLowerCase().includes(lower) ||
    c.badgeKo.toLowerCase().includes(lower) ||
    c.badgeEn.toLowerCase().includes(lower)
  );

  return found || DEFAULT_GRAMMAR_CATEGORY;
}

/**
 * 🧠 기존 DB 문제나 AI 생성 문제에서 문법 카테고리를 100% 지능형 자동 판별/추론하는 함수
 */
export function inferGrammarCategory(q: Partial<Question>): GrammarTagInfo {
  if (q.grammarCategory) {
    const info = getGrammarTagInfo(q.grammarCategory);
    if (info) return info;
  }
  if (q.grammarTag) {
    const info = getGrammarTagInfo(q.grammarTag);
    if (info) return info;
  }

  const text = `${q.sentence || ''} ${q.answer || ''} ${q.translation || ''} ${q.explanation?.chunk_pattern || ''} ${q.explanation?.nuance || ''} ${(q.options || []).map(o => o.text + ' ' + (o.feedback || '')).join(' ')}`.toLowerCase();

  // 1. 조동사 & 가정법 심화
  if (
    text.includes('가정법') || text.includes('subjunctive') || text.includes('had it not been') ||
    text.includes('were it not') || text.includes('should you') || text.includes('would have') ||
    text.includes('could have') || text.includes('might have') || text.includes('insist') ||
    text.includes('suggest') || text.includes('demand') || text.includes('당위성') ||
    text.includes('it is high time') || text.includes('lest') || text.includes('without') || text.includes('but for')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[6]; // modals_subjunctive
  }

  // 2. 자·타동사 & 빈출 동사구 (lay/lie, rise/raise, discuss about 등)
  if (
    text.includes('자동사') || text.includes('타동사') || text.includes('lay') || text.includes('lie') ||
    text.includes('raise') || text.includes('rise') || text.includes('sit') || text.includes('set') ||
    text.includes('전치사 불가') || text.includes('전치사를 쓰지 않는') || text.includes('discuss') ||
    text.includes('mention') || text.includes('marry') || text.includes('reach') || text.includes('object to') ||
    text.includes('participate in') || text.includes('account for')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[8]; // verb_patterns
  }

  // 3. 병렬 구조 & 상관접속사 (not only, neither nor, that of, those of)
  if (
    text.includes('병렬') || text.includes('병치') || text.includes('상관접속사') ||
    text.includes('not only') || text.includes('neither') || text.includes('either') ||
    text.includes('not so much') || text.includes('that of') || text.includes('those of') ||
    text.includes('비교 대상')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[9]; // parallel_agreement
  }

  // 4. 접속사 vs 전치사 vs 접속부사
  if (
    text.includes('because of') || text.includes('despite') || text.includes('in spite of') ||
    text.includes('although') || text.includes('even though') || text.includes('while') ||
    text.includes('during') || text.includes('접속사 vs 전치사') || text.includes('전치사구') ||
    text.includes('provided that') || text.includes('given that') || text.includes('unless')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[4]; // connectors
  }

  // 5. 관계사 & 명사절
  if (
    text.includes('관계대명사') || text.includes('관계부사') || text.includes('that vs what') ||
    text.includes('who') || text.includes('whom') || text.includes('whose') ||
    text.includes('which') || text.includes('whatever') || text.includes('whoever') ||
    text.includes('whomever') || text.includes('명사절') || text.includes('선행사') ||
    text.includes('in which') || text.includes('to whom')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[3]; // clauses_relatives
  }

  // 6. 특수구문 & 고난도 도치
  if (
    text.includes('도치') || text.includes('inversion') || text.includes('the more') ||
    text.includes('hardly') || text.includes('scarcely') || text.includes('seldom') ||
    text.includes('never') || text.includes('no sooner') || text.includes('only when') ||
    text.includes('only then') || text.includes('비교급')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[7]; // special_structures
  }

  // 7. 준동사 (to부정사, 동명사, 분사)
  if (
    text.includes('to부정사') || text.includes('동명사') || text.includes('분사구문') ||
    text.includes('participle') || text.includes('gerund') || text.includes('infinitive') ||
    text.includes('looking forward to') || text.includes('dedicated to') || text.includes('committed to') ||
    text.includes('confusing') || text.includes('confused') || text.includes('having p.p') ||
    text.includes('with +') || text.includes('독립분사')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[2]; // verbals
  }

  // 8. 주어-동사 수일치
  if (
    text.includes('수일치') || text.includes('agreement') ||
    /\b(was|were)\b/.test(text) || /\b(is|are)\b/.test(text) || /\b(has|have)\b/.test(text) ||
    text.includes('단수 주어') || text.includes('복수 주어') || text.includes('3인칭 단수') ||
    text.includes('a number of') || text.includes('the number of') || text.includes('every') || text.includes('each')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[0]; // subject_verb_agreement
  }

  // 9. 시제 & 능/수동태
  if (
    text.includes('시제') || text.includes('수동태') || text.includes('tense') ||
    text.includes('passive') || text.includes('현재완료') || text.includes('과거완료') ||
    text.includes('by the time') || text.includes('be p.p') || text.includes('been')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[1]; // tense_voice
  }

  // 10. 품사 자리 & 혼동 파생어 (기본 fallback)
  if (
    text.includes('품사') || text.includes('명사') || text.includes('형용사') ||
    text.includes('부사') || text.includes('자리') || text.includes('관사') ||
    text.includes('sensible') || text.includes('sensitive') || text.includes('considerate') ||
    text.includes('considerable') || text.includes('economic') || text.includes('economical')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[5]; // parts_of_speech
  }

  // 1~5형식 번호에 따른 보조 매핑
  if (q.form === 2) return PRACTICAL_GRAMMAR_CATEGORIES[5]; // 2형식 보어 품사
  if (q.form === 5) return PRACTICAL_GRAMMAR_CATEGORIES[2]; // 5형식 목적격 보어 준동사
  if (q.form === 4) return PRACTICAL_GRAMMAR_CATEGORIES[5]; // 4형식 수여동사/목적어 자리

  return PRACTICAL_GRAMMAR_CATEGORIES[0];
}
