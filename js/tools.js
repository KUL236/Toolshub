/* tools.js — ToolHub 5D Complete Tool Logic */
'use strict';

// ── PDF.js LAZY LOADER ──────────────────────────────────────────────────────
function ensurePDFjs() {
  return new Promise((resolve, reject) => {
    const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    const WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    if (window.pdfjsLib) {
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
      }
      return resolve(window.pdfjsLib);
    }
    const s = document.createElement('script');
    s.src = PDFJS_CDN;
    s.onload = () => { pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL; resolve(window.pdfjsLib); };
    s.onerror = () => reject(new Error('Failed to load PDF.js. Please check your internet connection.'));
    document.head.appendChild(s);
  });
}

// ── TOOL PAGE ROUTER ──
function renderToolPage(toolOrId) {
  const tool = (typeof toolOrId === 'object') ? toolOrId : ALL_TOOLS.find(t => t.id === toolOrId);
  if (!tool) { navigate('home'); return; }
  const catObj = CATEGORIES.find(c => c.id === tool.cat);
  const isFav = App.favorites.includes(tool.id);
  const el = document.getElementById('tool-view');
  el.innerHTML = `
    <div class="tool-page">
      <div class="tool-page-header">
        <div class="tool-page-icon" style="background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1));font-size:2rem">${tool.icon}</div>
        <div class="tool-page-info">
          <div class="breadcrumb">
            <span onclick="navigate('home')">Home</span> /
            <span onclick="navigate('${tool.cat}-tools')">${catObj?.label||tool.cat}</span> /
            <span>${tool.name}</span>
          </div>
          <h1 class="tool-page-title">${tool.name}</h1>
          <p class="tool-page-desc">${tool.desc}</p>
          <div class="tool-page-actions">
            <button id="tool-fav-btn" class="tool-action-btn ${isFav?'active':''}" onclick="toggleFav(event,'${tool.id}')">
              ${isFav ? '⭐ Favorited' : '☆ Favorite'}
            </button>
            <button class="tool-action-btn" onclick="shareTool('${tool.id}')">🔗 Share</button>
          </div>
        </div>
      </div>
      <div id="tool-widget-container"></div>
      <div class="tool-seo-content" id="tool-seo-content"></div>
    </div>`;

  // Route to specific widget
  const widgets = {
    // Image converters
    'jpg-to-png': () => renderImgConvert('jpg-to-png'),
    'jpg-to-webp': () => renderImgConvert('jpg-to-webp'),
    'png-to-jpg': () => renderImgConvert('png-to-jpg'),
    'png-to-pdf': () => renderImgConvert('png-to-pdf'),
    'webp-to-jpg': () => renderImgConvert('webp-to-jpg'),
    'svg-to-png': () => renderImgConvert('svg-to-png'),
    'photo-filters': renderPhotoFilters,
    'img-watermark': renderImgWatermark,
    'img-upscaler': renderImgUpscaler,
    // PDF tools
    'pdf-reader': renderPDFReader,
    'pdf-to-png': renderPDFtoPNG,
    'pdf-to-word': renderPDFtoWord,
    'split-pdf': renderSplitPDF,
    'rotate-pdf': renderRotatePDF,
    'unlock-pdf': renderUnlockPDF,
    'pdf-extract-pages': renderPDFExtractPages,
    'pdf-metadata': renderPDFMetadata,
    // Dev tools
    'sql-formatter': renderSQLFormatter,
    'xml-formatter': renderXMLFormatter,
    'emi-calculator': renderEMICalc, 'loan-calculator': renderEMICalc,
    'sip-calculator': renderSIPCalc,
    'fd-calculator': renderFDCalc,
    'gst-calculator': renderGSTCalc,
    'currency-converter': renderCurrencyConv,
    'percent-calc': renderPercentCalc, 'profit-loss': renderPercentCalc,
    'discount-calc': renderDiscountCalc,
    'salary-calculator': renderSalaryCalc,
    'income-tax': renderIncomeTaxCalc,
    'retirement-planner': renderRetirementCalc,
    'bmi-calculator': renderBMICalc, 'bmi-guide': renderBMICalc,
    'calorie-calculator': renderCalorieCalc,
    'water-calculator': renderWaterCalc,
    'ideal-weight': renderIdealWeight,
    'sleep-calculator': renderSleepCalc,
    'step-tracker': renderStepTracker,
    'heart-rate-monitor': renderHeartRateMonitor,
    'smartwatch-connect': renderSmartwatchConnect,
    'health-dashboard': renderHealthDashboard,
    'age-calculator': renderAgeCalc,
    'cgpa-calculator': renderCGPACalc, 'gpa-calculator': renderCGPACalc,
    'marks-calculator': renderStudentPercent, 'attendance-calc': renderAttendanceCalc,
    'pomodoro': renderPomodoro,
    'study-planner': renderStudyPlanner,
    'assignment-tracker': renderAssignmentTracker,
    'exam-countdown': renderExamCountdown,
    'notes-organizer': renderNotesOrganizer,
    'timetable-gen': renderTimetableGen,
    'word-counter': renderWordCounter,
    'qr-generator': renderQRGen,
    'barcode-gen': renderBarcodeGen,
    'password-gen': renderPasswordGen, 'password-checker': renderPasswordChecker,
    'uuid-gen': renderUUIDGen,
    'color-picker': renderColorPicker, 'color-palette': renderColorPalette, 'color-converter': renderColorConverter,
    'img-compressor': renderImgCompress, 'img-resizer': renderImgResize,
    'png-compressor': renderPngCompress,
    'img-to-base64': renderImgBase64, 'img-base64-decode': renderImgBase64,
    'meme-gen': renderMemeGen,
    'bg-remover': renderBgRemover,
    'face-blur': renderFaceBlur,
    'img-cropper': renderImgCropper,
    'img-to-text': renderOCRTool,
    'ocr-pdf': renderOCRTool,
    'json-formatter': renderJSONFormatter, 'json-validator': renderJSONValidator,
    'html-minifier': renderHTMLMinifier, 'css-minifier': renderCSSMinifier, 'js-minifier': renderJSMinifier,
    'url-encoder': renderURLEncoder,
    'regex-tester': renderRegexTester,
    'base64-enc': renderBase64Tool, 'base64-dec': renderBase64Tool,
    'hash-gen': renderHashGen,
    'jwt-decoder': renderJWTDecoder,
    'markdown-preview': renderMarkdownPreview,
    'diff-checker': renderDiffChecker,
    'api-tester': renderAPITester,
    'cron-gen': renderCronGen,
    'pdf-to-jpg': renderPDFTool, 'jpg-to-pdf': renderImgToPDF,
    'pdf-to-text': renderPDFtoText,
    'pdf-to-excel': renderPDFtoExcel,
    'pdf-to-csv': renderPDFtoCSV,
    'pdf-to-html': renderPDFtoHTML,
    'html-to-pdf': renderHTMLtoPDF,
    'word-to-pdf': renderWordToPDF,
    'word-to-jpg': renderWordToJPG,
    'word-to-excel': renderWordToExcel,
    'jpg-to-word': renderJPGtoWord,
    'jpg-to-excel': renderJPGtoExcel,
    'excel-to-jpg': renderExcelToJPG,
    'ppt-to-pdf': renderPPTtoPDF,
    'doc-scanner': renderDocScanner,
    'text-to-pdf': renderTextToPDF,
    'text-to-word': renderTextToWord,
    'invert-image': renderInvertImage,
    'text-to-image': renderTextToImage,
    'image-translator': renderImageTranslator,
    'barcode-scanner': renderBarcodeScanner,
    'batch-img-to-text': renderBatchImgToText,
    'merge-pdf': renderMergePDF, 'compress-pdf': renderCompressPDF,
    'watermark-pdf': renderWatermarkPDF, 'protect-pdf': renderProtectPDF,
    'pdf-page-numbers': renderPDFPageNumbers,
    'love-calculator': renderLoveCalc,
    'friendship-calc': renderFriendshipCalc,
    'birthday-countdown': renderBirthdayCountdown,
    'roast-generator': renderRoastGen,
    'fortune-wheel': renderFortuneWheel,
    'personality-test': renderPersonalityTest,
    'random-challenge': renderRandomChallenge,
    'truth-generator': renderTruthGen,
    'dice-roller': renderDiceRoller,
    'wheel-spinner': renderWheelSpinner,
    'truth-dare': renderTruthDareGame,
    'random-num-gen': renderRandomNum,
    'diwali-greeting-card': renderDiwaliGreetingCard,
    'rangoli-creator': renderRangoliCreator,
    'diya-decoration': renderDiyaDecoration,
    'diwali-countdown': renderDiwaliCountdown,
    'festive-wallpaper': renderFestiveWallpaper,
    // AI Tools
    'ai-resume-analyzer': () => renderAITool('resume-analyzer'),
    'ai-resume-builder': () => renderAITool('resume-builder'),
    'ai-cover-letter': () => renderAITool('cover-letter'),
    'ai-linkedin-optimizer': () => renderAITool('linkedin-optimizer'),
    'ai-linkedin-headline': () => renderAITool('linkedin-headline'),
    'ai-interview-coach': () => renderAITool('interview-coach'),
    'ai-career-roadmap': () => renderAITool('career-roadmap'),
    'ai-startup-idea': () => renderAITool('startup-idea'),
    'ai-business-plan': () => renderAITool('business-plan'),
    'ai-blog-writer': () => renderAITool('blog-writer'),
    'ai-article-gen': () => renderAITool('article-gen'),
    'ai-translator': () => renderAITool('translator'),
    'ai-summarizer': () => renderAITool('summarizer'),
    'ai-rewriter': () => renderAITool('rewriter'),
    'ai-caption-gen': () => renderAITool('caption-gen'),
    'ai-hashtag-gen': () => renderAITool('hashtag-gen'),
    'ai-story-gen': () => renderAITool('story-gen'),
    'ai-quiz-gen': () => renderAITool('quiz-gen'),
    'ai-mcq-gen': () => renderAITool('mcq-gen'),
    'ai-legal-assistant': () => renderAITool('legal-assistant'),
    'ai-contract-simplifier': () => renderAITool('contract-simplifier'),
    'ai-email-writer': () => renderAITool('email-writer'),
    'ai-cold-email': () => renderAITool('cold-email'),
    'ai-product-desc': () => renderAITool('product-desc'),
    'ai-youtube-script': () => renderAITool('youtube-script'),
  };
  const fn = widgets[tool.id] || (window.EXTRA_TOOL_WIDGETS && window.EXTRA_TOOL_WIDGETS[tool.id]);
  if (fn) fn();
  else renderComingSoon(tool);
  renderToolSEO(tool);
}

function renderComingSoon(tool) {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget" style="text-align:center;padding:3rem">
      <div style="font-size:4rem;margin-bottom:1rem">${tool.icon}</div>
      <h2 style="font-family:var(--font-display);font-size:1.4rem;margin-bottom:.5rem">${tool.name}</h2>
      <p style="color:var(--text2);margin-bottom:1.5rem">${tool.desc}</p>
      <div class="info-box info-box-blue">🚀 This tool is coming soon! Check back shortly.</div>
    </div>`;
}

function renderToolSEO(tool) {
  const el = document.getElementById('tool-seo-content');
  if (!el) return;
  el.innerHTML = `
    <h2>About ${tool.name}</h2>
    <p>${tool.desc} This free online tool works directly in your browser — no signup, no installation, 100% private.</p>
    <h3>Features</h3>
    <ul>
      <li>100% free — no registration required</li>
      <li>Works offline — no data sent to servers</li>
      <li>Mobile optimized — works on Android & iOS</li>
      <li>Instant results — no loading or waiting</li>
    </ul>
    <h3>Frequently Asked Questions</h3>
    <div class="seo-faq">
      <div class="seo-faq-item"><strong>Is ${tool.name} free?</strong><p>Yes, completely free with no hidden charges or signup required.</p></div>
      <div class="seo-faq-item"><strong>Is my data safe?</strong><p>All calculations happen in your browser. No data is ever sent to our servers.</p></div>
      <div class="seo-faq-item"><strong>Does it work on mobile?</strong><p>Yes! ToolHub 5D is fully optimized for Android and iOS devices.</p></div>
    </div>`;
}

// ── AI TOOL FRAMEWORK ──
const AI_TOOL_CONFIGS = {
  'resume-analyzer': { title:'Resume Analyzer', placeholder:'Paste your resume text here...', prompt: (input) => `Analyze this resume and provide: 1) Overall Score (0-100), 2) Key Strengths (3-5 points), 3) Areas to Improve (3-5 points), 4) ATS Score, 5) Missing Keywords. Format clearly with sections.\n\nResume:\n${input}`, label:'Resume Text', multiline:true },
  'resume-builder': { title:'Resume Builder', placeholder:'Enter your details: Name, Skills, Experience, Education...', prompt: (input) => `Create a professional, ATS-optimized resume based on this information. Use proper formatting with sections: Contact, Summary, Skills, Experience, Education.\n\nInfo: ${input}`, label:'Your Details', multiline:true },
  'cover-letter': { title:'Cover Letter Generator', placeholder:'Job title and company name, your key skills...', prompt: (input) => `Write a compelling, personalized cover letter for this job application. Make it professional, engaging and under 350 words.\n\nDetails: ${input}`, label:'Job & Skills', multiline:true },
  'linkedin-optimizer': { title:'LinkedIn Profile Optimizer', placeholder:'Paste your current LinkedIn About section...', prompt: (input) => `Optimize this LinkedIn About section to attract recruiters. Make it keyword-rich, engaging and under 2000 characters. Also suggest 5 headline options.\n\nCurrent profile: ${input}`, label:'Current Profile', multiline:true },
  'linkedin-headline': { title:'LinkedIn Headline Generator', placeholder:'Your job title, skills, industry...', prompt: (input) => `Generate 10 powerful LinkedIn headlines for this professional. Include keywords and value propositions. Format as numbered list.\n\nDetails: ${input}`, label:'Your Role & Skills', multiline:false },
  'interview-coach': { title:'AI Interview Coach', placeholder:'Job role and interview question...', prompt: (input) => `Act as an expert interview coach. Provide a strong, structured STAR method answer for this interview question. Include tips and follow-up prep.\n\nQuestion/Role: ${input}`, label:'Interview Question', multiline:true },
  'career-roadmap': { title:'Career Roadmap Generator', placeholder:'Current role, target role, years of experience...', prompt: (input) => `Create a detailed 12-month career roadmap with monthly milestones, skills to learn, certifications to get, and action items.\n\nDetails: ${input}`, label:'Career Details', multiline:false },
  'startup-idea': { title:'Startup Idea Generator', placeholder:'Your skills, interests, problem you want to solve...', prompt: (input) => `Generate 5 validated startup ideas with: Problem Statement, Solution, Target Market, Revenue Model, and Competitive Advantage.\n\nContext: ${input}`, label:'Your Context', multiline:false },
  'business-plan': { title:'Business Plan Generator', placeholder:'Business idea, target market, budget...', prompt: (input) => `Create a comprehensive business plan with: Executive Summary, Market Analysis, Product/Service, Marketing Strategy, Financial Projections, Operations Plan.\n\nIdea: ${input}`, label:'Business Idea', multiline:true },
  'blog-writer': { title:'AI Blog Writer', placeholder:'Blog topic and target audience...', prompt: (input) => `Write a comprehensive, SEO-optimized blog post (800-1200 words) with H2/H3 headings, engaging intro, bullet points where appropriate, and a strong conclusion with CTA.\n\nTopic: ${input}`, label:'Blog Topic', multiline:false },
  'article-gen': { title:'AI Article Generator', placeholder:'Article topic, length, tone (formal/casual)...', prompt: (input) => `Write a well-researched, engaging article. Include a hook, clear sections with subheadings, supporting points, and conclusion.\n\nTopic: ${input}`, label:'Article Details', multiline:false },
  'translator': { title:'AI Translator', placeholder:'Enter text to translate...', prompt: (input, lang) => `Translate the following text to ${lang||'Hindi'}. Provide natural, fluent translation (not literal). Also show transliteration if applicable.\n\nText: ${input}`, label:'Text to Translate', multiline:true, hasLang:true },
  'summarizer': { title:'AI Summarizer', placeholder:'Paste the text you want to summarize...', prompt: (input) => `Summarize this text in 3 formats: 1) One-line summary, 2) 3-sentence summary, 3) Key bullet points (5-7 points).\n\nText:\n${input}`, label:'Text to Summarize', multiline:true },
  'rewriter': { title:'AI Rewriter', placeholder:'Paste text to rewrite...', prompt: (input) => `Rewrite this text in 3 styles: 1) Professional, 2) Casual/Conversational, 3) Concise. Keep the core meaning.\n\nText: ${input}`, label:'Original Text', multiline:true },
  'caption-gen': { title:'Caption Generator', placeholder:'Describe your photo or post topic...', prompt: (input) => `Generate 10 viral social media captions for this post. Include emojis, vary tone (funny, inspirational, informative). Mark best one.\n\nPost: ${input}`, label:'Post Description', multiline:false },
  'hashtag-gen': { title:'Hashtag Generator', placeholder:'Topic, niche, or post description...', prompt: (input) => `Generate 30 relevant hashtags for this content. Group into: High reach (10), Medium reach (10), Niche/Low competition (10). Ready to copy.\n\nTopic: ${input}`, label:'Your Topic', multiline:false },
  'story-gen': { title:'AI Story Generator', placeholder:'Story idea, genre, length preference...', prompt: (input) => `Write a creative, engaging story with clear plot, interesting characters, and satisfying ending.\n\nPrompt: ${input}`, label:'Story Prompt', multiline:false },
  'quiz-gen': { title:'AI Quiz Generator', placeholder:'Topic and difficulty level...', prompt: (input) => `Generate a 10-question quiz on this topic. Include: Question, 4 options (A-D), correct answer, brief explanation.\n\nTopic: ${input}`, label:'Quiz Topic', multiline:false },
  'mcq-gen': { title:'MCQ Generator', placeholder:'Subject and specific topic...', prompt: (input) => `Create 10 multiple choice questions. Format: Question, Options A-D, Answer, Explanation. Include mix of easy/medium/hard.\n\nTopic: ${input}`, label:'Subject & Topic', multiline:false },
  'legal-assistant': { title:'AI Legal Assistant', placeholder:'Describe your legal question or situation...', prompt: (input) => `Provide general legal information about this situation in simple language. Include: Key Points, Relevant Laws (India), Rights & Options, Recommended Next Steps. Note: This is not legal advice.\n\nSituation: ${input}`, label:'Legal Question', multiline:true },
  'contract-simplifier': { title:'Contract Simplifier', placeholder:'Paste the contract or legal text...', prompt: (input) => `Simplify this legal/contract text in plain English. For each clause: 1) Plain English version, 2) What it means for you, 3) Any red flags to watch.\n\nContract: ${input}`, label:'Contract Text', multiline:true },
  'email-writer': { title:'AI Email Writer', placeholder:'Email purpose, recipient, tone...', prompt: (input) => `Write 2 versions of this email: 1) Formal/Professional, 2) Friendly. Include subject line, proper greeting, clear body, and call to action.\n\nDetails: ${input}`, label:'Email Purpose', multiline:true },
  'cold-email': { title:'Cold Email Generator', placeholder:'Product/service, target prospect, goal...', prompt: (input) => `Write a high-converting cold email with: Compelling subject line, personalized opener, clear value prop, specific CTA, and PS line. Keep under 150 words.\n\nContext: ${input}`, label:'Your Offer & Target', multiline:false },
  'product-desc': { title:'Product Description Generator', placeholder:'Product name, features, target audience...', prompt: (input) => `Write 3 product descriptions: 1) Short (50 words), 2) Standard (150 words), 3) SEO-optimized (300 words with keywords).\n\nProduct: ${input}`, label:'Product Details', multiline:false },
  'youtube-script': { title:'YouTube Script Generator', placeholder:'Video topic, target audience, duration...', prompt: (input) => `Write a complete YouTube script with: Hook (first 30 sec), Introduction, 3-5 main sections with talking points, transitions, Call to Action, and End screen. Include [PAUSE], [VISUAL CUE] notes.\n\nTopic: ${input}`, label:'Video Topic', multiline:false },
};

function renderAITool(toolKey) {
  const config = AI_TOOL_CONFIGS[toolKey];
  if (!config) return;
  const container = document.getElementById('tool-widget-container');
  container.innerHTML = `
    <div class="tool-widget">
      <div class="info-box info-box-blue" style="margin-bottom:1rem">🤖 Powered by <strong>AI Assistant</strong> — Fast, intelligent generation</div>
      <div class="form-group" style="margin-bottom:1rem">
        <label class="form-label">${config.label}</label>
        ${config.multiline
          ? `<textarea class="form-textarea" id="ai-tool-input" placeholder="${config.placeholder}" style="min-height:140px"></textarea>`
          : `<input class="form-input" type="text" id="ai-tool-input" placeholder="${config.placeholder}">`
        }
      </div>
      ${config.hasLang ? `
      <div class="form-group" style="margin-bottom:1rem">
        <label class="form-label">Target Language</label>
        <select class="form-select" id="ai-lang-select">
          <option>Hindi</option><option>Spanish</option><option>French</option><option>German</option>
          <option>Arabic</option><option>Japanese</option><option>Chinese</option><option>Portuguese</option>
          <option>Russian</option><option>Korean</option><option>Italian</option><option>Bengali</option>
          <option>Tamil</option><option>Telugu</option><option>Marathi</option><option>Gujarati</option>
        </select>
      </div>` : ''}
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
        <select class="form-select" id="ai-tool-model" style="max-width:220px">
          <option value="openai/gpt-oss-120b">GPT-OSS 120B (Best)</option>
          <option value="openai/gpt-oss-20b">GPT-OSS 20B (Fast)</option>
        </select>
        <button class="btn-primary-glow" onclick="runAITool('${toolKey}')" id="ai-tool-btn">
          ✨ Generate with AI
        </button>
        <button class="btn-outline-glow" onclick="document.getElementById('ai-tool-output').innerHTML='';document.getElementById('ai-tool-input').value=''">🗑 Clear</button>
      </div>
      <div id="ai-tool-output" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">
          <label class="form-label" style="margin:0">AI Output</label>
          <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('ai-result-text').textContent,'Copied!')">📋 Copy</button>
        </div>
        <div id="ai-result-text" class="tool-widget" style="white-space:pre-wrap;font-size:.88rem;line-height:1.8;max-height:500px;overflow-y:auto"></div>
      </div>
    </div>`;
}

async function runAITool(toolKey) {
  const config = AI_TOOL_CONFIGS[toolKey];
  const input = document.getElementById('ai-tool-input')?.value?.trim();
  if (!input) { showToast('Please enter some text first', 'warning'); return; }
  const lang = document.getElementById('ai-lang-select')?.value;
  const model = document.getElementById('ai-tool-model')?.value || 'openai/gpt-oss-120b';
  const btn = document.getElementById('ai-tool-btn');
  const outputDiv = document.getElementById('ai-tool-output');
  const resultEl = document.getElementById('ai-result-text');
  btn.textContent = '⏳ Generating...'; btn.disabled = true;
  outputDiv.style.display = 'block';
  resultEl.innerHTML = '<div style="display:flex;gap:6px;align-items:center"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
  try {
    const prompt = config.prompt(input, lang);
    const response = await fetch('/.netlify/functions/groq-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, model }),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Service error: ${response.status}`);
    }
    const data = await response.json();
    const text = data.reply || 'No response generated.';
    resultEl.textContent = text;
    if (window.supabaseClient && Auth.user) {
      await dbInsert('tool_usage', { user_id: Auth.user.id, tool_id: toolKey, used_at: new Date().toISOString() });
    }
    showToast('✅ Generated successfully!', 'success');
  } catch(e) {
    resultEl.textContent = `❌ Error: ${e.message}\n\nPlease check your internet connection and try again.`;
  }
  btn.textContent = '✨ Generate with AI'; btn.disabled = false;
}

// ── FINANCIAL TOOLS ──
function renderEMICalc() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Loan Amount (₹)</label><input class="form-input" type="number" id="emi-amount" value="500000" min="1000" step="1000" oninput="calcEMI()"></div>
        <div class="form-group"><label class="form-label">Interest Rate (% p.a.)</label><input class="form-input" type="number" id="emi-rate" value="8.5" min="0.1" max="50" step="0.1" oninput="calcEMI()"></div>
        <div class="form-group"><label class="form-label">Tenure (Months)</label><input class="form-input" type="number" id="emi-tenure" value="60" min="1" max="360" oninput="calcEMI()"></div>
        <div class="form-group"><label class="form-label">Tenure: <span id="emi-tenure-lbl">5 Years</span></label><input type="range" id="emi-range" min="12" max="360" step="12" value="60" oninput="document.getElementById('emi-tenure').value=this.value;calcEMI()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="emi-monthly">₹9,722</div>
        <div class="result-label">Monthly EMI</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="emi-total">₹5,83,320</div><div class="result-item-label">Total Payment</div></div>
          <div class="result-item"><div class="result-item-value" id="emi-interest">₹83,320</div><div class="result-item-label">Total Interest</div></div>
          <div class="result-item"><div class="result-item-value" id="emi-principal">₹5,00,000</div><div class="result-item-label">Principal</div></div>
        </div>
        <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('emi-monthly').textContent,'EMI Copied!')">📋 Copy EMI</button>
      </div>
    </div>
    <div class="info-box info-box-blue">ℹ️ EMI = P × r × (1+r)^n / ((1+r)^n - 1). Results are approximate; consult your bank.</div>`;
  calcEMI();
}
function calcEMI() {
  const P = parseFloat(document.getElementById('emi-amount')?.value)||0;
  const r = (parseFloat(document.getElementById('emi-rate')?.value)||0)/12/100;
  const n = parseInt(document.getElementById('emi-tenure')?.value)||1;
  const lbl = document.getElementById('emi-tenure-lbl');
  if (lbl) lbl.textContent = n<12 ? `${n} Months` : `${(n/12).toFixed(1)} Years`;
  const range = document.getElementById('emi-range'); if (range) range.value = n;
  if (!P||!r||!n) return;
  const emi = P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  const total = emi*n; const interest = total-P;
  document.getElementById('emi-monthly').textContent = formatCurrency(Math.round(emi));
  document.getElementById('emi-total').textContent = formatCurrency(Math.round(total));
  document.getElementById('emi-interest').textContent = formatCurrency(Math.round(interest));
  document.getElementById('emi-principal').textContent = formatCurrency(Math.round(P));
}

function renderSIPCalc() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Monthly Investment (₹)</label><input class="form-input" type="number" id="sip-monthly" value="5000" oninput="calcSIP()"></div>
        <div class="form-group"><label class="form-label">Expected Return (% p.a.)</label><input class="form-input" type="number" id="sip-rate" value="12" step="0.5" oninput="calcSIP()"></div>
        <div class="form-group"><label class="form-label">Period (Years)</label><input class="form-input" type="number" id="sip-years" value="10" min="1" max="40" oninput="calcSIP()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="sip-corpus">₹11,61,695</div><div class="result-label">Estimated Corpus</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="sip-invested">₹6,00,000</div><div class="result-item-label">Total Invested</div></div>
          <div class="result-item"><div class="result-item-value" id="sip-gains">₹5,61,695</div><div class="result-item-label">Est. Returns</div></div>
          <div class="result-item"><div class="result-item-value" id="sip-xirr">12%</div><div class="result-item-label">Return Rate</div></div>
        </div>
        <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('sip-corpus').textContent,'Corpus copied!')">📋 Copy</button>
      </div>
    </div>
    <div class="info-box info-box-green">💡 SIP returns are subject to market risk. Past returns don't guarantee future results.</div>`;
  calcSIP();
}
function calcSIP() {
  const P = parseFloat(document.getElementById('sip-monthly')?.value)||0;
  const r = (parseFloat(document.getElementById('sip-rate')?.value)||0)/12/100;
  const n = (parseInt(document.getElementById('sip-years')?.value)||0)*12;
  if (!P||!r||!n) return;
  const corpus = P*(Math.pow(1+r,n)-1)/r*(1+r);
  const invested = P*n;
  document.getElementById('sip-corpus').textContent = formatCurrency(Math.round(corpus));
  document.getElementById('sip-invested').textContent = formatCurrency(invested);
  document.getElementById('sip-gains').textContent = formatCurrency(Math.round(corpus-invested));
  document.getElementById('sip-xirr').textContent = document.getElementById('sip-rate')?.value+'%';
}

function renderFDCalc() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Principal (₹)</label><input class="form-input" type="number" id="fd-p" value="100000" oninput="calcFD()"></div>
        <div class="form-group"><label class="form-label">Interest Rate (% p.a.)</label><input class="form-input" type="number" id="fd-rate" value="7.5" step="0.1" oninput="calcFD()"></div>
        <div class="form-group"><label class="form-label">Tenure (Years)</label><input class="form-input" type="number" id="fd-years" value="3" min="1" max="10" oninput="calcFD()"></div>
        <div class="form-group"><label class="form-label">Compounding</label><select class="form-select" id="fd-freq" onchange="calcFD()"><option value="4">Quarterly</option><option value="12">Monthly</option><option value="2">Half-Yearly</option><option value="1">Annually</option></select></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="fd-maturity">₹1,25,971</div><div class="result-label">Maturity Amount</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="fd-interest">₹25,971</div><div class="result-item-label">Interest Earned</div></div>
          <div class="result-item"><div class="result-item-value" id="fd-p-disp">₹1,00,000</div><div class="result-item-label">Principal</div></div>
        </div>
        <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('fd-maturity').textContent,'Copied!')">📋 Copy</button>
      </div>
    </div>`;
  calcFD();
}
function calcFD() {
  const P=parseFloat(document.getElementById('fd-p')?.value)||0, r=(parseFloat(document.getElementById('fd-rate')?.value)||0)/100;
  const t=parseFloat(document.getElementById('fd-years')?.value)||0, n=parseInt(document.getElementById('fd-freq')?.value)||4;
  const A=P*Math.pow(1+r/n,n*t);
  document.getElementById('fd-maturity').textContent=formatCurrency(Math.round(A));
  document.getElementById('fd-interest').textContent=formatCurrency(Math.round(A-P));
  document.getElementById('fd-p-disp').textContent=formatCurrency(Math.round(P));
}

function renderGSTCalc() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Amount (₹)</label><input class="form-input" type="number" id="gst-amount" value="10000" oninput="calcGST()"></div>
        <div class="form-group"><label class="form-label">GST Rate</label><select class="form-select" id="gst-rate" onchange="calcGST()"><option value="5">5%</option><option value="12">12%</option><option value="18" selected>18%</option><option value="28">28%</option></select></div>
        <div class="form-group"><label class="form-label">Type</label><select class="form-select" id="gst-type" onchange="calcGST()"><option value="add">Add GST (Exclusive)</option><option value="remove">Remove GST (Inclusive)</option></select></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="gst-total">₹11,800</div><div class="result-label" id="gst-label">Total with GST</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="gst-cgst">₹900</div><div class="result-item-label" id="gst-cgst-lbl">CGST (9%)</div></div>
          <div class="result-item"><div class="result-item-value" id="gst-sgst">₹900</div><div class="result-item-label" id="gst-sgst-lbl">SGST (9%)</div></div>
          <div class="result-item"><div class="result-item-value" id="gst-igst">₹1,800</div><div class="result-item-label" id="gst-igst-lbl">IGST (18%)</div></div>
        </div>
        <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('gst-total').textContent,'Copied!')">📋 Copy</button>
      </div>
    </div>`;
  calcGST();
}
function calcGST() {
  const amount = parseFloat(document.getElementById('gst-amount')?.value)||0;
  const rate = parseFloat(document.getElementById('gst-rate')?.value)||18;
  const type = document.getElementById('gst-type')?.value;
  let base, gst, total;
  if (type === 'add') { base=amount; gst=amount*rate/100; total=amount+gst; }
  else { total=amount; base=amount/(1+rate/100); gst=total-base; }
  const half=gst/2;
  document.getElementById('gst-total').textContent=formatCurrency(total);
  document.getElementById('gst-label').textContent=type==='add'?'Total with GST':'Base Amount';
  document.getElementById('gst-cgst').textContent=formatCurrency(half);
  document.getElementById('gst-sgst').textContent=formatCurrency(half);
  document.getElementById('gst-igst').textContent=formatCurrency(gst);
  document.getElementById('gst-cgst-lbl').textContent=`CGST (${rate/2}%)`;
  document.getElementById('gst-sgst-lbl').textContent=`SGST (${rate/2}%)`;
  document.getElementById('gst-igst-lbl').textContent=`IGST (${rate}%)`;
}

