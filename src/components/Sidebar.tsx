import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/cn';
import { THEMES } from '../theme';
import { rankTitle } from '../lib/fitness';
import type { Tab } from '../lib/types';
import {
  BarChart3,
  Bot,
  Camera,
  Dumbbell,
  Flame,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
  Trophy,
  Users,
  Utensils,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';

const GROUPS: { label: string; items: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] }[] = [
  {
    label: 'Train',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[17px] w-[17px]" /> },
      { id: 'workouts', label: 'Workouts', icon: <Dumbbell className="h-[17px] w-[17px]" /> },
      { id: 'nutrition', label: 'Nutrition', icon: <Utensils className="h-[17px] w-[17px]" /> },
      { id: 'body-progress', label: 'Body progress', icon: <Camera className="h-[17px] w-[17px]" /> },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'ai-coach', label: 'AI coach', icon: <Bot className="h-[17px] w-[17px]" />, badge: 'AI' },
      { id: 'smarts', label: 'Recovery', icon: <Flame className="h-[17px] w-[17px]" /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-[17px] w-[17px]" /> },
    ],
  },
  {
    label: 'Progress',
    items: [
      { id: 'achievements', label: 'Achievements', icon: <Trophy className="h-[17px] w-[17px]" /> },
      { id: 'community', label: 'Community', icon: <Users className="h-[17px] w-[17px]" /> },
      { id: 'settings', label: 'Settings', icon: <Settings className="h-[17px] w-[17px]" /> },
    ],
  },
];

export const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { profile, activeTab, setActiveTab, theme, levelInfo, achievements, soundEnabled, setSoundEnabled } = useApp();
  const { signOut } = useAuth();
  const t = THEMES[theme];
  const unlocked = achievements.filter((a) => a.unlockedAt).length;

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-white/[0.07] bg-[#07070f]/95 backdrop-blur-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
          <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2.5">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', t.gradient)}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-black leading-tight tracking-tight text-white">
                CYBER<span className={t.text}>NET</span>.FIT
              </p>
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-600">telemetry v3.0</p>
            </div>
          </button>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Agent card */}
        <div className="shrink-0 px-3 py-3">
          <button
            onClick={() => setActiveTab('settings')}
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-black text-white',
                    t.gradient,
                  )}
                >
                  {profile.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#07070f] bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-white">{profile.name}</p>
                <p className={cn('truncate text-[10px] font-medium', t.text)}>
                  Lv {profile.level} · {rankTitle(profile.level)}
                </p>
              </div>
            </div>

            <div className="mt-2.5">
              <div className="flex justify-between font-mono text-[9px] text-slate-500">
                <span>
                  {levelInfo.current} / {levelInfo.need} XP
                </span>
                <span>{Math.round(levelInfo.pct)}%</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-700', t.gradient)}
                  style={{ width: `${levelInfo.pct}%` }}
                />
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-3 border-t border-white/[0.06] pt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400">
                <Flame className="h-3 w-3" /> {profile.streak}d
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                <Trophy className="h-3 w-3" /> {unlocked}/{achievements.length}
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
                <Target className="h-3 w-3" /> {profile.goal.replace('_', ' ')}
              </span>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-none">
          {GROUPS.map((g) => (
            <div key={g.label} className="mb-3">
              <p className="mb-1 px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                {g.label}
              </p>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={cn(
                        'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-all',
                        active
                          ? cn('bg-white/[0.07] text-white', t.glow)
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                      )}
                    >
                      {active && (
                        <span className={cn('absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r', t.bg)} />
                      )}
                      <span className={active ? t.text : 'text-slate-500 group-hover:text-slate-300'}>{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className={cn('rounded px-1 py-px font-mono text-[8px] font-bold uppercase', t.bgSoft, t.text)}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.07] py-2 text-[10px] font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              {soundEnabled ? 'Audio on' : 'Muted'}
            </button>
            <button
              onClick={() => void signOut()}
              title="Sign out"
              className="flex items-center justify-center rounded-lg border border-white/[0.07] px-2.5 py-2 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
