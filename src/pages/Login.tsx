// /Users/khalid/Desktop/Marathon/src/admin/src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import marathonLogo from '../assets/marathon.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminRefreshToken', refreshToken);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'row',
    }}>
      {/* Left Side - Dark Navy Branding */}
      <div style={{
        width: '40%',
        background: '#1C244B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
      }}
      className="login-left-panel"
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '400px',
        }}>
          {/* Marathon Logo */}
          <img
            src={marathonLogo}
            alt="Marathon"
            style={{
              height: '240px',
              width: 'auto',
              objectFit: 'contain',
            }}
          />

          {/* Title */}
          <h1 style={{
            fontFamily: 'Cabinet Grotesk, sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            color: 'white',
            margin: 0,
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}>
            SBA Marathon
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'Instrument Sans, sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0,
            textAlign: 'center',
          }}>
            Admin Panel
          </p>

          {/* Tagline */}
          <p style={{
            fontFamily: 'Instrument Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'rgba(255, 255, 255, 0.4)',
            margin: 0,
            textAlign: 'center',
          }}>
            Managing the 99-Day Innovation Journey
          </p>

          {/* Accent Line */}
          <div style={{
            width: '60px',
            height: '2px',
            background: '#0097B2',
            borderRadius: '1px',
          }} />
        </div>
      </div>

      {/* Right Side - White Login Form */}
      <div style={{
        width: '60%',
        background: '#FAFBFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
      }}
      className="login-right-panel"
      >
        <div style={{
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Welcome Heading */}
          <h2 style={{
            fontFamily: 'Cabinet Grotesk, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
          }}>
            Welcome back
          </h2>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'Instrument Sans, sans-serif',
            fontSize: '14px',
            color: '#64748b',
            margin: '0 0 32px 0',
          }}>
            Sign in to your admin account
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* Email Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: 'Instrument Sans, sans-serif',
              }}>
                Email address
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Mail
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    color: '#64748b',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@marathon.com"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 14px 0 44px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#1e293b',
                    fontSize: '14px',
                    fontFamily: 'Instrument Sans, sans-serif',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0097B2';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 151, 178, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1e293b',
                marginBottom: '8px',
                fontFamily: 'Instrument Sans, sans-serif',
              }}>
                Password
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Lock
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    color: '#64748b',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 44px 0 44px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#1e293b',
                    fontSize: '14px',
                    fontFamily: 'Instrument Sans, sans-serif',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0097B2';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 151, 178, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                background: '#0097B2',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                fontWeight: 600,
                fontFamily: 'Instrument Sans, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1,
                marginTop: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#007A8E';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 151, 178, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0097B2';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '48px',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'Instrument Sans, sans-serif',
              fontSize: '12px',
              color: '#94a3b8',
              margin: 0,
            }}>
              SBA Marathon Admin v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .login-left-panel {
            display: none !important;
          }
          .login-right-panel {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
