/* compiler.js — Multi-language Compiler Hub with AI Debug (Groq) */
'use strict';

// ── Language Config ─────────────────────────────────────────────────────────
const COMPILER_LANGS = [
  {
    id: 'html',
    label: 'HTML',
    icon: '🌐',
    color: '#e34c26',
    mode: 'html',
    runtime: 'browser',
    default: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center;
           align-items: center; height: 100vh; margin: 0;
           background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
    h1 { font-size: 2.5rem; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
  </style>
</head>
<body>
  <h1>👋 Hello, World!</h1>
</body>
</html>`,
  },
  {
    id: 'css',
    label: 'CSS',
    icon: '🎨',
    color: '#264de4',
    mode: 'css',
    runtime: 'browser',
    default: `/* CSS Preview — Edit styles below */
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0f0e17;
  font-family: 'Segoe UI', sans-serif;
}

.card {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  padding: 2rem 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(99,102,241,0.4);
  color: #fff;
  text-align: center;
  animation: fadeIn 0.6s ease;
}

h1 { margin: 0 0 0.5rem; font-size: 2rem; }
p  { margin: 0; opacity: 0.85; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
}`,
    cssPreviewHTML: `<div class="card"><h1>CSS Preview</h1><p>Edit the CSS on the left to see changes live!</p></div>`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    icon: '⚡',
    color: '#f7df1e',
    mode: 'js',
    runtime: 'browser',
    default: `// JavaScript Playground
function greet(name) {
  return \`Hello, \${name}! 🎉\`;
}

const languages = ['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'C', 'C++', 'React'];
console.log('Welcome to ToolHub Compilers!');
console.log(greet('Developer'));
console.log('\\nSupported languages:');
languages.forEach((lang, i) => console.log(\`  \${i + 1}. \${lang}\`));

// Try some math
const fibonacci = (n) => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);
console.log('\\nFibonacci sequence:');
console.log([...Array(10)].map((_, i) => fibonacci(i)).join(', '));`,
  },
  {
    id: 'react',
    label: 'React',
    icon: '⚛️',
    color: '#61dafb',
    mode: 'jsx',
    runtime: 'browser',
    default: `// React Component Preview
// Uses React 18 + Babel (loaded via CDN)

function Counter() {
  const [count, setCount] = React.useState(0);
  const [color, setColor] = React.useState('#6366f1');

  const colors = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6'];

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'#0f0e17', fontFamily:'sans-serif', color:'#fff'
    }}>
      <h1 style={{fontSize:'1.2rem', opacity:0.6, marginBottom:'0.5rem'}}>⚛️ React Counter</h1>
      <div style={{
        fontSize:'5rem', fontWeight:900, color,
        textShadow:\`0 0 30px \${color}88\`,
        transition:'color 0.3s'
      }}>{count}</div>
      <div style={{display:'flex', gap:'12px', marginTop:'1.5rem'}}>
        <button onClick={() => setCount(c => c - 1)} style={btnStyle('#ef4444')}>−</button>
        <button onClick={() => setCount(0)} style={btnStyle('#6b7280')}>Reset</button>
        <button onClick={() => setCount(c => c + 1)} style={btnStyle('#10b981')}>+</button>
      </div>
      <div style={{display:'flex', gap:'8px', marginTop:'1.5rem'}}>
        {colors.map(c => (
          <div key={c} onClick={() => setColor(c)} style={{
            width:28, height:28, borderRadius:'50%', background:c,
            cursor:'pointer', border: c===color ? '3px solid #fff' : '3px solid transparent',
            transition:'border 0.2s'
          }}/>
        ))}
      </div>
      <p style={{opacity:0.4, marginTop:'1rem', fontSize:'0.8rem'}}>Click colors to change theme</p>
    </div>
  );
}

function btnStyle(bg) {
  return {
    background:bg, border:'none', color:'#fff', padding:'0.6rem 1.4rem',
    borderRadius:10, fontSize:'1.2rem', cursor:'pointer', fontWeight:700,
    boxShadow:\`0 4px 15px \${bg}55\`
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(<Counter/>);`,
  },
  {
    id: 'python',
    label: 'Python',
    icon: '🐍',
    color: '#3776ab',
    mode: 'python',
    runtime: 'piston',
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    default: `# Python 3 — Runs on Piston API
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print("🐍 Python Compiler — ToolHub 5D")
print("=" * 35)

# Fibonacci
fib = fibonacci(10)
print(f"Fibonacci(10): {fib}")

# List comprehension
squares = [x**2 for x in range(1, 6)]
print(f"Squares 1-5: {squares}")

# Dictionary
langs = {"Python": "🐍", "JavaScript": "⚡", "Java": "☕", "C++": "⚙️"}
print("\\nLanguages:")
for lang, emoji in langs.items():
    print(f"  {emoji} {lang}")

# Simple class
class Calculator:
    def add(self, a, b): return a + b
    def multiply(self, a, b): return a * b

calc = Calculator()
print(f"\\n3 + 4 = {calc.add(3, 4)}")
print(f"3 × 4 = {calc.multiply(3, 4)}")`,
  },
  {
    id: 'java',
    label: 'Java',
    icon: '☕',
    color: '#f89820',
    mode: 'java',
    runtime: 'piston',
    pistonLang: 'java',
    pistonVersion: '15.0.2',
    default: `// Java — Runs on Piston API
import java.util.*;

public class Main {
    static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }

    public static void main(String[] args) {
        System.out.println("☕ Java Compiler — ToolHub 5D");
        System.out.println("=".repeat(35));

        // Fibonacci
        System.out.print("Fibonacci: ");
        for (int i = 0; i < 10; i++) {
            System.out.print(fibonacci(i) + (i < 9 ? ", " : "\\n"));
        }

        // ArrayList
        List<String> langs = new ArrayList<>(Arrays.asList("Python","JavaScript","Java","C++","React"));
        System.out.println("\\nLanguages:");
        langs.forEach(l -> System.out.println("  • " + l));

        // Simple math
        int sum = 0;
        for (int i = 1; i <= 100; i++) sum += i;
        System.out.println("\\nSum 1 to 100 = " + sum);
    }
}`,
  },
  {
    id: 'c',
    label: 'C',
    icon: '⚙️',
    color: '#a8b9cc',
    mode: 'c',
    runtime: 'piston',
    pistonLang: 'c',
    pistonVersion: '10.2.0',
    default: `// C — Runs on Piston API
#include <stdio.h>
#include <string.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int isPrime(int n) {
    if (n < 2) return 0;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return 0;
    return 1;
}

int main() {
    printf("⚙️  C Compiler — ToolHub 5D\\n");
    printf("%-35s\\n", "===================================");

    // Fibonacci
    printf("Fibonacci: ");
    for (int i = 0; i < 10; i++)
        printf("%d%s", fibonacci(i), i < 9 ? ", " : "\\n");

    // Primes
    printf("\\nPrimes up to 50: ");
    for (int i = 2; i <= 50; i++)
        if (isPrime(i)) printf("%d ", i);
    printf("\\n");

    // String ops
    char str[] = "ToolHub 5D";
    printf("\\nString: %s (length: %lu)\\n", str, strlen(str));

    return 0;
}`,
  },
  {
    id: 'cpp',
    label: 'C++',
    icon: '🔧',
    color: '#00599c',
    mode: 'cpp',
    runtime: 'piston',
    pistonLang: 'c++',
    pistonVersion: '10.2.0',
    default: `// C++ — Runs on Piston API
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

class Stack {
    vector<int> data;
public:
    void push(int v) { data.push_back(v); }
    int pop() { int v = data.back(); data.pop_back(); return v; }
    bool empty() { return data.empty(); }
    int size() { return data.size(); }
};

int main() {
    cout << "🔧 C++ Compiler — ToolHub 5D" << endl;
    cout << string(35, '=') << endl;

    // Fibonacci
    cout << "Fibonacci: ";
    for (int i = 0; i < 10; i++)
        cout << fibonacci(i) << (i < 9 ? ", " : "\\n");

    // Vector + sort
    vector<int> nums = {5, 2, 8, 1, 9, 3, 7, 4, 6};
    sort(nums.begin(), nums.end());
    cout << "\\nSorted: ";
    for (int n : nums) cout << n << " ";
    cout << endl;

    // Custom Stack
    Stack s;
    for (int i = 1; i <= 5; i++) s.push(i * 10);
    cout << "\\nStack pop order: ";
    while (!s.empty()) cout << s.pop() << " ";
    cout << endl;

    return 0;
}`,
  },
];

// ── State ────────────────────────────────────────────────────────────────────
let currentLang = COMPILER_LANGS[0];
let editorEl = null;
let outputEl = null;
let aiPanelEl = null;
let lastError = '';
let isRunning = false;
let isAiLoading = false;

// ── Render Entry Point ───────────────────────────────────────────────────────
function renderCompilers() {
  const view = document.getElementById('compilers-view');
  if (!view) return;

  view.innerHTML = `
  <div class="compiler-hub">
    <!-- Header -->
    <div class="compiler-header">
      <div class="compiler-header-left">
        <h1 class="compiler-title">⚡ Compiler Hub</h1>
        <p class="compiler-subtitle">Write, run & debug code with AI — all in your browser</p>
      </div>
    </div>

    <!-- Language Tabs -->
    <div class="compiler-tabs" id="compiler-tabs">
      ${COMPILER_LANGS.map(l => `
        <button class="compiler-tab ${l.id === currentLang.id ? 'active' : ''}"
          data-lang="${l.id}" onclick="switchCompilerLang('${l.id}')"
          style="--lang-color:${l.color}">
          <span class="ct-icon">${l.icon}</span>
          <span class="ct-label">${l.label}</span>
        </button>`).join('')}
    </div>

    <!-- Main IDE -->
    <div class="compiler-ide">
      <!-- Editor Panel -->
      <div class="compiler-editor-panel">
        <div class="compiler-panel-bar">
          <span class="cpb-lang">
            <span id="cpb-icon">${currentLang.icon}</span>
            <span id="cpb-name">${currentLang.label}</span>
          </span>
          <div class="cpb-actions">
            <button class="cpb-btn cpb-clear" onclick="clearCompilerEditor()" title="Clear editor">🗑️ Clear</button>
            <button class="cpb-btn cpb-copy"  onclick="copyCompilerCode()"   title="Copy code">📋 Copy</button>
            <button class="cpb-btn cpb-run"   onclick="runCompilerCode()"    id="run-btn">▶ Run</button>
          </div>
        </div>
        <div class="compiler-editor-wrap">
          <div class="line-numbers" id="line-numbers">1</div>
          <textarea
            class="compiler-editor"
            id="compiler-editor"
            spellcheck="false"
            autocorrect="off"
            autocapitalize="off"
            placeholder="Write your code here..."
          >${currentLang.default}</textarea>
        </div>
      </div>

      <!-- Output Panel -->
      <div class="compiler-output-panel">
        <div class="compiler-panel-bar">
          <span class="cpb-lang">📤 Output</span>
          <div class="cpb-actions">
            <button class="cpb-btn" onclick="clearCompilerOutput()" title="Clear output">🗑️ Clear</button>
            <button class="cpb-btn cpb-ai-debug" onclick="toggleAiDebug()" id="ai-debug-btn" style="display:none">
              🤖 AI Debug
            </button>
          </div>
        </div>
        <div class="compiler-output" id="compiler-output">
          <div class="output-placeholder">
            <div class="op-icon">▶</div>
            <div class="op-text">Click <strong>Run</strong> to execute your code</div>
          </div>
        </div>

        <!-- AI Debug Panel -->
        <div class="ai-debug-panel" id="ai-debug-panel" style="display:none">
          <div class="ai-debug-header">
            <span>🤖 AI Debug Assistant <span class="ai-model-tag">Groq · Llama 3.3</span></span>
            <button onclick="closeAiDebug()" class="ai-debug-close">✕</button>
          </div>
          <div class="ai-debug-messages" id="ai-debug-messages"></div>
          <div class="ai-debug-input-wrap">
            <input type="text" id="ai-debug-input" class="ai-debug-input"
              placeholder="Ask about your error or code..."
              onkeydown="if(event.key==='Enter') sendAiDebug()">
            <button onclick="sendAiDebug()" class="ai-debug-send" id="ai-debug-send">Send</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Bar -->
    <div class="compiler-info-bar">
      <span id="compiler-status" class="ci-status">Ready</span>
      <span class="ci-sep">·</span>
      <span id="compiler-lines">Lines: ${currentLang.default.split('\n').length}</span>
      <span class="ci-sep">·</span>
      <span id="compiler-chars">Chars: ${currentLang.default.length}</span>
      <span class="ci-sep">·</span>
      <span class="ci-runtime">${currentLang.runtime === 'browser' ? '🌐 Browser' : '🖥️ Piston API'}</span>
    </div>
  </div>`;

  editorEl = document.getElementById('compiler-editor');
  outputEl = document.getElementById('compiler-output');
  aiPanelEl = document.getElementById('ai-debug-panel');

  // Wire up editor events
  editorEl.addEventListener('input', onEditorInput);
  editorEl.addEventListener('keydown', onEditorKeydown);
  editorEl.addEventListener('scroll', syncLineNumbers);
  updateLineNumbers();
}

// ── Language Switch ──────────────────────────────────────────────────────────
function switchCompilerLang(id) {
  const lang = COMPILER_LANGS.find(l => l.id === id);
  if (!lang || lang.id === currentLang.id) return;
  currentLang = lang;

  // Update tabs
  document.querySelectorAll('.compiler-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.lang === id);
  });

  // Update panel bar
  document.getElementById('cpb-icon').textContent = lang.icon;
  document.getElementById('cpb-name').textContent  = lang.label;

  // Reset editor
  editorEl.value = lang.default;
  updateLineNumbers();
  updateInfoBar();

  // Clear output
  outputEl.innerHTML = `<div class="output-placeholder"><div class="op-icon">▶</div><div class="op-text">Click <strong>Run</strong> to execute your code</div></div>`;
  closeAiDebug();
  document.getElementById('ai-debug-btn').style.display = 'none';

  // Update runtime badge
  document.querySelector('.ci-runtime').textContent = lang.runtime === 'browser' ? '🌐 Browser' : '🖥️ Piston API';
}

