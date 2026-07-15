function cycleHeroAnim(){
  const best = G.dragons.reduce((a,b)=>(a.level||0)>=(b.level||0)?a:b);
  if(best.id) showDragonDetail(best.id);
}
var LNAME = ['','灵蛋','幼灵','化形','灵通','化星','凝神','通灵','灵兽','神兽','天兽','圣兽','天命','天尊','天帝','鸿蒙'];
var LICON = ['','🐣','🐥','🐤','🦅','🐦','🕊','🦋','🐉','🌟','⚡','💫','🌙','🌈','☀️'];

// ═══════════════════════════════════════════════════
// 12生肖灵兽图标（差异化：每个生肖有独特的灵兽形态）
// ═══════════════════════════════════════════════════
var ZOD_ICON = [
  // 0鼠 灵巧小体型、尖耳、灵活
  ['','🐣','🐤','🐥','🐁','🐀','🐭','🐜','🦡','🦔','🐿','🐹','🐦','🐤','🐥','🐁'],
  // 1牛 厚重、牛角、力量感
  ['','🐣','🐤','🐥','🐮','🐂','🦬','🐃','🐄','🦏','🦛','🐂','🐮','🐤','🐥','🐮'],
  // 2虎 虎纹、鬃毛、凶猛
  ['','🐣','🐤','🐥','🐯','🐅','🐆','🦊','🐺','🐶','🐕','🐅','🐯','🐤','🐥','🐅'],
  // 3兔 长耳、轻盈、柔和
  ['','🐣','🐤','🐥','🐰','🐇','🦔','🐾','🐁','🐹','🐿','🐇','🐰','🐤','🐥','🐰'],
  // 4龙 龙角、鳞片、灵气
  ['','🐣','🐤','🐥','🐲','🐉','🌟','⚡','💫','✨','🌈','🐉','🐲','🐤','🐥','🐉'],
  // 5蛇 蛇眼、鳞纹、缠绕
  ['','🐣','🐤','🐥','🐍','🐉','🦎','🦔','🐾','🐁','🐀','🐍','🐍','🐤','🐥','🐍'],
  // 6马 马首、鬃毛、奔跑
  ['','🐣','🐤','🐥','🐴','🐎','🦄','🦓','🐎','🦄','🦌','🐴','🐎','🐤','🐥','🐴'],
  // 7羊 羊角、绒毛、温和
  ['','🐣','🐤','🐥','🐑','🐏','🦙','🐐','🐑','🐏','🦙','🐑','🐏','🐤','🐥','🐑'],
  // 8猴 猿耳、机灵、动作灵活
  ['','🐣','🐤','🐥','🐒','🙈','🙉','🙊','🐒','🙈','🙉','🐒','🐒','🐤','🐥','🐒'],
  // 9鸡 鸡冠、羽翅、明亮
  ['','🐣','🐤','🐥','🐔','🐓','🦃','🦚','🐔','🐓','🦚','🐔','🐓','🐤','🐥','🐔'],
  // 10狗 犬耳、忠诚、敏捷
  ['','🐣','🐤','🐥','🐶','🐕','🦮','🐕‍🦺','🐶','🐕','🦮','🐶','🐕','🐤','🐥','🐶'],
  // 11猪 圆润、猪鼻、可爱
  ['','🐣','🐤','🐥','🐷','🐖','🦡','🐾','🐷','🐖','🦡','🐷','🐖','🐤','🐥','🐷']
];

// 等级成长阶段（对应 CSS class）
var LV_STAGE_NAMES = ['','幼生','成长','成形','通灵','神化'];
function getLevelStage(lvl){if(lvl<=3)return 1;if(lvl<=6)return 2;if(lvl<=9)return 3;if(lvl<=12)return 4;return 5;}
function getLevelStageName(lvl){return LV_STAGE_NAMES[getLevelStage(lvl)]||'幼生';}

// ═══════════════════════════════════════════════════
// DRAGON_SKINS 完整配置见 DRAGON_SKINS 定义段（下方）
// getDragonVisual 函数也定义在 DRAGON_SKINS 配置段下方
var COIN_S = [0,1,2,3,4,8,9,10,11,12,16,17,18,20,24,30];
var UPGRADE_COST = [0,200,500,1000,2000,4000,8000,16000,30000,50000,80000,120000,180000,260000,380000];
function getUpgradeCost(lvl){return UPGRADE_COST[lvl]||0;}
var FATE_E = ['🪵','🔥','🟤','⚪','💧'];
var FATE_C = [1,1.5,1,1,1];
var FATE_Q = [1,1,1,1,1.5];
var FATE_N = ['木','火','土','金','水'];
var ZOD_E  = ['🐀','🐂','🐅','🐇','🐉','🐍','🐎','🐏','🐒','🐓','🐕','🐖'];
var ZOD_UNLOCK_COST = 10000;
var ZOD_LORE = [
  '鼠：十二生肖之首，机敏多智，夜行不怠。《说文》称"鼠，穴虫之总名"。',
  '牛：勤劳忠实，脚踏实地。农耕之本，春耕秋收，无怨无悔。',
  '虎：百兽之王，威震山林。《说文》记"虎，山兽之君"，镇宅辟邪。',
  '兔：月宫仙灵，温顺灵巧。"玉兔捣药"典故，月光之使。',
  '龙：华夏图腾，权贵祥瑞。"龙者鳞虫之长"，呼风唤雨，中华象征。',
  '蛇：小龙，灵性非凡。"长蛰深穴，含灵待时"，智慧与神秘之象。',
  '马：刚健骏逸，驰骋千里。"马者，兵甲之大马"，立下汗马功劳。',
  '羊：温顺和善，合群之德。"羊，祥也"，古以羊为吉祥之兆。',
  '猴：聪明伶俐，灵活善变。"猴，侯也"，古时封侯拜相之兆。',
  '鸡：知时守信，勇敢好斗。"鸡，知时兽也"，日出而鸣。',
  '狗：忠诚守护，义犬救主。"狗，叩也"，叩头摇尾，忠于主人。',
  '猪：厚福安详，随遇而安。"猪者，诸也"，诸事顺遂，圆满之象。'
];
var ZOD_N  = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
var YUN_NAMES  = ['极凶','小凶','平','小吉','大吉'];
var YUN_COIN   = [-.5,-.2,0,.3,.5];
var RANKS_HUD=[{icon:'🔰',title:'初窥',min:3,color:'#555'},{icon:'🥉',title:'小成',min:6,color:'#795548'},{icon:'🥈',title:'大成',min:10,color:'#555'},{icon:'🏆',title:'天师',min:14,color:'#c8860a'}];


let _audioCtx = null;
let _audioState = { muted: false, volume: 0.7, bgmVolume: 0.35, sfxVolume: 0.8, bgmLast: 0.35, sfxLast: 0.8 };


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
function showDragonDetail(dragonId, previewZodiac){
  const dragon = G.dragons.find(d => d.id === String(dragonId));
  const names = ['啾啾雀跃','啾啾雀跃','啾啾雀跃','振翅欲飞','振翅欲飞','振翅欲飞','翩翩起舞','盘龙腾云','盘龙腾云','盘龙腾云','灵蛇灵马','灵蛇灵马','帝王神威','帝王神威','天命永恒'];
  const rarities = ['普通','普通','普通','稀有','稀有','稀有','珍稀','珍稀','珍稀','传说','传说','史诗','史诗','神话','神话'];
  const skills = {普通:'被动：每分钟自动产出少量金币',稀有:'被动：金币产出+50%，有几率触发双倍收益',珍稀:'被动：召唤所需龙气-10%，产出+100%',传说:'被动：每5分钟免费召唤一次（需空格）',史诗:'被动：合并成功率+20%，金币产出翻2倍',神话:'被动：全属性+300%，每级召唤必得珍稀以上'};
  const r = rarities[dragon ? (dragon.level||1)-1 : parseInt(dragonId)-1]||'普通';
  const cps = COIN_S[dragon ? dragon.level||1 : parseInt(dragonId)]||0;
  const desc = skills[r];
  const nameStr = names[dragon ? (dragon.level||1)-1 : parseInt(dragonId)-1]||'灵兽';

  // 预览模式（无真实灵兽）：构造虚拟 v 对象用于SVG渲染
  if(!dragon){
    const lvl = parseInt(dragonId);
    if(lvl < 1 || lvl > 15) return;
    const skinId = G.equippedSkin || 'default';
    const skin = DRAGON_SKINS.find(s=>s.id===skinId)||DRAGON_SKINS[0];
    const stage = getLevelStage(lvl);
    const svgPath = 'docs/svgs/drag_' + (previewZodiac || 0) + '_' + lvl + '.svg'; // 预览用指定生肖
    const v = {
      svgPath, emoji: '🐣',
      filter: skin.filter, baseColor: skin.color, glowColor: skin.glow,
      border: skin.border, shadow: skin.shadow,
      bgAlpha: 0.12, iconSize: 60,
      stage, stageName: LV_STAGE_NAMES[stage]||'幼生',
      skinId, skinName: skin.name, skinRarity: skin.visualRarity,
      description: '灵兽预览',
      skinOverlay: skinId!=='default' ? '皮肤特效：'+skin.name : '',
    };
    showDetailModal({level:lvl, v, cps, r, nameStr, desc, dragon:null, previewZodiac});
    return;
  }

  const lvl = dragon.level||1;
  const v = getDragonVisual(dragon);
  showDetailModal({level:lvl, v, cps, r, nameStr, desc, dragon});
}


