import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Mascot, StarShape, type MascotMood } from '@/components/illustrations/Brand';
import { useLang } from '@/hooks/useLang';

export type FeedbackTone = 'neutral' | 'success' | 'gentle' | 'reveal' | 'hint';

const TONES: Record<FeedbackTone, { box: string; mood: MascotMood }> = {
  neutral: { box: 'bg-cobalt-50 text-navy-800 ring-cobalt-100', mood: 'happy' },
  success: { box: 'bg-leaf-50 text-leaf-700 ring-leaf-300', mood: 'cheer' },
  gentle: { box: 'bg-sun-50 text-navy-800 ring-sun-300', mood: 'calm' },
  reveal: { box: 'bg-violet-50 text-violet-700 ring-violet-100', mood: 'think' },
  hint: { box: 'bg-sun-50 text-navy-800 ring-sun-300', mood: 'think' },
};

export function FeedbackBubble({ tone, title, text, reduceMotion }: { tone: FeedbackTone; title: ReactNode; text?: ReactNode; reduceMotion?: boolean }) {
  const s = TONES[tone];
  return (
    <div aria-live="polite" role="status">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${tone}-${String(title)}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className={cn('flex items-center gap-3 rounded-[28px] p-3 pr-5 ring-2', s.box)}
        >
          <span className="shrink-0">
            <Mascot size={58} mood={s.mood} animate={false} />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-lg font-black leading-tight sm:text-xl">
              {tone === 'hint' && <Lightbulb className="size-5 shrink-0 text-sun-700" />}
              {title}
            </span>
            {text && <span className="mt-0.5 block text-[15px] font-bold leading-snug opacity-90 sm:text-base">{text}</span>}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function AttemptDots({ used, max = 3 }: { used: number; max?: number }) {
  const { t } = useLang();
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={t('lesson.triesLeft', { count: Math.max(0, max - used) })}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={cn('h-3 w-5 rounded-full transition-colors', i < max - used ? 'bg-leaf-500' : 'bg-line')} />
      ))}
    </span>
  );
}

/** Gentle celebration: stars rise once (no flashing, no loop). */
export function Celebration({
  title,
  subtitle,
  stats,
  actions,
  reduceMotion,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  stats: { label: string; value: ReactNode }[];
  actions: ReactNode;
  reduceMotion?: boolean;
}) {
  const stars = [
    { x: -150, y: -110, s: 34, d: 0.05 },
    { x: 150, y: -120, s: 30, d: 0.12 },
    { x: -200, y: 10, s: 24, d: 0.2 },
    { x: 205, y: 0, s: 26, d: 0.25 },
    { x: -100, y: -170, s: 22, d: 0.3 },
    { x: 95, y: -175, s: 22, d: 0.35 },
    { x: 0, y: -200, s: 38, d: 0.18 },
  ];
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      className="relative mx-auto mt-10 max-w-2xl overflow-visible rounded-[44px] bg-white px-6 pb-8 pt-28 text-center shadow-[0_12px_0_rgba(14,24,56,0.14),0_40px_70px_-30px_rgba(14,24,56,0.6)] sm:px-10"
    >
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute inset-0 -m-8 rounded-full bg-sun-300/50 blur-2xl" aria-hidden="true" />
          {stars.map((st, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2"
              initial={reduceMotion ? { x: st.x * 0.6, y: st.y * 0.6, opacity: 1 } : { x: 0, y: 0, opacity: 0, scale: 0.3 }}
              animate={{ x: st.x * 0.6, y: st.y * 0.6, opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + st.d, type: 'spring', stiffness: 120, damping: 12 }}
              aria-hidden="true"
            >
              <StarShape size={st.s} />
            </motion.span>
          ))}
          <motion.div className="relative" initial={reduceMotion ? false : { y: 30, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }}>
            <Mascot size={170} mood="cheer" animate={!reduceMotion} />
          </motion.div>
        </div>
      </div>
      <h1 className="text-[38px] font-black leading-tight text-navy-800 sm:text-[48px]">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-lg font-bold text-muted">{subtitle}</p>
      <dl className="mt-6 flex flex-wrap justify-center gap-3">
        {stats.map((s) => (
          <div key={s.label} className="min-w-32 rounded-3xl bg-canvas px-5 py-3">
            <dd className="text-3xl font-black text-navy-800">{s.value}</dd>
            <dt className="text-sm font-extrabold text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>
      <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>
    </motion.section>
  );
}
