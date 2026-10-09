/**
 * The child-mode world: a calm illustrated landscape that sits behind all child screens.
 * Only clouds move (very slowly), and they stop entirely with reduced motion.
 */
import { useId } from 'react';
import { cn } from '@/lib/cn';
import { EmotionFace, Hands, PedLight, SunMoon, Magnifier } from './Objects';
import { StarShape } from './Brand';

function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 50" className={className} style={style} aria-hidden="true">
      <path d="M20 44a16 16 0 0 1 2-32 22 22 0 0 1 40-6 18 18 0 0 1 30 10 14 14 0 0 1 8 28z" fill="#fff" />
      <path d="M26 40h66" stroke="#DDE7FF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function WorldBackdrop({ reduceMotion = false }: { reduceMotion?: boolean }) {
  const id = useId();
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2F64F5] via-[#4C9BF7] to-[#A6E6F0]" />
      <div className="grain absolute inset-0 opacity-40" />
      {/* sun */}
      <div className="absolute -right-10 -top-10 size-64 rounded-full bg-sun-400/30 blur-2xl" />
      <div className="absolute right-[6%] top-[5%] size-24 rounded-full bg-gradient-to-br from-[#FFE98A] to-sun-500 shadow-[0_0_0_18px_rgba(255,211,78,0.18),0_0_0_40px_rgba(255,211,78,0.08)] sm:size-28" />
      {/* clouds */}
      <Cloud className={cn('absolute top-[9%] w-40 opacity-90', !reduceMotion && 'animate-drift')} style={{ animationDuration: '120s', left: reduceMotion ? '8%' : undefined }} />
      <Cloud className={cn('absolute top-[22%] w-28 opacity-75', !reduceMotion && 'animate-drift')} style={{ animationDuration: '160s', animationDelay: '-70s', left: reduceMotion ? '62%' : undefined }} />
      <Cloud className={cn('absolute top-[4%] w-24 opacity-70', !reduceMotion && 'animate-drift')} style={{ animationDuration: '140s', animationDelay: '-30s', left: reduceMotion ? '40%' : undefined }} />
      {/* hills */}
      <svg viewBox="0 0 1440 360" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-[42vh] min-h-[240px] w-full">
        <defs>
          <linearGradient id={`${id}-h1`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5FDFE1" />
            <stop offset="1" stopColor="#10BFC3" />
          </linearGradient>
          <linearGradient id={`${id}-h2`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7FD6A7" />
            <stop offset="1" stopColor="#36B878" />
          </linearGradient>
          <linearGradient id={`${id}-h3`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#36B878" />
            <stop offset="1" stopColor="#1B7A4B" />
          </linearGradient>
        </defs>
        <path d="M0 150C180 70 340 90 520 140s340 40 520-20 300-50 400 0V360H0z" fill={`url(#${id}-h1)`} opacity=".85" />
        <path d="M0 220c160-60 320-70 520-20s380 50 560 0 260-40 360-10V360H0z" fill={`url(#${id}-h2)`} />
        {/* path winding through */}
        <path d="M640 360c20-50 120-70 200-90s140-40 160-70" stroke="#FFF8E8" strokeWidth="34" fill="none" strokeLinecap="round" opacity=".9" />
        <path d="M640 360c20-50 120-70 200-90s140-40 160-70" stroke="#FFD34E" strokeWidth="4" strokeDasharray="2 22" fill="none" strokeLinecap="round" />
        <path d="M0 290c200-40 380-50 600-20s420 30 600 0 200-20 240-10V360H0z" fill={`url(#${id}-h3)`} />
        {/* trees & houses */}
        {[
          [120, 205],
          [190, 196],
          [1220, 188],
          [1300, 204],
          [420, 220],
        ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 4} y={y} width="8" height="26" rx="3" fill="#8A5A3B" />
            <circle cx={x} cy={y - 10} r="22" fill="#239A5F" />
            <circle cx={x - 8} cy={y - 18} r="8" fill="#7FD6A7" opacity=".8" />
          </g>
        ))}
        {[
          [980, 168, '#FF6B5E'],
          [1060, 178, '#8158E8'],
        ].map(([x, y, c], i) => (
          <g key={i}>
            <rect x={(x as number) - 22} y={y as number} width="44" height="34" rx="4" fill="#FFF8E8" />
            <path d={`M${(x as number) - 30} ${(y as number) + 2}L${x} ${(y as number) - 24}L${(x as number) + 30} ${(y as number) + 2}z`} fill={c as string} />
            <rect x={(x as number) - 6} y={(y as number) + 14} width="12" height="20" rx="3" fill="#3563F6" />
          </g>
        ))}
        {/* flowers */}
        {[80, 300, 520, 760, 880, 1120, 1380].map((x, i) => (
          <g key={x} transform={`translate(${x} ${318 - (i % 3) * 8})`}>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="0" cy="-6" rx="4" ry="6" fill={i % 2 ? '#FFD34E' : '#FF8FB1'} transform={`rotate(${r})`} />
            ))}
            <circle r="3.5" fill={i % 2 ? '#FF6B5E' : '#FFD34E'} />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ───────────── Card art for child home ───────────── */

export function HygieneArt({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-gradient-to-br from-turquoise-300 via-turquoise-500 to-teal-500', className)}>
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#fff_2px,transparent_2px),linear-gradient(90deg,#fff_2px,transparent_2px)] [background-size:34px_34px]" />
      <div className="depth-1 absolute bottom-0 left-1/2 h-[34%] w-[86%] -translate-x-1/2 rounded-t-[40px] bg-white/95 shadow-[inset_0_-10px_0_rgba(16,191,195,0.18)]" />
      <div className="depth-2 absolute bottom-[14%] left-1/2 w-[44%] -translate-x-1/2">
        <Hands state="soap" size={160} className="h-auto w-full drop-shadow-[0_10px_10px_rgba(7,93,96,0.35)]" />
      </div>
      {[[12, 22, 18], [78, 18, 14], [86, 52, 10], [8, 58, 12], [62, 8, 9]].map(([l, t, s], i) => (
        <span
          key={i}
          className="depth-3 animate-float absolute rounded-full border-2 border-white/80 bg-white/40"
          style={{ left: `${l}%`, top: `${t}%`, width: s * 2, height: s * 2, animationDelay: `${i * 0.6}s` }}
        />
      ))}
    </div>
  );
}

export function SafetyArt({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-gradient-to-b from-[#6FB8FF] to-[#CDEEFF]', className)}>
      <div className="absolute left-[10%] top-[10%] size-10 rounded-full bg-sun-400 shadow-[0_0_0_10px_rgba(255,211,78,0.25)]" />
      <div className="absolute bottom-[34%] left-[8%] h-[38%] w-[18%] rounded-t-lg bg-violet-500" />
      <div className="absolute bottom-[34%] left-[28%] h-[52%] w-[16%] rounded-t-lg bg-cobalt-500" />
      <div className="absolute bottom-[34%] left-[46%] h-[30%] w-[14%] rounded-t-lg bg-coral-500" />
      <div className="depth-1 absolute bottom-0 left-0 h-[34%] w-full bg-[#3B4876]">
        <div className="absolute inset-y-[12%] left-[32%] flex w-[36%] justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-full w-[12%] rounded-sm bg-white" />
          ))}
        </div>
      </div>
      <div className="depth-3 absolute bottom-[14%] right-[6%] w-[26%]">
        <PedLight lit="green" size={160} className="h-auto w-full drop-shadow-[0_12px_12px_rgba(14,24,56,0.35)]" />
      </div>
    </div>
  );
}

