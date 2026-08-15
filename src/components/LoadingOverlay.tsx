import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  text?: string;
  progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ text = '처리 중...', progress = 0 }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
      <div className="relative flex justify-center items-center">
        <div className="absolute animate-ping w-20 h-20 rounded-full bg-indigo-500/20" />
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin z-10" />
      </div>
      
      <h3 className="font-black text-white mt-6 text-xl tracking-tight text-center">
        {text}
      </h3>
      
      {progress > 0 && (
        <div className="w-full max-w-[240px] bg-slate-800 rounded-full h-2.5 mt-5 overflow-hidden border border-slate-700">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.6)]" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
      <p className="text-slate-400 text-xs mt-3 font-medium">잠시만 기다려 주세요...</p>
    </div>
  );
};
