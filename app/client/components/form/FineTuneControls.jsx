import React from 'react';
import { BRAND } from '../../brand';
import Toggle from './Toggle';
import { INTENSITY_OPTIONS, TEMPERATURE_OPTIONS, COMPOSITION_OPTIONS } from '../../constants';

const labelStyle = {
  display: 'block',
  color: BRAND.textMuted,
  fontFamily: BRAND.font,
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 6
};

export default function FineTuneControls({ fineTune, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={labelStyle}>Cinematic Intensity</label>
        <Toggle options={INTENSITY_OPTIONS} value={fineTune.intensity} onChange={(v) => onChange('intensity', v)} />
      </div>
      <div>
        <label style={labelStyle}>Colour Temperature</label>
        <Toggle options={TEMPERATURE_OPTIONS} value={fineTune.temperature} onChange={(v) => onChange('temperature', v)} />
      </div>
      <div>
        <label style={labelStyle}>Composition</label>
        <Toggle options={COMPOSITION_OPTIONS} value={fineTune.composition} onChange={(v) => onChange('composition', v)} />
      </div>
    </div>
  );
}
