import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Card, EmptyState, SectionHeader, Textarea } from '../ui';
import { cn, fmtRelative } from '../../lib/cn';
import { THEMES } from '../../theme';
import { rankTitle } from '../../lib/fitness';
import {
  Dumbbell,
  Flame,
  Heart,
  MessageSquare,
  Radio,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';

const KINDS = [
  { key: 'update', label: 'Update', icon: <MessageSquare className="h-3 w-3" /> },
  { key: 'workout', label: 'Session', icon: <Dumbbell className="h-3 w-3" /> },
  { key: 'pr', label: 'PR', icon: <Trophy className="h-3 w-3" /> },
  { key: 'milestone', label: 'Milestone', icon: <Flame className="h-3 w-3" /> },
] as const;

export const Community: React.FC = () => {
  const {
    community,
    postToCommunity,
    likePost,
    removePost,
    refreshCommunity,
    profile,
    leaderboard,
    theme,
    playSound,
  } = useApp();
  const t = THEMES[theme];
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<(typeof KINDS)[number]['key']>('update');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshCommunity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    await postToCommunity(body.trim(), kind);
    setBody('');
    setBusy(false);
    playSound('success');
  };

  return (
    <div className="grid gap-4 pb-8 xl:grid-cols-[1fr_300px]">
      {/* Feed */}
      <div className="space-y-4">
        {/* Composer */}
        <Card glow>
          <div className="flex items-start gap-3">
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-black text-white', t.gradient)}>
              {profile.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <form onSubmit={submit} className="flex-1">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Broadcast a signal — session recap, PR, struggle, question…"
                rows={3}
                theme={theme}
                maxLength={500}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1">
                  {KINDS.map((k) => (
                    <button
                      key={k.key}
                      type="button"
                      onClick={() => setKind(k.key)}
                      className={cn(
                        'flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition',
                        kind === k.key
                          ? cn(t.border, t.bgSoft, t.text)
                          : 'border-white/[0.08] text-slate-500 hover:text-white',
                      )}
                    >
                      {k.icon}
                      {k.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-slate-600">{body.length}/500 · +60 XP</span>
                  <Button type="submit" size="sm" disabled={!body.trim()} loading={busy} icon={<Send className="h-3 w-3" />}>
                    Post
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Card>

        {/* Posts */}
        {community.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Radio className="h-8 w-8" />}
              title="The grid is quiet"
              description="Be the first to broadcast. Posts are public to authenticated agents and stored in Supabase."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {community.map((post) => (
              <Card key={post.id} hover className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white',
                      post.mine ? cn('bg-gradient-to-br', t.gradient) : 'bg-slate-700',
                    )}
                  >
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[12.5px] font-bold text-white">{post.authorName}</span>
                      <span className={cn('font-mono text-[9px] uppercase tracking-wider', t.text)}>
                        Lv {post.authorLevel}
                      </span>
                      <span className="font-mono text-[9px] text-slate-600">· {fmtRelative(post.createdAt)}</span>
                    </div>

                    <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-slate-300">{post.body}</p>

                    <div className="mt-2.5 flex items-center gap-3">
                      <button
                        onClick={() => likePost(post)}
                        className={cn(
                          'flex items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-medium transition',
                          post.likedByMe
                            ? 'bg-pink-500/10 text-pink-400'
                            : 'text-slate-500 hover:bg-white/[0.05] hover:text-pink-400',
                        )}
                      >
                        <Heart className={cn('h-3.5 w-3.5', post.likedByMe && 'fill-pink-400')} />
                        {post.likeCount}
                      </button>
                      <Badge tone="neutral">{post.kind}</Badge>
                      {post.mine && (
                        <button
                          onClick={() => removePost(post.id)}
                          className="ml-auto rounded p-1 text-slate-700 transition hover:text-red-400"
                          aria-label="Delete post"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-3">
        <Card>
          <SectionHeader
            eyebrow="Leaderboard"
            title="Top agents"
            action={
              <button
                onClick={() => void refreshCommunity()}
                className="rounded p-1 text-slate-500 transition hover:text-white"
                aria-label="Refresh"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            }
          />
          {leaderboard.length === 0 ? (
            <p className="py-4 text-center text-[10.5px] text-slate-600">No public profiles yet</p>
          ) : (
            <div className="space-y-1">
              {leaderboard.slice(0, 8).map((u, i) => (
                <div
                  key={u.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5',
                    u.id === profile.id ? cn(t.bgSoft, 'ring-1', t.ring) : 'bg-white/[0.02]',
                  )}
                >
                  <span
                    className={cn(
                      'w-4 shrink-0 text-center font-mono text-[9px] font-bold',
                      i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-600',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white">
                    {u.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold text-slate-200">
                      {u.name}
                      {u.id === profile.id && <span className="ml-1 text-slate-500">(you)</span>}
                    </p>
                    <p className="font-mono text-[8.5px] text-slate-600">Lv {u.level} · {rankTitle(u.level)}</p>
                  </div>
                  <span className="font-mono text-[9px] tabular-nums text-slate-500">{u.xp}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader eyebrow="Grid" title="How it works" />
          <ul className="space-y-2 text-[10.5px] leading-relaxed text-slate-400">
            {[
              'Every post is a Supabase row visible to authenticated agents only.',
              'Likes are stored as unique (post, user) pairs — one per agent.',
              'Your profile appears on the leaderboard only while public.',
              'Posting awards 60 XP; earning 5 likes unlocks a badge.',
            ].map((x) => (
              <li key={x} className="flex gap-2">
                <Sparkles className={cn('mt-0.5 h-2.5 w-2.5 shrink-0', t.text)} />
                {x}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2.5">
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', t.bgSoft, t.text)}>
              <Users className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[12px] font-bold text-white">{leaderboard.length} agents</p>
              <p className="font-mono text-[9px] text-slate-600">synced from profiles view</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
