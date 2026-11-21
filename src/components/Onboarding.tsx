import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Field, Input, Ring, Stepper } from './ui';
import { cn } from '../lib/cn';
import { THEMES } from '../theme';
import { recommendTargets, round } from '../lib/fitness';
import type { Experience, Goal } from '../lib/types';
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Check,
  Dumbbell,
  Flame,
  HeartPulse,
  Rocket,
  Scale,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

const GOALS: { key: Goal; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'fat_loss', label: 'Fat loss', desc: 'Recomp — strip fat, hold muscle', icon: <Flame className="h-4 w-4" /> },
  { key: 'muscle_gain', label: 'Muscle gain', desc: 'Controlled surplus, heavy volume', icon: <Dumbbell className="h-4 w-4" /> },
  { key: 'maintenance', label: 'Maintain', desc: 'Hold weight, improve composition', icon: <Scale className="h-4 w-4" /> },
  { key: 'endurance', label: 'Endurance', desc: 'Conditioning and work capacity', icon: <HeartPulse className="h-4 w-4" /> },
];

const LEVELS: { key: Experience; label: string; desc: string }[] = [
  { key: 'beginner', label: 'Beginner', desc: 'Under 1 year of structured training' },
  { key: 'intermediate', label: 'Intermediate', desc: '1–3 years, know the main lifts' },
  { key: 'advanced', label: 'Advanced', desc: '3+ years, programmed progress' },
];

