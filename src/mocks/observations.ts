import type { DailyObservation, Mood, SleepQuality } from '@/types';
import { shiftKey, todayKey } from '@/lib/dates';

/** 13 days of fictional observations (index 0 = 13 days ago). Today is left for the parent to fill in. */
const SEED: { mood: Mood; sleep: SleepQuality; crisis: boolean; note: string }[] = [
  { mood: 3, sleep: 'ok', crisis: false, note: 'Bağçadan sonra bir az yorğun idi.' },
  { mood: 4, sleep: 'good', crisis: false, note: '' },
  { mood: 2, sleep: 'poor', crisis: true, note: 'Ticarət mərkəzində səs-küy çox idi, tez çıxdıq.' },
  { mood: 3, sleep: 'ok', crisis: false, note: '' },
  { mood: 4, sleep: 'good', crisis: false, note: 'Əl yumağı özü xatırladı.' },
  { mood: 4, sleep: 'good', crisis: false, note: '' },
  { mood: 3, sleep: 'ok', crisis: false, note: 'Qatar kitabına uzun müddət baxdı.' },
  { mood: 5, sleep: 'good', crisis: false, note: 'Parkda sakit və şən idi.' },
  { mood: 4, sleep: 'ok', crisis: false, note: '' },
  { mood: 2, sleep: 'poor', crisis: true, note: 'Gecə yuxudan oyandı, səhər çətin başladı.' },
  { mood: 3, sleep: 'ok', crisis: false, note: '' },
  { mood: 4, sleep: 'good', crisis: false, note: 'Yeni şəkilli cədvəli bəyəndi.' },
  { mood: 4, sleep: 'good', crisis: false, note: '' },
];

export function createDemoObservations(childId: string): DailyObservation[] {
  const today = todayKey();
  return SEED.map((o, i) => {
    const date = shiftKey(today, -(13 - i));
    return { id: `demo-o-${i}`, childId, date, ...o, demo: true, updatedAt: new Date(`${date}T20:00:00`).toISOString() };
  });
}
