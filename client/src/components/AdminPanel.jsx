import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  Layers,
  Settings as SettingsIcon,
  Image as ImageIcon,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Home,
  Sliders,
  DollarSign,
  BarChart2,
  ShoppingCart,
  Clock,
  Users,
  CheckCircle,
  Truck,
  XCircle,
  StickyNote,
  Filter,
  MapPin
} from 'lucide-react';
import { api, formatCurrency } from '../api';

const safeAdminAuth = {
  get: () => {
    try {
      return sessionStorage.getItem('ksf_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  },
  set: (val) => {
    try {
      if (val) {
        sessionStorage.setItem('ksf_admin_auth', 'true');
      } else {
        sessionStorage.removeItem('ksf_admin_auth');
      }
    } catch (e) {}
  }
};

function AdminPanelInner({
  onClose,
  initialProducts = [],
  initialCategories = [],
  initialSettings = {},
  onDataRefresh
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(safeAdminAuth.get);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'settings', 'banners', 'categories', 'stats'

  // Data States
  const [products, setProducts] = useState(() => Array.isArray(initialProducts) ? initialProducts : []);
  const [categories, setCategories] = useState(() => Array.isArray(initialCategories) ? initialCategories : []);
  const [settings, setSettings] = useState(() => initialSettings || {});
  const [locations, setLocations] = useState(() => {
    if (Array.isArray(initialSettings?.deliveryLocations) && initialSettings.deliveryLocations.length > 0) {
      return initialSettings.deliveryLocations;
    }
    return [];
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync props when parent loads them
  useEffect(() => {
    if (Array.isArray(initialProducts) && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    if (Array.isArray(initialCategories) && initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSettings(initialSettings);
      if (Array.isArray(initialSettings.deliveryLocations) && initialSettings.deliveryLocations.length > 0) {
        setLocations(initialSettings.deliveryLocations);
      }
    }
  }, [initialSettings]);

  // Analytics & Orders State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersFilter, setOrdersFilter] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editingOrderNote, setEditingOrderNote] = useState(null); // { id, note }

  // Search & Filters in Admin
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCatFilter, setAdminCatFilter] = useState('all');

  // Product Editor Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBannerField, setUploadingBannerField] = useState(null); // 'desktop-idx' or 'mobile-idx'

  // Banner Editor Modal State
  const [editingBanner, setEditingBanner] = useState(null);
  const [isNewBanner, setIsNewBanner] = useState(false);

  // Category Editor Modal State
  const [editingCategory, setEditingCategory] = useState(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Load latest data on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // Auto-load analytics when analytics tab opens or period changes
  useEffect(() => {
    if (isAuthenticated && activeTab === 'analytics') {
      loadAnalytics(analyticsPeriod);
    }
  }, [isAuthenticated, activeTab, analyticsPeriod]);

  // Auto-load orders when orders tab opens or filter changes
  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      loadOrders(ordersFilter);
    }
  }, [isAuthenticated, activeTab, ordersFilter]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, setRes, statRes, locRes] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getCategories().catch(() => []),
        api.getSettings().catch(() => ({})),
        api.getStats().catch(() => null),
        api.getLocations().catch(() => [])
      ]);
      if (Array.isArray(prodRes)) setProducts(prodRes);
      if (Array.isArray(catRes)) setCategories(catRes);
      if (setRes && typeof setRes === 'object') setSettings(setRes);
      if (statRes) setStats(statRes);
      if (Array.isArray(locRes) && locRes.length > 0) {
        setLocations(locRes);
      } else if (Array.isArray(setRes?.deliveryLocations)) {
        setLocations(setRes.deliveryLocations);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      showToast('Error loading database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = useCallback(async (period) => {
    setAnalyticsLoading(true);
    try {
      const data = await api.getAnalytics(period);
      setAnalytics(data || { totalClicks: 0, uniqueVisitors: 0, totalOrders: 0, totalOrderValue: 0, topProducts: [], eventBreakdown: {} });
    } catch (err) {
      setAnalytics({ totalClicks: 0, uniqueVisitors: 0, totalOrders: 0, totalOrderValue: 0, topProducts: [], eventBreakdown: {} });
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (statusFilter) => {
    setOrdersLoading(true);
    try {
      const data = await api.getOrders(statusFilter);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth Handler
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');
    try {
      await api.verifyAdminPin(pinInput);
      setIsAuthenticated(true);
      safeAdminAuth.set(true);
      showToast('Welcome to Kohinoor Signature Farms Admin');
    } catch (err) {
      setPinError(err.message || 'Invalid PIN');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    safeAdminAuth.set(false);
    onClose();
  };

  // ----------------------------------------------------
  // PRODUCT ACTIONS
  // ----------------------------------------------------
  const handleOpenAddProduct = () => {
    setIsNewProduct(true);
    setEditingProduct({
      id: 'ksf-' + Date.now(),
      name: '',
      slug: '',
      category: categories[0]?.id || 'goat',
      tagline: '',
      description: '',
      fssaiNumber: settings?.masterFssai || '13624014000889',
      shelfLife: 'Best consumed within 48 hours at 0°C to 4°C.',
      storageInstructions: 'Keep chilled in cold refrigeration (0°C - 4°C). Wash with cold water before cooking.',
      feedType: '100% Natural Organic Pasture Grass & Herbal Forage',
      halalCertified: true,
      antibioticFree: true,
      culinaryUses: 'Great for traditional gravies, Biryani, and pan roasts.',
      piecesEstimate: '14 to 18 tender pieces per kg',
      images: [],
      badges: ['Farm Fresh', '100% Halal'],
      inStock: true,
      isBestSeller: false,
      variants: [
        {
          id: 'var-' + Date.now(),
          label: '1 kg',
          weight: '1000g',
          netWeight: '980g - 1000g',
          mrp: 0,
          sellingPrice: 0,
          inStock: true,
          isDefault: true
        }
      ]
    });
  };

  const handleOpenEditProduct = (prod) => {
    setIsNewProduct(false);
    setEditingProduct({
      id: prod.id,
      name: prod.name || '',
      slug: prod.slug || '',
      category: prod.category || categories[0]?.id || 'goat',
      tagline: prod.tagline || '',
      description: prod.description || '',
      fssaiNumber: prod.fssaiNumber || settings?.masterFssai || '13624014000889',
      shelfLife: prod.shelfLife || 'Best consumed within 48 hours at 0°C to 4°C.',
      storageInstructions: prod.storageInstructions || 'Keep chilled in cold refrigeration (0°C - 4°C). Wash with cold water before cooking.',
      feedType: prod.feedType || '100% Natural Organic Pasture Grass & Herbal Forage',
      halalCertified: prod.halalCertified !== false,
      antibioticFree: prod.antibioticFree !== false,
      culinaryUses: prod.culinaryUses || '',
      piecesEstimate: prod.piecesEstimate || '',
      images: Array.isArray(prod.images) ? [...prod.images] : [],
      badges: Array.isArray(prod.badges) ? [...prod.badges] : ['Farm Fresh', '100% Halal'],
      inStock: prod.inStock !== false,
      isBestSeller: Boolean(prod.isBestSeller || (prod.badges || []).some(b => b.toLowerCase().includes('best seller') || b.toLowerCase().includes('bestseller'))),
      variants: Array.isArray(prod.variants) && prod.variants.length > 0 ? JSON.parse(JSON.stringify(prod.variants)) : [
        {
          id: 'var-' + Date.now(),
          label: '1 kg',
          weight: '1000g',
          netWeight: '980g - 1000g',
          mrp: 0,
          sellingPrice: 0,
          inStock: true,
          isDefault: true
        }
      ]
    });
  };

  const handleToggleProductStock = async (prod) => {
    try {
      const updated = { ...prod, inStock: !prod.inStock };
      await api.updateProduct(prod.id, updated);
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? updated : p)));
      if (onDataRefresh) onDataRefresh();
      showToast(`${prod.name} marked as ${updated.inStock ? 'In Stock' : 'Out of Stock'}`);
    } catch (err) {
      showToast('Failed to update stock status', 'error');
    }
  };

  const handleDeleteProduct = async (prodId, prodName) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}"?`)) return;
    try {
      await api.deleteProduct(prodId);
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
      if (onDataRefresh) onDataRefresh();
      showToast(`Deleted ${prodName}`);
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct.name.trim()) {
      alert('Please enter a Product Name');
      return;
    }
    if (!editingProduct.variants || editingProduct.variants.length === 0) {
      alert('Please configure at least one size/weight variant');
      return;
    }

    setIsSaving(true);
    try {
      if (isNewProduct) {
        const res = await api.createProduct(editingProduct);
        setProducts((prev) => [res.product, ...prev]);
        showToast('Product added successfully!');
      } else {
        const res = await api.updateProduct(editingProduct.id, editingProduct);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.product : p)));
        showToast('Product updated successfully!');
      }
      setEditingProduct(null);
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Error saving product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload handler for Product
  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res.url) {
        setEditingProduct((prev) => ({
          ...prev,
          images: [res.url, ...(prev.images || [])]
        }));
        showToast('Image uploaded successfully!');
      }
    } catch (err) {
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Image Upload handler for Hero Banners
  const handleBannerImageUpload = async (bannerIdx, file, isMobile = false) => {
    if (!file) return;
    const fieldKey = `${isMobile ? 'mobile' : 'desktop'}-${bannerIdx}`;
    setUploadingBannerField(fieldKey);
    try {
      const res = await api.uploadImage(file);
      if (res.url) {
        const copy = [...(settings.heroBanners || [])];
        if (isMobile) {
          copy[bannerIdx].mobileImage = res.url;
        } else {
          copy[bannerIdx].image = res.url;
        }
        setSettings({ ...settings, heroBanners: copy });
        showToast(`${isMobile ? 'Mobile' : 'Desktop'} banner image uploaded!`);
      }
    } catch (err) {
      showToast('Banner image upload failed', 'error');
    } finally {
      setUploadingBannerField(null);
    }
  };

  // Variant helper functions
  const handleAddVariant = () => {
    const newVar = {
      id: 'var-' + Date.now(),
      label: '500 g',
      weight: '500g',
      netWeight: '480g - 500g',
      mrp: 500,
      sellingPrice: 420,
      inStock: true,
      isDefault: false
    };
    setEditingProduct((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVar]
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    setEditingProduct((prev) => {
      const copy = [...(prev.variants || [])];
      copy[index] = {
        ...copy[index],
        [field]: value
      };
      return { ...prev, variants: copy };
    });
  };

  const handleRemoveVariant = (index) => {
    setEditingProduct((prev) => {
      const copy = [...(prev.variants || [])];
      if (copy.length <= 1) {
        alert('A product must have at least one variant');
        return prev;
      }
      copy.splice(index, 1);
      return { ...prev, variants: copy };
    });
  };

  // ----------------------------------------------------
  // SETTINGS ACTIONS
  // ----------------------------------------------------
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(settings);
      showToast('Store & WhatsApp settings updated successfully!');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // HERO BANNER ACTIONS
  // ----------------------------------------------------
  const handleSaveBanners = async (updatedBanners) => {
    setIsSaving(true);
    try {
      const newSettings = { ...settings, heroBanners: updatedBanners };
      await api.updateSettings(newSettings);
      setSettings(newSettings);
      showToast('Banners updated successfully!');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to update banners', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // CATEGORIES ACTIONS
  // ----------------------------------------------------
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) return;
    setIsSaving(true);
    try {
      await api.saveCategory(editingCategory);
      const updatedCats = await api.getCategories();
      setCategories(updatedCats);
      setEditingCategory(null);
      showToast('Category saved successfully!');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to save category', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    setIsSaving(true);
    try {
      await api.deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      showToast('Category deleted');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to delete category', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // GATED COMMUNITY DELIVERY LOCATIONS ACTIONS
  // ----------------------------------------------------
  const deliveryLocations = Array.isArray(locations) && locations.length > 0
    ? locations
    : (Array.isArray(settings?.deliveryLocations) ? settings.deliveryLocations : []);
  const [editingLocation, setEditingLocation] = useState(null);
  const [isNewLocation, setIsNewLocation] = useState(false);

  const handleOpenAddLocation = () => {
    setIsNewLocation(true);
    setEditingLocation({
      id: '',
      name: '',
      area: '',
      city: 'Hyderabad',
      pincode: '',
      deliverySlot: 'Morning 7:00 AM - 9:30 AM',
      active: true
    });
  };

  const handleOpenEditLocation = (loc) => {
    setIsNewLocation(false);
    setEditingLocation({ ...loc });
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!editingLocation || !editingLocation.name.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        ...editingLocation,
        id: isNewLocation || !editingLocation.id ? '' : editingLocation.id,
        name: editingLocation.name.trim(),
        area: (editingLocation.area || '').trim(),
        city: (editingLocation.city || 'Hyderabad').trim(),
        pincode: (editingLocation.pincode || '').toString().trim(),
        deliverySlot: (editingLocation.deliverySlot || 'Morning 7:00 AM - 9:30 AM').trim(),
        active: editingLocation.active !== false
      };

      await api.saveLocation(payload);
      const freshList = await api.getLocations();
      setLocations(freshList);
      setSettings((prev) => ({ ...prev, deliveryLocations: freshList }));
      setEditingLocation(null);
      showToast('Delivery society saved successfully!');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to save delivery location', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLocation = async (locId, locName) => {
    if (!window.confirm(`Are you sure you want to remove "${locName}" from delivery locations?`)) return;
    setIsSaving(true);
    try {
      await api.deleteLocation(locId);
      const freshList = await api.getLocations();
      setLocations(freshList);
      setSettings((prev) => ({ ...prev, deliveryLocations: freshList }));
      showToast(`Removed "${locName}" from delivery locations`);
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to delete delivery location', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLocationActive = async (locId) => {
    setIsSaving(true);
    try {
      await api.toggleLocation(locId);
      const freshList = await api.getLocations();
      setLocations(freshList);
      setSettings((prev) => ({ ...prev, deliveryLocations: freshList }));
      showToast('Delivery location status updated');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Products list (safe against null/undefined)
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSettings = settings || {};

  const filteredProducts = safeProducts.filter((p) => {
    if (!p) return false;
    const matchesCat = adminCatFilter === 'all' || p.category === adminCatFilter;
    const q = (adminSearch || '').toLowerCase();
    const nameMatch = p.name ? String(p.name).toLowerCase().includes(q) : false;
    const tagMatch = p.tagline ? String(p.tagline).toLowerCase().includes(q) : false;
    return matchesCat && (!q || nameMatch || tagMatch);
  });

  // ----------------------------------------------------
  // RENDER: LOGIN PIN SCREEN (LUXURY BRANDED AUTH PORTAL)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="ksf-admin-login-screen">
        <div className="ksf-admin-login-card animate-fade-in">
          {/* Brand Logo & Badge */}
          <div className="ksf-admin-login-logo-wrap">
            <img
              src="/logo.jpeg"
              alt="Kohinoor Signature Farms"
              className="ksf-admin-login-logo"
            />
            <div className="ksf-admin-login-badge">
              <Lock size={11} />
              <span>Admin Portal</span>
            </div>
          </div>

          <h2 className="ksf-admin-login-title">
            Kohinoor Signature Farms
          </h2>
          <p className="ksf-admin-login-subtitle">
            Management & Inventory Portal
          </p>

          <form onSubmit={handlePinSubmit} className="ksf-admin-login-form">
            <div className="ksf-form-group" style={{ textAlign: 'left', marginBottom: '1.15rem' }}>
              <label className="ksf-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} style={{ color: 'var(--gold-dark)' }} />
                <span>Security Password</span>
              </label>

              <div className="ksf-admin-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="ksf-input ksf-admin-password-input"
                  placeholder="Enter Admin Password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ksf-admin-pw-toggle"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {pinError && (
              <div className="ksf-admin-login-error animate-fade-in">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{pinError}</span>
              </div>
            )}

            <div className="ksf-admin-login-actions">
              <button
                type="submit"
                className="btn-admin-login-submit"
              >
                <span>Unlock Dashboard</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-admin-login-back"
              >
                <Home size={15} />
                <span>Return to Storefront</span>
              </button>
            </div>
          </form>

          {/* Card Footer Note */}
          <div className="ksf-admin-login-footer">
            <ShieldCheck size={14} style={{ color: 'var(--green-accent)', flexShrink: 0 }} />
            <span>Authorized access only • Kohinoor Signature Farms</span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: MAIN ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="ksf-admin-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 9999,
            background: toastMessage.type === 'error' ? 'var(--error-red)' : 'var(--green-primary)',
            color: '#FFFFFF',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles size={16} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Full-screen initial data loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(5, 26, 16, 0.72)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <RefreshCw size={44} color="#D4AF37" className="animate-spin" />
          <div style={{ color: '#fff', fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.04em' }}>
            Loading Farm Data...
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem' }}>
            Syncing products, settings & analytics
          </div>
        </div>
      )}

      {/* Saving overlay — shown during any save/delete API call */}
      {isSaving && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9997,
          background: 'rgba(5, 26, 16, 0.45)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            background: 'var(--green-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(212,175,55,0.35)'
          }}>
            <RefreshCw size={32} color="#D4AF37" className="animate-spin" />
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', letterSpacing: '0.02em' }}>
              Saving changes...
            </div>
          </div>
        </div>
      )}


      {/* Admin Top Navigation */}
      <div className="ksf-admin-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
          <img
            src="/logo.jpeg"
            alt="Logo"
            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold-primary)', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--gold-light)', lineHeight: '1.2' }}>
              KOHINOOR SIGNATURE FARMS
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Admin Control: Catalog, WhatsApp & Settings
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            onClick={loadAllData}
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.785rem',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-md)'
            }}
            title="Refresh Data"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.785rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Eye size={13} />
            <span>Live Site</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              color: '#FCA5A5',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.785rem',
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="ksf-admin-tab-bar">
        <div className="ksf-admin-tab-inner">
          <button
            className={`btn-admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={15} />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            className={`btn-admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={15} />
            <span>Store & WhatsApp Settings</span>
          </button>

          <button
            className={`btn-admin-tab ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            <ImageIcon size={15} />
            <span>Hero Banners ({(settings?.heroBanners || []).length})</span>
          </button>

          <button
            className={`btn-admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Layers size={15} />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            className={`btn-admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={15} />
            <span>Analytics & Farm Metrics</span>
          </button>

          <button
            className={`btn-admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={15} />
            <span>Live Orders {orders.length > 0 ? `(${orders.length})` : ''}</span>
          </button>

          <button
            className={`btn-admin-tab ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            <MapPin size={15} />
            <span>Delivery Societies ({deliveryLocations.length})</span>
          </button>
        </div>
      </div>

      {/* Main Admin Tab Body */}
      <div className="ksf-admin-main-body">
        {/* ====================================================
            TAB 1: PRODUCTS MANAGEMENT
            ==================================================== */}
        {activeTab === 'products' && (
          <div>
            {/* Header & Quick Action Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search products by title..."
                  className="ksf-input"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  style={{ flex: 1, minWidth: '150px', background: '#FFFFFF' }}
                />

                <select
                  className="ksf-input"
                  style={{ width: 'auto', minWidth: '120px', background: '#FFFFFF' }}
                  value={adminCatFilter}
                  onChange={(e) => setAdminCatFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenAddProduct}
                style={{
                  background: 'var(--green-primary)',
                  color: '#FFFFFF',
                  padding: '0.6rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>

            {/* Desktop Table View (>= 820px) */}
            <div className="ksf-admin-desktop-view">
              <div className="ksf-admin-table-container">
                <table className="ksf-admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Portions / Variants</th>
                      <th>Pricing & Discount</th>
                      <th>FSSAI / Expiry</th>
                      <th>Stock Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const primaryVar = p.variants?.find((v) => v.isDefault) || p.variants?.[0];
                      const mrp = primaryVar?.mrp || 0;
                      const selling = primaryVar?.sellingPrice || 0;
                      const discount = mrp > selling ? Math.round(((mrp - selling) / mrp) * 100) : 0;
                      const catObj = categories.find((c) => c.id === p.category);

                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img
                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80'}
                                alt={p.name}
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: 'var(--radius-md)',
                                  objectFit: 'cover',
                                  border: '1px solid var(--border-light)'
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--green-primary)' }}>{p.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {p.tagline?.substring(0, 45)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              style={{
                                background: 'var(--bg-subtle)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 600,
                                fontSize: '0.775rem'
                              }}
                            >
                              {catObj?.name || p.category}
                            </span>
                          </td>

                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              {p.variants?.length || 0} Portions
                            </div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                              {p.variants?.map((v) => v.label || v.weight).join(', ')}
                            </div>
                          </td>

                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--green-primary)' }}>
                              {formatCurrency(selling)}
                              {mrp > selling && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textDecoration: 'line-through', marginLeft: '6px' }}>
                                  {formatCurrency(mrp)}
                                </span>
                              )}
                            </div>
                            {discount > 0 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--discount-text)', fontWeight: 800 }}>
                                {discount}% OFF (Save {formatCurrency(mrp - selling)})
                              </span>
                            )}
                          </td>

                          <td>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                              Lic: {p.fssaiNumber || settings?.masterFssai}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {p.shelfLife?.substring(0, 30)}...
                            </div>
                          </td>

                          <td>
                            <button
                              onClick={() => handleToggleProductStock(p)}
                              style={{
                                padding: '0.3rem 0.65rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: p.inStock !== false ? 'var(--discount-bg)' : '#FEE2E2',
                                color: p.inStock !== false ? 'var(--discount-text)' : 'var(--error-red)'
                              }}
                            >
                              {p.inStock !== false ? '● In Stock' : '○ Sold Out'}
                            </button>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                style={{
                                  padding: '0.4rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--bg-subtle)',
                                  color: 'var(--green-primary)'
                                }}
                                title="Edit Product"
                              >
                                <Edit2 size={16} />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                style={{
                                  padding: '0.4rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: '#FEE2E2',
                                  color: 'var(--error-red)'
                                }}
                                title="Delete Product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          No products match your search or filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List View (< 820px) */}
            <div className="ksf-admin-mobile-cards">
              {filteredProducts.map((p) => {
                const primaryVar = p.variants?.find((v) => v.isDefault) || p.variants?.[0];
                const mrp = primaryVar?.mrp || 0;
                const selling = primaryVar?.sellingPrice || 0;
                const discount = mrp > selling ? Math.round(((mrp - selling) / mrp) * 100) : 0;
                const catObj = categories.find((c) => c.id === p.category);

                return (
                  <div key={p.id} className="ksf-admin-product-item-card">
                    {/* Top Row: Image, Title, Category & Stock */}
                    <div className="ksf-admin-prod-card-top">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80'}
                        alt={p.name}
                        className="ksf-admin-prod-card-img"
                      />
                      <div className="ksf-admin-prod-card-info">
                        <div className="ksf-admin-prod-card-title">{p.name}</div>
                        <div className="ksf-admin-prod-card-meta">
                          <span
                            style={{
                              background: 'var(--bg-subtle)',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              color: 'var(--green-primary)'
                            }}
                          >
                            {catObj?.name || p.category}
                          </span>
                          {p.isBestSeller && (
                            <span
                              style={{
                                background: '#FFF8E1',
                                border: '1px solid #D4AF37',
                                color: '#B8860B',
                                padding: '0.15rem 0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 800,
                                fontSize: '0.7rem'
                              }}
                            >
                              🔥 Best Seller
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleProductStock(p)}
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              background: p.inStock !== false ? 'var(--discount-bg)' : '#FEE2E2',
                              color: p.inStock !== false ? 'var(--discount-text)' : 'var(--error-red)'
                            }}
                          >
                            {p.inStock !== false ? '● In Stock' : '○ Sold Out'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tagline / Subtitle */}
                    {p.tagline && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                        {p.tagline}
                      </div>
                    )}

                    {/* Pricing & Portions Summary Box */}
                    <div className="ksf-admin-prod-card-details">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--green-primary)' }}>
                            {formatCurrency(selling)}
                          </strong>
                          {mrp > selling && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textDecoration: 'line-through', marginLeft: '6px' }}>
                              {formatCurrency(mrp)}
                            </span>
                          )}
                        </div>

                        {discount > 0 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--discount-text)', fontWeight: 800, background: 'var(--discount-bg)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                            {discount}% OFF (Save {formatCurrency(mrp - selling)})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem' }}>Portions:</span>
                        {(p.variants || []).map((v, vIdx) => (
                          <span
                            key={v.id || vIdx}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid var(--border-light)',
                              padding: '0.1rem 0.4rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.68rem',
                              fontWeight: 600
                            }}
                          >
                            {v.label || v.weight} ({formatCurrency(v.sellingPrice)})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="ksf-admin-prod-card-actions">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        style={{
                          flex: 1,
                          padding: '0.55rem',
                          background: 'var(--green-light-bg)',
                          color: 'var(--green-primary)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          border: '1px solid rgba(11, 59, 36, 0.15)'
                        }}
                      >
                        <Edit2 size={14} />
                        <span>Edit Product</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        style={{
                          padding: '0.55rem 0.85rem',
                          background: '#FEE2E2',
                          color: 'var(--error-red)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          border: '1px solid #FECACA'
                        }}
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                  No products match your search or filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 2: STORE & WHATSAPP SETTINGS
            ==================================================== */}
        {activeTab === 'settings' && (
          <div className="ksf-admin-card-section" style={{ maxWidth: '840px', margin: '0 auto' }}>
            <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-primary)', marginBottom: '1.25rem' }}>
              Store Identity, FSSAI & WhatsApp Configuration
            </h3>

            <form onSubmit={handleSaveSettings}>
              {/* WhatsApp Direct Ordering Config */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <MessageCircle size={20} color="#25D366" />
                  <strong style={{ color: 'var(--green-primary)', fontSize: '0.9rem' }}>Customer WhatsApp Order Destination</strong>
                </div>

                <div className="ksf-form-group">
                  <label className="ksf-form-label">WhatsApp Phone Number (with Country Code)</label>
                  <input
                    type="text"
                    className="ksf-input"
                    value={settings.whatsappNumber || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="+919876543210"
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.725rem', marginTop: '0.2rem', display: 'block' }}>
                    When customers click "Order on WhatsApp", their message will automatically open in this chat.
                  </small>
                </div>

                <div className="ksf-form-group">
                  <label className="ksf-form-label">WhatsApp Pre-Typed Message Template</label>
                  <textarea
                    className="ksf-textarea"
                    rows={5}
                    value={settings.whatsappTemplate || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappTemplate: e.target.value })}
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {['{product_name}', '{variant_name}', '{selling_price}', '{mrp}', '{discount_percent}', '{fssai_no}', '{product_url}'].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.68rem',
                          background: '#FFFFFF',
                          border: '1px solid #86EFAC',
                          padding: '0.15rem 0.35rem',
                          borderRadius: '3px',
                          fontFamily: 'monospace'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Master FSSAI & Store Info */}
              <div className="ksf-admin-grid-2col">
                <div className="ksf-form-group">
                  <label className="ksf-form-label">Master FSSAI License Number</label>
                  <input
                    type="text"
                    className="ksf-input"
                    value={settings.masterFssai || ''}
                    onChange={(e) => setSettings({ ...settings, masterFssai: e.target.value })}
                    placeholder="13624014000889"
                  />
                </div>

                <div className="ksf-form-group">
                  <label className="ksf-form-label">Founder / Managing Director</label>
                  <input
                    type="text"
                    className="ksf-input"
                    value={settings.founder || ''}
                    onChange={(e) => setSettings({ ...settings, founder: e.target.value })}
                    placeholder="Feroz Shaik"
                  />
                </div>
              </div>

              <div className="ksf-form-group">
                <label className="ksf-form-label">Top Header Announcement Bar Text</label>
                <input
                  type="text"
                  className="ksf-input"
                  value={settings.announcement || ''}
                  onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                  placeholder="🌿 100% Pure Organic & Grass-Fed • Halal Certified • Fresh Morning Cuts Direct from Farm"
                />
              </div>

              <div className="ksf-form-group">
                <label className="ksf-form-label">Farm Physical Address</label>
                <textarea
                  className="ksf-textarea"
                  rows={2}
                  value={settings.farmAddress || ''}
                  onChange={(e) => setSettings({ ...settings, farmAddress: e.target.value })}
                />
              </div>

              <div className="ksf-admin-grid-2col">
                <div className="ksf-form-group">
                  <label className="ksf-form-label">Operating / Butchery Hours</label>
                  <input
                    type="text"
                    className="ksf-input"
                    value={settings.operatingHours || ''}
                    onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
                  />
                </div>

                <div className="ksf-form-group">
                  <label className="ksf-form-label">Admin Security Password</label>
                  <input
                    type="text"
                    className="ksf-input"
                    value={settings.adminPin || ''}
                    onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                    placeholder="Enter Security Password"
                  />
                </div>
              </div>

              {/* Official Social Media Channels */}
              <div
                style={{
                  background: '#FBF9F4',
                  border: '1.5px solid var(--border-light)',
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1.5rem',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={18} style={{ color: 'var(--gold-dark)' }} />
                  <strong style={{ color: 'var(--green-primary)', fontSize: '0.95rem' }}>
                    Official Social Media Channels (Header & Footer)
                  </strong>
                </div>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  Manage the social media links displayed at the bottom of the header and in the site footer. Leave any field blank to hide that platform.
                </p>

                <div className="ksf-admin-grid-2col">
                  <div className="ksf-form-group">
                    <label className="ksf-form-label">
                      <span>📸 Instagram Profile URL</span>
                    </label>
                    <input
                      type="url"
                      className="ksf-input"
                      value={settings.socialLinks?.instagram || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: {
                            ...(settings.socialLinks || {}),
                            instagram: e.target.value
                          }
                        })
                      }
                      placeholder="https://instagram.com/kohinoorsignaturefarms"
                    />
                  </div>

                  <div className="ksf-form-group">
                    <label className="ksf-form-label">
                      <span>𝕏 X (formerly Twitter) Profile URL</span>
                    </label>
                    <input
                      type="url"
                      className="ksf-input"
                      value={settings.socialLinks?.x || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: {
                            ...(settings.socialLinks || {}),
                            x: e.target.value
                          }
                        })
                      }
                      placeholder="https://x.com/kohinoorfarms"
                    />
                  </div>
                </div>

                <div className="ksf-admin-grid-2col">
                  <div className="ksf-form-group">
                    <label className="ksf-form-label">
                      <span>👤 Facebook Page URL</span>
                    </label>
                    <input
                      type="url"
                      className="ksf-input"
                      value={settings.socialLinks?.facebook || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: {
                            ...(settings.socialLinks || {}),
                            facebook: e.target.value
                          }
                        })
                      }
                      placeholder="https://facebook.com/kohinoorsignaturefarms"
                    />
                  </div>

                  <div className="ksf-form-group">
                    <label className="ksf-form-label">
                      <span>▶️ YouTube Channel URL</span>
                    </label>
                    <input
                      type="url"
                      className="ksf-input"
                      value={settings.socialLinks?.youtube || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: {
                            ...(settings.socialLinks || {}),
                            youtube: e.target.value
                          }
                        })
                      }
                      placeholder="https://youtube.com/@kohinoorsignaturefarms"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                style={{
                  background: isSaving ? 'var(--green-mid)' : 'var(--green-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: isSaving ? 0.8 : 1,
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ====================================================
            TAB 3: HERO BANNERS
            ==================================================== */}
        {activeTab === 'banners' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                  Homepage Hero Banner Carousel
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Configure the sliding promotional banners shown at the top of the homepage.
                </p>
              </div>

              <button
                onClick={() => {
                  const newBanners = [
                    ...(settings.heroBanners || []),
                    {
                      id: 'banner-' + Date.now(),
                      title: 'New Farm Fresh Cut',
                      subtitle: 'Premium quality livestock cuts direct from Kohinoor farm.',
                      categoryFilter: 'goat',
                      badge: 'Special Cut',
                      buttonText: 'Order Fresh',
                      image: '',
                      mobileImage: ''
                    }
                  ];
                  handleSaveBanners(newBanners);
                }}
                style={{
                  background: 'var(--green-primary)',
                  color: '#FFFFFF',
                  padding: '0.6rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Plus size={16} />
                <span>Add New Banner Slide</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
              {(settings.heroBanners || []).map((banner, idx) => (
                <div
                  key={banner.id || idx}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.title}
                      style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '160px',
                        background: 'radial-gradient(circle at 50% 50%, #165B37 0%, #0B3B24 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(212, 175, 55, 0.85)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        gap: '0.35rem',
                        padding: '1rem',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>🌿</span>
                      <span>Kohinoor Emerald Gradient</span>
                      <span style={{ fontSize: '0.72rem', color: '#E2E8F0', fontWeight: 500 }}>No image uploaded — using luxury brand backdrop</span>
                    </div>
                  )}
                  <div style={{ padding: '1rem' }}>
                    <div className="ksf-form-group">
                      <label className="ksf-form-label">Headline</label>
                      <input
                        type="text"
                        className="ksf-input"
                        value={banner.title}
                        onChange={(e) => {
                          const copy = [...settings.heroBanners];
                          copy[idx].title = e.target.value;
                          setSettings({ ...settings, heroBanners: copy });
                        }}
                      />
                    </div>

                    <div className="ksf-form-group">
                      <label className="ksf-form-label">Subtitle</label>
                      <input
                        type="text"
                        className="ksf-input"
                        value={banner.subtitle}
                        onChange={(e) => {
                          const copy = [...settings.heroBanners];
                          copy[idx].subtitle = e.target.value;
                          setSettings({ ...settings, heroBanners: copy });
                        }}
                      />
                    </div>

                    <div className="ksf-admin-grid-2col">
                      <div className="ksf-form-group">
                        <label className="ksf-form-label">Badge Text</label>
                        <input
                          type="text"
                          className="ksf-input"
                          value={banner.badge || ''}
                          onChange={(e) => {
                            const copy = [...settings.heroBanners];
                            copy[idx].badge = e.target.value;
                            setSettings({ ...settings, heroBanners: copy });
                          }}
                        />
                      </div>

                      <div className="ksf-form-group">
                        <label className="ksf-form-label">Filter Category</label>
                        <select
                          className="ksf-input"
                          value={banner.categoryFilter || 'all'}
                          onChange={(e) => {
                            const copy = [...settings.heroBanners];
                            copy[idx].categoryFilter = e.target.value;
                            setSettings({ ...settings, heroBanners: copy });
                          }}
                        >
                          <option value="all">All Products</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Desktop Image Upload + URL */}
                    <div className="ksf-form-group">
                      <label className="ksf-form-label">Desktop Banner Image (Wide Landscape)</label>
                      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="ksf-input"
                          value={banner.image || ''}
                          onChange={(e) => {
                            const copy = [...settings.heroBanners];
                            copy[idx].image = e.target.value;
                            setSettings({ ...settings, heroBanners: copy });
                          }}
                          placeholder="Paste image URL or tap upload..."
                          style={{ flex: 1, fontSize: '0.8rem' }}
                        />
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.52rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--green-primary)',
                            color: '#FFFFFF',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <Upload size={13} />
                          <span>{uploadingBannerField === `desktop-${idx}` ? 'Uploading...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleBannerImageUpload(idx, e.target.files?.[0], false)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Mobile Image Upload + URL */}
                    <div className="ksf-form-group">
                      <label className="ksf-form-label">Mobile Banner Image (Portrait / Vertical - Optional)</label>
                      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="ksf-input"
                          value={banner.mobileImage || ''}
                          onChange={(e) => {
                            const copy = [...settings.heroBanners];
                            copy[idx].mobileImage = e.target.value;
                            setSettings({ ...settings, heroBanners: copy });
                          }}
                          placeholder="Paste mobile URL or tap upload..."
                          style={{ flex: 1, fontSize: '0.8rem' }}
                        />
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.52rem 0.85rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-subtle)',
                            color: 'var(--green-primary)',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Upload size={13} />
                          <span>{uploadingBannerField === `mobile-${idx}` ? 'Uploading...' : 'Upload Mobile'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleBannerImageUpload(idx, e.target.files?.[0], true)}
                          />
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <button
                        onClick={() => {
                          const copy = [...settings.heroBanners];
                          copy.splice(idx, 1);
                          handleSaveBanners(copy);
                        }}
                        style={{ color: 'var(--error-red)', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        Delete Slide
                      </button>

                      <button
                        onClick={() => handleSaveBanners(settings.heroBanners)}
                        style={{
                          background: 'var(--green-primary)',
                          color: '#FFFFFF',
                          padding: '0.4rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 4: CATEGORIES MANAGEMENT
            ==================================================== */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                  Farm Categories & Collections
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Manage the spotlight collections and add custom livestock categories.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsNewCategory(true);
                  setEditingCategory({
                    id: 'cat-' + Date.now(),
                    slug: '',
                    name: '',
                    tagline: '',
                    icon: '🥩',
                    badge: 'Farm Fresh',
                    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
                    description: ''
                  });
                }}
                style={{
                  background: 'var(--green-primary)',
                  color: '#FFFFFF',
                  padding: '0.55rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Plus size={16} />
                <span>Add Category</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
              {categories.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.1rem',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>{c.icon || '🥩'}</span>
                    <span
                      style={{
                        background: 'var(--gold-shimmer)',
                        color: 'var(--gold-dark)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {c.badge}
                    </span>
                  </div>

                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--green-primary)' }}>
                    {c.name}
                  </h4>
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: '0.3rem 0 0.85rem', lineHeight: '1.4' }}>
                    {c.tagline || c.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.65rem' }}>
                    <button
                      onClick={() => {
                        setIsNewCategory(false);
                        setEditingCategory({ ...c });
                      }}
                      style={{ color: 'var(--green-primary)', fontWeight: 700, fontSize: '0.8rem' }}
                    >
                      Edit Details
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      style={{ color: 'var(--error-red)', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 5: ANALYTICS & FARM METRICS (MERGED)
            ==================================================== */}
        {activeTab === 'analytics' && (
          <div className="ksf-analytics-tab">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="ksf-analytics-title">
                  <BarChart2 size={22} />
                  Analytics & Farm Metrics
                </h3>
                <p className="ksf-analytics-subtitle">
                  Live farm catalog snapshot, visitor engagement, and WhatsApp order conversions
                </p>
              </div>
              <button
                type="button"
                className="btn-analytics-refresh"
                onClick={() => {
                  loadAllData();
                  loadAnalytics(analyticsPeriod);
                }}
                disabled={analyticsLoading || loading}
              >
                <RefreshCw size={15} className={analyticsLoading || loading ? 'ksf-spin' : ''} />
                Sync Data
              </button>
            </div>

            {/* Farm Catalog & Inventory Metrics */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.92rem', fontWeight: 800, color: 'var(--green-primary)', letterSpacing: '0.03em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Layers size={17} />
                Farm Inventory Snapshot
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                <div className="ksf-stat-card">
                  <div className="ksf-stat-icon-box">
                    <Package size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-primary)', lineHeight: 1.1 }}>
                      {products.length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                      Active Farm Cuts
                    </div>
                  </div>
                </div>

                <div className="ksf-stat-card">
                  <div className="ksf-stat-icon-box" style={{ background: '#DCFCE7', color: '#15803D' }}>
                    <Check size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803D', lineHeight: 1.1 }}>
                      {products.filter((p) => p.inStock !== false).length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                      In-Stock Today
                    </div>
                  </div>
                </div>

                <div className="ksf-stat-card">
                  <div className="ksf-stat-icon-box" style={{ background: 'var(--gold-shimmer)', color: 'var(--gold-dark)' }}>
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-dark)', lineHeight: 1.1 }}>
                      {stats?.avgDiscount || '16'}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                      Avg Customer Savings
                    </div>
                  </div>
                </div>

                <div className="ksf-stat-card">
                  <div className="ksf-stat-icon-box">
                    <Layers size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-primary)', lineHeight: 1.1 }}>
                      {(categories || []).length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                      Farm Categories
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Traffic & Conversions Sub-section */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.92rem', fontWeight: 800, color: 'var(--green-primary)', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <TrendingUp size={17} />
                  Store Traffic & WhatsApp Conversions
                </div>

                {/* Period Selector */}
                <div className="ksf-period-pill-bar" style={{ marginBottom: 0 }}>
                  {[
                    { key: 'day', label: 'Today' },
                    { key: 'week', label: '7 Days' },
                    { key: 'month', label: '30 Days' },
                    { key: '6months', label: '6 Months' },
                    { key: 'year', label: '1 Year' }
                  ].map(p => (
                    <button
                      key={p.key}
                      type="button"
                      className={`ksf-period-pill ${analyticsPeriod === p.key ? 'active' : ''}`}
                      onClick={() => setAnalyticsPeriod(p.key)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {analyticsLoading ? (
                <div className="ksf-analytics-loader">
                  <RefreshCw size={28} className="ksf-spin" />
                  <p>Loading analytics...</p>
                </div>
              ) : analytics ? (
                <>
                  {/* Metric Cards */}
                  <div className="ksf-metric-cards">
                    <div className="ksf-metric-card">
                      <div className="ksf-metric-icon" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green-accent)' }}>
                        <BarChart2 size={22} />
                      </div>
                      <div className="ksf-metric-value">{analytics.totalClicks ?? 0}</div>
                      <div className="ksf-metric-label">Total Clicks</div>
                    </div>
                    <div className="ksf-metric-card">
                      <div className="ksf-metric-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                        <Users size={22} />
                      </div>
                      <div className="ksf-metric-value">{analytics.uniqueVisitors ?? 0}</div>
                      <div className="ksf-metric-label">Unique Visitors</div>
                    </div>
                    <div className="ksf-metric-card">
                      <div className="ksf-metric-icon" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold-primary)' }}>
                        <ShoppingCart size={22} />
                      </div>
                      <div className="ksf-metric-value">{analytics.totalOrders ?? 0}</div>
                      <div className="ksf-metric-label">WA Orders</div>
                    </div>
                    <div className="ksf-metric-card">
                      <div className="ksf-metric-icon" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success-green)' }}>
                        <DollarSign size={22} />
                      </div>
                      <div className="ksf-metric-value">{formatCurrency(analytics.totalOrderValue ?? 0)}</div>
                      <div className="ksf-metric-label">Order Value</div>
                    </div>
                  </div>

                  {/* Analytics Sections: Side-by-Side on Desktop */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                    {/* Event Breakdown */}
                    {analytics.eventBreakdown && Object.keys(analytics.eventBreakdown).length > 0 && (
                      <div className="ksf-analytics-section" style={{ margin: 0 }}>
                        <h3 className="ksf-analytics-section-title">Click Type Breakdown</h3>
                        <div className="ksf-event-breakdown">
                          {Object.entries(analytics.eventBreakdown).map(([type, count]) => {
                            const total = analytics.totalClicks || 1;
                            const pct = Math.round((count / total) * 100);
                            const labels = { buy_click: 'WhatsApp Direct', cart_add: 'Add to Cart', whatsapp_checkout: 'Cart Checkout' };
                            const colors = { buy_click: 'var(--whatsapp-green)', cart_add: 'var(--green-accent)', whatsapp_checkout: 'var(--gold-primary)' };
                            return (
                              <div key={type} className="ksf-event-row">
                                <div className="ksf-event-row-label">
                                  <span className="ksf-event-dot" style={{ background: colors[type] || 'var(--green-primary)' }} />
                                  {labels[type] || type}
                                </div>
                                <div className="ksf-event-bar-wrap">
                                  <div className="ksf-event-bar" style={{ width: `${pct}%`, background: colors[type] || 'var(--green-primary)' }} />
                                </div>
                                <div className="ksf-event-count">{count} <span className="ksf-event-pct">({pct}%)</span></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Top Products */}
                    {Array.isArray(analytics.topProducts) && analytics.topProducts.length > 0 && (
                      <div className="ksf-analytics-section" style={{ margin: 0 }}>
                        <h3 className="ksf-analytics-section-title">🔥 Top Clicked Products</h3>
                        <div className="ksf-top-products">
                          {analytics.topProducts.map((p, idx) => {
                            const maxClicks = analytics.topProducts[0]?.clicks || 1;
                            const barPct = Math.round((p.clicks / maxClicks) * 100);
                            return (
                              <div key={p.product_id || idx} className="ksf-top-product-row">
                                <span className="ksf-top-product-rank">#{idx + 1}</span>
                                <div className="ksf-top-product-info">
                                  <span className="ksf-top-product-name">{p.product_name}</span>
                                  {p.category && <span className="ksf-top-product-cat">{p.category}</span>}
                                </div>
                                <div className="ksf-top-product-bar-wrap">
                                  <div className="ksf-top-product-bar" style={{ width: `${barPct}%` }} />
                                </div>
                                <span className="ksf-top-product-clicks">{p.clicks}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {(!analytics.totalClicks || analytics.totalClicks === 0) && (
                    <div className="ksf-analytics-empty">
                      <BarChart2 size={40} />
                      <p>No clicks tracked yet for this period.</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Click data will appear here as customers browse your store.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="ksf-analytics-empty">
                  <AlertCircle size={32} />
                  <p>Could not load analytics. Make sure Supabase ksf_clicks table is created.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 6: LIVE ORDERS
            ==================================================== */}
        {activeTab === 'orders' && (
          <div className="ksf-orders-tab">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 className="ksf-analytics-title">
                  <ShoppingCart size={22} />
                  Live WhatsApp Orders
                </h3>
                <p className="ksf-analytics-subtitle">
                  Real-time customer orders placed via WhatsApp checkout
                </p>
              </div>
              <button
                type="button"
                className="btn-analytics-refresh"
                onClick={() => loadOrders(ordersFilter)}
                disabled={ordersLoading}
              >
                <RefreshCw size={15} className={ordersLoading ? 'ksf-spin' : ''} />
                Refresh Orders
              </button>
            </div>

            {/* Status Filter Pills */}
            <div className="ksf-period-pill-bar">
              {[
                { key: 'all', label: `All Orders (${orders.length})` },
                { key: 'pending', label: '🟡 Pending' },
                { key: 'confirmed', label: '✅ Confirmed' },
                { key: 'delivered', label: '🚚 Delivered' },
                { key: 'cancelled', label: '❌ Cancelled' }
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  className={`ksf-period-pill ${ordersFilter === f.key ? 'active' : ''}`}
                  onClick={() => setOrdersFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {ordersLoading ? (
              <div className="ksf-analytics-loader">
                <RefreshCw size={28} className="ksf-spin" />
                <p>Loading orders...</p>
              </div>
            ) : !Array.isArray(orders) || orders.length === 0 ? (
              <div className="ksf-analytics-empty">
                <ShoppingCart size={40} />
                <p>No orders found{ordersFilter !== 'all' ? ` with status "${ordersFilter}"` : ' yet'}.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Orders appear here when customers click "Order on WhatsApp" from the store.
                </p>
              </div>
            ) : (
              <div className="ksf-orders-list">
                {orders.map(order => {
                  const statusConfig = {
                    pending: { label: 'Pending', icon: <Clock size={13} />, cls: 'status-pending' },
                    confirmed: { label: 'Confirmed', icon: <CheckCircle size={13} />, cls: 'status-confirmed' },
                    delivered: { label: 'Delivered', icon: <Truck size={13} />, cls: 'status-delivered' },
                    cancelled: { label: 'Cancelled', icon: <XCircle size={13} />, cls: 'status-cancelled' }
                  };
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  const timeAgo = (() => {
                    const diff = Date.now() - new Date(order.created_at).getTime();
                    const mins = Math.floor(diff / 60000);
                    if (mins < 60) return `${mins}m ago`;
                    const hrs = Math.floor(mins / 60);
                    if (hrs < 24) return `${hrs}h ago`;
                    return `${Math.floor(hrs / 24)}d ago`;
                  })();
                  const items = Array.isArray(order.items) ? order.items : [];
                  const isEditingNote = editingOrderNote?.id === order.id;

                  const handleStatusUpdate = async (newStatus) => {
                    try {
                      await api.updateOrderStatus(order.id, newStatus, order.note);
                      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                      showToast(`Order ${order.order_ref} marked as ${newStatus}`);
                    } catch {
                      showToast('Failed to update order', 'error');
                    }
                  };

                  const handleNoteSave = async () => {
                    try {
                      await api.updateOrderStatus(order.id, order.status, editingOrderNote.note);
                      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, note: editingOrderNote.note } : o));
                      setEditingOrderNote(null);
                      showToast('Note saved');
                    } catch {
                      showToast('Failed to save note', 'error');
                    }
                  };

                  const handleDeleteOrder = async () => {
                    if (!window.confirm(`Are you sure you want to permanently delete order ${order.order_ref}?`)) return;
                    try {
                      await api.deleteOrder(order.id);
                      setOrders(prev => prev.filter(o => o.id !== order.id));
                      showToast(`Order ${order.order_ref} deleted`);
                    } catch {
                      showToast('Failed to delete order', 'error');
                    }
                  };

                  return (
                    <div key={order.id} className={`ksf-order-card ${sc.cls}`}>
                      {/* Order Card Header */}
                      <div className="ksf-order-card-head">
                        <div className="ksf-order-ref-row">
                          <span className="ksf-order-ref">{order.order_ref}</span>
                          <span className={`ksf-order-status-badge ${sc.cls}`}>
                            {sc.icon} {sc.label}
                          </span>
                        </div>
                        <div className="ksf-order-meta">
                          <span className="ksf-order-time"><Clock size={13} /> {timeAgo}</span>
                          <span className="ksf-order-visitor">ID: {order.visitor_id?.slice(0, 12)}…</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="ksf-order-items">
                        {items.slice(0, 4).map((item, i) => (
                          <div key={i} className="ksf-order-item-row">
                            <span className="ksf-order-item-name">{item.name}</span>
                            <span className="ksf-order-item-detail">
                              {item.variant_label} × {item.qty}
                            </span>
                            <span className="ksf-order-item-price">{formatCurrency(item.subtotal || 0)}</span>
                          </div>
                        ))}
                        {items.length > 4 && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontWeight: 600 }}>
                            +{items.length - 4} more items
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div className="ksf-order-total-row">
                        <span>Total Payable</span>
                        <span className="ksf-order-total-val">{formatCurrency(order.total_amount)}</span>
                      </div>

                      {/* Note */}
                      {isEditingNote ? (
                        <div className="ksf-order-note-edit">
                          <input
                            type="text"
                            className="ksf-input"
                            value={editingOrderNote.note}
                            onChange={e => setEditingOrderNote({ ...editingOrderNote, note: e.target.value })}
                            placeholder="Add a note (e.g. Cash on delivery, Balanagar area)"
                            autoFocus
                          />
                          <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.45rem' }}>
                            <button type="button" className="btn-order-action btn-save-note" onClick={handleNoteSave}>Save Note</button>
                            <button type="button" className="btn-order-action" style={{ background: 'var(--bg-subtle)' }} onClick={() => setEditingOrderNote(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : order.note ? (
                        <div className="ksf-order-note-display" onClick={() => setEditingOrderNote({ id: order.id, note: order.note })}>
                          <StickyNote size={14} /> {order.note}
                          <span className="ksf-note-edit-hint">(tap to edit note)</span>
                        </div>
                      ) : null}

                      {/* Action Buttons */}
                      <div className="ksf-order-actions">
                        {order.status !== 'confirmed' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button type="button" className="btn-order-action btn-confirm" onClick={() => handleStatusUpdate('confirmed')}>
                            <CheckCircle size={14} /> Confirm
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button type="button" className="btn-order-action btn-deliver" onClick={() => handleStatusUpdate('delivered')}>
                            <Truck size={14} /> Mark Delivered
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button type="button" className="btn-order-action btn-cancel" onClick={() => handleStatusUpdate('cancelled')}>
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-order-action btn-note"
                          onClick={() => setEditingOrderNote({ id: order.id, note: order.note || '' })}
                        >
                          <StickyNote size={14} /> Note
                        </button>
                        <button
                          type="button"
                          className="btn-order-action"
                          style={{
                            background: '#FEF2F2',
                            color: 'var(--error-red)',
                            border: '1px solid #FCA5A5'
                          }}
                          onClick={handleDeleteOrder}
                          title="Delete test or invalid order"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            TAB 7: EXCLUSIVE GATED COMMUNITIES DELIVERY
            ==================================================== */}
        {activeTab === 'locations' && (
          <div>
            {/* Header & Quick Action Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                width: '100%'
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: 'var(--green-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  <MapPin size={22} />
                  Exclusive Delivery Gated Communities
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Manage the gated societies where Kohinoor Signature Farms currently delivers. Selected community auto-populates on the storefront and WhatsApp checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddLocation}
                style={{
                  background: 'var(--green-primary)',
                  color: '#FFFFFF',
                  padding: '0.55rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Plus size={16} />
                <span>Add Gated Community</span>
              </button>
            </div>

            {/* Communities Grid — standardized card proportion */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 440px))',
                gap: '1.25rem',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {deliveryLocations.map((loc, idx) => (
                <div
                  key={loc.id || idx}
                  style={{
                    background: '#FFFFFF',
                    border: `1.5px solid ${loc.active !== false ? 'var(--border-light)' : '#FCA5A5'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    opacity: loc.active !== false ? 1 : 0.75
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: loc.active !== false ? '#EAF3ED' : '#FEE2E2',
                            color: loc.active !== false ? 'var(--green-primary)' : '#B91C1C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <MapPin size={16} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                          {loc.name}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleLocationActive(loc.id)}
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: loc.active !== false ? '#DCFCE7' : '#FEE2E2',
                          color: loc.active !== false ? '#15803D' : '#B91C1C',
                          border: `1px solid ${loc.active !== false ? '#86EFAC' : '#FCA5A5'}`
                        }}
                        title="Toggle active status"
                      >
                        {loc.active !== false ? '● Active' : '○ Inactive'}
                      </button>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', lineHeight: '1.4' }}>
                      📍 {loc.area}{loc.city ? `, ${loc.city}` : ''}{loc.pincode ? ` - ${loc.pincode}` : ''}
                    </div>

                    {loc.deliverySlot && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: 'var(--bg-subtle)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--green-darkest)'
                        }}
                      >
                        <span>⏰ {loc.deliverySlot}</span>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '0.5rem',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '0.65rem'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenEditLocation(loc)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.785rem',
                        fontWeight: 600,
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-dark)',
                        border: '1px solid var(--border-light)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLocation(loc.id, loc.name)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.785rem',
                        fontWeight: 600,
                        background: '#FEF2F2',
                        color: 'var(--error-red)',
                        border: '1px solid #FCA5A5',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {deliveryLocations.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3.5rem 1rem',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-light)'
                }}
              >
                <MapPin size={40} style={{ color: 'var(--gold-dark)', margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--green-primary)', marginBottom: '0.4rem' }}>
                  No Delivery Gated Communities Configured
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Add your target gated communities so customers can pick their society from the header.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddLocation}
                  style={{
                    background: 'var(--green-primary)',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.25rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  + Add First Gated Community
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ====================================================
          MODAL: DEEP PRODUCT EDITOR (ADD / EDIT PRODUCT)
          ==================================================== */}
      {editingProduct && (
        <div className="ksf-modal-overlay" onClick={() => setEditingProduct(null)}>
          <div
            className="ksf-admin-modal-card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--green-darkest)',
                color: '#FFFFFF',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <Sparkles size={16} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                <h3 style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--gold-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isNewProduct ? 'Add Product' : `Edit: ${editingProduct.name}`}
                </h3>
              </div>
              <button onClick={() => setEditingProduct(null)} style={{ color: '#FFFFFF', padding: '0.25rem', flexShrink: 0 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="ksf-admin-modal-body">
              {/* Basic Details */}
              <div className="ksf-admin-grid-3col">
                <div className="ksf-form-group">
                  <label className="ksf-form-label">Product Name / Title *</label>
                  <input
                    type="text"
                    required
                    className="ksf-input"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Signature Grass-Fed Goat Curry Cut"
                  />
                </div>

                <div className="ksf-form-group">
                  <label className="ksf-form-label">Category *</label>
                  <select
                    className="ksf-input"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ksf-form-group">
                <label className="ksf-form-label">Short Tagline / Subtitle</label>
                <input
                  type="text"
                  className="ksf-input"
                  value={editingProduct.tagline || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                  placeholder="e.g. Tender bone-in & boneless pieces from young pasture-raised goats"
                />
              </div>

              <div className="ksf-form-group">
                <label className="ksf-form-label">Full Description & Sourcing Story</label>
                <textarea
                  className="ksf-textarea"
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Describe the texture, marbling, feeding method, and butcher cut details..."
                />
              </div>

              {/* Stock Status Controller Box */}
              <div className="ksf-admin-stock-control-card">
                <div className="ksf-admin-stock-control-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--green-primary)' }}>
                      Product Stock & Availability Status
                    </span>
                    <span
                      style={{
                        padding: '0.15rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        background: editingProduct.inStock !== false ? '#DCFCE7' : '#FEE2E2',
                        color: editingProduct.inStock !== false ? '#15803D' : '#B91C1C',
                        border: `1px solid ${editingProduct.inStock !== false ? '#86EFAC' : '#FCA5A5'}`
                      }}
                    >
                      {editingProduct.inStock !== false ? '● In Stock (Live)' : '● Out of Stock (Sold Out)'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>
                    {editingProduct.inStock !== false
                      ? 'This product is active. Shoppers can view details, select portions, add to basket, and order.'
                      : 'This product is marked SOLD OUT. It will appear grayed out on the storefront with an "Out of Stock Today" badge.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingProduct({ ...editingProduct, inStock: editingProduct.inStock === false ? true : false })}
                  className="btn-admin-stock-switch"
                  style={{
                    background: editingProduct.inStock !== false ? '#DCFCE7' : '#FEE2E2',
                    color: editingProduct.inStock !== false ? '#15803D' : '#B91C1C',
                    borderColor: editingProduct.inStock !== false ? '#86EFAC' : '#FCA5A5'
                  }}
                >
                  {editingProduct.inStock !== false ? (
                    <>
                      <Check size={16} />
                      <span>Change to Out of Stock</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>Restore to In Stock</span>
                    </>
                  )}
                </button>
              </div>

              {/* Regulatory & Hygiene Details (FSSAI, Expiry, Storage, Feed) */}
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-lg)', margin: '1rem 0', border: '1px solid var(--border-light)', width: '100%', boxSizing: 'border-box' }}>
                <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--green-primary)', marginBottom: '0.75rem' }}>
                  FSSAI, Shelf Life & Storage Specifications
                </h4>

                <div className="ksf-admin-grid-2col">
                  <div className="ksf-form-group">
                    <label className="ksf-form-label">FSSAI License / Registration No.</label>
                    <input
                      type="text"
                      className="ksf-input"
                      value={editingProduct.fssaiNumber || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, fssaiNumber: e.target.value })}
                      placeholder="13624014000889"
                    />
                  </div>

                  <div className="ksf-form-group">
                    <label className="ksf-form-label">Shelf Life / Expiration Period</label>
                    <input
                      type="text"
                      className="ksf-input"
                      value={editingProduct.shelfLife || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, shelfLife: e.target.value })}
                      placeholder="Best consumed within 48 hours at 0°C to 4°C."
                    />
                  </div>
                </div>

                <div className="ksf-admin-grid-2col">
                  <div className="ksf-form-group">
                    <label className="ksf-form-label">Storage & Handling Instructions</label>
                    <input
                      type="text"
                      className="ksf-input"
                      value={editingProduct.storageInstructions || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, storageInstructions: e.target.value })}
                      placeholder="Refrigerate at 0-4°C. Rinse with cold water before cooking."
                    />
                  </div>

                  <div className="ksf-form-group">
                    <label className="ksf-form-label">Feed & Livestock Origin</label>
                    <input
                      type="text"
                      className="ksf-input"
                      value={editingProduct.feedType || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, feedType: e.target.value })}
                      placeholder="100% Organic Pasture Grass & Herbal Forage"
                    />
                  </div>
                </div>

                <div className="ksf-admin-grid-2col">
                  <div className="ksf-form-group">
                    <label className="ksf-form-label">Best Culinary Uses / Cooking Styles</label>
                    <input
                      type="text"
                      className="ksf-input"
                      value={editingProduct.culinaryUses || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, culinaryUses: e.target.value })}
                      placeholder="e.g. Hyderabadi Dum Biryani, Mutton Curry, Sukka Fry"
                    />
                  </div>

                  <div className="ksf-form-group">
                    <label className="ksf-form-label">Pieces / Portion Estimate</label>
                    <input
                      type="text"
                      className="ksf-input"
                      value={editingProduct.piecesEstimate || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, piecesEstimate: e.target.value })}
                      placeholder="e.g. 14 to 18 tender pieces per kg"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC MULTI-WEIGHT VARIANT & PRICING BUILDER */}
              <div style={{ background: '#FFFFFF', border: '1px solid var(--gold-medium)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                      Multi-Weight Portions & Automatic Discount Pricing
                    </h4>
                    <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Actual Price (MRP) is struck-off on website. The system auto-calculates % OFF and ₹ Savings.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVariant}
                    style={{
                      background: 'var(--green-primary)',
                      color: '#FFFFFF',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.785rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Portion</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(editingProduct.variants || []).map((v, vIdx) => {
                    const mrp = Number(v.mrp) || 0;
                    const selling = Number(v.sellingPrice) || 0;
                    const discount = mrp > selling ? Math.round(((mrp - selling) / mrp) * 100) : 0;
                    const savings = Math.max(0, mrp - selling);

                    return (
                      <div
                        key={v.id || vIdx}
                        className="ksf-admin-variant-card"
                      >
                        <div className="ksf-admin-variant-grid">
                          <div>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>Portion Label *</label>
                            <input
                              type="text"
                              required
                              className="ksf-input"
                              value={v.label || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'label', e.target.value)}
                              placeholder="e.g. 1 kg / Pack of 12"
                              style={{ padding: '0.45rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>Net Wt / Info</label>
                            <input
                              type="text"
                              className="ksf-input"
                              value={v.netWeight || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'netWeight', e.target.value)}
                              placeholder="980g - 1000g"
                              style={{ padding: '0.45rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actual MRP (₹) *</label>
                            <input
                              type="number"
                              required
                              className="ksf-input"
                              value={v.mrp || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'mrp', Number(e.target.value))}
                              placeholder="1000"
                              style={{ padding: '0.45rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--green-primary)' }}>Offer Price (₹) *</label>
                            <input
                              type="number"
                              required
                              className="ksf-input"
                              value={v.sellingPrice || ''}
                              onChange={(e) => handleUpdateVariant(vIdx, 'sellingPrice', Number(e.target.value))}
                              placeholder="850"
                              style={{ padding: '0.45rem', fontWeight: 700, color: 'var(--green-primary)' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                background: discount > 0 ? 'var(--discount-bg)' : '#F1F5F9',
                                color: discount > 0 ? 'var(--discount-text)' : '#64748B',
                                fontSize: '0.725rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-sm)'
                              }}
                            >
                              {discount > 0 ? `${discount}% OFF (Save ₹${savings})` : 'No Discount'}
                            </span>

                            {/* Portion Stock Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleUpdateVariant(vIdx, 'inStock', v.inStock === false ? true : false)}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                background: v.inStock !== false ? '#DCFCE7' : '#FEE2E2',
                                color: v.inStock !== false ? '#15803D' : '#B91C1C',
                                border: `1px solid ${v.inStock !== false ? '#86EFAC' : '#FCA5A5'}`,
                                cursor: 'pointer'
                              }}
                              title="Toggle portion stock availability"
                            >
                              {v.inStock !== false ? '● In Stock' : '● Sold Out'}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(vIdx)}
                            style={{
                              color: 'var(--error-red)',
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Remove portion"
                          >
                            <Trash2 size={14} />
                            <span>Remove Portion</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Images & Badges */}
              <div className="ksf-admin-grid-2col">
                <div className="ksf-form-group">
                  <label className="ksf-form-label">Primary Image URL</label>
                  <input
                    type="text"
                    className="ksf-input"
                    value={editingProduct.images?.[0] || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    placeholder="https://..."
                  />
                  <div style={{ marginTop: '0.4rem' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        color: 'var(--green-primary)',
                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                        opacity: uploadingImage ? 0.7 : 1
                      }}
                    >
                      <Upload size={14} />
                      <span>{uploadingImage ? 'Uploading...' : 'Or Upload Local Image'}</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingImage} onChange={handleProductImageUpload} />
                    </label>
                  </div>

                  {/* Live preview of primary image */}
                  {editingProduct.images?.[0] && (
                    <div style={{
                      marginTop: '0.6rem',
                      position: 'relative',
                      display: 'inline-block',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '2px solid var(--green-primary)',
                      boxShadow: '0 2px 8px rgba(11,59,36,0.15)'
                    }}>
                      <img
                        src={editingProduct.images[0]}
                        alt="Product preview"
                        style={{
                          display: 'block',
                          width: '160px',
                          height: '100px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{
                        display: 'none',
                        width: '160px',
                        height: '100px',
                        background: 'var(--bg-subtle)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        padding: '0.5rem'
                      }}>
                        ⚠️ Image not reachable
                      </div>
                      <button
                        type="button"
                        title="Remove image"
                        onClick={() => setEditingProduct({ ...editingProduct, images: [] })}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(220,38,38,0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          lineHeight: 1
                        }}
                      >×</button>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(11,59,36,0.75)',
                        color: '#fff',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        padding: '2px 4px',
                        letterSpacing: '0.04em'
                      }}>PRIMARY IMAGE</div>
                    </div>
                  )}
                </div>


                <div className="ksf-form-group">
                  <label className="ksf-form-label">Badges & Labels</label>

                  {/* Best Seller quick toggle — sets isBestSeller flag (not a visible badge) */}
                  {(() => {
                    const isBestSeller = editingProduct.isBestSeller === true;
                    return (
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, isBestSeller: !isBestSeller })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.45rem 1rem',
                          borderRadius: 'var(--radius-full)',
                          border: isBestSeller ? '2px solid #D4AF37' : '2px solid var(--border-light)',
                          background: isBestSeller ? '#FFF8E1' : 'var(--bg-subtle)',
                          color: isBestSeller ? '#B8860B' : 'var(--text-muted)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          marginBottom: '0.6rem',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>🔥</span>
                        {isBestSeller ? '★ Best Seller — ON (shows in filter tab)' : 'Mark as Best Seller'}
                      </button>
                    );
                  })()}

                  {/* Preset badge chips */}
                  {(() => {
                    const badges = editingProduct.badges || [];
                    const PRESETS = ['100% Halal', 'Farm Fresh', "Chef's Pick", 'New Arrival', 'Limited Stock'];
                    return (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                        {PRESETS.map(preset => {
                          const active = badges.includes(preset);
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                const next = active
                                  ? badges.filter(b => b !== preset)
                                  : [...badges, preset];
                                setEditingProduct({ ...editingProduct, badges: next });
                              }}
                              style={{
                                padding: '0.28rem 0.7rem',
                                borderRadius: 'var(--radius-full)',
                                border: active ? '1.5px solid var(--green-primary)' : '1.5px solid var(--border-light)',
                                background: active ? 'var(--green-primary)' : 'transparent',
                                color: active ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.12s'
                              }}
                            >
                              {active ? '✓ ' : ''}{preset}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Free text fallback */}
                  <input
                    type="text"
                    className="ksf-input"
                    value={(editingProduct.badges || []).join(', ')}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        badges: e.target.value.split(',').map((b) => b.trim()).filter(Boolean)
                      })
                    }
                    placeholder="Or type custom badges: Grass Fed, Seasonal..."
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-dark)',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    background: isSaving ? 'var(--green-mid)' : 'var(--green-primary)',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.35rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: 'var(--shadow-sm)',
                    opacity: isSaving ? 0.8 : 1,
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                  <span>{isSaving ? 'Saving...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: CATEGORY EDITOR
          ==================================================== */}
      {editingCategory && (
        <div className="ksf-modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="ksf-admin-modal-card animate-fade-in" style={{ maxWidth: '480px', width: '92vw', padding: '1.25rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--green-primary)', marginBottom: '0.85rem' }}>
              {isNewCategory ? 'Add Farm Category' : `Edit Category: ${editingCategory.name}`}
            </h3>

            <form onSubmit={handleSaveCategory}>
              <div className="ksf-form-group">
                <label className="ksf-form-label">Category Name</label>
                <input
                  type="text"
                  required
                  className="ksf-input"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>

              <div className="ksf-admin-grid-2col">
                <div className="ksf-form-group">
                  <label className="ksf-form-label">Emoji Icon</label>
                  <input
                    type="text"
                    className="ksf-input"
                    value={editingCategory.icon}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    placeholder="🐐"
                  />
                </div>

                <div className="ksf-form-group">
                  <label className="ksf-form-label">Badge</label>
                  <input
                    type="text"
                    className="ksf-input"
                    value={editingCategory.badge}
                    onChange={(e) => setEditingCategory({ ...editingCategory, badge: e.target.value })}
                    placeholder="Pasture-Raised"
                  />
                </div>
              </div>

              <div className="ksf-form-group">
                <label className="ksf-form-label">Tagline</label>
                <input
                  type="text"
                  className="ksf-input"
                  value={editingCategory.tagline}
                  onChange={(e) => setEditingCategory({ ...editingCategory, tagline: e.target.value })}
                />
              </div>

              <div className="ksf-form-group">
                <label className="ksf-form-label">Image URL</label>
                <input
                  type="text"
                  className="ksf-input"
                  value={editingCategory.image}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    background: isSaving ? 'var(--green-mid)' : 'var(--green-primary)',
                    color: '#FFFFFF',
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{isSaving ? 'Saving...' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: GATED COMMUNITY EDITOR
          ==================================================== */}
      {editingLocation && (
        <div className="ksf-modal-overlay" onClick={() => setEditingLocation(null)}>
          <div
            className="ksf-admin-modal-card animate-fade-in"
            style={{ maxWidth: '520px', width: '92vw', padding: '1.25rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--green-primary)',
                marginBottom: '0.85rem'
              }}
            >
              {isNewLocation ? 'Add Gated Community' : `Edit: ${editingLocation.name}`}
            </h3>

            <form onSubmit={handleSaveLocation}>
              <div className="ksf-form-group">
                <label className="ksf-form-label">Gated Community / Society Name *</label>
                <input
                  type="text"
                  required
                  className="ksf-input"
                  placeholder="e.g. Society / Community Name"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                />
              </div>

              <div className="ksf-form-group">
                <label className="ksf-form-label">Area / Locality / Landmark *</label>
                <input
                  type="text"
                  required
                  className="ksf-input"
                  placeholder="e.g. Phase 1, Financial District"
                  value={editingLocation.area}
                  onChange={(e) => setEditingLocation({ ...editingLocation, area: e.target.value })}
                />
              </div>

              <div className="ksf-admin-grid-2col">
                <div className="ksf-form-group">
                  <label className="ksf-form-label">City</label>
                  <input
                    type="text"
                    className="ksf-input"
                    placeholder="Hyderabad"
                    value={editingLocation.city || 'Hyderabad'}
                    onChange={(e) => setEditingLocation({ ...editingLocation, city: e.target.value })}
                  />
                </div>

                <div className="ksf-form-group">
                  <label className="ksf-form-label">Pincode</label>
                  <input
                    type="text"
                    className="ksf-input"
                    placeholder="500081"
                    value={editingLocation.pincode || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, pincode: e.target.value })}
                  />
                </div>
              </div>

              <div className="ksf-form-group">
                <label className="ksf-form-label">Delivery Slot / Schedule Window</label>
                <input
                  type="text"
                  className="ksf-input"
                  placeholder="e.g. Morning 7:00 AM - 9:30 AM"
                  value={editingLocation.deliverySlot || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, deliverySlot: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem', marginBottom: '1.25rem' }}>
                <input
                  type="checkbox"
                  id="locActiveCheck"
                  checked={editingLocation.active !== false}
                  onChange={(e) => setEditingLocation({ ...editingLocation, active: e.target.checked })}
                  style={{ width: '17px', height: '17px', accentColor: 'var(--green-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="locActiveCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer' }}>
                  Active for deliveries (visible on storefront & WhatsApp)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingLocation(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    background: isSaving ? 'var(--green-mid)' : 'var(--green-primary)',
                    color: '#FFFFFF',
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{isSaving ? 'Saving...' : 'Save Community'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Error Boundary wrapper to guarantee the page never goes blank
class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Admin Panel Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#051A10', color: '#FFFFFF', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4AF37', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Admin Portal Recovery</h2>
          <p style={{ color: '#E7E0D3', maxWidth: '460px', marginBottom: '1.5rem', lineHeight: 1.5, fontSize: '0.85rem' }}>
            A temporary display error occurred while rendering the management panel.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              style={{ background: '#0B3B24', color: '#FFF', border: '1.5px solid #D4AF37', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Reload Admin Portal
            </button>
            <button
              onClick={() => { window.location.hash = ''; window.location.pathname = '/'; }}
              style={{ background: '#FFFFFF', color: '#0B3B24', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Return to Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminPanel(props) {
  return (
    <AdminErrorBoundary>
      <AdminPanelInner {...props} />
    </AdminErrorBoundary>
  );
}
