/* games-new.js — v6: 6 new popular games, matching the existing games.js style
   (gameHeader wrapper, game-canvas-wrap, game-score-bar). Registered into the
   shared game dispatcher (see js/games.js extension point). */
'use strict';

// ══════════════════════ MINESWEEPER ══════════════════════
function renderMinesweeper() {
  const view = document.getElementById('game-view');
  const SIZE = 9, MINES = 10;
  const board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => ({ mine: false, revealed: false, flagged: false, n: 0 })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * SIZE), c = Math.floor(Math.random() * SIZE);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (board[r][c].mine) continue;
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && board[rr][cc].mine) n++;
    }
    board[r][c].n = n;
  }
  window._mine = { board, size: SIZE, over: false, flagsLeft: MINES, revealedCount: 0 };

  view.innerHTML = gameHeader('Minesweeper', '💣') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div>🚩 Flags left: <strong id="ms-flags">${MINES}</strong></div>
        <div id="ms-status" style="font-weight:700">Find all mines!</div>
        <button class="game-control-btn" onclick="renderMinesweeper()">🔄 New Game</button>
      </div>
      <p style="text-align:center;color:var(--text2);font-size:.8rem;margin:.4rem 0">Tap = reveal • Long-press / right-click = flag</p>
      <div id="ms-board" style="display:grid;grid-template-columns:repeat(${SIZE},1fr);gap:2px;max-width:400px;margin:0 auto;padding:1rem"></div>
    </div></div>`;
  _msRenderBoard();
}
function _msRenderBoard() {
  const { board, size } = window._mine;
  const el = document.getElementById('ms-board');
  let html = '';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    const cell = board[r][c];
    let content = '', bg = 'var(--glass2)';
    if (cell.revealed) {
      bg = 'var(--card)';
      content = cell.mine ? '💣' : (cell.n > 0 ? cell.n : '');
    } else if (cell.flagged) content = '🚩';
    html += `<div onclick="_msReveal(${r},${c})" oncontextmenu="event.preventDefault();_msFlag(${r},${c})"
      ontouchstart="this._t=setTimeout(()=>_msFlag(${r},${c}),450)" ontouchend="clearTimeout(this._t)"
      style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;border-radius:4px;cursor:pointer;background:${bg};border:1px solid var(--border);user-select:none">${content}</div>`;
  }
  el.innerHTML = html;
}
function _msFlag(r, c) {
  const s = window._mine; if (s.over) return;
  const cell = s.board[r][c]; if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  s.flagsLeft += cell.flagged ? -1 : 1;
  document.getElementById('ms-flags').textContent = s.flagsLeft;
  _msRenderBoard();
}
function _msReveal(r, c) {
  const s = window._mine; if (s.over) return;
  const cell = s.board[r][c];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true; s.revealedCount++;
  if (cell.mine) {
    s.over = true;
    s.board.forEach(row => row.forEach(cc => { if (cc.mine) cc.revealed = true; }));
    document.getElementById('ms-status').innerHTML = '<span style="color:var(--red)">💥 Boom! Game Over</span>';
    _msRenderBoard(); showToast('💥 You hit a mine!', 'error'); return;
  }
  if (cell.n === 0) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < s.size && cc >= 0 && cc < s.size && !s.board[rr][cc].revealed) _msReveal(rr, cc);
    }
  }
  if (!s.over && s.revealedCount === s.size * s.size - 10) {
    s.over = true;
    document.getElementById('ms-status').innerHTML = '<span style="color:var(--green)">🎉 You Win!</span>';
    showToast('🎉 Board cleared — you win!', 'success');
  }
  _msRenderBoard();
}

