import React from 'react';
import {
  Leaf,
  Award,
  Building2,
  Users,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function WhyChooseUs({ founder, tagline }) {
  const pillars = [
    {
      icon: <Leaf size={26} />,
      title: 'NATURAL FEED',
      subtitle: 'BETTER HEALTH',
      description:
        'Our livestock feeds exclusively on organic green pasture, wild alfalfa, and pesticide-free grains. Zero artificial hormones, growth stimulants, or antibiotics.'
    },
    {
      icon: <Award size={26} />,
      title: 'PREMIUM BREEDING',
      subtitle: 'QUALITY LIVESTOCK',
      description:
        'Selected pure native breeds raised in open-air, stress-free environments. This delivers authentic marbling, exceptional tenderness, and true culinary flavor.'
    },
    {
      icon: <Building2 size={26} />,
      title: 'MODERN FARMING',
      subtitle: 'SUSTAINABLE FUTURE',
      description:
        'Eco-conscious farming integrating solar power, clean RO water systems, organic manure recycling, and sustainable agro-pastoral practices.'
    },
    {
      icon: <Users size={26} />,
      title: 'TRUSTED CARE',
      subtitle: 'BETTER YIELD',
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
    <section className="ksf-why-section" id="about-standard-section">
      <div className="ksf-container">
        {/* Main Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.25rem' }}>
          <span className="ksf-standard-eyebrow">
            The Kohinoor Standard
          </span>
          <h2 className="ksf-standard-main-title">
            Nurturing Life, Growing Prosperity
          </h2>
          <p className="ksf-standard-lead-text">
            We believe that clean, uncompromised nutrition starts from honest farming. Every cut is prepared fresh upon order from healthy, happy livestock.
          </p>
        </div>

        {/* SECTION 1: The 4 Core Agricultural & Ethical Pillar Boxes */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="ksf-box-section-subhead">
            <Sparkles size={16} style={{ color: 'var(--gold-primary)' }} />
            <span>Core Agricultural & Ethical Pillars</span>
          </div>

          <div className="ksf-why-grid">
            {pillars.map((item, idx) => (
              <div key={idx} className="ksf-why-card">
                <div className="ksf-why-icon-wrap">{item.icon}</div>
                <h3 className="ksf-why-card-title">{item.title}</h3>
                <div className="ksf-why-card-subtitle">{item.subtitle}</div>
                <p className="ksf-why-card-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Our Strict Quality Standards in Boxes */}
        <div style={{ marginBottom: '2.25rem' }}>
          <div className="ksf-box-section-subhead">
            <ShieldCheck size={17} style={{ color: 'var(--green-primary)' }} />
            <span>Our Quality & Hygiene Standards</span>
          </div>

          <div className="ksf-standards-box-grid">
            {standards.map((std, idx) => (
              <div key={idx} className="ksf-standard-box-tile">
                <div className="ksf-std-tile-icon">{std.icon}</div>
                <div className="ksf-std-tile-content">
                  <div className="ksf-std-tile-title">{std.title}</div>
                  <div className="ksf-std-tile-desc">{std.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Founder Commitment & Halal Assurance Banner */}
        <div className="ksf-founder-box-banner">
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <ShieldCheck size={22} style={{ color: 'var(--gold-primary)' }} />
              <span style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--gold-light)' }}>
                100% Halal & Pure Farm Direct Guarantee
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.5' }}>
              Every order is prepared with strict adherence to authentic Halal principles, veterinary inspection, and temperature-controlled sanitization. From our farm directly to your dining table.
            </p>
          </div>

          <div className="ksf-founder-attribution-block">
            <div style={{ fontSize: '0.72rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Founded & Managed By
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#FFFFFF',
                fontStyle: 'italic',
                margin: '0.15rem 0'
              }}
            >
              {founder || 'Feroz Shaik'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)' }}>
              Kohinoor Signature Farms
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
