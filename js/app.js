/* app.js — ToolHub 5D Main Application Controller */
'use strict';

const App = {
  currentPage: 'home',
  favorites: JSON.parse(localStorage.getItem('th_favs') || '[]'),
  recentTools: JSON.parse(localStorage.getItem('th_recent') || '[]'),
  toolStats: JSON.parse(localStorage.getItem('th_stats') || '{}'),
  darkMode: (window.ThemeSystem ? window.ThemeSystem.getMode() : localStorage.getItem('th_theme') !== 'light'),
  pwaInstallPrompt: null,
  internetEnabled: true,
};

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initNativeStatusBar();
  applyTheme();
  initParticles();
  initSearch();
  initPWA();
  renderHomePage();
  renderAllCategoryGrids();
  renderFeedbackForm('feedback');
  updateFavCount();
  renderRecentSection();
  renderFavSection();
  initAuth();
  initNativeAuthCallback();
  handleURLHash();
  setTimeout(renderAdminPage, 500);
  // Scroll navbar effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 10);
  });

  function initNativeStatusBar() {
    const statusBar = window.Capacitor?.Plugins?.StatusBar;
    if (!statusBar) return;
    document.documentElement.classList.add('native-app');
    Promise.all([
      statusBar.setOverlaysWebView({ overlay: false }),
      statusBar.setStyle({ style: 'DARK' }),
      statusBar.setBackgroundColor({ color: '#0a0a1a' }),
    ]).catch((error) => {
      console.error('Unable to configure the native status bar:', error);
    });
  }
});

// ── NAVIGATION ──
function navigate(page, data) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));

  let pageId = 'page-' + page;

  if (page === 'tool' && data) {
    renderToolPage(data);
  } else if (page === 'tool') {
    // already set above
  } else if (page === 'game') {
    // already set above
  } else if (page === 'ai-assistant') {
    pageId = 'page-ai-assistant';
  } else if (page === 'compilers') {
    pageId = 'page-compilers';
    if (typeof renderCompilers === 'function') renderCompilers();
  } else if (page === 'admin') {
    pageId = 'page-admin';
    renderAdminPage();
  } else if (page === 'favorites') {
    pageId = 'page-favorites';
    renderFavoritesGrid();
  } else if (page === 'recent') {
    pageId = 'page-recent';
    renderRecentGrid();
  } else if (page === 'refer') {
    pageId = 'page-refer';
    if (typeof renderReferPage === 'function') renderReferPage();
  }

  const pageEl = document.getElementById(pageId);
  if (pageEl) {
    pageEl.classList.add('active');
    App.currentPage = page;
    // Close sidebar on mobile
    if (window.innerWidth < 1200) closeSidebar();
    // Update sidebar active
    const sidebarBtn = document.querySelector(`.sidebar-item[data-page="${page}"]`);
    if (sidebarBtn) sidebarBtn.classList.add('active');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update URL
    history.pushState({ page }, '', `#${page}`);
  }
}

function openTool(toolId) {
  navigate('tool');
  renderToolPage(toolId);
  addToRecent(toolId);
  trackToolUsage(toolId);
}

function handleURLHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const parts = hash.split('/');
  if (parts[0] === 'tool' && parts[1]) openTool(parts[1]);
  else if (parts[0] === 'game' && parts[1]) openGame(parts[1]);
  else navigate(parts[0] || 'home');
}

window.addEventListener('popstate', e => {
  if (e.state?.page) navigate(e.state.page);
  else navigate('home');
});

// ── SIDEBAR ──
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('show');
}

// Sidebar search
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sidebar-search')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.style.display = q && !el.textContent.toLowerCase().includes(q) ? 'none' : '';
    });
  });
});

// ── THEME ──
function toggleTheme() {
  var nextMode = App.darkMode ? 'light' : 'dark';
  App.darkMode = nextMode === 'dark';
  if (window.ThemeSystem) window.ThemeSystem.setMode(nextMode);
  localStorage.setItem('th_theme', App.darkMode ? 'dark' : 'light');
  // brief class so colours cross-fade instead of snapping
  var root = document.documentElement;
  root.classList.add('theme-fade');
  applyTheme();
  clearTimeout(toggleTheme._t);
  toggleTheme._t = setTimeout(function () { root.classList.remove('theme-fade'); }, 400);
}
function applyTheme() {
  if (window.ThemeSystem) {
    App.darkMode = ThemeSystem.getMode() === 'dark';
    ThemeSystem.apply();
  } else {
    document.documentElement.setAttribute('data-theme', App.darkMode ? 'dark' : 'light');
  }
  var icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = App.darkMode ? '☀️' : '🌙';
}

function toggleThemePanel() {
  var panel = document.getElementById('theme-panel');
  var backdrop = document.getElementById('theme-panel-backdrop');
  if (!panel) return;
  var open = !panel.classList.contains('open');
  if (open) {  // never stack on top of the notification list or the account menu
    document.getElementById('notif-panel')?.classList.remove('open');
    document.getElementById('auth-menu')?.classList.remove('open');
  }
  panel.classList.toggle('open', open);
  if (backdrop) backdrop.classList.toggle('show', open);
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  if (open) renderThemePanel();
}

function setAppearanceMode(mode) {
  if (!window.ThemeSystem) return;
  ThemeSystem.setMode(mode);
  App.darkMode = ThemeSystem.getMode() === 'dark';
  applyTheme();
}

