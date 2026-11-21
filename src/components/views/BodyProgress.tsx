import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge, Button, Card, EmptyState, Field, Input, Modal, SectionHeader, Stepper } from '../ui';
import { cn, fmtDate } from '../../lib/cn';
import { THEMES } from '../../theme';
import { round, todayISO } from '../../lib/fitness';
import { Camera, ImagePlus, Ruler, Scale, SlidersHorizontal, Trash2, Upload } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const BodyProgress: React.FC = () => {
  const { photos, daily, profile, addPhoto, removePhoto, logWeight, theme } = useApp();
  const t = THEMES[theme];

  const [open, setOpen] = useState(false);
  const [sliderPercent, setSliderPercent] = useState(50);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [weight, setWeight] = useState(profile.weight);
  const [chest, setChest] = useState(profile.height ? Math.round(profile.height * 0.58) : 100);
  const [waist, setWaist] = useState(80);
  const [biceps, setBiceps] = useState(38);
  const [thighs, setThighs] = useState(58);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const weightSeries = useMemo(
    () =>
      [...daily]
        .filter((d) => d.weight && d.weight > 0)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .slice(-30)
        .map((d) => ({ date: fmtDate(d.date), weight: d.weight as number })),
    [daily],
  );

  const measurements = useMemo(() => {
    const latest = photos[0];
    const prev = photos[1];
    return [
      { key: 'chest', label: 'Chest', value: latest?.chest, prev: prev?.chest, unit: 'cm' },
      { key: 'waist', label: 'Waist', value: latest?.waist, prev: prev?.waist, unit: 'cm' },
      { key: 'biceps', label: 'Biceps', value: latest?.biceps, prev: prev?.biceps, unit: 'cm' },
      { key: 'thighs', label: 'Thighs', value: latest?.thighs, prev: prev?.thighs, unit: 'cm' },
    ];
  }, [photos]);

  const active = photos[selectedIdx];

  const pickFile = (f: File | null) => {
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const submit = async () => {
    setBusy(true);
    await addPhoto(
      {
        date: todayISO(),
        weight,
        photoBefore: preview ?? active?.photoAfter ?? active?.photoBefore ?? '',
        photoAfter: preview ?? '',
        chest,
        waist,
        biceps,
        thighs,
        notes,
      },
      file,
    );
    setBusy(false);
    setOpen(false);
    setFile(null);
    setPreview(null);
    setNotes('');
  };

  const weightDelta = weightSeries.length >= 2 ? weightSeries[weightSeries.length - 1].weight - weightSeries[0].weight : null;

  return (
    <div className="space-y-5 pb-8">
      {/* Top row */}
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Weight chart */}
        <Card>
          <SectionHeader
            eyebrow="Scale telemetry"
            title="Bodyweight trajectory"
            action={
              weightDelta !== null ? (
                <Badge tone={weightDelta < 0 ? 'success' : 'warn'}>
                  {weightDelta > 0 ? '+' : ''}
                  {round(weightDelta, 1)} kg
                </Badge>
              ) : null
            }
          />
          {weightSeries.length < 2 ? (
            <EmptyState
              icon={<Scale className="h-7 w-7" />}
              title="Log your weight to start the curve"
              description="Two or more weigh-ins unlock the trendline and forecasting."
            />
          ) : (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightSeries} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    width={46}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0b0b16',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      fontSize: 11,
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10 }}
                  />
                  <Line type="monotone" dataKey="weight" stroke={t.hex} strokeWidth={2} dot={{ r: 2.5, fill: t.hex }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">current</p>
              <p className="text-lg font-black tabular-nums text-white">
                {profile.weight}
                <span className="ml-0.5 text-[10px] text-slate-600">kg</span>
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => logWeight(weight)} icon={<Scale className="h-3 w-3" />}>
              Log weight
            </Button>
          </div>
        </Card>

        {/* Measurements */}
        <Card>
          <SectionHeader eyebrow="Circumference" title="Measurements" />
          <div className="grid grid-cols-2 gap-2">
            {measurements.map((m) => {
              const delta = m.value != null && m.prev != null ? m.value - m.prev : null;
              return (
                <div key={m.key} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">{m.label}</p>
                  <p className="mt-1 text-base font-black tabular-nums leading-none text-white">
                    {m.value ?? '—'}
                    <span className="ml-0.5 text-[9px] font-medium text-slate-600">{m.unit}</span>
                  </p>
                  {delta !== null && (
                    <p className={cn('mt-1 font-mono text-[9px]', delta < 0 ? 'text-emerald-400' : 'text-amber-400')}>
                      {delta > 0 ? '+' : ''}
                      {round(delta, 1)} from last
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            className="mt-3 w-full"
            size="sm"
            onClick={() => setOpen(true)}
            icon={<Ruler className="h-3 w-3" />}
          >
            Add measurement
          </Button>
        </Card>
      </div>

      {/* Comparison slider */}
      <Card>
        <SectionHeader
          eyebrow="Visual timeline"
          title="Progress comparison"
          subtitle="Drag to compare your baseline against the latest capture"
          action={
            <Button size="sm" onClick={() => setOpen(true)} icon={<Camera className="h-3 w-3" />}>
              Capture
            </Button>
          }
        />

        {photos.length === 0 ? (
          <EmptyState
            icon={<Camera className="h-8 w-8" />}
            title="No progress photos yet"
            description="Upload a baseline photo. It stores in Supabase Storage under your user folder, publicly readable but only writable by you."
            action={
              <Button size="sm" onClick={() => setOpen(true)} icon={<ImagePlus className="h-3 w-3" />}>
                Upload baseline
              </Button>
            }
          />
        ) : (
          <>
            {photos.length > 1 && (
              <div className="mb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedIdx(i)}
                    className={cn(
                      'shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition',
                      selectedIdx === i
                        ? cn(t.border, t.bgSoft, t.text)
                        : 'border-white/[0.08] text-slate-500 hover:text-white',
                    )}
                  >
                    {fmtDate(p.date)}
                  </button>
                ))}
              </div>
            )}

            <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-xl border border-white/[0.08] bg-black/40">
              {active?.photoBefore || active?.photoAfter ? (
                <>
                  <img
                    src={active.photoBefore || active.photoAfter}
                    alt="Before"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPercent}%` }}>
                    <img
                      src={active.photoAfter || active.photoBefore}
                      alt="After"
                      className="h-full w-full object-cover"
                      style={{ width: `${(100 / Math.max(sliderPercent, 1)) * 100}%`, maxWidth: 'none' }}
                    />
                  </div>
                  <div
                    className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                    style={{ left: `${sliderPercent}%` }}
                  >
                    <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/70">
                      <SlidersHorizontal className="h-3 w-3 text-white" />
                    </span>
                  </div>
                  <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-300">
                    before
                  </span>
                  <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-300">
                    after
                  </span>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
                  <Camera className="h-8 w-8" />
                  <p className="text-[11px]">No images on this entry</p>
                </div>
              )}
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={sliderPercent}
              onChange={(e) => setSliderPercent(Number(e.target.value))}
              className="mx-auto mt-3 w-full max-w-xl"
              aria-label="Comparison slider"
            />

            <div className="mx-auto mt-3 flex max-w-xl items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">captured</p>
                <p className="text-[11px] font-medium text-slate-200">{fmtDate(active.date)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[8px] uppercase tracking-wider text-slate-600">weight</p>
                <p className="text-[11px] font-bold text-white">{active.weight} kg</p>
              </div>
              <button
                onClick={() => removePhoto(active.id)}
                className="rounded p-1.5 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label="Delete entry"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {active.notes && <p className="mx-auto mt-2 max-w-xl text-[11px] italic text-slate-500">"{active.notes}"</p>}
          </>
        )}
      </Card>

      {/* Upload modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New progress capture"
        description="Stored in Supabase Storage · only you can upload to your folder"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy}>
              Save capture
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-7 transition hover:border-white/30 hover:bg-white/[0.04]"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="h-32 w-full rounded-lg object-cover" />
            ) : (
              <>
                <Upload className={cn('h-6 w-6', t.text)} />
                <span className="text-[11px] font-medium text-slate-300">Tap to select a photo</span>
                <span className="font-mono text-[9px] text-slate-600">PNG · JPG · WEBP — max 10MB</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Weight" hint="kg">
              <Stepper value={weight} onChange={setWeight} min={35} max={220} step={0.5} />
            </Field>
            <Field label="Waist" hint="cm">
              <Stepper value={waist} onChange={setWaist} min={50} max={160} />
            </Field>
            <Field label="Chest" hint="cm">
              <Stepper value={chest} onChange={setChest} min={60} max={160} />
            </Field>
            <Field label="Biceps" hint="cm">
              <Stepper value={biceps} onChange={setBiceps} min={20} max={70} />
            </Field>
            <Field label="Thighs" hint="cm">
              <Stepper value={thighs} onChange={setThighs} min={35} max={100} />
            </Field>
          </div>

          <Field label="Notes" hint="optional">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Felt leaner, sleep was solid…" />
          </Field>
        </div>
      </Modal>
    </div>
  );
};
