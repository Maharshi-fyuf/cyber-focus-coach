import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface SessionReviewModalProps {
  onClose: () => void;
  onSubmit: (data: { notes?: string; reflection?: string; wins?: string; blockers?: string; next_step?: string }) => void;
  loading: boolean;
}

export function SessionReviewModal({ onClose, onSubmit, loading }: SessionReviewModalProps) {
  const [notes, setNotes] = useState('');
  const [wins, setWins] = useState('');
  const [blockers, setBlockers] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      notes: notes.trim() || undefined,
      wins: wins.trim() || undefined,
      blockers: blockers.trim() || undefined,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <Card title="SESSION REVIEW" className="glow-cyan" style={{ width: '100%', maxWidth: '600px', borderColor: 'var(--accent-cyan)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>STUDY NOTES / SUMMARY</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn during this session?"
              style={{
                width: '100%', minHeight: '100px', padding: '1rem',
                backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)',
                borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="mono" style={{ color: 'var(--accent-green)', fontSize: '0.9rem' }}>WINS</label>
              <textarea
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="Breakthroughs or concepts mastered?"
                style={{
                  width: '100%', minHeight: '80px', padding: '0.75rem',
                  backgroundColor: 'rgba(0,255,100,0.05)', border: '1px solid rgba(0,255,100,0.2)',
                  borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="mono" style={{ color: 'var(--accent-amber)', fontSize: '0.9rem' }}>BLOCKERS</label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="What slowed you down?"
                style={{
                  width: '100%', minHeight: '80px', padding: '0.75rem',
                  backgroundColor: 'rgba(255,150,0,0.05)', border: '1px solid rgba(255,150,0,0.2)',
                  borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>
              CANCEL
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'SAVING...' : 'FINALIZE SESSION'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
