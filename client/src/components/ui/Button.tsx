import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  style,
  ...props 
}: ButtonProps) {
  
  const baseStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.05em',
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    textTransform: 'uppercase',
    ...style
  };

  const variants = {
    primary: {
      background: 'var(--accent-cyan)',
      color: '#000',
      boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--accent-cyan)',
      border: '1px solid var(--accent-cyan)',
    },
    danger: {
      background: 'transparent',
      color: 'var(--accent-red)',
      border: '1px solid var(--accent-red)',
    }
  };

  const hoverEffects = `
    .btn-${variant}:hover {
      filter: brightness(1.2);
      box-shadow: ${variant === 'primary' ? '0 0 20px rgba(0, 240, 255, 0.6)' : 'none'};
      background: ${variant !== 'primary' ? (variant === 'danger' ? 'rgba(255,0,85,0.1)' : 'rgba(0,240,255,0.1)') : ''};
    }
    .btn-${variant}:active {
      transform: translateY(1px);
    }
    .btn-${variant}:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  return (
    <>
      <style>{hoverEffects}</style>
      <button 
        className={`btn-${variant}`} 
        style={{ ...baseStyle, ...variants[variant] }} 
        {...props}
      >
        {children}
      </button>
    </>
  );
}
