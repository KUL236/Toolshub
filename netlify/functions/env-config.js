/* netlify/functions/env-config.js
 *
 * Serves a tiny JS snippet that exposes ONLY the public/anon keys
 * to the browser — never the secret keys.
 *
 * Include in index.html as:
 *   <script src="/.netlify/functions/env-config"></script>
 *
 * This sets window.__env which supabase-client.js reads.
 */
'use strict';

exports.handler = async () => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || '';

  // Only expose the anon/public key (safe to be in browser)
  // Never expose GROQ_API_KEY, OCR_API_KEY, or service-role keys here
  const snippet = `window.__env=${JSON.stringify({ SUPABASE_URL: url, SUPABASE_ANON_KEY: key })};`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: snippet,
  };
};
