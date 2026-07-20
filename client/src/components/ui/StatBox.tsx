import React from 'react';

interface StatBoxProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string; // e.g. 'var(--accent-cyan)'
}

export function StatBox({ label, value, icon, color = 'var(--accent-cyan)' }: StatBoxProps) {
  return (
    <div style={{ 
      background: 'rgba(0,0,0,0.3)', 
      padding: '1.25rem', 
      borderRadius: '8px',
      borderLeft: `3px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      {icon && (
        <div style={{ color }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          {label}
        </div>
        <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', textShadow: `0 0 10px ${color}40` }}>
          {value}
        </div>
      </div>
    </div>
  );
}
