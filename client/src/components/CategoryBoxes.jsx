import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CategoryBoxes({ categories, activeCategory, onSelectCategory, products }) {
  const getProductCount = (catId) => {
    if (!products) return 0;
    return products.filter((p) => p.category === catId).length;
  };

  const handleCardClick = (catId) => {
    onSelectCategory(catId);
    const elem = document.getElementById('products-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Default fallback if categories not loaded yet
  const displayCats = categories && categories.length > 0 ? categories : [
    {
      id: 'goat',
      name: 'Goat & Sheep (Mutton)',
      icon: '🐐',
      badge: 'Pasture-Raised',
      tagline: 'Tender grass-fed meat with rich flavor & zero hormones',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'chicken',
      name: 'Country & Farm Chicken',
      icon: '🐔',
      badge: 'Antibiotic-Free',
      tagline: 'Authentic free-range Natukodi & juicy tender cuts',
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'eggs',
      name: 'Farm-Fresh Organic Eggs',
      icon: '🥚',
      badge: 'Daily Dawn Collection',
      tagline: 'Golden yolk eggs rich in natural Omega-3 & clean protein',
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'combos',
      name: 'Special Cuts & Farm Combos',
      icon: '✨',
      badge: 'Super Savings',
      tagline: 'Hand-picked bundles of premium mutton, chicken & eggs for family feasts',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <section className="ksf-category-spotlight">
      <div className="ksf-container">
        <div className="ksf-section-header">
          <div>
            <h2 className="ksf-section-title">Farm-Fresh Collections</h2>
            <p className="ksf-section-subtitle">
              Sourced directly from our organic pastures • Hygienically cut & chilled
            </p>
          </div>
          <button
            onClick={() => handleCardClick('all')}
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--green-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span>View All Cuts</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* 4 Category Cards Row */}
        <div className="ksf-category-grid">
          {displayCats.map((cat) => {
            const count = getProductCount(cat.id);
            const isSelected = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                className={`ksf-cat-card ${isSelected ? 'active' : ''}`}
                onClick={() => handleCardClick(cat.id)}
              >
                <div className="ksf-cat-top">
                  <span className="ksf-cat-icon">{cat.icon || '🥩'}</span>
                  {cat.badge && (
                    <span className="ksf-cat-badge">
                      <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
                      {cat.badge}
                    </span>
                  )}
                </div>

                <div className="ksf-cat-info">
                  <h3 className="ksf-cat-name">{cat.name}</h3>
                  <p className="ksf-cat-desc">{cat.tagline || cat.description}</p>
                </div>

                <div className="ksf-cat-action">
                  <span>Explore {count > 0 ? `${count} Cuts` : 'Collection'}</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
