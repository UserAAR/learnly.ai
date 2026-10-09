import { cn } from '@/lib/cn';
import {
  Ball,
  Breathe,
  Cookie,
  CrossAdult,
  Droplet,
  EmotionFace,
  Faucet,
  Gift,
  Hands,
  IceCreamFall,
  LookEyes,
  PedLight,
  Runner,
  Soap,
  StopHand,
  Towel,
  Zebra,
} from './Objects';

/** Tile background per visual, so every choice card has its own colour world. */
const TONE: Record<string, string> = {
  soap: 'from-coral-50 to-coral-100',
  towel: 'from-sun-50 to-sun-100',
  cookie: 'from-[#FFF3E4] to-[#FFE2C2]',
  faucet: 'from-cobalt-50 to-cobalt-100',
  droplet: 'from-turquoise-50 to-turquoise-100',
  'hands-wet': 'from-turquoise-50 to-turquoise-100',
  'hands-soap': 'from-cobalt-50 to-violet-50',
  'hands-rinse': 'from-turquoise-50 to-cobalt-100',
  'hands-dry': 'from-sun-50 to-sun-100',
  zebra: 'from-cobalt-50 to-cobalt-100',
  'parked-cars': 'from-coral-50 to-coral-100',
  'road-plain': 'from-[#EEF1F6] to-[#DDE3EE]',
  'light-red': 'from-coral-50 to-coral-100',
  'light-green': 'from-leaf-50 to-leaf-100',
  stop: 'from-coral-50 to-coral-100',
  look: 'from-sun-50 to-sun-100',
  'look-both': 'from-sun-50 to-cobalt-50',
  'cross-adult': 'from-cobalt-50 to-turquoise-50',
  alone: 'from-violet-50 to-violet-100',
  ball: 'from-[#EEF1F6] to-[#DDE3EE]',
  'face-happy': 'from-sun-50 to-sun-100',
  'face-sad': 'from-cobalt-50 to-cobalt-100',
  'face-angry': 'from-coral-50 to-coral-100',
  'icecream-fall': 'from-coral-50 to-leaf-50',
  gift: 'from-violet-50 to-violet-100',
  breathe: 'from-leaf-50 to-leaf-100',
};

export function visualTone(key: string): string {
  return TONE[key] ?? 'from-cobalt-50 to-violet-50';
}

export function LessonVisual({ visual, className, animate = true }: { visual: string; className?: string; animate?: boolean }) {
  const cls = cn('h-auto w-full', className);
  const size = 200;
  switch (visual) {
    case 'soap':
      return <Soap size={size} className={cls} />;
    case 'towel':
      return <Towel size={size} className={cls} />;
    case 'cookie':
      return <Cookie size={size} className={cls} />;
    case 'faucet':
      return <Faucet size={size} className={cls} />;
    case 'droplet':
      return <Droplet size={size} className={cls} />;
    case 'hands-wet':
      return <Hands size={size} className={cls} state="wet" />;
    case 'hands-soap':
      return <Hands size={size} className={cls} state="soap" />;
    case 'hands-rinse':
      return <Hands size={size} className={cls} state="rinse" />;
    case 'hands-dry':
      return <Hands size={size} className={cls} state="dry" />;
    case 'zebra':
      return <Zebra size={size} className={cls} />;
    case 'parked-cars':
      return <Zebra size={size} className={cls} cars />;
    case 'road-plain':
      return <Zebra size={size} className={cls} plain />;
    case 'light-red':
      return <PedLight size={size} className={cls} lit="red" />;
    case 'light-green':
      return <PedLight size={size} className={cls} lit="green" />;
    case 'stop':
      return <StopHand size={size} className={cls} />;
    case 'look':
    case 'look-both':
      return <LookEyes size={size} className={cls} animate={animate} />;
    case 'cross-adult':
      return <CrossAdult size={size} className={cls} />;
    case 'alone':
      return <Runner size={size} className={cls} />;
    case 'ball':
      return <Ball size={size} className={cls} />;
    case 'face-happy':
      return <EmotionFace emotion="happy" size={size} className={cls} />;
    case 'face-sad':
      return <EmotionFace emotion="sad" size={size} className={cls} />;
    case 'face-angry':
      return <EmotionFace emotion="angry" size={size} className={cls} />;
    case 'icecream-fall':
      return <IceCreamFall size={size} className={cls} />;
    case 'gift':
      return <Gift size={size} className={cls} />;
    case 'breathe':
      return <Breathe size={size} className={cls} animate={animate} />;
    default:
      // Emoji-based visuals (used by game cards) rendered as a composed tile glyph.
      return (
        <span className={cn('grid aspect-square w-full place-items-center text-[min(11vw,84px)] leading-none', className)} aria-hidden="true">
          {visual}
        </span>
      );
  }
}
