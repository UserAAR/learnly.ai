import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/cn';

/**
 * Gentle 3D tilt on fine pointers (desktop). Touch devices and reduced motion get a flat card
 * with explicit tap feedback instead.
 */
export function TiltCard({ children, className, disabled, max = 7 }: { children: ReactNode; className?: string; disabled?: boolean; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 20 });

  const fine = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
  const active = !disabled && fine;

  return (
    <div className={cn('[perspective:1100px]', className)}>
      <motion.div
        ref={ref}
        className="tilt-surface h-full"
        style={active ? { rotateX: rx, rotateY: ry } : undefined}
        onPointerMove={(e) => {
          if (!active || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        whileHover={disabled ? undefined : { y: -6 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
