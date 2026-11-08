/* auth.js — ToolHub Auth System (production-ready, fully fixed) */
'use strict';

// ── SHARED EMAIL VALIDATOR (single source of truth) ──────────────────────────
// Replaces both _isEmail() in app.js and the missing isValidEmail() that was
// called here but never defined — the root cause of ReferenceError on auth.
function isValidEmail(v) {
  return typeof v === 'string' && /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(v.trim());
}

// ── SUPABASE READINESS HELPER ────────────────────────────────────────────────
// Waits up to 5 s for supabaseClient to initialise.
// Increased from 3 s — on slow mobile/PWA connections the CDN can take longer.
function ensureSupabase(maxWaitMs) {
  maxWaitMs = maxWaitMs || 5000;
  return new Promise(function (resolve, reject) {
    if (window.supabaseClient) return resolve(window.supabaseClient);
    var interval = 100;
    var waited = 0;
    var timer = setInterval(function () {
      if (window.supabaseClient) {
        clearInterval(timer);
        return resolve(window.supabaseClient);
      }
      waited += interval;
      if (waited >= maxWaitMs) {
        clearInterval(timer);
        reject(new Error('Auth service unavailable. Please refresh the page.'));
      }
    }, interval);
  });
}

// ── AUTH STATE ───────────────────────────────────────────────────────────────
var Auth = { user: null, session: null };

// ── INACTIVITY AUTO-LOGOUT ───────────────────────────────────────────────────
var INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
var _inactivityTimer = null;
// BUG FIX 5: Flag to suppress the generic SIGNED_OUT toast when auto-logout fires,
// so we only show the inactivity-specific message (not two overlapping toasts).
var _inactivitySignOut = false;

function _resetInactivityTimer() {
  if (!Auth.user) return;
  clearTimeout(_inactivityTimer);
  _inactivityTimer = setTimeout(function () {
    if (Auth.user) {
      _inactivitySignOut = true;
      signOut();
    }
  }, INACTIVITY_TIMEOUT_MS);
}

function _startInactivityWatch() {
  ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, _resetInactivityTimer, { passive: true });
  });
  _resetInactivityTimer();
}

function _stopInactivityWatch() {
  clearTimeout(_inactivityTimer);
  ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart'].forEach(function (ev) {
    document.removeEventListener(ev, _resetInactivityTimer);
  });
}

// ── FRIENDLY ERROR MESSAGES ──────────────────────────────────────────────────
function _friendlyAuthError(error) {
  if (!error) return 'An unexpected error occurred.';
  var msg = (error.message || '').toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid password'))
    return 'Incorrect email or password. Please try again.';
  if (msg.includes('email not confirmed'))
    return 'Please verify your email address before signing in. Check your inbox.';
  if (msg.includes('user already registered') || msg.includes('already been registered'))
    return 'An account with this email already exists. Try signing in.';
  if (msg.includes('password should be at least'))
    return 'Password must be at least 6 characters.';
  if (msg.includes('rate limit') || msg.includes('too many requests'))
    return 'Too many attempts. Please wait a few minutes and try again.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Network error. Check your connection and try again.';
  if (msg.includes('invalid email'))
    return 'Please enter a valid email address.';
  if (msg.includes('token') || msg.includes('expired'))
    return 'Your session has expired. Please sign in again.';
  return 'Something went wrong. Please try again.';
}

// ── GUARD: prevent duplicate auth listener ───────────────────────────────────
var _authListenerRegistered = false;

