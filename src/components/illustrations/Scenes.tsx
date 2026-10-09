/**
 * Illustrated, interactive learning environments for child mode.
 * Backgrounds are inline SVG; interactive objects are real <button>s layered on top
 * so they get keyboard focus, labels and generous touch areas.
 */
import { useId, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { EmotionFace, Faucet, PedLight, Person, Soap, Towel } from './Objects';

export type TargetState = 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim';

export interface SceneTarget {
  id: string;
  label: string;
  state: TargetState;
  disabled?: boolean;
  onSelect?: () => void;
}

/* ───────────── Shared interactive object wrapper ───────────── */

function SceneObject({
  target,
  style,
  children,
  interactive,
  reduceMotion,
}: {
  target: SceneTarget;
  style: React.CSSProperties;
  children: ReactNode;
  interactive: boolean;
  reduceMotion: boolean;
}) {
  const ring =
    target.state === 'correct'
      ? 'ring-[6px] ring-leaf-500 bg-leaf-50/80'
      : target.state === 'reveal'
        ? 'ring-[6px] ring-leaf-500/80 bg-leaf-50/70'
        : target.state === 'wrong'
          ? 'ring-4 ring-coral-300 bg-white/60'
          : 'ring-0 hover:bg-white/50 hover:ring-4 hover:ring-white';
  const content = (
    <>
      <span className="relative block w-full">{children}</span>
      <span
        className={cn(
          'font-child mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold shadow-sm sm:text-base',
          target.state === 'correct' || target.state === 'reveal' ? 'bg-leaf-500 text-white' : 'bg-white text-navy-800',
        )}
      >
        {(target.state === 'correct' || target.state === 'reveal') && <Check className="size-4" strokeWidth={3} />}
        {target.label}
      </span>
    </>
  );
  if (!interactive) {
    return (
      <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={style}>
        {content}
      </div>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={target.onSelect}
      disabled={target.disabled}
      aria-label={target.label}
      className={cn(
        'absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[28px] p-2 transition-[background,box-shadow,opacity] duration-200',
        ring,
        target.state === 'dim' && 'opacity-60',
      )}
      style={style}
      whileHover={reduceMotion || target.disabled ? undefined : { scale: 1.05, y: -4 }}
      whileTap={reduceMotion || target.disabled ? undefined : { scale: 0.96 }}
      animate={target.state === 'wrong' && !reduceMotion ? { rotate: [0, -3, 3, -2, 0] } : { rotate: 0 }}
      transition={{ duration: 0.45 }}
    >
      {content}
    </motion.button>
  );
}

/* ───────────── Bathroom / sink scene ───────────── */

export function SinkScene({
  targets,
  waterOn = false,
  bubbles = false,
  interactive = true,
  reduceMotion = false,
  className,
}: {
  targets?: SceneTarget[];
  waterOn?: boolean;
  bubbles?: boolean;
  interactive?: boolean;
  reduceMotion?: boolean;
  className?: string;
}) {
  const id = useId();
  const byId = (k: string): SceneTarget => targets?.find((t) => t.id === k) ?? { id: k, label: '', state: 'idle' };
  const show = (k: string) => !targets || targets.some((t) => t.id === k);
  return (
    <div className={cn('relative aspect-[4/3] w-full overflow-hidden rounded-[32px] bg-turquoise-100', className)}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <pattern id={`${id}-tiles`} width="32" height="32" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" fill="#BDF0F0" />
            <rect x="1" y="1" width="30" height="30" rx="5" fill="#CFF6F5" />
          </pattern>
          <linearGradient id={`${id}-mirror`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2FBFF" />
            <stop offset="1" stopColor="#B9E6F7" />
          </linearGradient>
          <linearGradient id={`${id}-cab`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3563F6" />
            <stop offset="1" stopColor="#2549D9" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#${id}-tiles)`} />
        <rect width="400" height="14" fill="#10BFC3" />
        <rect y="14" width="400" height="5" fill="#078F91" opacity=".35" />
        {/* mirror */}
        <rect x="138" y="30" width="124" height="98" rx="26" fill="#2A3A78" />
        <rect x="145" y="37" width="110" height="84" rx="20" fill={`url(#${id}-mirror)`} />
        <path d="M168 104l40-52M190 108l30-40" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".7" />
        {/* stars on wall */}
        <path d="M48 52l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#FFD34E" />
        <path d="M352 140l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill="#FF6B5E" />
        {/* towel rail */}
        <rect x="300" y="64" width="72" height="8" rx="4" fill="#8D9AB8" />
        {/* plant */}
        <path d="M54 176c-6-18 4-30 14-34-2 12-6 22-14 34zM60 176c4-16 18-22 26-20-6 10-14 16-26 20z" fill="#36B878" />
        <rect x="44" y="172" width="28" height="22" rx="6" fill="#FF6B5E" />
        {/* counter + cabinet */}
        <rect x="0" y="190" width="400" height="18" fill="#FFF8E8" />
        <rect x="0" y="206" width="400" height="5" fill="#E8DCC0" />
        <rect x="0" y="211" width="400" height="89" fill={`url(#${id}-cab)`} />
        <rect x="40" y="224" width="150" height="66" rx="12" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="3" />
        <rect x="210" y="224" width="150" height="66" rx="12" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="3" />
        <circle cx="176" cy="257" r="6" fill="#FFD34E" />
        <circle cx="224" cy="257" r="6" fill="#FFD34E" />
        {/* basin */}
        <ellipse cx="200" cy="192" rx="86" ry="20" fill="#fff" />
        <ellipse cx="200" cy="190" rx="70" ry="13" fill="#D7EEFB" />
        {waterOn && <ellipse cx="200" cy="191" rx="54" ry="9" fill="#7FD9F0" opacity=".75" />}
        {/* water stream */}
        {waterOn && (
          <g>
            <rect x="194" y="120" width="12" height="70" rx="6" fill="#5FDFE1" opacity=".8" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={198 + (i % 2) * 4} cy={130} r="2.6" fill="#fff" className="animate-drop" style={{ animationDelay: `${i * 0.45}s` }} />
            ))}
          </g>
        )}
        {bubbles &&
          [[150, 176, 9], [170, 168, 6], [232, 172, 8], [252, 178, 5], [204, 166, 7], [186, 180, 5]].map(([x, y, r], i) => (
            <g key={i} className="animate-bubble" style={{ animationDelay: `${i * 0.4}s`, transformOrigin: `${x}px ${y}px` }}>
              <circle cx={x} cy={y} r={r} fill="#EFF9FF" stroke="#9FD4F5" strokeWidth="1.5" />
              <circle cx={x - r / 3} cy={y - r / 3} r={r / 4} fill="#fff" />
            </g>
          ))}
      </svg>

      {show('faucet') && (
        <SceneObject target={byId('faucet')} interactive={interactive} reduceMotion={reduceMotion} style={{ left: '50%', top: '38%', width: '26%' }}>
          <Faucet size={200} className="h-auto w-full drop-shadow-[0_10px_10px_rgba(23,37,84,0.25)]" on={waterOn} />
        </SceneObject>
      )}
      {show('soap') && (
        <SceneObject target={byId('soap')} interactive={interactive} reduceMotion={reduceMotion} style={{ left: '22%', top: '55%', width: '21%' }}>
          <Soap size={200} className="h-auto w-full drop-shadow-[0_10px_10px_rgba(23,37,84,0.2)]" foam={bubbles} />
        </SceneObject>
      )}
      {show('towel') && (
        <SceneObject target={byId('towel')} interactive={interactive} reduceMotion={reduceMotion} style={{ left: '84%', top: '42%', width: '22%' }}>
          <Towel size={200} className="h-auto w-full drop-shadow-[0_10px_10px_rgba(23,37,84,0.2)]" />
        </SceneObject>
      )}
    </div>
  );
}

/* ───────────── Street / road scene ───────────── */

export function RoadScene({ light = 'red', className, children }: { light?: 'red' | 'green'; className?: string; children?: ReactNode }) {
  const id = useId();
  return (
    <div className={cn('relative aspect-[4/3] w-full overflow-hidden rounded-[32px] bg-[#BDE9FF]', className)}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6FB8FF" />
            <stop offset="1" stopColor="#D8F3FF" />
          </linearGradient>
        </defs>
        <rect width="400" height="160" fill={`url(#${id}-sky)`} />
        <circle cx="60" cy="44" r="22" fill="#FFD34E" />
        <circle cx="60" cy="44" r="32" fill="#FFD34E" opacity=".25" />
        <g fill="#fff" opacity=".9">
          <ellipse cx="300" cy="38" rx="34" ry="12" />
          <ellipse cx="322" cy="30" rx="20" ry="12" />
        </g>
        {/* buildings */}
        {[
          [96, 70, 56, 90, '#8158E8'],
          [156, 50, 64, 110, '#3563F6'],
          [224, 82, 48, 78, '#FF6B5E'],
          [276, 60, 58, 100, '#10BFC3'],
          [338, 90, 52, 70, '#FFB547'],
        ].map(([x, y, w, h, c], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width={w as number} height={h as number} rx="6" fill={c as string} />
            {Array.from({ length: Math.floor((h as number) / 22) }).map((_, r) =>
              [0, 1].map((col) => (
                <rect
                  key={`${r}-${col}`}
                  x={(x as number) + 10 + col * ((w as number) / 2 - 4)}
                  y={(y as number) + 12 + r * 22}
                  width={(w as number) / 2 - 16}
                  height="10"
                  rx="3"
                  fill="#fff"
                  opacity=".7"
                />
              )),
            )}
          </g>
        ))}
        {/* trees */}
        {[30, 368].map((x) => (
          <g key={x}>
            <rect x={x - 4} y="128" width="8" height="30" rx="3" fill="#8A5A3B" />
            <circle cx={x} cy="120" r="20" fill="#36B878" />
            <circle cx={x - 8} cy="112" r="8" fill="#7FD6A7" opacity=".7" />
          </g>
        ))}
        {/* sidewalks + road */}
        <rect y="156" width="400" height="22" fill="#E4E9F5" />
        <rect y="176" width="400" height="5" fill="#A9B4CF" />
        <rect y="181" width="400" height="76" fill="#3B4876" />
        <path d="M0 219h60M100 219h50M300 219h40M370 219h30" stroke="#FFD34E" strokeWidth="4" strokeDasharray="1 0" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={160 + i * 14} y="186" width="9" height="66" rx="2" fill="#fff" />
        ))}
        <rect y="257" width="400" height="5" fill="#A9B4CF" />
        <rect y="262" width="400" height="38" fill="#E4E9F5" />
        {/* car */}
        <g transform="translate(36 190)">
          <rect x="4" y="16" width="86" height="26" rx="12" fill="#FF6B5E" />
          <path d="M22 16l10-14h32l12 14z" fill="#FF6B5E" />
          <path d="M28 16l7-10h12v10zM51 16V6h12l8 10z" fill="#DDF3FF" />
          <circle cx="26" cy="44" r="9" fill="#172554" />
          <circle cx="70" cy="44" r="9" fill="#172554" />
          <circle cx="26" cy="44" r="3" fill="#C9D3E8" />
          <circle cx="70" cy="44" r="3" fill="#C9D3E8" />
          <rect x="86" y="22" width="6" height="6" rx="2" fill="#FFD34E" />
        </g>
        {/* people waiting at the crossing */}
        <g transform="translate(176 266)">
          <Person kind="adult" shirt="#3563F6" hair="#1F1A17" />
        </g>
        <g transform="translate(200 274)">
          <Person kind="child" shirt="#FF6B5E" />
        </g>
        {/* traffic light pole */}
        <rect x="324" y="200" width="6" height="70" fill="#2A3A78" />
      </svg>
      <div className="absolute right-[10%] top-[38%] w-[18%]">
        <PedLight size={200} lit={light} className="h-auto w-full drop-shadow-[0_8px_10px_rgba(23,37,84,0.3)]" />
      </div>
      {children}
    </div>
  );
}

