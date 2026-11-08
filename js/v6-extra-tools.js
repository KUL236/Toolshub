/* v6-extra-tools.js — 8 more tools (all client-side, browser-native APIs only) */
'use strict';

function _wCard(inner) { return `<div class="tool-widget">${inner}</div>`; }

// ── TIMEZONE CONVERTER ──
const TZ_LIST = ['UTC','Asia/Kolkata','Asia/Dubai','Asia/Singapore','Asia/Tokyo','Asia/Shanghai','Europe/London','Europe/Paris','Europe/Berlin','America/New_York','America/Chicago','America/Los_Angeles','America/Sao_Paulo','Australia/Sydney','Pacific/Auckland'];
function renderTimezoneConverter() {
  document.getElementById('tool-widget-container').innerHTML = _wCard(`
    <div class="form-group" style="margin-bottom:1rem">
      <label class="form-label">Date & time</label>
      <input class="form-input" type="datetime-local" id="tz-input">
    </div>
    <div class="form-group" style="margin-bottom:1rem">
      <label class="form-label">From timezone</label>
      <select class="form-select" id="tz-from">${TZ_LIST.map(z => `<option ${z==='Asia/Kolkata'?'selected':''}>${z}</option>`).join('')}</select>
    </div>
    <button class="btn-primary-glow" onclick="convertTimezone()">🌍 Convert to all zones</button>
    <div id="tz-output" style="margin-top:1rem;display:flex;flex-direction:column;gap:.5rem"></div>`);
  document.getElementById('tz-input').value = new Date().toISOString().slice(0,16);
}
function convertTimezone() {
  const val = document.getElementById('tz-input').value;
  const fromZone = document.getElementById('tz-from').value;
  if (!val) { showToast('Pick a date & time first', 'warning'); return; }
  const localDate = new Date(val);
  const out = document.getElementById('tz-output');
  out.innerHTML = TZ_LIST.map(zone => {
    let formatted;
    try { formatted = new Intl.DateTimeFormat('en-US',{ dateStyle:'medium', timeStyle:'short', timeZone: zone }).format(localDate); }
    catch(e) { formatted = 'N/A'; }
    return `<div style="display:flex;justify-content:space-between;padding:.6rem .8rem;background:var(--glass2);border-radius:8px;font-size:.88rem">
      <span>${zone}${zone===fromZone?' (source)':''}</span><strong>${formatted}</strong></div>`;
  }).join('');
}

// ── UNIT CONVERTER ──
const UNIT_GROUPS = {
  length: { base:'m', units:{ m:1, km:1000, cm:0.01, mm:0.001, mi:1609.34, yd:0.9144, ft:0.3048, in:0.0254 } },
  weight: { base:'kg', units:{ kg:1, g:0.001, mg:0.000001, lb:0.453592, oz:0.0283495, ton:1000 } },
  volume: { base:'l', units:{ l:1, ml:0.001, gal:3.78541, qt:0.946353, cup:0.24 } },
  temperature: { base:'c', special:true },
};
function renderUnitConverter() {
  document.getElementById('tool-widget-container').innerHTML = _wCard(`
    <div class="form-group" style="margin-bottom:1rem">
      <label class="form-label">Category</label>
      <select class="form-select" id="uc-cat" onchange="renderUnitFields()">
        <option value="length">Length</option><option value="weight">Weight</option><option value="volume">Volume</option><option value="temperature">Temperature</option>
      </select>
    </div>
    <div id="uc-fields"></div>`);
  renderUnitFields();
}
function renderUnitFields() {
  const cat = document.getElementById('uc-cat').value;
  const group = UNIT_GROUPS[cat];
  const units = cat === 'temperature' ? ['c','f','k'] : Object.keys(group.units);
  document.getElementById('uc-fields').innerHTML = `
    <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
      <input class="form-input" type="number" id="uc-value" value="1" style="max-width:140px" oninput="runUnitConvert()">
      <select class="form-select" id="uc-from" style="max-width:120px" onchange="runUnitConvert()">${units.map(u=>`<option>${u}</option>`).join('')}</select>
      <span style="align-self:center">→</span>
      <select class="form-select" id="uc-to" style="max-width:120px" onchange="runUnitConvert()">${units.map((u,i)=>`<option ${i===1?'selected':''}>${u}</option>`).join('')}</select>
    </div>
    <div id="uc-result" class="tool-widget" style="text-align:center;font-size:1.3rem;font-weight:800"></div>`;
  runUnitConvert();
}
function runUnitConvert() {
  const cat = document.getElementById('uc-cat').value;
  const val = parseFloat(document.getElementById('uc-value').value) || 0;
  const from = document.getElementById('uc-from').value, to = document.getElementById('uc-to').value;
  let result;
  if (cat === 'temperature') {
    let celsius = from === 'c' ? val : from === 'f' ? (val - 32) * 5/9 : val - 273.15;
    result = to === 'c' ? celsius : to === 'f' ? celsius * 9/5 + 32 : celsius + 273.15;
  } else {
    const group = UNIT_GROUPS[cat];
    result = (val * group.units[from]) / group.units[to];
  }
  document.getElementById('uc-result').textContent = `${val} ${from} = ${Number(result.toFixed(6))} ${to}`;
}