// ── Run Code ─────────────────────────────────────────────────────────────────
async function runCompilerCode() {
  if (isRunning) return;
  const code = editorEl.value.trim();
  if (!code) return;

  isRunning = true;
  const btn = document.getElementById('run-btn');
  btn.textContent = '⏳ Running...';
  btn.disabled = true;
  setStatus('Running…');

  outputEl.innerHTML = `<div class="output-running"><div class="run-spinner"></div><span>Executing ${currentLang.label} code…</span></div>`;
  document.getElementById('ai-debug-btn').style.display = 'none';
  closeAiDebug();
  lastError = '';

  try {
    if (currentLang.runtime === 'browser') {
      await runBrowserCode(code);
    } else {
      await runPistonCode(code);
    }
  } catch (e) {
    showCompilerError('Unexpected error: ' + e.message);
  }

  btn.textContent = '▶ Run';
  btn.disabled = false;
  isRunning = false;
  setStatus('Done');
}

// ── Browser Runtime (HTML, CSS, JS, React) ──────────────────────────────────
async function runBrowserCode(code) {
  const lang = currentLang.id;

  if (lang === 'html') {
    try {
      outputEl.innerHTML = `<iframe class="compiler-iframe" sandbox="allow-scripts allow-same-origin" srcdoc=""></iframe>`;
      const iframe = outputEl.querySelector('iframe');
      iframe.srcdoc = code;
      setStatus('HTML rendered');
    } catch (e) {
      showCompilerError(e.message);
    }

  } else if (lang === 'css') {
    const htmlWrap = `<!DOCTYPE html><html><head><style>${code}</style></head><body>${currentLang.cssPreviewHTML}</body></html>`;
    outputEl.innerHTML = `<iframe class="compiler-iframe" sandbox="allow-scripts" srcdoc=""></iframe>`;
    const iframe = outputEl.querySelector('iframe');
    iframe.srcdoc = htmlWrap;
    setStatus('CSS rendered');

  } else if (lang === 'javascript') {
    runJavaScript(code);

  } else if (lang === 'react') {
    runReact(code);
  }
}

