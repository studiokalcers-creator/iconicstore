import React, { useState, useRef, useEffect } from 'react';
import { 
  Barcode, 
  Camera, 
  Trash2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ArrowRight, 
  Check, 
  Lock, 
  Printer, 
  MessageCircle, 
  X, 
  AlertCircle, 
  RotateCcw, 
  Search, 
  Plus, 
  User, 
  Building2, 
  Tag, 
  ShieldCheck, 
  Percent,
  CheckCircle2,
  DollarSign,
  Clock,
  Receipt,
  Calendar,
  Package,
  ShoppingCart,
  Sparkles,
  Smartphone,
  RefreshCw,
  Upload,
  ImageIcon
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { formatRupiah, playBarcodeBeep } from '../utils/barcodePdfEngine';
import confetti from 'canvas-confetti';
import { showToast } from './AppleAlertToast';

export default function CloudPOS({ 
  units = [], 
  resellers = [], 
  onCompleteSale, 
  activeBranch = { id: 'b1', name: 'Cabang Surabaya Pusat' },
  posPrefill,
  onClearPosPrefill,
  storeSettings = {}
}) {
  // Pricing Mode: 'retail' | 'reseller'
  const [pricingMode, setPricingMode] = useState('retail');
  const [selectedResellerId, setSelectedResellerId] = useState('');
  
  // Mobile responsive layout tab: 'catalog' | 'cart'
  const [mobilePosTab, setMobilePosTab] = useState('catalog');

  // Cart state
  const [cart, setCart] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [activePreorder, setActivePreorder] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  
  // Real Camera Barcode Scanner State (html5-qrcode ZXing Engine & Native Photo Capture)
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraManualCode, setCameraManualCode] = useState('');
  const [cameraRetryCount, setCameraRetryCount] = useState(0);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const photoInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const availableUnitsRef = useRef([]);
  const html5QrCodeRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [supervisorAction, setSupervisorAction] = useState(null); // 'void' | 'discount'
  const [supervisorError, setSupervisorError] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('tunai'); // 'tunai' | 'qris' | 'edc' | 'transfer'
  const [cashGiven, setCashGiven] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isDropshipReceipt, setIsDropshipReceipt] = useState(false); // Struk polos tanpa logo toko
  
  // Completed receipt view
  const [completedTransaction, setCompletedTransaction] = useState(null);

  // Cashier shift state
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftStartingCash] = useState(500000);
  const [shiftPhysicalCash, setShiftPhysicalCash] = useState('');
  const [shiftReport, setShiftReport] = useState(null);
  const [sessionCashSales, setSessionCashSales] = useState(0);
  const [sessionNonCashSales, setSessionNonCashSales] = useState(0);
  const [sessionTxCount, setSessionTxCount] = useState(0);

  // Available stock in this branch
  const availableUnits = units.filter(u => u.status === 'available');
  availableUnitsRef.current = availableUnits;

  // Selected reseller
  const currentReseller = resellers.find(r => r.id === selectedResellerId);

  // Auto update cart prices when switching pricingMode
  useEffect(() => {
    if (cart.length > 0) {
      setCart(prevCart => 
        prevCart.map(item => ({
          ...item,
          appliedPrice: pricingMode === 'reseller' ? item.priceReseller : item.priceRetail
        }))
      );
    }
  }, [pricingMode]);

  // Handle cross-module prefill (from Storefront, Resellers, or Pre-Orders)
  useEffect(() => {
    if (!posPrefill) return;

    if (posPrefill.resellerId) {
      setPricingMode('reseller');
      setSelectedResellerId(posPrefill.resellerId);
    }

    if (posPrefill.unit) {
      addToCart(posPrefill.unit);
    }

    if (posPrefill.preorder) {
      const po = posPrefill.preorder;
      setActivePreorder(po);
      setCustomerName(po.customerName || '');
      setCustomerPhone(po.phone || '');

      // Cari unit fisik yang sesuai di inventaris yang masih available
      const cleanReq = (po.modelRequested || '').toLowerCase().trim();
      const matchedUnit = availableUnits.find(u => {
        const uName = (u.modelName || '').toLowerCase().trim();
        return uName === cleanReq || uName.includes(cleanReq) || cleanReq.includes(uName);
      });

      const appliedPrice = Number(po.estimatedTotal) || (matchedUnit ? (pricingMode === 'reseller' ? matchedUnit.priceReseller : matchedUnit.priceRetail) : 0);

      const cartItem = matchedUnit ? {
        ...matchedUnit,
        appliedPrice,
        isPreorderFulfillment: true,
        preorderId: po.id,
        preorderCustomer: po.customerName,
        preorderDp: Number(po.dpAmount || 0)
      } : {
        id: `po-${po.id}`,
        modelName: po.modelRequested,
        category: 'iphone',
        condition: 'Baru (Pre-Order Resmi)',
        grade: 'BNIB',
        batteryHealth: 100,
        imei: `PO-${po.id}`,
        serialNumber: `SN-PO-${po.id}`,
        signalOrigin: 'Resmi Indonesia (iBox/GDN)',
        signalWarranty: '12 Bulan Resmi Apple',
        storeWarranty: '12 Bulan Resmi Apple Indonesia',
        priceRetail: appliedPrice,
        priceReseller: appliedPrice,
        appliedPrice,
        isPreorderFulfillment: true,
        preorderId: po.id,
        preorderCustomer: po.customerName,
        preorderDp: Number(po.dpAmount || 0)
      };

      setCart([cartItem]);

      if (po.dpAmount > 0) {
        setDiscountAmount(Number(po.dpAmount));
      }

      showToast(`Pesanan ${po.modelRequested} (Pre-Order: ${po.customerName}) otomatis dimasukkan ke keranjang dengan potongan DP ${formatRupiah(po.dpAmount)}.`, 'success', 'Pelunasan Pre-Order');
    }

    if (posPrefill.unit || posPrefill.resellerId || posPrefill.preorder) {
      if (onClearPosPrefill) onClearPosPrefill();
    }
  }, [posPrefill, availableUnits]);

  // Add unit to cart
  const addToCart = (unit) => {
    if (cart.some(item => item.id === unit.id)) {
      showToast(`Unit ${unit.modelName} (IMEI: ${unit.imei}) sudah ada di keranjang kasir.`, 'warning', 'Sudah di Keranjang');
      return;
    }

    playBarcodeBeep();
    const appliedPrice = pricingMode === 'reseller' ? unit.priceReseller : unit.priceRetail;
    setCart(prev => [...prev, { ...unit, appliedPrice }]);
    setBarcodeInput('');
    showToast(`${unit.modelName} berhasil dimasukkan ke keranjang kasir.`, 'success', 'Scan Berhasil');
  };

  // Central Barcode Processor (supports Live Camera, Native Photo, and Manual Input)
  const processDecodedBarcode = (rawCode) => {
    const rawVal = String(rawCode || '').trim();
    if (!rawVal) return;
    const cleanVal = rawVal.toUpperCase();

    // Matching against unit barcodeCode, IMEI, serialNumber, or sub-matches for URL/prefix
    const matched = availableUnitsRef.current.find(u => {
      const barcode = String(u.barcodeCode || '').trim().toUpperCase();
      const imei = String(u.imei || '').trim().toUpperCase();
      const serial = String(u.serialNumber || '').trim().toUpperCase();
      const id = String(u.id || '').trim().toUpperCase();

      if (barcode && (cleanVal === barcode || cleanVal.endsWith(barcode) || cleanVal.includes(barcode))) return true;
      if (imei && (cleanVal === imei || cleanVal.includes(imei))) return true;
      if (serial && (cleanVal === serial || cleanVal.includes(serial))) return true;
      if (id && cleanVal === id) return true;
      return false;
    });

    if (matched) {
      try { playBarcodeBeep(); } catch (e) {}
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
      addToCart(matched);
      setIsCameraScannerOpen(false);
      showToast(`Unit ${matched.modelName} berhasil ditambahkan ke keranjang!`, 'success', 'Barcode Terdeteksi');
    } else {
      showToast(`Kode "${rawVal}" terdeteksi, namun tidak cocok dengan stok ready di cabang ini.`, 'info');
      setCameraError(`Kode "${rawVal}" terdeteksi, namun unit tidak ditemukan di stok ready cabang ${activeBranch?.name || ''}.`);
    }
  };

  // Native Photo / File Barcode Scanner (Layer 1: Native BarcodeDetector, Layer 2: Html5Qrcode ZXing)
  const handleFileScan = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    e.target.value = ''; // Reset for re-triggering

    setIsProcessingFile(true);
    setCameraError('');

    try {
      let decodedText = null;

      // Layer 1: Native BarcodeDetector API (Zero-dependency & instant on modern iOS/Android/Chrome)
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
          });
          const bitmap = await createImageBitmap(file);
          const detected = await detector.detect(bitmap);
          if (detected && detected.length > 0 && detected[0].rawValue) {
            decodedText = detected[0].rawValue;
          }
        } catch (detectorErr) {
          console.warn('Native BarcodeDetector pass failed, falling back to html5-qrcode:', detectorErr);
        }
      }

      // Layer 2: Robust ZXing File Scan via Html5Qrcode sandbox container
      if (!decodedText) {
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE
        ];

        let sandbox = document.getElementById('pos-barcode-file-sandbox');
        if (!sandbox) {
          sandbox = document.createElement('div');
          sandbox.id = 'pos-barcode-file-sandbox';
          sandbox.style.position = 'absolute';
          sandbox.style.left = '-9999px';
          sandbox.style.top = '-9999px';
          sandbox.style.width = '300px';
          sandbox.style.height = '300px';
          sandbox.style.visibility = 'hidden';
          document.body.appendChild(sandbox);
        }

        const fileScanner = new Html5Qrcode('pos-barcode-file-sandbox', {
          formatsToSupport,
          verbose: false
        });

        try {
          decodedText = await fileScanner.scanFile(file, false);
        } finally {
          try { await fileScanner.clear(); } catch (_) {}
        }
      }

      if (decodedText) {
        processDecodedBarcode(decodedText);
      } else {
        setCameraError('Barcode tidak terbaca pada foto tersebut. Pastikan foto tegak, jelas, dan barcode tampak penuh.');
      }
    } catch (err) {
      console.warn('File barcode scan error:', err);
      setCameraError('Barcode tidak terbaca pada foto tersebut. Pastikan foto tegak, tidak blur, dan barcode tampak penuh.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Live Camera Barcode Scanner via html5-qrcode (ZXing Engine supporting Code-128, Code-39, EAN, UPC, QR on iOS Safari)
  useEffect(() => {
    let isMounted = true;
    let scannerInstance = null;
    let videoObserver = null;

    if (isCameraScannerOpen) {
      setCameraError('');
      setIsCameraActive(false);

      const initScanner = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (isMounted) {
              setCameraError('Kamera tidak didukung pada browser ini atau dibuka di dalam in-app browser. Buka di Safari langsung.');
            }
            return;
          }

          const container = document.getElementById('pos-barcode-scanner-view');
          if (!container) return;

          // Ensure any video tag created inside has playsinline, muted, autoplay for iOS WebKit
          videoObserver = new MutationObserver(() => {
            const video = container.querySelector('video');
            if (video) {
              video.setAttribute('playsinline', 'true');
              video.setAttribute('webkit-playsinline', 'true');
              video.setAttribute('autoplay', 'true');
              video.setAttribute('muted', 'true');
              video.muted = true;
              video.playsInline = true;
              if (video.paused) {
                video.play().catch(() => {});
              }
            }
          });
          videoObserver.observe(container, { childList: true, subtree: true });

          const formatsToSupport = [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE
          ];

          const scanner = new Html5Qrcode('pos-barcode-scanner-view', {
            formatsToSupport,
            verbose: false
          });
          scannerInstance = scanner;
          html5QrCodeRef.current = scanner;

          // Optimized scanConfig with targeted qrbox to drastically reduce CPU load on mobile iOS
          const scanConfig = { 
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => ({
              width: Math.min(Math.floor(viewfinderWidth * 0.85), 260),
              height: Math.min(Math.floor(viewfinderHeight * 0.65), 140)
            })
          };

          const onScanSuccess = (decodedText) => {
            if (!isMounted) return;
            processDecodedBarcode(decodedText);
          };

          try {
            await scanner.start(
              { facingMode: 'environment' },
              scanConfig,
              onScanSuccess,
              () => {}
            );
          } catch (directErr) {
            console.warn('Direct facingMode environment failed, trying fallback camera ID...', directErr);
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
              const backCam = cameras.find(c => {
                const label = (c.label || '').toLowerCase();
                return label.includes('back') || label.includes('rear') || label.includes('belakang') || label.includes('environment');
              }) || cameras[0];
              await scanner.start(backCam.id, scanConfig, onScanSuccess, () => {});
            } else {
              throw directErr;
            }
          }

          if (isMounted) {
            setIsCameraActive(true);
          }
        } catch (err) {
          console.warn('Camera scanner error:', err);
          if (isMounted) {
            setIsCameraActive(false);
            const errStr = String(err?.message || err || '');
            if (errStr.includes('NotAllowedError') || errStr.includes('Permission') || errStr.includes('denied') || errStr.includes('Dismissed')) {
              setCameraError('Izin akses kamera belum diberikan atau diblokir Safari. Ikuti langkah di bawah untuk mengaktifkannya di iPhone Anda.');
            } else if (errStr.includes('NotFoundError') || errStr.includes('DevicesNotFoundError')) {
              setCameraError('Kamera belakang tidak ditemukan pada perangkat ini.');
            } else {
              setCameraError('Kamera belum dapat dibuka. Pastikan izin kamera aktif dan situs dibuka langsung di aplikasi Safari.');
            }
          }
        }
      };

      const timer = setTimeout(initScanner, 200);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (videoObserver) {
          try { videoObserver.disconnect(); } catch (e) {}
        }
        if (scannerInstance) {
          if (scannerInstance.isScanning) {
            scannerInstance.stop().then(() => scannerInstance.clear()).catch(() => {});
          } else {
            try { scannerInstance.clear(); } catch (e) {}
          }
        }
      };
    } else {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current.clear()).catch(() => {});
        } else {
          try { html5QrCodeRef.current.clear(); } catch (e) {}
        }
        html5QrCodeRef.current = null;
      }
      setIsCameraActive(false);
    }
  }, [isCameraScannerOpen, cameraRetryCount]);

  // Remove unit from cart
  const removeFromCart = (unitId) => {
    setCart(prev => {
      const remaining = prev.filter(item => item.id !== unitId);
      if (remaining.length === 0 && activePreorder) {
        setActivePreorder(null);
        setDiscountAmount(0);
      }
      return remaining;
    });
  };

  // Barcode Gun / Manual Input Enter
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const trimmed = barcodeInput.trim().toUpperCase();
    const found = availableUnits.find(u => 
      u.barcodeCode.toUpperCase() === trimmed || 
      u.imei === trimmed || 
      u.serialNumber.toUpperCase() === trimmed
    );

    if (found) {
      addToCart(found);
    } else {
      showToast(`Unit dengan Barcode / IMEI / SN "${barcodeInput}" tidak ditemukan atau sudah terjual.`, 'error', 'Unit Tidak Ditemukan');
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.appliedPrice, 0);
  const total = Math.max(0, subtotal - Number(discountAmount || 0));
  const changeAmount = Number(cashGiven || 0) - total;

  // Anti-fraud PIN check (Supervisor Authorization)
  const handleSupervisorVerify = (e) => {
    e.preventDefault();
    const validSpvPin = storeSettings?.supervisorPin || storeSettings?.cashierDefaultPin || '1234';
    if (String(supervisorPin).trim() === String(validSpvPin).trim()) {
      if (supervisorAction === 'void') {
        setCart([]);
        setDiscountAmount(0);
        setActivePreorder(null);
      } else if (supervisorAction === 'discount') {
        // Authorized high discount
      }
      setIsSupervisorModalOpen(false);
      setSupervisorPin('');
      setSupervisorError('');
    } else {
      setSupervisorError('PIN Supervisor tidak valid. Akses ditolak.');
    }
  };

  const handleVoidCart = () => {
    if (cart.length === 0) return;
    setSupervisorAction('void');
    setIsSupervisorModalOpen(true);
  };

  // Complete sale
  const handleProcessCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'tunai' && Number(cashGiven) < total) {
      showToast('Nominal uang tunai yang diterima kurang dari total tagihan transaksi.', 'error', 'Pembayaran Kurang');
      return;
    }

    const transactionData = {
      id: `TRX-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleString('id-ID'),
      branchName: activeBranch.name,
      pricingMode,
      reseller: currentReseller || null,
      preorderId: activePreorder?.id || null,
      preorderDp: activePreorder ? Number(activePreorder.dpAmount || 0) : 0,
      customerName: customerName || (pricingMode === 'reseller' ? currentReseller?.name : 'Pelanggan Umum'),
      customerPhone: customerPhone || currentReseller?.phone || '-',
      items: [...cart],
      subtotal,
      discountAmount: Number(discountAmount || 0),
      total,
      paymentMethod,
      cashGiven: Number(cashGiven || 0),
      changeAmount: Math.max(0, changeAmount),
      isDropshipReceipt,
      cashierName: 'Kasir Store #1'
    };

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    // Record shift sales
    if (paymentMethod === 'tunai') {
      setSessionCashSales(prev => prev + total);
    } else {
      setSessionNonCashSales(prev => prev + total);
    }
    setSessionTxCount(prev => prev + 1);

    setCompletedTransaction(transactionData);
    if (onCompleteSale) onCompleteSale(transactionData);
    setCart([]);
    setDiscountAmount(0);
    setActivePreorder(null);
    setCashGiven('');
    setIsCheckoutOpen(false);
  };

  const handleSendWhatsAppReceipt = () => {
    if (!completedTransaction) return;
    const itemsList = completedTransaction.items.map(i => 
      `- ${i.modelName} [IMEI: ${i.imei}]\n  Kondisi: ${i.condition} | Garansi: ${i.storeWarranty}\n  Harga: ${formatRupiah(i.appliedPrice)}`
    ).join('\n\n');

    const msg = encodeURIComponent(
      `*BUKTI PEMBAYARAN RESMI iConicstore*\n` +
      `No. Nota: ${completedTransaction.id}\n` +
      `Tanggal: ${completedTransaction.date}\n` +
      `Kasir: ${completedTransaction.cashierName}\n` +
      `Pelanggan: ${completedTransaction.customerName}\n` +
      `Tipe: ${completedTransaction.preorderId ? `Pelunasan Pre-Order (${completedTransaction.preorderId})` : (completedTransaction.pricingMode === 'reseller' ? 'Harga Khusus Reseller' : 'Retail Umum')}\n\n` +
      `*RINCIAN PERANGKAT APPLE:*\n${itemsList}\n\n` +
      `Subtotal: ${formatRupiah(completedTransaction.subtotal)}\n` +
      (completedTransaction.preorderId ? `Potongan Titip DP (${completedTransaction.preorderId}): -${formatRupiah(completedTransaction.discountAmount)}\n` : '') +
      (completedTransaction.discountAmount > 0 && !completedTransaction.preorderId ? `Diskon Toko: -${formatRupiah(completedTransaction.discountAmount)}\n` : '') +
      `*${completedTransaction.preorderId ? 'Sisa Pelunasan Dibayar' : 'Total Bayar'}: ${formatRupiah(completedTransaction.total)}*\n` +
      `Metode: ${completedTransaction.paymentMethod.toUpperCase()}\n\n` +
      `*STATUS KARTU GARANSI DIGITAL:*\n` +
      `Garansi Toko Aktif s/d 1 Bulan ke depan.\n` +
      `Harap simpan nomor IMEI ini sebagai bukti klaim garansi yang sah.\n\n` +
      `Terima kasih telah berbelanja di iConicstore.`
    );
    window.open(`https://wa.me/62${completedTransaction.customerPhone.replace(/^0/, '')}?text=${msg}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '60px' }}>
      
      <div className="responsive-container">

        {/* Top Control Bar: Mode Penjualan & Shift Status */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          
          {/* Left: Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)' }}>
              Mode Penjualan:
            </span>
            
            <button
              type="button"
              onClick={() => {
                setPricingMode('retail');
                setSelectedResellerId('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                background: pricingMode === 'retail' ? 'var(--accent)' : 'var(--surface-2)',
                color: pricingMode === 'retail' ? 'var(--accent-ink)' : 'var(--text-dim)',
                border: pricingMode === 'retail' ? '1px solid var(--accent)' : '1px solid var(--border)',
                transition: 'all .15s ease'
              }}
            >
              <User style={{ width: '14px', height: '14px' }} />
              <span>Mode Retail (End-User)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPricingMode('reseller');
                if (resellers.length > 0 && !selectedResellerId) {
                  setSelectedResellerId(resellers[0].id);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                background: pricingMode === 'reseller' ? '#9333EA' : 'var(--surface-2)',
                color: pricingMode === 'reseller' ? '#FFFFFF' : 'var(--text-dim)',
                border: pricingMode === 'reseller' ? '1px solid #9333EA' : '1px solid var(--border)',
                transition: 'all .15s ease'
              }}
            >
              <Building2 style={{ width: '14px', height: '14px' }} />
              <span>Mode Reseller (Grosir)</span>
            </button>

            {pricingMode === 'reseller' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(147, 51, 234, 0.12)',
                border: '1px solid rgba(147, 51, 234, 0.35)',
                borderRadius: '8px',
                padding: '4px 10px'
              }}>
                <span style={{ fontSize: '11px', color: '#C084FC', fontWeight: '600' }}>Pilih Mitra:</span>
                <select
                  value={selectedResellerId}
                  onChange={(e) => setSelectedResellerId(e.target.value)}
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid rgba(147, 51, 234, 0.4)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >
                  {resellers.map(r => (
                    <option key={r.id} value={r.id} style={{ background: '#15171B', color: '#F4F5F6' }}>
                      {r.name} — {r.shopName} ({r.tier})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Shift info & Button */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text-dim)' }}>
            <button
              type="button"
              onClick={() => setIsShiftModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Clock style={{ width: '13px', height: '13px', color: 'var(--accent)' }} />
              <span>Shift Kasir &amp; Z-Report</span>
            </button>
            <span style={{ color: 'var(--border)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#30D158', display: 'inline-block' }}></span>
              <span style={{ color: 'var(--text)', fontWeight: '600' }}>Rian (Kasir #1)</span>
            </div>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span>{activeBranch.name}</span>
          </div>

        </div>

        {/* Mobile Segmented Switcher (<900px only on iPhone/iPad) */}
        <div className="pos-mobile-tabs">
          <button
            type="button"
            onClick={() => setMobilePosTab('catalog')}
            className={`pos-mobile-tab-btn ${mobilePosTab === 'catalog' ? 'active' : ''}`}
          >
            <Package style={{ width: '15px', height: '15px' }} />
            <span>Scan &amp; Katalog ({availableUnits.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobilePosTab('cart')}
            className={`pos-mobile-tab-btn ${mobilePosTab === 'cart' ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <ShoppingCart style={{ width: '15px', height: '15px' }} />
            <span>Keranjang Kasir ({cart.length})</span>
            {cart.length > 0 && (
              <span style={{
                background: '#0A84FF',
                color: '#FFFFFF',
                borderRadius: '999px',
                padding: '1px 6px',
                fontSize: '10px',
                fontWeight: '800'
              }}>
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Main 2-Column POS Layout */}
        <div className="pos-layout-grid">
          
          {/* LEFT COLUMN: Barcode Scanner & Ready Stock Catalog */}
          <div className={`pos-column-catalog ${mobilePosTab === 'cart' ? 'pos-hidden-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Barcode Scanner Box */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <form onSubmit={handleBarcodeSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
                  <Barcode style={{
                    width: '18px',
                    height: '18px',
                    color: 'var(--text-dim)',
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }} />
                  <input
                    type="text"
                    placeholder="Scan barcode stiker unit Apple / ketik IMEI / SN..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      borderRadius: '8px',
                      padding: '11px 12px 11px 40px',
                      letterSpacing: '0.5px'
                    }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="submit"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      padding: '0 16px',
                      height: '42px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Input
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraScannerOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(10, 132, 255, 0.15)',
                      border: '1px solid rgba(10, 132, 255, 0.3)',
                      color: 'var(--accent)',
                      padding: '0 14px',
                      height: '42px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    title="Buka Kamera iPad/iPhone untuk Scan Barcode"
                  >
                    <Camera style={{ width: '15px', height: '15px' }} />
                    <span>Kamera iOS</span>
                  </button>
                </div>
              </form>

              {/* Quick Barcode Test Chips for iPhone Testing */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles style={{ width: '13px', height: '13px', color: 'var(--accent)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text)', fontWeight: '700' }}>
                      ⚡ Tap Barcode untuk Uji Coba Cepat di HP:
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    {availableUnits.length} Unit Ready
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: '4px',
                  scrollbarWidth: 'none'
                }}>
                  {availableUnits.slice(0, 10).map(u => {
                    const inCart = cart.some(c => c.id === u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        disabled={inCart}
                        onClick={() => addToCart(u)}
                        style={{
                          flexShrink: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: inCart ? 'rgba(255,255,255,0.03)' : 'var(--surface-2)',
                          border: inCart ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(10, 132, 255, 0.4)',
                          color: inCart ? 'var(--text-dim)' : 'var(--text)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          cursor: inCart ? 'not-allowed' : 'pointer',
                          opacity: inCart ? 0.45 : 1,
                          transition: 'all .15s ease'
                        }}
                        title={`Tap untuk scan barcode ${u.barcodeCode}`}
                      >
                        <Barcode style={{ width: '13px', height: '13px', color: inCart ? 'var(--text-dim)' : 'var(--accent)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: inCart ? 'inherit' : 'var(--accent)' }}>
                          {u.barcodeCode}
                        </span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>
                          ({u.modelName.replace('Apple ', '').replace('iPhone ', 'iP ')})
                        </span>
                        {inCart && <Check style={{ width: '11px', height: '11px', color: '#30D158' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ready Stock Catalog Cards */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>
                      Unit Ready Stock di Toko
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      background: 'var(--surface-2)',
                      color: 'var(--accent)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      border: '1px solid var(--border)'
                    }}>
                      {availableUnits.length} Unit
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                    Sentuh kartu unit untuk memasukkan ke keranjang kasir
                  </span>
                </div>
              </div>

              {/* Grid of Product Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: '12px',
                maxHeight: '560px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {availableUnits.map(unit => {
                  const inCart = cart.some(c => c.id === unit.id);
                  const displayPrice = pricingMode === 'reseller' ? unit.priceReseller : unit.priceRetail;
                  const isBNIB = unit.condition && unit.condition.includes('Baru');

                  return (
                    <div
                      key={unit.id}
                      onClick={() => !inCart && addToCart(unit)}
                      style={{
                        background: inCart ? 'rgba(255,255,255,0.02)' : 'var(--surface-2)',
                        border: inCart ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        opacity: inCart ? 0.45 : 1,
                        cursor: inCart ? 'not-allowed' : 'pointer',
                        transition: 'border-color .15s ease, background .15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 7px',
                            borderRadius: '999px',
                            background: isBNIB ? '#10241A' : '#0B1F33',
                            color: isBNIB ? '#4ADE80' : '#60A5FA',
                            border: `1px solid ${isBNIB ? 'rgba(74, 222, 128, 0.2)' : 'rgba(96, 165, 250, 0.2)'}`
                          }}>
                            {isBNIB ? 'BNIB' : unit.grade}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
                            {unit.barcodeCode}
                          </span>
                        </div>

                        <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text)', lineHeight: '1.4', marginBottom: '4px' }}>
                          {unit.modelName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                          {unit.color} • IMEI: ...{unit.imei ? unit.imei.slice(-6) : '-'}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                            {unit.signalOrigin && unit.signalOrigin.includes('iBox') ? 'Resmi iBox' : 'All Operator'}
                          </span>
                          <span style={{ fontSize: '10px', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px', color: '#30D158' }}>
                            {unit.storeWarranty}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>
                            {pricingMode === 'reseller' ? 'Hrg Reseller:' : 'Hrg Retail:'}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
                            {formatRupiah(displayPrice)}
                          </span>
                        </div>

                        <span style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '999px',
                          background: inCart ? 'var(--surface)' : 'var(--accent)',
                          color: inCart ? 'var(--text-dim)' : 'var(--accent-ink)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700'
                        }}>
                          {inCart ? <Check style={{ width: '14px', height: '14px' }} /> : <Plus style={{ width: '14px', height: '14px' }} />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Active Cart & Register Summary */}
          <div 
            className={`pos-column-cart ${mobilePosTab === 'catalog' ? 'pos-hidden-mobile' : ''}`}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px',
              position: 'sticky',
              top: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Mobile Switch Back Button */}
            <button
              type="button"
              onClick={() => {
                setMobilePosTab('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '4px'
              }}
            >
              <ArrowRight style={{ width: '14px', height: '14px', transform: 'rotate(180deg)' }} />
              <span>← Tambah Unit / Scan Barcode Lain</span>
            </button>
            
            {/* Cart Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>
                  Keranjang Kasir
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                  {pricingMode === 'reseller' ? 'Harga Khusus Reseller Aktif' : 'Harga Penjualan Retail'}
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleVoidCart}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(255, 69, 58, 0.1)',
                    border: '1px solid rgba(255, 69, 58, 0.25)',
                    color: '#FF453A',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  title="Batalkan keranjang (Perlu PIN Supervisor)"
                >
                  <Trash2 style={{ width: '12px', height: '12px' }} />
                  <span>Void</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 16px',
                border: '1px dashed var(--border)',
                borderRadius: '12px',
                color: 'var(--text-dim)',
                margin: '8px 0'
              }}>
                <Barcode style={{ width: '36px', height: '36px', margin: '0 auto 8px', opacity: 0.35 }} />
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Keranjang masih kosong</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Scan barcode stiker unit atau sentuh kartu unit di samping
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '4px',
                margin: '4px 0'
              }}>
                {cart.map(item => (
                  <div 
                    key={item.id}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.modelName}
                        </div>
                        {item.preorderId && (
                          <span style={{ fontSize: '9px', background: 'rgba(255, 159, 10, 0.15)', color: '#FF9F0A', border: '1px solid rgba(255, 159, 10, 0.3)', padding: '1px 5px', borderRadius: '4px', fontWeight: '700', flexShrink: 0 }}>
                            PO: {item.preorderId}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: '2px' }}>
                        IMEI: {item.imei} • {item.condition}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '9px', background: 'var(--surface)', padding: '1px 5px', borderRadius: '3px', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                          {item.signalOrigin && item.signalOrigin.includes('iBox') ? 'iBox' : 'All Op'}
                        </span>
                        <span style={{ fontSize: '10px', color: '#30D158' }}>
                          Garansi: {item.storeWarranty}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)', display: 'block' }}>
                        {formatRupiah(item.appliedPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Hapus unit dari keranjang"
                      >
                        <X style={{ width: '14px', height: '14px', color: '#FF453A' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations & Totals */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                <span>Subtotal ({cart.length} Unit):</span>
                <span style={{ color: 'var(--text)', fontWeight: '600' }}>{formatRupiah(subtotal)}</span>
              </div>

              {/* Rincian Potongan DP jika Pelunasan Pre-Order */}
              {activePreorder && (
                <div style={{
                  background: 'rgba(255, 159, 10, 0.08)',
                  border: '1px solid rgba(255, 159, 10, 0.25)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#FF9F0A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar style={{ width: '12px', height: '12px' }} />
                      <span>Potongan DP ({activePreorder.id}):</span>
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#30D158' }}>
                      - {formatRupiah(activePreorder.dpAmount)}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    Pemesan: <strong style={{ color: 'var(--text)' }}>{activePreorder.customerName}</strong> ({activePreorder.phone})
                  </div>
                </div>
              )}

              {/* Discount with Supervisor PIN Threshold (jika bukan pre-order) */}
              {!activePreorder && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Percent style={{ width: '12px', height: '12px' }} />
                    <span>Diskon Toko:</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Rp</span>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > 100000) {
                          setSupervisorAction('discount');
                          setIsSupervisorModalOpen(true);
                        }
                        setDiscountAmount(val);
                      }}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        textAlign: 'right',
                        fontSize: '12px',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        width: '100px',
                        fontFamily: 'var(--font-mono)'
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Final Total Display */}
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                  {activePreorder ? 'Sisa Pelunasan:' : 'Total Tagihan:'}
                </span>
                <span style={{ fontSize: '22px', fontWeight: '800', color: activePreorder ? '#FF9F0A' : 'var(--text)' }}>
                  {formatRupiah(total)}
                </span>
              </div>

            </div>

            {/* Primary Action Button: Checkout */}
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              style={{
                width: '100%',
                background: cart.length === 0 ? 'var(--surface-2)' : 'var(--accent)',
                color: cart.length === 0 ? 'var(--text-dim)' : 'var(--accent-ink)',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                opacity: cart.length === 0 ? 0.5 : 1,
                boxShadow: cart.length === 0 ? 'none' : '0 4px 14px rgba(10, 132, 255, 0.3)',
                transition: 'all .15s ease'
              }}
            >
              <span>Bayar &amp; Proses Struk</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>

          </div>

        </div>

        {/* Floating Bottom Cart Bar for Mobile (Visible when in catalog tab with items) */}
        {cart.length > 0 && mobilePosTab === 'catalog' && (
          <div 
            className="pos-floating-cart-bar"
            onClick={() => {
              setMobilePosTab('cart');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart style={{ width: '18px', height: '18px' }} />
              <span>{cart.length} Unit ({formatRupiah(total)})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#061423', color: '#FFFFFF', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
              <span>Buka Kasir</span>
              <ArrowRight style={{ width: '13px', height: '13px' }} />
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Kamera Barcode Scanner iOS Real WebRTC */}
      {isCameraScannerOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Pemindai Barcode Kamera iOS</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCameraScannerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Viewfinder Video Frame with html5-qrcode container */}
            <div style={{
              width: '100%',
              aspectRatio: '4/3',
              background: '#050507',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--border)',
              marginBottom: '14px'
            }}>
              <div 
                id="pos-barcode-scanner-view" 
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%'
                }}
              />

              {/* Laser Scan Guide Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 10
              }}>
                <div style={{
                  width: '230px',
                  height: '115px',
                  border: '2px solid rgba(10, 132, 255, 0.9)',
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(10, 132, 255, 0.4)'
                }}>
                  <div className="barcode-laser-line" />
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '12px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: isCameraActive ? '#30D158' : '#FF9F0A',
                    boxShadow: isCameraActive ? '0 0 8px #30D158' : 'none'
                  }} />
                  <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: '600', letterSpacing: '0.2px' }}>
                    {isCameraActive ? 'Arahkan kamera ke barcode / serial' : 'Memuat sensor kamera iOS...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hidden Native File & Camera Inputs for iOS/Android */}
            <input 
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileScan}
              style={{ display: 'none' }}
            />
            <input 
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileScan}
              style={{ display: 'none' }}
            />

            {/* Dual Action: Ambil Foto Barcode (Native Apple Camera) & Pilih dari Galeri */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => photoInputRef.current && photoInputRef.current.click()}
                disabled={isProcessingFile}
                style={{
                  background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.22) 0%, rgba(10, 132, 255, 0.12) 100%)',
                  border: '1px solid rgba(10, 132, 255, 0.45)',
                  color: 'var(--accent)',
                  padding: '11px 8px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: isProcessingFile ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                {isProcessingFile ? (
                  <>
                    <RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} />
                    <span>Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <Camera style={{ width: '15px', height: '15px' }} />
                    <span>Ambil Foto Barcode</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current && galleryInputRef.current.click()}
                disabled={isProcessingFile}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '11px 8px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: isProcessingFile ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Upload style={{ width: '15px', height: '15px', color: 'var(--text-dim)' }} />
                <span>Pilih dari Galeri</span>
              </button>
            </div>

            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-dim)', 
              textAlign: 'center', 
              marginBottom: '14px',
              lineHeight: '1.4'
            }}>
              Gunakan <strong>Ambil Foto Barcode</strong> jika barcode di layar monitor silau atau sulit autofokus.
            </div>

            {cameraError && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{
                  background: 'rgba(255, 69, 58, 0.1)',
                  border: '1px solid rgba(255, 69, 58, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '10px',
                  fontSize: '12px',
                  color: '#FF6961',
                  lineHeight: '1.4'
                }}>
                  {cameraError}
                </div>

                {/* Retry Button */}
                <button
                  type="button"
                  onClick={() => {
                    setCameraError('');
                    setCameraRetryCount(c => c + 1);
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}
                >
                  <RefreshCw style={{ width: '14px', height: '14px' }} />
                  <span>Coba Buka Kamera Lagi</span>
                </button>

                {/* iPhone Safari Step-by-Step Guide */}
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', fontSize: '11.5px', lineHeight: '1.5', color: 'var(--text-dim)' }}>
                  <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '6px' }}>Panduan Mengaktifkan Kamera di Safari iOS:</strong>
                  <ol style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Tekan ikon <strong>aA</strong> (atau gembok) di sebelah kiri bilah URL Safari.</li>
                    <li>Pilih menu <strong>Pengaturan Situs Web (Website Settings)</strong>.</li>
                    <li>Pada baris <strong>Kamera (Camera)</strong>, ubah menjadi <strong>Izinkan (Allow)</strong>.</li>
                    <li><em>Jika membuka dari WhatsApp/IG:</em> Tekan tombol bagikan di pojok bawah lalu pilih <strong>Buka di Safari</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Manual Code Input inside Camera Modal */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!cameraManualCode.trim()) return;
              processDecodedBarcode(cameraManualCode);
              setCameraManualCode('');
            }} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input 
                type="text" 
                placeholder="Atau ketik/paste kode barcode..." 
                value={cameraManualCode} 
                onChange={(e) => setCameraManualCode(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '8px',
                  padding: '9px 12px'
                }}
              />
              <button 
                type="submit" 
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  border: 'none',
                  padding: '0 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Scan
              </button>
            </form>

            {/* Quick Tap Unit Barcode Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>
                Simulasi Scan Barcode (Tap untuk Uji Coba):
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                {availableUnits.slice(0, 5).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      addToCart(u);
                      setIsCameraScannerOpen(false);
                    }}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '500' }}>{u.modelName}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)', fontWeight: '700' }}>{u.barcodeCode}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsCameraScannerOpen(false)}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Tutup Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Supervisor Anti-Fraud PIN Modal */}
      {isSupervisorModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '380px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '999px',
              background: 'rgba(255, 69, 58, 0.1)',
              border: '1px solid rgba(255, 69, 58, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FF453A',
              margin: '0 auto 12px'
            }}>
              <Lock style={{ width: '20px', height: '20px' }} />
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700' }}>Otorisasi Supervisor</h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
              {supervisorAction === 'void' 
                ? 'Pembatalan (Void) keranjang kasir memerlukan verifikasi PIN Supervisor Toko.'
                : 'Diskon bernilai tinggi memerlukan otorisasi PIN Supervisor.'}
            </p>

            <form onSubmit={handleSupervisorVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <input
                  type="password"
                  placeholder="Masukkan PIN Otorisasi"
                  value={supervisorPin}
                  onChange={(e) => setSupervisorPin(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '4px',
                    padding: '12px',
                    borderRadius: '8px'
                  }}
                  maxLength={6}
                  autoFocus
                />
                {supervisorError && (
                  <p style={{ fontSize: '11px', color: '#FF453A', margin: '6px 0 0' }}>{supervisorError}</p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSupervisorModalOpen(false);
                    setSupervisorPin('');
                    setSupervisorError('');
                  }}
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'var(--accent)',
                    border: 'none',
                    color: 'var(--accent-ink)',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Checkout & Pembayaran Kasir */}
      {isCheckoutOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                  {activePreorder ? 'Pelunasan Pre-Order' : 'Pembayaran Kasir'}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                  {activePreorder ? `Sisa Pelunasan: ${formatRupiah(total)}` : `Total Tagihan: ${formatRupiah(total)}`}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Banner Khusus Pre-Order DP */}
            {activePreorder && (
              <div style={{
                background: 'rgba(255, 159, 10, 0.08)',
                border: '1px solid rgba(255, 159, 10, 0.25)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', color: '#FF9F0A' }}>
                  <span>Pelunasan Pre-Order #{activePreorder.id}</span>
                  <span style={{ color: '#30D158' }}>DP Terbayar: -{formatRupiah(activePreorder.dpAmount)}</span>
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: '3px' }}>
                  Perangkat: <strong style={{ color: 'var(--text)' }}>{activePreorder.modelRequested}</strong>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                  Nama Pembeli:
                </label>
                <input
                  type="text"
                  placeholder="Nama Pembeli"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    padding: '9px 12px',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                  No. WhatsApp (E-Receipt):
                </label>
                <input
                  type="text"
                  placeholder="0812xxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    padding: '9px 12px',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>

            {/* Payment Methods Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '8px' }}>
                Pilih Metode Pembayaran:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'tunai', label: 'Tunai', icon: Banknote },
                  { id: 'qris', label: 'QRIS', icon: QrCode },
                  { id: 'edc', label: 'EDC / Kartu', icon: CreditCard },
                  { id: 'transfer', label: 'Transfer BCA', icon: DollarSign }
                ].map(m => {
                  const Icon = m.icon;
                  const isSel = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: isSel ? 'var(--accent)' : 'var(--surface-2)',
                        color: isSel ? 'var(--accent-ink)' : 'var(--text)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all .15s ease'
                      }}
                    >
                      <Icon style={{ width: '16px', height: '16px' }} />
                      <span style={{ fontSize: '11px', fontWeight: isSel ? '700' : '500' }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Given Input if Tunai */}
            {paymentMethod === 'tunai' && (
              <div style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                    Nominal Uang Tunai Diterima:
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 15000000"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: '16px',
                      fontWeight: '700',
                      fontFamily: 'var(--font-mono)',
                      padding: '10px 12px',
                      borderRadius: '8px'
                    }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '4px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Kembalian:</span>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: '800',
                    color: changeAmount < 0 ? '#FF453A' : '#30D158'
                  }}>
                    {changeAmount < 0 ? 'Uang Belum Cukup' : formatRupiah(changeAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS Display */}
            {paymentMethod === 'qris' && (
              <div style={{
                textAlign: 'center',
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '16px',
                color: '#000000',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <div style={{
                  width: '160px',
                  height: '160px',
                  background: '#F9FAFB',
                  borderRadius: '10px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden'
                }}>
                  {storeSettings?.qrisImage ? (
                    <img 
                      src={storeSettings.qrisImage} 
                      alt="QRIS Toko" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  ) : (
                    <QrCode style={{ width: '130px', height: '130px', color: '#000000' }} />
                  )}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', marginTop: '10px', color: '#111827' }}>
                  {storeSettings?.qrisMerchantName || 'iConicstore Official'}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  NMID: {storeSettings?.qrisNmid || 'ID1029384918273'}
                </div>
                <div style={{ fontSize: '12px', color: '#059669', fontWeight: '800', marginTop: '4px' }}>
                  Total Tagihan: {formatRupiah(total)}
                </div>
              </div>
            )}

            {/* Reseller Dropship Struk Option */}
            <div style={{
              background: 'var(--surface-2)',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block' }}>
                  Mode Struk Dropship (Polosan)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Cetak tanpa nama toko untuk pembeli akhir mitra reseller
                </span>
              </div>
              <input
                type="checkbox"
                checked={isDropshipReceipt}
                onChange={(e) => setIsDropshipReceipt(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#9333EA' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '11px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleProcessCheckout}
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  color: 'var(--accent-ink)',
                  padding: '11px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Check style={{ width: '16px', height: '16px' }} />
                <span>Selesaikan Transaksi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Sukses Transaksi & Cetak Struk */}
      {completedTransaction && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '999px',
                background: 'rgba(48, 209, 88, 0.12)',
                border: '1px solid rgba(48, 209, 88, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#30D158',
                margin: '0 auto 10px'
              }}>
                <CheckCircle2 style={{ width: '24px', height: '24px' }} />
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700' }}>Transaksi Berhasil</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>
                Stok unit fisik otomatis terpotong dari gudang &amp; website.
              </p>
            </div>

            {/* Struk Thermal Preview Container */}
            <div 
              id="thermal-print-area"
              style={{
                background: '#FFFFFF',
                color: '#000000',
                padding: '16px',
                borderRadius: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                lineHeight: '1.5',
                border: '1px solid #D1D5DB',
                marginBottom: '16px',
                maxHeight: '280px',
                overflowY: 'auto'
              }}
            >
              {!completedTransaction.isDropshipReceipt ? (
                <div style={{ textAlign: 'center', borderBottom: '1px solid #000000', paddingBottom: '8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '800', fontSize: '13px', letterSpacing: '1px' }}>iConicstore</div>
                  <div style={{ fontSize: '10px' }}>Apple Reseller &amp; Service Center</div>
                  <div style={{ fontSize: '9px', color: '#4B5563' }}>{completedTransaction.branchName}</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', borderBottom: '1px solid #000000', paddingBottom: '8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '800', fontSize: '12px', letterSpacing: '1px' }}>BUKTI PEMBELIAN PERANGKAT</div>
                  <div style={{ fontSize: '9px', color: '#4B5563' }}>Authorized Distribution Receipt</div>
                </div>
              )}

              <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Nota: {completedTransaction.id}</span>
                  <span>{completedTransaction.date}</span>
                </div>
                <div>Kasir: {completedTransaction.cashierName}</div>
                <div>Customer: {completedTransaction.customerName}</div>
              </div>

              <div style={{ borderTop: '1px dashed #000000', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {completedTransaction.items.map(it => (
                  <div key={it.id} style={{ fontSize: '10px' }}>
                    <div style={{ fontWeight: '700' }}>{it.modelName}</div>
                    <div style={{ color: '#4B5563' }}>IMEI: {it.imei} ({it.condition})</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Garansi: {it.storeWarranty}</span>
                      <span style={{ fontWeight: '700' }}>{formatRupiah(it.appliedPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #000000', marginTop: '8px', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                {completedTransaction.preorderId && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal Unit:</span>
                      <span>{formatRupiah((completedTransaction.total || 0) + (completedTransaction.discountAmount || 0))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#111827' }}>
                      <span>Potongan DP ({completedTransaction.preorderId}):</span>
                      <span>- {formatRupiah(completedTransaction.discountAmount || 0)}</span>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                  <span>{completedTransaction.preorderId ? 'SISA PELUNASAN:' : 'TOTAL:'}</span>
                  <span>{formatRupiah(completedTransaction.total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Bayar ({completedTransaction.paymentMethod}):</span>
                  <span>{formatRupiah(completedTransaction.cashGiven || completedTransaction.total)}</span>
                </div>
                {completedTransaction.changeAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Kembali:</span>
                    <span>{formatRupiah(completedTransaction.changeAmount)}</span>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', fontSize: '9px', borderTop: '1px dashed #000000', marginTop: '10px', paddingTop: '8px', color: '#4B5563' }}>
                Simpan nota &amp; nomor IMEI untuk klaim garansi toko.<br />
                Terima kasih atas kunjungan Anda.
              </div>
            </div>

            {/* Actions for receipt */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  width: '100%',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '11px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Printer style={{ width: '15px', height: '15px' }} />
                <span>Cetak Struk Thermal (58/80mm)</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsAppReceipt}
                style={{
                  width: '100%',
                  background: '#25D366',
                  border: 'none',
                  color: '#061423',
                  padding: '11px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <MessageCircle style={{ width: '15px', height: '15px' }} />
                <span>Kirim E-Receipt ke WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setCompletedTransaction(null)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  padding: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Selesai &amp; Transaksi Baru
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 5: Manajemen Shift Kasir & Z-Report */}
      {isShiftModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock style={{ width: '15px', height: '15px', color: 'var(--accent)' }} />
                  <span>Manajemen Shift Kasir &amp; Rekonsiliasi Kas</span>
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                  Shift Siang (Kasir: Rian) • {activeBranch.name}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIsShiftModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {!shiftReport ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Summary Table */}
                <div style={{
                  background: 'var(--surface-2)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                    <span>Modal Kas Awal Laci (Cash Float):</span>
                    <span style={{ color: 'var(--text)', fontWeight: '700' }}>{formatRupiah(shiftStartingCash)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                    <span>Penjualan Tunai Shift Ini:</span>
                    <span style={{ color: '#30D158', fontWeight: '700' }}>+{formatRupiah(sessionCashSales)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                    <span>Penjualan Non-Tunai (QRIS/EDC/Trf):</span>
                    <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{formatRupiah(sessionNonCashSales)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                    <span>Total Transaksi Selesai:</span>
                    <span style={{ color: 'var(--text)', fontWeight: '600' }}>{sessionTxCount} Transaksi</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text)' }}>Total Uang Fisik Seharusnya di Laci:</span>
                    <span style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text)' }}>
                      {formatRupiah(shiftStartingCash + sessionCashSales)}
                    </span>
                  </div>
                </div>

                {/* Physical Cash Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text)', fontWeight: '600', marginBottom: '6px' }}>
                    Hitung Uang Tunai Fisik Aktual di Laci (Closing Kasir):
                  </label>
                  <input
                    type="number"
                    placeholder="Masukkan jumlah uang fisik di laci kasir..."
                    value={shiftPhysicalCash}
                    onChange={(e) => setShiftPhysicalCash(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: '700',
                      padding: '10px 12px',
                      borderRadius: '8px'
                    }}
                  />
                  {shiftPhysicalCash && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Selisih Kas Laci:</span>
                      <span style={{
                        fontWeight: '700',
                        color: Number(shiftPhysicalCash) - (shiftStartingCash + sessionCashSales) === 0
                          ? '#30D158'
                          : Number(shiftPhysicalCash) - (shiftStartingCash + sessionCashSales) > 0
                          ? 'var(--accent)'
                          : '#FF453A'
                      }}>
                        {Number(shiftPhysicalCash) - (shiftStartingCash + sessionCashSales) === 0
                          ? 'Seimbang (Tepat Rp 0)'
                          : formatRupiah(Number(shiftPhysicalCash) - (shiftStartingCash + sessionCashSales))}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setIsShiftModalOpen(false)}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const expected = shiftStartingCash + sessionCashSales;
                      const actual = Number(shiftPhysicalCash || expected);
                      const diff = actual - expected;
                      setShiftReport({
                        date: new Date().toLocaleString('id-ID'),
                        cashier: 'Rian (Kasir Store #1)',
                        startingCash: shiftStartingCash,
                        cashSales: sessionCashSales,
                        nonCashSales: sessionNonCashSales,
                        totalExpected: expected,
                        actualCash: actual,
                        diff,
                        txCount: sessionTxCount
                      });
                    }}
                    style={{
                      background: 'var(--accent)',
                      border: 'none',
                      color: 'var(--accent-ink)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Receipt style={{ width: '14px', height: '14px' }} />
                    <span>Tutup Shift &amp; Cetak Z-Report</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Z-Report Thermal Preview */}
                <div style={{
                  background: '#FFFFFF',
                  color: '#000000',
                  padding: '16px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10.5px',
                  lineHeight: '1.5',
                  border: '1px solid #D1D5DB',
                  marginBottom: '16px',
                  maxHeight: '280px',
                  overflowY: 'auto'
                }}>
                  <div style={{ textAlign: 'center', borderBottom: '1px solid #000000', paddingBottom: '6px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '12px', letterSpacing: '1px' }}>iConicstore CLOSING REPORT</div>
                    <div style={{ fontSize: '9px' }}>Laporan Tutup Shift (Z-Report)</div>
                    <div style={{ fontSize: '8px', color: '#4B5563' }}>{activeBranch.name}</div>
                  </div>

                  <div style={{ fontSize: '9px', marginBottom: '8px' }}>
                    <div>Waktu Cetak: {shiftReport.date}</div>
                    <div>Kasir Bertugas: {shiftReport.cashier}</div>
                    <div>Total Transaksi: {shiftReport.txCount} Transaksi</div>
                  </div>

                  <div style={{ borderTop: '1px dashed #000000', padding: '6px 0', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Modal Awal Kas:</span>
                      <span>{formatRupiah(shiftReport.startingCash)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Penjualan Tunai:</span>
                      <span>+{formatRupiah(shiftReport.cashSales)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Penjualan QRIS/EDC/Trf:</span>
                      <span>{formatRupiah(shiftReport.nonCashSales)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', borderTop: '1px solid #000000', paddingTop: '4px' }}>
                      <span>Uang Seharusnya:</span>
                      <span>{formatRupiah(shiftReport.totalExpected)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Uang Fisik Kasir:</span>
                      <span>{formatRupiah(shiftReport.actualCash)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                      <span>Selisih:</span>
                      <span>{formatRupiah(shiftReport.diff)}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '8px', borderTop: '1px dashed #000000', marginTop: '10px', paddingTop: '6px', color: '#4B5563' }}>
                    Laporan ini sah dan otomatis terarsip ke server iConicstore.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Printer style={{ width: '14px', height: '14px' }} />
                    <span>Cetak Z-Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShiftReport(null);
                      setIsShiftModalOpen(false);
                    }}
                    style={{
                      background: 'var(--accent)',
                      border: 'none',
                      color: 'var(--accent-ink)',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
