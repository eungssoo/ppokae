import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  Search, 
  Volume2, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Smartphone, 
  Flame, 
  Layers, 
  HelpCircle,
  RefreshCw,
  Award
} from 'lucide-react';
import { CHAT_ACRONYMS, CHAT_QUIZ_SCENARIOS, ChatAcronymItem, ChatQuizScenario } from '../data/chatEnglishData';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';

interface ChatEnglishViewProps {
  onBack: () => void;
  onAddCoins?: (coins: number) => void;
}

export const ChatEnglishView: React.FC<ChatEnglishViewProps> = ({ onBack, onAddCoins }) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dict' | 'simulator'>('dict');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Simulator Quiz State
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: '전체 보기', icon: '🌐' },
    { id: 'acronym', label: '🔥 필수 줄임말', icon: '⚡' },
    { id: 'slang', label: '✨ 최신 Z세대 슬랭', icon: '💅' },
    { id: 'work_slack', label: '💼 슬랙 & 비즈니스', icon: '💻' },
    { id: 'reaction', label: '😂 찰진 리액션', icon: '🎭' }
  ];

  const playTTS = (text: string) => {
    sound.playClick();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*~_]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const filteredItems = CHAT_ACRONYMS.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.acronym.toLowerCase().includes(q) ||
      item.fullForm.toLowerCase().includes(q) ||
      item.meaningKo.toLowerCase().includes(q) ||
      item.meaningEn.toLowerCase().includes(q)
    );
  });

  const currentScenario = CHAT_QUIZ_SCENARIOS[currentScenarioIndex];

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOptionIndex(idx);
    setHasAnswered(true);

    const isCorrect = currentScenario.options[idx].isCorrect;
    if (isCorrect) {
      sound.playCorrect();
      setQuizScore(prev => prev + 1);
    } else {
      sound.playIncorrect();
    }
  };

  const handleNextScenario = () => {
    sound.playClick();
    if (currentScenarioIndex < CHAT_QUIZ_SCENARIOS.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setHasAnswered(false);
    } else {
      setIsQuizCompleted(true);
      if (onAddCoins) {
        const reward = (quizScore + (selectedOptionIndex !== null && currentScenario.options[selectedOptionIndex].isCorrect ? 1 : 0)) * 5;
        if (reward > 0) onAddCoins(reward);
      }
    }
  };

  const restartQuiz = () => {
    sound.playClick();
    setCurrentScenarioIndex(0);
    setSelectedOptionIndex(null);
    setHasAnswered(false);
    setQuizScore(0);
    setIsQuizCompleted(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center p-3 sm:p-6 font-sans">
      <div className="max-w-4xl w-full space-y-6">
        
        {/* Top Navigation Bar */}
        <header className="flex justify-between items-center bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 sticky top-3 z-30 shadow-lg backdrop-blur-xl">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="text-slate-400 font-bold hover:bg-slate-800 hover:text-white px-3 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm active:scale-95 border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h1 className="text-base sm:text-lg font-black text-white">
              채팅 영어 & 슬랭 라운지
            </h1>
          </div>

          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('dict');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'dict' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📖 줄임말 도감</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('simulator');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📱 톡 시뮬레이터</span>
            </button>
          </div>
        </header>

        {/* ============================================================ */}
        {/* TAB 1: 줄임말 & 슬랭 도감 */}
        {/* ============================================================ */}
        {activeTab === 'dict' && (
          <div className="space-y-5 animate-fade-in">
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/40 p-5 sm:p-6 rounded-2xl border border-indigo-500/20 shadow-lg text-left relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modern Texting & Gen Z Slang</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                원어민 메신저 필수 줄임말 & 대화체 사전 ⚡
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
                인스타그램 DM, 디스코드, 왓츠앱, 사내 슬랙(Slack)에서 매일 쓰이는 핵심 약어와 힙한 슬랭을 실제 카톡방 버블 예시로 마스터하세요!
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-3">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border active:scale-95 ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="줄임말(tbh, ngl), 슬랭, 또는 한국어 뜻으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Acronyms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-md space-y-4 text-left group"
                >
                  {/* Top: Acronym Title & Category Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-indigo-400 font-mono tracking-tight group-hover:text-indigo-300 transition-colors">
                          {item.acronym}
                        </span>
                        <button
                          onClick={() => playTTS(`${item.acronym}. ${item.fullForm}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/40 text-slate-400 hover:text-white transition-all"
                          title="발음 듣기"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                        {item.categoryLabel}
                      </span>
                    </div>

                    {/* Full Form & Meaning */}
                    <div className="text-xs font-bold text-slate-300 mb-1">
                      풀이: <span className="text-white font-mono">{item.fullForm}</span>
                    </div>
                    <div className="text-sm font-black text-emerald-400">
                      👉 {item.meaningKo}
                    </div>
                  </div>

                  {/* Chat Bubbles Simulator (Messenger style) */}
                  <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Smartphone className="w-3 h-3" />
                      <span>실전 메신저 톡 대화</span>
                    </div>

                    {item.exampleChat.map((msg, mIdx) => (
                      <div
                        key={mIdx}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-400 font-bold mb-0.5 px-1">
                          {msg.name}
                        </div>
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 px-1">
                          {msg.translationKo}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip */}
                  <div className="text-[11px] text-indigo-300 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-500/20 leading-relaxed font-medium">
                    {item.tip}
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="py-16 text-center text-slate-500 text-sm bg-slate-900/50 rounded-2xl border border-slate-800">
                검색 결과가 없습니다. 다른 단어로 검색해 보세요!
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: 메신저 톡 반응 시뮬레이터 퀴즈 */}
        {/* ============================================================ */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-fade-in text-left">
            {!isQuizCompleted ? (
              <div className="bg-slate-900/95 p-5 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                {/* Header Progress */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/30">
                      Scenario {currentScenarioIndex + 1} / {CHAT_QUIZ_SCENARIOS.length}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      현재 점수: <strong className="text-emerald-400">{quizScore}점</strong>
                    </span>
                  </div>

                  <span className="text-xs text-slate-500">
                    💡 정답 시 🪙 +5 코인 보상
                  </span>
                </div>

                {/* Context description */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-slate-400 mb-1">
                    🎯 [상황 미션]
                  </div>
                  <div className="text-sm font-black text-white">
                    {currentScenario.contextKo}
                  </div>
                </div>

                {/* Incoming Messenger Bubble */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow">
                      {currentScenario.senderName[0]}
                    </div>
                    <span>{currentScenario.senderName}</span>
                    <span className="text-[10px] text-slate-500 font-normal">방금 전</span>
                  </div>

                  <div className="inline-block max-w-[90%] bg-slate-800 text-slate-100 px-4 py-3 rounded-2xl rounded-tl-none text-sm sm:text-base font-medium shadow-md">
                    {currentScenario.incomingMessage}
                  </div>
                  <div className="text-xs text-slate-400 pl-1">
                    👉 해석: {currentScenario.incomingTranslation}
                  </div>
                </div>

                {/* Response Options */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    가장 자연스러운 답장을 선택하세요:
                  </div>

                  {currentScenario.options.map((opt, oIdx) => {
                    const isSelected = selectedOptionIndex === oIdx;
                    let btnStyle = 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200';
                    
                    if (hasAnswered) {
                      if (opt.isCorrect) {
                        btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
                      } else if (isSelected && !opt.isCorrect) {
                        btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
                      } else {
                        btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={hasAnswered}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full p-4 rounded-2xl border transition-all text-left flex items-start justify-between gap-3 active:scale-[0.99] ${btnStyle}`}
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-sm sm:text-base text-white">
                            {opt.text}
                          </div>
                          <div className="text-xs text-slate-400">
                            {opt.meaningKo}
                          </div>
                        </div>

                        {hasAnswered && opt.isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                        )}
                        {hasAnswered && isSelected && !opt.isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation feedback */}
                {hasAnswered && (
                  <div className="space-y-4 animate-fade-in">
                    <div className={`p-4 rounded-xl border text-xs sm:text-sm font-medium leading-relaxed ${
                      selectedOptionIndex !== null && currentScenario.options[selectedOptionIndex].isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                    }`}>
                      {selectedOptionIndex !== null && currentScenario.options[selectedOptionIndex].feedback}
                    </div>

                    <button
                      onClick={handleNextScenario}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{currentScenarioIndex < CHAT_QUIZ_SCENARIOS.length - 1 ? '다음 시나리오 도전 ➔' : '결과 확인하기 🏆'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Quiz Completion Screen */
              <div className="bg-slate-900/95 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-6 animate-scale-up">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-4xl shadow-xl">
                  🏆
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                    채팅 영어 시뮬레이션 완주!
                  </h3>
                  <p className="text-slate-400 text-sm">
                    총 {CHAT_QUIZ_SCENARIOS.length}문제 중 <strong className="text-emerald-400 font-bold">{quizScore}개</strong>의 메신저 상황을 완벽하게 해결했습니다!
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-sm font-bold">
                  <span>🪙 학습 보상 획득: +{quizScore * 5} Coins</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button
                    onClick={restartQuiz}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>다시 연습하기</span>
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveTab('dict');
                    }}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>줄임말 도감 복습하기 📖</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
