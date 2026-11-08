<div align="center">

# 🛠️ ToolHub 5D

### 200+ Free Online Tools — AI, PDF, Image, Games, Health, Finance & More

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/toolhub5d/deploys)
![Version](https://img.shields.io/badge/version-1.0.0-indigo)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

**No signup. No ads. 100% free. Works offline (PWA).**

[🌐 Live Demo](https://toolhub.app) · [🐛 Report Bug](https://toolhub.app/#feedback) · [💡 Request Feature](https://toolhub.app/#feedback)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Netlify Functions](#netlify-functions)
- [Supabase Setup](#supabase-setup)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## About

ToolHub 5D is a production-ready, static Progressive Web App (PWA) hosting 200+ free online tools across 10+ categories. Built with vanilla HTML, CSS, and JavaScript — no framework, no build step, instant deploy to Netlify.

---

## Features

| Category | Tools |
|---|---|
| 🤖 AI Tools | Resume Builder, Blog Writer, AI Chat, Translator, Grammar Checker |
| 📄 PDF Tools | Merge, Split, Compress, Convert, Sign |
| 🖼️ Image Tools | Resize, Compress, Convert, OCR, Background Remover |
| 💰 Finance | EMI Calculator, Currency Converter, SIP, Tax, Budget Planner |
| 🏥 Health | BMI, TDEE, Calorie Counter, Heart Rate, Sleep Tracker |
| 👨‍💻 Developer | JSON Formatter, Base64, Regex Tester, Color Picker, UUID |
| 🔤 Text Tools | Word Count, Case Converter, Diff Checker, Lorem Ipsum |
| 🎮 Games | 17+ mini-games including Chess, Sudoku, Snake, Tetris |
| 🔐 Security | Password Generator, Hash Generator, Encryption |
| 📐 Converters | Unit, Number System, Roman Numerals, Timezone |

**Additional:**
- 🔍 Voice search (Web Speech API)
- ⭐ Favorites sync (local + Supabase)
- 🕐 Recent history
- 🌙 Dark/light theme
- 📱 PWA — installable, works offline
- 🌐 SEO optimised with structured data (JSON-LD)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES2022) |
| Auth & DB | Supabase (Auth + PostgreSQL) |
| AI | AI Assistant API via Netlify Function |
| OCR | OCR.space API via Netlify Function |
| Hosting | Netlify (static + serverless functions) |
| PWA | Service Worker, Web App Manifest |
| Libraries | Supabase JS v2, jsPDF, html2canvas, QRCode.js, SortableJS |

---

## Project Structure

```
toolhub5d/
├── index.html                  # Single-page app shell
├── css/
│   └── style.css               # All styles (57KB)
├── js/
│   ├── app.js                  # Main app controller, navigation, feedback
│   ├── auth.js                 # Supabase auth, session, inactivity logout
│   ├── supabase-client.js      # Supabase init (reads from window.__env)
│   ├── tools.js                # All 200+ tool renderers
│   ├── tools-data.js           # Tool metadata (id, name, icon, category)
│   └── games.js                # 17+ game implementations
├── netlify/
│   └── functions/
│       ├── groq-chat.js        # 🔒 AI service proxy (hides API key)
│       ├── ocr.js              # 🔒 OCR proxy (hides OCR_API_KEY)
│       └── env-config.js       # Serves public Supabase config to browser
├── assets/
│   ├── og-image.png            # Open Graph image
│   └── icons/                  # PWA icons (72px → 512px)
├── sw.js                       # Service Worker (cache + offline)
├── manifest.json               # PWA manifest
├── netlify.toml                # Netlify config, headers, redirects
├── _redirects                  # SPA fallback routing
├── robots.txt                  # SEO crawl rules
├── sitemap.xml                 # SEO sitemap
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── package.json                # Project metadata and scripts
├── README.md                   # This file
└── SETUP.md                    # Detailed production setup guide
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) — `npm install -g netlify-cli`
- A [Supabase](https://supabase.com) project (free tier is fine)
- An AI API key
- An [OCR.space](https://ocr.space/ocrapi) API key (free)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-username/toolhub5d.git
cd toolhub5d

# 2. Install Netlify CLI (dev dependency)
npm install

# 3. Copy the environment template
cp .env.example .env.local

# 4. Fill in your keys in .env.local (see Environment Variables below)
nano .env.local   # or open in your editor

# 5. Start the local dev server
#    This emulates Netlify Functions locally on http://localhost:8888
npm run dev
```

> ⚠️ **Important:** Never use `npx serve` or a plain file server for local dev — the Netlify Functions proxy won't work. Always use `netlify dev` (alias: `npm run dev`).

---

## Environment Variables

Create `.env.local` for local development (`.env.local` is gitignored — never commit it).  
In production, add these in **Netlify Dashboard → Site Settings → Environment Variables**.

```env
# ── Supabase (public/anon — safe to expose to browser) ──────────
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=sb_publishable_your_anon_key_here

# ── AI Service (SECRET — server-side only, never in browser) ───────
GROQ_API_KEY=gsk_your_groq_key_here

# ── OCR.space (SECRET — server-side only, never in browser) ─────
OCR_API_KEY=your_ocr_space_key_here

# ── Hugging Face (SECRET — server-side only, never in browser) ── (v6)
HUGGINGFACE_API_KEY=hf_your_huggingface_key_here
```

| Variable | Where to get it | Exposed to browser? |
|---|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | ✅ Yes (anon-safe) |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | ✅ Yes (anon-safe) |
| `GROQ_API_KEY` | AI service API key | ❌ Server only |
| `OCR_API_KEY` | [ocr.space/ocrapi](https://ocr.space/ocrapi) | ❌ Server only |
| `HUGGINGFACE_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | ❌ Server only |

---

## Netlify Functions

All sensitive API calls are proxied through Netlify Functions so secret keys never reach the browser.

### `/.netlify/functions/ai-chat`

Proxies requests to the AI service API.

**Request (POST):**
```json
{ "message": "Hello!", "model": "llama-3.3-70b-versatile" }
```

**Response:**
```json
{ "reply": "Hi there! How can I help?" }
```

**Security:** model allowlist, 4000-char message cap, 20s timeout, control-char sanitisation.

---

### `/.netlify/functions/ocr`

Proxies file uploads to the OCR.space API.

**Request (POST):**
```json
{ "fileBase64": "...", "mimeType": "image/png", "language": "eng" }
```

**Response:**
```json
{ "text": "Extracted text here..." }
```

**Security:** MIME type allowlist, 1MB size cap, language allowlist, 30s timeout.

---

### `/.netlify/functions/huggingface` *(new in v6)*

Proxies requests to the Hugging Face Inference API for image-AI tools (Image Generator, Background Remover, Enhancer, Upscaler, Logo/Icon Generator) and the Subtitle Generator's speech-to-text step. Fully separate from the Groq text-AI proxy above.

**Request (POST) — text-to-image tasks:**
```json
{ "task": "text-to-image", "prompt": "a neon cyberpunk city at night" }
```

**Request (POST) — image-to-image tasks:**
```json
{ "task": "bg-remove", "image": "data:image/png;base64,..." }
```

**Response:**
```json
{ "image": "data:image/png;base64,...", "model": "..." }
```

**Security:** task allowlist (one model per task), 500-char prompt cap, 20MB payload cap, control-char sanitisation, auto-retry hint on model cold-start (503/504).

---

### `/.netlify/functions/env-config`

Returns a tiny `<script>` that sets `window.__env` with the public Supabase keys. Loaded in `index.html` before `supabase-client.js`.

**Response (JS):**
```js
window.__env={"SUPABASE_URL":"https://xxx.supabase.co","SUPABASE_ANON_KEY":"sb_publishable_..."};
```

> 🔒 Only `SUPABASE_URL` and `SUPABASE_ANON_KEY` are sent here — never AI service or OCR keys.

---

## Supabase Setup

### 1. Create tables

Run in the Supabase SQL editor:

```sql
-- Favorites
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Feedback
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT, name TEXT, email TEXT, message TEXT, rating INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feature requests
CREATE TABLE feature_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT, category TEXT, description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bug reports
CREATE TABLE bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page TEXT, description TEXT, device TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Enable Row Level Security

```sql
-- Favorites: users only access their own
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own favorites only"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Feedback: anyone can insert, nobody can read via API
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert only" ON feedback FOR INSERT WITH CHECK (true);

ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert only" ON feature_requests FOR INSERT WITH CHECK (true);

ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert only" ON bug_reports FOR INSERT WITH CHECK (true);
```

### 3. Set up Auth

In Supabase Dashboard → Authentication:
- Enable **Email** provider (with email confirmation)
- Enable **Google** OAuth (add your Netlify URL as redirect)
- Set **Site URL** to your production domain (e.g. `https://toolhub.app`)
- Add `https://toolhub.app` and `http://localhost:8888` to **Redirect URLs**

### 4. Grant admin role (optional)

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email = 'your-admin@email.com';
```

---

## Security

| Area | Implementation |
|---|---|
| API keys | All secret keys in Netlify env vars — never in source code |
| Input sanitisation | All form inputs strip control chars, capped at 2000 chars |
| XSS prevention | All dynamic HTML uses `_escapeHtml()` before insertion |
| SQL injection | Supabase parameterised queries (PostgREST) throughout |
| Auth errors | Friendly messages only — raw Supabase errors never shown |
| Inactivity logout | Auto sign-out after 30 min inactivity |
| Content Security Policy | Tight CSP in `netlify.toml` headers |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Referrer leak | `Referrer-Policy: strict-origin-when-cross-origin` |
| Admin access | Gated by `app_metadata.role`, not email string |

---

## Deployment

### Deploy to Netlify (recommended)

**Option A — Git integration (automatic deploys):**

1. Push this repo to GitHub/GitLab
2. In Netlify: **Add new site → Import an existing project**
3. Select your repo
4. Set build settings:
   - Build command: *(leave blank)*
   - Publish directory: `.`
5. Add environment variables in **Site Settings → Environment Variables**
6. Deploy 🎉

**Option B — CLI deploy:**

```bash
npm run deploy        # production deploy
npm run deploy:preview  # preview deploy (shareable URL)
```

### After deploy checklist

- [ ] Environment variables set in Netlify dashboard
- [ ] Supabase tables created and RLS enabled
- [ ] Supabase Auth redirect URLs updated to production domain
- [ ] Google OAuth redirect URL updated in Google Console
- [ ] Custom domain configured in Netlify (optional)
- [ ] Test AI chat, OCR tool, login/signup, favorites sync

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please keep the existing UI/UX intact. This project intentionally uses vanilla JS — no framework PRs.

---

## License

MIT © ToolHub 5D

---

<div align="center">
Made with ❤️ · <a href="https://toolhub.app">toolhub.app</a>
</div>
