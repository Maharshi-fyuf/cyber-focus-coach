import { useEffect, useState } from 'react';
import type { HealthResponse } from '@cyber-focus-coach/shared';
import { Shield, Activity, Terminal, Cpu } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data: HealthResponse) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setError(err.message || 'Failed to connect to backend server');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', display: 'grid', placeItems: 'center' }}>
      <div className="glass-panel" style={{ maxWidth: '640px', width: '100%', padding: '2.5rem', borderRadius: '12px' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: '1rem' }}>
          <Shield color="var(--accent-cyan)" size={32} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em' }} className="mono glow-cyan">
              CYBER FOCUS COACH
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Milestone 01: Monorepo Foundation & Diagnostics
            </p>
          </div>
        </header>

        <section style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px' }}>
            <Cpu color="var(--accent-green)" size={20} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Frontend Status</div>
              <div className="mono" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>REACT 19 + VITE OK</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px' }}>
            <Activity color={health ? 'var(--accent-cyan)' : 'var(--accent-red)'} size={20} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Backend API Connection</div>
              {loading ? (
                <div className="mono" style={{ color: 'var(--accent-amber)' }}>Connecting to /api/health...</div>
              ) : error ? (
                <div className="mono" style={{ color: 'var(--accent-red)' }}>{error}</div>
              ) : (
                <div className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  CONNECTED — Status: {health?.status.toUpperCase()} (Uptime: {Math.round(health?.uptime || 0)}s)
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px' }}>
            <Terminal color="var(--accent-purple)" size={20} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Shared Package Import</div>
              <div className="mono" style={{ color: 'var(--accent-purple)' }}>@cyber-focus-coach/shared loaded</div>
            </div>
          </div>
        </section>

        <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }} className="mono">
          System Operational • Phase 1 Monorepo Active
        </footer>
      </div>
    </div>
  );
}
