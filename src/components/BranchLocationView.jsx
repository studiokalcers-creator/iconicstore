import React from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import Footer from './Footer';

export default function BranchLocationView({ 
  branches = [], 
  onOpenStaffLogin, 
  setCurrentTab 
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px 60px', width: '100%', boxSizing: 'border-box', flex: 1 }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', color: 'var(--accent)', fontWeight: '700', width: 'fit-content' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: '#4ADE80', display: 'inline-block' }}></span>
            Gerai Fisik Resmi
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Lokasi Cabang &amp; Jam Operasional
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-dim)', lineHeight: '1.5', maxWidth: '720px' }}>
            Kunjungi toko fisik iConicstore terdekat untuk mencoba unit langsung, cek skor 3uTools, transaksi trade-in langsung di tempat, atau klaim garansi toko.
          </p>
        </div>

        {/* Branch Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {branches.map(b => (
            <div 
              key={b.id} 
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Header Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <MapPin style={{ width: '22px', height: '22px' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: 'var(--text)' }}>{b.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Authorized Store &amp; Service Center</div>
                </div>
              </div>

              {/* Information Details */}
              <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <MapPin style={{ width: '16px', height: '16px', color: 'var(--accent)', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text)', marginBottom: '2px' }}>Alamat Toko:</strong>
                    <span style={{ color: 'var(--text-dim)' }}>{b.address}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Clock style={{ width: '16px', height: '16px', color: 'var(--accent)', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text)', marginBottom: '2px' }}>Jam Buka:</strong>
                    <span style={{ color: 'var(--text-dim)' }}>Buka Setiap Hari: 10.00 - 21.00 WIB</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Phone style={{ width: '16px', height: '16px', color: 'var(--accent)', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text)', marginBottom: '2px' }}>Kontak WhatsApp:</strong>
                    <span style={{ color: 'var(--text-dim)' }}>{b.phone}</span>
                  </div>
                </div>
              </div>

              {/* Available Services Pills */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Layanan Tersedia di Cabang Ini:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '11px', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', color: 'var(--text)' }}>
                    Ready Stock BNIB &amp; Second
                  </span>
                  <span style={{ fontSize: '11px', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', color: 'var(--text)' }}>
                    Trade-In iPhone di Tempat
                  </span>
                  <span style={{ fontSize: '11px', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', color: 'var(--text)' }}>
                    Free Pindah Data iOS
                  </span>
                  <span style={{ fontSize: '11px', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', color: 'var(--text)' }}>
                    Cek Fisik &amp; 3uTools Gratis
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
                <a
                  href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=Halo%20iConicstore%2C%20saya%20ingin%20tanya%20stok%20dan%20alamat%20${encodeURIComponent(b.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <MessageCircle style={{ width: '15px', height: '15px' }} />
                  <span>Chat WhatsApp</span>
                </a>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(b.name + ' ' + b.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ExternalLink style={{ width: '14px', height: '14px' }} />
                  <span>Google Maps</span>
                </a>
              </div>

            </div>
          ))}
        </div>

        {/* Store Trust Value Banner */}
        <div style={{ marginTop: '48px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '32px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: '800' }}>Keuntungan Datang Langsung ke Toko Fisik</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px', color: 'var(--accent)' }}>Cek Fisik Sepuasnya</div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                Anda bisa memegang langsung unit, cek TrueTone, kamera, Face ID, dan layar tanpa ada yang disembunyikan.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px', color: 'var(--accent)' }}>QC 3uTools Transparan</div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                Kami sediakan layar iMac di kasir untuk mengetes unit di hadapan Anda agar skor 3uTools 100% hijau terbukti.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px', color: 'var(--accent)' }}>Garansi Toko Jelas</div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                Jika ada kendala sinyal atau mesin dalam masa garansi, bawa kembali ke toko kami untuk servis atau tukar unit.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Universal Customer Footer */}
      <Footer onOpenStaffLogin={onOpenStaffLogin} setCurrentTab={setCurrentTab} />

    </div>
  );
}
