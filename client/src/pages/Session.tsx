import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/useSessionStore';
import { useTimer } from '../hooks/useTimer';
import { TimerDisplay } from '../components/session/TimerDisplay';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FocusEngine } from '../engine/FocusEngine';
import { VisibilityDetector } from '../engine/detectors/VisibilityDetector';
import { ShieldAlert, Play, Pause, Square } from 'lucide-react';
import { SessionReviewModal } from '../components/session/SessionReviewModal';

export function Session() {
  const navigate = useNavigate();
  const { currentSession, status, elapsedSeconds, pauseSession, resumeSession, endSession, syncSession, loading, error } = useSessionStore();
  const [distractionCount, setDistractionCount] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Initialize the timer
  useTimer();

  // Initialize the Focus Engine when entering the session
  useEffect(() => {
    // Only run if we are actually in a session (ACTIVE or PAUSED).
    // If IDLE, sync first.
    if (useSessionStore.getState().status === 'IDLE') {
      syncSession().then(() => {
        if (useSessionStore.getState().status === 'IDLE') {
           navigate('/');
        }
      });
      return;
    }

    // Register and start the Focus Engine plugins
    const visibilityDetector = new VisibilityDetector();
    FocusEngine.registerDetector(visibilityDetector);
    
    // Subscribe to focus events
    const unsubscribe = FocusEngine.subscribe((event) => {
      if (event.type === 'TAB_SWITCH') {
        setDistractionCount((prev) => prev + 1);
        // In a real implementation, we might call `pauseSession('Distracted: Tab Switch')` 
        // after a grace period. For now, we just log it and increment the counter.
      }
    });

    FocusEngine.start();

    return () => {
      unsubscribe();
      FocusEngine.stop();
    };
  }, [syncSession, navigate]); // Removed `status` from dependencies so it doesn't restart on pause/resume

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
              <span style={{ color: 'var(--accent-green)' }}>OK</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <span>Cursor Idle</span>
              <span style={{ color: 'var(--text-muted)' }}>INACTIVE</span>
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
