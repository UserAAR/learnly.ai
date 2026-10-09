/**
 * Validation for everything Learnly restores from localStorage.
 *
 * Stored values can be missing, written by an older build, edited by hand or partially corrupted.
 * Each sanitizer keeps every valid piece of data, repairs what can be repaired with defaults and
 * drops only the entries that cannot be used — so a bad record never crashes rendering.
 */
import type {
  AppData,
  AuthSession,
  ChildProfile,
  DailyObservation,
  InProgressActivity,
  Lang,
  LearningReport,
  LearningSession,
  MotionPref,
  Preferences,
  RequestStatus,
  SpecialistRequest,
  StepAttempt,
} from '@/types';
import { LANGS } from '@/types';
import { emptyChild } from '@/mocks/children';
import { getLesson } from '@/mocks/lessons';
import { getGame } from '@/mocks/games';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const bool = (v: unknown, fallback = false): boolean => (typeof v === 'boolean' ? v : fallback);
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const isIsoDate = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(new Date(v).getTime());
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback);

function warn(message: string) {
  if (import.meta.env.DEV) console.warn(`[learnly:storage] ${message}`);
}

/* ───────────────────────── Preferences, auth, child mode ───────────────────────── */

export const DEFAULT_PREFS: Preferences = { language: 'az', soundEnabled: false, motion: 'system' };
const MOTION: MotionPref[] = ['system', 'reduce', 'full'];

export function sanitizePrefs(raw: unknown): Preferences {
  if (raw !== null && raw !== undefined && !isObj(raw)) warn('preferences were malformed and were reset');
  const p = isObj(raw) ? raw : {};
  return {
    language: oneOf<Lang>(p.language, LANGS, DEFAULT_PREFS.language),
    soundEnabled: bool(p.soundEnabled, DEFAULT_PREFS.soundEnabled),
    motion: oneOf(p.motion, MOTION, DEFAULT_PREFS.motion),
  };
}

export function sanitizeAuth(raw: unknown): AuthSession | null {
  if (!isObj(raw) || typeof raw.userId !== 'string' || (raw.role !== 'parent' && raw.role !== 'specialist')) {
    if (raw !== null && raw !== undefined) warn('stored session was malformed and was ignored');
    return null;
  }
  return { userId: raw.userId, role: raw.role, signedInAt: str(raw.signedInAt, new Date().toISOString()) };
}

export interface ChildModeState {
  active: boolean;
  childId: string | null;
}

export function sanitizeChildMode(raw: unknown): ChildModeState {
  if (!isObj(raw)) return { active: false, childId: null };
  return { active: raw.active === true, childId: typeof raw.childId === 'string' ? raw.childId : null };
}

/* ───────────────────────── App data ───────────────────────── */

const SENSITIVITY = ['low', 'medium', 'high'] as const;
const STATUSES: RequestStatus[] = ['pending', 'accepted', 'rejected', 'canceled', 'revoked', 'closed'];
const SKILLS = ['hygiene', 'safety', 'emotions', 'sequencing', 'attention'] as const;

function activityExists(slug: unknown, type?: unknown): boolean {
  if (typeof slug !== 'string') return false;
  if (type === 'lesson') return !!getLesson(slug);
  if (type === 'game') return !!getGame(slug);
  return !!getLesson(slug) || !!getGame(slug);
}

