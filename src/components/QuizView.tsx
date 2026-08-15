import React, { useState, useEffect, useCallback } from 'react';
import { 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  Send, 
  HelpCircle, 
  MessageSquare, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, Option, QuizMode } from '../types';
import { askAiTutor } from '../services/geminiService';
import { sound } from '../services/soundService';
import { QuestionReportModal } from './QuestionReportModal';

interface QuizViewProps {
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  quizMode: QuizMode;
  score: number;
  userName?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: (question: Question) => void;
  onCheckAnswer: (userInput: string) => { isCorrect: boolean };
  onNextQuestion: () => void;
  onExit: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  currentQuestion,
  questionIndex,
  totalQuestions,
  quizMode,
  score,
  userName = '학습자',
  isBookmarked = false,
  onToggleBookmark,
  onCheckAnswer,
  onNextQuestion,
  onExit,
}) => {
  const [userInput, setUserInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [viewingFeedback, setViewingFeedback] = useState<string>('');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // AI Tutor Chat State
  const [isAiTutorOpen, setIsAiTutorOpen] = useState<boolean>(false);
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Reset state when currentQuestion changes
  useEffect(() => {
    setUserInput('');
    setIsSubmitted(false);
    setIsCorrect(false);
    setViewingFeedback('');
    setIsAiTutorOpen(false);
    setAiQuestion('');
    setAiAnswer('');
    setIsAiLoading(false);
  }, [currentQuestion]);

  // Option text helper
  const getOptText = (opt: any): string => {
    if (typeof opt === 'string') return opt;
    if (typeof opt === 'object' && opt !== null) {
      return opt.text || opt.word || opt.value || opt.choice || '';
    }
    return '';
  };

  // TTS Audio Player
  const playAudio = useCallback(() => {
    sound.playClick();
    if (!currentQuestion || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const sentenceToRead = isSubmitted
      ? currentQuestion.sentence.replace(/_{2,}/g, currentQuestion.answer)
      : currentQuestion.sentence.replace(/_{2,}/g, ' , ');

    const utterance = new SpeechSynthesisUtterance(sentenceToRead);
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.toLowerCase().includes('en'));
    if (englishVoices.length > 0) {
      const bestVoice = 
        englishVoices.find(v => v.name.includes('Google') && v.lang.includes('AU')) ||
        englishVoices.find(v => v.name.includes('Google') && v.lang.includes('US')) ||
        englishVoices.find(v => v.lang.includes('AU')) ||
        englishVoices.find(v => v.lang.includes('US')) ||
        englishVoices[0];
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
  }, [currentQuestion, isSubmitted]);

  // Check Answer Handler
  const handleCheck = useCallback(() => {
    if (!userInput.trim() || !currentQuestion || isSubmitted) return;
    const result = onCheckAnswer(userInput.trim());
    setIsCorrect(result.isCorrect);
    setIsSubmitted(true);
    setViewingFeedback(userInput.trim());

    if (result.isCorrect) {
      sound.playCorrect();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      sound.playIncorrect();
    }
  }, [userInput, currentQuestion, isSubmitted, onCheckAnswer]);

  // Next Question Handler
  const handleNext = useCallback(() => {
    sound.playClick();
    onNextQuestion();
  }, [onNextQuestion]);

  // AI Tutor Ask Handler
  const handleAskTutor = async (questionText?: string) => {
    sound.playClick();
    const qToAsk = (questionText || aiQuestion).trim();
    if (!qToAsk || !currentQuestion || isAiLoading) return;

    setAiQuestion(qToAsk);
    setIsAiLoading(true);
    setAiAnswer('');
    setIsAiTutorOpen(true);

    try {
      const res = await askAiTutor(currentQuestion, qToAsk, userInput);
      if (res.success && res.answer) {
        setAiAnswer(res.answer);
      } else {
        setAiAnswer(res.error || '답변을 불러오지 못했습니다. 다시 시도해 주세요.');
      }
    } catch (e: any) {
      setAiAnswer(`오류 발생: ${e.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key === 'q') {
        e.preventDefault();
        playAudio();
      } else if (key === 'enter') {
        e.preventDefault();
        if (!isSubmitted && userInput) {
          handleCheck();
        } else if (isSubmitted && !isAiTutorOpen) {
          handleNext();
        }
      } else if (['1', '2', '3', '4'].includes(key)) {
        if (!isSubmitted && currentQuestion && currentQuestion.options) {
          const idx = parseInt(key) - 1;
          if (idx < currentQuestion.options.length) {
            e.preventDefault();
            sound.playClick();
            const optText = getOptText(currentQuestion.options[idx]);
            setUserInput(optText);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitted, userInput, currentQuestion, isAiTutorOpen, playAudio, handleCheck, handleNext]);

  const selectedOptObj = currentQuestion?.options?.find(o => getOptText(o) === viewingFeedback);
  const feedbackText = typeof selectedOptObj === 'object' ? selectedOptObj.feedback : null;

  const renderBoldText = (text?: string) => {
    if (!text || typeof text !== 'string') return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') ? (
        <strong key={i} className="text-indigo-300 bg-indigo-500/20 px-1 rounded font-black">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const QUICK_QUESTIONS = [
    "정답과 오답의 차이를 쉽게 설명해줘 🎯",
    "이 문장의 핵심 영문법 공식은 뭐야? 🧩",
    "시험에서 자주 낚이는 함정 포인트는? ⚠️",
    "원어민들이 실생활에서 쓰는 뉘앙스는? 💡"
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center p-3 sm:p-6 md:p-8">
      <div className="max-w-3xl w-full flex flex-col gap-5">
        
        {/* Sticky Top Header */}
        <header className="flex justify-between items-center bg-slate-900/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xl z-20 sticky top-3">
          <button
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            className="text-slate-400 font-bold hover:bg-slate-800 hover:text-white px-3.5 py-1.5 rounded-xl transition-all text-xs sm:text-sm"
          >
            종료하기
          </button>

          <div className="flex items-center gap-2.5">
            {/* 🚨 문제 신고 버튼 */}
            <button
              onClick={() => {
                sound.playClick();
                setIsReportModalOpen(true);
              }}
              className="p-2 rounded-xl border bg-slate-800 text-slate-400 border-slate-700 hover:text-rose-400 hover:border-rose-500/40 transition-all active:scale-95 flex items-center gap-1"
              title="문제 오류 제보 및 AI 검수 요청"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-[11px] font-bold hidden sm:inline text-rose-300">
                오류 제보
              </span>
            </button>

            {/* ⭐ 즐겨찾기 버튼 */}
            {onToggleBookmark && (
              <button
                onClick={() => {
                  sound.playStar();
                  onToggleBookmark(currentQuestion);
                }}
                className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1 ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300'
                }`}
                title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span className="text-[11px] font-bold hidden sm:inline">
                  {isBookmarked ? '보관됨' : '즐겨찾기'}
                </span>
              </button>
            )}

            {quizMode === 'daily' && (
              <span className="font-black text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30 text-xs sm:text-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                SCORE: {score}
              </span>
            )}
            <span className="font-black text-indigo-300 bg-indigo-500/20 px-3.5 py-1.5 rounded-full border border-indigo-500/30 text-xs sm:text-sm">
              Q {questionIndex} / {totalQuestions}
            </span>
          </div>
        </header>

        {/* Main Quiz Card */}
        <div className="glass-card rounded-[2.5rem] p-5 sm:p-8 md:p-10 border border-slate-800 shadow-2xl relative">
          
          {/* Question Sentence Box */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-6 sm:p-10 rounded-[2rem] text-center text-white relative mb-6 sm:mb-8 border border-slate-700/80 shadow-inner">
            
            {/* Audio Button */}
            <button
              onClick={playAudio}
              className="absolute top-4 right-4 flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 px-3 py-1.5 rounded-full transition-all active:scale-95 text-indigo-300 hover:text-white"
              title="문장 읽어주기 (단축키: Q)"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold bg-white/10 px-1 py-0.5 rounded">Q</span>
            </button>

            {/* Sentence with Blank */}
            <p className="text-xl sm:text-2xl md:text-3xl mt-4 sm:mt-6 leading-relaxed font-serif tracking-wide">
              {currentQuestion.sentence.split(/_{2,}/).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span
                      className={`inline-block mx-1.5 px-2 font-black border-b-[3px] transition-all ${
                        isSubmitted
                          ? isCorrect
                            ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10 rounded-t'
                            : 'text-rose-400 border-rose-400 bg-rose-500/10 rounded-t'
                          : 'text-indigo-300 border-indigo-400/70 bg-indigo-500/10 rounded-t'
                      }`}
                    >
                      {userInput || '________'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </p>

            <div className="mt-4 flex justify-center">
              <span className="inline-block bg-slate-800 text-indigo-300 font-bold text-xs px-2.5 py-1 rounded-md border border-slate-700">
                {currentQuestion.form}형식 문장
              </span>
            </div>
          </div>

          {/* Options & Action Section */}
          {!isSubmitted ? (
            <div>
              {/* Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {currentQuestion.options.map((opt, idx) => {
                  const optText = getOptText(opt);
                  const isSelected = userInput === optText;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playClick();
                        setUserInput(optText);
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border-2 font-bold text-base sm:text-lg transition-all flex justify-between items-center active:scale-[0.99] ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                          : 'border-slate-700/80 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{optText}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-mono font-black border rounded ${
                          isSelected
                            ? 'bg-indigo-500 text-white border-indigo-400'
                            : 'bg-slate-700 text-slate-400 border-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCheck}
                disabled={!userInput}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white p-4 sm:p-5 rounded-2xl font-black text-lg sm:text-xl disabled:opacity-40 disabled:grayscale transition-all shadow-[0_8px_25px_rgba(99,102,241,0.3)] active:scale-[0.98] flex justify-center items-center gap-2.5"
              >
                <span>정답 확인하기</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-bold bg-white/20 border border-white/30 rounded">
                  Enter
                </span>
              </button>
            </div>
          ) : (
            /* Result & Explanation Feedback */
            <div className="flex flex-col gap-5">
              
              {/* Correct / Incorrect Banner */}
              <div
                className={`p-5 sm:p-6 rounded-[2rem] border-2 flex items-center gap-4 sm:gap-5 shadow-lg ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-100'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-black text-xl sm:text-2xl flex items-center flex-wrap gap-2">
                    {isCorrect ? 'Perfect! 정답입니다 🎯' : 'Incorrect! 오답입니다 🚨'}
                    {quizMode === 'daily' && isCorrect && (
                      <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs">
                        +10 SCORE
                      </span>
                    )}
                  </h3>
                  {!isCorrect && (
                    <p className="font-medium text-slate-300 text-sm mt-1">
                      올바른 정답:{' '}
                      <strong className="bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded border border-slate-700 font-black">
                        {currentQuestion.answer}
                      </strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Translation */}
              <div className="p-4 sm:p-5 bg-slate-800/80 rounded-2xl border border-slate-700/80">
                <span className="inline-block bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider mb-2">
                  Korean Translation
                </span>
                <p className="text-slate-200 font-medium text-base sm:text-lg leading-relaxed">
                  {currentQuestion.translation}
                </p>
              </div>

              {/* Option Analysis Buttons */}
              <div>
                <h4 className="font-black mb-3 text-slate-300 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Option Analysis (보기별 상세 해설)</span>
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const optText = getOptText(opt);
                    const isOptCorrect = typeof opt === 'object' ? opt.is_correct : optText === currentQuestion.answer;
                    const isTabActive = viewingFeedback === optText;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          sound.playClick();
                          setViewingFeedback(optText);
                        }}
                        className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all shadow-sm ${
                          isTabActive
                            ? isOptCorrect
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                              : 'bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {optText} {isOptCorrect ? '✅' : '❌'}
                      </button>
                    );
                  })}
                </div>
                {feedbackText && (
                  <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <p className="text-indigo-200 text-sm leading-relaxed">
                      {renderBoldText(feedbackText)}
                    </p>
                  </div>
                )}
              </div>

              {/* Chunk Pattern & Nuance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
                  <h4 className="font-black text-amber-300 text-xs uppercase tracking-wider mb-2">
                    🧩 Chunk Pattern
                  </h4>
                  <p className="text-amber-100 text-sm leading-relaxed">
                    {renderBoldText(currentQuestion.explanation?.chunk_pattern)}
                  </p>
                </div>

                <div className="bg-cyan-500/10 p-5 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-400" />
                  <h4 className="font-black text-cyan-300 text-xs uppercase tracking-wider mb-2">
                    💡 Nuance
                  </h4>
                  <p className="text-cyan-100 text-sm leading-relaxed">
                    {renderBoldText(currentQuestion.explanation?.nuance)}
                  </p>
                </div>
              </div>

              {/* 🤖 1타 강사 AI 튜터 1:1 질문 섹션 */}
              <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm sm:text-base text-white flex items-center gap-1.5">
                        <span>1타 강사 AI 튜터 1:1 질문</span>
                        <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-400/30">
                          PRO
                        </span>
                      </h4>
                      <p className="text-slate-400 text-xs font-medium">
                        해설을 봐도 헷갈린다면 AI 튜터에게 무엇이든 물어보세요!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsAiTutorOpen(!isAiTutorOpen);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
                  >
                    {isAiTutorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Quick Question Chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskTutor(q)}
                      disabled={isAiLoading}
                      className="px-3 py-1.5 bg-slate-800/90 hover:bg-indigo-600/40 border border-slate-700 hover:border-indigo-400/60 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Custom Question Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskTutor();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="예: 왜 여기서는 to부정사 대신 동명사가 들어가야 하나요?"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    disabled={isAiLoading}
                    className="flex-1 px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!aiQuestion.trim() || isAiLoading}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>질문</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* AI Answer Box */}
                {(isAiLoading || aiAnswer) && (
                  <div className="mt-4 p-4 sm:p-5 bg-slate-900/90 border border-indigo-500/40 rounded-2xl shadow-inner">
                    <div className="flex items-center gap-2 mb-2 text-xs font-black text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      <span>1타 강사 AI 튜터의 맞춤 해설:</span>
                    </div>

                    {isAiLoading ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>문법 원리를 명쾌하게 분석하여 답변을 작성하고 있습니다...</span>
                      </div>
                    ) : (
                      <div className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                        {renderBoldText(aiAnswer)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Next Question Button */}
              <button
                onClick={handleNext}
                className="w-full bg-white hover:bg-slate-200 text-slate-950 p-4 sm:p-5 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-[0.98] flex items-center justify-center gap-2.5 mt-2"
              >
                <span>
                  {questionIndex === totalQuestions
                    ? quizMode === 'daily'
                      ? '결과 확인 및 랭킹 등록 🏆'
                      : '퀴즈 완료 및 결과 보기 🎉'
                    : '다음 문제 (Next) ➡️'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-bold bg-slate-300 text-slate-800 rounded">
                  Enter
                </span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 🚨 Question Report Modal */}
      {isReportModalOpen && (
        <QuestionReportModal
          isOpen={isReportModalOpen}
          question={currentQuestion}
          userName={userName}
          onClose={() => setIsReportModalOpen(false)}
          onSuccess={() => {
            setIsReportModalOpen(false);
            alert('문제 오류 제보가 성공적으로 접수되었습니다! 📋 매일 밤 00시 AI 출제위원의 깐깐한 심사를 거쳐 채택 시 🪙 50 코인이 지급됩니다.');
          }}
        />
      )}
    </div>
  );
};
