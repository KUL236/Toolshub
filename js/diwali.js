/* diwali.js — ToolHub 5D Diwali Special experience and browser tools */
'use strict';

const DIWALI_GIFTS = [
  { title: 'A Bright New Beginning', text: 'May every idea you light up become something beautiful.' },
  { title: 'Digital Diya Blessing', text: 'Wishing you warmth, peace and a year full of bright moments.' },
  { title: 'ToolHub Festive Pass', text: 'You found a festive surprise. Explore the Diwali Special tools below!' },
  { title: 'Golden Wishes', text: 'May your Diwali be filled with health, happiness and new possibilities.' },
];

function renderDiwaliPage() {
  const grid = document.getElementById('diwali-tools-grid');
  if (!grid || typeof ALL_TOOLS === 'undefined') return;
  grid.innerHTML = ALL_TOOLS.filter(tool => tool.cat === 'diwali').map(tool =>
    `<article class="diwali-tool-card"><div class="diwali-tool-icon">${tool.icon}</div><div><h2>${tool.name}</h2><p>${tool.desc}</p></div><button onclick="openTool('${tool.id}')">Open tool <span>→</span></button></article>`
  ).join('');
}

function openDiwaliGift() {
  const modal = document.getElementById('diwali-gift-modal');
  if (!modal) return;
  const gift = DIWALI_GIFTS[Math.floor(Math.random() * DIWALI_GIFTS.length)];
  document.getElementById('diwali-gift-title').textContent = gift.title;
  document.getElementById('diwali-gift-text').textContent = gift.text;
  modal.classList.add('show');
  modal.querySelector('.diwali-reveal-card')?.classList.remove('gift-revealed');
  window.setTimeout(() => modal.querySelector('.diwali-reveal-card')?.classList.add('gift-revealed'), 120);
}

function closeDiwaliGift() {
  document.getElementById('diwali-gift-modal')?.classList.remove('show');
}

function downloadDiwaliGift() {
  const title = document.getElementById('diwali-gift-title')?.textContent || 'Diwali Surprise';
  const text = document.getElementById('diwali-gift-text')?.textContent || '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#260b12"/><stop offset=".55" stop-color="#7f1d1d"/><stop offset="1" stop-color="#d97706"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="600" cy="370" r="220" fill="none" stroke="#fbbf24" stroke-opacity=".35" stroke-width="2"/><text x="600" y="350" fill="#fde68a" font-family="Georgia" font-size="54" text-anchor="middle">${escapeSvg(title)}</text><text x="600" y="430" fill="#fff7ed" font-family="Arial" font-size="26" text-anchor="middle">${escapeSvg(text)}</text><text x="600" y="700" fill="#fbbf24" font-family="Arial" font-size="20" text-anchor="middle">A Diwali surprise from ToolHub 5D</text></svg>`;
  const link = document.createElement('a');
  link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  link.download = 'toolhub-diwali-surprise.svg';
  link.click();
}

function escapeSvg(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[char]));
}

function toggleDiwaliTheme() {
  const enabled = document.documentElement.classList.toggle('diwali-theme');
  localStorage.setItem('th_diwali_theme', enabled ? '1' : '0');
  document.querySelector('.diwali-toggle')?.setAttribute('aria-pressed', String(enabled));
}

function spinDiwali() {
  const key = 'th_diwali_spin_date';
  const today = new Date().toISOString().slice(0, 10);
  const result = document.getElementById('diwali-spin-result');
  const button = document.getElementById('diwali-spin-btn');
  if (!result || !button) return;
  if (localStorage.getItem(key) === today) {
    result.textContent = 'You have already spun today. Come back tomorrow ✨';
    return;
  }
  button.disabled = true;
  result.textContent = 'Lighting the festive wheel…';
  window.setTimeout(() => {
    localStorage.setItem(key, today);
    result.textContent = DIWALI_GIFTS[Math.floor(Math.random() * DIWALI_GIFTS.length)].title + ' ✨';
    button.disabled = false;
  }, 850);
}

function diwaliCanvas(container, width = 720, height = 520) {
  container.innerHTML = `<canvas class="diwali-tool-canvas" width="${width}" height="${height}"></canvas><div class="diwali-tool-actions"><button class="btn-primary-glow" onclick="downloadDiwaliCanvas(this)">⬇ Download</button></div>`;
  return container.querySelector('canvas');
}

function downloadDiwaliCanvas(button) {
  const canvas = button.closest('.tool-widget')?.querySelector('canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'toolhub-diwali-creation.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function drawFestiveBackground(ctx, w, h) {
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, '#240a12'); gradient.addColorStop(.55, '#7f1d1d'); gradient.addColorStop(1, '#b45309');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(251,191,36,.12)';
  for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc((i * 97) % w, 50 + ((i * 71) % (h - 90)), 2 + i % 3, 0, Math.PI * 2); ctx.fill(); }
}

