import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Card, EmptyState, Field, Input, Modal, ProgressBar, Ring, SectionHeader, Segmented, Stepper } from '../ui';
import { cn } from '../../lib/cn';
import { THEMES } from '../../theme';
import { average, isoDaysAgo, todayISO } from '../../lib/fitness';
import type { MealType } from '../../lib/types';
import {
  Apple,
  Coffee,
  Droplet,
  Plus,
  Sparkles,
  Trash2,
  Utensils,
} from 'lucide-react';

const MEAL_META: Record<MealType, { label: string; icon: React.ReactNode; color: string }> = {
  breakfast: { label: 'Breakfast', icon: <Coffee className="h-3.5 w-3.5" />, color: 'text-amber-400' },
  lunch: { label: 'Lunch', icon: <Utensils className="h-3.5 w-3.5" />, color: 'text-cyan-400' },
  dinner: { label: 'Dinner', icon: <Utensils className="h-3.5 w-3.5" />, color: 'text-violet-400' },
  snack: { label: 'Snack', icon: <Apple className="h-3.5 w-3.5" />, color: 'text-emerald-400' },
};

const QUICK_FOODS = [
  { name: 'Chicken breast 180g', calories: 297, protein: 56, carbs: 0, fats: 6, type: 'lunch' as MealType },
  { name: 'Greek yogurt 200g', calories: 130, protein: 20, carbs: 8, fats: 4, type: 'breakfast' as MealType },
  { name: 'Whey shake', calories: 130, protein: 25, carbs: 3, fats: 2, type: 'snack' as MealType },
  { name: '3 whole eggs', calories: 215, protein: 19, carbs: 1, fats: 15, type: 'breakfast' as MealType },
  { name: 'Salmon 150g', calories: 312, protein: 34, carbs: 0, fats: 19, type: 'dinner' as MealType },
  { name: 'Rice 200g cooked', calories: 260, protein: 5, carbs: 56, fats: 1, type: 'lunch' as MealType },
  { name: 'Oats 80g', calories: 304, protein: 11, carbs: 54, fats: 6, type: 'breakfast' as MealType },
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fats: 0, type: 'snack' as MealType },
  { name: 'Paneer 150g', calories: 296, protein: 27, carbs: 5, fats: 20, type: 'dinner' as MealType },
  { name: 'Almonds 30g', calories: 174, protein: 6, carbs: 6, fats: 15, type: 'snack' as MealType },
];

