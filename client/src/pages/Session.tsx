import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/useSessionStore';
import { useTimer } from '../hooks/useTimer';
import { TimerDisplay } from '../components/session/TimerDisplay';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FocusEngine } from '../engine/FocusEngine';
import { VisibilityDetector } from '../engine/detectors/VisibilityDetector';
import { WindowFocusDetector } from '../engine/detectors/WindowFocusDetector';
import { IdleDetector } from '../engine/detectors/IdleDetector';
import { createFocusEventReporter } from '../engine/FocusEventReporter';
import { ShieldAlert, Play, Pause, Square } from 'lucide-react';
import { SessionReviewModal } from '../components/session/SessionReviewModal';
import type { FocusEventType } from '@cyber-focus-coach/shared';

// Hardcoded defaults matching seed data (settings integration is a future milestone)
const IDLE_THRESHOLD_MS = 30_000;   // idle_threshold_seconds = 30
const GRACE_PERIOD_MS = 10_000;     // grace_period_seconds = 10

// Distraction events that start the grace timer
const DISTRACTION_EVENTS: FocusEventType[] = ['TAB_HIDDEN', 'WINDOW_BLUR', 'IDLE_START'];
// Recovery events that cancel the grace timer
const RECOVERY_EVENTS: FocusEventType[] = ['TAB_VISIBLE', 'WINDOW_FOCUS', 'IDLE_END'];

// Map distraction event types to human-readable pause reasons
const PAUSE_REASONS: Partial<Record<FocusEventType, string>> = {
  TAB_HIDDEN: 'Auto-paused: Tab hidden',
  WINDOW_BLUR: 'Auto-paused: Window lost focus',
  IDLE_START: 'Auto-paused: Idle detected',
};

