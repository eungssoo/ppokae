import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Coins, 
  Play, 
  Sparkles, 
  RefreshCw, 
  Flame, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { QuestionReport, getUserReports, claimReportReward } from '../services/reportService';
import { sound } from '../services/soundService';

interface ReportCenterModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
  onCoinsUpdated: (newCoins: number) => void;
}

export const ReportCenterModal: React.FC<ReportCenterModalProps> = ({
  isOpen,
  userName,
  onClose,
  onCoinsUpdated,
}) => {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const list = await getUserReports(userName);
    setReports(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, userName]);

  if (!isOpen) return null;

  const handleClaim = async (report: QuestionReport) => {
    if (!report.id || !report.auditResult) return;
    sound.playStar();
    const res = await claimReportReward(report.id, userName, report.auditResult.rewardCoins || 50);
    if (res.success && res.newCoins !== undefined) {
      onCoinsUpdated(res.newCoins);
      loadData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-3xl w-full glass-card rounded-[2.5rem] p-5 sm:p-8 border border-purple-500/40 shadow-2xl relative overflow-hidden text-left flex flex-col max-h-[85vh]">
        
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
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-300 border border-rose-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>AI Quality Assurance & Rewards</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            내 문제 오류 제보 내역 & 포상금 수령함 📋
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            제보해주신 오류는 관리자 및 AI 검수팀이 면밀히 심사하며, 심사 채택 완료 시 <strong>🪙 50 코인 포상금</strong>을 즉시 수령하실 수 있습니다.
          </p>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              신고 내역을 불러오는 중...
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
              제보한 문제 내역이 없습니다.<br />
              퀴즈를 풀다가 이상한 문제가 있으면 <strong>[🚨 오류 제보]</strong> 버튼을 눌러주세요!
            </div>
          ) : (
            reports.map(rep => {
              const isExpanded = expandedReportId === rep.id;
              const isApproved = rep.status === 'approved';
              const isRejected = rep.status === 'rejected';
              const isPending = rep.status === 'pending';

              return (
                <div
                  key={rep.id}
                  className={`p-4 rounded-2xl border transition-all text-xs ${
                    isApproved
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : isRejected
                      ? 'bg-slate-900/80 border-slate-800'
                      : 'bg-indigo-950/30 border-indigo-500/40'
                  }`}
                >
                  {/* Status & Action Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isApproved && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>심사 통과 (채택 완료)</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>심사 기각 (기존 문제 유지)</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>야간 AI 심사 대기 중</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{rep.dateStr}</span>
                    </div>

                    {/* Reward Claim Button */}
                    {isApproved && (
                      rep.rewardClaimed ? (
                        <span className="text-[11px] font-black text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                          🪙 50 코인 수령 완료
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaim(rep)}
                          className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-lg text-xs shadow-md active:scale-95 flex items-center gap-1"
                        >
                          <Coins className="w-3.5 h-3.5 text-slate-950" />
                          <span>🪙 50 코인 받기</span>
                        </button>
                      )
                    )}
                  </div>

                  {/* Problem Sentence & Feedback */}
                  <h4 className="text-white font-bold text-sm mb-1">
                    "{rep.questionSentence}"
                  </h4>
                  <p className="text-slate-300 font-medium mb-2">
                    💬 <strong className="text-rose-300">내 제보 의견:</strong> {rep.userFeedback}
                  </p>

                  {/* AI Audit Verdict */}
                  {rep.auditResult && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 mt-2">
                      <div className="flex items-center justify-between text-[11px] font-black text-purple-300 mb-1">
                        <span>🤖 1타 강사 AI 정밀 심사 결과</span>
                        <button
                          onClick={() => setExpandedReportId(isExpanded ? null : (rep.id || null))}
                          className="text-slate-400 hover:text-white flex items-center gap-0.5"
                        >
                          <span>{isExpanded ? '접기' : '자세히 보기'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {rep.auditResult.reason}
                      </p>

                      {isExpanded && rep.auditResult.fixedQuestion && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-[11px]">
                          <span className="text-emerald-400 font-black block mb-1">✨ 자동 교정된 수정본 문항:</span>
                          <p className="text-white font-bold">{rep.auditResult.fixedQuestion.sentence}</p>
                          <p className="text-slate-400">정답: {rep.auditResult.fixedQuestion.answer} ({rep.auditResult.fixedQuestion.translation})</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