function runJavaScript(code) {
  const logs = [];
  const errors = [];

  const fakeConsole = {
    log:   (...a) => logs.push({ type: 'log',   text: a.map(stringify).join(' ') }),
    error: (...a) => logs.push({ type: 'error', text: a.map(stringify).join(' ') }),
    warn:  (...a) => logs.push({ type: 'warn',  text: a.map(stringify).join(' ') }),
    info:  (...a) => logs.push({ type: 'info',  text: a.map(stringify).join(' ') }),
  };

  try {
    const fn = new Function('console', code);
    fn(fakeConsole);
    renderConsoleOutput(logs);
    setStatus(`✅ ${logs.length} line(s) of output`);
  } catch (e) {
    lastError = e.message;
    renderConsoleOutput(logs);
    showCompilerError(e.message, true);
  }
}

function runReact(code) {
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>*{margin:0;padding:0;box-sizing:border-box;}</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
${code}
<\/script>
</body>
</html>`;
  outputEl.innerHTML = `<iframe class="compiler-iframe" sandbox="allow-scripts" srcdoc=""></iframe>`;
  outputEl.querySelector('iframe').srcdoc = fullHtml;
  setStatus('React rendered');
}

// ── Piston Runtime (Python, Java, C, C++) ────────────────────────────────────
async function runPistonCode(code) {
  const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
  const lang = currentLang;

  try {
    const res = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang.pistonLang,
        version: lang.pistonVersion,
        files: [{ name: getFileName(lang), content: code }],
        stdin: '',
        args: [],
        compile_timeout: 20000,
        run_timeout: 10000,
      }),
    });

    if (!res.ok) throw new Error(`Piston API error: ${res.status}`);
    const data = await res.json();

    const compileOut = data.compile?.output || '';
    const runOut     = data.run?.output || '';
    const combined   = (compileOut + runOut).trim();

    if (data.compile?.code !== undefined && data.compile.code !== 0) {
      lastError = compileOut;
      showCompilerError(compileOut, true);
      return;
    }
    if (data.run?.code !== 0 && data.run?.stderr) {
      lastError = data.run.stderr;
      const stdout = data.run.stdout;
      if (stdout) renderTextOutput(stdout, true);
      showCompilerError(data.run.stderr, true);
      return;
    }

    if (combined) {
      renderTextOutput(combined);
      setStatus(`✅ Exited with code ${data.run?.code ?? 0}`);
    } else {
      outputEl.innerHTML = `<div class="output-empty">⚪ Program ran with no output</div>`;
      setStatus('✅ Done (no output)');
    }
  } catch (e) {
    if (e.message.includes('fetch')) {
      showCompilerError('Could not reach Piston API. Check your internet connection.');
    } else {
      showCompilerError(e.message);
    }
  }
}

function getFileName(lang) {
  const map = { python: 'main.py', java: 'Main.java', 'c': 'main.c', 'c++': 'main.cpp' };
  return map[lang.pistonLang] || 'main.txt';
}

// ── Output Renderers ─────────────────────────────────────────────────────────
function renderConsoleOutput(logs) {
  if (!logs.length) {
    outputEl.innerHTML = `<div class="output-empty">⚪ No console output</div>`;
    return;
  }
  outputEl.innerHTML = `<div class="console-output">${logs.map(l =>
    `<div class="co-line co-${l.type}"><span class="co-prefix">${prefixFor(l.type)}</span><span class="co-text">${escHtml(l.text)}</span></div>`
  ).join('')}</div>`;
}

function renderTextOutput(text, hasMore = false) {
  const lines = text.split('\n');
  outputEl.innerHTML = `<div class="console-output">${lines.map(l =>
    `<div class="co-line co-log"><span class="co-prefix">›</span><span class="co-text">${escHtml(l)}</span></div>`
  ).join('')}</div>`;
}

function showCompilerError(msg, showAiBtn = false) {
  const existing = outputEl.querySelector('.console-output');
  const errHtml = `<div class="output-error-block">
    <div class="oeb-header">❌ Error</div>
    <pre class="oeb-msg">${escHtml(msg)}</pre>
    ${showAiBtn ? `<button class="oeb-ai-btn" onclick="openAiDebugWithError()">🤖 Fix with AI</button>` : ''}
  </div>`;

  if (existing) {
    existing.insertAdjacentHTML('afterend', errHtml);
  } else {
    outputEl.innerHTML = errHtml;
  }

  if (showAiBtn) {
    document.getElementById('ai-debug-btn').style.display = 'flex';
  }
  setStatus('❌ Error');
}

function prefixFor(type) {
  return { log: '›', error: '✖', warn: '⚠', info: 'ℹ' }[type] || '›';
}

// ── AI Debug Panel ──────────────────────────────────────────────────────────
function toggleAiDebug() {
  const panel = document.getElementById('ai-debug-panel');
  if (panel.style.display === 'none') {
    openAiDebugWithError();
  } else {
    closeAiDebug();
  }
}

function openAiDebugWithError() {
  const panel = document.getElementById('ai-debug-panel');
  panel.style.display = 'flex';

  const msgs = document.getElementById('ai-debug-messages');
  if (!msgs.children.length && lastError) {
    addAiMessage('bot', `👋 I see your **${currentLang.label}** code has an error. Let me analyze it and suggest a fix!`);
    askGroqDebug(
      `I'm writing ${currentLang.label} code and got this error:\n\n\`\`\`\n${lastError}\n\`\`\`\n\nMy code:\n\`\`\`${currentLang.mode}\n${editorEl.value}\n\`\`\`\n\nPlease explain the error clearly and provide a corrected version of the code.`
    );
  }
}

