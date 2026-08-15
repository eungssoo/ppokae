import React from 'react';
import { ArrowLeft, Sparkles, BookOpen, PenTool, Plus, Clock, BookMarked } from 'lucide-react';
import { ExpressionCategoryInfo } from '../types';
import { sound } from '../services/soundService';

export const EXPRESSION_CATEGORIES: ExpressionCategoryInfo[] = [
  {
    id: 'daily',
    title: '미드 & 일상 생활 회화',
    subTitle: 'Daily Casual & Idioms',
    icon: '☕',
    badge: 'HOT',
    gradient: 'from-amber-500/20 via-orange-500/10 to-slate-800/80 border-orange-500/40 hover:border-orange-400',
    desc: '원어민들이 넷플릭스 미드와 일상에서 매일 쓰는 생생한 관용구와 슬랭'
  },
  {
    id: 'business',
    title: '비즈니스 & 오피스 영어',
    subTitle: 'Business & Office English',
    icon: '💼',
    badge: 'WORK',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-slate-800/80 border-indigo-500/40 hover:border-indigo-400',
    desc: '외국계 기업, 이메일, 회의, 협상에서 프로페셔널하게 쓰이는 직장인 필수 표현'
  },
  {
    id: 'travel',
    title: '해외여행 & 실전 라이프',
    subTitle: 'Travel & Dining & Shopping',
    icon: '✈️',
    badge: 'TRIP',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-slate-800/80 border-emerald-500/40 hover:border-emerald-400',
    desc: '공항, 호텔, 레스토랑, 택시에서 당황하지 않고 쿨하게 써먹는 여행 영어'
  },
  {
    id: 'pattern',
    title: '원어민 만능 꿀패턴 100',
    subTitle: 'Native Power Patterns',
    icon: '🎬',
    badge: 'BEST',
    gradient: 'from-purple-500/20 via-pink-500/10 to-slate-800/80 border-purple-500/40 hover:border-purple-400',
    desc: '단어만 쏙쏙 바꿔 끼우면 100가지 문장이 술술 나오는 마법의 만능 회화 공식'
  }
];

interface ExpressionSelectViewProps {
  expressionCounts?: Record<string, number>;
  onBack: () => void;
  onSelectCategory: (category: 'daily' | 'business' | 'travel' | 'pattern', mode: 'study' | 'quiz') => void;
  onGenerateExpressions: (category: 'daily' | 'business' | 'travel' | 'pattern') => void;
  cooldownSeconds?: number;
}

export const ExpressionSelectView: React.FC<ExpressionSelectViewProps> = ({
  expressionCounts = {},
  onBack,
  onSelectCategory,
  onGenerateExpressions,
  cooldownSeconds = 0,
}) => {
  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full glass-card rounded-[2.5rem] p-6 sm:p-10 relative border border-slate-700/60 shadow-2xl">
        
        {/* Back Button & Cooldown Badge */}
        <div className="flex justify-between items-center mb-5">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="text-slate-400 hover:text-white font-bold transition-all flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-xl shadow-sm border border-slate-700 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>메인으로</span>
          </button>

          {cooldownSeconds > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>생성 쿨타임: {Math.floor(cooldownSeconds / 60)}분 {cooldownSeconds % 60}초</span>
            </div>
          )}
        </div>

        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>Real Native Expression Lab</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300 tracking-tight pb-1">
            실전 원어민 표현 마스터 🌟
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
            학습 모드를 선택하거나, <strong>AI로 새로운 실전 표현 5개(🪙 50)</strong>를 생성해 보세요!
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXPRESSION_CATEGORIES.map((cat) => {
            const count = expressionCounts[cat.id] ?? 0;

            return (
              <div
                key={cat.id}
                className={`p-5 rounded-3xl border bg-gradient-to-br ${cat.gradient} shadow-lg transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-3xl filter drop-shadow">{cat.icon}</span>
                    <div className="flex items-center gap-1.5">
                      {/* Count Badge */}
                      <span className="bg-purple-500/20 text-purple-200 border border-purple-500/40 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <BookMarked className="w-3 h-3 text-purple-300" />
                        <span>{count}개 보유</span>
                      </span>
                      <span className="bg-white/10 text-white border border-white/20 text-[10px] font-black px-2 py-0.5 rounded-full">
                        {cat.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white mb-0.5">
                    {cat.title}
                  </h3>
                  <p className="text-slate-400 text-[11px] font-semibold mb-2">
                    {cat.subTitle}
                  </p>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectCategory(cat.id, 'study');
                      }}
                      className="py-2.5 px-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>플래시카드</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectCategory(cat.id, 'quiz');
                      }}
                      className="py-2.5 px-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <PenTool className="w-3.5 h-3.5 text-yellow-200" />
                      <span>표현 퀴즈</span>
                    </button>
                  </div>

                  {/* AI Generate 5 Button */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onGenerateExpressions(cat.id);
                    }}
                    className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 hover:text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-300" />
                    <span>새 표현 5개 AI 생성 (🪙 50 소모)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
