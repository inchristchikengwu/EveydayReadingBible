/**
 * 每日基督教靈修 PWA 後端
 * Apps Script 部署為 Web App 後，前端 PWA 會透過此 endpoint 讀取 Google Drive 中既有的 Google Docs。
 */
const FOLDER_ID = '1OJO_yM_pBxaXqFMdpoBE_2lwlOwp0sD5';
const APP_TOKEN = 'CHANGE_ME_TO_A_LONG_RANDOM_TOKEN';
const TIME_ZONE = 'Asia/Taipei';
const INDEX_CACHE_KEY = 'daily-devotion-index-v1';
const INDEX_CACHE_SECONDS = 600;

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const callback = sanitizeCallback_(params.callback || '');
  let payload;

  try {
    if (APP_TOKEN && params.token !== APP_TOKEN) {
      throw new Error('UNAUTHORIZED');
    }

    if (String(params.action || '').toLowerCase() === 'index') {
      payload = readDevotionIndex_(params.refresh === '1');
    } else {
      const date = normalizeDate_(params.date);
      payload = readDevotionByDate_(date);
    }
  } catch (error) {
    payload = {
      ok: false,
      error: String(error && error.message ? error.message : error)
    };
  }

  const json = JSON.stringify(payload);
  const output = callback ? `${callback}(${json});` : json;
  return ContentService
    .createTextOutput(output)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function readDevotionIndex_(forceRefresh) {
  const cache = CacheService.getScriptCache();
  if (!forceRefresh) {
    const cached = cache.get(INDEX_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  }

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  const latestByDate = {};

  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() !== MimeType.GOOGLE_DOCS) continue;

    const parsed = parseDevotionTitle_(file.getName());
    if (!parsed) continue;

    const item = {
      date: parsed.date,
      topic: parsed.topic,
      title: file.getName(),
      docId: file.getId(),
      docUrl: file.getUrl(),
      updatedAt: file.getLastUpdated().toISOString()
    };

    if (!latestByDate[item.date] || item.updatedAt > latestByDate[item.date].updatedAt) {
      latestByDate[item.date] = item;
    }
  }

  const items = Object.keys(latestByDate)
    .map((date) => latestByDate[date])
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));

  const payload = {
    ok: true,
    generatedAt: new Date().toISOString(),
    count: items.length,
    items
  };

  try {
    cache.put(INDEX_CACHE_KEY, JSON.stringify(payload), INDEX_CACHE_SECONDS);
  } catch (error) {
    // 索引過大時略過伺服器快取，不影響回傳。
  }

  return payload;
}

function readDevotionByDate_(date) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();

  let target = null;
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() !== MimeType.GOOGLE_DOCS) continue;

    const parsed = parseDevotionTitle_(file.getName());
    if (parsed && parsed.date === date) {
      if (!target || file.getLastUpdated() > target.getLastUpdated()) {
        target = file;
      }
    }
  }

  if (!target) {
    return {
      ok: false,
      error: 'NOT_FOUND',
      date,
      message: `找不到日期為「${date}」且標題符合「每日靈修 YYYY-MM-DD｜主題」的 Google Docs。`
    };
  }

  const doc = DocumentApp.openById(target.getId());
  const bodyText = doc.getBody().getText();
  const sections = splitSections_(bodyText);

  return {
    ok: true,
    date,
    title: target.getName(),
    docId: target.getId(),
    docUrl: target.getUrl(),
    updatedAt: target.getLastUpdated().toISOString(),
    sections,
    rawText: bodyText
  };
}

function parseDevotionTitle_(title) {
  const match = String(title || '').match(/^每日靈修\s+(\d{4}-\d{2}-\d{2})\s*[｜|]\s*(.+)$/);
  if (!match) return null;
  return { date: match[1], topic: match[2].trim() };
}

function splitSections_(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const sections = [];
  let current = null;
  let introLines = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (isSectionHeading_(trimmed)) {
      if (current) sections.push(current);
      else if (introLines.some((item) => item.trim())) sections.push(makeSection_('intro', '導言｜Introduction', introLines));
      current = makeSection_(sectionIdFor_(trimmed), trimmed.replace(/^◆\s*/, ''), []);
      return;
    }
    if (current) current.lines.push(line);
    else introLines.push(line);
  });

  if (current) sections.push(current);
  else if (introLines.some((item) => item.trim())) sections.push(makeSection_('content', '全文｜Full Text', introLines));

  return sections.map((section, index) => {
    section.lines = trimOuterBlankLines_(section.lines);
    section.shortTitle = shortTitle_(section.title);
    section.color = sectionColor_(index);
    section.symbol = sectionSymbol_(index);
    return section;
  }).filter((section) => section.lines.length || section.title);
}

function isSectionHeading_(line) {
  return /^◆\s+/.test(line) || /^◆/.test(line);
}

function makeSection_(id, title, lines) {
  return { id, title, lines: lines || [] };
}

function sectionIdFor_(title) {
  const checks = [
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

  for (let i = 0; i < checks.length; i++) {
    if (title.indexOf(checks[i][0]) !== -1) return checks[i][1];
  }

  return title.replace(/^◆\s*/, '').toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
}

function shortTitle_(title) {
  return String(title).replace(/^◆\s*/, '').split('｜')[0].split('|')[0].trim();
}

function sectionColor_(index) {
  const colors = ['#2a6f82', '#6f4e9b', '#287a57', '#b2602a', '#703775', '#1f6a96', '#914c2f', '#42733f'];
  return colors[index % colors.length];
}

function sectionSymbol_(index) {
  const symbols = ['◆', '✦', '✧', '▣', '❖', '◇', '●', '✺'];
  return symbols[index % symbols.length];
}

function trimOuterBlankLines_(lines) {
  const copy = lines.slice();
  while (copy.length && !copy[0].trim()) copy.shift();
  while (copy.length && !copy[copy.length - 1].trim()) copy.pop();
  return copy;
}

function normalizeDate_(value) {
  const fallback = Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd');
  const raw = String(value || fallback).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return fallback;
  return raw;
}

function sanitizeCallback_(callback) {
  const raw = String(callback || '').trim();
  return /^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(raw) ? raw : '';
}
