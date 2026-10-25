import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Shield,
  Truck,
  CreditCard,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { getApplePresetPhoto } from '../data/mockData';
import Footer from './Footer';

export default function WebStorefront({ 
  units = [], 
  categories = [],
  masterProducts = [],
  branches = [],
  tradeInValuations = {},
  servicePricelist = [],
  storeSettings = {},
  onOpenStaffLogin,
  setCurrentTab
}) {
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [selectedCondition, setSelectedCondition] = useState('Semua Kondisi');
  const [selectedSignal, setSelectedSignal] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const catalogRef = useRef(null);

  // Hero Slides (Hanya banner dengan status active !== false yang ditampilkan di Beranda)
  const heroSlides = useMemo(() => {
    let rawBanners = [];
    if (storeSettings?.heroBanners && Array.isArray(storeSettings.heroBanners) && storeSettings.heroBanners.length > 0) {
      rawBanners = storeSettings.heroBanners;
    } else {
      rawBanners = [
        {
          id: 'slide-1',
          title: 'Pre-Order iPhone 16 Pro Series',
          imageUrl: 'https://iosstore.id/assets/pagebuilder/media/2026/08/pb_20260826_141133_20403e9ff9.png',
          showText: false,
          targetTab: 'pricelist',
          category: 'iphone',
          active: true
        },
        {
          id: 'slide-2',
          title: 'Garansi s/d 36 Bulan & Sinyal Aktif',
          imageUrl: 'https://iosstore.id/assets/pagebuilder/media/2026/08/pb_20260822_100618_1eee45373b.png',
          showText: false,
          targetTab: 'warranty',
          active: true
        },
        {
          id: 'slide-3',
          title: 'Program Tukar Tambah & Cicilan 0%',
          imageUrl: 'https://iosstore.id/assets/pagebuilder/media/2026/10/pb_20261002_152251_e8663f0e9f.png',
          showText: false,
          targetTab: 'tradein',
          active: true
        }
      ];
    }

    // Filter banner aktif (active !== false)
    const activeOnly = rawBanners.filter(b => b && b.active !== false);
    const listToRender = activeOnly.length > 0 ? activeOnly : rawBanners.slice(0, 1);

    return listToRender.map((b, idx) => ({
      id: b.id || `banner-${idx}`,
      title: b.title || `Promo Banner ${idx + 1}`,
      bg: b.imageUrl || b.bg,
      showText: !!b.showText,
      badge: b.badge,
      desc: b.desc,
      btnText: b.btnText,
      active: b.active !== false,
      action: () => {
        if (b.targetTab === 'warranty' || b.targetTab === 'tradein' || b.targetTab === 'lokasi') {
          if (setCurrentTab) setCurrentTab(b.targetTab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (b.targetTab === 'pricelist') {
          if (b.category && b.category !== 'semua') {
            handleCategorySelect(b.category);
          } else {
            if (setCurrentTab) setCurrentTab('pricelist');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else if (b.category) {
          handleCategorySelect(b.category);
        }
      }
    }));
  }, [storeSettings, setCurrentTab]);

  // Autoplay Slider
  useEffect(() => {
    if (isSliderHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isSliderHovered, heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // Base Products List matching iConicstore standards (tersinkronisasi dengan Master Produk)
  const allProducts = useMemo(() => {
    const defaultMock = [
      { id: 'unit-001', name: 'iPhone 13 128GB Midnight Blue', spec: 'Second — BH 89%', badge: 'Grade A+', badgeBg: '#0B1F33', badgeText: '#60A5FA', price: 'Rp 8.499.000', priceNum: 8499000, imei: '356789123456789', signal: 'Resmi Indonesia (iBox)', warranty: '1 Bulan Tukar Unit Toko', category: 'iphone', image: getApplePresetPhoto('iPhone 13') },
      { id: 'unit-002', name: 'iPhone 14 Pro 256GB Deep Purple', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 17.999.000', priceNum: 17999000, imei: '359012389012349', signal: 'Resmi Indonesia (iBox)', warranty: '12 Bulan Resmi Apple Indonesia', category: 'iphone', image: getApplePresetPhoto('iPhone 14 Pro') },
      { id: 'unit-003', name: 'iPad Air 5 64GB Wifi', spec: 'Second — BH 95%', badge: 'Grade A', badgeBg: '#0B1F33', badgeText: '#60A5FA', price: 'Rp 7.250.000', priceNum: 7250000, imei: 'SN-DMPAIR564LK9', signal: 'WiFi Only (Non-IMEI)', warranty: '1 Bulan Tukar Unit Toko', category: 'ipad', image: getApplePresetPhoto('iPad Air 5') },
      { id: 'unit-004', name: 'MacBook Air M2 256GB', spec: 'Second — Like New', badge: 'Grade B', badgeBg: '#2A1B05', badgeText: '#FBBF24', price: 'Rp 13.500.000', priceNum: 13500000, imei: 'SN-C02M2AIR256X', signal: 'Garansi Resmi Apple', warranty: '1 Bulan Tukar Unit Toko', category: 'macbook', image: getApplePresetPhoto('MacBook Air M2') },
      { id: 'unit-005', name: 'iPhone 16 Pro Max 256GB Desert Titanium', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 24.999.000', priceNum: 24999000, imei: '358742110982341', signal: 'Resmi Indonesia (iBox/GDN)', warranty: '12 Bulan Resmi Apple Indonesia', category: 'iphone', image: getApplePresetPhoto('iPhone 16 Pro Max') },
      { id: 'unit-006', name: 'iPhone 15 Pro 128GB Natural Titanium', spec: 'Second — BH 94%', badge: 'Grade A+', badgeBg: '#0B1F33', badgeText: '#60A5FA', price: 'Rp 15.499.000', priceNum: 15499000, imei: '352984102948123', signal: 'Resmi Indonesia (iBox)', warranty: '1 Bulan Tukar Unit Toko', category: 'iphone', image: getApplePresetPhoto('iPhone 15 Pro') },
      { id: 'unit-007', name: 'iPad Pro 11 M4 256GB Space Black', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 18.499.000', priceNum: 18499000, imei: 'SN-DMP4X9012LK8', signal: 'WiFi Only (Non-IMEI)', warranty: '12 Bulan Resmi Apple Indonesia', category: 'ipad', image: getApplePresetPhoto('iPad Pro 11 M4') },
      { id: 'unit-008', name: 'MacBook Air 13 M3 8GB 256GB Midnight', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 18.299.000', priceNum: 18299000, imei: 'SN-C02W9K02MD89', signal: 'Garansi Resmi Apple Indonesia', warranty: '12 Bulan Resmi Apple Indonesia', category: 'macbook', image: getApplePresetPhoto('MacBook Air 13 M3') },
      { id: 'unit-009', name: 'Apple Watch Series 10 46mm GPS Jet Black', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 7.499.000', priceNum: 7499000, imei: 'SN-W10K892019MN', signal: 'Garansi Resmi Digimap', warranty: '12 Bulan Resmi Apple', category: 'watch', image: getApplePresetPhoto('Apple Watch Series 10') },
      { id: 'unit-010', name: 'AirPods Pro Gen 2 Type-C MagSafe', spec: 'Baru — Garansi Resmi', badge: 'BNIB', badgeBg: '#10241A', badgeText: '#4ADE80', price: 'Rp 3.499.000', priceNum: 3499000, imei: 'SN-AP2C892109LK', signal: 'Garansi Resmi iBox', warranty: '12 Bulan Resmi Apple', category: 'accessories', image: getApplePresetPhoto('AirPods Pro Gen 2') }
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
        category: (u.category || 'iphone').toLowerCase(),
        image: u.image || getApplePresetPhoto(u.modelName || u.category),
        imageCustom: u.imageCustom
      }));

    const existingIds = new Set(defaultMock.map(m => m.id));
    const uniqueDynamic = dynamicUnits.filter(d => !existingIds.has(d.id));
    const merged = [...defaultMock, ...uniqueDynamic];

    // Sinkronisasi foto produk dan harga acuan dari Katalog Master Produk jika diedit oleh Owner
    const activeMasters = (masterProducts || []).filter(m => m && m.name && m.image);

    return merged.map(p => {
      // Jika unit fisik punya foto kustom spesifik yang diupload per unit, prioritas utama
      if (p.imageCustom && p.image) return p;

      const pNameLower = (p.name || '').toLowerCase();
      
      // Temukan master product yang paling cocok dengan nama seri produk
      const matchedMaster = activeMasters
        .filter(m => {
          const mNameLower = m.name.toLowerCase();
          return pNameLower.startsWith(mNameLower) || 
                 pNameLower.includes(mNameLower) || 
                 mNameLower.startsWith(pNameLower.split(' ').slice(0, 2).join(' '));
        })
        .sort((a, b) => b.name.length - a.name.length)[0];

      if (matchedMaster) {
        return {
          ...p,
          image: matchedMaster.image,
          price: matchedMaster.baseRetail ? formatRupiah(matchedMaster.baseRetail) : p.price,
          priceNum: matchedMaster.baseRetail || p.priceNum
        };
      }

      // Pastikan selalu ada foto preset Apple yang bersih dan rapi
      if (!p.image || p.image.includes('unsplash.com')) {
        return {
          ...p,
          image: getApplePresetPhoto(p.name || p.category)
        };
      }

      return p;
    });
  }, [units, masterProducts]);

  // Visual Category Card Definitions (Customizable via Pengaturan Toko or default to Apple presets)
  const categoryCards = useMemo(() => {
    const getCount = (catKey) => {
      if (catKey === 'accessories') {
        return allProducts.filter(p => p.category === 'accessories' || p.category === 'audio').length;
      }
      return allProducts.filter(p => p.category === catKey).length;
    };

    const custom = storeSettings?.categoryCards || {};

    return [
      {
        id: 'iphone',
        title: custom.iphone?.title || 'iPhone',
        subtitle: custom.iphone?.subtitle || 'Smartphone Apple iOS',
        image: custom.iphone?.image || 'https://iosstore.id/assets/pagebuilder/media/2026/07/pb_20260723_014144_9ed27b199b.png',
        count: getCount('iphone')
      },
      {
        id: 'ipad',
        title: custom.ipad?.title || 'iPad',
        subtitle: custom.ipad?.subtitle || 'Tablet serbaguna & Pro',
        image: custom.ipad?.image || 'https://iosstore.id/assets/pagebuilder/media/2026/07/pb_20260723_014151_8bbf5a7e63.png',
        count: getCount('ipad')
      },
      {
        id: 'macbook',
        title: custom.macbook?.title || 'MacBook',
        subtitle: custom.macbook?.subtitle || 'Laptop Apple M-Series',
        image: custom.macbook?.image || 'https://iosstore.id/assets/pagebuilder/media/2026/07/pb_20260723_014158_03273f7226.png',
        count: getCount('macbook')
      },
      {
        id: 'watch',
        title: custom.watch?.title || 'Apple Watch',
        subtitle: custom.watch?.subtitle || 'Jam pintar Apple watchOS',
        image: custom.watch?.image || 'https://iosstore.id/assets/pagebuilder/media/2026/07/pb_20260723_014204_af17e5a88f.png',
        count: getCount('watch')
      },
      {
        id: 'audio',
        title: custom.audio?.title || 'AirPods',
        subtitle: custom.audio?.subtitle || 'Audio nirkabel & Spatial',
        image: custom.audio?.image || 'https://iosstore.id/assets/pagebuilder/media/2026/07/pb_20260723_014236_b6ad17f6ce.png',
        count: getCount('audio')
      },
      {
        id: 'accessories',
        title: custom.accessories?.title || 'Aksesoris',
        subtitle: custom.accessories?.subtitle || 'Pelengkap perangkat original',
        image: custom.accessories?.image || 'https://iosstore.id/assets/pagebuilder/media/2026/07/pb_20260723_014240_410329950c.png',
        count: getCount('accessories')
      }
    ];
  }, [allProducts, storeSettings?.categoryCards]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filtered Products
  const products = useMemo(() => {
    return allProducts.filter(p => {
      // Category filter
      if (selectedCategory !== 'semua') {
        if (selectedCategory === 'audio') {
          if (p.category !== 'accessories' && p.category !== 'audio') return false;
        } else if (p.category !== selectedCategory) {
          return false;
        }
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
    <main className="storefront-page">

      {/* 1. HERO SLIDER BANNER (Autoplay + Controls + Smooth Transitions) */}
      <section 
        className="hero-slider-wrap"
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
        aria-label="Banner promosi iConicstore"
      >
        <div className="hero-slider-viewport">
          <div 
            className="hero-slider-track" 
            style={{ transform: `translate3d(-${currentSlide * 100}%, 0, 0)` }}
          >
            {heroSlides.map((slide) => (
              <article 
                key={slide.id} 
                className="hero-slider-slide"
                style={{ backgroundImage: `url('${slide.bg}')`, cursor: 'pointer' }}
                onClick={slide.action}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') slide.action(); }}
                aria-label={slide.title}
              >
                {slide.showText && (
                  <div className="hero-slider-content">
                    {slide.badge && <span className="hero-slider-badge">{slide.badge}</span>}
                    {slide.title && <h1 className="hero-slider-title">{slide.title}</h1>}
                    {slide.desc && <p className="hero-slider-desc">{slide.desc}</p>}
                    {slide.btnText && (
                      <div>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); slide.action(); }} 
                          className="hero-slider-btn"
                        >
                          <span>{slide.btnText}</span>
                          <ArrowRight style={{ width: '15px', height: '15px' }} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        <button 
          type="button" 
          onClick={prevSlide}
          className="hero-slider-arrow hero-slider-arrow--prev" 
          aria-label="Banner sebelumnya"
        >
          <ChevronLeft style={{ width: '22px', height: '22px' }} />
        </button>
        <button 
          type="button" 
          onClick={nextSlide}
          className="hero-slider-arrow hero-slider-arrow--next" 
          aria-label="Banner berikutnya"
        >
          <ChevronRight style={{ width: '22px', height: '22px' }} />
        </button>

        {/* Pagination Dots */}
        <div className="hero-slider-dots">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`hero-slider-dot ${index === currentSlide ? 'is-active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Tampilkan banner ke-${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. PRICELIST CTA BANNER CARD (Identical to reference) */}
      <section className="home-price-card">
        <div>
          <span className="home-price-eyebrow">Harga Produk Terbaru</span>
          <h2>Semua produk Apple dalam satu pricelist.</h2>
          <p>
            Cari harga terbaru iPhone, iPad, MacBook, Apple Watch, AirPods, serta berbagai aksesoris original lainnya dengan garansi jelas dan transparan.
          </p>
          <div className="home-price-tags">
            {['iPhone', 'iPad', 'MacBook', 'Apple Watch', 'AirPods', 'Aksesoris'].map((tag) => (
              <span 
                key={tag} 
                className="home-price-tag"
                onClick={() => {
                  const map = {
                    'iPhone': 'iphone',
                    'iPad': 'ipad',
                    'MacBook': 'macbook',
                    'Apple Watch': 'watch',
                    'AirPods': 'audio',
                    'Aksesoris': 'accessories'
                  };
                  handleCategorySelect(map[tag] || 'semua');
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="home-price-action-box">
          <span>Cari produk dan unit spesifik yang Anda butuhkan.</span>
          <button 
            type="button"
            className="home-price-action-btn"
            onClick={() => {
              if (setCurrentTab) setCurrentTab('pricelist');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>Lihat Pricelist Lengkap</span>
            <b>→</b>
          </button>
        </div>
      </section>

      {/* 3. KATEGORI PRODUK (VISUAL CARDS GRID — The Core Request) */}
      <section>
        <div className="section-heading">
          <div className="section-heading__content">
            <span className="section-eyebrow">Kategori Produk</span>
            <h2>Belanja sesuai kebutuhan Anda.</h2>
            <p>Pilih kategori untuk menemukan perangkat Apple dan unit ready stock yang tersedia.</p>
          </div>

          <button 
            type="button" 
            className="section-heading__link"
            onClick={() => handleCategorySelect('semua')}
          >
            <span>Semua Produk</span>
            <b>→</b>
          </button>
        </div>

        <div className="home-category-grid">
          {categoryCards.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <article 
                key={cat.id} 
                className={`home-category-card ${isActive ? 'is-active' : ''}`}
                onClick={() => handleCategorySelect(cat.id)}
              >
                <div className="home-category-image-wrap">
                  <img 
                    src={cat.image} 
                    alt={`Kategori ${cat.title}`} 
                    loading="lazy" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getApplePresetPhoto(cat.title);
                    }}
                  />
                  {cat.count > 0 && (
                    <span className="home-category-card-count">
                      {cat.count} Ready
                    </span>
                  )}
                </div>

                <div className="home-category-info">
                  <div>
                    <strong className="home-category-title">{cat.title}</strong>
                    <span className="home-category-sub">{cat.subtitle}</span>
                  </div>
                  <div className="home-category-arrow">
                    →
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. READY STOCK CATALOG SECTION WITH LIVE SEARCH & FILTERS */}
      <section ref={catalogRef} id="catalog-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Section Heading */}
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <div className="section-heading__content">
            <span className="section-eyebrow">Ready Stock Toko</span>
            <h2>
              {selectedCategory === 'semua' 
                ? `Pricelist Unit Ready Stock (${products.length} Unit)`
                : `Unit Ready Stock: ${categoryCards.find(c => c.id === selectedCategory)?.title || selectedCategory} (${products.length} Unit)`}
            </h2>
            <p>Stok update otomatis secara realtime dari inventori toko iConicstore</p>
          </div>

          {selectedCategory !== 'semua' && (
            <button 
              type="button"
              onClick={() => setSelectedCategory('semua')}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Tampilkan Semua Kategori ✕
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', background: 'var(--surface)', padding: '16px', borderRadius: '18px', border: '1px solid var(--border)' }}>
          
          <div style={{ flex: '2 1 260px' }}>
            <label htmlFor="storefront-search" style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', marginBottom: '6px' }}>Cari Unit</label>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-dim)' }} />
              <input 
                id="storefront-search" 
                type="text" 
                placeholder="Cari tipe iPhone, kapasitas, warna, IMEI..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', padding: '10px 14px 10px 38px', borderRadius: '10px', minHeight: '40px' }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label htmlFor="storefront-kondisi" style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', marginBottom: '6px' }}>Kondisi Unit</label>
            <select 
              id="storefront-kondisi" 
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', minHeight: '40px', cursor: 'pointer' }}
            >
              <option>Semua Kondisi</option>
              <option>BNIB — Garansi Resmi</option>
              <option>Second — Like New / Grade A+</option>
              <option>Second — Grade A</option>
              <option>Second — Grade B</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label htmlFor="storefront-signal" style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', marginBottom: '6px' }}>Status Sinyal</label>
            <select 
              id="storefront-signal" 
              value={selectedSignal}
              onChange={(e) => setSelectedSignal(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', minHeight: '40px', cursor: 'pointer' }}
            >
              <option>Semua Status</option>
              <option>Resmi (iBox / GDN)</option>
              <option>All Operator</option>
            </select>
          </div>

        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>Tidak ada unit yang sesuai dengan filter</div>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '6px' }}>Coba ubah kata kunci pencarian atau ganti kategori produk.</p>
            <button 
              type="button" 
              onClick={() => {
                setSelectedCategory('semua');
                setSelectedCondition('Semua Kondisi');
                setSelectedSignal('Semua Status');
                setSearchQuery('');
              }}
              style={{ marginTop: '14px', background: 'var(--accent)', color: 'var(--accent-ink)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }}>
            {products.map(p => (
              <div 
                key={p.id}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)', transition: 'transform 0.2s ease, border-color 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {/* Device Graphic Box with Badge */}
                <div 
                  onClick={() => setSelectedDetailProduct(p)}
                  style={{ position: 'relative', aspectRatio: '1.1 / 1', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
                >
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px', transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getApplePresetPhoto(p.name);
                    }}
                  />
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: p.badgeBg, color: p.badgeText, fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '999px', zIndex: 2, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {p.badge}
                  </span>
                </div>

                {/* Product Info */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '750', lineHeight: '1.3', color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{p.spec}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '6px', color: 'var(--accent)' }}>{p.price}</div>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => setSelectedDetailProduct(p)}
                      style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '9px 12px', fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                    >
                      <span>Lihat Detail Unit</span>
                      <ArrowRight style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* 5. KEUNGGULAN TOKO (4 PILAR TRUST LAYANAN) */}
      <section>
        <div className="section-heading">
          <div className="section-heading__content">
            <span className="section-eyebrow">Belanja Lebih Tenang</span>
            <h2>Layanan untuk kenyamanan Anda.</h2>
            <p>Nikmati kemudahan transaksi, perlindungan garansi resmi, dan keamanan berbelanja di iConicstore.</p>
          </div>
        </div>

        <div className="home-benefit-grid">
          
          <article className="home-benefit-item">
            <span className="home-benefit-number">01</span>
            <div className="home-benefit-icon">
              <Truck style={{ width: '28px', height: '28px' }} />
            </div>
            <strong>Bisa COD &amp; Cek Ditempat</strong>
            <p>Pembayaran dapat dilakukan saat pesanan diterima setelah Anda memeriksa kondisi fisik &amp; fungsi unit secara langsung.</p>
          </article>

          <article className="home-benefit-item">
            <span className="home-benefit-number">02</span>
            <div className="home-benefit-icon">
              <ShieldCheck style={{ width: '28px', height: '28px' }} />
            </div>
            <strong>Garansi s/d 36 Bulan</strong>
            <p>Setiap produk mendapatkan perlindungan garansi resmi Apple atau garansi toko dengan jaminan IMEI aktif seumur hidup.</p>
          </article>

          <article className="home-benefit-item">
            <span className="home-benefit-number">03</span>
            <div className="home-benefit-icon">
              <CheckCircle2 style={{ width: '28px', height: '28px' }} />
            </div>
            <strong>Kirim Seluruh Indonesia</strong>
            <p>Pengiriman kilat aman terlindungi asuransi 100% dan packing kayu tebal menggunakan ekspedisi terpercaya.</p>
          </article>

          <article className="home-benefit-item">
            <span className="home-benefit-number">04</span>
            <div className="home-benefit-icon">
              <CreditCard style={{ width: '28px', height: '28px' }} />
            </div>
            <strong>0% Cicilan &amp; Trade-In</strong>
            <p>Pilihan pembayaran cicilan ringan tanpa bunga serta program tukar tambah unit lama dengan taksiran harga tertinggi.</p>
          </article>

        </div>
      </section>

      {/* 6. LOKASI TOKO CABANG (STORE GRID DENGAN MAPS & WHATSAPP) */}
      <section id="lokasi-cabang">
        <div className="section-heading">
          <div className="section-heading__content">
            <span className="section-eyebrow">Lokasi Toko</span>
            <h2>Kunjungi iConicstore terdekat.</h2>
            <p>Temukan alamat toko fisik kami, hubungi staf melalui WhatsApp, atau buka petunjuk arah langsung di Google Maps.</p>
          </div>

          <button 
            type="button" 
            className="section-heading__link"
            onClick={() => {
              if (setCurrentTab) setCurrentTab('lokasi');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>Semua Lokasi Cabang</span>
            <b>→</b>
          </button>
        </div>

        <div className="home-store-grid">
          {(branches && branches.length > 0 ? branches : [
            { id: 'b1', name: 'iConicstore Surabaya Pusat', address: 'Jl. Pemuda No. 45, Embong Kaliasin, Genteng, Kota Surabaya, Jawa Timur 60271', phone: '0812-3456-7890' },
            { id: 'b2', name: 'iConicstore Malang Town Square', address: 'Jl. Veteran No. 2, Penanggungan, Klojen, Kota Malang, Jawa Timur 65111', phone: '0812-9876-5432' }
          ]).map((b) => (
            <article key={b.id} className="home-store-card">
              
              <div className="home-store-top">
                <div className="home-store-identity">
                  <span className="home-store-icon">
                    <MapPin style={{ width: '22px', height: '22px' }} />
                  </span>
                  <div>
                    <small>Cabang Resmi</small>
                    <h3>{b.name}</h3>
                  </div>
                </div>

                <span className="home-store-status">
                  <i />
                  Tersedia
                </span>
              </div>

              <div className="home-store-details">
                <div className="home-store-detail-item">
                  <small>Alamat Toko</small>
                  <strong>{b.address || 'Alamat cabang resmi iConicstore'}</strong>
                </div>

                <div className="home-store-detail-item">
                  <small>Telepon / WhatsApp</small>
                  <a href={`tel:${(b.phone || '081234567890').replace(/[^0-9]/g, '')}`}>
                    {b.phone || '0812-3456-7890'}
                  </a>
                </div>
              </div>

              <div className="home-store-actions">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' ' + (b.address || ''))}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="home-store-btn home-store-btn--primary"
                >
                  <ExternalLink style={{ width: '15px', height: '15px' }} />
                  <span>Buka Petunjuk Arah</span>
                  <b>→</b>
                </a>

                <a 
                  href={`https://wa.me/62${(b.phone || '81234567890').replace(/^0/, '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${b.name}, saya ingin menanyakan ketersediaan unit di toko.`)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="home-store-btn home-store-btn--secondary"
                >
                  <MessageCircle style={{ width: '15px', height: '15px' }} />
                  <span>Hubungi Toko</span>
                </a>
              </div>

            </article>
          ))}
        </div>

        <div className="home-store-notice">
          <span className="home-store-notice-icon">i</span>
          <p>
            Hubungi toko terlebih dahulu sebelum berkunjung untuk memastikan ketersediaan unit spesifik yang Anda cari.
          </p>
        </div>
      </section>

      {/* 7. FOOTER */}
      <Footer onOpenStaffLogin={onOpenStaffLogin} setCurrentTab={setCurrentTab} storeSettings={storeSettings} />

      {/* 8. DETAIL MODAL FOR ORDER VIA WHATSAPP */}
      {selectedDetailProduct && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', color: 'var(--text)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ background: selectedDetailProduct.badgeBg, color: selectedDetailProduct.badgeText, fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px', display: 'inline-block', marginBottom: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {selectedDetailProduct.badge}
                </span>
                <div style={{ fontSize: '16px', fontWeight: '750' }}>{selectedDetailProduct.name}</div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedDetailProduct(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '4px', cursor: 'pointer' }}
                aria-label="Tutup modal"
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {selectedDetailProduct.image && (
              <div style={{ width: '100%', height: '180px', background: 'var(--surface-2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <img 
                  src={selectedDetailProduct.image} 
                  alt={selectedDetailProduct.name} 
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: '12px' }} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getApplePresetPhoto(selectedDetailProduct.name);
                  }}
                />
              </div>
            )}

            <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '20px', border: '1px solid var(--border)' }}>
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
                <span style={{ color: '#30D158', fontWeight: '600' }}>{selectedDetailProduct.signal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Garansi Toko:</span>
                <span style={{ fontWeight: '600' }}>{selectedDetailProduct.warranty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ fontWeight: '700' }}>Harga:</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent)' }}>{selectedDetailProduct.price}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleWhatsAppOrder(selectedDetailProduct)}
                style={{ width: '100%', background: 'var(--accent)', color: 'var(--accent-ink)', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '750', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(10, 132, 255, 0.3)' }}
              >
                <MessageCircle style={{ width: '18px', height: '18px' }} />
                <span>Order via WhatsApp Resmi Toko</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDetailProduct(null)}
                style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
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
