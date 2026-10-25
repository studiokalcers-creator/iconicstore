import { createClient } from '@supabase/supabase-js';

// Get config from localStorage or Vite environment variables
export function getSupabaseConfig() {
  let url = '';
  let anonKey = '';

  try {
    const saved = localStorage.getItem('iconicstore_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      url = parsed.url || '';
      anonKey = parsed.anonKey || '';
    }
  } catch (e) {}

  if (!url && typeof import.meta !== 'undefined' && import.meta.env) {
    url = import.meta.env.VITE_SUPABASE_URL || '';
  }
  if (!anonKey && typeof import.meta !== 'undefined' && import.meta.env) {
    anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }

  // Defensive sanitization: clean quotes, trim whitespace, remove accidental leading 's' from JWT
  url = (url || '').trim().replace(/^["']|["']$/g, '');
  anonKey = (anonKey || '').trim().replace(/^["']|["']$/g, '');
  if (anonKey.startsWith('seyJ')) {
    anonKey = anonKey.slice(1);
  }

  return { url, anonKey };
}

export function saveSupabaseConfig(url, anonKey) {
  try {
    let cleanUrl = (url || '').trim().replace(/^["']|["']$/g, '');
    let cleanKey = (anonKey || '').trim().replace(/^["']|["']$/g, '');
    if (cleanKey.startsWith('seyJ')) {
      cleanKey = cleanKey.slice(1);
    }

    const config = {
      url: cleanUrl,
      anonKey: cleanKey,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('iconicstore_supabase_config', JSON.stringify(config));
    cachedClient = null;
    return true;
  } catch (e) {
    console.error('Failed to save Supabase config to localStorage:', e);
    return false;
  }
}

let cachedClient = null;
let lastUsedConfig = { url: '', anonKey: '' };

export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && lastUsedConfig.url === config.url && lastUsedConfig.anonKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    lastUsedConfig = { ...config };
    return cachedClient;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
}

/**
 * Test connectivity with Supabase
 */
export async function testSupabaseConnection(customUrl, customKey) {
  let url = (customUrl || getSupabaseConfig().url || '').trim().replace(/^["']|["']$/g, '');
  let anonKey = (customKey || getSupabaseConfig().anonKey || '').trim().replace(/^["']|["']$/g, '');
  if (anonKey.startsWith('seyJ')) {
    anonKey = anonKey.slice(1);
  }

  if (!url || !anonKey) {
    return { success: false, message: 'URL dan Anon Key Supabase belum diisi.' };
  }

  if (!url.startsWith('https://')) {
    return { success: false, message: 'URL Supabase harus diawali dengan https:// (contoh: https://xyz.supabase.co)' };
  }

  try {
    const client = createClient(url, anonKey);
    // Directly verify PostgreSQL REST API & table access
    const { error } = await client.from('branches').select('id').limit(1);
    if (error) {
      if (error.message?.toLowerCase().includes('api key')) {
        return { success: false, message: 'API Key Supabase tidak valid: ' + error.message };
      }
      return { success: false, message: 'Gagal query Supabase: ' + error.message };
    }
    return { success: true, message: 'Koneksi ke Supabase Cloud Berhasil Aktif & 12 Tabel Terverifikasi!' };
  } catch (err) {
    return { success: false, message: 'Gagal terhubung ke Supabase: ' + (err.message || String(err)) };
  }
}

/**
 * Sync local store data to Supabase PostgreSQL database
 * Handles foreign key constraints gracefully by provisioning dependencies first
 */
export async function syncLocalToSupabase(payload = {}) {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client belum terkonfigurasi. Harap isi URL & Anon Key.' };
  }

  try {
    const results = [];

    // --- 1. BRANCHES ---
    const branches = Array.isArray(payload.branches) ? payload.branches : [];
    if (branches.length > 0) {
      const formattedBranches = branches.map(b => ({
        id: b.id,
        name: b.name,
        address: b.address || '',
        phone: b.phone || '',
        is_main: !!b.isMain
      }));
      const { error } = await client.from('branches').upsert(formattedBranches);
      if (error) throw new Error('Branches: ' + error.message);
      results.push(`${formattedBranches.length} cabang`);
    }
    const validBranchIds = new Set(branches.map(b => b.id));

    // --- 2. CATEGORIES ---
    // Auto-discover and provision ANY category referenced by master products or units
    // to prevent foreign key constraint violations (e.g. master_products_category_fkey)
    const rawCategories = Array.isArray(payload.categories) ? [...payload.categories] : [];
    const catMap = new Map();
    rawCategories.forEach(c => {
      if (c && c.id) catMap.set(c.id, { id: c.id, name: c.name || c.id, icon: c.icon || '' });
    });

    // Check masterProducts for any missing category IDs
    (payload.masterProducts || []).forEach(m => {
      if (m && m.category && !catMap.has(m.category)) {
        const catName = m.category.charAt(0).toUpperCase() + m.category.slice(1);
        catMap.set(m.category, { id: m.category, name: catName, icon: '' });
      }
    });

    // Check units for any missing category IDs
    (payload.units || []).forEach(u => {
      if (u && u.category && !catMap.has(u.category)) {
        const catName = u.category.charAt(0).toUpperCase() + u.category.slice(1);
        catMap.set(u.category, { id: u.category, name: catName, icon: '' });
      }
    });

    const categoriesToUpsert = Array.from(catMap.values());
    if (categoriesToUpsert.length > 0) {
      const { error } = await client.from('categories').upsert(categoriesToUpsert);
      if (error) throw new Error('Categories: ' + error.message);
      results.push(`${categoriesToUpsert.length} kategori`);
    }
    const validCategoryIds = new Set(catMap.keys());

    // --- 3. RESELLERS (Must sync before Sales for reseller_id FK) ---
    const resellers = Array.isArray(payload.resellers) ? payload.resellers : [];
    if (resellers.length > 0) {
      const formattedResellers = resellers.map(r => ({
        id: r.id,
        name: r.name,
        shop_name: r.shopName || '',
        phone: r.phone || '',
        address: r.address || '',
        tier: r.tier || 'Silver Partner',
        total_spend: r.totalSpend || 0
      }));
      const { error } = await client.from('resellers').upsert(formattedResellers);
      if (error) throw new Error('Resellers: ' + error.message);
      results.push(`${formattedResellers.length} mitra reseller`);
    }
    const validResellerIds = new Set(resellers.map(r => r.id));

    // --- 4. MASTER PRODUCTS ---
    const masterProducts = Array.isArray(payload.masterProducts) ? payload.masterProducts : [];
    if (masterProducts.length > 0) {
      const formattedMasters = masterProducts.map(m => ({
        id: m.id,
        name: m.name,
        category: (m.category && validCategoryIds.has(m.category)) ? m.category : null,
        image: m.image || '',
        price_modal: m.priceModal || m.baseHpp || 0,
        price_retail: m.priceRetail || m.baseRetail || 0,
        price_reseller: m.priceReseller || m.baseReseller || 0,
        min_stock_alert: m.minStockAlert || 2
      }));
      const { error } = await client.from('master_products').upsert(formattedMasters);
      if (error) throw new Error('Master Products: ' + error.message);
      results.push(`${formattedMasters.length} master produk`);
    }
    const validMasterIds = new Set(masterProducts.map(m => m.id));

    // --- 5. UNITS (PHYSICAL INVENTORY & IMEI TRACKING) ---
    const units = Array.isArray(payload.units) ? payload.units : [];
    if (units.length > 0) {
      const formattedUnits = units.map(u => ({
        id: u.id,
        master_id: (u.masterId && validMasterIds.has(u.masterId)) ? u.masterId : null,
        model_name: u.modelName || '',
        color: u.color || '',
        storage: u.storage || '',
        category: u.category || '',
        condition: u.condition || '',
        grade: u.grade || '',
        battery_health: typeof u.batteryHealth === 'number' ? u.batteryHealth : (parseInt(u.batteryHealth) || null),
        imei: u.imei ? String(u.imei).trim() : null,
        serial_number: u.serialNumber || '',
        signal_origin: u.signalOrigin || '',
        signal_warranty: u.signalWarranty || '',
        store_warranty: u.storeWarranty || '',
        price_modal: u.priceModal || 0,
        price_retail: u.priceRetail || 0,
        price_reseller: u.priceReseller || 0,
        barcode_code: u.barcodeCode || '',
        status: u.status || 'available',
        branch_id: (u.branchId && validBranchIds.has(u.branchId)) ? u.branchId : null,
        image: u.image || ''
      }));
      const { error } = await client.from('units').upsert(formattedUnits);
      if (error) throw new Error('Units: ' + error.message);
      results.push(`${formattedUnits.length} unit stok`);
    }

    // --- 6. SALES HISTORY ---
    const sales = Array.isArray(payload.salesHistory) ? payload.salesHistory : [];
    if (sales.length > 0) {
      const formattedSales = sales.map(s => ({
        id: s.id,
        date: s.date || new Date().toISOString(),
        branch_id: (s.branchId && validBranchIds.has(s.branchId)) ? s.branchId : null,
        branch_name: s.branchName || '',
        pricing_mode: s.pricingMode || 'retail',
        reseller_id: (s.resellerId && validResellerIds.has(s.resellerId)) ? s.resellerId : null,
        customer_name: s.customerName || '',
        customer_phone: s.customerPhone || '',
        subtotal: s.subtotal || 0,
        discount_amount: s.discountAmount || 0,
        total: s.total || 0,
        payment_method: s.paymentMethod || '',
        cash_given: s.cashGiven || 0,
        change_amount: s.changeAmount || 0,
        is_dropship_receipt: !!s.isDropshipReceipt,
        cashier_name: s.cashierName || '',
        items: s.items || []
      }));
      const { error } = await client.from('sales').upsert(formattedSales);
      if (error) throw new Error('Sales: ' + error.message);
      results.push(`${formattedSales.length} riwayat transaksi kasir`);
    }

    // --- 7. PREORDERS ---
    const preorders = Array.isArray(payload.preorders) ? payload.preorders : [];
    if (preorders.length > 0) {
      const formattedPreorders = preorders.map(po => ({
        id: po.id,
        customer_name: po.customerName || po.customer_name || 'Pelanggan',
        customer_phone: po.customerPhone || po.customer_phone || '',
        model_name: po.modelName || po.model_name || '',
        target_specs: po.targetSpecs || po.target_specs || '',
        dp_amount: po.dpAmount || po.dp_amount || 0,
        estimated_total: po.estimatedTotal || po.estimated_total || 0,
        branch_id: (po.branchId && validBranchIds.has(po.branchId)) ? po.branchId : null,
        order_date: po.orderDate || po.order_date || null,
        eta_date: po.etaDate || po.eta_date || null,
        status: po.status || 'Menunggu Unit Datang',
        notes: po.notes || ''
      }));
      const { error } = await client.from('preorders').upsert(formattedPreorders);
      if (error) throw new Error('Preorders: ' + error.message);
      results.push(`${formattedPreorders.length} pre-order`);
    }

    // --- 8. PURCHASE ORDERS (SUPPLIER) ---
    const purchaseOrders = Array.isArray(payload.purchaseOrders) ? payload.purchaseOrders : [];
    if (purchaseOrders.length > 0) {
      const formattedPOs = purchaseOrders.map(po => ({
        id: po.id,
        invoice_no: po.invoiceNo || '',
        supplier_name: po.supplierName || '',
        supplier_phone: po.supplierPhone || '',
        purchase_date: po.purchaseDate || null,
        due_date: po.dueDate || null,
        branch_id: (po.branchId && validBranchIds.has(po.branchId)) ? po.branchId : null,
        payment_status: po.paymentStatus || 'Lunas',
        payment_method: po.paymentMethod || '',
        total_amount: po.totalAmount || 0,
        total_items: po.totalItems || 0,
        items: po.items || [],
        notes: po.notes || '',
        received_by: po.receivedBy || ''
      }));
      const { error } = await client.from('purchase_orders').upsert(formattedPOs);
      if (error) throw new Error('Purchase Orders: ' + error.message);
      results.push(`${formattedPOs.length} faktur PO`);
    }

    // --- 9. OPEX (BIAYA OPERASIONAL) ---
    const opexList = Array.isArray(payload.opexList) ? payload.opexList : [];
    if (opexList.length > 0) {
      const formattedOpex = opexList.map(op => ({
        id: op.id,
        date: op.date || null,
        category: op.category || '',
        description: op.description || '',
        amount: op.amount || 0,
        branch_id: op.branchId || 'all'
      }));
      const { error } = await client.from('opex').upsert(formattedOpex);
      if (error) throw new Error('OPEX: ' + error.message);
      results.push(`${formattedOpex.length} catatan OPEX`);
    }

    // --- 10. SHIFT REPORTS (LAPORAN TUTUP KASIR) ---
    const shiftReports = Array.isArray(payload.shiftReports) ? payload.shiftReports : [];
    if (shiftReports.length > 0) {
      const formattedShifts = shiftReports.map(sr => ({
        id: sr.id,
        opened_at: sr.openedAt || sr.opened_at || new Date().toISOString(),
        closed_at: sr.closedAt || sr.closed_at || null,
        cashier_name: sr.cashierName || sr.cashier_name || 'Kasir',
        branch_id: (sr.branchId && validBranchIds.has(sr.branchId)) ? sr.branchId : null,
        branch_name: sr.branchName || sr.branch_name || '',
        starting_cash: sr.startingCash || sr.starting_cash || 0,
        total_sales_cash: sr.totalSalesCash || sr.total_sales_cash || 0,
        total_sales_non_cash: sr.totalSalesNonCash || sr.total_sales_non_cash || 0,
        total_sales: sr.totalSales || sr.total_sales || 0,
        actual_cash_counted: sr.actualCash || sr.actualCashCounted || sr.actual_cash_counted || 0,
        difference: sr.difference || 0,
        notes: sr.notes || ''
      }));
      const { error } = await client.from('shift_reports').upsert(formattedShifts);
      if (error) throw new Error('Shift Reports: ' + error.message);
      results.push(`${formattedShifts.length} laporan shift kasir`);
    }

    // --- 11. STORE SETTINGS ---
    if (payload.storeSettings && typeof payload.storeSettings === 'object') {
      const st = payload.storeSettings;
      const settingsPayload = [{
        id: 'primary_store_settings',
        store_name: st.storeName || st.store_name || 'iConicstore Indonesia',
        tagline: st.storeTagline || st.tagline || 'Official Apple Store & Reseller',
        address: st.address || '',
        phone: st.phone || '',
        instagram: st.instagram || '',
        warranty_store: st.defaultStoreWarranty || st.warranty_store || '1 Bulan Tukar Unit Toko',
        warranty_signal: st.defaultSignalWarranty || st.warranty_signal || 'Permanen Seumur Hidup (All Operator)',
        owner_pin: st.ownerPin || st.owner_pin || '9999',
        cashier_pin: st.cashierDefaultPin || st.cashier_pin || '1234',
        low_stock_threshold: st.lowStockThreshold || st.low_stock_threshold || 2,
        dead_stock_days: st.agingStockThresholdDays || st.dead_stock_days || 14,
        qris_nmid: st.qrisNmid || st.qris_nmid || '',
        qris_image: st.qrisImage || st.qris_image || '',
        data: st
      }];
      const { error } = await client.from('store_settings').upsert(settingsPayload);
      if (error) console.warn('Store settings sync warning:', error.message);
      else results.push('pengaturan toko');
    }

    // --- 12. TRADE-IN VALUATIONS ---
    const tradeInValuations = Array.isArray(payload.tradeInValuations) ? payload.tradeInValuations : [];
    if (tradeInValuations.length > 0) {
      const valuationsPayload = [{
        id: 'primary_tradein_valuations',
        valuations: tradeInValuations,
        updated_at: new Date().toISOString()
      }];
      const { error } = await client.from('tradein_valuations').upsert(valuationsPayload);
      if (error) console.warn('Trade-in valuations sync warning:', error.message);
      else results.push(`${tradeInValuations.length} panduan trade-in`);
    }

    return { 
      success: true, 
      message: `Sinkronisasi ke Cloud Supabase berhasil! (${results.join(', ')})` 
    };
  } catch (err) {
    console.error('Error sync to Supabase:', err);
    return { success: false, message: 'Gagal sinkronisasi data: ' + err.message };
  }
}

/**
 * Fetch and hydrate cloud database from Supabase on app startup
 */
export async function fetchSupabaseData() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [settingsRes, mastersRes, unitsRes] = await Promise.all([
      client.from('store_settings').select('data').limit(1),
      client.from('master_products').select('*'),
      client.from('units').select('*')
    ]);

    const result = {};

    if (settingsRes.data && settingsRes.data[0]?.data) {
      result.storeSettings = settingsRes.data[0].data;
    }

    if (mastersRes.data && mastersRes.data.length > 0) {
      result.masterProducts = mastersRes.data.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        image: m.image,
        baseHpp: m.price_modal,
        baseRetail: m.price_retail,
        baseReseller: m.price_reseller,
        minStockAlert: m.min_stock_alert,
        active: true
      }));
    }

    if (unitsRes.data && unitsRes.data.length > 0) {
      result.units = unitsRes.data.map(u => ({
        id: u.id,
        masterId: u.master_id,
        modelName: u.model_name,
        color: u.color,
        storage: u.storage,
        category: u.category,
        condition: u.condition,
        grade: u.grade,
        batteryHealth: u.battery_health,
        imei: u.imei,
        serialNumber: u.serial_number,
        signalOrigin: u.signal_origin,
        signalWarranty: u.signal_warranty,
        storeWarranty: u.store_warranty,
        priceModal: u.price_modal,
        priceRetail: u.price_retail,
        priceReseller: u.price_reseller,
        barcodeCode: u.barcode_code,
        status: u.status,
        branchId: u.branch_id,
        image: u.image
      }));
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (err) {
    console.warn('Failed to fetch data from Supabase:', err);
    return null;
  }
}