function renderThemePanel() {
  if (!window.ThemeSystem) return;
  var grid = document.getElementById('theme-grid');
  var gradientOptions = document.getElementById('gradient-options');
  if (grid) {
    grid.innerHTML = ThemeSystem.palettes.map(function (theme) {
      var selected = !ThemeSystem.state.custom && ThemeSystem.state.palette === theme.id;
      return '<button class="theme-swatch' + (selected ? ' active' : '') + '" data-theme-id="' + theme.id + '" onclick="selectThemePalette(\'' + theme.id + '\')" aria-pressed="' + selected + '">' +
        '<span class="swatch-colors"><i style="background:' + theme.primary + '"></i><i style="background:' + theme.secondary + '"></i><i style="background:' + theme.accent + '"></i></span>' +
        '<span>' + theme.name + '</span>' + (selected ? '<b>✓</b>' : '') + '</button>';
    }).join('');
  }
  if (gradientOptions) {
    gradientOptions.innerHTML = ThemeSystem.gradients.map(function (gradient) {
      var selected = ThemeSystem.state.custom && ThemeSystem.state.custom.gradient === gradient.id;
      return '<button class="gradient-option' + (selected ? ' active' : '') + '" style="--gradient-option:' + gradient.value + '" onclick="selectGradient(\'' + gradient.id + '\')" aria-label="' + gradient.name + '" aria-pressed="' + selected + '"></button>';
    }).join('');
  }
  document.querySelectorAll('[data-theme-mode]').forEach(function (button) {
    button.classList.toggle('active', button.getAttribute('data-theme-mode') === ThemeSystem.state.mode);
  });
  syncCustomControls();
  updateThemePreview();
}

function updateThemePanel() {
  if (document.getElementById('theme-panel')?.classList.contains('open')) renderThemePanel();
}

function selectThemePalette(id) {
  ThemeSystem.setPalette(id);
  App.darkMode = ThemeSystem.getMode() === 'dark';
  applyTheme();
  renderThemePanel();
}

function syncCustomControls() {
  var custom = ThemeSystem && ThemeSystem.state.custom;
  var palette = custom || ThemeSystem.palettes.find(function (item) { return item.id === ThemeSystem.state.palette; });
  if (!palette) return;
  document.querySelectorAll('[data-custom-color]').forEach(function (input) {
    var key = input.getAttribute('data-custom-color');
    if (palette[key]) input.value = palette[key];
  });
}

function updateThemePreview() {
  var preview = document.getElementById('theme-preview');
  if (!preview || !window.ThemeSystem) return;
  var custom = {};
  document.querySelectorAll('[data-custom-color]').forEach(function (input) {
    custom[input.getAttribute('data-custom-color')] = input.value;
  });
  preview.style.setProperty('--preview-primary', custom.primary);
  preview.style.setProperty('--preview-secondary', custom.secondary);
  preview.style.setProperty('--preview-accent', custom.accent);
  preview.style.setProperty('--preview-bg', custom.background);
  preview.style.setProperty('--preview-surface', custom.surface);
  preview.style.setProperty('--preview-gradient', getSelectedGradientValue());
}

function getSelectedGradientValue() {
  var selected = document.querySelector('.gradient-option.active');
  return selected ? selected.style.getPropertyValue('--gradient-option') : 'linear-gradient(135deg, var(--preview-primary), var(--preview-secondary))';
}

function selectGradient(id) {
  document.querySelectorAll('.gradient-option').forEach(function (button) {
    button.classList.toggle('active', button.getAttribute('aria-label') === ThemeSystem.gradients.find(function (item) { return item.id === id; }).name);
  });
  updateThemePreview();
}

function applyCustomTheme() {
  var values = {};
  document.querySelectorAll('[data-custom-color]').forEach(function (input) {
    values[input.getAttribute('data-custom-color')] = input.value;
  });
  var activeGradient = document.querySelector('.gradient-option.active');
  var gradientId = activeGradient ? ThemeSystem.gradients.find(function (item) { return item.name === activeGradient.getAttribute('aria-label'); }).id : 'linear';
  values.gradient = gradientId;
  values.gradientValue = gradientId === 'solid'
    ? values.primary
    : gradientId === 'aurora'
      ? 'linear-gradient(135deg, ' + values.primary + ', ' + values.accent + ', ' + values.secondary + ')'
      : gradientId === 'soft'
        ? 'linear-gradient(135deg, ' + values.primary + '33, ' + values.secondary + '1f)'
        : 'linear-gradient(135deg, ' + values.primary + ', ' + values.secondary + ')';
  ThemeSystem.setCustom(values);
  App.darkMode = ThemeSystem.getMode() === 'dark';
  applyTheme();
  renderThemePanel();
  showToast('Custom theme applied', 'success');
}

function resetTheme() {
  ThemeSystem.reset();
  App.darkMode = true;
  applyTheme();
  renderThemePanel();
  showToast('Theme reset to default', 'info');
}

document.addEventListener('input', function (event) {
  if (event.target.matches('[data-custom-color]')) updateThemePreview();
});
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && document.getElementById('theme-panel')?.classList.contains('open')) toggleThemePanel();
});

