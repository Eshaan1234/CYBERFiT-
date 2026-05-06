import React from 'react';
import { useFitness } from '../context/FitnessContext';
import { 
  Zap, 
  Bot, 
  Activity, 
  Utensils, 
  Award, 
  TrendingUp, 
  Shield, 
  Play, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login, activeTheme, triggerSound } = useFitness();

  const handleLaunchDemo = () => {
    triggerSound('success');
    login('alex.mercer@cybernet.fit', 'Alex Mercer');
  };

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

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030014] text-slate-100">
      {/* Background Neon Spotlights */}
      <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]"></div>
      <div className="absolute top-1/3 right-1/4 -z-10 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-10 left-1/3 -z-10 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px]"></div>

      {/* Modern Top Header / Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-900 bg-[#030014]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${themeBgGradient} shadow-md`}>
              <Zap className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-extrabold tracking-wider text-white">
              CYBER<span className={themeText}>NET</span>.FIT
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Neural Features</a>
            <a href="#analytics" className="hover:text-white transition-colors">Engine Diagnostics</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Success Telemetry</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing Nodes</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleLaunchDemo}
              className={`hidden sm:inline-flex items-center gap-1 text-sm font-semibold transition-colors ${themeText}`}
            >
              Sign In
            </button>
            <button
              onClick={handleLaunchDemo}
              className={`relative px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r ${themeBgGradient} shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-widest border border-white/10`}
            >
              Initialize Node
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 md:pt-28 md:pb-36">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/5 px-4 py-1.5 text-xs text-purple-300 backdrop-blur-md mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI ENGINE V2.9 ONLINE & OPTIMIZED</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            THE NEURAL ARCHITECT FOR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
              YOUR BIOPHYSICAL EVOLUTION
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base text-slate-400 sm:text-xl leading-relaxed">
            Stop guessing. CyberNet.Fit synthesizes deep machine learning, telemetry gamification, real-time rest pacing, and macronutrient logging to build your ultimate custom physique.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleLaunchDemo}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r ${themeBgGradient} shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest`}
            >
              Launch Dashboard Free <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleLaunchDemo}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold border border-slate-800 bg-slate-900/60 backdrop-blur-sm text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 uppercase tracking-widest`}
            >
              <Play className="h-4 w-4 text-purple-400 fill-purple-400" /> Watch Telemetry Preview
            </button>
          </div>

          {/* Futuristic Screen Mockup */}
          <div className="relative mt-16 md:mt-24 mx-auto max-w-5xl rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3 shadow-2xl backdrop-blur-md shadow-purple-500/5">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-pink-500/10 rounded-2xl"></div>
            <div className="relative rounded-xl border border-slate-900 bg-slate-900/40 p-4 sm:p-6 overflow-hidden">
              
              {/* Fake Dashboard Layout Preview */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-xs text-slate-500 font-mono">CYBERNET_TELEMETRY_PORTAL_v2.9.sh</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono">STREAK: 5 DAYS</span>
                  <span className="text-xs px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono">LEVEL 4 AGENT</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Simulated Chart Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400 font-mono">ENERGY EXPENDITURE</span>
                    <Activity className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white">2,910 Kcal</div>
                  <p className="text-[10px] text-cyan-400">▲ 14% vs baseline parameters</p>
                  <div className="mt-4 h-16 flex items-end gap-1.5">
                    {[35, 45, 25, 60, 40, 85, 75].map((val, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-cyan-600 to-purple-600 rounded-t" style={{ height: `${val}%` }}></div>
                    ))}
                  </div>
                </div>

                {/* Simulated AI Coach Message */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-xs text-purple-400 font-mono mb-2">
                    <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
                    <span>COACH_NEURAL_CORE</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "Alex, your bench press weight has expanded by 12.5% in 14 days. To maintain hyper-trophic remodeling, I've boosted your protein target to 165g and added a 90-second smart rest buffer."
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                    <span>99.4% BIOMETRIC SYNCHRONICITY</span>
                    <span className="text-purple-400">ACTIVE RECOMMENDATION</span>
                  </div>
                </div>

                {/* Simulated Gamification/XP Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400 font-mono">EVOLUTION MATRIX</span>
                    <Award className="h-4 w-4 text-pink-400" />
                  </div>
                  <div className="text-sm font-bold text-white">Level 4 Hyper-Soldier</div>
                  <p className="text-xs text-slate-400 mt-0.5">XP: 680 / 4,000</p>
                  <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="mt-4 flex gap-2 overflow-x-hidden">
                    <span className="inline-block h-6 w-6 rounded bg-slate-800 border border-yellow-400/30 text-[10px] flex items-center justify-center text-yellow-400">🔥</span>
                    <span className="inline-block h-6 w-6 rounded bg-slate-800 border border-cyan-400/30 text-[10px] flex items-center justify-center text-cyan-400">💧</span>
                    <span className="inline-block h-6 w-6 rounded bg-slate-800 border border-purple-400/30 text-[10px] flex items-center justify-center text-purple-400">⚡</span>
                    <span className="inline-block h-6 w-6 rounded bg-slate-800 border border-pink-400/30 text-[10px] flex items-center justify-center text-pink-400">🛡️</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Stats Board Banner */}
      <section className="border-y border-slate-900 bg-slate-950/40 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-white md:text-5xl">250K+</div>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500">Active Nodes Synchronized</p>
            </div>
            <div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 md:text-5xl">14.8M+</div>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500">Calories Obliterated</p>
            </div>
            <div>
              <div className="text-3xl font-black text-white md:text-5xl">98.4%</div>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500">AI Hypertrophy Efficacy</p>
            </div>
            <div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 md:text-5xl">Level 99</div>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500">Max Physical Potential Unlocked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-xs font-mono uppercase tracking-widest text-purple-400">Engine Modules</h2>
            <p className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
              BIOMETRIC SYNCHRONIZATION FEATURES
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              CyberNet.Fit implements high-fidelity telemetry tracking systems to accelerate muscle remodeling and optimal body reconstitution.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/20 p-8 hover:bg-slate-900/40 hover:border-purple-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/5 rounded-bl-3xl blur-md transition-all group-hover:bg-purple-500/10"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-6">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">Neural AI Fitness Coach</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Inputs your precise biological details (experience, bio-mass, and goals) and instantly compiles customized workout matrices and recovery advice.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/20 p-8 hover:bg-slate-900/40 hover:border-cyan-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-bl-3xl blur-md transition-all group-hover:bg-cyan-500/10"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-6">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">Tactical Food Synthesizer</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Log meals and trace real-time protein, carb, fat, and hydration. Recieve instantly computed AI recipes configured to complete missing nutrients.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/20 p-8 hover:bg-slate-900/40 hover:border-pink-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 h-16 w-16 bg-pink-500/5 rounded-bl-3xl blur-md transition-all group-hover:bg-pink-500/10"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 mb-6">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">Telemetry Rest Pacer</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Track exercises with an integrated intelligent rest countdown. Emits neon warnings and audio alerts so you hit your exact recovery windows.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/20 p-8 hover:bg-slate-900/40 hover:border-emerald-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-bl-3xl blur-md transition-all group-hover:bg-emerald-500/10"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">Evolution Photo Slider</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Drag-and-slide physical progress pictures side-by-side. Correlate visible muscle growth against weight grids and structural measurements.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/20 p-8 hover:bg-slate-900/40 hover:border-yellow-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 h-16 w-16 bg-yellow-500/5 rounded-bl-3xl blur-md transition-all group-hover:bg-yellow-500/10"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-yellow-300 transition-colors">Trophy Node Gamification</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Acquire XP for logging workouts, drinking water, and syncing metrics. Level up your soldier profile and unlock glowing elite badges.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/20 p-8 hover:bg-slate-900/40 hover:border-cyan-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-bl-3xl blur-md transition-all group-hover:bg-cyan-500/10"></div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">Neural Sync Security</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Your biological data resides encrypted locally in memory node matrices. Pure local storage integration ensures 100% private security parameters.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-slate-900 bg-slate-950/20 py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-xs font-mono uppercase tracking-widest text-pink-400">SUCCESS CHRONICLES</h2>
            <p className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              BIOLOGICAL UPGRADE STORIES
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {'★★★★★'.split('').map((char, i) => <span key={i}>{char}</span>)}
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "I was skeptic about the rest pacer. But synchronizing my heavy sets to the 90-second countdown with immediate web sound triggers kept me hyper-focused. My bench went from 85kg to 100kg in weeks!"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" className="h-10 w-10 rounded-full border border-purple-500 object-cover" alt="User Avatar" />
                <div>
                  <h4 className="text-sm font-bold text-white">Diana Ross</h4>
                  <p className="text-xs font-mono text-purple-400">Intermediate Hypertrophy Agent</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {'★★★★★'.split('').map((char, i) => <span key={i}>{char}</span>)}
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "The macro synthesizer algorithm is incredibly fast. I input my targets, chat with the AI gym assistant, and it tells me exactly what foods to synthesize to meet my proteins. Plus, Leveling Up is addictive!"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" className="h-10 w-10 rounded-full border border-cyan-500 object-cover" alt="User Avatar" />
                <div>
                  <h4 className="text-sm font-bold text-white">Marcus Vance</h4>
                  <p className="text-xs font-mono text-cyan-400">Software Engineer / Shredding Node</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {'★★★★★'.split('').map((char, i) => <span key={i}>{char}</span>)}
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "Having visual before-after sliders coupled with localized weight grids kept me disciplined. The dark theme is beautiful, and clicking +250ml water logs feels like logging a gaming achievement!"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop" className="h-10 w-10 rounded-full border border-pink-500 object-cover" alt="User Avatar" />
                <div>
                  <h4 className="text-sm font-bold text-white">Xavier Thorne</h4>
                  <p className="text-xs font-mono text-pink-400">Powerlifting Enthusiast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing/CTA Section */}
      <section id="pricing" className="border-t border-slate-900 py-24 px-6 text-center">
        <div className="mx-auto max-w-4xl rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-500/5 to-pink-500/5 p-8 md:p-16 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>

          <h2 className="text-3xl font-black text-white sm:text-5xl">
            READY TO COMMENCE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
              PHYSICAL UPGRADE?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-slate-400">
            No active transaction files required. The system operates 100% locally in Sandbox mode for infinite client optimization.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6">
            <button
              onClick={handleLaunchDemo}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r ${themeBgGradient} shadow-xl uppercase tracking-widest hover:scale-[1.03] transition-all duration-300`}
            >
              Initialize Node (Free)
            </button>
            <div className="text-slate-500 text-xs font-mono">
              SECURE SECURE_SH_PORTAL ACTIVE
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#02000d] py-12 px-6 text-slate-500 text-sm">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded bg-gradient-to-br ${themeBgGradient} flex items-center justify-center text-white font-black text-xs`}>
              C
            </div>
            <span className="font-extrabold tracking-wider text-white">
              CYBER<span className={themeText}>NET</span>.FIT
            </span>
          </div>

          <p className="text-xs font-mono">
            © 2026 CYBERNET_FIT SYSTEMS INC. TELEMETRY CO-LOGIC MODULAR SHIELD ACTIVATED.
          </p>

          <div className="flex gap-4 text-xs font-mono">
            <a href="#" className="hover:text-white transition-colors">SECURE_PRIVACY</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">MATRIX_API</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">TERMINAL_LOGS</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
