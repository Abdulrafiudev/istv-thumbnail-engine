'use strict';

const { GoogleGenAI } = require('@google/genai');

const GEMINI_PRIMARY_MODEL  = process.env.GEMINI_PRIMARY_MODEL  || 'gemini-3-pro-image-preview';
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-image-preview';

const MAX_RETRIES    = 2;
const BACKOFF_BASE_MS = 1200;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) { const e = new Error('Invalid image data URL'); e.code = 'BAD_INPUT'; throw e; }
  return { mimeType: match[1], base64: match[2] };
}

function bufferToDataUrl(buffer, mimeType = 'image/png') {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function isTerminalError(err) {
  return err && (err.code === 'AI_GEN_REFUSED' || err.code === 'BAD_INPUT');
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v || v.includes('your_')) { const e = new Error(`${name} not configured`); e.code = 'BAD_INPUT'; throw e; }
  return v;
}

async function withRetry(fn, { label = 'op', maxRetries = MAX_RETRIES } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try { return await fn(); } catch (err) {
      lastErr = err;
      if (isTerminalError(err) || attempt === maxRetries) break;
      const delay = BACKOFF_BASE_MS * Math.pow(2, attempt);
      console.warn(`[image-edit] ${label} attempt ${attempt + 1} failed; retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

async function runEdit({ imageBase64, imageMimeType, maskBase64, maskMimeType, instruction, model }) {
  const apiKey = requireEnv('GOOGLE_GENAI_API_KEY');
  const ai = new GoogleGenAI({ apiKey });

  const contents = [
    { inlineData: { data: imageBase64, mimeType: imageMimeType } }
  ];

  if (maskBase64) {
    contents.push({ inlineData: { data: maskBase64, mimeType: maskMimeType } });
    contents.push({
      text: `Edit this image as described below. The second image is a mask — the red/white painted areas indicate the region to edit. Only modify the masked region; keep everything else identical, especially the subject's face and body.\n\nEdit instruction: ${instruction}`
    });
  } else {
    contents.push({
      text: `Edit this image as described below. Only modify what is described; keep everything else identical, especially the subject's face and body.\n\nEdit instruction: ${instruction}`
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: { responseModalities: ['IMAGE'] }
  });

  const candidate = response?.candidates?.[0];
  if (!candidate) { const e = new Error('Gemini returned no candidates'); e.code = 'AI_GEN_REFUSED'; throw e; }
  if (candidate.finishReason && !['STOP', 'MAX_TOKENS'].includes(candidate.finishReason)) {
    const e = new Error(`Gemini refused: ${candidate.finishReason}`); e.code = 'AI_GEN_REFUSED'; throw e;
  }

  const imagePart = (candidate.content?.parts || []).find((p) => p.inlineData?.data);
  if (!imagePart) { const e = new Error('Gemini returned no image'); e.code = 'AI_GEN_REFUSED'; throw e; }

  return {
    buffer:   Buffer.from(imagePart.inlineData.data, 'base64'),
    mimeType: imagePart.inlineData.mimeType || 'image/png'
  };
}

async function editImage({ imageDataUrl, maskDataUrl, instruction }) {
  if (!imageDataUrl) { const e = new Error('imageDataUrl is required'); e.code = 'BAD_INPUT'; throw e; }
  if (!instruction?.trim()) { const e = new Error('instruction is required'); e.code = 'BAD_INPUT'; throw e; }

  const { base64: imageBase64, mimeType: imageMimeType } = parseDataUrl(imageDataUrl);
  const mask = maskDataUrl ? parseDataUrl(maskDataUrl) : null;

  const args = {
    imageBase64,
    imageMimeType,
    maskBase64:   mask?.base64  || null,
    maskMimeType: mask?.mimeType || null,
    instruction
  };

  try {
    const result = await withRetry(
      () => runEdit({ ...args, model: GEMINI_PRIMARY_MODEL }),
      { label: `edit(${GEMINI_PRIMARY_MODEL})` }
    );
    return { ...result, modelUsed: GEMINI_PRIMARY_MODEL, isFallbackModel: false };
  } catch (primaryErr) {
    if (isTerminalError(primaryErr)) throw primaryErr;
    console.warn(`[image-edit] primary failed, trying fallback: ${primaryErr?.message}`);
    const result = await withRetry(
      () => runEdit({ ...args, model: GEMINI_FALLBACK_MODEL }),
      { label: `edit(${GEMINI_FALLBACK_MODEL})` }
    );
    return { ...result, modelUsed: GEMINI_FALLBACK_MODEL, isFallbackModel: true };
  }
}

module.exports = { editImage, bufferToDataUrl };