// ══════════════════════ SUDOKU ══════════════════════
const _SUDOKU_PUZZLES = {
  easy: '530070000600195000098000060800060003400803001700020006060000280000419005000080',
  medium: '020608000580009700007203069000000018100000002803000000640300400002086037000010',
  hard: '000000907000420180000705026100904000050000040000507009920108000034000000000000',
};
function renderSudoku(diff = 'easy') {
  const view = document.getElementById('game-view');
  const puzzle = _SUDOKU_PUZZLES[diff];
  window._sudoku = { fixed: puzzle.split('').map(Number), values: puzzle.split('').map(Number) };
  view.innerHTML = gameHeader('Sudoku', '🔢') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <select class="form-select" style="max-width:140px" onchange="renderSudoku(this.value)">
          <option value="easy" ${diff === 'easy' ? 'selected' : ''}>Easy</option>
          <option value="medium" ${diff === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="hard" ${diff === 'hard' ? 'selected' : ''}>Hard</option>
        </select>
        <div id="sd-status" style="font-weight:700">Fill the grid!</div>
        <button class="game-control-btn" onclick="_sdCheck()">✅ Check</button>
      </div>
      <div id="sd-board" style="display:grid;grid-template-columns:repeat(9,1fr);gap:1px;max-width:380px;margin:1rem auto;background:var(--border)"></div>
    </div></div>`;
  _sdRenderBoard();
}
function _sdRenderBoard() {
  const { fixed, values } = window._sudoku;
  const el = document.getElementById('sd-board');
  el.innerHTML = values.map((v, i) => {
    const isFixed = fixed[i] !== 0;
    const row = Math.floor(i / 9), col = i % 9;
    const borderR = (col % 3 === 2 && col !== 8) ? '2px solid var(--indigo)' : 'none';
    const borderB = (row % 3 === 2 && row !== 8) ? '2px solid var(--indigo)' : 'none';
    return `<input type="text" maxlength="1" value="${v || ''}" ${isFixed ? 'disabled' : ''} oninput="_sdInput(${i},this.value)"
      style="aspect-ratio:1;text-align:center;font-weight:${isFixed ? '800' : '600'};font-size:.95rem;background:${isFixed ? 'var(--glass2)' : 'var(--card)'};color:${isFixed ? 'var(--text)' : 'var(--indigo)'};border:1px solid var(--border);border-right:${borderR};border-bottom:${borderB}">`;
  }).join('');
}
function _sdInput(i, val) {
  const n = parseInt(val, 10);
  window._sudoku.values[i] = (n >= 1 && n <= 9) ? n : 0;
}
function _sdCheck() {
  const { values } = window._sudoku;
  const valid = (arr) => { const s = arr.filter(v => v !== 0); return new Set(s).size === s.length; };
  let ok = true;
  for (let r = 0; r < 9; r++) if (!valid(values.slice(r * 9, r * 9 + 9))) ok = false;
  for (let c = 0; c < 9; c++) if (!valid(Array.from({ length: 9 }, (_, r) => values[r * 9 + c]))) ok = false;
  const complete = !values.includes(0);
  const status = document.getElementById('sd-status');
  if (!ok) { status.innerHTML = '<span style="color:var(--red)">❌ Conflicts found</span>'; showToast('There are conflicting numbers', 'warning'); }
  else if (complete) { status.innerHTML = '<span style="color:var(--green)">🎉 Solved!</span>'; showToast('🎉 Sudoku solved!', 'success'); }
  else { status.innerHTML = '<span style="color:var(--amber)">✓ Looking good so far</span>'; }
}

// ══════════════════════ WHACK-A-MOLE ══════════════════════
function renderWhackAMole() {
  const view = document.getElementById('game-view');
  window._wam = { score: 0, timeLeft: 30, active: null, timer: null, spawnTimer: null };
  view.innerHTML = gameHeader('Whack-a-Mole', '🔨') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div>Score: <strong id="wam-score">0</strong></div>
        <div>⏱ <strong id="wam-time">30</strong>s</div>
        <button class="game-control-btn" onclick="_wamStart()">▶️ Start</button>
      </div>
      <div id="wam-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;max-width:360px;margin:1rem auto"></div>
    </div></div>`;
  _wamRenderGrid();
}
function _wamRenderGrid() {
  const el = document.getElementById('wam-grid'); if (!el) return;
  const active = window._wam.active;
  el.innerHTML = Array.from({ length: 9 }, (_, i) => `
    <div onclick="_wamHit(${i})" style="aspect-ratio:1;border-radius:50%;background:var(--glass2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;transition:transform .1s">${active === i ? '🐹' : ''}</div>`).join('');
}
function _wamStart() {
  const s = window._wam;
  clearInterval(s.timer); clearInterval(s.spawnTimer);
  s.score = 0; s.timeLeft = 30; s.active = null;
  document.getElementById('wam-score').textContent = 0;
  document.getElementById('wam-time').textContent = 30;
  s.spawnTimer = setInterval(() => { s.active = Math.floor(Math.random() * 9); _wamRenderGrid(); }, 800);
  s.timer = setInterval(() => {
    s.timeLeft--; document.getElementById('wam-time').textContent = s.timeLeft;
    if (s.timeLeft <= 0) {
      clearInterval(s.timer); clearInterval(s.spawnTimer); s.active = null; _wamRenderGrid();
      showToast(`🏁 Time's up! Score: ${s.score}`, 'success');
    }
  }, 1000);
}
function _wamHit(i) {
  const s = window._wam;
  if (s.active === i) { s.score++; document.getElementById('wam-score').textContent = s.score; s.active = null; _wamRenderGrid(); }
}

// ══════════════════════ SIMON SAYS ══════════════════════
const _SIMON_COLORS = [
  { id: 0, bg: '#ef4444', name: 'Red' }, { id: 1, bg: '#10b981', name: 'Green' },
  { id: 2, bg: '#3b82f6', name: 'Blue' }, { id: 3, bg: '#f59e0b', name: 'Yellow' },
];
function renderSimonSays() {
  const view = document.getElementById('game-view');
  window._simon = { sequence: [], playerStep: 0, level: 0, playing: false, accepting: false };
  view.innerHTML = gameHeader('Simon Says', '🎵') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div>Level: <strong id="sim-level">0</strong></div>
        <div id="sim-status" style="font-weight:700">Press Start</div>
        <button class="game-control-btn" onclick="_simonStart()">▶️ Start</button>
      </div>
      <div id="sim-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem;max-width:280px;margin:1.5rem auto">
        ${_SIMON_COLORS.map(c => `<div id="sim-btn-${c.id}" onclick="_simonPress(${c.id})" style="aspect-ratio:1;border-radius:16px;background:${c.bg};opacity:.55;cursor:pointer;transition:opacity .15s"></div>`).join('')}
      </div>
    </div></div>`;
}
function _simonStart() {
  const s = window._simon;
  s.sequence = []; s.level = 0; s.playerStep = 0;
  document.getElementById('sim-level').textContent = 0;
  _simonNextRound();
}
function _simonNextRound() {
  const s = window._simon;
  s.sequence.push(Math.floor(Math.random() * 4));
  s.level = s.sequence.length; s.playerStep = 0; s.accepting = false;
  document.getElementById('sim-level').textContent = s.level;
  document.getElementById('sim-status').textContent = 'Watch closely…';
  let i = 0;
  const playNext = () => {
    if (i > 0) document.getElementById(`sim-btn-${s.sequence[i - 1]}`).style.opacity = '.55';
    if (i >= s.sequence.length) { s.accepting = true; document.getElementById('sim-status').textContent = 'Your turn!'; return; }
    const btn = document.getElementById(`sim-btn-${s.sequence[i]}`);
    btn.style.opacity = '1';
    i++;
    setTimeout(playNext, 500);
  };
  setTimeout(playNext, 500);
}
function _simonPress(id) {
  const s = window._simon; if (!s.accepting) return;
  const btn = document.getElementById(`sim-btn-${id}`);
  btn.style.opacity = '1'; setTimeout(() => btn.style.opacity = '.55', 200);
  if (s.sequence[s.playerStep] !== id) {
    s.accepting = false;
    document.getElementById('sim-status').innerHTML = `<span style="color:var(--red)">❌ Wrong! Reached level ${s.level}</span>`;
    showToast(`Game over — reached level ${s.level}`, 'warning');
    return;
  }
  s.playerStep++;
  if (s.playerStep === s.sequence.length) {
    s.accepting = false;
    document.getElementById('sim-status').textContent = '✅ Correct! Next round…';
    setTimeout(() => _simonNextRound(), 900);
  }
}

// ══════════════════════ FLAPPY BIRD ══════════════════════
function renderFlappyBird() {
  const view = document.getElementById('game-view');
  view.innerHTML = gameHeader('Flappy Bird', '🐦') + `
    <div class="game-canvas-wrap" style="text-align:center">
      <div class="game-score-bar">
        <div>Score: <strong id="fb-score">0</strong></div>
        <div>Best: <strong id="fb-best">${localStorage.getItem('th_flappy_best') || 0}</strong></div>
        <button class="game-control-btn" onclick="_fbInit()">🔄 Restart</button>
      </div>
      <canvas id="fb-canvas" width="340" height="480" style="max-width:100%;border-radius:12px;border:1px solid var(--border);background:#1e293b;touch-action:manipulation"></canvas>
      <p style="color:var(--text2);font-size:.8rem;margin-top:.5rem">Tap / Click / Space to flap</p>
    </div></div>`;
  _fbInit();
}
function _fbInit() {
  const canvas = document.getElementById('fb-canvas');
  const ctx = canvas.getContext('2d');
  const s = window._flappy = {
    bird: { x: 60, y: 200, vy: 0 }, gravity: 0.45, flap: -8,
    pipes: [], frame: 0, score: 0, over: false, started: false,
  };
  function spawnPipe() {
    const gap = 130, top = 40 + Math.random() * (canvas.height - gap - 120);
    s.pipes.push({ x: canvas.width, top, gap, passed: false });
  }
  function loop() {
    if (!document.getElementById('fb-canvas')) return; // view changed away
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (s.started && !s.over) {
      s.bird.vy += s.gravity; s.bird.y += s.bird.vy;
      s.frame++;
      if (s.frame % 90 === 0) spawnPipe();
      s.pipes.forEach(p => p.x -= 2.6);
      s.pipes = s.pipes.filter(p => p.x > -60);
      s.pipes.forEach(p => {
        if (!p.passed && p.x + 40 < s.bird.x) { p.passed = true; s.score++; document.getElementById('fb-score').textContent = s.score; }
        const hit = s.bird.x + 14 > p.x && s.bird.x - 14 < p.x + 40 && (s.bird.y - 14 < p.top || s.bird.y + 14 > p.top + p.gap);
        if (hit) s.over = true;
      });
      if (s.bird.y > canvas.height - 14 || s.bird.y < 14) s.over = true;
    }
    ctx.fillStyle = '#10b981';
    s.pipes.forEach(p => {
      ctx.fillRect(p.x, 0, 40, p.top);
      ctx.fillRect(p.x, p.top + p.gap, 40, canvas.height - p.top - p.gap);
    });
    ctx.font = '28px serif'; ctx.fillText('🐦', s.bird.x - 14, s.bird.y + 10);
    if (!s.started) { ctx.fillStyle = '#e8e8ff'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Tap to start', canvas.width / 2, canvas.height / 2); ctx.textAlign = 'left'; }
    if (s.over) {
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '14px sans-serif'; ctx.fillText('Tap Restart to play again', canvas.width / 2, canvas.height / 2 + 16);
      ctx.textAlign = 'left';
      const best = Math.max(s.score, Number(localStorage.getItem('th_flappy_best') || 0));
      localStorage.setItem('th_flappy_best', best);
      document.getElementById('fb-best').textContent = best;
    }
    requestAnimationFrame(loop);
  }
  const doFlap = (e) => { e && e.preventDefault && e.preventDefault(); if (s.over) return; s.started = true; s.bird.vy = s.flap; };
  canvas.onclick = doFlap; canvas.ontouchstart = doFlap;
  document.onkeydown = (e) => { if (e.code === 'Space' && document.getElementById('fb-canvas')) doFlap(e); };
  requestAnimationFrame(loop);
}

// ══════════════════════ CHECKERS ══════════════════════
function renderCheckers() {
  const view = document.getElementById('game-view');
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) board[r][c] = { p: 'B', king: false };
  for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) board[r][c] = { p: 'R', king: false };
  window._chk = { board, turn: 'R', sel: null, moves: [] };
  view.innerHTML = gameHeader('Checkers', '🔴') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div id="chk-turn" style="font-weight:700">🔴 Red's turn</div>
        <button class="game-control-btn" onclick="renderCheckers()">🔄 New Game</button>
      </div>
      <div id="chk-board" style="display:grid;grid-template-columns:repeat(8,1fr);max-width:400px;margin:1rem auto;border:2px solid var(--border);border-radius:8px;overflow:hidden"></div>
      <p style="text-align:center;color:var(--text2);font-size:.8rem">2-player local — Red moves first, tap a piece then a highlighted square.</p>
    </div></div>`;
  _chkRender();
}
function _chkRender() {
  const { board, sel } = window._chk;
  const el = document.getElementById('chk-board');
  const validMoves = sel ? _chkValidMoves(sel.r, sel.c) : [];
  let html = '';
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const dark = (r + c) % 2 === 1;
    const piece = board[r][c];
    const isSel = sel && sel.r === r && sel.c === c;
    const isMove = validMoves.some(m => m.r === r && m.c === c);
    let inner = '';
    if (piece) inner = `<div style="width:70%;height:70%;border-radius:50%;background:${piece.p === 'R' ? '#ef4444' : '#1e293b'};border:2px solid ${piece.p === 'R' ? '#7f1d1d' : '#000'};display:flex;align-items:center;justify-content:center;color:gold;font-size:.8rem">${piece.king ? '♛' : ''}</div>`;
    html += `<div onclick="_chkClick(${r},${c})" style="aspect-ratio:1;background:${dark ? '#334155' : '#94a3b8'};display:flex;align-items:center;justify-content:center;cursor:pointer;outline:${isSel ? '3px solid var(--indigo)' : isMove ? '3px solid var(--green)' : 'none'};outline-offset:-3px">${inner}</div>`;
  }
  el.innerHTML = html;
}
function _chkValidMoves(r, c) {
  const { board } = window._chk; const piece = board[r][c]; if (!piece) return [];
  const dirs = piece.king ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : (piece.p === 'R' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
  const moves = [];
  dirs.forEach(([dr, dc]) => {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !board[nr][nc]) moves.push({ r: nr, c: nc });
    const jr = r + dr * 2, jc = c + dc * 2;
    if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && board[nr]?.[nc] && board[nr][nc].p !== piece.p && !board[jr][jc]) moves.push({ r: jr, c: jc, capture: { r: nr, c: nc } });
  });
  return moves;
}
function _chkClick(r, c) {
  const s = window._chk; const board = s.board; const piece = board[r][c];
  if (s.sel) {
    const move = _chkValidMoves(s.sel.r, s.sel.c).find(m => m.r === r && m.c === c);
    if (move) {
      board[r][c] = board[s.sel.r][s.sel.c]; board[s.sel.r][s.sel.c] = null;
      if (move.capture) board[move.capture.r][move.capture.c] = null;
      if ((s.turn === 'R' && r === 0) || (s.turn === 'B' && r === 7)) board[r][c].king = true;
      s.sel = null; s.turn = s.turn === 'R' ? 'B' : 'R';
      document.getElementById('chk-turn').innerHTML = s.turn === 'R' ? "🔴 Red's turn" : "⚫ Black's turn";
      _chkRender();
      return;
    }
    s.sel = (piece && piece.p === s.turn) ? { r, c } : null;
  } else if (piece && piece.p === s.turn) {
    s.sel = { r, c };
  }
  _chkRender();
}