function showDetailModal({level, v, cps, r, nameStr, desc, dragon, previewZodiac}){
  // previewZodiac 用于显示预览模式时的生肖说明（无dragon时）
  if(!v){v={svgPath:'docs/svgs/drag_0_1.svg',emoji:'🐣',iconSize:60,stage:1,stageName:'幼生',glowColor:'#aaa',filter:'',border:'#aaa',shadow:'rgba(180,140,80,.25)',baseColor:'#8b6914',skinName:'默认原皮',skinRarity:0};}
  // 判断是最高级灵兽还是普通预览
  const best = G.dragons.reduce((a,b)=>(a.level||0)>=(b.level||0)?a:b);
  const isBest = dragon && dragon.id === best.id;
  const ZNAMES = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  const zName = !dragon && previewZodiac !== undefined ? ZNAMES[previewZodiac] + '·' : '';
  const header = isBest ? '当前最强灵兽' : (dragon ? '灵兽详情' : zName + 'Lv.' + level + ' · ' + (LNAME[level]||'灵兽'));
  const tag = isBest ? '<span style="background:#ffd700;color:#1a0a00;font-size:9px;font-weight:800;padding:2px 8px;border-radius:10px;letter-spacing:2px;display:inline-block;margin-bottom:8px;">★ 当前最强</span>' : '';
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(6px);';
  // 星级处理
  const star=(dragon&&dragon.star)||1;
  const smult=star>1?starMult(star):null;
  const starsHtml=star>=1?'<div style="font-size:16px;color:#c8860a;letter-spacing:2px;margin-bottom:6px;">'+'⭐'.repeat(Math.min(star,5))+'</div>':'';
  const upgradeBtn=(dragon&&canUpgradeStar(dragon))?
    `<button onclick="event.stopPropagation();upgradeStar('${dragon.id}')" class="star-up-btn">⬆ 升星（需 ${starUpgradeCost(star)} 金币）</button>`:
    (dragon&&star<5?'<div style="font-size:10px;color:#555;margin-top:4px;">满级后可升星 ⭐</div>':'');
  const finalCps=Math.floor(cps*(smult||1));
  // ═══ 皮肤+生肖+等级 叠加视觉 ═══
  const skinBorderColor = v.border;
  const skinBgAlpha = Math.min(v.bgAlpha * 2, 0.3);
  const bgR = parseInt(v.baseColor.slice(1,3),16);
  const bgG = parseInt(v.baseColor.slice(3,5),16);
  const bgB = parseInt(v.baseColor.slice(5,7),16);
  const bgHex = `rgba(${bgR},${bgG},${bgB},${skinBgAlpha})`;
  const glowBlur = 8 + v.stage * 6 + v.skinRarity * 2;
  const iconFontSize = 48 + v.stage * 4 + v.skinRarity * 2;
  el.innerHTML = `<div style="background:${bgHex};border:1.5px solid ${skinBorderColor};border-radius:28px;padding:36px 32px;width:min(360px,90vw);text-align:center;animation:popIn .35s cubic-bezier(.34,1.56,.64,1);box-shadow:0 8px 40px ${v.shadow},0 0 ${glowBlur}px ${v.shadow};">
    ${tag}
    <div style="font-size:10px;letter-spacing:4px;color:${v.baseColor};opacity:.8;margin-bottom:4px;">${header}</div>
    <!-- 灵兽大图：生肖+等级+皮肤 三叠加 SVG渲染 -->
    <div style="position:relative;display:inline-block;margin:12px 0;">
      <div style="filter:drop-shadow(0 0 ${8+v.stage*3}px ${v.glowColor});">${_dragonIconHtml(v, iconFontSize)}</div>
      ${v.stage >= 4 ? '<div style="position:absolute;top:-4px;right:-4px;font-size:12px;animation:pulse 2s infinite;">✨</div>' : ''}
      ${v.stage >= 5 ? '<div style="position:absolute;bottom:-2px;left:-6px;font-size:10px;animation:pulse 2.5s infinite .5s;">⚡</div>' : ''}
    </div>
    ${starsHtml}
    <!-- 名称 + 品阶 -->
    <div style="font-size:20px;font-weight:900;color:#1A1A1A;margin-bottom:2px;">${LNAME[level]||'灵兽'}</div>
    <div style="font-size:11px;color:${v.baseColor};letter-spacing:2px;margin-bottom:4px;">
      ${v.stageName} · ${r}阶${smult?' ×'+smult+'产金':''}
    </div>
    <!-- 当前装备皮肤 -->
    ${v.skinId !== 'default' ? `<div style="font-size:10px;color:${v.border};letter-spacing:1px;margin-bottom:6px;padding:2px 8px;border:1px solid ${v.border};border-radius:10px;display:inline-block;">🎨 ${v.skinName}</div>` : ''}
    <!-- 金币产出 -->
    <div style="font-size:36px;font-weight:900;color:${v.baseColor};margin:8px 0;">+${finalCps}/s</div>
    <div style="font-size:11px;color:#555;margin-bottom:14px;">每秒产出 <strong style="color:#8b6010;">${finalCps}</strong> 金币${smult?'（⭐×'+smult+'）':''}</div>
    <!-- 描述卡 -->
    <div style="background:rgba(255,255,255,.92);border-radius:16px;padding:14px;margin-bottom:14px;text-align:left;font-size:12px;color:#333;line-height:1.9;">
      <div style="color:${v.baseColor};font-weight:700;margin-bottom:6px;font-size:13px;">⚡ ${nameStr}</div>
      <div>${desc}</div>
    </div>
    <!-- 三属性卡 -->
    <div style="display:flex;gap:6px;justify-content:center;margin-bottom:8px;">
      <div style="flex:1;background:rgba(255,255,255,.92);border:1px solid rgba(180,140,80,.2);border-radius:10px;padding:8px 4px;text-align:center;">
        <div style="font-size:16px;color:${v.baseColor};font-weight:700;">${isBest ? G.dragons.length : (dragon ? 1 : '?')}</div>
        <div style="font-size:9px;color:#555;letter-spacing:1px;">${isBest ? '灵兽' : '等级'}</div>
      </div>
      <div style="flex:1;background:rgba(255,255,255,.92);border:1px solid rgba(180,140,80,.2);border-radius:10px;padding:8px 4px;text-align:center;">
        <div style="font-size:16px;color:${v.baseColor};font-weight:700;">Lv.${level}</div>
        <div style="font-size:9px;color:#555;letter-spacing:1px;">等级</div>
      </div>
      <div style="flex:1;background:rgba(255,255,255,.92);border:1px solid rgba(180,140,80,.2);border-radius:10px;padding:8px 4px;text-align:center;">
        <div style="font-size:14px;color:${v.baseColor};font-weight:700;">${r}</div>
        <div style="font-size:9px;color:#555;letter-spacing:1px;">品阶</div>
      </div>
    </div>
    <!-- 装备/套装 -->
    ${(()=>{var eq=getEquipTotals?getEquipTotals():{atk:0,def:0,spd:0};var sl=getSuitLevel?getSuitLevel(G.forge.items):0;var se=sl>0&&getSuitEffect?getSuitEffect(G.forge.items):null;var total=eq.atk+eq.def+eq.spd;if(total===0&&!se)return'';var sh='<div style="display:flex;gap:6px;justify-content:center;margin-bottom:6px;">'+(eq.atk?'<div style="flex:1;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:10px;padding:7px 4px;text-align:center;"><div style="font-size:14px;color:#c62828;font-weight:700;">+'+eq.atk+'</div><div style="font-size:9px;color:#555;">⚔️攻</div></div>':'')+(eq.def?'<div style="flex:1;background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.2);border-radius:10px;padding:7px 4px;text-align:center;"><div style="font-size:14px;color:#1565c0;font-weight:700;">+'+eq.def+'</div><div style="font-size:9px;color:#555;">🛡️防</div></div>':'')+(eq.spd?'<div style="flex:1;background:rgba(134,239,172,.08);border:1px solid rgba(134,239,172,.2);border-radius:10px;padding:7px 4px;text-align:center;"><div style="font-size:14px;color:#2e7d32;font-weight:700;">+'+eq.spd+'</div><div style="font-size:9px;color:#555;">💨速</div></div>':'')+'</div>';var shtml=se?'<div style="background:linear-gradient(135deg,rgba(255,140,0,.1),rgba(255,51,51,.1));border:1px solid rgba(255,140,0,.3);border-radius:10px;padding:5px 8px;margin-bottom:6px;text-align:center;font-size:10px;font-weight:700;color:#c62828;letter-spacing:1px;">⛩️ '+se.name+' · '+se.desc+'</div>':'<div style="font-size:10px;color:#555;padding:2px 0 6px;text-align:center;">'+(sl>0?'已装备 '+sl+' 件':'无装备')+'</div>';return sh+shtml;})()}
    ${upgradeBtn}
    <div style="font-size:10px;color:#aaa;margin-top:10px;">点击任意处关闭</div>
  </div>`;
  el.onclick = e => { if(e.target===el) el.remove(); };
  document.body.appendChild(el);
}

// 点击下一级缩略图 → 弹出升级预览弹窗
function previewNextLevel(lvl, cps, icon){
  const rarity = lvl<=2?'普通':lvl<=4?'稀有':lvl<=7?'珍稀':lvl<=10?'传说':lvl<=13?'史诗':'神话';
  const rarColors = {'普通':'#555','稀有':'#1565c0','珍稀':'#1976d2','传说':'#6a1b9a','史诗':'#e65100','神话':'#c8860a'};
  const diff = cps - (COIN_S[G.dragons.reduce((a,b)=>(a.level||0)>=(b.level||0)?a:b).level]||0);
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:999;backdrop-filter:blur(4px);';
  el.innerHTML = `<div style="background:linear-gradient(160deg,#0d0d2a,#1a1a3a);border:1px solid ${rarColors[rarity]};border-radius:24px;padding:32px 28px;width:min(320px,88vw);text-align:center;animation:popIn .3s ease;">
    <div style="font-size:11px;letter-spacing:4px;color:${rarColors[rarity]};margin-bottom:12px;">${rarity.toUpperCase()}</div>
    <div style="font-size:72px;margin:12px 0;filter:drop-shadow(0 0 24px ${rarColors[rarity]}55);">${icon}</div>
    <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:4px;">Lv.${lvl} · ${LNAME[lvl]||'灵兽'}</div>
    <div style="font-size:28px;font-weight:900;color:${rarColors[rarity]};margin:10px 0;">+${cps}/s</div>
    <div style="font-size:13px;color:#555;margin:8px 0 20px;">比当前等级多 <span style="color:#c8860a;font-weight:700;">+${diff}/s</span></div>
    <div style="background:rgba(255,255,255,.04);border-radius:14px;padding:14px;margin-bottom:20px;text-align:left;font-size:12px;color:#666;line-height:1.8;">
      <div>🎯 两张同等级灵兽可合成升级</div>
      <div>⚡ 合成成功率：${getCultBonus ? (100+getCultBonus().mergeBonus*100).toFixed(0)+'%' : '100%'}</div>
      <div>💰 升级后金币产出大幅提升</div>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:16px;">点击任意处关闭</div>
  </div>`;
  // 点击任意处或按任意键关闭，关闭后退出网格模式返回主页面
  el.onclick = e => { el.remove(); };
  el.addEventListener('keydown', ()=>{ el.remove(); }, {once:true});
  document.body.appendChild(el);
}
var G = {zodiac:-1,fate:-1,created:false,coins:10000,qi:0,dragons:[],mergeCount:0,summonCount:0,currentFate:3,freeLeft:3,lastFreeDate:null,cultivation:{mu:0,huo:0,tu:0,kin:0,shui:0},lastQiTime:Date.now(),signDate:null,signStreak:0,tasks:null,lastTaskDate:null,combo:0,lastMergeTime:0,totalCoins:0,guideDone:false,lastOnline:null,skills:null,items:null,_activeEffects:{},_lastMergeState:null,signHistory:{},backendUrl:null,lastSubmitDate:null,lastSubmitTs:0,maxCombo:0,weekly:null,forge:{items:[],materials:{iron:0,crystal:0,dragonScale:0,starDust:0},totalCrafts:0,suits:0},summonBatch:1,_isTenMode:false};

