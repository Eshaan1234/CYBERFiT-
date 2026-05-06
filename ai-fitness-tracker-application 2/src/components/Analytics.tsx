import React from 'react';
import { useFitness } from '../context/FitnessContext';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Award, 
  Info 
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { dailyHistory, activeTheme } = useFitness();

  const themeColors = {
    cyan: {
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bgGlow: 'bg-cyan-500/10',
      gradient: 'from-cyan-500 to-blue-600',
      primary: '#06b6d4',
      secondary: '#3b82f6',
      glowShadow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]'
    },
    purple: {
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      bgGlow: 'bg-purple-500/10',
      gradient: 'from-purple-600 to-pink-600',
      primary: '#a855f7',
      secondary: '#ec4899',
      glowShadow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]'
    },
    pink: {
      text: 'text-pink-400',
      border: 'border-pink-500/20',
      bgGlow: 'bg-pink-500/10',
      gradient: 'from-pink-500 to-rose-600',
      primary: '#ec4899',
      secondary: '#f43f5e',
      glowShadow: 'shadow-[0_0_15px_rgba(236,72,153,0.2)]'
    },
    emerald: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bgGlow: 'bg-emerald-500/10',
      gradient: 'from-emerald-500 to-teal-600',
      primary: '#10b981',
      secondary: '#14b8a6',
      glowShadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]'
    },
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      bgGlow: 'bg-amber-500/10',
      gradient: 'from-amber-500 to-orange-600',
      primary: '#f59e0b',
      secondary: '#f97316',
      glowShadow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]'
    }
  }[activeTheme];

  // Prepopulated mock data of strength lift progression
  const strengthData = [
    { date: 'Jan 15', bench: 80, squat: 100, deadlift: 120 },
    { date: 'Jan 30', bench: 82.5, squat: 105, deadlift: 125 },
    { date: 'Feb 10', bench: 85, squat: 110, deadlift: 130 },
    { date: 'Feb 20', bench: 90, squat: 110, deadlift: 135 },
    { date: 'Mar 01', bench: 95, squat: 115, deadlift: 140 },
    { date: 'Mar 05', bench: 100, squat: 120, deadlift: 145 },
  ];

  // Consistency heatmap (31 days mockup of training calendar)
  const heatmapDays = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    // Mocking workouts completed on specific dates
    const trained = [2, 3, 5, 6, 8, 9, 12, 13, 15, 16, 19, 20, 22, 23, 26, 27, 28, 30].includes(dayNum);
    const waterMet = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31].includes(dayNum);
    return { dayNum, trained, waterMet };
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">
          ANALYTICS <span className={themeColors.text}>HUB</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          DIGITAL LIFTING HISTOLOGY • METABOLIC COEFFICIENTS • QUANTUM CONSISTENCY heatmap
        </p>
      </div>

      {/* Strength & Frequency Double Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strength Progression chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className={`h-4.5 w-4.5 ${themeColors.text}`} />
                STRENGTH OVERLOAD PROGRESSION
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">ESTIMATED 1RM LIFT telemetry (KG)</p>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 uppercase">
              COMPOUNDS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthData}>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#02000d', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <Line 
                  type="monotone" 
                  dataKey="bench" 
                  stroke={themeColors.primary} 
                  strokeWidth={2.5}
                  name="Bench Press" 
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="squat" 
                  stroke={themeColors.secondary} 
                  strokeWidth={2.5}
                  name="Back Squat" 
                />
                <Line 
                  type="monotone" 
                  dataKey="deadlift" 
                  stroke="#eab308" 
                  strokeWidth={2.5}
                  name="Deadlift" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workout frequency and energy expenditure */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className={`h-4.5 w-4.5 ${themeColors.text}`} />
                WEEKLY EXPENDITURE PROFILE
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">CALORIC EXPENDITURE VS ACTIVE MINUTES</p>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 uppercase">
              METABOLICS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHistory}>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#02000d', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <Bar dataKey="caloriesBurned" fill={themeColors.primary} name="Kcal Burned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="activeMinutes" fill={themeColors.secondary} name="Active Mins" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* GitHub Commit style gym Heatmap */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className={`h-4.5 w-4.5 ${themeColors.text}`} />
              CONSISTENCY COMMIT GRID
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">31-DAY SENSORY ATTENDANCE & BIOMETRIC TIMELINE</p>
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-slate-900 border border-slate-800"></div>
              <span className="text-slate-400">REST DAY</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-cyan-500/20 border border-cyan-500/30"></div>
              <span className="text-slate-400">HYDRO MET</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-purple-500 border border-purple-400"></div>
              <span className="text-slate-400">GYM SYNCHRONIZED</span>
            </div>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2.5">
          {heatmapDays.map((day) => (
            <div 
              key={day.dayNum} 
              className={`
                aspect-square rounded-lg border flex flex-col items-center justify-center p-2 relative group transition-all duration-300 cursor-help
                ${day.trained
                  ? 'bg-purple-600 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)] text-white'
                  : day.waterMet
                    ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                    : 'bg-slate-900/30 border-slate-850 text-slate-600'
                }
              `}
            >
              <span className="text-xs font-mono font-bold leading-none">{day.dayNum}</span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-950 border border-slate-800 text-white text-[9px] font-mono rounded px-2 py-1.5 whitespace-nowrap z-30 shadow-xl">
                <div>Day {day.dayNum} Telemetry:</div>
                <div className="mt-1 font-bold">
                  {day.trained ? '● GYM SESSION COMPLETED' : '○ REST INTERVAL'}
                </div>
                <div className="text-cyan-400">
                  {day.waterMet ? '● HYDRATION TARGET SECURED' : '○ DEHYDRATION FLUIDS'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl border border-slate-900 bg-slate-950/60 text-xs text-slate-400">
          <Info className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            💡 <strong className="text-white">Machine Consistency:</strong> Your attendance index sits at <strong className="text-white">58% active frequency</strong>. To accelerate muscle hypertrophy coefficients, our AI core suggests scheduling consecutive training days on Day 12-13.
          </p>
        </div>
      </div>

      {/* Muscle Saturation visual panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-4.5 w-4.5 text-yellow-400" />
            MUSCULAR SATURATION METRICS
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Estimates current fiber saturation percentages across key biological kinetic points based on exercise telemetry profiles.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
          <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/80 text-center font-mono">
            <div className="text-[10px] text-slate-500 uppercase leading-none">Pecs/Chest</div>
            <div className="text-lg font-black text-white mt-1.5">92%</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/80 text-center font-mono">
            <div className="text-[10px] text-slate-500 uppercase leading-none">Lats/Back</div>
            <div className="text-lg font-black text-white mt-1.5">85%</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/80 text-center font-mono">
            <div className="text-[10px] text-slate-500 uppercase leading-none">Quads/Legs</div>
            <div className="text-lg font-black text-white mt-1.5">64%</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/80 text-center font-mono">
            <div className="text-[10px] text-slate-500 uppercase leading-none">Delts/Shoulder</div>
            <div className="text-lg font-black text-white mt-1.5">78%</div>
          </div>
        </div>
      </div>

    </div>
  );
};
