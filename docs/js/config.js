// ===== CONFIG.js - 生肖天机 =====


// ===== 游戏数据 =====
const SAVE_KEY = 'sx_sg_v1';
const LICON = ['🐣','🐥','🐤','🦅','🐦','🕊','🦋','🐉','🦅','🐲','🐍','🐎','🐉','🐲','🐉🔥'];
const LNAME = ['','灵蛋','幼灵','化形','灵通','化星','凝神','通灵','灵兽','神兽','天兽','圣兽','天命','天尊','天帝','鸿蒙'];
const COIN_S = [0,1,3,8,20,55,150,400,1100,3000,8000,20000,50000,120000,300000,800000];
const FATE_E = ['🪵','🔥','🟤','⚪','💧'];
const FATE_C = [1,1.5,1,1,1];
const FATE_Q = [1,1,1,1,1.5];
const FATE_N = ['木','火','土','金','水'];
const ZOD_E  = ['🐀','🐂','🐅','🐇','🐉','🐍','🐎','🐏','🐒','🐓','🐕','🐖'];
const ZOD_N  = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const YUN_NAMES  = ['极凶','小凶','平','小吉','大吉'];
const YUN_COIN   = [-.5,-.2,0,.3,.5];

let _audioCtx = null;
let _audioState = { muted: false, volume: 0.7, bgmVolume: 0.35, sfxVolume: 0.8, bgmLast: 0.35, sfxLast: 0.8 };

function initAudio() {
  if (_audioCtx) return;
  try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}

function playSound(type) {
  if (!_audioCtx || _audioState.muted) return;
  const now = _audioCtx.currentTime;
  const v = _audioState.sfxVolume;
  const mk = (freq, dur, vol=v, t=0, wave='sine') => {
    const o = _audioCtx.createOscillator();
    const g = _audioCtx.createGain();
    o.connect(g); g.connect(_audioCtx.destination);
    o.type = wave;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol * .25, now + t);
    g.gain.exponentialRampToValueAtTime(.001, now + t + dur);
    o.start(now + t); o.stop(now + t + dur);
  };
  switch(type) {
    case 'notif':   mk(880, .08, .6); mk(1100, .12, .4, .07); break;
    case 'error':   mk(120, .25, .5); break;
    case 'achieve': mk(523, .3, .7); mk(659, .3, .6, .15); mk(784, .4, .5, .3); break;
    case 'refresh': mk(330, 1.5, .5); mk(440, 1.5, .4, .1); break;
    case 'summon_z1': mk(80, .5, .9); mk(100, .4, .8, .1); mk(55, .8, .7, .2); break;
    case 'summon_z0': mk(600, .08, .7); mk(900, .07, .5, .06); mk(1200, .1, .4, .12); break;
    case 'summon_z2': mk(75, .5, .9); mk(70, .4, .8, .15); break;
    case 'summon_z3': mk(200, .25, .8, 0, 'sawtooth'); mk(250, .2, .7, .12, 'sawtooth'); break;
    case 'summon_z4': mk(900, .06, .7); mk(1100, .06, .5, .08); mk(1300, .08, .4, .16); break;
    case 'merge_z1': mk(150, .3, .8, 0, 'sawtooth'); mk(200, .25, .7, .15, 'sawtooth'); mk(120, .5, .6, .3, 'sawtooth'); break;
    case 'achieve_z1': mk(220, .4, .9); mk(330, .4, .8, .2); mk(440, .6, .7, .4); break;
    case 'summon_z5': mk(600, .12, .7); mk(400, .15, .5, .1); mk(300, .2, .4, .2); break;
    case 'merge_z5': mk(800, .08, .6); mk(600, .1, .5, .06); mk(400, .15, .4, .12); break;
    case 'achieve_z5': mk(400, .2, .7); mk(300, .25, .6, .15); mk(200, .35, .5, .3); break;
    case 'summon_z6': mk(300, .1, .8); mk(450, .1, .7, .06); mk(600, .15, .6, .12); break;
    case 'merge_z6': mk(200, .15, .7); mk(200, .15, .7, .1); mk(200, .15, .7, .2); break;
    case 'achieve_z6': mk(440, .3, .8); mk(550, .3, .7, .18); mk(660, .5, .6, .36); break;
    case 'summon_z7': mk(500, .1, .7); mk(625, .1, .6, .08); mk(750, .12, .5, .15); break;
    case 'merge_z7': mk(440, .08, .6); mk(550, .08, .5, .05); mk(660, .08, .4, .1); break;
    case 'achieve_z7': mk(523, .3, .7); mk(659, .3, .6, .2); mk(784, .4, .5, .4); break;
    case 'summon_z8': mk(700, .06, .7); mk(900, .06, .5, .07); mk(1100, .06, .4, .14); mk(1300, .08, .3, .2); break;
    case 'merge_z8': mk(800, .05, .6); mk(1000, .05, .5, .05); mk(1200, .07, .4, .1); break;
    case 'achieve_z8': mk(880, .1, .8); mk(1100, .1, .7, .08); mk(1320, .15, .6, .16); break;
    case 'summon_z9': mk(1000, .15, .8); mk(1500, .2, .6, .08); break;
    case 'merge_z9': mk(1200, .1, .7); mk(1600, .1, .5, .06); break;
    case 'achieve_z9': mk(880, .15, .8); mk(1100, .15, .7, .1); mk(1320, .2, .6, .2); break;
    case 'summon_z10': mk(400, .06, .7); mk(500, .06, .5, .08); break;
    case 'merge_z10': mk(350, .08, .6); mk(450, .08, .5, .07); break;
    case 'achieve_z10': mk(523, .15, .8); mk(659, .12, .6, .12); mk(784, .2, .5, .22); break;
    case 'summon_z11': mk(120, .3, .8); mk(150, .25, .6, .1); break;
    case 'merge_z11': mk(100, .2, .7); mk(130, .2, .5, .08); break;
    case 'achieve_z11': mk(294, .3, .8); mk(370, .3, .6, .18); mk(440, .4, .5, .36); break;
  }
}

