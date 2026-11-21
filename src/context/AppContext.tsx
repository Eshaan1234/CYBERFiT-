import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../lib/api';
import { useAuth } from './AuthContext';
import {
  computeStreak,
  levelProgress,
  readinessScore,
  recommendTargets,
  todayISO,
  xpForLevel,
} from '../lib/fitness';
import { CHALLENGES, evaluateAchievements, initialAchievements } from '../lib/catalog';
import { generateCoachReply } from '../lib/coach';
import type {
  Achievement,
  ChatMessage,
  CommunityPost,
  DailyLog,
  GoalTask,
  MealLog,
  ProgressPhoto,
  Tab,
  ThemeKey,
  UserProfile,
  WorkoutSession,
} from '../lib/types';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Agent',
  email: '',
  age: 25,
  height: 175,
  weight: 75,
  goal: 'muscle_gain',
  experience: 'beginner',
  level: 1,
  xp: 0,
  streak: 0,
  longestStreak: 0,
  targetCalories: 2500,
  targetProtein: 150,
  targetCarbs: 280,
  targetFats: 80,
  targetWater: 2750,
  targetSteps: 10000,
  theme: 'cyan',
  soundEnabled: true,
  units: 'metric',
  onboardingCompleted: false,
  bio: '',
  isPublic: true,
};

export interface Toast {
  id: number;
  title: string;
  desc: string;
  type: 'info' | 'achievement' | 'levelUp' | 'error';
}

interface AppContextValue {
  // identity
  profile: UserProfile;
  loading: boolean;
  error: string | null;
  saving: boolean;

  // navigation & display
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  // data
  workouts: WorkoutSession[];
  meals: MealLog[];
  daily: DailyLog[];
  photos: ProgressPhoto[];
  goals: GoalTask[];
  achievements: Achievement[];
  chat: ChatMessage[];
  community: CommunityPost[];
  claimedChallenges: string[];
  leaderboard: { id: string; name: string; level: number; xp: number; streak: number; goal: string; avatar_url: string | null }[];

  // derived
  today: DailyLog;
  readiness: ReturnType<typeof readinessScore>;
  levelInfo: ReturnType<typeof levelProgress>;
  macroTotals: { calories: number; protein: number; carbs: number; fats: number };
  toasts: Toast[];
  coachTyping: boolean;

  // profile actions
  saveProfile: (patch: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (patch: Partial<UserProfile>) => Promise<void>;
  recalcTargets: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;

  // logging actions
  logWorkout: (w: Omit<WorkoutSession, 'id'>) => Promise<void>;
  removeWorkout: (id: string) => Promise<void>;
  logMeal: (m: Omit<MealLog, 'id'>) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  logWater: (ml: number) => Promise<void>;
  logWeight: (kg: number) => Promise<void>;
  logDailyMeta: (patch: Partial<DailyLog>) => Promise<void>;
  addPhoto: (p: Omit<ProgressPhoto, 'id'>, file?: File | null) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;
  addGoal: (text: string) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  claimChallenge: (key: string) => Promise<void>;

  // coach & social
  askCoach: (text: string) => Promise<void>;
  clearChat: () => Promise<void>;
  postToCommunity: (body: string, kind?: CommunityPost['kind']) => Promise<void>;
  likePost: (post: CommunityPost) => Promise<void>;
  removePost: (id: string) => Promise<void>;
  refreshCommunity: () => Promise<void>;

  // toasts & audio
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  playSound: (type: 'click' | 'success' | 'level' | 'timer' | 'error') => void;
  markAnalyticsViewed: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTabState] = useState<Tab>('dashboard');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [coachTyping, setCoachTyping] = useState(false);
  const [analyticsViewed, setAnalyticsViewed] = useState(false);

  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [daily, setDaily] = useState<DailyLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [goals, setGoals] = useState<GoalTask[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements());
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [community, setCommunity] = useState<CommunityPost[]>([]);
  const [claimedChallenges, setClaimedChallenges] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<AppContextValue['leaderboard']>([]);

  const toastId = useRef(1);
  const audioCtx = useRef<AudioContext | null>(null);
  const hydrated = useRef(false);

