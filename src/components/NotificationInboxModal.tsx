import React from 'react';
import { 
  Bell, 
  X, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Gift,
  Megaphone
} from 'lucide-react';
import { PushAnnouncement, UserProfile } from '../types';
import { sound } from '../services/soundService';

interface NotificationInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: PushAnnouncement[];
  statusMap: Record<string, { isRead: boolean; isClaimed: boolean }>;
  user: UserProfile;
  onClaimReward: (announcement: PushAnnouncement) => void;
}

export const NotificationInboxModal: React.FC<NotificationInboxModalProps> = ({
  isOpen,
  onClose,
  announcements,
  statusMap,
  user,
  onClaimReward
}) => {
  if (!isOpen) return null;

  const BADGE_CONFIG = {
    event: { label: '🎉 이벤트', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
    notice: { label: '📢 공지사항', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    update: { label: '⚡ 업데이트', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    maintenance: { label: '🛠️ 점검 안내', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-[2.5rem] p-5 sm:p-7 max-w-lg w-full relative shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>알림 & 소식 보관함</span>
              </h3>
              <p className="text-xs text-slate-400">
                PPOKAE 최신 공지, 이벤트 및 선물 수령
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Announcements */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 custom-scrollbar relative z-10">
          {announcements.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Megaphone className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-bold">새로운 알림이 없습니다.</p>
              <p className="text-xs">새 소식이 도착하면 이곳에 차곡차곡 보관됩니다.</p>
            </div>
          ) : (
            announcements.map((item) => {
              const badge = BADGE_CONFIG[item.badgeType] || BADGE_CONFIG.notice;
              const status = statusMap[item.id] || { isRead: false, isClaimed: false };
              const hasReward = item.rewardCoins && item.rewardCoins > 0;
              const isClaimed = status.isClaimed;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isClaimed
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                      : 'bg-slate-800/80 border-indigo-500/30 text-slate-100 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white mb-1.5">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3 whitespace-pre-wrap">{item.content}</p>

                  {/* Reward Action Row */}
                  {hasReward && (
                    <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-black">
                        <Gift className="w-3.5 h-3.5" />
                        <span>선물: 🪙 +{item.rewardCoins} 코인</span>
                      </div>

                      {isClaimed ? (
                        <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                          <span>수령 완료</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onClaimReward(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Coins className="w-3.5 h-3.5 fill-slate-950" />
                          <span>🪙 {item.rewardCoins} 코인 받기</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center relative z-10">
          <p className="text-[11px] text-slate-500">
            받으신 코인은 아바타 소환소 및 랭킹전 리벤지에 즉시 사용하실 수 있습니다.
          </p>
        </div>

      </div>
    </div>
  );
};
