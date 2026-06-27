// ===== UI.js - 生肖天机 =====

function renderAch(){
  const p=document.getElementById('achPanel');
  const rank=getRank();
  const done=_unlocked.size,total=ACHIEVEMENTS.length;
  const pct=Math.round(done/total*100);
  const cnt=new Set(G.dragons.map(d=>d.level)).size;
  p.innerHTML='<div style="padding:20px 16px 80px;">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'+
      '<div style="font-size:16px;font-weight:700;">🏅 成就</div>'+
      '<div style="font-size:12px;color:#888;">'+done+'/'+total+'</div>'+
      '<div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeAchPanel()">✕</div>'+
    '</div>'+
    '<div style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:14px;padding:16px;margin-bottom:16px;text-align:center;">'+
      '<div style="font-size:40px;margin-bottom:4px;">'+rank.icon+'</div>'+
      '<div style="font-size:18px;font-weight:700;color:'+rank.color+';">'+rank.title+'</div>'+
      '<div style="font-size:11px;color:#888;margin-top:4px;">已集齐 '+cnt+' 种灵兽 · '+pct+'% 完成</div>'+
      '<div style="margin-top:10px;height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;">'+
        '<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#ffd700,#ff8c00);border-radius:3px;"></div>'+
      '</div>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
    ACHIEVEMENTS.map(a=>{
      const d=_unlocked.has(a.id);
      return '<div style="background:'+(d?'rgba(255,215,0,.06)':'rgba(255,255,255,.02)')+';border:1px solid '+(d?'rgba(255,215,0,.25)':'rgba(255,255,255,.06)')+';border-radius:12px;padding:12px 8px;text-align:center;'+(d?'':'opacity:.4')+'">'+
        '<div style="font-size:26px;margin-bottom:4px;">'+a.icon+'</div>'+
        '<div style="font-size:12px;font-weight:600;color:'+(d?'#ffd700':'#666')+';">'+a.title+'</div>'+
        '<div style="font-size:10px;color:#555;margin-top:3px;">'+a.desc+'</div>'+
      '</div>';
    }).join('')+
    '</div></div>';
}
function openAchPanel(){renderAch();document.getElementById('achPanel').classList.add('open');}
function closeAchPanel(){document.getElementById('achPanel').classList.remove('open');}
function initAch(){if(G.created)setTimeout(checkAch,500);}

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
function renderRankPanel(){
  const p=document.getElementById('rankPanel');
  const meName=G.zodiac>=0?ZOD_E[G.zodiac]+'的'+FATE_E[G.fate]:'神秘玩家';
  const list=getRankList();
  const myRank=list.findIndex(e=>e.name===meName)+1;
  p.innerHTML='<div style="padding:20px 16px 80px;">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'+
      '<div style="font-size:16px;font-weight:700;">🏅 天机榜</div>'+
      '<div style="font-size:12px;color:#888;cursor:pointer;" onclick="closeRankPanel()">✕</div>'+
    '</div>'+
    '<div style="background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:14px;padding:14px;margin-bottom:16px;text-align:center;">'+
      '<div style="font-size:12px;color:#888;margin-bottom:6px;">我的排名</div>'+
      '<div style="font-size:36px;font-weight:900;color:#ffd700;">'+(myRank||'—')+'</div>'+
      '<div style="font-size:12px;color:#888;margin-top:4px;">当前金币：'+fmtNum(G.coins)+'</div>'+
    '</div>'+
    '<div style="background:rgba(0,0,0,.2);border-radius:12px;overflow:hidden;">'+
    list.map((e,i)=>{
      const rank=i+1;
      const isMe=e.name===meName;
      const isTop3=rank<=3;
      const bg=isTop3?'rgba(255,215,0,.06)':isMe?'rgba(255,215,0,.03)':'transparent';
      const rankicon=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':rank;
      const rcolor=rank===1?'#ffd700':rank===2?'#c0c0c0':rank===3?'#cd7f32':'#888';
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:'+bg+';border-bottom:1px solid rgba(255,255,255,.04);'+(isMe?'font-weight:700;':'')+'">'+
        '<div style="font-size:16px;width:24px;text-align:center;color:'+rcolor+';">'+rankicon+'</div>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-size:12px;color:'+(isMe?'#ffd700':'#ccc')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+e.name+(isMe?' (我)':'')+'</div>'+
          '<div style="font-size:10px;color:#555;margin-top:2px;">'+e.date+'</div>'+
        '</div>'+
        '<div style="font-size:12px;color:#ffd700;font-weight:600;white-space:nowrap;">'+fmtNum(e.coins)+'</div>'+
      '</div>';
    }).join('')+
    '</div>'+
    '<div style="margin-top:12px;font-size:11px;color:#555;text-align:center;background:rgba(255,255,255,.02);border-radius:10px;padding:10px;">'+
      '🏆 仅记录本设备数据，可联系作者竞争榜首！'+
    '</div>'+
  '</div>';
}
function openRankPanel(){saveRankScore();renderRankPanel();document.getElementById('rankPanel').classList.add('open');}
function closeRankPanel(){document.getElementById('rankPanel').classList.remove('open');}

function openHandbook(){renderHandbook();document.getElementById('handbookPanel').classList.add('open');}
function closeHandbook(){document.getElementById('handbookPanel').classList.remove('open');}

function openCultPanel(){calcCultQi();renderCultPanel();document.getElementById('cultPanel').classList.add('open');}
function closeCultPanel(){document.getElementById('cultPanel').classList.remove('open');}
