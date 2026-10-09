import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastTone = 'success' | 'info' | 'warning';
interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

const ToastContext = createContext<(t: Omit<ToastItem, 'id' | 'tone'> & { tone?: ToastTone }) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (t: Omit<ToastItem, 'id' | 'tone'> & { tone?: ToastTone }) => {
      const id = nextId.current++;
      setItems((list) => [...list.slice(-2), { id, tone: t.tone ?? 'success', title: t.title, description: t.description }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end" aria-live="polite" role="status">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-navy-800 p-4 text-white shadow-[0_20px_40px_-16px_rgba(14,24,56,0.6)]"
            >
              <span
                className={cn(
                  'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full',
                  t.tone === 'success' ? 'bg-leaf-500' : t.tone === 'warning' ? 'bg-sun-400 text-navy-900' : 'bg-cobalt-500',
                )}
              >
                {t.tone === 'success' ? <CheckCircle2 className="size-4" /> : t.tone === 'warning' ? <TriangleAlert className="size-4" /> : <Info className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[13px] text-white/75">{t.description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} className="grid size-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="×">
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
