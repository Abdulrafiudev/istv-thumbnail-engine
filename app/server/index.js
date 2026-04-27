'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const path    = require('path');
const fs      = require('fs');
const express = require('express');
const cors    = require('cors');
const { handleGenerateRequest } = require('./api-handler');
const { GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL } = require('./ai-generation-handler');

const app  = express();
const PORT = process.env.PORT || 3001;

// CORS only matters in dev (Vite serves the client at :5173 → API at :3001).
// In production the built client is served from the same Express origin,
// so cross-origin headers are unnecessary.
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));

// --- API routes ---
app.post('/api/generate', handleGenerateRequest);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// --- Static client (production) ---
// When `npm run build` has produced app/client/dist, serve it from this same
// Express process so a single Cloud Run container handles both API and UI.
// In dev, dist doesn't exist — Vite serves the client at :5173 with a /api proxy.
const distPath = path.resolve(__dirname, '../client/dist');
const distExists = fs.existsSync(path.join(distPath, 'index.html'));
if (distExists) {
  app.use(express.static(distPath));
  // SPA fallback: any non-API GET returns index.html so client-side routing works.
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  const geminiOk = process.env.GOOGLE_GENAI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY.includes('your_');
  console.log(`\n[ISTV] Server running → http://localhost:${PORT}`);
  console.log(`[ISTV] Mode:           ${distExists ? 'production (serving built client)' : 'development (API only — Vite serves client)'}`);
  console.log(`[ISTV] Primary model:  ${GEMINI_PRIMARY_MODEL}`);
  console.log(`[ISTV] Fallback model: ${GEMINI_FALLBACK_MODEL}`);
  console.log(`[ISTV] Gemini key:     ${geminiOk ? '✓ loaded' : '⚠ NOT SET — add GOOGLE_GENAI_API_KEY to .env'}\n`);
});
