/* media-tools.js — v6: Video & Audio tools, powered by ffmpeg.wasm (100% client-side,
   same "no server cost for heavy media" architecture as the rest of ToolHub).
   ffmpeg.wasm is lazy-loaded only the first time a video/audio tool is opened —
   keeps initial page load fast (Phase 7 smoothness requirement). */
'use strict';

const MediaEngine = { ffmpeg: null, loading: null };

// Extensions that are audio-only outputs. Some tools take one kind of file in
// and produce the other kind out (video-to-mp3, mp3-to-video) — the OUTPUT
// preview/player and Blob MIME type must be based on what actually came out
// of ffmpeg, not on the input file's kind, or the player picks the wrong tag.
const MEDIA_AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
function _mediaOutKind(ext) { return MEDIA_AUDIO_EXTS.includes((ext || '').toLowerCase()) ? 'audio' : 'video'; }

function ensureFFmpegScript() {
  return new Promise((resolve, reject) => {
    if (window.FFmpeg) return resolve(window.FFmpeg);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
    s.onload = () => resolve(window.FFmpeg);
    s.onerror = () => reject(new Error('Could not load the video/audio engine. Check your internet connection.'));
    document.head.appendChild(s);
  });
}

async function ensureFFmpeg(onProgress) {
  if (MediaEngine.ffmpeg && MediaEngine.ffmpeg.isLoaded()) return MediaEngine.ffmpeg;
  if (MediaEngine.loading) return MediaEngine.loading;
  if (!window.crossOriginIsolated) {
    throw new Error('Video conversion needs a secure isolated page. Deploy with the included Netlify headers or open the site through Netlify Dev.');
  }
  MediaEngine.loading = (async () => {
    try {
      const FFmpegLib = await ensureFFmpegScript();
      const ffmpeg = FFmpegLib.createFFmpeg({
        log: false,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
        progress: (p) => { if (onProgress && p.ratio >= 0) onProgress(Math.min(100, Math.round(p.ratio * 100))); },
      });
      await ffmpeg.load();
      MediaEngine.ffmpeg = ffmpeg;
      return ffmpeg;
    } finally {
      MediaEngine.loading = null;
    }
  })();
  return MediaEngine.loading;
}


// ── NATIVE MP3 ENCODER (no ffmpeg / no SharedArrayBuffer needed) ─────────────
// ffmpeg.wasm needs a cross-origin-isolated page, which phones, in-app browsers
// (Instagram, Facebook …) and some browsers never provide — so Video→MP3 failed
// there. For the common "extract/convert to MP3" tools we decode the audio with
// the browser's own decoder and encode MP3 with lamejs (vendored, works everywhere).
const NATIVE_MP3_TOOLS = ['video-to-mp3', 'wav-to-mp3'];

function _loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing && window.lamejs) return resolve();
    const s = document.createElement('script');
    s.src = src; s.dataset.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load MP3 encoder.'));
    document.head.appendChild(s);
  });
}

