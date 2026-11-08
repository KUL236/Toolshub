/* supabase-client.js — ToolHub Supabase init (production-ready, fully fixed) */
'use strict';

(function () {
  // ── Read keys from window.__env (set in index.html inline script) ─────────
  // In Netlify production, the env-config Netlify Function overwrites __env
  // with values from process.env, so hardcoded keys are never used in prod.
  var _env = window.__env || {};
  var SUPABASE_URL      = _env.SUPABASE_URL      || '';
  var SUPABASE_ANON_KEY = _env.SUPABASE_ANON_KEY || '';

  function initSupabase() {
    if (window.supabaseClient) return; // already initialised — avoid duplicates

    var lib = window.supabase; // UMD bundle loaded via <script> above this file
    if (!lib || typeof lib.createClient !== 'function') {
      // CDN not ready yet — will retry on DOMContentLoaded below
      return;
    }

    // ── Key validation ────────────────────────────────────────────────────
    if (!SUPABASE_ANON_KEY || !SUPABASE_ANON_KEY.startsWith('eyJ')) {
      console.error(
        '[ToolHub] ❌ Supabase anon key missing or invalid.\n' +
        'Fix: set SUPABASE_URL + SUPABASE_ANON_KEY in Netlify → Site Settings → Env Vars.\n' +
        'Key must start with "eyJ" (it is a JWT). Keys like "sb_publishable_..." are WRONG.\n' +
        'Auth is disabled until a valid key is provided.'
      );
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_URL.startsWith('https://')) {
      console.error('[ToolHub] ❌ SUPABASE_URL missing or invalid. Check window.__env in index.html.');
      return;
    }

    try {
      window.supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,       // silently refresh JWT before expiry
          persistSession: true,         // store session in localStorage (survives refresh)
          detectSessionInUrl: true,     // parse #access_token from OAuth / magic-link callbacks
          storageKey: 'toolhub_auth',   // custom key prevents conflicts with other Supabase apps
          storage: window.localStorage, // explicit — avoids issues in some PWA WebViews
        },
        // Increase global timeout slightly for slow mobile connections
        global: {
          fetch: function (url, options) {
            // Use AbortController for timeout control (15 s for auth requests)
            var controller = new AbortController();
            var timer = setTimeout(function () { controller.abort(); }, 15000);
            return fetch(url, Object.assign({}, options, { signal: controller.signal }))
              .finally(function () { clearTimeout(timer); });
          },
        },
      });
      console.info('[ToolHub] Supabase ✅ ready');
    } catch (e) {
      console.warn('[ToolHub] Supabase init error:', e.message);
    }
  }

  // BUG FIX 7: Expose initSupabase globally so the async env-config fetch in
  // index.html can call it after keys are loaded. Without this, the function
  // is private to the IIFE and the callback can't invoke it.
  window.initSupabase = initSupabase;

  // Run immediately — CDN <script> is synchronous and above this file in HTML
  initSupabase();

  // Safety net: if CDN was deferred or slow, retry after DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.supabaseClient) {
      initSupabase();
      // If initAuth is already defined (auth.js loaded), kick it off
      if (window.supabaseClient && typeof initAuth === 'function') {
        initAuth();
      }
    }
  });
})();

// ── DB HELPERS ────────────────────────────────────────────────────────────────
// Thin wrappers — callers never need to touch the Supabase client directly.

async function dbInsert(table, payload) {
  if (!window.supabaseClient) return null;
  try {
    var r = await window.supabaseClient.from(table).insert(payload);
    if (r.error) throw r.error;
    return r.data;
  } catch (e) { console.warn('[ToolHub] dbInsert:', e.message); return null; }
}

async function dbSelect(table, filters) {
  filters = filters || {};
  if (!window.supabaseClient) return [];
  try {
    var q = window.supabaseClient.from(table).select('*');
    Object.keys(filters).forEach(function (k) { q = q.eq(k, filters[k]); });
    var r = await q;
    if (r.error) throw r.error;
    return r.data || [];
  } catch (e) { console.warn('[ToolHub] dbSelect:', e.message); return []; }
}

async function dbUpsert(table, payload) {
  if (!window.supabaseClient) return null;
  try {
    var r = await window.supabaseClient.from(table).upsert(payload);
    if (r.error) throw r.error;
    return r.data;
  } catch (e) { console.warn('[ToolHub] dbUpsert:', e.message); return null; }
}

async function dbDelete(table, filters) {
  filters = filters || {};
  if (!window.supabaseClient) return null;
  try {
    var q = window.supabaseClient.from(table).delete();
    Object.keys(filters).forEach(function (k) { q = q.eq(k, filters[k]); });
    var r = await q;
    if (r.error) throw r.error;
    return true;
  } catch (e) { console.warn('[ToolHub] dbDelete:', e.message); return null; }
}
