import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content} className="glass fade-in">
        <AlertCircle size={64} style={styles.icon} />
        <h1 style={styles.title}>404</h1>
        <h2 style={styles.subtitle}>Page Not Found</h2>
        <p style={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={styles.button}
          className="button-hover"
        >
          <Home size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)',
  },
  content: {
    padding: '48px',
    textAlign: 'center',
    maxWidth: '500px',
  },
  icon: {
    color: '#f87171',
    marginBottom: '24px',
  },
  title: {
    fontSize: '72px',
    fontWeight: '700',
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #0097B2 0%, #58EDEC 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#fff',
  },
  description: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #0097B2 0%, #58EDEC 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
};

export default NotFound;