// 每日任务配置（5个任务，所有目标随时间自然推进）
var TASKS = [
  {id:'summon10',  icon:'🐣', title:'灵兽召唤',  desc:'累计召唤10次', target:10,  reward:{coin:1000,qi:20,free:0},  type:'static'},
  {id:'summon30',  icon:'🐥', title:'召唤达人',  desc:'累计召唤30次', target:30,  reward:{coin:3000,qi:60,free:1},  type:'static'},
  {id:'merge10',   icon:'⚡', title:'合成进阶',  desc:'累计合成10次', target:10,  reward:{coin:2000,qi:40,free:0},  type:'static'},
  {id:'merge30',   icon:'🌟', title:'合成大师',  desc:'累计合成30次', target:30,  reward:{coin:8000,qi:120,free:2}, type:'static'},
  {id:'spendQi',  icon:'⚗️', title:'命格修炼',   desc:'消耗龙气修炼节点', target:1,   reward:{coin:800, qi:0, free:0},  type:'spend_qi'},
  {id:'login',     icon:'🎮', title:'每日登录',  desc:'登录游戏即可', target:1,   reward:{coin:500, qi:10, free:0},  type:'login'},
];

// 7天签到配置
var SIGN_REWARDS = [
  {coin:500,  qi:10,  free:0, label:'第1天'},
  {coin:1000, qi:20,  free:0, label:'第2天'},
  {coin:2000, qi:30,  free:0, label:'第3天'},
  {coin:5000, qi:50,  free:1, label:'第4天'},
  {coin:8000, qi:80,  free:1, label:'第5天'},
  {coin:15000, qi:150, free:1, label:'第6天'},
  {coin:30000, qi:300, free:2, label:'第7天'},
];

// ===== 限时活动 =====
// 支持多活动叠加，active() 返回是否触发
var ACTIVITIES = [
  {
    id:'weekend2x',
    icon:'🎁',
    name:'周末双倍召唤',
    desc:'周六/周日召唤产出翻倍',
    color:'#e65100',
    active:()=>{const d=new Date();return d.getDay()===0||d.getDay()===6;},
    summonBonus:1,  // 召唤产出的额外倍率加成
    coinBonus:0,
    tip:'召唤产出 ×2！',
  },
  {
    id:'night1_5x',
    icon:'🌙',
    name:'晚间金币时段',
    desc:'20:00-22:00 金币产出 ×1.5',
    color:'#7c4dff',
    active:()=>{const h=new Date().getHours();return h>=20||h<2;},
    summonBonus:0,
    coinBonus:.5,
    tip:'金币 ×1.5！',
  },
];
function getActiveActivities(){
  return ACTIVITIES.filter(a=>a.active());
}
function getActivityBonus(){return getActiveActivities();}
function calcSummonBonus(){return 1+(getActiveActivities().reduce((s,a)=>s+a.summonBonus,0));}
function calcCoinBonus(){return 1+(getActiveActivities().reduce((s,a)=>s+a.coinBonus,0));}
function fmtActivityCountdown(){const a=getActiveActivities()[0];if(!a)return'';if(a.id==='night1_5x'){const m=new Date();const end=new Date(m);end.setHours(22,0,0,0);if(m.getHours()>=20)return'剩余 '+(Math.max(0,Math.round((end-m)/60000)))+'min';}return'进行中';}
var SAVE_KEY = 'sxgame_v2';
let nextId = 1;
let cpsTimer = null, qiTimer = null, bgmTimer = null;

function saveGame(){
  G.lastOnline=Date.now();
  localStorage.setItem(SAVE_KEY || 'sxgame_v2', JSON.stringify(G));
}
function loadGame(){
  const s = localStorage.getItem(SAVE_KEY || 'sxgame_v2');
  if(s){try{Object.assign(G,JSON.parse(s));}catch(e){}}
  if(G.dragons.length) nextId = Math.max(...G.dragons.map(d=>parseInt(d.id)))+1;
  // 兼容旧存档：没有 unlockedAtlas 则自动解锁自己属相
  if(!G.unlockedAtlas) G.unlockedAtlas = [G.zodiac].filter(z => z >= 0);
  // 兼容旧存档：没有 lastFreeDate 则设为今天（防止每日重置失效）
  if(!G.lastFreeDate) G.lastFreeDate = today();
  if(!G.lastOnline) G.lastOnline = Date.now();
  // 离线收益（最多补算8小时）
  if(G.created && G.lastOnline){
    const elapsed=Math.min((Date.now()-G.lastOnline)/1000, 8*3600);
    const cps=calcCps();
    if(cps>0 && elapsed>60){
      const offlineCoins=Math.floor(cps*elapsed*0.5); // 离线只有50%效率
      if(offlineCoins>0){
        G.coins+=offlineCoins;
        G.totalCoins=(G.totalCoins||0)+offlineCoins;
        setTimeout(()=>{
          showOfflinePopup(offlineCoins, elapsed);
        },800);
      }
    }
  }
}
function fmtNum(n){
  if(n>=1e9)return(n/1e9).toFixed(1)+'B';
  if(n>=1e6)return(n/1e6).toFixed(1)+'M';
  if(n>=1e3)return(n/1e3).toFixed(1)+'K';
  return Math.floor(n)+'';
}
// 星级倍率表（1星=1×, 2星=1.5×, 3星=2×, 4星=3×, 5星=5×）
function starMult(star){const t=[0,1,1.5,2,3,5];return t[Math.min(star||1,5)]||1;}

