import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Building2, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Award, 
  ArrowRight, 
  Check, 
  TrendingUp, 
  X,
  Tag,
  Edit2,
  Trash2
} from 'lucide-react';
import { formatRupiah } from '../utils/barcodePdfEngine';
import { showToast } from './AppleAlertToast';

export default function ResellersManager({ 
  resellers, 
  onAddReseller, 
  onUpdateReseller,
  onDeleteReseller,
  onOpenPosWithReseller 
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingReseller, setDeletingReseller] = useState(null);
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [tier, setTier] = useState('Silver Partner');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setShopName('');
    setPhone('');
    setCity('');
    setTier('Silver Partner');
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingId(r.id);
    setName(r.name || '');
    setShopName(r.shopName || '');
    setPhone(r.phone || '');
    setCity(r.city || '');
    setTier(r.tier || 'Silver Partner');
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleCreateReseller = (e) => {
    e.preventDefault();
    if (!name.trim() || !shopName.trim() || !phone.trim()) {
      showToast('Nama, Nama Toko/Konter, dan No. WhatsApp wajib diisi.', 'warning', 'Data Belum Lengkap');
      return;
    }

    if (editingId) {
      const existing = (resellers || []).find(r => r.id === editingId);
      const updated = {
        ...existing,
        name: name.trim(),
        shopName: shopName.trim(),
        phone: phone.trim(),
        city: city.trim() || 'Indonesia',
        tier
      };
      if (onUpdateReseller) onUpdateReseller(updated);
      closeModal();
      showToast(`Data mitra "${updated.shopName}" berhasil diperbarui.`, 'success', 'Mitra Diperbarui');
      return;
    }

    const newPartner = {
      id: `res-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      shopName: shopName.trim(),
      phone: phone.trim(),
      city: city.trim() || 'Indonesia',
      tier,
      totalPurchases: 0,
      unitCount: 0
    };

    onAddReseller(newPartner);
    closeModal();
    showToast(`Mitra Reseller "${newPartner.shopName}" berhasil didaftarkan ke sistem.`, 'success', 'Mitra Terdaftar');
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="badge badge-purple mb-1">Jaringan Penjualan B2B</span>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              <span>Manajemen Mitra Reseller & Grosir</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kelola data konter rekanan, tier harga khusus reseller, dan akumulasi omset pembelian grosir.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="btn btn-primary text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Mitra Baru</span>
          </button>
        </div>

        {/* Resellers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resellers.map(r => (
            <div key={r.id} className="glass-card p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className={`badge ${
                    r.tier.includes('Platinum') ? 'badge-purple' : 
                    r.tier.includes('Gold') ? 'badge-amber' : 'badge-neutral'
                  }`}>
                    {r.tier}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-0.5">{r.shopName}</h3>
                <p className="text-xs text-neutral-400 mb-3">{r.name} • {r.city}</p>

                <div className="space-y-2 text-xs bg-white/5 p-3 rounded-xl border border-white/5 mb-4">
                  <div className="flex justify-between text-neutral-300">
                    <span className="text-neutral-400">Total Akumulasi:</span>
                    <span className="font-extrabold text-white">{formatRupiah(r.totalPurchases)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span className="text-neutral-400">Unit Terjual:</span>
                    <span className="font-medium text-white">{r.unitCount} Unit Apple</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span className="text-neutral-400">WhatsApp:</span>
                    <span className="font-mono text-purple-400">{r.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onOpenPosWithReseller(r.id)}
                  className="btn btn-secondary w-full text-xs font-semibold"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Buka Kasir Mode Reseller</span>
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(r)}
                    className="btn btn-secondary text-xs font-semibold"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Edit Mitra</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingReseller(r)}
                    className="btn text-xs font-semibold"
                    style={{ whiteSpace: 'nowrap', background: 'rgba(255, 69, 58, 0.12)', border: '1px solid rgba(255, 69, 58, 0.3)', color: '#FF453A' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reseller Pricing Rule Explanation Box */}
        <div className="glass-card p-6 border border-white/10 bg-neutral-900/60">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <span>Ketentuan Multi-Tier Pricing Reseller iConicstore</span>
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
            Sistem secara otomatis menerapkan harga grosir khusus (*Harga Reseller*) saat kasir beralih ke Mode Reseller. Reseller juga dapat memilih opsi cetak struk netral (tanpa kop toko) untuk kebutuhan *dropshipping* langsung ke tangan konsumen akhir mereka.
          </p>
        </div>

      </div>

      {/* MODAL: Tambah / Edit Mitra Reseller */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md p-6 bg-neutral-950">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white">
                {editingId ? 'Edit Data Mitra Reseller' : 'Daftarkan Mitra Reseller Baru'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReseller} className="space-y-4">
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Nama Pemilik / PIC:</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Nama Toko / Konter Rekanan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Gadget Point Surabaya"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="input-field text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">No. WhatsApp:</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">Kota / Domisili:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Surabaya"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">Tier Kemitraan:</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Silver Partner">Silver Partner (Pembelian 1-5 Unit)</option>
                  <option value="Gold Partner">Gold Partner (Pembelian 6-15 Unit)</option>
                  <option value="Platinum Partner">Platinum Partner (Pembelian 16+ Unit)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Simpan Perubahan' : 'Simpan Mitra'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Mitra Reseller */}
      {deletingReseller && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md p-6 bg-neutral-950">
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 69, 58, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF453A', flexShrink: 0 }}>
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hapus Mitra Reseller</h3>
                <span className="text-[11px] text-neutral-400">Konfirmasi penghapusan mitra</span>
              </div>
            </div>

            <p className="text-xs text-neutral-200 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus mitra <strong>{deletingReseller.shopName}</strong> ({deletingReseller.name})? Riwayat transaksi lama tetap tersimpan di laporan penjualan.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeletingReseller(null)}
                className="btn btn-secondary text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const deletedName = deletingReseller.shopName;
                  if (onDeleteReseller) onDeleteReseller(deletingReseller.id);
                  setDeletingReseller(null);
                  showToast(`Mitra "${deletedName}" berhasil dihapus.`, 'info', 'Mitra Dihapus');
                }}
                style={{ background: '#FF453A', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
