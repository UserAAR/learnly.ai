/**
 * Centralised demo learning metrics. Every screen (dashboard, charts, reports, specialist view)
 * reads statistics from here so numbers stay consistent.
 *
 * These are product-demonstration rules, not clinical thresholds or diagnoses.
 */
import type { DailyObservation, LearningSession, Skill, StepAttempt } from '@/types';
import { startOfDay, toDateKey } from './dates';

export const DIFFICULT_MS = 20_000;
export const MAX_ATTEMPTS = 3;
export const MEANINGFUL_DELTA = 10; // percentage points
export const CONSULT_DECLINE = 20; // percentage points
export const CONSULT_CRISES = 3; // per week

export interface Metrics {
  totalSteps: number;
  firstTry: number | null; // %
  completion: number | null; // %
  difficult: number | null; // %
  hintRate: number | null; // %
  avgResponseSec: number | null;
  sessions: number;
  completedSessions: number;
}

export type Trend = 'up' | 'down' | 'flat' | 'na';

export function isFirstTry(s: StepAttempt): boolean {
  return s.attempts === 1 && s.resolved && !s.hintUsed;
}

export function isDifficult(s: StepAttempt): boolean {
  return s.responseMs > DIFFICULT_MS || s.attempts >= MAX_ATTEMPTS;
}

const pct = (n: number, d: number) => (d === 0 ? null : Math.round((n / d) * 100));

export function computeMetrics(sessions: LearningSession[]): Metrics {
  const steps = sessions.flatMap((s) => s.steps);
  const total = steps.length;
  return {
    totalSteps: total,
    firstTry: pct(steps.filter(isFirstTry).length, total),
    completion: pct(steps.filter((s) => s.resolved && s.attempts <= MAX_ATTEMPTS).length, total),
    difficult: pct(steps.filter(isDifficult).length, total),
    hintRate: pct(steps.filter((s) => s.hintUsed).length, total),
    avgResponseSec: total === 0 ? null : Math.round((steps.reduce((a, s) => a + s.responseMs, 0) / total / 1000) * 10) / 10,
    sessions: sessions.length,
    completedSessions: sessions.filter((s) => s.completed).length,
  };
}

/** Sessions within [asOf - (fromDaysAgo), asOf - (toDaysAgo)] inclusive by calendar day. */
export function sessionsInWindow(sessions: LearningSession[], fromDaysAgo: number, toDaysAgo: number, asOf: Date = new Date()): LearningSession[] {
  const end = startOfDay(asOf);
  end.setDate(end.getDate() - toDaysAgo + 1);
  const start = startOfDay(asOf);
  start.setDate(start.getDate() - fromDaysAgo);
  return sessions.filter((s) => {
    const t = new Date(s.completedAt).getTime();
    return t >= start.getTime() && t < end.getTime();
  });
}

export function filterSkill(sessions: LearningSession[], skill: Skill): LearningSession[] {
  return sessions.map((s) => ({ ...s, steps: s.steps.filter((st) => st.skill === skill) })).filter((s) => s.steps.length > 0);
}

export function trendOf(delta: number | null): Trend {
  if (delta === null) return 'na';
  if (delta >= MEANINGFUL_DELTA) return 'up';
  if (delta <= -MEANINGFUL_DELTA) return 'down';
  return 'flat';
}

export interface WeeklyComparison {
  current: Metrics;
  previous: Metrics;
  delta: number | null;
  trend: Trend;
}

/** Latest seven days (incl. today) vs. the preceding seven days, by first-attempt accuracy. */
export function weeklyComparison(sessions: LearningSession[], asOf: Date = new Date()): WeeklyComparison {
  const current = computeMetrics(sessionsInWindow(sessions, 6, 0, asOf));
  const previous = computeMetrics(sessionsInWindow(sessions, 13, 7, asOf));
  const delta = current.firstTry !== null && previous.firstTry !== null ? current.firstTry - previous.firstTry : null;
  return { current, previous, delta, trend: trendOf(delta) };
}

export interface SkillSummary extends WeeklyComparison {
  skill: Skill;
  overall: Metrics;
}

export function skillSummaries(sessions: LearningSession[], skills: Skill[], asOf: Date = new Date()): SkillSummary[] {
  return skills.map((skill) => {
    const scoped = filterSkill(sessions, skill);
    return { skill, overall: computeMetrics(sessionsInWindow(scoped, 13, 0, asOf)), ...weeklyComparison(scoped, asOf) };
  });
}

export interface DailyPoint {
  date: string;
  firstTry: number | null;
  completion: number | null;
  difficult: number | null;
  sessions: number;
  steps: number;
}

export function dailySeries(sessions: LearningSession[], days = 14, asOf: Date = new Date()): DailyPoint[] {
  const out: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(asOf);
    day.setDate(day.getDate() - i);
    const key = toDateKey(day);
    const daySessions = sessions.filter((s) => toDateKey(new Date(s.completedAt)) === key);
    const m = computeMetrics(daySessions);
    out.push({ date: key, firstTry: m.firstTry, completion: m.completion, difficult: m.difficult, sessions: daySessions.length, steps: m.totalSteps });
  }
  return out;
}

export interface ConsultationFlag {
  active: boolean;
  declines: { skill: Skill; delta: number }[];
  crisesThisWeek: number;
}

export function crisesInLastWeek(observations: DailyObservation[], asOf: Date = new Date()): number {
  const start = startOfDay(asOf);
  start.setDate(start.getDate() - 6);
  const startKey = toDateKey(start);
  const endKey = toDateKey(asOf);
  return observations.filter((o) => o.crisis && o.date >= startKey && o.date <= endKey).length;
}

export function consultationFlag(sessions: LearningSession[], observations: DailyObservation[], skills: Skill[], asOf: Date = new Date()): ConsultationFlag {
  const declines = skillSummaries(sessions, skills, asOf)
    .filter((s) => s.delta !== null && s.delta < -CONSULT_DECLINE)
    .map((s) => ({ skill: s.skill, delta: s.delta as number }));
  const crisesThisWeek = crisesInLastWeek(observations, asOf);
  return { active: declines.length > 0 || crisesThisWeek >= CONSULT_CRISES, declines, crisesThisWeek };
}

/** One star per resolved step: a calm, non-competitive progress signal for the child. */
export function starsFor(sessions: LearningSession[]): number {
  return sessions.reduce((sum, s) => sum + s.steps.filter((st) => st.resolved).length, 0);
}

export function sessionResult(s: LearningSession) {
  return computeMetrics([s]);
}
