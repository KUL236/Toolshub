/* games.js — ToolHub 5D Complete Games System */
'use strict';

function openGame(gameId) {
  navigate('game');
  const view = document.getElementById('game-view');
  const game = GAMES_DATA.find(g => g.id === gameId);
  if (!game) return;

  const routers = {
    'tic-tac-toe': renderTicTacToe,
    'coin-flip': renderCoinFlip,
    'snake': renderSnakeGame,
    '2048': render2048,
    'dice-roller': () => { navigate('tool'); renderToolPage('dice-roller'); },
    'memory-cards': renderMemoryCards,
    'hangman': renderHangman,
    'connect-four': renderConnectFour,
    'rock-paper-scissors': renderRPS,
    'number-guess': renderNumberGuess,
    'word-scramble': renderWordScramble,
    'wheel-spinner': () => { navigate('tool'); renderToolPage('wheel-spinner'); },
    'truth-dare-game': () => { navigate('tool'); renderToolPage('truth-dare'); },
    'ludo': renderLudoGame,
    'mili-milimita': renderMiliMilimita,
    'snake-ladder': renderSnakeLadder,
    'cards': renderCardsGame,
    'tetris': renderTetris,
    'chess': renderChessGame,
  };

  const fn = routers[gameId] || (window.EXTRA_GAME_ROUTERS && window.EXTRA_GAME_ROUTERS[gameId]);
  if (fn) fn();
  else renderComingSoonGame(game);
}

function gameHeader(title, icon, extra = '') {
  return `<div class="game-view-wrap">
    <div class="game-view-header">
      <button class="game-back-btn" onclick="navigate('games')">← Back to Games</button>
      <h1 style="font-family:var(--font-display);font-size:1.2rem;font-weight:800">${icon} ${title}</h1>
      ${extra}
    </div>`;
}

function renderComingSoonGame(game = {}) {
  const view = document.getElementById('game-view');
  view.innerHTML = `<div class="game-view-wrap"><div class="game-view-header"><button class="game-back-btn" onclick="navigate('games')">← Back</button></div>
    <div class="game-canvas-wrap" style="text-align:center;padding:3rem">
      <div style="font-size:4rem;margin-bottom:1rem">${game.icon || '🎮'}</div>
      <h2 style="font-family:var(--font-display);font-size:1.4rem;margin-bottom:.5rem">${game.name || 'Game'}</h2>
      <p style="color:var(--text2);margin-bottom:1.5rem">This game is coming soon! 🚀</p>
      <div class="info-box info-box-blue">We're working on it. Check back soon for the full game experience!</div>
    </div></div>`;
}

// ── TIC TAC TOE PREMIUM ──
function renderTicTacToe() {
  const view = document.getElementById('game-view');
  view.innerHTML = `<div class="game-view-wrap">
  <div class="game-view-header">
    <button class="game-back-btn" onclick="navigate('games')">← Back</button>
    <h1 style="font-family:var(--font-display);font-size:1.1rem;font-weight:800;flex:1">⭕ Tic Tac Toe</h1>
  </div>
  <div class="game-canvas-wrap ttt-premium-wrap">

    <!-- Setup Panel -->
    <div id="ttt-setup">
      <div style="text-align:center;padding:1.2rem 1rem .8rem">
        <div style="font-size:.65rem;font-weight:800;color:var(--indigo);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.8rem">GAME SETUP</div>

        <!-- Board Size -->
        <div class="ttt-setup-group">
          <div class="ttt-setup-label">Board Size</div>
          <div class="ttt-toggle-row">
            <button class="ttt-toggle-btn active" id="ttt-size-3" onclick="tttSetSize(3,this)">3×3 Classic</button>
            <button class="ttt-toggle-btn" id="ttt-size-4" onclick="tttSetSize(4,this)">4×4 Advanced</button>
          </div>
        </div>

        <!-- Game Mode -->
        <div class="ttt-setup-group">
          <div class="ttt-setup-label">Game Mode</div>
          <div style="display:flex;gap:.6rem;justify-content:center;margin-top:.3rem">
            <button id="ttt-mode-hvh" onclick="tttSetMode('hvh',this)" style="flex:1;max-width:148px;padding:.6rem .4rem;border-radius:12px;border:2px solid transparent;background:rgba(255,255,255,0.07);color:var(--text1);cursor:pointer;transition:all .18s;font-family:inherit">
              <div style="font-size:1.5rem;margin-bottom:.2rem">👥</div>
              <div style="font-size:.78rem;font-weight:800;letter-spacing:.02em">Human vs Human</div>
              <div style="font-size:.62rem;color:var(--text3);margin-top:.15rem">Pass &amp; play locally</div>
            </button>
            <button id="ttt-mode-hvai" onclick="tttSetMode('hvai',this)" style="flex:1;max-width:148px;padding:.6rem .4rem;border-radius:12px;border:2px solid transparent;background:rgba(255,255,255,0.07);color:var(--text1);cursor:pointer;transition:all .18s;font-family:inherit">
              <div style="font-size:1.5rem;margin-bottom:.2rem">🤖</div>
              <div style="font-size:.78rem;font-weight:800;letter-spacing:.02em">Human vs Computer</div>
              <div style="font-size:.62rem;color:var(--text3);margin-top:.15rem">Play against AI</div>
            </button>
          </div>
          <style>
            #ttt-mode-hvh.active,#ttt-mode-hvai.active{border-color:var(--indigo)!important;background:rgba(99,102,241,0.18)!important;box-shadow:0 0 12px rgba(99,102,241,0.3)!important;}
            #ttt-mode-hvh:hover,#ttt-mode-hvai:hover{background:rgba(255,255,255,0.12)!important;}
          </style>
        </div>

        <!-- Difficulty (shown only for AI mode) -->
        <div class="ttt-setup-group" id="ttt-diff-group" style="display:none">
          <div class="ttt-setup-label">AI Difficulty</div>
          <div class="ttt-toggle-row">
            <button class="ttt-toggle-btn" id="ttt-diff-easy" onclick="tttSetDiff('easy',this)">😊 Easy</button>
            <button class="ttt-toggle-btn active" id="ttt-diff-medium" onclick="tttSetDiff('medium',this)">🎯 Medium</button>
            <button class="ttt-toggle-btn" id="ttt-diff-hard" onclick="tttSetDiff('hard',this)">🔥 Hard</button>
          </div>
        </div>

        <button class="ttt-start-btn" onclick="tttStartGame()">▶ Start Game</button>
      </div>
    </div>

    <!-- Game Area -->
    <div id="ttt-game" style="display:none">
      <!-- Scoreboard -->
      <div class="ttt-scoreboard">
        <div class="ttt-score-card" id="ttt-card-x">
          <div class="ttt-score-symbol x">✕</div>
          <div class="ttt-score-name" id="ttt-name-x">Player X</div>
          <div class="ttt-score-val" id="ttt-wins-x">0</div>
          <div class="ttt-score-sub">Wins</div>
          <div class="ttt-score-streak" id="ttt-streak-x"></div>
        </div>
        <div class="ttt-score-middle">
          <div class="ttt-score-draws-val" id="ttt-draws">0</div>
          <div style="font-size:.6rem;color:var(--text3);font-weight:600">DRAWS</div>
          <div id="ttt-turn-indicator" class="ttt-turn-indicator">
            <span id="ttt-turn-sym"></span>
            <span id="ttt-turn-txt"></span>
          </div>
        </div>
        <div class="ttt-score-card" id="ttt-card-o">
          <div class="ttt-score-symbol o">○</div>
          <div class="ttt-score-name" id="ttt-name-o">Player O</div>
          <div class="ttt-score-val" id="ttt-wins-o">0</div>
          <div class="ttt-score-sub">Wins</div>
          <div class="ttt-score-streak" id="ttt-streak-o"></div>
        </div>
      </div>

      <!-- Status -->
      <div id="ttt-status" class="ttt-status-bar"></div>

      <!-- Board -->
      <div class="ttt-board-wrap">
        <div class="ttt-board" id="ttt-board"></div>
        <canvas id="ttt-win-canvas" class="ttt-win-canvas"></canvas>
      </div>

      <!-- Controls -->
      <div class="ttt-controls">
        <button class="ttt-ctrl-btn" onclick="tttRestart()">🔄 Restart</button>
        <button class="ttt-ctrl-btn" onclick="tttResetScore()">🗑 Reset Score</button>
        <button class="ttt-ctrl-btn" onclick="tttChangeSettings()">⚙️ Settings</button>
      </div>
    </div>

  </div></div>`;
  tttInitSetup();
}

// ── TTT STATE ──
let tttG = {
  board: [],
  size: 3,
  mode: 'hvh', // 'hvh' | 'hvai'
  diff: 'medium', // 'easy' | 'medium' | 'hard'
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  streaks: { X: 0, O: 0 },
  bestStreaks: { X: 0, O: 0 },
  winLine: null,
  aiThinking: false,
};

function tttInitSetup() {
  // Load saved prefs
  try {
    const saved = JSON.parse(localStorage.getItem('ttt_prefs') || '{}');
    if (saved.size) tttG.size = saved.size;
    if (saved.mode) tttG.mode = saved.mode;
    if (saved.diff) tttG.diff = saved.diff;
    const savedScores = JSON.parse(localStorage.getItem('ttt_scores') || '{}');
    if (savedScores.X !== undefined) tttG.scores = savedScores;
    const savedStreaks = JSON.parse(localStorage.getItem('ttt_streaks') || '{}');
    if (savedStreaks.bestX !== undefined) {
      tttG.bestStreaks = { X: savedStreaks.bestX || 0, O: savedStreaks.bestO || 0 };
    }
  } catch(e) {}
  // Reflect saved state in UI
  document.getElementById('ttt-size-3').classList.toggle('active', tttG.size === 3);
  document.getElementById('ttt-size-4').classList.toggle('active', tttG.size === 4);
  document.getElementById('ttt-mode-hvh').classList.toggle('active', tttG.mode === 'hvh');
  document.getElementById('ttt-mode-hvai').classList.toggle('active', tttG.mode === 'hvai');
  document.getElementById('ttt-diff-group').style.display = tttG.mode === 'hvai' ? 'block' : 'none';
  ['easy','medium','hard'].forEach(d => {
    const el = document.getElementById('ttt-diff-'+d);
    if (el) el.classList.toggle('active', tttG.diff === d);
  });
}

