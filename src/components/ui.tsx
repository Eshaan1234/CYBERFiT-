import React from 'react';
import { cn, fmtNum } from '../lib/cn';
import { THEMES } from '../theme';
import type { ThemeKey } from '../lib/types';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

/* ================================ Card ================================ */

export const Card: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    glow?: boolean;
    hover?: boolean;
    padded?: boolean;
  }
> = ({ className, children, glow, hover, padded = true, ...rest }) => (
  <div
    {...rest}
    className={cn(
      'relative rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl',
      'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_18px_40px_-24px_rgba(0,0,0,0.9)]',
      padded && 'p-5',
      hover &&
        'transition-all duration-300 hover:border-white/15 hover:bg-white/[0.045] hover:-translate-y-0.5',
      glow && 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_0_45px_-14px_rgba(56,189,248,0.35)]',
      className,
    )}
  >
    {children}
  </div>
);

/* ============================== Section ============================== */

export const SectionHeader: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, action }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      {eyebrow && (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
      )}
      <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
      {subtitle && <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* =============================== Button =============================== */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    theme?: ThemeKey;
    loading?: boolean;
    icon?: React.ReactNode;
  }
> = ({ className, children, variant = 'primary', size = 'md', theme = 'cyan', loading, icon, disabled, ...rest }) => {
  const t = THEMES[theme];
  const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-[11px] gap-1.5 rounded-lg',
    md: 'h-10 px-4 text-xs gap-2 rounded-xl',
    lg: 'h-12 px-6 text-sm gap-2.5 rounded-xl',
  };
  const variants: Record<ButtonVariant, string> = {
    primary: cn(
      'bg-gradient-to-r text-white font-semibold border border-white/10',
      t.gradient,
      'hover:brightness-110 active:brightness-95',
      t.key === 'cyan' && 'shadow-[0_8px_30px_-10px_rgba(6,182,212,0.6)]',
    ),
    secondary: 'bg-white/[0.06] text-slate-100 border border-white/10 hover:bg-white/[0.1] font-medium',
    outline: cn('bg-transparent border font-medium', t.border, t.text, 'hover:bg-white/[0.05]'),
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.06] font-medium',
    danger: 'bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/20 font-medium',
  };
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold uppercase tracking-wider transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05050f]',
        t.ring.replace('ring-', 'focus-visible:ring-'),
        'disabled:cursor-not-allowed disabled:opacity-45',
        sizes[size],
        variants[variant],
        className,
      )}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};

/* ================================= Badge ================================ */

