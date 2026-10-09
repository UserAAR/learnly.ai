import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  AppData,
  AuthSession,
  ChildProfile,
  DailyObservation,
  InProgressActivity,
  LearningReport,
  LearningSession,
  Preferences,
  RequestStatus,
  Role,
  SpecialistRequest,
  User,
} from '@/types';
import { STORAGE_KEYS, readJSON, writeJSON } from '@/lib/mock-storage';
import { DATA_VERSION, createInitialData, demoHistoryFor, rebaseDemoDates } from '@/lib/demo-reset';
import { loadSession, mockLogin, mockLogout, type LoginResult } from '@/lib/mock-auth';
import { generateReport } from '@/lib/report-generator';
import { daysAgo } from '@/lib/dates';
import { uid } from '@/lib/random';
import { PARENT_USER } from '@/mocks/users';
import i18n from '@/i18n';

const DEFAULT_PREFS: Preferences = { language: 'az', soundEnabled: false, motion: 'system' };

interface ChildModeState {
  active: boolean;
  childId: string | null;
}

function loadData(): AppData {
  const stored = readJSON<AppData>(STORAGE_KEYS.data);
  if (!stored || stored.version !== DATA_VERSION || !Array.isArray(stored.children) || stored.children.length === 0) {
    return createInitialData();
  }
  return rebaseDemoDates(stored);
}

function loadPrefs(): Preferences {
  return { ...DEFAULT_PREFS, ...(readJSON<Partial<Preferences>>(STORAGE_KEYS.prefs) ?? {}) };
}

export interface NewRequestInput {
  childId: string;
  specialistId: string;
  message: string;
  goals: string[];
}

interface AppStore {
  data: AppData;
  prefs: Preferences;
  user: User | null;
  session: AuthSession | null;
  childMode: ChildModeState;
  selectedChild: ChildProfile;
  /** Sound is forced off when the selected child has high sound sensitivity. */
  soundLocked: boolean;
  soundOn: boolean;

  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  setPrefs: (patch: Partial<Preferences>) => void;

  selectChild: (id: string) => void;
  saveChild: (child: ChildProfile) => void;

  recordSession: (session: LearningSession) => void;
  saveProgress: (childId: string, progress: InProgressActivity) => void;
  clearProgress: (childId: string, slug: string) => void;

  saveObservation: (obs: DailyObservation) => void;
  deleteObservation: (id: string) => void;

  createReport: (childId: string) => LearningReport;
  restoreDemoReports: (childId: string) => void;

  createRequest: (input: NewRequestInput) => SpecialistRequest;
  setRequestStatus: (id: string, status: RequestStatus, by: Role) => void;

  generateHistory: (childId: string) => void;
  clearHistory: (childId: string) => void;
  resetDemo: () => void;

  enterChildMode: (childId: string) => void;
  exitChildMode: () => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [prefs, setPrefsState] = useState<Preferences>(loadPrefs);
  const [auth, setAuth] = useState(() => loadSession());
  const [childMode, setChildMode] = useState<ChildModeState>(
    () => readJSON<ChildModeState>(STORAGE_KEYS.childMode) ?? { active: false, childId: null },
  );

  useEffect(() => writeJSON(STORAGE_KEYS.data, data), [data]);
  useEffect(() => writeJSON(STORAGE_KEYS.prefs, prefs), [prefs]);
  useEffect(() => writeJSON(STORAGE_KEYS.childMode, childMode), [childMode]);

  useEffect(() => {
    if (i18n.language !== prefs.language) void i18n.changeLanguage(prefs.language);
    document.documentElement.lang = prefs.language;
  }, [prefs.language]);

  const selectedChild = data.children.find((c) => c.id === data.selectedChildId) ?? data.children[0];
  const soundLocked = selectedChild?.sensory.sound === 'high';
  const soundOn = prefs.soundEnabled && !soundLocked;

  const login = useCallback((email: string, password: string) => {
    const res = mockLogin(email, password);
    if (res.ok) setAuth({ session: res.session, user: res.user });
    return res;
  }, []);

  const logout = useCallback(() => {
    mockLogout();
    setAuth(null);
    setChildMode({ active: false, childId: null });
  }, []);

  const setPrefs = useCallback((patch: Partial<Preferences>) => setPrefsState((p) => ({ ...p, ...patch })), []);

  const selectChild = useCallback((id: string) => setData((d) => ({ ...d, selectedChildId: id })), []);

  const saveChild = useCallback((child: ChildProfile) => {
    setData((d) => {
      const exists = d.children.some((c) => c.id === child.id);
      return {
        ...d,
        children: exists ? d.children.map((c) => (c.id === child.id ? child : c)) : [...d.children, child],
        selectedChildId: exists ? d.selectedChildId : child.id,
      };
    });
  }, []);

  const recordSession = useCallback((session: LearningSession) => {
    setData((d) => {
      const progress = { ...d.progress, [session.childId]: { ...(d.progress[session.childId] ?? {}) } };
      delete progress[session.childId][session.activitySlug];
      return { ...d, sessions: [...d.sessions, session], progress };
    });
  }, []);

