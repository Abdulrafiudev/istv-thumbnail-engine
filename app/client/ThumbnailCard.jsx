import React from 'react';
import { saveAs } from 'file-saver';
import { BRAND } from './brand';

function aspectClass(ratio) {
  if (ratio === '16:9') return '16 / 9';
  if (ratio === '9:16') return '9 / 16';
  return '3 / 4';
}

function shortModelLabel(modelId) {
  if (!modelId) return 'Gemini';
  if (modelId.includes('3-pro')) return 'Gemini 3 Pro';
  if (modelId.includes('3.1-flash')) return 'Gemini 3.1 Flash';
  if (modelId.includes('flash')) return 'Gemini Flash';
  return modelId;
}

export default function ThumbnailCard({ asset, onView, onDelete }) {
  const isError = !!asset.error;
  const isModelFallback = asset.isFallbackModel === true;

  if (isError) {
    return (
      <div
        style={{
          aspectRatio: aspectClass(asset.aspectRatio || '16:9'),
          background: BRAND.panelBg,
          border: '1px solid rgba(255, 90, 90, 0.4)',
          borderRadius: BRAND.radius,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          textAlign: 'center',
          color: '#ff8080',
          fontFamily: BRAND.font,
          fontSize: 12,
          lineHeight: 1.4
        }}
      >
        <p style={{ fontWeight: 700, letterSpacing: '1px', margin: '0 0 6px 0' }}>
          GENERATION FAILED
        </p>
        <p style={{ margin: 0, color: BRAND.textMuted }}>{asset.message || 'Unknown error'}</p>
      </div>
    );
  }

  const handleDownload = (e) => {
    e.stopPropagation();
    saveAs(asset.imageDataUrl, `inside-success-${asset.id}.png`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Delete this asset?')) onDelete(asset.id);
  };

  return (
    <div
      onClick={() => onView(asset)}
      className="thumb-card"
      style={{
        position: 'relative',
        background: '#0a0a0a',
        border: `1px solid ${isModelFallback ? '#C9A84C' : BRAND.border}`,
        borderRadius: BRAND.radius,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s'
      }}
    >
      <div style={{ aspectRatio: aspectClass(asset.aspectRatio), position: 'relative' }}>
        <img
          src={asset.imageDataUrl}
          alt={asset.styleName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          className="thumb-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            opacity: 0,
            transition: 'opacity 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14
          }}
        >
          <button
            type="button"
            onClick={handleDownload}
            style={{
              background: '#fff',
              color: '#080808',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 999,
              fontFamily: BRAND.font,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '2px',
              cursor: 'pointer'
            }}
          >
            DOWNLOAD
          </button>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              background: '#ff5a5a',
              color: '#fff',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 999,
              fontFamily: BRAND.font,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '2px',
              cursor: 'pointer'
            }}
          >
            DELETE
          </button>
        </div>
      </div>

      {isModelFallback && (
        <div
          style={{
            background: 'rgba(201, 168, 76, 0.18)',
            color: BRAND.gold,
            padding: '8px 12px',
            fontFamily: BRAND.font,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            borderTop: `1px solid ${BRAND.gold}`
          }}
        >
          ⚠ Fallback model — {shortModelLabel(asset.modelUsed)} used (Gemini 3 Pro unavailable)
        </div>
      )}

      <div
        style={{
          padding: '10px 12px',
          borderTop: `1px solid ${BRAND.border}`,
          background: '#080808'
        }}
      >
        <p
          style={{
            margin: 0,
            color: BRAND.gold,
            fontFamily: BRAND.font,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}
        >
          {asset.industry}
        </p>
        <p
          style={{
            margin: '2px 0 0 0',
            color: BRAND.textMuted,
            fontFamily: BRAND.font,
            fontSize: 10,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          {asset.aspectRatio} • {asset.styleName}
        </p>
      </div>

      <style>{`
        .thumb-card:hover { border-color: ${BRAND.gold} !important; }
        .thumb-card:hover .thumb-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