  /* -------------------------------- toasts -------------------------------- */
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = toastId.current++;
      setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
      window.setTimeout(() => dismissToast(id), 5200);
    },
    [dismissToast],
  );

  /* -------------------------------- audio --------------------------------- */
  const playSound = useCallback(
    (type: 'click' | 'success' | 'level' | 'timer' | 'error') => {
      if (!profile.soundEnabled) return;
      try {
        audioCtx.current ??= new (window.AudioContext || (window as any).webkitAudioContext)();
        const ctx = audioCtx.current;
        if (ctx.state === 'suspended') void ctx.resume();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        const osc = ctx.createOscillator();
        osc.connect(gain);
        const now = ctx.currentTime;

        if (type === 'click') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(720, now);
          osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
        } else if (type === 'success') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(660, now + 0.09);
          osc.frequency.setValueAtTime(880, now + 0.18);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        } else if (type === 'level') {
          const o2 = ctx.createOscillator();
          const o3 = ctx.createOscillator();
          o2.connect(gain);
          o3.connect(gain);
          osc.frequency.setValueAtTime(523.25, now);
          o2.frequency.setValueAtTime(659.25, now);
          o3.frequency.setValueAtTime(783.99, now);
          osc.frequency.setValueAtTime(1046.5, now + 0.22);
          o2.frequency.setValueAtTime(1318.5, now + 0.22);
          o3.frequency.setValueAtTime(1567.98, now + 0.22);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
          [osc, o2, o3].forEach((o) => {
            o.start(now);
            o.stop(now + 0.8);
          });
          return;
        } else if (type === 'timer') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.start(now);
          osc.stop(now + 0.14);
        } else {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.3);
        }
      } catch {
        /* audio is best-effort */
      }
    },
    [profile.soundEnabled],
  );

  /* ------------------------------- hydration ------------------------------ */
  const hydrate = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [p, w, m, d, ph, g, ach, ch, c, cc, lb] = await Promise.all([
        api.fetchProfile(userId),
        api.fetchWorkouts(),
        api.fetchMeals(),
        api.fetchDailyLogs(),
        api.fetchProgressPhotos(),
        api.fetchGoals(),
        api.fetchUnlockedAchievements(),
        api.fetchChat(),
        api.fetchCommunity(),
        api.fetchChallengeClaims(),
        api.fetchLeaderboard(),
      ]);

      const nextProfile = p ?? (await api.upsertProfile({ email: user?.email ?? '', name: DEFAULT_PROFILE.name }));
      setProfile(nextProfile);
      setWorkouts(w);
      setMeals(m);
      setDaily(d);
      setPhotos(ph);
      setGoals(g);
      setChat(ch);
      setCommunity(c);
      setClaimedChallenges(cc);
      setLeaderboard(lb);

      const unlockedMap = new Map(ach.map((a) => [a.key, a.unlocked_at]));
      setAchievements(
        initialAchievements().map((a) => ({ ...a, unlockedAt: unlockedMap.get(a.id) ?? null })),
      );
      hydrated.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to sync your data');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user) {
      hydrated.current = false;
      setProfile(DEFAULT_PROFILE);
      setWorkouts([]);
      setMeals([]);
      setDaily([]);
      setPhotos([]);
      setGoals([]);
      setChat([]);
      setCommunity([]);
      setClaimedChallenges([]);
      setAchievements(initialAchievements());
      return;
    }
    void hydrate(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* ------------------------------ derived data ---------------------------- */
  const today = useMemo<DailyLog>(() => {
    const iso = todayISO();
    const mealToday = meals.filter((m) => (m.date ?? iso) === iso);
    const base: DailyLog =
      daily.find((d) => d.date === iso) ?? {
        date: iso,
        water: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        weight: profile.weight,
        activeMinutes: 0,
        caloriesBurned: 0,
        steps: 0,
        sleepHours: null,
        mood: null,
        notes: null,
      };
    const workoutToday = workouts.filter((w) => w.date === iso);
    return {
      ...base,
      calories: mealToday.reduce((s, m) => s + m.calories, 0),
      protein: mealToday.reduce((s, m) => s + m.protein, 0),
      carbs: mealToday.reduce((s, m) => s + m.carbs, 0),
      fats: mealToday.reduce((s, m) => s + m.fats, 0),
      activeMinutes: base.activeMinutes || workoutToday.reduce((s, w) => s + w.duration, 0),
      caloriesBurned: base.caloriesBurned || workoutToday.reduce((s, w) => s + w.caloriesBurned, 0),
    };
  }, [daily, meals, workouts, profile.weight]);

  const dailyEnriched = useMemo(() => {
    const byDate = new Map<string, DailyLog>();
    for (const d of daily) byDate.set(d.date, { ...d });
    for (const m of meals) {
      const date = m.date ?? todayISO();
      const row = byDate.get(date) ?? {
        date,
        water: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        weight: null,
        activeMinutes: 0,
        caloriesBurned: 0,
        steps: 0,
      };
      row.calories += m.calories;
      row.protein += m.protein;
      row.carbs += m.carbs;
      row.fats += m.fats;
      byDate.set(date, row);
    }
    for (const w of workouts) {
      const row = byDate.get(w.date) ?? {
        date: w.date,
        water: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        weight: null,
        activeMinutes: 0,
        caloriesBurned: 0,
        steps: 0,
      };
      row.activeMinutes += w.duration;
      row.caloriesBurned += w.caloriesBurned;
      byDate.set(w.date, row);
    }
    byDate.set(todayISO(), today);
    return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [daily, meals, workouts, today]);

  const readiness = useMemo(
    () => readinessScore(dailyEnriched, workouts, profile),
    [dailyEnriched, workouts, profile],
  );

  const levelInfo = useMemo(() => levelProgress(profile.xp, profile.level), [profile.xp, profile.level]);

  const macroTotals = useMemo(
    () => ({ calories: today.calories, protein: today.protein, carbs: today.carbs, fats: today.fats }),
    [today],
  );

  /* --------------------------- achievement engine ------------------------- */
  useEffect(() => {
    if (!user || !hydrated.current) return;
    const eligible = evaluateAchievements({
      workouts: workouts as never,
      meals,
      daily: dailyEnriched,
      profile,
      photos,
      chatCount: chat.filter((c) => c.sender === 'user').length,
      postCount: community.filter((c) => c.mine).length,
      likeCount: community.filter((c) => c.likedByMe).length,
      claimedChallenges: claimedChallenges.length,
      viewedAnalytics: analyticsViewed,
    });
    const newlyUnlocked = eligible.filter((id) => !achievements.find((a) => a.id === id)?.unlockedAt);
    if (!newlyUnlocked.length) return;

    setAchievements((prev) =>
      prev.map((a) => (newlyUnlocked.includes(a.id) ? { ...a, unlockedAt: new Date().toISOString() } : a)),
    );
    newlyUnlocked.forEach((id) => {
      const def = achievements.find((a) => a.id === id);
      void api.unlockAchievement(id).catch(() => undefined);
      if (def) {
        pushToast({ title: 'Achievement unlocked', desc: `${def.title} · +${def.xpReward} XP`, type: 'achievement' });
        playSound('success');
        void addXPRaw(def.xpReward, false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workouts, meals, dailyEnriched, photos, chat, community, claimedChallenges, analyticsViewed]);

  /* ------------------------------- XP engine ------------------------------ */
  const addXPRaw = useCallback(
    async (amount: number, notify = true) => {
      if (!profile.id) return;
      let level = profile.level;
      let xp = profile.xp + amount;
      let leveled = false;
      while (xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level += 1;
        leveled = true;
      }
      setProfile((prev) => ({ ...prev, xp, level }));
      if (leveled) {
        playSound('level');
        pushToast({ title: `Level ${level} reached`, desc: 'New rank registered in the evolution matrix.', type: 'levelUp' });
      } else if (notify) {
        pushToast({ title: `+${amount} XP`, desc: 'Telemetry synced to your evolution matrix.', type: 'info' });
      }
      await api
        .upsertProfile({ id: profile.id, xp, level, longestStreak: Math.max(profile.longestStreak, profile.streak) })
        .catch(() => undefined);
    },
    [profile, playSound, pushToast],
  );

  const addXP = useCallback((amount: number) => addXPRaw(amount, true), [addXPRaw]);

  /* ------------------------------ profile ops ----------------------------- */
  const saveProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      setSaving(true);
      try {
        setProfile((prev) => ({ ...prev, ...patch }));
        if (profile.id) await api.upsertProfile({ ...patch, id: profile.id });
        playSound('success');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed');
        playSound('error');
      } finally {
        setSaving(false);
      }
    },
    [profile.id, playSound],
  );

  const completeOnboarding = useCallback(
    async (patch: Partial<UserProfile>) => {
      const merged = { ...profile, ...patch };
      const targets = recommendTargets(merged);
      await saveProfile({ ...patch, ...targets, onboardingCompleted: true, streak: Math.max(1, profile.streak) });
      await addXPRaw(150, false);
      pushToast({ title: 'Profile initialised', desc: 'Targets calibrated from your new biometrics.', type: 'info' });
      playSound('level');
    },
    [profile, saveProfile, addXPRaw, pushToast, playSound],
  );

  const recalcTargets = useCallback(async () => {
    const targets = recommendTargets(profile);
    await saveProfile(targets);
    pushToast({ title: 'Targets recalibrated', desc: `Mifflin–St Jeor → ${targets.targetCalories} kcal`, type: 'info' });
  }, [profile, saveProfile, pushToast]);

  const setTheme = useCallback(
    (t: ThemeKey) => {
      setProfile((prev) => ({ ...prev, theme: t }));
      if (profile.id) void api.upsertProfile({ id: profile.id, theme: t }).catch(() => undefined);
      playSound('click');
    },
    [profile.id, playSound],
  );

  const setSoundEnabled = useCallback(
    (v: boolean) => {
      setProfile((prev) => ({ ...prev, soundEnabled: v }));
      if (profile.id) void api.upsertProfile({ id: profile.id, soundEnabled: v }).catch(() => undefined);
    },
    [profile.id],
  );

  const setActiveTab = useCallback(
    (t: Tab) => {
      setActiveTabState(t);
      if (t === 'analytics') setAnalyticsViewed(true);
      playSound('click');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [playSound],
  );

  const markAnalyticsViewed = useCallback(() => setAnalyticsViewed(true), []);

  /* ------------------------------- logging -------------------------------- */
  const logWorkout = useCallback(
    async (session: Omit<WorkoutSession, 'id'>) => {
      try {
        const created = await api.createWorkout(session);
        setWorkouts((prev) => [created, ...prev]);
        const iso = session.date || todayISO();
        await api
          .upsertDailyLog({
            date: iso,
            activeMinutes: (daily.find((d) => d.date === iso)?.activeMinutes ?? 0) + session.duration,
            caloriesBurned: (daily.find((d) => d.date === iso)?.caloriesBurned ?? 0) + session.caloriesBurned,
          })
          .then((row) => setDaily((prev) => [row, ...prev.filter((d) => d.date !== row.date)]))
          .catch(() => undefined);
        await addXPRaw(Math.min(400, 120 + session.exercises.length * 25), false);
        pushToast({
          title: 'Session logged',
          desc: `${session.name} · ${session.exercises.length} exercises · +XP secured`,
          type: 'info',
        });
        playSound('success');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save workout');
        playSound('error');
      }
    },
    [daily, addXPRaw, pushToast, playSound],
  );

  const removeWorkout = useCallback(
    async (id: string) => {
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      try {
        await api.deleteWorkout(id);
        playSound('click');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed');
      }
    },
    [playSound],
  );

  const logMeal = useCallback(
    async (meal: Omit<MealLog, 'id'>) => {
      try {
        const created = await api.createMeal({ ...meal, date: meal.date ?? todayISO() });
        setMeals((prev) => [created, ...prev]);
        await addXPRaw(50, false);
        playSound('click');
        pushToast({ title: 'Meal logged', desc: `${meal.name} · ${meal.calories} kcal`, type: 'info' });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save meal');
        playSound('error');
      }
    },
    [addXPRaw, playSound, pushToast],
  );

  const removeMeal = useCallback(
    async (id: string) => {
      setMeals((prev) => prev.filter((m) => m.id !== id));
      try {
        await api.deleteMeal(id);
        playSound('click');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed');
      }
    },
    [playSound],
  );

  const logWater = useCallback(
    async (ml: number) => {
      const iso = todayISO();
      const current = daily.find((d) => d.date === iso)?.water ?? 0;
      const next = Math.max(0, current + ml);
      setDaily((prev) => {
        const existing = prev.find((d) => d.date === iso);
        if (existing) return prev.map((d) => (d.date === iso ? { ...d, water: next } : d));
        return [
          {
            date: iso,
            water: next,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            weight: profile.weight,
            activeMinutes: 0,
            caloriesBurned: 0,
            steps: 0,
          },
          ...prev,
        ];
      });
      playSound('timer');
      try {
        await api.upsertDailyLog({ date: iso, water: next });
        if (next >= profile.targetWater && current < profile.targetWater) {
          await addXPRaw(120, false);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save water');
      }
    },
    [daily, profile.weight, profile.targetWater, playSound, addXPRaw],
  );

  const logWeight = useCallback(
    async (kg: number) => {
      const iso = todayISO();
      setProfile((prev) => ({ ...prev, weight: kg }));
      setDaily((prev) => {
        const existing = prev.find((d) => d.date === iso);
        if (existing) return prev.map((d) => (d.date === iso ? { ...d, weight: kg } : d));
        return [
          {
            date: iso,
            water: 0,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            weight: kg,
            activeMinutes: 0,
            caloriesBurned: 0,
            steps: 0,
          },
          ...prev,
        ];
      });
      try {
        await api.upsertDailyLog({ date: iso, weight: kg });
        if (profile.id) await api.upsertProfile({ id: profile.id, weight: kg });
        playSound('success');
        pushToast({ title: 'Weight synced', desc: `${kg} kg logged for today.`, type: 'info' });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save weight');
      }
    },
    [profile.id, playSound, pushToast],
  );

  const logDailyMeta = useCallback(
    async (patch: Partial<DailyLog>) => {
      const iso = patch.date ?? todayISO();
      try {
        const row = await api.upsertDailyLog({ ...patch, date: iso });
        setDaily((prev) => [row, ...prev.filter((d) => d.date !== row.date)]);
        playSound('click');
        // refresh streak from server-side helper
        const streak = computeStreak([row, ...daily.filter((d) => d.date !== row.date)]);
        if (streak !== profile.streak) {
          setProfile((prev) => ({ ...prev, streak, longestStreak: Math.max(prev.longestStreak, streak) }));
          if (profile.id) await api.upsertProfile({ id: profile.id, streak }).catch(() => undefined);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save entry');
      }
    },
    [daily, profile.streak, profile.id, playSound],
  );

  const addPhoto = useCallback(
    async (photo: Omit<ProgressPhoto, 'id'>, file?: File | null) => {
      try {
        let before = photo.photoBefore;
        if (file && profile.id) before = await api.uploadProgressPhoto(file, profile.id);
        const created = await api.createProgressPhoto({ ...photo, photoBefore: before });
        setPhotos((prev) => [created, ...prev]);
        if (photo.weight) await logWeight(photo.weight);
        await addXPRaw(150, false);
        playSound('success');
        pushToast({ title: 'Progress captured', desc: 'Baseline archived to your evolution timeline.', type: 'info' });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed');
        playSound('error');
      }
    },
    [profile.id, logWeight, addXPRaw, playSound, pushToast],
  );

  const removePhoto = useCallback(async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    await api.deleteProgressPhoto(id).catch(() => undefined);
  }, []);

  const addGoal = useCallback(async (text: string) => {
    if (!text.trim()) return;
    try {
      const g = await api.createGoal(text.trim(), 50);
      setGoals((prev) => [...prev, g]);
    } catch {
      const optimistic: GoalTask = { id: `local_${Date.now()}`, text: text.trim(), completed: false, xp: 50 };
      setGoals((prev) => [...prev, optimistic]);
    }
  }, []);

  const toggleGoal = useCallback(
    async (id: string) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;
      const completed = !goal.completed;
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, completed } : g)));
      if (completed) await addXPRaw(goal.xp, false);
      if (!id.startsWith('local_')) await api.toggleGoal(id, completed).catch(() => undefined);
    },
    [goals, addXPRaw],
  );

  const removeGoal = useCallback(async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (!id.startsWith('local_')) await api.deleteGoal(id).catch(() => undefined);
  }, []);

  const claimChallenge = useCallback(
    async (key: string) => {
      const challenge = CHALLENGES.find((c) => c.key === key);
      if (!challenge || claimedChallenges.includes(key)) return;
      setClaimedChallenges((prev) => [...prev, key]);
      await api.claimChallenge(key, challenge.xp).catch(() => undefined);
      await addXPRaw(challenge.xp, false);
      pushToast({ title: 'Challenge claimed', desc: `${challenge.title} · +${challenge.xp} XP`, type: 'achievement' });
      playSound('level');
    },
    [claimedChallenges, addXPRaw, pushToast, playSound],
  );

  /* --------------------------------- coach -------------------------------- */
  const askCoach = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const userMsg: ChatMessage = {
        id: `u_${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };
      setChat((prev) => [...prev, userMsg]);
      playSound('click');
      void api.saveChatMessage({ sender: 'user', text: userMsg.text, timestamp: userMsg.timestamp }).catch(() => undefined);

      setCoachTyping(true);
      const reply = generateCoachReply(text, {
        profile,
        workouts,
        meals,
        daily: dailyEnriched,
        readiness,
      });
      await new Promise((r) => setTimeout(r, 900));
      const aiMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toISOString(),
      };
      setChat((prev) => [...prev, aiMsg]);
      setCoachTyping(false);
      playSound('success');
      void api.saveChatMessage({ sender: 'ai', text: reply, timestamp: aiMsg.timestamp }).catch(() => undefined);
      await addXPRaw(40, false);
    },
    [profile, workouts, meals, dailyEnriched, readiness, playSound, addXPRaw],
  );

  const clearChat = useCallback(async () => {
    setChat([]);
    await api.clearChatMessages().catch(() => undefined);
    playSound('click');
  }, [playSound]);

  /* -------------------------------- social -------------------------------- */
  const refreshCommunity = useCallback(async () => {
    try {
      const rows = await api.fetchCommunity();
      setCommunity(rows);
    } catch {
      /* non-fatal */
    }
  }, []);

  const postToCommunity = useCallback(
    async (body: string, kind: CommunityPost['kind'] = 'update') => {
      if (!body.trim()) return;
      try {
        await api.createPost(body.trim(), kind);
        await refreshCommunity();
        await addXPRaw(60, false);
        pushToast({ title: 'Signal broadcast', desc: 'Your update is live on the grid.', type: 'info' });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Post failed');
      }
    },
    [refreshCommunity, addXPRaw, pushToast],
  );

  const likePost = useCallback(
    async (post: CommunityPost) => {
      setCommunity((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
            : p,
        ),
      );
      await api.toggleLike(post.id, post.likedByMe).catch(() => undefined);
      playSound('click');
    },
    [playSound],
  );

  const removePost = useCallback(async (id: string) => {
    setCommunity((prev) => prev.filter((p) => p.id !== id));
    await api.deletePost(id).catch(() => undefined);
  }, []);

  /* --------------------------------- value -------------------------------- */
  const value = useMemo<AppContextValue>(
    () => ({
      profile,
      loading,
      error,
      saving,
      activeTab,
      setActiveTab,
      theme: profile.theme,
      setTheme,
      soundEnabled: profile.soundEnabled,
      setSoundEnabled,
      reducedMotion,
      setReducedMotion,
      workouts,
      meals,
      daily: dailyEnriched,
      photos,
      goals,
      achievements,
      chat,
      community,
      claimedChallenges,
      leaderboard,
      today,
      readiness,
      levelInfo,
      macroTotals,
      toasts,
      coachTyping,
      saveProfile,
      completeOnboarding,
      recalcTargets,
      addXP,
      logWorkout,
      removeWorkout,
      logMeal,
      removeMeal,
      logWater,
      logWeight,
      logDailyMeta,
      addPhoto,
      removePhoto,
      addGoal,
      toggleGoal,
      removeGoal,
      claimChallenge,
      askCoach,
      clearChat,
      postToCommunity,
      likePost,
      removePost,
      refreshCommunity,
      pushToast,
      dismissToast,
      playSound,
      markAnalyticsViewed,
    }),
    [
      profile,
      loading,
      error,
      saving,
      activeTab,
      setActiveTab,
      setTheme,
      setSoundEnabled,
      reducedMotion,
      workouts,
      meals,
      dailyEnriched,
      photos,
      goals,
      achievements,
      chat,
      community,
      claimedChallenges,
      leaderboard,
      today,
      readiness,
      levelInfo,
      macroTotals,
      toasts,
      coachTyping,
      saveProfile,
      completeOnboarding,
      recalcTargets,
      addXP,
      logWorkout,
      removeWorkout,
      logMeal,
      removeMeal,
      logWater,
      logWeight,
      logDailyMeta,
      addPhoto,
      removePhoto,
      addGoal,
      toggleGoal,
      removeGoal,
      claimChallenge,
      askCoach,
      clearChat,
      postToCommunity,
      likePost,
      removePost,
      refreshCommunity,
      pushToast,
      dismissToast,
      playSound,
      markAnalyticsViewed,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
