import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, GripVertical } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLang } from '@/hooks/useLang';
import type { ChoiceOption } from '@/types';
import { LessonVisual, visualTone } from '@/components/illustrations/LessonVisual';
import { createRng, shuffle } from '@/lib/random';

export function stableShuffle(items: ChoiceOption[], seedKey: string): string[] {
  let h = 7;
  for (let i = 0; i < seedKey.length; i++) h = (h * 31 + seedKey.charCodeAt(i)) >>> 0;
  const rng = createRng(h);
  const ids = items.map((i) => i.id);
  let out = shuffle(ids, rng.next);
  if (out.every((id, i) => id === ids[i])) out = [...out.slice(1), out[0]];
  return out;
}

/**
 * Sequence activity board. Works with taps/clicks/keyboard (primary) and native drag-and-drop (optional extra).
 * `slots` holds item ids or null; the pool is every item not yet placed.
 */
export function SequenceBoard({
  items,
  poolOrder,
  slots,
  onChange,
  locked,
  slotState,
  highlightId,
  reduceMotion,
  onTap,
}: {
  items: ChoiceOption[];
  poolOrder: string[];
  slots: (string | null)[];
  onChange: (slots: (string | null)[]) => void;
  locked?: boolean;
  slotState?: ('idle' | 'right' | 'wrong')[];
  highlightId?: string | null;
  reduceMotion?: boolean;
  onTap?: () => void;
}) {
  const { t, l } = useLang();
  const [dragId, setDragId] = useState<string | null>(null);
  const byId = (id: string) => items.find((i) => i.id === id)!;
  const pool = poolOrder.filter((id) => !slots.includes(id));

  const place = (id: string, at?: number) => {
    if (locked) return;
    const next = slots.map((s) => (s === id ? null : s));
    const target = at ?? next.findIndex((s) => s === null);
    if (target < 0) return;
    const displaced = next[target];
    next[target] = id;
    if (displaced && displaced !== id) {
      const free = next.findIndex((s) => s === null);
      if (free >= 0) next[free] = displaced;
    }
    onTap?.();
    onChange(next);
  };

  const remove = (index: number) => {
    if (locked) return;
    const next = slots.slice();
    next[index] = null;
    onTap?.();
    onChange(next);
  };

  return (
    <div className="space-y-5">
      {/* slots */}
      <ol className="grid grid-cols-4 gap-2 sm:gap-3" aria-label={t('lesson.sequenceSlots')}>
        {slots.map((id, i) => {
          const state = slotState?.[i] ?? 'idle';
          const item = id ? byId(id) : null;
          return (
            <li
              key={i}
              onDragOver={(e) => {
                if (!locked) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.getData('text/plain') || dragId;
                if (dropped) place(dropped, i);
                setDragId(null);
              }}
              className={cn(
                'relative flex aspect-[3/4] flex-col rounded-[20px] border-[3px] border-dashed p-1 transition-colors sm:aspect-[4/5] sm:rounded-[28px] sm:p-2',
                item ? 'border-transparent' : dragId ? 'border-cobalt-400 bg-cobalt-50/80' : 'border-[#C9D3E8] bg-canvas/80',
                state === 'right' && 'border-solid border-leaf-500 bg-leaf-50',
                state === 'wrong' && 'border-solid border-coral-300 bg-coral-50',
              )}
            >
              <span className={cn('absolute -left-2 -top-2 z-10 grid size-7 place-items-center rounded-full text-sm font-black text-white shadow sm:size-9 sm:text-base', state === 'right' ? 'bg-leaf-500' : 'bg-navy-800')}>
                {state === 'right' ? <Check className="size-5" strokeWidth={3.5} /> : i + 1}
              </span>
              <AnimatePresence mode="popLayout">
                {item ? (
                  <motion.button
                    key={item.id}
                    type="button"
                    layoutId={reduceMotion ? undefined : `seq-${item.id}`}
                    onClick={() => remove(i)}
                    disabled={locked}
                    aria-label={`${i + 1}. ${l(item.label)} — ${t('lesson.tapToRemove')}`}
                    className={cn('flex h-full w-full flex-col items-center justify-between rounded-[22px] bg-gradient-to-br p-2 shadow-[0_6px_0_rgba(14,24,56,0.12)]', visualTone(item.visual))}
                    initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={reduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
                  >
                    <span className="flex w-full flex-1 items-center justify-center px-2">
                      <LessonVisual visual={item.visual} className="max-h-full max-w-[90%]" animate={!reduceMotion} />
                    </span>
                    <span className="w-full rounded-full bg-white px-1 py-0.5 text-center text-[11px] font-extrabold leading-tight text-navy-800 sm:px-2 sm:py-1 sm:text-base">{l(item.label)}</span>
                  </motion.button>
                ) : (
                  <span className="m-auto text-center text-[11px] font-extrabold text-muted sm:text-sm">{t('lesson.emptySlot')}</span>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      {/* pool */}
      {pool.length > 0 && (
        <div className="rounded-[24px] bg-cobalt-50/70 p-2 sm:rounded-[28px] sm:p-4">
          <p className="mb-3 text-center text-sm font-extrabold text-cobalt-700">{t('lesson.poolHint')}</p>
          <ul className="grid grid-cols-4 gap-2 sm:gap-3">
            {pool.map((id) => {
              const item = byId(id);
              return (
                <li
                  key={id}
                  draggable={!locked}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDragId(id);
                  }}
                  onDragEnd={() => setDragId(null)}
                >
                  <motion.button
                    type="button"
                    layoutId={reduceMotion ? undefined : `seq-${id}`}
                    onClick={() => place(id)}
                    disabled={locked}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                    aria-label={`${l(item.label)} — ${t('lesson.tapToPlace')}`}
                    className={cn(
                      'relative flex aspect-[3/4] w-full cursor-grab flex-col items-center justify-between rounded-[18px] bg-white p-1 shadow-[0_6px_0_rgba(14,24,56,0.14)] ring-2 transition-shadow active:cursor-grabbing sm:aspect-[4/5] sm:rounded-[24px] sm:p-2',
                      highlightId === id ? 'ring-4 ring-sun-400' : 'ring-transparent hover:ring-cobalt-300',
                    )}
                  >
                    <GripVertical className="absolute right-2 top-2 hidden size-4 text-muted/60 sm:block" aria-hidden="true" />
                    <span className={cn('flex w-full flex-1 items-center justify-center rounded-[18px] bg-gradient-to-br px-2', visualTone(item.visual))}>
                      <LessonVisual visual={item.visual} className="max-h-full max-w-[85%]" animate={!reduceMotion} />
                    </span>
                    <span className="mt-1 text-center text-[11px] font-extrabold leading-tight text-navy-800 sm:mt-2 sm:text-base">{l(item.label)}</span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
