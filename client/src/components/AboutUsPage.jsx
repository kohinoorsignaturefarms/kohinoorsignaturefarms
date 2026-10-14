import React from 'react';

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

      {/* SECTION 1: 100% Halal Guarantee & Founder Assurance (Square Cards) */}
      <section className="ksf-about-section">
        <div className="ksf-container" style={{ maxWidth: '960px' }}>
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
                <img src="/logo.jpeg" alt="Kohinoor Signature Farms" className="ksf-guarantee-square-avatar" />
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
      <section className="ksf-about-section ksf-about-section-alt">
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
