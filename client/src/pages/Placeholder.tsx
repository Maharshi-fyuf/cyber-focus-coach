import { useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Terminal } from 'lucide-react';

export function Placeholder() {
  const location = useLocation();
  const pageName = location.pathname.split('/')[1]?.toUpperCase() || 'PAGE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 className="mono" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {pageName} MODULE
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>System component under construction.</p>
      </header>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
          <Terminal size={32} />
          <div>
            <h3 className="mono" style={{ color: 'var(--accent-cyan)' }}>ACCESS DENIED (WIP)</h3>
            <p>This module will be implemented in a future milestone. Please return to the dashboard.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
