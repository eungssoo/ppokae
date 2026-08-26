import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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
const auth = getAuth(app);

const CATEGORIES = {
  subject_verb_agreement: { id: 'subject_verb_agreement', badgeKo: '수일치 핵심' },
  tense_voice: { id: 'tense_voice', badgeKo: '시제 · 태' },
  verbals: { id: 'verbals', badgeKo: '준동사 핵심' },
  clauses_relatives: { id: 'clauses_relatives', badgeKo: '관계사 · 명사절' },
  connectors: { id: 'connectors', badgeKo: '접속사 vs 전치사' },
  parts_of_speech: { id: 'parts_of_speech', badgeKo: '품사 · 어휘' },
  modals_subjunctive: { id: 'modals_subjunctive', badgeKo: '가정법 · 조동사' },
  special_structures: { id: 'special_structures', badgeKo: '특수구문 · 도치' },
  verb_patterns: { id: 'verb_patterns', badgeKo: '자·타동사 콜로케이션' },
  parallel_agreement: { id: 'parallel_agreement', badgeKo: '병렬 · 상관접속' }
};

// ==========================================
// 🌟 160 MASTER QUESTIONS DATABASE
// ==========================================

const RAW_BANK = [
  // -------------------------------------------------------------
  // 🟢 LEVEL 1 (40 Questions: 10 Categories x 4)
  // -------------------------------------------------------------
  // 1. subject_verb_agreement
  { lvl: 1, cat: 'subject_verb_agreement', form: 1, s: "She ______ to the public library every morning before breakfast.", a: "goes", opts: ["goes", "go", "going", "gone"], t: "그녀는 매일 아침 아침 식사 전에 공공 도서관에 간다.", f: ["주어가 3인칭 단수(She)이고 현재 반복 습관이므로 goes가 정답입니다.", "3인칭 단수 주어에 동사원형은 불가합니다.", "단독 -ing는 본동사 불가입니다.", "have 없이 과거분사 단독은 동사 불가입니다."], cp: "3인칭 단수 주어(She) + 단수동사(goes)", nu: "매일 반복되는 일상을 나타내는 3인칭 단수 현재 시제" },
  { lvl: 1, cat: 'subject_verb_agreement', form: 2, s: "The new students in our classroom ______ very excited about the trip.", a: "are", opts: ["are", "is", "was", "be"], t: "우리 교실의 새로운 학생들은 여행에 대해 매우 신나 있다.", f: ["핵심 주어가 복수명사(The new students)이므로 복수 be동사 are가 정답입니다.", "복수 주어에 is는 수일치 위반입니다.", "복수 현재 상태이므로 was는 불가합니다.", "원형 be는 본동사 자리에 단독 사용 불가합니다."], cp: "복수 주어(The new students) + are", nu: "주어 뒤 전치사구 수식어를 걷어내고 복수 주어와 일치" },
  { lvl: 1, cat: 'subject_verb_agreement', form: 3, s: "Every teacher in this building ______ a digital tablet for class.", a: "has", opts: ["has", "have", "having", "are having"], t: "이 건물의 모든 선생님은 수업을 위한 디지털 태블릿을 가지고 있다.", f: ["Every + 단수명사는 단수 취급하므로 단수동사 has가 정답입니다.", "Every가 이끄는 단수 주어에 have는 불가합니다.", "단독 -ing는 동사 불가입니다.", "소유 의미는 진행형 불가입니다."], cp: "Every + 단수명사(teacher) + 단수동사(has)", nu: "Every 뒤 단수명사는 단수동사와 호응하는 기본 원칙" },
  { lvl: 1, cat: 'subject_verb_agreement', form: 4, s: "My elder brother often ______ me delicious snacks after school.", a: "buys", opts: ["buys", "buy", "buying", "bought yesterday"], t: "우리 형은 방과 후에 종종 나에게 맛있는 간식을 사준다.", f: ["주어(My elder brother)가 3인칭 단수이므로 단수동사 buys가 옵니다.", "3인칭 단수에 원형 buy는 수일치 위반입니다.", "단독 -ing는 동사 불가입니다.", "문맥에 맞지 않는 부사구입니다."], cp: "3인칭 단수 주어 + buys + IO(me) + DO(snacks)", nu: "수여동사의 3인칭 단수 현재 수일치" },

  // 2. tense_voice
  { lvl: 1, cat: 'tense_voice', form: 3, s: "My uncle ______ a brand new bicycle for my birthday yesterday.", a: "bought", opts: ["bought", "buys", "buying", "will buy"], t: "삼촌은 어제 내 생일을 위해 새 자전거를 사주셨다.", f: ["명백한 과거 시점 부사인 yesterday가 있으므로 과거시제 bought가 정답입니다.", "yesterday와 현재시제는 호응하지 않습니다.", "단독 -ing는 본동사 불가입니다.", "과거 단서와 미래시제는 모순입니다."], cp: "주어 + 과거동사(bought) + 목적어 + yesterday", nu: "명백한 과거 단서 부사와 단순 과거 시제의 결합" },
  { lvl: 1, cat: 'tense_voice', form: 3, s: "This famous storybook ______ by millions of children around the world.", a: "is read", opts: ["is read", "reads", "is reading", "readed"], t: "이 유명한 동화책은 전 세계 수백만 명의 어린이들에 의해 읽힌다.", f: ["책은 읽혀지는 대상(수동)이므로 수동태 be p.p. 형태인 is read가 정답입니다.", "능동태로 쓰면 책이 스스로 무언가를 읽는다는 비문이 됩니다.", "진행형은 어색합니다.", "read의 과거분사는 read입니다."], cp: "사물 주어 + 수동태(is read) + by 행위자", nu: "사물 주어와 행위자(by)가 나타내는 기본 수동태" },
  { lvl: 1, cat: 'tense_voice', form: 1, s: "The international flight will ______ at Incheon Airport tomorrow morning.", a: "arrive", opts: ["arrive", "arrived", "arrives", "arriving"], t: "국제선 비행기는 내일 아침 인천공항에 도착할 것이다.", f: ["조동사 will 뒤에는 반드시 동사원형이 와야 하므로 arrive가 정답입니다.", "조동사 뒤 과거형 불가입니다.", "조동사 뒤 3인칭 단수형 불가입니다.", "조동사 뒤 단독 -ing 불가입니다."], cp: "조동사(will) + 동사원형(arrive)", nu: "미래를 나타내는 조동사 will + 동사원형의 기본 어순" },
  { lvl: 1, cat: 'tense_voice', form: 3, s: "The golden trophy ______ to the best singer at the ceremony last night.", a: "was given", opts: ["was given", "gave", "is given", "giving"], t: "그 황금 트로피는 어젯밤 시상식에서 최고의 가수에게 수여되었다.", f: ["트로피는 수여되는 대상이며 last night 과거 시점이므로 was given이 정답입니다.", "능동 gave는 비문입니다.", "과거 시점 부사와 현재시제는 맞지 않습니다.", "단독 -ing는 동사 불가입니다."], cp: "사물 주어 + was given + last night", nu: "과거 특정 시점에 일어난 사물 수여의 수동태" },

  // 3. verbals
  { lvl: 1, cat: 'verbals', form: 3, s: "My sister decided ______ Japanese before traveling to Tokyo next summer.", a: "to learn", opts: ["to learn", "learning", "learn", "learned"], t: "내 여동생은 내년 여름 도쿄로 여행 가기 전에 일본어를 배우기로 결심했다.", f: ["decide는 미래지향적 의미의 to부정사를 목적어로 취하므로 to learn이 정답입니다.", "decide는 동명사를 취하지 않습니다.", "목적어 자리에 동사원형 불가입니다.", "과거동사는 목적어 불가입니다."], cp: "decide + to-V (to부정사 목적어)", nu: "미래의 결심을 나타내는 to부정사 목적어" },
  { lvl: 1, cat: 'verbals', form: 3, s: "They really enjoy ______ computer games together on weekends.", a: "playing", opts: ["playing", "to play", "play", "played"], t: "그들은 주말마다 함께 컴퓨터 게임을 하는 것을 정말 즐긴다.", f: ["enjoy는 동명사(-ing)만을 목적어로 취하는 대표적 타동사이므로 playing이 정답입니다.", "enjoy는 to부정사를 취하지 않습니다.", "목적어 자리에 원형 불가입니다.", "과거분사는 목적어 불가입니다."], cp: "enjoy + -ing (동명사 목적어)", nu: "현재 즐기는 활동을 나타내는 동명사 목적어" },
  { lvl: 1, cat: 'verbals', form: 5, s: "My mom always tells me ______ my teeth before going to sleep.", a: "to brush", opts: ["to brush", "brushing", "brush", "brushed"], t: "엄마는 항상 나에게 자기 전에 이를 닦으라고 말씀하신다.", f: ["tell은 5형식 구문에서 목적격 보어로 to부정사를 취하므로 to brush가 정답입니다.", "동명사는 tell의 보어로 불가합니다.", "사역동사가 아니므로 원형 불가입니다.", "과거분사는 보어로 부적절합니다."], cp: "tell + O(me) + to-V (5형식 목적격 보어)", nu: "지시나 부탁을 나타내는 tell + 목적어 + to부정사" },
  { lvl: 1, cat: 'verbals', form: 2, s: "Her favorite hobby in free time is ______ delicious cookies.", a: "baking", opts: ["baking", "bake", "baked", "bakes"], t: "그녀가 여가 시간에 가장 좋아하는 취미는 맛있는 쿠키를 굽는 것이다.", f: ["주격 보어 자리에서 '~하는 것'의 의미로 동명사 baking이 정답입니다.", "be동사 뒤 보어 자리에 원형 불가입니다.", "수동 의미가 아니므로 과거분사는 부적절합니다.", "3인칭 단수 동사는 보어 불가입니다."], cp: "주어(hobby) + is + 동명사 보어(baking)", nu: "주어의 구체적 내용을 설명하는 주격 보어 동명사" },

  // 4. clauses_relatives
  { lvl: 1, cat: 'clauses_relatives', form: 3, s: "I met a friendly doctor ______ helped my grandfather last week.", a: "who", opts: ["who", "which", "whose", "what"], t: "나는 지난주에 우리 할아버지를 도와주신 친절한 의사 선생님을 만났다.", f: ["선행사가 사람(doctor)이고 뒤에 주어가 빠진 주격 관계사절이므로 who가 정답입니다.", "사람 선행사에 which 불가입니다.", "whose 뒤에는 명사가 와야 합니다.", "선행사가 있으므로 what 불가입니다."], cp: "사람 선행사(doctor) + who + 동사", nu: "사람을 수식하는 가장 기본적인 주격 관계대명사" },
  { lvl: 1, cat: 'clauses_relatives', form: 3, s: "This is the interesting novel ______ won first prize in the contest.", a: "which", opts: ["which", "who", "whom", "where"], t: "이것은 그 대회에서 1등 상을 받은 흥미로운 소설이다.", f: ["선행사가 사물(novel)이고 관계사절의 주어 역할을 하므로 which가 정답입니다.", "사물 선행사에 who 불가입니다.", "목적격 whom은 사물에 불가입니다.", "where 뒤에는 완전한 절이 와야 합니다."], cp: "사물 선행사(novel) + which + 동사", nu: "사물 명사를 한정 수식하는 주격 관계대명사" },
  { lvl: 1, cat: 'clauses_relatives', form: 1, s: "This is the quiet village ______ my grandmother was born seventy years ago.", a: "where", opts: ["where", "which", "who", "what"], t: "이곳은 70년 전에 나의 할머니께서 태어나신 조용한 마을이다.", f: ["선행사가 장소(village)이고 뒤 문장이 완전한 절이므로 관계부사 where가 정답입니다.", "which 뒤에는 불완전한 절이 와야 합니다.", "장소 선행사에 who 불가입니다.", "선행사가 있으므로 what 불가입니다."], cp: "장소 선행사(village) + where + 완전한 절", nu: "장소를 나타내는 명사 뒤에서 공간적 배경을 설명하는 관계부사" },
  { lvl: 1, cat: 'clauses_relatives', form: 3, s: "I know the exact reason ______ he was absent from school yesterday.", a: "why", opts: ["why", "which", "who", "whose"], t: "나는 그가 어제 학교에 결석한 정확한 이유를 알고 있다.", f: ["선행사가 이유(the exact reason)이고 뒤 문장이 완전하므로 관계부사 why가 정답입니다.", "which 뒤에는 불완전한 절이 와야 합니다.", "이유 선행사에 who 불가입니다.", "소유격 whose는 부적절합니다."], cp: "reason + why + 완전한 절", nu: "원인과 이유를 설명하는 관계부사 why의 기본 쓰임" },

  // 5. connectors
  { lvl: 1, cat: 'connectors', form: 1, s: "We could not play soccer outside ______ it was raining heavily.", a: "because", opts: ["because", "because of", "despite", "during"], t: "비가 세차게 내리고 있었기 때문에 우리는 밖에서 축구를 할 수 없었다.", f: ["뒤에 [주어(it) + 동사(was raining)] 절이 이어지므로 접속사 because가 정답입니다.", "because of는 전치사이므로 절 앞에는 불가합니다.", "despite는 전치사입니다.", "during은 기간 명사 앞에 쓰는 전치사입니다."], cp: "주절 + 이유 접속사(because) + S + V", nu: "원인/이유를 나타내는 부사절 접속사 because vs 전치사구" },
  { lvl: 1, cat: 'connectors', form: 1, s: "They decided to go hiking ______ the sudden heavy rain.", a: "despite", opts: ["despite", "although", "even though", "because"], t: "갑작스러운 폭우에도 불구하고 그들은 하이킹을 가기로 결정했다.", f: ["뒤에 명사구(the sudden heavy rain)가 오고 양보의 의미이므로 전치사 despite가 정답입니다.", "although는 접속사이므로 명사구 앞에는 불가합니다.", "even though는 접속사입니다.", "because는 의미상 반대입니다."], cp: "주절 + 양보 전치사(despite) + 명사구", nu: "접속사(although) vs 전치사(despite)의 구조적 차이" },
  { lvl: 1, cat: 'connectors', form: 1, s: "Please stay inside the classroom ______ the teacher returns.", a: "until", opts: ["until", "during", "despite", "because of"], t: "선생님께서 돌아오실 때까지 교실 안에 머물러 있으세요.", f: ["뒤에 [주어(the teacher) + 동사(returns)] 절이 오며 시점의 한계를 나타내므로 접속사 until이 정답입니다.", "during은 전치사입니다.", "양보 전치사는 문맥에 맞지 않습니다.", "because of는 전치사입니다."], cp: "명령문 + 시간 접속사(until) + S + V", nu: "특정 시점까지의 지속을 나타내는 시간 접속사" },
  { lvl: 1, cat: 'connectors', form: 3, s: "He listened to soft music ______ he was studying for the math exam.", a: "while", opts: ["while", "during", "despite", "in spite of"], t: "그는 수학 시험공부를 하는 동안 부드러운 음악을 들었다.", f: ["뒤에 [주어 + 동사(he was studying)] 절이 이어지므로 접속사 while이 정답입니다.", "during은 전치사이므로 뒤에 절이 올 수 없습니다.", "양보 전치사는 문맥에 맞지 않습니다.", "in spite of는 전치사입니다."], cp: "주절 + 동시동작 접속사(while) + S + V", nu: "두 동작이 동시에 일어남을 나타내는 접속사 while vs 전치사 during" },

  // 6. parts_of_speech
  { lvl: 1, cat: 'parts_of_speech', form: 2, s: "The freshly baked bread in the morning smells very ______.", a: "delicious", opts: ["delicious", "deliciously", "deliciousness", "more deliciousness"], t: "아침에 갓 구운 빵은 매우 맛있는 냄새가 난다.", f: ["감각동사 smell 뒤의 주격 보어 자리에는 부사가 아닌 형용사 delicious가 옵니다.", "감각동사 보어 자리에 부사는 불가합니다.", "추상명사는 어색합니다.", "문법적으로 잘못된 형태입니다."], cp: "감각동사(smell) + 형용사 보어(delicious)", nu: "2형식 감각동사 뒤 주격 보어로 형용사를 취하는 기본 원리" },
  { lvl: 1, cat: 'parts_of_speech', form: 1, s: "The little boy solved the difficult puzzle ______ in ten minutes.", a: "easily", opts: ["easily", "easy", "easiness", "easier than"], t: "그 어린 소년은 10분 만에 그 어려운 퍼즐을 쉽게 풀었다.", f: ["동사 solved를 수식하는 자리이므로 부사 easily가 정답입니다.", "형용사는 동사를 수식할 수 없습니다.", "명사는 부사 자리에 불가합니다.", "비교 대상이 없으므로 비교급은 불가합니다."], cp: "동사 + 목적어 + 부사(easily)", nu: "동사의 동작 양상을 수식하는 일반 부사의 위치" },
  { lvl: 1, cat: 'parts_of_speech', form: 2, s: "All team members remained ______ during the emergency announcement.", a: "quiet", opts: ["quiet", "quietly", "quietness", "quieted"], t: "비상 안내 방송이 나오는 동안 모든 팀원들은 조용함을 유지했다.", f: ["상태유지 동사 remain 뒤 주격 보어 자리이므로 형용사 quiet가 정답입니다.", "보어 자리에 부사 quietly는 쓸 수 없습니다.", "명사는 주어와 동격이 아니므로 어색합니다.", "과거동사는 보어 자리에 불가합니다."], cp: "remain + 형용사 보어(quiet)", nu: "2형식 상태유지 동사 뒤 형용사 보어의 필수 규칙" },
  { lvl: 1, cat: 'parts_of_speech', form: 3, s: "We need to make an important ______ about our summer vacation today.", a: "decision", opts: ["decision", "decide", "decisive", "decisively"], t: "우리는 오늘 우리의 여름휴가에 대해 중요한 결정을 내려야 한다.", f: ["관사(an)와 형용사(important)의 수식을 받는 목적어 자리이므로 명사 decision이 정답입니다.", "동사는 명사 자리에 불가합니다.", "형용사는 명사 자리에 불가합니다.", "부사는 명사 자리에 올 수 없습니다."], cp: "make + an important + 명사(decision)", nu: "관사 + 형용사 + 명사로 이어지는 목적어 명사 자리" },

  // 7. modals_subjunctive
  { lvl: 1, cat: 'modals_subjunctive', form: 1, s: "You ______ wear a safety helmet when riding a bicycle on the street.", a: "must", opts: ["must", "can to", "ought", "having to"], t: "도로에서 자전거를 탈 때는 안전 헬멧을 반드시 착용해야 한다.", f: ["강한 의무를 나타내며 뒤에 동사원형 wear와 결합하는 조동사 must가 정답입니다.", "조동사 can 뒤에 to는 쓰지 않습니다.", "ought는 뒤에 to가 있어야 합니다.", "단독 -ing는 조동사 불가입니다."], cp: "조동사(must) + 동사원형(wear)", nu: "안전 수칙 준수를 나타내는 의무 조동사 must" },
  { lvl: 1, cat: 'modals_subjunctive', form: 3, s: "If you study hard every day, you ______ pass the entrance test easily.", a: "will", opts: ["will", "would have", "had", "are passed"], t: "매일 열심히 공부한다면, 너는 입학시험에 쉽게 합격할 것이다.", f: ["조건절 시제가 현재(study)이므로 주절에는 미래 조동사 will이 정답입니다.", "would have는 과거완료에 쓰입니다.", "단순 과거는 미래 결과와 맞지 않습니다.", "수동태 형태는 능동 목적어와 모순입니다."], cp: "If + S + 현재동사, S + will + 동사원형", nu: "실현 가능한 미래의 조건을 나타내는 단순 조건문" },
  { lvl: 1, cat: 'modals_subjunctive', form: 1, s: "Students ______ not make loud noise inside the library.", a: "should", opts: ["should", "need to", "able to", "ought"], t: "학생들은 도서관 안에서 큰 소리를 내서는 안 된다.", f: ["도덕적 의무/금지를 나타내며 not + 동사원형과 자연스럽게 연결되는 should가 정답입니다.", "need to not은 어색합니다.", "be able to에서 be가 빠져 있습니다.", "ought not to 형태로 써야 합니다."], cp: "should not + 동사원형(make)", nu: "공공장소 에티켓을 권고하는 조동사 should" },
  { lvl: 1, cat: 'modals_subjunctive', form: 3, s: "If I ______ enough money right now, I would buy that new laptop.", a: "had", opts: ["had", "have", "will have", "having"], t: "지금 내게 충분한 돈이 있다면, 그 새 노트북을 살 텐데.", f: ["주절이 would buy(가정법 과거)이므로 조건절에는 과거동사 had가 와야 합니다.", "가정법 과거 조건절에 현재시제 have는 불가합니다.", "조건절에 미래조동사 will은 쓰지 않습니다.", "단독 -ing는 동사 불가입니다."], cp: "If + S + 과거동사(had), S + would + 동사원형", nu: "현재 사실의 반대를 가정하는 기초 가정법 과거" },

  // 8. special_structures
  { lvl: 1, cat: 'special_structures', form: 1, s: "The more books you read, the ______ your vocabulary becomes.", a: "richer", opts: ["richer", "rich", "richest", "more richly"], t: "책을 더 많이 읽을수록, 너의 어휘력은 더 풍부해진다.", f: ["'The + 비교급 ..., the + 비교급 ...' 상관구문이므로 비교급 richer가 정답입니다.", "the 뒤에 원급 rich는 구문에 맞지 않습니다.", "최상급은 the 비교급 구문에 불가합니다.", "becomes 뒤 보어 자리에 부사는 불가합니다."], cp: "The more ..., the richer + S + V", nu: "비례적 변화를 나타내는 The 비교급 The 비교급 기초 구문" },
  { lvl: 1, cat: 'special_structures', form: 1, s: "Here ______ the school bus that we have been waiting for.", a: "comes", opts: ["comes", "come", "coming", "is coming to"], t: "우리가 기다리던 스쿨버스가 여기 온다.", f: ["장소 부사 Here가 문두에 올 때 단수 주어(the school bus)에 맞춰 도치된 단수동사 comes가 정답입니다.", "단수 주어에 복수동사 come은 수일치 위반입니다.", "단독 -ing는 동사 불가입니다.", "불필요한 전치사입니다."], cp: "Here + 동사(comes) + 단수 주어(the bus)", nu: "유도부사 Here/There 뒤 주어-동사 도치 어순" },
  { lvl: 1, cat: 'special_structures', form: 2, s: "This math question is much ______ than the previous one.", a: "easier", opts: ["easier", "easy", "easiest", "more easy"], t: "이 수학 문제는 이전 문제보다 훨씬 더 쉽다.", f: ["than이 있고 훨씬을 뜻하는 much의 수식을 받으므로 비교급 easier가 정답입니다.", "than 앞에는 원급이 올 수 없습니다.", "than 앞에는 최상급이 올 수 없습니다.", "easy의 비교급은 easier입니다."], cp: "much + 비교급(easier) + than", nu: "비교급 강조 부사(much)와 비교급 형용사의 결합" },
  { lvl: 1, cat: 'special_structures', form: 1, s: "There ______ many colorful birds singing in the garden this morning.", a: "are", opts: ["are", "is", "was", "be"], t: "오늘 아침 정원에서 많은 다채로운 새들이 지저귀고 있다.", f: ["There 뒤의 실질 주어가 복수명사(many colorful birds)이므로 복수 be동사 are가 정답입니다.", "복수 주어에 단수 is는 수일치 위반입니다.", "복수 주어에 was는 수일치 위반입니다.", "원형 be는 단독 본동사 불가입니다."], cp: "There are + 복수 주어(many birds)", nu: "There is/are 구문에서 진주어의 수에 따른 수일치" },

  // 9. verb_patterns
  { lvl: 1, cat: 'verb_patterns', form: 1, s: "The bright morning sun ______ in the east every day.", a: "rises", opts: ["rises", "raises", "rising", "is raised"], t: "밝은 아침 태양은 매일 동쪽에서 떠오른다.", f: ["태양이 스스로 떠오르는 자동사이자 3인칭 단수이므로 rises가 정답입니다.", "raise는 타동사이므로 목적어가 없는 자리에 불가합니다.", "단독 -ing는 동사 불가입니다.", "태양은 스스로 뜨는 것이지 들어 올려지는 수동이 아닙니다."], cp: "주어(sun) + 자동사(rises) + 전치사구", nu: "자동사 rise vs 타동사 raise의 명확한 구별" },
  { lvl: 1, cat: 'verb_patterns', form: 3, s: "Please ______ the heavy box on the table carefully.", a: "set", opts: ["set", "sit", "sitting", "sat"], t: "그 무거운 상자를 테이블 위에 조심스럽게 놓아주세요.", f: ["목적어(the heavy box)를 취하는 타동사이자 명령문 원형이므로 set이 정답입니다.", "sit은 자동사로 목적어를 취할 수 없습니다.", "명령문에 단독 -ing는 불가합니다.", "명령문은 동사원형이어야 합니다."], cp: "타동사(set) + 목적어(the box)", nu: "타동사 set(놓다) vs 자동사 sit(앉다)의 구별" },
  { lvl: 1, cat: 'verb_patterns', form: 3, s: "We should ______ the environmental issues in our science club meeting.", a: "discuss", opts: ["discuss", "discuss about", "discussing", "discussed about"], t: "우리는 과학 동아리 모임에서 환경 문제에 대해 토론해야 한다.", f: ["discuss는 완전타동사로 전치사 about 없이 목적어를 바로 취하므로 discuss가 정답입니다.", "discuss 뒤에 about을 붙이면 비문입니다.", "조동사 뒤에 단독 -ing는 불가합니다.", "조동사 뒤에는 동사원형이 와야 합니다."], cp: "조동사 + 타동사(discuss) + 목적어", nu: "전치사를 붙이지 않는 순수 타동사 discuss의 핵심 어법" },
  { lvl: 1, cat: 'verb_patterns', form: 1, s: "My grandfather likes to ______ down on the sofa for a short nap.", a: "lie", opts: ["lie", "lay", "laying", "laid"], t: "할아버지께서는 짧은 낮잠을 위해 소파에 눕는 것을 좋아하신다.", f: ["'눕다'라는 의미의 자동사 원형이 to 뒤에 와야 하므로 lie가 정답입니다.", "lay는 타동사 원형입니다.", "to 뒤에 -ing는 부자연스럽습니다.", "laid는 lay의 과거/과거분사형입니다."], cp: "to + 자동사(lie) + down", nu: "자동사 lie(눕다) vs 타동사 lay(놓다)의 형태 구별" },

  // 10. parallel_agreement
  { lvl: 1, cat: 'parallel_agreement', form: 3, s: "She likes both reading mystery novels and ______ delicious food.", a: "cooking", opts: ["cooking", "to cook", "cook", "cooked"], t: "그녀는 추리소설을 읽는 것과 맛있는 음식을 요리하는 것 둘 다를 좋아한다.", f: ["both A and B 구문에서 A(reading)와 B는 형태가 일치해야 하므로 동명사 cooking이 정답입니다.", "reading과 to cook은 병렬 구조에 어긋납니다.", "동사원형은 reading과 병렬을 이루지 못합니다.", "과거분사는 reading과 어울리지 않습니다."], cp: "both A(reading) and B(cooking)", nu: "상관접속사 both A and B에서 동일 품사/준동사 병렬 일치" },
  { lvl: 1, cat: 'parallel_agreement', form: 3, s: "He can speak not only English but also ______ Japanese fluently.", a: "speak", opts: ["speak", "speaking", "to speak", "spoke"], t: "그는 영어뿐만 아니라 일본어도 유창하게 말할 수 있다.", f: ["not only A but also B에서 조동사 can 뒤의 동사원형 speak와 병렬을 이루므로 speak가 정답입니다.", "조동사 뒤 동사원형과 병렬이어야 하므로 -ing는 불가합니다.", "to부정사는 can 뒤에 불가합니다.", "과거형은 can과 병렬을 이룰 수 없습니다."], cp: "not only speak A but also speak B", nu: "상관접속사 not only A but also B의 완벽한 문법적 병치" },
  { lvl: 1, cat: 'parallel_agreement', form: 1, s: "You can either stay at home ______ go to the cinema with us.", a: "or", opts: ["or", "and", "nor", "but"], t: "너는 집에 머물거나 우리와 함께 영화관에 갈 수 있다.", f: ["상관접속사 either는 or와 짝을 이루므로 or가 정답입니다.", "and는 either와 호응하지 않습니다.", "nor는 neither와 호응합니다.", "but은 not과 호응합니다."], cp: "either A or B (상관접속사 호응)", nu: "양자택일을 나타내는 상관접속사 either A or B 공식" },
  { lvl: 1, cat: 'parallel_agreement', form: 1, s: "Neither Tom ______ Jerry was able to solve the math riddle.", a: "nor", opts: ["nor", "or", "and", "but"], t: "톰도 제리도 그 수학 수수께끼를 풀 수 없었다.", f: ["상관접속사 neither는 nor와 짝을 이루므로 nor가 정답입니다.", "or는 either와 짝을 이룹니다.", "and는 both와 호응합니다.", "but은 not과 호응합니다."], cp: "Neither A nor B (상관접속사 호응)", nu: "양자 부정을 나타내는 상관접속사 neither A nor B 공식" },


  // -------------------------------------------------------------
  // 🔵 LEVEL 2 (40 Questions: 10 Categories x 4)
  // -------------------------------------------------------------
  // 1. subject_verb_agreement
  { lvl: 2, cat: 'subject_verb_agreement', form: 3, s: "A large number of foreign tourists ______ historical landmarks in Seoul every year.", a: "visit", opts: ["visit", "visits", "visiting", "is visiting"], t: "많은 외국인 관광객들이 매년 서울의 역사적 명소들을 방문한다.", f: ["'A number of + 복수명사'는 '많은 ~'라는 뜻으로 복수 취급하므로 visit이 정답입니다.", "A number of는 복수 취급하므로 3인칭 단수형 visits는 오류입니다.", "단독 -ing는 본동사 불가입니다.", "단수 be동사는 복수 주어와 맞지 않습니다."], cp: "A number of + 복수명사(tourists) + 복수동사(visit)", nu: "A number of(많은: 복수 취급) vs The number of(수의 합계: 단수 취급)의 구별" },
  { lvl: 2, cat: 'subject_verb_agreement', form: 2, s: "The total number of electric vehicles on the road ______ increasing steadily this year.", a: "is", opts: ["is", "are", "were", "being"], t: "올해 도로 위 전기차의 총 수는 꾸준히 증가하고 있다.", f: ["'The number of ~'의 핵심 주어는 The number(단수)이므로 단수 be동사 is가 정답입니다.", "The number of는 단수 취급하므로 are는 수일치 위반입니다.", "현재 진행 상태이므로 were는 불가합니다.", "being 단독은 동사가 될 수 없습니다."], cp: "The number of + 복수명사 + 단수동사(is)", nu: "The number of 구문의 핵심 주어(The number) 단수 수일치" },
  { lvl: 2, cat: 'subject_verb_agreement', form: 3, s: "Neither the manager nor the team employees ______ about the sudden policy change.", a: "were informed", opts: ["were informed", "was informed", "informs", "informing"], t: "팀장도 팀 직원들도 갑작스러운 정책 변경에 대해 통보받지 못했다.", f: ["'Neither A nor B' 구문의 동사는 B(the team employees: 복수)에 일치시키고 수동태이므로 were informed가 정답입니다.", "B가 복수명사이므로 was는 수일치 위반입니다.", "직원들이 통보받는 대상(수동)이므로 능동형은 어색합니다.", "단독 -ing는 동사 불가입니다."], cp: "Neither A nor B(복수) + were informed", nu: "상관접속사 Neither A nor B의 근자일치(B에 수일치) 원칙" },
  { lvl: 2, cat: 'subject_verb_agreement', form: 2, s: "The quality of these manufactured components ______ proven to be outstanding.", a: "has been", opts: ["has been", "have been", "are", "having been"], t: "이 제조된 부품들의 품질은 매우 뛰어난 것으로 입증되었다.", f: ["핵심 주어가 단수명사(The quality)이므로 전치사구 수식어를 제외하고 단수 has been이 정답입니다.", "components에 낚이지 말고 핵심 주어 The quality(단수)에 맞춰야 하므로 have는 불가합니다.", "현재완료 수동태 자리에 are proven은 시제 어색합니다.", "단독 -ing는 본동사 불가입니다."], cp: "The quality(단수) + of components + has been", nu: "복수 수식어 거품 속에서 진주어의 단수성을 파악하는 수일치" },

  // 2. tense_voice
  { lvl: 2, cat: 'tense_voice', form: 3, s: "The innovative software ______ by our development team since last December.", a: "has been updated", opts: ["has been updated", "is updating", "updated", "will update"], t: "그 혁신적인 소프트웨어는 지난 12월 이래로 우리 개발팀에 의해 업데이트되어 왔다.", f: ["'since + 과거시점' 단서와 수동 관계(소프트웨어는 업데이트됨)이므로 현재완료 수동태 has been updated가 정답입니다.", "소프트웨어가 능동으로 업데이트하는 진행형은 비문입니다.", "since와 단순 과거형은 어울리지 않습니다.", "since와 미래시제는 모순입니다."], cp: "현재완료 수동태(has been updated) + since 과거시점", nu: "과거부터 현재까지 지속된 수동의 행위를 나타내는 현재완료 수동태" },
  { lvl: 2, cat: 'tense_voice', form: 3, s: "All confidential financial records ______ in a fireproof safe before the audit began.", a: "had been stored", opts: ["had been stored", "have stored", "store", "will be stored"], t: "모든 기밀 금융 기록은 감사가 시작되기 전에 내화 금고에 보관되어 있었다.", f: ["감사가 시작된 과거(began)보다 더 이전에 보관된 수동 관계이므로 과거완료 수동태 had been stored가 정답입니다.", "현재완료는 과거 기준 시점 이전의 대과거를 나타낼 수 없습니다.", "기록이 스스로 보관하는 능동형은 불가합니다.", "과거 이전 사건에 미래시제는 불가합니다."], cp: "과거완료 수동태(had been stored) + before 과거동사", nu: "과거 특정 시점 이전의 완료된 수동 행위를 나타내는 대과거 수동태" },
  { lvl: 2, cat: 'tense_voice', form: 3, s: "The new marketing strategy ______ by the board of directors next Monday.", a: "will be reviewed", opts: ["will be reviewed", "reviews", "has reviewed", "reviewed"], t: "새로운 마케팅 전략은 다음 주 월요일에 이사회에 의해 검토될 것이다.", f: ["next Monday 미래 시점과 수동 관계(전략은 검토됨)이므로 미래 수동태 will be reviewed가 정답입니다.", "전략이 검토하는 능동형은 비문입니다.", "미래 시점 부사와 현재완료는 모순입니다.", "미래 시점에 과거형은 불가합니다."], cp: "사물 주어 + will be reviewed + next Monday", nu: "미래 시점 단서와 사물 수동태의 결합" },
  { lvl: 2, cat: 'tense_voice', form: 4, s: "The outstanding employee ______ an unexpected bonus by the CEO yesterday.", a: "was awarded", opts: ["was awarded", "awarded", "is awarding", "awards"], t: "그 우수 직원은 어제 대표이사로부터 뜻밖의 보너스를 받았다(수여받았다).", f: ["4형식 수여동사 award의 수동태 구문으로 직원이 보너스를 받은 것이므로 was awarded가 정답입니다.", "능동 awarded를 쓰면 직원이 누구에게 보너스를 주었는지 목적어가 부족합니다.", "과거 yesterday와 현재진행은 모순입니다.", "현재시제는 어제 단서와 모순입니다."], cp: "S + was awarded + DO(bonus) + by 행위자", nu: "4형식 수여동사의 직접목적어가 남는 수동태 구문" },

  // 3. verbals
  { lvl: 2, cat: 'verbals', form: 5, s: "The strict safety manager made all factory workers ______ protective helmets.", a: "wear", opts: ["wear", "to wear", "wearing", "wore"], t: "엄격한 안전 관리자는 모든 공장 노동자들에게 보호 헬멧을 착용하도록 했다.", f: ["사역동사 make는 목적어와 목적격 보어가 능동 관계일 때 동사원형을 취하므로 wear가 정답입니다.", "사역동사 make는 to부정사를 보어로 취하지 않습니다.", "일반적으로 사역동사 make 뒤에 -ing는 오지 않습니다.", "과거형 동사는 목적격 보어가 될 수 없습니다."], cp: "사역동사(make) + O(workers) + 동사원형(wear)", nu: "사역동사 make의 목적격 보어로 원형부정사를 취하는 핵심 5형식 문형" },
  { lvl: 2, cat: 'verbals', form: 5, s: "We saw the talented artist ______ a beautiful mural on the wall yesterday.", a: "painting", opts: ["painting", "to paint", "painted", "paints"], t: "우리는 어제 재능 있는 예술가가 벽에 아름다운 벽화를 그리고 있는 것을 보았다.", f: ["지각동사 see는 목적어가 동작을 진행 중일 때 목적격 보어로 현재분사(-ing)를 취하므로 painting이 정답입니다.", "지각동사는 목적격 보어로 to부정사를 절대 취하지 않습니다.", "화가가 능동적으로 그리는 중이므로 과거분사는 부적절합니다.", "3인칭 단수 동사는 보어 불가입니다."], cp: "지각동사(see) + O + -ing (동작 진행 강조)", nu: "지각동사의 목적격 보어로 생생한 진행을 강조하는 현재분사" },
  { lvl: 2, cat: 'verbals', form: 5, s: "The company policy allows employees ______ remotely two days a week.", a: "to work", opts: ["to work", "working", "work", "worked"], t: "회사 규정은 직원들이 일주일에 이틀씩 원격 근무를 하도록 허용한다.", f: ["allow는 5형식 구문에서 목적격 보어로 to부정사를 취하므로 to work가 정답입니다.", "allow는 목적격 보어로 동명사를 취하지 않습니다.", "사역동사가 아니므로 동사원형은 불가합니다.", "과거분사는 능동 관계에 부적절합니다."], cp: "allow + O(employees) + to-V (5형식 보어)", nu: "미래/허가의 의미를 담아 목적격 보어로 to부정사를 취하는 5형식 동사" },
  { lvl: 2, cat: 'verbals', form: 1, s: "______ around the city center all afternoon, we were completely exhausted.", a: "Walking", opts: ["Walking", "Walked", "Having walked to", "To walk"], t: "오후 내내 도심 주변을 걸어 다녔기 때문에, 우리는 완전히 녹초가 되었다.", f: ["주절의 주어(we)가 직접 걷는 능동 관계이므로 현재분사로 시작하는 분사구문 Walking이 정답입니다.", "우리가 걸어진 수동 관계가 아니므로 과거분사 Walked는 비문입니다.", "불필요한 전치사 결합입니다.", "to부정사는 부사절 분사구문으로 어색합니다."], cp: "능동 분사구문(Walking ...) + 주절", nu: "이유/시간을 나타내는 능동 현재분사 분사구문의 자연스러운 전환" },

  // 4. clauses_relatives
  { lvl: 2, cat: 'clauses_relatives', form: 3, s: "The senior engineer showed us the complex machine ______ he had designed.", a: "which", opts: ["which", "who", "whose", "where"], t: "수석 엔지니어는 자신이 설계했던 복잡한 기계를 우리에게 보여주었다.", f: ["선행사가 사물(machine)이고 had designed의 목적어가 빠진 목적격 관계대명사이므로 which가 정답입니다.", "사물 선행사에 who는 쓸 수 없습니다.", "소유격 whose 뒤에는 명사가 이어져야 합니다.", "where 뒤에는 완전한 절이 와야 합니다."], cp: "사물 선행사(machine) + 목적격 관계대명사(which)", nu: "타동사의 목적어가 생략된 관계사절을 이끄는 목적격 관계대명사" },
  { lvl: 2, cat: 'clauses_relatives', form: 3, s: "The scientist ______ groundbreaking research was published received an award.", a: "whose", opts: ["whose", "who", "which", "whom"], t: "자신의 획기적인 연구가 출판된 그 과학자는 상을 받았다.", f: ["선행사(The scientist)와 뒤의 명사(groundbreaking research) 사이의 소유 관계를 나타내므로 whose가 정답입니다.", "who 뒤에는 주어가 비어야 하는데 명사구가 바로 이어집니다.", "사람 선행사에 which는 불가합니다.", "목적격 whom은 뒤에 명사구가 이어지는 소유격 자리에 불가합니다."], cp: "사람 선행사 + whose + 명사(research) + V", nu: "선행사와 수식받는 명사의 소유 관계를 연결하는 소유격 관계대명사" },
  { lvl: 2, cat: 'clauses_relatives', form: 1, s: "The cozy cafe ______ we discussed our project yesterday has closed down.", a: "in which", opts: ["in which", "which", "whom", "what"], t: "우리가 어제 프로젝트를 논의했던 아늑한 카페가 문을 닫았다.", f: ["선행사가 장소(cafe)이고 뒤 문장이 완전하므로 [전치사 + 관계대명사]인 in which가 정답입니다.", "which 뒤에는 불완전한 절이 와야 합니다.", "사물 선행사에 whom은 불가합니다.", "선행사가 있으므로 what은 불가합니다."], cp: "장소 선행사(cafe) + in which(=where) + 완전한 절", nu: "완전한 절을 이끌며 관계부사 where의 역할을 대신하는 [전치사 + 관계대명사]" },
  { lvl: 2, cat: 'clauses_relatives', form: 3, s: "______ he explained during the conference surprised all the attendees.", a: "What", opts: ["What", "That", "Which", "Where"], t: "그가 학회 중에 설명했던 것은 모든 참석자들을 놀라게 했다.", f: ["explained의 목적어가 비어 있는 불완전한 절을 이끌며 전체 문장의 주어 역할을 하는 관계대명사 What이 정답입니다.", "접속사 That 뒤에는 완전한 절이 와야 합니다.", "선행사가 없는 문두에 which는 불가합니다.", "Where는 부사절로 목적어가 빠진 절에 부적절합니다."], cp: "What + S + V(불완전절) + 본동사(surprised)", nu: "선행사를 포함하여 '~하는 것'의 의미로 주어절을 이끄는 명사절 what" },

  // 5. connectors
  { lvl: 2, cat: 'connectors', form: 1, s: "______ the severe winter blizzard, the flight took off without significant delay.", a: "Despite", opts: ["Despite", "Although", "Even though", "Whereas"], t: "극심한 겨울 눈보라에도 불구하고, 비행기는 큰 지연 없이 이륙했다.", f: ["뒤에 명사구(the severe winter blizzard)가 이어지며 양보를 나타내므로 전치사 Despite가 정답입니다.", "Although는 접속사로 뒤에 주어+동사가 와야 합니다.", "Even though는 접속사입니다.", "Whereas는 대조를 나타내는 접속사입니다."], cp: "양보 전치사(Despite) + 명사구, 주절", nu: "접속사(Although) vs 전치사(Despite)의 구조적 판별" },
  { lvl: 2, cat: 'connectors', form: 1, s: "The outdoor festival was postponed ______ unexpected torrential rain yesterday.", a: "because of", opts: ["because of", "because", "although", "while"], t: "야외 축제는 어제 예상치 못한 폭우 때문에 연기되었다.", f: ["뒤에 명사구(unexpected torrential rain)가 이어지며 원인을 나타내므로 전치사구 because of가 정답입니다.", "because는 접속사이므로 명사구 앞에는 불가합니다.", "although는 접속사이자 양보 의미입니다.", "while은 접속사입니다."], cp: "주절 + 전치사구(because of) + 명사구", nu: "명사구 앞에서 원인을 나타내는 전치사구 because of" },
  { lvl: 2, cat: 'connectors', form: 3, s: "You can borrow this reference book ______ you return it by Friday afternoon.", a: "provided that", opts: ["provided that", "in case of", "because of", "despite"], t: "금요일 오후까지 반납한다는 조건 하에 너는 이 참고서를 빌릴 수 있다.", f: ["뒤에 [주어 + 동사] 절이 오며 '~라는 조건으로'를 나타내는 접속사 provided that이 정답입니다.", "in case of는 전치사로 절 앞에는 불가합니다.", "because of는 전치사입니다.", "despite는 전치사입니다."], cp: "주절 + 조건 접속사(provided that) + S + V", nu: "if를 대체하는 고급 조건 부사절 접속사 provided that" },
  { lvl: 2, cat: 'connectors', form: 1, s: "______ the emergency drill, all employees evacuated to the designated safe zone.", a: "During", opts: ["During", "While", "Although", "Unless"], t: "비상 훈련 동안, 모든 직원들은 지정된 안전 구역으로 대피했다.", f: ["특정 사건/행사를 나타내는 기간 명사(the emergency drill) 앞이므로 전치사 During이 정답입니다.", "While은 접속사로 명사 앞에는 불가합니다.", "양보 접속사는 문맥에 맞지 않습니다.", "조건 접속사는 부적절합니다."], cp: "전치사(During) + 특정 기간 명사", nu: "특정 기간 명사와 호응하는 전치사 During vs 접속사 While" },

  // 6. parts_of_speech
  { lvl: 2, cat: 'parts_of_speech', form: 2, s: "The professor gave us very ______ instructions on how to submit the essay.", a: "specific", opts: ["specific", "specifically", "specify", "specification"], t: "교수님은 우리에게 에세이를 제출하는 방법에 대한 매우 구체적인 지침을 주셨다.", f: ["명사 instructions를 앞에서 수식하는 형용사 자리이므로 specific이 정답입니다.", "부사는 명사를 직접 수식할 수 없습니다.", "동사는 명사 수식 자리에 올 수 없습니다.", "명사 연속은 문맥상 어색합니다."], cp: "very + 형용사(specific) + 명사(instructions)", nu: "명사를 한정 수식하는 형용사의 본래 역할과 위치" },
  { lvl: 2, cat: 'parts_of_speech', form: 3, s: "The manager handled the difficult customer complaint with great ______.", a: "patience", opts: ["patience", "patient", "patiently", "impatient"], t: "팀장은 그 까다로운 고객의 불만을 대단한 인내심을 가지고 처리했다.", f: ["전치사 with와 형용사 great 뒤에 명사 자리이므로 추상명사 patience가 정답입니다.", "형용사 patient는 전치사+형용사 뒤에 불가합니다.", "부사는 전치사의 목적어가 될 수 없습니다.", "형용사는 전치사 뒤 명사 자리에 불가합니다."], cp: "with + great + 명사(patience)", nu: "전치사의 목적어 역할을 수행하는 추상명사 자리" },
  { lvl: 2, cat: 'parts_of_speech', form: 3, s: "The new software update has ______ improved our team's daily productivity.", a: "significantly", opts: ["significantly", "significant", "significance", "signify"], t: "새로운 소프트웨어 업데이트는 우리 팀의 일일 생산성을 현저하게 향상시켰다.", f: ["조동사 has와 본동사 improved 사이에 동사를 수식하는 부사 자리이므로 significantly가 정답입니다.", "형용사는 동사를 수식할 수 없습니다.", "명사는 조동사-본동사 사이에 불가합니다.", "동사는 본동사 자리에 중복 불가합니다."], cp: "has + 부사(significantly) + p.p.(improved)", nu: "조동사와 본동사 사이에 위치하여 동사를 수식하는 부사 위치" },
  { lvl: 2, cat: 'parts_of_speech', form: 2, s: "The explanation provided in the manual sounded quite ______ to the beginners.", a: "confusing", opts: ["confusing", "confused", "confuse", "confusedly"], t: "설명서에 제공된 해설은 초보자들에게 꽤 혼란스럽게 들렸다.", f: ["해설(The explanation)이 혼란을 유발하는 능동적 주체이므로 현재분사 형용사 confusing이 정답입니다.", "사람이 혼란을 느낄 때 쓰는 confused는 사물 주어에 부적절합니다.", "동사원형은 sound 뒤 보어 불가입니다.", "감각동사 뒤에 부사는 보어로 올 수 없습니다."], cp: "sound + 형용사 보어(confusing)", nu: "사물 주어가 감정을 유발할 때 사용하는 현재분사 형용사" },

  // 7. modals_subjunctive
  { lvl: 2, cat: 'modals_subjunctive', form: 3, s: "If I ______ you, I would consult a professional financial advisor immediately.", a: "were", opts: ["were", "was", "am", "have been"], t: "내가 너라면, 나는 즉시 전문 금융 상담사에게 자문을 구할 텐데.", f: ["현재 사실과 반대되는 가정을 나타내는 가정법 과거의 be동사는 were가 정답입니다.", "가정법 과거 공식에서 be동사는 were를 원칙으로 합니다.", "현재시제 am은 가정법 과거에 불가합니다.", "현재완료는 가정법 과거에 불가합니다."], cp: "If I were you, I would + 동사원형", nu: "상대방의 입장을 가정하여 조언할 때 쓰는 표준 가정법 과거 공식" },
  { lvl: 2, cat: 'modals_subjunctive', form: 3, s: "The senior director insisted that the emergency protocol ______ immediately.", a: "be implemented", opts: ["be implemented", "is implemented", "was implemented", "implemented"], t: "상임 이사는 비상 프로토콜이 즉시 시행되어야 한다고 강력히 주장했다.", f: ["주장/요구 동사 insist 뒤 that절에는 당위성을 나타내어 (should) + 동사원형 be implemented가 정답입니다.", "직설법 is는 당위성 that절에 불가합니다.", "주절이 과거라 해도 당위성 원형 규칙이 우선합니다.", "수동태가 아니면 프로토콜이 무엇을 시행하는지 목적어가 없어 비문입니다."], cp: "insist that S + (should) + 동사원형 be p.p.", nu: "주장/제안/요구/명령 동사 뒤 that절의 동사원형(가정법 현재) 필수 규칙" },
  { lvl: 2, cat: 'modals_subjunctive', form: 3, s: "If he had checked the weather forecast, he ______ his umbrella with him.", a: "would have taken", opts: ["would have taken", "will take", "takes", "took"], t: "만약 그가 일기예보를 확인했었더라면, 그는 우산을 챙겨갔을 텐데.", f: ["조건절이 had checked(가정법 과거완료)이므로 주절에는 [would have p.p.]인 would have taken이 정답입니다.", "단순 미래는 과거완료 조건절과 결합할 수 없습니다.", "현재시제는 어울리지 않습니다.", "단순 과거형은 과거완료 조건절과 호응하지 않습니다."], cp: "If S + had p.p., S + would have p.p.", nu: "과거 사실의 반대를 가정하여 후회를 표현하는 표준 가정법 과거완료" },
  { lvl: 2, cat: 'modals_subjunctive', form: 3, s: "The committee suggested that each applicant ______ a portfolio of previous works.", a: "submit", opts: ["submit", "submits", "submitted", "to submit"], t: "위원회는 각 지원자가 이전 작업물의 포트폴리오를 제출해야 한다고 제안했다.", f: ["제안 동사 suggest 뒤의 that절이므로 (should) 생략에 따른 동사원형 submit이 정답입니다.", "each applicant가 3인칭 단수라도 당위성 동사원형 규칙이 우선하므로 submits는 오류입니다.", "과거동사는 당위성 절에 불가합니다.", "to부정사는 that절 본동사 불가입니다."], cp: "suggest that S + (should) + 동사원형(submit)", nu: "제안 동사 뒤 that절에서 주어의 수와 무관하게 동사원형을 쓰는 문법 규칙" },

  // 8. special_structures
  { lvl: 2, cat: 'special_structures', form: 1, s: "Never in my life ______ such an extraordinary natural phenomenon.", a: "have I seen", opts: ["have I seen", "I have seen", "I saw", "did I saw"], t: "내 평생 동안 이토록 놀라운 자연현상을 본 적은 결코 없다.", f: ["부정어 Never가 문두에 강조되어 [조동사/have + 주어 + 본동사] 순으로 도치되므로 have I seen이 정답입니다.", "평서문 어순은 부정어 문두 도치 규칙을 위반한 것입니다.", "도치가 생략된 비문입니다.", "조동사 did 뒤에 과거형 saw는 문법 오류입니다."], cp: "부정어(Never) + have + 주어(I) + p.p.(seen)", nu: "부정어 강조에 따른 주어-동사 도치 어순의 기본 원칙" },
  { lvl: 2, cat: 'special_structures', form: 1, s: "Seldom ______ the strict supervisor allow employees to leave the office early.", a: "does", opts: ["does", "is", "do", "has"], t: "그 엄격한 감독관은 직원들이 일찍 퇴근하도록 허용하는 일이 좀처럼 없다.", f: ["준부정어 Seldom이 문두에 오고 일반동사 allow를 도치시키며 단수 주어(the supervisor)이므로 조동사 does가 정답입니다.", "일반동사 원형 allow 앞에 be동사 is는 불가합니다.", "단수 주어에 do는 수일치 위반입니다.", "has는 뒤에 p.p.가 와야 하므로 원형 allow 앞에 불가합니다."], cp: "부정어(Seldom) + does + 단수주어 + 동사원형(allow)", nu: "준부정어 문두 위치에 따른 일반동사의 do/does/did 도치 구문" },
  { lvl: 2, cat: 'special_structures', form: 2, s: "The air pollution in this industrial city is much worse than ______ of the rural town.", a: "that", opts: ["that", "those", "this", "it"], t: "이 산업 도시의 대기 오염은 시골 마을의 대기 오염보다 훨씬 더 심각하다.", f: ["비교 대상인 불가산 단수명사(The air pollution)를 대신 가리키므로 대명사 that이 정답입니다.", "those는 복수명사를 대신할 때 씁니다.", "후치 수식어(of...)를 동반하는 비교 대명사는 this를 쓰지 않습니다.", "it은 한정 수식어구(of...)의 수식을 받지 못합니다."], cp: "단수 비교 대상(The pollution) ➔ that of ...", nu: "비교 구문에서 명사의 중복을 피하기 위해 사용하는 대명사 that of vs those of" },
  { lvl: 2, cat: 'special_structures', form: 1, s: "Only after completing the security training ______ granted access to the server room.", a: "were the engineers", opts: ["were the engineers", "the engineers were", "the engineers had", "did the engineers"], t: "보안 교육을 완료한 후에야 비로소 엔지니어들은 서버실 출입을 허가받았다.", f: ["'Only + 부사구'가 문두에 올 때 주절이 도치되며 수동태(be granted)이므로 were the engineers가 정답입니다.", "평서문 어순은 Only 부사구 도치 규칙 위반입니다.", "수동태가 아니므로 어색합니다.", "did 뒤에는 동사원형이 와야 하므로 과거분사 granted 앞에 불가합니다."], cp: "Only + 부사구 + were + 주어 + p.p.(granted)", nu: "Only 한정 부사구가 문두에 올 때 발생하는 주어-조동사 도치" },

  // 9. verb_patterns
  { lvl: 2, cat: 'verb_patterns', form: 3, s: "The international committee strongly ______ to the proposed ocean dumping plan.", a: "objected", opts: ["objected", "objected with", "opposed to", "disapproved about"], t: "국제 위원회는 제안된 해양 투기 계획에 강력하게 반대했다.", f: ["object는 자동사로 전치사 to와 결합하여 object to(~에 반대하다)를 이루므로 objected가 정답입니다.", "object with는 잘못된 전치사 호응입니다.", "oppose는 완전타동사로 to를 붙이면 안 됩니다.", "disapprove는 of와 결합합니다."], cp: "자동사(object) + to + 목적어", nu: "전치사 to가 필수적인 자동사 object to vs 타동사 oppose" },
  { lvl: 2, cat: 'verb_patterns', form: 3, s: "Renewable energy sources now ______ over twenty percent of the nation's total electricity.", a: "account for", opts: ["account for", "account of", "account to", "account in"], t: "재생에너지원은 이제 국가 전체 전력의 20퍼센트 이상을 차지한다.", f: ["비율/수치를 '차지하다' 또는 원인을 '설명하다'를 뜻하는 동사구는 account for이므로 for가 정답입니다.", "account of는 잘못된 숙어입니다.", "account to는 잘못된 전치사 호응입니다.", "account in은 비문입니다."], cp: "account for + 비율/수치 ('~을 차지하다')", nu: "도표 및 수능/토익 비즈니스 빈출 필수 동사구 account for" },
  { lvl: 2, cat: 'verb_patterns', form: 3, s: "Please ______ from taking photographs inside the art gallery during the exhibition.", a: "refrain", opts: ["refrain", "refrain to", "prevent", "avoid from"], t: "전시 기간 동안 미술관 내부에서 사진을 촬영하는 것을 삼가해 주십시오.", f: ["'~을 삼가다/자제하다'는 자동사 refrain과 전치사 from이 결합하므로 refrain이 정답입니다.", "refrain은 to와 호응하지 않습니다.", "prevent는 prevent A from -ing 형태로 쓰입니다.", "avoid는 타동사로 from을 붙이지 않고 바로 동명사를 목적어로 취합니다."], cp: "refrain from + -ing ('~을 삼가다')", nu: "행위 자제를 나타내는 자동사 전치사 콜로케이션 refrain from" },
  { lvl: 2, cat: 'verb_patterns', form: 3, s: "The city council plans to ______ of hazardous industrial waste safely outside the urban area.", a: "dispose", opts: ["dispose", "dispose for", "discard of", "eliminate of"], t: "시의회는 도시 지역 외부에서 유해 산업 폐기물을 안전하게 처리할 계획이다.", f: ["'~을 처리하다/폐기하다'는 자동사 dispose와 전치사 of가 결합하여 dispose of를 이루므로 dispose가 정답입니다.", "dispose for는 비문입니다.", "discard는 타동사이므로 of를 붙이지 않습니다.", "eliminate는 타동사이므로 of를 붙이지 않습니다."], cp: "dispose of + 목적어 ('~을 처리하다')", nu: "자동사 + 전치사 결합 필수 표현 dispose of" },

  // 10. parallel_agreement
  { lvl: 2, cat: 'parallel_agreement', form: 3, s: "The revised software is not only faster than the old version but also ______ to operate.", a: "easier", opts: ["easier", "easily", "more ease", "ease"], t: "개정된 소프트웨어는 구버전보다 더 빠를 뿐만 아니라 조작하기에도 더 쉽다.", f: ["not only A but also B에서 A(faster: 비교급 형용사)와 B는 형태가 일치해야 하므로 easier가 정답입니다.", "부사는 faster(형용사)와 병렬을 이룰 수 없습니다.", "more ease는 잘못된 형태입니다.", "명사는 형용사와 병렬 불가입니다."], cp: "not only [비교급 형용사] but also [비교급 형용사]", nu: "상관접속사 내 형용사 비교급 간의 완벽한 문법적 병치" },
  { lvl: 2, cat: 'parallel_agreement', form: 3, s: "The workshop focuses on improving communication skills and ______ effective teamwork.", a: "building", opts: ["building", "build", "to build", "built"], t: "그 워크숍은 의사소통 능력을 향상시키고 효과적인 팀워크를 구축하는 데 중점을 둔다.", f: ["전치사 on의 목적어로 동명사 improving과 and로 연결되므로 동명사 building이 정답입니다.", "원형 build는 improving과 병렬을 이루지 못합니다.", "to부정사는 전치사 뒤 동명사와 병렬 불가입니다.", "과거분사는 능동 목적어를 취하는 동명사와 병렬 불가입니다."], cp: "focus on A(-ing) and B(-ing)", nu: "전치사의 목적어로 이어지는 동명사 간의 병렬 일치" },
  { lvl: 2, cat: 'parallel_agreement', form: 1, s: "Neither the team leader nor the senior executives ______ willing to accept the compromise.", a: "were", opts: ["were", "was", "is", "being"], t: "팀장도 고위 임원들도 그 타협안을 수락할 의사가 없었다.", f: ["'Neither A nor B' 구문의 수는 B(the senior executives: 복수)에 일치시키므로 were가 정답입니다.", "B가 복수이므로 단수 was는 수일치 위반입니다.", "과거 상태이므로 is는 시제 위반입니다.", "단독 -ing는 본동사 불가입니다."], cp: "Neither A nor B(복수 주어) + were", nu: "Neither A nor B 구문에서 B의 수에 동사를 맞추는 수일치 원칙" },
  { lvl: 2, cat: 'parallel_agreement', form: 3, s: "You must choose either to accept the promotion ______ to look for another career path.", a: "or", opts: ["or", "and", "nor", "but also"], t: "너는 승진을 수락하거나 다른 진로를 찾는 것 중 하나를 선택해야 한다.", f: ["상관접속사 either는 or와 짝을 이루며 to부정사 구문끼리 대등하게 연결하므로 or가 정답입니다.", "and는 either와 호응하지 않습니다.", "nor는 neither와 호응합니다.", "but also는 not only와 짝을 이룹니다."], cp: "either to-V or to-V (상관접속사 병치)", nu: "양자택일 구문 either A or B에서 준동사 간의 대등한 형태 일치" }
];

