import React from 'react';
import { BRAND } from './brand';
import { CUSTOM_STYLE_ID, ASPECT_RATIOS, VARIATION_COUNTS } from './constants';
import Toggle from './components/form/Toggle';
import StyleSelector from './components/form/StyleSelector';
import SavePresetModal from './components/form/SavePresetModal';
import FineTuneControls from './components/form/FineTuneControls';

const inputStyle = {
  width: '100%',
  background: 'transparent',
  border: `1px solid`,
  color: '#FAFAFA',
  padding: '10px 12px',
  borderRadius: '6px',
  fontFamily: "'Urbanist', -apple-system, sans-serif",
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
};

export default function InputForm({ formData, setFormData, customPresets, onSaveCustomPreset }) {
  const handleChange = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  const handleToggle = (key) => (value) => setFormData((prev) => ({ ...prev, [key]: value }));
  const handleStyleChange = (styleId) => setFormData((prev) => ({ ...prev, styleId }));
  const handleFineTune = (key, value) =>
    setFormData((prev) => ({ ...prev, fineTune: { ...prev.fineTune, [key]: value } }));
  const handleSavePreset = (name) => onSaveCustomPreset({ name, promptTemplate: formData.customPrompt });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <StyleSelector styleId={formData.styleId} onChange={handleStyleChange} customPresets={customPresets} />

      {formData.styleId === CUSTOM_STYLE_ID && (
        <div>
          <textarea
            value={formData.customPrompt}
            onChange={handleChange('customPrompt')}
            placeholder="Describe the scene, mood, lighting and environment. Use {{INDUSTRY}} as a placeholder for the industry."
            rows={4}
            style={{
              ...inputStyle,
              borderColor: BRAND.border,
              resize: 'vertical',
              lineHeight: 1.6,
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          <SavePresetModal canSave={!!formData.customPrompt?.trim()} onSave={handleSavePreset} />
        </div>
      )}

      <div>
        <label style={{ display: 'block', color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
          Industry
        </label>
        <input
          type="text"
          value={formData.industry}
          onChange={handleChange('industry')}
          placeholder="e.g. Luxury Real Estate"
          style={{ ...inputStyle, borderColor: BRAND.border, boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
            Aspect Ratio
          </label>
          <Toggle options={ASPECT_RATIOS} value={formData.aspectRatio} onChange={handleToggle('aspectRatio')} />
        </div>
        <div>
          <label style={{ display: 'block', color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
            Variations
          </label>
          <Toggle options={VARIATION_COUNTS} value={formData.variations} onChange={handleToggle('variations')} />
        </div>
      </div>

      <FineTuneControls fineTune={formData.fineTune} onChange={handleFineTune} />
    </div>
  );
}
