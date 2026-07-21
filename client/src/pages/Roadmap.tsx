import { useRoadmap } from '../hooks/useRoadmap';
import { RoadmapTrack } from '../components/roadmap/RoadmapTrack';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Activity } from 'lucide-react';

export function Roadmap() {
  const { topics, loading, error, completeTopic, refetch } = useRoadmap();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <Activity className="glow-cyan" size={48} color="var(--accent-cyan)" />
        <p className="mono glow-cyan" style={{ color: 'var(--accent-cyan)' }}>DECRYPTING ROADMAP...</p>
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

  const completedCount = topics.filter(t => t.is_completed).length;
  const progressPercent = Math.round((completedCount / topics.length) * 100) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header>
        <h1 className="mono" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          LEARNING DIRECTIVES
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track your progress through the cyber security curriculum. Complete modules to unlock advanced topics.
        </p>
      </header>

      <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,240,255,0.02)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="mono" style={{ color: 'var(--text-primary)' }}>OVERALL PROGRESS</span>
            <span className="mono" style={{ color: 'var(--accent-cyan)' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-cyan)', transition: 'width 0.5s ease' }} />
          </div>
        </div>
        <div className="mono" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
          {completedCount} / {topics.length} <br/> MODULES
        </div>
      </Card>

      <RoadmapTrack topics={topics} onCompleteTopic={completeTopic} />
    </div>
  );
}
