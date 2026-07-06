import React, {useEffect, useMemo, useState} from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Music, Heart, Sunrise, CalendarDays, Bell, Languages } from 'lucide-react';
import './style.css';

const devotions = [
  {
    theme:'住在基督裡，讓生命結果子',
    reference:'約翰福音 John 15:4–5',
    scriptureZh:'「你們要常在我裏面，我也常在你們裏面。枝子若不常在葡萄樹上，自己就不能結果子；你們若不常在我裏面，也是這樣。我是葡萄樹，你們是枝子；常在我裏面的，我也常在他裏面，這人就多結果子；因為離了我，你們就不能做甚麼。」（和合本修訂版）',
    scriptureEn:'“Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine… for apart from me you can do nothing.” (ESV)',
    meditationZh:'主耶穌不是先吩咐枝子製造果子，而是呼召枝子住在葡萄樹上。基督徒的生命不是離開基督之後靠意志修補自己，而是在與基督聯合中領受祂的生命供應。福音派與改革宗所強調的「與基督聯合」，提醒我們成聖不是自我改善工程；恢復傳統所說「享受基督作生命」，也可幫助我們看見，服事與生活的源頭必須是基督自己。今天的問題不是我能為主做多少，而是我是否在主裡面而活。',
    meditationEn:'Jesus does not first command the branch to manufacture fruit; he calls it to abide in the vine. Christian life is not self-repair apart from Christ but receiving his life through union with him. The evangelical and Reformed emphasis on union with Christ reminds us that sanctification is not a self-improvement project. The recovery tradition’s language of enjoying Christ as life can also help us see that service and daily living must flow from Christ himself.',
    practiceZh:'今天找五分鐘安靜讀三次：「我是葡萄樹，你們是枝子。」在一件容易焦慮的事上，先停三十秒轉向主，再開始處理。',
    practiceEn:'Take five quiet minutes and read three times: “I am the vine; you are the branches.” Before one anxiety-producing task, pause for thirty seconds, turn to the Lord, and then act.',
    prayerZh:'主耶穌，使我今天不憑自己掙扎，乃住在你裡面，從你領受生命、力量與恩典；願你在我裡面活，使我結出榮耀父神的果子。阿們。',
    prayerEn:'Lord Jesus, keep me from striving in myself today. Teach me to abide in You and receive life, strength, and grace from You. Live in me, and bear fruit through me for the glory of the Father. Amen.',
    hymnZh:'《與我同住》', hymnEn:'Abide with Me',
    hymnNoteZh:'這首詩歌把信徒最深的需要化成禱告：不是只有事情順利，而是主與我同住、我也住在祂裡面。',
    hymnNoteEn:'This hymn turns the believer’s deepest need into prayer: not merely better circumstances, but Christ abiding with us and we in him.',
    oneLineZh:'結果子不是焦慮地用力，而是持續地住在基督裡。',
    oneLineEn:'Fruitfulness is not anxious striving but sustained abiding in Christ.'
  },
  {
    theme:'恩典夠用', reference:'哥林多後書 2 Corinthians 12:9',
    scriptureZh:'「他對我說：『我的恩典是夠你用的，因為我的能力是在人的軟弱上顯得完全。』」（和合本修訂版）',
    scriptureEn:'“My grace is sufficient for you, for my power is made perfect in weakness.” (ESV)',
    meditationZh:'保羅三次求主挪去那根刺，主卻回答：「我的恩典是夠你用的。」神有時不先除去限制，而是在限制中把基督更深給我們。這不是浪漫化苦難，而是承認神的護理能使用我們不願選擇的處境，使我們不再倚靠天然能力。恩典不是叫人硬撐的口號，而是復活的基督在軟弱中托住我們。',
    meditationEn:'Paul pleaded three times for the thorn to be removed, yet the Lord answered, “My grace is sufficient for you.” God may not first remove the limitation; he may give Christ more deeply within it. This does not romanticize suffering. It confesses that divine providence can use even unwanted circumstances to free us from self-reliance. Grace is not a slogan for pushing harder; it is the risen Christ sustaining us in weakness.',
    practiceZh:'當你今天感到能力不足時，停六十秒：承認有限、相信恩典、交託下一步。只忠心完成眼前一件該做的事。',
    practiceEn:'When you feel inadequate today, pause for sixty seconds: admit your limitation, trust his grace, and entrust the next step to him. Faithfully do the one thing before you.',
    prayerZh:'主耶穌，赦免我害怕軟弱，也赦免我常靠自己證明自己。求你使我認識你的恩典今日仍然夠用，使你的能力在我的軟弱中顯得完全。阿們。',
    prayerEn:'Lord Jesus, forgive my fear of weakness and my desire to prove myself by my own strength. Teach me that Your grace is sufficient today, and make Your power perfect in my weakness. Amen.',
    hymnZh:'《奇異恩典》', hymnEn:'Amazing Grace',
    hymnNoteZh:'這首詩歌提醒我們，信徒從開始到末了都靠恩典，不是靠自己從不軟弱。',
    hymnNoteEn:'This hymn reminds us that believers are carried by grace from beginning to end, not by never being weak.',
    oneLineZh:'你的軟弱不是基督能力的終點，而可能是你重新倚靠祂的入口。',
    oneLineEn:'Your weakness is not the end of Christ’s power; it may be the doorway to deeper dependence.'
  },
  {
    theme:'安息在基督裡', reference:'馬太福音 Matthew 11:28',
    scriptureZh:'「凡勞苦擔重擔的人都到我這裏來，我要使你們得安息。」（和合本修訂版）',
    scriptureEn:'“Come to me, all who labor and are heavy laden, and I will give you rest.” (ESV)',
    meditationZh:'主給勞苦者的第一句話不是「做得更好」，而是「到我這裡來」。安息不是逃離責任，而是不再獨自背負人生。基督的軛不是壓碎人的宗教重擔，而是把我們帶入祂柔和謙卑的掌權中。真正的安息建立在基督已成就的救贖，不建立在我今天是否掌控所有結果。',
    meditationEn:'The Lord’s first word to the weary is not “perform better” but “come to me.” Rest is not escape from responsibility; it is no longer carrying life alone. Christ’s yoke is not a crushing religious burden but his gentle and humble lordship. True rest rests on his finished redemption, not on my control over outcomes.',
    practiceZh:'寫下今天最重的擔子，禱告：「主，這件事我要在你的主權下處理。」然後用平安的心做下一步。',
    practiceEn:'Write down your heaviest burden today and pray, “Lord, I will handle this under Your lordship.” Then take the next step with peace.',
    prayerZh:'主耶穌，我把重擔帶到你面前。求你使我在恩典中得安息，不逃避責任，也不憑自己掙扎。阿們。',
    prayerEn:'Lord Jesus, I bring my burdens to You. Give me rest in Your grace. Keep me from avoiding responsibility and from striving in self-reliance. Amen.',
    hymnZh:'《我心靈得安寧》', hymnEn:'It Is Well with My Soul',
    hymnNoteZh:'這首詩歌見證真正平安不是環境無風浪，而是靈魂因基督而安穩。',
    hymnNoteEn:'This hymn witnesses that true peace is not the absence of storms but the soul’s security in Christ.',
    oneLineZh:'安息不是沒有重擔，而是不再離開基督獨自背負。',
    oneLineEn:'Rest is not the absence of burdens, but no longer bearing them apart from Christ.'
  },
  {
    theme:'神的話照亮腳步', reference:'詩篇 Psalm 119:105',
    scriptureZh:'「你的話是我腳前的燈，是我路上的光。」（和合本修訂版）',
    scriptureEn:'“Your word is a lamp to my feet and a light to my path.” (ESV)',
    meditationZh:'神的話常不是一次照亮整條人生道路，而是先照亮腳前的一步。這使我們學習信靠，而不是要求掌控。基督徒讀經不是為了收集宗教資訊，而是在聖靈光照中被神的話帶回基督、分辨道路、悔改更新。神話語的權威也保守我們，使主觀感覺不取代聖經啟示。',
    meditationEn:'God’s word often does not illuminate the entire road at once; it gives light for the next step. This teaches trust rather than control. Christians read Scripture not to collect religious information, but to be brought back to Christ, discern the way, and be renewed by the Spirit. The authority of Scripture also protects us from replacing revelation with subjective feeling.',
    practiceZh:'今天選一節經文抄在手機備忘錄。遇到選擇或情緒波動時，先讀一次再回應。',
    practiceEn:'Write one verse in your phone notes. When facing a decision or emotional reaction, read it once before responding.',
    prayerZh:'父神，求你用你的話照亮我今天的腳步，使我不被情緒牽引，而被你的真理引導。阿們。',
    prayerEn:'Father, illuminate my steps today by Your word. Keep me from being driven by emotion and guide me by Your truth. Amen.',
    hymnZh:'《求主教我聽主話》', hymnEn:'Speak, O Lord',
    hymnNoteZh:'這首詩歌呼求神藉話語塑造我們，使讀經成為順服與更新。',
    hymnNoteEn:'This hymn asks God to shape us by his Word, making Scripture reading a path of obedience and renewal.',
    oneLineZh:'神的話不一定顯明整個地圖，卻足夠照亮下一步。',
    oneLineEn:'God’s word may not reveal the whole map, but it gives enough light for the next step.'
  },
  {
    theme:'在基督裡不被定罪', reference:'羅馬書 Romans 8:1',
    scriptureZh:'「如今，那些在基督耶穌裏的人就不被定罪了。」（和合本修訂版）',
    scriptureEn:'“There is therefore now no condemnation for those who are in Christ Jesus.” (ESV)',
    meditationZh:'「不被定罪」不是神降低聖潔標準，而是基督已在十字架上擔當罪的審判。信徒的平安不是建立在今日表現完美，而是建立在「在基督裡」。因此，悔改不是回到恐懼中自我懲罰，而是回到福音裡被潔淨、被恢復。真正的成聖從無定罪的恩典中長出，不是從控告中長出。',
    meditationEn:'“No condemnation” does not mean God lowers his holiness. It means Christ has borne judgment at the cross. The believer’s peace is not grounded in perfect performance today but in being “in Christ.” Repentance is not self-punishment in fear; it is returning to the gospel for cleansing and restoration. True sanctification grows from grace, not accusation.',
    practiceZh:'若今天良心被提醒，立刻向主承認，不延遲也不自責沉溺；用羅馬書八章一節宣告福音。',
    practiceEn:'If your conscience is awakened today, confess quickly to the Lord without delay or self-condemnation. Declare Romans 8:1 over your heart.',
    prayerZh:'主耶穌，謝謝你擔當我的定罪。求你使我在恩典中悔改，在真理中行走，不再活在控告之下。阿們。',
    prayerEn:'Lord Jesus, thank You for bearing my condemnation. Lead me to repent in grace and walk in truth, no longer living under accusation. Amen.',
    hymnZh:'《我聽主聲歡迎》', hymnEn:'I Hear Thy Welcome Voice',
    hymnNoteZh:'這首詩歌呼應罪人因主寶血坦然來到神前，與羅馬書八章的福音確據相合。',
    hymnNoteEn:'This hymn echoes the sinner coming confidently by Christ’s blood, fitting the gospel assurance of Romans 8.',
    oneLineZh:'在基督裡，悔改不是回到定罪，而是回到恩典。',
    oneLineEn:'In Christ, repentance is not a return to condemnation but a return to grace.'
  },
  {
    theme:'先求神的國', reference:'馬太福音 Matthew 6:33',
    scriptureZh:'「你們要先求神的國和他的義，這些東西都要加給你們了。」（和合本修訂版）',
    scriptureEn:'“But seek first the kingdom of God and his righteousness, and all these things will be added to you.” (ESV)',
    meditationZh:'主耶穌不是否認我們有食物、衣服、工作與未來的需要；祂是在重新排列我們的愛與優先次序。焦慮常把受造物放在中心，使神成為達成目標的工具。但天父知道我們的需要。先求神的國，不是輕看責任，而是在所有責任中承認神的主權與義。',
    meditationEn:'Jesus does not deny our needs for food, clothing, work, and the future. He reorders our loves and priorities. Anxiety often places created things at the center and turns God into a tool for our goals. But the Father knows our needs. Seeking first the kingdom does not despise responsibility; it acknowledges God’s reign and righteousness within every responsibility.',
    practiceZh:'今天做行程安排前，先問：「這件事如何在神的國與義中被擺正？」刪去一件不必要卻餵養焦慮的事。',
    practiceEn:'Before planning today, ask: “How can this be rightly ordered under God’s kingdom and righteousness?” Remove one unnecessary thing that feeds anxiety.',
    prayerZh:'天父，求你重整我的優先次序，使我先求你的國和你的義，並信靠你知道我的需要。阿們。',
    prayerEn:'Father, reorder my priorities. Teach me to seek first Your kingdom and righteousness, and to trust that You know my needs. Amen.',
    hymnZh:'《願你國降臨》', hymnEn:'Let Your Kingdom Come',
    hymnNoteZh:'這首詩歌把神國的盼望化為今日順服的禱告。',
    hymnNoteEn:'This hymn turns the hope of God’s kingdom into a prayer for present obedience.',
    oneLineZh:'焦慮問「我會不會失去」；信心問「神的國在這裡如何掌權」。',
    oneLineEn:'Anxiety asks, “What might I lose?” Faith asks, “How does God’s kingdom reign here?”'
  },
  {
    theme:'基督是我們的生命', reference:'歌羅西書 Colossians 3:3–4',
    scriptureZh:'「因為你們已經死了，你們的生命與基督一同藏在神裏面。基督是你們的生命，他顯現的時候，你們也要與他一同在榮耀裏顯現。」（和合本修訂版）',
    scriptureEn:'“For you have died, and your life is hidden with Christ in God. When Christ who is your life appears, then you also will appear with him in glory.” (ESV)',
    meditationZh:'保羅沒有只說基督改善我們的生命，而說「基督是你們的生命」。信徒的身份被藏在基督裡，不由成就、失敗、他人評價或當下情緒定義。恢復傳統常強調基督作生命，若放在歌羅西書的基督至上中理解，就會指向一個穩固真理：我們不是把基督加在舊生命上，而是在祂裡面有新生命。',
    meditationEn:'Paul does not merely say Christ improves our life; he says Christ is our life. The believer’s identity is hidden with Christ and is not defined by achievement, failure, others’ opinions, or present emotions. The recovery tradition often stresses Christ as life; read within Colossians’ vision of Christ’s supremacy, this points to a firm truth: we do not add Christ to the old life; we have new life in him.',
    practiceZh:'今天遇到自我懷疑時，說：「我的生命與基督一同藏在神裡面。」讓這真理重新定義你。',
    practiceEn:'When self-doubt arises today, say: “My life is hidden with Christ in God.” Let this truth redefine you.',
    prayerZh:'主耶穌，你是我的生命。求你使我不被外在評價支配，而在你裡面穩固生活。阿們。',
    prayerEn:'Lord Jesus, You are my life. Keep me from being ruled by external evaluation, and establish me in You. Amen.',
    hymnZh:'《基督是我的生命》', hymnEn:'Christ Is My Life',
    hymnNoteZh:'這首主題詩歌直接呼應歌羅西書三章，使信徒以基督自己為生命與盼望。',
    hymnNoteEn:'This hymn theme directly echoes Colossians 3, centering the believer’s life and hope in Christ himself.',
    oneLineZh:'基督不只是幫助你生活；祂自己就是你的生命。',
    oneLineEn:'Christ does not merely help you live; Christ himself is your life.'
  }
];

