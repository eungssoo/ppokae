import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, Sparkles, Coins } from 'lucide-react';
import { sound } from '../services/soundService';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'coin';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  coin: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message: string = '', duration: number = 3800) => {
    const id = `${Date.now()}_${Math.random()}`;

    // Play synthesized sound according to type
    if (type === 'success') sound.playCorrect();
    else if (type === 'coin') sound.playCoin();
    else if (type === 'error') sound.playIncorrect();
    else if (type === 'warning') sound.playIncorrect();
    else sound.playClick();

    setToasts(prev => [...prev.slice(-3), { id, type, title, message, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = (title: string, message: string = '') => showToast('success', title, message);
  const error = (title: string, message: string = '') => showToast('error', title, message);
  const warning = (title: string, message: string = '') => showToast('warning', title, message);
  const info = (title: string, message: string = '') => showToast('info', title, message);
  const coin = (title: string, message: string = '') => showToast('coin', title, message);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, coin }}>
      {children}

      {/* Floating Toasts View */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
        {toasts.map(t => {
          let bgClass = 'bg-slate-900/95 border-slate-700 text-white';
          let icon = <Info className="w-5 h-5 text-indigo-400" />;

          if (t.type === 'success') {
            bgClass = 'bg-slate-900/95 border-emerald-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.25)] text-emerald-50';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
          } else if (t.type === 'coin') {
            bgClass = 'bg-slate-900/95 border-amber-500/50 shadow-[0_10px_30px_rgba(245,158,11,0.25)] text-amber-50';
            icon = <Coins className="w-5 h-5 text-yellow-400 flex-shrink-0 animate-bounce" />;
          } else if (t.type === 'warning') {
            bgClass = 'bg-slate-900/95 border-amber-500/50 shadow-[0_10px_30px_rgba(245,158,11,0.25)] text-amber-50';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
          } else if (t.type === 'error') {
            bgClass = 'bg-slate-900/95 border-rose-500/50 shadow-[0_10px_30px_rgba(244,63,94,0.25)] text-rose-50';
            icon = <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all animate-slide-in-down ${bgClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1">
                <h4 className="font-black text-sm leading-tight text-white">{t.title}</h4>
                {t.message && (
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
