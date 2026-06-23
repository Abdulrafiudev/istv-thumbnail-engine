# CLAUDE.md — ISTV Thumbnail Engine

Single source of truth for this project. Keep this file current — append a brief note
to the **Change log** at the bottom whenever the codebase changes meaningfully.

---

## 1. What this is

Internal tool for **Inside Success TV (ISTV)** — a high-ticket B2B documentary-media
production company under Mawer Ventures. Editors use it to generate **cinematic,
photorealistic thumbnail / key-art variations** for documentary episodes, where the
subject is a paying client (entrepreneurs, thought leaders, celebrities) and must be
rendered as themselves in a stylised industry-appropriate scene.

Two non-negotiables drive every design decision:

1. **Cinematic scene quality** — Hollywood-grade lighting, composition, colour grading.
2. **Faithful subject likeness** — the client's face must be the client's face, not a
   morphed approximation.

---

## 2. Pipeline (single-stage Gemini)

```
Subject photo(s) ─┐
Prompt           ─┼─▶ Gemini 3 Pro Image (Nano Banana Pro)  ─▶  thumbnail
Aspect ratio     ─┘                │
                                   │ on transient failure
                                   ▼
                       Gemini 3.1 Flash Image (fallback)
                                   │
                                   ▼
                       response flagged with `isFallbackModel: true`
                       UI shows an amber "fallback model used" badge
```

* **Primary model:** `gemini-3-pro-image-preview` — top-tier reasoning + composition,
  native multi-reference character consistency (up to 14 ref images).
* **Fallback model:** `gemini-3.1-flash-image-preview` — automatically used if the
  primary model rate-limits or errors. The thumbnail card displays a visible badge
  in this case so the editor knows the top-tier model wasn't the one that ran.
* **Variations** (1, 3, or 5) run **in parallel** via `Promise.allSettled`, so one bad
  variation never kills the batch.
* Each call has 3-attempt exponential backoff on transient errors. Hard refusals
  (`AI_GEN_REFUSED`, `BAD_INPUT`) short-circuit retries.

---

## 3. Architecture preferences

These are standing conventions for all future development on this project:

* **Backend — MVC pattern.** Logic is separated into three layers:
  * `routes/` — Express router only. Maps HTTP verbs + paths to controller methods. No business logic.
  * `controllers/` — Handles `req`/`res`. Validates input, calls services, formats the response. No AI or data-access logic.
  * `services/` — Pure business logic. No Express. Independently testable.

* **Frontend — Component-based system.** Components live under `app/client/components/` grouped by domain:
  * `components/layout/` — Structural shell components (e.g. `SectionTitle`)
  * `components/form/` — Form atoms and molecules (e.g. `Toggle`, `StyleSelector`, `SavePresetModal`)
  * `components/gallery/` — Thumbnail display components (e.g. `PlaceholderCard`, `FullScreenViewer`)
  * Top-level `app/client/` files are page-level orchestrators only (`Dashboard.jsx`, `InputForm.jsx`, `ThumbnailGrid.jsx`, `ThumbnailCard.jsx`, `AssetUpload.jsx`, `GenerateButton.jsx`).

* **Separation of concerns is the priority.** Every file should have one clear job. When adding a feature, ask which layer it belongs to before writing code.

---

## 4. Stack

* **Server:** Node + Express (CommonJS), `@google/genai` SDK, `dotenv`, `cors`
* **Client:** React 18 + Vite, `file-saver`, inline-style components
* **Persistence:** browser `localStorage` (assets cap at 3, custom presets unlimited)

---

## 5. Directory structure