let G = {zodiac:-1,fate:-1,created:false,coins:0,qi:0,dragons:[],mergeCount:0,summonCount:0,currentFate:3,freeLeft:3,cultivation:{mu:0,huo:0,tu:0,kin:0,shui:0},lastQiTime:Date.now()};
let nextId = 1;
let cpsTimer = null, qiTimer = null, bgmTimer = null;

function saveGame(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(G));
}
function loadGame(){
  const s = localStorage.getItem(SAVE_KEY);
  if(s){try{Object.assign(G,JSON.parse(s));}catch(e){}}
  if(G.dragons.length) nextId = Math.max(...G.dragons.map(d=>parseInt(d.id)))+1;
}
function fmtNum(n){
  if(n>=1e9)return(n/1e9).toFixed(1)+'B';
  if(n>=1e6)return(n/1e6).toFixed(1)+'M';
  if(n>=1e3)return(n/1e3).toFixed(1)+'K';
  return Math.floor(n)+'';
}
function calcCps(){
  if(!G.created)return 0;
  const fc=FATE_C[G.fate]||1;
  const yc=1+(YUN_COIN[G.currentFate]||0);
  let base=G.dragons.reduce((s,d)=>s+(COIN_S[d.level]||0),0);
  const coinBonus=(getCultBonus().coinBonus||0);
  return Math.floor(base*fc*yc*1.3*(1+coinBonus));
}
function updateHud(){
  if(!G.created)return;
  document.getElementById('hudCoins').textContent=fmtNum(G.coins);
  document.getElementById('hudCps').textContent=fmtNum(calcCps())+'/s';
  document.getElementById('hudQi').textContent=fmtNum(G.qi);
  const cost=G.summonCount<100?100:G.summonCount<500?150:G.summonCount<2000?200:250;
  document.getElementById('coinCost').textContent=cost;
  document.getElementById('btnCoin').disabled=G.coins<cost;
  document.getElementById('btnQi').disabled=G.qi<500;
  if(G.fate===2){
    document.getElementById('btnFree').style.display=G.freeLeft>0?'flex':'none';
    document.getElementById('freeCount').textContent=G.freeLeft;
  }
}
const COLS=5, TOTAL=25;
function renderGrid(){
  const grid=document.getElementById('dragonGrid');
  if(!grid)return;
  grid.innerHTML='';
  for(let i=0;i<TOTAL;i++){
    const cell=document.createElement('div');
    cell.className='d-cell';
    cell.dataset.idx=i;
    const d=G.dragons.find(d=>d.idx===i);
    if(d){
      const card=document.createElement('div');
      card.className='d-card';
      card.dataset.id=d.id;
      card.innerHTML=`<span class="d-icon">${LICON[d.level]||'?'}</span><span class="d-lv">Lv${d.level}</span><span class="d-gold">+${COIN_S[d.level]}/s</span>`;
      setupDrag(card,d);
      cell.appendChild(card);
    }
    grid.appendChild(cell);
  }
  markMergeable();
}

