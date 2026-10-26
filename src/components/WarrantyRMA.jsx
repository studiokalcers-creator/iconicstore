import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  RefreshCw, 
  Clock, 
  FileText, 
  Smartphone, 
  Calendar, 
  User, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { formatRupiah } from '../utils/barcodePdfEngine';
import { showToast } from './AppleAlertToast';

export default function WarrantyRMA({ units, salesHistory }) {
  const [searchImei, setSearchImei] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [rmaMode, setRmaMode] = useState(null); // 'replace' | 'service'
  const [rmaNote, setRmaNote] = useState('');
  const [rmaSuccess, setRmaSuccess] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchImei.trim()) return;

    setHasSearched(true);
    setRmaMode(null);
    setRmaSuccess(false);

    const query = searchImei.trim().toUpperCase();

    // Check in past sales or existing units
    const foundSale = salesHistory.find(s => s.imei === query);
    const foundUnit = units.find(u => u.imei === query || u.barcodeCode === query);

    if (foundSale) {
      setSearchResult({
        type: 'sale_found',
        modelName: foundSale.modelName,
        imei: foundSale.imei,
        saleDate: foundSale.date,
        customerName: foundSale.customerName,
        cashier: foundSale.cashierName,
        warrantyEnd: foundSale.warrantyEnd,
        isWarrantyActive: new Date(foundSale.warrantyEnd) >= new Date(),
        storeWarranty: '1 Bulan Tukar Unit Toko',
        signalStatus: 'Resmi Indonesia (iBox) — Permanen'
      });
    } else if (foundUnit) {
      setSearchResult({
        type: 'inventory_found',
        modelName: foundUnit.modelName,
        imei: foundUnit.imei,
        saleDate: foundUnit.status === 'sold' ? '23 Oktober 2026' : 'Unit Masih di Inventaris Toko',
        customerName: foundUnit.status === 'sold' ? 'Pelanggan Toko' : 'Belum Terjual',
        cashier: 'System iConicstore',
        warrantyEnd: '2026-11-23',
        isWarrantyActive: true,
        storeWarranty: foundUnit.storeWarranty,
        signalStatus: foundUnit.signalWarranty
      });
    } else {
      setSearchResult(null);
    }
  };

  const handleProcessRma = () => {
    if (!rmaNote.trim()) {
      showToast('Mohon tuliskan kendala fisik / keluhan pelanggan terlebih dahulu.', 'warning', 'Keluhan Wajib Diisi');
      return;
    }
    setRmaSuccess(true);
    showToast('Klaim garansi unit berhasil diproses ke antrean teknisi.', 'success', 'RMA Diproses');
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto">
          <span className="badge badge-blue mb-2">After-Sales & RMA Center</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Pengecekan Garansi & Klaim Servis
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Validasi keaslian pembelian unit Apple dan sisa masa garansi resmi iConicstore melalui nomor IMEI.
          </p>
        </div>

        {/* Search Box */}
        <div className="glass-card p-6 border border-white/10">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Masukkan 15 digit nomor IMEI atau Kode Barcode..."
                value={searchImei}
                onChange={(e) => setSearchImei(e.target.value)}
                className="input-field pl-10 font-mono text-sm"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary text-xs font-bold px-6">
              <span>Cek Garansi</span>
            </button>
          </form>

          {/* Quick Example Tester Button */}
          <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
            <span>Contoh IMEI Uji Coba:</span>
            <button
              type="button"
              onClick={() => {
                setSearchImei('359012389102931');
              }}
              className="font-mono text-blue-400 hover:underline"
            >
              359012389102931 (Terjual)
            </button>
            <span>atau</span>
            <button
              type="button"
              onClick={() => {
                setSearchImei('356789123456789');
              }}
              className="font-mono text-blue-400 hover:underline"
            >
              356789123456789 (Ready)
            </button>
          </div>
        </div>

        {/* Result Card */}
        {hasSearched && (
          <div>
            {searchResult ? (
              <div className="glass-card p-6 border border-emerald-500/30 bg-emerald-950/10 space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{searchResult.modelName}</h3>
                      <p className="text-xs font-mono text-neutral-400">IMEI: {searchResult.imei}</p>
                    </div>
                  </div>

                  <span className={`badge ${searchResult.isWarrantyActive ? 'badge-green' : 'badge-amber'}`}>
                    {searchResult.isWarrantyActive ? 'Garansi Toko Aktif' : 'Garansi Toko Berakhir'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-white/5">
                    <span className="text-neutral-400 block text-[11px] mb-1">Tanggal Transaksi:</span>
                    <span className="font-medium text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {searchResult.saleDate}
                    </span>
                  </div>

                  <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-white/5">
                    <span className="text-neutral-400 block text-[11px] mb-1">Batas Waktu Garansi:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {searchResult.warrantyEnd}
                    </span>
                  </div>

                  <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-white/5">
                    <span className="text-neutral-400 block text-[11px] mb-1">Pembeli Terdaftar:</span>
                    <span className="font-medium text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      {searchResult.customerName}
                    </span>
                  </div>
                </div>

                {/* RMA Action Buttons for Cashier / Customer Service */}
                <div className="border-t border-white/10 pt-4">
                  <span className="text-xs font-bold text-neutral-300 block mb-3">Tindakan Klaim Purna Jual:</span>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setRmaMode('replace')}
                      className={`btn btn-sm ${rmaMode === 'replace' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Proses Tukar Unit (Replace)</span>
                    </button>

                    <button
                      onClick={() => setRmaMode('service')}
                      className={`btn btn-sm ${rmaMode === 'service' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Buka Tiket Servis Garansi</span>
                    </button>
                  </div>

                  {/* RMA Form Details */}
                  {rmaMode && (
                    <div className="mt-4 p-4 rounded-xl bg-neutral-900 border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold text-white">
                        {rmaMode === 'replace' ? 'Formulir Tukar Unit Rusak' : 'Tiket Servis Garansi Toko'}
                      </h4>

                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Keluhan Kerusakan Unit:</label>
                        <textarea
                          rows={2}
                          placeholder="Deskripsikan kerusakan (misal: Layar flicker, Baterai drop cepat, Speaker kresek)..."
                          value={rmaNote}
                          onChange={(e) => setRmaNote(e.target.value)}
                          className="input-field text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRmaMode(null)}
                          className="btn btn-ghost btn-sm"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleProcessRma}
                          className="btn btn-primary btn-sm font-bold"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Terbitkan Bukti Klaim Garansi</span>
                        </button>
                      </div>

                      {rmaSuccess && (
                        <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Klaim Garansi Berhasil Diterbitkan. Nomor Tiket RMA-20261023-881 telah tercatat di sistem.</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="glass-card p-8 text-center border-rose-500/20 bg-rose-950/10">
                <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white mb-1">Nomor IMEI Tidak Ditemukan</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Unit dengan nomor IMEI tersebut tidak terdaftar dalam riwayat penjualan resmi iConicstore. Pastikan kembali nomor IMEI yang dimasukkan sesuai dengan fisik perangkat.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
