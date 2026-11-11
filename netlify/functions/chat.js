/* netlify/functions/chat.js - Secure ToolHub 5D Groq proxy */
'use strict';

const ALLOWED_MODELS = new Set([
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
]);
const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY = 20;
const MAX_TOTAL_HISTORY_LENGTH = 16000;
const MAX_TOKENS = 2048;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 20;
const requestsByClient = new Map();

function getAllowedOrigin(requestOrigin) {
  const allowed = new Set([
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.DEPLOY_URL,
    'https://softwaretoolss.netlify.app',
    'https://softwaretoolss.com',
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'https://localhost',
    'http://localhost:8888',
    'http://localhost:5173',
  ].filter(Boolean));
  if (requestOrigin && allowed.has(requestOrigin)) return requestOrigin;
  return process.env.URL || 'https://softwaretoolss.netlify.app';
}

function response(statusCode, body, origin) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

function clientKey(event) {
  return event.headers?.['x-nf-client-connection-ip']
    || event.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || 'unknown';
}

function isRateLimited(key) {
  const now = Date.now();
  const recent = (requestsByClient.get(key) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  recent.push(now);
  requestsByClient.set(key, recent);
  if (requestsByClient.size > 1000) {
    for (const [client, timestamps] of requestsByClient) {
      if (!timestamps.some((timestamp) => now - timestamp < RATE_WINDOW_MS)) requestsByClient.delete(client);
    }
  }
  return recent.length > RATE_LIMIT;
}

function normalizeHistory(history) {
  if (history === undefined) return [];
  if (!Array.isArray(history) || history.length > MAX_HISTORY) return null;
  const normalized = [];
  let totalLength = 0;
  for (const item of history) {
    if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') return null;
    const content = item.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return null;
    totalLength += content.length;
    normalized.push({ role: item.role, content });
  }
  return totalLength <= MAX_TOTAL_HISTORY_LENGTH ? normalized : null;
}

exports.handler = async (event) => {
  const origin = getAllowedOrigin(event.headers?.origin);
  if (event.httpMethod === 'OPTIONS') return { ...response(204, {}, origin), body: '' };
  if (event.httpMethod !== 'POST') return response(405, { error: 'Method not allowed' }, origin);
  if (isRateLimited(clientKey(event))) {
    return response(429, { error: 'Too many requests. Please wait a minute and try again.' }, origin);
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return response(503, { error: 'AI service is not configured.' }, origin);

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return response(400, { error: 'Invalid JSON request body.' }, origin);
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const model = body.model || DEFAULT_MODEL;
  const history = normalizeHistory(body.history);
  if (!message) return response(400, { error: 'Message is required.' }, origin);
  if (message.length > MAX_MESSAGE_LENGTH) return response(400, { error: 'Message is too long (maximum 4000 characters).' }, origin);
  if (!history) return response(400, { error: 'Conversation history is invalid or too large.' }, origin);
  if (!ALLOWED_MODELS.has(model)) return response(400, { error: 'That AI model is not available.' }, origin);

  const messages = [
    {
      role: 'system',
      content: 'You are ToolHub 5D AI Assistant. Help users find and use tools that actually exist in ToolHub 5D, answer programming questions (HTML, CSS, JavaScript, React, Python), explain AI and machine learning, PDF and image utilities, calculations, productivity, and general technical support. Be concise, friendly, and useful. Never invent ToolHub features; say when you are unsure.',
    },
    ...history,
    { role: 'user', content: message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') },
  ];

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: MAX_TOKENS, temperature: 0.7 }),
      signal: AbortSignal.timeout(20000),
    });

    if (!groqResponse.ok) {
      const providerStatus = groqResponse.status;
      const status = providerStatus === 429 ? 429 : 502;
      const error = providerStatus === 401 || providerStatus === 403
        ? 'AI authentication failed. Check the server configuration.'
        : providerStatus === 404
          ? 'The configured AI model is unavailable.'
          : providerStatus === 429
            ? 'The AI service is busy. Please try again shortly.'
            : 'The AI service returned an error. Please try again.';
      return response(status, { error }, origin);
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return response(502, { error: 'The AI service returned an empty response.' }, origin);
    }
    return response(200, { reply: reply.trim(), model }, origin);
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return response(timedOut ? 504 : 502, {
      error: timedOut ? 'The AI request timed out. Please try again.' : 'The AI service is temporarily unavailable.',
    }, origin);
  }
};
