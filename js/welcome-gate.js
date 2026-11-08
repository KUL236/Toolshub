/* welcome-gate.js — v6: Premium welcome screen + guest tool-gating + resume-after-login
   Does NOT touch Supabase auth logic in auth.js — only builds UI around it and
   intercepts tool-action clicks for guests. */
'use strict';

const WelcomeGate = {
  pendingToolId: null,
  pendingGameId: null,
  SESSION_KEY: 'th_welcome_shown_v6',
};

// ── WELCOME OVERLAY (shown once per browser session on first load) ─────────
function initWelcomeGate() {
  injectWelcomeOverlayMarkup();
  attachToolGating();

  // Don't show if user is already logged in, or already dismissed this session
  const alreadyShown = sessionStorage.getItem(WelcomeGate.SESSION_KEY);
  if (alreadyShown) return;

  // Give Supabase a moment to restore session so we don't flash the welcome
  // screen at a returning logged-in user.
  setTimeout(() => {
    if (typeof Auth !== 'undefined' && Auth.user) return;
    showWelcomeOverlay();
  }, 350);
}

function injectWelcomeOverlayMarkup() {
  if (document.getElementById('welcome-overlay')) return;
  const wrap = document.createElement('div');
  wrap.id = 'welcome-overlay';
  wrap.className = 'welcome-overlay';
  wrap.innerHTML = `
    <div class="welcome-card" role="dialog" aria-modal="true" aria-label="Welcome to ToolHub 5D">
      <button class="welcome-close" onclick="closeWelcomeOverlay()" aria-label="Close">✕</button>
      <div class="welcome-bg-anim" aria-hidden="true">
        <span class="w-orb w-orb-1"></span><span class="w-orb w-orb-2"></span><span class="w-orb w-orb-3"></span>
      </div>
      <div class="welcome-content">
        <div class="welcome-logo">🛠️</div>
        <h1 class="welcome-title">Welcome to ToolHub 5D</h1>
        <p class="welcome-sub">200+ tools, smart features &amp; games — sign in to save your history, favorites and work.</p>
        <div class="welcome-actions">
          <button class="welcome-btn welcome-btn-google" onclick="closeWelcomeOverlay(true);showAuthModal('login');">
            <span class="wb-icon">🔎</span> Continue with Google
          </button>
          <button class="welcome-btn welcome-btn-github" onclick="closeWelcomeOverlay(true);showAuthModal('login');">
            <span class="wb-icon">🐙</span> Continue with GitHub
          </button>
          <button class="welcome-btn welcome-btn-email" onclick="closeWelcomeOverlay(true);showAuthModal('login');">
            <span class="wb-icon">✉️</span> Continue with Email
          </button>
          <button class="welcome-btn welcome-btn-signup" onclick="closeWelcomeOverlay(true);showAuthModal('signup');">
            <span class="wb-icon">✨</span> Create an Account
          </button>
        </div>
        <button class="welcome-guest-link" onclick="closeWelcomeOverlay()">Continue as Guest →</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
}

function showWelcomeOverlay() {
  const el = document.getElementById('welcome-overlay');
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWelcomeOverlay() {
  const el = document.getElementById('welcome-overlay');
  if (el) el.classList.remove('open');
  document.body.style.overflow = '';
  sessionStorage.setItem(WelcomeGate.SESSION_KEY, '1');
}

// ── GUEST TOOL-USE GATING ────────────────────────────────────────────────────
// Any click on a primary/secondary tool action button (Generate, Convert,
// Compress, Download, Export, Play, "Use Tool", etc.) or a file-upload input
// inside the tool view is intercepted for guests and redirected to login.
// Browsing (opening a tool page, reading its description) is always allowed.
const GATED_ACTION_SELECTORS = '.btn-primary-glow, .btn-secondary-glow, [data-requires-auth]';

function attachToolGating() {
  const toolView = document.getElementById('tool-view');
  if (toolView) {
    toolView.addEventListener('click', guardToolAction, true);
    toolView.addEventListener('change', guardToolUpload, true);
  }
  // Games (Play button clicks live inside #game-view)
  const gameView = document.getElementById('game-view');
  if (gameView) {
    gameView.addEventListener('click', guardGameAction, true);
  }
}

function isGuest() {
  return !(typeof Auth !== 'undefined' && Auth.user);
}

function guardToolAction(e) {
  if (!isGuest()) return;
  const target = e.target.closest(GATED_ACTION_SELECTORS);
  if (!target) return; // not an action button — let favorite/share/back-nav etc. through
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  // Identify which tool is currently open by matching the rendered title
  // against ALL_TOOLS (there's no tool id in the URL hash to read directly).
  const toolPageTitle = document.querySelector('#tool-view .tool-page-title');
  const currentTool = (typeof ALL_TOOLS !== 'undefined' && toolPageTitle)
    ? ALL_TOOLS.find(t => t.name === toolPageTitle.textContent.trim())
    : null;
  if (currentTool) {
    WelcomeGate.pendingToolId = currentTool.id;
  } else if (typeof App !== 'undefined' && App.recentTools && App.recentTools[0]) {
    WelcomeGate.pendingToolId = App.recentTools[0]; // fallback: last opened tool
  }
  if (typeof showToast === 'function') showToast('Please sign in to use this tool ✨', 'info');
  showAuthModal('login');
}

function guardToolUpload(e) {
  if (!isGuest()) return;
  const target = e.target.closest('input[type="file"]');
  if (!target) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  target.value = '';
  showAuthModal('login');
}

function guardGameAction(e) {
  if (!isGuest()) return;
  const target = e.target.closest('[data-requires-auth]');
  if (!target) return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  showAuthModal('login');
}

// ── RESUME AFTER LOGIN ───────────────────────────────────────────────────────
// Called from auth.js right after a SIGNED_IN event fires.
function resumeAfterLogin() {
  if (WelcomeGate.pendingToolId) {
    const id = WelcomeGate.pendingToolId;
    WelcomeGate.pendingToolId = null;
    if (typeof openTool === 'function') openTool(id);
  }
}

document.addEventListener('DOMContentLoaded', initWelcomeGate);
