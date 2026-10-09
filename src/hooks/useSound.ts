import { useCallback } from 'react';
import { useStore } from '@/store/AppStore';
import { playSound, type SoundName } from '@/lib/sound';

/** Returns a play function that is a no-op unless sound is enabled and allowed for the child. */
export function useSound() {
  const { soundOn } = useStore();
  return useCallback((name: SoundName) => {
    if (soundOn) playSound(name);
  }, [soundOn]);
}