function tttSetSize(s, btn) {
  tttG.size = s;
  document.querySelectorAll('[id^="ttt-size-"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function tttSetMode(m, btn) {
  tttG.mode = m;
  document.querySelectorAll('[id^="ttt-mode-"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('ttt-diff-group').style.display = m === 'hvai' ? 'block' : 'none';
}
function tttSetDiff(d, btn) {
  tttG.diff = d;
  document.querySelectorAll('[id^="ttt-diff-"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function tttStartGame() {
  // Save prefs
  try {
    localStorage.setItem('ttt_prefs', JSON.stringify({ size: tttG.size, mode: tttG.mode, diff: tttG.diff }));
  } catch(e) {}
  document.getElementById('ttt-setup').style.display = 'none';
  document.getElementById('ttt-game').style.display = 'block';
  tttG.board = Array(tttG.size * tttG.size).fill('');
  tttG.currentPlayer = 'X';
  tttG.gameOver = false;
  tttG.winLine = null;
  tttG.aiThinking = false;
  // Player names
  const nameX = tttG.mode === 'hvh' ? 'Player X' : 'You (X)';
  const nameO = tttG.mode === 'hvh' ? 'Player O' : '🤖 Computer';
  document.getElementById('ttt-name-x').textContent = nameX;
  document.getElementById('ttt-name-o').textContent = nameO;
  tttUpdateScoreDisplay();
  tttRenderBoard();
  tttUpdateStatus();
}

function tttChangeSettings() {
  document.getElementById('ttt-setup').style.display = 'block';
  document.getElementById('ttt-game').style.display = 'none';
}

function tttRenderBoard() {
  const el = document.getElementById('ttt-board');
  if (!el) return;
  const sz = tttG.size;
  el.style.gridTemplateColumns = `repeat(${sz}, 1fr)`;
  el.className = `ttt-board ttt-board-${sz}`;
  el.innerHTML = tttG.board.map((cell, i) => {
    const cls = cell ? `ttt-cell ${cell === 'X' ? 'ttt-x' : 'ttt-o'} placed` : 'ttt-cell empty';
    const isWinCell = tttG.winLine && tttG.winLine.includes(i);
    return `<div class="${cls}${isWinCell ? ' ttt-win-cell' : ''}" data-i="${i}" onclick="tttMove(${i})">${cell === 'X' ? '✕' : cell === 'O' ? '○' : ''}</div>`;
  }).join('');

  // Size canvas for win line
  const canvas = document.getElementById('ttt-win-canvas');
  if (canvas) {
    const boardEl = el.getBoundingClientRect();
    canvas.width = el.offsetWidth || 300;
    canvas.height = el.offsetHeight || 300;
  }
}

function tttMove(i) {
  if (tttG.board[i] || tttG.gameOver || tttG.aiThinking) return;
  tttG.board[i] = tttG.currentPlayer;
  tttRenderBoard();
  tttAnimateCell(i);
  const winner = tttCheckWin();
  if (winner) {
    tttGameOver(winner);
    return;
  }
  if (tttG.board.every(c => c)) {
    tttGameOver(null);
    return;
  }
  tttG.currentPlayer = tttG.currentPlayer === 'X' ? 'O' : 'X';
  tttUpdateStatus();
  if (tttG.mode === 'hvai' && tttG.currentPlayer === 'O' && !tttG.gameOver) {
    tttG.aiThinking = true;
    tttUpdateStatus();
    const delay = tttG.diff === 'hard' ? 550 : 400;
    setTimeout(tttAIMove, delay);
  }
}

function tttAnimateCell(i) {
  setTimeout(() => {
    const cell = document.querySelector(`[data-i="${i}"]`);
    if (cell) { cell.classList.add('ttt-pop'); setTimeout(() => cell.classList.remove('ttt-pop'), 300); }
  }, 10);
}

function tttAIMove() {
  if (!tttG.aiThinking || tttG.gameOver) return;
  let move = -1;
  if (tttG.diff === 'easy') {
    move = tttAIRandom();
  } else if (tttG.diff === 'medium') {
    move = tttAIMedium();
  } else {
    move = tttAIHard();
  }
  tttG.aiThinking = false;
  if (move !== -1) tttMove(move);
}

function tttAIRandom() {
  const empty = tttG.board.map((c, i) => c ? null : i).filter(v => v !== null);
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : -1;
}

function tttAIMedium() {
  // 70% smart, 30% random
  if (Math.random() < 0.7) {
    const smart = tttAIBestMove('O') ?? tttAIBestMove('X');
    if (smart !== null) return smart;
  }
  return tttAIRandom();
}

function tttAIBestMove(player) {
  const lines = tttGetLines();
  for (const line of lines) {
    const vals = line.map(i => tttG.board[i]);
    const pCount = vals.filter(v => v === player).length;
    const empty = line.filter(i => !tttG.board[i]);
    const winLen = tttG.size === 3 ? 3 : 4;
    if (pCount === winLen - 1 && empty.length === 1) return empty[0];
  }
  return null;
}

function tttAIHard() {
  if (tttG.size === 3) {
    // Minimax for 3x3
    const result = tttMinimax(tttG.board.slice(), 'O', 0, -Infinity, Infinity);
    return result.move;
  } else {
    // 4x4 — heuristic (minimax too slow)
    const win = tttAIBestMove('O');
    if (win !== null) return win;
    const block = tttAIBestMove('X');
    if (block !== null) return block;
    return tttAIHeuristic4x4();
  }
}

function tttMinimax(board, player, depth, alpha, beta) {
  const lines = tttGetLines();
  const winner = tttCheckWinFor(board, lines);
  if (winner === 'O') return { score: 10 - depth };
  if (winner === 'X') return { score: depth - 10 };
  const empty = board.map((c, i) => c ? null : i).filter(v => v !== null);
  if (!empty.length) return { score: 0 };
  let best = player === 'O' ? { score: -Infinity, move: -1 } : { score: Infinity, move: -1 };
  for (const idx of empty) {
    board[idx] = player;
    const result = tttMinimax(board, player === 'O' ? 'X' : 'O', depth + 1, alpha, beta);
    board[idx] = '';
    result.move = idx;
    if (player === 'O') {
      if (result.score > best.score) best = result;
      alpha = Math.max(alpha, best.score);
    } else {
      if (result.score < best.score) best = result;
      beta = Math.min(beta, best.score);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function tttAIHeuristic4x4() {
  const scores = tttG.board.map((c, i) => {
    if (c) return -1;
    let score = 0;
    const row = Math.floor(i / 4), col = i % 4;
    // Center bonus
    if ([1,2].includes(row) && [1,2].includes(col)) score += 3;
    // Line potential
    const lines = tttGetLines();
    for (const line of lines) {
      if (!line.includes(i)) continue;
      const vals = line.map(j => tttG.board[j]);
      const oCount = vals.filter(v => v === 'O').length;
      const xCount = vals.filter(v => v === 'X').length;
      if (!xCount) score += oCount * 2;
      if (!oCount) score -= xCount;
    }
    return score;
  });
  const maxScore = Math.max(...scores.filter(s => s >= 0));
  const best = scores.map((s, i) => s === maxScore ? i : -1).filter(i => i >= 0);
  return best[Math.floor(Math.random() * best.length)] ?? tttAIRandom();
}

function tttGetLines() {
  const sz = tttG.size;
  const winLen = sz;
  const lines = [];
  // Rows
  for (let r = 0; r < sz; r++) {
    for (let c = 0; c <= sz - winLen; c++) {
      lines.push(Array.from({length: winLen}, (_, k) => r * sz + c + k));
    }
  }
  // Cols
  for (let c = 0; c < sz; c++) {
    for (let r = 0; r <= sz - winLen; r++) {
      lines.push(Array.from({length: winLen}, (_, k) => (r + k) * sz + c));
    }
  }
  // Diag \
  for (let r = 0; r <= sz - winLen; r++) {
    for (let c = 0; c <= sz - winLen; c++) {
      lines.push(Array.from({length: winLen}, (_, k) => (r + k) * sz + (c + k)));
    }
  }
  // Diag /
  for (let r = 0; r <= sz - winLen; r++) {
    for (let c = winLen - 1; c < sz; c++) {
      lines.push(Array.from({length: winLen}, (_, k) => (r + k) * sz + (c - k)));
    }
  }
  return lines;
}

function tttCheckWinFor(board, lines) {
  for (const line of lines) {
    const [a, ...rest] = line;
    if (board[a] && rest.every(i => board[i] === board[a])) return board[a];
  }
  return null;
}

function tttCheckWin() {
  const lines = tttGetLines();
  for (const line of lines) {
    const [a, ...rest] = line;
    if (tttG.board[a] && rest.every(i => tttG.board[i] === tttG.board[a])) {
      tttG.winLine = line;
      return tttG.board[a];
    }
  }
  return null;
}

function tttGameOver(winner) {
  tttG.gameOver = true;
  if (winner) {
    tttG.scores[winner]++;
    tttG.streaks[winner]++;
    tttG.streaks[winner === 'X' ? 'O' : 'X'] = 0;
    if (tttG.streaks[winner] > tttG.bestStreaks[winner]) tttG.bestStreaks[winner] = tttG.streaks[winner];
    tttSaveScores();
    const name = winner === 'X' ? document.getElementById('ttt-name-x').textContent : document.getElementById('ttt-name-o').textContent;
    document.getElementById('ttt-status').textContent = `🎉 ${name} Wins!`;
    document.getElementById('ttt-status').className = 'ttt-status-bar ttt-status-win';
    tttRenderBoard();
    tttDrawWinLine();
    showToast(`🏆 ${name} wins!`, 'success');
    setTimeout(() => tttCelebrate(winner), 300);
  } else {
    tttG.scores.draws++;
    tttG.streaks.X = 0; tttG.streaks.O = 0;
    tttSaveScores();
    document.getElementById('ttt-status').textContent = "🤝 It's a Draw!";
    document.getElementById('ttt-status').className = 'ttt-status-bar ttt-status-draw';
    showToast("It's a draw! 🤝", 'info');
  }
  tttUpdateScoreDisplay();
}

function tttDrawWinLine() {
  const canvas = document.getElementById('ttt-win-canvas');
  const boardEl = document.getElementById('ttt-board');
  if (!canvas || !boardEl || !tttG.winLine) return;
  const sz = tttG.size;
  canvas.width = boardEl.offsetWidth;
  canvas.height = boardEl.offsetHeight;
  const ctx = canvas.getContext('2d');
  const cellW = canvas.width / sz, cellH = canvas.height / sz;
  const line = tttG.winLine;
  const startIdx = line[0], endIdx = line[line.length - 1];
  const sx = (startIdx % sz) * cellW + cellW / 2;
  const sy = Math.floor(startIdx / sz) * cellH + cellH / 2;
  const ex = (endIdx % sz) * cellW + cellW / 2;
  const ey = Math.floor(endIdx / sz) * cellH + cellH / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = tttG.currentPlayer === 'O' ? '#818cf8' : '#ec4899';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 12;
  // Animate line
  let progress = 0;
  const anim = () => {
    progress = Math.min(progress + 0.08, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (ex - sx) * progress, sy + (ey - sy) * progress);
    ctx.stroke();
    if (progress < 1) requestAnimationFrame(anim);
  };
  requestAnimationFrame(anim);
}

function tttCelebrate(winner) {
  const color = winner === 'X' ? ['#818cf8','#6366f1','#4f46e5'] : ['#ec4899','#db2777','#be185d'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = `position:fixed;top:-20px;left:${Math.random()*100}vw;width:${Math.random()*8+4}px;height:${Math.random()*8+4}px;background:${color[Math.floor(Math.random()*color.length)]};border-radius:3px;animation:gp-confetti-fall ${Math.random()*2+1.5}s ${Math.random()*1}s linear forwards;pointer-events:none;z-index:10000`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

function tttUpdateStatus() {
  const el = document.getElementById('ttt-status');
  if (!el) return;
  el.className = 'ttt-status-bar';
  const p = tttG.currentPlayer;
  if (tttG.mode === 'hvai' && p === 'O' && tttG.aiThinking) {
    el.textContent = '🤖 Computer is thinking...';
    el.className = 'ttt-status-bar ttt-status-ai';
  } else {
    const name = p === 'X' ? document.getElementById('ttt-name-x').textContent : document.getElementById('ttt-name-o').textContent;
    el.textContent = `${p === 'X' ? '✕' : '○'} ${name}'s turn`;
    el.className = `ttt-status-bar ttt-status-${p.toLowerCase()}`;
  }
  // Turn indicator
  const sym = document.getElementById('ttt-turn-sym');
  const txt = document.getElementById('ttt-turn-txt');
  if (sym) sym.textContent = p === 'X' ? '✕' : '○';
  if (txt) txt.textContent = 'Turn';
  const ind = document.getElementById('ttt-turn-indicator');
  if (ind) ind.className = `ttt-turn-indicator ttt-turn-${p.toLowerCase()}`;
  // Highlight active card
  document.getElementById('ttt-card-x').classList.toggle('active-card', p === 'X' && !tttG.gameOver);
  document.getElementById('ttt-card-o').classList.toggle('active-card', p === 'O' && !tttG.gameOver);
}

function tttUpdateScoreDisplay() {
  const el = id => document.getElementById(id);
  if (el('ttt-wins-x')) el('ttt-wins-x').textContent = tttG.scores.X;
  if (el('ttt-wins-o')) el('ttt-wins-o').textContent = tttG.scores.O;
  if (el('ttt-draws')) el('ttt-draws').textContent = tttG.scores.draws;
  const sx = tttG.streaks.X, so = tttG.streaks.O;
  const bx = tttG.bestStreaks.X, bo = tttG.bestStreaks.O;
  if (el('ttt-streak-x')) el('ttt-streak-x').innerHTML = sx > 1 ? `🔥 ${sx} streak` : bx > 1 ? `Best: ${bx}` : '';
  if (el('ttt-streak-o')) el('ttt-streak-o').innerHTML = so > 1 ? `🔥 ${so} streak` : bo > 1 ? `Best: ${bo}` : '';
}

function tttSaveScores() {
  try {
    localStorage.setItem('ttt_scores', JSON.stringify(tttG.scores));
    localStorage.setItem('ttt_streaks', JSON.stringify({ bestX: tttG.bestStreaks.X, bestO: tttG.bestStreaks.O }));
  } catch(e) {}
}

function tttRestart() {
  tttG.board = Array(tttG.size * tttG.size).fill('');
  tttG.currentPlayer = 'X';
  tttG.gameOver = false;
  tttG.winLine = null;
  tttG.aiThinking = false;
  const canvas = document.getElementById('ttt-win-canvas');
  if (canvas) { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); }
  tttRenderBoard();
  tttUpdateStatus();
  document.getElementById('ttt-status').className = 'ttt-status-bar';
  document.getElementById('ttt-status').textContent = '';
}

function tttResetScore() {
  tttG.scores = { X: 0, O: 0, draws: 0 };
  tttG.streaks = { X: 0, O: 0 };
  tttG.bestStreaks = { X: 0, O: 0 };
  tttSaveScores();
  tttUpdateScoreDisplay();
  showToast('Scores reset!', 'info');
}

// Legacy compat aliases
function initTTT() {}
function resetTTT() { tttRestart(); }
function updateTTTStatus(msg) {}


// ── COIN FLIP ──
function renderCoinFlip() {
  const view = document.getElementById('game-view');
  view.innerHTML = gameHeader('Coin Flip', '🪙') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <span style="font-weight:700;color:var(--text2)">H: <span id="cf-heads">0</span></span>
        <span id="cf-status" style="font-weight:700">Click to flip!</span>
        <span style="font-weight:700;color:var(--text2)">T: <span id="cf-tails">0</span></span>
      </div>
      <div style="padding:2rem;text-align:center">
        <button class="coin" id="coin-el" onclick="flipCoin()" aria-label="Flip coin">
          <span class="coin-face coin-heads">H</span><span class="coin-face coin-tails">T</span>
        </button>
        <div id="coin-result" style="font-family:var(--font-display);font-size:2rem;font-weight:800;margin:1rem 0;min-height:2.5rem"></div>
        <button class="game-control-btn" onclick="flipCoin()">🪙 Flip Coin</button>
        <div style="margin-top:1rem;font-size:.82rem;color:var(--text3)">
          <label style="display:flex;align-items:center;gap:.5rem;justify-content:center;cursor:pointer">
            <input type="checkbox" id="cf-auto" style="accent-color:var(--indigo)"> Auto-flip mode
          </label>
        </div>
        <div id="cf-history" style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:.35rem;justify-content:center;max-height:80px;overflow-y:auto"></div>
      </div>
    </div></div>`;
  window._cfH = 0; window._cfT = 0; window._cfHistory = [];
}
function flipCoin() {
  const coin = document.getElementById('coin-el'); if (!coin) return;
  coin.classList.add('flip');
  setTimeout(() => {
    coin.classList.remove('flip');
    const isH = Math.random() > 0.5;
    const result = isH ? 'HEADS' : 'TAILS';
    coin.classList.toggle('show-tails', !isH);
    if (isH) window._cfH++; else window._cfT++;
    document.getElementById('cf-heads').textContent = window._cfH;
    document.getElementById('cf-tails').textContent = window._cfT;
    document.getElementById('coin-result').textContent = result;
    document.getElementById('cf-status').textContent = `${result}!`;
    window._cfHistory.unshift(isH ? '🟡' : '⚪');
    window._cfHistory = window._cfHistory.slice(0, 20);
    document.getElementById('cf-history').innerHTML = window._cfHistory.join(' ');
    if (document.getElementById('cf-auto')?.checked) setTimeout(flipCoin, 1200);
  }, 600);
}

// ── SNAKE GAME ──
function renderSnakeGame() {
  const view = document.getElementById('game-view');
  view.innerHTML = gameHeader('Snake Game', '🐍') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div style="font-size:.85rem;color:var(--text2)">Score</div>
        <div class="game-score-val" id="snake-score">0</div>
        <div style="font-size:.85rem;color:var(--text2)">Best: <span id="snake-best">${localStorage.getItem('th_snake_best') || 0}</span></div>
      </div>
      <div style="position:relative">
        <canvas id="snake-canvas" width="320" height="320" style="display:block;margin:0 auto;image-rendering:pixelated"></canvas>
        <div id="snake-overlay" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.7);border-radius:0 0 var(--r-xl) var(--r-xl)">
          <div style="font-size:2rem;margin-bottom:.5rem">🐍</div>
          <p style="color:white;margin-bottom:1rem;font-weight:600">Use arrow keys or swipe to play!</p>
          <button class="game-control-btn" onclick="startSnake()">▶ Start Game</button>
        </div>
      </div>
      <div style="padding:1rem;display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem;max-width:200px;margin:0 auto">
        <div></div>
        <button class="game-control-btn" style="padding:.5rem;font-size:1.1rem" onclick="snakeDir(0,-1)">▲</button>
        <div></div>
        <button class="game-control-btn" style="padding:.5rem;font-size:1.1rem" onclick="snakeDir(-1,0)">◄</button>
        <button class="game-control-btn" style="padding:.5rem;font-size:.75rem" onclick="pauseSnake()">⏸</button>
        <button class="game-control-btn" style="padding:.5rem;font-size:1.1rem" onclick="snakeDir(1,0)">►</button>
        <div></div>
        <button class="game-control-btn" style="padding:.5rem;font-size:1.1rem" onclick="snakeDir(0,1)">▼</button>
        <div></div>
      </div>
    </div></div>`;
}

const CELL = 20, COLS = 16, ROWS = 16;
let snakeState = null, snakeTimer = null;
function startSnake() {
  document.getElementById('snake-overlay').style.display = 'none';
  snakeState = { snake: [{x:8,y:8},{x:7,y:8},{x:6,y:8}], dir:{x:1,y:0}, nextDir:{x:1,y:0}, food:null, score:0, paused:false };
  snakeState.food = randomFood();
  clearInterval(snakeTimer);
  snakeTimer = setInterval(snakeTick, 140);
  setupSnakeTouch();
  drawSnake();
}
function randomFood() {
  const occupied = snakeState ? snakeState.snake : [];
  const open = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (!occupied.some(seg => seg.x === x && seg.y === y)) open.push({ x, y });
  }
  return open[Math.floor(Math.random() * open.length)] || { x: 0, y: 0 };
}
function snakeDir(x, y) {
  if (!snakeState) return;
  if (x !== 0 && snakeState.dir.x === 0) snakeState.nextDir = {x, y};
  if (y !== 0 && snakeState.dir.y === 0) snakeState.nextDir = {x, y};
}
function pauseSnake() {
  if (!snakeState) return;
  snakeState.paused = !snakeState.paused;
}
function snakeTick() {
  const s = snakeState; if (!s || s.paused) return;
  s.dir = s.nextDir;
  const head = { x: (s.snake[0].x + s.dir.x + COLS) % COLS, y: (s.snake[0].y + s.dir.y + ROWS) % ROWS };
  if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) { endSnake(); return; }
  s.snake.unshift(head);
  if (head.x === s.food.x && head.y === s.food.y) {
    s.score += 10; s.food = randomFood();
    document.getElementById('snake-score').textContent = s.score;
    const best = parseInt(localStorage.getItem('th_snake_best') || 0);
    if (s.score > best) { localStorage.setItem('th_snake_best', s.score); document.getElementById('snake-best').textContent = s.score; }
  } else { s.snake.pop(); }
  drawSnake();
}
function drawSnake() {
  const canvas = document.getElementById('snake-canvas'); if (!canvas || !snakeState) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0d0d1f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Grid
  ctx.strokeStyle = 'rgba(99,102,241,0.05)';
  for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) { ctx.strokeRect(x*CELL, y*CELL, CELL, CELL); }
  // Food
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(snakeState.food.x*CELL+CELL/2, snakeState.food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // Snake
  snakeState.snake.forEach((seg, i) => {
    const grad = ctx.createRadialGradient(seg.x*CELL+CELL/2, seg.y*CELL+CELL/2, 0, seg.x*CELL+CELL/2, seg.y*CELL+CELL/2, CELL/2);
    grad.addColorStop(0, i===0 ? '#a78bfa' : '#6366f1');
    grad.addColorStop(1, i===0 ? '#6366f1' : '#4338ca');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2, 4); ctx.fill();
  });
}
function endSnake() {
  clearInterval(snakeTimer);
  const ov = document.getElementById('snake-overlay'); if (!ov) return;
  ov.style.display = 'flex';
  ov.innerHTML = `<div style="font-size:2rem;margin-bottom:.5rem">💀</div>
    <p style="color:white;font-weight:700;font-size:1.1rem">Game Over!</p>
    <p style="color:#a78bfa;font-size:1.5rem;font-weight:900;margin:.5rem 0">${snakeState.score}</p>
    <button class="game-control-btn" onclick="startSnake()">🔄 Play Again</button>`;
  saveGameScore('snake', snakeState.score);
}
function setupSnakeTouch() {
  const canvas = document.getElementById('snake-canvas'); if (!canvas) return;
  let tx, ty;
  canvas.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive:true});
  canvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > Math.abs(dy)) snakeDir(dx > 0 ? 1 : -1, 0);
    else snakeDir(0, dy > 0 ? 1 : -1);
  }, {passive:true});
}
document.addEventListener('keydown', e => {
  const map = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] };
  if (map[e.key] && snakeState && document.getElementById('snake-canvas')) {
    e.preventDefault();
    snakeDir(...map[e.key]);
  }
});

// ── 2048 ──
function render2048() {
  const view = document.getElementById('game-view');
  view.innerHTML = gameHeader('2048', '🔢') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div><div style="font-size:.72rem;color:var(--text3)">SCORE</div><div class="game-score-val" id="g2048-score">0</div></div>
        <button class="game-control-btn" onclick="init2048()">🔄 New</button>
        <div><div style="font-size:.72rem;color:var(--text3)">BEST</div><div class="game-score-val" id="g2048-best">${localStorage.getItem('th_2048_best')||0}</div></div>
      </div>
      <div id="game-2048-board" style="padding:1rem"></div>
      <div style="padding:.75rem 1rem;font-size:.8rem;color:var(--text3);text-align:center">Use arrow keys or swipe to merge tiles. Reach 2048!</div>
    </div></div>`;
  init2048();
}
let g2048 = { board: [], score: 0 };
function init2048() {
  g2048.board = Array(4).fill(null).map(() => Array(4).fill(0));
  g2048.score = 0;
  add2048Tile(); add2048Tile();
  render2048Board();
}
function add2048Tile() {
  const empty = [];
  g2048.board.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r,c]); }));
  if (!empty.length) return;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  g2048.board[r][c] = Math.random() < 0.9 ? 2 : 4;
}
function render2048Board() {
  const el = document.getElementById('game-2048-board'); if (!el) return;
  const COLORS = {0:'var(--glass2)',2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
  el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">` +
    g2048.board.flat().map(v => {
      const bg = COLORS[v] || '#3c3a32';
      const color = v > 4 ? '#f9f6f2' : '#776e65';
      const fs = v >= 1024 ? '.9rem' : v >= 100 ? '1.1rem' : '1.4rem';
      return `<div class="tile-2048" style="background:${bg};color:${color};font-size:${fs}">${v || ''}</div>`;
    }).join('') + '</div>';
  document.getElementById('g2048-score').textContent = g2048.score;
  const best = parseInt(localStorage.getItem('th_2048_best') || 0);
  if (g2048.score > best) { localStorage.setItem('th_2048_best', g2048.score); document.getElementById('g2048-best').textContent = g2048.score; }
}
function move2048(dir) {
  const b = g2048.board.map(r => [...r]);
  let moved = false;
  const rotate = m => m[0].map((_, i) => m.map(r => r[i]).reverse());
  let board = dir === 'left' ? b : dir === 'right' ? b.map(r => [...r].reverse()) : dir === 'up' ? rotate(b) : rotate(b).map(r => [...r].reverse());
  board = board.map(row => {
    const nums = row.filter(v => v);
    const merged = [];
    let i = 0;
    while (i < nums.length) {
      if (i+1 < nums.length && nums[i] === nums[i+1]) { const val = nums[i]*2; merged.push(val); g2048.score += val; i += 2; moved = true; }
      else { merged.push(nums[i]); i++; }
    }
    const newRow = [...merged, ...Array(4-merged.length).fill(0)];
    if (newRow.join() !== row.join()) moved = true;
    return newRow;
  });
  if (dir === 'right') board = board.map(r => [...r].reverse());
  else if (dir === 'up') { board = rotate(board); board = rotate(rotate(rotate(board))); }
  else if (dir === 'down') { board = board.map(r => [...r].reverse()); board = rotate(board); board = rotate(rotate(rotate(board))); }
  if (moved) { g2048.board = board; add2048Tile(); render2048Board(); }
}
document.addEventListener('keydown', e => {
  const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
  if (map[e.key] && document.getElementById('game-2048-board')) { e.preventDefault(); move2048(map[e.key]); }
});

// ── MEMORY CARDS ──
function renderMemoryCards() {
  const view = document.getElementById('game-view');
  const emojis = ['🐶','🐱','🦁','🐯','🦊','🐻','🐼','🐨','🦄','🐸','🦋','🌸'];
  window._memCards = [...emojis, ...emojis].sort(() => Math.random()-.5).map((e,i) => ({id:i,emoji:e,flipped:false,matched:false}));
  window._memFlipped = []; window._memMoves = 0; window._memMatched = 0;
  view.innerHTML = gameHeader('Memory Cards', '🃏') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div style="font-size:.85rem">Pairs: <strong id="mem-pairs">0/${emojis.length}</strong></div>
        <div style="font-size:.85rem">Moves: <strong id="mem-moves">0</strong></div>
        <button class="game-control-btn" onclick="renderMemoryCards()">🔄 Reset</button>
      </div>
      <div id="mem-board" style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;padding:1rem"></div>
    </div></div>`;
  renderMemBoard();
}
function renderMemBoard() {
  const el = document.getElementById('mem-board'); if (!el) return;
  el.innerHTML = window._memCards.map(card => `
    <div onclick="flipMemCard(${card.id})" style="aspect-ratio:1;border-radius:var(--r-md);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.6rem;border:2px solid var(--border);transition:all .3s;background:${card.matched ? 'rgba(16,185,129,.15)' : card.flipped ? 'rgba(99,102,241,.15)' : 'var(--glass2)'};transform:${card.flipped||card.matched?'scale(1)':'scale(1)'};border-color:${card.matched?'#10b981':card.flipped?'var(--indigo)':'var(--border)'};box-shadow:${card.matched?'0 0 12px rgba(16,185,129,.3)':''}">${card.flipped || card.matched ? card.emoji : '❓'}</div>`).join('');
}
function flipMemCard(id) {
  const cards = window._memCards; const flipped = window._memFlipped;
  const card = cards[id];
  if (card.matched || card.flipped || flipped.length >= 2) return;
  card.flipped = true; flipped.push(id); renderMemBoard();
  if (flipped.length === 2) {
    window._memMoves++;
    document.getElementById('mem-moves').textContent = window._memMoves;
    const [a,b] = flipped;
    if (cards[a].emoji === cards[b].emoji) {
      cards[a].matched = cards[b].matched = true; window._memMatched++;
      document.getElementById('mem-pairs').textContent = `${window._memMatched}/${6}`;
      window._memFlipped = []; renderMemBoard();
      if (window._memMatched === 12) showToast(`🎉 Completed in ${window._memMoves} moves!`, 'success');
    } else {
      setTimeout(() => { cards[a].flipped = cards[b].flipped = false; window._memFlipped = []; renderMemBoard(); }, 900);
    }
  }
}

// ── HANGMAN ──
const HANGMAN_WORDS = ['javascript','python','typescript','algorithm','database','programming','framework','interface','function','variable','component','developer','frontend','backend','network','security','encryption','animation','performance','responsive'];
function renderHangman() {
  const view = document.getElementById('game-view');
  const word = HANGMAN_WORDS[Math.floor(Math.random()*HANGMAN_WORDS.length)];
  window._hm = { word, guessed: new Set(), wrong: 0, maxWrong: 6 };
  view.innerHTML = gameHeader('Hangman', '🔤') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div>Wrong: <strong id="hm-wrong" style="color:var(--red)">0/6</strong></div>
        <div id="hm-status" style="font-weight:700">Guess the word!</div>
        <button class="game-control-btn" onclick="renderHangman()">🔄 New</button>
      </div>
      <div style="padding:1.5rem;text-align:center">
        <div id="hm-gallows" style="font-size:.85rem;font-family:monospace;margin-bottom:1.5rem;line-height:1.4;color:var(--text)"></div>
        <div id="hm-word" style="font-family:var(--font-display);font-size:2rem;letter-spacing:.25em;margin-bottom:1.5rem"></div>
        <div id="hm-keyboard" style="display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;max-width:360px;margin:0 auto"></div>
        <div id="hm-wrong-letters" style="margin-top:1rem;font-size:.85rem;color:var(--red)"></div>
      </div>
    </div></div>`;
  renderHangmanState();
}
function renderHangmanState() {
  const {word, guessed, wrong, maxWrong} = window._hm;
  const GALLOWS = [
    `  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========`,
    `  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========`,
    `  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========`,
    `  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========`,
    `  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========`,
    `  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========`,
    `  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========`
  ];
  const gEl = document.getElementById('hm-gallows');
  if (gEl) gEl.textContent = GALLOWS[wrong];
  const wEl = document.getElementById('hm-word');
  if (wEl) wEl.textContent = word.split('').map(c => guessed.has(c) ? c : '_').join(' ');
  const kEl = document.getElementById('hm-keyboard');
  if (kEl) kEl.innerHTML = 'abcdefghijklmnopqrstuvwxyz'.split('').map(c =>
    `<button onclick="hmGuess('${c}')" ${guessed.has(c)?'disabled':''} style="width:36px;height:36px;font-size:.85rem;font-weight:700;border-radius:var(--r-sm);border:1.5px solid ${guessed.has(c)?(word.includes(c)?'var(--green)':'var(--red)'):'var(--border)'};background:${guessed.has(c)?(word.includes(c)?'rgba(16,185,129,.15)':'rgba(239,68,68,.1)'):'var(--glass2)'};color:${guessed.has(c)?(word.includes(c)?'#10b981':'#ef4444'):'var(--text)'};transition:all .2s">${c}</button>`).join('');
  const wl = [...guessed].filter(c => !word.includes(c));
  const wlEl = document.getElementById('hm-wrong-letters');
  if (wlEl) wlEl.textContent = wl.length ? 'Wrong: ' + wl.join(', ') : '';
  document.getElementById('hm-wrong').textContent = `${wrong}/6`;
  if (word.split('').every(c => guessed.has(c))) { document.getElementById('hm-status').textContent = '🎉 You Won!'; showToast('🏆 Excellent! You guessed it!', 'success'); }
  else if (wrong >= maxWrong) { document.getElementById('hm-status').textContent = `💀 Game Over! Word: ${word}`; }
}
function hmGuess(c) {
  const hm = window._hm;
  if (hm.guessed.has(c)) return;
  hm.guessed.add(c);
  if (!hm.word.includes(c)) hm.wrong++;
  renderHangmanState();
}

