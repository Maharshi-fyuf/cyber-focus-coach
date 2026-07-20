import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: React.ReactNode;
  headerIcon?: React.ReactNode;
}

export function Card({ children, className = '', style, title, headerIcon }: CardProps) {
  return (
    <div className={`glass-panel ${className}`} style={{ padding: '1.5rem', ...style }}>
      {(title || headerIcon) && (
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '1.25rem', 
          borderBottom: '1px solid var(--border-color)', 
          paddingBottom: '0.75rem' 
        }}>
          {headerIcon}
          {title && (
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }} className="mono">
              {title}
            </h3>
          )}
        </header>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  );
}
