/* ai-huggingface-tools.js — v6: AI Image Generator, BG Remover, Enhancer,
   Upscaler, Logo Generator, Icon Generator — powered by Hugging Face via the
   secure netlify/functions/huggingface.js proxy. Fully separate from the
   existing Groq text-AI tools (js/tools.js renderAITool). */
'use strict';

const HF_TOOL_CONFIGS = {
  'ai-image-generator': { task: 'text-to-image', mode: 'prompt', label: 'Describe the image you want', placeholder: 'A neon cyberpunk city skyline at night, ultra detailed', cta: '🎨 Generate Image' },
  'ai-logo-generator':  { task: 'logo',          mode: 'prompt', label: 'Describe your logo', placeholder: 'A minimal fox head logo for a tech startup called Vixel', cta: '🏷️ Generate Logo' },
  'ai-icon-generator':  { task: 'icon',          mode: 'prompt', label: 'Describe your icon', placeholder: 'A rocket ship app icon, flat design, purple gradient', cta: '🔷 Generate Icon' },
  'ai-bg-remover':      { task: 'bg-remove',     mode: 'image',  label: 'Upload an image', cta: '✂️ Remove Background' },
  'ai-image-enhancer':  { task: 'image-enhance', mode: 'image',  label: 'Upload an image to enhance', cta: '✨ Enhance Image' },
  'ai-image-upscaler':  { task: 'image-upscale', mode: 'image',  label: 'Upload an image to upscale', cta: '🔍 Upscale Image' },
};

function renderHFAiTool(toolKey) {
  const cfg = HF_TOOL_CONFIGS[toolKey];
  if (!cfg) return;
  const container = document.getElementById('tool-widget-container');
  const historyHtml = `
    <div id="hf-history-wrap" style="margin-top:1.5rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
        <label class="form-label" style="margin:0">Your Recent Creations</label>
        <button class="btn-outline-glow" style="padding:.35rem .75rem;font-size:.8rem" onclick="clearHFHistory('${toolKey}')">🗑 Clear</button>
      </div>
      <div id="hf-history-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.6rem"></div>
    </div>`;

  container.innerHTML = `
    <div class="tool-widget">
      <div class="info-box info-box-blue" style="margin-bottom:1rem">🤗 Powered by <strong>Hugging Face AI</strong> — separate from ToolHub's Groq assistant, dedicated to image generation.</div>
      ${cfg.mode === 'prompt' ? `
        <div class="form-group" style="margin-bottom:1rem">
          <label class="form-label">${cfg.label}</label>
          <textarea class="form-textarea" id="hf-prompt-input" placeholder="${cfg.placeholder}" style="min-height:100px" maxlength="500"></textarea>
        </div>
      ` : `
        <div class="form-group" style="margin-bottom:1rem">
          <label class="form-label">${cfg.label}</label>
          <input class="form-input" type="file" id="hf-image-input" accept="image/png,image/jpeg,image/webp">
          <div id="hf-image-preview" style="margin-top:.75rem"></div>
        </div>
      `}
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
        <button class="btn-primary-glow" onclick="runHFAiTool('${toolKey}')" id="hf-tool-btn">${cfg.cta}</button>
        <button class="btn-outline-glow" onclick="resetHFTool('${toolKey}')">🗑 Clear</button>
      </div>
      <div id="hf-tool-output" style="display:none;text-align:center">
        <div id="hf-result-area"></div>
      </div>
      ${historyHtml}
    </div>`;

  if (cfg.mode === 'image') {
    document.getElementById('hf-image-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById('hf-image-preview');
      if (!file) { preview.innerHTML = ''; return; }
      const url = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${url}" style="max-width:220px;border-radius:10px;border:1px solid var(--border)">`;
    });
  }

  renderHFHistory(toolKey);
}

function resetHFTool(toolKey) {
  const promptEl = document.getElementById('hf-prompt-input');
  const imgEl = document.getElementById('hf-image-input');
  const preview = document.getElementById('hf-image-preview');
  if (promptEl) promptEl.value = '';
  if (imgEl) imgEl.value = '';
  if (preview) preview.innerHTML = '';
  const output = document.getElementById('hf-tool-output');
  if (output) { output.style.display = 'none'; document.getElementById('hf-result-area').innerHTML = ''; }
}