// ── TEXT TO SPEECH ──
function renderTextToSpeech() {
  document.getElementById('tool-widget-container').innerHTML = _wCard(`
    <div class="form-group" style="margin-bottom:1rem">
      <label class="form-label">Text to speak</label>
      <textarea class="form-textarea" id="tts-input" style="min-height:120px" placeholder="Type something to hear it out loud...">Welcome to ToolHub 5D!</textarea>
    </div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
      <select class="form-select" id="tts-voice" style="max-width:220px"></select>
      <input class="form-input" type="range" id="tts-rate" min="0.5" max="2" step="0.1" value="1" style="max-width:140px">
    </div>
    <div style="display:flex;gap:.75rem">
      <button class="btn-primary-glow" onclick="speakTTS()">🔊 Speak</button>
      <button class="btn-outline-glow" onclick="window.speechSynthesis.cancel()">⏹ Stop</button>
    </div>`);
  const populate = () => {
    const voices = window.speechSynthesis.getVoices();
    document.getElementById('tts-voice').innerHTML = voices.map((v,i)=>`<option value="${i}">${v.name} (${v.lang})</option>`).join('') || '<option>Default voice</option>';
  };
  populate();
  window.speechSynthesis.onvoiceschanged = populate;
}
function speakTTS() {
  const text = document.getElementById('tts-input').value.trim();
  if (!text) { showToast('Type something first', 'warning'); return; }
  if (!window.speechSynthesis) { showToast('Speech not supported on this browser', 'error'); return; }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const idx = document.getElementById('tts-voice').value;
  if (voices[idx]) utter.voice = voices[idx];
  utter.rate = parseFloat(document.getElementById('tts-rate').value) || 1;
  window.speechSynthesis.speak(utter);
}

// ── STOPWATCH & LAP TIMER ──
function renderStopwatch() {
  window._sw = { running: false, startTs: 0, elapsed: 0, laps: [], interval: null };
  document.getElementById('tool-widget-container').innerHTML = _wCard(`
    <div style="text-align:center">
      <div id="sw-display" style="font-family:var(--font-display);font-size:2.6rem;font-weight:800;margin:1rem 0">00:00.00</div>
      <div style="display:flex;gap:.75rem;justify-content:center;margin-bottom:1rem">
        <button class="btn-primary-glow" id="sw-toggle" onclick="toggleStopwatch()">▶️ Start</button>
        <button class="btn-outline-glow" onclick="lapStopwatch()">🚩 Lap</button>
        <button class="btn-outline-glow" onclick="resetStopwatch()">🔄 Reset</button>
      </div>
      <div id="sw-laps" style="max-height:220px;overflow-y:auto;text-align:left"></div>
    </div>`);
}
function _swFormat(ms) {
  const m = String(Math.floor(ms/60000)).padStart(2,'0');
  const s = String(Math.floor((ms%60000)/1000)).padStart(2,'0');
  const cs = String(Math.floor((ms%1000)/10)).padStart(2,'0');
  return `${m}:${s}.${cs}`;
}
function toggleStopwatch() {
  const s = window._sw; const btn = document.getElementById('sw-toggle');
  if (s.running) {
    s.running = false; clearInterval(s.interval); s.elapsed += Date.now() - s.startTs; btn.textContent = '▶️ Resume';
  } else {
    s.running = true; s.startTs = Date.now(); btn.textContent = '⏸ Pause';
    s.interval = setInterval(() => { document.getElementById('sw-display').textContent = _swFormat(s.elapsed + (Date.now() - s.startTs)); }, 30);
  }
}
function lapStopwatch() {
  const s = window._sw; const now = s.elapsed + (s.running ? Date.now() - s.startTs : 0);
  s.laps.unshift(now);
  document.getElementById('sw-laps').innerHTML = s.laps.map((t,i) => `<div style="padding:.4rem .6rem;background:var(--glass2);border-radius:6px;margin-bottom:4px;display:flex;justify-content:space-between;font-size:.85rem"><span>Lap ${s.laps.length-i}</span><strong>${_swFormat(t)}</strong></div>`).join('');
}
function resetStopwatch() {
  const s = window._sw; clearInterval(s.interval);
  s.running = false; s.elapsed = 0; s.laps = [];
  document.getElementById('sw-display').textContent = '00:00.00';
  document.getElementById('sw-toggle').textContent = '▶️ Start';
  document.getElementById('sw-laps').innerHTML = '';
}

