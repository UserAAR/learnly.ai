import { useId } from 'react';
import { cn } from '@/lib/cn';
import type { AvatarConfig } from '@/types';

/* ───────────────────────── Logo ───────────────────────── */

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3563F6" />
          <stop offset="1" stopColor="#8158E8" />
        </linearGradient>
        <linearGradient id={`${id}-h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="19" fill={`url(#${id}-g)`} />
      <rect x="3" y="3" width="58" height="30" rx="16" fill={`url(#${id}-h)`} />
      <path d="M21 16v25a7 7 0 0 0 7 7h17" fill="none" stroke="#fff" strokeWidth="7.5" strokeLinecap="round" />
      <circle cx="44" cy="20" r="6.5" fill="#FFD34E" />
      <circle cx="44" cy="20" r="2.4" fill="#FF6B5E" opacity=".55" />
    </svg>
  );
}

export function Logo({ tone = 'dark', size = 36, className, label = true }: { tone?: 'dark' | 'light'; size?: number; className?: string; label?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {label && (
        <span className={cn('font-child text-[22px] font-black tracking-tight', tone === 'dark' ? 'text-navy-800' : 'text-white')}>
          learnly<span className="text-coral-500">.</span>
        </span>
      )}
    </span>
  );
}

/* ───────────────────────── Child avatar ───────────────────────── */

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function KidAvatar({ avatar, size = 64, className, ring = true }: { avatar: AvatarConfig; size?: number; className?: string; ring?: boolean }) {
  const id = useId();
  const { skin, hair, hairStyle, shirt, accent } = avatar;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor={shade(accent, 60)} />
          <stop offset="1" stopColor={accent} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx="60" cy="60" r="60" fill={`url(#${id}-bg)`} />
        <circle cx="22" cy="24" r="5" fill="#fff" opacity=".45" />
        <circle cx="98" cy="36" r="3" fill="#fff" opacity=".5" />
        {hairStyle === 'long' && <path d="M30 56c0-24 12-36 30-36s30 12 30 36v44H30z" fill={hair} />}
        {/* shirt */}
        <path d="M18 120c2-22 18-34 42-34s40 12 42 34z" fill={shirt} />
        <path d="M46 88c4 7 24 7 28 0" fill="none" stroke={shade(shirt, -40)} strokeWidth="4" strokeLinecap="round" />
        {/* neck */}
        <rect x="51" y="74" width="18" height="16" rx="7" fill={shade(skin, -18)} />
        {/* ears */}
        <circle cx="35" cy="58" r="7" fill={shade(skin, -10)} />
        <circle cx="85" cy="58" r="7" fill={shade(skin, -10)} />
        {/* head */}
        <ellipse cx="60" cy="56" rx="25" ry="26" fill={skin} />
        {/* hair */}
        {hairStyle === 'puffs' && (
          <>
            <circle cx="33" cy="32" r="13" fill={hair} />
            <circle cx="87" cy="32" r="13" fill={hair} />
            <path d="M35 52c0-17 11-27 25-27s25 10 25 27c-6-8-15-12-25-12s-19 4-25 12z" fill={hair} />
            <circle cx="39" cy="40" r="3.5" fill={accent} />
            <circle cx="81" cy="40" r="3.5" fill={accent} />
          </>
        )}
        {hairStyle === 'short' && <path d="M34 54c-2-20 10-31 26-31 17 0 28 11 26 31-4-9-12-14-20-15-6 5-18 7-32 15z" fill={hair} />}
        {hairStyle === 'curly' && (
          <g fill={hair}>
            {[38, 48, 60, 72, 82].map((x, i) => (
              <circle key={x} cx={x} cy={i % 2 ? 28 : 32} r="10" />
            ))}
            <circle cx="34" cy="44" r="8" />
            <circle cx="86" cy="44" r="8" />
          </g>
        )}
        {hairStyle === 'bob' && <path d="M33 66c-4-28 8-42 27-42s31 14 27 42c-3-4-4-12-4-20-8 2-30 2-46-6-1 10-2 20-4 26z" fill={hair} />}
        {hairStyle === 'long' && <path d="M35 52c0-17 11-27 25-27s25 10 25 27c-7-6-14-11-25-11s-18 5-25 11z" fill={hair} />}
        {/* face */}
        <ellipse cx="50" cy="58" rx="3.6" ry="4.2" fill="#1B1F3B" />
        <ellipse cx="70" cy="58" rx="3.6" ry="4.2" fill="#1B1F3B" />
        <circle cx="51.2" cy="56.6" r="1.3" fill="#fff" />
        <circle cx="71.2" cy="56.6" r="1.3" fill="#fff" />
        <ellipse cx="43" cy="66" rx="5" ry="3" fill="#FF8A80" opacity=".45" />
        <ellipse cx="77" cy="66" rx="5" ry="3" fill="#FF8A80" opacity=".45" />
        <path d="M52 68c4 4.5 12 4.5 16 0" fill="none" stroke="#7A2E2A" strokeWidth="3" strokeLinecap="round" />
      </g>
      {ring && <circle cx="60" cy="60" r="58" fill="none" stroke="#fff" strokeWidth="4" opacity=".9" />}
    </svg>
  );
}

