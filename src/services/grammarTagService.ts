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
 * 🏷️ 주어진 카테고리 ID 또는 태그명에 해당하는 메타 정보를 검색 (없으면 null 반환)
 */
export function findGrammarCategory(keyOrId?: string): GrammarTagInfo | null {
  if (!keyOrId) return null;
  const lower = keyOrId.toLowerCase().trim();

  // 1. 정확한 ID 일치
  const byId = PRACTICAL_GRAMMAR_CATEGORIES.find(c => c.id.toLowerCase() === lower);
  if (byId) return byId;

  // 2. 이름/배지 포함 일치
  const byName = PRACTICAL_GRAMMAR_CATEGORIES.find(c =>
    c.nameKo.toLowerCase() === lower ||
    c.nameEn.toLowerCase() === lower ||
    c.badgeKo.toLowerCase() === lower ||
    c.badgeEn.toLowerCase() === lower ||
    c.nameKo.toLowerCase().includes(lower) ||
    c.nameEn.toLowerCase().includes(lower) ||
    lower.includes(c.nameKo.toLowerCase()) ||
    lower.includes(c.nameEn.toLowerCase())
  );

  return byName || null;
}

/**
 * 🏷️ 주어진 카테고리 ID 또는 태그명에 해당하는 메타 정보 반환 (fallback 보장)
 */
export function getGrammarTagInfo(keyOrId?: string): GrammarTagInfo {
  return findGrammarCategory(keyOrId) || DEFAULT_GRAMMAR_CATEGORY;
}

/**
 * 🧠 기존 DB 문제나 AI 생성 문제에서 문법 카테고리를 100% 지능형 자동 판별/추론하는 함수
 */
