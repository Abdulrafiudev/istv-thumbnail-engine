import React, { useState } from 'react';
import { BRAND } from './brand';
import ThumbnailCard from './ThumbnailCard';
import PlaceholderCard from './components/gallery/PlaceholderCard';
import FullScreenViewer from './components/gallery/FullScreenViewer';
import ComparisonViewer from './components/gallery/ComparisonViewer';

export default function ThumbnailGrid({
  assets, isGenerating, pendingCount, pendingAspectRatio,
  viewingAsset, onView, onCloseViewer, onDelete
}) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [comparingPair, setComparingPair] = useState(null);

  const empty = !isGenerating && assets.length === 0;

  const toggleCompareMode = () => {
    setCompareMode((v) => !v);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.size < 2 && next.add(id);
      return next;
    });
  };

  const handleOpenComparison = () => {
    const [idA, idB] = [...selectedIds];
    const assetA = assets.find((a) => a.id === idA);
    const assetB = assets.find((a) => a.id === idB);
    if (assetA && assetB) setComparingPair({ assetA, assetB });
  };

  return (
    <div style={{ padding: '28px 28px', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: BRAND.font, fontSize: 22, fontWeight: 700, color: BRAND.text, margin: 0 }}>
            Thumbnail Generator
          </h1>
          <p style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 13, margin: '4px 0 0 0' }}>
            Cinematic documentary key-art for Inside Success TV.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {compareMode && selectedIds.size === 2 && (
            <button type="button" onClick={handleOpenComparison} style={{
              background: BRAND.gold, color: '#09090B', border: 'none',
              padding: '8px 16px', borderRadius: BRAND.radiusSm, fontFamily: BRAND.font,
              fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}>
              Compare
            </button>
          )}
          {assets.length >= 2 && (
            <button type="button" onClick={toggleCompareMode} style={{
              background: compareMode ? BRAND.goldDim : 'transparent',
              color: compareMode ? BRAND.gold : BRAND.textMuted,
              border: `1px solid ${compareMode ? BRAND.goldBorder : BRAND.border}`,
              padding: '7px 14px', borderRadius: BRAND.radiusSm, fontFamily: BRAND.font,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
            }}>
              {compareMode ? 'Exit compare' : 'Compare'}
            </button>
          )}
          <div style={{
            background: BRAND.surface, border: `1px solid ${BRAND.border}`,
            borderRadius: BRAND.radiusSm, padding: '7px 12px',
            fontFamily: BRAND.font, fontSize: 12, color: BRAND.textMuted, fontWeight: 500
          }}>
            {assets.length} generated
          </div>
        </div>
      </div>

      {/* Compare hint */}
      {compareMode && (
        <div style={{
          marginBottom: 20, padding: '10px 14px',
          background: BRAND.goldDim, border: `1px solid ${BRAND.goldBorder}`,
          borderRadius: BRAND.radiusSm, fontFamily: BRAND.font,
          fontSize: 13, color: BRAND.gold
        }}>
          Select 2 thumbnails to compare. {selectedIds.size} / 2 selected.
        </div>
      )}

      {/* Empty state */}
      {empty ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 0', gap: 12
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: BRAND.surface, border: `1px solid ${BRAND.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="1" y="1" width="9" height="9" rx="2" stroke={BRAND.textSubtle} strokeWidth="1.5"/>
              <rect x="12" y="1" width="9" height="9" rx="2" stroke={BRAND.textSubtle} strokeWidth="1.5"/>
              <rect x="1" y="12" width="9" height="9" rx="2" stroke={BRAND.textSubtle} strokeWidth="1.5"/>
              <rect x="12" y="12" width="9" height="9" rx="2" stroke={BRAND.textSubtle} strokeWidth="1.5" opacity="0.3"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: BRAND.font, fontSize: 14, fontWeight: 600, color: BRAND.text, margin: 0 }}>No thumbnails yet</p>
            <p style={{ fontFamily: BRAND.font, fontSize: 13, color: BRAND.textMuted, margin: '4px 0 0 0' }}>Upload a photo and hit Generate to get started.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {isGenerating && Array.from({ length: pendingCount }).map((_, i) => (
            <PlaceholderCard key={`p-${i}`} aspectRatio={pendingAspectRatio} />
          ))}
          {assets.map((asset) => (
            <ThumbnailCard
              key={asset.id}
              asset={asset}
              onView={onView}
              onDelete={onDelete}
              compareMode={compareMode}
              isSelected={selectedIds.has(asset.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}

      <FullScreenViewer asset={viewingAsset} onClose={onCloseViewer} onDelete={onDelete} />
      {comparingPair && (
        <ComparisonViewer assetA={comparingPair.assetA} assetB={comparingPair.assetB} onClose={() => setComparingPair(null)} />
      )}
    </div>
  );
}
