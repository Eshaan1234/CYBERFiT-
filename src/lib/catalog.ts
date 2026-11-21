import type { Achievement, Challenge } from './types';
import { isoDaysAgo, todayISO, totalVolume, personalRecords } from './fitness';

export const ACHIEVEMENT_CATALOG: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_workout', title: 'First Drop of Sweat', description: 'Log your first workout session', icon: 'Flame', xpReward: 150, category: 'consistency' },
  { id: 'workouts_10', title: 'Protocol Veteran', description: 'Complete 10 logged workouts', icon: 'Dumbbell', xpReward: 400, category: 'consistency' },
  { id: 'workouts_50', title: 'Iron Machine', description: 'Complete 50 logged workouts', icon: 'Cpu', xpReward: 1200, category: 'consistency' },
  { id: 'streak_3', title: 'Tri-Athlete', description: 'Hold a 3-day logging streak', icon: 'Zap', xpReward: 300, category: 'consistency' },
  { id: 'streak_7', title: 'Unstoppable Force', description: 'Hold a 7-day logging streak', icon: 'ShieldAlert', xpReward: 500, category: 'consistency' },
  { id: 'streak_30', title: 'Neural Discipline', description: 'Hold a 30-day logging streak', icon: 'ShieldCheck', xpReward: 2000, category: 'consistency' },
  { id: 'water_champ', title: 'Hydration Overlord', description: 'Hit your daily water target', icon: 'Droplet', xpReward: 200, category: 'nutrition' },
  { id: 'water_week', title: 'Coolant Master', description: 'Hit water target 5 days in a row', icon: 'Waves', xpReward: 450, category: 'nutrition' },
  { id: 'nutrition_pro', title: 'Calorie Master', description: 'Land within 10% of your calorie target', icon: 'Utensils', xpReward: 250, category: 'nutrition' },
  { id: 'protein_king', title: 'Protein Synthesizer', description: 'Hit your protein target in a day', icon: 'Beef', xpReward: 220, category: 'nutrition' },
  { id: 'heavy_lifter', title: 'Titanium Bones', description: 'Log a set at 100 kg or heavier', icon: 'Award', xpReward: 400, category: 'strength' },
  { id: 'volume_10k', title: 'Ten Tonnes', description: 'Move 10,000 kg of total volume', icon: 'TrendingUp', xpReward: 600, category: 'strength' },
  { id: 'pr_hunter', title: 'PR Hunter', description: 'Set 5 estimated personal records', icon: 'Trophy', xpReward: 550, category: 'strength' },
  { id: 'ai_coach', title: 'Artificial Synergy', description: 'Consult the AI coach', icon: 'Bot', xpReward: 150, category: 'exploration' },
  { id: 'ai_week', title: 'Cognitive Overclock', description: 'Chat with the coach 7 times', icon: 'BrainCircuit', xpReward: 350, category: 'exploration' },
  { id: 'photogenic', title: 'Aesthetic Evolution', description: 'Log a progress photo', icon: 'Camera', xpReward: 200, category: 'exploration' },
  { id: 'analyst', title: 'Telemetry Analyst', description: 'Review the analytics engine', icon: 'Activity', xpReward: 100, category: 'exploration' },
  { id: 'community_1', title: 'Signal Emitted', description: 'Post to the community feed', icon: 'Radio', xpReward: 180, category: 'social' },
  { id: 'supporter', title: 'Grid Supporter', description: 'Like 5 community posts', icon: 'Heart', xpReward: 200, category: 'social' },
  { id: 'challenge_1', title: 'Mission Accepted', description: 'Claim your first weekly challenge', icon: 'Target', xpReward: 250, category: 'social' },
];

export function initialAchievements(): Achievement[] {
  return ACHIEVEMENT_CATALOG.map((a) => ({ ...a, unlockedAt: null }));
}

/**
 * Weekly challenges. Progress functions are pure so the UI can render live
 * progress rings without any network round-trips.
 */
