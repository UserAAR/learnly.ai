/**
 * Thin, defensive wrapper around localStorage.
 * Learnly is frontend-only: every piece of state lives in the browser.
 */
export const STORAGE_KEYS = {
  data: 'learnly:data:v1',
  prefs: 'learnly:prefs:v1',
  auth: 'learnly:auth:v1',
  childMode: 'learnly:child-mode:v1',
} as const;

export function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be full or blocked (private mode) — the app keeps working in memory */
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
