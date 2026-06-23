import React, { useMemo } from 'react';
import { BRAND } from '../../brand';
import Toggle from './Toggle';
import {
  INTENSITY_OPTIONS, TEMPERATURE_OPTIONS, COMPOSITION_OPTIONS,
  STYLE_FINE_TUNE_PRESETS
} from '../../constants';

const labelStyle = {
  display: 'block',
  color: BRAND.textMuted,
  fontFamily: BRAND.font,
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 6
};

function isApplied(fineTune, suggestion) {
  return (
    fineTune.intensity    === suggestion.intensity &&
    fineTune.temperature  === suggestion.temperature &&
    fineTune.composition  === suggestion.composition
  );
}

export default function FineTuneControls({ fineTune, onChange, styleId }) {
  const suggestion = useMemo(() => STYLE_FINE_TUNE_PRESETS[styleId] || null, [styleId]);
  const alreadyApplied = suggestion ? isApplied(fineTune, suggestion) : false;

  const handleApplySuggestion = () => {
    if (!suggestion) return;
    onChange('intensity',   suggestion.intensity);
    onChange('temperature', suggestion.temperature);
    onChange('composition', suggestion.composition);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Suggestion banner */}
      {suggestion && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: BRAND.goldDim,
          border: `1px solid ${BRAND.goldBorder}`,
          borderRadius: BRAND.radiusSm,
          padding: '8px 12px',
          gap: 10
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: BRAND.font, fontSize: 11, fontWeight: 700, color: BRAND.gold, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Suggested for this style
            </span>
            <span style={{ fontFamily: BRAND.font, fontSize: 11, color: BRAND.textMuted }}>
              {suggestion.intensity} intensity · {suggestion.temperature} · {suggestion.composition}
            </span>
          </div>
          <button
            type="button"
            onClick={handleApplySuggestion}
            disabled={alreadyApplied}
            style={{
              flexShrink: 0,
              padding: '5px 12px',
              borderRadius: BRAND.radiusSm,
              border: `1px solid ${alreadyApplied ? 'transparent' : BRAND.gold}`,
              background: alreadyApplied ? 'transparent' : BRAND.gold,
              color: alreadyApplied ? BRAND.textMuted : '#09090B',
              fontFamily: BRAND.font,
              fontSize: 11,
              fontWeight: 700,
              cursor: alreadyApplied ? 'default' : 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap'
            }}
          >
            {alreadyApplied ? 'Applied' : 'Apply'}
          </button>
        </div>
      )}

      <div>
        <label style={labelStyle}>Cinematic Intensity</label>
        <Toggle
          options={INTENSITY_OPTIONS}
          value={fineTune.intensity}
          onChange={(v) => onChange('intensity', v)}
          highlightValue={suggestion?.intensity}
        />
      </div>
      <div>
        <label style={labelStyle}>Colour Temperature</label>
        <Toggle
          options={TEMPERATURE_OPTIONS}
          value={fineTune.temperature}
          onChange={(v) => onChange('temperature', v)}
          highlightValue={suggestion?.temperature}
        />
      </div>
      <div>
        <label style={labelStyle}>Composition</label>
        <Toggle
          options={COMPOSITION_OPTIONS}
          value={fineTune.composition}
          onChange={(v) => onChange('composition', v)}
          highlightValue={suggestion?.composition}
        />
      </div>
    </div>
  );
}
