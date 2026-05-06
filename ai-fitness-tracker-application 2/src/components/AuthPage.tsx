import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Zap, Eye, EyeOff, Sparkles, Shield, Mail, Lock, User, Scale, Compass } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, activeTheme, triggerSound } = useFitness();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration additional fields (Onboarding integration)
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(180);
  const [goal, setGoal] = useState<'fat_loss' | 'muscle_gain' | 'maintenance' | 'endurance'>('muscle_gain');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const themeText = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  }[activeTheme];

  const themeBgGradient = {
    cyan: 'from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500',
    purple: 'from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500',
    pink: 'from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500',
    emerald: 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500',
    amber: 'from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500',
  }[activeTheme];

  const themeBorder = {
    cyan: 'border-cyan-500/30 focus:border-cyan-400',
    purple: 'border-purple-500/30 focus:border-purple-400',
    pink: 'border-pink-500/30 focus:border-pink-400',
    emerald: 'border-emerald-500/30 focus:border-emerald-400',
    amber: 'border-amber-500/30 focus:border-amber-400',
  }[activeTheme];

  const handleBypassDemo = () => {
    triggerSound('success');
    login('alex.mercer@cybernet.fit', 'Alex Mercer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (!email) {
        alert('Please enter a secure node email address.');
        return;
      }
      login(email, name || 'Alex Mercer');
    } else {
      if (!email || !name) {
        alert('Please compile all authentication details.');
        return;
      }
      register(email, name, {
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        goal,
        experience
      });
    }
  };

  const handleGoogleSignIn = () => {
    triggerSound('success');
    login('matrix.soldier@google.fit', 'Neo Mercer');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#030014] overflow-x-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(3,0,20,0.8)] relative overflow-hidden">
        {/* Neon Light Top Border Accent */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${themeBgGradient}`}></div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${themeBgGradient} shadow-md mb-4`}>
            <Zap className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">
            CYBER<span className={themeText}>FIT</span> PORTAL
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
            {isLogin ? 'Synchronize Biometric Access Node' : 'Register New Biological Entity'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Auth Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 col-span-1 md:col-span-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="agent@cybernet.fit"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-950/70 border ${themeBorder} rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-purple-500/20 transition-all`}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-4">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-slate-950/70 border ${themeBorder} rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-purple-500/20 transition-all`}
                  />
                </div>
              </div>
            )}

            <div className={!isLogin ? "space-y-4" : "space-y-4 col-span-1 md:col-span-2"}>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Access Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-950/70 border ${themeBorder} rounded-xl py-3 pl-10 pr-10 text-white text-sm outline-none focus:ring-1 focus:ring-purple-500/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Registration specific onboarding values */}
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Age (Years)</label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className={`w-full bg-slate-950/70 border ${themeBorder} rounded-xl p-3 text-white text-sm outline-none focus:ring-1 focus:ring-purple-500/20`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Weight (kg)</label>
                  <div className="relative">
                    <Scale className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="number"
                      min="30"
                      max="250"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className={`w-full bg-slate-950/70 border ${themeBorder} rounded-xl p-3 pr-10 text-white text-sm outline-none`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className={`w-full bg-slate-950/70 border ${themeBorder} rounded-xl p-3 text-white text-sm outline-none`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Fitness Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as any)}
                    className={`w-full bg-slate-950 border ${themeBorder} rounded-xl p-3 text-white text-xs outline-none`}
                  >
                    <option value="fat_loss">Fat Loss & Definition</option>
                    <option value="muscle_gain">Hypertrophy (Muscle Gain)</option>
                    <option value="maintenance">Lean Conditioning</option>
                    <option value="endurance">Endurance & Core Speed</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Lifting Experience</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperience(lvl as any)}
                        className={`py-2 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all ${
                          experience === lvl 
                            ? `bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]` 
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r ${themeBgGradient} shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 uppercase tracking-widest border border-white/10`}
          >
            {isLogin ? 'Initialize Uplink' : 'Synthesize New Node'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800/80"></div>
          </div>
          <span className="relative bg-slate-950 px-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Alternative Gateways
          </span>
        </div>

        {/* Third-party Simulated and Demo Bypasses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 py-3 text-slate-300 hover:text-white transition-all text-xs uppercase tracking-widest font-semibold"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google OAuth
          </button>

          <button
            onClick={handleBypassDemo}
            className={`flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 py-3 text-purple-300 font-bold transition-all text-xs uppercase tracking-widest`}
          >
            <Compass className="h-4 w-4 animate-spin-slow" />
            Quick Demo Bypass
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          {isLogin ? (
            <span>
              First time on the platform?{' '}
              <button
                onClick={() => { triggerSound('click'); setIsLogin(false); }}
                className={`${themeText} hover:underline font-mono uppercase tracking-widest`}
              >
                Register Entity
              </button>
            </span>
          ) : (
            <span>
              Already synchronized?{' '}
              <button
                onClick={() => { triggerSound('click'); setIsLogin(true); }}
                className={`${themeText} hover:underline font-mono uppercase tracking-widest`}
              >
                Sync Existing Node
              </button>
            </span>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-4 text-[10px] text-slate-600 font-mono">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>ENCRYPTED LOCAL MEMORY MATRIX</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>SANDBOX GATEWAY READY</span>
          </div>
        </div>

      </div>
    </div>
  );
};
