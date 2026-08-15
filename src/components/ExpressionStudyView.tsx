import React, { useState, useCallback } from 'react';
import { ArrowLeft, Volume2, Sparkles, MessageCircle, PenTool, Lightbulb, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ExpressionItem, Question } from '../types';
import { sound } from '../services/soundService';

interface ExpressionStudyViewProps {
  categoryTitle: string;
  expressions: ExpressionItem[];
  isBookmarked?: boolean;
  onToggleBookmark?: (question: Question) => void;
  onBack: () => void;
  onStartQuiz: () => void;
}

export const ExpressionStudyView: React.FC<ExpressionStudyViewProps> = ({
  categoryTitle,
  expressions,
  isBookmarked = false,
  onToggleBookmark,
  onBack,
  onStartQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const currentExp = expressions[currentIndex];

  // TTS Audio Player
  const playAudio = useCallback((textToPlay?: string) => {
    sound.playClick();
    if (!window.speechSynthesis || !currentExp) return;
    window.speechSynthesis.cancel();

    const text = textToPlay || currentExp.expression;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.toLowerCase().includes('en'));
    if (englishVoices.length > 0) {
      const bestVoice = 
        englishVoices.find(v => v.name.includes('Google') && v.lang.includes('AU')) ||
        englishVoices.find(v => v.name.includes('Google') && v.lang.includes('US')) ||
        englishVoices[0];
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
  }, [currentExp]);

  const handleNext = () => {
    sound.playClick();
    if (currentIndex < expressions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentAsQuestion: Question | null = currentExp && currentExp.quizQuestion ? {
    form: 3,
    sentence: currentExp.quizQuestion.sentence,
    options: currentExp.quizQuestion.options,
    answer: currentExp.quizQuestion.answer,
    translation: `[${currentExp.expression}] ${currentExp.meaning}`,
    explanation: {
      chunk_pattern: currentExp.expression,
      nuance: currentExp.nuance
    }
  } : null;

  if (!currentExp) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white text-center">
        <div>
          <p className="text-lg font-bold mb-4">학습할 표현이 없습니다.</p>
          <button onClick={onBack} className="px-5 py-2.5 bg-slate-800 rounded-xl">돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full glass-card rounded-[2.5rem] p-5 sm:p-8 relative border border-slate-700/60 shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-5 border-b border-slate-700/60 pb-3.5">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="text-slate-400 hover:text-white font-bold transition-all flex items-center gap-1.5 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>카테고리 선택</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Bookmark Star Button */}
            {onToggleBookmark && currentAsQuestion && (
              <button
                onClick={() => {
                  sound.playStar();
                  onToggleBookmark(currentAsQuestion);
                }}
                className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1 ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300'
                }`}
                title="즐겨찾기"
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            )}

            <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
              {currentIndex + 1} / {expressions.length}
            </span>

            <button
              onClick={() => {
                sound.playClick();
                onStartQuiz();
              }}
              className="text-xs font-black text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1 transition-all active:scale-95"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>실전 퀴즈 풀기</span>
            </button>
          </div>
        </div>

        {/* Category Label */}
        <div className="text-center mb-4">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            {categoryTitle}
          </span>
        </div>

        {/* Main Expression Hero Card */}
        <div className="bg-gradient-to-br from-purple-900/60 via-slate-900/90 to-slate-900/90 rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-xl text-center relative mb-5">
          
          {/* Audio Button */}
          <button
            onClick={() => playAudio(currentExp.expression)}
            className="absolute top-4 right-4 flex items-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 px-3 py-1.5 rounded-full transition-all active:scale-95 text-purple-300 hover:text-white"
            title="원어민 발음 듣기"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-[10px] font-bold">발음</span>
          </button>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 mt-2 font-serif">
            "{currentExp.expression}"
          </h1>

          <div className="inline-block bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 px-4 py-1.5 rounded-2xl text-sm sm:text-base font-black mb-3">
            {currentExp.meaning}
          </div>

          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto">
            {currentExp.nuance}
          </p>
        </div>

        {/* Real Dialogue Card (A & B Roleplay) */}
        {currentExp.dialogue && currentExp.dialogue.length > 0 && (
          <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 mb-5 shadow-inner">
            <div className="flex items-center gap-2 mb-3 text-xs font-black text-indigo-300 uppercase tracking-wider">
              <MessageCircle className="w-4 h-4 text-indigo-400" />
              <span>Real-Life Dialogue (실전 대화 예문)</span>
            </div>

            <div className="space-y-3">
              {currentExp.dialogue.map((d, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl flex items-start gap-3 border ${
                    d.speaker === 'A'
                      ? 'bg-slate-800/70 border-slate-700 text-slate-200'
                      : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 ${
                      d.speaker === 'A' ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {d.speaker}
                  </span>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-xs sm:text-sm leading-snug">
                        {d.en}
                      </p>
                      <button
                        onClick={() => playAudio(d.en)}
                        className="text-slate-400 hover:text-indigo-300 ml-2 p-1 transition-colors"
                        title="대화 문장 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-400 text-[11px] font-medium mt-1">
                      {d.ko}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Expressions */}
        {currentExp.similarExpressions && currentExp.similarExpressions.length > 0 && (
          <div className="bg-slate-800/40 rounded-2xl p-3.5 border border-slate-700/60 mb-5 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-300">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              <span>유사 표현:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentExp.similarExpressions.map((sim, idx) => (
                <span
                  key={idx}
                  className="bg-slate-700/80 text-slate-200 px-2.5 py-0.5 rounded-lg text-xs font-semibold border border-slate-600"
                >
                  {sim}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-1 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 표현</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === expressions.length - 1}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1 active:scale-95"
          >
            <span>다음 표현</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
