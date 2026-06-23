import React from 'react';
import { BRAND } from './brand';

export default function GenerateButton({ onClick, disabled, isGenerating, error, disabledHint }) {
  return (
    <div style={{ marginTop: 'auto', paddingTop: 8 }}>
      {error && (
        <div style={{
          color: BRAND.error,
          background: BRAND.errorDim,
          border: `1px solid ${BRAND.errorBorder}`,
          borderRadius: BRAND.radiusSm,
          padding: '10px 12px',
          marginBottom: 12,
          fontFamily: BRAND.font,
          fontSize: 13,
          lineHeight: 1.5
        }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isGenerating}
        style={{
          width: '100%',
          background: disabled && !isGenerating ? BRAND.surface : BRAND.gold,
          color: disabled && !isGenerating ? BRAND.textSubtle : '#09090B',
          padding: '13px',
          border: `1px solid ${disabled && !isGenerating ? BRAND.border : BRAND.gold}`,
          borderRadius: BRAND.radius,
          fontFamily: BRAND.font,
          fontWeight: 700,
          fontSize: 14,
          cursor: disabled || isGenerating ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          opacity: isGenerating ? 0.8 : 1,
          letterSpacing: 0
        }}
      >
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>

      {disabled && !isGenerating && disabledHint && (
        <p style={{
          textAlign: 'center',
          color: BRAND.textMuted,
          marginTop: 8,
          fontSize: 12,
          fontFamily: BRAND.font,
        }}>
          {disabledHint}
        </p>
      )}
    </div>
  );
}