// ── SEARCH ──
function initSearch() {
  const input = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.classList.remove('show'); return; }
    const results = [...ALL_TOOLS, ...GAMES_DATA].filter(t =>
      t.name.toLowerCase().includes(q) || t.desc?.toLowerCase().includes(q) || t.cat?.includes(q)
    ).slice(0, 8);
    dropdown.innerHTML = results.length
      ? results.map(t => `<div class="search-result-item" onclick="handleSearchSelect('${t.id}')">
          <span class="sri-icon">${t.icon || '🎮'}</span>
          <div class="sri-info"><div class="sri-name">${t.name}</div><div class="sri-cat">${t.cat || 'game'}</div></div>
        </div>`).join('')
      : '<div class="no-results">🔍 No tools found</div>';
    dropdown.classList.add('show');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim().toLowerCase();
      const first = [...ALL_TOOLS, ...GAMES_DATA].find(t =>
        t.name.toLowerCase().includes(q) || t.desc?.toLowerCase().includes(q) || t.cat?.includes(q)
      );
      if (first) { handleSearchSelect(first.id); dropdown.classList.remove('show'); }
    }
    if (e.key === 'Escape') { dropdown.classList.remove('show'); input.blur(); }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.navbar-search-wrap')) dropdown.classList.remove('show');
  });
}

function handleSearchSelect(id) {
  document.getElementById('search-dropdown')?.classList.remove('show');
  document.getElementById('search-input').value = '';
  const isGame = GAMES_DATA.find(g => g.id === id);
  if (isGame) openGame(id);
  else openTool(id);
}

// Voice search
let voiceActive = false;
document.getElementById('voice-btn')?.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    showToast('Voice not supported in this browser', 'warning'); return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SpeechRecognition();
  rec.lang = 'en-IN'; rec.interimResults = false;
  voiceActive = true;
  document.getElementById('voice-btn').classList.add('active');
  rec.start();
  rec.onresult = e => {
    document.getElementById('search-input').value = e.results[0][0].transcript;
    document.getElementById('search-input').dispatchEvent(new Event('input'));
  };
  rec.onend = () => { voiceActive = false; document.getElementById('voice-btn')?.classList.remove('active'); };
  rec.onerror = () => { voiceActive = false; document.getElementById('voice-btn')?.classList.remove('active'); };
});

// ── HOME PAGE RENDERING ──
function renderHomePage() {
  renderPopularTools();
  renderRecentSection();
  renderFavSection();
}

function renderPopularTools() {
  const el = document.getElementById('popular-tools-grid');
  if (!el) return;
  const popular = ALL_TOOLS.filter(t => t.popular).slice(0, 10);
  el.innerHTML = popular.map(t => createToolCard(t)).join('');
}

function renderAllCategoryGrids() {
  const cats = [
    { id: 'ai-tools', filter: t => t.cat === 'ai' },
    { id: 'pdf-tools', filter: t => t.cat === 'pdf' },
    { id: 'image-tools', filter: t => t.cat === 'image' },
    { id: 'developer-tools', filter: t => t.cat === 'developer' },
    { id: 'finance-tools', filter: t => t.cat === 'finance' },
    { id: 'student-tools', filter: t => t.cat === 'student' },
    { id: 'health-tools', filter: t => t.cat === 'health' },
    { id: 'fun-tools', filter: t => t.cat === 'fun' },
  ];
  cats.forEach(({ id, filter }) => {
    const el = document.getElementById(id + '-grid');
    if (el) el.innerHTML = ALL_TOOLS.filter(filter).map(t => createToolCard(t)).join('');
  });
  // All tools grid
  const allEl = document.getElementById('all-tools-grid');
  if (allEl) allEl.innerHTML = ALL_TOOLS.map(t => createToolCard(t)).join('');
  // Games scroll (homepage thumbnails) — dynamic from GAMES_DATA
  const gamesScrollEl = document.getElementById('games-scroll');
  if (gamesScrollEl) gamesScrollEl.innerHTML = GAMES_DATA.map(g =>
    `<div class="game-thumb" onclick="openGame('${g.id}')"><div class="gt-img">${g.icon}</div><div class="gt-name">${g.name}</div></div>`
  ).join('');
  // Games grid — premium cards
  const gamesEl = document.getElementById('games-grid');
  if (gamesEl) {
    gamesEl.innerHTML = GAMES_DATA.map((g,i) => gpBuildCard(g,i)).join('');
    gpRenderTrending();
    gpUpdateCount();
    gpStartDailyTimer();
  }
  // All-tools cats filter
  const catsEl = document.getElementById('all-tools-cats');
  if (catsEl) {
    catsEl.innerHTML = CATEGORIES.map(c =>
      `<button class="cat-chip ${c.id === 'all' ? 'active' : ''}" onclick="filterAllTools('',this,'${c.id}')">${c.icon} ${c.label}</button>`).join('');
  }
}

function createToolCard(tool) {
  const isFav = App.favorites.includes(tool.id);
  const isOnline = !!tool.online;
  const internetOff = !App.internetEnabled;
  const disabledClass = (isOnline && internetOff) ? ' internet-disabled' : '';
  const onlineDot = isOnline ? `<span class="tc-online-dot" title="Requires internet"></span>` : '';
  return `<div class="tool-card${disabledClass}" data-cat="${tool.cat}" data-id="${tool.id}" data-online="${isOnline}" onclick="openTool('${tool.id}')">
    <button class="tc-fav ${isFav ? 'active' : ''}" onclick="event.stopPropagation();toggleFav(event,'${tool.id}')" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite">
      ${isFav ? '⭐' : '☆'}
    </button>
    <div class="tc-icon">${tool.icon}${onlineDot}</div>
    <div class="tc-name">${tool.name}</div>
    <div class="tc-desc">${tool.desc}</div>
    <div class="tc-footer">
      ${tool.badge ? `<span class="tc-badge ${tool.badge}">${tool.badge === 'new' ? 'NEW' : tool.badge === 'ai' ? 'AI' : 'HOT'}</span>` : '<span></span>'}
      <button class="tc-open-btn" onclick="event.stopPropagation();openTool('${tool.id}')">
        ${tool.cat === 'games' ? '▶ Play' : 'Open →'}
      </button>
    </div>
  </div>`;
}

