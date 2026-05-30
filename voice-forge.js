/* ══════════════════════════════════════════════
   CV VOICE FORGE — Create Vyral AI Voice Studio
   ══════════════════════════════════════════════ */

/* ── Config ── */
const VF = {
  API_NEXTJS: 'http://localhost:3000',
  API_PYTHON: 'http://localhost:8000',
  CHAR_LIMIT: 5000,
  MAX_HISTORY: 10,
  PLAN_REQUIRED: ['GROWTH', 'PRO', 'ELITE'],  // SPARK needs upgrade
};

/* ── LocalStorage keys ── */
const VF_KEYS = {
  HISTORY:  'vf_tts_history',
  PROJECTS: 'vf_voice_projects',
  STATS:    'vf_stats',
};

/* ── Voice catalogue ── */
const VF_VOICES = [
  { id: 'en-US-JennyNeural',    name: 'Jenny',    lang: 'en', flag: '🇺🇸', style: 'Natural', gender: 'Female' },
  { id: 'en-US-GuyNeural',      name: 'Guy',      lang: 'en', flag: '🇺🇸', style: 'Friendly', gender: 'Male' },
  { id: 'en-US-AriaNeural',     name: 'Aria',     lang: 'en', flag: '🇺🇸', style: 'News', gender: 'Female' },
  { id: 'en-GB-SoniaNeural',    name: 'Sonia',    lang: 'en', flag: '🇬🇧', style: 'Natural', gender: 'Female' },
  { id: 'hi-IN-SwaraNeural',    name: 'Swara',    lang: 'hi', flag: '🇮🇳', style: 'Hindi', gender: 'Female' },
  { id: 'hi-IN-MadhurNeural',   name: 'Madhur',   lang: 'hi', flag: '🇮🇳', style: 'Hindi', gender: 'Male' },
  { id: 'ta-IN-PallaviNeural',  name: 'Pallavi',  lang: 'ta', flag: '🇮🇳', style: 'Tamil', gender: 'Female' },
  { id: 'ta-IN-ValluvarNeural', name: 'Valluvar', lang: 'ta', flag: '🇮🇳', style: 'Tamil', gender: 'Male' },
  { id: 'te-IN-MohanNeural',    name: 'Mohan',    lang: 'te', flag: '🇮🇳', style: 'Telugu', gender: 'Male' },
  { id: 'kn-IN-GaganNeural',    name: 'Gagan',    lang: 'kn', flag: '🇮🇳', style: 'Kannada', gender: 'Male' },
  { id: 'ml-IN-SobhanaNeural',  name: 'Sobhana',  lang: 'ml', flag: '🇮🇳', style: 'Malayalam', gender: 'Female' },
  { id: 'es-ES-AlvaroNeural',   name: 'Alvaro',   lang: 'es', flag: '🇪🇸', style: 'Castilian', gender: 'Male' },
  { id: 'fr-FR-DeniseNeural',   name: 'Denise',   lang: 'fr', flag: '🇫🇷', style: 'Parisian', gender: 'Female' },
  { id: 'de-DE-KatjaNeural',    name: 'Katja',    lang: 'de', flag: '🇩🇪', style: 'Natural', gender: 'Female' },
  { id: 'ja-JP-NanamiNeural',   name: 'Nanami',   lang: 'ja', flag: '🇯🇵', style: 'Natural', gender: 'Female' },
  { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao', lang: 'zh', flag: '🇨🇳', style: 'Natural', gender: 'Female' },
];

const VF_LANGS = [
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'hi', flag: '🇮🇳', name: 'Hindi' },
  { code: 'ta', flag: '🇮🇳', name: 'Tamil' },
  { code: 'te', flag: '🇮🇳', name: 'Telugu' },
  { code: 'kn', flag: '🇮🇳', name: 'Kannada' },
  { code: 'ml', flag: '🇮🇳', name: 'Malayalam' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish' },
  { code: 'fr', flag: '🇫🇷', name: 'French' },
];

/* ── State ── */
let selectedVoice = VF_VOICES[0];
let selectedLang = 'en';
let currentAudioUrl = null;
let audioEl = null;
let mediaRecorder = null;
let recChunks = [];
let recTimerInterval = null;
let recSeconds = 0;
let uploadedSampleUrl = null;
let uploadedVideoUrl = null;
let dubPollingInterval = null;
let cloneProjects = [];
let ttsHistory = [];
let stats = { totalGenerations: 0, totalChars: 0, voiceProjects: 0 };
let advOpen = false;

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initSidebar();
  initTabs();
  initTTS();
  initClone();
  initDub();
  loadFromStorage();
  updateHeroStats();
});

/* ── Auth guard ── */
function initAuth() {
  if (!CV?.auth?.isLoggedIn()) {
    window.location.href = 'auth.html?tab=login';
    return;
  }

  const user = CV.getCurrentUser();
  const plan = user?.plan || 'SPARK';

  // Populate sidebar user info
  const firstName = (user?.name || 'Creator').split(' ')[0];
  const initials  = (user?.name || 'A').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  const el = (id) => document.getElementById(id);
  if (el('sbName'))   el('sbName').textContent   = user?.name || 'Creator';
  if (el('sbEmail'))  el('sbEmail').textContent  = user?.email || '';
  if (el('sbAvatar')) el('sbAvatar').textContent = initials;
  if (el('tbAvatar')) el('tbAvatar').textContent = initials;

  const planIcon = { SPARK:'⚡', GROWTH:'🚀', PRO:'👑', ELITE:'💎' };
  if (el('sbPlanName')) el('sbPlanName').textContent = plan;
  if (el('sbPlanIcon')) el('sbPlanIcon').textContent = planIcon[plan] || '🚀';

  // Logout
  if (el('logoutBtn')) {
    el('logoutBtn').addEventListener('click', () => {
      CV.auth.logout();
      window.location.href = 'index.html';
    });
  }

  // Paywall for SPARK
  if (!VF.PLAN_REQUIRED.includes(plan)) {
    document.getElementById('vfPaywall').style.display = 'flex';
  }
}

