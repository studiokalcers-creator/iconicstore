import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, 
  Printer, 
  FileDown, 
  Plus, 
  Search, 
  CheckSquare, 
  Square, 
  Filter, 
  QrCode, 
  Layers, 
  Smartphone, 
  Sparkles, 
  Tag, 
  Check, 
  ExternalLink,
  SlidersHorizontal,
  X,
  Upload,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { 
  formatRupiah, 
  generateBarcodeDataUrl, 
  generateQrDataUrl,
  exportThermalRollPdf, 
  exportA4GridStickerPdf 
} from '../utils/barcodePdfEngine';
import { getApplePresetPhoto } from '../data/mockData';
import { showToast } from './AppleAlertToast';

export default function BarcodeGenerator({ 
  units, 
  categories = [],
  onAddUnit, 
  activeBranch 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [isNewUnitModalOpen, setIsNewUnitModalOpen] = useState(false);
  const [previewUnit, setPreviewUnit] = useState(null);
  const [previewQrUrl, setPreviewQrUrl] = useState('');
  const [labelFormat, setLabelFormat] = useState('thermal'); // 'thermal' | 'a4'

  // Generate QR Code data URL whenever previewUnit is opened
  useEffect(() => {
    let isMounted = true;
    if (previewUnit) {
      generateQrDataUrl(previewUnit.barcodeCode || previewUnit.imei || previewUnit.id)
        .then(url => {
          if (isMounted) setPreviewQrUrl(url);
        });
    } else {
      setPreviewQrUrl('');
    }
    return () => { isMounted = false; };
  }, [previewUnit]);

  // Form state for new unit
  const [newCategory, setNewCategory] = useState(categories[0]?.id || 'iphone');
  const [newModel, setNewModel] = useState('iPhone 15 Pro');
  const [newStorage, setNewStorage] = useState('128GB');
  const [newColor, setNewColor] = useState('Natural Titanium');
  const [newCondition, setNewCondition] = useState('Second Like New');
  const [newGrade, setNewGrade] = useState('Grade A+');
  const [newBh, setNewBh] = useState(92);
  const [newImei, setNewImei] = useState('');
  const [newSignalOrigin, setNewSignalOrigin] = useState('Resmi Indonesia (iBox)');
  const [newSignalWarranty, setNewSignalWarranty] = useState('Permanen Seumur Hidup');
  const [newStoreWarranty, setNewStoreWarranty] = useState('1 Bulan Tukar Unit Toko');
  const [newPriceModal, setNewPriceModal] = useState(13000000);
  const [newPriceRetail, setNewPriceRetail] = useState(15499000);
  const [newPriceReseller, setNewPriceReseller] = useState(14700000);
  const [newImage, setNewImage] = useState('');
  const photoFileInputRef = useRef(null);

  const handlePhotoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Mohon pilih file gambar yang valid (JPG, PNG, atau WebP).', 'error', 'Format Tidak Didukung');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast('Ukuran file maksimal 4MB agar performa sistem tetap ringan dan responsif.', 'warning', 'Ukuran File Terlalu Besar');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentCategoryMeta = categories.find(c => c.id === newCategory) || {
    id: newCategory,
    name: newCategory,
    isSerialized: true,
    hasBattery: true
  };

  // Filtered units
  const filteredUnits = units.filter(u => {
    if (selectedCatFilter !== 'all' && u.category !== selectedCatFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.modelName && u.modelName.toLowerCase().includes(q)) ||
      (u.imei && u.imei.toLowerCase().includes(q)) ||
      (u.barcodeCode && u.barcodeCode.toLowerCase().includes(q)) ||
      (u.color && u.color.toLowerCase().includes(q))
    );
  });

  // Select / Deselect all
  const handleToggleSelectAll = () => {
    if (selectedUnitIds.length === filteredUnits.length) {
      setSelectedUnitIds([]);
    } else {
      setSelectedUnitIds(filteredUnits.map(u => u.id));
    }
  };

  const handleToggleSelectUnit = (id) => {
    setSelectedUnitIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Print Action
  const handleBulkPrint = async (format) => {
    const selected = units.filter(u => selectedUnitIds.includes(u.id));
    if (selected.length === 0) {
      showToast('Pilih minimal satu unit melalui checkbox terlebih dahulu.', 'warning', 'Pilih Unit');
      return;
    }

    if (format === 'thermal') {
      await exportThermalRollPdf(selected, 50, 30);
    } else {
      await exportA4GridStickerPdf(selected, 3, 8);
    }
  };

  // Add Unit Form Submit
  const handleCreateUnit = (e) => {
    e.preventDefault();
    const isSerialized = currentCategoryMeta.isSerialized !== false;
    const imeiVal = newImei.trim() || (isSerialized ? '' : `SKU-${Date.now().toString().slice(-6)}`);
    if (isSerialized && (!imeiVal || imeiVal.length < 8)) {
      showToast('Nomor IMEI fisik untuk perangkat ini wajib diisi minimal 8 digit.', 'error', 'Validasi IMEI');
      return;
    }

    const shortCode = imeiVal.slice(-5);
    const barcodeCode = `BC-${newModel.replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${shortCode}`;

    const activePhoto = (newImage && newImage.trim()) || getApplePresetPhoto(newModel || newCategory);

    const createdUnit = {
      id: `unit-${Date.now().toString().slice(-6)}`,
      masterId: `m-${Date.now().toString().slice(-4)}`,
      modelName: newStorage && newStorage !== '-' ? `${newModel} ${newStorage}` : newModel,
      color: newColor,
      storage: newStorage,
      category: newCategory,
      condition: newCondition,
      grade: newGrade,
      batteryHealth: currentCategoryMeta.hasBattery !== false ? Number(newBh || 100) : null,
      imei: imeiVal,
      serialNumber: `SN${imeiVal.slice(-8)}`,
      signalOrigin: isSerialized ? newSignalOrigin : 'Resmi Distributor',
      signalWarranty: isSerialized ? newSignalWarranty : '-',
      storeWarranty: newStoreWarranty,
      priceModal: Number(newPriceModal),
      priceRetail: Number(newPriceRetail),
      priceReseller: Number(newPriceReseller),
      barcodeCode: barcodeCode,
      status: 'available',
      branchId: activeBranch.id,
      image: activePhoto,
      imageCustom: !!(newImage && newImage.trim())
    };

    onAddUnit(createdUnit);
    setPreviewUnit(createdUnit);
    setIsNewUnitModalOpen(false);
    setNewImei('');
    setNewImage('');
    showToast(`Unit ${createdUnit.modelName} (Barcode: ${barcodeCode}) berhasil ditambahkan ke inventaris.`, 'success', 'Unit Berhasil Ditambahkan');
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-4 sm:p-6 lg:p-8">
      
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="badge badge-neutral mb-1">Gudang & Barcode Center</span>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Barcode className="w-6 h-6 text-blue-400" />
            <span>Generator Barcode & Serialized IMEI</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            1 Unit Apple = 1 IMEI Unik. Generate barcode otomatis & export PDF label stiker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewUnitModalOpen(true)}
            className="btn btn-primary text-xs font-bold shadow-md shadow-white/10"
          >
            <Plus className="w-4 h-4" />
            <span>Input Unit Baru (QC)</span>
          </button>
        </div>
      </div>

      {/* Main Container: Full Width Inventory Table (No horizontal scrollbar, expansive space) */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Full-Width Inventory Table Card */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
          
          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            
            {/* Search & Category Filter */}
            <div className="flex flex-1 items-center gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari IMEI, Model, atau Barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9 text-xs font-mono"
                />
              </div>

              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="input-field text-xs"
                style={{ width: '160px', flexShrink: 0 }}
              >
                <option value="all">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Bulk Export PDF Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkPrint('thermal')}
                disabled={selectedUnitIds.length === 0}
                className="btn btn-secondary btn-sm disabled:opacity-40"
                title="Cetak format gulungan thermal continuous"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>PDF Thermal ({selectedUnitIds.length})</span>
              </button>

              <button
                onClick={() => handleBulkPrint('a4')}
                disabled={selectedUnitIds.length === 0}
                className="btn btn-secondary btn-sm disabled:opacity-40"
                title="Cetak format lembaran stiker A4 multi-kolom (Tom & Jerry)"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>PDF A4 Grid ({selectedUnitIds.length})</span>
              </button>
            </div>

          </div>

          {/* Full Width Table without Any Horizontal Scrollbar */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead className="bg-neutral-950 border-b border-white/10 text-neutral-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th style={{ width: '40px', padding: '14px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button 
                      type="button"
                      onClick={handleToggleSelectAll} 
                      className="flex items-center justify-center mx-auto"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                      title="Pilih Semua"
                    >
                      {selectedUnitIds.length === filteredUnits.length && filteredUnits.length > 0 ? (
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '5px',
                          backgroundColor: '#0A84FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(10, 132, 255, 0.4)'
                        }}>
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} style={{ width: '13px', height: '13px', color: '#FFFFFF' }} />
                        </div>
                      ) : selectedUnitIds.length > 0 ? (
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '5px',
                          backgroundColor: 'rgba(10, 132, 255, 0.2)',
                          border: '1.5px solid #0A84FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{ width: '8px', height: '2px', backgroundColor: '#0A84FF', borderRadius: '1px' }} />
                        </div>
                      ) : (
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '5px',
                          border: '1.5px solid rgba(255, 255, 255, 0.25)',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)'
                        }} />
                      )}
                    </button>
                  </th>
                  <th style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>Model & Spesifikasi</th>
                  <th style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>No. IMEI & Barcode</th>
                  <th style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>Kondisi / BH</th>
                  <th style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>Harga Retail</th>
                  <th style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>Harga Reseller</th>
                  <th style={{ width: '90px', padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-200">
                {filteredUnits.map(unit => {
                  const isChecked = selectedUnitIds.includes(unit.id);
                  const isPreview = previewUnit?.id === unit.id;

                  return (
                    <tr 
                      key={unit.id}
                      className={`hover:bg-white/5 transition-colors ${
                        isPreview ? 'bg-blue-950/20 border-l-2 border-l-blue-400' : ''
                      }`}
                    >
                      <td style={{ width: '40px', padding: '14px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button 
                          type="button"
                          onClick={() => handleToggleSelectUnit(unit.id)} 
                          className="flex items-center justify-center mx-auto"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                          title={isChecked ? 'Batal Pilih' : 'Pilih Unit'}
                        >
                          {isChecked ? (
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '5px',
                              backgroundColor: '#0A84FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 3px rgba(10, 132, 255, 0.4)'
                            }}>
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} style={{ width: '13px', height: '13px', color: '#FFFFFF' }} />
                            </div>
                          ) : (
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '5px',
                              border: '1.5px solid rgba(255, 255, 255, 0.25)',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)'
                            }} />
                          )}
                        </button>
                      </td>

                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img 
                              src={unit.image || getApplePresetPhoto(unit.modelName || unit.category)} 
                              alt="" 
                              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} 
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#FFFFFF', whiteSpace: 'nowrap' }}>{unit.modelName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                              {unit.color} • {unit.signalOrigin && unit.signalOrigin.includes('iBox') ? 'Resmi iBox' : 'Inter'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        <div style={{ color: '#E5E7EB', fontWeight: '700', whiteSpace: 'nowrap' }}>{unit.imei}</div>
                        <div style={{ color: 'var(--accent)', whiteSpace: 'nowrap' }}>{unit.barcodeCode}</div>
                      </td>

                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                          <span 
                            className={`badge ${unit.condition.includes('Baru') ? 'badge-blue' : 'badge-amber'}`} 
                            style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                          >
                            {unit.condition.includes('Baru') ? 'BNIB' : unit.grade}
                          </span>
                          {unit.batteryHealth && (
                            <span style={{ fontSize: '11px', color: '#D1D5DB', fontFamily: 'var(--font-mono)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                              BH: {unit.batteryHealth}%
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#FFFFFF', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                        {formatRupiah(unit.priceRetail)}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#C084FC', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                        {formatRupiah(unit.priceReseller)}
                      </td>

                      <td style={{ width: '90px', padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => setPreviewUnit(unit)}
                          className="btn btn-sm btn-primary"
                          style={{ whiteSpace: 'nowrap' }}
                          title="Lihat Pratinjau Label Stiker"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* MODAL: Pratinjau Label Stiker QR Code (Muncul saat tombol Preview diklik) */}
      {previewUnit && (
        <div className="modal-backdrop" onClick={() => setPreviewUnit(null)}>
          <div className="modal-content max-w-md p-6 bg-neutral-950" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Pratinjau Label Stiker QR Code</h3>
                <span className="badge badge-neutral text-[10px]">50x30mm</span>
                <span className="badge badge-blue text-[10px]" style={{ color: '#60A5FA', borderColor: 'rgba(96, 165, 250, 0.3)' }}>Tanpa Harga</span>
              </div>
              <button 
                onClick={() => setPreviewUnit(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Physical Sticker Simulation Box (50x30mm thermal label replica matching PDF 100%) */}
            <div 
              className="bg-white text-black rounded-lg border border-neutral-300 shadow-md font-sans select-none my-3 mx-auto"
              style={{ 
                width: '100%', 
                maxWidth: '420px', 
                padding: '10px 12px',
                boxSizing: 'border-box'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: '800', fontSize: '13px', color: '#000000', letterSpacing: '-0.02em' }}>
                  iConicstore
                </span>
                <span style={{ fontSize: '12px', color: '#334155', fontWeight: '700', letterSpacing: '-0.01em' }}>
                  {previewUnit.signalOrigin.includes('iBox') ? 'Resmi iBox' : 
                   previewUnit.signalOrigin.includes('Bea Cukai') ? 'Bea Cukai' : 'All Operator'}
                </span>
              </div>

              {/* Horizontal Divider Line matching PDF */}
              <div style={{ height: '1px', backgroundColor: '#D1D5DB', width: '100%', marginBottom: '8px' }} />

              {/* Side-by-side QR Code and Metadata */}
              <div className="flex items-stretch" style={{ gap: '12px' }}>
                {/* Left: QR Code & Code */}
                <div className="flex flex-col items-center justify-between shrink-0" style={{ width: '115px' }}>
                  <div style={{ width: '95px', height: '95px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {previewQrUrl ? (
                      <img
                        src={previewQrUrl}
                        alt="QR Code"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ fontSize: '10px', color: '#9CA3AF' }}>Loading QR...</div>
                    )}
                  </div>
                  <div style={{ 
                    fontFamily: 'var(--font-mono, monospace)', 
                    fontSize: '9.5px', 
                    fontWeight: '700', 
                    color: '#000000', 
                    whiteSpace: 'nowrap', 
                    marginTop: '4px',
                    textAlign: 'center',
                    letterSpacing: '0.02em'
                  }}>
                    {previewUnit.barcodeCode}
                  </div>
                </div>

                {/* Vertical Divider Line matching PDF */}
                <div style={{ width: '1px', backgroundColor: '#D1D5DB', flexShrink: 0 }} />

                {/* Right: Device Details (Without Price, Matching PDF Layout) */}
                <div className="flex-1 flex flex-col justify-between min-w-0" style={{ paddingLeft: '2px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#000000', lineHeight: '1.2' }} className="truncate">
                      {previewUnit.modelName}
                    </div>
                    {previewUnit.color && (
                      <div style={{ fontSize: '10px', color: '#4B5563', lineHeight: '1.2' }}>
                        {previewUnit.color}
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: '700', fontSize: '10px', color: '#111827', lineHeight: '1.2', marginTop: '1px' }}>
                      IMEI: {previewUnit.imei}
                    </div>
                    <div style={{ fontSize: '10px', color: '#374151', lineHeight: '1.2' }}>
                      {previewUnit.condition} (BH: {previewUnit.batteryHealth || 100}%)
                    </div>
                    <div style={{ fontSize: '10px', color: '#4B5563', lineHeight: '1.2' }} className="truncate">
                      Garansi: {previewUnit.storeWarranty}
                    </div>
                  </div>

                  {/* Scan CTA Callout (NO PHONE EMOJI - 100% Consistent with PDF) */}
                  <div style={{ 
                    backgroundColor: '#EFF6FF', 
                    border: '1px solid #DBEAFE', 
                    borderRadius: '6px', 
                    padding: '5px 8px', 
                    textAlign: 'center', 
                    marginTop: '8px' 
                  }}>
                    <span style={{ 
                      color: '#1D4ED8', 
                      fontWeight: '700', 
                      fontSize: '10px', 
                      whiteSpace: 'nowrap', 
                      display: 'block' 
                    }}>
                      Scan QR untuk Info & Harga
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => exportThermalRollPdf([previewUnit], 50, 30)}
                className="btn btn-primary w-full text-xs font-bold"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download PDF Label QR Thermal (50x30mm)</span>
              </button>

              <button
                onClick={() => exportA4GridStickerPdf([previewUnit], 3, 8)}
                className="btn btn-secondary w-full text-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Download Format Lembar A4 (Grid QR)</span>
              </button>
            </div>

            {/* End Modal Content */}
          </div>
        </div>
      )}

      {/* MODAL: Input Unit Baru (QC Inbound) */}
      {isNewUnitModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-xl p-6 bg-neutral-950">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Input Unit Apple Masuk (QC Gudang)</h3>
                <span className="text-xs text-neutral-400">Barcode & identitas IMEI akan ter-generate otomatis</span>
              </div>
              <button 
                onClick={() => setIsNewUnitModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-4">
              
              {/* Pilihan Kategori */}
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1 font-medium">Kategori Produk:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-field text-xs font-semibold"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.isSerialized ? 'IMEI / Serial' : 'Non-IMEI / SKU'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-medium">Model / Nama Produk:</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="input-field text-xs"
                    placeholder="Contoh: iPhone 15 Pro, MagSafe Charger, Case"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-medium">Kapasitas Penyimpanan:</label>
                  <select
                    value={newStorage}
                    onChange={(e) => setNewStorage(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="-">- (Aksesoris / Tanpa Storage)</option>
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-medium">Varian Warna:</label>
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="input-field text-xs"
                    placeholder="Contoh: Natural Titanium, White, Clear"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-medium">
                    {currentCategoryMeta.isSerialized ? 'Nomor IMEI Fisik (15 Digit):' : 'Nomor Seri / Barcode / SKU:'}
                  </label>
                  <input
                    type="text"
                    value={newImei}
                    onChange={(e) => setNewImei(e.target.value)}
                    className="input-field text-xs font-mono"
                    placeholder={currentCategoryMeta.isSerialized ? "358742110982341" : "Opsional (auto SKU jika kosong)"}
                    required={currentCategoryMeta.isSerialized}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-medium">Kondisi Unit:</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="Baru Segel (BNIB)">Baru Segel (BNIB)</option>
                    <option value="Second Like New">Second Like New</option>
                    <option value="Second Mulus Normal">Second Mulus Normal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-medium">Grade Fisik:</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="BNIB">BNIB Segel</option>
                    <option value="Grade A+">Grade A+ (Like New)</option>
                    <option value="Grade A">Grade A (Mulus)</option>
                    <option value="Grade B">Grade B (Lecet Halus)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-medium">
                    {currentCategoryMeta.hasBattery ? 'Battery Health (%):' : 'Status Daya / Baterai:'}
                  </label>
                  {currentCategoryMeta.hasBattery ? (
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={newBh}
                      onChange={(e) => setNewBh(e.target.value)}
                      className="input-field text-xs font-mono"
                      required
                    />
                  ) : (
                    <div className="input-field text-xs text-neutral-400 bg-neutral-900 cursor-not-allowed flex items-center">
                      Non-Baterai (Aksesoris)
                    </div>
                  )}
                </div>
              </div>

              {/* Signal & Warranty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-medium">Asal Sinyal IMEI:</label>
                  <select
                    value={newSignalOrigin}
                    onChange={(e) => setNewSignalOrigin(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="Resmi Indonesia (iBox/GDN)">Resmi Indonesia (iBox/GDN)</option>
                    <option value="Inter Bea Cukai Resmi">Inter Bea Cukai Resmi</option>
                    <option value="Inter All Operator">Inter All Operator</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1 font-medium">Masa Garansi Toko:</label>
                  <select
                    value={newStoreWarranty}
                    onChange={(e) => setNewStoreWarranty(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="1 Bulan Tukar Unit Toko">1 Bulan Tukar Unit Toko</option>
                    <option value="3 Bulan Tukar Unit Toko">3 Bulan Tukar Unit Toko</option>
                    <option value="12 Bulan Resmi Apple">12 Bulan Resmi Apple</option>
                  </select>
                </div>
              </div>

              {/* Foto Produk Ready Stock (Tampil di Pricelist & Web Toko) */}
              <div className="bg-neutral-900/90 p-3.5 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-200 font-bold block uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Foto Produk Ready Stock (Pricelist & Web)</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {newImage ? 'Foto Kustom Terpilih' : 'Foto Resmi Apple Otomatis'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Photo Preview Container */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '10px',
                    background: '#1F242D',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={newImage || getApplePresetPhoto(newModel || newCategory)}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                    />
                  </div>

                  {/* Upload Controls & Actions */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={photoFileInputRef}
                        onChange={handlePhotoFileUpload}
                        accept="image/png, image/jpeg, image/webp"
                        hidden
                      />
                      <button
                        type="button"
                        onClick={() => photoFileInputRef.current?.click()}
                        className="btn btn-secondary btn-sm text-[11px] flex items-center gap-1.5"
                      >
                        <Upload className="w-3 h-3 text-blue-400" />
                        <span>Upload File Foto (Galeri/Kamera)</span>
                      </button>

                      {newImage && (
                        <button
                          type="button"
                          onClick={() => setNewImage('')}
                          className="btn btn-secondary btn-sm text-[10px] text-rose-400 hover:text-rose-300"
                          title="Kembalikan ke foto preset Apple resmi"
                        >
                          <X className="w-3 h-3" />
                          <span>Reset ke Preset Apple</span>
                        </button>
                      )}
                    </div>

                    {/* Direct Image URL input */}
                    <div className="relative">
                      <input
                        type="url"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="Atau paste link URL gambar produk di sini..."
                        className="input-field text-[11px] py-1.5 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Apple Preset Suggestions */}
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-1.5 font-medium">Pilihan Cepat Foto Resmi Apple:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'iPhone 16 Pro', model: 'iPhone 16 Pro Max' },
                      { label: 'iPhone 15 Pro', model: 'iPhone 15 Pro' },
                      { label: 'iPhone 14 Pro', model: 'iPhone 14 Pro' },
                      { label: 'iPhone 13', model: 'iPhone 13' },
                      { label: 'iPad', model: 'iPad Air' },
                      { label: 'MacBook', model: 'MacBook Air' },
                      { label: 'Apple Watch', model: 'Apple Watch Series 10' },
                      { label: 'AirPods', model: 'AirPods Pro Gen 2' }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewImage(getApplePresetPhoto(preset.model))}
                        className="px-2 py-1 rounded-md text-[10px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-white/5 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Tiers: Modal, Retail, Reseller */}
              <div className="bg-neutral-900 p-3.5 rounded-xl border border-white/5 space-y-3">
                <span className="text-[11px] text-neutral-300 font-bold block uppercase tracking-wider whitespace-nowrap">
                  Pengaturan 3 Level Harga (Multi-Tier Pricing)
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-300 block mb-1 font-medium whitespace-nowrap">
                      Harga Modal (HPP):
                    </label>
                    <input
                      type="number"
                      value={newPriceModal}
                      onChange={(e) => setNewPriceModal(e.target.value)}
                      className="input-field text-xs font-mono text-neutral-200"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-300 block mb-1 font-medium whitespace-nowrap">
                      Harga Retail:
                    </label>
                    <input
                      type="number"
                      value={newPriceRetail}
                      onChange={(e) => setNewPriceRetail(e.target.value)}
                      className="input-field text-xs font-mono font-bold text-white"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-300 block mb-1 font-medium whitespace-nowrap">
                      Harga Reseller:
                    </label>
                    <input
                      type="number"
                      value={newPriceReseller}
                      onChange={(e) => setNewPriceReseller(e.target.value)}
                      className="input-field text-xs font-mono font-bold text-purple-400"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewUnitModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn btn-primary text-xs font-bold"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Generate Barcode</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
