import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Delete, Lock, Volume2, VolumeX, Waves, Wind } from 'lucide-react';
import { useStore } from '@/store/AppStore';
import { useLang } from '@/hooks/useLang';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/cn';
import { WorldBackdrop } from '@/components/illustrations/World';
import { Mascot } from '@/components/illustrations/Brand';
import { CHILD_MODE_PIN } from '@/mocks/users';

export default function ChildLayout() {
  const reduce = useReduceMotion();
  const location = useLocation();
  useEffect(() => window.scrollTo({ top: 0 }), [location.pathname]);
  return (
    <div className="child-shell font-child relative min-h-dvh text-navy-900">
      <WorldBackdrop reduceMotion={reduce} />
      <motion.div
        key={location.pathname}
        initial={reduce ? false : { opacity: 0, scale: 0.985, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </motion.div>
    </div>
  );
}

/* ───────────── Child top bar: same controls in the same place on every child screen ───────────── */

export function ChildTopBar({ left }: { left?: ReactNode }) {
  const { prefs, setPrefs, soundLocked } = useStore();
  const { t } = useLang();
  const reduce = useReduceMotion();
  const play = useSound();
  const [pinOpen, setPinOpen] = useState(false);
  const soundOn = prefs.soundEnabled && !soundLocked;

  return (
    <>
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 pt-4 sm:gap-3 sm:px-6 sm:pt-6">
        <div className="min-w-0 flex-1">{left}</div>
        <button
          type="button"
          onClick={() => {
            if (soundLocked) return;
            setPrefs({ soundEnabled: !prefs.soundEnabled });
            if (!prefs.soundEnabled) window.setTimeout(() => play('tap'), 0);
          }}
          aria-pressed={soundOn}
          aria-label={soundLocked ? t('child.soundLocked') : soundOn ? t('child.soundOff') : t('child.soundOn')}
          title={soundLocked ? t('child.soundLocked') : undefined}
          className={cn(
            'grid size-12 place-items-center rounded-2xl bg-white/90 text-navy-800 shadow-[0_4px_0_rgba(14,24,56,0.18)] backdrop-blur transition-transform active:translate-y-0.5 sm:size-14',
            soundLocked && 'opacity-60',
          )}
        >
          {soundOn ? <Volume2 className="size-6" /> : <VolumeX className="size-6" />}
        </button>
        <button
          type="button"
          onClick={() => setPrefs({ motion: reduce ? 'full' : 'reduce' })}
          aria-pressed={reduce}
          aria-label={reduce ? t('child.motionOn') : t('child.motionOff')}
          className="grid size-12 place-items-center rounded-2xl bg-white/90 text-navy-800 shadow-[0_4px_0_rgba(14,24,56,0.18)] backdrop-blur transition-transform active:translate-y-0.5 sm:size-14"
        >
          {reduce ? <Wind className="size-6" /> : <Waves className="size-6" />}
        </button>
        <button
          type="button"
          onClick={() => setPinOpen(true)}
          className="flex h-12 items-center gap-2 rounded-2xl bg-navy-800 px-3 text-sm font-extrabold text-white shadow-[0_4px_0_rgba(14,24,56,0.4)] transition-transform active:translate-y-0.5 sm:h-14 sm:px-4"
          aria-label={t('child.parentExit')}
        >
          <Lock className="size-5 text-sun-400" />
          <span className="hidden sm:inline">{t('child.parentExitShort')}</span>
        </button>
      </div>
      <PinDialog open={pinOpen} onClose={() => setPinOpen(false)} />
    </>
  );
}

/* ───────────── Parent PIN keypad (frontend demo only — not a security boundary) ───────────── */

export function PinDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { exitChildMode } = useStore();
  const { t } = useLang();
  const reduce = useReduceMotion();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setPin('');
      setError(false);
      setSuccess(false);
    }
  }, [open]);

  const press = useCallback(
    (d: string) => {
      if (success) return;
      setError(false);
      setPin((p) => (p.length >= 4 ? p : p + d));
    },
    [success],
  );

  useEffect(() => {
    if (pin.length !== 4) return;
    const tm = window.setTimeout(() => {
      if (pin === CHILD_MODE_PIN) {
        setSuccess(true);
        window.setTimeout(() => {
          exitChildMode();
          onClose();
          navigate('/parent/dashboard');
        }, reduce ? 50 : 450);
      } else {
        setError(true);
        setPin('');
      }
    }, 180);
    return () => window.clearTimeout(tm);
  }, [pin, exitChildMode, navigate, onClose, reduce]);

  const back = useCallback(() => setPin((p) => p.slice(0, -1)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') back();
      else if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, press, back, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy-900/55 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-title"
            className="font-child relative w-full max-w-sm overflow-hidden rounded-[36px] bg-white p-6 text-center shadow-2xl"
            initial={reduce ? false : { y: 30, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={reduce ? undefined : { y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cobalt-100 to-transparent" aria-hidden="true" />
            <div className="relative mx-auto -mt-1 mb-1 w-20">
              <Mascot size={80} mood={success ? 'cheer' : error ? 'think' : 'calm'} animate={!reduce} />
            </div>
            <h2 id="pin-title" className="relative text-2xl font-black text-navy-800">
              {t('pin.title')}
            </h2>
            <p className="relative mt-1 text-[15px] font-semibold text-muted">{t('pin.subtitle')}</p>

            <div className="mt-5 flex justify-center gap-3" aria-live="polite" aria-label={t('pin.entered', { count: pin.length })}>
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className={cn(
                    'size-5 rounded-full border-[3px] transition-colors',
                    success ? 'border-leaf-500 bg-leaf-500' : i < pin.length ? 'border-cobalt-500 bg-cobalt-500' : 'border-line bg-white',
                  )}
                  animate={i < pin.length && !reduce ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
            <p className={cn('mt-3 min-h-6 text-[15px] font-bold', error ? 'text-coral-600' : success ? 'text-leaf-600' : 'text-transparent')} role="status">
              {error ? t('pin.error') : success ? t('pin.success') : '·'}
            </p>

            <div className="mt-2 grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} type="button" onClick={() => press(d)} className="kid-btn h-16 bg-cobalt-50 text-2xl text-navy-800 [--edge:#BCCDFF]">
                  {d}
                </button>
              ))}
              <button type="button" onClick={onClose} className="kid-btn h-16 bg-white text-sm text-muted ring-1 ring-line [--edge:#E2E7F3]">
                {t('common.cancel')}
              </button>
              <button type="button" onClick={() => press('0')} className="kid-btn h-16 bg-cobalt-50 text-2xl text-navy-800 [--edge:#BCCDFF]">
                0
              </button>
              <button type="button" onClick={back} className="kid-btn h-16 bg-white text-navy-800 ring-1 ring-line [--edge:#E2E7F3]" aria-label={t('pin.delete')}>
                <Delete className="size-6" />
              </button>
            </div>
            <p className="mt-4 rounded-2xl bg-sun-50 px-3 py-2 text-xs font-bold text-sun-700">{t('pin.demoHint')}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