async function main() {
  console.log('🔑 Authenticating anonymously with Firebase Auth...');
  await signInAnonymously(auth);
  console.log('✅ Authenticated successfully!');

  console.log('🧹 Purging all old questions from Firestore...');
  const oldSnap = await getDocs(collection(db, 'questions'));
  const docsToDelete = oldSnap.docs;
  while (docsToDelete.length > 0) {
    const chunk = docsToDelete.splice(0, 400);
    const batch = writeBatch(db);
    chunk.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`Deleted ${chunk.length} old questions...`);
  }
  console.log('✅ Old questions deleted.');

  // Clear cycle challenges cache
  const cycleSnap = await getDocs(collection(db, 'cycle_challenges'));
  if (!cycleSnap.empty) {
    const batch = writeBatch(db);
    cycleSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`Deleted ${cycleSnap.size} cycle challenge caches.`);
  }

  console.log('🚀 Seeding verified Master Bank into Firestore...');
  const batch = writeBatch(db);
  const qCol = collection(db, 'questions');

  let count = 0;
  for (const item of RAW_BANK) {
    const catMeta = CATEGORIES[item.cat] || CATEGORIES.subject_verb_agreement;
    const ref = doc(qCol);
    const options = item.opts.map((optText, idx) => ({
      text: optText,
      is_correct: idx === 0,
      feedback: item.f[idx] || (idx === 0 ? '정답입니다!' : '오답입니다.')
    }));

    batch.set(ref, {
      difficulty: `Level ${item.lvl}`,
      level: `Level ${item.lvl}`,
      form: item.form,
      grammarCategory: catMeta.id,
      grammarTag: catMeta.badgeKo,
      sentence: item.s,
      options: options.sort(() => Math.random() - 0.5),
      answer: item.a,
      translation: item.t,
      explanation: {
        chunk_pattern: item.cp,
        nuance: item.nu
      },
      createdAt: serverTimestamp()
    });
    count++;
  }

  await batch.commit();
  console.log(`🎉 Successfully seeded ${count} pristine, verified questions!`);

  const verifySnap = await getDocs(collection(db, 'questions'));
  console.log(`📊 Firestore questions count: ${verifySnap.size}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
