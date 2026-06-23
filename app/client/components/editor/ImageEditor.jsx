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
  const [tool, setTool]               = useState('brush');
  const [brushSize, setBrushSize]     = useState(28);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
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
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 0
      }}
    >
      <style>{`
        .ie-sheet {
          width: 100%;
          max-width: 760px;
          background: ${BRAND.panelBg};
          border: 1px solid ${BRAND.border};
          border-radius: ${BRAND.radiusLg} ${BRAND.radiusLg} 0 0;
          display: flex;
          flex-direction: column;
          max-height: 92vh;
          overflow: hidden;
        }
        .ie-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .ie-footer {
          padding: 14px 20px 20px;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          flex-shrink: 0;
          border-top: 1px solid ${BRAND.border};
        }
        @media (min-width: 600px) {
          .ie-sheet {
            border-radius: ${BRAND.radiusLg};
            max-width: 760px;
            margin: auto;
          }
          .ie-backdrop {
            align-items: center !important;
            padding: 20px !important;
          }
        }
        @media (max-width: 599px) {
          .ie-footer button { flex: 1; }
          .ie-canvas-area { max-height: 36vh !important; }
        }
      `}</style>

      <div
        className="ie-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: 0
        }}
      >
        <div onClick={(e) => e.stopPropagation()} className="ie-sheet">

          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: `1px solid ${BRAND.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0
          }}>
            <div>
              <div style={{ color: BRAND.text, fontFamily: BRAND.font, fontSize: 15, fontWeight: 700 }}>Edit Background</div>
              <div style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 12, marginTop: 2 }}>
                Paint over an area to target it, or just describe your change below
              </div>
            </div>
            <button type="button" onClick={onClose} style={{
              background: 'transparent', border: 'none', color: BRAND.textMuted,
              fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 4, flexShrink: 0
            }}>✕</button>
          </div>

          {/* Canvas */}
          <div
            className="ie-canvas-area"
            style={{
              flex: 1, overflowY: 'auto', padding: 16,
              background: '#050507',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: 0
            }}
          >
            <EditorCanvas
              ref={canvasRef}
              imageDataUrl={asset.imageDataUrl}
              brushSize={brushSize}
              tool={tool}
            />
          </div>

          {/* Controls */}
          <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
            <div className="ie-toolbar">
              {/* Tool toggle */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[{ id: 'brush', icon: '✏', label: 'Paint' }, { id: 'eraser', icon: '◻', label: 'Erase' }].map((t) => (
                  <button key={t.id} type="button" onClick={() => setTool(t.id)} style={{
                    padding: '6px 12px', borderRadius: BRAND.radiusSm, cursor: 'pointer',
                    fontFamily: BRAND.font, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${tool === t.id ? BRAND.gold : BRAND.border}`,
                    background: tool === t.id ? BRAND.goldDim : BRAND.surface,
                    color: tool === t.id ? BRAND.gold : BRAND.textMuted
                  }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Brush size */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 11, marginRight: 2 }}>Size</span>
                {BRUSH_SIZES.map((s) => (
                  <button key={s.label} type="button" onClick={() => setBrushSize(s.value)} style={{
                    width: 32, height: 28, borderRadius: BRAND.radiusSm, cursor: 'pointer',
                    fontFamily: BRAND.font, fontSize: 11, fontWeight: 600,
                    border: `1px solid ${brushSize === s.value ? BRAND.gold : BRAND.border}`,
                    background: brushSize === s.value ? BRAND.goldDim : BRAND.surface,
                    color: brushSize === s.value ? BRAND.gold : BRAND.textMuted
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Clear */}
              <button type="button" onClick={() => canvasRef.current?.clearMask()} style={{
                padding: '6px 12px', borderRadius: BRAND.radiusSm, cursor: 'pointer',
                fontFamily: BRAND.font, fontSize: 12, fontWeight: 600,
                border: `1px solid ${BRAND.border}`,
                background: 'transparent', color: BRAND.textMuted, marginLeft: 'auto'
              }}>
                Clear
              </button>
            </div>

            {/* Instruction */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: 'block', color: BRAND.textMuted, fontFamily: BRAND.font,
                fontSize: 11, fontWeight: 600, marginBottom: 6,
                letterSpacing: '0.06em', textTransform: 'uppercase'
              }}>
                Describe the change
              </label>
              <textarea
                value={instruction}
                onChange={(e) => { setInstruction(e.target.value); setError(''); }}
                placeholder="e.g. Remove the logo from the background, add dramatic fog rolling in"
                rows={2}
                style={{
                  width: '100%', background: BRAND.surface,
                  border: `1px solid ${error ? BRAND.errorBorder : BRAND.border}`,
                  borderRadius: BRAND.radiusSm, color: BRAND.text, fontFamily: BRAND.font,
                  fontSize: 13, padding: '10px 12px', resize: 'none', outline: 'none',
                  boxSizing: 'border-box', lineHeight: 1.5, transition: 'border-color 0.15s'
                }}
                onFocus={(e) => { e.target.style.borderColor = BRAND.gold; }}
                onBlur={(e) => { e.target.style.borderColor = error ? BRAND.errorBorder : BRAND.border; }}
              />
              {error && <p style={{ color: BRAND.error, fontFamily: BRAND.font, fontSize: 12, margin: '6px 0 0 0' }}>{error}</p>}
              <p style={{ color: BRAND.textSubtle, fontFamily: BRAND.font, fontSize: 11, margin: '5px 0 0 0' }}>
                Painting is optional — describing the change alone is enough for most edits.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="ie-footer">
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
                padding: '10px 22px', borderRadius: BRAND.radiusSm,
                cursor: loading || !instruction.trim() ? 'not-allowed' : 'pointer',
                fontFamily: BRAND.font, fontSize: 13, fontWeight: 700, border: 'none',
                background: loading || !instruction.trim() ? BRAND.textSubtle : BRAND.gold,
                color: loading || !instruction.trim() ? BRAND.textMuted : '#09090B',
                transition: 'background 0.15s', minWidth: 120
              }}
            >
              {loading ? 'Applying…' : 'Apply Edit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
