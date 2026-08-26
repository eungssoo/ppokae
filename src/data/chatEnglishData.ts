export interface ChatAcronymItem {
  id: string;
  acronym: string;
  fullForm: string;
  meaningKo: string;
  meaningEn: string;
  category: 'acronym' | 'slang' | 'work_slack' | 'reaction';
  categoryLabel: string;
  vibe: 'casual' | 'genz' | 'office' | 'dating';
  exampleChat: {
    sender: 'user' | 'other';
    name: string;
    text: string;
    translationKo: string;
  }[];
  tip: string;
}

export interface ChatQuizScenario {
  id: string;
  context: string;
  contextKo: string;
  senderName: string;
  incomingMessage: string;
  incomingTranslation: string;
  options: {
    text: string;
    meaningKo: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export const CHAT_ACRONYMS: ChatAcronymItem[] = [
  // 1. 초빈출 채팅 줄임말 (Top Acronyms)
  {
    id: 'tbh',
    acronym: 'tbh',
    fullForm: 'To Be Honest',
    meaningKo: '솔직히 말해서',
    meaningEn: 'Used when stating a frank, genuine opinion',
    category: 'acronym',
    categoryLabel: '🔥 일상 필수 줄임말',
    vibe: 'casual',
    exampleChat: [
      { sender: 'other', name: 'Alex', text: 'Did you like that movie?', translationKo: '그 영화 재밌었어?' },
      { sender: 'user', name: 'Me', text: 'tbh it was kinda overrated 😅', translationKo: '솔직히 좀 과대평가된 것 같아 😅' }
    ],
    tip: '💡 문장 맨 앞이나 맨 뒤에 붙여서 솔직한 뉘앙스를 줄 때 가장 많이 씁니다.'
  },
  {
    id: 'ngl',
    acronym: 'ngl',
    fullForm: 'Not Gonna Lie',
    meaningKo: '거짓말 안 치고 / 솔직히',
    meaningEn: 'Admitting something surprising or honest',
    category: 'acronym',
    categoryLabel: '🔥 일상 필수 줄임말',
    vibe: 'casual',
    exampleChat: [
      { sender: 'other', name: 'Sam', text: 'How was the English grammar quiz?', translationKo: '영문법 퀴즈 어땠어?' },
      { sender: 'user', name: 'Me', text: 'ngl that Level 4 was insanely hard 🔥', translationKo: '구라 안 치고 레벨 4 개어려웠음 🔥' }
    ],
    tip: '💡 tbh보다 좀 더 젊고 감정적인 리액션을 전달할 때 애용됩니다.'
  },
  {
    id: 'fr',
    acronym: 'fr / frfr',
    fullForm: 'For Real (For Real For Real)',
    meaningKo: '진짜로 / 리얼 / 찐으로',
    meaningEn: 'Confirming truth or showing strong agreement',
    category: 'acronym',
    categoryLabel: '🔥 일상 필수 줄임말',
    vibe: 'genz',
    exampleChat: [
      { sender: 'other', name: 'Chloe', text: 'Antigravity AI is so useful!', translationKo: '이 앱 진짜 유용하다!' },
      { sender: 'user', name: 'Me', text: 'fr it saved my study time frfr 💯', translationKo: 'ㄹㅇ 공부 시간 엄청 아껴줌 찐찐 💯' }
    ],
    tip: '💡 "Is that for real?"의 줄임말로 맞장구칠 때 "fr" 한마디만 보내도 됩니다.'
  },
  {
    id: 'idk',
    acronym: 'idk',
    fullForm: "I Don't Know",
    meaningKo: '나도 잘 몰라 / 글쎄',
    meaningEn: 'Expressing lack of information or uncertainty',
    category: 'acronym',
    categoryLabel: '🔥 일상 필수 줄임말',
    vibe: 'casual',
    exampleChat: [
      { sender: 'other', name: 'David', text: 'What time are we meeting?', translationKo: '우리 몇 시에 만나?' },
      { sender: 'user', name: 'Me', text: 'idk ask Sarah, she made the plan', translationKo: '몰라 사라한테 물어봐 걔가 짰어' }
    ],
    tip: '💡 "idc (I don\'t care - 노상관)"와 헷갈리지 않게 주의하세요!'
  },
  {
    id: 'omw',
    acronym: 'omw',
    fullForm: 'On My Way',
    meaningKo: '지금 가는 중이야',
    meaningEn: 'Currently heading towards the destination',
    category: 'acronym',
    categoryLabel: '🔥 일상 필수 줄임말',
    vibe: 'casual',
    exampleChat: [
      { sender: 'other', name: 'Emma', text: 'Where are you right now?', translationKo: '너 지금 어디야?' },
      { sender: 'user', name: 'Me', text: 'omw! Will be there in 5 mins 🏃💨', translationKo: '가는 중! 5분 뒤에 도착함 🏃💨' }
    ],
    tip: '💡 약속 시간 늦었을 때 카톡에서 "나 가는 중" 보낼 때 무조건 쓰는 3글자!'
  },
  {
    id: 'rn',
    acronym: 'rn',
    fullForm: 'Right Now',
    meaningKo: '지금 당장 / 바로 지금',
    meaningEn: 'At this very moment',
    category: 'acronym',
    categoryLabel: '🔥 일상 필수 줄임말',
    vibe: 'casual',
    exampleChat: [
      { sender: 'other', name: 'Jake', text: 'Can you hop on Discord?', translationKo: '디스코드 들어올 수 있어?' },
      { sender: 'user', name: 'Me', text: 'Can’t rn, studying for TOEIC 📚', translationKo: '지금은 안 돼, 토익 공부 중이야 📚' }
    ],
    tip: '💡 "atm (at the moment)"과 같은 뜻으로 번갈아가며 자주 씁니다.'
  },
  {
    id: 'imo',
    acronym: 'imo / imho',
    fullForm: 'In My Opinion / In My Humble Opinion',
    meaningKo: '내 생각에는 / 내 소견으로는',
    meaningEn: 'Softening a statement of personal view',
    category: 'acronym',
    categoryLabel: '🔥 일상 필수 줄임말',
    vibe: 'casual',
    exampleChat: [
      { sender: 'other', name: 'Lisa', text: 'Which avatar looks cooler?', translationKo: '어떤 아바타가 더 멋져 보여?' },
      { sender: 'user', name: 'Me', text: 'imo the Cyber Kitty is the best ✨', translationKo: '내 생각엔 사이버 키티가 짱인 듯 ✨' }
    ],
    tip: '💡 겸손하게 의견을 제시할 때는 h(humble)를 붙여 "imho"라고 씁니다.'
  },
  {
    id: 'afaik',
    acronym: 'afaik',
    fullForm: 'As Far As I Know',
    meaningKo: '내가 알기로는',
    meaningEn: 'Sharing knowledge while acknowledging limits',
    category: 'acronym',
    categoryLabel: '🔥 일상 필수 줄임말',
    vibe: 'casual',
    exampleChat: [
      { sender: 'other', name: 'Tom', text: 'Is the assignment due tonight?', translationKo: '과제 오늘 밤까지야?' },
      { sender: 'user', name: 'Me', text: 'afaik it was postponed to Friday!', translationKo: '내가 알기론 금요일로 미뤄졌어!' }
    ],
    tip: '💡 직장 슬랙(Slack)이나 대학 메신저에서 정보 공유할 때 빈출 표현!'
  },
  {
    id: 'lmao',
    acronym: 'lmao / lol',
    fullForm: 'Laughing My Ass Off',
    meaningKo: '개웃김 ㅋㅋㅋ / 빵터짐',
    meaningEn: 'Extremely hilarious reaction',
    category: 'reaction',
    categoryLabel: '😂 리액션 & 감정 표현',
    vibe: 'casual',
    exampleChat: [
      { sender: 'other', name: 'Ben', text: 'I just called my teacher Mom by mistake 💀', translationKo: '나 방금 실수로 교수님한테 엄마라고 부름 💀' },
      { sender: 'user', name: 'Me', text: 'LMAOOOO no way 😭😭', translationKo: 'ㅋㅋㅋㅋㅋㅋㅋ 미쳤냐고 😭😭' }
    ],
    tip: '💡 대문자로 LMAO를 쓰면 더 격하게 터진 뉘앙스를 줍니다.'
  },
  {
    id: 'smh',
    acronym: 'smh',
    fullForm: 'Shaking My Head',
    meaningKo: '절레절레 / 에휴 한심',
    meaningEn: 'Disappointment, disapproval, or disbelief',
    category: 'reaction',
    categoryLabel: '😂 리액션 & 감정 표현',
    vibe: 'casual',
    exampleChat: [
      { sender: 'other', name: 'Chris', text: 'He forgot his passport at the airport again...', translationKo: '걔 공항에 또 여권 두고 왔대...' },
      { sender: 'user', name: 'Me', text: 'smh classic Mike 🤦‍♂️', translationKo: '절레절레 마이크답네 진짜 🤦‍♂️' }
    ],
    tip: '💡 어이없거나 한숨 나오는 상황에 🤦 이모지와 찰떡궁합입니다.'
  },

  // 2. 최신 네이티브 & Z세대 슬랭 (Gen Z & Everyday Slang)
  {
    id: 'no_cap',
    acronym: 'no cap 🧢',
    fullForm: 'No Lie / 100% Genuine',
    meaningKo: '진짜야 / 구라 아님 (Cap = 거짓말)',
    meaningEn: 'Expressing that you are not exaggerating or lying',
    category: 'slang',
    categoryLabel: '✨ 최신 네이티브 슬랭',
    vibe: 'genz',
    exampleChat: [
      { sender: 'other', name: 'Noah', text: 'You got 990 on TOEIC in one month?!', translationKo: '한 달 만에 토익 990점 맞았다고?!' },
      { sender: 'user', name: 'Me', text: 'no cap, this app formula worked magic 🧢🚫', translationKo: '구라 안 치고 이 앱 공식 덕분임 🧢🚫' }
    ],
    tip: '💡 반대로 "That’s cap"은 "그거 구라야 / 뻥치네"라는 뜻입니다.'
  },
  {
    id: 'lowkey_highkey',
    acronym: 'lowkey / highkey',
    fullForm: 'Subtly vs. Super obviously',
    meaningKo: '은근히 / 대놓고 (완전 대박)',
    meaningEn: 'Secretly/moderately vs. openly/extremely',
    category: 'slang',
    categoryLabel: '✨ 최신 네이티브 슬랭',
    vibe: 'genz',
    exampleChat: [
      { sender: 'other', name: 'Mia', text: 'Are you nervous about the speaking test?', translationKo: '스피킹 시험 긴장돼?' },
      { sender: 'user', name: 'Me', text: 'I’m lowkey terrified, but highkey excited! 😆', translationKo: '은근 떨리는데, 대놓고 기대되기도 해! 😆' }
    ],
    tip: '💡 "lowkey wanting pizza (은근 피자 땡김)"처럼 부사로 엄청 많이 쓰입니다.'
  },
  {
    id: 'ghosting',
    acronym: 'ghosting',
    fullForm: 'Cutting off all communication abruptly',
    meaningKo: '잠수 타기 / 연락 끊기',
    meaningEn: 'Suddenly disappearing and ignoring messages',
    category: 'slang',
    categoryLabel: '✨ 최신 네이티브 슬랭',
    vibe: 'dating',
    exampleChat: [
      { sender: 'other', name: 'Zoe', text: 'Did Tyler ever reply to your DM?', translationKo: '타일러가 네 DM에 답장했어?' },
      { sender: 'user', name: 'Me', text: 'Nope, totally ghosted me 👻', translationKo: '아니, 완전 잠수 탔어 👻' }
    ],
    tip: '💡 소개팅이나 친구 사이뿐 아니라 면접 보고 회사에서 연락 없을 때도 씁니다.'
  },
  {
    id: 'slay',
    acronym: 'slay 💅',
    fullForm: 'Doing something exceptionally well',
    meaningKo: '찢었다 / 완전 대박 잘함',
    meaningEn: 'You killed it, looked fabulous, or succeeded greatly',
    category: 'slang',
    categoryLabel: '✨ 최신 네이티브 슬랭',
    vibe: 'genz',
    exampleChat: [
      { sender: 'other', name: 'Jenny', text: 'Check out my presentation slides!', translationKo: '내 발표 슬라이드 봐봐!' },
      { sender: 'user', name: 'Me', text: 'Omg you slayed that design! 💅✨', translationKo: '헐 디자인 완전 찢었네! 💅✨' }
    ],
    tip: '💡 칭찬이나 응원할 때 감탄사로 "Slayyy!" 단독으로도 씁니다.'
  },
  {
    id: 'spill_tea',
    acronym: 'spill the tea ☕',
    fullForm: 'Share the gossip / secret story',
    meaningKo: '썰 풀어봐 / 가십거리 알려줘',
    meaningEn: 'Telling juicy gossip or insider stories',
    category: 'slang',
    categoryLabel: '✨ 최신 네이티브 슬랭',
    vibe: 'casual',
    exampleChat: [
      { sender: 'user', name: 'Me', text: 'Something crazy happened today at work...', translationKo: '오늘 회사에서 진짜 미친 일 있었음...' },
      { sender: 'other', name: 'Lucas', text: 'Wait what?! Spill the tea rn! ☕👀', translationKo: '잠깐 뭔데?! 당장 썰 풀어봐! ☕👀' }
    ],
    tip: '💡 T는 Truth(진실)의 머리글자에서 유래되어 Gossip을 뜻합니다.'
  },

  // 3. 글로벌 비즈니스 & 슬랙(Slack) 줄임말
  {
    id: 'eod_cob',
    acronym: 'EOD / COB',
    fullForm: 'End Of Day / Close Of Business',
    meaningKo: '오늘 업무 마감(퇴근) 전까지',
    meaningEn: 'By the end of the working day (typically 5~6 PM)',
    category: 'work_slack',
    categoryLabel: '💼 슬랙 & 비즈니스 줄임말',
    vibe: 'office',
    exampleChat: [
      { sender: 'other', name: 'Manager', text: 'Can you send the financial report by EOD?', translationKo: '오늘 퇴근 전까지 재무 보고서 보내줄 수 있나요?' },
      { sender: 'user', name: 'Me', text: 'Sure thing, will share it before 5 PM 👍', translationKo: '네, 5시 전에 공유드리겠습니다 👍' }
    ],
    tip: '💡 글로벌 원격근무 슬랙이나 영문 이메일에서 데드라인을 잡을 때 필수입니다.'
  },
  {
    id: 'fyi',
    acronym: 'FYI',
    fullForm: 'For Your Information',
    meaningKo: '참고로 / 참고 바랍니다',
    meaningEn: 'Sharing informative context that needs no urgent reply',
    category: 'work_slack',
    categoryLabel: '💼 슬랙 & 비즈니스 줄임말',
    vibe: 'office',
    exampleChat: [
      { sender: 'user', name: 'Me', text: 'FYI server maintenance is scheduled at 2 AM', translationKo: '참고로 서버 점검은 새벽 2시 예정입니다' },
      { sender: 'other', name: 'Dev Lead', text: 'Noted, thanks for the heads up!', translationKo: '확인했습니다, 미리 알려줘서 고마워요!' }
    ],
    tip: '💡 "FYI" 뒤에 짧은 공지나 전달 사항을 붙여 쓰면 매우 깔끔합니다.'
  },
  {
    id: 'tldr',
    acronym: 'TL;DR',
    fullForm: "Too Long; Didn't Read",
    meaningKo: '3줄 요약 / 핵심 요약',
    meaningEn: 'A short summary of a long text',
    category: 'work_slack',
    categoryLabel: '💼 슬랙 & 비즈니스 줄임말',
    vibe: 'office',
    exampleChat: [
      { sender: 'other', name: 'Product Lead', text: 'Here is the 10-page spec document.', translationKo: '여기 10페이지 기획서입니다.' },
      { sender: 'other', name: 'Product Lead', text: 'TL;DR: Release date moved to next Monday.', translationKo: '3줄 요약: 출시일 다음 주 월요일로 연기됨.' }
    ],
    tip: '💡 긴 글을 쓰기 전에 맨 윗줄에 핵심 1줄을 적어줄 때 "TL;DR:"로 시작합니다.'
  },
  {
    id: 'asap',
    acronym: 'ASAP',
    fullForm: 'As Soon As Possible',
    meaningKo: '가능한 한 빨리 / 급구',
    meaningEn: 'With high urgency',
    category: 'work_slack',
    categoryLabel: '💼 슬랙 & 비즈니스 줄임말',
    vibe: 'office',
    exampleChat: [
      { sender: 'other', name: 'Designer', text: 'Please review the banner draft ASAP!', translationKo: '배너 시안 가능한 한 빨리 확인 부탁드려요!' },
      { sender: 'user', name: 'Me', text: 'On it right now! ⚡', translationKo: '지금 바로 확인할게요! ⚡' }
    ],
    tip: '💡 "에이셉"이라고 발음하며, 급한 요청을 부드럽게 강조할 때 씁니다.'
  }
];

export const CHAT_QUIZ_SCENARIOS: ChatQuizScenario[] = [
  {
    id: 'q1',
    context: '친구에게 주말 약속 시간 전에 현재 위치를 알리고 싶을 때',
    contextKo: '친구가 "너 어디야?"라고 물었을 때, 가장 자연스럽게 "지금 가는 중!"이라고 답하는 줄임말은?',
    senderName: 'Jessica',
    incomingMessage: 'Hey! We are all waiting at the cafe, where u at? 👀',
    incomingTranslation: '야! 우리 다 카페에서 기다리는 중인데 너 어디야? 👀',
    options: [
      {
        text: 'omw!! Running to the subway now 🏃💨',
        meaningKo: '가는 중!! 지금 지하철로 뛰어가고 있어 🏃💨',
        isCorrect: true,
        feedback: '정답! omw(On My Way)는 "가는 중이야"라는 뜻의 국민 약어입니다.'
      },
      {
        text: 'tbh, I am sleeping in bed 😴',
        meaningKo: '솔직히 나 침대에서 자는 중이야 😴',
        isCorrect: false,
        feedback: 'tbh는 "솔직히"라는 뜻이지만 가는 중이라는 약속 상황엔 맞지 않습니다.'
      },
      {
        text: 'tldr, cafe is nice',
        meaningKo: '3줄 요약, 카페 좋네',
        isCorrect: false,
        feedback: 'tldr은 긴 글 요약용입니다.'
      },
      {
        text: 'afaik subway is fast',
        meaningKo: '내가 알기로 지하철 빨라',
        isCorrect: false,
        feedback: 'afaik는 "내가 알기론"이라는 정보 전달용입니다.'
      }
    ]
  },
  {
    id: 'q2',
    context: '상대방의 놀라운 자랑이 진짜인지 의심 없이 찐으로 인정/공감할 때',
    contextKo: '친구가 "나 이번 영어 시험 1등 했어!"라고 했을 때 "헐 진짜로? 대박 찢었다!"라고 반응하려면?',
    senderName: 'Kevin',
    incomingMessage: 'Bro I just ranked #1 on today’s daily grammar battle 🏆🔥',
    incomingTranslation: '야 나 오늘자 일일 문법 랭킹전 1등 먹음 🏆🔥',
    options: [
      {
        text: 'fr?? No cap you slayed it!! 👑💯',
        meaningKo: '진짜로?? 구라 안 치고 완전 찢었네!! 👑💯',
        isCorrect: true,
        feedback: '정답! fr(For real) + no cap(구라 없이) + slayed(찢었다)는 최고의 Z세대 축하 조합입니다.'
      },
      {
        text: 'smh you are bad at grammar',
        meaningKo: '절레절레 너 문법 못하잖아',
        isCorrect: false,
        feedback: 'smh(Shaking my head)는 한심하거나 어이없을 때 씁니다.'
      },
      {
        text: 'EOD please send me the certificate',
        meaningKo: '오늘 퇴근 전까지 수료증 보내줘',
        isCorrect: false,
        feedback: 'EOD는 직장 슬랙 마감시간 표현입니다.'
      },
      {
        text: 'rn I don’t care at all',
        meaningKo: '지금 난 전혀 신경 안 씀',
        isCorrect: false,
        feedback: '대화 분위기를 깨는 어색한 표현입니다.'
      }
    ]
  },
  {
    id: 'q3',
    context: '어떤 사실에 대해 거짓말 안 치고 솔직한 감정을 털어놓을 때',
    contextKo: '친구가 새로 산 옷이나 음식 맛을 물어봤을 때 "솔직히 까놓고 말해서..."로 시작하는 가장 찰진 표현은?',
    senderName: 'Ashley',
    incomingMessage: 'How did you like that new trendy coffee shop? ☕✨',
    incomingTranslation: '그 새로 생긴 핫플 카페 어땠어? ☕✨',
    options: [
      {
        text: 'ngl the coffee was mid, but the vibe was aesthetic ✨',
        meaningKo: '솔직히 커피는 그저 그랬는데, 분위기는 갬성 있었음 ✨',
        isCorrect: true,
        feedback: '정답! ngl(Not gonna lie)은 "거짓말 안 치고 솔직히"를 말할 때 가장 완벽한 텍스트 표현입니다.'
      },
      {
        text: 'omw the coffee is hot',
        meaningKo: '가는 중 커피 뜨거움',
        isCorrect: false,
        feedback: 'omw는 이동 중일 때 씁니다.'
      },
      {
        text: 'asap please give me coffee',
        meaningKo: '빨리 커피 줘',
        isCorrect: false,
        feedback: '후기를 묻는 대화의 맥락에 맞지 않습니다.'
      },
      {
        text: 'FYI I drank water',
        meaningKo: '참고로 난 물 마심',
        isCorrect: false,
        feedback: '어색한 비즈니스 알림 톤입니다.'
      }
    ]
  },
  {
    id: 'q4',
    context: '직장 슬랙 메신저에서 상사/동료에게 기한 내 완료를 약속할 때',
    contextKo: '동료가 "이 기획안 언제까지 검토 가능하세요?"라고 물었을 때 "오늘 퇴근 전(업무 마감 전)까지 보내드릴게요!"라고 답하려면?',
    senderName: 'David (PM)',
    incomingMessage: 'When can you finish reviewing the product proposal? 📁',
    incomingTranslation: '제품 기획안 검토 언제까지 완료 가능하실까요? 📁',
    options: [
      {
        text: 'I will review it and send feedback by EOD today! 👍',
        meaningKo: '검토 후 오늘 업무 마감 전(퇴근 전)까지 피드백 드리겠습니다! 👍',
        isCorrect: true,
        feedback: '정답! EOD(End of Day)는 비즈니스 슬랙/이메일에서 "오늘 퇴근 전까지"를 뜻하는 핵심 줄임말입니다.'
      },
      {
        text: 'LMAOOO proposal is funny',
        meaningKo: 'ㅋㅋㅋㅋㅋ 기획안 개웃김',
        isCorrect: false,
        feedback: '비즈니스 상황에 부적절한 반응입니다.'
      },
      {
        text: 'Ghosting you until tomorrow',
        meaningKo: '내일까지 당신 연락 씹을게요',
        isCorrect: false,
        feedback: '잠수 탄다는 부정적 슬랭입니다.'
      },
      {
        text: 'tbh I forgot everything',
        meaningKo: '솔직히 나 다 까먹었음',
        isCorrect: false,
        feedback: '프로답지 못한 답변입니다.'
      }
    ]
  }
];
