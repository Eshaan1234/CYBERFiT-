import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Card, Input, SectionHeader } from '../ui';
import { cn, fmtRelative } from '../../lib/cn';
import { THEMES } from '../../theme';
import { COACH_GREETING, COACH_SUGGESTIONS } from '../../lib/coach';
import { rankTitle } from '../../lib/fitness';
import {
  Bot,
  BrainCircuit,
  Eraser,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';

/** Minimal inline markdown renderer: **bold** and bullet lists. */
const renderRich = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const isBullet = /^[•\-\d]/.test(line.trim()) && /^[•\-]|^\d+\./.test(line.trim());
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
      seg.startsWith('**') && seg.endsWith('**') ? <strong key={j}>{seg.slice(2, -2)}</strong> : <span key={j}>{seg}</span>,
    );
    return isBullet ? (
      <div key={i} className="flex gap-1.5 pl-0.5">
        <span className="text-slate-600">·</span>
        <span>{parts}</span>
      </div>
    ) : (
      <p key={i}>{parts}</p>
    );
  });
};

export const AICoach: React.FC = () => {
  const { chat, askCoach, clearChat, coachTyping, profile, readiness, workouts, theme } = useApp();
  const t = THEMES[theme];
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.length, coachTyping]);

  const send = async (value?: string) => {
    const payload = (value ?? text).trim();
    if (!payload || coachTyping) return;
    setText('');
    await askCoach(payload);
  };

  const greeting = COACH_GREETING(profile.name);
  const isEmpty = chat.length === 0;

  return (
    <div className="grid gap-4 pb-8 xl:grid-cols-[1fr_290px]">
      {/* ------------------------- Chat column ------------------------- */}
      <Card className="flex h-[calc(100dvh-8.5rem)] min-h-[520px] flex-col p-0" glow>
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.07] px-4 py-3">
          <div className="relative">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br', t.gradient)}>
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b0b16] bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-white">CyberCoach v3.0</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
              grounded in {workouts.length} sessions · readiness {readiness.score}/100
            </p>
          </div>
          <Badge tone="success" icon={<Sparkles className="h-2.5 w-2.5" />}>
            online
          </Badge>
          {chat.length > 0 && (
            <button
              onClick={() => void clearChat()}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
              title="Clear conversation"
            >
              <Eraser className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {isEmpty && (
            <div className="anim-fade-in">
              <div className="flex items-start gap-2.5">
                <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', t.bgSoft, t.text)}>
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/[0.035] px-3.5 py-2.5">
                  <div className="chat-md text-[12.5px] leading-relaxed text-slate-200">{renderRich(greeting)}</div>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 pl-9 font-mono text-[9px] uppercase tracking-wider text-slate-600">try asking</p>
                <div className="grid gap-1.5 pl-9 sm:grid-cols-2">
                  {COACH_SUGGESTIONS.map((s) => (
                    <button
                      key={s.prompt}
                      onClick={() => send(s.prompt)}
                      className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-left text-[11px] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {chat.map((m) => (
            <div
              key={m.id}
              className={cn('flex items-start gap-2.5 anim-fade-in', m.sender === 'user' && 'flex-row-reverse')}
            >
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  m.sender === 'ai' ? cn(t.bgSoft, t.text) : 'bg-white/[0.08] text-slate-300',
                )}
              >
                {m.sender === 'ai' ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              </div>
              <div className={cn('max-w-[85%] sm:max-w-[75%]', m.sender === 'user' && 'text-right')}>
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2.5',
                    m.sender === 'ai'
                      ? 'rounded-tl-sm border border-white/[0.07] bg-white/[0.035] text-slate-200'
                      : cn('rounded-tr-sm border text-white', t.border, t.bgSoft),
                  )}
                >
                  {m.sender === 'ai' ? (
                    <div className="chat-md text-[12.5px] leading-relaxed">{renderRich(m.text)}</div>
                  ) : (
                    <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed">{m.text}</p>
                  )}
                </div>
                <p className="mt-1 px-1 font-mono text-[8.5px] text-slate-600">{fmtRelative(m.timestamp)}</p>
              </div>
            </div>
          ))}

          {coachTyping && (
            <div className="flex items-start gap-2.5 anim-fade-in">
              <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', t.bgSoft, t.text)}>
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/[0.035] px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={cn('typing-dot h-1.5 w-1.5 rounded-full', t.bg)} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-white/[0.07] p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex gap-2"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about your training, macros, recovery…"
              theme={theme}
              className="flex-1"
              disabled={coachTyping}
            />
            <Button type="submit" disabled={!text.trim() || coachTyping} icon={<Send className="h-3.5 w-3.5" />}>
              Send
            </Button>
          </form>
          <p className="mt-1.5 px-1 font-mono text-[8.5px] uppercase tracking-wider text-slate-700">
            deterministic reasoning over your logs · no external model calls
          </p>
        </div>
      </Card>

      {/* -------------------------- Side panel ------------------------- */}
      <div className="space-y-3">
        <Card>
          <SectionHeader eyebrow="Context" title="What coach sees" />
          <div className="space-y-2">
            {[
              { icon: <Zap className="h-3 w-3" />, l: 'Rank', v: `Lv ${profile.level} · ${rankTitle(profile.level)}` },
              { icon: <TrendingUp className="h-3 w-3" />, l: 'Training', v: `${workouts.length} sessions logged` },
              { icon: <Target className="h-3 w-3" />, l: 'Goal', v: profile.goal.replace('_', ' ') },
              { icon: <BrainCircuit className="h-3 w-3" />, l: 'Readiness', v: `${readiness.score}/100 ${readiness.label}` },
            ].map((r) => (
              <div key={r.l} className="flex items-center gap-2 rounded-lg bg-white/[0.025] px-2.5 py-2">
                <span className={cn('shrink-0', t.text)}>{r.icon}</span>
                <span className="text-[10px] text-slate-500">{r.l}</span>
                <span className="ml-auto truncate text-[10.5px] font-medium capitalize text-slate-200">{r.v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Readiness" title="Factor breakdown" />
          <div className="space-y-2">
            {readiness.factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-500">{f.label}</span>
                  <span className="font-mono text-[9.5px] text-slate-400">{f.value}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className={cn('h-full rounded-full', f.impact >= 0 ? 'bg-emerald-400' : 'bg-red-400')}
                    style={{ width: `${Math.min(100, Math.abs(f.impact) * 2.6 + 20)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-white/[0.025] px-2.5 py-2 text-[10.5px] leading-relaxed text-slate-400">
            {readiness.recommendation}
          </p>
        </Card>

        <Card>
          <SectionHeader eyebrow="Prompts" title="Protocols" />
          <div className="space-y-1.5">
            {COACH_SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s.prompt}
                onClick={() => send(s.prompt)}
                className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] px-2.5 py-2 text-left text-[11px] text-slate-400 transition hover:border-white/20 hover:text-white"
              >
                {s.label}
                <Sparkles className="h-3 w-3 shrink-0 text-slate-600" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
