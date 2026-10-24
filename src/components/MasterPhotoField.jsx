import React, { useRef } from 'react';
import { Upload, RotateCcw, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { getApplePresetPhoto } from '../data/mockData';
import { showToast } from './AppleAlertToast';

// Kompres gambar agar muat di localStorage (maks sisi 800px, JPEG 0.82)
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 800;
        const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

/**
 * Field foto produk untuk Master Produk.
 * value: string URL / data URL (boleh kosong)
 * onChange(imageUrl, isCustom)
 */
export default function MasterPhotoField({ value, onChange, name, category }) {
  const fileRef = useRef(null);
  const presetPhoto = getApplePresetPhoto(name || category);
  const preview = value || presetPhoto;
  const isCustom = !!value && value !== presetPhoto;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Mohon pilih file gambar yang valid (JPG, PNG, atau WebP).', 'error', 'Format Tidak Didukung');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('Ukuran file maksimal 8MB.', 'warning', 'Ukuran File Terlalu Besar');
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl, true);
      showToast('Foto produk berhasil dipilih. Klik Simpan untuk menerapkan.', 'success', 'Foto Dipilih');
    } catch {
      showToast('Gagal membaca file gambar. Coba file lain.', 'error', 'Gagal Memuat Foto');
    }
  };

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
        <ImageIcon style={{ width: '12px', height: '12px', color: 'var(--accent)' }} />
        <span>Foto Produk ({isCustom ? 'Foto Kustom' : 'Foto Resmi Apple Otomatis'}):</span>
      </label>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
        <div style={{ width: '84px', height: '84px', flexShrink: 0, borderRadius: '10px', background: '#0E1013', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img
            src={preview}
            alt={name || 'Foto produk'}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
            onError={(e) => { e.currentTarget.src = presetPhoto; }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          <input ref={fileRef} type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFile} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn btn-secondary text-xs"
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Upload style={{ width: '12px', height: '12px' }} />
              <span>Unggah Foto</span>
            </button>
            {isCustom && (
              <button
                type="button"
                onClick={() => onChange(presetPhoto, false)}
                className="btn btn-secondary text-xs"
                title="Kembalikan ke foto resmi Apple"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw style={{ width: '12px', height: '12px' }} />
                <span>Reset</span>
              </button>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <LinkIcon style={{ width: '12px', height: '12px', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="atau tempel URL gambar (https://...)"
              value={value && value.startsWith('data:') ? '' : (value || '')}
              onChange={(e) => onChange(e.target.value.trim(), !!e.target.value.trim())}
              className="input-field"
              style={{ paddingLeft: '28px', fontSize: '12px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
