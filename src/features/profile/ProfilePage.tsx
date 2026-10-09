import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Ear,
  HeartPulse,
  Lightbulb,
  MessageCircle,
  Pencil,
  Pill,
  Plus,
  Sparkles,
  Stethoscope,
  Sun,
  Hand,
  UserPlus,
  Users,
} from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useEnterChildMode } from '@/layouts/ParentLayout';
import { ageInYears, formatDate } from '@/lib/dates';
import { profileCompletion, sectionComplete, SECTIONS } from '@/lib/profile';
import { uid } from '@/lib/random';
import { cn } from '@/lib/cn';
import { emptyChild } from '@/mocks/children';
import type { ChildProfile, ProfileSection, SensitivityLevel } from '@/types';
import { KidAvatar } from '@/components/illustrations/Brand';
import { Badge, Button, Card, DemoBadge, PageHeader, ProgressRing, SectionHeader } from '@/components/ui';
import { ProfileWizard } from './ProfileWizard';

const SECTION_ICON: Record<ProfileSection, typeof Activity> = {
  basic: Users,
  diagnosis: ClipboardList,
  conditions: Activity,
  medical: Stethoscope,
  health: HeartPulse,
  daily: Sun,
};

export default function ProfilePage() {
  const { data, selectedChild, saveChild, user } = useStore();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [wizard, setWizard] = useState<{ draft: ChildProfile; step: number; isNew: boolean } | null>(null);

  useEffect(() => {
    if (params.get('new') === '1') {
      setWizard({ draft: emptyChild(user?.id ?? 'u-parent', uid('child'), data.children.length), step: 0, isNew: true });
      setParams({}, { replace: true });
    } else if (params.get('step')) {
      setWizard({ draft: structuredClone(selectedChild), step: Number(params.get('step')) || 0, isNew: false });
      setParams({}, { replace: true });
    }
  }, [params, setParams, data.children.length, selectedChild, user]);

  if (wizard) {
    return (
      <ProfileWizard
        initial={wizard.draft}
        initialStep={wizard.step}
        isNew={wizard.isNew}
        onCancel={() => setWizard(null)}
        onSave={(child) => {
          saveChild(child);
          setWizard(null);
          navigate('/parent/profile', { replace: true });
        }}
      />
    );
  }

  const openStep = (step: number) => setWizard({ draft: structuredClone(selectedChild), step, isNew: false });
  return (
    <ProfileOverview
      child={selectedChild}
      onEdit={openStep}
      onAdd={() => setWizard({ draft: emptyChild(user?.id ?? 'u-parent', uid('child'), data.children.length), step: 0, isNew: true })}
    />
  );
}

