import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Field, Input } from './ui';
import { cn } from '../lib/cn';
import { supabaseUrl } from '../lib/supabase';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';

const mapAuthError = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (m.includes('email not confirmed')) return 'Confirm your email first — check your inbox.';
  if (m.includes('user already registered')) return 'That email already has an account. Try signing in.';
  if (m.includes('password should be at least')) return 'Password must be at least 6 characters.';
  if (m.includes('unable to validate email')) return 'That email address looks invalid.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a minute and retry.';
  if (m.includes('fetch')) return 'Network unreachable. Check your connection.';
  return message;
};

const strengthOf = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
};

const GitBranchGlyph: React.FC = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.1c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .3.21.67.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
  </svg>
);

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, signInWithOAuth, resetPassword, configured } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'forgot') {
      if (!email) return setError('Enter your account email.');
      setBusy('form');
      try {
        await resetPassword(email);
        setNotice('Reset link dispatched. Check your inbox (and spam).');
        setMode('signin');
      } catch (err) {
        setError(mapAuthError(err instanceof Error ? err.message : 'Reset failed'));
      } finally {
        setBusy(null);
      }
      return;
    }

    if (!email.trim()) return setError('Email is required.');
    if (mode === 'signup' && name.trim().length < 2) return setError('Tell us your name (2+ characters).');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setBusy('form');
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        const { needsConfirm } = await signUp(email.trim(), password, name.trim());
        if (needsConfirm) {
          setNotice('Account created. Confirm your email to activate the portal.');
          setMode('signin');
        }
      }
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? err.message : 'Authentication failed'));
    } finally {
      setBusy(null);
    }
  };

  const oauth = async (provider: 'google' | 'github') => {
    setError(null);
    setBusy(provider);
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? err.message : `${provider} sign-in unavailable`));
      setBusy(null);
    }
  };

  const strength = strengthOf(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Elite'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-emerald-400', 'bg-cyan-400'];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05050f] px-4 py-10">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.55]" />
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[130px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a16]/80 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl lg:grid-cols-[1fr_1.05fr]">
        {/* ------------------------- Brand panel ------------------------- */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-cyan-500/[0.12] via-violet-600/[0.1] to-transparent p-9 lg:flex">
          <div className="absolute inset-0 dot-bg opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/25">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-base font-black tracking-tight text-white">
                  CYBER<span className="text-cyan-400">NET</span>.FIT
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">Neural Fitness OS</p>
              </div>
            </div>

            <h1 className="mt-12 text-3xl font-black leading-tight tracking-tight text-white">
              Your biology,
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                finally measured.
              </span>
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Training telemetry, macro synthesis, readiness modelling and an AI coach that reads your actual data —
              all synced to the cloud.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Cloud-synced logs across every device',
                'Readiness score from sleep, load & hydration',
                'PR tracking with estimated 1RM curves',
                'AI coach grounded in your real telemetry',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-slate-300">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-400">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-10 rounded-xl border border-white/[0.07] bg-black/30 p-3">
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span>SUPABASE CLUSTER</span>
              <span className="text-slate-700">•</span>
              <span className="truncate">{supabaseUrl.replace('https://', '')}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-slate-600">
              <ShieldCheck className="h-3 w-3 text-emerald-500/70" />
              ROW LEVEL SECURITY · PKCE AUTH · ENCRYPTED AT REST
            </div>
          </div>
        </div>

        {/* --------------------------- Form panel --------------------------- */}
        <div className="p-6 sm:p-9">
          <div className="mb-7 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-black tracking-tight text-white">
              CYBER<span className="text-cyan-400">NET</span>.FIT
            </p>
          </div>

          {mode === 'forgot' && (
            <button
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 transition hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" /> Back to sign in
            </button>
          )}

          <h2 className="text-2xl font-black tracking-tight text-white">
            {mode === 'signin' ? 'Access your portal' : mode === 'signup' ? 'Initialise your node' : 'Recover access'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-400">
            {mode === 'signin'
              ? 'Sign in to sync your training telemetry.'
              : mode === 'signup'
                ? 'Create an account and calibrate your biometrics.'
                : 'We will email you a secure reset link.'}
          </p>

          {!configured && (
            <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2.5 text-[11px] leading-relaxed text-amber-200">
              Supabase environment variables are missing. Add <code className="font-mono text-amber-100">VITE_SUPABASE_URL</code> and{' '}
              <code className="font-mono text-amber-100">VITE_SUPABASE_ANON_KEY</code> to enable authentication.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-3 py-2.5 text-[12px] text-red-200 anim-fade-in"
            >
              {error}
            </div>
          )}
          {notice && (
            <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2.5 text-[12px] text-emerald-200 anim-fade-in">
              {notice}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-3.5">
            {mode === 'signup' && (
              <Field label="Agent name">
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    autoComplete="name"
                    className="pl-9"
                    required
                  />
                </div>
              </Field>
            )}

            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  autoComplete="email"
                  className="pl-9"
                  required
                />
              </div>
            </Field>

            {mode !== 'forgot' && (
              <Field
                label="Password"
                hint={
                  mode === 'signin' ? undefined : password ? strengthLabels[strength] : 'min 6 characters'
                }
              >
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:text-white"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {mode === 'signup' && password && (
                  <div className="mt-1.5 flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          i < strength ? strengthColors[strength] : 'bg-white/10',
                        )}
                      />
                    ))}
                  </div>
                )}
              </Field>
            )}

            {mode === 'signin' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setNotice(null);
                  }}
                  className="text-[11px] font-medium text-slate-500 transition hover:text-cyan-400"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={busy === 'form'}
              disabled={Boolean(busy) || !configured}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create node' : 'Send reset link'}
            </Button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">or continue with</span>
                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => oauth('google')}
                  disabled={Boolean(busy) || !configured}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-45"
                >
                  {busy === 'google' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GoogleGlyph />}
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => oauth('github')}
                  disabled={Boolean(busy) || !configured}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-45"
                >
                  {busy === 'github' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitBranchGlyph />}
                  GitHub
                </button>
              </div>
            </>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            {mode === 'signin' ? "Don't have a node yet?" : 'Already operating a node?'}{' '}
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setNotice(null);
              }}
              className="font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          <div className="mt-6 flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-700">
            <Sparkles className="h-2.5 w-2.5" /> AES-256 · PKCE · RLS enforced at the database
          </div>
        </div>
      </div>
    </div>
  );
};

const GoogleGlyph: React.FC = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.73-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
    />
    <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z" />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
    />
  </svg>
);