export const Onboarding: React.FC = () => {
  const { profile, completeOnboarding, theme } = useApp();
  const { user } = useAuth();
  const t = THEMES[theme];

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name === 'Agent' ? (user?.email?.split('@')[0] ?? '') : profile.name);
  const [age, setAge] = useState(profile.age || 25);
  const [height, setHeight] = useState(profile.height || 175);
  const [weight, setWeight] = useState(profile.weight || 75);
  const [goal, setGoal] = useState<Goal>(profile.goal ?? 'muscle_gain');
  const [experience, setExperience] = useState<Experience>(profile.experience ?? 'beginner');
  const [busy, setBusy] = useState(false);

  const preview = useMemo(
    () => recommendTargets({ weight, height, age, goal, experience }),
    [weight, height, age, goal, experience],
  );

  const steps = ['Identity', 'Biometrics', 'Directive', 'Calibrate'];
  const last = step === steps.length - 1;

  const finish = async () => {
    setBusy(true);
    await completeOnboarding({ name: name.trim() || 'Agent', age, height, weight, goal, experience });
    setBusy(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05050f] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute left-1/4 top-0 h-[380px] w-[380px] rounded-full bg-cyan-500/12 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[380px] w-[380px] rounded-full bg-violet-600/12 blur-[130px]" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br', t.gradient)}>
            <Zap className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-black tracking-tight text-white">
            CYBER<span className={t.text}>NET</span>.FIT
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-5 flex items-center justify-center gap-1.5">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-all',
                    i < step && 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
                    i === step && cn('border-white/20 bg-white/10 text-white', t.glow),
                    i > step && 'border-white/10 bg-white/[0.03] text-slate-600',
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className={cn(
                    'hidden text-[10px] font-semibold uppercase tracking-wider sm:block',
                    i === step ? 'text-slate-300' : 'text-slate-600',
                  )}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && <div className="h-px w-5 bg-white/10 sm:w-8" />}
            </React.Fragment>
          ))}
        </div>

        <Card className="overflow-hidden p-0" glow>
          <div className="border-b border-white/[0.07] px-6 py-5">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Step {step + 1} of {steps.length}
            </p>
            <h1 className="text-xl font-black tracking-tight text-white">
              {step === 0 && 'Identify yourself, agent'}
              {step === 1 && 'Biometric baseline'}
              {step === 2 && 'Select your directive'}
              {step === 3 && 'Calibrated target output'}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              {step === 0 && 'This is how your logs, feed and leaderboard entry will be labelled.'}
              {step === 1 && 'Used for Mifflin–St Jeor energy modelling and macro derivation.'}
              {step === 2 && 'Your goal sets the calorie offset; experience sets the activity multiplier.'}
              {step === 3 && 'Review the derived targets. You can recalibrate any time in Settings.'}
            </p>
          </div>

          <div className="min-h-[280px] px-6 py-6">
            {step === 0 && (
              <div className="anim-fade-up space-y-4">
                <Field label="Agent name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Mercer" autoFocus />
                </Field>
                <Field label="Email" hint="from your sign-in">
                  <Input value={user?.email ?? ''} readOnly className="opacity-60" />
                </Field>
                <div className="flex items-start gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <Sparkles className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', t.text)} />
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Your data is stored in Supabase with row-level security — only your authenticated session can read
                    or write your logs. Public feed posts are the only shared surface.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="anim-fade-up grid gap-4 sm:grid-cols-3">
                <Field label="Age">
                  <Stepper value={age} onChange={setAge} min={13} max={95} suffix="yrs" theme={theme} />
                </Field>
                <Field label="Height">
                  <Stepper value={height} onChange={setHeight} min={120} max={230} suffix="cm" theme={theme} />
                </Field>
                <Field label="Weight">
                  <Stepper value={weight} onChange={setWeight} min={35} max={200} suffix="kg" theme={theme} />
                </Field>
                <div className="sm:col-span-3">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[11px] text-slate-400">
                    <span className="font-mono uppercase tracking-wider text-slate-500">BMI</span>
                    <span className="font-bold text-white">{round(weight / (height / 100) ** 2, 1)}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono uppercase tracking-wider text-slate-500">Water</span>
                    <span className="font-bold text-white">{preview.targetWater} ml</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono uppercase tracking-wider text-slate-500">BMR</span>
                    <span className="font-bold text-white">
                      {Math.round(10 * weight + 6.25 * height - 5 * age + 5)} kcal
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="anim-fade-up space-y-5">
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Primary goal</p>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g.key}
                        onClick={() => setGoal(g.key)}
                        className={cn(
                          'group flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all',
                          goal === g.key
                            ? cn(t.border, t.bgSoft, 'ring-1', t.ring)
                            : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15',
                        )}
                      >
                        <span className={cn('mt-0.5', goal === g.key ? t.text : 'text-slate-500')}>{g.icon}</span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-white">{g.label}</span>
                          <span className="block text-[10px] leading-snug text-slate-500">{g.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Experience</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {LEVELS.map((l) => (
                      <button
                        key={l.key}
                        onClick={() => setExperience(l.key)}
                        className={cn(
                          'rounded-xl border p-3 text-left transition-all',
                          experience === l.key
                            ? cn(t.border, t.bgSoft, 'ring-1', t.ring)
                            : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15',
                        )}
                      >
                        <span className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{l.label}</span>
                          {experience === l.key && <Check className={cn('h-3 w-3', t.text)} strokeWidth={3} />}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="anim-fade-up">
                <div className="flex flex-col items-center gap-5 sm:flex-row">
                  <Ring
                    value={preview.targetCalories}
                    max={4000}
                    size={112}
                    stroke={9}
                    theme={theme}
                    label={<span className="text-xl font-black text-white">{preview.targetCalories}</span>}
                    sublabel={<span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">kcal</span>}
                  />
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    {[
                      { label: 'Protein', value: preview.targetProtein, unit: 'g', color: 'text-cyan-300', bg: 'bg-cyan-500' },
                      { label: 'Carbs', value: preview.targetCarbs, unit: 'g', color: 'text-amber-300', bg: 'bg-amber-500' },
                      { label: 'Fats', value: preview.targetFats, unit: 'g', color: 'text-violet-300', bg: 'bg-violet-500' },
                      { label: 'Water', value: preview.targetWater, unit: 'ml', color: 'text-sky-300', bg: 'bg-sky-500' },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{m.label}</p>
                        <p className={cn('mt-0.5 text-sm font-bold tabular-nums', m.color)}>
                          {m.value}
                          <span className="ml-0.5 text-[10px] font-medium text-slate-600">{m.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {[
                    { icon: <Target className="h-3.5 w-3.5" />, text: `Protein at ${round(preview.targetProtein / weight, 2)} g/kg bodyweight` },
                    { icon: <Activity className="h-3.5 w-3.5" />, text: `Activity factor ${experience === 'beginner' ? '1.375' : experience === 'intermediate' ? '1.55' : '1.725'}` },
                    { icon: <Trophy className="h-3.5 w-3.5" />, text: 'You start at Level 1 with 150 XP onboarding bonus' },
                    { icon: <Rocket className="h-3.5 w-3.5" />, text: 'Log 3 workouts in week one to ignite your streak' },
                  ].map((x) => (
                    <div key={x.text} className="flex items-center gap-2.5 text-[11px] text-slate-400">
                      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg', t.bgSoft, t.text)}>
                        {x.icon}
                      </span>
                      {x.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.07] px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              icon={<ArrowLeft className="h-3.5 w-3.5" />}
            >
              Back
            </Button>

            {!last ? (
              <Button
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                disabled={step === 0 && name.trim().length < 2}
                icon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Continue
              </Button>
            ) : (
              <Button onClick={finish} loading={busy} icon={<Zap className="h-3.5 w-3.5" />}>
                Launch portal
              </Button>
            )}
          </div>
        </Card>

        <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-slate-700">
          Calibration takes 20 seconds · editable later
        </p>
      </div>
    </div>
  );
};
