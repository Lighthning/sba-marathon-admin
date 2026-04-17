import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SessionTimeoutWarning from './SessionTimeoutWarning';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '0' }} className="main-content">
        <TopBar onMenuClick={toggleSidebar} />

        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Session timeout warning modal */}
      <SessionTimeoutWarning />

      <style>{`
        @media (min-width: 1024px) {
          .main-content {
            margin-left: 240px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