```
Thumbnail-generation-main/
├── .env                              ← local secrets (gitignored)
├── .env.example                      ← placeholder template
├── .gitignore
├── .gcloudignore                     ← excludes node_modules / .env / docs from Cloud Run uploads
├── .dockerignore                     ← mirror of .gcloudignore for Docker builds
├── render.yaml                       ← Render.com Blueprint (one-click deploy from GitHub)
├── CLAUDE.md                         ← this file (developer-only docs, not deployed)
├── ISTV_AI_Knowledge_Base.md         ← brand / org / product context (not deployed)
├── package.json                      ← dependencies, scripts, engines
├── package-lock.json
└── app/
    ├── server/                       ← MVC structure
    │   ├── index.js                  ← Express setup, middleware, server boot
    │   ├── routes/
    │   │   └── generate.routes.js    ← maps /api/generate + /api/health to controllers
    │   ├── controllers/
    │   │   └── generate.controller.js ← req/res handling + input validation
    │   └── services/
    │       ├── generation.service.js  ← variation orchestration (Promise.allSettled)
    │       ├── gemini.service.js      ← Gemini API calls + retry + fallback logic
    │       ├── prompt.service.js      ← bracketed-section prompt composition
    │       └── styles.service.js      ← 10 preset templates + resolveStyle()
    └── client/                       ← component-based structure
        ├── index.html, main.jsx, vite.config.js
        ├── brand.js                  ← colour tokens (ISTV black + gold)
        ├── constants.js              ← preset metadata, ratios, counts
        ├── api.js                    ← fetch wrapper for /api/generate
        ├── Dashboard.jsx             ← top-level layout + state orchestrator
        ├── AssetUpload.jsx           ← single-image drag-drop with canvas resize
        ├── InputForm.jsx             ← form orchestrator (composes form sub-components)
        ├── GenerateButton.jsx        ← gold CTA + contextual disabled hint
        ├── ThumbnailGrid.jsx         ← grid orchestrator (composes gallery sub-components)
        ├── ThumbnailCard.jsx         ← individual thumbnail card
        └── components/
            ├── layout/
            │   └── SectionTitle.jsx  ← gold-accent section header
            ├── form/
            │   ├── Toggle.jsx        ← reusable button-group toggle (ratio / count)
            │   ├── StyleSelector.jsx ← style dropdown + description
            │   └── SavePresetModal.jsx ← inline save-preset UI
            └── gallery/
                ├── PlaceholderCard.jsx  ← pulsing generation placeholder
                └── FullScreenViewer.jsx ← full-screen asset detail + download/delete
```

---

## 6. Running locally

```bash
cd "Thumbnail-generation-main"
npm install
npm run dev
```

Launches Express on `http://localhost:3001` and Vite on `http://localhost:5173`. Vite
proxies `/api/*` → `:3001` so the client calls the server without CORS friction.

Open **http://localhost:5173**.

### Available npm scripts

| Script              | What it does                                                          |
|---------------------|-----------------------------------------------------------------------|
| `npm run dev`       | Server (with `--watch`) + Vite client in parallel — local development |
| `npm run build`     | Compiles the client to `app/client/dist/`                             |
| `npm start`         | Runs the server only — also serves `app/client/dist/` if built. **Used by Cloud Run.** |
| `npm run server`    | Server only, no watch                                                 |
| `npm run server:dev`| Server only, with watch                                               |
| `npm run client`    | Vite client only                                                      |

---

## 5a. Pushing to GitHub

```bash
cd "Thumbnail-generation-main"
git init
git add .                   # .gitignore already excludes .env, node_modules, .claude/, etc.
git commit -m "Initial commit — ISTV thumbnail engine"
git branch -M main
git remote add origin git@github.com:<YOUR_USER>/<YOUR_REPO>.git
git push -u origin main
```

**Verify before pushing:** run `git status` and confirm `.env` is **not** in the
list of files to be added. The `.gitignore` is set up to exclude it, but always
double-check before the first push so the API key never lands in a public repo.

---

## 5b. Deploying to Render.com (temporary host)

The repo includes a [render.yaml](render.yaml) Blueprint that declares the entire
service in code, so deployment is one-click.

### Option A — Blueprint (recommended)

1. Push the repo to GitHub (see § 5a above).
2. Go to <https://dashboard.render.com> → **New** → **Blueprint**.
3. Connect your GitHub account, pick the repo. Render reads `render.yaml` and shows
   the service it will create. Click **Apply**.
