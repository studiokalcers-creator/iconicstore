import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  MessageCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import Footer from './Footer';

export default function WarrantyCheckView({ 
  units = [], 
  salesHistory = [], 
  onOpenStaffLogin, 
  setCurrentTab 
}) {
  const [searchImei, setSearchImei] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchImei.trim()) return;

    setHasSearched(true);
    const query = searchImei.trim().toUpperCase();

    // Check in sales history first, then in current units
    const foundSale = salesHistory.find(s => s.items && s.items.some(i => i.imei === query));
    const foundUnit = units.find(u => u.imei === query || u.serialNumber === query || u.barcodeCode === query);

    if (foundSale) {
      const item = foundSale.items.find(i => i.imei === query);
      setSearchResult({
        found: true,
        modelName: item.modelName,
        imei: item.imei,
        saleDate: foundSale.date || '23 Oktober 2026',
        customerName: foundSale.customerName || 'Pelanggan Terverifikasi',
        warrantyEnd: '23 November 2026',
        isWarrantyActive: true,
        storeWarranty: item.storeWarranty || '1 Bulan Tukar Unit Toko',
        signalStatus: 'Resmi Indonesia (iBox) — Permanen'
      });
    } else if (foundUnit) {
      setSearchResult({
        found: true,
        modelName: foundUnit.modelName,
        imei: foundUnit.imei,
        saleDate: foundUnit.status === 'sold' ? '23 Oktober 2026' : 'Unit Terdaftar di Database Toko',
        customerName: foundUnit.status === 'sold' ? 'Pelanggan iConicstore' : 'Unit Terdaftar Resmi',
        warrantyEnd: '23 November 2026',
        isWarrantyActive: true,
        storeWarranty: foundUnit.storeWarranty || '1 Bulan Tukar Unit Toko',
        signalStatus: foundUnit.signalWarranty || 'Garansi Sinyal Seumur Hidup'
      });
    } else {
      setSearchResult({ found: false });
    }
  };

  const handleQuickSample = (sampleImei) => {
    setSearchImei(sampleImei);
    setTimeout(() => {
      // Trigger search with sample
      const query = sampleImei;
      setHasSearched(true);
      const foundUnit = units.find(u => u.imei === query);
      if (foundUnit) {
        setSearchResult({
          found: true,
          modelName: foundUnit.modelName,
          imei: foundUnit.imei,
          saleDate: '23 Oktober 2026',
          customerName: 'Pelanggan iConicstore',
          warrantyEnd: '23 November 2026',
          isWarrantyActive: true,
          storeWarranty: foundUnit.storeWarranty,
          signalStatus: foundUnit.signalWarranty
        });
      }
    }, 50);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px 60px', width: '100%', boxSizing: 'border-box', flex: 1 }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px', marginBottom: '32px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', color: 'var(--accent)', fontWeight: '700', width: 'fit-content' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: '#4ADE80', display: 'inline-block' }}></span>
            Layanan Purna Jual Mandiri
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Cek Garansi &amp; Keaslian IMEI
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-dim)', lineHeight: '1.5', maxWidth: '720px' }}>
            Validasi keaslian pembelian perangkat Apple di iConicstore dan periksa sisa masa garansi toko maupun status sinyal secara transparan.
          </p>
        </div>

        {/* Search Container */}
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '28px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="imei-input" style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Nomor IMEI / Serial Number Perangkat
                </label>
                <div style={{ position: 'relative' }}>
                  <Search style={{ width: '18px', height: '18px', position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    id="imei-input"
                    type="text"
                    maxLength={18}
                    placeholder="Contoh: 356789123456789 atau C02M2AIR256X"
                    value={searchImei}
                    onChange={(e) => setSearchImei(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '15px', fontFamily: 'monospace', letterSpacing: '1px', padding: '14px 16px 14px 48px', borderRadius: '12px', minHeight: '52px' }}
                  />
                </div>
              </div>

              {/* Quick Sample Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-dim)' }}>
                <span>Contoh Cepat IMEI Toko:</span>
                <button
                  type="button"
                  onClick={() => handleQuickSample('356789123456789')}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer' }}
                >
                  356789123456789
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSample('359012389012349')}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer' }}
                >
                  359012389012349
                </button>
              </div>

              <button
                type="submit"
                style={{ width: '100%', background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', marginTop: '6px' }}
              >
                Cek Status Garansi Sekarang
              </button>
            </form>
          </div>

          {/* Search Result Card */}
          {hasSearched && (
            <div>
              {searchResult && searchResult.found ? (
                <div style={{ background: 'var(--surface)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Status Seal */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ADE80' }}>
                        <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#4ADE80' }}>Unit Terverifikasi Resmi</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Perangkat terdaftar resmi di sistem iConicstore</div>
                      </div>
                    </div>

                    <span style={{ background: '#10241A', border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '999px' }}>
                      Garansi Aktif
                    </span>
                  </div>

                  {/* Unit Data Grid */}
                  <div style={{ background: 'var(--surface-2)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Model Perangkat:</span>
                      <strong style={{ color: 'var(--text)' }}>{searchResult.modelName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Nomor IMEI Fisik:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text)' }}>{searchResult.imei}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Tanggal Pembelian:</span>
                      <span style={{ fontWeight: '600', color: 'var(--text)' }}>{searchResult.saleDate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Garansi Toko (Tukar Unit):</span>
                      <strong style={{ color: 'var(--accent)' }}>{searchResult.storeWarranty}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Garansi Sinyal IMEI:</span>
                      <strong style={{ color: '#4ADE80' }}>{searchResult.signalStatus}</strong>
                    </div>
                  </div>

                  {/* Help Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <a
                      href={`https://wa.me/6281234567890?text=Halo%20iConicstore%2C%20saya%20ingin%20konsultasi%20garansi%20untuk%20IMEI%20${encodeURIComponent(searchResult.imei)}%20(${encodeURIComponent(searchResult.modelName)})`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: 'var(--accent)', color: 'var(--accent-ink)', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <MessageCircle style={{ width: '16px', height: '16px' }} />
                      <span>Klaim / Konsultasi Garansi via WhatsApp</span>
                    </a>
                  </div>

                </div>
              ) : (
                /* Not Found Card */
                <div style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '999px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', margin: '0 auto' }}>
                    <XCircle style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
                      Nomor IMEI Tidak Ditemukan
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                      Nomor IMEI <strong>{searchImei}</strong> belum tercatat di database iConicstore. Pastikan 15 digit nomor IMEI yang Anda ketik sudah sesuai dengan yang tertera di menu <em>Settings &gt; General &gt; About</em> pada iPhone Anda.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* How to check IMEI Guide */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>
              Cara Mengetahui Nomor IMEI di iPhone:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.8' }}>
              <li>Buka menu <strong>Pengaturan (Settings)</strong> &gt; <strong>Umum (General)</strong> &gt; <strong>Mengenai (About)</strong>.</li>
              <li>Gulir ke bawah hingga menemukan 15 digit baris <strong>IMEI</strong> atau <strong>Nomor Seri (Serial Number)</strong>.</li>
              <li>Atau tekan dial <code>*#06#</code> pada aplikasi Telepon untuk menampilkan IMEI langsung di layar.</li>
            </ol>
          </div>

        </div>

      </main>

      {/* Universal Customer Footer */}
      <Footer onOpenStaffLogin={onOpenStaffLogin} setCurrentTab={setCurrentTab} />

    </div>
  );
}
