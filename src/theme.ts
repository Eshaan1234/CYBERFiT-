import type { ThemeKey } from './lib/types';

export interface ThemeTokens {
  key: ThemeKey;
  label: string;
  text: string;
  textSoft: string;
  bg: string;
  bgSoft: string;
  border: string;
  ring: string;
  gradient: string;
  gradientSoft: string;
  glow: string;
  hex: string;
  hex2: string;
}

export const THEMES: Record<ThemeKey, ThemeTokens> = {
  cyan: {
    key: 'cyan',
    label: 'Cyan Core',
    text: 'text-cyan-400',
    textSoft: 'text-cyan-300',
    bg: 'bg-cyan-500',
    bgSoft: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    ring: 'ring-cyan-500/40',
    gradient: 'from-cyan-400 via-sky-500 to-blue-600',
    gradientSoft: 'from-cyan-500/20 to-blue-600/5',
    glow: 'shadow-[0_0_35px_-8px_rgba(6,182,212,0.55)]',
    hex: '#22d3ee',
    hex2: '#3b82f6',
  },
  purple: {
    key: 'purple',
    label: 'Violet Matrix',
    text: 'text-violet-400',
    textSoft: 'text-violet-300',
    bg: 'bg-violet-500',
    bgSoft: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    ring: 'ring-violet-500/40',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
    gradientSoft: 'from-violet-500/20 to-fuchsia-600/5',
    glow: 'shadow-[0_0_35px_-8px_rgba(139,92,246,0.55)]',
    hex: '#a78bfa',
    hex2: '#d946ef',
  },
  pink: {
    key: 'pink',
    label: 'Neon Rose',
    text: 'text-pink-400',
    textSoft: 'text-pink-300',
    bg: 'bg-pink-500',
    bgSoft: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    ring: 'ring-pink-500/40',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    gradientSoft: 'from-pink-500/20 to-rose-600/5',
    glow: 'shadow-[0_0_35px_-8px_rgba(236,72,153,0.55)]',
    hex: '#f472b6',
    hex2: '#e11d48',
  },
  emerald: {
    key: 'emerald',
    label: 'Toxic Lime',
    text: 'text-emerald-400',
    textSoft: 'text-emerald-300',
    bg: 'bg-emerald-500',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/40',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    gradientSoft: 'from-emerald-500/20 to-teal-600/5',
    glow: 'shadow-[0_0_35px_-8px_rgba(16,185,129,0.55)]',
    hex: '#34d399',
    hex2: '#0891b2',
  },
  amber: {
    key: 'amber',
    label: 'Solar Flare',
    text: 'text-amber-400',
    textSoft: 'text-amber-300',
    bg: 'bg-amber-500',
    bgSoft: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    ring: 'ring-amber-500/40',
    gradient: 'from-amber-400 via-orange-500 to-rose-600',
    gradientSoft: 'from-amber-500/20 to-orange-600/5',
    glow: 'shadow-[0_0_35px_-8px_rgba(245,158,11,0.55)]',
    hex: '#fbbf24',
    hex2: '#ea580c',
  },
};

export const THEME_LIST = Object.values(THEMES);