export function inferGrammarCategory(q: Partial<Question>): GrammarTagInfo {
  // 1. 명시적 grammarCategory 필드가 유효한 경우 즉시 반환
  if (q.grammarCategory) {
    const found = findGrammarCategory(q.grammarCategory);
    if (found) return found;
  }

  // 2. 명시적 grammarTag 필드가 유효한 경우 즉시 반환
  if (q.grammarTag) {
    const found = findGrammarCategory(q.grammarTag);
    if (found) return found;
  }

  // 3. 지능형 텍스트 분석 (문장, 정답, 해설, 보기 피드백 전수 검사)
  const sentence = (q.sentence || '').toLowerCase();
  const answer = (q.answer || '').toLowerCase();
  const translation = (q.translation || '').toLowerCase();
  const pattern = (q.explanation?.chunk_pattern || '').toLowerCase();
  const nuance = (q.explanation?.nuance || '').toLowerCase();
  const optionsText = (q.options || []).map(o => (o.text || '') + ' ' + (o.feedback || '')).join(' ').toLowerCase();
  const fullText = `${sentence} ${answer} ${translation} ${pattern} ${nuance} ${optionsText}`;

  // [1] 특수구문 & 고난도 도치 (special_structures)
  if (
    fullText.includes('도치') || fullText.includes('inversion') || fullText.includes('the 비교급') ||
    fullText.includes('hardly had') || fullText.includes('scarcely had') || fullText.includes('no sooner') ||
    fullText.includes('never before') || fullText.includes('seldom') || fullText.includes('only when') ||
    fullText.includes('only then') || fullText.includes('only after') || fullText.includes('장소부사구 도치')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[7]; // special_structures
  }

  // [2] 조동사 & 가정법 심화 (modals_subjunctive)
  if (
    fullText.includes('가정법') || fullText.includes('subjunctive') || fullText.includes('had it not been') ||
    fullText.includes('were it not') || fullText.includes('should you require') || fullText.includes('would have p.p') ||
    fullText.includes('could have') || fullText.includes('might have') || fullText.includes('혼합가정법') ||
    fullText.includes('당위성') || fullText.includes('insist') || fullText.includes('suggest') ||
    fullText.includes('demand') || fullText.includes('recommend') || fullText.includes('it is high time') ||
    fullText.includes('without') && (fullText.includes('would') || fullText.includes('could')) ||
    fullText.includes('but for')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[6]; // modals_subjunctive
  }

  // [3] 자·타동사 & 빈출 동사구 (verb_patterns)
  if (
    fullText.includes('자동사') || fullText.includes('타동사') || fullText.includes('lay vs lie') ||
    fullText.includes('rise vs raise') || fullText.includes('sit vs set') || fullText.includes('전치사 불가') ||
    fullText.includes('discuss about') || fullText.includes('mention about') || fullText.includes('marry with') ||
    fullText.includes('reach to') || fullText.includes('object to') || fullText.includes('participate in') ||
    fullText.includes('account for') || fullText.includes('dispose of') || fullText.includes('refrain from')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[8]; // verb_patterns
  }

  // [4] 병렬 구조 & 상관접속사 (parallel_agreement)
  if (
    fullText.includes('병렬') || fullText.includes('병치') || fullText.includes('상관접속사') ||
    fullText.includes('not only') || fullText.includes('neither nor') || fullText.includes('either or') ||
    fullText.includes('both and') || fullText.includes('not a but b') || fullText.includes('that of') ||
    fullText.includes('those of') || fullText.includes('비교 대상의 일치')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[9]; // parallel_agreement
  }

  // [5] 접속사 vs 전치사 vs 접속부사 (connectors)
  if (
    fullText.includes('접속사 vs 전치사') || fullText.includes('because vs because of') ||
    fullText.includes('although vs despite') || fullText.includes('while vs during') ||
    fullText.includes('despite') || fullText.includes('in spite of') || fullText.includes('provided that') ||
    fullText.includes('given that') || fullText.includes('in case of') || fullText.includes('unless') ||
    fullText.includes('regardless of') || fullText.includes('as long as') || fullText.includes('접속부사')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[4]; // connectors
  }

  // [6] 관계사 & 명사절 (clauses_relatives)
  if (
    fullText.includes('관계대명사') || fullText.includes('관계부사') || fullText.includes('명사절') ||
    fullText.includes('that vs what') || fullText.includes('which vs what') || fullText.includes('in which') ||
    fullText.includes('to whom') || fullText.includes('whoever') || fullText.includes('whatever') ||
    fullText.includes('whomever') || fullText.includes('선행사') || fullText.includes('복합관계') ||
    fullText.includes('whose')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[3]; // clauses_relatives
  }

  // [7] 준동사 (to부정사 / 동명사 / 분사구문) (verbals)
  if (
    fullText.includes('to부정사') || fullText.includes('동명사') || fullText.includes('분사구문') ||
    fullText.includes('준동사') || fullText.includes('participle') || fullText.includes('gerund') ||
    fullText.includes('infinitive') || fullText.includes('having p.p') || fullText.includes('with +') ||
    fullText.includes('독립분사') || fullText.includes('목적격 보어') || fullText.includes('사역동사') ||
    fullText.includes('지각동사') || fullText.includes('look forward to -ing') || fullText.includes('devoted to -ing') ||
    fullText.includes('감정 분사') || fullText.includes('confusing vs confused')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[2]; // verbals
  }

  // [8] 시제 & 능동/수동태 (tense_voice)
  if (
    fullText.includes('수동태') || fullText.includes('passive') || fullText.includes('시제') ||
    fullText.includes('현재완료') || fullText.includes('과거완료') || fullText.includes('미래완료') ||
    fullText.includes('by the time') || fullText.includes('be p.p') || fullText.includes('have been p.p') ||
    fullText.includes('has been p.p') || fullText.includes('had been p.p') || fullText.includes('능동태 vs 수동태')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[1]; // tense_voice
  }

  // [9] 주어-동사 수일치 (subject_verb_agreement)
  if (
    fullText.includes('수일치') || fullText.includes('주어-동사') || fullText.includes('단수 주어') ||
    fullText.includes('복수 주어') || fullText.includes('3인칭 단수') || fullText.includes('the number of') ||
    fullText.includes('a number of') || fullText.includes('every + 단수') || fullText.includes('each + 단수')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[0]; // subject_verb_agreement
  }

  // [10] 품사 자리 & 혼동 파생어 (parts_of_speech)
  if (
    fullText.includes('품사') || fullText.includes('자리') || fullText.includes('파생어') ||
    fullText.includes('형용사 자리') || fullText.includes('부사 자리') || fullText.includes('명사 자리') ||
    fullText.includes('sensible') || fullText.includes('sensitive') || fullText.includes('considerate') ||
    fullText.includes('considerable') || fullText.includes('economic') || fullText.includes('economical') ||
    fullText.includes('respectable') || fullText.includes('respectful')
  ) {
    return PRACTICAL_GRAMMAR_CATEGORIES[5]; // parts_of_speech
  }

  // 기본 반환
  return DEFAULT_GRAMMAR_CATEGORY;
}
