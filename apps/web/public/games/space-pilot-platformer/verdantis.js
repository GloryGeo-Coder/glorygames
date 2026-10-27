(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpacePilotVerdantis = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const levels = [
    {name:'The Forest That Remembers',zone:'Verdantis · Luminous Canopy',width:5600,cores:12,enemies:16,boss:false,bg:0,hazard:'spore',objective:'Restore living root nodes',kind:'root',count:3,
      tip:'Hold Fire at the three root nodes. Each restored node calms a spore-vent group. Amber warns before a harmful magenta cloud.',
      briefing:['Beyond Cryon, the Wayfarer reaches a planet lit by rivers of living light. Its forests are closing around a machine that has taken the world’s star core.', 'Mira: The roots carry power and memories. Reconnect three nodes so the forest can guide us safely through the spores.'],
      report:'The root network wakes. A repeating call answers from a grove beyond the canopy.'},
    {name:'An Answer in the Leaves',zone:'Verdantis · Echo Grove',width:6200,cores:13,enemies:19,boss:false,bg:1,hazard:'spore',objective:'Answer grove resonators',kind:'echo',count:3,
      tip:'Hold Fire during a resonator’s blue listening interval. Amber means its call is about to change; wait for the next blue interval.',
      briefing:['The call belongs to Verdantis’s pathfinders, who use the living forest to speak across valleys. Nova follows their signal through drifting lights.', 'ORBIT: Match each resonator’s blue listening interval. Keep the signal steady for a full hold and the pathfinders will hear us.'],
      report:'A pathfinder named Luma answers. Her people sheltered members of the expedition before the Commander’s machines sealed their sanctuary.'},
    {name:'A Promise Beneath the Leaves',zone:'Verdantis · Pathfinder Sanctuary',width:6800,cores:14,enemies:22,boss:false,bg:2,hazard:'spore',objective:'Free pathfinder shelters',kind:'rescue',count:4,
      tip:'Clear laser sentries within 200 units of each shelter, then hold Fire. The rescued pathfinders calm their nearby spore vents.',
      briefing:['The sanctuary shelters four pathfinder groups and the expedition members they protected. Laser sentries have rooted themselves around the escape trail.', 'Luma: Our people kept your crew safe. Clear the sentries, and we will show you the living road to the stolen core.'],
      report:'The pathfinders join the rescue convoy. Their seed carriers can restore the broken causeway without draining the forest.'},
    {name:'Seeds Across the Rift',zone:'Verdantis · Living Causeway',width:7400,cores:15,enemies:25,boss:false,bg:3,hazard:'spore',objective:'Complete seed stations',kind:'seed',count:6,
      tip:'Collect one marked seed by holding Fire, then carry it to its matching numbered planter. Finish that pair before taking another seed. Planted vines open optional upper bridges.',
      briefing:['A broken causeway separates the convoy from the world heart. Its suspended vine bridges have withered under the extractor’s shadow.', 'Luma: Take each seed to its matching planter. One living seed is enough to wake an entire root span. The lower trail remains safe for the convoy.'],
      report:'The causeway blooms. Beneath it, the Brood Titan is turning the last extraction pods towards the planet’s heart.'},
    {name:'The Heart That Will Not Fall',zone:'Verdantis · World Heart',width:8200,cores:18,enemies:28,boss:true,bossName:'Brood Titan',bossHp:64,bossColor:'#e36bde',bg:4,hazard:'spore',objective:'Sever extraction pods',kind:'pod',count:3,
      tip:'Sever all three extraction pods. The Titan exposes its heart after each laser volley, then braces behind its armour before firing again.',
      briefing:['The Brood Titan stands over Verdantis’s star core, wrapped in stolen roots. Three extraction pods feed its protective armour.', 'Mira: Sever the pods first. Fire into the green heart after a volley; amber means the Titan is bracing. We can free the core without hurting the forest.'],
      report:'The Brood Titan collapses and the living roots return the star core to its chamber. Luma guides the rescued convoy to the Wayfarer. Five worlds now share one route home, and ORBIT finally locates the NOVA-X Rift Citadel.'}
  ];

  function createLevel(index) {
    const spec=levels[index];
    if(!spec) throw new RangeError('Unknown Verdantis mission');
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
      if(i%4===0)platforms.push({x:p.x+180,y:p.y-285,ox:p.x+180,oy:p.y-285,w:155,h:24,type:'moving',speed:.6,range:45,phase:i});
    }
    // Every required core is on the reachable lower route; upper-route extras
    // allow missed or contested cores to be replaced without a full backtrack.
    for(let i=0;i<spec.cores+6;i++){
      const p=i<spec.cores?route[1+Math.floor(i*(route.length-3)/spec.cores)]:platforms[route.length+(i-spec.cores)%(platforms.length-route.length)];
      cores.push({x:p.x+100+(i%2)*50,y:p.y-57,r:17,taken:false,phase:i});
    }
    for(let i=0;i<spec.count;i++){
      const p=route[2+Math.floor(i*(route.length-5)/spec.count)];
      objectives.push({x:p.x+175,y:p.y-37,kind:spec.kind,done:false,charge:0,phase:i,cycle:6,group:Math.floor(i/2),role:spec.kind==='seed'?(i%2?'planter':'source'):spec.kind,label:spec.kind==='seed'?(i%2?'Planter ':'Seed ')+(Math.floor(i/2)+1):(spec.kind==='rescue'?'Pathfinder shelter ':spec.kind==='pod'?'Extraction pod ':spec.kind==='echo'?'Resonator ':'Root node ')+(i+1)});
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
      hazards.push({x:p.x+270,y:p.y-170,w:34,h:34,type:spec.hazard,phase:i,cycle:6});
      pickups.push({x:p.x+80,y:p.y-38,r:20,type:i%2?'shield':'time',taken:false,phase:i});
    }
    if(spec.boss){
      const arena=route[route.length-3];
      // An unbroken arena floor prevents an unlucky moving-platform phase
      // from stranding a player during the Titan fight.
      arena.w=spec.width-arena.x+80;
      route.slice(-2).forEach(p=>{p.y=arena.y;});
      enemies.push({x:spec.width-600,y:arena.y-100,homeX:spec.width-600,homeY:arena.y-100,range:135,w:190,h:140,vx:0,hp:spec.bossHp,maxHp:spec.bossHp,type:'boss',name:spec.bossName,bossColor:spec.bossColor,alive:true,shoot:1.6,frame:0,attackAnim:0,hitFlash:0,phase:0});
    }
    hazards.forEach((h,i)=>{h.control=spec.kind==='seed'?(i%3)*2+1:i%objectives.length;h.phase=objectives[h.control].phase;});
    if(spec.kind==='seed'){for(let group=0;group<3;group++){const n=objectives[group*2+1];platforms.push({x:n.x-110,y:n.y-145,w:240,h:24,type:'phase',control:group*2+1,active:false});}}
    return {spec,width:spec.width,platforms,cores,pickups,enemies,hazards,objectives,projectiles:[],enemyShots:[],particles:[],stars:[],planets:[],portal:{x:Math.max(end.x+25,spec.width-125),y:end.y-125,w:70,h:120,open:false}};
  }
  const phaseAt=(time,phase,cycle)=>{const value=(time+phase)%cycle;return value<0?value+cycle:value;};
  function carriedSeed(world){return world.spec.kind==='seed'?world.objectives.find(n=>n.role==='source'&&n.done&&!world.objectives[n.group*2+1].done)?.group??null:null;}
  function interact(world,player,held,dt,time=0){
    const near=world.objectives.find(n=>!n.done&&Math.abs(player.x-n.x)<75&&Math.abs(player.y-n.y)<70);
    for(const node of world.objectives){if(node!==near&&!node.done)node.charge=0;}
    if(!near)return {near:null,completed:null};
    const kind=world.spec.kind,carried=carriedSeed(world);
    const blocked=kind==='rescue'&&world.enemies.some(e=>e.alive&&Math.abs(e.x-near.x)<200)?'Clear nearby sentries first':
      kind==='echo'&&phaseAt(time,near.phase,6)>=3?'Wait for blue listening interval':
      kind==='seed'&&near.role==='source'&&carried!==null?'Plant seed '+(carried+1)+' before taking another':
      kind==='seed'&&near.role==='planter'&&!world.objectives[near.group*2].done?'Collect seed '+(near.group+1)+' first':null;
    if(blocked){near.charge=0;return {near,completed:null,blocked};}
    near.charge=held?Math.min(.8,near.charge+dt):0;
    if(near.charge>=.8){near.done=true;return {near:null,completed:near};}
    return {near,completed:null};
  }
  function ready(world){return world.objectives.every(n=>n.done);}
  function hazardActive(h,time,world){if(h.control!==undefined&&world?.objectives[h.control]?.done)return false;return phaseAt(time,h.phase,h.cycle)>=4;}
  function updateWorld(world){
    world.platforms.filter(p=>p.type==='phase').forEach(p=>{p.active=world.objectives[p.control]?.done===true;});
    // Cargo and allies derive solely from completed objective flags. Reloads
    // cannot consume a seed twice or create an extra reward/ally.
    world.carriedSeed=carriedSeed(world);
    world.allies=world.spec.kind==='rescue'?world.objectives.filter(n=>n.done).map(n=>({x:n.x,y:n.y})):[];
    const boss=world.enemies.find(e=>e.type==='boss');
    if(boss){boss.shielded=!ready(world)||boss.shoot<=.5;boss.heartWarning=ready(world)&&boss.shoot>.5&&boss.shoot<.85;}
  }
  function damageMultiplier(enemy,world){return enemy.type==='boss'&&(!ready(world)||enemy.shielded!==false)?0:1;}
  return {levels,createLevel,interact,ready,hazardActive,updateWorld,carriedSeed,damageMultiplier,shieldHint:'Sever pods, then fire at the heart after a volley',name:'Verdantis',offset:20,previousName:'Cryon',previousKey:'wga_space_pilot_cryon_v1',saveKey:'wga_space_pilot_verdantis_v1'};
});
