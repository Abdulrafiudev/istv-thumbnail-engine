'use strict';

const { generateImage, bufferToDataUrl } = require('./ai-generation-handler');
const { buildPrompt } = require('./prompt-builder');
const { resolveStyle, CUSTOM_STYLE_ID } = require('./default-styles');

const VALID_ASPECT_RATIOS = new Set(['3:4', '16:9', '9:16']);
const VALID_VARIATION_COUNTS = new Set([1, 3, 5]);

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function handleGenerate(req, res) {
  try {
    const { subjectImage, styleId, customPrompt, industry, aspectRatio, variations } = req.body || {};

    if (!subjectImage || typeof subjectImage !== 'object' || !subjectImage.dataUrl) {
      return res
        .status(400)
        .json({ error: true, code: 'BAD_INPUT', message: 'Missing subject image upload.' });
    }
    if (!industry || !String(industry).trim()) {
      return res
        .status(400)
        .json({ error: true, code: 'BAD_INPUT', message: 'Industry is required.' });
    }
    if (!VALID_ASPECT_RATIOS.has(aspectRatio)) {
      return res.status(400).json({
        error: true,
        code: 'BAD_INPUT',
        message: `aspectRatio must be one of ${[...VALID_ASPECT_RATIOS].join(', ')}.`
      });
    }
    const count = Number(variations);
    if (!VALID_VARIATION_COUNTS.has(count)) {
      return res.status(400).json({
        error: true,
        code: 'BAD_INPUT',
        message: `variations must be one of ${[...VALID_VARIATION_COUNTS].join(', ')}.`
      });
    }

    const style = resolveStyle(styleId, customPrompt);
    if (!style || !style.promptTemplate || !style.promptTemplate.trim()) {
      return res.status(400).json({
        error: true,
        code: 'BAD_INPUT',
        message:
          styleId === CUSTOM_STYLE_ID ? 'Custom prompt is empty.' : 'Unknown style preset.'
      });
    }

    const styleName = style.name || styleId;

    const jobs = Array.from({ length: count }, (_, i) => {
      const prompt = buildPrompt({
        styleTemplate: style.promptTemplate,
        industry,
        variationIndex: i
      });
      return (async () => {
        const out = await generateImage({
          subjectImageDataUrl: subjectImage.dataUrl,
          prompt,
          aspectRatio
        });
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

    const variationsOut = settled.map((r, i) => {
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

    return res.status(200).json({ variations: variationsOut });
  } catch (err) {
    console.error('[api-handler] unexpected error:', err);
    return res
      .status(500)
      .json({ error: true, code: 'UNKNOWN', message: err?.message || 'Unexpected pipeline error.' });
  }
}

module.exports = {
  handleGenerateRequest: handleGenerate
};
