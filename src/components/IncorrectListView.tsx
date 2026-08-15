import React from 'react';
import { ArrowLeft, ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WeaknessRecord } from '../types';

interface IncorrectListViewProps {
  incorrectList: WeaknessRecord[];
  onBack: () => void;
}

export const IncorrectListView: React.FC<IncorrectListViewProps> = ({
  incorrectList,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-animated-gradient flex justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl w-full">
        
        {/* Sticky Header */}
        <header className="flex justify-between items-center glass-card p-4 sm:p-5 rounded-[2rem] border border-slate-700/80 mb-6 sticky top-4 z-20 shadow-lg">
          <button
            onClick={onBack}
            className="text-slate-400 font-bold hover:bg-slate-800 hover:text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>메인으로</span>
          </button>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              내 오답 노트
            </h1>
          </div>
        </header>

        {/* List Content */}
        {incorrectList.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] p-12 text-center border border-slate-700/60 shadow-xl">
            <span className="text-5xl mb-3 block">🎉</span>
            <h3 className="font-extrabold text-xl text-white">오답 기록이 없습니다!</h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              틀린 문제들이 여기에 자동으로 모여 복습할 수 있게 정리됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incorrectList.map((q, i) => (
              <div
                key={q.id || i}
                className="glass-card rounded-[2rem] p-5 sm:p-7 border border-slate-700/80 shadow-md hover:border-slate-600 transition-all"
              >
                {/* Sentence & Date */}
                <div className="flex justify-between items-start mb-4 gap-4 border-b border-slate-700/60 pb-3.5">
                  <p className="font-bold text-base sm:text-lg text-white leading-relaxed font-serif">
                    {q.sentence.replace(/_{2,}/, `[ ${q.correctAnswer} ]`)}
                  </p>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 whitespace-nowrap">
                    {q.date || '기록'}
                  </span>
                </div>

                {/* Wrong Answer vs Correct Answer comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                    <span className="block text-[10px] font-black text-rose-400 uppercase tracking-wider mb-1">
                      내가 고른 오답
                    </span>
                    <span className="text-slate-400 line-through font-bold text-base">
                      {q.wrongAnswer}
                    </span>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-1">
                      올바른 정답
                    </span>
                    <span className="font-black text-emerald-300 text-lg">
                      {q.correctAnswer}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-lg border border-slate-700">
                    {q.difficulty}
                  </span>
                  <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-lg border border-indigo-500/30">
                    {q.form}형식
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
