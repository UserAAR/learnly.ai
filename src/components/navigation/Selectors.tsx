import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Globe, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { cn } from '@/lib/cn';
import { ageInYears } from '@/lib/dates';
import { KidAvatar } from '@/components/illustrations/Brand';
import type { Lang } from '@/types';

const LANG_NAMES: Record<Lang, string> = { az: 'Azərbaycanca', en: 'English', ru: 'Русский' };

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

function Menu({ open, children, align = 'right', className }: { open: boolean; children: ReactNode; align?: 'left' | 'right'; className?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16 }}
          className={cn(
            'absolute top-[calc(100%+8px)] z-50 min-w-56 origin-top rounded-2xl border border-line bg-white p-1.5 shadow-[0_24px_48px_-20px_rgba(14,24,56,0.35)]',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LanguageSelector({ tone = 'light', compact = false }: { tone?: 'light' | 'dark' | 'glass'; compact?: boolean }) {
  const { prefs, setPrefs } = useStore();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('header.language')}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold transition-colors sm:px-3',
          tone === 'light' && 'border border-line bg-white text-ink hover:bg-canvas',
          tone === 'dark' && 'bg-white/10 text-white hover:bg-white/20',
          tone === 'glass' && 'bg-white/85 text-navy-800 shadow-sm backdrop-blur hover:bg-white',
        )}
      >
        <Globe className="size-4" />
        <span className="uppercase">{prefs.language}</span>
        {!compact && <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />}
      </button>
      <Menu open={open} className="min-w-44">
        {(Object.keys(LANG_NAMES) as Lang[]).map((code) => (
          <button
            key={code}
            role="menuitemradio"
            aria-checked={prefs.language === code}
            type="button"
            onClick={() => {
              setPrefs({ language: code });
              setOpen(false);
            }}
            className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-canvas', prefs.language === code ? 'text-cobalt-700' : 'text-ink')}
          >
            <span className="grid h-6 w-8 place-items-center rounded-md bg-canvas text-[11px] font-black uppercase text-muted">{code}</span>
            <span className="flex-1">{LANG_NAMES[code]}</span>
            {prefs.language === code && <Check className="size-4" />}
          </button>
        ))}
      </Menu>
    </div>
  );
}

export function ChildSelector({ className }: { className?: string }) {
  const { data, selectedChild, selectChild } = useStore();
  const { t } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const age = ageInYears(selectedChild.birthDate);
  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 items-center gap-1.5 rounded-2xl border border-line bg-white py-1 pl-1 pr-2 text-left sm:gap-2.5 sm:pr-3 transition-colors hover:border-cobalt-200 hover:bg-cobalt-50/50"
      >
        <KidAvatar avatar={selectedChild.avatar} size={36} ring={false} />
        <span className="hidden min-w-0 sm:block">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">{t('header.selectedChild')}</span>
          <span className="block max-w-32 truncate text-sm font-extrabold leading-tight text-ink">
            {selectedChild.name || t('profile.unnamed')}
            {age !== null && <span className="font-semibold text-muted"> · {t('common.yearsShort', { count: age })}</span>}
          </span>
        </span>
        <ChevronDown className={cn('size-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      <Menu open={open} align="left" className="w-64">
        <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted">{t('header.switchChild')}</p>
        {data.children.map((c) => (
          <button
            key={c.id}
            type="button"
            role="menuitemradio"
            aria-checked={c.id === selectedChild.id}
            onClick={() => {
              selectChild(c.id);
              setOpen(false);
            }}
            className={cn('flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-canvas', c.id === selectedChild.id && 'bg-cobalt-50')}
          >
            <KidAvatar avatar={c.avatar} size={34} ring={false} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink">{c.name || t('profile.unnamed')}</span>
              <span className="block text-xs text-muted">{c.birthDate ? t('common.yearsShort', { count: ageInYears(c.birthDate) ?? 0 }) : t('profile.incomplete')}</span>
            </span>
            {c.id === selectedChild.id && <Check className="size-4 text-cobalt-600" />}
          </button>
        ))}
        <div className="my-1 h-px bg-line" />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            navigate('/parent/profile?new=1');
          }}
          className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm font-bold text-cobalt-700 hover:bg-cobalt-50"
        >
          <span className="grid size-[34px] place-items-center rounded-full border-2 border-dashed border-cobalt-300">
            <Plus className="size-4" />
          </span>
          {t('header.addChild')}
        </button>
      </Menu>
    </div>
  );
}
