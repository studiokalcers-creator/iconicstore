export const SUPABASE_SCHEMA_SQL = `-- =========================================================================
-- iConicstore Apple Store POS & ERP Management System
-- Supabase Database Schema Migration Script
-- =========================================================================
-- Jalankan skrip SQL ini di Supabase SQL Editor (Dashboard > SQL Editor)
-- untuk membuat seluruh tabel dan indeks yang dibutuhkan oleh sistem.
-- =========================================================================

-- 1. TABEL CABANG / OUTLET TOKO
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL KATEGORI PRODUK
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL MASTER PRODUK APPLE & ACUAN HARGA
CREATE TABLE IF NOT EXISTS public.master_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL,
    image TEXT,
    price_modal NUMERIC(15, 2) DEFAULT 0,
    price_retail NUMERIC(15, 2) DEFAULT 0,
    price_reseller NUMERIC(15, 2) DEFAULT 0,
    min_stock_alert INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL INVENTARIS UNIT FISIK (IMEI & SERIAL TRACKER)
CREATE TABLE IF NOT EXISTS public.units (
    id TEXT PRIMARY KEY,
    master_id TEXT REFERENCES public.master_products(id) ON UPDATE CASCADE ON DELETE SET NULL,
    model_name TEXT NOT NULL,
    color TEXT,
    storage TEXT,
    category TEXT,
    condition TEXT,
    grade TEXT,
    battery_health INTEGER,
    imei TEXT UNIQUE,
    serial_number TEXT,
    signal_origin TEXT,
    signal_warranty TEXT,
    store_warranty TEXT,
    price_modal NUMERIC(15, 2) DEFAULT 0,
    price_retail NUMERIC(15, 2) DEFAULT 0,
    price_reseller NUMERIC(15, 2) DEFAULT 0,
    barcode_code TEXT,
    status TEXT DEFAULT 'available',
    branch_id TEXT REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_units_imei ON public.units(imei);
CREATE INDEX IF NOT EXISTS idx_units_status ON public.units(status);
CREATE INDEX IF NOT EXISTS idx_units_branch ON public.units(branch_id);

-- 5. TABEL MITRA RESELLER (B2B)
CREATE TABLE IF NOT EXISTS public.resellers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    shop_name TEXT,
    phone TEXT,
    address TEXT,
    tier TEXT DEFAULT 'Silver Partner',
    total_spend NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL RIWAYAT TRANSAKSI PENJUALAN KASIR (SALES)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    date TIMESTAMPTZ DEFAULT NOW(),
    branch_id TEXT REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL,
    branch_name TEXT,
    pricing_mode TEXT DEFAULT 'retail',
    reseller_id TEXT REFERENCES public.resellers(id) ON UPDATE CASCADE ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    discount_amount NUMERIC(15, 2) DEFAULT 0,
    total NUMERIC(15, 2) DEFAULT 0,
    payment_method TEXT,
    cash_given NUMERIC(15, 2) DEFAULT 0,
    change_amount NUMERIC(15, 2) DEFAULT 0,
    is_dropship_receipt BOOLEAN DEFAULT FALSE,
    cashier_name TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_customer_phone ON public.sales(customer_phone);

-- 7. TABEL MONITORING INDEN PRE-ORDER
CREATE TABLE IF NOT EXISTS public.preorders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    model_name TEXT NOT NULL,
    target_specs TEXT,
    dp_amount NUMERIC(15, 2) DEFAULT 0,
    estimated_total NUMERIC(15, 2) DEFAULT 0,
    branch_id TEXT REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    eta_date DATE,
    status TEXT DEFAULT 'Menunggu Unit Datang',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL PEMBELIAN STOK SUPPLIER (PURCHASE ORDERS)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    invoice_no TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_phone TEXT,
    purchase_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    branch_id TEXT REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL,
    payment_status TEXT DEFAULT 'Lunas',
    payment_method TEXT,
    total_amount NUMERIC(15, 2) DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    received_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL BEBAN OPERASIONAL TOKO (OPEX)
CREATE TABLE IF NOT EXISTS public.opex (
    id TEXT PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) DEFAULT 0,
    branch_id TEXT DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABEL LAPORAN TUTUP SHIFT KASIR (Z-REPORT)
CREATE TABLE IF NOT EXISTS public.shift_reports (
    id TEXT PRIMARY KEY,
    opened_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ DEFAULT NOW(),
    cashier_name TEXT NOT NULL,
    branch_id TEXT REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL,
    branch_name TEXT,
    starting_cash NUMERIC(15, 2) DEFAULT 0,
    total_sales_cash NUMERIC(15, 2) DEFAULT 0,
    total_sales_non_cash NUMERIC(15, 2) DEFAULT 0,
    total_sales NUMERIC(15, 2) DEFAULT 0,
    actual_cash_counted NUMERIC(15, 2) DEFAULT 0,
    difference NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABEL PENGATURAN TOKO & STANDAR GARANSI
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary_store_settings',
    store_name TEXT DEFAULT 'iConicstore Apple Store',
    tagline TEXT,
    address TEXT,
    phone TEXT,
    instagram TEXT,
    warranty_store TEXT DEFAULT '1 Bulan Tukar Unit Toko',
    warranty_signal TEXT DEFAULT 'Permanen Seumur Hidup (All Operator)',
    owner_pin TEXT DEFAULT '9999',
    cashier_pin TEXT DEFAULT '1234',
    low_stock_threshold INTEGER DEFAULT 2,
    dead_stock_days INTEGER DEFAULT 14,
    qris_nmid TEXT,
    qris_image TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABEL TAKSIRAN HARGA TRADE-IN & JUAL HP
CREATE TABLE IF NOT EXISTS public.tradein_valuations (
    id TEXT PRIMARY KEY DEFAULT 'master_tradein_valuations',
    valuations JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) & POLICY AKSES
-- =========================================================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opex ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradein_valuations ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'branches', 'categories', 'master_products', 'units', 
        'resellers', 'sales', 'preorders', 'purchase_orders', 
        'opex', 'shift_reports', 'store_settings', 'tradein_valuations'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow public all access on %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Allow public all access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
`;
