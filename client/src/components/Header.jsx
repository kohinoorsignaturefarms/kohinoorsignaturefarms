import React from 'react';
import { Search, MessageCircle, X } from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  storeSettings,
  onGoHome
}) {
  const whatsappNumber = (storeSettings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
  const farmWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    '🌿 Hello Kohinoor Signature Farms! I would like to inquire about today\'s available fresh farm cuts.'
  )}`;

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

          {/* Header Action Buttons */}
          <div className="ksf-header-actions">
            {/* Direct WhatsApp Action */}
            <a
              href={farmWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-header"
              title="Order on WhatsApp"
              aria-label="Order on WhatsApp"
            >
              <MessageCircle size={17} />
              <span className="ksf-header-wa-label">WhatsApp Order</span>
            </a>
          </div>
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
