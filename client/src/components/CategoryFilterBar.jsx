import React from 'react';
import { Flame } from 'lucide-react';

export default function CategoryFilterBar({
  categories,
  activeCategory,
  onSelectCategory,
  products,
  onlyBestSellers,
  setOnlyBestSellers
}) {
  const getCount = (catId) => {
    if (!products) return 0;
    if (catId === 'all') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  const bestSellersCount = (products || []).filter((p) =>
    (p.badges || []).some((b) => b.toLowerCase().includes('best') || b.toLowerCase().includes('popular'))
  ).length;

  return (
    <div className="ksf-filter-strip" id="products-filter-bar">
      <div className="ksf-container">
        <div className="ksf-pills-wrap">
          {/* All Cuts */}
          <button
            className={`ksf-filter-pill ${activeCategory === 'all' && !onlyBestSellers ? 'active' : ''}`}
            onClick={() => {
              setOnlyBestSellers(false);
              onSelectCategory('all');
            }}
          >
            <span>🥩 All Fresh Cuts</span>
            <span className="ksf-pill-count">{getCount('all')}</span>
          </button>

          {/* Dynamic Categories */}
          {(categories || []).map((cat) => {
            const isSelected = activeCategory === cat.id && !onlyBestSellers;
            return (
              <button
                key={cat.id}
                className={`ksf-filter-pill ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setOnlyBestSellers(false);
                  onSelectCategory(cat.id);
                }}
              >
                <span>{cat.icon || '🥩'} {cat.name}</span>
                <span className="ksf-pill-count">{getCount(cat.id)}</span>
              </button>
            );
          })}

          {/* Best Sellers Filter Pill */}
          <button
            className={`ksf-filter-pill ${onlyBestSellers ? 'active' : ''}`}
            onClick={() => {
              setOnlyBestSellers(!onlyBestSellers);
              onSelectCategory('all');
            }}
          >
            <Flame size={15} style={{ color: onlyBestSellers ? '#FFFFFF' : '#EA580C' }} />
            <span>Best Sellers</span>
            <span className="ksf-pill-count">{bestSellersCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
