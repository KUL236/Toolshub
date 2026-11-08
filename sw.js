/* sw.js — ToolHub 5D Service Worker */
'use strict';

const CACHE_VERSION = 'toolhub5d-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/splash.css',
  '/js/app.js',
  '/js/tools.js',
  '/js/games.js',
  '/js/tools-data.js',
  '/js/supabase-client.js',
  '/js/auth.js',
  '/js/splash.js',
  '/js/icons.js',
  '/js/referral.js',
  '/manifest.json',
];

// Requests that should never be cached
function shouldBypass(url) {
  return (
    url.includes('/.netlify/') ||
    url.includes('/api/') ||
    url.includes('supabase.co') ||
    url.includes('api.groq.com') ||
    url.includes('api.ocr.space') ||
    url.includes('googleapis.com/auth') ||
    url.includes('cdnjs.cloudflare.com') ||
    url.includes('cdn.jsdelivr.net') ||
    url.includes('unpkg.com')
  );
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) =>
      c.addAll(ASSETS).catch((err) => console.warn('[SW] Pre-cache partial failure:', err))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (shouldBypass(e.request.url)) return; // Always go to network for API calls

  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isCode = sameOrigin && (e.request.mode === 'navigate' || /\.(?:html|css|js)$/.test(url.pathname) || url.pathname === '/');

  // HTML / CSS / JS: network-first, so a new deploy is never shown with stale styles.
  // Falls back to cache only when offline.
  if (isCode) {
    e.respondWith(
      (async () => {
        try {
          const res = await fetch(e.request, { cache: 'no-cache' });
          if (res && res.ok && res.type !== 'opaque') {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return res;
        } catch (err) {
          const cached = await caches.match(e.request);
          return cached || (e.request.mode === 'navigate' ? caches.match('/index.html') : Response.error());
        }
      })()
    );
    return;
  }

  // Images, fonts, etc.: cache-first, refresh in background
  e.respondWith(
    (async () => {
      const cached = await caches.match(e.request);
      if (cached) {
        fetch(e.request)
          .then((res) => {
            if (res && res.ok && res.type !== 'opaque') {
              const copy = res.clone();
              caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy)).catch(() => {});
            }
          })
          .catch(() => {});
        return cached;
      }
      try {
        const res = await fetch(e.request);
        if (res && res.ok && res.type !== 'opaque') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      } catch (err) {
        return Response.error();
      }
    })()
  );
});