function getIndex(date=new Date()){
  const start = new Date('2026-07-06T00:00:00+08:00');
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const base = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diff = Math.floor((today-base)/86400000);
  return ((diff % devotions.length)+devotions.length)%devotions.length;
}

function installReminder(){
  const text = 'iPhone 的 PWA 目前通常不能保證每天固定時間自動推播；建議在 iPhone「提醒事項」或「捷徑自動化」設每天 6:00 打開本 App。';
  alert(text);
}

function Section({icon:Icon,titleZh,titleEn,children}){
  return <section className="card"><div className="section-title"><Icon size={20}/><div><h2>{titleZh}</h2><p>{titleEn}</p></div></div>{children}</section>
}
function Pair({zh,en}){return <div className="pair"><p className="zh">{zh}</p><p className="en">{en}</p></div>}

function App(){
  const [offset,setOffset]=useState(0);
  const [langMode,setLangMode]=useState('both');
  const baseIndex=getIndex();
  const data=devotions[(baseIndex+offset+devotions.length)%devotions.length];
  const date=useMemo(()=>{const d=new Date(); d.setDate(d.getDate()+offset); return d;},[offset]);
  useEffect(()=>{if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}},[]);
  return <main>
    <header className="hero">
      <div className="topbar"><span className="pill"><Sunrise size={16}/> 每日 6:00 靈修</span><button className="ghost" onClick={()=>setLangMode(langMode==='both'?'zh':'both')}><Languages size={16}/>{langMode==='both'?'只看中文':'中英對照'}</button></div>
      <h1>{data.theme}</h1>
      <p className="subtitle">繁體中文・和合本修訂版 / ESV・基督中心默想・詩歌推薦</p>
      <div className="dateRow"><button onClick={()=>setOffset(offset-1)}>前一天</button><span><CalendarDays size={16}/>{date.toLocaleDateString('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}</span><button onClick={()=>setOffset(offset+1)}>後一天</button></div>
    </header>

    <Section icon={BookOpen} titleZh="今日經文" titleEn="Scripture">
      <h3>{data.reference}</h3>
      {(langMode==='both'||langMode==='zh') && <blockquote>{data.scriptureZh}</blockquote>}
      {langMode==='both' && <blockquote className="enQuote">{data.scriptureEn}</blockquote>}
    </Section>

    <Section icon={Heart} titleZh="今日默想" titleEn="Meditation"><Pair zh={data.meditationZh} en={langMode==='both'?data.meditationEn:null}/></Section>
    <Section icon={BookOpen} titleZh="今日操練" titleEn="Practice"><Pair zh={data.practiceZh} en={langMode==='both'?data.practiceEn:null}/></Section>
    <Section icon={Heart} titleZh="今日禱告" titleEn="Prayer"><Pair zh={data.prayerZh} en={langMode==='both'?data.prayerEn:null}/></Section>
    <Section icon={Music} titleZh="今日詩歌" titleEn="Hymn">
      <div className="hymn"><strong>{data.hymnZh}</strong><span>{data.hymnEn}</span></div>
      <Pair zh={data.hymnNoteZh} en={langMode==='both'?data.hymnNoteEn:null}/>
    </Section>
    <section className="oneLine"><p>{data.oneLineZh}</p>{langMode==='both' && <p>{data.oneLineEn}</p>}</section>
    <button className="reminder" onClick={installReminder}><Bell size={18}/> 如何在 iPhone 設每天 6:00 提醒</button>
    <footer>此 PWA 為靜態版：已內建多篇靈修並每日輪播；若要真正每日由 AI 生成新文，需另接後端 API。</footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App/>);
