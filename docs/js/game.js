// ===== GAME.js - 生肖天机 =====

function startGame(){
  G.zodiac=sz;G.fate=sf;G.created=true;
  G.coins=0;G.qi=0;G.dragons=[];G.mergeCount=0;G.summonCount=0;G.freeLeft=3;G.currentFate=3;
  if(G.lastFateDate!==today()){rollFate();}G.cultivation={mu:0,huo:0,tu:0,kin:0,shui:0};G.lastQiTime=Date.now();
  saveGame();
  document.getElementById('modal').classList.remove('show');
  document.getElementById('loginWrap').style.display='none';
  document.getElementById('hudZodiac').textContent=ZOD_E[sz]||'';

  document.getElementById('hudYunshi').textContent=YUN_NAMES[G.currentFate-1]+' '+YUN_COIN[G.currentFate-1].toFixed(1);
  document.getElementById('gamePage').style.display='flex';document.getElementById('gamePage').style.visibility='visible';document.getElementById('gamePage').style.opacity='1';
  G.dragons=[{id:'1',level:1,idx:12},{id:'2',level:1,idx:13}];
  nextId=3;
  saveGame();renderGrid();updateHud();startCps();startBgm();initHomeGesture();try{updateHeroSection();}catch(e){}initHomeGesture();try{updateHeroSection();}catch(e){}
  if(G.fate===2)document.getElementById('btnFree').style.display='flex';
  window.addEventListener('beforeunload',saveGame);
}
function initGame(){ localStorage.clear(); initAch(); checkFateDaily();
  loadGame();
  try{loadSettings();}catch(e){}
  if(G.created){
    document.getElementById('loginWrap').style.display='none';
    document.getElementById('hudZodiac').textContent=ZOD_E[G.zodiac]||'';

    document.getElementById('hudYunshi').textContent=YUN_NAMES[G.currentFate-1]+' '+YUN_COIN[G.currentFate-1].toFixed(1);
    document.getElementById('gamePage').style.display='flex';document.getElementById('gamePage').style.visibility='visible';document.getElementById('gamePage').style.opacity='1';
    renderGrid();updateHud();startCps();startBgm();initHomeGesture();try{updateHeroSection();}catch(e){}
    if(G.fate===2)document.getElementById('btnFree').style.display='flex';
  }
}

