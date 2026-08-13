import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import AnnouncementBar from './components/AnnouncementBar';
import HeroSlider from './components/HeroSlider';
import CategoryBoxes from './components/CategoryBoxes';
import CategoryFilterBar from './components/CategoryFilterBar';
import ProductCard from './components/ProductCard';
import ProductDetailPage from './components/ProductDetailPage';
import WhyChooseUs from './components/WhyChooseUs';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { api } from './api';
import { Sparkles, MessageCircle, AlertCircle, RefreshCw, Settings, ShieldCheck } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyBestSellers, setOnlyBestSellers] = useState(false);

  // Check URL pathname or hash for /admin or #admin
  const checkIsAdminRoute = () => {
    return (
      window.location.pathname.includes('/admin') ||
      window.location.hash.includes('#admin')
    );
  };

  // Modals & Navigation states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(checkIsAdminRoute);

  // Fetch initial data from REST API backend ONCE
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes, setRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSettings()
      ]);
      setProducts(prodRes || []);
      setCategories(catRes || []);
      setSettings(setRes || null);
    } catch (err) {
      console.error('Error fetching farm data:', err);
      setError('Unable to connect to farm server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on mount only
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // URL route change & shared product deep link listener
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminRoute()) {
        setIsAdminOpen(true);
      } else {
        setIsAdminOpen(false);
      }

      // Check URL pathname (e.g. /product/:id or /p/:id)
      const pathname = window.location.pathname;
      const productPathMatch = pathname.match(/^\/(?:product|p)\/([^/]+)/);
      
      // Check query params (?product=id)
      const urlParams = new URLSearchParams(window.location.search);
      const queryProdId = urlParams.get('product');

      // Check hash (#product-id)
      const hash = window.location.hash;
      const hashProdId = hash.startsWith('#product-') ? hash.replace('#product-', '') : null;

      const targetId = productPathMatch ? productPathMatch[1] : (queryProdId || hashProdId);

      if (targetId && products.length > 0) {
        const found = products.find((x) => x.id === targetId || x.slug === targetId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [products]);

  // Filter products based on category, search, and bestseller filter
  const displayedProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.culinaryUses?.toLowerCase().includes(searchTerm.toLowerCase());

    const isBestSeller = (p.badges || []).some(
      (b) =>
        b.toLowerCase().includes('best') ||
        b.toLowerCase().includes('popular') ||
        b.toLowerCase().includes('chef')
    );
    const matchesBestSeller = !onlyBestSellers || isBestSeller;

    return matchesCategory && matchesSearch && matchesBestSeller;
  });

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    try {
      window.history.pushState(null, '', `/product/${product.slug || product.id}`);
    } catch (e) {
      window.location.hash = `product-${product.id}`;
    }
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {
      window.location.hash = '';
    }
  };

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    try {
      history.pushState(null, '', '/admin');
    } catch (e) {
      window.location.hash = 'admin';
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    try {
      history.pushState(null, '', '/');
    } catch (e) {
      window.location.hash = '';
    }
    fetchData(); // Refresh any updated inventory data
  };

  const handleGoHome = () => {
    setActiveCategory('all');
    setSearchTerm('');
    setOnlyBestSellers(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdminOpen) {
    return (
      <AdminPanel
        onClose={handleCloseAdmin}
        initialProducts={products}
        initialCategories={categories}
        initialSettings={settings}
        onDataRefresh={fetchData}
      />
    );
  }

  return (
    <div className="ksf-app">
      {/* Top Announcement Bar */}
      <AnnouncementBar text={settings?.announcement} />

      {/* Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        storeSettings={settings}
        onGoHome={handleGoHome}
      />

      {/* Hero Banner Slider */}
      <HeroSlider
        banners={settings?.heroBanners}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setOnlyBestSellers(false);
        }}
      />

      {/* 3 Main Spotlight Category Boxes (Goat, Chicken, Eggs) */}
      <CategoryBoxes
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setOnlyBestSellers(false);
        }}
        products={products}
      />

      {/* Swiggy Sticky Category Filter Bar */}
      <CategoryFilterBar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        products={products}
        onlyBestSellers={onlyBestSellers}
        setOnlyBestSellers={setOnlyBestSellers}
      />

      {/* Products Section */}
      <main className="ksf-products-section" id="products-section">
        <div className="ksf-container">
          {/* Section Heading & Result Counter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '1.25rem'
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--green-primary)'
                }}
              >
                {activeCategory === 'all'
                  ? onlyBestSellers
                    ? '🔥 Best Selling Cuts'
                    : '🌱 All Fresh Farm Cuts'
                  : `${categories.find((c) => c.id === activeCategory)?.name || 'Cuts'}`}
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Showing {displayedProducts.length} portion-ready cuts • Sourced & prepared fresh today
              </p>
            </div>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--green-primary)',
                  fontWeight: 700,
                  textDecoration: 'underline'
                }}
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--green-primary)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 700 }}>Fetching fresh farm inventory...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: 'var(--error-red)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                margin: '2rem 0'
              }}
            >
              <AlertCircle size={24} style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 700 }}>{error}</div>
              <button
                onClick={fetchData}
                style={{
                  marginTop: '0.75rem',
                  background: 'var(--green-primary)',
                  color: '#FFFFFF',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <div className="ksf-products-grid">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeSettings={settings}
                  onOpenDetail={handleOpenDetail}
                />
              ))}

              {displayedProducts.length === 0 && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '4rem 1rem',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px dashed var(--border-light)'
                  }}
                >
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🌿</span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--green-primary)', fontSize: '1.25rem', marginBottom: '0.3rem' }}>
                    No cuts match your current selection
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Try searching for another cut or select a different category.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setSearchTerm('');
                      setOnlyBestSellers(false);
                    }}
                    style={{
                      background: 'var(--green-primary)',
                      color: '#FFFFFF',
                      padding: '0.55rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    View All Farm Products
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* The Kohinoor Standard (Pillars, Collections & Standards Boxes) */}
      <WhyChooseUs
        founder={settings?.founder}
        tagline={settings?.tagline}
        categories={categories}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setOnlyBestSellers(false);
          const el = document.getElementById('products-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Footer */}
      <Footer
        storeSettings={settings}
        categories={categories}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setOnlyBestSellers(false);
        }}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          storeSettings={settings}
          onClose={handleCloseDetail}
        />
      )}

      {/* Mobile Floating Action Buttons: WhatsApp */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          zIndex: 95,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.6rem'
        }}
      >
        <a
          href={`https://wa.me/${(settings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            '🌱 Hello Kohinoor Signature Farms! I would like to inquire about today\'s available fresh farm cuts.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#25D366',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.85rem',
            padding: '0.7rem 1.15rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 16px rgba(37, 211, 102, 0.45)',
            textDecoration: 'none'
          }}
          title="Direct WhatsApp Helpline"
        >
          <MessageCircle size={19} />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
