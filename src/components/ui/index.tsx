import { forwardRef, useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Link, type LinkProps } from 'react-router-dom';
import { FlaskConical, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

/* ───────────────────────── Button ───────────────────────── */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'sun' | 'dark' | 'soft';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-cobalt-500 text-white shadow-[0_10px_24px_-10px_rgba(53,99,246,0.8)] hover:bg-cobalt-600',
  secondary: 'bg-white text-ink border border-line hover:border-cobalt-200 hover:bg-cobalt-50',
  ghost: 'text-muted hover:bg-cobalt-50 hover:text-cobalt-600',
  danger: 'bg-coral-500 text-white hover:bg-coral-600 shadow-[0_10px_24px_-12px_rgba(236,79,66,0.8)]',
  sun: 'bg-sun-400 text-navy-900 hover:bg-sun-300 shadow-[0_10px_24px_-10px_rgba(255,194,26,0.9)]',
  dark: 'bg-navy-800 text-white hover:bg-navy-700',
  soft: 'bg-cobalt-50 text-cobalt-700 hover:bg-cobalt-100',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-2xl',
  lg: 'h-13 px-6 text-[15px] gap-2.5 rounded-2xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-bold transition-[background,color,box-shadow,transform] duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});

export function ButtonLink({ variant = 'primary', size = 'md', icon, className, children, ...rest }: LinkProps & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <Link
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-bold transition-[background,color,box-shadow,transform] duration-150 active:scale-[0.97]',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </Link>
  );
}

/* ───────────────────────── Badges ───────────────────────── */

const TONES = {
  cobalt: 'bg-cobalt-50 text-cobalt-700 ring-cobalt-100',
  leaf: 'bg-leaf-50 text-leaf-700 ring-leaf-100',
  coral: 'bg-coral-50 text-coral-700 ring-coral-100',
  sun: 'bg-sun-50 text-sun-700 ring-sun-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  teal: 'bg-turquoise-50 text-teal-700 ring-turquoise-100',
  gray: 'bg-canvas text-muted ring-line',
  navy: 'bg-navy-800 text-white ring-navy-700',
};
export type Tone = keyof typeof TONES;

export function Badge({ tone = 'cobalt', children, className, icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset', TONES[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

export function DemoBadge({ className, label }: { className?: string; label?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'demo-stripes inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-sun-700 ring-1 ring-inset ring-sun-300',
        className,
      )}
      title={t('common.demoDataHint')}
    >
      <FlaskConical className="size-3" />
      {label ?? t('common.demoData')}
    </span>
  );
}

/* ───────────────────────── Card + section header ───────────────────────── */

export function Card({ className, children, as: Tag = 'section' }: { className?: string; children: ReactNode; as?: 'section' | 'div' | 'article' }) {
  return <Tag className={cn('card', className)}>{children}</Tag>;
}

export function SectionHeader({ title, subtitle, action, eyebrow, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; eyebrow?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h2 className="text-lg font-extrabold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action, eyebrow }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-[15px] text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

/* ───────────────────────── Switch ───────────────────────── */

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-bold text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-cobalt-500' : 'bg-[#CED5E6]', disabled && 'opacity-50')}
      >
        <span className={cn('absolute top-1 size-5 rounded-full bg-white shadow transition-[left]', checked ? 'left-6' : 'left-1')} />
      </button>
    </div>
  );
}

/* ───────────────────────── Segmented control ───────────────────────── */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  size = 'md',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex flex-wrap gap-1 rounded-2xl bg-canvas p-1 ring-1 ring-inset ring-line', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl font-bold transition-all',
            size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
            value === o.value ? 'bg-white text-cobalt-700 shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink',
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────── Form field ───────────────────────── */

export function Field({ label, hint, error, children, htmlFor, required, className }: { label: ReactNode; hint?: ReactNode; error?: string | null; children: ReactNode; htmlFor?: string; required?: boolean; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-bold text-ink">
        {label}
        {required && <span className="ml-0.5 text-coral-500">*</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[13px] font-semibold text-coral-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ───────────────────────── Chip toggle ───────────────────────── */

export function ChipToggle({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-sm font-bold transition-all',
        selected ? 'border-cobalt-500 bg-cobalt-500 text-white shadow-[0_8px_18px_-10px_rgba(53,99,246,0.9)]' : 'border-line bg-white text-ink hover:border-cobalt-200 hover:bg-cobalt-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ───────────────────────── Progress ring + bar ───────────────────────── */

export function ProgressRing({ value, size = 64, stroke = 7, color = '#3563F6', track = '#E2E7F3', children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * v) / 100 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function ProgressBar({ value, color = 'bg-cobalt-500', className, label }: { value: number; color?: string; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-canvas ring-1 ring-inset ring-line', className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <motion.div className={cn('h-full rounded-full', color)} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }} />
    </div>
  );
}

/* ───────────────────────── Dialog ───────────────────────── */

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hideClose?: boolean;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const tm = window.setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>('[data-autofocus], input, textarea, select, button:not([data-close])');
      (el ?? panelRef.current)?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(tm);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [open, onClose]);

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy-900/45 backdrop-blur-[3px]" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={cn('relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl outline-none sm:rounded-[28px]', widths[size], className)}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {(title || !hideClose) && (
              <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
                <div className="min-w-0">
                  {title && (
                    <h2 id={titleId} className="text-lg font-extrabold text-ink">
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                </div>
                {!hideClose && (
                  <button type="button" data-close onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-xl text-muted hover:bg-canvas hover:text-ink" aria-label={t('common.close')}>
                    <X className="size-5" />
                  </button>
                )}
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-canvas/60 px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ───────────────────────── Empty state ───────────────────────── */

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white/60 px-6 py-12 text-center', className)}>
      {icon && <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-cobalt-50 text-cobalt-600">{icon}</div>}
      <h3 className="text-base font-extrabold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
