'use strict';

const { resolveStyle, CUSTOM_STYLE_ID } = require('../services/styles.service');
const { runVariations } = require('../services/generation.service');

const VALID_ASPECT_RATIOS = new Set(['3:4', '16:9', '9:16']);
const VALID_VARIATION_COUNTS = new Set([1, 3, 5]);
const VALID_INTENSITY = new Set(['Low', 'Medium', 'High']);
const VALID_TEMPERATURE = new Set(['Cool', 'Neutral', 'Warm']);
const VALID_COMPOSITION = new Set(['Tight', 'Balanced', 'Wide']);

const FINE_TUNE_DEFAULTS = { intensity: 'Medium', temperature: 'Neutral', composition: 'Balanced' };

function normaliseFineTune(raw) {
  if (!raw || typeof raw !== 'object') return FINE_TUNE_DEFAULTS;
  return {
    intensity:   VALID_INTENSITY.has(raw.intensity)     ? raw.intensity   : FINE_TUNE_DEFAULTS.intensity,
    temperature: VALID_TEMPERATURE.has(raw.temperature) ? raw.temperature : FINE_TUNE_DEFAULTS.temperature,
    composition: VALID_COMPOSITION.has(raw.composition) ? raw.composition : FINE_TUNE_DEFAULTS.composition
  };
}

async function generate(req, res) {
  try {
    const { subjectImages, subjectImage, styleId, customPrompt, industry, aspectRatio, variations, fineTune } = req.body || {};

    // Accept both the new array form and the legacy single-image form.
    const images = Array.isArray(subjectImages) && subjectImages.length > 0
      ? subjectImages
      : subjectImage?.dataUrl
        ? [subjectImage]
        : null;

    if (!images || images.length === 0) {
      return res.status(400).json({ error: true, code: 'BAD_INPUT', message: 'At least one subject image is required.' });
    }
    if (images.length > 4) {
      return res.status(400).json({ error: true, code: 'BAD_INPUT', message: 'Maximum 4 subject images allowed.' });
    }
    if (images.some((img) => !img.dataUrl)) {
      return res.status(400).json({ error: true, code: 'BAD_INPUT', message: 'Each subject image must have a dataUrl.' });
    }
    if (!industry || !String(industry).trim()) {
      return res.status(400).json({ error: true, code: 'BAD_INPUT', message: 'Industry is required.' });
    }
    if (!VALID_ASPECT_RATIOS.has(aspectRatio)) {
      return res.status(400).json({ error: true, code: 'BAD_INPUT', message: `aspectRatio must be one of ${[...VALID_ASPECT_RATIOS].join(', ')}.` });
    }
    const count = Number(variations);
    if (!VALID_VARIATION_COUNTS.has(count)) {
      return res.status(400).json({ error: true, code: 'BAD_INPUT', message: `variations must be one of ${[...VALID_VARIATION_COUNTS].join(', ')}.` });
    }

    const style = resolveStyle(styleId, customPrompt);
    if (!style || !style.promptTemplate || !style.promptTemplate.trim()) {
      return res.status(400).json({
        error: true,
        code: 'BAD_INPUT',
        message: styleId === CUSTOM_STYLE_ID ? 'Custom prompt is empty.' : 'Unknown style preset.'
      });
    }

    const variationsOut = await runVariations({
      subjectImages: images,
      style,
      industry: String(industry).trim(),
      aspectRatio,
      count,
      fineTune: normaliseFineTune(fineTune)
    });

    return res.status(200).json({ variations: variationsOut });
  } catch (err) {
    console.error('[generate.controller] unexpected error:', err);
    return res.status(500).json({ error: true, code: 'UNKNOWN', message: err?.message || 'Unexpected pipeline error.' });
  }
}

function health(_req, res) {
  res.json({ status: 'ok' });
}

module.exports = { generate, health };
