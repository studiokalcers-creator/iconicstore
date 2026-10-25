import React, { useState, useEffect } from 'react';
import HeaderNav from './components/HeaderNav';
import WebStorefront from './components/WebStorefront';
import PricelistView from './components/PricelistView';
import WarrantyCheckView from './components/WarrantyCheckView';
import TradeInView from './components/TradeInView';
import BranchLocationView from './components/BranchLocationView';
import CloudPOS from './components/CloudPOS';
import BarcodeGenerator from './components/BarcodeGenerator';
import WarrantyRMA from './components/WarrantyRMA';
import ResellersManager from './components/ResellersManager';
import PreOrderManager from './components/PreOrderManager';
import OwnerPortal from './components/OwnerPortal';
import OwnerGateView from './components/OwnerGateView';
import ErrorBoundary from './components/ErrorBoundary';
import AppleAlertToast from './components/AppleAlertToast';
import { 
  INITIAL_SERIALIZED_UNITS, 
  INITIAL_RESELLERS, 
  INITIAL_BRANCHES, 
  SERVICE_PRICELIST, 
  TRADE_IN_VALUATIONS,
  INITIAL_SALES_HISTORY,
  INITIAL_PREORDERS,
  INITIAL_SHIFT_REPORTS,
  INITIAL_MASTER_PRODUCTS,
  INITIAL_STORE_SETTINGS,
  INITIAL_CATEGORIES,
  getApplePresetPhoto
} from './data/mockData';
import { fetchSupabaseData, getSupabaseClient } from './lib/supabase';

const VALID_TABS = [
  'storefront', 
  'pricelist', 
  'warranty', 
  'tradein', 
  'lokasi', 
  'pos', 
  'inventory', 
  'tradein_warranty', 
  'preorders', 
  'resellers', 
  'owner'
];

const getTabFromHash = () => {
  if (typeof window === 'undefined') return 'storefront';
  const cleanHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  return VALID_TABS.includes(cleanHash) ? cleanHash : 'storefront';
};

const safeLoad = (key, fallback, validator) => {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') return fallback;
    const parsed = JSON.parse(saved);
    if (validator && !validator(parsed)) return fallback;
    return parsed;
  } catch (e) {
    console.warn(`[Storage] Recovery fallback used for ${key}:`, e);
    return fallback;
  }
};

