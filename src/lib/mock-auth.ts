/**
 * Local demo authentication. No network request is made and nothing here is a security boundary:
 * it only decides which simulated experience the browser shows.
 */
import type { AuthSession, User } from '@/types';
import { DEMO_PASSWORD, USERS, getUser } from '@/mocks/users';
import { STORAGE_KEYS, readJSON, removeKey, writeJSON } from './mock-storage';

export type LoginResult = { ok: true; user: User; session: AuthSession } | { ok: false; error: 'invalid' | 'empty' };

export function mockLogin(email: string, password: string): LoginResult {
  const e = email.trim().toLowerCase();
  if (!e || !password) return { ok: false, error: 'empty' };
  const user = USERS.find((u) => u.email === e);
  if (!user || password !== DEMO_PASSWORD) return { ok: false, error: 'invalid' };
  const session: AuthSession = { userId: user.id, role: user.role, signedInAt: new Date().toISOString() };
  writeJSON(STORAGE_KEYS.auth, session);
  return { ok: true, user, session };
}

export function loadSession(): { session: AuthSession; user: User } | null {
  const session = readJSON<AuthSession>(STORAGE_KEYS.auth);
  if (!session) return null;
  const user = getUser(session.userId);
  return user ? { session, user } : null;
}

export function mockLogout(): void {
  removeKey(STORAGE_KEYS.auth);
  removeKey(STORAGE_KEYS.childMode);
}

export function homePathFor(role: User['role']): string {
  return role === 'parent' ? '/parent/dashboard' : '/teacher/dashboard';
}