export const CHALLENGES: Challenge[] = [
  {
    key: 'week_4_workouts',
    title: 'Quad Protocol',
    description: 'Complete 4 workouts this week',
    xp: 500,
    icon: 'Dumbbell',
    progress: (c) => ({
      current: c.workouts.filter((w) => w.date >= isoDaysAgo(7)).length,
      target: 4,
    }),
  },
  {
    key: 'week_hydration',
    title: 'Hydro Loop',
    description: 'Hit your water target 5 days in a row',
    xp: 400,
    icon: 'Droplet',
    progress: (c) => {
      const days = c.daily.filter((d) => d.water >= c.profile.targetWater).length;
      return { current: Math.min(days, 5), target: 5 };
    },
  },
  {
    key: 'week_protein',
    title: 'Protein Lock',
    description: 'Reach your protein target 4 times',
    xp: 450,
    icon: 'Beef',
    progress: (c) => ({
      current: c.daily.filter((d) => d.protein >= c.profile.targetProtein * 0.9).length,
      target: 4,
    }),
  },
  {
    key: 'week_volume',
    title: 'Volume Surge',
    description: 'Move 20,000 kg of total tonnage',
    xp: 600,
    icon: 'Activity',
    progress: (c) => ({
      current: Math.round(totalVolume(c.workouts.filter((w) => w.date >= isoDaysAgo(7)))),
      target: 20000,
    }),
  },
  {
    key: 'week_consistency',
    title: 'Ghost Protocol',
    description: 'Log nutrition or training 6 days running',
    xp: 550,
    icon: 'Flame',
    progress: (c) => {
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const day = isoDaysAgo(i);
        const logged = c.daily.some((d) => d.date === day && (d.calories > 0 || d.activeMinutes > 0));
        if (logged) streak++;
        else if (i === 0) continue;
        else break;
      }
      return { current: Math.min(streak, 6), target: 6 };
    },
  },
  {
    key: 'week_pr',
    title: 'Overload Engine',
    description: 'Hold 3 personal records in the library',
    xp: 350,
    icon: 'Trophy',
    progress: (c) => ({ current: Math.min(personalRecords(c.workouts).length, 3), target: 3 }),
  },
];

/** Achievement ids that should unlock given the current data snapshot. */
export function evaluateAchievements(ctx: {
  workouts: { date: string; exercises: { name: string; sets: { reps: number; weight: number; completed: boolean }[] }[] }[];
  meals: { calories: number; protein: number }[];
  daily: { date: string; water: number; calories: number; protein: number; activeMinutes: number }[];
  profile: { streak: number; targetWater: number; targetCalories: number; targetProtein: number };
  photos: unknown[];
  chatCount: number;
  postCount: number;
  likeCount: number;
  claimedChallenges: number;
  viewedAnalytics: boolean;
}): string[] {
  const unlocked: string[] = [];
  const w = ctx.workouts ?? [];
  const heavy = w.some((s) => s.exercises.some((e) => e.sets.some((s2) => s2.weight >= 100 && s2.completed)));
  const volume = w.reduce(
    (sum, s) =>
      sum + s.exercises.reduce((es, e) => es + e.sets.filter((x) => x.completed).reduce((ss, x) => ss + x.weight * x.reps, 0), 0),
    0,
  );
  const prs = personalRecords(w as never).length;

  if (w.length >= 1) unlocked.push('first_workout');
  if (w.length >= 10) unlocked.push('workouts_10');
  if (w.length >= 50) unlocked.push('workouts_50');
  if (ctx.profile.streak >= 3) unlocked.push('streak_3');
  if (ctx.profile.streak >= 7) unlocked.push('streak_7');
  if (ctx.profile.streak >= 30) unlocked.push('streak_30');
  if (heavy) unlocked.push('heavy_lifter');
  if (volume >= 10000) unlocked.push('volume_10k');
  if (prs >= 5) unlocked.push('pr_hunter');

  const today = ctx.daily.find((d) => d.date === todayISO());
  if (today && today.water >= ctx.profile.targetWater) unlocked.push('water_champ');
  if (today && Math.abs(today.calories - ctx.profile.targetCalories) <= ctx.profile.targetCalories * 0.1 && today.calories > 0)
    unlocked.push('nutrition_pro');
  if (today && today.protein >= ctx.profile.targetProtein) unlocked.push('protein_king');

  const waterDays = ctx.daily.filter((d) => d.water >= ctx.profile.targetWater).length;
  if (waterDays >= 5) unlocked.push('water_week');

  if (ctx.chatCount >= 1) unlocked.push('ai_coach');
  if (ctx.chatCount >= 7) unlocked.push('ai_week');
  if (ctx.photos.length >= 1) unlocked.push('photogenic');
  if (ctx.viewedAnalytics) unlocked.push('analyst');
  if (ctx.postCount >= 1) unlocked.push('community_1');
  if (ctx.likeCount >= 5) unlocked.push('supporter');
  if (ctx.claimedChallenges >= 1) unlocked.push('challenge_1');

  return unlocked;
}
