/**
 * state.js — Global application state (reactive pub/sub store)
 * Lightweight Zustand-like store without any dependency
 */

const CFC_STATE = (() => {
  const _state = {
    // Auth / Identity
    userId: null,
    userName: 'Hacker',
    dailyTargetMinutes: 60,

    // Session
    currentSession: null,   // { id, topicId, topicTitle, startTime, plannedMinutes, status }
    sessionElapsed: 0,      // seconds of focused time
    sessionPaused: 0,       // seconds of paused time
    sessionStatus: 'idle',  // idle | running | paused | ended

    // Focus
    focusConfidence: 100,
    focusSignals: {
      tabVisible: true,
      cursorActive: true,
      cameraPresent: null,  // null = no camera, true/false = detected
      faceForward: null,
    },
    pauseReason: null,      // string describing why paused
    showPauseModal: false,

    // Settings
    settings: {
      camera_enabled: false,
      screen_capture_enabled: false,
      focus_threshold: 50,
      idle_threshold_seconds: 30,
      grace_period_seconds: 10,
      privacy_mode: false,
    },

    // Roadmap
    topics: [],
    activeTopic: null,

    // Streaks
    streaks: { current_streak_days: 0, best_streak_days: 0, last_active_date: null },

    // Dashboard
    todayStats: {
      focusedMinutes: 0,
      sessionCount: 0,
      logCount: 0,
      topicsCompleted: 0,
    },

    // Logs
    logs: [],

    // Quizzes
    quizzes: [],
    quizAttempts: [],

    // UI
    currentPage: 'dashboard',
    onboardingComplete: false,
    loading: false,
    toasts: [],
  };

  const _listeners = new Set();

  function getState() { return { ..._state }; }

  function setState(patch) {
    Object.assign(_state, typeof patch === 'function' ? patch(_state) : patch);
    _listeners.forEach(fn => fn(_state));
  }

  function subscribe(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }

  function getField(key) { return _state[key]; }

  return { getState, setState, subscribe, getField };
})();

window.CFC_STATE = CFC_STATE;
