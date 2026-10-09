import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertTriangle, BedDouble, CalendarDays, Check, Moon, Pencil, Save, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useChildData } from '@/hooks/useChildData';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useToast } from '@/components/feedback/Toast';
import { formatDate, shiftKey, todayKey } from '@/lib/dates';
import { CONSULT_CRISES } from '@/lib/learning-metrics';
import { uid } from '@/lib/random';
import { cn } from '@/lib/cn';
import type { DailyObservation, Mood, SleepQuality } from '@/types';
import { Badge, Button, Card, DemoBadge, Dialog, Field, PageHeader, SectionHeader } from '@/components/ui';

export const MOODS: { v: Mood; emoji: string; bg: string; ring: string }[] = [
  { v: 1, emoji: '😣', bg: 'bg-coral-100', ring: 'ring-coral-500' },
  { v: 2, emoji: '😟', bg: 'bg-[#FFE8D6]', ring: 'ring-[#FF9F5A]' },
  { v: 3, emoji: '😐', bg: 'bg-sun-100', ring: 'ring-sun-500' },
  { v: 4, emoji: '🙂', bg: 'bg-turquoise-100', ring: 'ring-turquoise-500' },
  { v: 5, emoji: '😄', bg: 'bg-leaf-100', ring: 'ring-leaf-500' },
];
const SLEEP: { v: SleepQuality; icon: typeof Moon }[] = [
  { v: 'good', icon: Moon },
  { v: 'ok', icon: BedDouble },
  { v: 'poor', icon: Zap },
];

