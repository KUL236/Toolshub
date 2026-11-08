/* netlify/functions/groq-chat.js — Secure AI proxy */
'use strict';

// ── Current Groq production models (updated Sept 2026) ────────────────────
// llama-3.3-70b-versatile, llama-3.1-8b-instant, llama-3.1-70b-versatile,
// llama-4-scout, and gemma2-9b-it are ALL deprecated/decommissioned by Groq
// (shutdown Aug 16, 2026). Replaced with Groq's official recommended
// successors — see https://console.groq.com/docs/deprecations
const ALLOWED_MODELS = [
  'openai/gpt-oss-120b',  // Best — production-grade, replaces llama-3.3-70b-versatile
  'openai/gpt-oss-20b',   // Fast & lightweight, replaces llama-3.1-8b-instant
];

const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const MAX_MESSAGE_LENGTH = 4000;
const MAX_TOKENS = 2048;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'AI service unavailable — GROQ_API_KEY not set' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { message, model = DEFAULT_MODEL } = body;

  if (!message || typeof message !== 'string') {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message too long (max 4000 chars)' }) };
  }
  if (!ALLOWED_MODELS.includes(model)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: `Invalid model. Allowed: ${ALLOWED_MODELS.join(', ')}` }) };
  }

  // Basic injection guard — strip null bytes and control chars
  const safeMessage = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are ToolHub AI Assistant, a helpful AI built into ToolHub 5D platform. Be concise, helpful and friendly. Format responses with markdown when appropriate.',
          },
          { role: 'user', content: safeMessage },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: `AI service error (${response.status}). Please try again.` }),
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, model }),
    };
  } catch (err) {
    console.error('Groq function error:', err);
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    return {
      statusCode: isTimeout ? 504 : 502,
      headers,
      body: JSON.stringify({ error: isTimeout ? 'Request timed out. Try again.' : 'AI service unavailable.' }),
    };
  }
};
