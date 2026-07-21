import type { FocusDetector, FocusEventPayload } from '../FocusEngine';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'scroll'] as const;

export class IdleDetector implements FocusDetector {
  public name = 'IdleDetector';
  private dispatch: ((event: FocusEventPayload) => void) | null = null;
  private idleThresholdMs: number;
  private timerId: number | undefined;
  private isIdle: boolean = false;

  constructor(idleThresholdMs: number = 30000) {
    this.idleThresholdMs = idleThresholdMs;
  }

  private resetTimer = () => {
    // If we were idle, fire the end event
    if (this.isIdle && this.dispatch) {
      this.isIdle = false;
      this.dispatch({
        type: 'IDLE_END',
        scoreDelta: 0,
        metadata: { reason: 'User activity resumed' }
      });
    }

    // Clear and restart the idle countdown
    if (this.timerId !== undefined) {
      window.clearTimeout(this.timerId);
    }

    this.timerId = window.setTimeout(() => {
      if (!this.dispatch) return;
      this.isIdle = true;
      this.dispatch({
        type: 'IDLE_START',
        scoreDelta: -15,
        metadata: { reason: 'No keyboard or mouse activity detected' }
      });
    }, this.idleThresholdMs);
  };

  public start(dispatch: (event: FocusEventPayload) => void) {
    this.dispatch = dispatch;
    this.isIdle = false;

    // Attach activity listeners
    ACTIVITY_EVENTS.forEach(eventName => {
      document.addEventListener(eventName, this.resetTimer, { passive: true });
    });

    // Start the initial idle countdown
    this.resetTimer();
  }

  public stop() {
    this.dispatch = null;
    this.isIdle = false;

    if (this.timerId !== undefined) {
      window.clearTimeout(this.timerId);
      this.timerId = undefined;
    }

    ACTIVITY_EVENTS.forEach(eventName => {
      document.removeEventListener(eventName, this.resetTimer);
    });
  }
}