export const NutritionTracker: React.FC = () => {
  const { profile, meals, today, daily, logMeal, removeMeal, logWater, theme, playSound } = useApp();
  const t = THEMES[theme];

  const [open, setOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [dayFilter, setDayFilter] = useState<'today' | 'week' | 'all'>('today');

  const [name, setName] = useState('');
  const [calories, setCalories] = useState(450);
  const [protein, setProtein] = useState(30);
  const [carbs, setCarbs] = useState(45);
  const [fats, setFats] = useState(12);
  const [type, setType] = useState<MealType>('lunch');

  const visible = useMemo(() => {
    const iso = todayISO();
    if (dayFilter === 'today') return meals.filter((m) => (m.date ?? iso) === iso);
    if (dayFilter === 'week') return meals.filter((m) => (m.date ?? iso) >= isoDaysAgo(7));
    return meals;
  }, [meals, dayFilter]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof meals> = {};
    visible.forEach((m) => {
      const d = m.date ?? todayISO();
      g[d] = g[d] ? [...g[d], m] : [m];
    });
    return Object.entries(g).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [visible]);

  const avg7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => isoDaysAgo(i));
    const rows = days.map((d) => daily.find((x) => x.date === d));
    return {
      calories: average(rows.map((r) => r?.calories ?? 0)),
      protein: average(rows.map((r) => r?.protein ?? 0)),
      carbs: average(rows.map((r) => r?.carbs ?? 0)),
      fats: average(rows.map((r) => r?.fats ?? 0)),
    };
  }, [daily]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    await logMeal({
      name: name.trim(),
      calories,
      protein,
      carbs,
      fats,
      type,
      time,
      date: todayISO(),
    });
    setName('');
    setOpen(false);
  };

  const addQuick = async (food: (typeof QUICK_FOODS)[number]) => {
    const time = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    await logMeal({ ...food, time, date: todayISO() });
  };

  const rings = [
    { label: 'Calories', value: today.calories, target: profile.targetCalories, unit: 'kcal', color: t.hex },
    { label: 'Protein', value: today.protein, target: profile.targetProtein, unit: 'g', color: '#22d3ee' },
    { label: 'Carbs', value: today.carbs, target: profile.targetCarbs, unit: 'g', color: '#fbbf24' },
    { label: 'Fats', value: today.fats, target: profile.targetFats, unit: 'g', color: '#a78bfa' },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Header cards */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card glow className="relative overflow-hidden">
          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30', t.gradientSoft)} />
          <div className="relative">
            <SectionHeader eyebrow="Today" title="Energy budget" />
            <div className="flex items-center gap-4">
              <Ring
                value={today.calories}
                max={profile.targetCalories}
                size={104}
                stroke={8}
                theme={theme}
                label={<span className="text-xl font-black tabular-nums text-white">{Math.round(today.calories)}</span>}
                sublabel={<span className="font-mono text-[8px] uppercase tracking-wider text-slate-500">kcal</span>}
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10.5px] text-slate-500">Target</span>
                  <span className="font-mono text-[11px] font-bold tabular-nums text-white">{profile.targetCalories}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10.5px] text-slate-500">Remaining</span>
                  <span
                    className={cn(
                      'font-mono text-[11px] font-bold tabular-nums',
                      today.calories > profile.targetCalories ? 'text-red-400' : 'text-emerald-400',
                    )}
                  >
                    {Math.round(profile.targetCalories - today.calories)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10.5px] text-slate-500">Burned</span>
                  <span className="font-mono text-[11px] font-bold tabular-nums text-amber-400">{today.caloriesBurned}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-white/[0.06] pt-1">
                  <span className="text-[10.5px] text-slate-400">Net</span>
                  <span className="font-mono text-[11px] font-bold tabular-nums text-white">
                    {Math.round(today.calories - today.caloriesBurned)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Macros"
            title="Target adherence"
            action={
              <Badge tone={today.protein >= profile.targetProtein ? 'success' : 'neutral'}>
                {Math.round((today.protein / profile.targetProtein) * 100)}% protein
              </Badge>
            }
          />
          <div className="grid grid-cols-3 gap-3">
            {rings.slice(1).map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{m.label}</span>
                </div>
                <p className="mt-1 text-lg font-black tabular-nums leading-none text-white">
                  {Math.round(m.value)}
                  <span className="ml-0.5 text-[9px] font-medium text-slate-600">/{m.target}</span>
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${Math.min(100, (m.value / Math.max(1, m.target)) * 100)}%`, backgroundColor: m.color }}
                  />
                </div>
                <p className="mt-1 font-mono text-[9px] text-slate-600">
                  {Math.round(m.value * (m.label === 'Fats' ? 9 : 4))} kcal
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 border-t border-white/[0.06] pt-3">
            {[
              { l: '7d kcal', v: Math.round(avg7.calories) },
              { l: '7d prot', v: Math.round(avg7.protein) },
              { l: '7d carbs', v: Math.round(avg7.carbs) },
              { l: '7d fats', v: Math.round(avg7.fats) },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">{s.l}</p>
                <p className="text-[12px] font-bold tabular-nums text-slate-300">{s.v}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Water + actions */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <Droplet className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-white">Hydration</p>
                <p className="font-mono text-[10px] text-slate-500">
                  {today.water} / {profile.targetWater} ml · {Math.round((today.water / profile.targetWater) * 100)}%
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[250, 500, 750, 1000].map((ml) => (
                <button
                  key={ml}
                  onClick={() => logWater(ml)}
                  className="rounded-lg border border-sky-500/25 bg-sky-500/[0.08] px-2.5 py-1.5 text-[10px] font-semibold text-sky-300 transition hover:bg-sky-500/20 active:scale-95"
                >
                  +{ml}
                </button>
              ))}
            </div>
          </div>
          <ProgressBar
            value={today.water}
            max={profile.targetWater}
            className="mt-3"
            height="h-2"
            theme="cyan"
          />
        </Card>

        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)} icon={<Plus className="h-3.5 w-3.5" />}>
            Log meal
          </Button>
          <Button variant="secondary" onClick={() => setQuickOpen(true)} icon={<Sparkles className="h-3.5 w-3.5" />}>
            Quick add
          </Button>
        </div>
      </div>

      {/* Meal list */}
      <Card>
        <SectionHeader
          eyebrow="Diary"
          title="Logged meals"
          action={
            <Segmented
              theme={theme}
              size="sm"
              value={dayFilter}
              onChange={(v) => setDayFilter(v as typeof dayFilter)}
              options={[
                { key: 'today', label: 'Today' },
                { key: 'week', label: '7d' },
                { key: 'all', label: 'All' },
              ]}
            />
          }
        />

        {grouped.length === 0 ? (
          <EmptyState
            icon={<Utensils className="h-8 w-8" />}
            title="No meals logged yet"
            description="Log what you eat and the macro rings, coach audits and adherence scores update instantly."
            action={
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setOpen(true)}>
                  Log a meal
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setQuickOpen(true)}>
                  Quick add
                </Button>
              </div>
            }
          />
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, items]) => {
              const total = items.reduce(
                (a, m) => ({
                  calories: a.calories + m.calories,
                  protein: a.protein + m.protein,
                  carbs: a.carbs + m.carbs,
                  fats: a.fats + m.fats,
                }),
                { calories: 0, protein: 0, carbs: 0, fats: 0 },
              );
              return (
                <div key={date}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate-600">
                      {date === todayISO()
                        ? 'today'
                        : new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="font-mono text-[9.5px] tabular-nums text-slate-500">
                      {Math.round(total.calories)} kcal · {Math.round(total.protein)}P {Math.round(total.carbs)}C{' '}
                      {Math.round(total.fats)}F
                    </p>
                  </div>
                  <div className="space-y-1">
                    {items.map((m) => (
                      <div
                        key={m.id}
                        className="group flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 transition hover:border-white/10"
                      >
                        <span className={cn('shrink-0', MEAL_META[m.type].color)}>{MEAL_META[m.type].icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-slate-200">{m.name}</p>
                          <p className="font-mono text-[9px] text-slate-600">
                            {m.time} · {MEAL_META[m.type].label}
                          </p>
                        </div>
                        <div className="hidden gap-2 font-mono text-[9.5px] tabular-nums text-slate-500 sm:flex">
                          <span className="text-slate-300">{m.calories} kcal</span>
                          <span className="text-cyan-500/70">{Math.round(m.protein)}P</span>
                          <span className="text-amber-500/70">{Math.round(m.carbs)}C</span>
                          <span className="text-violet-500/70">{Math.round(m.fats)}F</span>
                        </div>
                        <button
                          onClick={() => removeMeal(m.id)}
                          className="rounded p-1 text-slate-700 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                          aria-label="Delete meal"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Log meal modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Log a meal"
        description="Enter the macros — calories auto-reconcile with your rings"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!name.trim()}>
              Save meal
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-3">
          <Field label="Meal name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Grilled chicken & rice" autoFocus />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Calories" hint="kcal">
              <Stepper value={calories} onChange={setCalories} min={0} max={3000} step={25} />
            </Field>
            <Field label="Protein" hint="g">
              <Stepper value={protein} onChange={setProtein} min={0} max={300} step={5} />
            </Field>
            <Field label="Carbs" hint="g">
              <Stepper value={carbs} onChange={setCarbs} min={0} max={500} step={5} />
            </Field>
            <Field label="Fats" hint="g">
              <Stepper value={fats} onChange={setFats} min={0} max={150} step={2} />
            </Field>
          </div>

          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Macro-derived calories</span>
              <span className="font-mono font-bold tabular-nums text-white">{protein * 4 + carbs * 4 + fats * 9} kcal</span>
            </div>
          </div>

          <Field label="Meal type">
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(MEAL_META) as MealType[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setType(k)}
                  className={cn(
                    'rounded-lg border py-2 text-[10px] font-semibold capitalize transition',
                    type === k
                      ? cn(t.border, t.bgSoft, t.text)
                      : 'border-white/[0.08] text-slate-500 hover:text-white',
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </Field>
        </form>
      </Modal>

      {/* Quick add drawer */}
      <Modal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        title="Quick add"
        description="Tap any item to log it instantly"
      >
        <div className="grid gap-1.5 sm:grid-cols-2">
          {QUICK_FOODS.map((f) => (
            <button
              key={f.name}
              onClick={() => {
                addQuick(f);
                playSound('click');
              }}
              className="group flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <span className={cn('shrink-0', MEAL_META[f.type].color)}>{MEAL_META[f.type].icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-medium text-slate-200">{f.name}</p>
                <p className="font-mono text-[9px] text-slate-600">{f.calories} kcal · {f.protein}P {f.carbs}C {f.fats}F</p>
              </div>
              <Plus className="h-3.5 w-3.5 shrink-0 text-slate-600 transition group-hover:text-white" />
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
