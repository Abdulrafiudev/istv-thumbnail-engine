import React from 'react';
import { BRAND } from '../../brand';

function aspectRatioCss(ratio) {
  if (ratio === '16:9') return '16 / 9';
  if (ratio === '9:16') return '9 / 16';
  return '3 / 4';
}

export default function PlaceholderCard({ aspectRatio }) {
  return (
    <div style={{
      aspectRatio: aspectRatioCss(aspectRatio),
      background: BRAND.surface,
      border: `1px solid ${BRAND.border}`,
      borderRadius: BRAND.radius,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 1.8s ease-in-out infinite',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.04) 50%, transparent 100%)`,
        animation: 'shimmer 2s infinite',
        backgroundSize: '200% 100%'
      }} />
      <span style={{ color: BRAND.textSubtle, fontFamily: BRAND.font, fontSize: 12, fontWeight: 500, position: 'relative' }}>
        Generating...
      </span>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}