// ── TIP CALCULATOR ──
function renderTipCalculator() {
  document.getElementById('tool-widget-container').innerHTML = _wCard(`
    <div class="form-group" style="margin-bottom:1rem"><label class="form-label">Bill amount</label>
      <input class="form-input" type="number" id="tip-bill" value="1000" oninput="calcTip()"></div>
    <div class="form-group" style="margin-bottom:1rem"><label class="form-label">Tip %: <span id="tip-pct-val">10</span>%</label>
      <input type="range" id="tip-pct" min="0" max="30" value="10" style="width:100%" oninput="document.getElementById('tip-pct-val').textContent=this.value;calcTip()"></div>
    <div class="form-group" style="margin-bottom:1rem"><label class="form-label">Split between (people)</label>
      <input class="form-input" type="number" id="tip-people" value="1" min="1" oninput="calcTip()"></div>
    <div id="tip-result" class="tool-widget" style="text-align:center"></div>`);
  calcTip();
}
function calcTip() {
  const bill = parseFloat(document.getElementById('tip-bill').value) || 0;
  const pct = parseFloat(document.getElementById('tip-pct').value) || 0;
  const people = Math.max(1, parseInt(document.getElementById('tip-people').value) || 1);
  const tip = bill * pct / 100; const total = bill + tip;
  document.getElementById('tip-result').innerHTML = `
    <p>Tip amount: <strong>₹${tip.toFixed(2)}</strong></p>
    <p>Total bill: <strong>₹${total.toFixed(2)}</strong></p>
    <p style="font-size:1.3rem;font-weight:800;color:var(--indigo);margin-top:.5rem">₹${(total/people).toFixed(2)} <span style="font-size:.8rem;color:var(--text2)">/ person</span></p>`;
}

// ── LOREM IPSUM GENERATOR ──
const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat'.split(' ');
function renderLoremIpsum() {
  document.getElementById('tool-widget-container').innerHTML = _wCard(`
    <div class="form-group" style="margin-bottom:1rem"><label class="form-label">Paragraphs: <span id="li-val">3</span></label>
      <input type="range" id="li-count" min="1" max="10" value="3" style="width:100%" oninput="document.getElementById('li-val').textContent=this.value;genLorem()"></div>
    <button class="btn-primary-glow" onclick="genLorem()" style="margin-bottom:1rem">📝 Generate</button>
    <textarea class="form-textarea" id="li-output" readonly style="min-height:220px;width:100%"></textarea>
    <button class="btn-outline-glow" style="margin-top:.75rem" onclick="copyToClipboard(document.getElementById('li-output').value,'Copied!')">📋 Copy</button>`);
  genLorem();
}
function genLorem() {
  const n = parseInt(document.getElementById('li-count').value) || 3;
  const paras = [];
  for (let p = 0; p < n; p++) {
    let words = [];
    const len = 40 + Math.floor(Math.random()*30);
    for (let i=0;i<len;i++) words.push(LOREM_WORDS[Math.floor(Math.random()*LOREM_WORDS.length)]);
    let text = words.join(' '); text = text.charAt(0).toUpperCase()+text.slice(1)+'.';
    paras.push(text);
  }
  document.getElementById('li-output').value = paras.join('\n\n');
}

