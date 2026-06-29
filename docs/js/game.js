// ===== GAME.js - 生肖天机 =====

function startGame(){
  G.zodiac=sz;G.fate=sf;G.created=true;
  G.coins=0;G.qi=0;G.dragons=[];G.mergeCount=0;G.summonCount=0;G.freeLeft=3;G.lastFreeDate=today();G.currentFate=3;
  if(G.lastFateDate!==today()){rollFate();}G.cultivation={mu:0,huo:0,tu:0,kin:0,shui:0};G.lastQiTime=Date.now();
  saveGame();
  var el;
  el=document.getElementById('modal');if(el)el.classList.remove('show');
  el=document.getElementById('loginWrap');if(el)el.style.display='none';
  el=document.getElementById('hudZodiac');if(el)el.textContent=ZOD_E[sz]||'';
  el=document.getElementById('hudYunshi');if(el)el.textContent=YUN_NAMES[G.currentFate-1]+' '+YUN_COIN[G.currentFate-1].toFixed(1);
  el=document.getElementById('gamePage');if(el){el.style.display='flex';el.style.visibility='visible';el.style.opacity='1';}
  G.dragons=[{id:'1',level:1,idx:12},{id:'2',level:1,idx:13}];
  nextId=3;
  saveGame();renderGrid();updateHud();startCps();startBgm();initHomeGesture();
  requestAnimationFrame(()=>{try{updateHeroSection();}catch(e){}});
  requestAnimationFrame(()=>{setTimeout(()=>{try{updateHeroSection();}catch(e){}},200);});
  el=document.getElementById('btnFree');if(el&&G.fate===2)el.style.display='flex';
  window.addEventListener('beforeunload',saveGame);
}
function resetGame(){
  if(!confirm('确定要重新开始吗？所有数据将被清除！'))return;
  localStorage.removeItem(SAVE_KEY || 'sxgame_v2');
  G.zodiac=-1;G.fate=-1;G.created=false;
  G.coins=0;G.qi=0;G.dragons=[];G.mergeCount=0;G.summonCount=0;
  G.freeLeft=3;G.currentFate=3;G.cultivation={mu:0,huo:0,tu:0,kin:0,shui:0};
  G.lastQiTime=Date.now();
  saveGame();
  location.reload();
}

function initGame(){ initAch();
  loadGame();
  checkFateDaily();
  checkSignDaily();
  try{loadSettings();}catch(e){}
  if(G.created){
    var el;
    el=document.getElementById('loginWrap');if(el)el.style.display='none';
    el=document.getElementById('hudZodiac');if(el)el.textContent=ZOD_E[G.zodiac]||'';
    el=document.getElementById('hudYunshi');if(el)el.textContent=YUN_NAMES[G.currentFate-1]+' '+YUN_COIN[G.currentFate-1].toFixed(1);
    el=document.getElementById('gamePage');if(el){el.style.display='flex';el.style.visibility='visible';el.style.opacity='1';}
    renderGrid();updateHud();startCps();startBgm();initHomeGesture();
    requestAnimationFrame(()=>{try{updateHeroSection();}catch(e){}});
    requestAnimationFrame(()=>{setTimeout(()=>{try{updateHeroSection();}catch(e){}},200);});
    el=document.getElementById('btnFree');if(el&&G.fate===2)el.style.display='flex';
  }
}

// ===== 召唤翻牌动画 =====
const RARITY=[
  {name:'普通',color:'#aaa',tag:'普通'},
  {name:'稀有',color:'#7eb8ff',tag:'稀有'},
  {name:'史诗',color:'#b57edc',tag:'史诗'},
  {name:'传说',color:'#ffd700',tag:'传说'},
  {name:'神话',color:'#ff6b35',tag:'神话'},
];
function getRarity(lvl){
  if(lvl<=3)return 0;
  if(lvl<=6)return 1;
  if(lvl<=9)return 2;
  if(lvl<=12)return 3;
  return 4;
}
let pendingSummonLevel=1;
let summonRevealed=false;