/* ───────────────────────── Mascot: Lumi ───────────────────────── */

export type MascotMood = 'happy' | 'cheer' | 'think' | 'calm';

export function Mascot({ size = 140, mood = 'happy', animate = true, className }: { size?: number; mood?: MascotMood; animate?: boolean; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size * 1.06} viewBox="0 0 160 170" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#3EE0D9" />
          <stop offset="0.55" stopColor="#10BFC3" />
          <stop offset="1" stopColor="#2F7BEF" />
        </linearGradient>
        <radialGradient id={`${id}-belly`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#F3FFFE" />
          <stop offset="1" stopColor="#C7F5F2" />
        </radialGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7FE0A4" />
          <stop offset="1" stopColor="#239A5F" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="162" rx="44" ry="6" fill="#0E1838" opacity=".16" />
      {/* sprout */}
      <g className={animate ? 'animate-sway' : undefined} style={{ transformOrigin: '80px 34px' }}>
        <path d="M80 36c0-10 1-16 3-22" stroke="#239A5F" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M83 16c6-12 20-14 26-9-4 10-16 15-26 9z" fill={`url(#${id}-leaf)`} />
        <path d="M81 20c-6-10-18-12-24-7 4 9 14 13 24 7z" fill={`url(#${id}-leaf)`} />
      </g>
      {/* arms */}
      {mood === 'cheer' ? (
        <>
          <path d="M34 92c-12-8-18-22-16-32" stroke="#14A9B5" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M126 92c12-8 18-22 16-32" stroke="#2F86EC" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="18" cy="56" r="7" fill="#FFD34E" />
          <circle cx="142" cy="56" r="7" fill="#FFD34E" />
        </>
      ) : mood === 'think' ? (
        <>
          <path d="M34 104c-10 6-14 14-12 20" stroke="#14A9B5" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M124 104c8-2 10-12 4-20" stroke="#2F86EC" strokeWidth="11" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <path d="M34 100c-10 4-16 12-16 20" stroke="#14A9B5" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M126 100c10 4 16 12 16 20" stroke="#2F86EC" strokeWidth="11" strokeLinecap="round" fill="none" />
        </>
      )}
      {/* body */}
      <path d="M80 34c34 0 54 26 54 62 0 34-22 58-54 58s-54-24-54-58c0-36 20-62 54-62z" fill={`url(#${id}-body)`} />
      <path d="M50 52c8-9 18-13 30-13" stroke="#fff" strokeOpacity=".5" strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="80" cy="112" rx="32" ry="30" fill={`url(#${id}-belly)`} />
      {/* feet */}
      <ellipse cx="62" cy="154" rx="13" ry="7" fill="#1F3BB0" />
      <ellipse cx="98" cy="154" rx="13" ry="7" fill="#1F3BB0" />
      {/* eyes */}
      <g className={animate ? 'animate-blink' : undefined} style={{ transformOrigin: '80px 80px' }}>
        <ellipse cx="63" cy="80" rx="11" ry="12.5" fill="#fff" />
        <ellipse cx="97" cy="80" rx="11" ry="12.5" fill="#fff" />
        <ellipse cx={mood === 'think' ? 66 : 64} cy={mood === 'think' ? 77 : 82} rx="6.5" ry="7.5" fill="#172554" />
        <ellipse cx={mood === 'think' ? 100 : 98} cy={mood === 'think' ? 77 : 82} rx="6.5" ry="7.5" fill="#172554" />
        <circle cx="66.5" cy="78.5" r="2.4" fill="#fff" />
        <circle cx="100.5" cy="78.5" r="2.4" fill="#fff" />
      </g>
      <ellipse cx="50" cy="98" rx="7" ry="4.5" fill="#FF6B5E" opacity=".55" />
      <ellipse cx="110" cy="98" rx="7" ry="4.5" fill="#FF6B5E" opacity=".55" />
      {/* mouth */}
      {mood === 'think' ? (
        <path d="M72 100c5-2 11-2 16 0" stroke="#172554" strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : mood === 'calm' ? (
        <path d="M70 98c6 4 14 4 20 0" stroke="#172554" strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <path d="M68 96c4 10 20 10 24 0z" fill="#172554" />
          <path d="M73 101c4 3 10 3 14 0" stroke="#FF6B5E" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      )}
    </svg>
  );
}

/* ───────────────────────── Small decorative star ───────────────────────── */

export function StarShape({ size = 24, fill = '#FFD34E', className, stroke }: { size?: number; fill?: string; className?: string; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.5l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.4l-5.6 3.1 1.3-6.2L3 9l6.3-.7z"
        fill={fill}
        stroke={stroke ?? shade(fill.startsWith('#') ? fill : '#FFD34E', -50)}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.6 8.6l1.4-2.9" stroke="#fff" strokeOpacity=".7" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
