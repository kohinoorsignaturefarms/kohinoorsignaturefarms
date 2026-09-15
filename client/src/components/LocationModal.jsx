import React, { useState } from 'react';
import { X, Check, Search, MessageCircle, Sparkles, Building2 } from 'lucide-react';
import { DEFAULT_DELIVERY_LOCATIONS } from '../api';

export default function LocationModal({
  isOpen,
  onClose,
  locations = [],
  selectedLocation,
  onSelectLocation,
  storeSettings
}) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const rawList = Array.isArray(locations) && locations.length > 0 ? locations : DEFAULT_DELIVERY_LOCATIONS;
  const activeLocations = rawList.filter((loc) => loc.active !== false);

  const filteredLocations = activeLocations.filter((loc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (loc.name && loc.name.toLowerCase().includes(q)) ||
      (loc.area && loc.area.toLowerCase().includes(q)) ||
      (loc.pincode && loc.pincode.toString().includes(q))
    );
  });

  const whatsappNumber = (storeSettings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
  const requestSocietyUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hello Kohinoor Signature Farms team! I would like to request fresh farm meat delivery to my gated community: [Please specify Society Name & Area].'
  )}`;

  return (
    <div className="ksf-modal-overlay" onClick={onClose}>
      <div
        className="ksf-location-modal animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="ksf-location-modal-header">
          <div className="ksf-location-modal-title-wrap">
            <div className="ksf-loc-header-badge">
              <Sparkles size={14} />
              <span>Exclusive Direct Dispatch</span>
            </div>
            <h3>Select Delivery Community</h3>
            <p>
              We harvest, chill, and deliver exclusively to premier gated communities in Hyderabad to guarantee 100% freshness.
            </p>
          </div>
          <button
            type="button"
            className="ksf-location-modal-close"
            onClick={onClose}
            aria-label="Close location selector"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Societies */}
        <div className="ksf-location-modal-search">
          <Search size={16} className="ksf-loc-search-icon" />
          <input
            type="text"
            className="ksf-loc-search-input"
            placeholder="Search society name, area or pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button
              type="button"
              className="ksf-loc-search-clear"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Community Cards List */}
        <div className="ksf-location-modal-list">
          <div className="ksf-location-list-label">
            Available Gated Communities ({activeLocations.length})
          </div>

          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id || selectedLocation?.name === loc.name;
            return (
              <div
                key={loc.id || loc.name}
                className={`ksf-location-item-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
              >
                <div className="ksf-loc-card-left">
                  <div className={`ksf-loc-icon-circle ${isSelected ? 'active' : ''}`}>
                    <Building2 size={18} />
                  </div>
                  <div className="ksf-loc-details">
                    <div className="ksf-loc-name-row">
                      <span className="ksf-loc-name">{loc.name}</span>
                      {isSelected && (
                        <span className="ksf-loc-selected-pill">Active Location</span>
                      )}
                    </div>
                    <div className="ksf-loc-subtext">
                      {loc.area}{loc.pincode ? ` • ${loc.pincode}` : ''}
                    </div>
                    {loc.deliverySlot && (
                      <div className="ksf-loc-slot-badge">
                        <span>⏰ {loc.deliverySlot}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ksf-loc-card-right">
                  <div className={`ksf-loc-check-circle ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLocations.length === 0 && (
            <div className="ksf-location-empty">
              <Building2 size={36} style={{ color: 'var(--gold-dark)', margin: '0 auto 0.5rem' }} />
              <p>No active delivery community found matching &ldquo;{search}&rdquo;.</p>
            </div>
          )}
        </div>

        {/* Request Society Footer */}
        <div className="ksf-location-modal-footer">
          <div className="ksf-loc-req-info">
            <span className="ksf-loc-req-title">Don't see your society?</span>
            <span className="ksf-loc-req-desc">Request daily fresh farm delivery for your community.</span>
          </div>
          <a
            href={requestSocietyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-req-society-wa"
          >
            <MessageCircle size={15} />
            <span>Request Society</span>
          </a>
        </div>
      </div>
    </div>
  );
}
