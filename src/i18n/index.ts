import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import az from './locales/az';
import en from './locales/en';
import ru from './locales/ru';
import { STORAGE_KEYS, readJSON } from '@/lib/mock-storage';
import { sanitizePrefs } from '@/lib/storage-schema';

const stored = sanitizePrefs(readJSON(STORAGE_KEYS.prefs));

/** Azerbaijani genitive suffix with vowel harmony: Aylin → Aylinin, Leyla → Leylanın, Murad → Muradın. */
export function azGenitive(name: string): string {
  const n = name.trim();
  if (!n) return n;
  const vowels = 'aıoueəiöüAIOUEƏİÖÜ';
  const last = [...n].reverse().find((ch) => vowels.includes(ch))?.toLowerCase() ?? 'i';
  const harmony: Record<string, string> = { a: 'ın', ı: 'ın', o: 'un', u: 'un', e: 'in', ə: 'in', i: 'in', 'i̇': 'in', ö: 'ün', ü: 'ün' };
  const suffix = harmony[last] ?? 'in';
  const endsWithVowel = vowels.includes(n[n.length - 1]);
  return `${n}${endsWithVowel ? 'n' : ''}${suffix}`;
}

void i18n.use(initReactI18next).init({
  resources: { az: { translation: az }, en: { translation: en }, ru: { translation: ru } },
  lng: stored.language,
  fallbackLng: 'az',
  interpolation: { escapeValue: false },
  returnNull: false,
});

i18n.services.formatter?.add('gen', (value: string, lng?: string) => (lng === 'az' ? azGenitive(String(value)) : String(value)));

export default i18n;
