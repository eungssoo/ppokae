import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  X, 
  Smartphone, 
  Sparkles, 
  Share, 
  PlusSquare, 
  Zap, 
  CheckCircle2,
  CalendarCheck,
  MoreVertical,
  Compass,
  Monitor
} from 'lucide-react';
import { sound } from '../services/soundService';
import { trackUserAction } from '../services/analyticsService';

interface AddToHomeScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  correctCount?: number;
  totalQuestions?: number;
  earnedCoins?: number;
  earnedXp?: number;
  onAddedSuccess?: () => void;
}

export const AddToHomeScreenModal: React.FC<AddToHomeScreenModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  correctCount = 0,
  totalQuestions = 10,
  earnedCoins = 0,
  earnedXp = 0,
  onAddedSuccess
}) => {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('android');
  const [isStandalone, setIsStandalone] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios');
    } else if (/android/.test(ua)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isInStandalone);

    if (isOpen) {
      trackUserAction('ADD_TO_HOME_MODAL_VIEW', `Device: ${ua.slice(0, 40)}`);
    }
  }, [isOpen]);

  if (!isOpen || isStandalone) return null;

  const handleDismiss = () => {
    sound.playClick();
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    onClose();
  };

  const handleNativeAddToHome = async () => {
    sound.playReward();
    trackUserAction('ADD_TO_HOME_CLICK', deferredPrompt ? 'Native Prompt' : 'Manual Guide Triggered');

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          trackUserAction('ADD_TO_HOME_SUCCESS', 'User Accepted Prompt');
          localStorage.setItem('pwa_installed', 'true');
          sessionStorage.setItem('pwa_prompt_dismissed', 'true');
          if (onAddedSuccess) onAddedSuccess();
          onClose();
        }
      } catch (e) {
        setShowManualGuide(true);
      }
    } else {
      // If browser security blocks direct prompt, smoothly show the visual guide
      setShowManualGuide(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full relative shadow-2xl overflow-hidden text-center">
        
        {/* Ambient Glows */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-amber-400 via-pink-500 to-indigo-600 p-0.5 shadow-xl shadow-purple-500/30 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl sm:text-4xl animate-bounce">
            🪐
          </div>
        </div>

        {/* Result & Habit Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>오늘의 문제 1세트 완료!</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          내일도 1초 만에 복습하기
        </h3>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
          스마트폰 홈 화면에 바로가기를 추가해 두면,<br />
          <strong>매일 1초 만에 주소창 없이 쾌적하게</strong> 영어 실력을 뽀갤 수 있습니다!
        </p>

        {/* 🌟 3가지 특장점 */}
        <div className="grid grid-cols-3 gap-2 mb-5 text-left">
          <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[11px] font-black text-white block">1초 실행</span>
            <span className="text-[9px] text-slate-400">바탕화면 원터치</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <Smartphone className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <span className="text-[11px] font-black text-white block">풀스크린 뷰</span>
            <span className="text-[9px] text-slate-400">주소창 없는 몰입감</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <CalendarCheck className="w-4 h-4 text-pink-400 mx-auto mb-1" />
            <span className="text-[11px] font-black text-white block">매일 복습</span>
            <span className="text-[9px] text-slate-400">연속 학습 유지</span>
          </div>
        </div>

        {/* Interactive Guide by Device */}
        {deviceType === 'ios' ? (
          /* 🍏 iOS Safari 2-Step Visual Guide */
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-pink-500/40 text-left space-y-2.5 shadow-inner mb-4">
            <span className="text-xs font-black text-pink-300 flex items-center gap-1.5">
              <span>🍏 아이폰(iOS Safari) 바로가기 추가 2단계</span>
            </span>
            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-pink-500/30 border border-pink-400 text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                <span>사파리 화면 하단 <strong>공유 아이콘 (<Share className="w-3.5 h-3.5 inline text-pink-300 mx-0.5" />)</strong> 터치</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-pink-500/30 border border-pink-400 text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                <span>아래로 스크롤하여 <strong>[홈 화면에 추가 <PlusSquare className="w-3.5 h-3.5 inline text-pink-300 mx-0.5" />]</strong> 터치</span>
              </div>
            </div>
          </div>
        ) : showManualGuide || !deferredPrompt ? (
          /* 🤖 Android / PC Visual Guide when prompt is unavailable */
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-indigo-500/40 text-left space-y-2.5 shadow-inner mb-4">
            <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
              {deviceType === 'desktop' ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-indigo-300" />
                  <span>🖥️ PC 브라우저 바로가기 추가 방법</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5 text-indigo-300" />
                  <span>🤖 안드로이드/크롬 바로가기 추가 2단계</span>
                </>
              )}
            </span>
            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-400 text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                <span>
                  {deviceType === 'desktop' 
                    ? '상단 주소창 우측의 [앱 설치 ⊕] 아이콘 클릭'
                    : <>브라우저 우측 상단 <strong>메뉴 (<MoreVertical className="w-3.5 h-3.5 inline text-indigo-300 mx-0.5" />)</strong> 터치</>
                  }
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-400 text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                <span><strong>[홈 화면에 추가]</strong> 또는 <strong>[앱으로 추가]</strong> 선택</span>
              </div>
            </div>
          </div>
        ) : (
          /* ⚡ Direct 1-Click Native Add Button */
          <button
            onClick={handleNativeAddToHome}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-black text-sm sm:text-base shadow-xl shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 mb-3"
          >
            <PlusCircle className="w-5 h-5 animate-pulse" />
            <span>✨ 홈 화면에 바로가기 추가 (1초 완성)</span>
          </button>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          className="text-xs text-slate-400 hover:text-slate-200 font-bold py-2 transition-colors"
        >
          다음에 할게요
        </button>

      </div>
    </div>
  );
};
