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
      borderRadius: BRAND.radius,
      overflow: 'hidden',
      position: 'relative',
      background: '#0a0a0c',
      border: `1px solid ${BRAND.border}`,
    }}>

      {/* Noise texture base */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        opacity: 0.4
      }} />

      {/* Pulsing radial glow — the "image forming" effect */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 60% at 50% 45%,
          rgba(201,168,76,0.13) 0%,
          rgba(201,168,76,0.06) 35%,
          transparent 70%)`,
        animation: 'glowPulse 2.4s ease-in-out infinite',
      }} />

      {/* Travelling light sweep */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(
          105deg,
          transparent        30%,
          rgba(201,168,76,0.07) 48%,
          rgba(255,255,255,0.04) 50%,
          rgba(201,168,76,0.07) 52%,
          transparent        70%
        )`,
        backgroundSize: '250% 100%',
        animation: 'sweep 2s ease-in-out infinite',
      }} />

      {/* Bottom vignette — simulates dark cinematic base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)`,
        pointerEvents: 'none'
      }} />

      {/* Generating label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12
      }}>
        {/* Spinner ring */}
        <div style={{
          width: 28, height: 28,
          borderRadius: '50%',
          border: `2px solid rgba(201,168,76,0.18)`,
          borderTopColor: BRAND.gold,
          animation: 'spin 0.9s linear infinite',
          flexShrink: 0
        }} />
        <span style={{
          color: BRAND.textSubtle,
          fontFamily: BRAND.font,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          animation: 'fadeText 2.4s ease-in-out infinite'
        }}>
          Generating
        </span>
      </div>

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.06); }
        }
        @keyframes sweep {
          0%   { background-position: -100% 0; }
          100% { background-position: 250% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeText {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