// ── 召唤音效（按稀有度）────────────────────────────────
// 召唤结果音效：按稀有度分级（普通单音→神话四音和弦+泛音）
function playSummonSound(r){
  initAudio();
  if(!_audioCtx||_audioState.muted)return;
  const t=_audioCtx.currentTime;
  const vol=.18;
  if(r<=1){
    // 普通/稀有：单音升调
    const o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.type='sine';o.frequency.setValueAtTime(330,t);
    o.frequency.exponentialRampToValueAtTime(660,t+.2);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);
    o.start(t);o.stop(t+.55);
  } else if(r===2){
    // 珍稀：双音上行
    [440,660].forEach((f,i)=>{
      const o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
      o.connect(g);g.connect(_audioCtx.destination);
      o.type='sine';o.frequency.setValueAtTime(f,t+i*.1);
      g.gain.setValueAtTime(vol,t+i*.1);g.gain.exponentialRampToValueAtTime(.001,t+i*.1+.5);
      o.start(t+i*.1);o.stop(t+i*.1+.55);
    });
  } else if(r===3){
    // 传说：三音和弦
    [523,659,784].forEach((f,i)=>{
      const o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
      o.connect(g);g.connect(_audioCtx.destination);
      o.type='sine';o.frequency.setValueAtTime(f,t+i*.07);
      g.gain.setValueAtTime(vol*.9,t+i*.07);g.gain.exponentialRampToValueAtTime(.001,t+i*.07+.6);
      o.start(t+i*.07);o.stop(t+i*.07+.65);
    });
  } else {
    // 史诗/神话：四音大调和弦+高音泛音
    [523,659,784,1047].forEach((f,i)=>{
      const o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
      o.connect(g);g.connect(_audioCtx.destination);
      o.type=i<3?'sine':'triangle';
      o.frequency.setValueAtTime(f,t+i*.06);
      g.gain.setValueAtTime(vol*(i<3?.9:.5),t+i*.06);
      g.gain.exponentialRampToValueAtTime(.001,t+i*.06+.8);
      o.start(t+i*.06);o.stop(t+i*.06+.85);
    });
  }
}

// ── 粒子爆炸 ─────────────────────────────────────────────
function spawnSummonParticles(r){
  const pw=document.getElementById('sraPw');if(!pw)return;pw.innerHTML='';const c=['#aaa','#7eb8ff','#b57edc','#ffd700','#ff6b35'][r];const n=[8,12,18,24,32][r];for(let i=0;i<n;i++){const p=document.createElement('div');p.className='sra-p';const ang=Math.random()*Math.PI*2,dist=30+Math.random()*60;const dx=Math.cos(ang)*dist,dy=Math.sin(ang)*dist;const sz=4+Math.random()*8;p.style.cssText=`left:50%;top:40%;width:${sz}px;height:${sz}px;background:${c};--dx:${dx}px;--dy:${dy}px;animation-delay:${Math.random()*.3}s;box-shadow:0 0 ${sz}px ${c}`;pw.appendChild(p);}
}

// ── 稀有度进度条 ────────────────────────────────────────
function animateRarityBar(r){
  const fill=document.getElementById('sraFill');const bar=document.querySelector('.sra-bar');if(!fill||!bar)return;const colors=['#aaa','#7eb8ff','#b57edc','#ffd700','#ff6b35'];fill.style.background=colors[r];fill.style.width='0%';setTimeout(()=>fill.style.width=(20+r*20)+'%',50);}

// ── 新灵兽检测 ──────────────────────────────────────────
function checkNewDragon(lvl){const owned=new Set(G.dragons.map(d=>d.level));return !owned.has(lvl);}

function revealSummon(){
  if(summonRevealed)return;
  summonRevealed=true;
  // 翻牌音效
  initAudio();
  try{
    const t=_audioCtx.currentTime;
    const o=_audioCtx.createOscillator();
    const g=_audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.type='sine';o.frequency.setValueAtTime(1200,t);
    o.frequency.exponentialRampToValueAtTime(600,t+.12);
    g.gain.setValueAtTime(.15,t);
    g.gain.exponentialRampToValueAtTime(.001,t+.18);
    o.start(t);o.stop(t+.22);
  }catch(e){}
  const lvl=pendingSummonLevel;
  const rar=getRarity(lvl);
  // 填充翻牌正面内容
  document.getElementById('sfEmoji').textContent=LICON[lvl]||'?';
  document.getElementById('sfName').textContent=LNAME[lvl]||'灵兽';
  document.getElementById('sfCps').textContent='+'+COIN_S[lvl]+'/s';
  document.querySelector('.scard-front').style.borderColor=rar.color;
  // 翻牌
  document.getElementById('scard').classList.add('flipped');
  // 1.4秒后显示结果
  setTimeout(()=>{
    // 关闭翻牌区域
    document.querySelector('.summon-tip').style.display='none';
    document.querySelector('.scard-wrap').style.display='none';
    // 稀有度背景
    const anim=document.getElementById('summonResultAnim');
    anim.className='summon-result-anim sra-r'+rar;
    // 填充内容
    document.getElementById('sraEmoji').textContent=LICON[lvl]||'?';
    document.getElementById('sraName').textContent=LNAME[lvl]||'灵兽';
    document.getElementById('sraDesc').textContent='Lv'+lvl+' · 每秒产金 +'+COIN_S[lvl];
    const tag=document.getElementById('sraTag');
    tag.textContent=rar.tag;
    tag.style.color=rar.color;
    document.getElementById('sraCps').textContent='+'+COIN_S[lvl]+'/s 金币产出';
    // 新灵兽提示
    const newEl=document.getElementById('sraNew');
    newEl.style.display=checkNewDragon(lvl)?'block':'none';
    // 进度条
    animateRarityBar(rar);
    // 粒子
    spawnSummonParticles(rar);
    // 显示
    anim.classList.add('show');
    document.getElementById('sraBtn').style.display='block';
    // 音效
    playSummonSound(rar);
    // 通知气泡
    notifSummon(lvl);
  },1400);
}
function closeSummonAnim(){
  document.getElementById('summonOverlay').classList.remove('show');
  document.getElementById('summonResultAnim').classList.remove('show');
  document.getElementById('sraBtn').style.display='none';
  document.querySelector('.summon-tip').style.display='block';
  document.querySelector('.scard-wrap').style.display='flex';
  document.getElementById('scard').classList.remove('flipped');
  document.getElementById('summonResultAnim').classList.remove('show');
  summonRevealed=false;
  try{updateHeroSection();}catch(e){}
}

