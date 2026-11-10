# Deploy to Netlify via GitHub

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — ToolHub 5D"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2 — Connect to Netlify

1. Go to https://app.netlify.com → **Add new site → Import an existing project**
2. Choose **GitHub** → authorize → select your repo
3. Build settings:
   - **Base directory**: *(leave blank)*
   - **Build command**: `echo done`
   - **Publish directory**: `.`
4. Click **Deploy site**

## Step 3 — Add Environment Variables in Netlify Dashboard

Go to: **Site settings → Environment variables → Add variable**

Add these 4 variables (get values from your accounts):

| Key | Where to find it |
|-----|-----------------|
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `OCR_API_KEY` | ocr.space → My Account |
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |

Then click **Trigger deploy → Deploy site**

## Step 4 — Test the chatbot

The chatbot uses the secure server-side function:

```text
POST https://YOUR-SITE.netlify.app/.netlify/functions/chat
Content-Type: application/json

{"message":"Which PDF tools are available?","model":"openai/gpt-oss-20b","history":[]}
```

The browser and Capacitor Android app never receive `GROQ_API_KEY`. The Android app uses the deployed site URL for this function rather than localhost.

## Step 5 — Sync and build Android

```bash
npm run build:capacitor
npx cap sync android
cd android
./gradlew assembleDebug
```

Open the native project with `npx cap open android`.

## Step 6 — Test other APIs

Visit: `https://YOUR-SITE.netlify.app/.netlify/functions/test-apis`

Should return `"allOk": true`
