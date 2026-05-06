import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  Bot, 
  Camera, 
  BarChart3, 
  Settings, 
  LogOut, 
  Zap, 
  Award,
  Menu,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    activeTheme, 
    logout, 
    triggerSound,
    soundEnabled,
    setSoundEnabled
  } = useFitness();

  const [mobileOpen, setMobileOpen] = useState(false);

  const themeColors = {
    cyan: {
      text: 'text-cyan-400',
      border: 'border-cyan-500/50',
      bgGlow: 'bg-cyan-500/10',
      glowShadow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
      gradient: 'from-cyan-500 to-blue-600',
      indicator: 'bg-cyan-400'
    },
    purple: {
      text: 'text-purple-400',
      border: 'border-purple-500/50',
      bgGlow: 'bg-purple-500/10',
      glowShadow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      gradient: 'from-purple-600 to-pink-600',
      indicator: 'bg-purple-400'
    },
    pink: {
      text: 'text-pink-400',
      border: 'border-pink-500/50',
      bgGlow: 'bg-pink-500/10',
      glowShadow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
      gradient: 'from-pink-500 to-rose-600',
      indicator: 'bg-pink-400'
    },
    emerald: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/50',
      bgGlow: 'bg-emerald-500/10',
      glowShadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      gradient: 'from-emerald-500 to-teal-600',
      indicator: 'bg-emerald-400'
    },
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-500/50',
      bgGlow: 'bg-amber-500/10',
      glowShadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      gradient: 'from-amber-500 to-orange-600',
      indicator: 'bg-amber-400'
    }
  }[activeTheme];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workout Tracker', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition Tracker', icon: Utensils },
    { id: 'ai-coach', label: 'AI Fitness Coach', icon: Bot },
    { id: 'body-progress', label: 'Body Progress', icon: Camera },
    { id: 'analytics', label: 'Analytics Hub', icon: BarChart3 },
    { id: 'settings', label: 'Profile Settings', icon: Settings },
  ];

  const xpNeeded = user.level * 1000;
  const xpPercent = Math.min(100, Math.round((user.xp / xpNeeded) * 100));

  const handleTabClick = (tabId: string) => {
    triggerSound('click');
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const toggleSound = () => {
    triggerSound('click');
    setSoundEnabled(!soundEnabled);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-900 bg-[#030014]/90 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${themeColors.gradient}`}>
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-black tracking-wider text-white">
            CYBER<span className={themeColors.text}>FIT</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg border border-slate-800 bg-slate-950/40"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg border border-slate-800 bg-slate-950/40"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop and Mobile overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-900/80 bg-[#030014]/95 p-6 backdrop-blur-xl transition-all duration-300 md:sticky md:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="mb-8 hidden md:flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${themeColors.gradient} shadow-md`}>
            <Zap className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-widest text-white leading-none">
              CYBER<span className={themeColors.text}>FIT</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-500 mt-1 uppercase">SaaS Bio-Link</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 group
                  ${isActive 
                    ? `text-white ${themeColors.bgGlow} border border-slate-800 ${themeColors.glowShadow}` 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }
                `}
              >
                {isActive && (
                  <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md ${themeColors.indicator}`}></div>
                )}
                <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 duration-300 ${isActive ? themeColors.text : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Metrics & Level Info */}
        <div className="mt-auto pt-6 border-t border-slate-900/80">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 relative overflow-hidden">
            
            {/* Sound Toggle - Desktop only */}
            <button
              onClick={toggleSound}
              className="absolute top-2 right-2 hidden md:block text-slate-500 hover:text-white transition-colors"
              title={soundEnabled ? "Mute Web Audio" : "Unmute Web Audio"}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 text-red-400" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Award className="h-5 w-5 text-glow-purple" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase truncate max-w-[130px]">{user.name}</h4>
                <p className="text-[10px] font-mono text-purple-400">LEVEL {user.level} AGENT</p>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-1">
                <span>XP PROGRESS ({xpPercent}%)</span>
                <span>{user.xp}/{xpNeeded}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${themeColors.gradient} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${xpPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono border-t border-slate-900 pt-2.5 text-slate-400">
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
                STREAK
              </span>
              <span className="font-bold text-yellow-400 text-glow-yellow">{user.streak} DAYS ACTIVE</span>
            </div>
          </div>

          <button
            onClick={() => { triggerSound('click'); logout(); }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-950/20 py-2.5 text-xs font-mono font-bold text-slate-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            DISCONNECT LINK
          </button>
        </div>
      </aside>

      {/* Overlay Backdrop for Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}
    </>
  );
};
