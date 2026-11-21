import React from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/cn';
import { THEMES } from '../theme';
import { Activity, Bell, Menu, RefreshCw } from 'lucide-react';
import type { Tab } from '../lib/types';

const TITLES: Record<Tab, { title: string; sub: string }> = {
  dashboard: { title: 'Command deck', sub: 'Live telemetry from every module' },
  workouts: { title: 'Workout telemetry', sub: 'Session logging, rest pacing and volume' },
  nutrition: { title: 'Macro synthesizer', sub: 'Intake tracking against derived targets' },
  'ai-coach': { title: 'CyberCoach', sub: 'Reasoning engine grounded in your data' },
  'body-progress': { title: 'Body progress', sub: 'Measurements and visual timeline' },
  analytics: { title: 'Analytics engine', sub: 'Trends, forecasts and distributions' },
  community: { title: 'The grid', sub: 'Signals from other agents' },
  smarts: { title: 'Recovery & rank', sub: 'Readiness, challenges and leaderboard' },
  achievements: { title: 'Achievement matrix', sub: 'Unlockable milestones and rewards' },
  settings: { title: 'Configuration', sub: 'Profile, targets and appearance' },
};

export const TopBar: React.FC<{ onMenu: () => void; onRefresh: () => void; refreshing: boolean }> = ({
  onMenu,
  onRefresh,
  refreshing,
}) => {
  const { activeTab, theme, readiness, toasts, profile } = useApp();
  const t = THEMES[theme];
  const meta = TITLES[activeTab];

  const readinessTone =
    readiness.score >= 85 ? 'text-emerald-400' : readiness.score >= 70 ? 'text-cyan-400' : readiness.score >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#05050f]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onMenu}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold tracking-tight text-white">{meta.title}</h1>
          <p className="hidden truncate text-[11px] text-slate-500 sm:block">{meta.sub}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* readiness chip */}
          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 sm:flex">
            <Activity className={cn('h-3.5 w-3.5', readinessTone)} />
            <div className="leading-none">
              <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">readiness</p>
              <p className={cn('text-[12px] font-bold tabular-nums', readinessTone)}>
                {readiness.score}
                <span className="ml-0.5 text-[9px] font-medium text-slate-600">/100</span>
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Refresh data"
            title="Re-sync from Supabase"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </button>

          <div className="relative hidden sm:block">
            <button
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {toasts.length > 0 && (
                <span className={cn('absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full', t.bg)} />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] py-1 pl-1 pr-2.5">
            <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-[11px] font-black text-white', t.gradient)}>
              {profile.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="hidden leading-none sm:block">
              <p className="max-w-[110px] truncate text-[11px] font-semibold text-white">{profile.name}</p>
              <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">lv {profile.level}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
