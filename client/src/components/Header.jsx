import React from 'react';
import { Search, X, ShoppingBag, MapPin, ChevronDown } from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  storeSettings,
  onGoHome,
  onOpenAbout,
  activePage = 'store',
  cartCount = 0,
  onOpenCart,
  selectedLocation,
  onOpenLocationModal
}) {
  return (
    <header className="ksf-header">
      <div className="ksf-container">
        {/* Top Main Row */}
        <div className="ksf-header-top-row">
          {/* Brand Logo & Title */}
          <div className="ksf-logo-wrap" onClick={onGoHome} style={{ cursor: 'pointer' }}>
            <img src="/logo.jpeg" alt="Kohinoor Signature Farms" className="ksf-logo-img" />
            <div className="ksf-logo-titles">
              <span className="ksf-brand-title">Kohinoor Signature Farms</span>
              <span className="ksf-brand-tagline">Grass-Fed • Organic • Halal</span>
            </div>
          </div>

          {/* Desktop Search Bar (Hidden on Mobile) */}
          <div className="ksf-search-desktop">
            <Search className="ksf-search-icon" size={17} />
            <input
              type="text"
              className="ksf-search-input"
              placeholder="Search grass-fed goat, country chicken, organic eggs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Desktop Location Pill — between search and basket, hidden on mobile */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="ksf-header-loc-pill"
            title="Change delivery location"
            aria-label="Change delivery location"
          >
            <MapPin size={18} className="ksf-header-loc-pill-icon" />
            <div className="ksf-header-loc-pill-text">
              <span className="ksf-header-loc-pill-sub">Delivering to</span>
              <strong className="ksf-header-loc-pill-name">
                {selectedLocation?.name || 'Select Society'}
              </strong>
            </div>
            <ChevronDown size={13} className="ksf-header-loc-pill-arrow" />
          </button>

          {/* Header Action Buttons */}
          <div className="ksf-header-actions">
            <button
              type="button"
              onClick={onOpenCart}
              className="btn-cart-header"
              title="View your farm basket"
              aria-label="View farm basket"
            >
              <div className="ksf-header-cart-icon-wrap">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="ksf-header-cart-badge">{cartCount}</span>
                )}
              </div>
              <span className="ksf-header-cart-label">Basket</span>
            </button>
          </div>
        </div>

        {/* Mobile Delivery Location Bar */}
        <div
          className="ksf-location-bar-mobile"
          onClick={onOpenLocationModal}
          role="button"
          tabIndex={0}
          title="Change delivery gated community"
        >
          <div className="ksf-loc-bar-left">
            <div className="ksf-loc-pin-mobile-wrap">
              <MapPin size={14} />
            </div>
            <div className="ksf-loc-bar-text">
              <span className="ksf-loc-bar-sub">Delivering to</span>
              <strong className="ksf-loc-bar-name">
                {selectedLocation?.name || 'Select Society'}
              </strong>
            </div>
          </div>
          <span className="ksf-loc-bar-change">
            Change <ChevronDown size={12} />
          </span>
        </div>

        {/* Mobile Search Row (Full Width on Mobile) */}
        <div className="ksf-search-mobile">
          <div style={{ position: 'relative' }}>
            <Search className="ksf-search-icon" size={16} />
            <input
              type="text"
              className="ksf-search-input"
              placeholder="Search goat, chicken, eggs cuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
