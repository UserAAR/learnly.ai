import { useMemo } from 'react';
import { useStore } from '@/store/AppStore';
import { CORE_SKILLS } from '@/types';
import {
  computeMetrics,
  consultationFlag,
  dailySeries,
  sessionsInWindow,
  skillSummaries,
  starsFor,
  weeklyComparison,
} from '@/lib/learning-metrics';

/** All derived learning data for the selected (or given) child, from the shared mock state. */
export function useChildData(childId?: string) {
  const { data, selectedChild } = useStore();
  const id = childId ?? selectedChild.id;
  return useMemo(() => {
    const child = data.children.find((c) => c.id === id) ?? selectedChild;
    const sessions = data.sessions.filter((s) => s.childId === id).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
    const observations = data.observations.filter((o) => o.childId === id).sort((a, b) => b.date.localeCompare(a.date));
    const reports = data.reports.filter((r) => r.childId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const requests = data.requests.filter((r) => r.childId === id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const period = sessionsInWindow(sessions, 13, 0);
    return {
      child,
      sessions,
      observations,
      reports,
      requests,
      progress: data.progress[id] ?? {},
      metrics: computeMetrics(period),
      allTime: computeMetrics(sessions),
      weekly: weeklyComparison(sessions),
      skills: skillSummaries(sessions, CORE_SKILLS),
      gameSkills: skillSummaries(sessions, ['sequencing', 'attention']),
      series: dailySeries(sessions, 14),
      flag: consultationFlag(sessions, observations, CORE_SKILLS),
      stars: starsFor(sessions),
    };
  }, [data, id, selectedChild]);
}
