import React, { useState } from 'react';
import { MessageCircle, Info, Sparkles, ShoppingBag, Plus, Minus } from 'lucide-react';
import { formatCurrency, buildWhatsAppUrl } from '../api';

export default function ProductCard({
  product,
  storeSettings,
  onOpenDetail,
  onAddToCart,
  onUpdateQuantity,
  cartItems = []
}) {
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
  const isProductOutOfStock = product.inStock === false || (variants.length > 0 && variants.every((v) => v.inStock === false));
  const isCurrentOutOfStock = isProductOutOfStock || activeVariant?.inStock === false;

  // Check if this variant is currently in cart
  const cartItem = cartItems?.find(
    (item) => item.productId === product.id && item.variantId === activeVariant.id
  );
  const cartQty = cartItem ? cartItem.quantity : 0;

  const whatsappUrl = buildWhatsAppUrl(
    storeSettings?.whatsappNumber,
    product,
    activeVariant,
    storeSettings
  );

  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart && !isCurrentOutOfStock) {
      onAddToCart(product, activeVariant, 1);
    }
  };

  const handleQtyChange = (e, newQty) => {
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(product.id, activeVariant.id, newQty);
    }
  };

  return (
    <div className={`ksf-product-card animate-fade-in ${isProductOutOfStock ? 'ksf-card-out-of-stock' : ''}`}>
      {/* Media Image & Badges */}
      <div className="ksf-prod-media" onClick={() => onOpenDetail(product)} style={{ cursor: 'pointer' }}>
        <img
          src={mainImage}
          alt={product.name}
          className="ksf-prod-img"
          loading="lazy"
        />

        {/* Status Overlay if Sold Out */}
        {(isProductOutOfStock || activeVariant?.inStock === false) && (
          <div className="ksf-badge-stock-out">
            <span>Out of Stock Today</span>
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
                const isVarSoldOut = v.inStock === false;
                const vDiscount = v.mrp > v.sellingPrice 
                  ? Math.round(((v.mrp - v.sellingPrice) / v.mrp) * 100) 
                  : 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`ksf-pack-square-box ${isSelected ? 'active' : ''} ${isVarSoldOut ? 'variant-out-of-stock' : ''}`}
                    title={isVarSoldOut ? `${v.label || v.weight} (Sold Out)` : `${v.label || v.weight} - ${formatCurrency(v.sellingPrice)}`}
                  >
                    <span className="ksf-pack-square-weight" style={{ textDecoration: isVarSoldOut ? 'line-through' : 'none' }}>
                      {v.label || v.weight}
                    </span>

                    {isVarSoldOut ? (
                      <span className="ksf-pack-square-soldout">
                        Sold Out
                      </span>
                    ) : vDiscount > 0 ? (
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
            <span className="ksf-selling-price" style={{ color: isCurrentOutOfStock ? 'var(--text-muted)' : 'var(--green-primary)' }}>
              {formatCurrency(selling)}
            </span>
            {mrp > selling && (
              <span className="ksf-mrp-price">{formatCurrency(mrp)}</span>
            )}
            {discountPercent > 0 && !isCurrentOutOfStock && (
              <span className="ksf-discount-badge">
                <Sparkles size={11} style={{ marginRight: '3px' }} />
                {discountPercent}% OFF
              </span>
            )}
            {isCurrentOutOfStock && (
              <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--error-red)', marginLeft: 'auto' }}>
                ● Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Add to Cart + WhatsApp Direct + Detail Modal */}
        <div className="ksf-card-actions-wrapper">
          {isCurrentOutOfStock ? (
            <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
              <button
                disabled
                className="btn-card-sold-out"
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  background: '#F1F5F9',
                  color: '#94A3B8',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'not-allowed'
                }}
              >
                ● Out of Stock Today
              </button>

              <button
                type="button"
                onClick={() => onOpenDetail(product)}
                className="btn-card-detail"
                title="View cut specifications"
              >
                <Info size={16} />
              </button>
            </div>
          ) : (
            <>
              {/* Add to Cart / Qty Control Button */}
              {cartQty > 0 ? (
                <div className="ksf-card-qty-control">
                  <button
                    type="button"
                    onClick={(e) => handleQtyChange(e, cartQty - 1)}
                    className="ksf-card-qty-btn"
                    title="Remove 1 from basket"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="ksf-card-qty-display">
                    {cartQty} in Basket
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleQtyChange(e, cartQty + 1)}
                    className="ksf-card-qty-btn"
                    title="Add 1 more to basket"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="btn-card-add-cart"
                  title="Add to Farm Basket"
                >
                  <ShoppingBag size={16} />
                  <span>Add to Cart</span>
                </button>
              )}

              {/* Secondary Row: WhatsApp Direct + Info Modal */}
              <div className="ksf-card-secondary-actions">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-card-whatsapp-compact"
                  title="Direct 1-click WhatsApp Order"
                >
                  <MessageCircle size={15} />
                  <span>Order on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => onOpenDetail(product)}
                  className="btn-card-detail"
                  title="View full specs, FSSAI, & storage guide"
                >
                  <Info size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

