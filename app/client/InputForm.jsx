import React, { useState } from 'react';
import { BRAND } from './brand';
import { DEFAULT_STYLES, CUSTOM_STYLE_ID, ASPECT_RATIOS, VARIATION_COUNTS } from './constants';

const labelStyle = {
  display: 'block',
  color: BRAND.textMuted,
  marginBottom: 8,
  fontFamily: BRAND.font,
  fontSize: 11,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  fontWeight: 700
};

const sectionStyle = { marginBottom: '1.5rem' };

const inputStyle = {
  width: '100%',
  background: BRAND.panelBg,
  border: `1px solid ${BRAND.border}`,
  color: BRAND.text,
  padding: '12px',
  borderRadius: BRAND.radius,
  fontFamily: BRAND.font,
  fontSize: 14,
  boxSizing: 'border-box',
  outline: 'none'
};

function Toggle({ options, value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        background: BRAND.panelBg,
        border: `1px solid ${BRAND.border}`,
        borderRadius: BRAND.radius,
        padding: 4,
        gap: 4
      }}
    >
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              background: selected ? BRAND.gold : 'transparent',
              color: selected ? '#080808' : BRAND.textMuted,
              border: 'none',
              padding: '8px 0',
              borderRadius: 4,
              fontFamily: BRAND.font,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s'
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function InputForm({
  formData,
  setFormData,
  customPresets,
  onSaveCustomPreset
}) {
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleChange = (key) => (e) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleToggle = (key) => (value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const allStyles = [
    ...DEFAULT_STYLES,
    ...customPresets,
    { id: CUSTOM_STYLE_ID, name: 'Custom Prompt', description: 'Write your own instructions.' }
  ];
  const selectedStyle = allStyles.find((s) => s.id === formData.styleId);

  const confirmSavePreset = () => {
    const name = presetName.trim();
    if (!name || !formData.customPrompt?.trim()) return;
    onSaveCustomPreset({ name, promptTemplate: formData.customPrompt });
    setPresetName('');
    setSavingPreset(false);
  };

  return (
    <div>
      <section style={sectionStyle}>
        <label style={labelStyle}>Select Style</label>
        <select
          value={formData.styleId}
          onChange={handleChange('styleId')}
          style={inputStyle}
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
          <p
            style={{
              color: BRAND.textMuted,
              fontFamily: BRAND.font,
              fontSize: 11,
              fontStyle: 'italic',
              margin: '8px 0 0 0',
              lineHeight: 1.4
            }}
          >
            {selectedStyle.description}
          </p>
        )}

        {formData.styleId === CUSTOM_STYLE_ID && (
          <div style={{ marginTop: 12 }}>
            <textarea
              value={formData.customPrompt}
              onChange={handleChange('customPrompt')}
              placeholder="e.g. A moody film-noir portrait of a {{INDUSTRY}} professional in a rain-soaked neon alley, gritty Blade Runner atmosphere..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: BRAND.font }}
            />
            {!savingPreset ? (
              <button
                type="button"
                onClick={() => setSavingPreset(true)}
                disabled={!formData.customPrompt?.trim()}
                style={{
                  marginTop: 8,
                  background: 'transparent',
                  color: BRAND.gold,
                  border: 'none',
                  padding: 0,
                  fontFamily: BRAND.font,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '2px',
                  cursor: formData.customPrompt?.trim() ? 'pointer' : 'not-allowed',
                  opacity: formData.customPrompt?.trim() ? 1 : 0.4
                }}
              >
                + SAVE AS STYLE
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  autoFocus
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Style name"
                  style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                />
                <button
                  type="button"
                  onClick={confirmSavePreset}
                  disabled={!presetName.trim()}
                  style={{
                    background: BRAND.gold,
                    color: '#080808',
                    border: 'none',
                    padding: '0 14px',
                    borderRadius: 4,
                    fontFamily: BRAND.font,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '1px',
                    cursor: presetName.trim() ? 'pointer' : 'not-allowed',
                    opacity: presetName.trim() ? 1 : 0.4
                  }}
                >
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => { setSavingPreset(false); setPresetName(''); }}
                  style={{
                    background: 'transparent',
                    color: BRAND.textMuted,
                    border: `1px solid ${BRAND.border}`,
                    padding: '0 10px',
                    borderRadius: 4,
                    fontFamily: BRAND.font,
                    fontSize: 11,
                    letterSpacing: '1px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <label style={labelStyle}>Industry</label>
        <input
          type="text"
          value={formData.industry}
          onChange={handleChange('industry')}
          placeholder="e.g. Luxury Real Estate"
          style={inputStyle}
        />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <section>
          <label style={labelStyle}>Ratio</label>
          <Toggle
            options={ASPECT_RATIOS}
            value={formData.aspectRatio}
            onChange={handleToggle('aspectRatio')}
          />
        </section>
        <section>
          <label style={labelStyle}>Count</label>
          <Toggle
            options={VARIATION_COUNTS}
            value={formData.variations}
            onChange={handleToggle('variations')}
          />
        </section>
      </div>
    </div>
  );
}
