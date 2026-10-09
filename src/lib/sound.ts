/**
 * Gentle, optional sound feedback via the Web Audio API.
 * Never plays unless the user enabled sound AND the call follows a user interaction.
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, volume = 0.05, type: OscillatorType = 'sine') {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export type SoundName = 'tap' | 'correct' | 'gentle' | 'complete' | 'hint';

export function playSound(name: SoundName): void {
  try {
    switch (name) {
      case 'tap':
        tone(660, 0, 0.12, 0.03);
        break;
      case 'correct':
        tone(523.25, 0, 0.18);
        tone(659.25, 0.1, 0.22);
        break;
      case 'gentle':
        tone(392, 0, 0.25, 0.035);
        break;
      case 'hint':
        tone(587.33, 0, 0.16, 0.035, 'triangle');
        break;
      case 'complete':
        tone(523.25, 0, 0.2);
        tone(659.25, 0.12, 0.2);
        tone(783.99, 0.24, 0.35);
        break;
    }
  } catch {
    /* audio is optional */
  }
}
