import React from 'react';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { Sidebar } from './components/Sidebar';
import { NotificationToast } from './components/NotificationToast';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { WorkoutTracker } from './components/WorkoutTracker';
import { NutritionTracker } from './components/NutritionTracker';
import { AICoach } from './components/AICoach';
import { BodyProgress } from './components/BodyProgress';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';

// Inner App Controller that accesses the context state
const AppContent: React.FC = () => {
  const { isLoggedIn, onboardingCompleted, activeTab, activeTheme } = useFitness();

  // If user is not logged in, render the main Landing Page
  if (!isLoggedIn) {
    return (
      <>
        <LandingPage />
        <NotificationToast />
      </>
    );
  }

  // If user is logged in but onboarding is not complete, show Auth Onboarding
  if (!onboardingCompleted) {
    return (
      <>
        <AuthPage />
        <NotificationToast />
      </>
    );
  }

  // Choose component to render based on active tab
  const renderActiveTab = () => {
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
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const themeColors = {
    cyan: 'border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.02)]',
    purple: 'border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.02)]',
    pink: 'border-pink-500/20 shadow-[0_0_50px_rgba(236,72,153,0.02)]',
    emerald: 'border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.02)]',
    amber: 'border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.02)]'
  }[activeTheme];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#030014] text-slate-100 overflow-x-hidden antialiased">
      
      {/* Background Cybernetic Dot Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
      
      {/* Background radial soft high-tech gradients */}
      <div className="absolute top-1/4 left-1/4 -z-20 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-20 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]"></div>

      {/* Main Sidebar Layout Navigation */}
      <Sidebar />

      {/* Content area panel */}
      <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 md:p-8 lg:p-10">
        
        {/* Decorative dynamic top portal bar */}
        <div className={`hidden md:flex items-center justify-between mb-6 p-4 rounded-2xl border ${themeColors} bg-slate-950/20 backdrop-blur-md`}>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>SECURE NEURAL PORTAL COMPILATION v2.9</span>
            <span>•</span>
            <span className="text-slate-500">SANDBOX_MODE_ENABLED</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span>UPLINK_STABILITY: 100%</span>
            <span>•</span>
            <span>PING: 14MS</span>
          </div>
        </div>

        {/* Master mounted viewport with slide/fade container */}
        <div className="relative animate-[fadeIn_0.5s_ease-out]">
          {renderActiveTab()}
        </div>

      </main>

      {/* Floating System Notifications Overlay */}
      <NotificationToast />

    </div>
  );
};

// Main App component that wraps AppContent with FitnessProvider
export default function App() {
  return (
    <FitnessProvider>
      <AppContent />
    </FitnessProvider>
  );
}
