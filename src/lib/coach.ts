import type { DailyLog, MealLog, ReadinessScore, UserProfile, WorkoutSession } from './types';
import { average, isoDaysAgo, personalRecords, round, totalVolume, weightForecast } from './fitness';

export interface CoachContext {
  profile: UserProfile;
  workouts: WorkoutSession[];
  meals: MealLog[];
  daily: DailyLog[];
  readiness: ReadinessScore;
}

export interface CoachSuggestion {
  label: string;
  prompt: string;
}

export const COACH_SUGGESTIONS: CoachSuggestion[] = [
  { label: 'Build my split', prompt: 'Build me a weekly training split' },
  { label: 'Fix my protein', prompt: 'How do I hit my protein target?' },
  { label: 'Read my progress', prompt: 'Analyse my progress so far' },
  { label: 'Plateaued on bench', prompt: 'I plateaud on bench press, what do I do?' },
  { label: 'Should I deload?', prompt: 'Should I deload this week?' },
  { label: 'Fast fat loss', prompt: 'How do I lose fat without losing muscle?' },
];

const has = (text: string, ...keys: string[]) => keys.some((k) => text.includes(k));

const fmt = (n: number) => Math.round(n).toLocaleString();

/**
 * Deterministic, data-aware coaching engine. It reasons over the user's real
 * logs (volume, PRs, macros, hydration, recovery) rather than returning canned
 * copy, so answers change as the athlete's data changes.
 */