// 渲染到灵兽网格内层（4列，按等级从高到低排序）
function renderGridToInner(){
  const inner = document.getElementById('dragonGridInner');
  if(!inner) return;
  const sorted = [...G.dragons].sort((a,b) => (b.level||0) - (a.level||0));
  inner.innerHTML = sorted.map(d => {
    const icon2 = LICON[d.level] || '?';
    const rarity = getRarity ? getRarity(d.level).name : '普通';
    const rarColors = {'普通':'#aaa','稀有':'#7eb8ff','史诗':'#b57edc','传说':'#ffd700','神话':'#ff6b35'};
    const rc = rarColors[rarity] || '#aaa';
    return `<div style="display:flex;flex-direction:column;align-items:center;padding:10px 4px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);cursor:default;">
      <span style="font-size:38px;line-height:1;margin-bottom:4px;filter:drop-shadow(0 2px 8px rgba(255,215,0,.3));">${icon2}</span>
      <span style="font-size:12px;font-weight:700;color:${rc};margin-bottom:2px;">Lv${d.level}</span>
      <span style="font-size:10px;color:#ffd700;">+${COIN_S[d.level]||0}/s</span>
      <span style="font-size:9px;color:#555;margin-top:2px;">${rarity}</span>
    </div>`;
  }).join('');
}

function setupDrag(card,d){
  card.addEventListener('mousedown',e=>startDrag(e,card,d));
  card.addEventListener('touchstart',e=>{e.preventDefault();startDrag(e,card,d);},{passive:false});
}
let dragCard=null,dragData=null,srcIdx=-1;
function startDrag(e,card,d){
  dragCard=card;dragData=d;srcIdx=d.idx;
  const rect=card.getBoundingClientRect();
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const cy=e.touches?e.touches[0].clientY:e.clientY;
  card.style.left=(cx-rect.width/2)+'px';
  card.style.top=(cy-rect.height/2)+'px';
  card.classList.add('dragging');
  document.addEventListener('mousemove',onDrag);
  document.addEventListener('mouseup',endDrag);
  document.addEventListener('touchmove',onDrag,{passive:false});
  document.addEventListener('touchend',endDrag);
}
function onDrag(e){
  if(!dragCard)return;
  e.preventDefault();
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const cy=e.touches?e.touches[0].clientY:e.clientY;
  dragCard.style.left=(cx-30)+'px';
  dragCard.style.top=(cy-30)+'px';
}
function endDrag(e){
  if(!dragCard)return;
  document.removeEventListener('mousemove',onDrag);
  document.removeEventListener('mouseup',endDrag);
  document.removeEventListener('touchmove',onDrag);
  document.removeEventListener('touchend',endDrag);
  dragCard.classList.remove('dragging');
  dragCard.style.left='';dragCard.style.top='';dragCard.style.position='';
  const cx=e.changedTouches?e.changedTouches[0].clientX:e.clientX;
  const cy=e.changedTouches?e.changedTouches[0].clientY:e.clientY;
  const cells=document.querySelectorAll('.d-cell');
  let target=null;
  cells.forEach(c=>{const r=c.getBoundingClientRect();if(cx>=r.left&&cx<=r.right&&cy>=r.top&&cy<=r.bottom)target=c;});
  if(target){const dst=parseInt(target.dataset.idx);if(dst!==srcIdx)doDrop(srcIdx,dst);}
  dragCard=null;dragData=null;srcIdx=-1;
}
function doDrop(src,dst){
  const s=G.dragons.find(d=>d.idx===src);
  const t=G.dragons.find(d=>d.idx===dst);
  if(!s)return;
  if(t){
    if(s.level===t.level&&s.level<15){
      G.dragons=G.dragons.filter(d=>d.idx!==src&&d.idx!==dst);
      G.dragons.push({id:String(nextId++),level:s.level+1,idx:dst});
      G.mergeCount++;
      const qiGain=Math.floor(Math.random()*2);
      if(qiGain>0){G.qi=Math.min(99999,G.qi+qiGain);updateHud();}
      showMergeFlash(LICON[s.level+1]);
      showNotif('success',`合成！${LNAME[s.level]} → ${LNAME[s.level+1]}`);
      if(G.zodiac>=0) playSound('merge_z'+G.zodiac);
      saveGame();renderGrid();updateHud();try{updateHeroSection();}catch(e){}
      checkAch();
    }else{s.idx=dst;t.idx=src;saveGame();renderGrid();}
  }else{s.idx=dst;saveGame();renderGrid();}
}
function markMergeable(){
  document.querySelectorAll('.d-cell').forEach(c=>c.classList.remove('mergeable'));
  for(let i=0;i<G.dragons.length;i++){
    for(let j=i+1;j<G.dragons.length;j++){
      if(G.dragons[i].level===G.dragons[j].level&&G.dragons[i].level<15){
        document.querySelectorAll('.d-card').forEach(c=>{
          const id=parseInt(c.dataset.id);
          if(id===parseInt(G.dragons[i].id)||id===parseInt(G.dragons[j].id))
            c.closest('.d-cell').classList.add('mergeable');
        });
      }
    }
  }
}
function getSummonLevel(pool){
  let total=pool.reduce((s,p)=>s+p.weight,0),r=Math.random()*total,acc=0;
  for(const p of pool){acc+=p.weight;if(r<=acc)return p.level;}
  return pool[pool.length-1].level;
}