// ── CONNECT FOUR ──
function renderConnectFour() {
  const view = document.getElementById('game-view');
  window._c4 = { board: Array(6).fill(null).map(() => Array(7).fill(0)), current: 1, over: false };
  view.innerHTML = gameHeader('Connect 4', '🔵') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div style="color:#6366f1;font-weight:700">🔵 Player 1</div>
        <div id="c4-status" style="font-weight:700">Your turn!</div>
        <div style="color:#ec4899;font-weight:700">🔴 Player 2</div>
      </div>
      <div id="c4-board" style="padding:1rem"></div>
    </div></div>`;
  renderC4Board();
}
function renderC4Board() {
  const el = document.getElementById('c4-board'); if (!el) return;
  const b = window._c4.board;
  el.innerHTML = `<div style="display:flex;gap:.35rem;justify-content:center;margin-bottom:.5rem">
    ${Array(7).fill(0).map((_,c)=>`<button onclick="c4Drop(${c})" style="flex:1;max-width:40px;padding:.3rem;background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text3);font-size:.7rem">▼</button>`).join('')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:.35rem">
    ${b.flat().map((cell,i) => {
      const col = i % 7, row = Math.floor(i/7);
      const color = cell===1?'#6366f1':cell===2?'#ec4899':'var(--glass2)';
      return `<div style="aspect-ratio:1;border-radius:50%;background:${color};border:2px solid ${cell?color:'var(--border)'};transition:background .2s;box-shadow:${cell?'0 0 10px '+color:'none'}"></div>`;
    }).join('')}
  </div>`;
}
function c4Drop(col) {
  const {board, current, over} = window._c4; if (over) return;
  let row = -1;
  for (let r = 5; r >= 0; r--) { if (!board[r][col]) { row = r; break; } }
  if (row === -1) return;
  board[row][col] = current;
  if (checkC4Win(board, current)) {
    window._c4.over = true;
    document.getElementById('c4-status').textContent = `🎉 Player ${current} wins!`;
    showToast(`🏆 Player ${current} wins!`, 'success');
  } else if (board[0].every(c => c)) {
    document.getElementById('c4-status').textContent = "It's a draw! 🤝";
  } else {
    window._c4.current = current === 1 ? 2 : 1;
    document.getElementById('c4-status').textContent = `Player ${window._c4.current}'s turn`;
  }
  renderC4Board();
}
function checkC4Win(board, player) {
  const check = (r,c,dr,dc) => { let count=0; for(let i=0;i<4;i++){const nr=r+dr*i,nc=c+dc*i;if(nr<0||nr>5||nc<0||nc>6||board[nr][nc]!==player)return false;count++;}return count===4;};
  for (let r=0;r<6;r++) for(let c=0;c<7;c++) if([[0,1],[1,0],[1,1],[1,-1]].some(([dr,dc])=>check(r,c,dr,dc))) return true;
  return false;
}

// ── ROCK PAPER SCISSORS ──
function renderRPS() {
  const view = document.getElementById('game-view');
  window._rps = { wins: 0, losses: 0, draws: 0 };
  view.innerHTML = gameHeader('Rock Paper Scissors', '✂️') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <span style="color:#10b981;font-weight:700">W: <span id="rps-w">0</span></span>
        <span id="rps-status" style="font-weight:700">Choose!</span>
        <span style="color:#ef4444;font-weight:700">L: <span id="rps-l">0</span></span>
      </div>
      <div style="padding:2rem;text-align:center">
        <div style="display:flex;gap:1rem;justify-content:center;margin-bottom:2rem">
          ${[['rock','🪨'],['paper','📄'],['scissors','✂️']].map(([v,e])=>`<button onclick="playRPS('${v}')" style="width:90px;height:90px;font-size:2.5rem;background:var(--glass2);border:2px solid var(--border);border-radius:var(--r-xl);transition:all .2s" onmouseover="this.style.borderColor='var(--indigo)';this.style.transform='scale(1.1)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform='scale(1)'">${e}</button>`).join('')}
        </div>
        <div id="rps-result" style="min-height:120px"></div>
      </div>
    </div></div>`;
}
function playRPS(choice) {
  const choices = ['rock','paper','scissors'], icons = {rock:'🪨',paper:'📄',scissors:'✂️'};
  const cpu = choices[Math.floor(Math.random()*3)];
  const wins = {rock:'scissors',paper:'rock',scissors:'paper'};
  let outcome, color;
  if (choice === cpu) { outcome = "It's a Draw! 🤝"; color='var(--text2)'; window._rps.draws++; }
  else if (wins[choice] === cpu) { outcome = "You Win! 🏆"; color='#10b981'; window._rps.wins++; }
  else { outcome = "CPU Wins! 🤖"; color='#ef4444'; window._rps.losses++; }
  document.getElementById('rps-w').textContent = window._rps.wins;
  document.getElementById('rps-l').textContent = window._rps.losses;
  document.getElementById('rps-status').textContent = outcome;
  document.getElementById('rps-result').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;gap:2rem;margin-bottom:1rem">
      <div style="text-align:center"><div style="font-size:3rem">${icons[choice]}</div><div style="font-size:.8rem;color:var(--text3)">You</div></div>
      <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:${color}">VS</div>
      <div style="text-align:center"><div style="font-size:3rem">${icons[cpu]}</div><div style="font-size:.8rem;color:var(--text3)">CPU</div></div>
    </div>
    <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:800;color:${color}">${outcome}</div>
    <div style="font-size:.82rem;color:var(--text3);margin-top:.35rem">W:${window._rps.wins} D:${window._rps.draws} L:${window._rps.losses}</div>`;
}

// ── NUMBER GUESS ──
function renderNumberGuess() {
  const view = document.getElementById('game-view');
  window._ng = { secret: Math.floor(Math.random()*100)+1, tries: 0, maxTries: 10 };
  view.innerHTML = gameHeader('Number Guess', '🔢') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div style="font-size:.85rem;color:var(--text2)">Tries left: <strong id="ng-tries">${window._ng.maxTries}</strong></div>
        <button class="game-control-btn" onclick="renderNumberGuess()">🔄 New</button>
      </div>
      <div style="padding:2rem;text-align:center">
        <div style="font-size:3rem;margin-bottom:1rem">🔢</div>
        <p style="color:var(--text2);margin-bottom:1.5rem">Guess a number between <strong>1 - 100</strong></p>
        <div style="display:flex;gap:.75rem;max-width:300px;margin:0 auto 1rem">
          <input class="form-input" type="number" id="ng-input" min="1" max="100" placeholder="Enter guess..." style="text-align:center" onkeydown="if(event.key==='Enter')ngGuess()">
          <button class="game-control-btn" onclick="ngGuess()">Guess</button>
        </div>
        <div id="ng-hint" style="font-size:1.1rem;font-weight:700;margin-bottom:1rem;min-height:1.5rem"></div>
        <div id="ng-history" style="display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;max-width:320px;margin:0 auto"></div>
      </div>
    </div></div>`;
  window._ngHistory = [];
}
function ngGuess() {
  const ng = window._ng, val = parseInt(document.getElementById('ng-input')?.value);
  if (!val || val < 1 || val > 100) { showToast('Enter a number between 1-100', 'warning'); return; }
  ng.tries++;
  window._ngHistory.push(val);
  const triesLeft = ng.maxTries - ng.tries;
  document.getElementById('ng-tries').textContent = triesLeft;
  document.getElementById('ng-input').value = '';
  let hint, color;
  if (val === ng.secret) { hint = `🎉 Correct! The number was ${ng.secret}!`; color = '#10b981'; showToast('🏆 You guessed it!', 'success'); }
  else if (triesLeft === 0) { hint = `💀 Game Over! Number was ${ng.secret}`; color = '#ef4444'; }
  else { hint = val < ng.secret ? `⬆️ Too low! Go higher!` : `⬇️ Too high! Go lower!`; color = '#f59e0b'; }
  document.getElementById('ng-hint').innerHTML = `<span style="color:${color}">${hint}</span>`;
  document.getElementById('ng-history').innerHTML = window._ngHistory.map(g =>
    `<span style="padding:3px 10px;border-radius:99px;background:${g===ng.secret?'rgba(16,185,129,.2)':g<ng.secret?'rgba(59,130,246,.1)':'rgba(239,68,68,.1)'};border:1px solid var(--border);font-size:.82rem;font-weight:700">${g}</span>`).join('');
}

// ── WORD SCRAMBLE ──
const SCRAMBLE_WORDS = [{word:'python',hint:'Programming language named after a snake'},{word:'laptop',hint:'Portable computer'},{word:'button',hint:'You click this in UI'},{word:'screen',hint:'Display device'},{word:'coding',hint:'Writing computer programs'},{word:'design',hint:'Creative visual planning'},{word:'search',hint:'Looking for something online'},{word:'player',hint:'Someone who plays games'},{word:'stream',hint:'Live video broadcast'},{word:'widget',hint:'Small UI component'}];
function renderWordScramble() {
  const view = document.getElementById('game-view');
  const item = SCRAMBLE_WORDS[Math.floor(Math.random()*SCRAMBLE_WORDS.length)];
  const scrambled = item.word.split('').sort(() => Math.random()-.5).join('');
  window._ws = { word: item.word, scrambled, hint: item.hint, tries: 0 };
  view.innerHTML = gameHeader('Word Scramble', '🔤') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div style="font-size:.85rem">Tries: <strong id="ws-tries">0</strong></div>
        <button class="game-control-btn" onclick="renderWordScramble()">🔄 New Word</button>
      </div>
      <div style="padding:2rem;text-align:center">
        <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:900;letter-spacing:.3em;color:var(--indigo);margin-bottom:1.5rem">${scrambled.toUpperCase()}</div>
        <div class="info-box info-box-blue" style="margin-bottom:1.5rem;text-align:left">💡 Hint: ${item.hint}</div>
        <div style="display:flex;gap:.75rem;max-width:320px;margin:0 auto">
          <input class="form-input" type="text" id="ws-input" placeholder="Your answer..." style="text-align:center" onkeydown="if(event.key==='Enter')wsSubmit()">
          <button class="game-control-btn" onclick="wsSubmit()">✓</button>
        </div>
        <div id="ws-result" style="margin-top:1rem;font-size:1.1rem;font-weight:700;min-height:1.5rem"></div>
      </div>
    </div></div>`;
}
function wsSubmit() {
  const ws = window._ws, answer = document.getElementById('ws-input')?.value?.trim().toLowerCase();
  if (!answer) return;
  ws.tries++; document.getElementById('ws-tries').textContent = ws.tries;
  document.getElementById('ws-input').value = '';
  if (answer === ws.word) {
    document.getElementById('ws-result').innerHTML = `<span style="color:#10b981">🎉 Correct! "${ws.word}" in ${ws.tries} tries!</span>`;
    showToast('🏆 Excellent word skills!', 'success');
    setTimeout(renderWordScramble, 2500);
  } else {
    document.getElementById('ws-result').innerHTML = `<span style="color:#ef4444">❌ Not quite! Try again.</span>`;
  }
}

// ── SNAKE & LADDERS (2-4 Players) ──
const SL_PLAYER_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981'];
const SL_PLAYER_EMOJIS = ['🔵','🔴','🟡','🟢'];
const SL_PLAYER_NAMES  = ['P1','P2','P3','P4'];

function renderSnakeLadder() {
  const view = document.getElementById('game-view');
  view.innerHTML = gameHeader('Snakes & Ladders', '🐍') + `
    <div class="game-canvas-wrap" style="padding:1rem">
      <div id="sl-setup">
        <div style="text-align:center;padding:1.5rem 1rem">
          <div style="font-size:3.5rem;margin-bottom:.6rem">🐍🪜</div>
          <h2 style="font-family:var(--font-display);font-size:1.2rem;margin-bottom:.4rem">Snakes & Ladders</h2>
          <p style="color:var(--text2);font-size:.88rem;margin-bottom:1.2rem">Choose how many players</p>
          <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin-bottom:1rem">
            ${[2,3,4].map(n=>`<button class="game-control-btn" style="font-size:1rem;padding:.5rem 1.2rem" onclick="startSLGame(${n})">${n} Players</button>`).join('')}
          </div>
        </div>
      </div>
      <div id="sl-game" style="display:none">
        <div id="sl-scorebar" style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.5rem;justify-content:center"></div>
        <div id="sl-board" style="display:grid;grid-template-columns:repeat(10,1fr);gap:2px;max-width:340px;margin:0 auto .75rem"></div>
        <div style="text-align:center">
          <div id="sl-die" style="font-size:2.8rem;margin:.4rem 0">🎲</div>
          <button class="game-control-btn" id="sl-roll-btn" onclick="rollSL()" style="font-size:.95rem;padding:.45rem 1.2rem">🎲 Roll Dice</button>
          <div id="sl-msg" style="margin-top:.5rem;font-size:.82rem;color:var(--text2);min-height:1.2rem"></div>
          <button class="game-control-btn" style="margin-top:.5rem;background:var(--glass2);color:var(--text);border:1px solid var(--border);font-size:.75rem;padding:.3rem .8rem" onclick="renderSnakeLadder()">🔄 New Game</button>
        </div>
      </div>
    </div></div>`;
}

function startSLGame(numPlayers) {
  const snakes  = {97:78,95:56,88:24,76:56,74:53,55:11,46:18,28:4,19:7};
  const ladders = {2:38,7:14,8:31,15:26,21:42,36:57,51:67,71:91,78:98,87:94};
  window._sl = {
    pos: Array(numPlayers).fill(1),
    current: 0,
    numPlayers,
    gameOver: false,
    dieFaces: ['','⚀','⚁','⚂','⚃','⚄','⚅'],
  };
  window._slSnakes = snakes; window._slLadders = ladders;
  document.getElementById('sl-setup').style.display = 'none';
  document.getElementById('sl-game').style.display = 'block';
  updateSLScorebar();
  renderSLBoard();
}

function updateSLScorebar() {
  const sl = window._sl; if (!sl) return;
  const el = document.getElementById('sl-scorebar'); if (!el) return;
  el.innerHTML = Array.from({length:sl.numPlayers},(_,i)=>`
    <div style="background:${SL_PLAYER_COLORS[i]};border-radius:8px;padding:.22rem .6rem;font-size:.78rem;font-weight:800;color:#fff;opacity:${sl.current===i?1:0.55};border:${sl.current===i?'2px solid #ffd700':'2px solid transparent'};transition:all .2s">
      ${SL_PLAYER_EMOJIS[i]} ${SL_PLAYER_NAMES[i]}: <span id="sl-score-${i}">${sl.pos[i]}</span>
    </div>`).join('');
  document.getElementById('sl-msg').textContent = `${SL_PLAYER_NAMES[sl.current]}'s turn`;
}

function renderSLBoard() {
  const sl = window._sl; if (!sl) return;
  const el = document.getElementById('sl-board'); if (!el) return;
  const board = Array.from({length:100},(_,i)=>100-i);
  el.innerHTML = board.map(num => {
    const playersHere = [];
    for (let i=0;i<sl.numPlayers;i++) if (sl.pos[i]===num) playersHere.push(i);
    const isSnake = window._slSnakes[num], isLadder = window._slLadders[num];
    let bg = isSnake?'rgba(239,68,68,.18)':isLadder?'rgba(16,185,129,.18)':'var(--glass2)';
    let border = isSnake?'#ef4444':isLadder?'#10b981':'var(--border)';
    if (playersHere.length===1) { bg = SL_PLAYER_COLORS[playersHere[0]]+'cc'; border='#fff'; }
    if (playersHere.length>1) { bg='#f59e0b'; border='#fff'; }
    const inner = playersHere.length>0
      ? playersHere.map(i=>SL_PLAYER_EMOJIS[i]).join('')
      : isSnake?'🐍':isLadder?'🪜':num;
    return `<div style="aspect-ratio:1;border-radius:3px;background:${bg};border:1px solid ${border};display:flex;align-items:center;justify-content:center;font-size:.5rem;font-weight:700;color:var(--text);line-height:1">${inner}</div>`;
  }).join('');
}

function rollSL() {
  const sl = window._sl; if (!sl || sl.gameOver) return;
  const die = Math.floor(Math.random()*6)+1;
  document.getElementById('sl-die').textContent = sl.dieFaces[die];
  let pos = sl.pos[sl.current] + die;
  if (pos > 100) pos = sl.pos[sl.current];
  let msg = `${SL_PLAYER_NAMES[sl.current]} rolled ${die}!`;
  if (window._slSnakes[pos]) { msg += ` 🐍 Snake! ${pos}→${window._slSnakes[pos]}`; pos = window._slSnakes[pos]; }
  else if (window._slLadders[pos]) { msg += ` 🪜 Ladder! ${pos}→${window._slLadders[pos]}`; pos = window._slLadders[pos]; }
  sl.pos[sl.current] = pos;
  const scoreEl = document.getElementById(`sl-score-${sl.current}`); if(scoreEl) scoreEl.textContent = pos;
  document.getElementById('sl-msg').textContent = msg;
  renderSLBoard();
  if (pos >= 100) {
    sl.gameOver = true;
    document.getElementById('sl-msg').textContent = `🎉 ${SL_PLAYER_NAMES[sl.current]} Wins!`;
    document.getElementById('sl-roll-btn').disabled = true;
    showToast(`🏆 ${SL_PLAYER_NAMES[sl.current]} wins Snakes & Ladders!`, 'success');
    return;
  }
  sl.current = (sl.current+1) % sl.numPlayers;
  updateSLScorebar();
}

