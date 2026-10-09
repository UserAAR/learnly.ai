import { useMemo } from 'react';
import { useStore } from '@/store/AppStore';
import { createExternalChildren } from '@/mocks/children';
import { DEMO_SPECIALIST_ID, getSpecialist } from '@/mocks/specialists';
import { computeMetrics, sessionsInWindow, skillSummaries, weeklyComparison } from '@/lib/learning-metrics';
import type { ChildProfile, ReportMetricsSnapshot, RequestStatus, SpecialistRequest } from '@/types';
import { CORE_SKILLS } from '@/types';

const EXTERNAL = createExternalChildren();

export interface TeacherCase {
  request: SpecialistRequest;
  child: ChildProfile | null;
  snapshot: ReportMetricsSnapshot | null;
  skills: ReturnType<typeof skillSummaries> | null;
}

export const CLOSED: RequestStatus[] = ['rejected', 'canceled', 'revoked', 'closed'];

/** Requests addressed to the signed-in specialist, joined with the shared mock child data. */
export function useTeacherData() {
  const { data, user } = useStore();
  const specialistId = user?.role === 'specialist' ? user.specialistId : DEMO_SPECIALIST_ID;
  const specialist = getSpecialist(specialistId)!;

  const cases = useMemo<TeacherCase[]>(() => {
    return data.requests
      .filter((r) => r.specialistId === specialistId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((request) => {
        const own = data.children.find((c) => c.id === request.childId);
        if (own) {
          const sessions = data.sessions.filter((s) => s.childId === own.id);
          const m = computeMetrics(sessionsInWindow(sessions, 13, 0));
          return {
            request,
            child: own,
            snapshot: {
              firstTry: m.firstTry ?? 0,
              completion: m.completion ?? 0,
              difficult: m.difficult ?? 0,
              avgResponseSec: m.avgResponseSec ?? 0,
              sessions: m.sessions,
              trendDelta: weeklyComparison(sessions).delta,
            },
            skills: skillSummaries(sessions, CORE_SKILLS),
          };
        }
        const ext = EXTERNAL.find((e) => e.profile.id === request.childId);
        return { request, child: ext?.profile ?? null, snapshot: ext?.snapshot ?? null, skills: null };
      });
  }, [data.requests, data.children, data.sessions, specialistId]);

  return {
    specialist,
    cases,
    pending: cases.filter((c) => c.request.status === 'pending'),
    accepted: cases.filter((c) => c.request.status === 'accepted'),
    rejected: cases.filter((c) => c.request.status === 'rejected'),
    closed: cases.filter((c) => ['canceled', 'revoked', 'closed'].includes(c.request.status)),
  };
}