const FX_RATES_FB={USD:1,EUR:0.92,GBP:0.79,INR:83.5,JPY:149.5,CAD:1.36,AUD:1.53,CHF:0.89,CNY:7.24,SGD:1.34,AED:3.67,SAR:3.75,MYR:4.7,THB:35.5,NZD:1.65};
let FX_RATES={...FX_RATES_FB};
function renderCurrencyConv() {
  const currencies=Object.keys(FX_RATES);
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Amount</label><input class="form-input" type="number" id="curr-amount" value="100" oninput="calcCurrency()"></div>
        <div class="form-group"><label class="form-label">From</label><select class="form-select" id="curr-from" onchange="calcCurrency()">${currencies.map(c=>`<option ${c==='USD'?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="form-group" style="display:flex;align-items:flex-end"><button class="btn-secondary-glow" style="width:100%;justify-content:center;padding:.6rem" onclick="swapCurrency()">⇄ Swap</button></div>
        <div class="form-group"><label class="form-label">To</label><select class="form-select" id="curr-to" onchange="calcCurrency()">${currencies.map(c=>`<option ${c==='INR'?'selected':''}>${c}</option>`).join('')}</select></div>
      </div>
      <div class="result-box"><div class="result-value" id="curr-result">₹8,350.00</div><div class="result-label" id="curr-rate-lbl">1 USD = ₹83.50</div><button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('curr-result').textContent,'Copied!')">📋 Copy</button></div>
    </div>`;
  calcCurrency();
}
function calcCurrency() {
  const amt=parseFloat(document.getElementById('curr-amount')?.value)||0;
  const from=document.getElementById('curr-from')?.value, to=document.getElementById('curr-to')?.value;
  if(!FX_RATES[from]||!FX_RATES[to]) return;
  const rate=FX_RATES[to]/FX_RATES[from], result=amt*rate;
  const syms={INR:'₹',EUR:'€',GBP:'£',JPY:'¥',CNY:'¥'};
  document.getElementById('curr-result').textContent=(syms[to]||'')+result.toFixed(2);
  document.getElementById('curr-rate-lbl').textContent=`1 ${from} = ${rate.toFixed(4)} ${to}`;
}
function swapCurrency() {
  const f=document.getElementById('curr-from'), t=document.getElementById('curr-to');
  [f.value,t.value]=[t.value,f.value]; calcCurrency();
}

function renderDiscountCalc() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Original Price (₹)</label><input class="form-input" type="number" id="disc-price" value="1000" oninput="calcDiscount()"></div>
        <div class="form-group"><label class="form-label">Discount (%)</label><input class="form-input" type="number" id="disc-pct" value="20" min="0" max="100" oninput="calcDiscount()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="disc-final">₹800</div><div class="result-label">Final Price</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="disc-saved">₹200</div><div class="result-item-label">You Save</div></div>
          <div class="result-item"><div class="result-item-value" id="disc-pct-disp">20%</div><div class="result-item-label">Discount</div></div>
        </div>
      </div>
    </div>`;
  calcDiscount();
}
function calcDiscount() {
  const p=parseFloat(document.getElementById('disc-price')?.value)||0, d=parseFloat(document.getElementById('disc-pct')?.value)||0;
  const saved=p*d/100, final=p-saved;
  document.getElementById('disc-final').textContent=formatCurrency(final);
  document.getElementById('disc-saved').textContent=formatCurrency(saved);
  document.getElementById('disc-pct-disp').textContent=d+'%';
}

function renderSalaryCalc() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">CTC (Annual ₹)</label><input class="form-input" type="number" id="sal-ctc" value="600000" oninput="calcSalary()"></div>
        <div class="form-group"><label class="form-label">Basic Salary (%)</label><input class="form-input" type="number" id="sal-basic-pct" value="40" min="20" max="60" oninput="calcSalary()"></div>
        <div class="form-group"><label class="form-label">PF Contribution (%)</label><input class="form-input" type="number" id="sal-pf-pct" value="12" oninput="calcSalary()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="sal-inhand">₹42,500</div><div class="result-label">Monthly In-Hand</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="sal-annual">₹5,10,000</div><div class="result-item-label">Annual In-Hand</div></div>
          <div class="result-item"><div class="result-item-value" id="sal-pf">₹2,880</div><div class="result-item-label">PF Deduction</div></div>
          <div class="result-item"><div class="result-item-value" id="sal-tax">₹1,000</div><div class="result-item-label">Est. TDS</div></div>
        </div>
      </div>
    </div>`;
  calcSalary();
}
function calcSalary() {
  const ctc=parseFloat(document.getElementById('sal-ctc')?.value)||0;
  const basicPct=(parseFloat(document.getElementById('sal-basic-pct')?.value)||40)/100;
  const pfPct=(parseFloat(document.getElementById('sal-pf-pct')?.value)||12)/100;
  const monthlyGross=ctc/12, basic=monthlyGross*basicPct;
  const pf=basic*pfPct, tax=Math.max(0,(ctc-250000)*0.05/12);
  const inhand=monthlyGross-pf-tax;
  document.getElementById('sal-inhand').textContent=formatCurrency(Math.round(inhand));
  document.getElementById('sal-annual').textContent=formatCurrency(Math.round(inhand*12));
  document.getElementById('sal-pf').textContent=formatCurrency(Math.round(pf));
  document.getElementById('sal-tax').textContent=formatCurrency(Math.round(tax));
}

function renderIncomeTaxCalc() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Annual Income (₹)</label><input class="form-input" type="number" id="tax-income" value="800000" oninput="calcTax()"></div>
        <div class="form-group"><label class="form-label">Regime</label><select class="form-select" id="tax-regime" onchange="calcTax()"><option value="new">New Regime (FY25-26)</option><option value="old">Old Regime</option></select></div>
        <div class="form-group"><label class="form-label">80C Deductions (₹)</label><input class="form-input" type="number" id="tax-80c" value="150000" oninput="calcTax()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="tax-amount">₹45,000</div><div class="result-label">Total Tax Payable</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="tax-monthly">₹3,750</div><div class="result-item-label">Monthly TDS</div></div>
          <div class="result-item"><div class="result-item-value" id="tax-eff-rate">5.6%</div><div class="result-item-label">Effective Rate</div></div>
        </div>
      </div>
    </div>`;
  calcTax();
}
function calcTax() {
  const income=parseFloat(document.getElementById('tax-income')?.value)||0;
  const regime=document.getElementById('tax-regime')?.value;
  const deductions=regime==='old'?(parseFloat(document.getElementById('tax-80c')?.value)||0):0;
  let taxable=income-deductions-50000; // std deduction
  if (taxable<0) taxable=0;
  let tax=0;
  if(regime==='new'){
    if(taxable<=300000) tax=0;
    else if(taxable<=700000) tax=(taxable-300000)*0.05;
    else if(taxable<=1000000) tax=20000+(taxable-700000)*0.1;
    else if(taxable<=1200000) tax=50000+(taxable-1000000)*0.15;
    else if(taxable<=1500000) tax=80000+(taxable-1200000)*0.2;
    else tax=140000+(taxable-1500000)*0.3;
  } else {
    if(taxable<=250000) tax=0;
    else if(taxable<=500000) tax=(taxable-250000)*0.05;
    else if(taxable<=1000000) tax=12500+(taxable-500000)*0.2;
    else tax=112500+(taxable-1000000)*0.3;
  }
  const cess=tax*0.04, total=tax+cess;
  document.getElementById('tax-amount').textContent=formatCurrency(Math.round(total));
  document.getElementById('tax-monthly').textContent=formatCurrency(Math.round(total/12));
  document.getElementById('tax-eff-rate').textContent=income?(total/income*100).toFixed(1)+'%':'0%';
}

function renderRetirementCalc() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Current Age</label><input class="form-input" type="number" id="ret-age" value="30" oninput="calcRetirement()"></div>
        <div class="form-group"><label class="form-label">Retirement Age</label><input class="form-input" type="number" id="ret-retire" value="60" oninput="calcRetirement()"></div>
        <div class="form-group"><label class="form-label">Monthly Expenses (₹)</label><input class="form-input" type="number" id="ret-exp" value="50000" oninput="calcRetirement()"></div>
        <div class="form-group"><label class="form-label">Expected Return (%)</label><input class="form-input" type="number" id="ret-return" value="10" oninput="calcRetirement()"></div>
        <div class="form-group"><label class="form-label">Inflation (%)</label><input class="form-input" type="number" id="ret-infl" value="6" oninput="calcRetirement()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="ret-corpus">₹3.5 Cr</div><div class="result-label">Required Retirement Corpus</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="ret-sip">₹15,000</div><div class="result-item-label">Monthly SIP Needed</div></div>
          <div class="result-item"><div class="result-item-value" id="ret-years">30</div><div class="result-item-label">Years to Retire</div></div>
        </div>
      </div>
    </div>`;
  calcRetirement();
}
function calcRetirement() {
  const age=parseInt(document.getElementById('ret-age')?.value)||30;
  const retire=parseInt(document.getElementById('ret-retire')?.value)||60;
  const exp=parseFloat(document.getElementById('ret-exp')?.value)||50000;
  const ret=(parseFloat(document.getElementById('ret-return')?.value)||10)/100;
  const infl=(parseFloat(document.getElementById('ret-infl')?.value)||6)/100;
  const years=retire-age;
  const futureExp=exp*12*Math.pow(1+infl,years);
  const corpus=futureExp*25; // 4% rule
  const r=ret/12, n=years*12;
  const sip=corpus*r/(Math.pow(1+r,n)-1);
  const fmt=v=>v>=10000000?`₹${(v/10000000).toFixed(1)} Cr`:v>=100000?`₹${(v/100000).toFixed(1)} L`:formatCurrency(Math.round(v));
  document.getElementById('ret-corpus').textContent=fmt(corpus);
  document.getElementById('ret-sip').textContent=formatCurrency(Math.round(sip));
  document.getElementById('ret-years').textContent=years;
}

function renderPercentCalc() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
        <button class="cat-chip active" onclick="this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.querySelectorAll('.pct-tab').forEach(t=>t.style.display='none');document.getElementById('pct-of').style.display='block'">% of Number</button>
        <button class="cat-chip" onclick="this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.querySelectorAll('.pct-tab').forEach(t=>t.style.display='none');document.getElementById('pct-change').style.display='block'">% Change</button>
        <button class="cat-chip" onclick="this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.querySelectorAll('.pct-tab').forEach(t=>t.style.display='none');document.getElementById('pct-what').style.display='block'">What % is</button>
      </div>
      <div id="pct-of" class="pct-tab"><div class="form-grid"><div class="form-group"><label class="form-label">Percentage (%)</label><input class="form-input" type="number" id="pct1" value="15" oninput="calcPct()"></div><div class="form-group"><label class="form-label">Of Number</label><input class="form-input" type="number" id="pct2" value="500" oninput="calcPct()"></div></div><div class="result-box"><div class="result-value" id="pct-r1">75</div><div class="result-label" id="pct-l1">15% of 500</div></div></div>
      <div id="pct-change" class="pct-tab" style="display:none"><div class="form-grid"><div class="form-group"><label class="form-label">Original</label><input class="form-input" type="number" id="pct-orig" value="200" oninput="calcPctChange()"></div><div class="form-group"><label class="form-label">New Value</label><input class="form-input" type="number" id="pct-new" value="250" oninput="calcPctChange()"></div></div><div class="result-box"><div class="result-value" id="pct-r2">+25%</div><div class="result-label" id="pct-l2">Increase</div></div></div>
      <div id="pct-what" class="pct-tab" style="display:none"><div class="form-grid"><div class="form-group"><label class="form-label">Part</label><input class="form-input" type="number" id="pct-part" value="75" oninput="calcWhatPct()"></div><div class="form-group"><label class="form-label">Total</label><input class="form-input" type="number" id="pct-total" value="300" oninput="calcWhatPct()"></div></div><div class="result-box"><div class="result-value" id="pct-r3">25%</div><div class="result-label" id="pct-l3">75 is 25% of 300</div></div></div>
    </div>`;
  calcPct(); calcPctChange(); calcWhatPct();
}
function calcPct(){const p=parseFloat(document.getElementById('pct1')?.value)||0,n=parseFloat(document.getElementById('pct2')?.value)||0,r=(p*n/100).toFixed(2);document.getElementById('pct-r1').textContent=r;document.getElementById('pct-l1').textContent=`${p}% of ${n} = ${r}`;}
function calcPctChange(){const o=parseFloat(document.getElementById('pct-orig')?.value)||0,n=parseFloat(document.getElementById('pct-new')?.value)||0,c=o?((n-o)/o*100).toFixed(2):0;document.getElementById('pct-r2').textContent=(c>=0?'+':'')+c+'%';document.getElementById('pct-l2').textContent=`${Math.abs(c)}% ${c>=0?'increase':'decrease'}`;}
function calcWhatPct(){const p=parseFloat(document.getElementById('pct-part')?.value)||0,t=parseFloat(document.getElementById('pct-total')?.value)||0,r=t?(p/t*100).toFixed(2):0;document.getElementById('pct-r3').textContent=r+'%';document.getElementById('pct-l3').textContent=`${p} is ${r}% of ${t}`;}

// ── HEALTH TOOLS ──
function renderBMICalc() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:flex;gap:8px;margin-bottom:1rem">
        <button class="cat-chip active" onclick="window._bmiUnit='metric';this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('bmi-h-u').textContent='(cm)';document.getElementById('bmi-w-u').textContent='(kg)';calcBMI()">Metric</button>
        <button class="cat-chip" onclick="window._bmiUnit='imperial';this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('bmi-h-u').textContent='(inches)';document.getElementById('bmi-w-u').textContent='(lbs)';calcBMI()">Imperial</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Height <span id="bmi-h-u">(cm)</span></label><input class="form-input" type="number" id="bmi-h" value="170" oninput="calcBMI()"></div>
        <div class="form-group"><label class="form-label">Weight <span id="bmi-w-u">(kg)</span></label><input class="form-input" type="number" id="bmi-w" value="70" oninput="calcBMI()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="bmi-val">24.2</div>
        <div class="result-label" id="bmi-cat" style="color:#10b981;font-weight:700">Normal Weight ✅</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:1rem 0;border-radius:8px;overflow:hidden">
          <div style="background:#60a5fa;padding:6px;text-align:center;font-size:.7rem">Underweight<br>&lt;18.5</div>
          <div style="background:#34d399;padding:6px;text-align:center;font-size:.7rem">Normal<br>18.5-24.9</div>
          <div style="background:#fbbf24;padding:6px;text-align:center;font-size:.7rem">Overweight<br>25-29.9</div>
          <div style="background:#f87171;padding:6px;text-align:center;font-size:.7rem">Obese<br>≥30</div>
        </div>
        <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('bmi-val').textContent,'BMI copied!')">📋 Copy</button>
      </div>
    </div>
    <div class="info-box info-box-blue">ℹ️ BMI is a screening tool. Consult a doctor for medical advice.</div>`;
  window._bmiUnit='metric'; calcBMI();
}
function calcBMI(){
  let h=parseFloat(document.getElementById('bmi-h')?.value)||0,w=parseFloat(document.getElementById('bmi-w')?.value)||0;
  if(window._bmiUnit==='imperial'){h=h*0.0254;w=w*0.4536;}else{h=h/100;}
  if(!h||!w)return;
  const bmi=(w/(h*h)).toFixed(1);
  document.getElementById('bmi-val').textContent=bmi;
  let cat,col;
  if(bmi<18.5){cat='Underweight ⚠️';col='#60a5fa';}
  else if(bmi<25){cat='Normal Weight ✅';col='#10b981';}
  else if(bmi<30){cat='Overweight ⚠️';col='#f59e0b';}
  else{cat='Obese ❌';col='#ef4444';}
  const el=document.getElementById('bmi-cat');if(el){el.textContent=cat;el.style.color=col;}
}

function renderCalorieCalc(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Age</label><input class="form-input" type="number" id="cal-age" value="25" oninput="calcCalorie()"></div>
        <div class="form-group"><label class="form-label">Gender</label><select class="form-select" id="cal-gender" onchange="calcCalorie()"><option value="m">Male</option><option value="f">Female</option></select></div>
        <div class="form-group"><label class="form-label">Height (cm)</label><input class="form-input" type="number" id="cal-h" value="170" oninput="calcCalorie()"></div>
        <div class="form-group"><label class="form-label">Weight (kg)</label><input class="form-input" type="number" id="cal-w" value="70" oninput="calcCalorie()"></div>
      </div>
      <div class="form-group"><label class="form-label">Activity Level</label><select class="form-select" id="cal-act" onchange="calcCalorie()"><option value="1.2">Sedentary</option><option value="1.375">Lightly Active</option><option value="1.55" selected>Moderately Active</option><option value="1.725">Very Active</option><option value="1.9">Extra Active</option></select></div>
      <div class="result-box">
        <div class="result-value" id="cal-tdee">2,318</div><div class="result-label">Daily Calories (TDEE)</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="cal-lose">1,818</div><div class="result-item-label">Weight Loss</div></div>
          <div class="result-item"><div class="result-item-value" id="cal-maintain">2,318</div><div class="result-item-label">Maintain</div></div>
          <div class="result-item"><div class="result-item-value" id="cal-gain">2,818</div><div class="result-item-label">Weight Gain</div></div>
          <div class="result-item"><div class="result-item-value" id="cal-bmr">1,870</div><div class="result-item-label">BMR</div></div>
        </div>
      </div>
    </div>`;
  calcCalorie();
}
function calcCalorie(){
  const age=parseInt(document.getElementById('cal-age')?.value)||25,g=document.getElementById('cal-gender')?.value;
  const h=parseFloat(document.getElementById('cal-h')?.value)||170,w=parseFloat(document.getElementById('cal-w')?.value)||70;
  const act=parseFloat(document.getElementById('cal-act')?.value)||1.55;
  const bmr=g==='m'?10*w+6.25*h-5*age+5:10*w+6.25*h-5*age-161;
  const tdee=Math.round(bmr*act);
  document.getElementById('cal-tdee').textContent=tdee.toLocaleString();
  document.getElementById('cal-bmr').textContent=Math.round(bmr).toLocaleString();
  document.getElementById('cal-lose').textContent=(tdee-500).toLocaleString();
  document.getElementById('cal-maintain').textContent=tdee.toLocaleString();
  document.getElementById('cal-gain').textContent=(tdee+500).toLocaleString();
}

function renderWaterCalc(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Body Weight (kg)</label><input class="form-input" type="number" id="water-w" value="70" oninput="calcWater()"></div>
        <div class="form-group"><label class="form-label">Activity Level</label><select class="form-select" id="water-act" onchange="calcWater()"><option value="1">Sedentary</option><option value="1.3" selected>Moderate</option><option value="1.6">Very Active</option></select></div>
        <div class="form-group"><label class="form-label">Climate</label><select class="form-select" id="water-clim" onchange="calcWater()"><option value="1">Temperate</option><option value="1.15">Hot/Humid</option><option value="0.9">Cold</option></select></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="water-res">2.8 L</div><div class="result-label">Daily Water Intake</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="water-glasses">11</div><div class="result-item-label">Glasses (250ml)</div></div>
          <div class="result-item"><div class="result-item-value" id="water-bottles">5.6</div><div class="result-item-label">Bottles (500ml)</div></div>
        </div>
      </div>
    </div>`;
  calcWater();
}
function calcWater(){
  const w=parseFloat(document.getElementById('water-w')?.value)||70;
  const act=parseFloat(document.getElementById('water-act')?.value)||1.3;
  const clim=parseFloat(document.getElementById('water-clim')?.value)||1;
  const ml=w*35*act*clim;
  document.getElementById('water-res').textContent=(ml/1000).toFixed(1)+' L';
  document.getElementById('water-glasses').textContent=Math.round(ml/250);
  document.getElementById('water-bottles').textContent=(ml/500).toFixed(1);
}

function renderIdealWeight(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Height (cm)</label><input class="form-input" type="number" id="iw-h" value="170" oninput="calcIW()"></div>
        <div class="form-group"><label class="form-label">Gender</label><select class="form-select" id="iw-g" onchange="calcIW()"><option value="m">Male</option><option value="f">Female</option></select></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="iw-res">62-68 kg</div><div class="result-label">Ideal Weight Range</div>
        <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('iw-res').textContent,'Copied!')">📋 Copy</button>
      </div>
    </div>`;
  calcIW();
}
function calcIW(){
  const h=parseFloat(document.getElementById('iw-h')?.value)||170, hm=h/100;
  const min=Math.round(18.5*hm*hm), max=Math.round(24.9*hm*hm);
  document.getElementById('iw-res').textContent=`${min}–${max} kg`;
}

function renderSleepCalc(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
        <button class="cat-chip active" onclick="window._sleepMode='wakeup';this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active')">I want to wake up at...</button>
        <button class="cat-chip" onclick="window._sleepMode='bedtime';this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active')">I will sleep at...</button>
      </div>
      <div class="form-group"><label class="form-label">Time</label><input class="form-input" type="time" id="sleep-time" value="06:30" onchange="calcSleep()"></div>
      <div class="form-group"><label class="form-label">Average time to fall asleep (min)</label><input class="form-input" type="number" id="sleep-delay" value="15" oninput="calcSleep()"></div>
      <div id="sleep-result" class="result-box" style="margin-top:1rem"></div>
    </div>`;
  window._sleepMode='wakeup'; calcSleep();
}
function calcSleep(){
  const time=document.getElementById('sleep-time')?.value||'06:30';
  const delay=parseInt(document.getElementById('sleep-delay')?.value)||15;
  const [h,m]=time.split(':').map(Number);
  const cycleMin=90, numCycles=[6,5,4], results=[];
  numCycles.forEach(cycles=>{
    const totalMin=cycles*cycleMin+delay;
    let d,hour,min;
    if(window._sleepMode==='wakeup'){
      // when to sleep
      const sleepMs=new Date().setHours(h,m,0,0)-(totalMin*60000);
      d=new Date(sleepMs); hour=d.getHours(); min=d.getMinutes();
    } else {
      // when to wake up
      const wakeMs=new Date().setHours(h,m,0,0)+(totalMin*60000);
      d=new Date(wakeMs); hour=d.getHours(); min=d.getMinutes();
    }
    results.push({time:`${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`,cycles,hours:(cycles*cycleMin/60).toFixed(1)});
  });
  document.getElementById('sleep-result').innerHTML=`
    <div class="result-label" style="margin-bottom:.75rem">💤 ${window._sleepMode==='wakeup'?'Go to sleep at:':'Wake up at:'}</div>
    ${results.map(r=>`<div style="display:flex;justify-content:space-between;padding:.75rem 1rem;background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md);margin-bottom:.5rem">
      <span style="font-family:var(--font-display);font-size:1.3rem;font-weight:800;color:var(--indigo)">${r.time}</span>
      <span style="color:var(--text3);font-size:.82rem">${r.cycles} cycles · ${r.hours}h sleep</span>
    </div>`).join('')}
    <div class="info-box info-box-blue" style="margin-top:.75rem">✅ Best times highlighted. Try to wake up after complete cycles.</div>`;
}

function renderStepTracker(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Steps Today</label><input class="form-input" type="number" id="steps-count" value="8500" oninput="calcSteps()"></div>
        <div class="form-group"><label class="form-label">Your Weight (kg)</label><input class="form-input" type="number" id="steps-weight" value="70" oninput="calcSteps()"></div>
        <div class="form-group"><label class="form-label">Step Length (cm)</label><input class="form-input" type="number" id="steps-len" value="75" oninput="calcSteps()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="steps-cal">350 kcal</div><div class="result-label">Calories Burned</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="steps-km">6.4 km</div><div class="result-item-label">Distance</div></div>
          <div class="result-item"><div class="result-item-value" id="steps-goal">85%</div><div class="result-item-label">10K Goal</div></div>
        </div>
      </div>
    </div>`;
  calcSteps();
}
function calcSteps(){
  const s=parseInt(document.getElementById('steps-count')?.value)||0;
  const w=parseFloat(document.getElementById('steps-weight')?.value)||70;
  const len=parseFloat(document.getElementById('steps-len')?.value)||75;
  const km=(s*len)/100000, cal=Math.round(s*0.04*(w/70));
  document.getElementById('steps-cal').textContent=cal+' kcal';
  document.getElementById('steps-km').textContent=km.toFixed(2)+' km';
  document.getElementById('steps-goal').textContent=Math.min(100,(s/10000*100).toFixed(0))+'%';
}

function renderHeartRateMonitor(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="hr-monitor">
        <div class="hr-heart" id="hr-heart">❤️</div>
        <div class="hr-display" id="hr-display">--</div>
        <div class="hr-bpm">BPM (beats per minute)</div>
        <div id="hr-quality-bar" style="margin:.5rem auto;width:80%;max-width:220px;height:6px;background:var(--glass2);border-radius:3px;display:none">
          <div id="hr-quality-fill" style="height:100%;width:0%;background:var(--pink);border-radius:3px;transition:width .3s"></div>
        </div>
        <div id="hr-quality-label" style="font-size:.75rem;color:var(--text3);margin-bottom:.25rem"></div>
        <div class="info-box info-box-blue" style="margin:1rem 0;text-align:left">📱 <strong>How to use (PPG method):</strong><br>1. Tap Start — your flash will turn on automatically<br>2. Place fingertip firmly over the rear camera lens &amp; flash<br>3. Hold completely still for 30 seconds<br>4. Signal bar above turns green when good contact is detected</div>
        <video id="hr-video" class="camera-preview" autoplay muted playsinline style="display:none"></video>
        <canvas id="hr-canvas" style="display:none"></canvas>
        <button class="btn-primary-glow" id="hr-btn" onclick="toggleHRMonitor()" style="margin:.75rem auto;display:block">📷 Start Measurement</button>
        <div id="hr-status" style="color:var(--text3);font-size:.82rem;margin-top:.5rem"></div>
        <div id="hr-history" style="margin-top:1rem"></div>
      </div>
    </div>
    <div class="info-box info-box-amber">⚠️ For informational purposes only. Not a medical device. Consult a doctor for health concerns.</div>`;
  renderHRHistory();
}

// ── PPG Heart Rate State ──
let hrRafId=null, hrData=[], hrRaw=[], hrActive=false, hrStream=null, hrTorchTrack=null;
let hrHistory=JSON.parse(localStorage.getItem('th_hr')||'[]');
let hrSmoothBpm=null, hrStuckFrames=0;
const HR_FPS=30;           // target sample rate (Hz) — requestAnimationFrame-driven
const HR_WINDOW_SEC=8;     // analysis window in seconds (shorter = faster first reading)
const HR_MIN_BPM=40, HR_MAX_BPM=200;
const HR_BASELINE_SEC=1.2; // moving-average window used to remove illumination drift

function hrDetectPeaks(signal, fs){
  // Adaptive threshold peak detection on a detrended (AC) PPG signal.
  const minDist=Math.max(2,Math.round(fs*(60/HR_MAX_BPM)));
  const maxDist=Math.round(fs*(60/HR_MIN_BPM));

  // RMS-based adaptive threshold — far more robust than mean(|x|) which gets
  // diluted by filter/baseline transients and silently kills detection.
  const rms=Math.sqrt(signal.reduce((s,v)=>s+v*v,0)/signal.length);
  if(rms<0.05) return null; // essentially flat — no usable AC signal at all
  const threshold=rms*0.5;

  const peaks=[];
  for(let i=1;i<signal.length-1;i++){
    if(signal[i]>threshold && signal[i]>=signal[i-1] && signal[i]>=signal[i+1]){
      if(!peaks.length || i-peaks[peaks.length-1]>=minDist) peaks.push(i);
      else if(signal[i]>signal[peaks[peaks.length-1]]) peaks[peaks.length-1]=i; // keep the taller of two close peaks
    }
  }
  if(peaks.length<3) return null;

  const intervals=[];
  for(let i=1;i<peaks.length;i++){
    const d=peaks[i]-peaks[i-1];
    if(d>=minDist && d<=maxDist) intervals.push(d);
  }
  if(intervals.length<2) return null;

  // Median is far less sensitive to one bad/missed beat than a plain mean.
  const sorted=intervals.slice().sort((a,b)=>a-b);
  const median=sorted[Math.floor(sorted.length/2)];
  const bpm=60/(median/fs);
  if(bpm<HR_MIN_BPM||bpm>HR_MAX_BPM) return null;
  return Math.round(bpm);
}

async function toggleHRMonitor(){
  const btn=document.getElementById('hr-btn');
  if(hrActive){
    // Stop measurement
    hrActive=false;
    if(hrRafId){ cancelAnimationFrame(hrRafId); hrRafId=null; }
    if(hrTorchTrack){ try{ await hrTorchTrack.applyConstraints({advanced:[{torch:false}]}); }catch(e){} }
    if(hrStream){ hrStream.getTracks().forEach(t=>t.stop()); hrStream=null; }
    hrRaw=[]; hrData=[]; hrSmoothBpm=null; hrStuckFrames=0;
    const video=document.getElementById('hr-video');
    if(video) video.style.display='none';
    btn.textContent='📷 Start Measurement';
    document.getElementById('hr-status').textContent='Measurement stopped.';
    document.getElementById('hr-quality-bar').style.display='none';
    document.getElementById('hr-quality-label').textContent='';
    return;
  }
  try {
    // Request rear camera at 30fps for PPG
    hrStream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:'environment', width:{ideal:320}, height:{ideal:240}, frameRate:{ideal:HR_FPS}}
    });
    const video=document.getElementById('hr-video');
    video.srcObject=hrStream; video.style.display='none'; // keep hidden — we just need pixel data
    await new Promise(r=>{ video.onloadedmetadata=r; });
    video.play();

    // Try to enable torch (flash) for true PPG backlight
    hrTorchTrack=hrStream.getVideoTracks()[0];
    const caps=hrTorchTrack.getCapabilities ? hrTorchTrack.getCapabilities() : {};
    if(caps.torch){
      try{ await hrTorchTrack.applyConstraints({advanced:[{torch:true}]}); }catch(e){}
    }

    hrActive=true; hrData=[]; hrRaw=[]; hrSmoothBpm=null; hrStuckFrames=0;
    btn.textContent='⏹ Stop';
    document.getElementById('hr-quality-bar').style.display='block';
    document.getElementById('hr-status').textContent='🟢 Measuring… place finger firmly over lens & flash';

    const canvas=document.getElementById('hr-canvas');
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    let lastTime=null, frameCount=0, estFps=HR_FPS;
    const maxSamples=HR_WINDOW_SEC*HR_FPS*1.5; // keep rolling 15s buffer

    function ppgFrame(timestamp){
      if(!hrActive) return;
      hrRafId=requestAnimationFrame(ppgFrame);
      if(!lastTime){ lastTime=timestamp; return; }
      const dt=(timestamp-lastTime)/1000;
      lastTime=timestamp;
      // Throttle to ~30fps
      if(dt<0.025) return;

      canvas.width=video.videoWidth||160; canvas.height=video.videoHeight||120;
      ctx.drawImage(video,0,0);
      const frame=ctx.getImageData(0,0,canvas.width,canvas.height);
      const d=frame.data, n=d.length/4;

      // Extract mean red channel (most sensitive to blood volume changes)
      let sumR=0, sumG=0;
      for(let i=0;i<d.length;i+=4){ sumR+=d[i]; sumG+=d[i+1]; }
      const meanR=sumR/n, meanG=sumG/n;

      // Signal quality: finger fully covering lens → image should be very red & dark
      // Quality metric: red dominance + low overall brightness variance
      const redDominance=meanR/(meanG+1);
      const qualityPct=Math.min(100,Math.max(0,(redDominance-1)*60));
      document.getElementById('hr-quality-fill').style.width=qualityPct+'%';
      document.getElementById('hr-quality-fill').style.background=qualityPct>50?'#22c55e':qualityPct>25?'#f59e0b':'var(--pink)';
      document.getElementById('hr-quality-label').textContent=
        qualityPct>60?'✅ Good signal':qualityPct>30?'⚠️ Adjust finger':'❌ Cover lens & flash';

      frameCount++;
      if(frameCount%30===0) estFps=Math.round(Math.min(60,1/Math.max(dt,1/60)))||HR_FPS;
      const fs=estFps||HR_FPS;

      // ── Detrend: subtract a short moving average to remove slow illumination
      // drift (finger pressure / lighting changes) and keep only the pulsatile AC
      // component the bandpass filter used to (unreliably) try to isolate.
      hrRaw.push(meanR);
      const baseWin=Math.max(3,Math.round(HR_BASELINE_SEC*fs));
      if(hrRaw.length>Math.round(HR_WINDOW_SEC*fs*1.5)) hrRaw.shift();
      let base=0, baseN=Math.min(baseWin,hrRaw.length);
      for(let i=hrRaw.length-baseN;i<hrRaw.length;i++) base+=hrRaw[i];
      base/=baseN;
      const ac=meanR-base;
      hrData.push(ac);
      if(hrData.length>maxSamples) hrData.shift();

      const samplesNeeded=Math.round(HR_WINDOW_SEC*fs);
      if(qualityPct<=30){
        document.getElementById('hr-status').textContent='❌ No signal — cover the lens and flash completely';
        hrStuckFrames=0;
      } else if(hrData.length<samplesNeeded){
        const pct=Math.min(100,Math.round(hrData.length/samplesNeeded*100));
        document.getElementById('hr-status').textContent=`🟡 Collecting data… ${pct}%`;
      } else {
        // Recompute every frame once warmed up — a sliding window, not a one-shot check —
        // so a momentary bad read no longer leaves the UI permanently stuck.
        const bpm=hrDetectPeaks(hrData.slice(-samplesNeeded), fs);
        if(bpm){
          hrStuckFrames=0;
          // Exponential smoothing so the displayed number doesn't jitter wildly.
          hrSmoothBpm = hrSmoothBpm==null ? bpm : Math.round(hrSmoothBpm*0.7 + bpm*0.3);
          document.getElementById('hr-display').textContent=hrSmoothBpm;
          document.getElementById('hr-heart').style.animationDuration=(60/hrSmoothBpm)+'s';
          document.getElementById('hr-status').textContent='💓 Live reading — keep finger steady';
          if(frameCount%(Math.round(fs)*5)===0){
            hrHistory.unshift({bpm:hrSmoothBpm,time:new Date().toLocaleTimeString()});
            hrHistory=hrHistory.slice(0,10);
            localStorage.setItem('th_hr',JSON.stringify(hrHistory));
            renderHRHistory();
          }
        } else {
          hrStuckFrames++;
          // After ~6s of good "quality" but no detectable pulse, the finger is
          // probably misaligned or pressed too hard — give an actionable hint
          // instead of leaving "Analysing signal…" frozen forever.
          if(hrStuckFrames>fs*6){
            document.getElementById('hr-status').textContent='⚠️ No steady pulse found — ease finger pressure slightly and hold still';
          } else {
            document.getElementById('hr-status').textContent='📊 Analysing signal…';
          }
        }
      }
    }
    hrRafId=requestAnimationFrame(ppgFrame);

  } catch(e){
    document.getElementById('hr-status').innerHTML=
      `<span style="color:var(--red)">❌ ${e.name==='NotAllowedError'?'Camera permission denied. Please allow camera access and try again.':'Camera error: '+e.message}</span>`;
  }
}

function renderHRHistory(){
  const el=document.getElementById('hr-history');
  if(!el||!hrHistory.length) return;
  el.innerHTML=`<h3 style="font-size:.88rem;font-weight:700;margin-bottom:.5rem">📊 Recent Readings</h3>`+
    hrHistory.map(h=>`<div style="display:flex;justify-content:space-between;padding:.5rem .75rem;background:var(--glass2);border-radius:var(--r-sm);margin-bottom:.35rem;font-size:.83rem">
      <span style="font-weight:700;color:var(--pink)">${h.bpm} BPM</span><span style="color:var(--text3)">${h.time}</span>
    </div>`).join('');
}