// 改造 doSummon：触发翻牌动画而不是直接弹窗
function doSummon(level){
  initAudio();
  if(G.zodiac>=0) playSound('summon_z'+G.zodiac);
  const used=new Set(G.dragons.map(d=>d.idx));
  const spots=[];
  for(let i=0;i<TOTAL;i++)if(!used.has(i))spots.push(i);
  if(spots.length===0){showNotif('error','灵兽已满，请先合并！');return;}
  const idx=spots[Math.floor(Math.random()*spots.length)];
  G.dragons.push({id:String(nextId++),level,idx});
  G.summonCount++;
  saveGame();renderGrid();updateHud();checkAch();
  try{updateHeroSection();}catch(e){}
  // 改为触发翻牌动画
  pendingSummonLevel=level;
  summonRevealed=false;
  document.getElementById('summonOverlay').classList.add('show');
  document.getElementById('summonResultAnim').classList.remove('show');
  document.getElementById('sraBtn').style.display='none';
}

window.addEventListener('DOMContentLoaded',initGame);



// ===== 成就系统 =====
const ACHIEVEMENTS=[
  {id:'r1',type:'rank',title:'初窥',desc:'拥有3种不同灵兽',icon:'🔰',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=3},
  {id:'r2',type:'rank',title:'小成',desc:'拥有6种不同灵兽',icon:'🥉',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=6},
  {id:'r3',type:'rank',title:'大成',desc:'拥有10种不同灵兽',icon:'🥈',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=10},
  {id:'r4',type:'rank',title:'天师',desc:'拥有14种不同灵兽',icon:'🏆',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=14},
  {id:'s1',type:'summon',title:'初出茅庐',desc:'召唤1次',icon:'🐣',cond:g=>g.summonCount>=1},
  {id:'s2',type:'summon',title:'小试牛刀',desc:'召唤10次',icon:'🐥',cond:g=>g.summonCount>=10},
  {id:'s3',type:'summon',title:'渐入佳境',desc:'召唤50次',icon:'🐤',cond:g=>g.summonCount>=50},
  {id:'s4',type:'summon',title:'龙腾四海',desc:'召唤200次',icon:'🐉',cond:g=>g.summonCount>=200},
  {id:'s5',type:'summon',title:'凤鸣九天',desc:'召唤1000次',icon:'🔥',cond:g=>g.summonCount>=1000},
  {id:'m1',type:'merge',title:'初次融合',desc:'合成1次',icon:'⚡',cond:g=>g.mergeCount>=1},
  {id:'m2',type:'merge',title:'融合达人',desc:'合成50次',icon:'⚡⚡',cond:g=>g.mergeCount>=50},
  {id:'m3',type:'merge',title:'融合宗师',desc:'合成200次',icon:'⚡⚡⚡',cond:g=>g.mergeCount>=200},
  {id:'c1',type:'coin',title:'日进斗金',desc:'累计获得10K金币',icon:'💰',cond:g=>g.coins>=10000},
  {id:'c2',type:'coin',title:'富甲一方',desc:'累计获得100K金币',icon:'💎',cond:g=>g.coins>=100000},
  {id:'c3',type:'coin',title:'富可敌国',desc:'累计获得1M金币',icon:'👑',cond:g=>g.coins>=1000000},
  {id:'c4',type:'coin',title:'宇宙财阀',desc:'累计获得1B金币',icon:'🌌',cond:g=>g.coins>=1000000000},
  {id:'v1',type:'collect',title:'灵兽收藏家',desc:'拥有5种等级',icon:'📖',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=5},
  {id:'v2',type:'collect',title:'灵兽大师',desc:'拥有10种等级',icon:'📚',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=10},
  {id:'v3',type:'collect',title:'灵兽宗师',desc:'拥有14种等级',icon:'📜',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=14},
];
const RANKS=[
  {title:'初窥',icon:'🔰',min:3,color:'#aaa'},
  {title:'小成',icon:'🥉',min:6,color:'#cd7f32'},
  {title:'大成',icon:'🥈',min:10,color:'#c0c0c0'},
  {title:'天师',icon:'🏆',min:14,color:'#ffd700'},
];
let _unlocked=new Set(JSON.parse(localStorage.getItem(SAVE_KEY+'_ach')||'[]'));
function saveAch(){localStorage.setItem(SAVE_KEY+'_ach',JSON.stringify([..._unlocked]));}
function checkAch(){
  if(!G.created)return;
  ACHIEVEMENTS.forEach(a=>{
    if(!_unlocked.has(a.id)&&a.cond(G)){
      _unlocked.add(a.id);saveAch();
      const el=document.createElement('div');
      el.style.cssText='position:fixed;top:56px;right:12px;background:linear-gradient(135deg,#1a1a3a,#2a1a4a);border:1px solid #ffd700;border-radius:14px;padding:12px 16px;z-index:999;animation:achToast 3s ease forwards;min-width:180px;';
      el.innerHTML='<div style="font-size:22px;text-align:center;margin-bottom:6px;">'+a.icon+'</div><div style="font-size:13px;font-weight:700;color:#ffd700;text-align:center;">🏅 成就达成</div><div style="font-size:13px;font-weight:600;color:#fff;text-align:center;margin-top:4px;">'+a.title+'</div><div style="font-size:10px;color:#888;text-align:center;margin-top:2px;">'+a.desc+'</div>';
      document.body.appendChild(el);
      if(G.zodiac>=0) playSound('achieve_z'+G.zodiac);
      setTimeout(()=>el.remove(),3100);
    }
  });
}
function getRank(){
  let r=RANKS[0];const cnt=new Set(G.dragons.map(d=>d.level)).size;
  RANKS.forEach(rk=>{if(cnt>=rk.min)r=rk;});return r;
}
function getRankList(){
  try{return JSON.parse(localStorage.getItem(SAVE_KEY+'_rank')||'[]');}catch(e){return [];}
}

