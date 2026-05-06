import React, { useState, useEffect, useRef } from 'react';
import { useFitness, WorkoutExercise } from '../context/FitnessContext';
import { 
  Plus, 
  Trash2, 
  Play, 
  TrendingUp, 
  Award, 
  Clock, 
  ChevronDown, 
  Sparkles
} from 'lucide-react';

export const WorkoutTracker: React.FC = () => {
  const { 
    workoutSessions, 
    addWorkoutSession, 
    deleteWorkoutSession, 
    activeTheme, 
    triggerSound,
    addXP 
  } = useFitness();

  // Active workout states
  const [activeSession, setActiveSession] = useState<{
    name: string;
    duration: number;
    exercises: WorkoutExercise[];
  } | null>(null);

  const [activeTemplate, setActiveTemplate] = useState<string>('ppl');
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active rest timer states
  const [restTimeLeft, setRestTimeLeft] = useState<number>(0);
  const [restDuration, setRestDuration] = useState<number>(90); // default 90s
  const [isResting, setIsResting] = useState<boolean>(false);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Custom additions
  const [newExerciseName, setNewExerciseName] = useState('');
  const [routineHistoryOpen, setRoutineHistoryOpen] = useState(false);

  // Presets of splits
  const splitsPresets: Record<string, Array<{ name: string; defaultSets: number; defaultReps: number; defaultWeight: number }>> = {
    ppl: [
      { name: 'Incline Dumbbell Bench Press', defaultSets: 3, defaultReps: 10, defaultWeight: 32 },
      { name: 'Overhead Barbell Press', defaultSets: 3, defaultReps: 8, defaultWeight: 50 },
      { name: 'Weighted Chest Dips', defaultSets: 3, defaultReps: 10, defaultWeight: 15 },
      { name: 'Triceps Rope Pushdowns', defaultSets: 4, defaultReps: 12, defaultWeight: 25 },
    ],
    brosplit: [
      { name: 'Flat Barbell Bench Press', defaultSets: 4, defaultReps: 10, defaultWeight: 80 },
      { name: 'Incline Dumbbell Flyes', defaultSets: 3, defaultReps: 12, defaultWeight: 18 },
      { name: 'Decline Machine Press', defaultSets: 3, defaultReps: 10, defaultWeight: 65 },
      { name: 'Cable Crossover', defaultSets: 3, defaultReps: 15, defaultWeight: 15 },
    ],
    upperlower: [
      { name: 'Barbell Squats', defaultSets: 4, defaultReps: 8, defaultWeight: 100 },
      { name: 'Romanian Deadlifts', defaultSets: 3, defaultReps: 10, defaultWeight: 90 },
      { name: 'Leg Extensions', defaultSets: 3, defaultReps: 12, defaultWeight: 45 },
      { name: 'Seated Calf Raises', defaultSets: 4, defaultReps: 15, defaultWeight: 35 },
    ]
  };

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

  // Track session timer
  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 60000); // add 1 minute
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  // Rest Timer core mechanism
  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      restTimerRef.current = setTimeout(() => {
        setRestTimeLeft(prev => prev - 1);
        if (soundEnabledRef.current) {
          triggerSound('click'); // micro sound clicks as it beats!
        }
      }, 1000);
    } else if (isResting && restTimeLeft === 0) {
      setIsResting(false);
      triggerSound('timer'); // buzzer beeper!
      triggerSound('success');
      alert('⚡ REST PERIOD TERMINATED. ENGAGE THE NEXT OVERLOAD CYCLE!');
    }
    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [isResting, restTimeLeft]);

  // Keep sound trigger helper reference synchronized
  const soundEnabledRef = useRef(true);

  const startRoutineSession = (splitName: string) => {
    triggerSound('success');
    const routineExercises = splitsPresets[splitName] || [];
    const nameMap: Record<string, string> = {
      ppl: 'Hypertrophy Push Routine (A)',
      brosplit: 'Bro-Split Chest & Triceps Telemetry',
      upperlower: 'Lower Kinetic Chain Focus'
    };

    const formattedExercises: WorkoutExercise[] = routineExercises.map(ex => ({
      name: ex.name,
      sets: Array.from({ length: ex.defaultSets }, () => ({
        reps: ex.defaultReps,
        weight: ex.defaultWeight,
        completed: false
      }))
    }));

    setActiveSession({
      name: nameMap[splitName] || 'Custom Training Matrix',
      duration: 0,
      exercises: formattedExercises
    });
    setSessionDuration(0);
  };

  const startBlankSession = () => {
    triggerSound('success');
    setActiveSession({
      name: 'Custom Physical Conditioning Routine',
      duration: 0,
      exercises: []
    });
    setSessionDuration(0);
  };

  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim() || !activeSession) return;
    triggerSound('click');
    const updatedExercises = [
      ...activeSession.exercises,
      {
        name: newExerciseName,
        sets: [{ reps: 10, weight: 20, completed: false }]
      }
    ];
    setActiveSession({
      ...activeSession,
      exercises: updatedExercises
    });
    setNewExerciseName('');
  };

  const handleAddSetToExercise = (exerciseIdx: number) => {
    if (!activeSession) return;
    triggerSound('click');
    const updatedExercises = [...activeSession.exercises];
    const prevSets = updatedExercises[exerciseIdx].sets;
    const lastSet = prevSets[prevSets.length - 1] || { reps: 10, weight: 20 };
    updatedExercises[exerciseIdx].sets.push({
      reps: lastSet.reps,
      weight: lastSet.weight,
      completed: false
    });
    setActiveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    if (!activeSession) return;
    triggerSound('click');
    const updatedExercises = [...activeSession.exercises];
    updatedExercises[exerciseIdx].sets.splice(setIdx, 1);
    setActiveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const handleUpdateSetValue = (exerciseIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    updatedExercises[exerciseIdx].sets[setIdx][field] = value;
    setActiveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const handleToggleSetCompletion = (exerciseIdx: number, setIdx: number) => {
    if (!activeSession) return;
    triggerSound('click');
    const updatedExercises = [...activeSession.exercises];
    const isCompletedNow = !updatedExercises[exerciseIdx].sets[setIdx].completed;
    updatedExercises[exerciseIdx].sets[setIdx].completed = isCompletedNow;
    
    setActiveSession({
      ...activeSession,
      exercises: updatedExercises
    });

    // Automatically trigger rest timer countdown
    if (isCompletedNow) {
      addXP(10); // small XP gain for set completion!
      setRestTimeLeft(restDuration);
      setIsResting(true);
    }
  };

  const triggerManualRestTimer = (seconds: number) => {
    triggerSound('click');
    setRestDuration(seconds);
    setRestTimeLeft(seconds);
    setIsResting(true);
  };

  const skipRestTimer = () => {
    triggerSound('click');
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const handleRemoveExercise = (exerciseIdx: number) => {
    if (!activeSession) return;
    triggerSound('click');
    const updatedExercises = [...activeSession.exercises];
    updatedExercises.splice(exerciseIdx, 1);
    setActiveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const handleSaveActiveSession = () => {
    if (!activeSession) return;
    
    // Safety check - check if at least one set completed
    const completedExercises = activeSession.exercises.filter(ex => 
      ex.sets.some(s => s.completed)
    );

    if (completedExercises.length === 0) {
      alert('⚠ HYPERTROPHY DATA BLANK. Please mark at least one completed set checkbox to synchronize session diagnostics.');
      return;
    }

    triggerSound('success');
    
    // Compile and log workout session
    const totalDuration = Math.max(15, sessionDuration);
    const calculatedCaloriesBurned = Math.round(totalDuration * 9.5); // ~9.5 cal/min hyper lifting

    addWorkoutSession({
      date: new Date().toISOString().split('T')[0],
      name: activeSession.name,
      duration: totalDuration,
      caloriesBurned: calculatedCaloriesBurned,
      exercises: completedExercises
    });

    setActiveSession(null);
    alert(`🎉 WORKOUT PROFILE LOCKED & COMPILED!\n⏱ Duration: ${totalDuration} Minutes\n🔥 Dissipated: ${calculatedCaloriesBurned} Kcal\n🛡 Level progress XP has synchronized!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">
            WORKOUT <span className={themeColors.text}>DASHBOARD</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            MANAGE TRAINING SPLITS • COMPILE LIFTING METRICS • OVERLOAD TRACKING
          </p>
        </div>

        <button
          onClick={() => setRoutineHistoryOpen(!routineHistoryOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs font-mono font-bold"
        >
          {routineHistoryOpen ? 'SHOW LOGGER MATRIX' : 'VIEW LIFTING HISTORY LOGS'}
          <ChevronDown className={`h-4 w-4 transform transition-transform ${routineHistoryOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Routine History Toggle View */}
      {routineHistoryOpen ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-purple-400" />
            SYNCHRONIZED LIFTING RECORDS
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {workoutSessions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                NO LIFTING CYCLES DETECTED IN LOCAL MEMORY DATABASE.
              </div>
            ) : (
              workoutSessions.map((w, index) => (
                <div key={w.id || index} className="rounded-xl border border-slate-900 bg-[#02000d] p-5 relative overflow-hidden group">
                  <button
                    onClick={() => deleteWorkoutSession(w.id)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-red-400 p-1.5 rounded bg-slate-950 border border-slate-900 opacity-0 group-hover:opacity-100 transition-all"
                    title="Purge session file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{w.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{w.date} • DURATION: {w.duration} MINS</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 uppercase">
                        {w.caloriesBurned} kcal burned
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 uppercase">
                        {w.exercises.length} Exercises Recorded
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-900">
                    {w.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 text-xs">
                        <div className="font-semibold text-slate-300 truncate mb-1.5">{ex.name}</div>
                        <div className="space-y-1 font-mono text-[10px] text-slate-500">
                          {ex.sets.map((set, setIdx) => (
                            <div key={setIdx} className="flex justify-between">
                              <span>Set {setIdx+1}</span>
                              <span className="text-purple-400 font-bold">{set.reps} reps @ {set.weight}kg</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Main active logger workspace */}
          {!activeSession ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Select Routines Box */}
              <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-purple-400 animate-pulse" />
                  CHOOSE ACTIVE MOVEMENT SPLIT
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {/* PPL Card */}
                  <button
                    onClick={() => setActiveTemplate('ppl')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      activeTemplate === 'ppl' 
                        ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-mono text-purple-400 font-bold mb-1">PUSH PULL LEGS</div>
                    <h4 className="text-sm font-bold text-white">Neural Hypertrophy</h4>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">Chest, Shoulders, Back, Arms, Legs routines mapped dynamically.</p>
                  </button>

                  {/* Bro Split Card */}
                  <button
                    onClick={() => setActiveTemplate('brosplit')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      activeTemplate === 'brosplit' 
                        ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-mono text-purple-400 font-bold mb-1">BRO SPLIT</div>
                    <h4 className="text-sm font-bold text-white">Volumetric Saturation</h4>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">Dedicating entire workout matrices directly to isolate single areas.</p>
                  </button>

                  {/* Upper Lower Card */}
                  <button
                    onClick={() => setActiveTemplate('upperlower')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      activeTemplate === 'upperlower' 
                        ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-mono text-purple-400 font-bold mb-1">UPPER LOWER</div>
                    <h4 className="text-sm font-bold text-white">Kinetic Chain Speed</h4>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">Splits heavy compound mechanics into upper torso vs lower base.</p>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => startRoutineSession(activeTemplate)}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${themeColors.gradient} ${themeColors.btnGlow} transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-white/10`}
                  >
                    <Play className="h-4 w-4 fill-white" /> Start {activeTemplate === 'ppl' ? 'Push Routine' : activeTemplate === 'brosplit' ? 'Bro Routine' : 'Lower Routine'}
                  </button>
                  <button
                    onClick={startBlankSession}
                    className="px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-all font-bold text-xs uppercase tracking-widest"
                  >
                    Initialize Custom Blank Session
                  </button>
                </div>
              </div>

              {/* Tips & Warnings Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Award className="h-4.5 w-4.5 text-yellow-400" />
                    TELEMETRY DISCOVERY
                  </h3>
                  <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                    <p>
                      💡 <strong className="text-white">Autoload Set Weights:</strong> Set values automatically clone from previous logs to accelerate progressive loading efficiency!
                    </p>
                    <p>
                      ⚡ <strong className="text-white">Level Progression:</strong> finalising a routine unlocks <strong className="text-white">+250 XP</strong>. Checking off single sets rewards <strong className="text-white">+10 XP</strong>!
                    </p>
                    <p>
                      🔊 <strong className="text-white">Smart Alarm:</strong> An embedded alarm triggers audio signals when your rest buffer countdown targets hit zero. Keep your heart rate optimized.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4 mt-4 flex items-center gap-2 text-[10px] text-slate-500 uppercase font-mono">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span>Bio-Timer fully calibrated</span>
                </div>
              </div>
            </div>
          ) : (
            /* Active Logger Screen */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Exercises Editor */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Active Session Header details */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-bold">Active Bio-Surgical Recording</span>
                    <h3 className="text-lg font-black text-white mt-0.5">{activeSession.name}</h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">TRAINING PACING</span>
                      <span className="text-lg font-black font-mono text-white animate-pulse">{sessionDuration} MINS</span>
                    </div>

                    <button
                      onClick={handleSaveActiveSession}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r ${themeColors.gradient} shadow-lg shadow-purple-500/20 uppercase tracking-wider border border-white/10`}
                    >
                      FINALIZE TRAINING
                    </button>
                  </div>
                </div>

                {/* Exercises Mapping List */}
                <div className="space-y-4">
                  {activeSession.exercises.length === 0 ? (
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-12 text-center text-slate-500 text-xs font-mono">
                      NO LIFTING ELEMENTS COMPILED. ADD EXERCISES BELOW TO SECURE RECORDINGS.
                    </div>
                  ) : (
                    activeSession.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 relative overflow-hidden">
                        <button
                          onClick={() => handleRemoveExercise(exIdx)}
                          className="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors"
                          title="Purge exercise node"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <span className={`inline-block h-2 w-2 rounded-full ${themeColors.gradient}`}></span>
                          {ex.name}
                        </h4>

                        {/* Set logs editor */}
                        <div className="space-y-2 mb-4">
                          <div className="grid grid-cols-12 gap-2 text-[10px] font-mono font-bold text-slate-500 uppercase px-2 mb-1">
                            <span className="col-span-2">SET</span>
                            <span className="col-span-4 text-center">WEIGHT (kg)</span>
                            <span className="col-span-4 text-center">REPETITIONS</span>
                            <span className="col-span-2 text-right">COMPLETED</span>
                          </div>

                          {ex.sets.map((set, setIdx) => (
                            <div 
                              key={setIdx} 
                              className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border ${
                                set.completed 
                                  ? 'border-purple-500/10 bg-purple-500/5' 
                                  : 'border-slate-800/80 bg-slate-950/60'
                              }`}
                            >
                              <div className="col-span-2 font-mono text-xs font-bold text-slate-400 flex items-center gap-2">
                                <span>#{setIdx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSet(exIdx, setIdx)}
                                  className="text-slate-600 hover:text-red-400"
                                >
                                  ×
                                </button>
                              </div>

                              <div className="col-span-4 flex justify-center">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={set.weight}
                                  onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'weight', Number(e.target.value))}
                                  className="w-20 text-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs text-white"
                                />
                              </div>

                              <div className="col-span-4 flex justify-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={set.reps}
                                  onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'reps', Number(e.target.value))}
                                  className="w-20 text-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs text-white"
                                />
                              </div>

                              <div className="col-span-2 flex justify-end pr-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSetCompletion(exIdx, setIdx)}
                                  className={`h-6 w-6 rounded border flex items-center justify-center transition-all ${
                                    set.completed
                                      ? 'bg-purple-500 border-purple-500 text-white'
                                      : 'border-slate-800 bg-slate-950 text-transparent'
                                  }`}
                                >
                                  ✓
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handleAddSetToExercise(exIdx)}
                          className="text-xs font-mono font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-all"
                        >
                          <Plus className="h-4 w-4" /> Add Set Record
                        </button>

                      </div>
                    ))
                  )}
                </div>

                {/* Add new Exercise Node Form */}
                <form onSubmit={handleAddCustomExercise} className="flex gap-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <input
                    type="text"
                    required
                    placeholder="Inject new exercise name (e.g. Incline Bench, Leg Press)..."
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-slate-600 focus:border-purple-500/50"
                  />
                  <button
                    type="submit"
                    className={`px-4 rounded-xl font-bold text-white bg-gradient-to-r ${themeColors.gradient} text-xs flex items-center gap-1.5`}
                  >
                    <Plus className="h-4.5 w-4.5" /> Add Exercise
                  </button>
                </form>

              </div>

              {/* Interactive Countdown Rest Timer sidebar */}
              <div className="space-y-4">
                
                {/* Rest Timer Panel */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md text-center relative overflow-hidden">
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    Telemetry Rest Pacer
                  </div>

                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 mt-2">
                    BIOMETRIC REST TIMER
                  </h3>

                  {/* Circular countdown visualization */}
                  <div className="relative h-44 w-44 mx-auto mb-6 flex items-center justify-center">
                    <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="80"
                        className="stroke-slate-900 fill-none"
                        strokeWidth="6"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r="80"
                        className="stroke-purple-500 fill-none transition-all duration-1000"
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 80}
                        strokeDashoffset={isResting && restDuration > 0 ? (2 * Math.PI * 80) * (1 - restTimeLeft / restDuration) : 0}
                      />
                    </svg>

                    <div className="text-center z-10">
                      <span className="text-4xl font-black font-mono text-white text-glow-purple">
                        {isResting ? restTimeLeft : restDuration}s
                      </span>
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                        {isResting ? 'RESTING' : 'READY TO PAC'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Controls */}
                  <div className="grid grid-cols-4 gap-1.5 mb-4">
                    {[30, 60, 90, 120].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => triggerManualRestTimer(sec)}
                        className={`py-2 rounded-lg border font-mono text-[10px] transition-all ${
                          restDuration === sec && isResting
                            ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {isResting ? (
                      <button
                        onClick={skipRestTimer}
                        className="flex-1 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-widest transition-all"
                      >
                        SKIP REST CYCLE
                      </button>
                    ) : (
                      <button
                        onClick={() => triggerManualRestTimer(restDuration)}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r ${themeColors.gradient} text-xs uppercase tracking-widest`}
                      >
                        TRIGGER TIMER
                      </button>
                    )}
                  </div>
                </div>

                {/* Cancel Session overlay */}
                <button
                  onClick={() => {
                    if(confirm("⚠ Disconnect current recording stream? Any unsaved telemetry will be permanently wiped.")){
                      triggerSound('click');
                      setActiveSession(null);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400/80 hover:text-red-400 font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  ABORT CURRENT LIFTING CYCLE
                </button>

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};