// ── INTERNET TOGGLE ──
function handleInternetToggle(checked) {
  App.internetEnabled = checked;
  // Vibrate on OFF — pattern: two short pulses
  if (!checked && navigator.vibrate) {
    navigator.vibrate([80, 60, 120]);
  }
  const statusEl = document.getElementById('it-status');
  if (statusEl) {
    statusEl.textContent = checked ? 'ON' : 'OFF';
    statusEl.className = checked ? 'it-status' : 'it-status off';
  }
  // Update all rendered tool cards across all grids
  document.querySelectorAll('.tool-card[data-online="true"]').forEach(card => {
    if (checked) {
      card.classList.remove('internet-disabled');
    } else {
      card.classList.add('internet-disabled');
    }
  });
}

function filterAllTools(query, btn, cat) {
  if (btn) {
    document.querySelectorAll('#all-tools-cats .cat-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const activeCat = cat || (document.querySelector('#all-tools-cats .cat-chip.active')?.textContent?.toLowerCase().trim()) || 'all';
  const filterInput = document.getElementById('tools-filter-input');
  const q = (query !== undefined ? query : filterInput?.value || '').toLowerCase();
  const el = document.getElementById('all-tools-grid');
  if (!el) return;
  const filtered = ALL_TOOLS.filter(t => {
    const catMatch = !activeCat || activeCat.includes('all') || t.cat === activeCat;
    const qMatch = !q || t.name.toLowerCase().includes(q) || t.desc?.toLowerCase().includes(q);
    return catMatch && qMatch;
  });
  el.innerHTML = filtered.length ? filtered.map(t => createToolCard(t)).join('') : '<div class="no-results" style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text3)">🔍 No tools found</div>';
}

// ── FAVORITES ──
function toggleFav(event, toolId) {
  event.stopPropagation();
  const idx = App.favorites.indexOf(toolId);
  if (idx === -1) {
    App.favorites.push(toolId);
    showToast('⭐ Added to favorites!', 'success');
    if (Auth?.user) saveFavToDB(toolId);
  } else {
    App.favorites.splice(idx, 1);
    showToast('Removed from favorites', 'info');
    if (Auth?.user) removeFavFromDB(toolId);
  }
  localStorage.setItem('th_favs', JSON.stringify(App.favorites));
  updateFavCount();
  refreshFavButtons(toolId);
  renderFavSection();
}

function refreshFavButtons(toolId) {
  const isFav = App.favorites.includes(toolId);
  document.querySelectorAll(`[data-id="${toolId}"] .tc-fav`).forEach(btn => {
    btn.textContent = isFav ? '⭐' : '☆';
    btn.classList.toggle('active', isFav);
  });
  const toolBtn = document.getElementById('tool-fav-btn');
  if (toolBtn) {
    toolBtn.textContent = isFav ? '⭐ Favorited' : '☆ Favorite';
    toolBtn.classList.toggle('active', isFav);
  }
}

function updateFavCount() {
  const el = document.getElementById('fav-count');
  if (el) el.textContent = App.favorites.length;
}

function renderFavoritesGrid() {
  const el = document.getElementById('favorites-grid');
  if (!el) return;
  const favTools = ALL_TOOLS.filter(t => App.favorites.includes(t.id));
  el.innerHTML = favTools.length
    ? favTools.map(t => createToolCard(t)).join('')
    : '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text3)">⭐ No favorites yet! Click the ☆ on any tool to save it.</div>';
}

function renderFavSection() {
  const el = document.getElementById('fav-chips');
  if (!el) return;
  const favTools = ALL_TOOLS.filter(t => App.favorites.includes(t.id)).slice(0, 8);
  el.innerHTML = favTools.length
    ? favTools.map(t => `<span class="fav-chip" onclick="openTool('${t.id}')">${t.icon} ${t.name}</span>`).join('')
    : '<span style="color:var(--text3);font-size:.82rem">No favorites yet</span>';
}

// ── RECENT ──
function addToRecent(toolId) {
  App.recentTools = [toolId, ...App.recentTools.filter(id => id !== toolId)].slice(0, 12);
  localStorage.setItem('th_recent', JSON.stringify(App.recentTools));
  renderRecentSection();
}

function renderRecentSection() {
  const el = document.getElementById('recent-chips');
  if (!el) return;
  const tools = App.recentTools.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean).slice(0, 8);
  el.innerHTML = tools.length
    ? tools.map(t => `<span class="recent-chip" onclick="openTool('${t.id}')"><span class="recent-chip-icon">${t.icon}</span>${t.name}</span>`).join('')
    : '<span style="color:var(--text3);font-size:.82rem">No recently used tools</span>';
  const section = document.getElementById('recent-section');
  if (section) section.style.display = tools.length ? 'block' : 'none';
}

function renderRecentGrid() {
  const el = document.getElementById('recent-grid');
  if (!el) return;
  const tools = App.recentTools.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean);
  el.innerHTML = tools.length
    ? tools.map(t => createToolCard(t)).join('')
    : '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text3)">🕐 No recently used tools</div>';
}

