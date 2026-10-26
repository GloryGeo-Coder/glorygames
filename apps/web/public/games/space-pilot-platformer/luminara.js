(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpacePilotLuminara = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const levels = [
    {name:'Whispers in the Glass',zone:'Luminara · Memory Ruins',width:5100,cores:10,enemies:12,boss:false,bg:0,hazard:'prism',objective:'Read memory archives',kind:'archive',count:3,
      tip:'Hold Fire at the archives in route order. Pale crystal sentries guard the ruins; the lower stone path is always solid.',
      briefing:['With Mira back aboard, the Wayfarer follows the recovered portal fragment to Luminara. Crystal ruins repeat the expedition’s lost transmissions.', 'Mira: Read the three archives from west to east. Their memory should reveal where the stolen cores went.'],
      report:'The archives remember a beam network that once kept the dimensional rifts stable.'},
    {name:'The Reflected Path',zone:'Luminara · Mirror Gallery',width:5700,cores:11,enemies:15,boss:false,bg:1,hazard:'prism',objective:'Align mirror receivers',kind:'mirror',count:3,
      tip:'Hold Fire at each mirror during its safe blue cycle. Amber warns before a magenta pulse. Aligned beams silence their emitter group.',
      briefing:['Broken mirrors throw unstable energy through the gallery. ORBIT identifies three receivers beyond the fractured glass.', 'ORBIT: Align each mirror while its emitter is quiet. The reflected beam will lock onto the receiver and shut down that emitter group.'],
      report:'Three reflected beams steady the gallery. Survivors call from a sanctuary caught between dimensions.'},
    {name:'Sanctuary Out of Phase',zone:'Luminara · Echo Refuge',width:6300,cores:12,enemies:18,boss:false,bg:2,hazard:'prism',objective:'Release crystal scholars',kind:'rescue',count:4,
      tip:'Clear sentries within 200 units of each refuge, then hold Fire. Take the solid lower path; flickering upper ledges are optional.',
      briefing:['Luminara’s scholars sheltered here when the core extraction fractured their sanctuary. Sentries mistake every visitor for a raider.', 'Scholar: Clear the sentries and release our four seals. We can help Mira read the coordinates hidden inside the crystal.'],
      report:'The rescued scholars join the Wayfarer’s crew and identify the keys to Luminara’s dimensional bridges.'},
    {name:'Bridges Between Moments',zone:'Luminara · Dimensional Causeway',width:6900,cores:13,enemies:21,boss:false,bg:3,hazard:'prism',objective:'Stabilise phase bridges',kind:'phase',count:3,
      tip:'Hold Fire at a phase anchor while its upper bridge is solid blue. Amber ledges fade next. Stabilised groups stay solid; stone below never fades.',
      briefing:['The causeway flickers between two dimensions. Optional upper bridges offer spare cores, but the ancient stone foundations remain intact.', 'Mira: Match each anchor to the bridge’s solid phase. A full Fire hold will lock that group in place for our return.'],
      report:'The causeway stabilises. A Prism Guardian awakens around the last intact star-core chamber.'},
    {name:'Heart of the Prism',zone:'Luminara · Resonance Chamber',width:7500,cores:15,enemies:24,boss:true,bossName:'Prism Guardian',bossHp:46,bossColor:'#9bf9ff',bg:4,hazard:'prism',objective:'Ground prism anchors',kind:'anchor',count:3,
      tip:'Ground all three anchors before shooting the shielded Guardian. Its bright ring warns of a laser volley. Keep moving after its shield falls.',
      briefing:['The Prism Guardian protects an empty core socket. The Commander’s extraction has trapped it in a defensive loop.', 'ORBIT: Ground the three prism anchors to lower its shield, then disable the Guardian. We must restore the chamber without taking another core.'],
      report:'The Guardian powers down and Luminara’s crystal network steadies. The scholars restore the sanctuary while Mira secures the next portal coordinates aboard the Wayfarer.'}
  ];

  function createLevel(index) {
    const spec=levels[index];
    if(!spec) throw new RangeError('Unknown Luminara mission');
    const platforms=[],cores=[],pickups=[],enemies=[],hazards=[],objectives=[];
    // A guaranteed, gently graded lower route; optional upper routes provide
    // safer combat positions and spare cores without requiring moving lifts.
    for(let x=0,i=0;x<spec.width;i++,x+=300){
      platforms.push({x,y:640+Math.round(Math.sin(i*.72+index)*28),w:250,h:38,type:'ground'});
    }
    const route=platforms.slice();
    const end=route[route.length-1];end.w=spec.width-end.x+80;
    for(let i=2;i<route.length-2;i+=2){
      const p=route[i];
      platforms.push({x:p.x+30,y:p.y-155,w:190,h:26,type:'float'});
      if(i%4===0)platforms.push({x:p.x+180,y:p.y-285,ox:p.x+180,oy:p.y-285,w:155,h:24,type:'phase',active:true,warning:false,control:i%spec.count,phase:i,cycle:5});
    }
    // Every required core is on the reachable lower route; upper-route extras
    // allow missed or contested cores to be replaced without a full backtrack.
    for(let i=0;i<spec.cores+6;i++){
      const p=i<spec.cores?route[1+Math.floor(i*(route.length-3)/spec.cores)]:platforms[route.length+(i-spec.cores)%(platforms.length-route.length)];
      cores.push({x:p.x+100+(i%2)*50,y:p.y-57,r:17,taken:false,phase:i});
    }
    for(let i=0;i<spec.count;i++){
      const p=route[2+Math.floor(i*(route.length-5)/spec.count)];
      objectives.push({x:p.x+175,y:p.y-37,kind:spec.kind,done:false,charge:0,phase:i,cycle:4,label:spec.kind==='rescue'?'Scholar refuge':spec.kind==='archive'?'Memory archive '+(i+1):spec.kind==='anchor'?'Prism anchor':spec.kind==='mirror'?'Mirror '+(i+1):'Phase anchor '+(i+1)});
    }
    for(let i=0;i<spec.enemies;i++){
      const p=route[3+Math.floor(i*(route.length-5)/spec.enemies)];
      const crawler=i%3===1, turret=i%5===4;
      const hp=2+Math.floor(index/2)+(turret?1:0);
      enemies.push({x:p.x+90+(i%2)*70,y:p.y-(crawler?25:95),homeX:p.x+125,homeY:p.y-(crawler?25:95),range:crawler?72:100,vx:(i%2?-1:1)*(crawler?45:65+index*5),w:crawler?54:46,h:crawler?34:42,hp,maxHp:hp,type:turret?'turret':crawler?'crawler':'drone',alive:true,frame:0,shoot:1.3+i%3,phase:i});
    }
    for(let i=1;i<route.length-3;i+=3){
      const p=route[i];
      // Telegraph elevated hazards: jumping is optional at first, deliberate
      // later. No hazard occupies a required objective or checkpoint surface.
      hazards.push({x:p.x+270,y:p.y-170,w:34,h:34,type:spec.hazard,phase:i,cycle:4});
      pickups.push({x:p.x+80,y:p.y-38,r:20,type:i%2?'shield':'time',taken:false,phase:i});
    }
    if(spec.boss){
      const arena=route[route.length-3];
      // An unbroken arena floor prevents an unlucky moving-platform phase
      // from stranding a player during the Guardian fight.
      arena.w=spec.width-arena.x+80;
      route.slice(-2).forEach(p=>{p.y=arena.y;});
      enemies.push({x:spec.width-600,y:arena.y-100,homeX:spec.width-600,homeY:arena.y-100,range:135,w:190,h:140,vx:0,hp:spec.bossHp,maxHp:spec.bossHp,type:'boss',name:spec.bossName,bossColor:spec.bossColor,alive:true,shoot:1.6,frame:0,attackAnim:0,hitFlash:0,phase:0});
    }
    hazards.forEach((h,i)=>{if(index===1){h.control=i%objectives.length;h.phase=objectives[h.control].phase;}});
    return {spec,width:spec.width,platforms,cores,pickups,enemies,hazards,objectives,projectiles:[],enemyShots:[],particles:[],stars:[],planets:[],portal:{x:Math.max(end.x+25,spec.width-125),y:end.y-125,w:70,h:120,open:false}};
  }
  const phaseAt=(time,phase,cycle)=>((time+phase)%cycle+cycle)%cycle;
  function interact(world,player,held,dt,time=0){
    const near=world.objectives.find(n=>!n.done&&Math.abs(player.x-n.x)<75&&Math.abs(player.y-n.y)<70);
    for(const node of world.objectives){if(node!==near&&!node.done)node.charge=0;}
    if(!near)return {near:null,completed:null};
    const kind=world.spec.kind,index=world.objectives.indexOf(near);
    const blocked=kind==='archive'&&world.objectives.some(n=>n.x<near.x&&!n.done)?'Read earlier archive first':
      kind==='rescue'&&world.enemies.some(e=>e.alive&&Math.abs(e.x-near.x)<200)?'Clear nearby sentries first':
      kind==='mirror'&&phaseAt(time,near.phase,4)>=1.9?'Wait for blue emitter, then hold Fire':
      kind==='phase'&&phaseAt(time,index,5)>=2.8?'Wait for solid blue bridge, then hold Fire':null;
    if(blocked){near.charge=0;return {near,completed:null,blocked};}
    near.charge=held?Math.min(.8,near.charge+dt):0;
    if(near.charge>=.8){near.done=true;return {near:null,completed:near};}
    return {near,completed:null};
  }
  function ready(world){return world.objectives.every(n=>n.done);}
  function hazardActive(h,time,world){if(h.control!==undefined&&world?.objectives[h.control]?.done)return false;return phaseAt(time,h.phase,h.cycle)>=2.6;}
  function updateWorld(world,time){
    world.platforms.filter(p=>p.type==='phase').forEach(p=>{
      const locked=world.spec.kind==='phase'&&world.objectives[p.control]?.done,phase=phaseAt(time,p.control,5);
      p.active=locked||phase<3.5;p.warning=!locked&&phase>=2.8&&phase<3.5;
    });
    const boss=world.enemies.find(e=>e.type==='boss');if(boss)boss.shielded=!ready(world);
  }
  function damageMultiplier(enemy,world){return enemy.type==='boss'&&!ready(world)?0:1;}
  return {levels,createLevel,interact,ready,hazardActive,updateWorld,damageMultiplier,name:'Luminara',offset:10,previousName:'Vulcanis',previousKey:'wga_space_pilot_vulcanis_v1',saveKey:'wga_space_pilot_luminara_v1'};
});
