import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  ShieldCheck,
  Clock,
  ThermometerSnowflake,
  Leaf,
  ChefHat,
  Sparkles,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, buildWhatsAppUrl } from '../api';

export default function ProductDetailPage({ product, storeSettings, onClose }) {
  if (!product) return null;

  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [
        {
          id: 'v-default',
          label: '1 kg',
          weight: '1000g',
          netWeight: '980g - 1000g',
          mrp: 999,
          sellingPrice: 849,
          inStock: true
        }
      ];

  const defaultVar = variants.find((v) => v.isDefault) || variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVar?.id);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  const mrp = activeVariant?.mrp || 0;
  const selling = activeVariant?.sellingPrice || 0;
  const discountAmount = Math.max(0, mrp - selling);
  const discountPercent = mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;
  const isOutOfStock = product.inStock === false || activeVariant?.inStock === false;

  const whatsappUrl = buildWhatsAppUrl(
    storeSettings?.whatsappNumber,
    product,
    activeVariant,
    storeSettings
  );

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'];

  const fssaiNo = product.fssaiNumber || storeSettings?.masterFssai || '13624014000889';

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/product/${product.slug || product.id}`;
    const shareTitle = `${product.name} | Kohinoor Signature Farms`;
    const shareText = `Check out ${product.name} (${activeVariant?.label || ''} • ${formatCurrency(selling)}) from Kohinoor Signature Farms - 100% Halal, Pasture-Raised & Farm Direct!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        // User cancelled share dialog or fallback
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="ksf-modal-overlay" onClick={onClose}>
      {/* 90% Display Pop-Up Modal */}
      <div className="ksf-modal-popup-90 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Top Sticky Header in Pop-Up */}
        <div className="ksf-modal-header-bar">
          <div className="ksf-modal-header-title-wrap">
            <span className="ksf-modal-category-chip">
              {product.category}
            </span>
            <h3 className="ksf-modal-header-product-title">
              {product.name}
            </h3>
          </div>

          <button className="ksf-modal-close-btn" onClick={onClose} aria-label="Close product popup">
            <X size={18} />
          </button>
        </div>

        {/* Modal Split Layout: Desktop Left-Fixed + Right-Scroll, Mobile Full-Scroll */}
        <div className="ksf-detail-layout-container">
          {/* Left Column: Fixed / Sticky on Desktop */}
          <div className="ksf-detail-left-pane">
            <div className="ksf-detail-gallery">
              <img
                src={images[activeImageIdx] || images[0]}
                alt={product.name}
                className="ksf-detail-main-img"
              />

              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      onClick={() => setActiveImageIdx(idx)}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        flexShrink: 0,
                        border: idx === activeImageIdx ? '2px solid var(--gold-primary)' : '1px solid var(--border-light)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Halal & Quality Guarantee Card */}
              <div
                style={{
                  background: 'var(--green-light-bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  border: '1px solid var(--green-border)',
                  marginTop: '0.4rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={17} style={{ color: 'var(--green-primary)' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--green-primary)' }}>
                    Kohinoor Pure Farm Standard
                  </span>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
                  100% pasture-raised, natural organic feed. Hygienically prepared per authentic Halal guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Independently Scrollable on Desktop */}
          <div className="ksf-detail-right-pane">
            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              {product.badges && product.badges.map((b, i) => (
                <span
                  key={i}
                  style={{
                    background: 'var(--gold-shimmer)',
                    color: 'var(--gold-dark)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--gold-light)'
                  }}
                >
                  {b}
                </span>
              ))}
            </div>

            {/* Title & Tagline */}
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--green-primary)',
                lineHeight: '1.2',
                marginBottom: '0.35rem'
              }}
            >
              {product.name}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
              {product.tagline}
            </p>

            {/* UNIFORM SQUARE PACK-SIZE BOXES (SCROLLABLE RIGHT) */}
            <div className="ksf-pack-size-section">
              <div className="ksf-pack-header-row">
                <span className="ksf-pack-header-title">Pack / Portion Size:</span>
                {activeVariant?.netWeight && (
                  <span className="ksf-pack-header-net">
                    Net: {activeVariant.netWeight}
                  </span>
                )}
              </div>

              <div className="ksf-pack-square-scroll-strip">
                {variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const vDiscount = v.mrp > v.sellingPrice 
                    ? Math.round(((v.mrp - v.sellingPrice) / v.mrp) * 100) 
                    : 0;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`ksf-pack-square-box ${isSelected ? 'active' : ''}`}
                      disabled={isOutOfStock || v.inStock === false}
                      title={`${v.label || v.weight} - ${formatCurrency(v.sellingPrice)}`}
                    >
                      <span className="ksf-pack-square-weight">
                        {v.label || v.weight}
                      </span>
                      {vDiscount > 0 ? (
                        <span className="ksf-pack-square-badge">
                          {vDiscount}% OFF
                        </span>
                      ) : (
                        <span className="ksf-pack-square-price">
                          {formatCurrency(v.sellingPrice)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Calculation Box */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-light)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--green-primary)' }}>
                    {formatCurrency(selling)}
                  </span>
                  {mrp > selling && (
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                      {formatCurrency(mrp)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="ksf-discount-badge">
                      <Sparkles size={11} style={{ marginRight: '2px' }} />
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                {discountAmount > 0 && (
                  <div style={{ fontSize: '0.725rem', color: 'var(--green-accent)', fontWeight: 700, marginTop: '0.15rem' }}>
                    ✨ You save {formatCurrency(discountAmount)} on this cut!
                  </div>
                )}
              </div>

              <div>
                {isOutOfStock ? (
                  <span style={{ color: 'var(--error-red)', fontWeight: 700, fontSize: '0.8rem' }}>
                    ● Out of Stock Today
                  </span>
                ) : (
                  <span style={{ color: 'var(--success-green)', fontWeight: 700, fontSize: '0.8rem' }}>
                    ● Fresh Cut Available
                  </span>
                )}
              </div>
            </div>

            {/* WhatsApp Direct Order Button & Share */}
            <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1.25rem' }}>
              {isOutOfStock ? (
                <button
                  disabled
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#E2E8F0',
                    color: '#64748B',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.875rem'
                  }}
                >
                  Sold Out Today
                </button>
              ) : (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-card-whatsapp"
                    style={{ flex: 1, padding: '0.75rem 0.85rem', fontSize: '0.875rem' }}
                  >
                    <MessageCircle size={18} />
                    <span>Order on WhatsApp</span>
                  </a>
              )}

              <button
                onClick={handleShareLink}
                style={{
                  padding: '0.75rem 0.85rem',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--green-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
                title="Share cut link"
              >
                {copiedLink ? <CheckCircle2 size={16} color="var(--success-green)" /> : <Share2 size={16} />}
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Detailed Specs Table */}
            <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--green-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
              Product Details & Hygiene Specifications
            </h4>

            <table className="ksf-specs-table">
              <tbody>
                <tr>
                  <th>
                    <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    FSSAI License No:
                  </th>
                  <td>
                    <span style={{ color: 'var(--green-primary)', fontFamily: 'monospace', fontWeight: 700 }}>
                      {fssaiNo}
                    </span>
                  </td>
                </tr>

                {product.shelfLife && (
                  <tr>
                    <th>
                      <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Shelf Life / Expiry:
                    </th>
                    <td>{product.shelfLife}</td>
                  </tr>
                )}

                {product.storageInstructions && (
                  <tr>
                    <th>
                      <ThermometerSnowflake size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Storage Guide:
                    </th>
                    <td>{product.storageInstructions}</td>
                  </tr>
                )}

                {product.feedType && (
                  <tr>
                    <th>
                      <Leaf size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Farming & Feed:
                    </th>
                    <td>{product.feedType}</td>
                  </tr>
                )}

                {product.piecesEstimate && (
                  <tr>
                    <th>⚖️ Portion Estimate:</th>
                    <td>{product.piecesEstimate}</td>
                  </tr>
                )}

                {product.culinaryUses && (
                  <tr>
                    <th>
                      <ChefHat size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      Recommended Dishes:
                    </th>
                    <td>{product.culinaryUses}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Sourcing Story */}
            {product.description && (
              <div style={{ marginTop: '0.75rem' }}>
                <h4 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--green-primary)', marginBottom: '0.3rem' }}>
                  Butchery & Farm Sourcing
                </h4>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
