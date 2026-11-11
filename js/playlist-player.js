/* playlist-player.js — v6: "Playlist Player" tool.
   Type a song name → we search Spotify's catalog (via a Netlify function that
   keeps the app's Client Secret server-side) and show results to pick from.
   You can also paste a Spotify track/album/playlist link directly — both
   paths end the same way: Spotify's own official embed player loads and
   plays the track, and it gets added to a local "recently played" list.

   No audio is ever downloaded or stored by ToolHub — that would violate
   Spotify's terms and doesn't fit in a browser's local storage anyway.
   What IS saved locally: name + link + cover thumbnail (tiny JSON) in
   localStorage, so the list survives reloads and can be replayed or
   deleted any time. */
'use strict';

const PLP_STORE_KEY = 'toolhub_playlist_history_v1';

function _plpLoadHistory() {
  try { return JSON.parse(localStorage.getItem(PLP_STORE_KEY) || '[]'); }
  catch (e) { return []; }
}
function _plpSaveHistory(list) {
  try { localStorage.setItem(PLP_STORE_KEY, JSON.stringify(list.slice(0, 40))); }
  catch (e) { /* storage full or unavailable (private mode) — fail silently */ }
}

// Accepts open.spotify.com links (with or without locale prefix / query params)
// and spotify:type:id URIs. Returns { type, id } or null if it's not a link
// (in which case the caller should treat it as a search query instead).
function _plpParseSpotifyUrl(raw) {
  const s = (raw || '').trim();
  let m = s.match(/^spotify:(track|album|playlist|episode|show):([a-zA-Z0-9]+)/i);
  if (m) return { type: m[1].toLowerCase(), id: m[2] };
  m = s.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/i);
  if (m) return { type: m[1].toLowerCase(), id: m[2] };
  return null;
}

function renderPlaylistPlayer() {
  const container = document.getElementById('tool-widget-container');
  container.innerHTML = `
    <div class="tool-widget">
      <div class="info-box info-box-blue" style="margin-bottom:1rem">
        🎵 Gaane ka naam likho aur seedha search karke play karo — link paste karne ki zaroorat nahi (chaho to link bhi daal sakte ho, wo bhi chal jaayega).
        Play kiya hua har gaana <strong>naam ke saath</strong> local history me save ho jaata hai, jab chaho dobara play karo ya delete karo.
      </div>
      <div class="form-group" style="margin-bottom:1rem">
        <label class="form-label">Gaane ka naam (ya Spotify link)</label>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap">
          <input class="form-input" id="plp-url-input" style="flex:1;min-width:200px" type="text"
            placeholder="jaise: Kesariya, ya koi Spotify link" onkeydown="if(event.key==='Enter')_plpSearchOrLoad()">
          <button class="btn-primary-glow" onclick="_plpSearchOrLoad()">🔍 Search &amp; Play</button>
        </div>
      </div>
      <div id="plp-search-results"></div>
      <div id="plp-player-wrap"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:1.6rem;margin-bottom:.6rem">
        <h3 style="margin:0;font-size:1rem">🕘 Recently Played</h3>
        <button class="btn-outline-glow" style="padding:.4rem .9rem;font-size:.8rem" onclick="_plpClearHistory()">🗑 Clear All</button>
      </div>
      <div id="plp-history"></div>
    </div>`;
  _plpRenderHistory();
}

async function _plpSearchOrLoad() {
  const input = document.getElementById('plp-url-input');
  const query = (input?.value || '').trim();
  if (!query) { showToast('Pehle gaane ka naam ya link daalo', 'warning'); return; }

  const parsed = _plpParseSpotifyUrl(query);
  const resultsEl = document.getElementById('plp-search-results');

  if (parsed) {
    // Direct link → load & play immediately, no search needed
    resultsEl.innerHTML = '';
    await _plpPlayItem({ url: query, type: parsed.type, id: parsed.id, title: parsed.type });
    input.value = '';
    return;
  }

  resultsEl.innerHTML = `<div class="info-box info-box-blue" style="margin-bottom:1rem">Searching…</div>`;
  try {
    const resp = await fetch(getFunctionEndpoint('spotify-search') + '?q=' + encodeURIComponent(query));
    const data = await resp.json();
    if (!resp.ok) {
      if (data.error === 'not_configured') {
        resultsEl.innerHTML = `<div class="info-box info-box-red">
          ⚠️ Naam se search karne ke liye site owner ko free Spotify Client ID/Secret set karna hoga (SETUP.md dekho).
          Tab tak, tum seedha koi Spotify link yahan paste kar sakte ho — wo abhi bhi kaam karega.
        </div>`;
      } else {
        resultsEl.innerHTML = `<div class="info-box info-box-red">❌ Search fail ho gayi: ${(data.error || 'try again').replace(/</g, '&lt;')}</div>`;
      }
      return;
    }
    const results = data.results || [];
    if (!results.length) {
      resultsEl.innerHTML = `<div class="info-box info-box-blue">Kuch nahi mila "${query.replace(/</g, '&lt;')}" ke liye — spelling check karo ya kuch aur try karo.</div>`;
      return;
    }
    resultsEl.innerHTML = `<div style="margin-bottom:1rem">${results.map((r) => `
      <div style="display:flex;align-items:center;gap:.75rem;padding:.6rem;border-radius:12px;background:var(--glass2);margin-bottom:.5rem;cursor:pointer"
           onclick='_plpPlayResult(${JSON.stringify(r).replace(/'/g, "&#39;")})'>
        ${r.thumb ? `<img src="${r.thumb}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0">` : `<div style="width:48px;height:48px;border-radius:8px;background:var(--glass);display:flex;align-items:center;justify-content:center;flex-shrink:0">🎵</div>`}
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${String(r.name).replace(/</g, '&lt;')}</div>
          <div style="font-size:.72rem;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${String(r.artists).replace(/</g, '&lt;')}</div>
        </div>
        <span class="btn-outline-glow" style="padding:.35rem .7rem;font-size:.75rem">▶ Play</span>
      </div>`).join('')}</div>`;
  } catch (e) {
    resultsEl.innerHTML = `<div class="info-box info-box-red">❌ Search service tak nahi pahunch paye. Internet check karo ya thodi der me try karo.</div>`;
  }
}