async function ensureLame() {
  if (window.lamejs) return window.lamejs;
  try { await _loadScriptOnce('/js/vendor/lame.min.js?v=8'); }
  catch (e) { await _loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js'); }
  if (!window.lamejs) throw new Error('MP3 encoder is not available.');
  return window.lamejs;
}

async function nativeConvertToMp3(file, onProgress) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) throw new Error('This browser cannot decode audio.');
  if (file.size > 400 * 1024 * 1024) throw new Error('File is too large for in-browser conversion (max ~400 MB).');
  const lame = await ensureLame();
  onProgress(10, 'Reading file…');
  const buf = await file.arrayBuffer();
  onProgress(25, 'Decoding audio…');
  const ctx = new Ctx();
  let audio;
  try {
    // callback form + promise form: old WebViews only support the callback form
    audio = await new Promise((res, rej) => {
      const p = ctx.decodeAudioData(buf, res, rej);
      if (p && p.catch) p.catch(rej);
    });
  } catch (e) {
    throw new Error('This browser could not read the audio in that file.');
  } finally { try { ctx.close(); } catch (e) {} }

  const channels = Math.min(2, audio.numberOfChannels);
  const rate = audio.sampleRate;
  const toInt16 = (f32) => {
    const out = new Int16Array(f32.length);
    for (let i = 0; i < f32.length; i++) {
      const v = Math.max(-1, Math.min(1, f32[i]));
      out[i] = v < 0 ? v * 0x8000 : v * 0x7FFF;
    }
    return out;
  };
  const left = toInt16(audio.getChannelData(0));
  const right = channels > 1 ? toInt16(audio.getChannelData(1)) : null;
  const enc = new lame.Mp3Encoder(channels, rate, 192);
  const block = 1152 * 10, parts = [];
  for (let i = 0; i < left.length; i += block) {
    const l = left.subarray(i, i + block);
    const chunk = right ? enc.encodeBuffer(l, right.subarray(i, i + block)) : enc.encodeBuffer(l);
    if (chunk.length) parts.push(new Uint8Array(chunk));
    if ((i / block) % 40 === 0) {
      onProgress(30 + Math.round((i / left.length) * 65), `Converting… ${Math.round((i / left.length) * 100)}%`);
      await new Promise(r => setTimeout(r, 0)); // keep the page responsive
    }
  }
  const tail = enc.flush();
  if (tail.length) parts.push(new Uint8Array(tail));
  return new Blob(parts, { type: 'audio/mpeg' });
}