// ══════════════════════ RASSI KHEECH (TUG OF WAR) ══════════════════════
// Mash your side to pull the rope's knot toward you. Two modes:
//  • Vs CPU — you tap/press A, the computer tugs on its own.
//  • 2 Player (same device) — split-screen tap zones, P1 taps/presses A on
//    the left, P2 taps/presses L (or ⌃) on the right. First to drag the
//    knot to the opponent's edge wins.
function _towCleanup() {
  const s = window._tow;
  if (!s) return;
  if (s.cpuTimer) clearInterval(s.cpuTimer);
  if (s.decayTimer) clearInterval(s.decayTimer);
  if (s.keyHandler) window.removeEventListener('keydown', s.keyHandler);
}

function renderTugOfWar() {
  _towCleanup();
  const view = document.getElementById('game-view');
  view.innerHTML = gameHeader('Rassi Kheech (Tug of War)', '🪢') + `
    <div class="game-canvas-wrap tow-home">
      <div class="tow-hero"><span class="tow-kicker">LOCAL MULTIPLAYER</span><h2>Pull together. Win together.</h2><p>Challenge a friend on the same phone or keyboard. The strongest side takes the flag!</p></div>
      <div class="tow-mode-grid">
        <button class="tow-mode-card" onclick="_towStart('2p')"><span class="tow-mode-icon">👥</span><strong>2 Players</strong><small>Same device · Best for friends</small><b>Play now →</b></button>
        <button class="tow-mode-card tow-cpu-card" onclick="_towStart('cpu')"><span class="tow-mode-icon">🤖</span><strong>Player vs CPU</strong><small>Practice your pulling power</small><b>Play solo →</b></button>
      </div>
      <div class="tow-rules"><span>⚡ Mash your side</span><span>🎯 Reach the opponent edge</span><span>🏆 First pull wins</span></div>
    </div></div>`;
}

