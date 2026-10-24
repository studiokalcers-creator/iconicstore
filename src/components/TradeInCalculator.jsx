import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Info, 
  MessageCircle, 
  CheckCircle2, 
  Smartphone, 
  ArrowRight,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { INITIAL_TRADE_IN_VALUATIONS } from '../data/mockData';

const TARGET_PRICES = {
  'iPhone 16 Pro Max': { '256GB': 24999000, '512GB': 27999000, '1TB': 31999000 },
  'iPhone 16 Pro': { '128GB': 20999000, '256GB': 23499000, '512GB': 26499000, '1TB': 29999000 },
  'iPhone 16 Plus': { '128GB': 17999000, '256GB': 19999000, '512GB': 22999000 },
  'iPhone 16': { '128GB': 16499000, '256GB': 18499000, '512GB': 21499000 },
  'iPhone 15 Pro Max': { '256GB': 20499000, '512GB': 22999000, '1TB': 25999000 },
  'iPhone 15 Pro': { '128GB': 15499000, '256GB': 17499000, '512GB': 19999000, '1TB': 22499000 },
  'iPhone 15 Plus': { '128GB': 13499000, '256GB': 15499000 },
  'iPhone 15': { '128GB': 12499000, '256GB': 14499000 },
  'iPhone 14 Pro Max': { '128GB': 15999000, '256GB': 17499000 },
  'iPhone 14 Pro': { '128GB': 13999000, '256GB': 15499000 },
  'iPhone 14': { '128GB': 10499000, '256GB': 11999000 },
  'iPhone 13': { '128GB': 8499000, '256GB': 9699000 }
};