// ── INIT ─────────────────────────────────────────────────────────────────────
async function initAuth() {
  // Render auth UI immediately even before Supabase is ready
  renderAuthMenu();

  try {
    var client = await ensureSupabase();

    // Restore session on page load / refresh
    var result = await client.auth.getSession();
    var session = result.data && result.data.session;
    if (session) {
      Auth.user = session.user;
      Auth.session = session;
      updateAuthUI();
      _startInactivityWatch();
    }

    // Register auth state listener only once (prevents duplicate toasts / loops)
    if (!_authListenerRegistered) {
      _authListenerRegistered = true;
      client.auth.onAuthStateChange(function (event, session) {
        Auth.user = session ? session.user : null;
        Auth.session = session;

        if (event === 'SIGNED_IN') {
          updateAuthUI();
          closeAuthModal();
          _startInactivityWatch();
          if (typeof resumeAfterLogin === 'function') resumeAfterLogin();
          // Avoid duplicate "Welcome back" toast on TOKEN_REFRESHED silent re-auth
          if (!_suppressNextSignedInToast) {
            showToast('Welcome back! 👋', 'success');
          }
          _suppressNextSignedInToast = false;
        }

        if (event === 'SIGNED_OUT') {
          updateAuthUI();
          _stopInactivityWatch();
          // BUG FIX 5: Show inactivity-specific toast when auto-logout fires;
          // otherwise show the generic "See you soon" toast.
          if (_inactivitySignOut) {
            _inactivitySignOut = false;
            showToast('You were signed out after 30 minutes of inactivity.', 'info');
          } else {
            showToast('Signed out. See you soon!', 'info');
          }
        }

        if (event === 'TOKEN_REFRESHED') {
          Auth.session = session;
          // Session refreshed silently — no toast needed
        }

        if (event === 'PASSWORD_RECOVERY') {
          // User clicked the reset link in their email — show new-password form
          showAuthModal('reset-confirm');
        }

        if (event === 'USER_UPDATED') {
          Auth.user = session ? session.user : Auth.user;
          updateAuthUI();
        }
      });
    }

    // Handle OAuth / magic-link callback that lands with #access_token in URL
    // Supabase detectSessionInUrl handles this automatically, but we also need
    // to clear the ugly hash from the URL bar without triggering a reload.
    _handleUrlSession();

  } catch (e) {
    // Supabase not available — silently degrade (no auth, UI already rendered)
    console.info('[ToolHub] Auth offline:', e.message);
  }
}

// Suppress the SIGNED_IN toast that fires on first silent token refresh after
// page load when the user was already logged in.
var _suppressNextSignedInToast = true;

function _handleUrlSession() {
  var hash = window.location.hash;
  if (!hash) return;

  // OAuth callback: #access_token=...&type=recovery → show reset form
  if (hash.includes('type=recovery') || hash.includes('type=signup')) {
    // Supabase SDK handles token extraction; we just clean the URL
    history.replaceState(null, '', window.location.pathname + window.location.search);
    return;
  }

  // Clean up #reset-password marker added by our resetPassword() redirectTo
  if (hash === '#reset-password') {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    showAuthModal('reset-confirm');
  }
}

// ── UI HELPERS ────────────────────────────────────────────────────────────────
function updateAuthUI() {
  var avatarEl = document.getElementById('avatar-display');
  var navAuthBtns = document.getElementById('nav-auth-btns');
  if (!avatarEl) return;

  if (Auth.user) {
    var meta = Auth.user.user_metadata || {};
    var initial = (meta.full_name || Auth.user.email || 'U').substring(0, 1).toUpperCase();
    var navAvatar = _avatarHtml(meta, meta.full_name || Auth.user.email, 32);
    if (navAvatar) {
      avatarEl.innerHTML = navAvatar;
    } else {
      avatarEl.textContent = initial;
    }
    if (navAuthBtns) navAuthBtns.style.display = 'none';
    syncFavoritesFromDB();
  } else {
    avatarEl.textContent = '👤';
    if (navAuthBtns) { navAuthBtns.style.display = 'flex'; navAuthBtns.style.visibility = 'visible'; }
  }
  renderAuthMenu();
}

function _escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Builds an <img> with a graceful onerror fallback: if the photo URL is broken
// (expired Google token, blocked by CSP, deleted file, etc.) it swaps itself
// for a circular initial-letter badge instead of showing a cracked-image icon.
function _avatarHtml(meta, fallbackText, sizePx) {
  var initial = (fallbackText || 'U').substring(0, 1).toUpperCase();
  if (!meta || !meta.avatar_url) return null;
  var url = _escapeHtml(meta.avatar_url);
  var px = sizePx || 32;
  var fontPx = Math.round(px * 0.45);
  return '<img src="' + url + '" style="width:' + px + 'px;height:' + px + 'px;border-radius:50%;object-fit:cover;vertical-align:middle" alt="Avatar" loading="lazy" ' +
    'onerror="this.outerHTML=\'<div style=&quot;width:' + px + 'px;height:' + px + 'px;border-radius:50%;background:var(--indigo,#6366f1);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:' + fontPx + 'px;vertical-align:middle&quot;>' + initial + '</div>\'">';
}