export default function ObservationsPage() {
  const { saveObservation, deleteObservation } = useStore();
  const { t, lang } = useLang();
  const reduce = useReduceMotion();
  const toast = useToast();
  const d = useChildData();
  const [params, setParams] = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  const blank = (date = todayKey()): DailyObservation => {
    const existing = d.observations.find((o) => o.date === date);
    return existing ? { ...existing } : { id: uid('obs'), childId: d.child.id, date, mood: 4, sleep: 'good', crisis: false, note: '', demo: false, updatedAt: '' };
  };
  const [form, setForm] = useState<DailyObservation>(() => blank());
  const [toDelete, setToDelete] = useState<DailyObservation | null>(null);
  const isEdit = d.observations.some((o) => o.id === form.id || o.date === form.date);

  useEffect(() => {
    setForm(blank());
  }, [d.child.id]);

  useEffect(() => {
    if (params.get('new') === '1') {
      formRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      formRef.current?.querySelector<HTMLButtonElement>('[data-mood]')?.focus();
      setParams({}, { replace: true });
    }
  }, [params, setParams, reduce]);

  const week = useMemo(() => {
    const start = shiftKey(todayKey(), -6);
    const list = d.observations.filter((o) => o.date >= start);
    const avg = list.length ? Math.round((list.reduce((a, o) => a + o.mood, 0) / list.length) * 10) / 10 : null;
    return {
      count: list.length,
      avgMood: avg,
      goodSleep: list.filter((o) => o.sleep === 'good').length,
      crises: list.filter((o) => o.crisis).length,
      days: Array.from({ length: 7 }, (_, i) => {
        const key = shiftKey(todayKey(), i - 6);
        return { key, obs: d.observations.find((o) => o.date === key) };
      }),
    };
  }, [d.observations]);

  const submit = () => {
    const existing = d.observations.find((o) => o.date === form.date && o.id !== form.id);
    saveObservation({ ...form, id: existing?.id ?? form.id, childId: d.child.id });
    toast({ title: isEdit ? t('toast.observationUpdated') : t('toast.observationSaved'), description: formatDate(form.date, lang, { day: 'numeric', month: 'long' }) });
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('observations.eyebrow')} title={t('observations.title')} subtitle={t('observations.subtitle', { name: d.child.name })} />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        {/* quick form */}
        <div ref={formRef} className="scroll-mt-24">
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-gradient-to-r from-turquoise-50 to-white px-6 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-ink">{isEdit ? t('observations.editTitle') : t('observations.newTitle')}</h2>
                <p className="text-sm text-muted">{t('observations.formHint')}</p>
              </div>
              <Field label={t('observations.date')} htmlFor="obs-date" className="w-44">
                <input
                  id="obs-date"
                  type="date"
                  className="input h-10 py-2"
                  value={form.date}
                  max={todayKey()}
                  onChange={(e) => e.target.value && setForm(blank(e.target.value))}
                />
              </Field>
            </div>
            <div className="space-y-6 p-6">
              <div>
                <p className="mb-2.5 text-[13px] font-bold text-ink">{t('observations.mood')}</p>
                <div role="radiogroup" aria-label={t('observations.mood')} className="grid grid-cols-5 gap-2">
                  {MOODS.map((m) => (
                    <motion.button
                      key={m.v}
                      type="button"
                      role="radio"
                      data-mood
                      aria-checked={form.mood === m.v}
                      aria-label={t(`observations.moods.${m.v}`)}
                      onClick={() => setForm({ ...form, mood: m.v })}
                      whileTap={reduce ? undefined : { scale: 0.92 }}
                      className={cn('flex flex-col items-center gap-1 rounded-2xl py-3 transition-all', m.bg, form.mood === m.v ? cn('ring-[3px]', m.ring, 'scale-[1.03]') : 'opacity-70 hover:opacity-100')}
                    >
                      <span className="text-3xl leading-none sm:text-4xl">{m.emoji}</span>
                      <span className="text-[11px] font-bold text-ink sm:text-xs">{t(`observations.moods.${m.v}`)}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-2.5 text-[13px] font-bold text-ink">{t('observations.sleep')}</p>
                  <div role="radiogroup" aria-label={t('observations.sleep')} className="grid grid-cols-3 gap-2">
                    {SLEEP.map((s) => (
                      <button
                        key={s.v}
                        type="button"
                        role="radio"
                        aria-checked={form.sleep === s.v}
                        onClick={() => setForm({ ...form, sleep: s.v })}
                        className={cn('flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 text-xs font-bold transition-all', form.sleep === s.v ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-line text-ink hover:border-violet-300')}
                      >
                        <s.icon className="size-5" />
                        {t(`observations.sleepLevels.${s.v}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2.5 text-[13px] font-bold text-ink">{t('observations.crisis')}</p>
                  <div role="radiogroup" aria-label={t('observations.crisis')} className="grid grid-cols-2 gap-2">
                    {[false, true].map((v) => (
                      <button
                        key={String(v)}
                        type="button"
                        role="radio"
                        aria-checked={form.crisis === v}
                        onClick={() => setForm({ ...form, crisis: v })}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 text-xs font-bold transition-all',
                          form.crisis === v ? (v ? 'border-coral-500 bg-coral-50 text-coral-700' : 'border-leaf-500 bg-leaf-50 text-leaf-700') : 'border-line text-ink',
                        )}
                      >
                        {v ? <AlertTriangle className="size-5" /> : <ShieldCheck className="size-5" />}
                        {v ? t('observations.crisisYes') : t('observations.crisisNo')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Field label={t('observations.note')} htmlFor="obs-note" hint={t('observations.noteHint')}>
                <textarea id="obs-note" rows={2} className="input resize-y" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t('observations.notePlaceholder')} />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-line bg-canvas/60 px-6 py-4">
              <p className="text-xs text-muted">{isEdit ? t('observations.replacing') : t('observations.oncePerDay')}</p>
              <Button onClick={submit} icon={<Save className="size-4" />}>
                {isEdit ? t('common.update') : t('common.save')}
              </Button>
            </div>
          </Card>
        </div>

        {/* summary */}
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <SectionHeader title={t('observations.weekTitle')} subtitle={t('observations.weekSubtitle')} className="mb-4" />
            <div className="flex justify-between gap-1.5">
              {week.days.map(({ key, obs }) => {
                const m = obs ? MOODS[obs.mood - 1] : null;
                return (
                  <div key={key} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className={cn('grid aspect-square w-full max-w-12 place-items-center rounded-2xl text-xl', m ? m.bg : 'bg-canvas ring-1 ring-dashed ring-line')} title={obs ? t(`observations.moods.${obs.mood}`) : t('observations.noEntry')}>
                      {m ? m.emoji : <span className="text-xs text-muted">—</span>}
                    </span>
                    {obs?.crisis ? <span className="size-2 rounded-full bg-coral-500" aria-label={t('observations.crisisYes')} /> : <span className="size-2" />}
                    <span className="text-[11px] font-bold text-muted">{formatDate(key, lang, { weekday: 'short' })}</span>
                  </div>
                );
              })}
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-canvas p-3">
                <dd className="text-xl font-extrabold text-ink">{week.avgMood ?? '—'}</dd>
                <dt className="text-[11px] font-semibold text-muted">{t('observations.avgMood')}</dt>
              </div>
              <div className="rounded-2xl bg-canvas p-3">
                <dd className="text-xl font-extrabold text-ink">
                  {week.goodSleep}/{week.count}
                </dd>
                <dt className="text-[11px] font-semibold text-muted">{t('observations.goodNights')}</dt>
              </div>
              <div className={cn('rounded-2xl p-3', week.crises >= CONSULT_CRISES ? 'bg-coral-50' : 'bg-canvas')}>
                <dd className={cn('text-xl font-extrabold', week.crises >= CONSULT_CRISES ? 'text-coral-600' : 'text-ink')}>{week.crises}</dd>
                <dt className="text-[11px] font-semibold text-muted">{t('observations.crises')}</dt>
              </div>
            </dl>
            <p className={cn('mt-4 rounded-2xl p-3 text-[13px] font-semibold', week.crises >= CONSULT_CRISES ? 'bg-sun-50 text-sun-700' : 'bg-leaf-50 text-leaf-700')}>
              {week.crises >= CONSULT_CRISES ? t('observations.crisisFlag', { count: week.crises }) : t('observations.crisisOk', { max: CONSULT_CRISES })}
            </p>
          </Card>
        </div>
      </div>

      {/* history */}
      <Card className="p-5 sm:p-6">
        <SectionHeader title={t('observations.history')} subtitle={t('observations.historySubtitle')} action={d.observations.some((o) => o.demo) ? <DemoBadge /> : undefined} className="mb-4" />
        {d.observations.length === 0 ? (
          <p className="rounded-2xl bg-canvas p-6 text-center text-sm text-muted">{t('observations.empty')}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {d.observations.map((o) => {
              const m = MOODS[o.mood - 1];
              return (
                <li key={o.id} className={cn('flex gap-4 rounded-2xl border p-4', form.id === o.id ? 'border-cobalt-300 bg-cobalt-50/50' : 'border-line')}>
                  <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl text-3xl', m.bg)}>{m.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                        <CalendarDays className="size-4 text-muted" />
                        {formatDate(o.date, lang, { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      {o.demo && <Badge tone="sun">{t('common.demo')}</Badge>}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge tone="gray">{t(`observations.moods.${o.mood}`)}</Badge>
                      <Badge tone="violet">
                        {t('observations.sleepShort')}: {t(`observations.sleepLevels.${o.sleep}`)}
                      </Badge>
                      {o.crisis ? <Badge tone="coral">{t('observations.crisisYes')}</Badge> : <Badge tone="leaf" icon={<Check className="size-3" />}>{t('observations.calmDay')}</Badge>}
                    </div>
                    {o.note && <p className="mt-2 text-sm text-muted">{o.note}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...o });
                        formRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
                      }}
                      className="grid size-9 place-items-center rounded-xl text-muted hover:bg-canvas hover:text-ink"
                      aria-label={t('common.edit')}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" onClick={() => setToDelete(o)} className="grid size-9 place-items-center rounded-xl text-muted hover:bg-coral-50 hover:text-coral-600" aria-label={t('common.delete')}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Dialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        size="sm"
        title={t('observations.deleteTitle')}
        description={toDelete ? formatDate(toDelete.date, lang, { day: 'numeric', month: 'long' }) : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (toDelete) {
                  deleteObservation(toDelete.id);
                  if (form.id === toDelete.id) setForm(blank());
                  toast({ title: t('toast.observationDeleted'), tone: 'info' });
                }
                setToDelete(null);
              }}
            >
              {t('common.delete')}
            </Button>
          </>
        }
      />
    </div>
  );
}
