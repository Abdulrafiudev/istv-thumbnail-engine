import React from 'react';
import { saveAs } from 'file-saver';
import ThumbnailCard from './ThumbnailCard';
import { BRAND } from './brand';

function aspectClass(ratio) {
  if (ratio === '16:9') return '16 / 9';
  if (ratio === '9:16') return '9 / 16';
  return '3 / 4';
}

function PlaceholderCard({ aspectRatio }) {
  return (
    <div
      style={{
        aspectRatio: aspectClass(aspectRatio),
        background: BRAND.panelBg,
        border: `1px dashed ${BRAND.border}`,
        borderRadius: BRAND.radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 2s ease-in-out infinite'
      }}
    >
      <span
        style={{
          color: BRAND.gold,
          fontFamily: BRAND.font,
          fontSize: 11,
          letterSpacing: '2px',
          fontWeight: 700,
          opacity: 0.6
        }}
      >
        PROCESSING…
      </span>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
      `}</style>
    </div>
  );
}

function shortModelLabel(modelId) {
  if (!modelId) return 'Gemini';
  if (modelId.includes('3-pro')) return 'Gemini 3 Pro Image';
  if (modelId.includes('3.1-flash')) return 'Gemini 3.1 Flash Image';
  if (modelId.includes('flash')) return 'Gemini Flash Image';
  return modelId;
}

function FullScreenViewer({ asset, onClose, onDelete }) {
  if (!asset) return null;
  const handleDownload = () => saveAs(asset.imageDataUrl, `inside-success-${asset.id}.png`);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 1100,
          width: '100%',
          background: '#0a0a0a',
          border: `1px solid ${BRAND.border}`,
          borderRadius: 14,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
          overflow: 'hidden'
        }}
      >
        <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img
            src={asset.imageDataUrl}
            alt={asset.styleName}
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        </div>
        <div style={{ padding: '1.5rem', borderLeft: `1px solid ${BRAND.border}`, fontFamily: BRAND.font }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              float: 'right',
              background: 'transparent',
              color: BRAND.text,
              border: 'none',
              fontSize: 20,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
          <h2 style={{ margin: '0 0 4px 0', color: BRAND.text, fontSize: 18, fontWeight: 700 }}>{asset.industry}</h2>
          <p style={{ margin: '0 0 16px 0', color: BRAND.textMuted, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {asset.aspectRatio} • {asset.styleName}
          </p>

          {asset.isFallbackModel === true && (
            <div
              style={{
                background: 'rgba(201, 168, 76, 0.15)',
                border: `1px solid ${BRAND.gold}`,
                color: BRAND.gold,
                padding: '8px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '1px',
                marginBottom: 16
              }}
            >
              ⚠ Fallback model used — {shortModelLabel(asset.modelUsed)} ran instead of Gemini 3 Pro.
              Scene quality may be slightly lower; regenerate to retry the primary model.
            </div>
          )}

          <p style={{ color: BRAND.textMuted, fontSize: 11, letterSpacing: '1px', margin: '0 0 6px 0', fontWeight: 700 }}>
            PROMPT
          </p>
          <p style={{ color: BRAND.textMuted, fontSize: 12, fontStyle: 'italic', lineHeight: 1.5, margin: '0 0 16px 0' }}>
            "{asset.promptUsed}"
          </p>

          {asset.modelUsed && (
            <p style={{ color: BRAND.textMuted, fontSize: 10, letterSpacing: '1px', margin: '0 0 18px 0' }}>
              Model: {shortModelLabel(asset.modelUsed)}
            </p>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                flex: 1,
                background: BRAND.gold,
                color: '#080808',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                fontFamily: BRAND.font,
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer'
              }}
            >
              DOWNLOAD
            </button>
            <button
              type="button"
              onClick={() => { onDelete(asset.id); onClose(); }}
              style={{
                background: 'transparent',
                color: '#ff5a5a',
                border: '1px solid #ff5a5a',
                padding: '10px 14px',
                borderRadius: 6,
                fontFamily: BRAND.font,
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer'
              }}
            >
              DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThumbnailGrid({
  assets,
  isGenerating,
  pendingCount,
  pendingAspectRatio,
  viewingAsset,
  onView,
  onCloseViewer,
  onDelete
}) {
  const empty = !isGenerating && assets.length === 0;

  return (
    <div style={{ padding: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1
            style={{
              fontFamily: BRAND.font,
              fontSize: 28,
              margin: 0,
              fontStyle: 'italic',
              color: BRAND.text
            }}
          >
            Thumbnail <span style={{ color: BRAND.gold }}>Generator</span>
          </h1>
          <p style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 13, margin: '4px 0 0 0' }}>
            Cinematic documentary key-art production.
          </p>
        </div>
        <span
          style={{
            color: BRAND.textMuted,
            fontFamily: BRAND.font,
            fontSize: 10,
            letterSpacing: '2px',
            background: '#111',
            border: `1px solid ${BRAND.border}`,
            padding: '6px 10px',
            borderRadius: 6,
            fontWeight: 700
          }}
        >
          {assets.length} GENERATED
        </span>
      </header>

      {empty ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6rem 0',
            color: BRAND.textMuted,
            fontFamily: BRAND.font
          }}
        >
          <p style={{ fontSize: 14, letterSpacing: '2px', fontWeight: 700, margin: 0 }}>LIBRARY EMPTY</p>
          <p style={{ fontSize: 12, margin: '8px 0 0 0' }}>Upload a photo to begin.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {isGenerating &&
            Array.from({ length: pendingCount }).map((_, i) => (
              <PlaceholderCard key={`pending-${i}`} aspectRatio={pendingAspectRatio} />
            ))}
          {assets.map((asset) => (
            <ThumbnailCard
              key={asset.id}
              asset={asset}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <FullScreenViewer asset={viewingAsset} onClose={onCloseViewer} onDelete={onDelete} />
    </div>
  );
}