function _isAdminUser() {
  var role = (Auth.user && Auth.user.app_metadata && Auth.user.app_metadata.role) ||
             (Auth.user && Auth.user.user_metadata && Auth.user.user_metadata.role);
  return role === 'admin';
}

function renderAuthMenu() {
  var el = document.getElementById('auth-menu-content');
  if (!el) return;
  if (Auth.user) {
    var meta = Auth.user.user_metadata || {};
    var name = _escapeHtml(meta.full_name || 'User');
    var email = _escapeHtml(Auth.user.email || '');
    var avatarHtml = _avatarHtml(meta, name, 32) || '';
    el.innerHTML =
      '<div style="padding:12px 16px;border-bottom:1px solid var(--border)">' +
        '<div style="font-weight:700;font-size:.9rem">' + (avatarHtml ? '<span style="margin-right:8px;display:inline-block">' + avatarHtml + '</span>' : '') + name + '</div>' +
        '<div style="font-size:.75rem;color:var(--text3);margin-top:2px">' + email + '</div>' +
      '</div>' +
      '<div class="auth-menu-item" onclick="navigate(\'favorites\');closeAuthMenu()">⭐ Favorites</div>' +
      '<div class="auth-menu-item" onclick="navigate(\'recent\');closeAuthMenu()">🕐 History</div>' +
      '<div class="auth-menu-item" onclick="showProfile();closeAuthMenu()">👤 Profile</div>' +
      (_isAdminUser() ? '<div class="auth-menu-item" onclick="navigate(\'admin\');closeAuthMenu()">🛡️ Admin</div>' : '') +
      '<div class="auth-menu-item" style="color:var(--red)" onclick="signOut()">🚪 Sign Out</div>';
  } else {
    el.innerHTML =
      '<div style="padding:12px 16px;text-align:center;border-bottom:1px solid var(--border);font-size:.85rem;color:var(--text3)">' +
        'Sign in to sync favorites &amp; history' +
      '</div>' +
      '<div class="auth-menu-item" onclick="showAuthModal(\'login\')">🔑 Sign In</div>' +
      '<div class="auth-menu-item" onclick="showAuthModal(\'signup\')">✨ Create Account</div>';
  }
}

function toggleAuthMenu() {
  var menu = document.getElementById('auth-menu');
  var notif = document.getElementById('notif-panel');
  if (notif) notif.classList.remove('open');
  if (menu) menu.classList.toggle('open');
}
function closeAuthMenu() {
  var el = document.getElementById('auth-menu');
  if (el) el.classList.remove('open');
}

function toggleNotifications() {
  var notif = document.getElementById('notif-panel');
  var authMenu = document.getElementById('auth-menu');
  if (authMenu) authMenu.classList.remove('open');
  var themePanel = document.getElementById('theme-panel');
  if (themePanel && themePanel.classList.contains('open') && typeof toggleThemePanel === 'function') toggleThemePanel();
  if (notif) notif.classList.toggle('open');
  var dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = 'none';
}

