// ===== AUDIO.js - 生肖天机 v2 =====
// 初始化 AudioContext（必须在用户手势后调用）
function initAudio(){
  if(_audioCtx)return;
  try{_audioCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
}

// ── 全局 BGM 状态 ──
let _bgmTimer=null,_bgmIdx=0,_bgmZ=-1;

// ── 乐器音色配置 ──
const _INSTRUMENTS=[
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

// ── 背景音乐曲目（12生肖各一首） ──
const _ZODIAC_BGM=[
  {bpm:90,inst:0,notes:[261.63,329.63,392,523.25,329.63,392,523.25,392,261.63,392,523.25,659.25,392,523.25,392,329.63,261.63,329.63,392,523.25,329.63,392,523.25,659.25,784,659.25,523.25,392,329.63,523.25,392,329.63,261.63,329.63,392,523.25,659.25,784,659.25,523.25,392,523.25,392,329.63,261.63,392,523.25,392,261.63]},
  {bpm:58,inst:1,notes:[130.81,98,130.81,98,130.81,98,164.81,164.81,196,164.81,196,196,164.81,130.81,98,130.81,98,130.81,98,164.81,164.81,130.81,98,130.81,98,65.41,98,130.81]},
  {bpm:68,inst:2,notes:[196,196,261.63,261.63,329.63,329.63,392,392,329.63,329.63,261.63,261.63,196,196,329.63,329.63,392,392,523.25,392,329.63,261.63,329.63,261.63,196,392]},
  {bpm:72,inst:3,notes:[392,523.25,587.33,659.25,587.33,523.25,392,523.25,523.25,659.25,784,880,784,659.25,523.25,392,523.25,392,329.63,392,523.25,392,329.63,261.63,329.63,392,523.25,587.33,659.25,523.25,392,329.63,261.63,392,523.25,392,329.63,261.63]},
  {bpm:66,inst:4,notes:[130.81,130.81,261.63,261.63,329.63,329.63,261.63,261.63,329.63,329.63,392,329.63,261.63,392,392,523.25,392,329.63,261.63,196,261.63,329.63,392,523.25,392,329.63,261.63,261.63,329.63,392,523.25,659.25,523.25,392,329.63,261.63,329.63,261.63]},
  {bpm:52,inst:5,notes:[220,196,174.61,220,196,174.61,196,220,261.63,220,196,174.61,220,196,174.61,196,220,261.63,293.66,261.63,220,196,220,261.63,293.66,329.63,261.63,220,196,174.61]},
  {bpm:96,inst:6,notes:[392,392,523.25,523.25,392,392,523.25,587.33,392,392,523.25,523.25,659.25,659.25,523.25,392,523.25,523.25,659.25,784,784,659.25,523.25,392,523.25,523.25,392,392,659.25,587.33,523.25,392,392,523.25,523.25,392,392,523.25]},
  {bpm:70,inst:7,notes:[261.63,329.63,392,329.63,261.63,329.63,523.25,523.25,329.63,392,523.25,659.25,523.25,392,329.63,261.63,329.63,523.25,523.25,329.63,392,523.25,659.25,784,659.25,523.25,392,329.63,261.63,329.63,392,329.63,261.63,196,261.63,329.63,392]},
  {bpm:100,inst:8,notes:[523.25,784,523.25,784,659.25,523.25,392,523.25,784,659.25,523.25,392,523.25,784,523.25,784,659.25,523.25,392,523.25,784,659.25,523.25,392,523.25,784,523.25,784,659.25,523.25,392,523.25,784,659.25,523.25,392,523.25,784,659.25,523.25,392]},
  {bpm:85,inst:9,notes:[587.33,784,987.77,784,587.33,587.33,784,987.77,880,1174.66,880,784,587.33,587.33,784,659.25,587.33,784,987.77,880,784,587.33,784,987.77,987.77,784,659.25,587.33,784,784,659.25,587.33,392,523.25,659.25,784,987.77,784,659.25,587.33,784,659.25]},
  {bpm:88,inst:10,notes:[293.66,392,523.25,392,293.66,392,523.25,392,293.66,392,523.25,659.25,523.25,392,293.66,392,523.25,392,293.66,392,523.25,659.25,523.25,392,523.25,659.25,784,659.25,523.25,392,293.66,392,523.25,659.25,523.25,392,293.66,392,523.25,392]},
  {bpm:62,inst:11,notes:[130.81,130.81,196,196,261.63,196,261.63,196,196,261.63,329.63,329.63,261.63,196,130.81,261.63,329.63,392,329.63,261.63,329.63,392,523.25,392,329.63,261.63,196,130.81,130.81,196,196,261.63,261.63,329.63,329.63,261.63,261.63,392,523.25]},
];

// ── 基础发声函数 ──
function playNote(f,dur,vol,type){
  if(!_audioCtx||_audioState.muted||f<=0)return;
  const now=_audioCtx.currentTime;
  const rise=dur*.06;
  const o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
  o.type=type||'triangle';o.frequency.value=f;
  g.gain.setValueAtTime(.001,now);
  g.gain.linearRampToValueAtTime(vol,now+rise);
  g.gain.exponentialRampToValueAtTime(.001,now+dur);
  o.connect(g);g.connect(_audioCtx.destination);
  o.start(now);o.stop(now+dur+.02);
}

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

// ── 背景音乐主入口 ──
function playFullBgm(z){
  if(!_audioCtx||z<0)return;
  stopBgm();
  _bgmZ=z;
  const track=_ZODIAC_BGM[z]||_ZODIAC_BGM[4];
  const inst=_INSTRUMENTS[track.inst]||_INSTRUMENTS[0];
  _bgmIdx=0;
  function tick(){
    if(!_audioCtx||_audioState.muted){stopBgm();return;}
    if(_bgmZ!==z)return;
    const Vb=_audioState.bgmVolume;
    const f=track.notes[_bgmIdx%track.notes.length];
    const dur=(60/track.bpm)*(1+(Math.random()-.5)*.12);
    playNote(f,dur,Vb*.4,inst.main);
    if(inst.sub>0)playNote(f*Math.pow(2,inst.sub/12),dur,Vb*.18,'sine');
    if(inst.harm)playNote(f*Math.pow(2,4/12),dur*.7,Vb*.12,'sine');
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
function startBgm(){try{playFullBgm(G&&G.zodiac>-1?G.zodiac:0);}catch(e){try{playFullBgm(0);}catch(e2){}}}

// ── 合成成功音效：欢快短促 ──
function playSynthSuccess(){
  if(!_audioCtx||_audioState.muted)return;
  const now=_audioCtx.currentTime;
  const v=_audioState.sfxVolume;
  [[523,.15,v*.7],[659,.2,v*.5,.12],[784,.25,v*.4,.3],[1047,.3,v*.3,.45]].forEach(function(a){
    var f=a[0],d=a[1],vol=a[2],t=a[3]||0;
    var o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.type='triangle';o.frequency.value=f;
    g.gain.setValueAtTime(vol,now+t);
    g.gain.exponentialRampToValueAtTime(.001,now+t+d);
    o.start(now+t);o.stop(now+t+d+.02);
  });
}

// ── 合成失败音效：低沉轻柔，弱化负面感受 ──
function playSynthFail(){
  if(!_audioCtx||_audioState.muted)return;
  const now=_audioCtx.currentTime;
  const v=_audioState.sfxVolume;
  [[180,.4,v*.4],[160,.5,v*.3,.15],[140,.6,v*.2,.35]].forEach(function(a){
    var f=a[0],d=a[1],vol=a[2],t=a[3]||0;
    var o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(vol,now+t);
    g.gain.exponentialRampToValueAtTime(.001,now+t+d);
    o.start(now+t);o.stop(now+t+d+.02);
  });
}

// ── 召唤音效（单抽） ──
function playSummonSfx(level){
  if(!_audioCtx||_audioState.muted)return;
  var r=level>=10?4:level>=7?3:level>=4?2:1;
  var v=_audioState.sfxVolume;
  var now=_audioCtx.currentTime;
  if(r<=1){
    var o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.type='sine';o.frequency.setValueAtTime(440,now);
    o.frequency.exponentialRampToValueAtTime(660,now+.15);
    g.gain.setValueAtTime(v*.5,now);g.gain.exponentialRampToValueAtTime(.001,now+.4);
    o.start(now);o.stop(now+.45);
    return;
  }
  var freqs=r===4?[600,900,1200,1600]:[500,750,1000,1400];
  freqs.forEach(function(f,i){
    var o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.type='triangle';o.frequency.value=f;
    g.gain.setValueAtTime(v*.4,now+i*.1);
    g.gain.exponentialRampToValueAtTime(.001,now+i*.1+.3);
    o.start(now+i*.1);o.stop(now+i*.1+.35);
  });
}

// ── 装备强化音效 ──
function playEnhanceSfx(){
  if(!_audioCtx||_audioState.muted)return;
  var now=_audioCtx.currentTime;
  var v=_audioState.sfxVolume;
  [[800,.08,v*.6],[1000,.08,v*.4,.06],[1200,.12,v*.3,.12],[1600,.15,v*.2,.2]].forEach(function(a){
    var f=a[0],d=a[1],vol=a[2],t=a[3]||0;
    var o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.type='sawtooth';o.frequency.value=f;
    g.gain.setValueAtTime(vol,now+t);
    g.gain.exponentialRampToValueAtTime(.001,now+t+d);
    o.start(now+t);o.stop(now+t+d+.02);
  });
}

// ── 十连抽音效 ──
function playTenSummonSfx(){
  if(!_audioCtx||_audioState.muted)return;
  var now=_audioCtx.currentTime;
  var v=_audioState.sfxVolume;
  [[660,.08,v*.6],[880,.08,v*.4,.06],[1100,.08,v*.3,.12],[1320,.1,v*.2,.18],[1540,.15,v*.15,.25]].forEach(function(a){
    var f=a[0],d=a[1],vol=a[2],t=a[3]||0;
    var o=_audioCtx.createOscillator(),g=_audioCtx.createGain();
    o.connect(g);g.connect(_audioCtx.destination);
    o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(vol,now+t);
    g.gain.exponentialRampToValueAtTime(.001,now+t+d);
    o.start(now+t);o.stop(now+t+d+.02);
  });
}