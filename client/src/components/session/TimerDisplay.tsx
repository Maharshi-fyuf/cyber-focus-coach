

interface TimerDisplayProps {
  seconds: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED' | 'IDLE';
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TimerDisplay({ seconds, status }: TimerDisplayProps) {
  let color = 'var(--text-primary)';
  let glow = 'none';

  switch (status) {
    case 'ACTIVE':
      color = 'var(--accent-cyan)';
      glow = '0 0 20px rgba(0, 240, 255, 0.4)';
      break;
    case 'PAUSED':
      color = 'var(--accent-amber)';
      glow = '0 0 20px rgba(255, 170, 0, 0.4)';
      break;
    case 'COMPLETED':
      color = 'var(--accent-green)';
      glow = '0 0 20px rgba(0, 255, 136, 0.4)';
      break;
    case 'ABANDONED':
      color = 'var(--accent-red)';
      glow = '0 0 20px rgba(255, 0, 85, 0.4)';
      break;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="mono" style={{ 
        fontSize: '6rem', 
        fontWeight: 700, 
        color, 
        textShadow: glow,
        lineHeight: 1,
        transition: 'color 0.3s ease, text-shadow 0.3s ease'
      }}>
        {formatTime(seconds)}
      </div>
      <div style={{ 
        marginTop: '1rem', 
        fontSize: '1rem', 
        textTransform: 'uppercase', 
        letterSpacing: '0.2em', 
        color: 'var(--text-secondary)' 
      }}>
        {status}
      </div>
    </div>
  );
}
