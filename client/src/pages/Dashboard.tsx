import { useDashboard } from '../hooks/useDashboard';
import { Card } from '../components/ui/Card';
import { StatBox } from '../components/ui/StatBox';
import { Button } from '../components/ui/Button';
import { Activity, Target, Flame, Play, CheckCircle2 } from 'lucide-react';

export function Dashboard() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <Activity className="glow-cyan" size={48} color="var(--accent-cyan)" />
        <p className="mono glow-cyan" style={{ color: 'var(--accent-cyan)' }}>INITIALIZING DASHBOARD...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glow-red" style={{ borderColor: 'var(--accent-red)' }} title="SYSTEM ERROR">
        <p className="mono" style={{ color: 'var(--accent-red)' }}>{error}</p>
        <Button variant="danger" onClick={refetch} style={{ marginTop: '1rem' }}>Retry Connection</Button>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <header>
        <h1 className="mono" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          SYSTEM OVERVIEW
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back. Here is your daily intelligence briefing.</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <StatBox 
          label="Today's Focus" 
          value={`${data.focused_minutes} / ${data.daily_target_minutes} MIN`} 
          icon={<Target size={24} />} 
          color="var(--accent-cyan)" 
        />
        <StatBox 
          label="Current Streak" 
          value={`${data.streak.current} DAYS`} 
          icon={<Flame size={24} />} 
          color="var(--accent-amber)" 
        />
        <StatBox 
          label="Sessions Today" 
          value={data.session_count} 
          icon={<Activity size={24} />} 
          color="var(--accent-green)" 
        />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <Card title="ACTIVE DIRECTIVE" headerIcon={<Play size={20} color="var(--accent-cyan)" />}>
          {data.active_topic ? (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{data.active_topic.title}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {data.active_topic.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="primary">START SESSION</Button>
                <Button variant="secondary">VIEW RESOURCES</Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={32} />
              <div>
                <h3 className="mono">ALL DIRECTIVES COMPLETE</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You have finished the current roadmap.</p>
              </div>
            </div>
          )}
        </Card>

        <Card title="DAILY TARGET" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(0,240,255,0.05)', border: '2px solid rgba(0,240,255,0.2)' }}>
             <div className="mono" style={{ fontSize: '2rem', color: data.target_met ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                {Math.round((data.focused_minutes / data.daily_target_minutes) * 100)}%
             </div>
          </div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            {data.target_met ? 'Target acquired and neutralized.' : 'Target still active. Keep pushing.'}
          </p>
        </Card>
      </div>

    </div>
  );
}
