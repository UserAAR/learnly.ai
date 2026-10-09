import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Clock3, Inbox, Lock, UserCheck, XCircle } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { ageInYears, formatDate, formatDateTime } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { KidAvatar, Mascot } from '@/components/illustrations/Brand';
import { Badge, Button, Card, DemoBadge, EmptyState, SectionHeader } from '@/components/ui';
import { StatusBadge } from '@/features/shared';
import { useTeacherData, type TeacherCase } from './useTeacherData';

export default function TeacherDashboard() {
  const { user } = useStore();
  const { t, lang } = useLang();
  const reduce = useReduceMotion();
  const navigate = useNavigate();
  const { cases, pending, accepted, rejected, closed } = useTeacherData();

  const stats = [
    { key: 'pending', value: pending.length, icon: Clock3, tone: 'from-sun-400 to-[#FFB547] text-navy-900' },
    { key: 'accepted', value: accepted.length, icon: UserCheck, tone: 'from-leaf-500 to-teal-500 text-white' },
    { key: 'rejected', value: rejected.length, icon: XCircle, tone: 'from-coral-500 to-coral-600 text-white' },
    { key: 'closed', value: closed.length, icon: Lock, tone: 'from-navy-500 to-navy-800 text-white' },
  ];

  const timeline = cases
    .flatMap((c) => c.request.history.map((h) => ({ ...h, c })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[28px] bg-white p-6 shadow-card ring-1 ring-line sm:flex-row sm:items-center sm:p-7">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow">{formatDate(new Date(), lang, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <DemoBadge />
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-[30px]">{t('teacher.welcome', { name: user?.name.split(' ')[0] })}</h1>
          <p className="mt-1 max-w-xl text-[15px] text-muted">{pending.length ? t('teacher.welcomePending', { count: pending.length }) : t('teacher.welcomeNone')}</p>
          {pending[0] && (
            <Button className="mt-4 bg-teal-600 hover:bg-teal-700" icon={<ArrowRight className="order-last size-4" />} onClick={() => navigate(`/teacher/requests/${pending[0].request.id}`)}>
              {t('teacher.reviewNext')}
            </Button>
          )}
        </div>
        <div className="hidden shrink-0 sm:block">
          <Mascot size={120} mood="happy" animate={!reduce} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.key}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn('relative overflow-hidden rounded-3xl bg-gradient-to-br p-5', s.tone)}
          >
            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/15" aria-hidden="true" />
            <s.icon className="relative size-6 opacity-90" />
            <p className="relative mt-3 text-4xl font-extrabold tabular-nums">{s.value}</p>
            <p className="relative text-sm font-bold opacity-85">{t(`teacher.stats.${s.key}`)}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5 sm:p-6">
          <SectionHeader
            title={t('teacher.pendingTitle')}
            subtitle={t('teacher.pendingSubtitle')}
            className="mb-4"
            action={
              <Link to="/teacher/requests" className="text-sm font-bold text-teal-600 hover:underline">
                {t('common.viewAll')}
              </Link>
            }
          />
          {pending.length === 0 ? (
            <EmptyState icon={<Inbox className="size-6" />} title={t('teacher.noPending')} description={t('teacher.noPendingText')} />
          ) : (
            <ul className="space-y-3">
              {pending.map((c) => (
                <CaseRow key={c.request.id} c={c} highlight />
              ))}
            </ul>
          )}

          <SectionHeader title={t('teacher.activeTitle')} subtitle={t('teacher.activeSubtitle')} className="mb-4 mt-8" />
          {accepted.length === 0 ? (
            <p className="rounded-2xl bg-canvas p-4 text-sm text-muted">{t('teacher.noActive')}</p>
          ) : (
            <ul className="space-y-3">
              {accepted.map((c) => (
                <CaseRow key={c.request.id} c={c} />
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionHeader title={t('teacher.timeline')} subtitle={t('teacher.timelineSubtitle')} className="mb-4" />
          <ol className="relative space-y-4 border-l-2 border-line pl-5">
            {timeline.map((e, i) => (
              <li key={i} className="relative">
                <span
                  className={cn(
                    'absolute -left-[27px] top-0.5 grid size-5 place-items-center rounded-full ring-4 ring-white',
                    e.status === 'accepted' ? 'bg-leaf-500' : e.status === 'pending' ? 'bg-sun-400' : e.status === 'rejected' ? 'bg-coral-500' : 'bg-navy-500',
                  )}
                >
                  {e.status === 'accepted' && <CheckCircle2 className="size-3 text-white" />}
                </span>
                <p className="text-sm font-bold text-ink">
                  {t(`teacher.event.${e.status}`, { child: e.c.child?.name ?? '—', parent: e.c.request.parentName })}
                </p>
                <p className="text-xs text-muted">{formatDateTime(e.at, lang)}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}

export function CaseRow({ c, highlight }: { c: TeacherCase; highlight?: boolean }) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const age = c.child ? ageInYears(c.child.birthDate) : null;
  return (
    <li>
      <button
        type="button"
        onClick={() => navigate(`/teacher/requests/${c.request.id}`)}
        className={cn(
          'flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-colors sm:flex-row sm:items-center',
          highlight ? 'border-sun-300 bg-sun-50/60 hover:bg-sun-50' : 'border-line hover:bg-canvas',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {c.child && <KidAvatar avatar={c.child.avatar} size={48} ring={false} />}
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-extrabold text-ink">
              {c.child?.name ?? '—'}
              {age !== null && <span className="text-sm font-semibold text-muted">{t('common.yearsOld', { count: age })}</span>}
              <StatusBadge status={c.request.status} />
              {c.request.demo && <Badge tone="sun">{t('common.demo')}</Badge>}
            </p>
            <p className="truncate text-sm text-muted">
              {t('teacher.from', { parent: c.request.parentName })} · {formatDateTime(c.request.createdAt, lang)}
            </p>
            <p className="mt-1 line-clamp-1 text-[13px] text-ink/80">“{c.request.message}”</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 self-end text-sm font-bold text-teal-600 sm:self-center">
          {t('teacher.open')} <ArrowRight className="size-4" />
        </span>
      </button>
    </li>
  );
}
