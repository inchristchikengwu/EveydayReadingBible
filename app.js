const state = {
  devotion: null,
  tab: 'scripture',
  scale: Number(localStorage.getItem('fontScale') || 1),
  showAll: false,
};

const fallback = {
  date: new Date().toISOString().slice(0, 10),
  title: { zh: '在基督裡得著今日的供應', en: 'Receiving Today’s Supply in Christ' },
  scripture: {
    reference: '約翰福音 John 15:5',
    rcuv: '「我是葡萄樹，你們是枝子。常在我裡面的，我也常在他裡面，這人就多結果子；因為離了我，你們就不能做甚麼。」',
    esv: '“I am the vine; you are the branches… apart from me you can do nothing.”'
  },
  meditation: {
    zh: '主耶穌不是先要求枝子製造生命，乃是呼召枝子常住在葡萄樹上。基督徒的生活不是離開基督之後靠意志維持敬虔，而是在與基督聯合中領受祂的生命供應。今天若感到疲倦，主不是先問你能做多少，乃是呼召你回到祂自己裡面。真正的結果子，從住在基督裡開始。',
    en: 'The Lord Jesus does not first demand that branches manufacture life; He calls them to abide in the vine. The Christian life is not self-sustained religious effort apart from Christ, but the receiving of His life in union with Him. If you feel weary today, Christ first calls you back to Himself. True fruitfulness begins with abiding in Him.'
  },
  practice: {
    zh: '今天找三分鐘安靜讀約翰福音15:5三次，然後在一件讓你焦慮的事上，先停下來呼求主，再開始處理。',
    en: 'Take three quiet minutes today to read John 15:5 three times. Before handling one anxiety-producing task, pause, call on the Lord, and then proceed.'
  },
  prayer: {
    zh: '主耶穌，使我今天不離開你而憑自己生活。求你教我住在你裡面，從你領受生命與力量，並結出榮耀父的果子。阿們。',
    en: 'Lord Jesus, keep me from living apart from You in self-reliance. Teach me to abide in You, receive life and strength from You, and bear fruit that glorifies the Father. Amen.'
  },
  hymn: {
    title_zh: '住在你裡面',
    title_en: 'Abide in Me',
    relation_zh: '這首詩歌呼應約翰福音15章「住在基督裡」的主題，幫助我們把倚靠基督從道理轉為禱告。',
    relation_en: 'This hymn echoes John 15 and helps turn the doctrine of abiding in Christ into prayerful dependence.'
  },
  sentence: {
    zh: '屬靈生命不是靠自己製造果子，而是住在基督裡領受祂的供應。',
    en: 'Spiritual life is not manufacturing fruit by ourselves, but receiving Christ’s supply by abiding in Him.'
  }
};

function escapeHtml(str = '') {
  return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function bilingual(zh, en) {
  return `<h4><span class="label">中文</span></h4><p>${escapeHtml(zh)}</p><h4><span class="label">English</span></h4><p class="en">${escapeHtml(en)}</p>`;
}

const renderers = {
  scripture(d) {
    return `<h3>今日經文｜Today’s Scripture</h3>
      <p><strong>${escapeHtml(d.scripture.reference)}</strong></p>
      <div class="quote"><span class="label">和合本修訂版 RCUV</span><p>${escapeHtml(d.scripture.rcuv)}</p></div>
      <div class="quote"><span class="label">ESV</span><p class="en">${escapeHtml(d.scripture.esv)}</p></div>`;
  },
  meditation(d) { return `<h3>今日默想｜Today’s Meditation</h3>${bilingual(d.meditation.zh, d.meditation.en)}`; },
  practice(d) { return `<h3>今日可實行的操練｜Today’s Practice</h3>${bilingual(d.practice.zh, d.practice.en)}`; },
  prayer(d) { return `<h3>今日禱告｜Today’s Prayer</h3>${bilingual(d.prayer.zh, d.prayer.en)}`; },
  hymn(d) { return `<h3>今日詩歌｜Today’s Hymn</h3>
    <p><strong>${escapeHtml(d.hymn.title_zh)}</strong>${d.hymn.title_en ? `｜<span class="en">${escapeHtml(d.hymn.title_en)}</span>` : ''}</p>
    ${bilingual(d.hymn.relation_zh, d.hymn.relation_en)}`; },
  sentence(d) { return `<h3>今日一句話｜Today’s One Sentence</h3>${bilingual(d.sentence.zh, d.sentence.en)}`; }
};

function render() {
  const d = state.devotion || fallback;
  document.documentElement.style.setProperty('--reader-scale', state.scale);
  document.getElementById('fontSizeLabel').textContent = `${Math.round(state.scale * 100)}%`;
  document.getElementById('dateLine').textContent = `${d.date || ''}｜每日靈修`;
  document.getElementById('titleZh').textContent = d.title?.zh || '今日靈修';
  document.getElementById('titleEn').textContent = d.title?.en || '';
  document.querySelectorAll('.tab').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === state.tab));
  const content = document.getElementById('content');
  if (state.showAll) {
    content.classList.add('full');
    content.innerHTML = Object.keys(renderers).map(key => `<section>${renderers[key](d)}</section>`).join('');
  } else {
    content.classList.remove('full');
    content.innerHTML = renderers[state.tab](d);
  }
}

async function loadDevotion() {
  const status = document.getElementById('status');
  try {
    const res = await fetch(`./data/today.json?ts=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.devotion = await res.json();
    status.textContent = '已載入今日 AI 生成靈修。';
  } catch (err) {
    state.devotion = fallback;
    status.textContent = '尚未找到今日 AI 生成內容，暫時顯示內建範例。請確認 GitHub Actions 與 OPENAI_API_KEY 已設定。';
  }
  render();
}

document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
  state.tab = btn.dataset.tab;
  state.showAll = false;
  document.getElementById('showAllBtn').textContent = '顯示全文';
  render();
}));
document.getElementById('fontPlus').addEventListener('click', () => { state.scale = Math.min(1.6, state.scale + .1); localStorage.setItem('fontScale', state.scale); render(); });
document.getElementById('fontMinus').addEventListener('click', () => { state.scale = Math.max(.85, state.scale - .1); localStorage.setItem('fontScale', state.scale); render(); });
document.getElementById('refreshBtn').addEventListener('click', loadDevotion);
document.getElementById('showAllBtn').addEventListener('click', (e) => { state.showAll = !state.showAll; e.target.textContent = state.showAll ? '回到分頁' : '顯示全文'; render(); });

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e;
  const btn = document.getElementById('installBtn'); btn.hidden = false;
  btn.onclick = async () => { btn.hidden = true; deferredPrompt.prompt(); deferredPrompt = null; };
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
loadDevotion();