function today(){
  const d=new Date();
  return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
}
function reselect(){
  G.created=false;
  document.getElementById('modal').classList.remove('show');
  document.getElementById('loginWrap').style.display='block';
  stopBgm();
}

function rollFate(){
  G.currentFate=Math.floor(Math.random()*5)+1;
  G.lastFateDate=today();
  saveGame();
  updateHud();
  const names=['🌪️ 极凶','🌧️ 小凶','☀️ 平','🌤️ 小吉','✨ 大吉'];
  const icons=['⚠️','⚠️','☀️','🌟','⭐'];
  const colors=['#f44336','#ff9800','#888','#8bc34a','#ffd700'];
  showNotif('info','今日运势：'+names[G.currentFate-1]+'！产出'+(YUN_COIN[G.currentFate-1]>=0?'+'+(YUN_COIN[G.currentFate-1]*100).toFixed(0)+'%':(YUN_COIN[G.currentFate-1]*100).toFixed(0)+'%'));
  updateFateOverlay();
}
function checkFateDaily(){
  if(!G.created)return;
  if(G.lastFateDate!==today()){
    rollFate();
    G.freeLeft=3; // 重置免费召唤次数
    G.lastFreeDate=today();
    saveGame();
    showNotif('warning','⏰ 新的一天！天机已变，运势已刷新，免费召唤已重置');
  }
}
function showFateDetail(){
  const idx=G.currentFate-1;
  const names=['🌪️ 极凶','🌧️ 小凶','☀️ 平','🌤️ 小吉','✨ 大吉'];
  const descs=['诸事不顺，产出-50%','略有不顺，产出-20%','运气平平，正常产出','运势旺盛，产出+30%','鸿运当头，产出+50%'];
  const colors=['#f44336','#ff9800','#888','#8bc34a','#ffd700'];
  const bonus=YUN_COIN[idx];
  const pct=(bonus>=0?'+'+(bonus*100).toFixed(0)+'%':(bonus*100).toFixed(0)+'%');
  const el=document.createElement('div');
  el.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#0a0a1a;border:1px solid '+colors[idx]+';border-radius:20px;padding:24px;z-index:500;width:min(320px,88vw);text-align:center;';
  el.innerHTML='<div style="font-size:40px;margin-bottom:8px;">'+names[idx]+'</div><div style="font-size:16px;font-weight:700;color:'+colors[idx]+';margin-bottom:6px;">'+pct+' 金币产出</div><div style="font-size:13px;color:#888;margin-bottom:16px;">'+descs[idx]+'</div><div style="font-size:11px;color:#555;">每日0点自动刷新</div><div style="margin-top:14px;padding:10px;background:rgba(255,255,255,.04);border-radius:12px;font-size:12px;color:#666;cursor:pointer;" onclick="this.parentElement.remove()">✕ 关闭</div>';
  document.body.appendChild(el);
}