// ── CARDS GAME ──
function renderCardsGame() {
  const view = document.getElementById('game-view');
  const suits = ['♠','♥','♦','♣'], values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const deck = suits.flatMap(s => values.map(v => ({s,v, val: v==='A'?11:['J','Q','K'].includes(v)?10:parseInt(v)}))).sort(()=>Math.random()-.5);
  window._cards = { deck, player: [], dealer: [], playerScore: 0, dealerScore: 0, over: false };
  view.innerHTML = gameHeader('Cards (Blackjack)', '🃏') + `
    <div class="game-canvas-wrap">
      <div class="game-score-bar">
        <div style="font-size:.82rem">Player: <strong id="bj-ps">0</strong></div>
        <div id="bj-status" style="font-weight:700">Blackjack!</div>
        <div style="font-size:.82rem">Dealer: <strong id="bj-ds">?</strong></div>
      </div>
      <div style="padding:1.5rem">
        <div style="margin-bottom:1rem"><div style="font-size:.78rem;color:var(--text3);margin-bottom:.35rem">🤖 Dealer</div><div id="bj-dealer" style="display:flex;flex-wrap:wrap;gap:.5rem"></div></div>
        <div style="margin-bottom:1.5rem"><div style="font-size:.78rem;color:var(--text3);margin-bottom:.35rem">👤 You</div><div id="bj-player" style="display:flex;flex-wrap:wrap;gap:.5rem"></div></div>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap" id="bj-controls">
          <button class="game-control-btn" onclick="bjDeal()">🃏 Deal</button>
        </div>
        <div id="bj-result" style="margin-top:1rem;font-weight:700;font-size:1rem"></div>
      </div>
    </div></div>`;
  bjDeal();
}
function bjCard(deck) { return deck.pop(); }
function bjScore(hand) {
  let s = hand.reduce((a,c)=>a+c.val,0), aces = hand.filter(c=>c.v==='A').length;
  while (s > 21 && aces) { s -= 10; aces--; }
  return s;
}
function bjCardEl(c, hidden=false) {
  if (hidden) return `<div style="width:50px;height:72px;border-radius:var(--r-sm);background:linear-gradient(135deg,var(--indigo),var(--purple));display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:white;border:2px solid rgba(99,102,241,.3)">?</div>`;
  const isRed = c.s==='♥'||c.s==='♦';
  return `<div style="width:50px;height:72px;border-radius:var(--r-sm);background:white;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1rem;color:${isRed?'#ef4444':'#1f2937'};border:2px solid #e5e7eb;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.15)"><span>${c.v}</span><span style="font-size:1.2rem">${c.s}</span></div>`;
}
function bjDeal() {
  const g = window._cards;
  if (g.deck.length < 10) g.deck = [...g.deck].sort(()=>Math.random()-.5);
  g.player = [bjCard(g.deck), bjCard(g.deck)];
  g.dealer = [bjCard(g.deck), bjCard(g.deck)];
  g.over = false;
  renderBJ(true);
  document.getElementById('bj-controls').innerHTML = `<button class="game-control-btn" onclick="bjHit()">👆 Hit</button><button class="game-control-btn" style="background:linear-gradient(135deg,#f59e0b,#f97316)" onclick="bjStand()">✋ Stand</button><button class="game-control-btn" style="background:var(--glass2);color:var(--text);border:1px solid var(--border)" onclick="renderCardsGame()">🔄 New</button>`;
  document.getElementById('bj-result').textContent = '';
}
function renderBJ(hideDealer=false) {
  const g = window._cards;
  document.getElementById('bj-player').innerHTML = g.player.map(c=>bjCardEl(c)).join('');
  document.getElementById('bj-dealer').innerHTML = g.dealer.map((c,i)=>bjCardEl(c,hideDealer&&i===1)).join('');
  document.getElementById('bj-ps').textContent = bjScore(g.player);
  document.getElementById('bj-ds').textContent = hideDealer ? '?' : bjScore(g.dealer);
}
function bjHit() {
  const g = window._cards; g.player.push(bjCard(g.deck)); renderBJ(true);
  if (bjScore(g.player) > 21) bjEnd();
}
function bjStand() {
  const g = window._cards;
  while (bjScore(g.dealer) < 17) g.dealer.push(bjCard(g.deck));
  bjEnd();
}
function bjEnd() {
  const g = window._cards; g.over = true; renderBJ(false);
  const ps = bjScore(g.player), ds = bjScore(g.dealer);
  let msg;
  if (ps > 21) msg = '💀 Bust! Dealer wins.';
  else if (ds > 21) msg = '🎉 Dealer busts! You win!';
  else if (ps > ds) msg = '🏆 You win!';
  else if (ps < ds) msg = '😔 Dealer wins.';
  else msg = "🤝 It's a push!";
  document.getElementById('bj-result').textContent = msg;
  document.getElementById('bj-status').textContent = `Player: ${ps} | Dealer: ${ds}`;
  document.getElementById('bj-controls').innerHTML = `<button class="game-control-btn" onclick="bjDeal()">🃏 Deal Again</button>`;
}

// ── TETRIS ──
function renderTetris() {
  const view = document.getElementById('game-view');
  view.innerHTML = gameHeader('Tetris', '🟦') + `
    <div class="game-canvas-wrap tetris-wrap">
      <div class="tetris-hero">
        <div><span class="tetris-kicker">ARCADE CLASSIC</span><h2>Stack. Clear. Survive.</h2><p>Build lines, chase your high score and master the fall.</p></div>
        <div class="tetris-badge">⚡ <span>Level up every 10 lines</span></div>
      </div>
      <div class="tetris-stats">
        <div class="tetris-stat"><span>Score</span><strong id="tet-score">0</strong></div>
        <div class="tetris-stat"><span>Lines</span><strong id="tet-lines">0</strong></div>
        <div class="tetris-stat"><span>Level</span><strong id="tet-level">1</strong></div>
      </div>
      <div class="tetris-stage">
        <div class="tetris-board-shell">
          <div class="tetris-board-label"><span>PLAYFIELD</span><span id="tet-status">READY</span></div>
          <canvas id="tet-canvas" width="200" height="400" aria-label="Tetris playfield"></canvas>
        </div>
        <aside class="tetris-side-panel">
          <div class="tetris-next-card"><span class="tetris-panel-label">NEXT PIECE</span><canvas id="tet-next" width="100" height="82" aria-label="Next Tetris piece"></canvas></div>
          <button class="tetris-main-btn" onclick="startTetris()" id="tet-btn">▶ Start game</button>
          <button class="tetris-pause-btn" onclick="pauseTetris()" id="tet-pause-btn">⏸ Pause</button>
          <div class="tetris-help"><b>How to play</b><span>← → Move</span><span>↑ Rotate</span><span>↓ Soft drop</span><span>Space Hard drop</span></div>
        </aside>
      </div>
      <div class="tetris-touch-controls" aria-label="Tetris touch controls">
        <button onclick="tetMove(-1,0)" aria-label="Move left">←</button><button onclick="rotatePiece()" aria-label="Rotate">↻</button>
        <button onclick="tetDrop()" aria-label="Hard drop">⬇</button><button onclick="tetMove(1,0)" aria-label="Move right">→</button>
      </div>
      <p class="tetris-tip">Tip: Hard drops score faster. Clear multiple rows at once for bonus points.</p>
    </div></div>`;
  initTetris();
}

const TET_COLS=10,TET_ROWS=20,TET_SIZE=20;
const PIECES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
const COLORS=['#06b6d4','#f59e0b','#8b5cf6','#3b82f6','#f97316','#10b981','#ef4444'];
let tetState=null, tetTimer=null;
function initTetris(){tetState={board:Array(TET_ROWS).fill(null).map(()=>Array(TET_COLS).fill(0)),score:0,lines:0,level:1,piece:null,next:newTetPiece(),over:false,paused:false};tetState.piece=newTetPiece();drawTetris();}
function newTetPiece(){const i=Math.floor(Math.random()*PIECES.length);return{shape:PIECES[i].map(r=>[...r]),color:COLORS[i],x:Math.floor(TET_COLS/2)-1,y:0};}
function startTetris(){if(tetState.over)initTetris();tetState.paused=false;clearInterval(tetTimer);tetTimer=setInterval(tetTick,Math.max(80,500-tetState.level*50));document.getElementById('tet-btn').textContent='↺ Restart';document.getElementById('tet-status').textContent='PLAYING';document.getElementById('tet-pause-btn').textContent='⏸ Pause';}
function pauseTetris(){if(!tetState||tetState.over)return;tetState.paused=!tetState.paused;clearInterval(tetTimer);if(!tetState.paused)tetTimer=setInterval(tetTick,Math.max(80,500-tetState.level*50));const status=document.getElementById('tet-status');const button=document.getElementById('tet-pause-btn');if(status)status.textContent=tetState.paused?'PAUSED':'PLAYING';if(button)button.textContent=tetState.paused?'▶ Resume':'⏸ Pause';drawTetris();}
function tetTick(){if(!tetState||tetState.paused||tetState.over)return;if(!tryMove(0,1)){lockPiece();clearLines();spawnPiece();}drawTetris();}
function tryMove(dx,dy,shape=tetState?.piece?.shape){
  if(!tetState?.piece)return false;const {x,y}=tetState.piece;
  return shape.every((row,r)=>row.every((v,c)=>{if(!v)return true;const nx=x+c+dx,ny=y+r+dy;return nx>=0&&nx<TET_COLS&&ny<TET_ROWS&&(ny<0||!tetState.board[ny][nx]);}));
}
function tetMove(dx,dy){if(!tetState?.piece)return;if(dy===-1){rotatePiece();return;}if(tryMove(dx,0)){tetState.piece.x+=dx;}if(dy===1&&!tryMove(0,1)){lockPiece();clearLines();spawnPiece();}drawTetris();}
function tetDrop(){if(!tetState?.piece)return;while(tryMove(0,1))tetState.piece.y++;lockPiece();clearLines();spawnPiece();drawTetris();}
function rotatePiece(){const p=tetState.piece,rotated=p.shape[0].map((_,c)=>p.shape.map(r=>r[c]).reverse());if(tryMove(0,0,rotated))p.shape=rotated;}
function lockPiece(){const p=tetState.piece;p.shape.forEach((row,r)=>row.forEach((v,c)=>{if(v&&p.y+r>=0)tetState.board[p.y+r][p.x+c]=p.color;}));}
function clearLines(){let cleared=0;for(let r=TET_ROWS-1;r>=0;r--){if(tetState.board[r].every(v=>v)){tetState.board.splice(r,1);tetState.board.unshift(Array(TET_COLS).fill(0));cleared++;r++;}}if(cleared){tetState.lines+=cleared;tetState.score+=[0,100,300,500,800][cleared]||1000;tetState.level=Math.floor(tetState.lines/10)+1;clearInterval(tetTimer);tetTimer=setInterval(tetTick,Math.max(80,500-tetState.level*50));['tet-score','tet-lines','tet-level'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=[tetState.score,tetState.lines,tetState.level][i];});}}
function spawnPiece(){tetState.piece=tetState.next;tetState.next=newTetPiece();if(!tryMove(0,0)){tetState.over=true;clearInterval(tetTimer);showToast(`Game Over! Score: ${tetState.score}`,'info');saveGameScore('tetris',tetState.score);}}
function drawTetris(){
  const canvas=document.getElementById('tet-canvas');if(!canvas||!tetState)return;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#06060f';ctx.fillRect(0,0,canvas.width,canvas.height);
  tetState.board.forEach((row,r)=>row.forEach((color,c)=>{if(color){ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=4;ctx.fillRect(c*TET_SIZE+1,r*TET_SIZE+1,TET_SIZE-2,TET_SIZE-2);ctx.shadowBlur=0;}}));
  if(tetState.piece){const p=tetState.piece;let ghostY=p.y;while(tryMove(0,ghostY-p.y+1))ghostY++;p.shape.forEach((row,r)=>row.forEach((v,c)=>{if(v){ctx.fillStyle=p.color+'44';ctx.fillRect((p.x+c)*TET_SIZE+3,(ghostY+r)*TET_SIZE+3,TET_SIZE-6,TET_SIZE-6);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;ctx.fillRect((p.x+c)*TET_SIZE+1,(p.y+r)*TET_SIZE+1,TET_SIZE-2,TET_SIZE-2);ctx.shadowBlur=0;}}));}
  // Grid
  ctx.strokeStyle='rgba(99,102,241,0.05)';for(let r=0;r<TET_ROWS;r++)for(let c=0;c<TET_COLS;c++)ctx.strokeRect(c*TET_SIZE,r*TET_SIZE,TET_SIZE,TET_SIZE);
  // Next
  const nc=document.getElementById('tet-next');if(!nc||!tetState.next)return;const nctx=nc.getContext('2d');nctx.clearRect(0,0,nc.width,nc.height);nctx.fillStyle='#0b1020';nctx.fillRect(0,0,nc.width,nc.height);const offX=(nc.width-tetState.next.shape[0].length*18)/2;const offY=(nc.height-tetState.next.shape.length*18)/2;tetState.next.shape.forEach((row,r)=>row.forEach((v,c)=>{if(v){nctx.fillStyle=tetState.next.color;nctx.shadowColor=tetState.next.color;nctx.shadowBlur=9;nctx.fillRect(offX+c*18+1,offY+r*18+1,16,16);nctx.shadowBlur=0;}}));
}

document.addEventListener('keydown', function(e) {
  if (!tetState || !document.getElementById('tet-canvas')) return;
  if (e.key === 'ArrowLeft') { e.preventDefault(); tetMove(-1, 0); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); tetMove(1, 0); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); rotatePiece(); drawTetris(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); tetMove(0, 1); }
  else if (e.code === 'Space') { e.preventDefault(); tetDrop(); }
});

// ── SAVE SCORE ──
async function saveGameScore(gameId, score) {
  if (!supabase || !Auth?.user) return;
  try { await dbInsert('game_scores', { user_id: Auth.user.id, game_id: gameId, score, played_at: new Date().toISOString() }); }
  catch(e) {}
}

// ══════════════════════════════════════════════
// ██       ██    ██ ██████   ██████
// ██       ██    ██ ██   ██ ██    ██
// ██       ██    ██ ██   ██ ██    ██
// ██        ██  ██  ██   ██ ██    ██
// ███████    ████   ██████   ██████
// ══════════════════════════════════════════════


// ══════════════════════════════════════════════════════════
// 🎲 LUDO KING — ULTRA PREMIUM (10/10) Edition
// Animated 3D dice · Smooth token glide · Particles · Sound
// ══════════════════════════════════════════════════════════

// ── Audio Engine ──
const LudoAudio = (() => {
  let ctx = null;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function tone(freq, type, dur, vol = 0.18, delay = 0) {
    try {
      const ac = getCtx();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0, ac.currentTime + delay);
      g.gain.linearRampToValueAtTime(vol, ac.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
      o.start(ac.currentTime + delay);
      o.stop(ac.currentTime + delay + dur + 0.02);
    } catch(e) {}
  }
  function noise(dur, vol = 0.12, delay = 0) {
    try {
      const ac = getCtx();
      const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      const g = ac.createGain();
      src.buffer = buf; src.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(vol, ac.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
      src.start(ac.currentTime + delay);
    } catch(e) {}
  }
  return {
    roll() { noise(0.12, 0.15); tone(200, 'sawtooth', 0.08, 0.1, 0.05); tone(150, 'sawtooth', 0.1, 0.09, 0.1); },
    move() { tone(523, 'sine', 0.08, 0.12); tone(659, 'sine', 0.08, 0.12, 0.09); },
    capture() { tone(880, 'square', 0.05, 0.1); tone(440, 'sawtooth', 0.1, 0.12, 0.06); tone(220, 'square', 0.15, 0.1, 0.12); },
    home() { [523,659,784,1047].forEach((f,i) => tone(f,'sine',0.18,0.15,i*0.1)); },
    win() { [523,659,784,1047,1319].forEach((f,i) => { tone(f,'sine',0.25,0.18,i*0.12); tone(f*1.5,'triangle',0.15,0.1,i*0.12+0.06); }); },
    six() { tone(880,'triangle',0.06,0.14); tone(1047,'triangle',0.1,0.14,0.07); },
    blocked() { tone(200,'sawtooth',0.12,0.1); tone(180,'sawtooth',0.15,0.1,0.07); },
  };
})();

// ── Particle System ──
const LudoFX = (() => {
  let particles = [];
  let rafId = null;
  let canvas = null;
  let ctx = null;

  function init(c) {
    canvas = c; ctx = c.getContext('2d');
  }

  function burst(x, y, color, count = 22, type = 'star') {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2.5 + Math.random() * 4.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'confetti' ? 2 : 0),
        life: 1,
        decay: 0.022 + Math.random() * 0.018,
        color,
        size: type === 'confetti' ? (4 + Math.random() * 6) : (3 + Math.random() * 5),
        type,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.3,
        gravity: type === 'confetti' ? 0.12 : 0.05,
      });
    }
    if (!rafId) tick();
  }

  function confetti(x, y) {
    const colors = ['#ffd700','#ff4444','#44ff88','#4488ff','#ff44ff','#fff'];
    for (let i = 0; i < 40; i++) {
      burst(x, y, colors[i % colors.length], 1, 'confetti');
    }
  }

  function tick() {
    if (!canvas || !ctx) { rafId = null; return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw board on overlay — just draw particles on top
    particles = particles.filter(p => p.life > 0.02);
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.min(p.life, 0.95);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.type === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
      } else {
        const g = ctx.createRadialGradient(0,0,0,0,0,p.size);
        g.addColorStop(0, p.color+'ff');
        g.addColorStop(1, p.color+'00');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * p.life, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.97; p.vy *= 0.97;
      p.life -= p.decay;
      p.rot += p.rotV;
    });
    if (particles.length > 0) { rafId = requestAnimationFrame(tick); }
    else rafId = null;
  }

  return { init, burst, confetti, particles };
})();