function calcCps(){
  if(!G.created)return 0;
  const fc=FATE_C[G.fate]||1;
  const yc=1+(YUN_COIN[G.currentFate]||0);
  // 星级倍率 × 基础产金
  let base=G.dragons.reduce((s,d)=>s+(COIN_S[d.level]||0)*(d.star?starMult(d.star):1),0);
  const cultBonus=(getCultBonus().coinBonus||0);
  const actBonus=(calcCoinBonus()-1);  // 活动加成
  const comboBonus=(G.combo>=5?1:G.combo>=2?.5:0);  // combo加成（返回的是总倍率，-1得到增量）
  return Math.floor(base*fc*yc*1.3*(1+cultBonus+actBonus+comboBonus));
}
function updateHud(){
  if(!G.created)return;
  document.getElementById('hudCoins').textContent=fmtNum(G.coins);
  document.getElementById('hudCps').textContent=fmtNum(calcCps())+'/s';
  document.getElementById('hudQi').textContent=fmtNum(G.qi);
  // 段位HUD
  const cnt=new Set(G.dragons.map(d=>d.level)).size;
  let rank=RANKS_HUD[0];
  RANKS_HUD.forEach(r=>{if(cnt>=r.min)rank=r;});
  const rh=document.getElementById('hudRank');
  if(rh){rh.textContent=rank.icon;rh.title=rank.title;rh.style.display='inline';}
  // 运势星级
  const star=document.getElementById('hudYunStar');
  if(star){star.style.display='inline';star.textContent='★'.repeat(G.currentFate||1);}
  // combo 显示 + feat[8] 连击条同步
  const ch=document.getElementById('hudCombo');
  if(ch){
    ch.style.display=G.combo>=2?'inline':'none';
    ch.textContent='x'+G.combo+' COMBO';
  }
  updateComboBar(false); // 同步 combo 条（active=false，只更新不退条）
  const batch=G.summonBatch||1;
  const coinCost=Math.floor(100*Math.pow(1.2,Math.floor(G.summonCount/10)))*batch;
  const qiCost=Math.floor(500*Math.pow(1.1,Math.floor(G.summonCount/15)))*batch;
  var costEl=document.getElementById('coinCost');
  if(costEl){costEl.textContent=coinCost;}
  var btnCoin=document.getElementById('btnCoin');
  if(btnCoin) btnCoin.disabled=G.coins<coinCost;
  document.getElementById('btnQi').disabled=G.qi<qiCost;
  const qcEl=document.getElementById('qiCost');if(qcEl)qcEl.textContent=qiCost;
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
    // 立即计算一次倒计时
    const _calcLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate()+1); tomorrow.setHours(0,0,0,0);
      const ms = tomorrow - now;
      const h = String(Math.floor(ms/3600000)).padStart(2,'0');
      const m = String(Math.floor((ms%3600000)/60000)).padStart(2,'0');
      return h+':'+m+'后重置';
    };
    if(countEl) countEl.textContent = _calcLeft();
    // 每分钟更新
    _freeTimer = setInterval(()=>{
      if(countEl) countEl.textContent = _calcLeft();
    }, 60000);
  }
}
var COLS=5, TOTAL=25;
var RAR_COLORS = {0:'#1a1a1a',1:'#0a1a2a',2:'#1a0a2a',3:'#2a1a00',4:'#2a0a00'}; // 0普通~4神话（暗色背景）
var RAR_BORDER = {0:'rgba(255,255,255,.06)',1:'rgba(126,184,255,.3)',2:'rgba(181,126,220,.3)',3:'rgba(255,215,0,.4)',4:'rgba(255,107,53,.5)'};
function rarIdx(lvl){if(lvl<=2)return 0;if(lvl<=4)return 1;if(lvl<=7)return 2;if(lvl<=10)return 3;return 4;}
function renderGrid(){
  // 实时过滤，仅保留当前本命生肖灵兽
  G.dragons=G.dragons.filter(item=>item.z===G.zodiac);
  saveGame();
  const grid=document.getElementById('dragonGridInner');
  if(!grid)return;
  grid.innerHTML='';
  for(let i=0;i<TOTAL;i++){
    const cell=document.createElement('div');
    cell.className='d-cell';
    cell.style.aspectRatio='1';
    cell.style.borderRadius='12px';
    cell.style.border='1.5px solid rgba(180,140,80,.25)';
    cell.style.background='rgba(255,255,255,.92)';
    cell.style.padding='3px';
    cell.style.cursor='pointer';
    cell.dataset.idx=i;
    const d=G.dragons.find(d=>d.idx===i);
    if(d){
      const v = getDragonVisual(d);
      const card=document.createElement('div');
      card.className='d-card ds-stage-' + v.stage;
      card.dataset.id=d.id;
      // 背景：生肖底色 + 透明度叠加皮肤底色
      const bgR=parseInt(v.baseColor.slice(1,3),16);
      const bgG=parseInt(v.baseColor.slice(3,5),16);
      const bgB=parseInt(v.baseColor.slice(5,7),16);
      card.style.background=`rgba(${bgR},${bgG},${bgB},${v.bgAlpha})`;
      card.style.border=`1px solid ${v.border}`;
      card.style.borderRadius='10px';
      const glowBlur = 4 + v.stage * 2;
      const glowSpread = v.skinRarity >= 3 ? (3 + v.stage * 1.5) : 0;
      card.style.boxShadow=`0 0 ${glowBlur}px ${glowSpread}px ${v.shadow},inset 0 1px 0 rgba(255,255,255,.4)`;
      // 渲染灵兽图标：SVG 或 emoji fallback
      // 卡片内图标统一用28px（格子内自适应）
      const iconContainer=document.createElement('div');
      iconContainer.style.cssText='display:flex;align-items:center;justify-content:center;width:100%;flex:1;min-height:0;';
      iconContainer.innerHTML=_dragonIconHtml(v, 36);
      const lvLabel=document.createElement('span');
      lvLabel.className='d-lv';
      lvLabel.style.cssText=`display:block;text-align:center;font-size:9px;color:${v.baseColor};font-weight:700;margin-top:2px;line-height:1.2;`;
      lvLabel.textContent='Lv'+d.level;
      // 皮肤徽章
      const skinBadge=document.createElement('span');
      skinBadge.className='d-skin-badge';
      skinBadge.style.cssText=`display:${v.skinId!=='default'?'block':'none'};position:absolute;top:2px;right:2px;font-size:7px;padding:1px 3px;border-radius:4px;background:${v.border};color:#fff;opacity:.85;line-height:1.2;`;
      skinBadge.textContent=v.skinId==='default'?'':v.skinId;
      card.style.position='relative';
      card.appendChild(iconContainer);
      card.appendChild(lvLabel);
      card.appendChild(skinBadge);
      setupDrag(card,d);
      card.onclick=e=>{e.stopPropagation();showDragonDetail(d.id);};
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
  const rarColors={普通:'#555',稀有:'#1565c0',珍稀:'#1976d2',传说:'#6a1b9a',史诗:'#e65100',神话:'#c8860a'};
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
      // 合成费用（按合成结果等级定价）
      var MC=[0,200,500,1000,2000,4000,8000,16000,30000,50000,80000,120000,180000,260000,380000];
      var mc=MC[s.level]||0;
      if(G.coins<mc){showNotif('warn','合成需 '+mc+'💰');return;}
      G.coins-=mc;
      // 合成成功率：结果等级越高越难 max(10%, 100%-(Lv-2)*7%)
      var rs=Math.max(10,100-(s.level+1-2)*7);
      if(Math.random()*100>rs){
        // 失败：两只灵兽消失，时光倒流恢复格子位置（但金币不退）
        G.dragons.forEach(function(d){if(d.idx===src)d.idx=src;if(d.idx===dst)d.idx=dst;});
        G.dragons=G.dragons.filter(d=>d.idx!==src&&d.idx!==dst);
        saveGame();renderGrid();updateHud();
        showNotif('error','合成失败！'+LNAME[s.level]+'×2 消失（成功率'+rs+'%）');
        if(typeof playSynthFail==='function')playSynthFail();
        return;
      }
      // 时光倒流备份
      G._dragonsBak=G.dragons.map(d=>({...d}));
      G.dragons=G.dragons.filter(d=>d.idx!==src&&d.idx!==dst);
      // 合成结果继承源灵兽生肖（两只生肖相同则不变，不同取较大的）
      var newZ=s.z!==undefined?s.z:(t.z!==undefined?t.z:0);
      G.dragons.push({id:String(nextId++),level:s.level+1,idx:dst,star:1,z:newZ});
      G.mergeCount++;
      _onWeeklyEvent("merge");
      // 命格修炼加成：土行额外金币、金行额外龙气
      try{
        const cult=getCultBonus();
        if(cult.coinBonus>0){
          const bonus=Math.floor((COIN_S[s.level+1]||10)*cult.coinBonus*.5);
          if(bonus>0){G.coins=Math.min(999999999,G.coins+bonus);G.totalCoins=(G.totalCoins||0)+bonus;updateHud();}
        }
        if(cult.qiRate>0&&Math.random()<.3){
          G.qi=Math.min(99999,G.qi+1);updateHud();
        }
      }catch(e){}
      const qiGain=Math.floor(Math.random()*2);
      if(qiGain>0){G.qi=Math.min(99999,G.qi+qiGain);updateHud();}
      showMergeFlash(LICON[s.level+1]);
      showNotif('success',`合成！${LNAME[s.level]} → ${LNAME[s.level+1]} (-${mc}💰)`);
      if(typeof playSynthSuccess==='function')playSynthSuccess();
      if(G.zodiac>=0&&G.zodiac<=11) playSound('merge_z'+G.zodiac);
      // combo 检测（2.5秒内连续合成）
      const now=Date.now();
      if(G.lastMergeTime&&now-G.lastMergeTime<2500){G.combo=Math.min((G.combo||0)+1,10);}else{G.combo=1;}
      G.maxCombo=Math.max(G.maxCombo||0,G.combo);G.lastMergeTime=now;saveGame();renderGrid();updateHud();try{updateHeroSection();}catch(e){}
      _onWeeklyEvent('combo');
      checkAch();
      if(G.combo>=2){
        // === feat[8] 连击特效 ===
        updateComboBar(true); // 激活 combo 条
        spawnComboParticles(s.level+1);
        showComboScore(s.level+1);
        const milestones=[3,5,7,10];
        if(milestones.includes(G.combo)){
          showComboMilestone(G.combo);
          shakeScreen();
        }
      }
    }else{s.idx=dst;t.idx=src;saveGame();renderGrid();}
  }else{s.idx=dst;saveGame();renderGrid();}
}
function markMergeable(){
  // 先清掉所有标记
  document.querySelectorAll('.d-cell').forEach(c=>{c.classList.remove('mergeable');c.style.borderColor='';c.style.boxShadow='';});
  // 直接用 G.dragons 数据驱动：遍历所有格子，通过 idx 匹配灵兽
  document.querySelectorAll('.d-cell').forEach(cell=>{
    const idx=parseInt(cell.dataset.idx);
    if(isNaN(idx))return;
    const d=G.dragons.find(dr=>dr.idx===idx);
    if(!d||d.level>=15)return;
    // 找同等级、同生肖（z属性）的另一只灵兽
    const same=G.dragons.find(dr=>dr!==d&&dr.level===d.level&&dr.idx!==idx);
    if(same){
      cell.classList.add('mergeable');
      cell.style.border='1.5px solid rgba(255,215,0,.5)';
      cell.style.boxShadow='0 0 14px rgba(255,215,0,.3)';
    }
  });
}
function getSummonLevel(pool){
  if(!pool||!Array.isArray(pool)||pool.length===0) pool=[{level:1,weight:100}];
  // 1) 天机召唤吉时加成（3次机会，提升高阶概率）
  let adjusted = pool.map(p=>{
    if((G._summonBoost||0)>0 && p.level>=3) return {level:p.level, weight:Math.floor(p.weight*2.5)};
    // 2) 属相加成：龙(4)/虎(2)/牛(1)高等级概率+30%；鼠(0)低等级概率+40%；兔(3)/蛇(4)适中+20%
    if(G.zodiac>=0){
      const z=G.zodiac;
      const zBonusHigh=[.4,.2,.3,0,0,.2,0,0,0,0,0,0][z]||0; // 高等级加成
      const zBonusLow=[0,0,0,.4,0,.2,0,0,0,0,0,0][z]||0;  // 低等级加成
      if(p.level>=3 && zBonusHigh>0) return {level:p.level, weight:Math.floor(p.weight*(1+zBonusHigh))};
      if(p.level<=2 && zBonusLow>0) return {level:p.level, weight:Math.floor(p.weight*(1+zBonusLow))};
    }
    return p;
  });
  // 3) 周末活动加成
  const weekend=ACTIVITIES.find(a=>a.id==='weekend2x'&&a.active());
  if(weekend) adjusted=adjusted.map(p=>({...p,weight:p.level>=2?p.weight*2:p.weight}));
  let total=adjusted.reduce((s,p)=>s+p.weight,0),r=Math.random()*total,acc=0;
  for(const p of adjusted){acc+=p.weight;if(r<=acc){
    if((G._summonBoost||0)>0) G._summonBoost--;
    return p.level;
  }}
  if((G._summonBoost||0)>0) G._summonBoost--;
  return pool[pool.length-1].level;
}


