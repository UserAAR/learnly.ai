/**
 * Original Learnly object illustrations (inline SVG). Used inside scenes, choice cards and sequence cards.
 */
import { useId } from 'react';

type P = { size?: number; className?: string };

export function Faucet({ size = 120, className, on = false }: P & { on?: boolean }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F7FF" />
          <stop offset=".5" stopColor="#C6D0E6" />
          <stop offset="1" stopColor="#8D9AB8" />
        </linearGradient>
      </defs>
      <rect x="50" y="70" width="20" height="34" rx="6" fill={`url(#${id}-m)`} />
      <path d="M38 52h38a18 18 0 0 1 18 18v6H80v-6a6 6 0 0 0-6-6H38z" fill={`url(#${id}-m)`} />
      <rect x="84" y="74" width="16" height="10" rx="4" fill="#8D9AB8" />
      <rect x="44" y="34" width="32" height="12" rx="6" fill={on ? '#10BFC3' : '#3563F6'} />
      <rect x="56" y="40" width="8" height="16" rx="3" fill="#8D9AB8" />
      <circle cx="44" cy="40" r="7" fill={on ? '#10BFC3' : '#3563F6'} />
      <circle cx="76" cy="40" r="7" fill={on ? '#10BFC3' : '#3563F6'} />
      <path d="M50 37h20" stroke="#fff" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />
      {on && (
        <g>
          <rect x="87" y="84" width="10" height="34" rx="5" fill="#5FDFE1" opacity=".85" />
          <circle cx="92" cy="96" r="2" fill="#fff" className="animate-drop" />
        </g>
      )}
    </svg>
  );
}

export function Soap({ size = 120, className, foam = false }: P & { foam?: boolean }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB4C8" />
          <stop offset="1" stopColor="#FF6B8F" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="96" rx="40" ry="8" fill="#0E1838" opacity=".12" />
      <rect x="22" y="56" width="76" height="38" rx="16" fill="#E2557A" />
      <rect x="22" y="50" width="76" height="36" rx="16" fill={`url(#${id}-s)`} />
      <rect x="36" y="58" width="34" height="8" rx="4" fill="#fff" opacity=".55" />
      {(foam ? [[30, 40, 11], [48, 32, 13], [70, 36, 10], [86, 44, 8], [60, 22, 7]] : [[40, 38, 7], [56, 30, 5], [74, 40, 6]]).map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#E8F6FF" stroke="#9FD4F5" strokeWidth="1.5" />
          <circle cx={x - r / 3} cy={y - r / 3} r={r / 4} fill="#fff" />
        </g>
      ))}
    </svg>
  );
}

