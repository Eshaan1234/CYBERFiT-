import React from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/cn';
import { THEMES } from '../theme';
import { AlertTriangle, Info, Sparkles, Trophy, X } from 'lucide-react';

export const ToastLayer: React.FC = () => {
  const { toasts, dismissToast, theme } = useApp();
  const t = THEMES[theme];

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => {
        const config = {
          info: { icon: <Info className="h-4 w-4" />, tone: 'text-cyan-400', ring: 'border-cyan-500/25' },
          achievement: { icon: <Trophy className="h-4 w-4" />, tone: 'text-amber-400', ring: 'border-amber-500/25' },
          levelUp: { icon: <Sparkles className="h-4 w-4" />, tone: 'text-violet-400', ring: 'border-violet-500/25' },
          error: { icon: <AlertTriangle className="h-4 w-4" />, tone: 'text-red-400', ring: 'border-red-500/25' },
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto overflow-hidden rounded-xl border bg-[#0b0b16]/95 backdrop-blur-xl',
              'shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] anim-slide-up',
              config.ring,
            )}
          >
            <div className="flex items-start gap-3 p-3">
              <div className={cn('mt-0.5 shrink-0', config.tone)}>{config.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-white">{toast.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{toast.desc}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 rounded p-1 text-slate-600 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className={cn('h-0.5 w-full origin-left bg-gradient-to-r', t.gradient, 'anim-[shrink_5.2s_linear_forwards]')}
              style={{ animation: 'shrink 5.2s linear forwards' }}
            />
          </div>
        );
      })}
      <style>{`@keyframes shrink { from { transform: scaleX(1) } to { transform: scaleX(0) } }`}</style>
    </div>
  );
};
