import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus, Save, SkipForward, Trash2, X } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useToast } from '@/components/feedback/Toast';
import { cn } from '@/lib/cn';
import { todayKey } from '@/lib/dates';
import { uid } from '@/lib/random';
import { profileCompletion, sectionComplete, SECTIONS } from '@/lib/profile';
import { ALT_COMM_KEYS, AVATAR_PRESETS, INTEREST_KEYS, THERAPY_KEYS } from '@/mocks/children';
import type { ChildProfile, CommunicationLevel, ConditionKey, DiagnosisStatus, MedicalEntry, SensitivityLevel } from '@/types';
import { KidAvatar } from '@/components/illustrations/Brand';
import { Button, Card, ChipToggle, Field, ProgressBar, Segmented } from '@/components/ui';

const CONDITIONS: ConditionKey[] = ['adhd', 'intellectual', 'speech_delay', 'epilepsy', 'anxiety', 'sleep', 'gastro', 'feeding', 'sensory_processing', 'dyspraxia', 'ocd', 'tics', 'hearing_vision', 'genetic', 'other'];
const REQUIRED_STEPS = [0, 1];

export function ProfileWizard({
  initial,
  initialStep,
  isNew,
  onSave,
  onCancel,
}: {
  initial: ChildProfile;
  initialStep: number;
  isNew: boolean;
  onSave: (c: ChildProfile) => void;
  onCancel: () => void;
}) {
  const { t } = useLang();
  const reduce = useReduceMotion();
  const toast = useToast();
  const [draft, setDraft] = useState<ChildProfile>(initial);
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 0), 5));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dir, setDir] = useState(1);

  const set = <K extends keyof ChildProfile>(k: K, v: ChildProfile[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: '' }));
  };

  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!draft.name.trim()) e.name = t('validation.nameRequired');
      if (!draft.birthDate) e.birthDate = t('validation.birthRequired');
      else if (draft.birthDate > todayKey()) e.birthDate = t('validation.birthFuture');
    }
    if (s === 1 && !draft.diagnosisStatus) e.diagnosisStatus = t('validation.diagnosisRequired');
    return e;
  };

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const markReviewed = (s: number) => {
    const section = SECTIONS[s];
    if (s >= 2 && !draft.reviewedSections.includes(section)) setDraft((d) => ({ ...d, reviewedSections: [...d.reviewedSections, section] }));
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    markReviewed(step);
    if (step < 5) go(step + 1);
    else save(true);
  };

  const save = (reviewCurrent = false) => {
    for (const s of REQUIRED_STEPS) {
      const e = validate(s);
      if (Object.keys(e).length) {
        setErrors(e);
        go(s);
        toast({ title: t('validation.fixRequired'), tone: 'warning' });
        return;
      }
    }
    const section = SECTIONS[step];
    const final = reviewCurrent && step >= 2 && !draft.reviewedSections.includes(section) ? { ...draft, reviewedSections: [...draft.reviewedSections, section] } : draft;
    onSave(final);
    toast({ title: isNew ? t('toast.childAdded', { name: final.name }) : t('toast.profileSaved'), description: t('toast.profileCompletion', { value: profileCompletion(final).percent }) });
  };

  const completion = profileCompletion(draft);
  const optional = step >= 2;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{isNew ? t('profile.newChild') : t('profile.editing', { name: initial.name })}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">{t('profile.wizardTitle')}</h1>
          <p className="mt-1 text-[15px] text-muted">{t('profile.wizardSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" icon={<X className="size-4" />} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="secondary" icon={<Save className="size-4" />} onClick={() => save()}>
            {t('profile.saveClose')}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* stepper */}
        <Card className="h-fit p-4 lg:sticky lg:top-24">
          <div className="mb-4 px-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-ink">{t('profile.completion')}</span>
              <span className="text-cobalt-600">{completion.percent}%</span>
            </div>
            <ProgressBar value={completion.percent} className="mt-2" label={t('profile.completion')} />
          </div>
          <ol className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">
            {SECTIONS.map((s, i) => {
              const done = sectionComplete(draft, s);
              return (
                <li key={s} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === step ? 'step' : undefined}
                    className={cn('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors', i === step ? 'bg-cobalt-50' : 'hover:bg-canvas')}
                  >
                    <span
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-full text-sm font-extrabold',
                        i === step ? 'bg-cobalt-500 text-white' : done ? 'bg-leaf-500 text-white' : 'bg-canvas text-muted ring-1 ring-line',
                      )}
                    >
                      {done && i !== step ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="hidden min-w-0 lg:block">
                      <span className={cn('block text-sm font-bold', i === step ? 'text-cobalt-700' : 'text-ink')}>{t(`profile.steps.${s}`)}</span>
                      <span className="block text-xs text-muted">{REQUIRED_STEPS.includes(i) ? t('profile.required') : t('profile.optional')}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* form */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-line bg-gradient-to-r from-cobalt-50 to-white px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-cobalt-600">{t('profile.stepOf', { step: step + 1, total: 6 })}</p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">{t(`profile.steps.${SECTIONS[step]}`)}</h2>
            <p className="mt-0.5 text-sm text-muted">{t(`profile.stepHelp.${SECTIONS[step]}`)}</p>
          </div>
          <div className="relative min-h-[360px] overflow-hidden px-6 py-6">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, x: dir * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: dir * -30 }}
                transition={{ duration: 0.22 }}
              >
                {step === 0 && <StepBasic draft={draft} set={set} errors={errors} />}
                {step === 1 && <StepDiagnosis draft={draft} set={set} errors={errors} />}
                {step === 2 && <StepConditions draft={draft} set={set} />}
                {step === 3 && <StepMedical draft={draft} set={set} />}
                {step === 4 && <StepHealth draft={draft} set={set} />}
                {step === 5 && <StepDaily draft={draft} set={set} />}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-canvas/60 px-6 py-4">
            <Button variant="secondary" icon={<ArrowLeft className="size-4" />} onClick={() => go(step - 1)} disabled={step === 0}>
              {t('common.previous')}
            </Button>
            <div className="ml-auto flex flex-wrap gap-2">
              {optional && (
                <Button variant="ghost" icon={<SkipForward className="size-4" />} onClick={() => (step < 5 ? go(step + 1) : save())}>
                  {t('profile.later')}
                </Button>
              )}
              <Button onClick={next} icon={step === 5 ? <Save className="size-4" /> : <ArrowRight className="order-last size-4" />}>
                {step === 5 ? t('profile.saveProfile') : t('common.next')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

type StepProps = { draft: ChildProfile; set: <K extends keyof ChildProfile>(k: K, v: ChildProfile[K]) => void; errors?: Record<string, string> };

function StepBasic({ draft, set, errors = {} }: StepProps) {
  const { t } = useLang();
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_240px]">
      <div className="space-y-5">
        <Field label={t('profile.fields.name')} htmlFor="c-name" required error={errors.name}>
          <input id="c-name" className="input" value={draft.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} placeholder={t('profile.placeholders.name')} />
        </Field>
        <Field label={t('profile.fields.birthDate')} htmlFor="c-birth" required error={errors.birthDate}>
          <input id="c-birth" type="date" className="input" value={draft.birthDate} max={todayKey()} onChange={(e) => set('birthDate', e.target.value)} aria-invalid={!!errors.birthDate} />
        </Field>
      </div>
      <div>
        <p className="mb-2 text-[13px] font-bold text-ink">{t('profile.fields.avatar')}</p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('profile.fields.avatar')}>
          {AVATAR_PRESETS.map((a, i) => {
            const selected = JSON.stringify(a) === JSON.stringify(draft.avatar);
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${t('profile.fields.avatar')} ${i + 1}`}
                onClick={() => set('avatar', a)}
                className={cn('grid place-items-center rounded-2xl p-1.5 transition-all', selected ? 'bg-cobalt-50 ring-[3px] ring-cobalt-500' : 'ring-1 ring-line hover:bg-canvas')}
              >
                <KidAvatar avatar={a} size={60} ring={false} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RadioCards<T extends string>({ value, onChange, options, label, error }: { value: T | ''; onChange: (v: T) => void; options: { value: T; title: string; text?: string }[]; label: string; error?: string }) {
  return (
    <div>
      <div role="radiogroup" aria-label={label} className="grid gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn('rounded-2xl border-2 p-4 text-left transition-all', value === o.value ? 'border-cobalt-500 bg-cobalt-50' : error ? 'border-coral-300' : 'border-line hover:border-cobalt-200')}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-ink">{o.title}</span>
              <span className={cn('grid size-5 place-items-center rounded-full border-2', value === o.value ? 'border-cobalt-500 bg-cobalt-500' : 'border-line')}>
                {value === o.value && <Check className="size-3 text-white" strokeWidth={4} />}
              </span>
            </span>
            {o.text && <span className="mt-1 block text-[13px] text-muted">{o.text}</span>}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[13px] font-semibold text-coral-600">
          {error}
        </p>
      )}
    </div>
  );
}

function StepDiagnosis({ draft, set, errors = {} }: StepProps) {
  const { t } = useLang();
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-[13px] font-bold text-ink">
          {t('profile.fields.diagnosisStatus')} <span className="text-coral-500">*</span>
        </p>
        <RadioCards<DiagnosisStatus>
          label={t('profile.fields.diagnosisStatus')}
          value={draft.diagnosisStatus}
          onChange={(v) => set('diagnosisStatus', v)}
          error={errors.diagnosisStatus}
          options={(['confirmed', 'suspected', 'in_progress'] as DiagnosisStatus[]).map((v) => ({ value: v, title: t(`diagnosis.${v}`), text: t(`diagnosis.${v}Text`) }))}
        />
      </div>
      <div>
        <p className="mb-2 text-[13px] font-bold text-ink">{t('profile.fields.supportLevel')}</p>
        <Segmented
          label={t('profile.fields.supportLevel')}
          value={draft.supportLevel ? String(draft.supportLevel) : 'none'}
          onChange={(v) => set('supportLevel', v === 'none' ? null : (Number(v) as 1 | 2 | 3))}
          options={[
            { value: 'none', label: t('profile.notApplicable') },
            { value: '1', label: t('profile.levelN', { n: 1 }) },
            { value: '2', label: t('profile.levelN', { n: 2 }) },
            { value: '3', label: t('profile.levelN', { n: 3 }) },
          ]}
        />
        <p className="mt-2 text-[12.5px] text-muted">{t('profile.supportHelp')}</p>
      </div>
      <Field label={t('profile.fields.icd')} htmlFor="c-icd" hint={t('profile.icdHelp')} className="max-w-xs">
        <input id="c-icd" className="input" value={draft.icdCode} onChange={(e) => set('icdCode', e.target.value)} placeholder="F84.0" />
      </Field>
    </div>
  );
}

function StepConditions({ draft, set }: StepProps) {
  const { t } = useLang();
  const toggle = (c: ConditionKey) => set('conditions', draft.conditions.includes(c) ? draft.conditions.filter((x) => x !== c) : [...draft.conditions, c]);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {CONDITIONS.map((c) => (
          <ChipToggle key={c} selected={draft.conditions.includes(c)} onClick={() => toggle(c)}>
            {draft.conditions.includes(c) && <Check className="size-3.5" strokeWidth={3} />}
            {t(`conditions.${c}`)}
          </ChipToggle>
        ))}
      </div>
      {draft.conditions.includes('other') && (
        <Field label={t('profile.fields.conditionsOther')} htmlFor="c-other" className="max-w-md">
          <input id="c-other" className="input" value={draft.conditionsOther} onChange={(e) => set('conditionsOther', e.target.value)} />
        </Field>
      )}
      <p className="rounded-2xl bg-canvas p-3 text-[13px] text-muted">{t('profile.conditionsNote')}</p>
    </div>
  );
}

function StepMedical({ draft, set }: StepProps) {
  const { t } = useLang();
  const [open, setOpen] = useState<string | null>(draft.medicalHistory[0]?.id ?? null);
  const update = (id: string, patch: Partial<MedicalEntry>) => set('medicalHistory', draft.medicalHistory.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const add = () => {
    const e: MedicalEntry = { id: uid('med-u'), date: todayKey(), doctor: '', specialty: '', institution: '', diagnosis: '', notes: '', recommendations: '', nextAppointment: '' };
    set('medicalHistory', [e, ...draft.medicalHistory]);
    setOpen(e.id);
  };
  const fields: { k: keyof MedicalEntry; type?: string; wide?: boolean; area?: boolean }[] = [
    { k: 'date', type: 'date' },
    { k: 'nextAppointment', type: 'date' },
    { k: 'doctor' },
    { k: 'specialty' },
    { k: 'institution', wide: true },
    { k: 'diagnosis', wide: true },
    { k: 'notes', wide: true, area: true },
    { k: 'recommendations', wide: true, area: true },
  ];
  return (
    <div className="space-y-3">
      <Button variant="soft" icon={<Plus className="size-4" />} onClick={add}>
        {t('profile.addEntry')}
      </Button>
      {draft.medicalHistory.length === 0 && <p className="rounded-2xl bg-canvas p-4 text-sm text-muted">{t('profile.noEntries')}</p>}
      {draft.medicalHistory.map((m) => (
        <div key={m.id} className="rounded-2xl border border-line">
          <div className="flex items-center gap-2 px-4 py-3">
            <button type="button" className="flex flex-1 items-center gap-2 text-left" onClick={() => setOpen(open === m.id ? null : m.id)} aria-expanded={open === m.id}>
              <ChevronDown className={cn('size-4 text-muted transition-transform', open === m.id && 'rotate-180')} />
              <span className="font-bold text-ink">{m.diagnosis || m.specialty || t('profile.newEntry')}</span>
              <span className="text-xs text-muted">{m.date}</span>
            </button>
            <button type="button" onClick={() => set('medicalHistory', draft.medicalHistory.filter((x) => x.id !== m.id))} className="grid size-9 place-items-center rounded-xl text-muted hover:bg-coral-50 hover:text-coral-600" aria-label={t('common.delete')}>
              <Trash2 className="size-4" />
            </button>
          </div>
          {open === m.id && (
            <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
              {fields.map((f) => (
                <Field key={f.k} label={t(`profile.fields.${f.k}`)} htmlFor={`${m.id}-${f.k}`} className={f.wide ? 'sm:col-span-2' : undefined}>
                  {f.area ? (
                    <textarea id={`${m.id}-${f.k}`} rows={2} className="input resize-y" value={m[f.k]} onChange={(e) => update(m.id, { [f.k]: e.target.value })} />
                  ) : (
                    <input id={`${m.id}-${f.k}`} type={f.type ?? 'text'} className="input" value={m[f.k]} onChange={(e) => update(m.id, { [f.k]: e.target.value })} />
                  )}
                </Field>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StepHealth({ draft, set }: StepProps) {
  const { t } = useLang();
  return (
    <div className="grid gap-5">
      <Field label={t('profile.fields.chronic')} htmlFor="c-chronic" hint={t('profile.noneHint')}>
        <textarea id="c-chronic" rows={2} className="input resize-y" value={draft.chronicConditions} onChange={(e) => set('chronicConditions', e.target.value)} />
      </Field>
      <Field label={t('profile.fields.allergies')} htmlFor="c-allergies">
        <textarea id="c-allergies" rows={2} className="input resize-y" value={draft.allergies} onChange={(e) => set('allergies', e.target.value)} />
      </Field>
      <Field label={t('profile.fields.medications')} htmlFor="c-meds" hint={t('profile.medsHint')}>
        <textarea id="c-meds" rows={2} className="input resize-y" value={draft.medications} onChange={(e) => set('medications', e.target.value)} />
      </Field>
    </div>
  );
}

function TagPicker({ keys, values, onChange, group, allowCustom }: { keys: string[]; values: string[]; onChange: (v: string[]) => void; group: 'interests' | 'therapies' | 'altComm'; allowCustom?: boolean }) {
  const { t, tag } = useLang();
  const [custom, setCustom] = useState('');
  const toggle = (k: string) => onChange(values.includes(k) ? values.filter((x) => x !== k) : [...values, k]);
  const customs = values.filter((v) => !keys.includes(v));
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {keys.map((k) => (
          <ChipToggle key={k} selected={values.includes(k)} onClick={() => toggle(k)}>
            {tag(group, k)}
          </ChipToggle>
        ))}
        {customs.map((c) => (
          <ChipToggle key={c} selected onClick={() => toggle(c)}>
            {c} <X className="size-3.5" />
          </ChipToggle>
        ))}
      </div>
      {allowCustom && (
        <form
          className="mt-3 flex max-w-sm gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const v = custom.trim();
            if (v && !values.includes(v)) onChange([...values, v]);
            setCustom('');
          }}
        >
          <input className="input h-10 py-2" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={t('profile.addCustom')} aria-label={t('profile.addCustom')} />
          <Button type="submit" size="sm" variant="secondary" icon={<Plus className="size-3.5" />}>
            {t('common.add')}
          </Button>
        </form>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-bold text-ink">{title}</p>
      {children}
    </div>
  );
}

function StepDaily({ draft, set }: StepProps) {
  const { t } = useLang();
  const levels: SensitivityLevel[] = ['low', 'medium', 'high'];
  return (
    <div className="space-y-6">
      <Block title={t('profile.fields.communication')}>
        <div role="radiogroup" aria-label={t('profile.fields.communication')} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {(['verbal', 'phrases', 'single_words', 'nonverbal'] as CommunicationLevel[]).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={draft.communicationLevel === c}
              onClick={() => set('communicationLevel', c)}
              className={cn('rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition-all', draft.communicationLevel === c ? 'border-cobalt-500 bg-cobalt-50 text-cobalt-700' : 'border-line text-ink hover:border-cobalt-200')}
            >
              {t(`communication.${c}`)}
            </button>
          ))}
        </div>
      </Block>
      <Block title={t('profile.fields.altComm')}>
        <TagPicker group="altComm" keys={ALT_COMM_KEYS} values={draft.altCommunication} onChange={(v) => set('altCommunication', v)} />
      </Block>
      <div className="grid gap-4 md:grid-cols-3">
        {(['sound', 'light', 'touch'] as const).map((k) => (
          <Block key={k} title={t(`profile.fields.${k}Sensitivity`)}>
            <Segmented
              size="sm"
              label={t(`profile.fields.${k}Sensitivity`)}
              value={draft.sensory[k]}
              onChange={(v) => set('sensory', { ...draft.sensory, [k]: v })}
              options={levels.map((l) => ({ value: l, label: t(`sensitivity.${l}`) }))}
            />
          </Block>
        ))}
      </div>
      {draft.sensory.sound === 'high' && <p className="rounded-2xl bg-cobalt-50 p-3 text-[13px] font-semibold text-cobalt-700">{t('profile.soundLockedNote')}</p>}
      <Block title={t('profile.fields.interests')}>
        <TagPicker group="interests" keys={INTEREST_KEYS} values={draft.interests} onChange={(v) => set('interests', v)} allowCustom />
      </Block>
      <Block title={t('profile.fields.therapies')}>
        <TagPicker group="therapies" keys={THERAPY_KEYS} values={draft.therapies} onChange={(v) => set('therapies', v)} allowCustom />
      </Block>
    </div>
  );
}