// ── 十连模式切换（toggle 按钮，无弹窗）────────────────────
function toggleTenMode(){
  G._isTenMode = !G._isTenMode;
  var btn = document.getElementById('batchBtn10');
  if(btn){
    if(G._isTenMode){
      btn.style.background = 'linear-gradient(135deg,#c0392b,#e74c3c)';
      btn.style.color = '#fff';
      btn.style.boxShadow = '0 2px 8px rgba(192,57,43,.35)';
      btn.textContent = '十连模式';
    } else {
      btn.style.background = 'linear-gradient(135deg,#c8a020,#8b6010)';
      btn.style.color = '#1A1A1A';
      btn.style.boxShadow = '0 2px 8px rgba(180,120,20,.25)';
      btn.textContent = '十连召唤';
    }
  }
  updateSummonBtnText();
  if(typeof playClick==='function') playClick();
}

function updateSummonBtnText(){
  var n = G.summonCount || 0;
  var coinBase = G._coinCost || 100;
  var qiBase = G._qiCost || 500;
  var tenCost = Math.floor(coinBase * Math.pow(1.2, Math.floor(n/10))) * 10;
  var coinCost = Math.floor(coinBase * Math.pow(1.2, Math.floor(n/10)));
  var qiCost = Math.floor(qiBase * Math.pow(1.2, Math.floor(n/10)));
  var coinEl = document.getElementById('coinCost');
  var qiEl = document.getElementById('qiCost');
  if(coinEl){
    coinEl.textContent = G._isTenMode ? tenCost : coinCost;
  }
  if(qiEl){
    qiEl.textContent = G._isTenMode ? (qiCost * 10) : qiCost;
  }
  // 十连时按钮文字说明
  var coinBtn = document.getElementById('btnCoin');
  if(coinBtn){
    var iconSpan = coinBtn.querySelector('span:first-child');
    if(iconSpan) iconSpan.textContent = '💰';
  }
  var qiBtn = document.getElementById('btnQi');
  if(qiBtn){
    var iconSpan = qiBtn.querySelector('span:first-child');
    if(iconSpan) iconSpan.textContent = '☁️';
  }

  // HUD 金币显示
  var hudCoins = document.getElementById('hudCoins');
  if(hudCoins) hudCoins.textContent = fmtNum(G.coins);
}

// ── 十连抽入口（从 index.html 的 doTenSummon() 调用） ──
// ── 十连入口（支持 coin/qi 两种资源）─────────────────────
function doTenSummon(type){
  type = type || 'coin';
  var batch=10, n=G.summonCount, cost, pool;
  if(type==='coin'){
    cost=Math.floor(100*Math.pow(1.2,Math.floor(n/10)))*batch;
    if(G.coins<cost){showToast('error','金币不足 '+cost+'💰');if(typeof playSynthFail==='function')playSynthFail();return;}
    G.coins-=cost;
    pool=[{level:1,weight:100},{level:2,weight:80},{level:3,weight:50}];
  } else {
    var qiCostEach=Math.floor(500*Math.pow(1.1,Math.floor(n/15)));
    cost=qiCostEach*batch;
    if(G.qi<cost){showNotif('error','龙气不足！');return;}
    G.qi-=cost;
    pool=[{level:4,weight:30},{level:5,weight:18},{level:6,weight:10}];
  }
  var results=[];
  for(var i=0;i<batch;i++) results.push(getSummonLevel(pool));
  // 检查剩余格子
  var used=new Set(G.dragons.map(function(d){return d.idx})),empty=[];
  for(var k=0;k<TOTAL;k++) if(!used.has(k)) empty.push(k);
  if(empty.length===0){
    showToast('error','灵兽已满！请先合并');if(typeof playSynthFail==='function')playSynthFail();
    G.coins+=cost;return; // 退金币
  }
  var placed=0;
  results.forEach(function(lv){
    if(empty.length===0)return;
    var slot=empty.shift();
    // 修复⑤：召唤时随机分配生肖，确保12生肖差异化
    var summonZ=Math.floor(Math.random()*12);
    G.dragons.push({id:String(nextId++),level:lv,idx:slot,star:1,z:summonZ});
    G.summonCount++;placed++;
    _onWeeklyEvent('summon');
  });
  saveGame();renderGrid();updateHud();checkAch();
  showBatchSummonResult(results.slice(0,placed));
}

// ── 弹窗改为页面顶部固定（max-width:420px，小字体紧凑） ──
// ── 十连结果弹窗：直接展示全部卡片，无翻转/无问号 ──────────
function showBatchSummonResult(results){
  var rarNames=['普通','稀有','史诗','传说','神话'];
  var rarColors=['#5a7a5a','#2a7abf','#8b3ac8','#c8860a','#d44010'];
  var bgColors=['rgba(240,235,228,.95)','rgba(225,240,255,.95)','rgba(240,228,255,.95)','rgba(255,245,210,.95)','rgba(255,238,228,.95)'];
  var cnt=[0,0,0,0,0];results.forEach(function(lv){cnt[rarIdx(lv)]++;});
  var summary='';cnt.forEach(function(c,i){if(c>0)summary+=rarNames[i]+'×'+c+' ';});
  var cardsHtml='';
  results.forEach(function(lv){
    var t=rarIdx(lv), color=rarColors[t], bg=bgColors[t];
    var rarityLabel=['','普通','稀有','史诗','传说','神话'][lv];
    var name=LNAME[lv]||'灵兽';
    // 修复④：抽卡结果用 SVG 渲染（修复灵兽图丢失）
    // 临时 dragon 对象，随机生肖 + 对应等级（getDragonVisual 会自动取 skin）
    var fakeDragon={id:'summon',level:lv,z:Math.floor(Math.random()*12),idx:-1};
    var vSummon=getDragonVisual(fakeDragon);
    var iconHtmlSummon=_dragonIconHtml(vSummon,48);
    var cpsdesc=lv>=4?'产出龙气':'产出金币';
    cardsHtml+='<div style="display:flex;flex-direction:column;align-items:center;padding:10px 8px;background:'+bg+';border:1.5px solid '+color+'60;border-radius:12px;min-width:68px;flex:1;box-shadow:0 2px 8px rgba(0,0,0,.06);">';
    cardsHtml+='<div style="display:flex;align-items:center;justify-content:center;width:56px;height:56px;line-height:1;">'+iconHtmlSummon+'</div>';
    cardsHtml+='<div style="font-size:10px;font-weight:800;color:'+color+';margin-top:3px;">'+name+'</div>';
    cardsHtml+='<div style="font-size:9px;color:#666;margin-top:1px;">['+rarityLabel+']</div>';
    cardsHtml+='<div style="font-size:8px;color:#888;margin-top:2px;">'+cpsdesc+'</div>';
    cardsHtml+='</div>';
  });
  var html='<div style="padding:16px 12px;text-align:center;background:rgba(255,255,255,.85);border-radius:16px;">';
  html+='<div style="font-size:15px;font-weight:800;color:#333;letter-spacing:3px;margin-bottom:6px;">✦ 召唤结果 ✦</div>';
  html+='<div style="font-size:12px;color:#555;font-weight:600;margin-bottom:14px;">'+summary.trim()+'</div>';
  html+='<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px;">'+cardsHtml+'</div>';
  html+='<button onclick="document.getElementById(\'batchSummonOverlay\').remove();try{renderGrid&&renderGrid();updateHud&&updateHud();}catch(e){}" style="width:100%;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#8b6914,#d4a017);color:#222;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:2px;box-shadow:0 3px 12px rgba(180,120,20,.3);">收下 ✦</button>';
  html+='</div>';
  var old=document.getElementById('batchSummonOverlay');if(old)old.remove();
  var overlay=document.createElement('div');
  overlay.id='batchSummonOverlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(60,30,10,.45);backdrop-filter:blur(6px);padding:16px;';
  overlay.innerHTML='<div style="width:min(480px,100%);max-height:88vh;overflow-y:auto;">'+html+'</div>';
  overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
  document.body.appendChild(overlay);
  if(typeof playTenSummonSfx==='function')playTenSummonSfx();
  G._isTenMode=false; // 自动切回单抽
  var btn=document.getElementById('batchBtn10');
  if(btn){
    btn.style.background='linear-gradient(135deg,#8b6914,#d4a017)';
    btn.style.color='#222';
    btn.style.boxShadow='0 2px 8px rgba(180,120,20,.25)';
    btn.textContent='✨ 十连召唤';
  }
}
function setSummonBatch(n){
  G.summonBatch=n;
  document.querySelectorAll('#summonBatchSwitch button').forEach(function(b,i){
    var v=[1,5,10][i];
    b.className=v===n?'active':'';
  });
  updateHud&&updateHud();
}

// ── 金币单抽（含十连模式切换）─────────────────────────────
function summonCoin(){
  if(G._isTenMode){ doTenSummon('coin'); return; }
  const n = G.summonCount;
  const cost = Math.floor(100*Math.pow(1.2,Math.floor(n/10)));
  if(G.coins<cost){showNotif('error','金币不足！');if(typeof playSynthFail==='function')playSynthFail();return;}
  G.coins-=cost;
  doSummon(getSummonLevel([{level:1,weight:100},{level:2,weight:80},{level:3,weight:50}]));
}

