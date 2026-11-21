import React, { useEffect, useState } from 'react';
import { Button } from './ui';
import { cn } from '../lib/cn';
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  Cpu,
  Dumbbell,
  Flame,
  HeartPulse,
  LineChart,
  Lock,
  Menu,
  ShieldCheck,
  Sparkles,
  Trophy,
  Utensils,
  X,
  Zap,
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const NAV = [
  { href: '#engine', label: 'Engine' },
  { href: '#modules', label: 'Modules' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

const MODULES = [
  {
    icon: <Dumbbell className="h-5 w-5" />,
    title: 'Workout telemetry',
    body: 'Log set-by-set load and reps with a live rest timer, auto volume totals and estimated 1RM per lift. Six periodised templates ship out of the box.',
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    hover: 'group-hover:border-cyan-500/40',
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    title: 'Macro synthesizer',
    body: 'Mifflin–St Jeor energy modelling with goal-adjusted offsets and protein-first macro derivation. Rings update the instant you log a meal.',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    hover: 'group-hover:border-emerald-500/40',
  },
  {
    icon: <BrainCircuit className="h-5 w-5" />,
    title: 'Data-grounded AI coach',
    body: 'A reasoning engine that reads your actual logs — volume, PRs, sleep, adherence — then answers with specific prescriptions instead of generic tips.',
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
    hover: 'group-hover:border-violet-500/40',
  },
  {
    icon: <HeartPulse className="h-5 w-5" />,
    title: 'Readiness modelling',
    body: 'A 0–100 daily score blended from sleep, 3-day training load, hydration and protein adherence. Tells you when to push and when to deload.',
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
    hover: 'group-hover:border-rose-500/40',
  },
  {
    icon: <LineChart className="h-5 w-5" />,
    title: 'Predictive trends',
    body: 'Linear-regression forecasting on bodyweight with per-week slope, plus 7/30-day moving averages so you can separate signal from water weight.',
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
    hover: 'group-hover:border-amber-500/40',
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    title: 'Progression system',
    body: 'Twenty achievements, weekly challenges, an XP curve and rank titles. Training adherence gamified without turning your program into a toy.',
    accent: 'text-sky-400',
    bg: 'bg-sky-500/10',
    hover: 'group-hover:border-sky-500/40',
  },
];

const PRICING = [
  {
    name: 'Recruit',
    price: 'Free',
    cadence: 'forever',
    blurb: 'Everything you need to start logging properly.',
    features: [
      'Unlimited workout & meal logs',
      'Macro + water targets',
      'Full analytics dashboard',
      '3 AI coach sessions / day',
      'Community feed access',
    ],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Operator',
    price: '$9',
    cadence: '/month',
    blurb: 'For lifters running a real periodised block.',
    features: [
      'Everything in Recruit',
      'Unlimited AI coach reasoning',
      'Predictive bodyweight forecasting',
      'Progress photo timeline',
      'Weekly challenge rewards',
      'Priority Supabase sync',
    ],
    cta: 'Go Operator',
    highlight: true,
  },
  {
    name: 'Syndicate',
    price: '$29',
    cadence: '/month',
    blurb: 'Coaches and small teams running multiple athletes.',
    features: [
      'Everything in Operator',
      'Up to 5 athlete profiles',
      'Coach dashboard & exports',
      'Custom exercise library',
      'Direct support channel',
    ],
    cta: 'Contact us',
    highlight: false,
  },
];

const FAQ = [
  {
    q: 'Is my training data actually stored in the cloud?',
    a: 'Yes. Authentication, profiles and every log run through Supabase Postgres with row-level security enabled. Only your authenticated session can read or write your rows — the public feed is the single shared surface, and you can make your profile private at any time.',
  },
  {
    q: 'How does the AI coach differ from a chatbot?',
    a: 'It computes on your data before answering. It pulls weekly tonnage, personal records, 7-day calorie and protein averages, sleep and readiness, then produces a prescription. If your data changes, the answer changes.',
  },
  {
    q: 'Where do the calorie targets come from?',
    a: 'Mifflin–St Jeor BMR, multiplied by an activity factor derived from your experience level, then offset by your goal (deficit, surplus, or maintenance). Protein is set at 1.6–2.2 g/kg depending on goal, fats at ~25% of calories, carbs fill the remainder.',
  },
  {
    q: 'What is the readiness score?',
    a: 'A weighted blend: sleep duration up to 35 points, 3-day training load up to 25, hydration to target up to 20, and 7-day protein adherence up to 20. Below 60 it prescribes a deload; above 85 it flags a PR window.',
  },
  {
    q: 'Can I use it on my phone at the gym?',
    a: 'The entire interface is mobile-first. The rest timer keeps running while you log sets, and every write is optimistic so logging never blocks on the network.',
  },
];

export const LandingPage: React.FC<Props> = ({ onGetStarted, onSignIn }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setActiveFeature((f) => (f + 1) % 3), 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05050f] text-slate-200">
      {/* Ambient lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-[0.35]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-cyan-500/[0.11] blur-[140px]" />
        <div className="absolute left-0 top-[45%] h-[420px] w-[420px] rounded-full bg-violet-600/[0.1] blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-fuchsia-600/[0.08] blur-[130px]" />
      </div>

      {/* ============================ Navbar ============================ */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b transition-all duration-300',
          scrolled ? 'border-white/[0.07] bg-[#05050f]/85 backdrop-blur-xl' : 'border-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-black tracking-tight text-white">
              CYBER<span className="text-cyan-400">NET</span>.FIT
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" size="sm" onClick={onSignIn}>
              Sign in
            </Button>
            <Button size="sm" onClick={onGetStarted} icon={<ArrowRight className="h-3 w-3" />}>
              Launch app
            </Button>
          </div>

          <button
            className="rounded-lg p-2 text-slate-400 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/[0.07] bg-[#05050f]/95 px-5 py-4 backdrop-blur-xl md:hidden">
            <nav className="mb-3 flex flex-col gap-1">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05]"
                >
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={onSignIn}>
                Sign in
              </Button>
              <Button size="sm" className="flex-1" onClick={onGetStarted}>
                Launch
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ============================== Hero ============================== */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.07] px-3 py-1.5 anim-fade-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
              Cloud sync live · Supabase Postgres
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white anim-fade-up sm:text-6xl lg:text-7xl">
            Train like an
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
              engineered system
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-400 anim-fade-up sm:text-base">
            CyberNet.Fit turns your training, nutrition and recovery into live telemetry — then hands it to an AI coach
            that actually reads the numbers before it opens its mouth.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 anim-fade-up sm:flex-row">
            <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto" icon={<ArrowRight className="h-4 w-4" />}>
              Create your node
            </Button>
            <Button variant="secondary" size="lg" onClick={onSignIn} className="w-full sm:w-auto">
              I already have an account
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
            {['No credit card', 'Data stays yours (RLS)', 'Works offline-first'].map((x) => (
              <span key={x} className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-500" strokeWidth={3} /> {x}
              </span>
            ))}
          </div>
        </div>

        {/* ---------------------- Product mockup ---------------------- */}
        <div className="relative mx-auto mt-14 max-w-5xl anim-fade-up">
          <div className="absolute -inset-x-8 -top-4 bottom-0 -z-10 rounded-[32px] bg-gradient-to-b from-cyan-500/10 via-transparent to-violet-600/10 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#08080f]/90 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-2 font-mono text-[10px] text-slate-600">cybernet.fit/dashboard</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-slate-600">
                <span className="hidden sm:inline">readiness</span>
                <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">
                  87 · primed
                </span>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-3">
              <div className="space-y-3">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Calories in</p>
                  <p className="mt-1 text-xl font-black tabular-nums text-white">2,140</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-500">of 2,900 kcal target</p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Volume this week</p>
                  <p className="mt-1 text-xl font-black tabular-nums text-white">
                    18,420<span className="ml-1 text-[10px] text-slate-500">kg</span>
                  </p>
                  <div className="mt-2 flex items-end gap-1">
                    {[35, 52, 28, 66, 44, 78, 61].map((v, i) => (
                      <div
                        key={i}
                        className={cn('flex-1 rounded-t', i === 5 ? 'bg-cyan-400' : 'bg-cyan-400/25')}
                        style={{ height: `${v * 0.36}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <div className="flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-violet-400" />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-violet-400">cybercoach</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg rounded-tl-sm bg-white/[0.05] px-2.5 py-2 text-[10px] leading-relaxed text-slate-300">
                    Your bench est. 1RM is 106 kg and weekly tonnage is up 12%. Add a top single at 92% and pull 200 kcal
                    from carbs — that is the surplus you are not using.
                  </div>
                  <div className="rounded-lg rounded-tr-sm bg-cyan-500/[0.12] px-2.5 py-2 text-[10px] text-cyan-100">
                    Should I deload?
                  </div>
                  <div className="rounded-lg rounded-tl-sm bg-white/[0.05] px-2.5 py-2 text-[10px] leading-relaxed text-slate-300">
                    No. Readiness 87/100 — you have headroom. Deload when it holds under 60 for three days.
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Macro split</p>
                  <div className="mt-2 space-y-1.5">
                    {[
                      { l: 'Protein', v: 132, max: 165, c: 'bg-cyan-400' },
                      { l: 'Carbs', v: 214, max: 350, c: 'bg-amber-400' },
                      { l: 'Fats', v: 62, max: 90, c: 'bg-violet-400' },
                    ].map((m) => (
                      <div key={m.l}>
                        <div className="flex justify-between text-[9px] text-slate-500">
                          <span>{m.l}</span>
                          <span className="tabular-nums text-slate-400">
                            {m.v}/{m.max}g
                          </span>
                        </div>
                        <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
                          <div className={cn('h-full rounded-full', m.c)} style={{ width: `${(m.v / m.max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Streak</p>
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <p className="mt-1 text-xl font-black text-white">
                    14<span className="ml-1 text-[10px] font-medium text-slate-500">days</span>
                  </p>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-3 flex-1 rounded-sm bg-gradient-to-t from-amber-500/40 to-amber-400"
                        style={{ opacity: 0.4 + i * 0.045 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.05] sm:grid-cols-4">
          {[
            { v: '20', l: 'Achievements' },
            { v: '11', l: 'DB tables' },
            { v: '6', l: 'Splits' },
            { v: 'RLS', l: 'On every row' },
          ].map((s) => (
            <div key={s.l} className="bg-[#05050f] px-4 py-5 text-center">
              <p className="text-2xl font-black tabular-nums text-white">{s.v}</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================= Engine ============================= */}
      <section id="engine" className="border-t border-white/[0.06] px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400">
                The engine
              </p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                Most trackers record.
                <br />
                <span className="text-slate-500">This one reasons.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
                Every log you enter becomes an input to a live model. Tonnage, adherence, readiness and trend slope are
                recomputed continuously — then surfaced as a recommendation, not a graph you have to interpret alone.
              </p>

              <div className="mt-7 space-y-2">
                {[
                  {
                    t: 'Signal, not noise',
                    d: 'Linear regression on bodyweight, moving averages on intake, per-lift 1RM estimation.',
                    icon: <Activity className="h-4 w-4" />,
                  },
                  {
                    t: 'Prescriptive coaching',
                    d: 'Answers cite your actual numbers — tonnage, PRs, sleep, adherence gaps.',
                    icon: <BrainCircuit className="h-4 w-4" />,
                  },
                  {
                    t: 'Recovery-aware load',
                    d: 'Readiness gates the intensity. Push on green, deload on red, automatically flagged.',
                    icon: <HeartPulse className="h-4 w-4" />,
                  },
                ].map((x, i) => (
                  <button
                    key={x.t}
                    onMouseEnter={() => setActiveFeature(i)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all',
                      activeFeature === i
                        ? 'border-cyan-500/30 bg-cyan-500/[0.06]'
                        : 'border-white/[0.06] bg-white/[0.015] hover:border-white/10',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        activeFeature === i ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/[0.05] text-slate-500',
                      )}
                    >
                      {x.icon}
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold text-white">{x.t}</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">{x.d}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] shadow-[0_0_45px_-14px_rgba(56,189,248,0.35)]">
              <div className="border-b border-white/[0.07] px-5 py-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    readiness_model.ts
                  </span>
                </div>
              </div>
              <div className="space-y-3 p-5 font-mono text-[11px] leading-relaxed">
                <p className="text-slate-600">{'// weighted blend, recomputed on every log'}</p>
                <p>
                  <span className="text-violet-400">const</span> <span className="text-cyan-300">sleep</span>{' '}
                  <span className="text-slate-500">=</span> <span className="text-amber-300">clamp</span>
                  <span className="text-slate-400">(hours / 8, 0, 1) * 35;</span>
                </p>
                <p>
                  <span className="text-violet-400">const</span> <span className="text-cyan-300">load</span>{' '}
                  <span className="text-slate-500">=</span>{' '}
                  <span className="text-slate-400">25 - penalty(3d minutes);</span>
                </p>
                <p>
                  <span className="text-violet-400">const</span> <span className="text-cyan-300">water</span>{' '}
                  <span className="text-slate-500">=</span> <span className="text-slate-400">(ml / target) * 20;</span>
                </p>
                <p>
                  <span className="text-violet-400">const</span> <span className="text-cyan-300">protein</span>{' '}
                  <span className="text-slate-500">=</span> <span className="text-slate-400">(avg7 / target) * 20;</span>
                </p>
                <p className="pt-1 text-emerald-400">
                  return sleep + load + water + protein; <span className="text-slate-600">// 0–100</span>
                </p>
                <div className="mt-4 rounded-lg border border-white/[0.07] bg-black/40 p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500">today</span>
                    <span className="text-lg font-black text-white">
                      87<span className="text-[10px] text-slate-500">/100</span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
                  </div>
                  <p className="mt-2 text-[10px] text-emerald-400">PR window open — push heavy compounds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ Modules ============================ */}
      <section id="modules" className="border-t border-white/[0.06] bg-white/[0.012] px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400">
              Modules
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Ten surfaces, one telemetry core</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Each module reads and writes the same Supabase tables, so a meal you log at 1pm instantly changes your
              coach's advice at 6pm.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <div
                key={m.title}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04]',
                  m.hover,
                )}
              >
                <div
                  className={cn(
                    'mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08]',
                    m.bg,
                    m.accent,
                  )}
                >
                  {m.icon}
                </div>
                <h3 className="text-sm font-bold text-white">{m.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-400">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ Pricing ============================ */}
      <section id="pricing" className="border-t border-white/[0.06] px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400">
              Pricing
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Start free. Upgrade when it bites.
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              The free tier is genuinely usable. Paid tiers exist for people running real blocks and coaches running
              athletes.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-6 transition-all duration-300',
                  p.highlight
                    ? 'border-cyan-500/35 bg-gradient-to-b from-cyan-500/[0.09] to-transparent shadow-[0_0_60px_-20px_rgba(6,182,212,0.5)]'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15',
                )}
              >
                {p.highlight && (
                  <span className="absolute right-4 top-4 rounded-full border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-cyan-300">
                    popular
                  </span>
                )}
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{p.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight text-white">{p.price}</span>
                  <span className="text-xs text-slate-500">{p.cadence}</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">{p.blurb}</p>
                <div className="my-5 h-px bg-white/[0.07]" />
                <ul className="space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-300">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant={p.highlight ? 'primary' : 'secondary'} onClick={onGetStarted}>
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section id="faq" className="border-t border-white/[0.06] bg-white/[0.012] px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400">FAQ</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Questions, answered</h2>
          </div>
          <div className="mt-10 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]"
                >
                  <span className="text-[13px] font-semibold text-white">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300',
                      openFaq === i && 'rotate-180 text-cyan-400',
                    )}
                  />
                </button>
                {openFaq === i && (
                  <p className="anim-fade-in px-5 pb-4 text-[12px] leading-relaxed text-slate-400">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="px-5 py-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-br from-cyan-500/[0.1] via-violet-600/[0.08] to-transparent p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 dot-bg opacity-20" />
          <div className="relative">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/25">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
              Your first logged set is the
              <br className="hidden sm:block" /> only thing between you and the data
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-slate-400">
              Create an account, calibrate in 20 seconds, and start seeing readiness, tonnage and macro adherence on one
              screen.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={onGetStarted} icon={<ArrowRight className="h-4 w-4" />}>
                Create your node
              </Button>
              <Button variant="secondary" size="lg" onClick={onSignIn}>
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= Footer ============================= */}
      <footer className="border-t border-white/[0.06] px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-black tracking-tight text-white">
                  CYBER<span className="text-cyan-400">NET</span>.FIT
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">Neural fitness OS</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> RLS secured
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> PKCE auth
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Built on Supabase
              </span>
            </div>

            <p className="font-mono text-[10px] text-slate-600">© 2026 CyberNet.Fit Systems</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