// ── Dice 3D Renderer ──
const LudoDice = (() => {
  let canvas = null, ctx = null;
  let animFrame = null;
  let rolling = false;
  let currentFace = 1;
  let rotX = 0, rotY = 0, rotZ = 0;
  let velX = 0, velY = 0, velZ = 0;
  let targetFace = 1;
  let onDone = null;
  let rollTime = 0;

  const SIZE = 80;
  const FACE_COLORS = ['#fff9e6','#fffde0','#fff9e6','#fffde0','#fff9e6','#fffde0'];
  const DOT_POS = {
    1: [[0.5,0.5]],
    2: [[0.25,0.25],[0.75,0.75]],
    3: [[0.25,0.25],[0.5,0.5],[0.75,0.75]],
    4: [[0.25,0.25],[0.75,0.25],[0.25,0.75],[0.75,0.75]],
    5: [[0.25,0.25],[0.75,0.25],[0.5,0.5],[0.25,0.75],[0.75,0.75]],
    6: [[0.25,0.2],[0.75,0.2],[0.25,0.5],[0.75,0.5],[0.25,0.8],[0.75,0.8]],
  };

  function init(c) { canvas = c; ctx = c.getContext('2d'); draw(1); }

  function drawFace(face, x, y, w, h, alpha = 1, tilt = 0) {
    if (!ctx) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x+4, y+4, w, h, 10);
    else ctx.rect(x+4, y+4, w, h);
    ctx.fill();
    // Gradient body
    const g = ctx.createLinearGradient(x, y, x+w, y+h);
    g.addColorStop(0, face === 6 ? '#ffec80' : '#ffffff');
    g.addColorStop(0.5, FACE_COLORS[face-1]);
    g.addColorStop(1, '#f0d060');
    ctx.fillStyle = g;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 10);
    else ctx.rect(x, y, w, h);
    ctx.fill();
    // Border glow
    ctx.strokeStyle = face === 6 ? '#ffd700' : 'rgba(255,215,0,0.6)';
    ctx.lineWidth = face === 6 ? 3 : 1.5;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = face === 6 ? 12 : 4;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 10);
    else ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.shadowBlur = 0;
    // Shine
    const sg = ctx.createLinearGradient(x, y, x, y + h*0.45);
    sg.addColorStop(0, 'rgba(255,255,255,0.7)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x+3, y+3, w-6, h*0.42, 7);
    else ctx.rect(x+3, y+3, w-6, h*0.42);
    ctx.fill();
    // Dots
    const dotR = w * 0.085;
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 3;
    (DOT_POS[face] || DOT_POS[1]).forEach(([fx, fy]) => {
      const dx = x + fx * w, dy = y + fy * h;
      const dg = ctx.createRadialGradient(dx-dotR*0.3, dy-dotR*0.3, 0, dx, dy, dotR);
      dg.addColorStop(0, '#3a1a6b');
      dg.addColorStop(1, '#1a0533');
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.arc(dx, dy, dotR, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function draw(face) {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    drawFace(face, 4, 4, SIZE-8, SIZE-8);
  }

  function drawRolling(t) {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    // Wobble effect
    const wobble = Math.sin(t * 0.3) * 6;
    const scaleX = 1 + Math.sin(t * 0.45) * 0.12;
    const scaleY = 1 + Math.sin(t * 0.38 + 1) * 0.12;
    ctx.save();
    ctx.translate(SIZE/2, SIZE/2);
    ctx.rotate(Math.sin(t * 0.25) * 0.4);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-SIZE/2 + wobble*0.3, -SIZE/2 + wobble*0.2);
    const f = ((Math.floor(t * 0.4) % 6) + 1);
    drawFace(f, 4, 4, SIZE-8, SIZE-8, 1);
    // Motion blur ghost
    drawFace(((f % 6) + 1), 4 + wobble*0.5, 4 + wobble*0.3, SIZE-8, SIZE-8, 0.2);
    ctx.restore();
  }

  function startRoll(target, callback) {
    targetFace = target;
    onDone = callback;
    rolling = true;
    rollTime = 0;
    LudoAudio.roll();
    const startTime = performance.now();
    const duration = 900 + Math.random() * 400;

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      drawRolling(elapsed * 0.1);
      if (progress < 1) {
        animFrame = requestAnimationFrame(frame);
      } else {
        rolling = false;
        currentFace = target;
        draw(target);
        if (target === 6) LudoAudio.six();
        if (onDone) onDone();
      }
    }
    animFrame = requestAnimationFrame(frame);
  }

  return { init, draw, startRoll };
})();

// ── Token Animator ──
const LudoAnim = (() => {
  const queue = [];
  let running = false;

  function enqueue(task) {
    queue.push(task);
    if (!running) next();
  }

  function next() {
    if (!queue.length) { running = false; return; }
    running = true;
    const task = queue.shift();
    task(next);
  }

  function glideToken(tok, fromPos, steps, onStep, onDone) {
    let step = 0;
    function doStep() {
      if (step >= steps) { if (onDone) onDone(); next(); return; }
      step++;
      onStep(step);
      LudoAudio.move();
      setTimeout(doStep, 130);
    }
    setTimeout(doStep, 80);
  }

  return { enqueue, glideToken };
})();

// ── Render Ludo Game ──
function renderLudoGame() {
  const view = document.getElementById('game-view');
  view.innerHTML = `
<div class="game-view-wrap" style="background:linear-gradient(135deg,#0d001f 0%,#1a0533 50%,#0d001f 100%);min-height:100vh">
  <div class="game-view-header" style="background:rgba(0,0,0,0.5);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,215,0,0.2)">
    <button class="game-back-btn" onclick="navigate('games')">← Back</button>
    <h1 style="font-family:var(--font-display);font-size:1.1rem;font-weight:900;background:linear-gradient(135deg,#ffd700,#ff9500);-webkit-background-clip:text;-webkit-text-fill-color:transparent">🎲 Ludo King</h1>
    <button class="game-control-btn" style="padding:.3rem .7rem;font-size:.78rem;background:rgba(255,215,0,0.15);border:1px solid rgba(255,215,0,0.4);color:#ffd700" onclick="ludoNewGame()">New Game</button>
  </div>
  <div style="padding:.5rem .4rem">

    <!-- SETUP SCREEN -->
    <div id="ludo-setup" style="text-align:center;padding:1.5rem .8rem">
      <div id="ludo-setup-dice" style="display:flex;justify-content:center;gap:8px;margin-bottom:1rem">
        <canvas id="setup-dice-1" width="80" height="80" style="border-radius:12px;filter:drop-shadow(0 0 12px #ffd70088)"></canvas>
        <canvas id="setup-dice-2" width="80" height="80" style="border-radius:12px;filter:drop-shadow(0 0 12px #ffd70088)"></canvas>
      </div>
      <h2 style="font-family:var(--font-display);font-size:1.4rem;margin-bottom:.25rem;background:linear-gradient(135deg,#ffd700,#ff9500);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900">Ludo King</h2>
      <p style="color:#aaa;font-size:.85rem;margin-bottom:1rem">How many players?</p>
      <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.2rem">
        <button class="game-control-btn" style="font-size:1rem;padding:.7rem 1.3rem;background:linear-gradient(135deg,#ffd700,#f59e0b);color:#111;font-weight:900;min-height:58px;min-width:88px;border-radius:14px;box-shadow:0 6px 24px #ffd70044;transform:translateY(0);transition:transform .15s" onmousedown="this.style.transform='translateY(2px)'" onmouseup="this.style.transform=''" onclick="initLudo(2)">2<br><span style="font-size:.72rem">🔴🟡</span></button>
        <button class="game-control-btn" style="font-size:1rem;padding:.7rem 1.3rem;background:linear-gradient(135deg,#ffd700,#f59e0b);color:#111;font-weight:900;min-height:58px;min-width:88px;border-radius:14px;box-shadow:0 6px 24px #ffd70044;transition:transform .15s" onmousedown="this.style.transform='translateY(2px)'" onmouseup="this.style.transform=''" onclick="initLudo(3)">3<br><span style="font-size:.72rem">🔴🟢🟡</span></button>
        <button class="game-control-btn" style="font-size:1rem;padding:.7rem 1.3rem;background:linear-gradient(135deg,#ffd700,#f59e0b);color:#111;font-weight:900;min-height:58px;min-width:88px;border-radius:14px;box-shadow:0 6px 24px #ffd70044;transition:transform .15s" onmousedown="this.style.transform='translateY(2px)'" onmouseup="this.style.transform=''" onclick="initLudo(4)">4<br><span style="font-size:.72rem">🔴🟢🟡🔵</span></button>
      </div>
      <div style="background:rgba(255,215,0,.07);border:1px solid rgba(255,215,0,.18);border-radius:12px;padding:.8rem;font-size:.77rem;color:#aaa;text-align:left;max-width:290px;margin:0 auto">
        <b style="color:#ffd700">How to play:</b><br>
        🎲 Roll the dice to move your tokens<br>
        🚀 Roll a 6 to bring a token out<br>
        💥 Land on opponents to send them home<br>
        🏆 Get all 4 tokens home to win!
      </div>
    </div>

    <!-- GAME SCREEN -->
    <div id="ludo-game" style="display:none">
      <!-- Status bar -->
      <div id="ludo-status" style="text-align:center;font-weight:900;font-size:.92rem;margin-bottom:.35rem;color:#ffd700;min-height:1.3rem;text-shadow:0 0 12px #ffd700aa;letter-spacing:.02em;animation:pulse 2s infinite"></div>

      <!-- Board (dice floats over it) -->
      <!-- Corner turn-indicator boxes — mirrors classic Ludo King: each player's
           color pin always shows in their corner, and a dice-face box next to it
           lights up with the rolled number only on that player's turn. -->
      <div id="ludo-corner-top" style="display:flex;justify-content:space-between;max-width:380px;margin:0 auto .35rem;width:min(100%,380px)">
        <div class="ludo-corner-box" id="ludo-corner-box-0"><div class="ludo-corner-pin" style="background:${LUDO.COLORS[0]}"></div><div class="ludo-corner-dice" id="ludo-corner-dice-0"></div></div>
        <div class="ludo-corner-box" id="ludo-corner-box-1"><div class="ludo-corner-dice" id="ludo-corner-dice-1"></div><div class="ludo-corner-pin" style="background:${LUDO.COLORS[1]}"></div></div>
      </div>
      <div style="display:flex;gap:.5rem;justify-content:center;align-items:flex-start">
        <div id="ludo-board-wrap" style="position:relative;display:inline-block">
          <canvas id="ludo-canvas" width="380" height="380" style="border-radius:14px;touch-action:none;display:block;max-width:100%;width:min(100%,380px);filter:drop-shadow(0 0 20px rgba(255,215,0,0.25))"></canvas>
          <canvas id="ludo-fx" width="380" height="380" style="position:absolute;top:0;left:0;border-radius:14px;pointer-events:none;max-width:100%;width:min(100%,380px)"></canvas>
          <!-- Floating dice overlaid on board corner -->
          <div id="ludo-dice-float" style="position:static;z-index:10;pointer-events:auto;display:inline-block">
            <canvas id="ludo-dice-canvas" width="68" height="68" style="border-radius:12px;cursor:pointer;filter:drop-shadow(0 0 10px rgba(255,215,0,0.8));display:block;width:56px;height:56px" onclick="ludoRollDice()" title="Tap to Roll!"></canvas>
            <div id="dice-tap-hint" style="text-align:center;margin-top:2px;font-size:.56rem;color:#ffd700cc;white-space:nowrap;letter-spacing:.03em;text-shadow:0 0 6px #ffd700">tap to roll</div>
          </div>
        </div>
      </div>
      <div id="ludo-corner-bottom" style="display:flex;justify-content:space-between;max-width:380px;margin:.35rem auto 0;width:min(100%,380px)">
        <div class="ludo-corner-box" id="ludo-corner-box-3"><div class="ludo-corner-pin" style="background:${LUDO.COLORS[3]}"></div><div class="ludo-corner-dice" id="ludo-corner-dice-3"></div></div>
        <div class="ludo-corner-box" id="ludo-corner-box-2"><div class="ludo-corner-dice" id="ludo-corner-dice-2"></div><div class="ludo-corner-pin" style="background:${LUDO.COLORS[2]}"></div></div>
      </div>

      <!-- Roll button row -->
      <div style="display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:.55rem;flex-wrap:wrap">
        <button class="game-control-btn" id="ludo-roll-btn" onclick="ludoRollDice()" style="font-size:1rem;padding:.6rem 1.6rem;background:linear-gradient(135deg,#ffd700,#f59e0b);color:#111;font-weight:900;min-height:50px;border-radius:12px;box-shadow:0 4px 20px #ffd70055;letter-spacing:.04em;transition:transform .1s,box-shadow .1s" onmousedown="this.style.transform='translateY(1px)';this.style.boxShadow='0 2px 10px #ffd70055'" onmouseup="this.style.transform='';this.style.boxShadow='0 4px 20px #ffd70055'">🎲 Roll Dice</button>
      </div>

      <!-- Player info badges -->
      <div id="ludo-info" style="display:flex;justify-content:center;flex-wrap:wrap;gap:.35rem;margin-top:.6rem;padding:0 .15rem"></div>

      <!-- Move log -->
      <div style="margin-top:.5rem;background:rgba(0,0,0,.4);border-radius:12px;padding:.5rem .6rem;border:1px solid rgba(255,255,255,0.06)">
        <div style="font-size:.7rem;font-weight:900;color:#ffd700;margin-bottom:.3rem;letter-spacing:.08em">🎲 MOVE LOG</div>
        <div id="ludo-move-log" style="max-height:110px;overflow-y:auto"></div>
      </div>
    </div>

  </div>
</div>`;

  // Inject styles
  if (!document.getElementById('ludo-premium-styles')) {
    const s = document.createElement('style');
    s.id = 'ludo-premium-styles';
    s.textContent = `
      @keyframes fadeSlideIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.75} }
      @keyframes tokenBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      @keyframes glow { 0%,100%{filter:drop-shadow(0 0 8px currentColor)} 50%{filter:drop-shadow(0 0 22px currentColor)} }
      @keyframes diceSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      @keyframes diceFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-4px) scale(1.06)} }
      .ludo-badge-active { animation: pulse 1.2s ease-in-out infinite; }
      #ludo-dice-float canvas { border: 2px solid rgba(255,255,255,0.35); transition: filter 0.4s; }
      #ludo-board-wrap { user-select:none; }
      .ludo-corner-box { display:flex; align-items:center; gap:.3rem; background:rgba(255,255,255,.06); border:1px solid rgba(255,215,0,.25); border-radius:12px; padding:.3rem; transition:background .25s, border-color .25s, box-shadow .25s; }
      .ludo-corner-box.ludo-corner-active { background:rgba(255,215,0,.12); border-color:#ffd700; box-shadow:0 0 16px #ffd70066; }
      .ludo-corner-pin { width:30px; height:30px; border-radius:8px; border:1px solid rgba(255,255,255,.4); box-shadow:inset 0 0 0 2px rgba(0,0,0,.15); flex-shrink:0; }
      .ludo-corner-dice { width:62px; height:62px; border-radius:10px; background:rgba(255,182,193,.18); display:flex; align-items:center; justify-content:center; transition:background .25s; }
      .ludo-corner-box.ludo-corner-active .ludo-corner-dice { background:rgba(255,255,255,.08); }
    `;
    document.head.appendChild(s);
  }

  // Animate setup dice
  setTimeout(() => {
    const d1 = document.getElementById('setup-dice-1');
    const d2 = document.getElementById('setup-dice-2');
    if (d1) { const c = d1.getContext('2d'); _drawDiceFace(c, 5, 80); }
    if (d2) { const c = d2.getContext('2d'); _drawDiceFace(c, 2, 80); }
    // Keep rolling
    let t = 0;
    function animSetup() {
      if (document.getElementById('ludo-setup')?.style.display !== 'none') {
        if (d1) { const c = d1.getContext('2d'); _drawDiceFace(c, (Math.floor(t/18)%6)+1, 80); }
        if (d2) { const c = d2.getContext('2d'); _drawDiceFace(c, (Math.floor(t/22+3)%6)+1, 80); }
        t++;
        requestAnimationFrame(animSetup);
      }
    }
    animSetup();
  }, 100);
}

// ── LUDO CONSTANTS ──
const LUDO = {
  COLORS: ['#e8192c','#00a550','#f7c200','#0057b8'],
  LIGHT:  ['#ff8090','#4ddb8a','#ffe566','#4d9fff'],
  DARK:   ['#9b0a18','#006030','#b08800','#003d80'],
  BG:     ['#ffd6d9','#c8f7dc','#fff3c0','#c8deff'],
  NAMES:  ['Red','Green','Yellow','Blue'],
  START:  [0,13,26,39],
  SAFE:   [0,8,13,21,26,34,39,47],
};

const LUDO_PATH = [
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],
  [6,0],
];

