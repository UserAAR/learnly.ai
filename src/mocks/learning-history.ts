import type { LearningSession, Skill, StepAttempt } from '@/types';
import { LESSONS } from './lessons';
import { ODD_ROUNDS, ROUTINE_ROUNDS } from './games';
import { daysAgo } from '@/lib/dates';
import { createRng } from '@/lib/random';

/** Which activities happen on each of the 14 demo days (index 0 = 13 days ago). Empty = rest day. */
const SCHEDULE: string[][] = [
  ['handwashing', 'emotions'],
  ['road-safety'],
  ['handwashing', 'my-day'],
  ['emotions', 'odd-one-out'],
  ['road-safety', 'handwashing'],
  ['my-day'],
  ['emotions', 'road-safety'],
  ['handwashing', 'my-day'],
  ['road-safety', 'emotions'],
  ['handwashing', 'odd-one-out'],
  ['emotions', 'road-safety'],
  [],
  ['handwashing', 'road-safety', 'my-day'],
  [],
];

/**
 * Demo learning profile (fictional):
 *  - hygiene improves clearly,
 *  - road safety declines and needs more practice,
 *  - emotions stay steady but rely on hints and repeated attempts.
 */
const PROFILE: Record<Skill, { from: number; to: number; hint: number; unresolved: number }> = {
  hygiene: { from: 0.42, to: 0.86, hint: 0.25, unresolved: 0.06 },
  safety: { from: 0.95, to: 0.3, hint: 0.3, unresolved: 0.12 },
  emotions: { from: 0.5, to: 0.48, hint: 0.95, unresolved: 0.1 },
  sequencing: { from: 0.45, to: 0.8, hint: 0.3, unresolved: 0.05 },
  attention: { from: 0.68, to: 0.78, hint: 0.2, unresolved: 0.04 },
};

function activityMeta(slug: string): { type: 'lesson' | 'game'; skill: Skill; stepIds: string[] } {
  const lesson = LESSONS.find((l) => l.slug === slug);
  if (lesson) {
    return { type: 'lesson', skill: lesson.skill, stepIds: lesson.steps.filter((s) => s.kind !== 'info').map((s) => s.id) };
  }
  if (slug === 'my-day') return { type: 'game', skill: 'sequencing', stepIds: ROUTINE_ROUNDS.map((r) => r.id) };
  return { type: 'game', skill: 'attention', stepIds: ODD_ROUNDS.map((r) => r.id) };
}

export function generateDemoHistory(childId: string, seed = 2026): LearningSession[] {
  const rng = createRng(seed);
  const sessions: LearningSession[] = [];

  SCHEDULE.forEach((slugs, dayIndex) => {
    const offset = 13 - dayIndex;
    slugs.forEach((slug, i) => {
      const meta = activityMeta(slug);
      const p = PROFILE[meta.skill];
      const progress = dayIndex / 13;
      const target = p.from + (p.to - p.from) * progress;
      const n = meta.stepIds.length;
      // Quota-based so weekly trends are stable instead of noisy.
      const firstTryCount = Math.max(0, Math.min(n, Math.round(target * n + (rng.next() - 0.5) * 0.8)));
      const order = meta.stepIds.map((id) => ({ id, r: rng.next() })).sort((a, b) => a.r - b.r);
      const firstTrySet = new Set(order.slice(0, firstTryCount).map((o) => o.id));

      const steps: StepAttempt[] = meta.stepIds.map((stepId) => {
        if (firstTrySet.has(stepId)) {
          return { stepId, skill: meta.skill, attempts: 1, hintUsed: false, resolved: true, responseMs: rng.int(4, 12) * 1000 + rng.int(0, 900) };
        }
        const hintUsed = rng.chance(p.hint);
        const unresolved = rng.chance(p.unresolved);
        const attempts = unresolved ? 3 : rng.chance(0.35) ? 3 : hintUsed ? rng.int(1, 2) : 2;
        return {
          stepId,
          skill: meta.skill,
          attempts,
          hintUsed: hintUsed || (attempts === 1),
          resolved: !unresolved,
          responseMs: rng.int(9, 27) * 1000 + rng.int(0, 900),
        };
      });

      const start = daysAgo(offset, 10 + i * 4, rng.int(0, 50));
      const totalMs = steps.reduce((sum, s) => sum + s.responseMs, 0) + 60_000;
      sessions.push({
        id: `demo-s-${dayIndex}-${i}`,
        childId,
        activityType: meta.type,
        activitySlug: slug,
        skill: meta.skill,
        startedAt: start.toISOString(),
        completedAt: new Date(start.getTime() + totalMs).toISOString(),
        completed: true,
        steps,
        demo: true,
      });
    });
  });

  return sessions;
}
