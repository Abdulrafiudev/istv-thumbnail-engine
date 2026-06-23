import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { BRAND } from '../../brand';
import DeleteModal from '../ui/DeleteModal';
import ImageEditor from '../editor/ImageEditor';

function shortModelLabel(modelId) {
  if (!modelId) return 'Gemini';
  if (modelId.includes('3-pro')) return 'Gemini 3 Pro Image';
  if (modelId.includes('3.1-flash')) return 'Gemini 3.1 Flash Image';
  if (modelId.includes('flash')) return 'Gemini Flash Image';
  return modelId;
}

function MetaRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${BRAND.border}` }}>
      <span style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, fontWeight: 500 }}>{label}</span>
      <span style={{ color: BRAND.text, fontFamily: BRAND.font, fontSize: 12, fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

export default function FullScreenViewer({ asset, onClose, onDelete, onAddAsset }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditor, setShowEditor]           = useState(false);
  if (!asset) return null;
  const handleDownload = () => saveAs(asset.imageDataUrl, `istv-${asset.id}.png`);
  const handleDeleteConfirm = () => { setShowDeleteModal(false); onDelete(asset.id); onClose(); };
  const handleEditResult = (edited) => { if (onAddAsset) onAddAsset(edited); };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}
    >
      <style>{`
        .fsv-inner {
          max-width: 1100px;
          width: 100%;
          background: ${BRAND.panelBg};
          border: 1px solid ${BRAND.border};
          border-radius: ${BRAND.radiusLg};
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          grid-template-rows: minmax(0, 1fr);
          overflow: hidden;
          height: 88vh;
          max-height: 820px;
        }
        .fsv-actions {
          padding: 16px 20px;
          border-top: 1px solid ${BRAND.border};
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        @media (max-width: 680px) {
          .fsv-inner {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            height: 92vh;
            max-height: none;
          }
          .fsv-image-pane {
            max-height: 40vh !important;
          }
          .fsv-panel {
            border-left: none !important;
            border-top: 1px solid ${BRAND.border};
          }
          .fsv-actions button {
            flex: 1;
          }
        }
      `}</style>

      <div onClick={(e) => e.stopPropagation()} className="fsv-inner">

        {/* Image */}
        <div
          className="fsv-image-pane"
          style={{
            background: '#050507',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, overflow: 'hidden', minHeight: 0
          }}
        >
          <img
            src={asset.imageDataUrl}
            alt={asset.styleName}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              width: 'auto', height: 'auto',
              objectFit: 'contain', borderRadius: 8, display: 'block'
            }}
          />
        </div>

        {/* Panel */}
        <div
          className="fsv-panel"
          style={{ borderLeft: `1px solid ${BRAND.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: 0 }}
        >
          {/* Panel header */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ color: BRAND.text, fontFamily: BRAND.font, fontSize: 14, fontWeight: 700 }}>
              {asset.industry}
            </span>
            <button type="button" onClick={onClose} style={{ background: 'transparent', color: BRAND.textMuted, border: 'none', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>

          {/* Meta */}
          <div style={{ padding: '4px 20px', flex: 1, overflowY: 'auto' }}>
            {asset.isFallbackModel === true && (
              <div style={{
                margin: '14px 0',
                background: BRAND.goldDim, border: `1px solid ${BRAND.goldBorder}`,
                color: BRAND.gold, padding: '10px 12px', borderRadius: BRAND.radiusSm,
                fontFamily: BRAND.font, fontSize: 12, fontWeight: 500, lineHeight: 1.5
              }}>
                Fallback model used — {shortModelLabel(asset.modelUsed)} ran instead of Gemini 3 Pro. Regenerate to retry the primary model.
              </div>
            )}
            <MetaRow label="Style" value={asset.styleName} />
            <MetaRow label="Aspect ratio" value={asset.aspectRatio} />
            {asset.modelUsed && <MetaRow label="Model" value={shortModelLabel(asset.modelUsed)} />}
            <div style={{ padding: '10px 0', borderBottom: `1px solid ${BRAND.border}` }}>
              <p style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, fontWeight: 500, margin: '0 0 6px 0' }}>Prompt</p>
              <p style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 11, lineHeight: 1.6, margin: 0 }}>{asset.promptUsed}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="fsv-actions">
            <button type="button" onClick={handleDownload} style={{
              flex: 1, background: BRAND.gold, color: '#09090B', border: 'none',
              padding: '11px', borderRadius: BRAND.radiusSm, fontFamily: BRAND.font,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', minWidth: 80
            }}>
              Download
            </button>
            <button type="button" onClick={() => setShowEditor(true)} style={{
              background: BRAND.goldDim, color: BRAND.gold,
              border: `1px solid ${BRAND.goldBorder}`, padding: '11px 16px',
              borderRadius: BRAND.radiusSm, fontFamily: BRAND.font,
              fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}>
              Edit
            </button>
            <button type="button" onClick={() => setShowDeleteModal(true)} style={{
              background: 'transparent', color: BRAND.error,
              border: `1px solid ${BRAND.errorBorder}`, padding: '11px 16px',
              borderRadius: BRAND.radiusSm, fontFamily: BRAND.font,
              fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}>
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {showEditor && (
        <ImageEditor
          asset={asset}
          onClose={() => setShowEditor(false)}
          onResult={handleEditResult}
        />
      )}
    </div>
  );
}
