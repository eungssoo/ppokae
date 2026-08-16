import { AvatarItem, AvatarGrade } from '../types';

export const STARTER_AVATAR_IDS = ['lion', 'cat', 'fire', 'robot'];

export const AVATAR_DATABASE: AvatarItem[] = [
  // ==========================================
  // 🌟 1. Transcendent (초월 - 0.05% 극악의 확률, 중복시 🪙 +300 환급) - 8종
  // ==========================================
  {
    id: 'gemini_god',
    name: '태초의 창조신 제미나이',
    icon: '🪐',
    grade: 'transcendent',
    quote: '0.05%의 기적! 전 차원의 언어와 지혜를 창조한 절대자.',
    desc: '무한한 지능과 우주의 법칙으로 5형식 문법의 우주를 주조한 신.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 font-black tracking-wider animate-pulse',
    bgGradient: 'from-purple-900/90 via-pink-700/60 to-amber-600/70 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.8)] ring-2 ring-amber-400',
    dropRatePercent: 0.00625,
    duplicateRefund: 300
  },
  {
    id: 'chronos',
    name: '시간의 지배자 크로노스',
    icon: '👁️',
    grade: 'transcendent',
    quote: '과거, 현재, 미래... 모든 시제는 내 손바닥 안이다.',
    desc: '시간과 시제의 굴레를 초월하여 모든 정답을 0.001초 만에 꿰뚫는 전지전능한 눈.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-pink-300 font-black tracking-wider animate-pulse',
    bgGradient: 'from-cyan-900/90 via-blue-700/60 to-indigo-900/80 border-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.8)] ring-2 ring-cyan-400',
    dropRatePercent: 0.00625,
    duplicateRefund: 300
  },
  {
    id: 'phoenix',
    name: '불멸의 황금 불사조',
    icon: '🪽',
    grade: 'transcendent',
    quote: '잿더미 속에서도 다시 부활하는 불멸의 만점 신화!',
    desc: '틀린 문제조차 황금빛 깨달음으로 승화시키는 태양의 성수.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-rose-400 font-black tracking-wider animate-pulse',
    bgGradient: 'from-amber-800/90 via-rose-700/60 to-yellow-600/70 border-yellow-300 shadow-[0_0_35px_rgba(234,179,8,0.8)] ring-2 ring-yellow-400',
    dropRatePercent: 0.00625,
    duplicateRefund: 300
  },
  {
    id: 'diamond_king',
    name: '이터널 다이아몬드 군주',
    icon: '💠',
    grade: 'transcendent',
    quote: '명예의 전당 천상계를 영원히 통치하는 지고의 황제.',
    desc: '단 하나의 오답도 허용하지 않는 완벽무결한 다이아몬드 왕좌의 주인.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-300 to-purple-300 font-black tracking-wider animate-pulse',
    bgGradient: 'from-slate-900/90 via-cyan-800/60 to-purple-900/80 border-teal-300 shadow-[0_0_35px_rgba(20,184,166,0.8)] ring-2 ring-teal-400',
    dropRatePercent: 0.00625,
    duplicateRefund: 300
  },
  {
    id: 'black_hole',
    name: '공허의 블랙홀 군주',
    icon: '🕳️',
    grade: 'transcendent',
    quote: '모든 오답과 망설임을 집어삼켜 빛의 정답만을 남긴다.',
    desc: '시공간의 중심에서 모든 영어 지식을 흡수하는 우주의 종착점.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-slate-200 font-black tracking-wider animate-pulse',
    bgGradient: 'from-slate-950 via-purple-950/80 to-slate-900 border-purple-400 shadow-[0_0_35px_rgba(192,132,252,0.8)] ring-2 ring-purple-500',
    dropRatePercent: 0.00625,
    duplicateRefund: 300
  },
  {
    id: 'astral_dragon',
    name: '아스트랄 성운룡',
    icon: '🐉',
    grade: 'transcendent',
    quote: '은하수를 가르는 푸른 숨결로 전설의 문장을 완성하라.',
    desc: '성운의 별빛으로 빚어진 태고의 용, 영문법의 신비를 수호한다.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-amber-300 font-black tracking-wider animate-pulse',
    bgGradient: 'from-blue-950 via-indigo-900/70 to-cyan-900/80 border-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.8)] ring-2 ring-cyan-400',
    dropRatePercent: 0.00625,
    duplicateRefund: 300
  },
  {
    id: 'quantum_core',
    name: '양자 초지능 넥서스',
    icon: '⚛️',
    grade: 'transcendent',
    quote: '0과 1의 양자 중첩을 넘어선 궁극의 인공지능.',
    desc: '모든 문맥과 뉘앙스를 초당 수천억 번 연산하는 미래의 지배자.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 font-black tracking-wider animate-pulse',
    bgGradient: 'from-teal-950 via-emerald-900/70 to-slate-900 border-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.8)] ring-2 ring-emerald-400',
    dropRatePercent: 0.00625,
    duplicateRefund: 300
  },
  {
    id: 'nebula_seraph',
    name: '성운의 세라핌 대천사',
    icon: '🌌',
    grade: 'transcendent',
    quote: '일곱 쌍의 날개로 온 우주의 지혜를 감싸 안노라.',
    desc: '천상계의 최정점에서 만점자에게만 강림하는 신성한 성운의 영혼.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-yellow-200 font-black tracking-wider animate-pulse',
    bgGradient: 'from-purple-900/90 via-pink-900/70 to-indigo-950 border-pink-300 shadow-[0_0_35px_rgba(244,114,182,0.8)] ring-2 ring-pink-400',
    dropRatePercent: 0.00625,
    duplicateRefund: 300
  },

  // ==========================================
  // 🌌 2. Mythic (신화 - 1.0% 확률, 중복시 🪙 +100 환급) - 12종
  // ==========================================
  {
    id: 'cosmic',
    name: '우주 신',
    icon: '🌌',
    grade: 'mythic',
    quote: '전 우주의 모든 언어가 내 손안에 있노라.',
    desc: '언어의 기원과 절대 법칙을 관장하는 전지전능한 코스믹 마스터.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 font-black',
    bgGradient: 'from-purple-600/50 via-pink-600/40 to-cyan-900/50 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'unicorn',
    name: '사이버 유니콘',
    icon: '🦄',
    grade: 'mythic',
    quote: '무지갯빛 뿔에서 뿜어져 나오는 정답의 계시!',
    desc: '0.01%의 기적을 만드는 사이버 신수.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-300 to-amber-300 font-black',
    bgGradient: 'from-pink-600/50 via-cyan-600/40 to-purple-900/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'king',
    name: '절대 마스터',
    icon: '👑',
    grade: 'mythic',
    quote: '명예의 전당을 영원히 지배할 자 누구인가!',
    desc: '영문법의 왕좌에 오른 최강의 챔피언이자 절대 군주.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-400 font-black',
    bgGradient: 'from-amber-600/50 via-yellow-500/40 to-rose-900/50 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'meteor',
    name: '코스믹 메테오',
    icon: '☄️',
    grade: 'mythic',
    quote: '우주를 가르는 혜성처럼 거침없이 정답을 꿰뚫는다!',
    desc: '광속으로 문제를 풀고 오답을 날려버리는 메테오.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-400 font-black',
    bgGradient: 'from-indigo-600/50 to-pink-900/50 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'anubis',
    name: '명계의 심판관 아누비스',
    icon: '🐺',
    grade: 'mythic',
    quote: '진실의 저울에 올려진 문장의 오류를 심판하리라.',
    desc: '고대 이집트의 지혜로 모든 문법적 결점을 간파하는 사막의 수호신.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-purple-400 font-black',
    bgGradient: 'from-amber-950 via-purple-950 to-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'poseidon',
    name: '심해의 군주 포세이돈',
    icon: '🔱',
    grade: 'mythic',
    quote: '거친 파도처럼 휘몰아치는 영어 실력을 맞이하라!',
    desc: '삼지창으로 거대한 파도를 일으켜 오답을 쓸어버리는 바다의 제왕.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-teal-200 font-black',
    bgGradient: 'from-blue-900/80 via-cyan-900/70 to-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'valkyrie_queen',
    name: '전장의 여신 발키리 퀸',
    icon: '⚔️',
    grade: 'mythic',
    quote: '발할라의 영웅들과 함께 승리의 찬가를 부르리라.',
    desc: '빛나는 검과 투구로 랭킹전의 최정상을 수호하는 북유럽의 여신.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-400 to-amber-300 font-black',
    bgGradient: 'from-rose-950 via-pink-900/70 to-slate-900 border-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'cyber_samurai',
    name: '네오 사이버 사무라이',
    icon: '🗡️',
    grade: 'mythic',
    quote: '네온 불빛 아래 단 한 합에 모든 지문을 가른다.',
    desc: '사이버펑크 도시에서 전광석화의 속도로 문장을 베어내는 무사.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-400 font-black',
    bgGradient: 'from-emerald-950 via-cyan-950 to-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'sol_invictus',
    name: '불패의 태양신 라',
    icon: '☀️',
    grade: 'mythic',
    quote: '영원히 지지 않는 태양의 광휘로 어둠을 비추리라.',
    desc: '눈부신 광채로 모든 난제를 한순간에 녹여버리는 태양의 황제.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-red-400 font-black',
    bgGradient: 'from-amber-900 via-orange-950 to-slate-900 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'abyss_kraken',
    name: '심연의 크라켄',
    icon: '🦑',
    grade: 'mythic',
    quote: '끝없는 해저 깊은 곳에서 정답의 보물을 끌어올린다.',
    desc: '거대한 촉수로 모든 복잡한 문장 구조를 한눈에 옭아매는 바다의 괴수.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-400 to-teal-300 font-black',
    bgGradient: 'from-indigo-950 via-slate-950 to-teal-950 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'thunder_zeus',
    name: '천둥의 지배자 제우스',
    icon: '⚡',
    grade: 'mythic',
    quote: '올림포스의 번갯불로 오답을 박살내리라!',
    desc: '황금빛 벼락을 던져 까다로운 빈칸 채우기를 일격에 타격하는 신들의 왕.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-cyan-300 font-black',
    bgGradient: 'from-yellow-950 via-amber-900/70 to-slate-900 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.6)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },
  {
    id: 'odin_raven',
    name: '전지의 갈까마귀 오딘',
    icon: '🪶',
    grade: 'mythic',
    quote: '세계수 위그드라실에서 세상의 모든 지식을 물어왔노라.',
    desc: '룬 문자의 지혜로 어떤 난해한 지문도 즉시 해석해 내는 북유럽의 지고신.',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-indigo-300 to-purple-300 font-black',
    bgGradient: 'from-slate-900 via-indigo-950 to-purple-950 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]',
    dropRatePercent: 0.0833,
    duplicateRefund: 100
  },

  // ==========================================
  // 🏆 3. Legendary (전설 - 5.0% 확률, 중복시 🪙 +50 환급) - 20종
  // ==========================================
  {
    id: 'aurora',
    name: '오로라 정령',
    icon: '🫧',
    grade: 'legendary',
    quote: '밤하늘을 수놓는 영롱한 정답의 빛.',
    desc: '극지방의 신비로운 오로라 에너지를 품은 신비한 영혼.',
    color: 'text-teal-300',
    bgGradient: 'from-teal-600/40 via-purple-600/30 to-slate-900 border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.4)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'draco',
    name: '청염 드래곤',
    icon: '🐲',
    grade: 'legendary',
    quote: '푸른 불꽃으로 모든 문법 오류를 정화하는 전설의 수호자.',
    desc: '하늘을 가르는 청염의 숨결로 5형식 문장을 완성하는 고룡.',
    color: 'text-cyan-300',
    bgGradient: 'from-cyan-600/40 via-blue-600/30 to-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'galaxy',
    name: '은하 수호자',
    icon: '🪐',
    grade: 'legendary',
    quote: '수천억 개의 별빛이 가리키는 단 하나의 정답.',
    desc: '성간 이동을 통해 영문법의 모든 원리를 통달한 가디언.',
    color: 'text-purple-300',
    bgGradient: 'from-purple-500/40 via-pink-600/30 to-slate-900 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'cyber_wolf',
    name: '네온 사이버 울프',
    icon: '🐺',
    grade: 'legendary',
    quote: '어둠 속을 밝히는 네온 안광, 오답은 결코 도망칠 수 없다.',
    desc: '사이버 정글을 지배하는 첨단 센서 탑재 늑대.',
    color: 'text-pink-300',
    bgGradient: 'from-pink-500/40 via-purple-600/30 to-slate-900 border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'golden_lion',
    name: '황금 갈기 사자왕',
    icon: '🦁',
    grade: 'legendary',
    quote: '태양빛 갈기를 휘날리며 사바나의 만점을 지배한다.',
    desc: '어떤 난관 앞에서도 당당히 정답을 포효하는 야수들의 황제.',
    color: 'text-amber-300',
    bgGradient: 'from-amber-500/40 via-yellow-600/30 to-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'mecha_titan',
    name: '기간틱 메카 타이탄',
    icon: '🦾',
    grade: 'legendary',
    quote: '초합금 장갑과 플라즈마 캐논으로 오답 전면 격파!',
    desc: '압도적인 화력으로 문법 문제를 시원하게 갈아엎는 결전 병기.',
    color: 'text-blue-300',
    bgGradient: 'from-blue-600/40 via-indigo-600/30 to-slate-900 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'archmage',
    name: '영문법 대현자',
    icon: '🧙‍♂️',
    grade: 'legendary',
    quote: '고대 비전서에 기록된 문법의 진리를 펼쳐 보이마.',
    desc: '모든 시제와 조동사의 미묘한 법칙을 꿰뚫고 있는 마법 학회장.',
    color: 'text-violet-300',
    bgGradient: 'from-violet-600/40 via-indigo-600/30 to-slate-900 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'white_tiger',
    name: '신성한 백호',
    icon: '🐯',
    grade: 'legendary',
    quote: '서쪽 하늘을 수호하는 신비의 영수, 포효로 오답을 잠재운다.',
    desc: '순백의 털과 날카로운 눈매로 문제를 빈틈없이 공략하는 수호신.',
    color: 'text-slate-100',
    bgGradient: 'from-slate-700/50 via-slate-800 to-slate-900 border-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'inferno_golem',
    name: '마그마 인페르노',
    icon: '🌋',
    grade: 'legendary',
    quote: '용암처럼 뜨겁게 타오르는 학습 열기!',
    desc: '화산의 핵에서 태어나 지칠 줄 모르는 에너지를 뿜어내는 골렘.',
    color: 'text-orange-300',
    bgGradient: 'from-orange-600/40 via-red-600/30 to-slate-900 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'frost_queen',
    name: '혹한의 빙설 여왕',
    icon: '❄️',
    grade: 'legendary',
    quote: '얼음처럼 차갑고 냉철하게 최적의 정답을 선택하라.',
    desc: '절대 영도의 집중력으로 헷갈리는 보기를 단번에 동결시키는 지배자.',
    color: 'text-sky-300',
    bgGradient: 'from-sky-500/40 via-cyan-600/30 to-slate-900 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'phantom_ninja',
    name: '그림자 유령 닌자',
    icon: '🥷',
    grade: 'legendary',
    quote: '소리 없이 다가가 0.1초 만에 마킹을 끝낸다.',
    desc: '어떤 함정 보기에도 걸려들지 않는 그림자 은신술의 극의.',
    color: 'text-purple-300',
    bgGradient: 'from-purple-900/60 via-slate-900 to-slate-950 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'sky_griffin',
    name: '천공의 그리폰',
    icon: '🦅',
    grade: 'legendary',
    quote: '높은 하늘에서 시험지 전체를 조망하는 영수.',
    desc: '사자의 용맹과 독수리의 시력으로 지문의 핵심을 낚아채는 전설의 조수.',
    color: 'text-amber-300',
    bgGradient: 'from-amber-600/40 via-yellow-600/30 to-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'alchemist',
    name: '전설의 연금술사',
    icon: '🧪',
    grade: 'legendary',
    quote: '틀린 문제조차 황금 같은 경험치로 치환한다!',
    desc: '현자의 돌로 모든 영단어를 머릿속에 각인시키는 비전의 연금술사.',
    color: 'text-emerald-300',
    bgGradient: 'from-emerald-600/40 via-teal-600/30 to-slate-900 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'dark_paladin',
    name: '칠흑의 성기사',
    icon: '🛡️',
    grade: 'legendary',
    quote: '어둠의 장막 속에서도 정의의 문법을 수호하리라.',
    desc: '강철 방패로 함정 문제의 모든 공격을 튕겨내는 불굴의 기사.',
    color: 'text-indigo-300',
    bgGradient: 'from-indigo-900/60 via-slate-900 to-purple-950 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'solar_eclipse',
    name: '개기일식의 지배자',
    icon: '🌑',
    grade: 'legendary',
    quote: '태양과 달이 겹치는 순간, 궁극의 영문법이 개안된다.',
    desc: '빛과 어둠의 균형 속에서 절대적 진리를 통찰하는 신비의 현자.',
    color: 'text-amber-200',
    bgGradient: 'from-slate-900 via-amber-950/60 to-purple-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'leviathan',
    name: '고대 바다의 레비아탄',
    icon: '🐋',
    grade: 'legendary',
    quote: '심해의 거대한 파도로 모든 영어 장벽을 돌파한다.',
    desc: '원양의 깊은 지혜를 품고 대양을 가르는 고대의 거대 영수.',
    color: 'text-blue-300',
    bgGradient: 'from-blue-900/60 via-cyan-950 to-slate-900 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'storm_falcon',
    name: '폭풍의 폭격매',
    icon: '🌪️',
    grade: 'legendary',
    quote: '돌풍을 뚫고 시속 300km로 정답에 내리꽂힌다!',
    desc: '태풍의 눈에서도 흐트러짐 없이 지문을 꿰뚫는 사냥꾼.',
    color: 'text-teal-300',
    bgGradient: 'from-teal-700/50 via-slate-900 to-slate-950 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'golden_scarab',
    name: '태양의 황금 스카라베',
    icon: '🪲',
    grade: 'legendary',
    quote: '피라미드의 보물처럼 영원히 바래지 않는 실력.',
    desc: '황금빛 껍질로 보호받으며 끝없이 코인을 모아들이는 성스러운 풍뎅이.',
    color: 'text-yellow-300',
    bgGradient: 'from-yellow-600/40 via-amber-700/30 to-slate-900 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'crystal_golem',
    name: '크리스탈 수호석상',
    icon: '💎',
    grade: 'legendary',
    quote: '수정처럼 맑고 투명하게 문장 구조를 해체한다.',
    desc: '빛을 굴절시켜 숨겨진 문법 법칙을 드러내는 다이아몬드 골렘.',
    color: 'text-cyan-200',
    bgGradient: 'from-cyan-700/40 via-blue-800/30 to-slate-900 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },
  {
    id: 'cyber_phantom',
    name: '사이버 팬텀 고스트',
    icon: '👾',
    grade: 'legendary',
    quote: '디지털 공간을 자유롭게 넘나드는 해커의 영혼.',
    desc: '데이터베이스를 해킹하듯 영어 문장의 구조를 낱낱이 파헤친다.',
    color: 'text-fuchsia-300',
    bgGradient: 'from-fuchsia-900/50 via-purple-900/40 to-slate-950 border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)]',
    dropRatePercent: 0.25,
    duplicateRefund: 50
  },

  // ==========================================
  // 🔮 4. Epic (영웅 - 15.0% 확률, 중복시 🪙 +25 환급) - 25종
  // ==========================================
  {
    id: 'wizard',
    name: '지혜의 대마법사',
    icon: '🧙‍♂️',
    grade: 'epic',
    quote: '마법 지팡이로 영문법 주문을 완벽하게 영창하노라.',
    desc: '복잡한 관계대명사와 접속사도 마법처럼 쉽게 풀어내는 현자.',
    color: 'text-indigo-400',
    bgGradient: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'knight',
    name: '불굴의 성기사',
    icon: '⚔️',
    grade: 'epic',
    quote: '어떤 고난도 문제 앞에서도 물러섬 없이 전진한다!',
    desc: '단련된 칼끝으로 오답의 유혹을 베어내는 정의의 기사.',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'ninja',
    name: '그림자 닌자',
    icon: '🥷',
    grade: 'epic',
    quote: '바람처럼 나타나 순식간에 정답만을 마킹한다.',
    desc: '소리 없이 오답을 베고 지나가는 어둠의 암살자.',
    color: 'text-slate-300',
    bgGradient: 'from-slate-700/30 to-slate-900 border-slate-600/40',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'superhero',
    name: '문법 슈퍼히어로',
    icon: '🦸‍♂️',
    grade: 'epic',
    quote: '지구상의 모든 문법 실수를 구원하러 왔다!',
    desc: '초능력 같은 직관으로 1초 만에 답을 찾아내는 영웅.',
    color: 'text-red-400',
    bgGradient: 'from-red-500/20 to-amber-500/10 border-red-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'alien',
    name: '미지의 외계인',
    icon: '👽',
    grade: 'epic',
    quote: '지구의 영어 시스템을 100% 해독 완료했다 삐-리-릭.',
    desc: '고차원 우주 지능으로 모든 문맥을 꿰뚫는 방문자.',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'vampire',
    name: '뱀파이어 백작',
    icon: '🧛',
    grade: 'epic',
    quote: '영생의 세월 동안 갈고닦은 고품격 귀족 영어.',
    desc: '달빛 아래서 우아하게 고난도 어휘를 음미하는 백작.',
    color: 'text-rose-400',
    bgGradient: 'from-rose-500/20 to-purple-900/20 border-rose-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'cyborg',
    name: '하이퍼 사이보그',
    icon: '🤖',
    grade: 'epic',
    quote: '인간의 뇌와 AI 코어가 결합된 100% 정답률 머신.',
    desc: '오차 제로의 연산력으로 빈칸을 채우는 전투 안드로이드.',
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'dragon_tamer',
    name: '용 조련사',
    icon: '🐲',
    grade: 'epic',
    quote: '거친 드래곤도 내 영단어 호통 한 번이면 순종한다!',
    desc: '맹수와 고룡을 자유자재로 지휘하는 베테랑 테이머.',
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'sniper',
    name: '만점 스나이퍼',
    icon: '🎯',
    grade: 'epic',
    quote: '원거리에서도 정답의 중심점을 절대 놓치지 않는다.',
    desc: '흔들리지 않는 호흡으로 4지선다 타겟을 저격하는 명사수.',
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'gladiator',
    name: '로마 검투사',
    icon: '🛡️',
    grade: 'epic',
    quote: '콜로세움의 환호성 속에 영문법 챔피언 등극!',
    desc: '수많은 경쟁자들을 제치고 랭킹전 상위권을 쟁취하는 전사.',
    color: 'text-amber-500',
    bgGradient: 'from-amber-600/20 to-red-600/10 border-amber-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'space_ranger',
    name: '우주 레인저',
    icon: '🚀',
    grade: 'epic',
    quote: '미개척 은하 행성으로 영어 탐험을 떠나자!',
    desc: '제트팩을 메고 새로운 표현을 찾아 누비는 우주 순찰대원.',
    color: 'text-sky-400',
    bgGradient: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'detective',
    name: '일급 명탐정',
    icon: '🕵️',
    grade: 'epic',
    quote: '범인은 바로 이 지문의 문법적 오류 너야!',
    desc: '돋보기 하나로 복잡한 독해 지문의 단서를 찾아내는 명탐정.',
    color: 'text-amber-300',
    bgGradient: 'from-amber-500/20 to-stone-600/20 border-amber-400/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'pirate_captain',
    name: '대해적 캡틴',
    icon: '🏴‍☠️',
    grade: 'epic',
    quote: '바다 건너 숨겨진 만점의 보물섬을 향해 출항하라!',
    desc: '거친 파도를 헤치며 코인 보물상자를 휩쓰는 해적 선장.',
    color: 'text-rose-400',
    bgGradient: 'from-rose-600/20 to-slate-800 border-rose-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'shadow_assassin',
    name: '암살자 레이븐',
    icon: '🗡️',
    grade: 'epic',
    quote: '어둠이 내리면 나의 독해 속도는 3배가 된다.',
    desc: '밤샘 랭킹전에서도 지치지 않고 오답을 베어내는 암살자.',
    color: 'text-purple-300',
    bgGradient: 'from-purple-900/30 to-slate-900 border-purple-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'valkyrie',
    name: '강철의 발키리',
    icon: '🪽',
    grade: 'epic',
    quote: '빛나는 날개로 전장을 수호하며 승리를 이끈다.',
    desc: '하늘에서 날아올라 어려운 문제를 가뿐히 해결하는 발키리.',
    color: 'text-cyan-300',
    bgGradient: 'from-cyan-500/20 to-indigo-500/10 border-cyan-400/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'samurai',
    name: '풍운의 무사',
    icon: '🗾',
    grade: 'epic',
    quote: '한 자루 검에 온 마음을 담아 정답을 가른다.',
    desc: '흔들리지 않는 평정심으로 시험을 치르는 검객.',
    color: 'text-red-300',
    bgGradient: 'from-red-600/20 to-slate-800 border-red-400/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'paladin',
    name: '빛의 수호기사',
    icon: '✝️',
    grade: 'epic',
    quote: '신성한 빛의 축복으로 오답의 어둠을 몰아내리라.',
    desc: '동료 학습자들에게 용기를 주는 성스러운 기사.',
    color: 'text-yellow-300',
    bgGradient: 'from-yellow-500/20 to-amber-500/10 border-yellow-400/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'bard',
    name: '방랑 음유시인',
    icon: '🎻',
    grade: 'epic',
    quote: '선율을 타고 흐르는 유려한 원어민 억양!',
    desc: '아름다운 시와 노래로 영어 표현을 마스터한 음유시인.',
    color: 'text-emerald-300',
    bgGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-400/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'necromancer',
    name: '영혼의 인도자',
    icon: '💀',
    grade: 'epic',
    quote: '잊혀진 고대 영단어의 영혼을 소환하노라.',
    desc: '어려운 어원 분석으로 생소한 단어도 척척 맞춰내는 술사.',
    color: 'text-violet-300',
    bgGradient: 'from-violet-600/20 to-slate-900 border-violet-500/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'time_traveler',
    name: '시간 여행자',
    icon: '⏳',
    grade: 'epic',
    quote: '미래의 시험지를 미리 보고 온 듯한 확신!',
    desc: '시간 왜곡 장치로 시험 시간을 여유롭게 활용하는 탐험가.',
    color: 'text-amber-300',
    bgGradient: 'from-amber-500/20 to-blue-500/10 border-amber-400/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'berserker',
    name: '분노의 광전사',
    icon: '🪓',
    grade: 'epic',
    quote: '틀린 문제 따위 도끼로 두 동강 내버린다!',
    desc: '화끈한 돌파력으로 오답 노트를 순식간에 정복하는 전사.',
    color: 'text-red-400',
    bgGradient: 'from-red-600/25 to-slate-900 border-red-500/40',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'elementalist',
    name: '사원소 마도사',
    icon: '🔮',
    grade: 'epic',
    quote: '불, 물, 바람, 흙의 조화로 완벽한 문장을 엮는다.',
    desc: '자연의 에너지를 다루듯 품사를 조화롭게 배치하는 마도사.',
    color: 'text-teal-300',
    bgGradient: 'from-teal-600/20 to-purple-600/10 border-teal-400/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'beast_master',
    name: '야수 조련사',
    icon: '🐆',
    grade: 'epic',
    quote: '밀림의 맹수들과 함께 거친 독해 지문을 사냥한다.',
    desc: '야성의 육감으로 가장 알맞은 어휘를 낚아채는 헌터.',
    color: 'text-orange-400',
    bgGradient: 'from-orange-500/20 to-amber-600/10 border-orange-400/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'sky_pirate',
    name: '비공정 파일럿',
    icon: '🛸',
    grade: 'epic',
    quote: '구름 위를 날아오르며 시험지 전체를 스캔한다.',
    desc: '비행선 조종간을 잡고 최고 속도로 문제 풀이를 지휘하는 에이스.',
    color: 'text-sky-300',
    bgGradient: 'from-sky-600/20 to-indigo-600/10 border-sky-400/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },
  {
    id: 'grand_scholar',
    name: '제국 수석 학자',
    icon: '📜',
    grade: 'epic',
    quote: '사전에 수록된 10만 단어가 내 머릿속에 있소.',
    desc: '학구열에 불타는 돋보기 학자, 문법 논쟁의 종결자.',
    color: 'text-amber-200',
    bgGradient: 'from-amber-600/20 to-yellow-600/10 border-amber-300/30',
    dropRatePercent: 0.60,
    duplicateRefund: 25
  },

  // ==========================================
  // 🎖️ 5. Rare (희귀 - 30.0% 확률, 중복시 🪙 +10 환급) - 20종
  // ==========================================
  {
    id: 'eagle',
    name: '창공의 독수리',
    icon: '🦅',
    grade: 'rare',
    quote: '높은 곳에서 한눈에 지문 전체를 꿰뚫어본다.',
    desc: '천리안 같은 시력으로 문제의 핵심 키워드를 포착하는 맹금류.',
    color: 'text-amber-300',
    bgGradient: 'from-amber-500/15 to-slate-800 border-amber-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'shark',
    name: '백상아리',
    icon: '🦈',
    grade: 'rare',
    quote: '오답의 냄새를 맡고 단숨에 물어뜯는다!',
    desc: '바다의 최상위 포식자처럼 거침없이 문제를 해치우는 상어.',
    color: 'text-blue-300',
    bgGradient: 'from-blue-500/15 to-slate-800 border-blue-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'panther',
    name: '블랙 팬서',
    icon: '🐆',
    grade: 'rare',
    quote: '어둠 속에 숨어 번개 같은 속도로 정답을 낚아챈다.',
    desc: '날렵하고 유연한 움직임으로 함정 보기를 피하는 흑표범.',
    color: 'text-purple-300',
    bgGradient: 'from-purple-500/15 to-slate-800 border-purple-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'owl',
    name: '지혜의 부엉이',
    icon: '🦉',
    grade: 'rare',
    quote: '밤이 깊을수록 나의 집중력은 더욱 예리해진다.',
    desc: '새벽 공부의 든든한 동반자이자 야간 랭킹전의 강자.',
    color: 'text-yellow-300',
    bgGradient: 'from-yellow-500/15 to-slate-800 border-yellow-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'fox',
    name: '붉은 여우',
    icon: '🦊',
    grade: 'rare',
    quote: '교묘한 함정 문제도 내 잔꾀 앞에서는 무용지물!',
    desc: '영리하고 기민한 판단력으로 정답 확률을 극대화하는 여우.',
    color: 'text-orange-300',
    bgGradient: 'from-orange-500/15 to-slate-800 border-orange-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'bear',
    name: '불곰',
    icon: '🐻',
    grade: 'rare',
    quote: '우직하게 한 문제씩 풀어내는 든든한 뚝심!',
    desc: '흔들리지 않는 집중력으로 목표한 일일 퀴즈를 완주하는 곰.',
    color: 'text-amber-400',
    bgGradient: 'from-amber-600/15 to-slate-800 border-amber-500/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'wolf',
    name: '은빛 늑대',
    icon: '🐺',
    grade: 'rare',
    quote: '무리의 선두에서 승리의 하울링을 외친다!',
    desc: '야성의 직감으로 정답의 방향을 이끄는 늑대.',
    color: 'text-slate-200',
    bgGradient: 'from-slate-600/20 to-slate-800 border-slate-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'dolphin',
    name: '영리한 돌고래',
    icon: '🐬',
    grade: 'rare',
    quote: '초음파로 복잡한 문장의 파동을 즉시 감지한다!',
    desc: '유쾌하고 영리하게 파도를 타듯 영어를 즐기는 돌고래.',
    color: 'text-cyan-300',
    bgGradient: 'from-cyan-500/15 to-slate-800 border-cyan-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'cheetah',
    name: '질주하는 치타',
    icon: '🐆',
    grade: 'rare',
    quote: '100m를 3초에 주파하듯 스피드 퀴즈 전격 돌파!',
    desc: '지상에서 가장 빠른 속도로 문제를 해치우는 쾌속 주자.',
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-500/15 to-slate-800 border-yellow-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'cobra',
    name: '킹코브라',
    icon: '🐍',
    grade: 'rare',
    quote: '단 한 번의 눈빛으로 정답을 꼼짝 못 하게 제압한다.',
    desc: '치명적인 정확성으로 빈틈을 찌르는 맹독 코브라.',
    color: 'text-emerald-300',
    bgGradient: 'from-emerald-600/15 to-slate-800 border-emerald-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'rhino',
    name: '강철 코뿔소',
    icon: '🦏',
    grade: 'rare',
    quote: '단단한 뿔로 어떤 고난도 난제도 들이받아 돌파한다!',
    desc: '저돌적인 파워로 복잡한 독해 지문을 뚫어버리는 돌격대장.',
    color: 'text-stone-300',
    bgGradient: 'from-stone-600/20 to-slate-800 border-stone-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'gorilla',
    name: '실버백 고릴라',
    icon: '🦍',
    grade: 'rare',
    quote: '가슴을 탕탕 치며 만점을 향한 투지를 불태운다!',
    desc: '압도적인 피지컬과 안정감으로 시험지를 제압하는 정글의 왕.',
    color: 'text-slate-300',
    bgGradient: 'from-slate-700/20 to-slate-800 border-slate-500/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'chameleon',
    name: '카멜레온',
    icon: '🦎',
    grade: 'rare',
    quote: '상황과 문맥에 맞춰 자유자재로 품사를 변환한다!',
    desc: '다채로운 어휘 적응력으로 빈칸을 채우는 변신의 달인.',
    color: 'text-lime-300',
    bgGradient: 'from-lime-500/15 to-slate-800 border-lime-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'octopus',
    name: '심해의 대왕문어',
    icon: '🐙',
    grade: 'rare',
    quote: '여덟 개의 촉수로 문법의 8품사를 동시에 낚아챈다!',
    desc: '다재다능한 두뇌로 여러 문제를 멀티태스킹하는 문어.',
    color: 'text-pink-400',
    bgGradient: 'from-pink-500/15 to-slate-800 border-pink-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'falcon',
    name: '날쌘 송골매',
    icon: '🪶',
    grade: 'rare',
    quote: '급강하하여 먹이를 낚아채듯 정답만 낚아챈다.',
    desc: '지체 없이 명쾌한 해답을 찾아내는 날쌘 매.',
    color: 'text-amber-200',
    bgGradient: 'from-amber-600/15 to-slate-800 border-amber-400/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'polar_bear',
    name: '북극곰',
    icon: '🐻‍❄️',
    grade: 'rare',
    quote: '빙판 위에서도 미끄러지지 않는 견고한 문법 기초!',
    desc: '눈보라 속에서도 묵묵히 퀴즈를 정복하는 북극의 지배자.',
    color: 'text-blue-100',
    bgGradient: 'from-blue-400/15 to-slate-800 border-blue-200/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'stingray',
    name: '바다 가오리',
    icon: '🪼',
    grade: 'rare',
    quote: '물결을 타듯 유연하고 부드러운 스피킹 실력!',
    desc: '자연스러운 영어 회화 표현을 구사하는 해양의 신사.',
    color: 'text-teal-200',
    bgGradient: 'from-teal-500/15 to-slate-800 border-teal-300/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'crocodile',
    name: '늪지대 악어',
    icon: '🐊',
    grade: 'rare',
    quote: '기회를 노리다 단번에 정답을 물고 늘어진다!',
    desc: '한번 잡은 문법 포인트는 절대 놓치지 않는 끈기의 악어.',
    color: 'text-green-400',
    bgGradient: 'from-green-600/15 to-slate-800 border-green-500/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'moose',
    name: '거대 무스',
    icon: '🫎',
    grade: 'rare',
    quote: '거대한 뿔처럼 웅장한 어휘력으로 시험지를 압도한다.',
    desc: '북미 삼림을 지키는 늠름하고 지혜로운 무스.',
    color: 'text-amber-500',
    bgGradient: 'from-amber-700/15 to-slate-800 border-amber-600/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },
  {
    id: 'bison',
    name: '야생 들소',
    icon: '🦬',
    grade: 'rare',
    quote: '대평원을 가르는 폭풍 같은 추진력으로 만점 돌진!',
    desc: '거침없이 문제 풀이를 밀어붙이는 파워풀한 들소.',
    color: 'text-orange-400',
    bgGradient: 'from-orange-700/15 to-slate-800 border-orange-500/30',
    dropRatePercent: 1.50,
    duplicateRefund: 10
  },

  // ==========================================
  // 🌿 6. Common (일반 - 48.95% 확률, 중복시 🪙 +5 환급) - 15종
  // ==========================================
  {
    id: 'chick',
    name: '아기 병아리',
    icon: '🐥',
    grade: 'common',
    quote: '삐약삐약 기초부터 탄탄하게!',
    desc: 'Level 1부터 차근차근 도약하는 귀여운 병아리.',
    color: 'text-yellow-300',
    bgGradient: 'from-yellow-500/15 to-slate-800 border-yellow-400/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'coffee',
    name: '커피 홀릭',
    icon: '☕',
    grade: 'common',
    quote: '카페인으로 토익 만점 정복!',
    desc: '새벽 랭킹전에서도 잠들지 않는 직장인 & 수험생의 동반자.',
    color: 'text-orange-300',
    bgGradient: 'from-orange-500/15 to-slate-800 border-orange-400/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'clover',
    name: '행운의 클로버',
    icon: '🍀',
    grade: 'common',
    quote: '헷갈려도 찍은 문제 다 맞는다!',
    desc: '4지선다 보기 중 정답을 이끌어내는 행운의 부적.',
    color: 'text-emerald-300',
    bgGradient: 'from-emerald-500/15 to-slate-800 border-emerald-400/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'frog',
    name: '청개구리',
    icon: '🐸',
    grade: 'common',
    quote: '오답 보기만 쏙쏙 피해 뛰어넘자 개굴!',
    desc: '남들과 다른 창의적인 시각으로 문제를 푸는 개구리.',
    color: 'text-green-300',
    bgGradient: 'from-green-500/15 to-slate-800 border-green-400/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'squirrel',
    name: '도토리 다람쥐',
    icon: '🐿️',
    grade: 'common',
    quote: '도토리 모으듯 코인을 차곡차곡!',
    desc: '단어와 코인을 알뜰하게 수집하는 다람쥐.',
    color: 'text-amber-400',
    bgGradient: 'from-amber-600/15 to-slate-800 border-amber-500/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'rabbit',
    name: '깡총 토끼',
    icon: '🐰',
    grade: 'common',
    quote: '귀를 쫑긋 세우고 원어민 리스닝 집중!',
    desc: '작은 발음 차이도 놓치지 않는 예민한 토끼.',
    color: 'text-pink-300',
    bgGradient: 'from-pink-400/15 to-slate-800 border-pink-300/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'penguin',
    name: '남극 펭귄',
    icon: '🐧',
    grade: 'common',
    quote: '얼음처럼 쿨하게 정답만 콕 짚기!',
    desc: '뒤뚱거리지만 목표를 향해 끝까지 나아가는 펭귄.',
    color: 'text-blue-300',
    bgGradient: 'from-blue-400/15 to-slate-800 border-blue-300/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'sloth',
    name: '여유만만 나무늘보',
    icon: '🦥',
    grade: 'common',
    quote: '천천히 풀어도 결국엔 다 맞힌다~',
    desc: '서두르지 않고 꼼꼼하게 지문을 독해하는 늘보.',
    color: 'text-amber-200',
    bgGradient: 'from-amber-700/15 to-slate-800 border-amber-600/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'bee',
    name: '부지런한 꿀벌',
    icon: '🐝',
    grade: 'common',
    quote: '매일매일 꿀 같은 코인을 수확 윙윙!',
    desc: '매일 랭킹전에 출석하는 성실함의 표본.',
    color: 'text-yellow-300',
    bgGradient: 'from-yellow-400/15 to-slate-800 border-yellow-300/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'duck',
    name: '명탐정 오리',
    icon: '🦆',
    grade: 'common',
    quote: '문법 오류의 흔적을 찾아냈다 꽥!',
    desc: '비문과 오류를 기가 막히게 추리해 내는 오리.',
    color: 'text-teal-300',
    bgGradient: 'from-teal-400/15 to-slate-800 border-teal-300/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'turtle',
    name: '끈기의 거북이',
    icon: '🐢',
    grade: 'common',
    quote: '느려도 포기하지 않으면 결국 승리한다!',
    desc: '하루 5문제로 시작해 마스터 티어까지 도달하는 거북이.',
    color: 'text-emerald-300',
    bgGradient: 'from-emerald-500/15 to-slate-800 border-emerald-400/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'puppy',
    name: '신난 댕댕이',
    icon: '🐶',
    grade: 'common',
    quote: '꼬리를 흔들며 영어 퀴즈 풀러 가요 멍멍!',
    desc: '언제나 긍정적인 에너지로 학습을 즐기는 사랑스러운 강아지.',
    color: 'text-amber-300',
    bgGradient: 'from-amber-500/15 to-slate-800 border-amber-400/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'hamster',
    name: '볼빵빵 햄스터',
    icon: '🐹',
    grade: 'common',
    quote: '볼 가득 영단어를 저장해 뒀어 찍찍!',
    desc: '쳇바퀴 돌리듯 성실하게 데일리 챌린지를 완수하는 햄스터.',
    color: 'text-orange-300',
    bgGradient: 'from-orange-400/15 to-slate-800 border-orange-300/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'panda',
    name: '대나무 팬더',
    icon: '🐼',
    grade: 'common',
    quote: '대나무 먹으면서 느긋하게 100점 맞기!',
    desc: '푸근하고 여유로운 마음으로 실수를 두려워하지 않는 팬더.',
    color: 'text-slate-200',
    bgGradient: 'from-slate-600/15 to-slate-800 border-slate-400/30',
    dropRatePercent: 3.263,
    duplicateRefund: 5
  },
  {
    id: 'koala',
    name: '쿨쿨 코알라',
    icon: '🐨',
    grade: 'common',
    quote: '유칼립투스 잎 씹으며 미드 자막 없이 보기 도전!',
    desc: '나무 위에서 편안하게 리스닝을 즐기는 힐링 코알라.',
    color: 'text-stone-300',
    bgGradient: 'from-stone-500/15 to-slate-800 border-stone-400/30',
    dropRatePercent: 3.268,
    duplicateRefund: 5
  },

  // ==========================================
  // 🦁 7. Starter (기본 스타터 4종 - 언제나 무료 해금) - 4종
  // ==========================================
  {
    id: 'lion',
    name: '라이온',
    icon: '🦁',
    grade: 'starter',
    quote: '용기 있는 영어 정복의 시작!',
    desc: '어떤 어려운 문제 앞에서도 절대 물러서지 않는 사자.',
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/40',
    duplicateRefund: 0
  },
  {
    id: 'cat',
    name: '냥이',
    icon: '🐱',
    grade: 'starter',
    quote: '말랑말랑 영문법 마스터냥!',
    desc: '호기심 가득한 눈으로 미드 표현을 쏙쏙 흡수하는 고양이.',
    color: 'text-pink-400',
    bgGradient: 'from-pink-500/20 to-rose-500/10 border-pink-500/40',
    duplicateRefund: 0
  },
  {
    id: 'fire',
    name: '열정',
    icon: '🔥',
    grade: 'starter',
    quote: '오늘도 불타오르는 학습 열정!',
    desc: '하루 20문제 풀기도 거뜬한 불꽃의 학습자.',
    color: 'text-rose-400',
    bgGradient: 'from-rose-500/20 to-red-500/10 border-rose-500/40',
    duplicateRefund: 0
  },
  {
    id: 'robot',
    name: 'AI 로봇',
    icon: '🤖',
    grade: 'starter',
    quote: '1타 강사 AI의 최고 깐부 파트너!',
    desc: '문법 공식과 5개 형식을 완벽하게 연산하는 안드로이드.',
    color: 'text-indigo-400',
    bgGradient: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40',
    duplicateRefund: 0
  }
];

export const GRADE_CONFIG: Record<AvatarGrade, { name: string; color: string; badgeBg: string; dropRate: string }> = {
  starter: { name: '기본 스타터', color: 'text-slate-300', badgeBg: 'bg-slate-700 text-slate-200 border-slate-600', dropRate: '무료 기본 지급' },
  common: { name: '일반 (Common)', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dropRate: '48.95%' },
  rare: { name: '희귀 (Rare)', color: 'text-teal-400', badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40', dropRate: '30.00%' },
  epic: { name: '영웅 (Epic)', color: 'text-purple-400', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', dropRate: '15.00%' },
  legendary: { name: '전설 (Legendary)', color: 'text-amber-400', badgeBg: 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]', dropRate: '5.00%' },
  mythic: { name: '신화 (Mythic)', color: 'text-pink-400', badgeBg: 'bg-gradient-to-r from-pink-500/40 to-purple-500/40 text-pink-200 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]', dropRate: '1.00%' },
  transcendent: { name: '초월 (Transcendent)', color: 'text-yellow-300 font-black', badgeBg: 'bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 text-slate-950 font-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.7)] animate-pulse', dropRate: '0.05%' }
};

// 가챠 뽑기 로직 (초월 0.05% 가중치 정밀 추첨)
export function performGachaDraw(currentUnlockedIds: string[] = []): { avatar: AvatarItem; isDuplicate: boolean; refundAmount: number } {
  const pool = AVATAR_DATABASE.filter(a => a.grade !== 'starter');
  const rand = Math.random() * 100; // 0.000 ~ 100.000

  let targetGrade: AvatarGrade = 'common';

  if (rand < 0.05) {
    targetGrade = 'transcendent'; // 🌟 0.05% (0 ~ 0.05)
  } else if (rand < 1.05) {
    targetGrade = 'mythic'; // 🌌 1.00% (0.05 ~ 1.05)
  } else if (rand < 6.05) {
    targetGrade = 'legendary'; // 💎 5.00% (1.05 ~ 6.05)
  } else if (rand < 21.05) {
    targetGrade = 'epic'; // 🔮 15.00% (6.05 ~ 21.05)
  } else if (rand < 51.05) {
    targetGrade = 'rare'; // 🎖️ 30.00% (21.05 ~ 51.05)
  } else {
    targetGrade = 'common'; // 🌿 48.95% (51.05 ~ 100.00)
  }

  const gradePool = pool.filter(a => a.grade === targetGrade);
  const selected = gradePool[Math.floor(Math.random() * gradePool.length)] || pool[0];

  const isDuplicate = currentUnlockedIds.includes(selected.id);
  const refundAmount = isDuplicate ? selected.duplicateRefund : 0;

  return {
    avatar: selected,
    isDuplicate,
    refundAmount
  };
}

// ==========================================
// 🎲 센스만점 랜덤 닉네임 생성 엔진
// ==========================================
export const RANDOM_NICKNAME_PREFIXES = [
  '열정의', '새벽의', '문법천재', '토익만점', '5형식정복',
  '단어뽀개는', '원어민포스', '폭풍질주', '영어마스터', '열공하는',
  '초집중', '자신감넘치는', '빛나는', '성실한', '도전하는',
  '갓생사는', '용감한', '호기심많은', '지적인', '당당한',
  '승리의', '불타는', '전설의', '매일성장', '실전파',
  '만점스나이퍼', '영포자탈출', '토익뽀개기', '스피킹신', '문맥천재',
  '천상계', '만점제조기', '독해의달인', '리스닝신', '스피킹마스터'
];

export const RANDOM_NICKNAME_NOUNS = [
  '라이언', '냥이', '파이어', '로봇', '뽀개러',
  '러너', '마스터', '챌린저', '리더', '꿈나무',
  '토이커', '그래머', '스피커', '위너', '에이스',
  '히어로', '학습자', '정복자', '메이커', '프로',
  '닥터', '가디언', '워리어', '챔피언', '루키',
  '대천사', '드래곤', '불사조', '타이탄', '스나이퍼'
];

export function generateRandomNickname(): string {
  const prefix = RANDOM_NICKNAME_PREFIXES[Math.floor(Math.random() * RANDOM_NICKNAME_PREFIXES.length)];
  const noun = RANDOM_NICKNAME_NOUNS[Math.floor(Math.random() * RANDOM_NICKNAME_NOUNS.length)];
  const num = Math.floor(Math.random() * 900 + 100);
  return `${prefix}${noun}${num}`;
}
