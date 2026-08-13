import React, { useState } from 'react';
import { MessageCircle, Info, Sparkles } from 'lucide-react';
import { formatCurrency, buildWhatsAppUrl } from '../api';

export default function ProductCard({ product, storeSettings, onOpenDetail }) {
  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [
        {
          id: 'default-v',
          label: '1 kg',
          weight: '1000g',
          mrp: 999,
          sellingPrice: 849,
          inStock: true
        }
      ];

  // Default to selected default variant or first variant
  const defaultVar = variants.find((v) => v.isDefault) || variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVar?.id);

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

  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="ksf-product-card animate-fade-in">
      {/* Media Image & Badges */}
      <div className="ksf-prod-media" onClick={() => onOpenDetail(product)} style={{ cursor: 'pointer' }}>
        <img
          src={mainImage}
          alt={product.name}
          className="ksf-prod-img"
          loading="lazy"
        />

        {/* Status Overlay if Sold Out */}
        {isOutOfStock && (
          <div className="ksf-badge-stock-out">
            <span>Sold Out Today</span>
          </div>
        )}

        {/* Badges Stack */}
        <div className="ksf-badge-stack">
          {product.badges && product.badges.map((badge, idx) => {
            const isGold = badge.toLowerCase().includes('best') || badge.toLowerCase().includes('popular') || badge.toLowerCase().includes('chef');
            return (
              <span
                key={idx}
                className={`ksf-badge-item ${isGold ? 'ksf-badge-bestseller' : 'ksf-badge-fresh'}`}
              >
                {badge}
              </span>
            );
          })}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="ksf-prod-body">
        <div>
          {/* Title & Tagline */}
          <h4 className="ksf-prod-title" onClick={() => onOpenDetail(product)}>
            {product.name}
          </h4>
          <p className="ksf-prod-tagline">{product.tagline || product.description}</p>

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

            {/* Horizontal Scrollable Row of Uniform Square Boxes */}
            <div className="ksf-pack-square-scroll-strip">
              {variants.map((v) => {
                const isSelected = v.id === activeVariant.id;
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

          {/* Dynamic Price & Discount Row */}
          <div className="ksf-price-row">
            <span className="ksf-selling-price">{formatCurrency(selling)}</span>
            {mrp > selling && (
              <span className="ksf-mrp-price">{formatCurrency(mrp)}</span>
            )}
            {discountPercent > 0 && (
              <span className="ksf-discount-badge">
                <Sparkles size={11} style={{ marginRight: '3px' }} />
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: WhatsApp Order + Detail Modal */}
        <div className="ksf-card-actions">
          {isOutOfStock ? (
            <button
              disabled
              style={{
                flex: 1,
                padding: '0.65rem',
                background: '#E2E8F0',
                color: '#64748B',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              Currently Unavailable
            </button>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-card-whatsapp"
              title="Order this cut directly on WhatsApp"
            >
              <MessageCircle size={17} />
              <span>Order on WhatsApp</span>
            </a>
          )}

          <button
            onClick={() => onOpenDetail(product)}
            className="btn-card-detail"
            title="View full specs, FSSAI, & storage guide"
          >
            <Info size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
