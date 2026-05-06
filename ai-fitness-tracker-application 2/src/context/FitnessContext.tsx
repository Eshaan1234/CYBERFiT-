import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  goal: 'fat_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
  experience: 'beginner' | 'intermediate' | 'advanced';
  level: number;
  xp: number;
  streak: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  targetWater: number; // in ml
}

export interface WorkoutExercise {
  name: string;
  sets: Array<{
    reps: number;
    weight: number;
    completed: boolean;
  }>;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  duration: number; // minutes
  caloriesBurned: number;
  exercises: WorkoutExercise[];
}

export interface MealLog {
  id: string;
  time: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyLog {
  date: string;
  water: number; // ml
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weight: number;
  activeMinutes: number;
  caloriesBurned: number;
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
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  xpReward: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface FitnessContextType {
  user: UserProfile;
  isLoggedIn: boolean;
  onboardingCompleted: boolean;
  activeTheme: 'cyan' | 'purple' | 'pink' | 'emerald' | 'amber';
  soundEnabled: boolean;
  activeTab: string;
  workoutSessions: WorkoutSession[];
  mealLogs: MealLog[];
  dailyHistory: DailyLog[];
  progressPhotos: ProgressPhoto[];
  achievements: Achievement[];
  chatHistory: ChatMessage[];
  showLevelUp: { show: boolean; oldLevel: number; newLevel: number } | null;
  recentNotification: { title: string; desc: string; type: 'info' | 'achievement' | 'levelUp' } | null;
  
  // Actions
  login: (email: string, name: string) => void;
  logout: () => void;
  register: (email: string, name: string, details: Partial<UserProfile>) => void;
  completeOnboarding: (details: Partial<UserProfile>) => void;
  setProfile: (details: Partial<UserProfile>) => void;
  setTheme: (theme: 'cyan' | 'purple' | 'pink' | 'emerald' | 'amber') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setActiveTab: (tab: string) => void;
  
  // Workout actions
  addWorkoutSession: (session: Omit<WorkoutSession, 'id'>) => void;
  deleteWorkoutSession: (id: string) => void;
  
  // Nutrition actions
  addMeal: (meal: Omit<MealLog, 'id'>) => void;
  deleteMeal: (id: string) => void;
  addWater: (amount: number) => void;
  
  // Progress actions
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  addWeightLog: (weight: number) => void;
  
  // Chat actions
  sendChatMessage: (text: string) => void;
  clearChatHistory: () => void;
  
  // Utility actions
  addXP: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  dismissLevelUp: () => void;
  dismissNotification: () => void;
  triggerSound: (type: 'click' | 'success' | 'level' | 'timer') => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

// Initial default achievements
const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_workout', title: 'First Drop of Sweat', description: 'Complete your first tracked workout exercise', icon: 'Flame', unlockedAt: '2026-03-01T10:00:00Z', xpReward: 150 },
  { id: 'water_champ', title: 'Hydration Overlord', description: 'Reach your daily 3L water goal for the first time', icon: 'Droplet', unlockedAt: null, xpReward: 200 },
  { id: 'nutrition_pro', title: 'Calorie Master', description: 'Log a full day of meals fitting your goal targets', icon: 'Utensils', unlockedAt: '2026-03-02T19:30:00Z', xpReward: 250 },
  { id: 'streak_3', title: 'Tri-Athlete', description: 'Maintain a fitness logging streak of 3 days', icon: 'Zap', unlockedAt: '2026-03-03T18:00:00Z', xpReward: 300 },
  { id: 'streak_7', title: 'Unstoppable Force', description: 'Maintain a 7-day workout and log consistency streak', icon: 'ShieldAlert', unlockedAt: null, xpReward: 500 },
  { id: 'ai_coach', title: 'Artificial Synergy', description: 'Generate your first personalized AI fitness routine', icon: 'Bot', unlockedAt: null, xpReward: 150 },
  { id: 'photogenic', title: 'Aesthetic Evolution', description: 'Log a new progress photo to track structural changes', icon: 'Camera', unlockedAt: '2026-03-01T15:00:00Z', xpReward: 200 },
  { id: 'heavy_lifter', title: 'Titanium Bones', description: 'Log an exercise weight set of 100kg (220lbs) or more', icon: 'Award', unlockedAt: null, xpReward: 400 },
];

const DEFAULT_USER: UserProfile = {
  name: 'Alex Mercer',
  email: 'alex.mercer@cybernet.fit',
  age: 26,
  height: 182,
  weight: 81.5,
  goal: 'muscle_gain',
  experience: 'intermediate',
  level: 4,
  xp: 680,
  streak: 5,
  targetCalories: 2900,
  targetProtein: 165,
  targetCarbs: 350,
  targetFats: 90,
  targetWater: 3000,
};

const DEFAULT_DAILY_HISTORY: DailyLog[] = [
  { date: '2026-02-27', water: 2500, calories: 2750, protein: 145, carbs: 320, fats: 85, weight: 81.0, activeMinutes: 45, caloriesBurned: 450 },
  { date: '2026-02-28', water: 3000, calories: 2950, protein: 170, carbs: 360, fats: 88, weight: 81.2, activeMinutes: 60, caloriesBurned: 600 },
  { date: '2026-03-01', water: 2750, calories: 2840, protein: 160, carbs: 340, fats: 92, weight: 81.3, activeMinutes: 50, caloriesBurned: 520 },
  { date: '2026-03-02', water: 3250, calories: 3050, protein: 175, carbs: 380, fats: 95, weight: 81.1, activeMinutes: 75, caloriesBurned: 720 },
  { date: '2026-03-03', water: 3000, calories: 2910, protein: 168, carbs: 355, fats: 89, weight: 81.4, activeMinutes: 65, caloriesBurned: 630 },
  { date: '2026-03-04', water: 2250, calories: 2400, protein: 130, carbs: 290, fats: 78, weight: 81.5, activeMinutes: 30, caloriesBurned: 310 },
  { date: '2026-03-05', water: 1500, calories: 1850, protein: 110, carbs: 210, fats: 62, weight: 81.5, activeMinutes: 45, caloriesBurned: 480 }, // Today (partial)
];

const DEFAULT_MEALS: MealLog[] = [
  { id: 'm1', time: '08:30 AM', name: 'Cyber Protein Oats & Blueberries', calories: 580, protein: 42, carbs: 75, fats: 12, type: 'breakfast' },
  { id: 'm2', time: '01:15 PM', name: 'Teriyaki Chicken, Jasmine Rice & Broccoli', calories: 720, protein: 55, carbs: 90, fats: 14, type: 'lunch' },
  { id: 'm3', time: '04:45 PM', name: 'Whey Isolate Shake & Banana', calories: 310, protein: 30, carbs: 40, fats: 3, type: 'snack' },
  { id: 'm4', time: '08:00 PM', name: 'Baked Salmon, Sweet Potato & Asparagus', calories: 640, protein: 45, carbs: 65, fats: 22, type: 'dinner' },
];

const DEFAULT_WORKOUTS: WorkoutSession[] = [
  {
    id: 'w1',
    date: '2026-03-01',
    name: 'Push Routine (A)',
    duration: 55,
    caloriesBurned: 520,
    exercises: [
      {
        name: 'Incline Dumbbell Press',
        sets: [
          { reps: 10, weight: 32, completed: true },
          { reps: 8, weight: 34, completed: true },
          { reps: 8, weight: 34, completed: true },
        ],
      },
      {
        name: 'Barbell Bench Press',
        sets: [
          { reps: 10, weight: 80, completed: true },
          { reps: 8, weight: 90, completed: true },
          { reps: 6, weight: 100, completed: true }, // triggers heavy_lifter!
        ],
      },
      {
        name: 'Cable Lateral Raises',
        sets: [
          { reps: 15, weight: 12, completed: true },
          { reps: 12, weight: 15, completed: true },
          { reps: 12, weight: 15, completed: true },
        ],
      },
    ],
  },
  {
    id: 'w2',
    date: '2026-03-03',
    name: 'Pull Routine (A)',
    duration: 65,
    caloriesBurned: 630,
    exercises: [
      {
        name: 'Weighted Pull Ups',
        sets: [
          { reps: 8, weight: 10, completed: true },
          { reps: 8, weight: 15, completed: true },
          { reps: 6, weight: 20, completed: true },
        ],
      },
      {
        name: 'Barbell Row',
        sets: [
          { reps: 10, weight: 70, completed: true },
          { reps: 10, weight: 75, completed: true },
          { reps: 8, weight: 80, completed: true },
        ],
      },
      {
        name: 'Incline Dumbbell Hammer Curls',
        sets: [
          { reps: 12, weight: 16, completed: true },
          { reps: 10, weight: 18, completed: true },
          { reps: 10, weight: 18, completed: true },
        ],
      },
    ],
  },
];

const DEFAULT_PHOTOS: ProgressPhoto[] = [
  {
    id: 'p1',
    date: '2026-01-15',
    weight: 84.2,
    photoBefore: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop', // Stock fitness before
    photoAfter: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop', // Stock fitness mid
    chest: 102,
    waist: 88,
    biceps: 38,
    thighs: 58,
  },
  {
    id: 'p2',
    date: '2026-03-01',
    weight: 81.5,
    photoBefore: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
    photoAfter: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop', // Stock fitness shredded after
    chest: 106,
    waist: 81,
    biceps: 41,
    thighs: 59,
  }
];

const DEFAULT_CHAT: ChatMessage[] = [
  { id: 'c1', sender: 'ai', text: `Greetings Alex! I am CyberGym AI v2.9, your neural fitness architect. I've analyzed your bio-profile (26 years, 182cm, 81.5kg, targeting Lean Muscle Mass). You are in an active 5-day streak! Ready to push past human limits today?`, timestamp: '2026-03-05T08:00:00Z' },
  { id: 'c2', sender: 'user', text: `Yes, what is my recommended protein target today?`, timestamp: '2026-03-05T08:02:00Z' },
  { id: 'c3', sender: 'ai', text: `Based on your hypertrophy profile, your optimal daily protein threshold is **165 grams**. You have currently registered **110 grams** from your morning oats, teriyaki chicken, and pre-workout shake. You require **55 grams** more. I recommend wild salmon or casein protein before sleep.`, timestamp: '2026-03-05T08:02:15Z' },
];

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('fit_isLoggedIn');
    return saved ? JSON.parse(saved) : true; // default true for amazing immediate UX, can log out
  });

  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    const saved = localStorage.getItem('fit_onboardingCompleted');
    return saved ? JSON.parse(saved) : true; // pre-completed
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fit_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [activeTheme, setTheme] = useState<'cyan' | 'purple' | 'pink' | 'emerald' | 'amber'>(() => {
    const saved = localStorage.getItem('fit_theme');
    return (saved as any) || 'purple';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('fit_sound');
    return saved ? JSON.parse(saved) : true;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('fit_workouts');
    return saved ? JSON.parse(saved) : DEFAULT_WORKOUTS;
  });

  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => {
    const saved = localStorage.getItem('fit_meals');
    return saved ? JSON.parse(saved) : DEFAULT_MEALS;
  });

  const [dailyHistory, setDailyHistory] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('fit_history');
    return saved ? JSON.parse(saved) : DEFAULT_DAILY_HISTORY;
  });

  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>(() => {
    const saved = localStorage.getItem('fit_photos');
    return saved ? JSON.parse(saved) : DEFAULT_PHOTOS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('fit_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('fit_chat');
    return saved ? JSON.parse(saved) : DEFAULT_CHAT;
  });

  const [showLevelUp, setShowLevelUp] = useState<{ show: boolean; oldLevel: number; newLevel: number } | null>(null);
  const [recentNotification, setRecentNotification] = useState<{ title: string; desc: string; type: 'info' | 'achievement' | 'levelUp' } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('fit_isLoggedIn', JSON.stringify(isLoggedIn));
    localStorage.setItem('fit_onboardingCompleted', JSON.stringify(onboardingCompleted));
    localStorage.setItem('fit_user', JSON.stringify(user));
    localStorage.setItem('fit_theme', activeTheme);
    localStorage.setItem('fit_sound', JSON.stringify(soundEnabled));
    localStorage.setItem('fit_workouts', JSON.stringify(workoutSessions));
    localStorage.setItem('fit_meals', JSON.stringify(mealLogs));
    localStorage.setItem('fit_history', JSON.stringify(dailyHistory));
    localStorage.setItem('fit_photos', JSON.stringify(progressPhotos));
    localStorage.setItem('fit_achievements', JSON.stringify(achievements));
    localStorage.setItem('fit_chat', JSON.stringify(chatHistory));
  }, [isLoggedIn, onboardingCompleted, user, activeTheme, soundEnabled, workoutSessions, mealLogs, dailyHistory, progressPhotos, achievements, chatHistory]);

  // Audio synthesize system (Web Audio API)
  const triggerSound = (type: 'click' | 'success' | 'level' | 'timer') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'level') {
        // High-tech chord
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        osc2.connect(gain);
        osc3.connect(gain);

        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc2.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
        osc3.frequency.setValueAtTime(392.00, ctx.currentTime); // G4

        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.15); // C5
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15); // G5

        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        
        osc.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc3.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
        osc2.stop(ctx.currentTime + 0.8);
        osc3.stop(ctx.currentTime + 0.8);
      } else if (type === 'timer') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.log('Audio Context not allowed or failed:', e);
    }
  };

  const login = (email: string, name: string) => {
    setIsLoggedIn(true);
    setUser(prev => ({
      ...prev,
      name: name || prev.name,
      email: email || prev.email
    }));
    triggerSound('success');
    setRecentNotification({
      title: 'Authenticated Successfully',
      desc: `Welcome back to CyberNet, Agent ${name ? name.split(' ')[0] : 'Alex'}. Syncing biometric data...`,
      type: 'info'
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setOnboardingCompleted(false);
    triggerSound('click');
  };

  const register = (email: string, name: string, details: Partial<UserProfile>) => {
    setIsLoggedIn(true);
    setOnboardingCompleted(true);
    const updatedUser = {
      ...DEFAULT_USER,
      ...details,
      name,
      email,
      level: 1,
      xp: 0,
      streak: 1,
    };
    setUser(updatedUser);
    triggerSound('level');
    setRecentNotification({
      title: 'Neural Profile Initialized',
      desc: `Biometric node registered for ${name}. Let's begin the evolution.`,
      type: 'info'
    });
  };

  const completeOnboarding = (details: Partial<UserProfile>) => {
    setOnboardingCompleted(true);
    setUser(prev => ({
      ...prev,
      ...details,
      targetCalories: details.goal === 'fat_loss' ? 1900 
                    : details.goal === 'muscle_gain' ? 3000 
                    : details.goal === 'maintenance' ? 2400 : 2500,
      targetProtein: Math.round((details.weight || prev.weight) * 2),
      targetCarbs: details.goal === 'fat_loss' ? 180 
                 : details.goal === 'muscle_gain' ? 380 
                 : details.goal === 'maintenance' ? 250 : 300,
      targetFats: Math.round(((details.weight || prev.weight) * 1.1)),
    }));
    triggerSound('success');
  };

  const setProfile = (details: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...details }));
    triggerSound('success');
  };

  const addXP = (amount: number) => {
    setUser(prev => {
      const totalXp = prev.xp + amount;
      const xpNeeded = prev.level * 1000;
      if (totalXp >= xpNeeded) {
        // Level up!
        const extraXp = totalXp - xpNeeded;
        const newLevel = prev.level + 1;
        
        // Trigger Level up modal & sound
        setTimeout(() => {
          setShowLevelUp({ show: true, oldLevel: prev.level, newLevel });
          triggerSound('level');
        }, 100);

        return {
          ...prev,
          level: newLevel,
          xp: extraXp,
        };
      }
      return {
        ...prev,
        xp: totalXp
      };
    });
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const idx = prev.findIndex(a => a.id === id);
      if (idx !== -1 && prev[idx].unlockedAt === null) {
        const updated = [...prev];
        const now = new Date().toISOString();
        updated[idx] = { ...updated[idx], unlockedAt: now };
        
        // Trigger notification and add XP
        setRecentNotification({
          title: 'Achievement Unlocked!',
          desc: `${updated[idx].title} (+${updated[idx].xpReward} XP)`,
          type: 'achievement'
        });
        triggerSound('success');
        addXP(updated[idx].xpReward);
        
        return updated;
      }
      return prev;
    });
  };

  const addWorkoutSession = (session: Omit<WorkoutSession, 'id'>) => {
    const id = 'w_' + Date.now();
    const newSession = { ...session, id };
    setWorkoutSessions(prev => [newSession, ...prev]);
    
    // Add active minutes and calories burned to daily history
    const todayStr = new Date().toISOString().split('T')[0];
    setDailyHistory(prev => {
      const updated = [...prev];
      const todayIdx = updated.findIndex(log => log.date === todayStr);
      if (todayIdx !== -1) {
        updated[todayIdx] = {
          ...updated[todayIdx],
          activeMinutes: updated[todayIdx].activeMinutes + session.duration,
          caloriesBurned: updated[todayIdx].caloriesBurned + session.caloriesBurned,
        };
      } else {
        updated.push({
          date: todayStr,
          water: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          weight: user.weight,
          activeMinutes: session.duration,
          caloriesBurned: session.caloriesBurned,
        });
      }
      return updated;
    });

    triggerSound('success');
    unlockAchievement('first_workout');
    
    // Streak check
    setUser(prev => ({
      ...prev,
      streak: prev.streak + 1
    }));
    
    if (user.streak + 1 >= 7) {
      unlockAchievement('streak_7');
    } else if (user.streak + 1 >= 3) {
      unlockAchievement('streak_3');
    }

    addXP(250); // XP for workout
  };

  const deleteWorkoutSession = (id: string) => {
    setWorkoutSessions(prev => prev.filter(w => w.id !== id));
    triggerSound('click');
  };

  const addMeal = (meal: Omit<MealLog, 'id'>) => {
    const id = 'm_' + Date.now();
    const newMeal = { ...meal, id };
    setMealLogs(prev => [...prev, newMeal]);

    // Update Daily Nutrition
    const todayStr = new Date().toISOString().split('T')[0];
    setDailyHistory(prev => {
      const updated = [...prev];
      const todayIdx = updated.findIndex(log => log.date === todayStr);
      if (todayIdx !== -1) {
        updated[todayIdx] = {
          ...updated[todayIdx],
          calories: updated[todayIdx].calories + meal.calories,
          protein: updated[todayIdx].protein + meal.protein,
          carbs: updated[todayIdx].carbs + meal.carbs,
          fats: updated[todayIdx].fats + meal.fats,
        };
      } else {
        updated.push({
          date: todayStr,
          water: 0,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
          weight: user.weight,
          activeMinutes: 0,
          caloriesBurned: 0,
        });
      }
      return updated;
    });

    // XP and targets check
    addXP(50);
    triggerSound('click');

    // Check if calories logged match targets closely to unlock nutrition_pro
    setTimeout(() => {
      const todayCalories = mealLogs.reduce((sum, m) => sum + m.calories, 0) + meal.calories;
      if (todayCalories >= user.targetCalories - 150 && todayCalories <= user.targetCalories + 250) {
        unlockAchievement('nutrition_pro');
      }
    }, 200);
  };

  const deleteMeal = (id: string) => {
    const meal = mealLogs.find(m => m.id === id);
    if (!meal) return;

    setMealLogs(prev => prev.filter(m => m.id !== id));

    const todayStr = new Date().toISOString().split('T')[0];
    setDailyHistory(prev => {
      const updated = [...prev];
      const todayIdx = updated.findIndex(log => log.date === todayStr);
      if (todayIdx !== -1) {
        updated[todayIdx] = {
          ...updated[todayIdx],
          calories: Math.max(0, updated[todayIdx].calories - meal.calories),
          protein: Math.max(0, updated[todayIdx].protein - meal.protein),
          carbs: Math.max(0, updated[todayIdx].carbs - meal.carbs),
          fats: Math.max(0, updated[todayIdx].fats - meal.fats),
        };
      }
      return updated;
    });

    triggerSound('click');
  };

  const addWater = (amount: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setDailyHistory(prev => {
      const updated = [...prev];
      const todayIdx = updated.findIndex(log => log.date === todayStr);
      if (todayIdx !== -1) {
        const newWater = updated[todayIdx].water + amount;
        updated[todayIdx] = {
          ...updated[todayIdx],
          water: newWater,
        };
        if (newWater >= user.targetWater) {
          setTimeout(() => unlockAchievement('water_champ'), 100);
        }
      } else {
        updated.push({
          date: todayStr,
          water: amount,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          weight: user.weight,
          activeMinutes: 0,
          caloriesBurned: 0,
        });
      }
      return updated;
    });

    triggerSound('timer'); // water bubble sound alike
    addXP(15);
  };

  const addProgressPhoto = (photo: Omit<ProgressPhoto, 'id'>) => {
    const id = 'p_' + Date.now();
    const newPhoto = { ...photo, id };
    setProgressPhotos(prev => [newPhoto, ...prev]);

    if (photo.weight) {
      addWeightLog(photo.weight);
    }

    addXP(150);
    unlockAchievement('photogenic');
    triggerSound('success');
  };

  const addWeightLog = (weight: number) => {
    setUser(prev => ({ ...prev, weight }));
    
    const todayStr = new Date().toISOString().split('T')[0];
    setDailyHistory(prev => {
      const updated = [...prev];
      const todayIdx = updated.findIndex(log => log.date === todayStr);
      if (todayIdx !== -1) {
        updated[todayIdx] = {
          ...updated[todayIdx],
          weight: weight,
        };
      } else {
        updated.push({
          date: todayStr,
          water: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          weight: weight,
          activeMinutes: 0,
          caloriesBurned: 0,
        });
      }
      return updated;
    });
    triggerSound('click');
  };

  // AI Chat simulation response generator
  const sendChatMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setChatHistory(prev => [...prev, userMsg]);
    triggerSound('click');

    // Simulate AI thinking and typing
    setTimeout(() => {
      let aiResponseText = '';
      const promptLower = text.toLowerCase();

      if (promptLower.includes('protein') || promptLower.includes('macro')) {
        aiResponseText = `Target protein: **${user.targetProtein}g**. Protein drives muscle fiber remodeling via mTOR activation. I recommend timing 35g of whey/egg protein within 45 minutes of training and 40g of slow-digesting micellar casein before entering deep sleep. Would you like a high-protein recipe?`;
      } else if (promptLower.includes('calorie') || promptLower.includes('eat') || promptLower.includes('food')) {
        aiResponseText = `Your neural biometric targets are **${user.targetCalories} kcal** daily. To hit this: consume 3 moderate-sized meals and 2 shakes/snacks. I suggest focused macronutrients: ${user.targetProtein}g Protein (30%), ${user.targetCarbs}g Carbs (50%), ${user.targetFats}g Fats (20%). Log meals in the Nutrition page for micro-level telemetry tracking!`;
      } else if (promptLower.includes('workout') || promptLower.includes('exercise') || promptLower.includes('routine') || promptLower.includes('split')) {
        aiResponseText = `My neural algorithms suggest the **Push/Pull/Legs (PPL)** routine for hypertrophy optimization. You've completed push and pull elements recently. Leg-day (quadriceps/hamstrings focal) triggers maximum natural growth hormone secretion. Would you like a specific 45-minute leg routine with set, rep, and weight optimization?`;
      } else if (promptLower.includes('hello') || promptLower.includes('hi') || promptLower.includes('hey') || promptLower.includes('coach')) {
        aiResponseText = `Hello, Alex! Biometric telemetry scan: Active Streak: **${user.streak} days**, level **${user.level}**. How can I engineer your body progress today? Ask me about custom routines, diet structures, recovery protocols, or hydration metrics.`;
      } else if (promptLower.includes('recover') || promptLower.includes('sore') || promptLower.includes('sleep')) {
        aiResponseText = `My sensors indicate higher-intensity muscle tissue stress from your 100kg Bench Press telemetry. Ensure you sleep 7.5 to 8.5 hours tonight to capture Peak Growth Hormone release. Consume 400mg Magnesium Bisglycinate and stay hydrated (+500ml water) to reduce localized DOMS.`;
      } else {
        aiResponseText = `Understood. Analyzing user queries... My deep learning engine recommends prioritizing progressive overload (aim for 2.5% weight increases on primary compound lifts this week) and ensuring consistent macros. Would you like me to construct a dedicated fitness routine block for this?`;
      }

      const aiMsg: ChatMessage = {
        id: 'msg_a_' + Date.now(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toISOString(),
      };

      setChatHistory(prev => [...prev, aiMsg]);
      triggerSound('success');
      addXP(40);
      unlockAchievement('ai_coach');
    }, 1200);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    triggerSound('click');
  };

  const dismissLevelUp = () => {
    setShowLevelUp(null);
  };

  const dismissNotification = () => {
    setRecentNotification(null);
  };

  return (
    <FitnessContext.Provider
      value={{
        user,
        isLoggedIn,
        onboardingCompleted,
        activeTheme,
        soundEnabled,
        activeTab,
        workoutSessions,
        mealLogs,
        dailyHistory,
        progressPhotos,
        achievements,
        chatHistory,
        showLevelUp,
        recentNotification,
        login,
        logout,
        register,
        completeOnboarding,
        setProfile,
        setTheme,
        setSoundEnabled,
        setActiveTab,
        addWorkoutSession,
        deleteWorkoutSession,
        addMeal,
        deleteMeal,
        addWater,
        addProgressPhoto,
        addWeightLog,
        sendChatMessage,
        clearChatHistory,
        addXP,
        unlockAchievement,
        dismissLevelUp,
        dismissNotification,
        triggerSound,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (context === undefined) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
