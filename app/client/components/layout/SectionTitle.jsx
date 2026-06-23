import React from 'react';
import { BRAND } from '../../brand';

export default function SectionTitle({ title, step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      {step && (
        <span style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          background: BRAND.surface,
          border: `1px solid ${BRAND.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: BRAND.textMuted,
          fontFamily: BRAND.font,
          flexShrink: 0
        }}>
          {step}
        </span>
      )}
      <span style={{
        color: BRAND.text,
        fontFamily: BRAND.font,
        fontSize: 13,
        fontWeight: 600,
      }}>
        {title}
      </span>
    </div>
  );
}
