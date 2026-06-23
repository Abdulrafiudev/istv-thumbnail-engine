import React from 'react';
import { BRAND } from '../../brand';
import { DEFAULT_STYLES, CUSTOM_STYLE_ID } from '../../constants';

export default function StyleSelector({ styleId, onChange, customPresets }) {
  const allStyles = [
    { id: CUSTOM_STYLE_ID, name: 'Custom Prompt', description: 'Write your own instructions.' },
    ...DEFAULT_STYLES,
    ...customPresets
  ];
  const selectedStyle = allStyles.find((s) => s.id === styleId);

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
        Style
      </label>
      <select
        value={styleId}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          background: BRAND.surface,
          border: `1px solid ${BRAND.border}`,
          color: BRAND.text,
          padding: '10px 12px',
          borderRadius: BRAND.radiusSm,
          fontFamily: BRAND.font,
          fontSize: 14,
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%2371717A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: 36
        }}
      >
        <option value={CUSTOM_STYLE_ID}>Custom Prompt</option>
        {DEFAULT_STYLES.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
        {customPresets.length > 0 && (
          <optgroup label="My Saved Styles">
            {customPresets.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </optgroup>
        )}
      </select>
      {selectedStyle?.description && (
        <p style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, margin: '6px 0 0 0', lineHeight: 1.5 }}>
          {selectedStyle.description}
        </p>
      )}
    </div>
  );
}
