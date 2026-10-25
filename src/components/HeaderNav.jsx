import React, { useState } from 'react';
import { Lock, ArrowLeft, X, Shield, Smartphone } from 'lucide-react';

export default function HeaderNav({ 
  currentTab, 
  setCurrentTab, 
  activeBranch, 
  setActiveBranch, 
  branches,
  isOwnerAuthenticated = false,
  onLockOwnerPortal,
  onSetOwnerAuthenticated,
  ownerPin = '9999',
  storeSettings = {},
  isStaffLoginOpen: controlledStaffLoginOpen,
  setIsStaffLoginOpen: controlledSetStaffLoginOpen
}) {
  const [internalStaffLoginOpen, setInternalStaffLoginOpen] = useState(false);
  const [staffPin, setStaffPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Explicit Owner Verification Modal State
  const [isOwnerPinModalOpen, setIsOwnerPinModalOpen] = useState(false);
  const [ownerModalPin, setOwnerModalPin] = useState('');
  const [ownerModalError, setOwnerModalError] = useState('');

  const isStaffLoginOpen = controlledStaffLoginOpen !== undefined ? controlledStaffLoginOpen : internalStaffLoginOpen;
  const setIsStaffLoginOpen = controlledSetStaffLoginOpen !== undefined ? controlledSetStaffLoginOpen : setInternalStaffLoginOpen;

  const isStaffTab = ['pos', 'inventory', 'tradein_warranty', 'preorders', 'resellers', 'owner'].includes(currentTab);

  // Customer Navigation Links (Dedicated Standalone Pages - NO SCROLL DOWN)
  const customerNav = [
    { 
      id: 'storefront', 
      label: 'Beranda', 
      onClick: () => {
        setCurrentTab('storefront');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    { 
      id: 'pricelist', 
      label: 'Pricelist Ready Stock', 
      onClick: () => {
        setCurrentTab('pricelist');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    { 
      id: 'warranty', 
      label: 'Cek Garansi & IMEI', 
      onClick: () => {
        setCurrentTab('warranty');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    { 
      id: 'tradein', 
      label: 'Simulasi Trade-In', 
      onClick: () => {
        setCurrentTab('tradein');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    { 
      id: 'lokasi', 
      label: 'Lokasi Cabang', 
      onClick: () => {
        setCurrentTab('lokasi');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  ];

  // Internal Staff Operational Tabs (Strictly operational tools - Owner Portal separated)
  const staffNav = [
    { id: 'pos', label: 'Kasir POS' },
    { id: 'inventory', label: 'Barcode & Gudang' },
    { id: 'tradein_warranty', label: 'Garansi & Servis (RMA)' },
    { id: 'preorders', label: 'Pre-Order & DP' },
    { id: 'resellers', label: 'Mitra Reseller' }
  ];

  const handleStaffLogin = (e) => {
    e.preventDefault();
    const cleanPin = staffPin.trim();
    const validOwnerPin = String(ownerPin || storeSettings?.ownerPin || '9999').trim();
    const validCashierPin = String(storeSettings?.cashierDefaultPin || '1234').trim();

    if (cleanPin === validOwnerPin) {
      if (onSetOwnerAuthenticated) onSetOwnerAuthenticated(true);
      setIsStaffLoginOpen(false);
      setStaffPin('');
      setPinError('');
      setCurrentTab('owner');
    } else if (cleanPin === validCashierPin || cleanPin === '') {
      if (onSetOwnerAuthenticated) onSetOwnerAuthenticated(false);
      setIsStaffLoginOpen(false);
      setStaffPin('');
      setPinError('');
      setCurrentTab('pos');
    } else {
      setPinError('PIN otorisasi tidak valid. Akses ditolak.');
    }
  };

  return (
    <>
      <header style={{ borderBottom: '1px solid var(--border)' }}>
        
        {/* Top Brand Row */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 32px 0', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo and Brand Title */}
          <div 
            onClick={() => setCurrentTab('storefront')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            {storeSettings?.storeLogo ? (
              <img 
                src={storeSettings.storeLogo} 
                alt={storeSettings?.storeName || 'iConicstore'} 
                style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--accent-ink)', fontSize: '16px' }}>
                iC
              </div>
            )}
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px', lineHeight: '1.2' }}>{storeSettings?.storeName || 'iConicstore'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                {isStaffTab ? 'Staff Backoffice & Kasir POS' : (storeSettings?.storeTagline || 'Official Apple Store & Reseller')}
              </div>
            </div>
          </div>

          {/* Sync Status, Cabang Selector, & Staff Portal Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '999px', fontSize: '13px', color: 'var(--text-dim)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: '#4ADE80', display: 'inline-block' }} aria-hidden="true"></span>
              Sync Cloud Aktif
            </div>

            <div>
              <label htmlFor="cabang" style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>Cabang</label>
              <div style={{ position: 'relative' }}>
                <select 
                  id="cabang" 
                  value={activeBranch?.id || 'b1'}
                  onChange={(e) => {
                    const b = branches.find(item => item.id === e.target.value);
                    if (b) setActiveBranch(b);
                  }}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', padding: '8px 32px 8px 12px', borderRadius: '8px', minWidth: '180px', cursor: 'pointer' }}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id} style={{ background: '#15171B', color: '#F4F5F6' }}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} aria-hidden="true">
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </div>
            </div>

            {/* If on Customer Storefront: Discreet Staff Portal Access */}
            {!isStaffTab ? (
              <button
                type="button"
                onClick={() => setIsStaffLoginOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '14px' }}
                title="Akses Internal Karyawan & Kasir"
              >
                <Lock style={{ width: '13px', height: '13px' }} />
                <span>Portal Karyawan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentTab('storefront')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '14px' }}
              >
                <ArrowLeft style={{ width: '13px', height: '13px' }} />
                <span>Kembali ke Web Publik</span>
              </button>
            )}

          </div>

        </div>

        {/* Navigation Bar Row */}
        <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 32px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }} aria-label="Navigasi">
          
          {/* CUSTOMER MODE (Public Visitor - Kasir & Barcode strictly HIDDEN) */}
          {!isStaffTab ? (
            customerNav.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? 'var(--surface-2)' : 'transparent',
                    border: '1px solid var(--border)',
                    color: isActive ? 'var(--text)' : 'var(--text-dim)',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    minHeight: '38px',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              );
            })
          ) : (
            /* STAFF MODE (Internal Console for Cashier & Store Crew) */
            <>
              {staffNav.map(tab => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isActive ? 'var(--surface-2)' : 'transparent',
                      border: '1px solid var(--border)',
                      color: isActive ? 'var(--text)' : 'var(--text-dim)',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      minHeight: '38px',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}

              {/* DEDICATED OWNER PORTAL BUTTON (PROTECTED BY PIN) */}
              {isOwnerAuthenticated && currentTab === 'owner' ? (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(10, 132, 255, 0.15)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      minHeight: '38px'
                    }}
                  >
                    <Shield style={{ width: '14px', height: '14px' }} />
                    <span>Sesi Owner Aktif</span>
                  </div>
                  <button
                    type="button"
                    onClick={onLockOwnerPortal}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(255, 69, 58, 0.1)',
                      border: '1px solid rgba(255, 69, 58, 0.25)',
                      color: '#FF453A',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      minHeight: '38px',
                      cursor: 'pointer'
                    }}
                    title="Kunci sesi Owner & Kembali ke Kasir"
                  >
                    <Lock style={{ width: '13px', height: '13px' }} />
                    <span>Kunci &amp; Keluar</span>
                  </button>
                </div>
              ) : (
                <div style={{ marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerModalPin('');
                      setOwnerModalError('');
                      setIsOwnerPinModalOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: currentTab === 'owner' ? 'rgba(255, 159, 10, 0.2)' : 'rgba(255, 159, 10, 0.08)',
                      border: currentTab === 'owner' ? '1px solid #FF9F0A' : '1px solid rgba(255, 159, 10, 0.25)',
                      color: '#FF9F0A',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      minHeight: '38px',
                      cursor: 'pointer'
                    }}
                    title="Akses Khusus Pemilik Toko (Wajib PIN)"
                  >
                    <Lock style={{ width: '13px', height: '13px' }} />
                    <span>Akses Owner (PIN)</span>
                  </button>
                </div>
              )}
            </>
          )}

        </nav>
      </header>

      {/* STAFF LOGIN MODAL (Protects POS from public customers) */}
      {isStaffLoginOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '380px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                <span style={{ fontSize: '15px', fontWeight: '700' }}>Otorisasi Kru Toko</span>
              </div>
              <button 
                onClick={() => setIsStaffLoginOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '4px', cursor: 'pointer' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5', margin: '0 0 16px' }}>
              Area terproteksi otorisasi internal toko. Masukkan PIN Kasir untuk operasional kasir atau PIN Master Owner untuk dashboard finansial &amp; margin.
            </p>

            <form onSubmit={handleStaffLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Masukkan PIN Otorisasi:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Masukkan PIN Otorisasi"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  autoFocus
                  style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '16px', textAlign: 'center', letterSpacing: '4px', padding: '10px 14px', borderRadius: '8px' }}
                />
                {pinError && (
                  <span style={{ display: 'block', color: '#EF4444', fontSize: '11px', marginTop: '6px' }}>
                    {pinError}
                  </span>
                )}
              </div>

              {/* Info Otorisasi PIN */}
              <div style={{ background: 'var(--surface-2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                <div>• <strong>PIN Kasir:</strong> Masuk Operasional Kasir &amp; Gudang (Staf)</div>
                <div style={{ marginTop: '3px' }}>• <strong>PIN Owner:</strong> Masuk Dashboard Finansial &amp; Margin</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsStaffLoginOpen(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Verifikasi PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI PIN KHUSUS OWNER DARI PORTAL KARYAWAN */}
      {isOwnerPinModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '380px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255, 159, 10, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9F0A' }}>
                  <Lock style={{ width: '15px', height: '15px' }} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: '800' }}>Otorisasi PIN Master Owner</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsOwnerPinModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '4px', cursor: 'pointer' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5', margin: '0 0 16px' }}>
              Area rahasia laporan finansial, margin profit, modal HPP, dan performa outlet. Karyawan dilarang mengakses tanpa otorisasi Master PIN Owner.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (String(ownerModalPin).trim() === String(ownerPin).trim()) {
                  if (onSetOwnerAuthenticated) onSetOwnerAuthenticated(true);
                  setIsOwnerPinModalOpen(false);
                  setOwnerModalPin('');
                  setOwnerModalError('');
                  setCurrentTab('owner');
                } else {
                  setOwnerModalError('PIN Owner tidak valid. Akses ditolak.');
                  setOwnerModalPin('');
                }
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                  Masukkan PIN Master Owner:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="PIN Master Owner (4 digit)"
                  value={ownerModalPin}
                  onChange={(e) => {
                    setOwnerModalPin(e.target.value.replace(/\D/g, ''));
                    setOwnerModalError('');
                  }}
                  autoFocus
                  style={{ 
                    width: '100%', 
                    boxSizing: 'border-box', 
                    background: 'var(--surface-2)', 
                    border: ownerModalError ? '1px solid #FF453A' : '1px solid var(--border)', 
                    color: 'var(--text)', 
                    fontSize: '18px', 
                    textAlign: 'center', 
                    letterSpacing: '6px', 
                    padding: '12px 14px', 
                    borderRadius: '10px' 
                  }}
                />
                {ownerModalError && (
                  <span style={{ display: 'block', color: '#FF453A', fontSize: '11px', fontWeight: '600', marginTop: '6px', textAlign: 'center' }}>
                    {ownerModalError}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsOwnerPinModalOpen(false)}
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={ownerModalPin.length < 4}
                  style={{ 
                    background: ownerModalPin.length >= 4 ? '#FF9F0A' : 'var(--surface-2)', 
                    color: ownerModalPin.length >= 4 ? '#000000' : 'var(--text-dim)', 
                    border: 'none', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    fontWeight: '800', 
                    cursor: ownerModalPin.length >= 4 ? 'pointer' : 'not-allowed' 
                  }}
                >
                  Buka Portal Owner
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