function sanitizeChild(raw: unknown): ChildProfile | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || !raw.id) return null;
  const base = emptyChild(str(raw.parentId, 'u-parent'), raw.id);
  const avatar = isObj(raw.avatar) ? raw.avatar : {};
  const sensory = isObj(raw.sensory) ? raw.sensory : {};
  return {
    ...base,
    name: str(raw.name),
    birthDate: str(raw.birthDate),
    avatar: {
      skin: str(avatar.skin, base.avatar.skin),
      hair: str(avatar.hair, base.avatar.hair),
      hairStyle: oneOf(avatar.hairStyle, ['puffs', 'short', 'curly', 'bob', 'long'] as const, base.avatar.hairStyle),
      shirt: str(avatar.shirt, base.avatar.shirt),
      accent: str(avatar.accent, base.avatar.accent),
    },
    diagnosisStatus: oneOf(raw.diagnosisStatus, ['', 'confirmed', 'suspected', 'in_progress'] as const, ''),
    supportLevel: raw.supportLevel === 1 || raw.supportLevel === 2 || raw.supportLevel === 3 ? raw.supportLevel : null,
    icdCode: str(raw.icdCode),
    conditions: strArr(raw.conditions) as ChildProfile['conditions'],
    conditionsOther: str(raw.conditionsOther),
    medicalHistory: (Array.isArray(raw.medicalHistory) ? raw.medicalHistory : []).filter(isObj).map((m, i) => ({
      id: str(m.id, `med-restored-${i}`),
      date: str(m.date),
      doctor: str(m.doctor),
      specialty: str(m.specialty),
      institution: str(m.institution),
      diagnosis: str(m.diagnosis),
      notes: str(m.notes),
      recommendations: str(m.recommendations),
      nextAppointment: str(m.nextAppointment),
    })),
    chronicConditions: str(raw.chronicConditions),
    allergies: str(raw.allergies),
    medications: str(raw.medications),
    communicationLevel: oneOf(raw.communicationLevel, ['', 'verbal', 'phrases', 'single_words', 'nonverbal'] as const, ''),
    altCommunication: strArr(raw.altCommunication),
    sensory: {
      sound: oneOf(sensory.sound, SENSITIVITY, 'medium'),
      light: oneOf(sensory.light, SENSITIVITY, 'medium'),
      touch: oneOf(sensory.touch, SENSITIVITY, 'medium'),
    },
    interests: strArr(raw.interests),
    therapies: strArr(raw.therapies),
    reviewedSections: strArr(raw.reviewedSections) as ChildProfile['reviewedSections'],
    demo: bool(raw.demo),
  };
}

function sanitizeStep(raw: unknown): StepAttempt | null {
  if (!isObj(raw) || typeof raw.stepId !== 'string') return null;
  return {
    stepId: raw.stepId,
    skill: oneOf(raw.skill, SKILLS, 'attention'),
    attempts: Math.min(3, Math.max(1, Math.round(num(raw.attempts, 1)))),
    hintUsed: bool(raw.hintUsed),
    resolved: bool(raw.resolved),
    responseMs: Math.max(0, num(raw.responseMs)),
  };
}

const sanitizeSteps = (v: unknown): StepAttempt[] => (Array.isArray(v) ? v.map(sanitizeStep).filter((s): s is StepAttempt => !!s) : []);

function sanitizeSession(raw: unknown): LearningSession | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || typeof raw.childId !== 'string' || !isIsoDate(raw.completedAt)) return null;
  if (!activityExists(raw.activitySlug)) return null;
  return {
    id: raw.id,
    childId: raw.childId,
    activityType: raw.activityType === 'game' ? 'game' : 'lesson',
    activitySlug: raw.activitySlug as string,
    skill: oneOf(raw.skill, SKILLS, 'attention'),
    startedAt: isIsoDate(raw.startedAt) ? raw.startedAt : raw.completedAt,
    completedAt: raw.completedAt,
    completed: bool(raw.completed, true),
    steps: sanitizeSteps(raw.steps),
    demo: bool(raw.demo),
  };
}

function sanitizeProgress(raw: unknown, childIds: Set<string>): AppData['progress'] {
  const out: AppData['progress'] = {};
  if (!isObj(raw)) return out;
  for (const [childId, entries] of Object.entries(raw)) {
    if (!childIds.has(childId) || !isObj(entries)) continue;
    const clean: Record<string, InProgressActivity> = {};
    for (const [slug, p] of Object.entries(entries)) {
      if (!isObj(p) || !activityExists(slug, p.activityType)) continue;
      const updatedAt = isIsoDate(p.updatedAt) ? p.updatedAt : new Date(0).toISOString();
      clean[slug] = {
        slug,
        activityType: p.activityType === 'game' ? 'game' : 'lesson',
        stepIndex: Math.max(0, Math.floor(num(p.stepIndex))),
        steps: sanitizeSteps(p.steps),
        startedAt: isIsoDate(p.startedAt) ? p.startedAt : updatedAt,
        updatedAt,
      };
    }
    out[childId] = clean;
  }
  return out;
}

function sanitizeObservation(raw: unknown): DailyObservation | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || typeof raw.childId !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str(raw.date))) return null;
  const mood = Math.round(num(raw.mood, 3));
  return {
    id: raw.id,
    childId: raw.childId,
    date: raw.date as string,
    mood: (Math.min(5, Math.max(1, mood)) as DailyObservation['mood']),
    sleep: oneOf(raw.sleep, ['good', 'ok', 'poor'] as const, 'ok'),
    crisis: bool(raw.crisis),
    note: str(raw.note),
    demo: bool(raw.demo),
    updatedAt: isIsoDate(raw.updatedAt) ? raw.updatedAt : new Date().toISOString(),
  };
}

