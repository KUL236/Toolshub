/* netlify/functions/huggingface.js — Secure Hugging Face AI proxy (v6)
   Mirrors the same secure-proxy pattern as groq-chat.js / ocr.js:
   the HUGGINGFACE_API_KEY never reaches the browser. */
'use strict';

// One allow-listed model per task — keeps the surface area small and predictable.
const TASK_MODELS = {
  'text-to-image':   'black-forest-labs/FLUX.1-schnell',
  'bg-remove':       'briaai/RMBG-1.4',
  'image-enhance':   'caidas/swin2SR-classical-sr-x2-64',
  'image-upscale':   'caidas/swin2SR-classical-sr-x4-64',
  'logo':            'black-forest-labs/FLUX.1-schnell',
  'icon':            'black-forest-labs/FLUX.1-schnell',
  'speech-to-text':  'openai/whisper-large-v3',
};

const MAX_PROMPT_LENGTH = 500;
const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20MB — Netlify Function payload ceiling

// Old endpoint https://api-inference.huggingface.co is permanently retired by
// Hugging Face (returns HTTP 410 Gone as of 2026). The direct successor for
// the same free-tier "HF Inference" provider is router.huggingface.co/hf-inference
// — identical request/response shape, just a different base URL.
const HF_BASE_URL = 'https://router.huggingface.co/hf-inference/models';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'AI service unavailable — HUGGINGFACE_API_KEY not set' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { task } = body;
  if (!task || !TASK_MODELS[task]) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: `Invalid task. Allowed: ${Object.keys(TASK_MODELS).join(', ')}` }) };
  }
  const model = TASK_MODELS[task];

  try {
    // ── Text-to-image style tasks (image gen, logo, icon) ──
    if (task === 'text-to-image' || task === 'logo' || task === 'icon') {
      const { prompt } = body;
      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Prompt is required' }) };
      }
      if (prompt.length > MAX_PROMPT_LENGTH) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Prompt too long (max ${MAX_PROMPT_LENGTH} chars)` }) };
      }
      const safePrompt = prompt.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      const styledPrompt =
        task === 'logo' ? `minimal professional vector logo design, ${safePrompt}, clean background, high contrast` :
        task === 'icon' ? `flat modern app icon, ${safePrompt}, simple shapes, centered, transparent-friendly background` :
        safePrompt;

      const hfResp = await fetch(`${HF_BASE_URL}/${model}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: styledPrompt }),
        signal: AbortSignal.timeout(45000),
      });

      if (!hfResp.ok) {
        const errText = await hfResp.text();
        console.error('HF text-to-image error:', hfResp.status, errText);
        const friendlyMsg =
          hfResp.status === 404 ? 'This AI model is not currently hosted on the free tier — it may need a different provider.' :
          hfResp.status === 503 ? 'The AI model is warming up — please retry in about 20 seconds.' :
          hfResp.status === 401 || hfResp.status === 403 ? 'AI image service authentication failed — check the Hugging Face API key.' :
          `AI image service error (${hfResp.status}). Try again in a moment.`;
        return { statusCode: 502, headers, body: JSON.stringify({ error: friendlyMsg }) };
      }

      const arrayBuf = await hfResp.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString('base64');
      return { statusCode: 200, headers, body: JSON.stringify({ image: `data:image/png;base64,${base64}`, model }) };
    }

    // ── Image-to-image tasks (bg remove, enhance, upscale) ──
    if (task === 'bg-remove' || task === 'image-enhance' || task === 'image-upscale') {
      const { image } = body; // data URL from the browser (canvas/file input)
      if (!image || typeof image !== 'string' || !image.startsWith('data:image')) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'A valid image is required' }) };
      }
      const base64Data = image.split(',')[1] || '';
      const imgBuffer = Buffer.from(base64Data, 'base64');
      if (imgBuffer.length > MAX_AUDIO_BYTES) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Image too large (max 20MB)' }) };
      }

      const hfResp = await fetch(`${HF_BASE_URL}/${model}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/octet-stream' },
        body: imgBuffer,
        signal: AbortSignal.timeout(45000),
      });

      if (!hfResp.ok) {
        const errText = await hfResp.text();
        console.error('HF image task error:', hfResp.status, errText);
        const friendlyMsg =
          hfResp.status === 404 ? 'This AI model is not currently hosted on the free tier — it may need a different provider.' :
          hfResp.status === 503 ? 'The AI model is warming up — please retry in about 20 seconds.' :
          hfResp.status === 401 || hfResp.status === 403 ? 'AI image service authentication failed — check the Hugging Face API key.' :
          `AI image service error (${hfResp.status}). Try again in a moment.`;
        return { statusCode: 502, headers, body: JSON.stringify({ error: friendlyMsg }) };
      }

      const arrayBuf = await hfResp.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString('base64');
      return { statusCode: 200, headers, body: JSON.stringify({ image: `data:image/png;base64,${base64}`, model }) };
    }

    // ── Speech-to-text (used by the Subtitle Generator video tool) ──
    if (task === 'speech-to-text') {
      const { audio } = body; // base64 data URL of extracted audio (wav/mp3)
      if (!audio || typeof audio !== 'string' || !audio.startsWith('data:audio')) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'A valid audio clip is required' }) };
      }
      const base64Data = audio.split(',')[1] || '';
      const audioBuffer = Buffer.from(base64Data, 'base64');
      if (audioBuffer.length > MAX_AUDIO_BYTES) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Audio too large (max 20MB — trim it first)' }) };
      }

      const hfResp = await fetch(`${HF_BASE_URL}/${model}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/octet-stream' },
        body: audioBuffer,
        signal: AbortSignal.timeout(60000),
      });

      if (!hfResp.ok) {
        const errText = await hfResp.text();
        console.error('HF speech-to-text error:', hfResp.status, errText);
        const friendlyMsg =
          hfResp.status === 404 ? 'This transcription model is not currently hosted on the free tier.' :
          hfResp.status === 503 ? 'The model is warming up — please retry in about 20 seconds.' :
          hfResp.status === 401 || hfResp.status === 403 ? 'Transcription service authentication failed — check the Hugging Face API key.' :
          `Transcription service error (${hfResp.status}). Try again.`;
        return { statusCode: 502, headers, body: JSON.stringify({ error: friendlyMsg }) };
      }

      const data = await hfResp.json();
      return { statusCode: 200, headers, body: JSON.stringify({ text: data.text || '', chunks: data.chunks || [], model }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unhandled task' }) };
  } catch (err) {
    console.error('Hugging Face function error:', err);
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    return {
      statusCode: isTimeout ? 504 : 502,
      headers,
      body: JSON.stringify({ error: isTimeout ? 'AI request timed out — the model may be warming up, try again in ~20s.' : 'AI service unavailable.' }),
    };
  }
};