4. The first deploy will fail because `GOOGLE_GENAI_API_KEY` isn't set yet. After
   the failed deploy, open the service → **Environment** → **Add Environment
   Variable** → key `GOOGLE_GENAI_API_KEY`, paste your real key, **Save Changes**.
   Render automatically redeploys.
5. Once the build finishes (~2 min), the service is live at
   `https://istv-thumbnail-engine.onrender.com` (or whatever URL Render assigns).

### Option B — Manual web service

If you prefer to skip the Blueprint:

1. Render dashboard → **New** → **Web Service** → connect the GitHub repo.
2. Configure:
   * **Runtime:** Node
   * **Build Command:** `npm install --include=dev && npm run build`
   * **Start Command:** `npm start`
   * **Plan:** Free (or Starter if you want no cold starts)
   * **Region:** Oregon (or whichever is closest to your users)
3. **Environment Variables** section — add:
   * `GOOGLE_GENAI_API_KEY` → your real key
   * `NODE_VERSION` → `20`
4. Click **Create Web Service**. Wait ~2 min for first build.

### Free-tier caveats

* **Cold starts.** The free plan spins the service down after 15 min of inactivity.
  The first request after that takes ~30 sec while the service wakes up. Subsequent
  requests are instant.
* **750 hours/month** is the free quota (more than enough for a single service).
* **No persistent disk** — fine for this app, generated images are returned inline,
  nothing is written to disk.

### Auto-deploy on push

`autoDeploy: true` in `render.yaml` means every `git push` to `main` triggers a new
build automatically. Disable it in the Render dashboard if you'd prefer manual
deploys.

---

## 5c. Deploying to Google Cloud Run

The Express server in [app/server/index.js](app/server/index.js) doubles as a static
file server: when `app/client/dist/` exists (i.e. after `npm run build`), it serves
the React bundle from the same origin as the API. **One container, one port — no
CORS, no separate static-host service.**

### One-time setup

1. Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install) and authenticate:
   `gcloud auth login` and `gcloud config set project <PROJECT_ID>`.
2. Enable Cloud Run + Cloud Build:
   `gcloud services enable run.googleapis.com cloudbuild.googleapis.com`.

### Deploy

From the project root:

```bash
gcloud run deploy istv-thumbnail-engine \
  --source . \
  --region us-west1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_GENAI_API_KEY=YOUR_KEY_HERE
```

What happens:

* `gcloud` reads `.gcloudignore` and uploads only the source tree (excludes
  `node_modules/`, `.env`, `CLAUDE.md`, `.git/`, etc.).
