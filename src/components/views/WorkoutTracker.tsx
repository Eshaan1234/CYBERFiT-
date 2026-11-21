import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Card, EmptyState, Field, Input, Modal, SectionHeader, Segmented, Stepper } from '../ui';
import { cn, fmtDate, fmtNum } from '../../lib/cn';
import { THEMES } from '../../theme';
import {
  estimate1RM,
  EXERCISE_LIBRARY,
  isoDaysAgo,
  personalRecords,
  templateToExercises,
  todayISO,
  totalVolume,
  WORKOUT_TEMPLATES,
} from '../../lib/fitness';
import type { WorkoutExercise } from '../../lib/types';
import {
  Check,
  ChevronDown,
  Clock,
  Dumbbell,
  Flame,
  Layers,
  Pause,
  Play,
  Plus,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react';

interface Draft {
  name: string;
  duration: number;
  exercises: WorkoutExercise[];
}

export const WorkoutTracker: React.FC = () => {
  const { workouts, logWorkout, removeWorkout, theme, playSound, profile } = useApp();
  const t = THEMES[theme];

  const [draft, setDraft] = useState<Draft | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(90);
  const [restRunning, setRestRunning] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddEx, setShowAddEx] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(10);
  const [newExWeight, setNewExWeight] = useState(20);
  const [filter, setFilter] = useState('all');
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);

  const elapsedRef = useRef<number | null>(null);
  const restRef = useRef<number | null>(null);

  const prs = useMemo(() => personalRecords(workouts), [workouts]);
  const weekVolume = totalVolume(workouts.filter((w) => w.date >= isoDaysAgo(7)));

  /* ------------------------------ timers ------------------------------ */
  useEffect(() => {
    if (running) {
      elapsedRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (elapsedRef.current) {
      window.clearInterval(elapsedRef.current);
      elapsedRef.current = null;
    }
    return () => {
      if (elapsedRef.current) window.clearInterval(elapsedRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (restRunning && restLeft > 0) {
      restRef.current = window.setInterval(() => {
        setRestLeft((v) => {
          if (v <= 1) {
            playSound('success');
            setRestRunning(false);
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    } else if (restRef.current) {
      window.clearInterval(restRef.current);
      restRef.current = null;
    }
    return () => {
      if (restRef.current) window.clearInterval(restRef.current);
    };
  }, [restRunning, restLeft > 0, playSound]);

  const startRest = (secs: number) => {
    setRestTotal(secs);
    setRestLeft(secs);
    setRestRunning(true);
    playSound('timer');
  };

  /* ----------------------------- draft ops ---------------------------- */
  const startFromTemplate = (key: string) => {
    const tpl = WORKOUT_TEMPLATES.find((x) => x.key === key);
    if (!tpl) return;
    setDraft({
      name: tpl.name,
      duration: tpl.duration,
      exercises: templateToExercises(tpl),
    });
    setElapsed(0);
    setRunning(true);
    setShowTemplates(false);
    playSound('success');
  };

  const startBlank = () => {
    setDraft({ name: 'Custom Session', duration: 40, exercises: [] });
    setElapsed(0);
    setRunning(true);
    setShowTemplates(false);
  };

  const addExercise = () => {
    if (!draft || !newExName.trim()) return;
    setDraft({
      ...draft,
      exercises: [
        ...draft.exercises,
        {
          name: newExName.trim(),
          muscleGroup: 'custom',
          sets: Array.from({ length: newExSets }, () => ({ reps: newExReps, weight: newExWeight, completed: false })),
        },
      ],
    });
    setNewExName('');
    setShowAddEx(false);
    playSound('click');
  };

  const updateSet = (exIdx: number, setIdx: number, patch: Partial<{ reps: number; weight: number; completed: boolean }>) => {
    if (!draft) return;
    const exercises = draft.exercises.map((ex, i) =>
      i === exIdx ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) } : ex,
    );
    setDraft({ ...draft, exercises });
    if (patch.completed === true) startRest(restTotal || 90);
  };

  const addSet = (exIdx: number) => {
    if (!draft) return;
    const exercises = draft.exercises.map((ex, i) => {
      if (i !== exIdx) return ex;
      const last = ex.sets[ex.sets.length - 1] ?? { reps: 10, weight: 20 };
      return { ...ex, sets: [...ex.sets, { ...last, completed: false }] };
    });
    setDraft({ ...draft, exercises });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    if (!draft) return;
    const exercises = draft.exercises.map((ex, i) =>
      i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex,
    );
    setDraft({ ...draft, exercises });
  };

  const removeExercise = (exIdx: number) => {
    if (!draft) return;
    setDraft({ ...draft, exercises: draft.exercises.filter((_, i) => i !== exIdx) });
  };

  const completedSets = draft?.exercises.reduce((s, e) => s + e.sets.filter((x) => x.completed).length, 0) ?? 0;
  const totalSets = draft?.exercises.reduce((s, e) => s + e.sets.length, 0) ?? 0;
  const draftVolume = draft
    ? draft.exercises.reduce((s, e) => s + e.sets.filter((x) => x.completed).reduce((a, x) => a + x.weight * x.reps, 0), 0)
    : 0;

  const finish = async () => {
    if (!draft) return;
    const minutes = Math.max(1, Math.round(elapsed / 60) || draft.duration);
    await logWorkout({
      date: todayISO(),
      name: draft.name,
      duration: minutes,
      caloriesBurned: Math.round(minutes * (profile.weight > 0 ? 7.5 : 7)),
      exercises: draft.exercises,
    });
    setDraft(null);
    setRunning(false);
    setElapsed(0);
    setRestRunning(false);
    setRestLeft(0);
  };

  const groupedExercises = useMemo(() => {
    const groups: Record<string, string[]> = {};
    Object.entries(EXERCISE_LIBRARY).forEach(([g, list]) => {
      groups[g] = list;
    });
    return groups;
  }, []);

  const filteredHistory = workouts.filter((w) => {
    if (filter === 'all') return true;
    if (filter === 'week') return w.date >= isoDaysAgo(7);
    if (filter === 'month') return w.date >= isoDaysAgo(30);
    return true;
  });

  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  /* --------------------------- active session -------------------------- */
  if (draft) {
    return (
      <div className="space-y-4 pb-8">
        {/* Session bar */}
        <Card glow className="sticky top-16 z-20 p-0">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', t.bgSoft, t.text)}>
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full bg-transparent text-base font-bold text-white outline-none focus:underline"
              />
              <p className="font-mono text-[10px] text-slate-500">
                {completedSets}/{totalSets} sets · {fmtNum(draftVolume)} kg volume
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5">
              <Timer className={cn('h-3.5 w-3.5', running ? t.text : 'text-slate-600')} />
              <span className="font-mono text-sm font-bold tabular-nums text-white">{mmss(elapsed)}</span>
              <button
                onClick={() => setRunning((r) => !r)}
                className="rounded p-0.5 text-slate-400 transition hover:text-white"
                aria-label={running ? 'Pause' : 'Resume'}
              >
                {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>

            <Button size="sm" onClick={finish} icon={<Check className="h-3.5 w-3.5" />}>
              Finish
            </Button>
            <button
              onClick={() => {
                setDraft(null);
                setRunning(false);
                setElapsed(0);
              }}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white"
              aria-label="Discard"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Rest timer strip */}
          <div className="border-t border-white/[0.07] px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">rest</span>
              {[60, 90, 120, 180].map((s) => (
                <button
                  key={s}
                  onClick={() => startRest(s)}
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[10px] font-semibold transition',
                    restTotal === s ? cn(t.border, t.bgSoft, t.text) : 'border-white/10 text-slate-500 hover:text-white',
                  )}
                >
                  {s}s
                </button>
              ))}
              {restLeft > 0 && (
                <>
                  <div className="mx-1 h-1 w-20 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r', t.gradient)}
                      style={{ width: `${(restLeft / restTotal) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-white">{mmss(restLeft)}</span>
                  <button
                    onClick={() => {
                      setRestLeft(0);
                      setRestRunning(false);
                    }}
                    className="text-[10px] text-slate-500 hover:text-white"
                  >
                    skip
                  </button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Exercises */}
        <div className="space-y-3">
          {draft.exercises.map((ex, exIdx) => (
            <Card key={`${ex.name}-${exIdx}`} padded={false}>
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-md font-mono text-[10px] font-bold', t.bgSoft, t.text)}>
                  {exIdx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{ex.name}</p>
                  {ex.muscleGroup && (
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate-600">{ex.muscleGroup}</p>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => addSet(exIdx)} icon={<Plus className="h-3 w-3" />}>
                  Set
                </Button>
                <button
                  onClick={() => removeExercise(exIdx)}
                  className="rounded p-1.5 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Remove exercise"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="divide-y divide-white/[0.04]">
                <div className="grid grid-cols-[28px_1fr_1fr_52px_32px] items-center gap-2 px-4 py-1.5 font-mono text-[8px] uppercase tracking-wider text-slate-600">
                  <span>set</span>
                  <span>kg</span>
                  <span>reps</span>
                  <span className="text-center">1rm</span>
                  <span />
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={cn(
                      'grid grid-cols-[28px_1fr_1fr_52px_32px] items-center gap-2 px-4 py-1.5 transition-colors',
                      set.completed && 'bg-emerald-500/[0.04]',
                    )}
                  >
                    <span className={cn('font-mono text-[11px]', set.completed ? 'text-emerald-400' : 'text-slate-600')}>
                      {setIdx + 1}
                    </span>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(exIdx, setIdx, { weight: Number(e.target.value) })}
                      className="h-7 w-full rounded-md border border-white/[0.08] bg-black/30 px-1.5 text-[12px] tabular-nums text-white outline-none focus:border-white/25"
                    />
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exIdx, setIdx, { reps: Number(e.target.value) })}
                      className="h-7 w-full rounded-md border border-white/[0.08] bg-black/30 px-1.5 text-[12px] tabular-nums text-white outline-none focus:border-white/25"
                    />
                    <span className="text-center font-mono text-[10px] tabular-nums text-slate-500">
                      {set.weight > 0 ? estimate1RM(set.weight, set.reps) : '—'}
                    </span>
                    <div className="flex justify-end gap-0.5">
                      <button
                        onClick={() => updateSet(exIdx, setIdx, { completed: !set.completed })}
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-md border transition',
                          set.completed
                            ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                            : 'border-white/10 text-slate-600 hover:border-white/25 hover:text-slate-300',
                        )}
                        aria-label="Complete set"
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => removeSet(exIdx, setIdx)}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-slate-700 transition hover:text-red-400"
                        aria-label="Delete set"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAddEx(true)} icon={<Plus className="h-3.5 w-3.5" />}>
              Add exercise
            </Button>
            <Button variant="outline" onClick={finish} icon={<Check className="h-3.5 w-3.5" />}>
              Complete session
            </Button>
          </div>
        </div>

        <Modal
          open={showAddEx}
          onClose={() => setShowAddEx(false)}
          title="Add exercise"
          description="Pick from the library or write your own"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowAddEx(false)}>
                Cancel
              </Button>
              <Button onClick={addExercise} disabled={!newExName.trim()}>
                Add
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <Field label="Exercise name">
              <Input
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                placeholder="e.g. Incline Dumbbell Press"
                autoFocus
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Sets">
                <Stepper value={newExSets} onChange={setNewExSets} min={1} max={12} />
              </Field>
              <Field label="Reps">
                <Stepper value={newExReps} onChange={setNewExReps} min={1} max={50} />
              </Field>
              <Field label="Weight">
                <Stepper value={newExWeight} onChange={setNewExWeight} min={0} max={400} step={2.5} />
              </Field>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Library</p>
              <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                {Object.entries(groupedExercises).map(([group, list]) => (
                  <div key={group}>
                    <p className="mb-1 font-mono text-[8px] uppercase tracking-wider text-slate-600">{group}</p>
                    <div className="flex flex-wrap gap-1">
                      {list.map((name) => (
                        <button
                          key={name}
                          onClick={() => setNewExName(name)}
                          className={cn(
                            'rounded-md border px-2 py-1 text-[10px] transition',
                            newExName === name
                              ? cn(t.border, t.bgSoft, t.text)
                              : 'border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white',
                          )}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  /* ------------------------------- library ------------------------------ */
  return (
    <div className="space-y-5 pb-8">
      {/* stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: 'Sessions', v: workouts.filter((w) => w.date >= isoDaysAgo(7)).length, u: '/ 7d', i: <Dumbbell className="h-4 w-4" /> },
          { l: 'Volume', v: fmtNum(weekVolume), u: 'kg /7d', i: <TrendingUp className="h-4 w-4" /> },
          { l: 'PRs', v: prs.length, u: 'tracked', i: <Trophy className="h-4 w-4" /> },
          { l: 'Total', v: workouts.length, u: 'sessions', i: <Layers className="h-4 w-4" /> },
        ].map((s) => (
          <Card key={s.l} hover className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">{s.l}</p>
              <span className={t.text}>{s.i}</span>
            </div>
            <p className="mt-1.5 text-xl font-black tabular-nums leading-none text-white">
              {s.v}
              <span className="ml-1 text-[9px] font-medium text-slate-600">{s.u}</span>
            </p>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Card className="relative overflow-hidden" glow>
        <div className={cn('absolute inset-0 bg-gradient-to-r opacity-30', t.gradientSoft)} />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Start a session</h3>
            <p className="mt-1 max-w-md text-[11.5px] leading-relaxed text-slate-400">
              Six periodised templates ship with pre-loaded sets. Or start blank and build as you train — the rest timer
              and 1RM estimator run live.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowTemplates(true)} icon={<Play className="h-3.5 w-3.5" />}>
              Choose template
            </Button>
            <Button variant="secondary" onClick={startBlank} icon={<Plus className="h-3.5 w-3.5" />}>
              Blank
            </Button>
          </div>
        </div>
      </Card>

      {/* History */}
      <Card>
        <SectionHeader
          eyebrow="Archive"
          title="Session history"
          action={
            <Segmented
              theme={theme}
              value={filter}
              onChange={setFilter}
              size="sm"
              options={[
                { key: 'all', label: 'All' },
                { key: 'month', label: '30d' },
                { key: 'week', label: '7d' },
              ]}
            />
          }
        />

        {filteredHistory.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="h-8 w-8" />}
            title="No sessions logged"
            description="Your first session seeds the PR board, tonnage curve and readiness load model."
            action={
              <Button size="sm" onClick={() => setShowTemplates(true)}>
                Start now
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((w) => {
              const vol = totalVolume([w]);
              const sets = w.exercises.reduce((s, e) => s + e.sets.filter((x) => x.completed).length, 0);
              const open = historyOpen === w.id;
              return (
                <div key={w.id} className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <button
                    onClick={() => setHistoryOpen(open ? null : w.id)}
                    className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-white/[0.03]"
                  >
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', t.bgSoft, t.text)}>
                      <Dumbbell className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">{w.name}</p>
                      <p className="font-mono text-[9.5px] text-slate-500">
                        {fmtDate(w.date)} · {w.duration}min · {w.exercises.length} ex · {sets} sets
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-[12px] font-bold tabular-nums text-white">{fmtNum(vol)}</p>
                      <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">kg volume</p>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-600 transition-transform', open && 'rotate-180')} />
                  </button>

                  {open && (
                    <div className="anim-fade-in border-t border-white/[0.06] px-3.5 py-3">
                      <div className="space-y-2">
                        {w.exercises.map((ex, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-2">
                            <span className="w-[150px] shrink-0 truncate text-[11px] font-medium text-slate-300">{ex.name}</span>
                            <div className="flex flex-wrap gap-1">
                              {ex.sets.map((s, j) => (
                                <span
                                  key={j}
                                  className={cn(
                                    'rounded border px-1.5 py-0.5 font-mono text-[9.5px] tabular-nums',
                                    s.completed
                                      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                                      : 'border-white/10 text-slate-600',
                                  )}
                                >
                                  {s.weight}×{s.reps}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => removeWorkout(w.id)}
                          icon={<Trash2 className="h-3 w-3" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* PR table */}
      {prs.length > 0 && (
        <Card>
          <SectionHeader eyebrow="Strength ledger" title="Personal records" subtitle="Estimated 1RM via Epley formula" />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] font-mono text-[9px] uppercase tracking-wider text-slate-600">
                  <th className="pb-2 pr-3 font-medium">Exercise</th>
                  <th className="pb-2 pr-3 text-right font-medium">Best set</th>
                  <th className="pb-2 pr-3 text-right font-medium">Est 1RM</th>
                  <th className="pb-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {prs.slice(0, 10).map((pr) => (
                  <tr key={pr.exercise} className="border-b border-white/[0.03] last:border-0">
                    <td className="py-2 pr-3 text-[11.5px] font-medium text-slate-200">{pr.exercise}</td>
                    <td className="py-2 pr-3 text-right font-mono text-[11px] tabular-nums text-slate-400">
                      {pr.weight}kg × {pr.reps}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <span className={cn('font-mono text-[11.5px] font-bold tabular-nums', t.text)}>{pr.estimated1RM} kg</span>
                    </td>
                    <td className="py-2 text-right font-mono text-[10px] text-slate-600">{fmtDate(pr.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Templates modal */}
      <Modal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Choose a protocol"
        description="Pre-loaded sets and loads — edit anything before you finish"
        width="max-w-2xl"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {WORKOUT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              onClick={() => startFromTemplate(tpl.key)}
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-bold text-white">{tpl.name}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{tpl.focus}</p>
                </div>
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition', t.bgSoft, t.text)}>
                  <Play className="h-3 w-3" />
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-3 font-mono text-[9px] text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {tpl.duration}m
                </span>
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-2.5 w-2.5" /> {tpl.estimateCalories} kcal
                </span>
                <span className="inline-flex items-center gap-1">
                  <Dumbbell className="h-2.5 w-2.5" /> {tpl.exercises.length} ex
                </span>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
