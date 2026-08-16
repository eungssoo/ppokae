export interface GrammarTipItem {
  id: string;
  titleKo: string;
  titleEn: string;
  badgeKo: string;
  badgeEn: string;
  summaryKo: string;
  summaryEn: string;
  formulaKo?: string;
  formulaEn?: string;
  examples: {
    wrong?: string;
    correct: string;
    explanationKo: string;
    explanationEn: string;
  }[];
  proTipKo: string;
  proTipEn: string;
}

export interface GrammarTipCategory {
  id: string;
  titleKo: string;
  titleEn: string;
  icon: string;
  descriptionKo: string;
  descriptionEn: string;
  tips: GrammarTipItem[];
}

export const GRAMMAR_TIPS_CATEGORIES: GrammarTipCategory[] = [
  {
    id: 'parts_of_speech',
    titleKo: '품사와 자리 공식',
    titleEn: 'Parts of Speech & Slot Rules',
    icon: '🏷️',
    descriptionKo: '문장의 빈칸 위치만 보고 1초 만에 품사를 결정하는 절대 공식',
    descriptionEn: 'Instant slot rules to identify correct word forms in 1 second.',
    tips: [
      {
        id: 'article_noun',
        titleKo: '관사(a/an/the) 뒤에는 무조건 명사가 온다',
        titleEn: 'Articles (a/an/the) MUST terminate with a Noun',
        badgeKo: '1초 자리 공식',
        badgeEn: '1-Sec Slot Rule',
        summaryKo: '관사(a/an/the) 뒤에 부사나 형용사가 끼어들 수 있지만, 그 덩어리의 최종 종착지는 반드시 [명사]여야 합니다.',
        summaryEn: 'Articles may precede adverbs and adjectives, but the slot MUST strictly terminate with a Head Noun.',
        formulaKo: '관사 (a/an/the) + (부사) + (형용사) + [ 명사 (핵심) ]',
        formulaEn: 'Article + (Adverb) + (Adjective) + [ NOUN ]',
        examples: [
          {
            wrong: 'She made an exceptionally **decide** yesterday.',
            correct: 'She made an exceptionally **decision** (X) ➔ an exceptionally **wise decision** (O).',
            explanationKo: '관사(an) + 부사(exceptionally) + 형용사(wise) + 명사(decision) 구조가 완성되어야 합니다.',
            explanationEn: 'The noun "decision" completes the noun phrase initiated by the article "an".'
          }
        ],
        proTipKo: '💡 빈칸 앞이 관사이고 뒤에 다른 명사가 없다면, 보기에 형용사/동사가 있어도 무조건 명사를 골라야 합니다!',
        proTipEn: '💡 If a blank is preceded by an article and followed by a verb/preposition, the answer is 100% a NOUN.'
      },
      {
        id: 'preposition_noun_ing',
        titleKo: '전치사 뒤에는 명사 또는 동명사(-ing)만 온다',
        titleEn: 'Prepositions MUST take Nouns or Gerunds (-ing)',
        badgeKo: '전치사의 목적어',
        badgeEn: 'Preposition Object',
        summaryKo: '전치사(in, on, at, for, by, with, about, without...) 뒤에는 동사원형이나 to부정사가 절대 올 수 없으며, 오직 명사/대명사 목적격/동명사(-ing)만 가능합니다.',
        summaryEn: 'Prepositions never accept base verbs or to-infinitives. Only nouns, pronouns, or gerunds (-ing) are grammatically allowed.',
        formulaKo: '전치사 (for / with / by / in ...) + [ 명사 / 대명사(목적격) / 동명사(-ing) ]',
        formulaEn: 'Preposition + [ Noun / Objective Pronoun / Gerund (-ing) ]',
        examples: [
          {
            wrong: 'Thank you for **help** me with the project.',
            correct: 'Thank you for **helping** me with the project.',
            explanationKo: '전치사 for 뒤에는 동사원형(help)이 아닌 동명사(helping)가 와야 합니다.',
            explanationEn: '"for" is a preposition, requiring the gerund form "helping".'
          }
        ],
        proTipKo: '💡 to 뒤에 동사원형이 오는 to부정사와, to가 전치사로 쓰여 -ing가 오는 관용표현(look forward to -ing, be used to -ing)을 구분하는 문제가 토익/수능 빈출입니다!',
        proTipEn: '💡 Watch out for prepositional "to" idioms (e.g., look forward to -ing, be accustomed to -ing) which require gerunds!'
      },
      {
        id: 'adj_vs_adv',
        titleKo: '형용사 vs 부사 1초 구별 비법',
        titleEn: 'Adjective vs. Adverb Distinction',
        badgeKo: '수식어 판별',
        badgeEn: 'Modifier Rule',
        summaryKo: '형용사는 [명사]를 꾸미거나 보어(be동사 뒤) 자리에 오고, 부사(-ly)는 명사를 제외한 [동사, 형용사, 다른 부사, 문장 전체]를 꾸밉니다.',
        summaryEn: 'Adjectives modify nouns or serve as complements. Adverbs (-ly) modify verbs, adjectives, other adverbs, or whole clauses.',
        formulaKo: '형용사 ➔ 명사 수식 / 부사(-ly) ➔ 동사/형용사/부사 수식 (문장 필수성분 불가)',
        formulaEn: 'Adjective ➔ modifies Noun / Adverb (-ly) ➔ modifies Verb/Adj/Adv (never core subject/object)',
        examples: [
          {
            wrong: 'The system operates **efficient** under heavy loads.',
            correct: 'The system operates **efficiently** under heavy loads.',
            explanationKo: '동사 operates(작동하다)를 수식해야 하므로 부사 efficiently가 정답입니다.',
            explanationEn: 'The action verb "operates" requires the adverb "efficiently" as a modifier.'
          }
        ],
        proTipKo: '💡 문장에서 부사(-ly)를 손가락으로 가려도 문법적으로 완전한 문장이 성립하면 그 자리는 100% 부사 자리입니다!',
        proTipEn: '💡 If removing the word leaves a grammatically complete sentence, that position is 100% an ADVERB.'
      }
    ]
  },
  {
    id: 'sentence_forms',
    titleKo: '1~5형식 문형 판별 꿀팁',
    titleEn: '1-5 Sentence Forms Mastery',
    icon: '⚡',
    descriptionKo: '문장의 뼈대를 파악하여 오답 보기를 단숨에 제거하는 형식별 핵심 공식',
    descriptionEn: 'Form-specific structural keys to eliminate wrong options instantly.',
    tips: [
      {
        id: 'form1_no_passive',
        titleKo: '1형식 완전자동사는 수동태(be + p.p.) 절대 불가',
        titleEn: 'Form 1 Intransitive Verbs CANNOT be Passive',
        badgeKo: '1형식 핵심 함정',
        badgeEn: 'Form 1 Trap',
        summaryKo: '목적어가 필요 없는 완전자동사(appear, disappear, occur, happen, rise, arrive, remain, exist)는 수동태(be + p.p.)로 쓸 수 없습니다.',
        summaryEn: 'Pure intransitive verbs without direct objects (occur, happen, rise, appear, exist) can NEVER be formatted as passive voice.',
        formulaKo: 'S + occur / happen / appear / rise (O) ➔ be occurred (X, 100% 오답)',
        formulaEn: 'S + occur / appear / exist (Active Only, Passive is 100% Incorrect)',
        examples: [
          {
            wrong: 'The tragic accident **was happened** last night.',
            correct: 'The tragic accident **happened** last night.',
            explanationKo: 'happen은 자동사이므로 수동태 was happened로 쓸 수 없으며 능동형 happened가 맞습니다.',
            explanationEn: '"happen" is an intransitive verb and cannot take a passive form.'
          }
        ],
        proTipKo: '💡 시험에 be occurred, was disappeared 등이 보기에 나오면 읽지도 말고 바로 오답으로 지우세요!',
        proTipEn: '💡 "was occurred" or "was disappeared" are instant grammar red flags—eliminate immediately!'
      },
      {
        id: 'form2_sensory_adj',
        titleKo: '2형식 감각동사 뒤에는 무조건 형용사 보어',
        titleEn: 'Form 2 Linking Verbs Require Adjectives (No -ly)',
        badgeKo: '2형식 보어 공식',
        badgeEn: 'Form 2 Complement',
        summaryKo: '감각동사(look, sound, smell, taste, feel) 뒤의 보어 자리에는 한국어로는 ~하게(부사)로 해석되더라도 문법적으로는 반드시 [형용사]가 와야 합니다.',
        summaryEn: 'Sensory linking verbs (look, sound, smell, taste, feel) strictly take adjective complements, never adverbs.',
        formulaKo: 'S + look / sound / smell / taste / feel + [ 형용사 (O) / 부사-ly (X) ]',
        formulaEn: 'S + look / sound / taste / feel + [ ADJECTIVE (O) / Adverb-ly (X) ]',
        examples: [
          {
            wrong: 'Your new proposal sounds **wonderfully**.',
            correct: 'Your new proposal sounds **wonderful**.',
            explanationKo: 'sounds는 감각동사(2형식)이므로 주격 보어로 형용사 wonderful이 와야 합니다.',
            explanationEn: '"sounds" is a linking verb requiring the adjective complement "wonderful".'
          }
        ],
        proTipKo: '💡 감각동사 뒤에 명사를 쓰고 싶다면 전치사 like를 붙여 [감각동사 + like + 명사] 형태로 써야 합니다. (예: looks like a hero)',
        proTipEn: '💡 To use a noun after a sensory verb, attach "like" (e.g. sounds like a great plan).'
      },
      {
        id: 'form5_causative_verb',
        titleKo: '5형식 사역동사 / 지각동사 목적격 보어 공식',
        titleEn: 'Form 5 Causative & Perception Verbs',
        badgeKo: '5형식 빈출 1순위',
        badgeEn: 'Form 5 #1 Rule',
        summaryKo: '사역동사(make, have, let)는 목적격 보어로 [동사원형], 지각동사(see, hear, watch, feel)는 [동원 또는 -ing], 일반 유도동사(want, allow, enable, encourage)는 [to부정사]를 취합니다.',
        summaryEn: 'Causatives (make, have, let) take bare verbs; perception verbs (see, hear) take bare verbs or -ing; persuasive verbs (allow, cause, enable) take to-infinitives.',
        formulaKo: '사역동사 ➔ 동원 / 지각동사 ➔ 동원, -ing / allow, enable, ask ➔ to부정사',
        formulaEn: 'Make/Have/Let + O + [ Base Verb ] | Allow/Enable/Want + O + [ to-Infinitive ]',
        examples: [
          {
            wrong: 'The teacher made the students **to clean** the classroom.',
            correct: 'The teacher made the students **clean** the classroom.',
            explanationKo: '사역동사 made의 목적격 보어로 to부정사가 아닌 동사원형 clean이 와야 합니다.',
            explanationEn: 'Causative "made" takes the bare infinitive "clean", not "to clean".'
          }
        ],
        proTipKo: '💡 단, 목적어와 보어의 관계가 [수동]일 때는 사역/지각동사 모두 목적격 보어로 과거분사(p.p.)를 씁니다! (예: I had my car repaired.)',
        proTipEn: '💡 If the object undergoes the action passively, always use past participle (p.p.) (e.g. had my phone fixed).'
      }
    ]
  },
  {
    id: 'verbs_vs_verbals',
    titleKo: '동사 vs 준동사 판별 비법',
    titleEn: 'Verbs vs. Verbals (Participles & Infinitives)',
    icon: '🎯',
    descriptionKo: '문장의 진짜 본동사를 찾고 분사/부정사/동명사의 쓰임새를 명쾌하게 정리',
    descriptionEn: 'Locate main finite verbs and master participles and infinitives.',
    tips: [
      {
        id: 'one_sentence_one_verb',
        titleKo: '1문장 1본동사 원칙과 접속사 공식',
        titleEn: 'One Main Verb Rule & Conjunction Balance',
        badgeKo: '문장 구조 기초',
        badgeEn: 'Core Syntax',
        summaryKo: '한 문장에서 [본동사의 개수 = 접속사의 개수 + 1]입니다. 접속사가 없다면 본동사는 무조건 1개여야 하며, 추가로 오는 동사 형태는 반드시 준동사(to부정사, 동명사, 분사)여야 합니다.',
        summaryEn: 'Number of finite verbs = Number of conjunctions + 1. Without a conjunction, only one finite main verb is allowed.',
        formulaKo: '접속사 0개 ➔ 본동사 1개 (나머지는 to-V / V-ing / p.p. 형태여야 함)',
        formulaEn: '0 Conjunctions ➔ Exactly 1 Finite Main Verb',
        examples: [
          {
            wrong: 'The athlete **trained** hard **won** the gold medal.',
            correct: 'The athlete **who trained** hard won the gold medal. (또는 The athlete **training** hard won...)',
            explanationKo: 'trained와 won 두 개의 본동사가 접속사 없이 충돌하므로 관계대명사나 분사로 수식해야 합니다.',
            explanationEn: 'Two finite verbs cannot collide without a conjunction; use a relative clause or participle.'
          }
        ],
        proTipKo: '💡 빈칸 문제에서 문장에 이미 본동사가 있다면, 보기에 있는 동사 형태(is, was, goes 등)를 먼저 지우고 준동사를 검토하세요!',
        proTipEn: '💡 If the sentence already contains a main verb and no conjunction, eliminate finite verb choices first!'
      },
      {
        id: 'active_ing_vs_passive_ed',
        titleKo: '능동 분사(-ing) vs 수동 분사(p.p.) 1초 구별법',
        titleEn: 'Active (-ing) vs. Passive (p.p.) 1-Sec Key',
        badgeKo: '분사 킬러 스킬',
        badgeEn: 'Participle Hack',
        summaryKo: '빈칸 뒤에 목적어(명사)가 살아있다면 능동의 현재분사(-ing), 목적어가 없거나 전치사구/부사가 뒤따라오면 수동의 과거분사(p.p.)가 정답입니다.',
        summaryEn: 'If followed by a direct noun object, choose active (-ing); if followed by a preposition or nothing, choose passive (p.p.).',
        formulaKo: '분사 + [ 명사(목적어) ] ➔ -ing (능동) / 분사 + [ 전치사구 / 없음 ] ➔ p.p. (수동)',
        formulaEn: 'Participle + [ Noun Object ] ➔ -ing / Participle + [ Preposition / None ] ➔ p.p.',
        examples: [
          {
            wrong: 'The document **signing** by the director is confidential.',
            correct: 'The document **signed** by the director is confidential.',
            explanationKo: '뒤에 by the director(전치사구)가 오고 서명되는 대상이므로 수동의 과거분사 signed가 맞습니다.',
            explanationEn: 'The document receives the action ("signed by..."), so past participle "signed" is correct.'
          }
        ],
        proTipKo: '💡 3형식 타동사 기준 90% 이상 이 공식으로 1초 만에 풀립니다!',
        proTipEn: '💡 For transitive verbs, checking for a following noun object resolves 90%+ of participle questions.'
      },
      {
        id: 'to_inf_vs_gerund',
        titleKo: 'to부정사 vs 동명사 목적어 필수 암기 리스트',
        titleEn: 'To-Infinitive vs. Gerund Verbs List',
        badgeKo: '동사별 목적어',
        badgeEn: 'Object Form',
        summaryKo: '미래/계획/소망을 나타내는 동사는 to부정사를, 과거/경험/중단/회피를 나타내는 동사는 동명사(-ing)를 목적어로 취합니다.',
        summaryEn: 'Future/intent verbs take to-infinitives (want, plan, decide); past/cessation/avoidance verbs take gerunds (enjoy, finish, avoid).',
        formulaKo: 'to부정사: want, hope, decide, plan, promise, agree / 동명사: enjoy, finish, avoid, mind, postpone, suggest',
        formulaEn: 'to-V: want, decide, plan, refuse, promise | -ing: enjoy, finish, avoid, mind, consider, suggest',
        examples: [
          {
            wrong: 'She decided **postponing** the team meeting.',
            correct: 'She decided **to postpone** the team meeting.',
            explanationKo: 'decide는 미래 지향적 동사이므로 to부정사(to postpone)를 목적어로 취합니다.',
            explanationEn: '"decide" takes a to-infinitive complement.'
          }
        ],
        proTipKo: '💡 MEGAFEPS (Mind, Enjoy, Give up, Avoid, Finish, Escape, Postpone, Suggest)는 동명사(-ing)만 취하는 대표 암기 공식입니다!',
        proTipEn: '💡 Remember MEGAFEPS (Mind, Enjoy, Give up, Avoid, Finish, Escape, Postpone, Suggest) for gerund-only verbs!'
      }
    ]
  },
  {
    id: 'tense_and_agreement',
    titleKo: '시제 & 수일치 1초 정답 스킬',
    titleEn: 'Tense & Subject-Verb Agreement',
    icon: '⏰',
    descriptionKo: '주어와 동사 사이의 낚시 수식어를 걷어내고 시제 짝을 맞추는 스킬',
    descriptionEn: 'Filter out distractors between Subject-Verb and match correct tenses.',
    tips: [
      {
        id: 'subject_modifier_filter',
        titleKo: '주어-동사 수일치 낚시 방지 (수식어 거품 걷어내기)',
        titleEn: 'Subject-Verb Agreement Filter Hack',
        badgeKo: '수일치 1순위',
        badgeEn: 'Agreement #1',
        summaryKo: '주어 뒤에 붙은 [전치사구, 관계사절, 분사구, 동격구]는 단순 수식어일 뿐입니다. 괄호를 쳐서 가려버리고 맨 앞의 진짜 핵심 주어(Head Noun)에 단수/복수 동사를 일치시키세요.',
        summaryEn: 'Prepositional phrases, relative clauses, and participles following a subject are mere modifiers. Match the verb to the head noun.',
        formulaKo: '[ 핵심 주어 ] + (전치사구 / 관계사절 ...) + [ 동사 (핵심 주어와 수일치!) ]',
        formulaEn: '[ Head Noun ] + (Modifiers in brackets) + [ VERB matched to Head Noun ]',
        examples: [
          {
            wrong: 'The quality of these new manufactured items **are** terrible.',
            correct: 'The quality (of these new manufactured items) **is** terrible.',
            explanationKo: '진짜 주어는 items가 아니라 단수 명사인 The quality이므로 단수 동사 is가 정답입니다.',
            explanationEn: 'The head noun is singular "The quality", not plural "items", requiring "is".'
          }
        ],
        proTipKo: '💡 동사 바로 앞의 복수 명사(items)에 속지 말고, 문장의 맨 앞 명사를 주어로 잡으세요!',
        proTipEn: '💡 Do not get distracted by the plural noun right before the verb—trace back to the true head noun!'
      },
      {
        id: 'time_condition_present_future',
        titleKo: '시간/조건의 부사절에서는 현재 시제가 미래를 대신한다',
        titleEn: 'Time/Condition Clauses Use Present for Future',
        badgeKo: '시제 단골 출제',
        badgeEn: 'Time Clause Rule',
        summaryKo: 'when, if, as soon as, before, after, unless 등이 이끄는 시간과 조건의 부사절 내부에서는 will(미래)을 쓰지 않고 현재 시제를 씁니다.',
        summaryEn: 'In subordinate adverb clauses of time and condition (when, if, as soon as, unless), the present tense represents the future (no "will").',
        formulaKo: 'If / When + S + [ 현재 시제 (will 금지!) ] ~, S + will + 동원',
        formulaEn: 'When / If + S + [ Present Tense (No "will") ] ~, Main Clause + [ will + Verb ]',
        examples: [
          {
            wrong: 'We will depart as soon as he **will arrive**.',
            correct: 'We will depart as soon as he **arrives**.',
            explanationKo: 'as soon as가 이끄는 시간 부사절이므로 will arrive 대신 현재 시제 3인칭 단수형 arrives를 써야 합니다.',
            explanationEn: 'Inside the time adverbial clause initiated by "as soon as", use present tense "arrives".'
          }
        ],
        proTipKo: '💡 단, 주절에는 will이 그대로 쓰입니다! 부사절 내부에서만 will이 금지되는 것입니다.',
        proTipEn: '💡 Note that "will" is still used in the main clause, only excluded inside the subordinate clause.'
      }
    ]
  },
  {
    id: 'relatives_and_conjunctions',
    titleKo: '관계사 & 접속사 핵심 포인트',
    titleEn: 'Relatives & Conjunctions Decoded',
    icon: '🔗',
    descriptionKo: 'that vs what 및 접속사 vs 전치사의 차이를 단 3초 만에 푸는 비결',
    descriptionEn: 'Quickly solve "that vs what" and conjunction vs. preposition dilemmas.',
    tips: [
      {
        id: 'that_vs_what',
        titleKo: 'that vs what 3초 구별 2단계 공식',
        titleEn: 'That vs. What 2-Step Decision Tree',
        badgeKo: '수능/토익 킬러',
        badgeEn: 'Top Exam Trap',
        summaryKo: '1단계: 앞에 수식할 선행사(명사)가 있으면 무조건 that/which! (what은 선행사를 포함하므로 앞에 명사가 올 수 없음). 2단계: 앞에 명사가 없다면, 뒤가 완전하면 that, 뒤가 불완전하면(주어나 목적어 빠짐) what!',
        summaryEn: 'Step 1: If there is a preceding antecedent noun, choose that/which (never what). Step 2: If no antecedent noun, choose that for complete clauses and what for incomplete clauses.',
        formulaKo: '명사 + [ that/which + 불완전 ] | 명사 없음 + [ that + 완전 ] | 명사 없음 + [ what + 불완전 ]',
        formulaEn: 'Noun + [ that/which + Incomplete ] | No Noun + [ that + Complete ] | No Noun + [ what + Incomplete ]',
        examples: [
          {
            wrong: 'I cannot understand **that** he is talking about.',
            correct: 'I cannot understand **what** he is talking about.',
            explanationKo: '선행사 명사가 없고, about 뒤의 목적어가 빠진 불완전한 문장이므로 what이 정답입니다.',
            explanationEn: 'There is no antecedent noun, and "about" lacks an object, requiring "what".'
          }
        ],
        proTipKo: '💡 what = the thing which (선행사를 이미 먹고 있는 관계대명사)로 기억하면 쉽습니다!',
        proTipEn: '💡 Remember "what" equals "the thing which" (it inherently contains its own antecedent noun).'
      },
      {
        id: 'conj_vs_prep_pairs',
        titleKo: '접속사 vs 전치사 짝꿍 구별 (절 vs 구)',
        titleEn: 'Conjunction vs. Preposition Pairs',
        badgeKo: '어휘 & 구조',
        badgeEn: 'Structure Match',
        summaryKo: '의미는 거의 같지만 [접속사 + 주어 + 동사 (절)] vs [전치사 + 명사/동명사 (구)]로 구조가 완전히 다릅니다.',
        summaryEn: 'Though having identical meanings, conjunctions must be followed by a clause (S + V) while prepositions take a noun phrase.',
        formulaKo: 'because / although / while (+ S + V)  vs  because of / despite / during (+ 명사)',
        formulaEn: 'because / although / while (+ Clause S+V) vs because of / despite / during (+ Noun Phrase)',
        examples: [
          {
            wrong: 'We went hiking **despite** it rained heavily.',
            correct: 'We went hiking **although** it rained heavily. (또는 despite the heavy rain)',
            explanationKo: 'it rained heavily(주어+동사 절)가 뒤에 오므로 전치사 despite 대신 접속사 although가 와야 합니다.',
            explanationEn: '"it rained heavily" is a full clause with subject and verb, requiring conjunction "although".'
          }
        ],
        proTipKo: '💡 despite of 라는 단어는 영어에 없습니다! (in spite of = despite)',
        proTipEn: '💡 "despite of" does not exist in standard English! Use either "despite" or "in spite of".'
      }
    ]
  }
];