/* ── Sidebar mobile toggle ── */
function initSidebar() {
  const menuBtn = document.getElementById('menuToggle');
  const sidebar  = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

/* ── Load persisted data ── */
function loadFromStorage() {
  ttsHistory  = JSON.parse(localStorage.getItem(VF_KEYS.HISTORY)   || '[]');
  cloneProjects = JSON.parse(localStorage.getItem(VF_KEYS.PROJECTS) || '[]');
  stats       = JSON.parse(localStorage.getItem(VF_KEYS.STATS)     || '{"totalGenerations":0,"totalChars":0,"voiceProjects":0}');

  renderHistory();
  renderProjects();
}

function saveToStorage() {
  localStorage.setItem(VF_KEYS.HISTORY,   JSON.stringify(ttsHistory));
  localStorage.setItem(VF_KEYS.PROJECTS,  JSON.stringify(cloneProjects));
  localStorage.setItem(VF_KEYS.STATS,     JSON.stringify(stats));
  updateHeroStats();
}

/* ══════════════════════════════════════════════
   TAB NAVIGATION
   ══════════════════════════════════════════════ */

function initTabs() {
  document.querySelectorAll('.vf-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.vf-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.vf-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab)?.classList.add('active');

      // Pause audio when switching tabs
      if (audioEl && !audioEl.paused) audioEl.pause();

      // Scroll content area to top so hero banner is always visible
      const contentEl = document.querySelector('.vf-content');
      if (contentEl) contentEl.scrollTop = 0;
    });
  });
}

/* ══════════════════════════════════════════════
   TEXT-TO-SPEECH STUDIO
   ══════════════════════════════════════════════ */