// ── COLOR CONTRAST CHECKER ──
function renderContrastChecker() {
  document.getElementById('tool-widget-container').innerHTML = _wCard(`
    <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">
      <div class="form-group"><label class="form-label">Text color</label><input type="color" id="cc-fg" value="#e8e8ff" oninput="checkContrast()" style="width:70px;height:44px"></div>
      <div class="form-group"><label class="form-label">Background color</label><input type="color" id="cc-bg" value="#06060f" oninput="checkContrast()" style="width:70px;height:44px"></div>
    </div>
    <div id="cc-preview" style="padding:2rem;border-radius:12px;text-align:center;font-size:1.2rem;font-weight:700;margin-bottom:1rem">Sample Text Preview</div>
    <div id="cc-result" class="tool-widget" style="text-align:center"></div>`);
  checkContrast();
}
function _ccLuminance(hex) {
  const rgb = [1,3,5].map(i => parseInt(hex.substr(i,2),16)/255).map(c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4));
  return 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
}
function checkContrast() {
  const fg = document.getElementById('cc-fg').value, bg = document.getElementById('cc-bg').value;
  const l1 = _ccLuminance(fg)+0.05, l2 = _ccLuminance(bg)+0.05;
  const ratio = (Math.max(l1,l2)/Math.min(l1,l2)).toFixed(2);
  const preview = document.getElementById('cc-preview');
  preview.style.color = fg; preview.style.background = bg; preview.style.border = '1px solid var(--border)';
  const passAA = ratio >= 4.5, passAAA = ratio >= 7;
  document.getElementById('cc-result').innerHTML = `
    <p style="font-size:1.5rem;font-weight:800">${ratio}:1</p>
    <p>${passAAA ? '✅ Passes AAA' : passAA ? '✅ Passes AA' : '❌ Fails WCAG contrast'} (normal text)</p>`;
}

// ── TYPING SPEED TEST ──
const TYPING_SAMPLES = [
  'The quick brown fox jumps over the lazy dog near the riverbank every morning.',
  'ToolHub gives you two hundred free tools for images, video, audio and productivity.',
  'Practice makes a person perfect, and consistent effort always beats raw talent.',
];
function renderTypingTest() {
  window._tt = { text: TYPING_SAMPLES[Math.floor(Math.random()*TYPING_SAMPLES.length)], startTs: null, done: false };
  document.getElementById('tool-widget-container').innerHTML = _wCard(`
    <p id="tt-sample" style="font-size:1rem;line-height:1.7;color:var(--text2);margin-bottom:1rem;padding:1rem;background:var(--glass2);border-radius:10px">${window._tt.text}</p>
    <textarea class="form-textarea" id="tt-input" placeholder="Start typing here..." style="min-height:100px;width:100%" oninput="checkTyping()"></textarea>
    <div style="display:flex;gap:1.5rem;margin-top:1rem">
      <div>WPM: <strong id="tt-wpm">0</strong></div>
      <div>Accuracy: <strong id="tt-acc">100%</strong></div>
    </div>
    <button class="btn-outline-glow" style="margin-top:1rem" onclick="renderTypingTest()">🔄 New Test</button>`);
}
function checkTyping() {
  const s = window._tt;
  if (!s.startTs) s.startTs = Date.now();
  const typed = document.getElementById('tt-input').value;
  let correct = 0;
  for (let i=0;i<typed.length;i++) if (typed[i]===s.text[i]) correct++;
  const acc = typed.length ? Math.round((correct/typed.length)*100) : 100;
  document.getElementById('tt-acc').textContent = acc + '%';
  const mins = (Date.now()-s.startTs)/60000;
  const wpm = mins>0 ? Math.round((typed.trim().split(/\s+/).length)/mins) : 0;
  document.getElementById('tt-wpm').textContent = wpm;
  if (typed === s.text && !s.done) { s.done = true; showToast(`🎉 Done! ${wpm} WPM, ${acc}% accuracy`, 'success'); }
}

window.EXTRA_TOOL_WIDGETS = window.EXTRA_TOOL_WIDGETS || {};
Object.assign(window.EXTRA_TOOL_WIDGETS, {
  'timezone-converter': renderTimezoneConverter,
  'unit-converter': renderUnitConverter,
  'text-to-speech': renderTextToSpeech,
  'stopwatch-timer': renderStopwatch,
  'tip-calculator': renderTipCalculator,
  'lorem-ipsum-gen': renderLoremIpsum,
  'color-contrast-checker': renderContrastChecker,
  'typing-speed-test': renderTypingTest,
});
