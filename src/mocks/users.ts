import type { User } from '@/types';
import { DEMO_SPECIALIST_ID } from './specialists';

/** Shared password for both demo accounts. Frontend demo only — not a real credential. */
export const DEMO_PASSWORD = 'Learnly-Demo-2026';
export const CHILD_MODE_PIN = '1234';

export const PARENT_USER: User = {
  id: 'u-parent',
  email: 'parent.demo@learnly.test',
  name: 'Səbinə Məmmədova',
  role: 'parent',
};

export const SPECIALIST_USER: User = {
  id: 'u-teacher',
  email: 'teacher.demo@learnly.test',
  name: 'Leyla Həsənova',
  role: 'specialist',
  specialistId: DEMO_SPECIALIST_ID,
};

export const USERS: User[] = [PARENT_USER, SPECIALIST_USER];

export function getUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}
