import React, { useCallback, useState } from 'react';
import { BRAND } from './brand';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Downscale + JPEG-recompress the uploaded file before it goes to the server.
// Smaller payload, faster upload, and JPEG recompression often cleans up phone-camera
// noise without hurting face-level detail.
function resizeImage(file, maxDim = 1024, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl, mimeType: 'image/jpeg', fileName: file.name });
      };
      img.src = e.target?.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AssetUpload({ subjectImage, onUpload, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only JPG, PNG, or WEBP images are allowed.');
        return;
      }
      setError(null);
      setIsProcessing(true);
      try {
        const resized = await resizeImage(file);
        onUpload(resized);
      } catch (err) {
        setError(err?.message || 'Could not process image.');
      } finally {
        setIsProcessing(false);
      }
    },
    [onUpload]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const onFileInput = (e) => {
    const file = e.target?.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const borderColor = isDragging || subjectImage ? BRAND.gold : BRAND.border;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        htmlFor="subject-upload"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{
          display: 'flex',
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '180px',
          padding: '1.25rem',
          border: `2px dashed ${borderColor}`,
          borderRadius: BRAND.radius,
          background: subjectImage ? BRAND.goldDim : BRAND.panelBg,
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'border-color 0.2s, background 0.2s'
        }}
      >
        {subjectImage ? (
          <>
            <img
              src={subjectImage.dataUrl}
              alt="Subject preview"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
            />
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onClear(); }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                padding: '6px 10px',
                cursor: 'pointer',
                fontFamily: BRAND.font,
                fontSize: 11,
                letterSpacing: '1px'
              }}
            >
              REMOVE
            </button>
            <p
              style={{
                position: 'relative',
                color: BRAND.gold,
                fontFamily: BRAND.font,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '2px',
                margin: 0
              }}
            >
              {isProcessing ? 'PROCESSING…' : 'IMAGE LOADED'}
            </p>
          </>
        ) : (
          <>
            <p style={{ color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 13, margin: '0 0 12px 0' }}>
              {isProcessing ? 'Processing…' : 'Drag & drop or click to upload'}
            </p>
            <span
              style={{
                background: BRAND.border,
                color: BRAND.text,
                padding: '8px 18px',
                borderRadius: 4,
                fontFamily: BRAND.font,
                fontSize: 12,
                letterSpacing: '1px'
              }}
            >
              BROWSE FILES
            </span>
          </>
        )}
        <input
          id="subject-upload"
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={onFileInput}
          style={{ display: 'none' }}
        />
      </label>
      {error && (
        <p style={{ color: '#ff5a5a', fontFamily: BRAND.font, fontSize: 12, marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
}