  const saveProgress = useCallback((childId: string, p: InProgressActivity) => {
    setData((d) => ({ ...d, progress: { ...d.progress, [childId]: { ...(d.progress[childId] ?? {}), [p.slug]: p } } }));
  }, []);

  const clearProgress = useCallback((childId: string, slug: string) => {
    setData((d) => {
      if (!d.progress[childId]?.[slug]) return d;
      const forChild = { ...d.progress[childId] };
      delete forChild[slug];
      return { ...d, progress: { ...d.progress, [childId]: forChild } };
    });
  }, []);

  const saveObservation = useCallback((obs: DailyObservation) => {
    setData((d) => {
      // One observation per child per day: saving on an existing date replaces it.
      const others = d.observations.filter((o) => o.id !== obs.id && !(o.childId === obs.childId && o.date === obs.date));
      return { ...d, observations: [...others, { ...obs, demo: false, updatedAt: new Date().toISOString() }] };
    });
  }, []);

  const deleteObservation = useCallback((id: string) => {
    setData((d) => ({ ...d, observations: d.observations.filter((o) => o.id !== id) }));
  }, []);

  const createReport = useCallback(
    (childId: string) => {
      const child = data.children.find((c) => c.id === childId) ?? selectedChild;
      const report = generateReport(child, data.sessions, data.observations, new Date(), false);
      setData((d) => ({ ...d, reports: [report, ...d.reports] }));
      return report;
    },
    [data.children, data.sessions, data.observations, selectedChild],
  );

  const restoreDemoReports = useCallback((childId: string) => {
    setData((d) => {
      const child = d.children.find((c) => c.id === childId);
      if (!child) return d;
      const reports = [
        generateReport(child, d.sessions, d.observations, daysAgo(1, 19, 30), true),
        generateReport(child, d.sessions, d.observations, daysAgo(7, 20, 10), true),
      ];
      return { ...d, reports: [...d.reports.filter((r) => r.childId !== childId), ...reports] };
    });
  }, []);

  const createRequest = useCallback(
    (input: NewRequestInput) => {
      const now = new Date().toISOString();
      const parentName = auth?.user.name ?? PARENT_USER.name;
      const req: SpecialistRequest = {
        id: uid('req'),
        parentId: auth?.user.id ?? PARENT_USER.id,
        parentName,
        childId: input.childId,
        specialistId: input.specialistId,
        message: input.message,
        goals: input.goals,
        consentAt: now,
        createdAt: now,
        updatedAt: now,
        status: 'pending',
        history: [{ status: 'pending', at: now, by: 'parent' }],
        demo: false,
      };
      setData((d) => ({ ...d, requests: [req, ...d.requests] }));
      return req;
    },
    [auth],
  );

  const setRequestStatus = useCallback((id: string, status: RequestStatus, by: Role) => {
    const now = new Date().toISOString();
    setData((d) => ({
      ...d,
      requests: d.requests.map((r) => (r.id === id ? { ...r, status, updatedAt: now, history: [...r.history, { status, at: now, by }] } : r)),
    }));
  }, []);

  const generateHistory = useCallback((childId: string) => {
    setData((d) => {
      const child = d.children.find((c) => c.id === childId);
      if (!child) return d;
      const fresh = demoHistoryFor(child);
      return { ...d, sessions: [...d.sessions.filter((s) => !(s.childId === childId && s.demo)), ...fresh] };
    });
  }, []);

  const clearHistory = useCallback((childId: string) => {
    setData((d) => ({
      ...d,
      sessions: d.sessions.filter((s) => s.childId !== childId),
      progress: { ...d.progress, [childId]: {} },
    }));
  }, []);

  const resetDemo = useCallback(() => {
    setData(createInitialData());
    setChildMode({ active: false, childId: null });
  }, []);

  const enterChildMode = useCallback((childId: string) => {
    setData((d) => ({ ...d, selectedChildId: childId }));
    setChildMode({ active: true, childId });
  }, []);

  const exitChildMode = useCallback(() => setChildMode({ active: false, childId: null }), []);

  const value = useMemo<AppStore>(
    () => ({
      data,
      prefs,
      user: auth?.user ?? null,
      session: auth?.session ?? null,
      childMode,
      selectedChild,
      soundLocked,
      soundOn,
      login,
      logout,
      setPrefs,
      selectChild,
      saveChild,
      recordSession,
      saveProgress,
      clearProgress,
      saveObservation,
      deleteObservation,
      createReport,
      restoreDemoReports,
      createRequest,
      setRequestStatus,
      generateHistory,
      clearHistory,
      resetDemo,
      enterChildMode,
      exitChildMode,
    }),
    [
      data,
      prefs,
      auth,
      childMode,
      selectedChild,
      soundLocked,
      soundOn,
      login,
      logout,
      setPrefs,
      selectChild,
      saveChild,
      recordSession,
      saveProgress,
      clearProgress,
      saveObservation,
      deleteObservation,
      createReport,
      restoreDemoReports,
      createRequest,
      setRequestStatus,
      generateHistory,
      clearHistory,
      resetDemo,
      enterChildMode,
      exitChildMode,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider');
  return ctx;
}
