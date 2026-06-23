import React, { useCallback, useState } from 'react';
import { BRAND } from './brand';
import { resizeImage, ACCEPTED_TYPES } from './utils/imageUtils';

export default function AssetUpload({ subjectImage, onUpload, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, or WEBP files are accepted.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const resized = await resizeImage(file);
      onUpload(resized);
    } catch (err) {
      setError(err?.message || 'Could not process image.');
    } finally {
      setIsProcessing(false);
    }
  }, [onUpload]);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const onFileInput = (e) => {
    const file = e.target?.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <label
        htmlFor="subject-upload"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{
          display: 'flex',
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 160,
          border: `1.5px dashed ${isDragging ? BRAND.gold : subjectImage ? BRAND.goldBorder : BRAND.border}`,
          borderRadius: BRAND.radius,
          background: subjectImage ? BRAND.goldDim : BRAND.surface,
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'border-color 0.2s, background 0.2s',
          gap: 10
        }}
      >
        {subjectImage ? (
          <>
            <img
              src={subjectImage.dataUrl}
              alt="Subject"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
            />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: BRAND.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L8 11M8 1L5 4M8 1L11 4" stroke="#09090B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 13H14" stroke="#09090B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ color: BRAND.gold, fontFamily: BRAND.font, fontSize: 13, fontWeight: 600 }}>
                {isProcessing ? 'Processing...' : 'Photo loaded'}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onClear(); }}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(9,9,11,0.7)',
                color: BRAND.textMuted,
                border: `1px solid ${BRAND.border}`,
                borderRadius: BRAND.radiusSm,
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: BRAND.font,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: BRAND.panelBg, border: `1px solid ${BRAND.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2V12M9 2L6 5M9 2L12 5" stroke={BRAND.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 14.5H16" stroke={BRAND.textMuted} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: BRAND.text, fontFamily: BRAND.font, fontSize: 13, fontWeight: 500, margin: 0 }}>
                {isProcessing ? 'Processing...' : 'Drop photo here or click to browse'}
              </p>
              <p style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, margin: '4px 0 0 0' }}>
                JPG, PNG or WEBP
              </p>
            </div>
          </>
        )}
        <input id="subject-upload" type="file" accept={ACCEPTED_TYPES.join(',')} onChange={onFileInput} style={{ display: 'none' }} />
      </label>
      {error && (
        <p style={{ color: BRAND.error, fontFamily: BRAND.font, fontSize: 12, marginTop: 6 }}>{error}</p>
      )}
    </div>
  );
}
