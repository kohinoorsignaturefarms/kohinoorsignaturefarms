import React from 'react';
import { X, Plus, Minus, Trash2, MessageCircle, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrency, buildCartWhatsAppUrl } from '../api';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  storeSettings,
  onExploreCuts
}) {
  if (!isOpen) return null;

  const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalSellingPrice = cartItems.reduce((sum, item) => sum + (item.sellingPrice * (item.quantity || 1)), 0);
  const totalMrp = cartItems.reduce((sum, item) => sum + ((item.mrp || item.sellingPrice) * (item.quantity || 1)), 0);
  const totalSavings = Math.max(0, totalMrp - totalSellingPrice);

  const whatsappCheckoutUrl = buildCartWhatsAppUrl(
    storeSettings?.whatsappNumber,
    cartItems,
    storeSettings
  );

  return (
    <div className="ksf-modal-overlay ksf-cart-overlay" onClick={onClose}>
      <div
        className="ksf-cart-drawer animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="ksf-cart-header">
          <div className="ksf-cart-header-title">
            <ShoppingBag size={20} className="ksf-cart-header-icon" />
            <h3>Your Farm Basket</h3>
            <span className="ksf-cart-badge-count">{totalCount}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="ksf-cart-clear-btn"
                title="Clear all items in basket"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ksf-cart-close-btn"
              title="Close basket"
              aria-label="Close basket"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Body: Items or Empty State */}
        <div className="ksf-cart-body">
          {cartItems.length === 0 ? (
            <div className="ksf-cart-empty-state">
              <div className="ksf-cart-empty-icon">
                <ShoppingBag size={48} />
              </div>
              <h4>Your Basket is Empty</h4>
              <p>Add 100% pasture-raised goat cuts, country chicken, or organic dawn eggs to start your order.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onExploreCuts) onExploreCuts();
                }}
                className="btn-cart-explore"
              >
                <span>Browse Fresh Cuts</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="ksf-cart-items-list">
              {cartItems.map((item) => {
                const itemSubtotal = item.sellingPrice * item.quantity;
                const itemMrpSubtotal = (item.mrp || item.sellingPrice) * item.quantity;
                const itemSavings = Math.max(0, itemMrpSubtotal - itemSubtotal);

                return (
                  <div key={`${item.productId}-${item.variantId}`} className="ksf-cart-item-card">
                    {/* Item Thumbnail */}
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      className="ksf-cart-item-img"
                    />

                    {/* Item Info */}
                    <div className="ksf-cart-item-info">
                      <div className="ksf-cart-item-top">
                        <h4 className="ksf-cart-item-name">{item.name}</h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.productId, item.variantId)}
                          className="ksf-cart-item-remove"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Portion and Net Weight */}
                      <div className="ksf-cart-item-variant">
                        <span className="ksf-cart-variant-tag">
                          {item.variantLabel || item.weight || 'Standard Cut'}
                        </span>
                        {item.netWeight && (
                          <span className="ksf-cart-net-weight">
                            Net: {item.netWeight}
                          </span>
                        )}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="ksf-cart-item-bottom">
                        <div className="ksf-cart-item-pricing">
                          <span className="ksf-cart-item-price">
                            {formatCurrency(itemSubtotal)}
                          </span>
                          {item.mrp > item.sellingPrice && (
                            <span className="ksf-cart-item-mrp">
                              {formatCurrency(itemMrpSubtotal)}
                            </span>
                          )}
                          {itemSavings > 0 && (
                            <span className="ksf-cart-item-savings">
                              Save {formatCurrency(itemSavings)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Counter */}
                        <div className="ksf-cart-qty-counter">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity - 1)}
                            className="ksf-cart-qty-btn"
                            title="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="ksf-cart-qty-num">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.productId, item.variantId, item.quantity + 1)}
                            className="ksf-cart-qty-btn"
                            title="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quality & Halal Assurance Banner */}
              <div className="ksf-cart-assurance-card">
                <ShieldCheck size={18} className="ksf-cart-assurance-icon" />
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
                  <strong style={{ color: 'var(--green-primary)', display: 'block' }}>
                    100% Halal & Morning Fresh Guaranteed
                  </strong>
                  Clean butchery per order • 0°C-4°C Cold chain delivery to your doorstep.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer / Bill Summary & WhatsApp Checkout */}
        {cartItems.length > 0 && (
          <div className="ksf-cart-footer">
            {/* Bill Summary */}
            <div className="ksf-cart-bill-summary">
              <div className="ksf-bill-row">
                <span>Items Total ({totalCount})</span>
                <span>{formatCurrency(totalMrp)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="ksf-bill-row ksf-bill-savings">
                  <span>Farm Discount Savings</span>
                  <span>-{formatCurrency(totalSavings)}</span>
                </div>
              )}

              <div className="ksf-bill-row">
                <span>Delivery Charge</span>
                <span style={{ color: 'var(--success-green)', fontWeight: 700 }}>Free</span>
              </div>

              <div className="ksf-bill-divider" />

              <div className="ksf-bill-row ksf-bill-total">
                <span>To Pay</span>
                <span className="ksf-bill-final-price">{formatCurrency(totalSellingPrice)}</span>
              </div>
            </div>

            {/* Direct WhatsApp Order Action */}
            <a
              href={whatsappCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cart-whatsapp-checkout"
              title="Send full order details to WhatsApp"
            >
              <MessageCircle size={20} />
              <div className="ksf-btn-text-wrap">
                <span className="ksf-btn-main">Order on WhatsApp</span>
                <span className="ksf-btn-sub">{totalCount} {totalCount === 1 ? 'Cut' : 'Cuts'} • {formatCurrency(totalSellingPrice)}</span>
              </div>
              <ArrowRight size={18} />
            </a>

            <div className="ksf-cart-footer-note">
              Instant confirmation • Direct from Kohinoor Signature Farms
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
