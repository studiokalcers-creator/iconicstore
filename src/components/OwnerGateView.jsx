import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';

export default function OwnerGateView({ onVerifyPin, onCancel, ownerPin = '9999' }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin) {
      setError('Silakan masukkan PIN Master Owner.');
      return;
    }

    setIsSubmitting(true);
    const success = onVerifyPin(pin);
    if (!success) {
      setError('PIN Owner tidak valid. Akses ditolak.');
      setPin('');
      setIsSubmitting(false);
    }
  };

  const handleKeyClick = (digit) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleDeleteDigit = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClearPin = () => {
    setPin('');
    setError('');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      background: 'radial-gradient(circle at 50% 20%, rgba(10, 132, 255, 0.08) 0%, transparent 60%)'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '32px 28px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        textAlign: 'center'
      }}>
        
        {/* Security Shield Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(255, 159, 10, 0.12)',
          border: '1px solid rgba(255, 159, 10, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          color: '#FF9F0A'
        }}>
          <ShieldCheck style={{ width: '32px', height: '32px' }} />
        </div>

        {/* Security Badge */}
        <div style={{ marginBottom: '10px' }}>
          <span style={{
            fontSize: '10.5px',
            fontWeight: '800',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            background: 'rgba(255, 69, 58, 0.12)',
            color: '#FF453A',
            border: '1px solid rgba(255, 69, 58, 0.25)',
            padding: '3px 10px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Lock style={{ width: '11px', height: '11px' }} />
            Area Terproteksi • Akses Khusus Owner
          </span>
        </div>

        {/* Title & Warning */}
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>
          Verifikasi Otorisasi Owner
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
          Portal ini memuat data rahasia bisnis (Laba Bersih, HPP Modal, Audit Kasir, &amp; Performa Outlet). Karyawan dilarang mengakses tanpa izin Owner.
        </p>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Masukkan 4-Digit PIN Owner:
            </label>

            {/* Masked PIN Indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '14px'
            }}>
              {[0, 1, 2, 3].map(i => {
                const isFilled = pin.length > i;
                return (
                  <div
                    key={i}
                    style={{
                      width: '46px',
                      height: '52px',
                      borderRadius: '10px',
                      background: isFilled ? 'rgba(10, 132, 255, 0.15)' : 'var(--surface-2)',
                      border: isFilled ? '2px solid var(--accent)' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: '800',
                      color: 'var(--accent)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isFilled ? '•' : ''}
                  </div>
                );
              })}
            </div>

            {/* Hidden / Backup text input for keyboard entry */}
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              placeholder="Atau ketik PIN di sini..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'var(--surface-2)',
                border: error ? '1px solid #FF453A' : '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                padding: '9px 12px',
                fontSize: '13px',
                textAlign: 'center',
                letterSpacing: '2px',
                outline: 'none'
              }}
              autoFocus
            />

            {error && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 69, 58, 0.12)',
                border: '1px solid rgba(255, 69, 58, 0.3)',
                color: '#FF6B6B',
                fontSize: '11.5px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <AlertTriangle style={{ width: '13px', height: '13px' }} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick On-Screen Number Keypad for Tablets & Cashier Displays */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            maxWidth: '280px',
            margin: '0 auto',
            width: '100%'
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyClick(num)}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '16px',
                  fontWeight: '700',
                  padding: '12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.1s'
                }}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClearPin}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                fontSize: '11px',
                fontWeight: '600',
                padding: '12px 6px',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('0')}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '16px',
                fontWeight: '700',
                padding: '12px',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDeleteDigit}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                fontSize: '11px',
                fontWeight: '600',
                padding: '12px 6px',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              Hapus
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <button
              type="submit"
              disabled={isSubmitting || pin.length < 4}
              style={{
                background: pin.length >= 4 ? 'var(--accent)' : 'var(--surface-2)',
                color: pin.length >= 4 ? 'var(--accent-ink)' : 'var(--text-dim)',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: pin.length >= 4 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: pin.length >= 4 ? '0 4px 14px rgba(10, 132, 255, 0.4)' : 'none'
              }}
            >
              <KeyRound style={{ width: '15px', height: '15px' }} />
              <span>Buka Portal Owner</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              <span>Kembali ke Portal Karyawan</span>
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
          Area eksekutif bisnis &amp; laporan finansial terproteksi. Masukkan PIN Master Owner untuk melanjutkan.
        </div>

      </div>
    </div>
  );
}
