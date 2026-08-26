export interface GrammarTipItem {
  id: string;
  titleKo: string;
  titleEn: string;
  badgeKo: string;
  badgeEn: string;
  summaryKo: string;
  summaryEn: string;
  formulaKo: string;
  formulaEn: string;
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
  // 1. 🏷️ 1초 품사 자리 딸깍 공식
  {
    id: 'parts_of_speech',
    titleKo: '1초 품사 자리 딸깍 공식',
    titleEn: '1-Sec Slot Rules',
    icon: '🏷️',
    descriptionKo: '빈칸 앞뒤 단어만 보고 3초 만에 품사를 찍는 실전 딸깍 공식',
    descriptionEn: 'Instant slot rules to pick the right part of speech in 3 seconds.',
    tips: [
      {
        id: 'article_noun',
        titleKo: '관사(a/an/the) 뒤의 종착지는 무조건 명사',
        titleEn: 'Articles (a/an/the) MUST end in a Noun',
        badgeKo: '명사 자리 딸깍',
        badgeEn: 'Noun Slot',
        summaryKo: '관사(a/the) 뒤에 부사나 형용사가 끼어있더라도, 그 덩어리의 최종 종착지는 반드시 [명사]입니다.',
        summaryEn: 'Articles may precede modifiers, but the slot strictly terminates with a Noun.',
        formulaKo: '관사(a/an/the) + (부사) + (형용사) + [ 명사 (정답) ]',
        formulaEn: 'Article + (Adverb) + (Adjective) + [ NOUN ]',
        examples: [
          {
            wrong: 'She made an exceptionally **decide** yesterday.',
            correct: 'She made an exceptionally **wise decision** (O).',
            explanationKo: '관사(an) + 부사 + 형용사 뒤이므로 명사(decision)가 정답입니다.',
            explanationEn: 'The noun "decision" completes the noun phrase initiated by "an".'
          }
        ],
        proTipKo: '💡 빈칸 앞에 관사나 소유격(my/our/their)이 보이면 보기 중 명사(-tion, -ment, -ness, -ty)를 딸깍 고르세요!',
        proTipEn: '💡 When you see an article or possessive, instantly click the noun option!'
      },
      {
        id: 'preposition_noun_ing',
        titleKo: '전치사 뒤에는 [명사 / -ing]만 온다',
        titleEn: 'Prepositions strictly take Noun / -ing',
        badgeKo: '전치사 목적어 딸깍',
        badgeEn: 'Prep Object',
        summaryKo: '전치사 뒤에는 동사원형이나 to-V가 절대 올 수 없으며, [명사 / 대명사 목적격 / 동명사(-ing)]만 가능합니다.',
        summaryEn: 'Prepositions never take bare verbs or to-infinitives. Only nouns or gerunds (-ing).',
        formulaKo: '전치사 (for/in/with/by/about...) + [ 명사 / 동명사(-ing) ]',
        formulaEn: 'Preposition + [ Noun / Gerund (-ing) ]',
        examples: [
          {
            wrong: 'Thank you for **help** me with the project.',
            correct: 'Thank you for **helping** me with the project (O).',
            explanationKo: '전치사 for 뒤이므로 동명사 helping이 정답입니다.',
            explanationEn: '"for" is a preposition, requiring the gerund form "helping".'
          }
        ],
        proTipKo: '💡 뒤에 목적어(명사)가 딸려있으면 동명사(-ing), 목적어가 없으면 일반 명사를 선택하면 100% 정답!',
        proTipEn: '💡 If a direct object follows, choose -ing; if not, choose the noun!'
      },
      {
        id: 'adj_vs_adv',
        titleKo: '부사(-ly)는 손가락으로 가려도 문장이 멀쩡하다',
        titleEn: 'Adverbs (-ly) are optional modifiers',
        badgeKo: '부사 자리 딸깍',
        badgeEn: 'Adverb Slot',
        summaryKo: '빈칸을 손가락으로 가렸을 때 앞뒤 문장이 문법적으로 완벽하다면, 그 빈칸은 100% 수식어구인 [부사(-ly)] 자리입니다.',
        summaryEn: 'If removing the word leaves a complete sentence, it is 100% an Adverb.',
        formulaKo: '완전한 문장 (S + V + O) + [ 부사(-ly) ] / [ 부사(-ly) ] + 형용사/동사',
        formulaEn: 'Complete Clause + [ Adverb (-ly) ] / [ Adverb ] + Verb/Adj',
        examples: [
          {
            wrong: 'The system operates **efficient** under heavy loads.',
            correct: 'The system operates **efficiently** under heavy loads (O).',
            explanationKo: '동사 operates를 꾸미는 수식어 자리이므로 부사 efficiently가 정답입니다.',
            explanationEn: 'The action verb "operates" is modified by the adverb "efficiently".'
          }
        ],
        proTipKo: '💡 [조동사 + ___ + 본동사] 또는 [have/has + ___ + p.p.] 사이는 99.9% 부사 자리입니다!',
        proTipEn: '💡 Between [Auxiliary + ___ + Main Verb] is 99.9% an ADVERB slot!'
      }
    ]
  },

  // 2. ⚡ 동사 & 수일치 / 능수동 딸깍 공식
  {
    id: 'verbs_agreement',
    titleKo: '동사 수일치 & 능수동 딸깍 공식',
    titleEn: 'Verb Agreement & Voice Rules',
    icon: '⚡',
    descriptionKo: '주어의 거품 수식어를 걷어내고 3초 만에 동사 형태를 결정하는 공식',
    descriptionEn: 'Strip away modifier fluff and nail subject-verb agreement in 3 seconds.',
    tips: [
      {
        id: 'subject_foam_rule',
        titleKo: '진짜 주어 뒤 수식어구 거품(전치사구/분사)은 괄호로 묶어라',
        titleEn: 'Strip modifier fluff to find the true Subject',
        badgeKo: '수일치 딸깍',
        badgeEn: 'Agreement Rule',
        summaryKo: '주어와 동사 사이에 전치사구(of/in/with)나 분사(-ing/p.p.)가 길게 끼어있으면 괄호 쳐서 버리고 맨 앞 [진짜 주어]에 동사를 맞춥니다.',
        summaryEn: 'Enclose prepositional and participle phrases in parentheses and match with the head subject.',
        formulaKo: '[ 진짜 주어 (단수/복수) ] + (전치사구/관계사/분사 수식어구) + [ 동사 (수일치) ]',
        formulaEn: '[ Head Subject (Singular/Plural) ] + (Modifiers) + [ VERB ]',
        examples: [
          {
            wrong: 'The list of new attendees **were** approved.',
            correct: 'The list (of new attendees) **was** approved (O).',
            explanationKo: '진짜 주어는 단수명사인 The list이므로 단수동사 was가 정답입니다.',
            explanationEn: '"The list" is singular, requiring the singular verb "was".'
          }
        ],
        proTipKo: '💡 "A number of + 복수명사 ➔ 복수동사(많은~)", "The number of + 복수명사 ➔ 단수동사(~의 수)"를 무조건 암기하세요!',
        proTipEn: '💡 "A number of + Plural ➔ Plural Verb", "The number of + Plural ➔ Singular Verb".'
      },
      {
        id: 'passive_no_object',
        titleKo: '타동사 뒤에 목적어(명사)가 없으면 90% 수동태(be + p.p.)',
        titleEn: 'No Object after transitive verb = Passive Voice',
        badgeKo: '능/수동 딸깍',
        badgeEn: 'Voice Rule',
        summaryKo: '일반적인 타동사 빈칸 뒤에 목적어(명사)가 없고 바로 전치사구나 마침표가 온다면 [be + p.p. (수동태)]가 정답입니다.',
        summaryEn: 'If a transitive verb is followed by a preposition or period (no object), it is Passive.',
        formulaKo: '타동사 + [ 목적어 명사 있음 ➔ 능동태 ] vs [ 목적어 없음 (전치사구) ➔ be p.p. 수동태 ]',
        formulaEn: 'With Object ➔ Active / Without Object ➔ Passive (be + p.p.)',
        examples: [
          {
            wrong: 'The contract **signed** by the CEO yesterday.',
            correct: 'The contract **was signed** by the CEO yesterday (O).',
            explanationKo: '목적어 없이 전치사 by가 오므로 수동태 was signed가 정답입니다.',
            explanationEn: 'No direct object exists before "by", requiring the passive "was signed".'
          }
        ],
        proTipKo: '💡 단, 1형식 자동사(appear, happen, occur, rise, remain)는 수동태(be happened) 자체가 절대 불가능합니다!',
        proTipEn: '💡 Intransitive verbs (occur, disappear, happen) NEVER take passive forms!'
      }
    ]
  },

  // 3. 🎯 5형식 & 준동사(to-V vs -ing) 딸깍 공식
  {
    id: 'verbals_form5',
    titleKo: '5형식 & 준동사 딸깍 공식',
    titleEn: 'Form 5 & Verbals Rules',
    icon: '🎯',
    descriptionKo: '사역/지각/유도동사와 to부정사/동명사를 1초 만에 짝짓는 공식',
    descriptionEn: 'Match causatives, perception verbs and to-V vs -ing pairs instantly.',
    tips: [
      {
        id: 'causative_verb_root',
        titleKo: '사역동사(make/have/let) + 목적어 + [동사원형 (능동)]',
        titleEn: 'Causative Verbs take Bare Infinitive for Active',
        badgeKo: '사역동사 딸깍',
        badgeEn: 'Causative Rule',
        summaryKo: 'make, have, let 뒤에 목적어가 능동으로 동작하면 목적격 보어로 to-V가 아닌 [동사원형]이 옵니다.',
        summaryEn: 'make, have, let require bare infinitives when the object actively performs the action.',
        formulaKo: 'make / have / let + 목적어 + [ 동사원형 (to 없음) ]',
        formulaEn: 'make / have / let + Object + [ BARE VERB ]',
        examples: [
          {
            wrong: 'The manager made us **to stay** late.',
            correct: 'The manager made us **stay** late (O).',
            explanationKo: '사역동사 made 뒤이므로 to stay가 아닌 동사원형 stay가 정답입니다.',
            explanationEn: 'Causative verb "made" requires the bare infinitive "stay".'
          }
        ],
        proTipKo: '💡 반면 ask, allow, require, enable, encourage, expect, remind는 [목적어 + to-V] 구조를 씁니다!',
        proTipEn: '💡 "allow/require/enable/encourage + Object + to-V" is the opposite standard!'
      },
      {
        id: 'ing_only_verbs',
        titleKo: '동명사(-ing)만을 목적어로 취하는 메가패스(MEGAPASS) 동사',
        titleEn: 'Verbs taking ONLY Gerunds (-ing)',
        badgeKo: '동명사 목적어 딸깍',
        badgeEn: 'Gerund Object',
        summaryKo: 'Mind, Enjoy, Give up, Avoid, Postpone, Admit, Suggest, Stop 뒤에는 to-V가 오면 무조건 오답이며 [-ing]만 정답입니다.',
        summaryEn: 'mind, enjoy, avoid, postpone, admit, suggest strictly take gerunds (-ing).',
        formulaKo: 'enjoy / avoid / consider / suggest / postpone + [ 동명사 (-ing) (정답) ]',
        formulaEn: 'enjoy / avoid / consider / suggest + [ GERUND (-ing) ]',
        examples: [
          {
            wrong: 'He suggested **to postpone** the launch.',
            correct: 'He suggested **postponing** the launch (O).',
            explanationKo: 'suggest는 동명사만을 목적어로 취하므로 postponing이 맞습니다.',
            explanationEn: '"suggest" strictly requires the gerund "postponing".'
          }
        ],
        proTipKo: '💡 "look forward to -ing", "be used to -ing", "object to -ing"의 to는 전치사이므로 무조건 -ing를 고르세요!',
        proTipEn: '💡 The "to" in "look forward to -ing" is a preposition, so pick -ing!'
      }
    ]
  },

  // 4. 🪄 고난도 도치 & 가정법 생략 딸깍 공식 (토익 900+ / 편입)
  {
    id: 'inversion_subjunctive',
    titleKo: '고난도 도치 & 가정법 딸깍 공식',
    titleEn: 'Inversion & Subjunctive Rules',
    icon: '🪄',
    descriptionKo: '토익 900+ 및 편입 기출 킬러 도치 구문을 3초 만에 꿰뚫는 공식',
    descriptionEn: 'High-yield killer inversion & subjunctive formulas for 990/Transfer exams.',
    tips: [
      {
        id: 'if_omitted_inversion',
        titleKo: '가정법에서 If가 생략되면 [Had / Were / Should]가 튀어나온다',
        titleEn: 'If-Omission Inversion (Had / Were / Should)',
        badgeKo: 'If생략 도치 딸깍',
        badgeEn: 'Subjunctive Inversion',
        summaryKo: '문장 맨 앞에 빈칸이 있고 뒤에 주어 + 동사가 오는데 If가 보기에 없다면 [Had S p.p. / Were S to-V / Should S V] 도치 공식입니다.',
        summaryEn: 'When "if" is omitted in conditional clauses, Had/Were/Should inverts before Subject.',
        formulaKo: '[ Had + S + p.p. ] = If S had p.p. / [ Should + S + 동사원형 ] = If S should V',
        formulaEn: '[ Had + S + p.p. ] = If S had p.p. / [ Should + S + Base V ] = If S should V',
        examples: [
          {
            wrong: '**If had I known** the schedule, I would have joined.',
            correct: '**Had I known** the schedule, I would have joined (O).',
            explanationKo: 'If가 생략되면서 Had와 주어 I가 도치된 올바른 구조입니다.',
            explanationEn: '"Had I known" is the correct inverted form of "If I had known".'
          }
        ],
        proTipKo: '💡 문장 맨 앞 빈칸 뒤에 [S + have/need/require]가 있다면 "Should"를 찍으면 100% 정답!',
        proTipEn: '💡 If a blank at the start is followed by [S + Base Verb], pick "Should"!'
      },
      {
        id: 'negative_inversion',
        titleKo: '부정어(Never/Hardly/Seldom/Only)가 문두에 오면 [의문문 어순] 도치',
        titleEn: 'Negative Adverbs at the front trigger Inversion',
        badgeKo: '부정어 도치 딸깍',
        badgeEn: 'Negative Inversion',
        summaryKo: 'Never, Hardly, Scarcely, Seldom, Little, Only 부사구가 문장 맨 앞에 오면 주어-동사가 [조동사/be + 주어 + 본동사] 의문문 어순으로 뒤집힙니다.',
        summaryEn: 'Never, Hardly, Seldom, Only at the front force auxiliary inversion (Aux + S + V).',
        formulaKo: '부정어 (Never / Hardly / Only then) + [ 조동사(did/have/will) + 주어 + 동사원형 ]',
        formulaEn: 'Negative Adv + [ Auxiliary (did/have/do) + Subject + Main Verb ]',
        examples: [
          {
            wrong: 'Hardly **she had arrived** when the phone rang.',
            correct: 'Hardly **had she arrived** when the phone rang (O).',
            explanationKo: '문두에 부정어 Hardly가 왔으므로 had she arrived로 도치되어야 합니다.',
            explanationEn: 'Negative word "Hardly" triggers inversion: "had she arrived".'
          }
        ],
        proTipKo: '💡 "Not until + 시간부사구 + [did + 주어 + 동사원형]" 공식은 편입/수능 1순위 킬러 문제입니다!',
        proTipEn: '💡 "Not until ... + did S + V" is a guaranteed top-tier killer pattern!'
      }
    ]
  },

  // 5. 🔗 관계사 & 접속사 vs 전치사 딸깍 공식
  {
    id: 'relatives_connectors',
    titleKo: '관계사 & 접속사 vs 전치사 딸깍 공식',
    titleEn: 'Clauses & Connectors Rules',
    icon: '🔗',
    descriptionKo: 'that vs what, because vs because of를 1초 만에 판별하는 공식',
    descriptionEn: 'Distinguish that vs. what and conjunction vs. preposition in 1 second.',
    tips: [
      {
        id: 'that_vs_what',
        titleKo: 'that vs what 1초 판별법: [선행사 유무 + 뒷문장 완전성]',
        titleEn: 'That vs. What 1-Second Discrimination',
        badgeKo: 'that vs what 딸깍',
        badgeEn: 'That vs What',
        summaryKo: '앞에 명사(선행사)가 없고 뒤에 주어나 목적어가 빠진 불완전한 문장이 오면 [what], 뒷문장이 완벽하면 [that]입니다.',
        summaryEn: 'No preceding noun + Incomplete clause = WHAT. Complete clause = THAT.',
        formulaKo: '선행사 없음 + [ 불완전한 절 (주어/목적어 없음) ➔ WHAT (정답) ]',
        formulaEn: 'No Antecedent + Incomplete Clause ➔ WHAT / Complete Clause ➔ THAT',
        examples: [
          {
            wrong: 'This is **that** I have been looking for.',
            correct: 'This is **what** I have been looking for (O).',
            explanationKo: 'looking for의 목적어가 없고 선행사가 없으므로 관계대명사 what이 맞습니다.',
            explanationEn: '"what" acts as the object of "for" with no prior noun antecedent.'
          }
        ],
        proTipKo: '💡 "what + 완전한 문장"은 영어에 아예 존재하지 않는 100% 오답 보기입니다!',
        proTipEn: '💡 "what + complete sentence" is always 100% grammatically invalid!'
      },
      {
        id: 'conj_vs_prep',
        titleKo: '접속사 뒤에는 [주어+동사], 전치사 뒤에는 [명사구]',
        titleEn: 'Conjunction (+ S+V) vs. Preposition (+ Noun)',
        badgeKo: '접속사 vs 전치사 딸깍',
        badgeEn: 'Conj vs Prep',
        summaryKo: '빈칸 뒤에 동사가 살아있으면 접속사(although, because, while), 명사(구)만 덜렁 있다면 전치사(despite, because of, during)를 고릅니다.',
        summaryEn: 'If a finite verb exists in the clause ➔ Conjunction. If only a noun phrase ➔ Preposition.',
        formulaKo: '[ Although / Because / While ] + S + V vs [ Despite / Because of / During ] + 명사(구)',
        formulaEn: 'Conj + S + V vs. Prep + Noun Phrase',
        examples: [
          {
            wrong: '**Despite** it was raining heavily, we went out.',
            correct: '**Although** it was raining heavily, we went out (O).',
            explanationKo: '뒤에 it was raining(주어+동사)이 오므로 접속사 Although가 정답입니다.',
            explanationEn: '"it was raining" is a clause with subject and verb, requiring "Although".'
          }
        ],
        proTipKo: '💡 despite of는 세상에 없는 엉터리 영어입니다! (despite 또는 in spite of)',
        proTipEn: '💡 "despite of" does not exist in English! Use either "despite" or "in spite of".'
      }
    ]
  }
];