const LUDO_STRETCH = [
  [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
];

const LUDO_HOME_CIRCLES = [
  [[2,2],[2,4],[4,2],[4,4]],
  [[2,10],[2,12],[4,10],[4,12]],
  [[10,10],[10,12],[12,10],[12,12]],
  [[10,2],[10,4],[12,2],[12,4]],
];

let ludoState = null;
let ludoMoveLog = [];
let _ludoAnimTokenPos = {}; // fractional positions for smooth glide

function initLudo(numPlayers) {
  ludoMoveLog = [];
  _ludoAnimTokenPos = {};
  const setup = document.getElementById('ludo-setup');
  const game  = document.getElementById('ludo-game');
  if (setup) setup.style.display = 'none';
  if (game)  game.style.display  = 'block';

  ludoState = {
    numPlayers,
    tokens: Array.from({length:4}, (_,p) =>
      Array.from({length:4}, (__,t) => ({player:p,id:t,pos:-1,stretch:0}))
    ),
    currentPlayer: 0,
    dice: 0,
    phase: 'roll',
    winners: [],
    consecutiveSixes: 0,
    animating: false,
  };

  if (numPlayers === 2) ludoState.activePlayers = [0, 2];
  else if (numPlayers === 3) ludoState.activePlayers = [0, 1, 2];
  else ludoState.activePlayers = [0, 1, 2, 3];

  ludoState.currentPlayer = ludoState.activePlayers[0];

  // Init dice canvas
  const dc = document.getElementById('ludo-dice-canvas');
  if (dc) LudoDice.init(dc);

  // Init FX overlay
  const fx = document.getElementById('ludo-fx');
  if (fx) LudoFX.init(fx);

  ludoUpdateStatus(`${LUDO.NAMES[ludoState.activePlayers[0]]}'s turn! Roll the dice 🎲`);
  ludoUpdateInfo();
  drawLudoBoard();
  // Position dice at first player's corner (no animation on start)
  requestAnimationFrame(() => ludoPositionDice(ludoState.currentPlayer, false));
}

function ludoNewGame() {
  ludoState = null;
  const setup = document.getElementById('ludo-setup');
  const game  = document.getElementById('ludo-game');
  if (setup) setup.style.display = 'block';
  if (game)  game.style.display  = 'none';
}

// ── Helper: draw a dice face on any canvas ──
function _drawDiceFace(ctx, face, SIZE) {
  const DOT_POS = {
    1:[[.5,.5]],2:[[.25,.25],[.75,.75]],3:[[.25,.25],[.5,.5],[.75,.75]],
    4:[[.25,.25],[.75,.25],[.25,.75],[.75,.75]],
    5:[[.25,.25],[.75,.25],[.5,.5],[.25,.75],[.75,.75]],
    6:[[.25,.2],[.75,.2],[.25,.5],[.75,.5],[.25,.8],[.75,.8]],
  };
  const S = SIZE;
  ctx.clearRect(0,0,S,S);
  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(5,5,S-4,S-4,10); else ctx.rect(5,5,S-4,S-4);
  ctx.fill();
  const g=ctx.createLinearGradient(0,0,S,S);
  g.addColorStop(0,'#ffffff'); g.addColorStop(0.5,'#fff9e6'); g.addColorStop(1,'#ffe566');
  ctx.fillStyle=g;
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(2,2,S-4,S-4,10); else ctx.rect(2,2,S-4,S-4);
  ctx.fill();
  ctx.strokeStyle= face===6?'#ffd700':'rgba(200,150,0,0.5)';
  ctx.lineWidth= face===6?2.5:1;
  ctx.shadowColor='#ffd700'; ctx.shadowBlur= face===6?10:3;
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(2,2,S-4,S-4,10); else ctx.rect(2,2,S-4,S-4);
  ctx.stroke(); ctx.shadowBlur=0;
  const shine=ctx.createLinearGradient(2,2,2,S*0.45);
  shine.addColorStop(0,'rgba(255,255,255,0.75)'); shine.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=shine;
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(4,4,S-8,S*0.38,7); else ctx.rect(4,4,S-8,S*0.38);
  ctx.fill();
  ctx.shadowColor='rgba(0,0,0,0.45)'; ctx.shadowBlur=3;
  (DOT_POS[face]||DOT_POS[1]).forEach(([fx,fy])=>{
    const dx=2+fx*(S-4), dy=2+fy*(S-4), r=S*0.085;
    const dg=ctx.createRadialGradient(dx-r*.3,dy-r*.3,0,dx,dy,r);
    dg.addColorStop(0,'#3a1a6b'); dg.addColorStop(1,'#1a0533');
    ctx.fillStyle=dg;
    ctx.beginPath(); ctx.arc(dx,dy,r,0,Math.PI*2); ctx.fill();
  });
  ctx.shadowBlur=0;
}

function ludoDiceEmoji(n) { return ['⚀','⚁','⚂','⚃','⚄','⚅'][n-1]||'🎲'; }

function ludoRollDice() {
  if (!ludoState || ludoState.animating) return;
  if (ludoState.phase !== 'roll') return;

  const p = ludoState.currentPlayer;
  ludoState.animating = true;

  const die = Math.floor(Math.random()*6)+1;

  // Animate dice with 3D effect
  const dc = document.getElementById('ludo-dice-canvas');
  if (dc) {
    LudoDice.startRoll(die, () => {
      ludoState.dice = die;
      ludoState.animating = false;
      ludoProcessRoll(p, die);
    });
  } else {
    ludoState.dice = die;
    ludoState.animating = false;
    ludoProcessRoll(p, die);
  }
}

function ludoProcessRoll(p, die) {
  if (die === 6) {
    ludoState.consecutiveSixes = (ludoState.consecutiveSixes||0)+1;
    if (ludoState.consecutiveSixes >= 3) {
      ludoUpdateStatus(`${LUDO.NAMES[p]}: Triple 6 penalty! ⚡`);
      LudoAudio.blocked();
      ludoState.consecutiveSixes = 0;
      setTimeout(ludoNextTurn, 1200);
      return;
    }
  } else { ludoState.consecutiveSixes = 0; }

  const movable = ludoGetMovable(p, die);
  if (movable.length === 0) {
    ludoUpdateStatus(`${LUDO.NAMES[p]} rolled ${die} — no moves 😬`);
    LudoAudio.blocked();
    setTimeout(ludoNextTurn, 1000);
    return;
  }

  if (movable.length === 1) {
    ludoUpdateStatus(`${LUDO.NAMES[p]} rolled ${die}!`);
    ludoState.phase = 'move';
    setTimeout(() => ludoMoveToken(p, movable[0]), 350);
    return;
  }

  ludoUpdateStatus(`${LUDO.NAMES[p]} rolled ${die}! Tap a token 👆`);
  ludoState.phase = 'move';
  drawLudoBoard(movable.map(t=>t.id));
  const canvas = document.getElementById('ludo-canvas');
  if (canvas) canvas.onclick = (e) => ludoHandleClick(e, movable, p);
}

function ludoGetMovable(player, die) {
  return ludoState.tokens[player].filter(tok => {
    if (tok.pos === 58) return false;
    if (tok.pos === -1) return die === 6;
    if (tok.stretch > 0) return tok.stretch + die <= 6;
    return true;
  });
}

function ludoHandleClick(e, movable, player) {
  const canvas = document.getElementById('ludo-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = 380 / rect.width;
  const scaleY = 380 / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;
  const C = 380/15;
  for (const tok of movable) {
    const [tr,tc] = ludoTokenScreenPos(tok);
    const px = tc*C + C/2, py = tr*C + C/2;
    if (Math.hypot(mx-px, my-py) < C*0.75) {
      canvas.onclick = null;
      ludoMoveToken(player, tok);
      return;
    }
  }
}

function ludoTokenScreenPos(tok) {
  const p = tok.player;
  if (tok.pos === -1) return LUDO_HOME_CIRCLES[p][tok.id];
  if (tok.pos === 58) return [7,7];
  if (tok.stretch > 0) return LUDO_STRETCH[p][tok.stretch-1];
  const absPos = (tok.pos + LUDO.START[p]) % 52;
  return LUDO_PATH[absPos] || [7,7];
}

function ludoGetTokensAt(trackPos, forPlayer, ownOnly) {
  const result = [];
  for (let p=0;p<4;p++) {
    if (ownOnly && p!==forPlayer) continue;
    if (!ownOnly && p===forPlayer) continue;
    for (const tok of ludoState.tokens[p])
      if (tok.stretch===0 && tok.pos===trackPos) result.push(tok);
  }
  return result;
}

// ── Animated token move ──
function ludoMoveToken(player, tok) {
  if (!ludoState) return;
  ludoState.animating = true;
  const die = ludoState.dice;
  const S = 380, C = S/15;

  // Determine steps to animate
  if (tok.pos === -1) {
    // Enter board
    tok.pos = 0;
    ludoUpdateStatus(`${LUDO.NAMES[player]} enters the board! 🚀`);
    LudoAudio.move();
    ludoLogMove(player, die, 'Entered board 🚀');
    // FX burst at start position
    const [tr, tc] = ludoTokenScreenPos(tok);
    const fxCanvas = document.getElementById('ludo-fx');
    if (fxCanvas) {
      const fx = document.getElementById('ludo-fx');
      LudoFX.burst(tc*C+C/2, tr*C+C/2, LUDO.COLORS[player], 18);
    }
    drawLudoBoard();
    ludoUpdateInfo();
    ludoState.animating = false;
    _ludoAfterMove(player, die, false);
    return;
  }

  // Animate step by step
  const startPos = tok.pos;
  const startStretch = tok.stretch;
  let step = 0;

  function doStep() {
    if (step >= die) {
      // Done moving
      _ludoAfterLand(player, tok, die);
      return;
    }
    step++;

    if (tok.stretch > 0) {
      tok.stretch = Math.min(tok.stretch + 1, 6);
      if (tok.stretch === 6) { tok.pos = 58; }
    } else {
      const newPos = tok.pos + 1;
      if (newPos >= 51) {
        tok.stretch = newPos - 51; tok.pos = 52;
      } else {
        tok.pos = newPos;
      }
    }

    LudoAudio.move();
    drawLudoBoard();

    // Particle trail
    const fxC = document.getElementById('ludo-fx');
    if (fxC) {
      const [tr,tc] = ludoTokenScreenPos(tok);
      LudoFX.burst(tc*C+C/2, tr*C+C/2, LUDO.COLORS[player], 5);
    }

    setTimeout(doStep, 140);
  }

  doStep();
}

function _ludoAfterLand(player, tok, die) {
  const S = 380, C = S/15;
  const fxC = document.getElementById('ludo-fx');

  if (tok.pos === 58) {
    // Token reached home
    ludoUpdateStatus(`${LUDO.NAMES[player]} token HOME! 🏆`);
    LudoAudio.home();
    if (fxC) LudoFX.confetti(7*C+C/2, 7*C+C/2);
    ludoLogMove(player, die, 'Token HOME 🏆');
    if (typeof showToast === 'function') showToast(`${LUDO.NAMES[player]} token reached home!`, 'success');
  } else if (tok.stretch === 0) {
    // Check for capture
    const newPos = tok.pos;
    const absPos = (newPos + LUDO.START[player]) % 52;
    if (!LUDO.SAFE.includes(absPos)) {
      const enemies = ludoGetTokensAt(newPos, player, false);
      if (enemies.length === 1 && ludoState.activePlayers.includes(enemies[0].player)) {
        const [er, ec] = ludoTokenScreenPos(enemies[0]);
        enemies[0].pos = -1; enemies[0].stretch = 0;
        LudoAudio.capture();
        if (fxC) LudoFX.burst(ec*C+C/2, er*C+C/2, '#ff4444', 28);
        ludoUpdateStatus(`${LUDO.NAMES[player]} CAPTURED ${LUDO.NAMES[enemies[0].player]}! 💥`);
        if (typeof showToast === 'function') showToast(`${LUDO.NAMES[player]} captured ${LUDO.NAMES[enemies[0].player]}! 💥`, 'success');
        ludoLogMove(player, die, `Captured ${LUDO.NAMES[enemies[0].player]} 💥`);
      } else {
        ludoLogMove(player, die, `Moved +${die} steps`);
      }
    } else {
      ludoLogMove(player, die, `Moved +${die} steps`);
    }
  }

  // Check win
  const finished = ludoState.tokens[player].filter(t=>t.pos===58).length;
  if (finished === 4 && !ludoState.winners.includes(player)) {
    ludoState.winners.push(player);
    LudoAudio.win();
    if (fxC) {
      for (let i=0;i<5;i++) setTimeout(()=>LudoFX.confetti(S/2,S/2), i*200);
    }
    if (typeof showToast === 'function') showToast(`${LUDO.NAMES[player]} WON! 🏆`, 'success');
    if (ludoState.winners.length === ludoState.activePlayers.length - 1) {
      ludoUpdateStatus('Game Over! 🏆');
      drawLudoBoard(); ludoUpdateInfo();
      ludoState.animating = false;
      return;
    }
  }

  drawLudoBoard();
  ludoUpdateInfo();
  ludoState.animating = false;
  _ludoAfterMove(player, die, false);
}

function _ludoAfterMove(player, die, wasSix) {
  if (die === 6) {
    ludoUpdateStatus(`${LUDO.NAMES[player]} rolled 6 — go again! 🎲`);
    ludoState.phase = 'roll';
  } else {
    ludoNextTurn();
  }
}

function ludoNextTurn() {
  if (!ludoState) return;
  const active = ludoState.activePlayers;
  let idx = active.indexOf(ludoState.currentPlayer);
  let tries = 0;
  do {
    idx = (idx+1) % active.length;
    tries++;
  } while (ludoState.winners.includes(active[idx]) && tries < active.length);
  ludoState.currentPlayer = active[idx];
  ludoState.phase = 'roll';
  ludoUpdateStatus(`${LUDO.NAMES[active[idx]]}'s turn! Roll the dice 🎲`);
  ludoUpdateInfo();
  ludoPositionDice(active[idx], true);
}

// ── Real tappable dice: moves INTO the current player's own corner box ──
// Player corners: 0=Red top-left, 1=Green top-right, 2=Yellow bottom-right, 3=Blue bottom-left
// This is the actual #ludo-dice-canvas (with its onclick=ludoRollDice) being
// physically relocated via appendChild — so whoever's turn it is can tap the
// dice sitting right next to THEIR pin, even with two people sitting opposite
// sides of the device. Nobody has to reach across to one fixed spot.
function ludoPositionDice(player, animate) {
  const floatEl = document.getElementById('ludo-dice-float');
  const slot = document.getElementById('ludo-corner-dice-' + player);
  if (!floatEl || !slot) return;

  if (floatEl.parentElement !== slot) {
    floatEl.style.position = 'static';
    floatEl.style.top = '';
    floatEl.style.left = '';
    if (animate) {
      floatEl.style.transform = 'scale(.4)';
      floatEl.style.opacity = '0';
    }
    slot.appendChild(floatEl);
    if (animate) {
      requestAnimationFrame(() => {
        floatEl.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1), opacity .25s';
        floatEl.style.transform = 'scale(1)';
        floatEl.style.opacity = '1';
      });
    } else {
      floatEl.style.transform = 'scale(1)';
      floatEl.style.opacity = '1';
    }
  }

  // Highlight the active corner box, dim the other three.
  for (let i = 0; i < 4; i++) {
    const box = document.getElementById('ludo-corner-box-' + i);
    if (box) box.classList.toggle('ludo-corner-active', i === player);
  }

  // Color glow per player
  const glows = ['#e8192c','#00a550','#f7c200','#0057b8'];
  const dc = document.getElementById('ludo-dice-canvas');
  if (dc) dc.style.filter = `drop-shadow(0 0 12px ${glows[player]}cc)`;
}

function ludoUpdateStatus(msg) {
  const el = document.getElementById('ludo-status');
  if (el) el.textContent = msg;
}

function ludoUpdateInfo() {
  const el = document.getElementById('ludo-info');
  if (!el || !ludoState) return;
  el.innerHTML = ludoState.activePlayers.map(p => {
    const fin = ludoState.tokens[p].filter(t=>t.pos===58).length;
    const rank = ludoState.winners.indexOf(p);
    const isCurrent = ludoState.currentPlayer === p;
    return `<div style="background:${LUDO.COLORS[p]};border-radius:10px;padding:.3rem .75rem;font-size:.75rem;font-weight:900;color:#fff;flex:1;min-width:64px;text-align:center;opacity:${isCurrent?1:0.58};border:${isCurrent?'3px solid #ffd700':'3px solid transparent'};transition:all .25s;box-shadow:${isCurrent?'0 0 18px '+LUDO.COLORS[p]+'99':'none'};${isCurrent?'animation:pulse 1.2s infinite':''}">
      <div style="font-size:.9rem">${LUDO.NAMES[p]}${isCurrent?' 🎲':''}</div>
      <div style="font-size:.72rem;opacity:.9">${'●'.repeat(fin)}${'○'.repeat(4-fin)}</div>
      ${rank>=0?`<div style="font-size:.65rem;background:rgba(0,0,0,.3);border-radius:4px;padding:.1rem .3rem;margin-top:.15rem">#${rank+1} 🏆</div>`:''}
    </div>`;
  }).join('');
}

// ── DRAW BOARD (premium) ──
function drawLudoBoard(highlightIds=[]) {
  const canvas = document.getElementById('ludo-canvas');
  if (!canvas || !ludoState) return;
  const ctx = canvas.getContext('2d');
  const S=380, N=15, C=S/N;

  ctx.clearRect(0,0,S,S);

  // Rich outer border
  const borderGrad = ctx.createLinearGradient(0,0,S,S);
  borderGrad.addColorStop(0,'#2a0a4a');
  borderGrad.addColorStop(0.3,'#ffd70033');
  borderGrad.addColorStop(0.7,'#ffd70033');
  borderGrad.addColorStop(1,'#2a0a4a');
  ctx.fillStyle = borderGrad;
  ctx.fillRect(0,0,S,S);

  // Gold trim
  ctx.fillStyle='#ffd700';
  ctx.fillRect(3,3,S-6,S-6);
  // Inner border
  const innerGrad = ctx.createLinearGradient(0,0,S,S);
  innerGrad.addColorStop(0,'#1a0a30'); innerGrad.addColorStop(1,'#0d0020');
  ctx.fillStyle = innerGrad;
  ctx.fillRect(6,6,S-12,S-12);

  const BOARD_OFF=6, BS=S-12, BC=BS/N;
  function bx(c) { return BOARD_OFF+c*BC; }
  function by(r) { return BOARD_OFF+r*BC; }

  const active = ludoState.activePlayers;

  // ── Home quadrants ──
  const quadrants = [{r:0,c:0,pi:0},{r:0,c:9,pi:1},{r:9,c:9,pi:2},{r:9,c:0,pi:3}];

  quadrants.forEach(({r,c,pi}) => {
    const isActive = active.includes(pi);
    const color = LUDO.COLORS[pi];
    const light = LUDO.LIGHT[pi];

    // Quadrant base with pattern
    ctx.fillStyle = isActive ? color : '#1e1e2e';
    ctx.fillRect(bx(c), by(r), 6*BC, 6*BC);

    if (isActive) {
      // Diamond pattern overlay
      ctx.save();
      ctx.globalAlpha = 0.13;
      ctx.fillStyle = '#000';
      for (let i=0;i<6;i++) for (let j=0;j<6;j++) {
        if ((i+j)%2===0) ctx.fillRect(bx(c)+i*BC, by(r)+j*BC, BC, BC);
      }
      ctx.restore();
    }

    // White inner box
    ctx.fillStyle = isActive ? '#fcfcfc' : '#181828';
    const pad = BC * 0.52;
    roundRect(ctx, bx(c)+pad, by(r)+pad, 6*BC-pad*2, 6*BC-pad*2, BC*0.42);
    ctx.fill();

    // 4 home circles with 3D effect
    LUDO_HOME_CIRCLES[pi].forEach(([hr,hc]) => {
      const cx = bx(hc)+BC/2, cy = by(hr)+BC/2, radius = BC*0.43;
      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx+1.5, cy+3, radius*0.85, radius*0.38, 0, 0, Math.PI*2);
      ctx.fill();
      // 3D gradient fill
      if (isActive) {
        const cg = ctx.createRadialGradient(cx-radius*0.35, cy-radius*0.35, radius*0.05, cx, cy, radius);
        cg.addColorStop(0, light);
        cg.addColorStop(0.6, color);
        cg.addColorStop(1, LUDO.DARK[pi]);
        ctx.fillStyle = cg;
      } else { ctx.fillStyle = '#2e2e4e'; }
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill();
      // Ring
      ctx.strokeStyle = isActive ? 'rgba(255,255,255,0.7)' : '#3e3e5e';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.stroke();
      // Inner pupil
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.55)' : '#2a2a3e';
      ctx.beginPath(); ctx.arc(cx, cy, radius*0.44, 0, Math.PI*2); ctx.fill();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath(); ctx.ellipse(cx-radius*0.22, cy-radius*0.28, radius*0.22, radius*0.14, -0.5, 0, Math.PI*2); ctx.fill();
    });

    // Player label
    ctx.font = `bold ${BC*0.5}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = isActive ? color+'ee' : '#404060';
    ctx.shadowColor = isActive ? color : 'transparent'; ctx.shadowBlur = isActive ? 8 : 0;
    ctx.fillText(pi===0?'YOU':LUDO.NAMES[pi], bx(c)+3*BC, by(r)+3*BC);
    ctx.shadowBlur = 0;

    // Active player glow border
    if (isActive && ludoState.currentPlayer === pi) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 16;
      ctx.strokeRect(bx(c)+2, by(r)+2, 6*BC-4, 6*BC-4);
      ctx.shadowBlur = 0;
    }

    // Inactive overlay
    if (!isActive) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(bx(c), by(r), 6*BC, 6*BC);
      ctx.fillStyle = '#333355';
      ctx.font = `bold ${BC*1.0}px sans-serif`;
      ctx.fillText('—', bx(c)+3*BC, by(r)+3*BC);
    }
  });

  // ── Track cells ──
  function drawCell(r, c, fill, stroke='#888', glow=false) {
    if (glow) { ctx.shadowColor = fill; ctx.shadowBlur = 8; }
    ctx.fillStyle = fill;
    ctx.fillRect(bx(c)+0.5, by(r)+0.5, BC-1, BC-1);
    ctx.strokeStyle = stroke; ctx.lineWidth = 0.8;
    ctx.strokeRect(bx(c)+0.5, by(r)+0.5, BC-1, BC-1);
    if (glow) ctx.shadowBlur = 0;
  }

  // Base track
  LUDO_PATH.forEach(([r,c]) => {
    const g2 = ctx.createLinearGradient(bx(c), by(r), bx(c)+BC, by(r)+BC);
    g2.addColorStop(0, '#eff0ff'); g2.addColorStop(1, '#e0e0f5');
    ctx.fillStyle = g2;
    ctx.fillRect(bx(c)+0.5, by(r)+0.5, BC-1, BC-1);
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 0.8;
    ctx.strokeRect(bx(c)+0.5, by(r)+0.5, BC-1, BC-1);
  });

  // Entry cells colored
  [[LUDO_PATH[0],0],[LUDO_PATH[13],1],[LUDO_PATH[26],2],[LUDO_PATH[39],3]].forEach(([[r,c],pi]) => {
    if (active.includes(pi)) {
      drawCell(r, c, LUDO.COLORS[pi]+'cc', '#666', true);
      // Arrow indicator
      ctx.fillStyle='rgba(255,255,255,0.6)';
      ctx.font=`bold ${BC*0.55}px sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('▶', bx(c)+BC/2, by(r)+BC/2);
    }
  });

  // Safe cells with star
  LUDO.SAFE.forEach(idx => {
    const [r,c] = LUDO_PATH[idx];
    drawCell(r, c, '#d4f0d4', '#8dc'); 
    ctx.fillStyle='#22a045';
    ctx.shadowColor='#22a045'; ctx.shadowBlur=5;
    ctx.font=`${BC*0.62}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('★', bx(c)+BC/2, by(r)+BC/2);
    ctx.shadowBlur=0;
  });

  // Home stretches (colored paths)
  LUDO_STRETCH.forEach((stretch, p) => {
    if (!active.includes(p)) return;
    stretch.forEach(([r,c], i) => {
      const alpha = i < 5 ? 0.38 : 1.0;
      const fill = i < 5 ? LUDO.COLORS[p] + Math.round(alpha*255).toString(16).padStart(2,'0') : '#fffef0';
      drawCell(r, c, fill, LUDO.COLORS[p]+'99');
      if (i === 5) {
        // Final stretch cell highlight
        ctx.strokeStyle = LUDO.COLORS[p]; ctx.lineWidth = 2.5;
        ctx.shadowColor = LUDO.COLORS[p]; ctx.shadowBlur = 10;
        ctx.strokeRect(bx(c)+1.5, by(r)+1.5, BC-3, BC-3);
        ctx.shadowBlur = 0;
      }
    });
  });

  // ── Center finish — colored triangles + star ──
  const mx=bx(7)+BC/2, my=by(7)+BC/2;
  [
    [bx(7),by(7), bx(8),by(7), mx,my, LUDO.COLORS[0]],
    [bx(8),by(7), bx(8),by(8), mx,my, LUDO.COLORS[1]],
    [bx(8),by(8), bx(7),by(8), mx,my, LUDO.COLORS[2]],
    [bx(7),by(8), bx(7),by(7), mx,my, LUDO.COLORS[3]],
  ].forEach(([x1,y1,x2,y2,x3,y3,col]) => {
    const tg = ctx.createLinearGradient(x1,y1,x3,y3);
    tg.addColorStop(0, col); tg.addColorStop(1, col+'88');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.closePath(); ctx.fill();
  });
  // Center star
  ctx.fillStyle='#ffd700';
  ctx.shadowColor='#ffd700'; ctx.shadowBlur=14;
  ctx.font=`bold ${BC*0.9}px serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('★', mx, my);
  ctx.shadowBlur=0;

  // ── Draw tokens ──
  for (let p=0;p<4;p++) {
    if (!active.includes(p)) continue;
    for (let t=0;t<4;t++) {
      const tok = ludoState.tokens[p][t];
      if (tok.pos === 58) continue;
      const [tr,tc] = ludoTokenScreenPos(tok);
      const stack = ludoState.tokens[p].filter(x => {
        if (x.id===tok.id) return false;
        const [xr,xc] = ludoTokenScreenPos(x); return xr===tr && xc===tc;
      });
      const off = BC * 0.2;
      const ox = stack.length > 0 ? (t%2===0?-off:off) : 0;
      const oy = stack.length > 0 ? (t<2?-off:off) : 0;
      const px = bx(tc)+BC/2+ox;
      const py = by(tr)+BC/2+oy;
      const isHL = p===ludoState.currentPlayer && highlightIds.includes(tok.id);
      drawPin(ctx, px, py, BC*0.42, LUDO.COLORS[p], LUDO.LIGHT[p], LUDO.DARK[p], isHL, t+1);
    }
  }

  // Finished tokens in center
  for (let p=0;p<4;p++) {
    if (!active.includes(p)) continue;
    const finToks = ludoState.tokens[p].filter(t=>t.pos===58);
    finToks.forEach((tok,i) => {
      const fx2 = mx + ([-1,1,-1,1][i])*BC*0.2;
      const fy2 = my + ([-1,-1,1,1][i])*BC*0.2;
      drawPin(ctx, fx2, fy2, BC*0.26, LUDO.COLORS[p], LUDO.LIGHT[p], LUDO.DARK[p], false, '★');
    });
  }

  // Draw dice on canvas
  const dc = document.getElementById('ludo-dice-canvas');
  if (dc) {
    const dctx = dc.getContext('2d');
    if (ludoState.dice > 0) _drawDiceFace(dctx, ludoState.dice, 80);
    else {
      dctx.clearRect(0,0,80,80);
      dctx.fillStyle='#1a0533';
      dctx.beginPath();
      if(dctx.roundRect) dctx.roundRect(2,2,76,76,12); else dctx.rect(2,2,76,76);
      dctx.fill();
      dctx.fillStyle='rgba(255,215,0,0.5)';
      dctx.font='bold 28px serif';
      dctx.textAlign='center'; dctx.textBaseline='middle';
      dctx.fillText('🎲', 40, 42);
    }
  }
}

// ── Premium 3D pin token ──
function drawPin(ctx, x, y, r, color, light, dark, highlighted, label) {
  // Pulsing highlight ring
  if (highlighted) {
    const rings = 3;
    for (let i=0;i<rings;i++) {
      ctx.save();
      ctx.globalAlpha = 0.25 - i*0.07;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(x, y, r + 5 + i*5, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    ctx.shadowBlur = 0;
  }
  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(x+2.5, y+r*0.75, r*0.72, r*0.26, 0, 0, Math.PI*2); ctx.fill();
  // Raised pawn pedestal
  const baseG = ctx.createLinearGradient(x-r*.7, y+r*.38, x+r*.7, y+r*.85);
  baseG.addColorStop(0, light); baseG.addColorStop(.55, color); baseG.addColorStop(1, dark);
  ctx.fillStyle = baseG;
  ctx.beginPath();
  ctx.ellipse(x, y+r*.55, r*.72, r*.27, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x-r*.3, y+r*.12, r*.6, r*.48, r*.16) : ctx.rect(x-r*.3, y+r*.12, r*.6, r*.48);
  ctx.fill();

  // Pin body — 3D sphere look
  const bodyG = ctx.createRadialGradient(x-r*0.32, y-r*0.42, r*0.06, x, y-r*0.12, r*1.1);
  bodyG.addColorStop(0, light);
  bodyG.addColorStop(0.45, color);
  bodyG.addColorStop(0.85, dark);
  bodyG.addColorStop(1, dark+'aa');
  ctx.fillStyle = bodyG;
  ctx.beginPath(); ctx.arc(x, y-r*0.14, r, 0, Math.PI*2); ctx.fill();

  // Metallic rim
  ctx.strokeStyle = highlighted ? '#ffd700' : 'rgba(255,255,255,0.35)';
  ctx.lineWidth = highlighted ? 2 : 1.2;
  if (highlighted) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 10; }
  ctx.beginPath(); ctx.arc(x, y-r*0.14, r, 0, Math.PI*2); ctx.stroke();
  ctx.shadowBlur = 0;

  // Specular shine
  ctx.fillStyle = 'rgba(255,255,255,0.52)';
  ctx.beginPath(); ctx.ellipse(x-r*0.29, y-r*0.46, r*0.3, r*0.19, -0.6, 0, Math.PI*2); ctx.fill();

  // Small secondary shine
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.ellipse(x+r*0.2, y-r*0.1, r*0.14, r*0.1, 0.5, 0, Math.PI*2); ctx.fill();

  // Label
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${r*0.88}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 4;
  ctx.fillText(String(label), x, y-r*0.1);
  ctx.shadowBlur = 0;
}

// ── Rounded rect ──
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

// ── Move log ──

function ludoLogMove(player, die, action) {
  if (typeof ludoMoveLog === 'undefined') ludoMoveLog = [];
  ludoMoveLog.unshift({player, die, action, time: Date.now()});
  if (ludoMoveLog.length > 12) ludoMoveLog.pop();
  renderLudoMoveLog();
}

function renderLudoMoveLog() {
  const el = document.getElementById('ludo-move-log');
  if (!el) return;
  el.innerHTML = ludoMoveLog.map(entry => {
    const col = LUDO.COLORS[entry.player];
    return `<div style="display:flex;align-items:center;gap:.4rem;padding:.28rem .45rem;border-radius:8px;background:${col}18;border-left:3px solid ${col};margin-bottom:.22rem;animation:fadeSlideIn .3s ease">
      <span style="width:9px;height:9px;border-radius:50%;background:${col};flex-shrink:0;box-shadow:0 0 6px ${col}"></span>
      <span style="font-weight:900;color:${col};font-size:.72rem;min-width:30px">${LUDO.NAMES[entry.player]}</span>
      <span style="font-size:.8rem;color:#e0e0e0;flex:1">${ludoDiceEmoji(entry.die)} → ${entry.action}</span>
    </div>`;
  }).join('') || '<div style="color:#555;font-size:.76rem;text-align:center;padding:.5rem">No moves yet</div>';
}

// ══════════════════════════════════════
// MILI MILIMITA 📏
// ══════════════════════════════════════
function renderMiliMilimita() {
  const view = document.getElementById('game-view');
  view.innerHTML = gameHeader('V-Fights', '⚔️') + `
  <div class="game-canvas-wrap" style="padding:1rem">
    <div id="mm-phase-start">
      <div style="text-align:center;padding:1.5rem 1rem">
        <div style="font-size:3.5rem;margin-bottom:.75rem">📏</div>
        <h2 style="font-family:var(--font-display);font-size:1.3rem;margin-bottom:.5rem">V-Fights! ⚔️</h2>
        <p style="color:var(--text2);font-size:.9rem;margin-bottom:1.2rem">A line will appear — guess its length in <b>millimetres</b>! Closest guess wins points. Can you beat the high score?</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;margin-bottom:1.2rem">
          <div style="background:var(--glass);border:1px solid var(--border);border-radius:8px;padding:.5rem;text-align:center">
            <div style="font-size:1.4rem">🏆</div>
            <div style="font-size:.75rem;color:var(--text3)">Best</div>
            <div id="mm-best" style="font-weight:800;font-size:1rem">—</div>
          </div>
          <div style="background:var(--glass);border:1px solid var(--border);border-radius:8px;padding:.5rem;text-align:center">
            <div style="font-size:1.4rem">🎯</div>
            <div style="font-size:.75rem;color:var(--text3)">Round</div>
            <div id="mm-round-disp" style="font-weight:800;font-size:1rem">1/10</div>
          </div>
          <div style="background:var(--glass);border:1px solid var(--border);border-radius:8px;padding:.5rem;text-align:center">
            <div style="font-size:1.4rem">⭐</div>
            <div style="font-size:.75rem;color:var(--text3)">Score</div>
            <div id="mm-score-disp" style="font-weight:800;font-size:1rem">0</div>
          </div>
        </div>
        <button class="game-control-btn" style="font-size:1rem;padding:.6rem 1.8rem" onclick="mmStartGame()">🚀 Start Game</button>
      </div>
    </div>

    <div id="mm-phase-guess" style="display:none">
      <div style="text-align:center;margin-bottom:.75rem">
        <span style="font-size:.82rem;color:var(--text3)">Round <strong id="mm-rnd">1</strong>/10 &nbsp;|&nbsp; Score: <strong id="mm-sc">0</strong></span>
      </div>
      <div style="margin-bottom:.75rem;text-align:center;font-size:.88rem;color:var(--text2)">How long is this line? (in <b>mm</b>)</div>
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:1.2rem;margin-bottom:.75rem;min-height:80px;display:flex;align-items:center;justify-content:center">
        <canvas id="mm-canvas" width="300" height="60" style="max-width:100%"></canvas>
      </div>
      <div style="display:flex;gap:.5rem;margin-bottom:.75rem">
        <input id="mm-input" type="number" min="1" max="999" placeholder="mm..." 
          style="flex:1;padding:.55rem .75rem;border-radius:8px;border:1.5px solid var(--border);background:var(--glass2);color:var(--text);font-size:1rem;font-weight:700;text-align:center"
          onkeydown="if(event.key==='Enter')mmSubmitGuess()">
        <button class="game-control-btn" onclick="mmSubmitGuess()" style="padding:.55rem 1.1rem">✅ Guess!</button>
      </div>
      <div id="mm-hint" style="text-align:center;font-size:.8rem;color:var(--text3);min-height:1rem"></div>
    </div>

    <div id="mm-phase-result" style="display:none">
      <div id="mm-result-content" style="text-align:center;padding:1rem"></div>
      <div style="text-align:center;margin-top:.75rem">
        <button class="game-control-btn" onclick="mmNextRound()" id="mm-next-btn">Next Round ➡️</button>
      </div>
    </div>

    <div id="mm-phase-end" style="display:none">
      <div id="mm-end-content" style="text-align:center;padding:1.5rem 1rem"></div>
      <div style="text-align:center;margin-top:.75rem">
        <button class="game-control-btn" onclick="mmStartGame()">🔄 Play Again</button>
      </div>
    </div>
  </div></div>`;
  mmLoadBest();
}

let mmState = null;
function mmLoadBest() {
  const b = localStorage.getItem('mm-best') || '—';
  const el = document.getElementById('mm-best');
  if (el) el.textContent = b === '—' ? '—' : b + ' pts';
}

function mmStartGame() {
  mmState = { round: 1, score: 0, total: 10 };
  document.getElementById('mm-phase-start').style.display = 'none';
  document.getElementById('mm-phase-end').style.display = 'none';
  document.getElementById('mm-phase-result').style.display = 'none';
  document.getElementById('mm-phase-guess').style.display = 'block';
  mmNewRound();
}

function mmNewRound() {
  if (!mmState) return;
  // Random line length 20-280mm (scaled to canvas)
  const mmLen = Math.floor(Math.random() * 260) + 20;
  mmState.currentMM = mmLen;
  mmState.hint = false;

  document.getElementById('mm-rnd').textContent = mmState.round;
  document.getElementById('mm-sc').textContent = mmState.score;
  document.getElementById('mm-round-disp').textContent = `${mmState.round}/10`;
  document.getElementById('mm-score-disp').textContent = mmState.score;
  document.getElementById('mm-input').value = '';
  document.getElementById('mm-hint').textContent = '';
  document.getElementById('mm-input').focus();

  // Draw line on canvas
  const canvas = document.getElementById('mm-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,300,60);

  // Scale: canvas is 300px wide, screen ~100mm wide (rough 3px/mm)
  const maxPx = 280;
  const linePx = Math.round((mmLen / 300) * maxPx);
  const startX = (300 - linePx) / 2;
  const y = 30;

  // Draw ruler tick marks
  ctx.strokeStyle = 'var(--border, #ddd)';
  ctx.lineWidth = 0.5;
  for (let px = 0; px < 300; px += 10) {
    const h = px % 50 === 0 ? 8 : 4;
    ctx.beginPath();
    ctx.moveTo(px, y - h - 8);
    ctx.lineTo(px, y - 8);
    ctx.stroke();
  }

  // Shadow glow
  ctx.shadowColor = '#6366f1';
  ctx.shadowBlur = 8;
  // Main line
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(startX + linePx, y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // End caps
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2;
  [[startX, y-7, startX, y+7], [startX+linePx, y-7, startX+linePx, y+7]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });

  // Label
  ctx.fillStyle = '#8b5cf6';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('?? mm', startX + linePx/2, y - 14);
}

function mmSubmitGuess() {
  if (!mmState) return;
  const input = document.getElementById('mm-input');
  const guess = parseInt(input.value, 10);
  if (!guess || guess < 1 || guess > 999) {
    document.getElementById('mm-hint').textContent = '⚠️ Enter a number between 1 and 999 mm';
    return;
  }

  const actual = mmState.currentMM;
  const diff = Math.abs(guess - actual);
  let pts = 0, msg = '', emoji = '';

  if (diff === 0) { pts = 100; emoji = '🎯💥'; msg = 'PERFECT! Exact answer!'; }
  else if (diff <= 2) { pts = 90; emoji = '🎯'; msg = 'Amazing! Near perfect!'; }
  else if (diff <= 5) { pts = 75; emoji = '🔥'; msg = 'Excellent! So close!'; }
  else if (diff <= 10) { pts = 55; emoji = '👍'; msg = 'Great estimate!'; }
  else if (diff <= 20) { pts = 35; emoji = '😊'; msg = 'Not bad!'; }
  else if (diff <= 40) { pts = 15; emoji = '🤏'; msg = 'A bit off...'; }
  else { pts = 0; emoji = '😬'; msg = 'Way off! Practice more!'; }

  mmState.score += pts;

  // Show result
  document.getElementById('mm-phase-guess').style.display = 'none';
  document.getElementById('mm-phase-result').style.display = 'block';

  const isLast = mmState.round >= mmState.total;
  const nextBtn = document.getElementById('mm-next-btn');
  if (nextBtn) nextBtn.textContent = isLast ? '🏁 See Results' : 'Next Round ➡️';

  document.getElementById('mm-result-content').innerHTML = `
    <div style="font-size:3rem;margin-bottom:.5rem">${emoji}</div>
    <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;margin-bottom:.4rem">${msg}</div>
    <div style="margin-bottom:.75rem">
      <span style="color:var(--text2)">Your guess: </span><strong>${guess} mm</strong>
      &nbsp;|&nbsp;
      <span style="color:var(--text2)">Actual: </span><strong style="color:#6366f1">${actual} mm</strong>
    </div>
    <div style="font-size:.88rem;color:var(--text2)">Off by <strong>${diff} mm</strong></div>
    <div style="margin-top:.6rem">
      <span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:.3rem .9rem;border-radius:20px;font-weight:700;font-size:1rem">+${pts} pts</span>
    </div>
    <div style="margin-top:.5rem;color:var(--text3);font-size:.82rem">Total: ${mmState.score} pts | Round ${mmState.round}/${mmState.total}</div>
  `;
}

function mmNextRound() {
  if (!mmState) return;
  if (mmState.round >= mmState.total) {
    mmEndGame();
    return;
  }
  mmState.round++;
  document.getElementById('mm-phase-result').style.display = 'none';
  document.getElementById('mm-phase-guess').style.display = 'block';
  mmNewRound();
}

function mmEndGame() {
  if (!mmState) return;
  document.getElementById('mm-phase-result').style.display = 'none';
  document.getElementById('mm-phase-end').style.display = 'block';

  const best = parseInt(localStorage.getItem('mm-best') || '0', 10);
  const isNew = mmState.score > best;
  if (isNew) localStorage.setItem('mm-best', mmState.score);

  const pct = Math.round((mmState.score / 1000) * 100);
  let grade, gEmoji;
  if (pct >= 90) { grade = 'S'; gEmoji = '🏆'; }
  else if (pct >= 75) { grade = 'A'; gEmoji = '🥇'; }
  else if (pct >= 55) { grade = 'B'; gEmoji = '🥈'; }
  else if (pct >= 35) { grade = 'C'; gEmoji = '🥉'; }
  else { grade = 'D'; gEmoji = '😅'; }

  document.getElementById('mm-end-content').innerHTML = `
    <div style="font-size:4rem;margin-bottom:.5rem">${gEmoji}</div>
    <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;margin-bottom:.3rem">Grade ${grade}</div>
    <div style="font-size:2rem;font-weight:800;color:#6366f1;margin-bottom:.3rem">${mmState.score} <span style="font-size:1rem;color:var(--text2)">/ 1000 pts</span></div>
    ${isNew ? '<div style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:.3rem .9rem;border-radius:20px;font-weight:700;margin-bottom:.5rem;display:inline-block">🆕 New High Score!</div>' : ''}
    <div style="color:var(--text2);font-size:.88rem">Accuracy: ${pct}% | Best ever: ${isNew ? mmState.score : best} pts</div>
  `;
  mmLoadBest();
}

// ══════════════════════════════════════
// CHESS WITH LEARNING GUIDANCE ♟️
// ══════════════════════════════════════

let chessState = null;

function renderChessGame() {
  const view = document.getElementById('game-view');
  view.innerHTML = `
  <div class="game-view-wrap">
    <div class="game-view-header">
      <button class="game-back-btn" onclick="navigate('games')">← Back</button>
      <h1 style="font-family:var(--font-display);font-size:1.05rem;font-weight:800">♟️ Chess</h1>
      <button class="game-control-btn" style="padding:.3rem .7rem;font-size:.78rem" onclick="chessNewGame()">New Game</button>
    </div>
    <div class="game-canvas-wrap" style="padding:.6rem;background:#1a0533;min-height:90vh">

      <!-- Mode select -->
      <div id="chess-setup" style="text-align:center;padding:1.5rem 1rem">
        <div style="font-size:3.5rem;margin-bottom:.5rem">♟️</div>
        <h2 style="font-family:var(--font-display);font-size:1.2rem;color:#ffd700;margin-bottom:.3rem">Chess</h2>
        <p style="color:#aaa;font-size:.85rem;margin-bottom:1rem">Play chess with move hints & guidance</p>
        <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin-bottom:1rem">
          <button class="game-control-btn" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:800;padding:.7rem 1.2rem;font-size:.95rem;min-width:120px" onclick="initChess('human')">
            👤 vs 👤<br><span style="font-size:.72rem;opacity:.85">2 Players</span>
          </button>
          <button class="game-control-btn" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:800;padding:.7rem 1.2rem;font-size:.95rem;min-width:120px" onclick="initChess('easy')">
            🤖 Easy<br><span style="font-size:.72rem;opacity:.85">Learn mode</span>
          </button>
          <button class="game-control-btn" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-weight:800;padding:.7rem 1.2rem;font-size:.95rem;min-width:120px" onclick="initChess('hard')">
            🤖 Hard<br><span style="font-size:.72rem;opacity:.85">Challenge</span>
          </button>
        </div>

        <!-- Learning guide -->
        <div style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:12px;padding:1rem;max-width:340px;margin:0 auto;text-align:left">
          <div style="font-weight:800;color:#ffd700;margin-bottom:.5rem;font-size:.9rem">♟️ Chess Basics</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;font-size:.75rem;color:#ccc">
            ${[
              ['♚ King','Moves 1 square any direction'],
              ['♛ Queen','Any direction, any distance'],
              ['♜ Rook','Straight lines (horizontal/vertical)'],
              ['♝ Bishop','Diagonal lines'],
              ['♞ Knight','L-shape: 2+1 squares'],
              ['♟ Pawn','Forward 1 (2 on first move), captures diagonally'],
            ].map(([p,d])=>`<div style="background:rgba(255,255,255,.05);border-radius:6px;padding:.35rem .45rem"><div style="font-size:1rem">${p}</div><div style="opacity:.75;font-size:.7rem">${d}</div></div>`).join('')}
          </div>
          <div style="margin-top:.6rem;font-size:.75rem;color:#aaa">
            <b style="color:#ffd700">Tips:</b> Control the center • Develop pieces early • Castle for king safety
          </div>
        </div>
      </div>

      <!-- Game screen -->
      <div id="chess-game" style="display:none">
        <div id="chess-status" style="text-align:center;font-weight:800;font-size:.85rem;margin-bottom:.4rem;color:#ffd700;min-height:1.1rem"></div>
        <div style="display:flex;justify-content:center">
          <div style="position:relative">
            <canvas id="chess-canvas" width="360" height="360" style="border-radius:8px;display:block;max-width:100%;width:min(100%,360px);touch-action:none"></canvas>
          </div>
        </div>
        <div id="chess-hint-box" style="margin-top:.5rem;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);border-radius:10px;padding:.55rem .75rem;font-size:.78rem;color:#c4b5fd;min-height:2.2rem;text-align:center"></div>
        <div style="display:flex;gap:.5rem;justify-content:center;margin-top:.5rem;flex-wrap:wrap">
          <button class="game-control-btn" onclick="chessToggleGuide()" style="font-size:.8rem;padding:.35rem .8rem">💡 Move Guide</button>
          <button class="game-control-btn" onclick="chessUndoMove()" style="font-size:.8rem;padding:.35rem .8rem">↩ Undo</button>
          <button class="game-control-btn" onclick="chessNewGame()" style="font-size:.8rem;padding:.35rem .8rem">🔄 Reset</button>
        </div>
        <div id="chess-guide-panel" style="display:none;margin-top:.5rem;background:rgba(0,0,0,.3);border-radius:10px;padding:.6rem;font-size:.75rem;color:#ccc;max-height:140px;overflow-y:auto">
          <b style="color:#ffd700">♟ Move Guide — Piece Rules</b><br>
          <b style="color:#fff">King ♚:</b> 1 sq any dir. Castle: move 2 sq toward rook (if neither moved).<br>
          <b style="color:#fff">Queen ♛:</b> Any direction, unlimited squares.<br>
          <b style="color:#fff">Rook ♜:</b> Horizontal or vertical, unlimited.<br>
          <b style="color:#fff">Bishop ♝:</b> Diagonal only, unlimited.<br>
          <b style="color:#fff">Knight ♞:</b> L-shape (2 forward 1 side). Jumps over pieces!<br>
          <b style="color:#fff">Pawn ♟:</b> Forward 1 sq (2 on first move). Captures diagonally. Promotes at last rank!<br><br>
          <b style="color:#ffd700">Strategy tips:</b><br>
          • Control the center (e4, d4, e5, d5)<br>
          • Develop knights before bishops<br>
          • Don't move same piece twice in opening<br>
          • Castle early to protect your king<br>
          • Connect your rooks
        </div>
        <div id="chess-move-list" style="margin-top:.4rem;display:flex;flex-wrap:wrap;gap:.25rem;padding:0 .2rem;max-height:60px;overflow-y:auto"></div>
      </div>
    </div>
  </div>`;
}

// ── Chess Engine ──

const CHESS_PIECES = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟',
};

function chessNewGame() {
  const setup = document.getElementById('chess-setup');
  const game = document.getElementById('chess-game');
  if (setup) setup.style.display = 'block';
  if (game) game.style.display = 'none';
  chessState = null;
}

function chessToggleGuide() {
  const el = document.getElementById('chess-guide-panel');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function initChess(mode) {
  document.getElementById('chess-setup').style.display = 'none';
  document.getElementById('chess-game').style.display = 'block';

  chessState = {
    mode,
    board: chessInitBoard(),
    turn: 'w',
    selected: null,
    validMoves: [],
    history: [],
    check: false,
    gameOver: false,
    guideOn: true,
    castling: { wK: true, wR0: true, wR7: true, bK: true, bR0: true, bR7: true },
    enPassant: null,
  };

  drawChessBoard();
  chessUpdateStatus();

  const canvas = document.getElementById('chess-canvas');
  if (canvas) {
    canvas.onclick = chessHandleClick;
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      chessHandleClick(e.changedTouches[0]);
    });
  }

  if (mode !== 'human' && chessState.turn === 'b') {
    setTimeout(chessAIMove, 600);
  }
}

function chessInitBoard() {
  const b = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow = ['R','N','B','Q','K','B','N','R'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = 'b' + backRow[c];
    b[1][c] = 'bP';
    b[6][c] = 'wP';
    b[7][c] = 'w' + backRow[c];
  }
  return b;
}

function drawChessBoard() {
  const canvas = document.getElementById('chess-canvas');
  if (!canvas || !chessState) return;
  const ctx = canvas.getContext('2d');
  const S = 360, CS = S / 8;

  ctx.clearRect(0, 0, S, S);

  // Board squares
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const light = (r + c) % 2 === 0;
      ctx.fillStyle = light ? '#f0d9b5' : '#b58863';
      ctx.fillRect(c * CS, r * CS, CS, CS);

      // Highlight selected
      if (chessState.selected && chessState.selected[0] === r && chessState.selected[1] === c) {
        ctx.fillStyle = 'rgba(255,215,0,0.55)';
        ctx.fillRect(c * CS, r * CS, CS, CS);
      }

      // Show valid moves
      if (chessState.validMoves.some(m => m[0] === r && m[1] === c)) {
        const hasEnemy = chessState.board[r][c] && chessState.board[r][c][0] !== chessState.turn;
        if (hasEnemy) {
          ctx.strokeStyle = 'rgba(255,80,80,0.85)';
          ctx.lineWidth = 3;
          ctx.strokeRect(c * CS + 2, r * CS + 2, CS - 4, CS - 4);
        } else {
          ctx.fillStyle = 'rgba(20,200,80,0.38)';
          ctx.beginPath();
          ctx.arc(c * CS + CS / 2, r * CS + CS / 2, CS * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // King in check highlight
      if (chessState.check) {
        const piece = chessState.board[r][c];
        if (piece && piece[1] === 'K' && piece[0] === chessState.turn) {
          ctx.fillStyle = 'rgba(255,0,0,0.4)';
          ctx.fillRect(c * CS, r * CS, CS, CS);
        }
      }

      // Piece
      const piece = chessState.board[r][c];
      if (piece) {
        ctx.font = `bold ${CS * 0.78}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Shadow for visibility
        ctx.fillStyle = piece[0] === 'w' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.12)';
        ctx.fillText(CHESS_PIECES[piece], c * CS + CS / 2 + 1.5, r * CS + CS / 2 + 1.5);
        ctx.fillStyle = piece[0] === 'w' ? '#fff' : '#1a1a1a';
        ctx.fillText(CHESS_PIECES[piece], c * CS + CS / 2, r * CS + CS / 2);
      }

      // Coord labels
      ctx.font = `${CS * 0.22}px sans-serif`;
      ctx.fillStyle = light ? '#b58863' : '#f0d9b5';
      if (c === 0) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(8 - r, c * CS + 2, r * CS + 2); }
      if (r === 7) { ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText('abcdefgh'[c], (c + 1) * CS - 2, (r + 1) * CS - 2); }
    }
  }
}