function initTTS() {
  const textarea   = document.getElementById('ttsText');
  const charCount  = document.getElementById('charCount');
  const charFill   = document.getElementById('charFill');
  const generateBtn = document.getElementById('generateBtn');
  const voiceSearch = document.getElementById('voiceSearch');
  const advToggle  = document.getElementById('advToggle');
  const advBody    = document.getElementById('advBody');
  const advChevron = document.getElementById('advChevron');
  const speedSlider = document.getElementById('speedSlider');
  const pitchSlider = document.getElementById('pitchSlider');
  const speedVal   = document.getElementById('speedVal');
  const pitchVal   = document.getElementById('pitchVal');

  // Character counter
  textarea?.addEventListener('input', () => {
    const len = textarea.value.length;
    const pct = (len / VF.CHAR_LIMIT) * 100;
    charCount.textContent = `${len} / ${VF.CHAR_LIMIT}`;
    charFill.style.width  = Math.min(pct, 100) + '%';
    charCount.classList.toggle('warn', pct > 85);
    charFill.classList.toggle('warn', pct > 85);
  });

  // Language chips
  const langGrid = document.getElementById('langGrid');
  if (langGrid) {
    VF_LANGS.forEach(l => {
      const chip = document.createElement('button');
      chip.className = 'vf-lang-chip' + (l.code === selectedLang ? ' active' : '');
      chip.textContent = l.flag + ' ' + l.name.split(' ')[0];
      chip.dataset.lang = l.code;
      chip.addEventListener('click', () => {
        document.querySelectorAll('.vf-lang-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedLang = l.code;
        // Filter voices
        filterVoices(voiceSearch?.value || '');
      });
      langGrid.appendChild(chip);
    });
  }

  // Voice list
  renderVoiceList();

  // Voice search
  voiceSearch?.addEventListener('input', () => filterVoices(voiceSearch.value));

  // Sliders
  speedSlider?.addEventListener('input', () => { speedVal.textContent = parseFloat(speedSlider.value).toFixed(1) + '×'; });
  pitchSlider?.addEventListener('input', () => {
    const v = parseInt(pitchSlider.value);
    pitchVal.textContent = (v >= 0 ? '+' : '') + v + ' Hz';
  });

  // Advanced toggle
  advToggle?.addEventListener('click', () => {
    advOpen = !advOpen;
    advBody?.classList.toggle('open', advOpen);
    advChevron?.classList.toggle('open', advOpen);
  });

  // Generate
  generateBtn?.addEventListener('click', generateTTS);
}

function renderVoiceList(filter = '') {
  const list = document.getElementById('voiceList');
  if (!list) return;
  list.innerHTML = '';

  const filtered = VF_VOICES.filter(v => {
    const matchLang = !selectedLang || v.lang === selectedLang || selectedLang === 'all';
    const matchSearch = !filter || v.name.toLowerCase().includes(filter.toLowerCase()) || v.style.toLowerCase().includes(filter.toLowerCase());
    return matchLang && matchSearch;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div style="padding:16px;text-align:center;font-size:12px;color:rgba(255,255,255,.3)">No voices for this language</div>';
    return;
  }

  filtered.forEach(voice => {
    const item = document.createElement('div');
    item.className = 'vf-voice-item' + (voice.id === selectedVoice?.id ? ' active' : '');

    item.innerHTML = `
      <div class="vf-voice-avatar ${voice.lang !== 'en' ? 'violet' : ''}">${voice.flag}</div>
      <div class="vf-voice-name">${voice.name}</div>
      <span class="vf-voice-tag">${voice.gender} · ${voice.style}</span>
    `;

    item.addEventListener('click', () => {
      selectedVoice = voice;
      document.querySelectorAll('.vf-voice-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });

    list.appendChild(item);
  });
}

function filterVoices(search) {
  renderVoiceList(search);
}

/* ── TTS Generation ── */
async function generateTTS() {
  const text = document.getElementById('ttsText')?.value?.trim();
  const btn  = document.getElementById('generateBtn');

  if (!text) { showToast('Enter some text first', 'error'); return; }
  if (text.length > VF.CHAR_LIMIT) { showToast(`Text exceeds ${VF.CHAR_LIMIT} characters`, 'error'); return; }
  if (!selectedVoice) { showToast('Please select a voice', 'error'); return; }

  setGenerating(true);

  try {
    const speed = parseFloat(document.getElementById('speedSlider')?.value || 1);
    const pitch = parseInt(document.getElementById('pitchSlider')?.value || 0);

    // Try server, then fall back to Web Speech API
    let audioUrl = null;
    let duration = 0;

    try {
      const result = await callTTSAPI(text, selectedVoice.id, selectedLang, speed, pitch);
      audioUrl = result.audioUrl;
      duration = result.duration;
    } catch (apiErr) {
      console.log('API unavailable, using browser TTS:', apiErr.message);
      // Web Speech API fallback — play inline, create placeholder
      audioUrl = await browserTTSFallback(text, selectedVoice, speed, pitch);
      duration = text.length / 15; // rough estimate
    }

    // Save to history
    const entry = {
      id: 'vf_' + Date.now(),
      text,
      voiceName: selectedVoice.name,
      voiceId:   selectedVoice.id,
      audioUrl,
      duration,
      characters: text.length,
      createdAt: new Date().toISOString(),
    };
    ttsHistory.unshift(entry);
    if (ttsHistory.length > VF.MAX_HISTORY) ttsHistory = ttsHistory.slice(0, VF.MAX_HISTORY);

    stats.totalGenerations++;
    stats.totalChars += text.length;
    saveToStorage();

    // Show player
    if (audioUrl && !audioUrl.startsWith('browser://')) {
      showAudioPlayer(audioUrl, selectedVoice.name + ' · ' + text.slice(0, 30));
    }

    renderHistory();
    showToast('Generated successfully!', 'success');

  } catch (err) {
    console.error('TTS error:', err);
    showToast('Generation failed. Please try again.', 'error');
  } finally {
    setGenerating(false);
  }
}

async function callTTSAPI(text, voiceId, language, speed, pitch) {
  // Try Next.js API first
  try {
    const res = await fetch(`${VF.API_NEXTJS}/api/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId, language, speed, pitch }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error('NextJS API error: ' + res.status);
    const data = await res.json();
    return { audioUrl: data.audioUrl, duration: data.duration };
  } catch (e1) {
    // Try Python service
    const res = await fetch(`${VF.API_PYTHON}/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_id: voiceId, language, speed, pitch }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error('Python API error');
    const data = await res.json();
    return { audioUrl: data.audio_url, duration: data.duration };
  }
}

async function browserTTSFallback(text, voice, speed, pitch) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve('browser://unavailable'); return; }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = speed;
    utterance.pitch = 1 + (pitch / 100);

    // Try to match a browser voice
    const voices = speechSynthesis.getVoices();
    const langMap = { en: 'en-US', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', ja: 'ja-JP', zh: 'zh-CN' };
    const targetLang = langMap[voice.lang] || 'en-US';
    const match = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    if (match) utterance.voice = match;

    utterance.onend = () => resolve('browser://played');
    utterance.onerror = () => resolve('browser://error');
    speechSynthesis.speak(utterance);

    // Animate waveform while speaking
    animateBrowserWaveform(utterance);
    showWaveformPanel();

    resolve('browser://playing');
  });
}

function setGenerating(loading) {
  const btn = document.getElementById('generateBtn');
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loading"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating...`;
  } else {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Generate Speech`;
  }
}

/* ── Audio Player (Web Audio API — bypasses <audio> display:none UA stylesheet bug) ── */
let _audioCtx = null;
let _audioBuffer = null;
let _audioSource = null;
let _audioStartTime = 0;
let _audioOffset = 0;
let _audioPlaying = false;
let _audioProgressRAF = null;
let _audioDownloadUrl = '';

function _getAudioCtx() {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

async function showAudioPlayer(url, title) {
  const outputCard = document.getElementById('outputCard');
  const dlBtn      = document.getElementById('dlBtn');
  const playBtn    = document.getElementById('playBtn');
  const playerBar  = document.getElementById('playerBar');

  _audioBuffer   = null;
  _audioOffset   = 0;
  _audioPlaying  = false;
  _audioDownloadUrl = url;

  if (outputCard) outputCard.style.display = 'block';
  if (dlBtn)      dlBtn.href = url;

  // Set play button to loading state
  if (playBtn) playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:vf-spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('fetch ' + resp.status);
    const arrayBuf = await resp.arrayBuffer();
    const ctx = _getAudioCtx();
    _audioBuffer = await ctx.decodeAudioData(arrayBuf);

    // Draw real waveform from buffer data
    drawBufferWaveform(_audioBuffer, 0);

    // Update duration display
    const tt = document.getElementById('totalTime');
    if (tt) tt.textContent = _fmtTime(_audioBuffer.duration);
    const ct = document.getElementById('currentTime');
    if (ct) ct.textContent = '0:00';

    // Reset play button
    if (playBtn) playBtn.innerHTML = `<svg id="playIcon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;

    // Wire controls
    if (playBtn) playBtn.onclick = togglePlay;
    if (playerBar) playerBar.onclick = seekAudio;

  } catch(err) {
    console.error('[showAudioPlayer]', err);
    if (playBtn) playBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    showToast('Audio load error: ' + err.message, 'error');
  }
}

function showWaveformPanel() {
  const card = document.getElementById('outputCard');
  if (card) card.style.display = 'block';
  drawIdleWaveform();
}

function _fmtTime(s) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function _stopSource() {
  if (_audioSource) {
    try { _audioSource.stop(); } catch(e) {}
    _audioSource.disconnect();
    _audioSource = null;
  }
  if (_audioProgressRAF) { cancelAnimationFrame(_audioProgressRAF); _audioProgressRAF = null; }
}

function togglePlay() {
  if (!_audioBuffer) return;
  const ctx = _getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const playBtn = document.getElementById('playBtn');
  if (_audioPlaying) {
    // Pause: save offset
    _audioOffset += ctx.currentTime - _audioStartTime;
    _stopSource();
    _audioPlaying = false;
    if (playBtn) playBtn.innerHTML = `<svg id="playIcon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  } else {
    // Play from _audioOffset
    _audioSource = ctx.createBufferSource();
    _audioSource.buffer = _audioBuffer;
    _audioSource.connect(ctx.destination);
    _audioSource.start(0, _audioOffset);
    _audioStartTime = ctx.currentTime;
    _audioPlaying = true;
    _audioSource.onended = () => {
      if (_audioPlaying) {
        _audioOffset = 0;
        _audioPlaying = false;
        if (playBtn) playBtn.innerHTML = `<svg id="playIcon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
        drawBufferWaveform(_audioBuffer, 0);
        cancelAnimationFrame(_audioProgressRAF);
      }
    };
    if (playBtn) playBtn.innerHTML = `<svg id="playIcon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    _updateAudioProgress();
  }
}

function seekAudio(e) {
  if (!_audioBuffer) return;
  const bar = document.getElementById('playerBar');
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const newOffset = pct * _audioBuffer.duration;
  const wasPlaying = _audioPlaying;
  if (_audioPlaying) { _stopSource(); _audioPlaying = false; }
  _audioOffset = newOffset;
  _updateProgressUI(pct);
  if (wasPlaying) togglePlay();
}

function _updateAudioProgress() {
  if (!_audioPlaying || !_audioBuffer) return;
  const ctx = _getAudioCtx();
  const elapsed = ctx.currentTime - _audioStartTime;
  const current = Math.min(_audioOffset + elapsed, _audioBuffer.duration);
  const pct = current / _audioBuffer.duration;
  _updateProgressUI(pct);
  drawBufferWaveform(_audioBuffer, pct);
  if (current < _audioBuffer.duration) {
    _audioProgressRAF = requestAnimationFrame(_updateAudioProgress);
  }
}

function _updateProgressUI(pct) {
  const fill = document.getElementById('playerFill');
  if (fill) fill.style.width = (pct * 100) + '%';
  const ct = document.getElementById('currentTime');
  const tt = document.getElementById('totalTime');
  if (ct && _audioBuffer) ct.textContent = _fmtTime(pct * _audioBuffer.duration);
  if (tt && _audioBuffer) tt.textContent = _fmtTime(_audioBuffer.duration);
}

function updateProgress() { /* legacy no-op — progress via Web Audio API now */ }

/* ── Canvas Waveform ── */
let _waveformCache = null; // cached bar heights from real buffer

function drawBufferWaveform(buffer, progress) {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 800;
  const H = 64;
  canvas.width = W;
  ctx.clearRect(0, 0, W, H);

  const bars = Math.floor(W / 4);

  // Build cache from real audio buffer data
  if (!_waveformCache || _waveformCache.length !== bars) {
    const data = buffer.getChannelData(0);
    const step = Math.floor(data.length / bars);
    _waveformCache = new Float32Array(bars);
    for (let i = 0; i < bars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += Math.abs(data[i * step + j] || 0);
      _waveformCache[i] = sum / step;
    }
    // Normalize
    const max = Math.max(..._waveformCache, 0.001);
    for (let i = 0; i < bars; i++) _waveformCache[i] /= max;
  }

  const playedBars = Math.floor(bars * progress);
  for (let i = 0; i < bars; i++) {
    const x = i * 4 + 1;
    const h = 4 + _waveformCache[i] * 52;
    const y = (H - h) / 2;
    ctx.fillStyle = i < playedBars ? 'rgba(197,255,62,0.9)' : 'rgba(197,255,62,0.22)';
    ctx.beginPath();
    ctx.roundRect(x, y, 2, h, 1);
    ctx.fill();
  }
}

function drawIdleWaveform() {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  if (_audioBuffer) { drawBufferWaveform(_audioBuffer, 0); return; }
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 800;
  const H = 64;
  canvas.width = W;
  ctx.clearRect(0, 0, W, H);
  const bars = Math.floor(W / 4);
  for (let i = 0; i < bars; i++) {
    const x = i * 4 + 1;
    const h = 4 + Math.random() * 24;
    const y = (H - h) / 2;
    ctx.fillStyle = 'rgba(197,255,62,0.22)';
    ctx.beginPath();
    ctx.roundRect(x, y, 2, h, 1);
    ctx.fill();
  }
}

function drawPlayingWaveform(progress) {
  if (_audioBuffer) { drawBufferWaveform(_audioBuffer, progress); return; }
  drawIdleWaveform();
}

function animateBrowserWaveform() {
  let frame = 0;
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 400;

  function draw() {
    if (!window.speechSynthesis?.speaking) { drawIdleWaveform(); return; }
    const ctx = canvas.getContext('2d');
    const W = canvas.width; const H = 64;
    ctx.clearRect(0, 0, W, H);
    const bars = Math.floor(W / 4);
    for (let i = 0; i < bars; i++) {
      const x = i * 4 + 1;
      const h = 6 + Math.abs(Math.sin((i * 0.35) + frame * 0.08)) * 28;
      const y = (H - h) / 2;
      ctx.fillStyle = `rgba(197,255,62,${0.3 + Math.abs(Math.sin(i * 0.2 + frame * 0.05)) * 0.5})`;
      ctx.beginPath();
      ctx.roundRect(x, y, 2, h, 1);
      ctx.fill();
    }
    frame++;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── History ── */
function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;

  if (ttsHistory.length === 0) {
    list.innerHTML = `
      <div class="vf-empty-state">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        <p>No generations yet</p>
      </div>`;
    return;
  }

  list.innerHTML = ttsHistory.map(item => `
    <div class="vf-history-item" data-url="${item.audioUrl}">
      <div class="vf-hist-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C5FF3E" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
      </div>
      <div class="vf-hist-text">
        <div class="vf-hist-excerpt">"${item.text.slice(0,50)}${item.text.length > 50 ? '…' : ''}"</div>
        <div class="vf-hist-meta">${item.voiceName} · ${item.characters} chars</div>
      </div>
      ${item.audioUrl && !item.audioUrl.startsWith('browser://') ? `
      <a class="vf-hist-dl" href="${item.audioUrl}" download="voiceforge-${item.id}.mp3" title="Download">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </a>` : ''}
    </div>
  `).join('');

  // Click to replay
  list.querySelectorAll('.vf-history-item[data-url]').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.vf-hist-dl')) return;
      const url = item.dataset.url;
      if (url && !url.startsWith('browser://')) showAudioPlayer(url, '');
    });
  });
}

/* ══════════════════════════════════════════════
   VOICE CLONING
   ══════════════════════════════════════════════ */

function initClone() {
  initUploadZone();
  initMicRecorder();

  // Sample tabs
  document.querySelectorAll('.vf-sample-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.stab;
      document.querySelectorAll('.vf-sample-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.vf-sample-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('sp' + target.charAt(0).toUpperCase() + target.slice(1))?.classList.add('active');
    });
  });

  // Create clone button
  document.getElementById('createCloneBtn')?.addEventListener('click', createVoiceProject);
}

function initUploadZone() {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('sampleFileInput');

  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleSampleFile(file);
  });

  input.addEventListener('change', () => {
    if (input.files[0]) handleSampleFile(input.files[0]);
  });
}

function handleSampleFile(file) {
  if (!file.type.startsWith('audio/')) { showToast('Please upload an audio file', 'error'); return; }
  if (file.size > 50 * 1024 * 1024) { showToast('File too large (max 50MB)', 'error'); return; }

  uploadedSampleFile = file;                        // keep raw File for FormData
  uploadedSampleUrl  = URL.createObjectURL(file);   // blob URL for preview
  const readyEl = document.getElementById('uploadReady');
  const nameEl  = document.getElementById('uploadFileName');
  if (readyEl) readyEl.style.display = 'flex';
  if (nameEl)  nameEl.textContent = file.name;
  showToast('Sample loaded: ' + file.name, 'success');
}

function initMicRecorder() {
  const btn = document.getElementById('recordBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (mediaRecorder?.state === 'recording') {
      stopRecording();
    } else {
      await startRecording();
    }
  });
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recChunks = [];
    recSeconds = 0;

    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recChunks.push(e.data); };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(recChunks, { type: 'audio/webm' });
      uploadedSampleFile = new File([blob], 'recording.webm', { type: 'audio/webm' });
      uploadedSampleUrl  = URL.createObjectURL(blob);
      const recReady = document.getElementById('recReady');
      const recDur   = document.getElementById('recDuration');
      if (recReady) recReady.style.display = 'flex';
      if (recDur)   recDur.textContent = recSeconds + 's';
      clearInterval(recTimerInterval);
      showToast('Recording saved (' + recSeconds + 's)', 'success');
    };

    mediaRecorder.start();
    document.getElementById('recordBtn')?.classList.add('recording');
    document.getElementById('recStatus').textContent = 'Recording... speak clearly';

    recTimerInterval = setInterval(() => {
      recSeconds++;
      const timer = document.getElementById('recTimer');
      if (timer) {
        const m = Math.floor(recSeconds / 60);
        const s = recSeconds % 60;
        timer.textContent = `${m}:${String(s).padStart(2,'0')}`;
      }
    }, 1000);

  } catch (err) {
    showToast('Microphone access denied', 'error');
  }
}

function stopRecording() {
  if (mediaRecorder?.state === 'recording') {
    mediaRecorder.stop();
    document.getElementById('recordBtn')?.classList.remove('recording');
    document.getElementById('recStatus').textContent = 'Click to start recording';
  }
}

/* stored raw File/Blob reference so we can send it as FormData */
let uploadedSampleFile = null;

/* ── Training steps shown to user ─────────────────────────────────────── */
const TRAINING_STEPS = [
  { pct: 5,  label: 'Uploading audio sample…'          },
  { pct: 20, label: 'Cleaning audio & trimming silence…'},
  { pct: 35, label: 'Analyzing voice characteristics…' },
  { pct: 55, label: 'Extracting speaker embedding…'    },
  { pct: 70, label: 'Creating voiceprint / vector…'    },
  { pct: 80, label: 'Generating voice preview…'        },
  { pct: 95, label: 'Saving voice project…'            },
];

function _setBtnStep(btn, step) {
  if (!btn) return;
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      style="animation:vf-spin 1s linear infinite;flex-shrink:0">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    <span style="flex:1;text-align:left">${step.label}</span>
    <span style="opacity:.5;font-size:11px">${step.pct}%</span>`;
}

