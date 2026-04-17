import React, { useEffect, useState } from 'react';
import { Menu, Sun, Moon, Bell, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setIsDark(saved === 'dark');
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    // Clear all auth tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');

    // Redirect to login page
    window.location.href = '/login';
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'Analytics';
    if (path === '/users') return 'Users';
    if (path === '/tasks') return 'Tasks';
    if (path === '/notifications') return 'Notifications';
    if (path === '/settings') return 'Settings';
    return 'Marathon Admin';
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          className="lg:hidden"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 0.12s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={20} />
        </button>
        <h2 style={{
          fontFamily: 'Cabinet Grotesk, sans-serif',
          fontSize: '18px',
          fontWeight: 700,
          margin: 0,
          color: 'var(--text-primary)',
        }}>
          {getPageTitle()}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--bg-elevated)',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--teal-dim)';
            e.currentTarget.style.color = 'var(--teal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification bell */}
        <button style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          background: 'var(--bg-elevated)',
          color: 'var(--text-tertiary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.12s',
        }}>
          <Bell size={16} />
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--cyan)',
            boxShadow: '0 0 4px var(--cyan)',
          }} />
        </button>

        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--teal) 0%, var(--cyan) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Geist Mono, monospace',
          fontSize: '11px',
          color: 'white',
          fontWeight: 500,
          cursor: 'pointer',
        }}>
          AD
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--bg-elevated)',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--danger-dim)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
