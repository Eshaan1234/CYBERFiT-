import { supabase, STORAGE_BUCKET } from './supabase';
import type {
  ChatMessage,
  CommunityPost,
  DailyLog,
  GoalTask,
  MealLog,
  ProgressPhoto,
  UserProfile,
  WorkoutExercise,
  WorkoutSession,
} from './types';

/* ============================== helpers ============================== */

const throwIf = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

const uid = async () => {
  const { data, error } = await supabase.auth.getUser();
  throwIf(error);
  if (!data.user) throw new Error('NOT_AUTHENTICATED');
  return data.user.id;
};

/* ============================== profile ============================== */

type ProfileRow = Record<string, any>;

export function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name ?? 'Agent',
    email: row.email ?? '',
    avatarUrl: row.avatar_url ?? null,
    age: Number(row.age ?? 25),
    height: Number(row.height ?? 175),
    weight: Number(row.weight ?? 75),
    goal: row.goal ?? 'muscle_gain',
    experience: row.experience ?? 'beginner',
    level: row.level ?? 1,
    xp: row.xp ?? 0,
    streak: row.streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    targetCalories: row.target_calories ?? 2500,
    targetProtein: row.target_protein ?? 150,
    targetCarbs: row.target_carbs ?? 300,
    targetFats: row.target_fats ?? 80,
    targetWater: row.target_water ?? 3000,
    targetSteps: row.target_steps ?? 10000,
    theme: row.theme ?? 'cyan',
    soundEnabled: row.sound_enabled ?? true,
    units: row.units ?? 'metric',
    onboardingCompleted: row.onboarding_completed ?? false,
    bio: row.bio ?? '',
    isPublic: row.is_public ?? true,
  };
}

export function profileToRow(p: Partial<UserProfile>) {
  const row: ProfileRow = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.name !== undefined) row.name = p.name;
  if (p.email !== undefined) row.email = p.email;
  if (p.avatarUrl !== undefined) row.avatar_url = p.avatarUrl;
  if (p.age !== undefined) row.age = p.age;
  if (p.height !== undefined) row.height = p.height;
  if (p.weight !== undefined) row.weight = p.weight;
  if (p.goal !== undefined) row.goal = p.goal;
  if (p.experience !== undefined) row.experience = p.experience;
  if (p.level !== undefined) row.level = p.level;
  if (p.xp !== undefined) row.xp = p.xp;
  if (p.streak !== undefined) row.streak = p.streak;
  if (p.longestStreak !== undefined) row.longest_streak = p.longestStreak;
  if (p.targetCalories !== undefined) row.target_calories = p.targetCalories;
  if (p.targetProtein !== undefined) row.target_protein = p.targetProtein;
  if (p.targetCarbs !== undefined) row.target_carbs = p.targetCarbs;
  if (p.targetFats !== undefined) row.target_fats = p.targetFats;
  if (p.targetWater !== undefined) row.target_water = p.targetWater;
  if (p.targetSteps !== undefined) row.target_steps = p.targetSteps;
  if (p.theme !== undefined) row.theme = p.theme;
  if (p.soundEnabled !== undefined) row.sound_enabled = p.soundEnabled;
  if (p.units !== undefined) row.units = p.units;
  if (p.onboardingCompleted !== undefined) row.onboarding_completed = p.onboardingCompleted;
  if (p.bio !== undefined) row.bio = p.bio;
  if (p.isPublic !== undefined) row.is_public = p.isPublic;
  return row;
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  throwIf(error);
  return data ? rowToProfile(data) : null;
}

export async function upsertProfile(patch: Partial<UserProfile>) {
  const userId = patch.id ?? (await uid());
  const row = { ...profileToRow(patch), id: userId };
  const { data, error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' }).select().single();
  throwIf(error);
  return rowToProfile(data);
}

/* ============================== workouts ============================== */

export async function fetchWorkouts(): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*, workout_exercises(*, workout_sets(*))')
    .order('date', { ascending: false })
    .order('position', { referencedTable: 'workout_exercises', ascending: true })
    .limit(400);
  throwIf(error);
  return (data ?? []).map((w: any) => ({
    id: w.id,
    date: w.date,
    name: w.name,
    duration: w.duration ?? 0,
    caloriesBurned: w.calories_burned ?? 0,
    notes: w.notes ?? '',
    exercises: (w.workout_exercises ?? []).map((e: any) => ({
      name: e.name,
      muscleGroup: e.muscle_group ?? undefined,
      sets: [...(e.workout_sets ?? [])]
        .sort((a: any, b: any) => a.position - b.position)
        .map((s: any) => ({ reps: s.reps, weight: Number(s.weight), completed: s.completed })),
    })) as WorkoutExercise[],
  }));
}

