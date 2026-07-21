import type { FocusDetector, FocusEventPayload } from '../FocusEngine';

export class WindowFocusDetector implements FocusDetector {
  public name = 'WindowFocusDetector';
  private dispatch: ((event: FocusEventPayload) => void) | null = null;

  private handleFocus = () => {
    if (!this.dispatch) return;
    this.dispatch({
      type: 'WINDOW_FOCUS',
      scoreDelta: 0,
      metadata: { reason: 'Browser window regained focus' }
    });
  };

  private handleBlur = () => {
    if (!this.dispatch) return;
    this.dispatch({
      type: 'WINDOW_BLUR',
      scoreDelta: -5,
      metadata: { reason: 'Browser window lost focus' }
    });
  };

  public start(dispatch: (event: FocusEventPayload) => void) {
    this.dispatch = dispatch;
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
  }

  public stop() {
    this.dispatch = null;
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
  }
}
