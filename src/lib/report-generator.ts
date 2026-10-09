/**
 * Deterministic "AI-style" demo report generator.
 * No network calls, no model — it combines the shared learning metrics, the child's
 * sensory profile and interests into structured, translatable report items.
 */
import type { ChildProfile, DailyObservation, LearningReport, LearningSession, ReportItem, Skill } from '@/types';
import { CORE_SKILLS } from '@/types';
import { computeMetrics, consultationFlag, sessionsInWindow, skillSummaries, weeklyComparison } from './learning-metrics';
import { uid } from './random';

const SKILL_LESSON: Record<Skill, string> = {
  hygiene: 'handwashing',
  safety: 'road-safety',
  emotions: 'emotions',
  sequencing: 'my-day',
  attention: 'odd-one-out',
};

const ALL_SKILLS: Skill[] = ['hygiene', 'safety', 'emotions', 'sequencing', 'attention'];

const t = (key: string) => `t:${key}`;

function interestParam(child: ChildProfile, index = 0): string {
  const first = child.interests[index] ?? child.interests[0];
  if (!first) return t('reportGen.defaultInterest');
  return /^[a-z_]+$/.test(first) ? `tl:tags.interests.${first}` : first;
}

export function generateReport(
  child: ChildProfile,
  sessions: LearningSession[],
  observations: DailyObservation[],
  asOf: Date = new Date(),
  demo = false,
): LearningReport {
  const childSessions = sessions.filter((s) => s.childId === child.id && new Date(s.completedAt) <= asOf);
  const childObs = observations.filter((o) => o.childId === child.id);
  const period = sessionsInWindow(childSessions, 13, 0, asOf);
  const metrics = computeMetrics(period);
  const weekly = weeklyComparison(childSessions, asOf);
  const skills = skillSummaries(childSessions, ALL_SKILLS, asOf).filter((s) => s.overall.totalSteps > 0);
  const flag = consultationFlag(childSessions, childObs, CORE_SKILLS, asOf);

  const name = child.name;
  const summary: ReportItem[] = [];
  const strengths: ReportItem[] = [];
  const attention: ReportItem[] = [];

  if (metrics.totalSteps === 0) {
    summary.push({ key: 'reportGen.summary.noData', params: { name } });
  } else {
    summary.push({
      key: 'reportGen.summary.overview',
      params: { name, sessions: metrics.sessions, firstTry: metrics.firstTry ?? 0, completion: metrics.completion ?? 0 },
    });
    if (weekly.trend === 'up') summary.push({ key: 'reportGen.summary.trendUp', params: { delta: weekly.delta ?? 0 } });
    else if (weekly.trend === 'down') summary.push({ key: 'reportGen.summary.trendDown', params: { delta: Math.abs(weekly.delta ?? 0) } });
    else if (weekly.trend === 'flat') summary.push({ key: 'reportGen.summary.trendFlat', params: { delta: weekly.delta ?? 0 } });
  }

  // Strengths: improving or consistently strong skills, then completion and persistence.
  const improving = skills.filter((s) => s.trend === 'up').sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
  improving.forEach((s) => strengths.push({ key: 'reportGen.strength.improving', params: { skill: t(`skills.${s.skill}`), delta: s.delta ?? 0 } }));
  skills
    .filter((s) => s.trend !== 'up' && (s.current.firstTry ?? 0) >= 70)
    .forEach((s) => strengths.push({ key: 'reportGen.strength.steady', params: { skill: t(`skills.${s.skill}`), value: s.current.firstTry ?? 0 } }));
  if ((metrics.completion ?? 0) >= 85) strengths.push({ key: 'reportGen.strength.completion', params: { value: metrics.completion ?? 0 } });
  if ((metrics.hintRate ?? 0) >= 15) strengths.push({ key: 'reportGen.strength.asksHelp' });
  if (strengths.length === 0 && metrics.sessions > 0) strengths.push({ key: 'reportGen.strength.engaged', params: { sessions: metrics.sessions } });

  // Areas for attention: declines, heavy hint use, slow steps.
  const declining = skills.filter((s) => s.trend === 'down').sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0));
  declining.forEach((s) => attention.push({ key: 'reportGen.attention.decline', params: { skill: t(`skills.${s.skill}`), delta: Math.abs(s.delta ?? 0) } }));
  skills
    .filter((s) => (s.overall.hintRate ?? 0) >= 30)
    .sort((a, b) => (b.overall.hintRate ?? 0) - (a.overall.hintRate ?? 0))
    .forEach((s) => attention.push({ key: 'reportGen.attention.hints', params: { skill: t(`skills.${s.skill}`), value: s.overall.hintRate ?? 0 } }));
  if ((metrics.difficult ?? 0) >= 25) attention.push({ key: 'reportGen.attention.difficult', params: { value: metrics.difficult ?? 0 } });

  // Exactly three home activities, prioritised by areas needing attention.
  const needSkills = [
    ...declining.map((s) => s.skill),
    ...skills.filter((s) => (s.overall.hintRate ?? 0) >= 30).map((s) => s.skill),
    ...skills.slice().sort((a, b) => (a.overall.firstTry ?? 100) - (b.overall.firstTry ?? 100)).map((s) => s.skill),
    ...ALL_SKILLS,
  ];
  const interest = interestParam(child, 0);
  const soundSensitive = child.sensory.sound === 'high';
  const pool: Record<Skill, ReportItem> = {
    safety: { key: 'reportGen.home.safety', params: { interest } },
    emotions: { key: 'reportGen.home.emotions', params: { interest: interestParam(child, 1) } },
    hygiene: { key: soundSensitive ? 'reportGen.home.hygieneQuiet' : 'reportGen.home.hygiene' },
    sequencing: { key: 'reportGen.home.sequencing' },
    attention: { key: 'reportGen.home.attention', params: { interest: interestParam(child, 2) } },
  };
  const chosen: ReportItem[] = [];
  const usedSkills = new Set<Skill>();
  for (const s of needSkills) {
    if (chosen.length === 3) break;
    if (usedSkills.has(s)) continue;
    usedSkills.add(s);
    chosen.push(pool[s]);
  }
  if (soundSensitive && chosen.length === 3 && !chosen.some((c) => c.key === 'reportGen.home.hygieneQuiet')) {
    // keep the list at exactly three but swap the last for a sensory-friendly routine
    chosen[2] = { key: 'reportGen.home.calmCorner' };
  }

  // Next lessons: lowest first-attempt accuracy first, then untried activities.
  const tried = new Set(skills.map((s) => s.skill));
  const nextLessons = [
    ...skills.slice().sort((a, b) => (a.current.firstTry ?? a.overall.firstTry ?? 100) - (b.current.firstTry ?? b.overall.firstTry ?? 100)).map((s) => SKILL_LESSON[s.skill]),
    ...ALL_SKILLS.filter((s) => !tried.has(s)).map((s) => SKILL_LESSON[s]),
  ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 3);

  let consultation: ReportItem | null = null;
  if (flag.declines.length > 0) {
    const worst = flag.declines.sort((a, b) => a.delta - b.delta)[0];
    consultation = { key: 'reportGen.consult.decline', params: { skill: t(`skills.${worst.skill}`), delta: Math.abs(worst.delta) } };
  } else if (flag.crisesThisWeek >= 3) {
    consultation = { key: 'reportGen.consult.crises', params: { count: flag.crisesThisWeek } };
  }

  return {
    id: demo ? `demo-r-${asOf.getTime()}` : uid('report'),
    childId: child.id,
    createdAt: asOf.toISOString(),
    periodDays: 14,
    metrics: {
      firstTry: metrics.firstTry ?? 0,
      completion: metrics.completion ?? 0,
      difficult: metrics.difficult ?? 0,
      avgResponseSec: metrics.avgResponseSec ?? 0,
      sessions: metrics.sessions,
      trendDelta: weekly.delta,
    },
    summary,
    strengths: strengths.slice(0, 3),
    attention: attention.slice(0, 3),
    homeActivities: [chosen[0], chosen[1], chosen[2]],
    nextLessons,
    consultation,
    demo,
  };
}
