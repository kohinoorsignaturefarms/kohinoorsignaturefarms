import React from 'react';
import { ShieldCheck, MapPin, Phone, Clock, MessageCircle } from 'lucide-react';

export default function Footer({ storeSettings }) {
  const whatsappNumber = (storeSettings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
  const fssaiNo = storeSettings?.masterFssai || '13624014000889';

  return (
    <footer className="ksf-footer">
      <div className="ksf-container">
        <div className="ksf-footer-grid-clean">
          {/* Brand Info & Mission */}
          <div className="ksf-footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <img
                src="/logo.jpeg"
                alt="Kohinoor Signature Farms Logo"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--gold-primary)',
                  boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--gold-light)',
                    lineHeight: '1.2'
                  }}
                >
                  Kohinoor Signature Farms
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '0.15rem' }}>
                  Grass-Fed • Organic • Halal
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.6', marginBottom: '1.25rem', maxWidth: '520px' }}>
              {storeSettings?.tagline || 'Nurturing Life, Growing Prosperity'} — Premium pasture-raised goat meat, free-range country chicken, and organic farm eggs. Pure organic feed, zero antibiotics, 100% authentic Halal certified.
            </p>

            {/* FSSAI License Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--gold-light)',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <ShieldCheck size={16} />
              <span>FSSAI License: {fssaiNo}</span>
            </div>
          </div>

          {/* Farm Contact & Operational Details */}
          <div className="ksf-footer-contact-col">
            <h4 className="ksf-footer-title">Farm Contact & Orders</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)' }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <MapPin size={18} style={{ color: 'var(--gold-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>{storeSettings?.farmAddress || 'Shankarpally - Chevella Corridor, Hyderabad, Telangana'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={17} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                <span>{storeSettings?.operatingHours || '6:00 AM - 9:00 PM (Daily Fresh Butchery)'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={17} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
                <span>{storeSettings?.phone || '+91 98765 43210'}</span>
              </div>

              <div>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: '#25D366',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    textDecoration: 'none',
                    marginTop: '0.35rem',
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <MessageCircle size={17} />
                  <span>Direct WhatsApp Helpline</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Founder Bar */}
        <div className="ksf-footer-bottom">
          <div>
            © {new Date().getFullYear()} Kohinoor Signature Farms. All rights reserved.
          </div>
          <div>
            <span>Founder: <strong style={{ color: 'var(--gold-light)' }}>{storeSettings?.founder || 'Feroz Shaik'}</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
