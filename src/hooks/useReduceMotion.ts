import { useEffect, useState } from 'react';
import { useStore } from '@/store/AppStore';

function systemPrefersReduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Effective reduced-motion flag: explicit preference wins, otherwise follow the OS. */
export function useReduceMotion(): boolean {
  const { prefs } = useStore();
  const [system, setSystem] = useState(systemPrefersReduced);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = () => setSystem(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (prefs.motion === 'reduce') return true;
  if (prefs.motion === 'full') return false;
  return system;
}