function _fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function runHFAiTool(toolKey, retryCount = 0) {
  const cfg = HF_TOOL_CONFIGS[toolKey];
  const btn = document.getElementById('hf-tool-btn');
  const output = document.getElementById('hf-tool-output');
  const resultArea = document.getElementById('hf-result-area');

  let payload = { task: cfg.task };
  if (cfg.mode === 'prompt') {
    const prompt = document.getElementById('hf-prompt-input')?.value?.trim();
    if (!prompt) { showToast('Please describe what you want first', 'warning'); return; }
    payload.prompt = prompt;
  } else {
    const file = document.getElementById('hf-image-input')?.files?.[0];
    if (!file) { showToast('Please upload an image first', 'warning'); return; }
    payload.image = await _fileToDataURL(file);
  }

  btn.textContent = '⏳ Working...'; btn.disabled = true;
  output.style.display = 'block';
  resultArea.innerHTML = '<div style="display:flex;gap:6px;align-items:center;justify-content:center;padding:2rem"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';

  try {
    const response = await fetch(getFunctionEndpoint('huggingface'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(50000),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      // Auto-retry once on cold-start/model-loading errors (common on free HF inference tier)
      if (retryCount < 1 && (response.status === 503 || response.status === 504)) {
        resultArea.innerHTML = '<div class="info-box info-box-blue">Model is warming up — retrying in a few seconds…</div>';
        await new Promise(r => setTimeout(r, 6000));
        btn.disabled = false;
        return runHFAiTool(toolKey, retryCount + 1);
      }
      throw new Error(errData.error || `Service error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const bodyText = await response.text();
    if (!contentType.includes('application/json')) {
      throw new Error('AI service returned an invalid response. Please try again.');
    }
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch {
      throw new Error('AI service returned invalid JSON. Please try again.');
    }
    if (!data.image || typeof data.image !== 'string') {
      throw new Error('AI service returned an invalid image response.');
    }
    resultArea.innerHTML = `
      <img src="${data.image}" style="max-width:100%;border-radius:12px;border:1px solid var(--border);margin-bottom:1rem">
      <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap">
        <a class="btn-primary-glow" href="${data.image}" download="toolhub-${toolKey}-${Date.now()}.png">⬇ Download</a>
      </div>`;
    saveHFHistoryItem(toolKey, data.image);
    renderHFHistory(toolKey);
    showToast('✅ Generated successfully!', 'success');

    if (window.supabaseClient && typeof Auth !== 'undefined' && Auth.user) {
      dbInsert('tool_usage', { user_id: Auth.user.id, tool_id: toolKey, used_at: new Date().toISOString() }).catch(() => {});
    }
  } catch (e) {
    resultArea.innerHTML = `<div class="info-box info-box-red">❌ ${e.message || 'Something went wrong. Please try again.'}</div>`;
  }
  btn.textContent = cfg.cta; btn.disabled = false;
}

// ── LOCAL HISTORY (per-browser; keeps last 8 results per tool) ─────────────
function _hfHistoryKey(toolKey) { return `th_hf_history_${toolKey}`; }

function saveHFHistoryItem(toolKey, dataUrl) {
  try {
    const key = _hfHistoryKey(toolKey);
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.unshift({ img: dataUrl, ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(list.slice(0, 8)));
  } catch (e) { /* storage full or unavailable — silently skip history */ }
}

function renderHFHistory(toolKey) {
  const grid = document.getElementById('hf-history-grid');
  if (!grid) return;
  let list = [];
  try { list = JSON.parse(localStorage.getItem(_hfHistoryKey(toolKey)) || '[]'); } catch (e) {}
  if (!list.length) { grid.innerHTML = '<p style="color:var(--text3);font-size:.85rem">No creations yet — your results will appear here.</p>'; return; }
  grid.innerHTML = list.map(item => `
    <a href="${item.img}" download="toolhub-history-${item.ts}.png" style="display:block;border-radius:8px;overflow:hidden;border:1px solid var(--border)">
      <img src="${item.img}" style="width:100%;aspect-ratio:1;object-fit:cover" loading="lazy">
    </a>`).join('');
}

function clearHFHistory(toolKey) {
  localStorage.removeItem(_hfHistoryKey(toolKey));
  renderHFHistory(toolKey);
  showToast('History cleared', 'info');
}

// ── Register into the shared tool dispatcher (see js/tools.js extension point) ──
window.EXTRA_TOOL_WIDGETS = window.EXTRA_TOOL_WIDGETS || {};
Object.keys(HF_TOOL_CONFIGS).forEach(id => {
  window.EXTRA_TOOL_WIDGETS[id] = () => renderHFAiTool(id);
});