function clearRecent() {
  App.recentTools = [];
  localStorage.setItem('th_recent', '[]');
  renderRecentSection();
  renderRecentGrid();
  showToast('History cleared', 'info');
}

// ── TOOL USAGE TRACKING ──
function trackToolUsage(toolId) {
  App.toolStats[toolId] = (App.toolStats[toolId] || 0) + 1;
  localStorage.setItem('th_stats', JSON.stringify(App.toolStats));
  if (window.supabaseClient && Auth?.user) {
    dbUpsert('tool_usage', { user_id: Auth.user.id, tool_id: toolId, count: App.toolStats[toolId] }).catch(() => {});
  }
}

// ── FEEDBACK ──
let feedbackTab = 'feedback';
function switchFeedbackTab(tab) {
  feedbackTab = tab;
  document.querySelectorAll('.fb-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.fb-tab').forEach(b => { if (b.textContent.toLowerCase().includes(tab.slice(0,4))) b.classList.add('active'); });
  renderFeedbackForm(tab);
}

function renderFeedbackForm(tab) {
  const el = document.getElementById('feedback-form-wrap');
  if (!el) return;
  const forms = {
    feedback: `<div class="feedback-form">
      <h3>💬 Share Your Feedback</h3>
      <div class="form-group"><label class="form-label">Your Name</label><input class="form-input" type="text" id="fb-name" placeholder="Your name (optional)"></div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" id="fb-email" placeholder="your@email.com (optional)"></div>
      <div class="form-group"><label class="form-label">Rating</label><div class="rating-stars" id="fb-stars" onclick="setRating(event)">${[1,2,3,4,5].map(i=>`<span class="rating-star" data-val="${i}" role="button" aria-label="${i} star${i>1?'s':''}">☆</span>`).join('')}</div></div>
      <div class="form-group"><label class="form-label">Feedback</label><textarea class="form-textarea" id="fb-msg" placeholder="Tell us what you think..." rows="4"></textarea></div>
      <button class="submit-feedback-btn" onclick="submitFeedback('feedback')">📤 Submit Feedback</button>
    </div>`,
    feature: `<div class="feedback-form">
      <h3>💡 Feature Request</h3>
      <div class="form-group"><label class="form-label">Feature Title</label><input class="form-input" type="text" id="fr-title" placeholder="e.g. Add Dark Mode to QR Tool"></div>
      <div class="form-group"><label class="form-label">Category</label><select class="form-select" id="fr-cat"><option>AI Tool</option><option>PDF Tool</option><option>Image Tool</option><option>Game</option><option>Health</option><option>Developer</option><option>Other</option></select></div>
      <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="fr-desc" placeholder="Describe the feature in detail..." rows="5"></textarea></div>
      <button class="submit-feedback-btn" onclick="submitFeedback('feature')">💡 Submit Request</button>
    </div>`,
    bug: `<div class="feedback-form">
      <h3>🐛 Report a Bug</h3>
      <div class="form-group"><label class="form-label">Tool/Page</label><input class="form-input" type="text" id="bug-page" placeholder="e.g. EMI Calculator"></div>
      <div class="form-group"><label class="form-label">Bug Description</label><textarea class="form-textarea" id="bug-desc" placeholder="Describe what happened and what you expected..." rows="5"></textarea></div>
      <div class="form-group"><label class="form-label">Browser & Device</label><input class="form-input" type="text" id="bug-device" value="${navigator.userAgent.substring(0, 60)}..."></div>
      <button class="submit-feedback-btn" onclick="submitFeedback('bug')">🐛 Report Bug</button>
    </div>`,
    contact: `<div class="feedback-form">
      <h3>📧 Contact Us</h3>
      <div class="form-group"><label class="form-label">Your Name</label><input class="form-input" type="text" id="ct-name" placeholder="Your full name"></div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" id="ct-email" placeholder="your@email.com"></div>
      <div class="form-group"><label class="form-label">Subject</label><input class="form-input" type="text" id="ct-sub" placeholder="What is this about?"></div>
      <div class="form-group"><label class="form-label">Message</label><textarea class="form-textarea" id="ct-msg" placeholder="Your message..." rows="5"></textarea></div>
      <button class="submit-feedback-btn" onclick="submitFeedback('contact')">📧 Send Message</button>
    </div>`
  };
  el.innerHTML = forms[tab] || forms.feedback;
  // hidden trap field: real people never see or fill it, simple bots do
  const formEl = el.querySelector('.feedback-form');
  if (formEl) formEl.insertAdjacentHTML('beforeend', '<input type="text" id="fb-hp" class="fb-hp" tabindex="-1" autocomplete="off" aria-hidden="true">');
  window._feedbackRating = 0;
  try { feedbackRating = 0; } catch (e) {}
}

let feedbackRating = 0;
function setRating(e) {
  const starEl = e.target.closest ? e.target.closest('.rating-star') : null;
  const val = starEl ? parseInt(starEl.dataset.val) : 0;
  if (!val) return;
  feedbackRating = val;
  document.querySelectorAll('.rating-star').forEach((s, i) => {
    s.textContent = i < val ? '⭐' : '☆';
    s.classList.toggle('active', i < val);
  });
}

// ── INPUT SANITISATION ────────────────────────────────────────────────────────
function _sanitize(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLen);
}
// isValidEmail() is defined in auth.js (loaded before app.js).
// _isEmail is kept as an alias so existing call-sites don't break.
function _isEmail(v) { return isValidEmail(v); }

