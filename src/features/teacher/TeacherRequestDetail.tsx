import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Ear,
  Eye,
  EyeOff,
  FileLock2,
  Hand,
  HeartPulse,
  Lightbulb,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useToast } from '@/components/feedback/Toast';
import { ageInYears, formatDate, formatDateTime } from '@/lib/dates';
import { cn } from '@/lib/cn';
import type { RequestStatus } from '@/types';
import { KidAvatar } from '@/components/illustrations/Brand';
import { Badge, Button, Card, DemoBadge, Dialog, EmptyState, SectionHeader } from '@/components/ui';
import { SKILL_META, StatusBadge, TrendBadge, pctText } from '@/features/shared';
import { useTeacherData, type TeacherCase } from './useTeacherData';

export default function TeacherRequestDetail() {
  const { id } = useParams();
  const { t } = useLang();
  const { cases } = useTeacherData();
  const c = cases.find((x) => x.request.id === id);
  if (!c) {
    return (
      <EmptyState
        icon={<FileLock2 className="size-6" />}
        title={t('teacher.notFound')}
        action={
          <Link to="/teacher/requests" className="font-bold text-teal-600 hover:underline">
            {t('teacher.backToRequests')}
          </Link>
        }
      />
    );
  }
  return <Detail c={c} />;
}

