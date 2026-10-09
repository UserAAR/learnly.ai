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

/**
 * Reads and parses a stored value. Returns null when the key is missing, storage is unavailable
 * or the value is not valid JSON. Callers must still validate the shape (see storage-schema.ts).
 */
export function readJSON<T = unknown>(key: string): T | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return null; // storage blocked (privacy mode, sandboxed iframe)
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    if (import.meta.env.DEV) console.warn(`[learnly:storage] "${key}" contained invalid JSON and was ignored`);
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
