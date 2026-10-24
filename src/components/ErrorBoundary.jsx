import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleResetStorage = () => {
    try {
      const keys = [
        'iconicstore_units_v2',
        'iconicstore_resellers',
        'iconicstore_sales',
        'iconicstore_preorders',
        'iconicstore_shift_reports',
        'iconicstore_master_products',
        'iconicstore_settings'
      ];
      keys.forEach(k => localStorage.removeItem(k));
      window.location.hash = '';
      window.location.reload();
    } catch (e) {
      console.error('Failed to reset storage:', e);
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.hash = '';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'var(--bg, #0A0B0D)',
          color: 'var(--text, #F4F5F6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: 'var(--surface, #15171B)',
            border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              marginBottom: '20px'
            }}>
              <AlertTriangle style={{ width: '24px', height: '24px' }} />
            </div>

            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              margin: '0 0 8px',
              letterSpacing: '-0.01em'
            }}>
              Aplikasi Mengalami Kendala Tampilan
            </h1>

            <p style={{
              fontSize: '13px',
              color: 'var(--text-dim, #9AA2AC)',
              lineHeight: '1.5',
              margin: '0 0 20px'
            }}>
              Terjadi kesalahan saat merender komponen. Hal ini biasanya terjadi jika data cache browser tidak kompatibel atau koneksi sesi terputus.
            </p>

            {this.state.error && (
              <div style={{
                background: 'var(--surface-2, #1D2025)',
                border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#EF4444',
                marginBottom: '24px',
                wordBreak: 'break-all',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  width: '100%',
                  background: 'var(--accent, #0A84FF)',
                  color: 'var(--accent-ink, #061423)',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                style={{
                  width: '100%',
                  background: 'var(--surface-2, #1D2025)',
                  border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
                  color: '#EF4444',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Trash2 style={{ width: '15px', height: '15px' }} />
                <span>Bersihkan Cache &amp; Reset Data Toko</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim, #9AA2AC)',
                  padding: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Home style={{ width: '14px', height: '14px' }} />
                <span>Kembali ke Halaman Depan</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
