/* netlify/functions/spotify-search.js — Secure Spotify search proxy.
 *
 * Lets the browser search Spotify's catalog by song name (no link needed).
 * The Client Secret must never reach the browser, so this function:
 *   1. Exchanges SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET for a short-lived
 *      app access token (Client Credentials flow — no user login involved,
 *      this only reads public catalog data, it can't play/save to anyone's
 *      personal Spotify account).
 *   2. Caches that token in memory until it's close to expiring, so we don't
 *      re-auth on every search.
 *   3. Calls Spotify's /v1/search endpoint and returns a trimmed-down result
 *      list (id, name, artists, album cover, spotify url) to the browser.
 *
 * Setup: create a free app at https://developer.spotify.com/dashboard,
 * copy its Client ID + Client Secret, and set them as SPOTIFY_CLIENT_ID /
 * SPOTIFY_CLIENT_SECRET in Netlify → Site settings → Environment variables.
 */
'use strict';

const MAX_QUERY_LENGTH = 100;

let cachedToken = null; // { token, expiresAt }

async function getAppToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 10000) {
    return cachedToken.token;
  }
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw Object.assign(new Error('not_configured'), { code: 'not_configured' });

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const resp = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(10000),
  });
  if (!resp.ok) throw Object.assign(new Error('auth_failed'), { code: 'auth_failed' });
  const data = await resp.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
  return cachedToken.token;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const q = (event.queryStringParameters?.q || '').trim();
  if (!q) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Query param "q" is required' }) };
  if (q.length > MAX_QUERY_LENGTH) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Search query too long' }) };
  }

  try {
    const token = await getAppToken();
    const resp = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=10&q=${encodeURIComponent(q)}`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }
    );
    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Spotify search error:', resp.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Spotify search failed (${resp.status})` }) };
    }
    const data = await resp.json();
    const results = (data.tracks?.items || []).map((t) => ({
      id: t.id,
      name: t.name,
      artists: (t.artists || []).map((a) => a.name).join(', '),
      thumb: t.album?.images?.[t.album.images.length - 1]?.url || t.album?.images?.[0]?.url || '',
      url: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
    }));
    return { statusCode: 200, headers, body: JSON.stringify({ results }) };
  } catch (err) {
    if (err.code === 'not_configured') {
      return { statusCode: 503, headers, body: JSON.stringify({ error: 'not_configured' }) };
    }
    console.error('spotify-search function error:', err);
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    return { statusCode: isTimeout ? 504 : 502, headers, body: JSON.stringify({ error: isTimeout ? 'Request timed out.' : 'Search service unavailable.' }) };
  }
};
