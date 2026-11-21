import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Card, Input, ProgressBar, Ring, SectionHeader } from '../ui';
import { cn, fmtDate, fmtNum } from '../../lib/cn';
import { THEMES } from '../../theme';
import {
  average,
  isoDaysAgo,
  personalRecords,
  rankTitle,
  totalVolume,
  weightForecast,
} from '../../lib/fitness';
import { CHALLENGES } from '../../lib/catalog';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Circle,
  Droplet,
  Dumbbell,
  Flame,
  Plus,
  Sparkles,
  TrendingUp,
  Trophy,
  Utensils,
  Zap,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    profile,
    today,
    daily,
    workouts,
    meals,
    goals,
    achievements,
    readiness,
    levelInfo,
    theme,
    logWater,
    addGoal,
    toggleGoal,
    removeGoal,
    setActiveTab,
    claimedChallenges,
    claimChallenge,
    playSound,
  } = useApp();
  const t = THEMES[theme];
  const [goalText, setGoalText] = useState('');

  const weekWorkouts = workouts.filter((w) => w.date >= isoDaysAgo(7));
  const weekVolume = totalVolume(weekWorkouts);
  const prs = useMemo(() => personalRecords(workouts), [workouts]);
  const forecast = useMemo(() => weightForecast(daily, 14), [daily]);

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = isoDaysAgo(6 - i);
      const row = daily.find((d) => d.date === date);
      return {
        day: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }),
        calories: row?.calories ?? 0,
        burned: row?.caloriesBurned ?? 0,
        target: profile.targetCalories,
        water: row?.water ?? 0,
        protein: row?.protein ?? 0,
        active: row?.activeMinutes ?? 0,
        weight: row?.weight ?? null,
      };
    });
  }, [daily, profile.targetCalories]);

  const macroData = [
    { name: 'Protein', value: Math.round(today.protein * 4), color: '#22d3ee', grams: Math.round(today.protein), target: profile.targetProtein },
    { name: 'Carbs', value: Math.round(today.carbs * 4), color: '#fbbf24', grams: Math.round(today.carbs), target: profile.targetCarbs },
    { name: 'Fats', value: Math.round(today.fats * 9), color: '#a78bfa', grams: Math.round(today.fats), target: profile.targetFats },
  ];

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;
  const nextChallenge = CHALLENGES.find((c) => {
    if (claimedChallenges.includes(c.key)) return false;
    const p = c.progress({ workouts, meals, daily, profile, photos: [] });
    return p.current >= p.target;
  });

  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Night cycle' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';

  return (
    <div className="space-y-5 pb-8">
      {/* ============================ Hero row ============================ */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="relative overflow-hidden p-0" glow>
          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', t.gradientSoft)} />
          <div className="relative p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {greeting} · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {profile.name.split(' ')[0]}
                  <span className="text-slate-600">.</span>
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="accent" theme={theme} icon={<Zap className="h-2.5 w-2.5" />}>
                    Lv {profile.level} · {rankTitle(profile.level)}
                  </Badge>
                  <Badge tone="success" icon={<Flame className="h-2.5 w-2.5" />}>
                    {profile.streak}d streak
                  </Badge>
                  {nextChallenge && (
                    <button onClick={() => claimChallenge(nextChallenge.key)}>
                      <Badge tone="warn" icon={<Trophy className="h-2.5 w-2.5" />}>
                        Claim +{nextChallenge.xp} XP
                      </Badge>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Ring
                  value={readiness.score}
                  size={84}
                  stroke={7}
                  theme={theme}
                  label={<span className="text-lg font-black tabular-nums text-white">{readiness.score}</span>}
                  sublabel={<span className="mt-0.5 font-mono text-[7px] uppercase tracking-wider text-slate-500">ready</span>}
                />
                <div className="hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Readiness</p>
                  <p className={cn('text-sm font-bold', readiness.score >= 70 ? 'text-emerald-400' : readiness.score >= 50 ? 'text-amber-400' : 'text-red-400')}>
                    {readiness.label}
                  </p>
                  <p className="mt-1 max-w-[190px] text-[10px] leading-relaxed text-slate-500">{readiness.recommendation}</p>
                </div>
              </div>
            </div>

            {/* XP bar */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">evolution matrix</span>
                <span className="font-mono text-[10px] tabular-nums text-slate-400">
                  {fmtNum(levelInfo.current)} / {fmtNum(levelInfo.need)} XP
                </span>
              </div>
              <ProgressBar value={levelInfo.current} max={levelInfo.need} theme={theme} height="h-1.5" />
            </div>

            {/* Quick metrics */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Sessions / 7d', value: weekWorkouts.length, unit: '', icon: <Dumbbell className="h-3.5 w-3.5" /> },
                { label: 'Tonnage / 7d', value: fmtNum(weekVolume), unit: 'kg', icon: <TrendingUp className="h-3.5 w-3.5" /> },
                { label: 'PRs tracked', value: prs.length, unit: '', icon: <Trophy className="h-3.5 w-3.5" /> },
                { label: 'Badges', value: `${unlockedCount}/${achievements.length}`, unit: '', icon: <Sparkles className="h-3.5 w-3.5" /> },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/[0.07] bg-black/25 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">{m.label}</p>
                    <span className="text-slate-600">{m.icon}</span>
                  </div>
                  <p className="mt-1 text-base font-black tabular-nums leading-none text-white">
                    {m.value}
                    {m.unit && <span className="ml-0.5 text-[9px] font-medium text-slate-600">{m.unit}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* -------------------- Today's rings -------------------- */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Today</p>
              <p className="text-sm font-bold text-white">Intake telemetry</p>
            </div>
            <Badge tone={today.calories > profile.targetCalories ? 'warn' : 'neutral'}>
              {Math.round((today.calories / profile.targetCalories) * 100)}% kcal
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { label: 'Calories', value: today.calories, target: profile.targetCalories, color: t.hex, unit: 'kcal' },
              { label: 'Protein', value: today.protein, target: profile.targetProtein, color: '#22d3ee', unit: 'g' },
              { label: 'Carbs', value: today.carbs, target: profile.targetCarbs, color: '#fbbf24', unit: 'g' },
              { label: 'Fats', value: today.fats, target: profile.targetFats, color: '#a78bfa', unit: 'g' },
            ].map((m) => {
              const pct = Math.min(100, (m.value / Math.max(1, m.target)) * 100);
              return (
                <div key={m.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{m.label}</span>
                    <span className="font-mono text-[9px] tabular-nums text-slate-500">{Math.round(pct)}%</span>
                  </div>
                  <p className="mt-1 text-sm font-black tabular-nums text-white">
                    {Math.round(m.value)}
                    <span className="ml-0.5 text-[9px] font-medium text-slate-600">/{m.target}{m.unit === 'g' ? 'g' : ''}</span>
                  </p>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${pct}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Water */}
          <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Droplet className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-[11px] font-semibold text-white">Hydration</span>
              </div>
              <span className="font-mono text-[10px] tabular-nums text-sky-300">
                {today.water} / {profile.targetWater} ml
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-[width] duration-500"
                style={{ width: `${Math.min(100, (today.water / profile.targetWater) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex gap-1.5">
              {[250, 500, 750].map((ml) => (
                <button
                  key={ml}
                  onClick={() => logWater(ml)}
                  className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] py-1.5 text-[10px] font-semibold text-sky-300 transition hover:bg-sky-500/15 active:scale-95"
                >
                  +{ml}ml
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ======================== Chart + macros ======================== */}
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Card>
          <SectionHeader
            eyebrow="7-day window"
            title="Energy balance"
            subtitle="Consumed vs expended kilocalories"
            action={
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className={cn('h-2 w-2 rounded-full', t.bg)} /> intake
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> burned
                </span>
              </div>
            }
          />
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIntake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.hex} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={t.hex} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBurned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  contentStyle={{
                    background: '#0b0b16',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    fontSize: 11,
                    padding: '8px 10px',
                  }}
                  labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="calories" name="Intake" stroke={t.hex} strokeWidth={2} fill="url(#gIntake)" />
                <Area type="monotone" dataKey="burned" name="Burned" stroke="#fbbf24" strokeWidth={1.5} fill="url(#gBurned)" strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.05] pt-3">
            {[
              { l: 'Avg intake', v: fmtNum(average(last7.map((d) => d.calories))), u: 'kcal' },
              { l: 'Avg burned', v: fmtNum(average(last7.map((d) => d.burned))), u: 'kcal' },
              { l: 'Avg active', v: Math.round(average(last7.map((d) => d.active))), u: 'min' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">{s.l}</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-white">
                  {s.v}
                  <span className="ml-0.5 text-[9px] font-medium text-slate-600">{s.u}</span>
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Macro split" title="Today's distribution" />
          <div className="flex items-center gap-4">
            <div className="relative h-[136px] w-[136px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData.filter((m) => m.value > 0).length ? macroData : [{ name: 'none', value: 1, color: '#1e293b' }]}
                    dataKey="value"
                    innerRadius={44}
                    outerRadius={64}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {(macroData.filter((m) => m.value > 0).length ? macroData : [{ name: 'none', value: 1, color: '#1e293b' }]).map(
                      (d, i) => (
                        <Cell key={i} fill={d.color} />
                      ),
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black tabular-nums leading-none text-white">{Math.round(today.calories)}</span>
                <span className="font-mono text-[8px] uppercase tracking-wider text-slate-600">kcal</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {macroData.map((m) => (
                <div key={m.name}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: m.color }} />
                      {m.name}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums text-slate-400">
                      {m.grams}/{m.target}g
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, (m.grams / Math.max(1, m.target)) * 100)}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-white/[0.05] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Bodyweight trend</span>
              {forecast ? (
                <Badge tone={forecast.slopePerWeek > 0 ? 'warn' : 'success'}>
                  {forecast.slopePerWeek > 0 ? '+' : ''}{forecast.slopePerWeek} kg/wk
                </Badge>
              ) : (
                <Badge>no data</Badge>
              )}
            </div>
            {forecast ? (
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                Projected <span className="font-bold text-white">{forecast.projected} kg</span> in {forecast.days} days at
                current trajectory.
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                Log your weight 3+ times to activate forecasting.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* ==================== Goals + PRs + coach ==================== */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Daily objectives */}
        <Card>
          <SectionHeader
            eyebrow="Daily protocol"
            title="Objectives"
            action={<Badge tone="neutral">{goals.filter((g) => g.completed).length}/{goals.length}</Badge>}
          />
          <div className="space-y-1.5">
            {goals.length === 0 && (
              <p className="py-3 text-center text-[11px] text-slate-500">No objectives yet — add one below.</p>
            )}
            {goals.map((g) => (
              <div
                key={g.id}
                className="group flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 transition hover:border-white/10"
              >
                <button onClick={() => toggleGoal(g.id)} className="shrink-0" aria-label="Toggle objective">
                  {g.completed ? (
                    <span className={cn('flex h-4 w-4 items-center justify-center rounded-full', t.bg)}>
                      <Check className="h-2.5 w-2.5 text-black" strokeWidth={4} />
                    </span>
                  ) : (
                    <Circle className="h-4 w-4 text-slate-600 transition group-hover:text-slate-400" />
                  )}
                </button>
                <span
                  className={cn(
                    'flex-1 text-[11.5px] leading-snug',
                    g.completed ? 'text-slate-600 line-through' : 'text-slate-300',
                  )}
                >
                  {g.text}
                </span>
                <span className="font-mono text-[9px] text-slate-600">+{g.xp}</span>
                <button
                  onClick={() => removeGoal(g.id)}
                  className="text-slate-700 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addGoal(goalText);
              setGoalText('');
              playSound('click');
            }}
            className="mt-2.5 flex gap-1.5"
          >
            <Input
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="Add objective…"
              className="h-9 text-xs"
              theme={theme}
            />
            <Button type="submit" size="sm" variant="secondary" disabled={!goalText.trim()} className="px-3">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </form>
        </Card>

        {/* PR board */}
        <Card>
          <SectionHeader eyebrow="Strength ledger" title="Personal records" />
          {prs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Dumbbell className="h-6 w-6 text-slate-700" />
              <p className="text-[11px] text-slate-500">Log a completed set to seed your PR board.</p>
              <Button size="sm" variant="ghost" onClick={() => setActiveTab('workouts')}>
                Log a session <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {prs.slice(0, 5).map((pr, i) => (
                <div key={pr.exercise} className="flex items-center gap-2.5 rounded-lg bg-white/[0.02] px-2.5 py-2">
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[9px] font-bold',
                      i === 0 ? cn(t.bgSoft, t.text) : 'bg-white/[0.04] text-slate-500',
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-slate-200">{pr.exercise}</p>
                    <p className="font-mono text-[9px] text-slate-600">
                      {pr.weight}kg × {pr.reps} · {fmtDate(pr.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold tabular-nums text-white">{pr.estimated1RM}</p>
                    <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">kg 1rm</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Coach nudge + readiness factors */}
        <Card className="flex flex-col">
          <SectionHeader eyebrow="Neural core" title="Coach signal" />
          <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Bot className={cn('h-3.5 w-3.5', t.text)} />
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">cybercoach v3</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-300">{readiness.recommendation}</p>
          </div>

          <div className="mt-3 space-y-1.5">
            {readiness.factors.slice(0, 4).map((f) => (
              <div key={f.label} className="flex items-center gap-2">
                <span className="w-[76px] shrink-0 text-[10px] text-slate-500">{f.label}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className={cn('h-full rounded-full', f.impact >= 0 ? 'bg-emerald-400' : 'bg-red-400')}
                    style={{ width: `${Math.min(100, Math.abs(f.impact) * 3 + 25)}%` }}
                  />
                </div>
                <span className="w-[58px] shrink-0 text-right font-mono text-[9px] tabular-nums text-slate-500">
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="mt-auto w-full pt-0"
            onClick={() => setActiveTab('ai-coach')}
            icon={<Sparkles className="h-3 w-3" />}
          >
            Consult coach
          </Button>
        </Card>
      </div>

      {/* ========================= Recent activity ========================= */}
      <Card>
        <SectionHeader
          eyebrow="Timeline"
          title="Recent activity"
          action={
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('analytics')}>
              Full analytics <ChevronRight className="h-3 w-3" />
            </Button>
          }
        />
        <div className="space-y-1">
          {[...workouts.slice(0, 3).map((w) => ({ kind: 'workout' as const, w })), ...meals.slice(0, 3).map((m) => ({ kind: 'meal' as const, m }))]
            .slice(0, 5)
            .map((item, i) =>
              item.kind === 'workout' ? (
                <div key={`w${i}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.03]">
                  <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', t.bgSoft, t.text)}>
                    <Dumbbell className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-medium text-slate-200">{item.w.name}</p>
                    <p className="font-mono text-[9px] text-slate-600">
                      {fmtDate(item.w.date)} · {item.w.duration}min · {item.w.caloriesBurned} kcal ·{' '}
                      {item.w.exercises.length} exercises
                    </p>
                  </div>
                  <Badge tone="success">logged</Badge>
                </div>
              ) : (
                <div key={`m${i}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.03]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Utensils className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-medium text-slate-200">{item.m.name}</p>
                    <p className="font-mono text-[9px] text-slate-600">
                      {item.m.time} · {item.m.calories} kcal · {item.m.protein}P / {item.m.carbs}C / {item.m.fats}F
                    </p>
                  </div>
                  <Badge tone="neutral">{item.m.type}</Badge>
                </div>
              ),
            )}
          {!workouts.length && !meals.length && (
            <p className="py-6 text-center text-[11px] text-slate-500">
              Nothing logged yet. Start with a workout or a meal — the coach needs data to reason with.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
