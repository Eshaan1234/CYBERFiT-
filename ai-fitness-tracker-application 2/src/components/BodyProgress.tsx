import React, { useState } from 'react';
import { useFitness, ProgressPhoto } from '../context/FitnessContext';
import { 
  Camera, 
  Layers, 
  Scale 
} from 'lucide-react';

export const BodyProgress: React.FC = () => {
  const { 
    progressPhotos, 
    addProgressPhoto, 
    activeTheme, 
    triggerSound, 
    addWeightLog 
  } = useFitness();

  const [sliderPercent, setSliderPercent] = useState<number>(50);
  const [weight, setWeight] = useState<number>(81.5);
  const [chest, setChest] = useState<number>(106);
  const [waist, setWaist] = useState<number>(81);
  const [biceps, setBiceps] = useState<number>(41);
  const [thighs, setThighs] = useState<number>(59);

  // Custom photo upload mock URLs
  const [photoBefore, setPhotoBefore] = useState('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop');
  const [photoAfter, setPhotoAfter] = useState('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop');

  // Selected comparison images state
  const [currentComparison, setCurrentComparison] = useState<{before: string, after: string}>({
    before: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop'
  });

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

  const handleLogProgress = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSound('success');
    
    addProgressPhoto({
      date: new Date().toISOString().split('T')[0],
      weight: Number(weight),
      photoBefore,
      photoAfter,
      chest: Number(chest),
      waist: Number(waist),
      biceps: Number(biceps),
      thighs: Number(thighs)
    });

    // Update main weight metric
    addWeightLog(weight);
    
    alert('📸 PHYSICAL METRICS LOGGED SECURELY! Progress photo telemetry node is compiled.');
  };

  const handleSelectComparison = (before: string, after: string) => {
    triggerSound('click');
    setCurrentComparison({ before, after });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">
          PHYSICAL <span className={themeColors.text}>PROGRESSION</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          DRAG EVOLUTION SLIDERS • RECORD STRUCTURAL ANTHROPOMETRY • TRACK MASS LOGISTICS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Before After interactive Slider column */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-purple-400 animate-pulse" />
                EVOLUTION COMPARISON SLIDER
              </h3>
              <span className="text-[10px] font-mono text-slate-500">DRAG HORIZONTAL TO ANALYZE</span>
            </div>

            {/* Slider container */}
            <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-slate-800 select-none bg-slate-950">
              
              {/* After image (Always under) */}
              <img 
                src={currentComparison.after} 
                alt="After Evolution" 
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded bg-black/80 border border-purple-500/30 text-white font-mono text-[9px] font-bold uppercase tracking-widest">
                After Physical Evolution
              </div>

              {/* Before image (Cropped width according to slider percent) */}
              <div 
                className="absolute inset-y-0 left-0 z-10 overflow-hidden border-r-2 border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                style={{ width: `${sliderPercent}%` }}
              >
                <img 
                  src={currentComparison.before} 
                  alt="Before Evolution" 
                  className="absolute inset-0 w-full h-[380px] object-cover max-w-none"
                  style={{ width: '100%', minWidth: '400px' }}
                  draggable={false}
                />
                
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/80 border border-slate-700 text-slate-300 font-mono text-[9px] font-bold uppercase tracking-widest">
                  Before Baseline
                </div>
              </div>

              {/* Range input layered absolutely transparently on top */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPercent} 
                onChange={(e) => setSliderPercent(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />

              {/* Visible sliding anchor */}
              <div 
                className="absolute inset-y-0 z-20 w-1 pointer-events-none"
                style={{ left: `${sliderPercent}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full border-2 border-white bg-slate-950 flex items-center justify-center text-white text-xs font-black shadow-lg">
                  ◀▶
                </div>
              </div>

            </div>

            <p className="text-[10px] text-slate-500 font-mono text-center mt-3 uppercase tracking-widest">
              Slide over structural images to inspect cellular hypertrophy changes.
            </p>
          </div>

          {/* Historical progress logs cards */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              CHRONOLOGICAL COMPARISON SETS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {progressPhotos.map((photo: ProgressPhoto, index: number) => (
                <button
                  key={photo.id || index}
                  onClick={() => handleSelectComparison(photo.photoBefore, photo.photoAfter)}
                  className={`p-3 rounded-xl border text-left hover:bg-[#02000d] transition-all flex items-center gap-3 ${
                    currentComparison.before === photo.photoBefore 
                      ? 'border-purple-500 bg-purple-500/5' 
                      : 'border-slate-900 bg-slate-950/50'
                  }`}
                >
                  <div className="h-12 w-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                    <img src={photo.photoAfter} className="h-full w-full object-cover" alt="Thumb" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Log Date: {photo.date}</h4>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">Weight: {photo.weight} kg</p>
                    {photo.waist && (
                      <p className="text-[9px] font-mono text-purple-400">Waist: {photo.waist}cm • Arms: {photo.biceps}cm</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Physical measurements logger column */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Camera className="h-4.5 w-4.5 text-purple-400" />
              LOG BIOMETRIC TELEMETRY
            </h3>

            <form onSubmit={handleLogProgress} className="space-y-4 text-xs">
              
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Body Weight (kg)</label>
                <div className="relative">
                  <Scale className="absolute right-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-3.5 pr-10 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    value={chest}
                    onChange={(e) => setChest(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Biceps/Arms (cm)</label>
                  <input
                    type="number"
                    value={biceps}
                    onChange={(e) => setBiceps(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Thighs (cm)</label>
                  <input
                    type="number"
                    value={thighs}
                    onChange={(e) => setThighs(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 space-y-2.5">
                <div className="text-[9px] font-mono text-slate-500 uppercase font-bold">Transformation Photo Paths</div>
                
                <div>
                  <label className="text-[8px] font-mono text-slate-600 block mb-0.5">BEFORE MOCK PHOTO URL</label>
                  <input
                    type="text"
                    value={photoBefore}
                    onChange={(e) => setPhotoBefore(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 text-[10px] rounded p-1 text-purple-400 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-[8px] font-mono text-slate-600 block mb-0.5">AFTER MOCK PHOTO URL</label>
                  <input
                    type="text"
                    value={photoAfter}
                    onChange={(e) => setPhotoAfter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 text-[10px] rounded p-1 text-purple-400 font-mono outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r ${themeColors.gradient} shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all text-xs uppercase tracking-wider`}
              >
                Log Biometrics & Photo Set (+150 XP)
              </button>

            </form>
          </div>

          {/* Measurements list box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              HISTORICAL BASELINES
            </h3>

            <div className="space-y-1.5 font-mono text-slate-400">
              <div className="flex justify-between border-b border-slate-900 pb-1.5 text-slate-500 font-bold">
                <span>METRIC ASPECT</span>
                <span>BASELINE</span>
                <span>EVOLVED STATE</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Body Weight</span>
                <span className="text-slate-500">84.2 kg</span>
                <span className="text-purple-400 font-bold">81.5 kg (Lean)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Chest Perimeter</span>
                <span className="text-slate-500">102 cm</span>
                <span className="text-purple-400 font-bold">106 cm (+4cm)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Waist Girth</span>
                <span className="text-slate-500">88 cm</span>
                <span className="text-purple-400 font-bold">81 cm (-7cm)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Biceps Peak</span>
                <span className="text-slate-500">38 cm</span>
                <span className="text-purple-400 font-bold">41 cm (+3cm)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
