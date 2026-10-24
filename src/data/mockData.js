// Master Mock Database for iConicstore
// Strictly following Zero Emoticon Policy: Vector iconography & professional typography

export const INITIAL_BRANCHES = [
  { id: 'b1', name: 'Cabang Surabaya Pusat', address: 'Jl. Pemuda No. 45, Surabaya', phone: '081234567890' },
  { id: 'b2', name: 'Cabang Malang Town Square', address: 'Jl. Veteran No. 2, Malang', phone: '081298765432' },
  { id: 'b3', name: 'Gudang Pusat Logistik', address: 'Kawasan Industri Rungkut, Surabaya', phone: '081333444555' }
];

export const INITIAL_RESELLERS = [
  {
    id: 'res-1',
    name: 'Budi Santoso',
    shopName: 'Surabaya Apple Corner',
    phone: '081122334455',
    city: 'Surabaya',
    tier: 'Platinum Partner',
    totalPurchases: 145000000,
    unitCount: 18
  },
  {
    id: 'res-2',
    name: 'Denny Pratama',
    shopName: 'iGadget Malang Store',
    phone: '082233445566',
    city: 'Malang',
    tier: 'Gold Partner',
    totalPurchases: 82000000,
    unitCount: 9
  },
  {
    id: 'res-3',
    name: 'Hendra Wijaya',
    shopName: 'Jember Phone Lab',
    phone: '081988776655',
    city: 'Jember',
    tier: 'Silver Partner',
    totalPurchases: 36000000,
    unitCount: 4
  }
];

