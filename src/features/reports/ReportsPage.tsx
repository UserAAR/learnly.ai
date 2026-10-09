import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  FileText,
  FlaskConical,
  Heart,
  Home,
  Info,
  Leaf,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
} from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useChildData } from '@/hooks/useChildData';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useToast } from '@/components/feedback/Toast';
import { useEnterChildMode } from '@/layouts/ParentLayout';
import { formatDate, formatDateTime } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { getLesson } from '@/mocks/lessons';
import { getGame } from '@/mocks/games';
import type { LearningReport } from '@/types';
import { Mascot } from '@/components/illustrations/Brand';
import { Badge, Button, Card, Dialog, EmptyState, PageHeader } from '@/components/ui';
import { activityTitle } from '@/features/shared';

const STAGES = ['reports.stage1', 'reports.stage2', 'reports.stage3', 'reports.stage4'];

export default function ReportsPage() {
  const { createReport, restoreDemoReports } = useStore();
  const { t, lang } = useLang();
  const reduce = useReduceMotion();
  const toast = useToast();
  const d = useChildData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [stage, setStage] = useState(0);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((x) => window.clearTimeout(x)), []);

  const selected = d.reports.find((r) => r.id === selectedId) ?? d.reports[0] ?? null;

  const generate = () => {
    setGenerating(true);
    setStage(0);
    const per = reduce ? 80 : 420;
    STAGES.forEach((_, i) => timers.current.push(window.setTimeout(() => setStage(i), per * i)));
    timers.current.push(
      window.setTimeout(() => {
        const r = createReport(d.child.id);
        setSelectedId(r.id);
        setGenerating(false);
        toast({ title: t('toast.reportReady'), description: t('toast.reportReadyText') });
      }, per * STAGES.length),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('reports.eyebrow')}
        title={t('reports.title')}
        subtitle={t('reports.subtitle', { name: d.child.name })}
        action={
          <>
            <Button variant="secondary" icon={<RotateCcw className="size-4" />} onClick={() => setConfirmRestore(true)}>
              {t('reports.restore')}
            </Button>
            <Button
              onClick={generate}
              disabled={generating}
              className="bg-gradient-to-r from-violet-500 to-cobalt-500 shadow-[0_12px_28px_-12px_rgba(129,88,232,0.9)] hover:brightness-110"
              icon={generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            >
              {t('reports.generate')}
            </Button>
          </>
        }
      />

      <div className="flex items-start gap-3 rounded-3xl border border-sun-300 bg-sun-50 p-4">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-sun-700" />
        <div className="text-sm">
          <p className="font-extrabold text-ink">{t('reports.demoBanner')}</p>
          <p className="mt-0.5 text-muted">{t('reports.demoBannerText')}</p>
        </div>
      </div>

      <AnimatePresence>
        {generating && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="overflow-hidden rounded-3xl bg-navy-800 p-5 text-white">
            <div className="flex items-center gap-4">
              <Mascot size={64} mood="think" animate={!reduce} />
              <div className="min-w-0 flex-1">
                <p className="font-extrabold">{t('reports.generating', { name: d.child.name })}</p>
                <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                  {STAGES.map((s, i) => (
                    <li key={s} className={cn('flex items-center gap-2 transition-opacity', i <= stage ? 'opacity-100' : 'opacity-40')}>
                      {i < stage ? <CheckCircle2 className="size-4 text-leaf-300" /> : i === stage ? <Loader2 className="size-4 animate-spin text-sun-400" /> : <span className="size-4 rounded-full border border-white/40" />}
                      {t(s)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {d.reports.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<FileText className="size-6" />}
            title={t('reports.emptyTitle')}
            description={t('reports.emptyText')}
            action={
              <Button onClick={generate} icon={<Sparkles className="size-4" />}>
                {t('reports.generate')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
          {/* history */}
          <Card className="h-fit p-4 xl:sticky xl:top-24">
            <p className="px-2 pb-2 text-sm font-extrabold text-ink">{t('reports.history')}</p>
            <ul className="flex gap-2 overflow-x-auto pb-1 scrollbar-none xl:flex-col xl:overflow-visible">
              {d.reports.map((r) => (
                <li key={r.id} className="w-60 shrink-0 xl:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    aria-current={selected?.id === r.id}
                    className={cn('w-full rounded-2xl border p-3 text-left transition-colors', selected?.id === r.id ? 'border-cobalt-300 bg-cobalt-50' : 'border-line hover:bg-canvas')}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                        <CalendarDays className="size-4 text-muted" />
                        {formatDate(r.createdAt, lang, { day: 'numeric', month: 'short' })}
                      </span>
                      {r.demo ? <Badge tone="sun">{t('common.demo')}</Badge> : <Badge tone="leaf">{t('common.new')}</Badge>}
                    </span>
                    <span className="mt-1.5 block text-xs text-muted">
                      {t('metrics.firstTryShort')} {r.metrics.firstTry}% · {t('metrics.completionShort')} {r.metrics.completion}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {selected && <ReportView report={selected} />}
        </div>
      )}

      <Dialog
        open={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        size="sm"
        title={t('reports.restoreTitle')}
        description={t('reports.restoreText')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmRestore(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                restoreDemoReports(d.child.id);
                setSelectedId(null);
                setConfirmRestore(false);
                toast({ title: t('toast.reportsRestored') });
              }}
            >
              {t('reports.restore')}
            </Button>
          </>
        }
      />
    </div>
  );
}

function ReportView({ report }: { report: LearningReport }) {
  const { t, l, tr, lang } = useLang();
  const navigate = useNavigate();
  const enterChild = useEnterChildMode();
  const reduce = useReduceMotion();
  const item = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.05 * i } });

  return (
    <motion.article key={report.id} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
      <header className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-500 to-cobalt-500 p-6 text-white sm:p-8">
        <div className="grain absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              <Bot className="size-4" /> {t('reports.reportEyebrow')}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{t('reports.reportTitle')}</h2>
            <p className="mt-1 text-sm text-white/75">
              {formatDateTime(report.createdAt, lang)} · {t('reports.period', { days: report.periodDays })}
            </p>
          </div>
          <span className="demo-stripes rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-sun-700">{t('reports.demoLabel')}</span>
        </div>
        <dl className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { k: 'metrics.firstTryShort', v: `${report.metrics.firstTry}%` },
            { k: 'metrics.completionShort', v: `${report.metrics.completion}%` },
            { k: 'metrics.difficultShort', v: `${report.metrics.difficult}%` },
            { k: 'metrics.avgResponseShort', v: t('common.secondsShort', { value: report.metrics.avgResponseSec }) },
            { k: 'reports.weekDelta', v: report.metrics.trendDelta === null ? '—' : `${report.metrics.trendDelta > 0 ? '+' : ''}${report.metrics.trendDelta} ${t('common.pp')}` },
          ].map((m) => (
            <div key={m.k} className="rounded-2xl bg-white/12 px-3 py-2.5 ring-1 ring-white/15">
              <dd className="text-lg font-extrabold tabular-nums">{m.v}</dd>
              <dt className="text-[11px] font-semibold text-white/70">{t(m.k)}</dt>
            </div>
          ))}
        </dl>
      </header>

      <div className="space-y-7 p-6 sm:p-8">
        <motion.section {...item(0)}>
          <SectionTitle n={1} icon={FileText} title={t('reports.summary')} />
          <div className="space-y-2 text-[15px] leading-relaxed text-ink">
            {report.summary.map((s, i) => (
              <p key={i}>{tr(s)}</p>
            ))}
          </div>
        </motion.section>

        <div className="grid gap-5 lg:grid-cols-2">
          <motion.section {...item(1)} className="rounded-3xl bg-leaf-50 p-5">
            <SectionTitle n={2} icon={Leaf} title={t('reports.strengths')} tone="text-leaf-700" />
            <ul className="space-y-2.5">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm font-semibold text-ink">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-leaf-600" />
                  {tr(s)}
                </li>
              ))}
            </ul>
          </motion.section>
          <motion.section {...item(2)} className="rounded-3xl bg-coral-50 p-5">
            <SectionTitle n={3} icon={Lightbulb} title={t('reports.attention')} tone="text-coral-700" />
            {report.attention.length ? (
              <ul className="space-y-2.5">
                {report.attention.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-sm font-semibold text-ink">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-coral-600" />
                    {tr(s)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t('reports.noAttention')}</p>
            )}
          </motion.section>
        </div>

        <motion.section {...item(3)}>
          <SectionTitle n={4} icon={Home} title={t('reports.homeActivities')} />
          <ol className="grid gap-3 md:grid-cols-3">
            {report.homeActivities.map((a, i) => (
              <li key={i} className="relative rounded-3xl border border-line bg-white p-5 pt-6">
                <span className={cn('absolute -top-3 left-5 grid size-8 place-items-center rounded-full text-sm font-black text-white', ['bg-cobalt-500', 'bg-violet-500', 'bg-turquoise-500'][i])}>{i + 1}</span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{t(`${a.key}Title`)}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink">{tr(a)}</p>
              </li>
            ))}
          </ol>
        </motion.section>

        <motion.section {...item(4)}>
          <SectionTitle n={5} icon={Play} title={t('reports.nextLessons')} />
          <div className="flex flex-wrap gap-2">
            {report.nextLessons.map((slug) => {
              const type = getLesson(slug) ? 'lesson' : getGame(slug) ? 'game' : null;
              if (!type) return null;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => enterChild(`/child/${type}/${slug}`)}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-cobalt-300 hover:bg-cobalt-50"
                >
                  {l(activityTitle(slug))}
                  <ArrowRight className="size-4 text-cobalt-600 transition-transform group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.section {...item(5)}>
          <SectionTitle n={6} icon={Stethoscope} title={t('reports.consultation')} />
          {report.consultation ? (
            <div className="flex flex-col gap-4 rounded-3xl border border-sun-300 bg-sun-50 p-5 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm font-semibold text-ink">{tr(report.consultation)}</p>
              <Button variant="dark" icon={<UsersRound className="size-4" />} onClick={() => navigate('/parent/marketplace')}>
                {t('dashboard.browseSpecialists')}
              </Button>
            </div>
          ) : (
            <p className="flex items-center gap-2 rounded-3xl bg-canvas p-5 text-sm font-semibold text-muted">
              <ShieldCheck className="size-5 text-leaf-600" />
              {t('reports.noConsultation')}
            </p>
          )}
        </motion.section>

        <footer className="flex gap-2.5 rounded-2xl bg-canvas p-4 text-xs text-muted">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            {t('reports.disclaimer')} <Heart className="inline size-3 text-coral-500" />
          </p>
        </footer>
      </div>
    </motion.article>
  );
}

function SectionTitle({ n, icon: Icon, title, tone = 'text-ink' }: { n: number; icon: typeof FileText; title: string; tone?: string }) {
  return (
    <h3 className={cn('mb-3 flex items-center gap-2.5 text-base font-extrabold', tone)}>
      <span className="grid size-7 place-items-center rounded-lg bg-white text-xs font-black text-muted ring-1 ring-line">{n}</span>
      <Icon className="size-4" />
      {title}
    </h3>
  );
}
