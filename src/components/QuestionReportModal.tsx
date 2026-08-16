import React, { useState } from 'react';
import { AlertTriangle, X, Send, Sparkles, CheckCircle2, ShieldAlert, Coins } from 'lucide-react';
import { Question } from '../types';
import { submitQuestionReport } from '../services/reportService';
import { sound } from '../services/soundService';
import { useLanguage } from '../services/i18n';

interface QuestionReportModalProps {
  isOpen: boolean;
  question: Question;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuestionReportModal: React.FC<QuestionReportModalProps> = ({
  isOpen,
  question,
  userName,
  onClose,
  onSuccess,
}) => {
  const { language, t } = useLanguage();
  const [reportType, setReportType] = useState<'wrong_answer' | 'awkward_explanation' | 'typo' | 'translation_error' | 'other'>('wrong_answer');
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!feedback.trim()) {
      setErrorMsg(language === 'en' ? 'Please provide detailed report feedback.' : '상세 제보 내용을 작성해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await submitQuestionReport(userName, question, reportType, feedback.trim());
    setIsSubmitting(false);

    if (res.success) {
      sound.playStar();
      onSuccess();
    } else {
      setErrorMsg(res.error || (language === 'en' ? 'An error occurred while submitting report.' : '신고 접수 중 오류가 발생했습니다.'));
    }
  };

  const REPORT_TYPES = language === 'en' ? [
    { id: 'wrong_answer', label: '❌ Incorrect Answer/Option' },
    { id: 'awkward_explanation', label: '📖 Unclear/Awkward Explanation' },
    { id: 'typo', label: '✏️ Typo/Spelling Issue' },
    { id: 'translation_error', label: '🌐 Translation/Nuance Issue' },
  ] : [
    { id: 'wrong_answer', label: '❌ 정답/보기 오류' },
    { id: 'awkward_explanation', label: '📖 해설 어색/부족' },
    { id: 'typo', label: '✏️ 철자/오탈자' },
    { id: 'translation_error', label: '🌐 해석/뉘앙스 오류' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-lg w-full glass-card rounded-[2.5rem] p-5 sm:p-7 border border-rose-500/40 shadow-2xl relative overflow-hidden text-left">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-all border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-inner">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              {language === 'en' ? 'Report Question & Request AI Audit 🚨' : '문제 오류 제보 & AI 검수 요청 🚨'}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {language === 'en' ? 'Get 🪙 +50 Coins reward if approved! (Max 10 per day)' : '채택 시 🪙 +50 코인 보상금이 지급됩니다! (일일 최대 10건)'}
            </p>
          </div>
        </div>

        {/* Question Snapshot Box */}
        <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 mb-4 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-bold mb-1.5">
            <span className="text-purple-300 font-black">{language === 'en' ? `Form ${question.form}` : `문항 #${question.form}형식`}</span>
            <span className="text-emerald-400 font-black">{language === 'en' ? `Answer: ${question.answer}` : `정답: ${question.answer}`}</span>
          </div>
          <p className="text-white font-bold text-sm mb-1">{question.sentence}</p>
          {language === 'ko' && <p className="text-slate-400">{question.translation}</p>}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Report Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {language === 'en' ? 'Select Issue Type' : '제보 유형 선택'}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {REPORT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setReportType(t.id as any)}
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-center transition-all ${
                    reportType === t.id
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-200 shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {language === 'en' ? 'Detailed Feedback & Suggested Correction ' : '상세 의견 및 수정 제안 '}<span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={language === 'en' ? 'Explain what is wrong and what the correct grammar/answer should be...' : '예: 보기 2번이 문법적으로 맞는 이유나 번역이 어색한 부분을 구체적으로 적어주세요.'}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 transition-all resize-none"
              maxLength={400}
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all active:scale-95"
            >
              {language === 'en' ? 'Cancel' : '취소'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim()}
              className="flex-[2] py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white rounded-xl font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (language === 'en' ? 'Submitting...' : '제보 접수 중...') : (language === 'en' ? 'Submit Report (Earn 🪙 50)' : '제보하고 포상금 받기')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
