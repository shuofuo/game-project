// ===== AUDIO.js - 生肖天机 =====

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

const _ZODIAC_BGM=[
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
  const inst=_INSTRUMENTS[track.inst]||_INSTRUMENTS[0];
  _bgmIdx=0;
  function tick(){
    if(!_audioCtx||_audioState.muted){stopBgm();return;}
    if(_bgmZ!==z)return;
    const Vb=_audioState.bgmVolume;
    const f=track.notes[_bgmIdx%track.notes.length];
    const dur=(60/track.bpm)*(1+(Math.random()-.5)*.12); // BPM+时值随机微扰12%
    // 主音
    playNote(f,dur,Vb*.4,inst.main);
    // 副音（叠音）
    if(inst.sub>0)playNote(f*Math.pow(2,inst.sub/12),dur,Vb*.18,'sine');
    // 和声
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