export const INITIAL_SERIALIZED_UNITS = [
  {
    id: 'unit-001',
    masterId: 'ip13-128',
    modelName: 'iPhone 13 128GB Midnight Blue',
    color: 'Midnight Blue',
    storage: '128GB',
    category: 'iphone',
    condition: 'Second — BH 89%',
    grade: 'Grade A+',
    batteryHealth: 89,
    imei: '356789123456789',
    serialNumber: 'C7XW90K2LM',
    signalOrigin: 'Resmi Indonesia (iBox)',
    signalWarranty: 'Permanen Seumur Hidup',
    storeWarranty: '1 Bulan Tukar Unit Toko',
    priceModal: 7200000,
    priceRetail: 8499000,
    priceReseller: 8100000,
    barcodeCode: 'BC-IP13-56789',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unit-002',
    masterId: 'ip14p-256',
    modelName: 'iPhone 14 Pro 256GB Deep Purple',
    color: 'Deep Purple',
    storage: '256GB',
    category: 'iphone',
    condition: 'Baru — Garansi Resmi',
    grade: 'BNIB',
    batteryHealth: 100,
    imei: '359012389012349',
    serialNumber: 'DJ28FM01KP',
    signalOrigin: 'Resmi Indonesia (iBox)',
    signalWarranty: 'Permanen Seumur Hidup',
    storeWarranty: '12 Bulan Resmi Apple Indonesia',
    priceModal: 15500000,
    priceRetail: 17999000,
    priceReseller: 17200000,
    barcodeCode: 'BC-IP14P-12349',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unit-003',
    masterId: 'ipad-air5-64',
    modelName: 'iPad Air 5 64GB Wifi',
    color: 'Space Gray',
    storage: '64GB',
    category: 'ipad',
    condition: 'Second — BH 95%',
    grade: 'Grade A',
    batteryHealth: 95,
    imei: 'SN-DMPAIR564LK9',
    serialNumber: 'DMPAIR564LK9',
    signalOrigin: 'WiFi Only (Non-IMEI)',
    signalWarranty: 'WiFi Permanen',
    storeWarranty: '1 Bulan Tukar Unit Toko',
    priceModal: 6200000,
    priceRetail: 7250000,
    priceReseller: 6900000,
    barcodeCode: 'BC-IPAD-564LK',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unit-004',
    masterId: 'mac-airm2-256',
    modelName: 'MacBook Air M2 256GB',
    color: 'Midnight',
    storage: '256GB',
    category: 'macbook',
    condition: 'Second — Like New',
    grade: 'Grade B',
    batteryHealth: 92,
    imei: 'SN-C02M2AIR256X',
    serialNumber: 'C02M2AIR256X',
    signalOrigin: 'Garansi Resmi Apple',
    signalWarranty: 'Non-Seluler',
    storeWarranty: '1 Bulan Tukar Unit Toko',
    priceModal: 11800000,
    priceRetail: 13500000,
    priceReseller: 12900000,
    barcodeCode: 'BC-MAC-M2256',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unit-005',
    masterId: 'ip16pm-256',
    modelName: 'iPhone 16 Pro Max 256GB Desert Titanium',
    color: 'Desert Titanium',
    storage: '256GB',
    category: 'iphone',
    condition: 'Baru — Garansi Resmi',
    grade: 'BNIB',
    batteryHealth: 100,
    imei: '358742110982341',
    serialNumber: 'FD2W9X4KL0',
    signalOrigin: 'Resmi Indonesia (iBox/GDN)',
    signalWarranty: 'Permanen Seumur Hidup',
    storeWarranty: '12 Bulan Resmi Apple Indonesia',
    priceModal: 21500000,
    priceRetail: 24999000,
    priceReseller: 23800000,
    barcodeCode: 'BC-IP16PM-82341',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unit-006',
    masterId: 'ip15p-128',
    modelName: 'iPhone 15 Pro 128GB Natural Titanium',
    color: 'Natural Titanium',
    storage: '128GB',
    category: 'iphone',
    condition: 'Second — BH 94%',
    grade: 'Grade A+',
    batteryHealth: 94,
    imei: '352984102948123',
    serialNumber: 'G8KP42M9LQ',
    signalOrigin: 'Resmi Indonesia (iBox)',
    signalWarranty: 'Permanen Seumur Hidup',
    storeWarranty: '1 Bulan Tukar Unit Toko',
    priceModal: 13200000,
    priceRetail: 15499000,
    priceReseller: 14700000,
    barcodeCode: 'BC-IP15P-48123',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unit-007',
    masterId: 'ipad-pm4-256',
    modelName: 'iPad Pro 11 M4 256GB Space Black',
    color: 'Space Black',
    storage: '256GB',
    category: 'ipad',
    condition: 'Baru — Garansi Resmi',
    grade: 'BNIB',
    batteryHealth: 100,
    imei: 'SN-DMP4X9012LK8',
    serialNumber: 'DMP4X9012LK8',
    signalOrigin: 'WiFi Only (Non-IMEI)',
    signalWarranty: 'WiFi Permanen',
    storeWarranty: '12 Bulan Resmi Apple Indonesia',
    priceModal: 16200000,
    priceRetail: 18499000,
    priceReseller: 17700000,
    barcodeCode: 'BC-IPADM4-012LK',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unit-008',
    masterId: 'mac-airm3-256',
    modelName: 'MacBook Air 13 M3 8GB 256GB Midnight',
    color: 'Midnight',
    storage: '256GB',
    category: 'macbook',
    condition: 'Baru — Garansi Resmi',
    grade: 'BNIB',
    batteryHealth: 100,
    imei: 'SN-C02W9K02MD89',
    serialNumber: 'C02W9K02MD89',
    signalOrigin: 'Garansi Resmi Apple Indonesia',
    signalWarranty: 'Non-Seluler',
    storeWarranty: '12 Bulan Resmi Apple Indonesia',
    priceModal: 16000000,
    priceRetail: 18299000,
    priceReseller: 17450000,
    barcodeCode: 'BC-MACM3-02MD8',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unit-009',
    masterId: 'watch-s10-46',
    modelName: 'Apple Watch Series 10 46mm GPS Jet Black',
    color: 'Jet Black',
    storage: '64GB',
    category: 'watch',
    condition: 'Baru — Garansi Resmi',
    grade: 'BNIB',
    batteryHealth: 100,
    imei: 'SN-W10K892019MN',
    serialNumber: 'W10K892019MN',
    signalOrigin: 'Garansi Resmi Digimap',
    signalWarranty: 'GPS Non-Cellular',
    storeWarranty: '12 Bulan Resmi Apple',
    priceModal: 6500000,
    priceRetail: 7499000,
    priceReseller: 7100000,
    barcodeCode: 'BC-W10-2019MN',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'unit-010',
    masterId: 'airpods-pro2',
    modelName: 'AirPods Pro Gen 2 Type-C MagSafe',
    color: 'White',
    storage: 'Standard',
    category: 'accessories',
    condition: 'Baru — Garansi Resmi',
    grade: 'BNIB',
    batteryHealth: 100,
    imei: 'SN-AP2C892109LK',
    serialNumber: 'AP2C892109LK',
    signalOrigin: 'Garansi Resmi iBox',
    signalWarranty: 'Aksesoris Asli',
    storeWarranty: '12 Bulan Resmi Apple',
    priceModal: 2800000,
    priceRetail: 3499000,
    priceReseller: 3250000,
    barcodeCode: 'BC-AP2C-2109LK',
    status: 'available',
    branchId: 'b1',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80'
  }
];

