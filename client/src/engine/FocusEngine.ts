import type { FocusEventType } from '@cyber-focus-coach/shared';

// We define a generic Detector interface that all plugins must implement
export interface FocusDetector {
  name: string;
  start: (dispatch: (event: FocusEventPayload) => void) => void;
  stop: () => void;
}

export interface FocusEventPayload {
  type: FocusEventType;
  scoreDelta: number;
  metadata?: any;
}

type EventListener = (event: FocusEventPayload) => void;

class FocusEngineManager {
  private detectors: Map<string, FocusDetector> = new Map();
  private listeners: Set<EventListener> = new Set();
  private isRunning: boolean = false;

  public registerDetector(detector: FocusDetector) {
    if (this.detectors.has(detector.name)) {
      console.warn(`Detector ${detector.name} is already registered. Overwriting with fresh instance.`);
      // Stop the old one if we are running
      if (this.isRunning) {
        this.detectors.get(detector.name)?.stop();
      }
    }
    this.detectors.set(detector.name, detector);
    
    // If engine is already running, start the new detector immediately
    if (this.isRunning) {
      detector.start(this.dispatch);
    }
  }

  public subscribe(listener: EventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener); // Return unsubscribe function
  }

  private dispatch = (event: FocusEventPayload) => {
    if (!this.isRunning) return;
    
    // Log for debugging in dev
    console.debug(`[FocusEngine] Dispatched ${event.type}:`, event);

    // Notify all listeners
    this.listeners.forEach(listener => listener(event));
  };

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.detectors.forEach(detector => {
      detector.start(this.dispatch);
    });
    console.log('[FocusEngine] Started with detectors:', Array.from(this.detectors.keys()));
  }

  public stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.detectors.forEach(detector => {
      detector.stop();
    });
    console.log('[FocusEngine] Stopped.');
  }
}

// Export a singleton instance
export const FocusEngine = new FocusEngineManager();
