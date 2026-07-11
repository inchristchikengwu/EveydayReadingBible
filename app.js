const STORAGE_KEYS = {
  endpoint: 'dailyDevotion.endpoint',
  token: 'dailyDevotion.token',
  fontSize: 'dailyDevotion.fontSize',
  lastPayload: 'dailyDevotion.lastPayload'
};

const SECTION_COLORS = [
  '#2a6f82', '#6f4e9b', '#287a57', '#b2602a', '#703775', '#1f6a96', '#914c2f', '#42733f'
];

const SECTION_SYMBOLS = ['◆', '✦', '✧', '▣', '❖', '◇', '●', '✺'];

const KNOWN_SECTION_IDS = [
  ['今日經文', 'scripture'],
  ['經文脈絡', 'context'],
  ['深度默想', 'meditation'],
  ['今日可實行的操練', 'practice'],
  ['Practice for Today', 'practice'],
  ['今日禱告', 'prayer'],
  ['Prayer', 'prayer'],
  ['今日詩歌', 'hymn'],
  ['Hymn for Today', 'hymn'],
  ['延伸閱讀', 'further-reading'],
  ['Further Reading', 'further-reading'],
  ['今日一句話', 'one-sentence'],
  ['Today’s One Sentence', 'one-sentence'],
  ["Today's One Sentence", 'one-sentence']
];

const $ = (id) => document.getElementById(id);

const els = {
  settingsToggle: $('settingsToggle'),
  settingsPanel: $('settingsPanel'),
  endpointInput: $('endpointInput'),
  tokenInput: $('tokenInput'),
  saveSettingsBtn: $('saveSettingsBtn'),
  clearSettingsBtn: $('clearSettingsBtn'),
  settingsStatus: $('settingsStatus'),
  dateInput: $('dateInput'),
  loadBtn: $('loadBtn'),
  todayBtn: $('todayBtn'),
  openDocBtn: $('openDocBtn'),
  fontDownBtn: $('fontDownBtn'),
  fontUpBtn: $('fontUpBtn'),
  fontResetBtn: $('fontResetBtn'),
  appStatus: $('appStatus'),
  metaPanel: $('metaPanel'),
  devotionDate: $('devotionDate'),
  devotionTitle: $('devotionTitle'),
  devotionUpdated: $('devotionUpdated'),
  sectionNav: $('sectionNav'),
  reader: $('reader')
};

let state = {
  payload: null,
  activeSection: 'all',
  fontSize: Number(localStorage.getItem(STORAGE_KEYS.fontSize) || 18)
};

init();

function init() {
  els.dateInput.value = taipeiDateString(new Date());
  els.endpointInput.value = localStorage.getItem(STORAGE_KEYS.endpoint) || '';
  els.tokenInput.value = localStorage.getItem(STORAGE_KEYS.token) || '';
  applyFontSize(state.fontSize);
  wireEvents();
  restoreCachedPayload();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function wireEvents() {
  els.settingsToggle.addEventListener('click', () => {
    const isHidden = els.settingsPanel.classList.toggle('hidden');
    els.settingsToggle.setAttribute('aria-expanded', String(!isHidden));
  });

  els.saveSettingsBtn.addEventListener('click', () => {
    const endpoint = els.endpointInput.value.trim();
    const token = els.tokenInput.value.trim();
    if (!endpoint) {
      setStatus(els.settingsStatus, '請先貼上 Apps Script Web App URL。', true);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.endpoint, endpoint);
    localStorage.setItem(STORAGE_KEYS.token, token);
    setStatus(els.settingsStatus, '設定已儲存。現在可以按「讀取」。');
    setStatus(els.appStatus, '設定已儲存。');
  });

  els.clearSettingsBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.endpoint);
    localStorage.removeItem(STORAGE_KEYS.token);
    els.endpointInput.value = '';
    els.tokenInput.value = '';
    setStatus(els.settingsStatus, '設定已清除。');
  });

  els.todayBtn.addEventListener('click', () => {
    els.dateInput.value = taipeiDateString(new Date());
    loadDevotion();
  });

  els.loadBtn.addEventListener('click', loadDevotion);

  els.openDocBtn.addEventListener('click', () => {
    if (state.payload?.docUrl) window.open(state.payload.docUrl, '_blank', 'noopener');
  });

  els.fontDownBtn.addEventListener('click', () => changeFontSize(-1));
  els.fontUpBtn.addEventListener('click', () => changeFontSize(1));
  els.fontResetBtn.addEventListener('click', () => {
    state.fontSize = 18;
    applyFontSize(state.fontSize);
  });
}

