import type { FocusDetector, FocusEventPayload } from '../FocusEngine';

export class VisibilityDetector implements FocusDetector {
  public name = 'VisibilityDetector';
  private dispatch: ((event: FocusEventPayload) => void) | null = null;

  private handleVisibilityChange = () => {
    if (!this.dispatch) return;

    if (document.hidden) {
      this.dispatch({
        type: 'TAB_HIDDEN',
        scoreDelta: -10,
        metadata: { reason: 'User switched away from the active tab' }
      });
    } else {
      this.dispatch({
        type: 'TAB_VISIBLE',
        scoreDelta: 0,
        metadata: { reason: 'User returned to the tab' }
      });
    }
  };

  public start(dispatch: (event: FocusEventPayload) => void) {
    this.dispatch = dispatch;
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  public stop() {
    this.dispatch = null;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