async function submitFeedback(type) {
  const data = { type, timestamp: new Date().toISOString() };

  if (type === 'feedback') {
    data.name    = _sanitize(document.getElementById('fb-name')?.value, 100);
    data.email   = _sanitize(document.getElementById('fb-email')?.value, 254);
    data.message = _sanitize(document.getElementById('fb-msg')?.value, 2000);
    data.rating  = Number.isInteger(feedbackRating) && feedbackRating >= 1 && feedbackRating <= 5 ? feedbackRating : null;
    if (!data.message) { showToast('Please enter your feedback', 'warning'); return; }
    if (data.email && !_isEmail(data.email)) { showToast('Please enter a valid email address', 'warning'); return; }
  } else if (type === 'feature') {
    data.title       = _sanitize(document.getElementById('fr-title')?.value, 200);
    data.category    = _sanitize(document.getElementById('fr-cat')?.value, 100);
    data.description = _sanitize(document.getElementById('fr-desc')?.value, 2000);
    if (!data.title) { showToast('Please enter a feature title', 'warning'); return; }
  } else if (type === 'bug') {
    data.page        = _sanitize(document.getElementById('bug-page')?.value, 200);
    data.description = _sanitize(document.getElementById('bug-desc')?.value, 2000);
    data.device      = _sanitize(document.getElementById('bug-device')?.value, 200);
    if (!data.description) { showToast('Please describe the bug', 'warning'); return; }
  } else if (type === 'contact') {
    data.name    = _sanitize(document.getElementById('ct-name')?.value, 100);
    data.email   = _sanitize(document.getElementById('ct-email')?.value, 254);
    data.subject = _sanitize(document.getElementById('ct-sub')?.value, 200);
    data.message = _sanitize(document.getElementById('ct-msg')?.value, 2000);
    if (!data.message) { showToast('Please enter a message', 'warning'); return; }
    if (!data.email || !_isEmail(data.email)) { showToast('Please enter a valid email so we can reply', 'warning'); return; }
  }

  // bots: pretend it worked, send nothing
  if (document.getElementById('fb-hp')?.value) { showToast('✅ Thank you! Your feedback has been submitted.', 'success'); renderFeedbackForm(type); return; }
  // one submission per 30 seconds per browser
  const _last = parseInt(localStorage.getItem('th_fb_last') || '0', 10);
  if (Date.now() - _last < 30000) { showToast('Please wait a few seconds before sending another message', 'warning'); return; }

  const btn = document.querySelector('#feedback-form-wrap .submit-feedback-btn');
  const btnHTML = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
  const restoreBtn = () => { if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = btnHTML; } };

  const tableMap = { feedback: 'feedback', feature: 'feature_requests', bug: 'bug_reports', contact: 'feedback' };
  // database copy stays best-effort, exactly as before
  const dbSave = window.supabaseClient
    ? dbInsert(tableMap[type], { ...data, user_id: Auth?.user?.id || null }).catch(() => null)
    : Promise.resolve(null);

  // email via EmailJS (when configured)
  if (window.ThEmail && ThEmail.isConfigured()) {
    const result = await ThEmail.send(_buildFeedbackEmail(type, data));
    await dbSave;
    if (!result.ok) {
      restoreBtn();
      showToast('❌ Could not send your message. Please check your connection and try again.', 'error', 5000);
      return;
    }
  } else {
    await dbSave;
    console.error('[ToolHub] EmailJS is NOT configured (js/email-config.js still has YOUR_* placeholders) - feedback was not emailed.');
  }
  localStorage.setItem('th_fb_last', String(Date.now()));
  showToast('✅ Thank you! Your feedback has been submitted.', 'success');
  renderFeedbackForm(type);
}

// Turns a validated form into the variables used by the EmailJS template (see EMAILJS-SETUP.md)
function _buildFeedbackEmail(type, d) {
  const labels = { feedback: 'Feedback', feature: 'Feature Request', bug: 'Bug Report', contact: 'Contact Message' };
  let subject, body;
  if (type === 'feedback') {
    subject = '[ToolHub 5D] Feedback' + (d.rating ? ' (' + d.rating + '/5)' : '');
    body = d.message;
  } else if (type === 'feature') {
    subject = '[ToolHub 5D] Feature request: ' + d.title;
    body = 'Title: ' + d.title + '\nCategory: ' + d.category + '\n\n' + (d.description || '(no description)');
  } else if (type === 'bug') {
    subject = '[ToolHub 5D] Bug: ' + (d.page || 'unspecified page');
    body = 'Tool/Page: ' + (d.page || '-') + '\n\n' + d.description + '\n\nBrowser & device: ' + (d.device || '-');
  } else {
    subject = '[ToolHub 5D] ' + (d.subject || 'Contact message');
    body = d.message;
  }
  return {
    form_type: labels[type] || type,
    subject: subject,
    from_name: d.name || 'Anonymous',
    from_email: d.email || 'not provided',
    reply_to: d.email || '',
    message: body,
    rating: d.rating ? d.rating + ' / 5' : 'not rated',
    page_url: location.href,
    user_account: (typeof Auth !== 'undefined' && Auth?.user?.email) || 'guest',
    submitted_at: new Date().toLocaleString()
  };
}