function ProfileOverview({ child, onEdit, onAdd }: { child: ChildProfile; onEdit: (step: number) => void; onAdd: () => void }) {
  const { data, selectChild } = useStore();
  const { t, lang, tag } = useLang();
  const enterChild = useEnterChildMode();
  const completion = profileCompletion(child);
  const age = ageInYears(child.birthDate);

  const sensory: { key: keyof ChildProfile['sensory']; icon: typeof Ear }[] = [
    { key: 'sound', icon: Ear },
    { key: 'light', icon: Lightbulb },
    { key: 'touch', icon: Hand },
  ];
  const levelTone = (v: SensitivityLevel) => (v === 'high' ? 'coral' : v === 'medium' ? 'sun' : 'leaf');

  return (
    <div>
      <PageHeader
        eyebrow={t('profile.eyebrow')}
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        action={
          <>
            <Button variant="secondary" icon={<UserPlus className="size-4" />} onClick={onAdd}>
              {t('header.addChild')}
            </Button>
            <Button icon={<Pencil className="size-4" />} onClick={() => onEdit(0)}>
              {t('profile.edit')}
            </Button>
          </>
        }
      />

      {data.children.length > 1 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {data.children.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectChild(c.id)}
              className={cn('flex shrink-0 items-center gap-2 rounded-2xl border py-1.5 pl-1.5 pr-4 text-sm font-bold transition-colors', c.id === child.id ? 'border-cobalt-500 bg-cobalt-50 text-cobalt-700' : 'border-line bg-white text-ink hover:bg-canvas')}
            >
              <KidAvatar avatar={c.avatar} size={32} ring={false} />
              {c.name || t('profile.unnamed')}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* hero */}
          <Card className="relative overflow-hidden p-0">
            <div className="h-28 bg-gradient-to-r from-coral-500 via-sun-400 to-turquoise-500" aria-hidden="true">
              <svg viewBox="0 0 600 112" preserveAspectRatio="none" className="size-full opacity-30">
                <path d="M0 80c80-30 160-40 240-10s160 30 240 0 100-20 120-10v52H0z" fill="#fff" />
              </svg>
            </div>
            <div className="px-6 pb-6">
              <div className="-mt-12 flex flex-wrap items-end gap-4">
                <KidAvatar avatar={child.avatar} size={104} className="drop-shadow-lg" />
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-ink">{child.name || t('profile.unnamed')}</h2>
                    {child.demo && <DemoBadge />}
                  </div>
                  <p className="text-sm text-muted">
                    {age !== null ? t('common.yearsOld', { count: age }) : '—'}
                    {child.birthDate && <> · {formatDate(child.birthDate, lang, { day: 'numeric', month: 'long', year: 'numeric' })}</>}
                  </p>
                </div>
                <Button variant="sun" icon={<Sparkles className="size-4" />} onClick={() => enterChild('/child', child.id)}>
                  {t('dashboard.enterChildMode')}
                </Button>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-canvas p-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted">{t('profile.fields.diagnosisStatus')}</dt>
                  <dd className="mt-1 font-extrabold text-ink">{child.diagnosisStatus ? t(`diagnosis.${child.diagnosisStatus}`) : '—'}</dd>
                </div>
                <div className="rounded-2xl bg-canvas p-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted">{t('profile.fields.supportLevel')}</dt>
                  <dd className="mt-1 font-extrabold text-ink">{child.supportLevel ? t('profile.levelN', { n: child.supportLevel }) : t('profile.notApplicable')}</dd>
                </div>
                <div className="rounded-2xl bg-canvas p-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted">{t('profile.fields.communication')}</dt>
                  <dd className="mt-1 font-extrabold text-ink">{child.communicationLevel ? t(`communication.${child.communicationLevel}`) : '—'}</dd>
                </div>
              </dl>
            </div>
          </Card>

          {/* sensory + interests */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <SectionHeader title={t('profile.sensoryTitle')} subtitle={t('profile.sensorySubtitle')} className="mb-4" />
              <ul className="space-y-3">
                {sensory.map((s) => {
                  const v = child.sensory[s.key];
                  return (
                    <li key={s.key} className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-canvas text-navy-700">
                        <s.icon className="size-5" />
                      </span>
                      <span className="flex-1 text-sm font-bold text-ink">{t(`profile.fields.${s.key}Sensitivity`)}</span>
                      <Badge tone={levelTone(v)}>{t(`sensitivity.${v}`)}</Badge>
                    </li>
                  );
                })}
              </ul>
              {child.sensory.sound === 'high' && (
                <p className="mt-4 flex gap-2 rounded-2xl bg-cobalt-50 p-3 text-[13px] font-semibold text-cobalt-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {t('profile.soundLockedNote')}
                </p>
              )}
            </Card>
            <Card className="p-5 sm:p-6">
              <SectionHeader title={t('profile.interestsTitle')} subtitle={t('profile.interestsSubtitle')} className="mb-4" />
              <div className="flex flex-wrap gap-2">
                {child.interests.length ? child.interests.map((i) => <Badge key={i} tone="violet">{tag('interests', i)}</Badge>) : <p className="text-sm text-muted">—</p>}
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">{t('profile.fields.therapies')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {child.therapies.length ? child.therapies.map((i) => <Badge key={i} tone="teal">{tag('therapies', i)}</Badge>) : <p className="text-sm text-muted">—</p>}
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">{t('profile.fields.altComm')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {child.altCommunication.length ? child.altCommunication.map((i) => <Badge key={i} tone="cobalt">{tag('altComm', i)}</Badge>) : <p className="text-sm text-muted">—</p>}
              </div>
            </Card>
          </div>

          {/* conditions + health */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <SectionHeader title={t('profile.steps.conditions')} className="mb-4" action={<button type="button" onClick={() => onEdit(2)} className="text-sm font-bold text-cobalt-600 hover:underline">{t('common.edit')}</button>} />
              <div className="flex flex-wrap gap-2">
                {child.conditions.length ? child.conditions.map((c) => <Badge key={c} tone="coral">{t(`conditions.${c}`)}</Badge>) : <p className="text-sm text-muted">{t('profile.noneSelected')}</p>}
                {child.conditionsOther && <Badge tone="gray">{child.conditionsOther}</Badge>}
              </div>
            </Card>
            <Card className="p-5 sm:p-6">
              <SectionHeader title={t('profile.steps.health')} className="mb-4" action={<button type="button" onClick={() => onEdit(4)} className="text-sm font-bold text-cobalt-600 hover:underline">{t('common.edit')}</button>} />
              <dl className="space-y-2.5 text-sm">
                {[
                  { k: 'chronic', v: child.chronicConditions, icon: Activity },
                  { k: 'allergies', v: child.allergies, icon: AlertCircle },
                  { k: 'medications', v: child.medications, icon: Pill },
                ].map((r) => (
                  <div key={r.k} className="flex items-start gap-3">
                    <r.icon className="mt-0.5 size-4 shrink-0 text-muted" />
                    <dt className="w-32 shrink-0 font-semibold text-muted">{t(`profile.fields.${r.k}`)}</dt>
                    <dd className="font-bold text-ink">{r.v || '—'}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>

          {/* medical history */}
          <Card className="p-5 sm:p-6">
            <SectionHeader
              title={t('profile.steps.medical')}
              subtitle={t('profile.medicalSubtitle')}
              className="mb-4"
              action={
                <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} onClick={() => onEdit(3)}>
                  {t('profile.addEntry')}
                </Button>
              }
            />
            {child.medicalHistory.length === 0 ? (
              <p className="rounded-2xl bg-canvas p-4 text-sm text-muted">{t('profile.noEntries')}</p>
            ) : (
              <ol className="relative space-y-4 border-l-2 border-dashed border-line pl-6">
                {child.medicalHistory
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((m) => (
                    <li key={m.id} className="relative">
                      <span className="absolute -left-[33px] top-1 grid size-4 place-items-center rounded-full bg-cobalt-500 ring-4 ring-white" />
                      <div className="rounded-2xl border border-line p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-extrabold text-ink">{m.diagnosis || m.specialty || '—'}</p>
                          <span className="flex items-center gap-1 text-xs font-bold text-muted">
                            <CalendarDays className="size-3.5" />
                            {m.date ? formatDate(m.date, lang, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                          {[m.doctor, m.specialty, m.institution].filter(Boolean).join(' · ')}
                        </p>
                        {m.notes && <p className="mt-2 text-sm text-ink">{m.notes}</p>}
                        {m.recommendations && (
                          <p className="mt-2 text-sm">
                            <span className="font-bold text-ink">{t('profile.fields.recommendations')}:</span> <span className="text-muted">{m.recommendations}</span>
                          </p>
                        )}
                        {m.nextAppointment && (
                          <Badge tone="cobalt" className="mt-2" icon={<CalendarDays className="size-3" />}>
                            {t('profile.fields.nextAppointment')}: {formatDate(m.nextAppointment, lang, { day: 'numeric', month: 'short' })}
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
              </ol>
            )}
          </Card>
        </div>

        {/* completion sidebar */}
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <ProgressRing value={completion.percent} size={84} stroke={9} color={completion.percent === 100 ? '#36B878' : '#3563F6'}>
                <span className="text-lg font-extrabold text-ink">{completion.percent}%</span>
              </ProgressRing>
              <div>
                <p className="text-base font-extrabold text-ink">{t('profile.completion')}</p>
                <p className="text-sm text-muted">{completion.missing.length === 0 ? t('profile.completeAll') : t('profile.missingCount', { count: completion.missing.length })}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-1.5">
              {SECTIONS.map((s, i) => {
                const done = sectionComplete(child, s);
                const Icon = SECTION_ICON[s];
                return (
                  <li key={s}>
                    <button type="button" onClick={() => onEdit(i)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-canvas">
                      <span className={cn('grid size-9 place-items-center rounded-xl', done ? 'bg-leaf-50 text-leaf-600' : 'bg-sun-50 text-sun-700')}>
                        <Icon className="size-4" />
                      </span>
                      <span className="flex-1 text-sm font-bold text-ink">{t(`profile.steps.${s}`)}</span>
                      {done ? <CheckCircle2 className="size-5 text-leaf-500" /> : <span className="text-xs font-bold text-sun-700">{t('profile.fillNow')}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
          {completion.missing.length > 0 && (
            <Card className="border-sun-300 bg-sun-50 p-5">
              <p className="flex items-center gap-2 font-extrabold text-ink">
                <MessageCircle className="size-4 text-sun-700" />
                {t('profile.reminderTitle')}
              </p>
              <p className="mt-1 text-sm text-muted">{t('profile.reminderText')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {completion.missing.map((s) => (
                  <Button key={s} size="sm" variant="secondary" onClick={() => onEdit(SECTIONS.indexOf(s))}>
                    {t(`profile.steps.${s}`)}
                  </Button>
                ))}
              </div>
            </Card>
          )}
          <Card className="p-5">
            <p className="text-sm font-extrabold text-ink">{t('profile.privacyTitle')}</p>
            <p className="mt-1 text-[13px] text-muted">{t('profile.privacyText')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
