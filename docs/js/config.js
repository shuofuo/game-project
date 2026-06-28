// ===== CONFIG.js - 生肖天机 =====


// ===== 游戏数据 =====
const SAVE_KEY = 'sx_sg_v1';
const LICON = ['🐣','🐥','🐤','🦅','🐦','🕊','🦋','🐉','🦅','🐲','🐍','🐎','🐉','🐲','🐉🔥'];
// 每个等级灵兽的动画名（中英文+效果描述）
const LANIM_NAMES = [
  '呼吸','呼吸','呼吸','呼吸',      // Lv1-4 基础
  '漂浮','漂浮',                    // Lv5-6 轻飘
  '御风','御风',                    // Lv7-8 飞行
  '龙吟','龙吟',                    // Lv9-10 神龙
  '天命','天命',                    // Lv11-12 神话
  '永恒','永恒','永恒'             // Lv13-15 终极
];
// 当前灵兽动画索引（点击切换，持久化到存档）
if(typeof G.heroAnimIdx === 'undefined') G.heroAnimIdx = 0;
// 点击主页灵兽 → 切换动作
function cycleHeroAnim(){
  const best = G.dragons.reduce((a,b)=>(a.level||0)>=(b.level||0)?a:b);
  const maxIdx = Math.min(G.heroAnimIdx + 1, 3); // 每个等级最多4种动作
  G.heroAnimIdx = (G.heroAnimIdx + 1) % 4;
  saveGame();
  updateHeroSection();
}
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