function summonCoin(){
  const cost=G.summonCount<100?100:G.summonCount<500?150:G.summonCount<2000?200:250;
  if(G.coins<cost){showNotif('error','金币不足！');return;}
  G.coins-=cost;
  doSummon(getSummonLevel([{level:1,weight:100},{level:2,weight:80},{level:3,weight:50}]));
}
function summonQi(){
  if(G.qi<500){showNotif('error','龙气不足！');return;}
  G.qi-=500;
  doSummon(getSummonLevel([{level:4,weight:30},{level:5,weight:18},{level:6,weight:10}]));
}
function summonFree(){
  if(G.freeLeft<=0){showNotif('error','今日免费次数已用完！');return;}
  G.freeLeft--;
  doSummon(getSummonLevel([{level:1,weight:100},{level:2,weight:80},{level:3,weight:50}]));
}


function showMergeFlash(emoji){
  const el=document.getElementById('mergeFlash');
  document.getElementById('mergeText').textContent=emoji;
  el.classList.add('show');setTimeout(()=>el.classList.remove('show'),500);
}
function showNotif(type,msg){
  const el=document.getElementById('notif');
  const colors={success:'rgba(76,175,80,.9)',error:'rgba(244,67,54,.9)',info:'rgba(33,150,243,.9)',warning:'rgba(255,152,0,.9)'};
  el.style.background=colors[type]||colors.info;
  el.textContent=msg;el.style.display='block';
  setTimeout(()=>el.style.display='none',2500);
}
function startCps(){
  stopCps();
  cpsTimer=setInterval(()=>{
    const cps=calcCps();
    if(cps>0){G.coins+=cps;updateHud();if(Math.random()<.01)saveGame();}
  },1000);
  // 龙气回复（每分钟）
  qiTimer=setInterval(()=>{
    if(!G.created)return;
    const elapsed=(Date.now()-G.lastQiTime)/60000;
    const rate=getCultBonus().qiRate;
    if(rate>0&&elapsed>=1){
      G.qi=Math.min(99999,G.qi+Math.floor(elapsed*rate));
      G.lastQiTime=Date.now();
      updateHud();
    }
  },15000);
}
function stopCps(){if(cpsTimer){clearInterval(cpsTimer);cpsTimer=null;}if(qiTimer){clearInterval(qiTimer);qiTimer=null;}if(bgmTimer){clearInterval(bgmTimer);bgmTimer=null;}}

function playBgmNote(freq,dur,vol,t){
  if(!_audioCtx||_audioState.muted)return;
  const o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
  o.connect(g);g.connect(_audioCtx.destination);
  o.type='triangle';
  o.frequency.value=freq;
  g.gain.setValueAtTime((vol||.15)*_audioState.bgmVolume,_audioCtx.currentTime+(t||0));
  g.gain.exponentialRampToValueAtTime(.001,_audioCtx.currentTime+(t||0)+dur);
  o.start(_audioCtx.currentTime+(t||0));
  o.stop(_audioCtx.currentTime+(t||0)+dur+.05);
}
let _bgmTimer=null,_bgmIdx=0,_bgmZ=-1;

