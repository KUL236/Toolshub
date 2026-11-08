/* ToolHub 5D - Refer & Earn
 * - Each signed-in user gets a personal link:  https://yoursite/?ref=CODE
 * - CODE = first 8 characters of the user's id (no extra table or lookup needed).
 * - When someone opens a link we remember the code; when that visitor creates a NEW account
 *   we record one row in the `referrals` table (see REFERRAL-SETUP.md for the SQL + security rules).
 * Rewards are listed below. Edit the TIERS to match what you can really deliver. */
(function () {
  'use strict';

  var TABLE = 'referrals';
  var NEW_ACCOUNT_WINDOW_MS = 48 * 3600 * 1000;   // only brand-new accounts count
  // ---- EDIT ME: rewards shown on the page (count = friends who joined) ----
  var TIERS = [
    { count: 3,  title: '1 month of ToolHub Pro',  note: 'Applied when Pro launches' },
    { count: 10, title: '3 months of ToolHub Pro', note: 'Applied when Pro launches' },
    { count: 25, title: '12 months of ToolHub Pro', note: 'Applied when Pro launches' }
  ];
  // -------------------------------------------------------------------------
  var state = { count: null, loading: false };
  var renderAttempts = 0;

  function user() { return (typeof Auth !== 'undefined' && Auth && Auth.user) || null; }
  function codeFor(u) { return u && u.id ? String(u.id).replace(/-/g, '').slice(0, 8).toUpperCase() : ''; }
  function linkFor(code) { return location.origin + '/?ref=' + code; }
  function message(link) {
    return 'I use ToolHub 5D for PDF, image and AI tools, plus games. It is free and all in one place. Have a look: ' + link;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---------- remember who sent this visitor ----------
  function captureRef() {
    try {
      var r = new URLSearchParams(location.search).get('ref');
      if (r && /^[A-Za-z0-9]{6,12}$/.test(r) && !localStorage.getItem('th_ref_from')) {
        localStorage.setItem('th_ref_from', r.toUpperCase());
      }
    } catch (e) {}
  }

  // ---------- record the referral once the new user is signed in ----------
  async function record(u) {
    try {
      var ref = localStorage.getItem('th_ref_from');
      if (!ref || !u || !u.id) return;
      if (localStorage.getItem('th_ref_done') === u.id) return;
      var finish = function () { localStorage.setItem('th_ref_done', u.id); localStorage.removeItem('th_ref_from'); };
      if (ref === codeFor(u)) { finish(); return; }                                   // own link
      var created = u.created_at ? Date.parse(u.created_at) : NaN;
      if (!isNaN(created) && Date.now() - created > NEW_ACCOUNT_WINDOW_MS) { finish(); return; } // existing member
      var client = window.supabaseClient;
      if (!client) return;
      var res = await client.from(TABLE).insert({ referrer_code: ref, referred_user_id: u.id });
      if (!res.error || res.error.code === '23505') finish();                          // saved, or already counted
      else console.warn('[ToolHub] referral not recorded:', res.error.message);
    } catch (e) { console.warn('[ToolHub] referral:', e && e.message); }
  }

  // ---------- friends joined ----------
  async function loadCount(code) {
    var client = window.supabaseClient;
    if (!client || !code) { state.count = 0; paintStats(); return; }
    try {
      var res = await client.from(TABLE).select('id', { count: 'exact', head: true }).eq('referrer_code', code);
      state.count = res.error ? 0 : (res.count || 0);
      if (res.error) console.warn('[ToolHub] referral count:', res.error.message);
    } catch (e) { state.count = 0; }
    paintStats();
  }

  function nextTier(n) { for (var i = 0; i < TIERS.length; i++) if (n < TIERS[i].count) return TIERS[i]; return null; }

  function statsHTML() {
    var n = state.count;
    if (n === null) return '<div class="rf-stat-num">–</div><div class="rf-stat-label">friends joined</div><p class="rf-muted">Checking…</p>';
    var nt = nextTier(n), html = '<div class="rf-stat-num">' + n + '</div><div class="rf-stat-label">' + (n === 1 ? 'friend joined' : 'friends joined') + '</div>';
    if (nt) {
      var prev = 0; for (var i = 0; i < TIERS.length; i++) { if (TIERS[i] === nt) break; prev = TIERS[i].count; }
      var pct = Math.max(4, Math.round(((n - prev) / (nt.count - prev)) * 100));
      html += '<div class="rf-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + nt.count + '" aria-valuenow="' + n + '"><span style="width:' + pct + '%"></span></div>' +
              '<p class="rf-muted">' + (nt.count - n) + ' more to unlock <b>' + esc(nt.title) + '</b></p>';
    } else {
      html += '<p class="rf-muted">You have unlocked every reward. Thank you!</p>';
    }
    return html;
  }
  function paintStats() { var el = document.getElementById('rf-stats-body'); if (el) el.innerHTML = statsHTML(); paintTiers(); }

  function tiersHTML() {
    var n = state.count || 0;
    return TIERS.map(function (t) {
      var ok = n >= t.count;
      return '<li class="rf-tier' + (ok ? ' is-done' : '') + '"><span class="rf-tier-ic" data-ic="' + (ok ? 'circle-check' : 'gift') + '"></span>' +
        '<div><b>' + t.count + ' friends</b> <span class="rf-dash">·</span> ' + esc(t.title) + '<small>' + esc(t.note) + '</small></div>' +
        '<span class="rf-tier-state">' + (ok ? 'Unlocked' : Math.max(0, t.count - n) + ' to go') + '</span></li>';
    }).join('');
  }
  function paintTiers() { var el = document.getElementById('rf-tiers'); if (el) { el.innerHTML = tiersHTML(); if (window.ThIcons) ThIcons.run(el); } }

  // ---------- page ----------
  function reportRenderError(message) {
    console.error('[ToolHub] Refer & Earn render error:', message);
    var el = document.getElementById('refer-view');
    if (!el) {
      var page = document.getElementById('page-refer');
      if (page) {
        el = document.createElement('div');
        el.id = 'refer-view';
        page.appendChild(el);
      }
    }
    if (el) {
      el.innerHTML =
        '<div class="rf-card" role="alert"><h1 class="rf-h">Refer &amp; Earn is unavailable</h1>' +
        '<p class="rf-muted">' + esc(message) + ' Please refresh the page and try again.</p></div>';
    }
  }

  function isReferPage() {
    return typeof App !== 'undefined' && App && App.currentPage === 'refer';
  }

  function render() {
    try { renderInner(); } catch (e) { reportRenderError((e && e.message) || 'Something went wrong.'); }
  }

  function renderInner() {
    var el = document.getElementById('refer-view');
    if (!el) {
      if (renderAttempts++ < 10) {
        setTimeout(render, 100);
      } else {
        reportRenderError('The referral page mount element could not be found.');
      }
      return;
    }
    renderAttempts = 0;
    var u = user(), code = codeFor(u), link = u ? linkFor(code) : '';
    var main;
    if (u) {
      var msg = message(link), q = encodeURIComponent(msg);
      main =
        '<section class="rf-card"><h2 class="rf-h">Your personal link</h2>' +
        '<label class="rf-label" for="rf-link">Anyone who signs up from this link counts as your referral.</label>' +
        '<div class="rf-copy"><input id="rf-link" class="rf-input" type="text" readonly value="' + esc(link) + '" onfocus="this.select()">' +
        '<button type="button" class="rf-btn rf-btn-primary" id="rf-copy-btn" onclick="ThReferral.copy()"><span data-ic="copy"></span><span id="rf-copy-txt">Copy link</span></button></div>' +
        '<p class="rf-muted">Your code: <b class="rf-code">' + esc(code) + '</b></p>' +
        '<h3 class="rf-sub">Or send it directly</h3><div class="rf-share">' +
        '<a class="rf-btn" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=' + q + '"><span data-ic="message-circle"></span>WhatsApp</a>' +
        '<a class="rf-btn" target="_blank" rel="noopener noreferrer" href="https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent('Free PDF, image and AI tools in one place.') + '"><span data-ic="send"></span>Telegram</a>' +
        '<a class="rf-btn" href="mailto:?subject=' + encodeURIComponent('A free toolbox you might like') + '&body=' + q + '"><span data-ic="mail"></span>Email</a>' +
        (navigator.share ? '<button type="button" class="rf-btn" onclick="ThReferral.share()"><span data-ic="share-2"></span>More…</button>' : '') +
        '</div></section>' +
        '<aside class="rf-card"><h2 class="rf-h">Your progress</h2><div id="rf-stats-body">' + statsHTML() + '</div></aside>';
    } else {
      main =
        '<section class="rf-card rf-locked"><span class="rf-lock" data-ic="user-plus"></span><h2 class="rf-h">Sign in to get your link</h2>' +
        '<p class="rf-muted">Your link is tied to your account, so we can count the friends who join through it. It takes a few seconds.</p>' +
        '<div class="rf-share"><button type="button" class="rf-btn rf-btn-primary" onclick="showAuthModal(\'login\')">Sign in</button>' +
        '<button type="button" class="rf-btn" onclick="showAuthModal(\'signup\')">Create account</button></div></section>';
    }
    el.innerHTML =
      '<div class="rf"><header class="rf-head"><h1 class="page-heading"><span data-ic="gift"></span>Refer &amp; Earn</h1>' +
      '<p class="rf-lead">Know someone who would find ToolHub useful? Send them your link. When they sign up, it counts toward your rewards.</p></header>' +
      '<div class="rf-grid' + (u ? '' : ' is-single') + '">' + main + '</div>' +
      '<section class="rf-section"><h2 class="rf-h">How it works</h2><ol class="rf-steps">' +
      '<li><span class="rf-n">1</span><div><b>Share your link</b><p>Send it on WhatsApp, Telegram, email, or anywhere you like.</p></div></li>' +
      '<li><span class="rf-n">2</span><div><b>Your friend signs up</b><p>They create a free ToolHub account using your link.</p></div></li>' +
      '<li><span class="rf-n">3</span><div><b>You unlock rewards</b><p>Each friend moves you closer to the next reward below.</p></div></li></ol></section>' +
      '<section class="rf-section"><h2 class="rf-h">Rewards</h2><ul class="rf-tiers" id="rf-tiers">' + tiersHTML() + '</ul></section>' +
      '<section class="rf-section"><h2 class="rf-h">Good to know</h2>' +
      '<details class="rf-faq"><summary>When does a friend count?</summary><p>When they create a new account after opening your link, in the same browser.</p></details>' +
      '<details class="rf-faq"><summary>Can I refer myself?</summary><p>No. Your own link, repeat sign-ups and existing accounts are not counted.</p></details>' +
      '<details class="rf-faq"><summary>Is there a limit?</summary><p>No limit on friends. Rewards are listed above and may change over time.</p></details>' +
      '</section></div>';
    if (window.ThIcons) ThIcons.run(el);
    if (u) { state.count = null; paintStats(); loadCount(code); record(u); }
  }

  function copy() {
    var inp = document.getElementById('rf-link'); if (!inp) return;
    var done = function () {
      var t = document.getElementById('rf-copy-txt'); if (t) { t.textContent = 'Copied'; setTimeout(function () { if (t.isConnected) t.textContent = 'Copy link'; }, 1800); }
      if (typeof showToast === 'function') showToast('Link copied. Paste it anywhere to share.', 'success');
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(inp.value).then(done, function () { fallback(); });
    else fallback();
    function fallback() { inp.select(); try { document.execCommand('copy'); done(); } catch (e) { if (typeof showToast === 'function') showToast('Press and hold the link to copy it', 'info'); } }
  }
  function share() {
    var u = user(); if (!u || !navigator.share) return;
    var link = linkFor(codeFor(u));
    navigator.share({ title: 'ToolHub 5D', text: message(link), url: link }).catch(function () {});
  }

  // ---------- wiring ----------
  var attached = false;
  function attach() {
    var c = window.supabaseClient;
    if (attached || !c || !c.auth || !c.auth.onAuthStateChange) return false;
    attached = true;
    c.auth.onAuthStateChange(function (event, session) {
      var u = session && session.user;
      if (event === 'SIGNED_IN' && u) record(u);
      if (isReferPage()) setTimeout(render, 150);
    });
    c.auth.getSession().then(function (res) {
      if (res.error) {
        console.warn('[ToolHub] referral auth state:', res.error.message);
        return;
      }
      if (res.data && res.data.session && isReferPage()) setTimeout(render, 0);
    }).catch(function (e) {
      console.warn('[ToolHub] referral auth state:', e && e.message);
    });
    return true;
  }
  captureRef();
  var tries = 0, timer = setInterval(function () { if (attach() || ++tries > 40) clearInterval(timer); }, 500);

  window.renderReferPage = render;
  window.ThReferral = { render: render, copy: copy, share: share, codeFor: codeFor, record: record, attach: attach };
})();