// ── AUTH MODAL ────────────────────────────────────────────────────────────────
function showAuthModal(tab) {
  tab = tab || 'login';
  closeAuthMenu();

  // ── Guard: Supabase not configured ──────────────────────────────────────────
  // If the anon key is missing or looks wrong, show a setup hint instead of a
  // broken form (prevents silent failures that confuse users).
  var env = window.__env || {};
  var keyOk = env.SUPABASE_ANON_KEY && env.SUPABASE_ANON_KEY.startsWith('eyJ');
  var urlOk = env.SUPABASE_URL && env.SUPABASE_URL.startsWith('https://');
  if (!keyOk || !urlOk || !window.supabaseClient) {
    var warn = document.createElement('div');
    warn.id = 'auth-modal';
    warn.className = 'modal-overlay open';
    warn.onclick = function (e) { if (e.target === warn) warn.remove(); };
    warn.innerHTML =
      '<div class="modal-card" onclick="event.stopPropagation()" style="max-width:420px">' +
        '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()" aria-label="Close">✕</button>' +
        '<div style="padding:1.5rem;text-align:center">' +
          '<div style="font-size:2rem;margin-bottom:.75rem">⚙️</div>' +
          '<h2 style="margin-bottom:.5rem">Auth Not Configured</h2>' +
          '<p style="color:var(--text3);font-size:.9rem;line-height:1.6">' +
            'Sign-in requires Supabase credentials.<br>' +
            'Set <strong>SUPABASE_URL</strong> and <strong>SUPABASE_ANON_KEY</strong> in<br>' +
            '<em>Netlify → Site Settings → Environment Variables</em>,<br>' +
            'then redeploy. The anon key must start with <code>eyJ</code>.' +
          '</p>' +
        '</div>' +
      '</div>';
    // Remove any stale modal first
    var old = document.getElementById('auth-modal');
    if (old) old.remove();
    document.body.appendChild(warn);
    return;
  }
  // ────────────────────────────────────────────────────────────────────────────

  var modal = document.getElementById('auth-modal');
  var content = document.getElementById('auth-modal-content');
  if (!modal || !content) {
    var overlay = document.createElement('div');
    overlay.id = 'auth-modal';
    overlay.className = 'modal-overlay open';
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML =
      '<div class="modal-card" onclick="event.stopPropagation()">' +
        '<button class="modal-close" onclick="closeAuthModal()" aria-label="Close">✕</button>' +
        '<div id="auth-modal-content"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    renderAuthForm(tab, overlay.querySelector('#auth-modal-content'));
    return;
  }
  modal.classList.add('open');
  renderAuthForm(tab, content);
}

