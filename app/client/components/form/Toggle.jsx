import React from 'react';
import { BRAND } from '../../brand';

export default function Toggle({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: BRAND.surface,
      border: `1px solid ${BRAND.border}`,
      borderRadius: BRAND.radiusSm,
      padding: 3,
      gap: 3
    }}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              background: selected ? BRAND.panelBg : 'transparent',
              color: selected ? BRAND.text : BRAND.textMuted,
              border: selected ? `1px solid ${BRAND.border}` : '1px solid transparent',
              padding: '7px 0',
              borderRadius: 4,
              fontFamily: BRAND.font,
              fontWeight: selected ? 600 : 500,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.12s',
              boxShadow: selected ? '0 1px 3px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