// 乐器音色：主音色+副音色组合，模仿真实乐器
// sub: 副旋律相对主音的音程（0=无, 12=八度, 7=五度, 5=四度）
// harm: 和声叠音（上方三度/六度等）
const INSTRUMENTS=[
  {name:'古筝',main:'triangle',sub:12,harm:false},   // 0鼠-清脆跳进
  {name:'低音鼓',main:'sine',sub:0,harm:false},      // 1牛-沉稳
  {name:'铜管',main:'sawtooth',sub:0,harm:false},    // 2虎-威严
  {name:'风铃',main:'triangle',sub:7,harm:true},     // 3兔-空灵
  {name:'编钟',main:'triangle',sub:12,harm:false},  // 4龙-宏大
  {name:'箫',main:'sine',sub:5,harm:false},         // 5蛇-悠远
  {name:'马头琴',main:'sawtooth',sub:0,harm:false}, // 6马-奔腾
  {name:'笛',main:'triangle',sub:7,harm:false},     // 7羊-悠扬
  {name:'琵琶',main:'sawtooth',sub:0,harm:true},     // 8猴-跳脱
  {name:'扬琴',main:'triangle',sub:12,harm:true},    // 9鸡-明亮
  {name:'二胡',main:'sawtooth',sub:0,harm:false},   // 10狗-明快
  {name:'排钟',main:'sine',sub:12,harm:false},      // 11猪-圆润
];

function playNote(f,dur,vol,type){
  if(!_audioCtx||_audioState.muted||f<=0)return;
  const now=_audioCtx.currentTime;
  // Pluck包络：快速建立，慢速衰减，更有弹拨感
  const rise=dur*.06;
  const o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
  o.type=type||'triangle';o.frequency.value=f;
  g.gain.setValueAtTime(.001,now);
  g.gain.linearRampToValueAtTime(vol,now+rise);
  g.gain.exponentialRampToValueAtTime(.001,now+dur);
  o.connect(g);g.connect(_audioCtx.destination);
  o.start(now);o.stop(now+dur+.02);
}