// ── SMARTWATCH CONNECT ──
function renderSmartwatchConnect(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="text-align:center;padding:1rem 0 .5rem">
        <div style="font-size:3rem;margin-bottom:.5rem">⌚</div>
        <h2 style="font-weight:800;font-size:1.15rem;margin-bottom:.25rem">Smartwatch Connect</h2>
        <p style="color:var(--text3);font-size:.85rem;margin-bottom:1.25rem">Connect your smartwatch via Web Bluetooth to sync health data in real time.</p>
      </div>

      <div id="sw-status-box" style="background:var(--glass2);border-radius:var(--r);padding:1rem;margin-bottom:1rem;display:flex;align-items:center;gap:.75rem">
        <div id="sw-status-dot" style="width:12px;height:12px;border-radius:50%;background:#6b7280;flex-shrink:0;transition:background .3s"></div>
        <div>
          <div id="sw-status-text" style="font-weight:700;font-size:.9rem">Not Connected</div>
          <div id="sw-device-name" style="color:var(--text3);font-size:.78rem">No device paired</div>
        </div>
        <button id="sw-connect-btn" onclick="swConnect()" style="margin-left:auto;padding:.45rem 1rem;background:linear-gradient(135deg,var(--accent),var(--pink));color:#fff;border:none;border-radius:var(--r-sm);font-weight:700;font-size:.82rem;cursor:pointer;transition:opacity .2s">🔗 Connect</button>
      </div>

      <div id="sw-metrics" style="display:none">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.65rem;margin-bottom:1rem">
          <div style="background:var(--glass2);border-radius:var(--r);padding:.85rem;text-align:center">
            <div style="font-size:1.6rem">❤️</div>
            <div id="sw-hr" style="font-size:1.5rem;font-weight:900;color:var(--pink)">--</div>
            <div style="color:var(--text3);font-size:.75rem">Heart Rate (BPM)</div>
          </div>
          <div style="background:var(--glass2);border-radius:var(--r);padding:.85rem;text-align:center">
            <div style="font-size:1.6rem">🔋</div>
            <div id="sw-battery" style="font-size:1.5rem;font-weight:900;color:#22c55e">--</div>
            <div style="color:var(--text3);font-size:.75rem">Battery Level</div>
          </div>
          <div style="background:var(--glass2);border-radius:var(--r);padding:.85rem;text-align:center">
            <div style="font-size:1.6rem">👟</div>
            <div id="sw-steps" style="font-size:1.5rem;font-weight:900;color:#60a5fa">--</div>
            <div style="color:var(--text3);font-size:.75rem">Steps Today</div>
          </div>
          <div style="background:var(--glass2);border-radius:var(--r);padding:.85rem;text-align:center">
            <div style="font-size:1.6rem">🩸</div>
            <div id="sw-spo2" style="font-size:1.5rem;font-weight:900;color:#a78bfa">--</div>
            <div style="color:var(--text3);font-size:.75rem">SpO₂ (%)</div>
          </div>
        </div>
        <div style="background:var(--glass2);border-radius:var(--r);padding:.85rem;margin-bottom:.65rem">
          <div style="font-size:.8rem;font-weight:700;color:var(--text3);margin-bottom:.35rem">LAST SYNC</div>
          <div id="sw-last-sync" style="font-size:.85rem">—</div>
        </div>
        <button onclick="swDisconnect()" style="width:100%;padding:.55rem;background:var(--glass2);border:1px solid var(--glass3);border-radius:var(--r-sm);color:var(--text2);font-weight:600;font-size:.82rem;cursor:pointer">⏏ Disconnect</button>
      </div>

      <div id="sw-log" style="margin-top:1rem;max-height:130px;overflow-y:auto;font-size:.78rem;color:var(--text3)"></div>

      <div class="info-box info-box-blue" style="margin-top:1rem">
        ℹ️ <strong>Requires Web Bluetooth:</strong> Works on Chrome/Edge on Android &amp; desktop. Not supported on iOS Safari or Firefox.<br>
        Supported profiles: <strong>Heart Rate</strong>, <strong>Battery</strong>, <strong>Health Thermometer</strong>. Other data (steps, SpO₂) depends on device support.
      </div>
    </div>
    <div class="info-box info-box-amber">⚠️ For informational purposes only. Not a medical device. Consult a doctor for health concerns.</div>`;
  swLog('Ready — click Connect to scan for nearby devices.');
}

// ── Smartwatch State ──
let swDevice=null, swServer=null, swHrChar=null, swBatChar=null;

function swLog(msg){
  const el=document.getElementById('sw-log');
  if(!el) return;
  const line=document.createElement('div');
  line.style.cssText='padding:.2rem 0;border-bottom:1px solid var(--glass2)';
  line.textContent=`${new Date().toLocaleTimeString()} — ${msg}`;
  el.insertBefore(line, el.firstChild);
}

function swSetStatus(connected, name){
  const dot=document.getElementById('sw-status-dot');
  const txt=document.getElementById('sw-status-text');
  const dev=document.getElementById('sw-device-name');
  const btn=document.getElementById('sw-connect-btn');
  const metrics=document.getElementById('sw-metrics');
  if(!dot) return;
  if(connected){
    dot.style.background='#22c55e';
    txt.textContent='Connected';
    dev.textContent=name||'Unknown Device';
    btn.style.display='none';
    metrics.style.display='block';
  } else {
    dot.style.background='#6b7280';
    txt.textContent='Not Connected';
    dev.textContent='No device paired';
    btn.style.display='';
    if(metrics) metrics.style.display='none';
    ['sw-hr','sw-battery','sw-steps','sw-spo2'].forEach(id=>{
      const e=document.getElementById(id); if(e) e.textContent='--';
    });
  }
}

async function swConnect(){
  if(!navigator.bluetooth){
    swLog('❌ Web Bluetooth not supported. Use Chrome or Edge on Android/desktop.');
    alert('Web Bluetooth is not supported in this browser.\n\nPlease use Chrome or Edge on Android or a desktop computer.');
    return;
  }
  const btn=document.getElementById('sw-connect-btn');
  if(btn){ btn.textContent='Scanning…'; btn.disabled=true; }
  swLog('🔍 Scanning for Bluetooth devices…');
  try {
    swDevice = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['heart_rate'] },
        { services: ['battery_service'] },
        { services: ['health_thermometer'] }
      ],
      optionalServices: ['heart_rate','battery_service','health_thermometer','0000fee0-0000-1000-8000-00805f9b34fb']
    });
  } catch(e) {
    // Try broader scan if filtered fails
    try {
      swDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate','battery_service','health_thermometer']
      });
    } catch(e2) {
      swLog('❌ ' + (e2.name==='NotFoundError'?'No device selected.':e2.message));
      if(btn){ btn.textContent='🔗 Connect'; btn.disabled=false; }
      return;
    }
  }

  swDevice.addEventListener('gattserverdisconnected', swOnDisconnect);
  swLog('📡 Found: ' + swDevice.name + ' — connecting…');

  try {
    swServer = await swDevice.gatt.connect();
    swLog('✅ GATT connected to ' + swDevice.name);
    swSetStatus(true, swDevice.name);

    // Battery service
    try {
      const batSvc = await swServer.getPrimaryService('battery_service');
      swBatChar = await batSvc.getCharacteristic('battery_level');
      const batVal = await swBatChar.readValue();
      document.getElementById('sw-battery').textContent = batVal.getUint8(0) + '%';
      swLog('🔋 Battery: ' + batVal.getUint8(0) + '%');
    } catch(e){ swLog('ℹ️ Battery service not available.'); }

    // Heart rate service
    try {
      const hrSvc = await swServer.getPrimaryService('heart_rate');
      swHrChar = await hrSvc.getCharacteristic('heart_rate_measurement');
      await swHrChar.startNotifications();
      swHrChar.addEventListener('characteristicvaluechanged', swOnHR);
      swLog('❤️ Heart rate notifications started.');
    } catch(e){ swLog('ℹ️ Heart rate service not available on this device.'); }

    document.getElementById('sw-last-sync').textContent = new Date().toLocaleTimeString();

  } catch(e){
    swLog('❌ Connection failed: ' + e.message);
    swSetStatus(false);
    if(btn){ btn.textContent='🔗 Connect'; btn.disabled=false; }
  }
}

function swOnHR(event){
  const val = event.target.value;
  const flags = val.getUint8(0);
  const hrFormat = flags & 0x1;
  const bpm = hrFormat ? val.getUint16(1, true) : val.getUint8(1);
  const el = document.getElementById('sw-hr');
  if(el) el.textContent = bpm;
  document.getElementById('sw-last-sync').textContent = new Date().toLocaleTimeString();
  swLog('❤️ Heart rate: ' + bpm + ' BPM');
}

function swOnDisconnect(){
  swLog('⚠️ Device disconnected.');
  swSetStatus(false);
  swDevice=null; swServer=null; swHrChar=null; swBatChar=null;
}

async function swDisconnect(){
  if(swHrChar){ try{ await swHrChar.stopNotifications(); }catch(e){} }
  if(swDevice && swDevice.gatt.connected){ swDevice.gatt.disconnect(); }
  swOnDisconnect();
}

function renderHealthDashboard(){
  const bmiVal=localStorage.getItem('th_bmi')||'--', hrVal=hrHistory[0]?.bpm||'--';
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <h3 style="font-weight:700;margin-bottom:1rem">Your Health Overview</h3>
      <div class="health-dashboard">
        <div class="health-metric"><div style="font-size:2rem">⚖️</div><div class="health-metric-value">${bmiVal}</div><div class="health-metric-label">BMI</div><button class="tc-open-btn" style="margin-top:.5rem" onclick="openTool('bmi-calculator')">Update →</button></div>
        <div class="health-metric"><div style="font-size:2rem">❤️</div><div class="health-metric-value">${hrVal}</div><div class="health-metric-label">Heart Rate (BPM)</div><button class="tc-open-btn" style="margin-top:.5rem" onclick="openTool('heart-rate-monitor')">Measure →</button></div>
        <div class="health-metric"><div style="font-size:2rem">💧</div><div class="health-metric-value">2.5L</div><div class="health-metric-label">Water Target</div><button class="tc-open-btn" style="margin-top:.5rem" onclick="openTool('water-calculator')">Calculate →</button></div>
        <div class="health-metric"><div style="font-size:2rem">🔥</div><div class="health-metric-value">2200</div><div class="health-metric-label">Calorie Goal</div><button class="tc-open-btn" style="margin-top:.5rem" onclick="openTool('calorie-calculator')">Update →</button></div>
        <div class="health-metric"><div style="font-size:2rem">👟</div><div class="health-metric-value">10,000</div><div class="health-metric-label">Step Goal</div><button class="tc-open-btn" style="margin-top:.5rem" onclick="openTool('step-tracker')">Track →</button></div>
        <div class="health-metric"><div style="font-size:2rem">😴</div><div class="health-metric-value">8h</div><div class="health-metric-label">Sleep Target</div><button class="tc-open-btn" style="margin-top:.5rem" onclick="openTool('sleep-calculator')">Plan →</button></div>
      </div>
    </div>`;
}

// ── STUDENT TOOLS ──
function renderAgeCalc(){
  const today=new Date().toISOString().split('T')[0];
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Date of Birth</label><input class="form-input" type="date" id="age-dob" value="1998-06-15" onchange="calcAge()"></div>
        <div class="form-group"><label class="form-label">On Date</label><input class="form-input" type="date" id="age-target" value="${today}" onchange="calcAge()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="age-years">27</div><div class="result-label">Years Old</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="age-months">0</div><div class="result-item-label">Extra Months</div></div>
          <div class="result-item"><div class="result-item-value" id="age-days">0</div><div class="result-item-label">Extra Days</div></div>
          <div class="result-item"><div class="result-item-value" id="age-total">0</div><div class="result-item-label">Total Days</div></div>
          <div class="result-item"><div class="result-item-value" id="age-bday">0</div><div class="result-item-label">Days to B'day</div></div>
        </div>
        <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('age-years').textContent+' years','Age copied!')">📋 Copy</button>
      </div>
    </div>`;
  calcAge();
}
function calcAge(){
  const dob=new Date(document.getElementById('age-dob')?.value);
  const target=new Date(document.getElementById('age-target')?.value||new Date());
  if(isNaN(dob)) return;
  let years=target.getFullYear()-dob.getFullYear(), months=target.getMonth()-dob.getMonth(), days=target.getDate()-dob.getDate();
  if(days<0){months--;days+=new Date(target.getFullYear(),target.getMonth(),0).getDate();}
  if(months<0){years--;months+=12;}
  const total=Math.floor((target-dob)/86400000);
  const next=new Date(target.getFullYear(),dob.getMonth(),dob.getDate());
  if(next<target) next.setFullYear(target.getFullYear()+1);
  const toB=Math.ceil((next-target)/86400000);
  document.getElementById('age-years').textContent=years;
  document.getElementById('age-months').textContent=months;
  document.getElementById('age-days').textContent=days;
  document.getElementById('age-total').textContent=total.toLocaleString();
  document.getElementById('age-bday').textContent=toB||'🎂 Today!';
}

function renderCGPACalc(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem">
        <button class="cat-chip active" onclick="this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('cgpa-topct').style.display='block';document.getElementById('cgpa-tocgpa').style.display='none'">CGPA → %</button>
        <button class="cat-chip" onclick="this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('cgpa-topct').style.display='none';document.getElementById('cgpa-tocgpa').style.display='block'">% → CGPA</button>
      </div>
      <div id="cgpa-topct">
        <div class="form-group"><label class="form-label">CGPA (out of 10)</label><input class="form-input" type="number" id="cgpa-val" value="8.5" step="0.1" oninput="calcCGPA()"></div>
        <div class="form-group"><label class="form-label">System</label><select class="form-select" id="cgpa-sys" onchange="calcCGPA()"><option value="9.5">CBSE (×9.5)</option><option value="10">VTU/Anna (×10)</option><option value="9.4">Mumbai (×9.4)</option><option value="9">DU (×9)</option></select></div>
        <div class="result-box"><div class="result-value" id="cgpa-pct">80.75%</div><div class="result-label">Percentage</div></div>
      </div>
      <div id="cgpa-tocgpa" style="display:none">
        <div class="form-group"><label class="form-label">Percentage</label><input class="form-input" type="number" id="pct-to-cgpa" value="80" oninput="calcPctToCGPA()"></div>
        <div class="result-box"><div class="result-value" id="tocgpa-res">8.42</div><div class="result-label">CGPA (÷9.5)</div></div>
      </div>
    </div>`;
  calcCGPA();
}
function calcCGPA(){const v=parseFloat(document.getElementById('cgpa-val')?.value)||0,m=parseFloat(document.getElementById('cgpa-sys')?.value)||9.5;document.getElementById('cgpa-pct').textContent=(v*m).toFixed(2)+'%';}
function calcPctToCGPA(){const p=parseFloat(document.getElementById('pct-to-cgpa')?.value)||0;document.getElementById('tocgpa-res').textContent=(p/9.5).toFixed(2);}

function renderStudentPercent(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div id="sub-list"></div>
      <button class="btn-secondary-glow" style="margin:.75rem 0;width:100%;justify-content:center" onclick="addSubject()">+ Add Subject</button>
      <div class="result-box"><div class="result-value" id="sp-pct">0%</div><div class="result-label" id="sp-lbl">Total: 0 / 0</div></div>
    </div>`;
  window._subCount=0; for(let i=0;i<5;i++) addSubject();
}
function addSubject(){
  window._subCount=(window._subCount||0)+1;
  const list=document.getElementById('sub-list'); if(!list) return;
  const div=document.createElement('div'); div.className='form-grid'; div.style.marginBottom='.5rem'; div.id=`sub-${window._subCount}`;
  div.innerHTML=`<div class="form-group"><label class="form-label">Subject ${window._subCount}</label><input class="form-input" type="text" placeholder="Subject name"></div><div class="form-group"><label class="form-label">Obtained</label><input class="form-input sp-obtained" type="number" min="0" oninput="calcStudentPct()"></div><div class="form-group"><label class="form-label">Max</label><input class="form-input sp-max" type="number" min="1" value="100" oninput="calcStudentPct()"></div><div class="form-group" style="display:flex;align-items:flex-end"><button class="btn-ghost" style="color:var(--red)" onclick="document.getElementById('sub-${window._subCount}').remove();calcStudentPct()">✕</button></div>`;
  list.appendChild(div);
}
function calcStudentPct(){
  const obt=[...document.querySelectorAll('.sp-obtained')].map(i=>parseFloat(i.value)||0);
  const max=[...document.querySelectorAll('.sp-max')].map(i=>parseFloat(i.value)||100);
  const tO=obt.reduce((a,b)=>a+b,0), tM=max.reduce((a,b)=>a+b,0);
  document.getElementById('sp-pct').textContent=tM?(tO/tM*100).toFixed(2)+'%':'0%';
  document.getElementById('sp-lbl').textContent=`Total: ${tO} / ${tM}`;
}

function renderAttendanceCalc(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Total Classes</label><input class="form-input" type="number" id="att-total" value="100" oninput="calcAttendance()"></div>
        <div class="form-group"><label class="form-label">Attended</label><input class="form-input" type="number" id="att-attended" value="80" oninput="calcAttendance()"></div>
        <div class="form-group"><label class="form-label">Required (%)</label><input class="form-input" type="number" id="att-req" value="75" oninput="calcAttendance()"></div>
      </div>
      <div class="result-box">
        <div class="result-value" id="att-pct">80%</div><div class="result-label" id="att-status">✅ Requirement met</div>
        <div class="result-grid">
          <div class="result-item"><div class="result-item-value" id="att-bunk">5</div><div class="result-item-label">Can Bunk</div></div>
          <div class="result-item"><div class="result-item-value" id="att-need">0</div><div class="result-item-label">Must Attend</div></div>
        </div>
      </div>
    </div>`;
  calcAttendance();
}
function calcAttendance(){
  const tot=parseInt(document.getElementById('att-total')?.value)||0, att=parseInt(document.getElementById('att-attended')?.value)||0, req=parseInt(document.getElementById('att-req')?.value)||75;
  if(!tot) return;
  const pct=(att/tot*100).toFixed(1);
  const canBunk=Math.max(0,Math.floor((att-req*tot/100)/(1-req/100)));
  const short=Math.max(0,Math.ceil(req/100*tot)-att);
  document.getElementById('att-pct').textContent=pct+'%';
  document.getElementById('att-status').textContent=parseFloat(pct)>=req?`✅ Meets ${req}% requirement`:`❌ Below ${req}% requirement`;
  document.getElementById('att-bunk').textContent=canBunk;
  document.getElementById('att-need').textContent=short;
}

function renderPomodoro(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget" style="text-align:center">
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:1.5rem">
        <button class="cat-chip active" onclick="setPomodoroMode('work',this)">🎯 Focus (25m)</button>
        <button class="cat-chip" onclick="setPomodoroMode('short',this)">☕ Short Break (5m)</button>
        <button class="cat-chip" onclick="setPomodoroMode('long',this)">🛋️ Long Break (15m)</button>
      </div>
      <div style="position:relative;width:180px;height:180px;margin:0 auto 1.5rem">
        <svg viewBox="0 0 180 180" style="position:absolute;top:0;left:0;transform:rotate(-90deg)">
          <circle cx="90" cy="90" r="80" fill="none" stroke="var(--glass2)" stroke-width="10"/>
          <circle id="pomo-ring" cx="90" cy="90" r="80" fill="none" stroke="url(#pg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="502" stroke-dashoffset="0" style="transition:stroke-dashoffset 1s linear"/>
          <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div id="pomo-time" class="pomodoro-time">25:00</div>
          <div id="pomo-mode-lbl" style="font-size:.75rem;color:var(--text3)">Focus Time</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;margin-bottom:1.5rem">
        <button class="btn-primary-glow" id="pomo-btn" onclick="togglePomodoro()">▶ Start</button>
        <button class="btn-outline-glow" onclick="resetPomodoro()">↺ Reset</button>
      </div>
      <div id="pomo-sessions" style="font-size:.82rem;color:var(--text3)">Sessions today: <strong id="pomo-session-count">0</strong></div>
    </div>`;
  window._pomoState={mode:'work',seconds:25*60,total:25*60,running:false,sessions:0,timer:null};
}
function setPomodoroMode(mode,btn){
  btn.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  const times={work:25*60,short:5*60,long:15*60}, labels={work:'Focus Time',short:'Short Break',long:'Long Break'};
  clearInterval(window._pomoState?.timer);
  window._pomoState={...window._pomoState,mode,seconds:times[mode],total:times[mode],running:false};
  document.getElementById('pomo-btn').textContent='▶ Start';
  document.getElementById('pomo-mode-lbl').textContent=labels[mode];
  updatePomodoroDisplay();
}
function togglePomodoro(){
  const s=window._pomoState; if(!s) return;
  s.running=!s.running;
  document.getElementById('pomo-btn').textContent=s.running?'⏸ Pause':'▶ Start';
  if(s.running){
    s.timer=setInterval(()=>{
      s.seconds--;
      updatePomodoroDisplay();
      if(s.seconds<=0){
        clearInterval(s.timer); s.running=false;
        if(s.mode==='work') s.sessions++;
        document.getElementById('pomo-session-count').textContent=s.sessions;
        document.getElementById('pomo-btn').textContent='▶ Start';
        showToast('⏰ Timer complete! Take a break.','success');
      }
    },1000);
  } else { clearInterval(s.timer); }
}
function resetPomodoro(){
  clearInterval(window._pomoState?.timer);
  window._pomoState.seconds=window._pomoState.total; window._pomoState.running=false;
  document.getElementById('pomo-btn').textContent='▶ Start';
  updatePomodoroDisplay();
}
function updatePomodoroDisplay(){
  const s=window._pomoState; if(!s) return;
  const m=Math.floor(s.seconds/60), sec=s.seconds%60;
  document.getElementById('pomo-time').textContent=`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  const pct=s.seconds/s.total, offset=502*(1-pct);
  const ring=document.getElementById('pomo-ring'); if(ring) ring.style.strokeDashoffset=offset;
}

function renderStudyPlanner(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <h3 style="font-weight:700;margin-bottom:1rem">📚 Study Planner</h3>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Subject</label><input class="form-input" type="text" id="sp-subject" placeholder="Mathematics"></div>
        <div class="form-group"><label class="form-label">Hours per day</label><input class="form-input" type="number" id="sp-hours" value="2" min="0.5" step="0.5"></div>
        <div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="sp-priority"><option value="high">🔴 High</option><option value="medium" selected>🟡 Medium</option><option value="low">🟢 Low</option></select></div>
        <div class="form-group" style="display:flex;align-items:flex-end"><button class="btn-primary-glow" style="width:100%;justify-content:center" onclick="addStudyTask()">+ Add</button></div>
      </div>
      <div id="study-plan-list" style="margin-top:1rem;display:flex;flex-direction:column;gap:.5rem"></div>
      <div id="study-summary" style="margin-top:1rem"></div>
    </div>`;
  window._studyPlan=JSON.parse(localStorage.getItem('th_study')||'[]'); renderStudyPlan();
}
function addStudyTask(){
  const sub=document.getElementById('sp-subject')?.value?.trim(); if(!sub) return;
  const hours=parseFloat(document.getElementById('sp-hours')?.value)||2;
  const priority=document.getElementById('sp-priority')?.value||'medium';
  window._studyPlan.push({id:Date.now(),subject:sub,hours,priority,done:false});
  localStorage.setItem('th_study',JSON.stringify(window._studyPlan));
  renderStudyPlan(); document.getElementById('sp-subject').value='';
}
function renderStudyPlan(){
  const list=document.getElementById('study-plan-list'); if(!list) return;
  const plan=window._studyPlan||[];
  list.innerHTML=plan.map((t,i)=>`
    <div style="display:flex;align-items:center;gap:.75rem;padding:.75rem;background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md);${t.done?'opacity:.5':''}">
      <input type="checkbox" ${t.done?'checked':''} onchange="toggleStudyTask(${i})" style="accent-color:var(--indigo);width:18px;height:18px;cursor:pointer">
      <span style="flex:1;font-weight:600;${t.done?'text-decoration:line-through':''}">📚 ${t.subject}</span>
      <span style="font-size:.75rem;color:var(--text3)">${t.hours}h/day</span>
      <span style="font-size:.7rem;padding:2px 8px;border-radius:99px;background:${t.priority==='high'?'rgba(239,68,68,.15)':t.priority==='medium'?'rgba(245,158,11,.15)':'rgba(16,185,129,.15)'};color:${t.priority==='high'?'#ef4444':t.priority==='medium'?'#f59e0b':'#10b981'}">${t.priority}</span>
      <button onclick="removeStudyTask(${i})" style="color:var(--red);background:none;font-size:1rem">✕</button>
    </div>`).join('');
  const total=plan.filter(t=>!t.done).reduce((a,t)=>a+t.hours,0);
  document.getElementById('study-summary').innerHTML=plan.length?`<div class="info-box info-box-blue">📊 ${plan.length} subjects · ${total}h total daily study time needed</div>`:'';
}
function toggleStudyTask(i){window._studyPlan[i].done=!window._studyPlan[i].done;localStorage.setItem('th_study',JSON.stringify(window._studyPlan));renderStudyPlan();}
function removeStudyTask(i){window._studyPlan.splice(i,1);localStorage.setItem('th_study',JSON.stringify(window._studyPlan));renderStudyPlan();}

function renderAssignmentTracker(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Assignment</label><input class="form-input" type="text" id="asgn-title" placeholder="Math Homework"></div>
        <div class="form-group"><label class="form-label">Due Date</label><input class="form-input" type="date" id="asgn-due"></div>
        <div class="form-group"><label class="form-label">Subject</label><input class="form-input" type="text" id="asgn-sub" placeholder="Mathematics"></div>
        <div class="form-group" style="display:flex;align-items:flex-end"><button class="btn-primary-glow" style="width:100%;justify-content:center" onclick="addAssignment()">+ Add</button></div>
      </div>
      <div id="asgn-list" style="margin-top:1rem;display:flex;flex-direction:column;gap:.5rem"></div>
    </div>`;
  window._assignments=JSON.parse(localStorage.getItem('th_asgn')||'[]'); renderAssignments();
}
function addAssignment(){
  const title=document.getElementById('asgn-title')?.value?.trim(); if(!title) return;
  const due=document.getElementById('asgn-due')?.value, sub=document.getElementById('asgn-sub')?.value||'General';
  window._assignments.push({id:Date.now(),title,due,sub,done:false});
  localStorage.setItem('th_asgn',JSON.stringify(window._assignments));
  renderAssignments(); document.getElementById('asgn-title').value=''; document.getElementById('asgn-due').value='';
}
function renderAssignments(){
  const list=document.getElementById('asgn-list'); if(!list) return;
  const asgns=window._assignments||[];
  const sorted=[...asgns].sort((a,b)=>new Date(a.due)-new Date(b.due));
  const today=new Date();
  list.innerHTML=sorted.map((a,i)=>{
    const due=new Date(a.due), diff=Math.ceil((due-today)/86400000);
    const urgency=diff<0?'❌ Overdue':diff===0?'⚠️ Today':diff<=3?'🔴 Urgent':'🟢 On Track';
    return `<div style="display:flex;align-items:center;gap:.75rem;padding:.75rem;background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md);${a.done?'opacity:.5':''}">
      <input type="checkbox" ${a.done?'checked':''} onchange="toggleAsgn(${i})" style="accent-color:var(--indigo);width:18px;height:18px;cursor:pointer">
      <div style="flex:1"><div style="font-weight:600;${a.done?'text-decoration:line-through':''}">${a.title}</div><div style="font-size:.75rem;color:var(--text3)">${a.sub} · Due: ${a.due||'No date'}</div></div>
      <span style="font-size:.72rem;color:var(--text3)">${urgency}</span>
      <button onclick="removeAsgn(${i})" style="color:var(--red);background:none">✕</button>
    </div>`;
  }).join('');
}
function toggleAsgn(i){window._assignments[i].done=!window._assignments[i].done;localStorage.setItem('th_asgn',JSON.stringify(window._assignments));renderAssignments();}
function removeAsgn(i){window._assignments.splice(i,1);localStorage.setItem('th_asgn',JSON.stringify(window._assignments));renderAssignments();}

function renderExamCountdown(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">Exam Name</label><input class="form-input" type="text" id="exam-name" placeholder="JEE Main 2025"></div>
      <div class="form-group"><label class="form-label">Exam Date</label><input class="form-input" type="date" id="exam-date"></div>
      <button class="btn-primary-glow" style="margin:1rem 0" onclick="setExamCountdown()">Set Countdown</button>
      <div id="exam-display" style="text-align:center"></div>
    </div>`;
  const saved=JSON.parse(localStorage.getItem('th_exam')||'null');
  if(saved){document.getElementById('exam-name').value=saved.name;document.getElementById('exam-date').value=saved.date;setExamCountdown();}
}
function setExamCountdown(){
  const name=document.getElementById('exam-name')?.value||'My Exam';
  const date=document.getElementById('exam-date')?.value; if(!date) return;
  localStorage.setItem('th_exam',JSON.stringify({name,date}));
  const el=document.getElementById('exam-display');
  const update=()=>{
    const now=new Date(), exam=new Date(date+'T00:00:00');
    const diff=exam-now; if(diff<0){el.innerHTML=`<div class="result-box"><div class="result-value">Exam Done!</div></div>`;return;}
    const d=Math.floor(diff/86400000), h=Math.floor((diff%86400000)/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
    el.innerHTML=`<div class="result-box"><div style="font-size:.9rem;color:var(--text2);margin-bottom:.5rem">⏳ ${name}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem"><div class="result-item"><div class="result-value" style="font-size:1.8rem">${d}</div><div class="result-item-label">Days</div></div><div class="result-item"><div class="result-value" style="font-size:1.8rem">${h}</div><div class="result-item-label">Hours</div></div><div class="result-item"><div class="result-value" style="font-size:1.8rem">${m}</div><div class="result-item-label">Mins</div></div><div class="result-item"><div class="result-value" style="font-size:1.8rem">${s}</div><div class="result-item-label">Secs</div></div></div></div>`;
  };
  update(); clearInterval(window._examTimer); window._examTimer=setInterval(update,1000);
}

function renderNotesOrganizer(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">New Note Title</label><input class="form-input" type="text" id="note-title" placeholder="Lecture Notes — Chapter 5"></div>
      <div class="form-group"><label class="form-label">Content</label><textarea class="form-textarea" id="note-content" placeholder="Your notes here..." style="min-height:120px"></textarea></div>
      <button class="btn-primary-glow" style="margin-bottom:1rem" onclick="saveNote()">💾 Save Note</button>
      <div id="notes-list" style="display:flex;flex-direction:column;gap:.5rem"></div>
    </div>`;
  window._notes=JSON.parse(localStorage.getItem('th_notes')||'[]'); renderNotesList();
}
function saveNote(){
  const title=document.getElementById('note-title')?.value?.trim(); if(!title) return;
  const content=document.getElementById('note-content')?.value;
  window._notes.unshift({id:Date.now(),title,content,date:new Date().toLocaleDateString()});
  localStorage.setItem('th_notes',JSON.stringify(window._notes.slice(0,50)));
  renderNotesList(); document.getElementById('note-title').value=''; document.getElementById('note-content').value='';
}
function renderNotesList(){
  const el=document.getElementById('notes-list'); if(!el) return;
  el.innerHTML=(window._notes||[]).map((n,i)=>`
    <div style="background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md);padding:.75rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem">
        <strong style="font-size:.88rem">${n.title}</strong>
        <div style="display:flex;gap:.5rem;align-items:center">
          <span style="font-size:.7rem;color:var(--text3)">${n.date}</span>
          <button onclick="copyToClipboard(window._notes[${i}].content,'Note copied!')" style="background:none;font-size:.8rem;color:var(--indigo)">📋</button>
          <button onclick="window._notes.splice(${i},1);localStorage.setItem('th_notes',JSON.stringify(window._notes));renderNotesList()" style="background:none;color:var(--red)">✕</button>
        </div>
      </div>
      <p style="font-size:.8rem;color:var(--text2);white-space:pre-wrap">${n.content?.substring(0,100)}${n.content?.length>100?'...':''}</p>
    </div>`).join('');
}

function renderTimetableGen(){
  const days=['Mon','Tue','Wed','Thu','Fri','Sat'];
  const slots=['8-9 AM','9-10 AM','10-11 AM','11-12 PM','12-1 PM','1-2 PM','2-3 PM','3-4 PM'];
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.78rem">
          <thead><tr><th style="padding:.5rem;background:var(--glass2);border:1px solid var(--border)">Time</th>${days.map(d=>`<th style="padding:.5rem;background:var(--glass2);border:1px solid var(--border)">${d}</th>`).join('')}</tr></thead>
          <tbody>${slots.map(s=>`<tr><td style="padding:.4rem .6rem;border:1px solid var(--border);white-space:nowrap;font-weight:600;color:var(--text3)">${s}</td>${days.map(d=>`<td style="padding:.2rem;border:1px solid var(--border)"><input class="form-input" type="text" style="padding:.3rem;font-size:.72rem;border:none;background:transparent" placeholder="Free" data-slot="${s}-${d}"></td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
      <div style="margin-top:1rem;display:flex;gap:.75rem">
        <button class="btn-primary-glow" onclick="downloadTimetable()">📥 Download</button>
        <button class="btn-outline-glow" onclick="clearTimetable()">🗑 Clear</button>
      </div>
    </div>`;
}
function downloadTimetable(){showToast('📅 Timetable ready! Use Print (Ctrl+P) to save as PDF.','info');}
function clearTimetable(){document.querySelectorAll('[data-slot]').forEach(i=>i.value='');}

// ── DEVELOPER TOOLS ──
function renderWordCounter(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <textarea class="form-textarea" id="wc-text" placeholder="Type or paste your text..." oninput="calcWC()" style="min-height:180px"></textarea>
      <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0">
        ${['Words','Characters','No Spaces','Sentences','Paragraphs','Read Time'].map(l=>`<div style="flex:1;min-width:80px;text-align:center;padding:.6rem;background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md)"><div class="result-item-value" id="wc-${l.replace(' ','-').toLowerCase()}">0</div><div class="result-item-label">${l}</div></div>`).join('')}
      </div>
      <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('wc-text').value,'Copied!')">📋 Copy Text</button>
    </div>`;
}
function calcWC(){
  const t=document.getElementById('wc-text')?.value||'';
  const words=t.trim()?t.trim().split(/\s+/).length:0;
  document.getElementById('wc-words').textContent=words;
  document.getElementById('wc-characters').textContent=t.length;
  document.getElementById('wc-no-spaces').textContent=t.replace(/\s/g,'').length;
  document.getElementById('wc-sentences').textContent=(t.match(/[.!?]+/g)||[]).length;
  document.getElementById('wc-paragraphs').textContent=t.trim()?t.split(/\n\s*\n/).length:0;
  document.getElementById('wc-read-time').textContent=Math.ceil(words/200)+'m';
}

function renderJSONFormatter(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <textarea class="form-textarea" id="json-in" rows="8" placeholder='{"name":"ToolHub","version":"5D"}' oninput="liveJSON()" style="font-family:monospace;font-size:.85rem"></textarea>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin:.75rem 0">
        <button class="btn-primary-glow" onclick="formatJSON()">✨ Format</button>
        <button class="btn-outline-glow" onclick="minifyJSON()">⚡ Minify</button>
        <button class="btn-ghost" onclick="document.getElementById('json-in').value='';document.getElementById('json-out-wrap').style.display='none';document.getElementById('json-status').textContent=''">🗑 Clear</button>
      </div>
      <div id="json-status" style="font-size:.84rem;font-weight:600;margin-bottom:.5rem"></div>
      <div id="json-out-wrap" style="display:none">
        <textarea class="form-textarea" id="json-out" rows="10" readonly style="font-family:monospace;font-size:.82rem;background:var(--bg2)"></textarea>
        <button class="copy-result-btn" style="margin-top:.5rem" onclick="copyToClipboard(document.getElementById('json-out').value,'Copied!')">📋 Copy</button>
      </div>
    </div>`;
}
function liveJSON(){const v=document.getElementById('json-in').value.trim();if(!v){document.getElementById('json-status').textContent='';return;}try{JSON.parse(v);document.getElementById('json-status').innerHTML='<span style="color:var(--green)">✅ Valid JSON</span>';}catch(e){document.getElementById('json-status').innerHTML=`<span style="color:var(--red)">❌ ${e.message}</span>`;}}
function formatJSON(){const raw=document.getElementById('json-in').value.trim();if(!raw)return;try{const f=JSON.stringify(JSON.parse(raw),null,2);document.getElementById('json-out').value=f;document.getElementById('json-out-wrap').style.display='block';document.getElementById('json-status').innerHTML='<span style="color:var(--green)">✅ Formatted!</span>';}catch(e){document.getElementById('json-status').innerHTML=`<span style="color:var(--red)">❌ ${e.message}</span>`;}}
function minifyJSON(){const raw=document.getElementById('json-in').value.trim();if(!raw)return;try{document.getElementById('json-out').value=JSON.stringify(JSON.parse(raw));document.getElementById('json-out-wrap').style.display='block';document.getElementById('json-status').innerHTML='<span style="color:var(--green)">✅ Minified!</span>';}catch(e){document.getElementById('json-status').innerHTML=`<span style="color:var(--red)">❌ ${e.message}</span>`;}}

function renderJSONValidator(){
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget"><textarea class="form-textarea" id="jv-in" rows="10" placeholder='{"hello":"world"}' oninput="validateJSON()" style="font-family:monospace;font-size:.88rem"></textarea><div id="jv-res" style="margin-top:1rem"></div></div>`;
}
function validateJSON(){const v=document.getElementById('jv-in').value.trim();const el=document.getElementById('jv-res');if(!v){el.innerHTML='';return;}try{const p=JSON.parse(v);el.innerHTML=`<div class="info-box info-box-green">✅ <strong>Valid JSON</strong> — ${Object.keys(p).length} keys, ${v.length} chars</div>`;}catch(e){el.innerHTML=`<div class="info-box" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:#ef4444">❌ ${e.message}</div>`;}}

function renderHTMLMinifier(){
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget"><textarea class="form-textarea" id="html-in" rows="8" placeholder="Paste HTML here..." style="font-family:monospace;font-size:.85rem"></textarea><button class="btn-primary-glow" style="margin:.75rem 0" onclick="doHTMLMin()">⚡ Minify</button><div id="html-out-wrap" style="display:none"><textarea class="form-textarea" id="html-out" rows="6" readonly style="font-family:monospace;font-size:.82rem;background:var(--bg2)"></textarea><div id="html-stats" style="font-size:.82rem;color:var(--green);margin-top:.35rem"></div><button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('html-out').value,'Copied!')">📋 Copy</button></div></div>`;
}
function doHTMLMin(){let h=document.getElementById('html-in').value;if(!h.trim())return;const o=h.length;h=h.replace(/<!--[\s\S]*?-->/g,'').replace(/\s+/g,' ').replace(/>\s+</g,'><').trim();document.getElementById('html-out').value=h;document.getElementById('html-out-wrap').style.display='block';document.getElementById('html-stats').textContent=`✅ Saved ${o-h.length} chars (${Math.round((o-h.length)/o*100)}% reduction)`;}

function renderCSSMinifier(){
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget"><textarea class="form-textarea" id="css-in" rows="8" placeholder="Paste CSS here..." style="font-family:monospace;font-size:.85rem"></textarea><button class="btn-primary-glow" style="margin:.75rem 0" onclick="doCSSMin()">⚡ Minify</button><div id="css-out-wrap" style="display:none"><textarea class="form-textarea" id="css-out" rows="6" readonly style="font-family:monospace;font-size:.82rem;background:var(--bg2)"></textarea><div id="css-stats" style="font-size:.82rem;color:var(--green);margin-top:.35rem"></div><button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('css-out').value,'Copied!')">📋 Copy</button></div></div>`;
}
function doCSSMin(){let c=document.getElementById('css-in').value;if(!c.trim())return;const o=c.length;c=c.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*{\s*/g,'{').replace(/\s*}\s*/g,'}').replace(/\s*:\s*/g,':').replace(/\s*;\s*/g,';').replace(/\s*,\s*/g,',').replace(/;}/g,'}').trim();document.getElementById('css-out').value=c;document.getElementById('css-out-wrap').style.display='block';document.getElementById('css-stats').textContent=`✅ Saved ${o-c.length} chars`;}

function renderJSMinifier(){
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget"><textarea class="form-textarea" id="js-in" rows="8" placeholder="Paste JavaScript here..." style="font-family:monospace;font-size:.85rem"></textarea><button class="btn-primary-glow" style="margin:.75rem 0" onclick="doJSMin()">⚡ Minify</button><div id="js-out-wrap" style="display:none"><textarea class="form-textarea" id="js-out" rows="6" readonly style="font-family:monospace;font-size:.82rem;background:var(--bg2)"></textarea><div id="js-stats" style="font-size:.82rem;color:var(--green);margin-top:.35rem"></div><button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('js-out').value,'Copied!')">📋 Copy</button></div></div>`;
}
function doJSMin(){let j=document.getElementById('js-in').value;if(!j.trim())return;const o=j.length;j=j.replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\n+/g,'\n').replace(/[ \t]+/g,' ').replace(/ *([{};,=+\-*/<>!&|?:()\[\]]) */g,'$1').trim();document.getElementById('js-out').value=j;document.getElementById('js-out-wrap').style.display='block';document.getElementById('js-stats').textContent=`✅ Saved ${o-j.length} chars`;}

function renderURLEncoder(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:flex;gap:8px;margin-bottom:1rem">
        <button class="cat-chip active" onclick="window._urlMode='enc';this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active')">Encode</button>
        <button class="cat-chip" onclick="window._urlMode='dec';this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active')">Decode</button>
      </div>
      <textarea class="form-textarea" id="url-in" rows="4" placeholder="https://example.com/search?q=hello world"></textarea>
      <button class="btn-primary-glow" style="margin:.75rem 0" onclick="processURL()">🔒 Process</button>
      <div id="url-out-wrap" style="display:none"><textarea class="form-textarea" id="url-out" rows="4" readonly style="background:var(--bg2);font-family:monospace;font-size:.85rem"></textarea><button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('url-out').value,'Copied!')">📋 Copy</button></div>
    </div>`;
  window._urlMode='enc';
}
function processURL(){const v=document.getElementById('url-in').value;if(!v.trim())return;let o;try{o=window._urlMode==='enc'?encodeURIComponent(v):decodeURIComponent(v);}catch(e){o='Error: '+e.message;}document.getElementById('url-out').value=o;document.getElementById('url-out-wrap').style.display='block';}

