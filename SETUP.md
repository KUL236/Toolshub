# ToolHub 5D — Production Setup Guide

## 1. Environment Variables

Set the following in **Netlify Dashboard → Site Settings → Environment Variables**.
Never hardcode these in source files.

| Variable | Description | Exposed to Browser? |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL | ✅ Yes (anon-safe) |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | ✅ Yes (anon-safe) |
| `GROQ_API_KEY` | AI service API key | ❌ No — server only |
| `OCR_API_KEY` | OCR.space API key | ❌ No — server only |
| `SPOTIFY_CLIENT_ID` | Spotify app Client ID (Playlist Player search) | ❌ No — server only |
| `SPOTIFY_CLIENT_SECRET` | Spotify app Client Secret (Playlist Player search) | ❌ No — server only |

## 2. How Keys Work

- `GROQ_API_KEY` and `OCR_API_KEY` are **only used inside Netlify Functions** (`netlify/functions/`).  
  They never touch the browser. API calls from the frontend go to `/.netlify/functions/groq-chat` and `/.netlify/functions/ocr`.

- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` power the **search-by-song-name** box in the "Playlist Player" tool
  (`/.netlify/functions/spotify-search`). Get a free pair at https://developer.spotify.com/dashboard →
  "Create app" (redirect URI can be anything, e.g. `https://example.com` — it's not used by this Client Credentials
  flow). Without these set, the search box shows a friendly message and pasting a Spotify link directly still works
  with no key at all, since that just loads Spotify's own public embed player.

- `SUPABASE_URL` and `SUPABASE_ANON_KEY` are served to the browser via `/.netlify/functions/env-config`  
  which returns a tiny `window.__env = {...}` script. These are the **public anon keys** which are designed to be browser-safe when paired with Supabase Row Level Security.

## 3. Supabase RLS (Required for production)

Enable Row Level Security on all tables in the Supabase dashboard:

```sql
-- favorites table
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT WITH CHECK (true);

-- feature_requests table
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert feature requests"
  ON feature_requests FOR INSERT WITH CHECK (true);

-- bug_reports table
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert bug reports"
  ON bug_reports FOR INSERT WITH CHECK (true);
```

## 4. Admin Role

The admin panel is gated by a `role` claim in `app_metadata` (not by email address).  
Set it in the Supabase dashboard:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
WHERE email = 'your-admin@email.com';
```

## 5. Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Copy env template
cp .env.example .env.local

# Fill in your keys in .env.local

# Run local dev server (emulates Netlify Functions)
netlify dev
```

## 6. Deploy to Netlify

```bash
netlify deploy --prod
```

Or connect your Git repo in the Netlify dashboard for automatic deploys.

## 7. Security Checklist

- [ ] All env vars set in Netlify dashboard (not in code)
- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] Supabase RLS enabled on all tables
- [ ] Admin role set via `app_metadata`, not email
- [ ] `Content-Security-Policy` header active (see `netlify.toml`)
- [ ] Google OAuth configured in Supabase with correct redirect URL
