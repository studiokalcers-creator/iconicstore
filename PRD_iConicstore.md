# Product Requirement Document (PRD) — iConicstore
**Versi:** 1.2 (Comprehensive Retail Edition)  
**Status:** Approved & Finalized for Implementation  
**Tanggal:** 23 Oktober 2026  
**Revisi:** Penambahan Multi-Tier Pricing (Harga Khusus Reseller vs Retail), Export PDF Barcode, dan Modul After-Sales  
**Proyek:** Website Storefront + Cloud POS Terintegrasi + Auto Barcode & IMEI Management (iOS Optimized)  
**Benchmark:** [iosstore.id](https://iosstore.id/)

---

## 1. Executive Summary & Ringkasan Proyek

**iConicstore** adalah platform ekosistem terpadu e-commerce ritel dan Cloud Point of Sale (POS) khusus produk Apple (iPhone, iPad, Mac, Apple Watch, AirPods, serta aksesoris) yang melayani penjualan unit baru (Garansi Resmi) dan unit *second-hand* berkualitas tinggi.

Sistem ini dirancang khusus untuk menjawab dinamika spesifik pasar Apple di Indonesia:
1. **Real-Time Unified Inventory:** Sinkronisasi stok tanpa jeda antara etalase website dengan stok fisik di meja kasir.
2. **Serialized Inventory (1 Unit = 1 IMEI/SN Unik):** Tiap unit *second* dicatat dengan identitas unik (*Battery Health*, grade fisik, kelengkapan, riwayat QC, serta status sinyal).
3. **Regulasi & Garansi Sinyal IMEI:** Klasifikasi transparan unit resmi vs bea cukai vs all operator beserta masa garansi sinyal untuk mencegah sengketa komplain.
4. **Auto Barcode & PDF Printing Engine:** Pembuatan otomatis barcode/QR per unit dengan label stiker berisikan ringkasan keterangan Master Product, dapat diexport ke PDF format thermal roll maupun lembaran A4 grid.
5. **Kecepatan & Keamanan POS Kasir:** Transaksi instan via pemindai kamera iOS / scanner Bluetooth, proteksi anti-fraud PIN supervisor, dan dukungan *offline-ready*.
6. **Layanan Purna Jual & CRM WhatsApp:** Otomatisasi pengiriman E-Receipt, Kartu Garansi Digital berbasis IMEI, modul tukar unit/servis (RMA), dan penerimaan Pre-Order / Down Payment (DP).

---

## 2. Sasaran & Tujuan Produk (Product Goals)

| Goal | Metrik Keberhasilan |
| :--- | :--- |
| **Estetika & Pengalaman Apple** | Tampilan modern, sleek, minimalis, responsif di semua resolusi dengan loading awal < 1.5 detik. |
| **Akurasi Stok & IMEI** | 0% *overselling* (produk laku di toko otomatis hilang/berubah status dari web secara real-time). |
| **Kecepatan Checkout Kasir** | Waktu proses per transaksi < 30 detik menggunakan scan barcode kamera iOS. |
| **Keamanan & Pencegahan Fraud** | 100% pembatalan (*void*) nota atau diskon khusus memerlukan otorisasi PIN Manajer. |
| **Kepuasan & Retensi Pelanggan** | E-Receipt dan Kartu Garansi Digital terkirim via WhatsApp dalam hitungan detik setelah pembayaran. |

---

## 3. User Personas & Hak Akses (RBAC) & Pemisahan Menu Mutlak

Sistem menerapkan arsitektur pemisahan mutlak (*Strict Architectural Boundary*) antara antarmuka **Publik (Customer)** dan **Portal Kasir Internal (Staff Backoffice)**:

1. **Customer (Pengunjung Website Publik — `iconicstore.co.id`):**
   - **Prinsip Utama:** Menampilkan pengalaman belanja ritel premium ala Apple (benchmark: `iosstore.id`).
   - **Menu Navigasi Publik yang Tampil:**
     * *Katalog Produk*
     * *Pricelist Ready Stock*
     * *Cek Garansi & Keaslian IMEI Mandiri*
     * *Simulasi Trade-In (Tukar Tambah)*
     * *Layanan & Biaya Servis Apple*
     * *Lokasi Cabang & Kontak WhatsApp*
     * *FAQ & Ketentuan Garansi*
   - **Restriksi Mutlak (Larangan Keras):**
     * Menu **Kasir POS**, Barcode Generator, Tombol "+ Kasir", Tombol "Buka di POS", Shift Drawer, Laporan Arus Kas, dan Harga Reseller/Modal **DILARANG MUNCUL** pada seluruh elemen website publik (navbar, kartu produk, popup detail, maupun header publik).
     * Pengunjung umum tidak boleh mengetahui atau melihat antarmuka penjualan kasir internal toko.

2. **Kasir / Store Crew (Portal Internal Terproteksi — Route `/pos` atau Subdomain Internal):**
   - **Akses Terisolasi:** Hanya dapat diakses oleh staf kasir melalui otentikasi PIN / login karyawan via route khusus `/pos` atau akses portal karyawan di area footer.
   - **Fitur Khusus Kasir:**
     * Mengelola shift kasir (buka shift, modal laci, tutup shift, rekonsiliasi kas Z-Report).
     * Memindai barcode produk via kamera bawaan iOS atau barcode scanner Bluetooth.
     * Mengubah mode harga secara instan antara **Harga Retail** dan **Harga Khusus Reseller**.
     * Melayani pembayaran (Tunai, QRIS, Transfer, EDC, Split Payment).
     * Melayani transaksi Pre-Order / titip Down Payment (DP) dan pelunasan.
     * Menginput tiket klaim garansi / retur pelanggan (RMA).

3. **Supervisor / Store Manager (Internal):**
   - Otorisasi pembatalan nota (*void*), retur uang, dan persetujuan diskon khusus via PIN Supervisor (`1234`).
   - Penyetujuan mutasi/transfer stok antar cabang.
   - Monitoring laporan penjualan harian dan arus kas per shift.

4. **Admin Gudang & QC Officer (Internal):**
   - Input unit baru/second masuk (QC fisik, Battery Health, fungsi 3uTools, input nomor IMEI).
   - Auto-generate dan cetak stiker barcode PDF (satuan atau *bulk print* thermal/A4).
   - Mengatur perpindahan stok antar cabang.

5. **Mitra Reseller & B2B (Internal Kasir Mode):**
   - Transaksi khusus grosir konter mitra dengan harga tier reseller, struk netral/polosan (mode dropship), dan pencatatan histori pembelian per reseller.

---

## 4. Kebutuhan Fitur & Spesifikasi Modul

```
┌────────────────────────────────────────────────────────────────────────┐
│                        iConicstore Unified Core                        │
│                 (Database PostgreSQL / Real-time Sync)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴──────────────────────────────┐
    ▼                                                              ▼
┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│   Web Storefront (Publik)        │      │  Staff Portal & POS (Internal)   │
│   Domain: iconicstore.co.id      │      │  Route: /pos (Proteksi PIN/Auth) │
│                                  │      │                                  │
│ • Etalase & Pricelist Apple      │      │ • Cloud POS Kasir (iPad/iPhone)  │
│ • Filter Sinyal & Grade Kondisi  │      │ • Scan Kamera iOS & Barcode HID  │
│ • Cek Garansi Mandiri via IMEI   │      │ • Mode Harga Reseller vs Retail  │
│ • Kalkulator Trade-In Mandiri    │      │ • Auto Barcode & Cetak PDF Label │
│ • Order Konsumen via WhatsApp    │      │ • Manajemen Shift Laci Kas       │
│ • Informasi Lokasi Cabang        │      │ • Void & Anti-Fraud PIN SPV      │
│                                  │      │ • Pre-Order (DP) & Pelunasan     │
│ ❌ BEBAS DARI MENU KASIR/INTERNAL │      │ • Modul Garansi & Retur (RMA)    │
└──────────────────────────────────┘      └──────────────────────────────────┘
    │                                                              │
    └───────────────────────────────┬──────────────────────────────┘
                                    ▼
                      ┌───────────────────────────┐
                      │  After-Sales & CRM Suite  │
                      │                           │
                      │ • WhatsApp E-Receipt      │
                      │ • Kartu Garansi Digital   │
                      │ • Klaim Garansi & RMA     │
                      │ • Reminder H-3 Garansi    │
                      └───────────────────────────┘
```

---

### Modul A: Web Storefront (Customer Facing — Benchmark iosstore.id — Khusus Konsumen)
> **PENTING:** Antarmuka etalase publik steril dari operasional internal. Menu kasir, tombol "+ Kasir", barcode generator, shift kasir, dan harga modal/reseller **DILARANG MUNCUL** pada navigasi publik demi menjaga profesionalitas dan kerahasiaan bisnis.

1. **Struktur Navigasi Multi-Halaman Khusus (Bukan Bergulir/Scroll Down):**
   - Setiap menu navigasi utama publik (**Katalog Produk**, **Pricelist Ready Stock**, **Cek Garansi & IMEI**, **Simulasi Trade-In**, **Lokasi Cabang**) membuka tampilan/halaman khusus itu sendiri secara penuh (**Dedicated Standalone View**), **bukan bergulir (scroll down) ke bawah**.
   - Setiap halaman memiliki header dan footer terpadu, visual Apple aesthetic seragam, serta tombol interaksi dan WhatsApp yang disesuaikan.
2. **Katalog & Pricelist Dinamis:**
   - Filter cepat berdasarkan:
     - Kategori perangkat (iPhone, iPad, MacBook, Apple Watch, AirPods & Aksesoris).
     - Kondisi: **Baru BNIB (Garansi Resmi)** vs **Second (Grade A+ / A / B)**.
     - **Status Sinyal / IMEI:**
       * *Resmi Indonesia (iBox / Digimap / GDN)*
       * *Inter Bea Cukai (Faktur Pajak Terdaftar)*
       * *Inter All Operator (Sinyal Garansi Toko)*
     - Kapasitas Penyimpanan (64GB, 128GB, 256GB, 512GB, 1TB).
   - Halaman Detail Unit: Menampilkan foto asli, Battery Health %, kelengkapan (Box Ori/OEM/Batangan), masa garansi toko, status garansi sinyal, dan tombol order WhatsApp langsung.
3. **Kalkulator Tukar Tambah Multi-Step Komprehensif (Trade-In Calculator — Benchmark iosstore.id):**
   Fitur simulasi tukar tambah mandiri dengan 4 tahapan penilaian terstruktur dan 14 parameter pemeriksaan detail:
   - **Tahap 01 (Lokasi Penilaian — Pilih Toko Tujuan):**
     * Memilih cabang fisik penukaran (*Cabang Surabaya Pusat*, *Cabang Malang*, atau *Semua Toko*) agar unit tujuan disesuaikan dengan ketersediaan stok fisik cabang tersebut.
   - **Tahap 02 (Perangkat Pelanggan — Spesifikasi HP Saat Ini):**
     * *Tipe iPhone:* Seri model saat ini (iPhone 11 s/d iPhone 15 Pro Max).
     * *Kapasitas:* Pilihan memori (64GB, 128GB, 256GB, 512GB, 1TB).
     * *Varian:* Asal unit (Resmi Indonesia iBox/Digimap, Inter Bea Cukai, Inter All Operator).
     * *Warna:* Pilihan warna bodi perangkat lama.
   - **Tahap 03 (Pemeriksaan Awal — Kondisi Perangkat / 8 Parameter Detail):**
     * *Kondisi Fisik:* Mulus Like New, Lecet Pemakaian Halus, atau Dent/Penyok.
     * *Battery Health (BH %):* Input persentase BH aktual (misal: 87%).
     * *Kondisi Layar:* Normal & TrueTone aktif, Gores Halus, Shadow/Garis, atau Rusak/Pecah.
     * *Face ID / Touch ID:* Berfungsi Normal atau Rusak/Mati.
     * *Kamera:* Normal jernih (0.5x, 1x, 3x), Berdebu/Jamur, atau Getar/OIS Rusak.
     * *Sinyal dan WiFi:* All Operator & WiFi Normal, WiFi Only, atau Sinyal Terblokir.
     * *Riwayat Servis:* 100% Full Original Pabrik, Pernah Ganti Baterai, Pernah Ganti LCD, atau Pernah Servis Mesin/IC.
     * *Kelengkapan:* Fullset Box Original & Aksesoris, Fullset OEM, atau Batangan (Unit Only).
   - **Tahap 04 (Perangkat Tujuan — HP yang Diinginkan):**
     * *Kondisi Tujuan:* Baru BNIB Garansi Resmi, Second Grade A+, Second Grade A, atau Second Grade B.
     * *Tipe iPhone Tujuan:* Seri unit impian yang ingin dibeli.
     * *Kapasitas Tujuan:* Pilihan penyimpanan memori target.
     * *Varian Tujuan:* Resmi Indonesia vs All Operator.
     * *Warna Tujuan:* Pilihan warna unit target.
   - **Disclaimer & Output Hasil Simulasi:**
     * Kotak Informasi: *"Estimasi tidak bersifat mengikat. Nilai akhir bergantung pada pemeriksaan fisik, IMEI, komponen, fungsi, dan kebijakan toko."*
     * Tombol Utama: *"Hitung Tukar Tambah"*
     * Kartu Hasil Interaktif: Menampilkan rincian estimasi nilai HP lama, harga unit target, selisih sisa bayar (*Estimasi Tambah*), opsi cicilan 0%, serta tombol langsung *"Konsultasi & Booking Trade-In via WhatsApp"* yang otomatis merangkum ke-14 parameter pemeriksaan untuk teknisi toko.
4. **Pengecekan IMEI & Garansi Mandiri:**
   - Fitur publik bagi customer untuk memasukkan 15 digit IMEI dan memverifikasi keaslian pembelian dari iConicstore serta sisa masa garansi toko.
5. **Pricelist Jasa Servis:**
   - Biaya perbaikan transparan untuk LCD, Baterai, Housing, Kamera, dan Face ID.
   - Booking servis langsung terhubung ke WhatsApp customer service.

---

### Modul B: Cloud POS (Point of Sale Kasir — Internal Staff Restricted Portal)
> **Akses Terbatas:** Hanya dapat dibuka oleh kasir dan kru toko melalui otentikasi login / PIN staf (misal via tombol rahasia di footer atau URL `/pos`). Tidak dapat diakses oleh publik pengunjung toko.

1. **Desain Antarmuka PWA & Keselarasan Tema Gelap Apple:**
   - Konsisten 100% dengan estetika visual halaman depan (`--bg: #0A0B0D`, `--surface: #15171B`, `--surface-2: #1D2025`, `--border: rgba(255,255,255,0.09)`, `--accent: #0A84FF`), rapi, berjarak proporsional, dan terbebas dari tampilan unstyled/mentah browser default.
   - Berjalan mulus di iPad Safari layar penuh (*Add to Home Screen*) dan iPhone toko.
   - Tombol ukuran sentuh besar, responsif, dan ergonomis untuk kasir yang berdiri maupun duduk.
2. **Scanning Cepat Barcode:**
   - Dukungan **Kamera Bawaan iOS** (dengan viewfinder fokus tajam & tombol senter flash).
   - Dukungan **Barcode Scanner Wireless Bluetooth** (mode keyboard wedge HID).
3. **Multi-Tier Pricing di Kasir (Harga Retail vs Harga Reseller):**
   - **Pilihan Tipe Pelanggan:** Kasir dapat mengganti mode transaksi antara **Pelanggan Retail (Umum)** dan **Reseller / Mitra Grosir**.
   - **Auto-Switch Harga Reseller:** Saat profil Reseller dipilih atau toggle *"Harga Reseller"* diaktifkan, harga unit di keranjang kasir otomatis berubah dari **Harga Retail** menjadi **Harga Khusus Reseller**.
   - **Database Mitra Reseller:** Menyimpan data nama reseller, nama toko/konter mitra, nomor WhatsApp, serta histori akumulasi transaksi pembelian mereka.
   - **Mode Struk Dropship / Polosan:** Opsi bagi reseller yang meminta struk tanpa logo toko (*neutral receipt*) agar unit bisa langsung diserahkan kepada konsumen akhir mereka.

4. **Metode Pembayaran Lengkap:**
   - Tunai (dengan hitungan kembalian otomatis).
   - QRIS Statis maupun Dinamis otomatis.
   - Mesin EDC (Kartu Debit & Kredit).
   - Transfer Bank (dilengkapi tombol verifikasi mutasi).
   - *Split Payment* (kombinasi 2 metode pembayaran dalam satu transaksi).

5. **Manajemen Shift Kasir:**
   - Buka shift: Input modal kas awal laci (*cash float*).
   - Catat arus kas keluar operasional kecil (kasbon, lakban, dll.).
   - Tutup shift: Perhitungan uang kas fisik vs data sistem (X-Report & Z-Report).

6. **Anti-Fraud & Otorisasi PIN Supervisor:**
   - Pembatalan transaksi (*void*) wajib memasukkan PIN Manajer.
   - Diskon di atas batas wewenang kasir (misal > Rp 100.000) memerlukan persetujuan Supervisor.
   - Seluruh tindakan sensitif tercatat dalam *Audit Trail*.

7. **Ketahanan Kasir (Offline-Ready Resilience):**
   - Menggunakan penyimpanan lokal browser (*IndexedDB*).
   - Jika koneksi internet toko terputus, kasir tetap dapat membuat transaksi penjualan tunai/scan barcode, dan data otomatis tersinkronisasi kembali saat online.

---

### Modul C: Serialized Inventory & PDF Barcode Engine

1. **Serialized Inventory Tracking (1 IMEI = 1 Data Unik):**
   - Setiap unit iPhone/iPad second dicatat secara spesifik:
     - Nomor IMEI & Serial Number
     - Kondisi Fisik & Grade (A+ / A / B)
     - Persentase Battery Health (BH %)
     - Status Sinyal & Asal (iBox / Bea Cukai / All Op)
     - Masa Garansi Sinyal (contoh: 3 Bulan / 1 Tahun / Permanen)
     - Masa Garansi Toko (contoh: 1 Bulan Tukar Unit)
     - **Struktur Harga Bertingkat (Pricing Tiers):**
       * `Harga Modal / HPP` (hanya terlihat oleh Owner/Manager)
       * `Harga Retail` (harga umum yang tampil di website dan pelanggan biasa)
       * `Harga Reseller` (harga khusus mitra/konter yang aktif saat transaksi reseller di POS)

2. **Auto Barcode & Format Label Master Product:**
   - Sistem otomatis membuat Barcode Code 128 atau QR Code yang merepresentasikan identitas unit.
   - **Tampilan Visual Stiker Label:**
     ```
     ┌────────────────────────────────────────────────────────┐
     │  iConicstore                         [iBox Resmi / All]│
     │  ────────────────────────────────────────────────────  │
     │         ||| | |||| || |||||| ||||| ||| ||||            │  <- Barcode (Code 128 / QR)
     │                    BC-IP13-88901                       │  <- Human-Readable Code
     │  ────────────────────────────────────────────────────  │
     │  [KETERANGAN MASTER PRODUCT]:                          │
     │  • Seri/Model : iPhone 13 128GB - Midnight Blue        │
     │  • No. IMEI   : 356789123456789                        │
     │  • Kondisi    : Second Like New (Grade A+)             │
     │  • Baterai    : BH 89% | TrueTone & Face ID Normal     │
     │  • Sinyal     : Garansi Sinyal Seumur Hidup            │
     │  • Garansi    : Toko 1 Bulan (Replace / Servis)        │
     │  • Hrg Retail : Rp 8.499.000                           │
     │  • Hrg Reseller: Rp 8.100.000                          │
     └────────────────────────────────────────────────────────┘
     ```

3. **PDF Barcode Printing Engine:**
   - **Format Thermal Roll:** Ukuran stiker tunggal `50x30 mm`, `40x30 mm`, atau `50x20 mm` untuk printer label thermal (Xprinter, Blueprint, Panda, Zebra).
   - **Format A4 Sheet Grid Sticker:** Format kisi multi-kolom di kertas A4 (misal: template stiker Tom & Jerry No. 108 atau 121) untuk dicetak via printer biasa.
   - **Bulk Print:** Opsi mencetak banyak label sekaligus dari daftar tabel inventaris.

---

### Modul D: Pre-Order (PO), Down Payment (DP), & Booking Unit

1. **Penerimaan DP di POS & Website:**
   - Pilihan transaksi: **Down Payment (DP)** saat customer memesan iPhone baru atau mem-booking unit second.
   - Input data: Nama pemesan, No. WhatsApp, unit yang dipesan, nominal DP, dan batas waktu pelunasan.
2. **Kwitansi Tanda Terima DP:**
   - Kasir mencetak kwitansi resmi tanda terima DP (memuat No. Invoice DP unik & QR code pelunasan).
   - Kwitansi otomatis terkirim pula ke WhatsApp pembeli.
3. **Pelunasan Sisa Pembayaran:**
   - Saat unit tiba di toko dan pembeli datang, kasir memindai QR nota DP atau mencari nama pemesan.
   - Kasir mengaitkan unit fisik (IMEI) yang diserahkan, memproses pembayaran sisa tagihan, dan mencetak struk lunas.

---

### Modul E: After-Sales, Klaim Garansi & Retur (RMA Module)

1. **Validasi Garansi Instan:**
   - Kasir atau teknisi cukup memindai barcode atau menginput nomor IMEI customer.
   - Sistem menampilkan riwayat lengkap: Tanggal beli, sisa masa garansi toko, sisa masa garansi sinyal, dan riwayat klaim sebelumnya.
2. **Pilihan Alur Penyelesaian Garansi:**
   - **Tukar Unit (Replace):** Unit bermasalah masuk ke gudang retur (*Defective Stock*), dan unit pengganti dikeluarkan dari inventaris siap jual.
   - **Servis Garansi:** Penerbitan *Tanda Terima Servis* (Work Order), alokasi ke teknisi toko, dan notifikasi status pengerjaan via WhatsApp.
   - **Tolak Garansi (Void Warranty):** Jika unit terkena air atau segel baut toko rusak (disertai foto bukti di sistem).

---

### Modul F: WhatsApp Gateway Terintegrasi

1. **Pengiriman E-Receipt & Kartu Garansi Digital Otomatis:**
   - Setelah kasir menekan tombol "Selesai", sistem secara otomatis mengirimkan pesan WhatsApp ke pembeli:
     * Link invoice resmi (PDF E-Receipt).
     * Kartu Garansi Digital berisi data lengkap nomor IMEI, seri HP, dan tanggal kedaluwarsa garansi.
2. **Reminder Otomatis (Warranty Expiry):**
   - Sistem mengirimkan pesan pengingat ramah pada **H-3 sebelum masa garansi toko berakhir** untuk memastikan kondisi HP customer tetap prima.

---

### Modul G: Manajemen Reseller & Kemitraan B2B (Harga Khusus Reseller)

1. **Struktur Multi-Tier Pricing (Retail vs Reseller):**
   - Setiap produk memiliki 3 lapis harga:
     * `Harga Modal / HPP` (Hanya dapat diakses oleh Owner/Super Admin).
     * `Harga Retail` (Harga publik di website dan kasir untuk konsumen akhir).
     * `Harga Reseller` (Harga khusus grosir/mitra toko yang aktif otomatis saat transaksi reseller).
2. **Operasional Transaksi Kasir POS Khusus Reseller:**
   - **Toggle Instan Kasir:** Tombol cepat di layar POS iPad/iPhone untuk beralih antara `[ Mode Retail ]` dan `[ Mode Reseller ]`.
   - **Pencarian Mitra Reseller:** Kasir dapat memilih profil mitra dari database (Nama Mitra, Nama Toko/Konter, No. WhatsApp).
   - **Kalkulasi Otomatis:** Begitu mode reseller aktif, seluruh item di keranjang belanja seketika disesuaikan dengan Harga Reseller masing-masing.
   - **Opsi Struk Netral (Mode Dropship):**
     * Kasir dapat memilih opsi cetak struk biasa (berlogo iConicstore) atau **Struk Netral / Polosan** tanpa logo toko, khusus untuk reseller dropship yang langsung menyerahkan HP ke pembeli akhir mereka.
3. **Database & Manajemen Performa Reseller:**
   - Rekam jejak seluruh transaksi pembelian unit per reseller (riwayat nomor IMEI yang pernah dibeli oleh reseller tersebut).
   - Laporan akumulasi omset per mitra reseller untuk program loyalitas / reward grosir bulanan.
4. **Tampilan Harga pada Label Barcode PDF:**
   - Label stiker barcode fisik memuat informasi ganda (*Hrg Retail* dan *Hrg Reseller*) sehingga kru toko dan kasir dapat langsung mengetahui harga jual ke konter mitra tanpa perlu mengecek sistem manual.

---

### Modul H: Multi-Cabang & Mutasi Stok

1. **Multi-Outlet Support:**
   - Manajemen stok per cabang toko fisik (Cabang Surabaya Pusat, Cabang Malang Town Square) dan gudang pusat logistik.
2. **Mutasi Antar Cabang:**
   - Modul pembuatan *Surat Jalan Mutasi* saat mengirimkan unit IMEI tertentu dari Cabang A ke Cabang B.
   - Status: *Dikirim (In-Transit)* ➔ *Diterima & Diverifikasi oleh Cabang Tujuan*.

---

### Modul I: Portal Owner & Executive Dashboard (Laporan Keuangan & Kontrol Bisnis)
> **Akses Tertinggi (Super Admin):** Terproteksi PIN Khusus Owner (`9999`). Modul ini memberikan visibilitas 360 derajat atas profitabilitas, perputaran uang kas laci, performa cabang, dan risiko inventaris Apple.

1. **Analisis Penjualan & Margin Keuntungan:**
   - Rekap Omzet Kotor (*Gross Revenue*), Total Modal Pokok (*HPP / COGS per Serialized IMEI*), dan Laba Bersih (*Gross Profit*).
   - Analisis persentase Margin Bersih (%) dan Rata-rata Nilai Transaksi (*Average Order Value / AOV*).
   - Visualisasi grafik kontribusi volume per kategori (iPhone, MacBook, iPad, Apple Watch, AirPods & Aksesoris).
   - Analisis perbandingan rasio pendapatan jalur **Retail (End-User)** vs **Reseller (Mitra Grosir)**.

2. **Laporan Penjualan Komprehensif & Ekspor:**
   - Filter multidimensi: Filter periode (Hari Ini, 7 Hari, Bulan Ini, Custom) dan Filter Cabang (Semua, Surabaya Pusat, Malang Town Square).
   - **Rekap Settlement Rekening & Pembayaran:** Memisahkan omzet tunai fisik, saldo QRIS Dinamis, transaksi mesin EDC (BCA/Mandiri), dan Transfer Bank untuk rekonsiliasi mutasi bank harian.
   - Fitur **Ekspor Laporan Penjualan ke format CSV / Excel** siap cetak untuk arsip pembukuan dan akuntansi.

3. **Riwayat Penjualan Lengkap (Transaction Ledger):**
   - Catatan seluruh transaksi kasir: No. Nota, Waktu Transaksi, Cabang, Nama Kasir, Data Pelanggan, Unit Terjual, Harga Modal, Harga Jual, Laba Kotor, dan Metode Bayar.
   - Fitur cetak ulang salinan Struk Thermal (58/80mm) dan kirim ulang invoice digital ke WhatsApp pembeli sewaktu-waktu.

4. **Laporan Tutup Shift Kasir (Z-Report & Audit Kas Laci):**
   - Riwayat penutupan shift kasir di setiap outlet toko fisik.
   - Pencatatan Modal Awal Kas (*Cash Float*), Total Penjualan Tunai, Total Penjualan Non-Tunai, dan Uang Tunai Fisik Aktual di Laci Kasir (*Drawer Closing Count*).
   - **Deteksi Selisih Kas (*Cash Leakage / Over-Short*):** Status audit otomatis (*Seimbang Rp 0*, *Selisih Kurang/Minus*, atau *Selisih Lebih*) untuk mencegah fraud dan kelalaian kasir.

5. **Performance Tiap Outlet (Multi-Branch KPI & Benchmarking):**
   - Komparasi berdampingan performa bisnis **Cabang Surabaya Pusat** vs **Cabang Malang Town Square**.
   - Metrik komparasi: Total Omzet, Total Laba Bersih, Volume Unit Terjual, Nilai Aset Stok Fisik di Etalase, dan Rasio Perputaran Stok (*Inventory Turnover Rate*).
   - Rekomendasi mutasi / transfer stok antar outlet jika permintaan di salah satu cabang meningkat.

6. **Pengaturan Produk Master & Konfigurasi Toko:**
   - **Katalog Master Produk Apple:** Menentukan seri model, kategori, acuan Harga Retail, acuan Harga Reseller, estimasi batas bawah HPP, dan ambang batas minimum stok (*Stock Alert Threshold*).
   - **Manajemen Keamanan PIN:** Pengaturan PIN Owner (`9999`), PIN Otorisasi Supervisor (`1234`), dan PIN Kasir.
   - **Kebijakan Toko:** Pengaturan default masa garansi toko, masa garansi sinyal IMEI, dan ambang batas diskon supervisor (> Rp 100.000).

7. **Fitur Eksekutif Tambahan Khusus Bisnis Apple (Smart Risk Radar):**
   - **Aging Stock & Depresiasi Alert:** Deteksi otomatis unit HP yang mengendap >14 hari di etalase toko dengan peringatan risiko depresiasi harga pasar iPhone, disertai rekomendasi program flash sale/diskon khusus.
   - **Valuasi Realtime Total Aset Inventaris:** Menghitung total nilai kapital/modal owner yang saat ini tertanam pada seluruh stok fisik unit di etalase toko.
   - **Audit Trail Anti-Fraud / Void Kasir:** Rekap riwayat pembatalan transaksi (Void) yang memerlukan persetujuan Supervisor.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Keamanan (Security):**
   - Role-Based Access Control (RBAC) ketat dengan sesi aman.
   - Audit Trail mencatat setiap perubahan harga dan mutasi stok.
2. **Performa & Ketahanan:**
   - Kecepatan scan barcode kamera < 200 milidetik.
   - Offline-ready caching untuk mode kasir darurat.
3. **Kompatibilitas Perangkat Keras:**
   - Printer Struk: Thermal 58mm & 80mm (Bluetooth ESC/POS, USB, Wi-Fi LAN).
   - Printer Barcode: Printer thermal label (TSPL/ZPL/ESC-POS) & Printer laser A4 biasa.
   - Device Kasir: iPad OS Safari PWA, iPhone iOS, dan Chrome Desktop.
4. **Aturan Desain & Estetika Visual (Zero Emoticon / Emoji Policy):**
   - **Bebas Emoticon/Emoji:** Dilarang keras menggunakan emoticon/emoji karakter di seluruh ekosistem iConicstore (Web Storefront, POS Kasir, Cetak Struk Thermal, Label Stiker Barcode, Dashboard Admin, serta Template WhatsApp).
   - **Estetika Mewah & Minimalis:** Tampilan mengadopsi standar Apple Design Guidelines dengan tipografi modern (*Inter / SF Pro Display*), palet monokromatik elegan (hitam, putih, abu-abu platinum, slate), serta ikon vektor SVG garis tipis monokromatik (*Lucide Icons / SF Symbols style*) untuk memastikan citra toko terlihat sangat profesional dan eksklusif.

---

## 6. Rekomendasi Tech Stack & Arsitektur

| Layer | Rekomendasi Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Frontend Web & POS** | **Next.js 14+ (React) + Tailwind CSS** (PWA Ready) | UI modern kaca minimalis Apple, SEO terbaik untuk web storefront, dan dapat di-install sebagai aplikasi layar penuh di iPad/iPhone. |
| **Backend & Realtime DB** | **Node.js / Next API** + **PostgreSQL (Supabase / Prisma)** | ACID compliant untuk transaksi keuangan, relasi serial IMEI yang solid, dan dukungan WebSocket realtime untuk update stok kasir ke web. |
| **Barcode & PDF Engine**| **JsBarcode / QRCode.js** + **jsPDF / react-pdf** | Menghasilkan file PDF barcode tajam beresolusi tinggi (vektor) siap cetak di ukuran label kontinu maupun kertas A4. |
| **iOS Scanner Engine** | **@zxing/browser / BarcodeDetector API** | Ringan, memanfaatkan kamera bawaan Safari iOS tanpa aplikasi native tambahan. |
| **WhatsApp Gateway**   | **Fonnte / Waha / Baileys API** | Pengiriman otomatis invoice, kartu garansi, dan notifikasi ke pelanggan. |

---

## 7. Tahapan Pengembangan (Milestone Roadmap)

- **Fase 1: Fondasi Sistem & Desain Skema Database** (Multi-outlet, Master Product, Serialized IMEI, Status Sinyal, User Role & PIN).
- **Fase 2: Web Storefront iConicstore** (Desain visual ala Apple, Katalog, Filter Sinyal/Kondisi, Trade-In Calculator, Cek IMEI).
- **Fase 3: Serialized Inventory & PDF Barcode Engine** (Input barang QC, Auto Barcode, Print Stiker Thermal & A4 Grid ke PDF).
- **Fase 4: Cloud POS Kasir iOS & Engine Reseller** (PWA iPad/iPhone, scan kamera iOS, toggle cepat Harga Reseller, struk dropship polosan, multi-payment, shift kasir, anti-fraud PIN, cetak struk thermal).
- **Fase 5: Pre-Order (DP), After-Sales (RMA) & WhatsApp CRM** (Sistem DP/pelunasan, retur unit via IMEI, kirim e-receipt & kartu garansi otomatis).
- **Fase 6: Testing Operasional, Kalibrasi Barcode Thermal & Peluncuran Resmi**.