const ZODIAC_BGM=[
  // 0鼠-轻快古筝（BPM90）
  {bpm:90,inst:0,notes:[
    261.63,329.63,392,523.25,329.63,392,523.25,392,261.63,392,523.25,659.25,
    392,523.25,392,329.63,261.63,329.63,392,523.25,329.63,392,523.25,659.25,
    784,659.25,523.25,392,329.63,523.25,392,329.63,261.63,329.63,392,523.25,
    659.25,784,659.25,523.25,392,523.25,392,329.63,261.63,392,523.25,392,261.63,
  ]},
  // 1牛-沉稳低音（BPM58）
  {bpm:58,inst:1,notes:[
    130.81,98,130.81,98,130.81,98,164.81,164.81,196,164.81,196,196,164.81,130.81,
    98,130.81,98,130.81,98,164.81,164.81,130.81,98,130.81,98,65.41,98,130.81,
  ]},
  // 2虎-铜管威严（BPM68）
  {bpm:68,inst:2,notes:[
    196,196,261.63,261.63,329.63,329.63,392,392,329.63,329.63,261.63,261.63,
    196,196,329.63,329.63,392,392,523.25,392,329.63,261.63,329.63,261.63,196,392,
  ]},
  // 3兔-风铃空灵（BPM72）
  {bpm:72,inst:3,notes:[
    392,523.25,587.33,659.25,587.33,523.25,392,523.25,523.25,659.25,784,880,
    784,659.25,523.25,392,523.25,392,329.63,392,523.25,392,329.63,261.63,329.63,
    392,523.25,587.33,659.25,523.25,392,329.63,261.63,392,523.25,392,329.63,261.63,
  ]},
  // 4龙-编钟宏大（BPM66）
  {bpm:66,inst:4,notes:[
    130.81,130.81,261.63,261.63,329.63,329.63,261.63,261.63,329.63,329.63,392,329.63,
    261.63,392,392,523.25,392,329.63,261.63,196,261.63,329.63,392,523.25,392,329.63,
    261.63,261.63,329.63,392,523.25,659.25,523.25,392,329.63,261.63,329.63,261.63,
  ]},
  // 5蛇-箫悠远（BPM52）
  {bpm:52,inst:5,notes:[
    220,196,174.61,220,196,174.61,196,220,261.63,220,196,174.61,220,196,174.61,196,
    220,261.63,293.66,261.63,220,196,220,261.63,293.66,329.63,261.63,220,196,174.61,
  ]},
  // 6马-马头琴奔腾（BPM96）
  {bpm:96,inst:6,notes:[
    392,392,523.25,523.25,392,392,523.25,587.33,392,392,523.25,523.25,659.25,659.25,
    523.25,392,523.25,523.25,659.25,784,784,659.25,523.25,392,523.25,523.25,392,392,
    659.25,587.33,523.25,392,392,523.25,523.25,392,392,523.25,
  ]},
  // 7羊-笛悠扬（BPM70）
  {bpm:70,inst:7,notes:[
    261.63,329.63,392,329.63,261.63,329.63,523.25,523.25,329.63,392,523.25,659.25,
    523.25,392,329.63,261.63,329.63,523.25,523.25,329.63,392,523.25,659.25,784,
    659.25,523.25,392,329.63,261.63,329.63,392,329.63,261.63,196,261.63,329.63,392,
  ]},
  // 8猴-琵琶跳脱（BPM100）
  {bpm:100,inst:8,notes:[
    523.25,784,523.25,784,659.25,523.25,392,523.25,784,659.25,523.25,392,523.25,784,
    523.25,784,659.25,523.25,392,523.25,784,659.25,523.25,392,523.25,784,523.25,784,
    659.25,523.25,392,523.25,784,659.25,523.25,392,523.25,784,659.25,523.25,392,
  ]},
  // 9鸡-扬琴明亮（BPM85）
  {bpm:85,inst:9,notes:[
    587.33,784,987.77,784,587.33,587.33,784,987.77,880,1174.66,880,784,587.33,587.33,
    784,659.25,587.33,784,987.77,880,784,587.33,784,987.77,987.77,784,659.25,587.33,
    784,784,659.25,587.33,392,523.25,659.25,784,987.77,784,659.25,587.33,784,659.25,
  ]},
  // 10狗-二胡明快（BPM88）
  {bpm:88,inst:10,notes:[
    293.66,392,523.25,392,293.66,392,523.25,392,293.66,392,523.25,659.25,523.25,392,
    293.66,392,523.25,392,293.66,392,523.25,659.25,523.25,392,523.25,659.25,784,
    659.25,523.25,392,293.66,392,523.25,659.25,523.25,392,293.66,392,523.25,392,
  ]},
  // 11猪-排钟圆润（BPM62）
  {bpm:62,inst:11,notes:[
    130.81,130.81,196,196,261.63,196,261.63,196,196,261.63,329.63,329.63,261.63,196,
    130.81,261.63,329.63,392,329.63,261.63,329.63,392,523.25,392,329.63,261.63,196,
    130.81,130.81,196,196,261.63,261.63,329.63,329.63,261.63,261.63,392,523.25,
  ]},
];

function playFullBgm(z){
  if(!_audioCtx||z<0)return;
  stopBgm();_bgmZ=z;
  const track=ZODIAC_BGM[z]||ZODIAC_BGM[4];
  const inst=INSTRUMENTS[track.inst]||INSTRUMENTS[0];
  _bgmIdx=0;
  function tick(){
    if(!_audioCtx||_audioState.muted){stopBgm();return;}
    if(_bgmZ!==z)return;
    const V=_audioState.bgmVolume;
    const f=track.notes[_bgmIdx%track.notes.length];
    const dur=(60/track.bpm)*(1+(Math.random()-.5)*.12); // BPM+时值随机微扰12%
    // 主音
    playNote(f,dur,V*.4,inst.main);
    // 副音（叠音）
    if(inst.sub>0)playNote(f*Math.pow(2,inst.sub/12),dur,V*.18,'sine');
    // 和声
    if(inst.harm)playNote(f*Math.pow(2,4/12),dur*.7,V*.12,'sine');
    _bgmIdx++;
    _bgmTimer=setTimeout(tick,dur*860);
  }
  initAudio();
  tick();
}

function stopBgm(){
  if(_bgmTimer){clearTimeout(_bgmTimer);_bgmTimer=null;}
  _bgmIdx=0;_bgmZ=-1;
}

function startBgm(){initAudio();playFullBgm(G.zodiac);}