function summonQi(){
  // 龙气消耗也指数增长，防止龙气溢出
  const n=G.summonCount;
  const cost=Math.floor(500*Math.pow(1.1,Math.floor(n/15)));
  if(G.qi<cost){showNotif('error','龙气不足！');return;}
  G.qi-=cost;
  doSummon(getSummonLevel([{level:4,weight:30},{level:5,weight:18},{level:6,weight:10}]));
}
function summonFree(){
  if(G.freeLeft<=0){showNotif('error','今日免费次数已用完！');return;}
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

// === feat[8] 连击特效系统 ===
// combo 条计时器（全局唯一，2.5s 内持续回落）
let _comboTimer = null;

function updateComboBar(active){
  const bar=document.getElementById('comboBar');
  if(!bar)return;
  const fill=document.getElementById('comboFill');
  const badge=document.getElementById('comboBadge');
  if(!fill||!badge)return;
  if(!G.created||G.combo<2){
    bar.style.display='none';
    clearTimeout(_comboTimer);
    _comboTimer=null;
    return;
  }
  bar.style.display='flex';
  badge.textContent='×'+G.combo;
  // 颜色按 combo 阶段：2绿→3黄绿→4橙→5红→6紫→7+金
  const ci=Math.min(G.combo-2,5);
  fill.className='combo-fill c'+ci;
  // 活跃时重置计时（倒计时从 100% 开始线性回落）
  if(active){
    clearTimeout(_comboTimer);
    _comboTimer=null;
    const start=Date.now();
    const tick=()=>{
      const elapsed=Date.now()-start;
      const pct=Math.max(0,1-elapsed/2500)*100;
      fill.style.height=pct+'%';
      if(pct>0){ _comboTimer=setTimeout(tick,50); }
      else{
        // 超时归零时也关闭 HUD combo
        G.combo=0;
        updateHud();
        bar.style.display='none';
      }
    };
    tick();
  }
}

function spawnComboParticles(level){
  const cx=window.innerWidth/2, cy=window.innerHeight/2;
  for(let i=0;i<8;i++){
    const p=document.createElement('div');
    p.className='combo-particle';
    const angle=(Math.PI*2*i/8)+(Math.random()-.5)*.4;
    const dist=90+Math.random()*70;
    p.style.cssText=`left:${cx}px;top:${cy}px;width:${4+Math.random()*5}px;height:${4+Math.random()*5}px;background:rgba(255,${150+Math.floor(Math.random()*105)},0,.85);--dx:${Math.round(Math.cos(angle)*dist)}px;--dy:${Math.round(Math.sin(angle)*dist)}px;`;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),950);
  }
}

function showComboScore(level){
  const el=document.createElement('div');
  const bonus=COIN_S[level]||10;
  const mult=G.combo>=5?2:G.combo>=2?1.5:1;
  const text='+'+fmtNum(Math.floor(bonus*mult))+' ⚡';
  el.className='combo-score';
  if(G.combo>=10)el.classList.add('x10');
  else if(G.combo>=7)el.classList.add('x7');
  else if(G.combo>=5)el.classList.add('x5');
  else if(G.combo>=3)el.classList.add('x3');
  el.textContent=text;
  const cx=window.innerWidth/2, cy=window.innerHeight*0.38;
  el.style.left=(cx+(Math.random()-.5)*60)+'px';
  el.style.top=(cy+(Math.random()-.5)*20)+'px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1450);
}

function showComboMilestone(combo){
  const el=document.createElement('div');
  el.className='combo-milestone';
  const colors={3:'#2e7d32',5:'#e65100',7:'#7b3fcb',10:'#c8860a'};
  const labels={3:'GOOD!',5:'GREAT!',7:'AMAZING!',10:'LEGENDARY!'};
  const c=colors[combo]||'#c8860a';
  el.style.color=c;
  el.style.textShadow="0 0 30px "+c+",0 0 60px "+c;
  el.innerHTML="⚡<br>"+combo+"× COMBO<br><span style=\"font-size:.45em;letter-spacing:2px;\">"+(labels[combo]||"")+"<\/span>";
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1550);
}

