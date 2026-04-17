import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';

const SessionTimeoutWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds warning

  useEffect(() => {
    let warningTimer: number;
    let countdownInterval: number;

    const scheduleWarning = () => {
      // Show warning 5 minutes (300 seconds) before token expires
      // Token expires in 1 hour (3600 seconds), so show warning at 55 minutes (3300 seconds)
      const warningTime = (60 - 5) * 60 * 1000; // 55 minutes in milliseconds

      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setCountdown(60); // 60 seconds to decide

        // Start countdown
        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              handleSignOut();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, warningTime);
    };

    // Start the warning timer when component mounts
    scheduleWarning();

    return () => {
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, []);

  const handleStaySignedIn = async () => {
    try {
      const refreshToken = localStorage.getItem('adminRefreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/api/auth/refresh', { refreshToken });
      const { accessToken } = response.data;

      localStorage.setItem('adminToken', accessToken);
      toast.success('Session extended successfully!');
      setShowWarning(false);

      // Reschedule the warning for next time
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      toast.error('Failed to extend session. Please login again.');
      handleSignOut();
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    window.location.href = '/login';
  };

  if (!showWarning) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '440px',
          background: 'rgba(28, 36, 75, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <AlertTriangle size={28} style={{ color: '#FFC107' }} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Cabinet Grotesk, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            margin: '0 0 12px',
          }}
        >
          Session Expiring Soon
        </h2>

        {/* Message */}
        <p
          style={{
            fontFamily: 'Instrument Sans, sans-serif',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            margin: '0 0 24px',
            lineHeight: 1.6,
          }}
        >
          Your session will expire in <strong style={{ color: '#FFC107' }}>{countdown} seconds</strong>.
          <br />
          Would you like to stay signed in?
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSignOut}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Instrument Sans, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            Sign Out
          </button>

          <button
            onClick={handleStaySignedIn}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0097B2 0%, #58EDEC 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Instrument Sans, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(88, 237, 236, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Stay Signed In
          </button>
        </div>
      </div>
    </>
  );
};

export default SessionTimeoutWarning;
