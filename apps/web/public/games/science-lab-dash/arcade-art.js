(function(r, f) { const api = f(r, typeof module === 'object' && module.exports ? require('./arcade-art-data') : r.ScienceArcadeArtData); if (typeof module === 'object' && module.exports) module.exports = api; else r.ScienceArcadeArt = api; })(typeof globalThis !== 'undefined' ? globalThis : this, function(r, data) {
  'use strict';
  let atlas;
  function load() {
    r.ScienceChemistryArt?.load();
    if (atlas || !r.Image || !data) return atlas;
    atlas = {image: new r.Image(), ready: false, failed: false};
    atlas.image.onload = () => {atlas.ready = true;};
    atlas.image.onerror = () => {atlas.failed = true;};
    atlas.image.src = './' + data.src;
    return atlas;
  }
  function frame(kind, time = 0, reduced = false) {
    const list = data?.clips[kind];
    if (!list) return null;
    const index = list[reduced ? 0 : Math.floor(Math.max(0, Number.isFinite(time) ? time : 0) * (kind === 'slime' ? 5 : 7)) % list.length];
    return {index, x: index % 4 * 192, y: Math.floor(index / 4) * 192, w: 192, h: 192};
  }
  function creature(ctx, kind, x, y, size, time, reduced) {
    const a = load(), f = frame(kind, time, reduced);
    if (!a?.ready || !f) return false;
    ctx.save();ctx.translate(x,y);if(kind!=='guardian')ctx.scale(-1,1);
    ctx.drawImage(a.image, f.x, f.y, f.w, f.h, -size / 2, -size / 2, size, size);ctx.restore();
    return true;
  }
  function shadow(ctx, x, y, w, h) {
    ctx.save(); ctx.fillStyle = '#01132377'; ctx.beginPath(); ctx.ellipse(x,y,w,h,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  function label(ctx, value, y, color = '#d3f6ff', maxWidth = Infinity, fontScale = 1) {
    ctx.save(); ctx.font = `800 ${16*fontScale}px system-ui,Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const width = Math.min(maxWidth,Math.max(62, ctx.measureText(value).width + 18));
    ctx.fillStyle = '#051c32e8'; ctx.beginPath(); ctx.roundRect(-width/2,y-13*fontScale,width,26*fontScale,9); ctx.fill();
    ctx.fillStyle = color; ctx.fillText(value,0,y,width-12); ctx.restore();
  }
  function ring(ctx, radius, color, time, reduced, dashed = false) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.globalAlpha = .75;
    if (dashed) {ctx.setLineDash([11,9]); ctx.lineDashOffset = reduced ? 0 : -time*24;}
    ctx.beginPath(); ctx.ellipse(0,0,radius,radius*.94,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }
  function player(ctx, game, options) {
    const p = game.player, {time, reduced} = options;
    let state = game.mode === 'play' && !game.pausedForQuestion ? 'run' : game.mode === 'levelClear' ? 'cheer' : 'idle';
    if (p.inv > .5) state = 'hurt';
    else if (p.shootCd > .15 && state === 'run') state = 'inspect';
    else if (state === 'run' && Math.abs(options.laneY - p.y) > 12) state = options.laneY < p.y ? 'rise' : 'fall';
    shadow(ctx,p.x,p.y+74,47,10);
    ctx.save(); ctx.translate(p.x,p.y);
    if (p.inv > 0) ctx.globalAlpha = reduced ? .7 : .65 + Math.sin(time*17)*.25;
    const drawn = r.ScienceChemistryArt?.draw(ctx, 'hero', {x:-47,y:-91,w:94,h:164,state,time,reduced});
    if (!drawn) {
      // Painted atlas is optional: readable equipment and a protective silhouette
      // remain available if an image is blocked or still loading.
      ctx.fillStyle = '#ecfbff'; ctx.strokeStyle = '#386a87'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(-30,-31,60,72,12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f4bf94'; ctx.beginPath(); ctx.arc(0,-49,25,0,Math.PI*2); ctx.fill();
      r.ScienceArcadeIcons?.draw(ctx,'goggles',-30,-76,60);
      ctx.strokeStyle = '#87e9e2'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(-16,38); ctx.lineTo(-24,70); ctx.moveTo(16,38); ctx.lineTo(28,70); ctx.stroke();
    }
    if (p.shield > 0) ring(ctx,85,'#8aeeff',time,reduced,true);
    if (p.magnet > 0) ring(ctx,96,'#7ce3ab',time,reduced,true);
    if (p.slow > 0) ring(ctx,104,'#b9a1fb',time,reduced);
    if (p.double > 0) ring(ctx,112,'#ffda85',time,reduced,true);
    ctx.restore();
  }
  function enemy(ctx, obj, options) {
    const {time,reduced} = options, local = time + (obj.lane || 0)*.27;
    shadow(ctx,0,57,44,8);
    let drawn;
    if (obj.id === 'drone') drawn = r.ScienceChemistryArt?.draw(ctx,'patrol',{x:-65,y:-55,w:130,h:95,time:local,reduced,state:obj.shoot<.25?'bump':'hover',facing:-1});
    else drawn = creature(ctx,obj.id === 'slime' ? 'slime' : 'robot',0,0,obj.id === 'slime'?122:119,local,reduced);
    if (!drawn) {
      ctx.fillStyle = obj.id === 'slime' ? '#72dea1' : '#d0e7ed'; ctx.strokeStyle = '#345174'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.roundRect(-45,-40,90,78,23); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#183347'; ctx.beginPath(); ctx.roundRect(-29,-22,58,34,14); ctx.fill();
      ctx.fillStyle = '#ffd187'; ctx.beginPath(); ctx.arc(-13,-5,5,0,Math.PI*2); ctx.arc(13,-5,5,0,Math.PI*2); ctx.fill();
    }
    if (obj.id === 'glitch') {ctx.save(); ctx.strokeStyle='#d89df0'; ctx.lineWidth=2; ctx.setLineDash([7,6]); ctx.beginPath(); ctx.arc(0,0,57,reduced?0:time,reduced?Math.PI*2:time+Math.PI*1.6); ctx.stroke(); ctx.restore();}
    label(ctx,obj.label,76,obj.id==='slime'?'#b2ffca':'#e3cbff',Infinity,options.labelScale||1);
  }
  function item(ctx,obj,options) {
    const {time,reduced} = options, danger = obj.kind==='hazard', power = obj.kind==='power', question=obj.kind==='question';
    const color = danger?'#ff93ac':question?'#ffda8e':power?'#a8f4cf':'#9ae9fa';
    const pulse = reduced ? 0 : Math.sin(time*3 + (obj.lane||0)) * 2;
    ctx.save(); ctx.translate(0,pulse);
    ctx.fillStyle = danger?'#492139e8':'#0b2d45e8'; ctx.strokeStyle=color; ctx.lineWidth=2;
    ctx.beginPath();
    if (danger) {for(let n=0;n<6;n++){const a=n*Math.PI/3;ctx.lineTo(Math.cos(a)*45,Math.sin(a)*45);}ctx.closePath();}
    else ctx.roundRect(-42,-42,84,84,power?29:18);
    ctx.fill();ctx.stroke();
    ctx.strokeStyle='#ffffff35';ctx.beginPath();ctx.moveTo(-26,-34);ctx.lineTo(17,-34);ctx.stroke();
    r.ScienceArcadeIcons?.draw(ctx, question?'quiz':obj.id,-35,-35,70);
    if (power) ring(ctx,49,color,time,reduced,true);
    ctx.restore();
    label(ctx,question?'Science challenge':obj.label,62,color,Infinity,options.labelScale||1);
  }
  function boss(ctx,game,options) {
    if (!game.bossActive || game.bossHealth<=0) return;
    const {time,reduced,width=1600} = options,size=Math.min(276,width*.36),x=Math.min(options.x||1370,width-size/2-8),y=450;
    ctx.save();ctx.translate(x,y);shadow(ctx,0,size*.5,size*.39,16);
    ring(ctx,size*.46,'#d59afa',time,reduced,true);
    if (!creature(ctx,'guardian',0,0,size,time+game.phase*.3,reduced)) {
      ctx.fillStyle='#77769d';ctx.strokeStyle='#f1c47d';ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,0,90,0,Math.PI*2);ctx.fill();ctx.stroke();
      r.ScienceArcadeIcons?.draw(ctx,'core',-69,-69,138);
    }
    const barWidth=Math.min(236,(width-x-7)*2);
    label(ctx,options.final?'Glitch Experiment':'Core guardian',-size*.56,'#ffdb97',barWidth);
    ctx.fillStyle='#071b2ff0';ctx.beginPath();ctx.roundRect(-barWidth/2,size*.6,barWidth,18,8);ctx.fill();
    const ratio=Math.max(0,Math.min(1,game.bossHealth/game.bossMax));
    if(ratio>0){ctx.fillStyle='#e4a8ff';ctx.beginPath();ctx.roundRect(-barWidth/2+3,size*.6+3,(barWidth-6)*ratio,12,6);ctx.fill();}
    ctx.restore();
  }
  function shot(ctx, object, hostile, time, reduced) {
    ctx.save();ctx.translate(object.x,object.y);ctx.fillStyle=hostile?'#ffc079':'#b2f6ff';ctx.strokeStyle=hostile?'#de628a':'#4bbacb';ctx.lineWidth=3;
    ctx.beginPath();ctx.ellipse(0,0,hostile?17:24,hostile?13:8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.strokeStyle=hostile?'#ffcb89bb':'#9aebeaaa';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(hostile?15:-24,0);ctx.lineTo(hostile?37:-55,0);ctx.stroke();
    ctx.restore();
  }
  function hud(ctx,game,lv,width=1600) {
    if(width<1100){
      ctx.save();ctx.fillStyle='#04182de8';ctx.beginPath();ctx.roundRect(16,20,width-32,130,18);ctx.fill();
      ctx.fillStyle='#effaff';ctx.textAlign='left';ctx.font='900 24px system-ui,Arial';ctx.fillText(`${game.levelIndex+1}. ${lv.title}`,30,54,width-60);
      for(const [i,name,value,target,color]of [[0,'Evidence',game.progress,lv.target,'#8ce9d8'],[1,'Questions',game.questionsAnswered,lv.questionsRequired,'#ffda87']]){const x=30+i*(width/2-16),w=width/2-48;ctx.font='700 20px system-ui,Arial';ctx.fillStyle='#e7f8ff';ctx.fillText(`${name} ${Math.min(value,target)}/${target}`,x,92,w);ctx.fillStyle='#ffffff18';ctx.fillRect(x,106,w,10);ctx.fillStyle=color;ctx.fillRect(x,106,w*Math.min(1,value/target),10);}ctx.restore();return;
    }
    const scale=Math.min(1.5,Math.max(1,width/1600)),right=width*.65,barWidth=width-right-60;
    ctx.save();ctx.fillStyle='#04182de8';ctx.beginPath();ctx.roundRect(30,24,width-60,119,20);ctx.fill();ctx.strokeStyle='#81cbde77';ctx.lineWidth=2;ctx.stroke();
    ctx.textAlign='left';ctx.fillStyle='#e7f9ff';ctx.font=`900 ${Math.round(28*scale)}px system-ui,Arial`;
    ctx.fillText(`${game.levelIndex+1}. ${lv.title}`,55,66,right-95);ctx.fillStyle='#b7ddea';ctx.font=`600 ${Math.round(19*scale)}px system-ui,Arial`;ctx.fillText(lv.concept,55,108,right-95);
    const stats=[['Evidence',game.progress,lv.target,'#8ce9d8'],['Questions',game.questionsAnswered,lv.questionsRequired,'#ffda87']];
    stats.forEach(([name,value,target,color],i)=>{const y=49+i*45;ctx.fillStyle='#effaff';ctx.font=`700 ${Math.round(18*scale)}px system-ui,Arial`;ctx.fillText(`${name} ${Math.min(value,target)}/${target}`,right,y);ctx.fillStyle='#ffffff18';ctx.fillRect(right,y+9,barWidth,9);ctx.fillStyle=color;ctx.fillRect(right,y+9,barWidth*Math.min(1,value/target),9);});ctx.restore();
  }
  return {load,frame,player,enemy,item,boss,shot,hud,data,status:()=>({ready:!!atlas?.ready,failed:!!atlas?.failed})};
});
