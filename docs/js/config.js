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
// 点击主页灵兽 → 显示详情弹窗
function cycleHeroAnim(){
  const best = G.dragons.reduce((a,b)=>(a.level||0)>=(b.level||0)?a:b);
  if(best.id) showDragonDetail(best.id);
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

// 灵兽详情弹窗
function showDragonDetail(dragonId){
  const dragon = G.dragons.find(d => d.id === String(dragonId));
  if(!dragon){ // 传level时走降级逻辑（缩略图旧数据）
    const lvl = parseInt(dragonId);
    if(lvl < 1 || lvl > 15) return;
    const names = ['啾啾雀跃','啾啾雀跃','啾啾雀跃','振翅欲飞','振翅欲飞','振翅欲飞','翩翩起舞','盘龙腾云','盘龙腾云','盘龙腾云','灵蛇灵马','灵蛇灵马','帝王神威','帝王神威','天命永恒'];
    const rarities = ['普通','普通','普通','稀有','稀有','稀有','珍稀','珍稀','珍稀','传说','传说','史诗','史诗','神话','神话'];
    const colors = {普通:'#aaa',稀有:'#7eb8ff',珍稀:'#42a5f5',传说:'#9c27b0',史诗:'#ff9800',神话:'#ffd700'};
    const skills = {
      普通:'被动：每分钟自动产出少量金币',
      稀有:'被动：金币产出+50%，有几率触发双倍收益',
      珍稀:'被动：召唤所需龙气-10%，产出+100%',
      传说:'被动：每5分钟免费召唤一次（需空格）',
      史诗:'被动：合并成功率+20%，金币产出翻2倍',
      神话:'被动：全属性+300%，每级召唤必得珍稀以上',
    };
    const r = rarities[lvl-1]||'普通';
    const color = colors[r];
    const icon = LICON[lvl]||'🐣';
    const cps = COIN_S[lvl]||0;
    const desc = skills[r];
    showDetailModal({level:lvl, icon, cps, r, color, names:names[lvl-1], desc});
    return;
  }
  const lvl = dragon.level||1;
  const names = ['啾啾雀跃','啾啾雀跃','啾啾雀跃','振翅欲飞','振翅欲飞','振翅欲飞','翩翩起舞','盘龙腾云','盘龙腾云','盘龙腾云','灵蛇灵马','灵蛇灵马','帝王神威','帝王神威','天命永恒'];
  const rarities = ['普通','普通','普通','稀有','稀有','稀有','珍稀','珍稀','珍稀','传说','传说','史诗','史诗','神话','神话'];
  const colors = {普通:'#aaa',稀有:'#7eb8ff',珍稀:'#42a5f5',传说:'#9c27b0',史诗:'#ff9800',神话:'#ffd700'};
  const skills = {
    普通:'被动：每分钟自动产出少量金币',
    稀有:'被动：金币产出+50%，有几率触发双倍收益',
    珍稀:'被动：召唤所需龙气-10%，产出+100%',
    传说:'被动：每5分钟免费召唤一次（需空格）',
    史诗:'被动：合并成功率+20%，金币产出翻2倍',
    神话:'被动：全属性+300%，每级召唤必得珍稀以上',
  };
  const r = rarities[lvl-1]||'普通';
  const color = colors[r];
  const icon = LICON[dragon.idx]||LICON[lvl]||'🐣';
  const cps = COIN_S[lvl]||0;
  const desc = skills[r];
  showDetailModal({level:lvl, icon, cps, r, color, names:names[lvl-1], desc, dragon});
}

function showDetailModal({level, icon, cps, r, color, names, desc, dragon}){
  // 判断是最高级灵兽还是普通预览
  const best = G.dragons.reduce((a,b)=>(a.level||0)>=(b.level||0)?a:b);
  const isBest = dragon && dragon.id === best.id;
  const header = isBest ? '当前最强灵兽' : (dragon ? '灵兽详情' : 'Lv.' + level + ' · ' + (LNAME[level]||'灵兽'));
  const tag = isBest ? '<span style="background:#ffd700;color:#1a0a00;font-size:9px;font-weight:800;padding:2px 8px;border-radius:10px;letter-spacing:2px;display:inline-block;margin-bottom:8px;">★ 当前最强</span>' : '';
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(6px);';
  el.innerHTML = `<div style="background:linear-gradient(160deg,#0d0d2a 0%,#1a1a3a 100%);border:1.5px solid ${color}44;border-radius:28px;padding:36px 32px;width:min(340px,90vw);text-align:center;animation:popIn .35s cubic-bezier(.34,1.56,.64,1);box-shadow:0 0 40px ${color}22;">
    ${tag}
    <div style="font-size:11px;letter-spacing:4px;color:${color};opacity:.8;margin-bottom:4px;">${header}</div>
    <div style="font-size:80px;margin:12px 0;filter:drop-shadow(0 0 30px ${color}66);">${icon}</div>
    <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:2px;">${LNAME[level]||'灵兽'}</div>
    <div style="font-size:12px;color:${color};letter-spacing:3px;margin-bottom:8px;">${r}</div>
    <div style="font-size:36px;font-weight:900;color:${color};margin:8px 0;">+${cps}/s</div>
    <div style="font-size:12px;color:#888;margin-bottom:16px;">每秒产出 <span style="color:#ffd700;">${cps}</span> 金币</div>
    <div style="background:rgba(255,255,255,.04);border-radius:16px;padding:16px;margin-bottom:16px;text-align:left;font-size:13px;color:#999;line-height:1.9;">
      <div style="color:${color};font-weight:700;margin-bottom:8px;font-size:14px;">⚡ ${names}</div>
      <div>${desc}</div>
    </div>
    <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;">
      <div style="flex:1;background:rgba(255,255,255,.04);border-radius:12px;padding:10px 8px;">
        <div style="font-size:18px;">${isBest ? G.dragons.length : (dragon ? 1 : '?')}</div>
        <div style="font-size:10px;color:#555;letter-spacing:1px;">${isBest ? '灵兽总数' : '该等级'}</div>
      </div>
      <div style="flex:1;background:rgba(255,255,255,.04);border-radius:12px;padding:10px 8px;">
        <div style="font-size:18px;">Lv.${level}</div>
        <div style="font-size:10px;color:#555;letter-spacing:1px;">当前等级</div>
      </div>
      <div style="flex:1;background:rgba(255,255,255,.04);border-radius:12px;padding:10px 8px;">
        <div style="font-size:18px;color:${color};">${r}</div>
        <div style="font-size:10px;color:#555;letter-spacing:1px;">品阶</div>
      </div>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:4px;">点击任意处关闭</div>
  </div>`;
  el.onclick = e => { if(e.target===el) el.remove(); };
  document.body.appendChild(el);
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
let G = {zodiac:-1,fate:-1,created:false,coins:0,qi:0,dragons:[],mergeCount:0,summonCount:0,currentFate:3,freeLeft:3,lastFreeDate:null,cultivation:{mu:0,huo:0,tu:0,kin:0,shui:0},lastQiTime:Date.now(),signDate:null,signStreak:0,tasks:null,lastTaskDate:null};

// 每日任务配置（5个任务，所有目标随时间自然推进）
const TASKS = [
  {id:'summon10',  icon:'🐣', title:'灵兽召唤',  desc:'累计召唤10次', target:10,  reward:{coin:1000,qi:20,free:0},  type:'static'},
  {id:'summon30',  icon:'🐥', title:'召唤达人',  desc:'累计召唤30次', target:30,  reward:{coin:3000,qi:60,free:1},  type:'static'},
  {id:'merge10',   icon:'⚡', title:'合成进阶',  desc:'累计合成10次', target:10,  reward:{coin:2000,qi:40,free:0},  type:'static'},
  {id:'merge30',   icon:'🌟', title:'合成大师',  desc:'累计合成30次', target:30,  reward:{coin:8000,qi:120,free:2}, type:'static'},
  {id:'login',     icon:'🎮', title:'每日登录',  desc:'登录游戏即可', target:1,   reward:{coin:500, qi:10, free:0},  type:'login'},
];

// 7天签到配置
const SIGN_REWARDS = [
  {coin:500,  qi:10,  free:0, label:'第1天'},
  {coin:1000, qi:20,  free:0, label:'第2天'},
  {coin:2000, qi:30,  free:0, label:'第3天'},
  {coin:5000, qi:50,  free:1, label:'第4天'},
  {coin:8000, qi:80,  free:1, label:'第5天'},
  {coin:15000, qi:150, free:1, label:'第6天'},
  {coin:30000, qi:300, free:2, label:'第7天'},
];
let nextId = 1;
let cpsTimer = null, qiTimer = null, bgmTimer = null;

function saveGame(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(G));
}
function loadGame(){
  const s = localStorage.getItem(SAVE_KEY);
  if(s){try{Object.assign(G,JSON.parse(s));}catch(e){}}
  if(G.dragons.length) nextId = Math.max(...G.dragons.map(d=>parseInt(d.id)))+1;
  // 兼容旧存档：没有 lastFreeDate 则设为今天（防止每日重置失效）
  if(!G.lastFreeDate) G.lastFreeDate = today();
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
  if(G.fate===2) updateFreeBtn();
}

// 免费召唤按钮状态 + 倒计时
let _freeTimer = null;
function updateFreeBtn(){
  const btn = document.getElementById('btnFree');
  const countEl = document.getElementById('freeCount');
  if(!btn || !countEl) return;
  if(G.fate!==2){ btn.style.display='none'; return; }

  clearInterval(_freeTimer);

  if(G.freeLeft > 0){
    // 有剩余次数：显示次数
    btn.style.display='flex';
    btn.disabled=false;
    btn.style.opacity='1';
    btn.style.background='linear-gradient(135deg,#2d7a2d,#1a5a1a)';
    countEl.textContent='×'+G.freeLeft;
    countEl.style.color='rgba(76,175,80,.9)';
    countEl.style.fontSize='10px';
  } else {
    // 次数用完：显示倒计时
    btn.style.display='flex';
    btn.disabled=true;
    btn.style.opacity='0.5';
    btn.style.background='linear-gradient(135deg,#1a3a1a,#0d1f0d)';
    countEl.textContent='明日00:00';
    countEl.style.color='rgba(100,100,100,.7)';
    countEl.style.fontSize='9px';
    // 每分钟更新一次倒计时
    _freeTimer = setInterval(()=>{
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate()+1);
      tomorrow.setHours(0,0,0,0);
      const ms = tomorrow - now;
      const h = String(Math.floor(ms/3600000)).padStart(2,'0');
      const m = String(Math.floor((ms%3600000)/60000)).padStart(2,'0');
      if(countEl) countEl.textContent = h+':'+m+'后重置';
    }, 60000);
    // 立即更新一次
    const ev = new Event(''); // 触发一次
    clearInterval(_freeTimer);
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate()+1); tomorrow.setHours(0,0,0,0);
    const ms = tomorrow - now;
    const h = String(Math.floor(ms/3600000)).padStart(2,'0');
    const m = String(Math.floor((ms%3600000)/60000)).padStart(2,'0');
    countEl.textContent = h+':'+m+'后重置';
    _freeTimer = setInterval(()=>{
      const now = new Date();
      const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate()+1); tomorrow.setHours(0,0,0,0);
      const ms = tomorrow - now;
      const h = String(Math.floor(ms/3600000)).padStart(2,'0');
      const m = String(Math.floor((ms%3600000)/60000)).padStart(2,'0');
      if(countEl) countEl.textContent = h+':'+m+'后重置';
    }, 60000);
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
    cell.style.cursor='pointer';
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
    } else {
      const empty=document.createElement('div');
      empty.style.cssText='display:flex;align-items:center;justify-content:center;width:100%;height:100%;opacity:.18;cursor:pointer;';
      empty.innerHTML='<span style="font-size:clamp(16px,4vw,22px);line-height:1;filter:grayscale(1);">?</span>';
      empty.onclick=e=>{e.stopPropagation();showCellHint(i,cell);};
      cell.appendChild(empty);
    }
    grid.appendChild(cell);
  }
  markMergeable();
}

