'use strict';

const COMPOSITION_VARIANTS = [
  'close-up portrait framing, shoulders and head, tight editorial crop',
  'medium shot, head to mid-chest, balanced symmetrical composition',
  'wide environmental shot, full upper body with visible background context',
  'dramatic low-angle hero shot, subject elevated with powerful posture',
  'over-the-shoulder angled composition, subject looking back toward camera'
];

const SUBJECT_CONSTRAINTS =
  '[SUBJECT CONSTRAINTS] (CRITICAL — DO NOT ALTER): The subject must remain 100% identical to the uploaded reference photo(s). ' +
  'Preserve exact facial features, bone structure, skin tone, ethnicity, hair style and colour, facial hair, age, eye colour, and body proportions. ' +
  'Do not morph, smooth, stylize, retouch, slim, age, de-age, or beautify the subject in any way. ' +
  'If multiple reference photos are provided, use all of them to reinforce identity — never blend with a different person. ' +
  'This is a paying ISTV documentary client; their likeness is contractual and must be exact. ' +
  'Exact likeness takes priority over every other instruction in this prompt.';

const QUALITY_SUFFIX =
  'semi-photorealistic with cinematic documentary production value, 4K resolution, ' +
  'ultra-realistic Hollywood-grade lighting, sharp focus on the eyes, natural skin texture preserved (no plastic skin, no over-smoothing), ' +
  'high dynamic range, subtle organic film grain, shot on a premium cinema camera with a fast prime lens';

const TEXT_CONSTRAINT =
  'Do not include any text, titles, watermarks, logos, typography, words, letters, numbers, captions, subtitles, or writing anywhere in the image. ' +
  'The image must be completely free of written or graphic-text elements. Any signage, banners, or branding surfaces in the background must be rendered blank.';

const FINE_TUNE_MAP = {
  intensity: {
    Low:    'Subdued cinematic feel — soft even lighting, low contrast, gentle shadows, understated drama. Balanced and editorial rather than expressive.',
    Medium: 'Moderate cinematic treatment — well-defined shadows, natural contrast, intentional lighting direction. Neither flat nor extreme.',
    High:   'Maximum cinematic drama — deep shadows, high contrast, strong directional lighting, pronounced vignette, expressionistic colour grade.'
  },
  temperature: {
    Cool:    'Colour grade biased cool — teal and blue shadow tones, crisp desaturated highlights, controlled and modern aesthetic.',
    Neutral: 'Balanced colour temperature — accurate skin tones, no colour cast, true-to-life grading with subtle warmth in highlights only.',
    Warm:    'Colour grade biased warm — amber and golden shadow tones, honey highlights, rich warm midtones, luxurious and inviting feel.'
  },
  composition: {
    Tight:    'Tight framing — close-up to medium shot, face and shoulders dominant, subject fills most of the frame, intimate and direct.',
    Balanced: 'Balanced framing — subject centred with moderate breathing room, contextual background visible but not overwhelming.',
    Wide:     'Wide environmental framing — subject occupies roughly one-third of the frame, environment and atmosphere given generous space.'
  }
};

function buildFineTuneSection(fineTune) {
  if (!fineTune) return null;
  const { intensity, temperature, composition } = fineTune;
  const lines = [];
  if (intensity && FINE_TUNE_MAP.intensity[intensity]) lines.push(`Intensity: ${FINE_TUNE_MAP.intensity[intensity]}`);
  if (temperature && FINE_TUNE_MAP.temperature[temperature]) lines.push(`Colour Temperature: ${FINE_TUNE_MAP.temperature[temperature]}`);
  if (composition && FINE_TUNE_MAP.composition[composition]) lines.push(`Composition Tightness: ${FINE_TUNE_MAP.composition[composition]}`);
  if (!lines.length) return null;
  return `[FINE-TUNE]: ${lines.join(' ')}`;
}

function buildPrompt({ styleTemplate, industry, variationIndex, fineTune }) {
  if (!styleTemplate || typeof styleTemplate !== 'string') {
    throw new Error('buildPrompt: styleTemplate is required');
  }
  const cleanIndustry = (industry || '').trim() || 'business';
  const filled = styleTemplate.replace(/\{\{\s*INDUSTRY\s*\}\}/gi, cleanIndustry).trim();
  const composition = COMPOSITION_VARIANTS[variationIndex % COMPOSITION_VARIANTS.length];
  const fineTuneSection = buildFineTuneSection(fineTune);

  const sections = [
    SUBJECT_CONSTRAINTS,
    filled,
    fineTuneSection,
    `[COMPOSITION]: ${composition}.`,
    `[STYLE]: ${QUALITY_SUFFIX}.`,
    `[TEXT CONSTRAINT]: ${TEXT_CONSTRAINT}`
  ].filter(Boolean);

  return sections.join('\n\n');
}

module.exports = { buildPrompt, COMPOSITION_VARIANTS, QUALITY_SUFFIX, SUBJECT_CONSTRAINTS, TEXT_CONSTRAINT, FINE_TUNE_MAP };