function renderDiwaliGreetingCard() {
  const el = document.getElementById('tool-widget-container');
  el.innerHTML = `<div class="tool-widget diwali-tool-widget"><label class="form-label">Your name</label><input id="diwali-name" class="form-input" placeholder="From the Sharma family"><label class="form-label">Greeting</label><textarea id="diwali-message" class="form-textarea" rows="3">May your Diwali be filled with light, joy and prosperity!</textarea><div id="diwali-card-preview"></div></div>`;
  const draw = () => {
    const wrap = document.getElementById('diwali-card-preview'); const canvas = diwaliCanvas(wrap, 720, 460); const ctx = canvas.getContext('2d');
    drawFestiveBackground(ctx, 720, 460); ctx.textAlign = 'center'; ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 52px Georgia'; ctx.fillText('Happy Diwali', 360, 170); ctx.fillStyle = '#fff7ed'; ctx.font = '24px Arial'; ctx.fillText(document.getElementById('diwali-message').value.slice(0, 80), 360, 235); ctx.fillStyle = '#fde68a'; ctx.font = 'bold 20px Arial'; ctx.fillText(document.getElementById('diwali-name').value || 'With warm wishes', 360, 330);
  };
  document.getElementById('diwali-name').addEventListener('input', draw); document.getElementById('diwali-message').addEventListener('input', draw); draw();
}

function renderRangoliCreator() {
  const el = document.getElementById('tool-widget-container'); el.innerHTML = `<div class="tool-widget diwali-tool-widget"><label class="form-label">Pattern color</label><input id="rangoli-color" type="color" value="#fbbf24" class="color-input"><div id="rangoli-preview"></div><button class="btn-primary-glow" onclick="randomizeRangoli()">🔄 New pattern</button></div>`; drawRangoli();
}
function drawRangoli() {
  const canvas = diwaliCanvas(document.getElementById('rangoli-preview'), 600, 600); const ctx = canvas.getContext('2d'); const color = document.getElementById('rangoli-color')?.value || '#fbbf24'; ctx.fillStyle = '#170a12'; ctx.fillRect(0, 0, 600, 600); ctx.translate(300, 300);
  for (let ring = 1; ring <= 5; ring++) for (let i = 0; i < 12; i++) { const angle = i * Math.PI / 6 + (ring % 2 ? .13 : 0); const x = Math.cos(angle) * ring * 42; const y = Math.sin(angle) * ring * 42; ctx.fillStyle = i % 2 ? '#f97316' : color; ctx.beginPath(); ctx.arc(x, y, 13 - ring, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.ellipse(0, 115, 28, 75, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
}
function randomizeRangoli() { drawRangoli(); }

function renderDiyaDecoration() {
  const el = document.getElementById('tool-widget-container'); el.innerHTML = `<div class="tool-widget diwali-tool-widget"><label class="form-label">Diya color</label><input id="diya-color" type="color" value="#f97316" class="color-input"><div id="diya-preview"></div><button class="btn-primary-glow" onclick="renderDiyaDecoration()">✨ Refresh diya</button></div>`; const canvas = diwaliCanvas(document.getElementById('diya-preview'), 640, 420); const ctx = canvas.getContext('2d'); drawFestiveBackground(ctx, 640, 420); ctx.textAlign = 'center'; ctx.font = '150px serif'; ctx.fillText('🪔', 320, 275); ctx.fillStyle = '#fde68a'; ctx.font = 'bold 30px Georgia'; ctx.fillText('Light over darkness', 320, 360);
}

function renderDiwaliCountdown() {
  const el = document.getElementById('tool-widget-container');
  el.innerHTML = `<div class="tool-widget diwali-countdown-widget"><div class="countdown-diya">🪔</div><h2>Next Diwali</h2><div class="diwali-countdown" id="diwali-countdown-value"></div><p>Keep the light, joy and kindness going.</p></div>`;
  const update = () => {
    const now = new Date();
    const dates = { 2026: [10, 8], 2027: [9, 29], 2028: [10, 12] };
    const parts = dates[now.getFullYear()] || [10, 20];
    let target = new Date(now.getFullYear(), parts[0], parts[1], 0, 0, 0);
    if (target <= now) {
      const next = dates[now.getFullYear() + 1] || [10, 20];
      target = new Date(now.getFullYear() + 1, next[0], next[1], 0, 0, 0);
    }
    const seconds = Math.max(0, Math.floor((target - now) / 1000));
    const d = Math.floor(seconds / 86400), h = Math.floor(seconds / 3600) % 24, m = Math.floor(seconds / 60) % 60, s = seconds % 60;
    const out = document.getElementById('diwali-countdown-value');
    if (out) out.textContent = `${d}d ${h}h ${m}m ${s}s`;
  };
  update();
  if (window._diwaliCountdown) window.clearInterval(window._diwaliCountdown);
  window._diwaliCountdown = window.setInterval(update, 1000);
}

function renderFestiveWallpaper() {
  const el = document.getElementById('tool-widget-container'); el.innerHTML = `<div class="tool-widget diwali-tool-widget"><label class="form-label">Wallpaper message</label><input id="wallpaper-message" class="form-input" value="Light. Joy. New beginnings."><div id="wallpaper-preview"></div></div>`; const draw = () => { const canvas = diwaliCanvas(document.getElementById('wallpaper-preview'), 720, 520); const ctx = canvas.getContext('2d'); drawFestiveBackground(ctx, 720, 520); ctx.textAlign = 'center'; ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 42px Georgia'; ctx.fillText('🪔', 360, 180); ctx.fillText(document.getElementById('wallpaper-message').value.slice(0, 32), 360, 290); ctx.fillStyle = '#fff7ed'; ctx.font = '22px Arial'; ctx.fillText('ToolHub 5D · Diwali Special', 360, 355); }; document.getElementById('wallpaper-message').addEventListener('input', draw); draw();
}

if (localStorage.getItem('th_diwali_theme') === '1') document.documentElement.classList.add('diwali-theme');