function updateFateOverlay(){
  const overlay=document.getElementById('fateOverlay');
  if(!overlay)return;
  const opacities=[.35,.15,0,.1,.2];
  const op=opacities[G.currentFate-1]||0;
  const colors=['rgba(244,67,54,','rgba(255,152,0,','rgba(255,255,255,','rgba(139,195,74,','rgba(255,215,0,'];
  overlay.style.background=colors[G.currentFate-1]+op+')';
}


// ===== 命格修炼系统 =====
const CULTivation=[
  {key:'mu',  name:'木', icon:'🪵', color:'#4caf50', desc:'召唤灵兽',       node:[{cost:100,  title:'嫩芽萌发',desc:'召唤低级概率+10%'},{cost:500,  title:'枝繁叶茂',desc:'召唤低级概率+25%'},{cost:2000, title:'参天大树',desc:'召唤低级概率+50%'}]},
  {key:'huo', name:'火', icon:'🔥', color:'#f44336', desc:'融合炼化',       node:[{cost:100,  title:'火苗初燃',desc:'合成成功率+5%'},{cost:500,  title:'烈火焚烧',desc:'合成成功率+15%'},{cost:2000, title:'烈焰焚天',desc:'合成成功率+30%'}]},
  {key:'tu',  name:'土', icon:'🟤', color:'#795548', desc:'厚土载物',       node:[{cost:100,  title:'泥土夯实',desc:'金币产出+10%'},{cost:500,  title:'沃土千里',desc:'金币产出+25%'},{cost:2000, title:'厚德载物',desc:'金币产出+50%'}]},
  {key:'kin', name:'金', icon:'⚪', color:'#9e9e9e', desc:'点石成金',       node:[{cost:100,  title:'沙里淘金',desc:'高级灵兽概率+10%'},{cost:500,  title:'点铁成金',desc:'高级灵兽概率+25%'},{cost:2000, title:'点石成金',desc:'高级灵兽概率+50%'}]},
  {key:'shui',name:'水', icon:'💧', color:'#2196f3', desc:'水润万物',       node:[{cost:100,  title:'涓涓细流',desc:'龙气回复+20%/min'},{cost:500,  title:'江河奔涌',desc:'龙气回复+50%/min'},{cost:2000, title:'汪洋大海',desc:'龙气回复+100%/min'}]},
];
const QI_RATE=[0,0,0,0,0,20,50,100]; // 每级每分钟龙气回复量

function getCultBonus(){
  const c=G.cultivation||{mu:0,huo:0,tu:0,kin:0,shui:0};
  return{
    summonLowRate:(c.mu===1?.1:c.mu===2?.25:.35)*(c.mu===0?0:1),
    mergeBonus:(c.huo===1?.05:c.huo===2?.15:.3)*(c.huo===0?0:1),
    coinBonus:(c.tu===1?.1:c.tu===2?.25:.5)*(c.tu===0?0:1),
    highRate:(c.kin===1?.1:c.kin===2?.25:.5)*(c.kin===0?0:1),
    qiRate:QI_RATE[Object.values(c).reduce((a,b)=>a+b,0)]||0,
  };
}
function calcCultQi(){
  const now=Date.now();
  const elapsed=(now-G.lastQiTime)/60000; // 分钟
  const rate=getCultBonus().qiRate;
  if(rate>0) G.qi=Math.min(99999,G.qi+Math.floor(elapsed*rate));
  G.lastQiTime=now;
  saveGame();
}
function doCultNode(cultKey,nodeIdx){
  if(!G.created)return;
  const cult=G.cultivation||{mu:0,huo:0,tu:0,kin:0,shui:0};
  const cfg=CULTivation.find(c=>c.key===cultKey);
  const node=cfg.node[nodeIdx];
  if(cult[cultKey]>nodeIdx){showNotif('info','此节点已修炼');return;}
  if(G.qi<node.cost){showNotif('error','龙气不足');return;}
  G.qi-=node.cost;
  cult[cultKey]=nodeIdx+1;
  G.cultivation=cult;
  saveGame();
  renderCultPanel();
  updateHud();
  setTimeout(()=>_cultNodePulse(cultKey,nodeIdx),80);
  calcCps();
  showNotif('success','⚗️ '+cfg.icon+' '+cfg.name+'修炼：'+node.title);
}
function saveCultUI(){
  // 实时更新修炼面板的节点显示
  if(!document.getElementById('cultPanel').classList.contains('open'))return;
  const cult=G.cultivation||{mu:0,huo:0,tu:0,kin:0,shui:0};
  CULTivation.forEach(c=>{
    const lv=cult[c.key]||0;
    c.node.forEach((n,i)=>{
      const nodeEl=document.getElementById('cult_'+c.key+'_'+i);
      if(!nodeEl)return;
      if(i<lv){ nodeEl.style.opacity='1'; nodeEl.style.borderColor='rgba(255,215,0,.4)'; nodeEl.style.background='rgba(255,215,0,.08)'; }
      else if(i===lv){ nodeEl.style.opacity='1'; nodeEl.style.borderColor=c.color; nodeEl.style.background='rgba(255,255,255,.03)'; }
      else{ nodeEl.style.opacity='.35'; nodeEl.style.borderColor='rgba(255,255,255,.06)'; nodeEl.style.background='rgba(255,255,255,.02)'; }
    });
  });
}
// 修炼成功发光动画（给节点加脉冲class，0.6s后移除）
function _cultNodePulse(key,nodeIdx){
  const el=document.getElementById('cult_'+key+'_'+nodeIdx);
  if(el){ el.classList.add('cult-pulse'); setTimeout(()=>el.classList.remove('cult-pulse'),700); }
}

