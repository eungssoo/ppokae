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
  AlertTriangle,
  Globe,
  Trash2,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, Option, QuizMode } from '../types';
import { askAiTutor } from '../services/geminiService';
import { sound } from '../services/soundService';
import { getRankingQuestionPoints, getLevelGatingInfo, adminDeleteSingleQuestion, adminUpdateQuestionEverywhere } from '../services/dbService';
import { regenerateQuestionWithAI } from '../services/reportService';
import { useLanguage } from '../services/i18n';
import { getOrFetchEnglishExplanation, prefetchEnglishExplanation, generateFallbackEnglishExplanation, EnglishExplanation } from '../services/englishExplanationService';
import { inferGrammarCategory } from '../services/grammarTagService';
import { QuestionReportModal } from './QuestionReportModal';

interface QuizViewProps {
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  quizMode: QuizMode;
  score: number;
  userName?: string;
  isAdmin?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (question: Question) => void;
  onCheckAnswer: (userInput: string) => { isCorrect: boolean };
  onNextQuestion: () => void;
  onExit: () => void;
  onAdminUpdateQuestion?: (fixedQuestion: Question) => void;
  onAdminDeleteQuestion?: (question: Question) => Promise<boolean> | void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  currentQuestion: propQuestion,
  questionIndex,
  totalQuestions,
  quizMode,
  score,
  userName = '학습자',
  isAdmin = false,
  isBookmarked = false,
  onToggleBookmark,
  onCheckAnswer,
  onNextQuestion,
  onExit,
  onAdminUpdateQuestion,
  onAdminDeleteQuestion,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(propQuestion);
  const [isAiRegenerating, setIsAiRegenerating] = useState<boolean>(false);
  const [isAiDeleting, setIsAiDeleting] = useState<boolean>(false);

  useEffect(() => {
    setCurrentQuestion(propQuestion);
  }, [propQuestion]);
  const [userInput, setUserInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [viewingFeedback, setViewingFeedback] = useState<string>('');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isExitWarningOpen, setIsExitWarningOpen] = useState<boolean>(false);

  // AI Tutor Chat State
  const [isAiTutorOpen, setIsAiTutorOpen] = useState<boolean>(false);
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [displayedOptions, setDisplayedOptions] = useState<Option[]>([]);

  const { language, setLanguage, t } = useLanguage();
  const [enExplanation, setEnExplanation] = useState<EnglishExplanation | null>(null);
  const [isEnLoading, setIsEnLoading] = useState<boolean>(false);
  const [explanationLang, setExplanationLang] = useState<'ko' | 'en'>(language);

  const scoreInfo = getRankingQuestionPoints(currentQuestion, questionIndex);

  let qLevel = 1;
  if (currentQuestion.level) {
    const match = String(currentQuestion.level).match(/\d+/);
    if (match) qLevel = Number(match[0]);
  } else if (currentQuestion.difficulty) {
    const match = String(currentQuestion.difficulty).match(/\d+/);
    if (match) qLevel = Number(match[0]);
  } else if (quizMode === 'daily') {
    if (questionIndex <= 2) qLevel = 1;
    else if (questionIndex <= 5) qLevel = 2;
    else if (questionIndex <= 8) qLevel = 3;
    else qLevel = 4;
  }
  const levelGating = getLevelGatingInfo(qLevel);

  // Reset state and randomly shuffle options when currentQuestion changes
  useEffect(() => {
    setUserInput('');
    setIsSubmitted(false);
    setIsCorrect(false);
    setViewingFeedback('');
    setIsAiTutorOpen(false);
    setAiQuestion('');
    setAiAnswer('');
    setIsAiLoading(false);
    setEnExplanation(null);
    setExplanationLang(language);

    // Pre-fetch English explanation instantly
    if (currentQuestion) {
      prefetchEnglishExplanation(currentQuestion);
      if (language === 'en') {
        setEnExplanation(generateFallbackEnglishExplanation(currentQuestion));
        getOrFetchEnglishExplanation(currentQuestion).then(res => setEnExplanation(res)).catch(() => {});
      }
    }

    // Set 4 options stably from currentQuestion (never re-shuffle on render/language change)
    if (currentQuestion && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0) {
      setDisplayedOptions(currentQuestion.options);
    } else {
      setDisplayedOptions([]);
    }
  }, [currentQuestion]);

