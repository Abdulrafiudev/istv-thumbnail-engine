import React from 'react';
import { BRAND } from './brand';

export default function GenerateButton({ onClick, disabled, isGenerating, error, disabledHint }) {
  return (
    <div style={{ marginTop: 'auto' }}>
      {error && (
        <div
          style={{
            color: '#ff5a5a',
            background: 'rgba(255, 90, 90, 0.08)',
            border: '1px solid rgba(255, 90, 90, 0.3)',
            borderRadius: 6,
            padding: '8px 10px',
            marginBottom: 12,
            fontFamily: BRAND.font,
            fontSize: 12,
            lineHeight: 1.4
          }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isGenerating}
        style={{
          width: '100%',
          background: disabled && !isGenerating ? '#222' : BRAND.gold,
          color: disabled && !isGenerating ? '#666' : '#080808',
          padding: '14px',
          border: 'none',
          borderRadius: BRAND.radius,
          fontFamily: BRAND.font,
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '2px',
          cursor: disabled || isGenerating ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
          opacity: isGenerating ? 0.85 : 1
        }}
      >
        {isGenerating ? 'GENERATING…' : 'GENERATE'}
      </button>

      {disabled && !isGenerating && disabledHint && (
        <p
          style={{
            textAlign: 'center',
            color: BRAND.textMuted,
            marginTop: 10,
            fontSize: 11,
            fontFamily: BRAND.font,
            letterSpacing: '1px'
          }}
        >
          {disabledHint}
        </p>
      )}
    </div>
  );
}
