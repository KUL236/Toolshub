/* netlify/functions/ocr.js — Secure OCR.space proxy */
'use strict';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'application/pdf'];

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

  const apiKey = process.env.OCR_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'OCR service unavailable' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { fileBase64, mimeType, language = 'eng' } = body;

  if (!fileBase64 || typeof fileBase64 !== 'string') {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'File data is required' }) };
  }

  if (!ALLOWED_MIME.includes(mimeType)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unsupported file type' }) };
  }

  // Rough size check (base64 is ~4/3 of binary)
  const estimatedBytes = (fileBase64.length * 3) / 4;
  if (estimatedBytes > MAX_FILE_SIZE) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'File too large. Max 1MB.' }) };
  }

  const allowedLanguages = ['eng', 'fre', 'ger', 'spa', 'por', 'ita', 'dut', 'rus', 'ara', 'hin', 'chi_sim', 'jpn', 'kor'];
  if (!allowedLanguages.includes(language)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unsupported language' }) };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('base64Image', `data:${mimeType};base64,${fileBase64}`);
    formData.append('apikey', apiKey);
    formData.append('language', language);
    formData.append('isOverlayRequired', 'false');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'OCR service error. Try again.' }) };
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      return { statusCode: 422, headers, body: JSON.stringify({ error: data.ErrorMessage?.[0] || 'OCR processing failed' }) };
    }

    const text = data.ParsedResults?.map((r) => r.ParsedText).join('\n') || '';
    return { statusCode: 200, headers, body: JSON.stringify({ text }) };
  } catch (err) {
    console.error('OCR function error:', err);
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    return {
      statusCode: isTimeout ? 504 : 502,
      headers,
      body: JSON.stringify({ error: isTimeout ? 'OCR timed out. Try a smaller image.' : 'OCR service unavailable.' }),
    };
  }
};
