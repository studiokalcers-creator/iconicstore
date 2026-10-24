import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles, X } from 'lucide-react';

/**
 * Global helper to trigger an Apple-themed in-app Toast notification.
 * @param {string} message - Description message
 * @param {'success' | 'error' | 'warning' | 'info'} type - Toast type
 * @param {string} [title] - Optional title
 */
export const showToast = (message, type = 'success', title = '') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('iconic_toast', { 
      detail: { message, type, title } 
    }));
  }
};

/**
 * Global helper to trigger an Apple-themed modal dialog.
 * @param {string} message - Description message
 * @param {string} [title] - Modal title
 * @param {'success' | 'error' | 'warning' | 'info'} [type] - Modal type
 * @param {Function} [onConfirm] - Callback when confirmed
 */
export const showAlertModal = (message, title = 'Pemberitahuan Sistem', type = 'info', onConfirm = null) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('iconic_alert_modal', { 
      detail: { message, title, type, onConfirm } 
    }));
  }
};

// Safe override of window.alert to prevent ugly browser popups (e.g., "127.0.0.1:5173 menyatakan")
if (typeof window !== 'undefined') {
  window.alert = (msg) => {
    const text = String(msg || '');
    const isError = text.toLowerCase().includes('gagal') || text.toLowerCase().includes('kurang') || text.toLowerCase().includes('wajib') || text.toLowerCase().includes('salah');
    const isSuccess = text.toLowerCase().includes('berhasil') || text.toLowerCase().includes('sukses');
    const type = isError ? 'error' : isSuccess ? 'success' : 'info';
    const title = isError ? 'Perhatian' : isSuccess ? 'Berhasil' : 'Informasi';
    showToast(text, type, title);
  };
}

export default function AppleAlertToast() {
  const [toasts, setToasts] = useState([]);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const { message, type = 'success', title = '' } = e.detail || {};
      if (!message) return;

      const id = `toast-${Date.now()}-${Math.random()}`;
      const defaultTitle = type === 'success' ? 'Berhasil' : type === 'error' ? 'Peringatan' : type === 'warning' ? 'Perhatian' : 'Informasi';

      const newToast = {
        id,
        message,
        type,
        title: title || defaultTitle,
        timestamp: Date.now()
      };

      setToasts(prev => [newToast, ...prev].slice(0, 4));

      // Auto dismiss after 3.8 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3800);
    };

    const handleModalEvent = (e) => {
      const { message, title = 'Pemberitahuan', type = 'info', onConfirm } = e.detail || {};
      if (!message) return;
      setModalData({ message, title, type, onConfirm });
    };

    window.addEventListener('iconic_toast', handleToastEvent);
    window.addEventListener('iconic_alert_modal', handleModalEvent);

    return () => {
      window.removeEventListener('iconic_toast', handleToastEvent);
      window.removeEventListener('iconic_alert_modal', handleModalEvent);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getTheme = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 style={{ width: '18px', height: '18px', color: '#30D158' }} />,
          border: 'rgba(48, 209, 88, 0.3)',
          bgGlow: 'rgba(48, 209, 88, 0.12)',
          badgeColor: '#30D158',
          accent: '#30D158'
        };
      case 'error':
        return {
          icon: <AlertTriangle style={{ width: '18px', height: '18px', color: '#FF453A' }} />,
          border: 'rgba(255, 69, 58, 0.3)',
          bgGlow: 'rgba(255, 69, 58, 0.12)',
          badgeColor: '#FF453A',
          accent: '#FF453A'
        };
      case 'warning':
        return {
          icon: <AlertCircle style={{ width: '18px', height: '18px', color: '#FF9F0A' }} />,
          border: 'rgba(255, 159, 10, 0.3)',
          bgGlow: 'rgba(255, 159, 10, 0.12)',
          badgeColor: '#FF9F0A',
          accent: '#FF9F0A'
        };
      default:
        return {
          icon: <Sparkles style={{ width: '18px', height: '18px', color: '#0A84FF' }} />,
          border: 'rgba(10, 132, 255, 0.3)',
          bgGlow: 'rgba(10, 132, 255, 0.12)',
          badgeColor: '#0A84FF',
          accent: '#0A84FF'
        };
    }
  };

  return (
    <>
      {/* Floating Dynamic Apple Toasts (Top-Center / Top-Right) */}
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100% - 40px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map(toast => {
          const theme = getTheme(toast.type);
          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(21, 23, 27, 0.94)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${theme.border}`,
                borderRadius: '14px',
                padding: '14px 16px',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 15px ' + theme.bgGlow,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'appleSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transition: 'all 0.2s ease',
                color: '#FFFFFF'
              }}
            >
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: theme.bgGlow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {theme.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{toast.title}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#D1D5DB', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {toast.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
              >
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom In-App Apple Alert Modal (Replaces browser alert popups) */}
      {modalData && (
        <div 
          className="modal-backdrop" 
          style={{ 
            zIndex: 9999999, 
            background: 'rgba(0, 0, 0, 0.78)', 
            backdropFilter: 'blur(16px)', 
            WebkitBackdropFilter: 'blur(16px)' 
          }}
        >
          <div 
            className="modal-content"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              background: '#15171B',
              border: `1px solid ${getTheme(modalData.type).border}`,
              borderRadius: '18px',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.8), 0 0 25px ' + getTheme(modalData.type).bgGlow,
              textAlign: 'center',
              animation: 'appleModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div 
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: getTheme(modalData.type).bgGlow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              {getTheme(modalData.type).icon}
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '700', color: '#FFFFFF' }}>
              {modalData.title}
            </h3>

            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5' }}>
              {modalData.message}
            </p>

            <button
              type="button"
              onClick={() => {
                if (modalData.onConfirm) modalData.onConfirm();
                setModalData(null);
              }}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '10px',
                background: getTheme(modalData.type).accent,
                color: modalData.type === 'success' ? '#000000' : '#FFFFFF',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Oke, Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Global Animation Keyframes */}
      <style>{`
        @keyframes appleSlideDown {
          from {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes appleModalPop {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