function chessHandleClick(e) {
  if (!chessState || chessState.gameOver) return;
  if (chessState.mode !== 'human' && chessState.turn === 'b') return;

  const canvas = document.getElementById('chess-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = 360 / rect.width;
  const scaleY = 360 / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;
  const CS = 360 / 8;
  const col = Math.floor(mx / CS);
  const row = Math.floor(my / CS);
  if (row < 0 || row > 7 || col < 0 || col > 7) return;

  const piece = chessState.board[row][col];

  // If a move is valid, execute it
  if (chessState.selected && chessState.validMoves.some(m => m[0] === row && m[1] === col)) {
    chessExecuteMove(chessState.selected[0], chessState.selected[1], row, col);
    return;
  }

  // Select piece
  if (piece && piece[0] === chessState.turn) {
    chessState.selected = [row, col];
    chessState.validMoves = chessGetMoves(row, col, true);
    chessShowHint(row, col, piece);
  } else {
    chessState.selected = null;
    chessState.validMoves = [];
    document.getElementById('chess-hint-box').textContent = '';
  }
  drawChessBoard();
}

function chessShowHint(row, col, piece) {
  const hints = {
    wK:'King: move 1 sq any direction. Long or short castle if not moved.',
    bK:'King: move 1 sq any direction. Long or short castle if not moved.',
    wQ:'Queen: slide any direction, any distance. Most powerful piece!',
    bQ:'Queen: slide any direction, any distance. Most powerful piece!',
    wR:'Rook: slide horizontally or vertically. Great for open files!',
    bR:'Rook: slide horizontally or vertically. Great for open files!',
    wB:'Bishop: slide diagonally. Stays on same color throughout.',
    bB:'Bishop: slide diagonally. Stays on same color throughout.',
    wN:'Knight: L-shape jump (2+1). Jumps over other pieces!',
    bN:'Knight: L-shape jump (2+1). Jumps over other pieces!',
    wP:'Pawn: forward 1 sq (2 on 1st move). Capture diagonally. Promotes at rank 8!',
    bP:'Pawn: forward 1 sq (2 on 1st move). Capture diagonally. Promotes at rank 1!',
  };
  const moves = chessState.validMoves.length;
  const el = document.getElementById('chess-hint-box');
  if (el) el.innerHTML = `<b style="color:#ffd700">${CHESS_PIECES[piece]}</b> ${hints[piece] || ''} — <b style="color:#a5f3fc">${moves} move${moves!==1?'s':''} available</b>`;
}

function chessGetMoves(row, col, filterCheck) {
  const board = chessState.board;
  const piece = board[row][col];
  if (!piece) return [];
  const color = piece[0];
  const type = piece[1];
  const moves = [];
  const opp = color === 'w' ? 'b' : 'w';

  function addMove(r, c) {
    if (r < 0 || r > 7 || c < 0 || c > 7) return false;
    if (board[r][c] && board[r][c][0] === color) return false;
    moves.push([r, c]);
    return !board[r][c]; // can continue sliding if empty
  }

  function slide(dr, dc) {
    let r = row + dr, c = col + dc;
    while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
      if (!addMove(r, c)) break;
      r += dr; c += dc;
    }
  }

  switch (type) {
    case 'P': {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      // Forward
      if (!board[row + dir]?.[col]) {
        moves.push([row + dir, col]);
        if (row === startRow && !board[row + 2 * dir]?.[col]) moves.push([row + 2 * dir, col]);
      }
      // Captures
      for (const dc of [-1, 1]) {
        const nr = row + dir, nc = col + dc;
        if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
          if (board[nr][nc] && board[nr][nc][0] === opp) moves.push([nr, nc]);
          // En passant
          if (chessState.enPassant && chessState.enPassant[0] === nr && chessState.enPassant[1] === nc) moves.push([nr, nc]);
        }
      }
      break;
    }
    case 'N':
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) addMove(row+dr, col+dc);
      break;
    case 'B':
      slide(-1,-1); slide(-1,1); slide(1,-1); slide(1,1);
      break;
    case 'R':
      slide(-1,0); slide(1,0); slide(0,-1); slide(0,1);
      break;
    case 'Q':
      slide(-1,-1); slide(-1,1); slide(1,-1); slide(1,1);
      slide(-1,0); slide(1,0); slide(0,-1); slide(0,1);
      break;
    case 'K': {
      for (const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) addMove(row+dr,col+dc);
      // Castling
      const backR = color === 'w' ? 7 : 0;
      if (row === backR && col === 4) {
        if (chessState.castling[color+'K'] && !board[backR][5] && !board[backR][6] && chessState.castling[color+'R7']) moves.push([backR, 6]);
        if (chessState.castling[color+'K'] && !board[backR][3] && !board[backR][2] && !board[backR][1] && chessState.castling[color+'R0']) moves.push([backR, 2]);
      }
      break;
    }
  }

  if (filterCheck) {
    return moves.filter(([tr, tc]) => !chessMoveExposesCheck(row, col, tr, tc, color));
  }
  return moves;
}

