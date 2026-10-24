import React, { useState, useMemo } from 'react';
import { 
  MessageCircle, 
  X, 
  ShieldCheck, 
  Smartphone, 
  Wrench, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Lock
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { getApplePresetPhoto } from '../data/mockData';
import Footer from './Footer';

export default function WebStorefront({ 
  units = [], 
  categories = [],
  branches = [],
  tradeInValuations = {},
  servicePricelist = [],
  onOpenStaffLogin,
  setCurrentTab
}) {
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [selectedCondition, setSelectedCondition] = useState('Semua Kondisi');
  const [selectedSignal, setSelectedSignal] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);

  const accent = '#0A84FF';

  const catDefs = useMemo(() => {
    if (categories && categories.length > 0) {
      return [
        { id: 'semua', label: 'Semua Produk' },
        ...categories.map(c => ({ id: c.id, label: c.name }))
      ];
    }
    return [
      { id: 'semua', label: 'Semua Produk' },
      { id: 'iphone', label: 'iPhone' },
      { id: 'ipad', label: 'iPad' },
      { id: 'macbook', label: 'MacBook' },
      { id: 'watch', label: 'Apple Watch' },
      { id: 'accessories', label: 'Aksesoris & Audio' }
    ];
  }, [categories]);

  // Base Products List matching the user's exact specification
  const allProducts = useMemo(() => {
    const defaultMock = [
      { id: 'unit-001', name: 'iPhone 13 128GB Midnight Blue', spec: 'Second — BH 89%', badge: 'Grade A+', badgeBg: '#0B1F33', badgeText: '#60A5FA', price: 'Rp 8.499.000', priceNum: 8499000, imei: '356789123456789', signal: 'Resmi Indonesia (iBox)', warranty: '1 Bulan Tukar Unit Toko', category: 'iphone', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&auto=format&fit=crop&q=80' },
      { id: 'unit-002', name: 'iPhone 14 Pro 256GB Deep Purple', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 17.999.000', priceNum: 17999000, imei: '359012389012349', signal: 'Resmi Indonesia (iBox)', warranty: '12 Bulan Resmi Apple Indonesia', category: 'iphone', image: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80' },
      { id: 'unit-003', name: 'iPad Air 5 64GB Wifi', spec: 'Second — BH 95%', badge: 'Grade A', badgeBg: '#0B1F33', badgeText: '#60A5FA', price: 'Rp 7.250.000', priceNum: 7250000, imei: 'SN-DMPAIR564LK9', signal: 'WiFi Only (Non-IMEI)', warranty: '1 Bulan Tukar Unit Toko', category: 'ipad', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80' },
      { id: 'unit-004', name: 'MacBook Air M2 256GB', spec: 'Second — Like New', badge: 'Grade B', badgeBg: '#2A1B05', badgeText: '#FBBF24', price: 'Rp 13.500.000', priceNum: 13500000, imei: 'SN-C02M2AIR256X', signal: 'Garansi Resmi Apple', warranty: '1 Bulan Tukar Unit Toko', category: 'macbook', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
      { id: 'unit-005', name: 'iPhone 16 Pro Max 256GB Desert Titanium', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 24.999.000', priceNum: 24999000, imei: '358742110982341', signal: 'Resmi Indonesia (iBox/GDN)', warranty: '12 Bulan Resmi Apple Indonesia', category: 'iphone', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80' },
      { id: 'unit-006', name: 'iPhone 15 Pro 128GB Natural Titanium', spec: 'Second — BH 94%', badge: 'Grade A+', badgeBg: '#0B1F33', badgeText: '#60A5FA', price: 'Rp 15.499.000', priceNum: 15499000, imei: '352984102948123', signal: 'Resmi Indonesia (iBox)', warranty: '1 Bulan Tukar Unit Toko', category: 'iphone', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80' },
      { id: 'unit-007', name: 'iPad Pro 11 M4 256GB Space Black', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 18.499.000', priceNum: 18499000, imei: 'SN-DMP4X9012LK8', signal: 'WiFi Only (Non-IMEI)', warranty: '12 Bulan Resmi Apple Indonesia', category: 'ipad', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80' },
      { id: 'unit-008', name: 'MacBook Air 13 M3 8GB 256GB Midnight', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 18.299.000', priceNum: 18299000, imei: 'SN-C02W9K02MD89', signal: 'Garansi Resmi Apple Indonesia', warranty: '12 Bulan Resmi Apple Indonesia', category: 'macbook', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
      { id: 'unit-009', name: 'Apple Watch Series 10 46mm GPS Jet Black', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 7.499.000', priceNum: 7499000, imei: 'SN-W10K892019MN', signal: 'Garansi Resmi Digimap', warranty: '12 Bulan Resmi Apple', category: 'watch', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80' },
      { id: 'unit-010', name: 'AirPods Pro Gen 2 Type-C MagSafe', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 3.499.000', priceNum: 3499000, imei: 'SN-AP2C892109LK', signal: 'Garansi Resmi iBox', warranty: '12 Bulan Resmi Apple', category: 'accessories', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80' }
    ];

    const dynamicUnits = (units || [])
      .filter(u => u && u.status === 'available')
      .map(u => ({
        id: u.id,
        name: u.modelName,
        spec: u.batteryHealth ? `${u.condition} — BH ${u.batteryHealth}%` : u.condition,
        badge: u.condition && u.condition.includes('Baru') ? 'BNIB' : (u.grade || 'Grade A+'),
        badgeBg: u.condition && u.condition.includes('Baru') ? '#10241A' : '#0B1F33',
        badgeText: u.condition && u.condition.includes('Baru') ? '#4ADE80' : '#60A5FA',
        price: formatRupiah(u.priceRetail),
        priceNum: u.priceRetail,
        imei: u.imei || u.serialNumber || u.barcodeCode,
        signal: u.signalOrigin || 'Resmi Indonesia',
        warranty: u.storeWarranty || '1 Bulan Tukar Unit Toko',
        category: u.category || 'iphone',
        image: u.image || getApplePresetPhoto(u.modelName || u.category)
      }));

    const existingIds = new Set(defaultMock.map(m => m.id));
    const uniqueDynamic = dynamicUnits.filter(d => !existingIds.has(d.id));

    return [...defaultMock, ...uniqueDynamic];
  }, [units]);

  // Filtered Products
  const products = useMemo(() => {
    return allProducts.filter(p => {
      // Category filter
      if (selectedCategory !== 'semua' && p.category !== selectedCategory) {
        return false;
      }

      // Condition filter
      const spec = p.spec || '';
      const badge = p.badge || '';
      const signal = p.signal || '';

      if (selectedCondition !== 'Semua Kondisi') {
        if (selectedCondition.includes('BNIB') && !spec.includes('Baru')) return false;
        if (selectedCondition.includes('Grade A+') && (!badge.includes('A+') || spec.includes('Baru'))) return false;
        if (selectedCondition.includes('Grade A') && !selectedCondition.includes('A+') && (!badge.includes('Grade A') || badge.includes('A+'))) return false;
        if (selectedCondition.includes('Grade B') && !badge.includes('Grade B')) return false;
      }

      // Signal filter
      if (selectedSignal !== 'Semua Status') {
        if (selectedSignal.includes('Resmi') && !signal.includes('Resmi')) return false;
        if (selectedSignal.includes('All Operator') && !signal.includes('All Operator')) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchImei = (p.imei || '').toLowerCase().includes(q);
        const matchSpec = spec.toLowerCase().includes(q);
        if (!matchName && !matchImei && !matchSpec) return false;
      }

      return true;
    });
  }, [allProducts, selectedCategory, selectedCondition, selectedSignal, searchQuery]);

  const handleWhatsAppOrder = (product) => {
    const text = encodeURIComponent(
      `Halo iConicstore, saya tertarik dengan unit di katalog:\n\n` +
      `Model: ${product.name}\n` +
      `Kondisi: ${product.spec}\n` +
      `IMEI: ${product.imei}\n` +
      `Garansi: ${product.warranty}\n` +
      `Harga: ${product.price}\n\n` +
      `Apakah unit ini masih tersedia di cabang terdekat? Terima kasih.`
    );
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  return (
    <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 32px 80px', width: '100%', boxSizing: 'border-box' }}>

      {/* HERO SECTION — 100% Identical to user template */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '56px', borderBottom: '1px solid var(--border)' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', color: 'var(--accent)', fontWeight: '600', width: 'fit-content' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M12 2l1.8 5.6H19l-4.6 3.4 1.8 5.6L12 13.2 7.8 16.6l1.8-5.6L5 7.6h5.2z"></path>
          </svg>
          Official Release 2026
        </div>

        <div style={{ maxWidth: '620px' }}>
          <h1 style={{ margin: '0 0 12px', fontSize: '44px', lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.01em' }}>
            Pre-Order iPhone 16 Pro
          </h1>
          <p style={{ margin: 0, fontSize: '17px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
            Titanium Grade 5. Chipset A18 Pro. Kamera 48MP Fusion.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => {
              if (setCurrentTab) setCurrentTab('pricelist');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', padding: '13px 22px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '44px', boxSizing: 'border-box', cursor: 'pointer' }}
          >
            Lihat Pricelist
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6"></path>
            </svg>
          </button>
          <button 
            type="button" 
            onClick={() => {
              if (setCurrentTab) setCurrentTab('tradein');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '13px 22px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', minHeight: '44px', cursor: 'pointer' }}
          >
            Simulasi Tukar Tambah
          </button>
        </div>

        {/* 4 Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '14px', marginTop: '12px' }}>
          
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z"></path>
              </svg>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>Garansi s/d 36 Bulan</div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.4' }}>Garansi resmi &amp; toko jelas</div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 20h2v-4H4v4zm5 0h2v-8H9v8zm5 0h2v-12h-2v12zm5 0h2V4h-2v16z"></path>
              </svg>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>Garansi Sinyal Pasti</div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.4' }}>iBox &amp; Bea Cukai permanen</div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M8.5 12.5l2.3 2.3L16 9.5"></path>
              </svg>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>QC 3uTools 100%</div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.4' }}>Part original &amp; BH transparan</div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"></path>
                <circle cx="12" cy="10" r="2.4"></circle>
              </svg>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>Toko Fisik &amp; COD</div>
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.4' }}>Surabaya &amp; Malang ready</div>
          </div>

        </div>

      </section>

      {/* CATALOG SECTION — 100% Identical to user template */}
      <section id="pricelist" style={{ paddingTop: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Category Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {catDefs.map(c => {
            const isChipActive = c.id === selectedCategory;
            const chipStyle = isChipActive
              ? { background: accent, border: `1px solid ${accent}`, color: 'var(--accent-ink)', padding: '9px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', minHeight: '40px', cursor: 'pointer' }
              : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '9px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '600', minHeight: '40px', cursor: 'pointer' };

            return (
              <button 
                key={c.id}
                type="button" 
                onClick={() => setSelectedCategory(c.id)}
                className="chip" 
                style={chipStyle}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          
          <div style={{ flex: '2 1 280px' }}>
            <label htmlFor="cari" style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Cari Produk</label>
            <div style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <path d="M21 21l-4.3-4.3"></path>
              </svg>
              <input 
                id="cari" 
                type="text" 
                placeholder="Cari seri iPhone, warna, atau nomor IMEI..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px', padding: '11px 14px 11px 40px', borderRadius: '10px', minHeight: '44px' }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 160px' }}>
            <label htmlFor="kondisi" style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Kondisi</label>
            <div style={{ position: 'relative' }}>
              <select 
                id="kondisi" 
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px', padding: '11px 32px 11px 14px', borderRadius: '10px', minHeight: '44px', cursor: 'pointer' }}
              >
                <option>Semua Kondisi</option>
                <option>BNIB — Garansi Resmi</option>
                <option>Second — Like New / Grade A+</option>
                <option>Second — Grade A</option>
                <option>Second — Grade B</option>
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} aria-hidden="true">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </div>
          </div>

          <div style={{ flex: '1 1 160px' }}>
            <label htmlFor="sinyal" style={{ display: 'block', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px' }}>Jenis IMEI</label>
            <div style={{ position: 'relative' }}>
              <select 
                id="sinyal" 
                value={selectedSignal}
                onChange={(e) => setSelectedSignal(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px', padding: '11px 32px 11px 14px', borderRadius: '10px', minHeight: '44px', cursor: 'pointer' }}
              >
                <option>Semua Status</option>
                <option>Resmi (iBox / GDN)</option>
                <option>All Operator</option>
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} aria-hidden="true">
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </div>
          </div>

        </div>

        {/* Section Heading — Pure Customer Language */}
        <div>
          <h2 style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: '700' }}>Pricelist Unit Ready Stock ({products.length} Unit)</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>Stok update otomatis secara realtime dari gudang toko</p>
        </div>

        {/* Products Grid — 100% Identical to user template (NO + Kasir BUTTON) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '18px' }}>
          {products.map(p => (
            <div 
              key={p.id}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Device Graphic Box with Badge */}
              <div 
                onClick={() => setSelectedDetailProduct(p)}
                style={{ position: 'relative', aspectRatio: '1/1', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
              >
                {p.image ? (
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px', transition: 'transform 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ) : (
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-dim)' }} aria-hidden="true">
                    <rect x="7" y="2" width="10" height="20" rx="2.5"></rect>
                    <path d="M11 18h2"></path>
                  </svg>
                )}
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: p.badgeBg, color: p.badgeText, fontSize: '11px', fontWeight: '700', padding: '4px 9px', borderRadius: '999px', zIndex: 2, backdropFilter: 'blur(8px)' }}>
                  {p.badge}
                </span>
              </div>

              {/* Product Info */}
              <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', lineHeight: '1.3' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{p.spec}</div>
                <div style={{ fontSize: '17px', fontWeight: '700', marginTop: '4px' }}>{p.price}</div>
                
                <div style={{ marginTop: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => setSelectedDetailProduct(p)}
                    style={{ background: 'transparent', border: 'none', fontSize: '13px', fontWeight: '600', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0, cursor: 'pointer' }}
                  >
                    Lihat Detail
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6"></path>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* FOOTER */}
      <Footer onOpenStaffLogin={onOpenStaffLogin} setCurrentTab={setCurrentTab} />

      {/* DETAIL MODAL FOR ORDER VIA WHATSAPP (NO POS BUTTONS) */}
      {selectedDetailProduct && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ background: selectedDetailProduct.badgeBg, color: selectedDetailProduct.badgeText, fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px', display: 'inline-block', marginBottom: '4px' }}>
                  {selectedDetailProduct.badge}
                </span>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>{selectedDetailProduct.name}</div>
              </div>
              <button 
                onClick={() => setSelectedDetailProduct(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '4px', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {selectedDetailProduct.image && (
              <div style={{ width: '100%', height: '180px', background: 'var(--surface-2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '16px' }}>
                <img 
                  src={selectedDetailProduct.image} 
                  alt={selectedDetailProduct.name} 
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: '12px' }} 
                />
              </div>
            )}

            <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>IMEI Fisik:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text)' }}>{selectedDetailProduct.imei}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Kondisi:</span>
                <span style={{ fontWeight: '600' }}>{selectedDetailProduct.spec}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Status Sinyal:</span>
                <span style={{ color: '#4ADE80', fontWeight: '600' }}>{selectedDetailProduct.signal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Garansi Toko:</span>
                <span style={{ fontWeight: '600' }}>{selectedDetailProduct.warranty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ fontWeight: '700' }}>Harga:</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent)' }}>{selectedDetailProduct.price}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleWhatsAppOrder(selectedDetailProduct)}
                style={{ width: '100%', background: 'var(--accent)', color: 'var(--accent-ink)', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}
              >
                <MessageCircle style={{ width: '17px', height: '17px' }} />
                <span>Order via WhatsApp Resmi Toko</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDetailProduct(null)}
                style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
