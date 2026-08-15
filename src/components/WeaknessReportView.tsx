import React from 'react';
import { ArrowLeft, AlertTriangle, ArrowRight, Pill, Sparkles } from 'lucide-react';
import { DifficultyLevel, WeaknessAnalysis } from '../types';
import { DIFFICULTY_LEVELS } from './DifficultySelectView';

interface WeaknessReportViewProps {
  weaknessData: WeaknessAnalysis;
  onBack: () => void;
  onGeneratePrescription: (level: DifficultyLevel) => void;
  isLoading: boolean;
}

export const WeaknessReportView: React.FC<WeaknessReportViewProps> = ({
  weaknessData,
  onBack,
  onGeneratePrescription,
  isLoading,
}) => {
  const hasWeakness = weaknessData && weaknessData.total > 0;

  const sortedForms = hasWeakness
    ? Object.entries(weaknessData.forms).sort((a, b) => b[1] - a[1])
    : [];

  const topWeakForm = sortedForms.length > 0 ? sortedForms[0][0] : null;

  return (
    <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full glass-card rounded-[2.5rem] p-6 sm:p-10 relative border border-slate-700/60 shadow-2xl">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={isLoading}
          className="mb-6 text-slate-400 hover:text-white font-bold transition-all flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-xl shadow-sm border border-slate-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>메인으로</span>
        </button>

        {/* Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-3 bg-rose-500/10 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>AI 정밀 진단</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            약점 정밀 분석 리포트
          </h2>
        </div>

        {/* Content */}
        {!hasWeakness ? (
          <div className="text-center p-10 sm:p-12 bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-700">
            <span className="text-5xl mb-3 block">🎉</span>
            <h3 className="text-xl text-white font-black">아직 틀린 문제가 없습니다!</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-medium leading-relaxed">
              퀴즈를 풀고 오답이 기록되면, AI가 가장 취약한 문법 형식을 분석하고 1:1 맞춤 처방 문제를 조제해 드립니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl text-center">
                <p className="text-xs font-black text-rose-400 uppercase tracking-wider mb-1">
                  누적 오답 수
                </p>
                <p className="text-3xl sm:text-4xl font-black text-rose-200">
                  {weaknessData.total}
                  <span className="text-sm text-rose-400 ml-1">개</span>
                </p>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 p-5 rounded-2xl text-center">
                <p className="text-xs font-black text-orange-400 uppercase tracking-wider mb-1">
                  가장 취약한 문법 구조
                </p>
                <p className="text-3xl sm:text-4xl font-black text-orange-200">
                  {topWeakForm}형식 문장
                </p>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3">
                📊 문장 형식별 오답 분포
              </h4>
              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5].map((formNum) => {
                  const count = weaknessData.forms[formNum] || 0;
                  const percentage = weaknessData.total > 0 ? (count / weaknessData.total) * 100 : 0;
                  return (
                    <div key={formNum} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300 w-12">{formNum}형식</span>
                      <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden border border-slate-600/50">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400 w-8 text-right">{count}개</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prescription Generator Card */}
            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-5 h-5 text-rose-400" />
                <h3 className="font-black text-lg text-white">1:1 맞춤형 처방 조제</h3>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mb-5 leading-relaxed font-medium">
                취약한 <strong className="text-rose-300">{topWeakForm}형식 문법 구조</strong>를 70% 이상 집중적으로 다루는 특별 훈련 문제 40개를 생성하여 <strong>나만의 개인 약점 DB</strong>에 저장합니다.
              </p>

              <div className="flex flex-col gap-3">
                {DIFFICULTY_LEVELS.map((diff) => (
                  <button
                    key={diff.level}
                    onClick={() => onGeneratePrescription(diff)}
                    disabled={isLoading}
                    className="group p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 hover:border-rose-500/50 text-left transition-all flex justify-between items-center active:scale-[0.99]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-rose-200">
                          {diff.label}
                        </h4>
                        <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-2 py-0.5 rounded border border-rose-500/30">
                          개인 DB 저장
                        </span>
                      </div>
                      <p className="text-rose-300/60 font-medium text-xs mt-1">
                        취약 형식 집중 반영 40문제 생성
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-rose-500/20 group-hover:bg-rose-500 text-rose-300 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
