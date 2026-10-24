import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Printer, 
  Check, 
  Clock, 
  ArrowRight, 
  User, 
  Phone, 
  Smartphone, 
  CreditCard, 
  Receipt,
  X,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { formatRupiah } from '../utils/barcodePdfEngine';
import { showToast } from './AppleAlertToast';

export default function PreOrderManager({ 
  preorders, 
  onAddPreorder, 
  onFulfillPreorderAtPos 
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [modelRequested, setModelRequested] = useState('iPhone 16 Pro Max 256GB Desert Titanium');
  const [estimatedTotal, setEstimatedTotal] = useState(24999000);
  const [dpAmount, setDpAmount] = useState(2000000);
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [paymentMethod, setPaymentMethod] = useState('QRIS Dinamis');

  // Receipt preview modal for DP
  const [previewDpReceipt, setPreviewDpReceipt] = useState(null);

  const handleCreatePreorder = (e) => {
    e.preventDefault();
    if (!customerName || !phone || !modelRequested || dpAmount <= 0) {
      showToast('Mohon lengkapi seluruh kolom data pemesanan DP pelanggan.', 'warning', 'Data Belum Lengkap');
      return;
    }

    const newPO = {
      id: `PO-${Date.now().toString().slice(-6)}`,
      customerName,
      phone,
      modelRequested,
      dpAmount: Number(dpAmount),
      estimatedTotal: Number(estimatedTotal),
      orderDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'Menunggu Unit Datang',
      paymentMethod
    };

    onAddPreorder(newPO);
    setPreviewDpReceipt(newPO);
    setIsAddModalOpen(false);
    setCustomerName('');
    setPhone('');
    setDpAmount(2000000);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="badge badge-amber mb-1">Pre-Order & Inden</span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-400" />
              <span>Manajemen Pre-Order & Down Payment (DP)</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kelola titip uang muka inden iPhone seri terbaru dan booking unit second pelanggan.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Terima DP Pre-Order Baru</span>
          </button>
        </div>

        {/* PO List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {preorders.map(po => {
            const remainingBalance = po.estimatedTotal - po.dpAmount;
            return (
              <div key={po.id} className="glass-card p-6 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-xs text-amber-400 font-bold">{po.id}</span>
                    <span className={`badge ${po.status && po.status.includes('Lunas') ? 'badge-emerald' : 'badge-amber'} text-[10px]`}>
                      {po.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
                    {po.modelRequested}
                  </h3>
                  <p className="text-xs text-neutral-400 mb-4 flex items-center gap-2">
                    <span>{po.customerName}</span>
                    <span>•</span>
                    <span className="font-mono">{po.phone}</span>
                  </p>

                  <div className="space-y-2 text-xs bg-white/5 p-4 rounded-xl border border-white/5 mb-4">
                    <div className="flex justify-between text-neutral-300">
                      <span className="text-neutral-400">Total Nilai Unit:</span>
                      <span className="font-bold text-white">{formatRupiah(po.estimatedTotal)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span className="text-neutral-400">DP Diterima:</span>
                      <span className="font-extrabold text-emerald-400">{formatRupiah(po.dpAmount)}</span>
                    </div>
                    <div className="border-t border-white/5 pt-1.5 flex justify-between text-neutral-300">
                      <span className="text-neutral-400 font-bold">Sisa Pelunasan:</span>
                      <span className={`font-black ${po.status && po.status.includes('Lunas') ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {po.status && po.status.includes('Lunas') ? 'Rp 0 (Lunas)' : formatRupiah(remainingBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-neutral-400 pt-1">
                      <span>Estimasi Datang:</span>
                      <span className="text-neutral-200">{po.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreviewDpReceipt(po)}
                    className="btn btn-secondary text-xs"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Kwitansi DP</span>
                  </button>

                  {po.status && po.status.includes('Lunas') ? (
                    <button
                      type="button"
                      disabled
                      className="btn btn-secondary text-xs opacity-60 cursor-not-allowed flex items-center justify-center gap-1.5"
                      title="Pesanan ini sudah dilunasi di kasir POS"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sudah Lunas</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onFulfillPreorderAtPos(po)}
                      className="btn btn-primary text-xs font-bold"
                    >
                      <span>Pelunasan di POS</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL 1: Form Terima DP Baru */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg p-6 bg-neutral-950">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Formulir Down Payment (DP) Pre-Order</h3>
                <span className="text-xs text-neutral-400">Menerbitkan kwitansi tanda terima titip DP resmi</span>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePreorder} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">Nama Pemesan:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Arya Pratama"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">No. WhatsApp:</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Unit yang Dipesan / Di-booking:</label>
                <input
                  type="text"
                  placeholder="Contoh: iPhone 16 Pro Max 256GB Desert Titanium"
                  value={modelRequested}
                  onChange={(e) => setModelRequested(e.target.value)}
                  className="input-field text-xs font-semibold text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">Estimasi Total Harga:</label>
                  <input
                    type="number"
                    value={estimatedTotal}
                    onChange={(e) => setEstimatedTotal(e.target.value)}
                    className="input-field text-xs font-mono font-bold text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">Nominal DP Diterima:</label>
                  <input
                    type="number"
                    value={dpAmount}
                    onChange={(e) => setDpAmount(e.target.value)}
                    className="input-field text-xs font-mono font-bold text-emerald-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">Metode Pembayaran DP:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="Tunai">Tunai Kas Toko</option>
                    <option value="QRIS Dinamis">QRIS Dinamis</option>
                    <option value="Transfer BCA">Transfer Bank BCA</option>
                    <option value="Mesin EDC">Mesin EDC Kartu Debit</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">Estimasi Barang Tiba:</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-field text-xs"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-900 border border-white/5 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>Sisa Pelunasan Nanti:</span>
                  <span className="font-bold text-amber-400">{formatRupiah(estimatedTotal - dpAmount)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Terbitkan Kwitansi DP</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Cetak Kwitansi Tanda Terima DP */}
      {previewDpReceipt && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md p-6 bg-neutral-950">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white">Kwitansi Tanda Terima Uang Muka</h3>
              <button 
                onClick={() => setPreviewDpReceipt(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Box */}
            <div className="bg-white text-black p-5 rounded-xl font-mono text-xs leading-relaxed border border-neutral-300 shadow-inner mb-4">
              <div className="text-center pb-2 border-b border-black mb-3">
                <h4 className="font-extrabold text-sm tracking-wider">iConicstore</h4>
                <p className="text-[10px]">Tanda Terima Uang Muka (Down Payment)</p>
                <p className="text-[9px] text-neutral-600">Bukti Booking Sah & Resmi</p>
              </div>

              <div className="text-[10px] space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>No. Booking:</span>
                  <span className="font-bold">{previewDpReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nama Pemesan:</span>
                  <span>{previewDpReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. WhatsApp:</span>
                  <span>{previewDpReceipt.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal Booking:</span>
                  <span>{previewDpReceipt.orderDate}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-black py-2 space-y-1 text-[10px]">
                <div className="font-bold">{previewDpReceipt.modelRequested}</div>
                <div className="flex justify-between text-neutral-700">
                  <span>Estimasi Total:</span>
                  <span>{formatRupiah(previewDpReceipt.estimatedTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-black text-xs pt-1">
                  <span>UANG MUKA (DP):</span>
                  <span>{formatRupiah(previewDpReceipt.dpAmount)}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Sisa Pelunasan:</span>
                  <span>{formatRupiah(previewDpReceipt.estimatedTotal - previewDpReceipt.dpAmount)}</span>
                </div>
              </div>

              <div className="text-center text-[9px] border-t border-dashed border-black mt-3 pt-2 text-neutral-600">
                Tunjukkan kwitansi ini saat unit tiba untuk proses pelunasan.<br />
                DP berlaku sampai: {previewDpReceipt.dueDate}
              </div>
            </div>

            {/* Print & Close Action */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Thermal</span>
              </button>

              <button
                onClick={() => setPreviewDpReceipt(null)}
                className="btn btn-primary text-xs font-bold"
              >
                <span>Tutup</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