export function Session() {
  const navigate = useNavigate();
  const { currentSession, status, elapsedSeconds, pauseSession, resumeSession, endSession, syncSession, loading, error } = useSessionStore();
  const [distractionCount, setDistractionCount] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [focusSignals, setFocusSignals] = useState({
    visibility: 'OK' as 'OK' | 'AWAY',
    windowFocus: 'OK' as 'OK' | 'AWAY',
    idle: 'OK' as 'OK' | 'IDLE',
  });

  // Grace period refs (refs instead of state to avoid re-render cascades)
  const graceTimerRef = useRef<number | undefined>(undefined);
  const lastDistractionRef = useRef<FocusEventType | null>(null);

  // Initialize the timer
  useTimer();

  // Stable pauseSession ref to avoid stale closures in the grace timer
  const pauseSessionRef = useRef(pauseSession);
  pauseSessionRef.current = pauseSession;

  const statusRef = useRef(status);
  statusRef.current = status;

  // Clear grace timer helper
  const clearGraceTimer = useCallback(() => {
    if (graceTimerRef.current !== undefined) {
      window.clearTimeout(graceTimerRef.current);
      graceTimerRef.current = undefined;
    }
    lastDistractionRef.current = null;
  }, []);

  // Initialize the Focus Engine when entering the session
  useEffect(() => {
    // Only run if we are actually in a session (running or paused).
    // If IDLE, sync first.
    if (useSessionStore.getState().status === 'IDLE') {
      syncSession().then(() => {
        if (useSessionStore.getState().status === 'IDLE') {
           navigate('/');
        }
      });
      return;
    }

    // Register all detectors
    FocusEngine.registerDetector(new VisibilityDetector());
    FocusEngine.registerDetector(new WindowFocusDetector());
    FocusEngine.registerDetector(new IdleDetector(IDLE_THRESHOLD_MS));

    // Set up the focus event reporter for backend persistence
    const sessionId = useSessionStore.getState().currentSession?.id;
    let unsubscribeReporter: (() => void) | undefined;
    if (sessionId) {
      unsubscribeReporter = createFocusEventReporter(sessionId);
    }
    
    // Subscribe to focus events for UI + grace period logic
    const unsubscribe = FocusEngine.subscribe((event) => {
      // Update Focus Signals panel
      switch (event.type) {
        case 'TAB_HIDDEN':
          setFocusSignals(prev => ({ ...prev, visibility: 'AWAY' }));
          break;
        case 'TAB_VISIBLE':
          setFocusSignals(prev => ({ ...prev, visibility: 'OK' }));
          break;
        case 'WINDOW_BLUR':
          setFocusSignals(prev => ({ ...prev, windowFocus: 'AWAY' }));
          break;
        case 'WINDOW_FOCUS':
          setFocusSignals(prev => ({ ...prev, windowFocus: 'OK' }));
          break;
        case 'IDLE_START':
          setFocusSignals(prev => ({ ...prev, idle: 'IDLE' }));
          break;
        case 'IDLE_END':
          setFocusSignals(prev => ({ ...prev, idle: 'OK' }));
          break;
      }

      // Grace period logic — only trigger when session is running
      if (DISTRACTION_EVENTS.includes(event.type)) {
        setDistractionCount(prev => prev + 1);

        // Only start grace timer if session is currently running and no timer is active
        if (statusRef.current === 'running' && graceTimerRef.current === undefined) {
          lastDistractionRef.current = event.type;
          graceTimerRef.current = window.setTimeout(() => {
            graceTimerRef.current = undefined;
            const reason = PAUSE_REASONS[lastDistractionRef.current!] || 'Auto-paused: Distraction detected';
            lastDistractionRef.current = null;
            // Only pause if still running (user might have manually paused)
            if (statusRef.current === 'running') {
              pauseSessionRef.current(reason);
            }
          }, GRACE_PERIOD_MS);
        }
      }

      if (RECOVERY_EVENTS.includes(event.type)) {
        // Cancel the grace timer — user returned before auto-pause fired
        if (graceTimerRef.current !== undefined) {
          window.clearTimeout(graceTimerRef.current);
          graceTimerRef.current = undefined;
          lastDistractionRef.current = null;
        }
        // Do NOT auto-resume. User must click Resume explicitly.
      }
    });

    FocusEngine.start();

    return () => {
      clearGraceTimer();
      unsubscribe();
      if (unsubscribeReporter) unsubscribeReporter();
      FocusEngine.stop();
    };
  }, [syncSession, navigate, clearGraceTimer]);

  if (status === 'IDLE' && loading) {
    return <div className="mono glow-cyan" style={{ color: 'var(--accent-cyan)', textAlign: 'center', marginTop: '4rem' }}>SYNCING SESSION...</div>;
  }

  if (error) {
    return (
      <Card title="SESSION ERROR" className="glow-red" style={{ borderColor: 'var(--accent-red)' }}>
        <p style={{ color: 'var(--accent-red)' }}>{error}</p>
        <Button variant="secondary" onClick={() => navigate('/')}>Return to Dashboard</Button>
      </Card>
    );
  }

  const signalColor = (value: string, ok: string) =>
    value === ok ? 'var(--accent-green)' : 'var(--accent-amber)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <header style={{ textAlign: 'center' }}>
        <h1 className="mono" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          {currentSession?.topic_id ? `TOPIC ID: ${currentSession.topic_id}` : 'UNSTRUCTURED FOCUS'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Focus Engine Active</p>
      </header>

      <Card style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0' }}>
        <TimerDisplay seconds={elapsedSeconds} status={status} />
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {status === 'running' && (
            <Button variant="secondary" onClick={() => pauseSession('Manual pause')} disabled={loading}>
              <Pause size={18} style={{ marginRight: '0.5rem' }} />
              Pause
            </Button>
          )}
          {status === 'paused' && (
            <Button variant="primary" onClick={() => resumeSession()} disabled={loading}>
              <Play size={18} style={{ marginRight: '0.5rem' }} />
              Resume
            </Button>
          )}
          <Button variant="danger" onClick={() => setShowReviewModal(true)} disabled={loading || status === 'completed'}>
            <Square size={18} style={{ marginRight: '0.5rem' }} />
            End Session
          </Button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%' }}>
         <Card title="FOCUS SIGNALS" headerIcon={<ShieldAlert size={20} color="var(--accent-cyan)" />}>
           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span>Visibility</span>
              <span style={{ color: signalColor(focusSignals.visibility, 'OK') }}>{focusSignals.visibility}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span>Window Focus</span>
              <span style={{ color: signalColor(focusSignals.windowFocus, 'OK') }}>{focusSignals.windowFocus}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span>Idle</span>
              <span style={{ color: signalColor(focusSignals.idle, 'OK') }}>{focusSignals.idle}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span>Distractions</span>
              <span style={{ color: distractionCount > 0 ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>{distractionCount}</span>
           </div>
         </Card>

         <Card title="SESSION METADATA">
           <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
             <p><strong>Session ID:</strong> <span className="mono">{currentSession?.id}</span></p>
             <p><strong>Start Time:</strong> {new Date(currentSession?.start_time || '').toLocaleTimeString()}</p>
             <p><strong>Status:</strong> {status}</p>
           </div>
         </Card>
      </div>

      {showReviewModal && (
        <SessionReviewModal 
          loading={loading}
          onClose={() => setShowReviewModal(false)}
          onSubmit={async (data) => {
            await endSession(data.notes);
            navigate('/');
          }}
        />
      )}

    </div>
  );
}
