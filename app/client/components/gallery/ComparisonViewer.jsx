import React from 'react';
import { saveAs } from 'file-saver';
import { BRAND } from '../../brand';

function shortModelLabel(modelId) {
  if (!modelId) return 'Gemini';
  if (modelId.includes('3-pro')) return 'Gemini 3 Pro';
  if (modelId.includes('3.1-flash')) return 'Gemini 3.1 Flash';
  if (modelId.includes('flash')) return 'Gemini Flash';
  return modelId;
}

function AssetPanel({ asset, label }) {
  return (
    <div className="cv-panel">
      <div style={{ background: '#000', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, minHeight: 0, overflow: 'hidden' }}>
        <img
          src={asset.imageDataUrl}
          alt={asset.styleName}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
        />
      </div>
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, color: BRAND.text, fontFamily: BRAND.font, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label} — {asset.industry}
          </p>
          <p style={{ margin: '2px 0 0 0', color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12 }}>
            {asset.aspectRatio} · {asset.styleName}
            {asset.modelUsed ? ` · ${shortModelLabel(asset.modelUsed)}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => saveAs(asset.imageDataUrl, `istv-${asset.id}.png`)}
          style={{
            background: BRAND.surface, color: BRAND.text, border: `1px solid ${BRAND.border}`,
            padding: '7px 14px', borderRadius: BRAND.radiusSm, fontFamily: BRAND.font,
            fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0
          }}
        >
          Download
        </button>
      </div>
    </div>
  );
}

export default function ComparisonViewer({ assetA, assetB, onClose }) {
  if (!assetA || !assetB) return null;

  const handleExportBoth = () => {
    saveAs(assetA.imageDataUrl, `istv-${assetA.id}.png`);
    saveAs(assetB.imageDataUrl, `istv-${assetB.id}.png`);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}
    >
      <style>{`
        .cv-inner {
          width: 100%;
          max-width: 1200px;
          background: ${BRAND.panelBg};
          border: 1px solid ${BRAND.border};
          border-radius: ${BRAND.radiusLg};
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }
        .cv-panels {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .cv-divider {
          width: 1px;
          background: ${BRAND.border};
          flex-shrink: 0;
        }
        .cv-panel {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 600px) {
          .cv-panels {
            flex-direction: column;
            overflow-y: auto;
          }
          .cv-divider {
            width: auto;
            height: 1px;
          }
          .cv-panel {
            flex: none;
          }
          .cv-panel img {
            max-height: 36vh !important;
          }
        }
      `}</style>

      <div onClick={(e) => e.stopPropagation()} className="cv-inner">
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ color: BRAND.text, fontFamily: BRAND.font, fontSize: 14, fontWeight: 600 }}>Compare</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="button" onClick={handleExportBoth} style={{
              background: BRAND.gold, color: '#09090B', border: 'none',
              padding: '8px 16px', borderRadius: BRAND.radiusSm, fontFamily: BRAND.font,
              fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}>
              Export both
            </button>
            <button type="button" onClick={onClose} style={{
              background: 'transparent', color: BRAND.textMuted, border: 'none',
              fontSize: 18, cursor: 'pointer', lineHeight: 1
            }}>✕</button>
          </div>
        </div>

        {/* Panels */}
        <div className="cv-panels">
          <AssetPanel asset={assetA} label="A" />
          <div className="cv-divider" />
          <AssetPanel asset={assetB} label="B" />
        </div>
      </div>
    </div>
  );
}
