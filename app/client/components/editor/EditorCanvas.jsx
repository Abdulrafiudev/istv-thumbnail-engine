import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import { BRAND } from '../../brand';

const EditorCanvas = forwardRef(function EditorCanvas({ imageDataUrl, brushSize, tool }, ref) {
  const canvasRef   = useRef(null);
  const imgRef      = useRef(null);
  const maskRef     = useRef(null); // off-screen canvas for mask data
  const drawing     = useRef(false);
  const lastPos     = useRef(null);
  const [ready, setReady] = useState(false);

  // Load image and set up canvases
  useEffect(() => {
    setReady(false);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Natural dimensions, capped for display
      const maxW = Math.min(img.naturalWidth, 800);
      const scale = maxW / img.naturalWidth;
      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);

      // Off-screen mask canvas at same dimensions
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width  = canvas.width;
      maskCanvas.height = canvas.height;
      maskRef.current = maskCanvas;

      drawComposite();
      setReady(true);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  function drawComposite() {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    const mask   = maskRef.current;
    if (!canvas || !img || !mask) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Overlay mask (red, semi-transparent)
    ctx.globalAlpha = 0.55;
    ctx.drawImage(mask, 0, 0);
    ctx.globalAlpha = 1;
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const client = e.touches ? e.touches[0] : e;
    return {
      x: (client.clientX - rect.left) * scaleX,
      y: (client.clientY - rect.top)  * scaleY
    };
  }

  function stroke(from, to) {
    const mask = maskRef.current;
    if (!mask) return;
    const ctx = mask.getContext('2d');
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(220,50,50,1)';
    }

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    drawComposite();
  }

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    drawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    // Paint a dot at the start position
    stroke(pos, pos);
  }, [tool, brushSize]);

  const onPointerMove = useCallback((e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const pos = getPos(e);
    stroke(lastPos.current, pos);
    lastPos.current = pos;
  }, [tool, brushSize]);

  const onPointerUp = useCallback(() => { drawing.current = false; }, []);

  // Expose getMaskDataUrl to parent
  useImperativeHandle(ref, () => ({
    getMaskDataUrl() {
      const mask = maskRef.current;
      if (!mask) return null;
      // Check if mask has any painted pixels
      const ctx = mask.getContext('2d');
      const data = ctx.getImageData(0, 0, mask.width, mask.height).data;
      const hasPaint = data.some((v, i) => i % 4 === 3 && v > 0);
      if (!hasPaint) return null;
      return mask.toDataURL('image/png');
    },
    clearMask() {
      const mask = maskRef.current;
      if (!mask) return;
      mask.getContext('2d').clearRect(0, 0, mask.width, mask.height);
      drawComposite();
    }
  }));

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: BRAND.textMuted, fontFamily: BRAND.font, fontSize: 13
        }}>Loading image…</div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%', borderRadius: BRAND.radiusSm,
          cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          display: 'block', touchAction: 'none',
          opacity: ready ? 1 : 0
        }}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      />
    </div>
  );
});

export default EditorCanvas;