// 点击下一级缩略图 → 弹出升级预览弹窗
function previewNextLevel(lvl, cps, icon){
  const rarity = lvl<=2?'普通':lvl<=4?'稀有':lvl<=7?'珍稀':lvl<=10?'传说':lvl<=13?'史诗':'神话';
  const rarColors = {'普通':'#aaa','稀有':'#7eb8ff','珍稀':'#42a5f5','传说':'#9c27b0','史诗':'#ff9800','神话':'#ffd700'};
  const diff = cps - (COIN_S[G.dragons.reduce((a,b)=>(a.level||0)>=(b.level||0)?a:b).level]||0);
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:999;backdrop-filter:blur(4px);';
  el.innerHTML = `<div style="background:linear-gradient(160deg,#0d0d2a,#1a1a3a);border:1px solid ${rarColors[rarity]};border-radius:24px;padding:32px 28px;width:min(320px,88vw);text-align:center;animation:popIn .3s ease;">
    <div style="font-size:11px;letter-spacing:4px;color:${rarColors[rarity]};margin-bottom:12px;">${rarity.toUpperCase()}</div>
    <div style="font-size:72px;margin:12px 0;filter:drop-shadow(0 0 24px ${rarColors[rarity]}55);">${icon}</div>
    <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:4px;">Lv.${lvl} · ${LNAME[lvl]||'灵兽'}</div>
    <div style="font-size:28px;font-weight:900;color:${rarColors[rarity]};margin:10px 0;">+${cps}/s</div>
    <div style="font-size:13px;color:#888;margin:8px 0 20px;">比当前等级多 <span style="color:#ffd700;">+${diff}/s</span></div>
    <div style="background:rgba(255,255,255,.04);border-radius:14px;padding:14px;margin-bottom:20px;text-align:left;font-size:12px;color:#666;line-height:1.8;">
      <div>🎯 两张同等级灵兽可合成升级</div>
      <div>⚡ 合成成功率：${getCultBonus ? (100+getCultBonus().mergeBonus*100).toFixed(0)+'%' : '100%'}</div>
      <div>💰 升级后金币产出大幅提升</div>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:16px;">点击任意处关闭</div>
  </div>`;
  // 点击任意处或按任意键关闭，关闭后退出网格模式返回主页面
  el.onclick = e => { el.remove(); if(_inGridMode) exitGridMode(); };
  el.addEventListener('keydown', ()=>{ el.remove(); if(_inGridMode) exitGridMode(); }, {once:true});
  document.body.appendChild(el);
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
const RAR_COLORS = {0:'#1a1a1a',1:'#0a1a2a',2:'#1a0a2a',3:'#2a1a00',4:'#2a0a00'}; // 0普通~4神话（暗色背景）
const RAR_BORDER = {0:'rgba(255,255,255,.06)',1:'rgba(126,184,255,.3)',2:'rgba(181,126,220,.3)',3:'rgba(255,215,0,.4)',4:'rgba(255,107,53,.5)'};
function rarIdx(lvl){if(lvl<=2)return 0;if(lvl<=4)return 1;if(lvl<=7)return 2;if(lvl<=10)return 3;return 4;}
function renderGrid(){
  const grid=document.getElementById('dragonGridInner');
  if(!grid)return;
  grid.innerHTML='';
  for(let i=0;i<TOTAL;i++){
    const cell=document.createElement('div');
    cell.className='d-cell';
    cell.style.aspectRatio='1';
    cell.style.borderRadius='12px';
    cell.style.border='1.5px solid rgba(255,255,255,.06)';
    cell.style.background='rgba(255,255,255,.02)';
    cell.dataset.idx=i;
    const d=G.dragons.find(d=>d.idx===i);
    if(d){
      const ri = rarIdx(d.level);
      const bg = RAR_COLORS[ri];
      const bd = RAR_BORDER[ri];
      const card=document.createElement('div');
      card.className='d-card';
      card.dataset.id=d.id;
      card.style.background=`${bg}`;
      card.style.border=`1px solid ${bd}`;
      card.innerHTML=`<span class="d-icon" style="filter:drop-shadow(0 0 8px ${bd.replace(',.3)',',.4)').replace('rgba(','rgba(').replace(',.4)','40)')}">${LICON[d.level]||'?'}</span><span class="d-lv" style="font-size:10px;color:rgba(255,255,255,.4);margin-top:2px;">Lv${d.level}</span><span class="d-gold" style="font-size:9px;color:rgba(255,215,0,.6);">+${COIN_S[d.level]}/s</span>`;
      setupDrag(card,d);
      cell.appendChild(card);
    }
    grid.appendChild(cell);
  }
  markMergeable();
}

// 渲染到灵兽网格内层（4列，按等级从高到低排序）
// renderGridToInner 已废弃，功能合并到 enterGridMode → renderGrid()
function renderGridToInner(){}

function setupDrag(card,d){
  card.addEventListener('mousedown',e=>startDrag(e,card,d));
  card.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();startDrag(e,card,d);},{passive:false});
}
let dragCard=null,dragData=null,srcIdx=-1;
function startDrag(e,card,d){
  dragCard=card;dragData=d;srcIdx=d.idx;
  card.classList.add('dragging');
  // 立即移到鼠标/触摸位置（图标居中）
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const cy=e.touches?e.touches[0].clientY:e.clientY;
  card.style.left=cx+'px';
  card.style.top=cy+'px';
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
  dragCard.style.left=cx+'px';
  dragCard.style.top=cy+'px';
}
function endDrag(e){
  if(!dragCard)return;
  document.removeEventListener('mousemove',onDrag);
  document.removeEventListener('mouseup',endDrag);
  document.removeEventListener('touchmove',onDrag);
  document.removeEventListener('touchend',endDrag);
  document.querySelectorAll('.drop-target').forEach(c=>{c.classList.remove('drop-target');c.style.borderColor='';c.style.boxShadow='';});

  // 用拖拽卡片自身的实时坐标（卡片已 position:fixed，卡片中心即鼠标按下时的坐标）
  // 兼容：若 left/top 仍是像素值则直接 parse，否则 fallback 到鼠标坐标
  let cx, cy;
  if(dragCard.style.left&&dragCard.style.top){
    cx=parseFloat(dragCard.style.left);
    cy=parseFloat(dragCard.style.top);
  } else {
    cx=e.changedTouches?e.changedTouches[0].clientX:e.clientX;
    cy=e.changedTouches?e.changedTouches[0].clientY:e.clientY;
  }
  // 找最近的格子（拖拽卡片中心位置匹配，120px容差）
  const cells=document.querySelectorAll('.d-cell');
  let target=null, minDist=Infinity;
  cells.forEach(cell=>{
    const r=cell.getBoundingClientRect();
    const ccx=r.left+r.width/2, ccy=r.top+r.height/2;
    const d=Math.hypot(cx-ccx,cy-ccy);
    if(d<minDist&&d<120){minDist=d;target=cell;}
  });
  // 保存 srcIdx，因为 dragCard 会在 renderGrid 里被重建
  const _src=srcIdx, _dst=target?parseInt(target.dataset.idx):null;
  // 先清掉 dragCard（合成后 renderGrid 会重建整个网格）
  dragCard.style.transition='opacity .12s';
  dragCard.classList.remove('dragging');
  dragCard.style.left='';dragCard.style.top='';dragCard.style.transition='';
  dragCard.style.width='';dragCard.style.height='';dragCard.style.position='';
  dragCard.style.padding='';dragCard.style.display='';dragCard.style.alignItems='';dragCard.style.justifyContent='';
  dragCard=null;dragData=null;srcIdx=-1;
  if(_dst!==null&&_dst!==_src){
    doDrop(_src,_dst);
  }
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
  document.querySelectorAll('.d-cell').forEach(c=>{c.classList.remove('mergeable');c.style.borderColor='';c.style.boxShadow='';});
  for(let i=0;i<G.dragons.length;i++){
    for(let j=i+1;j<G.dragons.length;j++){
      if(G.dragons[i].level===G.dragons[j].level&&G.dragons[i].level<15){
        document.querySelectorAll('.d-card').forEach(c=>{
          const id=parseInt(c.dataset.id);
          if(id===parseInt(G.dragons[i].id)||id===parseInt(G.dragons[j].id)){
            const cell=c.closest('.d-cell');
            if(cell){cell.classList.add('mergeable');cell.style.border='1.5px solid rgba(255,215,0,.5)';cell.style.boxShadow='0 0 14px rgba(255,215,0,.3)';}
          }
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
    if(gridInner) gridInner.innerHTML = '';
    grid.style.display = 'flex';
    grid.style.flexDirection = 'column';
    renderGrid(); // 5×5可拖拽格子渲染到 dragonGridInner
    const cnt = document.getElementById('gridCount');
    if(cnt) cnt.textContent = `(${G.dragons.length}只)`;
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
  grid.style.transition = 'opacity .3s';
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
  const heroLv   = document.getElementById('heroLv');
  const heroCps = document.getElementById('heroCps');
  const heroFate = document.getElementById('heroFateTag');
  const heroThumbs = document.getElementById('heroThumbs');
  if(!heroIcon) return;
  if(!G.dragons || G.dragons.length === 0){
    heroIcon.textContent = '🐣';
    if(heroLv)   heroLv.textContent   = 'Lv.1';
    if(heroCps)  heroCps.textContent  = '+0/s';
    return;
  }
  const best = G.dragons.reduce((a,b) => (a.level||0) >= (b.level||0) ? a : b);
  const icon = LICON[best.level] || '🐣';
  const cps = COIN_S[best.level] || 0;
  heroIcon.textContent = icon;
  heroIcon.style.fontSize = 'min(130px,30vw)';
  // 点击切换动作
  heroIcon.onclick = e => { e.stopPropagation(); cycleHeroAnim(); };
  heroIcon.style.cursor = 'pointer';
  // 应用当前动画
  const animClass = ['breathe','float','whirl','eternal'][G.heroAnimIdx || 0];
  heroIcon.className = 'hero-anim-' + animClass;
  // 动作名称提示
  const animHints = ['静息呼吸','轻盈漂浮','神龙摆尾','天命永恒'];
  let hint = document.getElementById('heroAnimHint');
  if(!hint){
    hint = document.createElement('div');
    hint.id = 'heroAnimHint';
    hint.className = 'hero-anim-hint';
    heroIcon.parentElement.appendChild(hint);
  }
  hint.textContent = animHints[G.heroAnimIdx || 0];
  heroLv.textContent = 'Lv.' + best.level;
  heroCps.textContent = '+' + cps + '/s';
  if(heroFate){
    const fateNames = ['','木命','火命','土命','金命','水命'];
    const fate = fateNames[G.fate] || '';
    const yun = YUN_NAMES[(G.currentFate||3)-1] || '中平';
    heroFate.textContent = fate + ' · ' + yun;
  }
  if(heroThumbs){
    const bestLvl = best.level || 1;
    const nextLvl = Math.min(bestLvl + 1, 15);
    const ci = LICON[bestLvl] || '?';
    const ni = LICON[nextLvl]  || '?';
    const nextNew = nextLvl > bestLvl;
    const nextCps = COIN_S[nextLvl] || 0;
    heroThumbs.innerHTML = `
      <div onclick="if(!_inGridMode)enterGridMode()" style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:6px 8px;font-size:28px;line-height:1;" onmouseover="this.style.background='rgba(255,215,0,.08)'" onmouseout="this.style.background='transparent'">
        <span>${ci}</span>
        <span style="font-size:9px;color:rgba(255,215,0,.65);font-weight:600;">Lv${bestLvl}</span>
      </div>
      <div style="display:flex;align-items:center;font-size:11px;color:rgba(255,255,255,.15);align-self:center;margin:0 4px;">→</div>
      <div onclick="previewNextLevel(${nextLvl},${nextCps},'${ni}')" style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:6px 8px;opacity:${nextNew?0.7:0.25};font-size:24px;line-height:1;" onmouseover="if(${nextNew}){this.style.background='rgba(126,184,255,.08)';this.style.opacity='0.9'}" onmouseout="this.style.background='transparent';this.style.opacity='${nextNew?0.7:0.25}'">
        <span style="filter:${nextNew?'none':'grayscale(1)'}">${ni}</span>
        <span style="font-size:9px;color:${nextNew?'rgba(126,184,255,.7)':'#444'};font-weight:600;">Lv${nextLvl}</span>
        ${nextNew?'<span style="font-size:8px;color:rgba(126,184,255,.4);">+'+nextCps+'/s</span>':''}
      </div>
    `;
  }
}

