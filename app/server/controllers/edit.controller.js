'use strict';

const { editImage, bufferToDataUrl } = require('../services/imageEdit.service');

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function edit(req, res) {
  try {
    const { imageDataUrl, maskDataUrl, instruction, meta } = req.body || {};

    if (!imageDataUrl) {
      return res.status(400).json({ error: true, code: 'BAD_INPUT', message: 'imageDataUrl is required.' });
    }
    if (!instruction?.trim()) {
      return res.status(400).json({ error: true, code: 'BAD_INPUT', message: 'instruction is required.' });
    }

    const result = await editImage({ imageDataUrl, maskDataUrl: maskDataUrl || null, instruction });

    return res.status(200).json({
      id:             randomId(),
      imageDataUrl:   bufferToDataUrl(result.buffer, result.mimeType),
      instruction:    instruction.trim(),
      modelUsed:      result.modelUsed,
      isFallbackModel: result.isFallbackModel,
      // Carry through metadata from the original asset so the edited version
      // can be added to the library with the same labels.
      industry:       meta?.industry    || '',
      styleName:      meta?.styleName   || 'Edited',
      aspectRatio:    meta?.aspectRatio || '16:9'
    });
  } catch (err) {
    console.error('[edit.controller] error:', err);
    return res.status(500).json({ error: true, code: err.code || 'UNKNOWN', message: err.message || 'Edit failed.' });
  }
}

module.exports = { edit };
