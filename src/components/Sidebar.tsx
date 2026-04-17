import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Users, CheckSquare, Bell, Settings, X } from 'lucide-react';
import marathonLogo from '../assets/marathon.png';
import sbaLogo from '../assets/saudibiotechnology.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard', group: 'OVERVIEW' },
    { path: '/users', icon: Users, label: 'Users', group: 'MANAGEMENT' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks', group: 'MANAGEMENT' },
    { path: '/notifications', icon: Bell, label: 'Notifications', group: 'COMMUNICATIONS' },
    { path: '/settings', icon: Settings, label: 'Settings', group: 'SYSTEM' },
  ];

  const groupedItems = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar - ALWAYS DARK */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '240px',
          display: 'flex',
          flexDirection: 'column',
          background: '#1C244B',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          zIndex: 50,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo Area */}
        <div style={{
          height: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          gap: '12px',
        }}>
          {/* Close button for mobile */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              className="lg:hidden"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.background = 'none';
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Logos with glow treatment */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
          }}>
            {/* Marathon logo at top — glow treatment */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)',
                borderRadius: '8px',
              }} />
              <img
                src={marathonLogo}
                alt="Marathon"
                style={{
                  height: '30px',
                  width: 'auto',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
            </div>

            {/* Separator */}
            <div style={{
              width: '50%',
              height: '1px',
              background: 'rgba(255, 255, 255, 0.08)',
            }} />

            {/* SBA logo below — smaller, lower opacity */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={sbaLogo}
                alt="Saudi Biotechnology"
                style={{
                  height: '24px',
                  width: 'auto',
                  objectFit: 'contain',
                  opacity: 0.55,
                }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
        }}>
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group}>
              <div style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: '10px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
                padding: '0 12px',
              }}>
                {group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      background: isActive ? 'rgba(0, 151, 178, 0.25)' : 'transparent',
                      borderLeft: isActive ? '2px solid #58EDEC' : '2px solid transparent',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      fontFamily: 'Instrument Sans, sans-serif',
                      transition: 'all 0.12s',
                      cursor: 'pointer',
                    })}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <item.icon size={16} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0097B2 0%, #58EDEC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Geist Mono, monospace',
              fontSize: '11px',
              color: 'white',
              fontWeight: 500,
            }}>
              AD
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                Admin User
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                Administrator
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (min-width: 1024px) {
          aside {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
