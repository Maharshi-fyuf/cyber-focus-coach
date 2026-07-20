import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, BookOpen, Settings, Shield } from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Roadmap', path: '/roadmap', icon: <Map size={20} /> },
    { name: 'Logs', path: '/logs', icon: <BookOpen size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside style={{ 
      width: '240px', 
      backgroundColor: 'var(--bg-secondary)', 
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      <div style={{ 
        padding: '2rem 1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        borderBottom: '1px solid rgba(0, 240, 255, 0.1)'
      }}>
        <Shield color="var(--accent-cyan)" size={28} />
        <span className="mono glow-cyan" style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>
          CYBER FOCUS<br/>COACH
        </span>
      </div>

      <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <style>
          {`
            .nav-link {
              display: flex;
              alignItems: center;
              gap: 0.75rem;
              padding: 0.75rem 1rem;
              borderRadius: 6px;
              color: var(--text-secondary);
              textDecoration: none;
              fontFamily: var(--font-mono);
              fontSize: 0.9rem;
              transition: all 0.2s ease;
              textTransform: uppercase;
              letterSpacing: 0.05em;
            }
            .nav-link:hover {
              background: rgba(0, 240, 255, 0.05);
              color: var(--text-primary);
            }
            .nav-link.active {
              background: rgba(0, 240, 255, 0.1);
              color: var(--accent-cyan);
              borderLeft: 3px solid var(--accent-cyan);
            }
          `}
        </style>
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(0, 240, 255, 0.1)', fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mono">
        SYSTEM v1.0.0<br/>
        STATUS: ONLINE
      </div>
    </aside>
  );
}