export function Towel({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect x="20" y="14" width="80" height="8" rx="4" fill="#8D9AB8" />
      <circle cx="60" cy="18" r="6" fill="#C6D0E6" />
      <path d="M30 22h60l-4 80a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8z" fill="#FFD34E" />
      <path d="M30 22h60l-1 14H31z" fill="#FFC21A" />
      <path d="M33 84h54M34 92h52" stroke="#FF6B5E" strokeWidth="5" />
      <path d="M44 40v40" stroke="#fff" strokeOpacity=".45" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function Cookie({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <ellipse cx="60" cy="102" rx="36" ry="7" fill="#0E1838" opacity=".12" />
      <circle cx="60" cy="60" r="38" fill="#E3A15F" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="#C47F3E" strokeWidth="4" />
      {[[44, 46], [70, 40], [58, 64], [78, 70], [42, 74], [62, 84]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="4" fill="#5B3418" />
      ))}
      <path d="M36 44c4-8 12-14 22-15" stroke="#fff" strokeOpacity=".4" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Droplet({ size = 120, className }: P) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-d`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7FE6F0" />
          <stop offset="1" stopColor="#3563F6" />
        </linearGradient>
      </defs>
      <path d="M60 14c18 26 32 42 32 60a32 32 0 0 1-64 0c0-18 14-34 32-60z" fill={`url(#${id}-d)`} />
      <path d="M44 70c0 10 6 18 14 20" stroke="#fff" strokeOpacity=".7" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* Hands — palms facing up, with optional state decorations. */
function Hand({ x, flip, skin }: { x: number; flip?: boolean; skin: string }) {
  return (
    <g transform={`translate(${x} 0) ${flip ? 'scale(-1 1) translate(-60 0)' : ''}`}>
      <rect x="12" y="20" width="9" height="34" rx="4.5" fill={skin} />
      <rect x="22" y="12" width="9" height="40" rx="4.5" fill={skin} />
      <rect x="32" y="14" width="9" height="38" rx="4.5" fill={skin} />
      <rect x="42" y="22" width="8" height="30" rx="4" fill={skin} />
      <rect x="10" y="42" width="42" height="40" rx="18" fill={skin} />
      <rect x="2" y="44" width="10" height="26" rx="5" transform="rotate(-28 7 57)" fill={skin} />
      <path d="M20 66c6 4 16 4 22 0" stroke="#000" strokeOpacity=".12" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  );
}

export function Hands({ size = 120, className, state = 'plain', skin = '#F2C29B' }: P & { state?: 'plain' | 'wet' | 'soap' | 'rinse' | 'dry'; skin?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      {state === 'rinse' && (
        <g>
          <rect x="52" y="0" width="16" height="44" rx="8" fill="#5FDFE1" opacity=".8" />
          <circle cx="60" cy="18" r="2.5" fill="#fff" className="animate-drop" />
        </g>
      )}
      <g transform="translate(0 30)">
        <Hand x={2} skin={skin} />
        <Hand x={58} flip skin={skin} />
      </g>
      {(state === 'wet' || state === 'rinse') &&
        [[24, 50], [44, 58], [80, 52], [96, 64], [60, 98]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y}c3 4 5 7 5 9a5 5 0 0 1-10 0c0-2 2-5 5-9z`} fill="#3BB7F0" opacity=".9" />
        ))}
      {state === 'soap' &&
        [[22, 66, 9], [40, 54, 11], [62, 62, 8], [82, 52, 10], [98, 70, 7], [50, 84, 9], [74, 86, 8]].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="#EAF7FF" stroke="#9FD4F5" strokeWidth="1.5" />
            <circle cx={x - r / 3} cy={y - r / 3} r={r / 4} fill="#fff" />
          </g>
        ))}
      {state === 'dry' && (
        <g>
          <path d="M14 96h92l-4 18a6 6 0 0 1-6 4H24a6 6 0 0 1-6-4z" fill="#FFD34E" />
          <path d="M16 104h88" stroke="#FF6B5E" strokeWidth="4" />
          <path d="M96 22l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#FFD34E" />
        </g>
      )}
    </svg>
  );
}

/* ───────────── Road safety objects ───────────── */

export function PedLight({ size = 120, className, lit }: P & { lit: 'red' | 'green' | 'both' | 'none' }) {
  const redOn = lit === 'red' || lit === 'both';
  const greenOn = lit === 'green' || lit === 'both';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect x="54" y="96" width="12" height="24" fill="#2A3A78" />
      <rect x="30" y="4" width="60" height="96" rx="16" fill="#172554" />
      <rect x="35" y="9" width="50" height="40" rx="12" fill={redOn ? '#3A1420' : '#1E2A55'} />
      <rect x="35" y="55" width="50" height="40" rx="12" fill={greenOn ? '#0F3A2A' : '#1E2A55'} />
      <g opacity={redOn ? 1 : 0.28}>
        <circle cx="60" cy="18" r="5" fill="#FF6B5E" />
        <path d="M53 25h14l-1 13h-3l-1 8h-4l-1-8h-3z" fill="#FF6B5E" />
      </g>
      <g opacity={greenOn ? 1 : 0.28}>
        <circle cx="62" cy="63" r="5" fill="#4BE08F" />
        <path d="M58 70h8l4 8 6 2-1 3-8-2-1 5 5 7-3 2-6-7-4 7h-4l5-11 1-6-4 3-3-1z" fill="#4BE08F" />
      </g>
      {redOn && <rect x="35" y="9" width="50" height="40" rx="12" fill="#FF6B5E" opacity=".18" />}
      {greenOn && <rect x="35" y="55" width="50" height="40" rx="12" fill="#4BE08F" opacity=".18" />}
    </svg>
  );
}

export function Zebra({ size = 120, className, cars = false, plain = false }: P & { cars?: boolean; plain?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect x="0" y="16" width="120" height="16" fill="#C9D3E8" />
      <rect x="0" y="32" width="120" height="56" fill="#3B4876" />
      <rect x="0" y="88" width="120" height="16" fill="#C9D3E8" />
      {!plain && !cars && [0, 1, 2, 3, 4].map((i) => <rect key={i} x={40} y={36 + i * 10.4} width="40" height="6" rx="2" fill="#fff" />)}
      {plain && <path d="M6 60h20M46 60h28M94 60h20" stroke="#FFD34E" strokeWidth="3" strokeDasharray="1 0" />}
      {cars && (
        <>
          <Car x={-6} y={40} color="#FF6B5E" />
          <Car x={66} y={40} color="#3563F6" />
        </>
      )}
    </svg>
  );
}

function Car({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="4" y="12" width="56" height="18" rx="8" fill={color} />
      <path d="M14 12l6-10h22l8 10z" fill={color} />
      <path d="M18 12l4-7h8v7zM33 12V5h8l5 7z" fill="#DDF3FF" />
      <circle cx="18" cy="31" r="6" fill="#172554" />
      <circle cx="47" cy="31" r="6" fill="#172554" />
      <circle cx="18" cy="31" r="2" fill="#C9D3E8" />
      <circle cx="47" cy="31" r="2" fill="#C9D3E8" />
    </g>
  );
}

export function CarIcon({ size = 120, className, color = '#FF6B5E' }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 44" className={className} aria-hidden="true">
      <Car x={0} y={2} color={color} />
    </svg>
  );
}

export function Person({ kind = 'child', shirt = '#FF6B5E', skin = '#F2C29B', hair = '#3B2416' }: { kind?: 'child' | 'adult'; shirt?: string; skin?: string; hair?: string }) {
  const s = kind === 'adult' ? 1.35 : 1;
  return (
    <g transform={`scale(${s})`}>
      <rect x="-5" y="22" width="4" height="16" rx="2" fill="#2A3A78" />
      <rect x="1" y="22" width="4" height="16" rx="2" fill="#2A3A78" />
      <rect x="-8" y="6" width="16" height="20" rx="6" fill={shirt} />
      <circle cx="0" cy="-2" r="8" fill={skin} />
      <path d="M-8 -3c0-6 4-9 8-9s8 3 8 9c-3-3-6-4-8-4s-5 1-8 4z" fill={hair} />
    </g>
  );
}

export function CrossAdult({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect x="0" y="70" width="120" height="50" fill="#3B4876" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={8 + i * 19} y="78" width="12" height="36" rx="2" fill="#fff" opacity=".95" />
      ))}
      <g transform="translate(46 50)">
        <Person kind="adult" shirt="#3563F6" hair="#1F1A17" />
      </g>
      <g transform="translate(74 64)">
        <Person kind="child" shirt="#FF6B5E" />
      </g>
      <path d="M53 60c6 4 12 6 16 6" stroke="#F2C29B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="96" cy="20" r="10" fill="#FFD34E" />
    </svg>
  );
}

export function StopHand({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path d="M40 8h40l28 28v40l-28 28H40L12 76V36z" fill="#FF6B5E" />
      <path d="M40 8h40l28 28v40l-28 28H40L12 76V36z" fill="none" stroke="#fff" strokeWidth="5" transform="scale(.9) translate(6.6 6.6)" />
      <g fill="#fff">
        <rect x="44" y="30" width="8" height="30" rx="4" />
        <rect x="54" y="26" width="8" height="34" rx="4" />
        <rect x="64" y="28" width="8" height="32" rx="4" />
        <rect x="74" y="34" width="7" height="26" rx="3.5" />
        <rect x="42" y="50" width="40" height="34" rx="15" />
        <rect x="32" y="52" width="9" height="22" rx="4.5" transform="rotate(-30 36 63)" />
      </g>
    </svg>
  );
}

export function LookEyes({ size = 120, className, animate = true }: P & { animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="44" fill="#FFE1C4" />
      <path d="M22 50c4-22 22-34 38-34s34 12 38 34c-10-10-24-14-38-14s-28 4-38 14z" fill="#3B2416" />
      <ellipse cx="44" cy="62" rx="10" ry="11" fill="#fff" />
      <ellipse cx="76" cy="62" rx="10" ry="11" fill="#fff" />
      <g className={animate ? 'look-pupils' : undefined}>
        <circle cx="40" cy="63" r="5.5" fill="#172554" />
        <circle cx="72" cy="63" r="5.5" fill="#172554" />
      </g>
      <path d="M50 82c6 4 14 4 20 0" stroke="#7A2E2A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M8 60l-6 0M4 54l-3 6 3 6" stroke="#3563F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M112 60h6M116 54l3 6-3 6" stroke="#3563F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Runner({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect x="0" y="80" width="120" height="40" fill="#3B4876" />
      <path d="M0 100h20M40 100h24M88 100h32" stroke="#FFD34E" strokeWidth="3" />
      <g transform="translate(60 52) rotate(8)">
        <Person kind="child" shirt="#8158E8" />
      </g>
      <path d="M20 46h20M14 56h22M22 66h16" stroke="#59648A" strokeWidth="4" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}

export function Ball({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect x="0" y="80" width="120" height="40" fill="#3B4876" />
      <ellipse cx="62" cy="96" rx="26" ry="5" fill="#000" opacity=".2" />
      <circle cx="62" cy="62" r="30" fill="#fff" />
      <path d="M62 44l12 9-5 14H55l-5-14z" fill="#172554" />
      <path d="M62 32v12M74 53l14-4M69 67l9 12M55 67l-9 12M50 53l-14-4" stroke="#172554" strokeWidth="3" />
      <circle cx="62" cy="62" r="30" fill="none" stroke="#C9D3E8" strokeWidth="2" />
      <path d="M18 54h16M14 64h16" stroke="#59648A" strokeWidth="4" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}

/* ───────────── Feelings ───────────── */

export type Emotion = 'happy' | 'sad' | 'angry' | 'calm';

const FACE_FILL: Record<Emotion, [string, string]> = {
  happy: ['#FFE580', '#FFC21A'],
  sad: ['#A9C2FF', '#5F84FB'],
  angry: ['#FFB0A6', '#FF6B5E'],
  calm: ['#9FEFCB', '#36B878'],
};

export function EmotionFace({ emotion, size = 120, className }: P & { emotion: Emotion }) {
  const id = useId();
  const [a, b] = FACE_FILL[emotion];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-f`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="34" ry="5" fill="#0E1838" opacity=".14" />
      <circle cx="60" cy="58" r="50" fill={`url(#${id}-f)`} />
      <path d="M28 34c6-10 16-16 28-18" stroke="#fff" strokeOpacity=".55" strokeWidth="6" strokeLinecap="round" fill="none" />
      {emotion === 'happy' && (
        <>
          <path d="M34 52c4-7 12-7 16 0M70 52c4-7 12-7 16 0" stroke="#172554" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M36 70c8 18 40 18 48 0z" fill="#172554" />
          <path d="M46 80c8 6 20 6 28 0" stroke="#FF6B5E" strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="30" cy="68" rx="7" ry="4.5" fill="#FF6B5E" opacity=".5" />
          <ellipse cx="90" cy="68" rx="7" ry="4.5" fill="#FF6B5E" opacity=".5" />
        </>
      )}
      {emotion === 'sad' && (
        <>
          <path d="M32 40l14 6M88 40l-14 6" stroke="#172554" strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="42" cy="56" rx="5" ry="6" fill="#172554" />
          <ellipse cx="78" cy="56" rx="5" ry="6" fill="#172554" />
          <path d="M44 84c8-10 24-10 32 0" stroke="#172554" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M84 64c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" fill="#E8F6FF" stroke="#3563F6" strokeWidth="1.5" />
        </>
      )}
      {emotion === 'angry' && (
        <>
          <path d="M30 40l18 10M90 40l-18 10" stroke="#172554" strokeWidth="5.5" strokeLinecap="round" />
          <ellipse cx="42" cy="58" rx="5" ry="5" fill="#172554" />
          <ellipse cx="78" cy="58" rx="5" ry="5" fill="#172554" />
          <rect x="42" y="76" width="36" height="10" rx="5" fill="#172554" />
          <path d="M48 81h24" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" />
        </>
      )}
      {emotion === 'calm' && (
        <>
          <path d="M34 56c4 4 12 4 16 0M70 56c4 4 12 4 16 0" stroke="#172554" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M48 78c6 4 18 4 24 0" stroke="#172554" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <ellipse cx="32" cy="68" rx="7" ry="4" fill="#FF6B5E" opacity=".35" />
          <ellipse cx="88" cy="68" rx="7" ry="4" fill="#FF6B5E" opacity=".35" />
        </>
      )}
    </svg>
  );
}

export function IceCreamFall({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect x="0" y="92" width="120" height="28" fill="#D0F1DF" />
      <path d="M18 100c10-8 34-10 44-2 6 6-6 12-22 12s-30-2-22-10z" fill="#FFB4C8" />
      <circle cx="34" cy="94" r="12" fill="#FFB4C8" />
      <circle cx="30" cy="90" r="3" fill="#fff" opacity=".7" />
      <path d="M70 52l30 18-20 22z" fill="#E3A15F" />
      <path d="M76 60l18 10M74 70l16 10" stroke="#C47F3E" strokeWidth="2.5" />
      <path d="M58 30c2 6 2 10 0 14M70 22c3 6 3 10 0 14" stroke="#59648A" strokeWidth="3" strokeLinecap="round" opacity=".5" fill="none" />
    </svg>
  );
}

export function Gift({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <ellipse cx="60" cy="108" rx="40" ry="6" fill="#0E1838" opacity=".12" />
      <rect x="22" y="52" width="76" height="54" rx="8" fill="#8158E8" />
      <rect x="16" y="40" width="88" height="20" rx="7" fill="#9B79F0" />
      <rect x="54" y="40" width="12" height="66" fill="#FFD34E" />
      <path d="M60 40c-10-18-30-18-28-6 2 8 18 8 28 6zM60 40c10-18 30-18 28-6-2 8-18 8-28 6z" fill="#FFD34E" stroke="#E5A800" strokeWidth="2" />
      <path d="M30 64v30" stroke="#fff" strokeOpacity=".35" strokeWidth="6" strokeLinecap="round" />
      {[[14, 22], [104, 18], [100, 50]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 6}l2 4 4 2-4 2-2 4-2-4-4-2 4-2z`} fill="#FFD34E" />
      ))}
    </svg>
  );
}

export function Breathe({ size = 120, className, animate = true }: P & { animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="52" fill="#E1F6E9" />
      <circle cx="60" cy="60" r="38" fill="#B5EDCF" className={animate ? 'animate-breathe' : undefined} style={{ transformOrigin: '60px 60px' }} />
      <g transform="translate(36 40)">
        <path d="M10 30v24" stroke="#239A5F" strokeWidth="3" />
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="10" cy="20" rx="5" ry="9" fill="#FF8FB1" transform={`rotate(${r} 10 28)`} />
        ))}
        <circle cx="10" cy="28" r="4.5" fill="#FFD34E" />
      </g>
      <g transform="translate(70 44)">
        <rect x="2" y="16" width="12" height="34" rx="3" fill="#fff" stroke="#C9D3E8" strokeWidth="2" />
        <path d="M8 16v-4" stroke="#172554" strokeWidth="2" />
        <path d="M8 2c4 4 4 8 0 10-4-2-4-6 0-10z" fill="#FFC21A" />
      </g>
    </svg>
  );
}

export function SunMoon({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="44" cy="52" r="24" fill="#FFD34E" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
        <rect key={r} x="42" y="16" width="4" height="10" rx="2" fill="#FFC21A" transform={`rotate(${r} 44 52)`} />
      ))}
      <path d="M92 60a24 24 0 1 1-26-30 20 20 0 0 0 26 30z" fill="#8158E8" />
      <circle cx="100" cy="30" r="2.5" fill="#FFD34E" />
      <circle cx="108" cy="48" r="2" fill="#FFD34E" />
    </svg>
  );
}

export function Magnifier({ size = 120, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="30" fill="#E8F6FF" stroke="#172554" strokeWidth="9" />
      <path d="M38 40c4-6 10-8 16-8" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
      <rect x="72" y="70" width="16" height="40" rx="8" transform="rotate(-45 80 90)" fill="#FF6B5E" />
    </svg>
  );
}
