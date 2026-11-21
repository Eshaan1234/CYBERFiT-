import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, Card, EmptyState, SectionHeader, Segmented, Stat } from '../ui';
import { cn, fmtNum } from '../../lib/cn';
import { THEMES } from '../../theme';
import { average, isoDaysAgo, linearTrend, personalRecords, totalVolume, weightForecast } from '../../lib/fitness';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Dumbbell, Flame, Target, TrendingUp } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { workouts, meals, daily, profile, theme } = useApp();
  const t = THEMES[theme];
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const days = Number(range);

  /* -------------------------------- series -------------------------------- */
  const series = useMemo(() => {
    return Array.from({ length: days }).map((_, i) => {
      const date = isoDaysAgo(days - 1 - i);
      const row = daily.find((d) => d.date === date);
      const w = workouts.filter((x) => x.date === date);
      return {
        date,
        label: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        calories: row?.calories ?? 0,
        protein: row?.protein ?? 0,
        carbs: row?.carbs ?? 0,
        fats: row?.fats ?? 0,
        burned: row?.caloriesBurned ?? 0,
        water: row?.water ?? 0,
        active: row?.activeMinutes ?? 0,
        volume: totalVolume(w),
        weight: row?.weight ?? null,
        sleep: row?.sleepHours ?? null,
      };
    });
  }, [daily, workouts, days]);

  const volSeries = series.filter((s) => s.volume > 0 || s.active > 0);

  const totals = useMemo(() => {
    const wk = workouts.filter((w) => w.date >= isoDaysAgo(days));
    return {
      sessions: wk.length,
      volume: totalVolume(wk),
      minutes: wk.reduce((s, w) => s + w.duration, 0),
      burned: wk.reduce((s, w) => s + w.caloriesBurned, 0),
      avgCalories: average(series.map((s) => s.calories)),
      avgProtein: average(series.map((s) => s.protein)),
      avgWater: average(series.map((s) => s.water)),
      adherence: series.filter((s) => s.calories > 0).length,
    };
  }, [workouts, series, days]);

  const prs = useMemo(() => personalRecords(workouts), [workouts]);
  const forecast = useMemo(() => weightForecast(daily, 14), [daily]);

  /* ------------------------- lift progress chart ------------------------- */
  const liftProgress = useMemo(() => {
    const map = new Map<string, { date: string; est: number; name: string }[]>();
    [...workouts]
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .forEach((w) => {
        w.exercises.forEach((ex) => {
          const best = ex.sets.filter((s) => s.completed && s.weight > 0).reduce((m, s) => Math.max(m, s.weight * (1 + s.reps / 30)), 0);
          if (best > 0) {
            const arr = map.get(ex.name) ?? [];
            arr.push({ date: w.date, est: Math.round(best * 10) / 10, name: ex.name });
            map.set(ex.name, arr);
          }
        });
      });
    return map;
  }, [workouts]);

  const topLifts = useMemo(
    () => [...liftProgress.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 3),
    [liftProgress],
  );

  const liftChart = useMemo(() => {
    if (!topLifts.length) return [];
    const dates = [...new Set(topLifts.flatMap(([, arr]) => arr.map((x) => x.date)))].sort();
    return dates.map((date) => {
      const row: Record<string, string | number> = { date };
      topLifts.forEach(([name, arr]) => {
        const point = arr.filter((x) => x.date <= date).slice(-1)[0];
        if (point) row[name] = point.est;
      });
      return row;
    });
  }, [topLifts]);

  /* ----------------------------- muscle split ---------------------------- */
  const muscleSplit = useMemo(() => {
    const map: Record<string, number> = {};
    workouts
      .filter((w) => w.date >= isoDaysAgo(days))
      .forEach((w) =>
        w.exercises.forEach((ex) => {
          const vol = ex.sets.filter((s) => s.completed).reduce((a, s) => a + s.weight * s.reps, 0);
          const g = ex.muscleGroup ?? 'other';
          map[g] = (map[g] ?? 0) + vol;
        }),
      );
    const colors: Record<string, string> = {
      chest: '#22d3ee',
      back: '#a78bfa',
      legs: '#fbbf24',
      shoulders: '#f472b6',
      arms: '#34d399',
      core: '#fb923c',
      cardio: '#60a5fa',
      custom: '#94a3b8',
      other: '#64748b',
    };
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value), color: colors[name] ?? '#94a3b8' }))
      .sort((a, b) => b.value - a.value);
  }, [workouts, days]);

  /* ------------------------------ consistency ---------------------------- */
  const heatmap = useMemo(() => {
    const cells = Array.from({ length: 91 }).map((_, i) => {
      const date = isoDaysAgo(90 - i);
      const row = daily.find((d) => d.date === date);
      const intensity =
        (row?.activeMinutes ?? 0) > 0 ? 3 : (row?.calories ?? 0) > 0 ? 2 : (row?.water ?? 0) > 0 ? 1 : 0;
      return { date, intensity };
    });
    return cells;
  }, [daily]);

  const trend = (vals: number[]) => {
    const slope = linearTrend(vals);
    return Math.round(slope * 100) / 100;
  };

  const radarData = [
    { axis: 'Consistency', value: Math.min(100, (totals.adherence / days) * 100) },
    { axis: 'Volume', value: Math.min(100, (totals.volume / (days * 600)) * 100) },
    { axis: 'Protein', value: Math.min(100, (totals.avgProtein / profile.targetProtein) * 100) },
    { axis: 'Hydration', value: Math.min(100, (totals.avgWater / profile.targetWater) * 100) },
    { axis: 'Recovery', value: Math.min(100, (average(series.map((s) => s.sleep ?? 0)) / 8) * 100) },
  ];

  const hasData = workouts.length > 0 || meals.length > 0 || daily.length > 0;

  if (!hasData) {
    return (
      <Card>
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="The analytics engine needs data"
          description="Log a workout, a meal, or your weight and this page fills with trendlines, forecasts and distributions."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Telemetry window</h2>
          <p className="text-[11px] text-slate-500">All charts recompute from your Supabase rows</p>
        </div>
        <Segmented
          theme={theme}
          value={range}
          onChange={(v) => setRange(v as typeof range)}
          options={[
            { key: '7', label: '7 days' },
            { key: '30', label: '30 days' },
            { key: '90', label: '90 days' },
          ]}
        />
      </div>

      {/* stat grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Sessions"
          value={totals.sessions}
          hint={`${Math.round(totals.minutes)} min trained`}
          icon={<Dumbbell className="h-3.5 w-3.5" />}
          theme={theme}
          delta={Math.round(trend(series.map((s) => (s.volume > 0 ? 1 : 0))) * 100)}
        />
        <Stat
          label="Tonnage"
          value={fmtNum(totals.volume)}
          unit="kg"
          hint={`${fmtNum(totals.burned)} kcal burned`}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          theme={theme}
          delta={Math.round(trend(series.map((s) => s.volume)) * 10)}
        />
        <Stat
          label="Avg intake"
          value={fmtNum(totals.avgCalories)}
          unit="kcal"
          hint={`target ${profile.targetCalories}`}
          icon={<Flame className="h-3.5 w-3.5" />}
          theme={theme}
          delta={Math.round(((totals.avgCalories - profile.targetCalories) / profile.targetCalories) * 100)}
        />
        <Stat
          label="Adherence"
          value={Math.round((totals.adherence / days) * 100)}
          unit="%"
          hint={`${totals.adherence}/${days} days logged`}
          icon={<Target className="h-3.5 w-3.5" />}
          theme={theme}
        />
      </div>

      {/* volume + nutrition */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            eyebrow="Load progression"
            title="Training volume"
            action={<Badge tone="accent" theme={theme}>{fmtNum(totals.volume)} kg total</Badge>}
          />
          <div className="h-[210px]">
            {volSeries.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volSeries} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip
                    contentStyle={{ background: '#0b0b16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="volume" name="Volume (kg)" radius={[3, 3, 0, 0]} fill={t.hex} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-slate-600">
                No volume logged in this window
              </div>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Macro stack" title="Daily intake composition" />
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  contentStyle={{ background: '#0b0b16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }}
                  labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                />
                <Area type="monotone" dataKey="protein" name="Protein (g)" stroke="#22d3ee" strokeWidth={1.8} fill="url(#gP)" />
                <Area type="monotone" dataKey="carbs" name="Carbs (g)" stroke="#fbbf24" strokeWidth={1.8} fill="url(#gC)" />
                <Area type="monotone" dataKey="fats" name="Fats (g)" stroke="#a78bfa" strokeWidth={1.8} fill="url(#gF)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* lift progression + radar */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <SectionHeader eyebrow="Strength curves" title="Estimated 1RM progression" subtitle="Top three most-logged lifts" />
          <div className="h-[220px]">
            {liftChart.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liftChart} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => new Date(`${v}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip
                    contentStyle={{ background: '#0b0b16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                  {topLifts.map(([name], i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={['#22d3ee', '#fbbf24', '#a78bfa'][i]}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-slate-600">
                Log the same lift across 2+ sessions to see progression
              </div>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Profile" title="Performance radar" />
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar dataKey="value" stroke={t.hex} fill={t.hex} fillOpacity={0.22} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* muscle split + forecast */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader eyebrow="Distribution" title="Volume by muscle group" />
          {muscleSplit.length ? (
            <div className="space-y-2">
              {muscleSplit.map((m) => {
                const total = muscleSplit.reduce((s, x) => s + x.value, 0) || 1;
                const pct = (m.value / total) * 100;
                return (
                  <div key={m.name}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10.5px] font-medium capitalize text-slate-300">{m.name}</span>
                      <span className="font-mono text-[9.5px] tabular-nums text-slate-500">
                        {fmtNum(m.value)} kg · {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-[11px] text-slate-600">
              Tag muscle groups when logging to unlock this breakdown
            </p>
          )}
        </Card>

        <Card>
          <SectionHeader eyebrow="Forecast" title="Bodyweight projection" />
          {forecast ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: 'slope / week', v: `${forecast.slopePerWeek > 0 ? '+' : ''}${forecast.slopePerWeek}`, u: 'kg' },
                  { l: 'in 14 days', v: forecast.projected, u: 'kg' },
                  { l: 'current', v: profile.weight, u: 'kg' },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">{s.l}</p>
                    <p className="mt-1 text-base font-black tabular-nums leading-none text-white">
                      {s.v}
                      <span className="ml-0.5 text-[9px] font-medium text-slate-600">{s.u}</span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-[130px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      ...daily
                        .filter((d) => d.weight && d.weight > 0)
                        .sort((a, b) => (a.date < b.date ? -1 : 1))
                        .slice(-20)
                        .map((d) => ({ label: d.date, actual: d.weight as number })),
                      { label: '+7d', projected: Math.round((profile.weight + forecast.slopePerDay * 7) * 10) / 10 } as never,
                      { label: '+14d', projected: forecast.projected } as never,
                    ]}
                    margin={{ top: 4, right: 4, left: -26, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip
                      contentStyle={{ background: '#0b0b16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }}
                      labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                    />
                    <Line type="monotone" dataKey="actual" stroke={t.hex} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                    <Line type="monotone" dataKey="projected" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-[11px] text-slate-600">
              Log weight on 3+ days to activate regression forecasting
            </p>
          )}
        </Card>
      </div>

      {/* consistency heatmap */}
      <Card>
        <SectionHeader
          eyebrow="Consistency"
          title="90-day activity grid"
          subtitle="Each cell is a day — brighter means more logged"
          action={
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-600">
              <span>less</span>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{ backgroundColor: i === 0 ? 'rgba(255,255,255,0.06)' : `rgba(34,211,238,${0.25 + i * 0.25})` }}
                />
              ))}
              <span>more</span>
            </div>
          }
        />
        <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
          {heatmap.map((c) => (
            <div
              key={c.date}
              title={`${c.date}: ${['no activity', 'hydration only', 'nutrition logged', 'training logged'][c.intensity]}`}
              className="aspect-square rounded-[2px] transition hover:ring-1 hover:ring-white/40"
              style={{
                backgroundColor:
                  c.intensity === 0
                    ? 'rgba(255,255,255,0.05)'
                    : `rgba(34,211,238,${0.2 + c.intensity * 0.26})`,
              }}
            />
          ))}
        </div>
      </Card>

      {/* PR table */}
      {prs.length > 0 && (
        <Card>
          <SectionHeader eyebrow="Ledger" title="All-time personal records" />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] font-mono text-[9px] uppercase tracking-wider text-slate-600">
                  <th className="pb-2 pr-3 font-medium">Lift</th>
                  <th className="pb-2 pr-3 text-right font-medium">Weight</th>
                  <th className="pb-2 pr-3 text-right font-medium">Reps</th>
                  <th className="pb-2 pr-3 text-right font-medium">Est 1RM</th>
                  <th className="pb-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {prs.map((pr) => (
                  <tr key={pr.exercise} className="border-b border-white/[0.03] last:border-0">
                    <td className="py-1.5 pr-3 text-[11.5px] text-slate-200">{pr.exercise}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-[11px] tabular-nums text-slate-400">{pr.weight}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-[11px] tabular-nums text-slate-400">{pr.reps}</td>
                    <td className={cn('py-1.5 pr-3 text-right font-mono text-[11px] font-bold tabular-nums', t.text)}>
                      {pr.estimated1RM}
                    </td>
                    <td className="py-1.5 text-right font-mono text-[10px] text-slate-600">{pr.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
