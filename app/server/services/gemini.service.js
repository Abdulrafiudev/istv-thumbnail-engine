'use strict';

const { GoogleGenAI } = require('@google/genai');

const GEMINI_PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || 'gemini-3-pro-image-preview';
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-image-preview';

const MAX_RETRIES = 2;
const BACKOFF_BASE_MS = 1200;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) {
    const err = new Error('Invalid subject image data URL');
    err.code = 'BAD_INPUT';
    throw err;
  }
  return { mimeType: match[1], base64: match[2] };
}

function bufferToDataUrl(buffer, mimeType = 'image/png') {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function isTerminalError(err) {
  return err && (err.code === 'AI_GEN_REFUSED' || err.code === 'BAD_INPUT');
}

function requireEnv(name, hint) {
  const v = process.env[name];
  if (!v || v.includes('your_')) {
    const err = new Error(`${name} not configured — ${hint}`);
    err.code = 'BAD_INPUT';
    throw err;
  }
  return v;
}

async function withRetry(fn, { label = 'op', maxRetries = MAX_RETRIES } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      if (isTerminalError(err) || attempt === maxRetries) break;
      const delay = BACKOFF_BASE_MS * Math.pow(2, attempt);
      console.warn(`[gemini] ${label} attempt ${attempt + 1} failed (${err?.message}); retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

async function runGeminiScene({ subjectImages, prompt, aspectRatio, model }) {
  const apiKey = requireEnv('GOOGLE_GENAI_API_KEY', 'add it to .env to enable generation');
  const ai = new GoogleGenAI({ apiKey });

  // Build contents: one inlineData part per reference photo, then the text prompt.
  const contents = [
    ...subjectImages.map(({ base64, mimeType }) => ({ inlineData: { data: base64, mimeType } })),
    { text: prompt }
  ];

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio }
    }
  });

  const candidate = response?.candidates?.[0];
  if (!candidate) {
    const err = new Error('Gemini returned no candidates');
    err.code = 'AI_GEN_REFUSED';
    throw err;
  }
  if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
    const err = new Error(`Gemini refused: ${candidate.finishReason}`);
    err.code = 'AI_GEN_REFUSED';
    throw err;
  }

  const parts = candidate.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData && p.inlineData.data);
  if (!imagePart) {
    const err = new Error('Gemini returned no image part');
    err.code = 'AI_GEN_REFUSED';
    throw err;
  }

  return {
    buffer: Buffer.from(imagePart.inlineData.data, 'base64'),
    mimeType: imagePart.inlineData.mimeType || 'image/png'
  };
}

// subjectImageDataUrls: string[] (1–4 data URLs)
async function generateImage({ subjectImageDataUrls, prompt, aspectRatio }) {
  if (!subjectImageDataUrls || subjectImageDataUrls.length === 0) {
    const err = new Error('At least one subject image is required');
    err.code = 'BAD_INPUT';
    throw err;
  }
  if (!prompt) {
    const err = new Error('prompt is required');
    err.code = 'BAD_INPUT';
    throw err;
  }

  const subjectImages = subjectImageDataUrls.map(parseDataUrl);
  const args = { subjectImages, prompt, aspectRatio: aspectRatio || '16:9' };

  try {
    const scene = await withRetry(
      () => runGeminiScene({ ...args, model: GEMINI_PRIMARY_MODEL }),
      { label: `scene(${GEMINI_PRIMARY_MODEL})` }
    );
    return { buffer: scene.buffer, mimeType: scene.mimeType, modelUsed: GEMINI_PRIMARY_MODEL, isFallbackModel: false };
  } catch (primaryErr) {
    if (isTerminalError(primaryErr)) throw primaryErr;
    console.warn(`[gemini] primary model failed, trying fallback: ${primaryErr?.message}`);
    const scene = await withRetry(
      () => runGeminiScene({ ...args, model: GEMINI_FALLBACK_MODEL }),
      { label: `scene(${GEMINI_FALLBACK_MODEL})` }
    );
    return { buffer: scene.buffer, mimeType: scene.mimeType, modelUsed: GEMINI_FALLBACK_MODEL, isFallbackModel: true };
  }
}

module.exports = { generateImage, bufferToDataUrl, GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL };
