// ===== UI.js - 生肖天机 =====

function renderAch(filter){
  if(!filter) filter='all';
  const p=document.getElementById('achPanel');
  const rank=getRank();
  const done=_unlocked.size,total=ACHIEVEMENTS.length;
  const pct=Math.round(done/total*100);
  const cnt=new Set(G.dragons.map(d=>d.level)).size;
  const ac=(G.achCoins||0), aq=(G.achQi||0);
  const types=['all','summon','merge','coin','rank','level','combo'];
  const labels={'all':'全部','summon':'召唤','merge':'合成','coin':'财富','rank':'收集','level':'等级','combo':'连击'};
  const tabColors={'all':'#ffd700','summon':'#a78bfa','merge':'#60a5fa','coin':'#ffd700','rank':'#4ade80','level':'#fb923c','combo':'#f87171'};
  let tabsHtml=types.map(t=>{
    const active=filter===t?'background:'+tabColors[t]+'22;border-color:'+tabColors[t]+';color:'+tabColors[t]:'background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);color:#888';
    const cnt2=t==='all'?done:ACHIEVEMENTS.filter(a=>a.type===t&&_unlocked.has(a.id)).length;
    return '<button onclick="renderAch(\''+t+'\')" style="flex:1;padding:5px 4px;border-radius:8px;border:1px solid;font-size:11px;cursor:pointer;transition:all .2s;'+active+'">'+labels[t]+'('+cnt2+')</button>';
  }).join('');
  const filtered=filter==='all'?ACHIEVEMENTS:ACHIEVEMENTS.filter(a=>a.type===filter);
  const achHtml=filtered.map(a=>{
    const d=_unlocked.has(a.id);
    const rc=a.reward||{};
    const rLine='<div style="margin-top:4px;font-size:10px;color:#666;">'+(rc.coins?'<span style="color:#ffd700">+'+rc.coins+'💰</span> ':'')+(rc.qi?'<span style="color:#a0d8ef">+'+rc.qi+'✨</span> ':'')+(rc.title?'<span style="color:#f0abfc">★'+rc.title+'</span> ':'')+'</div>';
    const borderCol=d?(a.color||'#ffd700'):'rgba(255,255,255,.06)';
    return '<div style="background:'+(d?'rgba(255,215,0,.04)':'rgba(255,255,255,.02)')+';border:1px solid '+borderCol+';border-radius:12px;padding:12px 8px;text-align:center;opacity:'+(d?'1':'0.45')+';transition:opacity .2s">'+
      '<div style="font-size:26px;margin-bottom:4px;filter:'+(d?'none':'grayscale(1)')+';">'+a.icon+'</div>'+
      '<div style="font-size:12px;font-weight:600;color:'+(d?(a.color||'#ffd700'):'#555')+';">'+a.title+'</div>'+
      '<div style="font-size:10px;color:#555;margin-top:3px;">'+a.desc+'</div>'+rLine+'</div>';
  }).join('');
  p.innerHTML='<div style="padding:20px 16px 80px;">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'+
      '<div style="font-size:16px;font-weight:700;">🏅 成就</div>'+
      '<div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeAchPanel()">✕</div>'+
    '</div>'+
    '<div style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:14px;padding:14px;margin-bottom:12px;text-align:center;">'+
      '<div style="font-size:36px;margin-bottom:4px;">'+rank.icon+'</div>'+
      '<div style="font-size:16px;font-weight:700;color:'+rank.color+';">'+rank.title+'</div>'+
      '<div style="font-size:11px;color:#888;margin-top:2px;">已集齐 '+cnt+' 种灵兽 · '+done+'/'+total+' 成就</div>'+
      '<div style="margin-top:8px;height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;">'+
        '<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#ffd700,#ff8c00);border-radius:3px;"></div></div>'+
      '<div style="margin-top:6px;font-size:11px;color:#666;">已领奖励: <span style="color:#ffd700">'+ac+'💰</span> <span style="color:#a0d8ef">'+aq+'✨</span>'+
        (G.titles&&G.titles.length?' · <span style="color:#f0abfc">'+G.titles.map(function(t){return '★'+t;}).join('')+'</span>':'')+'</div>'+
    '</div>'+
    '<div style="display:flex;gap:4px;margin-bottom:12px;">'+tabsHtml+'</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+achHtml+'</div>'+
  '</div>';
}
function openAchPanel(){renderAch();document.getElementById('achPanel').classList.add('open');}
function closeAchPanel(){document.getElementById('achPanel').classList.remove('open');}
function initAch(){if(G.created)setTimeout(checkAch,500);}

// ── 云端排行榜（#6）──
// 提交当前分数到飞书自定义机器人 Webhook
// 云端天机榜提交（异步，离线也能玩）
let _cloudRankCache = null;   // 缓存排行榜数据
let _lastSubmitTime = 0;      // 防抖：5秒内不重复提交

function submitToLeaderboard(){
  const now = Date.now();
  if(now - _lastSubmitTime < 5000){ showNotif('info','⏱ 稍等片刻再提交'); return; }
  _lastSubmitTime = now;
  
  const backendUrl = G.backendUrl || '';
  if(!backendUrl){ showNotif('error','请先在设置中配置服务器地址'); return; }
  
  const meName = G.zodiac>=0 ? ZOD_E[G.zodiac]+'的'+FATE_E[G.fate] : '神秘玩家';
  showNotif('info','☁️ 正在提交...');
  
  // 同时写本地（保存记录用于后续比较）+ 写云端
  saveRankScore(); // 写 localStorage
  
  fetch(backendUrl+'/api/leaderboard/submit',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:meName, score:Math.floor(G.coins), zodiac:G.zodiac>=0?ZOD_E[G.zodiac]:''}),
    signal:AbortSignal.timeout(10000)
  })
  .then(r=>r.json())
  .then(data=>{
    if(data.ok){
      showNotif(data.improved?'success':'info', data.msg || '☁️ 已上榜！排名第 '+data.rank);
      _cloudRankCache = null; // 清除缓存，下次打开刷新
    } else {
      showNotif('error','☁️ 提交失败：'+(data.error||'未知错误'));
    }
  })
  .catch(()=>{
    // 离线也能玩：静默失败，不阻断玩家
    showNotif('error','☁️ 网络不稳定，稍后再试（离线模式正常游戏）');
  });
}

// 一键自动提交（玩家手动触发，离线保护）
function autoSubmitIfNeeded(){
  if(!G.backendUrl) return;
  const now = Date.now();
  if(G.lastSubmitDate === today() && now - (G.lastSubmitTs||0) < 300000) return; // 5分钟内不重复
  submitToLeaderboard();
  G.lastSubmitDate = today();
  G.lastSubmitTs = now;
  saveGame();
}

function saveRankScore(){
  try{
    const list=JSON.parse(localStorage.getItem(SAVE_KEY+'_rank')||'[]');
    const name=G.zodiac>=0?ZOD_E[G.zodiac]+'的'+FATE_E[G.fate]:'神秘玩家';
    const idx=list.findIndex(e=>e.name===name);
    const entry={name,coins:G.coins,date:new Date().toLocaleDateString('zh-CN',{month:'short',day:'numeric'})};
    if(idx>=0) list[idx]=entry; else list.push(entry);
    list.sort((a,b)=>b.coins-a.coins);
    localStorage.setItem(SAVE_KEY+'_rank',JSON.stringify(list.slice(0,20)));
  }catch(e){}
}
// 渲染天机榜（从缓存或云端）
function renderRankPanel(list, myRank, myRecord, loading){
  const p=document.getElementById('rankPanel');
  const meName=G.zodiac>=0?ZOD_E[G.zodiac]+'的'+FATE_E[G.fate]:'神秘玩家';
  const localRecord = myRecord || {coins:G.coins};
  const backendUrl = G.backendUrl||'';
  const noServer = !backendUrl;
  const submitBtn = noServer
    ? '<div style="margin-top:10px;text-align:center;font-size:11px;color:#555;">☁️ 请先在设置中配置服务器地址</div>'
    : '<button onclick="submitToLeaderboard();event.stopPropagation();" style="margin-top:10px;width:100%;padding:10px;background:linear-gradient(135deg,#ffd700,#ff9800);border:none;border-radius:12px;font-size:13px;font-weight:700;color:#1a0a00;cursor:pointer;">☁️ 提交分数上榜</button>';

  p.innerHTML='<div style="padding:20px 16px 80px;">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'+
      '<div style="font-size:16px;font-weight:700;">🏅 天机榜</div>'+
      '<div style="display:flex;gap:6px;align-items:center;">'+
        (loading?'<span style="font-size:11px;color:#666;">⟳ 加载中</span>':'')+
        '<button onclick="event.stopPropagation();refreshRankPanel()" style="background:none;border:none;color:#888;cursor:pointer;font-size:12px;" title="刷新">⟳</button>'+
        '<div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeRankPanel()">✕</div>'+
      '</div>'+
    '</div>'+
    // 我的战绩卡片
    '<div style="background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,140,0,.05));border:1px solid rgba(255,215,0,.25);border-radius:14px;padding:16px;margin-bottom:16px;text-align:center;">'+
      '<div style="font-size:11px;color:#888;margin-bottom:6px;">☁️ 云端排名</div>'+
      '<div style="font-size:40px;font-weight:900;color:#ffd700;">'+(myRank>0?myRank:'—')+'</div>'+
      '<div style="font-size:11px;color:#666;margin-top:4px;">'+(myRank>0?'超过 '+(myRank>1?Math.round((1-myRank/(list.length+1))*100)+'% 玩家':'首上榜!'):'暂未上榜，提交分数即可上榜')+'</div>'+
      '<div style="margin-top:8px;font-size:13px;color:#ffd700;font-weight:600;">💰 '+fmtNum(G.coins)+' 金币</div>'+
      submitBtn+
    '</div>'+
    // 排行榜列表
    '<div style="font-size:12px;font-weight:700;color:#555;margin-bottom:8px;padding-left:4px;">🏆 排行 TOP '+list.length+'</div>'+
    '<div style="background:rgba(0,0,0,.2);border-radius:12px;overflow:hidden;margin-bottom:16px;">'+
    (list.length===0
      ? '<div style="padding:30px;text-align:center;color:#444;font-size:12px;">暂无上榜记录<br>成为第一个上榜的玩家吧！</div>'
      : list.map((e,i)=>{
        const rank=i+1;
        const isMe=e.name===meName;
        const isTop3=rank<=3;
        const bg=isTop3?'rgba(255,215,0,.06)':isMe?'rgba(255,215,0,.03)':'transparent';
        const rankicon=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':rank;
        const rcolor=rank===1?'#ffd700':rank===2?'#c0c0c0':rank===3?'#cd7f32':'#888';
        return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:'+bg+';border-bottom:1px solid rgba(255,255,255,.04);'+(isMe?'font-weight:700;':'')+'">'+
          '<div style="font-size:16px;width:24px;text-align:center;color:'+rcolor+';">'+rankicon+'</div>'+
          '<div style="flex:1;min-width:0;">'+
            '<div style="font-size:12px;color:'+(isMe?'#ffd700':'#ccc')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(e.zodiac||'')+e.name+(isMe?' (我)':'')+'</div>'+
            '<div style="font-size:10px;color:#555;margin-top:2px;">'+(e.date||'') + ' · '+ (e.zodiac||'')+'</div>'+
          '</div>'+
          '<div style="font-size:12px;color:#ffd700;font-weight:600;white-space:nowrap;">'+fmtNum(e.score||e.coins)+'</div>'+
        '</div>';
      }).join(''))+
    '</div>'+
    '<div style="font-size:11px;color:#444;text-align:center;">☁️ 数据来自云端服务器 · '+list.length+' 人上榜</div>'+
  '</div>';
}

// 打开天机榜 → 自动从云端拉取
function openRankPanel(){
  document.getElementById('rankPanel').classList.add('open');
  refreshRankPanel();
}

// 刷新天机榜（从云端拉取）
function refreshRankPanel(){
  const backendUrl = G.backendUrl||'';
  const meName = G.zodiac>=0 ? ZOD_E[G.zodiac]+'的'+FATE_E[G.fate] : '神秘玩家';
  const panel = document.getElementById('rankPanel');
  // 先显示加载态
  if(panel) renderRankPanel([], 0, null, true);
  if(!backendUrl){
    // 无服务器 → 显示本地榜
    const list = getRankList().map(e=>({name:e.name, coins:e.coins, score:e.coins, date:e.date}));
    const myRank = list.findIndex(e=>e.name===meName)+1;
    if(panel) renderRankPanel(list, myRank, null, false);
    return;
  }
  fetch(backendUrl+'/api/leaderboard?name='+encodeURIComponent(meName),{signal:AbortSignal.timeout(8000)})
  .then(r=>r.json())
  .then(data=>{
    if(data.ok){
      _cloudRankCache = data.top.map(e=>({name:e.name,score:e.score,zodiac:e.zodiac||'',date:''}));
      const myRank = data.myRank||0;
      if(panel) renderRankPanel(_cloudRankCache, myRank, data.myRecord, false);
    } else {
      throw new Error(data.error);
    }
  })
  .catch(()=>{
    // 离线降级：显示本地缓存
    const list = _cloudRankCache || getRankList().map(e=>({name:e.name,score:e.coins,coins:e.coins,date:e.date}));
    const myRank = list.findIndex(e=>e.name===meName)+1;
    if(panel) renderRankPanel(list, myRank, null, false);
  });
}
function closeRankPanel(){document.getElementById('rankPanel').classList.remove('open');}

