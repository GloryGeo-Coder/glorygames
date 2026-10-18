/* Extends the original ten districts without replacing their backgrounds or identities. */
(function(root) {
  'use strict';
  function extend(levels) {
    for (const lv of levels) {
      const originalWidth = lv.width;
      lv.originalWidth = originalWidth;
      const length = 2100 + Math.floor((lv.id - 1) / 2) * 160;
      lv.width += length;
      const theme = ['roof', 'street', 'market', 'taxi', 'cave', 'taxi', 'rail', 'bridge', 'vault', 'taxi'][lv.id-1];
      lv.platforms.forEach(p => { p.theme = theme; });
      // Permanent stepping piers make the essential route independent of lift timing.
      const floors = lv.platforms.filter(p => !p.move).sort((a,b) => a.x-b.x);
      for (let i=1; i<floors.length; i++) {
        const a=floors[i-1], b=floors[i], gap=b.x-(a.x+a.w);
        if (gap > 140) {
          const count=Math.ceil(gap/190);
          for(let n=1;n<count;n++) lv.platforms.push({x:a.x+a.w+gap*n/count-85,y:a.y+(b.y-a.y)*n/count,w:170,h:720-a.y,theme,bridge:true});
        }
      }
      const end=floors.at(-1), start=originalWidth-100;
      const chunks=6, stride=length/chunks;
      for(let i=0;i<chunks;i++) {
        const x=Math.round(start+i*stride), y=[end.y,540,500,550,510,570][i];
        const w=Math.round(stride-76);
        lv.platforms.push({x,y,w,h:720-y,theme});
        for(let n=0;n<3;n++) lv.coins.push([x+55+n*(w-80)/3,y-80-(n===1?32:0)]);
        lv.enemies.push({type:i%3===1 && lv.id>1?'drone':'walker',x:x+120,y:y-74,minX:x+35,maxX:x+w-70,speed:70+lv.id*4,hp:lv.id>6?2:1,shoot:true,cooldown:Math.max(1.5,2.8-lv.id*.1),role:lv.id>=5&&i===2?'sentry':lv.id>=8&&i===4?'burst':'patrol'});
        if(i===1||i===4) lv.platforms.push({x:x+70,y:y-110,w:130,h:24,theme,ledge:true});
        if(i===2||i===4) lv.powers.push([i===2?'heart':'blaster',x+50,y-48]);
      }
      lv.platforms.push({x:lv.width-230,y:570,w:230,h:150,theme});
      lv.exit={...lv.exit,x:lv.width-140,y:470,w:140,h:100};
      const stable=lv.platforms.filter(p=>!p.move&&!p.ledge).sort((a,b)=>a.x-b.x);
      const surface=(x,w=1) => stable.filter(p=>x>=p.x&&x+w<=p.x+p.w).sort((a,b)=>a.y-b.y)[0];
      const place=(x,w=1) => surface(x,w) || stable.filter(p=>p.w>=w+24).reduce((best,p)=>{
        const d=Math.abs(Math.max(p.x+12,Math.min(x,p.x+p.w-w-12))-x);
        return !best||d<best.d?{...p,d}:best;
      },null);
      // Align patrol feet and hazards with collision surfaces; original art has large alpha padding.
      for(const e of lv.enemies) {
        const p=place(e.x,64);
        e.x=Math.max(p.x+8,Math.min(e.x,p.x+p.w-72));
        e.minX=Math.max(p.x+8,Math.min(e.minX,e.x));
        e.maxX=Math.max(e.minX,Math.min(e.maxX,p.x+p.w-72));
        e.y=p.y-(e.type==='drone'?205:74);
        e.baseY=e.y; e.homeY=p.y; e.shootRange=lv.id<3?460:570;
        e.role=e.role||'patrol'; e.cooldown=Math.max(1.5,e.cooldown||2.5); 
      }
      for(const o of lv.obstacles) {
        if(o.type==='spikes')o.w=Math.min(o.w,96);
        const margin=o.type==='spikes'?120:90;
        const p=place(o.x,o.w+margin*2); o.x=Math.max(p.x+margin,Math.min(o.x,p.x+p.w-o.w-margin));o.y=p.y-o.h;
        if(o.moving) {o.minX=Math.max(p.x+6,Math.min(o.minX,o.x));o.maxX=Math.max(o.minX,Math.min(o.maxX,p.x+p.w-o.w-6));}
      }
      for(const list of [lv.coins,lv.tokens,lv.badges]) for(const point of list) {
        const p=place(point[0],34);
        point[0]=Math.max(p.x+8,Math.min(point[0],p.x+p.w-42));
        point[1]=Math.max(p.y-165,Math.min(point[1],p.y-50));
      }
      for(const power of lv.powers) {
        const p=place(power[1],42);power[1]=Math.max(p.x+8,Math.min(power[1],p.x+p.w-50));power[2]=p.y-50;
      }
      for(const npc of lv.npcs) {const p=place(npc.x);npc.y=p.y;}
      const spawnSurface=place(lv.start.x,62);lv.start.y=spawnSurface.y-82;
      lv.checkpoints=[{x:lv.start.x,y:lv.start.y}];
      for(const mark of [originalWidth*.5,originalWidth+length*.4,lv.width-560]) {
        const p=place(mark,62), x=Math.max(p.x+12,Math.min(mark,p.x+p.w-74));
        lv.checkpoints.push({x,y:p.y-82});
      }
      if(lv.boss) {
        const arenaX=lv.width-900;
        lv.platforms.push({x:arenaX,y:570,w:900,h:150,theme});
        lv.boss={...lv.boss,x:lv.width-570,y:570-lv.boss.h,minX:lv.width-760,maxX:lv.width-260};
        // No minor patrols on the boss's final recovery platform.
        lv.enemies=lv.enemies.filter(e=>e.x<arenaX-100);
      }
      lv.target=Math.ceil((lv.coins.length+lv.tokens.length+lv.badges.length)*.60);
      lv.mission='Talk to a guide, recover '+lv.target+' city keepsakes'+(lv.boss?', defeat the taxi guardian':'')+', then reach the gate.';
      lv.subtitle+=' Checkpoints mark your route.';
    }
    return levels;
  }
  if(typeof module==='object'&&module.exports)module.exports={extend};else root.CityCampaign={extend};
})(typeof window!=='undefined'?window:globalThis);
