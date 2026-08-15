import { AvatarItem, AvatarGrade } from '../types';

export const STARTER_AVATAR_IDS = ['lion', 'cat', 'fire', 'robot'];

export const AVATAR_DATABASE: AvatarItem[] = [
  // ==========================================
  // 🌟 1. Transcendent (초월 - 0.05% 극악의 확률, 중복시 🪙 +300 환급)
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
    dropRatePercent: 0.0125,
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
    dropRatePercent: 0.0125,
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
    dropRatePercent: 0.0125,
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
    dropRatePercent: 0.0125,
    duplicateRefund: 300
  },

  // ==========================================
  // 🌌 2. Mythic (신화 - 1.0% 확률, 중복시 🪙 +100 환급)
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
    dropRatePercent: 0.17,
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
    dropRatePercent: 0.17,
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
    dropRatePercent: 0.17,
    duplicateRefund: 100
  },
  {
    id: 'meteor',
    name: '코스믹 메테오',
    icon: '☄️',
    grade: 'mythic',
    quote: '하늘을 가르고 떨어지는 압도적인 지식의 유성!',
    desc: '광속으로 문제를 풀어나가는 우주 유성.',
    color: 'text-purple-300 font-black',
    bgGradient: 'from-indigo-600/50 to-pink-900/50 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    dropRatePercent: 0.17,
    duplicateRefund: 100
  },
  {
    id: 'archangel',
    name: '빛의 대천사',
    icon: '🕊️',
    grade: 'mythic',
    quote: '거룩한 날개로 모든 헷갈리는 보기를 정화하노라.',
    desc: '혼란스러운 시험장에서도 평안과 지혜를 선사하는 천사.',
    color: 'text-yellow-200 font-black',
    bgGradient: 'from-yellow-500/40 to-slate-900 border-yellow-300 shadow-[0_0_15px_rgba(253,224,71,0.4)]',
    dropRatePercent: 0.16,
    duplicateRefund: 100
  },
  {
    id: 'kraken',
    name: '심해의 크라켄',
    icon: '🐙',
    grade: 'mythic',
    quote: '심해 8만 미터의 거대한 어휘력 촉수!',
    desc: '바다 깊숙한 곳의 모든 영단어를 휩쓰는 거대 괴수.',
    color: 'text-rose-300 font-black',
    bgGradient: 'from-rose-600/50 to-indigo-950/60 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    dropRatePercent: 0.16,
    duplicateRefund: 100
  },

  // ==========================================
  // 💎 3. Legendary (전설 - 5.0% 확률, 중복시 🪙 +50 환급)
  // ==========================================
  {
    id: 'dragon',
    name: '블루 드래곤',
    icon: '🐉',
    grade: 'legendary',
    quote: '천 년의 영문법 비기를 수호하는 신룡!',
    desc: '푸른 불꽃으로 모든 문법 오류를 정화하는 전설의 수호자.',
    color: 'text-cyan-400 font-black',
    bgGradient: 'from-cyan-500/40 via-blue-600/30 to-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    dropRatePercent: 0.625,
    duplicateRefund: 50
  },
  {
    id: 'archmage',
    name: '대마법사 튜터',
    icon: '🧙‍♂️',
    grade: 'legendary',
    quote: '내가 바로 문법 법칙을 주조한 마법사다!',
    desc: '문장 구조를 자유자재로 재조합하는 궁극의 문법 대마법사.',
    color: 'text-purple-400 font-black',
    bgGradient: 'from-purple-500/40 via-pink-600/30 to-slate-900 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    dropRatePercent: 0.625,
    duplicateRefund: 50
  },
  {
    id: 'rocket',
    name: '은하계 로켓',
    icon: '🚀',
    grade: 'legendary',
    quote: '내 성적은 이미 우주 끝으로 날아갔다!',
    desc: '초광속 추진력으로 마스터 티어까지 직행하는 우주선.',
    color: 'text-amber-400 font-black',
    bgGradient: 'from-amber-500/40 via-rose-600/30 to-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    dropRatePercent: 0.625,
    duplicateRefund: 50
  },
  {
    id: 'thunder',
    name: '갓 오브 썬더',
    icon: '⚡',
    grade: 'legendary',
    quote: '빛의 번개보다 빠른 타임어택 1위!',
    desc: '천둥의 힘으로 모든 랭킹전 리더보드를 초토화.',
    color: 'text-yellow-400 font-black',
    bgGradient: 'from-yellow-500/40 via-orange-600/30 to-slate-900 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]',
    dropRatePercent: 0.625,
    duplicateRefund: 50
  },
  {
    id: 'vampire',
    name: '밤의 뱀파이어 로드',
    icon: '🧛‍♂️',
    grade: 'legendary',
    quote: '어둠 속에서 영문법의 정수를 흡수하리라.',
    desc: '불사의 지혜로 영원히 공부하는 고성의 영주.',
    color: 'text-rose-400 font-black',
    bgGradient: 'from-rose-700/40 to-slate-900 border-rose-400',
    dropRatePercent: 0.625,
    duplicateRefund: 50
  },
  {
    id: 'tiger',
    name: '백호 신수',
    icon: '🐯',
    grade: 'legendary',
    quote: '포효 한 번에 오답들이 벌벌 떠는구나!',
    desc: '산중의 왕이자 정답만을 사냥하는 신령한 호랑이.',
    color: 'text-amber-300 font-black',
    bgGradient: 'from-amber-600/40 to-slate-900 border-amber-400',
    dropRatePercent: 0.625,
    duplicateRefund: 50
  },
  {
    id: 'ufo',
    name: '외계 침공선 UFO',
    icon: '🛸',
    grade: 'legendary',
    quote: '외계 고등 문명의 100점 뇌파 빔 발사!',
    desc: '지구의 모든 시험 문제를 1초에 스캔하는 모선.',
    color: 'text-emerald-400 font-black',
    bgGradient: 'from-emerald-600/40 to-slate-900 border-emerald-400',
    dropRatePercent: 0.625,
    duplicateRefund: 50
  },
  {
    id: 'volcano',
    name: '화산의 지배자',
    icon: '🌋',
    grade: 'legendary',
    quote: '용암처럼 끓어오르는 만점의 열기!',
    desc: '어떤 고난도 문제도 녹여버리는 마그마의 지배자.',
    color: 'text-red-400 font-black',
    bgGradient: 'from-red-600/40 to-slate-900 border-red-400',
    dropRatePercent: 0.625,
    duplicateRefund: 50
  },

  // ==========================================
  // 🔮 4. Epic (영웅 - 15.0% 확률, 중복시 🪙 +25 환급)
  // ==========================================
  {
    id: 'tutor',
    name: '수능 1타 강사',
    icon: '🎓',
    grade: 'epic',
    quote: '얘들아 주목, 이건 무조건 시험에 나온다!',
    desc: '출제 위원의 머릿속을 꿰뚫어보는 대치동 1타 강사.',
    color: 'text-purple-300 font-bold',
    bgGradient: 'from-purple-500/30 to-indigo-900/40 border-purple-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },
  {
    id: 'fox',
    name: '황금 구미호',
    icon: '🦊',
    grade: 'epic',
    quote: '원어민도 홀려버리는 매혹적인 뉘앙스!',
    desc: '가장 자연스럽고 세련된 현지 표현만을 골라 쓰는 여우.',
    color: 'text-amber-400 font-bold',
    bgGradient: 'from-amber-500/30 to-orange-900/40 border-amber-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },
  {
    id: 'gladiator',
    name: '영문법 검투사',
    icon: '⚔️',
    grade: 'epic',
    quote: '토익 990점을 향해 전진하라!',
    desc: '어떤 고난도 복문과 분사구문도 칼질 한 번으로 분해.',
    color: 'text-rose-300 font-bold',
    bgGradient: 'from-rose-500/30 to-pink-900/40 border-rose-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },
  {
    id: 'wolf',
    name: '달빛 늑대',
    icon: '🐺',
    grade: 'epic',
    quote: '랭킹전 1위를 지배하는 밤의 지배자!',
    desc: '사이클 마감 1분 전 기적의 리벤지 역전극을 쓰는 사냥꾼.',
    color: 'text-indigo-300 font-bold',
    bgGradient: 'from-indigo-500/30 to-purple-900/40 border-indigo-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },
  {
    id: 'archer',
    name: '엘프 스나이퍼',
    icon: '🏹',
    grade: 'epic',
    quote: '100m 밖에서도 빈칸 정답을 백발백중 저격!',
    desc: '단 하나의 오차도 없이 정답만을 관통하는 명사수.',
    color: 'text-emerald-300 font-bold',
    bgGradient: 'from-emerald-500/30 to-teal-900/40 border-emerald-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },
  {
    id: 'paladin',
    name: '성기사 팔라딘',
    icon: '🛡️',
    grade: 'epic',
    quote: '오답의 유혹으로부터 내 점수를 철벽 방어한다!',
    desc: '어떤 함정 보기에도 흔들리지 않는 빛의 방패.',
    color: 'text-blue-300 font-bold',
    bgGradient: 'from-blue-500/30 to-slate-900 border-blue-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },
  {
    id: 'titan',
    name: '메카닉 타이탄',
    icon: '🦾',
    grade: 'epic',
    quote: '강철의 연산력으로 100문제 연속 정답 풀가동!',
    desc: '지치지 않는 체력으로 밤샘 열공하는 사이보그.',
    color: 'text-slate-200 font-bold',
    bgGradient: 'from-slate-600/30 to-indigo-900 border-slate-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },
  {
    id: 'pirate',
    name: '해적왕 캡틴',
    icon: '🏴‍☠️',
    grade: 'epic',
    quote: '세계 모든 시험의 보물 코인을 약탈하러 왔다!',
    desc: '7개 바다를 누비며 코인을 쓸어 담는 해적 선장.',
    color: 'text-amber-400 font-bold',
    bgGradient: 'from-amber-700/30 to-slate-900 border-amber-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },
  {
    id: 'peacock',
    name: '환상의 공작새',
    icon: '🦚',
    grade: 'epic',
    quote: '화려한 어휘력으로 시험지를 수놓으리라!',
    desc: '고급 어휘와 세련된 영작을 구사하는 화려한 공작.',
    color: 'text-teal-300 font-bold',
    bgGradient: 'from-teal-600/30 to-blue-900 border-teal-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },
  {
    id: 'eagle',
    name: '천공의 독수리',
    icon: '🦅',
    grade: 'epic',
    quote: '상공 3000m에서 시험지 전체를 부감한다!',
    desc: '문장 전체의 구조를 단 0.1초 만에 파악하는 조망력.',
    color: 'text-yellow-300 font-bold',
    bgGradient: 'from-yellow-600/30 to-slate-900 border-yellow-400/50',
    dropRatePercent: 1.5,
    duplicateRefund: 25
  },

  // ==========================================
  // 🎖️ 5. Rare (희귀 - 30.0% 확률, 중복시 🪙 +10 환급)
  // ==========================================
  {
    id: 'owl',
    name: '박식한 올빼미',
    icon: '🦉',
    grade: 'rare',
    quote: '밤새 쌓아올린 문법의 지혜!',
    desc: '깊은 밤 오답 노트를 분석하며 약점을 완벽 분쇄하는 현자.',
    color: 'text-teal-300',
    bgGradient: 'from-teal-500/20 to-slate-800 border-teal-400/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },
  {
    id: 'dolphin',
    name: '천재 돌고래',
    icon: '🐬',
    grade: 'rare',
    quote: '원어민 억양과 발음도 완벽 캐치!',
    desc: '초음파급 언어 감각으로 리스닝과 회화 뉘앙스를 간파.',
    color: 'text-cyan-300',
    bgGradient: 'from-cyan-500/20 to-slate-800 border-cyan-400/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },
  {
    id: 'panda',
    name: '대나무 판다',
    icon: '🐼',
    grade: 'rare',
    quote: '느긋하지만 확실한 100점!',
    desc: '어떤 함정 보기에도 평정심을 잃지 않는 명경지수의 달인.',
    color: 'text-slate-200',
    bgGradient: 'from-slate-500/20 to-slate-800 border-slate-400/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },
  {
    id: 'ninja',
    name: '쉐도우 닌자',
    icon: '🥷',
    grade: 'rare',
    quote: '오답을 소리 없이 베어버린다!',
    desc: '타임어택 랭킹전에서 눈 깜짝할 사이에 10문제를 완주.',
    color: 'text-blue-300',
    bgGradient: 'from-blue-500/20 to-slate-800 border-blue-400/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },
  {
    id: 'shark',
    name: '심해의 상어',
    icon: '🦈',
    grade: 'rare',
    quote: '정답의 냄새를 맡으면 절대 놓치지 않는다!',
    desc: '점수를 사냥하는 날카로운 지능형 포식자.',
    color: 'text-blue-400',
    bgGradient: 'from-blue-600/20 to-slate-800 border-blue-500/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },
  {
    id: 'flamingo',
    name: '플라밍고 댄서',
    icon: '🦩',
    grade: 'rare',
    quote: '우아하게 춤추듯 풀어내는 영어 회화!',
    desc: '리듬감 있는 스피킹 실력의 소유자.',
    color: 'text-pink-300',
    bgGradient: 'from-pink-500/20 to-slate-800 border-pink-400/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },
  {
    id: 'hedgehog',
    name: '고슴도치 전략가',
    icon: '🦔',
    grade: 'rare',
    quote: '가시처럼 촘촘한 문법 오답 방어선!',
    desc: '철저한 분석으로 실수를 0개로 줄이는 전략가.',
    color: 'text-amber-300',
    bgGradient: 'from-amber-600/20 to-slate-800 border-amber-500/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },
  {
    id: 'bear',
    name: '불곰 파이터',
    icon: '🐻',
    grade: 'rare',
    quote: '묵직한 뚝심으로 전 문제 완주!',
    desc: '어려운 4형식/5형식도 힘으로 돌파하는 불곰.',
    color: 'text-orange-300',
    bgGradient: 'from-orange-600/20 to-slate-800 border-orange-500/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },
  {
    id: 'chameleon',
    name: '카멜레온 스파이',
    icon: '🦎',
    grade: 'rare',
    quote: '문맥에 맞춰 자유자재로 품사를 변신!',
    desc: '동사/형용사/명사 파생어를 꿰뚫는 변신의 귀재.',
    color: 'text-emerald-300',
    bgGradient: 'from-emerald-600/20 to-slate-800 border-emerald-500/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },
  {
    id: 'koala',
    name: '힐링 코알라',
    icon: '🐨',
    grade: 'rare',
    quote: '스트레스 없이 편안하게 100점 달성!',
    desc: '하루 5문제씩 꾸준히 실력을 키우는 평화의 요정.',
    color: 'text-slate-300',
    bgGradient: 'from-slate-600/20 to-slate-800 border-slate-500/40',
    dropRatePercent: 3.0,
    duplicateRefund: 10
  },

  // ==========================================
  // 🌿 6. Common (일반 - 48.95% 확률, 중복시 🪙 +5 환급)
  // ==========================================
  {
    id: 'pup',
    name: '열공 댕댕이',
    icon: '🐶',
    grade: 'common',
    quote: '간식보다 영단어가 더 좋아 멍!',
    desc: '주인이 영어를 마스터할 때까지 옆을 지키는 충직한 댕댕이.',
    color: 'text-amber-300',
    bgGradient: 'from-amber-500/15 to-slate-800 border-amber-400/30',
    dropRatePercent: 4.08,
    duplicateRefund: 5
  },
  {
    id: 'chick',
    name: '아기 병아리',
    icon: '🐥',
    grade: 'common',
    quote: '삐약삐약 기초부터 탄탄하게!',
    desc: 'Level 1부터 차근차근 도약하는 귀여운 병아리.',
    color: 'text-yellow-300',
    bgGradient: 'from-yellow-500/15 to-slate-800 border-yellow-400/30',
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.08,
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
    dropRatePercent: 4.07,
    duplicateRefund: 5
  },

  // ==========================================
  // 🦁 7. Starter (기본 스타터 4종 - 언제나 무료 해금)
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
