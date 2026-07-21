import { FocusEngine } from './FocusEngine';
import type { FocusEventPayload } from './FocusEngine';

/**
 * Subscribes to the FocusEngine and persists every event to the backend
 * via POST /api/focus. Fire-and-forget — errors are logged but never block.
 *
 * Returns an unsubscribe function for cleanup.
 */
export function createFocusEventReporter(sessionId: string): () => void {
  const unsubscribe = FocusEngine.subscribe((event: FocusEventPayload) => {
    fetch('/api/focus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: event.type,
        event_value: event.metadata?.reason || null,
        confidence: null
      })
    }).catch((err) => {
      console.warn('[FocusEventReporter] Failed to persist event:', err);
    });
  });

  return unsubscribe;
}