export function EmotionsArt({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-cobalt-600', className)}>
      <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
      <div className="depth-1 absolute left-[6%] top-[30%] w-[28%] -rotate-6">
        <EmotionFace emotion="sad" size={140} className="h-auto w-full" />
      </div>
      <div className="depth-3 absolute left-1/2 top-[16%] w-[38%] -translate-x-1/2">
        <EmotionFace emotion="happy" size={160} className="h-auto w-full drop-shadow-[0_14px_14px_rgba(14,24,56,0.35)]" />
      </div>
      <div className="depth-2 absolute right-[6%] top-[34%] w-[28%] rotate-6">
        <EmotionFace emotion="angry" size={140} className="h-auto w-full" />
      </div>
    </div>
  );
}

export function RoutineArt({ className }: { className?: string }) {
  const cards = ['🌅', '🪥', '👕', '🥣'];
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-gradient-to-br from-sun-300 via-sun-400 to-[#FFB547]', className)}>
      <div className="depth-1 absolute right-[4%] top-[6%] w-[26%] opacity-90">
        <SunMoon size={120} className="h-auto w-full" />
      </div>
      <div className="depth-2 absolute bottom-[12%] left-[6%] right-[6%] flex items-end justify-between gap-2">
        {cards.map((c, i) => (
          <span
            key={c}
            className="grid aspect-[3/4] flex-1 place-items-center rounded-2xl bg-white text-3xl shadow-[0_8px_0_rgba(179,129,10,0.35)] sm:text-4xl"
            style={{ transform: `translateY(${[0, -10, -4, -14][i]}px) rotate(${[-5, 3, -2, 5][i]}deg)` }}
          >
            {c}
            <span className="absolute -top-2 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-navy-800 text-[11px] font-black text-white">{i + 1}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function OddArt({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-gradient-to-br from-coral-300 via-coral-500 to-[#F2496B]', className)}>
      <div className="depth-1 absolute inset-x-[8%] bottom-[14%] top-[18%] grid grid-cols-2 gap-2">
        {['🍎', '🍌', '🚗', '🍐'].map((e) => (
          <span key={e} className={cn('grid place-items-center rounded-2xl text-3xl sm:text-4xl', e === '🚗' ? 'bg-sun-300 ring-4 ring-white' : 'bg-white/90')}>
            {e}
          </span>
        ))}
      </div>
      <div className="depth-3 absolute -right-2 top-[2%] w-[34%] rotate-12">
        <Magnifier size={120} className="h-auto w-full drop-shadow-[0_10px_10px_rgba(14,24,56,0.35)]" />
      </div>
    </div>
  );
}

export function StarRow({ count, total, size = 20 }: { count: number; total: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <StarShape key={i} size={size} fill={i < count ? '#FFD34E' : '#E2E7F3'} stroke={i < count ? '#E5A800' : '#C9D3E8'} />
      ))}
    </span>
  );
}
