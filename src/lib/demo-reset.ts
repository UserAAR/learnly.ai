import type { AppData, ChildProfile } from '@/types';
import { AYLIN_ID, createAylin } from '@/mocks/children';
import { generateDemoHistory } from '@/mocks/learning-history';
import { createDemoObservations } from '@/mocks/observations';
import { createDemoRequests } from '@/mocks/requests';
import { generateReport } from './report-generator';
import { daysAgo, diffDays, shiftIso, shiftKey, todayKey } from './dates';

export const DATA_VERSION = 2;

export function createInitialData(): AppData {
  const aylin = createAylin();
  const sessions = generateDemoHistory(AYLIN_ID);
  const observations = createDemoObservations(AYLIN_ID);
  const reports = [
    generateReport(aylin, sessions, observations, daysAgo(1, 19, 30), true),
    generateReport(aylin, sessions, observations, daysAgo(7, 20, 10), true),
  ];
  return {
    version: DATA_VERSION,
    seededOn: todayKey(),
    children: [aylin],
    selectedChildId: AYLIN_ID,
    sessions,
    progress: {},
    observations,
    reports,
    requests: createDemoRequests(),
  };
}

/** Restore only the learning history for one child (keeps profile, requests, etc.). */
export function demoHistoryFor(child: ChildProfile) {
  return generateDemoHistory(child.id, child.id === AYLIN_ID ? 2026 : hash(child.id));
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Demo records are stored with absolute dates. When the app is opened on a later day,
 * shift synthetic (demo-flagged) records forward so the 14-day history still looks current.
 * Records created by the user are never moved.
 */
export function rebaseDemoDates(data: AppData): AppData {
  const today = todayKey();
  if (!data.seededOn || data.seededOn === today) return data;
  const delta = diffDays(data.seededOn, today);
  if (delta <= 0) return { ...data, seededOn: today };

  const now = Date.now();
  const shift = (iso: string) => {
    const shifted = shiftIso(iso, delta);
    return shifted && new Date(shifted).getTime() > now ? new Date(now).toISOString() : shifted;
  };
  const userObsKeys = new Set(data.observations.filter((o) => !o.demo).map((o) => `${o.childId}:${o.date}`));
  return {
    ...data,
    seededOn: today,
    children: data.children.map((c) =>
      c.demo
        ? {
            ...c,
            medicalHistory: c.medicalHistory.map((m) =>
              m.id.startsWith('med-') ? { ...m, date: shiftKey(m.date, delta), nextAppointment: shiftKey(m.nextAppointment, delta) } : m,
            ),
          }
        : c,
    ),
    sessions: data.sessions.map((s) => (s.demo ? { ...s, startedAt: shift(s.startedAt), completedAt: shift(s.completedAt) } : s)),
    observations: data.observations
      .map((o) => (o.demo ? { ...o, date: shiftKey(o.date, delta), updatedAt: shift(o.updatedAt) } : o))
      .filter((o) => !(o.demo && userObsKeys.has(`${o.childId}:${o.date}`)))
      .filter((o) => o.date <= today),
    reports: data.reports.map((r) => (r.demo ? { ...r, createdAt: shift(r.createdAt) } : r)),
    requests: data.requests.map((r) =>
      r.demo
        ? {
            ...r,
            createdAt: shift(r.createdAt),
            updatedAt: shift(r.updatedAt),
            consentAt: shift(r.consentAt),
            history: r.history.map((h) => ({ ...h, at: shift(h.at) })),
          }
        : r,
    ),
  };
}
