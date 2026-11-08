const { JSDOM } = require('jsdom');
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html><html><body>
  <div id="tool-view"><div class="tool-page-title"></div><div id="tool-widget-container"></div><div id="tool-seo-content"></div></div>
  <div id="game-view"></div>
</body></html>`, { url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true });

const { window } = dom;
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.localStorage = { _d:{}, getItem(k){return this._d[k]||null;}, setItem(k,v){this._d[k]=String(v);}, removeItem(k){delete this._d[k];} };
window.localStorage = global.localStorage;
global.sessionStorage = { _d:{}, getItem(k){return this._d[k]||null;}, setItem(k,v){this._d[k]=String(v);}, removeItem(k){delete this._d[k];} };
window.sessionStorage = global.sessionStorage;
global.fetch = async () => ({ ok: true, json: async () => ({}) });
window.URL.createObjectURL = () => 'blob://fake';
window.speechSynthesis = { getVoices: () => [], speak: () => {}, cancel: () => {} };
window.SpeechSynthesisUtterance = function(t){ this.text = t; };
window.JSZip = function(){ return { file(){}, generateAsync: async () => new Blob([]) }; };
window._rafCount = 0;
window.requestAnimationFrame = (cb) => { if (window._rafCount++ < 3) { cb(); } };
global.requestAnimationFrame = window.requestAnimationFrame;

// ── Minimal stand-ins for app-level globals every tool file expects ──
window.App = { currentPage: 'tool', recentTools: [], favorites: [] };
window.Auth = { user: { id: 'test-user' } }; // simulate logged-in so gating code paths are also exercised
window.navigate = function () {}; // stubbed — real app.js navigation not loaded in this harness
window.toggleFav = function () {};
window.shareTool = function () {};
global.navigate = window.navigate;
window.showToast = () => {};
window.dbInsert = async () => ({});
window.supabaseClient = {};
window.copyToClipboard = () => {};
window.gameHeader = (name, icon) => `<div class="game-header"><h2>${icon} ${name}</h2></div>`;
global.showToast = window.showToast;
global.dbInsert = window.dbInsert;
global.copyToClipboard = window.copyToClipboard;
global.gameHeader = window.gameHeader;
global.App = window.App;
global.Auth = window.Auth;

function loadScript(path, appendCode) {
  const code = fs.readFileSync(path, 'utf8') + (appendCode || '');
  const el = window.document.createElement('script');
  el.textContent = code;
  window.document.body.appendChild(el);
}

const results = { tools: [], games: [] };

try {
  loadScript('js/tools-data.js', '\nwindow.ALL_TOOLS = ALL_TOOLS; window.GAMES_DATA = GAMES_DATA; window.CATEGORIES = CATEGORIES;');
  global.ALL_TOOLS = window.ALL_TOOLS; global.GAMES_DATA = window.GAMES_DATA; global.CATEGORIES = window.CATEGORIES;
  loadScript('js/tools.js');
  loadScript('js/games.js');
  loadScript('js/media-tools.js');
  loadScript('js/ai-huggingface-tools.js');
  loadScript('js/v6-extra-tools.js');
  loadScript('js/games-new.js');
  global.renderToolPage = window.renderToolPage;
  global.openGame = window.openGame;
} catch (e) {
  console.error('FATAL during script load:', e.message);
  process.exit(1);
}

console.log(`Loaded ${window.ALL_TOOLS.length} tools, ${window.GAMES_DATA.length} games.\n`);

for (const tool of window.ALL_TOOLS) {
  try {
    window.document.getElementById('tool-widget-container').innerHTML = '';
    window.document.querySelector('#tool-view .tool-page-title').textContent = tool.name;
    window.renderToolPage(tool);
    const html = window.document.getElementById('tool-widget-container').innerHTML;
    if (!html || html.trim().length < 10) {
      results.tools.push({ id: tool.id, status: 'EMPTY_OUTPUT' });
    } else if (html.includes('coming soon') || html.includes('Coming Soon')) {
      results.tools.push({ id: tool.id, status: 'COMING_SOON_STUB' });
    } else {
      results.tools.push({ id: tool.id, status: 'OK' });
    }
  } catch (e) {
    results.tools.push({ id: tool.id, status: 'ERROR', error: e.message });
  }
}

const TOOL_REDIRECT_GAMES = new Set(['dice-roller', 'wheel-spinner', 'truth-dare-game']); // these intentionally call navigate('tool') + renderToolPage(), not #game-view

for (const game of window.GAMES_DATA) {
  try {
    window._rafCount = 0;
    window.document.getElementById('game-view').innerHTML = '';
    window.openGame(game.id);
    if (TOOL_REDIRECT_GAMES.has(game.id)) {
      const toolHtml = window.document.getElementById('tool-widget-container')?.innerHTML;
      results.games.push({ id: game.id, status: (toolHtml && toolHtml.trim().length > 10) ? 'OK' : 'EMPTY_OUTPUT' });
      continue;
    }
    const html = window.document.getElementById('game-view').innerHTML;
    if (!html || html.trim().length < 10) results.games.push({ id: game.id, status: 'EMPTY_OUTPUT' });
    else if (/coming soon/i.test(html)) results.games.push({ id: game.id, status: 'COMING_SOON_STUB' });
    else results.games.push({ id: game.id, status: 'OK' });
  } catch (e) {
    results.games.push({ id: game.id, status: 'ERROR', error: e.message });
  }
}

const toolFails = results.tools.filter(r => r.status !== 'OK');
const gameFails = results.games.filter(r => r.status !== 'OK');

console.log(`TOOLS: ${results.tools.length - toolFails.length}/${results.tools.length} render OK`);
toolFails.forEach(f => console.log(`  [${f.status}] ${f.id}${f.error ? ' -> ' + f.error : ''}`));

console.log(`\nGAMES: ${results.games.length - gameFails.length}/${results.games.length} render OK`);
gameFails.forEach(f => console.log(`  [${f.status}] ${f.id}${f.error ? ' -> ' + f.error : ''}`));

fs.writeFileSync('/tmp/render_test_results.json', JSON.stringify(results, null, 2));
