import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Volume2, 
  VolumeX, 
  Palette, 
  Save, 
  ShieldCheck, 
  Check 
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { 
    user, 
    setProfile, 
    activeTheme, 
    setTheme, 
    soundEnabled, 
    setSoundEnabled, 
    triggerSound 
  } = useFitness();

  // Local form inputs
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age);
  const [weight, setWeight] = useState(user.weight);
  const [height, setHeight] = useState(user.height);
  const [targetCalories, setTargetCalories] = useState(user.targetCalories);
  const [targetProtein, setTargetProtein] = useState(user.targetProtein);
  const [targetWater, setTargetWater] = useState(user.targetWater);

  const themeColors = {
    cyan: {
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bgGlow: 'bg-cyan-500/10',
      gradient: 'from-cyan-500 to-blue-600',
      btnGlow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    },
    purple: {
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      bgGlow: 'bg-purple-500/10',
      gradient: 'from-purple-600 to-pink-600',
      btnGlow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    },
    pink: {
      text: 'text-pink-400',
      border: 'border-pink-500/30',
      bgGlow: 'bg-pink-500/10',
      gradient: 'from-pink-500 to-rose-600',
      btnGlow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
    },
    emerald: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bgGlow: 'bg-emerald-500/10',
      gradient: 'from-emerald-500 to-teal-600',
      btnGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    },
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      bgGlow: 'bg-amber-500/10',
      gradient: 'from-amber-500 to-orange-600',
      btnGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    }
  }[activeTheme];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSound('success');
    
    setProfile({
      name,
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      targetCalories: Number(targetCalories),
      targetProtein: Number(targetProtein),
      targetWater: Number(targetWater),
    });

    alert('💾 BIOMETRIC COEFFICIENTS TUNED SECURELY! Global state matrix has adapted.');
  };

  const handleThemeChange = (newTheme: 'cyan' | 'purple' | 'pink' | 'emerald' | 'amber') => {
    setTheme(newTheme);
    setTimeout(() => {
      triggerSound('success');
    }, 50);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">
          SYSTEM <span className={themeColors.text}>PREFERENCES</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          CALIBRATE SYSTEM PACING • SELECT NEON VISUAL NODES • RE-KEY BIOMETRICS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Settings Left Columns */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5 border-b border-slate-900 pb-3">
            <User className={`h-4.5 w-4.5 ${themeColors.text}`} />
            BIOMETRIC MATRIX CO-ORDINATION
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">User Entity Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Biomass Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Entity Age (years)</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Entity Stature Height (cm)</label>
                <input
                  type="number"
                  required
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none text-xs"
                />
              </div>
            </div>

            {/* Target metrics settings */}
            <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block pt-3 border-t border-slate-900 font-bold">
              MANUAL THERMIC TARGET ADJUSTMENTS
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Calorie Target Ceiling</label>
                <input
                  type="number"
                  required
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Protein Target Quotient (g)</label>
                <input
                  type="number"
                  required
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Water Target Ceiling (ml)</label>
                <input
                  type="number"
                  required
                  value={targetWater}
                  onChange={(e) => setTargetWater(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${themeColors.gradient} shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5`}
            >
              <Save className="h-4.5 w-4.5" /> Commit Telemetry Calibration
            </button>
          </form>
        </div>

        {/* Custom Visual Theme Selection Columns */}
        <div className="space-y-4">
          
          {/* Accent palettes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Palette className={`h-4.5 w-4.5 ${themeColors.text}`} />
              NEURAL HIGHLIGHT MATRIX
            </h3>

            <div className="space-y-2.5">
              {[
                { id: 'purple', label: 'Hypertrophy Violet', hex: 'bg-purple-500', glow: 'shadow-neon-purple text-purple-400' },
                { id: 'cyan', label: 'Cooling Cyber Cyan', hex: 'bg-cyan-500', glow: 'shadow-neon-cyan text-cyan-400' },
                { id: 'pink', label: 'Thermogenic Shock Pink', hex: 'bg-pink-500', glow: 'shadow-neon-pink text-pink-400' },
                { id: 'emerald', label: 'Matrix Acid Emerald', hex: 'bg-emerald-500', glow: 'shadow-neon-emerald text-emerald-400' },
                { id: 'amber', label: 'Solar ATP Amber', hex: 'bg-amber-500', glow: 'shadow-neon-amber text-amber-400' },
              ].map((themeOpt) => (
                <button
                  key={themeOpt.id}
                  onClick={() => handleThemeChange(themeOpt.id as any)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-xs font-mono font-bold uppercase tracking-wider ${
                    activeTheme === themeOpt.id 
                      ? 'border-slate-700 bg-slate-900 text-white' 
                      : 'border-slate-900 bg-slate-950/50 text-slate-500 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`h-4 w-4 rounded-full ${themeOpt.hex} ${activeTheme === themeOpt.id ? 'animate-pulse' : ''}`}></div>
                    <span className={activeTheme === themeOpt.id ? themeOpt.glow : 'text-slate-400'}>{themeOpt.label}</span>
                  </div>
                  {activeTheme === themeOpt.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sound system settings */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <SettingsIcon className={`h-4.5 w-4.5 ${themeColors.text}`} />
              ACOUSTIC DRIVERS
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-900 bg-slate-950/60">
              <div>
                <span className="text-xs font-bold text-white uppercase block">Tactile Audio FX</span>
                <span className="text-[10px] text-slate-500 block font-mono mt-0.5">SYNTHESIZED WEB-AUDIO API BEAT</span>
              </div>

              <button
                onClick={() => {
                  triggerSound('click');
                  setSoundEnabled(!soundEnabled);
                }}
                className={`p-2.5 rounded-xl border transition-all ${
                  soundEnabled 
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                    : 'border-slate-800 bg-slate-950 text-slate-600'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Secure disclaimer box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1">
              <ShieldCheck className="h-4.5 w-4.5 text-green-400" /> PRIVACY ENCRYPTION
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono uppercase">
              All biological telemetry logged remains sandbox encrypted inside local storage memory addresses on your web explorer node. No central servers compile your information.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
