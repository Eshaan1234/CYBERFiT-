import type {
  DailyLog,
  Experience,
  Goal,
  MacroSplit,
  PersonalRecord,
  ReadinessScore,
  UserProfile,
  WorkoutSession,
} from './types';

export const todayISO = () => new Date().toISOString().split('T')[0];

export const isoDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const round = (n: number, dp = 0) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

/* ============================== BMR / TDEE ============================== */

/** Mifflin–St Jeor, metric. */
export function bmr(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female' = 'male') {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'female' ? base - 161 : base + 5;
}

export const ACTIVITY_FACTORS: Record<Experience, number> = {
  beginner: 1.375,
  intermediate: 1.55,
  advanced: 1.725,
};

/** Goal-adjusted daily calorie target. */
export function calorieTarget(
  weightKg: number,
  heightCm: number,
  age: number,
  goal: Goal,
  experience: Experience,
  sex: 'male' | 'female' = 'male',
): number {
  const tdee = bmr(weightKg, heightCm, age, sex) * ACTIVITY_FACTORS[experience];
  const multiplier =
    goal === 'fat_loss' ? 0.8 : goal === 'muscle_gain' ? 1.12 : goal === 'endurance' ? 1.0 : 1.0;
  return Math.round((tdee * multiplier) / 10) * 10;
}

/** Protein-forward macro split keyed to goal. */
export function macroSplit(calories: number, weightKg: number, goal: Goal): MacroSplit {
  const proteinPerKg = goal === 'muscle_gain' ? 2.0 : goal === 'fat_loss' ? 2.2 : goal === 'endurance' ? 1.6 : 1.8;
  const protein = Math.round(weightKg * proteinPerKg);
  const fatPct = goal === 'fat_loss' ? 0.25 : 0.25;
  const fats = Math.round((calories * fatPct) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));
  return { calories, protein, carbs, fats };
}

export function waterTarget(weightKg: number) {
  return Math.round((weightKg * 35) / 250) * 250; // ~35ml/kg rounded to 250ml
}

export function recommendTargets(profile: Pick<UserProfile, 'weight' | 'height' | 'age' | 'goal' | 'experience'>) {
  const calories = calorieTarget(profile.weight, profile.height, profile.age, profile.goal, profile.experience);
  const macros = macroSplit(calories, profile.weight, profile.goal);
  return {
    targetCalories: calories,
    targetProtein: macros.protein,
    targetCarbs: macros.carbs,
    targetFats: macros.fats,
    targetWater: waterTarget(profile.weight),
  };
}

/* ============================== XP / LEVEL ============================== */

/** Quadratic curve: each level costs more than the last. */
export function xpForLevel(level: number) {
  return Math.round(500 * level ** 1.35);
}

export function levelProgress(xp: number, level: number) {
  const need = xpForLevel(level);
  return { current: xp, need, pct: clamp((xp / need) * 100, 0, 100), remaining: Math.max(0, need - xp) };
}

export function rankTitle(level: number) {
  if (level >= 40) return 'Singularity Agent';
  if (level >= 30) return 'Neural Titan';
  if (level >= 20) return 'Bio-Architect';
  if (level >= 12) return 'Hyper-Soldier';
  if (level >= 6) return 'Cybernetic Athlete';
  if (level >= 3) return 'Initiate';
  return 'Rookie Node';
}

/* ============================== READINESS ============================== */

export function readinessScore(
  logs: DailyLog[],
  workouts: WorkoutSession[],
  profile: UserProfile,
): ReadinessScore {
  const today = todayISO();
  const recent = [...logs].sort((a, b) => (a.date < b.date ? 1 : -1));
  const todayLog = recent.find((l) => l.date === today);
  const last7 = recent.slice(0, 7);

  // Sleep (35 pts)
  const sleep = todayLog?.sleepHours ?? average(last7.map((l) => l.sleepHours ?? 0)) ?? 0;
  const sleepPts = clamp((sleep / 8) * 35, 0, 35);

  // Recovery load: active minutes in last 3 days (25 pts) — too much = lower
  const last3 = recent.filter((l) => l.date >= isoDaysAgo(3));
  const load = last3.reduce((s, l) => s + l.activeMinutes, 0);
  const loadPts = load === 0 ? 18 : clamp(25 - Math.max(0, (load - 180) / 12), 5, 25);

  // Hydration (20 pts)
  const water = todayLog?.water ?? 0;
  const waterPts = clamp((water / profile.targetWater) * 20, 0, 20);

  // Protein adherence over 7 days (20 pts)
  const avgProtein = average(last7.map((l) => l.protein)) || 0;
  const proteinPts = clamp((avgProtein / Math.max(1, profile.targetProtein)) * 20, 0, 20);

  const score = Math.round(sleepPts + loadPts + waterPts + proteinPts);
  const label: ReadinessScore['label'] =
    score >= 85 ? 'Peak' : score >= 70 ? 'Primed' : score >= 50 ? 'Moderate' : 'Depleted';

  const factors = [
    { label: 'Sleep', value: sleep ? `${round(sleep, 1)}h` : 'not logged', impact: Math.round(sleepPts - 17) },
    { label: 'Training load', value: `${load} min / 3d`, impact: Math.round(loadPts - 17) },
    { label: 'Hydration', value: `${water} ml`, impact: Math.round(waterPts - 10) },
    { label: 'Protein avg', value: `${Math.round(avgProtein)} g`, impact: Math.round(proteinPts - 10) },
  ];

  const recommendation =
    score >= 85
      ? 'Systems optimal. Push a heavy compound block today — PR window is open.'
      : score >= 70
        ? 'Solid recovery. Train as programmed, keep RPE ≤ 8 on accessories.'
        : score >= 50
          ? 'Moderate readiness. Reduce volume 20% and prioritise technique work.'
          : 'Depleted state. Switch to a mobility / zone-2 session and sleep 8h+ tonight.';

  let workouts7 = workouts.filter((w) => w.date >= isoDaysAgo(7)).length;
  if (workouts7 > 6) factors.push({ label: 'Frequency', value: `${workouts7} sessions / 7d`, impact: -8 });

  return { score, label, factors, recommendation };
}