function _towBarHtml(leftLabel, rightLabel) {
  return `
    <div class="tow-rope-wrap">
      <div class="tow-rope-labels">
        <span>${leftLabel}</span><span>${rightLabel}</span>
      </div>
      <div class="tow-rope-track">
        <div class="tow-zone tow-zone-left"></div><div class="tow-zone tow-zone-right"></div>
        <div class="tow-rope-line"></div><div class="tow-center-flag">🚩</div>
        <div id="tow-knot" class="tow-knot">🪢</div>
      </div>
      <div class="tow-edge-labels"><span>PLAYER 1 EDGE</span><span>PLAYER 2 EDGE</span></div>
    </div>`;
}

function _towStart(mode) {
  _towCleanup();
  const view = document.getElementById('game-view');
  window._tow = { pos: 50, over: false, mode, cpuTimer: null, decayTimer: null, keyHandler: null };

  if (mode === 'cpu') {
    view.innerHTML = gameHeader('Rassi Kheech · vs CPU', '🪢') + `
      <div class="game-canvas-wrap" style="text-align:center">
        <div class="game-score-bar">
          <div id="tow-status" style="font-weight:700">Tap fast to pull the rope your way!</div>
          <button class="game-control-btn" onclick="renderTugOfWar()">🔄 Change mode</button>
        </div>
        ${_towBarHtml('🧑 You', '🤖 CPU')}
        <button id="tow-tap-btn" onmousedown="_towPull(1)" ontouchstart="event.preventDefault();_towPull(1)"
          style="width:160px;height:160px;border-radius:50%;background:var(--grad-main);border:none;color:#fff;font-size:1.1rem;font-weight:800;margin-top:.5rem;box-shadow:0 10px 30px rgba(99,102,241,.4);cursor:pointer;user-select:none">
          TAP!<br>PULL 💪
        </button>
        <p style="color:var(--text2);font-size:.75rem;margin-top:.8rem">Or mash the <kbd>A</kbd> key on your keyboard</p>
      </div></div>`;
    window._tow.cpuTimer = setInterval(() => {
      if (window._tow.over) return;
      window._tow.pos += (2 + Math.random() * 4);
      _towUpdate();
    }, 550);
    window._tow.keyHandler = (e) => { if (e.key === 'a' || e.key === 'A') _towPull(1); };
    window.addEventListener('keydown', window._tow.keyHandler);
  } else {
    view.innerHTML = gameHeader('Rassi Kheech · 2 Players', '🪢') + `
      <div class="game-canvas-wrap tow-match">
        <div class="tow-match-head"><div><span class="tow-kicker">2 PLAYER BATTLE</span><h2>Rassi Kheech</h2></div><button class="game-control-btn" onclick="renderTugOfWar()">↩ Modes</button></div>
        <div id="tow-status" class="tow-status">Ready? Press both sides to start!</div>
        ${_towBarHtml('🔵 Player 1', '🔴 Player 2')}
        <div class="tow-player-grid">
          <button id="tow-p1-btn" class="tow-player-btn tow-p1" onpointerdown="event.preventDefault();_towPull(1)">
            <span class="tow-player-avatar">🔵</span><strong>PLAYER 1</strong><small>Tap or press <kbd>A</kbd></small><em>Pull left</em>
          </button>
          <button id="tow-p2-btn" class="tow-player-btn tow-p2" onpointerdown="event.preventDefault();_towPull(2)">
            <span class="tow-player-avatar">🔴</span><strong>PLAYER 2</strong><small>Tap or press <kbd>L</kbd></small><em>Pull right</em>
          </button>
        </div>
        <p class="tow-match-tip">Same device · Sit opposite each other and mash your side as fast as you can!</p>
      </div></div>`;
    // No CPU drift in 2P mode — the rope only moves from real taps, with a
    // small pull-back toward center so a single stray tap can't decide it.
    window._tow.decayTimer = setInterval(() => {
      if (window._tow.over) return;
      window._tow.pos += (window._tow.pos > 50 ? -0.4 : window._tow.pos < 50 ? 0.4 : 0);
      _towUpdate();
    }, 200);
    window._tow.keyHandler = (e) => {
      if (e.key === 'a' || e.key === 'A') _towPull(1);
      else if (e.key === 'l' || e.key === 'L') _towPull(2);
    };
    window.addEventListener('keydown', window._tow.keyHandler);
  }
}