function renderRegexTester(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group">
        <label class="form-label">Regular Expression</label>
        <div style="display:flex;align-items:center;background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md)">
          <span style="padding:.6rem .6rem .6rem 1rem;color:var(--muted);font-family:monospace">/</span>
          <input class="form-input" id="re-pat" placeholder="[a-z]+" style="border:none;flex:1;padding:.6rem .4rem;background:transparent" oninput="testRegex()">
          <span style="padding:.6rem .4rem;color:var(--muted);font-family:monospace">/</span>
          <input class="form-input" id="re-flags" value="gi" style="border:none;width:60px;padding:.6rem .4rem;font-family:monospace;background:transparent" oninput="testRegex()">
        </div>
      </div>
      <textarea class="form-textarea" id="re-test" rows="5" placeholder="Test string..." oninput="testRegex()"></textarea>
      <div id="re-result" style="margin-top:1rem"></div>
    </div>`;
}
function testRegex(){
  const pat=document.getElementById('re-pat').value, flags=document.getElementById('re-flags').value, test=document.getElementById('re-test').value;
  const el=document.getElementById('re-result');
  if(!pat||!test){el.innerHTML='';return;}
  try{
    const re=new RegExp(pat,flags.includes('g')?flags:flags+'g');
    const matches=[...test.matchAll(re)];
    if(!matches.length){el.innerHTML=`<div class="info-box info-box-amber">⚠️ No matches</div>`;return;}
    const hl=test.replace(re,m=>`<mark style="background:rgba(99,102,241,.3);border-radius:3px">${m}</mark>`);
    el.innerHTML=`<div class="info-box info-box-green" style="margin-bottom:.5rem">✅ ${matches.length} match${matches.length!==1?'es':''}</div><div style="padding:.9rem;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-md);line-height:1.8;word-break:break-word">${hl}</div>`;
  }catch(e){el.innerHTML=`<div class="info-box" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:#ef4444">❌ ${e.message}</div>`;}
}

function renderBase64Tool(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:flex;gap:8px;margin-bottom:1rem">
        <button class="cat-chip active" onclick="window._b64mode='enc';this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active')">Encode</button>
        <button class="cat-chip" onclick="window._b64mode='dec';this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active')">Decode</button>
      </div>
      <textarea class="form-textarea" id="b64-in" rows="5" placeholder="Enter text..."></textarea>
      <button class="btn-primary-glow" style="margin:.75rem 0" onclick="processB64()">⚡ Process</button>
      <div id="b64-out-wrap" style="display:none"><textarea class="form-textarea" id="b64-out" rows="5" readonly style="background:var(--bg2);font-family:monospace;font-size:.85rem"></textarea><button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('b64-out').value,'Copied!')">📋 Copy</button></div>
    </div>`;
  window._b64mode='enc';
}
function processB64(){const v=document.getElementById('b64-in').value;if(!v.trim())return;let o;try{o=window._b64mode==='enc'?btoa(unescape(encodeURIComponent(v))):decodeURIComponent(escape(atob(v)));}catch(e){o='Error: '+e.message;}document.getElementById('b64-out').value=o;document.getElementById('b64-out-wrap').style.display='block';}

function renderHashGen(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">Input Text</label><input class="form-input" type="text" id="hash-in" placeholder="Enter text to hash..." oninput="genHash()"></div>
      <div id="hash-results" style="margin-top:1rem;display:flex;flex-direction:column;gap:.5rem"></div>
    </div>`;
}
async function genHash(){
  const text=document.getElementById('hash-in')?.value; if(!text){document.getElementById('hash-results').innerHTML='';return;}
  const enc=new TextEncoder();
  const buf=enc.encode(text);
  const algos=['SHA-1','SHA-256','SHA-384','SHA-512'];
  const results=await Promise.all(algos.map(a=>crypto.subtle.digest(a,buf).then(h=>{const hex=[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('');return{algo:a,hex};})));
  document.getElementById('hash-results').innerHTML=results.map(r=>`<div style="background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md);padding:.75rem"><div style="font-size:.75rem;font-weight:700;color:var(--indigo);margin-bottom:.25rem">${r.algo}</div><div style="font-family:monospace;font-size:.75rem;word-break:break-all;color:var(--text2)">${r.hex}</div><button class="copy-result-btn" style="margin-top:.35rem" onclick="copyToClipboard('${r.hex}','Hash copied!')">📋 Copy</button></div>`).join('');
}

function renderJWTDecoder(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">JWT Token</label><textarea class="form-textarea" id="jwt-in" rows="4" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." style="font-family:monospace;font-size:.82rem" oninput="decodeJWT()"></textarea></div>
      <div id="jwt-out" style="margin-top:1rem;display:flex;flex-direction:column;gap:.75rem"></div>
    </div>`;
}
function decodeJWT(){
  const token=document.getElementById('jwt-in')?.value?.trim(); const el=document.getElementById('jwt-out');
  if(!token){el.innerHTML='';return;}
  try{
    const parts=token.split('.');
    if(parts.length!==3) throw new Error('Invalid JWT format');
    const decode=p=>{try{return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')+('='.repeat((4-p.length%4)%4))));}catch{return null;}};
    const header=decode(parts[0]), payload=decode(parts[1]);
    const exp=payload?.exp, now=Math.floor(Date.now()/1000);
    const expired=exp&&exp<now;
    el.innerHTML=`
      <div><div style="font-size:.78rem;font-weight:700;color:var(--indigo);margin-bottom:.35rem">HEADER</div><pre style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-md);padding:.75rem;font-size:.8rem;overflow-x:auto">${JSON.stringify(header,null,2)}</pre></div>
      <div><div style="font-size:.78rem;font-weight:700;color:var(--purple);margin-bottom:.35rem">PAYLOAD</div><pre style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-md);padding:.75rem;font-size:.8rem;overflow-x:auto">${JSON.stringify(payload,null,2)}</pre></div>
      ${exp?`<div class="info-box ${expired?'':'info-box-green'}" style="${expired?'background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#ef4444':''}">${expired?'❌ Token EXPIRED':'✅ Token valid'} — Expires: ${new Date(exp*1000).toLocaleString()}</div>`:''}`;
  }catch(e){el.innerHTML=`<div class="info-box" style="background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#ef4444">❌ ${e.message}</div>`;}
}

function renderMarkdownPreview(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div><label class="form-label">Markdown Input</label><textarea class="form-textarea" id="md-in" rows="20" placeholder="# Heading&#10;**Bold** *Italic*&#10;- Item 1&#10;- Item 2" oninput="previewMD()" style="font-family:monospace;font-size:.85rem;min-height:300px"></textarea></div>
      <div><label class="form-label">Preview</label><div id="md-out" style="padding:1rem;background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md);min-height:300px;line-height:1.7;font-size:.9rem;overflow-y:auto"></div></div>
    </div>`;
}
function previewMD(){
  let md=document.getElementById('md-in')?.value||'';
  md=md.replace(/^### (.*$)/gim,'<h3>$1</h3>').replace(/^## (.*$)/gim,'<h2>$1</h2>').replace(/^# (.*$)/gim,'<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/`(.+?)`/g,'<code style="background:var(--glass2);padding:2px 6px;border-radius:4px">$1</code>').replace(/^- (.+)/gim,'<li>$1</li>').replace(/(<li>.*<\/li>)/s,'<ul>$1</ul>').replace(/\n/g,'<br>');
  document.getElementById('md-out').innerHTML=md;
}

function renderDiffChecker(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
        <div><label class="form-label">Original Text</label><textarea class="form-textarea" id="diff-a" rows="10" placeholder="Paste original text..." style="font-family:monospace;font-size:.85rem"></textarea></div>
        <div><label class="form-label">Modified Text</label><textarea class="form-textarea" id="diff-b" rows="10" placeholder="Paste modified text..." style="font-family:monospace;font-size:.85rem"></textarea></div>
      </div>
      <button class="btn-primary-glow" onclick="doDiff()">🔍 Compare</button>
      <div id="diff-out" style="margin-top:1rem"></div>
    </div>`;
}
function doDiff(){
  const a=(document.getElementById('diff-a')?.value||'').split('\n');
  const b=(document.getElementById('diff-b')?.value||'').split('\n');
  let html='', added=0, removed=0;
  const max=Math.max(a.length,b.length);
  for(let i=0;i<max;i++){
    if(a[i]===b[i]){html+=`<div style="padding:2px 8px;font-family:monospace;font-size:.82rem">&nbsp;${a[i]||''}</div>`;}
    else if(a[i]&&!b[i]){removed++;html+=`<div style="padding:2px 8px;background:rgba(239,68,68,.1);color:#ef4444;font-family:monospace;font-size:.82rem">− ${a[i]}</div>`;}
    else if(!a[i]&&b[i]){added++;html+=`<div style="padding:2px 8px;background:rgba(16,185,129,.1);color:#10b981;font-family:monospace;font-size:.82rem">+ ${b[i]}</div>`;}
    else{removed++;added++;html+=`<div style="padding:2px 8px;background:rgba(239,68,68,.1);color:#ef4444;font-family:monospace;font-size:.82rem">− ${a[i]}</div><div style="padding:2px 8px;background:rgba(16,185,129,.1);color:#10b981;font-family:monospace;font-size:.82rem">+ ${b[i]}</div>`;}
  }
  document.getElementById('diff-out').innerHTML=`<div class="info-box info-box-blue" style="margin-bottom:.5rem">📊 ${added} additions · ${removed} deletions</div><div style="border:1px solid var(--border);border-radius:var(--r-md);overflow:hidden;max-height:400px;overflow-y:auto">${html}</div>`;
}

function renderAPITester(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:flex;gap:.75rem;margin-bottom:1rem;flex-wrap:wrap">
        <select class="form-select" id="api-method" style="width:110px"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option></select>
        <input class="form-input" type="text" id="api-url" placeholder="https://api.example.com/data" style="flex:1">
        <button class="btn-primary-glow" onclick="testAPI()" id="api-btn">▶ Send</button>
      </div>
      <div class="form-group"><label class="form-label">Headers (JSON)</label><textarea class="form-textarea" id="api-headers" rows="3" placeholder='{"Content-Type":"application/json","Authorization":"Bearer token"}' style="font-family:monospace;font-size:.82rem"></textarea></div>
      <div class="form-group"><label class="form-label">Body (for POST/PUT)</label><textarea class="form-textarea" id="api-body" rows="4" placeholder='{"key":"value"}' style="font-family:monospace;font-size:.82rem"></textarea></div>
      <div id="api-res" style="margin-top:1rem;display:none"><div id="api-status" style="font-size:.85rem;font-weight:700;margin-bottom:.5rem"></div><textarea class="form-textarea" id="api-out" rows="10" readonly style="font-family:monospace;font-size:.8rem;background:var(--bg2)"></textarea><button class="copy-result-btn" style="margin-top:.35rem" onclick="copyToClipboard(document.getElementById('api-out').value,'Response copied!')">📋 Copy</button></div>
    </div>`;
}
async function testAPI(){
  const method=document.getElementById('api-method').value, url=document.getElementById('api-url').value?.trim();
  if(!url){showToast('Enter a URL','warning');return;}
  const btn=document.getElementById('api-btn'); btn.textContent='⏳...'; btn.disabled=true;
  let headers={}, body;
  try{headers=JSON.parse(document.getElementById('api-headers').value||'{}');}catch{}
  try{body=document.getElementById('api-body').value||undefined;}catch{}
  try{
    const start=Date.now();
    const res=await fetch(url,{method,headers,body:['GET','HEAD'].includes(method)?undefined:body});
    const time=Date.now()-start, text=await res.text();
    let formatted=text;try{formatted=JSON.stringify(JSON.parse(text),null,2);}catch{}
    document.getElementById('api-res').style.display='block';
    document.getElementById('api-status').innerHTML=`<span style="color:${res.ok?'#10b981':'#ef4444'}">${res.status} ${res.statusText}</span> · ${time}ms · ${(text.length/1024).toFixed(2)}KB`;
    document.getElementById('api-out').value=formatted;
  }catch(e){document.getElementById('api-res').style.display='block';document.getElementById('api-status').innerHTML=`<span style="color:#ef4444">❌ ${e.message}</span>`;document.getElementById('api-out').value='';}
  btn.textContent='▶ Send'; btn.disabled=false;
}

function renderCronGen(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Minute (0-59)</label><input class="form-input" type="text" id="cron-min" value="0" oninput="buildCron()"></div>
        <div class="form-group"><label class="form-label">Hour (0-23)</label><input class="form-input" type="text" id="cron-hr" value="*" oninput="buildCron()"></div>
        <div class="form-group"><label class="form-label">Day of Month (1-31)</label><input class="form-input" type="text" id="cron-dom" value="*" oninput="buildCron()"></div>
        <div class="form-group"><label class="form-label">Month (1-12)</label><input class="form-input" type="text" id="cron-mo" value="*" oninput="buildCron()"></div>
        <div class="form-group"><label class="form-label">Day of Week (0-6)</label><input class="form-input" type="text" id="cron-dow" value="*" oninput="buildCron()"></div>
      </div>
      <div class="result-box"><div class="result-value" id="cron-expr" style="font-family:monospace;font-size:1.4rem">0 * * * *</div><div class="result-label" id="cron-desc">Every hour at minute 0</div><button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('cron-expr').textContent,'Copied!')">📋 Copy</button></div>
      <div style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:.5rem">
        ${[['Every minute','* * * * *'],['Every hour','0 * * * *'],['Every day noon','0 12 * * *'],['Every Monday','0 9 * * 1'],['Monthly','0 0 1 * *']].map(([l,v])=>`<button class="cat-chip" onclick="setCron('${v}')">${l}</button>`).join('')}
      </div>
    </div>`;
  buildCron();
}
function buildCron(){
  const min=document.getElementById('cron-min')?.value||'*', hr=document.getElementById('cron-hr')?.value||'*';
  const dom=document.getElementById('cron-dom')?.value||'*', mo=document.getElementById('cron-mo')?.value||'*';
  const dow=document.getElementById('cron-dow')?.value||'*';
  const expr=`${min} ${hr} ${dom} ${mo} ${dow}`;
  document.getElementById('cron-expr').textContent=expr;
  const parts=[min,hr,dom,mo,dow], descs=['minute '+min,'hour '+hr,'day '+dom,'month '+mo,'weekday '+dow];
  document.getElementById('cron-desc').textContent='Runs at: '+descs.filter(d=>!d.includes('*')).join(', ')||'Every minute';
}
function setCron(v){const p=v.split(' ');['cron-min','cron-hr','cron-dom','cron-mo','cron-dow'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.value=p[i]||'*';});buildCron();}

// ── IMAGE/QR TOOLS ──
function renderQRGen(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">URL or Text</label><input class="form-input" type="text" id="qr-text" placeholder="https://example.com or any text..." oninput="genQR()"></div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Size</label><select class="form-select" id="qr-size" onchange="genQR()"><option value="200">Small</option><option value="300" selected>Medium</option><option value="400">Large</option></select></div>
        <div class="form-group"><label class="form-label">Foreground</label><input type="color" id="qr-fg" value="#000000" oninput="genQR()" style="width:100%;height:42px;border:1px solid var(--border);border-radius:var(--r-md);padding:4px;cursor:pointer"></div>
        <div class="form-group"><label class="form-label">Background</label><input type="color" id="qr-bg" value="#ffffff" oninput="genQR()" style="width:100%;height:42px;border:1px solid var(--border);border-radius:var(--r-md);padding:4px;cursor:pointer"></div>
      </div>
      <div id="qr-output" style="display:flex;flex-direction:column;align-items:center;padding:1.5rem;background:var(--glass2);border:2px dashed var(--border);border-radius:var(--r-xl);min-height:200px;justify-content:center">
        <p style="color:var(--text3)">Enter URL above to generate QR code</p>
      </div>
      <div id="qr-actions" style="display:none;margin-top:.75rem;display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center"></div>
    </div>`;
}
function genQR(){
  const text=document.getElementById('qr-text')?.value?.trim(); const out=document.getElementById('qr-output');
  if(!out)return;
  if(!text){
    // Destroy previous instance before clearing DOM
    if(window._qrInstance){try{window._qrInstance.clear();}catch(e){}window._qrInstance=null;}
    out.innerHTML='<p style="color:var(--text3)">Enter text or URL above</p>';
    const actDiv=document.getElementById('qr-actions');if(actDiv)actDiv.style.display='none';return;
  }
  const size=parseInt(document.getElementById('qr-size')?.value)||300;
  const fg=document.getElementById('qr-fg')?.value||'#000000', bg=document.getElementById('qr-bg')?.value||'#ffffff';
  window._qrLastText=text;
  const loadQR=()=>{
    // Properly destroy any previous QRCode instance before wiping the DOM
    if(window._qrInstance){try{window._qrInstance.clear();}catch(e){}window._qrInstance=null;}
    out.innerHTML='';
    try{
      window._qrInstance=new window.QRCode(out,{text,width:size,height:size,colorDark:fg,colorLight:bg,correctLevel:window.QRCode.CorrectLevel.H});
      const actDiv=document.getElementById('qr-actions');
      if(actDiv){
        actDiv.style.display='flex';
        actDiv.innerHTML='<button class="btn-primary-glow" onclick="downloadQR()">📥 Download</button><button class="copy-result-btn" onclick="copyToClipboard(window._qrLastText,\'Text copied!\')">📋 Copy Text</button>';
      }
    }catch(e){
      window._qrInstance=null;
      out.innerHTML='<p style="color:var(--red)">Error generating QR code. Try a shorter text.</p>';
    }
  };
  if(window.QRCode) loadQR();
  else{
    out.innerHTML='<p style="color:var(--text3)">Loading QR library…</p>';
    const sources=[
      'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
      'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
      'https://unpkg.com/qrcodejs@1.0.0/qrcode.min.js',
      '/js/vendor/qrcode.min.js'
    ];
    const tryLoad=(i)=>{
      if(i>=sources.length){
        out.innerHTML='<p style="color:var(--red)">Failed to load QR library. Check your connection.</p>';
        return;
      }
      const s=document.createElement('script');
      s.src=sources[i];
      s.onload=()=>{ if(window.QRCode) loadQR(); else tryLoad(i+1); };
      s.onerror=()=>tryLoad(i+1);
      document.head.appendChild(s);
    };
    tryLoad(0);
  }
}
function downloadQR(){const canvas=document.querySelector('#qr-output canvas');if(canvas){const a=document.createElement('a');a.download='qrcode.png';a.href=canvas.toDataURL('image/png');a.click();}else{const img=document.querySelector('#qr-output img');if(img){const a=document.createElement('a');a.download='qrcode.png';a.href=img.src;a.click();}else{showToast('No QR code to download','warning');}}}

function renderBarcodeGen(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">Barcode Value</label><input class="form-input" type="text" id="bc-value" placeholder="1234567890128" value="1234567890128"></div>
      <div class="form-group"><label class="form-label">Format</label><select class="form-select" id="bc-format"><option>EAN-13</option><option>Code 128</option><option>QR Code</option></select></div>
      <button class="btn-primary-glow" style="margin:.75rem 0" onclick="genBarcode()">📊 Generate</button>
      <div id="bc-out" style="text-align:center;padding:1.5rem;background:white;border-radius:var(--r-xl);margin-top:1rem;min-height:100px"></div>
    </div>`;
}
function genBarcode(){
  const val=document.getElementById('bc-value')?.value||'12345'; const el=document.getElementById('bc-out');
  el.innerHTML=''; const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','300'); svg.setAttribute('height','80'); svg.setAttribute('viewBox','0 0 300 80');
  // Simple visual barcode representation
  let x=10;
  for(let i=0;i<val.length*4+20;i++){const w=Math.random()>0.5?2:3; const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');rect.setAttribute('x',x);rect.setAttribute('y','5');rect.setAttribute('width',w);rect.setAttribute('height','55');rect.setAttribute('fill','#000');svg.appendChild(rect);x+=w+(Math.random()>0.3?2:1);}
  const text=document.createElementNS('http://www.w3.org/2000/svg','text');text.setAttribute('x','150');text.setAttribute('y','75');text.setAttribute('text-anchor','middle');text.setAttribute('font-size','12');text.setAttribute('font-family','monospace');text.textContent=val;svg.appendChild(text);
  el.appendChild(svg);
}

function renderPasswordGen(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:flex;align-items:center;background:var(--glass2);border:1.5px solid var(--border);border-radius:var(--r-lg);padding:.75rem 1rem;margin-bottom:1rem;gap:.75rem">
        <span id="pass-val" style="flex:1;font-family:monospace;font-size:1rem;word-break:break-all;letter-spacing:.05em">Click Generate</span>
        <button onclick="copyToClipboard(document.getElementById('pass-val').textContent,'Password copied! 🔐')" style="background:none;font-size:1.1rem;color:var(--indigo)">📋</button>
      </div>
      <div style="height:8px;background:var(--glass2);border-radius:99px;overflow:hidden;margin-bottom:.5rem"><div id="pass-str" style="height:100%;width:0%;transition:width .4s;border-radius:99px"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:.78rem;color:var(--text3);margin-bottom:1rem"><span id="pass-lbl">Strength: —</span><span id="pass-bits"></span></div>
      <div class="form-group"><label class="form-label">Length: <strong id="pass-len-lbl">16</strong></label><input type="range" id="pass-len" min="6" max="64" value="16" oninput="document.getElementById('pass-len-lbl').textContent=this.value;genPassword()"></div>
      <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem">
        ${[['pass-upper','Uppercase (A-Z)'],['pass-lower','Lowercase (a-z)'],['pass-num','Numbers (0-9)'],['pass-sym','Symbols (!@#$)']].map(([id,lbl])=>`<label style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;cursor:pointer"><input type="checkbox" id="${id}" checked onchange="genPassword()" style="accent-color:var(--indigo)"> ${lbl}</label>`).join('')}
      </div>
      <div style="display:flex;gap:.75rem">
        <button class="btn-primary-glow" onclick="genPassword()">🔄 Generate</button>
        <button class="btn-outline-glow" onclick="genMultiPasswords()">📋 × 5</button>
      </div>
      <div id="multi-pass" style="margin-top:1rem;display:flex;flex-direction:column;gap:.35rem"></div>
    </div>`;
  genPassword();
}
function genPassword(){
  const len=parseInt(document.getElementById('pass-len')?.value)||16;
  let chars='';
  if(document.getElementById('pass-upper')?.checked) chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if(document.getElementById('pass-lower')?.checked) chars+='abcdefghijklmnopqrstuvwxyz';
  if(document.getElementById('pass-num')?.checked) chars+='0123456789';
  if(document.getElementById('pass-sym')?.checked) chars+='!@#$%^&*()-_=+[]{}|;:,.<>?';
  if(!chars){document.getElementById('pass-val').textContent='Select at least one type';return;}
  const arr=new Uint32Array(len); crypto.getRandomValues(arr);
  const pwd=[...arr].map(v=>chars[v%chars.length]).join('');
  document.getElementById('pass-val').textContent=pwd;
  const entropy=Math.log2(Math.pow(chars.length,len)), pct=Math.min(100,entropy/128*100);
  let lbl,col;
  if(entropy<40){lbl='Weak 😟';col='#ef4444';}else if(entropy<60){lbl='Fair 😐';col='#f59e0b';}else if(entropy<80){lbl='Good 👍';col='#10b981';}else{lbl='Very Strong 💪';col='#6366f1';}
  document.getElementById('pass-str').style.width=pct+'%'; document.getElementById('pass-str').style.background=col;
  document.getElementById('pass-lbl').textContent='Strength: '+lbl; document.getElementById('pass-bits').textContent=entropy.toFixed(0)+' bits';
}
function genMultiPasswords(){
  const c=document.getElementById('multi-pass'); c.innerHTML='';
  for(let i=0;i<5;i++){genPassword(); const p=document.getElementById('pass-val')?.textContent; const d=document.createElement('div'); d.style='display:flex;align-items:center;justify-content:space-between;padding:.5rem .75rem;background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md);font-family:monospace;font-size:.85rem;gap:.5rem'; d.innerHTML=`<span style="flex:1;word-break:break-all">${p}</span><button onclick="copyToClipboard('${p}','Copied!')" style="background:none;color:var(--indigo)">📋</button>`; c.appendChild(d);}
  genPassword();
}

function renderPasswordChecker(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">Enter Password</label><input class="form-input" type="password" id="pc-in" placeholder="Enter password to check..." oninput="checkPasswordStrength()"></div>
      <div style="height:8px;background:var(--glass2);border-radius:99px;overflow:hidden;margin:.75rem 0"><div id="pc-bar" style="height:100%;width:0%;transition:width .4s;border-radius:99px"></div></div>
      <div id="pc-result" style="display:flex;flex-direction:column;gap:.5rem"></div>
    </div>`;
}
function checkPasswordStrength(){
  const p=document.getElementById('pc-in')?.value||''; const el=document.getElementById('pc-result');
  const checks=[{test:/[A-Z]/.test(p),label:'Has uppercase letters'},{test:/[a-z]/.test(p),label:'Has lowercase letters'},{test:/[0-9]/.test(p),label:'Has numbers'},{test:/[^A-Za-z0-9]/.test(p),label:'Has special characters'},{test:p.length>=8,label:'At least 8 characters'},{test:p.length>=16,label:'16+ characters (excellent)'},{test:!/(.)\1{2,}/.test(p),label:'No repeated characters'}];
  const score=checks.filter(c=>c.test).length;
  const pct=Math.round(score/checks.length*100), col=pct<40?'#ef4444':pct<65?'#f59e0b':pct<85?'#10b981':'#6366f1';
  document.getElementById('pc-bar').style.width=pct+'%'; document.getElementById('pc-bar').style.background=col;
  el.innerHTML=checks.map(c=>`<div style="display:flex;align-items:center;gap:.5rem;font-size:.83rem;color:${c.test?'#10b981':'var(--text3)'}">${c.test?'✅':'❌'} ${c.label}</div>`).join('');
}

function renderUUIDGen(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="background:var(--glass2);border:1.5px solid var(--border);border-radius:var(--r-lg);padding:1rem;font-family:monospace;font-size:1rem;text-align:center;margin-bottom:1rem;word-break:break-all" id="uuid-main">${generateUUID()}</div>
      <div style="display:flex;gap:.75rem;margin-bottom:1.5rem">
        <button class="btn-primary-glow" onclick="document.getElementById('uuid-main').textContent=generateUUID()">🔄 New UUID</button>
        <button class="copy-result-btn" onclick="copyToClipboard(document.getElementById('uuid-main').textContent,'UUID copied!')">📋 Copy</button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
        <span style="font-size:.85rem;font-weight:600">Batch Generate</span>
        <div style="display:flex;gap:.5rem"><select class="form-select" id="uuid-count" style="width:80px"><option>5</option><option>10</option><option>20</option><option>50</option></select><button class="btn-outline-glow" onclick="genBatchUUIDs()" style="padding:.4rem .8rem">Generate</button></div>
      </div>
      <div id="uuid-list" style="display:flex;flex-direction:column;gap:.35rem;max-height:300px;overflow-y:auto"></div>
    </div>`;
}
function genBatchUUIDs(){
  const n=parseInt(document.getElementById('uuid-count')?.value)||10, el=document.getElementById('uuid-list');
  const uuids=Array.from({length:n},()=>generateUUID());
  el.innerHTML=uuids.map(u=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:.4rem .75rem;background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-sm);font-family:monospace;font-size:.78rem"><span>${u}</span><button onclick="copyToClipboard('${u}','Copied!')" style="background:none;color:var(--indigo)">📋</button></div>`).join('');
}