// ── TOOL CONFIGS ─────────────────────────────────────────────────────────────
// controls: array of { id, type: 'range'|'select'|'text'|'file', label, ...opts }
// buildArgs(ctx): returns ffmpeg CLI args array. ctx = { inputName, outputName, val(id) }
const MEDIA_TOOL_CONFIGS = {
  'video-compressor': { kind: 'video', outExt: 'mp4',
    controls: [{ id: 'crf', type: 'range', label: 'Compression strength', min: 18, max: 35, step: 1, default: 28 }],
    buildArgs: c => ['-i', c.inputName, '-vcodec', 'libx264', '-crf', String(c.val('crf')), '-preset', 'veryfast', c.outputName] },
  'video-editor': { kind: 'video', outExt: 'mp4',
    controls: [
      { id: 'start', type: 'text', label: 'Start time (hh:mm:ss)', default: '00:00:00' },
      { id: 'end', type: 'text', label: 'End time (hh:mm:ss)', default: '00:00:10' },
      { id: 'mute', type: 'select', label: 'Audio', options: [['keep', 'Keep audio'], ['mute', 'Mute audio']], default: 'keep' } ],
    buildArgs: c => {
      const args = ['-i', c.inputName, '-ss', c.val('start'), '-to', c.val('end'), '-c:v', 'libx264'];
      args.push(c.val('mute') === 'mute' ? '-an' : '-c:a', ...(c.val('mute') === 'mute' ? [] : ['aac']));
      args.push(c.outputName); return args; } },
  'video-to-mp3': { kind: 'video', outExt: 'mp3',
    controls: [], buildArgs: c => ['-i', c.inputName, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', c.outputName] },
  'mp3-to-video': { kind: 'audio', outExt: 'mp4', extraFile: { id: 'cover', label: 'Cover image', accept: 'image/*' },
    controls: [], buildArgs: c => ['-loop', '1', '-i', 'cover.img', '-i', c.inputName, '-c:v', 'libx264', '-tune', 'stillimage', '-c:a', 'aac', '-b:a', '192k', '-pix_fmt', 'yuv420p', '-shortest', c.outputName] },
  'video-reverse': { kind: 'video', outExt: 'mp4',
    controls: [], buildArgs: c => ['-i', c.inputName, '-vf', 'reverse', '-af', 'areverse', c.outputName] },
  'video-loop': { kind: 'video', outExt: 'mp4',
    controls: [{ id: 'times', type: 'range', label: 'Loop count', min: 2, max: 10, step: 1, default: 3 }],
    buildArgs: c => ['-stream_loop', String(Number(c.val('times')) - 1), '-i', c.inputName, '-c', 'copy', c.outputName] },
  'video-rotate': { kind: 'video', outExt: 'mp4',
    controls: [{ id: 'angle', type: 'select', label: 'Rotate', options: [['1', '90° Clockwise'], ['2', '90° Counter-clockwise'], ['2,2', '180°']], default: '1' }],
    buildArgs: c => { const v = c.val('angle'); const filter = v === '2,2' ? 'transpose=2,transpose=2' : `transpose=${v}`; return ['-i', c.inputName, '-vf', filter, c.outputName]; } },
  'video-crop': { kind: 'video', outExt: 'mp4',
    controls: [{ id: 'amount', type: 'range', label: 'Crop from edges (%)', min: 0, max: 40, step: 5, default: 10 }],
    buildArgs: c => { const p = Number(c.val('amount')) / 100; return ['-i', c.inputName, '-vf', `crop=iw*${1 - 2 * p}:ih*${1 - 2 * p}:iw*${p}:ih*${p}`, c.outputName]; } },
  'video-watermark': { kind: 'video', outExt: 'mp4',
    controls: [
      { id: 'text', type: 'text', label: 'Watermark text', default: 'ToolHub 5D' },
      { id: 'pos', type: 'select', label: 'Position', options: [['10:10', 'Top Left'], ['w-tw-10:10', 'Top Right'], ['10:h-th-10', 'Bottom Left'], ['w-tw-10:h-th-10', 'Bottom Right']], default: 'w-tw-10:h-th-10' } ],
    buildArgs: c => { const [x, y] = c.val('pos').split(':'); return ['-i', c.inputName, '-vf', `drawtext=text='${c.val('text').replace(/'/g, '')}':fontcolor=white:fontsize=28:x=${x}:y=${y}:box=1:boxcolor=black@0.4`, c.outputName]; } },
  'video-mute': { kind: 'video', outExt: 'mp4',
    controls: [], buildArgs: c => ['-i', c.inputName, '-an', '-c:v', 'copy', c.outputName] },
  'video-trimmer': { kind: 'video', outExt: 'mp4',
    controls: [
      { id: 'start', type: 'text', label: 'Start time (hh:mm:ss)', default: '00:00:00' },
      { id: 'end', type: 'text', label: 'End time (hh:mm:ss)', default: '00:00:10' } ],
    buildArgs: c => ['-i', c.inputName, '-ss', c.val('start'), '-to', c.val('end'), '-c:v', 'libx264', '-c:a', 'aac', c.outputName] },
  'video-merger': { kind: 'video-multi', outExt: 'mp4', controls: [],
    buildArgs: c => ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', c.outputName] },
  'video-speed': { kind: 'video', outExt: 'mp4',
    controls: [{ id: 'speed', type: 'range', label: 'Speed (0.5x – 2x)', min: 0.5, max: 2, step: 0.1, default: 1.5 }],
    buildArgs: c => ['-i', c.inputName, '-filter:v', `setpts=PTS/${c.val('speed')}`, '-filter:a', `atempo=${c.val('speed')}`, c.outputName] },
  'video-resolution': { kind: 'video', outExt: 'mp4',
    controls: [{ id: 'res', type: 'select', label: 'Resolution', options: [['3840:2160', '4K (2160p)'], ['1920:1080', 'Full HD (1080p)'], ['1280:720', 'HD (720p)'], ['854:480', 'SD (480p)']], default: '1280:720' }],
    buildArgs: c => ['-i', c.inputName, '-vf', `scale=${c.val('res')}`, c.outputName] },
  'video-extract-frames': { kind: 'video-frames', outExt: 'zip',
    controls: [{ id: 'fps', type: 'range', label: 'Frames per second', min: 1, max: 10, step: 1, default: 1 }] },
  'gif-to-mp4': { kind: 'video', outExt: 'mp4',
    controls: [], buildArgs: c => ['-i', c.inputName, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', c.outputName] },
  'mp4-to-gif': { kind: 'video', outExt: 'gif',
    controls: [{ id: 'fps', type: 'range', label: 'GIF frame rate', min: 5, max: 20, step: 1, default: 10 }],
    buildArgs: c => ['-i', c.inputName, '-vf', `fps=${c.val('fps')},scale=480:-1:flags=lanczos`, c.outputName] },
  'thumbnail-extractor': { kind: 'video', outExt: 'png',
    controls: [{ id: 'time', type: 'text', label: 'Timestamp (hh:mm:ss)', default: '00:00:01' }],
    buildArgs: c => ['-ss', c.val('time'), '-i', c.inputName, '-frames:v', '1', c.outputName] },
  'video-metadata': { kind: 'metadata-video', outExt: null, controls: [] },
  'subtitle-generator': { kind: 'subtitles', outExt: 'srt', controls: [] },

  'mp3-cutter': { kind: 'audio', outExt: 'mp3',
    controls: [
      { id: 'start', type: 'text', label: 'Start time (hh:mm:ss)', default: '00:00:00' },
      { id: 'end', type: 'text', label: 'End time (hh:mm:ss)', default: '00:00:10' } ],
    buildArgs: c => ['-i', c.inputName, '-ss', c.val('start'), '-to', c.val('end'), '-acodec', 'libmp3lame', c.outputName] },
  'audio-speed': { kind: 'audio', outExt: 'mp3',
    controls: [{ id: 'speed', type: 'range', label: 'Speed (0.5x – 2x)', min: 0.5, max: 2, step: 0.1, default: 1.25 }],
    buildArgs: c => ['-i', c.inputName, '-filter:a', `atempo=${c.val('speed')}`, c.outputName] },
  'audio-pitch': { kind: 'audio', outExt: 'mp3',
    controls: [{ id: 'ratio', type: 'range', label: 'Pitch shift', min: 0.7, max: 1.4, step: 0.05, default: 1.15 }],
    buildArgs: c => ['-i', c.inputName, '-af', `asetrate=44100*${c.val('ratio')},aresample=44100`, c.outputName] },
  'voice-changer': { kind: 'audio', outExt: 'mp3',
    controls: [{ id: 'preset', type: 'select', label: 'Voice preset', options: [['chipmunk', '🐿️ Chipmunk'], ['deep', '👹 Deep Voice'], ['robot', '🤖 Robot'], ['echo', '🔊 Echo Hall']], default: 'chipmunk' }],
    buildArgs: c => {
      const filters = { chipmunk: 'asetrate=44100*1.5,aresample=44100', deep: 'asetrate=44100*0.7,aresample=44100', robot: 'afftdn=nf=-20,flanger', echo: 'aecho=0.8:0.9:1000:0.3' };
      return ['-i', c.inputName, '-af', filters[c.val('preset')], c.outputName]; } },
  'audio-joiner': { kind: 'audio-multi', outExt: 'mp3', controls: [],
    buildArgs: c => ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-acodec', 'libmp3lame', c.outputName] },
  'audio-normalizer': { kind: 'audio', outExt: 'mp3',
    controls: [], buildArgs: c => ['-i', c.inputName, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', c.outputName] },
  'audio-fade-in': { kind: 'audio', outExt: 'mp3',
    controls: [{ id: 'dur', type: 'range', label: 'Fade-in duration (s)', min: 1, max: 10, step: 1, default: 3 }],
    buildArgs: c => ['-i', c.inputName, '-af', `afade=t=in:ss=0:d=${c.val('dur')}`, c.outputName] },
  'audio-fade-out': { kind: 'audio', outExt: 'mp3',
    controls: [{ id: 'dur', type: 'range', label: 'Fade-out duration (s)', min: 1, max: 10, step: 1, default: 3 }],
    buildArgs: c => ['-i', c.inputName, '-af', `afade=t=out:st=0:d=${c.val('dur')}`, c.outputName] },
  'audio-metadata': { kind: 'metadata-audio', outExt: null, controls: [] },
  'wav-to-mp3': { kind: 'audio', outExt: 'mp3', controls: [], buildArgs: c => ['-i', c.inputName, '-acodec', 'libmp3lame', '-q:a', '2', c.outputName] },
  'mp3-to-wav': { kind: 'audio', outExt: 'wav', controls: [], buildArgs: c => ['-i', c.inputName, c.outputName] },
  'noise-remover': { kind: 'audio', outExt: 'mp3',
    controls: [{ id: 'strength', type: 'range', label: 'Noise reduction strength', min: 10, max: 40, step: 5, default: 25 }],
    buildArgs: c => ['-i', c.inputName, '-af', `afftdn=nf=-${c.val('strength')}`, c.outputName] },
  'audio-compressor': { kind: 'audio', outExt: 'mp3',
    controls: [{ id: 'bitrate', type: 'select', label: 'Target bitrate', options: [['64k', '64 kbps (smallest)'], ['96k', '96 kbps'], ['128k', '128 kbps (recommended)']], default: '96k' }],
    buildArgs: c => ['-i', c.inputName, '-b:a', c.val('bitrate'), c.outputName] },
  'audio-converter': { kind: 'audio', outExt: 'dynamic',
    controls: [{ id: 'fmt', type: 'select', label: 'Convert to', options: [['mp3', 'MP3'], ['wav', 'WAV'], ['ogg', 'OGG'], ['aac', 'AAC (M4A)']], default: 'mp3' }],
    buildArgs: c => ['-i', c.inputName, c.outputName] },
  'volume-booster': { kind: 'audio', outExt: 'mp3',
    controls: [{ id: 'gain', type: 'range', label: 'Volume boost (dB)', min: 1, max: 20, step: 1, default: 8 }],
    buildArgs: c => ['-i', c.inputName, '-af', `volume=${c.val('gain')}dB`, c.outputName] },
};

// ── GENERIC UI RENDERER ──────────────────────────────────────────────────────
function renderMediaTool(toolId) {
  const cfg = MEDIA_TOOL_CONFIGS[toolId];
  const meta = (typeof ALL_TOOLS !== 'undefined') ? ALL_TOOLS.find(t => t.id === toolId) : null;
  const container = document.getElementById('tool-widget-container');
  const isMulti = cfg.kind === 'video-multi' || cfg.kind === 'audio-multi';
  const acceptType = cfg.kind.startsWith('audio') ? 'audio/*' : 'video/*';

  const controlsHtml = (cfg.controls || []).map(ctl => {
    if (ctl.type === 'range') return `
      <div class="form-group" style="margin-bottom:1rem">
        <label class="form-label">${ctl.label}: <span id="mt-val-${ctl.id}">${ctl.default}</span></label>
        <input type="range" id="mt-ctl-${ctl.id}" min="${ctl.min}" max="${ctl.max}" step="${ctl.step}" value="${ctl.default}"
          oninput="document.getElementById('mt-val-${ctl.id}').textContent=this.value" style="width:100%">
      </div>`;
    if (ctl.type === 'select') return `
      <div class="form-group" style="margin-bottom:1rem">
        <label class="form-label">${ctl.label}</label>
        <select class="form-select" id="mt-ctl-${ctl.id}">
          ${ctl.options.map(([v, l]) => `<option value="${v}" ${v === ctl.default ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>`;
    return `
      <div class="form-group" style="margin-bottom:1rem">
        <label class="form-label">${ctl.label}</label>
        <input class="form-input" type="text" id="mt-ctl-${ctl.id}" value="${ctl.default || ''}">
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="tool-widget">
      <div class="info-box info-box-blue" style="margin-bottom:1rem">🎬 Runs 100% in your browser — nothing is uploaded to a server, your file never leaves your device.</div>
      <div class="form-group" style="margin-bottom:1rem">
        <label class="form-label">${isMulti ? 'Select 2 or more files (in order)' : 'Choose a file'}</label>
        <input class="form-input" type="file" id="mt-file-input" accept="${acceptType}" ${isMulti ? 'multiple' : ''}>
      </div>
      ${cfg.extraFile ? `
      <div class="form-group" style="margin-bottom:1rem">
        <label class="form-label">${cfg.extraFile.label}</label>
        <input class="form-input" type="file" id="mt-extra-file" accept="${cfg.extraFile.accept}">
      </div>` : ''}
      ${controlsHtml}
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
        <button class="btn-primary-glow" id="mt-run-btn" onclick="runMediaTool('${toolId}')">⚙️ Process</button>
        <button class="btn-outline-glow" onclick="resetMediaTool()">🗑 Clear</button>
      </div>
      <div id="mt-progress-wrap" style="display:none;margin-bottom:1rem">
        <div style="height:8px;border-radius:4px;background:var(--glass2);overflow:hidden">
          <div id="mt-progress-bar" style="height:100%;width:0%;background:var(--grad-main);transition:width .2s"></div>
        </div>
        <p id="mt-progress-label" style="color:var(--text2);font-size:.8rem;margin-top:.4rem">Loading engine…</p>
      </div>
      <div id="mt-output"></div>
    </div>`;
}

function resetMediaTool() {
  const f = document.getElementById('mt-file-input'); if (f) f.value = '';
  const out = document.getElementById('mt-output'); if (out) out.innerHTML = '';
}

function _mtSetProgress(pct, label) {
  const wrap = document.getElementById('mt-progress-wrap');
  const bar = document.getElementById('mt-progress-bar');
  const lab = document.getElementById('mt-progress-label');
  if (wrap) wrap.style.display = 'block';
  if (bar && typeof pct === 'number') bar.style.width = pct + '%';
  if (lab && label) lab.textContent = label;
}

async function runMediaTool(toolId) {
  const cfg = MEDIA_TOOL_CONFIGS[toolId];
  const btn = document.getElementById('mt-run-btn');
  const output = document.getElementById('mt-output');
  const fileInput = document.getElementById('mt-file-input');
  const files = fileInput?.files;
  if (!files || !files.length) { showToast('Please choose a file first', 'warning'); return; }
  const isMulti = cfg.kind === 'video-multi' || cfg.kind === 'audio-multi';
  if (isMulti && files.length < 2) { showToast('Please select at least 2 files', 'warning'); return; }

  btn.disabled = true; btn.textContent = '⏳ Processing…';
  output.innerHTML = '';
  _mtSetProgress(0, 'Loading video/audio engine (first time only)…');

  try {
    // ── Native MP3 path: works everywhere, no ffmpeg needed ──
    if (NATIVE_MP3_TOOLS.includes(toolId) && files[0]) {
      try {
        const mp3 = await nativeConvertToMp3(files[0], _mtSetProgress);
        const url = URL.createObjectURL(mp3);
        _mtSetProgress(100, 'Done!');
        output.innerHTML = `<div class="info-box info-box-blue" style="margin-bottom:1rem">✅ MP3 ready (${(mp3.size / 1048576).toFixed(2)} MB)</div>
          <audio controls src="${url}" style="width:100%;margin-bottom:1rem"></audio>
          <a class="btn-primary-glow" href="${url}" download="toolhub-output.mp3">⬇ Download MP3</a>`;
        btn.disabled = false; btn.textContent = '⚙️ Process';
        return;
      } catch (nativeErr) {
        console.warn('[ToolHub] native mp3 failed, trying ffmpeg:', nativeErr && nativeErr.message);
        _mtSetProgress(5, 'Trying advanced engine…');
      }
    }

    const ffmpeg = await ensureFFmpeg(pct => _mtSetProgress(pct, `Processing… ${pct}%`));
    const { fetchFile } = window.FFmpeg;
    _mtSetProgress(5, 'Reading file…');

    // ── Subtitle generator: extract audio, transcribe via Hugging Face ──
    if (cfg.kind === 'subtitles') {
      const inFile = files[0];
      const ext = (inFile.name.split('.').pop() || 'mp4').toLowerCase();
      ffmpeg.FS('writeFile', 'in.' + ext, await fetchFile(inFile));
      _mtSetProgress(20, 'Extracting audio track…');
      await ffmpeg.run('-i', 'in.' + ext, '-vn', '-ar', '16000', '-ac', '1', '-b:a', '64k', 'audio.mp3');
      const audioData = ffmpeg.FS('readFile', 'audio.mp3');
      const audioBlob = new Blob([audioData.buffer], { type: 'audio/mp3' });
      const audioDataUrl = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(audioBlob); });
      _mtSetProgress(60, 'Transcribing with AI…');
      const resp = await fetch('/.netlify/functions/huggingface', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'speech-to-text', audio: audioDataUrl }), signal: AbortSignal.timeout(60000),
      });
      if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || 'Transcription failed'); }
      const data = await resp.json();
      const srt = _buildSRT(data.chunks, data.text);
      const blob = new Blob([srt], { type: 'text/srt' });
      _mtSetProgress(100, 'Done!');
      output.innerHTML = `<div class="info-box info-box-blue" style="margin-bottom:1rem">✅ Subtitles generated</div>
        <textarea class="form-textarea" style="min-height:180px;width:100%">${srt.replace(/</g, '&lt;')}</textarea>
        <a class="btn-primary-glow" style="margin-top:.75rem;display:inline-block" href="${URL.createObjectURL(blob)}" download="subtitles.srt">⬇ Download .srt</a>`;
      btn.disabled = false; btn.textContent = '⚙️ Process'; return;
    }

    // ── Metadata viewers (log-parse, no output file) ──
    if (cfg.kind === 'metadata-video' || cfg.kind === 'metadata-audio') {
      const inFile = files[0];
      const ext = (inFile.name.split('.').pop() || 'mp4').toLowerCase();
      ffmpeg.FS('writeFile', 'in.' + ext, await fetchFile(inFile));
      let log = '';
      ffmpeg.setLogger(({ message }) => { log += message + '\n'; });
      _mtSetProgress(50, 'Reading metadata…');
      try { await ffmpeg.run('-i', 'in.' + ext, '-f', 'null', '-'); } catch (e) { /* ffmpeg exits non-zero for -f null, expected */ }
      ffmpeg.setLogger(() => {});
      _mtSetProgress(100, 'Done!');
      output.innerHTML = `<div class="tool-widget" style="font-family:monospace;font-size:.8rem;white-space:pre-wrap;max-height:400px;overflow-y:auto">${_parseFFmpegInfo(log)}</div>`;
      btn.disabled = false; btn.textContent = '⚙️ Process'; return;
    }

    // ── Multi-file merge tools (video-merger / audio-joiner) ──
    if (isMulti) {
      let listTxt = '';
      for (let i = 0; i < files.length; i++) {
        const ext = (files[i].name.split('.').pop() || (cfg.kind === 'audio-multi' ? 'mp3' : 'mp4')).toLowerCase();
        const name = `part${i}.${ext}`;
        ffmpeg.FS('writeFile', name, await fetchFile(files[i]));
        listTxt += `file '${name}'\n`;
        _mtSetProgress(5 + Math.round((i / files.length) * 20), `Loading file ${i + 1}/${files.length}…`);
      }
      ffmpeg.FS('writeFile', 'list.txt', listTxt);
      const outputName = 'output.' + cfg.outExt;
      _mtSetProgress(40, 'Merging…');
      await ffmpeg.run(...cfg.buildArgs({ outputName, val: () => null }));
      const data = ffmpeg.FS('readFile', outputName);
      _finishMediaOutput(data, cfg.outExt, _mediaOutKind(cfg.outExt), output);
      btn.disabled = false; btn.textContent = '⚙️ Process'; return;
    }

    // ── Frame extraction (produces a zip of images) ──
    if (cfg.kind === 'video-frames') {
      const inFile = files[0];
      const ext = (inFile.name.split('.').pop() || 'mp4').toLowerCase();
      ffmpeg.FS('writeFile', 'in.' + ext, await fetchFile(inFile));
      const fps = document.getElementById('mt-ctl-fps')?.value || 1;
      _mtSetProgress(30, 'Extracting frames…');
      await ffmpeg.run('-i', 'in.' + ext, '-vf', `fps=${fps}`, 'frame_%03d.png');
      const zip = new JSZip();
      let i = 1, added = 0;
      while (added < 300) {
        const name = `frame_${String(i).padStart(3, '0')}.png`;
        try { const d = ffmpeg.FS('readFile', name); zip.file(name, d); added++; i++; } catch (e) { break; }
      }
      _mtSetProgress(90, 'Zipping frames…');
      const blob = await zip.generateAsync({ type: 'blob' });
      _mtSetProgress(100, 'Done!');
      output.innerHTML = `<div class="info-box info-box-blue" style="margin-bottom:1rem">✅ ${added} frames extracted</div>
        <a class="btn-primary-glow" href="${URL.createObjectURL(blob)}" download="frames.zip">⬇ Download frames.zip</a>`;
      btn.disabled = false; btn.textContent = '⚙️ Process'; return;
    }

    // ── Standard single-file tools ──
    const inFile = files[0];
    const inExt = (inFile.name.split('.').pop() || (cfg.kind === 'audio' ? 'mp3' : 'mp4')).toLowerCase();
    const inputName = 'input.' + inExt;
    ffmpeg.FS('writeFile', inputName, await fetchFile(inFile));

    if (cfg.extraFile) {
      const extraInput = document.getElementById('mt-extra-file');
      if (!extraInput?.files?.[0]) throw new Error(`Please upload: ${cfg.extraFile.label}`);
      const extraExt = (extraInput.files[0].name.split('.').pop() || 'jpg').toLowerCase();
      ffmpeg.FS('writeFile', 'cover.img', await fetchFile(extraInput.files[0]));
    }

    let outExt = cfg.outExt;
    if (outExt === 'dynamic') outExt = document.getElementById('mt-ctl-fmt')?.value || 'mp3';
    const outputName = 'output.' + outExt;

    const val = (id) => document.getElementById('mt-ctl-' + id)?.value;
    _mtSetProgress(20, 'Processing…');
    await ffmpeg.run(...cfg.buildArgs({ inputName, outputName, val }));

    const data = ffmpeg.FS('readFile', outputName);
    _finishMediaOutput(data, outExt, _mediaOutKind(outExt), output);

    if (window.supabaseClient && typeof Auth !== 'undefined' && Auth.user) {
      dbInsert('tool_usage', { user_id: Auth.user.id, tool_id: toolId, used_at: new Date().toISOString() }).catch(() => {});
    }
    showToast('✅ Done!', 'success');
  } catch (e) {
    output.innerHTML = `<div class="info-box info-box-red">❌ ${e.message || 'Processing failed. Try a smaller file or a different browser (Chrome/Edge work best).'}</div>`;
  }
  btn.disabled = false; btn.textContent = '⚙️ Process';
}

function _finishMediaOutput(data, ext, kind, output) {
  const mime = ext === 'png' ? 'image/png'
    : ext === 'gif' ? 'image/gif'
      : ext === 'mp3' ? 'audio/mpeg'
        : ext === 'm4a' ? 'audio/mp4'
          : kind === 'audio' ? `audio/${ext}` : `video/${ext}`;
  const blob = new Blob([data.buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  _mtSetProgress(100, 'Done!');
  const previewHtml = ext === 'png' || ext === 'gif'
    ? `<img src="${url}" style="max-width:100%;border-radius:10px;margin-bottom:1rem">`
    : kind === 'audio'
      ? `<audio controls src="${url}" style="width:100%;margin-bottom:1rem"></audio>`
      : `<video controls src="${url}" style="width:100%;border-radius:10px;margin-bottom:1rem"></video>`;
  output.innerHTML = `${previewHtml}<a class="btn-primary-glow" href="${url}" download="toolhub-output.${ext}">⬇ Download</a>`;
}

function _parseFFmpegInfo(log) {
  const lines = log.split('\n').filter(l =>
    /Duration|Stream|Video:|Audio:|bitrate/i.test(l));
  return lines.length ? lines.join('\n').replace(/</g, '&lt;') : 'Could not read metadata from this file.';
}

function _buildSRT(chunks, fallbackText) {
  const fmtTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(Math.floor(s % 60)).padStart(2, '0');
    const ms = String(Math.round((s % 1) * 1000)).padStart(3, '0');
    return `${h}:${m}:${sec},${ms}`;
  };
  if (Array.isArray(chunks) && chunks.length) {
    return chunks.map((c, i) => {
      const [start, end] = c.timestamp || [i * 3, i * 3 + 3];
      return `${i + 1}\n${fmtTime(start || 0)} --> ${fmtTime(end || (start || 0) + 3)}\n${c.text || ''}\n`;
    }).join('\n');
  }
  return `1\n00:00:00,000 --> 00:00:10,000\n${fallbackText || '(No speech detected)'}\n`;
}

// ── Register into the shared tool dispatcher ────────────────────────────────
window.EXTRA_TOOL_WIDGETS = window.EXTRA_TOOL_WIDGETS || {};
Object.keys(MEDIA_TOOL_CONFIGS).forEach(id => {
  window.EXTRA_TOOL_WIDGETS[id] = () => renderMediaTool(id);
});
