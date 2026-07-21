import { useEffect } from 'react';
import { useSessionStore } from '../stores/useSessionStore';

export function useTimer() {
  const status = useSessionStore((state) => state.status);
  const tick = useSessionStore((state) => state.tick);

  useEffect(() => {
    let intervalId: number | undefined;

    if (status === 'running') {
      // Trigger a tick immediately so we don't wait 1s for the first update
      tick();
      // Use window.setInterval to ensure type matches what React/Vite expects for browser env
      intervalId = window.setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [status, tick]);

  // We don't return anything because this hook just orchestrates the global state update.
  // Components that want to read the time should useSessionStore((state) => state.elapsedSeconds).
}