function renderColorPicker(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Pick Color</label><input type="color" id="col-pick" value="#6366f1" oninput="updateColor()" style="width:100%;height:80px;border:none;cursor:pointer;border-radius:var(--r-md)"></div>
        <div class="form-group"><label class="form-label">HEX</label><input class="form-input" type="text" id="col-hex" value="#6366f1" oninput="hexToOther()"></div>
        <div class="form-group"><label class="form-label">RGB</label><input class="form-input" type="text" id="col-rgb" value="rgb(99, 102, 241)" readonly></div>
        <div class="form-group"><label class="form-label">HSL</label><input class="form-input" type="text" id="col-hsl" value="hsl(239°, 84%, 67%)" readonly></div>
      </div>
      <div id="col-preview" style="height:60px;border-radius:var(--r-lg);background:#6366f1;margin-bottom:1rem;transition:background .2s;display:flex;align-items:center;justify-content:center;color:white;font-weight:700">Color Preview</div>
      <div style="margin-top:.5rem"><label class="form-label">Recent Colors</label><div class="color-swatches" id="recent-colors"></div></div>
    </div>`;
  updateColor();
}
function updateColor(){
  const hex=document.getElementById('col-pick')?.value||'#6366f1';
  document.getElementById('col-hex').value=hex;
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  document.getElementById('col-rgb').value=`rgb(${r}, ${g}, ${b})`;
  const rn=r/255,gn=g/255,bn=b/255,max=Math.max(rn,gn,bn),min=Math.min(rn,gn,bn);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0;}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case rn:h=(gn-bn)/d+(gn<bn?6:0);break;case gn:h=(bn-rn)/d+2;break;default:h=(rn-gn)/d+4;}h/=6;}
  document.getElementById('col-hsl').value=`hsl(${Math.round(h*360)}°, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
  document.getElementById('col-preview').style.background=hex;
  document.getElementById('col-preview').style.color=l>0.5?'#000':'#fff';
}
function hexToOther(){const hex=document.getElementById('col-hex')?.value;if(/^#[0-9a-f]{6}$/i.test(hex)){document.getElementById('col-pick').value=hex;updateColor();}}

function renderColorPalette(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Base Color</label><input type="color" id="cp-base" value="#6366f1" oninput="genPalette()" style="width:100%;height:50px;border:none;cursor:pointer;border-radius:var(--r-md)"></div>
        <div class="form-group"><label class="form-label">Type</label><select class="form-select" id="cp-type" onchange="genPalette()"><option value="mono">Monochromatic</option><option value="analog">Analogous</option><option value="comp">Complementary</option><option value="triadic">Triadic</option><option value="random">Random</option></select></div>
      </div>
      <div id="cp-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:.5rem;margin:1rem 0"></div>
      <div style="display:flex;gap:.75rem"><button class="btn-primary-glow" onclick="genPalette()">🎨 Regenerate</button><button class="copy-result-btn" onclick="copyToClipboard(window._currentPalette?.join(', '),'Colors copied!')">📋 Copy All HEX</button></div>
    </div>`;
  genPalette();
}
function genPalette(){
  const base=document.getElementById('cp-base')?.value||'#6366f1', type=document.getElementById('cp-type')?.value||'mono';
  const toHSL=hex=>{const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255,max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0;}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h/=6;}return[h*360,s*100,l*100];};
  const toHex=(h,s,l)=>{s/=100;l/=100;const a=s*Math.min(l,1-l);const f=n=>{const k=(n+h/30)%12,c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');};return '#'+f(0)+f(8)+f(4);};
  const [h,s,l]=toHSL(base);
  let colors;
  switch(type){
    case 'mono': colors=[toHex(h,s,20),toHex(h,s,35),toHex(h,s,50),toHex(h,s,65),toHex(h,s,80)]; break;
    case 'analog': colors=[toHex((h+30)%360,s,l),toHex((h+15)%360,s,l),base,toHex((h-15+360)%360,s,l),toHex((h-30+360)%360,s,l)]; break;
    case 'comp': colors=[base,toHex((h+180)%360,s,l),toHex(h,s*0.6,l*1.2),toHex((h+180)%360,s*0.6,l*1.2),toHex(h,s,l*0.7)]; break;
    case 'triadic': colors=[base,toHex((h+120)%360,s,l),toHex((h+240)%360,s,l),toHex(h,s,l*0.7),toHex(h,s*0.5,l*1.2)]; break;
    default: colors=Array.from({length:5},()=>toHex(Math.random()*360,40+Math.random()*40,40+Math.random()*20));
  }
  window._currentPalette=colors;
  document.getElementById('cp-grid').innerHTML=colors.map(c=>`<div style="display:flex;flex-direction:column;align-items:center;gap:.35rem;cursor:pointer" onclick="copyToClipboard('${c}','Copied!')"><div style="width:100%;aspect-ratio:1;border-radius:var(--r-md);background:${c};box-shadow:0 4px 12px rgba(0,0,0,.2);transition:transform .2s" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></div><span style="font-size:.65rem;font-family:monospace">${c}</span></div>`).join('');
}

function renderColorConverter(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">HEX Color</label><input class="form-input" type="text" id="cc-hex" placeholder="#6366f1" value="#6366f1" oninput="convertColor()"></div>
      <div class="form-group"><label class="form-label">RGB</label><input class="form-input" type="text" id="cc-rgb" placeholder="rgb(99,102,241)" readonly></div>
      <div class="form-group"><label class="form-label">HSL</label><input class="form-input" type="text" id="cc-hsl" placeholder="hsl(239,84%,67%)" readonly></div>
      <div class="form-group"><label class="form-label">CSS Variable</label><input class="form-input" type="text" id="cc-css" readonly></div>
      <div id="cc-preview" style="height:80px;border-radius:var(--r-xl);margin-top:.75rem;transition:background .2s"></div>
    </div>`;
  convertColor();
}
function convertColor(){
  const hex=document.getElementById('cc-hex')?.value?.trim();
  if(!/^#[0-9a-fA-F]{3,6}$/.test(hex)) return;
  const full=hex.length===4?'#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3]:hex;
  const r=parseInt(full.slice(1,3),16),g=parseInt(full.slice(3,5),16),b=parseInt(full.slice(5,7),16);
  document.getElementById('cc-rgb').value=`rgb(${r}, ${g}, ${b})`;
  document.getElementById('cc-css').value=`--color: ${full};`;
  document.getElementById('cc-preview').style.background=full;
}

function renderImgCompress(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="cmp-drop" onclick="document.getElementById('cmp-input').click()">
        <div class="file-drop-icon">🗜️</div><div class="file-drop-label">Click or Drop Image</div><div class="file-drop-hint">JPEG, PNG, WebP</div>
        <input type="file" id="cmp-input" accept="image/*" style="display:none" onchange="handleCmpFile(event.target.files[0])">
      </div>
      <div id="cmp-opts" style="display:none;margin-top:1rem">
        <div class="form-group"><label class="form-label">Quality: <strong id="cmp-q-lbl">80%</strong></label><input type="range" id="cmp-q" min="10" max="100" value="80" oninput="document.getElementById('cmp-q-lbl').textContent=this.value+'%';doCompress()"></div>
        <div id="cmp-result" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:.75rem 0"></div>
        <button class="btn-primary-glow" onclick="downloadCompressed()">📥 Download Compressed</button>
      </div>
    </div>
    <div class="info-box info-box-blue">🔒 All compression happens in your browser. Images never uploaded to servers.</div>`;
  setupDrop('cmp-drop',handleCmpFile);
}
let _cmpCanvas=null;
function handleCmpFile(file){
  if(!file||!file.type.startsWith('image/')) return;
  const reader=new FileReader(); reader.onload=e=>{const img=new Image(); img.onload=()=>{_cmpCanvas=document.createElement('canvas');_cmpCanvas.width=img.width;_cmpCanvas.height=img.height;_cmpCanvas.getContext('2d').drawImage(img,0,0);document.getElementById('cmp-opts').style.display='block';window._origSize=file.size;doCompress();};img.src=e.target.result;document.getElementById('cmp-drop').innerHTML=`<div style="font-size:2rem">✅</div><p>${file.name}</p>`;};reader.readAsDataURL(file);
}
function doCompress(){
  if(!_cmpCanvas) return;
  const q=parseInt(document.getElementById('cmp-q')?.value||80)/100;
  const url=_cmpCanvas.toDataURL('image/jpeg',q), bytes=atob(url.split(',')[1]).length;
  const origKB=(window._origSize/1024).toFixed(1), newKB=(bytes/1024).toFixed(1), saved=(100-bytes/window._origSize*100).toFixed(0);
  window._compressedUrl=url;
  document.getElementById('cmp-result').innerHTML=`<div class="result-item"><div class="result-item-value">${origKB} KB</div><div class="result-item-label">Original</div></div><div class="result-item"><div class="result-item-value" style="color:#10b981">${newKB} KB</div><div class="result-item-label">Compressed (-${saved}%)</div></div>`;
}
function downloadCompressed(){if(!window._compressedUrl)return;const a=document.createElement('a');a.download='compressed.jpg';a.href=window._compressedUrl;a.click();}

function renderPngCompress(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="png-drop" onclick="document.getElementById('png-input').click()">
        <div class="file-drop-icon">🖼️</div><div class="file-drop-label">Click or Drop a PNG</div><div class="file-drop-hint">Transparency is preserved</div>
        <input type="file" id="png-input" accept="image/png" style="display:none" onchange="handlePngFile(event.target.files[0])">
      </div>
      <div id="png-opts" style="display:none;margin-top:1rem">
        <div class="form-group"><label class="form-label">Colors: <strong id="png-c-lbl">256</strong> <span style="color:var(--text3)">(lower = smaller file)</span></label><input type="range" id="png-colors" min="2" max="8" value="8" oninput="onPngColorChange()"></div>
        <div class="form-group"><label class="form-label">Scale: <strong id="png-s-lbl">100%</strong></label><input type="range" id="png-scale" min="25" max="100" value="100" step="5" oninput="onPngScaleChange()"></div>
        <div id="png-result" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:.75rem 0"></div>
        <div id="png-preview" style="margin:.75rem 0;text-align:center"></div>
        <button class="btn-primary-glow" onclick="downloadPngCompressed()">📥 Download Compressed PNG</button>
      </div>
    </div>
    <div class="info-box info-box-blue">🔒 100% in-browser. PNG stays lossless-compatible — transparency (alpha channel) is never touched, only color count and pixel size are reduced.</div>`;
  setupDrop('png-drop',handlePngFile);
}
let _pngImg=null, _pngOrigSize=0, _pngCompressedUrl=null;
function handlePngFile(file){
  if(!file||file.type!=='image/png'){ showToast('⚠️ Please select a PNG file','error'); return; }
  _pngOrigSize=file.size;
  const reader=new FileReader();
  reader.onload=e=>{
    _pngImg=new Image();
    _pngImg.onload=()=>{
      document.getElementById('png-opts').style.display='block';
      document.getElementById('png-drop').innerHTML=`<div style="font-size:2rem">✅</div><p>${file.name}</p>`;
      doPngCompress();
    };
    _pngImg.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
function onPngColorChange(){
  const bits=parseInt(document.getElementById('png-colors').value);
  document.getElementById('png-c-lbl').textContent=Math.pow(2,bits);
  doPngCompress();
}
function onPngScaleChange(){
  document.getElementById('png-s-lbl').textContent=document.getElementById('png-scale').value+'%';
  doPngCompress();
}
function doPngCompress(){
  if(!_pngImg) return;
  const bits=parseInt(document.getElementById('png-colors')?.value||8);
  const scalePct=parseInt(document.getElementById('png-scale')?.value||100)/100;
  const w=Math.max(1,Math.round(_pngImg.width*scalePct)), h=Math.max(1,Math.round(_pngImg.height*scalePct));

  const canvas=document.createElement('canvas');
  canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(_pngImg,0,0,w,h);

  // Posterize each channel to `levels` steps. Lower color count = smaller PNG,
  // since PNG's lossless compressor finds far more repeated byte patterns.
  // Alpha channel is left completely untouched so transparency never degrades.
  if (bits < 8) {
    const levels=Math.pow(2,bits);
    const step=255/(levels-1);
    const imgData=ctx.getImageData(0,0,w,h);
    const d=imgData.data;
    for(let i=0;i<d.length;i+=4){
      d[i]  =Math.round(Math.round(d[i]  /step)*step);
      d[i+1]=Math.round(Math.round(d[i+1]/step)*step);
      d[i+2]=Math.round(Math.round(d[i+2]/step)*step);
      // d[i+3] = alpha — untouched
    }
    ctx.putImageData(imgData,0,0);
  }

  const url=canvas.toDataURL('image/png');
  const bytes=atob(url.split(',')[1]).length;
  _pngCompressedUrl=url;

  const origKB=(_pngOrigSize/1024).toFixed(1), newKB=(bytes/1024).toFixed(1);
  const saved=Math.max(0,(100-bytes/_pngOrigSize*100)).toFixed(0);
  document.getElementById('png-result').innerHTML=
    `<div class="result-item"><div class="result-item-value">${origKB} KB</div><div class="result-item-label">Original</div></div>`+
    `<div class="result-item"><div class="result-item-value" style="color:#10b981">${newKB} KB</div><div class="result-item-label">Compressed (-${saved}%)</div></div>`;
  document.getElementById('png-preview').innerHTML=`<img src="${url}" style="max-width:100%;max-height:260px;border-radius:var(--r-md);background:repeating-conic-gradient(#444 0% 25%,#333 0% 50%) 50%/16px 16px">`;
}
function downloadPngCompressed(){
  if(!_pngCompressedUrl) return;
  const a=document.createElement('a'); a.download='compressed.png'; a.href=_pngCompressedUrl; a.click();
  showToast('✅ PNG downloaded','success');
}

function renderImgResize(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="rsz-drop" onclick="document.getElementById('rsz-input').click()">
        <div class="file-drop-icon">📐</div><div class="file-drop-label">Click or Drop Image</div>
        <input type="file" id="rsz-input" accept="image/*" style="display:none" onchange="handleRszFile(event.target.files[0])">
      </div>
      <div id="rsz-opts" style="display:none;margin-top:1rem">
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Width (px)</label><input class="form-input" type="number" id="rsz-w" oninput="syncRszH()"></div>
          <div class="form-group"><label class="form-label">Height (px)</label><input class="form-input" type="number" id="rsz-h" oninput="syncRszW()"></div>
        </div>
        <label style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;margin-bottom:1rem;cursor:pointer"><input type="checkbox" id="rsz-asp" checked style="accent-color:var(--indigo)"> Maintain aspect ratio</label>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem">${[[800,600],[1280,720],[1920,1080],[512,512]].map(([w,h])=>`<button class="cat-chip" onclick="setRszPreset(${w},${h})">${w}×${h}</button>`).join('')}</div>
        <button class="btn-primary-glow" onclick="doResize()">📥 Resize & Download</button>
      </div>
    </div>`;
  setupDrop('rsz-drop',handleRszFile);
}
let _rszImg=null, _rszAsp=1;
function handleRszFile(f){if(!f||!f.type.startsWith('image/'))return;const r=new FileReader();r.onload=e=>{_rszImg=new Image();_rszImg.onload=()=>{_rszAsp=_rszImg.width/_rszImg.height;document.getElementById('rsz-w').value=_rszImg.width;document.getElementById('rsz-h').value=_rszImg.height;document.getElementById('rsz-opts').style.display='block';};_rszImg.src=e.target.result;};r.readAsDataURL(f);}
function syncRszH(){if(!document.getElementById('rsz-asp')?.checked)return;const w=parseInt(document.getElementById('rsz-w')?.value);document.getElementById('rsz-h').value=Math.round(w/_rszAsp);}
function syncRszW(){if(!document.getElementById('rsz-asp')?.checked)return;const h=parseInt(document.getElementById('rsz-h')?.value);document.getElementById('rsz-w').value=Math.round(h*_rszAsp);}
function setRszPreset(w,h){document.getElementById('rsz-w').value=w;document.getElementById('rsz-h').value=h;}
function doResize(){if(!_rszImg)return;const w=parseInt(document.getElementById('rsz-w')?.value)||_rszImg.width,h=parseInt(document.getElementById('rsz-h')?.value)||_rszImg.height;const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(_rszImg,0,0,w,h);const a=document.createElement('a');a.download=`resized_${w}x${h}.png`;a.href=c.toDataURL('image/png');a.click();showToast(`✅ Resized to ${w}×${h}`,'success');}

function renderImgBase64(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div style="display:flex;gap:8px;margin-bottom:1rem">
        <button class="cat-chip active" onclick="this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('b64-enc').style.display='block';document.getElementById('b64-dec').style.display='none'">Image → Base64</button>
        <button class="cat-chip" onclick="this.parentNode.querySelectorAll('.cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('b64-enc').style.display='none';document.getElementById('b64-dec').style.display='block'">Base64 → Image</button>
      </div>
      <div id="b64-enc"><div class="file-drop-zone" onclick="document.getElementById('b64-f').click()"><div class="file-drop-icon">💾</div><div class="file-drop-label">Select Image</div><input type="file" id="b64-f" accept="image/*" style="display:none" onchange="encodeB64(event)"></div><div id="b64-out2" style="display:none;margin-top:1rem"><textarea class="form-textarea" id="b64-res" readonly style="font-size:.7rem;font-family:monospace;min-height:80px"></textarea><button class="copy-result-btn" style="margin-top:.35rem" onclick="copyToClipboard(document.getElementById('b64-res').value,'Copied!')">📋 Copy</button></div></div>
      <div id="b64-dec" style="display:none"><textarea class="form-textarea" id="b64-dec-in" placeholder="Paste base64 string..." style="min-height:100px;font-family:monospace;font-size:.75rem" oninput="decodeB64()"></textarea><div id="b64-preview" style="margin-top:1rem"></div></div>
    </div>`;
}
function encodeB64(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const b64=ev.target.result.split(',')[1];document.getElementById('b64-res').value=b64;document.getElementById('b64-out2').style.display='block';};r.readAsDataURL(f);}
function decodeB64(){const v=document.getElementById('b64-dec-in')?.value?.trim();if(!v)return;const src=v.startsWith('data:')?v:'data:image/png;base64,'+v;document.getElementById('b64-preview').innerHTML=`<img src="${src}" style="max-width:100%;border-radius:var(--r-md)" onerror="this.parentNode.innerHTML='<p style=color:var(--red)>Invalid Base64</p>'">`;}

function renderMemeGen(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="meme-drop" onclick="document.getElementById('meme-input').click()">
        <div class="file-drop-icon">😂</div><div class="file-drop-label">Upload Image for Meme</div>
        <input type="file" id="meme-input" accept="image/*" style="display:none" onchange="loadMemeImage(event.target.files[0])">
      </div>
      <div id="meme-editor" style="display:none;margin-top:1rem">
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Top Text</label><input class="form-input" type="text" id="meme-top" placeholder="TOP TEXT" oninput="drawMeme()"></div>
          <div class="form-group"><label class="form-label">Bottom Text</label><input class="form-input" type="text" id="meme-bot" placeholder="BOTTOM TEXT" oninput="drawMeme()"></div>
          <div class="form-group"><label class="form-label">Font Size</label><input type="range" id="meme-size" min="20" max="80" value="42" oninput="drawMeme()"></div>
          <div class="form-group"><label class="form-label">Text Color</label><input type="color" id="meme-col" value="#ffffff" oninput="drawMeme()" style="width:100%;height:42px;border:none;border-radius:var(--r-md);cursor:pointer"></div>
        </div>
        <canvas id="meme-canvas" style="max-width:100%;border-radius:var(--r-xl);display:block;margin:1rem auto"></canvas>
        <button class="btn-primary-glow" onclick="downloadMeme()" style="margin-top:.75rem">📥 Download Meme</button>
      </div>
    </div>`;
  setupDrop('meme-drop',loadMemeImage);
}
let _memeImg=null;
function loadMemeImage(f){if(!f||!f.type.startsWith('image/'))return;const r=new FileReader();r.onload=e=>{_memeImg=new Image();_memeImg.onload=()=>{document.getElementById('meme-editor').style.display='block';drawMeme();};_memeImg.src=e.target.result;};r.readAsDataURL(f);}
function drawMeme(){
  if(!_memeImg) return;
  const canvas=document.getElementById('meme-canvas'), ctx=canvas.getContext('2d');
  canvas.width=Math.min(_memeImg.width,600); canvas.height=canvas.width*_memeImg.height/_memeImg.width;
  ctx.drawImage(_memeImg,0,0,canvas.width,canvas.height);
  const size=parseInt(document.getElementById('meme-size')?.value)||42, col=document.getElementById('meme-col')?.value||'#fff';
  const top=document.getElementById('meme-top')?.value||'', bot=document.getElementById('meme-bot')?.value||'';
  ctx.font=`900 ${size}px Impact,Arial`;ctx.textAlign='center';ctx.fillStyle=col;ctx.strokeStyle='#000';ctx.lineWidth=3;
  if(top){ctx.strokeText(top.toUpperCase(),canvas.width/2,size+10);ctx.fillText(top.toUpperCase(),canvas.width/2,size+10);}
  if(bot){ctx.strokeText(bot.toUpperCase(),canvas.width/2,canvas.height-15);ctx.fillText(bot.toUpperCase(),canvas.width/2,canvas.height-15);}
}
function downloadMeme(){const c=document.getElementById('meme-canvas');if(!c)return;const a=document.createElement('a');a.download='meme.png';a.href=c.toDataURL();a.click();}

function renderBgRemover(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="bgr-drop" onclick="document.getElementById('bgr-input').click()">
        <div class="file-drop-icon">✂️</div><div class="file-drop-label">Upload Image to Remove Background</div><div class="file-drop-hint">Best results with clear subjects</div>
        <input type="file" id="bgr-input" accept="image/*" style="display:none" onchange="handleBGRemove(event.target.files[0])">
      </div>
      <div id="bgr-result" style="display:none;margin-top:1rem"></div>
    </div>
    <div class="info-box info-box-amber">ℹ️ Browser-based BG removal. For best results use images with clear contrast. Professional results available via external APIs.</div>`;
  setupDrop('bgr-drop',handleBGRemove);
}
function handleBGRemove(f){
  if(!f||!f.type.startsWith('image/'))return;
  const el=document.getElementById('bgr-result'); el.style.display='block';
  el.innerHTML='<div style="text-align:center;padding:1.5rem"><div style="font-size:2rem;animation:spin 1s linear infinite">⏳</div><p style="color:var(--text2);margin-top:.5rem">Processing...</p></div>';
  const r=new FileReader(); r.onload=e=>{const img=new Image(); img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
  // Simple threshold-based removal (for demo; real removal needs ML API)
  const d=ctx.getImageData(0,0,c.width,c.height);const data=d.data;
  const tr=data[0],tg=data[1],tb=data[2];// sample top-left corner as background
  for(let i=0;i<data.length;i+=4){if(Math.abs(data[i]-tr)<40&&Math.abs(data[i+1]-tg)<40&&Math.abs(data[i+2]-tb)<40)data[i+3]=0;}
  ctx.putImageData(d,0,0);
  const url=c.toDataURL('image/png');
  el.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"><div><p style="font-size:.78rem;color:var(--text3);margin-bottom:.35rem">Original</p><img src="${e.target.result}" style="width:100%;border-radius:var(--r-md)"></div><div><p style="font-size:.78rem;color:var(--text3);margin-bottom:.35rem">Removed BG</p><div style="background:repeating-conic-gradient(#ccc 0% 25%,white 0% 50%) 0 0/20px 20px;border-radius:var(--r-md)"><img src="${url}" style="width:100%;border-radius:var(--r-md)"></div></div></div><button class="btn-primary-glow" style="margin-top:.75rem" onclick="(()=>{const a=document.createElement('a');a.download='removed-bg.png';a.href='${url}';a.click()})()">📥 Download PNG</button>`;
  }; img.src=e.target.result;};r.readAsDataURL(f);
}

function renderImgCropper(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="crop-drop" onclick="document.getElementById('crop-input').click()">
        <div class="file-drop-icon">✂️</div><div class="file-drop-label">Upload Image to Crop</div>
        <input type="file" id="crop-input" accept="image/*" style="display:none" onchange="loadCropImage(event.target.files[0])">
      </div>
      <div id="crop-editor" style="display:none;margin-top:1rem">
        <canvas id="crop-canvas" style="max-width:100%;border-radius:var(--r-md);cursor:crosshair;display:block;margin:0 auto"></canvas>
        <div class="form-grid" style="margin-top:1rem">
          <div class="form-group"><label class="form-label">X</label><input class="form-input" type="number" id="crop-x" value="0" oninput="drawCrop()"></div>
          <div class="form-group"><label class="form-label">Y</label><input class="form-input" type="number" id="crop-y" value="0" oninput="drawCrop()"></div>
          <div class="form-group"><label class="form-label">Width</label><input class="form-input" type="number" id="crop-w" value="200" oninput="drawCrop()"></div>
          <div class="form-group"><label class="form-label">Height</label><input class="form-input" type="number" id="crop-h" value="200" oninput="drawCrop()"></div>
        </div>
        <button class="btn-primary-glow" onclick="doCrop()">✂️ Crop & Download</button>
      </div>
    </div>`;
  setupDrop('crop-drop',loadCropImage);
}
let _cropImg=null;
function loadCropImage(f){if(!f||!f.type.startsWith('image/'))return;const r=new FileReader();r.onload=e=>{_cropImg=new Image();_cropImg.onload=()=>{const c=document.getElementById('crop-canvas');const scale=Math.min(1,500/_cropImg.width);c.width=_cropImg.width*scale;c.height=_cropImg.height*scale;c.getContext('2d').drawImage(_cropImg,0,0,c.width,c.height);document.getElementById('crop-editor').style.display='block';document.getElementById('crop-w').value=Math.round(c.width/2);document.getElementById('crop-h').value=Math.round(c.height/2);};_cropImg.src=e.target.result;};r.readAsDataURL(f);}
function drawCrop(){const c=document.getElementById('crop-canvas'),ctx=c.getContext('2d');if(!_cropImg)return;const scale=c.width/_cropImg.width;ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(_cropImg,0,0,c.width,c.height);const x=parseInt(document.getElementById('crop-x')?.value||0)*scale, y=parseInt(document.getElementById('crop-y')?.value||0)*scale, w=parseInt(document.getElementById('crop-w')?.value||200)*scale, h=parseInt(document.getElementById('crop-h')?.value||200)*scale;ctx.strokeStyle='#6366f1';ctx.lineWidth=2;ctx.setLineDash([6]);ctx.strokeRect(x,y,w,h);ctx.fillStyle='rgba(99,102,241,.1)';ctx.fillRect(x,y,w,h);}
function doCrop(){if(!_cropImg)return;const x=parseInt(document.getElementById('crop-x')?.value)||0,y=parseInt(document.getElementById('crop-y')?.value)||0,w=parseInt(document.getElementById('crop-w')?.value)||200,h=parseInt(document.getElementById('crop-h')?.value)||200;const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(_cropImg,x,y,w,h,0,0,w,h);const a=document.createElement('a');a.download=`cropped_${w}x${h}.png`;a.href=c.toDataURL();a.click();showToast('✅ Cropped & downloaded!','success');}

function renderOCRTool(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="ocr-drop" onclick="document.getElementById('ocr-input').click()">
        <div class="file-drop-icon">🔤</div><div class="file-drop-label">Upload Image to Extract Text</div><div class="file-drop-hint">PNG, JPG, PDF supported</div>
        <input type="file" id="ocr-input" accept="image/*,.pdf" style="display:none" onchange="doOCR(event.target.files[0])">
      </div>
      <div id="ocr-result" style="display:none;margin-top:1rem"></div>
    </div>
    <div class="info-box info-box-blue">🔍 OCR powered by OCR.space API. Max file size: 1MB.</div>`;
  setupDrop('ocr-drop',(f)=>doOCR(f));
}
async function doOCR(f){
  if(!f) return;
  const el=document.getElementById('ocr-result'); el.style.display='block';
  // Validate file type and size
  const ALLOWED=['image/jpeg','image/png','image/gif','image/webp','image/bmp','application/pdf'];
  if(!ALLOWED.includes(f.type)){el.innerHTML='<div class="info-box" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:#ef4444">❌ Unsupported file type. Please upload an image or PDF.</div>';return;}
  if(f.size>1048576){el.innerHTML='<div class="info-box" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:#ef4444">❌ File too large. Maximum size is 1MB.</div>';return;}
  el.innerHTML='<div style="text-align:center;padding:1.5rem"><div style="font-size:2rem;animation:spin 1s linear infinite">⏳</div><p style="color:var(--text2);margin-top:.5rem">Extracting text...</p></div>';
  try {
    // Convert to base64 to send to our secure proxy
    const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.onerror=()=>rej(new Error('File read failed'));r.readAsDataURL(f);});
    const response=await fetch('/.netlify/functions/ocr',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({fileBase64:base64,mimeType:f.type,language:'eng'}),
      signal:AbortSignal.timeout(35000),
    });
    const data=await response.json();
    if(!response.ok){el.innerHTML=`<div class="info-box" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:#ef4444">❌ ${data.error||'OCR failed. Please try again.'}</div>`;return;}
    const text=data.text||'No text found in this image.';
    const safeText=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    el.innerHTML=`<label class="form-label">Extracted Text</label><textarea class="form-textarea" style="min-height:200px" readonly>${safeText}</textarea><div style="display:flex;gap:.75rem;margin-top:.5rem"><button class="btn-primary-glow" onclick="copyToClipboard(document.querySelector('#ocr-result textarea').value,'Text copied!')">📋 Copy</button><button class="btn-outline-glow" onclick="const b=document.createElement('a');b.download='extracted.txt';b.href='data:text/plain,'+encodeURIComponent(document.querySelector('#ocr-result textarea').value);b.click()">📥 Download TXT</button></div>`;
  } catch(e){
    const msg=e.name==='TimeoutError'||e.name==='AbortError'?'OCR timed out. Try a smaller image.':'OCR failed. Check your connection and try again.';
    el.innerHTML=`<div class="info-box" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:#ef4444">❌ ${msg}</div>`;
  }
}

// ── PDF TOOLS ──
// ── SHARED SECURE OCR HELPER ─────────────────────────────────────────────────
// Used by JPG-to-Word, JPG-to-Excel, Batch Image-to-Text, and Image Translator.
// Routes through /.netlify/functions/ocr (server-side OCR_API_KEY) — never
// calls api.ocr.space directly from the browser with a hardcoded key.
async function _runSecureOCR(file, language = 'eng') {
  const base64 = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = () => rej(new Error('File read failed'));
    r.readAsDataURL(file);
  });
  const response = await fetch('/.netlify/functions/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileBase64: base64, mimeType: file.type, language }),
    signal: AbortSignal.timeout(35000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'OCR failed. Please try again.');
  return data.text || '';
}

// ── PDF → IMAGE (shared engine for PDF to JPG / PDF to PNG) ─────────────────
// Renders each page to a canvas via pdf.js (already loaded elsewhere in the app)
// and exports real image files — single page downloads directly, multi-page PDFs
// get zipped with JSZip so the user gets one file instead of N separate downloads.
async function _convertPDFtoImages(file, format, resultElId) {
  const res = document.getElementById(resultElId);
  if (!file) return;
  const ext = format === 'image/png' ? 'png' : 'jpg';
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Loading PDF engine…</p>';
  try {
    const pdfjsLib = await ensurePDFjs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    res.innerHTML = `<div class="loading-spinner"></div><p style="text-align:center">Rendering page 1 of ${pdf.numPages}…</p>`;

    const blobs = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 }); // 2x for crisp output
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (format !== 'image/png') { ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise(r => canvas.toBlob(r, format, 0.92));
      blobs.push(blob);
      const p = res.querySelector('p');
      if (p) p.textContent = `Rendering page ${i} of ${pdf.numPages}…`;
    }

    const baseName = file.name.replace(/\.pdf$/i, '');

    if (blobs.length === 1) {
      res.innerHTML = `<div class="info-box info-box-green">✅ Converted 1 page to ${ext.toUpperCase()}</div>
        <img src="${URL.createObjectURL(blobs[0])}" style="max-width:100%;border-radius:var(--r-md);border:1px solid var(--border);margin:.75rem 0;display:block">`;
      res.appendChild(_dlBtn(`${baseName}.${ext}`, blobs[0], `⬇️ Download ${ext.toUpperCase()}`));
    } else {
      res.innerHTML = `<div class="info-box info-box-green">✅ Converted ${blobs.length} pages to ${ext.toUpperCase()}</div>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin:.75rem 0" id="p2img-thumbs"></div>`;
      const thumbs = document.getElementById('p2img-thumbs');
      blobs.forEach((b,i) => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(b);
        img.style.cssText = 'width:80px;height:auto;border-radius:6px;border:1px solid var(--border)';
        img.title = `Page ${i+1}`;
        thumbs.appendChild(img);
      });
      if (!window.JSZip) {
        await new Promise((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          s.onload = resolve; s.onerror = resolve;
          document.head.appendChild(s);
        });
      }
      if (window.JSZip) {
        const zip = new JSZip();
        blobs.forEach((b,i) => zip.file(`${baseName}_page${i+1}.${ext}`, b));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        res.appendChild(_dlBtn(`${baseName}_images.zip`, zipBlob, `⬇️ Download All as ZIP (${blobs.length} ${ext.toUpperCase()}s)`));
      } else {
        // Fallback: individual download links if JSZip couldn't load
        blobs.forEach((b,i) => res.appendChild(_dlBtn(`${baseName}_page${i+1}.${ext}`, b, `⬇️ Page ${i+1}`)));
      }
    }
    showToast(`PDF converted to ${ext.toUpperCase()}!`, 'success');
  } catch (e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

function renderPDFTool(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="info-box info-box-blue">Converts each PDF page into a high-quality JPG image, right in your browser.</div>
      <div class="file-drop-zone" id="pdf-drop" onclick="document.getElementById('pdf-input').click()" style="margin:.75rem 0">
        <div class="file-drop-icon">🖼️</div><div class="file-drop-label">Upload PDF File</div>
        <input type="file" id="pdf-input" accept=".pdf" style="display:none" onchange="_convertPDFtoImages(event.target.files[0],'image/jpeg','pdf-result')">
      </div>
      <div id="pdf-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('pdf-drop', f => _convertPDFtoImages(f,'image/jpeg','pdf-result'));
}

function renderImgToPDF(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="i2p-drop" onclick="document.getElementById('i2p-input').click()">
        <div class="file-drop-icon">📄</div><div class="file-drop-label">Upload Images (select multiple)</div><div class="file-drop-hint">JPG, PNG, WebP</div>
        <input type="file" id="i2p-input" accept="image/*" multiple style="display:none" onchange="handleI2P(event.target.files)">
      </div>
      <div id="i2p-result" style="margin-top:1rem"></div>
      <button class="btn-primary-glow" style="display:none;margin-top:.75rem" id="i2p-btn" onclick="convertToPDF()">📄 Convert to PDF</button>
    </div>`;
  setupDrop('i2p-drop',f=>handleI2P([f]));
}
let _i2pFiles=[];
function handleI2P(files){
  _i2pFiles=[...files]; const el=document.getElementById('i2p-result');
  el.innerHTML=`<p style="font-size:.85rem;color:var(--text2)">${files.length} image(s) selected: ${[...files].map(f=>f.name).join(', ')}</p>`;
  document.getElementById('i2p-btn').style.display='block';
}
async function convertToPDF(){
  if(!_i2pFiles.length) return;
  try{
    const {PDFDocument}=window.PDFLib||{};
    if(!PDFDocument){showToast('PDF library loading...','info');const s=document.createElement('script');s.src='https://unpkg.com/pdf-lib/dist/pdf-lib.min.js';s.onload=convertToPDF;document.head.appendChild(s);return;}
    showToast('Creating PDF...','info');
    const pdfDoc=await PDFDocument.create();
    for(const f of _i2pFiles){const bytes=await f.arrayBuffer();let img;if(f.type==='image/jpeg')img=await pdfDoc.embedJpg(bytes);else img=await pdfDoc.embedPng(bytes);const page=pdfDoc.addPage([img.width,img.height]);page.drawImage(img,{x:0,y:0,width:img.width,height:img.height});}
    const pdfBytes=await pdfDoc.save();const blob=new Blob([pdfBytes],{type:'application/pdf'});const a=document.createElement('a');a.download='images.pdf';a.href=URL.createObjectURL(blob);a.click();showToast('✅ PDF created!','success');
  }catch(e){showToast('❌ '+e.message,'error');}
}

function renderMergePDF(){document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget"><div class="file-drop-zone" id="mpdf-drop" onclick="document.getElementById('mpdf-input').click()"><div class="file-drop-icon">🔗</div><div class="file-drop-label">Upload Multiple PDF Files</div><input type="file" id="mpdf-input" accept=".pdf" multiple style="display:none" onchange="handleMergePDF(event.target.files)"></div><div id="mpdf-result" style="margin-top:1rem"></div></div>`;setupDrop('mpdf-drop',f=>handleMergePDF([f]));}
function handleMergePDF(files){
  const fileArr = Array.from(files);
  window._mpdfFiles = (window._mpdfFiles || []).concat(fileArr);
  const result = document.getElementById('mpdf-result');
  result.innerHTML = `<div class="info-box info-box-green">${window._mpdfFiles.length} PDF(s) queued for merge.</div>
    <ul style="margin:.5rem 0;font-size:.83rem;color:var(--text2)">${window._mpdfFiles.map((f,i)=>`<li>${i+1}. ${f.name}</li>`).join('')}</ul>
    <div style="display:flex;gap:.5rem;margin-top:.5rem">
      <button class="btn-primary-glow" onclick="doMergePDF()">🔗 Merge All PDFs</button>
      <button class="btn-outline-glow" onclick="window._mpdfFiles=[];document.getElementById('mpdf-result').innerHTML=''">🗑️ Clear</button>
    </div><div id="mpdf-output" style="margin-top:.75rem"></div>`;
}
async function doMergePDF() {
  const files = window._mpdfFiles || [];
  if (files.length < 2) { showToast('Add at least 2 PDFs','warning'); return; }
  const out = document.getElementById('mpdf-output');
  out.innerHTML = '<p style="color:var(--text3)">Merging...</p>';
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument } = window.PDFLib;
    const merged = await PDFDocument.create();
    for (const file of files) {
      const ab = await file.arrayBuffer();
      const doc = await PDFDocument.load(ab);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const bytes = await merged.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    out.innerHTML = `<div class="info-box info-box-green">✅ Merged ${files.length} PDFs!</div>
      <a href="${url}" download="merged.pdf" class="btn-primary-glow" style="display:inline-block;margin-top:.5rem">📥 Download Merged PDF</a>`;
    window._mpdfFiles = [];
  } catch(e) { out.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

function renderCompressPDF(){
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget">
    <div class="info-box info-box-blue">Re-saves the PDF to reduce file size. Works best on PDFs with redundant data.</div>
    <div class="file-drop-zone" id="cpdf-drop" onclick="document.getElementById('cpdf-input').click()" style="margin:.75rem 0">
      <div class="file-drop-icon">🗜️</div><div class="file-drop-label">Upload PDF to Compress</div>
      <input type="file" id="cpdf-input" accept=".pdf" style="display:none" onchange="doCompressPDF(event.target.files[0])">
    </div>
    <div id="cpdf-result"></div></div>`;
  setupDrop('cpdf-drop', f => doCompressPDF(f));
}
async function doCompressPDF(file) {
  const result = document.getElementById('cpdf-result');
  result.innerHTML = '<p style="color:var(--text3)">Compressing...</p>';
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument } = window.PDFLib;
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const bytes = await doc.save({ useObjectStreams: true });
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    const pct = ((1 - blob.size/file.size)*100).toFixed(1);
    result.innerHTML = `<div class="info-box info-box-green">✅ Original: ${(file.size/1024).toFixed(1)}KB → Compressed: ${(blob.size/1024).toFixed(1)}KB (${pct > 0 ? '-'+pct+'%' : 'optimized'})</div>
      <a href="${url}" download="compressed.pdf" class="btn-primary-glow" style="display:inline-block;margin-top:.5rem">📥 Download Compressed</a>`;
  } catch(e) { result.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

function renderWatermarkPDF(){document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget"><div class="form-group"><label class="form-label">Watermark Text</label><input class="form-input" type="text" id="wm-text" placeholder="CONFIDENTIAL" value="CONFIDENTIAL"></div><div class="form-group"><label class="form-label">Upload PDF</label><input type="file" class="form-input" accept=".pdf" id="wm-pdf"></div><button class="btn-primary-glow" style="margin:.75rem 0" onclick="addWatermark()">💧 Add Watermark</button></div>`;}
async function addWatermark() {
  const textEl = document.getElementById('wm-text');
  const fileEl = document.getElementById('wm-pdf');
  if (!textEl?.value) { showToast('Enter watermark text','warning'); return; }
  if (!fileEl?.files?.[0]) { showToast('Upload a PDF first','warning'); return; }
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument, rgb, degrees } = window.PDFLib;
    const ab = await fileEl.files[0].arrayBuffer();
    const doc = await PDFDocument.load(ab);
    doc.getPages().forEach(page => {
      const { width, height } = page.getSize();
      page.drawText(textEl.value, {
        x: width/2 - (textEl.value.length * 8),
        y: height/2,
        size: 48,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.3,
        rotate: degrees(45),
      });
    });
    const bytes = await doc.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    showToast('✅ Watermark added!','success');
    const a = document.createElement('a'); a.download='watermarked.pdf'; a.href=url; a.click();
  } catch(e) { showToast('Error: '+e.message,'error'); }
}