function openHandbook(){renderHandbook();document.getElementById('handbookPanel').classList.add('open');}
function closeHandbook(){document.getElementById('handbookPanel').classList.remove('open');}

function openCultPanel(){calcCultQi();renderCultPanel();document.getElementById('cultPanel').classList.add('open');}
function closeCultPanel(){document.getElementById('cultPanel').classList.remove('open');}

function openSettings(){
  loadSettings();
  document.getElementById('settingsPanel').classList.add('open');
}
function closeSettings(){
  document.getElementById('settingsPanel').classList.remove('open');
}
function onVolChange(v){
  document.getElementById('volVal').textContent=v+'%';
  _audioState.volume=v/100;
}
function onBgmToggle(on){
  document.getElementById('bgmLabel').textContent=on?'开启':'关闭';
  document.getElementById('bgmSlider').disabled=!on;
  if(on){
    _audioState.bgmVolume=_audioState.bgmLast||0.35;
    try{playFullBgm&&playFullBgm(G.zodiac>-1?G.zodiac:0);}catch(e){try{playFullBgm&&playFullBgm(0);}catch(e2){}}
    document.getElementById('bgmSlider').value=Math.round(_audioState.bgmVolume*100);
  }else{
    _audioState.bgmLast=_audioState.bgmVolume||0.35;
    _audioState.bgmVolume=0;
    stopBgm();
  }
}
function onBgmChange(v){
  _audioState.bgmVolume=v/100;
}
function onSfxToggle(on){
  document.getElementById('sfxLabel').textContent=on?'开启':'关闭';
  document.getElementById('sfxSlider').disabled=!on;
  if(on){
    _audioState.sfxVolume=_audioState.sfxLast||0.8;
    document.getElementById('sfxSlider').value=Math.round(_audioState.sfxVolume*100);
  }else{
    _audioState.sfxLast=_audioState.sfxVolume||0.8;
    _audioState.sfxVolume=0;
  }
}
function onSfxChange(v){
  _audioState.sfxVolume=v/100;
}
function saveSettings(){
  localStorage.setItem('audio_v2',JSON.stringify({
    volume:_audioState.volume,
    bgmVolume:_audioState.bgmVolume,
    bgmLast:_audioState.bgmLast||0.35,
    sfxVolume:_audioState.sfxVolume,
    sfxLast:_audioState.sfxLast||0.8,
  }));
  // 保存服务器地址
  const urlInput = document.getElementById('backendUrlInput');
  if(urlInput){
    G.backendUrl = urlInput.value.trim();
    saveGame();
  }
}
function loadSettings(){
  const s=JSON.parse(localStorage.getItem('audio_v2')||'{}');
  if(s.volume!==undefined) _audioState.volume=s.volume;
  if(s.bgmVolume!==undefined) _audioState.bgmVolume=s.bgmVolume;
  if(s.bgmLast!==undefined) _audioState.bgmLast=s.bgmLast;
  if(s.sfxVolume!==undefined) _audioState.sfxVolume=s.sfxVolume;
  if(s.sfxLast!==undefined) _audioState.sfxLast=s.sfxLast;
  document.getElementById('volSlider').value=Math.round(_audioState.volume*100);
  document.getElementById('volVal').textContent=Math.round(_audioState.volume*100)+'%';
  const bgmOn=_audioState.bgmVolume>0;
  document.getElementById('bgmToggle').checked=bgmOn;
  document.getElementById('bgmLabel').textContent=bgmOn?'开启':'关闭';
  document.getElementById('bgmSlider').value=Math.round(_audioState.bgmVolume*100);
  document.getElementById('bgmSlider').disabled=!bgmOn;
  const sfxOn=_audioState.sfxVolume>0;
  document.getElementById('sfxToggle').checked=sfxOn;
  document.getElementById('sfxLabel').textContent=sfxOn?'开启':'关闭';
  document.getElementById('sfxSlider').value=Math.round(_audioState.sfxVolume*100);
  document.getElementById('sfxSlider').disabled=!sfxOn;
  // 加载服务器地址
  const urlInput = document.getElementById('backendUrlInput');
  if(urlInput && G.backendUrl) urlInput.value = G.backendUrl;
  if(urlInput && !G.backendUrl) urlInput.placeholder = '例：http://你的服务器IP:3001';
}