/* ============================== STREAKS ============================== */

export function computeStreak(logs: DailyLog[]) {
  const activeDays = new Set(
    logs
      .filter((l) => l.activeMinutes > 0 || l.calories > 0 || l.water > 0)
      .map((l) => l.date),
  );
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    if (activeDays.has(isoDaysAgo(i))) streak++;
    else if (i === 0) continue; // today not logged yet doesn't break streak
    else break;
  }
  return streak;
}

/* ============================== 1RM / PRS ============================== */

/** Epley formula. */
export function estimate1RM(weight: number, reps: number) {
  if (reps <= 1) return weight;
  return round(weight * (1 + reps / 30), 1);
}

export function personalRecords(workouts: WorkoutSession[]): PersonalRecord[] {
  const map = new Map<string, PersonalRecord>();
  for (const w of workouts) {
    for (const ex of w.exercises) {
      for (const s of ex.sets) {
        if (!s.completed || s.weight <= 0) continue;
        const est = estimate1RM(s.weight, s.reps);
        const prev = map.get(ex.name);
        if (!prev || est > prev.estimated1RM) {
          map.set(ex.name, {
            exercise: ex.name,
            weight: s.weight,
            reps: s.reps,
            estimated1RM: est,
            date: w.date,
          });
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => b.estimated1RM - a.estimated1RM);
}

export function totalVolume(workouts: WorkoutSession[]) {
  return workouts.reduce(
    (sum, w) =>
      sum +
      w.exercises.reduce(
        (es, ex) => es + ex.sets.filter((s) => s.completed).reduce((ss, s) => ss + s.weight * s.reps, 0),
        0,
      ),
    0,
  );
}

/* ============================== TRENDS ============================== */

export function average(nums: number[]) {
  const valid = nums.filter((n) => Number.isFinite(n) && n > 0);
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function linearTrend(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - meanX) * (values[i] - meanY), 0);
  const den = xs.reduce((s, x) => s + (x - meanX) ** 2, 0);
  if (!den) return 0;
  return num / den;
}

/** Linear-regression forecast of bodyweight N days ahead. */
export function weightForecast(logs: DailyLog[], ahead = 14) {
  const points = [...logs]
    .filter((l) => l.weight && l.weight > 0)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-21);
  if (points.length < 3) return null;
  const values = points.map((p) => p.weight as number);
  const slope = linearTrend(values);
  const last = values[values.length - 1];
  return {
    slopePerDay: round(slope, 3),
    slopePerWeek: round(slope * 7, 2),
    projected: round(last + slope * ahead, 1),
    days: ahead,
  };
}

/* ============================== UNITS ============================== */

export const kgToLb = (kg: number) => round(kg * 2.2046226218, 1);
export const lbToKg = (lb: number) => round(lb / 2.2046226218, 1);
export const cmToIn = (cm: number) => round(cm / 2.54, 1);
export const mlToOz = (ml: number) => round(ml / 29.5735, 1);

export const formatWeight = (kg: number, units: 'metric' | 'imperial' = 'metric') =>
  units === 'imperial' ? `${kgToLb(kg)} lb` : `${round(kg, 1)} kg`;

/* ============================== PYRAMID TEMPLATES ============================== */

export const EXERCISE_LIBRARY: Record<string, string[]> = {
  chest: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Dips', 'Push-Up'],
  back: ['Deadlift', 'Barbell Row', 'Weighted Pull Up', 'Lat Pulldown', 'Seated Cable Row'],
  shoulders: ['Overhead Press', 'Cable Lateral Raise', 'Face Pull', 'Rear Delt Fly'],
  legs: ['Back Squat', 'Front Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Walking Lunge'],
  arms: ['Barbell Curl', 'Incline Hammer Curl', 'Triceps Rope Pushdown', 'Skull Crusher', 'Preacher Curl'],
  core: ['Hanging Leg Raise', 'Cable Crunch', 'Plank', 'Ab Wheel Rollout'],
  cardio: ['Incline Treadmill Walk', 'Rowing Intervals', 'Assault Bike Sprint', 'Zone-2 Run'],
};

export interface WorkoutTemplate {
  key: string;
  name: string;
  focus: string;
  duration: number;
  estimateCalories: number;
  exercises: { name: string; group: string; sets: number; reps: number; weight: number }[];
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    key: 'ppl_push',
    name: 'Push Protocol (A)',
    focus: 'Chest · Shoulders · Triceps',
    duration: 55,
    estimateCalories: 480,
    exercises: [
      { name: 'Barbell Bench Press', group: 'chest', sets: 4, reps: 8, weight: 60 },
      { name: 'Incline Dumbbell Press', group: 'chest', sets: 3, reps: 10, weight: 22 },
      { name: 'Overhead Press', group: 'shoulders', sets: 3, reps: 8, weight: 35 },
      { name: 'Cable Lateral Raise', group: 'shoulders', sets: 3, reps: 15, weight: 10 },
      { name: 'Triceps Rope Pushdown', group: 'arms', sets: 3, reps: 12, weight: 25 },
    ],
  },
  {
    key: 'ppl_pull',
    name: 'Pull Protocol (A)',
    focus: 'Back · Biceps · Rear Delts',
    duration: 60,
    estimateCalories: 520,
    exercises: [
      { name: 'Deadlift', group: 'back', sets: 4, reps: 5, weight: 100 },
      { name: 'Weighted Pull Up', group: 'back', sets: 3, reps: 8, weight: 10 },
      { name: 'Barbell Row', group: 'back', sets: 3, reps: 10, weight: 60 },
      { name: 'Face Pull', group: 'shoulders', sets: 3, reps: 15, weight: 20 },
      { name: 'Incline Hammer Curl', group: 'arms', sets: 3, reps: 12, weight: 14 },
    ],
  },
  {
    key: 'ppl_legs',
    name: 'Leg Protocol (A)',
    focus: 'Quads · Hamstrings · Calves',
    duration: 65,
    estimateCalories: 620,
    exercises: [
      { name: 'Back Squat', group: 'legs', sets: 4, reps: 6, weight: 90 },
      { name: 'Romanian Deadlift', group: 'legs', sets: 3, reps: 10, weight: 70 },
      { name: 'Leg Press', group: 'legs', sets: 3, reps: 12, weight: 120 },
      { name: 'Leg Curl', group: 'legs', sets: 3, reps: 12, weight: 40 },
      { name: 'Hanging Leg Raise', group: 'core', sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    key: 'upper_hypertrophy',
    name: 'Upper Hypertrophy',
    focus: 'Full upper body pump',
    duration: 50,
    estimateCalories: 430,
    exercises: [
      { name: 'Incline Dumbbell Press', group: 'chest', sets: 4, reps: 10, weight: 24 },
      { name: 'Lat Pulldown', group: 'back', sets: 4, reps: 12, weight: 55 },
      { name: 'Cable Fly', group: 'chest', sets: 3, reps: 15, weight: 15 },
      { name: 'Cable Lateral Raise', group: 'shoulders', sets: 3, reps: 15, weight: 10 },
      { name: 'Barbell Curl', group: 'arms', sets: 3, reps: 12, weight: 25 },
    ],
  },
  {
    key: 'hiit',
    name: 'Metabolic HIIT Burn',
    focus: 'Conditioning · Fat oxidation',
    duration: 30,
    estimateCalories: 380,
    exercises: [
      { name: 'Assault Bike Sprint', group: 'cardio', sets: 8, reps: 1, weight: 0 },
      { name: 'Rowing Intervals', group: 'cardio', sets: 4, reps: 1, weight: 0 },
      { name: 'Walking Lunge', group: 'legs', sets: 3, reps: 20, weight: 10 },
      { name: 'Plank', group: 'core', sets: 3, reps: 1, weight: 0 },
    ],
  },
  {
    key: 'mobility',
    name: 'Recovery & Mobility Flow',
    focus: 'Active recovery · Zone 2',
    duration: 25,
    estimateCalories: 160,
    exercises: [
      { name: 'Zone-2 Run', group: 'cardio', sets: 1, reps: 1, weight: 0 },
      { name: 'Ab Wheel Rollout', group: 'core', sets: 3, reps: 10, weight: 0 },
      { name: 'Plank', group: 'core', sets: 3, reps: 1, weight: 0 },
    ],
  },
];

export function templateToExercises(t: WorkoutTemplate): WorkoutSession['exercises'] {
  return t.exercises.map((e) => ({
    name: e.name,
    muscleGroup: e.group,
    sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: e.weight, completed: false })),
  }));
}
