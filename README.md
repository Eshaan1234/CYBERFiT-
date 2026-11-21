# CyberNet.Fit — Neural Fitness OS

An advanced AI fitness tracking platform. Training, nutrition, recovery and body composition
telemetry live in **Supabase Postgres**, the interface runs on **React 19 + Vite + Tailwind 4**,
and the whole thing deploys to **Vercel**.

![stack](https://img.shields.io/badge/React-19-149eca) ![stack](https://img.shields.io/badge/Vite-7-646cff) ![stack](https://img.shields.io/badge/Tailwind-4-38bdf8) ![stack](https://img.shields.io/badge/Supabase-Postgres-3ecf8e) ![stack](https://img.shields.io/badge/Vercel-Edge-000)

---

## What's inside

### Authentication (Supabase Auth)

| Feature | Implementation |
|---|---|
| Email + password sign up / sign in | `signInWithPassword`, `signUp` with metadata |
| OAuth (Google, GitHub) | `signInWithOAuth`, PKCE flow |
| Password reset | `resetPasswordForEmail` with redirect |
| In-app password change | `auth.updateUser` |
| Session persistence & token refresh | `persistSession` + `autoRefreshToken` |
| Profile auto-provisioning | Postgres trigger `on_auth_user_created → handle_new_user()` |
| Email autoconfirm (dev-friendly) | enabled on the project |

The auth screen is a split-panel layout with a live password-strength meter, mapped human-readable
error messages, OAuth buttons, and a "forgot password" flow.

### The ten modules

1. **Command deck** — readiness ring, XP/level bar, 7-day energy balance chart, macro donut,
   daily objectives (persisted), PR board, coach signal, activity timeline.
2. **Workout telemetry** — 6 periodised templates or blank sessions, per-set load/reps entry,
   **live rest timer**, running session clock, per-set estimated 1RM (Epley), auto tonnage totals.
3. **Macro synthesizer** — calorie/macro rings, meal diary grouped by day, 10-item quick-add
   library, water logging in 4 increments, 7-day averages.
4. **CyberCoach v3** — a deterministic reasoning engine (`src/lib/coach.ts`) that parses intent and
   answers **from your actual data**: weekly tonnage, PR list, 7-day calorie/protein averages,
   sleep, readiness factors. Handles split building, plateau diagnosis, deload decisions, fat-loss
   protocol, macro audits, hydration. Chat is persisted per user.
5. **Body progress** — upload to Supabase Storage (`progress-photos` bucket, RLS-scoped to
   `{uid}/…`), before/after comparison slider, circumference tracking, weight trajectory chart.
6. **Analytics engine** — 7/30/90-day windows, volume bars, macro area chart, 1RM progression
   lines for top 3 lifts, performance radar, muscle-group volume split, **linear-regression
   bodyweight forecast**, 90-day consistency heatmap, full PR table.
7. **Recovery & rank** — readiness model breakdown, sleep/mood/steps check-in, recovery audit,
   evolution ladder, global standings.
8. **Achievement matrix** — 20 badges across 5 categories, 6 live weekly challenges with claimable
   XP, progress rings.
9. **The grid** — community feed with post kinds, likes, leaderboard view.
10. **Configuration** — profile/biometrics editor, manual + auto-calculated targets, 5 accent
    themes, audio/motion toggles, password change, JSON data export, infra status.

### The science baked in

- **Mifflin–St Jeor** BMR → activity factor by experience → goal offset (−20% / +12% / ±0%)
- **Protein** at 1.6–2.2 g/kg by goal, fats at ~25% of kcal, carbs fill the remainder
- **Readiness score (0–100)**: sleep 35pts + 3-day load 25pts + hydration 20pts + protein adherence 20pts
- **1RM estimation**: Epley `w × (1 + r/30)`
- **Bodyweight forecast**: least-squares linear regression over the last 21 weigh-ins
- **XP curve**: `500 × level^1.35`, 7 rank tiers

---

## Database

Project: **cyberfit** (`mmcrkajdklfcecfceydr`, region `ap-south-1`)

13 tables, 1 view, **19 RLS policies**, 2 triggers, 1 storage bucket.

```
profiles                workouts ─┬─ workout_exercises ─── workout_sets
   │                             └─ (cascade delete)
   ├── meals            daily_logs        progress_photos
   ├── achievements     chat_messages     goals
   ├── posts ─── post_likes
   └── challenge_claims

view: leaderboard (public profiles, safe columns only)
```

Migrations live in [`supabase/migrations/`](supabase/migrations) and are already applied:

| File | Contents |
|---|---|
| `20261121000001_init_cyberfit_schema.sql` | core tables, RLS, triggers, leaderboard view, storage bucket |
| `20261121000002_community_and_challenges.sql` | posts, post_likes, challenge_claims |

### Security model (verified)

Row Level Security is enabled on **every** table:

- Every log table is scoped to `auth.uid() = user_id` for **all** operations.
- `profiles` is readable when it's your own row *or* `is_public = true`; writable only by the owner.
- `posts` / `post_likes` are readable by any authenticated agent, writable only by the author.
- The `leaderboard` view exposes only `id, name, avatar_url, level, xp, streak, longest_streak, goal`.
- Storage bucket policies require the first path segment to equal `auth.uid()`.

Verified live: as `Alice`, `select * from workouts` returned only her row; an attempt to insert a
workout owned by `Bob` was rejected with `42501: new row violates row-level security policy`.
Unauthenticated (`anon`) reads return zero rows.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # -> dist/
npm run preview
```

`.env` (already provisioned, see `.env.example`):

```
VITE_SUPABASE_URL=https://mmcrkajdklfcecfceydr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_…
```

The anon key is *designed* to be public — RLS is what protects the data. Never put the
`service_role` key in a `VITE_` variable.

---

## Deploy to Vercel

`vercel.json` is committed with the framework preset, build command, output directory, SPA
rewrite and security headers, so the project deploys with zero dashboard configuration:

```bash
vercel --prod
# or connect the GitHub repo — pushes to the production branch deploy automatically
```

Then set the two environment variables in **Vercel → Project → Settings → Environment
Variables** for Production, Preview and Development:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://mmcrkajdklfcecfceydr.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_aHTDnI3tBH6luWj8VIVZBw_98XVtGmv` |

### Supabase auth URLs

After the first deployment, add your domains in **Supabase → Authentication → URL Configuration**:

- **Site URL**: `https://<your-project>.vercel.app`
- **Redirect URLs**: `https://<your-project>.vercel.app/**`, `http://localhost:5173/**`

The project is currently set to `https://*.vercel.app` + localhost, so previews work immediately.

### OAuth

Google / GitHub buttons call `signInWithOAuth`. To activate them, add the client ID + secret in
**Supabase → Authentication → Providers** (redirect URI is
`https://mmcrkajdklfcecfceydr.supabase.co/auth/v1/callback`). Until configured, the buttons fail
gracefully with an inline error — email sign-up works out of the box.

---

## Project structure

```
src/
├── lib/
│   ├── supabase.ts     client + env guard
│   ├── types.ts        domain model
│   ├── api.ts          every Supabase query, row<->model mappers
│   ├── fitness.ts      BMR, TDEE, macros, readiness, 1RM, regression, templates
│   ├── coach.ts        intent-routed reasoning engine
│   └── catalog.ts      achievements, challenges, unlock evaluator
├── context/
│   ├── AuthContext.tsx session, sign in/up, OAuth, reset
│   └── AppContext.tsx  store, optimistic writes, XP engine, achievement loop
├── components/
│   ├── ui.tsx          Card, Button, Badge, Modal, Ring, Stepper, Segmented…
│   ├── LandingPage.tsx hero, engine, modules, pricing, FAQ
│   ├── AuthScreen.tsx  split-panel auth
│   ├── Onboarding.tsx  4-step calibration wizard
│   ├── Sidebar.tsx     grouped nav + agent card + XP bar
│   ├── TopBar.tsx      contextual header + readiness chip
│   ├── ToastLayer.tsx  achievement/level/error toasts
│   └── views/          the ten modules
├── theme.ts            5 accent themes as token objects
└── index.css           Tailwind 4 theme, animations, glass, grid, chat markdown
```

## Notes

- Writes are **optimistic** — the UI updates instantly and reconciles with Supabase in the
  background, so logging never blocks on the network mid-set.
- The whole app is keyboard-accessible, uses `focus-visible` rings, honours
  `prefers-reduced-motion`, and has an explicit reduced-motion toggle.
- The AI coach uses no external model API: it is deterministic, auditable TypeScript, so answers
  are reproducible and there is no per-message cost or data leaving your database.