* Cloud Run buildpacks detect Node.js (via `package.json`'s `engines.node: >=20`),
  run `npm ci`, `npm run build`, and start the container with `npm start`.
* Express binds to `process.env.PORT` (Cloud Run injects this) and serves both
  `/api/*` and the static React client.

### Important env-var rule

**Never bake `GOOGLE_GENAI_API_KEY` into the source tree.** Always pass it via
`--set-env-vars` at deploy time, or set it once in the Cloud Run service config
(Console → Service → Edit → Variables & Secrets → Reference Secret Manager). The
local `.env` file is excluded by `.gcloudignore` for this exact reason.

### Cost-minimisation knobs (set after first deploy via the Console)

* **Min instances: 0** (default) — scales to zero when idle, you pay nothing
  between requests.
* **Memory: 512 MiB** is plenty (`@google/genai` + Express has a small footprint).
* **CPU: 1**, **Concurrency: 80** — the server is mostly waiting on Gemini API
  responses, so each instance can serve many concurrent requests cheaply.
* **Request timeout: 120 s** — Gemini Pro calls can take 20–40 s per variation,
  and 5 variations run in parallel inside one request.

---

## 6. Environment variables

Live in `Thumbnail-generation-main/.env` (gitignored). Template in `.env.example`.

| Variable                  | Required | Default                              | Notes                                    |
|---------------------------|----------|--------------------------------------|------------------------------------------|
| `GOOGLE_GENAI_API_KEY`    | yes      | —                                    | https://aistudio.google.com/             |
| `GEMINI_PRIMARY_MODEL`    | no       | `gemini-3-pro-image-preview`         | Override the top-tier model              |
| `GEMINI_FALLBACK_MODEL`   | no       | `gemini-3.1-flash-image-preview`     | Override the fallback model              |
| `PORT`                    | no       | `3001`                               | Express port                             |

`.env` changes require a server restart (`Ctrl+C` then `npm run dev` again).

---

## 7. API contract

### `POST /api/generate`

**Request body:**

```json
{
  "subjectImage": { "dataUrl": "data:image/jpeg;base64,...", "mimeType": "image/jpeg" },
  "styleId":      "black-gold-editorial",
  "customPrompt": "",
  "industry":     "Luxury Real Estate",
  "aspectRatio":  "16:9",
  "variations":   3
}
```

| Field            | Required | Notes                                                                 |
|------------------|----------|-----------------------------------------------------------------------|
| `subjectImage`   | yes      | `{ dataUrl, mimeType }`. The single subject reference photo. Max upload ~50 MB. |
| `styleId`        | yes      | A default preset ID, a user-saved preset ID, or `"custom"`.           |
| `customPrompt`   | only if `styleId === "custom"` | Raw prompt text; must not be empty.             |
| `industry`       | yes      | Free text. Substituted into `{{INDUSTRY}}` in the preset template.    |
| `aspectRatio`    | yes      | `"3:4"`, `"16:9"`, or `"9:16"`.                                       |
| `variations`     | yes      | `1`, `3`, or `5`.                                                     |

**Success response (HTTP 200):**

```json
{
  "variations": [
    {
      "id":              "l1v3m2h-ab7x9c",
      "imageDataUrl":    "data:image/png;base64,...",
      "promptUsed":      "[SUBJECT CONSTRAINTS] ... [BACKGROUND] ... [COMPOSITION] ...",
      "industry":        "Luxury Real Estate",
      "styleName":       "Black & Gold Editorial",
      "aspectRatio":     "16:9",
      "modelUsed":       "gemini-3-pro-image-preview",
      "isFallbackModel": false
    }
  ]
}
```

**Per-variation error shape** (batch still returns HTTP 200; the bad variation just
has `error: true`):

```json
{ "id": "...", "error": true, "code": "AI_GEN_REFUSED", "message": "Gemini refused: SAFETY",
  "industry": "...", "styleName": "...", "aspectRatio": "16:9" }
```

**Top-level 4xx/5xx error shape** (input validation or uncaught pipeline failure):

```json
{ "error": true, "code": "BAD_INPUT", "message": "Industry is required." }
```

### `GET /api/health`

Returns `{ "status": "ok" }`.

---

## 8. Prompt construction

Every final prompt sent to Gemini is composed by
[app/server/prompt-builder.js](app/server/prompt-builder.js) as **5 bracketed
sections** joined with blank-line separators. Gemini 3 Pro responds measurably better
to explicit `[SECTION]`-tagged directives than to flowing prose.

```
[SUBJECT CONSTRAINTS] (CRITICAL — DO NOT ALTER): ...universal identity lock...

[BACKGROUND]: ...style preset content...
[SOURCE PHOTO INTEGRATION]: ...style preset content...
[LIGHTING]: ...style preset content...
[ATMOSPHERE]: ...style preset content...

[COMPOSITION]: <variation-index-specific composition line>.

[STYLE]: <universal quality suffix>.

[TEXT CONSTRAINT]: <universal no-text block>.
```

* **Universal blocks** (SUBJECT CONSTRAINTS, COMPOSITION, STYLE, TEXT CONSTRAINT) live
  in `prompt-builder.js`. Same for every preset and every call — DRY.
* **Per-preset blocks** (BACKGROUND / SOURCE PHOTO INTEGRATION / LIGHTING / ATMOSPHERE)
  live in `default-styles.js`. ~150–250 words each.
* **Composition variants** cycle per variation index: close-up → medium → wide →
  low-angle hero → over-the-shoulder.

### Why prompts never describe facial features

Style presets describe **mood, lighting, wardrobe, environment, camera/lens, colour
grade, posture, composition** — never facial features. The SUBJECT CONSTRAINTS block
is the only thing that references the subject and it's universal: *"remain 100%
identical to the uploaded reference photo(s)"*. This keeps every preset portable
between any client.

---

## 9. Default style preset library

10 presets defined server-side in [app/server/default-styles.js](app/server/default-styles.js),
mirrored client-side (metadata only) in [app/client/constants.js](app/client/constants.js).
Every preset uses the `{{INDUSTRY}}` placeholder so a single preset works across
documentary episodes in any vertical.

| ID                       | Name                     | Vibe                                                         |
|--------------------------|--------------------------|--------------------------------------------------------------|
| *(none)*                 | **Custom Prompt**        | **Default selection.** Write any prompt from scratch.        |
| `black-gold-editorial`   | Black & Gold Editorial   | ISTV signature — obsidian + warm gold rim, GQ-tier feel      |
| `cinematic-gold`         | Cinematic Gold           | Golden-hour luxury exec, medium-format Vanity Fair look      |
| `legacy-makers-cover`    | Legacy Makers Cover      | Forbes / Entrepreneur magazine cover, masthead negative space |
| `documentary-keyart`     | Documentary Keyart       | Netflix / HBO doc poster — chiaroscuro, teal-and-orange grade |
| `boardroom-power`        | Boardroom Power          | Skyline boardroom at blue hour, Fortune 500 C-suite gravitas |
| `red-carpet-premiere`    | Red Carpet Premiere      | Paparazzi flashbulbs, Vanity Fair Oscars-night feel          |
| `luxury-lifestyle`       | Luxury Lifestyle         | Yacht / penthouse / exotic garage, Robb Report aesthetic     |
| `keynote-stage`          | Keynote Stage            | TEDx spotlight, audience bokeh, Summit-series key-art        |
| `gritty-founder`         | Gritty Founder           | Warehouse dawn, Social Network / Uncut Gems grade            |
| `modern-corporate`       | Modern Corporate         | Harvard Business Review clean editorial studio               |

Users can save their own custom prompts as named presets (persisted in `localStorage`
under `istv.customPresets`); they appear grouped under **"My Saved Styles"** in the
dropdown.

---

## 10. UI behaviour

* **Sidebar layout:** Logo → `1. Upload Subject` → `2. Style, Industry & Output` →
  Generate.
* **Single-image subject upload.** One reference photo per subject. Drag-drop or click
  to upload; preview tile shows the loaded image with a `REMOVE` button.
* **Client-side image resize.** Every uploaded file is canvas-downscaled to 1024px
  max dim and re-encoded as JPEG at quality 0.88 before being sent to the server.
  Faster uploads, cleaner input for Gemini.
* **Default form state:** Custom Prompt selected, empty custom prompt, empty industry,
  `16:9`, `3` variations.
* **Generate button** is disabled until subject + industry + (custom prompt if custom
  is selected) are all filled. The disabled-state hint adapts to whichever field is
  missing first.
* **Asset persistence:** last 3 generated assets + all user-saved custom presets
  persist in `localStorage`. Subject images are intentionally **not** persisted (they
  are ephemeral per-generation input).
* **Model-fallback badge.** When the primary Gemini 3 Pro model fails and the response
  comes from Gemini 3.1 Flash instead, the thumbnail card and full-screen viewer both
  display an amber badge: *"⚠ Fallback model — Gemini 3.1 Flash used (Gemini 3 Pro
  unavailable)"*. When the primary model runs successfully, no badge appears.

