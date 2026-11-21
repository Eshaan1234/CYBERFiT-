import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Card, ProgressBar, Ring, SectionHeader, Segmented } from '../ui';
import { cn, fmtRelative } from '../../lib/cn';
import { THEMES } from '../../theme';
import { CHALLENGES } from '../../lib/catalog';
import { rankTitle } from '../../lib/fitness';
import {
  Award,
  Bot,
  BrainCircuit,
  Beef,
  Camera,
  Check,
  Cpu,
  Droplet,
  Dumbbell,
  Flame,
  Heart,
  Lock,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  Trophy,
  Utensils,
  Waves,
  Zap,
  Activity,
} from 'lucide-react';
import type { Achievement } from '../../lib/types';

const ICONS: Record<string, React.ReactNode> = {
  Flame: <Flame className="h-4 w-4" />,
  Dumbbell: <Dumbbell className="h-4 w-4" />,
  Cpu: <Cpu className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  ShieldAlert: <ShieldAlert className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />,
  Droplet: <Droplet className="h-4 w-4" />,
  Waves: <Waves className="h-4 w-4" />,
  Utensils: <Utensils className="h-4 w-4" />,
  Beef: <Beef className="h-4 w-4" />,
  Award: <Award className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Trophy: <Trophy className="h-4 w-4" />,
  Bot: <Bot className="h-4 w-4" />,
  BrainCircuit: <BrainCircuit className="h-4 w-4" />,
  Camera: <Camera className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />,
  Radio: <Radio className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  Target: <Target className="h-4 w-4" />,
};