function renderCultPanel(){
  const p=document.getElementById('cultPanel');
  const cult=G.cultivation||{mu:0,huo:0,tu:0,kin:0,shui:0};
  const bonus=getCultBonus();
  p.innerHTML=`<div style="padding:20px 16px 80px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div style="font-size:16px;font-weight:700;letter-spacing:1px;">⚗️ 命格修炼</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeCultPanel()">✕ 关闭</div>
    </div>
    <div style="font-size:11px;color:#666;margin-bottom:18px;background:linear-gradient(135deg,rgba(255,215,0,.06),rgba(255,140,0,.04));border:1px solid rgba(255,215,0,.12);padding:10px 14px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;">
      <span>当前拥有 <span style="color:#ffd700;font-weight:700;">✨ ${G.qi}</span> 龙气</span>
      <span style="color:#555;">每条命格可修炼3层</span>
    </div>
    ${CULTivation.map(c=>{
      const lv=cult[c.key]||0;
      const pcts=[33,66,100][lv-1]||0;
      return `<div style="margin-bottom:12px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);border-left:3px solid ${c.color};border-radius:14px;padding:14px 14px 12px;position:relative;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:22px;line-height:1;">${c.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:${c.color};">${c.name} · ${c.desc}</div>
              <div style="font-size:10px;color:#555;margin-top:2px;">${c.node[lv]?c.node[lv].desc:'已满级'}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:18px;font-weight:700;color:${lv>0?c.color:'#444'};">Lv${lv}</div>
            <div style="font-size:10px;color:#555;">${lv}/3 层</div>
          </div>
        </div>
        <div style="height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;margin-bottom:11px;position:relative;">
          <div style="height:100%;width:${pcts}%;background:linear-gradient(90deg,${c.color}99,${c.color});border-radius:3px;transition:width .5s ease;${lv>0?'box-shadow:0 0 8px '+c.color+'88;':''}">
            ${lv>0?'<div style="position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:9px;height:9px;background:#fff;border-radius:50%;box-shadow:0 0 6px '+c.color+';"></div>':''}
          </div>
        </div>
        <div style="display:flex;gap:6px;">
          ${c.node.map((n,i)=>{
            const done=i<lv,isNext=i===lv&&lv<3;
            const canAfford=G.qi>=n.cost;
            return `<div id="cult_${c.key}_${i}" onclick="doCultNode('${c.key}',${i})" style="flex:1;background:${done?'rgba(255,215,0,.07)':'rgba(255,255,255,.03)'};border:1.5px solid ${done?'rgba(255,215,0,.25)':isNext?c.color+'88':'rgba(255,255,255,.06)'};border-radius:10px;padding:8px 4px;text-align:center;cursor:${done?'default':(canAfford||isNext)?'pointer':'not-allowed'};opacity:${done?'1':isNext?'1':'.3'};transition:all .2s;">
              <div style="font-size:9px;color:${done?'rgba(255,215,0,.8)':isNext?c.color:'#444'};font-weight:700;margin-bottom:3px;">${n.title}</div>
              ${done?'<div style="font-size:14px;">✅</div>':`<div style="font-size:9px;color:${canAfford&&isNext?'#ffd700':'#555'};">✨${n.cost}</div>`}
            </div>`;}).join('')}
        </div>
      </div>`;}).join('')}
    <div style="margin-top:6px;background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,140,0,.04));border:1px solid rgba(255,215,0,.15);border-radius:16px;padding:16px;">
      <div style="font-size:12px;color:#ffd700;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        <span style="font-size:14px;">📈</span> 当前加成总览
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;">💰</span><div><div style="font-size:10px;color:#555;">金币产出</div><div style="font-size:13px;color:#ffd700;font-weight:700;">+${(bonus.coinBonus*100).toFixed(0)}%</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;">🐣</span><div><div style="font-size:10px;color:#555;">召唤概率</div><div style="font-size:13px;color:#ffd700;font-weight:700;">+${(bonus.summonLowRate*100).toFixed(0)}%</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;">⚡</span><div><div style="font-size:10px;color:#555;">合成成功</div><div style="font-size:13px;color:#ffd700;font-weight:700;">+${(bonus.mergeBonus*100).toFixed(0)}%</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;">🐉</span><div><div style="font-size:10px;color:#555;">高级灵兽</div><div style="font-size:13px;color:#ffd700;font-weight:700;">+${(bonus.highRate*100).toFixed(0)}%</div></div>
        </div>
        <div style="grid-column:1/-1;display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;">✨</span><div><div style="font-size:10px;color:#555;">龙气回复</div><div style="font-size:13px;color:#ffd700;font-weight:700;">+${bonus.qiRate}/min</div></div>
        </div>
      </div>
    </div>
  </div>`;
}


function renderHandbook(){
  const p=document.getElementById('handbookPanel');
  const owned=new Set(G.dragons.map(d=>d.level));
  const total=15;
  const done=owned.size;
  const pct=Math.round(done/total*100);
  const rate=Object.values(COIN_S).slice(1);
  p.innerHTML=`<div style="padding:20px 16px 60px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div style="font-size:16px;font-weight:700;">📖 灵兽图鉴</div>
      <div style="font-size:12px;color:#888;">${done}/${total} 种</div>
      <div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeHandbook()">✕</div>
    </div>
    <div style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:14px;padding:14px;margin-bottom:16px;text-align:center;">
      <div style="font-size:13px;color:#ffd700;margin-bottom:8px;">收集进度</div>
      <div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin-bottom:6px;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#ffd700,#ff8c00);border-radius:4px;transition:width .5s;"></div>
      </div>
      <div style="font-size:11px;color:#888;">${pct}% 完成 · 已解锁 ${done} 种灵兽</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
      ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(lv=>{
        const isDone=owned.has(lv);
        const rarity=lv<=2?'普通':lv<=4?'稀有':lv<=7?'珍稀':lv<=10?'传说':lv<=13?'史诗':'神话';
        const rcolors={'普通':'#888','稀有':'#4caf50','珍稀':'#2196f3','传说':'#9c27b0','史诗':'#ff9800','神话':'#ffd700'};
        return `<div style="background:${isDone?'rgba(255,215,0,.06)':'rgba(255,255,255,.02)'};border:1.5px solid ${isDone?'rgba(255,215,0,.3)':'rgba(255,255,255,.06)'};border-radius:14px;padding:14px 6px;text-align:center;${isDone?'':'opacity:.4'}">
          <div style="font-size:32px;margin-bottom:4px;">${LICON[lv]||'❓'}</div>
          <div style="font-size:11px;font-weight:700;color:${isDone?'#ffd700':'#666'};">${LNAME[lv]||'?'}</div>
          <div style="font-size:10px;color:${rcolors[rarity]};margin:3px 0;">${rarity}</div>
          <div style="font-size:10px;color:${isDone?'#ffd700':'#555'};">Lv${lv} · +${rate[lv-1]||0}/s</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}


// ===== 每日签到 =====
function getSignDay(){return ((G.signStreak||0)%7)||7;}
function canSignToday(){
  if(!G.signDate)return true;
  return G.signDate!==today();
}

function renderSignPanel(){
  const p=document.getElementById('signPanel');
  const todayDone=!canSignToday();
  const streak=G.signStreak||0;
  p.innerHTML=`<div style="padding:20px 16px 80px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div style="font-size:16px;font-weight:700;">🎁 每日签到</div>
      <div style="font-size:12px;color:#ffd700;">🔥 连续 ${streak} 天</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeSignPanel()">✕ 关闭</div>
    </div>
    ${todayDone?`<div style="text-align:center;padding:12px;background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.2);border-radius:12px;margin-bottom:14px;">
      <div style="font-size:13px;color:#4caf50;font-weight:700;">✅ 今日已签到</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">明天再来领取更多奖励</div>
    </div>`:`<div style="text-align:center;padding:14px;background:linear-gradient(135deg,rgba(255,215,0,.12),rgba(255,140,0,.08));border:1.5px solid rgba(255,215,0,.4);border-radius:14px;margin-bottom:14px;cursor:pointer;" onclick="doSign()" id="signBtn">
      <div style="font-size:15px;color:#ffd700;font-weight:700;">🎉 立即签到</div>
      <div style="font-size:11px;color:#aaa;margin-top:4px;">点击领取今日奖励</div>
    </div>`}
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:16px;">
      ${SIGN_REWARDS.map((r,i)=>{
        const day=i+1;
        const past=day<getSignDay()||(day===getSignDay()&&todayDone);
        const current=day===getSignDay()&&!todayDone;
        return `<div style="text-align:center;padding:7px 3px;background:${past?'rgba(76,175,80,.12)':current?'rgba(255,215,0,.12)':'rgba(255,255,255,.03)'};border:1.5px solid ${past?'rgba(76,175,80,.3)':current?'rgba(255,215,0,.5)':'rgba(255,255,255,.05)'};border-radius:10px;${current?'box-shadow:0 0 12px rgba(255,215,0,.25);':''}">
          <div style="font-size:9px;color:${past?'#4caf50':current?'#ffd700':'#555'};font-weight:600;margin-bottom:3px;">Day${day}</div>
          <div style="font-size:14px;line-height:1;">${past?'✅':current?'📍':'⬛'}</div>
          <div style="font-size:8px;color:#666;margin-top:2px;">💰${r.coin>=1000?r.coin/1000+'K':r.coin}</div>
          ${r.free>0?`<div style="font-size:8px;color:#ff9800;">🆓${r.free}</div>`:''}
        </div>`;}).join('')}
    </div>
    <div style="font-size:11px;color:#555;background:rgba(255,255,255,.02);padding:8px 12px;border-radius:8px;line-height:1.8;">
      🎁 连续签到累计奖励，断签重置<br>
      ⏰ 每天 00:00 重置签到状态
    </div>
    <div style="margin-top:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:12px 14px;">
      <div style="font-size:12px;color:#ffd700;font-weight:600;margin-bottom:8px;">📋 7天签到奖励表</div>
      ${SIGN_REWARDS.map((r,i)=>{const day=i+1;const active=day===getSignDay();return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);${active?'opacity:1;':'opacity:.5;'}">
        <span style="font-size:11px;color:${active?'#ffd700':'#666'};">${r.label}</span>
        <span style="font-size:11px;color:${active?'#ffd700':'#666'};">💰+${fmtNum(r.coin)} ✨+${r.qi}${r.free>0?' 🆓+'+r.free+'召唤':''}</span>
      </div>`;}).join('')}
    </div>
  </div>`;
  p.classList.add('open');
}

function openSignPanel(){renderSignPanel();}
function closeSignPanel(){const p=document.getElementById('signPanel');if(p)p.classList.remove('open');}

function doSign(){
  if(!G.created)return;
  if(!canSignToday()){showNotif('info','今日已签到');return;}
  const day=getSignDay();
  const reward=SIGN_REWARDS[day-1]||SIGN_REWARDS[0];
  G.coins+=reward.coin;
  G.qi+=reward.qi;
  G.freeLeft+=reward.free;
  G.signDate=today();
  G.signStreak=(G.signStreak||0)+1;
  saveGame();
  updateHud();
  if(playSound) playSound('achieve');
  const btn=document.getElementById('signBtn');
  if(btn){
    btn.style.background='rgba(76,175,80,.15)';
    btn.style.border='1.5px solid rgba(76,175,80,.4)';
    btn.innerHTML='<div style="font-size:13px;color:#4caf50;font-weight:700;">✅ 签到成功！</div><div style="font-size:11px;color:#aaa;margin-top:4px;">💰+'+fmtNum(reward.coin)+' ✨+'+reward.qi+(reward.free>0?' 🆓+'+reward.free+'次召唤':'')+'</div>';
    btn.style.cursor='default';
    btn.onclick=null;
  }
  showNotif('success','🎉 连续签到第'+G.signStreak+'天 · 💰+'+fmtNum(reward.coin)+' ✨+'+reward.qi+(reward.free>0?' 🆓+'+reward.free+'召唤':''));
}

function yesterday(){
  const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);
}
function checkSignDaily(){
  if(!G.created||!G.signDate)return;
  if(G.signDate!==today()){
    if(G.signDate!==yesterday()){G.signStreak=0;saveGame();}
  }
}


// ===== 底部栏新功能 =====
function openTaskPanel(){
  showNotif('📋 每日任务 · 功能开发中',3000);
}

function openActivityPanel(){
  showNotif('🎯 限时活动 · 功能开发中',3000);
}