// 空格子提示
let _cellHintEl=null;
function showCellHint(idx,cellEl){
  if(_cellHintEl)_cellHintEl.remove();
  const lvl=idx+1;
  const icon=LICON[lvl]||'?';
  const name=LNAME[lvl]||'灵兽';
  const rarities=['普通','普通','普通','稀有','稀有','稀有','珍稀','珍稀','珍稀','传说','传说','史诗','史诗','神话','神话'];
  const r=rarities[lvl-1]||'普通';
  const rarColors={普通:'#aaa',稀有:'#7eb8ff',珍稀:'#42a5f5',传说:'#9c27b0',史诗:'#ff9800',神话:'#ffd700'};
  const color=rarColors[r];
  const owned=G.dragons.some(d=>d.level===lvl);
  const tip=owned?'已拥有该等级，等待召唤归来':'通过召唤获得 · 两张同等级可合成升级';
  const rect=cellEl.getBoundingClientRect();
  const el=document.createElement('div');
  el.style.cssText=`position:fixed;left:${Math.min(rect.left,window.innerWidth-200)}px;top:${rect.bottom+6}px;background:rgba(10,10,30,.96);border:1px solid ${color}44;border-radius:12px;padding:10px 14px;z-index:9999;font-size:11px;color:#888;line-height:1.6;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.5);`;
  el.innerHTML=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="font-size:18px;filter:drop-shadow(0 0 6px ${color}66);">${icon}</span><span style="font-weight:700;color:${color};">Lv${lvl} · ${name}</span></div><div style="font-size:10px;color:#555;">${tip}</div>`;
  el.onclick=e=>e.stopPropagation();
  _cellHintEl=el;
  document.body.appendChild(el);
  setTimeout(()=>{
    const close=ev=>{if(!el.contains(ev.target)){el.remove();document.removeEventListener('click',close);}};
    document.addEventListener('click',close);
  },50);
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
  if(G.freeLeft<=0){showNotif('error','今日免费次数已用完！明天 00:00 自动重置');return;}
  G.freeLeft--;
  saveGame();
  doSummon(getSummonLevel([{level:1,weight:100},{level:2,weight:80},{level:3,weight:50}]));
  try{updateFreeBtn();}catch(e){}
}


function showMergeFlash(emoji){
  const el=document.getElementById('mergeFlash');
  document.getElementById('mergeText').textContent=emoji;
  el.classList.add('show');setTimeout(()=>el.classList.remove('show'),500);
}
// showNotif 升级版：支持 emoji 前缀消息 + 稀有度颜色
// showNotif：兼容旧调用 showNotif(type, msg) 和新调用 showNotif(msg)
function showNotif(msg, colorOrOpts){
  const el=document.getElementById('notif');
  if(!el)return;
  clearTimeout(el._timer);
  const COLORS={
    success:'rgba(76,175,80,.92)',
    error:'rgba(244,67,54,.92)',
    info:'rgba(33,150,243,.92)',
    warning:'rgba(255,152,0,.92)',
    gold:'rgba(255,215,0,.92)',
  };
  // 旧调用：showNotif('error', 'message') — colorOrOpts 是消息字符串
  let bg, text;
  if(typeof colorOrOpts === 'string'){
    bg = COLORS[msg] || COLORS.info;
    text = colorOrOpts;
  } else {
    // 新调用：showNotif('完整消息', {color:'...'})
    bg = (colorOrOpts&&colorOrOpts.color) || COLORS.info;
    text = msg;
  }
  el.style.background = bg;
  el.textContent = text;
  el.style.display = 'block';
  el.style.opacity = '1';
  el.style.transform = 'translateX(-50%) translateY(0)';
  el._timer = setTimeout(()=>{
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(-10px)';
    setTimeout(()=>{el.style.display='none';},300);
  }, 2800);
}

// 召唤结果通知
function notifSummon(lvl){
  // 稀有度定义（内联，不依赖 game.js）
  const rarDef = lvl<=2?{tag:'🐣 普通·',r:170,g:170,b:170}:lvl<=4?{tag:'🌟 稀有·',r:126,g:184,b:255}:lvl<=7?{tag:'⭐ 珍稀·',r:66,g:165,b:245}:lvl<=10?{tag:'💜 传说·',r:156,g:39,b:176}:lvl<=13?{tag:'🔥 史诗·',r:255,g:152,b:0}:{tag:'🌈 神话·',r:255,g:215,b:0};
  const name=LNAME[lvl]||'灵兽';
  const el=document.getElementById('notif');
  if(!el)return;
  clearTimeout(el._timer);
  el.style.background=`rgba(${rarDef.r},${rarDef.g},${rarDef.b},.92)`;
  el.textContent=rarDef.tag+' 获得 '+name+'！';
  el.style.display='block';
  el.style.opacity='1';
  el.style.transform='translateX(-50%) translateY(0)';
  el._timer=setTimeout(()=>{
    el.style.opacity='0';
    el.style.transform='translateX(-50%) translateY(-10px)';
    setTimeout(()=>{el.style.display='none';},300);
  },3200);
}

// 金币产出飘字（每秒随机位置冒出）
const _floatPool=[];
function spawnCoinFloat(amt){
  if(!G.created||amt<=0)return;
  const el=document.createElement('div');
  el.className='coin-float';
  el.textContent='+'+fmtNum(amt);
  // 随机落在屏幕下半部分偏左，避免遮挡召唤按钮
  const baseX=document.body.clientWidth*.35;
  const baseY=document.body.clientHeight*.65;
  const jx=(Math.random()-.5)*120;
  const jy=(Math.random()-.5)*50;
  el.style.left=(baseX+jx)+'px';
  el.style.top=(baseY+jy)+'px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1250);
}
function startCps(){
  stopCps();
  cpsTimer=setInterval(()=>{
    const cps=calcCps();
    if(cps>0){G.coins+=cps;updateHud();spawnCoinFloat(cps);if(Math.random()<.01)saveGame();}
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
let __bgmTimer=null,__bgmIdx=0,__bgmZ=-1;

// 乐器音色：主音色+副音色组合，模仿真实乐器
// sub: 副旋律相对主音的音程（0=无, 12=八度, 7=五度, 5=四度）
// harm: 和声叠音（上方三度/六度等）
const __INSTRUMENTS=[
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
  stopBgm();__bgmZ=z;
  const track=ZODIAC_BGM[z]||ZODIAC_BGM[4];
  const inst=__INSTRUMENTS[track.inst]||__INSTRUMENTS[0];
  _bgmIdx=0;
  function tick(){
    if(!_audioCtx||_audioState.muted){stopBgm();return;}
    if(__bgmZ!==z)return;
    const V=_audioState.bgmVolume;
    const f=track.notes[__bgmIdx%track.notes.length];
    const dur=(60/track.bpm)*(1+(Math.random()-.5)*.12); // BPM+时值随机微扰12%
    // 主音
    playNote(f,dur,V*.4,inst.main);
    // 副音（叠音）
    if(inst.sub>0)playNote(f*Math.pow(2,inst.sub/12),dur,V*.18,'sine');
    // 和声
    if(inst.harm)playNote(f*Math.pow(2,4/12),dur*.7,V*.12,'sine');
    __bgmIdx++;
    __bgmTimer=setTimeout(tick,dur*860);
  }
  initAudio();
  tick();
}

function stopBgm(){
  if(__bgmTimer){clearTimeout(__bgmTimer);__bgmTimer=null;}
  __bgmIdx=0;__bgmZ=-1;
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
  // 主页点击缩略图 → 进入网格（不改影响灵兽点击事件）
  hero.addEventListener('click', e => {
    const t = e.target;
    // 点击缩略图图标区，进入网格
    if(t.classList.contains('ht') || (t.parentElement && t.parentElement.classList.contains('ht'))) {
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
  if(!heroIcon) return; // game page 还没显示，等下次调用
  // 确保有灵兽（防止首次启动 dragons 为空）
  if(!G.dragons || G.dragons.length === 0){
    G.dragons = [{id:String(nextId++),level:1,idx:12},{id:String(nextId++),level:1,idx:13}];
    saveGame();
    renderGrid();
    updateHud();
    if(heroThumbs){
      heroThumbs.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;color:rgba(255,215,0,.4);padding:4px 12px;letter-spacing:1px;">
          <span style="font-size:22px;margin-bottom:2px;">✨</span>
          <span>首次召唤获得灵兽</span>
          <span style="font-size:9px;opacity:.6;">点击下方召唤按钮</span>
        </div>`;
    }
    return; // 刚初始化，召唤后 updateHeroSection 会再被调用
  }
  const best = G.dragons.reduce((a,b) => (a.level||0) >= (b.level||0) ? a : b);
  const icon = LICON[best.level] || '🐣';
  const cps = COIN_S[best.level] || 0;
  heroIcon.textContent = icon;
  heroIcon.style.fontSize = 'min(130px,30vw)';
  // 点击切换动作
  heroIcon.onclick = e => { e.stopPropagation(); cycleHeroAnim(); };
  heroIcon.style.cursor = 'pointer';
  // 应用专属动作：根据灵兽等级选动画 class
  const animClass = 'anim-L' + (best.level || 1);
  heroIcon.className = animClass;
  // 动作名称（按等级显示）
  const animNames = ['啾啾雀跃','啾啾雀跃','啾啾雀跃','振翅欲飞','振翅欲飞','振翅欲飞','翩翩起舞','盘龙腾云','盘龙腾云','盘龙腾云','灵蛇灵马','灵蛇灵马','帝王神威','帝王神威','天命永恒'];
  const animHints = ['啾啾雀跃','振翅欲飞','翩翩起舞','盘龙腾云','灵蛇灵马','帝王神威','天命永恒'];
  let hint = document.getElementById('heroAnimHint');
  if(!hint){
    hint = document.createElement('div');
    hint.id = 'heroAnimHint';
    hint.className = 'hero-anim-hint';
    heroIcon.parentElement.appendChild(hint);
  }
  hint.textContent = animHints[G.heroAnimIdx || 0] || '';
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
      <div class="ht" onclick="showDragonDetail(${bestLvl})" style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:6px 8px;font-size:28px;line-height:1;" onmouseover="this.style.background='rgba(255,215,0,.08)'" onmouseout="this.style.background='transparent'" title="点击查看灵兽详情">
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

// 预初始化音频上下文（选属相页就建好，召唤时不卡顿）
try{ initAudio(); }catch(e){}