function Detail({ c }: { c: TeacherCase }) {
  const { setRequestStatus } = useStore();
  const { t, lang } = useLang();
  const toast = useToast();
  const [confirm, setConfirm] = useState<RequestStatus | null>(null);
  const { request: r, child } = c;
  const age = child ? ageInYears(child.birthDate) : null;

  const apply = (status: RequestStatus) => {
    setRequestStatus(r.id, status, 'specialist');
    setConfirm(null);
    toast({ title: t(`toast.request_${status}`, { child: child?.name ?? '' }), tone: status === 'accepted' ? 'success' : 'info' });
  };

  return (
    <div className="space-y-5">
      <Link to="/teacher/requests" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:underline">
        <ArrowLeft className="size-4" /> {t('teacher.backToRequests')}
      </Link>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-5 bg-gradient-to-r from-turquoise-50 via-white to-white p-6 sm:flex-row sm:items-center">
          {child && <KidAvatar avatar={child.avatar} size={84} />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-ink">{child?.name ?? '—'}</h1>
              <StatusBadge status={r.status} />
              {r.demo && <DemoBadge />}
            </div>
            <p className="mt-1 text-sm text-muted">
              {age !== null && <>{t('common.yearsOld', { count: age })} · </>}
              {t('teacher.from', { parent: r.parentName })} · {formatDateTime(r.createdAt, lang)}
            </p>
          </div>
          {r.status === 'pending' && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={<X className="size-4" />} onClick={() => setConfirm('rejected')}>
                {t('teacher.reject')}
              </Button>
              <Button className="bg-teal-600 hover:bg-teal-700" icon={<Check className="size-4" />} onClick={() => setConfirm('accepted')}>
                {t('teacher.accept')}
              </Button>
            </div>
          )}
          {r.status === 'accepted' && (
            <Button variant="secondary" icon={<Lock className="size-4" />} onClick={() => setConfirm('closed')}>
              {t('teacher.close')}
            </Button>
          )}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <SectionHeader title={t('teacher.requestMessage')} className="mb-3" />
            <p className="flex gap-2 rounded-2xl bg-canvas p-4 text-sm leading-relaxed text-ink">
              <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted" />
              {r.message}
            </p>
            {r.goals.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.goals.map((g) => (
                  <Badge key={g} tone="teal">
                    {t(`goals.${g}`)}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <SectionHeader title={t('teacher.consent')} className="mb-3" />
            <p className="flex gap-2 rounded-2xl bg-leaf-50 p-4 text-sm font-semibold text-leaf-700">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              “{t('marketplace.consent')}”
            </p>
            <p className="mt-2 text-xs text-muted">{t('teacher.consentAt', { date: formatDateTime(r.consentAt, lang) })}</p>
          </Card>
          <Card className="p-5">
            <SectionHeader title={t('teacher.history')} className="mb-3" />
            <ol className="space-y-3">
              {r.history.map((h, i) => (
                <li key={i} className="flex items-center gap-3">
                  <StatusBadge status={h.status} />
                  <span className="text-xs text-muted">
                    {formatDateTime(h.at, lang)} · {t(`roles.${h.by}`)}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <AccessPanel c={c} onAccept={() => setConfirm('accepted')} />
      </div>

      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title={confirm ? t(`teacher.confirm.${confirm}Title`, { child: child?.name ?? '' }) : ''}
        description={confirm ? t(`teacher.confirm.${confirm}Text`) : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              {t('common.back')}
            </Button>
            <Button variant={confirm === 'accepted' ? 'primary' : 'danger'} className={confirm === 'accepted' ? 'bg-teal-600 hover:bg-teal-700' : undefined} onClick={() => confirm && apply(confirm)}>
              {confirm === 'accepted' ? t('teacher.accept') : confirm === 'rejected' ? t('teacher.reject') : t('teacher.close')}
            </Button>
          </>
        }
      />
    </div>
  );
}

function AccessPanel({ c, onAccept }: { c: TeacherCase; onAccept: () => void }) {
  const { t, tag, lang } = useLang();
  const reduce = useReduceMotion();
  const { request: r, child, snapshot, skills } = c;

  if (r.status !== 'accepted' && r.status !== 'pending') {
    return (
      <Card className="relative overflow-hidden p-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(45deg,#172554_0_10px,transparent_10px_20px)]" aria-hidden="true" />
        <div className="relative flex flex-col items-center py-8 text-center">
          <motion.span initial={reduce ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid size-20 place-items-center rounded-3xl bg-navy-800 text-white shadow-lg">
            <EyeOff className="size-9" />
          </motion.span>
          <h2 className="mt-5 text-xl font-extrabold text-ink">{t('teacher.accessClosed')}</h2>
          <p className="mt-2 max-w-md text-sm text-muted">{t(`teacher.closedReason.${r.status}`)}</p>
          <p className="mt-4 rounded-2xl bg-canvas px-4 py-2 text-xs font-semibold text-muted">{t('teacher.frontendNote')}</p>
        </div>
      </Card>
    );
  }

  if (r.status === 'pending') {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-4 rounded-3xl bg-sun-50 p-5 ring-1 ring-sun-300">
          <Eye className="mt-0.5 size-6 shrink-0 text-sun-700" />
          <div>
            <p className="font-extrabold text-ink">{t('teacher.previewTitle')}</p>
            <p className="mt-1 text-sm text-muted">{t('teacher.previewText')}</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <Info label={t('profile.fields.name')} value={child?.name ?? '—'} />
          <Info label={t('teacher.age')} value={child ? t('common.yearsOld', { count: ageInYears(child.birthDate) ?? 0 }) : '—'} />
          <Info label={t('profile.fields.diagnosisStatus')} value={child?.diagnosisStatus ? t(`diagnosis.${child.diagnosisStatus}`) : '—'} />
        </dl>
        <div className="relative mt-5 overflow-hidden rounded-3xl border border-dashed border-line p-6">
          <div className="space-y-2 blur-[5px]" aria-hidden="true">
            {[80, 64, 72, 50].map((w, i) => (
              <div key={i} className="h-4 rounded-full bg-line" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <Button className="bg-teal-600 hover:bg-teal-700" icon={<Lock className="size-4" />} onClick={onAccept}>
              {t('teacher.acceptToView')}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!child) return null;
  const sens = [
    { k: 'sound', icon: Ear },
    { k: 'light', icon: Lightbulb },
    { k: 'touch', icon: Hand },
  ] as const;

  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center gap-2 rounded-2xl bg-leaf-50 px-4 py-3 text-sm font-bold text-leaf-700 ring-1 ring-leaf-300">
        <CheckCircle2 className="size-4" /> {t('teacher.readOnly')}
      </div>

      {snapshot && (
        <Card className="p-5 sm:p-6">
          <SectionHeader title={t('teacher.learningSummary')} subtitle={t('teacher.learningSummaryText')} action={<DemoBadge />} className="mb-4" />
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Info label={t('metrics.firstTryShort')} value={`${snapshot.firstTry}%`} />
            <Info label={t('metrics.completionShort')} value={`${snapshot.completion}%`} />
            <Info label={t('metrics.difficultShort')} value={`${snapshot.difficult}%`} />
            <Info label={t('metrics.avgResponseShort')} value={t('common.secondsShort', { value: snapshot.avgResponseSec })} />
            <Info label={t('teacher.sessions')} value={String(snapshot.sessions)} />
          </dl>
          {skills && (
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {skills.map((s) => {
                const meta = SKILL_META[s.skill];
                return (
                  <li key={s.skill} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                    <span className={cn('grid size-10 place-items-center rounded-xl bg-gradient-to-br text-white', meta.gradient)}>
                      <meta.icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-ink">{t(`skills.${s.skill}`)}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-muted">{pctText(s.current.firstTry)}</span>
                        <TrendBadge trend={s.trend} delta={s.delta} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHeader title={t('profile.steps.diagnosis')} className="mb-3" />
          <dl className="grid grid-cols-2 gap-3">
            <Info label={t('profile.fields.diagnosisStatus')} value={child.diagnosisStatus ? t(`diagnosis.${child.diagnosisStatus}`) : '—'} />
            <Info label={t('profile.fields.supportLevel')} value={child.supportLevel ? t('profile.levelN', { n: child.supportLevel }) : t('profile.notApplicable')} />
            <Info label={t('profile.fields.icd')} value={child.icdCode || '—'} />
            <Info label={t('profile.fields.communication')} value={child.communicationLevel ? t(`communication.${child.communicationLevel}`) : '—'} />
          </dl>
          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-muted">{t('profile.steps.conditions')}</p>
          <div className="flex flex-wrap gap-1.5">{child.conditions.length ? child.conditions.map((x) => <Badge key={x} tone="coral">{t(`conditions.${x}`)}</Badge>) : <span className="text-sm text-muted">—</span>}</div>
        </Card>
        <Card className="p-5">
          <SectionHeader title={t('profile.sensoryTitle')} className="mb-3" />
          <ul className="space-y-2.5">
            {sens.map((s) => (
              <li key={s.k} className="flex items-center gap-3 text-sm">
                <s.icon className="size-4 text-muted" />
                <span className="flex-1 font-semibold text-ink">{t(`profile.fields.${s.k}Sensitivity`)}</span>
                <Badge tone={child.sensory[s.k] === 'high' ? 'coral' : child.sensory[s.k] === 'medium' ? 'sun' : 'leaf'}>{t(`sensitivity.${child.sensory[s.k]}`)}</Badge>
              </li>
            ))}
          </ul>
          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-muted">{t('profile.fields.interests')}</p>
          <div className="flex flex-wrap gap-1.5">{child.interests.map((i) => <Badge key={i} tone="violet">{tag('interests', i)}</Badge>)}</div>
          <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-muted">{t('profile.fields.altComm')}</p>
          <div className="flex flex-wrap gap-1.5">{child.altCommunication.length ? child.altCommunication.map((i) => <Badge key={i} tone="cobalt">{tag('altComm', i)}</Badge>) : <span className="text-sm text-muted">—</span>}</div>
        </Card>
        <Card className="p-5">
          <SectionHeader title={t('profile.steps.health')} className="mb-3" />
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <HeartPulse className="mt-0.5 size-4 text-muted" />
              <dt className="w-28 shrink-0 font-semibold text-muted">{t('profile.fields.allergies')}</dt>
              <dd className="font-bold text-ink">{child.allergies || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <ClipboardList className="mt-0.5 size-4 text-muted" />
              <dt className="w-28 shrink-0 font-semibold text-muted">{t('profile.fields.therapies')}</dt>
              <dd className="font-bold text-ink">{child.therapies.map((x) => tag('therapies', x)).join(', ') || '—'}</dd>
            </div>
          </dl>
        </Card>
        <Card className="p-5">
          <SectionHeader title={t('profile.steps.medical')} className="mb-3" />
          {child.medicalHistory.length === 0 ? (
            <p className="text-sm text-muted">{t('profile.noEntries')}</p>
          ) : (
            <ul className="space-y-2">
              {child.medicalHistory.map((m) => (
                <li key={m.id} className="rounded-2xl bg-canvas p-3 text-sm">
                  <p className="flex items-center gap-2 font-bold text-ink">
                    <Stethoscope className="size-4 text-muted" /> {m.diagnosis || m.specialty}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                    <CalendarDays className="size-3" /> {m.date ? formatDate(m.date, lang, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} · {m.specialty}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <p className="text-xs text-muted">{t('teacher.frontendNote')}</p>
    </motion.div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-canvas p-3">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-extrabold text-ink">{value}</dd>
    </div>
  );
}
