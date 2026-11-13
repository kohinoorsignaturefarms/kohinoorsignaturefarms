import React, { useState, useEffect } from 'react';

/**
 * 1. SUBTLE BREATHING BRAND CREST (Rolex / Hermès style)
 * Clean, quiet prestige. Only the official Kohinoor emblem with a gentle breathing pulse.
 */
export function BreathingCrestLoader({
  text = 'Preparing fresh farm cuts...',
  fullScreen = false,
  compact = false
}) {
  return (
    <div
      className="ksf-loader-breathing-crest-wrap"
      role="status"
      aria-live="polite"
      style={{
        minHeight: fullScreen ? '70vh' : compact ? 'auto' : '38vh',
        padding: compact ? '1rem 0.5rem' : '2.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
    >
      <div className="ksf-crest-breathe-card">
        <picture>
          <source srcSet="/logo-about.webp" type="image/webp" />
          <img
            src="/logo-about.png"
            alt="Kohinoor Signature Farms"
            className="ksf-crest-breathe-img"
            width="250"
            height="62"
            loading="eager"
            decoding="async"
          />
        </picture>
      </div>
      {text && <div className="ksf-crest-breathe-subtext">{text}</div>}
    </div>
  );
}

/**
 * PAGE & ROUTE LOADER
 * Default loader across Suspense fallbacks, route transitions, and catalog initial load.
 */
export function PageLoader({ text = 'Preparing fresh farm cuts...', fullScreen = false }) {
  return <BreathingCrestLoader text={text} fullScreen={fullScreen} />;
}

/**
 * CATALOG SKELETON PRODUCT CARD & GRID
 * Renders realistic shimmer placeholders for product cards.
 */
export function ProductCardSkeleton() {
  return (
    <div className="ksf-skeleton-card">
      <div className="ksf-skeleton-img-wrap ksf-skeleton-shimmer" />
      <div
        className="ksf-skeleton-shimmer ksf-skeleton-line"
        style={{ width: '45%', height: '14px', borderRadius: '999px', marginBottom: '0.65rem' }}
      />
      <div
        className="ksf-skeleton-shimmer ksf-skeleton-line"
        style={{ width: '85%', height: '18px', marginBottom: '0.35rem' }}
      />
      <div
        className="ksf-skeleton-shimmer ksf-skeleton-line"
        style={{ width: '60%', height: '14px', marginBottom: '0.85rem' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ width: '40%' }}>
          <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '100%', height: '18px', marginBottom: '0.2rem' }} />
          <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '70%', height: '12px', margin: 0 }} />
        </div>
        <div
          className="ksf-skeleton-shimmer"
          style={{ width: '80px', height: '34px', borderRadius: 'var(--radius-md)' }}
        />
      </div>
    </div>
  );
}

export function CatalogSkeletonGrid({ count = 8 }) {
  const items = Array.from({ length: count });
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.25rem',
        width: '100%',
        margin: '1.5rem 0'
      }}
    >
      {items.map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * ADMIN SAVING & PROCESSING OVERLAY
 * Uses the luxury breathing emblem inside a frosted glass modal.
 */
export function AdminSavingOverlay({
  title = 'Saving Changes',
  subtitle = 'Updating store catalog and syncing with cloud database...'
}) {
  return (
    <div className="ksf-admin-save-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="ksf-admin-save-card">
        {/* Subtle Breathing Brand Crest */}
        <div
          className="ksf-crest-breathe-card"
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '14px',
            border: '1.5px solid var(--gold-primary)',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)'
          }}
        >
          <picture>
            <source srcSet="/logo-about.webp" type="image/webp" />
            <img
              src="/logo-about.png"
              alt="Kohinoor Signature Farms"
              className="ksf-crest-breathe-img"
              width="210"
              height="52"
              style={{ maxWidth: '210px' }}
            />
          </picture>
        </div>

        <div>
          <h4
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--green-primary)',
              margin: '0 0 0.35rem 0'
            }}
          >
            {title}
          </h4>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.5
            }}
          >
            {subtitle}
          </p>
        </div>

        <div style={{ width: '180px' }}>
          <div className="ksf-indeterminate-bar" />
        </div>
      </div>
    </div>
  );
}

/**
 * ADMIN ANALYTICS SKELETON
 */
export function AdminAnalyticsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '40%', height: '12px', marginBottom: '0.65rem' }} />
            <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '65%', height: '26px', marginBottom: '0.4rem' }} />
            <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '50%', height: '12px', margin: 0 }} />
          </div>
        ))}
      </div>

      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '30%', height: '18px', marginBottom: '1.25rem' }} />
        <div className="ksf-skeleton-shimmer" style={{ width: '100%', height: '220px', borderRadius: 'var(--radius-md)' }} />
      </div>
    </div>
  );
}

/**
 * ADMIN ORDERS SKELETON
 */
export function AdminOrdersSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '35%', height: '16px' }} />
            <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '80px', height: '22px', borderRadius: '999px' }} />
          </div>
          <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '60%', height: '14px', marginBottom: '0.4rem' }} />
          <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '45%', height: '14px', margin: 0 }} />
        </div>
      ))}
    </div>
  );
}

/**
 * ADMIN TABLE SKELETON
 */
export function AdminTableSkeleton() {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1rem', overflow: 'hidden' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.85rem 0',
            borderBottom: i < 5 ? '1px solid var(--border-light)' : 'none'
          }}
        >
          <div className="ksf-skeleton-shimmer" style={{ width: '56px', height: '56px', borderRadius: '8px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '40%', height: '16px', marginBottom: '0.35rem' }} />
            <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '25%', height: '12px', margin: 0 }} />
          </div>
          <div className="ksf-skeleton-shimmer ksf-skeleton-line" style={{ width: '70px', height: '18px' }} />
          <div className="ksf-skeleton-shimmer" style={{ width: '90px', height: '32px', borderRadius: '6px' }} />
        </div>
      ))}
    </div>
  );
}