// ===== 主页滑动切换 =====
let _inGridMode = false;
let _touchStartY = 0;

function initHomeGesture(){
  const hero = document.getElementById('heroSection');
  if(!hero) return;
  hero.addEventListener('touchstart', e => {
    _touchStartY = e.touches[0].clientY;
  }, {passive: true});
  hero.addEventListener('touchend', e => {
    const dy = _touchStartY - e.changedTouches[0].clientY;
    if(Math.abs(dy) < 30) return;
    if(dy > 0 && !_inGridMode) enterGridMode();
    else if(dy < 0 && _inGridMode) exitGridMode();
  }, {passive: true});
  hero.addEventListener('click', e => {
    if(e.target.classList.contains('ht')) {
      // 点击缩略图也进入网格
      if(!_inGridMode) enterGridMode();
    }
  });
}

function enterGridMode(){
  if(_inGridMode) return;
  _inGridMode = true;
  const hero = document.getElementById('heroSection');
  const grid = document.getElementById('dragonGrid');
  const gridInner = document.getElementById('dragonGridInner');
  if(!hero || !grid) return;
  hero.style.transition = 'opacity .3s, transform .3s';
  hero.style.opacity = '0';
  hero.style.transform = 'scale(.95)';
  setTimeout(() => {
    hero.style.display = 'none';
    // 重渲染网格（5列×5行）
    if(gridInner) gridInner.innerHTML = '';
    renderGridToInner();
    const cnt = document.getElementById('gridCount');
    if(cnt) cnt.textContent = `(${G.dragons.length}只)`;
    grid.style.display = 'flex';
    grid.style.opacity = '0';
    grid.style.transition = 'opacity .3s';
    grid.style.opacity = '1';
  }, 300);
}

function exitGridMode(){
  if(!_inGridMode) return;
  _inGridMode = false;
  const hero = document.getElementById('heroSection');
  const grid = document.getElementById('dragonGrid');
  const gridInner = document.getElementById('dragonGridInner');
  if(!hero || !grid) return;
  grid.style.transition = 'opacity .3s, transform .3s';
  grid.style.opacity = '0';
  setTimeout(() => {
    grid.style.display = 'none';
    if(gridInner) gridInner.innerHTML = '';
    hero.style.display = 'flex';
    hero.style.opacity = '0';
    hero.style.transform = 'scale(1.05)';
    setTimeout(() => {
      hero.style.opacity = '1';
      hero.style.transform = 'scale(1)';
    }, 20);
    updateHeroSection();
  }, 300);
}

function updateHeroSection(){
  const heroIcon = document.getElementById('heroIcon');
  const heroLv = document.getElementById('heroLv');
  const heroCps = document.getElementById('heroCps');
  const heroFate = document.getElementById('heroFateTag');
  const heroThumbs = document.getElementById('heroThumbs');
  if(!heroIcon) return;
  if(!G.dragons || G.dragons.length === 0){
    heroIcon.textContent = '🐣';
    heroLv.textContent = 'Lv.1';
    heroCps.textContent = '+0/s';
    return;
  }
  const best = G.dragons.reduce((a,b) => (a.level||0) >= (b.level||0) ? a : b);
  const icon = LICON[best.level] || '🐣';
  const cps = COIN_S[best.level] || 0;
  heroIcon.textContent = icon;
  heroIcon.style.fontSize = Math.min(100, 50 + best.level * 3) + 'px';
  heroLv.textContent = 'Lv.' + best.level;
  heroCps.textContent = '+' + cps + '/s';
  if(heroFate){
    const fateNames = ['','木命','火命','土命','金命','水命'];
    const fate = fateNames[G.fate] || '';
    const yun = YUN_NAMES[(G.currentFate||3)-1] || '中平';
    heroFate.textContent = fate + ' · ' + yun;
  }
  if(heroThumbs){
    // 取所有灵兽从高到低排前8个
    const sorted = [...G.dragons].sort((a,b) => (b.level||0) - (a.level||0)).slice(0,8);
    heroThumbs.innerHTML = sorted.map(d => {
      const icon2 = LICON[d.level] || '🐣';
      const opacity = 0.3 + (d.level / 25) * 0.7;
      return `<div class="ht" style="font-size:min(26px,6vw);opacity:${opacity.toFixed(1)};">${icon2}</div>`;
    }).join('');
  }
}