---

## 11. Troubleshooting

| Symptom                                            | Likely cause                                  | Fix                                                                |
|----------------------------------------------------|-----------------------------------------------|--------------------------------------------------------------------|
| `⚠ NOT SET` in startup banner                      | `.env` has placeholder value                  | Paste your real `GOOGLE_GENAI_API_KEY`, restart server             |
| All variations fail with `AI_GEN_REFUSED`          | Gemini blocking the prompt (safety filter)    | Soften prompt; try a different style preset; confirm model name    |
| Every thumbnail shows the fallback model badge     | Primary Gemini 3 Pro is rate-limiting / down  | Wait, regenerate. Persistent? Check Google AI Studio status        |
| Generate button stays disabled                     | Missing photo / industry / custom prompt      | The button's hint line names the missing field                     |
| `Server returned a non-JSON response... "Not Found"` on Render | Service is a Static Site, not a Web Service, so no Node process is running | In Render dashboard verify the service is **Web Service** (not Static Site); if wrong, delete and recreate via the `render.yaml` Blueprint. Test `<URL>/api/health` — should return `{"status":"ok"}` |
| Dev server crash on `npm run dev`                  | Running from wrong directory                  | `cd Thumbnail-generation-main && npm run dev`                      |
| `QuotaExceededError` in browser console            | `localStorage` full of large base64 assets    | Handled by `safePersist` — oldest assets dropped automatically     |