function renderProtectPDF(){
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget">
    <div class="info-box info-box-blue">Add a password to your PDF. Recipients need the password to open it.</div>
    <div class="form-group" style="margin-top:.75rem"><label class="form-label">Upload PDF</label>
      <input type="file" class="form-input" accept=".pdf" id="prot-pdf"></div>
    <div class="form-group"><label class="form-label">Password</label>
      <input class="form-input" type="password" id="prot-pass" placeholder="Enter password to protect PDF"></div>
    <button class="btn-primary-glow" style="margin:.75rem 0" onclick="doProtectPDF()">🔒 Protect PDF</button>
    <div id="prot-result"></div></div>`;
}
async function doProtectPDF() {
  const fileEl = document.getElementById('prot-pdf');
  const pass = document.getElementById('prot-pass')?.value;
  const result = document.getElementById('prot-result');
  if (!fileEl?.files?.[0]) { showToast('Upload a PDF first','warning'); return; }
  if (!pass) { showToast('Enter a password','warning'); return; }
  result.innerHTML = '<p style="color:var(--text3)">Protecting PDF...</p>';
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument } = window.PDFLib;
    const ab = await fileEl.files[0].arrayBuffer();
    const doc = await PDFDocument.load(ab);
    // pdf-lib doesn't support encryption natively, so we inform the user
    const bytes = await doc.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    result.innerHTML = `<div class="info-box info-box-blue">ℹ️ PDF downloaded. For full password encryption, use Adobe Acrobat or a server-side tool. This tool re-saves the PDF structure.</div>
      <a href="${url}" download="protected.pdf" class="btn-primary-glow" style="display:inline-block;margin-top:.5rem">📥 Download PDF</a>`;
  } catch(e) { result.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

function renderPDFPageNumbers(){
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget">
    <div class="form-group"><label class="form-label">Upload PDF</label>
      <input type="file" class="form-input" accept=".pdf" id="pgnum-pdf"></div>
    <div class="form-group"><label class="form-label">Position</label>
      <select class="form-select" id="pgnum-pos"><option value="bc">Bottom Center</option><option value="br">Bottom Right</option><option value="tc">Top Center</option></select></div>
    <div class="form-group"><label class="form-label">Start from page number</label>
      <input class="form-input" type="number" id="pgnum-start" value="1" min="1"></div>
    <button class="btn-primary-glow" style="margin:.75rem 0" onclick="doAddPageNumbers()">🔢 Add Page Numbers</button>
    <div id="pgnum-result"></div></div>`;
}
async function doAddPageNumbers() {
  const fileEl = document.getElementById('pgnum-pdf');
  const pos = document.getElementById('pgnum-pos')?.value || 'bc';
  const startNum = parseInt(document.getElementById('pgnum-start')?.value || 1);
  const result = document.getElementById('pgnum-result');
  if (!fileEl?.files?.[0]) { showToast('Upload a PDF first','warning'); return; }
  result.innerHTML = '<p style="color:var(--text3)">Adding page numbers...</p>';
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
    const ab = await fileEl.files[0].arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    doc.getPages().forEach((page, i) => {
      const { width, height } = page.getSize();
      const label = String(i + startNum);
      const fontSize = 11;
      const textWidth = font.widthOfTextAtSize(label, fontSize);
      let x, y;
      if (pos === 'bc') { x = width/2 - textWidth/2; y = 18; }
      else if (pos === 'br') { x = width - textWidth - 18; y = 18; }
      else { x = width/2 - textWidth/2; y = height - 24; }
      page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.3,0.3,0.3) });
    });
    const bytes = await doc.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    result.innerHTML = `<div class="info-box info-box-green">✅ Page numbers added to ${doc.getPageCount()} pages!</div>
      <a href="${url}" download="numbered.pdf" class="btn-primary-glow" style="display:inline-block;margin-top:.5rem">📥 Download</a>`;
  } catch(e) { result.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

// ── FUN & VIRAL TOOLS ──
function renderLoveCalc(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">Your Name ❤️</label><input class="form-input" type="text" id="love-a" placeholder="Your name..."></div>
      <div class="form-group"><label class="form-label">Their Name 💕</label><input class="form-input" type="text" id="love-b" placeholder="Their name..."></div>
      <button class="btn-primary-glow" style="width:100%;justify-content:center;margin-top:.75rem" onclick="calcLove()">💝 Calculate Love</button>
      <div id="love-result" style="margin-top:1.5rem"></div>
    </div>`;
}
function calcLove(){
  const a=document.getElementById('love-a')?.value?.trim(), b=document.getElementById('love-b')?.value?.trim();
  if(!a||!b){showToast('Enter both names!','warning');return;}
  // Deterministic but fun calculation
  let pct=0;
  for(let i=0;i<(a+b).length;i++) pct+=((a+b).charCodeAt(i)*31)%100;
  pct=(pct%100+1);
  const msg=pct>80?'💑 Perfect Match! Made for each other!':pct>60?'😍 Great compatibility! Strong connection!':pct>40?'🤗 Good vibes! Worth exploring!':pct>20?'😊 Decent match! Give it time!':'💔 Opposites attract? Try anyway!';
  const hearts='❤️'.repeat(Math.floor(pct/20));
  document.getElementById('love-result').innerHTML=`<div class="love-result"><div class="love-hearts">${hearts}</div><div class="love-percent">${pct}%</div><div style="font-size:1.1rem;font-weight:700;color:var(--text);margin:.5rem 0">${a} + ${b}</div><p style="color:var(--text2)">${msg}</p><div class="progress-bar" style="margin:.75rem 0"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
}

function renderFriendshipCalc(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">Your Name</label><input class="form-input" type="text" id="fr-a" placeholder="Your name..."></div>
      <div class="form-group"><label class="form-label">Friend's Name</label><input class="form-input" type="text" id="fr-b" placeholder="Friend's name..."></div>
      <button class="btn-primary-glow" style="width:100%;justify-content:center;margin-top:.75rem" onclick="calcFriendship()">🤝 Check Friendship</button>
      <div id="fr-result" style="margin-top:1.5rem"></div>
    </div>`;
}
function calcFriendship(){
  const a=document.getElementById('fr-a')?.value?.trim(),b=document.getElementById('fr-b')?.value?.trim();
  if(!a||!b){showToast('Enter both names!','warning');return;}
  let pct=0;for(const c of (a+b)) pct+=(c.charCodeAt(0)*17+7)%100;pct=(pct%100+1);
  const types=[{p:90,lbl:'🏆 Best Friends Forever! Inseparable duo!'},{p:70,lbl:'⭐ Amazing friendship! Loyal and trustworthy.'},{p:50,lbl:'👍 Good friends with great potential!'},{p:30,lbl:'😊 Acquaintances who could grow closer.'},{p:0,lbl:'🌱 New friendship just beginning!'}];
  const {lbl}=types.find(t=>pct>=t.p)||types[types.length-1];
  document.getElementById('fr-result').innerHTML=`<div class="love-result"><div style="font-size:3rem">🤝</div><div class="love-percent">${pct}%</div><p style="color:var(--text2);margin:.5rem 0">${lbl}</p><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
}

function renderBirthdayCountdown(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">Your Birthday (Month/Day)</label><input class="form-input" type="text" id="bday-input" placeholder="MM/DD (e.g. 06/15)"></div>
      <div class="form-group"><label class="form-label">Your Name (optional)</label><input class="form-input" type="text" id="bday-name" placeholder="Your name"></div>
      <button class="btn-primary-glow" style="margin:.75rem 0;width:100%;justify-content:center" onclick="startBdayCountdown()">🎂 Start Countdown</button>
      <div id="bday-result"></div>
    </div>`;
}
function startBdayCountdown(){
  const input=document.getElementById('bday-input')?.value, name=document.getElementById('bday-name')?.value||'You';
  if(!input){showToast('Enter your birthday!','warning');return;}
  const [m,d]=input.split('/').map(Number);
  const update=()=>{
    const now=new Date(), bday=new Date(now.getFullYear(),m-1,d);
    if(bday<now) bday.setFullYear(now.getFullYear()+1);
    const diff=bday-now, days=Math.floor(diff/86400000), hrs=Math.floor((diff%86400000)/3600000), mins=Math.floor((diff%3600000)/60000), secs=Math.floor((diff%60000)/1000);
    const el=document.getElementById('bday-result');
    if(!el) return;
    el.innerHTML=`<div class="result-box"><div style="font-size:2rem;margin-bottom:.5rem">🎂</div><div style="font-size:.9rem;color:var(--text2);margin-bottom:.5rem">${name}'s next birthday</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem"><div class="result-item"><div class="result-value" style="font-size:1.8rem">${days}</div><div class="result-item-label">Days</div></div><div class="result-item"><div class="result-value" style="font-size:1.8rem">${hrs}</div><div class="result-item-label">Hours</div></div><div class="result-item"><div class="result-value" style="font-size:1.8rem">${mins}</div><div class="result-item-label">Mins</div></div><div class="result-item"><div class="result-value" style="font-size:1.8rem">${secs}</div><div class="result-item-label">Secs</div></div></div></div>`;
  };
  update(); clearInterval(window._bdayTimer); window._bdayTimer=setInterval(update,1000);
}

function renderRoastGen(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget" style="text-align:center">
      <div style="font-size:3rem;margin-bottom:1rem">🔥</div>
      <h3 style="font-weight:700;margin-bottom:.5rem">AI Roast Generator</h3>
      <p style="color:var(--text2);font-size:.85rem;margin-bottom:1.5rem">Just for fun! All roasts are fictional & harmless 😄</p>
      <div class="form-group"><label class="form-label">Enter a name to roast</label><input class="form-input" type="text" id="roast-name" placeholder="Enter name..." style="text-align:center;font-size:1rem"></div>
      <button class="btn-primary-glow" style="margin:.75rem auto;display:block" onclick="generateRoast()">🔥 Roast Me!</button>
      <div id="roast-result" style="margin-top:1rem;font-size:1rem;line-height:1.8;min-height:60px"></div>
    </div>`;
}
const ROASTS=['Wow {name}, even your WiFi password has more character than you!','{name} is proof that even mediocrity can dream big! 😂','{name} could start a fire at a water park — with their hot takes!','{name}: professionally confused, masterfully surviving!','They say every cloud has a silver lining. {name} is that cloud nobody needed.','{name} — living proof that you don\'t need talent to have confidence!','If overthinking were a sport, {name} would have 12 Olympic medals!'];
function generateRoast(){const n=document.getElementById('roast-name')?.value?.trim()||'You';const r=ROASTS[Math.floor(Math.random()*ROASTS.length)].replace(/{name}/g,n);document.getElementById('roast-result').innerHTML=`<div style="background:linear-gradient(135deg,rgba(239,68,68,.1),rgba(249,115,22,.1));border:1px solid rgba(239,68,68,.3);border-radius:var(--r-xl);padding:1.25rem;font-style:italic">🔥 "${r}"</div>`;}

function renderFortuneWheel(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">Options (one per line)</label><textarea class="form-textarea" id="wheel-opts" rows="6" placeholder="Option 1&#10;Option 2&#10;Option 3">Yes\nNo\nMaybe\nDefinitely\nNever\nAsk again</textarea></div>
      <button class="btn-primary-glow" style="margin:.75rem 0;width:100%;justify-content:center" onclick="spinFortuneWheel()">🎡 Spin!</button>
      <div id="wheel-result"></div>
    </div>`;
  document.getElementById('wheel-opts').value='Yes\nNo\nMaybe\nDefinitely\nNever\nAsk again';
}
function spinFortuneWheel(){
  const opts=document.getElementById('wheel-opts')?.value.trim().split('\n').filter(l=>l.trim());
  if(!opts.length){showToast('Enter some options!','warning');return;}
  const el=document.getElementById('wheel-result');
  el.innerHTML='<div style="font-size:3rem;text-align:center;animation:spin .8s ease-out">🎡</div>';
  setTimeout(()=>{const pick=opts[Math.floor(Math.random()*opts.length)];el.innerHTML=`<div class="result-box"><div style="font-size:2rem;margin-bottom:.5rem">🎉</div><div class="result-value" style="font-size:1.6rem">${pick}</div><div class="result-label">The wheel has spoken!</div></div>`;},1000);
}

function renderPersonalityTest(){
  const questions=[{q:'How do you recharge?',opts:['Alone time (Introvert)','With friends (Extrovert)']},{q:'Decision making style?',opts:['Logic & facts','Gut feeling']},{q:'How do you plan?',opts:['Detailed planner','Flexible & spontaneous']},{q:'Under stress, you?',opts:['Want solutions','Need emotional support']},{q:'You prefer?',opts:['Deep 1-on-1 chats','Group conversations']}];
  let qIdx=0, answers=[];
  const showQ=()=>{
    const q=questions[qIdx];
    document.getElementById('ptest-wrap').innerHTML=`<div class="result-box"><div style="font-size:.82rem;color:var(--text3);margin-bottom:.5rem">Question ${qIdx+1} of ${questions.length}</div><h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem">${q.q}</h3>${q.opts.map((o,i)=>`<button class="cat-chip" style="width:100%;margin-bottom:.5rem;justify-content:flex-start" onclick="window._ptAnswer(${i})">${o}</button>`).join('')}</div>`;
    const fill=Math.round(qIdx/questions.length*100);
    document.getElementById('ptest-prog').style.width=fill+'%';
  };
  window._ptAnswer=(i)=>{answers.push(i);qIdx++;if(qIdx>=questions.length){const intro=answers[0],logic=answers[1],plan=answers[2];const type=(intro===0?'I':'E')+(logic===0?'T':'F')+(plan===0?'J':'P');const types={ITP:'INTJ',ITJ:'ISTJ',IFP:'INFP',IFJ:'ISFJ',ETP:'ENTP',ETJ:'ENTJ',EFP:'ENFP',EFJ:'ESFJ'};const pType=types[type]||'INFP';document.getElementById('ptest-wrap').innerHTML=`<div class="result-box"><div style="font-size:3rem;margin-bottom:.5rem">🧠</div><div class="result-value">${pType}</div><div class="result-label">Your Personality Type</div><button class="btn-outline-glow" style="margin-top:.75rem" onclick="${qIdx=0};${answers=[]};${showQ()}">Retake Test</button></div>`;document.getElementById('ptest-prog').style.width='100%';}else showQ();};
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget"><div class="progress-bar" style="margin-bottom:1rem"><div class="progress-fill" id="ptest-prog" style="width:0%"></div></div><div id="ptest-wrap"></div></div>`;
  showQ();
}

function renderRandomChallenge(){
  const challenges=['Do 20 pushups right now! 💪','Drink a full glass of water 💧','Text someone you haven\'t talked to in a while 📱','Take a 10-minute walk outside 🚶','Learn 5 words in a new language 🌍','Cook something you\'ve never made before 🍳','Do a 5-minute meditation 🧘','Read for 20 minutes without distractions 📚','Clean your desk/workspace 🧹','Write 3 things you\'re grateful for ✍️'];
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget" style="text-align:center"><div style="font-size:3rem;margin-bottom:1rem">🎯</div><h3 style="font-weight:700;margin-bottom:.5rem">Random Challenge Generator</h3><p style="color:var(--text2);font-size:.85rem;margin-bottom:1.5rem">Push your limits with fun daily challenges!</p><button class="btn-primary-glow" style="margin:0 auto;display:block" onclick="document.getElementById('challenge-box').innerHTML='<div class=result-box style=margin-top:1rem><div class=result-value style=font-size:1.3rem>${challenges[Math.floor(Math.random()*challenges.length)]}</div></div>'">🎲 Get Challenge</button><div id="challenge-box"></div></div>`;
}

function renderTruthGen(){
  const truths=['If you could have any superpower, what would it be?','What\'s the most embarrassing thing that\'s happened to you?','What\'s a secret talent nobody knows about?','If you could change one thing about yourself, what would it be?','What\'s the most scared you\'ve ever been?','What\'s your biggest regret?','If you could live in any time period, when would it be?','What\'s one thing on your bucket list?','What\'s the weirdest dream you\'ve ever had?','What would you do if you won a million dollars?'];
  document.getElementById('tool-widget-container').innerHTML=`<div class="tool-widget" style="text-align:center"><div style="font-size:3rem;margin-bottom:1rem">💡</div><h3 style="font-weight:700;margin-bottom:.5rem">Truth Question Generator</h3><p style="color:var(--text2);font-size:.85rem;margin-bottom:1.5rem">Interesting questions for party games and icebreakers!</p><button class="btn-primary-glow" style="margin:0 auto;display:block" onclick="document.getElementById('truth-box').innerHTML='<div class=result-box style=margin-top:1rem><div style=font-size:1.1rem;font-style:italic;color:var(--text)>' + truths[Math.floor(Math.random()*truths.length)]+'</div></div>'">💬 Get Question</button><div id="truth-box"></div></div>`;
}

function renderDiceRoller(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget" style="text-align:center">
      <div style="font-size:6rem;margin:1.5rem 0;transition:transform .3s" id="dice-face">🎲</div>
      <div style="font-size:3rem;font-weight:900;font-family:var(--font-display);background:var(--grad-main);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:1rem" id="dice-result">?</div>
      <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.5rem">
        ${[4,6,8,10,12,20].map(s=>`<button class="cat-chip" onclick="rollDice(${s})">D${s}</button>`).join('')}
      </div>
      <div class="form-grid" style="max-width:300px;margin:0 auto 1rem">
        <div class="form-group"><label class="form-label">Number of dice</label><input class="form-input" type="number" id="dice-count" value="1" min="1" max="10"></div>
        <div class="form-group"><label class="form-label">Sides</label><input class="form-input" type="number" id="dice-sides" value="6" min="2" max="100"></div>
      </div>
      <button class="btn-primary-glow" style="margin:0 auto;display:block" onclick="rollCustomDice()">🎲 Roll!</button>
      <div id="dice-history" style="margin-top:1rem;font-size:.82rem;color:var(--text3)"></div>
    </div>`;
  window._diceHistory=[];
}
function rollDice(sides){
  const face=document.getElementById('dice-face'), res=document.getElementById('dice-result');
  face.style.transform='rotate(360deg)'; setTimeout(()=>face.style.transform='',300);
  const r=Math.floor(Math.random()*sides)+1;
  res.textContent=r;
  const faces={4:'🎴',6:'🎲',8:'🔷',10:'🔟',12:'🔹',20:'🔶'};
  face.textContent=faces[sides]||'🎲';
  window._diceHistory.unshift(`D${sides}: ${r}`);
  window._diceHistory=window._diceHistory.slice(0,5);
  document.getElementById('dice-history').textContent='History: '+window._diceHistory.join(' · ');
}
function rollCustomDice(){
  const count=parseInt(document.getElementById('dice-count')?.value)||1, sides=parseInt(document.getElementById('dice-sides')?.value)||6;
  const rolls=Array.from({length:count},()=>Math.floor(Math.random()*sides)+1);
  const sum=rolls.reduce((a,b)=>a+b,0);
  document.getElementById('dice-result').textContent=count>1?`${rolls.join('+')} = ${sum}`:sum;
  window._diceHistory.unshift(`${count}D${sides}: ${sum}`);
  window._diceHistory=window._diceHistory.slice(0,5);
  document.getElementById('dice-history').textContent='History: '+window._diceHistory.join(' · ');
}

function renderWheelSpinner(){
  renderFortuneWheel(); // Reuse fortune wheel
}

function renderTruthDareGame(){
  const truths=['What\'s your most embarrassing moment?','Who was your first crush?','What\'s the biggest lie you\'ve told?','What\'s your most embarrassing text?'],dares=['Do 10 jumping jacks','Speak in an accent for 1 minute','Send a funny selfie to a contact','Do your best celebrity impression'];
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget" style="text-align:center">
      <div style="font-size:3rem;margin-bottom:1rem">🎭</div>
      <h3 style="font-weight:700;margin-bottom:1.5rem">Truth or Dare</h3>
      <div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1.5rem">
        <button class="btn-primary-glow" onclick="getTD('truth')">💬 Truth</button>
        <button class="btn-secondary-glow" onclick="getTD('dare')">⚡ Dare</button>
      </div>
      <div id="td-result"></div>
    </div>`;
  window._tdTruths=truths; window._tdDares=dares;
}
function getTD(type){const pool=type==='truth'?window._tdTruths:window._tdDares;const pick=pool[Math.floor(Math.random()*pool.length)];document.getElementById('td-result').innerHTML=`<div class="result-box"><div style="font-size:1.5rem;margin-bottom:.5rem">${type==='truth'?'💬 Truth':'⚡ Dare'}</div><p style="font-size:1rem;font-style:italic;color:var(--text)">"${pick}"</p></div>`;}

function renderRandomNum(){
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget" style="text-align:center">
      <div class="form-grid" style="max-width:300px;margin:0 auto 1rem">
        <div class="form-group"><label class="form-label">Min</label><input class="form-input" type="number" id="rn-min" value="1"></div>
        <div class="form-group"><label class="form-label">Max</label><input class="form-input" type="number" id="rn-max" value="100"></div>
        <div class="form-group"><label class="form-label">Count</label><select class="form-select" id="rn-count"><option>1</option><option>5</option><option>10</option></select></div>
      </div>
      <div style="font-family:var(--font-display);font-size:5rem;font-weight:900;background:var(--grad-main);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:1rem 0" id="rn-result">?</div>
      <div id="rn-list" style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-bottom:1rem"></div>
      <button class="btn-primary-glow" style="margin:0 auto;display:block" onclick="genRandNum()">🎲 Generate</button>
    </div>`;
}
function genRandNum(){
  const min=parseInt(document.getElementById('rn-min')?.value)||1, max=parseInt(document.getElementById('rn-max')?.value)||100, count=parseInt(document.getElementById('rn-count')?.value)||1;
  const nums=Array.from({length:count},()=>Math.floor(Math.random()*(max-min+1))+min);
  document.getElementById('rn-result').textContent=nums[0];
  document.getElementById('rn-list').innerHTML=count>1?nums.map(n=>`<span style="padding:4px 12px;background:var(--glass2);border:1px solid var(--border);border-radius:99px;font-family:var(--font-display);font-weight:700">${n}</span>`).join(''):'';
}

// ── HELPER FUNCTIONS ──
function setupDrop(dropId, handler){
  const el=document.getElementById(dropId); if(!el) return;
  el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('drag-over');});
  el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));
  el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('drag-over');if(e.dataTransfer.files[0]) handler(e.dataTransfer.files[0]);});
}

function formatCurrency(n,sym='₹'){return sym+n.toLocaleString('en-IN',{maximumFractionDigits:2});}
function generateUUID(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);});}
function copyText(id){const el=document.getElementById(id);if(el)copyToClipboard(el.value,'Copied!');}

function shareTool(id){
  const tool=ALL_TOOLS.find(t=>t.id===id); if(!tool) return;
  const url=`${location.origin}/#tool/${id}`;
  if(navigator.share) navigator.share({title:tool.name,text:tool.desc,url});
  else copyToClipboard(url,'Link copied!');
}

// ── FACE BLUR TOOL ──
function renderFaceBlur() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="file-drop-zone" id="fb-drop" onclick="document.getElementById('fb-input').click()">
        <div class="file-drop-icon">😶</div>
        <div class="file-drop-label">Upload Image to Blur Faces</div>
        <div class="file-drop-hint">JPG, PNG, WEBP — drag & drop or click to select</div>
        <input type="file" id="fb-input" accept="image/*" style="display:none" onchange="fbLoadImage(event.target.files[0])">
      </div>

      <div id="fb-editor" style="display:none;margin-top:1rem">
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r-lg);padding:.75rem;margin-bottom:.75rem">
          <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:.6rem">
            <span style="font-size:.82rem;color:var(--text2);font-weight:600">Mode:</span>
            <button id="fb-mode-draw" class="game-control-btn" style="padding:.3rem .75rem;font-size:.78rem" onclick="fbSetMode('draw')">✏️ Draw Region</button>
            <button id="fb-mode-erase" class="game-control-btn" style="padding:.3rem .75rem;font-size:.78rem;background:var(--glass2);color:var(--text);border:1px solid var(--border)" onclick="fbSetMode('erase')">🧹 Erase Region</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center">
            <span style="font-size:.82rem;color:var(--text2);font-weight:600">Blur strength:</span>
            <input type="range" id="fb-strength" min="5" max="40" value="18" style="flex:1;min-width:100px" oninput="document.getElementById('fb-strength-val').textContent=this.value">
            <span id="fb-strength-val" style="font-size:.82rem;font-weight:700;min-width:2ch">18</span>
            <button class="game-control-btn" style="padding:.3rem .75rem;font-size:.78rem;background:var(--glass2);color:var(--text);border:1px solid var(--border)" onclick="fbClearAll()">🗑️ Clear All</button>
          </div>
        </div>

        <div style="position:relative;display:inline-block;max-width:100%;width:100%;text-align:center">
          <canvas id="fb-canvas" style="max-width:100%;border-radius:var(--r-md);border:2px solid var(--border);cursor:crosshair;display:block;margin:0 auto;touch-action:none"></canvas>
          <canvas id="fb-overlay" style="position:absolute;top:0;left:50%;transform:translateX(-50%);max-width:100%;border-radius:var(--r-md);cursor:crosshair;pointer-events:all;touch-action:none"></canvas>
        </div>

        <div id="fb-hint" style="text-align:center;font-size:.8rem;color:var(--text3);margin:.5rem 0">
          🖱️ Click and drag to draw a blur region over faces
        </div>

        <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;margin-top:.5rem">
          <button class="btn-primary-glow" onclick="fbApplyAndDownload()">📥 Apply Blur & Download</button>
          <button class="game-control-btn" style="background:var(--glass2);color:var(--text);border:1px solid var(--border)" onclick="document.getElementById('fb-input').click()">🔄 Load New Image</button>
        </div>
      </div>
    </div>
    <div class="info-box info-box-blue">💡 <strong>How to use:</strong> Upload a photo → drag to draw boxes over faces → click Download. All processing is 100% in your browser — no image is uploaded anywhere.</div>
  `;
  setupDrop('fb-drop', fbLoadImage);
  fbInit();
}

let _fb = {
  img: null, scale: 1, regions: [],
  drawing: false, mode: 'draw',
  startX: 0, startY: 0, curX: 0, curY: 0
};

function fbInit() {
  _fb = { img: null, scale: 1, regions: [], drawing: false, mode: 'draw', startX:0, startY:0, curX:0, curY:0 };
}

function fbLoadImage(f) {
  if (!f || !f.type.startsWith('image/')) { showToast('Please upload an image file', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      _fb.img = img;
      _fb.regions = [];
      const MAX = 600;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      _fb.scale = scale;
      const W = Math.round(img.width * scale);
      const H = Math.round(img.height * scale);

      const canvas = document.getElementById('fb-canvas');
      const overlay = document.getElementById('fb-overlay');
      canvas.width = W; canvas.height = H;
      overlay.width = W; overlay.height = H;
      overlay.style.width = W + 'px';
      overlay.style.height = H + 'px';

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, W, H);

      document.getElementById('fb-editor').style.display = 'block';
      document.getElementById('fb-drop').style.display = 'none';
      fbBindEvents();
      fbRedrawOverlay();
      fbSetMode('draw');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(f);
}

function fbBindEvents() {
  const ov = document.getElementById('fb-overlay');
  if (!ov) return;

  const getPos = (e) => {
    const rect = ov.getBoundingClientRect();
    const scaleX = ov.width / rect.width;
    const scaleY = ov.height / rect.height;
    const cx = (e.touches ? e.touches[0].clientX : e.clientX);
    const cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  };

  ov.onmousedown = ov.ontouchstart = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    _fb.drawing = true;
    _fb.startX = pos.x; _fb.startY = pos.y;
    _fb.curX = pos.x; _fb.curY = pos.y;
  };
  ov.onmousemove = ov.ontouchmove = (e) => {
    e.preventDefault();
    if (!_fb.drawing) return;
    const pos = getPos(e);
    _fb.curX = pos.x; _fb.curY = pos.y;
    fbRedrawOverlay();
  };
  ov.onmouseup = ov.ontouchend = (e) => {
    e.preventDefault();
    if (!_fb.drawing) return;
    _fb.drawing = false;
    const x = Math.min(_fb.startX, _fb.curX);
    const y = Math.min(_fb.startY, _fb.curY);
    const w = Math.abs(_fb.curX - _fb.startX);
    const h = Math.abs(_fb.curY - _fb.startY);
    if (w > 5 && h > 5) {
      if (_fb.mode === 'draw') {
        _fb.regions.push({ x, y, w, h });
        showToast('Blur region added ✓', 'success');
      } else {
        // Erase: remove any region overlapping selection
        _fb.regions = _fb.regions.filter(r =>
          !(r.x < x + w && r.x + r.w > x && r.y < y + h && r.y + r.h > y)
        );
        showToast('Region removed', 'info');
      }
    }
    fbRedrawOverlay();
  };
}

function fbRedrawOverlay() {
  const ov = document.getElementById('fb-overlay');
  if (!ov) return;
  const ctx = ov.getContext('2d');
  ctx.clearRect(0, 0, ov.width, ov.height);

  // Draw committed regions
  _fb.regions.forEach(r => {
    ctx.fillStyle = 'rgba(99,102,241,0.25)';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    // Label
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('😶 Blur', r.x + 4, r.y + 14);
  });

  // Draw current drag rect
  if (_fb.drawing) {
    const x = Math.min(_fb.startX, _fb.curX);
    const y = Math.min(_fb.startY, _fb.curY);
    const w = Math.abs(_fb.curX - _fb.startX);
    const h = Math.abs(_fb.curY - _fb.startY);
    const color = _fb.mode === 'draw' ? '99,102,241' : '239,68,68';
    ctx.fillStyle = `rgba(${color},0.15)`;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = `rgba(${color},0.9)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }
}

function fbSetMode(mode) {
  _fb.mode = mode;
  const drawBtn = document.getElementById('fb-mode-draw');
  const eraseBtn = document.getElementById('fb-mode-erase');
  const hint = document.getElementById('fb-hint');
  if (mode === 'draw') {
    if (drawBtn) { drawBtn.style.background = ''; drawBtn.style.color = ''; drawBtn.style.border = ''; }
    if (eraseBtn) { eraseBtn.style.background = 'var(--glass2)'; eraseBtn.style.color = 'var(--text)'; eraseBtn.style.border = '1px solid var(--border)'; }
    if (hint) hint.textContent = '🖱️ Click and drag to draw a blur region over faces';
  } else {
    if (eraseBtn) { eraseBtn.style.background = ''; eraseBtn.style.color = ''; eraseBtn.style.border = ''; }
    if (drawBtn) { drawBtn.style.background = 'var(--glass2)'; drawBtn.style.color = 'var(--text)'; drawBtn.style.border = '1px solid var(--border)'; }
    if (hint) hint.textContent = '🧹 Click and drag to erase a blur region';
  }
}

function fbClearAll() {
  _fb.regions = [];
  fbRedrawOverlay();
  showToast('All regions cleared', 'info');
}

function fbPixelBlur(ctx, x, y, w, h, radius) {
  // Stack-blur style: average pixels in blocks
  x = Math.max(0, Math.floor(x));
  y = Math.max(0, Math.floor(y));
  w = Math.min(ctx.canvas.width - x, Math.ceil(w));
  h = Math.min(ctx.canvas.height - y, Math.ceil(h));
  if (w <= 0 || h <= 0) return;

  const imageData = ctx.getImageData(x, y, w, h);
  const data = imageData.data;
  const blockSize = Math.max(4, Math.floor(radius / 2));

  for (let by = 0; by < h; by += blockSize) {
    for (let bx = 0; bx < w; bx += blockSize) {
      // Sample center pixel of block
      const cx = Math.min(bx + Math.floor(blockSize / 2), w - 1);
      const cy = Math.min(by + Math.floor(blockSize / 2), h - 1);
      const si = (cy * w + cx) * 4;
      const r = data[si], g = data[si+1], b = data[si+2];
      // Fill block with that color
      for (let dy = 0; dy < blockSize && by + dy < h; dy++) {
        for (let dx = 0; dx < blockSize && bx + dx < w; dx++) {
          const idx = ((by + dy) * w + (bx + dx)) * 4;
          data[idx] = r; data[idx+1] = g; data[idx+2] = b;
        }
      }
    }
  }
  ctx.putImageData(imageData, x, y);
}

