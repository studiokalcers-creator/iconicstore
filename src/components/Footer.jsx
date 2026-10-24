import React from 'react';
import { Lock, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer({ onOpenStaffLogin, setCurrentTab }) {
  return (
    <footer style={{ marginTop: '80px', borderTop: '1px solid var(--border)', paddingTop: '48px', paddingBottom: '32px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '36px', paddingBottom: '40px' }}>
          
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--accent-ink)', fontSize: '14px' }}>
                iC
              </div>
              <span style={{ fontWeight: '700', fontSize: '17px' }}>iConicstore</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.6' }}>
              Pusat penjualan produk Apple baru (Garansi Resmi) dan second berkualitas di Indonesia. Transparan, terverifikasi 3uTools, dan garansi sinyal permanen.
            </p>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: 'var(--text)' }}>Halaman Utama</div>
            <button 
              type="button" 
              onClick={() => { setCurrentTab('storefront'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '13px' }}
            >
              Katalog Produk
            </button>
            <button 
              type="button" 
              onClick={() => { setCurrentTab('pricelist'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '13px' }}
            >
              Pricelist Ready Stock
            </button>
            <button 
              type="button" 
              onClick={() => { setCurrentTab('warranty'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '13px' }}
            >
              Cek Garansi &amp; IMEI
            </button>
            <button 
              type="button" 
              onClick={() => { setCurrentTab('tradein'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '13px' }}
            >
              Simulasi Trade-In
            </button>
            <button 
              type="button" 
              onClick={() => { setCurrentTab('lokasi'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', textAlign: 'left', padding: 0, cursor: 'pointer', fontSize: '13px' }}
            >
              Lokasi Cabang Toko
            </button>
          </div>

          {/* Keunggulan Toko */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: 'var(--text)' }}>Jaminan Layanan</div>
            <span style={{ color: 'var(--text-dim)' }}>Garansi Unit s/d 36 Bulan</span>
            <span style={{ color: 'var(--text-dim)' }}>Garansi Sinyal IMEI Permanen</span>
            <span style={{ color: 'var(--text-dim)' }}>QC 3uTools 100% Original Part</span>
            <span style={{ color: 'var(--text-dim)' }}>Bisa COD &amp; Tukar Unit Toko</span>
            <span style={{ color: 'var(--text-dim)' }}>Cicilan 0% Semua Kartu Kredit</span>
          </div>

          {/* Kontak & Toko */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: 'var(--text)' }}>Hubungi Kami</div>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-dim)' }}>
              <Phone style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px' }} />
              <span>WhatsApp: 0812-3456-7890</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-dim)' }}>
              <Clock style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px' }} />
              <span>Buka: 10:00 - 21:00 WIB</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-dim)' }}>
              <MapPin style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px' }} />
              <span>Surabaya &amp; Malang, Jawa Timur</span>
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px', fontSize: '12px', color: 'var(--text-dim)' }}>
          <div>&copy; 2026 iConicstore Indonesia. All rights reserved. Authorized Apple Reseller.</div>
          
          {/* Discreet Staff Portal Link */}
          {onOpenStaffLogin && (
            <button
              type="button"
              onClick={onOpenStaffLogin}
              style={{ background: 'transparent', border: 'none', color: '#4B5563', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 6px', borderRadius: '4px' }}
              title="Akses Khusus Karyawan Toko & Kasir"
            >
              <Lock style={{ width: '11px', height: '11px' }} />
              <span>Portal Karyawan</span>
            </button>
          )}
        </div>

      </div>
    </footer>
  );
}