---

## 12. Change log

Append every material change with **date, scope, rationale**. Newest first.

### 2026-04-27 — Render.com deployment readiness + GitHub workflow

* **Added `render.yaml` Blueprint** so the entire Render service config (runtime,
  build/start commands, env vars, health check, auto-deploy) is declared in code.
  One-click deploy from GitHub via Render → New → Blueprint.
* **Updated `.gitignore`** to also exclude `.env.local`, `.claude/`, `.vscode/`,
  `.idea/` so personal IDE state and any extra local secret files never get pushed.
* **CLAUDE.md** — added § 5a "Pushing to GitHub" with safe-push checklist, § 5b
  "Deploying to Render.com" with both Blueprint and manual paths, and renumbered
  Cloud Run instructions to § 5c (still valid for the eventual prod migration).
* **Zero code changes.** No image-generation logic touched. Same Express server,
  same single-container architecture used for both Render and Cloud Run.

### 2026-04-27 — Reverted to single-image subject upload

* **What:** Removed the multi-reference upload feature. The upload tile now accepts
  exactly one subject photo per generation (drag-drop or click, preview with REMOVE
  button). Per the manager's call: when faithful identity is the priority, a single
  clean reference performs as well as or better than multi-reference for our use case.
* **Server contract simplified:** request body is `subjectImage: { dataUrl, mimeType }`
  again (no array). `generateImage()` takes `subjectImageDataUrl` (single string).
  `referenceCount` field is gone from variation responses; `MAX_SUBJECT_IMAGES` is
  gone from client constants.
* **What was kept:** the canvas-based client-side resize (1024px max, JPEG 0.88) —
  that's a transport/quality optimisation independent of multi-image handling.
* **What was NOT touched:** Gemini 3 Pro pipeline, prompt structure, all 10 default
  presets, model-fallback badge, Custom Prompt default, Cloud Run deploy setup. Image
  quality is unchanged.
* **Files touched:** `app/server/ai-generation-handler.js`, `app/server/api-handler.js`,
  `app/client/AssetUpload.jsx`, `app/client/Dashboard.jsx`, `app/client/constants.js`,
  `app/client/ThumbnailGrid.jsx`, this file.

### 2026-04-25 — Production-ready: single-container deploy + lean Cloud Run uploads

* **What:** Made the project deploy-ready for Google Cloud Run while keeping the local
  dev experience identical. No image-quality logic was changed — same Gemini calls,
  same prompts, same UI behaviour.
* **Express now serves the built client** (`app/client/dist/`) when it exists, so a
  single Cloud Run container handles both the API and the React UI. In dev (no
  `dist/`), Express stays API-only and Vite serves the client at :5173 as before.
  Server startup banner shows `Mode: production` or `Mode: development` accordingly.
* **Added `.gcloudignore` + `.dockerignore`** — the local folder still has 6,000+
  files because of `node_modules/`, but the upload to Cloud Run only ships ~17
  source files. Excludes `node_modules/`, `.env`, `app/client/dist/`, `.claude/`,
  `CLAUDE.md`, `ISTV_AI_Knowledge_Base.md`, `.git/`, OS junk.
* **`package.json` updates:** added `"start": "node app/server/index.js"` (used by
  Cloud Run), added `"engines": { "node": ">=20" }` so buildpacks select the right
  Node runtime, removed redundant `install:all` alias.
