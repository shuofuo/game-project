// ===== GAME.js - 生肖天机 =====
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
// v9-fix-tower - 2026-07-03
window._today=today;
function initHomeGesture(){}

function startGame(zz,ff){
  zz=zz??sz??-1; ff=ff??sf??1;
  G.zodiac=zz; G.fate=ff; G.created=true;
  G.unlockedAtlas=[zz];
  G.coins=0; G.qi=0; G.dragons=[]; G.mergeCount=0; G.summonCount=0;
  G.freeLeft=3; G.lastFreeDate=today(); G.currentFate=3;
  if(G.lastFateDate!==today()){rollFate();}
  G.cultivation={mu:0,huo:0,tu:0,kin:0,shui:0}; G.lastQiTime=Date.now();
  G.dragons=[{id:'1',level:1,idx:12},{id:'2',level:1,idx:13}]; nextId=3;
  if(G.lastTaskDate!==today()){G.tasks={};G.lastTaskDate=today();G._qiSpentDaily=0;G.tasks.login={progress:1,claimed:false};}
  saveGame();
  // UI 切换
  var el;
  el=document.getElementById('modal');if(el)el.classList.remove('show');
  el=document.getElementById('loginWrap');if(el)el.style.display='none';
  el=document.getElementById('hudZodiac');if(el)el.textContent=ZOD_E[zz]||'';
  el=document.getElementById('hudYunshi');if(el)el.textContent=YUN_NAMES[G.currentFate-1]+' '+YUN_COIN[G.currentFate-1].toFixed(1);
  el=document.getElementById('gamePage');if(el){el.style.display='flex';el.style.visibility='visible';el.style.opacity='1';}
  el=document.getElementById('btnFree');if(el&&G.fate===2)el.style.display='flex';
  saveGame();renderGrid();updateHud();startCps();try{playFullBgm&&playFullBgm(G.zodiac>-1?G.zodiac:0);}catch(e){}initHomeGesture();
  try{showFeatureButtons();}catch(e){}
  requestAnimationFrame(()=>{try{updateHeroSection();}catch(e){}});
  _initCloudAccount();
  requestAnimationFrame(()=>{setTimeout(()=>{try{updateHeroSection();}catch(e){}},200);});
  setTimeout(()=>{try{renderSkillBar();}catch(e){}},300);
  if(!window._skillBarInterval){
    window._skillBarInterval=setInterval(()=>{try{renderSkillBar();}catch(e){}},2000);
  }
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
    renderGrid();updateHud();startCps();try{playFullBgm&&playFullBgm(G&&G.zodiac>-1?G.zodiac:0);}catch(e){}initHomeGesture();
    requestAnimationFrame(()=>{try{updateHeroSection();}catch(e){}});
    requestAnimationFrame(()=>{setTimeout(()=>{try{updateHeroSection();}catch(e){}},200);});
    setTimeout(()=>{try{renderSkillBar();}catch(e){}},300);
    if(!window._skillBarInterval){
      window._skillBarInterval=setInterval(()=>{try{renderSkillBar();}catch(e){}},2000);
    }
    el=document.getElementById('btnFree');if(el&&G.fate===2)el.style.display='flex';
    try{showFeatureButtons();}catch(e){}
    // 新手引导（首次进入游戏）
    if(!G.guideDone){requestAnimationFrame(()=>{setTimeout(()=>startGuide(),600);});}
    // 首次加载时同步龙数据
    if(!G.dragons||G.dragons.length===0){
      G.dragons=[{id:'1',level:1,idx:12},{id:'2',level:1,idx:13}];
      nextId=3;saveGame();renderGrid();
    }
  }
}

// ===== 召唤翻牌动画 =====
const RARITY=[
  {name:'普通',color:'#aaa',tag:'普通'},
  {name:'稀有',color:'#7eb8ff',tag:'稀有'},
  {name:'史诗',color:'#b57edc',tag:'史诗'},
  {name:'传说',color:'#c8860a',tag:'传说'},
  {name:'神话',color:'#c62828',tag:'神话'},
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
  {id:'s2',name:'金光护体',icon:'🛡',cost:150,qiCost:200,cd:90,desc:'8秒内每次合成额外获得+50%金币',color:'#c8860a',rar:2},
  {id:'s3',name:'龙息吹息',icon:'💨',cost:250,qiCost:400,cd:150,desc:'3秒内金币产出速度×3',color:'#42a5f5',rar:3},
  {id:'s4',name:'天罚雷击',icon:'⚡',cost:300,qiCost:500,cd:180,desc:'随机获得传说级灵兽×1',color:'#9c27b0',rar:3},
  {id:'s5',name:'时光倒流',icon:'⏳',cost:180,qiCost:300,cd:120,desc:'撤销最近一次合成，返还全部消耗',color:'#7c4dff',rar:2},
  {id:'s6',name:'天命召唤',icon:'⭐',cost:500,qiCost:800,cd:300,desc:'必得传说级或以上灵兽',color:'#c62828',rar:4},
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
// ── 灵兽升级系统 ───────────────────────────────────────────
function upgradeCost(level){
  var costs=[0,200,500,1000,2000,4000,8000,16000,30000,50000,80000,120000,180000,260000,380000];
  return costs[level]||0;
}
function upgradeDragon(id){
  var dragon=G.dragons.find(function(d){return d.id===id;});
  if(!dragon){showNotif('error','灵兽不存在');return;}
  if(dragon.level>=15){showNotif('info','已达最高等级');return;}
  var cost=upgradeCost(dragon.level);
  if(G.coins<cost){showNotif('error','金币不足，需要 '+cost+' 金币');return;}
  G.coins-=cost;
  dragon.level++;
  if(window.playSound)try{playSound('summon');}catch(e){}
  saveGame();
  renderGrid();
  updateHud();
  checkAch();
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
    const rarityColor=['','#555','#1565c0','#1976d2','#c8860a'][sk.rar]||'#555';
    const itemCount=G.items&&G.items.find(i=>i.id==='i'+sk.id[1])?(G.items.find(i=>i.id==='i'+sk.id[1]).count):0;
    return `<button class="skill-btn ${disabled?'disabled':''}" onclick="${disabled?'':'activateSkill(\''+sk.id+'\')'}" title="${sk.desc}\n龙气消耗:${sk.qiCost} 冷却:${sk.cd}秒\n品阶:${rarityLabel}">
      <span style="font-size:18px;line-height:1;">${sk.icon}</span>
      <span style="font-size:9px;color:${rarityColor};font-weight:600;line-height:1;">${sk.name}</span>
      <span style="font-size:9px;color:rgba(160,216,239,.7);line-height:1;"><span class="qi-icon qi-icon-sm"></span>${sk.qiCost}</span>
      ${onCooldown?'<div class="skill-cd"><div style="width:'+cdPct+'%;height:100%;background:rgba(0,0,0,.6);position:absolute;left:0;top:0;transition:width 1s linear;"></div>'+cd+'s</div>':''}
    </button>`;
  }).join('');
  // 渲染道具（放在技能条右侧/下方，小图标）
  const invCount=G.items?G.items.filter(i=>i.count>0).length:0;
  if(invCount>0){
    bar.innerHTML+=G.items.filter(it=>it.count>0).map(it=>{
      return `<button class="skill-btn" onclick="useItem('${it.id}')" title="${it.name}: ${it.desc}" style="border-color:rgba(255,215,0,.2);">
        <span style="font-size:20px;">${it.icon}</span>
        <span style="font-size:9px;color:#c8860a;font-weight:700;">${it.count}</span>
      </button>`;
    }).join('');
  }
}

// ── 召唤音效（按稀有度）────────────────────────────────
// 召唤结果音效：按稀有度分级（普通单音→神话四音和弦+泛音）
function playSummonSound(r){
  try{initAudio();}catch(e){}
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
  const pw=document.getElementById('sraPw');if(!pw)return;pw.innerHTML='';const c=['#aaa','#7eb8ff','#b57edc','#c8860a','#ff6b35'][r];const n=[8,12,18,24,32][r];for(let i=0;i<n;i++){const p=document.createElement('div');p.className='sra-p';const ang=Math.random()*Math.PI*2,dist=30+Math.random()*60;const dx=Math.cos(ang)*dist,dy=Math.sin(ang)*dist;const _sz=4+Math.random()*8;p.style.cssText=`left:50%;top:40%;width:${_sz}px;height:${_sz}px;background:${c};--dx:${dx}px;--dy:${dy}px;animation-delay:${Math.random()*.3}s;box-shadow:0 0 ${_sz}px ${c}`;pw.appendChild(p);}
}

// ── 稀有度进度条 ────────────────────────────────────────
function animateRarityBar(r){
  const fill=document.getElementById('sraFill');const bar=document.querySelector('.sra-bar');if(!fill||!bar)return;const colors=['#555','#1565c0','#7b3fcb','#c8860a','#c62828'];fill.style.background=colors[r];fill.style.width='0%';setTimeout(()=>fill.style.width=(20+r*20)+'%',50);}

// ── 新灵兽检测 ──────────────────────────────────────────
function checkNewDragon(lvl){const owned=new Set(G.dragons.map(d=>d.level));return !owned.has(lvl);}