// ── TOAST ──
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  toast.innerHTML = `<span>${icons[type] || '📢'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all .3s'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ── COPY TO CLIPBOARD ──
function copyToClipboard(text, successMsg = 'Copied!') {
  if (!text) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast(`📋 ${successMsg}`, 'success'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`📋 ${successMsg}`, 'success');
  }
}

// ── AI CHAT ──
const aiChatState = {
  history: [],
  lastFailedMessage: '',
  loading: false,
};

function escapeAIHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatAIReply(value) {
  return escapeAIHtml(value)
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:var(--glass2);padding:1px 4px;border-radius:3px">$1</code>');
}

function addAIMessage(role, text, options = {}) {
  const messagesEl = document.getElementById('ai-chat-messages');
  if (!messagesEl) return;
  const message = document.createElement('div');
  message.className = `ai-message ${role === 'user' ? 'user-msg' : 'ai-msg'}`;
  const avatar = document.createElement('div');
  avatar.className = `ai-avatar ${role === 'user' ? 'user-avatar' : ''}`;
  avatar.textContent = role === 'user' ? '👤' : '🤖';
  const bubble = document.createElement('div');
  bubble.className = `ai-bubble ${role === 'user' ? 'user-bubble' : ''}`;
  if (options.html) bubble.innerHTML = text;
  else bubble.textContent = text;
  message.append(avatar, bubble);
  messagesEl.appendChild(message);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function clearAIChat() {
  aiChatState.history = [];
  aiChatState.lastFailedMessage = '';
  const messagesEl = document.getElementById('ai-chat-messages');
  if (!messagesEl) return;
  messagesEl.innerHTML = '';
  addAIMessage('assistant', "Hello! I'm ToolHub 5D AI Assistant. I can help you find and use ToolHub tools, answer coding questions, and provide technical support.");
}

function retryAIChat() {
  if (aiChatState.lastFailedMessage && !aiChatState.loading) {
    const message = aiChatState.lastFailedMessage;
    aiChatState.lastFailedMessage = '';
    sendAIChat(message, true);
  }
}

function getAIChatEndpoint() {
  return window.Capacitor
    ? 'https://softwaretoolss.netlify.app/.netlify/functions/chat'
    : '/.netlify/functions/chat';
}

async function sendAIChat(messageOverride = '', isRetry = false) {
  const input = document.getElementById('ai-chat-input');
  const msg = (messageOverride || input?.value || '').trim();
  if (!msg) return;
  if (aiChatState.loading) return;
  const model = document.getElementById('ai-model')?.value || 'openai/gpt-oss-120b';
  const messagesEl = document.getElementById('ai-chat-messages');
  if (!messagesEl) return;

  if (!isRetry) {
    input.value = '';
    input.style.height = 'auto';
    addAIMessage('user', msg);
    aiChatState.history.push({ role: 'user', content: msg });
  }

  // Typing indicator
  const typingId = 'typing-' + Date.now();
  const typing = document.createElement('div');
  typing.className = 'ai-message ai-msg';
  typing.id = typingId;
  typing.innerHTML = '<div class="ai-avatar">🤖</div><div class="ai-bubble"><div class="ai-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
  messagesEl.appendChild(typing);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  const btn = document.getElementById('ai-send-btn');
  aiChatState.loading = true;
  if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }

  try {
    const res = await fetch(getAIChatEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, model, history: aiChatState.history.slice(-20, -1) }),
      signal: AbortSignal.timeout(25000),
    });
    const data = await res.json().catch(() => ({}));
    document.getElementById(typingId)?.remove();
    if (!res.ok) throw new Error(data.error || 'AI service error. Please try again.');
    const reply = typeof data.reply === 'string' && data.reply.trim() ? data.reply : 'Sorry, I could not generate a response.';
    aiChatState.history.push({ role: 'assistant', content: reply });
    aiChatState.lastFailedMessage = '';
    addAIMessage('assistant', formatAIReply(reply), { html: true });
  } catch(e) {
    document.getElementById(typingId)?.remove();
    aiChatState.lastFailedMessage = msg;
    const errorText = e.name === 'TimeoutError' || e.name === 'AbortError' ? '⏱️ Request timed out.' : `❌ ${e.message}`;
    addAIMessage('assistant', `${escapeAIHtml(errorText)} <button class="ai-retry-btn" type="button" onclick="retryAIChat()">Retry</button>`, { html: true });
  }
  aiChatState.loading = false;
  if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function aiChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAIChat(); }
  // Auto-resize
  const ta = e.target; ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
}

function setAIPrompt(prompt) { const ta = document.getElementById('ai-chat-input'); if (ta) { ta.value = prompt; ta.focus(); } }

// ── PARTICLES ──
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      color: ['rgba(99,102,241,', 'rgba(139,92,246,', 'rgba(6,182,212,', 'rgba(236,72,153,'][Math.floor(Math.random()*4)]
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '0.6)';
      ctx.fill();
    });
    // Draw connections
    particles.forEach((p, i) => {
      particles.slice(i+1).forEach(p2 => {
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(99,102,241,${0.1 * (1 - d/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── PWA ──
function initPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    App.pwaInstallPrompt = e;
    if (!localStorage.getItem('th_pwa_dismissed')) {
      setTimeout(() => { document.getElementById('pwa-banner').style.display = 'flex'; }, 3000);
    }
  });
  window.addEventListener('appinstalled', () => {
    document.getElementById('pwa-banner').style.display = 'none';
    showToast('✅ ToolHub 5D installed!', 'success');
  });
  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

function installPWA() {
  if (App.pwaInstallPrompt) { App.pwaInstallPrompt.prompt(); App.pwaInstallPrompt.userChoice.then(() => { document.getElementById('pwa-banner').style.display = 'none'; }); }
  else { showToast('To install: tap browser menu → "Add to Home Screen"', 'info', 5000); }
}
function dismissPWA() { document.getElementById('pwa-banner').style.display = 'none'; localStorage.setItem('th_pwa_dismissed', '1'); }

// ── UPGRADE MODAL ──
function showUpgradeModal() { document.getElementById('upgrade-modal')?.classList.add('open'); }
function closeUpgradeModal() { document.getElementById('upgrade-modal')?.classList.remove('open'); }

// ── ADMIN ──
function renderAdminPage() {
  const el = document.getElementById('admin-view'); if (!el) return;
  el.innerHTML = `
    <div style="max-width:900px;margin:0 auto">
      <h1 class="page-heading">🛡️ Admin Dashboard</h1>
      <div class="admin-grid">
        <div class="admin-metric"><div style="font-size:1.5rem">👥</div><div class="admin-metric-num">—</div><div class="admin-metric-label">Total Users</div></div>
        <div class="admin-metric"><div style="font-size:1.5rem">⚡</div><div class="admin-metric-num">—</div><div class="admin-metric-label">Total Tool Uses</div></div>
        <div class="admin-metric"><div style="font-size:1.5rem">🛠️</div><div class="admin-metric-num">${ALL_TOOLS.length}</div><div class="admin-metric-label">Tools</div></div>
        <div class="admin-metric"><div style="font-size:1.5rem">🎮</div><div class="admin-metric-num">${GAMES_DATA.length}</div><div class="admin-metric-label">Games</div></div>
      </div>
      <h2 style="font-size:1rem;font-weight:700;margin-bottom:.75rem">📊 Tool Usage (This Session)</h2>
      <div class="tool-widget">
        <table class="admin-table">
          <thead><tr><th>Tool</th><th>Category</th><th>Uses</th></tr></thead>
          <tbody>
            ${Object.entries(App.toolStats).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([id, count]) => {
              const tool = ALL_TOOLS.find(t => t.id === id);
              return tool ? `<tr><td>${tool.icon} ${tool.name}</td><td>${tool.cat}</td><td>${count}</td></tr>` : '';
            }).join('') || '<tr><td colspan="3" style="text-align:center;color:var(--text3)">No usage data yet</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="info-box info-box-blue" style="margin-top:1rem">🔒 Admin panel. For full analytics, connect Supabase and enable row-level security.</div>
    </div>`;
}

// ── FILTER CATEGORY (Home page quick filter) ──
function filterCat(cat) {
  document.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
  navigate(cat === 'all' ? 'all-tools' : cat + '-tools');
}

// ══════════════════════════════════════════════
// MOBILE ENHANCEMENTS — Android Responsive
// ══════════════════════════════════════════════

// ── MOBILE SEARCH BAR INIT ──
// ── LAZY SECTION OBSERVER ──
function initLazySections() {
  const sections = document.querySelectorAll('.section-wrap, .stats-bar, .ai-banner, .double-grid');
  sections.forEach(el => el.classList.add('lazy-section'));
  if (!('IntersectionObserver' in window)) {
    sections.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
  sections.forEach(el => obs.observe(el));
}

// ── LUDO CANVAS RESIZE (portrait mode) ──
function initLudoPortraitFix() {
  function resizeLudoCanvas() {
    const canvas = document.getElementById('ludo-canvas');
    if (!canvas) return;
    const wrap = canvas.closest('.game-canvas-wrap') || canvas.parentElement;
    if (!wrap) return;
    const available = Math.min(wrap.clientWidth - 24, 380);
    canvas.style.width = available + 'px';
    canvas.style.height = available + 'px';
    // Redraw if game is running
    if (typeof drawLudoBoard === 'function' && window.ludoState) {
      drawLudoBoard();
    }
  }
  window.addEventListener('resize', resizeLudoCanvas);
  window.addEventListener('orientationchange', () => setTimeout(resizeLudoCanvas, 300));
  // Observer for when ludo canvas appears
  const obs = new MutationObserver(() => {
    if (document.getElementById('ludo-canvas')) {
      setTimeout(resizeLudoCanvas, 100);
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

// ── SNAKE CANVAS RESIZE ──
function initSnakeCanvasFix() {
  function resizeSnakeCanvas() {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas || window.innerWidth > 768) return;
    const size = Math.min(window.innerWidth - 40, 320);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
  }
  window.addEventListener('resize', resizeSnakeCanvas);
  const obs = new MutationObserver(() => {
    if (document.getElementById('snake-canvas')) setTimeout(resizeSnakeCanvas, 100);
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

// ── SL BOARD RESIZE ──
function initSLBoardFix() {
  function resizeSLBoard() {
    const board = document.getElementById('sl-board');
    if (!board || window.innerWidth > 768) return;
    const size = Math.min(window.innerWidth - 32, 340);
    board.style.maxWidth = size + 'px';
  }
  window.addEventListener('resize', resizeSLBoard);
  const obs = new MutationObserver(() => {
    if (document.getElementById('sl-board')) setTimeout(resizeSLBoard, 100);
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

// ── INITIALIZE ALL MOBILE ENHANCEMENTS ──
document.addEventListener('DOMContentLoaded', () => {
  // Run after a short delay so ALL_TOOLS is guaranteed loaded
  setTimeout(() => {
    initLazySections();
    initLudoPortraitFix();
    initSnakeCanvasFix();
    initSLBoardFix();
  }, 200);
});