function taipeiDateString(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function setStatus(el, message, isError = false) {
  el.textContent = message;
  el.style.color = isError ? '#a13b2d' : '';
}

function changeFontSize(delta) {
  state.fontSize = Math.min(30, Math.max(15, state.fontSize + delta));
  applyFontSize(state.fontSize);
}

function applyFontSize(size) {
  document.documentElement.style.setProperty('--reader-size', `${size}px`);
  localStorage.setItem(STORAGE_KEYS.fontSize, String(size));
}

function restoreCachedPayload() {
  const cached = localStorage.getItem(STORAGE_KEYS.lastPayload);
  if (!cached) return;

  try {
    const payload = JSON.parse(cached);
    if (payload?.ok) {
      state.payload = payload;
      renderPayload(payload, true);
      setStatus(els.appStatus, `已顯示上次快取：${payload.date || ''}。按「讀取」可更新。`);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEYS.lastPayload);
  }
}

async function loadDevotion() {
  const endpoint = localStorage.getItem(STORAGE_KEYS.endpoint) || '';
  const token = localStorage.getItem(STORAGE_KEYS.token) || '';
  const date = els.dateInput.value || taipeiDateString(new Date());

  if (!endpoint) {
    els.settingsPanel.classList.remove('hidden');
    els.settingsToggle.setAttribute('aria-expanded', 'true');
    setStatus(els.appStatus, '請先在「設定」貼上 Google Apps Script Web App URL。', true);
    return;
  }

  setStatus(els.appStatus, `讀取 ${date} 的每日靈修中…`);
  els.loadBtn.disabled = true;

  try {
    const payload = await jsonpRequest(endpoint, { date, token });
    if (!payload.ok) {
      throw new Error(payload.message || payload.error || '讀取失敗');
    }

    state.payload = payload;
    state.activeSection = 'all';
    localStorage.setItem(STORAGE_KEYS.lastPayload, JSON.stringify(payload));
    renderPayload(payload, false);
    setStatus(els.appStatus, '讀取完成。');
  } catch (error) {
    setStatus(els.appStatus, friendlyError(error), true);
  } finally {
    els.loadBtn.disabled = false;
  }
}

function jsonpRequest(baseUrl, params) {
  return new Promise((resolve, reject) => {
    const callbackName = `dailyDevotionCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
    url.searchParams.set('callback', callbackName);

    const script = document.createElement('script');
    const cleanup = () => {
      delete window[callbackName];
      script.remove();
      clearTimeout(timer);
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('連線逾時，請確認 Apps Script URL 與部署權限。'));
    }, 20000);

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('無法連線到 Apps Script。請確認 Web App URL 是否正確。'));
    };

    script.src = url.toString();
    document.head.appendChild(script);
  });
}

function friendlyError(error) {
  const msg = String(error?.message || error);
  if (msg.includes('UNAUTHORIZED')) return 'Token 不正確，請檢查設定中的讀取 Token。';
  if (msg.includes('NOT_FOUND')) return '找不到當日靈修。請確認 Google Docs 標題格式為「每日靈修 YYYY-MM-DD｜主題」，且在「每日靈修」資料夾內。';
  return msg;
}

function renderPayload(payload, fromCache) {
  els.metaPanel.classList.remove('hidden');
  els.devotionDate.textContent = `日期：${payload.date}${fromCache ? '（快取）' : ''}`;
  els.devotionTitle.textContent = payload.title || '每日靈修';
  els.devotionUpdated.textContent = payload.updatedAt ? `Google Drive 更新時間：${formatTime(payload.updatedAt)}` : '';
  els.openDocBtn.disabled = !payload.docUrl;

  renderSectionNav(payload.sections || []);
  renderReader(payload.sections || []);
}

function formatTime(iso) {
  try {
    return new Intl.DateTimeFormat('zh-Hant-TW', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Taipei'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function renderSectionNav(sections) {
  els.sectionNav.innerHTML = '';
  if (!sections.length) {
    els.sectionNav.classList.add('hidden');
    return;
  }

  const allBtn = makeSectionButton('全部', 'all');
  els.sectionNav.appendChild(allBtn);

  sections.forEach((section) => {
    const btn = makeSectionButton(section.shortTitle || section.title, section.id);
    els.sectionNav.appendChild(btn);
  });

  els.sectionNav.classList.remove('hidden');
}

function makeSectionButton(label, id) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `section-chip ${state.activeSection === id ? 'active' : ''}`;
  btn.textContent = label;
  btn.addEventListener('click', () => {
    state.activeSection = id;
    document.querySelectorAll('.section-chip').forEach((chip) => chip.classList.remove('active'));
    btn.classList.add('active');
    renderReader(state.payload?.sections || []);
  });
  return btn;
}

function renderReader(sections) {
  els.reader.innerHTML = '';

  const visible = state.activeSection === 'all'
    ? sections
    : sections.filter((section) => section.id === state.activeSection);

  if (!visible.length) {
    els.reader.innerHTML = `<div class="empty-state"><h2>此單元沒有內容</h2><p>請選擇其他單元或重新讀取。</p></div>`;
    return;
  }

  visible.forEach((section, index) => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'devotion-section';
    sectionEl.style.setProperty('--section-color', section.color || SECTION_COLORS[index % SECTION_COLORS.length]);

    const heading = document.createElement('h2');
    const symbol = document.createElement('span');
    symbol.className = 'section-symbol';
    symbol.textContent = section.symbol || SECTION_SYMBOLS[index % SECTION_SYMBOLS.length];
    heading.appendChild(symbol);
    heading.appendChild(document.createTextNode(section.title));
    sectionEl.appendChild(heading);

    (section.lines || []).forEach((line) => {
      const p = document.createElement('p');
      p.className = classifyLine(line);
      appendTextWithLinks(p, line);
      sectionEl.appendChild(p);
    });

    els.reader.appendChild(sectionEl);
  });
}

function classifyLine(line) {
  const classes = ['devotion-line'];
  if (/^[A-Za-z0-9“”"'’:,;!?() -]+$/.test(line) && /[A-Za-z]/.test(line)) classes.push('english');
  if (/^(中文|English|簡介|Introduction|與今日經文的關聯|Relation to Today|YouTube|Key sentence|中文歌名|常見英文歌名)[：:]?$/.test(line.trim())) classes.push('subhead');
  if (/^「.*」$|^“.*”$/.test(line.trim())) classes.push('quote');
  if (/安靜，不是|Stillness does not|我不必等風浪|I do not need/.test(line)) classes.push('key');
  return classes.join(' ');
}

function appendTextWithLinks(element, text) {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      element.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const a = document.createElement('a');
    a.href = match[0];
    a.textContent = match[0];
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'devotion-link';
    element.appendChild(a);

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    element.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}