/* ───────────── Pedestrian light scene (interactive) ───────────── */

export function LightScene({ targets, reduceMotion = false, className }: { targets: SceneTarget[]; reduceMotion?: boolean; className?: string }) {
  const lit = targets.find((t) => t.state === 'correct' || t.state === 'reveal')?.id as 'red' | 'green' | undefined;
  return (
    <RoadScene light={lit ?? 'red'} className={className}>
      <div className="absolute inset-0 bg-navy-900/35 backdrop-blur-[2px]" />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="flex w-[min(78%,340px)] flex-col gap-3 rounded-[34px] bg-navy-800 p-3 shadow-[0_24px_40px_-12px_rgba(14,24,56,0.6)] ring-4 ring-navy-500 sm:p-4">
          {targets.map((t) => {
            const isRed = t.id === 'red';
            const on = t.state === 'correct' || t.state === 'reveal';
            return (
              <motion.button
                key={t.id}
                type="button"
                onClick={t.onSelect}
                disabled={t.disabled}
                aria-label={t.label}
                whileTap={reduceMotion || t.disabled ? undefined : { scale: 0.97 }}
                animate={t.state === 'wrong' && !reduceMotion ? { x: [0, -5, 5, -3, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  'group flex items-center gap-3 rounded-[26px] p-2 text-left transition-colors sm:gap-4 sm:p-3',
                  on ? (isRed ? 'bg-coral-500/20 ring-4 ring-coral-300' : 'bg-leaf-500/20 ring-4 ring-leaf-300') : 'bg-navy-900/60 hover:bg-navy-700',
                  t.state === 'wrong' && 'ring-4 ring-coral-300/70',
                )}
              >
                <span className={cn('grid size-16 shrink-0 place-items-center rounded-2xl sm:size-20', isRed ? 'bg-[#3A1420]' : 'bg-[#0F3A2A]')}>
                  <svg viewBox="0 0 40 50" className={cn('h-12 sm:h-14', on ? 'opacity-100' : 'opacity-75 group-hover:opacity-100')} aria-hidden="true">
                    {isRed ? (
                      <g fill="#FF6B5E">
                        <circle cx="20" cy="8" r="6" />
                        <path d="M12 16h16l-1.5 16h-3.5l-1 14h-5l-1-14h-3.5z" />
                      </g>
                    ) : (
                      <g fill="#4BE08F">
                        <circle cx="22" cy="7" r="6" />
                        <path d="M17 15h9l5 10 7 3-1.5 4-9-3-1.5 6 6 9-4 3-7-9-5 9h-5l6-14 1.5-7-5 4-3.5-2z" />
                      </g>
                    )}
                  </svg>
                </span>
                <span className="font-child text-lg font-extrabold text-white sm:text-xl">{t.label}</span>
                {on && <Check className="ml-auto size-7 text-white" strokeWidth={3} />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </RoadScene>
  );
}

/* ───────────── Feelings scene ───────────── */

export function FacesScene({ labels, className, reduceMotion = false }: { labels: [string, string, string]; className?: string; reduceMotion?: boolean }) {
  const faces: { e: 'happy' | 'sad' | 'angry'; bg: string }[] = [
    { e: 'happy', bg: 'bg-sun-100' },
    { e: 'sad', bg: 'bg-cobalt-100' },
    { e: 'angry', bg: 'bg-coral-100' },
  ];
  return (
    <div className={cn('relative aspect-[4/3] w-full overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-500 via-violet-600 to-cobalt-600', className)}>
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="340" cy="40" r="90" fill="#fff" opacity=".07" />
        <circle cx="40" cy="280" r="110" fill="#fff" opacity=".06" />
        {[[40, 40], [370, 210], [90, 250], [300, 120]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 8}l2.5 5.5 6 .8-4.4 4 1.1 6-5.2-3-5.2 3 1.1-6-4.4-4 6-.8z`} fill="#FFD34E" opacity=".9" />
        ))}
      </svg>
      <div className="absolute inset-0 grid grid-cols-3 items-center gap-2 px-3 sm:gap-4 sm:px-6">
        {faces.map((f, i) => (
          <motion.div
            key={f.e}
            className="flex flex-col items-center gap-2"
            initial={reduceMotion ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className={cn('rounded-[28px] p-2 shadow-[0_14px_0_rgba(14,24,56,0.18)] sm:p-3', f.bg)}>
              <EmotionFace emotion={f.e} size={140} className="h-auto w-full" />
            </div>
            <span className="font-child rounded-full bg-white px-3 py-1 text-sm font-extrabold text-navy-800 sm:text-base">{labels[i]}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
