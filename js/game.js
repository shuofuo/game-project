// ===== GAME.js - 生肖天机 =====

function startGame(){
  G.zodiac=sz;G.fate=sf;G.created=true;
  G.unlockedAtlas=[sz];
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
  setTimeout(()=>{try{renderSkillBar();}catch(e){}},300);
  if(!window._skillBarInterval){
    window._skillBarInterval=setInterval(()=>{try{renderSkillBar();}catch(e){}},2000);
  }
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

function initGame(){ startSkyEvents();try{initWeekly();}catch(e){}
  loadGame();
  checkFateDaily();
  checkSignDaily();
  checkTaskDaily();
  // 活跃活动提示
  getActiveActivities().forEach(a=>{showNotif('info',a.icon+' '+a.name+' 进行中！'+a.tip);});
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
    // 新手引导（首次进入游戏）
    if(!G.guideDone){requestAnimationFrame(()=>{setTimeout(()=>startGuide(),600);});}
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

// ── 主动技能系统 ───────────────────────────────────────
const SKILLS=[
  {id:'s1',name:'流星火雨',icon:'🔥',cost:200,qiCost:300,cd:120,desc:'5秒内每秒掉落火球，每球造成金币×3伤害',color:'#ff4444',rar:2},
  {id:'s2',name:'金光护体',icon:'🛡',cost:150,qiCost:200,cd:90,desc:'8秒内每次合成额外获得+50%金币',color:'#ffd700',rar:2},
  {id:'s3',name:'龙息吹息',icon:'💨',cost:250,qiCost:400,cd:150,desc:'3秒内金币产出速度×3',color:'#42a5f5',rar:3},
  {id:'s4',name:'天罚雷击',icon:'⚡',cost:300,qiCost:500,cd:180,desc:'随机获得传说级灵兽×1',color:'#9c27b0',rar:3},
  {id:'s5',name:'时光倒流',icon:'⏳',cost:180,qiCost:300,cd:120,desc:'撤销最近一次合成，返还全部消耗',color:'#7c4dff',rar:2},
  {id:'s6',name:'天命召唤',icon:'⭐',cost:500,qiCost:800,cd:300,desc:'必得传说级或以上灵兽',color:'#ff6b35',rar:4},
];
// 道具配置
const ITEMS=[
  {id:'i1',name:'双倍金币',icon:'💰',desc:'下次召唤金币产出×2持续30秒'},
  {id:'i2',name:'保护符',icon:'🛡',desc:'下次合成必定成功（不消失）'},
  {id:'i3',name:'召唤券',icon:'🎫',desc:'额外获得1次免费召唤次数'},
];
// 初始化技能冷却状态
if(G.skills===null){
  const s={};
  SKILLS.forEach(sk=>{s[sk.id]={lastUsed:0};});
  G.skills=s;
}
if(G.items===null){
  G.items=ITEMS.map(it=>({...it,count:0}));
}
if(!G._activeEffects)G._activeEffects={};
if(!G.signHistory)G.signHistory={};

// 技能冷却剩余秒数
function skillCdLeft(id){
  const sk=G.skills&&G.skills[id];
  if(!sk)return 0;
  const el=SKILLS.find(s=>s.id===id);
  if(!el)return 0;
  const past=(Date.now()-sk.lastUsed)/1000;
  return Math.max(0,Math.ceil(el.cd-past));
}

// 激活技能
function activateSkill(id){
  const sk=SKILLS.find(s=>s.id===id);
  if(!sk){showNotif('error','技能不存在');return;}
  const state=G.skills&&G.skills[id];
  const cd=skillCdLeft(id);
  if(cd>0){showNotif('warning','冷却中 '+cd+'秒');return;}
  if(G.qi<sk.qiCost){showNotif('error','龙气不足');return;}
  G.qi-=sk.qiCost;
  if(state)state.lastUsed=Date.now();
  saveGame();updateHud();
  showNotif('success',sk.icon+' '+sk.name+' 发动！');
  renderSkillBar();
  switch(id){
    case 's1': // 流星火雨：5秒×5次，每次掉落
      let fireCount=0;
      const fi=setInterval(()=>{
        fireCount++;
        G.coins+=Math.floor(G.cps*3*3);
        updateHud();
        if(fireCount>=5){clearInterval(fi);showNotif('gold','🔥 流星火雨结束！+'+fireCount*3+'秒产金');}
      },3000);
      G._activeEffects.s1=fi;
      break;
    case 's2': // 金光护体：8秒内合成加成
      G._activeEffects.s2=setTimeout(()=>{delete G._activeEffects.s2;showNotif('info','🛡 金光护体结束');},8000);
      break;
    case 's3': // 龙息吹息：3秒×3金币产出
      G.coins+=Math.floor(G.cps*3*3);
      updateHud();
      setTimeout(()=>{G.coins+=Math.floor(G.cps*3*3);updateHud();},1000);
      setTimeout(()=>{G.coins+=Math.floor(G.cps*3*3);updateHud();showNotif('gold','💨 龙息吹息结束！+9秒产金');},2000);
      break;
    case 's4': // 天罚雷击：直接获得传说灵兽
      doSummon(Math.random()<.5?10:Math.random()<.6?11:9);
      break;
    case 's5': // 时光倒流：撤销最近一次合成（如果_dragonsBak存在）
      if(G._dragonsBak&&G._dragonsBak.length>G.dragons.length){
        G.dragons=G._dragonsBak.map(d=>({...d}));
        G.mergeCount=Math.max(0,G.mergeCount-1);
        saveGame();renderGrid();updateHud();checkAch();
        showNotif('success','⏳ 时光倒流成功！');
      }else{
        G.qi+=sk.qiCost;updateHud();
        showNotif('info','⏳ 无可撤销的合成');
      }
      break;
    case 's6': // 天命召唤：必得传说+
      doSummon(Math.random()<.5?11:(Math.random()<.7?10:12));
      break;
  }
  if(playSound)playSound('achieve');
}

// 使用道具
function useItem(id){
  const it=G.items&&G.items.find(i=>i.id===id);
  if(!it){showNotif('error','道具不存在');return;}
  if(it.count<=0){showNotif('warning','道具数量不足');return;}
  it.count--;
  saveGame();
  switch(id){
    case 'i1': // 双倍金币30秒
      G._activeEffects.i1=setTimeout(()=>{delete G._activeEffects.i1;showNotif('info','💰 双倍金币结束');G.cps=calcCps();updateHud();},30000);
      G.cps=calcCps()*2;
      updateHud();
      showNotif('gold','💰 双倍金币生效30秒！');
      break;
    case 'i2': // 保护符（下次合成不消失，标记）
      G._activeEffects.i2=true;
      showNotif('success','🛡 保护符已激活，下次合成灵兽不会消失！');
      break;
    case 'i3': // 召唤券
      G.freeLeft++;
      saveGame();
      showNotif('success','🎫 获得额外免费召唤！剩余'+G.freeLeft+'次');
      try{updateFreeBtn();}catch(e){}
      break;
  }
  renderSkillBar();
}

// 渲染技能条（每2秒刷新一次）
function renderSkillBar(){
  const bar=document.getElementById('skillBar');
  if(!bar)return;
  const now=Date.now();
  bar.innerHTML=SKILLS.map(sk=>{
    const state=G.skills&&G.skills[sk.id];
    const cd=skillCdLeft(sk.id);
    const onCooldown=cd>0;
    const canAfford=G.qi>=sk.qiCost;
    const disabled=onCooldown||!canAfford;
    const cdPct=onCooldown?Math.round((cd/sk.cd)*100):0;
    const rarityLabel=['','普通','稀有','珍稀','传说'][sk.rar]||'';
    const rarityColor=['','#aaa','#7eb8ff','#42a5f5','#ffd700'][sk.rar]||'#aaa';
    const itemCount=G.items&&G.items.find(i=>i.id==='i'+sk.id[1])?(G.items.find(i=>i.id==='i'+sk.id[1]).count):0;
    return `<button class="skill-btn ${disabled?'disabled':''}" onclick="${disabled?'':'activateSkill(\''+sk.id+'\')'}" title="${sk.desc}\n龙气消耗:${sk.qiCost} 冷却:${sk.cd}秒\n品阶:${rarityLabel}">
      <span style="font-size:22px;">${sk.icon}</span>
      <span style="font-size:9px;color:${rarityColor};font-weight:600;">${sk.name}</span>
      <span style="font-size:8px;color:rgba(160,216,239,.7);"><span class="qi-icon qi-icon-sm"></span>${sk.qiCost}</span>
      ${onCooldown?'<div class="skill-cd"><div style="width:'+cdPct+'%;height:100%;background:rgba(0,0,0,.6);position:absolute;left:0;top:0;transition:width 1s linear;"></div>'+cd+'s</div>':''}
    </button>`;
  }).join('');
  // 渲染道具（放在技能条右侧/下方，小图标）
  const invCount=G.items?G.items.filter(i=>i.count>0).length:0;
  if(invCount>0){
    bar.innerHTML+=G.items.filter(it=>it.count>0).map(it=>{
      return `<button class="skill-btn" onclick="useItem('${it.id}')" title="${it.name}: ${it.desc}" style="border-color:rgba(255,215,0,.2);">
        <span style="font-size:20px;">${it.icon}</span>
        <span style="font-size:9px;color:#ffd700;font-weight:700;">${it.count}</span>
      </button>`;
    }).join('');
  }
}

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
  const pw=document.getElementById('sraPw');if(!pw)return;pw.innerHTML='';const c=['#aaa','#7eb8ff','#b57edc','#ffd700','#ff6b35'][r];const n=[8,12,18,24,32][r];for(let i=0;i<n;i++){const p=document.createElement('div');p.className='sra-p';const ang=Math.random()*Math.PI*2,dist=30+Math.random()*60;const dx=Math.cos(ang)*dist,dy=Math.sin(ang)*dist;const _sz=4+Math.random()*8;p.style.cssText=`left:50%;top:40%;width:${_sz}px;height:${_sz}px;background:${c};--dx:${dx}px;--dy:${dy}px;animation-delay:${Math.random()*.3}s;box-shadow:0 0 ${_sz}px ${c}`;pw.appendChild(p);}
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
    // 屏幕震动
    const gp=document.getElementById('gamePage');
    if(gp){gp.classList.add('screen-shake');setTimeout(()=>gp.classList.remove('screen-shake'),400);}
    // 结果放大弹出
    const sraEl=document.getElementById('summonResultAnim');
    if(sraEl){sraEl.classList.remove('sra-result-pop');void sraEl.offsetWidth;sraEl.classList.add('sra-result-pop');}
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
  // heroIcon 闪光
  const hi=document.getElementById('heroIcon');
  if(hi){hi.classList.remove('hero-icon-flash');void hi.offsetWidth;hi.classList.add('hero-icon-flash');setTimeout(()=>hi.classList.remove('hero-icon-flash'),500);}
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
  G.dragons.push({id:String(nextId++),level,idx,star:1});
  G.summonCount++;
  saveGame();renderGrid();updateHud();checkAch();
  _onWeeklyEvent("summon");
  try{updateHeroSection();}catch(e){}
  // 改为触发翻牌动画
  pendingSummonLevel=level;
  summonRevealed=false;
  document.getElementById('summonOverlay').classList.add('show');
  document.getElementById('summonResultAnim').classList.remove('show');
  document.getElementById('sraBtn').style.display='none';
}

// ── 升星系统 ───────────────────────────────────────────
// 检查某灵兽是否满级可升星
function canUpgradeStar(dragon){
  return dragon.level>=15 && (!dragon.star || dragon.star<5);
}
// 升星消耗（金币）
function starUpgradeCost(star){
  return Math.floor(10000*(star||1));
}
// 升星操作
function upgradeStar(id){
  const dragon=G.dragons.find(d=>d.id===id);
  if(!dragon){showNotif('error','灵兽不存在');return;}
  if(dragon.level<15){showNotif('warning','需要满级(Lv15)才能升星！');return;}
  const ns=(dragon.star||1)+1;
  if(ns>5){showNotif('info','已达最高星阶！');return;}
  const cost=starUpgradeCost(dragon.star||1);
  if(G.coins<cost){showNotif('error','金币不足');return;}
  G.coins-=cost;
  dragon.level=1;
  dragon.star=ns;
  saveGame();renderGrid();updateHud();checkAch();
  showNotif('gold','⭐ 升星成功！'+(ns)+'星 '+starMult(ns)+'×产金倍率！');
  if(playSound)playSound('achieve');
}

window.addEventListener('DOMContentLoaded',initGame);



// ===== 成就系统 =====
const ACHIEVEMENTS=[
  // 召唤类（召唤次数上限约50次，成本递增）
  {id:'s1',type:'summon',title:'初出茅庐',desc:'召唤1次',icon:'🐣',cond:g=>g.summonCount>=1},
  {id:'s2',type:'summon',title:'小试牛刀',desc:'召唤10次',icon:'🐥',cond:g=>g.summonCount>=10},
  {id:'s3',type:'summon',title:'渐入佳境',desc:'召唤30次',icon:'🐤',cond:g=>g.summonCount>=30},
  {id:'s4',type:'summon',title:'龙腾四海',desc:'召唤60次',icon:'🐉',cond:g=>g.summonCount>=60},
  // 合成类（网格上限约37次有效合成）
  {id:'m1',type:'merge',title:'初次融合',desc:'合成1次',icon:'⚡',cond:g=>g.mergeCount>=1},
  {id:'m2',type:'merge',title:'融合达人',desc:'合成15次',icon:'⚡⚡',cond:g=>g.mergeCount>=15},
  {id:'m3',type:'merge',title:'融合宗师',desc:'合成25次',icon:'⚡⚡⚡',cond:g=>g.mergeCount>=25},
  // 产出类（用历史总产出，不受金币花销影响）
  {id:'c1',type:'coin',title:'日进斗金',desc:'累计产出10K金币',icon:'💰',cond:g=>(g.totalCoins||0)>=10000},
  {id:'c2',type:'coin',title:'富甲一方',desc:'累计产出100K金币',icon:'💎',cond:g=>(g.totalCoins||0)>=100000},
  {id:'c3',type:'coin',title:'富可敌国',desc:'累计产出1M金币',icon:'👑',cond:g=>(g.totalCoins||0)>=1000000},
  {id:'c4',type:'coin',title:'宇宙财阀',desc:'累计产出10M金币',icon:'🌌',cond:g=>(g.totalCoins||0)>=10000000},
  // 收集/段位类（拥有不同等级灵兽的数量）
  {id:'r1',type:'rank',title:'初窥门径',desc:'拥有3种等级灵兽',icon:'🔰',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=3},
  {id:'r2',type:'rank',title:'小有所成',desc:'拥有6种等级灵兽',icon:'🥉',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=6},
  {id:'r3',type:'rank',title:'大有可观',desc:'拥有10种等级灵兽',icon:'🥈',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=10},
  {id:'r4',type:'rank',title:'天师之境',desc:'拥有14种等级灵兽',icon:'🏆',cond:g=>new Set(g.dragons.map(d=>d.level)).size>=14},
  // 最高灵兽等级
  {id:'l1',type:'level',title:'灵通初显',desc:'最高灵兽达到Lv5',icon:'⭐',cond:g=>Math.max(0,...g.dragons.map(d=>d.level||0))>=5},
  {id:'l2',type:'level',title:'通灵之境',desc:'最高灵兽达到Lv8',icon:'⭐⭐',cond:g=>Math.max(0,...g.dragons.map(d=>d.level||0))>=8},
  {id:'l3',type:'level',title:'神兽觉醒',desc:'最高灵兽达到Lv10',icon:'🌟',cond:g=>Math.max(0,...g.dragons.map(d=>d.level||0))>=10},
  {id:'l4',type:'level',title:'天命所归',desc:'最高灵兽达到Lv15',icon:'💫',cond:g=>Math.max(0,...g.dragons.map(d=>d.level||0))>=15},
  // 连击
  {id:'b1',type:'combo',title:'连击新星',desc:'达成5连击',icon:'🔥',cond:g=>g.combo>=5},
  {id:'b2',type:'combo',title:'连击达人',desc:'达成10连击',icon:'🔥🔥',cond:g=>g.combo>=10},
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
      // 居中成就弹窗
      const mask=document.createElement('div');
      mask.id='ach_'+a.id;
      mask.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity .3s ease;';
      mask.innerHTML=`<div style="text-align:center;animation:achPopIn .5s ease forwards;">
        <div style="background:linear-gradient(160deg,#1a1a3a,#2a1a5a);border:1.5px solid #ffd700;border-radius:24px;padding:28px 32px;min-width:220px;box-shadow:0 0 60px rgba(255,215,0,.25),0 20px 60px rgba(0,0,0,.8);">
          <div style="font-size:48px;margin-bottom:8px;filter:drop-shadow(0 0 20px rgba(255,215,0,.6));">${a.icon}</div>
          <div style="font-size:11px;color:#ffd700;font-weight:600;letter-spacing:2px;margin-bottom:10px;">🏅 成就达成</div>
          <div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:6px;">${a.title}</div>
          <div style="font-size:12px;color:#888;margin-bottom:4px;">${a.desc}</div>
          <div style="font-size:11px;color:#555;margin-top:12px;">自动关闭</div>
        </div>
      </div>`;
      document.body.appendChild(mask);
      // 淡入
      requestAnimationFrame(()=>{mask.style.opacity='1';});
      if(playSound) playSound('achieve');
      // 自动关闭
      const remove=()=>{mask.style.opacity='0';mask.style.transition='opacity .4s ease';setTimeout(()=>mask.remove(),450);};
      mask.addEventListener('click',remove);
      setTimeout(remove,2800);
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
  const names=['🌪️ 极凶','🌧️ 小凶','☀️ 平','🌤️ 小吉','<span class="qi-icon qi-icon-sm"></span> 大吉'];
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
  const names=['🌪️ 极凶','🌧️ 小凶','☀️ 平','🌤️ 小吉','<span class="qi-icon qi-icon-sm"></span> 大吉'];
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
    summonLowRate: c.mu>0 ? [0,.1,.25,.5][c.mu] : 0,
    mergeBonus:   c.huo>0 ? [0,.05,.15,.3][c.huo] : 0,
    coinBonus:    c.tu>0 ? [0,.1,.25,.5][c.tu] : 0,
    highRate:     c.kin>0 ? [0,.1,.25,.5][c.kin] : 0,
    qiRate:        QI_RATE[Math.min(Object.values(c).reduce((a,b)=>a+b,0),7)]||0,
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
      <span>当前拥有 <span style="color:#ffd700;font-weight:700;"><span class="qi-icon qi-icon-sm"></span> ${G.qi}</span> 龙气</span>
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
              ${done?'<div style="font-size:14px;">✅</div>':`<div style="font-size:9px;color:${canAfford&&isNext?'#ffd700':'#555'};"><span class="qi-icon qi-icon-sm"></span>${n.cost}</div>`}
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
          <span style="font-size:15px;"><span class="qi-icon qi-icon-sm"></span></span><div><div style="font-size:10px;color:#555;">龙气回复</div><div style="font-size:13px;color:#ffd700;font-weight:700;">+${bonus.qiRate}/min</div></div>
        </div>
      </div>
    </div>
  </div>`;
}


function renderHandbook(){
  var p=document.getElementById('handbookPanel');
  if(!p)return;
  if(!window._handTab)window._handTab='level';
  var tab=window._handTab;
  if(tab==='level'){
    var owned={};
    G.dragons.forEach(function(d){owned[d.level]=true;});
    var total=15;
    var done=Object.keys(owned).length;
    var pct=Math.round(done/total*100);
    var rate=Object.values(COIN_S).slice(1);
    var rcolors={'普通':'#888','稀有':'#4caf50','珍稀':'#2196f3','传说':'#9c27b0','史诗':'#ff9800','神话':'#ffd700'};
    var items='';
    for(var lv=1;lv<=15;lv++){
      var isDone=!!owned[lv];
      var rarity=lv<=2?'普通':lv<=4?'稀有':lv<=7?'珍稀':lv<=10?'传说':lv<=13?'史诗':'神话';
      items+='<div style="background:'+(isDone?'rgba(255,215,0,.06)':'rgba(255,255,255,.02)')+';border:1.5px solid '+(isDone?'rgba(255,215,0,.3)':'rgba(255,255,255,.06)')+';border-radius:14px;padding:14px 6px;text-align:center;'+(isDone?'':'opacity:.4')+'">'
        +'<div style="font-size:32px;margin-bottom:4px;">'+(LICON[lv]||'?')+'</div>'
        +'<div style="font-size:11px;font-weight:700;color:'+(isDone?'#ffd700':'#666')+';">'+(LNAME[lv]||'?')+'</div>'
        +'<div style="font-size:10px;color:'+rcolors[rarity]+';margin:3px 0;">'+rarity+'</div>'
        +'<div style="font-size:10px;color:'+(isDone?'#ffd700':'#555')+';">Lv'+lv+' &middot; +'+(rate[lv-1]||0)+'/s</div>'
        +'</div>';
    }
    var tabBar='<div style="display:flex;gap:8px;margin-bottom:16px;">'
      +'<button onclick="window._handTab=\'level\';renderHandbook();" style="flex:1;padding:8px 0;border-radius:10px;font-size:12px;font-weight:700;border:none;cursor:pointer;background:'+(tab==='level'?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)')+';color:'+(tab==='level'?'#ffd700':'#888')+';">📊 等级</button>'
      +'<button onclick="window._handTab=\'zodiac\';renderHandbook();" style="flex:1;padding:8px 0;border-radius:10px;font-size:12px;font-weight:700;border:none;cursor:pointer;background:'+(tab==='zodiac'?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)')+';color:'+(tab==='zodiac'?'#ffd700':'#888')+';">🏆 属相</button>'
      +'</div>';
    p.innerHTML='<div style="padding:20px 16px 60px;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
      +'<div style="font-size:16px;font-weight:700;">📖 灵兽图鉴</div>'
      +'<div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeHandbook()">✕</div>'
      +'</div>'
      +tabBar
      +'<div style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:14px;padding:14px;margin-bottom:16px;text-align:center;">'
      +'<div style="font-size:13px;color:#ffd700;margin-bottom:8px;">收集进度</div>'
      +'<div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin-bottom:6px;">'
      +'<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#ffd700,#ff8c00);border-radius:4px;transition:width .5s;"></div>'
      +'</div>'
      +'<div style="font-size:11px;color:#888;">'+pct+'% 完成 &middot; 已解锁 '+done+' 种灵兽</div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">'+items+'</div>'
      +'</div>';
  } else {
    // 属相图鉴
    var atlas=G.unlockedAtlas||(G.zodiac>=0?[G.zodiac]:[]);
    var atlasDone=atlas.length;
    var atlasPct=Math.round(atlasDone/12*100);
    var zNames=['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
    var zitems='';
    for(var zi=0;zi<12;zi++){
      var unlocked=atlas.indexOf(zi)>=0;
      var isSelf=zi===G.zodiac;
      var lore=ZOD_LORE[zi]||'';
      var zstyle='border-radius:14px;padding:14px 10px;text-align:center;'
        +(unlocked?'background:rgba(255,215,0,.06);border:1.5px solid rgba(255,215,0,.3);':'background:rgba(0,0,0,.2);border:1.5px solid rgba(255,255,255,.06);opacity:.55;');
      var loreText=unlocked?('<div style="font-size:10px;color:#999;line-height:1.5;margin-top:6px;text-align:left;">'+lore+'</div>'):'';
      var unlockBtn='';
      if(!unlocked){
        var canAfford=G.qi>=ZOD_UNLOCK_COST;
        unlockBtn='<button onclick="unlockZodiac('+zi+')" style="margin-top:8px;padding:5px 8px;font-size:11px;border-radius:8px;border:none;cursor:pointer;background:'+(canAfford?'rgba(255,215,0,.15)':'rgba(255,255,255,.05)')+';color:'+(canAfford?'#ffd700':'#555')+';">'+(isSelf?'初始':'<span class="qi-icon qi-icon-sm"></span> '+ZOD_UNLOCK_COST+' 解锁')+'</button>';
      } else if(isSelf){
        unlockBtn='<div style="margin-top:8px;font-size:10px;color:#ffd700;">初始解锁</div>';
      } else {
        unlockBtn='<div style="margin-top:8px;font-size:10px;color:#4caf50;">已解锁 ✓</div>';
      }
      zitems+='<div style="'+zstyle+'">'
        +'<div style="font-size:30px;margin-bottom:4px;">'+(unlocked?ZOD_E[zi]:'🔒')+'</div>'
        +'<div style="font-size:12px;font-weight:700;color:'+(unlocked?'#ffd700':'#555')+';">'+zNames[zi]+'</div>'
        +loreText+unlockBtn
        +'</div>';
    }
    var tabBar='<div style="display:flex;gap:8px;margin-bottom:16px;">'
      +'<button onclick="window._handTab=\'level\';renderHandbook();" style="flex:1;padding:8px 0;border-radius:10px;font-size:12px;font-weight:700;border:none;cursor:pointer;background:'+(tab==='level'?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)')+';color:'+(tab==='level'?'#ffd700':'#888')+';">📊 等级</button>'
      +'<button onclick="window._handTab=\'zodiac\';renderHandbook();" style="flex:1;padding:8px 0;border-radius:10px;font-size:12px;font-weight:700;border:none;cursor:pointer;background:'+(tab==='zodiac'?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)')+';color:'+(tab==='zodiac'?'#ffd700':'#888')+';">🏆 属相</button>'
      +'</div>';
    p.innerHTML='<div style="padding:20px 16px 60px;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
      +'<div style="font-size:16px;font-weight:700;">📖 灵兽图鉴</div>'
      +'<div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeHandbook()">✕</div>'
      +'</div>'
      +tabBar
      +'<div style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:14px;padding:14px;margin-bottom:16px;text-align:center;">'
      +'<div style="font-size:13px;color:#ffd700;margin-bottom:8px;">🏆 属相收藏</div>'
      +'<div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin-bottom:6px;">'
      +'<div style="height:100%;width:'+atlasPct+'%;background:linear-gradient(90deg,#ffd700,#ff8c00);border-radius:4px;transition:width .5s;"></div>'
      +'</div>'
      +'<div style="font-size:11px;color:#888;">'+atlasPct+'% 已解锁 '+atlasDone+'/12 属相</div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">'+zitems+'</div>'
      +'</div>';
  }
}


// ===== 每日签到 =====
function getSignDay(){return ((G.signStreak||0)%7)||7;}
function canSignToday(){
  if(!G.signDate)return true;
  return G.signDate!==today();
}


// ===== 每周挑战系统 =====
const WEEKLY_CHALLENGES = [
  {id:'w_summon', icon:'🐣', title:'召唤大业', desc:'本周累计召唤80次', target:80,
   reward:{coin:20000, qi:200},
   getter:g => g.summonCount||0},
  {id:'w_merge',  icon:'⚡', title:'融合大师', desc:'本周累计合成40次', target:40,
   reward:{coin:25000, qi:250},
   getter:g => g.mergeCount||0},
  {id:'w_coins',  icon:'💰', title:'财运亨通', desc:'本周累计产出1M金币', target:1000000,
   reward:{coin:30000, qi:300},
   getter:g => g._weeklyCoins||0},
  {id:'w_collect',icon:'🐉', title:'收集达人', desc:'拥有10种等级灵兽', target:10,
   reward:{coin:25000, qi:250},
   getter:g => new Set(g.dragons.map(d=>d.level)).size},
  {id:'w_maxlv',  icon:'🏆', title:'天师之境', desc:'最高灵兽达到Lv10', target:10,
   reward:{coin:40000, qi:400},
   getter:g => Math.max(0, ...(g.dragons.map(d=>d.level||0)))},
  {id:'w_sign',   icon:'🔥', title:'全勤周',   desc:'本周7天每天都签到', target:7,
   reward:{coin:50000, qi:500},
   getter:g => g._weeklySignDays||0},
  {id:'w_combo',  icon:'💫', title:'连击宗师', desc:'累计达成30次combo', target:30,
   reward:{coin:60000, qi:600},
   getter:g => g._weeklyCombo||0},
];

function getWeekId(){
  const d = new Date();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return monday.toISOString().slice(0,10); // "2026-06-30"
}

function initWeekly(){
  if(!G.weekly) G.weekly = { weekId:null, challenges:{}, totalCoins:0, signDays:0, combo:0 };
  const wid = getWeekId();
  if(G.weekly.weekId !== wid){
    // 新的一周，重置挑战进度（保留已领取状态用于展示）
    G.weekly = { weekId:wid, challenges:{}, totalCoins:0, signDays:0, combo:0 };
    saveGame();
  }
  // 同步全局计数器到周计数器
  G._weeklyCoins  = G.weekly.totalCoins;
  G._weeklySignDays = G.weekly.signDays;
  G._weeklyCombo  = G.weekly.combo;
}

function _onWeeklyEvent(type){
  if(!G.weekly || !G.created) return;
  const wid = getWeekId();
  if(G.weekly.weekId !== wid) return; // 不同周不累加
  if(type === 'summon'){
    // summonCount 本身累计，挑战用 getter 直接读全局
  }
  if(type === 'sign'){
    G.weekly.signDays = Math.min(7, (G.weekly.signDays||0)+1);
    G._weeklySignDays = G.weekly.signDays;
    saveGame();
  }
  if(type === 'combo'){
    G.weekly.combo = (G.weekly.combo||0) + 1;
    G._weeklyCombo = G.weekly.combo;
    saveGame();
  }
  if(type === 'merge'){
    // mergeCount 本身累计
  }
  if(type === 'coins'){
    // calcCps 时自动更新
  }
}

// 在 calcCps 或 updateHud 中调用，更新周金币计数
function _trackWeeklyCoins(){
  if(!G.weekly || !G.created) return;
  const wid = getWeekId();
  if(G.weekly.weekId !== wid) return;
  const cps = calcCps();
  G.weekly.totalCoins = (G.weekly.totalCoins||0) + cps;
  G._weeklyCoins = G.weekly.totalCoins;
  saveGame();
}

function getWeeklyChallengeState(id){
  const ch = WEEKLY_CHALLENGES.find(c=>c.id===id);
  if(!ch) return {progress:0, claimed:false, done:false};
  const claimed = G.weekly && G.weekly.challenges && G.weekly.challenges[id];
  const progress = ch.getter(G);
  return {progress, claimed:!!claimed, done:progress>=ch.target};
}

function claimWeeklyChallenge(id){
  if(!G.created) return;
  const state = getWeeklyChallengeState(id);
  if(state.claimed){ showNotif('info','已领取'); return; }
  if(!state.done){ showNotif('info','挑战未完成'); return; }
  const ch = WEEKLY_CHALLENGES.find(c=>c.id===id);
  G.coins += ch.reward.coin;
  G.qi    += ch.reward.qi;
  if(!G.weekly) G.weekly = {weekId:getWeekId(), challenges:{}, totalCoins:0, signDays:0, combo:0};
  G.weekly.challenges[id] = true;
  saveGame();
  updateHud();
  if(playSound) playSound('achieve');
  showNotif('success','🏆 '+ch.title+' 领取成功！💰+'+fmtNum(ch.reward.coin)+' <span class="qi-icon qi-icon-sm"></span>+'+ch.reward.qi);
  openWeeklyPanel(); // 刷新面板

  // 检查是否全部完成 → 额外奖励
  const allDone = WEEKLY_CHALLENGES.every(c => {
    const s = getWeeklyChallengeState(c.id);
    return s.done && s.claimed;
  });
  if(allDone){
    const extraItem = G.items && G.items.find(i=>i.id==='i2');
    const extraTicket = G.items && G.items.find(i=>i.id==='i3');
    if(extraItem)  extraItem.count++;
    if(extraTicket) extraTicket.count++;
    saveGame();
    showNotif('gold','🎉 本周挑战全完成！🛡保护符+🛡召唤券各×1');
  }
}

// 渲染每周挑战面板（暴露给 ui.js 调用）
function renderWeeklyPanel(){
  const p = document.getElementById('weeklyPanel');
  if(!p) return;

  const wid = getWeekId();
  const monday = new Date(wid);
  const sunday = new Date(monday); sunday.setDate(monday.getDate()+6);
  const fmt = d => (d.getMonth()+1)+'/'+d.getDate();
  const weekRange = fmt(monday)+' - '+fmt(sunday);

  const rows = WEEKLY_CHALLENGES.map(ch => {
    const {progress, claimed, done} = getWeeklyChallengeState(ch.id);
    const pct = Math.min(100, Math.round(progress/ch.target*100));
    const canClaim = done && !claimed;
    const color = claimed ? '#4caf50' : done ? '#ffd700' : '#666';
    const borderColor = canClaim ? 'rgba(255,215,0,.4)' : claimed ? 'rgba(76,175,80,.2)' : 'rgba(255,255,255,.05)';
    const bg = canClaim ? 'rgba(255,215,0,.06)' : claimed ? 'rgba(76,175,80,.04)' : 'rgba(255,255,255,.025)';
    return `<div style="margin-bottom:12px;background:${bg};border:1px solid ${borderColor};border-radius:12px;padding:12px 14px;${claimed?'opacity:.65;':''}${canClaim?'box-shadow:0 0 12px rgba(255,215,0,.2);':''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:20px;">${ch.icon}</span>
          <div>
            <div style="font-size:13px;font-weight:700;color:${color};">${ch.title}</div>
            <div style="font-size:11px;color:#666;margin-top:2px;">${ch.desc}</div>
          </div>
        </div>
        ${claimed ? `<div style="font-size:12px;color:#4caf50;font-weight:700;">✅ 已领取</div>` :
          canClaim ? `<button onclick="claimWeeklyChallenge('${ch.id}')" style="background:linear-gradient(135deg,#ffd700,#ff9800);border:none;color:#1a0a00;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;cursor:pointer;">🎁 领取</button>` :
          `<div style="font-size:11px;color:#555;padding-top:4px;">进行中</div>`}
      </div>
      <div style="height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;margin-bottom:6px;">
        <div style="height:100%;width:${pct}%;background:${done?'#ffd700':'#a0d8ef'};border-radius:3px;transition:width .4s ease;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:10px;color:#555;">${done?'':'进度: '+progress+'/'+ch.target}</span>
        <span style="font-size:10px;color:#ffd700;">💰${fmtNum(ch.reward.coin)} <span class="qi-icon qi-icon-sm"></span>+${ch.reward.qi}</span>
      </div>
    </div>`;
  });

  const doneCount = WEEKLY_CHALLENGES.filter(c => {
    const s = getWeeklyChallengeState(c.id);
    return s.claimed;
  }).length;

  const allDone = WEEKLY_CHALLENGES.every(c => {
    const s = getWeeklyChallengeState(c.id);
    return s.done && s.claimed;
  });

  p.innerHTML = `<div style="padding:20px 16px 80px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div style="font-size:16px;font-weight:700;">🏆 本周挑战</div>
      <div style="font-size:12px;color:#ffd700;">${doneCount}/${WEEKLY_CHALLENGES.length} 已领</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeWeeklyPanel()">✕ 关闭</div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:8px 14px;background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.12);border-radius:10px;font-size:11px;color:#ffd700;">
      <span>📅 ${weekRange}</span>
      <span style="color:#555;">每周一00:00重置</span>
    </div>
    ${allDone ? `<div style="background:linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,140,0,.08));border:1px solid rgba(255,215,0,.3);border-radius:12px;padding:12px 14px;text-align:center;margin-bottom:14px;box-shadow:0 0 20px rgba(255,215,0,.15);">
      <div style="font-size:14px;color:#ffd700;font-weight:700;">🎉 本周挑战全部完成！</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">🛡保护符+🛡召唤券各×1 已发放</div>
    </div>` : ''}
    ${rows.join('')}
  </div>`;
  p.classList.add('open');
}

function openWeeklyPanel(){
  initWeekly();
  renderWeeklyPanel();
}
function closeWeeklyPanel(){
  const p = document.getElementById('weeklyPanel');
  if(p) p.classList.remove('open');
}

function renderSignPanel(){
  const p=document.getElementById('signPanel');
  const todayDone=!canSignToday();
  const streak=G.signStreak||0;
  // ===== 日历视图 =====
  const now=new Date();
  const calYear=parseInt(p.dataset.calYear||now.getFullYear());
  const calMonth=parseInt(p.dataset.calMonth||(now.getMonth()+1));
  const firstDay=new Date(calYear,calMonth-1,1).getDay();
  const daysInMonth=new Date(calYear,calMonth,0).getDate();
  const today=now.getDate();
  const isCurrentMonth=calYear===now.getFullYear()&&calMonth===now.getMonth()+1;
  const signedDays=G.signHistory||{};
  const calKey=calYear+'-'+String(calMonth).padStart(2,'0');
  const signedThisMonth=signedDays[calKey]||[];
  const monthNames=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const weekDays=['日','一','二','三','四','五','六'];
  let calCells='';
  // 空格子
  for(let i=0;i<firstDay;i++)calCells+='<div></div>';
  for(let d=1;d<=daysInMonth;d++){
    const signed=signedThisMonth.includes(d);
    const isToday=isCurrentMonth&&d===today;
    const isFuture=isCurrentMonth&&d>today;
    calCells+=`<div class="cal-cell${signed?' signed':''}${isToday?' today':''}${isFuture&&!signed?' future':''}">${d}</div>`;
  }
  const canPrev=calYear>2024||(calYear===2024&&calMonth>1);
  p.innerHTML=`<div style="padding:20px 16px 80px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div style="font-size:16px;font-weight:700;">🎁 每日签到</div>
      <div style="font-size:12px;color:#ffd700;">🔥 连续 ${streak} 天</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeSignPanel()">✕ 关闭</div>
    </div>
    <div class="cal-nav">
      <button class="cal-nav-btn" onclick="var p=document.getElementById('signPanel');var m=${calMonth}-1;var y=${calYear};if(m<1){m=12;y--;}p.dataset.calYear=y;p.dataset.calMonth=m;renderSignPanel();">◀ 上一月</button>
      <span style="font-size:13px;color:#ffd700;font-weight:700;">${calYear}年 ${monthNames[calMonth-1]}</span>
      <button class="cal-nav-btn" onclick="var p=document.getElementById('signPanel');var m=${calMonth}+1;var y=${calYear};if(m>12){m=1;y++;}p.dataset.calYear=y;p.dataset.calMonth=m;renderSignPanel();">下一月 ▶</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:4px;">${weekDays.map(d=>`<div style="text-align:center;font-size:9px;color:#555;padding:3px 0;">${d}</div>`).join('')}${calCells}</div>
    <div class="cal-grid" style="display:none"></div>
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
        <span style="font-size:11px;color:${active?'#ffd700':'#666'};">💰+${fmtNum(r.coin)} <span class="qi-icon qi-icon-sm"></span>+${r.qi}${r.free>0?' 🆓+'+r.free+'召唤':''}</span>
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
  // 写入历史（供日历用）
  const now2=new Date();
  const y=now2.getFullYear(),m=now2.getMonth()+1;
  const key=y+'-'+String(m).padStart(2,'0');
  if(!G.signHistory)G.signHistory={};
  if(!G.signHistory[key])G.signHistory[key]=[];
  if(!G.signHistory[key].includes(now2.getDate()))G.signHistory[key].push(now2.getDate());
  saveGame();
  updateHud();
  if(playSound) playSound('achieve');
  const btn=document.getElementById('signBtn');
  if(btn){
    btn.style.background='rgba(76,175,80,.15)';
    btn.style.border='1.5px solid rgba(76,175,80,.4)';
    btn.innerHTML='<div style="font-size:13px;color:#4caf50;font-weight:700;">✅ 签到成功！</div><div style="font-size:11px;color:#aaa;margin-top:4px;">💰+'+fmtNum(reward.coin)+' <span class="qi-icon qi-icon-sm"></span>+'+reward.qi+(reward.free>0?' 🆓+'+reward.free+'次召唤':'')+'</div>';
    btn.style.cursor='default';
    btn.onclick=null;
  }
  _onWeeklyEvent('sign');
  showNotif('success','🎉 连续签到第'+G.signStreak+'天 · 💰+'+fmtNum(reward.coin)+' <span class="qi-icon qi-icon-sm"></span>+'+reward.qi+(reward.free>0?' 🆓+'+reward.free+'召唤':''));
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



// ===== 每日任务 =====
function getTaskProgress(task){
  if(!G.created)return 0;
  switch(task.id){
    case 'summon10': case 'summon30': return G.summonCount||0;
    case 'merge10':  case 'merge30':  return G.mergeCount||0;
    case 'login': return 1; // 每日登录任务，只要当天就算登录
    default: return 0;
  }
}
function taskDone(id){
  const ts=G.tasks||{};
  return !!(ts[id]&&ts[id].claimed);
}
function renderTaskPanel(){
  if(!G.tasks) G.tasks={};
  TASKS.forEach(t=>{
    if(!G.tasks[t.id]) G.tasks[t.id]={progress:0,claimed:false};
    G.tasks[t.id].progress=getTaskProgress(t);
  });
  saveGame();
  const panel=document.getElementById('taskPanel');
  if(!panel) return;
  const doneCount=TASKS.filter(t=>taskDone(t.id)).length;
  // 计算距次日0点的秒数
  const now=new Date(),midnight=new Date(now);midnight.setDate(midnight.getDate()+1);midnight.setHours(0,0,0,0);
  const secs=Math.max(1,Math.round((midnight-now)/1000));
  const h=String(Math.floor(secs/3600)).padStart(2,'0');
  const m=String(Math.floor((secs%3600)/60)).padStart(2,'0');
  const s=String(secs%60).padStart(2,'0');
  panel.innerHTML=`<div style="padding:20px 16px 80px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div style="font-size:16px;font-weight:700;">📋 每日任务</div>
      <div style="font-size:12px;color:#ffd700;">${doneCount}/${TASKS.length} 完成</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeTaskPanel()">✕ 关闭</div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:8px 14px;background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.12);border-radius:10px;font-size:11px;color:#ffd700;">
      <span>🎯 达成后点击「领取」</span>
      <span id="taskCountdown">⏰ 重置: ${h}:${m}:${s}</span>
    </div>
    <div id="taskListArea">${TASKS.map(t=>{
      const prog=Math.min(getTaskProgress(t),t.target);
      const pct=Math.round(prog/t.target*100);
      const done=taskDone(t.id);
      const completed=prog>=t.target&&!done;
      return `<div style="margin-bottom:12px;background:rgba(255,255,255,.025);border:1px solid ${done?'rgba(76,175,80,.2)':completed?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)'};border-radius:12px;padding:12px 14px;${done?'opacity:.6;':''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:20px;">${t.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:${done?'#4caf50':completed?'#ffd700':'#ccc'};${t.title}</div>
              <div style="font-size:11px;color:#666;margin-top:2px;">${t.desc}</div>
            </div>
          </div>
          ${done?`<div style="font-size:12px;color:#4caf50;font-weight:700;">✅ 已领取</div>`:
            completed?`<button onclick="claimTask('${t.id}')" style="background:linear-gradient(135deg,#ffd700,#ff9800);border:none;color:#1a0a00;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;cursor:pointer;">🎁 领取</button>`:
            `<div style="font-size:11px;color:#666;">进行中</div>`}
        </div>
        <div style="height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${done?'#4caf50':completed?'#ffd700':'#a0d8ef'};border-radius:3px;transition:width .4s ease;${completed?'box-shadow:0 0 8px rgba(255,215,0,.3);':''}"></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
          <span style="font-size:10px;color:#555;">${completed?'':'进度: '+prog+'/'+t.target}</span>
          <span style="font-size:10px;color:#ffd700;">💰${t.reward.coin>=1000?t.reward.coin/1000+'K':t.reward.coin} <span class="qi-icon qi-icon-sm"></span>+${t.reward.qi}${t.reward.free?' 🆓+'+t.reward.free+'次':''}</span>
        </div>
      </div>`;}).join('')}
    </div>
  </div>`;
  // 倒计时每秒更新
  let _remaining=secs;
  const _cdTimer=setInterval(()=>{
    const el=document.getElementById('taskCountdown');
    if(!el||!document.getElementById('taskListArea')){clearInterval(_cdTimer);return;}
    _remaining--;
    if(_remaining<=0){clearInterval(_cdTimer);location.reload();return;}
    const h=String(Math.floor(_remaining/3600)).padStart(2,'0');
    const m=String(Math.floor((_remaining%3600)/60)).padStart(2,'0');
    const s=String(_remaining%60).padStart(2,'0');
    el.textContent='⏰ 重置: '+h+':'+m+':'+s;
  },1000);
  panel.classList.add('open');
  panel.classList.add('open');
}

function openTaskPanel(){renderTaskPanel();}
function closeTaskPanel(){const p=document.getElementById('taskPanel');if(p)p.classList.remove('open');}

function claimTask(id){
  if(!G.created)return;
  const t=TASKS.find(t=>t.id===id);
  if(!t)return;
  const ts=G.tasks||{};
  if(!ts[id])ts[id]={progress:0,claimed:false};
  if(ts[id].claimed){showNotif('info','已领取');return;}
  if(getTaskProgress(t)<t.target){showNotif('info','任务未完成');return;}
  G.coins+=t.reward.coin;
  G.qi+=t.reward.qi;
  G.freeLeft+=t.reward.free;
  ts[id].claimed=true;
  G.tasks=ts;
  saveGame();
  updateHud();
  if(playSound) playSound('achieve');
  showNotif('success','✅ 领取成功！💰+'+fmtNum(t.reward.coin)+' <span class="qi-icon qi-icon-sm"></span>+'+t.reward.qi+(t.reward.free?' 🆓+'+t.reward.free+'召唤':''));
  renderTaskPanel();
}

function checkTaskDaily(){
  if(!G.created)return;
  if(G.lastTaskDate!==today()){
    G.tasks={};
    G.lastTaskDate=today();
    if(!G.tasks.login) G.tasks.login={progress:0,claimed:false};
    G.tasks.login={progress:1,claimed:false};
    saveGame();
  }
}

// ===== 限时活动（占位）=====
function openActivityPanel(){
  const panel=document.getElementById('activityPanel');
  if(!panel) return;
  const active=getActiveActivities();
  panel.innerHTML=`<div style="padding:20px 16px 80px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div style="font-size:16px;font-weight:700;">🏆 本周挑战</div>
      <button onclick="closeActivityPanel();setTimeout(openWeeklyPanel,320);" style="flex:1;margin:0 10px;padding:9px 12px;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.25);border-radius:12px;font-size:12px;color:#ffd700;cursor:pointer;text-align:center;">查看挑战 &rarr;</button>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeActivityPanel()">✕</div>
    </div>
    <div style="font-size:16px;font-weight:700;margin-top:14px;margin-bottom:16px;">🎯 限时活动</div>
      <div style="font-size:12px;color:#ffd700;">${active.length} 个进行中</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeActivityPanel()">✕ 关闭</div>
    </div>
    <div style="font-size:11px;color:#555;margin-bottom:16px;padding:8px 12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:8px;">
      📌 活动自动生效，无需领取<br>
      ⏰ 活动状态随时间/日期变化
    </div>
    ${ACTIVITIES.map(a=>{
      const isActive=a.active();
      return `<div style="margin-bottom:14px;background:rgba(255,255,255,.025);border:1px solid ${isActive?a.color+'55':'rgba(255,255,255,.05)'};border-radius:14px;padding:16px;${isActive?'box-shadow:0 0 20px '+a.color+'18;':''}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:28px;${isActive?'':'filter:grayscale(1);opacity:.5;'}">${a.icon}</span>
          <div>
            <div style="font-size:14px;font-weight:700;color:${isActive?a.color:'#555'};">${a.name}</div>
            <div style="font-size:11px;color:#666;margin-top:2px;">${a.desc}</div>
          </div>
          <div style="margin-left:auto;">
            ${isActive?'<div style="background:'+a.color+';color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;">🔥 进行中</div>':'<div style="background:rgba(255,255,255,.05);color:#555;font-size:10px;padding:3px 10px;border-radius:20px;">未激活</div>'}
          </div>
        </div>
        ${isActive?'<div style="background:linear-gradient(135deg,'+a.color+'22,transparent);border:1px solid '+a.color+'33;border-radius:8px;padding:8px 12px;text-align:center;font-size:13px;color:'+a.color+';font-weight:700;">'+a.tip+'</div>':''}
      </div>`;}).join('')}
    <div id="actCountdown" style="margin-top:10px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:12px 14px;text-align:center;">
      <div style="font-size:11px;color:#ffd700;font-weight:600;margin-bottom:6px;">⏰ 活动倒计时</div>
      <div id="actCdLines" style="font-size:11px;color:#666;line-height:2;"></div>
    </div>
  </div>`;
  panel.classList.add('open');
  // 动态倒计时
  const _actTimer=setInterval(()=>{
    const el=document.getElementById('actCdLines');
    if(!el||!document.getElementById('activityPanel')){clearInterval(_actTimer);return;}
    const now=new Date(),dow=now.getDay(); // 0=周日
    const isWeekend=dow===0||dow===6;
    const isNight=now.getHours()>=20&&now.getHours()<22;
    let lines='';
    if(isWeekend){lines+='<div>🎁 周末双倍 <span style="color:#ff9800;">进行中 🎉</span></div>';}else{
      const sat=new Date(now);sat.setDate(now.getDate()+(6-dow+7)%7);sat.setHours(0,0,0,0);
      const diff=Math.max(0,sat-now);const h=String(Math.floor(diff/3600000)).padStart(2,'0');
      const m=String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
      lines+='<div>🎁 周末双倍 <span style="color:#555;">'+h+':'+m+' 后开启</span></div>';
    }
    if(isNight){lines+='<div>🌙 晚间金币 <span style="color:#7c4dff;">进行中 🎉</span></div>';}else{
      const ns=new Date(now);ns.setHours(20,0,0,0);if(ns<=now)ns.setDate(ns.getDate()+1);
      const diff=Math.max(0,ns-now);const h=String(Math.floor(diff/3600000)).padStart(2,'0');
      const m=String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
      lines+='<div>🌙 晚间金币 <span style="color:#555;">'+h+':'+m+' 后开启</span></div>';
    }
    el.innerHTML=lines;
  },1000);
}

function closeActivityPanel(){
  const p=document.getElementById('activityPanel');
  if(p)p.classList.remove('open');
}


// ===== 游戏统计面板 =====
function getPlayDays(){
  if(!G.created||!G.created)return 1;
  return Math.max(1,Math.floor((Date.now()-new Date(G.created).getTime())/86400000)+1);
}
function openStatsPanel(){
  const panel=document.getElementById('statsPanel');
  if(!panel) return;
  const pdays=getPlayDays();
  const cps=calcCps();
  const totalCoins=G.totalCoins||0;
  const uniqueTypes=new Set(G.dragons.map(d=>d.level)).size;
  const unlockedAch=[..._unlocked].length;
  panel.innerHTML=`<div style="padding:20px 16px 80px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div style="font-size:16px;font-weight:700;">📊 游戏统计</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeStatsPanel()">✕ 关闭</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
      ${[
        ['📅','游玩天数',pdays+' 天'],
        ['🐣','累计召唤',(G.summonCount||0)+' 次'],
        ['⚡','累计合成',(G.mergeCount||0)+' 次'],
        ['🐾','灵兽数量',G.dragons.length+' 只'],
        ['🎨','灵兽种类',uniqueTypes+'/15 种'],
        ['🏅','成就解锁',unlockedAch+'/'+ACHIEVEMENTS.length],
        ['💰','历史总产出',fmtNum(totalCoins)],
        ['⏱️','当前CPS',fmtNum(cps)+'/s'],
      ].map(([icon,label,val])=>`<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px;text-align:center;">
        <div style="font-size:18px;margin-bottom:4px;">${icon}</div>
        <div style="font-size:10px;color:#666;margin-bottom:4px;">${label}</div>
        <div style="font-size:15px;font-weight:700;color:#ffd700;">${val}</div>
      </div>`).join('')}
    </div>
    <div style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:12px 14px;">
      <div style="font-size:12px;color:#ffd700;font-weight:600;margin-bottom:8px;">🎯 命格修炼进度</div>
      ${['木','火','土','金','水'].map((e,i)=>{
        const keys=['mu','huo','tu','kin','shui'];
        const icons=['🌿','🔥','🪨','⚪','💧'];
        const lv=G.cultivation?.[keys[i]]||0;
        const pct=Math.round(lv/3*100);
        return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:14px;">${icons[i]}</span>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
              <span style="font-size:11px;color:#888;">${e} · ${lv}/3层</span>
              <span style="font-size:10px;color:#ffd700;">${pct}%</span>
            </div>
            <div style="height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${icons[i]==='🌿'?'#4caf50':icons[i]==='🔥'?'#f44336':icons[i]==='🪨'?'#795548':icons[i]==='⚪'?'#9e9e9e':'#2196f3'};border-radius:2px;"></div>
            </div>
          </div>
        </div>`;}).join('')}
    </div>
  </div>`;
  panel.classList.add('open');
}
function closeStatsPanel(){
  const p=document.getElementById('statsPanel');
  if(p)p.classList.remove('open');
}

// ===== 新手引导系统 =====
const GUIDE_STEPS = [
  {
    step:1,
    title:'欢迎来到生肖天机！',
    body:'在这里，你将通过召唤与合成，一步步打造属于自己的天命神兽。让我们一起开始吧！',
    target:null,
    pos:'center',
    nextText:'开始探索 →',
  },
  {
    step:2,
    title:'召唤你的第一只灵兽',
    body:'点击底部中央的「💰 金币召唤」，消耗金币召唤一只灵兽。\n\n金币会自动累积，无需手动操作。',
    target:'#btnCoin',
    pos:'top',
    highlight:'rect',
    nextText:'明白了！',
  },
  {
    step:3,
    title:'三种召唤方式',
    body:'💰 金币召唤：消耗累积金币\n<span class="qi-icon qi-icon-sm"></span> 龙气召唤：使用龙气，获得更高品阶\n🆓 免费召唤：每天重置，适合微氪玩家',
    target:'#summonBar',
    pos:'bottom',
    nextText:'继续 →',
  },
  {
    step:4,
    title:'合成升阶，灵兽进化',
    body:'拖动一只灵兽到另一只相同品阶的灵兽上，即可合成升阶！\n\n合成等级越高，产出金币越多！',
    target:'#gridContainer',
    pos:'center',
    nextText:'我学会了！',
  },
  {
    step:5,
    title:'自动产金，积累资源',
    body:'灵兽会自动每秒产出金币 💰\n\n点击左上角的「📊 统计」可以查看详细数据。提升灵兽等级可大幅增加产出！',
    target:'#topHud',
    pos:'bottom',
    nextText:'继续 →',
  },
  {
    step:6,
    title:'每日活动，不要错过',
    body:'📋 每日签到：坚持签到，奖励递增\n📋 每日任务：自动追踪进度，完成领取奖励\n🎁 限时活动：周末双倍召唤、晚间金币时段！',
    target:'[data-fn="sign"]',
    pos:'right',
    nextText:'太好了！',
  },
  {
    step:7,
    title:'恭喜你，探索完成！',
    body:'你已掌握核心玩法。现在去召唤你的第一只灵兽，开启生肖天机之旅吧 🐉\n\n提示：图鉴、排行榜、命格修炼都在侧边栏~',
    target:null,
    pos:'center',
    nextText:'进入游戏 →',
  },
];

function startGuide(){
  G.guideDone = false;
  G.guideStep = 1;
  saveGame();
  showGuideStep(1);
}

function showGuideStep(n){
  const steps = GUIDE_STEPS;
  if(n > steps.length){closeGuide();return;}
  const step = steps[n-1];
  const overlay = document.getElementById('guideOverlay');
  const tooltip = document.getElementById('guideTooltip');
  if(!overlay || !tooltip) return;

  // 清除旧cutout
  overlay.querySelectorAll('.guide-cutout').forEach(e=>e.remove());

  if(step.target){
    // 定位目标元素
    const target = document.querySelector(step.target);
    if(target){
      const r = target.getBoundingClientRect();
      const cutout = document.createElement('div');
      cutout.className = 'guide-cutout';
      cutout.style.cssText = `left:${r.left-6}px;top:${r.top-6}px;width:${r.width+12}px;height:${r.height+12}px;`;
      overlay.appendChild(cutout);
    }
  }

  // 进度点
  const dots = steps.map((_,i)=>`<div class="dot${i+1<n?' done':i+1===n?' active':''}"></div>`).join('');
  // 计算tooltip位置
  let tLeft='50%',tTop='50%',tTransform='translate(-50%,-50%)';
  if(step.pos==='center'){
    tLeft='50%';tTop='50%';tTransform='translate(-50%,-50%)';
  } else if(step.pos==='bottom'){
    tLeft='50%';tTop='auto';tTransform='translate(-50%,0)';
    tBottom=step.target?Math.max(20, window.innerHeight - (document.querySelector(step.target)?.getBoundingClientRect().top||0) + 80)+'px':'20%';
  } else if(step.pos==='top'){
    tLeft='50%';tTop='20px';tTransform='translate(-50%,0)';
  } else if(step.pos==='right'){
    tLeft='50%';tTop='50%';tTransform='translate(-50%,-50%)';
  }

  tooltip.innerHTML=`<div id="guideDots">${dots}</div>
    <div class="guide-step-num">第 ${n} / ${steps.length} 步</div>
    <div class="guide-title">${step.title}</div>
    <div class="guide-body">${step.body.replace(/\n/g,'<br>')}</div>
    <div class="guide-btns">
      ${n>1?'':`<button class="guide-skip" onclick="closeGuide()">跳过引导</button>`}
      <button class="guide-next" onclick="nextGuideStep(${n})">${step.nextText}</button>
    </div>`;
  const _t = step.pos;
  const _topVal = _t==='bottom' ? tBottom : (_t==='top' ? '20px' : '50%');
  tooltip.style.cssText=`left:${tLeft};top:${_topVal};${_t==='bottom'?'bottom:0;top:auto;':''};transform:${tTransform};z-index:9999;`;
  tooltip.classList.add('show');
  overlay.classList.add('active');
}
function nextGuideStep(current){
  showGuideStep(current+1);
}

function closeGuide(){
  const overlay=document.getElementById('guideOverlay');
  const tooltip=document.getElementById('guideTooltip');
  if(overlay){overlay.classList.remove('active');overlay.querySelectorAll('.guide-cutout').forEach(e=>e.remove());}
  G.guideDone=true;
  G.guideStep=GUIDE_STEPS.length+1;
  saveGame();
}

// ===== 离线收益弹窗 =====
function showOfflinePopup(coins, seconds){
  const h = Math.floor(seconds/3600);
  const m = Math.floor((seconds%3600)/60);
  const timeStr = h>0 ? h+'小时'+m+'分钟' : m+'分钟';
  const el=document.createElement('div');
  el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:9999;';
  el.innerHTML=`<div style="background:linear-gradient(160deg,#1a1030,#0d0a20);border:1.5px solid rgba(255,215,0,.35);border-radius:24px;padding:36px 32px;width:min(340px,90vw);text-align:center;animation:popIn .4s cubic-bezier(.34,1.56,.64,1);max-width:340px;">
    <div style="font-size:36px;margin-bottom:12px;animation:floatUp 2s ease-in-out infinite;">💤</div>
    <div style="font-size:11px;color:rgba(255,255,255,.4);letter-spacing:3px;margin-bottom:12px;">离线收益</div>
    <div style="font-size:14px;color:#aaa;margin-bottom:6px;">离线 ${timeStr}</div>
    <div style="font-size:32px;font-weight:900;color:#ffd700;margin:8px 0 16px;">+${fmtNum(coins)} 💰</div>
    <div style="font-size:11px;color:#555;margin-bottom:20px;">离线期间产出 50% 效率（最多8小时）</div>
    <button onclick="this.closest('div').parentElement.remove()" style="background:linear-gradient(135deg,#ffd700,#ff9800);border:none;border-radius:20px;color:#1a0a00;font-size:14px;font-weight:700;padding:10px 32px;cursor:pointer;">收下！</button>
  </div>`;
  document.body.appendChild(el);
}

// ===== 引导重播（不受guideDone限制）=====
function replayGuide(){
  G.guideDone = false;
  localStorage.setItem(SAVE_KEY+'_guide','false');
  G.guideDone = true;
  showGuideStep(1);
}

// ===== 天机随机事件系统 =====
const SKY_EVENTS = [
  {
    id:'coin_rain', icon:'💰', title:'财运亨通',
    desc:'天降横财！所有灵兽产金速度翻倍！',
    duration:45,
    apply(){ this._origCps=typeof calcCps==='function'?calcCps():0; },
    revert(){ G.coins=Math.min(999999999,G.coins+(this._origCps||0)*45); },
    toast:'💰 财运翻倍中！（45秒）',
  },
  {
    id:'summon_luck', icon:'⭐', title:'召唤吉时',
    desc:'灵兽降临！接下来3次召唤概率大幅提升！',
    duration:0,
    apply(){ G._summonBoost=3; },
    revert(){ G._summonBoost=0; },
    toast:'⭐ 召唤吉时！接下来3次必出高阶灵兽！',
  },
  {
    id:'qi_surge', icon:'💎', title:'龙气涌动',
    desc:'龙气大潮！龙气自动回复速度翻3倍！',
    duration:90,
    apply(){ G._qiBoost=true; },
    revert(){ G._qiBoost=false; },
    toast:'💎 龙气涌动！（90秒）',
  },
  {
    id:'coin_bonus', icon:'🌟', title:'天赐宝箱',
    desc:'天赐之礼！直接获得大量金币！',
    duration:0,
    apply(){ const bonus=Math.floor(calcCps()*30);G.coins+=bonus;G.totalCoins=(G.totalCoins||0)+bonus;return bonus;},
    revert(){},
    toast:'🌟 宝箱开启！',
  },
  {
    id:'free_summon', icon:'🎁', title:'免费召唤',
    desc:'天命所归！免费召唤一次！',
    duration:0,
    apply(){ G.freeLeft=(G.freeLeft||0)+1; try{updateFreeBtn();}catch(e){} return 1; },
    revert(){},
    toast:'🎁 免费召唤+1！',
  },
  {
    id:'combo_flash', icon:'🔥', title:'连击风暴',
    desc:'合成成功率大幅提升！',
    duration:60,
    apply(){ G._mergeBoost=true; },
    revert(){ G._mergeBoost=false; },
    toast:'🔥 连击风暴！（60秒）合成成功率+30%',
  },
];

let _skyTimer = null;
let _activeEvent = null;
let _eventTimeout = null;

function checkSkyEvent(force){
  if(!G.created || _activeEvent) return;
  const trigger = force || (Math.random() < 0.15);
  if(!trigger) return;
  const ev = SKY_EVENTS[Math.floor(Math.random()*SKY_EVENTS.length)];
  showSkyEvent(ev);
}

function showSkyEvent(ev){
  _activeEvent = ev;
  const extra = ev.apply()||'';
  if(ev.toast) showNotif('success', ev.toast);
  // 弹窗
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:9998;';
  el.id = '_skyEventPanel';
  el.innerHTML = `<div style="background:linear-gradient(160deg,#1a1030,#0d0a20);border:1.5px solid rgba(255,215,0,.4);border-radius:24px;padding:36px 32px;width:min(340px,90vw);text-align:center;animation:popIn .4s cubic-bezier(.34,1.56,.64,1);max-width:340px;">
    <div style="font-size:44px;margin-bottom:14px;animation:floatUp 2s ease-in-out infinite;">${ev.icon}</div>
    <div style="font-size:11px;color:rgba(255,215,0,.5);letter-spacing:4px;margin-bottom:10px;">天机降临</div>
    <div style="font-size:20px;font-weight:700;color:#ffd700;margin-bottom:10px;">${ev.title}</div>
    <div style="font-size:13px;color:#aaa;line-height:1.7;margin-bottom:20px;">${ev.desc}</div>
    ${ev.duration>0 ? `<div style="font-size:11px;color:#555;margin-bottom:16px;">持续 ${ev.duration} 秒</div>` : ''}
    <button onclick="dismissSkyEvent()" style="background:linear-gradient(135deg,#ffd700,#ff9800);border:none;border-radius:20px;color:#1a0a00;font-size:14px;font-weight:700;padding:10px 32px;cursor:pointer;">${ev.duration>0?'收下':'领取'}</button>
  </div>`;
  document.body.appendChild(el);
  if(ev.duration>0){
    _eventTimeout = setTimeout(()=>dismissSkyEvent(true), ev.duration*1000);
  }
}

function dismissSkyEvent(completed){
  const panel = document.getElementById('_skyEventPanel');
  if(panel) panel.remove();
  if(!completed && _activeEvent){
    try{ _activeEvent.revert(); }catch(e){}
  }
  _activeEvent = null;
  if(_eventTimeout){ clearTimeout(_eventTimeout);_eventTimeout=null; }
  // 再次设置随机触发
  scheduleNextEvent();
}

function scheduleNextEvent(){
  if(_skyTimer) clearTimeout(_skyTimer);
  const delay = (3*60 + Math.random()*2*60)*1000; // 3-5分钟
  _skyTimer = setTimeout(checkSkyEvent, delay);
}

function startSkyEvents(){
  scheduleNextEvent();
  // 开服时也检查一次离线事件
  setTimeout(()=>checkSkyEvent(Math.random()<0.15), 5000);
}

// ===== 属相图鉴解锁 =====
function unlockZodiac(zidx){
  if(G.qi < ZOD_UNLOCK_COST){
    showNotif('warning','龙气不足！需要 '+ZOD_UNLOCK_COST+' <span class="qi-icon qi-icon-sm"></span>，当前只有 '+Math.floor(G.qi)+' <span class="qi-icon qi-icon-sm"></span>');
    return;
  }
  if(!G.unlockedAtlas) G.unlockedAtlas = [];
  if(G.unlockedAtlas.includes(zidx)){
    showNotif('info','该属相已经解锁啦~');
    return;
  }
  G.qi -= ZOD_UNLOCK_COST;
  G.unlockedAtlas.push(zidx);
  saveGame();
  showNotif('success',ZOD_E[zidx]+'属相图鉴解锁成功！');
  renderHandbook();
  updateHud();
}