function _plpPlayResult(r) {
  _plpPlayItem({ url: r.url, type: 'track', id: r.id, title: r.name, artists: r.artists, thumb: r.thumb });
}

async function _plpPlayItem(item, opts) {
  opts = opts || {};
  const wrap = document.getElementById('plp-player-wrap');
  wrap.innerHTML = `<div class="info-box info-box-blue">Loading player…</div>`;
  const embedHtml = `<iframe src="https://open.spotify.com/embed/${item.type}/${item.id}"
      width="100%" height="${item.type === 'track' ? 152 : 352}" style="border-radius:14px;border:none;margin-bottom:.5rem"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;

  let title = item.title, thumb = item.thumb || '';
  // Only fetch metadata the first time we see this item (fresh search result
  // or pasted link). Replays from history already have a finished title/thumb.
  if (!opts.skipMetadata) {
    if (item.artists) {
      title = `${item.title} — ${item.artists}`;
    } else if (!thumb) {
      try {
        const resp = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(item.url));
        if (resp.ok) { const meta = await resp.json(); title = meta?.title || title; thumb = meta?.thumbnail_url || thumb; }
      } catch (e) { /* embed still works without metadata */ }
    }
  }

  wrap.innerHTML = embedHtml;
  _plpAddToHistory({ url: item.url, type: item.type, id: item.id, title, thumb });
}

function _plpReplayFromHistory(idx) {
  const list = _plpLoadHistory();
  const item = list[idx];
  if (!item) return;
  _plpPlayItem(item, { skipMetadata: true });
}

function _plpAddToHistory(entry) {
  let list = _plpLoadHistory();
  list = list.filter((x) => x.url !== entry.url);
  list.unshift({ ...entry, addedAt: Date.now() });
  _plpSaveHistory(list);
  _plpRenderHistory();
}

function _plpRenderHistory() {
  const el = document.getElementById('plp-history');
  if (!el) return;
  const list = _plpLoadHistory();
  if (!list.length) {
    el.innerHTML = `<p style="color:var(--text2);font-size:.85rem">Abhi koi history nahi — kuch play karo, wo yahan save ho jaayega.</p>`;
    return;
  }
  el.innerHTML = list.map((item, i) => `
    <div style="display:flex;align-items:center;gap:.75rem;padding:.6rem;border-radius:12px;background:var(--glass2);margin-bottom:.5rem">
      ${item.thumb
        ? `<img src="${item.thumb}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0">`
        : `<div style="width:48px;height:48px;border-radius:8px;background:var(--glass);display:flex;align-items:center;justify-content:center;flex-shrink:0">🎵</div>`}
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${String(item.title || '').replace(/</g, '&lt;')}</div>
        <div style="font-size:.72rem;color:var(--text2);text-transform:capitalize">${item.type}</div>
      </div>
      <button class="btn-outline-glow" style="padding:.35rem .7rem;font-size:.75rem" onclick="_plpReplayFromHistory(${i})">▶ Play</button>
      <button class="btn-outline-glow" style="padding:.35rem .6rem;font-size:.75rem;color:var(--red)" onclick="_plpRemoveFromHistory(${i})">🗑</button>
    </div>`).join('');
}

function _plpRemoveFromHistory(idx) {
  const list = _plpLoadHistory();
  list.splice(idx, 1);
  _plpSaveHistory(list);
  _plpRenderHistory();
  showToast('History se hata diya', 'success');
}

function _plpClearHistory() {
  _plpSaveHistory([]);
  _plpRenderHistory();
  showToast('History clear ho gayi', 'success');
}

// ── Register into the shared tool dispatcher ──
window.EXTRA_TOOL_WIDGETS = window.EXTRA_TOOL_WIDGETS || {};
window.EXTRA_TOOL_WIDGETS['playlist-player'] = renderPlaylistPlayer;
