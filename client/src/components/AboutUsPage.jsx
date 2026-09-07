import React from 'react';
import {
  Leaf,
  Award,
  Building2,
  Users,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  MessageCircle,
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

      {/* SECTION 3: 100% Halal Guarantee & Founder Assurance */}
      <section className="ksf-about-section">
        <div className="ksf-container" style={{ maxWidth: '920px' }}>
          <div className="ksf-guarantee-card">
            {/* Top Seal Badge */}
            <div className="ksf-guarantee-badge">
              <ShieldCheck size={18} />
              <span>100% AUTHENTIC HALAL & PURE FARM-DIRECT GUARANTEE</span>
            </div>

            {/* Main Heading */}
            <h3 className="ksf-guarantee-title">
              Our Promise of Uncompromised Purity
            </h3>

            {/* Guarantee Statement */}
            <p className="ksf-guarantee-statement">
              Every harvest is prepared with strict adherence to authentic Halal principles, certified veterinary care, and pristine hygienic conditions. Never frozen, never chemically preserved—harvested fresh upon your order from our open pastures directly to your table.
            </p>

            {/* 3 Pillar Highlights */}
            <div className="ksf-guarantee-pillars">
              <div className="ksf-guarantee-pillar-item">
                <span className="ksf-guarantee-pillar-icon">🌿</span>
                <div>
                  <div className="ksf-guarantee-pillar-label">Pasture-Raised</div>
                  <div className="ksf-guarantee-pillar-sub">Organic Herb & Grass Fed</div>
                </div>
              </div>

              <div className="ksf-guarantee-pillar-item">
                <span className="ksf-guarantee-pillar-icon">✨</span>
                <div>
                  <div className="ksf-guarantee-pillar-label">100% Authentic Halal</div>
                  <div className="ksf-guarantee-pillar-sub">Ethical & Compassionate</div>
                </div>
              </div>

              <div className="ksf-guarantee-pillar-item">
                <span className="ksf-guarantee-pillar-icon">❄️</span>
                <div>
                  <div className="ksf-guarantee-pillar-label">Cold-Chain Sanitized</div>
                  <div className="ksf-guarantee-pillar-sub">Chilled at 0°C – 4°C</div>
                </div>
              </div>
            </div>

            {/* Founder Sign-off */}
            <div className="ksf-guarantee-founder">
              <div className="ksf-guarantee-avatar-wrap">
                <img src="/logo.jpeg" alt="Kohinoor Signature Farms" className="ksf-guarantee-avatar" />
              </div>
              <div className="ksf-guarantee-founder-info">
                <div className="ksf-guarantee-founder-quote">
                  "Honest farming, clean nutrition, and uncompromised trust for every family."
                </div>
                <div className="ksf-guarantee-founder-name">
                  {founder}
                </div>
                <div className="ksf-guarantee-founder-role">
                  Founder & Farm Director • Kohinoor Signature Farms
                </div>
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