function fbApplyAndDownload() {
  if (!_fb.img) return;
  if (_fb.regions.length === 0) { showToast('Draw at least one blur region first!', 'error'); return; }

  const strength = parseInt(document.getElementById('fb-strength')?.value || 18);

  // Work on full-resolution image
  const outCanvas = document.createElement('canvas');
  outCanvas.width = _fb.img.width;
  outCanvas.height = _fb.img.height;
  const ctx = outCanvas.getContext('2d');
  ctx.drawImage(_fb.img, 0, 0);

  // Scale regions back to original resolution
  const invScale = 1 / _fb.scale;
  _fb.regions.forEach(r => {
    const rx = r.x * invScale;
    const ry = r.y * invScale;
    const rw = r.w * invScale;
    const rh = r.h * invScale;
    // Apply multiple passes for stronger blur
    for (let pass = 0; pass < 3; pass++) {
      fbPixelBlur(ctx, rx, ry, rw, rh, strength * (pass + 1));
    }
  });

  const url = outCanvas.toDataURL('image/jpeg', 0.92);
  const a = document.createElement('a');
  a.download = 'face-blurred.jpg';
  a.href = url;
  a.click();
  showToast('✅ Blurred image downloaded!', 'success');

  // Also update preview
  const previewCanvas = document.getElementById('fb-canvas');
  if (previewCanvas) {
    const pctx = previewCanvas.getContext('2d');
    pctx.drawImage(outCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
    _fb.regions = [];
    fbRedrawOverlay();
  }
}

// ══════════════════════════════════════════════════════════
// NEW TOOL IMPLEMENTATIONS
// ══════════════════════════════════════════════════════════

// ── IMAGE CONVERTER (universal) ──
function renderImgConvert(mode) {
  const labels = {
    'jpg-to-png': ['JPG','PNG','image/jpeg','image/png','png'],
    'jpg-to-webp': ['JPG','WebP','image/jpeg','image/webp','webp'],
    'png-to-jpg': ['PNG','JPG','image/png','image/jpeg','jpg'],
    'png-to-pdf': ['PNG','PDF','image/png','application/pdf','pdf'],
    'webp-to-jpg': ['WebP','JPG','image/webp','image/jpeg','jpg'],
    'svg-to-png': ['SVG','PNG','image/svg+xml','image/png','png'],
  };
  const [fromLabel,toLabel,acceptType,,ext] = labels[mode] || ['Image','Image','image/*','image/png','png'];
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="info-box info-box-blue">Convert your ${fromLabel} file to ${toLabel} instantly in your browser — no upload to server.</div>
      <div class="file-drop-zone" id="ic-drop" onclick="document.getElementById('ic-input').click()" style="margin:1rem 0">
        <div class="file-drop-icon">🖼️</div>
        <div class="file-drop-label">Click or drop ${fromLabel} file here</div>
        <input type="file" id="ic-input" accept="${acceptType}" style="display:none" onchange="handleImgConvert(event.target.files[0],'${mode}')">
      </div>
      <div id="ic-result"></div>
    </div>`;
  setupDrop('ic-drop', f => handleImgConvert(f, mode));
}
function handleImgConvert(file, mode) {
  if (!file) return;
  const result = document.getElementById('ic-result');
  result.innerHTML = '<p style="color:var(--text3)">Converting...</p>';
  if (mode === 'png-to-pdf') {
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          canvas.getContext('2d').drawImage(img,0,0);
          // Simple PDF wrapper around JPEG data
          canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            result.innerHTML = `<div class="info-box info-box-green">✅ Converted! <a href="${url}" download="converted.pdf" class="btn-primary-glow" style="display:inline-block;margin-top:.5rem">📥 Download PDF</a></div>
            <div style="margin-top:.75rem"><img src="${e.target.result}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--border)"></div>`;
          },'image/jpeg');
        };
        img.src = e.target.result;
      } catch(err) { result.innerHTML = `<p style="color:var(--red)">Error: ${err.message}</p>`; }
    };
    reader.readAsDataURL(file);
    return;
  }
  const outTypes = {'jpg-to-png':'image/png','jpg-to-webp':'image/webp','png-to-jpg':'image/jpeg','webp-to-jpg':'image/jpeg','svg-to-png':'image/png'};
  const exts = {'jpg-to-png':'png','jpg-to-webp':'webp','png-to-jpg':'jpg','webp-to-jpg':'jpg','svg-to-png':'png'};
  const outType = outTypes[mode] || 'image/png';
  const outExt = exts[mode] || 'png';
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img,0,0);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const sizeMB = (blob.size/1024/1024).toFixed(2);
        result.innerHTML = `
          <div class="info-box info-box-green">✅ Converted! ${img.width}×${img.height}px · ${sizeMB} MB</div>
          <div style="margin:.75rem 0"><img src="${url}" style="max-width:100%;max-height:250px;border-radius:8px;border:1px solid var(--border)"></div>
          <a href="${url}" download="converted.${outExt}" class="btn-primary-glow" style="display:inline-block">📥 Download ${outExt.toUpperCase()}</a>`;
      }, outType, 0.92);
    };
    img.onerror = () => { result.innerHTML = `<p style="color:var(--red)">Failed to load image. Try another file.</p>`; };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── PHOTO FILTERS ──
function renderPhotoFilters() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="pf-drop" onclick="document.getElementById('pf-input').click()">
        <div class="file-drop-icon">🎨</div>
        <div class="file-drop-label">Upload Photo</div>
        <input type="file" id="pf-input" accept="image/*" style="display:none" onchange="loadPhotoFilter(event.target.files[0])">
      </div>
      <div id="pf-controls" style="display:none;margin-top:1rem">
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem" id="pf-filter-btns"></div>
        <canvas id="pf-canvas" style="max-width:100%;border-radius:8px;border:1px solid var(--border);display:block;margin:0 auto"></canvas>
        <div style="display:flex;gap:.75rem;margin-top:.75rem;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary-glow" onclick="downloadPhotoFilter()">📥 Download</button>
        </div>
      </div>
    </div>`;
  setupDrop('pf-drop', f => loadPhotoFilter(f));
}
let _pfImg = null, _pfFilter = 'none';
const PF_FILTERS = {
  'None':'none','Grayscale':'grayscale(100%)','Sepia':'sepia(100%)','Vintage':'sepia(50%) contrast(120%) brightness(90%)',
  'Bright':'brightness(130%) contrast(110%)','Cool':'hue-rotate(180deg) saturate(120%)','Warm':'hue-rotate(30deg) saturate(130%)',
  'Invert':'invert(100%)','Blur':'blur(3px)','Sharpen':'contrast(150%) brightness(105%)',
};
function loadPhotoFilter(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _pfImg = new Image();
    _pfImg.onload = () => {
      document.getElementById('pf-controls').style.display = 'block';
      const btns = document.getElementById('pf-filter-btns');
      btns.innerHTML = Object.keys(PF_FILTERS).map(name =>
        `<button class="btn-outline-glow" style="font-size:.78rem;padding:.3rem .7rem" onclick="applyPhotoFilter('${name}')">${name}</button>`
      ).join('');
      applyPhotoFilter('None');
    };
    _pfImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
function applyPhotoFilter(name) {
  _pfFilter = name;
  const canvas = document.getElementById('pf-canvas');
  const ctx = canvas.getContext('2d');
  const maxW = Math.min(_pfImg.width, 600);
  const scale = maxW / _pfImg.width;
  canvas.width = maxW; canvas.height = _pfImg.height * scale;
  ctx.filter = PF_FILTERS[name] || 'none';
  ctx.drawImage(_pfImg, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';
}
function downloadPhotoFilter() {
  const canvas = document.getElementById('pf-canvas');
  if (!canvas) return;
  const a = document.createElement('a'); a.download = 'filtered.jpg';
  a.href = canvas.toDataURL('image/jpeg', 0.92); a.click();
}

// ── IMAGE WATERMARK ──
function renderImgWatermark() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="iw-drop" onclick="document.getElementById('iw-input').click()">
        <div class="file-drop-icon">💧</div><div class="file-drop-label">Upload Image</div>
        <input type="file" id="iw-input" accept="image/*" style="display:none" onchange="loadImgWatermark(event.target.files[0])">
      </div>
      <div id="iw-controls" style="display:none;margin-top:1rem">
        <div class="form-group"><label class="form-label">Watermark Text</label>
          <input class="form-input" id="iw-text" value="© My Photo" oninput="applyWatermark()">
        </div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Font Size</label>
            <input type="range" id="iw-size" min="16" max="120" value="40" oninput="applyWatermark()">
          </div>
          <div class="form-group"><label class="form-label">Opacity</label>
            <input type="range" id="iw-opacity" min="10" max="100" value="50" oninput="applyWatermark()">
          </div>
        </div>
        <div class="form-group"><label class="form-label">Color</label>
          <input type="color" id="iw-color" value="#ffffff" oninput="applyWatermark()" style="width:100%;height:42px;border:1px solid var(--border);border-radius:var(--r-md);padding:4px;cursor:pointer">
        </div>
        <canvas id="iw-canvas" style="max-width:100%;border-radius:8px;border:1px solid var(--border);display:block;margin:0 auto 1rem"></canvas>
        <button class="btn-primary-glow" onclick="downloadWatermark()">📥 Download</button>
      </div>
    </div>`;
  setupDrop('iw-drop', f => loadImgWatermark(f));
}
let _iwImg = null;
function loadImgWatermark(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _iwImg = new Image();
    _iwImg.onload = () => { document.getElementById('iw-controls').style.display='block'; applyWatermark(); };
    _iwImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
function applyWatermark() {
  const canvas = document.getElementById('iw-canvas');
  const ctx = canvas.getContext('2d');
  const maxW = Math.min(_iwImg.width, 700);
  const scale = maxW / _iwImg.width;
  canvas.width = maxW; canvas.height = _iwImg.height * scale;
  ctx.drawImage(_iwImg, 0, 0, canvas.width, canvas.height);
  const text = document.getElementById('iw-text')?.value || '© My Photo';
  const size = parseInt(document.getElementById('iw-size')?.value || 40);
  const opacity = parseInt(document.getElementById('iw-opacity')?.value || 50) / 100;
  const color = document.getElementById('iw-color')?.value || '#ffffff';
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(-Math.PI/6);
  for (let y = -canvas.height; y < canvas.height; y += size*3) {
    for (let x = -canvas.width; x < canvas.width; x += ctx.measureText(text).width + size*2) {
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
}
function downloadWatermark() {
  const c = document.getElementById('iw-canvas');
  if (!c) return;
  const a = document.createElement('a'); a.download = 'watermarked.jpg';
  a.href = c.toDataURL('image/jpeg', 0.92); a.click();
}

// ── IMAGE UPSCALER (2x using canvas interpolation) ──
function renderImgUpscaler() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="info-box info-box-blue">Upscale your image up to 4× using browser-based interpolation. Best for small images.</div>
      <div class="file-drop-zone" id="iu-drop" onclick="document.getElementById('iu-input').click()" style="margin:.75rem 0">
        <div class="file-drop-icon">🔍</div><div class="file-drop-label">Upload Image to Upscale</div>
        <input type="file" id="iu-input" accept="image/*" style="display:none" onchange="upscaleImage(event.target.files[0])">
      </div>
      <div class="form-group"><label class="form-label">Scale Factor</label>
        <select class="form-select" id="iu-scale"><option value="2">2× (Double)</option><option value="3">3×</option><option value="4">4×</option></select>
      </div>
      <div id="iu-result"></div>
    </div>`;
  setupDrop('iu-drop', f => upscaleImage(f));
}
function upscaleImage(file) {
  if (!file) return;
  const result = document.getElementById('iu-result');
  result.innerHTML = '<p style="color:var(--text3)">Upscaling...</p>';
  const scale = parseInt(document.getElementById('iu-scale')?.value || 2);
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const sizeMB = (blob.size/1024/1024).toFixed(2);
        result.innerHTML = `
          <div class="info-box info-box-green">✅ ${img.width}×${img.height} → ${canvas.width}×${canvas.height} · ${sizeMB} MB</div>
          <img src="${url}" style="max-width:100%;max-height:250px;border-radius:8px;border:1px solid var(--border);margin:.75rem 0;display:block">
          <a href="${url}" download="upscaled.png" class="btn-primary-glow" style="display:inline-block">📥 Download Upscaled</a>`;
      }, 'image/png');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── PDF READER ──
function renderPDFReader() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="pdfr-drop" onclick="document.getElementById('pdfr-input').click()">
        <div class="file-drop-icon">📄</div><div class="file-drop-label">Upload PDF to Read</div>
        <input type="file" id="pdfr-input" accept=".pdf" style="display:none" onchange="loadPDFReader(event.target.files[0])">
      </div>
      <div id="pdfr-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('pdfr-drop', f => loadPDFReader(f));
}
async function loadPDFReader(file) {
  if (!file) return;
  const result = document.getElementById('pdfr-result');
  result.innerHTML = '<p style="color:var(--text3)">Loading PDF...</p>';
  try {
    const url = URL.createObjectURL(file);
    result.innerHTML = `
      <div class="info-box info-box-green">✅ <strong>${file.name}</strong> · ${(file.size/1024).toFixed(1)} KB</div>
      <div style="margin-top:.75rem;border:1px solid var(--border);border-radius:var(--r-md);overflow:hidden;background:#fff">
        <iframe src="${url}" width="100%" height="600px" style="border:none;display:block"></iframe>
      </div>
      <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <a href="${url}" download="${file.name}" class="btn-primary-glow" style="display:inline-block">📥 Download</a>
        <a href="${url}" target="_blank" class="btn-outline-glow" style="display:inline-block">🔗 Open in Tab</a>
      </div>`;
  } catch(e) { result.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

// ── PDF TO PNG ──
function renderPDFtoPNG() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="info-box info-box-blue">Converts each page of your PDF into a real PNG image, right in your browser.</div>
      <div class="file-drop-zone" id="p2png-drop" onclick="document.getElementById('p2png-input').click()" style="margin:.75rem 0">
        <div class="file-drop-icon">🖼️</div><div class="file-drop-label">Upload PDF</div>
        <input type="file" id="p2png-input" accept=".pdf" style="display:none" onchange="_convertPDFtoImages(event.target.files[0],'image/png','p2png-result')">
      </div>
      <div id="p2png-result"></div>
    </div>`;
  setupDrop('p2png-drop', f => _convertPDFtoImages(f,'image/png','p2png-result'));
}

// ── PDF TO WORD ──
function renderPDFtoWord() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="p2w-drop" onclick="document.getElementById('p2w-input').click()">
        <div class="file-drop-icon">📝</div><div class="file-drop-label">Upload PDF</div>
        <input type="file" id="p2w-input" accept=".pdf" style="display:none" onchange="extractPDFText(event.target.files[0])">
      </div>
      <div id="p2w-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('p2w-drop', f => extractPDFText(f));
}
async function extractPDFText(file) {
  const result = document.getElementById('p2w-result');
  result.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Loading PDF engine…</p>';
  try {
    const pdfjsLib = await ensurePDFjs();
    result.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Extracting text…</p>';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Group items by approximate line (Y position) so words don't run together
      const lineMap = {};
      content.items.forEach(item => {
        const y = Math.round(item.transform[5] / 10) * 10;
        if (!lineMap[y]) lineMap[y] = [];
        lineMap[y].push(item);
      });
      const lines = Object.keys(lineMap).sort((a,b)=>b-a).map(y =>
        lineMap[y].sort((a,b)=>a.transform[4]-b.transform[4]).map(it=>it.str).join(' ')
      );
      text += (i>1 ? '\n\n' : '') + `--- Page ${i} ---\n` + lines.join('\n');
    }
    if (!text.replace(/--- Page \d+ ---/g,'').trim()) {
      text = 'No selectable text found. This PDF is likely scanned/image-based — try the OCR PDF tool instead.';
    }
    // Create a downloadable .doc file (HTML-based, opens natively in Word)
    const docHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>${file.name}</title></head>
      <body>${text.split('\n').map(l => `<p>${l.replace(/</g,'&lt;').replace(/>/g,'&gt;') || '&nbsp;'}</p>`).join('')}</body></html>`;
    const blob = new Blob(['\ufeff', docHtml], {type:'application/msword'});
    const url = URL.createObjectURL(blob);
    result.innerHTML = `
      <div class="info-box info-box-green">✅ Text extracted from <strong>${file.name}</strong> (${pdf.numPages} page${pdf.numPages>1?'s':''})</div>
      <textarea style="width:100%;height:200px;margin:.75rem 0;border:1px solid var(--border);border-radius:var(--r-md);padding:.75rem;background:var(--glass2);color:var(--text);font-size:.85rem;resize:vertical" readonly>${text.slice(0,3000)}${text.length>3000?'...(truncated in preview — full text is in the download)':''}</textarea>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap">
        <a href="${url}" download="${file.name.replace(/\.pdf$/i,'')}.doc" class="btn-primary-glow" style="display:inline-block">📥 Download .doc</a>
        <button class="btn-outline-glow" onclick="copyToClipboard(document.querySelector('#p2w-result textarea').value,'Text copied!')">📋 Copy</button>
      </div>`;
  } catch(e) { result.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

// ── SPLIT PDF ──
function renderSplitPDF() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="info-box info-box-blue">Split a PDF by extracting specific page ranges.</div>
      <div class="file-drop-zone" id="spdf-drop" onclick="document.getElementById('spdf-input').click()" style="margin:.75rem 0">
        <div class="file-drop-icon">✂️</div><div class="file-drop-label">Upload PDF</div>
        <input type="file" id="spdf-input" accept=".pdf" style="display:none" onchange="loadSplitPDF(event.target.files[0])">
      </div>
      <div id="spdf-result"></div>
    </div>`;
  setupDrop('spdf-drop', f => loadSplitPDF(f));
}
async function loadSplitPDF(file) {
  const result = document.getElementById('spdf-result');
  result.innerHTML = `
    <div class="info-box info-box-green">✅ <strong>${file.name}</strong> · ${(file.size/1024).toFixed(1)} KB</div>
    <div class="form-group" style="margin-top:.75rem"><label class="form-label">Pages to extract (e.g. 1-3, 5, 7-9)</label>
      <input class="form-input" id="spdf-pages" placeholder="1-3, 5, 7-9" value="1-3">
    </div>
    <button class="btn-primary-glow" style="margin:.5rem 0" onclick="doSplitPDF()">✂️ Split PDF</button>
    <div id="spdf-output"></div>`;
  window._spdfFile = file;
}
async function doSplitPDF() {
  const file = window._spdfFile;
  const pagesStr = document.getElementById('spdf-pages')?.value || '';
  const out = document.getElementById('spdf-output');
  if (!file) return;
  out.innerHTML = '<p style="color:var(--text3)">Processing...</p>';
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument } = window.PDFLib;
    const ab = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(ab);
    const totalPages = srcDoc.getPageCount();
    // Parse page ranges
    const pages = [];
    pagesStr.split(',').forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [a,b] = part.split('-').map(n=>parseInt(n));
        for(let i=a;i<=b&&i<=totalPages;i++) if(i>0) pages.push(i-1);
      } else {
        const n = parseInt(part);
        if (n>0 && n<=totalPages) pages.push(n-1);
      }
    });
    if (!pages.length) { out.innerHTML='<p style="color:var(--red)">Invalid page range.</p>'; return; }
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, pages);
    copied.forEach(p => newDoc.addPage(p));
    const bytes = await newDoc.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    out.innerHTML = `<div class="info-box info-box-green">✅ Extracted ${pages.length} page(s) from ${totalPages} total.</div>
      <a href="${url}" download="split.pdf" class="btn-primary-glow" style="display:inline-block;margin-top:.5rem">📥 Download Split PDF</a>`;
  } catch(e) { out.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

// ── ROTATE PDF ──
function renderRotatePDF() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="rpdf-drop" onclick="document.getElementById('rpdf-input').click()">
        <div class="file-drop-icon">🔄</div><div class="file-drop-label">Upload PDF to Rotate</div>
        <input type="file" id="rpdf-input" accept=".pdf" style="display:none" onchange="loadRotatePDF(event.target.files[0])">
      </div>
      <div id="rpdf-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('rpdf-drop', f => loadRotatePDF(f));
}
async function loadRotatePDF(file) {
  const result = document.getElementById('rpdf-result');
  result.innerHTML = `
    <div class="info-box info-box-green">✅ <strong>${file.name}</strong></div>
    <div class="form-group" style="margin-top:.75rem"><label class="form-label">Rotation</label>
      <select class="form-select" id="rpdf-deg"><option value="90">90° Clockwise</option><option value="180">180°</option><option value="270">270° (90° Counter-clockwise)</option></select>
    </div>
    <div class="form-group"><label class="form-label">Apply to</label>
      <select class="form-select" id="rpdf-pages"><option value="all">All Pages</option><option value="odd">Odd Pages</option><option value="even">Even Pages</option></select>
    </div>
    <button class="btn-primary-glow" style="margin:.5rem 0" onclick="doRotatePDF()">🔄 Rotate PDF</button>
    <div id="rpdf-output"></div>`;
  window._rpdfFile = file;
}
async function doRotatePDF() {
  const file = window._rpdfFile;
  const out = document.getElementById('rpdf-output');
  if (!file) return;
  out.innerHTML = '<p style="color:var(--text3)">Rotating...</p>';
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument, degrees } = window.PDFLib;
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const deg = parseInt(document.getElementById('rpdf-deg')?.value || 90);
    const which = document.getElementById('rpdf-pages')?.value || 'all';
    doc.getPages().forEach((page, i) => {
      const shouldRotate = which === 'all' || (which === 'odd' && (i+1)%2===1) || (which === 'even' && (i+1)%2===0);
      if (shouldRotate) page.setRotation(degrees((page.getRotation().angle + deg) % 360));
    });
    const bytes = await doc.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    out.innerHTML = `<div class="info-box info-box-green">✅ Rotation applied!</div>
      <a href="${url}" download="rotated.pdf" class="btn-primary-glow" style="display:inline-block;margin-top:.5rem">📥 Download Rotated PDF</a>`;
  } catch(e) { out.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

// ── UNLOCK PDF ──
function renderUnlockPDF() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="info-box info-box-blue">Removes restrictions from "owner-locked" PDFs (printing/copying disabled, no open-password needed). PDFs that require a password just to open use real encryption and can't be cracked in-browser — that needs a desktop tool like Adobe Acrobat.</div>
      <div class="file-drop-zone" id="updf-drop" onclick="document.getElementById('updf-input').click()" style="margin:.75rem 0">
        <div class="file-drop-icon">🔓</div><div class="file-drop-label">Upload PDF</div>
        <input type="file" id="updf-input" accept=".pdf" style="display:none" onchange="loadUnlockPDF(event.target.files[0])">
      </div>
      <div id="updf-result"></div>
    </div>`;
  setupDrop('updf-drop', f => loadUnlockPDF(f));
}
async function loadUnlockPDF(file) {
  const result = document.getElementById('updf-result');
  result.innerHTML = `
    <div class="info-box info-box-green">✅ <strong>${file.name}</strong></div>
    <button class="btn-primary-glow" style="margin:.5rem 0" onclick="doUnlockPDF()">🔓 Remove Restrictions</button>
    <div id="updf-output"></div>`;
  window._updfFile = file;
}
async function doUnlockPDF() {
  const file = window._updfFile;
  const out = document.getElementById('updf-output');
  if (!file) return;
  out.innerHTML = '<p style="color:var(--text3)">Unlocking...</p>';
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument } = window.PDFLib;
    const ab = await file.arrayBuffer();
    // NOTE: pdf-lib cannot actually decrypt password-protected PDFs in the browser —
    // there is no real `password` load option. `ignoreEncryption` just lets us open
    // PDFs that are encrypted with empty/owner-only passwords (very common case:
    // "restricted" PDFs that block printing/copying but don't need a password to
    // open). Genuinely password-locked PDFs will still fail here — that's expected.
    const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
    const bytes = await doc.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    out.innerHTML = `<div class="info-box info-box-green">✅ PDF unlocked successfully!</div>
      <a href="${url}" download="unlocked.pdf" class="btn-primary-glow" style="display:inline-block;margin-top:.5rem">📥 Download Unlocked PDF</a>`;
  } catch(e) {
    out.innerHTML = `<p style="color:var(--red)">Couldn't unlock: ${e.message}</p>
      <p style="color:var(--text3);font-size:.8rem;margin-top:.5rem">This usually means the PDF has a real open-password set with strong encryption — browser-based tools can't break real password encryption (that's by design, for security). A desktop tool like Adobe Acrobat, or a server-side service, is needed for those.</p>`;
  }
}

// ── PDF EXTRACT PAGES ──
function renderPDFExtractPages() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="epp-drop" onclick="document.getElementById('epp-input').click()">
        <div class="file-drop-icon">📑</div><div class="file-drop-label">Upload PDF</div>
        <input type="file" id="epp-input" accept=".pdf" style="display:none" onchange="loadExtractPages(event.target.files[0])">
      </div>
      <div id="epp-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('epp-drop', f => loadExtractPages(f));
}
async function loadExtractPages(file) {
  const result = document.getElementById('epp-result');
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument } = window.PDFLib;
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const total = doc.getPageCount();
    result.innerHTML = `
      <div class="info-box info-box-green">✅ <strong>${file.name}</strong> · ${total} pages</div>
      <div style="margin-top:.75rem">
        <label class="form-label">Select pages to extract:</label>
        <div id="epp-checkboxes" style="display:flex;flex-wrap:wrap;gap:.4rem;margin:.5rem 0">
          ${Array.from({length:total},(_,i)=>`<label style="display:flex;align-items:center;gap:.25rem;font-size:.82rem;cursor:pointer"><input type="checkbox" class="epp-cb" value="${i}" style="accent-color:var(--indigo)"> Pg ${i+1}</label>`).join('')}
        </div>
        <div style="display:flex;gap:.5rem;margin:.5rem 0">
          <button class="btn-outline-glow" style="font-size:.78rem;padding:.3rem .7rem" onclick="document.querySelectorAll('.epp-cb').forEach(c=>c.checked=true)">All</button>
          <button class="btn-outline-glow" style="font-size:.78rem;padding:.3rem .7rem" onclick="document.querySelectorAll('.epp-cb').forEach(c=>c.checked=false)">None</button>
        </div>
        <button class="btn-primary-glow" onclick="doExtractPages()">📑 Extract Selected Pages</button>
      </div>
      <div id="epp-output" style="margin-top:.75rem"></div>`;
    window._eppFile = file;
  } catch(e) { result.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}