  // Load English explanation when submitted in English mode
  useEffect(() => {
    if (isSubmitted && explanationLang === 'en' && currentQuestion) {
      if (!enExplanation) {
        setEnExplanation(generateFallbackEnglishExplanation(currentQuestion));
      }
      setIsEnLoading(true);
      getOrFetchEnglishExplanation(currentQuestion).then((res) => {
        setEnExplanation(res);
        setIsEnLoading(false);
      }).catch(() => {
        setIsEnLoading(false);
      });
    }
  }, [isSubmitted, explanationLang, currentQuestion]);

  const handleToggleExplanationLang = async (targetLang: 'ko' | 'en') => {
    sound.playClick();
    setExplanationLang(targetLang);
    if (targetLang === 'en' && currentQuestion) {
      if (!enExplanation) {
        setEnExplanation(generateFallbackEnglishExplanation(currentQuestion));
      }
      setIsEnLoading(true);
      const res = await getOrFetchEnglishExplanation(currentQuestion);
      setEnExplanation(res);
      setIsEnLoading(false);
    }
  };

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

    const BLANK_REGEX = /(?:_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)|<\s*blank\s*>|\[\s*빈칸\s*\]|\(\s*빈칸\s*\)|\[\s*_{1,}\s*\]|\(\s*_{1,}\s*\)|\[\s*___+\s*\]|\bblank\b|\bBlank\b|\bBLANK\b|[\(\[]\s*[\w\s\-']+(?:\s*\/\s*[\w\s\-']+)+\s*[\)\]])/gi;
    const sentenceToRead = isSubmitted
      ? currentQuestion.sentence.replace(BLANK_REGEX, currentQuestion.answer)
      : currentQuestion.sentence.replace(BLANK_REGEX, ' , ');

    const utterance = new SpeechSynthesisUtterance(sentenceToRead);
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.toLowerCase().includes('en'));
    if (englishVoices.length > 0) {
      const bestVoice = 
        englishVoices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')) ||
        englishVoices[0];
      utterance.voice = bestVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [currentQuestion, isSubmitted]);

  // Handle Check Answer
  const handleCheck = useCallback(() => {
    if (!userInput.trim() || isSubmitted) return;

    const res = onCheckAnswer(userInput);
    setIsSubmitted(true);
    setIsCorrect(res.isCorrect);
    setViewingFeedback(userInput);

    if (res.isCorrect) {
      sound.playCorrect();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      sound.playIncorrect();
    }
  }, [userInput, isSubmitted, onCheckAnswer]);

  const handleNext = useCallback(() => {
    sound.playClick();
    onNextQuestion();
  }, [onNextQuestion]);

  // AI Tutor submit
  const handleAskTutor = async (customQ?: string) => {
    const qToAsk = customQ || aiQuestion;
    if (!qToAsk.trim() || isAiLoading) return;

    sound.playClick();
    setIsAiLoading(true);
    setIsAiTutorOpen(true);

    try {
      const res = await askAiTutor(currentQuestion, qToAsk, userInput, explanationLang);
      if (res.success && res.answer) {
        setAiAnswer(res.answer);
      } else {
        setAiAnswer(res.error || (explanationLang === 'en' ? 'Failed to load tutor response. Please try again.' : '답변을 불러오지 못했습니다. 다시 시도해 주세요.'));
      }
    } catch (e: any) {
      setAiAnswer(explanationLang === 'en' ? `Error occurred: ${e.message}` : `오류 발생: ${e.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 👑 관리자: 이 문제의 선지/정답/해설 AI 즉시 재구성
  const handleAdminRegenerateQuestion = async () => {
    if (!currentQuestion) return;
    sound.playClick();
    setIsAiRegenerating(true);
    try {
      const res = await regenerateQuestionWithAI({
        sentence: currentQuestion.sentence,
        form: currentQuestion.form,
        currentAnswer: currentQuestion.answer
      });
      if (res.success && res.question) {
        sound.playStar();
        const fixed = {
          ...res.question,
          difficulty: currentQuestion.difficulty || currentQuestion.level,
          level: currentQuestion.level || currentQuestion.difficulty
        };
        await adminUpdateQuestionEverywhere(fixed, currentQuestion.sentence);
        setCurrentQuestion(fixed);
        if (onAdminUpdateQuestion) {
          onAdminUpdateQuestion(fixed);
        }
        alert('🤖 [관리자] AI 문제 재구성 및 DB 반영이 완료되었습니다!');
      } else {
        alert(`재구성 실패: ${res.error || 'AI 응답이 올바르지 않습니다.'}`);
      }
    } catch (e: any) {
      alert(`오류: ${e.message}`);
    } finally {
      setIsAiRegenerating(false);
    }
  };

  // 👑 관리자: 이 불량 문제 DB에서 즉시 영구 삭제 & 건너뛰기
  const handleAdminDeleteCurrentQuestion = async () => {
    if (!currentQuestion) return;
    if (!window.confirm(`⚠️ [관리자 권한]\n이 문제("${currentQuestion.sentence}")를 DB에서 영구 삭제하고 다음으로 이동하시겠습니까?`)) {
      return;
    }
    sound.playClick();
    setIsAiDeleting(true);
    try {
      if (onAdminDeleteQuestion) {
        await onAdminDeleteQuestion(currentQuestion);
      } else {
        await adminDeleteSingleQuestion(currentQuestion.id, currentQuestion.sentence);
      }
      alert('🗑️ 문제가 DB에서 영구 삭제되었습니다.');
      if (questionIndex >= totalQuestions) {
        onExit();
      } else {
        onNextQuestion();
      }
    } catch (e: any) {
      alert(`삭제 실패: ${e.message}`);
    } finally {
      setIsAiDeleting(false);
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
        if (!isSubmitted && displayedOptions.length > 0) {
          const idx = parseInt(key) - 1;
          if (idx < displayedOptions.length) {
            e.preventDefault();
            sound.playClick();
            const optText = getOptText(displayedOptions[idx]);
            setUserInput(optText);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitted, userInput, displayedOptions, isAiTutorOpen, playAudio, handleCheck, handleNext]);

  const selectedOptObj = displayedOptions.find(o => getOptText(o) === viewingFeedback) || currentQuestion?.options?.find(o => getOptText(o) === viewingFeedback);
  const selectedOptText = selectedOptObj ? getOptText(selectedOptObj) : '';
  const isSelectedOptCorrect = typeof selectedOptObj === 'object' ? selectedOptObj.is_correct : selectedOptText === currentQuestion?.answer;

  let feedbackText = '';
  if (explanationLang === 'en') {
    if (enExplanation?.option_feedbacks?.[selectedOptText]) {
      feedbackText = enExplanation.option_feedbacks[selectedOptText];
    } else {
      feedbackText = isSelectedOptCorrect
        ? `"${selectedOptText}" is correct! It fits the grammatical structure and role in this Form ${currentQuestion?.form || 3} sentence.`
        : `"${selectedOptText}" is incorrect. It does not fit the required grammatical role or tense for this blank.`;
    }
  } else {
    feedbackText = typeof selectedOptObj === 'object' && selectedOptObj.feedback 
      ? selectedOptObj.feedback 
      : isSelectedOptCorrect
        ? `정답입니다! "${selectedOptText}"가 이 문장의 ${currentQuestion?.form || 3}형식 문법 구조에 완벽하게 일치합니다.`
        : `오답입니다. "${selectedOptText}"는 이 문장의 문법적 위치나 시제에 맞지 않습니다.`;
  }

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

  const QUICK_QUESTIONS = language === 'en' ? [
    "Explain the difference between correct & incorrect choices 🎯",
    "What is the key grammatical formula here? 🧩",
    "What is the common exam trap point? ⚠️",
    "What is the native nuance & context? 💡"
  ] : [
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                if (quizMode === 'daily') {
                  setIsExitWarningOpen(true);
                } else {
                  onExit();
                }
              }}
              className="text-slate-400 hover:text-white font-bold transition-all px-3 py-1.5 rounded-xl hover:bg-slate-800 text-xs sm:text-sm active:scale-95"
            >
              {language === 'en' ? '✕ Exit' : '✕ 나가기'}
            </button>

            {/* Bookmark Star Button */}
            {onToggleBookmark && (
              <button
                onClick={() => {
                  sound.playStar();
                  onToggleBookmark(currentQuestion);
                }}
                className={`p-2 rounded-xl transition-all active:scale-90 border ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'
                }`}
                title={isBookmarked ? (language === 'en' ? 'Remove Bookmark' : '즐겨찾기 해제') : (language === 'en' ? 'Bookmark Question' : '즐겨찾기에 저장')}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 🚨 Problem Error Report Button */}
            {isSubmitted && (
              <button
                onClick={() => {
                  sound.playClick();
                  setIsReportModalOpen(true);
                }}
                className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95"
                title={language === 'en' ? 'Report Question' : '문제 오류 제보'}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'en' ? 'Report' : '오류 제보'}</span>
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
          
          {/* 👑 관리자 전용 퀵 툴바 (AI 재구성 & 문제 즉시 삭제) */}
          {isAdmin && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-slate-900/80 border border-indigo-500/30 p-2.5 rounded-2xl shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>👑 관리자 사령탑 퀵 컨트롤</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAdminRegenerateQuestion}
                  disabled={isAiRegenerating || isAiDeleting}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                  title="이 문제의 선지 4개, 정답, 해설을 AI로 즉시 재구성하여 DB에 전역 반영"
                >
                  <Bot className={`w-3.5 h-3.5 ${isAiRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isAiRegenerating ? 'AI 재구성 중...' : '🤖 AI 문제 재구성'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdminDeleteCurrentQuestion}
                  disabled={isAiRegenerating || isAiDeleting}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                  title="이 불량 문제를 DB에서 영구 삭제하고 건너뛰기"
                >
                  <Trash2 className={`w-3.5 h-3.5 ${isAiDeleting ? 'animate-spin' : ''}`} />
                  <span>{isAiDeleting ? '삭제 중...' : '🗑️ 문제 즉시 삭제'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Question Sentence Box */}
          <div className="bg-slate-50 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 p-6 sm:p-10 rounded-[2rem] text-center relative mb-6 sm:mb-8 border border-slate-200 dark:border-slate-700/80 shadow-inner">
            
            {/* Audio Button */}
            <button
              onClick={playAudio}
              className="absolute top-4 right-4 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 border border-indigo-200 dark:border-indigo-400/40 px-3 py-1.5 rounded-full transition-all active:scale-95 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white"
              title="Read Aloud (Hotkey: Q)"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold bg-indigo-100 dark:bg-white/10 px-1 py-0.5 rounded text-indigo-800 dark:text-white">Q</span>
            </button>

            {/* Sentence with Blank */}
            <p className="text-xl sm:text-2xl md:text-3xl mt-4 sm:mt-6 leading-relaxed font-serif tracking-wide text-slate-900 dark:text-white">
              {(() => {
                const BLANK_SPLIT_REGEX = /(?:_{2,}|\[\s*blank\s*\]|\(\s*blank\s*\)|<\s*blank\s*>|\[\s*빈칸\s*\]|\(\s*빈칸\s*\)|\(\s*_{1,}\s*\)|\[\s*_{1,}\s*\]|\[\s*___+\s*\]|\bblank\b|\bBlank\b|\bBLANK\b|[\(\[]\s*[\w\s\-']+(?:\s*\/\s*[\w\s\-']+)+\s*[\)\]])/gi;
                let s = currentQuestion.sentence || '';
                let parts = s.split(BLANK_SPLIT_REGEX);

                // If no blank pattern matched, but answer is in the sentence, split by answer
                if (parts.length <= 1 && currentQuestion.answer) {
                  const escaped = currentQuestion.answer.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  if (escaped && escaped.length >= 2) {
                    parts = s.split(new RegExp(`\\b${escaped}\\b`, 'i'));
                  }
                }

                if (parts.length <= 1) {
                  return <span>{currentQuestion.sentence}</span>;
                }

                return (
                  <span>
                    {parts.map((part, i) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < parts.length - 1 && (
                          <span
                            className={`inline-block mx-1.5 px-3 py-0.5 font-black border-b-[3px] transition-all rounded-t ${
                              isSubmitted
                                ? isCorrect
                                  ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500 bg-emerald-100 dark:bg-emerald-500/10'
                                  : 'text-rose-700 dark:text-rose-400 border-rose-500 bg-rose-100 dark:bg-rose-500/10'
                                : 'text-indigo-800 dark:text-indigo-300 border-indigo-500 bg-indigo-100 dark:bg-indigo-500/10'
                            }`}
                          >
                            {userInput || '________'}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </span>
                );
              })()}
            </p>

            {/* Sentence Badges & Grammar Category */}
            {(() => {
              const grammarInfo = inferGrammarCategory(currentQuestion);
              return (
                <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                  {/* 🏷️ 1순위 강조: 실전 문법 핵심 포인트 태그 */}
                  <span className={`inline-flex items-center gap-1.5 font-black text-xs px-3.5 py-1 rounded-full border shadow-sm ${grammarInfo.bgColor} ${grammarInfo.textColor} ${grammarInfo.borderColor}`}>
                    <span>{grammarInfo.icon}</span>
                    <span>{language === 'en' ? grammarInfo.nameEn : grammarInfo.nameKo}</span>
                  </span>

                  {/* 2순위: 문장 형식 배지 */}
                  <span className="inline-block bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    {currentQuestion.form}{language === 'en' ? '-Form Sentence' : '형식 문장'}
                  </span>

                  {quizMode === 'daily' ? (
                    <span className={`inline-flex items-center gap-1.5 font-black text-xs px-3 py-1 rounded-full border ${scoreInfo.badgeBg} ${scoreInfo.badgeText} ${scoreInfo.badgeBorder} shadow-sm`}>
                      <span>🎯 {scoreInfo.levelLabel}</span>
                      <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] text-white font-black">+{scoreInfo.points}{language === 'en' ? ' PTS' : '점'}</span>
                    </span>
                  ) : (
                    <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold px-3 py-1 rounded-full">
                      {String(currentQuestion.difficulty || currentQuestion.level || '').includes('4') ? 'Lv.4 실전' :
                       String(currentQuestion.difficulty || currentQuestion.level || '').includes('3') ? 'Lv.3 도약' :
                       String(currentQuestion.difficulty || currentQuestion.level || '').includes('2') ? 'Lv.2 중급' : 'Lv.1 초급'}
                    </span>
                  )}

                  {/* 🪙 코인 보상 배지 */}
                  <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span>🪙</span>
                    <span>{language === 'en' ? `+${levelGating.coinsReward} Coins` : `정답 시 +${levelGating.coinsReward} 코인`}</span>
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Options & Action Section */}
          {!isSubmitted ? (
            <div>
              {/* Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {displayedOptions.map((opt, idx) => {
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
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-950 dark:text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                          : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 hover:border-indigo-400 dark:hover:border-slate-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-serif">{optText}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400 dark:border-slate-600'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCheck}
                disabled={!userInput.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white p-4 sm:p-5 rounded-2xl font-black text-lg sm:text-xl disabled:opacity-40 disabled:grayscale transition-all shadow-[0_8px_25px_rgba(99,102,241,0.3)] active:scale-[0.98] flex justify-center items-center gap-2.5"
              >
                <span>{t('submitAnswer')}</span>
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
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
                    : 'bg-rose-50 dark:bg-rose-500/10 border-rose-400 dark:border-rose-500/40 text-rose-950 dark:text-rose-100'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-black text-xl sm:text-2xl flex items-center flex-wrap gap-2 text-slate-900 dark:text-white">
                    {isCorrect ? t('correct') : t('incorrect')}
                    {quizMode === 'daily' && isCorrect && (
                      <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs shadow-sm">
                        +{scoreInfo.points} SCORE
                      </span>
                    )}
                  </h3>
                  {!isCorrect && (
                    <p className="font-medium text-slate-700 dark:text-slate-300 text-sm mt-1">
                      {t('correctAnswerIs')}{' '}
                      <strong className="bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-300 dark:border-slate-700 font-black">
                        {(() => {
                          const correctOpt = Array.isArray(currentQuestion?.options)
                            ? currentQuestion.options.find((o: any) => typeof o === 'object' && o.is_correct === true)
                            : null;
                          if (correctOpt && typeof correctOpt === 'object' && correctOpt.text) {
                            return correctOpt.text;
                          }
                          return currentQuestion.answer;
                        })()}
                      </strong>
                    </p>
                  )}
                </div>
              </div>

              {/* 🌐 Explanation Language Switcher Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-300">
                    {explanationLang === 'en' ? 'AI English Immersion Explanation' : 'AI 상세 문법 해설'}
                  </span>
                  {isEnLoading && (
                    <span className="text-[10px] text-indigo-700 dark:text-cyan-300 bg-indigo-100 dark:bg-cyan-500/20 px-2 py-0.5 rounded-full border border-indigo-300 dark:border-cyan-400/40 animate-pulse flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      <span>Translating...</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleToggleExplanationLang('ko')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      explanationLang === 'ko'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🇰🇷 한국어
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleExplanationLang('en')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                      explanationLang === 'en'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🇺🇸 English</span>
                  </button>
                </div>
              </div>

              {/* 🏷️ 실전 문법 핵심 포인트 & 형식 구조 분석 요약 카드 */}
              {(() => {
                const grammarInfo = inferGrammarCategory(currentQuestion);
                return (
                  <div className={`p-4 sm:p-5 rounded-2xl border ${grammarInfo.bgColor} ${grammarInfo.borderColor} shadow-sm`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{grammarInfo.icon}</span>
                        <span className={`text-xs sm:text-sm font-black uppercase tracking-wide ${grammarInfo.textColor}`}>
                          {language === 'en' ? 'Core Exam Trigger:' : '실전 출제 핵심 포인트:'} {language === 'en' ? grammarInfo.nameEn : grammarInfo.nameKo}
                        </span>
                      </div>
                      <span className="bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        {currentQuestion.form}{language === 'en' ? '-Form Structure' : '형식 문형 구조'}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                      {language === 'en' ? grammarInfo.descEn : grammarInfo.descKo}
                    </p>
                  </div>
                );
              })()}

              {/* 🇰🇷 한국어 번역 (한국어 모드일 때만 표시) */}
              {explanationLang === 'ko' && (
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider">
                      🇰🇷 한국어 번역
                    </span>
                  </div>
                  <p className="text-slate-900 dark:text-slate-200 font-medium text-base sm:text-lg leading-relaxed">
                    {currentQuestion.translation}
                  </p>
                </div>
              )}

              {/* Option Analysis Buttons */}
              <div>
                <h4 className="font-black mb-3 text-slate-800 dark:text-slate-300 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{explanationLang === 'en' ? 'Option Analysis (Choice Breakdown)' : 'Option Analysis (보기별 상세 해설)'}</span>
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {displayedOptions.map((opt, idx) => {
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
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {optText} {isOptCorrect ? '✅' : '❌'}
                      </button>
                    );
                  })}
                </div>
                {feedbackText && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
                    <p className="text-indigo-950 dark:text-indigo-200 text-sm leading-relaxed font-medium">
                      {renderBoldText(feedbackText)}
                    </p>
                  </div>
                )}
              </div>

              {/* Chunk Pattern & Nuance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/20 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                  <h4 className="font-black text-amber-800 dark:text-amber-300 text-xs uppercase tracking-wider mb-2">
                    🧩 {explanationLang === 'en' ? 'Grammar Chunk Pattern' : 'Chunk Pattern (문형 구조)'}
                  </h4>
                  <p className="text-amber-950 dark:text-amber-100 text-sm leading-relaxed font-medium">
                    {renderBoldText(
                      explanationLang === 'en'
                        ? (enExplanation?.chunk_pattern || `Form ${currentQuestion.form} Grammar Structure`)
                        : currentQuestion.explanation?.chunk_pattern
                    )}
                  </p>
                </div>

                <div className="bg-cyan-50 dark:bg-cyan-500/10 p-5 rounded-2xl border border-cyan-200 dark:border-cyan-500/20 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
                  <h4 className="font-black text-cyan-800 dark:text-cyan-300 text-xs uppercase tracking-wider mb-2">
                    💡 {explanationLang === 'en' ? 'Native Nuance & Usage' : 'Nuance (원어민 뉘앙스)'}
                  </h4>
                  <p className="text-cyan-950 dark:text-cyan-100 text-sm leading-relaxed font-medium">
                    {renderBoldText(
                      explanationLang === 'en'
                        ? (enExplanation?.nuance || `Focus on how Form ${currentQuestion.form} structures convey precise meaning in real-life English.`)
                        : currentQuestion.explanation?.nuance
                    )}
                  </p>
                </div>
              </div>

              {/* 🤖 1타 강사 AI 튜터 1:1 질문 섹션 */}
              <div className="bg-indigo-50/70 dark:bg-gradient-to-br dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{t('aiTutorTitle')}</span>
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                          PRO
                        </span>
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {t('aiTutorDesc')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsAiTutorOpen(!isAiTutorOpen);
                    }}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
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
                      className="px-3 py-1.5 bg-white dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-600/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-900 dark:hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
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
                    placeholder={language === 'en' ? 'e.g., Why do we use gerund instead of infinitive here?' : '예: 왜 여기서는 to부정사 대신 동명사가 들어가야 하나요?'}
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    disabled={isAiLoading}
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
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
                        <span>{language === 'en' ? 'Ask' : '질문'}</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* AI Answer Box */}
                {(isAiLoading || aiAnswer) && (
                  <div className="mt-4 p-4 sm:p-5 bg-white dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-500/40 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-xs font-black text-indigo-700 dark:text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                      <span>{language === 'en' ? 'Master AI Tutor Explanation:' : '1타 강사 AI 튜터의 맞춤 해설:'}</span>
                    </div>

                    {isAiLoading ? (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                        <span>{language === 'en' ? 'AI Tutor is analyzing grammar rules and preparing a response...' : '문법 원리를 명쾌하게 분석하여 답변을 작성하고 있습니다...'}</span>
                      </div>
                    ) : (
                      <div className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                        {renderBoldText(aiAnswer)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Next Question Button */}
              <button
                onClick={handleNext}
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 p-4 sm:p-5 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2.5 mt-2"
              >
                <span>
                  {questionIndex === totalQuestions
                    ? quizMode === 'daily'
                      ? (language === 'en' ? 'Register Ranking & Finish 🏆' : '결과 확인 및 랭킹 등록 🏆')
                      : (language === 'en' ? 'Finish & View Results 🎉' : '퀴즈 완료 및 결과 보기 🎉')
                    : (language === 'en' ? 'Next Question ➔' : '다음 문제 (Next) ➡️')}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-bold bg-white/20 dark:bg-slate-300 text-white dark:text-slate-800 rounded">
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
            alert(language === 'en' ? 'Question report submitted! You will receive 🪙 50 Coins if approved during audit.' : '문제 오류 제보가 성공적으로 접수되었습니다! 📋 매일 밤 00시 AI 출제위원의 깐깐한 심사를 거쳐 채택 시 🪙 50 코인이 지급됩니다.');
          }}
        />
      )}

      {/* ⚠️ 랭킹전 중도 퇴장 경고 모달 */}
      {isExitWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full glass-card rounded-[2.5rem] p-6 sm:p-8 border-2 border-rose-500/60 shadow-[0_0_50px_rgba(244,63,94,0.3)] relative text-left">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl">
                🚨
              </div>
              <div>
                <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider">
                  Ranking Challenge Warning
                </span>
                <h3 className="text-xl font-black text-white">
                  {language === 'en' ? 'Quit Ranking Battle?' : '랭킹전 중도 퇴장 경고'}
                </h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-4 font-medium">
              {language === 'en'
                ? 'Exiting now will forfeit this attempt (marked as withdrawn)!'
                : '지금 나가시면 이번 회차의 도전 기회가 소멸(기권 처리)됩니다!'}
            </p>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2 mb-6 text-xs text-slate-400">
              <p className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>{language === 'en' ? 'Max 2 attempts per round (1st: Free / 2nd: 🪙 50 Coins).' : '회차당 최대 2회만 도전 가능합니다. (1회차: 무료 / 2회차: 🪙 50 코인)'}</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>{language === 'en' ? 'Retrying requires 🪙 50 Coins. If 2 attempts are reached, you cannot challenge until next round.' : '지금 포기하시면 다시 도전할 때 🪙 50 코인이 필요하며, 이미 2회 응시한 경우 더 이상 도전할 수 없습니다.'}</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{language === 'en' ? 'Your current score up to this point will be finalized.' : '현재까지 푼 점수가 이번 도전의 최종 점수로 기록됩니다.'}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsExitWarningOpen(false);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black text-sm shadow-md active:scale-95 transition-all"
              >
                {language === 'en' ? 'Keep Playing (Recommended)' : '계속 풀기 (권장)'}
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsExitWarningOpen(false);
                  onExit();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 font-bold text-sm transition-all"
              >
                {language === 'en' ? 'Forfeit & Exit' : '기권하고 나가기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
