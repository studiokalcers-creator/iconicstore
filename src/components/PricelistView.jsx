import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MessageCircle, 
  X, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  ChevronDown,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { getApplePresetPhoto } from '../data/mockData';
import Footer from './Footer';

export default function PricelistView({ 
  units = [], 
  categories = [],
  masterProducts = [],
  branches = [], 
  activeBranch,
  setActiveBranch,
  onOpenStaffLogin,
  setCurrentTab 
}) {
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [selectedCondition, setSelectedCondition] = useState('Semua Kondisi');
  const [selectedSignal, setSelectedSignal] = useState('Semua Status');
  const [selectedBranch, setSelectedBranch] = useState(() => activeBranch?.id || 'semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Sinkronisasi otomatis saat cabang aktif di header atas berubah
  useEffect(() => {
    if (activeBranch?.id) {
      setSelectedBranch(activeBranch.id);
    }
  }, [activeBranch?.id]);

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    if (branchId !== 'semua' && setActiveBranch) {
      const target = branches.find(b => b.id === branchId);
      if (target) setActiveBranch(target);
    }
  };

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

  // Base Products List: Sinkron 100% dengan database unit fisik real-time & Katalog Master Produk
  const allProducts = useMemo(() => {
    const defaultMock = [
      { id: 'unit-001', name: 'iPhone 13 128GB Midnight Blue', spec: 'Second — BH 89%', badge: 'Grade A+', badgeBg: '#0B1F33', badgeText: '#60A5FA', price: 'Rp 8.499.000', priceNum: 8499000, imei: '356789123456789', signal: 'Resmi Indonesia (iBox)', warranty: '1 Bulan Tukar Unit Toko', category: 'iphone', branchId: 'b1', branchName: 'iConicstore', image: '/products/m-ip13.jpg' },
      { id: 'unit-002', name: 'iPhone 14 Pro 256GB Deep Purple', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 17.999.000', priceNum: 17999000, imei: '359012389012349', signal: 'Resmi Indonesia (iBox)', warranty: '12 Bulan Resmi Apple Indonesia', category: 'iphone', branchId: 'b1', branchName: 'iConicstore', image: '/products/m-ip14p.jpg' },
      { id: 'unit-003', name: 'iPad Air 5 64GB Wifi', spec: 'Second — BH 95%', badge: 'Grade A', badgeBg: '#0B1F33', badgeText: '#60A5FA', price: 'Rp 7.250.000', priceNum: 7250000, imei: 'SN-DMPAIR564LK9', signal: 'WiFi Only (Non-IMEI)', warranty: '1 Bulan Tukar Unit Toko', category: 'ipad', branchId: 'b1', branchName: 'iConicstore', image: getApplePresetPhoto('iPad Air 5') },
      { id: 'unit-004', name: 'MacBook Air M2 256GB', spec: 'Second — Like New', badge: 'Grade B', badgeBg: '#2A1B05', badgeText: '#FBBF24', price: 'Rp 13.500.000', priceNum: 13500000, imei: 'SN-C02M2AIR256X', signal: 'Garansi Resmi Apple', warranty: '1 Bulan Tukar Unit Toko', category: 'macbook', branchId: 'b1', branchName: 'iConicstore', image: getApplePresetPhoto('MacBook Air M2') },
      { id: 'unit-005', name: 'iPhone 16 Pro Max 256GB Desert Titanium', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 24.999.000', priceNum: 24999000, imei: '358742110982341', signal: 'Resmi Indonesia (iBox/GDN)', warranty: '12 Bulan Resmi Apple Indonesia', category: 'iphone', branchId: 'b1', branchName: 'iConicstore', image: '/products/m-ip16pm.jpg' }
    ];

    const availableUnits = (units || []).filter(u => u && u.status === 'available');
    const sourceList = availableUnits.length > 0 ? availableUnits : defaultMock;

    return sourceList.map(u => {
      // Cabang fisik toko dari data branches
      const branchObj = (branches || []).find(b => b.id === u.branchId);
      const branchName = branchObj ? branchObj.name : ((branches && branches[0]?.name) || 'iConicstore');
      const branchId = u.branchId || (branches && branches[0]?.id) || 'b1';

      // Temukan kecocokan Katalog Master Produk berdasarkan masterId atau kemiripan nama seri
      const uName = (u.modelName || u.name || '').toLowerCase();
      const matchedMaster = (masterProducts || []).find(m => {
        if (!m) return false;
        if (u.masterId && m.id && (u.masterId === m.id || m.id.includes(u.masterId) || u.masterId.includes(m.id))) {
          return true;
        }
        const mName = (m.name || '').toLowerCase();
        return uName.startsWith(mName) || uName.includes(mName);
      });

      // Foto produk: foto unit jika kustom > foto katalog master produk > preset Apple
      let finalImage = u.image;
      if (!finalImage || finalImage.includes('unsplash.com')) {
        if (matchedMaster && matchedMaster.image && !matchedMaster.image.includes('unsplash.com')) {
          finalImage = matchedMaster.image;
        } else {
          finalImage = getApplePresetPhoto(u.modelName || u.name || matchedMaster?.name || u.category);
        }
      }

      // Kategori produk (diselaraskan dengan kategori Master Produk jika ada)
      const category = (matchedMaster?.category || u.category || 'iphone').toLowerCase();

      // Harga jual acuan (prioritas harga unit, jika 0 fallback ke harga retail Master Produk)
      const rawPrice = u.priceRetail !== undefined ? u.priceRetail : (u.priceNum !== undefined ? u.priceNum : (matchedMaster?.baseRetail || matchedMaster?.priceRetail || 0));
      const priceNum = Number(rawPrice) || 0;

      // Kondisi & Badge Grade
      const isBaru = (u.condition && u.condition.includes('Baru')) || u.grade === 'BNIB' || (u.spec && u.spec.includes('Baru'));
      const spec = u.spec || (u.batteryHealth ? `${u.condition || 'Second'} — BH ${u.batteryHealth}%` : (u.condition || 'Second Like New'));

      let badge = u.badge || (isBaru ? 'BNIB' : (u.grade || 'Grade A+'));
      let badgeBg = '#0B1F33';
      let badgeText = '#60A5FA';
      if (isBaru || badge === 'BNIB') {
        badge = 'BNIB';
        badgeBg = '#10241A';
        badgeText = '#4ADE80';
      } else if (badge.includes('Grade B')) {
        badgeBg = '#2A1B05';
        badgeText = '#FBBF24';
      }

      return {
        id: u.id,
        name: u.modelName || u.name,
        spec,
        badge,
        badgeBg,
        badgeText,
        price: formatRupiah(priceNum),
        priceNum,
        imei: u.imei || u.serialNumber || u.barcodeCode || '-',
        signal: u.signalOrigin || u.signal || 'Resmi Indonesia (iBox)',
        warranty: u.storeWarranty || u.warranty || '1 Bulan Tukar Unit Toko',
        category,
        branchId,
        branchName,
        image: finalImage,
        imageCustom: !!u.imageCustom
      };
    });
  }, [units, branches, masterProducts]);

  // Filtered Products
  const products = useMemo(() => {
    return allProducts.filter(p => {
      // Category filter (mendukung audio & aksesoris secara luwes)
      if (selectedCategory !== 'semua') {
        const cat = (p.category || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (sel === 'accessories' || sel === 'audio') {
          if (cat !== 'accessories' && cat !== 'audio' && !cat.includes('airpod')) return false;
        } else if (cat !== sel) {
          return false;
        }
      }

      // Branch filter
      if (selectedBranch !== 'semua' && p.branchId !== selectedBranch) {
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
  }, [allProducts, selectedCategory, selectedCondition, selectedSignal, selectedBranch, searchQuery]);

  const handleWhatsAppOrder = (product) => {
    const text = encodeURIComponent(
      `Halo iConicstore, saya ingin menanyakan ketersediaan unit di Pricelist Ready Stock:\n\n` +
      `Model: ${product.name}\n` +
      `Kondisi: ${product.spec} (${product.badge})\n` +
      `IMEI/SN: ${product.imei}\n` +
      `Sinyal: ${product.signal}\n` +
      `Garansi: ${product.warranty}\n` +
      `Lokasi: ${product.branchName}\n` +
      `Harga: ${product.price}\n\n` +
      `Apakah unit ini bisa saya amankan/booking hari ini? Terima kasih.`
    );
    window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px 60px', width: '100%', boxSizing: 'border-box', flex: 1 }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', color: 'var(--accent)', fontWeight: '700', width: 'fit-content' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: '#4ADE80', display: 'inline-block' }}></span>
            Real-time Ready Stock Inventory
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                Pricelist Unit Ready Stock
              </h1>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                Daftar unit fisik ready stock yang tersedia di toko hari ini. Update otomatis secara real-time.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--surface-2)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'grid' ? 'var(--text)' : 'var(--text-dim)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LayoutGrid style={{ width: '14px', height: '14px' }} />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? 'var(--surface-2)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'table' ? 'var(--text)' : 'var(--text-dim)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ListFilter style={{ width: '14px', height: '14px' }} />
                <span>Tabel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '28px' }}>
          
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

          {/* Detailed Filters (Search + Branch + Condition + Signal) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            
            {/* Search Input */}
            <div style={{ gridColumn: 'span 2' }}>
              <label htmlFor="search-pl" style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>Cari Unit / IMEI</label>
              <div style={{ position: 'relative' }}>
                <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  id="search-pl" 
                  type="text" 
                  placeholder="Cari seri iPhone, warna, atau IMEI..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px', padding: '11px 14px 11px 40px', borderRadius: '10px', minHeight: '44px' }}
                />
              </div>
            </div>

            {/* Branch Filter */}
            <div>
              <label htmlFor="branch-pl" style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>Cabang Toko</label>
              <div style={{ position: 'relative' }}>
                <select 
                  id="branch-pl" 
                  value={selectedBranch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px', padding: '11px 32px 11px 14px', borderRadius: '10px', minHeight: '44px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                >
                  <option value="semua">Semua Cabang ({branches.length > 0 ? `${branches.length} Outlet` : 'Seluruh Toko'})</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id} style={{ background: '#15171B', color: '#F4F5F6' }}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown style={{ width: '14px', height: '14px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <label htmlFor="kondisi-pl" style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>Kondisi</label>
              <div style={{ position: 'relative' }}>
                <select 
                  id="kondisi-pl" 
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px', padding: '11px 32px 11px 14px', borderRadius: '10px', minHeight: '44px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                >
                  <option>Semua Kondisi</option>
                  <option>BNIB — Garansi Resmi</option>
                  <option>Second — Like New / Grade A+</option>
                  <option>Second — Grade A</option>
                  <option>Second — Grade B</option>
                </select>
                <ChevronDown style={{ width: '14px', height: '14px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
              </div>
            </div>

            {/* Signal Filter */}
            <div>
              <label htmlFor="sinyal-pl" style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>Status Sinyal</label>
              <div style={{ position: 'relative' }}>
                <select 
                  id="sinyal-pl" 
                  value={selectedSignal}
                  onChange={(e) => setSelectedSignal(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px', padding: '11px 32px 11px 14px', borderRadius: '10px', minHeight: '44px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                >
                  <option>Semua Status</option>
                  <option>Resmi (iBox / GDN)</option>
                  <option>All Operator</option>
                </select>
                <ChevronDown style={{ width: '14px', height: '14px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
              </div>
            </div>

          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
            Menampilkan <strong style={{ color: 'var(--text)' }}>{products.length}</strong> unit yang siap diambil atau dikirim
          </div>
        </div>

        {/* CONTENT DISPLAY: GRID OR TABLE */}
        {viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px', marginTop: '24px' }}>
            {products.map(p => (
              <div 
                key={p.id}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {/* Visual Graphic */}
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
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#FFFFFF', fontSize: '10px', padding: '3px 8px', borderRadius: '6px', zIndex: 2, backdropFilter: 'blur(8px)' }}>
                    {p.branchName.replace('Cabang ', '')}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', lineHeight: '1.3' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{p.spec}</div>
                  <div style={{ fontSize: '11px', color: '#4ADE80', fontWeight: '600' }}>{p.signal}</div>
                  
                  <div style={{ fontSize: '18px', fontWeight: '800', marginTop: 'auto', paddingTop: '10px' }}>
                    {p.price}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => setSelectedDetailProduct(p)}
                      style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', fontWeight: '600', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppOrder(p)}
                      style={{ background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', fontSize: '12px', fontWeight: '700', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <MessageCircle style={{ width: '13px', height: '13px' }} />
                      <span>Order</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div style={{ marginTop: '24px', overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
            <table className="tidy-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 16px' }}>Unit &amp; Model</th>
                  <th style={{ padding: '14px 16px' }}>Grade</th>
                  <th style={{ padding: '14px 16px' }}>Status Sinyal</th>
                  <th style={{ padding: '14px 16px' }}>No. IMEI / SN</th>
                  <th style={{ padding: '14px 16px' }}>Cabang</th>
                  <th style={{ padding: '14px 16px' }}>Harga Ready</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
                          ) : (
                            <Smartphone style={{ width: '18px', height: '18px', color: 'var(--text-dim)' }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text)' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{p.spec}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: p.badgeBg, color: p.badgeText, fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px' }}>
                        {p.badge}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#4ADE80', fontWeight: '600', fontSize: '12px' }}>
                      {p.signal}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-dim)', fontSize: '12px' }}>
                      {p.imei}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-dim)' }}>
                      {p.branchName.replace('Cabang ', '')}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '800', fontSize: '14px', color: 'var(--text)' }}>
                      {p.price}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleWhatsAppOrder(p)}
                        style={{ background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MessageCircle style={{ width: '13px', height: '13px' }} />
                        <span>Order WA</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* DETAIL MODAL */}
      {selectedDetailProduct && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)' }}>
            
            {/* High-res Image Preview in Modal */}
            {selectedDetailProduct.image && (
              <div style={{ width: '100%', height: '220px', background: 'var(--surface-2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', overflow: 'hidden' }}>
                <img 
                  src={selectedDetailProduct.image} 
                  alt={selectedDetailProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }}
                />
              </div>
            )}

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
                <span style={{ color: 'var(--text-dim)' }}>Lokasi Cabang:</span>
                <span style={{ fontWeight: '600', color: 'var(--accent)' }}>{selectedDetailProduct.branchName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Status Sinyal:</span>
                <span style={{ color: '#4ADE80', fontWeight: '600' }}>{selectedDetailProduct.signal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Garansi:</span>
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

      {/* Universal Customer Footer */}
      <Footer onOpenStaffLogin={onOpenStaffLogin} setCurrentTab={setCurrentTab} />

    </div>
  );
}