export default function TradeInCalculator({ branches = [], tradeInValuations }) {
  // Mode: 'tradein' (Tukar Tambah) or 'jual' (Jual iPhone ke Toko)
  const [calculatorMode, setCalculatorMode] = useState('jual');

  // Active Valuations dictionary (from prop or initial mock data)
  const valuations = tradeInValuations && Object.keys(tradeInValuations).length > 0 
    ? tradeInValuations 
    : INITIAL_TRADE_IN_VALUATIONS;

  // Step 01: Lokasi Penilaian
  const [selectedBranch, setSelectedBranch] = useState('Semua toko');

  // Step 02: Perangkat Pelanggan (Spesifikasi HP saat ini)
  const [currentModel, setCurrentModel] = useState('');
  const [currentCapacity, setCurrentCapacity] = useState('');
  const [currentVariant, setCurrentVariant] = useState('');
  const [currentColor, setCurrentColor] = useState('Semua warna');

  // Step 03: Pemeriksaan Awal (Kondisi perangkat — 8 fields)
  const [physicalCondition, setPhysicalCondition] = useState('');
  const [batteryHealth, setBatteryHealth] = useState('');
  const [screenCondition, setScreenCondition] = useState('');
  const [faceIdCondition, setFaceIdCondition] = useState('');
  const [cameraCondition, setCameraCondition] = useState('');
  const [signalWifiCondition, setSignalWifiCondition] = useState('');
  const [serviceHistory, setServiceHistory] = useState('');
  const [accessoriesCondition, setAccessoriesCondition] = useState('');

  // Step 04: Perangkat Tujuan (Only for 'tradein' mode)
  const [targetCondition, setTargetCondition] = useState('Semua kondisi');
  const [targetModel, setTargetModel] = useState('');
  const [targetCapacity, setTargetCapacity] = useState('');
  const [targetVariant, setTargetVariant] = useState('Semua varian');
  const [targetColor, setTargetColor] = useState('Semua warna');

  // Calculated Result State
  const [calculationResult, setCalculationResult] = useState(null);

  // Dynamic capacities for selected current model
  const availableCurrentCapacities = useMemo(() => {
    if (!currentModel || !valuations[currentModel]) {
      return ['64GB', '128GB', '256GB', '512GB', '1TB'];
    }
    return Object.keys(valuations[currentModel]);
  }, [currentModel, valuations]);

  // Dynamic capacities for target model
  const availableTargetCapacities = useMemo(() => {
    if (!targetModel || !TARGET_PRICES[targetModel]) {
      return ['128GB', '256GB', '512GB', '1TB'];
    }
    return Object.keys(TARGET_PRICES[targetModel]);
  }, [targetModel]);

  // Handle Calculate
  const handleCalculate = (e) => {
    if (e) e.preventDefault();

    // Defaults if unselected
    const modelOld = currentModel || Object.keys(valuations)[0] || 'iPhone 13';
    const modelMap = valuations[modelOld] || valuations['iPhone 13'] || {};
    const capOld = currentCapacity || Object.keys(modelMap)[0] || '128GB';
    
    // Base valuation of unit
    let estimatedOldValue = modelMap[capOld] || Object.values(modelMap)[0] || 7500000;

    // Deductions & Adjustments
    let deductions = [];

    // 1. Variant
    if (currentVariant.includes('Bea Cukai')) {
      estimatedOldValue -= 350000;
      deductions.push('Varian Bea Cukai (-Rp 350.000)');
    } else if (currentVariant.includes('All Operator')) {
      estimatedOldValue -= 800000;
      deductions.push('Varian Inter All Op (-Rp 800.000)');
    }

    // 2. Physical
    if (physicalCondition.includes('Lecet')) {
      estimatedOldValue -= 400000;
      deductions.push('Lecet Fisik Pemakaian (-Rp 400.000)');
    } else if (physicalCondition.includes('Dent') || physicalCondition.includes('Penyok Bezel')) {
      estimatedOldValue -= 900000;
      deductions.push('Dent/Penyok Bezel (-Rp 900.000)');
    } else if (physicalCondition.includes('Penyok Berat')) {
      estimatedOldValue -= 1600000;
      deductions.push('Penyok Berat/Melengkung (-Rp 1.600.000)');
    }

    // 3. Battery Health
    const bhNum = parseInt(batteryHealth, 10);
    if (!isNaN(bhNum)) {
      if (bhNum < 80) {
        estimatedOldValue -= 500000;
        deductions.push(`Battery Health < 80% (${bhNum}%) (-Rp 500.000)`);
      } else if (bhNum < 85) {
        estimatedOldValue -= 250000;
        deductions.push(`Battery Health 80-84% (${bhNum}%) (-Rp 250.000)`);
      }
    }

    // 4. Screen
    if (screenCondition.includes('Goresan Halus')) {
      estimatedOldValue -= 200000;
      deductions.push('Goresan Halus Layar (-Rp 200.000)');
    } else if (screenCondition.includes('Shadow') || screenCondition.includes('Garis')) {
      estimatedOldValue -= 1200000;
      deductions.push('Layar Shadow / Garis LCD (-Rp 1.200.000)');
    } else if (screenCondition.includes('Retak') || screenCondition.includes('Pecah')) {
      estimatedOldValue -= 2200000;
      deductions.push('Layar Retak / Pecah Glass (-Rp 2.200.000)');
    }

    // 5. Face ID
    if (faceIdCondition.includes('Mati') || faceIdCondition.includes('Error')) {
      estimatedOldValue -= 900000;
      deductions.push('Face ID / TrueDepth Eror (-Rp 900.000)');
    }

    // 6. Camera
    if (cameraCondition.includes('Jamur') || cameraCondition.includes('Debu')) {
      estimatedOldValue -= 300000;
      deductions.push('Lensa Kamera Berdebu/Jamur (-Rp 300.000)');
    } else if (cameraCondition.includes('Getar') || cameraCondition.includes('OIS')) {
      estimatedOldValue -= 1000000;
      deductions.push('Kamera Getar / OIS Eror (-Rp 1.000.000)');
    } else if (cameraCondition.includes('Mati') || cameraCondition.includes('Hitam')) {
      estimatedOldValue -= 1800000;
      deductions.push('Kamera Mati / Layar Hitam (-Rp 1.800.000)');
    }

    // 7. Sinyal
    if (signalWifiCondition.includes('WiFi Only') || signalWifiCondition.includes('Terblokir')) {
      estimatedOldValue -= 1800000;
      deductions.push('Status WiFi Only (-Rp 1.800.000)');
    }

    // 8. Riwayat Servis
    if (serviceHistory.includes('Ganti Baterai')) {
      estimatedOldValue -= 200000;
      deductions.push('Pernah Ganti Baterai (-Rp 200.000)');
    } else if (serviceHistory.includes('Ganti Layar') || serviceHistory.includes('Ganti LCD')) {
      estimatedOldValue -= 800000;
      deductions.push('Pernah Ganti Layar / LCD (-Rp 800.000)');
    } else if (serviceHistory.includes('Mesin') || serviceHistory.includes('IC')) {
      estimatedOldValue -= 1500000;
      deductions.push('Pernah Servis Mesin/IC (-Rp 1.500.000)');
    }

    // 9. Kelengkapan
    if (accessoriesCondition.includes('Fullset Box Original')) {
      estimatedOldValue += 300000;
      deductions.push('Bonus Fullset Box Original (+Rp 300.000)');
    } else if (accessoriesCondition.includes('Batangan')) {
      estimatedOldValue -= 250000;
      deductions.push('Unit Batangan Tanpa Box (-Rp 250.000)');
    }

    // Minimum floor price
    estimatedOldValue = Math.max(1200000, estimatedOldValue);

    // Target Calculation if Trade-In
    let targetPrice = 0;
    let additionalCost = 0;
    const modelNew = targetModel || 'iPhone 15 Pro';
    const capNew = targetCapacity || '128GB';

    if (calculatorMode === 'tradein') {
      const targetMap = TARGET_PRICES[modelNew] || TARGET_PRICES['iPhone 15 Pro'];
      targetPrice = targetMap[capNew] || Object.values(targetMap)[0] || 15499000;

      if (targetCondition.includes('Second')) {
        targetPrice = Math.round(targetPrice * 0.82);
      }
      additionalCost = Math.max(0, targetPrice - estimatedOldValue);
    }

    // Range calculation for Jual mode
    const minRange = Math.round((estimatedOldValue * 0.95) / 50000) * 50000;
    const maxRange = Math.round((estimatedOldValue * 1.05) / 50000) * 50000;

    setCalculationResult({
      mode: calculatorMode,
      branch: selectedBranch,
      oldDevice: `${modelOld} ${capOld}`,
      variantOld: currentVariant || 'Resmi Indonesia (iBox)',
      colorOld: currentColor,
      estimatedOldValue,
      minRange,
      maxRange,
      targetDevice: `${modelNew} ${capNew} (${targetCondition || 'Semua kondisi'})`,
      targetPrice,
      additionalCost,
      deductions,
      summary: {
        physical: physicalCondition || 'Mulus Like New',
        bh: batteryHealth ? `${batteryHealth}%` : '85%+',
        screen: screenCondition || 'Normal & TrueTone',
        faceId: faceIdCondition || 'Normal & Responsif',
        camera: cameraCondition || 'Bening & Normal',
        signal: signalWifiCondition || 'All Operator Normal',
        servis: serviceHistory || '100% Original',
        kelengkapan: accessoriesCondition || 'Fullset Box Original'
      }
    });

    // Scroll smoothly to result on smaller screens
    setTimeout(() => {
      const el = document.getElementById('tradein-result-card');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleSendToWhatsApp = () => {
    if (!calculationResult) return;

    // Pick phone number of branch or default
    const matchedBranch = branches.find(b => b.name === selectedBranch);
    const branchPhone = matchedBranch?.phone || '6281234567890';

    let text = '';
    if (calculationResult.mode === 'jual') {
      text = encodeURIComponent(
        `Halo iConicstore, saya ingin menjual iPhone saya ke toko:\n\n` +
        `[1. LOKASI TOKO]:\n` +
        `- Cabang Tujuan: ${calculationResult.branch}\n\n` +
        `[2. SPESIFIKASI UNIT]:\n` +
        `- Model: ${calculationResult.oldDevice}\n` +
        `- Varian: ${calculationResult.variantOld}\n` +
        `- Warna: ${calculationResult.colorOld}\n\n` +
        `[3. KONDISI PERANGKAT]:\n` +
        `- Fisik: ${calculationResult.summary.physical}\n` +
        `- Battery Health: ${calculationResult.summary.bh}\n` +
        `- Layar: ${calculationResult.summary.screen}\n` +
        `- Face ID / Touch ID: ${calculationResult.summary.faceId}\n` +
        `- Kamera: ${calculationResult.summary.camera}\n` +
        `- Sinyal/WiFi: ${calculationResult.summary.signal}\n` +
        `- Riwayat Servis: ${calculationResult.summary.servis}\n` +
        `- Kelengkapan: ${calculationResult.summary.kelengkapan}\n\n` +
        `[4. HASIL TAKSIRAN SISTEM]:\n` +
        `- Estimasi Harga Jual: ${formatRupiah(calculationResult.estimatedOldValue)}\n` +
        `- Rentang Taksiran: ${formatRupiah(calculationResult.minRange)} - ${formatRupiah(calculationResult.maxRange)}\n\n` +
        `Mohon info jadwal inspeksi fisik unit di toko. Terima kasih!`
      );
    } else {
      text = encodeURIComponent(
        `Halo iConicstore, saya ingin konsultasi program Trade-In (Tukar Tambah):\n\n` +
        `[1. LOKASI TOKO]:\n` +
        `- Cabang Tujuan: ${calculationResult.branch}\n\n` +
        `[2. SPESIFIKASI HP SAAT INI]:\n` +
        `- Model: ${calculationResult.oldDevice}\n` +
        `- Varian: ${calculationResult.variantOld}\n` +
        `- Warna: ${calculationResult.colorOld}\n\n` +
        `[3. KONDISI PERANGKAT]:\n` +
        `- Fisik: ${calculationResult.summary.physical}\n` +
        `- Battery Health: ${calculationResult.summary.bh}\n` +
        `- Layar: ${calculationResult.summary.screen}\n` +
        `- Face ID / Touch ID: ${calculationResult.summary.faceId}\n` +
        `- Kamera: ${calculationResult.summary.camera}\n` +
        `- Sinyal/WiFi: ${calculationResult.summary.signal}\n` +
        `- Riwayat Servis: ${calculationResult.summary.servis}\n` +
        `- Kelengkapan: ${calculationResult.summary.kelengkapan}\n\n` +
        `[4. HP YANG DIINGINKAN]:\n` +
        `- Target Upgrade: ${calculationResult.targetDevice}\n\n` +
        `[5. HASIL ESTIMASI SISTEM]:\n` +
        `- Taksiran HP Lama: ${formatRupiah(calculationResult.estimatedOldValue)}\n` +
        `- Harga Unit Tujuan: ${formatRupiah(calculationResult.targetPrice)}\n` +
        `- Estimasi Tambah: ${formatRupiah(calculationResult.additionalCost)}\n\n` +
        `Mohon konfirmasi ketersediaan unit tujuan dan jadwal cek fisik di toko. Terima kasih!`
      );
    }

    window.open(`https://wa.me/${branchPhone}?text=${text}`, '_blank');
  };

  const handleResetForm = () => {
    setCalculationResult(null);
    setCurrentModel('');
    setCurrentCapacity('');
    setCurrentVariant('');
    setCurrentColor('Semua warna');
    setPhysicalCondition('');
    setBatteryHealth('');
    setScreenCondition('');
    setFaceIdCondition('');
    setCameraCondition('');
    setSignalWifiCondition('');
    setServiceHistory('');
    setAccessoriesCondition('');
    setTargetModel('');
    setTargetCapacity('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Header Section Matching Reference Screenshot */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 10px', fontSize: '38px', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: '1.15' }}>
            Hitung estimasi harga jual dan<br />tukar tambah iPhone.
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)', maxWidth: '640px', lineHeight: '1.5' }}>
            Estimasi dihitung berdasarkan harga modal, harga jual, spesifikasi produk, lokasi toko, dan kondisi perangkat.
          </p>
        </div>

        {/* Top Right System Badge Matching Screenshot */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '10px 18px',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#22C55E', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)' }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.06em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              SISTEM KALKULATOR
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text)' }}>
              Terhubung dengan data toko
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 1.85fr) minmax(320px, 1fr)', 
        gap: '28px',
        alignItems: 'start'
      }} className="tradein-main-grid">

        {/* LEFT COLUMN: The Interactive Multi-step Calculator Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>

          {/* Top Segmented Control Switcher */}
          <div style={{
            background: 'var(--surface-2)',
            padding: '5px',
            borderRadius: '14px',
            display: 'flex',
            gap: '6px',
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => {
                setCalculatorMode('tradein');
                setCalculationResult(null);
              }}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: calculatorMode === 'tradein' ? '#FFFFFF' : 'transparent',
                color: calculatorMode === 'tradein' ? '#000000' : 'var(--text-dim)',
                fontSize: '13.5px',
                fontWeight: calculatorMode === 'tradein' ? '800' : '600',
                cursor: 'pointer',
                boxShadow: calculatorMode === 'tradein' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Kalkulator Tukar Tambah
            </button>

            <button
              type="button"
              onClick={() => {
                setCalculatorMode('jual');
                setCalculationResult(null);
              }}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: calculatorMode === 'jual' ? '#FFFFFF' : 'transparent',
                color: calculatorMode === 'jual' ? '#000000' : 'var(--text-dim)',
                fontSize: '13.5px',
                fontWeight: calculatorMode === 'jual' ? '800' : '600',
                cursor: 'pointer',
                boxShadow: calculatorMode === 'jual' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Kalkulator Jual
            </button>
          </div>

          {/* STEP 01: LOKASI PENILAIAN */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  LOKASI PENILAIAN
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Pilih toko tujuan
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>
                  Stok HP tujuan akan mengikuti lokasi yang dipilih.
                </p>
              </div>

              <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13.5px', flexShrink: 0 }}>
                01
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                LOKASI TOKO
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '14px 40px 14px 16px',
                    borderRadius: '12px',
                    minHeight: '48px',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none'
                  }}
                >
                  <option value="Semua toko">Semua toko</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.name}>{b.name} ({b.address})</option>
                  ))}
                </select>
                <ChevronDown style={{ width: '16px', height: '16px', position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
              </div>
            </div>
          </section>

          {/* STEP 02: PERANGKAT PELANGGAN */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  PERANGKAT PELANGGAN
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Spesifikasi HP saat ini
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>
                  Spesifikasi diambil langsung dari pola nama produk.
                </p>
              </div>

              <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13.5px', flexShrink: 0 }}>
                02
              </div>
            </div>

            {/* 4 Dropdowns Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
              
              {/* Tipe iPhone */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  TIPE IPHONE
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={currentModel}
                    onChange={(e) => {
                      setCurrentModel(e.target.value);
                      setCurrentCapacity('');
                    }}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: currentModel ? 'var(--text)' : 'var(--text-dim)', fontSize: '13.5px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">Pilih tipe iPhone</option>
                    {Object.keys(valuations).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* Kapasitas */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  KAPASITAS
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={currentCapacity}
                    onChange={(e) => setCurrentCapacity(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: currentCapacity ? 'var(--text)' : 'var(--text-dim)', fontSize: '13.5px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">{currentModel ? 'Pilih kapasitas' : 'Pilih tipe dahulu'}</option>
                    {availableCurrentCapacities.map(cap => (
                      <option key={cap} value={cap}>{cap}</option>
                    ))}
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* Varian */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  VARIAN
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={currentVariant}
                    onChange={(e) => setCurrentVariant(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: currentVariant ? 'var(--text)' : 'var(--text-dim)', fontSize: '13.5px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">{currentCapacity ? 'Pilih varian garansi' : 'Pilih kapasitas dahulu'}</option>
                    <option value="Resmi Indonesia (iBox / GDN)">Resmi Indonesia (iBox / GDN)</option>
                    <option value="Inter Bea Cukai (Faktur Pajak)">Inter Bea Cukai (Faktur Pajak)</option>
                    <option value="Inter All Operator">Inter All Operator (Garansi Toko)</option>
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* Warna */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  WARNA
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13.5px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="Semua warna">Semua warna</option>
                    <option value="Natural Titanium">Natural Titanium</option>
                    <option value="Black / Space Grey / Midnight">Black / Space Grey / Midnight</option>
                    <option value="White / Silver / Starlight">White / Silver / Starlight</option>
                    <option value="Blue / Sierra Blue">Blue / Sierra Blue</option>
                    <option value="Gold / Desert Titanium">Gold / Desert Titanium</option>
                    <option value="Deep Purple">Deep Purple</option>
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

            </div>
          </section>

          {/* STEP 03: PEMERIKSAAN AWAL (8 fields) */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: calculatorMode === 'tradein' ? '32px' : '8px', borderBottom: calculatorMode === 'tradein' ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  PEMERIKSAAN AWAL
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Kondisi perangkat
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>
                  Kondisi berat akan diarahkan ke pemeriksaan langsung.
                </p>
              </div>

              <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13.5px', flexShrink: 0 }}>
                03
              </div>
            </div>

            {/* 8 Items (2 rows of 4) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
              
              {/* 1. Kondisi Fisik */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  KONDISI FISIK
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={physicalCondition}
                    onChange={(e) => setPhysicalCondition(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: physicalCondition ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="Mulus Like New (99%)">Mulus Like New (99%)</option>
                    <option value="Lecet Pemakaian Halus (90-95%)">Lecet Pemakaian Halus (90-95%)</option>
                    <option value="Dent / Penyok Bezel (<85%)">Dent / Penyok Bezel (&lt;85%)</option>
                    <option value="Penyok Berat / Melengkung">Penyok Berat / Melengkung</option>
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* 2. Battery Health */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  BATTERY HEALTH
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    placeholder="Contoh: 87"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: '13px',
                      padding: '13px 14px',
                      borderRadius: '12px',
                      minHeight: '46px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* 3. Kondisi Layar */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  KONDISI LAYAR
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={screenCondition}
                    onChange={(e) => setScreenCondition(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: screenCondition ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="Normal & TrueTone Aktif">Normal &amp; TrueTone Aktif</option>
                    <option value="Goresan Halus Pemakaian">Goresan Halus Pemakaian</option>
                    <option value="Shadow Tipis / Whitespot">Shadow Tipis / Whitespot</option>
                    <option value="Garis LCD / Touchscreen Eror">Garis LCD / Touchscreen Eror</option>
                    <option value="Retak / Pecah Glass">Retak / Pecah Glass Depan</option>
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* 4. Face ID / Touch ID */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  FACE ID / TOUCH ID
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={faceIdCondition}
                    onChange={(e) => setFaceIdCondition(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: faceIdCondition ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="Normal & Responsif">Normal &amp; Responsif</option>
                    <option value="Mati / Eror TrueDepth">Mati / Eror Kamera Depan</option>
                    <option value="Tidak Ada Fitur (Touch ID)">Tidak Ada Fitur (Touch ID)</option>
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* 5. Kamera */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  KAMERA
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={cameraCondition}
                    onChange={(e) => setCameraCondition(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: cameraCondition ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="Bening & Normal (1x, 2x, 0.5x)">Bening &amp; Normal</option>
                    <option value="Lensa Berdebu / Jamur Tipis">Lensa Berdebu / Jamur Tipis</option>
                    <option value="Kamera Getar / OIS Eror">Kamera Getar / OIS Eror</option>
                    <option value="Kamera Mati / Layar Hitam">Kamera Mati / Layar Hitam</option>
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* 6. Sinyal dan WiFi */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  SINYAL DAN WIFI
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={signalWifiCondition}
                    onChange={(e) => setSignalWifiCondition(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: signalWifiCondition ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">Pilih kondisi</option>
                    <option value="All Operator Normal Selamanya">All Operator Normal Selamanya</option>
                    <option value="Terblokir Kemenperin (WiFi Only)">Terblokir Kemenperin (WiFi Only)</option>
                    <option value="Masih Garansi Bea Cukai">Masih Garansi Bea Cukai</option>
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* 7. Riwayat Servis */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  RIWAYAT SERVIS
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={serviceHistory}
                    onChange={(e) => setServiceHistory(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: serviceHistory ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">Pilih riwayat</option>
                    <option value="100% Original Belum Pernah Servis">100% Original Belum Servis</option>
                    <option value="Pernah Ganti Baterai">Pernah Ganti Baterai</option>
                    <option value="Pernah Ganti Layar / LCD">Pernah Ganti Layar / LCD</option>
                    <option value="Pernah Servis Mesin / IC">Pernah Servis Mesin / IC</option>
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

              {/* 8. Kelengkapan */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  KELENGKAPAN
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={accessoriesCondition}
                    onChange={(e) => setAccessoriesCondition(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: accessoriesCondition ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="">Pilih kelengkapan</option>
                    <option value="Fullset Box Original + Kabel">Fullset Box Original + Kabel</option>
                    <option value="Unit Batangan Tanpa Box">Unit Batangan Tanpa Box</option>
                    <option value="Box Ada Aksesoris Pengganti">Box Ada Aksesoris Pengganti</option>
                  </select>
                  <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                </div>
              </div>

            </div>
          </section>

          {/* STEP 04: PERANGKAT TUJUAN (Only in 'tradein' mode) */}
          {calculatorMode === 'tradein' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.06em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    PERANGKAT TUJUAN
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                    HP yang diinginkan
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>
                    Pilih seri iPhone tujuan yang ingin Anda upgrade.
                  </p>
                </div>

                <div style={{ width: '36px', height: '36px', borderRadius: '999px', background: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13.5px', flexShrink: 0 }}>
                  04
                </div>
              </div>

              {/* 4 Fields Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
                
                {/* Kondisi Target */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    KONDISI UNIT
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={targetCondition}
                      onChange={(e) => setTargetCondition(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                    >
                      <option value="Semua kondisi">Semua kondisi</option>
                      <option value="Baru (Brand New Segel)">Baru (Brand New Segel)</option>
                      <option value="Second Like New (Grade A+)">Second Like New (Grade A+)</option>
                    </select>
                    <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                  </div>
                </div>

                {/* Tipe Target */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    TIPE IPHONE TUJUAN
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={targetModel}
                      onChange={(e) => {
                        setTargetModel(e.target.value);
                        setTargetCapacity('');
                      }}
                      style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: targetModel ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                    >
                      <option value="">Pilih tipe target</option>
                      {Object.keys(TARGET_PRICES).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                  </div>
                </div>

                {/* Kapasitas Target */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    KAPASITAS
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={targetCapacity}
                      onChange={(e) => setTargetCapacity(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: targetCapacity ? 'var(--text)' : 'var(--text-dim)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                    >
                      <option value="">{targetModel ? 'Pilih kapasitas' : 'Pilih tipe dahulu'}</option>
                      {availableTargetCapacities.map(cap => (
                        <option key={cap} value={cap}>{cap}</option>
                      ))}
                    </select>
                    <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                  </div>
                </div>

                {/* Warna Target */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    WARNA
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={targetColor}
                      onChange={(e) => setTargetColor(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', padding: '13px 36px 13px 14px', borderRadius: '12px', minHeight: '46px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                    >
                      <option value="Semua warna">Semua warna</option>
                      <option value="Desert Titanium">Desert Titanium</option>
                      <option value="Natural Titanium">Natural Titanium</option>
                      <option value="Black Titanium / Midnight">Black Titanium / Midnight</option>
                      <option value="White Titanium / Silver">White Titanium / Silver</option>
                    </select>
                    <ChevronDown style={{ width: '15px', height: '15px', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* Notice Box Matching Screenshot */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '16px 20px'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '999px',
              background: '#000000',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '13px',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              i
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '2px' }}>
                Estimasi tidak bersifat mengikat
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.45' }}>
                Nilai akhir bergantung pada pemeriksaan fisik, IMEI, komponen, fungsi, dan kebijakan toko.
              </div>
            </div>
          </div>

          {/* Action Button Matching Screenshot */}
          <div>
            <button
              type="button"
              onClick={handleCalculate}
              style={{
                width: '100%',
                background: '#15171B',
                color: '#FFFFFF',
                border: 'none',
                padding: '18px 24px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#252930'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#15171B'}
            >
              <span>{calculatorMode === 'jual' ? 'Hitung Estimasi Jual' : 'Hitung Estimasi Tukar Tambah'}</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: The Sticky Result Card Matching Screenshot */}
        <div style={{ position: 'sticky', top: '24px' }}>
          
          <div 
            id="tradein-result-card"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '36px 30px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >

            {/* If Calculation Result is NULL (Initial State) */}
            {!calculationResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.08em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    HASIL KALKULATOR
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                    Estimasi akan muncul di sini.
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                    Lengkapi spesifikasi dan kondisi perangkat, kemudian tekan tombol hitung.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--text)', fontWeight: '600' }}>
                    <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22C55E', flexShrink: 0 }} />
                    <span>Harga berdasarkan data toko</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--text)', fontWeight: '600' }}>
                    <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22C55E', flexShrink: 0 }} />
                    <span>Spesifikasi dibaca dari produk</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--text)', fontWeight: '600' }}>
                    <CheckCircle2 style={{ width: '16px', height: '16px', color: '#22C55E', flexShrink: 0 }} />
                    <span>Mendukung jual dan tukar tambah</span>
                  </div>
                </div>
              </div>
            ) : (
              /* If Calculation Result is ACTIVE (Calculated State) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.08em', color: '#22C55E', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {calculationResult.mode === 'jual' ? 'ESTIMASI HARGA JUAL KE TOKO' : 'HASIL ESTIMASI TUKAR TAMBAH'}
                  </div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
                    {calculationResult.oldDevice}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    {calculationResult.variantOld} • {calculationResult.colorOld}
                  </div>
                </div>

                {/* Big Price Highlight */}
                {calculationResult.mode === 'jual' ? (
                  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Taksiran Harga Beli Toko:
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#22C55E', letterSpacing: '-0.5px' }}>
                      {formatRupiah(calculationResult.estimatedOldValue)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                      Rentang estimasi: {formatRupiah(calculationResult.minRange)} - {formatRupiah(calculationResult.maxRange)}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Harga Unit Tujuan:</span>
                        <span style={{ fontWeight: '700' }}>{formatRupiah(calculationResult.targetPrice)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Taksiran HP Lama Anda:</span>
                        <span style={{ fontWeight: '700', color: '#22C55E' }}>- {formatRupiah(calculationResult.estimatedOldValue)}</span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(10, 132, 255, 0.08)', border: '1px solid rgba(10, 132, 255, 0.3)', borderRadius: '16px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Estimasi Tambah (Selisih Biaya):
                      </div>
                      <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--accent)' }}>
                        {formatRupiah(calculationResult.additionalCost)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Adjustments / Deductions List */}
                {calculationResult.deductions.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Penyesuaian Kondisi:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {calculationResult.deductions.map((d, idx) => (
                        <span key={idx} style={{ fontSize: '11.5px', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text)' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* WhatsApp Action Button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px' }}>
                  <button
                    type="button"
                    onClick={handleSendToWhatsApp}
                    style={{
                      width: '100%',
                      background: '#22C55E',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    <MessageCircle style={{ width: '17px', height: '17px' }} />
                    <span>{calculationResult.mode === 'jual' ? 'Jual Sekarang ke Toko (WhatsApp)' : 'Konsultasi Trade-In via WhatsApp'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      color: 'var(--text-dim)',
                      border: '1px solid var(--border)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <RotateCcw style={{ width: '13px', height: '13px' }} />
                    <span>Hitung Ulang / Ubah Data</span>
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
