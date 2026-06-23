import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { BRAND } from './brand';
import DeleteModal from './components/ui/DeleteModal';
import ImageEditor from './components/editor/ImageEditor';

function aspectRatioCss(ratio) {
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

export default function ThumbnailCard({ asset, onView, onDelete, onAddAsset, compareMode, isSelected, onToggleSelect }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditor, setShowEditor]           = useState(false);
  const isError = !!asset.error;
  const isModelFallback = asset.isFallbackModel === true;

  if (isError) {
    return (
      <div style={{
        aspectRatio: aspectRatioCss(asset.aspectRatio || '16:9'),
        background: BRAND.surface,
        border: `1px solid ${BRAND.errorBorder}`,
        borderRadius: BRAND.radius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        textAlign: 'center',
        gap: 6
      }}>
        <p style={{ fontWeight: 600, fontSize: 12, color: BRAND.error, margin: 0 }}>Generation failed</p>
        <p style={{ margin: 0, color: BRAND.textMuted, fontSize: 12 }}>{asset.message || 'Unknown error'}</p>
      </div>
    );
  }

  const handleClick = () => compareMode ? onToggleSelect(asset.id) : onView(asset);
  const handleDownload = (e) => { e.stopPropagation(); saveAs(asset.imageDataUrl, `istv-${asset.id}.png`); };
  const handleDeleteClick = (e) => { e.stopPropagation(); setShowDeleteModal(true); };
  const handleDeleteConfirm = () => { setShowDeleteModal(false); onDelete(asset.id); };
  const handleEditClick = (e) => { e.stopPropagation(); setShowEditor(true); };
  const handleEditResult = (edited) => { if (onAddAsset) onAddAsset(edited); };

  return (
    <div
      onClick={handleClick}
      className="thumb-card"
      style={{
        position: 'relative',
        background: BRAND.surface,
        border: `1px solid ${isSelected ? BRAND.gold : BRAND.border}`,
        borderRadius: BRAND.radius,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: isSelected ? `0 0 0 3px ${BRAND.goldDim}` : 'none'
      }}
    >
      {/* Compare checkbox */}
      {compareMode && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 10,
          width: 22, height: 22, borderRadius: 999,
          border: `2px solid ${isSelected ? BRAND.gold : 'rgba(255,255,255,0.6)'}`,
          background: isSelected ? BRAND.gold : 'rgba(9,9,11,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s'
        }}>
          {isSelected && <span style={{ color: '#09090B', fontSize: 11, fontWeight: 700 }}>✓</span>}
        </div>
      )}

      {/* Image */}
      <div style={{ aspectRatio: aspectRatioCss(asset.aspectRatio), position: 'relative', overflow: 'hidden' }}>
        <img
          src={asset.imageDataUrl}
          alt={asset.styleName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {!compareMode && (
          <div className="thumb-overlay" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.2) 50%, transparent 100%)',
            opacity: 0, transition: 'opacity 0.2s',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: 14, gap: 8
          }}>
            <button type="button" onClick={handleDownload} style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)', padding: '7px 14px', borderRadius: BRAND.radiusSm,
              fontFamily: BRAND.font, fontWeight: 600, fontSize: 12, cursor: 'pointer'
            }}>
              Download
            </button>
            <button type="button" onClick={handleEditClick} style={{
              background: BRAND.goldDim, color: BRAND.gold, border: `1px solid ${BRAND.goldBorder}`,
              backdropFilter: 'blur(8px)', padding: '7px 14px', borderRadius: BRAND.radiusSm,
              fontFamily: BRAND.font, fontWeight: 600, fontSize: 12, cursor: 'pointer'
            }}>
              Edit
            </button>
            <button type="button" onClick={handleDeleteClick} style={{
              background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)',
              backdropFilter: 'blur(8px)', padding: '7px 14px', borderRadius: BRAND.radiusSm,
              fontFamily: BRAND.font, fontWeight: 600, fontSize: 12, cursor: 'pointer'
            }}>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Fallback badge */}
      {isModelFallback && (
        <div style={{
          background: BRAND.goldDim, color: BRAND.gold, borderTop: `1px solid ${BRAND.goldBorder}`,
          padding: '6px 12px', fontFamily: BRAND.font, fontSize: 11, fontWeight: 600
        }}>
          Fallback model: {shortModelLabel(asset.modelUsed)}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '10px 12px', borderTop: `1px solid ${BRAND.border}` }}>
        <p style={{ margin: 0, color: BRAND.text, fontFamily: BRAND.font, fontSize: 12, fontWeight: 600 }}>
          {asset.industry}
        </p>
        <p style={{ margin: '2px 0 0 0', color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 11 }}>
          {asset.aspectRatio} · {asset.styleName}
        </p>
      </div>

      <style>{`
        .thumb-card:hover { border-color: ${BRAND.borderStrong} !important; box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important; }
        .thumb-card:hover .thumb-overlay { opacity: 1 !important; }
      `}</style>

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