function renderAuthForm(tab, container) {
  if (!container) return;

  // ── reset-confirm: new password entry after clicking email link ──
  if (tab === 'reset-confirm') {
    container.innerHTML =
      '<div class="auth-form">' +
        '<h2>Set New Password 🔐</h2>' +
        '<div id="auth-error" class="auth-error" style="display:none" role="alert" aria-live="polite"></div>' +
        '<p style="font-size:.85rem;color:var(--text3);margin-bottom:1rem">Enter a new password for your account.</p>' +
        '<label class="sr-only" for="auth-new-password">New password</label>' +
        '<input class="form-input" type="password" id="auth-new-password" placeholder="New password (min 8 chars)" autocomplete="new-password" maxlength="128" aria-label="New password">' +
        '<label class="sr-only" for="auth-confirm-password">Confirm new password</label>' +
        '<input class="form-input" type="password" id="auth-confirm-password" placeholder="Confirm new password" autocomplete="new-password" maxlength="128" aria-label="Confirm new password">' +
        '<button class="auth-submit" onclick="updatePassword()">Update Password</button>' +
      '</div>';
    setTimeout(function () {
      var inp = container.querySelector('#auth-new-password');
      if (inp) inp.focus();
    }, 50);
    return;
  }

  // ── Standard tabs header (login / signup) ──
  var tabsHtml =
    '<div class="auth-tabs">' +
      '<button class="auth-tab ' + (tab === 'login' ? 'active' : '') + '" onclick="renderAuthForm(\'login\',this.closest(\'.auth-form\').parentElement)">Sign In</button>' +
      '<button class="auth-tab ' + (tab === 'signup' ? 'active' : '') + '" onclick="renderAuthForm(\'signup\',this.closest(\'.auth-form\').parentElement)">Sign Up</button>' +
    '</div>';

  var bodyHtml = '';

  if (tab === 'login') {
    bodyHtml =
      '<h2>Welcome Back 👋</h2>' +
      '<div id="auth-error" class="auth-error" style="display:none" role="alert" aria-live="polite"></div>' +
      '<button class="google-btn" onclick="signInWithGoogle()" aria-label="Continue with Google"><span aria-hidden="true">🔵</span> Continue with Google</button>' +
      '<div class="auth-divider" aria-hidden="true">or</div>' +
      '<label class="sr-only" for="auth-email">Email address</label>' +
      '<input class="form-input" type="email" id="auth-email" placeholder="Email address" autocomplete="email" maxlength="254" aria-label="Email address">' +
      '<label class="sr-only" for="auth-password">Password</label>' +
      '<input class="form-input" type="password" id="auth-password" placeholder="Password" autocomplete="current-password" maxlength="128" aria-label="Password">' +
      '<label style="display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--text3);margin-bottom:4px;cursor:pointer">' +
        '<input type="checkbox" id="auth-remember" style="accent-color:var(--indigo)"> Remember me' +
      '</label>' +
      '<button class="auth-submit" onclick="signInWithEmail()">Sign In</button>' +
      '<div class="auth-link"><a href="#" onclick="event.preventDefault();renderAuthForm(\'forgot\',document.getElementById(\'auth-modal-content\') || this.closest(\'.auth-form\').parentElement)">Forgot password?</a></div>';
  } else if (tab === 'signup') {
    bodyHtml =
      '<h2>Create Account ✨</h2>' +
      '<div id="auth-error" class="auth-error" style="display:none" role="alert" aria-live="polite"></div>' +
      '<button class="google-btn" onclick="signInWithGoogle()" aria-label="Continue with Google"><span aria-hidden="true">🔵</span> Continue with Google</button>' +
      '<div class="auth-divider" aria-hidden="true">or</div>' +
      '<label class="sr-only" for="auth-name">Full name</label>' +
      '<input class="form-input" type="text" id="auth-name" placeholder="Full name (optional)" autocomplete="name" maxlength="100" aria-label="Full name (optional)">' +
      '<label class="sr-only" for="auth-email">Email address</label>' +
      '<input class="form-input" type="email" id="auth-email" placeholder="Email address" autocomplete="email" maxlength="254" aria-label="Email address">' +
      '<label class="sr-only" for="auth-password">Password</label>' +
      '<input class="form-input" type="password" id="auth-password" placeholder="Password (min 8 chars)" autocomplete="new-password" maxlength="128" aria-label="Password (minimum 8 characters)">' +
      '<button class="auth-submit" onclick="signUpWithEmail()">Create Account</button>' +
      '<div class="auth-link" style="font-size:.75rem;color:var(--text3)">By signing up you agree to our <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</div>';
  } else {
    // forgot password tab
    tabsHtml = ''; // no tabs on forgot screen
    bodyHtml =
      '<h2>Reset Password 🔑</h2>' +
      '<div id="auth-error" class="auth-error" style="display:none" role="alert" aria-live="polite"></div>' +
      '<p style="font-size:.85rem;color:var(--text3);margin-bottom:1rem">Enter your email and we\'ll send a reset link.</p>' +
      '<label class="sr-only" for="auth-email">Email address</label>' +
      '<input class="form-input" type="email" id="auth-email" placeholder="Email address" autocomplete="email" maxlength="254" aria-label="Email address">' +
      '<button class="auth-submit" onclick="resetPassword()">Send Reset Email</button>' +
      '<div class="auth-link"><a href="#" onclick="event.preventDefault();renderAuthForm(\'login\',document.getElementById(\'auth-modal-content\') || this.closest(\'.auth-form\').parentElement)">Back to Sign In</a></div>';
  }

  container.innerHTML = '<div class="auth-form">' + tabsHtml + bodyHtml + '</div>';

  // Auto-focus first text/email input
  setTimeout(function () {
    var inp = container.querySelector('input[type="email"], input[type="text"]');
    if (inp) inp.focus();
  }, 50);
}

function closeAuthModal() {
  var el = document.getElementById('auth-modal');
  if (el) el.classList.remove('open');
}

