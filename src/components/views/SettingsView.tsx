import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Badge, Button, Card, Field, Input, SectionHeader, Select, Segmented, Stepper } from '../ui';
import { cn } from '../../lib/cn';
import { THEMES, THEME_LIST } from '../../theme';
import { recommendTargets } from '../../lib/fitness';
import type { Experience, Goal, ThemeKey } from '../../lib/types';
import {
  BadgeCheck,
  Calculator,
  Database,
  Eye,
  EyeOff,
  Globe,
  Lock,
  LogOut,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    profile,
    saveProfile,
    recalcTargets,
    setTheme,
    theme,
    soundEnabled,
    setSoundEnabled,
    reducedMotion,
    setReducedMotion,
    saving,
    workouts,
    meals,
    photos,
    pushToast,
  } = useApp();
  const { user, signOut, updatePassword } = useAuth();
  const t = THEMES[theme];

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [experience, setExperience] = useState<Experience>(profile.experience);
  const [units, setUnits] = useState<'metric' | 'imperial'>(profile.units);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [isPublic, setIsPublic] = useState(profile.isPublic);

  const [calories, setCalories] = useState(profile.targetCalories);
  const [protein, setProtein] = useState(profile.targetProtein);
  const [carbs, setCarbs] = useState(profile.targetCarbs);
  const [fats, setFats] = useState(profile.targetFats);
  const [water, setWater] = useState(profile.targetWater);
  const [steps, setSteps] = useState(profile.targetSteps);

  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  const dirty =
    name !== profile.name ||
    age !== profile.age ||
    height !== profile.height ||
    weight !== profile.weight ||
    goal !== profile.goal ||
    experience !== profile.experience ||
    units !== profile.units ||
    bio !== (profile.bio ?? '') ||
    isPublic !== profile.isPublic;

  const targetsDirty =
    calories !== profile.targetCalories ||
    protein !== profile.targetProtein ||
    carbs !== profile.targetCarbs ||
    fats !== profile.targetFats ||
    water !== profile.targetWater ||
    steps !== profile.targetSteps;

  const saveIdentity = async () => {
    await saveProfile({ name, age, height, weight, goal, experience, units, bio, isPublic });
    pushToast({ title: 'Profile updated', desc: 'Biometrics synced to Supabase.', type: 'info' });
  };

  const saveTargets = async () => {
    await saveProfile({
      targetCalories: calories,
      targetProtein: protein,
      targetCarbs: carbs,
      targetFats: fats,
      targetWater: water,
      targetSteps: steps,
    });
    pushToast({ title: 'Targets saved', desc: 'Nutrition engine recalibrated.', type: 'info' });
  };

  const autoTargets = async () => {
    const rec = recommendTargets({ weight, height, age, goal, experience });
    setCalories(rec.targetCalories);
    setProtein(rec.targetProtein);
    setCarbs(rec.targetCarbs);
    setFats(rec.targetFats);
    setWater(rec.targetWater);
    await recalcTargets();
  };

  const changePassword = async () => {
    if (newPassword.length < 6) return;
    setPwBusy(true);
    try {
      await updatePassword(newPassword);
      setNewPassword('');
      pushToast({ title: 'Password updated', desc: 'Your next sign-in uses the new credential.', type: 'info' });
    } catch (e) {
      pushToast({ title: 'Update failed', desc: e instanceof Error ? e.message : 'Try again', type: 'error' });
    } finally {
      setPwBusy(false);
    }
  };

  const exportData = () => {
    const payload = { profile, workouts, meals, photos, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybernet-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast({ title: 'Export ready', desc: 'Full account payload downloaded as JSON.', type: 'info' });
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Account banner */}
      <Card glow className="relative overflow-hidden">
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-25', t.gradientSoft)} />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black text-white', t.gradient)}>
            {profile.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">{profile.name}</h2>
              <Badge tone="success" icon={<BadgeCheck className="h-2.5 w-2.5" />}>
                authenticated
              </Badge>
              {isPublic && <Badge tone="neutral" icon={<Globe className="h-2.5 w-2.5" />}>public</Badge>}
            </div>
            <p className="mt-0.5 truncate font-mono text-[10.5px] text-slate-500">{user?.email}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-slate-600">
              uid {user?.id?.slice(0, 8)}… · joined{' '}
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </p>
          </div>
          <Button variant="secondary" onClick={() => void signOut()} icon={<LogOut className="h-3.5 w-3.5" />}>
            Sign out
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Identity */}
        <Card>
          <SectionHeader
            eyebrow="Identity"
            title="Agent profile"
            action={
              <Button size="sm" onClick={saveIdentity} loading={saving} disabled={!dirty} icon={<Save className="h-3 w-3" />}>
                Save
              </Button>
            }
          />
          <div className="space-y-3">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Age" hint="yrs">
                <Stepper value={age} onChange={setAge} min={13} max={95} />
              </Field>
              <Field label="Height" hint="cm">
                <Stepper value={height} onChange={setHeight} min={120} max={230} />
              </Field>
              <Field label="Weight" hint="kg">
                <Stepper value={weight} onChange={setWeight} min={35} max={220} step={0.5} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Goal">
                <Select value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
                  <option value="fat_loss">Fat loss</option>
                  <option value="muscle_gain">Muscle gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="endurance">Endurance</option>
                </Select>
              </Field>
              <Field label="Experience">
                <Select value={experience} onChange={(e) => setExperience(e.target.value as Experience)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </Field>
            </div>
            <Field label="Bio" hint="shown on the grid">
              <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Chasing a 140kg bench…" maxLength={120} />
            </Field>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
              <div>
                <p className="text-[11px] font-semibold text-slate-200">Public profile</p>
                <p className="text-[10px] text-slate-500">Appear on the leaderboard for other agents</p>
              </div>
              <button
                onClick={() => setIsPublic((v) => !v)}
                className={cn(
                  'relative h-5 w-9 rounded-full transition-colors',
                  isPublic ? t.bg : 'bg-white/15',
                )}
                aria-label="Toggle public profile"
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                    isPublic ? 'translate-x-[18px]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Targets */}
        <Card>
          <SectionHeader
            eyebrow="Nutrition engine"
            title="Daily targets"
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={autoTargets}
                icon={<Calculator className="h-3 w-3" />}
              >
                Auto
              </Button>
            }
          />
          <div className="space-y-2">
            <Field label="Calories" hint="kcal">
              <Stepper value={calories} onChange={setCalories} min={1000} max={6000} step={50} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Protein" hint="g">
                <Stepper value={protein} onChange={setProtein} min={40} max={400} step={5} />
              </Field>
              <Field label="Carbs" hint="g">
                <Stepper value={carbs} onChange={setCarbs} min={0} max={700} step={10} />
              </Field>
              <Field label="Fats" hint="g">
                <Stepper value={fats} onChange={setFats} min={20} max={250} step={5} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Water" hint="ml">
                <Stepper value={water} onChange={setWater} min={1000} max={7000} step={250} />
              </Field>
              <Field label="Steps" hint="daily">
                <Stepper value={steps} onChange={setSteps} min={1000} max={30000} step={500} />
              </Field>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Macro-derived kcal</span>
                <span className="font-mono font-bold tabular-nums text-white">{protein * 4 + carbs * 4 + fats * 9}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">vs calorie target</span>
                <span
                  className={cn(
                    'font-mono font-bold tabular-nums',
                    Math.abs(protein * 4 + carbs * 4 + fats * 9 - calories) < 100 ? 'text-emerald-400' : 'text-amber-400',
                  )}
                >
                  {protein * 4 + carbs * 4 + fats * 9 - calories > 0 ? '+' : ''}
                  {protein * 4 + carbs * 4 + fats * 9 - calories} kcal
                </span>
              </div>
            </div>

            <Button className="w-full" onClick={saveTargets} loading={saving} disabled={!targetsDirty} icon={<Save className="h-3 w-3" />}>
              Save targets
            </Button>
          </div>
        </Card>

        {/* Appearance */}
        <Card>
          <SectionHeader eyebrow="Interface" title="Appearance" />
          <div className="space-y-3">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Accent theme</p>
              <div className="grid grid-cols-5 gap-2">
                {THEME_LIST.map((th) => (
                  <button
                    key={th.key}
                    onClick={() => setTheme(th.key as ThemeKey)}
                    className={cn(
                      'group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition',
                      theme === th.key ? cn(th.border, th.bgSoft) : 'border-white/[0.07] hover:border-white/20',
                    )}
                  >
                    <span className={cn('h-7 w-7 rounded-full bg-gradient-to-br', th.gradient)} />
                    <span className={cn('text-[8.5px] font-semibold uppercase tracking-wider', theme === th.key ? th.text : 'text-slate-600')}>
                      {th.key}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                {
                  icon: soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />,
                  label: 'Interface audio',
                  desc: 'Synth feedback on logs, levels and timers',
                  value: soundEnabled,
                  toggle: () => setSoundEnabled(!soundEnabled),
                },
                {
                  icon: <Sparkles className="h-3.5 w-3.5" />,
                  label: 'Reduced motion',
                  desc: 'Disable animations and transitions',
                  value: reducedMotion,
                  toggle: () => setReducedMotion(!reducedMotion),
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                  <span className={cn('shrink-0', t.text)}>{row.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-200">{row.label}</p>
                    <p className="text-[9.5px] text-slate-500">{row.desc}</p>
                  </div>
                  <button
                    onClick={row.toggle}
                    className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors', row.value ? t.bg : 'bg-white/15')}
                    aria-label={`Toggle ${row.label}`}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                        row.value ? 'translate-x-[18px]' : 'translate-x-0.5',
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>

            <Field label="Units">
              <Segmented
                theme={theme}
                value={units}
                onChange={(v) => setUnits(v as 'metric' | 'imperial')}
                options={[
                  { key: 'metric', label: 'Metric (kg)' },
                  { key: 'imperial', label: 'Imperial (lb)' },
                ]}
              />
            </Field>
          </div>
        </Card>

        {/* Security & data */}
        <Card>
          <SectionHeader eyebrow="Security" title="Account" />
          <div className="space-y-3">
            <Field label="New password" hint="min 6 characters">
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </Field>
            <Button
              className="w-full"
              variant="secondary"
              onClick={changePassword}
              loading={pwBusy}
              disabled={newPassword.length < 6}
              icon={<Lock className="h-3 w-3" />}
            >
              Update password
            </Button>

            <div className="space-y-1.5 border-t border-white/[0.06] pt-3">
              <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2.5 py-2">
                <span className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
                  <Database className="h-3 w-3" /> Workouts
                </span>
                <span className="font-mono text-[10.5px] text-slate-300">{workouts.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2.5 py-2">
                <span className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
                  <Database className="h-3 w-3" /> Meals
                </span>
                <span className="font-mono text-[10.5px] text-slate-300">{meals.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2.5 py-2">
                <span className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
                  <Database className="h-3 w-3" /> Photos
                </span>
                <span className="font-mono text-[10.5px] text-slate-300">{photos.length}</span>
              </div>
            </div>

            <Button className="w-full" variant="secondary" onClick={exportData} icon={<Server className="h-3 w-3" />}>
              Export my data (JSON)
            </Button>
          </div>
        </Card>
      </div>

      {/* Infrastructure */}
      <Card>
        <SectionHeader eyebrow="Infrastructure" title="System status" />
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            {
              icon: <Database className="h-4 w-4" />,
              label: 'Database',
              value: 'Supabase Postgres',
              detail: 'ap-south-1 · RLS enforced',
              ok: true,
            },
            {
              icon: <ShieldCheck className="h-4 w-4" />,
              label: 'Auth',
              value: 'Supabase Auth',
              detail: 'PKCE · JWT rotation on',
              ok: true,
            },
            {
              icon: <Globe className="h-4 w-4" />,
              label: 'Hosting',
              value: 'Vercel Edge',
              detail: 'auto-deploy on push',
              ok: true,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="flex items-center gap-2">
                <span className={cn('text-slate-400')}>{s.icon}</span>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
                {s.ok && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </div>
              <p className="mt-1.5 text-[12px] font-bold text-white">{s.value}</p>
              <p className="font-mono text-[9px] text-slate-600">{s.detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