* **`.gitignore` updated:** added `app/client/dist/` so the build output never
  leaks into commits.
* **Deleted:** `test_portrait.jpg` (6 MB unused test asset). User can re-add any
  photo for testing locally; doesn't affect deployment.
* **CLAUDE.md:** added a "Deploying to Cloud Run" section (§ 5a) with one-command
  deploy, env-var handling, and cost-minimisation knobs.

### 2026-04-25 — Project file cleanup (no code changes)

* **Deleted:** `.DS_Store` (root + `app/`), `output/` (empty directory left over from
  the old to-disk PNG pipeline; current pipeline returns base64 inline), `README.md`
  (placeholder from the original GitHub repo with no real content).
* **Updated:** `.gitignore` — removed the now-stale `output/*.png` line.
* **Untouched:** all source files (`app/server/*`, `app/client/*`), `package.json`,
  `package-lock.json`, `.env`, `.env.example`, `node_modules`, `.claude/`,
  `ISTV_AI_Knowledge_Base.md`, `test_portrait.jpg`.
* **Verified:** every remaining file traced back to an active import / runtime
  reference. Server still boots cleanly.

### 2026-04-25 — InstantID removed; pipeline is single-stage Gemini

* **What:** Removed all InstantID / Replicate code, env vars, dependencies, fallback
  flags, and UI banners. The hybrid pipeline never produced better output than Gemini
  alone, so it has been retired entirely. The pipeline is now: Gemini 3 Pro Image
  primary → Gemini 3.1 Flash Image fallback. Identity is preserved via Gemini 3 Pro's
  native multi-reference character consistency.
* **What replaced the old "identity fallback" UI:** A new amber **"⚠ Fallback model"**
  badge appears on any thumbnail produced by the Flash fallback rather than the Pro
  primary, naming exactly which model ran. When Pro succeeds, no badge appears.
* **Response shape change:** `identityGuaranteed`, `fallbackReason`, and
  `providersUsed` are gone. Replaced by `modelUsed` (string) and `isFallbackModel`
  (boolean). `referenceCount` is unchanged.
* **Files touched:** `app/server/ai-generation-handler.js` (full rewrite, slim),
  `app/server/api-handler.js` (response shape), `app/server/prompt-builder.js`
  (dropped `NEGATIVE_PROMPT`), `app/server/index.js` (banner), `app/client/ThumbnailCard.jsx`
  (badge), `app/client/ThumbnailGrid.jsx` (viewer + badge), `.env`, `.env.example`,
  `package.json` (removed `replicate`), this file (slimmed end-to-end).

### 2026-06-23 — Full MVC + component-based refactor (no feature changes)

* **Backend restructured to MVC.** The flat `app/server/` files are reorganised into three clear layers:
  * `routes/generate.routes.js` — Express router only, maps paths to controller methods.
  * `controllers/generate.controller.js` — req/res handling + input validation (was `api-handler.js`).
  * `services/generation.service.js` — variation orchestration (`Promise.allSettled` loop).
  * `services/gemini.service.js` — Gemini API calls, retry logic, fallback (was `ai-generation-handler.js`).
  * `services/prompt.service.js` — prompt composition (was `prompt-builder.js`).
  * `services/styles.service.js` — preset library + `resolveStyle()` (was `default-styles.js`).
  * Old flat files retained as thin re-export shims for backwards compatibility.
* **Frontend restructured to component-based system.** Sub-components extracted from large files into `app/client/components/` grouped by domain:
  * `components/layout/SectionTitle.jsx` — extracted from `Dashboard.jsx`.
  * `components/form/Toggle.jsx`, `StyleSelector.jsx`, `SavePresetModal.jsx` — extracted from `InputForm.jsx`.
  * `components/gallery/PlaceholderCard.jsx`, `FullScreenViewer.jsx` — extracted from `ThumbnailGrid.jsx`.
* **Zero behaviour changes.** Same Gemini pipeline, same prompts, same UI, same API contract.
* **CLAUDE.md** — added § 3 "Architecture preferences" documenting MVC + component conventions as standing rules, updated directory structure map.