export function generateCoachReply(input: string, ctx: CoachContext): string {
  const q = input.toLowerCase().trim();
  const { profile, workouts, daily } = ctx;

  const week = workouts.filter((w) => w.date >= isoDaysAgo(7));
  const volume = totalVolume(week);
  const prs = personalRecords(workouts);
  const forecast = weightForecast(daily, 14);
  const today = daily.find((d) => d.date === isoDaysAgo(0));
  const avgCalories = average(daily.slice(0, 7).map((d) => d.calories));
  const avgProtein = average(daily.slice(0, 7).map((d) => d.protein));

  /* ---------- training split ---------- */
  if (has(q, 'split', 'routine', 'program', 'plan my week', 'schedule', 'weekly')) {
    const days =
      profile.experience === 'beginner'
        ? 3
        : profile.experience === 'intermediate'
          ? 4
          : 5;
    const splits: Record<number, string[]> = {
      3: ['Full Body A — Squat focus', 'Full Body B — Press focus', 'Full Body C — Hinge focus'],
      4: ['Upper A — Horizontal push/pull', 'Lower A — Squat dominant', 'Upper B — Vertical push/pull', 'Lower B — Hinge dominant'],
      5: [
        'Push — Chest/Shoulders/Triceps',
        'Pull — Back/Biceps',
        'Legs — Quads/Hams/Calves',
        'Upper Accessory + Arms',
        'Conditioning + Core',
      ],
    };
    return [
      `**${days}-day ${profile.goal === 'fat_loss' ? 'metabolic' : 'hypertrophy'} block for ${profile.name.split(' ')[0]}**`,
      `Target: ${profile.targetCalories} kcal · ${profile.targetProtein}P / ${profile.targetCarbs}C / ${profile.targetFats}F.`,
      '',
      ...splits[days].map((s, i) => `**Day ${i + 1}** — ${s}`),
      '',
      `You logged **${week.length} sessions** in the last 7 days (${fmt(volume)} kg moved). ${
        week.length < days
          ? `To run this block reliably, add ${days - week.length} more session${days - week.length === 1 ? '' : 's'} per week — consistency drives the adaptation.`
          : 'Frequency already matches the block. Keep progressive overload at +2.5% load per week.'
      }`,
      `Progression rule: when you hit the top of the rep range on all sets with clean form, add 2.5 kg (upper) or 5 kg (lower).`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  /* ---------- protein ---------- */
  if (has(q, 'protein', 'macro', 'nutrition target', 'how much should i eat')) {
    const gap = Math.max(0, profile.targetProtein - Math.round(today?.protein ?? 0));
    const perMeal = Math.round(profile.targetProtein / 4);
    return [
      `Your protein target is **${profile.targetProtein} g** (${round(profile.targetProtein / profile.weight, 2)} g/kg for ${profile.weight} kg).`,
      `7-day average: **${Math.round(avgProtein)} g** — that is ${avgProtein >= profile.targetProtein * 0.9 ? 'on target ✅' : `${Math.round(profile.targetProtein - avgProtein)} g short ⚠️`}.`,
      today ? `Today you've logged **${Math.round(today.protein)} g**, so ${gap > 0 ? `${gap} g remaining` : 'you are already over target'}.` : '',
      '',
      '**Execution grid** (4 feeds × ~' + perMeal + ' g):',
      `• Feed 1 — 3 eggs + 200 g Greek yogurt (~${Math.round(perMeal * 0.9)} g)`,
      `• Feed 2 — 180 g chicken breast + rice (~${perMeal + 4} g)`,
      `• Feed 3 — whey isolate shake + banana (~30 g)`,
      `• Feed 4 — 180 g salmon or paneer + veg (~${perMeal} g)`,
      '',
      'Leucine threshold matters more than timing: 0.4 g/kg per meal flips on mTOR. Spread it — do not stack it all at dinner.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  /* ---------- progress analysis ---------- */
  if (has(q, 'progress', 'analyse', 'analyze', 'how am i doing', 'review', 'stats', 'summary')) {
    return [
      `**Telemetry report — ${profile.name}**`,
      `• Level ${profile.level} · ${profile.xp} XP · streak ${profile.streak} days`,
      `• Sessions this week: ${week.length} · tonnage ${fmt(volume)} kg`,
      `• PRs on record: ${prs.length}${prs.length ? ` (top: ${prs[0].exercise} ≈ ${prs[0].estimated1RM} kg est. 1RM)` : ' — you have not logged a completed set yet'}`,
      `• Readiness: ${ctx.readiness.score}/100 (${ctx.readiness.label})`,
      forecast
        ? `• Bodyweight trend: ${forecast.slopePerWeek > 0 ? '+' : ''}${forecast.slopePerWeek} kg/week → projected ${forecast.projected} kg in 14 days`
        : '• Bodyweight trend: not enough weigh-ins yet (log weight 3+ times for forecasting)',
      `• Avg intake: ${fmt(avgCalories)} kcal / ${Math.round(avgProtein)} g protein per day`,
      '',
      insightLine(ctx),
      '',
      `${
        profile.goal === 'fat_loss'
          ? forecast && forecast.slopePerWeek > -0.2
            ? 'Deficit is not biting yet — cut 200 kcal from carbs or add 2 × 20 min zone-2 sessions.'
            : 'Deficit is working. Hold it and protect protein to preserve lean mass.'
          : profile.goal === 'muscle_gain'
            ? forecast && forecast.slopePerWeek < 0.1
              ? 'You are not in a surplus. Add 250 kcal from clean carbs on training days.'
              : 'Surplus is landing well — watch the waist measurement monthly, not weekly.'
            : 'Maintenance looks stable. Recomp happens through progressive overload, not calorie swings.'
      }`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  /* ---------- plateau / PR ---------- */
  if (has(q, 'plateau', 'plateaud', 'stuck', 'not progressing', 'bench', 'stalled')) {
    const benchPr = prs.find((p) => p.exercise.toLowerCase().includes('bench'));
    return [
      `**Plateau diagnosis**${benchPr ? ` — ${benchPr.exercise}: best ${benchPr.weight} kg × ${benchPr.reps} (≈ ${benchPr.estimated1RM} kg 1RM)` : ''}`,
      '',
      'A plateau is almost never "the program". Run this checklist in order:',
      '1. **Calories** — you are averaging ' + fmt(avgCalories) + ' kcal. A bodyweight gain of <0.1 kg/week on a bulk means you are not in a surplus.',
      '2. **Frequency** — you trained ' + week.length + '× last week. Bench twice a week minimum for pressing progress.',
      '3. **Intensity exposure** — add a top single at 85–90% weekly, then back off. Neurological adaptation precedes structural.',
      '4. **Sleep** — you logged ' + (today?.sleepHours ?? 'no') + (today?.sleepHours ? 'h' : '') + ' last night. Under 7h tanks force output by 5–10%.',
      '',
      '**Two-week unstick protocol:**',
      '• Week 1: 4×3 @ 87.5% then 3×8 @ 65% (volume backoff).',
      '• Week 2: 3×2 @ 92% then 2×6 @ 75%.',
      '• Then retest a 3RM. Expect 2.5–5 kg.',
      benchPr ? `Your current est. 1RM is ${benchPr.estimated1RM} kg — target ${round(benchPr.estimated1RM * 1.04, 1)} kg in 14 days.` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  /* ---------- deload / recovery ---------- */
  if (has(q, 'deload', 'recover', 'sore', 'tired', 'fatigue', 'rest day', 'overtrain', 'sleep')) {
    return [
      `**Recovery status: ${ctx.readiness.score}/100 — ${ctx.readiness.label}**`,
      ...ctx.readiness.factors.map((f) => `• ${f.label}: ${f.value} (${f.impact >= 0 ? '+' : ''}${f.impact})`),
      '',
      ctx.readiness.recommendation,
      '',
      ctx.readiness.score < 60
        ? [
            '**Deload week prescription:**',
            '• Keep the same lifts, cut sets by 40% and load by 10–15%.',
            '• Two full rest days, zero HIIT.',
            '• Sleep 8h+; add 400 mg magnesium bisglycinate before bed.',
            '• Re-test readiness after 5 days before resuming full volume.',
          ].join('\n')
        : 'Do not deload yet — you have headroom. Push heavy compounds while readiness is above 70, and keep accessory work at RPE 8.',
    ].join('\n');
  }

  /* ---------- fat loss ---------- */
  if (has(q, 'fat loss', 'lose fat', 'cut', 'shred', 'lean out', 'weight loss')) {
    return [
      `**Fat-loss protocol for ${profile.weight} kg**`,
      `Target: **${profile.targetCalories} kcal**, protein floor **${profile.targetProtein} g** (this is the muscle-sparing lever).`,
      '',
      'Non-negotiables:',
      '• Protein at every feed — muscle is lost when protein drops below 1.8 g/kg in a deficit.',
      '• Lift heavy, low volume: 3–5 reps on compounds twice weekly. That is the retention signal.',
      '• 8,000–10,000 steps daily. NEAT burns more weekly than any cardio session.',
      '• 2 × 20 min zone-2, not daily HIIT — cortisol blunts the deficit.',
      '',
      `Your current average is **${fmt(avgCalories)} kcal**, ${avgCalories > profile.targetCalories ? 'above' : 'below'} target. ${
        avgCalories > profile.targetCalories
          ? `Cut ${Math.round(avgCalories - profile.targetCalories)} kcal/day — mostly from liquid calories and oils, not whole food.`
          : 'Intake is dialled in — the missing piece is energy expenditure.'
      }`,
      forecast ? `Trend is ${forecast.slopePerWeek > 0 ? '+' : ''}${forecast.slopePerWeek} kg/week. A safe, muscle-sparing rate is -0.5 to -0.75 kg/week.` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  /* ---------- hydration ---------- */
  if (has(q, 'water', 'hydrat', 'drink')) {
    const water = today?.water ?? 0;
    return [
      `Hydration: **${water} / ${profile.targetWater} ml** today (${Math.round((water / profile.targetWater) * 100)}%).`,
      `Formula: 35 ml × ${profile.weight} kg ≈ ${profile.targetWater} ml baseline, +500–750 ml for every training hour.`,
      '',
      'Protocol: 500 ml on waking, 500 ml per meal, 750 ml around training. Add a pinch of salt + potassium on 2h+ sessions — plain water without electrolytes just increases urine output.',
      water >= profile.targetWater ? 'You are already over target today — well held. ✅' : `Still ${profile.targetWater - water} ml to go. Hit it and you unlock the Hydration achievement.`,
    ].join('\n');
  }

  /* ---------- greeting ---------- */
  if (has(q, 'hello', 'hi ', 'hey', 'who are you', 'coach') || q === 'hi') {
    return [
      `Online. I'm **CyberCoach v3.0**, reading your live telemetry, ${profile.name.split(' ')[0]}.`,
      '',
      `• Readiness today: **${ctx.readiness.score}/100 (${ctx.readiness.label})**`,
      `• Streak: **${profile.streak} days** · Level ${profile.level}`,
      `• Last 7 days: ${week.length} sessions, ${fmt(volume)} kg tonnage`,
      `• PRs tracked: ${prs.length}`,
      '',
      'Ask me to build a split, diagnose a plateau, audit your macros, or decide whether to deload. I answer from your data, not a script.',
    ].join('\n');
  }

  /* ---------- fallback: data-grounded ---------- */
  return [
    `Analysed your query against live telemetry, ${profile.name.split(' ')[0]}.`,
    '',
    insightLine(ctx),
    '',
    `**Where the leverage is right now:**`,
    `1. ${week.length < 3 ? 'Training frequency is the bottleneck — get to 3+ sessions/week.' : 'Frequency is solid — push load progression on the top set of each compound.'}`,
    `2. ${Math.abs(avgCalories - profile.targetCalories) > 300 ? `Calories are drifting ${Math.round(avgCalories - profile.targetCalories)} kcal from target.` : 'Calorie adherence is tight — keep it.'}`,
    `3. ${ctx.readiness.score < 65 ? 'Recovery is the limiter; sleep and hydration first.' : 'Recovery supports more load — you have headroom to add volume.'}`,
    '',
    'Try asking: "build me a weekly split", "analyse my progress", or "should I deload?"',
  ]
    .filter(Boolean)
    .join('\n');
}

function insightLine(ctx: CoachContext) {
  const { workouts, daily, readiness } = ctx;
  const week = workouts.filter((w) => w.date >= isoDaysAgo(7));
  const volume = totalVolume(week);
  if (!workouts.length) return 'No training logged yet — log a session and I can begin modelling your load curve.';
  if (volume > 25000) return `You moved ${fmt(volume)} kg this week — that is advanced tonnage. Watch joint recovery.`;
  if (readiness.score < 55) return `Readiness at ${readiness.score} says repair before you rebuild. ${daily.filter((d) => d.sleepHours).length ? 'Sleep is the weakest link.' : 'Start logging sleep to sharpen this signal.'}`;
  if (week.length >= 4) return `Consistency is elite: ${week.length} sessions in 7 days. Protect the streak, not the ego.`;
  return `${week.length} session(s) and ${fmt(volume)} kg this week. One more quality session moves the curve.`;
}

export const COACH_GREETING = (name: string) =>
  `Systems online. I'm **CyberCoach v3.0** — your neural training architect, ${name.split(' ')[0]}. I read your live logs to build protocols, audit macros, and diagnose plateaus. What are we engineering today?`;
