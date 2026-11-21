/* ============================================================================
   CYBERNET.FIT — Domain model
   Mirrors the Supabase schema in /supabase/migrations. Keep in sync.
   ========================================================================== */

export type Goal = 'fat_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type ThemeKey = 'cyan' | 'purple' | 'pink' | 'emerald' | 'amber';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Tab =
  | 'dashboard'
  | 'workouts'
  | 'nutrition'
  | 'ai-coach'
  | 'body-progress'
  | 'analytics'
  | 'community'
  | 'smarts'
  | 'achievements'
  | 'settings';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  age: number;
  height: number;
  weight: number;
  goal: Goal;
  experience: Experience;
  level: number;
  xp: number;
  streak: number;
  longestStreak: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWater: number;
  targetSteps: number;
  theme: ThemeKey;
  soundEnabled: boolean;
  units: 'metric' | 'imperial';
  onboardingCompleted: boolean;
  bio?: string;
  isPublic: boolean;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  name: string;
  muscleGroup?: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  duration: number; // minutes
  caloriesBurned: number;
  notes?: string;
  exercises: WorkoutExercise[];
}

export interface MealLog {
  id: string;
  date?: string;
  time: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type: MealType;
}

export interface DailyLog {
  date: string;
  water: number; // ml
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weight: number | null;
  activeMinutes: number;
  caloriesBurned: number;
  steps: number;
  sleepHours?: number | null;
  mood?: number | null;
  notes?: string | null;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  weight: number;
  photoBefore: string;
  photoAfter: string;
  chest?: number;
  waist?: number;
  biceps?: number;
  thighs?: number;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  xpReward: number;
  category: 'consistency' | 'strength' | 'nutrition' | 'exploration' | 'social';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface GoalTask {
  id: string;
  text: string;
  completed: boolean;
  xp: number;
}

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorLevel: number;
  authorAvatar?: string | null;
  body: string;
  kind: 'update' | 'workout' | 'pr' | 'photo' | 'milestone';
  imageUrl?: string | null;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  mine: boolean;
}

export interface Challenge {
  key: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  progress: (ctx: ChallengeContext) => { current: number; target: number };
  claimed?: boolean;
}

export interface ChallengeContext {
  workouts: WorkoutSession[];
  meals: MealLog[];
  daily: DailyLog[];
  profile: UserProfile;
  photos: ProgressPhoto[];
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  date: string;
}

/* ---------- View-model helpers ---------- */

export interface MacroSplit {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface ReadinessScore {
  score: number;
  label: 'Peak' | 'Primed' | 'Moderate' | 'Depleted';
  factors: { label: string; value: string; impact: number }[];
  recommendation: string;
}
