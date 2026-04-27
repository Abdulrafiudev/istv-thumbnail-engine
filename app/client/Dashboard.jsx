import React, { useEffect, useMemo, useState } from 'react';
import AssetUpload from './AssetUpload';
import InputForm from './InputForm';
import GenerateButton from './GenerateButton';
import ThumbnailGrid from './ThumbnailGrid';
import { generateThumbnails } from './api';
import { BRAND } from './brand';
import {
  DEFAULT_STYLES,
  CUSTOM_STYLE_ID,
  STORAGE_KEYS,
  MAX_STORED_ASSETS
} from './constants';

const INITIAL_FORM = {
  styleId: CUSTOM_STYLE_ID,
  customPrompt: '',
  industry: '',
  aspectRatio: '16:9',
  variations: 3
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safePersist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (Array.isArray(value) && value.length > 1) {
      safePersist(key, value.slice(0, value.length - 1));
    } else {
      try { localStorage.removeItem(key); } catch {}
    }
  }
}

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
    const preset = {
      id: `custom-${Date.now()}`,
      name,
      description: 'User-saved style preset.',
      promptTemplate
    };
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
        subjectImage: {
          dataUrl: subjectImage.dataUrl,
          mimeType: subjectImage.mimeType
        },
        styleId: styleEntry ? formData.styleId : 'custom',
        customPrompt:
          formData.styleId === 'custom'
            ? formData.customPrompt
            : styleEntry?.promptTemplate || '',
        industry: formData.industry.trim(),
        aspectRatio: formData.aspectRatio,
        variations: formData.variations
      };

      const data = await generateThumbnails(payload);
      const newAssets = (data.variations || []).filter((v) => !v.error);
      const failedCount = (data.variations || []).length - newAssets.length;
      if (newAssets.length === 0) {
        const firstErr = data.variations?.[0];
        throw new Error(firstErr?.message || 'All variations failed.');
      }
      setAssets((prev) => [...newAssets, ...prev]);
      if (failedCount > 0) {
        setError(`${failedCount} variation${failedCount > 1 ? 's' : ''} failed — others rendered below.`);
      }
    } catch (err) {
      setError(err?.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: BRAND.pageBg,
        color: BRAND.text,
        fontFamily: BRAND.font
      }}
    >
      <aside
        style={{
          width: 380,
          minWidth: 380,
          background: BRAND.panelBg,
          borderRight: `1px solid ${BRAND.border}`,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100vh',
          overflowY: 'auto',
          position: 'sticky',
          top: 0
        }}
      >
        <h1
          style={{
            margin: '0 0 1.5rem 0',
            fontSize: 18,
            letterSpacing: '2px',
            color: BRAND.gold,
            fontWeight: 800,
            fontStyle: 'italic'
          }}
        >
          INSIDE SUCCESS{' '}
          <span
            style={{
              background: BRAND.gold,
              color: '#080808',
              padding: '2px 6px',
              borderRadius: 3,
              fontSize: 10,
              fontWeight: 800,
              marginLeft: 4,
              verticalAlign: 'middle'
            }}
          >
            TV
          </span>
        </h1>

        <SectionTitle title="1. Upload Subject" />
        <AssetUpload
          subjectImage={subjectImage}
          onUpload={setSubjectImage}
          onClear={() => setSubjectImage(null)}
        />

        <SectionTitle title="2. Style, Industry & Output" />
        <InputForm
          formData={formData}
          setFormData={setFormData}
          customPresets={customPresets}
          onSaveCustomPreset={handleSaveCustomPreset}
        />

        <GenerateButton
          onClick={handleGenerate}
          disabled={!formComplete}
          isGenerating={isGenerating}
          error={error}
          disabledHint={disabledHint}
        />
      </aside>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <ThumbnailGrid
          assets={assets}
          isGenerating={isGenerating}
          pendingCount={formData.variations}
          pendingAspectRatio={formData.aspectRatio}
          viewingAsset={viewingAsset}
          onView={setViewingAsset}
          onCloseViewer={() => setViewingAsset(null)}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ width: 4, height: 12, background: BRAND.gold, borderRadius: 2 }} />
      <h3
        style={{
          margin: 0,
          color: BRAND.textMuted,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}
      >
        {title}
      </h3>
    </div>
  );
}
