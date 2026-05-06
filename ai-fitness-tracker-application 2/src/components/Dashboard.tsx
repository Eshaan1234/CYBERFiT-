import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { 
  Flame, 
  Droplet, 
  Zap, 
  Utensils, 
  Clock, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Quote, 
  Compass,
  Sparkles,
  Plus,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    dailyHistory, 
    mealLogs, 
    workoutSessions, 
    addWater, 
    addXP, 
    activeTheme, 
    triggerSound,
    achievements
  } = useFitness();

  const [customGoal, setCustomGoal] = useState('');
  const [goals, setGoals] = useState<Array<{ id: string, text: string, completed: boolean, xp: number }>>([
    { id: 'g1', text: `Log ${user.targetProtein}g Protein Threshold`, completed: false, xp: 80 },
    { id: 'g2', text: 'Initiate smart rest timer on heavy sets', completed: false, xp: 50 },
    { id: 'g3', text: 'Surpass today\'s water target', completed: false, xp: 60 },
    { id: 'g4', text: 'Inquire AI coach about leg hyper-growth', completed: false, xp: 40 },
  ]);

  const [quoteIndex, setQuoteIndex] = useState(0);

  const cyberQuotes = [
    { text: "Your body is a bio-mechanical construct. Feed it precision macros. Engineer its limits.", author: "CyberCoach AI v2.9" },
    { text: "Pain is localized hardware feedback. Re-program through progressive overload.", author: "Neural Core Protocol" },
    { text: "Hydration maintains structural coolant efficacy. Sync another water node.", author: "Biometric Telemetry Division" },
    { text: "The difference between human and machine is consistency. Power on. Never stand idle.", author: "Synthesized Muscle Lab" },
    { text: "Hypertrophy is code compiled in the gym and executed during 8 hours of deep sleep sleep cycles.", author: "Alex Mercer, Level 4 Agent" }
  ];

  const themeColors = {
    cyan: {
      text: 'text-cyan-400',
      textGlow: 'text-glow-cyan',
      border: 'border-cyan-500/20',
      borderFocus: 'border-cyan-400',
      bgGlow: 'bg-cyan-500/5',
      gradient: 'from-cyan-500 to-blue-600',
      chartColor: '#06b6d4',
      badge: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
    },
    purple: {
      text: 'text-purple-400',
      textGlow: 'text-glow-purple',
      border: 'border-purple-500/20',
      borderFocus: 'border-purple-400',
      bgGlow: 'bg-purple-500/5',
      gradient: 'from-purple-600 to-pink-600',
      chartColor: '#a855f7',
      badge: 'bg-purple-400/10 text-purple-400 border-purple-400/20'
    },
    pink: {
      text: 'text-pink-400',
      textGlow: 'text-glow-pink',
      border: 'border-pink-500/20',
      borderFocus: 'border-pink-400',
      bgGlow: 'bg-pink-500/5',
      gradient: 'from-pink-500 to-rose-600',
      chartColor: '#ec4899',
      badge: 'bg-pink-400/10 text-pink-400 border-pink-400/20'
    },
    emerald: {
      text: 'text-emerald-400',
      textGlow: 'text-glow-emerald',
      border: 'border-emerald-500/20',
      borderFocus: 'border-emerald-400',
      bgGlow: 'bg-emerald-500/5',
      gradient: 'from-emerald-500 to-teal-600',
      chartColor: '#10b981',
      badge: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
    },
    amber: {
      text: 'text-amber-400',
      textGlow: 'text-glow-amber',
      border: 'border-amber-500/20',
      borderFocus: 'border-amber-400',
      bgGlow: 'bg-amber-500/5',
      gradient: 'from-amber-500 to-orange-600',
      chartColor: '#f59e0b',
      badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    }
  }[activeTheme];

  // Calculate calories and macros today
  const todayMeals = mealLogs;
  const caloriesConsumed = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const proteinConsumed = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const carbsConsumed = todayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const fatsConsumed = todayMeals.reduce((sum, m) => sum + m.fats, 0);

  // Today's water from history
  const todayStr = new Date().toISOString().split('T')[0];
  const todayHistoryLog = dailyHistory.find(h => h.date === todayStr);
  const waterIntake = todayHistoryLog ? todayHistoryLog.water : 0;
  const caloriesBurned = todayHistoryLog ? todayHistoryLog.caloriesBurned : 480; // default/simulated
  const activeMinutes = todayHistoryLog ? todayHistoryLog.activeMinutes : 45; // default/simulated

  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / user.targetCalories) * 100));
  const waterPercent = Math.min(100, Math.round((waterIntake / user.targetWater) * 100));
  const proteinPercent = Math.min(100, Math.round((proteinConsumed / user.targetProtein) * 100));

  const handleWaterAdd = (amount: number) => {
    addWater(amount);
  };

  const handleGoalComplete = (id: string, isCompletedNow: boolean) => {
    triggerSound('success');
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        if (!g.completed && isCompletedNow) {
          addXP(g.xp);
        }
        return { ...g, completed: isCompletedNow };
      }
      return g;
    }));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    triggerSound('click');
    setGoals(prev => [
      ...prev,
      {
        id: 'cg_' + Date.now(),
        text: customGoal,
        completed: false,
        xp: 50
      }
    ]);
    setCustomGoal('');
  };

  const rotateQuote = () => {
    triggerSound('click');
    setQuoteIndex(prev => (prev + 1) % cyberQuotes.length);
  };

  const recentAchievements = achievements.filter(a => a.unlockedAt !== null).slice(-3);

  return (
    <div className="space-y-6">
      {/* Upper Status Row with Greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">
            OPERATIONS <span className={themeColors.text}>DASHBOARD</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            BIOMETRIC NODE: <span className="text-slate-300">ACTIVE_LINK_NODE_099</span> • LAST_SYNC_CYCLE: SECONDS AGO
          </p>
        </div>

        {/* Dynamic streak indicator button */}
        <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
          <Zap className="h-4.5 w-4.5 animate-pulse text-yellow-400" />
          <div className="text-left">
            <div className="text-[9px] font-mono leading-none text-yellow-400/70">NEURAL STREAK</div>
            <div className="text-sm font-bold leading-none mt-1">{user.streak} DAYS ACTIVE</div>
          </div>
        </div>
      </div>

      {/* Primary Row: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Consumed Calories */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-36 group hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">CALORIES INGESTED</span>
            <div className={`h-8 w-8 rounded-lg ${themeColors.bgGlow} flex items-center justify-center text-glow-purple border border-slate-800`}>
              <Utensils className={`h-4 w-4 ${themeColors.text}`} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{caloriesConsumed} <span className="text-xs text-slate-500 font-medium font-sans">/ {user.targetCalories} kcal</span></div>
            <div className="mt-2 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${themeColors.gradient} rounded-full`} style={{ width: `${caloriePercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Burned Calories */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-36 group hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">THERMIC DISSIPATION</span>
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-slate-800">
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{caloriesBurned} <span className="text-xs text-slate-500 font-medium font-sans">kcal</span></div>
            <p className="text-[10px] text-orange-400 font-mono mt-2 flex items-center gap-1">
              <span>▲ OPTIMIZED HYPERTROPHY METRIC</span>
            </p>
          </div>
        </div>

        {/* Card 3: Water Hydration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-36 group hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">BIO-COOLANT INFLOW</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-slate-800">
              <Droplet className="h-4 w-4 text-cyan-400 animate-bounce" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{waterIntake} <span className="text-xs text-slate-500 font-medium font-sans">/ {user.targetWater} ml</span></div>
            <div className="mt-2 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${waterPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 4: Active Pacing */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-36 group hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">CO-TRAINING TIMERS</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-slate-800">
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{activeMinutes} <span className="text-xs text-slate-500 font-medium font-sans">Mins</span></div>
            <p className="text-[10px] text-purple-400 font-mono mt-2">
              <span>ACTIVE IN {workoutSessions.length} TRACKED ROUTINES</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical Chart & Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytical Weekly Telemetry Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className={`h-4 w-4 ${themeColors.text}`} />
                WEEKLY EXPENDITURE PROFILE
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">ENERGY CONVERSION EFFICIENCY INDEX</p>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-semibold uppercase border ${themeColors.badge}`}>
              BIO-SENSOR V2
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyHistory}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeColors.chartColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={themeColors.chartColor} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#02000d', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="caloriesBurned" 
                  stroke={themeColors.chartColor} 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorCalories)" 
                  name="Burned (Kcal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tactical Nutrition / Hydration Integrator */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Droplet className="h-4.5 w-4.5 text-cyan-400" />
              FLUID RESONANCE SYSTEM
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Synthesize your hydration levels instantly. Every 250ml injection maintains bio-coolant parameters and earns +15 XP.
            </p>

            {/* Glowing Water Cylinder Graphic */}
            <div className="relative h-28 w-24 mx-auto border-2 border-cyan-500/20 rounded-b-2xl rounded-t-lg bg-slate-950 overflow-hidden flex items-end shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
              {/* Measurement ticks */}
              <div className="absolute inset-y-0 right-1.5 flex flex-col justify-between text-[8px] font-mono text-cyan-500/50 py-1">
                <span>3L</span>
                <span>2L</span>
                <span>1L</span>
                <span>0L</span>
              </div>

              {/* Glowing Water Inflow */}
              <div 
                className="w-full bg-gradient-to-t from-cyan-600/60 to-cyan-400/80 transition-all duration-1000 shadow-[0_0_20px_rgba(6,182,212,0.4)] relative"
                style={{ height: `${waterPercent}%` }}
              >
                {/* Rippling top effect */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 animate-pulse"></div>
              </div>

              {/* Live percent text */}
              <div className="absolute inset-0 flex items-center justify-center font-black font-mono text-xs text-white text-glow-cyan">
                {waterPercent}%
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleWaterAdd(250)}
                className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Plus className="h-4.5 w-4.5" /> +250ml
              </button>
              <button
                onClick={() => handleWaterAdd(500)}
                className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs uppercase tracking-wider transition-all animate-pulse"
              >
                <Plus className="h-4.5 w-4.5" /> +500ml
              </button>
            </div>
            <button
              onClick={() => handleWaterAdd(1000)}
              className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-[10px] font-mono text-slate-400 hover:text-white transition-all uppercase tracking-widest"
            >
              Log Hydro Bottle (+1.0L)
            </button>
          </div>
        </div>

      </div>

      {/* Row 3: Active Goals & Mini Trophies & Quotes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Checklist Goals */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className={`h-4.5 w-4.5 ${themeColors.text}`} />
              DAILY OBJECTIVES
            </h3>
            <span className="text-[10px] font-mono text-slate-500">COMPLETE FOR XP</span>
          </div>

          <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Inject new task profile..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              className={`p-2.5 rounded-xl bg-gradient-to-r ${themeColors.gradient} text-white hover:scale-105 active:scale-95 transition-all`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {goals.map((g) => (
              <div 
                key={g.id} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  g.completed 
                    ? 'border-slate-800/40 bg-slate-900/10 opacity-50' 
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={g.completed}
                    onChange={(e) => handleGoalComplete(g.id, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 accent-purple-500 cursor-pointer"
                  />
                  <span className={`text-xs ${g.completed ? 'line-through text-slate-500' : 'text-slate-300 font-medium'}`}>
                    {g.text}
                  </span>
                </div>
                {!g.completed && (
                  <span className="text-[9px] font-mono font-bold text-purple-400 uppercase">+{g.xp} XP</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Rotating Quote Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-2 right-2 text-slate-800">
            <Quote className="h-20 w-20 transform translate-x-4 -translate-y-4 opacity-10" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <Quote className={`h-4.5 w-4.5 ${themeColors.text}`} />
              NEURAL INSPIRATION
            </h3>
            
            <p className="text-xs text-slate-300 italic leading-relaxed font-medium">
              "{cyberQuotes[quoteIndex].text}"
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4">
            <span className="text-[10px] font-mono text-purple-400">
              — {cyberQuotes[quoteIndex].author}
            </span>
            <button
              onClick={rotateQuote}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
              title="Next Signal"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Trophies Display */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <Award className={`h-4.5 w-4.5 ${themeColors.text}`} />
              RECENT SYNCED BADGES
            </h3>

            <div className="space-y-2">
              {recentAchievements.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No trophy logs synchronized. Start training node to log.
                </div>
              ) : (
                recentAchievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-900 bg-slate-950/80">
                    <div className="h-8 w-8 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-sm">
                      ✨
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{ach.title}</h4>
                      <p className="text-[9px] text-slate-400 font-mono">UNLOCKED: SUCCESS</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 text-center mt-4">
            <p className="text-[10px] font-mono text-slate-500 uppercase flex items-center justify-center gap-1">
              <Compass className="h-3.5 w-3.5 animate-spin-slow" />
              BIOPHYSICAL POTENTIAL SECURED
            </p>
          </div>
        </div>

      </div>

      {/* Live Macros Visualizer Ring section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-6">
          <Sparkles className="h-4.5 w-4.5 text-purple-400 animate-pulse" />
          MACRONUTRIENT BALANCE TELEMETRY
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Protein */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/80 p-4 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-purple-500/20 text-purple-400 font-mono font-bold text-sm mb-3">
              {proteinPercent}%
            </div>
            <h4 className="text-xs font-bold text-white uppercase">HYPERTROPHY PROTEIN</h4>
            <p className="text-lg font-black text-purple-400 mt-1">{proteinConsumed}g <span className="text-xs text-slate-500">/ {user.targetProtein}g</span></p>
            <div className="mt-2 h-1 w-20 mx-auto bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${proteinPercent}%` }}></div>
            </div>
          </div>

          {/* Carbs */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/80 p-4 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-500/20 text-cyan-400 font-mono font-bold text-sm mb-3">
              {Math.min(100, Math.round((carbsConsumed / user.targetCarbs) * 100))}%
            </div>
            <h4 className="text-xs font-bold text-white uppercase">GLYCOGEN CARBS</h4>
            <p className="text-lg font-black text-cyan-400 mt-1">{carbsConsumed}g <span className="text-xs text-slate-500">/ {user.targetCarbs}g</span></p>
            <div className="mt-2 h-1 w-20 mx-auto bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(100, Math.round((carbsConsumed / user.targetCarbs) * 100))}%` }}></div>
            </div>
          </div>

          {/* Fats */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/80 p-4 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-pink-500/20 text-pink-400 font-mono font-bold text-sm mb-3">
              {Math.min(100, Math.round((fatsConsumed / user.targetFats) * 100))}%
            </div>
            <h4 className="text-xs font-bold text-white uppercase">CELLULAR LIPID FATS</h4>
            <p className="text-lg font-black text-pink-400 mt-1">{fatsConsumed}g <span className="text-xs text-slate-500">/ {user.targetFats}g</span></p>
            <div className="mt-2 h-1 w-20 mx-auto bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${Math.min(100, Math.round((fatsConsumed / user.targetFats) * 100))}%` }}></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
