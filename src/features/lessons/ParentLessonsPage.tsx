import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Gamepad2, Lightbulb, ListChecks, Play, Sparkles, Target } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { useChildData } from '@/hooks/useChildData';
import { useEnterChildMode } from '@/layouts/ParentLayout';
import { computeMetrics, isDifficult } from '@/lib/learning-metrics';
import { formatDateTime } from '@/lib/dates';
import { cn } from '@/lib/cn';
import { LESSONS, questionCount } from '@/mocks/lessons';
import { GAMES, ODD_ROUNDS, ROUTINE_ROUNDS } from '@/mocks/games';
import { EmotionsArt, HygieneArt, OddArt, RoutineArt, SafetyArt } from '@/components/illustrations/World';
import { Badge, Button, Card, PageHeader, ProgressBar, SectionHeader, Segmented } from '@/components/ui';
import { SKILL_META, activityTitle, pctText } from '@/features/shared';
import type { Skill } from '@/types';

const ART = { handwashing: HygieneArt, 'road-safety': SafetyArt, emotions: EmotionsArt, 'my-day': RoutineArt, 'odd-one-out': OddArt } as const;

export default function ParentLessonsPage() {
  const { t, l, lang } = useLang();
  const d = useChildData();
  const enterChild = useEnterChildMode();
  const [filter, setFilter] = useState<'all' | Skill>('all');

  const catalog = [
    ...LESSONS.map((x) => ({ slug: x.slug, type: 'lesson' as const, title: x.title, subtitle: x.subtitle, goal: x.goal, skill: x.skill, minutes: x.minutes, steps: questionCount(x) })),
    ...GAMES.map((g) => ({ slug: g.slug, type: 'game' as const, title: g.title, subtitle: g.subtitle, goal: g.instructions, skill: g.skill, minutes: g.minutes, steps: g.slug === 'my-day' ? ROUTINE_ROUNDS.length : ODD_ROUNDS.length })),
  ];

  const history = useMemo(() => (filter === 'all' ? d.sessions : d.sessions.filter((s) => s.skill === filter)), [d.sessions, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('lessonsPage.eyebrow')}
        title={t('lessonsPage.title')}
        subtitle={t('lessonsPage.subtitle', { name: d.child.name })}
        action={
          <Button variant="sun" icon={<Sparkles className="size-4" />} onClick={() => enterChild()}>
            {t('dashboard.enterChildMode')}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {catalog.map((a) => {
          const Art = ART[a.slug as keyof typeof ART];
          const sessions = d.sessions.filter((s) => s.activitySlug === a.slug);
          const m = computeMetrics(sessions);
          const prog = d.progress[a.slug];
          const meta = SKILL_META[a.skill];
          return (
            <Card key={a.slug} as="article" className="flex flex-col overflow-hidden">
              <div className="relative h-36 overflow-hidden">
                <Art />
                <span className="absolute left-3 top-3">
                  <Badge tone={a.type === 'game' ? 'coral' : 'navy'} icon={a.type === 'game' ? <Gamepad2 className="size-3" /> : <ListChecks className="size-3" />}>
                    {t(a.type === 'game' ? 'common.game' : 'common.lesson')}
                  </Badge>
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-extrabold text-ink">{l(a.title)}</h3>
                  <Badge tone={meta.tone}>{t(`skills.${a.skill}`)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{l(a.goal)}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-muted">
                  <span className="flex items-center gap-1">
                    <Clock3 className="size-3.5" /> {t('child.minutes', { count: a.minutes })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="size-3.5" /> {t('lessonsPage.steps', { count: a.steps })}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> {t('lessonsPage.times', { count: sessions.length })}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { k: 'metrics.firstTryShort', v: pctText(m.firstTry) },
                    { k: 'metrics.completionShort', v: pctText(m.completion) },
                    { k: 'metrics.hintsShort', v: pctText(m.hintRate) },
                  ].map((x) => (
                    <div key={x.k} className="rounded-xl bg-canvas py-2">
                      <p className="text-sm font-extrabold tabular-nums text-ink">{x.v}</p>
                      <p className="text-[11px] font-semibold text-muted">{t(x.k)}</p>
                    </div>
                  ))}
                </div>
                {prog && (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs font-bold">
                      <span className="text-sun-700">{t('common.inProgress')}</span>
                      <span className="text-muted">{t('lessonsPage.stepN', { step: prog.stepIndex + 1, total: a.type === 'lesson' ? LESSONS.find((x) => x.slug === a.slug)!.steps.length : a.steps })}</span>
                    </div>
                    <ProgressBar value={((prog.stepIndex + 1) / (a.type === 'lesson' ? LESSONS.find((x) => x.slug === a.slug)!.steps.length : a.steps)) * 100} color="bg-sun-400" />
                  </div>
                )}
                <div className="mt-auto pt-5">
                  <Button className="w-full" variant={prog ? 'sun' : 'primary'} icon={<Play className="size-4" />} onClick={() => enterChild(`/child/${a.type}/${a.slug}`)}>
                    {prog ? t('lessonsPage.continueInChild') : t('lessonsPage.openInChild')}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 sm:p-6">
        <SectionHeader
          title={t('lessonsPage.historyTitle')}
          subtitle={t('lessonsPage.historySubtitle')}
          className="mb-4"
          action={
            <Segmented
              size="sm"
              label={t('lessonsPage.filter')}
              value={filter}
              onChange={setFilter}
              options={[{ value: 'all', label: t('common.all') }, ...(['hygiene', 'safety', 'emotions', 'sequencing', 'attention'] as Skill[]).map((s) => ({ value: s, label: t(`skills.${s}`) }))]}
            />
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-line">
                <th className="py-2.5 pr-3 font-bold">{t('lessonsPage.colActivity')}</th>
                <th className="px-3 py-2.5 font-bold">{t('lessonsPage.colDate')}</th>
                <th className="px-3 py-2.5 text-right font-bold">{t('metrics.firstTryShort')}</th>
                <th className="px-3 py-2.5 text-right font-bold">{t('lessonsPage.colAttempts')}</th>
                <th className="px-3 py-2.5 text-right font-bold">{t('metrics.hintsShort')}</th>
                <th className="px-3 py-2.5 text-right font-bold">{t('metrics.difficultShort')}</th>
                <th className="py-2.5 pl-3 text-right font-bold">{t('lessonsPage.colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 30).map((s) => {
                const m = computeMetrics([s]);
                const meta = SKILL_META[s.skill];
                return (
                  <tr key={s.id} className="border-b border-line/70 last:border-0">
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2.5 font-bold text-ink">
                        <span className={cn('grid size-8 place-items-center rounded-xl', meta.soft)} style={{ color: meta.color }}>
                          <meta.icon className="size-4" />
                        </span>
                        {l(activityTitle(s.activitySlug))}
                        {s.demo && <span className="text-[10px] font-extrabold uppercase text-sun-700">demo</span>}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">{formatDateTime(s.completedAt, lang)}</td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums">{pctText(m.firstTry)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.steps.reduce((a, x) => a + x.attempts, 0)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        {s.steps.some((x) => x.hintUsed) && <Lightbulb className="size-3.5 text-sun-700" />}
                        {s.steps.filter((x) => x.hintUsed).length}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.steps.filter(isDifficult).length}</td>
                    <td className="py-3 pl-3 text-right">
                      <Badge tone="leaf">{t('common.completed')}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {history.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('lessonsPage.noHistory')}</p>}
        </div>
      </Card>
    </div>
  );
}