const sanitizeItem = (v: unknown) => (isObj(v) && typeof v.key === 'string' ? { key: v.key, params: isObj(v.params) ? (v.params as Record<string, string | number>) : undefined } : null);

function sanitizeReport(raw: unknown): LearningReport | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || typeof raw.childId !== 'string' || !isIsoDate(raw.createdAt) || !isObj(raw.metrics)) return null;
  const items = (v: unknown) => (Array.isArray(v) ? v.map(sanitizeItem).filter((x): x is NonNullable<typeof x> => !!x) : []);
  const home = items(raw.homeActivities);
  if (home.length < 3) return null; // a report must contain exactly three home activities
  const m = raw.metrics;
  return {
    id: raw.id,
    childId: raw.childId,
    createdAt: raw.createdAt,
    periodDays: num(raw.periodDays, 14),
    metrics: {
      firstTry: num(m.firstTry),
      completion: num(m.completion),
      difficult: num(m.difficult),
      avgResponseSec: num(m.avgResponseSec),
      sessions: num(m.sessions),
      trendDelta: typeof m.trendDelta === 'number' ? m.trendDelta : null,
    },
    summary: items(raw.summary),
    strengths: items(raw.strengths).slice(0, 3),
    attention: items(raw.attention).slice(0, 3),
    homeActivities: [home[0], home[1], home[2]],
    nextLessons: strArr(raw.nextLessons).filter((s) => activityExists(s)),
    consultation: sanitizeItem(raw.consultation),
    demo: bool(raw.demo),
  };
}

function sanitizeRequest(raw: unknown): SpecialistRequest | null {
  if (!isObj(raw) || typeof raw.id !== 'string' || typeof raw.childId !== 'string' || typeof raw.specialistId !== 'string' || !isIsoDate(raw.createdAt)) return null;
  const status = oneOf(raw.status, STATUSES, 'pending');
  const history = (Array.isArray(raw.history) ? raw.history : [])
    .filter(isObj)
    .filter((h) => isIsoDate(h.at))
    .map((h) => ({ status: oneOf(h.status, STATUSES, status), at: h.at as string, by: h.by === 'specialist' ? ('specialist' as const) : ('parent' as const) }));
  return {
    id: raw.id,
    parentId: str(raw.parentId, 'u-parent'),
    parentName: str(raw.parentName),
    childId: raw.childId,
    specialistId: raw.specialistId,
    message: str(raw.message),
    goals: strArr(raw.goals),
    consentAt: isIsoDate(raw.consentAt) ? raw.consentAt : raw.createdAt,
    createdAt: raw.createdAt,
    updatedAt: isIsoDate(raw.updatedAt) ? raw.updatedAt : raw.createdAt,
    status,
    history: history.length ? history : [{ status, at: raw.createdAt, by: 'parent' }],
    demo: bool(raw.demo),
  };
}

function list<T>(v: unknown, fn: (x: unknown) => T | null): T[] {
  return Array.isArray(v) ? v.map(fn).filter((x): x is T => x !== null) : [];
}

/**
 * Returns usable app data from a stored value, or null when nothing can be recovered
 * (the caller then seeds fresh demo data). Valid records are preserved.
 */
export function sanitizeAppData(raw: unknown, version: number): AppData | null {
  if (!isObj(raw)) {
    if (raw !== null && raw !== undefined) warn('stored app data was not an object; demo data was restored');
    return null;
  }
  if (raw.version !== version) {
    warn(`stored app data has version ${String(raw.version)}, expected ${version}; demo data was restored`);
    return null;
  }
  const children = list(raw.children, sanitizeChild);
  if (children.length === 0) {
    warn('stored app data had no valid child profile; demo data was restored');
    return null;
  }
  const ids = new Set(children.map((c) => c.id));
  const selectedChildId = typeof raw.selectedChildId === 'string' && ids.has(raw.selectedChildId) ? raw.selectedChildId : children[0].id;
  return {
    version,
    seededOn: /^\d{4}-\d{2}-\d{2}$/.test(str(raw.seededOn)) ? (raw.seededOn as string) : '',
    children,
    selectedChildId,
    sessions: list(raw.sessions, sanitizeSession),
    progress: sanitizeProgress(raw.progress, ids),
    observations: list(raw.observations, sanitizeObservation),
    reports: list(raw.reports, sanitizeReport),
    requests: list(raw.requests, sanitizeRequest),
  };
}
