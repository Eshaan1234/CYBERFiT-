import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Card, Field, Ring, SectionHeader, Stepper } from '../ui';
import { cn, fmtNum } from '../../lib/cn';
import { THEMES } from '../../theme';
import { average, isoDaysAgo, rankTitle, todayISO } from '../../lib/fitness';
import {
  Battery,
  BatteryCharging,
  Bed,
  Droplet,
  Flame,
  HeartPulse,
  Moon,
  Save,
  Smile,
} from 'lucide-react';

export const Smarts: React.FC = () => {
  const { profile, daily, today, readiness, logDailyMeta, theme, leaderboard, playSound } = useApp();
  const t = THEMES[theme];

  const [sleep, setSleep] = useState<number>(today.sleepHours ?? 7.5);
  const [mood, setMood] = useState<number>(today.mood ?? 3);
  const [steps, setSteps] = useState<number>(today.steps ?? 0);
  const [saving, setSaving] = useState(false);

  const avgSleep = average(daily.map((d) => d.sleepHours ?? 0));
  const avgWater = average(daily.map((d) => d.water));

  const save = async () => {
    setSaving(true);
    await logDailyMeta({ date: todayISO(), sleepHours: sleep, mood, steps });
    setSaving(false);
    playSound('success');
  };

  const recoveryRecs = [
    {
      icon: <Moon className="h-4 w-4" />,
      title: 'Sleep window',
      value: `${sleep}h logged`,
      target: '7.5–8.5h',
      ok: sleep >= 7.5,
      detail: 'Growth hormone peaks in deep sleep. Under 7h reduces force output 5–10% and blunts protein synthesis.',
    },
    {
      icon: <Droplet className="h-4 w-4" />,
      title: 'Hydration',
      value: `${today.water} ml`,
      target: `${profile.targetWater} ml`,
      ok: today.water >= profile.targetWater,
      detail: 'Dehydration of 2% bodyweight measurably reduces strength endurance. Add electrolytes on 2h+ sessions.',
    },
    {
      icon: <HeartPulse className="h-4 w-4" />,
      title: 'Training load',
      value: `${daily.filter((d) => d.date >= isoDaysAgo(3)).reduce((s, d) => s + d.activeMinutes, 0)} min / 3d`,
      target: '< 180 min',
      ok: daily.filter((d) => d.date >= isoDaysAgo(3)).reduce((s, d) => s + d.activeMinutes, 0) < 180,
      detail: 'Acute load spikes above 180 minutes in 72h without a deload is where overuse injuries originate.',
    },
    {
      icon: <Battery className="h-4 w-4" />,
      title: 'Protein repair',
      value: `${Math.round(average(daily.slice(0, 7).map((d) => d.protein)))} g avg`,
      target: `${profile.targetProtein} g`,
      ok: average(daily.slice(0, 7).map((d) => d.protein)) >= profile.targetProtein * 0.9,
      detail: 'Repair is substrate-limited. Below ~1.8 g/kg in a deficit, a meaningful share of your training stimulus is wasted.',
    },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Readiness hero */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card glow className="relative overflow-hidden">
          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30', t.gradientSoft)} />
          <div className="relative flex flex-col items-center">
            <Ring
              value={readiness.score}
              size={150}
              stroke={11}
              theme={theme}
              label={
                <>
                  <span className="text-4xl font-black tabular-nums leading-none text-white">{readiness.score}</span>
                  <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-500">/ 100</span>
                </>
              }
            />
            <Badge
              tone={readiness.score >= 70 ? 'success' : readiness.score >= 50 ? 'warn' : 'danger'}
              className="mt-3"
              icon={<BatteryCharging className="h-2.5 w-2.5" />}
            >
              {readiness.label} readiness
            </Badge>
            <p className="mt-3 text-center text-[11.5px] leading-relaxed text-slate-400">{readiness.recommendation}</p>
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Daily check-in" title="Log recovery inputs" subtitle="Feeds the readiness model instantly" />
          <div className="space-y-3">
            <div>
              <Field label="Hours of sleep" hint={`${sleep}h`}>
                <input
                  type="range"
                  min={3}
                  max={12}
                  step={0.5}
                  value={sleep}
                  onChange={(e) => setSleep(Number(e.target.value))}
                  className="w-full"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Steps" hint="today">
                <Stepper value={steps} onChange={setSteps} min={0} max={40000} step={500} />
              </Field>
              <Field label="Mood" hint="1–5">
                <div className="flex h-10 items-center gap-1">
                  {[1, 2, 3, 4, 5].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={cn(
                        'flex h-8 flex-1 items-center justify-center rounded-lg border transition',
                        mood >= m ? cn(t.border, t.bgSoft, t.text) : 'border-white/[0.08] text-slate-600',
                      )}
                      aria-label={`Mood ${m}`}
                    >
                      <Smile className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <Button className="w-full" onClick={save} loading={saving} icon={<Save className="h-3.5 w-3.5" />}>
              Sync check-in
            </Button>

            <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
              {[
                { l: 'avg sleep', v: `${avgSleep ? avgSleep.toFixed(1) : '—'}h`, i: <Bed className="h-3 w-3" /> },
                { l: 'avg water', v: `${Math.round(avgWater)}ml`, i: <Droplet className="h-3 w-3" /> },
                { l: 'streak', v: `${profile.streak}d`, i: <Flame className="h-3 w-3" /> },
              ].map((s) => (
                <div key={s.l}>
                  <p className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-slate-600">
                    {s.i}
                    {s.l}
                  </p>
                  <p className="text-[12px] font-bold tabular-nums text-white">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Factor breakdown */}
      <Card>
        <SectionHeader eyebrow="Model inputs" title="Readiness factor breakdown" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {readiness.factors.map((f) => (
            <div key={f.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10.5px] font-medium text-slate-400">{f.label}</p>
                <span
                  className={cn(
                    'font-mono text-[10px] font-bold tabular-nums',
                    f.impact >= 0 ? 'text-emerald-400' : 'text-red-400',
                  )}
                >
                  {f.impact >= 0 ? '+' : ''}
                  {f.impact}
                </span>
              </div>
              <p className="mt-1 text-[13px] font-bold text-white">{f.value}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className={cn('h-full rounded-full', f.impact >= 0 ? 'bg-emerald-400' : 'bg-red-400')}
                  style={{ width: `${Math.min(100, Math.abs(f.impact) * 3 + 20)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recovery protocol */}
      <Card>
        <SectionHeader eyebrow="Protocol" title="Recovery audit" subtitle="What to fix first, in priority order" />
        <div className="space-y-2">
          {recoveryRecs.map((r) => (
            <div
              key={r.title}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3',
                r.ok ? 'border-emerald-500/20 bg-emerald-500/[0.04]' : 'border-amber-500/20 bg-amber-500/[0.04]',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  r.ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400',
                )}
              >
                {r.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-[12px] font-bold text-white">{r.title}</p>
                  <span className="font-mono text-[10px] text-slate-400">{r.value}</span>
                  <span className="font-mono text-[9px] text-slate-600">target {r.target}</span>
                  {r.ok && <Check2 />}
                </div>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Leaderboard + rank */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader eyebrow="Rank" title="Evolution ladder" />
          <div className="space-y-1.5">
            {[
              { lvl: 1, title: 'Rookie Node' },
              { lvl: 3, title: 'Initiate' },
              { lvl: 6, title: 'Cybernetic Athlete' },
              { lvl: 12, title: 'Hyper-Soldier' },
              { lvl: 20, title: 'Bio-Architect' },
              { lvl: 30, title: 'Neural Titan' },
              { lvl: 40, title: 'Singularity Agent' },
            ].map((r) => {
              const reached = profile.level >= r.lvl;
              const current = rankTitle(profile.level) === r.title;
              return (
                <div
                  key={r.lvl}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5',
                    current
                      ? cn(t.border, t.bgSoft)
                      : reached
                        ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                        : 'border-white/[0.05] bg-white/[0.015]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-md font-mono text-[9px] font-bold',
                      reached ? cn(t.bgSoft, t.text) : 'bg-white/[0.04] text-slate-600',
                    )}
                  >
                    {r.lvl}
                  </span>
                  <span className={cn('flex-1 text-[11px] font-medium', reached ? 'text-slate-200' : 'text-slate-600')}>
                    {r.title}
                  </span>
                  {current && <Badge tone="accent" theme={theme}>you</Badge>}
                  {reached && !current && <span className="font-mono text-[8px] uppercase text-emerald-500/60">passed</span>}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Grid" title="Global standings" />
          {leaderboard.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-slate-600">No public agents yet</p>
          ) : (
            <div className="space-y-1">
              {leaderboard.slice(0, 10).map((u, i) => (
                <div
                  key={u.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5',
                    u.id === profile.id ? cn(t.bgSoft, 'ring-1', t.ring) : 'bg-white/[0.02]',
                  )}
                >
                  <span
                    className={cn(
                      'w-4 text-center font-mono text-[9px] font-bold',
                      i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-600',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white">
                    {u.name?.charAt(0)?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold text-slate-200">{u.name}</p>
                    <p className="font-mono text-[8.5px] text-slate-600">Lv {u.level} · {u.streak}d streak</p>
                  </div>
                  <span className="font-mono text-[9.5px] tabular-nums text-slate-400">{fmtNum(u.xp)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const Check2: React.FC = () => (
  <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/15 px-1 py-0.5 font-mono text-[8px] font-bold uppercase text-emerald-400">
    ok
  </span>
);
