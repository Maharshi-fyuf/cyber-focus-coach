import type { RoadmapTopic } from '@cyber-focus-coach/shared';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Lock, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/useSessionStore';

interface RoadmapTrackProps {
  topics: RoadmapTopic[];
  onCompleteTopic: (id: number) => void;
}

export function RoadmapTrack({ topics, onCompleteTopic }: RoadmapTrackProps) {
  const navigate = useNavigate();
  const { startSession, loading } = useSessionStore();

  const handleStartTopic = async (topicId: number) => {
    await startSession(topicId);
    navigate('/session');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {topics.map((topic) => {
        const isCurrent = !topic.is_locked && !topic.is_completed;
        const statusColor = topic.is_locked 
          ? 'var(--text-muted)' 
          : topic.is_completed 
            ? 'var(--accent-green)' 
            : 'var(--accent-cyan)';

        return (
          <Card 
            key={topic.id} 
            className={isCurrent ? 'glow-cyan' : ''}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem',
              padding: '1.5rem',
              borderColor: isCurrent ? 'var(--accent-cyan)' : 'var(--border-color)',
              opacity: topic.is_locked ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: statusColor }}>
              {topic.is_locked ? <Lock size={20} /> : topic.is_completed ? <CheckCircle2 size={20} /> : <Play size={20} />}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MODULE {topic.sequence_order}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>•</span>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{topic.category}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: topic.is_locked ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                {topic.title}
              </h3>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {topic.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', minWidth: '150px' }}>
              {topic.is_completed && (
                <span className="mono" style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>COMPLETED</span>
              )}
              {isCurrent && (
                <>
                  <Button variant="primary" onClick={() => handleStartTopic(topic.id)} disabled={loading}>
                    START FOCUS
                  </Button>
                  <Button variant="secondary" onClick={() => onCompleteTopic(topic.id)}>
                    MARK COMPLETE <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                  </Button>
                </>
              )}
              {topic.is_locked && (
                <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>LOCKED</span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
