import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, CheckCircle2, Heart, HelpCircle, Bug, Lightbulb } from 'lucide-react';
import { UserProfile } from '../types';
import { submitUserInquiry, INQUIRY_CATEGORIES } from '../services/reportService';
import { sound } from '../services/soundService';
import confetti from 'canvas-confetti';

interface UserInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onShowToast: (title: string, msg: string, type?: 'coin' | 'info' | 'error') => void;
}

export const UserInquiryModal: React.FC<UserInquiryModalProps> = ({
  isOpen,
  onClose,
  user,
  onShowToast
}) => {
  const [category, setCategory] = useState<'idea' | 'bug' | 'question' | 'cheer'>('idea');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    sound.playClick();
    setIsSubmitting(true);

    try {
      const res = await submitUserInquiry(
        user?.name || '익명 학습자',
        category,
        message.trim(),
        email.trim()
      );

      if (res.success) {
        sound.playReward();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        setIsSuccess(true);
        onShowToast("💌 문의 접수 완료", "소중한 의견이 개발자에게 안전하게 전달되었습니다. 감사합니다!");
        setTimeout(() => {
          setIsSuccess(false);
          setMessage('');
          onClose();
        }, 1800);
      } else {
        onShowToast("접수 실패", res.error || "문의를 전달하지 못했습니다.", "error");
      }
    } catch (err: any) {
      onShowToast("오류 발생", err.message || "알 수 없는 오류가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'idea': return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'bug': return <Bug className="w-4 h-4 text-rose-400" />;
      case 'question': return <HelpCircle className="w-4 h-4 text-cyan-400" />;
      case 'cheer': return <Heart className="w-4 h-4 text-pink-400 fill-pink-400/20" />;
      default: return <MessageSquare className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full relative shadow-2xl overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="py-12 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-4xl animate-bounce">
                💌
              </div>
            </div>
            <h3 className="text-2xl font-black text-white">소중한 의견 감사합니다!</h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
              보내주신 피드백을 적극 검토하여 더욱 완벽하고 재미있는 뽀개를 만들어가겠습니다. ✨
            </p>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>유저의 소리함</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <span>💌 개발자에게 문의하기</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1">
                버그 제보, 기능 제안, 응원 메시지 등 무엇이든 편하게 남겨주세요!
              </p>
            </div>

            {/* Category Selection Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                문의 유형 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INQUIRY_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setCategory(cat.id as any);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 active:scale-98 ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">{getCategoryIcon(cat.id)}</span>
                      <div>
                        <span className="text-xs font-black block">{cat.label}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex justify-between">
                <span>내용 입력</span>
                <span className="text-[11px] text-slate-400">{message.length}자</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="내용을 자유롭게 작성해 주세요. (예: 4형식 문제 해설에 직/간목 구분 팁이 더 있었으면 좋겠어요, 다크모드 색상이 예뻐요 등)"
                rows={4}
                required
                className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none shadow-inner"
              />
            </div>

            {/* Contact / Email (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>답변 받을 이메일 or 연락처 <span className="text-slate-500 font-normal">(선택)</span></span>
                {user?.name && <span className="text-[10px] text-indigo-300">작성자: {user.name}</span>}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="답변을 원하시면 이메일을 적어주세요 (선택)"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-all shadow-inner"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-black text-sm sm:text-base shadow-xl shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? '전송하는 중...' : '소중한 의견 보내기'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