export const Badge: React.FC<{
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warn' | 'danger' | 'accent';
  theme?: ThemeKey;
  className?: string;
  icon?: React.ReactNode;
}> = ({ children, tone = 'neutral', theme = 'cyan', className, icon }) => {
  const t = THEMES[theme];
  const tones = {
    neutral: 'border-white/10 bg-white/[0.05] text-slate-300',
    success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    warn: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    danger: 'border-red-500/25 bg-red-500/10 text-red-300',
    accent: cn(t.border, t.bgSoft, t.text),
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
};

/* ================================= Input ================================ */

export const Field: React.FC<{
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, hint, error, children, className }) => (
  <label className={cn('block', className)}>
    {label && (
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        {hint && <span className="text-[10px] text-slate-600">{hint}</span>}
      </span>
    )}
    {children}
    {error && <span className="mt-1 block text-[11px] text-red-400">{error}</span>}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { theme?: ThemeKey }> = ({
  className,
  theme = 'cyan',
  ...rest
}) => {
  const t = THEMES[theme];
  return (
    <input
      {...rest}
      className={cn(
        'h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100 placeholder:text-slate-600',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
        t.ring.replace('ring-', 'focus:ring-'),
        'focus:border-white/20',
        className,
      )}
    />
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { theme?: ThemeKey }> = ({
  className,
  theme = 'cyan',
  ...rest
}) => {
  const t = THEMES[theme];
  return (
    <textarea
      {...rest}
      className={cn(
        'w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600',
        'transition-colors focus:outline-none focus:ring-2',
        t.ring.replace('ring-', 'focus:ring-'),
        'focus:border-white/20',
        className,
      )}
    />
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { theme?: ThemeKey }> = ({
  className,
  theme = 'cyan',
  children,
  ...rest
}) => {
  const t = THEMES[theme];
  return (
    <select
      {...rest}
      className={cn(
        'h-10 w-full appearance-none rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-slate-100',
        'transition-colors focus:outline-none focus:ring-2',
        t.ring.replace('ring-', 'focus:ring-'),
        className,
      )}
    >
      {children}
    </select>
  );
};

/* ================================= Modal ================================ */

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}> = ({ open, onClose, title, description, children, footer, width = 'max-w-lg' }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_.2s_ease-out]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full overflow-hidden rounded-t-3xl border border-white/10 bg-[#0a0a16] shadow-2xl',
          'animate-[slideUp_.25s_cubic-bezier(0.16,1,0.3,1)] sm:rounded-2xl',
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
          <div>
            {title && <h3 className="text-base font-bold text-white">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-white/[0.07] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
};

/* =============================== Progress =============================== */

export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  theme?: ThemeKey;
  className?: string;
  height?: string;
  showOverflow?: boolean;
}> = ({ value, max = 100, theme = 'cyan', className, height = 'h-2', showOverflow = true }) => {
  const t = THEMES[theme];
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
  const over = showOverflow && value > max;
  return (
    <div className={cn('relative w-full overflow-hidden rounded-full bg-white/[0.07]', height, className)}>
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out', over ? 'from-red-500 to-orange-500' : t.gradient)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export const Ring: React.FC<{
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  theme?: ThemeKey;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
}> = ({ value, max = 100, size = 96, stroke = 8, theme = 'cyan', label, sublabel }) => {
  const t = THEMES[theme];
  const pct = max <= 0 ? 0 : Math.min(1, value / max);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = React.useId();
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={t.hex} />
            <stop offset="100%" stopColor={t.hex2} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {label}
        {sublabel}
      </div>
    </div>
  );
};

/* ================================ Stat ================================ */

export const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  unit?: string;
  delta?: number | null;
  icon?: React.ReactNode;
  theme?: ThemeKey;
  hint?: string;
}> = ({ label, value, unit, delta, icon, theme = 'cyan', hint }) => {
  const t = THEMES[theme];
  return (
    <Card hover className="group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black tabular-nums tracking-tight text-white">{value}</span>
            {unit && <span className="text-[11px] font-medium text-slate-500">{unit}</span>}
          </p>
          {hint && <p className="mt-1 truncate text-[11px] text-slate-500">{hint}</p>}
          {delta !== null && delta !== undefined && <Delta value={delta} className="mt-2" />}
        </div>
        {icon && (
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', t.border, t.bgSoft, t.text)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export const Delta: React.FC<{ value: number; suffix?: string; invert?: boolean; className?: string }> = ({
  value,
  suffix = '%',
  invert,
  className,
}) => {
  const good = invert ? value < 0 : value > 0;
  const Icon = value === 0 ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums',
        value === 0 ? 'text-slate-500' : good ? 'text-emerald-400' : 'text-red-400',
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value) < 0.05 ? 'flat' : `${Math.abs(value).toFixed(1)}${suffix}`}
    </span>
  );
};

/* =============================== Tabs =============================== */

export const Segmented: React.FC<{
  options: { key: string; label: string }[];
  value: string;
  onChange: (k: string) => void;
  theme?: ThemeKey;
  className?: string;
  size?: 'sm' | 'md';
}> = ({ options, value, onChange, theme = 'cyan', className, size = 'md' }) => {
  const t = THEMES[theme];
  return (
    <div className={cn('inline-flex rounded-xl border border-white/10 bg-black/30 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            'rounded-lg font-semibold uppercase tracking-wider transition-all',
            size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]',
            value === o.key ? cn('bg-white/[0.1] text-white', t.text) : 'text-slate-500 hover:text-slate-300',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

/* ============================== Skeleton ============================== */

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded-lg bg-white/[0.06]', className)} />
);

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
    {icon && <div className="text-slate-600">{icon}</div>}
    <div>
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);

/* ============================ Number field ============================ */

export const Stepper: React.FC<{
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  theme?: ThemeKey;
}> = ({ value, onChange, step = 1, min = 0, max = 9999, suffix, theme = 'cyan' }) => {
  const t = THEMES[theme];
  return (
    <div className="flex h-10 items-center overflow-hidden rounded-xl border border-white/10 bg-black/30">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="h-full w-9 shrink-0 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
        aria-label="Decrease"
      >
        −
      </button>
      <div className="flex flex-1 items-baseline justify-center gap-1 tabular-nums">
        <span className="text-sm font-semibold text-white">{value}</span>
        {suffix && <span className="text-[10px] text-slate-500">{suffix}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className={cn('h-full w-9 shrink-0 transition hover:bg-white/[0.06]', t.text)}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
};

export const KeyValue: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] py-2 last:border-0">
    <div>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      {hint && <p className="text-[10px] text-slate-600">{hint}</p>}
    </div>
    <p className="text-sm font-semibold tabular-nums text-white">{value}</p>
  </div>
);

export { fmtNum };