function showAuthError(msg, isSuccess) {
  var el = document.getElementById('auth-error');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = isSuccess ? 'var(--green, #22c55e)' : '';
    el.style.borderColor = isSuccess ? 'var(--green, #22c55e)' : '';
  }
}

function _clearAuthError() {
  var el = document.getElementById('auth-error');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}

// ── INPUT VALIDATORS ──────────────────────────────────────────────────────────
function _validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required.';
  if (email.length > 254) return 'Email is too long.';
  if (!isValidEmail(email)) return 'Please enter a valid email address.';
  return null;
}

function _validatePassword(password, isNew) {
  if (!password) return 'Password is required.';
  if (isNew && password.length < 8) return 'Password must be at least 8 characters.';
  if (!isNew && password.length < 6) return 'Password must be at least 6 characters.';
  if (password.length > 128) return 'Password is too long.';
  return null;
}

// ── AUTH ACTIONS ──────────────────────────────────────────────────────────────
async function signInWithGoogle() {
  _clearAuthError();
  try {
    var client = await ensureSupabase();
    // Use explicit redirectTo so it works on both localhost and production.
    // Supabase needs the *exact* URL registered in your Supabase OAuth settings.
    var redirectTo = window.location.origin + '/';
    var result = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        // queryParams forces re-consent prompt — useful for PWA/Android to avoid
        // "popup blocked" issues; remove if you prefer silent re-auth.
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (result.error) showAuthError(_friendlyAuthError(result.error));
  } catch (e) {
    showAuthError(e.message || 'Google sign-in failed. Please try again.');
  }
}

async function signInWithEmail() {
  _clearAuthError();
  var email = (document.getElementById('auth-email') && document.getElementById('auth-email').value || '').trim();
  var password = document.getElementById('auth-password') && document.getElementById('auth-password').value || '';

  var emailErr = _validateEmail(email);
  if (emailErr) { showAuthError(emailErr); return; }
  var passErr = _validatePassword(password, false);
  if (passErr) { showAuthError(passErr); return; }

  // BUG FIX 8: Cache button reference synchronously before the first await so
  // the finally block always targets the correct element regardless of DOM changes.
  var btn = document.querySelector('.auth-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

  try {
    var client = await ensureSupabase();
    // BUG FIX 1: Read the "Remember me" checkbox and pass persistSession accordingly
    var rememberChk = document.getElementById('auth-remember');
    var persist = rememberChk ? rememberChk.checked : true;
    var result = await client.auth.signInWithPassword({
      email: email,
      password: password,
      options: { persistSession: persist },
    });
    if (result.error) {
      showAuthError(_friendlyAuthError(result.error));
    }
    // On success: onAuthStateChange fires SIGNED_IN → updateAuthUI + closeAuthModal
  } catch (e) {
    showAuthError(e.message || 'Sign in failed. Check your connection and try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
  }
}

async function signUpWithEmail() {
  _clearAuthError();
  var name = ((document.getElementById('auth-name') && document.getElementById('auth-name').value) || '').trim().slice(0, 100);
  var email = ((document.getElementById('auth-email') && document.getElementById('auth-email').value) || '').trim();
  var password = (document.getElementById('auth-password') && document.getElementById('auth-password').value) || '';

  var emailErr = _validateEmail(email);
  if (emailErr) { showAuthError(emailErr); return; }
  var passErr = _validatePassword(password, true);
  if (passErr) { showAuthError(passErr); return; }

  // BUG FIX 8: Cache button reference synchronously before await.
  var btn = document.querySelector('.auth-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }

  try {
    var client = await ensureSupabase();
    var result = await client.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { full_name: name || null },
        emailRedirectTo: window.location.origin + '/',
      },
    });
    if (result.error) {
      showAuthError(_friendlyAuthError(result.error));
    } else {
      // BUG FIX 2: Supabase silently returns success for duplicate emails when
      // email confirmation is on. Detect the null user/session and warn the user.
      var isDuplicate = !result.data.user && !result.data.session;
      var needsConfirmation = !!(result.data.user && !result.data.session);
      if (isDuplicate) {
        closeAuthModal();
        showToast('📧 If this email is registered you\'ll receive a confirmation link.', 'info');
      } else if (needsConfirmation) {
        // IMPORTANT: most "signup works but login fails right after" reports are
        // this exact case — the Supabase project has "Confirm email" turned on,
        // so the account exists but is unconfirmed and signInWithPassword will
        // reject it with "Email not confirmed" until the link is clicked.
        // Keep the modal open with a persistent message instead of a toast that
        // disappears before the user reads it.
        showAuthError('✅ Account created! Check your email (' + email + ') and click the confirmation link before signing in.', true);
      } else {
        closeAuthModal();
        showToast('✅ Account created and signed in!', 'success');
      }
    }
  } catch (e) {
    showAuthError(e.message || 'Sign up failed. Please try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  }
}

async function resetPassword() {
  _clearAuthError();
  var email = ((document.getElementById('auth-email') && document.getElementById('auth-email').value) || '').trim();
  var emailErr = _validateEmail(email);
  if (emailErr) { showAuthError(emailErr); return; }

  // BUG FIX 8: Cache button reference synchronously before await.
  var btn = document.querySelector('.auth-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  try {
    var client = await ensureSupabase();
    // redirectTo must be a URL allowed in Supabase Dashboard → Auth → URL Configuration → Redirect URLs
    var result = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/?reset=1',
    });
    if (result.error) {
      showAuthError(_friendlyAuthError(result.error));
    } else {
      closeAuthModal();
      showToast('📧 Password reset email sent! Check your inbox.', 'success');
    }
  } catch (e) {
    showAuthError(e.message || 'Failed to send reset email. Please try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Send Reset Email'; }
  }
}

