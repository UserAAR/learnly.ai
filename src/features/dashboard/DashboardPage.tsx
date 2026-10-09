import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  FileChartColumn,
  FlaskConical,
  Gauge,
  History,
  Lightbulb,
  ListChecks,
  NotebookPen,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useChildData } from '@/hooks/useChildData';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useToast } from '@/components/feedback/Toast';
import { useEnterChildMode } from '@/layouts/ParentLayout';
import { ageInYears, formatDate, formatDateTime, todayKey } from '@/lib/dates';
import { computeMetrics, isDifficult } from '@/lib/learning-metrics';
import { profileCompletion } from '@/lib/profile';
import { cn } from '@/lib/cn';
import { KidAvatar, Mascot, StarShape } from '@/components/illustrations/Brand';
import { Badge, Button, Card, DemoBadge, Dialog, EmptyState, ProgressBar, SectionHeader } from '@/components/ui';
import { DailyAccuracyChart, MiniBars, WeeklyComparisonChart } from '@/components/charts/LearningCharts';
import { SKILL_META, TrendBadge, activityTitle, pctText } from '@/features/shared';
import { getLesson } from '@/mocks/lessons';

export default function DashboardPage() {
  const { generateHistory, clearHistory } = useStore();
  const { t, l, lang } = useLang();
  const toast = useToast();
  const reduce = useReduceMotion();
  const navigate = useNavigate();
  const enterChild = useEnterChildMode();
  const d = useChildData();
  const { child } = d;
  const [confirmClear, setConfirmClear] = useState(false);

  const age = ageInYears(child.birthDate);
  const completion = profileCompletion(child);
  const inProgress = Object.values(d.progress).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const hasData = d.sessions.length > 0;
  const hasDemo = d.sessions.some((s) => s.demo);
  const lastSession = d.sessions[0];
  const completedIn14 = d.metrics.completedSessions;
  const weekObs = d.observations.slice(0, 7);
  const avgMood = weekObs.length ? Math.round((weekObs.reduce((a, o) => a + o.mood, 0) / weekObs.length) * 10) / 10 : null;
  const todayObs = d.observations.find((o) => o.date === todayKey());

  const stats: { key: string; label: string; value: string; hint: string; icon: LucideIcon; tone: string; bars?: (number | null)[]; extra?: React.ReactNode }[] = [
    {
      key: 'firstTry',
      label: t('metrics.firstTry'),
      value: pctText(d.metrics.firstTry),
      hint: t('metrics.firstTryHint'),
      icon: Target,
      tone: 'bg-cobalt-50 text-cobalt-600',
      bars: d.series.map((p) => p.firstTry),
      extra: <TrendBadge trend={d.weekly.trend} delta={d.weekly.delta} />,
    },
    {
      key: 'completion',
      label: t('metrics.completion'),
      value: pctText(d.metrics.completion),
      hint: t('metrics.completionHint'),
      icon: CheckCircle2,
      tone: 'bg-turquoise-50 text-teal-600',
      bars: d.series.map((p) => p.completion),
    },
    {
      key: 'difficult',
      label: t('metrics.difficult'),
      value: pctText(d.metrics.difficult),
      hint: t('metrics.difficultHint'),
      icon: Gauge,
      tone: 'bg-coral-50 text-coral-600',
      bars: d.series.map((p) => p.difficult),
    },
    {
      key: 'response',
      label: t('metrics.avgResponse'),
      value: d.metrics.avgResponseSec === null ? '—' : t('common.secondsShort', { value: d.metrics.avgResponseSec }),
      hint: t('metrics.avgResponseHint'),
      icon: Clock3,
      tone: 'bg-violet-50 text-violet-600',
    },
    {
      key: 'lessons',
      label: t('metrics.completedActivities'),
      value: String(completedIn14),
      hint: t('metrics.completedActivitiesHint', { total: d.allTime.completedSessions }),
      icon: BookOpenCheck,
      tone: 'bg-sun-50 text-sun-700',
    },
    {
      key: 'trend',
      label: t('metrics.weeklyTrend'),
      value: d.weekly.delta === null ? '—' : `${d.weekly.delta > 0 ? '+' : ''}${d.weekly.delta} ${t('common.pp')}`,
      hint: t(`trend.${d.weekly.trend}Long`),
      icon: TrendingUp,
      tone: d.weekly.trend === 'down' ? 'bg-coral-50 text-coral-600' : 'bg-leaf-50 text-leaf-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ───────────── A. Welcome ───────────── */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-cobalt-500 via-cobalt-600 to-violet-600 text-white shadow-glow">
        <div className="grain absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-turquoise-500/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 left-1/3 size-80 rounded-full bg-coral-500/25 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{formatDate(new Date(), lang, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              {hasDemo && <DemoBadge className="bg-white/90" />}
            </div>
            <h1 className="mt-4 text-[26px] font-extrabold leading-tight tracking-tight sm:text-[34px]">{t('dashboard.greeting', { name: child.name || t('profile.unnamed') })}</h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/80">{t('dashboard.greetingText')}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                onClick={() => enterChild()}
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                className="group inline-flex h-14 items-center gap-3 rounded-2xl bg-sun-400 pl-2 pr-5 text-[15px] font-extrabold text-navy-900 shadow-[0_8px_0_#B3810A,0_18px_30px_-10px_rgba(14,24,56,0.55)] transition-shadow active:translate-y-1 active:shadow-[0_3px_0_#B3810A]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-white/70">
                  <Sparkles className="size-5 text-coral-600" />
                </span>
                {t('dashboard.enterChildMode')}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
              {inProgress && (
                <button
                  type="button"
                  onClick={() => enterChild(`/child/${inProgress.activityType}/${inProgress.slug}`)}
                  className="inline-flex h-14 items-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25"
                >
                  <Play className="size-4" />
                  {t('dashboard.continueActivity', { title: l(activityTitle(inProgress.slug)) })}
                </button>
              )}
            </div>
          </div>

          {/* child card */}
          <div className="relative">
            <div className="relative mx-auto max-w-sm rounded-[28px] bg-white/[0.12] p-5 ring-1 ring-white/20 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <KidAvatar avatar={child.avatar} size={84} />
                  <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-sun-400 ring-4 ring-cobalt-600">
                    <StarShape size={18} fill="#fff" stroke="#FFD34E" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">{t('dashboard.selectedChild')}</p>
                  <p className="truncate text-2xl font-extrabold">{child.name || t('profile.unnamed')}</p>
                  <p className="text-sm text-white/75">
                    {age !== null ? t('common.yearsOld', { count: age }) : '—'}
                    {child.diagnosisStatus && <> · {t(`diagnosis.${child.diagnosisStatus}`)}</>}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white/10 px-2 py-2.5">
                  <p className="text-xl font-extrabold">{d.stars}</p>
                  <p className="text-[11px] font-semibold text-white/70">{t('dashboard.stars')}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-2 py-2.5">
                  <p className="text-xl font-extrabold">{d.allTime.completedSessions}</p>
                  <p className="text-[11px] font-semibold text-white/70">{t('dashboard.activities')}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-2 py-2.5">
                  <p className="text-xl font-extrabold">{completion.percent}%</p>
                  <p className="text-[11px] font-semibold text-white/70">{t('dashboard.profile')}</p>
                </div>
              </div>
              {lastSession && (
                <p className="mt-4 flex items-center gap-2 text-xs text-white/70">
                  <History className="size-3.5" />
                  {t('dashboard.lastActivity', { title: l(activityTitle(lastSession.activitySlug)), date: formatDateTime(lastSession.completedAt, lang) })}
                </p>
              )}
            </div>
            <div className="absolute -right-2 -top-8 hidden xl:block" aria-hidden="true">
              <Mascot size={92} mood="happy" animate={!reduce} />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Consultation indicator ───────────── */}
      {d.flag.active && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 rounded-3xl border border-sun-300 bg-sun-50 p-5 sm:flex-row sm:items-center">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sun-400 text-navy-900">
            <AlertTriangle className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-ink">{t('dashboard.flagTitle')}</p>
            <p className="mt-0.5 text-sm text-muted">
              {d.flag.declines.map((x) => t('dashboard.flagDecline', { skill: t(`skills.${x.skill}`), delta: Math.abs(x.delta) })).join(' ')}
              {d.flag.crisesThisWeek >= 3 && ` ${t('dashboard.flagCrises', { count: d.flag.crisesThisWeek })}`} {t('dashboard.flagDisclaimer')}
            </p>
          </div>
          <Button variant="dark" onClick={() => navigate('/parent/marketplace')} icon={<UsersRound className="size-4" />}>
            {t('dashboard.browseSpecialists')}
          </Button>
        </motion.div>
      )}

      {!hasData ? (
        <Card className="p-6">
          <EmptyState
            icon={<FlaskConical className="size-6" />}
            title={t('dashboard.emptyTitle', { name: child.name || t('profile.unnamed') })}
            description={t('dashboard.emptyText')}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => enterChild()} icon={<Sparkles className="size-4" />}>
                  {t('dashboard.enterChildMode')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    generateHistory(child.id);
                    toast({ title: t('toast.historyGenerated'), description: t('toast.historyGeneratedText') });
                  }}
                  icon={<History className="size-4" />}
                >
                  {t('dashboard.generateHistory')}
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <>
          {/* ───────────── B. Performance cards ───────────── */}
          <section aria-labelledby="perf">
            <SectionHeader
              eyebrow={t('dashboard.last14')}
              title={<span id="perf">{t('dashboard.performance')}</span>}
              action={hasDemo ? <DemoBadge /> : undefined}
              className="mb-3"
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {stats.map((s, i) => (
                <motion.div
                  key={s.key}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card group flex flex-col p-4 transition-shadow hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn('grid size-10 place-items-center rounded-2xl', s.tone)}>
                      <s.icon className="size-5" />
                    </span>
                    {s.extra}
                  </div>
                  <p className="mt-3 text-[28px] font-extrabold leading-none tracking-tight text-ink tabular-nums">{s.value}</p>
                  <p className="mt-1.5 text-[13px] font-bold text-ink">{s.label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted">{s.hint}</p>
                  {s.bars && <MiniBars values={s.bars} className="mt-3" color={s.key === 'difficult' ? 'bg-coral-500' : s.key === 'completion' ? 'bg-turquoise-500' : 'bg-cobalt-500'} />}
                </motion.div>
              ))}
            </div>
          </section>

          {/* ───────────── C. Skill progress ───────────── */}
          <section aria-labelledby="skills">
            <SectionHeader eyebrow={t('dashboard.skillsEyebrow')} title={<span id="skills">{t('dashboard.skills')}</span>} subtitle={t('dashboard.skillsSubtitle')} className="mb-3" />
            <div className="grid gap-4 md:grid-cols-3">
              {d.skills.map((s) => {
                const meta = SKILL_META[s.skill];
                const lesson = getLesson(s.skill === 'hygiene' ? 'handwashing' : s.skill === 'safety' ? 'road-safety' : 'emotions');
                const label = s.trend === 'up' ? 'improving' : s.trend === 'down' ? 'practice' : (s.overall.hintRate ?? 0) >= 30 ? 'hints' : s.trend === 'na' ? 'na' : 'steady';
                return (
                  <article key={s.skill} className="card relative overflow-hidden p-5">
                    <div className={cn('absolute -right-10 -top-10 size-36 rounded-full bg-gradient-to-br opacity-15', meta.gradient)} aria-hidden="true" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={cn('grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg', meta.gradient)}>
                          <meta.icon className="size-6" />
                        </span>
                        <div>
                          <h3 className="text-base font-extrabold text-ink">{t(`skills.${s.skill}`)}</h3>
                          <p className="text-xs text-muted">{lesson ? l(lesson.title) : ''}</p>
                        </div>
                      </div>
                      <TrendBadge trend={s.trend} delta={s.delta} />
                    </div>
                    <div className="relative mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[34px] font-extrabold leading-none tracking-tight text-ink tabular-nums">{pctText(s.current.firstTry)}</p>
                        <p className="mt-1 text-xs font-semibold text-muted">
                          {t('dashboard.thisWeekFirstTry')} · {t('dashboard.prevWeekShort')} {pctText(s.previous.firstTry)}
                        </p>
                      </div>
                    </div>
                    <ProgressBar value={s.current.firstTry ?? 0} className="relative mt-3" color={s.trend === 'down' ? 'bg-coral-500' : 'bg-gradient-to-r from-cobalt-500 to-turquoise-500'} label={t(`skills.${s.skill}`)} />
                    <dl className="relative mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl bg-canvas px-2 py-2">
                        <dt className="text-[11px] font-semibold text-muted">{t('metrics.completionShort')}</dt>
                        <dd className="text-sm font-extrabold tabular-nums">{pctText(s.overall.completion)}</dd>
                      </div>
                      <div className="rounded-2xl bg-canvas px-2 py-2">
                        <dt className="text-[11px] font-semibold text-muted">{t('metrics.hintsShort')}</dt>
                        <dd className="text-sm font-extrabold tabular-nums">{pctText(s.overall.hintRate)}</dd>
                      </div>
                      <div className="rounded-2xl bg-canvas px-2 py-2">
                        <dt className="text-[11px] font-semibold text-muted">{t('metrics.difficultShort')}</dt>
                        <dd className="text-sm font-extrabold tabular-nums">{pctText(s.overall.difficult)}</dd>
                      </div>
                    </dl>
                    <p className={cn('relative mt-4 flex items-start gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-semibold', label === 'practice' ? 'bg-coral-50 text-coral-700' : label === 'improving' ? 'bg-leaf-50 text-leaf-700' : 'bg-violet-50 text-violet-700')}>
                      <Lightbulb className="mt-0.5 size-4 shrink-0" />
                      {t(`dashboard.skillNote.${label}`)}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ───────────── D. Charts ───────────── */}
          <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Card className="p-5 sm:p-6">
              <SectionHeader title={t('charts.dailyTitle')} subtitle={t('charts.dailySubtitle')} className="mb-4" />
              <DailyAccuracyChart series={d.series} />
            </Card>
            <Card className="flex flex-col p-5 sm:p-6">
              <SectionHeader title={t('charts.weeklyTitle')} subtitle={t('charts.weeklySubtitle')} className="mb-4" />
              <WeeklyComparisonChart skills={d.skills} />
              <div className={cn('mt-4 rounded-2xl p-4', d.weekly.trend === 'down' ? 'bg-coral-50' : d.weekly.trend === 'up' ? 'bg-leaf-50' : 'bg-canvas')}>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('charts.trendSummary')}</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {t(`charts.trendText.${d.weekly.trend}`, {
                    current: pctText(d.weekly.current.firstTry),
                    previous: pctText(d.weekly.previous.firstTry),
                    delta: Math.abs(d.weekly.delta ?? 0),
                  })}
                </p>
              </div>
            </Card>
          </section>
        </>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* ───────────── E. Recent activity ───────────── */}
        <Card className="p-5 sm:p-6">
          <SectionHeader title={t('dashboard.recent')} subtitle={t('dashboard.recentSubtitle')} action={<Link to="/parent/lessons" className="text-sm font-bold text-cobalt-600 hover:underline">{t('common.viewAll')}</Link>} className="mb-4" />
          {d.sessions.length === 0 ? (
            <p className="rounded-2xl bg-canvas p-4 text-sm text-muted">{t('dashboard.noRecent')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {d.sessions.slice(0, 6).map((s) => {
                const m = computeMetrics([s]);
                const attempts = s.steps.reduce((a, st) => a + st.attempts, 0);
                const hints = s.steps.filter((st) => st.hintUsed).length;
                const meta = SKILL_META[s.skill];
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
                    <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', meta.soft)} style={{ color: meta.color }}>
                      <meta.icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-extrabold text-ink">
                        {l(activityTitle(s.activitySlug))}
                        {!s.demo && <Badge tone="leaf">{t('common.new')}</Badge>}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDateTime(s.completedAt, lang)} · {t(s.activityType === 'lesson' ? 'common.lesson' : 'common.game')}
                      </p>
                    </div>
                    <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:flex-nowrap">
                      <Badge tone="cobalt">{t('dashboard.resultFirstTry', { value: pctText(m.firstTry) })}</Badge>
                      <Badge tone="gray">{t('dashboard.attempts', { count: attempts })}</Badge>
                      <Badge tone={hints ? 'violet' : 'gray'}>{t('dashboard.hints', { count: hints })}</Badge>
                      <Badge tone={s.completed ? 'leaf' : 'sun'} icon={<CheckCircle2 className="size-3" />}>
                        {s.completed ? t('common.completed') : t('common.inProgress')}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {d.sessions.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              {t('dashboard.difficultNote', { count: d.sessions.slice(0, 6).flatMap((s) => s.steps).filter(isDifficult).length })}
            </p>
          )}
        </Card>

        {/* ───────────── F. Quick actions + G. demo controls ───────────── */}
        <div className="space-y-4">
          <Card className="p-5 sm:p-6">
            <SectionHeader title={t('dashboard.quickActions')} className="mb-4" />
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Sparkles, label: t('dashboard.qaChildMode'), onClick: () => enterChild(), tone: 'from-sun-400 to-coral-500 text-white' },
                {
                  icon: Play,
                  label: inProgress ? t('dashboard.qaContinue') : t('dashboard.qaStartLesson'),
                  onClick: () => enterChild(inProgress ? `/child/${inProgress.activityType}/${inProgress.slug}` : '/child/lesson/handwashing'),
                  tone: 'from-cobalt-500 to-violet-500 text-white',
                },
                { icon: UserRound, label: t('dashboard.qaProfile'), onClick: () => navigate('/parent/profile'), tone: 'from-white to-white text-ink ring-1 ring-line' },
                { icon: NotebookPen, label: todayObs ? t('dashboard.qaObservationDone') : t('dashboard.qaObservation'), onClick: () => navigate('/parent/observations?new=1'), tone: 'from-white to-white text-ink ring-1 ring-line' },
                { icon: FileChartColumn, label: t('dashboard.qaReport'), onClick: () => navigate('/parent/reports'), tone: 'from-white to-white text-ink ring-1 ring-line' },
                { icon: UsersRound, label: t('dashboard.qaSpecialists'), onClick: () => navigate('/parent/marketplace'), tone: 'from-white to-white text-ink ring-1 ring-line' },
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className={cn('flex min-h-[86px] flex-col justify-between rounded-2xl bg-gradient-to-br p-3.5 text-left text-[13px] font-extrabold leading-snug transition-transform hover:-translate-y-0.5 active:scale-[0.98]', a.tone)}
                >
                  <a.icon className="size-5" />
                  {a.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-sun-100 text-sun-700">
                <CalendarCheck2 className="size-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-ink">{t('dashboard.weekObs')}</p>
                <p className="text-xs text-muted">{t('dashboard.weekObsText', { mood: avgMood ?? '—', crises: d.flag.crisesThisWeek })}</p>
              </div>
            </div>
          </Card>

          <Card className="demo-stripes border-sun-300 p-5 sm:p-6">
            <div className="rounded-2xl bg-white/90 p-4">
              <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <FlaskConical className="size-4 text-sun-700" />
                {t('dashboard.demoControls')}
              </p>
              <p className="mt-1 text-xs text-muted">{t('dashboard.demoControlsText')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="sun"
                  icon={<RotateCcw className="size-3.5" />}
                  onClick={() => {
                    generateHistory(child.id);
                    toast({ title: t('toast.historyGenerated'), description: t('toast.historyGeneratedText') });
                  }}
                >
                  {t('dashboard.generateHistory')}
                </Button>
                <Button size="sm" variant="secondary" icon={<Trash2 className="size-3.5" />} onClick={() => setConfirmClear(true)} disabled={!hasData}>
                  {t('dashboard.clearHistory')}
                </Button>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted">
                <ListChecks className="size-3.5" />
                {t('dashboard.metricsNote')}
              </p>
            </div>
          </Card>
        </div>
      </section>

      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title={t('dashboard.clearConfirmTitle')}
        description={t('dashboard.clearConfirmText', { name: child.name })}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmClear(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearHistory(child.id);
                setConfirmClear(false);
                toast({ title: t('toast.historyCleared'), tone: 'info' });
              }}
            >
              {t('dashboard.clearHistory')}
            </Button>
          </>
        }
      />
    </div>
  );
}