// ===== 召唤翻牌动画 =====
const RARITY=[
  {name:'普通',color:'#aaa',tag:'NORMAL'},
  {name:'稀有',color:'#7eb8ff',tag:'RARE'},
  {name:'史诗',color:'#b57edc',tag:'EPIC'},
  {name:'传说',color:'#ffd700',tag:'LEGEND'},
  {name:'神话',color:'#ff6b35',tag:'MYTH'},
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

function revealSummon(){
  if(summonRevealed)return;
  summonRevealed=true;
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
    document.getElementById('summonResultAnim').classList.add('show');
    document.getElementById('sraEmoji').textContent=LICON[lvl]||'?';
    document.getElementById('sraName').textContent=LNAME[lvl]||'灵兽';
    document.getElementById('sraDesc').textContent='Lv'+lvl+' · 每秒产金 '+COIN_S[lvl];
    document.getElementById('sraTag').textContent=rar.tag;
    document.getElementById('sraTag').style.color=rar.color;
    document.getElementById('sraBtn').style.display='block';
    // 关闭提示
    document.querySelector('.summon-tip').style.display='none';
    document.querySelector('.scard-wrap').style.display='none';
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
  saveGame();renderGrid();updateHud();
  checkAch();
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
    showNotif('warning','⏰ 新的一天！天机已变，运势已刷新');
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
function renderCultPanel(){
  const p=document.getElementById('cultPanel');
  const cult=G.cultivation||{mu:0,huo:0,tu:0,kin:0,shui:0};
  const bonus=getCultBonus();
  p.innerHTML=`<div style="padding:20px 16px 80px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div style="font-size:16px;font-weight:700;">⚗️ 命格修炼</div>
      <div style="font-size:12px;color:#888;">
        <span style="color:#ffd700;">${(bonus.coinBonus*100).toFixed(0)}%</span>金币
        <span style="color:#ffd700;">${(bonus.summonLowRate*100).toFixed(0)}%</span>召唤
        <span style="color:#ffd700;">${(bonus.mergeBonus*100).toFixed(0)}%</span>合成
      </div>
      <div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeCultPanel()">✕</div>
    </div>
    <div style="font-size:11px;color:#555;margin-bottom:14px;background:rgba(255,255,255,.03);padding:10px;border-radius:10px;">
      消耗 <span style="color:#ffd700;">龙气</span> 提升修炼境界，每条命格可修炼3层
    </div>
    ${CULTivation.map(c=>{const lv=cult[c.key]||0;return`<div style="margin-bottom:18px;">
      <div style="font-size:13px;font-weight:700;color:${c.color};margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        <span style="font-size:18px;">${c.icon}</span>${c.name}·${c.desc}
      </div>
      <div style="display:flex;gap:8px;">
        ${c.node.map((n,i)=>{const done=i<lv,next=i===lv;return`<div id="cult_${c.key}_${i}" onclick="doCultNode('${c.key}',${i})" style="flex:1;background:${done?'rgba(255,215,0,.08)':'rgba(255,255,255,.02)'};border:1px solid ${done?'rgba(255,215,0,.3)':next?c.color:'rgba(255,255,255,.06)'};border-radius:12px;padding:10px 6px;text-align:center;cursor:pointer;opacity:${done||next?'1':'.35'};">
          <div style="font-size:11px;color:${done?'#ffd700':next?c.color:'#555'};font-weight:600;">${n.title}</div>
          <div style="font-size:10px;color:#888;margin:3px 0 4px;">${n.desc}</div>
          <div style="font-size:10px;color:${G.qi>=n.cost?'#ffd700':'#f44336'};">✨${n.cost}龙气</div>
          ${done?'<div style="font-size:16px;margin-top:4px;">✅</div>':''}
        </div>`;}).join('')}
      </div>
    </div>`;}).join('')}
    <div style="margin-top:8px;background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.1);border-radius:12px;padding:12px;">
      <div style="font-size:12px;color:#ffd700;font-weight:600;margin-bottom:6px;">📈 当前加成总览</div>
      <div style="font-size:11px;color:#888;line-height:1.9;">
        💰金币产出 <span style="color:#ffd700;">+${(bonus.coinBonus*100).toFixed(0)}%</span><br>
        🐣召唤概率 <span style="color:#ffd700;">+${(bonus.summonLowRate*100).toFixed(0)}%</span><br>
        ⚡合成成功率 <span style="color:#ffd700;">+${(bonus.mergeBonus*100).toFixed(0)}%</span><br>
        🐉高级灵兽 <span style="color:#ffd700;">+${(bonus.highRate*100).toFixed(0)}%</span><br>
        ✨龙气回复 <span style="color:#ffd700;">+${bonus.qiRate}/min</span>
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

// ===== 底部栏新功能 =====
function toggleDragonGrid(){
  const grid=document.getElementById('dragonGrid');
  const hero=document.getElementById('heroSection');
  const btn=document.getElementById('gridToggleBtn');
  if(grid.style.display==='flex'){
    grid.style.display='none';
    hero.style.display='flex';
    btn.textContent='↓ 查看全部灵兽 ↓';
  } else {
    grid.style.display='flex';
    hero.style.display='none';
    btn.textContent='↑ 返回灵兽展示 ↑';
  }
}

function openTaskPanel(){
  showNotif('📋 每日任务 · 功能开发中',3000);
}

function openActivityPanel(){
  showNotif('🎯 限时活动 · 功能开发中',3000);
}
