import React, { useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import { X, Award, Zap, ShieldCheck, Sparkles } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { recentNotification, dismissNotification, showLevelUp, dismissLevelUp, activeTheme, triggerSound } = useFitness();

  useEffect(() => {
    if (recentNotification) {
      const timer = setTimeout(() => {
        dismissNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recentNotification, dismissNotification]);

  const themeColors = {
    cyan: {
      text: 'text-cyan-400',
      border: 'border-cyan-500/50',
      shadow: 'shadow-neon-cyan',
      bg: 'bg-cyan-500/10',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]'
    },
    purple: {
      text: 'text-purple-400',
      border: 'border-purple-500/50',
      shadow: 'shadow-neon-purple',
      bg: 'bg-purple-500/10',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
    },
    pink: {
      text: 'text-pink-400',
      border: 'border-pink-500/50',
      shadow: 'shadow-neon-pink',
      bg: 'bg-pink-500/10',
      glow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]'
    },
    emerald: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/50',
      shadow: 'shadow-neon-emerald',
      bg: 'bg-emerald-500/10',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]'
    },
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-500/50',
      shadow: 'shadow-neon-amber',
      bg: 'bg-amber-500/10',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]'
    },
  }[activeTheme];

  if (!recentNotification && !showLevelUp) return null;

  return (
    <>
      {/* Dynamic Toast Notification */}
      {recentNotification && (
        <div className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border ${themeColors.border} ${themeColors.bg} p-4 backdrop-blur-xl transition-all duration-500 ease-out transform translate-y-0 ${themeColors.glow}`}>
          <div className="mt-0.5">
            {recentNotification.type === 'achievement' ? (
              <Award className="h-6 w-6 text-yellow-400 animate-bounce" />
            ) : recentNotification.type === 'levelUp' ? (
              <Zap className="h-6 w-6 text-purple-400 animate-pulse" />
            ) : (
              <ShieldCheck className={`h-6 w-6 ${themeColors.text}`} />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">
              {recentNotification.title}
            </h4>
            <p className="mt-1 text-xs text-slate-300">
              {recentNotification.desc}
            </p>
          </div>
          <button
            onClick={dismissNotification}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Cyberpunk Level Up Celebratory Modal Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-purple-500/50 bg-slate-950 p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.4)]">
            {/* Grid lights background */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

            <div className="inline-flex items-center justify-center p-4 rounded-full bg-purple-500/20 border border-purple-400/50 shadow-lg shadow-purple-500/20 mb-6 animate-pulse">
              <Sparkles className="h-12 w-12 text-purple-400" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 uppercase">
              Neural Upgrade Unlocked!
            </h2>
            
            <p className="mt-2 text-sm text-slate-400 uppercase tracking-widest">
              Biometric Synchronicity Completed
            </p>

            <div className="my-8 flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase tracking-wider">Level</div>
                <div className="text-4xl font-bold text-slate-400 line-through">{showLevelUp.oldLevel}</div>
              </div>
              <div className="h-8 w-[2px] bg-slate-800"></div>
              <div className="text-center">
                <div className="text-xs text-purple-400 uppercase tracking-wider font-semibold">New Level</div>
                <div className="text-6xl font-extrabold text-purple-400 text-glow-purple animate-bounce">
                  {showLevelUp.newLevel}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Your physical and digital telemetry nodes have synchronized. You now gain +5% more power output potential, upgraded AI analysis capabilities, and premium routine unlocks!
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => {
                  triggerSound('click');
                  dismissLevelUp();
                }}
                className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/30 transition-all duration-300 uppercase tracking-wider border border-purple-400/20"
              >
                Engage Level {showLevelUp.newLevel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