function closeAiDebug() {
  if (aiPanelEl) aiPanelEl.style.display = 'none';
}

function sendAiDebug() {
  const input = document.getElementById('ai-debug-input');
  const msg = input.value.trim();
  if (!msg || isAiLoading) return;
  input.value = '';

  addAiMessage('user', msg);

  const context = lastError
    ? `Context — Language: ${currentLang.label}, Error: ${lastError}\n\nUser question: ${msg}`
    : `Context — Language: ${currentLang.label}, Code:\n\`\`\`${currentLang.mode}\n${editorEl.value.slice(0, 800)}\n\`\`\`\n\nUser question: ${msg}`;

  askGroqDebug(context);
}

async function askGroqDebug(prompt) {
  if (isAiLoading) return;
  isAiLoading = true;

  const sendBtn = document.getElementById('ai-debug-send');
  if (sendBtn) sendBtn.disabled = true;

  const thinkingId = 'ai-thinking-' + Date.now();
  const msgs = document.getElementById('ai-debug-messages');
  msgs.insertAdjacentHTML('beforeend', `
    <div class="ai-msg ai-msg-bot" id="${thinkingId}">
      <span class="ai-msg-avatar">🤖</span>
      <div class="ai-msg-bubble ai-thinking">
        <span></span><span></span><span></span>
      </div>
    </div>`);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    const res = await fetch(getFunctionEndpoint('groq-chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `You are an expert code debugger and programming tutor. The user is using ToolHub 5D's compiler. Be concise, technical, and helpful. Format code with markdown code blocks.\n\n${prompt}`,
        model: 'openai/gpt-oss-120b',
      }),
    });

    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();

    if (!res.ok) throw new Error('AI service error');
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    addAiMessage('bot', data.reply || 'No response from AI.');
  } catch (e) {
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();
    addAiMessage('bot', `⚠️ Could not reach AI: ${e.message}`);
  }

  isAiLoading = false;
  if (sendBtn) sendBtn.disabled = false;
}

function addAiMessage(role, text) {
  const msgs = document.getElementById('ai-debug-messages');
  if (!msgs) return;

  const isBot = role === 'bot';
  const formatted = isBot ? markdownToHtml(text) : escHtml(text);

  msgs.insertAdjacentHTML('beforeend', `
    <div class="ai-msg ai-msg-${role}">
      ${isBot ? '<span class="ai-msg-avatar">🤖</span>' : ''}
      <div class="ai-msg-bubble">${formatted}</div>
      ${!isBot ? '<span class="ai-msg-avatar ai-user-avatar">👤</span>' : ''}
    </div>`);
  msgs.scrollTop = msgs.scrollHeight;
}

function markdownToHtml(text) {
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="ai-code-block"><code>${escHtml(code.trim())}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3} (.+)$/gm, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// ── Editor Helpers ───────────────────────────────────────────────────────────
function onEditorInput() {
  updateLineNumbers();
  updateInfoBar();
}

function onEditorKeydown(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = editorEl.selectionStart, end = editorEl.selectionEnd;
    editorEl.value = editorEl.value.slice(0, s) + '  ' + editorEl.value.slice(end);
    editorEl.selectionStart = editorEl.selectionEnd = s + 2;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    const s = editorEl.selectionStart;
    const lines = editorEl.value.slice(0, s).split('\n');
    const currLine = lines[lines.length - 1];
    const indent = currLine.match(/^(\s*)/)[1];
    const needsExtra = /[{(\[:]$/.test(currLine.trimEnd());
    const ins = '\n' + indent + (needsExtra ? '  ' : '');
    editorEl.value = editorEl.value.slice(0, s) + ins + editorEl.value.slice(editorEl.selectionEnd);
    editorEl.selectionStart = editorEl.selectionEnd = s + ins.length;
    updateLineNumbers();
  }
  // Run on Ctrl/Cmd+Enter
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runCompilerCode();
  }
}

function syncLineNumbers() {
  const ln = document.getElementById('line-numbers');
  if (ln) ln.scrollTop = editorEl.scrollTop;
}

function updateLineNumbers() {
  const ln = document.getElementById('line-numbers');
  if (!ln) return;
  const count = (editorEl.value.match(/\n/g) || []).length + 1;
  ln.innerHTML = Array.from({ length: count }, (_, i) => i + 1).join('<br>');
}

function updateInfoBar() {
  const lines = editorEl.value.split('\n').length;
  const chars = editorEl.value.length;
  const ls = document.getElementById('compiler-lines');
  const cs = document.getElementById('compiler-chars');
  if (ls) ls.textContent = `Lines: ${lines}`;
  if (cs) cs.textContent = `Chars: ${chars}`;
}

function setStatus(msg) {
  const s = document.getElementById('compiler-status');
  if (s) s.textContent = msg;
}

function clearCompilerEditor() {
  if (editorEl) { editorEl.value = ''; updateLineNumbers(); updateInfoBar(); }
}

function clearCompilerOutput() {
  if (outputEl) outputEl.innerHTML = `<div class="output-placeholder"><div class="op-icon">▶</div><div class="op-text">Click <strong>Run</strong> to execute your code</div></div>`;
  document.getElementById('ai-debug-btn').style.display = 'none';
  closeAiDebug();
}

function copyCompilerCode() {
  if (!editorEl) return;
  navigator.clipboard.writeText(editorEl.value).then(() => {
    const btn = document.querySelector('.cpb-copy');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy', 1500); }
  });
}

// ── Utilities ────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function stringify(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'object') { try { return JSON.stringify(v, null, 2); } catch { return String(v); } }
  return String(v);
}