function shakeScreen(){
  document.querySelector('#gamePage').classList.remove('combo-shake');
  void document.querySelector('#gamePage').offsetWidth; // reflow
  document.querySelector('#gamePage').classList.add('combo-shake');
  setTimeout(()=>document.querySelector('#gamePage').classList.remove('combo-shake'),550);
}
// showNotif 升级版：支持 emoji 前缀消息 + 稀有度颜色
// showNotif：兼容旧调用 showNotif(type, msg) 和新调用 showNotif(msg)
// ── 顶部单行提示（替换 showNotif，移动到页面顶部） ──
function showToast(type, msg){
  var el=document.getElementById('notif');
  if(!el)return;
  clearTimeout(el._timer);
  var COLORS={
    success:'rgba(20,100,30,.92)',
    error:'rgba(120,20,20,.92)',
    info:'rgba(20,50,100,.92)',
    warn:'rgba(100,70,0,.92)',
    gold:'rgba(80,60,0,.92)',
  };
  var bg=COLORS[type]||COLORS.info;
  el.style.cssText=
    'position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:9999;'+
    'padding:7px 16px;border-radius:20px;font-size:12px;font-weight:600;'+
    'letter-spacing:.5px;max-width:380px;width:92vw;overflow:hidden;'+
    'text-overflow:ellipsis;white-space:nowrap;text-align:center;'+
    'background:'+bg+';color:#fff;display:block;opacity:1;border:1px solid rgba(255,255,255,.12);';
  el.textContent=msg||'';
  el._timer=setTimeout(function(){
    el.style.opacity='0';
    setTimeout(function(){el.style.display='none';},250);
  },2500);
}
// 兼容旧调用 showNotif(msg, colorOrOpts)
function showNotif(msg, colorOrOpts){
  var text, type;
  if(typeof colorOrOpts==='string'){
    type=msg; text=colorOrOpts;
  } else {
    text=msg; type=(colorOrOpts&&colorOrOpts.type)||'info';
  }
  showToast(type,text);
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
var _floatPool=[];
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
  // 周金币追踪计数（每60秒更新一次，避免频繁写存储）
  let _weeklyCoinTimer=0;
  cpsTimer=setInterval(()=>{
    const cps=calcCps();
    G.cps=cps;  // 缓存，供 _trackWeeklyCoins 使用
    if(cps>0){G.coins+=cps;G.totalCoins=(G.totalCoins||0)+cps;updateHud();spawnCoinFloat(cps);if(G.totalCoins%3600<cps)saveGame();}
    // 每60秒更新周金币计数（每次累加60秒产出）
    _weeklyCoinTimer+=1000;
    if(_weeklyCoinTimer>=60000){
      _weeklyCoinTimer=0;
      try{if(typeof _trackWeeklyCoins==='function')_trackWeeklyCoins();}catch(e){}
    }
  },1000);
  // combo 衰减（500ms检测，2.5秒无合成归零）
  setInterval(()=>{if(G.created&&G.combo>0&&Date.now()-G.lastMergeTime>2500){G.combo=0;updateHud();}},500);
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


function enterGridMode(){
  // grid mode disabled
  // grid mode disabled
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
  // grid always visible - exitGridMode is a no-op now
  const hero = document.getElementById('heroSection');
  const grid = document.getElementById('dragonGrid');
  const gridInner = document.getElementById('dragonGridInner');
  if(!hero || !grid) return;
  grid.style.transition = 'opacity .3s';
  grid.style.opacity = '0';
  setTimeout(() => {
    grid.style.opacity = '0';
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
          <span style="display:block;margin:0 auto 2px;font-size:18px;">💧</span>
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
      <div class="ht" onclick="showDragonDetail(${bestLvl},${best.z||0})" style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:6px 8px;font-size:28px;line-height:1;" onmouseover="this.style.background='rgba(255,215,0,.08)'" onmouseout="this.style.background='transparent'" title="点击查看灵兽详情">
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

// ═══════════════════════════════════════
// P0-2 灵兽皮肤系统
// ═══════════════════════════════════════
// ═══════════════════════════════════════════════════
// 10 皮肤完整配置（含购买数据 + 视觉属性）
// ═══════════════════════════════════════════════════
var DRAGON_SKINS = [
  {id:'default',  name:'默认原皮',   cost:0,    rarity:0, label:'普通', icon:'🐣', color:'#8b6914', glow:'#d4a017', filter:'',              border:'#aaa',         shadow:'rgba(180,140,80,.25)', visualRarity:0},
  {id:'gold',     name:'鎏金天命',  cost:800,  rarity:4, label:'传说', icon:'🐉', color:'#d4a017', glow:'#ffd700', filter:'sepia(0) saturate(3) hue-rotate(0deg)', border:'#ffd700',      shadow:'rgba(255,215,0,.35)',  visualRarity:4},
  {id:'azure',    name:'玄青龙纹',  cost:500,  rarity:3, label:'珍稀', icon:'🐲', color:'#1565c0', glow:'#64b5f6', filter:'sepia(0) saturate(2) hue-rotate(200deg)', border:'#64b5f6',    shadow:'rgba(21,101,192,.35)', visualRarity:3},
  {id:'flame',    name:'赤焰战魂',  cost:800,  rarity:4, label:'传说', icon:'🐉', color:'#c62828', glow:'#ff5722', filter:'sepia(0.5) saturate(3) hue-rotate(-20deg)', border:'#ff5722',   shadow:'rgba(198,40,40,.35)',  visualRarity:4},
  {id:'jade',     name:'翡翠灵韵',  cost:500,  rarity:3, label:'珍稀', icon:'🐲', color:'#2e7d32', glow:'#66bb6a', filter:'sepia(0) saturate(2) hue-rotate(80deg)', border:'#66bb6a',   shadow:'rgba(46,125,50,.35)',  visualRarity:3},
  {id:'purple',   name:'紫霄星芒',  cost:500,  rarity:3, label:'珍稀', icon:'✨', color:'#7b3fcb', glow:'#ce93d8', filter:'sepia(0) saturate(2) hue-rotate(280deg)', border:'#ce93d8',   shadow:'rgba(123,63,203,.35)', visualRarity:3},
  {id:'silver',   name:'白银圣甲',  cost:300,  rarity:1, label:'稀有', icon:'🐉', color:'#9e9e9e', glow:'#e0e0e0', filter:'sepia(0) saturate(0.5) hue-rotate(0deg)', border:'#e0e0e0',  shadow:'rgba(158,158,158,.35)',visualRarity:2},
  {id:'dark',     name:'九幽暗纹',  cost:800,  rarity:4, label:'传说', icon:'🐲', color:'#4a148c', glow:'#7b1fa2', filter:'sepia(0.8) saturate(2) hue-rotate(260deg) brightness(0.7)', border:'#7b1fa2',shadow:'rgba(123,31,162,.4)', visualRarity:4},
  {id:'crystal',  name:'琉璃幻彩',  cost:300,  rarity:1, label:'稀有', icon:'💎', color:'#00838f', glow:'#80deea', filter:'sepia(0) saturate(1.5) hue-rotate(170deg) brightness(1.1)', border:'#80deea', shadow:'rgba(0,131,143,.35)',visualRarity:2},
  {id:'destiny',  name:'天命神兽',  cost:1500, rarity:4, label:'神话', icon:'☀️', color:'#f57f17', glow:'#ffe082', filter:'sepia(0.1) saturate(3) hue-rotate(10deg) brightness(1.1)', border:'#ffe082',shadow:'rgba(255,224,130,.4)',visualRarity:4},
];
// 稀有度颜色标签
var SKIN_RARITY_COLORS = ['#555','#1565c0','#7b3fcb','#c8860a','#c62828'];
var SKIN_RARITY_NAMES  = ['普通','稀有','珍稀','传说','神话'];

// ═══════════════════════════════════════════════════
// getDragonVisual 使用 DRAGON_SKINS（统一购买数据+视觉）
// 渲染规则：生肖基础形象 + 等级成长形态 + 皮肤特效叠加
// ═══════════════════════════════════════════════════
function getDragonVisual(dragon){
  // 修复⑤：取真实灵兽的 zodiac 字段，不用统一0
  // 每个灵兽 dragon.z 存其生肖，召唤时随机分配（见 doSummon / doTenSummon）
  const zodiac = dragon.z !== undefined ? dragon.z : 0;
  const level  = dragon.level || 1;
  // 灵兽自身 skinId 优先，否则用全局装备皮肤
  const skinId = dragon.skinId || G.equippedSkin || 'default';
  const skin   = DRAGON_SKINS.find(s => s.id === skinId) || DRAGON_SKINS[0];
  const stage  = getLevelStage(level);
  const stageName = LV_STAGE_NAMES[stage] || '幼生';
  const glowStrength = Math.min(1, level / 15);
  const visualConfig = _loadVisualConfig(zodiac, level, skinId);

  return {
    // 渲染用的图标：优先SVG，fallback emoji（12生肖×15级差异）
    svgPath: visualConfig.svgPath,
    emoji:   ZOD_ICON[zodiac] ? (ZOD_ICON[zodiac][level] || ZOD_ICON[zodiac][1]) : '🐣',
    // 皮肤 filter（CSS filter string，叠加到 SVG img 元素上）
    filter:  skin.filter,
    // 颜色系（用于文字、边框、背景计算）
    baseColor:  skin.color,
    glowColor:  skin.glow,
    border:     skin.border,
    shadow:     skin.shadow,
    // 透明度
    bgAlpha: 0.08 + glowStrength * 0.06 + (skin.visualRarity >= 3 ? 0.04 : 0),
    // 大小
    iconSize: Math.round(16 + (level - 1) * 1.2),
    // 阶段信息
    stage, stageName,
    // 皮肤信息
    skinId, skinName: skin.name, skinRarity: skin.visualRarity,
    // 视觉描述
    description: visualConfig.description,
    skinOverlay: visualConfig.skinOverlay,
  };
}

// dragon_visual_config.json 缓存（用 fetch 异步加载一次，之后内存缓存）
let _visualConfigCache = null;
let _visualConfigLoading = false;
function _loadVisualConfig(zodiac, level, skinId){
  const svgPath = 'docs/svgs/drag_' + zodiac + '_' + level + '.svg';
  const defaultDescs = ['灵蛋初形，棕灰圆润','微微成形，尖耳竖立','轮廓清晰，灵性初现',
    '特征完备，灵气环绕','灵气缠绕，特效初现','形态丰满，符文隐现',
    '符文显现，灵气蒸腾','通灵之相，灵气充沛','灵兽之姿，符文缠绕',
    '神兽形态，光芒内敛','神兽威仪，灵光大盛','神兽降临，灵气冲天',
    '帝王神威，光环笼罩','帝王威仪，灵气汹涌','天命永恒，神兽降世'];
  const descDefault = defaultDescs[level-1] || '灵兽';
  const skinOverlayDefault = skinId !== 'default'
    ? '皮肤特效：' + (DRAGON_SKINS.find(s=>s.id===skinId)||{}).name
    : '';
  // 有缓存直接读
  if(_visualConfigCache){
    const rec = _visualConfigCache.ZODIAC_GRID
      ? _visualConfigCache.ZODIAC_GRID.find(r => r.zodiac === zodiac && r.level === level) : null;
    if(rec){
      return {
        svgPath: rec.svgPath || svgPath,
        description: rec.description || descDefault,
        skinOverlay: rec.skinOverlays && rec.skinOverlays[skinId] !== undefined
          ? rec.skinOverlays[skinId] : skinOverlayDefault,
      };
    }
  }
  // 无缓存则用默认值（异步加载在后台进行）
  if(!_visualConfigLoading && !_visualConfigCache){
    _visualConfigLoading = true;
    fetch('docs/dragon_visual_config.json')
      .then(r=>r.json())
      .then(data=>{ _visualConfigCache = data; _visualConfigLoading = false; })
      .catch(()=>{ _visualConfigCache = {}; _visualConfigLoading = false; });
  }
  return { svgPath, description: descDefault, skinOverlay: skinOverlayDefault };
}

// 获取灵兽视觉展示内容（SVG img 或 emoji fallback）
function _dragonIconHtml(v, sizePx){
  // 优先尝试 SVG，失败则 emoji
  const useSvg = v.svgPath && v.svgPath.includes('.svg');
  const sz = sizePx || v.iconSize;
  const filter = v.filter || '';
  const glowPx = 4 + v.stage * 2;
  const glowColor = v.glowColor || '#aaa';
  if(useSvg){
    return `<img src="${v.svgPath}" style="width:${sz}px;height:${sz}px;object-fit:contain;filter:${filter} drop-shadow(0 0 ${glowPx}px ${glowColor});border-radius:8px;display:block;" onerror="this.style.display='none';this.nextElementSibling.style.display='inline';" />` +
           `<span style="display:none;font-size:${sz}px;line-height:1.2;filter:${filter} drop-shadow(0 0 ${glowPx}px ${glowColor});">${v.emoji}</span>`;
  }
  return `<span style="font-size:${sz}px;line-height:1.2;filter:${filter} drop-shadow(0 0 ${glowPx}px ${glowColor});">${v.emoji}</span>`;
}

// 图鉴收集进度奖励
var ATLAS_REWARDS = [
  {count:3,  coin:1000,  qi:50,  title:'初窥门径'},
  {count:5,  coin:3000,  qi:100, title:'小有所成'},
  {count:8,  coin:8000,  qi:200, title:'大有可观'},
  {count:12, coin:30000, qi:500, title:'集齐十二生肖！'},
];

// ═══════════════════════════════════════
// P1-1 天命试炼塔 (Tower)
// ═══════════════════════════════════════
var TOWER_FLOORS = 100;
// 试炼塔每层敌人配置（HP/金币随层数指数增长）
var TOWER_ENEMIES = [
  // 第1层
  {floor:1,hp:114,coins:22,qi:0,name:'小蛇妖',isBoss:false},
  // 第2层
  {floor:2,hp:132,coins:25,qi:0,name:'小狐精',isBoss:false},
  // 第3层
  {floor:3,hp:152,coins:28,qi:0,name:'小狼魂',isBoss:false},
  // 第4层
  {floor:4,hp:174,coins:31,qi:0,name:'小鼠灵',isBoss:false},
  // 第5层
  {floor:5,hp:201,coins:35,qi:0,name:'小蛇妖',isBoss:false},
  // 第6层
  {floor:6,hp:231,coins:39,qi:0,name:'小狐精',isBoss:false},
  // 第7层
  {floor:7,hp:266,coins:44,qi:0,name:'小狼魂',isBoss:false},
  // 第8层
  {floor:8,hp:305,coins:49,qi:0,name:'小鼠灵',isBoss:false},
  // 第9层
  {floor:9,hp:351,coins:55,qi:0,name:'小蛇妖',isBoss:false},
  // 第10层 🏆BOSS
  {floor:10,hp:404,coins:62,qi:10,name:'小狐精王',isBoss:true},
  // 第11层
  {floor:11,hp:465,coins:69,qi:0,name:'幽魂',isBoss:false},
  // 第12层
  {floor:12,hp:535,coins:77,qi:0,name:'妖蛇',isBoss:false},
  // 第13层
  {floor:13,hp:615,coins:87,qi:0,name:'魔狼',isBoss:false},
  // 第14层
  {floor:14,hp:707,coins:97,qi:0,name:'灵狐',isBoss:false},
  // 第15层
  {floor:15,hp:813,coins:109,qi:0,name:'幽魂',isBoss:false},
  // 第16层
  {floor:16,hp:935,coins:122,qi:0,name:'妖蛇',isBoss:false},
  // 第17层
  {floor:17,hp:1076,coins:137,qi:0,name:'魔狼',isBoss:false},
  // 第18层
  {floor:18,hp:1237,coins:153,qi:0,name:'灵狐',isBoss:false},
  // 第19层
  {floor:19,hp:1423,coins:172,qi:0,name:'幽魂',isBoss:false},
  // 第20层 🏆BOSS
  {floor:20,hp:1636,coins:192,qi:20,name:'妖蛇王',isBoss:true},
  // 第21层
  {floor:21,hp:1882,coins:216,qi:0,name:'魔狼',isBoss:false},
  // 第22层
  {floor:22,hp:2164,coins:242,qi:0,name:'灵狐',isBoss:false},
  // 第23层
  {floor:23,hp:2489,coins:271,qi:0,name:'幽魂',isBoss:false},
  // 第24层
  {floor:24,hp:2862,coins:303,qi:0,name:'妖蛇',isBoss:false},
  // 第25层
  {floor:25,hp:3291,coins:340,qi:0,name:'魔狼',isBoss:false},
  // 第26层
  {floor:26,hp:3785,coins:380,qi:0,name:'灵狐',isBoss:false},
  // 第27层
  {floor:27,hp:4353,coins:426,qi:0,name:'幽魂',isBoss:false},
  // 第28层
  {floor:28,hp:5006,coins:477,qi:0,name:'妖蛇',isBoss:false},
  // 第29层
  {floor:29,hp:5757,coins:534,qi:0,name:'魔狼',isBoss:false},
  // 第30层 🏆BOSS
  {floor:30,hp:6621,coins:599,qi:30,name:'灵狐王',isBoss:true},
  // 第31层
  {floor:31,hp:7614,coins:671,qi:0,name:'幽冥',isBoss:false},
  // 第32层
  {floor:32,hp:8756,coins:751,qi:0,name:'暗魔',isBoss:false},
  // 第33层
  {floor:33,hp:10069,coins:841,qi:0,name:'妖龙',isBoss:false},
  // 第34层
  {floor:34,hp:11580,coins:942,qi:0,name:'冥凤',isBoss:false},
  // 第35层
  {floor:35,hp:13317,coins:1055,qi:0,name:'幽冥',isBoss:false},
  // 第36层
  {floor:36,hp:15315,coins:1182,qi:0,name:'暗魔',isBoss:false},
  // 第37层
  {floor:37,hp:17612,coins:1324,qi:0,name:'妖龙',isBoss:false},
  // 第38层
  {floor:38,hp:20254,coins:1483,qi:0,name:'冥凤',isBoss:false},
  // 第39层
  {floor:39,hp:23292,coins:1661,qi:0,name:'幽冥',isBoss:false},
  // 第40层 🏆BOSS
  {floor:40,hp:26786,coins:1861,qi:40,name:'暗魔王',isBoss:true},
  // 第41层
  {floor:41,hp:30804,coins:2084,qi:0,name:'妖龙',isBoss:false},
  // 第42层
  {floor:42,hp:35424,coins:2334,qi:0,name:'冥凤',isBoss:false},
  // 第43层
  {floor:43,hp:40738,coins:2614,qi:0,name:'幽冥',isBoss:false},
  // 第44层
  {floor:44,hp:46849,coins:2928,qi:0,name:'暗魔',isBoss:false},
  // 第45层
  {floor:45,hp:53876,coins:3279,qi:0,name:'妖龙',isBoss:false},
  // 第46层
  {floor:46,hp:61958,coins:3673,qi:0,name:'冥凤',isBoss:false},
  // 第47层
  {floor:47,hp:71252,coins:4114,qi:0,name:'幽冥',isBoss:false},
  // 第48层
  {floor:48,hp:81940,coins:4607,qi:0,name:'暗魔',isBoss:false},
  // 第49层
  {floor:49,hp:94231,coins:5160,qi:0,name:'妖龙',isBoss:false},
  // 第50层 🏆BOSS
  {floor:50,hp:108365,coins:5780,qi:50,name:'冥凤王',isBoss:true},
  // 第51层
  {floor:51,hp:124620,coins:6473,qi:0,name:'幽冥',isBoss:false},
  // 第52层
  {floor:52,hp:143313,coins:7250,qi:0,name:'暗魔',isBoss:false},
  // 第53层
  {floor:53,hp:164810,coins:8120,qi:0,name:'妖龙',isBoss:false},
  // 第54层
  {floor:54,hp:189532,coins:9095,qi:0,name:'冥凤',isBoss:false},
  // 第55层
  {floor:55,hp:217962,coins:10186,qi:0,name:'幽冥',isBoss:false},
  // 第56层
  {floor:56,hp:250656,coins:11408,qi:0,name:'暗魔',isBoss:false},
  // 第57层
  {floor:57,hp:288255,coins:12777,qi:0,name:'妖龙',isBoss:false},
  // 第58层
  {floor:58,hp:331493,coins:14311,qi:0,name:'冥凤',isBoss:false},
  // 第59层
  {floor:59,hp:381217,coins:16028,qi:0,name:'幽冥',isBoss:false},
  // 第60层 🏆BOSS
  {floor:60,hp:438399,coins:17951,qi:60,name:'暗魔王',isBoss:true},
  // 第61层
  {floor:61,hp:504159,coins:20106,qi:0,name:'妖神',isBoss:false},
  // 第62层
  {floor:62,hp:579783,coins:22518,qi:0,name:'冥祖',isBoss:false},
  // 第63层
  {floor:63,hp:666751,coins:25221,qi:0,name:'虚空',isBoss:false},
  // 第64层
  {floor:64,hp:766764,coins:28247,qi:0,name:'天魔',isBoss:false},
  // 第65层
  {floor:65,hp:881778,coins:31637,qi:0,name:'妖神',isBoss:false},
  // 第66层
  {floor:66,hp:1014045,coins:35433,qi:0,name:'冥祖',isBoss:false},
  // 第67层
  {floor:67,hp:1166152,coins:39686,qi:0,name:'虚空',isBoss:false},
  // 第68层
  {floor:68,hp:1341075,coins:44448,qi:0,name:'天魔',isBoss:false},
  // 第69层
  {floor:69,hp:1542236,coins:49782,qi:0,name:'妖神',isBoss:false},
  // 第70层 🏆BOSS
  {floor:70,hp:1773572,coins:55755,qi:70,name:'冥祖王',isBoss:true},
  // 第71层
  {floor:71,hp:2039607,coins:62446,qi:0,name:'虚空',isBoss:false},
  // 第72层
  {floor:72,hp:2345548,coins:69940,qi:0,name:'天魔',isBoss:false},
  // 第73层
  {floor:73,hp:2697381,coins:78333,qi:0,name:'妖神',isBoss:false},
  // 第74层
  {floor:74,hp:3101988,coins:87733,qi:0,name:'冥祖',isBoss:false},
  // 第75层
  {floor:75,hp:3567286,coins:98261,qi:0,name:'虚空',isBoss:false},
  // 第76层
  {floor:76,hp:4102379,coins:110052,qi:0,name:'天魔',isBoss:false},
  // 第77层
  {floor:77,hp:4717736,coins:123258,qi:0,name:'妖神',isBoss:false},
  // 第78层
  {floor:78,hp:5425397,coins:138049,qi:0,name:'冥祖',isBoss:false},
  // 第79层
  {floor:79,hp:6239206,coins:154615,qi:0,name:'虚空',isBoss:false},
  // 第80层 🏆BOSS
  {floor:80,hp:7175087,coins:173169,qi:80,name:'天魔王',isBoss:true},
  // 第81层
  {floor:81,hp:8251351,coins:193950,qi:0,name:'妖神',isBoss:false},
  // 第82层
  {floor:82,hp:9489053,coins:217224,qi:0,name:'冥祖',isBoss:false},
  // 第83层
  {floor:83,hp:10912411,coins:243290,qi:0,name:'虚空',isBoss:false},
  // 第84层
  {floor:84,hp:12549273,coins:272485,qi:0,name:'天魔',isBoss:false},
  // 第85层
  {floor:85,hp:14431664,coins:305184,qi:0,name:'妖神',isBoss:false},
  // 第86层
  {floor:86,hp:16596414,coins:341806,qi:0,name:'冥祖',isBoss:false},
  // 第87层
  {floor:87,hp:19085876,coins:382822,qi:0,name:'虚空',isBoss:false},
  // 第88层
  {floor:88,hp:21948758,coins:428761,qi:0,name:'天魔',isBoss:false},
  // 第89层
  {floor:89,hp:25241071,coins:480213,qi:0,name:'妖神',isBoss:false},
  // 第90层 🏆BOSS
  {floor:90,hp:29027232,coins:537838,qi:90,name:'冥祖王',isBoss:true},
  // 第91层
  {floor:91,hp:33381317,coins:602379,qi:0,name:'太初',isBoss:false},
  // 第92层
  {floor:92,hp:38388515,coins:674664,qi:0,name:'终焉',isBoss:false},
  // 第93层
  {floor:93,hp:44146792,coins:755624,qi:0,name:'天道',isBoss:false},
  // 第94层
  {floor:94,hp:50768811,coins:846299,qi:0,name:'天命',isBoss:false},
  // 第95层
  {floor:95,hp:58384132,coins:947855,qi:0,name:'太初',isBoss:false},
  // 第96层
  {floor:96,hp:67141752,coins:1061598,qi:0,name:'终焉',isBoss:false},
  // 第97层
  {floor:97,hp:77213015,coins:1188989,qi:0,name:'天道',isBoss:false},
  // 第98层
  {floor:98,hp:88794967,coins:1331668,qi:0,name:'天命',isBoss:false},
  // 第99层
  {floor:99,hp:102114213,coins:1491469,qi:0,name:'太初',isBoss:false},
  // 第100层 🏆BOSS
  {floor:100,hp:117431345,coins:1670445,qi:100,name:'终焉王',isBoss:true},
];

// ═══════════════════════════════════════
// P1-1 天命试炼塔 (Tower)
// ═══════════════════════════════════════
var TOWER_ACHIEVEMENTS = [
  {floor:5,coins:100,qi:0,title:'初入试炼'},
  {floor:10,coins:300,qi:20,title:'小试牛刀'},
  {floor:20,coins:800,qi:50,title:'渐入佳境'},
  {floor:30,coins:2000,qi:100,title:'登堂入室'},
  {floor:50,coins:6000,qi:300,title:'炉火纯青'},
  {floor:80,coins:20000,qi:800,title:'出神入化'},
  {floor:100,coins:50000,qi:2000,title:'天命所归'}
];




// ═══════════════════════════════════════
// 云端存档 + 小程序授权配置
// ═══════════════════════════════════════
var CLOUD_SECRET    = "sxgame_v2_2026_secret_key_userid_hash_16bytes";
var CLOUD_USERID_KEY = "sxgame_v2_uid";
var CLOUD_TOKEN_KEY  = "sxgame_v2_token";
var CLOUD_API        = "https://47.105.41.23/api";

// ── 十连切换按钮（toggle 模式）──
