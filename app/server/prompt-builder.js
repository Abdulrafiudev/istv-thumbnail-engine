'use strict';

// Bracketed-section prompt composition for Gemini 3 Pro Image.
// Gemini 3 Pro responds measurably better to explicit [SECTION]-tagged directives
// than to flowing prose, so every generated prompt is composed of discrete sections.
// The SUBJECT CONSTRAINTS block, composition variant, style suffix, and text constraint
// are universal — appended here so the 10 preset templates only contain style-specific
// content (BACKGROUND / SOURCE PHOTO INTEGRATION / LIGHTING / ATMOSPHERE).

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

function buildPrompt({ styleTemplate, industry, variationIndex }) {
  if (!styleTemplate || typeof styleTemplate !== 'string') {
    throw new Error('buildPrompt: styleTemplate is required');
  }
  const cleanIndustry = (industry || '').trim() || 'business';
  const filled = styleTemplate.replace(/\{\{\s*INDUSTRY\s*\}\}/gi, cleanIndustry).trim();
  const composition = COMPOSITION_VARIANTS[variationIndex % COMPOSITION_VARIANTS.length];

  return [
    SUBJECT_CONSTRAINTS,
    filled,
    `[COMPOSITION]: ${composition}.`,
    `[STYLE]: ${QUALITY_SUFFIX}.`,
    `[TEXT CONSTRAINT]: ${TEXT_CONSTRAINT}`
  ].join('\n\n');
}

module.exports = {
  buildPrompt,
  COMPOSITION_VARIANTS,
  QUALITY_SUFFIX,
  SUBJECT_CONSTRAINTS,
  TEXT_CONSTRAINT
};