function _towPull(player) {
  const s = window._tow; if (!s || s.over) return;
  s.pos += player === 1 ? -4 : 4;
  const btn = document.getElementById(s.mode === 'cpu' ? 'tow-tap-btn' : (player === 1 ? 'tow-p1-btn' : 'tow-p2-btn'));
  if (btn) { btn.style.transform = 'scale(0.94)'; setTimeout(() => { btn.style.transform = ''; }, 90); }
  _towUpdate();
}

function _towUpdate() {
  const s = window._tow; if (!s) return;
  s.pos = Math.max(0, Math.min(100, s.pos));
  const knot = document.getElementById('tow-knot');
  if (knot) knot.style.left = s.pos + '%';
  const statusEl = document.getElementById('tow-status');
  if (s.pos <= 3 && !s.over) {
    s.over = true; _towCleanup();
    const win = s.mode === 'cpu' ? '<span style="color:var(--green)">🎉 You won the tug of war!</span>' : '<span style="color:#6366f1">🎉 Player 1 wins the tug of war!</span>';
    const rematch = `<button class="game-control-btn tow-rematch" onclick="_towStart('${s.mode}')">🔁 Rematch</button>`;
    if (statusEl) statusEl.innerHTML = win;
    if (statusEl && s.mode === '2p') statusEl.innerHTML += rematch;
    showToast(s.mode === 'cpu' ? '🎉 You pulled the rope all the way — you win!' : '🎉 Player 1 wins!', 'success');
  } else if (s.pos >= 97 && !s.over) {
    s.over = true; _towCleanup();
    const win = s.mode === 'cpu' ? '<span style="color:var(--red)">🤖 CPU won this round!</span>' : '<span style="color:#ef4444">🎉 Player 2 wins the tug of war!</span>';
    const rematch = `<button class="game-control-btn tow-rematch" onclick="_towStart('${s.mode}')">🔁 Rematch</button>`;
    if (statusEl) statusEl.innerHTML = win;
    if (statusEl && s.mode === '2p') statusEl.innerHTML += rematch;
    showToast(s.mode === 'cpu' ? '🤖 CPU pulled you in — try again!' : '🎉 Player 2 wins!', s.mode === 'cpu' ? 'warning' : 'success');
  } else if (!s.over && statusEl && s.mode === '2p') {
    statusEl.innerHTML = s.pos < 50 ? '🔵 Player 1 has the advantage!' : s.pos > 50 ? '🔴 Player 2 has the advantage!' : '⚔️ Even pull — keep going!';
  }
}

// ── Register into the shared game dispatcher ────────────────────────────────
window.EXTRA_GAME_ROUTERS = {
  'minesweeper': renderMinesweeper,
  'sudoku': () => renderSudoku('easy'),
  'whack-a-mole': renderWhackAMole,
  'simon-says': renderSimonSays,
  'flappy-bird': renderFlappyBird,
  'checkers': renderCheckers,
  'tug-of-war': renderTugOfWar,
};
