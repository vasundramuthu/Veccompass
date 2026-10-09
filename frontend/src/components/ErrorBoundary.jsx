import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("VecCompass React ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#1a0b2e',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#2e1a47',
            padding: '30px',
            borderRadius: '24px',
            border: '2px solid #ff2e93',
            maxWidth: '600px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffab00', marginBottom: '10px' }}>
              👾 Oops! VecCompass encountered a hiccup
            </h2>
            <p style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '20px' }}>
              {this.state.error?.toString() || "A runtime error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#ff2e93',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
