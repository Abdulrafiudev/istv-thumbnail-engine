'use strict';

const { generateImage, bufferToDataUrl } = require('./gemini.service');
const { buildPrompt } = require('./prompt.service');

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function runVariations({ subjectImages, style, industry, aspectRatio, count, fineTune }) {
  const styleName = style.name;
  const subjectImageDataUrls = subjectImages.map((img) => img.dataUrl);

  const jobs = Array.from({ length: count }, (_, i) => {
    const prompt = buildPrompt({ styleTemplate: style.promptTemplate, industry, variationIndex: i, fineTune });
    return (async () => {
      const out = await generateImage({ subjectImageDataUrls, prompt, aspectRatio });
      return {
        id: randomId(),
        imageDataUrl: bufferToDataUrl(out.buffer, out.mimeType),
        promptUsed: prompt,
        industry: String(industry).trim(),
        styleName,
        aspectRatio,
        modelUsed: out.modelUsed,
        isFallbackModel: out.isFallbackModel
      };
    })();
  });

  const settled = await Promise.allSettled(jobs);

  return settled.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    const err = r.reason || {};
    return {
      id: randomId(),
      error: true,
      code: err.code || 'AI_GEN_ERROR',
      message: err.message || `Variation ${i + 1} failed.`,
      industry: String(industry).trim(),
      styleName,
      aspectRatio
    };
  });
}

module.exports = { runVariations };
