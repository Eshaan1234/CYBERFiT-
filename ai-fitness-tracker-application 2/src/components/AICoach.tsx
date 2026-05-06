import React, { useState, useEffect, useRef } from 'react';
import { useFitness } from '../context/FitnessContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Activity, 
  RefreshCw, 
  Heart 
} from 'lucide-react';

export const AICoach: React.FC = () => {
  const { 
    user, 
    chatHistory, 
    sendChatMessage, 
    clearChatHistory, 
    activeTheme, 
    triggerSound, 
    setProfile,
    addXP 
  } = useFitness();

  const [messageText, setMessageText] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  
  // Local profile values for custom planner
  const [age, setAge] = useState(user.age);
  const [weight, setWeight] = useState(user.weight);
  const [height, setHeight] = useState(user.height);
  const [goal, setGoal] = useState(user.goal);
  const [experience, setExperience] = useState(user.experience);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    triggerSound('click');
    sendChatMessage(messageText);
    setMessageText('');
  };

  const synthesizeAIPlan = () => {
    triggerSound('success');
    setIsGeneratingPlan(true);

    // Simulate diagnostic telemetry loading
    setTimeout(() => {
      setIsGeneratingPlan(false);
      
      // Update global user parameters with customized values
      setProfile({
        age,
        weight,
        height,
        goal,
        experience,
        targetCalories: goal === 'fat_loss' ? 1850 
                      : goal === 'muscle_gain' ? 3100 
                      : goal === 'maintenance' ? 2400 : 2600,
        targetProtein: Math.round(weight * 2.1),
        targetCarbs: goal === 'fat_loss' ? 160 : goal === 'muscle_gain' ? 400 : 250,
        targetFats: Math.round(weight * 1.0)
      });

      // Assemble specialized workout matrices based on goals
      const plansMap: Record<string, { calories: number; protein: number; recovery: string; exercises: string; days: Array<{ d: string; focus: string; intensity: string }> }> = {
        fat_loss: {
          calories: 1850,
          protein: Math.round(weight * 2.1),
          recovery: 'Prioritize low impact steady state (LISS) cardio (35 mins) in post lifting telemetry. Target 7.5 hours of sleep to avoid hyper-cortisol weight lock.',
          exercises: 'Superset compound pushing routines with lightweight lateral raises to keep heart rate in the active lipolysis threshold (125-140 BPM).',
          days: [
            { d: 'Day 1', focus: 'Upper Body Compound + LISS Cardio', intensity: 'HIGH (80% 1RM)' },
            { d: 'Day 2', focus: 'Lower Body Isolation + Ab Core', intensity: 'MEDIUM' },
            { d: 'Day 3', focus: 'Sprints (HIIT) + Stretching Matrix', intensity: 'MAXIMUM' },
            { d: 'Day 4', focus: 'Active Bio-Rest & Mobilization', intensity: 'REST' },
            { d: 'Day 5', focus: 'Full Torso Push/Pull Supersets', intensity: 'HIGH' },
          ]
        },
        muscle_gain: {
          calories: 3100,
          protein: Math.round(weight * 2.2),
          recovery: 'Consume 40g carbohydrates during workouts to prevent cortisol spikes. Take cold showers on active legs rest cycles to stimulate satellite cell activation.',
          exercises: 'Maintain 3-4 heavy sets targeting 82% 1RM. Incorporate 3-second negatives on row & pull motions to maximize eccentric muscle tears.',
          days: [
            { d: 'Day 1', focus: 'Hypertrophy PUSH Routine (Chest focal)', intensity: 'HIGH (82% 1RM)' },
            { d: 'Day 2', focus: 'Hypertrophy PULL Routine (Back width)', intensity: 'HIGH' },
            { d: 'Day 3', focus: 'Kinetic Leg Loading (Heavy Squats)', intensity: 'MAXIMUM' },
            { d: 'Day 4', focus: 'CNS Recovery (No Lifting)', intensity: 'REST' },
            { d: 'Day 5', focus: 'Shoulders & Arms Saturation Circuit', intensity: 'MEDIUM' },
          ]
        },
        maintenance: {
          calories: 2400,
          protein: Math.round(weight * 2.0),
          recovery: 'Hydrate at least 3.2L water daily to facilitate glycogen pathways. Focus on tissue release using foam rollers on spinal columns.',
          exercises: 'Perform medium weight compound routines. Focus heavily on complete muscle contractions at the peak concentric phase of biceps/chest movements.',
          days: [
            { d: 'Day 1', focus: 'Push Core (Pec-Major, Deltoids)', intensity: 'MEDIUM (70% 1RM)' },
            { d: 'Day 2', focus: 'Pull Core (Rhomboids, Lats)', intensity: 'MEDIUM' },
            { d: 'Day 3', focus: 'Leg Pacing & Core Alignment', intensity: 'HIGH' },
            { d: 'Day 4', focus: 'Active Mobility & Cardiorespiratory', intensity: 'MEDIUM' },
            { d: 'Day 5', focus: 'Full-Body Athletic Conditioning', intensity: 'HIGH' },
          ]
        },
        endurance: {
          calories: 2600,
          protein: Math.round(weight * 1.8),
          recovery: 'Log high quantities of electrolytes. Focus on stretching ligaments post-run to maintain flexibility and protect joint capsules.',
          exercises: 'Prioritize bodyweight sets of 15-20 repetitions. Integrate explosive clean-and-press movements to stimulate oxygen pathways.',
          days: [
            { d: 'Day 1', focus: 'Full Body Endurance Circuits', intensity: 'MEDIUM (60% 1RM)' },
            { d: 'Day 2', focus: 'Aerobic Threshold Runs (5-8K)', intensity: 'HIGH' },
            { d: 'Day 3', focus: 'Core Conditioning & Planks', intensity: 'MEDIUM' },
            { d: 'Day 4', focus: 'Full joint decompress recovery', intensity: 'REST' },
            { d: 'Day 5', focus: 'High Repetition Resistance Drills', intensity: 'MEDIUM' },
          ]
        }
      };
      
      const workoutPlan = plansMap[goal] || plansMap.muscle_gain;

      setGeneratedPlan(workoutPlan);
      addXP(150); // XP for compiling AI plan!
      alert(`🤖 Plan generated! Your daily target calories have been auto-tuned to: ${workoutPlan.calories} Kcal!`);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">
            AI FITNESS <span className={themeColors.text}>COACH</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            NEURAL ENGINE PORTAL • BIO-MATRIC CO-DRIVE • PERSONALIZED STRATEGY MATRIX
          </p>
        </div>

        <button
          onClick={clearChatHistory}
          className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-slate-900 bg-slate-950/40 text-slate-500 hover:text-red-400 hover:border-red-500/20 transition-all"
        >
          CLEAR CHAT CACHE
        </button>
      </div>

      {/* Main double column: Plan Synthesizer & Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Plan Synthesizer Form & Plan Out Column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Biometric calibration form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 relative overflow-hidden">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
              BIOMETRIC SYNTHESIZER
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Age (years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Experience</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Physical Objective Target</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 outline-none"
                >
                  <option value="fat_loss">Fat Loss Definition (Deficit)</option>
                  <option value="muscle_gain">Muscle Hypertrophy (Surplus)</option>
                  <option value="maintenance">Lean Reconstitution (Maintenance)</option>
                  <option value="endurance">Endurance & Cardio Conditioning</option>
                </select>
              </div>

              <button
                type="button"
                onClick={synthesizeAIPlan}
                disabled={isGeneratingPlan}
                className={`w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${themeColors.gradient} ${themeColors.btnGlow} transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-white/10`}
              >
                {isGeneratingPlan ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" /> SYNTHESIZING NEURAL DIAGNOSTICS...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5" /> SYNTHESIZE AI COACH PLAN
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Render Generated Plan Output */}
          {generatedPlan ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase">Synthesized Plan Output</span>
                <span className="text-[9px] font-mono text-slate-500">ENGINE ACCURACY: 98.4%</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl border border-slate-900 bg-slate-950">
                  <div className="text-[9px] font-mono text-slate-500 uppercase leading-none">TARGET CALORIES</div>
                  <div className="text-xl font-black text-white mt-1.5">{generatedPlan.calories} kcal</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-900 bg-slate-950">
                  <div className="text-[9px] font-mono text-slate-500 uppercase leading-none">TARGET PROTEIN</div>
                  <div className="text-xl font-black text-purple-400 mt-1.5">{generatedPlan.protein}g</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 text-xs">
                <div className="font-bold text-slate-300 flex items-center gap-1 mb-1.5 uppercase font-mono text-[10px]">
                  <Heart className="h-4 w-4 text-pink-500" /> RECOVERY PROTOCOL
                </div>
                <p className="text-slate-400 leading-relaxed italic">"{generatedPlan.recovery}"</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 text-xs">
                <div className="font-bold text-slate-300 flex items-center gap-1 mb-1.5 uppercase font-mono text-[10px]">
                  <Activity className="h-4 w-4 text-cyan-400" /> EXERCISE PACING ADVICE
                </div>
                <p className="text-slate-400 leading-relaxed italic">"{generatedPlan.exercises}"</p>
              </div>

              {/* Weekly blocks */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[9px] font-mono text-slate-500 uppercase block mb-2 font-bold">KINETIC 5-DAY ROTATION PLAN</div>
                {generatedPlan.days.map((day: any, dIdx: number) => (
                  <div key={dIdx} className="flex justify-between items-center p-2 rounded-lg border border-slate-900 bg-slate-950 text-xs">
                    <span className="font-mono text-purple-400 font-bold text-[10px]">{day.d}</span>
                    <span className="text-slate-300 font-medium truncate max-w-[150px]">{day.focus}</span>
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-500">{day.intensity}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 border-dashed bg-slate-950/20 p-12 text-center text-slate-500 text-xs font-mono">
              BIOMETRIC SCHEDULE PLAN RECORD NOT DETECTED.<br />COMPILE BIO-INPUTS ABOVE TO COMMENCE SYNTHESIS.
            </div>
          )}

        </div>

        {/* Neural AI Chat Assistant Column */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800/80 bg-slate-950/40 shadow-xl backdrop-blur-md flex flex-col h-[650px] overflow-hidden">
          
          {/* Active Header */}
          <div className="border-b border-slate-900 bg-slate-950 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Bot className="h-5 w-5 text-glow-purple animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">CYBERNET_COACH_AI</h3>
                <span className="text-[8px] font-mono text-green-400 uppercase tracking-wider mt-1 block">● ONLINE_TELEMETRY ACTIVE</span>
              </div>
            </div>

            <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 uppercase">
              V2.9 CORE
            </span>
          </div>

          {/* Chats mapping viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
            {chatHistory.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono text-xs">
                CHAT HISTORY PURGED. COMMENCE TELEMETRY QUERY BY TYPING BELOW.
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mt-1 flex-shrink-0 text-xs">
                      🤖
                    </div>
                  )}

                  <div className={`
                    max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed
                    ${msg.sender === 'user'
                      ? `bg-gradient-to-r ${themeColors.gradient} text-white rounded-tr-none border border-white/10`
                      : 'bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-none'
                    }
                  `}>
                    {/* Render message formatting support */}
                    <div className="whitespace-pre-wrap">
                      {msg.text.split('**').map((chunk, index) => 
                        index % 2 === 1 ? <strong key={index} className="text-white underline font-extrabold">{chunk}</strong> : chunk
                      )}
                    </div>
                    
                    <span className="text-[8px] font-mono text-slate-500 block text-right mt-1.5">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Warning disclaimer text */}
          <div className="px-4 py-1.5 bg-[#02000d] border-t border-slate-950 flex items-center gap-1 text-[8px] font-mono text-slate-600">
            <ShieldAlert className="h-3 w-3 text-slate-600" />
            <span>BIO-SUSTAINED ALGORITHMS ARE FOR STRATEGY ONLY. SEEK LIFTING MEDICS BEFORE OVERLOADING.</span>
          </div>

          {/* Form Message text editor */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-900 bg-slate-950 p-4 flex gap-2">
            <input
              type="text"
              required
              placeholder="Query Coach AI (e.g. recommended protein, how to recover, suggest leg workout)..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              className={`p-3 rounded-xl bg-gradient-to-r ${themeColors.gradient} text-glow-purple text-white hover:scale-105 active:scale-95 transition-all`}
              title="Transmit query"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
