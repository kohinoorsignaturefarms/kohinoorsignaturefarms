import React, { useState, useEffect } from 'react';
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
  Upload,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign
} from 'lucide-react';
import { api, formatCurrency } from '../api';

export default function AdminPanel({
  onClose,
  initialProducts = [],
  initialCategories = [],
  initialSettings = {},
  onDataRefresh
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('ksf_admin_auth') === 'true'
  );
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'settings', 'banners', 'categories', 'stats'

  // Data States
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [settings, setSettings] = useState(initialSettings);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Search & Filters in Admin
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCatFilter, setAdminCatFilter] = useState('all');

  // Product Editor Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, setRes, statRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSettings(),
        api.getStats().catch(() => null)
      ]);
      setProducts(prodRes);
      setCategories(catRes);
      setSettings(setRes);
      if (statRes) setStats(statRes);
    } catch (err) {
      console.error('Error loading admin data:', err);
      showToast('Error loading database', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      sessionStorage.setItem('ksf_admin_auth', 'true');
      showToast('Welcome to Kohinoor Signature Farms Admin');
    } catch (err) {
      setPinError(err.message || 'Invalid PIN');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ksf_admin_auth');
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
      images: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'],
      badges: ['Farm Fresh', '100% Halal'],
      inStock: true,
      variants: [
        {
          id: 'var-' + Date.now(),
          label: '1 kg',
          weight: '1000g',
          netWeight: '980g - 1000g',
          mrp: 999,
          sellingPrice: 849,
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
      images: Array.isArray(prod.images) && prod.images.length > 0 ? [...prod.images] : ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'],
      badges: Array.isArray(prod.badges) ? [...prod.badges] : ['Farm Fresh', '100% Halal'],
      inStock: prod.inStock !== false,
      variants: Array.isArray(prod.variants) && prod.variants.length > 0 ? JSON.parse(JSON.stringify(prod.variants)) : [
        {
          id: 'var-' + Date.now(),
          label: '1 kg',
          weight: '1000g',
          netWeight: '980g - 1000g',
          mrp: 999,
          sellingPrice: 849,
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
    try {
      await api.updateSettings(settings);
      showToast('Store & WhatsApp settings updated successfully!');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to update settings', 'error');
    }
  };

  // ----------------------------------------------------
  // HERO BANNER ACTIONS
  // ----------------------------------------------------
  const handleSaveBanners = async (updatedBanners) => {
    try {
      const newSettings = { ...settings, heroBanners: updatedBanners };
      await api.updateSettings(newSettings);
      setSettings(newSettings);
      showToast('Banners updated successfully!');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to update banners', 'error');
    }
  };

  // ----------------------------------------------------
  // CATEGORIES ACTIONS
  // ----------------------------------------------------
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) return;
    try {
      await api.saveCategory(editingCategory);
      const updatedCats = await api.getCategories();
      setCategories(updatedCats);
      setEditingCategory(null);
      showToast('Category saved successfully!');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await api.deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      showToast('Category deleted');
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      showToast('Failed to delete category', 'error');
    }
  };

  // Filtered Products list
  const filteredProducts = products.filter((p) => {
    const matchesCat = adminCatFilter === 'all' || p.category === adminCatFilter;
    const matchesSearch =
      !adminSearch ||
      p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.tagline?.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ----------------------------------------------------
  // RENDER: LOGIN PIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="ksf-modal-overlay">
        <div
          className="ksf-admin-modal-card animate-fade-in"
          style={{ maxWidth: '400px', width: '92vw', padding: '1.75rem 1.25rem', textAlign: 'center' }}
        >
          <img
            src="/logo.jpeg"
            alt="Kohinoor Signature Farms"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              margin: '0 auto 1rem',
              border: '2px solid var(--gold-primary)'
            }}
          />

          <h3
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--green-primary)',
              marginBottom: '0.3rem'
            }}
          >
            Admin Management Portal
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Kohinoor Signature Farms
          </p>

          <form onSubmit={handlePinSubmit}>
            <div className="ksf-form-group">
              <input
                type="password"
                className="ksf-input"
                placeholder="Enter Admin Password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.1em' }}
              />
            </div>

            {pinError && (
              <div
                style={{
                  color: 'var(--error-red)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '1rem'
                }}
              >
                {pinError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.65rem',
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
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--green-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                Unlock Dashboard
              </button>
            </div>
          </form>
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
          className={`btn-admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <TrendingUp size={15} />
          <span>Farm Metrics</span>
        </button>
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

              <button
                type="submit"
                style={{
                  background: 'var(--green-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Save size={18} />
                <span>Save All Settings</span>
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
                      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80'
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
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
                  <img
                    src={banner.image}
                    alt={banner.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
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

                    <div className="ksf-form-group">
                      <label className="ksf-form-label">Banner Image URL</label>
                      <input
                        type="text"
                        className="ksf-input"
                        value={banner.image}
                        onChange={(e) => {
                          const copy = [...settings.heroBanners];
                          copy[idx].image = e.target.value;
                          setSettings({ ...settings, heroBanners: copy });
                        }}
                      />
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
            TAB 5: STATS & OVERVIEW
            ==================================================== */}
        {activeTab === 'stats' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-primary)', marginBottom: '1.25rem' }}>
              Farm Catalog Analytics & Summary
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem', width: '100%', boxSizing: 'border-box' }}>
              <div className="ksf-stat-card">
                <div className="ksf-stat-icon-box">
                  <Package size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                    {products.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Total Products
                  </div>
                </div>
              </div>

              <div className="ksf-stat-card">
                <div className="ksf-stat-icon-box" style={{ background: '#DCFCE7', color: '#15803D' }}>
                  <Check size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803D' }}>
                    {products.filter((p) => p.inStock !== false).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    In-Stock Today
                  </div>
                </div>
              </div>

              <div className="ksf-stat-card">
                <div className="ksf-stat-icon-box" style={{ background: 'var(--gold-shimmer)', color: 'var(--gold-dark)' }}>
                  <DollarSign size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                    {stats?.avgDiscount || '16'}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Avg Customer Savings
                  </div>
                </div>
              </div>

              <div className="ksf-stat-card">
                <div className="ksf-stat-icon-box">
                  <Layers size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                    {categories.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Categories
                  </div>
                </div>
              </div>
            </div>
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
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={14} />
                      <span>{uploadingImage ? 'Uploading...' : 'Or Upload Local Image'}</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProductImageUpload} />
                    </label>
                  </div>
                </div>

                <div className="ksf-form-group">
                  <label className="ksf-form-label">Badges (Comma Separated)</label>
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
                    placeholder="Best Seller, Grass Fed, 100% Halal"
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
                  style={{
                    background: 'var(--green-primary)',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.35rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Save size={15} />
                  <span>Save Product</span>
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
                  style={{
                    background: 'var(--green-primary)',
                    color: '#FFFFFF',
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