async function createVoiceProject() {
  const name = document.getElementById('cloneName')?.value?.trim();
  const desc = document.getElementById('cloneDesc')?.value?.trim();
  const lang = document.getElementById('cloneLang')?.value || 'en';

  if (!name) { showToast('Enter a voice name', 'error'); return; }
  if (!uploadedSampleFile && !uploadedSampleUrl) {
    showToast('Upload or record a voice sample first', 'error'); return;
  }

  const btn = document.getElementById('createCloneBtn');
  if (btn) {
    btn.disabled = true;
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.gap = '8px';
  }

  // Animate through steps while waiting for server
  let stepIdx = 0;
  _setBtnStep(btn, TRAINING_STEPS[stepIdx]);

  const stepTimer = setInterval(() => {
    stepIdx = Math.min(stepIdx + 1, TRAINING_STEPS.length - 2); // hold at second-to-last
    _setBtnStep(btn, TRAINING_STEPS[stepIdx]);
  }, 4000);

  showToast('Analyzing & cloning your voice with XTTS-v2…', 'info');

  try {
    // Build FormData — send raw audio directly to Python service
    const fd = new FormData();
    if (uploadedSampleFile) {
      fd.append('file', uploadedSampleFile, uploadedSampleFile.name || 'sample.webm');
    } else {
      const resp = await fetch(uploadedSampleUrl);
      const blob = await resp.blob();
      fd.append('file', blob, 'sample.webm');
    }
    fd.append('voice_name', name);
    fd.append('user_id', (typeof CV !== 'undefined' && CV?.getCurrentUser()?.id) || 'anon');
    fd.append('language', lang);

    const res = await fetch(`${VF.API_PYTHON}/voice-clone/upload-and-clone`, {
      method: 'POST',
      body: fd,
    });

    clearInterval(stepTimer);
    _setBtnStep(btn, TRAINING_STEPS[TRAINING_STEPS.length - 1]);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(err.detail || 'Clone failed');
    }

    const data = await res.json();
    const va   = data.voice_analysis || {};

    const project = {
      id:           data.voice_id,
      name,
      description:  desc,
      language:     lang,
      sampleUrl:    uploadedSampleUrl || '',
      previewUrl:   data.preview_url || '',
      modelPath:    data.model_path || '',
      embeddingPath:data.embedding_path || '',
      createdAt:    new Date().toISOString(),
      usageCount:   0,
      status:       data.status,
      // Voice characteristics from analysis
      voiceAnalysis: {
        duration:       va.duration          || 0,
        pitchHz:        va.pitch_hz          || 0,
        speakingRateWpm:va.speaking_rate_wpm || 0,
        loudnessLufs:   va.loudness_lufs     || 0,
        noiseDb:        va.noise_level_db    || 0,
        quality:        va.voice_quality     || 'unknown',
        warnings:       va.warnings          || [],
      },
    };

    cloneProjects.unshift(project);
    stats.voiceProjects = cloneProjects.length;
    saveToStorage();
    renderProjects();

    // Reset form
    document.getElementById('cloneName').value = '';
    document.getElementById('cloneDesc').value = '';
    uploadedSampleUrl  = null;
    uploadedSampleFile = null;
    ['uploadReady','recReady'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Show voice analysis in toast
    const quality = va.voice_quality || 'ok';
    const qualityEmoji = { excellent:'🌟', good:'✅', fair:'⚠️', poor:'❌' }[quality] || '✅';
    const pitched = va.pitch_hz ? ` · ${Math.round(va.pitch_hz)} Hz` : '';
    const badge = data.status === 'trained' ? 'AI Trained ✓' : 'Demo';
    showToast(`${qualityEmoji} "${name}" — ${badge}${pitched} · ${quality} quality`, 'success');

  } catch (err) {
    clearInterval(stepTimer);
    console.error('[createVoiceProject]', err);
    showToast('Clone failed: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.style.display = '';
      btn.style.alignItems = '';
      btn.style.gap = '';
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg> Create Voice Project`;
    }
  }
}

/* Generate speech from a cloned voice project — uses custom modal, no window.prompt() */
let _genModalProject = null;

function generateFromClone(project) {
  _genModalProject = project;
  const modal     = document.getElementById('vfGenModal');
  const nameSpan  = document.getElementById('vfGenModalVoiceName');
  const textarea  = document.getElementById('vfGenModalText');
  const counter   = document.getElementById('vfGenModalCount');
  if (!modal) return;
  if (nameSpan)  nameSpan.textContent = project.name;
  if (textarea)  { textarea.value = 'Hello! This is my AI cloned voice.'; }
  if (counter)   counter.textContent = textarea?.value?.length || 0;
  if (textarea)  textarea.oninput = () => { if (counter) counter.textContent = textarea.value.length; };
  modal.style.display = 'flex';
  setTimeout(() => textarea?.focus(), 80);
}

async function submitGenModal() {
  const project  = _genModalProject;
  const modal    = document.getElementById('vfGenModal');
  const textarea = document.getElementById('vfGenModalText');
  const btn      = document.getElementById('vfGenModalBtn');
  const text     = textarea?.value?.trim() || '';
  if (!text)    { showToast('Enter some text first', 'error'); return; }
  if (!project) { showToast('No voice selected', 'error'); return; }
  if (text.length > 500) { showToast('Keep text under 500 chars', 'error'); return; }

  if (modal) modal.style.display = 'none';
  if (btn)   { btn.disabled = true; btn.textContent = 'Generating…'; }

  showToast(`Generating speech in ${project.name}'s voice…`, 'info');

  try {
    const fd = new FormData();
    fd.append('voice_id', project.id);
    fd.append('text', text);
    fd.append('language', project.language || 'en');
    fd.append('speed', '0.85');
    fd.append('user_id', (typeof CV !== 'undefined' && CV?.getCurrentUser()?.id) || 'anon');

    const res = await fetch(`${VF.API_PYTHON}/voice-clone/generate-from-id`, {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Generation failed' }));
      throw new Error(err.detail || 'Generation failed');
    }

    const data = await res.json();

    // Update usage count
    const proj = cloneProjects.find(p => p.id === project.id);
    if (proj) { proj.usageCount = (proj.usageCount || 0) + 1; saveToStorage(); renderProjects(); }

    showAudioPlayer(data.audio_url, project.name + ' · ' + text.slice(0, 40));
    // Switch to TTS studio tab to show the audio player
    document.querySelectorAll('.vf-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.vf-tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('[data-tab="studio"]')?.classList.add('active');
    document.getElementById('tab-studio')?.classList.add('active');
    showToast('Generated in ' + project.name + "'s voice!", 'success');

  } catch (err) {
    console.error('[generateFromClone]', err);
    showToast('Generation failed: ' + err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '▶ Generate'; }
  }
}

function renderProjects() {
  const list  = document.getElementById('projectsList');
  const count = document.getElementById('cloneCount');
  if (!list) return;

  if (count) count.textContent = cloneProjects.length + ' project' + (cloneProjects.length !== 1 ? 's' : '');

  if (cloneProjects.length === 0) {
    list.innerHTML = `
      <div class="vf-empty-state vf-clone-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
        <p>No voice projects yet</p>
        <small>Upload a sample to create your first AI voice</small>
      </div>`;
    return;
  }

  const langName = { en:'English', hi:'Hindi', ta:'Tamil', te:'Telugu', kn:'Kannada', ml:'Malayalam', es:'Spanish', fr:'French' };
  const qualityColor = { excellent:'#C5FF3E', good:'#7EE8A2', fair:'#FFD166', poor:'#FF6B6B', unknown:'rgba(244,241,232,.4)' };
  const qualityEmoji = { excellent:'🌟', good:'✅', fair:'⚠️', poor:'❌', unknown:'' };

  list.innerHTML = cloneProjects.map(p => {
    const va = p.voiceAnalysis || {};
    const hasAnalysis = (va.pitchHz > 0 || va.quality) && va.quality !== 'unknown';
    const qualEmoji = qualityEmoji[va.quality] || '';

    // Voice characteristics chips
    const chips = [];
    if (va.pitchHz > 0)          chips.push(`🎵 ${Math.round(va.pitchHz)} Hz`);
    if (va.speakingRateWpm > 0)  chips.push(`⚡ ${Math.round(va.speakingRateWpm)} wpm`);
    if (va.duration > 0)         chips.push(`⏱ ${Math.round(va.duration)}s`);
    if (va.quality && va.quality !== 'unknown') chips.push(`${qualEmoji} ${va.quality}`);

    // Clean up description: truncate long strings, remove UUID-like fragments
    const rawDesc = (p.description || '').trim();
    const cleanDesc = rawDesc.length > 32 ? rawDesc.slice(0, 30) + '…' : rawDesc;

    const metaParts = [langName[p.language] || p.language];
    if (cleanDesc) metaParts.push(cleanDesc);
    metaParts.push(`${p.usageCount || 0} uses`);

    return `
    <div class="vf-project-card" data-id="${p.id}" style="flex-direction:column;align-items:stretch;gap:8px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="vf-project-avatar" style="${p.status==='trained'?'background:rgba(197,255,62,.12);border:1px solid rgba(197,255,62,.25);color:#C5FF3E;':'background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);color:#f59e0b;'}">${p.name[0].toUpperCase()}</div>
        <div class="vf-project-info" style="flex:1;min-width:0;overflow:hidden;">
          <div class="vf-project-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
          <div class="vf-project-meta" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${metaParts.join(' · ')}</div>
        </div>
        <div style="display:flex;align-items:center;gap:5px;flex-shrink:0;">
          <span class="vf-project-badge ${p.status === 'trained' ? 'ready' : 'demo'}">${p.status === 'trained' ? 'AI Trained' : 'Demo'}</span>
          ${p.status === 'trained' ? `
          <button class="vf-gen-btn" data-id="${p.id}" title="Generate speech in this voice"
            style="background:rgba(197,255,62,.12);border:1px solid rgba(197,255,62,.3);color:#C5FF3E;border-radius:8px;padding:5px 12px;font-size:11px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:.04em;white-space:nowrap;transition:.15s;">
            ▶ Generate
          </button>` : `
          <span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:rgba(244,241,232,.3);padding:5px 8px;">No embedding</span>`}
          ${p.previewUrl ? `
          <button class="vf-preview-btn" data-url="${p.previewUrl}" title="Play voice preview"
            style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(244,241,232,.65);border-radius:8px;padding:5px 10px;font-size:13px;cursor:pointer;transition:.15s;line-height:1;">
            ♪
          </button>` : ''}
          <button class="vf-project-del" data-id="${p.id}" title="Delete"
            style="background:transparent;border:none;color:rgba(255,255,255,.2);cursor:pointer;padding:5px;transition:.15s;line-height:1;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
      ${hasAnalysis && chips.length > 0 ? `
      <div style="display:flex;flex-wrap:wrap;gap:5px;padding-left:50px;">
        ${chips.map(c => `<span style="font-size:10px;font-family:'JetBrains Mono',monospace;background:rgba(197,255,62,.05);border:1px solid rgba(197,255,62,.15);border-radius:5px;padding:2px 8px;color:rgba(197,255,62,.7);letter-spacing:.04em;">${c}</span>`).join('')}
      </div>` : ''}
    </div>`;
  }).join('');

  // Wire buttons
  list.querySelectorAll('.vf-gen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const proj = cloneProjects.find(p => p.id === btn.dataset.id);
      if (proj) generateFromClone(proj);
    });
  });

  list.querySelectorAll('.vf-preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showAudioPlayer(btn.dataset.url, 'Voice Preview');
    });
  });

  list.querySelectorAll('.vf-project-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      cloneProjects = cloneProjects.filter(p => p.id !== id);
      stats.voiceProjects = cloneProjects.length;
      saveToStorage();
      renderProjects();
      showToast('Voice project deleted', 'success');
    });
  });
}

/* ══════════════════════════════════════════════
   VIDEO DUBBING
   ══════════════════════════════════════════════ */

function initDub() {
  const videoZone  = document.getElementById('videoUploadZone');
  const videoInput = document.getElementById('videoFileInput');
  const startBtn   = document.getElementById('startDubBtn');

  if (videoZone && videoInput) {
    videoZone.addEventListener('click', () => videoInput.click());
    videoZone.addEventListener('dragover', (e) => { e.preventDefault(); videoZone.classList.add('drag-over'); });
    videoZone.addEventListener('dragleave', () => videoZone.classList.remove('drag-over'));
    videoZone.addEventListener('drop', (e) => {
      e.preventDefault(); videoZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) handleVideoFile(file);
    });
    videoInput.addEventListener('change', () => {
      if (videoInput.files[0]) handleVideoFile(videoInput.files[0]);
    });
  }

  startBtn?.addEventListener('click', startDubbing);
}

function handleVideoFile(file) {
  if (!file.type.startsWith('video/')) { showToast('Please upload a video file', 'error'); return; }
  uploadedVideoUrl = URL.createObjectURL(file);
  const ready = document.getElementById('videoReady');
  const name  = document.getElementById('videoFileName');
  if (ready) ready.style.display = 'flex';
  if (name)  name.textContent = file.name;
  showToast('Video loaded: ' + file.name, 'success');
}

async function startDubbing() {
  if (!uploadedVideoUrl) { showToast('Upload a video first', 'error'); return; }

  const srcLang = document.getElementById('dubSrcLang')?.value;
  const tgtLang = document.getElementById('dubTgtLang')?.value;

  if (srcLang === tgtLang) { showToast('Source and target languages must be different', 'error'); return; }

  const btn = document.getElementById('startDubBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }

  // Show status card
  const statusCard = document.getElementById('dubStatusCard');
  if (statusCard) statusCard.style.display = 'block';

  setPill('warning', 'Processing');

  const steps = [
    'Extracting audio...',
    'Transcribing speech (Whisper)...',
    'Translating content...',
    'Generating dubbed voice (XTTS-v2)...',
    'Merging audio tracks...',
    'Exporting final video...',
  ];

  let step = 0;
  const totalSteps = steps.length;

  try {
    // Try real API
    const res = await fetch(`${VF.API_PYTHON}/video-dub/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url: uploadedVideoUrl, source_language: srcLang, target_language: tgtLang }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);

    if (res?.ok) {
      const data = await res.json();
      // Real polling
      pollDubJob(data.job_id || data.jobId);
      return;
    }
  } catch(e) { /* fall through to demo */ }

  // Demo simulation
  const interval = setInterval(() => {
    const progress = Math.round(((step + 1) / totalSteps) * 100);
    updateDubProgress(steps[step], progress);
    step++;

    if (step >= totalSteps) {
      clearInterval(interval);
      setPill('success', 'Complete');
      updateDubProgress('Dubbing complete! (demo mode)', 100);
      showToast('Video dubbed successfully! (demo)', 'success');
      if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/></svg> Start Dubbing'; }
    }
  }, 1200);
}

function pollDubJob(jobId) {
  let attempts = 0;
  dubPollingInterval = setInterval(async () => {
    attempts++;
    if (attempts > 60) { clearInterval(dubPollingInterval); setPill('error', 'Timeout'); return; }

    try {
      const res = await fetch(`${VF.API_PYTHON}/jobs/${jobId}`);
      const data = await res.json();
      const pct = data.status === 'completed' ? 100 : Math.min(attempts * 3, 95);
      updateDubProgress(getStepLabel(pct), pct);

      if (data.status === 'completed') {
        clearInterval(dubPollingInterval);
        setPill('success', 'Complete');
        showToast('Video dubbed!', 'success');
      } else if (data.status === 'failed') {
        clearInterval(dubPollingInterval);
        setPill('error', 'Failed');
      }
    } catch(e) {}
  }, 3000);
}

function getStepLabel(pct) {
  if (pct < 18) return 'Extracting audio...';
  if (pct < 35) return 'Transcribing speech...';
  if (pct < 55) return 'Translating content...';
  if (pct < 75) return 'Generating dubbed voice...';
  if (pct < 92) return 'Merging audio tracks...';
  return 'Exporting final video...';
}

function updateDubProgress(label, pct) {
  const fill  = document.getElementById('dubProgressFill');
  const step  = document.getElementById('dubStepLabel');
  const pctEl = document.getElementById('dubPct');
  if (fill)  fill.style.width = pct + '%';
  if (step)  step.textContent = label;
  if (pctEl) pctEl.textContent = pct + '%';
}

function setPill(type, text) {
  const pill = document.getElementById('dubStatusPill');
  if (!pill) return;
  pill.className = 'vf-status-pill ' + type;
  pill.textContent = text;
}

/* ══════════════════════════════════════════════
   HERO STATS
   ══════════════════════════════════════════════ */

function updateHeroStats() {
  const el = (id) => document.getElementById(id);
  if (el('hstatGens'))   el('hstatGens').textContent   = stats.totalGenerations;
  if (el('hstatVoices')) el('hstatVoices').textContent = cloneProjects.length;
  if (el('hstatChars'))  el('hstatChars').textContent  = stats.totalChars > 1000 ? Math.round(stats.totalChars/1000) + 'K' : stats.totalChars;
}

/* ══════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════ */

let toastTimeout;
function showToast(msg, type = 'success') {
  const t = document.getElementById('vfToast');
  if (!t) return;
  clearTimeout(toastTimeout);
  t.textContent = msg;
  t.className = `vf-toast show ${type}`;
  toastTimeout = setTimeout(() => {
    t.classList.remove('show');
  }, 3000);
}
