import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught Kohinoor Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 20%, #134E32 0%, #0B3B24 55%, #051A10 100%)',
          color: '#FFFFFF',
          padding: '1.5rem 1rem',
          boxSizing: 'border-box',
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            color: '#121A15',
            borderRadius: '18px',
            border: '1.5px solid #C5A059',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
            padding: '2.25rem 1.75rem',
            maxWidth: '410px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <img
              src="/logo.jpeg"
              alt="Kohinoor Signature Farms"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                border: '2px solid #D4AF37',
                margin: '0 auto 1rem',
                display: 'block',
                objectFit: 'cover'
              }}
            />
            <h2 style={{
              fontFamily: "'Cinzel', serif",
              color: '#0B3B24',
              fontSize: '1.15rem',
              marginBottom: '0.4rem',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              Kohinoor Signature Farms
            </h2>
            <p style={{
              fontSize: '0.825rem',
              color: '#64748B',
              lineHeight: 1.5,
              marginBottom: '1.5rem'
            }}>
              A display or connection update occurred. Please tap below to refresh the portal.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.clear();
                  } catch (e) {}
                  window.location.reload();
                }}
                style={{
                  background: '#0B3B24',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  letterSpacing: '0.01em'
                }}
              >
                Reload & Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/';
                }}
                style={{
                  background: '#F6F2E9',
                  color: '#0B3B24',
                  border: '1px solid #E7E0D3',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Return to Storefront
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);

