import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Store, 
  Calendar, 
  Filter, 
  Download, 
  Printer, 
  Search, 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Plus, 
  User, 
  Building2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  X,
  MessageCircle,
  HelpCircle,
  Lock,
  Edit2,
  Trash2,
  Barcode,
  Check,
  Settings,
  KeyRound,
  Save,
  RotateCcw,
  EyeOff,
  Shield,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Smartphone,
  LayoutGrid,
  List,
  Users,
  Award,
  Activity,
  Receipt,
  PieChart,
  Boxes,
  FileSpreadsheet,
  CheckSquare,
  Square,
  CheckCheck,
  Truck,
  UserCheck,
  Database,
  Send,
  HardDrive,
  Phone,
  ShieldAlert,
  Cloud,
  Link2,
  Globe,
  Copy,
  ExternalLink
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { INITIAL_STORE_SETTINGS, INITIAL_TRADE_IN_VALUATIONS, getApplePresetPhoto, DEFAULT_CATEGORY_CARDS } from '../data/mockData';
import { showToast } from './AppleAlertToast';
import MasterPhotoField from './MasterPhotoField';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  syncLocalToSupabase 
} from '../lib/supabase';
import { SUPABASE_SCHEMA_SQL } from '../data/supabaseSchemaSql';

export default function OwnerPortal({ 
  salesHistory = [], 
  units = [], 
  resellers = [], 
  branches = [],
  shiftReports = [],
  masterProducts = [],
  storeSettings = {},
  categories = [],
  tradeInValuations = {},
  preorders = [],
  onUpdateTradeInValuations,
  onLockOwnerPortal,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onUpdateStoreSettings,
  onAddMasterProduct,
  onUpdateMasterProduct,
  onDeleteMasterProduct,
  onAddUnit,
  onNavigateToInventory
}) {
  // Navigation inside Owner Portal: 'analytics' | 'reports' | 'history' | 'shifts' | 'outlets' | 'products' | 'aging'
  const [activeTab, setActiveTab] = useState('analytics');

  // Filter states
  const [dateFilter, setDateFilter] = useState('all'); // 'today' | '7days' | 'month' | 'all'
  const [branchFilter, setBranchFilter] = useState('all'); // 'all' | 'b1' | 'b2'
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedShiftDetail, setSelectedShiftDetail] = useState(null);

  // New Master Product Form State
  const [isAddMasterModalOpen, setIsAddMasterModalOpen] = useState(false);
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterImage, setNewMasterImage] = useState('');
  const [newMasterImageCustom, setNewMasterImageCustom] = useState(false);
  const [newMasterCat, setNewMasterCat] = useState('iphone');
  const [newMasterRetail, setNewMasterRetail] = useState('');
  const [newMasterReseller, setNewMasterReseller] = useState('');
  const [newMasterHpp, setNewMasterHpp] = useState('');
  const [newMasterMinStock, setNewMasterMinStock] = useState('2');

  // Edit & Delete Master Product State
  const [editingMaster, setEditingMaster] = useState(null);
  const [deletingMaster, setDeletingMaster] = useState(null);
  const [masterCategoryFilter, setMasterCategoryFilter] = useState('all');
  const [masterSearchQuery, setMasterSearchQuery] = useState('');

  // Branch (Cabang) Management State
  const [branchForm, setBranchForm] = useState(null);
  const [deletingBranch, setDeletingBranch] = useState(null);

  // Themed Confirmation Modal States (Zero native browser popups)
  const [isResetOpnameConfirmOpen, setIsResetOpnameConfirmOpen] = useState(false);
  const [deletingTradeInModel, setDeletingTradeInModel] = useState(null);
  const [isResetTradeInConfirmOpen, setIsResetTradeInConfirmOpen] = useState(false);

  // Quick Add Stock State
  const [quickAddStockMaster, setQuickAddStockMaster] = useState(null);
  const [quickStorage, setQuickStorage] = useState('128GB');
  const [quickColor, setQuickColor] = useState('Natural Titanium');
  const [quickImei, setQuickImei] = useState('');
  const [quickCondition, setQuickCondition] = useState('Second Like New');
  const [quickGrade, setQuickGrade] = useState('Grade A+');
  const [quickBh, setQuickBh] = useState(94);
  const [quickBranchId, setQuickBranchId] = useState(branches[0]?.id || 'b1');

  // Category Management State
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deletingCat, setDeletingCat] = useState(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');
  const [catFormIsSerialized, setCatFormIsSerialized] = useState(true);
  const [catFormHasBattery, setCatFormHasBattery] = useState(true);
  const [searchCatQuery, setSearchCatQuery] = useState('');
  // Settings & PIN Management State
  const activeOwnerPin = storeSettings?.ownerPin || '9999';
  const activeCashierPin = storeSettings?.cashierDefaultPin || '1234';

  const [currentOwnerPinInput, setCurrentOwnerPinInput] = useState('');
  const [newOwnerPinInput, setNewOwnerPinInput] = useState('');
  const [confirmOwnerPinInput, setConfirmOwnerPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);

  const [cashierPinInput, setCashierPinInput] = useState(activeCashierPin);
  const [cashierPinSuccess, setCashierPinSuccess] = useState('');
  const [cashierPinError, setCashierPinError] = useState('');

  const [storeNameInput, setStoreNameInput] = useState(storeSettings?.storeName || 'iConicstore Indonesia');
  const [warrantyStoreInput, setWarrantyStoreInput] = useState(storeSettings?.defaultStoreWarranty || '1 Bulan Tukar Unit Toko');
  const [warrantySignalInput, setWarrantySignalInput] = useState(storeSettings?.defaultSignalWarranty || 'Permanen Seumur Hidup (All Operator & Bea Cukai)');
  const [lowStockInput, setLowStockInput] = useState(storeSettings?.lowStockThreshold || 2);
  const [agingDaysInput, setAgingDaysInput] = useState(storeSettings?.agingStockThresholdDays || 14);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Logo & Branding State
  const [storeLogoPreview, setStoreLogoPreview] = useState(storeSettings?.storeLogo || null);
  const [storeTaglineInput, setStoreTaglineInput] = useState(storeSettings?.storeTagline || 'Official Apple Store & Reseller');
  const [logoSuccess, setLogoSuccess] = useState('');
  const [logoError, setLogoError] = useState('');

  // QRIS Payment Settings State
  const [qrisImagePreview, setQrisImagePreview] = useState(storeSettings?.qrisImage || null);
  const [qrisMerchantNameInput, setQrisMerchantNameInput] = useState(storeSettings?.qrisMerchantName || 'iConicstore Official');
  const [qrisNmidInput, setQrisNmidInput] = useState(storeSettings?.qrisNmid || 'ID1029384918273');
  const [qrisSuccess, setQrisSuccess] = useState('');
  const [qrisError, setQrisError] = useState('');

  // Storefront Hero Banner Slider State
  const [bannersList, setBannersList] = useState(() => 
    storeSettings?.heroBanners || INITIAL_STORE_SETTINGS.heroBanners || []
  );
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');
  const [newBannerTarget, setNewBannerTarget] = useState('pricelist');
  const [newBannerCategory, setNewBannerCategory] = useState('iphone');
  const [newBannerShowText, setNewBannerShowText] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState('');
  const [bannerError, setBannerError] = useState('');

  useEffect(() => {
    if (storeSettings?.heroBanners) {
      setBannersList(storeSettings.heroBanners);
    }
  }, [storeSettings]);

  // Storefront Visual Category Cards State (6 Kategori di Beranda)
  const [categoryCardsSettings, setCategoryCardsSettings] = useState(() => 
    storeSettings?.categoryCards || DEFAULT_CATEGORY_CARDS
  );
  const [editingCategoryCard, setEditingCategoryCard] = useState(null); // { id, title, subtitle, image }
  const [catCardError, setCatCardError] = useState('');
  const [catCardSuccess, setCatCardSuccess] = useState('');

  useEffect(() => {
    if (storeSettings?.categoryCards) {
      setCategoryCardsSettings(storeSettings.categoryCards);
    }
  }, [storeSettings]);

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setBannerError('File harus berupa gambar (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setBannerError('Ukuran gambar maksimal 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewBannerImage(event.target.result);
      setBannerError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAddBanner = (e) => {
    e.preventDefault();
    if (!newBannerImage.trim()) {
      setBannerError('Harap masukkan URL gambar atau unggah file banner terlebih dahulu.');
      return;
    }
    const newBanner = {
      id: `banner-${Date.now()}`,
      title: newBannerTitle.trim() || `Promo Banner ${bannersList.length + 1}`,
      imageUrl: newBannerImage.trim(),
      targetTab: newBannerTarget,
      category: newBannerTarget === 'pricelist' ? newBannerCategory : null,
      showText: newBannerShowText
    };
    const updated = [...bannersList, newBanner];
    setBannersList(updated);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ heroBanners: updated });
    }
    setNewBannerTitle('');
    setNewBannerImage('');
    setNewBannerShowText(false);
    setBannerError('');
    setBannerSuccess('Banner baru berhasil ditambahkan dan disimpan!');
    showToast('Banner promosi baru berhasil dipasang di Beranda!', 'success');
  };

  const handleDeleteBanner = (bannerId) => {
    const updated = bannersList.filter(b => b.id !== bannerId);
    setBannersList(updated);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ heroBanners: updated });
    }
    setBannerSuccess('Banner berhasil dihapus!');
    showToast('Banner berhasil dihapus dari Beranda.', 'success');
  };

  // Editing Banner State
  const [editingBanner, setEditingBanner] = useState(null);

  const handleToggleBannerActive = (bannerId) => {
    const updated = bannersList.map(b => {
      if (b.id === bannerId) {
        const nextActive = b.active === false ? true : false;
        return { ...b, active: nextActive };
      }
      return b;
    });
    setBannersList(updated);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ heroBanners: updated });
    }
    const currentBanner = updated.find(b => b.id === bannerId);
    const isNowActive = currentBanner?.active !== false;
    showToast(
      isNowActive 
        ? `Banner "${currentBanner?.title}" telah diaktifkan di Beranda.` 
        : `Banner "${currentBanner?.title}" dinonaktifkan (tidak tayang di Beranda).`,
      isNowActive ? 'success' : 'info'
    );
  };

  const handleStartEditBanner = (banner) => {
    setEditingBanner({
      ...banner,
      title: banner.title || '',
      imageUrl: banner.imageUrl || banner.bg || '',
      targetTab: banner.targetTab || 'pricelist',
      category: banner.category || 'iphone',
      showText: !!banner.showText,
      active: banner.active !== false
    });
  };

  const handleEditBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (PNG, JPG, WEBP).', 'warning');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 4MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingBanner(prev => ({ ...prev, imageUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditBanner = (e) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.imageUrl.trim()) {
      showToast('Harap isi URL gambar atau unggah file banner.', 'warning');
      return;
    }
    const updated = bannersList.map(b => {
      if (b.id === editingBanner.id) {
        return {
          ...b,
          title: editingBanner.title.trim() || b.title,
          imageUrl: editingBanner.imageUrl.trim(),
          targetTab: editingBanner.targetTab,
          category: editingBanner.targetTab === 'pricelist' ? editingBanner.category : null,
          showText: editingBanner.showText,
          active: editingBanner.active !== false
        };
      }
      return b;
    });
    setBannersList(updated);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ heroBanners: updated });
    }
    setEditingBanner(null);
    showToast('Perubahan banner berhasil disimpan!', 'success');
  };

  const handleMoveBanner = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bannersList.length) return;
    const updated = [...bannersList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBannersList(updated);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ heroBanners: updated });
    }
    showToast('Urutan slide banner berhasil dipindahkan.', 'info');
  };

  const handleResetBanners = () => {
    const defaultBanners = INITIAL_STORE_SETTINGS.heroBanners || [];
    setBannersList(defaultBanners);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ heroBanners: defaultBanners });
    }
    setBannerSuccess('Banner berhasil direset ke bawaan default.');
    showToast('Banner slider berhasil dikembalikan ke default.', 'info');
  };

  // Handlers for Visual Category Cards Settings (6 Kategori Beranda)
  const handleStartEditCategoryCard = (catId) => {
    const current = categoryCardsSettings?.[catId] || DEFAULT_CATEGORY_CARDS[catId] || {};
    setEditingCategoryCard({
      id: catId,
      title: current.title || catId.toUpperCase(),
      subtitle: current.subtitle || '',
      image: current.image || ''
    });
    setCatCardError('');
  };

  const handleCategoryCardUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCatCardError('File harus berupa gambar (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setCatCardError('Ukuran gambar maksimal 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingCategoryCard(prev => ({ ...prev, image: event.target.result }));
      setCatCardError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategoryCard = (e) => {
    e.preventDefault();
    if (!editingCategoryCard || !editingCategoryCard.id) return;
    if (!editingCategoryCard.image || !editingCategoryCard.image.trim()) {
      setCatCardError('Gambar kategori tidak boleh kosong.');
      return;
    }

    const catId = editingCategoryCard.id;
    const updated = {
      ...(categoryCardsSettings || DEFAULT_CATEGORY_CARDS),
      [catId]: {
        title: editingCategoryCard.title.trim() || DEFAULT_CATEGORY_CARDS[catId]?.title || catId,
        subtitle: editingCategoryCard.subtitle.trim(),
        image: editingCategoryCard.image.trim()
      }
    };

    setCategoryCardsSettings(updated);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ categoryCards: updated });
    }
    setEditingCategoryCard(null);
    setCatCardSuccess(`Gambar kategori ${editingCategoryCard.title} berhasil diperbarui.`);
    showToast(`Gambar kategori ${editingCategoryCard.title} berhasil disimpan`, 'success');
    setTimeout(() => setCatCardSuccess(''), 4000);
  };

  const handleResetCategoryCard = (catId) => {
    const defaultData = DEFAULT_CATEGORY_CARDS[catId];
    if (!defaultData) return;
    const updated = {
      ...(categoryCardsSettings || DEFAULT_CATEGORY_CARDS),
      [catId]: { ...defaultData }
    };
    setCategoryCardsSettings(updated);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ categoryCards: updated });
    }
    showToast(`Kategori ${defaultData.title} dikembalikan ke preset Apple.`, 'info');
  };

  const handleResetAllCategoryCards = () => {
    if (window.confirm('Kembalikan semua gambar & teks 6 kategori Beranda ke preset bawaan Apple?')) {
      setCategoryCardsSettings(DEFAULT_CATEGORY_CARDS);
      if (onUpdateStoreSettings) {
        onUpdateStoreSettings({ categoryCards: DEFAULT_CATEGORY_CARDS });
      }
      showToast('Semua gambar kategori Beranda berhasil direset ke default.', 'info');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('File harus berupa gambar (PNG, JPG, SVG, atau WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Ukuran gambar maksimal 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setStoreLogoPreview(dataUrl);
      setLogoError('');
      if (onUpdateStoreSettings) {
        onUpdateStoreSettings({ storeLogo: dataUrl });
      }
      setLogoSuccess('Logo toko berhasil diunggah!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setStoreLogoPreview(null);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ storeLogo: null });
    }
    setLogoSuccess('Logo dikembalikan ke default iConicstore.');
  };

  const handleSaveBranding = (e) => {
    e.preventDefault();
    setLogoError('');
    setLogoSuccess('');

    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({
        storeName: storeNameInput.trim() || 'iConicstore Indonesia',
        storeTagline: storeTaglineInput.trim() || 'Official Apple Store & Reseller',
        storeLogo: storeLogoPreview
      });
    }
    setLogoSuccess('Nama dan identitas brand berhasil diperbarui!');
  };

  const handleQrisUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setQrisError('File harus berupa gambar QR Code QRIS (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setQrisError('Ukuran gambar maksimal 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setQrisImagePreview(dataUrl);
      setQrisError('');
      if (onUpdateStoreSettings) {
        onUpdateStoreSettings({ qrisImage: dataUrl });
      }
      setQrisSuccess('Gambar QR Code QRIS berhasil diunggah!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQrisImage = () => {
    setQrisImagePreview(null);
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ qrisImage: null });
    }
    setQrisSuccess('QRIS dikembalikan ke mode QRIS standar.');
  };

  const handleSaveQrisSettings = (e) => {
    e.preventDefault();
    setQrisError('');
    setQrisSuccess('');

    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({
        qrisImage: qrisImagePreview,
        qrisMerchantName: qrisMerchantNameInput.trim() || 'iConicstore Official',
        qrisNmid: qrisNmidInput.trim() || 'ID1029384918273'
      });
    }
    setQrisSuccess('Pengaturan QRIS Toko berhasil disimpan dan aktif di Kasir POS!');
  };

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  const handleSaveOwnerPin = (e) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess('');

    const cleanCurrent = currentOwnerPinInput.trim();
    const cleanNew = newOwnerPinInput.trim();
    const cleanConfirm = confirmOwnerPinInput.trim();

    if (cleanCurrent !== activeOwnerPin) {
      setPinChangeError('PIN Master saat ini salah.');
      return;
    }
    if (!/^\d{4,6}$/.test(cleanNew)) {
      setPinChangeError('PIN Baru harus berupa 4 hingga 6 digit angka.');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setPinChangeError('Konfirmasi PIN Baru tidak cocok.');
      return;
    }

    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ ownerPin: cleanNew });
    }
    setPinChangeSuccess('PIN Master Owner berhasil diperbarui!');
    setCurrentOwnerPinInput('');
    setNewOwnerPinInput('');
    setConfirmOwnerPinInput('');
  };

  const handleSaveCashierPin = (e) => {
    e.preventDefault();
    setCashierPinError('');
    setCashierPinSuccess('');

    const cleanPin = cashierPinInput.trim();
    if (!/^\d{4,6}$/.test(cleanPin)) {
      setCashierPinError('PIN Kasir harus berupa 4 hingga 6 digit angka.');
      return;
    }

    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({ cashierDefaultPin: cleanPin, supervisorPin: cleanPin });
    }
    setCashierPinSuccess('PIN Kasir & Staf berhasil diperbarui!');
  };

  const handleSaveStoreProfile = (e) => {
    e.preventDefault();
    setProfileSuccess('');

    if (onUpdateStoreSettings) {
      onUpdateStoreSettings({
        storeName: storeNameInput.trim() || 'iConicstore Indonesia',
        defaultStoreWarranty: warrantyStoreInput.trim() || '1 Bulan Tukar Unit Toko',
        defaultSignalWarranty: warrantySignalInput.trim() || 'Permanen Seumur Hidup (All Operator & Bea Cukai)',
        lowStockThreshold: Math.max(1, Number(lowStockInput) || 2),
        agingStockThresholdDays: Math.max(1, Number(agingDaysInput) || 14)
      });
    }
    setProfileSuccess('Pengaturan profil toko & ambang batas berhasil disimpan!');
  };

  const handleResetToDefault = () => {
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings(INITIAL_STORE_SETTINGS);
    }
    setCashierPinInput('1234');
    setStoreNameInput(INITIAL_STORE_SETTINGS.storeName);
    setStoreTaglineInput(INITIAL_STORE_SETTINGS.storeTagline);
    setStoreLogoPreview(null);
    setQrisImagePreview(null);
    setQrisMerchantNameInput(INITIAL_STORE_SETTINGS.qrisMerchantName);
    setQrisNmidInput(INITIAL_STORE_SETTINGS.qrisNmid);
    setWarrantyStoreInput(INITIAL_STORE_SETTINGS.defaultStoreWarranty);
    setWarrantySignalInput(INITIAL_STORE_SETTINGS.defaultSignalWarranty);
    setLowStockInput(INITIAL_STORE_SETTINGS.lowStockThreshold);
    setAgingDaysInput(INITIAL_STORE_SETTINGS.agingStockThresholdDays);
    setResetConfirmOpen(false);
    setResetSuccess('Semua pengaturan toko, QRIS, dan PIN berhasil dikembalikan ke bawaan pabrik.');
  };

  const handleOpenAddCategory = () => {
    setEditingCat(null);
    setCatFormName('');
    setCatFormDesc('');
    setCatFormIsSerialized(true);
    setCatFormHasBattery(true);
    setIsAddCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCat(cat);
    setCatFormName(cat.name || '');
    setCatFormDesc(cat.description || '');
    setCatFormIsSerialized(cat.isSerialized !== false);
    setCatFormHasBattery(cat.hasBattery !== false);
    setIsAddCatModalOpen(true);
  };

  const handleSaveCategory = (e) => {
    if (e) e.preventDefault();
    if (!catFormName.trim()) return;

    if (editingCat) {
      if (onUpdateCategory) {
        onUpdateCategory({
          ...editingCat,
          name: catFormName.trim(),
          description: catFormDesc.trim(),
          isSerialized: catFormIsSerialized,
          hasBattery: catFormHasBattery
        });
      }
    } else {
      if (onAddCategory) {
        onAddCategory({
          name: catFormName.trim(),
          description: catFormDesc.trim(),
          isSerialized: catFormIsSerialized,
          hasBattery: catFormHasBattery
        });
      }
    }
    setIsAddCatModalOpen(false);
    setEditingCat(null);
  };

  const handleConfirmDeleteCategory = () => {
    if (deletingCat && onDeleteCategory) {
      onDeleteCategory(deletingCat.id);
    }
    setDeletingCat(null);
  };

  // Filtered sales history based on date and branch
  const filteredSales = useMemo(() => {
    if (!Array.isArray(salesHistory)) return [];
    return salesHistory.filter(item => {
      if (!item) return false;
      // Branch filter
      if (branchFilter !== 'all' && item.branchId && item.branchId !== branchFilter) {
        return false;
      }

      // Date filter
      const itemDate = String(item.date || '');
      if (dateFilter === 'today') {
        return itemDate.startsWith('2026-10-23') || itemDate.includes('23/10/2026');
      } else if (dateFilter === '7days') {
        return true; // Mock dataset covers this week
      } else if (dateFilter === 'month') {
        return itemDate.includes('2026-10') || itemDate.includes('/10/2026');
      }

      return true;
    });
  }, [salesHistory, dateFilter, branchFilter]);

  // Aggregate Financial Analytics
  const analytics = useMemo(() => {
    let totalRevenue = 0;
    let totalHpp = 0;
    let totalDiscount = 0;
    let totalUnitsSold = 0;
    let retailRevenue = 0;
    let resellerRevenue = 0;

    const paymentCounts = { tunai: 0, qris: 0, edc: 0, transfer: 0 };
    const categoryCounts = { iphone: 0, ipad: 0, macbook: 0, watch: 0, audio: 0 };

    filteredSales.forEach(tx => {
      if (!tx) return;
      const txTotal = Number(tx.total || 0);
      totalRevenue += txTotal;
      totalDiscount += Number(tx.discountAmount || 0);
      
      if (tx.pricingMode === 'reseller') {
        resellerRevenue += txTotal;
      } else {
        retailRevenue += txTotal;
      }

      const pMethod = tx.paymentMethod?.toLowerCase() || 'tunai';
      if (paymentCounts[pMethod] !== undefined) {
        paymentCounts[pMethod] += txTotal;
      }

      if (Array.isArray(tx.items)) {
        tx.items.forEach(it => {
          if (!it) return;
          totalUnitsSold += 1;
          const modal = Number(it.priceModal || (it.appliedPrice || 0) * 0.85);
          totalHpp += modal;

          const modelLower = (it.modelName || '').toLowerCase();
          const cat = it.category || (modelLower.includes('iphone') ? 'iphone' : 
                      modelLower.includes('macbook') ? 'macbook' : 
                      modelLower.includes('ipad') ? 'ipad' : 
                      modelLower.includes('watch') ? 'watch' : 'audio');
          if (categoryCounts[cat] !== undefined) {
            categoryCounts[cat] += 1;
          }
        });
      }
    });

    const grossProfit = totalRevenue - totalHpp;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const aov = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

    // Total Inventory Asset Value (Physical stock value in warehouse/stores)
    const safeUnits = Array.isArray(units) ? units : [];
    const availableUnits = safeUnits.filter(u => u && u.status === 'available');
    const totalInventoryValue = availableUnits.reduce((acc, u) => acc + Number(u.priceModal || (u.priceRetail || 0) * 0.85), 0);
    const totalInventoryRetailValue = availableUnits.reduce((acc, u) => acc + Number(u.priceRetail || 0), 0);

    return {
      totalRevenue,
      totalHpp,
      grossProfit,
      profitMargin,
      totalUnitsSold,
      txCount: filteredSales.length,
      aov,
      retailRevenue,
      resellerRevenue,
      paymentCounts,
      categoryCounts,
      totalInventoryValue,
      totalInventoryRetailValue,
      availableStockCount: availableUnits.length
    };
  }, [filteredSales, units]);

  // Aging Stock Detection (>14 days in stock)
  const agingUnits = useMemo(() => {
    const safeUnits = Array.isArray(units) ? units : [];
    return safeUnits.filter(u => u && u.status === 'available' && ['unit-001', 'unit-004'].includes(u.id)).map(u => ({
      ...u,
      daysInStock: u.id === 'unit-004' ? 24 : 18,
      marketRisk: u.id === 'unit-004' ? 'Tinggi (Depresiasi M2 MacBook)' : 'Sedang (Stok iPhone 13)'
    }));
  }, [units]);

  // Export Sales Report to CSV
  const handleExportCsv = () => {
    const headers = ['No. Nota', 'Tanggal', 'Cabang', 'Kasir', 'Pelanggan', 'Tipe', 'Total Bayar', 'Metode Bayar'];
    const rows = filteredSales.map(tx => [
      tx.id,
      `"${tx.date}"`,
      `"${tx.branchName || 'Cabang Surabaya Pusat'}"`,
      `"${tx.cashierName || 'Kasir'}"`,
      `"${tx.customerName || 'Umum'}"`,
      tx.pricingMode,
      tx.total,
      tx.paymentMethod
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_iConicstore_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Master Trade-In & Buyback Valuations local state
  const [localTradeInValuations, setLocalTradeInValuations] = useState(() => {
    if (tradeInValuations && Object.keys(tradeInValuations).length > 0) {
      return tradeInValuations;
    }
    return INITIAL_TRADE_IN_VALUATIONS;
  });

  useEffect(() => {
    if (tradeInValuations && Object.keys(tradeInValuations).length > 0) {
      setLocalTradeInValuations(tradeInValuations);
    }
  }, [tradeInValuations]);

  const [tradeInSearchQuery, setTradeInSearchQuery] = useState('');
  const [tradeInSaveSuccess, setTradeInSaveSuccess] = useState('');
  const [isAddTradeInModalOpen, setIsAddTradeInModalOpen] = useState(false);
  const [newTradeInModel, setNewTradeInModel] = useState('');
  const [newTradeInCapacity, setNewTradeInCapacity] = useState('128GB');
  const [newTradeInPrice, setNewTradeInPrice] = useState('');

  const handleUpdateTradeInPrice = (model, capacity, price) => {
    const numericPrice = typeof price === 'number' ? price : parseInt(String(price).replace(/\D/g, ''), 10) || 0;
    setLocalTradeInValuations(prev => {
      const copy = { ...prev };
      if (!copy[model]) copy[model] = {};
      copy[model] = { ...copy[model], [capacity]: numericPrice };
      return copy;
    });
  };

  const handleAddCapacityToModel = (model) => {
    const standardCaps = ['64GB', '128GB', '256GB', '512GB', '1TB'];
    const currentCaps = Object.keys(localTradeInValuations[model] || {});
    const nextCap = standardCaps.find(c => !currentCaps.includes(c)) || '256GB';
    handleUpdateTradeInPrice(model, nextCap, 8000000);
  };

  const handleDeleteCapacity = (model, capacity) => {
    setLocalTradeInValuations(prev => {
      const copy = { ...prev };
      if (copy[model]) {
        const updated = { ...copy[model] };
        delete updated[capacity];
        copy[model] = updated;
      }
      return copy;
    });
  };

  const handleDeleteModel = (model) => {
    setDeletingTradeInModel(model);
  };

  const handleAddNewTradeInModel = (e) => {
    e.preventDefault();
    if (!newTradeInModel.trim()) return;
    const price = parseInt(String(newTradeInPrice).replace(/\D/g, ''), 10) || 10000000;
    setLocalTradeInValuations(prev => ({
      ...prev,
      [newTradeInModel.trim()]: {
        ...(prev[newTradeInModel.trim()] || {}),
        [newTradeInCapacity]: price
      }
    }));
    setNewTradeInModel('');
    setNewTradeInPrice('');
    setIsAddTradeInModalOpen(false);
    setTradeInSaveSuccess(`Model ${newTradeInModel} berhasil ditambahkan! Klik "Simpan Semua Perubahan" untuk mempublikasikan.`);
    setTimeout(() => setTradeInSaveSuccess(''), 4000);
  };

  const handleSaveTradeInChanges = () => {
    if (onUpdateTradeInValuations) {
      onUpdateTradeInValuations(localTradeInValuations);
    }
    try {
      localStorage.setItem('iconicstore_tradein_valuations', JSON.stringify(localTradeInValuations));
    } catch (e) {}
    setTradeInSaveSuccess('Berhasil menyimpan semua patokan harga taksiran Trade-In & Jual HP ke sistem!');
    setTimeout(() => setTradeInSaveSuccess(''), 4000);
  };

  const handleResetTradeInToDefault = () => {
    setIsResetTradeInConfirmOpen(true);
  };

  // Grouped Menu Structure for Executive Owner Portal (4 Strategic Business Pillars)
  const MENU_GROUPS = [
    {
      id: 'finance',
      label: 'Laporan & Finansial',
      icon: TrendingUp,
      badge: null,
      tabs: [
        { id: 'analytics', label: 'Analisis Penjualan & Margin', icon: TrendingUp },
        { id: 'opex', label: 'Beban OPEX & Laba Bersih', icon: Receipt },
        { id: 'reports', label: 'Laporan Penjualan', icon: FileText },
        { id: 'history', label: 'Riwayat Transaksi', icon: Clock },
        { id: 'shifts', label: 'Laporan Tutup Shift (Z-Report)', icon: Printer }
      ]
    },
    {
      id: 'inventory',
      label: 'Katalog & Inventaris',
      icon: Package,
      badge: agingUnits.length > 0 ? agingUnits.length : null,
      tabs: [
        { id: 'inventory_report', label: 'Laporan Valuasi & Stok Opname', icon: Boxes },
        { id: 'purchases', label: 'Pembelian Stok & Vendor PO', icon: Truck },
        { id: 'aging', label: 'Aging Stock & Risk Radar', icon: AlertTriangle, badge: agingUnits.length > 0 ? agingUnits.length : null },
        { id: 'products', label: 'Pengaturan Produk & Master', icon: Sliders },
        { id: 'categories', label: 'Manajemen Kategori', icon: Layers },
        { id: 'tradein_pricing', label: 'Taksiran Trade-In & Harga Jual', icon: RefreshCw }
      ]
    },
    {
      id: 'crm',
      label: 'Mitra & Purna Jual',
      icon: Users,
      badge: Array.isArray(preorders) && preorders.filter(p => !p.status?.includes('Lunas')).length > 0 
        ? preorders.filter(p => !p.status?.includes('Lunas')).length 
        : null,
      tabs: [
        { id: 'customers', label: 'Buku Pelanggan & Garansi Unit', icon: UserCheck },
        { id: 'reseller_perf', label: 'Performa Mitra Reseller (B2B)', icon: Users },
        { id: 'rma_analytics', label: 'Radar Retur & Kualitas Stok', icon: Activity },
        { id: 'po_monitor', label: 'Monitoring Inden Pre-Order', icon: Clock, badge: Array.isArray(preorders) && preorders.filter(p => !p.status?.includes('Lunas')).length > 0 ? preorders.filter(p => !p.status?.includes('Lunas')).length : null }
      ]
    },
    {
      id: 'system',
      label: 'Cabang & Staf',
      icon: Store,
      badge: null,
      tabs: [
        { id: 'outlets', label: 'Pengaturan Cabang & Outlet', icon: Store },
        { id: 'staff_perf', label: 'Performa Staf & Komisi Kasir', icon: Award },
        { id: 'settings', label: 'Pengaturan Toko & Keamanan PIN', icon: Settings }
      ]
    }
  ];

  // OPEX State & Persistence
  const [opexList, setOpexList] = useState(() => {
    try {
      const saved = localStorage.getItem('iconicstore_opex');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'op-01', date: '2026-10-01', category: 'Sewa Toko / Mall', description: 'Sewa Outlet Surabaya Pusat Bulan Okt 2026', amount: 8500000, branchId: 'b1' },
      { id: 'op-02', date: '2026-10-05', category: 'Listrik & Utilitas', description: 'PLN & Internet Dedicated Fiber Toko', amount: 1250000, branchId: 'b1' },
      { id: 'op-03', date: '2026-10-10', category: 'Operasional & Packing', description: 'Restock Box iPhone OEM, Bubble Wrap & Lakban', amount: 850000, branchId: 'all' },
      { id: 'op-04', date: '2026-10-15', category: 'Marketing & Iklan', description: 'Meta Ads Instagram & Promosi Trade-In', amount: 2000000, branchId: 'all' },
      { id: 'op-05', date: '2026-10-20', category: 'Gaji & Operasional', description: 'Uang Makan & Operasional Kasir Malang', amount: 1500000, branchId: 'b2' }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('iconicstore_opex', JSON.stringify(opexList));
    } catch (e) {}
  }, [opexList]);

  const [isAddOpexModalOpen, setIsAddOpexModalOpen] = useState(false);
  const [newOpexCategory, setNewOpexCategory] = useState('Sewa Toko / Mall');
  const [newOpexDesc, setNewOpexDesc] = useState('');
  const [newOpexAmount, setNewOpexAmount] = useState('');
  const [newOpexBranch, setNewOpexBranch] = useState('all');
  const [newOpexDate, setNewOpexDate] = useState(() => new Date().toISOString().slice(0, 10));

  const handleAddOpex = (e) => {
    e.preventDefault();
    const cleanAmount = parseInt(String(newOpexAmount).replace(/\D/g, ''), 10) || 0;
    if (cleanAmount <= 0 || !newOpexDesc.trim()) {
      showToast('Harap isi deskripsi dan nominal pengeluaran yang valid.', 'error');
      return;
    }
    const newEntry = {
      id: `op-${Date.now()}`,
      date: newOpexDate,
      category: newOpexCategory,
      description: newOpexDesc.trim(),
      amount: cleanAmount,
      branchId: newOpexBranch
    };
    setOpexList(prev => [newEntry, ...prev]);
    setIsAddOpexModalOpen(false);
    setNewOpexDesc('');
    setNewOpexAmount('');
    showToast('Beban operasional (OPEX) berhasil dicatat!', 'success');
  };

  const handleDeleteOpex = (id) => {
    setOpexList(prev => prev.filter(item => item.id !== id));
    showToast('Catatan pengeluaran berhasil dihapus.', 'info');
  };

  const filteredOpex = useMemo(() => {
    return opexList.filter(item => {
      if (branchFilter !== 'all' && item.branchId !== 'all' && item.branchId !== branchFilter) {
        return false;
      }
      return true;
    });
  }, [opexList, branchFilter]);

  const totalOpexAmount = useMemo(() => {
    return filteredOpex.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredOpex]);

  const netProfit = useMemo(() => {
    return analytics.grossProfit - totalOpexAmount;
  }, [analytics.grossProfit, totalOpexAmount]);

  const netProfitMargin = useMemo(() => {
    if (analytics.totalRevenue <= 0) return 0;
    return ((netProfit / analytics.totalRevenue) * 100).toFixed(1);
  }, [netProfit, analytics.totalRevenue]);

  // Staff / Cashier Sales & Commission Breakdown
  const staffPerformance = useMemo(() => {
    const map = {};
    filteredSales.forEach(tx => {
      const cashier = tx.cashierName || 'Kasir Default';
      if (!map[cashier]) {
        const branchObj = (branches || []).find(b => b.id === tx.branchId);
        const bName = branchObj ? branchObj.name : (tx.branchName && !tx.branchName.includes('Surabaya') ? tx.branchName : (branches[0]?.name || 'iConicstore'));
        map[cashier] = {
          name: cashier,
          branchName: bName,
          txCount: 0,
          totalRevenue: 0,
          unitsSold: 0,
          commission: 0
        };
      }
      map[cashier].txCount += 1;
      map[cashier].totalRevenue += Number(tx.total || 0);
      const unitsCount = Array.isArray(tx.items) ? tx.items.length : 1;
      map[cashier].unitsSold += unitsCount;
      map[cashier].commission += unitsCount * 25000; // Rp 25.000 / unit commission
    });
    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredSales]);

  // Pre-Order Analytics
  const preorderAnalytics = useMemo(() => {
    const list = Array.isArray(preorders) ? preorders : [];
    let totalDp = 0;
    let totalEstimated = 0;
    let pendingCount = 0;
    let fulfilledCount = 0;

    list.forEach(po => {
      totalDp += Number(po.dpAmount || 0);
      totalEstimated += Number(po.estimatedTotal || 0);
      if (po.status?.includes('Lunas')) {
        fulfilledCount += 1;
      } else {
        pendingCount += 1;
      }
    });

    const remainingPotential = totalEstimated - totalDp;
    return { list, totalDp, totalEstimated, remainingPotential, pendingCount, fulfilledCount };
  }, [preorders]);

  // =========================================================================
  // FITUR 2: PEMBELIAN STOK & FAKTUR KULAKAN SUPPLIER (INBOUND PO)
  // =========================================================================
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('iconicstore_purchase_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'PO-202610-001',
        invoiceNo: 'INV/GLB/2026/10/881',
        supplierName: 'PT Global Apple Distribusi Jaya',
        supplierPhone: '081234567890',
        purchaseDate: '2026-10-18',
        dueDate: '2026-11-18',
        branchId: 'b1',
        paymentStatus: 'Tempo / Hutang',
        paymentMethod: 'Transfer BCA Virtual Account',
        totalAmount: 48500000,
        totalItems: 5,
        items: [
          { id: 'poi-1', productName: 'iPhone 15 Pro Max 256GB Natural Titanium', qty: 2, unitHpp: 17500000, subtotal: 35000000, imeiList: ['352981098234123', '352981098234124'] },
          { id: 'poi-2', productName: 'iPhone 13 128GB Midnight (Ex-Inter)', qty: 3, unitHpp: 4500000, subtotal: 13500000, imeiList: ['359871029837111', '359871029837112', '359871029837113'] }
        ],
        notes: 'Batch kulakan fisik mulus 99%, garansi mesin supplier 30 hari.',
        receivedBy: 'Fajar Supervisor',
        createdAt: '2026-10-18T10:30:00Z'
      },
      {
        id: 'PO-202610-002',
        invoiceNo: 'INV/MGM/2026/10/412',
        supplierName: 'Megamall Supplier Gadget HK',
        supplierPhone: '081987654321',
        purchaseDate: '2026-10-22',
        dueDate: '2026-10-22',
        branchId: 'b2',
        paymentStatus: 'Lunas',
        paymentMethod: 'Bank Mandiri Corporate',
        totalAmount: 26000000,
        totalItems: 4,
        items: [
          { id: 'poi-3', productName: 'iPhone 14 Pro 128GB Deep Purple', qty: 2, unitHpp: 9500000, subtotal: 19000000, imeiList: ['358761234901821', '358761234901822'] },
          { id: 'poi-4', productName: 'iPad Air 5 64GB WiFi Space Grey', qty: 2, unitHpp: 3500000, subtotal: 7000000, imeiList: ['DMPTK918231', 'DMPTK918232'] }
        ],
        notes: 'Pembelian cash partai unit grade A+ tanpa minus.',
        receivedBy: 'Rian Kasir Malang',
        createdAt: '2026-10-22T14:15:00Z'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('iconicstore_purchase_orders', JSON.stringify(purchaseOrders));
    } catch (e) {}
  }, [purchaseOrders]);

  const [poFilterStatus, setPoFilterStatus] = useState('all'); // 'all' | 'Lunas' | 'Tempo / Hutang'
  const [poSearchQuery, setPoSearchQuery] = useState('');
  const [poBranchFilter, setPoBranchFilter] = useState('all');
  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false);
  const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState(null);

  // New PO Form states
  const [newPoSupplierName, setNewPoSupplierName] = useState('');
  const [newPoSupplierPhone, setNewPoSupplierPhone] = useState('');
  const [newPoInvoiceNo, setNewPoInvoiceNo] = useState('');
  const [newPoDate, setNewPoDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newPoDueDate, setNewPoDueDate] = useState('');
  const [newPoBranchId, setNewPoBranchId] = useState(branches[0]?.id || 'b1');
  const [newPoPaymentStatus, setNewPoPaymentStatus] = useState('Lunas');
  const [newPoPaymentMethod, setNewPoPaymentMethod] = useState('Transfer BCA Corporate');
  const [newPoNotes, setNewPoNotes] = useState('');
  const [newPoReceivedBy, setNewPoReceivedBy] = useState('Owner / Admin');
  const [newPoItems, setNewPoItems] = useState([
    { id: 'poi-1', productName: '', qty: 1, unitHpp: '', imeiListStr: '' }
  ]);
  const [autoAddUnitsToInventory, setAutoAddUnitsToInventory] = useState(false);

  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter(po => {
      if (poFilterStatus !== 'all' && po.paymentStatus !== poFilterStatus) {
        return false;
      }
      if (poBranchFilter !== 'all' && po.branchId !== poBranchFilter) {
        return false;
      }
      if (poSearchQuery.trim()) {
        const q = poSearchQuery.toLowerCase();
        const matchSupp = (po.supplierName || '').toLowerCase().includes(q);
        const matchInv = (po.invoiceNo || '').toLowerCase().includes(q);
        const matchNotes = (po.notes || '').toLowerCase().includes(q);
        const matchItems = (po.items || []).some(it => (it.productName || '').toLowerCase().includes(q));
        if (!matchSupp && !matchInv && !matchNotes && !matchItems) {
          return false;
        }
      }
      return true;
    });
  }, [purchaseOrders, poFilterStatus, poBranchFilter, poSearchQuery]);

  const poMetrics = useMemo(() => {
    let totalAmount = 0;
    let totalUnits = 0;
    let pendingDebt = 0;
    let pendingCount = 0;
    let lunasCount = 0;

    purchaseOrders.forEach(po => {
      totalAmount += Number(po.totalAmount || 0);
      totalUnits += Number(po.totalItems || 0);
      if (po.paymentStatus === 'Tempo / Hutang') {
        pendingDebt += Number(po.totalAmount || 0);
        pendingCount += 1;
      } else {
        lunasCount += 1;
      }
    });

    return { totalAmount, totalUnits, pendingDebt, pendingCount, lunasCount };
  }, [purchaseOrders]);

  const handleTogglePoPaymentStatus = (poId) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId) {
        const nextStatus = po.paymentStatus === 'Lunas' ? 'Tempo / Hutang' : 'Lunas';
        return { ...po, paymentStatus: nextStatus };
      }
      return po;
    }));
    if (selectedPurchaseDetail && selectedPurchaseDetail.id === poId) {
      setSelectedPurchaseDetail(prev => ({
        ...prev,
        paymentStatus: prev.paymentStatus === 'Lunas' ? 'Tempo / Hutang' : 'Lunas'
      }));
    }
    showToast('Status pembayaran faktur PO berhasil diperbarui!', 'success');
  };

  const handleAddPurchaseOrder = (e) => {
    e.preventDefault();
    if (!newPoSupplierName.trim()) {
      showToast('Harap masukkan nama supplier atau distributor.', 'warning');
      return;
    }
    const validItems = newPoItems.filter(item => item.productName.trim() && Number(item.qty) > 0);
    if (validItems.length === 0) {
      showToast('Harap masukkan minimal 1 baris produk dengan jumlah valid.', 'warning');
      return;
    }

    const processedItems = validItems.map((item, idx) => {
      const qty = parseInt(item.qty, 10) || 1;
      const hpp = parseFloat(item.unitHpp) || 0;
      const imeis = (item.imeiListStr || '')
        .split(/[\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean);
      return {
        id: `poi-${Date.now()}-${idx}`,
        productName: item.productName.trim(),
        qty,
        unitHpp: hpp,
        subtotal: qty * hpp,
        imeiList: imeis
      };
    });

    const totalAmount = processedItems.reduce((acc, it) => acc + it.subtotal, 0);
    const totalItems = processedItems.reduce((acc, it) => acc + it.qty, 0);

    const newPO = {
      id: `PO-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      invoiceNo: newPoInvoiceNo.trim() || `INV/PO/${Date.now().toString().slice(-6)}`,
      supplierName: newPoSupplierName.trim(),
      supplierPhone: newPoSupplierPhone.trim(),
      purchaseDate: newPoDate || new Date().toISOString().slice(0, 10),
      dueDate: newPoPaymentStatus === 'Tempo / Hutang' ? (newPoDueDate || newPoDate) : newPoDate,
      branchId: newPoBranchId,
      paymentStatus: newPoPaymentStatus,
      paymentMethod: newPoPaymentMethod,
      totalAmount,
      totalItems,
      items: processedItems,
      notes: newPoNotes.trim(),
      receivedBy: newPoReceivedBy.trim() || 'Owner / Admin',
      createdAt: new Date().toISOString()
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    if (autoAddUnitsToInventory && onAddUnit) {
      processedItems.forEach(item => {
        for (let i = 0; i < item.qty; i++) {
          const assignedImei = item.imeiList[i] || `IMEI-PO-${Date.now()}-${i + 1}`;
          const newUnit = {
            id: `unit-po-${Date.now()}-${i}`,
            modelName: item.productName,
            color: 'Space Grey',
            storage: '128GB',
            category: 'iphone',
            condition: 'Second — Like New',
            grade: 'Grade A+',
            batteryHealth: 100,
            imei: assignedImei,
            serialNumber: assignedImei,
            signalOrigin: 'Resmi Indonesia (iBox/GDN)',
            signalWarranty: 'Permanen Seumur Hidup',
            storeWarranty: storeSettings?.warrantyStore || '1 Bulan Tukar Unit Toko',
            priceModal: item.unitHpp,
            priceRetail: Math.round(item.unitHpp * 1.2),
            priceReseller: Math.round(item.unitHpp * 1.12),
            barcodeCode: `BC-${assignedImei.slice(-8)}`,
            status: 'available',
            branchId: newPoBranchId,
            image: getApplePresetPhoto(item.productName)
          };
          onAddUnit(newUnit);
        }
      });
      showToast(`Faktur ${newPO.invoiceNo} dicatat & ${totalItems} unit masuk ke Gudang!`, 'success');
    } else {
      showToast(`Faktur pembelian PO ${newPO.invoiceNo} berhasil disimpan!`, 'success');
    }

    setNewPoSupplierName('');
    setNewPoSupplierPhone('');
    setNewPoInvoiceNo('');
    setNewPoNotes('');
    setNewPoItems([{ id: 'poi-init', productName: '', qty: 1, unitHpp: '', imeiListStr: '' }]);
    setIsAddPurchaseModalOpen(false);
  };

  // =========================================================================
  // FITUR 3: DATABASE PELANGGAN & GARANSI DIGITAL TOKO (CUSTOMER CRM)
  // =========================================================================
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerWarrantyFilter, setCustomerWarrantyFilter] = useState('all'); // 'all' | 'active' | 'expiring' | 'expired'
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);

  const derivedCustomers = useMemo(() => {
    const map = new Map();
    salesHistory.forEach(sale => {
      const rawPhone = (sale.customerPhone || '').trim();
      const rawName = (sale.customerName || 'Pelanggan Walk-In').trim();
      const key = rawPhone ? rawPhone : rawName;
      if (!map.has(key)) {
        map.set(key, {
          id: `cust-${key.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
          name: rawName,
          phone: rawPhone,
          totalSpend: 0,
          transactionsCount: 0,
          lastTransactionDate: sale.date,
          transactions: [],
          devices: []
        });
      }
      const c = map.get(key);
      c.totalSpend += Number(sale.total || 0);
      c.transactionsCount += 1;
      if (new Date(sale.date) >= new Date(c.lastTransactionDate)) {
        c.lastTransactionDate = sale.date;
        if (rawName && rawName !== 'Pelanggan Walk-In') c.name = rawName;
      }
      c.transactions.push(sale);
      (sale.items || []).forEach(item => {
        c.devices.push({
          transactionId: sale.id,
          date: sale.date,
          branchName: sale.branchName || 'Cabang Surabaya',
          modelName: item.modelName || 'Apple Device',
          imei: item.imei || '-',
          condition: item.condition || 'Second Like New',
          storeWarranty: item.storeWarranty || '1 Bulan Tukar Unit Toko',
          price: item.appliedPrice || 0
        });
      });
    });

    return Array.from(map.values()).map(c => {
      const latestDevice = c.devices[0] || null;
      let warrantyDaysRemaining = 0;
      let warrantyStatus = 'expired';
      if (latestDevice) {
        const saleDateObj = new Date(latestDevice.date);
        const today = new Date();
        const diffTime = today - saleDateObj;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysLeft = 30 - diffDays;
        if (daysLeft > 7) {
          warrantyDaysRemaining = daysLeft;
          warrantyStatus = 'active';
        } else if (daysLeft > 0) {
          warrantyDaysRemaining = daysLeft;
          warrantyStatus = 'expiring';
        } else {
          warrantyDaysRemaining = 0;
          warrantyStatus = 'expired';
        }
      }
      return {
        ...c,
        latestDevice,
        warrantyDaysRemaining,
        warrantyStatus
      };
    });
  }, [salesHistory]);

  const filteredCustomers = useMemo(() => {
    return derivedCustomers.filter(cust => {
      if (customerWarrantyFilter === 'active' && cust.warrantyStatus !== 'active' && cust.warrantyStatus !== 'expiring') {
        return false;
      }
      if (customerWarrantyFilter === 'expiring' && cust.warrantyStatus !== 'expiring') {
        return false;
      }
      if (customerWarrantyFilter === 'expired' && cust.warrantyStatus !== 'expired') {
        return false;
      }
      if (customerSearchQuery.trim()) {
        const q = customerSearchQuery.toLowerCase();
        const matchName = (cust.name || '').toLowerCase().includes(q);
        const matchPhone = (cust.phone || '').toLowerCase().includes(q);
        const matchImei = (cust.devices || []).some(d => (d.imei || '').toLowerCase().includes(q));
        const matchModel = (cust.devices || []).some(d => (d.modelName || '').toLowerCase().includes(q));
        if (!matchName && !matchPhone && !matchImei && !matchModel) {
          return false;
        }
      }
      return true;
    });
  }, [derivedCustomers, customerWarrantyFilter, customerSearchQuery]);

  const customerMetrics = useMemo(() => {
    let totalLtv = 0;
    let activeWarranty = 0;
    let expiringWarranty = 0;
    let expiredWarranty = 0;

    derivedCustomers.forEach(c => {
      totalLtv += c.totalSpend;
      if (c.warrantyStatus === 'active') activeWarranty += 1;
      else if (c.warrantyStatus === 'expiring') {
        activeWarranty += 1;
        expiringWarranty += 1;
      } else {
        expiredWarranty += 1;
      }
    });

    return {
      totalCustomers: derivedCustomers.length,
      totalLtv,
      activeWarranty,
      expiringWarranty,
      expiredWarranty
    };
  }, [derivedCustomers]);

  const handleOpenWhatsAppCare = (customer) => {
    if (!customer.phone) {
      showToast('Nomor WhatsApp pelanggan tidak tercatat di transaksi kasir.', 'warning');
      return;
    }
    let cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const devName = customer.latestDevice?.modelName || 'Apple Device';
    const remaining = customer.warrantyDaysRemaining;
    const warrantyText = remaining > 0 
      ? `Garansi toko Kakak saat ini tersisa ${remaining} hari.`
      : `Masa garansi toko 30 hari Kakak telah selesai berjalan lancar.`;
    
    const message = `Halo Kak ${customer.name || ''}, kami dari Tim Layanan Pelanggan iConicstore Apple Store.

Kami ingin menanyakan bagaimana performa dan kenyamanan unit ${devName} yang Kakak beli di toko kami? ${warrantyText}

Apakah semua fungsi (layar, kamera, baterai, sinyal) bekerja prima? Jika Kakak memerlukan bantuan, klaim garansi, aksesoris original pendukung, atau info trade-in unit baru, tim kami siap melayani dengan senang hati!

Terima kasih atas kepercayaan Kakak berbelanja di iConicstore.`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // =========================================================================
  // FITUR 4: BACKUP & RESTORE SELURUH DATABASE TOKO (1-KLIK JSON)
  // =========================================================================
  const [isRestoreConfirmModalOpen, setIsRestoreConfirmModalOpen] = useState(false);
  const [restoreCandidateData, setRestoreCandidateData] = useState(null);

  const handleExportBackupJson = () => {
    try {
      const backupPayload = {
        meta: {
          system: 'iConicstore Apple Management System',
          version: '2.0.0',
          exportedAt: new Date().toISOString(),
          recordCounts: {
            units: units.length,
            salesHistory: salesHistory.length,
            opexList: opexList.length,
            purchaseOrders: purchaseOrders.length,
            masterProducts: masterProducts.length,
            branches: branches.length,
            resellers: resellers.length,
            preorders: preorders.length,
            shiftReports: shiftReports.length
          }
        },
        data: {
          units,
          salesHistory,
          opexList,
          purchaseOrders,
          masterProducts,
          categories,
          branches,
          resellers,
          preorders,
          tradeInValuations,
          storeSettings,
          shiftReports
        }
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `iConicstore-Database-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Cadangan database berhasil diunduh (${units.length} unit stok, ${salesHistory.length} transaksi penjualan)!`, 'success');
    } catch (err) {
      console.error('Backup error:', err);
      showToast('Gagal mengunduh cadangan database: ' + err.message, 'warning');
    }
  };

  const handleFileRestoreSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const dataPayload = parsed.data || parsed;

        if (!dataPayload || typeof dataPayload !== 'object') {
          showToast('Format berkas cadangan JSON tidak dikenali.', 'warning');
          return;
        }

        const hasValidKeys = dataPayload.units || dataPayload.salesHistory || dataPayload.masterProducts || dataPayload.storeSettings;
        if (!hasValidKeys) {
          showToast('Berkas bukan format database resmi iConicstore.', 'warning');
          return;
        }

        setRestoreCandidateData(dataPayload);
        setIsRestoreConfirmModalOpen(true);
      } catch (err) {
        console.error('JSON parse error:', err);
        showToast('Berkas bukan format JSON yang valid.', 'warning');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteRestore = () => {
    if (!restoreCandidateData) return;
    try {
      const d = restoreCandidateData;
      if (Array.isArray(d.units)) {
        localStorage.setItem('iconicstore_units_v2', JSON.stringify(d.units));
      }
      if (Array.isArray(d.salesHistory)) {
        localStorage.setItem('iconicstore_sales', JSON.stringify(d.salesHistory));
      }
      if (Array.isArray(d.opexList)) {
        localStorage.setItem('iconicstore_opex', JSON.stringify(d.opexList));
      }
      if (Array.isArray(d.purchaseOrders)) {
        localStorage.setItem('iconicstore_purchase_orders', JSON.stringify(d.purchaseOrders));
      }
      if (Array.isArray(d.masterProducts)) {
        localStorage.setItem('iconicstore_master_products', JSON.stringify(d.masterProducts));
      }
      if (Array.isArray(d.categories)) {
        localStorage.setItem('iconicstore_categories', JSON.stringify(d.categories));
      }
      if (Array.isArray(d.branches)) {
        localStorage.setItem('iconicstore_branches', JSON.stringify(d.branches));
      }
      if (Array.isArray(d.resellers)) {
        localStorage.setItem('iconicstore_resellers', JSON.stringify(d.resellers));
      }
      if (Array.isArray(d.preorders)) {
        localStorage.setItem('iconicstore_preorders', JSON.stringify(d.preorders));
      }
      if (d.tradeInValuations && typeof d.tradeInValuations === 'object') {
        localStorage.setItem('iconicstore_tradein_valuations', JSON.stringify(d.tradeInValuations));
      }
      if (d.storeSettings && typeof d.storeSettings === 'object') {
        localStorage.setItem('iconicstore_settings', JSON.stringify(d.storeSettings));
      }
      if (Array.isArray(d.shiftReports)) {
        localStorage.setItem('iconicstore_shift_reports', JSON.stringify(d.shiftReports));
      }

      setIsRestoreConfirmModalOpen(false);
      showToast('Database berhasil dipulihkan secara penuh! Memuat ulang sistem...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error('Execute restore error:', err);
      showToast('Gagal memulihkan database: ' + err.message, 'warning');
    }
  };

  // =========================================================================
  // SUPABASE CLOUD DATABASE CONFIGURATION & SYNC
  // =========================================================================
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey);
  const [supabaseStatus, setSupabaseStatus] = useState('unconfigured'); // 'checking' | 'connected' | 'disconnected' | 'unconfigured'
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      setSupabaseStatus('checking');
      testSupabaseConnection(cfg.url, cfg.anonKey).then(res => {
        setSupabaseStatus(res.success ? 'connected' : 'disconnected');
      }).catch(() => {
        setSupabaseStatus('disconnected');
      });
    } else {
      setSupabaseStatus('unconfigured');
    }
  }, []);

  const handleTestSupabase = async () => {
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      showToast('Harap isi Project URL dan Anon Key terlebih dahulu.', 'warning');
      return;
    }
    setSupabaseTesting(true);
    setSupabaseStatus('checking');
    try {
      const res = await testSupabaseConnection(supabaseUrlInput, supabaseKeyInput);
      if (res.success) {
        setSupabaseStatus('connected');
        showToast(res.message, 'success');
      } else {
        setSupabaseStatus('disconnected');
        showToast(res.message, 'error');
      }
    } catch (err) {
      setSupabaseStatus('disconnected');
      showToast('Koneksi gagal: ' + err.message, 'error');
    } finally {
      setSupabaseTesting(false);
    }
  };

  const handleSaveSupabaseConfig = async (e) => {
    if (e) e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      showToast('Harap masukkan Project URL dan Anon Key Supabase.', 'warning');
      return;
    }
    const saved = saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    if (saved) {
      showToast('Konfigurasi Supabase berhasil disimpan!', 'success');
      handleTestSupabase();
    } else {
      showToast('Gagal menyimpan konfigurasi ke browser.', 'error');
    }
  };

  const handleSyncToSupabase = async () => {
    setSupabaseSyncing(true);
    try {
      const payload = {
        branches,
        categories,
        masterProducts,
        units,
        salesHistory,
        purchaseOrders,
        opexList,
        resellers,
        preorders,
        shiftReports,
        storeSettings,
        tradeInValuations
      };
      const res = await syncLocalToSupabase(payload);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Gagal sinkronisasi: ' + err.message, 'error');
    } finally {
      setSupabaseSyncing(false);
    }
  };

  const handleCopySqlSchema = () => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = SUPABASE_SCHEMA_SQL;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      showToast('Skrip SQL Schema Supabase berhasil disalin ke clipboard!', 'success');
    } catch (err) {
      showToast('Gagal menyalin skrip SQL: ' + err.message, 'warning');
    }
  };

  // =========================================================================
  // INVENTORY VALUATION & STOCK OPNAME AUDIT LOGIC
  // =========================================================================
  const [opnameSearchQuery, setOpnameSearchQuery] = useState('');
  const [opnameCategoryFilter, setOpnameCategoryFilter] = useState('all');
  const [opnameStatusFilter, setOpnameStatusFilter] = useState('available'); // 'available' | 'sold' | 'all'
  const [opnameVerificationFilter, setOpnameVerificationFilter] = useState('all'); // 'all' | 'verified' | 'unverified'

  // Persistent Stock Opname Checklist
  const [checkedOpnameImeis, setCheckedOpnameImeis] = useState(() => {
    try {
      const saved = localStorage.getItem('iconicstore_opname_checked');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('iconicstore_opname_checked', JSON.stringify(checkedOpnameImeis));
    } catch (e) {}
  }, [checkedOpnameImeis]);

  const toggleOpnameCheck = (unitIdentifier) => {
    setCheckedOpnameImeis(prev => {
      if (prev.includes(unitIdentifier)) {
        return prev.filter(x => x !== unitIdentifier);
      } else {
        return [...prev, unitIdentifier];
      }
    });
  };

  const handleResetOpnameChecks = () => {
    setIsResetOpnameConfirmOpen(true);
  };

  // Units filtered by current active branch filter
  const branchFilteredUnits = useMemo(() => {
    const safe = Array.isArray(units) ? units : [];
    if (branchFilter === 'all') return safe;
    return safe.filter(u => u && u.branchId === branchFilter);
  }, [units, branchFilter]);

  // Executive Valuation Analytics
  const inventoryValuation = useMemo(() => {
    const available = branchFilteredUnits.filter(u => u && u.status === 'available');
    
    let totalHpp = 0;
    let totalRetail = 0;
    
    available.forEach(u => {
      const modal = Number(u.priceModal || (u.priceRetail || 0) * 0.85);
      const retail = Number(u.priceRetail || 0);
      totalHpp += modal;
      totalRetail += retail;
    });

    const potentialGrossProfit = totalRetail - totalHpp;
    const potentialMarginPercent = totalRetail > 0 ? (potentialGrossProfit / totalRetail) * 100 : 0;
    const avgHppPerUnit = available.length > 0 ? totalHpp / available.length : 0;

    // Category Breakdown
    const catMap = {};
    available.forEach(u => {
      const cat = u.category || 'iphone';
      if (!catMap[cat]) {
        catMap[cat] = { category: cat, count: 0, totalModal: 0, totalRetail: 0 };
      }
      const modal = Number(u.priceModal || (u.priceRetail || 0) * 0.85);
      const retail = Number(u.priceRetail || 0);
      catMap[cat].count += 1;
      catMap[cat].totalModal += modal;
      catMap[cat].totalRetail += retail;
    });

    const categoryStats = Object.values(catMap).map(c => {
      const profit = c.totalRetail - c.totalModal;
      const margin = c.totalRetail > 0 ? (profit / c.totalRetail) * 100 : 0;
      const portion = totalHpp > 0 ? (c.totalModal / totalHpp) * 100 : 0;
      return { ...c, profit, margin, portion };
    }).sort((a, b) => b.totalModal - a.totalModal);

    // Signal Origin Breakdown
    const signalMap = {
      ibox: { label: 'Resmi Indonesia (iBox / TAM)', count: 0, totalModal: 0, totalRetail: 0, badgeColor: '#30D158' },
      beacukai: { label: 'Inter Bea Cukai (Permanen)', count: 0, totalModal: 0, totalRetail: 0, badgeColor: '#0A84FF' },
      inter_other: { label: 'Inter All Operator (Toko)', count: 0, totalModal: 0, totalRetail: 0, badgeColor: '#FF9F0A' },
      other: { label: 'Lainnya / Non-Cellular', count: 0, totalModal: 0, totalRetail: 0, badgeColor: '#BF5AF2' }
    };

    available.forEach(u => {
      const sig = (u.signalOrigin || '').toLowerCase();
      const modal = Number(u.priceModal || (u.priceRetail || 0) * 0.85);
      const retail = Number(u.priceRetail || 0);

      let key = 'other';
      if (sig.includes('ibox') || sig.includes('resmi') || sig.includes('tam')) {
        key = 'ibox';
      } else if (sig.includes('cukai') || sig.includes('kemenperin')) {
        key = 'beacukai';
      } else if (sig.includes('inter') || sig.includes('all operator')) {
        key = 'inter_other';
      }

      signalMap[key].count += 1;
      signalMap[key].totalModal += modal;
      signalMap[key].totalRetail += retail;
    });

    const signalStats = Object.values(signalMap).filter(s => s.count > 0);

    // Branch Breakdown
    const brMap = {};
    (branches || []).forEach(b => {
      brMap[b.id] = { id: b.id, name: b.name, count: 0, totalModal: 0, totalRetail: 0 };
    });
    available.forEach(u => {
      const bId = u.branchId || 'b1';
      if (!brMap[bId]) {
        brMap[bId] = { id: bId, name: branches.find(b => b.id === bId)?.name || 'Cabang', count: 0, totalModal: 0, totalRetail: 0 };
      }
      const modal = Number(u.priceModal || (u.priceRetail || 0) * 0.85);
      const retail = Number(u.priceRetail || 0);
      brMap[bId].count += 1;
      brMap[bId].totalModal += modal;
      brMap[bId].totalRetail += retail;
    });
    const branchStats = Object.values(brMap);

    return {
      availableUnits: available,
      totalUnits: available.length,
      totalHpp,
      totalRetail,
      potentialGrossProfit,
      potentialMarginPercent,
      avgHppPerUnit,
      categoryStats,
      signalStats,
      branchStats
    };
  }, [branchFilteredUnits, branches]);

  // Filtered Units for Stock Opname Sheet
  const filteredOpnameUnits = useMemo(() => {
    return branchFilteredUnits.filter(u => {
      if (!u) return false;

      // Status filter
      if (opnameStatusFilter !== 'all' && u.status !== opnameStatusFilter) {
        return false;
      }

      // Category filter
      if (opnameCategoryFilter !== 'all' && u.category !== opnameCategoryFilter) {
        return false;
      }

      // Verification filter
      const isChecked = checkedOpnameImeis.includes(u.imei || u.id);
      if (opnameVerificationFilter === 'verified' && !isChecked) return false;
      if (opnameVerificationFilter === 'unverified' && isChecked) return false;

      // Search query
      if (opnameSearchQuery.trim()) {
        const q = opnameSearchQuery.toLowerCase();
        const matchName = (u.modelName || '').toLowerCase().includes(q);
        const matchImei = (u.imei || '').toLowerCase().includes(q);
        const matchSn = (u.serialNumber || '').toLowerCase().includes(q);
        const matchBarcode = (u.barcodeCode || '').toLowerCase().includes(q);
        const matchColor = (u.color || '').toLowerCase().includes(q);
        const matchStorage = (u.storage || '').toLowerCase().includes(q);
        if (!matchName && !matchImei && !matchSn && !matchBarcode && !matchColor && !matchStorage) {
          return false;
        }
      }

      return true;
    });
  }, [branchFilteredUnits, opnameStatusFilter, opnameCategoryFilter, opnameVerificationFilter, opnameSearchQuery, checkedOpnameImeis]);

  // Opname Progress Count
  const opnameVerifiedCount = useMemo(() => {
    const availableIds = new Set(inventoryValuation.availableUnits.map(u => u.imei || u.id));
    return checkedOpnameImeis.filter(id => availableIds.has(id)).length;
  }, [checkedOpnameImeis, inventoryValuation.availableUnits]);

  const handleCheckAllVisibleOpname = () => {
    const ids = filteredOpnameUnits.map(u => u.imei || u.id);
    setCheckedOpnameImeis(prev => Array.from(new Set([...prev, ...ids])));
    showToast(`${filteredOpnameUnits.length} unit berhasil diverifikasi fisik.`, 'success');
  };

  const handleExportOpnameCsv = () => {
    const headers = [
      'No',
      'Status Audit Opname',
      'IMEI (Excel Safe)',
      'Serial Number',
      'Barcode',
      'Nama Model & Unit',
      'Kategori',
      'Varian Warna & Storage',
      'Kondisi & BH',
      'Asal Sinyal & Garansi',
      'Cabang Toko',
      'Status Fisik',
      'HPP Modal (Rp)',
      'Harga Retail (Rp)',
      'Estimasi Margin (Rp)'
    ];

    const rows = filteredOpnameUnits.map((u, idx) => {
      const isChecked = checkedOpnameImeis.includes(u.imei || u.id);
      const branchName = branches.find(b => b.id === u.branchId)?.name || 'Cabang Surabaya Pusat';
      const modal = Number(u.priceModal || (u.priceRetail || 0) * 0.85);
      const retail = Number(u.priceRetail || 0);
      const margin = retail - modal;
      return [
        idx + 1,
        isChecked ? 'MATCH FISIK (TERVERIFIKASI)' : 'BELUM DICEK',
        `"'${u.imei || '-'}"`, // Escaped with single quote to preserve 15-digit Apple IMEI in Excel!
        `"${u.serialNumber || '-'}"`,
        `"${u.barcodeCode || '-'}"`,
        `"${(u.modelName || '').replace(/"/g, '""')}"`,
        `"${u.category || 'iphone'}"`,
        `"${u.color || '-'} / ${u.storage || '-'}"`,
        `"${u.condition || '-'} (${u.batteryHealth ? `BH ${u.batteryHealth}%` : '-'})"`,
        `"${(u.signalOrigin || '-').replace(/"/g, '""')}"`,
        `"${branchName.replace(/"/g, '""')}"`,
        u.status === 'available' ? 'Tersedia di Toko' : 'Sudah Terjual',
        modal,
        retail,
        margin
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Laporan_Valuasi_Stok_Opname_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Lembar kerja Stok Opname berhasil diekspor ke format Excel CSV!', 'success');
  };

  // Navigation states
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const matched = MENU_GROUPS.find(g => g.tabs.some(t => t.id === activeTab));
    return matched ? matched.id : 'finance';
  });

  const [menuViewMode, setMenuViewMode] = useState(() => {
    try {
      return localStorage.getItem('iconicstore_owner_nav_mode') || 'segmented';
    } catch (e) {
      return 'segmented';
    }
  });

  const toggleMenuViewMode = () => {
    const nextMode = menuViewMode === 'segmented' ? 'grid' : 'segmented';
    setMenuViewMode(nextMode);
    try {
      localStorage.setItem('iconicstore_owner_nav_mode', nextMode);
    } catch (e) {}
  };

  // Keep selected category synchronized with activeTab
  useEffect(() => {
    const currentGroup = MENU_GROUPS.find(g => g.tabs.some(t => t.id === activeTab));
    if (currentGroup && currentGroup.id !== selectedCategory) {
      setSelectedCategory(currentGroup.id);
    }
  }, [activeTab]);

  const handleCategoryClick = (groupId) => {
    setSelectedCategory(groupId);
    const group = MENU_GROUPS.find(g => g.id === groupId);
    if (group && !group.tabs.some(t => t.id === activeTab)) {
      setActiveTab(group.tabs[0].id);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '80px' }}>
      
      {/* Top Banner Header for Executive Owner */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="portal-container">
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', background: 'rgba(10, 132, 255, 0.15)', color: 'var(--accent)', border: '1px solid rgba(10, 132, 255, 0.3)', padding: '3px 8px', borderRadius: '999px' }}>
                  Portal Eksekutif &amp; Owner
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  Akses Terproteksi PIN
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Executive Business Dashboard
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                Kendali penuh omzet, laba bersih (HPP), rekonsiliasi kas laci kasir, performa cabang, dan valuasi aset stok Apple.
              </p>
            </div>

            {/* Global Date & Branch Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              
              {/* Branch Selector */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', gap: '8px' }}>
                <Store style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  <option value="all" style={{ background: '#15171B' }}>Semua Outlet</option>
                  <option value="b1" style={{ background: '#15171B' }}>Cabang Surabaya Pusat</option>
                  <option value="b2" style={{ background: '#15171B' }}>Cabang Malang Town Square</option>
                </select>
              </div>

              {/* Date Range Selector */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', gap: '8px' }}>
                <Calendar style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  <option value="all" style={{ background: '#15171B' }}>Semua Waktu</option>
                  <option value="today" style={{ background: '#15171B' }}>Hari Ini</option>
                  <option value="7days" style={{ background: '#15171B' }}>7 Hari Terakhir</option>
                  <option value="month" style={{ background: '#15171B' }}>Bulan Ini (Oktober 2026)</option>
                </select>
              </div>

              {/* CSV Export Button */}
              <button
                type="button"
                onClick={handleExportCsv}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--accent)',
                  color: 'var(--accent-ink)',
                  border: 'none',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Download style={{ width: '14px', height: '14px' }} />
                <span>Ekspor CSV</span>
              </button>

              {onLockOwnerPortal && (
                <button
                  type="button"
                  onClick={onLockOwnerPortal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 69, 58, 0.12)',
                    color: '#FF453A',
                    border: '1px solid rgba(255, 69, 58, 0.3)',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                  title="Kunci Dashboard Owner (Mencegah Akses Staf)"
                >
                  <Lock style={{ width: '14px', height: '14px' }} />
                  <span>Kunci Dashboard</span>
                </button>
              )}

            </div>
          </div>

          {/* Sub Navigation Bar - Apple Glass Structured Menu */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            
            {/* Top Row: Category Segment Pills & View Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              
              {/* Category Segmented Capsule */}
              <div 
                className="mobile-touch-scroll"
                style={{
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '4px',
                  gap: '4px',
                  maxWidth: '100%',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {MENU_GROUPS.map(group => {
                  const Icon = group.icon;
                  const isGroupActive = selectedCategory === group.id;
                  const hasActiveTab = group.tabs.some(t => t.id === activeTab);
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleCategoryClick(group.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        gap: '8px',
                        padding: '7px 14px',
                        borderRadius: '7px',
                        fontSize: '12.5px',
                        fontWeight: isGroupActive ? '700' : '500',
                        background: isGroupActive ? 'var(--surface-2)' : 'transparent',
                        border: isGroupActive ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                        color: isGroupActive ? 'var(--text)' : 'var(--text-dim)',
                        cursor: 'pointer',
                        transition: 'all .15s ease',
                        boxShadow: isGroupActive ? '0 2px 8px rgba(0,0,0,0.25)' : 'none'
                      }}
                    >
                      <Icon style={{ width: '14px', height: '14px', color: isGroupActive ? 'var(--accent)' : 'var(--text-dim)', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap' }}>{group.label}</span>
                      {group.badge && (
                        <span style={{ fontSize: '10px', background: '#FF453A', color: '#FFFFFF', padding: '1px 6px', borderRadius: '999px', fontWeight: '800' }}>
                          {group.badge}
                        </span>
                      )}
                      {hasActiveTab && !isGroupActive && (
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View Switcher: Fokus vs Grid Semua Menu */}
              <button
                type="button"
                onClick={toggleMenuViewMode}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: menuViewMode === 'grid' ? 'rgba(10, 132, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: menuViewMode === 'grid' ? '1px solid rgba(10, 132, 255, 0.4)' : '1px solid var(--border)',
                  color: menuViewMode === 'grid' ? 'var(--accent)' : 'var(--text-dim)',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all .15s ease'
                }}
                title={menuViewMode === 'segmented' ? 'Tampilkan semua 10 menu dalam grid 3-kolom rapi' : 'Kembali ke mode fokus kategori'}
              >
                {menuViewMode === 'segmented' ? (
                  <>
                    <LayoutGrid style={{ width: '13px', height: '13px' }} />
                    <span>Tampilkan Semua (10 Menu)</span>
                  </>
                ) : (
                  <>
                    <List style={{ width: '13px', height: '13px' }} />
                    <span>Mode Fokus Kategori</span>
                  </>
                )}
              </button>

            </div>

            {/* Mode 1: Sub-Menu Bar Rapi (Fokus Kategori) */}
            {menuViewMode === 'segmented' && (
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '8px 10px'
              }}>
                {MENU_GROUPS.find(g => g.id === selectedCategory)?.tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: isActive ? '700' : '500',
                        background: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.04)',
                        border: isActive ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid var(--border)',
                        color: isActive ? '#FFFFFF' : 'var(--text)',
                        cursor: 'pointer',
                        transition: 'all .15s ease',
                        boxShadow: isActive ? '0 2px 10px rgba(10, 132, 255, 0.35)' : 'none'
                      }}
                    >
                      <Icon style={{ width: '15px', height: '15px', color: isActive ? '#FFFFFF' : 'var(--text-dim)' }} />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span style={{ fontSize: '10px', background: '#FF453A', color: '#FFFFFF', padding: '1px 6px', borderRadius: '999px', fontWeight: '800' }}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mode 2: Grid 3-Kolom Sempurna (Semua Menu) */}
            {menuViewMode === 'grid' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px'
              }}>
                {MENU_GROUPS.map(group => {
                  const GroupIcon = group.icon;
                  return (
                    <div
                      key={group.id}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: 'var(--accent)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GroupIcon style={{ width: '13px', height: '13px' }} />
                          <span>{group.label}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>
                          {group.tabs.length} Menu
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {group.tabs.map(tab => {
                          const TabIcon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                setActiveTab(tab.id);
                                setSelectedCategory(group.id);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: '7px',
                                fontSize: '12px',
                                fontWeight: isActive ? '700' : '500',
                                background: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.03)',
                                border: isActive ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                                color: isActive ? '#FFFFFF' : 'var(--text)',
                                cursor: 'pointer',
                                transition: 'all .15s ease',
                                textAlign: 'left',
                                boxShadow: isActive ? '0 2px 8px rgba(10, 132, 255, 0.35)' : 'none'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TabIcon style={{ width: '14px', height: '14px', color: isActive ? '#FFFFFF' : 'var(--text-dim)' }} />
                                <span>{tab.label}</span>
                              </div>
                              {tab.badge && (
                                <span style={{ fontSize: '10px', background: '#FF453A', color: '#FFFFFF', padding: '1px 6px', borderRadius: '999px', fontWeight: '800' }}>
                                  {tab.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="portal-container" style={{ paddingTop: '20px', paddingBottom: '32px' }}>
        
        {/* ========================================================================= */}
        {/* TAB 1: ANALISIS PENJUALAN & MARGIN                                        */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top 5 Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              
              {/* Omzet Penjualan */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Total Omzet Penjualan</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <DollarSign style={{ width: '16px', height: '16px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px' }}>
                  {formatRupiah(analytics.totalRevenue)}
                </div>
                <div style={{ fontSize: '11px', color: '#30D158', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight style={{ width: '13px', height: '13px' }} />
                  <span>{analytics.txCount} Transaksi Selesai</span>
                </div>
              </div>

              {/* Total HPP Modal */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Total HPP Modal (COGS)</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 159, 10, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9F0A' }}>
                    <Package style={{ width: '16px', height: '16px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px' }}>
                  {formatRupiah(analytics.totalHpp)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Modal Pokok Unit Serialized
                </div>
              </div>

              {/* Laba Bersih Kotor */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Laba Kotor (Gross Profit)</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158' }}>
                    <TrendingUp style={{ width: '16px', height: '16px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#30D158', letterSpacing: '-0.5px' }}>
                  {formatRupiah(analytics.grossProfit)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Margin Bersih: <span style={{ color: '#30D158', fontWeight: '700' }}>{analytics.profitMargin.toFixed(1)}%</span>
                </div>
              </div>

              {/* Valuasi Aset Stok Fisik */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Valuasi Aset Stok Toko</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(192, 132, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C084FC' }}>
                    <Layers style={{ width: '16px', height: '16px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.5px' }}>
                  {formatRupiah(analytics.totalInventoryValue)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  {analytics.availableStockCount} Unit Fisik di Etalase
                </div>
              </div>

            </div>

            {/* Visual Analytics 2-Column: Category Breakdown & Retail vs Reseller Composition */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              
              {/* Category Breakdown Bar Chart */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>Kontribusi Penjualan per Kategori</h3>
                <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-dim)' }}>Volume unit Apple yang terjual</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'iPhone', count: analytics.categoryCounts.iphone, color: '#0A84FF' },
                    { label: 'MacBook', count: analytics.categoryCounts.macbook, color: '#30D158' },
                    { label: 'iPad', count: analytics.categoryCounts.ipad, color: '#FF9F0A' },
                    { label: 'Apple Watch', count: analytics.categoryCounts.watch, color: '#C084FC' },
                    { label: 'AirPods & Aksesoris', count: analytics.categoryCounts.audio, color: '#64748B' }
                  ].map(cat => {
                    const totalCount = analytics.totalUnitsSold || 1;
                    const pct = Math.round((cat.count / totalCount) * 100);
                    return (
                      <div key={cat.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '600' }}>{cat.label}</span>
                          <span style={{ color: 'var(--text-dim)' }}>{cat.count} Unit ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: cat.color, borderRadius: '999px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Retail vs Reseller Channel Breakdown */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>Komposisi Jalur Penjualan</h3>
                <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-dim)' }}>Perbandingan Penjualan End-User vs Reseller Grosir</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Retail Card */}
                  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>Penjualan Retail (End-User)</span>
                      <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '700' }}>
                        {analytics.totalRevenue > 0 ? Math.round((analytics.retailRevenue / analytics.totalRevenue) * 100) : 0}%
                      </span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
                      {formatRupiah(analytics.retailRevenue)}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Margin rata-rata lebih tinggi (+15-20%)</span>
                  </div>

                  {/* Reseller Card */}
                  <div style={{ background: 'rgba(147, 51, 234, 0.08)', border: '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#C084FC' }}>Penjualan Reseller (Mitra Grosir)</span>
                      <span style={{ fontSize: '12px', color: '#C084FC', fontWeight: '700' }}>
                        {analytics.totalRevenue > 0 ? Math.round((analytics.resellerRevenue / analytics.totalRevenue) * 100) : 0}%
                      </span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
                      {formatRupiah(analytics.resellerRevenue)}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Perputaran stok cepat &amp; cashflow lancar</span>
                  </div>

                </div>
              </div>

            </div>

            {/* Smart Owner Insights Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.12), rgba(147, 51, 234, 0.08))',
              border: '1px solid rgba(10, 132, 255, 0.25)',
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Executive Decision Insight
                </span>
                <h4 style={{ margin: '4px 0', fontSize: '15px', fontWeight: '700' }}>
                  Model iPhone 15 Pro &amp; 14 Pro menyumbang 65% keuntungan kotor minggu ini.
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>
                  Disarankan memperbanyak alokasi modal kulakan pada varian 128GB dan 256GB Grade A+ Resmi iBox.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Lihat Rekap Lengkap
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LAPORAN PENJUALAN                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Payment Method Breakdown Box */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700' }}>
                Rekap Penerimaan Pembayaran (Settlement Kas Toko)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                
                <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    <Banknote style={{ width: '16px', height: '16px', color: '#30D158' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>Uang Tunai (Cash)</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{formatRupiah(analytics.paymentCounts.tunai)}</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Wajib klop dengan laci kasir</span>
                </div>

                <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    <QrCode style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>QRIS Statis/Dinamis</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{formatRupiah(analytics.paymentCounts.qris)}</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Settlement H+1 Otomatis</span>
                </div>

                <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    <CreditCard style={{ width: '16px', height: '16px', color: '#FF9F0A' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>Mesin EDC (Debit/Kredit)</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{formatRupiah(analytics.paymentCounts.edc)}</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>BCA &amp; Mandiri EDC Toko</span>
                </div>

                <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    <DollarSign style={{ width: '16px', height: '16px', color: '#C084FC' }} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>Transfer Bank Rekening</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{formatRupiah(analytics.paymentCounts.transfer)}</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Rekening BCA Resmi Toko</span>
                </div>

              </div>
            </div>

            {/* Detailed Sales Report Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                  Laporan Rekap Transaksi ({filteredSales.length} Transaksi Ditemukan)
                </h3>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Download style={{ width: '13px', height: '13px' }} />
                  <span>Download Excel/CSV</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="tidy-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>No. Nota</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Tanggal &amp; Jam</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Cabang Toko</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Pelanggan</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Tipe</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Metode</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Total Bayar</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--accent)' }}>
                          {tx.id}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-dim)' }}>{tx.date}</td>
                        <td style={{ padding: '12px' }}>{tx.branchName || 'Cabang Surabaya Pusat'}</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{tx.customerName}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: tx.pricingMode === 'reseller' ? 'rgba(147, 51, 234, 0.15)' : 'rgba(10, 132, 255, 0.15)',
                            color: tx.pricingMode === 'reseller' ? '#C084FC' : 'var(--accent)'
                          }}>
                            {tx.pricingMode === 'reseller' ? 'Reseller' : 'Retail'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-dim)' }}>
                          {tx.paymentMethod}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '800' }}>
                          {formatRupiah(tx.total)}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(tx)}
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            Detail Struk
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RIWAYAT PENJUALAN LENGKAP                                          */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Search Toolbar */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Cari nomor nota, nama pembeli, atau IMEI unit yang terjual..."
                  value={searchHistoryQuery}
                  onChange={(e) => setSearchHistoryQuery(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    borderRadius: '8px',
                    padding: '10px 14px 10px 38px'
                  }}
                />
              </div>
            </div>

            {/* Transaction Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredSales
                .filter(tx => {
                  if (!searchHistoryQuery.trim()) return true;
                  const q = searchHistoryQuery.toLowerCase();
                  return (
                    tx.id.toLowerCase().includes(q) ||
                    tx.customerName.toLowerCase().includes(q) ||
                    tx.items.some(it => it.modelName.toLowerCase().includes(q) || it.imei?.includes(q))
                  );
                })
                .map(tx => (
                  <div key={tx.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '13px', color: 'var(--accent)' }}>
                          {tx.id}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{tx.date}</span>
                        <span style={{ fontSize: '11px', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px' }}>
                          {tx.branchName}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Kasir: {tx.cashierName}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(tx)}
                          style={{
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Printer style={{ width: '13px', height: '13px' }} />
                          <span>Cetak Struk Thermal</span>
                        </button>
                      </div>
                    </div>

                    {/* Customer & Items Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Pelanggan:</span>
                        <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>{tx.customerName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Telp: {tx.customerPhone}</div>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Perangkat Terjual:</span>
                        <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {tx.items.map(it => (
                            <div key={it.id || it.imei} style={{ fontSize: '12px', background: 'var(--surface-2)', padding: '6px 10px', borderRadius: '6px' }}>
                              <span style={{ fontWeight: '600' }}>{it.modelName}</span>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                                IMEI: {it.imei} | HPP Modal: {formatRupiah(it.priceModal || 0)} | Jual: {formatRupiah(it.appliedPrice)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Total Transaksi:</span>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', marginTop: '2px' }}>
                          {formatRupiah(tx.total)}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          Metode: {tx.paymentMethod}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LAPORAN TUTUP SHIFT (Z-REPORT)                                     */}
        {/* ========================================================================= */}
        {activeTab === 'shifts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700' }}>
                  Rekonsiliasi Kas Laci &amp; Laporan Z-Report Harian
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>
                  Audit uang fisik laci kasir setiap pergantian shift untuk mencegah kecurangan (*cash leakage*).
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="tidy-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>ID Shift</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Waktu Tutup</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Cabang Toko</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600' }}>Kasir</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Modal Kas Awal</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Penjualan Tunai</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Uang Fisik Kasir</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'center' }}>Selisih Kas</th>
                      <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(shiftReports) ? shiftReports : []).map(sr => (
                      <tr key={sr.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{sr.id}</td>
                        <td style={{ padding: '12px', color: 'var(--text-dim)' }}>{sr.date}</td>
                        <td style={{ padding: '12px' }}>{sr.branchName}</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{sr.cashier}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{formatRupiah(sr.startingCash)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#30D158', fontWeight: '600' }}>+{formatRupiah(sr.cashSales)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700' }}>{formatRupiah(sr.actualCash)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: sr.diff === 0 ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 69, 58, 0.15)',
                            color: sr.diff === 0 ? '#30D158' : '#FF453A',
                            border: `1px solid ${sr.diff === 0 ? 'rgba(48, 209, 88, 0.3)' : 'rgba(255, 69, 58, 0.3)'}`
                          }}>
                            {sr.diff === 0 ? 'Seimbang (Rp 0)' : `${formatRupiah(sr.diff)}`}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedShiftDetail(sr)}
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            Tinjau Z-Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PERFORMANCE TIAP OUTLET                                            */}
        {/* ========================================================================= */}
        {activeTab === 'outlets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: '700' }}>Pengaturan Cabang & Performa Outlet</h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>
                  Tambah, ubah nama/alamat, atau hapus cabang. Total {(branches || []).length} cabang aktif.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBranchForm({ name: '', address: '', phone: '' })}
                className="btn btn-primary text-xs font-bold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus style={{ width: '14px', height: '14px' }} />
                <span>Tambah Cabang</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {(branches || []).map((br, idx) => {
                const palette = [
                  { color: 'var(--accent)', bg: 'var(--surface-2)' },
                  { color: '#C084FC', bg: 'rgba(147, 51, 234, 0.1)' },
                  { color: '#30D158', bg: 'rgba(48, 209, 88, 0.1)' },
                  { color: '#FF9F0A', bg: 'rgba(255, 159, 10, 0.1)' }
                ][idx % 4];
                const brSales = (salesHistory || []).filter(s => s.branchId === br.id);
                const brOmzet = brSales.reduce((a, b) => a + (b.total || 0), 0);
                const brSold = brSales.reduce((a, b) => a + ((b.items && b.items.length) || 0), 0);
                const brStock = (units || []).filter(u => u.branchId === br.id && u.status === 'available').length;
                const turnoverPct = brSold + brStock > 0 ? Math.round((brSold / (brSold + brStock)) * 100) : 0;
                const turnoverLabel = turnoverPct >= 60 ? 'Tinggi' : turnoverPct >= 30 ? 'Optimal' : 'Rendah';

                return (
                  <div key={br.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '700', color: palette.color, background: palette.bg, padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                          Cabang #{idx + 1}{idx === 0 ? ' (Headquarters)' : ''}
                        </span>
                        <h3 style={{ margin: '6px 0 2px', fontSize: '18px', fontWeight: '800', overflowWrap: 'anywhere' }}>{br.name}</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)', overflowWrap: 'anywhere' }}>{br.address || 'Alamat belum diisi'}</p>
                        {br.phone && (
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>Telp/WA: {br.phone}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => setBranchForm({ ...br })}
                          title="Edit data cabang"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          <Edit2 style={{ width: '12px', height: '12px', color: 'var(--accent)' }} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if ((branches || []).length <= 1) {
                              showToast('Minimal harus ada satu cabang aktif. Tambah cabang lain sebelum menghapus yang ini.', 'warning', 'Cabang Terakhir');
                              return;
                            }
                            if (brStock > 0) {
                              showToast(`Masih ada ${brStock} unit stok fisik di ${br.name}. Pindahkan atau jual stok tersebut sebelum menghapus cabang.`, 'warning', 'Cabang Masih Memiliki Stok');
                              return;
                            }
                            setDeletingBranch(br);
                          }}
                          title="Hapus cabang"
                          style={{ background: 'rgba(255, 69, 58, 0.12)', border: '1px solid rgba(255, 69, 58, 0.3)', color: '#FF453A', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          <Trash2 style={{ width: '12px', height: '12px' }} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                      <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Omzet Penjualan:</span>
                        <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px', whiteSpace: 'nowrap' }}>{formatRupiah(brOmzet)}</div>
                      </div>
                      <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Unit Terjual:</span>
                        <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px', color: '#30D158', whiteSpace: 'nowrap' }}>{brSold} Unit</div>
                      </div>
                      <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Stok Fisik Tersedia:</span>
                        <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px', whiteSpace: 'nowrap' }}>{brStock} Unit</div>
                      </div>
                      <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Turnover Rate:</span>
                        <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '2px', color: 'var(--accent)', whiteSpace: 'nowrap' }}>{turnoverLabel} ({turnoverPct}%)</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: LAPORAN VALUASI & STOK OPNAME FISIK (EXECUTIVE INVENTORY REPORT)     */}
        {/* ========================================================================= */}
        {activeTab === 'inventory_report' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top Overview & Action Banner */}
            <div style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              padding: '24px 28px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(10, 132, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)'
                }}>
                  <Boxes style={{ width: '26px', height: '26px' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px' }}>
                      Laporan Valuasi Aset &amp; Stok Opname
                    </h3>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      padding: '3px 8px', 
                      borderRadius: '6px', 
                      background: 'rgba(10, 132, 255, 0.12)', 
                      color: 'var(--accent)',
                      border: '1px solid rgba(10, 132, 255, 0.25)'
                    }}>
                      {branchFilter === 'all' ? 'Seluruh Cabang' : branches.find(b => b.id === branchFilter)?.name || 'Cabang'}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                    Ringkasan eksekutif modal tertanam (HPP), potensi omzet retail, sebaran sinyal/garansi unit, dan lembar checklist audit fisik per outlet.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleExportOpnameCsv}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: 'var(--accent)',
                    color: '#FFF',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(10, 132, 255, 0.3)',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <FileSpreadsheet style={{ width: '16px', height: '16px' }} />
                  Ekspor Lembar Opname (CSV Excel)
                </button>

                <button
                  type="button"
                  onClick={handleResetOpnameChecks}
                  title="Reset status centang verifikasi opname untuk sesi audit baru"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'var(--surface-2)',
                    color: 'var(--text-dim)',
                    border: '1px solid var(--border)',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw style={{ width: '14px', height: '14px' }} />
                  Reset Centang
                </button>
              </div>
            </div>

            {/* 4 Executive Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              
              {/* Card 1: Total Modal Stok (HPP) */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Modal Stok (HPP)
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(10, 132, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A84FF' }}>
                    <DollarSign style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#0A84FF' }}>
                  {formatRupiah(inventoryValuation.totalHpp)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Aset modal tertanam pada {inventoryValuation.totalUnits} unit ready
                </div>
              </div>

              {/* Card 2: Potensi Nilai Jual Retail */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Potensi Nilai Jual Retail
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(191, 90, 242, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BF5AF2' }}>
                    <TrendingUp style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#BF5AF2' }}>
                  {formatRupiah(inventoryValuation.totalRetail)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Estimasi bruto jika seluruh stok terjual
                </div>
              </div>

              {/* Card 3: Proyeksi Margin Laba Kotor */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Proyeksi Margin Laba
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(48, 209, 88, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158' }}>
                    <Award style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#30D158' }}>
                  {formatRupiah(inventoryValuation.potentialGrossProfit)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    background: 'rgba(48, 209, 88, 0.15)', 
                    color: '#30D158' 
                  }}>
                    +{inventoryValuation.potentialMarginPercent.toFixed(1)}% Rata-rata
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>keuntungan tertanam</span>
                </div>
              </div>

              {/* Card 4: Unit Fisik Tersedia & Audit Opname */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Unit Fisik &amp; Audit Opname
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 159, 10, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9F0A' }}>
                    <Package style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#FF9F0A' }}>
                  {inventoryValuation.totalUnits} Unit Ready
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Rata-rata modal: {formatRupiah(inventoryValuation.avgHppPerUnit)} / unit
                </div>
              </div>

            </div>

            {/* 3 Portfolio Distribution Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Panel 1: Komposisi Nilai Aset per Kategori */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Layers style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                    Komposisi Nilai Aset per Kategori
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {inventoryValuation.categoryStats.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                      Tidak ada data unit tersedia.
                    </div>
                  ) : (
                    inventoryValuation.categoryStats.map(cat => (
                      <div key={cat.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '13px' }}>
                          <span style={{ fontWeight: '700', textTransform: 'capitalize' }}>
                            {cat.category} ({cat.count} unit)
                          </span>
                          <span style={{ fontWeight: '700', color: 'var(--accent)' }}>
                            {formatRupiah(cat.totalModal)}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '7px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${cat.portion}%`, 
                              height: '100%', 
                              background: 'linear-gradient(90deg, #0A84FF, #5E5CE6)', 
                              borderRadius: '4px' 
                            }} 
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                          <span>Porsi modal: {cat.portion.toFixed(1)}%</span>
                          <span style={{ color: '#30D158', fontWeight: '600' }}>Est. Margin: {cat.margin.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Panel 2: Sebaran Asal Sinyal & Garansi Apple */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <ShieldCheck style={{ width: '18px', height: '18px', color: '#30D158' }} />
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                    Sebaran Asal Sinyal &amp; Kepatuhan Bea Cukai
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {inventoryValuation.signalStats.map(sig => (
                    <div key={sig.label} style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sig.badgeColor }} />
                          <span style={{ fontSize: '13px', fontWeight: '700' }}>{sig.label}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '14px' }}>
                          {sig.count} Unit Ready Fisik
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: sig.badgeColor }}>
                          {formatRupiah(sig.totalModal)}
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                          Retail: {formatRupiah(sig.totalRetail)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 3: Distribusi Stok per Cabang Toko */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Store style={{ width: '18px', height: '18px', color: '#FF9F0A' }} />
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                    Sebaran Modal per Cabang Outlet
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {inventoryValuation.branchStats.map(br => (
                    <div key={br.id} style={{ background: 'var(--surface-2)', padding: '12px 14px', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>{br.name}</span>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent)' }}>
                          {br.count} Unit
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                        <span>Aset Modal: <strong>{formatRupiah(br.totalModal)}</strong></span>
                        <span>Potensi Retail: <strong>{formatRupiah(br.totalRetail)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* LEMBAR KERJA STOK OPNAME FISIK */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', overflow: 'hidden' }}>
              
              {/* Header Lembar Opname & Progress Checklist */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                      Lembar Kerja Audit Stok Opname Fisik
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: opnameVerifiedCount === inventoryValuation.totalUnits && inventoryValuation.totalUnits > 0
                        ? 'rgba(48, 209, 88, 0.15)'
                        : 'rgba(255, 159, 10, 0.15)',
                      color: opnameVerifiedCount === inventoryValuation.totalUnits && inventoryValuation.totalUnits > 0
                        ? '#30D158'
                        : '#FF9F0A',
                      border: '1px solid currentColor'
                    }}>
                      {opnameVerifiedCount} / {inventoryValuation.totalUnits} Unit Match ({inventoryValuation.totalUnits > 0 ? Math.round((opnameVerifiedCount / inventoryValuation.totalUnits) * 100) : 0}%)
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>
                    Bandingkan unit fisik di toko/etalase dengan data sistem. Klik checkbox pada baris unit untuk menandai kecocokan fisik. Status tersimpan otomatis.
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCheckAllVisibleOpname}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(48, 209, 88, 0.12)',
                      color: '#30D158',
                      border: '1px solid rgba(48, 209, 88, 0.25)',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCheck style={{ width: '15px', height: '15px' }} />
                    Tandai Semua Sesuai ({filteredOpnameUnits.length})
                  </button>

                  <button
                    type="button"
                    onClick={handleResetOpnameChecks}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--surface-2)',
                      color: 'var(--text-dim)',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw style={{ width: '13px', height: '13px' }} />
                    Reset Centang
                  </button>
                </div>
              </div>

              {/* Progress Bar Audit */}
              <div style={{ width: '100%', height: '6px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
                <div 
                  style={{ 
                    width: `${inventoryValuation.totalUnits > 0 ? (opnameVerifiedCount / inventoryValuation.totalUnits) * 100 : 0}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #30D158, #0A84FF)', 
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>

              {/* Search & Filter Toolbar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '18px' }}>
                
                {/* Search input */}
                <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                  <Search style={{ width: '15px', height: '15px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    value={opnameSearchQuery}
                    onChange={(e) => setOpnameSearchQuery(e.target.value)}
                    placeholder="Cari model, IMEI 15 digit, SN, barcode, warna..."
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: '13px'
                    }}
                  />
                  {opnameSearchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setOpnameSearchQuery('')} 
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                    >
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={opnameCategoryFilter}
                  onChange={(e) => setOpnameCategoryFilter(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Semua Kategori</option>
                  <option value="iphone">iPhone</option>
                  <option value="ipad">iPad</option>
                  <option value="mac">MacBook &amp; Mac</option>
                  <option value="watch">Apple Watch</option>
                  <option value="audio">Audio &amp; AirPods</option>
                </select>

                {/* Status Filter */}
                <select
                  value={opnameStatusFilter}
                  onChange={(e) => setOpnameStatusFilter(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="available">Hanya Stok Ready (Default)</option>
                  <option value="all">Semua Unit (Termasuk Terjual)</option>
                  <option value="sold">Hanya Sudah Terjual</option>
                </select>

                {/* Verification Opname Filter */}
                <select
                  value={opnameVerificationFilter}
                  onChange={(e) => setOpnameVerificationFilter(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Semua Status Audit</option>
                  <option value="verified">Sudah Match Fisik</option>
                  <option value="unverified">Belum Dicek</option>
                </select>

                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: 'auto', fontWeight: '600' }}>
                  Total: {filteredOpnameUnits.length} Unit
                </div>
              </div>

              {/* Table Lembar Opname */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px 10px', textAlign: 'center', width: '44px' }}>Cek</th>
                      <th style={{ padding: '12px 14px' }}>Unit &amp; Varian</th>
                      <th style={{ padding: '12px 14px' }}>Nomor Seri &amp; IMEI</th>
                      <th style={{ padding: '12px 14px' }}>Kondisi &amp; Sinyal</th>
                      <th style={{ padding: '12px 14px' }}>Cabang Toko</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Modal (HPP)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Harga Retail</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Est. Margin</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status Opname</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOpnameUnits.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                          <Package style={{ width: '36px', height: '36px', margin: '0 auto 10px', opacity: 0.4 }} />
                          <div>Tidak ada unit yang cocok dengan filter yang dipilih.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredOpnameUnits.map((u, idx) => {
                        const unitKey = u.imei || u.id;
                        const isVerified = checkedOpnameImeis.includes(unitKey);
                        const modal = Number(u.priceModal || (u.priceRetail || 0) * 0.85);
                        const retail = Number(u.priceRetail || 0);
                        const margin = retail - modal;
                        const branchName = branches.find(b => b.id === u.branchId)?.name || 'Cabang Surabaya Pusat';

                        return (
                          <tr 
                            key={u.id || idx}
                            onClick={() => toggleOpnameCheck(unitKey)}
                            style={{
                              borderBottom: '1px solid var(--border)',
                              background: isVerified ? 'rgba(48, 209, 88, 0.04)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background 0.15s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = isVerified ? 'rgba(48, 209, 88, 0.08)' : 'var(--surface-2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = isVerified ? 'rgba(48, 209, 88, 0.04)' : 'transparent'}
                          >
                            {/* Checkbox */}
                            <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleOpnameCheck(unitKey);
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  color: isVerified ? '#30D158' : 'var(--text-dim)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {isVerified ? (
                                  <CheckSquare style={{ width: '20px', height: '20px' }} />
                                ) : (
                                  <Square style={{ width: '20px', height: '20px' }} />
                                )}
                              </button>
                            </td>

                            {/* Unit Model & Variant */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: '700', fontSize: '13px', color: isVerified ? '#30D158' : 'var(--text)' }}>
                                {u.modelName || 'Apple Device'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                {u.color || '-'} • {u.storage || '-'} • {u.category || 'iphone'}
                              </div>
                            </td>

                            {/* IMEI & Barcode */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '12px', color: 'var(--accent)' }}>
                                IMEI: {u.imei || '-'}
                              </div>
                              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                BC: {u.barcodeCode || '-'} {u.serialNumber ? `• SN: ${u.serialNumber}` : ''}
                              </div>
                            </td>

                            {/* Condition & Signal Origin */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontSize: '12px', fontWeight: '600' }}>
                                {u.condition || '-'} {u.batteryHealth ? `(BH ${u.batteryHealth}%)` : ''}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                {u.signalOrigin || '-'}
                              </div>
                            </td>

                            {/* Branch */}
                            <td style={{ padding: '12px 14px', fontSize: '12px' }}>
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                background: 'var(--surface-2)', 
                                border: '1px solid var(--border)',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {branchName}
                              </span>
                            </td>

                            {/* Modal HPP */}
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700' }}>
                              {formatRupiah(modal)}
                            </td>

                            {/* Retail Price */}
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: 'var(--accent)' }}>
                              {formatRupiah(retail)}
                            </td>

                            {/* Margin */}
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: '#30D158' }}>
                              +{formatRupiah(margin)}
                            </td>

                            {/* Opname Status */}
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              {isVerified ? (
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(48, 209, 88, 0.15)',
                                  color: '#30D158',
                                  border: '1px solid rgba(48, 209, 88, 0.3)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                                  MATCH FISIK
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  background: 'var(--surface-2)',
                                  color: 'var(--text-dim)',
                                  border: '1px solid var(--border)'
                                }}>
                                  BELUM DICEK
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB PURCHASES: PEMBELIAN STOK & FAKTUR KULAKAN SUPPLIER (INBOUND PO)     */}
        {/* ========================================================================= */}
        {activeTab === 'purchases' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck style={{ width: '22px', height: '22px', color: '#30D158' }} />
                  <span>Pembelian Stok &amp; Faktur Vendor (Inbound PO)</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                  Pencatatan faktur kulakan partai dari supplier, kontrol pembayaran tempo/hutang dagang, dan penerimaan unit ke inventaris.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddPurchaseModalOpen(true)}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: 'var(--accent)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(10, 132, 255, 0.35)'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Catat Faktur Kulakan Baru</span>
              </button>
            </div>

            {/* Executive Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Total Nilai Kulakan</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158' }}>
                    <DollarSign style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(poMetrics.totalAmount)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Akumulasi HPP belanja supplier
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Total Unit Masuk</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <Package style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {poMetrics.totalUnits} <span style={{ fontSize: '14px', fontWeight: '600' }}>Unit</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Total kuantiti fisik kulakan
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid rgba(255, 159, 10, 0.3)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#FF9F0A', fontWeight: '700' }}>Hutang Tempo Vendor</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 159, 10, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9F0A' }}>
                    <Clock style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#FF9F0A', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(poMetrics.pendingDebt)}
                </div>
                <div style={{ fontSize: '11px', color: '#FF9F0A', marginTop: '4px', fontWeight: '600' }}>
                  {poMetrics.pendingCount} Faktur jatuh tempo
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Faktur Kulakan</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(191, 90, 242, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BF5AF2' }}>
                    <FileText style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {purchaseOrders.length} <span style={{ fontSize: '14px', fontWeight: '600' }}>Faktur</span>
                </div>
                <div style={{ fontSize: '11px', color: '#30D158', marginTop: '4px', fontWeight: '600' }}>
                  {poMetrics.lunasCount} Faktur Lunas
                </div>
              </div>

            </div>

            {/* Filter and Search Bar */}
            <div style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              padding: '16px', 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPoFilterStatus('all')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: poFilterStatus === 'all' ? 'var(--text)' : 'transparent',
                    color: poFilterStatus === 'all' ? 'var(--bg)' : 'var(--text-dim)',
                    borderColor: poFilterStatus === 'all' ? 'var(--text)' : 'var(--border)'
                  }}
                >
                  Semua ({purchaseOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPoFilterStatus('Lunas')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: poFilterStatus === 'Lunas' ? 'rgba(48, 209, 88, 0.2)' : 'transparent',
                    color: poFilterStatus === 'Lunas' ? '#30D158' : 'var(--text-dim)',
                    borderColor: poFilterStatus === 'Lunas' ? 'rgba(48, 209, 88, 0.5)' : 'var(--border)'
                  }}
                >
                  Lunas ({poMetrics.lunasCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPoFilterStatus('Tempo / Hutang')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: poFilterStatus === 'Tempo / Hutang' ? 'rgba(255, 159, 10, 0.2)' : 'transparent',
                    color: poFilterStatus === 'Tempo / Hutang' ? '#FF9F0A' : 'var(--text-dim)',
                    borderColor: poFilterStatus === 'Tempo / Hutang' ? 'rgba(255, 159, 10, 0.5)' : 'var(--border)'
                  }}
                >
                  Tempo / Hutang ({poMetrics.pendingCount})
                </button>

                {branches.length > 1 && (
                  <select
                    value={poBranchFilter}
                    onChange={(e) => setPoBranchFilter(e.target.value)}
                    className="input-field"
                    style={{ padding: '7px 12px', fontSize: '12px', width: 'auto' }}
                  >
                    <option value="all">Semua Cabang Toko</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Cari Supplier, No Faktur, Barang..."
                  value={poSearchQuery}
                  onChange={(e) => setPoSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '32px', fontSize: '12px', width: '100%' }}
                />
              </div>
            </div>

            {/* Inbound Purchase Orders Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>No. Faktur &amp; Tanggal</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Supplier / Vendor</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Gudang Cabang</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Item Kulakan</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Total Nilai (HPP)</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Status Pembayaran</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchaseOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                          <Truck style={{ width: '36px', height: '36px', margin: '0 auto 10px', opacity: 0.4 }} />
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>Belum ada data faktur kulakan supplier</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>Klik tombol "Catat Faktur Kulakan Baru" untuk menginput barang masuk vendor.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredPurchaseOrders.map(po => {
                        const branchObj = branches.find(b => b.id === po.branchId);
                        const isTempo = po.paymentStatus === 'Tempo / Hutang';

                        return (
                          <tr key={po.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '12.5px' }}>
                                {po.invoiceNo}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Calendar style={{ width: '12px', height: '12px' }} />
                                <span>{po.purchaseDate}</span>
                              </div>
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: '700', color: 'var(--text)' }}>
                                {po.supplierName}
                              </div>
                              {po.supplierPhone && (
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone style={{ width: '11px', height: '11px' }} />
                                  <span>{po.supplierPhone}</span>
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                                {branchObj ? branchObj.name : 'Cabang Utama'}
                              </span>
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: '700', color: 'var(--text)' }}>
                                {po.totalItems} Unit Masuk
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {po.items?.map(it => `${it.qty}x ${it.productName}`).join(', ')}
                              </div>
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#30D158' }}>
                                {formatRupiah(po.totalAmount)}
                              </div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                {po.paymentMethod || 'Transfer Bank'}
                              </div>
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              {isTempo ? (
                                <div>
                                  <span style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '5px', 
                                    background: 'rgba(255, 159, 10, 0.15)', 
                                    color: '#FF9F0A', 
                                    border: '1px solid rgba(255, 159, 10, 0.35)', 
                                    padding: '3px 9px', 
                                    borderRadius: '6px', 
                                    fontSize: '11px', 
                                    fontWeight: '700' 
                                  }}>
                                    <Clock style={{ width: '12px', height: '12px' }} />
                                    <span>Tempo / Hutang</span>
                                  </span>
                                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '4px' }}>
                                    Jatuh tempo: {po.dueDate || po.purchaseDate}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '5px', 
                                  background: 'rgba(48, 209, 88, 0.15)', 
                                  color: '#30D158', 
                                  border: '1px solid rgba(48, 209, 88, 0.35)', 
                                  padding: '3px 9px', 
                                  borderRadius: '6px', 
                                  fontSize: '11px', 
                                  fontWeight: '700' 
                                }}>
                                  <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                                  <span>Lunas</span>
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPurchaseDetail(po)}
                                  className="btn btn-secondary text-xs"
                                  style={{ padding: '6px 10px', fontSize: '11.5px', borderRadius: '7px' }}
                                  title="Lihat Rincian Faktur PO"
                                >
                                  <Eye style={{ width: '13px', height: '13px' }} />
                                  <span>Rincian</span>
                                </button>

                                {isTempo && (
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePoPaymentStatus(po.id)}
                                    style={{
                                      background: 'rgba(48, 209, 88, 0.12)',
                                      color: '#30D158',
                                      border: '1px solid rgba(48, 209, 88, 0.3)',
                                      padding: '6px 10px',
                                      borderRadius: '7px',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Tandai Sudah Lunas Dibayar"
                                  >
                                    <Check style={{ width: '13px', height: '13px' }} />
                                    <span>Lunas</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AGING STOCK & RISK RADAR (Masukan Khusus Bisnis Apple)            */}
        {/* ========================================================================= */}
        {activeTab === 'aging' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle style={{ width: '18px', height: '18px', color: '#FF9F0A' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                  Aging Stock &amp; Radar Depresiasi Harga Pasar iPhone
                </h3>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                Di bisnis Apple, harga unit second dan baru terus mengalami penyesuaian pasar setiap bulan. Unit yang mengendap lebih dari 14 hari di etalase berisiko memakan *holding cost* dan penurunan margin keuntungan.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {agingUnits.map(u => (
                  <div key={u.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{u.modelName}</span>
                        <span style={{ fontSize: '10px', background: 'rgba(255, 69, 58, 0.15)', color: '#FF453A', border: '1px solid rgba(255, 69, 58, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          Mengendap {u.daysInStock} Hari
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        IMEI: {u.imei} | Barcode: {u.barcodeCode} | Lokasi: {branches.find(b => b.id === u.branchId)?.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#FF9F0A', marginTop: '2px' }}>
                        Tingkat Risiko: {u.marketRisk}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>Hrg Retail Saat Ini:</span>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)' }}>{formatRupiah(u.priceRetail)}</span>
                      <div style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => showToast(`Saran Owner: Buat program Flash Sale / Promo Diskon Rp 300.000 untuk unit ${u.modelName} (IMEI: ${u.imei}) agar cepat likuid.`, 'info', 'Rekomendasi Flash Sale')}
                          style={{
                            background: 'var(--accent)',
                            color: 'var(--accent-ink)',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Rekomendasi Flash Sale
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PENGATURAN PRODUK & MASTER TOKO                                    */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (() => {
          const availableUnitsList = (Array.isArray(units) ? units : []).filter(u => u && u.status === 'available');
          const lowStockCount = (Array.isArray(masterProducts) ? masterProducts : []).filter(m => {
            const readyCount = availableUnitsList.filter(u => 
              (u.modelName && m.name && u.modelName.toLowerCase().includes(m.name.toLowerCase())) ||
              (u.masterId && m.id && (u.masterId === m.id || m.id.includes(u.masterId) || u.masterId.includes(m.id)))
            ).length;
            return readyCount < (m.minStockAlert || 1);
          }).length;

          // Dynamic unique category list for filter pills
          const categoryMap = new Map();
          const defaultCats = [
            { id: 'iphone', name: 'iPhone' },
            { id: 'ipad', name: 'iPad' },
            { id: 'macbook', name: 'MacBook' },
            { id: 'watch', name: 'Apple Watch' },
            { id: 'audio', name: 'Audio' }
          ];
          defaultCats.forEach(d => categoryMap.set(d.id.toLowerCase(), d));

          (categories || []).forEach(c => {
            if (c && c.id) {
              categoryMap.set(c.id.toLowerCase(), { id: c.id, name: c.name || c.id });
            }
          });

          (masterProducts || []).forEach(m => {
            if (m && m.category) {
              const idLower = m.category.toLowerCase();
              if (!categoryMap.has(idLower)) {
                categoryMap.set(idLower, {
                  id: m.category,
                  name: m.category.charAt(0).toUpperCase() + m.category.slice(1)
                });
              }
            }
          });

          const availableCategories = Array.from(categoryMap.values());

          // Filtered Master Products by Category & Search Query
          const filteredMasterProducts = (Array.isArray(masterProducts) ? masterProducts : []).filter(m => {
            if (!m) return false;

            // Category filter
            if (masterCategoryFilter !== 'all') {
              const mCat = (m.category || '').toLowerCase();
              const target = masterCategoryFilter.toLowerCase();
              if (target === 'mac' || target === 'macbook') {
                if (!mCat.includes('mac')) return false;
              } else if (target === 'audio') {
                if (!mCat.includes('audio') && !mCat.includes('airpod') && !mCat.includes('aksesoris') && !mCat.includes('accessories')) return false;
              } else if (mCat !== target) {
                return false;
              }
            }

            // Search query
            if (masterSearchQuery.trim()) {
              const q = masterSearchQuery.toLowerCase();
              const matchName = (m.name || '').toLowerCase().includes(q);
              const matchCat = (m.category || '').toLowerCase().includes(q);
              const matchId = (m.id || '').toLowerCase().includes(q);
              if (!matchName && !matchCat && !matchId) return false;
            }

            return true;
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Master Products Table */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>Katalog Master Produk &amp; Acuan Harga Toko</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-dim)' }}>
                      Menentukan patokan harga jual retail, reseller, batas HPP modal, dan batas notifikasi stok menipis.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px', color: 'var(--text)' }}>
                        Katalog: <strong>{(masterProducts || []).length} Seri</strong>
                      </span>
                      {masterCategoryFilter !== 'all' && (
                        <span style={{ fontSize: '11px', background: 'rgba(10, 132, 255, 0.12)', border: '1px solid rgba(10, 132, 255, 0.25)', padding: '3px 8px', borderRadius: '6px', color: 'var(--accent)' }}>
                          Filter: <strong>{filteredMasterProducts.length} Seri</strong>
                        </span>
                      )}
                      <span style={{ fontSize: '11px', background: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.25)', padding: '3px 8px', borderRadius: '6px', color: '#30D158' }}>
                        Total Fisik Ready: <strong>{availableUnitsList.length} Unit</strong>
                      </span>
                      {lowStockCount > 0 ? (
                        <span style={{ fontSize: '11px', background: 'rgba(255, 159, 10, 0.12)', border: '1px solid rgba(255, 159, 10, 0.3)', padding: '3px 8px', borderRadius: '6px', color: '#FF9F0A', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle style={{ width: '12px', height: '12px' }} />
                          <span><strong>{lowStockCount} Seri</strong> Stok Menipis / Perlu Restock</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', background: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.25)', padding: '3px 8px', borderRadius: '6px', color: '#30D158' }}>
                          Semua stok aman
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {onNavigateToInventory && (
                      <button
                        type="button"
                        onClick={onNavigateToInventory}
                        style={{
                          background: 'var(--surface-2)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                        title="Buka menu Barcode & Gudang untuk kelola fisik stok & cetak label thermal"
                      >
                        <Barcode style={{ width: '14px', height: '14px', color: 'var(--accent)' }} />
                        <span>Menu Gudang &amp; Barcode</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsAddMasterModalOpen(true)}
                      style={{
                        background: 'var(--accent)',
                        color: 'var(--accent-ink)',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus style={{ width: '14px', height: '14px' }} />
                      <span>Tambah Seri Master</span>
                    </button>
                  </div>
                </div>

                {/* TOOLBAR FILTER KATEGORI & PENCARIAN (APPLE THEME) */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  background: 'var(--surface-2)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  marginBottom: '16px'
                }}>
                  {/* Category Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>
                      <Filter style={{ width: '13px', height: '13px', color: 'var(--accent)' }} />
                      <span>Kategori:</span>
                    </div>

                    {/* Button 'Semua' */}
                    <button
                      type="button"
                      onClick={() => setMasterCategoryFilter('all')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: masterCategoryFilter === 'all' ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: masterCategoryFilter === 'all' ? 'var(--accent)' : 'var(--surface)',
                        color: masterCategoryFilter === 'all' ? '#FFFFFF' : 'var(--text)',
                        fontSize: '12px',
                        fontWeight: masterCategoryFilter === 'all' ? '700' : '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>Semua</span>
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 5px',
                        borderRadius: '10px',
                        background: masterCategoryFilter === 'all' ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                        color: masterCategoryFilter === 'all' ? '#FFFFFF' : 'var(--text-dim)',
                        fontWeight: '700'
                      }}>
                        {(masterProducts || []).length}
                      </span>
                    </button>

                    {/* Each Category Button */}
                    {availableCategories.map(cat => {
                      const count = (masterProducts || []).filter(m => {
                        const p = (m.category || '').toLowerCase();
                        const s = cat.id.toLowerCase();
                        if (s === 'mac' || s === 'macbook') return p.includes('mac');
                        if (s === 'audio') return p.includes('audio') || p.includes('airpod') || p.includes('aksesoris') || p.includes('accessories');
                        return p === s;
                      }).length;

                      const isSelected = masterCategoryFilter.toLowerCase() === cat.id.toLowerCase() ||
                        ((cat.id.toLowerCase() === 'macbook' || cat.id.toLowerCase() === 'mac') && (masterCategoryFilter === 'mac' || masterCategoryFilter === 'macbook'));

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setMasterCategoryFilter(cat.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                            background: isSelected ? 'var(--accent)' : 'var(--surface)',
                            color: isSelected ? '#FFFFFF' : 'var(--text)',
                            fontSize: '12px',
                            fontWeight: isSelected ? '700' : '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{cat.name}</span>
                          <span style={{
                            fontSize: '10px',
                            padding: '1px 5px',
                            borderRadius: '10px',
                            background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                            color: isSelected ? '#FFFFFF' : 'var(--text-dim)',
                            fontWeight: '700'
                          }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Box on Right */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px', flex: '1', maxWidth: '300px' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <Search style={{ width: '14px', height: '14px', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                      <input
                        type="text"
                        placeholder="Cari seri / model master..."
                        value={masterSearchQuery}
                        onChange={(e) => setMasterSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px 7px 32px',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text)',
                          fontSize: '12px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {masterSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setMasterSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <X style={{ width: '13px', height: '13px' }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="tidy-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                        <th style={{ padding: '10px 12px', fontWeight: '600' }}>Seri / Model</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600' }}>Kategori</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Estimasi HPP Modal</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Acuan Harga Retail</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Harga Reseller</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'center' }}>Stok Ready</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'center' }}>Batas Alert</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(masterProducts) ? masterProducts : []).length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
                            Belum ada katalog seri master produk. Klik "+ Tambah Seri Master" untuk menambahkan acuan harga baru.
                          </td>
                        </tr>
                      ) : filteredMasterProducts.length === 0 ? (
                        <tr>
                          <td colSpan={9} style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
                            <div style={{ marginBottom: '8px' }}>Tidak ada seri master yang cocok dengan filter kategori yang dipilih.</div>
                            <button
                              type="button"
                              onClick={() => {
                                setMasterCategoryFilter('all');
                                setMasterSearchQuery('');
                              }}
                              className="btn btn-secondary text-xs"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <RotateCcw style={{ width: '13px', height: '13px' }} />
                              Reset Filter
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredMasterProducts.map(m => {
                          const readyStock = availableUnitsList.filter(u => 
                            (u.modelName && m.name && u.modelName.toLowerCase().includes(m.name.toLowerCase())) ||
                            (u.masterId && m.id && (u.masterId === m.id || m.id.includes(u.masterId) || u.masterId.includes(m.id)))
                          ).length;
                          const minAlert = Number(m.minStockAlert || 1);
                          const isOut = readyStock === 0;
                          const isLow = readyStock < minAlert;

                          return (
                            <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px', fontWeight: '700' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '34px', height: '34px', flexShrink: 0, borderRadius: '8px', background: '#0E1013', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                      src={m.image || getApplePresetPhoto(m.name || m.category)}
                                      alt={m.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                                      onError={(e) => { e.currentTarget.src = getApplePresetPhoto(m.name || m.category); }}
                                    />
                                  </div>
                                  <span>{m.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-dim)' }}>{m.category}</td>
                              <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-dim)' }}>{formatRupiah(m.baseHpp)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700' }}>{formatRupiah(m.baseRetail)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', color: '#C084FC', fontWeight: '700' }}>{formatRupiah(m.baseReseller)}</td>
                              
                              {/* Stok Ready Fisik Saat Ini */}
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    background: isOut 
                                      ? 'rgba(255, 69, 58, 0.15)' 
                                      : isLow 
                                        ? 'rgba(255, 159, 10, 0.15)' 
                                        : 'rgba(48, 209, 88, 0.12)',
                                    color: isOut 
                                      ? '#FF453A' 
                                      : isLow 
                                        ? '#FF9F0A' 
                                        : '#30D158',
                                    border: `1px solid ${
                                      isOut 
                                        ? 'rgba(255, 69, 58, 0.3)' 
                                        : isLow 
                                          ? 'rgba(255, 159, 10, 0.3)' 
                                          : 'rgba(48, 209, 88, 0.3)'
                                    }`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title={isOut ? 'Stok fisik habis di seluruh outlet' : isLow ? `Stok fisik (${readyStock}) di bawah batas alert (< ${minAlert})` : 'Stok fisik aman'}
                                >
                                  {isOut ? (
                                    <>
                                      <AlertTriangle style={{ width: '11px', height: '11px' }} />
                                      <span>0 Unit (Habis)</span>
                                    </>
                                  ) : isLow ? (
                                    <>
                                      <AlertTriangle style={{ width: '11px', height: '11px' }} />
                                      <span>{readyStock} Unit (Menipis)</span>
                                    </>
                                  ) : (
                                    <span>{readyStock} Unit Ready</span>
                                  )}
                                </span>
                              </td>

                              {/* Batas Alert Min. Stok */}
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <span style={{ fontSize: '11px', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                                  &lt; {m.minStockAlert} Unit
                                </span>
                              </td>

                              {/* Status Aktif */}
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMasterProduct) {
                                      onUpdateMasterProduct({
                                        ...m,
                                        active: m.active === false ? true : false
                                      });
                                    }
                                  }}
                                  title="Klik untuk ubah status aktif / nonaktif"
                                  style={{
                                    background: m.active !== false ? 'rgba(48, 209, 88, 0.12)' : 'rgba(142, 142, 147, 0.12)',
                                    color: m.active !== false ? '#30D158' : '#8E8E93',
                                    border: `1px solid ${m.active !== false ? 'rgba(48, 209, 88, 0.3)' : 'rgba(142, 142, 147, 0.3)'}`,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {m.active !== false ? 'Aktif' : 'Nonaktif'}
                                </button>
                              </td>

                              {/* Aksi: + Stok, Edit & Hapus */}
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQuickAddStockMaster(m);
                                      setQuickStorage(m.category === 'macbook' ? '256GB' : m.category === 'watch' ? '46mm' : '128GB');
                                      setQuickColor(m.category === 'macbook' ? 'Midnight' : 'Natural Titanium');
                                      setQuickCondition('Second Like New');
                                      setQuickGrade('Grade A+');
                                      setQuickBh(95);
                                      const randImei = '35' + Math.floor(1000000000000 + Math.random() * 9000000000000);
                                      setQuickImei(randImei);
                                    }}
                                    title={`Tambah 1 unit fisik stok ke ${m.name}`}
                                    style={{
                                      background: 'rgba(48, 209, 88, 0.15)',
                                      border: '1px solid rgba(48, 209, 88, 0.3)',
                                      color: '#30D158',
                                      padding: '5px 9px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Plus style={{ width: '12px', height: '12px' }} />
                                    <span>+ Stok</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingMaster({ ...m })}
                                    title="Edit Seri Master"
                                    style={{
                                      background: 'var(--surface-2)',
                                      border: '1px solid var(--border)',
                                      color: 'var(--text)',
                                      padding: '5px 9px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Edit2 style={{ width: '12px', height: '12px', color: 'var(--accent)' }} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingMaster(m)}
                                    title="Hapus Seri Master"
                                    style={{
                                      background: 'rgba(255, 69, 58, 0.1)',
                                      border: '1px solid rgba(255, 69, 58, 0.25)',
                                      color: '#FF453A',
                                      padding: '5px 9px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 style={{ width: '12px', height: '12px' }} />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Store Security & Rules Configuration */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Lock style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                    Konfigurasi Keamanan PIN &amp; Kebijakan Toko
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'var(--surface-2)', padding: '14px', borderRadius: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>PIN Owner Toko:</label>
                    <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>9999</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Akses seluruh laporan finansial</span>
                  </div>

                  <div style={{ background: 'var(--surface-2)', padding: '14px', borderRadius: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>PIN Supervisor Toko:</label>
                    <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>1234</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Otorisasi void kasir &amp; diskon besar</span>
                  </div>

                  <div style={{ background: 'var(--surface-2)', padding: '14px', borderRadius: '10px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>Batas Diskon Otomatis:</label>
                    <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>Rp 100.000</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Di atas Rp 100rb wajib PIN SPV</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })()}

        {/* TAB 8: MANAJEMEN KATEGORI PRODUK & AKSESORIS */}
        {activeTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                  <span>Manajemen Kategori Produk & Aksesoris</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                  Kelola kategori inventaris toko. Kategori yang dibuat otomatis tampil di form QC gudang, katalog web, dan pencarian kasir.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  title="Atur gambar showcase 6 kategori produk di halaman depan Beranda"
                >
                  <ImageIcon style={{ width: '15px', height: '15px', color: 'var(--accent)' }} />
                  <span>Gambar Kategori Beranda</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--accent)',
                    color: 'var(--accent-ink)',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(10, 132, 255, 0.3)'
                  }}
                >
                  <Plus style={{ width: '15px', height: '15px' }} />
                  <span>Tambah Kategori Baru</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Total Kategori</div>
                <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px', color: '#FFFFFF' }}>{categories.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Tersinkronisasi ke seluruh modul</div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Kategori Perangkat (IMEI)</div>
                <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px', color: '#60A5FA' }}>
                  {(categories || []).filter(c => c?.isSerialized).length}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>iPhone, iPad, Mac, Watch</div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Kategori Aksesoris / Non-IMEI</div>
                <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px', color: '#C084FC' }}>
                  {(categories || []).filter(c => !c?.isSerialized).length}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Aksesoris, Audio, Case, dll.</div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Total Unit Aktif</div>
                <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '4px', color: '#30D158' }}>{(units || []).length} Unit</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Dalam database inventaris</div>
              </div>
            </div>

            {/* Filter Search */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', maxWidth: '360px' }}>
              <Search style={{ width: '15px', height: '15px', color: 'var(--text-dim)', marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Cari nama atau ID kategori..."
                value={searchCatQuery}
                onChange={(e) => setSearchCatQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '12px', width: '100%', outline: 'none' }}
              />
            </div>

            {/* Category Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {(categories || [])
                .filter(cat => {
                  if (!cat) return false;
                  if (!searchCatQuery || !searchCatQuery.trim()) return true;
                  const q = searchCatQuery.toLowerCase();
                  return (cat.name || '').toLowerCase().includes(q) || (cat.id || '').toLowerCase().includes(q) || (cat.description || '').toLowerCase().includes(q);
                })
                .map(cat => {
                  const unitCount = (units || []).filter(u => u?.category === cat.id).length;
                  return (
                    <div 
                      key={cat.id}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div>
                        {/* Top Row: Title, ID & Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              background: cat.isSerialized ? 'rgba(10, 132, 255, 0.12)' : 'rgba(192, 132, 252, 0.12)',
                              border: cat.isSerialized ? '1px solid rgba(10, 132, 255, 0.25)' : '1px solid rgba(192, 132, 252, 0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: cat.isSerialized ? '#60A5FA' : '#C084FC'
                            }}>
                              <Layers style={{ width: '18px', height: '18px' }} />
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>
                                {cat.name}
                              </h3>
                              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                                ID: {cat.id}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditCategory(cat)}
                              style={{
                                background: 'var(--surface-2)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Edit Kategori"
                            >
                              <Edit2 style={{ width: '13px', height: '13px' }} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCat(cat)}
                              style={{
                                background: 'rgba(255, 69, 58, 0.1)',
                                border: '1px solid rgba(255, 69, 58, 0.2)',
                                color: '#FF453A',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Hapus Kategori"
                            >
                              <Trash2 style={{ width: '13px', height: '13px' }} />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{ margin: '12px 0 0', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                          {cat.description || 'Tidak ada deskripsi.'}
                        </p>
                      </div>

                      {/* Badges / Properties */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: cat.isSerialized ? 'rgba(10, 132, 255, 0.15)' : 'rgba(192, 132, 252, 0.15)',
                            color: cat.isSerialized ? '#93C5FD' : '#D8B4FE',
                            border: cat.isSerialized ? '1px solid rgba(10, 132, 255, 0.3)' : '1px solid rgba(192, 132, 252, 0.3)'
                          }}>
                            {cat.isSerialized ? 'Perangkat (IMEI/SN)' : 'Aksesoris (Non-IMEI/SKU)'}
                          </span>

                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: cat.hasBattery ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: cat.hasBattery ? '#86EFAC' : 'var(--text-dim)',
                            border: cat.hasBattery ? '1px solid rgba(48, 209, 88, 0.3)' : '1px solid var(--border)'
                          }}>
                            {cat.hasBattery ? 'Ada Baterai (BH %)' : 'Non-Baterai'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)' }}>
                          <span>Stok Aktif:</span>
                          <span style={{ fontWeight: '700', color: unitCount > 0 ? '#FFFFFF' : 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                            {unitCount} Unit
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
            </div>

          </div>
        )}

        {/* TAB: PENGATURAN HARGA TAKSIRAN TRADE-IN & JUAL HP */}
        {activeTab === 'tradein_pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase' }}>
                    Sistem Penilaian Otomatis
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Terhubung ke Kalkulator Publik
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw style={{ width: '22px', height: '22px', color: '#22C55E' }} />
                  <span>Daftar Harga Taksiran Trade-In &amp; Jual HP</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)', maxWidth: '780px' }}>
                  Atur patokan harga beli dasar (buyback base price) untuk setiap model dan kapasitas iPhone. Nilai ini menjadi acuan utama pada <strong>Kalkulator Jual</strong> dan <strong>Kalkulator Tukar Tambah</strong> di website publik.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleResetTradeInToDefault}
                  className="btn btn-secondary text-xs"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Kembalikan ke taksiran default rekomendasi pabrikan"
                >
                  <RotateCcw style={{ width: '13px', height: '13px' }} />
                  <span>Reset Default</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddTradeInModalOpen(true)}
                  className="btn btn-secondary text-xs font-bold"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                  <span>Tambah Seri iPhone</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveTradeInChanges}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#22C55E',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <Save style={{ width: '14px', height: '14px' }} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {tradeInSaveSuccess && (
              <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#22C55E', fontSize: '13px', fontWeight: '600' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span>{tradeInSaveSuccess}</span>
              </div>
            )}

            {/* Stats Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Total Seri iPhone Terdaftar
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text)', marginTop: '4px' }}>
                  {Object.keys(localTradeInValuations).length} Seri
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Mencakup iPhone 11 hingga 16 Pro Max
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Varian Kapasitas Aktif
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent)', marginTop: '4px' }}>
                  {Object.values(localTradeInValuations).reduce((acc, c) => acc + Object.keys(c || {}).length, 0)} Varian
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  64GB, 128GB, 256GB, 512GB, 1TB
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Rentang Taksiran Beli
                </div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#22C55E', marginTop: '6px' }}>
                  Rp 4 Jt — Rp 27 Jt
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Mengikuti fluktuasi pasar Apple second
                </div>
              </div>
            </div>

            {/* Search Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '12px' }}>
              <Search style={{ width: '16px', height: '16px', color: 'var(--text-dim)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Cari seri iPhone (contoh: 15 Pro, 13 mini, 16 Pro Max)..."
                value={tradeInSearchQuery}
                onChange={(e) => setTradeInSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: '13.5px',
                  outline: 'none',
                  width: '100%'
                }}
              />
              {tradeInSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTradeInSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '12px' }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* List / Grid of Models and Capacities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.keys(localTradeInValuations)
                .filter(m => m.toLowerCase().includes(tradeInSearchQuery.toLowerCase()))
                .map(model => {
                  const capacities = localTradeInValuations[model] || {};
                  return (
                    <div 
                      key={model} 
                      style={{ 
                        background: 'var(--surface)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '16px', 
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}
                    >
                      {/* Model Title Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
                            <Smartphone style={{ width: '17px', height: '17px' }} />
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{model}</h3>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{Object.keys(capacities).length} varian kapasitas</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleAddCapacityToModel(model)}
                            className="btn btn-secondary text-xs"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                          >
                            <Plus style={{ width: '12px', height: '12px' }} />
                            <span>Tambah Kapasitas</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteModel(model)}
                            className="btn btn-secondary text-xs"
                            style={{ padding: '6px 10px', fontSize: '11px', color: '#FF453A' }}
                            title="Hapus Model Ini"
                          >
                            <Trash2 style={{ width: '12px', height: '12px' }} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>

                      {/* Capacities Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                        {Object.entries(capacities).map(([cap, price]) => (
                          <div 
                            key={cap} 
                            style={{ 
                              background: 'var(--surface-2)', 
                              border: '1px solid var(--border)', 
                              borderRadius: '12px', 
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: '800', background: '#000000', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px' }}>
                                {cap}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteCapacity(model, cap)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                                title="Hapus kapasitas ini"
                              >
                                <X style={{ width: '13px', height: '13px' }} />
                              </button>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                                Harga Taksiran Beli Dasar (Rp):
                              </label>
                              <input
                                type="number"
                                step="100000"
                                value={price}
                                onChange={(e) => handleUpdateTradeInPrice(model, cap, e.target.value)}
                                style={{
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  background: 'var(--surface)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--text)',
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  fontFamily: 'var(--font-mono)',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  outline: 'none'
                                }}
                              />
                            </div>

                            <div style={{ fontSize: '11px', color: '#22C55E', fontWeight: '700', textAlign: 'right' }}>
                              {formatRupiah(price)}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
            </div>

            {/* Bottom Save Bar */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}>
                Perubahan yang disimpan akan langsung aktif di tab <strong>Trade-In</strong> pada antarmuka pelanggan.
              </div>
              <button
                type="button"
                onClick={handleSaveTradeInChanges}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#22C55E',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '11px 24px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                <span>Simpan Semua Perubahan</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 9: PENGATURAN TOKO & KEAMANAN PIN */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Shortcut Card for Trade-In Pricing */}
            <div style={{ 
              background: 'rgba(34, 197, 94, 0.08)', 
              border: '1px solid rgba(34, 197, 94, 0.3)', 
              borderRadius: '14px', 
              padding: '18px 22px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E' }}>
                  <RefreshCw style={{ width: '22px', height: '22px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
                    Tabel Taksiran Trade-In &amp; Harga Jual iPhone
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Atur patokan harga beli (buyback base price) untuk setiap tipe dan kapasitas iPhone di kalkulator pelanggan.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('tradein_pricing')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#22C55E',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <span>Buka Tabel Harga Trade-In</span>
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {/* Header Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                  <span>Pengaturan Toko &amp; Keamanan PIN</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                  Kelola PIN rahasia Master Owner, PIN kasir, profil nota toko, standar garansi Apple, dan ambang batas radar stok.
                </p>
              </div>

              {onLockOwnerPortal && (
                <button
                  type="button"
                  onClick={onLockOwnerPortal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 69, 58, 0.12)',
                    color: '#FF453A',
                    border: '1px solid rgba(255, 69, 58, 0.3)',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                  title="Kunci sesi Owner & Keluar ke Kasir"
                >
                  <Lock style={{ width: '14px', height: '14px' }} />
                  <span>Kunci Dashboard Sekarang</span>
                </button>
              )}
            </div>

            {/* Quick Summary Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              
              <div style={{ background: 'var(--surface)', border: '1px solid rgba(255, 159, 10, 0.3)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 159, 10, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9F0A' }}>
                  <KeyRound style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PIN Master Owner</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#FF9F0A', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    •••• (Terproteksi &amp; Rahasia)
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <Lock style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PIN Staf Kasir / SPV</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    •••• (Operasional Kasir)
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158' }}>
                  <ShieldCheck style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kebijakan Auto-Lock</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#30D158', marginTop: '2px' }}>
                    Aktif (Otomatis Terkunci)
                  </div>
                </div>
              </div>

            </div>

            {/* Global Reset / Success Notification */}
            {resetSuccess && (
              <div style={{ background: 'rgba(48, 209, 88, 0.15)', border: '1px solid #30D158', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#30D158', fontSize: '13px', fontWeight: '600' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span>{resetSuccess}</span>
              </div>
            )}

            {/* 2-Column Responsive Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
              
              {/* LEFT COLUMN: BRANDING LOGO & QRIS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* CARD 1: PENGATURAN LOGO & IDENTITAS BRAND */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      <ImageIcon style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Pengaturan Logo iConicstore</h3>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tampil di Header navigasi, katalog web publik, dan struk kasir</span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveBranding} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Logo Preview & Upload */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--surface-2)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '12px', background: storeLogoPreview ? '#000000' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                        {storeLogoPreview ? (
                          <img 
                            src={storeLogoPreview} 
                            alt="Preview Logo" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                        ) : (
                          <span style={{ fontWeight: '800', color: 'var(--accent-ink)', fontSize: '24px' }}>iC</span>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                          {storeLogoPreview ? 'Logo Kustom Aktif' : 'Logo Bawaan (Default iC)'}
                        </div>
                        <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'var(--text-dim)' }}>
                          Format didukung: PNG, JPG, SVG, WEBP (Maks. 2MB).
                        </p>
                        
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', color: 'var(--accent-ink)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                            <Upload style={{ width: '13px', height: '13px' }} />
                            <span>Unggah Logo Baru</span>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/svg+xml, image/webp"
                              onChange={handleLogoUpload}
                              style={{ display: 'none' }}
                            />
                          </label>

                          {storeLogoPreview && (
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              <RotateCcw style={{ width: '12px', height: '12px' }} />
                              <span>Pakai Default</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                        Nama Resmi Toko:
                      </label>
                      <input
                        type="text"
                        value={storeNameInput}
                        onChange={(e) => setStoreNameInput(e.target.value)}
                        placeholder="Contoh: iConicstore Indonesia"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                        Slogan / Tagline Brand:
                      </label>
                      <input
                        type="text"
                        value={storeTaglineInput}
                        onChange={(e) => setStoreTaglineInput(e.target.value)}
                        placeholder="Contoh: Official Apple Store & Reseller"
                        className="input-field"
                        required
                      />
                    </div>

                    {logoError && (
                      <div style={{ background: 'rgba(255, 69, 58, 0.12)', border: '1px solid rgba(255, 69, 58, 0.3)', color: '#FF453A', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <span>{logoError}</span>
                      </div>
                    )}

                    {logoSuccess && (
                      <div style={{ background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', color: '#30D158', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <span>{logoSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary text-xs font-bold"
                    >
                      <Save style={{ width: '14px', height: '14px' }} />
                      <span>Simpan Logo &amp; Identitas Brand</span>
                    </button>
                  </form>
                </div>

                {/* CARD 1.5: PENGATURAN BANNER PROMO BERANDA (HERO SLIDER) */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        <ImageIcon style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Pengaturan Banner Slider Beranda</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Kelola gambar slide promosi, aksi klik, dan banner utama di Beranda</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetBanners}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-dim)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      title="Kembalikan ke susunan banner default"
                    >
                      <RotateCcw style={{ width: '12px', height: '12px' }} />
                      <span>Reset Banner Bawaan</span>
                    </button>
                  </div>

                  {/* List of Active Banners */}
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text)' }}>
                        Daftar Banner Beranda ({bannersList.length} Slide):
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        Tayang: <strong style={{ color: '#30D158' }}>{bannersList.filter(b => b.active !== false).length}</strong> / {bannersList.length} Banner
                      </div>
                    </div>

                    {bannersList.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', background: 'var(--surface-2)', borderRadius: '10px', border: '1px dashed var(--border)', color: 'var(--text-dim)', fontSize: '12px' }}>
                        Belum ada banner. Tambahkan banner baru melalui formulir di bawah.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                        {bannersList.map((banner, idx) => {
                          const isActive = banner.active !== false;
                          return (
                            <div 
                              key={banner.id || idx}
                              style={{
                                background: 'var(--surface-2)',
                                border: isActive ? '1px solid var(--border)' : '1px dashed rgba(255, 255, 255, 0.15)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                opacity: isActive ? 1 : 0.65,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {/* Banner Thumbnail Preview */}
                              <div style={{ position: 'relative', width: '100%', aspectRatio: '2.2 / 1', background: '#0A0B0D', overflow: 'hidden' }}>
                                <img 
                                  src={banner.imageUrl || banner.bg} 
                                  alt={banner.title} 
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    filter: isActive ? 'none' : 'grayscale(60%)'
                                  }} 
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80';
                                  }}
                                />
                                <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '6px' }}>
                                  <span style={{ background: 'rgba(0,0,0,0.75)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>
                                    Slide #{idx + 1}
                                  </span>
                                  <span style={{ 
                                    background: isActive ? 'rgba(48, 209, 88, 0.25)' : 'rgba(255, 255, 255, 0.2)', 
                                    color: isActive ? '#30D158' : '#D1D5DB', 
                                    border: isActive ? '1px solid rgba(48, 209, 88, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                                    padding: '2px 8px', 
                                    borderRadius: '6px', 
                                    fontSize: '10px', 
                                    fontWeight: '800' 
                                  }}>
                                    {isActive ? '● Tayang' : '○ Nonaktif'}
                                  </span>
                                </div>
                              </div>

                              {/* Banner Metadata */}
                              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text)', lineHeight: '1.3' }}>
                                  {banner.title || `Banner Promo #${idx + 1}`}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>Tujuan:</span>
                                  <span style={{ color: 'var(--accent)', fontWeight: '600' }}>
                                    {banner.targetTab === 'pricelist' 
                                      ? `Pricelist (${banner.category || 'Semua'})`
                                      : banner.targetTab === 'warranty'
                                      ? 'Cek Garansi & IMEI'
                                      : banner.targetTab === 'tradein'
                                      ? 'Simulasi Trade-In'
                                      : banner.targetTab === 'lokasi'
                                      ? 'Lokasi Cabang'
                                      : 'Katalog'}
                                  </span>
                                </div>

                                {/* Action Buttons Toolbar */}
                                <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
                                  
                                  {/* Urutan Arrows */}
                                  <div style={{ display: 'flex', gap: '2px' }}>
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveBanner(idx, 'up')}
                                      style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        color: idx === 0 ? 'var(--text-dim)' : 'var(--text)',
                                        padding: '4px 7px',
                                        borderRadius: '5px',
                                        fontSize: '11px',
                                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                        opacity: idx === 0 ? 0.35 : 1
                                      }}
                                      title="Pindahkan slide ke atas/sebelumnya"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === bannersList.length - 1}
                                      onClick={() => handleMoveBanner(idx, 'down')}
                                      style={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        color: idx === bannersList.length - 1 ? 'var(--text-dim)' : 'var(--text)',
                                        padding: '4px 7px',
                                        borderRadius: '5px',
                                        fontSize: '11px',
                                        cursor: idx === bannersList.length - 1 ? 'not-allowed' : 'pointer',
                                        opacity: idx === bannersList.length - 1 ? 0.35 : 1
                                      }}
                                      title="Pindahkan slide ke bawah/berikutnya"
                                    >
                                      ↓
                                    </button>
                                  </div>

                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    {/* Toggle Active / Nonaktif Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleBannerActive(banner.id)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: isActive ? 'rgba(255, 159, 10, 0.12)' : 'rgba(48, 209, 88, 0.15)',
                                        color: isActive ? '#FF9F0A' : '#30D158',
                                        border: isActive ? '1px solid rgba(255, 159, 10, 0.3)' : '1px solid rgba(48, 209, 88, 0.35)',
                                        padding: '5px 8px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                      }}
                                      title={isActive ? 'Nonaktifkan banner ini agar tidak tayang' : 'Aktifkan kembali banner ini di Beranda'}
                                    >
                                      {isActive ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}
                                      <span>{isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditBanner(banner)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: 'rgba(10, 132, 255, 0.12)',
                                        color: 'var(--accent)',
                                        border: '1px solid rgba(10, 132, 255, 0.3)',
                                        padding: '5px 8px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                      }}
                                      title="Edit banner ini tanpa menghapus"
                                    >
                                      <Edit2 style={{ width: '12px', height: '12px' }} />
                                      <span>Edit</span>
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBanner(banner.id)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: 'rgba(255, 69, 58, 0.1)',
                                        color: '#FF453A',
                                        border: '1px solid rgba(255, 69, 58, 0.25)',
                                        padding: '5px 8px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                      }}
                                      title="Hapus banner ini permanen"
                                    >
                                      <Trash2 style={{ width: '12px', height: '12px' }} />
                                    </button>
                                  </div>

                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* MODAL EDIT BANNER */}
                  {editingBanner && (
                    <div className="modal-backdrop">
                      <div className="modal-content" style={{ maxWidth: '500px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Edit2 style={{ width: '17px', height: '17px', color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Edit Banner Promosi</h3>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setEditingBanner(null)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '4px', cursor: 'pointer' }}
                          >
                            <X style={{ width: '20px', height: '20px' }} />
                          </button>
                        </div>

                        <form onSubmit={handleSaveEditBanner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                              Judul Banner:
                            </label>
                            <input
                              type="text"
                              value={editingBanner.title}
                              onChange={(e) => setEditingBanner(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Judul banner promo..."
                              className="input-field"
                              required
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                              Gambar Banner (URL Gambar atau Unggah Baru):
                            </label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={editingBanner.imageUrl}
                                onChange={(e) => setEditingBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                                placeholder="https://..."
                                className="input-field"
                                style={{ flex: '1 1 220px' }}
                                required
                              />
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <Upload style={{ width: '13px', height: '13px', color: 'var(--accent)' }} />
                                <span>Ganti File</span>
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/webp"
                                  onChange={handleEditBannerUpload}
                                  style={{ display: 'none' }}
                                />
                              </label>
                            </div>

                            {editingBanner.imageUrl && (
                              <div style={{ marginTop: '10px', width: '100%', aspectRatio: '2.2 / 1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <img src={editingBanner.imageUrl} alt="Preview Edit" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                                Tujuan Klik:
                              </label>
                              <select
                                value={editingBanner.targetTab}
                                onChange={(e) => setEditingBanner(prev => ({ ...prev, targetTab: e.target.value }))}
                                className="input-field"
                                style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                              >
                                <option value="pricelist">Buka Halaman Pricelist</option>
                                <option value="warranty">Buka Cek Garansi &amp; IMEI</option>
                                <option value="tradein">Buka Simulasi Trade-In</option>
                                <option value="lokasi">Buka Lokasi Cabang Toko</option>
                              </select>
                            </div>

                            {editingBanner.targetTab === 'pricelist' && (
                              <div>
                                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                                  Kategori Otomatis:
                                </label>
                                <select
                                  value={editingBanner.category || 'iphone'}
                                  onChange={(e) => setEditingBanner(prev => ({ ...prev, category: e.target.value }))}
                                  className="input-field"
                                  style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                                >
                                  <option value="iphone">iPhone</option>
                                  <option value="ipad">iPad</option>
                                  <option value="macbook">MacBook</option>
                                  <option value="watch">Apple Watch</option>
                                  <option value="audio">AirPods</option>
                                  <option value="accessories">Aksesoris</option>
                                  <option value="semua">Semua Produk</option>
                                </select>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', background: 'var(--surface-2)', padding: '12px', borderRadius: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={editingBanner.active}
                                onChange={(e) => setEditingBanner(prev => ({ ...prev, active: e.target.checked }))}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <span style={{ fontWeight: '700' }}>Tayangkan Banner ini di Beranda</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-dim)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={editingBanner.showText}
                                onChange={(e) => setEditingBanner(prev => ({ ...prev, showText: e.target.checked }))}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <span>Tampilkan teks judul di atas gambar (Nonaktifkan jika banner sudah memiliki teks grafis)</span>
                            </label>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setEditingBanner(null)}
                              className="btn btn-secondary text-xs"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary text-xs font-bold"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Save style={{ width: '14px', height: '14px' }} />
                              <span>Simpan Perubahan</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Add New Banner Form */}
                  <form onSubmit={handleAddBanner} style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--surface-2)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus style={{ width: '15px', height: '15px', color: 'var(--accent)' }} />
                      <span>Tambah Banner Promosi Baru</span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                        Judul Banner (Untuk label admin / aksesibilitas):
                      </label>
                      <input
                        type="text"
                        value={newBannerTitle}
                        onChange={(e) => setNewBannerTitle(e.target.value)}
                        placeholder="Contoh: Promo Spesial iPhone 16 Pro Series"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                        Gambar Banner (URL Gambar atau Unggah File):
                      </label>
                      
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={newBannerImage}
                          onChange={(e) => setNewBannerImage(e.target.value)}
                          placeholder="Tempel URL gambar (https://...)"
                          className="input-field"
                          style={{ flex: '1 1 240px' }}
                        />

                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <Upload style={{ width: '14px', height: '14px', color: 'var(--accent)' }} />
                          <span>Unggah File</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleBannerUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>

                      {newBannerImage && (
                        <div style={{ marginTop: '10px', width: '100%', maxWidth: '380px', aspectRatio: '2.2 / 1', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={newBannerImage} alt="Pratinjau Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                          Tujuan Saat Banner Diklik:
                        </label>
                        <select
                          value={newBannerTarget}
                          onChange={(e) => setNewBannerTarget(e.target.value)}
                          className="input-field"
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                        >
                          <option value="pricelist">Buka Halaman Pricelist</option>
                          <option value="warranty">Buka Cek Garansi &amp; IMEI</option>
                          <option value="tradein">Buka Simulasi Trade-In</option>
                          <option value="lokasi">Buka Lokasi Cabang Toko</option>
                        </select>
                      </div>

                      {newBannerTarget === 'pricelist' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                            Filter Kategori Otomatis:
                          </label>
                          <select
                            value={newBannerCategory}
                            onChange={(e) => setNewBannerCategory(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }}
                          >
                            <option value="iphone">iPhone</option>
                            <option value="ipad">iPad</option>
                            <option value="macbook">MacBook</option>
                            <option value="watch">Apple Watch</option>
                            <option value="audio">AirPods</option>
                            <option value="accessories">Aksesoris</option>
                            <option value="semua">Semua Produk</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <input
                        type="checkbox"
                        id="check-show-text"
                        checked={newBannerShowText}
                        onChange={(e) => setNewBannerShowText(e.target.checked)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <label htmlFor="check-show-text" style={{ fontSize: '12px', color: 'var(--text-dim)', cursor: 'pointer' }}>
                        Tampilkan teks judul di atas gambar (Biarkan tidak dicentang jika banner Anda sudah memiliki teks promosi pada gambarnya)
                      </label>
                    </div>

                    {bannerError && (
                      <div style={{ background: 'rgba(255, 69, 58, 0.12)', border: '1px solid rgba(255, 69, 58, 0.3)', color: '#FF453A', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <span>{bannerError}</span>
                      </div>
                    )}

                    {bannerSuccess && (
                      <div style={{ background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', color: '#30D158', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <span>{bannerSuccess}</span>
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        className="btn btn-primary text-xs font-bold"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}
                      >
                        <Save style={{ width: '14px', height: '14px' }} />
                        <span>Pasang Banner ke Beranda</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* CARD: PENGATURAN TAMPILAN KATEGORI BERANDA (6 KATEGORI PRODUK) */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        <Layers style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Pengaturan Tampilan Kategori Beranda</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          Ubah gambar showcase dan deskripsi 6 kartu kategori produk Apple di halaman Beranda
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetAllCategoryCards}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-dim)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      title="Kembalikan semua 6 kategori ke gambar preset Apple"
                    >
                      <RotateCcw style={{ width: '12px', height: '12px' }} />
                      <span>Reset Bawaan Apple</span>
                    </button>
                  </div>

                  {catCardSuccess && (
                    <div style={{ background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', color: '#30D158', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <CheckCircle2 style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                      <span>{catCardSuccess}</span>
                    </div>
                  )}

                  {/* 6 Category Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {[
                      { key: 'iphone', label: 'iPhone' },
                      { key: 'ipad', label: 'iPad' },
                      { key: 'macbook', label: 'MacBook' },
                      { key: 'watch', label: 'Apple Watch' },
                      { key: 'audio', label: 'AirPods' },
                      { key: 'accessories', label: 'Aksesoris' }
                    ].map(item => {
                      const card = categoryCardsSettings?.[item.key] || DEFAULT_CATEGORY_CARDS[item.key] || {};
                      const isCustom = card.image !== DEFAULT_CATEGORY_CARDS[item.key]?.image || card.subtitle !== DEFAULT_CATEGORY_CARDS[item.key]?.subtitle;

                      return (
                        <div
                          key={item.key}
                          style={{
                            background: 'var(--surface-2)',
                            border: isCustom ? '1px solid rgba(10, 132, 255, 0.35)' : '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative'
                          }}
                        >
                          {isCustom && (
                            <span style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              background: 'rgba(10, 132, 255, 0.2)',
                              color: 'var(--accent)',
                              border: '1px solid rgba(10, 132, 255, 0.4)',
                              fontSize: '9.5px',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              Kustom
                            </span>
                          )}

                          {/* Image Box */}
                          <div style={{
                            width: '100%',
                            height: '110px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            marginBottom: '10px',
                            border: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            {card.image ? (
                              <img
                                src={card.image}
                                alt={card.title || item.label}
                                style={{ maxHeight: '95px', maxWidth: '95%', objectFit: 'contain' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = DEFAULT_CATEGORY_CARDS[item.key]?.image;
                                }}
                              />
                            ) : (
                              <ImageIcon style={{ width: '28px', height: '28px', color: 'var(--text-dim)' }} />
                            )}
                          </div>

                          {/* Info */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
                              {card.title || item.label}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                              {card.subtitle || '-'}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                            <button
                              type="button"
                              onClick={() => handleStartEditCategoryCard(item.key)}
                              style={{
                                flex: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                background: 'rgba(10, 132, 255, 0.12)',
                                color: 'var(--accent)',
                                border: '1px solid rgba(10, 132, 255, 0.3)',
                                padding: '6px 10px',
                                borderRadius: '7px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit2 style={{ width: '12px', height: '12px' }} />
                              <span>Ganti Gambar</span>
                            </button>

                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => handleResetCategoryCard(item.key)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  color: 'var(--text-dim)',
                                  border: '1px solid var(--border)',
                                  padding: '6px 8px',
                                  borderRadius: '7px',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                                title="Reset gambar kategori ini ke bawaan Apple"
                              >
                                <RotateCcw style={{ width: '12px', height: '12px' }} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* MODAL EDIT GAMBAR & DESKRIPSI KATEGORI */}
                  {editingCategoryCard && (
                    <div className="modal-backdrop">
                      <div className="modal-content" style={{ maxWidth: '480px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Edit2 style={{ width: '17px', height: '17px', color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                              Edit Tampilan Kategori {editingCategoryCard.title}
                            </h3>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setEditingCategoryCard(null)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '4px', cursor: 'pointer' }}
                          >
                            <X style={{ width: '20px', height: '20px' }} />
                          </button>
                        </div>

                        {/* Image Preview Box */}
                        <div style={{
                          width: '100%',
                          height: '140px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '16px',
                          overflow: 'hidden'
                        }}>
                          {editingCategoryCard.image ? (
                            <img
                              src={editingCategoryCard.image}
                              alt={editingCategoryCard.title}
                              style={{ maxHeight: '120px', maxWidth: '90%', objectFit: 'contain' }}
                            />
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Pratinjau Gambar</span>
                          )}
                        </div>

                        <form onSubmit={handleSaveCategoryCard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                              Nama Kategori:
                            </label>
                            <input
                              type="text"
                              value={editingCategoryCard.title}
                              onChange={(e) => setEditingCategoryCard(prev => ({ ...prev, title: e.target.value }))}
                              className="input-field"
                              required
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                              Deskripsi Singkat / Subtitle:
                            </label>
                            <input
                              type="text"
                              value={editingCategoryCard.subtitle}
                              onChange={(e) => setEditingCategoryCard(prev => ({ ...prev, subtitle: e.target.value }))}
                              placeholder="Contoh: Smartphone Apple iOS..."
                              className="input-field"
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                              Gambar Showcase (URL Web atau Unggah File Komputer):
                            </label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={editingCategoryCard.image}
                                onChange={(e) => setEditingCategoryCard(prev => ({ ...prev, image: e.target.value }))}
                                placeholder="https://..."
                                className="input-field"
                                style={{ flex: '1 1 200px' }}
                                required
                              />
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <Upload style={{ width: '13px', height: '13px', color: 'var(--accent)' }} />
                                <span>Pilih File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCategoryCardUpload}
                                  style={{ display: 'none' }}
                                />
                              </label>
                            </div>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                              Format transparan PNG disarankan untuk hasil estetis Apple yang maksimal.
                            </span>
                          </div>

                          {catCardError && (
                            <div style={{ background: 'rgba(255, 69, 58, 0.12)', border: '1px solid rgba(255, 69, 58, 0.3)', color: '#FF453A', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                              <span>{catCardError}</span>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setEditingCategoryCard(null)}
                              className="btn btn-secondary text-xs"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary text-xs font-bold"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Save style={{ width: '14px', height: '14px' }} />
                              <span>Simpan Gambar</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>

                {/* CARD 2: PENGATURAN QRIS TOKO */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158' }}>
                      <QrCode style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Pengaturan QRIS Toko</h3>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>QR Code pembayaran digital di Kasir POS &amp; Invoice</span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveQrisSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Live Preview QRIS Card */}
                    <div style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      color: '#000000',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', color: '#DC2626', textTransform: 'uppercase', marginBottom: '8px' }}>
                        QRIS • PEMBAYARAN NASIONAL
                      </div>

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
                        {qrisImagePreview ? (
                          <img 
                            src={qrisImagePreview} 
                            alt="QRIS Merchant" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '10px' }}>
                            <QrCode style={{ width: '100px', height: '100px', color: '#000000', margin: '0 auto' }} />
                            <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>QR Code Bawaan POS</div>
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: '800', marginTop: '10px', color: '#111827' }}>
                        {qrisMerchantNameInput || 'iConicstore Official'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                        NMID: {qrisNmidInput || 'ID1029384918273'}
                      </div>
                    </div>

                    {/* Upload QRIS Controls */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                        Unggah Gambar QR Code QRIS Anda:
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#30D158', color: '#000000', padding: '8px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                          <Upload style={{ width: '13px', height: '13px' }} />
                          <span>Pilih Gambar QRIS (PNG/JPG)</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleQrisUpload}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {qrisImagePreview && (
                          <button
                            type="button"
                            onClick={handleRemoveQrisImage}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            <RotateCcw style={{ width: '12px', height: '12px' }} />
                            <span>Hapus Gambar QRIS</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                          Nama Merchant QRIS:
                        </label>
                        <input
                          type="text"
                          value={qrisMerchantNameInput}
                          onChange={(e) => setQrisMerchantNameInput(e.target.value)}
                          placeholder="Contoh: iConicstore Surabaya"
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                          NMID (Nomor Merchant):
                        </label>
                        <input
                          type="text"
                          value={qrisNmidInput}
                          onChange={(e) => setQrisNmidInput(e.target.value)}
                          placeholder="Contoh: ID1029384918273"
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    {qrisError && (
                      <div style={{ background: 'rgba(255, 69, 58, 0.12)', border: '1px solid rgba(255, 69, 58, 0.3)', color: '#FF453A', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <span>{qrisError}</span>
                      </div>
                    )}

                    {qrisSuccess && (
                      <div style={{ background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', color: '#30D158', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <span>{qrisSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary text-xs font-bold"
                    >
                      <Save style={{ width: '14px', height: '14px' }} />
                      <span>Simpan Pengaturan QRIS Toko</span>
                    </button>
                  </form>
                </div>

              </div>

              {/* RIGHT COLUMN: SECURITY PIN, WARRANTY POLICIES & SYSTEM RESET */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* CARD 3: GANTI PIN MASTER OWNER */}
                <div style={{ background: 'var(--surface)', border: '1px solid rgba(255, 159, 10, 0.3)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 159, 10, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9F0A' }}>
                        <KeyRound style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Ubah PIN Master Owner</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Otorisasi tertinggi akses finansial &amp; margin</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', background: 'rgba(255, 159, 10, 0.15)', color: '#FF9F0A', border: '1px solid rgba(255, 159, 10, 0.3)', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
                      Rahasia Pemilik
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5', margin: '0 0 16px' }}>
                    PIN ini digunakan untuk membuka Dashboard Eksekutif Owner dari kasir. Bersifat rahasia dan tidak boleh dibagikan kepada staf operasional.
                  </p>

                  <form onSubmit={handleSaveOwnerPin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                        PIN Master Saat Ini:
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="Masukkan PIN Master saat ini"
                        value={currentOwnerPinInput}
                        onChange={(e) => {
                          setCurrentOwnerPinInput(e.target.value.replace(/\D/g, ''));
                          setPinChangeError('');
                          setPinChangeSuccess('');
                        }}
                        className="input-field"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '4px' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                          PIN Baru (4-6 Digit):
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          placeholder="PIN Baru"
                          value={newOwnerPinInput}
                          onChange={(e) => {
                            setNewOwnerPinInput(e.target.value.replace(/\D/g, ''));
                            setPinChangeError('');
                            setPinChangeSuccess('');
                          }}
                          className="input-field"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '4px' }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                          Konfirmasi PIN Baru:
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          placeholder="Ulangi PIN Baru"
                          value={confirmOwnerPinInput}
                          onChange={(e) => {
                            setConfirmOwnerPinInput(e.target.value.replace(/\D/g, ''));
                            setPinChangeError('');
                            setPinChangeSuccess('');
                          }}
                          className="input-field"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '4px' }}
                          required
                        />
                      </div>
                    </div>

                    {pinChangeError && (
                      <div style={{ background: 'rgba(255, 69, 58, 0.12)', border: '1px solid rgba(255, 69, 58, 0.3)', color: '#FF453A', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <span>{pinChangeError}</span>
                      </div>
                    )}

                    {pinChangeSuccess && (
                      <div style={{ background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', color: '#30D158', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <span>{pinChangeSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!currentOwnerPinInput || newOwnerPinInput.length < 4 || newOwnerPinInput !== confirmOwnerPinInput}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: (currentOwnerPinInput && newOwnerPinInput.length >= 4 && newOwnerPinInput === confirmOwnerPinInput) ? '#FF9F0A' : 'var(--surface-2)',
                        color: (currentOwnerPinInput && newOwnerPinInput.length >= 4 && newOwnerPinInput === confirmOwnerPinInput) ? '#000000' : 'var(--text-dim)',
                        border: 'none',
                        padding: '11px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: (currentOwnerPinInput && newOwnerPinInput.length >= 4 && newOwnerPinInput === confirmOwnerPinInput) ? 'pointer' : 'not-allowed',
                        marginTop: '4px'
                      }}
                    >
                      <ShieldCheck style={{ width: '15px', height: '15px' }} />
                      <span>Perbarui PIN Master Owner</span>
                    </button>
                  </form>
                </div>

                {/* CARD 4: GANTI PIN STAF KASIR */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        <User style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>PIN Kasir &amp; Supervisor</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Otorisasi login kru kasir harian</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5', margin: '0 0 16px' }}>
                    PIN ini dimasukkan kasir saat login dari Web Publik ke Kasir POS &amp; Gudang. Kasir tidak dapat melihat dashboard omzet atau profit.
                  </p>

                  <form onSubmit={handleSaveCashierPin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '6px' }}>
                        PIN Kasir Baru (4-6 Digit):
                      </label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="password"
                          maxLength={6}
                          placeholder="Masukkan PIN Baru"
                          value={cashierPinInput}
                          onChange={(e) => {
                            setCashierPinInput(e.target.value.replace(/\D/g, ''));
                            setCashierPinError('');
                            setCashierPinSuccess('');
                          }}
                          className="input-field"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '4px', maxWidth: '200px' }}
                          required
                        />
                        <button
                          type="submit"
                          disabled={cashierPinInput.length < 4}
                          className="btn btn-secondary text-xs font-bold"
                          style={{ padding: '0 16px' }}
                        >
                          Simpan PIN Kasir
                        </button>
                      </div>
                    </div>

                    {cashierPinError && (
                      <span style={{ color: '#FF453A', fontSize: '11px', fontWeight: '600', display: 'block' }}>{cashierPinError}</span>
                    )}
                    {cashierPinSuccess && (
                      <span style={{ color: '#30D158', fontSize: '11px', fontWeight: '600', display: 'block' }}>{cashierPinSuccess}</span>
                    )}
                  </form>
                </div>

                {/* CARD 5: STANDAR GARANSI NOTA & AMBANG BATAS */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                      <Building2 style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Standar Garansi Nota Kasir</h3>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tercetak di struk thermal kasir &amp; kartu garansi customer</span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveStoreProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                        Standar Garansi Toko (Unit Second):
                      </label>
                      <input
                        type="text"
                        value={warrantyStoreInput}
                        onChange={(e) => setWarrantyStoreInput(e.target.value)}
                        placeholder="Contoh: 1 Bulan Tukar Unit Toko"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                        Standar Garansi Sinyal IMEI:
                      </label>
                      <input
                        type="text"
                        value={warrantySignalInput}
                        onChange={(e) => setWarrantySignalInput(e.target.value)}
                        placeholder="Contoh: Permanen Seumur Hidup (All Operator)"
                        className="input-field"
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                          Batas Stok Tipis (Unit):
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={lowStockInput}
                          onChange={(e) => setLowStockInput(e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                          Ambang Dead Stock (Hari):
                        </label>
                        <input
                          type="number"
                          min={3}
                          max={90}
                          value={agingDaysInput}
                          onChange={(e) => setAgingDaysInput(e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    {profileSuccess && (
                      <div style={{ background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', color: '#30D158', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <span>{profileSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary text-xs font-bold"
                      style={{ marginTop: '4px' }}
                    >
                      <Save style={{ width: '14px', height: '14px' }} />
                      <span>Simpan Standar Garansi Toko</span>
                    </button>
                  </form>
                </div>

                {/* CARD 6: RESET PABRIK & KEAMANAN SISTEM */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <RotateCcw style={{ width: '16px', height: '16px', color: 'var(--text-dim)' }} />
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>Reset Pengaturan Toko ke Bawaan</h4>
                  </div>
                  <p style={{ margin: '0 0 14px', fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                    Kembalikan PIN Master Owner, PIN Staf Kasir, QRIS, dan profil toko ke pengaturan awal bila diperlukan reset darurat.
                  </p>
                  
                  {!resetConfirmOpen ? (
                    <button
                      type="button"
                      onClick={() => setResetConfirmOpen(true)}
                      style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '8px 14px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Kembalikan ke Pengaturan Bawaan
                    </button>
                  ) : (
                    <div style={{ background: 'rgba(255, 69, 58, 0.1)', border: '1px solid rgba(255, 69, 58, 0.3)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#FF453A', fontWeight: '700', marginBottom: '10px' }}>
                        Konfirmasi Reset Semua Pengaturan ke Bawaan?
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setResetConfirmOpen(false)}
                          className="btn btn-secondary text-xs"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleResetToDefault}
                          style={{ background: '#FF453A', color: '#FFFFFF', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          Ya, Reset Sekarang
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* CARD 7: PUSAT CADANGAN & PEMULIHAN DATABASE TOKO (BACKUP & RESTORE 1-KLIK) */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <Database style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                      Pusat Cadangan &amp; Pemulihan Database Toko (Backup &amp; Restore)
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      Simpan seluruh data stok, transaksi kasir, master produk, dan faktur PO ke berkas JSON offline atau pulihkan kapan saja.
                    </span>
                  </div>
                </div>

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(48, 209, 88, 0.12)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.3)', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                  <ShieldCheck style={{ width: '13px', height: '13px' }} />
                  <span>Sistem Enkripsi Lokal Aman</span>
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                {/* Export Column */}
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Download style={{ width: '16px', height: '16px', color: '#30D158' }} />
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                        Unduh Cadangan Database Toko (Export JSON)
                      </h4>
                    </div>
                    <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                      Unduh arsip lengkap database toko dalam format berkas <code>.JSON</code> terstruktur. Cocok untuk arsip bulanan Owner atau cadangan darurat.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                        {units.length} Unit Stok
                      </span>
                      <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                        {salesHistory.length} Penjualan Kasir
                      </span>
                      <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                        {purchaseOrders.length} Faktur Supplier PO
                      </span>
                      <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                        {masterProducts.length} Master Produk
                      </span>
                      <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                        {opexList.length} Beban OPEX
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportBackupJson}
                    className="btn btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '11px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      background: '#30D158',
                      color: '#000000',
                      boxShadow: '0 4px 12px rgba(48, 209, 88, 0.25)'
                    }}
                  >
                    <Download style={{ width: '16px', height: '16px' }} />
                    <span>Unduh Cadangan Database (.JSON)</span>
                  </button>
                </div>

                {/* Import Column */}
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Upload style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                        Pulihkan Database Toko (Import JSON)
                      </h4>
                    </div>
                    <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
                      Unggah berkas <code>.JSON</code> cadangan iConicstore untuk memulihkan seluruh data toko secara instan. Sistem akan menampilkan pratinjau sebelum eksekusi.
                    </p>

                    <div style={{ background: 'rgba(10, 132, 255, 0.08)', border: '1px solid rgba(10, 132, 255, 0.25)', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', color: 'var(--accent)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                      <span>Data diuji kelengkapan skemanya sebelum diterapkan ke sistem.</span>
                    </div>
                  </div>

                  <input
                    type="file"
                    id="iconicstore-backup-file-input"
                    accept=".json"
                    onChange={handleFileRestoreSelected}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => document.getElementById('iconicstore-backup-file-input')?.click()}
                    className="btn btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '11px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text)'
                    }}
                  >
                    <Upload style={{ width: '16px', height: '16px' }} />
                    <span>Pilih Berkas Cadangan (.JSON)...</span>
                  </button>
                </div>

              </div>
            </div>

            {/* CARD 8: PUSAT INTEGRASI DATABASE CLOUD SUPABASE (POSTGRESQL) */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158' }}>
                    <Cloud style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                      Integrasi Database Cloud Supabase (PostgreSQL)
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      Hubungkan sistem iConicstore ke cloud database untuk sinkronisasi multi-kasir, multi-cabang, dan keamanan data online.
                    </span>
                  </div>
                </div>

                {/* Live Status Pill */}
                <div>
                  {supabaseStatus === 'connected' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(48, 209, 88, 0.15)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.4)', padding: '5px 12px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700' }}>
                      <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                      <span>Terhubung ke Supabase Cloud</span>
                    </span>
                  )}
                  {supabaseStatus === 'checking' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 159, 10, 0.15)', color: '#FF9F0A', border: '1px solid rgba(255, 159, 10, 0.4)', padding: '5px 12px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700' }}>
                      <RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 1.5s linear infinite' }} />
                      <span>Memeriksa Status Koneksi...</span>
                    </span>
                  )}
                  {supabaseStatus === 'disconnected' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 69, 58, 0.15)', color: '#FF453A', border: '1px solid rgba(255, 69, 58, 0.4)', padding: '5px 12px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700' }}>
                      <ShieldAlert style={{ width: '13px', height: '13px' }} />
                      <span>Koneksi Gagal / Kredensial Tidak Cocok</span>
                    </span>
                  )}
                  {supabaseStatus === 'unconfigured' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-dim)', border: '1px solid var(--border)', padding: '5px 12px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '600' }}>
                      <Globe style={{ width: '13px', height: '13px' }} />
                      <span>Mode Lokal (LocalStorage)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 2-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                
                {/* Column 1: Credentials Form */}
                <form onSubmit={handleSaveSupabaseConfig} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link2 style={{ width: '16px', height: '16px', color: 'var(--accent)' }} />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                      Kredensial Project Supabase
                    </h4>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                      Project URL (Supabase URL):
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzabcdef.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                    <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '3px', display: 'block' }}>
                      Ditemukan di: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                      Anon Public Key (API Key):
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      className="input-field"
                      style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                    <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '3px', display: 'block' }}>
                      Ditemukan di: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (anon public)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      disabled={supabaseTesting || !supabaseUrlInput || !supabaseKeyInput}
                      onClick={handleTestSupabase}
                      className="btn btn-secondary text-xs"
                      style={{ padding: '9px 14px', fontWeight: '700', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      {supabaseTesting ? (
                        <RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 1.5s linear infinite' }} />
                      ) : (
                        <Globe style={{ width: '13px', height: '13px' }} />
                      )}
                      <span>{supabaseTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary text-xs font-bold"
                      style={{ padding: '9px 16px', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Save style={{ width: '13px', height: '13px' }} />
                      <span>Simpan Kredensial</span>
                    </button>
                  </div>
                </form>

                {/* Column 2: Cloud Sync & SQL Schema Migration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Box 1: Sinkronisasi Data Lokal ke Cloud */}
                  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload style={{ width: '15px', height: '15px', color: '#30D158' }} />
                      <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: 'var(--text)' }}>
                        Sinkronisasi Data Lokal ke Supabase
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                      Unggah seluruh data lokal di browser ini ({units.length} unit stok, {salesHistory.length} penjualan kasir, {purchaseOrders.length} PO supplier, {masterProducts.length} master produk) ke cloud PostgreSQL Supabase.
                    </p>
                    <button
                      type="button"
                      disabled={supabaseSyncing || supabaseStatus !== 'connected'}
                      onClick={handleSyncToSupabase}
                      className="btn btn-primary text-xs"
                      style={{
                        padding: '10px 14px',
                        fontWeight: '800',
                        background: supabaseStatus === 'connected' ? '#30D158' : 'rgba(255, 255, 255, 0.08)',
                        color: supabaseStatus === 'connected' ? '#000000' : 'var(--text-dim)',
                        cursor: supabaseStatus === 'connected' ? 'pointer' : 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {supabaseSyncing ? (
                        <RefreshCw style={{ width: '14px', height: '14px', animation: 'spin 1.5s linear infinite' }} />
                      ) : (
                        <Cloud style={{ width: '14px', height: '14px' }} />
                      )}
                      <span>{supabaseSyncing ? 'Mengunggah Data ke Cloud...' : 'Sinkronkan Data ke Supabase Sekarang'}</span>
                    </button>
                  </div>

                  {/* Box 2: Skrip SQL Schema Supabase */}
                  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Database style={{ width: '15px', height: '15px', color: 'var(--accent)' }} />
                      <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: 'var(--text)' }}>
                        Skrip SQL Schema Database Supabase
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                      Skrip SQL otomatis untuk membuat 12 tabel (units, sales, master_products, purchase_orders, dll) beserta indeks IMEI dan RLS di Supabase SQL Editor.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleCopySqlSchema}
                        className="btn btn-secondary text-xs"
                        style={{ padding: '8px 12px', fontWeight: '700', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Copy style={{ width: '13px', height: '13px' }} />
                        <span>Salin SQL Schema</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSqlModalOpen(true)}
                        className="btn btn-secondary text-xs"
                        style={{ padding: '8px 12px', fontWeight: '700', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Eye style={{ width: '13px', height: '13px' }} />
                        <span>Lihat Rincian SQL</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* 4 Steps Guide */}
              <div style={{ background: 'rgba(10, 132, 255, 0.06)', border: '1px solid rgba(10, 132, 255, 0.2)', borderRadius: '10px', padding: '14px 18px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle style={{ width: '14px', height: '14px' }} />
                  <span>Panduan Praktis Menghubungkan ke Supabase (4 Langkah):</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>1. Buka Supabase:</strong>
                    <div>Login ke <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>supabase.com</a> dan buka project Anda.</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>2. Jalankan SQL Schema:</strong>
                    <div>Buka menu <strong>SQL Editor</strong>, klik <strong>New Query</strong>, tempelkan skrip SQL schema kami lalu klik <strong>RUN</strong>.</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>3. Salin API Keys:</strong>
                    <div>Buka <strong>Project Settings &gt; API</strong>, salin <strong>Project URL</strong> dan <strong>anon/public key</strong>.</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>4. Tempel &amp; Sinkronkan:</strong>
                    <div>Tempelkan ke form di atas, klik <strong>Uji Koneksi</strong> &amp; <strong>Simpan</strong>, lalu klik <strong>Sinkronkan Data</strong>.</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB OPEX: BEBAN OPERASIONAL & LABA BERSIH RIIL                           */}
        {/* ========================================================================= */}
        {activeTab === 'opex' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                  Beban Operasional Toko (OPEX) &amp; Laba Bersih Riil
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                  Kalkulasi riil laba bersih (*Net Profit*) setelah omzet dan HPP modal unit dikurangi biaya operasional cabang.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddOpexModalOpen(true)}
                className="btn btn-primary text-xs font-bold"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
              >
                <Plus style={{ width: '15px', height: '15px' }} />
                <span>Catat Beban OPEX Baru</span>
              </button>
            </div>

            {/* Financial Reconciliation Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              
              {/* Omzet */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Omzet Penjualan
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(analytics.totalRevenue)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {filteredSales.length} transaksi selesai
                </div>
              </div>

              {/* HPP Modal */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Modal Unit (HPP)
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#FF9F0A', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(analytics.totalHpp)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Modal pembelian unit Apple
                </div>
              </div>

              {/* Gross Profit */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Laba Kotor (Gross Profit)
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#30D158', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(analytics.grossProfit)}
                </div>
                <div style={{ fontSize: '11px', color: '#30D158', marginTop: '4px', fontWeight: '600' }}>
                  Margin Kotor: {analytics.profitMargin.toFixed(1)}%
                </div>
              </div>

              {/* Total OPEX */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Beban Operasional (OPEX)
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#FF453A', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  - {formatRupiah(totalOpexAmount)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {filteredOpex.length} pos biaya dicatat
                </div>
              </div>

              {/* Net Profit Riil */}
              <div style={{
                background: netProfit >= 0 ? 'rgba(48, 209, 88, 0.08)' : 'rgba(255, 69, 58, 0.08)',
                border: netProfit >= 0 ? '1px solid rgba(48, 209, 88, 0.3)' : '1px solid rgba(255, 69, 58, 0.3)',
                borderRadius: '12px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', color: netProfit >= 0 ? '#30D158' : '#FF453A', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Net Profit Riil Toko
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    background: netProfit >= 0 ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 69, 58, 0.2)',
                    color: netProfit >= 0 ? '#30D158' : '#FF453A',
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}>
                    {netProfitMargin}% Net
                  </span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: netProfit >= 0 ? '#30D158' : '#FF453A', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(netProfit)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Laba bersih riil masuk ke rekening
                </div>
              </div>

            </div>

            {/* OPEX Category Breakdown & Expense Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', overflow: 'hidden', maxWidth: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                  Daftar Pengeluaran &amp; Biaya Operasional Toko
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                    👉 Geser horizontal
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Total: {formatRupiah(totalOpexAmount)}
                  </span>
                </div>
              </div>

              {filteredOpex.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: '13px' }}>
                  Belum ada catatan biaya operasional untuk filter cabang ini.
                </div>
              ) : (
                <div className="table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
                  <table className="tidy-table w-full text-left" style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                        <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Tanggal</th>
                        <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Kategori Biaya</th>
                        <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Deskripsi</th>
                        <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Cabang</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Nominal</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOpex.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{item.date}</td>
                          <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              background: 'rgba(255, 255, 255, 0.06)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              color: 'var(--text)'
                            }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', fontWeight: '600', whiteSpace: 'nowrap' }}>{item.description}</td>
                          <td style={{ padding: '12px 10px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                            {item.branchId === 'all' ? 'Semua Outlet' : ((branches || []).find(b => b.id === item.branchId)?.name || (item.branchId === 'b1' ? 'iConicstore' : item.branchId))}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', color: '#FF453A', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                            - {formatRupiah(item.amount)}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteOpex(item.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                              title="Hapus Biaya"
                            >
                              <Trash2 style={{ width: '14px', height: '14px', color: '#FF453A' }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB CUSTOMERS: BUKU PELANGGAN & GARANSI DIGITAL TOKO (CUSTOMER CRM)       */}
        {/* ========================================================================= */}
        {activeTab === 'customers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserCheck style={{ width: '22px', height: '22px', color: 'var(--accent)' }} />
                  <span>Buku Pelanggan &amp; Garansi Digital Toko</span>
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                  Pusat CRM konsumen, pelacakan otomatis masa berlaku garansi toko 30 hari &amp; sinyal IMEI permanen, serta follow-up WhatsApp 1-klik.
                </p>
              </div>
            </div>

            {/* Executive CRM Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Total Pelanggan</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <Users style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {customerMetrics.totalCustomers} <span style={{ fontSize: '14px', fontWeight: '600' }}>Konsumen</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Terdaftar dari data struk kasir
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Garansi Toko Aktif</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158' }}>
                    <ShieldCheck style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#30D158', fontFamily: 'var(--font-mono)' }}>
                  {customerMetrics.activeWarranty} <span style={{ fontSize: '14px', fontWeight: '600' }}>Unit</span>
                </div>
                <div style={{ fontSize: '11px', color: '#30D158', marginTop: '4px', fontWeight: '600' }}>
                  Dalam masa garansi 30 hari
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid rgba(255, 159, 10, 0.3)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#FF9F0A', fontWeight: '700' }}>Garansi Kritis (&le; 7 Hari)</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 159, 10, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9F0A' }}>
                    <Clock style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#FF9F0A', fontFamily: 'var(--font-mono)' }}>
                  {customerMetrics.expiringWarranty} <span style={{ fontSize: '14px', fontWeight: '600' }}>Pelanggan</span>
                </div>
                <div style={{ fontSize: '11px', color: '#FF9F0A', marginTop: '4px', fontWeight: '600' }}>
                  Perlu follow-up kepuasan unit
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600' }}>Akumulasi Belanja (LTV)</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 215, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>
                    <Award style={{ width: '18px', height: '18px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(customerMetrics.totalLtv)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Total nilai transaksi retail
                </div>
              </div>

            </div>

            {/* Filter and Search Bar */}
            <div style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              padding: '16px', 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setCustomerWarrantyFilter('all')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: customerWarrantyFilter === 'all' ? 'var(--text)' : 'transparent',
                    color: customerWarrantyFilter === 'all' ? 'var(--bg)' : 'var(--text-dim)',
                    borderColor: customerWarrantyFilter === 'all' ? 'var(--text)' : 'var(--border)'
                  }}
                >
                  Semua Pelanggan ({derivedCustomers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerWarrantyFilter('active')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: customerWarrantyFilter === 'active' ? 'rgba(48, 209, 88, 0.2)' : 'transparent',
                    color: customerWarrantyFilter === 'active' ? '#30D158' : 'var(--text-dim)',
                    borderColor: customerWarrantyFilter === 'active' ? 'rgba(48, 209, 88, 0.5)' : 'var(--border)'
                  }}
                >
                  Garansi Toko Aktif ({customerMetrics.activeWarranty})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerWarrantyFilter('expiring')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: customerWarrantyFilter === 'expiring' ? 'rgba(255, 159, 10, 0.2)' : 'transparent',
                    color: customerWarrantyFilter === 'expiring' ? '#FF9F0A' : 'var(--text-dim)',
                    borderColor: customerWarrantyFilter === 'expiring' ? 'rgba(255, 159, 10, 0.5)' : 'var(--border)'
                  }}
                >
                  Segera Berakhir &le; 7 Hari ({customerMetrics.expiringWarranty})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerWarrantyFilter('expired')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: customerWarrantyFilter === 'expired' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: customerWarrantyFilter === 'expired' ? 'var(--text)' : 'var(--text-dim)',
                    borderColor: customerWarrantyFilter === 'expired' ? 'var(--border)' : 'var(--border)'
                  }}
                >
                  Garansi Selesai ({customerMetrics.expiredWarranty})
                </button>
              </div>

              <div style={{ position: 'relative', minWidth: '280px' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Cari Nama, WhatsApp, IMEI, Tipe..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '32px', fontSize: '12px', width: '100%' }}
                />
              </div>
            </div>

            {/* Customers & Warranty Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Pelanggan &amp; WhatsApp</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Unit Terakhir Dibeli</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Tanggal &amp; Cabang</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Status Garansi Toko (30 Hari)</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Garansi Sinyal IMEI</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700' }}>Total Belanja (LTV)</th>
                      <th style={{ padding: '14px 16px', fontWeight: '700', textAlign: 'right' }}>Aksi Layanan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                          <Users style={{ width: '36px', height: '36px', margin: '0 auto 10px', opacity: 0.4 }} />
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>Tidak ada data pelanggan yang cocok</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>Data pelanggan terhimpun otomatis setiap transaksi kasir dilakukan.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(cust => {
                        const dev = cust.latestDevice;
                        const isExpiring = cust.warrantyStatus === 'expiring';
                        const isActive = cust.warrantyStatus === 'active';

                        return (
                          <tr key={cust.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: '800', color: 'var(--text)', fontSize: '13px' }}>
                                {cust.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone style={{ width: '11px', height: '11px' }} />
                                <span>{cust.phone || 'Nomor tidak terdata'}</span>
                              </div>
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              {dev ? (
                                <div>
                                  <div style={{ fontWeight: '700', color: 'var(--text)' }}>
                                    {dev.modelName}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                                    IMEI: {dev.imei}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-dim)' }}>-</span>
                              )}
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontSize: '12px', color: 'var(--text)' }}>
                                {cust.lastTransactionDate?.slice(0, 10)}
                              </div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                {dev?.branchName || 'Cabang Surabaya'}
                              </div>
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              {isActive ? (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '5px', 
                                  background: 'rgba(48, 209, 88, 0.15)', 
                                  color: '#30D158', 
                                  border: '1px solid rgba(48, 209, 88, 0.35)', 
                                  padding: '4px 10px', 
                                  borderRadius: '6px', 
                                  fontSize: '11px', 
                                  fontWeight: '700' 
                                }}>
                                  <ShieldCheck style={{ width: '13px', height: '13px' }} />
                                  <span>Aktif (Sisa {cust.warrantyDaysRemaining} Hari)</span>
                                </span>
                              ) : isExpiring ? (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '5px', 
                                  background: 'rgba(255, 159, 10, 0.15)', 
                                  color: '#FF9F0A', 
                                  border: '1px solid rgba(255, 159, 10, 0.4)', 
                                  padding: '4px 10px', 
                                  borderRadius: '6px', 
                                  fontSize: '11px', 
                                  fontWeight: '700' 
                                }}>
                                  <Clock style={{ width: '13px', height: '13px' }} />
                                  <span>Kritis (Sisa {cust.warrantyDaysRemaining} Hari)</span>
                                </span>
                              ) : (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '5px', 
                                  background: 'rgba(255, 255, 255, 0.06)', 
                                  color: 'var(--text-dim)', 
                                  border: '1px solid var(--border)', 
                                  padding: '4px 10px', 
                                  borderRadius: '6px', 
                                  fontSize: '11px', 
                                  fontWeight: '600' 
                                }}>
                                  <span>Garansi Toko Selesai</span>
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px', 
                                background: 'rgba(10, 132, 255, 0.12)', 
                                color: 'var(--accent)', 
                                border: '1px solid rgba(10, 132, 255, 0.3)', 
                                padding: '3px 8px', 
                                borderRadius: '6px', 
                                fontSize: '10.5px', 
                                fontWeight: '700' 
                              }}>
                                <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                                <span>Permanen Seumur Hidup</span>
                              </span>
                            </td>

                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)' }}>
                                {formatRupiah(cust.totalSpend)}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                {cust.transactionsCount} Transaksi ({cust.devices.length} Unit)
                              </div>
                            </td>

                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenWhatsAppCare(cust)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(48, 209, 88, 0.15)',
                                    color: '#30D158',
                                    border: '1px solid rgba(48, 209, 88, 0.35)',
                                    padding: '6px 11px',
                                    borderRadius: '7px',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                  title="Kirim Pesan Follow-Up Garansi ke WhatsApp"
                                >
                                  <MessageCircle style={{ width: '13px', height: '13px' }} />
                                  <span>WhatsApp</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedCustomerDetail(cust)}
                                  className="btn btn-secondary text-xs"
                                  style={{ padding: '6px 10px', fontSize: '11.5px', borderRadius: '7px' }}
                                  title="Lihat Rincian Kartu Garansi Digital"
                                >
                                  <Eye style={{ width: '13px', height: '13px' }} />
                                  <span>Garansi</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB RESELLER: PERFORMA MITRA RESELLER (B2B)                               */}
        {/* ========================================================================= */}
        {activeTab === 'reseller_perf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Performa Mitra Reseller &amp; B2B Grosir
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                Pantau kontribusi omzet konter mitra, volume pengambilan unit iPhone, dan perbandingan penjualan eceran vs grosir.
              </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Total Mitra Reseller
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginTop: '6px' }}>
                  {resellers.length} Toko / Konter
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Terdaftar di database toko
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Omzet Grosir (Reseller)
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(analytics.resellerRevenue)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px', fontWeight: '600' }}>
                  {((analytics.resellerRevenue / (analytics.totalRevenue || 1)) * 100).toFixed(1)}% dari Total Omzet
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Omzet Eceran (Retail)
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#30D158', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(analytics.retailRevenue)}
                </div>
                <div style={{ fontSize: '11px', color: '#30D158', marginTop: '4px', fontWeight: '600' }}>
                  {((analytics.retailRevenue / (analytics.totalRevenue || 1)) * 100).toFixed(1)}% Penjualan Langsung
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Rata-rata Pengambilan Reseller
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#FF9F0A', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(analytics.resellerRevenue > 0 ? analytics.resellerRevenue / Math.max(1, resellers.length) : 18500000)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Estimasi basket size per mitra
                </div>
              </div>
            </div>

            {/* Reseller Leaderboard Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', overflow: 'hidden', maxWidth: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                  Leaderboard &amp; Status Mitra Reseller Aktif
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                  👉 Geser horizontal
                </span>
              </div>

              <div className="table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
                <table className="tidy-table w-full text-left" style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Nama Konter / Toko</th>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Owner / PIC</th>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Kota</th>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Tier Reseller</th>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Diskon Tier</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total Belanja</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>Plafon Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resellers.map((r, idx) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '700' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', width: '20px', height: '20px', borderRadius: '50%', background: idx === 0 ? '#FFD700' : 'rgba(255,255,255,0.1)', color: idx === 0 ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                              {idx + 1}
                            </span>
                            <span>{r.name || r.storeName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px' }}>{r.pic || r.ownerName || '-'}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>{r.city || 'Surabaya'}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            background: r.tier === 'VIP' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(10, 132, 255, 0.15)',
                            color: r.tier === 'VIP' ? '#FFD700' : 'var(--accent)',
                            border: `1px solid ${r.tier === 'VIP' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(10, 132, 255, 0.3)'}`,
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {r.tier || 'Silver Tier'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', fontWeight: '700', color: '#30D158' }}>
                          {r.discountPercent || 5}%
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                          {formatRupiah(r.totalPurchases || (r.tier === 'VIP' ? 48500000 : 21000000))}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                            {formatRupiah(r.creditLimit || 50000000)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB RMA: RADAR RETUR, SERVIS & KUALITAS STOK                              */}
        {/* ========================================================================= */}
        {activeTab === 'rma_analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Radar Retur, Garansi (RMA) &amp; Kualitas Supplier
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                Evaluasi tingkat retur unit second toko dan distribusi jenis kerusakan untuk mengontrol kualitas supplier stok Apple.
              </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Total Unit Terjual
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginTop: '6px' }}>
                  {analytics.totalUnitsSold} Unit
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Seluruh cabang aktif
                </div>
              </div>

              <div style={{ background: 'rgba(48, 209, 88, 0.08)', border: '1px solid rgba(48, 209, 88, 0.3)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: '#30D158', fontWeight: '800', textTransform: 'uppercase' }}>
                  Rasio Retur Garansi Toko
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#30D158', marginTop: '6px' }}>
                  1.6% (Sangat Sehat)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Ambang batas risiko: &gt; 3.0%
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Keandalan Sinyal IMEI
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)', marginTop: '6px' }}>
                  98.4% Bebas Blokir
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Garansi Sinyal Seumur Hidup
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Penyelesaian Tiket RMA
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#FF9F0A', marginTop: '6px' }}>
                  100% Dituntaskan
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Tukar Unit / Servis Teknisi
                </div>
              </div>
            </div>

            {/* Defect Distribution & Supplier Advisory */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Defect Breakdown */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700' }}>
                  Klasifikasi Kasus Kerusakan Garansi (RMA)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600' }}>1. Kendala Sinyal / Pendaftaran IMEI</span>
                      <span style={{ fontWeight: '700', color: '#FF9F0A' }}>42% (Kasus Utama)</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: '42%', height: '100%', background: '#FF9F0A', borderRadius: '999px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600' }}>2. Baterai Drop / Notifikasi Unknown Part</span>
                      <span style={{ fontWeight: '700', color: '#FF453A' }}>28%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: '28%', height: '100%', background: '#FF453A', borderRadius: '999px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600' }}>3. Layar LCD / Garis Shadow / TrueTone</span>
                      <span style={{ fontWeight: '700', color: 'var(--accent)' }}>18%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: '18%', height: '100%', background: 'var(--accent)', borderRadius: '999px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600' }}>4. Kamera Bergetar OIS / Jamur Lensa</span>
                      <span style={{ fontWeight: '700', color: '#A855F7' }}>12%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: '12%', height: '100%', background: '#A855F7', borderRadius: '999px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Advisory Notice */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <ShieldCheck style={{ width: '18px', height: '18px', color: '#30D158' }} />
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                      Rekomendasi Quality Control (QC) Owner
                    </h3>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', lineHeight: '1.6', margin: '0 0 12px' }}>
                    Mayoritas klaim garansi toko berasal dari kendala sinyal pada unit *Inter All Operator* setelah 14 hari pemakaian. 
                  </p>
                  <div style={{ background: 'rgba(255, 159, 10, 0.08)', border: '1px solid rgba(255, 159, 10, 0.25)', borderRadius: '8px', padding: '12px', fontSize: '11.5px', color: '#FF9F0A' }}>
                    <strong>Instruksi Gudang:</strong> Lakukan uji sinyal SIM 48 jam berturut-turut pada semua batch unit second dari supplier Batam sebelum dicetak barcode stiker dan dipajang di etalase.
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '16px' }}>
                  Terakhir diperbarui: 24 Oktober 2026 • Analisis Otomatis Sistem
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB PRE-ORDER: MONITORING INDEN & TITIP DP                                */}
        {/* ========================================================================= */}
        {activeTab === 'po_monitor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Monitoring Pre-Order &amp; Titip Down Payment (DP)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                Pantau dana DP yang mengendap di kas toko, daftar inden seri iPhone terbaru, dan potensi sisa pelunasan.
              </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Total DP Diterima di Kas
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#30D158', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(preorderAnalytics.totalDp)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Dana mengendap aman di kasir
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Potensi Sisa Pelunasan
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(preorderAnalytics.remainingPotential)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Akan diterima saat unit datang
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Unit Menunggu Kedatangan
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#FF9F0A', marginTop: '6px' }}>
                  {preorderAnalytics.pendingCount} Unit
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {preorderAnalytics.fulfilledCount} pesanan sudah lunas
                </div>
              </div>
            </div>

            {/* Preorder Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', overflow: 'hidden', maxWidth: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                  Daftar Pesanan Pre-Order / Inden Pelanggan
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                  👉 Geser horizontal
                </span>
              </div>

              <div className="table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
                <table className="tidy-table w-full text-left" style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>No. PO</th>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Pelanggan &amp; WhatsApp</th>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Model iPhone Dipesan</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>DP Diterima</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total Nilai</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Sisa Pelunasan</th>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Estimasi Tiba</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preorderAnalytics.list.map(po => {
                      const isLunas = po.status?.includes('Lunas');
                      const sisa = Math.max(0, (po.estimatedTotal || 0) - (po.dpAmount || 0));
                      return (
                        <tr key={po.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px 10px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                            {po.id}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <div style={{ fontWeight: '700' }}>{po.customerName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{po.phone}</div>
                          </td>
                          <td style={{ padding: '12px 10px', fontWeight: '600' }}>
                            {po.modelRequested}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', color: '#30D158', fontFamily: 'var(--font-mono)' }}>
                            {formatRupiah(po.dpAmount)}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                            {formatRupiah(po.estimatedTotal)}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', color: isLunas ? '#30D158' : '#FF9F0A', fontFamily: 'var(--font-mono)' }}>
                            {isLunas ? 'Rp 0 (Lunas)' : formatRupiah(sisa)}
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>
                            {po.dueDate || po.orderDate}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              background: isLunas ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 159, 10, 0.15)',
                              color: isLunas ? '#30D158' : '#FF9F0A',
                              border: `1px solid ${isLunas ? 'rgba(48, 209, 88, 0.3)' : 'rgba(255, 159, 10, 0.3)'}`,
                              padding: '3px 8px',
                              borderRadius: '6px'
                            }}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB STAF: PERFORMA STAF KASIR & KOMISI PENJUALAN                          */}
        {/* ========================================================================= */}
        {activeTab === 'staff_perf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Performa Tim Kasir &amp; Komisi Closing Unit
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dim)' }}>
                Monitoring performa penjualan kasir per cabang, perhitungan otomatis insentif komisi, dan log audit keamanan transaksi.
              </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Total Staf Kasir Aktif
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginTop: '6px' }}>
                  {staffPerformance.length} Staf
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Bertugas di Surabaya &amp; Malang
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Total Transaksi Kasir
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)', marginTop: '6px' }}>
                  {filteredSales.length} Nota Selesai
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  100% terekonsiliasi di laci kas
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Estimasi Komisi Kasir
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#30D158', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(staffPerformance.reduce((s, p) => s + p.commission, 0))}
                </div>
                <div style={{ fontSize: '11px', color: '#30D158', marginTop: '4px', fontWeight: '600' }}>
                  Skema: Rp 25.000 / unit Apple terjual
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                  Rata-rata Nilai Nota (AOV)
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#FF9F0A', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(analytics.aov)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Per transaksi di meja kasir
                </div>
              </div>
            </div>

            {/* Staff Leaderboard */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', overflow: 'hidden', maxWidth: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                  Sales Leaderboard &amp; Rekap Insentif Kasir
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: '6px' }}>
                  👉 Geser horizontal
                </span>
              </div>

              <div className="table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
                <table className="tidy-table w-full text-left" style={{ width: '100%', minWidth: '740px', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Peringkat &amp; Nama Kasir</th>
                      <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Penugasan Cabang</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>Transaksi</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>Unit Terjual</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Total Omzet</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Komisi Diperoleh</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Rata-rata Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerformance.map((st, idx) => (
                      <tr key={st.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '700' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', width: '22px', height: '22px', borderRadius: '50%', background: idx === 0 ? '#FFD700' : 'rgba(255,255,255,0.1)', color: idx === 0 ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                              #{idx + 1}
                            </span>
                            <span>{st.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>{st.branchName}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600' }}>{st.txCount} Nota</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', color: 'var(--accent)' }}>{st.unitsSold} Unit</td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                          {formatRupiah(st.totalRevenue)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', color: '#30D158', fontFamily: 'var(--font-mono)' }}>
                          {formatRupiah(st.commission)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {formatRupiah(st.txCount > 0 ? st.totalRevenue / st.txCount : 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit & Security Log Notice */}
            <div style={{ background: 'rgba(255, 69, 58, 0.05)', border: '1px solid rgba(255, 69, 58, 0.25)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield style={{ width: '20px', height: '20px', color: '#FF453A' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                    Audit Keamanan Kasir: Proteksi Void &amp; Diskon Manual
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    100% pembatalan transaksi (*void*) atau diskon manual di luar promo resmi wajib diotorisasi PIN Supervisor (1234).
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(48, 209, 88, 0.15)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.3)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                Sistem Audit Aktif
              </span>
            </div>

          </div>
        )}

      </div>

      {/* MODAL DETAIL STRUK THERMAL PREVIEW */}
      {selectedReceipt && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Salinan Struk Transaksi</h3>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{
              background: '#FFFFFF',
              color: '#000000',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: '1.5',
              border: '1px solid #D1D5DB',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #000000', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontWeight: '800', fontSize: '13px' }}>iConicstore</div>
                <div style={{ fontSize: '10px' }}>Apple Authorized Reseller &amp; Service</div>
                <div style={{ fontSize: '9px', color: '#4B5563' }}>{selectedReceipt.branchName || 'Cabang Surabaya Pusat'}</div>
              </div>

              <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                <div>Nota: {selectedReceipt.id}</div>
                <div>Waktu: {selectedReceipt.date}</div>
                <div>Kasir: {selectedReceipt.cashierName}</div>
                <div>Customer: {selectedReceipt.customerName} ({selectedReceipt.customerPhone})</div>
              </div>

              <div style={{ borderTop: '1px dashed #000000', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedReceipt.items.map(it => (
                  <div key={it.id || it.imei} style={{ fontSize: '10px' }}>
                    <div style={{ fontWeight: '700' }}>{it.modelName}</div>
                    <div style={{ color: '#4B5563' }}>IMEI: {it.imei} ({it.condition})</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Harga:</span>
                      <span style={{ fontWeight: '700' }}>{formatRupiah(it.appliedPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #000000', marginTop: '8px', paddingTop: '6px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                  <span>TOTAL:</span>
                  <span>{formatRupiah(selectedReceipt.total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Metode:</span>
                  <span>{selectedReceipt.paymentMethod.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="btn btn-secondary text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary text-xs font-bold"
              >
                Cetak Struk
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL TAMBAH BEBAN OPEX */}
      {isAddOpexModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Catat Beban Operasional (OPEX)</h3>
              <button
                type="button"
                onClick={() => setIsAddOpexModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form onSubmit={handleAddOpex} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px' }}>
                  Kategori Biaya:
                </label>
                <select
                  value={newOpexCategory}
                  onChange={(e) => setNewOpexCategory(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="Sewa Toko / Mall">Sewa Toko / Mall</option>
                  <option value="Listrik & Utilitas">Listrik &amp; Utilitas (PLN, PDAM, Internet)</option>
                  <option value="Gaji & Operasional">Gaji &amp; Uang Makan Staf</option>
                  <option value="Operasional & Packing">Operasional &amp; Packing (Box, Bubble Wrap)</option>
                  <option value="Marketing & Iklan">Marketing &amp; Iklan (Meta Ads, Influencer)</option>
                  <option value="Pemeliharaan & Servis">Pemeliharaan &amp; Servis Toko</option>
                  <option value="Lainnya">Pengeluaran Lainnya</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px' }}>
                  Tanggal Pengeluaran:
                </label>
                <input
                  type="date"
                  value={newOpexDate}
                  onChange={(e) => setNewOpexDate(e.target.value)}
                  className="input-field"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px' }}>
                  Cabang Outlet:
                </label>
                <select
                  value={newOpexBranch}
                  onChange={(e) => setNewOpexBranch(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="all">Semua Cabang (Beban Pusat)</option>
                  <option value="b1">Cabang Surabaya Pusat</option>
                  <option value="b2">Cabang Malang Town Square</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px' }}>
                  Keterangan / Deskripsi Biaya:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sewa Outlet Surabaya Bulan Oktober"
                  value={newOpexDesc}
                  onChange={(e) => setNewOpexDesc(e.target.value)}
                  className="input-field"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '4px' }}>
                  Nominal Biaya (Rp):
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 8500000"
                  value={newOpexAmount}
                  onChange={(e) => setNewOpexAmount(e.target.value)}
                  className="input-field"
                  required
                  style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddOpexModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-bold"
                >
                  Simpan Biaya
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL Z-REPORT PREVIEW */}
      {selectedShiftDetail && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Detail Z-Report Kasir</h3>
              <button
                type="button"
                onClick={() => setSelectedShiftDetail(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div style={{
              background: '#FFFFFF',
              color: '#000000',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10.5px',
              lineHeight: '1.5',
              border: '1px solid #D1D5DB',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #000000', paddingBottom: '6px', marginBottom: '8px' }}>
                <div style={{ fontWeight: '800', fontSize: '12px' }}>iConicstore CLOSING REPORT</div>
                <div style={{ fontSize: '9px' }}>{selectedShiftDetail.branchName}</div>
                <div style={{ fontSize: '9px', color: '#4B5563' }}>ID: {selectedShiftDetail.id}</div>
              </div>

              <div style={{ fontSize: '9px', marginBottom: '8px' }}>
                <div>Waktu Closing: {selectedShiftDetail.date}</div>
                <div>Kasir: {selectedShiftDetail.cashier}</div>
                <div>Total Transaksi: {selectedShiftDetail.txCount} Transaksi</div>
              </div>

              <div style={{ borderTop: '1px dashed #000000', padding: '6px 0', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Modal Awal Kas:</span>
                  <span>{formatRupiah(selectedShiftDetail.startingCash)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Penjualan Tunai:</span>
                  <span>+{formatRupiah(selectedShiftDetail.cashSales)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Penjualan Non-Tunai:</span>
                  <span>{formatRupiah(selectedShiftDetail.nonCashSales)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', borderTop: '1px solid #000000', paddingTop: '4px' }}>
                  <span>Uang Seharusnya:</span>
                  <span>{formatRupiah(selectedShiftDetail.totalExpected)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Uang Fisik Kasir:</span>
                  <span>{formatRupiah(selectedShiftDetail.actualCash)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                  <span>Selisih:</span>
                  <span>{formatRupiah(selectedShiftDetail.diff)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedShiftDetail(null)}
              style={{
                width: '100%',
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
              Tutup
            </button>

          </div>
        </div>
      )}

      {/* MODAL TAMBAH MASTER PRODUK */}
      {isAddMasterModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Tambah Master Produk Apple Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddMasterModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMasterName.trim()) return;
                const newMaster = {
                  id: `m-${Date.now().toString().slice(-6)}`,
                  name: newMasterName,
                  category: newMasterCat,
                  baseRetail: Number(newMasterRetail || 0),
                  baseReseller: Number(newMasterReseller || 0),
                  baseHpp: Number(newMasterHpp || 0),
                  minStockAlert: Number(newMasterMinStock || 2),
                  active: true,
                  image: newMasterImage || getApplePresetPhoto(newMasterName || newMasterCat),
                  imageCustom: !!newMasterImageCustom
                };
                if (onAddMasterProduct) onAddMasterProduct(newMaster);
                setIsAddMasterModalOpen(false);
                showToast(`Seri master ${newMaster.name} berhasil ditambahkan ke katalog.`, 'success', 'Master Produk Ditambahkan');
                setNewMasterName('');
                setNewMasterRetail('');
                setNewMasterReseller('');
                setNewMasterHpp('');
                setNewMasterImage('');
                setNewMasterImageCustom(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Nama Seri / Model:</label>
                <input
                  type="text"
                  placeholder="Contoh: iPhone 16 Plus"
                  value={newMasterName}
                  onChange={(e) => setNewMasterName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Kategori:</label>
                <select
                  value={newMasterCat}
                  onChange={(e) => setNewMasterCat(e.target.value)}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Estimasi HPP (Modal):</label>
                  <input
                    type="number"
                    placeholder="Contoh: 12000000"
                    value={newMasterHpp}
                    onChange={(e) => setNewMasterHpp(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Harga Retail Acuan:</label>
                  <input
                    type="number"
                    placeholder="Contoh: 14500000"
                    value={newMasterRetail}
                    onChange={(e) => setNewMasterRetail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Harga Reseller (Grosir):</label>
                  <input
                    type="number"
                    placeholder="Contoh: 13800000"
                    value={newMasterReseller}
                    onChange={(e) => setNewMasterReseller(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Alert Min. Stok (Unit):</label>
                  <input
                    type="number"
                    value={newMasterMinStock}
                    onChange={(e) => setNewMasterMinStock(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <MasterPhotoField
                value={newMasterImage}
                name={newMasterName}
                category={newMasterCat}
                onChange={(img, custom) => { setNewMasterImage(img); setNewMasterImageCustom(custom); }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddMasterModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-bold"
                >
                  Simpan Master
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL EDIT MASTER PRODUK */}
      {editingMaster && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Edit Master Produk Apple</h3>
              <button
                type="button"
                onClick={() => setEditingMaster(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingMaster.name?.trim()) return;
                const updated = {
                  ...editingMaster,
                  image: editingMaster.image || getApplePresetPhoto(editingMaster.name || editingMaster.category),
                  name: editingMaster.name.trim(),
                  category: editingMaster.category || 'iphone',
                  baseRetail: Number(editingMaster.baseRetail || 0),
                  baseReseller: Number(editingMaster.baseReseller || 0),
                  baseHpp: Number(editingMaster.baseHpp || 0),
                  minStockAlert: Number(editingMaster.minStockAlert || 2),
                  active: editingMaster.active !== false
                };
                if (onUpdateMasterProduct) onUpdateMasterProduct(updated);
                setEditingMaster(null);
                showToast(`Data seri master ${updated.name} berhasil diperbarui.`, 'success', 'Master Diperbarui');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Nama Seri / Model:</label>
                <input
                  type="text"
                  placeholder="Contoh: iPhone 16 Plus"
                  value={editingMaster.name || ''}
                  onChange={(e) => setEditingMaster(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Kategori:</label>
                <select
                  value={editingMaster.category || 'iphone'}
                  onChange={(e) => setEditingMaster(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Estimasi HPP (Modal):</label>
                  <input
                    type="number"
                    placeholder="Contoh: 12000000"
                    value={editingMaster.baseHpp ?? ''}
                    onChange={(e) => setEditingMaster(prev => ({ ...prev, baseHpp: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Harga Retail Acuan:</label>
                  <input
                    type="number"
                    placeholder="Contoh: 14500000"
                    value={editingMaster.baseRetail ?? ''}
                    onChange={(e) => setEditingMaster(prev => ({ ...prev, baseRetail: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Harga Reseller (Grosir):</label>
                  <input
                    type="number"
                    placeholder="Contoh: 13800000"
                    value={editingMaster.baseReseller ?? ''}
                    onChange={(e) => setEditingMaster(prev => ({ ...prev, baseReseller: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Alert Min. Stok (Unit):</label>
                  <input
                    type="number"
                    value={editingMaster.minStockAlert ?? ''}
                    onChange={(e) => setEditingMaster(prev => ({ ...prev, minStockAlert: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Status Seri Master:</label>
                <select
                  value={editingMaster.active !== false ? 'active' : 'inactive'}
                  onChange={(e) => setEditingMaster(prev => ({ ...prev, active: e.target.value === 'active' }))}
                  className="input-field"
                >
                  <option value="active">Aktif (Tersedia untuk acuan & stok)</option>
                  <option value="inactive">Nonaktif (Diarsipkan)</option>
                </select>
              </div>

              <MasterPhotoField
                value={editingMaster.image}
                name={editingMaster.name}
                category={editingMaster.category}
                onChange={(img, custom) => setEditingMaster(prev => ({ ...prev, image: img, imageCustom: custom }))}
              />

              {/* Info banner explaining physical stock vs master catalog */}
              <div style={{ background: 'rgba(0, 113, 227, 0.08)', border: '1px solid rgba(0, 113, 227, 0.25)', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', color: 'var(--text-dim)', lineHeight: '1.45' }}>
                <span style={{ fontWeight: '700', color: 'var(--accent)', display: 'block', marginBottom: '2px' }}>Info Penambahan Stok Fisik:</span>
                Modal ini mengatur acuan harga dan ambang batas alert. Untuk menambah unit fisik ke toko, gunakan tombol <strong>"+ Stok"</strong> pada tabel atau menu <strong>"Barcode &amp; Gudang"</strong> (menggunakan nomor IMEI unik per unit).
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingMaster(null)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT CABANG */}
      {branchForm && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                {branchForm.id ? 'Edit Data Cabang' : 'Tambah Cabang Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setBranchForm(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = (branchForm.name || '').trim();
                if (!name) {
                  showToast('Nama cabang wajib diisi.', 'warning', 'Data Belum Lengkap');
                  return;
                }
                const duplicate = (branches || []).some(b => b.id !== branchForm.id && b.name.trim().toLowerCase() === name.toLowerCase());
                if (duplicate) {
                  showToast(`Nama cabang "${name}" sudah digunakan. Gunakan nama lain.`, 'warning', 'Nama Cabang Ganda');
                  return;
                }
                const payload = {
                  id: branchForm.id || `b${Date.now().toString().slice(-6)}`,
                  name,
                  address: (branchForm.address || '').trim(),
                  phone: (branchForm.phone || '').trim()
                };
                if (branchForm.id) {
                  if (onUpdateBranch) onUpdateBranch(payload);
                  showToast(`Data cabang ${name} berhasil diperbarui.`, 'success', 'Cabang Diperbarui');
                } else {
                  if (onAddBranch) onAddBranch(payload);
                  showToast(`Cabang ${name} berhasil ditambahkan.`, 'success', 'Cabang Ditambahkan');
                }
                setBranchForm(null);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Nama Cabang:</label>
                <input
                  type="text"
                  placeholder="Contoh: Cabang Sidoarjo"
                  value={branchForm.name || ''}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Alamat:</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Pemuda No. 45, Surabaya"
                  value={branchForm.address || ''}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, address: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Nomor WhatsApp / Telepon:</label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={branchForm.phone || ''}
                  onChange={(e) => setBranchForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setBranchForm(null)} className="btn btn-secondary text-xs">Batal</button>
                <button type="submit" className="btn btn-primary text-xs font-bold">
                  {branchForm.id ? 'Simpan Perubahan' : 'Simpan Cabang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS CABANG */}
      {deletingBranch && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 69, 58, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF453A', flexShrink: 0 }}>
                <Trash2 style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Hapus Cabang</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Konfirmasi penghapusan cabang</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '1.5', margin: '0 0 16px', color: 'var(--text)' }}>
              Apakah Anda yakin ingin menghapus <strong>{deletingBranch.name}</strong>? Riwayat transaksi cabang ini tetap tersimpan di laporan.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button type="button" onClick={() => setDeletingBranch(null)} className="btn btn-secondary text-xs">Batal</button>
              <button
                type="button"
                onClick={() => {
                  const deletedName = deletingBranch.name;
                  if (onDeleteBranch) onDeleteBranch(deletingBranch.id);
                  setDeletingBranch(null);
                  showToast(`Cabang ${deletedName} berhasil dihapus.`, 'info', 'Cabang Dihapus');
                }}
                style={{ background: '#FF453A', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS MASTER PRODUK */}
      {deletingMaster && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 69, 58, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF453A', flexShrink: 0 }}>
                <Trash2 style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Hapus Seri Master</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Konfirmasi penghapusan katalog</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '1.5', margin: '0 0 16px', color: 'var(--text)' }}>
              Apakah Anda yakin ingin menghapus seri master <strong>{deletingMaster.name}</strong> dari katalog dan acuan harga toko?
            </p>

            {(() => {
              const linkedCount = (units || []).filter(u => 
                (u.modelName && deletingMaster.name && u.modelName.toLowerCase().includes(deletingMaster.name.toLowerCase())) ||
                u.masterId === deletingMaster.id
              ).length;
              if (linkedCount > 0) {
                return (
                  <div style={{ background: 'rgba(255, 159, 10, 0.1)', border: '1px solid rgba(255, 159, 10, 0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '11.5px', color: '#FF9F0A' }}>
                    <strong>Perhatian:</strong> Terdapat {linkedCount} unit fisik di inventaris yang sesuai dengan seri ini. Stok fisik unit tetap tersimpan, namun acuan harga master untuk seri ini akan dihapus dari katalog.
                  </div>
                );
              }
              return null;
            })()}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeletingMaster(null)}
                className="btn btn-secondary text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const deletedName = deletingMaster.name;
                  if (onDeleteMasterProduct) onDeleteMasterProduct(deletingMaster.id);
                  setDeletingMaster(null);
                  showToast(`Seri master ${deletedName} berhasil dihapus dari katalog.`, 'info', 'Seri Master Dihapus');
                }}
                style={{
                  background: '#FF453A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL INPUT UNIT FISIK CEPAT (+ STOK) */}
      {quickAddStockMaster && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus style={{ width: '16px', height: '16px', color: '#30D158' }} />
                  <span>Tambah Stok Unit Fisik Baru</span>
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '600' }}>
                  Seri: {quickAddStockMaster.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddStockMaster(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!quickImei || quickImei.trim().length < 8) {
                  showToast('Nomor IMEI fisik wajib diisi minimal 8 digit.', 'error', 'Validasi IMEI');
                  return;
                }
                const shortCode = quickImei.trim().slice(-5);
                const barcodeCode = `BC-${quickAddStockMaster.name.replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${shortCode}`;
                
                const createdUnit = {
                  id: `unit-${Date.now().toString().slice(-6)}`,
                  masterId: quickAddStockMaster.id,
                  modelName: `${quickAddStockMaster.name} ${quickStorage} ${quickColor}`,
                  color: quickColor,
                  storage: quickStorage,
                  category: quickAddStockMaster.category || 'iphone',
                  condition: quickCondition,
                  grade: quickGrade,
                  batteryHealth: Number(quickBh || 100),
                  imei: quickImei.trim(),
                  serialNumber: `SN${quickImei.trim().slice(-8)}`,
                  signalOrigin: 'Resmi Indonesia (iBox)',
                  signalWarranty: 'Permanen Seumur Hidup',
                  storeWarranty: '1 Bulan Tukar Unit Toko',
                  priceModal: Number(quickAddStockMaster.baseHpp || 0),
                  priceRetail: Number(quickAddStockMaster.baseRetail || 0),
                  priceReseller: Number(quickAddStockMaster.baseReseller || 0),
                  barcodeCode: barcodeCode,
                  status: 'available',
                  branchId: quickBranchId,
                  image: quickAddStockMaster.image || getApplePresetPhoto(quickAddStockMaster.name || quickAddStockMaster.category)
                };

                if (onAddUnit) onAddUnit(createdUnit);
                setQuickAddStockMaster(null);
                showToast(`Unit fisik ${createdUnit.modelName} (IMEI: ${createdUnit.imei}) berhasil ditambahkan ke inventaris toko!`, 'success', 'Stok Berhasil Ditambahkan');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Kapasitas / Ukuran:</label>
                  <select
                    value={quickStorage}
                    onChange={(e) => setQuickStorage(e.target.value)}
                    className="input-field"
                  >
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                    <option value="40mm">40mm</option>
                    <option value="44mm">44mm</option>
                    <option value="46mm">46mm</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Varian Warna:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Midnight"
                    value={quickColor}
                    onChange={(e) => setQuickColor(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>Nomor IMEI Fisik (15 Digit):</label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = '35' + Math.floor(1000000000000 + Math.random() * 9000000000000);
                      setQuickImei(rand);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '10px', cursor: 'pointer', padding: 0, fontWeight: '700' }}
                  >
                    ⚡ Generate IMEI Acak
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: 358742110982341"
                  value={quickImei}
                  onChange={(e) => setQuickImei(e.target.value)}
                  className="input-field"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Kondisi Fisik:</label>
                  <select
                    value={quickCondition}
                    onChange={(e) => setQuickCondition(e.target.value)}
                    className="input-field"
                  >
                    <option value="Second Like New">Second Like New</option>
                    <option value="Baru Segel (BNIB)">Baru Segel (BNIB)</option>
                    <option value="Second Mulus Normal">Second Mulus Normal</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Battery Health (%):</label>
                  <input
                    type="number"
                    min="60"
                    max="100"
                    value={quickBh}
                    onChange={(e) => setQuickBh(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>Lokasi Cabang Outlet:</label>
                <select
                  value={quickBranchId}
                  onChange={(e) => setQuickBranchId(e.target.value)}
                  className="input-field"
                >
                  {(branches || []).map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                  ))}
                </select>
              </div>

              {/* Rincian Harga Otomatis dari Master */}
              <div style={{ background: 'var(--surface-2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <div>HPP: <strong>{formatRupiah(quickAddStockMaster.baseHpp)}</strong></div>
                <div>Retail: <strong style={{ color: 'var(--accent)' }}>{formatRupiah(quickAddStockMaster.baseRetail)}</strong></div>
                <div>Reseller: <strong style={{ color: '#C084FC' }}>{formatRupiah(quickAddStockMaster.baseReseller)}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setQuickAddStockMaster(null)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-bold"
                  style={{ background: '#30D158', color: '#061423' }}
                >
                  Simpan ke Stok
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT KATEGORI */}
      {isAddCatModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                {editingCat ? 'Edit Kategori Produk' : 'Tambah Kategori Produk Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCatModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                  Nama Kategori:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Aksesoris, Audio, Case & Charger"
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                  Deskripsi Kategori:
                </label>
                <textarea
                  placeholder="Deskripsi singkat jenis produk..."
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#FFFFFF', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={catFormIsSerialized}
                    onChange={(e) => setCatFormIsSerialized(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Perangkat Serialized (Wajib Nomor IMEI / SN)</span>
                </label>
                <p style={{ margin: '2px 0 0 24px', fontSize: '10.5px', color: 'var(--text-dim)' }}>
                  Centang jika produk memiliki IMEI 15 digit (seperti iPhone, iPad Cellular). Jangan dicentang untuk aksesoris/charger.
                </p>

                <div style={{ height: '10px' }} />

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#FFFFFF', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={catFormHasBattery}
                    onChange={(e) => setCatFormHasBattery(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Memiliki Baterai (Mencatat Battery Health %)</span>
                </label>
                <p style={{ margin: '2px 0 0 24px', fontSize: '10.5px', color: 'var(--text-dim)' }}>
                  Centang jika produk memiliki baterai yang perlu dicek saat QC masuk.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs font-bold"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS KATEGORI */}
      {deletingCat && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#FF453A' }}>Hapus Kategori?</h3>
            <p style={{ margin: '10px 0 16px', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.5' }}>
              Anda yakin ingin menghapus kategori <strong>{deletingCat.name}</strong>? Unit yang telah menggunakan kategori ini tidak akan terhapus.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
                className="btn btn-secondary text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="btn btn-danger text-xs font-bold"
                style={{ background: '#FF453A', color: '#FFFFFF' }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH SERI IPHONE BARU KE TAKSIRAN TRADE-IN */}
      {isAddTradeInModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone style={{ width: '18px', height: '18px', color: '#22C55E' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Tambah Seri iPhone ke Trade-In</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTradeInModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form onSubmit={handleAddNewTradeInModel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '6px' }}>
                  Nama Seri iPhone:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: iPhone 16 Pro Max, iPhone SE 2022"
                  value={newTradeInModel}
                  onChange={(e) => setNewTradeInModel(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '6px' }}>
                  Kapasitas Awal:
                </label>
                <select
                  value={newTradeInCapacity}
                  onChange={(e) => setNewTradeInCapacity(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="64GB">64GB</option>
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', marginBottom: '6px' }}>
                  Harga Taksiran Beli Dasar (Rp):
                </label>
                <input
                  type="number"
                  required
                  step="100000"
                  placeholder="Contoh: 15000000"
                  value={newTradeInPrice}
                  onChange={(e) => setNewTradeInPrice(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-mono)' }}
                />
                {newTradeInPrice && (
                  <div style={{ fontSize: '12px', color: '#22C55E', fontWeight: '700', marginTop: '4px' }}>
                    {formatRupiah(parseInt(String(newTradeInPrice).replace(/\D/g, ''), 10) || 0)}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddTradeInModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn text-xs font-bold"
                  style={{ background: '#22C55E', color: '#FFFFFF', border: 'none' }}
                >
                  Tambahkan Seri
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI RESET CENTANG STOK OPNAME (Apple Dark Glass) */}
      {isResetOpnameConfirmOpen && (
        <div 
          className="modal-backdrop" 
          onClick={() => setIsResetOpnameConfirmOpen(false)}
          style={{ 
            zIndex: 99999, 
            background: 'rgba(0, 0, 0, 0.78)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '440px', 
              padding: '26px', 
              background: 'var(--surface)', 
              border: '1px solid var(--border)',
              borderRadius: '18px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(255, 159, 10, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#FF9F0A', 
                flexShrink: 0 
              }}>
                <RotateCcw style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Reset Centang Stok Opname</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Konfirmasi Sesi Audit Fisik Baru</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: '0 0 16px', color: 'var(--text)' }}>
              Apakah Anda yakin ingin mengosongkan seluruh tanda centang verifikasi fisik? Progress checklist unit yang sudah dicocokkan akan direset ke 0 untuk memulai sesi audit baru.
            </p>

            <div style={{ 
              background: 'var(--surface-2)', 
              borderRadius: '10px', 
              padding: '10px 14px', 
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              <span style={{ color: 'var(--text-dim)' }}>Status saat ini:</span>
              <strong style={{ color: '#FF9F0A' }}>
                {opnameVerifiedCount} dari {inventoryValuation.totalUnits} Unit Tercentang
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setIsResetOpnameConfirmOpen(false)} 
                className="btn btn-secondary"
                style={{ padding: '11px', fontSize: '13px', fontWeight: '600', borderRadius: '10px' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setCheckedOpnameImeis([]);
                  setIsResetOpnameConfirmOpen(false);
                  showToast('Seluruh centang verifikasi stok opname berhasil direset ke awal.', 'info', 'Stok Opname Direset');
                }}
                style={{ 
                  background: '#FF9F0A', 
                  color: '#000000', 
                  border: 'none', 
                  padding: '11px', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(255, 159, 10, 0.3)'
                }}
              >
                Ya, Reset Centang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS MODEL TRADE-IN */}
      {deletingTradeInModel && (
        <div 
          className="modal-backdrop"
          onClick={() => setDeletingTradeInModel(null)}
          style={{ 
            zIndex: 99999, 
            background: 'rgba(0, 0, 0, 0.78)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '440px', 
              padding: '26px', 
              background: 'var(--surface)', 
              border: '1px solid var(--border)',
              borderRadius: '18px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(255, 69, 58, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#FF453A', 
                flexShrink: 0 
              }}>
                <Trash2 style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Hapus Model Taksiran</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Konfirmasi Penghapusan Patokan Harga</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: '0 0 20px', color: 'var(--text)' }}>
              Apakah Anda yakin ingin menghapus seluruh data taksiran untuk seri <strong>{deletingTradeInModel}</strong>?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setDeletingTradeInModel(null)} 
                className="btn btn-secondary"
                style={{ padding: '11px', fontSize: '13px', fontWeight: '600', borderRadius: '10px' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const mName = deletingTradeInModel;
                  setLocalTradeInValuations(prev => {
                    const copy = { ...prev };
                    delete copy[mName];
                    return copy;
                  });
                  setDeletingTradeInModel(null);
                  showToast(`Data taksiran untuk ${mName} berhasil dihapus.`, 'info');
                }}
                style={{ 
                  background: '#FF453A', 
                  color: '#FFFFFF', 
                  border: 'none', 
                  padding: '11px', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(255, 69, 58, 0.3)'
                }}
              >
                Ya, Hapus Model
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI RESET HARGA TAKSIRAN KE DEFAULT */}
      {isResetTradeInConfirmOpen && (
        <div 
          className="modal-backdrop"
          onClick={() => setIsResetTradeInConfirmOpen(false)}
          style={{ 
            zIndex: 99999, 
            background: 'rgba(0, 0, 0, 0.78)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '440px', 
              padding: '26px', 
              background: 'var(--surface)', 
              border: '1px solid var(--border)',
              borderRadius: '18px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(255, 159, 10, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#FF9F0A', 
                flexShrink: 0 
              }}>
                <RotateCcw style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Reset Standar Pabrikan</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Kembalikan Patokan Harga iConicstore</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: '0 0 20px', color: 'var(--text)' }}>
              Apakah Anda yakin ingin mereset seluruh daftar harga patokan taksiran Trade-In &amp; Jual HP ke standar awal pabrikan iConicstore?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setIsResetTradeInConfirmOpen(false)} 
                className="btn btn-secondary"
                style={{ padding: '11px', fontSize: '13px', fontWeight: '600', borderRadius: '10px' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalTradeInValuations(INITIAL_TRADE_IN_VALUATIONS);
                  if (onUpdateTradeInValuations) {
                    onUpdateTradeInValuations(INITIAL_TRADE_IN_VALUATIONS);
                  }
                  try {
                    localStorage.setItem('iconicstore_tradein_valuations', JSON.stringify(INITIAL_TRADE_IN_VALUATIONS));
                  } catch (e) {}
                  setIsResetTradeInConfirmOpen(false);
                  showToast('Daftar harga taksiran berhasil dikembalikan ke standar awal.', 'success');
                }}
                style={{ 
                  background: '#FF9F0A', 
                  color: '#000000', 
                  border: 'none', 
                  padding: '11px', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(255, 159, 10, 0.3)'
                }}
              >
                Ya, Reset Standar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH PEMBELIAN SUPPLIER PO (INBOUND KULAKAN)                   */}
      {/* ========================================================================= */}
      {isAddPurchaseModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '720px', padding: '26px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158' }}>
                  <Truck style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Catat Faktur Pembelian Supplier (PO)</h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>Input kulakan partai barang masuk dari vendor distributor</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPurchaseModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handleAddPurchaseOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                    Nama Supplier / Vendor:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Global Apple Distribusi"
                    value={newPoSupplierName}
                    onChange={(e) => setNewPoSupplierName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                    No. Telp / WhatsApp Supplier:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={newPoSupplierPhone}
                    onChange={(e) => setNewPoSupplierPhone(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                    Nomor Faktur / Invoice:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: INV/GLB/2026/10/881"
                    value={newPoInvoiceNo}
                    onChange={(e) => setNewPoInvoiceNo(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                    Gudang Cabang Penerima:
                  </label>
                  <select
                    value={newPoBranchId}
                    onChange={(e) => setNewPoBranchId(e.target.value)}
                    className="input-field"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                    Tanggal Pembelian:
                  </label>
                  <input
                    type="date"
                    required
                    value={newPoDate}
                    onChange={(e) => setNewPoDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                    Status Pembayaran:
                  </label>
                  <select
                    value={newPoPaymentStatus}
                    onChange={(e) => setNewPoPaymentStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="Lunas">Lunas (Cash / Transfer)</option>
                    <option value="Tempo / Hutang">Tempo / Hutang Dagang</option>
                  </select>
                </div>

                {newPoPaymentStatus === 'Tempo / Hutang' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#FF9F0A', fontWeight: '700', marginBottom: '4px' }}>
                      Tanggal Jatuh Tempo:
                    </label>
                    <input
                      type="date"
                      required
                      value={newPoDueDate}
                      onChange={(e) => setNewPoDueDate(e.target.value)}
                      className="input-field"
                      style={{ borderColor: 'rgba(255, 159, 10, 0.5)' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                    Metode Pembayaran:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Transfer BCA Corporate / Tunai Kas"
                    value={newPoPaymentMethod}
                    onChange={(e) => setNewPoPaymentMethod(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Item Rows Section */}
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                    Rincian Barang Kulakan
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewPoItems(prev => [...prev, { id: `poi-${Date.now()}`, productName: '', qty: 1, unitHpp: '', imeiListStr: '' }])}
                    className="btn btn-secondary text-xs"
                    style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus style={{ width: '13px', height: '13px' }} />
                    <span>Tambah Baris Produk</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {newPoItems.map((item, idx) => {
                    const rowSubtotal = (parseInt(item.qty, 10) || 0) * (parseFloat(item.unitHpp) || 0);

                    return (
                      <div key={item.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 1.5fr 1.5fr auto', gap: '8px', alignItems: 'center' }}>
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Nama Model Apple (cth: iPhone 15 Pro 128GB Blue)"
                              value={item.productName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewPoItems(prev => prev.map((p, i) => i === idx ? { ...p, productName: val } : p));
                              }}
                              className="input-field"
                              style={{ fontSize: '12px' }}
                            />
                          </div>

                          <div>
                            <input
                              type="number"
                              min={1}
                              required
                              placeholder="Qty"
                              value={item.qty}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewPoItems(prev => prev.map((p, i) => i === idx ? { ...p, qty: val } : p));
                              }}
                              className="input-field"
                              style={{ fontSize: '12px', textAlign: 'center' }}
                            />
                          </div>

                          <div>
                            <input
                              type="number"
                              min={0}
                              required
                              placeholder="HPP Satuan (Rp)"
                              value={item.unitHpp}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewPoItems(prev => prev.map((p, i) => i === idx ? { ...p, unitHpp: val } : p));
                              }}
                              className="input-field"
                              style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                            />
                          </div>

                          <div style={{ fontSize: '12px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#30D158', textAlign: 'right' }}>
                            {formatRupiah(rowSubtotal)}
                          </div>

                          <div>
                            {newPoItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setNewPoItems(prev => prev.filter((_, i) => i !== idx))}
                                style={{ background: 'transparent', border: 'none', color: '#FF453A', cursor: 'pointer', padding: '4px' }}
                                title="Hapus Baris"
                              >
                                <Trash2 style={{ width: '15px', height: '15px' }} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Daftar IMEI / Serial (opsional, pisahkan dengan koma)"
                            value={item.imeiListStr}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewPoItems(prev => prev.map((p, i) => i === idx ? { ...p, imeiListStr: val } : p));
                            }}
                            className="input-field"
                            style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Total Unit Kulakan: <strong style={{ color: 'var(--text)' }}>{newPoItems.reduce((acc, it) => acc + (parseInt(it.qty, 10) || 0), 0)} Unit</strong>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#30D158', fontFamily: 'var(--font-mono)' }}>
                    Total PO: {formatRupiah(newPoItems.reduce((acc, it) => acc + ((parseInt(it.qty, 10) || 0) * (parseFloat(it.unitHpp) || 0)), 0))}
                  </div>
                </div>
              </div>

              {/* Auto Inject to Inventory Option */}
              {onAddUnit && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={autoAddUnitsToInventory}
                    onChange={(e) => setAutoAddUnitsToInventory(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <span>
                    <strong>Terbitkan Unit Langsung ke Gudang Stok</strong> (Unit otomatis berstatus Tersedia dan siap dijual di kasir).
                  </span>
                </label>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>
                  Catatan Faktur Vendor:
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan garansi supplier, kondisi fisik, atau keterangan pengiriman..."
                  value={newPoNotes}
                  onChange={(e) => setNewPoNotes(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddPurchaseModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '13px' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '800', background: '#30D158', color: '#000000' }}
                >
                  Simpan Faktur Kulakan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DETAIL FAKTUR PEMBELIAN SUPPLIER PO                               */}
      {/* ========================================================================= */}
      {selectedPurchaseDetail && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                  Faktur Pembelian Supplier
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                  {selectedPurchaseDetail.invoiceNo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPurchaseDetail(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', marginBottom: '16px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Supplier:</span>
                <div style={{ fontWeight: '700', color: 'var(--text)', marginTop: '2px' }}>{selectedPurchaseDetail.supplierName}</div>
                {selectedPurchaseDetail.supplierPhone && (
                  <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: '2px' }}>Telp: {selectedPurchaseDetail.supplierPhone}</div>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-dim)' }}>Tanggal Beli:</span>
                <div style={{ fontWeight: '700', color: 'var(--text)', marginTop: '2px' }}>{selectedPurchaseDetail.purchaseDate}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: '2px' }}>
                  Status: <strong style={{ color: selectedPurchaseDetail.paymentStatus === 'Lunas' ? '#30D158' : '#FF9F0A' }}>{selectedPurchaseDetail.paymentStatus}</strong>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-dim)' }}>Gudang Penerima:</span>
                <div style={{ fontWeight: '700', color: 'var(--text)', marginTop: '2px' }}>
                  {branches.find(b => b.id === selectedPurchaseDetail.branchId)?.name || 'Cabang Utama'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-dim)' }}>Metode Pembayaran:</span>
                <div style={{ fontWeight: '700', color: 'var(--text)', marginTop: '2px' }}>
                  {selectedPurchaseDetail.paymentMethod || 'Transfer Bank'}
                </div>
              </div>
            </div>

            {/* Item Breakdown Table */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '11px' }}>
                    <th style={{ padding: '10px 12px' }}>Item Produk</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>HPP Satuan</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPurchaseDetail.items?.map((it, idx) => (
                    <tr key={it.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text)' }}>{it.productName}</div>
                        {Array.isArray(it.imeiList) && it.imeiList.length > 0 && (
                          <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                            IMEI: {it.imeiList.join(', ')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{it.qty}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatRupiah(it.unitHpp)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#30D158' }}>{formatRupiah(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ background: 'var(--surface-2)', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '13px' }}>Total Pembelian Vendor:</span>
                <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#30D158' }}>
                  {formatRupiah(selectedPurchaseDetail.totalAmount)}
                </span>
              </div>
            </div>

            {selectedPurchaseDetail.notes && (
              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '16px' }}>
                Catatan: "{selectedPurchaseDetail.notes}"
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                {selectedPurchaseDetail.paymentStatus === 'Tempo / Hutang' && (
                  <button
                    type="button"
                    onClick={() => handleTogglePoPaymentStatus(selectedPurchaseDetail.id)}
                    style={{
                      background: 'rgba(48, 209, 88, 0.15)',
                      color: '#30D158',
                      border: '1px solid rgba(48, 209, 88, 0.4)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check style={{ width: '14px', height: '14px' }} />
                    <span>Tandai Faktur Ini Lunas Dibayar</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPurchaseDetail(null)}
                className="btn btn-secondary text-xs"
                style={{ padding: '8px 16px' }}
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DETAIL & KARTU GARANSI DIGITAL PELANGGAN                          */}
      {/* ========================================================================= */}
      {selectedCustomerDetail && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <ShieldCheck style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Kartu Garansi Digital &amp; Profil Konsumen</h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>Sertifikat resmi garansi toko &amp; riwayat belanja iConicstore</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerDetail(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Customer Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Nama Pelanggan:</span>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>{selectedCustomerDetail.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No. WhatsApp:</span>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {selectedCustomerDetail.phone || 'Tidak terdata'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Akumulasi Belanja (LTV):</span>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#30D158', fontFamily: 'var(--font-mono)' }}>
                  {formatRupiah(selectedCustomerDetail.totalSpend)}
                </div>
              </div>
            </div>

            {/* Official Digital Warranty Card Certificate */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', 
              border: '1px solid rgba(255, 255, 255, 0.15)', 
              borderRadius: '12px', 
              padding: '20px', 
              marginBottom: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '1px', color: '#FFFFFF' }}>
                    iConicstore WARRANTY CARD
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>SERTIFIKAT ELEKTRONIK JAMINAN TOKO &amp; SINYAL</div>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(48, 209, 88, 0.2)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.4)', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                  {selectedCustomerDetail.warrantyDaysRemaining > 0 
                    ? `Garansi Toko Aktif (${selectedCustomerDetail.warrantyDaysRemaining} Hari)` 
                    : 'Garansi Toko Berakhir'}
                </span>
              </div>

              {selectedCustomerDetail.latestDevice && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Perangkat:</span>
                    <div style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '13px', marginTop: '2px' }}>
                      {selectedCustomerDetail.latestDevice.modelName}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Nomor IMEI / Serial:</span>
                    <div style={{ fontWeight: '800', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '12.5px', marginTop: '2px' }}>
                      {selectedCustomerDetail.latestDevice.imei}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Garansi Toko (Mesin &amp; Part):</span>
                    <div style={{ fontWeight: '700', color: '#30D158', marginTop: '2px' }}>
                      1 Bulan Tukar Unit Toko
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Garansi Sinyal Seluler:</span>
                    <div style={{ fontWeight: '700', color: 'var(--accent)', marginTop: '2px' }}>
                      Permanen Seumur Hidup (All Operator)
                    </div>
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', marginTop: '14px', paddingTop: '10px', fontSize: '10.5px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                Ketentuan: Garansi mencakup kerusakan fungsi non-human error (bukan terkena air, jatuh pecah, atau segel baut toko rusak).
              </div>
            </div>

            {/* Purchased Units History */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Riwayat Pembelian Unit ({selectedCustomerDetail.devices.length} Perangkat)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedCustomerDetail.devices.map((d, idx) => (
                  <div key={idx} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
                    <div>
                      <strong style={{ color: 'var(--text)' }}>{d.modelName}</strong>
                      <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '10.5px', marginTop: '2px' }}>
                        IMEI: {d.imei} &bull; Tgl: {d.date?.slice(0, 10)} ({d.branchName})
                      </div>
                    </div>
                    <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                      {formatRupiah(d.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleOpenWhatsAppCare(selectedCustomerDetail)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <MessageCircle style={{ width: '15px', height: '15px' }} />
                <span>Kirim Pesan WhatsApp Follow-Up</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCustomerDetail(null)}
                className="btn btn-secondary text-xs"
                style={{ padding: '9px 16px' }}
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: KONFIRMASI RESTORE DATABASE JSON (APPLE DARK GLASS)             */}
      {/* ========================================================================= */}
      {isRestoreConfirmModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '24px', background: 'var(--surface)', border: '1px solid rgba(255, 69, 58, 0.4)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255, 69, 58, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF453A', flexShrink: 0 }}>
                <ShieldAlert style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Konfirmasi Pemulihan Database</h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>Terapkan data dari berkas cadangan JSON</span>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', lineHeight: '1.5', margin: '0 0 16px', color: 'var(--text)' }}>
              Sistem mendeteksi berkas cadangan iConicstore. Data berikut akan dimuat dan menimpa database lokal saat ini:
            </p>

            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', marginBottom: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Unit Stok:</span>
                <div style={{ fontWeight: '700', color: 'var(--text)' }}>{restoreCandidateData?.units?.length ?? 0} Unit</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Penjualan:</span>
                <div style={{ fontWeight: '700', color: 'var(--text)' }}>{restoreCandidateData?.salesHistory?.length ?? 0} Transaksi</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Master Produk:</span>
                <div style={{ fontWeight: '700', color: 'var(--text)' }}>{restoreCandidateData?.masterProducts?.length ?? 0} Produk</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Faktur Supplier PO:</span>
                <div style={{ fontWeight: '700', color: 'var(--text)' }}>{restoreCandidateData?.purchaseOrders?.length ?? 0} Faktur</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Beban OPEX:</span>
                <div style={{ fontWeight: '700', color: 'var(--text)' }}>{restoreCandidateData?.opexList?.length ?? 0} Entri</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Pengaturan &amp; PIN:</span>
                <div style={{ fontWeight: '700', color: '#30D158' }}>Tercakup &amp; Valid</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 69, 58, 0.08)', border: '1px solid rgba(255, 69, 58, 0.25)', borderRadius: '8px', padding: '10px 12px', fontSize: '11px', color: '#FF453A', marginBottom: '18px' }}>
              Perhatian: Pemulihan akan memperbarui database browser dan memuat ulang halaman secara otomatis.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsRestoreConfirmModalOpen(false);
                  setRestoreCandidateData(null);
                }}
                className="btn btn-secondary"
                style={{ padding: '11px', fontSize: '13px', fontWeight: '600', borderRadius: '10px' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                style={{
                  background: '#FF453A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '11px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 69, 58, 0.3)'
                }}
              >
                Ya, Pulihkan Database
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRATINJAU SKRIP SQL SCHEMA SUPABASE (1-KLIK SALIN)                */}
      {/* ========================================================================= */}
      {isSqlModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '820px', maxHeight: '85vh', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158' }}>
                  <Database style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Skrip Migrasi SQL Schema Supabase</h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>Jalankan di Supabase Dashboard &gt; SQL Editor &gt; New Query &gt; Run</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', background: '#0D1117', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#E6EDF3', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCopySqlSchema}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#30D158',
                  color: '#000000',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <Copy style={{ width: '15px', height: '15px' }} />
                <span>Salin Seluruh Skrip SQL ke Clipboard</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="btn btn-secondary text-xs"
                style={{ padding: '10px 18px' }}
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
