import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { L10n, Lang, ReportItem } from '@/types';

export function useLang() {
  const { t, i18n } = useTranslation();
  const lang = (['az', 'en', 'ru'].includes(i18n.language) ? i18n.language : 'az') as Lang;
  const l = useCallback((value: L10n) => value[lang] ?? value.az, [lang]);

  /** Resolve report params: values prefixed with "t:" are translation keys. */
  const tr = useCallback(
    (item: ReportItem) => {
      const params: Record<string, string | number> = {};
      Object.entries(item.params ?? {}).forEach(([k, v]) => {
        if (typeof v === 'string' && v.startsWith('tl:')) params[k] = t(v.slice(3)).toLocaleLowerCase(lang);
        else params[k] = typeof v === 'string' && v.startsWith('t:') ? t(v.slice(2)) : v;
      });
      return t(item.key, params);
    },
    [t, lang],
  );

  /** Translate a known tag key (e.g. interests), falling back to the raw user-entered text. */
  const tag = useCallback(
    (group: 'interests' | 'therapies' | 'altComm', value: string) => {
      const key = `tags.${group}.${value}`;
      return i18n.exists(key) ? t(key) : value;
    },
    [t, i18n],
  );

  return { t, lang, l, tr, tag, i18n };
}
