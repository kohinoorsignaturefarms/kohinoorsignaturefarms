import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AnnouncementBar({ text }) {
  return (
    <div className="ksf-announcement">
      <Sparkles size={13} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
      <span>{text || '🌿 100% Pure Organic & Grass-Fed • Halal Certified • Fresh Morning Cuts Direct from Farm'}</span>
      <Sparkles size={13} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
    </div>
  );
}
