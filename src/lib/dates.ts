import type { Lang } from '@/types';

const DAY = 86_400_000;

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysAgo(n: number, hour = 12, minute = 0): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Whole days between two date keys (b - a). */
export function diffDays(a: string, b: string): number {
  return Math.round((fromDateKey(b).getTime() - fromDateKey(a).getTime()) / DAY);
}

export function shiftIso(iso: string, days: number): string {
  if (!iso) return iso;
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function shiftKey(key: string, days: number): string {
  if (!key) return key;
  const d = fromDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

const LOCALES: Record<Lang, string> = { az: 'az-Latn-AZ', en: 'en-GB', ru: 'ru-RU' };

const AZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const AZ_MONTHS_SHORT = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'];
const AZ_DAYS = ['bazar', 'bazar ertəsi', 'çərşənbə axşamı', 'çərşənbə', 'cümə axşamı', 'cümə', 'şənbə'];
const AZ_DAYS_SHORT = ['B.', 'B.e.', 'Ç.a.', 'Ç.', 'C.a.', 'C.', 'Ş.'];

/** Many browsers ship incomplete Azerbaijani ICU data, so az dates are formatted by hand. */
function formatAz(d: Date, opts: Intl.DateTimeFormatOptions): string {
  const parts: string[] = [];
  if (opts.weekday) parts.push((opts.weekday === 'long' ? AZ_DAYS : AZ_DAYS_SHORT)[d.getDay()] + ',');
  if (opts.day) parts.push(String(d.getDate()));
  if (opts.month) parts.push((opts.month === 'long' ? AZ_MONTHS : AZ_MONTHS_SHORT)[d.getMonth()]);
  if (opts.year) parts.push(String(d.getFullYear()));
  let out = parts.join(' ');
  if (!opts.day && !opts.month && opts.weekday) out = out.replace(/,$/, '');
  if (opts.hour) out += `${out ? ', ' : ''}${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return out;
}

export function formatDate(value: string | Date, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
  const d = typeof value === 'string' ? (value.length === 10 ? fromDateKey(value) : new Date(value)) : value;
  if (lang === 'az') return formatAz(d, opts);
  try {
    return new Intl.DateTimeFormat(LOCALES[lang], opts).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatDateTime(value: string, lang: Lang): string {
  return formatDate(value, lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function ageInYears(birthDate: string): number | null {
  if (!birthDate) return null;
  const b = fromDateKey(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