export async function createWorkout(session: Omit<WorkoutSession, 'id'>): Promise<WorkoutSession> {
  const userId = await uid();
  const { data: workout, error } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      name: session.name,
      date: session.date,
      duration: session.duration,
      calories_burned: session.caloriesBurned,
      notes: session.notes ?? null,
    })
    .select()
    .single();
  throwIf(error);

  for (let i = 0; i < session.exercises.length; i++) {
    const ex = session.exercises[i];
    const { data: exRow, error: exErr } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: workout.id,
        user_id: userId,
        name: ex.name,
        muscle_group: ex.muscleGroup ?? null,
        position: i,
      })
      .select()
      .single();
    throwIf(exErr);
    if (ex.sets.length) {
      const { error: setErr } = await supabase.from('workout_sets').insert(
        ex.sets.map((s, idx) => ({
          exercise_id: exRow.id,
          user_id: userId,
          reps: s.reps,
          weight: s.weight,
          completed: s.completed,
          position: idx,
        })),
      );
      throwIf(setErr);
    }
  }

  return { ...session, id: workout.id };
}

export async function deleteWorkout(id: string) {
  const { error } = await supabase.from('workouts').delete().eq('id', id);
  throwIf(error);
}

/* ============================== meals ============================== */

export async function fetchMeals(): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(800);
  throwIf(error);
  return (data ?? []).map((m: any) => ({
    id: m.id,
    date: m.date,
    time: m.time,
    name: m.name,
    calories: m.calories,
    protein: Number(m.protein),
    carbs: Number(m.carbs),
    fats: Number(m.fats),
    type: m.type,
  }));
}

export async function createMeal(meal: Omit<MealLog, 'id'>): Promise<MealLog> {
  const userId = await uid();
  const { data, error } = await supabase
    .from('meals')
    .insert({
      user_id: userId,
      date: meal.date ?? new Date().toISOString().split('T')[0],
      time: meal.time,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      type: meal.type,
    })
    .select()
    .single();
  throwIf(error);
  return { ...meal, id: data.id, date: data.date };
}

export async function deleteMeal(id: string) {
  const { error } = await supabase.from('meals').delete().eq('id', id);
  throwIf(error);
}

/* ============================== daily logs ============================== */

export function rowToDaily(row: any): DailyLog {
  return {
    date: row.date,
    water: row.water ?? 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    weight: row.weight !== null && row.weight !== undefined ? Number(row.weight) : null,
    activeMinutes: row.active_minutes ?? 0,
    caloriesBurned: row.calories_burned ?? 0,
    steps: row.steps ?? 0,
    sleepHours: row.sleep_hours !== null && row.sleep_hours !== undefined ? Number(row.sleep_hours) : null,
    mood: row.mood ?? null,
    notes: row.notes ?? null,
  };
}

export async function fetchDailyLogs(): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .order('date', { ascending: false })
    .limit(400);
  throwIf(error);
  return (data ?? []).map(rowToDaily);
}

export async function upsertDailyLog(patch: Partial<DailyLog> & { date: string }) {
  const userId = await uid();
  const existing = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', patch.date)
    .maybeSingle();
  throwIf(existing.error);

  const base = existing.data ?? { user_id: userId, date: patch.date };
  const next = {
    ...base,
    water: patch.water ?? base.water ?? 0,
    weight: patch.weight !== undefined ? patch.weight : base.weight,
    active_minutes: patch.activeMinutes !== undefined ? patch.activeMinutes : (base.active_minutes ?? 0),
    calories_burned: patch.caloriesBurned !== undefined ? patch.caloriesBurned : (base.calories_burned ?? 0),
    steps: patch.steps !== undefined ? patch.steps : (base.steps ?? 0),
    sleep_hours: patch.sleepHours !== undefined ? patch.sleepHours : base.sleep_hours,
    mood: patch.mood !== undefined ? patch.mood : base.mood,
    notes: patch.notes !== undefined ? patch.notes : base.notes,
  };
  delete next.id;
  delete next.created_at;

  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(next, { onConflict: 'user_id,date' })
    .select()
    .single();
  throwIf(error);
  return rowToDaily(data);
}

/* ============================== progress photos ============================== */

export async function fetchProgressPhotos(): Promise<ProgressPhoto[]> {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .order('date', { ascending: false })
    .limit(200);
  throwIf(error);
  return (data ?? []).map((p: any) => ({
    id: p.id,
    date: p.date,
    weight: Number(p.weight ?? 0),
    photoBefore: p.photo_url ?? '',
    photoAfter: p.photo_url_after ?? '',
    chest: p.chest !== null ? Number(p.chest) : undefined,
    waist: p.waist !== null ? Number(p.waist) : undefined,
    biceps: p.biceps !== null ? Number(p.biceps) : undefined,
    thighs: p.thighs !== null ? Number(p.thighs) : undefined,
    notes: p.notes ?? '',
  }));
}

export async function uploadProgressPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    upsert: false,
    cacheControl: '31536000',
  });
  throwIf(error);
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createProgressPhoto(photo: Omit<ProgressPhoto, 'id'>): Promise<ProgressPhoto> {
  const userId = await uid();
  const { data, error } = await supabase
    .from('progress_photos')
    .insert({
      user_id: userId,
      date: photo.date,
      weight: photo.weight || null,
      photo_url: photo.photoBefore || null,
      photo_url_after: photo.photoAfter || null,
      chest: photo.chest ?? null,
      waist: photo.waist ?? null,
      biceps: photo.biceps ?? null,
      thighs: photo.thighs ?? null,
      notes: photo.notes ?? null,
    })
    .select()
    .single();
  throwIf(error);
  return { ...photo, id: data.id };
}