export const getApplePresetPhoto = (nameOrCategory = '') => {
  const lower = String(nameOrCategory || '').toLowerCase();
  if (lower.includes('16 pro') || lower.includes('16promax')) return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80';
  if (lower.includes('15 pro') || lower.includes('15promax')) return 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80';
  if (lower.includes('14 pro') || lower.includes('14promax')) return 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80';
  if (lower.includes('13') || lower.includes('12') || lower.includes('11')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&auto=format&fit=crop&q=80';
  if (lower.includes('ipad')) return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80';
  if (lower.includes('macbook') || lower.includes('mac')) return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80';
  if (lower.includes('watch')) return 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80';
  if (lower.includes('airpods') || lower.includes('audio') || lower.includes('acc') || lower.includes('charger')) return 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80';
};


export const SERVICE_PRICELIST = [
  { id: 's1', serviceName: 'Ganti LCD Original (iPhone 11 - 13)', cost: 1450000, duration: '45 Menit', warranty: '3 Bulan', models: 'iPhone 11 / 12 / 13' },
  { id: 's2', serviceName: 'Ganti LCD OLED Super Retina (iPhone 14 - 15 Pro)', cost: 2850000, duration: '60 Menit', warranty: '3 Bulan', models: 'iPhone 14 Pro / 15 Pro' },
  { id: 's3', serviceName: 'Ganti Baterai Original Health 100%', cost: 650000, duration: '30 Menit', warranty: '6 Bulan', models: 'iPhone XR s/d 14 Series' },
  { id: 's4', serviceName: 'Perbaikan Face ID & TrueTone', cost: 750000, duration: '2 Jam', warranty: '1 Bulan', models: 'iPhone X s/d 15 Pro Max' },
  { id: 's5', serviceName: 'Servis IC Audio / IC Power / Mati Total', cost: 1200000, duration: '1-2 Hari', warranty: '1 Bulan', models: 'Semua Seri iPhone' }
];

export const INITIAL_TRADE_IN_VALUATIONS = {
  'iPhone 16 Pro Max': { '256GB': 22500000, '512GB': 24500000, '1TB': 27000000 },
  'iPhone 16 Pro': { '128GB': 18500000, '256GB': 20000000, '512GB': 22500000, '1TB': 25000000 },
  'iPhone 16 Plus': { '128GB': 15000000, '256GB': 16500000, '512GB': 18500000 },
  'iPhone 16': { '128GB': 13800000, '256GB': 15200000, '512GB': 17000000 },
  'iPhone 15 Pro Max': { '256GB': 18500000, '512GB': 20500000, '1TB': 22500000 },
  'iPhone 15 Pro': { '128GB': 15000000, '256GB': 16500000, '512GB': 18500000, '1TB': 20000000 },
  'iPhone 15 Plus': { '128GB': 11800000, '256GB': 13000000, '512GB': 14500000 },
  'iPhone 15': { '128GB': 11000000, '256GB': 12200000, '512GB': 13800000 },
  'iPhone 14 Pro Max': { '128GB': 14200000, '256GB': 15500000, '512GB': 17000000, '1TB': 18500000 },
  'iPhone 14 Pro': { '128GB': 12500000, '256GB': 13800000, '512GB': 15200000, '1TB': 16500000 },
  'iPhone 14 Plus': { '128GB': 9200000, '256GB': 10400000, '512GB': 11800000 },
  'iPhone 14': { '128GB': 8800000, '256GB': 9900000, '512GB': 11200000 },
  'iPhone 13 Pro Max': { '128GB': 10800000, '256GB': 11900000, '512GB': 13200000, '1TB': 14500000 },
  'iPhone 13 Pro': { '128GB': 9400000, '256GB': 10500000, '512GB': 11800000, '1TB': 13000000 },
  'iPhone 13': { '128GB': 7500000, '256GB': 8500000, '512GB': 9800000 },
  'iPhone 13 mini': { '128GB': 6400000, '256GB': 7400000 },
  'iPhone 12 Pro Max': { '128GB': 8200000, '256GB': 9200000, '512GB': 10400000 },
  'iPhone 12 Pro': { '128GB': 7200000, '256GB': 8100000, '512GB': 9200000 },
  'iPhone 12': { '64GB': 5400000, '128GB': 6000000, '256GB': 6800000 },
  'iPhone 12 mini': { '64GB': 4500000, '128GB': 5100000, '256GB': 5800000 },
  'iPhone 11 Pro Max': { '64GB': 5600000, '256GB': 6400000, '512GB': 7200000 },
  'iPhone 11 Pro': { '64GB': 4800000, '256GB': 5500000, '512GB': 6200000 },
  'iPhone 11': { '64GB': 4000000, '128GB': 4500000, '256GB': 5200000 }
};

export const TRADE_IN_VALUATIONS = INITIAL_TRADE_IN_VALUATIONS;


export const INITIAL_SALES_HISTORY = [
  {
    id: 'TRX-20261023-01',
    date: '2026-10-23 11:20:14',
    branchId: 'b1',
    branchName: 'Cabang Surabaya Pusat',
    pricingMode: 'retail',
    customerName: 'Ahmad Fauzi',
    customerPhone: '081233445566',
    items: [
      {
        id: 'unit-006',
        modelName: 'iPhone 15 Pro 128GB Natural Titanium',
        imei: '352984102948123',
        category: 'iphone',
        condition: 'Second Like New (Grade A+)',
        storeWarranty: '1 Bulan Tukar Unit Toko',
        priceModal: 13200000,
        appliedPrice: 15499000
      }
    ],
    subtotal: 15499000,
    discountAmount: 0,
    total: 15499000,
    paymentMethod: 'qris',
    cashGiven: 15499000,
    changeAmount: 0,
    isDropshipReceipt: false,
    cashierName: 'Rian (Kasir Store #1)'
  },
  {
    id: 'TRX-20261023-02',
    date: '2026-10-23 14:05:30',
    branchId: 'b1',
    branchName: 'Cabang Surabaya Pusat',
    pricingMode: 'reseller',
    reseller: { id: 'res-1', name: 'Budi Santoso', shopName: 'Surabaya Apple Corner', tier: 'Platinum Partner' },
    customerName: 'Budi Santoso (Surabaya Apple Corner)',
    customerPhone: '081122334455',
    items: [
      {
        id: 'unit-002',
        modelName: 'iPhone 14 Pro 256GB Deep Purple',
        imei: '359012389012349',
        category: 'iphone',
        condition: 'Baru BNIB Garansi Resmi',
        storeWarranty: '12 Bulan Resmi Apple Indonesia',
        priceModal: 15500000,
        appliedPrice: 17200000
      }
    ],
    subtotal: 17200000,
    discountAmount: 0,
    total: 17200000,
    paymentMethod: 'transfer',
    cashGiven: 17200000,
    changeAmount: 0,
    isDropshipReceipt: true,
    cashierName: 'Rian (Kasir Store #1)'
  },
  {
    id: 'TRX-20261023-03',
    date: '2026-10-23 15:40:12',
    branchId: 'b2',
    branchName: 'Cabang Malang Town Square',
    pricingMode: 'retail',
    customerName: 'Clara Salsabila',
    customerPhone: '081299881122',
    items: [
      {
        id: 'unit-001',
        modelName: 'iPhone 13 128GB Midnight Blue',
        imei: '356789123456789',
        category: 'iphone',
        condition: 'Second Like New (Grade A+)',
        storeWarranty: '1 Bulan Tukar Unit Toko',
        priceModal: 7200000,
        appliedPrice: 8499000
      }
    ],
    subtotal: 8499000,
    discountAmount: 0,
    total: 8499000,
    paymentMethod: 'tunai',
    cashGiven: 8500000,
    changeAmount: 1000,
    isDropshipReceipt: false,
    cashierName: 'Dimas (Kasir Store #2)'
  },
  {
    id: 'TRX-20261022-01',
    date: '2026-10-22 13:15:00',
    branchId: 'b1',
    branchName: 'Cabang Surabaya Pusat',
    pricingMode: 'retail',
    customerName: 'Bambang Soediro',
    customerPhone: '085712345678',
    items: [
      {
        id: 'unit-004',
        modelName: 'MacBook Air M2 256GB Midnight',
        imei: 'SN-C02M2AIR256X',
        category: 'macbook',
        condition: 'Second Like New (Grade B)',
        storeWarranty: '1 Bulan Tukar Unit Toko',
        priceModal: 11800000,
        appliedPrice: 13500000
      }
    ],
    subtotal: 13500000,
    discountAmount: 0,
    total: 13500000,
    paymentMethod: 'edc',
    cashGiven: 13500000,
    changeAmount: 0,
    isDropshipReceipt: false,
    cashierName: 'Rian (Kasir Store #1)'
  },
  {
    id: 'TRX-20261022-02',
    date: '2026-10-22 16:50:22',
    branchId: 'b2',
    branchName: 'Cabang Malang Town Square',
    pricingMode: 'reseller',
    reseller: { id: 'res-2', name: 'Denny Pratama', shopName: 'iGadget Malang Store', tier: 'Gold Partner' },
    customerName: 'Denny Pratama (iGadget Malang)',
    customerPhone: '082233445566',
    items: [
      {
        id: 'unit-003',
        modelName: 'iPad Air 5 64GB Wifi Space Gray',
        imei: 'SN-DMPAIR564LK9',
        category: 'ipad',
        condition: 'Second (Grade A)',
        storeWarranty: '1 Bulan Tukar Unit Toko',
        priceModal: 6200000,
        appliedPrice: 7100000
      },
      {
        id: 'unit-010',
        modelName: 'AirPods Pro Gen 2 Type-C MagSafe',
        imei: 'SN-AP2C892109LK',
        category: 'audio',
        condition: 'Baru BNIB Garansi Resmi',
        storeWarranty: '12 Bulan Resmi Apple',
        priceModal: 3000000,
        appliedPrice: 3350000
      }
    ],
    subtotal: 10450000,
    discountAmount: 0,
    total: 10450000,
    paymentMethod: 'transfer',
    cashGiven: 10450000,
    changeAmount: 0,
    isDropshipReceipt: true,
    cashierName: 'Dimas (Kasir Store #2)'
  },
  {
    id: 'TRX-20261021-01',
    date: '2026-10-21 17:30:45',
    branchId: 'b1',
    branchName: 'Cabang Surabaya Pusat',
    pricingMode: 'retail',
    customerName: 'Dr. Hendra Gunawan',
    customerPhone: '081344556677',
    items: [
      {
        id: 'unit-009',
        modelName: 'Apple Watch Series 10 46mm GPS Jet Black',
        imei: 'SN-W10K892019MN',
        category: 'watch',
        condition: 'Baru BNIB Garansi Resmi',
        storeWarranty: '12 Bulan Resmi Apple',
        priceModal: 6500000,
        appliedPrice: 7499000
      }
    ],
    subtotal: 7499000,
    discountAmount: 0,
    total: 7499000,
    paymentMethod: 'qris',
    cashGiven: 7499000,
    changeAmount: 0,
    isDropshipReceipt: false,
    cashierName: 'Rian (Kasir Store #1)'
  },
  {
    id: 'TRX-20261020-01',
    date: '2026-10-20 12:10:00',
    branchId: 'b2',
    branchName: 'Cabang Malang Town Square',
    pricingMode: 'retail',
    customerName: 'Jessica Tan',
    customerPhone: '085912348765',
    items: [
      {
        id: 'unit-005',
        modelName: 'iPhone 16 Pro Max 256GB Desert Titanium',
        imei: '358742110982341',
        category: 'iphone',
        condition: 'Baru BNIB Garansi Resmi',
        storeWarranty: '12 Bulan Resmi Apple Indonesia',
        priceModal: 22500000,
        appliedPrice: 24999000
      }
    ],
    subtotal: 24999000,
    discountAmount: 0,
    total: 24999000,
    paymentMethod: 'edc',
    cashGiven: 24999000,
    changeAmount: 0,
    isDropshipReceipt: false,
    cashierName: 'Dimas (Kasir Store #2)'
  }
];

export const INITIAL_PREORDERS = [
  {
    id: 'PO-98201',
    customerName: 'Siti Rahmawati',
    phone: '081399887766',
    modelRequested: 'iPhone 16 Pro Max 256GB Desert Titanium',
    dpAmount: 2500000,
    estimatedTotal: 24999000,
    orderDate: '2026-10-20',
    dueDate: '2026-10-30',
    status: 'Menunggu Unit Datang',
    paymentMethod: 'Transfer BCA'
  },
  {
    id: 'PO-98202',
    customerName: 'Kevin Wijaya',
    phone: '085211223344',
    modelRequested: 'iPhone 16 Pro 128GB Black Titanium',
    dpAmount: 2000000,
    estimatedTotal: 21499000,
    orderDate: '2026-10-22',
    dueDate: '2026-11-02',
    status: 'Menunggu Unit Datang',
    paymentMethod: 'QRIS Dinamis'
  }
];

export const INITIAL_SHIFT_REPORTS = [
  {
    id: 'SHIFT-20261023-01',
    date: '2026-10-23 21:00:15',
    branchId: 'b1',
    branchName: 'Cabang Surabaya Pusat',
    cashier: 'Rian (Kasir Store #1)',
    startingCash: 500000,
    cashSales: 0,
    nonCashSales: 32699000,
    totalExpected: 500000,
    actualCash: 500000,
    diff: 0,
    txCount: 2,
    status: 'Seimbang'
  },
  {
    id: 'SHIFT-20261023-02',
    date: '2026-10-23 21:05:40',
    branchId: 'b2',
    branchName: 'Cabang Malang Town Square',
    cashier: 'Dimas (Kasir Store #2)',
    startingCash: 500000,
    cashSales: 8499000,
    nonCashSales: 0,
    totalExpected: 8999000,
    actualCash: 8999000,
    diff: 0,
    txCount: 1,
    status: 'Seimbang'
  },
  {
    id: 'SHIFT-20261022-01',
    date: '2026-10-22 21:00:00',
    branchId: 'b1',
    branchName: 'Cabang Surabaya Pusat',
    cashier: 'Rian (Kasir Store #1)',
    startingCash: 500000,
    cashSales: 0,
    nonCashSales: 13500000,
    totalExpected: 500000,
    actualCash: 500000,
    diff: 0,
    txCount: 1,
    status: 'Seimbang'
  },
  {
    id: 'SHIFT-20261021-01',
    date: '2026-10-21 21:10:00',
    branchId: 'b2',
    branchName: 'Cabang Malang Town Square',
    cashier: 'Dimas (Kasir Store #2)',
    startingCash: 500000,
    cashSales: 0,
    nonCashSales: 24999000,
    totalExpected: 500000,
    actualCash: 480000,
    diff: -20000,
    txCount: 1,
    status: 'Selisih Kurang'
  }
];

export const INITIAL_MASTER_PRODUCTS = [
  { id: 'm-ip13', name: 'iPhone 13', category: 'iphone', baseRetail: 8499000, baseReseller: 8100000, baseHpp: 7200000, minStockAlert: 2, active: true, image: getApplePresetPhoto('iPhone 13') },
  { id: 'm-ip14p', name: 'iPhone 14 Pro', category: 'iphone', baseRetail: 17999000, baseReseller: 17200000, baseHpp: 15500000, minStockAlert: 1, active: true, image: getApplePresetPhoto('iPhone 14 Pro') },
  { id: 'm-ip15p', name: 'iPhone 15 Pro', category: 'iphone', baseRetail: 15499000, baseReseller: 14700000, baseHpp: 13200000, minStockAlert: 2, active: true, image: getApplePresetPhoto('iPhone 15 Pro') },
  { id: 'm-ip16pm', name: 'iPhone 16 Pro Max', category: 'iphone', baseRetail: 24999000, baseReseller: 23800000, baseHpp: 22500000, minStockAlert: 2, active: true, image: getApplePresetPhoto('iPhone 16 Pro Max') },
  { id: 'm-ipad-air5', name: 'iPad Air 5', category: 'ipad', baseRetail: 7250000, baseReseller: 7100000, baseHpp: 6200000, minStockAlert: 1, active: true, image: getApplePresetPhoto('iPad Air') },
  { id: 'm-mac-m2', name: 'MacBook Air M2', category: 'macbook', baseRetail: 13500000, baseReseller: 12900000, baseHpp: 11800000, minStockAlert: 1, active: true, image: getApplePresetPhoto('MacBook Air') },
  { id: 'm-watch-s10', name: 'Apple Watch Series 10', category: 'watch', baseRetail: 7499000, baseReseller: 7100000, baseHpp: 6500000, minStockAlert: 1, active: true, image: getApplePresetPhoto('Apple Watch Series 10') },
  { id: 'm-airpods-p2', name: 'AirPods Pro Gen 2 Type-C', category: 'audio', baseRetail: 3499000, baseReseller: 3350000, baseHpp: 3000000, minStockAlert: 3, active: true, image: getApplePresetPhoto('AirPods Pro Gen 2') }
];

export const INITIAL_CATEGORIES = [
  { id: 'iphone', name: 'iPhone', description: 'Smartphone Apple iOS bergaransi', isSerialized: true, hasBattery: true },
  { id: 'ipad', name: 'iPad', description: 'Tablet Apple iPadOS (WiFi / Cellular)', isSerialized: true, hasBattery: true },
  { id: 'macbook', name: 'MacBook', description: 'Laptop MacBook Air & Pro macOS', isSerialized: true, hasBattery: true },
  { id: 'watch', name: 'Apple Watch', description: 'Smartwatch watchOS GPS & Cellular', isSerialized: true, hasBattery: true },
  { id: 'audio', name: 'Audio & AirPods', description: 'AirPods Pro, AirPods Max & Aksesoris Audio Apple', isSerialized: true, hasBattery: true },
  { id: 'accessories', name: 'Aksesoris', description: 'Charger, Kabel, Case & Aksesoris Asli', isSerialized: false, hasBattery: false }
];

export const INITIAL_STORE_SETTINGS = {
  storeName: 'iConicstore Indonesia',
  storeTagline: 'Official Apple Store & Reseller',
  storeLogo: null, // Custom logo data URL or image path
  ownerPin: '9999',
  supervisorPin: '1234',
  cashierDefaultPin: '1234',
  defaultStoreWarranty: '1 Bulan Tukar Unit Toko',
  defaultSignalWarranty: 'Permanen Seumur Hidup (All Operator & Bea Cukai)',
  lowStockThreshold: 2,
  agingStockThresholdDays: 14,
  // QRIS Settings
  qrisMerchantName: 'iConicstore Official',
  qrisNmid: 'ID1029384918273',
  qrisImage: null // Custom QR Code image data URL (base64)
};