function chessMoveExposesCheck(fr, fc, tr, tc, color) {
  const board = chessState.board;
  const saved = board[tr][tc];
  const pieceS = board[fr][fc];
  board[tr][tc] = pieceS; board[fr][fc] = null;
  const exposed = chessIsInCheck(color, board);
  board[fr][fc] = pieceS; board[tr][tc] = saved;
  return exposed;
}

function chessIsInCheck(color, board) {
  let kr = -1, kc = -1;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === color + 'K') { kr = r; kc = c; }
  if (kr < 0) return false;
  const opp = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p[0] !== opp) continue;
      const savedSel = chessState.selected, savedMoves = chessState.validMoves;
      chessState.selected = null; chessState.validMoves = [];
      const tempBoard = chessState.board;
      chessState.board = board;
      const moves = chessGetMoves(r, c, false);
      chessState.board = tempBoard;
      chessState.selected = savedSel; chessState.validMoves = savedMoves;
      if (moves.some(m => m[0] === kr && m[1] === kc)) return true;
    }
  }
  return false;
}

function chessExecuteMove(fr, fc, tr, tc) {
  const board = chessState.board;
  const piece = board[fr][fc];
  const captured = board[tr][tc];
  const color = piece[0];
  const opp = color === 'w' ? 'b' : 'w';

  const notation = chessNotation(piece, fr, fc, tr, tc, captured);

  // En passant capture
  if (piece[1] === 'P' && chessState.enPassant && tr === chessState.enPassant[0] && tc === chessState.enPassant[1]) {
    board[fr][tc] = null;
  }

  // Move
  board[tr][tc] = piece;
  board[fr][fc] = null;

  // Set en passant
  chessState.enPassant = null;
  if (piece[1] === 'P' && Math.abs(tr - fr) === 2) {
    chessState.enPassant = [(fr + tr) / 2, tc];
  }

  // Castling move rook
  if (piece[1] === 'K') {
    chessState.castling[color + 'K'] = false;
    if (tc === 6) { board[tr][5] = board[tr][7]; board[tr][7] = null; }
    if (tc === 2) { board[tr][3] = board[tr][0]; board[tr][0] = null; }
  }
  if (piece[1] === 'R') {
    if (fc === 0) chessState.castling[color + 'R0'] = false;
    if (fc === 7) chessState.castling[color + 'R7'] = false;
  }

  // Pawn promotion
  if (piece[1] === 'P' && (tr === 0 || tr === 7)) {
    board[tr][tc] = color + 'Q';
    chessSetHintBox('♛ Pawn promoted to Queen!');
  }

  chessState.history.push({ fr, fc, tr, tc, piece, captured, board: JSON.parse(JSON.stringify(board)) });
  chessState.selected = null;
  chessState.validMoves = [];
  chessState.turn = opp;

  // Check detection
  chessState.check = chessIsInCheck(opp, board);

  // Move list
  chessAddMoveToList(notation, color);
  drawChessBoard();

  // Checkmate / stalemate
  if (chessHasNoMoves(opp)) {
    if (chessState.check) {
      chessSetStatus(`Checkmate! ${color === 'w' ? 'White' : 'Black'} wins! 🏆`);
      chessSetHintBox('♚ Checkmate! The king has no escape. Game over!');
    } else {
      chessSetStatus('Stalemate! It\'s a draw 🤝');
      chessSetHintBox('🤝 Stalemate — no legal moves. Draw!');
    }
    chessState.gameOver = true;
    return;
  }

  chessUpdateStatus();

  if (chessState.mode !== 'human' && chessState.turn === 'b' && !chessState.gameOver) {
    chessSetHintBox('🤖 AI thinking...');
    setTimeout(chessAIMove, 500);
  }
}

function chessHasNoMoves(color) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (chessState.board[r][c]?.[0] === color && chessGetMoves(r, c, true).length > 0) return false;
  }
  return true;
}

function chessAIMove() {
  if (!chessState || chessState.gameOver || chessState.turn !== 'b') return;
  const board = chessState.board;
  const allMoves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.[0] === 'b') {
        const moves = chessGetMoves(r, c, true);
        moves.forEach(m => allMoves.push({ fr: r, fc: c, tr: m[0], tc: m[1] }));
      }
    }
  }
  if (!allMoves.length) return;

  let chosen;
  if (chessState.mode === 'easy') {
    // Easy: mostly random but prefer captures
    const captures = allMoves.filter(m => board[m.tr][m.tc]);
    chosen = captures.length && Math.random() > 0.35
      ? captures[Math.floor(Math.random() * captures.length)]
      : allMoves[Math.floor(Math.random() * allMoves.length)];
  } else {
    // Hard: simple scoring (captures + center control)
    const pieceVal = { K: 0, Q: 9, R: 5, B: 3, N: 3, P: 1 };
    const centerBonus = (r, c) => [3,4].includes(r) && [3,4].includes(c) ? 0.5 : 0;
    const scored = allMoves.map(m => {
      let score = Math.random() * 0.3;
      if (board[m.tr][m.tc]) score += pieceVal[board[m.tr][m.tc][1]] || 0;
      score += centerBonus(m.tr, m.tc);
      return { ...m, score };
    });
    scored.sort((a, b) => b.score - a.score);
    chosen = scored[0];
  }

  chessExecuteMove(chosen.fr, chosen.fc, chosen.tr, chosen.tc);
}

function chessUndoMove() {
  if (!chessState || chessState.history.length < 1) return;
  const undoCount = chessState.mode !== 'human' ? 2 : 1;
  for (let i = 0; i < undoCount && chessState.history.length; i++) {
    const last = chessState.history.pop();
    chessState.board[last.fr][last.fc] = last.piece;
    chessState.board[last.tr][last.tc] = last.captured || null;
    chessState.turn = last.piece[0];
  }
  chessState.selected = null;
  chessState.validMoves = [];
  chessState.check = false;
  chessState.gameOver = false;
  drawChessBoard();
  chessUpdateStatus();
  chessSetHintBox('Move undone ↩');
}

function chessNotation(piece, fr, fc, tr, tc, captured) {
  const files = 'abcdefgh';
  const pName = piece[1] === 'P' ? '' : piece[1];
  const cap = captured ? 'x' : '';
  return `${pName}${captured && piece[1]==='P' ? files[fc] : ''}${cap}${files[tc]}${8-tr}`;
}

function chessAddMoveToList(notation, color) {
  const el = document.getElementById('chess-move-list');
  if (!el) return;
  const num = Math.ceil(chessState.history.length / 2);
  if (color === 'w') {
    const tag = document.createElement('span');
    tag.style.cssText = 'background:rgba(255,255,255,.12);border-radius:5px;padding:.15rem .4rem;font-size:.72rem;color:#e0e0e0;font-family:monospace';
    tag.textContent = `${num}. ${notation}`;
    tag.id = `cmove-${chessState.history.length}`;
    el.appendChild(tag);
  } else {
    const last = el.lastChild;
    if (last) last.textContent += ` ${notation}`;
  }
  el.scrollLeft = el.scrollWidth;
}

function chessUpdateStatus() {
  const turn = chessState.turn === 'w' ? 'White ♔' : 'Black ♚';
  let msg = `${turn}'s turn`;
  if (chessState.check) msg += ' — CHECK! ⚠️';
  if (chessState.mode !== 'human' && chessState.turn === 'b') msg = '🤖 AI thinking...';
  chessSetStatus(msg);
  if (!chessState.gameOver && chessState.mode !== 'human' && chessState.turn === 'w') {
    chessSetHintBox('Your turn! Click a piece to see its moves highlighted in green.');
  }
}

function chessSetStatus(msg) { const el = document.getElementById('chess-status'); if (el) el.textContent = msg; }
function chessSetHintBox(msg) { const el = document.getElementById('chess-hint-box'); if (el) el.innerHTML = msg; }

// ── CSS for fade-in animation (injected once) ──
(function() {
  if (!document.getElementById('chess-ludo-styles')) {
    const s = document.createElement('style');
    s.id = 'chess-ludo-styles';
    s.textContent = `
      @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
    `;
    document.head.appendChild(s);
  }
})();
