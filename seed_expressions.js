import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, serverTimestamp, getDocs } from 'firebase/firestore';

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

const NATIVE_EXPRESSIONS = [
  // ☕ 1. 미드/일상 회화 (daily)
  {
    category: 'daily',
    expression: 'on the fence',
    meaning: '결정을 못 내리고 고민 중인, 망설이는',
    nuance: '울타리(fence) 위에 걸터앉아 이쪽으로 갈지 저쪽으로 갈지 정하지 못한 상태에서 유래된 매우 흔한 일상 회화 관용구입니다.',
    similarExpressions: ['undecided', 'torn between two choices', 'weighing options'],
    dialogue: [
      { speaker: 'A', en: 'Are you coming to Sarah\'s birthday party tonight?', ko: '너 오늘 밤 사라 생일 파티에 올 거야?' },
      { speaker: 'B', en: 'I\'m still on the fence. I have a lot of work to finish.', ko: '아직 고민 중이야. 끝내야 할 일이 많아서.' }
    ],
    quizQuestion: {
      sentence: 'I haven\'t made up my mind yet; I\'m still ____.',
      answer: 'on the fence',
      options: [
        { text: 'on the fence', is_correct: true, feedback: "'on the fence'는 '아직 고민 중인, 미정인'이라는 대표적인 관용구입니다." },
        { text: 'under the weather', is_correct: false, feedback: "'under the weather'는 '몸 상태가 안 좋은'이라는 뜻입니다." },
        { text: 'out of the blue', is_correct: false, feedback: "'out of the blue'는 '갑자기, 난데없이'라는 뜻입니다." },
        { text: 'in the same boat', is_correct: false, feedback: "'in the same boat'는 '같은 처지인'이라는 뜻입니다." }
      ]
    }
  },
  {
    category: 'daily',
    expression: 'ring a bell',
    meaning: '들어본 적이 있다, 낯익다',
    nuance: '머릿속에서 딸랑딸랑 종이 울리듯 어딘가 들어본 기억이나 익숙한 느낌이 떠오를 때 씁니다.',
    similarExpressions: ['sound familiar', 'strike a chord'],
    dialogue: [
      { speaker: 'A', en: 'Do you know a guy named James Miller?', ko: '제임스 밀러라는 사람 알아?' },
      { speaker: 'B', en: 'The name rings a bell, but I can\'t remember his face.', ko: '이름은 낯이 익은데 얼굴이 기억 안 나네.' }
    ],
    quizQuestion: {
      sentence: 'His name ____, but I can\'t recall where we first met.',
      answer: 'rings a bell',
      options: [
        { text: 'rings a bell', is_correct: true, feedback: "'ring a bell'은 '어디서 들어본 것 같다, 낯익다'라는 뜻의 관용 표현입니다." },
        { text: 'breaks the ice', is_correct: false, feedback: "'break the ice'는 '어색한 분위기를 깨다'라는 뜻입니다." },
        { text: 'hits the nail', is_correct: false, feedback: "'hit the nail on the head'는 '핵심을 찌르다'라는 뜻입니다." },
        { text: 'bites the dust', is_correct: false, feedback: "'bite the dust'는 '패배하다, 망하다'라는 뜻입니다." }
      ]
    }
  },
  {
    category: 'daily',
    expression: 'under the weather',
    meaning: '몸 상태가 찌뿌둥한, 컨디션이 안 좋은',
    nuance: '심각한 질병이 아니라 가벼운 감기 기운이나 피로로 몸이 으슬으슬할 때 원어민들이 가장 자연스럽게 쓰는 표현입니다.',
    similarExpressions: ['feeling sick', 'not feeling well', 'feeling run-down'],
    dialogue: [
      { speaker: 'A', en: 'You look a bit pale today. Are you okay?', ko: '너 오늘 안색이 좀 안 좋아 보여. 괜찮아?' },
      { speaker: 'B', en: 'I\'m feeling a bit under the weather. I think I caught a cold.', ko: '몸이 좀 찌뿌둥해. 감기에 걸린 것 같아.' }
    ],
    quizQuestion: {
      sentence: 'She called in sick because she was feeling ____.',
      answer: 'under the weather',
      options: [
        { text: 'under the weather', is_correct: true, feedback: "'under the weather'는 컨디션이 좋지 않거나 감기 기운이 있을 때 쓰는 핵심 표현입니다." },
        { text: 'over the moon', is_correct: false, feedback: "'over the moon'은 '너무나 신나고 행복한'이라는 뜻입니다." },
        { text: 'off the hook', is_correct: false, feedback: "'off the hook'은 '책임/곤경에서 벗어난'이라는 뜻입니다." },
        { text: 'on thin ice', is_correct: false, feedback: "'on thin ice'는 '살얼음판을 걷는 듯 위태로운'이라는 뜻입니다." }
      ]
    }
  },

  // 💼 2. 비즈니스 & 오피스 (business)
  {
    category: 'business',
    expression: 'touch base',
    meaning: '(상황 점검차) 간단히 연락하다, 이야기 나누다',
    nuance: '야구의 베이스를 터치하듯, 프로젝트나 업무 진행 상황을 빠르게 확인하고 업데이트하기 위해 연락할 때 쓰는 대표 비즈니스 표현입니다.',
    similarExpressions: ['check in', 'follow up', 'briefly catch up'],
    dialogue: [
      { speaker: 'A', en: 'Let\'s touch base tomorrow morning regarding the client proposal.', ko: '고객 제안서 관련해서 내일 아침에 간단히 상황 체크합시다.' },
      { speaker: 'B', en: 'Sounds good. I\'ll have the draft ready by 9 AM.', ko: '좋습니다. 오전 9시까지 초안 준비해 둘게요.' }
    ],
    quizQuestion: {
      sentence: 'I will ____ with you next Monday to discuss the budget updates.',
      answer: 'touch base',
      options: [
        { text: 'touch base', is_correct: true, feedback: "'touch base with ~'는 '상황 확인차 연락하다'라는 비즈니스 필수 표현입니다." },
        { text: 'cut corners', is_correct: false, feedback: "'cut corners'는 '절차나 비용을 대충 생략하다'라는 부정적 뜻입니다." },
        { text: 'burn bridges', is_correct: false, feedback: "'burn bridges'는 '관계를 완전히 끊다'라는 뜻입니다." },
        { text: 'drop the ball', is_correct: false, feedback: "'drop the ball'은 '실수를 저지르다'라는 뜻입니다." }
      ]
    }
  },
  {
    category: 'business',
    expression: 'on the same page',
    meaning: '의견이 일치하는, 같은 방향을 바라보는',
    nuance: '회의나 협상에서 모든 팀원이 동일한 책의 같은 페이지를 읽고 있듯 완벽히 같은 이해와 합의를 공유하고 있음을 뜻합니다.',
    similarExpressions: ['in agreement', 'aligned', 'sharing the same view'],
    dialogue: [
      { speaker: 'A', en: 'Before we launch the campaign, I want to make sure we\'re all on the same page.', ko: '캠페인을 시작하기 전에 우리 모두 의견이 완전히 일치하는지 확인하고 싶습니다.' },
      { speaker: 'B', en: 'We\'ve reviewed the milestones and agree with the strategy.', ko: '마일스톤을 검토했고 전략에 모두 동의했습니다.' }
    ],
    quizQuestion: {
      sentence: 'To avoid misunderstandings, let\'s ensure everyone is ____.',
      answer: 'on the same page',
      options: [
        { text: 'on the same page', is_correct: true, feedback: "'on the same page'는 '이해/의견이 일치하다'라는 뜻의 직장인 필수 관용구입니다." },
        { text: 'out of the loop', is_correct: false, feedback: "'out of the loop'은 '소식이나 정보에서 소외된'이라는 뜻입니다." },
        { text: 'in hot water', is_correct: false, feedback: "'in hot water'는 '곤경에 처한'이라는 뜻입니다." },
        { text: 'by the book', is_correct: false, feedback: "'by the book'은 '원리원칙대로'라는 뜻입니다." }
      ]
    }
  },

  // ✈️ 3. 해외여행 & 일상 생활 (travel)
  {
    category: 'travel',
    expression: 'Keep the change',
    meaning: '잔돈은 가지세요 (거스름돈은 됐습니다)',
    nuance: '해외 택시, 카페, 레스토랑 등에서 팁 문화에 맞춰 거스름돈을 팁으로 남길 때 가장 쿨하고 자연스럽게 쓰는 표현입니다.',
    similarExpressions: ['You can keep the rest', 'No change needed'],
    dialogue: [
      { speaker: 'A', en: 'Here is twenty dollars for the taxi fare.', ko: '택시비 20달러 여기 있습니다.' },
      { speaker: 'B', en: 'Keep the change. Thank you for the safe ride!', ko: '잔돈은 가지세요. 안전하게 태워다 주셔서 감사합니다!' }
    ],
    quizQuestion: {
      sentence: 'When paying the cab driver $15 for a $12 fare, she said, "____."',
      answer: 'Keep the change',
      options: [
        { text: 'Keep the change', is_correct: true, feedback: "'Keep the change'는 거스름돈을 팁으로 줄 때 쓰는 여행 영어의 정석입니다." },
        { text: 'Change your mind', is_correct: false, feedback: "'Change your mind'는 '마음을 바꾸다'라는 뜻입니다." },
        { text: 'Make a change', is_correct: false, feedback: "'Make a change'는 '변화를 일으키다'라는 뜻입니다." },
        { text: 'Short of change', is_correct: false, feedback: "'Short of change'는 '잔돈이 부족한'이라는 뜻입니다." }
      ]
    }
  },
  {
    category: 'travel',
    expression: 'Can I get this to go?',
    meaning: '이것 좀 포장(테이크아웃)해 주시겠어요?',
    nuance: '해외 식당이나 카페에서 남은 음식을 싸가거나 포장 주문할 때 가장 정중하고 흔하게 쓰는 표현입니다. (영국에서는 take away)',
    similarExpressions: ['To go, please', 'Could I have a to-go box?'],
    dialogue: [
      { speaker: 'A', en: 'Can I get this iced latte to go, please?', ko: '이 아이스 라떼 포장으로 가져갈 수 있을까요?' },
      { speaker: 'B', en: 'Sure thing! It will be ready in a minute.', ko: '물론이죠! 1분 안에 준비해 드릴게요.' }
    ],
    quizQuestion: {
      sentence: 'I don\'t have time to dine in, so ____, please.',
      answer: 'can I get this to go',
      options: [
        { text: 'can I get this to go', is_correct: true, feedback: "'get ~ to go'는 음식을 매장 밖으로 포장해 갈 때 쓰는 표현입니다." },
        { text: 'can I take my time', is_correct: false, feedback: "'take my time'은 '천천히 여유를 부리다'라는 뜻입니다." },
        { text: 'can I call it a day', is_correct: false, feedback: "'call it a day'는 '오늘 하루 일과를 마치다'라는 뜻입니다." },
        { text: 'can I pay in cash', is_correct: false, feedback: "'pay in cash'는 '현금으로 결제하다'라는 뜻입니다." }
      ]
    }
  },

  // 🎬 4. 원어민 만능 꿀패턴 (pattern)
  {
    category: 'pattern',
    expression: 'I\'m not really into ~',
    meaning: '나 ~에는 별로 취미/관심 없어 (~는 별로 안 끌려)',
    nuance: '"I don\'t like ~"처럼 직설적으로 싫다고 거절하기보다, 부드럽고 자연스럽게 본인의 취향이 아님을 밝힐 때 원어민들이 매일 쓰는 만능 패턴입니다.',
    similarExpressions: ['It\'s not my cup of tea', 'I\'m not a big fan of ~'],
    dialogue: [
      { speaker: 'A', en: 'Do you want to watch the horror movie with us?', ko: '우리랑 같이 공포 영화 볼래?' },
      { speaker: 'B', en: 'Thanks for asking, but I\'m not really into scary movies.', ko: '물어봐 줘서 고마운데, 나 무서운 영화는 별로 안 좋아해.' }
    ],
    quizQuestion: {
      sentence: 'I prefer tea because I\'m not really ____ coffee.',
      answer: 'into',
      options: [
        { text: 'into', is_correct: true, feedback: "'be into ~'는 '~에 푹 빠져있다/좋아하다'이며, 'not really into'는 '별로 안 끌리다'라는 만능 패턴입니다." },
        { text: 'onto', is_correct: false, feedback: "'be onto ~'는 '~의 비밀이나 단서를 눈치채다'라는 뜻입니다." },
        { text: 'with', is_correct: false, feedback: "'not really with'는 문법적으로 취향을 나타내는 패턴이 아닙니다." },
        { text: 'about', is_correct: false, feedback: "'be about ~'는 '~에 관한 것이다'라는 뜻입니다." }
      ]
    }
  },
  {
    category: 'pattern',
    expression: 'How come you ~?',
    meaning: '어째서 ~한 거야? (왜 그런 거야?)',
    nuance: '"Why did you ~?"보다 훨씬 친근하고 캐주얼하며 따지는 느낌 없이 놀라움이나 이유를 물어볼 때 쓰는 구어체 최강 패턴입니다. (뒤에 평서문 어순 S+V가 오는 것이 특징)',
    similarExpressions: ['Why is it that ~?', 'What made you ~?'],
    dialogue: [
      { speaker: 'A', en: 'How come you didn\'t answer my call last night?', ko: '어제 밤에 왜 내 전화 안 받았어?' },
      { speaker: 'B', en: 'Sorry, my phone was on silent mode and I fell asleep early.', ko: '미안해, 폰이 무음이었고 일찍 잠들었어.' }
    ],
    quizQuestion: {
      sentence: '____ you didn\'t tell me about the schedule change yesterday?',
      answer: 'How come',
      options: [
        { text: 'How come', is_correct: true, feedback: "'How come + 평서문(주어+동사)'은 '어째서 ~한 거야?'라는 원어민 대화 필수 패턴입니다." },
        { text: 'What about', is_correct: false, feedback: "'What about + 명사/-ing'는 '~는 어때?'라는 제안 표현입니다." },
        { text: 'Why did', is_correct: false, feedback: "'Why did' 뒤에는 주어+동사원형(tell)이 와야 하므로 didn't tell과 결합할 수 없습니다." },
        { text: 'How about', is_correct: false, feedback: "'How about'은 제안이나 권유를 나타냅니다." }
      ]
    }
  }
];

async function main() {
  console.log('🧹 Cleaning old expressions...');
  const snap = await getDocs(collection(db, 'expressions'));
  const batch1 = writeBatch(db);
  snap.forEach(d => batch1.delete(d.ref));
  await batch1.commit();
  console.log(`Deleted ${snap.size} old expressions.`);

  console.log('🚀 Seeding 4 Category Native Expressions...');
  const batch2 = writeBatch(db);
  const col = collection(db, 'expressions');

  for (const exp of NATIVE_EXPRESSIONS) {
    const ref = doc(col);
    batch2.set(ref, {
      ...exp,
      createdAt: serverTimestamp()
    });
  }

  await batch2.commit();
  console.log(`✅ Successfully seeded ${NATIVE_EXPRESSIONS.length} native expressions into Firestore!`);
}

main();