export default function App() {
  // Navigation with direct URL hash synchronization (#pricelist, #tradein, etc.)
  const [currentTab, setCurrentTabState] = useState(getTabFromHash);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState(false);

  const setCurrentTab = (tab) => {
    // When leaving Owner Portal to any staff or customer tab, automatically lock owner authentication
    if (tab !== 'owner') {
      setIsOwnerAuthenticated(false);
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('iconicstore_owner_auth');
        }
      } catch (e) {}
    }

    setCurrentTabState(tab);
    try {
      if (typeof window !== 'undefined') {
        if (tab === 'storefront') {
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        } else {
          window.location.hash = tab;
        }
      }
    } catch (e) {
      // Browser history protection
    }
  };

  useEffect(() => {
    const onHashChange = () => {
      const targetTab = getTabFromHash();
      if (targetTab !== 'owner') {
        setIsOwnerAuthenticated(false);
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('iconicstore_owner_auth');
          }
        } catch (e) {}
      }
      setCurrentTabState(targetTab);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  
  // Persistent State with Safe LocalStorage & schema validators
  const [units, setUnits] = useState(() => 
    safeLoad('iconicstore_units_v2', INITIAL_SERIALIZED_UNITS, Array.isArray)
  );

  const [resellers, setResellers] = useState(() => 
    safeLoad('iconicstore_resellers', INITIAL_RESELLERS, Array.isArray)
  );

  const [salesHistory, setSalesHistory] = useState(() => 
    safeLoad('iconicstore_sales', INITIAL_SALES_HISTORY, Array.isArray)
  );

  const [preorders, setPreorders] = useState(() => 
    safeLoad('iconicstore_preorders', INITIAL_PREORDERS, Array.isArray)
  );

  const [branches, setBranches] = useState(() =>
    safeLoad('iconicstore_branches', INITIAL_BRANCHES, val => Array.isArray(val) && val.length > 0)
  );
  const [activeBranch, setActiveBranch] = useState(() => branches[0] || INITIAL_BRANCHES[0]);

  const [shiftReports, setShiftReports] = useState(() => 
    safeLoad('iconicstore_shift_reports', INITIAL_SHIFT_REPORTS, Array.isArray)
  );

  const [masterProducts, setMasterProducts] = useState(() => 
    safeLoad('iconicstore_master_products', INITIAL_MASTER_PRODUCTS, Array.isArray)
  );

  const [storeSettings, setStoreSettings] = useState(() => 
    safeLoad('iconicstore_settings', INITIAL_STORE_SETTINGS, val => val && typeof val === 'object')
  );

  // Automatically fetch latest store settings, master products, and physical units from Supabase Cloud on load
  useEffect(() => {
    fetchSupabaseData().then(cloudData => {
      if (!cloudData) return;
      if (cloudData.storeSettings) {
        setStoreSettings(prev => ({ ...prev, ...cloudData.storeSettings }));
      }
      if (cloudData.masterProducts && Array.isArray(cloudData.masterProducts) && cloudData.masterProducts.length > 0) {
        setMasterProducts(cloudData.masterProducts);
      }
      if (cloudData.units && Array.isArray(cloudData.units) && cloudData.units.length > 0) {
        setUnits(cloudData.units);
      }
    }).catch(() => {});
  }, []);

  // Master Trade-In & Buyback Valuations State
  const [tradeInValuations, setTradeInValuations] = useState(() => 
    safeLoad('iconicstore_tradein_valuations', TRADE_IN_VALUATIONS, val => val && typeof val === 'object')
  );

  useEffect(() => {
    try { 
      localStorage.setItem('iconicstore_tradein_valuations', JSON.stringify(tradeInValuations)); 
    } catch (e) {}
  }, [tradeInValuations]);

  const handleUpdateTradeInValuations = (newValuations) => {
    setTradeInValuations(newValuations);
  };

  // Owner Authentication Session State (Strictly false by default - always requires PIN to enter)
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);

  const handleOwnerLogin = (pin) => {
    const validPin = storeSettings?.ownerPin || '9999';
    if (String(pin).trim() === String(validPin).trim()) {
      setIsOwnerAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleOwnerLogout = () => {
    setIsOwnerAuthenticated(false);
    setCurrentTab('pos');
  };

  const [categories, setCategories] = useState(() => 
    safeLoad('iconicstore_categories', INITIAL_CATEGORIES, Array.isArray)
  );

  // Save to LocalStorage safely whenever state changes
  useEffect(() => {
    try { localStorage.setItem('iconicstore_categories', JSON.stringify(categories)); } catch (e) {}
  }, [categories]);

  const handleAddCategory = (newCat) => {
    setCategories(prev => [...prev, newCat]);
  };

  const handleUpdateCategory = (updatedCat) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const handleDeleteCategory = (catId) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Branch (Cabang) management
  useEffect(() => {
    try { localStorage.setItem('iconicstore_branches', JSON.stringify(branches)); } catch (e) {}
  }, [branches]);

  // Keep the active branch valid & fresh after edit / delete
  useEffect(() => {
    setActiveBranch(prev => {
      const fresh = branches.find(b => b.id === prev?.id);
      return fresh || branches[0] || prev;
    });
  }, [branches]);

  const handleAddBranch = (newBranch) => {
    setBranches(prev => [...prev, newBranch]);
  };

  const handleUpdateBranch = (updatedBranch) => {
    setBranches(prev => prev.map(b => b.id === updatedBranch.id ? updatedBranch : b));
  };

  const handleDeleteBranch = (branchId) => {
    setBranches(prev => (prev.length > 1 ? prev.filter(b => b.id !== branchId) : prev));
  };

  useEffect(() => {
    try { localStorage.setItem('iconicstore_units_v2', JSON.stringify(units)); } catch (e) {}
  }, [units]);

  useEffect(() => {
    try { localStorage.setItem('iconicstore_resellers', JSON.stringify(resellers)); } catch (e) {}
  }, [resellers]);

  useEffect(() => {
    try { localStorage.setItem('iconicstore_sales', JSON.stringify(salesHistory)); } catch (e) {}
  }, [salesHistory]);

  useEffect(() => {
    try { localStorage.setItem('iconicstore_preorders', JSON.stringify(preorders)); } catch (e) {}
  }, [preorders]);

  useEffect(() => {
    try { localStorage.setItem('iconicstore_shift_reports', JSON.stringify(shiftReports)); } catch (e) {}
  }, [shiftReports]);

  useEffect(() => {
    try { localStorage.setItem('iconicstore_master_products', JSON.stringify(masterProducts)); } catch (e) {}
  }, [masterProducts]);

  useEffect(() => {
    try { localStorage.setItem('iconicstore_settings', JSON.stringify(storeSettings)); } catch (e) {}
  }, [storeSettings]);

  const handleAddMasterProduct = (newProduct) => {
    setMasterProducts(prev => [newProduct, ...prev]);
    const client = getSupabaseClient();
    if (client) {
      client.from('master_products').upsert([{
        id: newProduct.id,
        name: newProduct.name,
        category: newProduct.category,
        image: newProduct.image || '',
        price_modal: newProduct.baseHpp || 0,
        price_retail: newProduct.baseRetail || 0,
        price_reseller: newProduct.baseReseller || 0,
        min_stock_alert: newProduct.minStockAlert || 2
      }]).catch(() => {});
    }
  };

  const handleUpdateMasterProduct = (updatedProduct) => {
    setMasterProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    const client = getSupabaseClient();
    if (client) {
      client.from('master_products').upsert([{
        id: updatedProduct.id,
        name: updatedProduct.name,
        category: updatedProduct.category,
        image: updatedProduct.image || '',
        price_modal: updatedProduct.baseHpp || 0,
        price_retail: updatedProduct.baseRetail || 0,
        price_reseller: updatedProduct.baseReseller || 0,
        min_stock_alert: updatedProduct.minStockAlert || 2
      }]).catch(() => {});
    }
  };

  const handleDeleteMasterProduct = (productId) => {
    setMasterProducts(prev => prev.filter(p => p.id !== productId));
    const client = getSupabaseClient();
    if (client) {
      client.from('master_products').delete().eq('id', productId).catch(() => {});
    }
  };

  const handleUpdateStoreSettings = (newSettings) => {
    setStoreSettings(prev => {
      const merged = { ...prev, ...newSettings };
      const client = getSupabaseClient();
      if (client) {
        client.from('store_settings').upsert([{
          id: 'primary_store_settings',
          store_name: merged.storeName || '',
          data: merged
        }]).catch(() => {});
      }
      return merged;
    });
  };

  // Auto-sync any units created in Gudang/Barcode into Master Products Catalog
  useEffect(() => {
    if (!Array.isArray(units) || units.length === 0) return;

    setMasterProducts(prevMasters => {
      const existingMasters = Array.isArray(prevMasters) ? [...prevMasters] : [];
      let hasNew = false;
      const toAdd = [];

      units.forEach(u => {
        if (!u || !u.modelName) return;
        const cleanModel = u.modelName
          .replace(/\s+(64GB|128GB|256GB|512GB|1TB|2TB|40mm|41mm|42mm|44mm|45mm|46mm|49mm).*$/i, '')
          .trim();

        if (!cleanModel) return;

        const alreadyExists = existingMasters.some(m => 
          (m.id && u.masterId && m.id === u.masterId) ||
          (m.name && cleanModel && m.name.toLowerCase() === cleanModel.toLowerCase()) ||
          (m.name && u.modelName && u.modelName.toLowerCase().startsWith(m.name.toLowerCase()))
        ) || toAdd.some(m => m.name.toLowerCase() === cleanModel.toLowerCase());

        if (!alreadyExists) {
          hasNew = true;
          toAdd.push({
            id: u.masterId && !u.masterId.startsWith('unit-') ? u.masterId : `m-${cleanModel.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            name: cleanModel,
            category: u.category || 'iphone',
            baseHpp: Number(u.priceModal || 0),
            baseRetail: Number(u.priceRetail || 0),
            baseReseller: Number(u.priceReseller || 0),
            minStockAlert: 2,
            active: true,
            image: u.image || getApplePresetPhoto(cleanModel)
          });
        }
      });

      return hasNew ? [...toAdd, ...existingMasters] : existingMasters;
    });
  }, [units]);

  // Handle unit addition
  const handleAddUnit = (newUnit) => {
    setUnits(prev => [newUnit, ...prev]);
  };

  // Handle reseller addition
  const handleAddReseller = (newReseller) => {
    setResellers(prev => [...prev, newReseller]);
  };

  // Handle reseller edit & delete
  const handleUpdateReseller = (updatedReseller) => {
    setResellers(prev => prev.map(r => r.id === updatedReseller.id ? updatedReseller : r));
  };

  const handleDeleteReseller = (resellerId) => {
    setResellers(prev => prev.filter(r => r.id !== resellerId));
  };

  // Handle completion of sale in POS
  const handleCompleteSale = (transaction) => {
    // 1. Mark units as sold
    const soldUnitIds = transaction.items.map(i => i.id);
    setUnits(prev => 
      prev.map(unit => 
        soldUnitIds.includes(unit.id) 
          ? { ...unit, status: 'sold' } 
          : unit
      )
    );

    // 2. Add to sales history
    setSalesHistory(prev => [transaction, ...prev]);

    // 3. Update reseller stats if sold to reseller
    if (transaction.reseller) {
      setResellers(prev => 
        prev.map(r => 
          r.id === transaction.reseller.id 
            ? { 
                ...r, 
                totalPurchases: r.totalPurchases + transaction.total,
                unitCount: r.unitCount + transaction.items.length 
              } 
            : r
        )
      );
    }

    // 4. Update pre-order status if fulfilling pre-order
    if (transaction.preorderId) {
      setPreorders(prev =>
        prev.map(po =>
          po.id === transaction.preorderId
            ? {
                ...po,
                status: 'Lunas & Selesai',
                fulfillmentDate: new Date().toISOString().split('T')[0],
                fulfillmentTrxId: transaction.id
              }
            : po
        )
      );
    }
  };

  // Cross-module prefill state for POS
  const [posPrefill, setPosPrefill] = useState({
    unit: null,
    resellerId: null,
    preorder: null
  });

  // Quick Action: Add unit to POS cart and switch tab
  const handleSelectUnitForPos = (unit) => {
    setPosPrefill(prev => ({ ...prev, unit }));
    setCurrentTab('pos');
  };

  // Handle preorder addition
  const handleAddPreorder = (newPo) => {
    setPreorders(prev => [newPo, ...prev]);
  };

  const handleFulfillPreorderAtPos = (po) => {
    setPosPrefill(prev => ({ ...prev, preorder: po }));
    setCurrentTab('pos');
  };

  // Quick Action: Open POS with specific Reseller active
  const handleOpenPosWithReseller = (resellerId) => {
    setPosPrefill(prev => ({ ...prev, resellerId }));
    setCurrentTab('pos');
  };

  const handleClearPosPrefill = () => {
    setPosPrefill({ unit: null, resellerId: null, preorder: null });
  };

  const availableStockCount = Array.isArray(units) 
    ? units.filter(u => u && u.status === 'available').length 
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Universal Top Header & Navigation */}
      <HeaderNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeBranch={activeBranch}
        setActiveBranch={setActiveBranch}
        branches={branches}
        isOwnerAuthenticated={isOwnerAuthenticated}
        onLockOwnerPortal={handleOwnerLogout}
        onSetOwnerAuthenticated={(val) => {
          setIsOwnerAuthenticated(val);
          try {
            if (val) sessionStorage.setItem('iconicstore_owner_auth', 'true');
            else sessionStorage.removeItem('iconicstore_owner_auth');
          } catch (e) {}
        }}
        ownerPin={storeSettings?.ownerPin || '9999'}
        storeSettings={storeSettings}
        cartCount={0}
        availableStockCount={availableStockCount}
        isStaffLoginOpen={isStaffLoginOpen}
        setIsStaffLoginOpen={setIsStaffLoginOpen}
      />

      {/* Main View Router */}
      <main className="flex-1">
        <ErrorBoundary>
        {currentTab === 'storefront' && (
          <WebStorefront
            units={units}
            categories={categories}
            masterProducts={masterProducts}
            servicePricelist={SERVICE_PRICELIST}
            tradeInValuations={TRADE_IN_VALUATIONS}
            branches={branches}
            storeSettings={storeSettings}
            onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'pricelist' && (
          <PricelistView
            units={units}
            categories={categories}
            masterProducts={masterProducts}
            branches={branches}
            onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'warranty' && (
          <WarrantyCheckView
            units={units}
            salesHistory={salesHistory}
            onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'tradein' && (
          <TradeInView
            branches={branches}
            tradeInValuations={tradeInValuations}
            onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'lokasi' && (
          <BranchLocationView
            branches={branches}
            onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'pos' && (
          <CloudPOS
            units={units}
            resellers={resellers}
            onCompleteSale={handleCompleteSale}
            activeBranch={activeBranch}
            posPrefill={posPrefill}
            onClearPosPrefill={handleClearPosPrefill}
            storeSettings={storeSettings}
          />
        )}

        {currentTab === 'inventory' && (
          <BarcodeGenerator
            units={units}
            categories={categories}
            onAddUnit={handleAddUnit}
            activeBranch={activeBranch}
          />
        )}

        {currentTab === 'tradein_warranty' && (
          <WarrantyRMA
            units={units}
            salesHistory={salesHistory}
          />
        )}

        {currentTab === 'preorders' && (
          <PreOrderManager
            preorders={preorders}
            onAddPreorder={handleAddPreorder}
            onFulfillPreorderAtPos={handleFulfillPreorderAtPos}
          />
        )}

        {currentTab === 'resellers' && (
          <ResellersManager
            resellers={resellers}
            onAddReseller={handleAddReseller}
            onUpdateReseller={handleUpdateReseller}
            onDeleteReseller={handleDeleteReseller}
            onOpenPosWithReseller={handleOpenPosWithReseller}
          />
        )}

        {currentTab === 'owner' && (
          isOwnerAuthenticated ? (
            <OwnerPortal
              salesHistory={salesHistory}
              units={units}
              resellers={resellers}
              branches={branches}
              shiftReports={shiftReports}
              masterProducts={masterProducts}
              storeSettings={storeSettings}
              categories={categories}
              tradeInValuations={tradeInValuations}
              preorders={preorders}
              onUpdateTradeInValuations={handleUpdateTradeInValuations}
              onLockOwnerPortal={handleOwnerLogout}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onDeleteBranch={handleDeleteBranch}
              onUpdateStoreSettings={handleUpdateStoreSettings}
              onAddMasterProduct={handleAddMasterProduct}
              onUpdateMasterProduct={handleUpdateMasterProduct}
              onDeleteMasterProduct={handleDeleteMasterProduct}
              onAddUnit={handleAddUnit}
              onNavigateToInventory={() => setCurrentTab('inventory')}
            />
          ) : (
            <OwnerGateView
              onVerifyPin={handleOwnerLogin}
              onCancel={() => setCurrentTab('pos')}
              ownerPin={storeSettings?.ownerPin || '9999'}
            />
          )
        )}
        </ErrorBoundary>
      </main>

      {/* Global Apple-Themed Toast & In-App Alert System */}
      <AppleAlertToast />

    </div>
  );
}
