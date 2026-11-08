/* ═══════════════════════════════════════════════════════════
   GAMES PREMIUM JS — ToolHub 5D
   Premium gaming section: cards, filters, enhanced Ludo
   ═══════════════════════════════════════════════════════════ */

// ── GAME METADATA (categories, difficulty, players, ratings) ──
const GP_META = {
  'ludo':              { cat:'board',    diff:'medium', players:'2-4', rating:4.8, plays:'12k', bg:'linear-gradient(135deg,#1a0533,#6b21a8)', trending:true },
  'chess':             { cat:'strategy', diff:'hard',   players:'2',   rating:4.7, plays:'8k',  bg:'linear-gradient(135deg,#1c1c1c,#4a4a4a)', trending:true },
  'snake':             { cat:'arcade',   diff:'easy',   players:'1',   rating:4.5, plays:'15k', bg:'linear-gradient(135deg,#065f46,#059669)', trending:true },
  '2048':              { cat:'puzzle',   diff:'medium', players:'1',   rating:4.6, plays:'11k', bg:'linear-gradient(135deg,#78350f,#d97706)', trending:true },
  'tic-tac-toe':       { cat:'board',    diff:'easy',   players:'2',   rating:4.3, plays:'9k',  bg:'linear-gradient(135deg,#312e81,#4338ca)' },
  'connect-four':      { cat:'board',    diff:'medium', players:'2',   rating:4.4, plays:'6k',  bg:'linear-gradient(135deg,#1d4ed8,#2563eb)' },
  'memory-cards':      { cat:'puzzle',   diff:'easy',   players:'1',   rating:4.2, plays:'7k',  bg:'linear-gradient(135deg,#7c3aed,#8b5cf6)' },
  'snake-ladder':      { cat:'board',    diff:'easy',   players:'2-4', rating:4.1, plays:'5k',  bg:'linear-gradient(135deg,#dc2626,#ef4444)' },
  'hangman':           { cat:'puzzle',   diff:'medium', players:'1',   rating:4.0, plays:'4k',  bg:'linear-gradient(135deg,#0369a1,#0284c7)' },
  'rock-paper-scissors':{ cat:'arcade',  diff:'easy',   players:'2',   rating:3.9, plays:'10k', bg:'linear-gradient(135deg,#be185d,#ec4899)' },
  'word-scramble':     { cat:'puzzle',   diff:'medium', players:'1',   rating:4.0, plays:'3k',  bg:'linear-gradient(135deg,#0f766e,#14b8a6)' },
  'number-guess':      { cat:'puzzle',   diff:'easy',   players:'1',   rating:3.8, plays:'4k',  bg:'linear-gradient(135deg,#7e22ce,#a855f7)' },
  'coin-flip':         { cat:'arcade',   diff:'easy',   players:'1',   rating:3.7, plays:'8k',  bg:'linear-gradient(135deg,#ca8a04,#fbbf24)' },
  'dice-roller':       { cat:'arcade',   diff:'easy',   players:'1',   rating:3.8, plays:'6k',  bg:'linear-gradient(135deg,#b91c1c,#ef4444)' },
  'mili-milimita':     { cat:'arcade',   diff:'medium', players:'1',   rating:4.1, plays:'2k',  bg:'linear-gradient(135deg,#0369a1,#06b6d4)' },
  'cards':             { cat:'cards',    diff:'easy',   players:'1',   rating:3.9, plays:'3k',  bg:'linear-gradient(135deg,#166534,#22c55e)' },
  'tetris':            { cat:'arcade',   diff:'hard',   players:'1',   rating:4.5, plays:'9k',  bg:'linear-gradient(135deg,#1e3a5f,#2563eb)', trending:true },
  'wheel-spinner':     { cat:'arcade',   diff:'easy',   players:'1',   rating:3.6, plays:'4k',  bg:'linear-gradient(135deg,#7c2d12,#ea580c)' },
  'truth-dare-game':   { cat:'multiplayer', diff:'easy', players:'2+', rating:4.2, plays:'5k', bg:'linear-gradient(135deg,#831843,#db2777)' },
  'tug-of-war':        { cat:'multiplayer', diff:'easy', players:'1-2', rating:4.3, plays:'3k', bg:'linear-gradient(135deg,#7c2d12,#dc2626)' },
};

// ── BUILD PREMIUM GAME CARD ──
function gpBuildCard(g, idx) {
  const m = GP_META[g.id] || { cat:'arcade', diff:'easy', players:'1', rating:4.0, plays:'1k', bg:'linear-gradient(135deg,#312e81,#6d28d9)' };
  const stars = '★'.repeat(Math.round(m.rating)) + '☆'.repeat(5 - Math.round(m.rating));
  const diffClass = { easy:'easy', medium:'medium', hard:'hard' }[m.diff] || 'easy';
  return `
  <div class="game-card gp-reveal" data-cat="${m.cat}" data-id="${g.id}"
       onclick="gpCardClick(event,'${g.id}')" style="animation-delay:${idx*0.04}s">
    <div class="game-diff ${diffClass}">${m.diff}</div>
    <div class="game-players">👥 ${m.players}</div>
    <div class="game-card-icon">${g.icon}</div>
    <div class="game-card-name">${g.name}</div>
    <div class="game-card-desc">${g.desc}</div>
    <div class="game-card-meta">
      <span class="game-card-cat">${m.cat}</span>
      <span class="game-card-rating">⭐ ${m.rating}</span>
    </div>
    <button class="game-card-btn">▶ Play</button>
  </div>`;
}