export async function deleteProgressPhoto(id: string) {
  const { error } = await supabase.from('progress_photos').delete().eq('id', id);
  throwIf(error);
}

/* ============================== achievements ============================== */

export async function fetchUnlockedAchievements(): Promise<{ key: string; unlocked_at: string }[]> {
  const { data, error } = await supabase.from('achievements').select('key, unlocked_at');
  throwIf(error);
  return (data ?? []) as { key: string; unlocked_at: string }[];
}

export async function unlockAchievement(key: string) {
  const userId = await uid();
  const { error } = await supabase
    .from('achievements')
    .upsert({ user_id: userId, key }, { onConflict: 'user_id,key', ignoreDuplicates: true });
  throwIf(error);
}

/* ============================== chat ============================== */

export async function fetchChat(): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(300);
  throwIf(error);
  return (data ?? []).map((m: any) => ({
    id: m.id,
    sender: m.sender,
    text: m.text,
    timestamp: m.created_at,
  }));
}

export async function saveChatMessage(msg: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
  const userId = await uid();
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ user_id: userId, sender: msg.sender, text: msg.text })
    .select()
    .single();
  throwIf(error);
  return { id: data.id, sender: msg.sender, text: msg.text, timestamp: data.created_at };
}

export async function clearChatMessages() {
  const userId = await uid();
  const { error } = await supabase.from('chat_messages').delete().eq('user_id', userId);
  throwIf(error);
}

/* ============================== goals ============================== */

export async function fetchGoals(): Promise<GoalTask[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: true });
  throwIf(error);
  return (data ?? []).map((g: any) => ({ id: g.id, text: g.text, completed: g.completed, xp: g.xp }));
}

export async function createGoal(text: string, xp = 50): Promise<GoalTask> {
  const userId = await uid();
  const { data, error } = await supabase
    .from('goals')
    .insert({ user_id: userId, text, xp })
    .select()
    .single();
  throwIf(error);
  return { id: data.id, text: data.text, completed: data.completed, xp: data.xp };
}

export async function toggleGoal(id: string, completed: boolean) {
  const { error } = await supabase.from('goals').update({ completed }).eq('id', id);
  throwIf(error);
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  throwIf(error);
}

/* ============================== challenge claims ============================== */

export async function fetchChallengeClaims(): Promise<string[]> {
  const { data, error } = await supabase.from('challenge_claims').select('challenge_key');
  throwIf(error);
  return (data ?? []).map((c: any) => c.challenge_key);
}

export async function claimChallenge(key: string, xp: number) {
  const userId = await uid();
  const { error } = await supabase
    .from('challenge_claims')
    .upsert({ user_id: userId, challenge_key: key, xp_awarded: xp }, { onConflict: 'user_id,challenge_key,period' });
  throwIf(error);
}

/* ============================== community ============================== */

export async function fetchCommunity(): Promise<CommunityPost[]> {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user?.id;

  const { data, error } = await supabase
    .from('posts')
    .select('*, post_likes(user_id)')
    .order('created_at', { ascending: false })
    .limit(60);
  throwIf(error);

  const rows = data ?? [];
  const userIds = [...new Set(rows.map((r: any) => r.user_id))];
  let profiles: Record<string, { name: string; level: number; avatar_url: string | null }> = {};
  if (userIds.length) {
    const { data: p } = await supabase
      .from('profiles')
      .select('id, name, level, avatar_url')
      .in('id', userIds);
    profiles = Object.fromEntries((p ?? []).map((x: any) => [x.id, x]));
  }

  return rows.map((r: any) => {
    const likes: string[] = (r.post_likes ?? []).map((l: any) => l.user_id);
    return {
      id: r.id,
      userId: r.user_id,
      authorName: profiles[r.user_id]?.name ?? 'Agent',
      authorLevel: profiles[r.user_id]?.level ?? 1,
      authorAvatar: profiles[r.user_id]?.avatar_url ?? null,
      body: r.body,
      kind: r.kind,
      imageUrl: r.image_url,
      createdAt: r.created_at,
      likeCount: likes.length,
      likedByMe: me ? likes.includes(me) : false,
      mine: me === r.user_id,
    };
  });
}

export async function createPost(body: string, kind: CommunityPost['kind'] = 'update') {
  const userId = await uid();
  const { error } = await supabase.from('posts').insert({ user_id: userId, body, kind });
  throwIf(error);
}

export async function toggleLike(postId: string, liked: boolean) {
  const userId = await uid();
  if (liked) {
    const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    throwIf(error);
  } else {
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    throwIf(error);
  }
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  throwIf(error);
}

/* ============================== leaderboard ============================== */

export async function fetchLeaderboard(): Promise<
  { id: string; name: string; level: number; xp: number; streak: number; goal: string; avatar_url: string | null }[]
> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('xp', { ascending: false })
    .limit(25);
  throwIf(error);
  return (data ?? []) as never;
}
