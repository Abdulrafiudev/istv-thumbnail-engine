'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const path    = require('path');
const fs      = require('fs');
const express = require('express');
const cors    = require('cors');
const generateRoutes = require('./routes/generate.routes');
const { GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL } = require('./services/gemini.service');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));

app.use('/api', generateRoutes);

const distPath  = path.resolve(__dirname, '../client/dist');
const distExists = fs.existsSync(path.join(distPath, 'index.html'));
if (distExists) {
  app.use(express.static(distPath));
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
