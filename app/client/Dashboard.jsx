import React, { useEffect, useMemo, useState } from 'react';
import AssetUpload from './AssetUpload';
import GenerateButton from './GenerateButton';
import ThumbnailGrid from './ThumbnailGrid';
import StyleSelector from './components/form/StyleSelector';
import SavePresetModal from './components/form/SavePresetModal';
import Toggle from './components/form/Toggle';
import FineTuneControls from './components/form/FineTuneControls';
import { generateThumbnails } from './api';
import { BRAND } from './brand';
import {
  DEFAULT_STYLES, CUSTOM_STYLE_ID, STORAGE_KEYS, MAX_STORED_ASSETS,
  FINE_TUNE_DEFAULTS, ASPECT_RATIOS, VARIATION_COUNTS
} from './constants';

const INITIAL_FORM = {
  styleId: CUSTOM_STYLE_ID,
  customPrompt: '',
  industry: '',
  aspectRatio: '16:9',
  variations: 3,
  fineTune: FINE_TUNE_DEFAULTS
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function safePersist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    if (Array.isArray(value) && value.length > 1) safePersist(key, value.slice(0, value.length - 1));
    else { try { localStorage.removeItem(key); } catch {} }
  }
}

function Section({ step, title, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{
          width: 22, height: 22, borderRadius: 999, flexShrink: 0,
          background: BRAND.surface, border: `1px solid ${BRAND.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: BRAND.font, fontSize: 11, fontWeight: 700, color: BRAND.textMuted
        }}>
          {step}
        </span>
        <span style={{ fontFamily: BRAND.font, fontSize: 13, fontWeight: 600, color: BRAND.text }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  color: BRAND.textMuted,
  fontFamily: BRAND.font,
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 6
};

const inputStyle = {
  width: '100%',
  background: 'transparent',
  border: `1px solid ${BRAND.border}`,
  color: BRAND.text,
  padding: '10px 12px',
  borderRadius: BRAND.radiusSm,
  fontFamily: BRAND.font,
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box'
};

export default function Dashboard() {
  const [subjectImage, setSubjectImage] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [customPresets, setCustomPresets] = useState(() => loadJSON(STORAGE_KEYS.CUSTOM_PRESETS, []));
  const [assets, setAssets] = useState(() => loadJSON(STORAGE_KEYS.ASSETS, []));
  const [viewingAsset, setViewingAsset] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { safePersist(STORAGE_KEYS.CUSTOM_PRESETS, customPresets); }, [customPresets]);
  useEffect(() => { safePersist(STORAGE_KEYS.ASSETS, assets.slice(0, MAX_STORED_ASSETS)); }, [assets]);

  const set = (key) => (val) => setFormData((prev) => ({ ...prev, [key]: val }));
  const setInput = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  const setFineTune = (key, val) =>
    setFormData((prev) => ({ ...prev, fineTune: { ...prev.fineTune, [key]: val } }));

  const formComplete = useMemo(() => {
    if (!subjectImage?.dataUrl) return false;
    if (!formData.industry?.trim()) return false;
    if (formData.styleId === CUSTOM_STYLE_ID && !formData.customPrompt?.trim()) return false;
    return true;
  }, [subjectImage, formData.industry, formData.styleId, formData.customPrompt]);

  const disabledHint = !subjectImage?.dataUrl
    ? 'Upload a subject photo to continue'
    : !formData.industry?.trim()
      ? 'Enter an industry to continue'
      : formData.styleId === CUSTOM_STYLE_ID && !formData.customPrompt?.trim()
        ? 'Write a custom prompt or choose a style preset'
        : null;

  const handleSaveCustomPreset = ({ name, promptTemplate }) => {
    const preset = { id: `custom-${Date.now()}`, name, description: 'User-saved preset.', promptTemplate };
    setCustomPresets((prev) => [...prev, preset]);
    setFormData((prev) => ({ ...prev, styleId: preset.id }));
  };

  const handleGenerate = async () => {
    if (!formComplete || isGenerating) return;
    setError(null);
    setIsGenerating(true);
    try {
      const allStyles = [...DEFAULT_STYLES, ...customPresets];
      const styleEntry = allStyles.find((s) => s.id === formData.styleId);
      const payload = {
        subjectImages: [{ dataUrl: subjectImage.dataUrl, mimeType: subjectImage.mimeType }],
        styleId: styleEntry ? formData.styleId : 'custom',
        customPrompt: formData.styleId === 'custom' ? formData.customPrompt : styleEntry?.promptTemplate || '',
        industry: formData.industry.trim(),
        aspectRatio: formData.aspectRatio,
        variations: formData.variations,
        fineTune: formData.fineTune
      };
      const data = await generateThumbnails(payload);
      const newAssets = (data.variations || []).filter((v) => !v.error);
      const failedCount = (data.variations || []).length - newAssets.length;
      if (newAssets.length === 0) throw new Error(data.variations?.[0]?.message || 'All variations failed.');
      setAssets((prev) => [...newAssets, ...prev]);
      if (failedCount > 0) setError(`${failedCount} variation${failedCount > 1 ? 's' : ''} failed — others rendered below.`);
    } catch (err) {
      setError(err?.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id) => setAssets((prev) => prev.filter((a) => a.id !== id));
  const handleClearAll = () => setAssets([]);
  const handleAddAsset = (asset) => setAssets((prev) => [asset, ...prev].slice(0, MAX_STORED_ASSETS));

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div style={{ padding: '20px 20px 0', borderBottom: `1px solid ${BRAND.border}`, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: BRAND.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="#09090B"/>
                <rect x="8" y="1" width="5" height="5" rx="1" fill="#09090B"/>
                <rect x="1" y="8" width="5" height="5" rx="1" fill="#09090B"/>
                <rect x="8" y="8" width="5" height="5" rx="1" fill="#09090B" opacity="0.4"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: BRAND.font, fontSize: 13, fontWeight: 700, color: BRAND.text, margin: 0, lineHeight: 1.2 }}>Inside Success TV</p>
              <p style={{ fontFamily: BRAND.font, fontSize: 11, color: BRAND.textMuted, margin: 0, lineHeight: 1.2 }}>Thumbnail Engine</p>
            </div>
          </div>
        </div>

        {/* All 5 sections — equal gap via flex column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '24px 20px', flex: 1 }}>

          {/* 1 — Subject Photo */}
          <Section step="1" title="Subject Photo">
            <AssetUpload subjectImage={subjectImage} onUpload={setSubjectImage} onClear={() => setSubjectImage(null)} />
          </Section>

          {/* 2 — Style */}
          <Section step="2" title="Style">
            <StyleSelector styleId={formData.styleId} onChange={set('styleId')} customPresets={customPresets} />
            {formData.styleId === CUSTOM_STYLE_ID && (
              <div style={{ marginTop: 8 }}>
                <textarea
                  value={formData.customPrompt}
                  onChange={setInput('customPrompt')}
                  placeholder="Describe the scene, mood, lighting and environment. Use {{INDUSTRY}} as a placeholder."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
                <SavePresetModal
                  canSave={!!formData.customPrompt?.trim()}
                  onSave={(name) => handleSaveCustomPreset({ name, promptTemplate: formData.customPrompt })}
                />
              </div>
            )}
          </Section>

          {/* 3 — Industry */}
          <Section step="3" title="Industry">
            <input
              type="text"
              value={formData.industry}
              onChange={setInput('industry')}
              placeholder="e.g. Luxury Real Estate"
              style={inputStyle}
            />
          </Section>

          {/* 4 — Output Settings */}
          <Section step="4" title="Output Settings">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Aspect Ratio</label>
                <Toggle options={ASPECT_RATIOS} value={formData.aspectRatio} onChange={set('aspectRatio')} />
              </div>
              <div>
                <label style={labelStyle}>Variations</label>
                <Toggle options={VARIATION_COUNTS} value={formData.variations} onChange={set('variations')} />
              </div>
            </div>
          </Section>

          {/* 5 — Fine-tune */}
          <Section step="5" title="Fine-tune">
            <FineTuneControls fineTune={formData.fineTune} onChange={setFineTune} styleId={formData.styleId} />
          </Section>

        </div>

        {/* Generate — sticky at bottom */}
        <div style={{ padding: '0 20px 20px' }}>
          <GenerateButton
            onClick={handleGenerate}
            disabled={!formComplete}
            isGenerating={isGenerating}
            error={error}
            disabledHint={disabledHint}
          />
        </div>
      </aside>

      <main className="app-main">
        <ThumbnailGrid
          assets={assets}
          isGenerating={isGenerating}
          pendingCount={formData.variations}
          pendingAspectRatio={formData.aspectRatio}
          viewingAsset={viewingAsset}
          onView={setViewingAsset}
          onCloseViewer={() => setViewingAsset(null)}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
          onAddAsset={handleAddAsset}
        />
      </main>
    </div>
  );
}
