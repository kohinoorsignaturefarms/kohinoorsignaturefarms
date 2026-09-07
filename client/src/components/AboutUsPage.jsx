import React from 'react';
import {
  Leaf,
  Award,
  Building2,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function AboutUsPage({ storeSettings, onGoToStore }) {
  const whatsappNumber = (storeSettings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
  const founder = storeSettings?.founder || 'Feroz Shaik';
  const tagline = storeSettings?.tagline || 'Nurturing Life, Growing Prosperity';

  const pillars = [
    {
      icon: <Leaf size={28} />,
      title: 'NATURAL FEED',
      subtitle: 'BETTER HEALTH',
      badge: '100% Organic Diet',
      description:
        'Our livestock feeds exclusively on organic green pasture, wild alfalfa, and pesticide-free grains. Zero artificial hormones, growth stimulants, or antibiotics.'
    },
    {
      icon: <Award size={28} />,
      title: 'PREMIUM BREEDING',
      subtitle: 'QUALITY LIVESTOCK',
      badge: 'Native Bloodlines',
      description:
        'Selected pure native breeds raised in open-air, stress-free environments. This delivers authentic marbling, exceptional tenderness, and true culinary flavor.'
    },
    {
      icon: <Building2 size={28} />,
      title: 'MODERN FARMING',
      subtitle: 'SUSTAINABLE FUTURE',
      badge: 'Eco-Conscious',
      description:
        'Eco-conscious farming integrating solar power, clean RO water systems, organic manure recycling, and sustainable agro-pastoral practices.'
    },
    {
      icon: <Users size={28} />,
      title: 'TRUSTED CARE',
      subtitle: 'BETTER YIELD',
      badge: 'Vet Supervised',
      description:
        'Regular certified veterinary supervision, compassionate livestock handling, and 100% authentic Halal slaughtering in hygienic, cold-chain conditions.'
    }
  ];

  const standards = [
    {
      icon: '🌱',
      title: '100% Natural Herbal Feed',
      desc: 'Organic pasture grass, wild alfalfa & pesticide-free grain mix'
    },
    {
      icon: '🐐',
      title: 'Stress-Free Open Pasture',
      desc: 'Free-range roaming under open sunlight for maximum vitality'
    },
    {
      icon: '🛡️',
      title: 'Certified Halal Butchery',
      desc: 'Strict authentic manual Halal practices by trained butchers'
    },
    {
      icon: '❄️',
      title: '0°C-4°C Cold Chain Delivery',
      desc: 'Hygienically chilled from butcher block to customer doorstep'
    },
    {
      icon: '🚫',
      title: 'Zero Antibiotics & Growth Hormones',
      desc: '100% clean meat without synthetic chemical additives'
    }
  ];

  return (
    <div className="ksf-about-page animate-fade-in">
      {/* Top Breadcrumb & Quick Action Bar */}
      <div className="ksf-about-topbar">
        <div className="ksf-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onGoToStore}
            className="ksf-about-back-btn"
            title="Return to fresh cuts store"
          >
            <ArrowLeft size={16} />
            <span>Return to Storefront</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: 'var(--green-primary)', fontWeight: 700 }}>About Us & Standards</span>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="ksf-about-hero">
        <div className="ksf-container" style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto' }}>
          <div className="ksf-about-badge">
            <Sparkles size={13} style={{ color: 'var(--gold-primary)' }} />
            <span>THE KOHINOOR STANDARD • AGRO & LIVESTOCK FARMS</span>
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
              <ShoppingBag size={17} />
              <span>Explore Today's Fresh Cuts</span>
            </button>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Kohinoor Signature Farms! I would like to learn more about your farm practices and fresh cuts.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-about-secondary"
            >
              <MessageCircle size={17} />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 1: Core Agricultural & Ethical Pillars */}
      <section className="ksf-about-section">
        <div className="ksf-container">
          <div className="ksf-section-title-wrap">
            <span className="ksf-section-badge">INTEGRITY & HERITAGE</span>
            <h2 className="ksf-section-h2">Core Agricultural & Ethical Pillars</h2>
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

      {/* SECTION 2: Quality & Hygiene Standards */}
      <section className="ksf-about-section ksf-about-section-alt">
        <div className="ksf-container">
          <div className="ksf-section-title-wrap">
            <span className="ksf-section-badge">FOOD SAFETY & HYGIENE</span>
            <h2 className="ksf-section-h2">Our Quality & Hygiene Standards</h2>
            <p className="ksf-section-p">
              Zero compromises on purity. We enforce rigorous cold-chain protocols and traditional methods at every step.
            </p>
          </div>

          <div className="ksf-standards-clean-grid">
            {standards.map((std, idx) => (
              <div key={idx} className="ksf-standard-item-card">
                <div className="ksf-std-icon-bubble">{std.icon}</div>
                <div className="ksf-std-card-text">
                  <h4 className="ksf-std-card-title">{std.title}</h4>
                  <p className="ksf-std-card-desc">{std.desc}</p>
                </div>
                <CheckCircle2 size={18} className="ksf-std-check-icon" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: 100% Halal Guarantee & Founder Attribution */}
      <section className="ksf-about-section">
        <div className="ksf-container">
          <div className="ksf-founder-feature-card">
            <div className="ksf-founder-feature-content">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.35)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', color: 'var(--gold-light)', fontSize: '0.78rem', fontWeight: 800, marginBottom: '1rem' }}>
                <ShieldCheck size={16} />
                <span>AUTHENTIC HALAL & PURE FARM DIRECT GUARANTEE</span>
              </div>

              <h3 className="ksf-founder-feature-heading">
                100% Halal & Pure Farm Direct Guarantee
              </h3>

              <p className="ksf-founder-feature-text">
                Every order is prepared with strict adherence to authentic Halal principles, veterinary inspection, and temperature-controlled sanitization. From our farm directly to your dining table.
              </p>

              <div className="ksf-founder-meta-row">
                <div className="ksf-founder-avatar-wrap">
                  <img src="/logo.jpeg" alt="Kohinoor Signature Farms" className="ksf-founder-avatar" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    Founded & Managed By
                  </div>
                  <div className="ksf-founder-name">
                    {founder}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    Kohinoor Signature Farms
                  </div>
                </div>
              </div>
            </div>

            <div className="ksf-founder-feature-aside">
              <div className="ksf-founder-aside-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.65rem' }}>
                  <MapPin size={18} />
                  <span>Farm Location</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {storeSettings?.farmAddress || 'Shankarpally - Chevella Corridor, Hyderabad, Telangana'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.65rem' }}>
                  <Clock size={18} />
                  <span>Daily Butchery Schedule</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5 }}>
                  {storeSettings?.operatingHours || '6:00 AM - 9:00 PM (Fresh Morning Cuts)'}
                </p>
              </div>
            </div>
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
            <ShoppingBag size={18} />
            <span>Order Fresh Cuts Now</span>
          </button>
        </div>
      </section>
    </div>
  );
}