export const Achievements: React.FC = () => {
  const { achievements, profile, levelInfo, workouts, meals, daily, photos, claimedChallenges, claimChallenge, theme } = useApp();
  const t = THEMES[theme];
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlocked = achievements.filter((a) => a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);
  const totalXP = unlocked.reduce((s, a) => s + a.xpReward, 0);

  const visible = filter === 'all' ? achievements : filter === 'unlocked' ? unlocked : locked;

  const challenges = useMemo(
    () =>
      CHALLENGES.map((c) => {
        const p = c.progress({ workouts, meals, daily, profile, photos });
        return { ...c, current: p.current, target: p.target, claimed: claimedChallenges.includes(c.key) };
      }),
    [workouts, meals, daily, profile, photos, claimedChallenges],
  );

  const categories = ['consistency', 'nutrition', 'strength', 'exploration', 'social'] as const;

  return (
    <div className="space-y-5 pb-8">
      {/* Rank banner */}
      <Card glow className="relative overflow-hidden">
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30', t.gradientSoft)} />
        <div className="relative flex flex-wrap items-center gap-5">
          <Ring
            value={levelInfo.current}
            max={levelInfo.need}
            size={108}
            stroke={9}
            theme={theme}
            label={<span className="text-2xl font-black text-white">{profile.level}</span>}
            sublabel={<span className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-500">level</span>}
          />
          <div className="min-w-0 flex-1">
            <Badge tone="accent" theme={theme} icon={<Trophy className="h-2.5 w-2.5" />}>
              {rankTitle(profile.level)}
            </Badge>
            <h2 className="mt-2 text-xl font-black tracking-tight text-white">
              {unlocked.length} of {achievements.length} badges earned
            </h2>
            <p className="mt-1 text-[11.5px] text-slate-400">
              {totalXP.toLocaleString()} XP banked from achievements · {levelInfo.remaining} XP to level {profile.level + 1}
            </p>
            <ProgressBar value={levelInfo.current} max={levelInfo.need} theme={theme} className="mt-3" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: 'Unlocked', v: unlocked.length },
              { l: 'Locked', v: locked.length },
              { l: 'Streak', v: `${profile.streak}d` },
              { l: 'Longest', v: `${profile.longestStreak}d` },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-white/[0.07] bg-black/25 px-2.5 py-1.5">
                <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">{s.l}</p>
                <p className="text-[13px] font-bold tabular-nums text-white">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Challenges */}
      <Card>
        <SectionHeader
          eyebrow="Weekly missions"
          title="Active challenges"
          subtitle="Progress tracked live from your logs · claim when complete"
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => {
            const done = c.current >= c.target;
            const pct = Math.min(100, (c.current / c.target) * 100);
            return (
              <div
                key={c.key}
                className={cn(
                  'rounded-xl border p-3 transition',
                  c.claimed
                    ? 'border-emerald-500/25 bg-emerald-500/[0.05]'
                    : done
                      ? cn(t.border, t.bgSoft)
                      : 'border-white/[0.06] bg-white/[0.02]',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', done ? cn(t.bgSoft, t.text) : 'bg-white/[0.05] text-slate-500')}>
                    {ICONS[c.icon] ?? <Target className="h-4 w-4" />}
                  </span>
                  <span className="font-mono text-[9px] font-bold text-amber-400">+{c.xp}</span>
                </div>
                <p className="mt-2 text-[12px] font-bold text-white">{c.title}</p>
                <p className="text-[10px] leading-snug text-slate-500">{c.description}</p>
                <div className="mt-2">
                  <div className="flex justify-between font-mono text-[9px] text-slate-600">
                    <span>
                      {Math.min(c.current, c.target)}/{c.target}
                    </span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className={cn('h-full rounded-full bg-gradient-to-r', t.gradient)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {c.claimed ? (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <Check className="h-3 w-3" strokeWidth={3} /> Claimed
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant={done ? 'primary' : 'secondary'}
                    className="mt-2 w-full"
                    disabled={!done}
                    onClick={() => claimChallenge(c.key)}
                  >
                    {done ? `Claim +${c.xp} XP` : 'In progress'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Badge grid */}
      <Card>
        <SectionHeader
          eyebrow="Matrix"
          title="All badges"
          action={
            <Segmented
              theme={theme}
              size="sm"
              value={filter}
              onChange={(v) => setFilter(v as typeof filter)}
              options={[
                { key: 'all', label: `All ${achievements.length}` },
                { key: 'unlocked', label: `Earned ${unlocked.length}` },
                { key: 'locked', label: `Locked ${locked.length}` },
              ]}
            />
          }
        />

        {categories.map((cat) => {
          const items = visible.filter((a) => a.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-4 last:mb-0">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">
                {cat} · {items.filter((a) => a.unlockedAt).length}/{items.length}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((a) => (
                  <BadgeCard key={a.id} achievement={a} theme={theme} />
                ))}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

const BadgeCard: React.FC<{ achievement: Achievement; theme: keyof typeof THEMES }> = ({ achievement, theme }) => {
  const t = THEMES[theme];
  const unlocked = Boolean(achievement.unlockedAt);
  return (
    <div
      className={cn(
        'group relative flex items-start gap-2.5 overflow-hidden rounded-xl border p-3 transition-all',
        unlocked
          ? cn(t.border, t.bgSoft, 'hover:-translate-y-0.5')
          : 'border-white/[0.06] bg-white/[0.015] opacity-70',
      )}
    >
      {unlocked && <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', t.gradientSoft)} />}
      <div
        className={cn(
          'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          unlocked ? cn(t.bgSoft, t.text) : 'bg-white/[0.04] text-slate-600',
        )}
      >
        {unlocked ? ICONS[achievement.icon] ?? <Award className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-[11.5px] font-bold leading-tight', unlocked ? 'text-white' : 'text-slate-400')}>
            {achievement.title}
          </p>
          <span className={cn('shrink-0 font-mono text-[8.5px] font-bold', unlocked ? 'text-amber-400' : 'text-slate-700')}>
            +{achievement.xpReward}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{achievement.description}</p>
        {unlocked && achievement.unlockedAt && (
          <p className="mt-1 font-mono text-[8px] uppercase tracking-wider text-emerald-500/70">
            unlocked {fmtRelative(achievement.unlockedAt)}
          </p>
        )}
      </div>
    </div>
  );
};