// ── CARD CLICK WITH RIPPLE ──
function gpCardClick(e, id) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'gp-ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  card.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
  setTimeout(() => openGame(id), 120);
}

// ── SEARCH ──
function gpSearch(q) {
  const lower = q.toLowerCase().trim();
  document.querySelectorAll('#games-grid .game-card').forEach(card => {
    const id = card.dataset.id;
    const g = GAMES_DATA.find(x => x.id === id);
    const match = !lower || (g && (g.name.toLowerCase().includes(lower) || g.desc.toLowerCase().includes(lower)));
    card.classList.toggle('gp-hidden', !match);
  });
  gpUpdateCount();
}

// ── FILTER ──
function gpFilter(cat, btn) {
  document.querySelectorAll('.gp-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const q = (document.getElementById('gp-search') || {}).value || '';
  document.querySelectorAll('#games-grid .game-card').forEach(card => {
    const matchCat = cat === 'all' || card.dataset.cat === cat;
    const id = card.dataset.id;
    const g = GAMES_DATA.find(x => x.id === id);
    const lower = q.toLowerCase().trim();
    const matchQ = !lower || (g && (g.name.toLowerCase().includes(lower) || g.desc.toLowerCase().includes(lower)));
    card.classList.toggle('gp-hidden', !(matchCat && matchQ));
  });
  gpUpdateCount();
}

function gpUpdateCount() {
  const el = document.getElementById('gp-count');
  if (!el) return;
  const visible = document.querySelectorAll('#games-grid .game-card:not(.gp-hidden)').length;
  el.textContent = `${visible} game${visible !== 1 ? 's' : ''}`;
}

// ── TRENDING ROW ──
function gpRenderTrending() {
  const el = document.getElementById('gp-trending-row');
  if (!el) return;
  const trending = GAMES_DATA.filter(g => GP_META[g.id]?.trending);
  el.innerHTML = trending.map(g => {
    const m = GP_META[g.id];
    return `
    <div class="gp-featured-card" onclick="openGame('${g.id}')">
      <div class="gp-featured-bg" style="background:${m.bg}">
        <span style="font-size:3.5rem;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4))">${g.icon}</span>
        <div class="gp-trending-badge">🔥 HOT</div>
      </div>
      <div class="gp-featured-info">
        <div class="gp-featured-name">${g.name}</div>
        <div class="gp-featured-plays">⭐ ${m.rating} · ${m.plays} plays</div>
      </div>
    </div>`;
  }).join('');
}

// ── DAILY CHALLENGE TIMER ──
function gpStartDailyTimer() {
  const el = document.getElementById('gp-daily-timer');
  if (!el) return;
  function update() {
    const now = new Date();
    const midnight = new Date(now); midnight.setHours(24,0,0,0);
    const diff = midnight - now;
    const h = String(Math.floor(diff/3600000)).padStart(2,'0');
    const m = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
    const s = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
    el.textContent = `${h}:${m}:${s}`;
  }
  update(); setInterval(update, 1000);
}

// ══════════════════════════════════════════════════════════════
//  LUDO PREMIUM ENHANCEMENTS
//  Wraps existing ludoRollDice, ludoMoveToken etc with better UI
// ══════════════════════════════════════════════════════════════

// ── Confetti burst ──
function gpConfetti(colors = ['#ffd700','#ec4899','#6366f1','#22c55e','#f97316']) {
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'gp-confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size  = Math.random() * 10 + 6;
    const left  = Math.random() * 100;
    const dur   = Math.random() * 2 + 2;
    const delay = Math.random() * 1.5;
    piece.style.cssText = `
      left:${left}vw; width:${size}px; height:${size}px;
      background:${color}; animation-duration:${dur}s; animation-delay:${delay}s;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), (dur + delay) * 1000 + 200);
  }
}

// ── Victory overlay ──
function gpShowVictory(playerName, playerColor) {
  gpConfetti();
  const ov = document.createElement('div');
  ov.className = 'ludo-victory';
  ov.id = 'ludo-victory-overlay';
  ov.innerHTML = `
    <div class="ludo-victory-box">
      <span class="ludo-victory-trophy">🏆</span>
      <div class="ludo-victory-title">${playerName} Wins!</div>
      <div class="ludo-victory-sub">Congratulations! All tokens reached home!</div>
      <div style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap">
        <button class="ludo-victory-btn" onclick="gpCloseVictory();ludoNewGame()">🔄 New Game</button>
        <button class="ludo-victory-btn" style="background:var(--glass2);color:#fff;box-shadow:none;border:1px solid rgba(255,255,255,.2)"
                onclick="gpCloseVictory()">✕ Close</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
}

function gpCloseVictory() {
  const ov = document.getElementById('ludo-victory-overlay');
  if (ov) ov.remove();
}

// ── Shake dice canvas ──
function gpDiceShake() {
  const c = document.getElementById('ludo-dice-canvas');
  if (!c) return;
  c.classList.remove('rolling');
  void c.offsetWidth; // reflow
  c.classList.add('rolling');
  setTimeout(() => c.classList.remove('rolling'), 500);
}

// ── Animate status text ──
function gpStatusPulse(msg, color) {
  const el = document.getElementById('ludo-status');
  if (!el) return;
  el.style.color = color || '#ffd700';
  el.style.transform = 'scale(1.08)';
  el.textContent = msg;
  setTimeout(() => { el.style.transform = ''; }, 300);
}

// ── Invalid move visual ──
function gpInvalidFeedback() {
  const canvas = document.getElementById('ludo-canvas');
  if (!canvas) return;
  canvas.classList.add('ludo-invalid');
  setTimeout(() => canvas.classList.remove('ludo-invalid'), 400);
}

// ── Override ludoRollDice to add premium dice animation ──
const _origLudoRollDice = window.ludoRollDice;
window.ludoRollDice = function() {
  if (!ludoState || ludoState.animating) return;
  if (ludoState.phase !== 'roll') return;
  gpDiceShake();
  // disable button during roll
  const btn = document.getElementById('ludo-roll-btn');
  if (btn) btn.disabled = true;
  // Call original after shake starts
  const p = ludoState.currentPlayer;
  let rollCount = 0;
  const rollAnim = setInterval(() => {
    drawDiceCanvas(Math.floor(Math.random() * 6) + 1);
    if (++rollCount >= 8) {
      clearInterval(rollAnim);
      const die = Math.floor(Math.random() * 6) + 1;
      ludoState.dice = die;
      drawDiceCanvas(die);
      if (btn) btn.disabled = false;
      ludoProcessRoll(p, die);
    }
  }, 65);
};

// ── Override ludoUpdateStatus for premium feedback ──
const _origLudoUpdateStatus = window.ludoUpdateStatus;
window.ludoUpdateStatus = function(msg) {
  const el = document.getElementById('ludo-status');
  if (!el) return;
  // Color by player name mention
  let color = '#ffd700';
  if (msg.includes('Red'))    color = LUDO.COLORS[0];
  if (msg.includes('Green'))  color = LUDO.COLORS[1];
  if (msg.includes('Yellow')) color = LUDO.COLORS[2];
  if (msg.includes('Blue'))   color = LUDO.COLORS[3];
  if (msg.includes('CAPTURED') || msg.includes('penalty')) color = '#ef4444';
  if (msg.includes('HOME') || msg.includes('WON'))         color = '#ffd700';
  el.style.color = color;
  el.textContent = msg;
  el.style.textShadow = `0 0 10px ${color}66`;
};

// ── Override ludoUpdateInfo for premium player panels ──
const _origLudoUpdateInfo = window.ludoUpdateInfo;
window.ludoUpdateInfo = function() {
  const el = document.getElementById('ludo-info');
  if (!el || !ludoState) return;
  el.innerHTML = ludoState.activePlayers.map(p => {
    const fin = ludoState.tokens[p].filter(t => t.pos === 58).length;
    const rank = ludoState.winners.indexOf(p);
    const isCurrent = ludoState.currentPlayer === p;
    const col = LUDO.COLORS[p];
    return `
    <div class="ludo-player-panel${isCurrent ? ' active' : ''}"
         style="background:${col}22;border-color:${isCurrent ? col : 'transparent'};--player-color:${col}66">
      <div class="ludo-panel-name">${LUDO.NAMES[p]}${isCurrent ? ' <span class="ludo-turn-arrow">▼</span>' : ''}</div>
      <div class="ludo-panel-tokens" aria-label="${fin} of 4 tokens home">
        ${Array.from({length:4}, (_, i) => `<span class="ludo-mini-token ${i < fin ? 'home' : ''}" style="--token-color:${col}">${i < fin ? '★' : ''}</span>`).join('')}
      </div>
      ${isCurrent ? '<div class="ludo-panel-turn">YOUR TURN</div>' : ''}
      ${rank >= 0 ? `<div style="font-size:.7rem;color:#ffd700">#${rank+1} 🏆</div>` : ''}
    </div>`;
  }).join('');
};

// ── Override ludoMoveToken to show victory overlay ──
const _gpOrigLudoMoveToken = window.ludoMoveToken;
window.ludoMoveToken = function(player, tok) {
  // Call original
  _gpOrigLudoMoveToken.call(this, player, tok);
  // Check if this player just won (all 4 tokens home)
  if (ludoState) {
    const fin = ludoState.tokens[player].filter(t => t.pos === 58).length;
    if (fin === 4 && !document.getElementById('ludo-victory-overlay')) {
      setTimeout(() => gpShowVictory(LUDO.NAMES[player], LUDO.COLORS[player]), 600);
    }
  }
};

// ── Override ludoLogMove for premium log entries ──
const _origLudoLogMove = window.ludoLogMove;
window.ludoLogMove = function(player, die, action) {
  const el = document.getElementById('ludo-move-log');
  if (!el) return;
  const entry = document.createElement('div');
  entry.className = 'ludo-log-entry';
  entry.innerHTML = `
    <div class="ludo-log-dot" style="background:${LUDO.COLORS[player]}"></div>
    <span style="color:${LUDO.COLORS[player]};font-weight:700">${LUDO.NAMES[player]}</span>
    <span>rolled ${die}</span>
    <span style="color:rgba(255,255,255,.5)">${action}</span>`;
  el.insertBefore(entry, el.firstChild);
  // Keep max 20 entries
  while (el.children.length > 20) el.removeChild(el.lastChild);
};

// ── Make original ludoLogMove a no-op so our override is the only one ──
// (The original just did innerHTML updates — we replace entirely)
// Safe: if original is undefined, define it
if (!window.ludoLogMove || window.ludoLogMove === _origLudoLogMove) {
  // Already set above as override
}

// ══════════════════════════════════════════════════════════════
//  ENHANCED LUDO RENDER — replaces basic HTML with premium layout
// ══════════════════════════════════════════════════════════════
const _origRenderLudoGame = window.renderLudoGame;
window.renderLudoGame = function() {
  const view = document.getElementById('game-view');
  if (!view) return;
  view.innerHTML = `
  <div class="game-view-wrap">
    <div class="game-view-header">
      <button class="game-back-btn" onclick="navigate('games')">← Back</button>
      <h1 style="font-family:var(--font-display);font-size:1.05rem;font-weight:800;flex:1">🎲 Ludo King</h1>
      <button class="game-control-btn" style="padding:.3rem .8rem;font-size:.76rem" onclick="ludoNewGame()">New Game</button>
    </div>

    <div id="ludo-premium-wrap">

      <!-- Setup Screen -->
      <div id="ludo-setup" class="ludo-setup-premium">
        <div class="ludo-setup-icon">🎲</div>
        <div class="ludo-setup-title">Ludo King</div>
        <div class="ludo-setup-sub">Race your tokens home and crush your rivals!</div>
        <div class="ludo-player-btns">
          <div class="ludo-player-btn" onclick="initLudo(2)">
            <strong>2</strong><span>🔴 🟡</span><span style="font-size:.65rem">Players</span>
          </div>
          <div class="ludo-player-btn" onclick="initLudo(3)">
            <strong>3</strong><span>🔴 🟢 🟡</span><span style="font-size:.65rem">Players</span>
          </div>
          <div class="ludo-player-btn" onclick="initLudo(4)">
            <strong>4</strong><span>🔴 🟢 🟡 🔵</span><span style="font-size:.65rem">Players</span>
          </div>
        </div>
        <div class="ludo-rules">
          <b>How to play:</b><br>
          • Roll dice to move your tokens around the board<br>
          • Roll a <b>6</b> to bring a token out of home<br>
          • Land on enemies to send them back!<br>
          • First to get all 4 tokens home wins 🏆
        </div>
      </div>

      <!-- Game Screen -->
      <div id="ludo-game" style="display:none">
        <div id="ludo-status" style="color:#ffd700;text-shadow:0 0 10px #ffd70066"></div>
        <div class="ludo-board-area">
          <canvas id="ludo-canvas" width="380" height="380" touch-action="none"></canvas>
        </div>
        <div class="ludo-controls">
          <canvas id="ludo-dice-canvas" width="56" height="56" onclick="ludoRollDice()" title="Roll Dice"></canvas>
          <button class="game-control-btn" id="ludo-roll-btn" onclick="ludoRollDice()">🎲 Roll Dice</button>
        </div>
        <div id="ludo-info"></div>
        <div class="ludo-log-wrap">
          <div class="ludo-log-title">📜 Move Log</div>
          <div id="ludo-move-log"></div>
        </div>
      </div>

    </div>
  </div>`;
};

// ── Patch initLudo to also re-render info with premium layout ──
const _origInitLudo = window.initLudo;
window.initLudo = function(numPlayers) {
  ludoMoveLog = [];
  _origInitLudo.call(this, numPlayers);
};


// ══════════════════════════════════════════════════════════════
//  LUDO KING — PHYSICAL DICE MOVEMENT SYSTEM
//  The dice lives INSIDE the active player's panel.
//  On turn change it physically flies to the next player's slot.
// ══════════════════════════════════════════════════════════════

// ── Completely replace renderLudoGame with new layout ──
window.renderLudoGame = function() {
  const view = document.getElementById('game-view');
  if (!view) return;
  view.innerHTML = `
  <div class="game-view-wrap">
    <div class="game-view-header">
      <button class="game-back-btn" onclick="navigate('games')">← Back</button>
      <h1 style="font-family:var(--font-display);font-size:1.05rem;font-weight:800;flex:1">🎲 Ludo King</h1>
      <button class="game-control-btn" style="padding:.3rem .8rem;font-size:.76rem" onclick="ludoNewGame()">New Game</button>
    </div>

    <div id="ludo-premium-wrap">

      <!-- Setup Screen -->
      <div id="ludo-setup" class="ludo-setup-premium">
        <div class="ludo-setup-icon">🎲</div>
        <div class="ludo-setup-title">Ludo King</div>
        <div class="ludo-setup-sub">Race your tokens home and crush your rivals!</div>
        <div class="ludo-player-btns">
          <div class="ludo-player-btn" onclick="initLudo(2)">
            <strong>2</strong><span>🔴 🟡</span><span style="font-size:.65rem">Players</span>
          </div>
          <div class="ludo-player-btn" onclick="initLudo(3)">
            <strong>3</strong><span>🔴 🟢 🟡</span><span style="font-size:.65rem">Players</span>
          </div>
          <div class="ludo-player-btn" onclick="initLudo(4)">
            <strong>4</strong><span>🔴 🟢 🟡 🔵</span><span style="font-size:.65rem">Players</span>
          </div>
        </div>
        <div class="ludo-rules">
          <b>How to play:</b><br>
          • Roll dice to move your tokens around the board<br>
          • Roll a <b>6</b> to bring a token out of home<br>
          • Land on enemies to send them back!<br>
          • First to get all 4 tokens home wins 🏆
        </div>
      </div>

      <!-- Game Screen -->
      <div id="ludo-game" style="display:none">

        <!-- STATUS -->
        <div id="ludo-status"></div>

        <!-- BOARD -->
        <div class="ludo-board-area">
          <canvas id="ludo-canvas" width="380" height="380" touch-action="none"></canvas>
        </div>

        <!-- PLAYER PANELS — dice physically lives here -->
        <div id="ludo-info" class="ludo-panels-grid"></div>

        <!-- FLOATING DICE — absolutely positioned, moves between panels -->
        <canvas id="ludo-dice-canvas" width="56" height="56"
                class="ludo-floating-dice"
                onclick="ludoRollDice()" title="Tap to roll"></canvas>

        <!-- ROLL BUTTON -->
        <div style="text-align:center;padding:.4rem 0 .6rem">
          <button class="game-control-btn" id="ludo-roll-btn" onclick="ludoRollDice()"
                  style="font-size:.95rem;padding:.5rem 1.6rem;background:linear-gradient(135deg,#ffd700,#f59e0b);color:#111;font-weight:800;min-height:44px;border-radius:99px;box-shadow:0 0 18px rgba(255,215,0,.4)">
            🎲 Roll Dice
          </button>
        </div>

        <!-- MOVE LOG -->
        <div class="ludo-log-wrap">
          <div class="ludo-log-title">📜 Move Log</div>
          <div id="ludo-move-log"></div>
        </div>

      </div>
    </div>
  </div>`;
};

// ── Patch initLudo ──
const _gpInitLudo2 = window.initLudo;
window.initLudo = function(numPlayers) {
  ludoMoveLog = [];
  _gpInitLudo2.call(this, numPlayers);
  // After original init, place dice at first player
  requestAnimationFrame(() => {
    gpRenderPlayerPanels();
    requestAnimationFrame(() => gpPlaceDiceAtPlayer(ludoState.currentPlayer, false));
  });
};

// ── Render player panels (Ludo King style) ──
function gpRenderPlayerPanels() {
  const el = document.getElementById('ludo-info');
  if (!el || !ludoState) return;
  // The dice is physically moved inside the active panel. Preserve its node
  // before replacing panel markup so turn updates can place it in the next slot.
  const dice = document.getElementById('ludo-dice-canvas');
  const game = document.getElementById('ludo-game');
  if (dice && game && dice.parentElement && dice.parentElement.classList.contains('ludo-dice-slot')) {
    game.appendChild(dice);
  }
  el.innerHTML = ludoState.activePlayers.map(p => {
    const fin = ludoState.tokens[p].filter(t => t.pos === 58).length;
    const rank = ludoState.winners.indexOf(p);
    const isCurrent = ludoState.currentPlayer === p;
    const col = LUDO.COLORS[p];
    const name = LUDO.NAMES[p];
    return `
    <div class="ludo-player-panel${isCurrent ? ' active' : ''}"
         id="ludo-panel-${p}"
         style="--player-color:${col};border-color:${isCurrent ? col : 'transparent'};background:${col}18">
      <!-- Dice slot — dice flies here -->
      <div class="ludo-dice-slot" id="ludo-dice-slot-${p}"></div>
      <div class="ludo-panel-avatar" style="background:${col}33;border-color:${col}">
        <span style="font-size:1.1rem">${['🔴','🟢','🟡','🔵'][p]}</span>
      </div>
      <div class="ludo-panel-name">${name}${isCurrent ? ' <span class="ludo-turn-arrow">▼</span>' : ''}</div>
      <div class="ludo-panel-tokens">${'🟡'.repeat(fin)}${'⚪'.repeat(4 - fin)}</div>
      ${isCurrent ? '<div class="ludo-panel-turn">YOUR TURN</div>' : ''}
      ${rank >= 0 ? `<div style="font-size:.68rem;color:#ffd700;font-weight:800">#${rank+1} 🏆</div>` : ''}
    </div>`;
  }).join('');
}

// ── PHYSICAL DICE PLACEMENT — moves dice INTO a player slot ──
function gpPlaceDiceAtPlayer(playerIndex, animate) {
  const dice = document.getElementById('ludo-dice-canvas');
  const slot = document.getElementById(`ludo-dice-slot-${playerIndex}`);
  if (!dice || !slot) return;

  if (!animate) {
    // Instant placement (first render)
    _gpSnapDiceToSlot(dice, slot);
    return;
  }

  // Get current dice position (absolute on page)
  const fromRect = dice.getBoundingClientRect();
  const toRect   = slot.getBoundingClientRect();

  // Make dice position:fixed so it can fly freely
  dice.style.position = 'fixed';
  dice.style.left = fromRect.left + 'px';
  dice.style.top  = fromRect.top  + 'px';
  dice.style.zIndex = '9999';
  dice.style.transition = 'none';
  document.body.appendChild(dice); // detach from layout

  const dx = toRect.left - fromRect.left;
  const dy = toRect.top  - fromRect.top;

  // Trigger fly animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      dice.style.transition = 'left 0.5s cubic-bezier(0.34,1.56,0.64,1), top 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.5s';
      dice.style.left = (fromRect.left + dx) + 'px';
      dice.style.top  = (fromRect.top  + dy) + 'px';
      dice.style.transform = 'scale(1.18)';
      dice.style.boxShadow = `0 0 24px ${LUDO.COLORS[playerIndex]}88, 0 0 48px ${LUDO.COLORS[playerIndex]}44`;

      setTimeout(() => {
        // Snap into slot
        dice.style.transition = 'transform 0.15s';
        dice.style.transform = 'scale(1)';
        dice.style.boxShadow = '';
        setTimeout(() => _gpSnapDiceToSlot(dice, slot), 120);
      }, 520);
    });
  });
}

function _gpSnapDiceToSlot(dice, slot) {
  // Place dice as first child of slot
  dice.style.cssText = ''; // clear all inline styles
  dice.className = 'ludo-floating-dice ludo-dice-in-slot';
  slot.innerHTML = '';
  slot.appendChild(dice);
  gpDrawCurrentDice();
}

function gpDrawCurrentDice() {
  const n = (ludoState && ludoState.dice) ? ludoState.dice : 1;
  drawDiceCanvas(n);
}

// ── Override ludoRollDice — realistic roll then results appear in slot ──
window.ludoRollDice = function() {
  if (!ludoState || ludoState.animating) return;
  if (ludoState.phase !== 'roll') return;

  const btn = document.getElementById('ludo-roll-btn');
  const dice = document.getElementById('ludo-dice-canvas');
  if (btn) btn.disabled = true;

  // Add shake class
  if (dice) {
    dice.classList.add('ludo-dice-shaking');
    setTimeout(() => dice && dice.classList.remove('ludo-dice-shaking'), 600);
  }

  const p = ludoState.currentPlayer;
  let frame = 0;
  const totalFrames = 12;

  // Fast-then-slow frame intervals for realism
  const intervals = [45,45,50,55,60,70,80,95,110,125,145,160];
  let elapsed = 0;

  function nextFrame() {
    if (frame >= totalFrames) {
      const die = Math.floor(Math.random() * 6) + 1;
      ludoState.dice = die;
      drawDiceCanvas(die);

      // Glow the dice with player color
      if (dice) {
        dice.style.boxShadow = `0 0 16px ${LUDO.COLORS[p]}cc`;
        setTimeout(() => { if (dice) dice.style.boxShadow = ''; }, 600);
      }

      if (btn) btn.disabled = false;
      ludoProcessRoll(p, die);
      return;
    }
    drawDiceCanvas(Math.floor(Math.random() * 6) + 1);
    frame++;
    setTimeout(nextFrame, intervals[frame - 1] || 160);
  }
  nextFrame();
};

// ── Override ludoUpdateInfo to use our premium panels + move dice ──
window.ludoUpdateInfo = function() {
  if (!ludoState) return;
  // Re-render panels
  gpRenderPlayerPanels();
  // Move dice to current player's slot WITH animation
  requestAnimationFrame(() => gpPlaceDiceAtPlayer(ludoState.currentPlayer, true));
};

// ── Override ludoNextTurn to animate dice movement ──
const _gpOrigNextTurn2 = window.ludoNextTurn;
window.ludoNextTurn = function() {
  const prevPlayer = ludoState ? ludoState.currentPlayer : null;
  _gpOrigNextTurn2.call(this);
  // After turn changed, move dice
  if (ludoState && ludoState.currentPlayer !== prevPlayer) {
    requestAnimationFrame(() => {
      gpRenderPlayerPanels();
      requestAnimationFrame(() => gpPlaceDiceAtPlayer(ludoState.currentPlayer, true));
    });
  }
};

// ── Override ludoUpdateStatus with colored text ──
window.ludoUpdateStatus = function(msg) {
  const el = document.getElementById('ludo-status');
  if (!el) return;
  let color = '#ffd700';
  if (msg.includes('Red'))    color = LUDO.COLORS[0];
  if (msg.includes('Green'))  color = LUDO.COLORS[1];
  if (msg.includes('Yellow')) color = LUDO.COLORS[2];
  if (msg.includes('Blue'))   color = LUDO.COLORS[3];
  if (msg.includes('CAPTURED') || msg.includes('penalty')) color = '#ef4444';
  if (msg.includes('HOME') || msg.includes('WON') || msg.includes('Wins')) color = '#ffd700';
  el.style.color = color;
  el.style.textShadow = `0 0 12px ${color}66`;
  el.textContent = msg;
  // Micro scale pulse
  el.style.transform = 'scale(1.05)';
  setTimeout(() => { el.style.transform = ''; }, 250);
};

// ── Override gpShowVictory for triple confetti + fireworks ──
window.gpShowVictory = function(playerName, playerColor) {
  gpConfetti([playerColor, '#ffd700', '#fff', '#ff9a00', '#ec4899']);
  setTimeout(() => gpConfetti(['#6366f1', '#8b5cf6', '#ffd700', '#10b981']), 700);
  setTimeout(() => gpConfetti([playerColor, '#fff', '#ffd700']), 1400);

  const existing = document.getElementById('ludo-victory-overlay');
  if (existing) existing.remove();

  const ov = document.createElement('div');
  ov.className = 'ludo-victory';
  ov.id = 'ludo-victory-overlay';
  ov.innerHTML = `
    <div class="ludo-victory-box" style="position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,${playerColor}22,transparent 70%);pointer-events:none"></div>
      <span class="ludo-victory-trophy">🏆</span>
      <div class="ludo-victory-title">${playerName} Wins!</div>
      <div class="ludo-victory-sub">🎉 All tokens reached home!</div>
      <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin-top:1rem">
        <button class="ludo-victory-btn" onclick="gpCloseVictory();ludoNewGame()">🔄 Play Again</button>
        <button class="ludo-victory-btn" style="background:var(--glass2);color:#fff;box-shadow:none;border:1px solid rgba(255,255,255,.2)" onclick="gpCloseVictory()">✕ Close</button>
      </div>
    </div>`;
  document.body.appendChild(ov);

  const fws = ['🎆','🎇','✨','🌟','💥'];
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const fw = document.createElement('div');
      fw.textContent = fws[Math.floor(Math.random() * fws.length)];
      fw.style.cssText = `position:fixed;font-size:2rem;left:${Math.random()*80+10}vw;top:${Math.random()*60+10}vh;animation:gp-bounce-in .5s ease,gp-fade-in .5s .5s reverse forwards;pointer-events:none;z-index:10001`;
      document.body.appendChild(fw);
      setTimeout(() => fw.remove(), 1200);
    }, i * 180);
  }
};

// ── Override ludoMoveToken to show victory overlay ──
const _gpOrigMove2 = window.ludoMoveToken;
window.ludoMoveToken = function(player, tok) {
  _gpOrigMove2.call(this, player, tok);
  if (ludoState) {
    const fin = ludoState.tokens[player].filter(t => t.pos === 58).length;
    if (fin === 4 && !document.getElementById('ludo-victory-overlay')) {
      setTimeout(() => gpShowVictory(LUDO.NAMES[player], LUDO.COLORS[player]), 600);
    }
  }
};

// ── Override ludoLogMove for premium log entries ──
window.ludoLogMove = function(player, die, action) {
  const el = document.getElementById('ludo-move-log');
  if (!el) return;
  const entry = document.createElement('div');
  entry.className = 'ludo-log-entry';
  entry.innerHTML = `
    <div class="ludo-log-dot" style="background:${LUDO.COLORS[player]}"></div>
    <span style="color:${LUDO.COLORS[player]};font-weight:700;min-width:36px;font-size:.72rem">${LUDO.NAMES[player]}</span>
    <span style="font-size:.72rem;color:rgba(255,255,255,.7)">${['⚀','⚁','⚂','⚃','⚄','⚅'][die-1]||die} → ${action}</span>`;
  el.insertBefore(entry, el.firstChild);
  while (el.children.length > 20) el.removeChild(el.lastChild);
};

// ── Premium drawDiceCanvas — glossy with dots ──
window.drawDiceCanvas = function(n) {
  const c = document.getElementById('ludo-dice-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const S = c.width || 56;
  ctx.clearRect(0, 0, S, S);

  // Glow behind dice
  ctx.shadowColor = 'rgba(255,215,0,0.6)';
  ctx.shadowBlur = 10;

  // Dice body
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, '#fffde7');
  bg.addColorStop(0.45, '#fff9c4');
  bg.addColorStop(1, '#ffd700');
  ctx.fillStyle = bg;
  const rad = S * 0.16;
  ctx.beginPath();
  ctx.moveTo(rad + 3, 3);
  ctx.lineTo(S - rad - 3, 3);
  ctx.quadraticCurveTo(S-3, 3, S-3, rad+3);
  ctx.lineTo(S-3, S-rad-3);
  ctx.quadraticCurveTo(S-3, S-3, S-rad-3, S-3);
  ctx.lineTo(rad+3, S-3);
  ctx.quadraticCurveTo(3, S-3, 3, S-rad-3);
  ctx.lineTo(3, rad+3);
  ctx.quadraticCurveTo(3, 3, rad+3, 3);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Top-left sheen
  const sheen = ctx.createLinearGradient(3, 3, S*0.55, S*0.45);
  sheen.addColorStop(0, 'rgba(255,255,255,0.6)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fill();

  // Border
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dots
  const dotPatterns = {
    1: [[0.5,0.5]],
    2: [[0.27,0.27],[0.73,0.73]],
    3: [[0.27,0.27],[0.5,0.5],[0.73,0.73]],
    4: [[0.27,0.27],[0.73,0.27],[0.27,0.73],[0.73,0.73]],
    5: [[0.27,0.27],[0.73,0.27],[0.5,0.5],[0.27,0.73],[0.73,0.73]],
    6: [[0.27,0.2],[0.73,0.2],[0.27,0.5],[0.73,0.5],[0.27,0.8],[0.73,0.8]],
  };
  const dotR = S * 0.076;
  (dotPatterns[n] || dotPatterns[1]).forEach(([fx, fy]) => {
    const cx = fx * S, cy = fy * S;
    // Dot body
    ctx.fillStyle = n === 1 ? '#cc0000' : '#1a0533';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 2;
    ctx.beginPath(); ctx.arc(cx, cy, dotR, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    // Dot shine
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.beginPath(); ctx.arc(cx - dotR*0.28, cy - dotR*0.28, dotR*0.38, 0, Math.PI*2); ctx.fill();
  });
};

// ── Premium glossy token drawPin ──
window.drawPin = function(ctx, x, y, r, color, light, dark, highlighted, label) {
  ctx.save();

  // Selection ring
  if (highlighted) {
    const ringR = r + 7;
    const rg = ctx.createRadialGradient(x, y, r, x, y, ringR + 5);
    rg.addColorStop(0, 'rgba(255,215,0,0.85)');
    rg.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(x, y, ringR+5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(x, y, ringR, 0, Math.PI*2); ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = r * 0.9;
  ctx.shadowOffsetY = r * 0.4;
  ctx.fillStyle = dark + '99';
  ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // Main body — radial gradient for 3D sphere feel
  const bodyGrad = ctx.createRadialGradient(x - r*0.28, y - r*0.32, r*0.04, x, y, r);
  bodyGrad.addColorStop(0,   light);
  bodyGrad.addColorStop(0.4, color);
  bodyGrad.addColorStop(1,   dark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();

  // Edge rim (subtle bright ring)
  const rimG = ctx.createLinearGradient(x-r, y-r, x+r, y+r);
  rimG.addColorStop(0, 'rgba(255,255,255,0.22)');
  rimG.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.strokeStyle = rimG;
  ctx.lineWidth = r * 0.09;
  ctx.beginPath(); ctx.arc(x, y, r - r*0.045, 0, Math.PI*2); ctx.stroke();

  // Gloss highlight (upper-left teardrop)
  ctx.save();
  ctx.globalAlpha = 0.72;
  const glossG = ctx.createRadialGradient(x - r*0.3, y - r*0.38, r*0.02, x - r*0.1, y - r*0.15, r*0.52);
  glossG.addColorStop(0,   'rgba(255,255,255,0.95)');
  glossG.addColorStop(0.45,'rgba(255,255,255,0.35)');
  glossG.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = glossG;
  ctx.beginPath();
  ctx.ellipse(x - r*0.18, y - r*0.3, r*0.36, r*0.2, -0.45, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // Inner concave circle
  ctx.fillStyle = dark + 'cc';
  ctx.beginPath(); ctx.arc(x, y, r*0.44, 0, Math.PI*2); ctx.fill();
  const innerG = ctx.createRadialGradient(x-r*0.1, y-r*0.1, 0, x, y, r*0.44);
  innerG.addColorStop(0, light + 'dd');
  innerG.addColorStop(1, dark   + 'aa');
  ctx.fillStyle = innerG;
  ctx.beginPath(); ctx.arc(x, y, r*0.41, 0, Math.PI*2); ctx.fill();

  // Label
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${r * 0.82}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  ctx.fillText(String(label), x, y + r*0.05);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.restore();
};

// ── Vignette overlay on board ──
const _gpDrawBoard2 = window.drawLudoBoard;
window.drawLudoBoard = function(highlightIds) {
  _gpDrawBoard2(highlightIds);
  const canvas = document.getElementById('ludo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d'), S = 380;
  const vig = ctx.createRadialGradient(S/2,S/2,S*0.28,S/2,S/2,S*0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = vig;
  ctx.fillRect(0,0,S,S);
};