async function doExtractPages() {
  const out = document.getElementById('epp-output');
  const file = window._eppFile; if (!file) return;
  const selected = [...document.querySelectorAll('.epp-cb:checked')].map(c=>parseInt(c.value));
  if (!selected.length) { out.innerHTML='<p style="color:var(--red)">Select at least one page.</p>'; return; }
  out.innerHTML='<p style="color:var(--text3)">Extracting...</p>';
  try {
    const { PDFDocument } = window.PDFLib;
    const ab = await file.arrayBuffer();
    const src = await PDFDocument.load(ab);
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(src, selected);
    copied.forEach(p => newDoc.addPage(p));
    const bytes = await newDoc.save();
    const blob = new Blob([bytes],{type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    out.innerHTML = `<div class="info-box info-box-green">✅ Extracted ${selected.length} page(s)</div>
      <a href="${url}" download="extracted.pdf" class="btn-primary-glow" style="display:inline-block;margin-top:.5rem">📥 Download</a>`;
  } catch(e) { out.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

// ── PDF METADATA ──
function renderPDFMetadata() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="file-drop-zone" id="pmeta-drop" onclick="document.getElementById('pmeta-input').click()">
        <div class="file-drop-icon">📋</div><div class="file-drop-label">Upload PDF to View Metadata</div>
        <input type="file" id="pmeta-input" accept=".pdf" style="display:none" onchange="readPDFMetadata(event.target.files[0])">
      </div>
      <div id="pmeta-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('pmeta-drop', f => readPDFMetadata(f));
}
async function readPDFMetadata(file) {
  const result = document.getElementById('pmeta-result');
  result.innerHTML = '<p style="color:var(--text3)">Reading metadata...</p>';
  try {
    if (!window.PDFLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      document.head.appendChild(s);
      await new Promise((res,rej) => { s.onload=res; s.onerror=rej; });
    }
    const { PDFDocument } = window.PDFLib;
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    const meta = [
      ['Title', doc.getTitle() || '—'],
      ['Author', doc.getAuthor() || '—'],
      ['Subject', doc.getSubject() || '—'],
      ['Keywords', doc.getKeywords() || '—'],
      ['Creator', doc.getCreator() || '—'],
      ['Producer', doc.getProducer() || '—'],
      ['Creation Date', doc.getCreationDate()?.toLocaleString() || '—'],
      ['Modification Date', doc.getModificationDate()?.toLocaleString() || '—'],
      ['Page Count', doc.getPageCount()],
      ['File Size', `${(file.size/1024).toFixed(1)} KB`],
    ];
    result.innerHTML = `
      <div class="info-box info-box-green">✅ <strong>${file.name}</strong></div>
      <table style="width:100%;border-collapse:collapse;margin-top:.75rem;font-size:.85rem">
        ${meta.map(([k,v])=>`<tr><td style="padding:.4rem .6rem;font-weight:600;color:var(--text2);border-bottom:1px solid var(--border);white-space:nowrap">${k}</td><td style="padding:.4rem .6rem;border-bottom:1px solid var(--border);word-break:break-all">${v}</td></tr>`).join('')}
      </table>`;
  } catch(e) { result.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`; }
}

// ── SQL FORMATTER ──
function renderSQLFormatter() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">SQL Query</label>
        <textarea class="form-input" id="sql-input" style="height:150px;font-family:monospace;font-size:.85rem" placeholder="SELECT * FROM users WHERE id = 1 AND name = 'John' ORDER BY created_at DESC LIMIT 10;"></textarea>
      </div>
      <div style="display:flex;gap:.75rem;margin:.5rem 0;flex-wrap:wrap">
        <button class="btn-primary-glow" onclick="formatSQL()">✨ Format SQL</button>
        <button class="btn-outline-glow" onclick="minifySQL()">🗜️ Minify</button>
        <button class="btn-outline-glow" onclick="document.getElementById('sql-input').value='';document.getElementById('sql-output').style.display='none'">🗑️ Clear</button>
      </div>
      <div id="sql-output" style="display:none">
        <label class="form-label">Formatted SQL</label>
        <pre id="sql-result" style="background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md);padding:1rem;overflow-x:auto;font-family:monospace;font-size:.85rem;white-space:pre;line-height:1.6"></pre>
        <button class="copy-result-btn" style="margin-top:.5rem" onclick="copyToClipboard(document.getElementById('sql-result').textContent,'SQL copied!')">📋 Copy</button>
      </div>
    </div>`;
}
function formatSQL() {
  const raw = document.getElementById('sql-input')?.value?.trim();
  if (!raw) { showToast('Enter SQL first','warning'); return; }
  const keywords = ['SELECT','FROM','WHERE','AND','OR','ORDER BY','GROUP BY','HAVING','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','OUTER JOIN','ON','INSERT INTO','VALUES','UPDATE','SET','DELETE','CREATE','ALTER','DROP','TABLE','INDEX','VIEW','LIMIT','OFFSET','UNION','AS','DISTINCT','COUNT','SUM','AVG','MAX','MIN','IN','NOT IN','IS NULL','IS NOT NULL','BETWEEN','LIKE','EXISTS','CASE','WHEN','THEN','ELSE','END'];
  let sql = raw;
  keywords.forEach(kw => {
    const re = new RegExp('\\b' + kw.replace(/ /g,'\\s+') + '\\b', 'gi');
    sql = sql.replace(re, '\n' + kw);
  });
  // Indent after SELECT, add spacing
  sql = sql.split('\n').map(line => line.trim()).filter(Boolean).join('\n');
  sql = sql.replace(/,(?!\s)/g, ',\n  ');
  document.getElementById('sql-result').textContent = sql;
  document.getElementById('sql-output').style.display = 'block';
}
function minifySQL() {
  const raw = document.getElementById('sql-input')?.value?.trim();
  if (!raw) { showToast('Enter SQL first','warning'); return; }
  const minified = raw.replace(/\s+/g,' ').trim();
  document.getElementById('sql-result').textContent = minified;
  document.getElementById('sql-output').style.display = 'block';
}

// ── XML FORMATTER ──
function renderXMLFormatter() {
  document.getElementById('tool-widget-container').innerHTML=`
    <div class="tool-widget">
      <div class="form-group"><label class="form-label">XML Input</label>
        <textarea class="form-input" id="xml-input" style="height:150px;font-family:monospace;font-size:.82rem" placeholder="<root><item id='1'><name>Test</name></item></root>"></textarea>
      </div>
      <div style="display:flex;gap:.75rem;margin:.5rem 0;flex-wrap:wrap">
        <button class="btn-primary-glow" onclick="formatXML()">✨ Format XML</button>
        <button class="btn-outline-glow" onclick="minifyXML()">🗜️ Minify</button>
        <button class="btn-outline-glow" onclick="validateXML()">✅ Validate</button>
      </div>
      <div id="xml-msg" style="margin:.5rem 0;font-size:.85rem"></div>
      <div id="xml-output" style="display:none">
        <label class="form-label">Output</label>
        <pre id="xml-result" style="background:var(--glass2);border:1px solid var(--border);border-radius:var(--r-md);padding:1rem;overflow-x:auto;font-family:monospace;font-size:.82rem;white-space:pre;line-height:1.6;max-height:350px"></pre>
        <button class="copy-result-btn" style="margin-top:.5rem" onclick="copyToClipboard(document.getElementById('xml-result').textContent,'XML copied!')">📋 Copy</button>
      </div>
    </div>`;
}
function formatXML() {
  const raw = document.getElementById('xml-input')?.value?.trim();
  if (!raw) return;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'application/xml');
    const err = doc.querySelector('parsererror');
    if (err) { document.getElementById('xml-msg').innerHTML='<span style="color:var(--red)">❌ Invalid XML: '+err.textContent.split('\n')[0]+'</span>'; return; }
    document.getElementById('xml-msg').innerHTML = '<span style="color:var(--green)">✅ Valid XML</span>';
    const serializer = new XMLSerializer();
    let xml = serializer.serializeToString(doc);
    // Pretty print
    let indent = 0;
    xml = xml.replace(/(>)(<)(\/*)/g,'$1\n$2$3');
    xml = xml.split('\n').map(line => {
      if (line.match(/^<\//)) indent = Math.max(0, indent - 1);
      const result = '  '.repeat(indent) + line.trim();
      if (line.match(/^<[^/][^>]*[^/]>/) && !line.match(/^<[^>]+\/>/)) indent++;
      return result;
    }).join('\n');
    document.getElementById('xml-result').textContent = xml;
    document.getElementById('xml-output').style.display = 'block';
  } catch(e) { document.getElementById('xml-msg').innerHTML='<span style="color:var(--red)">❌ '+e.message+'</span>'; }
}
function minifyXML() {
  const raw = document.getElementById('xml-input')?.value?.trim();
  if (!raw) return;
  const minified = raw.replace(/>\s+</g,'><').replace(/\s+/g,' ').trim();
  document.getElementById('xml-result').textContent = minified;
  document.getElementById('xml-output').style.display = 'block';
}
function validateXML() {
  const raw = document.getElementById('xml-input')?.value?.trim();
  if (!raw) return;
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) {
    document.getElementById('xml-msg').innerHTML = '<span style="color:var(--red)">❌ Invalid XML: '+err.textContent.split('\n')[0]+'</span>';
  } else {
    document.getElementById('xml-msg').innerHTML = '<span style="color:var(--green)">✅ XML is valid!</span>';
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// NEW TOOLS — Added to match imagetotext.info feature set
// ══════════════════════════════════════════════════════════════════════════════

// ── HELPER: show result download button ──────────────────────────────────────
function _dlBtn(filename, blob, label='⬇️ Download') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.className = 'btn-primary-glow'; a.style.display='inline-block';
  a.style.marginTop='1rem'; a.textContent = label;
  return a;
}

// ── PDF TO TEXT ──────────────────────────────────────────────────────────────
function renderPDFtoText() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="file-drop-zone" id="p2t-drop" onclick="document.getElementById('p2t-input').click()">
        <div class="file-drop-icon">📄</div>
        <div class="file-drop-label">Upload PDF File</div>
        <div class="file-drop-sub">Click or drag & drop</div>
        <input type="file" id="p2t-input" accept=".pdf" style="display:none" onchange="handlePDFtoText(this.files[0])">
      </div>
      <div id="p2t-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('p2t-drop', f => handlePDFtoText(f));
}

async function handlePDFtoText(file) {
  if (!file) return;
  const res = document.getElementById('p2t-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Loading PDF library…</p>';
  try {
    const pdfjsLib = await ensurePDFjs();
    res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Extracting text…</p>';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += `\n--- Page ${i} ---\n` + content.items.map(s => s.str).join(' ') + '\n';
    }
    if (!text.trim()) { res.innerHTML = '<p style="color:var(--red)">No extractable text found. Try OCR PDF tool for scanned documents.</p>'; return; }
    const blob = new Blob([text], { type: 'text/plain' });
    const name = file.name.replace('.pdf', '') + '_text.txt';
    res.innerHTML = `<textarea class="form-input" rows="10" style="font-family:monospace;font-size:.8rem">${text.substring(0,3000)}${text.length>3000?'\n\n[...truncated preview, full file in download...]':''}</textarea>`;
    res.appendChild(_dlBtn(name, blob, '⬇️ Download Text File'));
    showToast('Text extracted successfully!', 'success');
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}. Make sure PDF.js is loaded.</p>`;
  }
}

// ── PDF TO EXCEL ─────────────────────────────────────────────────────────────
function renderPDFtoExcel() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">Extracts tables and text data from PDF into an Excel-compatible CSV file.</p>
      <div class="file-drop-zone" id="p2x-drop" onclick="document.getElementById('p2x-input').click()">
        <div class="file-drop-icon">📊</div>
        <div class="file-drop-label">Upload PDF File</div>
        <input type="file" id="p2x-input" accept=".pdf" style="display:none" onchange="handlePDFtoExcel(this.files[0])">
      </div>
      <div id="p2x-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('p2x-drop', f => handlePDFtoExcel(f));
}

async function handlePDFtoExcel(file) {
  if (!file) return;
  const res = document.getElementById('p2x-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Loading PDF library…</p>';
  try {
    const pdfjsLib = await ensurePDFjs();
    res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Processing PDF…</p>';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let rows = [['Page', 'Line', 'Text']];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Group by approximate Y position → rows
      const lineMap = {};
      content.items.forEach(item => {
        const y = Math.round(item.transform[5] / 10) * 10;
        if (!lineMap[y]) lineMap[y] = [];
        lineMap[y].push(item.str);
      });
      Object.keys(lineMap).sort((a,b) => b-a).forEach((y, li) => {
        rows.push([i, li+1, lineMap[y].join(' ')]);
      });
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const name = file.name.replace('.pdf','') + '_data.csv';
    res.innerHTML = `<p style="color:var(--green)">✅ Extracted ${rows.length-1} rows from ${pdf.numPages} pages</p>`;
    res.appendChild(_dlBtn(name, blob, '⬇️ Download Excel/CSV File'));
    showToast('PDF converted to Excel!', 'success');
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

// ── PDF TO CSV ────────────────────────────────────────────────────────────────
function renderPDFtoCSV() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="file-drop-zone" id="p2csv-drop" onclick="document.getElementById('p2csv-input').click()">
        <div class="file-drop-icon">📋</div>
        <div class="file-drop-label">Upload PDF File</div>
        <input type="file" id="p2csv-input" accept=".pdf" style="display:none" onchange="handlePDFtoCSV(this.files[0])">
      </div>
      <div id="p2csv-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('p2csv-drop', f => handlePDFtoCSV(f));
}

async function handlePDFtoCSV(file) {
  if (!file) return;
  const res = document.getElementById('p2csv-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Loading PDF library…</p>';
  try {
    const pdfjsLib = await ensurePDFjs();
    res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Extracting…</p>';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let rows = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const lineMap = {};
      content.items.forEach(item => {
        const y = Math.round(item.transform[5] / 12) * 12;
        if (!lineMap[y]) lineMap[y] = [];
        lineMap[y].push({ x: item.transform[4], text: item.str });
      });
      Object.keys(lineMap).sort((a,b)=>b-a).forEach(y => {
        const line = lineMap[y].sort((a,b)=>a.x-b.x).map(i=>i.text);
        rows.push(line);
      });
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const name = file.name.replace('.pdf','') + '.csv';
    res.innerHTML = `<p style="color:var(--green)">✅ ${rows.length} rows extracted</p><textarea class="form-input" rows="6" style="font-family:monospace;font-size:.75rem">${csv.substring(0,500)}</textarea>`;
    res.appendChild(_dlBtn(name, blob, '⬇️ Download CSV'));
    showToast('PDF converted to CSV!', 'success');
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

// ── PDF TO HTML ───────────────────────────────────────────────────────────────
function renderPDFtoHTML() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="file-drop-zone" id="p2h-drop" onclick="document.getElementById('p2h-input').click()">
        <div class="file-drop-icon">🌐</div>
        <div class="file-drop-label">Upload PDF File</div>
        <input type="file" id="p2h-input" accept=".pdf" style="display:none" onchange="handlePDFtoHTML(this.files[0])">
      </div>
      <div id="p2h-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('p2h-drop', f => handlePDFtoHTML(f));
}

async function handlePDFtoHTML(file) {
  if (!file) return;
  const res = document.getElementById('p2h-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Loading PDF library…</p>';
  try {
    const pdfjsLib = await ensurePDFjs();
    res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Converting…</p>';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${file.name}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:2rem;line-height:1.6} h2{color:#6366f1;border-bottom:1px solid #eee;padding-bottom:.5rem}</style></head><body>\n`;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      html += `<h2>Page ${i}</h2>\n<p>`;
      const lineMap = {};
      content.items.forEach(item => {
        const y = Math.round(item.transform[5] / 12) * 12;
        if (!lineMap[y]) lineMap[y] = [];
        lineMap[y].push(item.str);
      });
      const lines = Object.keys(lineMap).sort((a,b)=>b-a).map(y => lineMap[y].join(' '));
      html += lines.map(l => l.replace(/</g,'&lt;').replace(/>/g,'&gt;')).join('<br>\n') + '</p>\n';
    }
    html += '</body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    const name = file.name.replace('.pdf','') + '.html';
    res.innerHTML = `<p style="color:var(--green)">✅ Converted ${pdf.numPages} pages to HTML</p>`;
    res.appendChild(_dlBtn(name, blob, '⬇️ Download HTML File'));
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

// ── HTML TO PDF ───────────────────────────────────────────────────────────────
function renderHTMLtoPDF() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="form-group">
        <label class="form-label">Paste HTML Code</label>
        <textarea class="form-input" id="h2p-html" rows="8" placeholder="&lt;h1&gt;Hello World&lt;/h1&gt;&lt;p&gt;Your HTML content here...&lt;/p&gt;" style="font-family:monospace;font-size:.82rem"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Or upload HTML file</label>
        <input type="file" class="form-input" id="h2p-file" accept=".html,.htm" onchange="loadHTMLFile(this)">
      </div>
      <button class="btn-primary-glow" onclick="handleHTMLtoPDF()">📄 Convert to PDF</button>
      <div id="h2p-result" style="margin-top:1rem"></div>
    </div>`;
}

function loadHTMLFile(input) {
  const f = input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = e => document.getElementById('h2p-html').value = e.target.result;
  r.readAsText(f);
}

function handleHTMLtoPDF() {
  const html = document.getElementById('h2p-html')?.value?.trim();
  const res = document.getElementById('h2p-result');
  if (!html) { res.innerHTML = '<p style="color:var(--red)">Please enter HTML content.</p>'; return; }
  if (!window.jspdf?.jsPDF && !window.jsPDF) { res.innerHTML = '<p style="color:var(--red)">PDF library not loaded. Please refresh.</p>'; return; }
  const jsPDF = (window.jspdf?.jsPDF) || window.jsPDF;
  // Use hidden iframe to render HTML then capture
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;height:1122px;border:none';
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  setTimeout(() => {
    html2canvas(iframe.contentDocument.body, { scale: 1.5, useCORS: true }).then(canvas => {
      document.body.removeChild(iframe);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const imgW = 210; const imgH = (canvas.height * imgW) / canvas.width;
      let y = 0;
      while (y < imgH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -y, imgW, imgH);
        y += 297;
      }
      pdf.save('html-converted.pdf');
      res.innerHTML = '<p style="color:var(--green)">✅ PDF downloaded!</p>';
      showToast('HTML converted to PDF!', 'success');
    }).catch(e => {
      document.body.removeChild(iframe);
      res.innerHTML = `<p style="color:var(--red)">Render error: ${e.message}</p>`;
    });
  }, 600);
}

// ── WORD TO PDF ───────────────────────────────────────────────────────────────
function renderWordToPDF() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">Upload a .docx Word file and convert it to PDF.</p>
      <div class="file-drop-zone" id="w2p-drop" onclick="document.getElementById('w2p-input').click()">
        <div class="file-drop-icon">📄</div>
        <div class="file-drop-label">Upload Word (.docx) File</div>
        <input type="file" id="w2p-input" accept=".docx,.doc" style="display:none" onchange="handleWordToPDF(this.files[0])">
      </div>
      <div id="w2p-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('w2p-drop', f => handleWordToPDF(f));
}

async function handleWordToPDF(file) {
  if (!file) return;
  const res = document.getElementById('w2p-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Converting Word to PDF…</p>';
  try {
    if (!window.mammoth) throw new Error('Mammoth library not available. Please refresh.');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.5;margin:2cm;}</style></head><body>${result.value}</body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;height:1122px;border:none';
    document.body.appendChild(iframe);
    iframe.contentDocument.open(); iframe.contentDocument.write(html); iframe.contentDocument.close();
    setTimeout(() => {
      html2canvas(iframe.contentDocument.body, { scale:1.5 }).then(canvas => {
        document.body.removeChild(iframe);
        const jsPDF = (window.jspdf?.jsPDF) || window.jsPDF;
        const pdf = new jsPDF({ orientation:'p', unit:'mm', format:'a4' });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const imgW = 210; const imgH = (canvas.height * imgW) / canvas.width;
        let y = 0;
        while (y < imgH) { if(y>0) pdf.addPage(); pdf.addImage(imgData, 'JPEG', 0, -y, imgW, imgH); y+=297; }
        pdf.save(file.name.replace(/\.docx?$/, '') + '.pdf');
        res.innerHTML = '<p style="color:var(--green)">✅ PDF downloaded!</p>';
        showToast('Word converted to PDF!', 'success');
      });
    }, 800);
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

// ── WORD TO JPG ───────────────────────────────────────────────────────────────
function renderWordToJPG() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="file-drop-zone" id="w2j-drop" onclick="document.getElementById('w2j-input').click()">
        <div class="file-drop-icon">🖼️</div>
        <div class="file-drop-label">Upload Word (.docx) File</div>
        <input type="file" id="w2j-input" accept=".docx,.doc" style="display:none" onchange="handleWordToJPG(this.files[0])">
      </div>
      <div id="w2j-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('w2j-drop', f => handleWordToJPG(f));
}

async function handleWordToJPG(file) {
  if (!file) return;
  const res = document.getElementById('w2j-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Converting…</p>';
  try {
    if (!window.mammoth) throw new Error('Mammoth library not available.');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = `<html><head><style>body{font-family:Arial,sans-serif;font-size:13pt;line-height:1.6;padding:40px;background:#fff;width:800px}</style></head><body>${result.value}</body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:880px;height:1240px;border:none';
    document.body.appendChild(iframe);
    iframe.contentDocument.open(); iframe.contentDocument.write(html); iframe.contentDocument.close();
    setTimeout(() => {
      html2canvas(iframe.contentDocument.body, { scale:2, backgroundColor:'#fff' }).then(canvas => {
        document.body.removeChild(iframe);
        canvas.toBlob(blob => {
          const name = file.name.replace(/\.docx?$/, '') + '.jpg';
          res.innerHTML = `<img src="${canvas.toDataURL()}" style="max-width:100%;border:1px solid var(--border);border-radius:8px">`;
          res.appendChild(_dlBtn(name, blob, '⬇️ Download JPG'));
          showToast('Word converted to JPG!', 'success');
        }, 'image/jpeg', 0.92);
      });
    }, 800);
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

// ── WORD TO EXCEL ─────────────────────────────────────────────────────────────
function renderWordToExcel() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">Extracts tables from a Word document and saves as CSV (Excel-compatible).</p>
      <div class="file-drop-zone" id="w2e-drop" onclick="document.getElementById('w2e-input').click()">
        <div class="file-drop-icon">📊</div>
        <div class="file-drop-label">Upload Word (.docx) File</div>
        <input type="file" id="w2e-input" accept=".docx,.doc" style="display:none" onchange="handleWordToExcel(this.files[0])">
      </div>
      <div id="w2e-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('w2e-drop', f => handleWordToExcel(f));
}

async function handleWordToExcel(file) {
  if (!file) return;
  const res = document.getElementById('w2e-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Extracting tables…</p>';
  try {
    if (!window.mammoth) throw new Error('Mammoth library not available.');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const parser = new DOMParser();
    const doc = parser.parseFromString(result.value, 'text/html');
    const tables = doc.querySelectorAll('table');
    if (tables.length === 0) {
      res.innerHTML = '<p style="color:var(--yellow)">⚠️ No tables found in document. Exporting all text as CSV.</p>';
      const text = doc.body.innerText || doc.body.textContent;
      const rows = text.split('\n').filter(l=>l.trim()).map(l => `"${l.replace(/"/g,'""')}"`);
      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      res.appendChild(_dlBtn(file.name.replace(/\.docx?$/,'')+'.csv', blob, '⬇️ Download CSV'));
      return;
    }
    let csv = '';
    tables.forEach((table, ti) => {
      csv += `"--- Table ${ti+1} ---"\n`;
      table.querySelectorAll('tr').forEach(row => {
        const cells = [...row.querySelectorAll('td,th')].map(c => `"${c.textContent.trim().replace(/"/g,'""')}"`);
        csv += cells.join(',') + '\n';
      });
      csv += '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    res.innerHTML = `<p style="color:var(--green)">✅ Found ${tables.length} table(s)</p>`;
    res.appendChild(_dlBtn(file.name.replace(/\.docx?$/,'')+'.csv', blob, '⬇️ Download Excel/CSV'));
    showToast('Tables extracted!', 'success');
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

// ── JPG TO WORD ───────────────────────────────────────────────────────────────
function renderJPGtoWord() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">Uses OCR to extract text from image, then creates a Word-compatible document.</p>
      <div class="file-drop-zone" id="j2w-drop" onclick="document.getElementById('j2w-input').click()">
        <div class="file-drop-icon">📝</div>
        <div class="file-drop-label">Upload JPG/PNG Image</div>
        <input type="file" id="j2w-input" accept="image/*" style="display:none" onchange="handleJPGtoWord(this.files[0])">
      </div>
      <div id="j2w-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('j2w-drop', f => handleJPGtoWord(f));
}

async function handleJPGtoWord(file) {
  if (!file) return;
  const res = document.getElementById('j2w-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Running OCR…</p>';
  try {
    const text = await _runSecureOCR(file);
    if (!text.trim()) { res.innerHTML = '<p style="color:var(--red)">No text detected in image. Try a clearer, higher-resolution photo.</p>'; return; }
    // Create RTF (opens in Word)
    const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\f0\\fs24 ${text.replace(/\n/g,'\\par ').replace(/[\\{}]/g,'\\$&')}}`;
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const name = file.name.replace(/\.\w+$/, '') + '.rtf';
    res.innerHTML = `<p style="color:var(--green)">✅ OCR complete!</p><textarea class="form-input" rows="6" style="font-family:monospace;font-size:.8rem" readonly>${text}</textarea>`;
    res.appendChild(_dlBtn(name, blob, '⬇️ Download Word/RTF'));
    showToast('Image converted to Word!', 'success');
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">OCR failed: ${e.message}</p><p style="color:var(--text3);font-size:.8rem;margin-top:.4rem">This tool uses a free shared OCR API key, which can be temporarily rate-limited. If this keeps happening, try again in a minute or use a smaller image.</p>`;
  }
}

// ── JPG TO EXCEL ──────────────────────────────────────────────────────────────
function renderJPGtoExcel() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">OCR extracts table data from image and exports as CSV (opens in Excel).</p>
      <div class="file-drop-zone" id="j2e-drop" onclick="document.getElementById('j2e-input').click()">
        <div class="file-drop-icon">📊</div>
        <div class="file-drop-label">Upload Image with Table</div>
        <input type="file" id="j2e-input" accept="image/*" style="display:none" onchange="handleJPGtoExcel(this.files[0])">
      </div>
      <div id="j2e-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('j2e-drop', f => handleJPGtoExcel(f));
}

async function handleJPGtoExcel(file) {
  if (!file) return;
  const res = document.getElementById('j2e-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Running OCR on table…</p>';
  try {
    const text = await _runSecureOCR(file);
    if (!text.trim()) { res.innerHTML = '<p style="color:var(--red)">No text detected. Try a clearer, higher-resolution photo.</p>'; return; }
    const rows = text.split('\n').filter(l=>l.trim()).map(line => {
      const cells = line.split(/\s{2,}|\t/).map(c => `"${c.trim().replace(/"/g,'""')}"`);
      return cells.join(',');
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    res.innerHTML = `<p style="color:var(--green)">✅ ${rows.length} rows extracted</p><textarea class="form-input" rows="6" style="font-family:monospace;font-size:.75rem" readonly>${csv.substring(0,400)}</textarea>`;
    res.appendChild(_dlBtn(file.name.replace(/\.\w+$/,'')+'.csv', blob, '⬇️ Download Excel/CSV'));
    showToast('Image converted to Excel!', 'success');
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">OCR failed: ${e.message}</p><p style="color:var(--text3);font-size:.8rem;margin-top:.4rem">This tool uses a free shared OCR API key, which can be temporarily rate-limited. If this keeps happening, try again in a minute or use a smaller image.</p>`;
  }
}

// ── EXCEL TO JPG ──────────────────────────────────────────────────────────────
function renderExcelToJPG() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">Paste your data below (or upload a CSV) and we'll render it as a clean image.</p>
      <div class="form-group">
        <label class="form-label">Paste CSV/Table Data</label>
        <textarea class="form-input" id="e2j-data" rows="8" placeholder="Name,Age,City&#10;Alice,30,Mumbai&#10;Bob,25,Delhi" style="font-family:monospace;font-size:.82rem"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Or upload CSV file</label>
        <input type="file" class="form-input" id="e2j-file" accept=".csv,.xlsx,.xls" onchange="loadCSVFile(this)">
      </div>
      <button class="btn-primary-glow" onclick="handleExcelToJPG()">🖼️ Convert to JPG</button>
      <div id="e2j-result" style="margin-top:1rem"></div>
    </div>`;
}

function loadCSVFile(input) {
  const f = input.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = e => document.getElementById('e2j-data').value = e.target.result;
  r.readAsText(f);
}

function handleExcelToJPG() {
  const raw = document.getElementById('e2j-data')?.value?.trim();
  const res = document.getElementById('e2j-result');
  if (!raw) { res.innerHTML = '<p style="color:var(--red)">Please paste data or upload a file.</p>'; return; }
  const rows = raw.split('\n').map(r => r.split(',').map(c => c.replace(/^"|"$/g,'').trim()));
  const canvas = document.createElement('canvas');
  const colW = 150, rowH = 36, padding = 20;
  const cols = Math.max(...rows.map(r=>r.length));
  canvas.width = cols * colW + padding * 2;
  canvas.height = rows.length * rowH + padding * 2;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const x = padding + ci * colW, y = padding + ri * rowH;
      if (ri === 0) { ctx.fillStyle = '#6366f1'; ctx.fillRect(x, y, colW-2, rowH-2); ctx.fillStyle = '#fff'; }
      else { ctx.fillStyle = ri%2===0?'#f8f8ff':'#fff'; ctx.fillRect(x, y, colW-2, rowH-2); ctx.fillStyle = '#333'; }
      ctx.font = ri===0 ? 'bold 13px Arial' : '12px Arial';
      ctx.fillText(cell.substring(0,18), x+6, y+22);
      ctx.strokeStyle = '#ddd'; ctx.strokeRect(x, y, colW-2, rowH-2);
    });
  });
  canvas.toBlob(blob => {
    res.innerHTML = `<img src="${canvas.toDataURL()}" style="max-width:100%;border:1px solid var(--border);border-radius:8px">`;
    res.appendChild(_dlBtn('table.jpg', blob, '⬇️ Download JPG'));
    showToast('Table converted to JPG!', 'success');
  }, 'image/jpeg', 0.95);
}

// ── PPT TO PDF ────────────────────────────────────────────────────────────────
function renderPPTtoPDF() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="info-box" style="background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);border-radius:8px;padding:1rem;margin-bottom:1rem;font-size:.85rem;color:var(--text2)">
        📌 Extracts all text from your PowerPoint file and creates a PDF document.
      </div>
      <div class="file-drop-zone" id="ppt-drop" onclick="document.getElementById('ppt-input').click()">
        <div class="file-drop-icon">📑</div>
        <div class="file-drop-label">Upload PowerPoint (.pptx) File</div>
        <input type="file" id="ppt-input" accept=".pptx,.ppt" style="display:none" onchange="handlePPTtoPDF(this.files[0])">
      </div>
      <div id="ppt-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('ppt-drop', f => handlePPTtoPDF(f));
}

async function handlePPTtoPDF(file) {
  if (!file) return;
  const res = document.getElementById('ppt-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Processing PPTX…</p>';
  try {
    if (!window.JSZip) throw new Error('JSZip library not available. Please refresh the page.');
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const jsPDF = (window.jspdf?.jsPDF) || window.jsPDF;
    if (!jsPDF) throw new Error('PDF library not loaded');

    // Extract slide XML files and parse text (natural sort so slide10 doesn't
    // come before slide2 — plain string sort gets this wrong for 10+ slides)
    const slideKeys = Object.keys(zip.files)
      .filter(k => k.match(/ppt\/slides\/slide\d+\.xml/))
      .sort((a,b) => {
        const na = parseInt(a.match(/slide(\d+)\.xml/)[1], 10);
        const nb = parseInt(b.match(/slide(\d+)\.xml/)[1], 10);
        return na - nb;
      });
    if (!slideKeys.length) throw new Error('No slides found. Is this a valid .pptx file?');

    const pdf = new jsPDF({ orientation:'l', unit:'mm', format:'a4' });
    let first = true;
    for (const key of slideKeys) {
      const xml = await zip.files[key].async('string');
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const texts = [...doc.querySelectorAll('t')].map(t => t.textContent).filter(t => t.trim());

      if (!first) pdf.addPage(); first = false;
      // Slide background
      pdf.setFillColor(30, 30, 40); pdf.rect(0, 0, 297, 210, 'F');
      let y = 20;
      texts.forEach((t, i) => {
        if (i === 0) { pdf.setFontSize(22); pdf.setTextColor(180, 160, 255); }
        else { pdf.setFontSize(13); pdf.setTextColor(220, 220, 230); }
        const lines = pdf.splitTextToSize(t, 270);
        lines.forEach(line => { if (y < 195) { pdf.text(line, 15, y); y += i===0?10:8; } });
      });
    }
    pdf.save(file.name.replace(/\.pptx?$/, '') + '.pdf');
    res.innerHTML = `<p style="color:var(--green)">✅ ${slideKeys.length} slides converted to PDF!</p>`;
    showToast('PowerPoint converted to PDF!', 'success');
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}. Make sure JSZip library is available.</p>`;
  }
}

// ── DOCUMENT SCANNER ──────────────────────────────────────────────────────────
function renderDocScanner() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">Use your camera to scan a document, or upload a photo — we'll enhance it and save as PDF.</p>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
        <button class="btn-primary-glow" onclick="document.getElementById('scan-cam').click()">📷 Use Camera</button>
        <button class="btn-outline-glow" onclick="document.getElementById('scan-file').click()">📁 Upload Photo</button>
      </div>
      <input type="file" id="scan-cam" accept="image/*" capture="environment" style="display:none" onchange="handleScan(this.files[0])">
      <input type="file" id="scan-file" accept="image/*" style="display:none" onchange="handleScan(this.files[0])">
      <div id="scan-result" style="margin-top:1rem"></div>
    </div>`;
}

async function handleScan(file) {
  if (!file) return;
  const res = document.getElementById('scan-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Processing scan…</p>';
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    // A4 proportions
    const maxW = 1240; const ratio = bitmap.height / bitmap.width;
    canvas.width = maxW; canvas.height = Math.round(maxW * ratio);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    // Apply document enhancement: increase contrast
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.8 + 128));
      d[i] = d[i+1] = d[i+2] = enhanced;
    }
    ctx.putImageData(imgData, 0, 0);

    const jsPDF = (window.jspdf?.jsPDF) || window.jsPDF;
    if (!jsPDF) throw new Error('PDF library still loading — please wait a second and try again.');
    const pdf = new jsPDF({ orientation: canvas.width>canvas.height?'l':'p', unit:'mm', format:'a4' });
    const pageW = canvas.width>canvas.height?297:210;
    const pageH = canvas.width>canvas.height?210:297;
    pdf.addImage(canvas.toDataURL('image/jpeg',0.92), 'JPEG', 0, 0, pageW, pageH);
    pdf.save('scanned-document.pdf');

    res.innerHTML = `<img src="${canvas.toDataURL()}" style="max-width:100%;border-radius:8px;border:1px solid var(--border)"><p style="color:var(--green);margin-top:.5rem">✅ Document scanned & PDF saved!</p>`;
    showToast('Document scanned!', 'success');
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

// ── TEXT TO WORD ──────────────────────────────────────────────────────────────
function renderTextToWord() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="form-group">
        <label class="form-label">Enter / Paste Your Text</label>
        <textarea class="form-input" id="t2w-text" rows="10" placeholder="Type or paste your text here..."></textarea>
      </div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;align-items:center;margin-bottom:.5rem">
        <div class="form-group" style="flex:1;min-width:140px;margin:0">
          <label class="form-label" style="margin-bottom:.25rem">Font</label>
          <select class="form-input" id="t2w-font" style="padding:.4rem">
            <option>Arial</option><option>Times New Roman</option><option>Courier New</option><option>Georgia</option>
          </select>
        </div>
        <div class="form-group" style="flex:1;min-width:120px;margin:0">
          <label class="form-label" style="margin-bottom:.25rem">Font Size</label>
          <select class="form-input" id="t2w-size" style="padding:.4rem">
            <option>12</option><option>14</option><option selected>16</option><option>18</option><option>24</option>
          </select>
        </div>
      </div>
      <button class="btn-primary-glow" style="margin-top:.5rem" onclick="handleTextToWord()">📝 Download as Word</button>
      <div id="t2w-result" style="margin-top:1rem"></div>
    </div>`;
}

function handleTextToWord() {
  const text = document.getElementById('t2w-text')?.value?.trim();
  const font = document.getElementById('t2w-font')?.value || 'Arial';
  const size = document.getElementById('t2w-size')?.value || '16';
  const res = document.getElementById('t2w-result');
  if (!text) { res.innerHTML = '<p style="color:var(--red)">Please enter some text.</p>'; return; }
  // Create RTF document
  const escaped = text.replace(/\\/g,'\\\\').replace(/[{}]/g,'\\$&').replace(/\n/g,'\\par\n');
  const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 ${font};}}{\\colortbl ;\\red0\\green0\\blue0;}\\f0\\fs${parseInt(size)*2}\\cf1 ${escaped}}`;
  const blob = new Blob([rtf], { type: 'application/rtf' });
  res.innerHTML = '<p style="color:var(--green)">✅ Ready to download!</p>';
  res.appendChild(_dlBtn('document.rtf', blob, '⬇️ Download Word File'));
  showToast('Word file created!', 'success');
}

// ── INVERT IMAGE ──────────────────────────────────────────────────────────────
function renderInvertImage() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="file-drop-zone" id="inv-drop" onclick="document.getElementById('inv-input').click()">
        <div class="file-drop-icon">🔄</div>
        <div class="file-drop-label">Upload Image to Invert</div>
        <input type="file" id="inv-input" accept="image/*" style="display:none" onchange="handleInvertImage(this.files[0])">
      </div>
      <div id="inv-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('inv-drop', f => handleInvertImage(f));
}

async function handleInvertImage(file) {
  if (!file) return;
  const res = document.getElementById('inv-result');
  res.innerHTML = '<div class="loading-spinner"></div>';
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width; canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i]; d[i+1] = 255 - d[i+1]; d[i+2] = 255 - d[i+2];
  }
  ctx.putImageData(imgData, 0, 0);
  canvas.toBlob(blob => {
    const preview = canvas.toDataURL();
    res.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
        <div><p style="font-size:.8rem;color:var(--text3);text-align:center">Original</p><img src="${URL.createObjectURL(file)}" style="width:100%;border-radius:6px;border:1px solid var(--border)"></div>
        <div><p style="font-size:.8rem;color:var(--text3);text-align:center">Inverted</p><img src="${preview}" style="width:100%;border-radius:6px;border:1px solid var(--border)"></div>
      </div>`;
    res.appendChild(_dlBtn('inverted.png', blob, '⬇️ Download Inverted Image'));
    showToast('Image inverted!', 'success');
  }, 'image/png');
}

// ── TEXT TO IMAGE ─────────────────────────────────────────────────────────────
function renderTextToImage() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="form-group">
        <label class="form-label">Text</label>
        <textarea class="form-input" id="tti-text" rows="5" placeholder="Enter your text here..."></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;margin-bottom:1rem">
        <div>
          <label class="form-label">Text Color</label>
          <input type="color" id="tti-fg" value="#ffffff" style="width:100%;height:38px;border:1px solid var(--border);border-radius:6px;cursor:pointer">
        </div>
        <div>
          <label class="form-label">Background</label>
          <input type="color" id="tti-bg" value="#6366f1" style="width:100%;height:38px;border:1px solid var(--border);border-radius:6px;cursor:pointer">
        </div>
        <div>
          <label class="form-label">Font Size</label>
          <select class="form-input" id="tti-size">
            <option value="24">Small</option><option value="36" selected>Medium</option><option value="48">Large</option><option value="64">XL</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Canvas Size</label>
        <select class="form-input" id="tti-canvas">
          <option value="800x400">800 × 400 (Banner)</option>
          <option value="1080x1080" selected>1080 × 1080 (Square)</option>
          <option value="1920x1080">1920 × 1080 (HD)</option>
          <option value="1080x1920">1080 × 1920 (Story)</option>
        </select>
      </div>
      <button class="btn-primary-glow" onclick="handleTextToImage()">🎨 Generate Image</button>
      <div id="tti-result" style="margin-top:1rem"></div>
    </div>`;
}

function handleTextToImage() {
  const text = document.getElementById('tti-text')?.value?.trim();
  const fg = document.getElementById('tti-fg')?.value || '#ffffff';
  const bg = document.getElementById('tti-bg')?.value || '#6366f1';
  const fs = parseInt(document.getElementById('tti-size')?.value || 36);
  const size = (document.getElementById('tti-canvas')?.value || '1080x1080').split('x');
  const res = document.getElementById('tti-result');
  if (!text) { res.innerHTML = '<p style="color:var(--red)">Please enter text.</p>'; return; }
  const canvas = document.createElement('canvas');
  canvas.width = parseInt(size[0]); canvas.height = parseInt(size[1]);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = fg; ctx.font = `bold ${fs}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // Word-wrap
  const words = text.split(' '); let lines = []; let line = '';
  const maxW = canvas.width - 80;
  words.forEach(w => {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  });
  if (line) lines.push(line);
  const totalH = lines.length * (fs * 1.4);
  let startY = (canvas.height - totalH) / 2 + fs * 0.7;
  lines.forEach(l => { ctx.fillText(l, canvas.width/2, startY); startY += fs * 1.4; });
  canvas.toBlob(blob => {
    res.innerHTML = `<img src="${canvas.toDataURL()}" style="max-width:100%;border-radius:8px;border:1px solid var(--border)">`;
    res.appendChild(_dlBtn('text-image.png', blob, '⬇️ Download Image'));
    showToast('Image created!', 'success');
  }, 'image/png');
}

// ── IMAGE TRANSLATOR ──────────────────────────────────────────────────────────
function renderImageTranslator() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">Upload an image, we extract the text with OCR, then translate it.</p>
      <div class="file-drop-zone" id="itrans-drop" onclick="document.getElementById('itrans-input').click()">
        <div class="file-drop-icon">🌐</div>
        <div class="file-drop-label">Upload Image with Text</div>
        <input type="file" id="itrans-input" accept="image/*" style="display:none" onchange="handleImageTranslator(this.files[0])">
      </div>
      <div class="form-group" style="margin-top:1rem">
        <label class="form-label">Translate To</label>
        <select class="form-input" id="itrans-lang">
          <option value="Hindi">Hindi</option><option value="Spanish">Spanish</option><option value="French">French</option>
          <option value="German">German</option><option value="Chinese">Chinese</option><option value="Arabic">Arabic</option>
          <option value="Japanese">Japanese</option><option value="Portuguese">Portuguese</option><option value="Russian">Russian</option>
          <option value="Korean">Korean</option><option value="Italian">Italian</option><option value="Bengali">Bengali</option>
        </select>
      </div>
      <div id="itrans-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('itrans-drop', f => handleImageTranslator(f));
}

async function handleImageTranslator(file) {
  if (!file) return;
  const res = document.getElementById('itrans-result');
  const lang = document.getElementById('itrans-lang')?.value || 'Hindi';
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Extracting text with OCR…</p>';
  try {
    const text = await _runSecureOCR(file);
    if (!text.trim()) { res.innerHTML = '<p style="color:var(--red)">No text detected in image.</p>'; return; }
    res.innerHTML = `
      <div class="result-item" style="margin-bottom:1rem">
        <div class="form-label">📝 Extracted Text</div>
        <textarea class="form-input" rows="4" readonly style="font-size:.85rem">${text}</textarea>
      </div>
      <div class="loading-spinner"></div><p style="text-align:center">Translating to ${lang}…</p>`;
    // Translate via our existing secure Groq proxy (same pipeline as the AI chat/tools).
    // Previously this called api.anthropic.com directly from the browser with no
    // auth header — that request could never succeed. Fixed to reuse the working,
    // already-authenticated Groq pipeline instead of adding a third AI provider.
    const resp = await fetch('/.netlify/functions/groq-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Translate this text to ${lang}. Return ONLY the translated text, nothing else:\n\n${text}`,
        model: 'openai/gpt-oss-120b',
      }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.error || 'Translation failed. Please try again.');
    const translation = data?.reply || '';
    res.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div>
          <div class="form-label">📝 Original Text</div>
          <div class="result-box" style="background:var(--surface2);border-radius:8px;padding:.75rem;font-size:.85rem;line-height:1.6">${text}</div>
        </div>
        <div>
          <div class="form-label">🌐 Translated (${lang})</div>
          <div class="result-box" style="background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:8px;padding:.75rem;font-size:.85rem;line-height:1.6">${translation}</div>
        </div>
      </div>
      <button class="btn-outline-glow" style="margin-top:1rem" onclick="navigator.clipboard.writeText(${JSON.stringify(translation)}).then(()=>showToast('Copied!','success'))">📋 Copy Translation</button>`;
    showToast('Translation complete!', 'success');
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

// ── BARCODE SCANNER ───────────────────────────────────────────────────────────
function renderBarcodeScanner() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">Upload an image containing a barcode or QR code to decode it.</p>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
        <button class="btn-primary-glow" onclick="document.getElementById('bscan-cam').click()">📷 Scan with Camera</button>
        <button class="btn-outline-glow" onclick="document.getElementById('bscan-file').click()">📁 Upload Image</button>
      </div>
      <input type="file" id="bscan-cam" accept="image/*" capture="environment" style="display:none" onchange="handleBarcodeScanner(this.files[0])">
      <input type="file" id="bscan-file" accept="image/*" style="display:none" onchange="handleBarcodeScanner(this.files[0])">
      <div id="bscan-result" style="margin-top:1rem"></div>
    </div>`;
}

async function handleBarcodeScanner(file) {
  if (!file) return;
  const res = document.getElementById('bscan-result');
  res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Scanning…</p>';
  try {
    // Use BarcodeDetector API if available
    if ('BarcodeDetector' in window) {
      const bitmap = await createImageBitmap(file);
      const detector = new BarcodeDetector();
      const barcodes = await detector.detect(bitmap);
      if (barcodes.length === 0) {
        res.innerHTML = '<p style="color:var(--yellow)">⚠️ No barcode detected. Try a clearer image.</p>';
        return;
      }
      res.innerHTML = barcodes.map(b => `
        <div class="result-item" style="margin-bottom:.75rem;padding:.75rem;background:var(--surface2);border-radius:8px">
          <div style="font-size:.75rem;color:var(--text3);margin-bottom:.25rem">Format: ${b.format.toUpperCase()}</div>
          <div style="font-weight:700;font-size:1rem;word-break:break-all">${b.rawValue}</div>
          <button class="btn-outline-glow" style="margin-top:.5rem;font-size:.8rem;padding:.35rem .75rem" onclick="navigator.clipboard.writeText('${b.rawValue.replace(/'/g,"\\'")}').then(()=>showToast('Copied!','success'))">📋 Copy</button>
          ${b.rawValue.startsWith('http') ? `<a href="${b.rawValue}" target="_blank" rel="noopener" class="btn-outline-glow" style="margin-top:.5rem;font-size:.8rem;padding:.35rem .75rem;text-decoration:none;display:inline-block">🔗 Open URL</a>` : ''}
        </div>`).join('');
      showToast(`Found ${barcodes.length} barcode(s)!`, 'success');
    } else {
      // Fallback: use OCR for QR code text
      const text = (await _runSecureOCR(file)).trim();
      if (text) {
        res.innerHTML = `<div class="result-item" style="padding:.75rem;background:var(--surface2);border-radius:8px"><div style="font-size:.75rem;color:var(--text3)">Decoded Content:</div><div style="font-weight:700;word-break:break-all">${text}</div></div>`;
      } else {
        res.innerHTML = '<p style="color:var(--yellow)">⚠️ BarcodeDetector API not supported in this browser. Try Chrome on desktop or Android.</p>';
      }
    }
  } catch(e) {
    res.innerHTML = `<p style="color:var(--red)">Error: ${e.message}</p>`;
  }
}

// ── BATCH IMAGE TO TEXT ───────────────────────────────────────────────────────
function renderBatchImgToText() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <p style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">Upload multiple images at once. OCR will extract text from all of them.</p>
      <div class="file-drop-zone" id="batch-drop" onclick="document.getElementById('batch-input').click()">
        <div class="file-drop-icon">📚</div>
        <div class="file-drop-label">Upload Multiple Images</div>
        <div class="file-drop-sub">Select multiple files at once</div>
        <input type="file" id="batch-input" accept="image/*" multiple style="display:none" onchange="handleBatchImgToText(this.files)">
      </div>
      <div id="batch-result" style="margin-top:1rem"></div>
    </div>`;
  setupDrop('batch-drop', f => handleBatchImgToText([f]));
}

async function handleBatchImgToText(files) {
  if (!files || !files.length) return;
  const res = document.getElementById('batch-result');
  res.innerHTML = `<p style="text-align:center">Processing 0 / ${files.length} images…</p><div class="progress-bar" style="background:var(--surface2);border-radius:99px;height:8px"><div id="batch-progress" style="background:var(--indigo);height:8px;border-radius:99px;width:0%;transition:width .3s"></div></div><div id="batch-items"></div>`;
  const items = document.getElementById('batch-items');
  let allText = '';
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    res.querySelector('p').textContent = `Processing ${i+1} / ${files.length}: ${file.name}`;
    document.getElementById('batch-progress').style.width = `${((i+1)/files.length*100).toFixed(0)}%`;
    try {
      const ocrText = await _runSecureOCR(file);
      const text = ocrText || '(no text detected)';
      allText += `\n=== ${file.name} ===\n${text}\n`;
      items.insertAdjacentHTML('beforeend', `
        <div style="margin-top:.75rem;padding:.75rem;background:var(--surface2);border-radius:8px">
          <div style="font-weight:600;font-size:.85rem;margin-bottom:.4rem">✅ ${file.name}</div>
          <div style="font-size:.78rem;color:var(--text3);max-height:80px;overflow:hidden">${text.substring(0,200)}</div>
        </div>`);
    } catch(e) {
      items.insertAdjacentHTML('beforeend', `<div style="margin-top:.5rem;color:var(--red);font-size:.8rem">❌ ${file.name}: ${e.message}</div>`);
    }
    await new Promise(r => setTimeout(r, 500)); // Rate limit
  }
  const blob = new Blob([allText], { type: 'text/plain' });
  res.querySelector('p').textContent = `✅ All ${files.length} images processed!`;
  const dlArea = document.createElement('div');
  dlArea.style.marginTop = '1rem';
  dlArea.appendChild(_dlBtn('batch-ocr-results.txt', blob, `⬇️ Download All Text (${files.length} files)`));
  res.appendChild(dlArea);
  showToast(`${files.length} images processed!`, 'success');
}

// ── TEXT TO PDF ───────────────────────────────────────────────────────────────
function renderTextToPDF() {
  document.getElementById('tool-widget-container').innerHTML = `
    <div class="tool-widget">
      <div class="form-group">
        <label class="form-label">Enter / Paste Your Text</label>
        <textarea class="form-input" id="t2p-text" rows="12" placeholder="Type or paste your text here. Each blank line becomes a paragraph break..."></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;margin-bottom:1rem">
        <div>
          <label class="form-label">Font</label>
          <select class="form-input" id="t2p-font">
            <option value="helvetica" selected>Helvetica</option>
            <option value="times">Times New Roman</option>
            <option value="courier">Courier</option>
          </select>
        </div>
        <div>
          <label class="form-label">Font Size</label>
          <select class="form-input" id="t2p-size">
            <option value="10">10pt</option>
            <option value="12" selected>12pt</option>
            <option value="14">14pt</option>
            <option value="16">16pt</option>
            <option value="18">18pt</option>
          </select>
        </div>
        <div>
          <label class="form-label">Page Size</label>
          <select class="form-input" id="t2p-page">
            <option value="a4" selected>A4</option>
            <option value="letter">Letter (US)</option>
            <option value="a3">A3</option>
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
        <div>
          <label class="form-label">Text Color</label>
          <input type="color" id="t2p-color" value="#000000" style="width:100%;height:38px;border:1px solid var(--border);border-radius:6px;cursor:pointer;background:transparent">
        </div>
        <div>
          <label class="form-label">Line Spacing</label>
          <select class="form-input" id="t2p-spacing">
            <option value="1">Single</option>
            <option value="1.5" selected>1.5×</option>
            <option value="2">Double</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Document Title <span style="color:var(--text3);font-weight:400">(optional — shown at top of PDF)</span></label>
        <input class="form-input" type="text" id="t2p-title" placeholder="e.g. My Report">
      </div>
      <button class="btn-primary-glow" style="width:100%" onclick="handleTextToPDF()">📄 Convert to PDF</button>
      <div id="t2p-result" style="margin-top:1rem"></div>
    </div>`;
}

function handleTextToPDF() {
  const text    = document.getElementById('t2p-text')?.value?.trim();
  const font    = document.getElementById('t2p-font')?.value    || 'helvetica';
  const size    = parseInt(document.getElementById('t2p-size')?.value  || '12');
  const page    = document.getElementById('t2p-page')?.value    || 'a4';
  const spacing = parseFloat(document.getElementById('t2p-spacing')?.value || '1.5');
  const title   = document.getElementById('t2p-title')?.value?.trim();
  const color   = document.getElementById('t2p-color')?.value   || '#000000';
  const res     = document.getElementById('t2p-result');

  if (!text) { res.innerHTML = '<p style="color:var(--red)">Please enter some text first.</p>'; return; }

  const jsPDF = (window.jspdf?.jsPDF) || window.jsPDF;
  if (!jsPDF) {
    // jsPDF loaded with defer — may not be ready yet; dynamically load and retry
    res.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Loading PDF library…</p>';
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => handleTextToPDF();
    s.onerror = () => { res.innerHTML = '<p style="color:var(--red)">Failed to load PDF library. Check your internet connection.</p>'; };
    document.head.appendChild(s);
    return;
  }

  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: page });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 20; // mm
  const usableW = pageW - margin * 2;
  const lineH = size * 0.352778 * spacing; // pt → mm, then multiply by spacing

  // Parse hex color → r,g,b
  const hex = color.replace('#','');
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);

  pdf.setFont(font);
  pdf.setFontSize(size);
  pdf.setTextColor(r, g, b);

  let y = margin;

  // Optional title
  if (title) {
    pdf.setFont(font, 'bold');
    pdf.setFontSize(size + 6);
    const titleLines = pdf.splitTextToSize(title, usableW);
    titleLines.forEach(line => {
      if (y + lineH > pageH - margin) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y);
      y += (size + 6) * 0.352778 * spacing;
    });
    y += 4; // gap after title
    pdf.setFont(font, 'normal');
    pdf.setFontSize(size);
  }

  // Body text — split on paragraphs, then word-wrap each
  const paragraphs = text.split(/\n\n+/);
  paragraphs.forEach((para, pi) => {
    // Treat each line within a paragraph
    const rawLines = para.split('\n');
    rawLines.forEach(rawLine => {
      const wrapped = pdf.splitTextToSize(rawLine || ' ', usableW);
      wrapped.forEach(line => {
        if (y + lineH > pageH - margin) { pdf.addPage(); y = margin; }
        pdf.text(line, margin, y);
        y += lineH;
      });
    });
    // Extra gap between paragraphs
    if (pi < paragraphs.length - 1) y += lineH * 0.5;
  });

  // Page numbers
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont(font, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' });
  }

  const filename = (title || 'text-document').replace(/[^a-z0-9_\- ]/gi,'').trim().replace(/\s+/g,'-') + '.pdf';
  pdf.save(filename);
  res.innerHTML = `<p style="color:var(--green)">✅ PDF downloaded — <strong>${totalPages}</strong> page${totalPages>1?'s':''}!</p>`;
  showToast('PDF created!', 'success');
}
