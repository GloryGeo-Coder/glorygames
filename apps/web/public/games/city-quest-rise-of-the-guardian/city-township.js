/* City Quest v2.2: deterministic campaign growth; original backgrounds and actor assets stay intact. */
(function(root) {
  'use strict';
  const districts=[{"id":11,"title":"Ubuntu Park Rooftops","theme":"roof","story":"The outer districts need their guardian. Follow the rooftop trail to Ubuntu Park.","bg":"./assets/backgrounds/township-11.png"},{"id":12,"title":"Sunrise Taxi Exchange","theme":"taxi","story":"The taxi crews have marked a safe route. Watch patrols between the shelters.","bg":"./assets/backgrounds/township-12.png"},{"id":13,"title":"Spaza Street Sprint","theme":"market","story":"The traders need the street keepsakes recovered. Use the awnings to watch the road.","bg":"./assets/backgrounds/township-13.png"},{"id":14,"title":"Schoolyard Heights","theme":"roof","story":"Keep the school route clear. The side ledges hold extra supplies.","bg":"./assets/backgrounds/township-14.png"},{"id":15,"title":"Mural Square Stand","theme":"street","story":"The square's taxi guardian has gone rogue. Recover keepsakes before the final showdown.","bg":"./assets/backgrounds/township-15.png"},{"id":16,"title":"Community Garden Bridges","theme":"bridge","story":"The garden bridges connect our neighbourhoods. Time your jumps and carry the keepsakes home.","bg":"./assets/backgrounds/township-16.png"},{"id":17,"title":"Clinic Crossing","theme":"street","story":"The clinic crossing needs a clear path. Take cover when the sentries charge.","bg":"./assets/backgrounds/township-17.png"},{"id":18,"title":"Commuter Rail Run","theme":"rail","story":"The railway guides have left a trail. Use the lifts to cross the depot.","bg":"./assets/backgrounds/township-18.png"},{"id":19,"title":"Recycling Works","theme":"vault","story":"Recover the yard keepsakes and keep the route open for the collection crew.","bg":"./assets/backgrounds/township-19.png"},{"id":20,"title":"Reservoir Guardian","theme":"cave","story":"The reservoir guardian blocks the far gate. Keep your shield for the arena.","bg":"./assets/backgrounds/township-20.png"},{"id":21,"title":"Festival Avenue","theme":"market","story":"Follow the festival lights. Help the neighbourhood recover every keepsake you can.","bg":"./assets/backgrounds/township-21.png"},{"id":22,"title":"Solar Ridge","theme":"roof","story":"The energy crews need the ridge secured. Watch drones over the solar roofs.","bg":"./assets/backgrounds/township-22.png"},{"id":23,"title":"Water Tower Heights","theme":"bridge","story":"The tower routes are high and exposed. Use each checkpoint before crossing.","bg":"./assets/backgrounds/township-23.png"},{"id":24,"title":"Night Market Lights","theme":"market","story":"The night market guides are waiting. Watch for charged shots under the lanterns.","bg":"./assets/backgrounds/township-24.png"},{"id":25,"title":"Guardian Homecoming","theme":"taxi","story":"This is your home. Recover the final keepsakes and free the last taxi guardian.","bg":"./assets/backgrounds/township-25.png"}];
  const profiles={
    roof:[570,540,500,550,510,570],street:[590,560,540,580,530,570],
    market:[590,540,510,560,530,570],taxi:[590,570,540,590,550,570],
    cave:[610,570,530,560,510,570],rail:[590,550,520,570,540,570],
    bridge:[590,540,510,560,530,570],vault:[610,560,520,570,540,570]
  };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const floors=lv=>lv.platforms.filter(p=>!p.move&&!p.ledge);
  function place(lv,x,w=64) {
    const choices=floors(lv).filter(p=>p.w>=w+24);
    const containing=choices.filter(p=>x>=p.x&&x+w<=p.x+p.w).sort((a,b)=>a.y-b.y);
    if(containing.length)return {p:containing[0],x};
    const best=choices.map(p=>({p,x:clamp(x,p.x+12,p.x+p.w-w-12)})).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];
    return best;
  }
  function addTerrain(lv,start,end,theme) {
    const count=Math.ceil((end-start)/410),stride=(end-start)/count,profile=profiles[theme]||profiles.street;
    for(let i=0;i<count;i++) {
      const x=Math.round(start+i*stride),y=i===0?570:profile[(i+lv.id)%profile.length];
      const w=Math.round(stride)-76;
      lv.platforms.push({x,y,w,h:720-y,theme,section:'township'});
      for(let n=0;n<3;n++)lv.coins.push([x+35+n*(w-62)/3,y-76-(n===1?18:0)]);
      if(i%5===2)lv.platforms.push({x:x+70,y:y-110,w:130,h:24,theme,ledge:true});
      if(i%8===5)lv.platforms.push({x:x+50,y:y-90,w:140,h:24,theme,optional:true,move:{axis:'y',min:y-135,max:y-45,speed:45+lv.id%6*3}});
      if(i%6===3)lv.obstacles.push({type:'crate',x:x+130,y:y-60,w:60,h:60});
      if(i%3===1)lv.powers.push([i%2?'heart':'shield',x+55,y-50]);
      if(i%6===4)lv.powers.push(['blaster',x+90,y-50]);
      if(i%7===3)lv.badges.push([x+w-70,y-95]);
      if(i%7===6)lv.tokens.push([x+80,y-100]);
    }
    lv.platforms.push({x:end-280,y:570,w:280,h:150,theme});
  }
  function addEnemies(lv,count,start,end,templates) {
    for(let i=0;i<count;i++) {
      const slot=start+(end-start)*(i+.5)/count;
      const {p,x:placed}=place(lv,slot,72),x=clamp(placed,p.x+12,p.x+p.w-84),template=templates?.[i%templates.length];
      const type=template?.type||(i%4===1?'drone':'walker');
      const role=template?.role||(i%7===4?'burst':i%5===2?'sentry':'patrol');
      const y=p.y-(type==='drone'?205:74);
      lv.enemies.push({
        type,role,x,y,baseY:y,homeY:p.y,minX:Math.max(p.x+10,x-85),maxX:Math.min(p.x+p.w-82,x+95),
        speed:template?.speed||75+lv.id*2,hp:template?.hp||(lv.id>17&&i%3===0?2:1),
        shoot:true,cooldown:Math.max(1.6,template?.cooldown||2.8-(lv.id-11)*.045),shootRange:lv.id===1?460:570
      });
    }
  }
  function addCheckpoints(lv,retain=[]) {
    const limit=lv.width-(lv.boss?1120:560);
    const candidates=[...retain.filter(c=>c.x<limit)];
    for(let mark=1200;mark<limit;mark+=1250) {
      const {p,x:placed}=place(lv,mark,62);let x=placed;
      for(const o of lv.obstacles)if(o.type==='spikes'&&x<o.x+o.w+24&&x+62>o.x-24)x=clamp(o.x-100,p.x+12,p.x+p.w-74);
      if(!candidates.some(c=>Math.abs(c.x-x)<420))candidates.push({x,y:p.y-82});
    }
    const last=place(lv,limit,62);
    if(!candidates.some(c=>Math.abs(c.x-last.x)<300))candidates.push({x:last.x,y:last.p.y-82});
    candidates.sort((a,b)=>a.x-b.x);lv.checkpoints=candidates;
  }
  function finish(lv,theme) {
    lv.platforms.push({x:lv.width-(lv.boss?900:400),y:570,w:lv.boss?900:400,h:150,theme});
    lv.exit={x:lv.width-140,y:470,w:140,h:100};
    if(lv.boss)lv.boss={...lv.boss,x:lv.width-570,y:570-lv.boss.h,minX:lv.width-760,maxX:lv.width-260};
    lv.target=Math.ceil((lv.coins.length+lv.tokens.length+lv.badges.length)*.55);
    lv.mission='Talk to a guide, recover '+lv.target+' city keepsakes'+(lv.boss?', defeat the taxi guardian':'')+', then reach the gate.';
    lv.campaignVersion=22;
  }
  function describeRoute(lv) {
    lv.subtitle='Extended city route. '+lv.enemies.length+' enemies across '+lv.checkpoints.length+' checkpoint beacons.';
  }
  function buildDistrict(d) {
    const width=11000+(d.id-11)*240;
    const boss=[15,20,25].includes(d.id)?{type:'boss_taxi',w:144,h:104,speed:95+d.id,hp:d.id===25?14:12,shoot:true,cooldown:1.5}:null;
    const lv={...d,width,originalWidth:width/2,subtitle:'',mission:'',start:{x:100,y:488},
      exit:null,npcs:[],platforms:[],coins:[],tokens:[],badges:[],powers:[],enemies:[],obstacles:[],boss};
    addTerrain(lv,0,width-(boss?900:0),d.theme);finish(lv,d.theme);
    lv.start.y=lv.platforms[0].y-82;
    const mid=place(lv,width*.46);
    lv.npcs=[{x:260,y:lv.platforms[0].y,kind:'npc',text:d.story},{x:mid.x,y:mid.p.y,kind:'npc_elder',text:'Keep moving between the beacons. Use cover when a sentry charges, and save your shield for a difficult crossing.'}];
    lv.enemyBudget=2*(12+Math.floor((d.id-11)/3));
    addEnemies(lv,lv.enemyBudget,650,width-(boss?1250:550));
    addCheckpoints(lv,[{...lv.start}]);describeRoute(lv);return lv;
  }
  function expand(levels) {
    if(levels.length===25&&levels.every(l=>l.campaignVersion===22))return levels;
    if(levels.length!==10)throw Error('City Quest expansion requires the complete ten-level campaign.');
    for(const lv of levels.slice()) {
      const oldWidth=lv.width,oldEnemies=lv.enemies.map(e=>({...e})),theme=lv.platforms[0].theme;
      lv.previousWidth=oldWidth;lv.previousEnemyCount=oldEnemies.length;lv.width=oldWidth*2;
      const retained=lv.checkpoints.map(c=>({...c}));
      addTerrain(lv,oldWidth-90,lv.width-(lv.boss?900:0),theme);
      finish(lv,theme);
      addEnemies(lv,oldEnemies.length,oldWidth+280,lv.width-(lv.boss?1250:550),oldEnemies);
      addCheckpoints(lv,retained);
      describeRoute(lv);
    }
    levels.push(...districts.map(buildDistrict));return levels;
  }
  const api={expand,districts};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.CityTownship=api;
})(typeof window!=='undefined'?window:globalThis);
