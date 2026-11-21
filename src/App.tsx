import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { Onboarding } from './components/Onboarding';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ToastLayer } from './components/ToastLayer';
import { Dashboard } from './components/views/Dashboard';
import { WorkoutTracker } from './components/views/WorkoutTracker';
import { NutritionTracker } from './components/views/NutritionTracker';
import { AICoach } from './components/views/AICoach';
import { BodyProgress } from './components/views/BodyProgress';
import { Analytics } from './components/views/Analytics';
import { Community } from './components/views/Community';
import { Achievements } from './components/views/Achievements';
import { Smarts } from './components/views/Smarts';
import { SettingsView } from './components/views/SettingsView';
import { THEMES } from './theme';
import { Zap } from 'lucide-react';

/* ------------------------------- Splash -------------------------------- */

const Splash: React.FC<{ label?: string }> = ({ label = 'Synchronising telemetry' }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#05050f]">
    <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_60px_-10px_rgba(6,182,212,0.8)]">
      <Zap className="h-7 w-7 animate-pulse text-white" />
    </div>
    <div className="relative text-center">
      <p className="text-sm font-black tracking-tight text-white">
        CYBER<span className="text-cyan-400">NET</span>.FIT
      </p>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-600">{label}…</p>
    </div>
    <div className="relative h-0.5 w-32 overflow-hidden rounded-full bg-white/10">
      <div className="h-full w-1/2 animate-[slideInRight_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
    </div>
  </div>
);

/* ------------------------------ App shell ------------------------------ */

const AppShell: React.FC = () => {
  const { loading, error, activeTab, theme, reducedMotion } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const t = THEMES[theme];

  // Sync theme accent into CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.hex);
    document.documentElement.style.setProperty('--accent-2', t.hex2);
  }, [t.hex, t.hex2]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => window.location.reload(), 250);
  };

  const render = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'workouts':
        return <WorkoutTracker />;
      case 'nutrition':
        return <NutritionTracker />;
      case 'ai-coach':
        return <AICoach />;
      case 'body-progress':
        return <BodyProgress />;
      case 'analytics':
        return <Analytics />;
      case 'community':
        return <Community />;
      case 'achievements':
        return <Achievements />;
      case 'smarts':
        return <Smarts />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) return <Splash />;

  return (
    <div className="relative flex min-h-screen bg-[#05050f] text-slate-200">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-[0.25]" />
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-violet-600/[0.06] blur-[130px]" />
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setSidebarOpen(true)} onRefresh={refresh} refreshing={refreshing} />

        {error && (
          <div className="mx-auto mt-3 w-full max-w-6xl px-4 sm:px-6">
            <div className="rounded-xl border border-red-500/25 bg-red-500/[0.07] px-3 py-2 text-[11px] text-red-200">
              Sync error: {error}
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6">
          <div key={activeTab} className="anim-fade-in">
            {render()}
          </div>
        </main>

        <footer className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-700">
            <span>cybernet.fit · telemetry v3.0</span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-emerald-500" /> supabase online
              <span className="h-1 w-1 rounded-full bg-emerald-500" /> vercel edge
            </span>
          </div>
        </footer>
      </div>

      <ToastLayer />
    </div>
  );
};

/* --------------------------- Gate / routing --------------------------- */

const Root: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile, loading: dataLoading } = useApp();
  const [authView, setAuthView] = useState<'landing' | 'auth'>('landing');

  if (loading) return <Splash label="Establishing secure session" />;

  if (!user) {
    return authView === 'auth' ? (
      <>
        <AuthScreen />
        <button
          onClick={() => setAuthView('landing')}
          className="fixed left-4 top-4 z-50 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 backdrop-blur transition hover:text-white"
        >
          ← Back
        </button>
      </>
    ) : (
      <LandingPage onGetStarted={() => setAuthView('auth')} onSignIn={() => setAuthView('auth')} />
    );
  }

  if (dataLoading && !profile.id) return <Splash />;

  if (!profile.onboardingCompleted) return <Onboarding />;

  return <AppShell />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </AuthProvider>
  );
}
