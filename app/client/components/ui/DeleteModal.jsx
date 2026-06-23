import React from 'react';
import { BRAND } from '../../brand';

export default function DeleteModal({ onConfirm, onCancel, title, description, confirmLabel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: BRAND.panelBg,
          border: `1px solid ${BRAND.border}`,
          borderRadius: BRAND.radiusLg,
          padding: '28px 28px 24px',
          width: '100%',
          maxWidth: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontFamily: BRAND.font, fontSize: 15, fontWeight: 700, color: BRAND.text, margin: 0 }}>
            {title || 'Delete thumbnail'}
          </p>
          <p style={{ fontFamily: BRAND.font, fontSize: 13, color: BRAND.textMuted, margin: 0, lineHeight: 1.5 }}>
            {description || 'This thumbnail will be permanently removed from your library. This action cannot be undone.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'transparent',
              color: BRAND.text,
              border: `1px solid ${BRAND.border}`,
              padding: '10px',
              borderRadius: BRAND.radiusSm,
              fontFamily: BRAND.font,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              background: BRAND.error,
              color: '#fff',
              border: 'none',
              padding: '10px',
              borderRadius: BRAND.radiusSm,
              fontFamily: BRAND.font,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            {confirmLabel || 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
