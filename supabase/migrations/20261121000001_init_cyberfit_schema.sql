-- ============================================================================
-- CYBERNET.FIT — core schema
-- Table: profiles, workouts, workout_exercises, workout_sets, meals,
--        daily_logs, progress_photos, achievements, chat_messages, goals
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================ PROFILES ============================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Agent',
  email text,
  avatar_url text,
  age int default 25,
  height numeric default 175,
  weight numeric default 75,
  goal text default 'muscle_gain' check (goal in ('fat_loss','muscle_gain','maintenance','endurance')),
  experience text default 'beginner' check (experience in ('beginner','intermediate','advanced')),
  level int not null default 1,
  xp int not null default 0,
  streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date,
  target_calories int default 2500,
  target_protein int default 150,
  target_carbs int default 300,
  target_fats int default 80,
  target_water int default 3000,
  target_steps int default 10000,
  theme text not null default 'cyan',
  sound_enabled boolean not null default true,
  units text not null default 'metric',
  onboarding_completed boolean not null default false,
  bio text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================ WORKOUTS ============================
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  date date not null default current_date,
  duration int not null default 0,
  calories_burned int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists workouts_user_date_idx on public.workouts(user_id, date desc);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  muscle_group text,
  position int not null default 0
);
create index if not exists workout_exercises_workout_idx on public.workout_exercises(workout_id, position);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reps int not null default 0,
  weight numeric not null default 0,
  completed boolean not null default true,
  position int not null default 0
);
create index if not exists workout_sets_exercise_idx on public.workout_sets(exercise_id, position);

-- ============================ NUTRITION ============================
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  time text not null default '12:00 PM',
  name text not null,
  calories int not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fats numeric not null default 0,
  type text not null default 'snack' check (type in ('breakfast','lunch','dinner','snack')),
  created_at timestamptz not null default now()
);
create index if not exists meals_user_date_idx on public.meals(user_id, date desc);

-- ============================ DAILY LOGS ============================
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  water int not null default 0,
  weight numeric,
  active_minutes int not null default 0,
  calories_burned int not null default 0,
  steps int not null default 0,
  sleep_hours numeric,
  mood int check (mood between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);
create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, date desc);

-- ============================ PROGRESS PHOTOS ============================
create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  weight numeric,
  photo_url text,
  photo_url_after text,
  chest numeric,
  waist numeric,
  biceps numeric,
  thighs numeric,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists progress_photos_user_date_idx on public.progress_photos(user_id, date desc);

-- ============================ ACHIEVEMENTS ============================
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  unlocked_at timestamptz not null default now(),
  unique(user_id, key)
);

-- ============================ CHAT ============================
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('user','ai')),
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_user_idx on public.chat_messages(user_id, created_at);

-- ============================ GOALS ============================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  text text not null,
  completed boolean not null default false,
  xp int not null default 50,
  created_at timestamptz not null default now()
);
create index if not exists goals_user_date_idx on public.goals(user_id, date desc);

-- ============================ updated_at trigger ============================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- ==================== auto-create profile on signup ====================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,'agent'), '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================ RLS ============================
alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;
alter table public.meals enable row level security;
alter table public.daily_logs enable row level security;
alter table public.progress_photos enable row level security;
alter table public.achievements enable row level security;
alter table public.chat_messages enable row level security;
alter table public.goals enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or is_public = true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "workouts_all_own" on public.workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_exercises_all_own" on public.workout_exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_sets_all_own" on public.workout_sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meals_all_own" on public.meals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_logs_all_own" on public.daily_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_photos_all_own" on public.progress_photos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "achievements_all_own" on public.achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chat_messages_all_own" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_all_own" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================ LEADERBOARD VIEW ============================
create or replace view public.leaderboard as
  select id, name, avatar_url, level, xp, streak, longest_streak, goal
  from public.profiles
  where is_public = true;

-- ============================ STREAK HELPER ============================
create or replace function public.log_streak()
returns void language plpgsql security definer set search_path = public as $$
declare last_date date; v_streak int;
begin
  select last_active_date, streak into last_date, v_streak from public.profiles where id = auth.uid();
  if last_date = current_date then return; end if;
  if last_date = current_date - 1 then v_streak := coalesce(v_streak,0) + 1; else v_streak := 1; end if;
  update public.profiles
    set streak = v_streak,
        longest_streak = greatest(coalesce(longest_streak,0), v_streak),
        last_active_date = current_date
  where id = auth.uid();
end; $$;

-- ==================== STORAGE: progress photos ====================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress-photos', 'progress-photos', true, 10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create policy "progress_photos_public_read" on storage.objects for select using (bucket_id = 'progress-photos');
create policy "progress_photos_owner_insert" on storage.objects for insert to authenticated with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "progress_photos_owner_update" on storage.objects for update to authenticated using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "progress_photos_owner_delete" on storage.objects for delete to authenticated using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
