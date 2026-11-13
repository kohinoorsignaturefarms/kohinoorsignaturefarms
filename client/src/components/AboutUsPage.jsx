import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/* Helper: renders a Material Symbols Outlined icon */
function MI({ name, size = 24, style = {} }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center', ...style }}
    >
      {name}
    </span>
  );
}

// Curated default high-resolution WebP farm photos direct from Kohinoor Sanctuary (F:\KSF Images)
const DEFAULT_FARM_GALLERY = [
  {
    id: 'farm-def-1',
    image: '/farm/farm-1.webp',
    title: 'Elevated Slotted Flock Shelters',
    caption: 'Indigenous flock housed in ventilated, elevated slotted shelters designed for high veterinary hygiene, clean bedding, and maximum welfare.',
    tag: 'Hygienic Housing',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-2',
    image: '/farm/farm-2.webp',
    title: 'Open-Paddock Sunlight Grazing',
    caption: 'Young goats and lambs enjoying fresh morning sunshine and organic whole-grain feed in our open farm paddocks.',
    tag: 'Open Paddock',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-3',
    image: '/farm/farm-3.webp',
    title: 'Prize Indigenous Heritage Goat',
    caption: 'A robust indigenous black goat displaying radiant health, nourished on natural pasture foraging and zero growth hormones.',
    tag: 'Heritage Breed',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-4',
    image: '/farm/farm-4.webp',
    title: '100% Organic Herbal & Alfalfa Fodder',
    caption: 'Spotted breed goat feeding on farm-cultivated dry alfalfa and medicinal herbs, ensuring lean, tender, and wholesome meat.',
    tag: 'Organic Nutrition',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-5',
    image: '/farm/farm-5.webp',
    title: 'Vast Agro-Sanctuary Aerial Horizon',
    caption: 'Panoramic sunrise drone view of Kohinoor Signature Farms across Shankarpally, featuring expansive orchards, water reservoirs, and green fields.',
    tag: 'Sanctuary View',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-6',
    image: '/farm/farm-6.webp',
    title: 'Sanctuary Morning Feed Gathering',
    caption: 'Bird\'s-eye drone perspective of sheep gathering naturally around open-air feeding stations on pesticide-free red soil pastures.',
    tag: 'Sanctuary Life',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-7',
    image: '/farm/farm-7.webp',
    title: 'Sustainable Agro-Forestry & Orchards',
    caption: 'High-altitude aerial survey revealing our integrated palm groves, fruit orchards, polyhouses, and sustainable permaculture design.',
    tag: 'Agro-Forestry',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-8',
    image: '/farm/farm-8.webp',
    title: 'Solar Powered Green Infrastructure',
    caption: 'Eco-friendly solar array, sheltered polyhouse cultivation nursery, and precision organic crop rows supporting a zero-chemical ecosystem.',
    tag: 'Clean Energy',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-9',
    image: '/farm/farm-9.webp',
    title: 'Open Herd Paddocks & Shaded Stalls',
    caption: 'Aerial view of shaded blue-canopy shelters and organized hydration troughs providing optimal comfort and shade during afternoon hours.',
    tag: 'Ethical Welfare',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-10',
    image: '/farm/farm-10.webp',
    title: 'Afternoon Herd Hydration & Nourishment',
    caption: 'Organized paddock feeding and clean RO water stations keeping the entire herd well-nourished, hydrated, and tranquil.',
    tag: 'Daily Farm Life',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-11',
    image: '/farm/farm-11.webp',
    title: 'Modern Bio-Secure Barn Facilities',
    caption: 'Engineered livestock housing built with ventilated roofs, veterinary quarantine zones, and hygienic waste management systems.',
    tag: 'Modern Farming',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-12',
    image: '/farm/farm-12.webp',
    title: 'Lakeside Farm Sanctuary Panorama',
    caption: 'Breathtaking landscape overlooking the tranquil lake waters adjoining Kohinoor Signature Farms, blessing the soil with natural moisture.',
    tag: 'Lakeside Sanctuary',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-13',
    image: '/farm/farm-13.webp',
    title: 'Organic Polyhouse & Banana Groves',
    caption: 'Low-altitude flight capturing the protective greenhouse nursery surrounded by lush banana trees and coconut palm corridors.',
    tag: 'Green Pastures',
    monthYear: 'November 2026',
    active: true
  },
  {
    id: 'farm-def-14',
    image: '/farm/farm-14.webp',
    title: 'Sanctuary Orchard & Facility Courtyard',
    caption: 'Vertical drone overview of the central facility compound flanked by growing fruit tree rows and open grazing borders.',
    tag: 'Farm Compound',
    monthYear: 'November 2026',
    active: true
  }
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Stable defaults to prevent allocation on every render
const EMPTY_GALLERY = [];
const EMPTY_SETTINGS = {};

function FarmSlideshow({ gallery = EMPTY_GALLERY, settings = EMPTY_SETTINGS }) {
  const isRandomizeEnabled = settings?.randomize !== false;
  const autoplayEnabled = settings?.autoplay !== false;
  // 3.5s duration per photo with gentle breathe-in Ken Burns effect
  const intervalSeconds = Math.max(2, Number(settings?.intervalSeconds) || 3.5);

  // Resolved list of active items
  const sourceItems = useMemo(() => {
    const list = Array.isArray(gallery) && gallery.length > 0 ? gallery : DEFAULT_FARM_GALLERY;
    const activeOnes = list.filter((item) => item && item.active !== false && item.image);
    return activeOnes.length > 0 ? activeOnes : DEFAULT_FARM_GALLERY;
  }, [gallery]);

  // Fingerprint of image IDs to detect actual content changes without false re-shuffles
  const galleryFingerprint = useMemo(() => {
    return sourceItems.map((item) => `${item.id || item.image}_${item.title || ''}`).join('|');
  }, [sourceItems]);

  // Shuffled slides state (randomizes on mount)
  const [slides, setSlides] = useState(() => {
    return isRandomizeEnabled ? shuffleArray(sourceItems) : [...sourceItems];
  });

  const lastFingerprintRef = useRef(galleryFingerprint);
  const lastRandomizeRef = useRef(isRandomizeEnabled);

  // Only re-shuffle if photos actually changed or randomize toggle was switched
  useEffect(() => {
    if (
      lastFingerprintRef.current !== galleryFingerprint ||
      lastRandomizeRef.current !== isRandomizeEnabled
    ) {
      lastFingerprintRef.current = galleryFingerprint;
      lastRandomizeRef.current = isRandomizeEnabled;
      setSlides(isRandomizeEnabled ? shuffleArray(sourceItems) : [...sourceItems]);
      setCurrentIndex(0);
    }
  }, [galleryFingerprint, isRandomizeEnabled, sourceItems]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  const total = slides.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay with stable timer
  useEffect(() => {
    if (!autoplayEnabled || isPaused || total <= 1) return;
    const intervalMs = Math.round(intervalSeconds * 1000);
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoplayEnabled, isPaused, intervalSeconds, total]);

  // Touch Swipe (Cross-browser safe: distinguishes horizontal swipe from vertical page scroll)
  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsPaused(true);
  };

  const onTouchEnd = (e) => {
    if (touchStartX === null || touchStartY === null) return;
    const touch = e.changedTouches?.[0];
    if (touch) {
      const diffX = touchStartX - touch.clientX;
      const diffY = touchStartY - touch.clientY;
      // Only advance slide if user swiped predominantly horizontally (> 40px and 1.4x greater than vertical movement)
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
        if (diffX > 0) handleNext();
        else handlePrev();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setIsPaused(false);
  };

  if (total === 0) return null;
  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div
      className="ksf-farm-slideshow-wrap"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="ksf-farm-slideshow-viewport">
        {/* Animated Progress Bar across top */}
        {autoplayEnabled && !isPaused && total > 1 && (
          <div
            key={currentIndex}
            className="ksf-farm-slide-progress-line"
            style={{ animationDuration: `${intervalSeconds}s` }}
          />
        )}

        {/* Slides */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`ksf-farm-slide ${isActive ? 'active' : ''}`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.title || 'Kohinoor Signature Farms sanctuary photo'}
                className="ksf-farm-slide-img"
                style={isActive ? { animationDuration: `${intervalSeconds + 0.4}s` } : undefined}
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchpriority={idx === 0 ? 'high' : 'low'}
                decoding="async"
              />
              <div className="ksf-farm-slide-scrim" />
            </div>
          );
        })}

        {/* Top Control Bar with Slide Counter */}
        {total > 1 && (
          <div className="ksf-farm-slideshow-top" style={{ justifyContent: 'flex-end' }}>
            <div className="ksf-farm-counter-pill">
              {currentIndex + 1} / {total}
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="ksf-farm-nav-arrow ksf-farm-nav-prev"
              title="Previous farm photo"
              aria-label="Previous farm photo"
            >
              <MI name="chevron_left" size={24} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="ksf-farm-nav-arrow ksf-farm-nav-next"
              title="Next farm photo"
              aria-label="Next farm photo"
            >
              <MI name="chevron_right" size={24} />
            </button>
          </>
        )}

        {/* Bottom Slide Content */}
        <div className="ksf-farm-slide-content">
          {currentSlide.tag && (
            <span className="ksf-farm-tag-pill">
              <MI name="verified" size={12} />
              <span>{currentSlide.tag}</span>
            </span>
          )}
          <h3 className="ksf-farm-slide-title">
            {currentSlide.title}
          </h3>
          {currentSlide.caption && (
            <p className="ksf-farm-slide-desc">
              {currentSlide.caption}
            </p>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      {total > 1 && (
        <div className="ksf-farm-dots">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`ksf-farm-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Selector Strip */}
      {total > 1 && (
        <div className="ksf-farm-thumbs-strip">
          {slides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              type="button"
              className={`ksf-farm-thumb-item ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              title={slide.title}
              aria-label={`View ${slide.title}`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="ksf-farm-thumb-img"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AboutUsPage({ storeSettings, onGoToStore }) {
  const whatsappNumber = (storeSettings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
  const founder = storeSettings?.founder || 'Feroz Shaik';
  const tagline = storeSettings?.tagline || 'Nurturing Life, Growing Prosperity';

  const pillars = [
    {
      icon: <MI name="eco" size={28} />,
      title: 'NATURAL FEED',
      subtitle: 'BETTER HEALTH',
      badge: '100% Organic Diet',
      description:
        'Our livestock feeds exclusively on organic green pasture, wild alfalfa, and pesticide-free grains. Zero artificial hormones, growth stimulants, or antibiotics.'
    },
    {
      icon: <MI name="military_tech" size={28} />,
      title: 'PREMIUM BREEDING',
      subtitle: 'QUALITY LIVESTOCK',
      badge: 'Native Bloodlines',
      description:
        'Selected pure native breeds raised in open-air, stress-free environments. This delivers authentic marbling, exceptional tenderness, and true culinary flavor.'
    },
    {
      icon: <MI name="agriculture" size={28} />,
      title: 'MODERN FARMING',
      subtitle: 'SUSTAINABLE FUTURE',
      badge: 'Eco-Conscious',
      description:
        'Eco-conscious farming integrating solar power, clean RO water systems, organic manure recycling, and sustainable agro-pastoral practices.'
    },
    {
      icon: <MI name="group" size={28} />,
      title: 'TRUSTED CARE',
      subtitle: 'BETTER YIELD',
      badge: 'Vet Supervised',
      description:
        'Regular certified veterinary supervision, compassionate livestock handling, and 100% authentic Halal slaughtering in hygienic, cold-chain conditions.'
    }
  ];

  const standards = [
    {
      icon: <MI name="grass" size={32} />,
      title: '100% Natural Herbal Feed',
      desc: 'Organic pasture grass, wild alfalfa & pesticide-free grain mix'
    },
    {
      icon: <MI name="wb_sunny" size={32} />,
      title: 'Stress-Free Open Pasture',
      desc: 'Free-range roaming under open sunlight for maximum vitality'
    },
    {
      icon: <MI name="verified" size={32} />,
      title: 'Certified Halal Butchery',
      desc: 'Strict authentic manual Halal practices by trained butchers'
    },
    {
      icon: <MI name="ac_unit" size={32} />,
      title: '0°C-4°C Cold Chain Delivery',
      desc: 'Hygienically chilled from butcher block to customer doorstep'
    },
    {
      icon: <MI name="do_not_disturb_on" size={32} />,
      title: 'Zero Antibiotics & Growth Hormones',
      desc: '100% clean meat without synthetic chemical additives'
    },
    {
      icon: <MI name="health_and_safety" size={32} />,
      title: 'Veterinary Supervised',
      desc: 'Daily certified clinical livestock health screening'
    }
  ];

  return (
    <div className="ksf-about-page animate-fade-in">
      {/* Hero Header Section */}
      <section className="ksf-about-hero">
        <div className="ksf-container" style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto' }}>
          {/* Page 2 Official Brand Logo for About Page */}
          <div
            className="ksf-about-hero-logo-wrap"
            onClick={onGoToStore}
            title="Return to Home Store"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onGoToStore?.()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFFFFF',
              padding: '0.85rem 1.85rem',
              borderRadius: '18px',
              border: '2px solid var(--gold-primary)',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.42), 0 0 24px rgba(212, 175, 55, 0.22)',
              margin: '0 auto 1.65rem',
              maxWidth: '90%',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          >
            <picture>
              <source srcSet="/logo-about.webp" type="image/webp" />
              <img
                src="/logo-about.png"
                alt="Kohinoor Signature Farms Official Logo"
                className="ksf-about-hero-logo"
                width="880"
                height="218"
                loading="lazy"
                decoding="async"
                style={{
                  maxWidth: '340px',
                  width: '85%',
                  height: 'auto',
                  display: 'inline-block'
                }}
              />
            </picture>
          </div>

          <div className="ksf-about-badge">
            <MI name="auto_awesome" size={13} style={{ color: 'var(--gold-primary)' }} />
            <span>THE KOHINOOR STANDARD • AGRO &amp; LIVESTOCK FARMS</span>
          </div>

          <h1 className="ksf-about-title">
            The Kohinoor Standard
          </h1>
          <div className="ksf-about-tagline">
            "{tagline}"
          </div>

          <p className="ksf-about-lead">
            We believe that clean, uncompromised nutrition starts from honest farming. Every cut is prepared fresh upon order from healthy, happy livestock raised in serene pasturelands.
          </p>

          <div className="ksf-about-hero-actions">
            <button
              type="button"
              onClick={onGoToStore}
              className="btn-about-primary"
            >
              <MI name="shopping_bag" size={17} />
              <span>Explore Today's Fresh Cuts</span>
            </button>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Kohinoor Signature Farms! I would like to learn more about your farm practices and fresh cuts.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-about-secondary"
            >
              <MI name="chat" size={17} />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION: Life At Kohinoor Sanctuary — Monthly Photo Slideshow (Directly Below Hero) */}
      <section className="ksf-about-section ksf-about-section-alt" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
        <div className="ksf-container" style={{ maxWidth: '1040px' }}>
          <div className="ksf-section-title-wrap">
            <h2 className="ksf-section-h2">
              {storeSettings?.farmGallerySettings?.title || 'Glimpses of Kohinoor Sanctuary'}
            </h2>
            {(() => {
              const rawSub = storeSettings?.farmGallerySettings?.subtitle || 'Authentic, unedited moments from our Shankarpally - Chevella corridor sanctuary.';
              const cleanSub = rawSub.replace(/\.?\s*(Order dynamically shuffled on every visit|Updated monthly & dynamically shuffled|dynamically shuffled)[\.\s]*/gi, '. ').trim().replace(/\.\s*\.$/, '.');
              return cleanSub ? <p className="ksf-section-p">{cleanSub}</p> : null;
            })()}
          </div>

          <FarmSlideshow
            gallery={storeSettings?.farmGallery}
            settings={storeSettings?.farmGallerySettings}
          />
        </div>
      </section>

      {/* SECTION 1: 100% Halal Guarantee & Founder Assurance (Square Cards) */}
      <section className="ksf-about-section">
        <div className="ksf-container" style={{ maxWidth: '960px' }}>
          {/* Page 2 Brand Identity Lockup */}
          <div
            onClick={onGoToStore}
            title="Return to Home Store"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onGoToStore?.()}
            style={{ textAlign: 'center', marginBottom: '2rem', cursor: 'pointer' }}
          >
            <picture>
              <source srcSet="/logo-about.webp" type="image/webp" />
              <img
                src="/logo-about.png"
                alt="Kohinoor Signature Farms Official Logo"
                width="880"
                height="218"
                loading="lazy"
                decoding="async"
                style={{
                  maxWidth: '340px',
                  width: '85%',
                  height: 'auto',
                  display: 'inline-block'
                }}
              />
            </picture>
          </div>

          <div className="ksf-guarantee-square-grid">
            {/* Square Card 1: 100% Authentic Halal Guarantee */}
            <div className="ksf-guarantee-square-card">
              <div className="ksf-guarantee-square-icon">
                <MI name="shield" size={32} />
              </div>
              <span className="ksf-guarantee-square-badge">AUTHENTIC HALAL GUARANTEE</span>
              <h3 className="ksf-guarantee-square-title">
                100% Halal &amp; Pure Farm Direct
              </h3>
              <p className="ksf-guarantee-square-text">
                Every order is prepared with strict adherence to authentic Halal principles, certified veterinary inspection, and cold-chain sanitization. From our farm directly to your dining table.
              </p>
              <div className="ksf-guarantee-square-pills">
                <span>100% Halal</span>
                <span>•</span>
                <span>Never Frozen</span>
                <span>•</span>
                <span>Farm Direct</span>
              </div>
            </div>

            {/* Square Card 2: Founded & Managed by Feroz Shaik */}
            <div className="ksf-guarantee-square-card">
              <div className="ksf-guarantee-square-avatar-wrap">
                <picture>
                  <source srcSet="/logo_page_1_square.webp" type="image/webp" />
                  <img
                    src="/logo_page_1_square.png"
                    alt="Kohinoor Signature Farms"
                    className="ksf-guarantee-square-avatar"
                    width="256"
                    height="256"
                    loading="lazy"
                    decoding="async"
                    style={{ objectFit: 'contain', background: '#FFFFFF' }}
                  />
                </picture>
              </div>
              <span className="ksf-guarantee-square-badge">FOUNDED &amp; MANAGED BY</span>
              <h3 className="ksf-guarantee-square-title">
                {founder}
              </h3>
              <div className="ksf-guarantee-square-org">
                Kohinoor Signature Farms
              </div>
              <p className="ksf-guarantee-square-quote">
                "Clean, uncompromised nutrition starts from honest farming. Every cut is prepared fresh upon order from healthy livestock raised with compassion."
              </p>
              <div className="ksf-guarantee-square-pills">
                <span>Ethical Care</span>
                <span>•</span>
                <span>Organic Pasture</span>
                <span>•</span>
                <span>Pure Trust</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Core Agricultural & Ethical Pillars */}
      <section className="ksf-about-section">
        <div className="ksf-container">
          <div className="ksf-section-title-wrap">
            <span className="ksf-section-badge">INTEGRITY &amp; HERITAGE</span>
            <h2 className="ksf-section-h2">Core Agricultural &amp; Ethical Pillars</h2>
            <p className="ksf-section-p">
              From pasture soil to table, our four founding pillars ensure authentic taste, peak nutrition, and uncompromised food safety.
            </p>
          </div>

          <div className="ksf-pillars-grid">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="ksf-pillar-card">
                <div className="ksf-pillar-card-head">
                  <div className="ksf-pillar-icon-box">
                    {pillar.icon}
                  </div>
                  <span className="ksf-pillar-badge">{pillar.badge}</span>
                </div>
                <h3 className="ksf-pillar-title">{pillar.title}</h3>
                <div className="ksf-pillar-subtitle">{pillar.subtitle}</div>
                <p className="ksf-pillar-desc">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Quality & Hygiene Standards */}
      <section className="ksf-about-section">
        <div className="ksf-container">
          <div className="ksf-section-title-wrap">
            <span className="ksf-section-badge">FOOD SAFETY &amp; HYGIENE</span>
            <h2 className="ksf-section-h2">Our Quality &amp; Hygiene Standards</h2>
            <p className="ksf-section-p">
              Zero compromises on purity. We enforce rigorous cold-chain protocols and traditional methods at every step.
            </p>
          </div>

          <div className="ksf-standards-square-grid">
            {standards.map((std, idx) => (
              <div key={idx} className="ksf-standard-square-card">
                <div className="ksf-std-square-icon">{std.icon}</div>
                <h4 className="ksf-std-square-title">{std.title}</h4>
                <p className="ksf-std-square-desc">{std.desc}</p>
                <div className="ksf-std-square-badge">
                  <MI name="check_circle" size={13} />
                  <span>Verified Standard</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Bottom Call To Action */}
      <section className="ksf-about-cta">
        <div className="ksf-container" style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', color: 'var(--gold-light)', fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.65rem' }}>
            Taste the Authentic Difference
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Experience pasture-raised meat prepared with uncompromising hygiene. Delivered chilled at 0°C - 4°C directly to your door.
          </p>
          <button
            type="button"
            onClick={onGoToStore}
            className="btn-about-cta-primary"
          >
            <MI name="shopping_bag" size={18} />
            <span>Order Fresh Cuts Now</span>
          </button>
        </div>
      </section>
    </div>
  );
}
