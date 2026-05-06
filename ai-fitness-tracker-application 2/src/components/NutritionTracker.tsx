import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { 
  Utensils, 
  Plus, 
  Trash2, 
  Sparkles, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

export const NutritionTracker: React.FC = () => {
  const { 
    user, 
    mealLogs, 
    addMeal, 
    deleteMeal, 
    activeTheme, 
    addXP 
  } = useFitness();

  // Custom meal input form states
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState<number>(450);
  const [protein, setProtein] = useState<number>(30);
  const [carbs, setCarbs] = useState<number>(45);
  const [fats, setFats] = useState<number>(10);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

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

  // Quick preset foods
  const presetFoods = [
    { name: 'Synthesized Whey Shake', calories: 240, protein: 40, carbs: 8, fats: 2, type: 'snack' },
    { name: 'Hypertrophy Oatmeal Bowl', calories: 480, protein: 22, carbs: 70, fats: 8, type: 'breakfast' },
    { name: 'Clean Chicken, Rice & Broccoli', calories: 650, protein: 55, carbs: 85, fats: 6, type: 'lunch' },
    { name: 'Aesthetic Avocado Salmon Plate', calories: 720, protein: 48, carbs: 45, fats: 26, type: 'dinner' },
  ];

  // AI recommendations based on fitness goals
  const rawSuggestions: Record<string, Array<{ name: string; desc: string; calories: number; protein: number; carbs: number; fats: number; type: string }>> = {
    fat_loss: [
      { name: 'Lean Egg White & Spinach Omelet', desc: 'Thermogenic compound matrix with high amino profiles.', calories: 280, protein: 32, carbs: 5, fats: 8, type: 'breakfast' },
      { name: 'Flame Grilled Cod & Quinoa Bowl', desc: 'Slow carb digestion combined with micro-dense marine aminos.', calories: 420, protein: 42, carbs: 45, fats: 4, type: 'lunch' },
      { name: 'Micellar Casein Berry Dessert', desc: 'Slow absorption matrix to prevent nighttime muscle decay.', calories: 190, protein: 26, carbs: 12, fats: 1, type: 'snack' }
    ],
    muscle_gain: [
      { name: 'Hypertrophy Power Steak Plate', desc: 'Loaded with natural creatine and dense bio-fats.', calories: 850, protein: 60, carbs: 90, fats: 24, type: 'dinner' },
      { name: 'Almond Butter & Banana Oats', desc: 'Glycogen re-saturation fuel optimal for recovery.', calories: 590, protein: 25, carbs: 85, fats: 16, type: 'breakfast' },
      { name: 'Double Breast Jasmine Rice Core', desc: 'Clean metabolic acceleration routine for massive gains.', calories: 750, protein: 65, carbs: 100, fats: 8, type: 'lunch' }
    ],
    maintenance: [
      { name: 'Tuna Salad on Whole Grain Crust', desc: 'Clean fatty acid profile to boost cognitive focus.', calories: 480, protein: 38, carbs: 40, fats: 12, type: 'lunch' },
      { name: 'Nut-Core Whey Greek Yogurt', desc: 'Active probiotic digestive enzyme balance.', calories: 340, protein: 30, carbs: 22, fats: 9, type: 'snack' },
      { name: 'Baked Turkey Breast & Sweet Potato', desc: 'Premium carbohydrate and tryptophan recovery matrix.', calories: 580, protein: 45, carbs: 65, fats: 10, type: 'dinner' }
    ],
    endurance: [
      { name: 'High-Glycogen Pasta Core Bowl', desc: 'Slow carb delivery optimized for heavy training.', calories: 680, protein: 24, carbs: 110, fats: 10, type: 'lunch' },
      { name: 'Peanut Butter Honey Toast Energy', desc: 'Immediate ATP activation prior to cardiovascular tasks.', calories: 380, protein: 12, carbs: 55, fats: 14, type: 'snack' },
      { name: 'Roast Salmon & Wild Medley Rice', desc: 'Anti-inflammatory Omega fatty acids to support joint loading.', calories: 640, protein: 40, carbs: 70, fats: 18, type: 'dinner' }
    ]
  };
  
  const aiMealSuggestions = rawSuggestions[user.goal] || rawSuggestions.muscle_gain;

  // Calculate totals
  const totalCalories = mealLogs.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = mealLogs.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = mealLogs.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = mealLogs.reduce((sum, m) => sum + m.fats, 0);

  const handleLogCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    
    addMeal({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: mealName,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      type: mealType
    });

    setMealName('');
    alert(`🍲 Logged custom meal: ${mealName}! XP has synchronized.`);
  };

  const handleQuickLog = (preset: typeof presetFoods[0]) => {
    addMeal({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fats: preset.fats,
      type: preset.type as any
    });
    alert(`⚡ Quick Logged: ${preset.name}!`);
  };

  const handleLogAISuggestion = (suggestion: typeof aiMealSuggestions[0]) => {
    addMeal({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: `[AI Suggestion] ${suggestion.name}`,
      calories: suggestion.calories,
      protein: suggestion.protein,
      carbs: suggestion.carbs,
      fats: suggestion.fats,
      type: suggestion.type as any
    });
    addXP(100); // bonus XP for following AI advice!
    alert(`🤖 AI Nutrient Node Synthesized!\n🍜 Logged: ${suggestion.name}\n🎁 Earned +100 XP Bonus!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">
          NUTRITION <span className={themeColors.text}>SYNTHESIS</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          TRACE MACRONUTRIENT RATIOS • DIETARY CALIBRATION • SYNTHESIZE REQUISITE CALORIES
        </p>
      </div>

      {/* Daily Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Calories Ring/Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-md text-center md:col-span-1">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Daily Energy Status</div>
          
          <div className="relative h-28 w-28 mx-auto flex items-center justify-center mb-3">
            <svg className="absolute inset-0 h-full w-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" className="stroke-slate-900 fill-none" strokeWidth="6" />
              <circle 
                cx="56" 
                cy="56" 
                r="48" 
                className="stroke-purple-500 fill-none transition-all duration-1000" 
                strokeWidth="6" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={(2 * Math.PI * 48) * (1 - Math.min(100, (totalCalories / user.targetCalories)))}
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-xl font-black text-white font-mono">{totalCalories}</span>
              <p className="text-[8px] text-slate-500 font-mono leading-none mt-1">/ {user.targetCalories}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-white uppercase">Calorie Consumption</span>
        </div>

        {/* Target Macros Status Indicators */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-md md:col-span-3 space-y-4">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-2">
            <Info className="h-4 w-4 text-purple-400" />
            LIVE TELEMETRY CALCULATION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="font-bold text-purple-400">PROTEIN</span>
                <span>{totalProtein}g / {user.targetProtein}g</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (totalProtein / user.targetProtein) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="font-bold text-cyan-400">CARBS</span>
                <span>{totalCarbs}g / {user.targetCarbs}g</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (totalCarbs / user.targetCarbs) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span className="font-bold text-pink-400">FATS</span>
                <span>{totalFats}g / {user.targetFats}g</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (totalFats / user.targetFats) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Forms & Lists & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Meal Logging & Logs List Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Custom Meal Log Adder Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5 text-purple-400" />
              LOG CUSTOM INGESTION MATRIX
            </h3>

            <form onSubmit={handleLogCustomMeal} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Meal / Food Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="Synthesized Salmon Fillet, Protein Shake..."
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Category Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 outline-none focus:border-purple-500/50"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack / Intra</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Calories (Kcal)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Protein (g)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Fats (g)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={fats}
                    onChange={(e) => setFats(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`sm:col-span-3 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${themeColors.gradient} shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all text-xs uppercase tracking-wider`}
              >
                Synthesize Meal Log
              </button>
            </form>
          </div>

          {/* Logged Meals List */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Utensils className="h-4.5 w-4.5 text-purple-400" />
              CURRENT INGESTION STREAM
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {mealLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  NO FOOD LOGS REGISTED IN CURRENT TELEMETRY CYCLE.
                </div>
              ) : (
                mealLogs.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-900 bg-[#02000d] hover:border-slate-800 transition-all">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{m.time} • {m.type}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{m.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">
                        P: <span className="text-purple-400 font-bold">{m.protein}g</span> • 
                        C: <span className="text-cyan-400 font-bold">{m.carbs}g</span> • 
                        F: <span className="text-pink-400 font-bold">{m.fats}g</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-black text-white">{m.calories} Kcal</span>
                      <button
                        onClick={() => deleteMeal(m.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Purge food record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Side Panel: AI Diet Suggester & Presets */}
        <div className="space-y-4">
          
          {/* AI Gym Meal Recommendations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 relative overflow-hidden">
            {/* Spotlight blur */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-purple-400 animate-pulse" />
              NEURAL DIET ADVISER
            </h3>
            <p className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-4 block">Goal Adjusted suggestions</p>

            <div className="space-y-3">
              {aiMealSuggestions.map((sug: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/50 hover:border-purple-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{sug.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 italic leading-relaxed">"{sug.desc}"</p>
                    
                    <div className="grid grid-cols-4 gap-1 font-mono text-[9px] text-slate-500 mt-2.5 bg-[#02000d] p-1.5 rounded-lg border border-slate-900">
                      <div>Kcal: <strong className="text-white">{sug.calories}</strong></div>
                      <div>P: <strong className="text-purple-400">{sug.protein}g</strong></div>
                      <div>C: <strong className="text-cyan-400">{sug.carbs}g</strong></div>
                      <div>F: <strong className="text-pink-400">{sug.fats}g</strong></div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLogAISuggestion(sug)}
                    className="mt-3 py-1.5 w-full rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold font-mono text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                  >
                    SYNTHESIZE & LOG ITEM
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Logs preset box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-yellow-400" />
              PRE-PACKAGED FITNESS FOODS
            </h3>

            <div className="space-y-2">
              {presetFoods.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickLog(preset)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-900 bg-slate-950/60 text-left hover:bg-[#02000d] hover:border-slate-800 transition-all text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-300">{preset.name}</h4>
                    <p className="text-[9px] font-mono text-slate-500 mt-0.5">P: {preset.protein}g • Kcal: {preset.calories}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
