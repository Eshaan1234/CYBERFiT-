-- ============================================================================
-- CYBERNET.FIT — community & weekly challenges
-- Table: posts, post_likes, challenge_claims
-- ============================================================================

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  kind text not null default 'update' check (kind in ('update','workout','pr','photo','milestone')),
  image_url text,
  created_at timestamptz not null default now()
);
create index if not exists posts_created_idx on public.posts(created_at desc);

alter table public.posts enable row level security;
create policy "posts_read_all" on public.posts for select to authenticated using (true);
create policy "posts_insert_own" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "posts_delete_own" on public.posts for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.post_likes enable row level security;
create policy "post_likes_read_all" on public.post_likes for select to authenticated using (true);
create policy "post_likes_insert_own" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "post_likes_delete_own" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.challenge_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_key text not null,
  period text not null default to_char(current_date,'IYYY-IW'),
  xp_awarded int not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, challenge_key, period)
);
alter table public.challenge_claims enable row level security;
create policy "challenge_claims_all_own" on public.challenge_claims for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select on public.posts to authenticated;
grant select on public.post_likes to authenticated;
grant select on public.challenge_claims to authenticated;