function revealSummon(){
  if(summonRevealed)return;
  summonRevealed=true;
  document.querySelector('.summon-tip').style.display='none';
  document.querySelector('.scard-wrap').style.display='none';
  try{initAudio();}catch(e){}
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
  document.getElementById('sfEmoji').textContent=LICON[lvl]||'?';
  document.getElementById('sfName').textContent=LNAME[lvl]||'灵兽';
  document.getElementById('sfCps').textContent='+'+COIN_S[lvl]+'/s';
  document.querySelector('.scard-front').style.borderColor=rar.color;
  document.getElementById('scard').classList.add('flipped');
  // 0.6秒后显示结果（动画缩短一半）
  setTimeout(function(){
    const anim=document.getElementById('summonResultAnim');
    anim.className='summon-result-anim sra-r'+rar;
    document.getElementById('sraEmoji').textContent=LICON[lvl]||'?';
    document.getElementById('sraName').textContent=LNAME[lvl]||'灵兽';
    document.getElementById('sraDesc').textContent='Lv'+lvl+' · 每秒产金 +'+COIN_S[lvl];
    const tag=document.getElementById('sraTag');
    tag.textContent=rar.tag;
    tag.style.color=rar.color;
    document.getElementById('sraCps').textContent='+'+COIN_S[lvl]+'/s 金币产出';
    document.getElementById('sraNew').style.display=checkNewDragon(lvl)?'block':'none';
    animateRarityBar(rar);
    spawnSummonParticles(rar);
    const gp=document.getElementById('gamePage');
    if(gp){gp.classList.add('screen-shake');setTimeout(function(){gp.classList.remove('screen-shake');},400);}
    const sraEl=document.getElementById('summonResultAnim');
    if(sraEl){sraEl.classList.remove('sra-result-pop');void sraEl.offsetWidth;sraEl.classList.add('sra-result-pop');}
    anim.classList.add('show');
    document.getElementById('sraBtn').style.display='block';
    playSummonSound(rar);
    notifSummon(lvl);
  },600);
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

// ── 单抽：直接展示完整灵兽信息，无翻转无问号 ──────────
function doSummon(level){
  try{initAudio();}catch(e){}
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
  // 召唤记录
  if(!G.summonLog) G.summonLog=[];
  G.summonLog.unshift({level,lvl:level>=6?'传说':level>=4?'稀有':'普通',t:new Date().toLocaleTimeString()});
  if(G.summonLog.length>20) G.summonLog.length=20;
  saveGame();
  // 直接展示结果弹窗
  showSingleSummonResult(level);
}



// ── 单抽结果弹窗：全屏黑遮罩 + 白底卡片，无翻转无问号 ─────────────────
function showSingleSummonResult(level){
  var rarColors=['#555','#1565c0','#7b3fcb','#c8860a','#c62828'];
  var t=rarIdx(level);
  var color=rarColors[t];
  var name=LNAME[level]||'灵兽';
  var icon=LICON[level]||'🐣';
  var cps=COIN_S[level]||0;
  var rarityName=['普通','稀有','史诗','传说','神话'][t]||'普通';

  var html='<div style="padding:28px 28px 24px;text-align:center;background:rgba(255,255,255,.97);border-radius:24px;border:1.5px solid rgba(180,140,80,.3);">';
  html+='<div style="font-size:11px;color:#555;letter-spacing:4px;margin-bottom:12px;font-weight:600;">✦ 召唤结果 ✦</div>';
  html+='<div style="font-size:68px;margin-bottom:10px;line-height:1;">'+icon+'</div>';
  html+='<div style="font-size:22px;font-weight:900;color:#1A1A1A;letter-spacing:3px;margin-bottom:6px;">'+name+'</div>';
  html+='<div style="display:inline-block;font-size:12px;font-weight:700;color:#1A1A1A;padding:3px 14px;border:1.5px solid rgba(180,140,80,.35);border-radius:20px;margin-bottom:8px;">'+rarityName+'</div>';
  html+='<div style="font-size:28px;font-weight:900;color:'+color+';margin:8px 0 2px;">+'+cps+'/s</div>';
  html+='<div style="font-size:12px;color:#555;margin-bottom:20px;">每秒产出金币</div>';
  html+='<div style="display:flex;gap:10px;justify-content:center;">';
  html+='<button onclick="document.getElementById(\'singleSummonOverlay\').remove();try{renderGrid&&renderGrid();updateHud&&updateHud();}catch(e){}" style="flex:1;padding:13px 20px;border-radius:14px;border:none;background:linear-gradient(135deg,#8b6914,#d4a017);color:#1A1A1A;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:3px;box-shadow:0 3px 12px rgba(180,120,20,.3);">收 下</button>';
  html+='</div></div>';

  var old=document.getElementById('singleSummonOverlay');
  if(old)old.remove();
  var overlay=document.createElement('div');
  overlay.id='singleSummonOverlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.58);padding:16px;';
  overlay.innerHTML='<div style="width:min(320px,100%);max-height:88vh;overflow-y:auto;">'+html+'</div>';
  overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
  document.body.appendChild(overlay);
  try{playSound&&playSound('summon');}catch(e){}
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
// ── 灵兽升级系统 ───────────────────────────────────────────
function upgradeCost(level){
  var costs=[0,200,500,1000,2000,4000,8000,16000,30000,50000,80000,120000,180000,260000,380000];
  return costs[level]||0;
}
function upgradeDragon(id){
  var dragon=G.dragons.find(function(d){return d.id===id;});
  if(!dragon){showNotif('error','灵兽不存在');return;}
  if(dragon.level>=15){showNotif('info','已达最高等级');return;}
  var cost=upgradeCost(dragon.level);
  if(G.coins<cost){showNotif('error','金币不足，需要 '+cost+' 金币');return;}
  G.coins-=cost;
  dragon.level++;
  if(window.playSound)try{playSound('summon');}catch(e){}
  saveGame();
  renderGrid();
  updateHud();
  checkAch();
}



window.addEventListener('DOMContentLoaded',initGame);



// ===== 成就系统 =====
const ACHIEVEMENTS=[
  // ── 召唤类 ──
  {id:'s1',type:'summon',title:'初出茅庐',desc:'召唤1次',icon:'🐣',color:'#a78bfa',
   reward:{coins:50,  qi:10,  title:null},
   cond:g=>g.summonCount>=1},
  {id:'s2',type:'summon',title:'小试牛刀',desc:'召唤10次',icon:'🐥',color:'#a78bfa',
   reward:{coins:150, qi:30,  title:null},
   cond:g=>g.summonCount>=10},
  {id:'s3',type:'summon',title:'渐入佳境',desc:'召唤30次',icon:'🐤',color:'#a78bfa',
   reward:{coins:400, qi:80,  title:null},
   cond:g=>g.summonCount>=30},
  {id:'s4',type:'summon',title:'龙腾四海',desc:'召唤60次',icon:'🐉',color:'#a78bfa',
   reward:{coins:800, qi:150, title:'龙腾'},
   cond:g=>g.summonCount>=60},
  // ── 合成类 ──
  {id:'m1',type:'merge',title:'初次融合',desc:'合成1次',icon:'⚡',color:'#60a5fa',
   reward:{coins:50,  qi:10,  title:null},
   cond:g=>g.mergeCount>=1},
  {id:'m2',type:'merge',title:'融合达人',desc:'合成15次',icon:'⚡⚡',color:'#60a5fa',
   reward:{coins:300, qi:60,  title:null},
   cond:g=>g.mergeCount>=15},
  {id:'m3',type:'merge',title:'融合宗师',desc:'合成25次',icon:'⚡⚡⚡',color:'#60a5fa',
   reward:{coins:600, qi:120, title:'融合宗师'},
   cond:g=>g.mergeCount>=25},
  // ── 财富类 ──
  {id:'c1',type:'coin',title:'日进斗金',desc:'累计产出10K金币',icon:'💰',color:'#c8860a',
   reward:{coins:200, qi:20,  title:null},
   cond:g=>(g.totalCoins||0)>=10000},
  {id:'c2',type:'coin',title:'富甲一方',desc:'累计产出100K金币',icon:'💎',color:'#c8860a',
   reward:{coins:600, qi:60,  title:null},
   cond:g=>(g.totalCoins||0)>=100000},
  {id:'c3',type:'coin',title:'富可敌国',desc:'累计产出1M金币',icon:'👑',color:'#c8860a',
   reward:{coins:2000, qi:200, title:null},
   cond:g=>(g.totalCoins||0)>=1000000},
  {id:'c4',type:'coin',title:'宇宙财阀',desc:'累计产出10M金币',icon:'🌌',color:'#c8860a',
   reward:{coins:8000, qi:500, title:'宇宙财阀'},
   cond:g=>(g.totalCoins||0)>=10000000},
  // ── 收集/段位类 ──
  {id:'r1',type:'rank',title:'初窥门径',desc:'拥有3种等级灵兽',icon:'🔰',color:'#4ade80',
   reward:{coins:100, qi:20,  title:null},
   cond:g=>new Set(g.dragons.map(d=>d.level)).size>=3},
  {id:'r2',type:'rank',title:'小有所成',desc:'拥有6种等级灵兽',icon:'🥉',color:'#4ade80',
   reward:{coins:300, qi:50,  title:null},
   cond:g=>new Set(g.dragons.map(d=>d.level)).size>=6},
  {id:'r3',type:'rank',title:'大有可观',desc:'拥有10种等级灵兽',icon:'🥈',color:'#4ade80',
   reward:{coins:800, qi:120, title:null},
   cond:g=>new Set(g.dragons.map(d=>d.level)).size>=10},
  {id:'r4',type:'rank',title:'天师之境',desc:'拥有14种等级灵兽',icon:'🏆',color:'#4ade80',
   reward:{coins:3000, qi:400, title:'天师'},
   cond:g=>new Set(g.dragons.map(d=>d.level)).size>=14},
  // ── 等级类 ──
  {id:'l1',type:'level',title:'灵通初显',desc:'最高灵兽达到Lv5',icon:'⭐',color:'#fb923c',
   reward:{coins:100, qi:20,  title:null},
   cond:g=>Math.max(0,...g.dragons.map(d=>d.level||0))>=5},
  {id:'l2',type:'level',title:'通灵之境',desc:'最高灵兽达到Lv8',icon:'⭐⭐',color:'#fb923c',
   reward:{coins:300, qi:50,  title:null},
   cond:g=>Math.max(0,...g.dragons.map(d=>d.level||0))>=8},
  {id:'l3',type:'level',title:'神兽觉醒',desc:'最高灵兽达到Lv10',icon:'🌟',color:'#fb923c',
   reward:{coins:800, qi:150, title:null},
   cond:g=>Math.max(0,...g.dragons.map(d=>d.level||0))>=10},
  {id:'l4',type:'level',title:'天命所归',desc:'最高灵兽达到Lv15',icon:'💫',color:'#fb923c',
   reward:{coins:5000, qi:800, title:'天命之子'},
   cond:g=>Math.max(0,...g.dragons.map(d=>d.level||0))>=15},
  // ── 连击类 ──
  {id:'b1',type:'combo',title:'连击新星',desc:'达成5连击',icon:'🔥',color:'#f87171',
   reward:{coins:100, qi:20,  title:null},
   cond:g=>g.combo>=5},
  {id:'b2',type:'combo',title:'连击达人',desc:'达成10连击',icon:'🔥🔥',color:'#f87171',
   reward:{coins:300, qi:60,  title:'连击达人'},
   cond:g=>g.combo>=10},
];
// 成就奖励统计
if(!G.achCoins) G.achCoins=0;
if(!G.achQi)   G.achQi=0;
const RANKS=[
  {title:'初窥',icon:'🔰',min:3,color:'#aaa'},
  {title:'小成',icon:'🥉',min:6,color:'#cd7f32'},
  {title:'大成',icon:'🥈',min:10,color:'#c0c0c0'},
  {title:'天师',icon:'🏆',min:14,color:'#c8860a'},
];
let _unlocked=new Set(JSON.parse(localStorage.getItem(SAVE_KEY+'_ach')||'[]'));
function saveAch(){localStorage.setItem(SAVE_KEY+'_ach',JSON.stringify([..._unlocked]));}
function checkAch(){
  if(!G.created)return;
  ACHIEVEMENTS.forEach(a=>{
    if(!_unlocked.has(a.id)&&a.cond(G)){
      _unlocked.add(a.id);saveAch();
      // ── 发放成就奖励 ──
      if(a.reward){
        G.coins  = (G.coins||0)  + (a.reward.coins||0);
        G.qi     = (G.qi||0)     + (a.reward.qi||0);
        G.achCoins = (G.achCoins||0) + (a.reward.coins||0);
        G.achQi    = (G.achQi||0)    + (a.reward.qi||0);
        if(a.reward.title && !G.titles) G.titles=[];
        if(a.reward.title && !G.titles.includes(a.reward.title)) G.titles.push(a.reward.title);
        saveGame();
      }
      // ── 居中成就弹窗（含奖励） ──
      const rc=a.reward||{};
      const ac=a.color||'#c8860a';
      const coinStr=rc.coins?'<span style="color:#c8860a;font-weight:700">+'+rc.coins+'💰</span> ':'';
      const qiStr=rc.qi?'<span style="color:#0277bd">+'+rc.qi+' <span class="qi-icon qi-icon-sm"></span></span> ':'';
      const titleStr=rc.title?'<span style="color:#7b3fcb">★ '+rc.title+'</span> ':'';
      const rewardLine=(coinStr||qiStr||titleStr)?'<div style="font-size:13px;color:#aaa;margin-top:8px;">'+coinStr+qiStr+titleStr+'</div>':'';
      const mask=document.createElement('div');
      mask.id='ach_'+a.id;
      mask.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity .3s ease;';
      mask.innerHTML=`<div style="text-align:center;animation:achPopIn .5s ease forwards;">
        <div style="background:linear-gradient(160deg,#1a1a3a,#2a1a5a);border:1.5px solid ${ac};border-radius:24px;padding:28px 32px;min-width:220px;box-shadow:0 0 60px ${ac}40,0 20px 60px rgba(0,0,0,.8);">
          <div style="font-size:48px;margin-bottom:8px;filter:drop-shadow(0 0 20px ${ac}99);">${a.icon}</div>
          <div style="font-size:11px;color:${ac};font-weight:600;letter-spacing:2px;margin-bottom:10px;">🏅 成就达成</div>
          <div style="font-size:17px;font-weight:700;color:#fff;margin-bottom:6px;">${a.title}</div>
          <div style="font-size:12px;color:#888;margin-bottom:4px;">${a.desc}</div>
          ${rewardLine}
          <div style="font-size:11px;color:#555;margin-top:14px;">点击关闭</div>
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
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
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
  const colors=['#c62828','#e65100','#555','#2e7d32','#c8860a'];
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
  const colors=['#c62828','#e65100','#555','#2e7d32','#c8860a'];
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
  {key:'mu',  name:'木', icon:'🪵', color:'#2e7d32', desc:'召唤灵兽',       node:[{cost:100,  title:'嫩芽萌发',desc:'召唤低级概率+10%'},{cost:500,  title:'枝繁叶茂',desc:'召唤低级概率+25%'},{cost:2000, title:'参天大树',desc:'召唤低级概率+50%'}]},
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
  // 追踪每日龙气消耗任务进度
  if(!G._qiSpentDaily) G._qiSpentDaily=0;
  G._qiSpentDaily+=node.cost;
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
      <span>当前拥有 <span style="color:#c8860a;font-weight:700;"><span class="qi-icon qi-icon-sm"></span> ${G.qi}</span> 龙气</span>
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
              ${done?'<div style="font-size:14px;">✅</div>':`<div style="font-size:9px;color:${canAfford&&isNext?'#c8860a':'#555'};"><span class="qi-icon qi-icon-sm"></span>${n.cost}</div>`}
            </div>`;}).join('')}
        </div>
      </div>`;}).join('')}
    <div style="margin-top:6px;background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,140,0,.04));border:1px solid rgba(255,215,0,.15);border-radius:16px;padding:16px;">
      <div style="font-size:12px;color:#c8860a;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        <span style="font-size:14px;">📈</span> 当前加成总览
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;">💰</span><div><div style="font-size:10px;color:#555;">金币产出</div><div style="font-size:13px;color:#c8860a;font-weight:700;">+${(bonus.coinBonus*100).toFixed(0)}%</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;">🐣</span><div><div style="font-size:10px;color:#555;">召唤概率</div><div style="font-size:13px;color:#c8860a;font-weight:700;">+${(bonus.summonLowRate*100).toFixed(0)}%</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;">⚡</span><div><div style="font-size:10px;color:#555;">合成成功</div><div style="font-size:13px;color:#c8860a;font-weight:700;">+${(bonus.mergeBonus*100).toFixed(0)}%</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;">🐉</span><div><div style="font-size:10px;color:#555;">高级灵兽</div><div style="font-size:13px;color:#c8860a;font-weight:700;">+${(bonus.highRate*100).toFixed(0)}%</div></div>
        </div>
        <div style="grid-column:1/-1;display:flex;align-items:center;gap:7px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;">
          <span style="font-size:15px;"><span class="qi-icon qi-icon-sm"></span></span><div><div style="font-size:10px;color:#555;">龙气回复</div><div style="font-size:13px;color:#c8860a;font-weight:700;">+${bonus.qiRate}/min</div></div>
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
    var rcolors={'普通':'#555','稀有':'#2e7d32','珍稀':'#1565c0','传说':'#6a1b9a','史诗':'#e65100','神话':'#c8860a'};
    var items='';
    for(var lv=1;lv<=15;lv++){
      var isDone=!!owned[lv];
      var rarity=lv<=2?'普通':lv<=4?'稀有':lv<=7?'珍稀':lv<=10?'传说':lv<=13?'史诗':'神话';
      items+='<div style="background:'+(isDone?'rgba(255,215,0,.06)':'rgba(255,255,255,.02)')+';border:1.5px solid '+(isDone?'rgba(255,215,0,.3)':'rgba(255,255,255,.06)')+';border-radius:14px;padding:14px 6px;text-align:center;'+(isDone?'':'opacity:.4')+'">'
        +'<div style="font-size:32px;margin-bottom:4px;">'+(LICON[lv]||'?')+'</div>'
        +'<div style="font-size:11px;font-weight:700;color:'+('#c8860a':'#666')+';">'+(LNAME[lv]||'?')+'</div>'
        +'<div style="font-size:10px;color:'+rcolors[rarity]+';margin:3px 0;">'+rarity+'</div>'
        +'<div style="font-size:10px;color:'+('#c8860a':'#555')+';">Lv'+lv+' &middot; +'+(rate[lv-1]||0)+'/s</div>'
        +'</div>';
    }
    var tabBar='<div style="display:flex;gap:8px;margin-bottom:16px;">'
      +'<button onclick="window._handTab=\'level\';renderHandbook();" style="flex:1;padding:8px 0;border-radius:10px;font-size:12px;font-weight:700;border:none;cursor:pointer;background:'+(tab==='level'?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)')+';color:'+(tab==='level'?'#c8860a':'#888')+';">📊 等级</button>'
      +'<button onclick="window._handTab=\'zodiac\';renderHandbook();" style="flex:1;padding:8px 0;border-radius:10px;font-size:12px;font-weight:700;border:none;cursor:pointer;background:'+(tab==='zodiac'?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)')+';color:'+(tab==='zodiac'?'#c8860a':'#888')+';">🏆 属相</button>'
      +'</div>';
    p.innerHTML='<div style="padding:20px 16px 60px;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
      +'<div style="font-size:16px;font-weight:700;">📖 灵兽图鉴</div>'
      +'<div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeHandbook()">✕</div>'
      +'</div>'
      +tabBar
      +'<div style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:14px;padding:14px;margin-bottom:16px;text-align:center;">'
      +'<div style="font-size:13px;font-weight:700;color:#c8860a;margin-bottom:8px;">收集进度</div>'
      +'<div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin-bottom:6px;">'
      +'<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#c8860a,#c62828);border-radius:4px;transition:width .5s;"></div>'
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
        unlockBtn='<button onclick="unlockZodiac('+zi+')" style="margin-top:8px;padding:5px 8px;font-size:11px;border-radius:8px;border:none;cursor:pointer;background:'+(canAfford?'rgba(255,215,0,.15)':'rgba(255,255,255,.05)')+';color:'+(canAfford?'#c8860a':'#555')+';">'+(isSelf?'初始':'<span class="qi-icon qi-icon-sm"></span> '+ZOD_UNLOCK_COST+' 解锁')+'</button>';
      } else if(isSelf){
        unlockBtn='<div style="margin-top:8px;font-size:10px;font-weight:700;color:#c8860a;">初始解锁</div>';
      } else {
        unlockBtn='<div style="margin-top:8px;font-size:10px;color:#2e7d32;">已解锁 ✓</div>';
      }
      zitems+='<div style="'+zstyle+'">'
        +'<div style="font-size:30px;margin-bottom:4px;">'+(unlocked?ZOD_E[zi]:'🔒')+'</div>'
        +'<div style="font-size:12px;font-weight:700;color:'+('#c8860a':'#555')+';">'+zNames[zi]+'</div>'
        +loreText+unlockBtn
        +'</div>';
    }
    var tabBar='<div style="display:flex;gap:8px;margin-bottom:16px;">'
      +'<button onclick="window._handTab=\'level\';renderHandbook();" style="flex:1;padding:8px 0;border-radius:10px;font-size:12px;font-weight:700;border:none;cursor:pointer;background:'+(tab==='level'?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)')+';color:'+(tab==='level'?'#c8860a':'#888')+';">📊 等级</button>'
      +'<button onclick="window._handTab=\'zodiac\';renderHandbook();" style="flex:1;padding:8px 0;border-radius:10px;font-size:12px;font-weight:700;border:none;cursor:pointer;background:'+(tab==='zodiac'?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)')+';color:'+(tab==='zodiac'?'#c8860a':'#888')+';">🏆 属相</button>'
      +'</div>';
    p.innerHTML='<div style="padding:20px 16px 60px;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
      +'<div style="font-size:16px;font-weight:700;">📖 灵兽图鉴</div>'
      +'<div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeHandbook()">✕</div>'
      +'</div>'
      +tabBar
      +'<div style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:14px;padding:14px;margin-bottom:16px;text-align:center;">'
      +'<div style="font-size:13px;font-weight:700;color:#c8860a;margin-bottom:8px;">🏆 属相收藏</div>'
      +'<div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin-bottom:6px;">'
      +'<div style="height:100%;width:'+atlasPct+'%;background:linear-gradient(90deg,#c8860a,#c62828);border-radius:4px;transition:width .5s;"></div>'
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

// 在 updateHud 中调用（每2秒一次），用 G.cps 缓存值避免重复计算
function _trackWeeklyCoins(){
  if(!G.weekly || !G.created) return;
  const wid = getWeekId();
  if(G.weekly.weekId !== wid) return;
  const cps = G.cps||0;
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
    const color = claimed ? '#2e7d32' : done ? '#c8860a' : '#666';
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
        ${claimed ? `<div style="font-size:12px;color:#2e7d32;font-weight:700;">✅ 已领取</div>` :
          canClaim ? `<button onclick="claimWeeklyChallenge('${ch.id}')" style="background:linear-gradient(135deg,#c8860a,#e65100);border:none;color:#1a0a00;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;cursor:pointer;">🎁 领取</button>` :
          `<div style="font-size:11px;color:#555;padding-top:4px;">进行中</div>`}
      </div>
      <div style="height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;margin-bottom:6px;">
        <div style="height:100%;width:${pct}%;background:${done?'#c8860a':'#0277bd'};border-radius:3px;transition:width .4s ease;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:10px;color:#555;">${done?'':'进度: '+progress+'/'+ch.target}</span>
        <span style="font-size:10px;font-weight:700;color:#c8860a;">💰${fmtNum(ch.reward.coin)} <span class="qi-icon qi-icon-sm"></span>+${ch.reward.qi}</span>
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
      <div style="font-size:12px;font-weight:700;color:#c8860a;">${doneCount}/${WEEKLY_CHALLENGES.length} 已领</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeWeeklyPanel()">✕ 关闭</div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:8px 14px;background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.12);border-radius:10px;font-size:11px;font-weight:700;color:#c8860a;">
      <span>📅 ${weekRange}</span>
      <span style="color:#555;">每周一00:00重置</span>
    </div>
    ${allDone ? `<div style="background:linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,140,0,.08));border:1px solid rgba(255,215,0,.3);border-radius:12px;padding:12px 14px;text-align:center;margin-bottom:14px;box-shadow:0 0 20px rgba(255,215,0,.15);">
      <div style="font-size:14px;color:#c8860a;font-weight:700;">🎉 本周挑战全部完成！</div>
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
      <div style="font-size:12px;font-weight:700;color:#c8860a;">🔥 连续 ${streak} 天</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeSignPanel()">✕ 关闭</div>
    </div>
    <div class="cal-nav">
      <button class="cal-nav-btn" onclick="var p=document.getElementById('signPanel');var m=${calMonth}-1;var y=${calYear};if(m<1){m=12;y--;}p.dataset.calYear=y;p.dataset.calMonth=m;renderSignPanel();">◀ 上一月</button>
      <span style="font-size:13px;color:#c8860a;font-weight:700;">${calYear}年 ${monthNames[calMonth-1]}</span>
      <button class="cal-nav-btn" onclick="var p=document.getElementById('signPanel');var m=${calMonth}+1;var y=${calYear};if(m>12){m=1;y++;}p.dataset.calYear=y;p.dataset.calMonth=m;renderSignPanel();">下一月 ▶</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:4px;">${weekDays.map(d=>`<div style="text-align:center;font-size:9px;color:#555;padding:3px 0;">${d}</div>`).join('')}${calCells}</div>
    <div class="cal-grid" style="display:none"></div>
    ${todayDone?`<div style="text-align:center;padding:12px;background:rgba(76,175,80,.08);border:1px solid rgba(76,175,80,.2);border-radius:12px;margin-bottom:14px;">
      <div style="font-size:13px;color:#2e7d32;font-weight:700;">✅ 今日已签到</div>
      <div style="font-size:11px;color:#888;margin-top:4px;">明天再来领取更多奖励</div>
    </div>`:`<div style="text-align:center;padding:14px;background:linear-gradient(135deg,rgba(255,215,0,.12),rgba(255,140,0,.08));border:1.5px solid rgba(255,215,0,.4);border-radius:14px;margin-bottom:14px;cursor:pointer;" onclick="doSign()" id="signBtn">
      <div style="font-size:15px;color:#c8860a;font-weight:700;">🎉 立即签到</div>
      <div style="font-size:11px;color:#aaa;margin-top:4px;">点击领取今日奖励</div>
    </div>`}
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:16px;">
      ${SIGN_REWARDS.map((r,i)=>{
        const day=i+1;
        const past=day<getSignDay()||(day===getSignDay()&&todayDone);
        const current=day===getSignDay()&&!todayDone;
        return `<div style="text-align:center;padding:7px 3px;background:${past?'rgba(76,175,80,.12)':current?'rgba(255,215,0,.12)':'rgba(255,255,255,.03)'};border:1.5px solid ${past?'rgba(76,175,80,.3)':current?'rgba(255,215,0,.5)':'rgba(255,255,255,.05)'};border-radius:10px;${current?'box-shadow:0 0 12px rgba(255,215,0,.25);':''}">
          <div style="font-size:9px;color:${'#2e7d32':'#c8860a':'#555'};font-weight:600;margin-bottom:3px;">Day${day}</div>
          <div style="font-size:14px;line-height:1;">${past?'✅':current?'📍':'⬛'}</div>
          <div style="font-size:8px;color:#666;margin-top:2px;">💰${r.coin>=1000?r.coin/1000+'K':r.coin}</div>
          ${r.free>0?`<div style="font-size:8px;font-weight:700;color:#e65100;">🆓${r.free}</div>`:''}
        </div>`;}).join('')}
    </div>
    <div style="font-size:11px;color:#555;background:rgba(255,255,255,.02);padding:8px 12px;border-radius:8px;line-height:1.8;">
      🎁 连续签到累计奖励，断签重置<br>
      ⏰ 每天 00:00 重置签到状态
    </div>
    <div style="margin-top:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:12px 14px;">
      <div style="font-size:12px;font-weight:700;color:#c8860a;font-weight:600;margin-bottom:8px;">📋 7天签到奖励表</div>
      ${SIGN_REWARDS.map((r,i)=>{const day=i+1;const active=day===getSignDay();return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);${active?'opacity:1;':'opacity:.5;'}">
        <span style="font-size:11px;color:${active?'#c8860a':'#666'};">${r.label}</span>
        <span style="font-size:11px;color:${active?'#c8860a':'#666'};">💰+${fmtNum(r.coin)} <span class="qi-icon qi-icon-sm"></span>+${r.qi}${r.free>0?' 🆓+'+r.free+'召唤':''}</span>
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
    btn.innerHTML='<div style="font-size:13px;color:#2e7d32;font-weight:700;">✅ 签到成功！</div><div style="font-size:11px;color:#aaa;margin-top:4px;">💰+'+fmtNum(reward.coin)+' <span class="qi-icon qi-icon-sm"></span>+'+reward.qi+(reward.free>0?' 🆓+'+reward.free+'次召唤':'')+'</div>';
    btn.style.cursor='default';
    btn.onclick=null;
  }
  _onWeeklyEvent('sign');
  showNotif('success','🎉 连续签到第'+G.signStreak+'天 · 💰+'+fmtNum(reward.coin)+' <span class="qi-icon qi-icon-sm"></span>+'+reward.qi+(reward.free>0?' 🆓+'+reward.free+'召唤':''));
}

function yesterday(){
  const d=new Date();d.setDate(d.getDate()-1);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
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
    case 'spend_qi': return G._qiSpentDaily||0; // 每日消耗龙气
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
      <div style="font-size:12px;font-weight:700;color:#c8860a;">${doneCount}/${TASKS.length} 完成</div>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeTaskPanel()">✕ 关闭</div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:8px 14px;background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.12);border-radius:10px;font-size:11px;font-weight:700;color:#c8860a;">
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
              <div style="font-size:13px;font-weight:700;color:${done?'#2e7d32':completed?'#c8860a':'#ccc'};${t.title}</div>
              <div style="font-size:11px;color:#666;margin-top:2px;">${t.desc}</div>
            </div>
          </div>
          ${done?`<div style="font-size:12px;color:#2e7d32;font-weight:700;">✅ 已领取</div>`:
            completed?`<button onclick="claimTask('${t.id}')" style="background:linear-gradient(135deg,#c8860a,#e65100);border:none;color:#1a0a00;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;cursor:pointer;">🎁 领取</button>`:
            `<div style="font-size:11px;color:#666;">进行中</div>`}
        </div>
        <div style="height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${done?'#2e7d32':completed?'#c8860a':'#0277bd'};border-radius:3px;transition:width .4s ease;${completed?'box-shadow:0 0 8px rgba(255,215,0,.3);':''}"></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
          <span style="font-size:10px;color:#555;">${completed?'':'进度: '+prog+'/'+t.target}</span>
          <span style="font-size:10px;font-weight:700;color:#c8860a;">💰${t.reward.coin>=1000?t.reward.coin/1000+'K':t.reward.coin} <span class="qi-icon qi-icon-sm"></span>+${t.reward.qi}${t.reward.free?' 🆓+'+t.reward.free+'次':''}</span>
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
    G._qiSpentDaily=0; // 每日龙气消耗重置
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
      <button onclick="closeActivityPanel();setTimeout(openWeeklyPanel,320);" style="flex:1;margin:0 10px;padding:9px 12px;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.25);border-radius:12px;font-size:12px;font-weight:700;color:#c8860a;cursor:pointer;text-align:center;">查看挑战 &rarr;</button>
      <div style="font-size:12px;color:#888;cursor:pointer;opacity:.7;" onclick="closeActivityPanel()">✕</div>
    </div>
    <div style="font-size:16px;font-weight:700;margin-top:14px;margin-bottom:16px;">🎯 限时活动</div>
      <div style="font-size:12px;font-weight:700;color:#c8860a;">${active.length} 个进行中</div>
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
      <div style="font-size:11px;font-weight:700;color:#c8860a;font-weight:600;margin-bottom:6px;">⏰ 活动倒计时</div>
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
    if(isWeekend){lines+='<div>🎁 周末双倍 <span style="font-weight:700;color:#e65100;">进行中 🎉</span></div>';}else{
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
        <div style="font-size:15px;font-weight:700;font-weight:700;color:#c8860a;">${val}</div>
      </div>`).join('')}
    </div>
    <div style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:12px 14px;">
      <div style="font-size:12px;font-weight:700;color:#c8860a;font-weight:600;margin-bottom:8px;">🎯 命格修炼进度</div>
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
              <span style="font-size:10px;font-weight:700;color:#c8860a;">${pct}%</span>
            </div>
            <div style="height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${icons[i]==='🌿'?'#2e7d32':icons[i]==='🔥'?'#f44336':icons[i]==='🪨'?'#795548':icons[i]==='⚪'?'#9e9e9e':'#2196f3'};border-radius:2px;"></div>
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
    <div style="font-size:32px;font-weight:900;font-weight:700;color:#c8860a;margin:8px 0 16px;">+${fmtNum(coins)} 💰</div>
    <div style="font-size:11px;color:#555;margin-bottom:20px;">离线期间产出 50% 效率（最多8小时）</div>
    <button onclick="this.closest('div').parentElement.remove()" style="background:linear-gradient(135deg,#c8860a,#e65100);border:none;border-radius:20px;color:#1a0a00;font-size:14px;font-weight:700;padding:10px 32px;cursor:pointer;">收下！</button>
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
    <div style="font-size:20px;font-weight:700;font-weight:700;color:#c8860a;margin-bottom:10px;">${ev.title}</div>
    <div style="font-size:13px;color:#aaa;line-height:1.7;margin-bottom:20px;">${ev.desc}</div>
    ${ev.duration>0 ? `<div style="font-size:11px;color:#555;margin-bottom:16px;">持续 ${ev.duration} 秒</div>` : ''}
    <button onclick="dismissSkyEvent()" style="background:linear-gradient(135deg,#c8860a,#e65100);border:none;border-radius:20px;color:#1a0a00;font-size:14px;font-weight:700;padding:10px 32px;cursor:pointer;">${ev.duration>0?'收下':'领取'}</button>
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

function claimActiveReward(){
  if(!G.created)return;
  var td=today();
  if(G.activeClaimedDate===td){showNotif('info','今日已领取！');return;}
  // 计算活跃分（与renderActiveCenter同步逻辑）
  var score=0;
  if(G.signDate===td)score+=20;
  var td2=0;try{if(G.tasks)for(var k in G.tasks)if(G.tasks[k])td2++;}catch(e){}
  score+=Math.floor(td2/5*40);
  if(getActiveActivities().length>0)score+=40;
  if(score<100){showNotif('info','活跃度不足100分（当前'+score+'分）');return;}
  G.activeClaimedDate=td;
  G.coins+=5000;G.qi+=100;
  saveGame();updateHud();
  showNotif('success','🎁 活跃奖励领取成功！💰+5000 <span class="qi-icon qi-icon-sm"></span>+100');
}



function getTaskState(){
  var ts={};
  TASKS.forEach(function(t){
    var progress=0;var claimed=false;
    try{
      if(t.type==='static'){
        if(t.id==='summon10'||t.id==='summon30') progress=G.summonCount||0;
        else if(t.id==='merge10'||t.id==='merge30') progress=G.mergeCount||0;
      } else if(t.type==='spend_qi'){
        progress=G._qiSpentDaily||0;
      } else if(t.type==='login'){
        progress=(G.tasks&&G.tasks.login&&G.tasks.login.progress)||0;
      }
      claimed=(G.tasks[t.id]&&G.tasks[t.id].claimed)||false;
    }catch(e){}
    ts[t.id]={progress,claimed};
  });
  return ts;
}


function getActiveActivities(){
  return ACTIVITIES.filter(function(a){return a.active();});
}

// ── 活跃中心 ─────────────────────────────────────────────
function openActiveCenter(){
  var p=document.getElementById('activeCenterPanel');
  if(!p)return;
  renderActiveCenter();
  p.classList.add('open');
  updateActiveBadge();
}

function closeActiveCenter(){
  var p=document.getElementById('activeCenterPanel');
  if(p)p.classList.remove('open');
}

function renderActiveCenter(){
  var c=document.getElementById('activeCenterItems');
  if(!c)return;
  var td=today();
  // 签到状态
  var signed=G.signDate===today;
  // 任务进度
  var tasksDone=0;
  try{
    if(G.tasks)for(var tid in G.tasks)if(G.tasks[tid])tasksDone++;
  }catch(e){}
  var taskTotal=5;
  // 活跃度得分（固定100分上限）
  var score=0;
  if(signed)score+=20;
  score+=Math.floor(tasksDone/taskTotal*40);
  // 活跃项列表
  var items=[];
  var activeActs=getActiveActivities();
  items.push({icon:'📅',title:'每日签到',desc:signed?'已签到 · +'+SIGN_REWARDS[G.signStreak%7].coin+'金币':'点击签到领取奖励',done:signed,pending:!signed,color:signed?'#2e7d32':'#c8860a',pct:signed?100:0});
  items.push({icon:'📝',title:'每日任务',desc:tasksDone+'/'+taskTotal+' 个任务完成',done:tasksDone>=taskTotal,pending:tasksDone>0,color:tasksDone>=taskTotal?'#2e7d32':'#7eb8ff',pct:Math.round(tasksDone/taskTotal*100)});
  items.push({icon:'⚡',title:'限时活动',desc:activeActs.length>0?activeActs.map(a=>a.icon+' '+a.name).join('  '):'当前无活动',done:activeActs.length>0,pending:activeActs.length>0,color:activeActs.length>0?'#e65100':'#555',pct:activeActs.length>0?100:0});
  items.push({icon:'🐣',title:'召唤灵兽',desc:'今日已召唤 '+G.summonCount+' 次',done:G.summonCount>=10,pending:G.summonCount>0,color:G.summonCount>=10?'#2e7d32':'#b57edc',pct:Math.min(100,Math.round(G.summonCount/10*100))});
  // 本周挑战进度
  var wCount=0;
  if(G.weekly&&G.weekly.challenges){
    for(var k in G.weekly.challenges)if(G.weekly.challenges[k])wCount++;
  }
  var wTotal=WEEKLY_CHALLENGES.length||7;
  var wPct=Math.round(wCount/wTotal*100);
  document.getElementById('acWeeklyNum').textContent=wCount+'/'+wTotal;
  document.getElementById('acWeeklyBar').style.width=wPct+'%';
  // 渲染
  document.getElementById('acScore').textContent=score+'分';
  c.innerHTML=items.map(function(item){
    var cls='ac-card'+(item.done?' done':(item.pending?' pending':''));
    var barColor=item.color;
    return '<div class="'+cls+'" '+(item.pending&&!item.done?'onclick="closeActiveCenter();openTaskPanel();"':' ')+'>'+
      '<div class="ac-icon">'+item.icon+'</div>'+
      '<div class="ac-info">'+
        '<div class="ac-title">'+item.title+'</div>'+
        '<div class="ac-desc">'+item.desc+'</div>'+
        '<div class="ac-progress"><div class="ac-bar" style="width:'+item.pct+'%;background:'+barColor+';"></div></div>'+
      '</div>'+
      '<div class="ac-tag" style="background:'+barColor+'22;color:'+barColor+';border:1px solid '+barColor+'44;">'+(item.done?'✓':item.pending?'进行中':'未开始')+'</div>'+
    '</div>';
  }).join('');
  // 活跃奖励领取（满分100分可领）
  var claimed=G.activeClaimedDate===td;
  var claimEl=document.getElementById('acClaimBtn');
  if(claimEl){
    if(claimed){
      claimEl.textContent='✅ 今日已领取';
      claimEl.style.background='rgba(76,175,80,.15)';
      claimEl.style.border='1.5px solid rgba(76,175,80,.3)';
      claimEl.style.color='#2e7d32';
      claimEl.style.cursor='default';
      claimEl.onclick=null;
    } else if(score>=100){
      claimEl.textContent='🎁 领取活跃奖励';
      claimEl.style.background='linear-gradient(135deg,#c8860a,#e65100)';
      claimEl.style.border='none';
      claimEl.style.color='#1a0a00';
      claimEl.style.cursor='pointer';
      claimEl.onclick=function(){claimActiveReward();};
    } else {
      claimEl.textContent='📋 '+score+'/100 分（满100分领取）';
      claimEl.style.background='rgba(255,255,255,.06)';
      claimEl.style.border='1.5px solid rgba(255,255,255,.15)';
      claimEl.style.color='rgba(255,255,255,.4)';
      claimEl.style.cursor='not-allowed';
      claimEl.onclick=null;
    }
  }
}

function updateActiveBadge(){
  // 更新侧边栏按钮红点
  var badge=document.getElementById('hudActiveBadge');
  if(!badge)return;
  var td=today();
  var signed=G.signDate===td;
  var taskDone=0;
  try{if(G.tasks)for(var k in G.tasks)if(G.tasks[k])taskDone++;}catch(e){}
  var unread=(!signed?1:0)+(taskDone<5&&(!G.tasks||!G.tasks.login)?1:0);
  // 额外：召唤次数少或活跃奖励未领也提示
  if(G.summonCount>0&&G.summonCount<10) unread++;
  if(unread>0){
    badge.textContent=unread>9?'9+':unread;
    badge.style.display='flex';
  } else {
    badge.style.display='none';
  }
}

function updateHud(){
  if(!G.created)return;
  // 更新本周金币计数（每秒触发一次）
  try{_trackWeeklyCoins();}catch(e){}
  document.getElementById('hudCoins').textContent=fmtNum(G.coins);
  document.getElementById('hudCps').textContent='+'+fmtNum(Math.floor(G.cps||0))+'/s';
  document.getElementById('hudQi').textContent=fmtNum(G.qi);
  if(G.zodiac>=0)document.getElementById('hudZodiac').textContent=ZOD_E[G.zodiac];
  // 运势
  var yun=YUN_NAMES[Math.max(0,Math.min(4,G.currentFate-1))];
  document.getElementById('hudYunshi').textContent=yun;
  // 本周挑战进度
  var wCount=0;
  if(G.weekly&&G.weekly.challenges){
    for(var k in G.weekly.challenges)if(G.weekly.challenges[k])wCount++;
  }
  var wEl=document.getElementById('hudWeekly');
  if(wEl){
    wEl.style.display=G.created?'inline-flex':'none';
    document.getElementById('hudWeeklyNum').textContent=wCount+'/7';
  }
  updateActiveBadge();
  // 同步召唤按钮状态（从 config.js updateHud 合并过来）
  if(document.getElementById('coinCost')){
    var coinCost=Math.floor(100*Math.pow(1.2,Math.floor((G.summonCount||0)/10)));
    document.getElementById('coinCost').textContent=coinCost;
    var btnCoin=document.getElementById('btnCoin');
    if(btnCoin)btnCoin.disabled=(G.coins||0)<coinCost;
  }
  if(document.getElementById('qiCost')){
    var qiCost=Math.floor(500*Math.pow(1.1,Math.floor((G.summonCount||0)/15)));
    document.getElementById('qiCost').innerHTML='<span class="qi-icon qi-icon-md"></span> '+qiCost;
    var btnQi=document.getElementById('btnQi');
    if(btnQi)btnQi.disabled=(G.qi||0)<qiCost;
  }
}

// ── 命格修炼面板开关（新增UI入口）──────────────────────
function openCultPanel(){
  renderCultPanel();
  var p=document.getElementById('cultPanel');
  if(p)p.classList.add('open');
}

function closeCultPanel(){
  var p=document.getElementById('cultPanel');
  if(p)p.classList.remove('open');
}

// ═══════════════════════════════════════════════════════
// P0-1 灵兽图鉴 (Atlas) — 查看已收集生肖 + 收集奖励
// ═══════════════════════════════════════════════════════
function getCollectedZodiacs(){
  // 从 G.dragons 提取所有灵兽的属相ID（去重，同时查 d.z 和 d.level）
  if(!G.dragons || !G.dragons.length) return [];
  var seen={};
  var zids=[];
  G.dragons.forEach(function(d){
    if(d){
      var z=d.level;               // d.level 是主要属相ID（0=鼠 到 11=猪）
      if(z !== undefined && z !== null && z >= 0 && z <= 11 && !seen[z]){seen[z]=1;zids.push(z);}
    }
  });
  return zids.sort(function(a,b){return a-b;});
}

function getZodiacStatus(zid){
  var col=getCollectedZodiacs();
  var idx=col.indexOf(zid);
  if(idx>=0) return {collected:true, order:idx+1, total:col.length};
  return {collected:false, order:null, total:col.length};
}

function openAtlasPanel(){
  renderAtlasPanel();
  var p=document.getElementById('atlasPanel');
  if(p)p.classList.add('show');
}
function closeAtlasPanel(){
  var p=document.getElementById('atlasPanel');
  if(p)p.classList.remove('show');
}

function renderAtlasPanel(){
  var c=document.getElementById('atlasContent');
  if(!G||!G.created){if(c)c.innerHTML='<div style="padding:40px;text-align:center;color:#666">请先创建角色</div>';return;}
  if(!c)return;
  var col=getCollectedZodiacs();
  var n=col.length;
  var html='<div class="atlas-title">📖 生肖图鉴 <span style="font-weight:700;color:#c8860a">'+n+'/12</span></div>';
  html+='<div class="atlas-grid">';
  for(var z=0;z<12;z++){
    var st=getZodiacStatus(z+1);
    var emoji=ZOD_E[z];
    var name=ZOD_N[z];
    var lore=ZOD_LORE[z]||'暂无记录';
    var cls=st.collected?'atlas-item-collected':'atlas-item-locked';
    var title=st.collected?('第'+st.order+'个收集 · '+lore):('未解锁 · '+lore);
    html+='<div class="'+cls+'" title="'+title+'" onclick="showZodiacDetail('+(z+1)+')" style="cursor:pointer">';
    html+='<div style="font-size:2.4em">'+emoji+'</div>';
    html+='<div style="font-size:0.9em">'+(st.collected?('第'+st.order+'个'):'🔒')+'</div>';
    html+='<div style="font-size:0.8em">'+name+'</div>';
    html+='</div>';
  }
  html+='</div>';
  // 收集进度奖励
  html+='<div class="atlas-rewards">';
  ATLAS_REWARDS.forEach(function(r){
    var done=n>=r.count;
    var claimBtn=done?'<button class="atlas-claim-btn" onclick="claimAtlasReward('+r.count+')">领取</button>':'';
    var claimed=G.atlasClaimed&&G.atlasClaimed.includes(r.count)?'✅ 已领':claimBtn;
    html+='<div class="atlas-reward-item '+(done?'':'atlas-reward-locked')+'">';
    html+='<span>收集 <b>'+r.count+'</b> 种生肖: </span>';
    html+='<span style="font-weight:700;color:#c8860a">'+r.coin+'金币</span> + ';
    html+='<span style="color:#0277bd">'+r.qi+'龙气</span> ';
    html+='<b>['+r.title+']</b> '+claimed;
    html+='</div>';
  });
  html+='</div>';
  html+='<button class="close-btn" onclick="closeAtlasPanel()">关闭</button>';
  c.innerHTML=html;
  saveGame();
}

function showZodiacDetail(zid){
  var st=getZodiacStatus(zid);
  var lore=ZOD_LORE[zid-1]||'暂无记录';
  var desc='属相: '+ZOD_N[zid-1]+' '+ZOD_E[zid-1]+' | '+lore;
  var emoji=st.collected?ZOD_E[zid]:'❓';
  alert(emoji+'\n'+desc+(st.collected?'\n(已收录图鉴)':'\n(尚未收集到该属相灵兽)'));
}

function claimAtlasReward(count){
  if(!G.atlasClaimed) G.atlasClaimed=[];
  if(G.atlasClaimed.includes(count)){alert('已领取过此奖励！');return;}
  var reward=ATLAS_REWARDS.find(function(r){return r.count===count;});
  if(!reward){alert('奖励配置错误');return;}
  G.coins+=reward.coin;
  G.qi+=reward.qi;
  G.atlasClaimed.push(count);
  alert('领取成功！\n+'+reward.coin+'金币  +'+reward.qi+'龙气\n称号: '+reward.title);
  saveGame();
  renderAtlasPanel();
  updateHUD();
}

// ═══════════════════════════════════════════════════════
// P0-2 灵兽皮肤系统 (Skins)
// ═══════════════════════════════════════════════════════
function isSkinOwned(skinId){
  if(skinId==='default') return true;
  return G.unlockedSkins&&G.unlockedSkins.includes(skinId);
}

function equipSkin(skinId){
  if(!isSkinOwned(skinId)){alert('请先拥有该皮肤！');return;}
  G.equippedSkin=skinId;
  saveGame();
  // 关键：换肤后立即刷新灵兽网格（大灵兽+卡片全部重新渲染）
  try{renderGrid&&renderGrid();}catch(e){}
  try{updateHud&&updateHud();}catch(e){}
  renderSkinPanel();
  playSound('click');
}

function buySkin(skinId){
  var skin=DRAGON_SKINS.find(function(s){return s.id===skinId;});
  if(!skin){alert('皮肤不存在');return;}
  if(isSkinOwned(skinId)){alert('已拥有该皮肤');return;}
  if(G.qi<skin.cost){
    alert('龙气不足！需要 '+skin.cost+' 龙气，当前: '+G.qi);
    return;
  }
  G.qi-=skin.cost;
  G.unlockedSkins.push(skinId);
  alert('购买成功！\n获得皮肤: '+skin.name+' '+skin.icon);
  saveGame();
  renderSkinPanel();
  updateHUD();
  playSound('draw');
}

function openSkinPanel(){
  renderSkinPanel();
  var panel=document.getElementById('skinPanel');
  if(panel) panel.classList.add('show');
}
function closeSkinPanel(){
  var p=document.getElementById('skinPanel');
  if(p)p.classList.remove('show');
}

function renderSkinPanel(){
  var c=document.getElementById('skinContent');
  if(!G||!G.created){if(c)c.innerHTML='<div style="padding:40px;text-align:center;color:#666">请先创建角色</div>';return;}
  if(!c)return;
  var cur=G.equippedSkin||'default';
  var html='';
  // 当前装备预览
  var curSkin=DRAGON_SKINS.find(function(s){return s.id===cur;})||{name:'原版',icon:'🐣',color:'#c8860a'};
  html+='<div class="skin-preview" style="border-color:'+curSkin.color+';background:'+curSkin.color+'11">';
  html+='<div style="font-size:3em">'+curSkin.icon+'</div>';
  html+='<div style="color:'+curSkin.color+'">当前装备: '+curSkin.name+'</div>';
  html+='</div>';
  // 龙气余额
  html+='<div style="text-align:center;margin:6px 0;color:#0277bd">💧 当前龙气: '+G.qi+'</div>';
  // 皮肤列表（按稀有度分组）
  var rarities=['普通','稀有','珍稀','传说','神话'];
  for(var r=0;r<5;r++){
    var skins=DRAGON_SKINS.filter(function(s){return s.rarity===r;});
    if(!skins.length) continue;
    var color=SKIN_RARITY_COLORS[r];
    html+='<div class="skin-rarity-section" style="border-left:3px solid '+color+'">';
    html+='<div class="skin-rarity-label" style="color:'+color+'">'+rarities[r]+'</div>';
    html+='<div class="skin-grid">';
    skins.forEach(function(s){
      var owned=isSkinOwned(s.id);
      var equipped=cur===s.id;
      var cls='skin-item '+(owned?'skin-owned':'')+(equipped?' skin-equipped':'');
      var border=equipped?('border-color:'+s.color):(owned?('#333'):('#555'));
      var overlay=owned?(equipped?'✅ ':''):('💧'+s.cost);
      html+='<div class="'+cls+'" style="border-color:'+border+';background:'+(owned?(s.color+'11'):'')+';cursor:pointer" ';
      html+='onclick="'+(owned?'equipSkin(\''+s.id+'\')':'buySkin(\''+s.id+'\')')+'">';
      html+='<div style="font-size:2em">'+s.icon+'</div>';
      html+='<div style="font-size:0.75em;color:'+s.color+'">'+s.name+'</div>';
      html+='<div style="font-size:0.7em;color:#888">'+overlay+'</div>';
      html+='</div>';
    });
    html+='</div></div>';
  }
  html+='<button class="close-btn" onclick="closeSkinPanel()">关闭</button>';
  c.innerHTML=html;
}

// ═══════════════════════════════════════════════════════
// P0-2 入口按钮 — 插入到主界面 HUD 区域
// ═══════════════════════════════════════════════════════
// 功能按钮已迁移到 HTML 静态布局，此函数不再注入浮动按钮
function injectSkinAtlasButtons(){}
// 功能按钮已迁移到 HTML 静态布局，不再显示浮动按钮
function showFeatureButtons(){}

// 存档初始化兼容
if(!G.unlockedSkins) G.unlockedSkins=['default'];
if(!G.equippedSkin) G.equippedSkin='default';
if(!G.atlasClaimed) G.atlasClaimed=[];

// 主按钮注入（页面加载完成后）
if(document.readyState==='complete'){
  injectSkinAtlasButtons();
} else {
  window.addEventListener('load',injectSkinAtlasButtons);

// ═══════════════════════════════════════════════════════
// P1-1 天命试炼塔 (Tower)
// ═══════════════════════════════════════════════════════
function getTowerEnemy(floor){
  if(floor<1||floor>100) return TOWER_ENEMIES[0];
  return TOWER_ENEMIES[floor-1]||TOWER_ENEMIES[0];
}
function getTowerPlayerDmg(){
  // 基础伤害 = maxLv²×0.5+5
  if(!G.dragons||!G.dragons.length) return 10;
  var maxLv=Math.max(0,...G.dragons.map(function(d){return d.level||0;}));
  var base=Math.max(1,Math.floor(maxLv*maxLv*0.5+5));
  // 装备基础加成
  var eq=getEquipTotals();
  // 攻击 = 基础 × (1+atk/100) + SPD加成
  var spdBonus=Math.floor(eq.spd*0.3);
  return Math.max(1,Math.floor(base*(1+eq.atk/100))+spdBonus);
}
// 装备总属性（含套装加成）：给试炼塔/灵兽面板共用
function getEquipTotals(){
  var fm=G.forge||{items:[]}, atk=0, def=0, spd=0;
  if(fm.items){
    for(var i=0;i<fm.items.length;i++){
      var it=fm.items[i];
      if(it.equipped){
        if(it.atk) atk+=it.atk||0;
        if(it.def) def+=it.def||0;
        if(it.spd) spd+=it.spd||0;
      }
    }
  }
  var eff=getSuitEffect(fm.items);
  if(eff){atk=Math.floor(atk*(1+eff.atkBonus/100));def=Math.floor(def*(1+eff.defBonus/100));spd=Math.floor(spd*(1+eff.spdBonus/100));}
  return{atk:Math.max(0,atk),def:Math.max(0,def),spd:Math.max(0,spd)};
}
// 玩家试练塔总防御（用于扣血计算）
function getTowerPlayerDef(){
  return getEquipTotals().def;
}
// 试练塔材料计算
function getTowerReward(floor){
  var enemy=getTowerEnemy(floor);
  var isBoss=enemy?enemy.isBoss:false;
  var isBonus=floor%10===0||isBoss;
  return{coins:(enemy&&enemy.coins)||0,qi:(enemy&&enemy.qi)||0,
    iron:3+Math.floor(floor/10)*2,crystal:isBonus?1:0,dragon:isBonus?1:0,isBoss:isBoss,enemy:enemy};
}

function towerAttack(){
  if(!G.created) return;
  var floor=G.towerFloor||1;
  var maxLv=Math.max(0,...G.dragons.map(function(d){return d.level||0;}));
  var maxHp=100+maxLv*5;
  // HP只在进入新层或死亡时才重置
  if(!G.towerPlayerHp||G.towerPlayerHp<=0||G._towerFloorBak!==floor){
    G.towerPlayerHp=maxHp;G._towerFloorBak=floor;
  }
  var enemy=getTowerEnemy(floor);
  var playerDef=getTowerPlayerDef();

  // 计算敌人反击伤害 = floor×20，被防御减免
  var enemyBaseDmg=Math.max(1,Math.floor(floor*20));
  var enemyDmg=Math.max(1,Math.floor(enemyBaseDmg/(1+playerDef/50)));

  // 处理攻击（可能有多次普攻）
  // 速度加成：每1spd=0.2%额外攻击机会
  var spd=getEquipTotals().spd;
  var extraChance=Math.min(100, Math.floor(spd*0.2));
  var hits=1;
  if(Math.random()*100<extraChance) hits++;
  if(Math.random()*100<Math.max(0,extraChance-100)) hits++;

  if(!G.towerEnemyHp) G.towerEnemyHp=enemy.hp;
  var totalDmg=0;
  for(var h=0;h<hits;h++){
    var dmg=getTowerPlayerDmg();
    G.towerEnemyHp=Math.max(0,G.towerEnemyHp-dmg);
    totalDmg+=dmg;
  }
  // 玩家扣血（敌人反击）
  G.towerPlayerHp=Math.max(0,G.towerPlayerHp-enemyDmg);
  // 动画 + 实时更新攻击按钮伤害
  var btn=document.getElementById('towerAtkBtn');
  if(btn){
    btn.style.transform='scale(0.92)';
    setTimeout(function(){
      btn.style.transform='';
      var newDmg=getTowerPlayerDmg();
      btn.textContent='⚔️ 发起攻击 (伤害:'+newDmg+')';
    },120);
  }
  G.towerLastAtk=Date.now();

  // 击败检测
  if(G.towerEnemyHp<=0){
    G.coins=(G.coins||0)+enemy.coins;
    G.qi=(G.qi||0)+(enemy.qi||0);
    G.totalCoins=(G.totalCoins||0)+enemy.coins;
    G.towerFloor=(floor>=100?100:floor+1);
    G.towerEnemyHp=0;G.towerPlayerHp=maxHp;
    saveGame();checkAch&&checkAch();
    // 材料入账
    if(!G.forge) G.forge={items:[],materials:{iron:0,crystal:0,dragonScale:0,starDust:0}};
    var mat=G.forge.materials;
    mat.iron=(mat.iron||0)+1;
    mat.crystal=(mat.crystal||0)+(floor%10===0?1:0);
    mat.dragonScale=(mat.dragonScale||0)+(floor%10===0?1:0);
    var mm='';
    if(mat.iron>0) mm+=' 🔩'+mat.iron;
    if(mat.crystal>0) mm+=' 💎'+mat.crystal;
    if(mat.dragonScale>0) mm+=' 🐉'+mat.dragonScale;
    if(enemy.isBoss){showNotif('success','🏆 BOSS击败！'+enemy.name+'（'+floor+'层）'+mm);}
    else{showNotif('success','试练塔 第'+floor+'层：'+mm);}
    if(typeof playSynthSuccess==='function')playSynthSuccess();
  }
  // 玩家HP归0 → 重置试练塔到当前层
  if(G.towerPlayerHp<=0){
    showNotif('warn','体力耗尽！试练塔重置到第'+floor+'层');
    G.towerFloor=floor;G.towerEnemyHp=0;G.towerPlayerHp=maxHp;
    saveGame();
  }
  renderTowerPanel&&renderTowerPanel();
  updateHUD&&updateHUD();
}
function towerSweep(){
  if(!G.created) return;
  var floor=G.towerFloor||1;
  if(floor<=1){showNotif('warn','通关第1层后才能使用扫荡！');return;}
  var sweepMax=Math.max(1,floor-1);
  var sweepCost=Math.round(sweepMax*8);
  if((G.coins||0)<sweepCost){showNotif('error','金币不足！扫荡需要 '+sweepCost+'💰');return;}
  G.coins=(G.coins||0)-sweepCost;
  if(!G.forge) G.forge={items:[],materials:{iron:0,crystal:0,dragonScale:0,starDust:0},totalCrafts:0};
  if(!G.forge.materials) G.forge.materials={iron:0,crystal:0,dragonScale:0,starDust:0};
  var mat=G.forge.materials;
  var totalIron=0,totalCrystal=0,totalDragon=0;
  for(var f=1;f<=sweepMax;f++){
    var enemy=getTowerEnemy(f);
    if(f%10===0||enemy.isBoss){
      totalCrystal+=1+(enemy.isBoss?1:0);
      totalDragon+=enemy.isBoss?1:0;
    }
    totalIron+=3+Math.floor(f/10)*2;
  }
  mat.iron=(mat.iron||0)+totalIron;
  mat.crystal=(mat.crystal||0)+totalCrystal;
  mat.dragonScale=(mat.dragonScale||0)+totalDragon;
  saveGame();
  checkAch&&checkAch();
  var msg='🧹 扫荡完成：🔩'+totalIron+' 💎'+totalCrystal+(totalDragon>0?' 🐉'+totalDragon:'');showNotif('success',msg);
  if(typeof updateHud==='function') updateHud();
}
function towerClaimMilestone(idx){
  if(!G.towerMilestones) G.towerMilestones=[];
  if(G.towerMilestones.includes(idx)){alert('已领取！');return;}
  var ach=TOWER_ACHIEVEMENTS[idx];
  if(!ach){alert('配置错误');return;}
  if(G.towerFloor<ach.floor){alert('需通关第'+ach.floor+'层才能领取');return;}
  G.coins=(G.coins||0)+ach.coins;
  G.qi=(G.qi||0)+ach.qi;
  G.towerMilestones.push(idx);
  var titleStr=ach.title?' · 称号['+ach.title+']':'';
  alert('领取成功！\n+'+ach.coins+'💰 '+(ach.qi?'+'+ach.qi+'<span class="qi-icon qi-icon-sm"></span> ':'')+titleStr);
  saveGame();
  renderTowerPanel&&renderTowerPanel();
  updateHUD&&updateHUD();
}
function towerOfflineProgress(){
  // 离线时自动通关（每秒1次模拟攻击）
  if(!G.towerLastAtk||!G.created) return 0;
  var now=Date.now();
  var elapsed=Math.floor((now-G.towerLastAtk)/1000);
  if(elapsed<5) return 0;  // <5秒不算离线
  var floor=G.towerFloor||1;
  var dmg=getTowerPlayerDmg();
  var enemy=getTowerEnemy(floor);
  var hits=Math.floor(enemy.hp/dmg);
  var totalHits=elapsed+hits;
  var newFloor=floor;
  var totalCoins=0,totalQi=0;
  var f=floor;
  while(totalHits>=hits){
    totalHits-=hits;
    var e=getTowerEnemy(f);
    totalCoins+=e.coins||0;
    totalQi+=(e.qi||0);
    newFloor=f>=100?100:f+1;
    f++;
    if(f>100) break;
    hits=Math.floor(getTowerEnemy(f).hp/dmg);
    if(hits<=0) hits=1;
  }
  G.coins=(G.coins||0)+totalCoins;
  G.qi=(G.qi||0)+totalQi;
  G.towerFloor=newFloor;
  G.towerLastAtk=now;
  G.towerEnemyHp=getTowerEnemy(newFloor).hp;
  saveGame();
  return{tcoins:totalCoins,tqi:totalQi,nfloors:newFloor-floor};
}
function openTowerPanel(){
  renderTowerPanel();
  var panel=document.getElementById('towerPanel');
  if(panel) panel.classList.add('show');
}
function closeTowerPanel(){
  var p=document.getElementById('towerPanel');
  if(p)p.classList.remove('show');
}
function renderTowerPanel(){
  var c=document.getElementById('towerContent');
  if(!c) return;
  if(!G||!G.created){c.innerHTML='<div style="padding:40px;text-align:center;color:#666">请先创建角色</div>';return;}
  var floor=G.towerFloor||1;
  var maxLv=Math.max(0,...G.dragons.map(function(d){return d.level||0;}));
  var playerMaxHp=100+maxLv*5;
  var playerHp=Math.max(0,G.towerPlayerHp||playerMaxHp);
  var playerHpPct=Math.max(0,Math.min(100,playerHp/playerMaxHp*100));
  var enemy=getTowerEnemy(floor);
  var curHp=(!G.towerEnemyHp||G.towerEnemyHp===0)?enemy.hp:G.towerEnemyHp;
  var hpPct=Math.max(0,Math.min(100,curHp/enemy.hp*100));
  var playerDmg=getTowerPlayerDmg();
  var playerDef=getTowerPlayerDef();
  // 装备属性（含套装加成）
  var eq=getEquipTotals();
  var suitEff=getSuitEffect((G.forge||{}).items);
  var suitTag=suitEff?' <span style="font-weight:700;color:#c8860a;font-size:10px">【'+suitEff.name+'】</span>':'';
  var boss=enemy.isBoss;
  var floorTxt=floor>=100?'<span style="font-weight:700;color:#c8860a">巅峰(100层)</span>':'第'+floor+'层';
  var bossMark=boss?' <span style="color:#c62828">🏆BOSS</span>':'';
  var progPct=Math.min(100,floor/100*100);
  var hpColor=hpPct>50?'#4ade80':hpPct>25?'#fb923c':'#f87171';
  var phpColor=playerHpPct>60?'#60a5fa':playerHpPct>30?'#fb923c':'#f87171';
  var atkBtn='<button id="towerAtkBtn" onclick="towerAttack()" style="width:100%;padding:14px;border:none;border-radius:12px;background:linear-gradient(135deg,#ff6b35,#ff3a3a);color:#fff;font-size:16px;font-weight:700;cursor:pointer;letter-spacing:2px;box-shadow:0 4px 16px rgba(255,80,80,.4)">⚔️ 发起攻击 (伤害:'+playerDmg+')</button>';
  var sweepMax=Math.max(1,floor-1);
  var sweepBtn='<button id="towerSweepBtn" onclick="towerSweep()" style="width:100%;margin-top:6px;padding:10px 14px;border:1px solid rgba(251,191,36,.4);border-radius:10px;background:rgba(251,191,36,.08);color:#fbbf24;font-size:13px;cursor:pointer;font-weight:600">🌀 扫荡 1~'+sweepMax+'层</button>';
  var msItems='';
  TOWER_ACHIEVEMENTS.forEach(function(a,i){
    var done=G.towerFloor>=a.floor;
    var claimed=G.towerMilestones&&G.towerMilestones.includes(i);
    var cls='tower-ms-item'+(done?'':' tower-ms-locked')+(claimed?' tower-ms-claimed':'');
    var btn=done&&!claimed?'<button onclick="towerClaimMilestone('+i+')" style="background:#ff6b35;border:none;color:#fff;border-radius:6px;padding:2px 8px;font-size:.75em;cursor:pointer">领取</button>':(claimed?'✅':'🔒');
    msItems+='<div class="'+cls+'"><span>通关第 <b>'+a.floor+'</b> 层: <span style="font-weight:700;color:#c8860a">'+a.coins+'💰</span>'+(a.qi?' <span style="color:#0277bd">'+a.qi+'<span class="qi-icon qi-icon-sm"></span></span>':'')+(a.title?' <span style="color:#7b3fcb">★'+a.title+'</span>':'')+'</span> '+btn+'</div>';
  });
  var msHtml='<div style="margin-top:12px;border-top:1px solid rgba(255,255,255,.06);padding-top:10px"><div style="font-size:12px;color:#888;margin-bottom:6px">📊 层数里程碑</div>'+msItems+'</div>';
  var attrHtml=(eq.atk||eq.def||eq.spd)?'<div style="display:flex;justify-content:center;gap:12px;font-size:11px;color:#aaa;margin-bottom:8px">'+(eq.atk?'<span>⚔️ '+eq.atk+'</span>':'')+(eq.def?'<span>🛡️ '+eq.def+'</span>':'')+(eq.spd?'<span>💨 '+eq.spd+'</span>':'')+suitTag+'</div>':'';
  var playerHpHtml='<div style="margin-top:8px;text-align:center"><div style="font-size:11px;color:#93c5fd;margin-bottom:4px">你的 HP: '+playerHp+' / '+playerMaxHp+'</div><div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+playerHpPct+'%;background:'+phpColor+';border-radius:4px;transition:width .15s"></div></div></div>';
  var html='<div style="padding:16px"><div style="background:rgba(255,107,53,.08);border:1px solid rgba(255,107,53,.3);border-radius:12px;padding:12px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px">'+floorTxt+bossMark+'</span><span style="font-size:11px;color:#888">'+floor+'/100层</span></div><div style="height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+progPct+'%;background:linear-gradient(90deg,#ff6b35,#ffd700);border-radius:3px"></div></div></div>'+attrHtml+'<div style="background:linear-gradient(160deg,#1a0a2e,#2d1b4e);border:1px solid '+(boss?'#ff6b35':'#6b21a8')+';border-radius:14px;padding:14px;text-align:center;margin-bottom:12px"><div style="font-size:13px;color:#aaa;margin-bottom:4px">'+enemy.name+'</div><div style="font-size:26px;margin-bottom:6px">'+(boss?'👹':'👾')+'</div><div style="font-size:12px;color:#888;margin-bottom:8px">HP: '+curHp+' / '+enemy.hp+'</div><div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin-bottom:6px"><div style="height:100%;width:'+hpPct+'%;background:'+hpColor+';border-radius:4px;transition:width .15s"></div></div><div style="font-size:11px;color:#888">击杀奖励: <span style="font-weight:700;color:#c8860a">'+enemy.coins+'💰</span>'+(enemy.qi?' <span style="color:#0277bd">'+enemy.qi+'<span class="qi-icon qi-icon-sm"></span></span>':'')+'</div>'+playerHpHtml+'</div>'+
(floor>=100?'<div style="text-align:center;font-weight:700;color:#c8860a;font-size:13px;padding:10px">🎉 已通关100层！可领取所有里程碑奖励</div>':(atkBtn+sweepBtn))+msHtml+'</div>';
  c.innerHTML=html;
}

// 存档初始化（追加到 game.v3.js 末尾）
if(!G.towerFloor)    G.towerFloor=1;
if(!G.towerEnemyHp)  G.towerEnemyHp=0;  // 0表示满血，下次进入时刷新
if(!G.towerLastAtk)  G.towerLastAtk=Date.now();
if(!G.towerMilestones) G.towerMilestones=[];

}

// ═══════════════════════════════════════
// P1-2 炼宝阁 (Forge) - 配置
// ═══════════════════════════════════════

var QUALITY_NAMES   = ['普通','稀有','史诗','传说','天命'];
var QUALITY_COLORS  = ['#888','#4a9eff','#b44aff','#ff8c00','#ff3333'];
var QUALITY_COST    = [0, 50, 200, 800, 3000];   // 龙气购买价格
var QUALITY_CPS_PCT = [0, 10, 25, 50, 100];       // CPS加成百分比
var QUALITY_QI_PCT  = [0, 5, 15, 35, 70];         // 龙气加成百分比

// 装备类型
var EQUIP_TYPE_NAME = {weapon:'⚔️武器',armor:'🛡️护甲',accessory:'💍饰品'};

// 制作配方: {id, type, name, quality, iron, crystal, dragonScale, starDust, desc}
// quality: 0=普通 1=稀有 2=史诗 3=传说 4=天命
// ── 装备6大类 ──
// helmet=头盔 armor=护甲 shoes=鞋子 sword=长剑 shield=护盾 accessory=饰品
var FORGE_RECIPES = [
  // ── 头盔 ──
  {id:'h1',type:'helmet',name:'草帽',quality:0,def:4,iron:12,crystal:0,dragonScale:0,starDust:0,desc:'最初的防护'},
  {id:'h2',type:'helmet',name:'皮帽',quality:0,def:9,iron:35,crystal:3,dragonScale:0,starDust:0,desc:'皮质头盔'},
  {id:'h3',type:'helmet',name:'铁盔',quality:1,def:18,iron:80,crystal:10,dragonScale:0,starDust:0,desc:'铁制头盔'},
  {id:'h4',type:'helmet',name:'秘银盔',quality:2,def:38,iron:160,crystal:28,dragonScale:4,starDust:0,desc:'秘银守护'},
  {id:'h5',type:'helmet',name:'龙鳞盔',quality:3,def:68,iron:250,crystal:60,dragonScale:15,starDust:3,desc:'龙鳞之冠'},
  {id:'h6',type:'helmet',name:'天命冠',quality:4,def:110,iron:420,crystal:110,dragonScale:38,starDust:14,desc:'天命神冠'},
  // ── 护甲 ──
  {id:'a1',type:'armor',name:'布衣',quality:0,def:5,iron:15,crystal:0,dragonScale:0,starDust:0,desc:'基础的防护'},
  {id:'a2',type:'armor',name:'皮甲',quality:0,def:12,iron:40,crystal:4,dragonScale:0,starDust:0,desc:'皮革护身'},
  {id:'a3',type:'armor',name:'锁甲',quality:1,def:25,iron:90,crystal:12,dragonScale:0,starDust:0,desc:'铁链编织'},
  {id:'a4',type:'armor',name:'秘银甲',quality:2,def:48,iron:180,crystal:35,dragonScale:5,starDust:0,desc:'秘银铠甲'},
  {id:'a5',type:'armor',name:'龙鳞甲',quality:3,def:85,iron:280,crystal:75,dragonScale:18,starDust:4,desc:'龙鳞护体'},
  {id:'a6',type:'armor',name:'天命甲',quality:4,def:130,iron:450,crystal:140,dragonScale:45,starDust:18,desc:'天命战甲'},
  // ── 鞋子 ──
  {id:'s1',type:'shoes',name:'草鞋',quality:0,spd:5,def:2,iron:10,crystal:0,dragonScale:0,starDust:0,desc:'轻盈起步'},
  {id:'s2',type:'shoes',name:'布靴',quality:0,spd:10,def:5,iron:28,crystal:2,dragonScale:0,starDust:0,desc:'布面短靴'},
  {id:'s3',type:'shoes',name:'皮靴',quality:1,spd:22,def:10,iron:68,crystal:8,dragonScale:0,starDust:0,desc:'皮制战靴'},
  {id:'s4',type:'shoes',name:'秘银靴',quality:2,spd:46,def:20,iron:140,crystal:25,dragonScale:3,starDust:0,desc:'秘银快靴'},
  {id:'s5',type:'shoes',name:'龙鳞靴',quality:3,spd:80,def:38,iron:220,crystal:55,dragonScale:12,starDust:2,desc:'龙鳞之靴'},
  {id:'s6',type:'shoes',name:'天命靴',quality:4,spd:115,def:60,iron:380,crystal:105,dragonScale:35,starDust:12,desc:'天命飞靴'},
  // ── 长剑 ──
  {id:'w1',type:'sword',name:'木剑',quality:0,atk:8,iron:20,crystal:0,dragonScale:0,starDust:0,desc:'最简单的武器'},
  {id:'w2',type:'sword',name:'铁剑',quality:0,atk:18,iron:50,crystal:5,dragonScale:0,starDust:0,desc:'铁制长剑'},
  {id:'w3',type:'sword',name:'钢剑',quality:1,atk:35,iron:100,crystal:15,dragonScale:0,starDust:0,desc:'精钢打造'},
  {id:'w4',type:'sword',name:'秘银剑',quality:2,atk:60,iron:200,crystal:40,dragonScale:5,starDust:0,desc:'秘银铸就'},
  {id:'w5',type:'sword',name:'龙鳞剑',quality:3,atk:100,iron:300,crystal:80,dragonScale:20,starDust:5,desc:'龙鳞加护'},
  {id:'w6',type:'sword',name:'天命剑',quality:4,atk:160,iron:500,crystal:150,dragonScale:50,starDust:20,desc:'天命之剑'},
  // ── 护盾 ──
  {id:'d1',type:'shield',name:'木盾',quality:0,def:8,spd:-2,iron:18,crystal:0,dragonScale:0,starDust:0,desc:'简单防护'},
  {id:'d2',type:'shield',name:'皮盾',quality:0,def:15,spd:-4,iron:45,crystal:4,dragonScale:0,starDust:0,desc:'皮革圆盾'},
  {id:'d3',type:'shield',name:'铁盾',quality:1,def:30,spd:-5,iron:85,crystal:12,dragonScale:0,starDust:0,desc:'铁制塔盾'},
  {id:'d4',type:'shield',name:'秘银盾',quality:2,def:58,spd:-6,iron:170,crystal:32,dragonScale:4,starDust:0,desc:'秘银大盾'},
  {id:'d5',type:'shield',name:'龙鳞盾',quality:3,def:95,spd:-7,iron:260,crystal:68,dragonScale:16,starDust:4,desc:'龙鳞护盾'},
  {id:'d6',type:'shield',name:'天命盾',quality:4,def:145,spd:-8,iron:420,crystal:125,dragonScale:40,starDust:15,desc:'天命圣盾'},
  // ── 饰品 ──
  {id:'j1',type:'accessory',name:'草戒',quality:0,spd:5,atk:2,iron:10,crystal:0,dragonScale:0,starDust:0,desc:'最基础的饰品'},
  {id:'j2',type:'accessory',name:'银戒',quality:0,spd:10,atk:5,iron:30,crystal:3,dragonScale:0,starDust:0,desc:'银质戒指'},
  {id:'j3',type:'accessory',name:'玉佩',quality:1,spd:28,atk:12,iron:70,crystal:10,dragonScale:0,starDust:0,desc:'玉石雕琢'},
  {id:'j4',type:'accessory',name:'秘银坠',quality:2,spd:52,atk:24,iron:150,crystal:30,dragonScale:4,starDust:0,desc:'秘银护符'},
  {id:'j5',type:'accessory',name:'龙牙坠',quality:3,spd:88,atk:42,iron:250,crystal:65,dragonScale:15,starDust:3,desc:'龙牙精制'},
  {id:'j6',type:'accessory',name:'天命戒',quality:4,spd:120,atk:65,iron:400,crystal:120,dragonScale:40,starDust:15,desc:'天命圣戒'},
];

// 装备类型中文名
var EQUIP_TYPE_NAME={
  helmet:'头盔', armor:'护甲', shoes:'鞋子',
  sword:'长剑', shield:'护盾', accessory:'饰品'
};
// 装备类型图标
var EQUIP_TYPE_ICON={helmet:'⛑️',armor:'👕',shoes:'👟',sword:'⚔️',shield:'🛡️',accessory:'💍'};

// 强化消耗：每级需要铁锭和金
function getForgeEnhanceCost(level) {
  return {iron: level * 10, coin: level * level * 50};
}

// 升星消耗：当前星→目标星，需要同名装备数量+铁锭
function getForgeStarCost(currentStar) {
  var starReq = [0,2,2,2,2][currentStar] || 2;
  var ironCost = [0,30,80,200,500][currentStar] || 30;
  return {sameItem: starReq, iron: ironCost};
}

// 套装效果（2件/4件/6件套）
var SUIT_EFFECTS = {
  2: {name:'初具雏形',desc:'全属性+5%',cpsBonus:5,atkBonus:5,defBonus:5,spdBonus:5,qiBonus:10},
  4: {name:'战意凝聚',desc:'全属性+15%',cpsBonus:15,atkBonus:15,defBonus:15,spdBonus:15,qiBonus:20},
  6: {name:'天命套装',desc:'全属性+30% 金币+30% 龙气+50%',cpsBonus:30,atkBonus:30,defBonus:30,spdBonus:30,qiBonus:50},
};

// 套装数量计算（6类各装备1件=1套，集齐2/4/6类激活对应套装）
function countSuits(items){
  if(!items||!items.length) return{helmet:false,armor:false,shoes:false,sword:false,shield:false,accessory:false,total:0};
  var TYPES=['helmet','armor','shoes','sword','shield','accessory'];
  var equipped={};
  TYPES.forEach(function(t){equipped[t]=false;});
  for(var i=0;i<items.length;i++){if(items[i].equipped) equipped[items[i].type]=true;}
  var total=0;TYPES.forEach(function(t){if(equipped[t])total++;});
  equipped.total=total;
  return equipped;
}
function getSuitLevel(items){
  var n=(countSuits(items).total)||0;
  if(n>=6)return 6;
  if(n>=4)return 4;
  if(n>=2)return 2;
  return 0;
}
function getSuitEffect(items){
  var lv=getSuitLevel(items);
  return lv?SUIT_EFFECTS[lv]:null;
}

// ═══════════════════════════════════════
// P1-2 炼宝阁 - 功能函数
// ═══════════════════════════════════════

function openForgePanel(){
  renderForgePanel();
  var p=document.getElementById('forgePanel');
  if(p)p.classList.add('show');
}
function closeForgePanel(){
  var p=document.getElementById('forgePanel');
  if(p)p.classList.remove('show');
}

function renderForgePanel(){
  var c=document.getElementById('forgeContent');
  if(!G||!G.created){if(c)c.innerHTML='<div style="padding:40px;text-align:center;color:#666">请先创建角色</div>';return;}
  if(!c)return;
  var fm=G.forge||{items:[],materials:{iron:0,crystal:0,dragonScale:0,starDust:0},totalCrafts:0};
  var mat=fm.materials||{iron:0,crystal:0,dragonScale:0,starDust:0};
  var suitLv=getSuitLevel(fm.items);
  var suitEff=getSuitEffect(fm.items);
  var html='';

  // 材料栏
  html+='<div class="forge-materials">'+
    '<span class="mat-chip">🔩铁锭: '+mat.iron+'</span>'+
    '<span class="mat-chip">💎水晶: '+mat.crystal+'</span>'+
    '<span class="mat-chip">🐉龙鳞: '+mat.dragonScale+'</span>'+
    '<span class="mat-chip"><span class="qi-icon qi-icon-sm"></span>星尘: '+mat.starDust+'</span>'+
    '</div>';

  // 套装状态
  var suitHtml='';
  if(suitLv===6) suitHtml='<div class="suit-banner">👑 天命套装已激活！'+suitEff.desc+'</div>';
  else if(suitLv===4) suitHtml='<div class="suit-banner suit-2">⚙️ 战意凝聚已激活（4/6件）</div>';
  else if(suitLv===2) suitHtml='<div class="suit-banner suit-2">⚙️ 初具雏形已激活（2/6件）</div>';
  else {var tc=countSuits(fm.items);var tn=tc.total||0;suitHtml+='<div class="suit-progress">已装备 '+tn+'/6 件（集齐2件激活套装）</div>';}
  html+=suitHtml;

  // 标签切换（全局Tab + 装备分类快捷入口）
  html+='<div class="forge-tabs" id="forgeTabs">'+
    '<button class="forge-tab'+( _forgeTab==='craft'?' active':'')+'" onclick="switchForgeTab(\'craft\',event)">📜 制作台</button>'+
    '<button class="forge-tab'+( _forgeTab==='inventory'?' active':'')+'" onclick="switchForgeTab(\'inventory\',event)">🎒 背包 ('+(fm.items?fm.items.length:0)+')</button>'+
    '<button class="forge-tab'+( _forgeTab==='enhance'?' active':'')+'" onclick="switchForgeTab(\'enhance\',event)">⚡ 强化</button>'+
    '</div>'+
    '<div class="forge-eq-quick">'+
    '<button class="eq-quick-btn" onclick="switchForgeTab(\'inventory\',event);filterForgeEquip(\''+'helmet'+'\')">⛑️</button>'+
    '<button class="eq-quick-btn" onclick="switchForgeTab(\'inventory\',event);filterForgeEquip(\''+'armor'+'\')">👕</button>'+
    '<button class="eq-quick-btn" onclick="switchForgeTab(\'inventory\',event);filterForgeEquip(\''+'shoes'+'\')">👟</button>'+
    '<button class="eq-quick-btn" onclick="switchForgeTab(\'inventory\',event);filterForgeEquip(\''+'sword'+'\')">⚔️</button>'+
    '<button class="eq-quick-btn" onclick="switchForgeTab(\'inventory\',event);filterForgeEquip(\''+'shield'+'\')">🛡️</button>'+
    '<button class="eq-quick-btn" onclick="switchForgeTab(\'inventory\',event);filterForgeEquip(\''+'accessory'+'\')">💍</button>'+
    '</div>';

  // 内容区
  html+='<div class="forge-body" id="forgeBody">'+renderForgeCraft(fm,mat)+'</div>';

  c.innerHTML=html;
}

function renderForgeCraft(fm,mat){
  var html='<div class="forge-section-title">📜 制作台</div>';
  var recipes=[];
  for(var i=0;i<FORGE_RECIPES.length;i++){
    var r=FORGE_RECIPES[i];
    var can=mat.iron>=r.iron&&mat.crystal>=r.crystal&&mat.dragonScale>=r.dragonScale&&mat.starDust>=r.starDust;
    var color=QUALITY_COLORS[r.quality];
    html+='<div class="forge-recipe '+(can?'can-craft':'')+'" style="border-left:4px solid '+color+'">'+
      '<div class="recipe-name" style="color:'+color+'">'+r.name+' <span style="font-size:11px;color:#888">'+EQUIP_TYPE_NAME[r.type]+'</span></div>'+
      '<div class="recipe-cost">🔩'+r.iron+' 💎'+r.crystal+' 🐉'+r.dragonScale+' <span class="qi-icon qi-icon-sm"></span>'+r.starDust+'</div>'+
      '<div class="recipe-desc">'+r.desc+'</div>'+
      '<button class="forge-btn '+(can?'active':'disabled')+'" onclick="craftForgeItem(\''+r.id+'\')">'+(can?'🔨 制作':'材料不足')+'</button>'+
      '</div>';
  }
  return html;
}

function renderForgeInventory(fm,filter){
  var items=fm.items||[];
  if(filter&&filter!=='all') items=items.filter(function(it){return it.type===filter;});
  if(!items.length){
    return '<div class="forge-empty">🎒 背包空空， 去制作装备吧！</div>';
  }
  var html='<div class="forge-section-title">🎒 背包 ('+items.length+'件)</div>';
  html+='<div class="forge-eq-tabs">';
  var types=['all','helmet','armor','shoes','sword','shield','accessory'];
  var icons={all:'全部',helmet:'⛑️',armor:'👕',shoes:'👟',sword:'⚔️',shield:'🛡️',accessory:'💍'};
  types.forEach(function(t){
    html+='<button class="forge-eq-tab'+(filter===t||(!filter&&t==='all')?' active':'')+'" onclick="filterForgeEquip(\''+t+'\')">'+icons[t]+'</button>';
  });
  html+='</div><div class="forge-items-grid">';
  for(var i=0;i<items.length;i++){
    var it=items[i];
    var color=QUALITY_COLORS[it.quality];
    var maxLv=10+it.star*3;
    var attrHtml='<div class="fi-attr" style="font-size:11px;margin:3px 0 2px;color:#aaa">'+
      (it.atk?'<span style="color:#f87171">⚔️+'+it.atk+'</span> ':'')+
      (it.def?'<span style="color:#60a5fa">🛡️+'+it.def+'</span> ':'')+
      (it.spd?'<span style="color:#86efac">💨+'+it.spd+'</span> ':'')+'</div>';
    html+='<div class="forge-item '+(it.equipped?'equipped':'')+'" data-item-id="'+it.id+'" style="border-color:'+color+'">'+
      '<div class="fi-name" style="color:'+color+'">'+it.name+'</div>'+
      '<div class="fi-info">⭐'+it.star+' ★Lv.'+it.level+'/'+maxLv+'</div>'+
      attrHtml+
      '<div class="fi-type">'+EQUIP_TYPE_NAME[it.type]+'</div>'+
      '<div class="fi-btns">'+
        '<button class="fi-btn '+(it.equipped?'':'active')+'" onclick="equipForgeItem(\''+it.id+'\')">'+(it.equipped?'已装备':'装备')+'</button>'+
        '<button class="fi-btn active" onclick="enhanceForgeItem(\''+it.id+'\')">强化</button>'+
        '</div></div>';
  }
  html+='</div>';
  return html;
}

function renderForgeEnhance(fm,mat){
  if(!fm.items||!fm.items.length) return '<div class="forge-empty">先制作装备再来强化！</div>';
  var html='<div class="forge-section-title">⚡ 选择装备强化</div><div class="forge-items-list">';
  for(var i=0;i<fm.items.length;i++){
    var it=fm.items[i];
    var color=QUALITY_COLORS[it.quality];
    var maxLv=10+it.star*3;
    var cost=getForgeEnhanceCost(it.level+1);
    var canEnhance=it.level<maxLv&&mat.iron>=cost.iron&&G.coins>=cost.coin;
    html+='<div class="forge-list-item" data-item-id="'+it.id+'" style="border-left:3px solid '+color+'">'+
      '<div class="li-name" style="color:'+color+'">'+it.name+' ⭐'+it.star+' Lv.'+it.level+'/'+maxLv+'</div>'+
      '<div class="li-cost">强化消耗: 🔩'+cost.iron+' 💰'+cost.coin+'</div>'+
      '<div class="li-btns">'+
        '<button class="forge-btn '+(canEnhance?'active':'disabled')+'" onclick="enhanceForgeItem(\''+it.id+'\')">'+(canEnhance?'⚡强化':'材料不足')+'</button>'+
        '<button class="forge-btn '+(it.star<5?'active':'disabled')+'" onclick="starUpForgeItem(\''+it.id+'\')">'+(it.star<5?'⭐升星':'已满星')+'</button>'+
        '</div></div>';
  }
  html+='</div>';
  return html;
}

// 全局制作台Tab状态（跨刷新保持）
var _forgeTab='craft';
var _forgeEquipFilter='all';
function switchForgeTab(tab,e){
  _forgeTab=tab;
  document.querySelectorAll('.forge-tab').forEach(function(b){b.classList.remove('active');});
  if(e&&e.currentTarget)e.currentTarget.classList.add('active');
  var fm=G.forge||{items:[],materials:{iron:0,crystal:0,dragonScale:0,starDust:0}};
  var mat=fm.materials||{iron:0,crystal:0,dragonScale:0,starDust:0};
  var body=document.getElementById('forgeBody');
  if(!body)return;
  if(tab==='craft') body.innerHTML=renderForgeCraft(fm,mat);
  else if(tab==='inventory') body.innerHTML=renderForgeInventory(fm,_forgeEquipFilter);
  else if(tab==='enhance') body.innerHTML=renderForgeEnhance(fm,mat);
}
function filterForgeEquip(type){
  _forgeEquipFilter=type;
  var fm=G.forge||{items:[],materials:{iron:0,crystal:0,dragonScale:0,starDust:0}};
  var body=document.getElementById('forgeBody');
  if(body)body.innerHTML=renderForgeInventory(fm,_forgeEquipFilter);
}

function craftForgeItem(recipeId){
  var r=null;
  for(var i=0;i<FORGE_RECIPES.length;i++){if(FORGE_RECIPES[i].id===recipeId){r=FORGE_RECIPES[i];break;}}
  if(!r){showNotif('error','配方不存在');return;}
  var fm=G.forge||{items:[],materials:{iron:0,crystal:0,dragonScale:0,starDust:0},totalCrafts:0};
  var mat=fm.materials||{iron:0,crystal:0,dragonScale:0,starDust:0};
  if(mat.iron<r.iron||mat.crystal<r.crystal||mat.dragonScale<r.dragonScale||mat.starDust<r.starDust){
    showNotif('warn','材料不足！');return;
  }
  mat.iron-=r.iron; mat.crystal-=r.crystal; mat.dragonScale-=r.dragonScale; mat.starDust-=r.starDust;
  if(!fm.items)fm.items=[];
  var newItem={id:Date.now()+'_'+r.id,itemId:r.id,name:r.name,type:r.type,quality:r.quality,star:1,level:1,equipped:false};
  if(r.atk) newItem.atk=r.atk;
  if(r.def) newItem.def=r.def;
  if(r.spd) newItem.spd=r.spd;
  fm.items.push(newItem);
  fm.totalCrafts=(fm.totalCrafts||0)+1;
  G.forge=fm;
  saveGame();updateHud();renderForgePanel();
  showNotif('success','制作成功！获得 '+r.name);
  playSound('merge');
}

function enhanceForgeItem(itemId){
  var fm=G.forge||{items:[],materials:{}};
  var mat=fm.materials||{iron:0,crystal:0,dragonScale:0,starDust:0};
  var it=null;
  for(var i=0;i<fm.items.length;i++){if(fm.items[i].id===itemId){it=fm.items[i];break;}}
  if(!it){showNotif('error','装备不存在');return;}
  var maxLv=10+it.star*3;
  if(it.level>=maxLv){showNotif('warn','已达强化上限，请升星！');return;}
  var cost=getForgeEnhanceCost(it.level+1);
  if(mat.iron<cost.iron||G.coins<cost.coin){showNotif('warn','金币或材料不足！');return;}
  G.coins-=cost.coin;
  mat.iron-=cost.iron;
  it.level++;
  G.forge=fm;
  saveGame();updateHud();
  if(typeof playEnhanceSfx==='function')playEnhanceSfx();
  showNotif('success','强化成功！'+it.name+' → Lv.'+it.level);
  // 停留在强化Tab，刷新当前内容
  var body=document.getElementById('forgeBody');
  if(body)body.innerHTML=renderForgeEnhance(fm,mat);
}

function starUpForgeItem(itemId){
  var fm=G.forge||{items:[],materials:{}};
  var it=null,idx=-1;
  for(var i=0;i<fm.items.length;i++){if(fm.items[i].id===itemId){it=fm.items[i];idx=i;break;}}
  if(!it){showNotif('error','装备不存在');return;}
  if(it.star>=5){showNotif('warn','已满星！');return;}
  var cost=getForgeStarCost(it.star);
  var mat2=fm.materials||{iron:0,crystal:0,dragonScale:0,starDust:0};
  if(mat2.iron<cost.iron){showNotif('warn','铁锭不足！升星需要 '+cost.iron+' 🔩');return;}
  mat2.iron-=cost.iron;
  it.star++;
  G.forge=fm;
  saveGame();updateHud();
  if(typeof playSynthSuccess==='function')playSynthSuccess();
  showNotif('success','升星成功！⭐ '+it.star+'星');
  // 停留在强化Tab，刷新当前内容
  var body=document.getElementById('forgeBody');
  if(body)body.innerHTML=renderForgeEnhance(fm,mat2);
}

// 从背包快捷跳转强化（先切Tab再刷新强化列表）
function openEnhanceForItem(itemId){
  _forgeTab='enhance';
  switchForgeTab('enhance');
  // 可选：滚动到该装备（通过高亮）
  setTimeout(function(){
    var el=document.querySelector('[data-item-id="'+itemId+'"]');
    if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
  },100);
}

// 穿戴装备：同类型互斥（穿一件自动卸下同类型其他装备）
function equipForgeItem(itemId){
  var fm=G.forge||{items:[]};
  var targetItem=null;
  for(var i=0;i<fm.items.length;i++){
    if(fm.items[i].id===itemId){targetItem=fm.items[i];break;}
  }
  if(!targetItem){showNotif('error','装备不存在');return;}
  var newState=!targetItem.equipped;
  if(newState){
    // 先卸下同类型其他装备
    for(var i=0;i<fm.items.length;i++){
      if(fm.items[i].type===targetItem.type) fm.items[i].equipped=false;
    }
  }
  targetItem.equipped=newState;
  G.forge=fm;
  saveGame();updateHud();try{updateHeroSection&&updateHeroSection();}catch(e){}
  showNotif(newState?'success':'info',targetItem.name+' '+(newState?'[已装备]':'[已卸下]'));
  // 停留背包Tab，刷新当前分类
  var body=document.getElementById('forgeBody');
  if(body)body.innerHTML=renderForgeInventory(fm,_forgeEquipFilter);
}

// ============================================================
// 云端账号系统
// ============================================================
const CLOUD_API = "https://47.105.41.23/api";

// 工具函数：fetch 封装
async function _cloudFetch(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(CLOUD_API + path, opts);
  return r.json();
}

// 打开云端面板
function openCloudPanel() {
  document.getElementById("cloudPanel").classList.add("open");
  document.getElementById("cloudError").style.display = "none";
  const tab = G._cloudPlayerId ? "logout" : "login";
  if (tab === "logout") {
    document.getElementById("cloudPhone").value = G._cloudPhone || "";
    document.getElementById("cloudPhone").disabled = true;
    document.getElementById("cloudPwd").style.display = "none";
    document.getElementById("cloudSubmitBtn").textContent = "解除绑定";
  } else {
    document.getElementById("cloudPhone").value = "";
    document.getElementById("cloudPhone").disabled = false;
    document.getElementById("cloudPwd").style.display = "";
    switchCloudTab("login");
  }
}

// 关闭云端面板
function closeCloudPanel() {
  document.getElementById("cloudPanel").classList.remove("open");
}

// 切换登录/注册标签
function switchCloudTab(tab) {
  const lbtn = document.getElementById("cloudTabLogin");
  const rbtn = document.getElementById("cloudTabReg");
  if (tab === "login") {
    lbtn.style.cssText = "flex:1;padding:10px;background:rgba(255,215,0,.15);border:1px solid rgba(255,215,0,.4);border-radius:10px;font-weight:700;color:#c8860a;font-size:14px;cursor:pointer;";
    rbtn.style.cssText = "flex:1;padding:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#888;font-size:14px;cursor:pointer;";
    document.getElementById("cloudSubmitBtn").textContent = "登录";
  } else {
    rbtn.style.cssText = "flex:1;padding:10px;background:rgba(255,215,0,.15);border:1px solid rgba(255,215,0,.4);border-radius:10px;font-weight:700;color:#c8860a;font-size:14px;cursor:pointer;";
    lbtn.style.cssText = "flex:1;padding:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#888;font-size:14px;cursor:pointer;";
    document.getElementById("cloudSubmitBtn").textContent = "注册";
  }
}

// 提交登录/注册表单
async function cloudSubmit() {
  const panel = document.getElementById("cloudPanel");
  // 解除绑定
  if (panel.querySelector("#cloudPhone").disabled) {
    G._cloudPlayerId = null;
    G._cloudPhone = null;
    localStorage.setItem("DRAGON_CLICKER_SAVE_V1", JSON.stringify(G));
    closeCloudPanel();
    updateHeroSection();
    return;
  }
  const phone = document.getElementById("cloudPhone").value.trim();
  const pwd = document.getElementById("cloudPwd").value;
  const errEl = document.getElementById("cloudError");
  const btn = document.getElementById("cloudSubmitBtn");
  const isReg = btn.textContent === "注册";

  if (!phone || !isReg && !pwd) {
    errEl.textContent = "请填写手机号和密码"; errEl.style.display = "";
    return;
  }
  if (phone.length !== 11) {
    errEl.textContent = "手机号必须是11位"; errEl.style.display = "";
    return;
  }
  if (pwd.length < 6) {
    errEl.textContent = "密码至少6位"; errEl.style.display = "";
    return;
  }
  errEl.style.display = "none";
  btn.disabled = true;
  btn.textContent = "请稍候...";

  try {
    const path = isReg ? "/auth/register" : "/auth/login";
    const res = await _cloudFetch("POST", path, { phone, password: pwd });

    if (res.code === 0) {
      G._cloudPlayerId = res.player_id;
      G._cloudPhone = phone;
      localStorage.setItem("DRAGON_CLICKER_SAVE_V1", JSON.stringify(G));
      // 注册/登录成功后上传本地存档
      await cloudSaveToServer(true);
      closeCloudPanel();
      updateHeroSection();
      showToast((isReg ? "注册" : "登录") + "成功 ☁️", "#c8860a");
    } else {
      errEl.textContent = res.msg || "操作失败"; errEl.style.display = "";
      btn.disabled = false;
      btn.textContent = isReg ? "注册" : "登录";
    }
  } catch(e) {
    errEl.textContent = "网络错误，请检查网络连接"; errEl.style.display = "";
    btn.disabled = false;
    btn.textContent = isReg ? "注册" : "登录";
  }
}

// 云端存档（每次大操作后自动调用）
async function cloudSave(quiet) {
  if (!G._cloudPlayerId) return;
  try {
    await cloudSaveToServer(!!quiet);
    if (!quiet) {
      showToast("☁️ 已同步", "#4ade80");
    }
  } catch(e) {
    if (!quiet) showToast("同步失败", "#ff6b6b");
  }
}

// 主动保存到云端（带loading提示）
async function cloudSaveToServer(quiet) {
  if (!G._cloudPlayerId) return;
  const gameData = {
    coins: G.coins,
    totalCoinsEarned: G.totalCoinsEarned || G.coins,
    dragons: G.dragons,
    mergeCount: G.mergeCount || 0,
    zodiac: G.zodiac,
    fate: G.fate,
    dragonQi: G.dragonQi,
    achievements: G.achievements || [],
    unlockedAtlas: G.unlockedAtlas || [],
    signDays: G.signDays || 0,
    summonCount: G.summonCount || 0
  };
  await _cloudFetch("POST", "/game/save", {
    player_id: G._cloudPlayerId,
    game_data: gameData
  });
}

// 加载云端存档覆盖本地
async function cloudLoadFromServer(quiet) {
  if (!G._cloudPlayerId) return;
  const res = await _cloudFetch("GET", "/game/load/" + G._cloudPlayerId);
  if (res.code === 0 && res.game_data) {
    const d = res.game_data;
    G.coins = d.coins || 0;
    G.totalCoinsEarned = d.totalCoinsEarned || d.coins || 0;
    G.dragons = d.dragons || [];
    G.mergeCount = d.mergeCount || 0;
    G.zodiac = d.zodiac ?? -1;
    G.fate = d.fate ?? -1;
    G.dragonQi = d.dragonQi || 0;
    G.achievements = d.achievements || [];
    G.unlockedAtlas = d.unlockedAtlas || [];
    G.signDays = d.signDays || 0;
    G.summonCount = d.summonCount || 0;
    localStorage.setItem("DRAGON_CLICKER_SAVE_V1", JSON.stringify(G));
    saveGame();
    updateHud();
    if (!quiet) showToast("☁️ 云端存档已恢复", "#4ade80");
  }
}

// 云端同步按钮（侧边栏加一个云图标）
// 在 startGame 末尾调用，初始化时检查已登录玩家
function _initCloudAccount() {
  if (G._cloudPlayerId) {
    cloudLoadFromServer(true).catch(function() {});
  }
}