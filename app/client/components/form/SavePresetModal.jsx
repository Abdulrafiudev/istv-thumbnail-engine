import React, { useState } from 'react';
import { BRAND } from '../../brand';

export default function SavePresetModal({ canSave, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setName('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={!canSave}
        style={{
          marginTop: 8,
          background: 'transparent',
          color: canSave ? BRAND.gold : BRAND.textSubtle,
          border: 'none',
          padding: 0,
          fontFamily: BRAND.font,
          fontSize: 12,
          fontWeight: 600,
          cursor: canSave ? 'pointer' : 'not-allowed',
        }}
      >
        + Save as preset
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
        placeholder="Preset name"
        style={{
          flex: 1,
          background: BRAND.surface,
          border: `1px solid ${BRAND.border}`,
          color: BRAND.text,
          padding: '8px 10px',
          borderRadius: BRAND.radiusSm,
          fontFamily: BRAND.font,
          fontSize: 13,
          outline: 'none'
        }}
      />
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!name.trim()}
        style={{
          background: BRAND.gold,
          color: '#09090B',
          border: 'none',
          padding: '0 14px',
          borderRadius: BRAND.radiusSm,
          fontFamily: BRAND.font,
          fontWeight: 700,
          fontSize: 13,
          cursor: name.trim() ? 'pointer' : 'not-allowed',
          opacity: name.trim() ? 1 : 0.5
        }}
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => { setIsOpen(false); setName(''); }}
        style={{
          background: 'transparent',
          color: BRAND.textMuted,
          border: `1px solid ${BRAND.border}`,
          padding: '0 10px',
          borderRadius: BRAND.radiusSm,
          fontFamily: BRAND.font,
          fontSize: 13,
          cursor: 'pointer'
        }}
      >
        ✕
      </button>
    </div>
  );
}