// ── UPDATE PASSWORD (called from reset-confirm form) ─────────────────────────
async function updatePassword() {
  _clearAuthError();
  var newPwd = (document.getElementById('auth-new-password') && document.getElementById('auth-new-password').value) || '';
  var confirmPwd = (document.getElementById('auth-confirm-password') && document.getElementById('auth-confirm-password').value) || '';

  var pwdErr = _validatePassword(newPwd, true);
  if (pwdErr) { showAuthError(pwdErr); return; }
  if (newPwd !== confirmPwd) { showAuthError('Passwords do not match.'); return; }

  var btn = document.querySelector('.auth-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Updating…'; }

  try {
    var client = await ensureSupabase();
    var result = await client.auth.updateUser({ password: newPwd });
    if (result.error) {
      showAuthError(_friendlyAuthError(result.error));
    } else {
      closeAuthModal();
      showToast('✅ Password updated! You are now signed in.', 'success');
    }
  } catch (e) {
    showAuthError(e.message || 'Failed to update password. Please try again.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
  }
}

async function signOut() {
  _stopInactivityWatch();
  // BUG FIX 4: Removed manual updateAuthUI() call — the SIGNED_OUT event from
  // onAuthStateChange already calls updateAuthUI(), so calling it here too
  // creates a race condition (double render, brief flash of logged-in avatar).
  if (window.supabaseClient) {
    try { await window.supabaseClient.auth.signOut(); } catch (e) { /* silent */ }
  }
  // Auth state is cleared and UI updated by the SIGNED_OUT handler above.
}

// ── FAVORITES SYNC ────────────────────────────────────────────────────────────
async function syncFavoritesFromDB() {
  if (!window.supabaseClient || !Auth.user) return;
  try {
    var result = await window.supabaseClient
      .from('favorites')
      .select('tool_id')
      .eq('user_id', Auth.user.id);
    if (result.error || !result.data) return;
    var dbFavs = result.data.map(function (r) { return r.tool_id; }).filter(Boolean);
    if (dbFavs.length > 0) {
      App.favorites = Array.from(new Set(App.favorites.concat(dbFavs)));
      localStorage.setItem('th_favs', JSON.stringify(App.favorites));
      if (typeof updateFavCount === 'function') updateFavCount();
    }
  } catch (e) { /* silent — user still gets local favorites */ }
}

async function saveFavToDB(toolId) {
  if (!window.supabaseClient || !Auth.user || !toolId) return;
  try {
    await window.supabaseClient.from('favorites').upsert({ user_id: Auth.user.id, tool_id: toolId });
  } catch (e) { /* silent */ }
}

async function removeFavFromDB(toolId) {
  if (!window.supabaseClient || !Auth.user || !toolId) return;
  try {
    await window.supabaseClient.from('favorites').delete().eq('user_id', Auth.user.id).eq('tool_id', toolId);
  } catch (e) { /* silent */ }
}

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
function showProfile() {
  if (!Auth.user) { showAuthModal('login'); return; }
  if (typeof navigate === 'function') navigate('tool');
  var view = document.getElementById('tool-view');
  if (!view) return;
  var meta = Auth.user.user_metadata || {};
  var name = _escapeHtml(meta.full_name || 'User');
  var email = _escapeHtml(Auth.user.email || '');
  var avatarHtml = _avatarHtml(meta, name, 80) || '<span style="font-size:4rem">👤</span>';
  var toolCount = (typeof App !== 'undefined' && App.recentTools) ? App.recentTools.length : 0;
  var favCount = (typeof App !== 'undefined' && App.favorites) ? App.favorites.length : 0;
  var statsCount = (typeof App !== 'undefined' && App.toolStats) ? Object.keys(App.toolStats).length : 0;
  view.innerHTML =
    '<div class="tool-page" style="max-width:500px">' +
      '<h1 class="page-heading">👤 My Profile</h1>' +
      '<div class="tool-widget" style="text-align:center">' +
        '<div style="margin-bottom:1rem">' + avatarHtml + '</div>' +
        '<div style="font-weight:700;font-size:1.1rem;margin-bottom:4px">' + name + '</div>' +
        '<div style="color:var(--text3);font-size:.85rem;margin-bottom:1.5rem">' + email + '</div>' +
        '<div class="result-grid" style="margin-bottom:1rem">' +
          '<div class="result-item"><div class="result-item-value">' + toolCount + '</div><div class="result-item-label">Tools Used</div></div>' +
          '<div class="result-item"><div class="result-item-value">' + favCount + '</div><div class="result-item-label">Favorites</div></div>' +
          '<div class="result-item"><div class="result-item-value">' + statsCount + '</div><div class="result-item-label">Unique Tools</div></div>' +
        '</div>' +
        '<button class="btn-outline-glow" style="margin-right:8px" onclick="navigate(\'favorites\')">⭐ Favorites</button>' +
        '<button class="btn-outline-glow" style="color:var(--red);border-color:var(--red)" onclick="signOut()">🚪 Sign Out</button>' +
      '</div>' +
    '</div>';
}

// ── OUTSIDE CLICK HANDLERS ───────────────────────────────────────────────────
document.addEventListener('click', function (e) {
  if (!e.target.closest('#auth-menu') && !e.target.closest('#auth-btn')) closeAuthMenu();
  if (!e.target.closest('#notif-panel') && !e.target.closest('#notif-btn')) {
    var p = document.getElementById('notif-panel');
    if (p) p.classList.remove('open');
  }
});

// ── KEYBOARD ACCESSIBILITY ────────────────────────────────────────────────────
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeAuthModal();
    closeAuthMenu();
    var p = document.getElementById('notif-panel');
    if (p) p.classList.remove('open');
  }
});

// ── Handle ?reset=1 query param from password reset email redirect ────────────
// BUG FIX 6: On slow connections the PASSWORD_RECOVERY Supabase event may fire
// before the IIFE runs, or the async event may never arrive in time. As a fallback,
// if the URL has ?reset=1 AND a user session is already active (meaning Supabase
// already processed the token), open the reset-confirm modal immediately.
(function () {
  var params = new URLSearchParams(window.location.search);
  if (params.get('reset') === '1') {
    // Remove the param from URL without reload
    params.delete('reset');
    var newSearch = params.toString();
    history.replaceState(null, '', window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash);
    // Fallback: open modal now if Supabase already set Auth.user (token processed)
    if (Auth.user) {
      showAuthModal('reset-confirm');
    }
    // If Auth.user is null the PASSWORD_RECOVERY event will open the modal async
  }
})();
