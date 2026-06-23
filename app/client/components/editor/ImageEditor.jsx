import React, { useState, useRef } from 'react';
import { BRAND } from '../../brand';
import EditorCanvas from './EditorCanvas';
import { editBackground } from '../../api';

const BRUSH_SIZES = [
  { label: 'S', value: 14 },
  { label: 'M', value: 28 },
  { label: 'L', value: 50 }
];

export default function ImageEditor({ asset, onClose, onResult }) {
  const [tool, setTool]           = useState('brush');
  const [brushSize, setBrushSize] = useState(28);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const canvasRef = useRef(null);

  async function handleApply() {
    if (!instruction.trim()) { setError('Describe what you want to change.'); return; }
    setError('');
    setLoading(true);
    try {
      const maskDataUrl = canvasRef.current?.getMaskDataUrl() || null;
      const result = await editBackground({
        imageDataUrl: asset.imageDataUrl,
        maskDataUrl,
        instruction:  instruction.trim(),
        meta: {
          industry:    asset.industry,
          styleName:   asset.styleName,
          aspectRatio: asset.aspectRatio
        }
      });
      onResult(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Edit failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(16px)',
        zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 760,
          background: BRAND.panelBg,
          border: `1px solid ${BRAND.border}`,
          borderRadius: BRAND.radiusLg,
          display: 'flex', flexDirection: 'column',
          maxHeight: '92vh', overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${BRAND.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <div style={{ color: BRAND.text, fontFamily: BRAND.font, fontSize: 15, fontWeight: 700 }}>Edit Background</div>
            <div style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, marginTop: 2 }}>
              Paint over the area to change, then describe the edit
            </div>
          </div>
          <button type="button" onClick={onClose} style={{
            background: 'transparent', border: 'none', color: BRAND.textMuted,
            fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 4
          }}>✕</button>
        </div>

        {/* Canvas area */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 20,
          background: '#050507',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <EditorCanvas
            ref={canvasRef}
            imageDataUrl={asset.imageDataUrl}
            brushSize={brushSize}
            tool={tool}
          />
        </div>

        {/* Controls */}
        <div style={{
          padding: '14px 20px 0',
          borderTop: `1px solid ${BRAND.border}`,
          flexShrink: 0
        }}>
          {/* Toolbar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            {/* Tool toggle */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ id: 'brush', icon: '✏', label: 'Paint' }, { id: 'eraser', icon: '◻', label: 'Erase' }].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTool(t.id)}
                  style={{
                    padding: '6px 12px', borderRadius: BRAND.radiusSm, cursor: 'pointer',
                    fontFamily: BRAND.font, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${tool === t.id ? BRAND.gold : BRAND.border}`,
                    background: tool === t.id ? BRAND.goldDim : BRAND.surface,
                    color: tool === t.id ? BRAND.gold : BRAND.textMuted
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Brush size */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 11, marginRight: 4 }}>Size</span>
              {BRUSH_SIZES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setBrushSize(s.value)}
                  style={{
                    width: 32, height: 28, borderRadius: BRAND.radiusSm, cursor: 'pointer',
                    fontFamily: BRAND.font, fontSize: 11, fontWeight: 600,
                    border: `1px solid ${brushSize === s.value ? BRAND.gold : BRAND.border}`,
                    background: brushSize === s.value ? BRAND.goldDim : BRAND.surface,
                    color: brushSize === s.value ? BRAND.gold : BRAND.textMuted
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Clear mask */}
            <button
              type="button"
              onClick={() => canvasRef.current?.clearMask()}
              style={{
                padding: '6px 12px', borderRadius: BRAND.radiusSm, cursor: 'pointer',
                fontFamily: BRAND.font, fontSize: 12, fontWeight: 600,
                border: `1px solid ${BRAND.border}`,
                background: 'transparent', color: BRAND.textMuted,
                marginLeft: 'auto'
              }}
            >
              Clear mask
            </button>
          </div>

          {/* Instruction input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: 'block', color: BRAND.textMuted, fontFamily: BRAND.font,
              fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              Describe the change
            </label>
            <textarea
              value={instruction}
              onChange={(e) => { setInstruction(e.target.value); setError(''); }}
              placeholder="e.g. Remove the logo from the background, add dramatic fog rolling in"
              rows={2}
              style={{
                width: '100%', background: BRAND.surface, border: `1px solid ${error ? BRAND.errorBorder : BRAND.border}`,
                borderRadius: BRAND.radiusSm, color: BRAND.text, fontFamily: BRAND.font,
                fontSize: 13, padding: '10px 12px', resize: 'none', outline: 'none',
                boxSizing: 'border-box', lineHeight: 1.5,
                transition: 'border-color 0.15s'
              }}
              onFocus={(e) => { e.target.style.borderColor = BRAND.gold; }}
              onBlur={(e) => { e.target.style.borderColor = error ? BRAND.errorBorder : BRAND.border; }}
            />
            {error && (
              <p style={{ color: BRAND.error, fontFamily: BRAND.font, fontSize: 12, margin: '6px 0 0 0' }}>{error}</p>
            )}
            <p style={{ color: BRAND.textSubtle, fontFamily: BRAND.font, fontSize: 11, margin: '5px 0 0 0' }}>
              Paint over the area to edit, or skip painting to describe a global change.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px 16px',
          display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0
        }}>
          <button type="button" onClick={onClose} style={{
            padding: '10px 18px', borderRadius: BRAND.radiusSm, cursor: 'pointer',
            fontFamily: BRAND.font, fontSize: 13, fontWeight: 600,
            border: `1px solid ${BRAND.border}`, background: 'transparent', color: BRAND.textMuted
          }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={loading || !instruction.trim()}
            style={{
              padding: '10px 22px', borderRadius: BRAND.radiusSm, cursor: loading || !instruction.trim() ? 'not-allowed' : 'pointer',
              fontFamily: BRAND.font, fontSize: 13, fontWeight: 700,
              border: 'none',
              background: loading || !instruction.trim() ? BRAND.textSubtle : BRAND.gold,
              color: loading || !instruction.trim() ? BRAND.textMuted : '#09090B',
              transition: 'background 0.15s',
              minWidth: 130
            }}
          >
            {loading ? 'Applying edit…' : 'Apply Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}
