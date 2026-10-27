(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpacePilotNovaX = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const levels = [
    {name:'Where Worlds Collide',zone:'NOVA-X · Fractured Approach',width:5800,cores:13,enemies:20,boss:false,bg:0,hazard:'rift',objective:'Override access locks',kind:'breach',count:3,
      tip:'Override the access locks from west to east. Each locks its optional dimensional ledges in place and silences a rift-emitter group.',
      briefing:['The Wayfarer enters the Rift Citadel’s shadow. Fragments of the five rescued worlds hang around its walls, pulled towards the Commander’s engine.', 'ORBIT: There is a stable lower route between the fragments. Override three access locks in order, and I can open the convoy corridor.'],
      report:'The Citadel’s outer locks fall. The Wayfarer reaches the convoy corridor, but the extraction fleet is closing behind it.'},
    {name:'No One Left in the Rift',zone:'NOVA-X · Convoy Corridor',width:6400,cores:14,enemies:23,boss:false,bg:1,hazard:'rift',objective:'Launch evacuation shuttles',kind:'evac',count:4,
      tip:'Clear sentries within 200 units of each shuttle, then hold Fire to release its boarding clamps. All four groups must reach the Wayfarer.',
      briefing:['The expedition and its allies are scattered across four boarding piers. Mira and Luma organise the rescue while Nova keeps the sentries away.', 'Mira: The Commander wants us to abandon the slowest shuttle. We are bringing everyone. Clear each pier and release its clamps.'],
      report:'Every shuttle reaches the Wayfarer. The expedition is together again, and its engineers identify three missing relays inside the Rift Engine.'},
    {name:'The Engine of Stolen Stars',zone:'NOVA-X · Reactor Spine',width:7100,cores:15,enemies:26,boss:false,bg:2,hazard:'rift',objective:'Complete reactor relay stations',kind:'reactor',count:6,
      tip:'Carry one numbered relay fuse to its matching socket. Install only during the blue cooling interval; amber means wait. Finish the pair before collecting another fuse.',
      briefing:['The Rift Engine has begun drawing the rescued worlds back towards the Citadel. Nova must restore its safety circuits rather than destroy the trapped star cores.', 'Mira: Take each relay fuse to its matching socket. Wait for the blue cooling interval before you install it. We can shut this engine down safely.'],
      report:'The safety circuits return. ORBIT can now reach the five world tethers without overloading their star cores.'},
    {name:'Five Roads Home',zone:'NOVA-X · World-Tether Array',width:7800,cores:16,enemies:29,boss:false,bg:3,hazard:'rift',objective:'Stabilise world tethers',kind:'network',count:5,
      tip:'Stabilise Asterion, Vulcanis, Luminara, Cryon and Verdantis in route order. Hold Fire only during each tether’s blue interval.',
      briefing:['Five luminous roads stretch across the array. Each leads to a world Nova has helped to save, and every road is beginning to buckle.', 'Luma: Follow the worlds in the order you found them. Hold each blue signal steady. The people behind us are keeping their end of every gate open.'],
      report:'The five tethers stabilise. The Commander abandons the failing control array and retreats to the heart of the Rift Engine.'},
    {name:'The Last Gate',zone:'NOVA-X · Rift Engine Heart',width:8800,cores:18,enemies:32,boss:true,bossName:'NOVA-X Commander',bossHp:78,bossColor:'#f381e4',bg:4,hazard:'rift',objective:'Secure the escape sequence',kind:'finale',count:7,
      tip:'Break three Aegis feeds, defeat the Commander during blue core windows, seal three gate controls, then activate the Wayfarer beacon. The home portal opens only after every step.',
      briefing:['The Commander waits above the star cores, surrounded by fragments of every world. The expedition is aboard the Wayfarer, but the final gate still belongs to the Rift Engine.', 'Mira: Cut the three Aegis feeds first. After the Commander falls, seal the gate controls and call us in. ORBIT will guide the convoy home.'],
      report:'The NOVA-X Commander falls. Nova seals the last gate controls and stabilises the network. The rescued expedition and its allies cross safely aboard the Wayfarer. With the star cores restored and the six worlds free, Nova guides the ship home.'}
  ];

  function createLevel(index) {
    const spec=levels[index];
    if(!spec) throw new RangeError('Unknown NOVA-X mission');
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
    const worlds=['Asterion','Vulcanis','Luminara','Cryon','Verdantis'];
    for(let i=0;i<spec.count;i++){
      const p=route[2+Math.floor(i*(route.length-5)/spec.count)];
      const role=spec.kind==='reactor'?(i%2?'socket':'source'):spec.kind==='finale'?(i<3?'breaker':i<6?'seal':'launch'):spec.kind;
      const label=spec.kind==='reactor'?(i%2?'Relay socket ':'Relay fuse ')+(Math.floor(i/2)+1):spec.kind==='finale'?(i<3?'Aegis feed '+(i+1):i<6?'Gate seal '+(i-2):'Wayfarer beacon'):spec.kind==='network'?worlds[i]+' tether':(spec.kind==='evac'?'Shuttle clamp ':'Access lock ')+(i+1);
      objectives.push({x:p.x+175,y:p.y-37,kind:spec.kind,role,done:false,charge:0,phase:i,cycle:6,group:Math.floor(i/2),label});
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
      const arena=route[route.length-4];
      // An unbroken arena floor prevents an unlucky moving-platform phase
      // from stranding a player during the Commander fight.
      arena.w=spec.width-arena.x+80;
      route.slice(-3).forEach(p=>{p.y=arena.y;});
      enemies.push({x:spec.width-600,y:arena.y-100,homeX:spec.width-600,homeY:arena.y-100,range:135,w:190,h:140,vx:0,hp:spec.bossHp,maxHp:spec.bossHp,type:'boss',name:spec.bossName,bossColor:spec.bossColor,alive:true,shoot:1.6,frame:0,attackAnim:0,hitFlash:0,phase:0});
    }
    if(spec.kind==='finale'){
      const floor=route[route.length-4].y;
      [2,10,19].forEach((at,i)=>{objectives[i].x=route[at].x+175;objectives[i].y=route[at].y-37;});
      [spec.width-880,spec.width-620,spec.width-350,spec.width-140].forEach((x,i)=>{objectives[i+3].x=x;objectives[i+3].y=floor-37;});
    }
    hazards.forEach((h,i)=>{h.control=spec.kind==='reactor'?(i%3)*2+1:spec.kind==='finale'?i%3:i%objectives.length;h.phase=objectives[h.control].phase;});
    if(spec.kind==='breach'||spec.kind==='network')for(let i=0;i<objectives.length;i++){const n=objectives[i];platforms.push({x:n.x-110,y:n.y-145,w:240,h:24,type:'phase',control:i,phase:i,active:true});}
    return {spec,width:spec.width,platforms,cores,pickups,enemies,hazards,objectives,projectiles:[],enemyShots:[],particles:[],stars:[],planets:[],portal:{x:Math.max(end.x+25,spec.width-125),y:end.y-125,w:70,h:120,open:false}};
  }
  const phaseAt=(time,phase=0,cycle=6)=>{const value=(time+phase)%cycle;return value<0?value+cycle:value;};
  function carriedFuse(world){return world.spec.kind==='reactor'?world.objectives.find(n=>n.role==='source'&&n.done&&!world.objectives[n.group*2+1].done)?.group??null:null;}
  const commanderAlive=w=>w.enemies.some(e=>e.type==='boss'&&e.alive);
  const aegisDown=w=>w.objectives.filter(n=>n.role==='breaker').every(n=>n.done);
  function interact(world,player,held,dt,time=0){
    const near=world.objectives.find(n=>!n.done&&Math.abs(player.x-n.x)<75&&Math.abs(player.y-n.y)<70);
    for(const node of world.objectives)if(node!==near&&!node.done)node.charge=0;
    if(!near)return {near:null,completed:null};
    const kind=world.spec.kind,carried=carriedFuse(world),earlier=world.objectives.find(n=>n.x<near.x&&!n.done);
    const blocked=kind==='breach'&&earlier?'Override earlier access lock first':
      kind==='evac'&&world.enemies.some(e=>e.alive&&Math.abs(e.x-near.x)<200)?'Clear nearby sentries first':
      kind==='reactor'&&near.role==='source'&&carried!==null?'Install fuse '+(carried+1)+' before taking another':
      kind==='reactor'&&near.role==='socket'&&!world.objectives[near.group*2].done?'Collect relay fuse '+(near.group+1)+' first':
      kind==='reactor'&&near.role==='socket'&&phaseAt(time,near.phase,6)>=3?'Wait for blue cooling interval':
      kind==='network'&&earlier?'Stabilise '+earlier.label+' first':
      kind==='network'&&phaseAt(time,near.phase,6)>=3?'Wait for blue tether interval':
      kind==='finale'&&near.role!=='breaker'&&commanderAlive(world)?'Defeat the Commander before sealing the gate':
      kind==='finale'&&near.role==='launch'&&!world.objectives.filter(n=>n.role==='seal').every(n=>n.done)?'Seal all three gate controls first':null;
    if(blocked){near.charge=0;return {near,completed:null,blocked};}
    near.charge=held?Math.min(.8,near.charge+dt):0;
    if(near.charge>=.8){near.done=true;return {near:null,completed:near};}
    return {near,completed:null};
  }
  const ready=world=>world.objectives.every(n=>n.done);
  function hazardActive(h,time,world){if(world?.spec.kind==='finale'&&!commanderAlive(world))return false;if(world?.objectives[h.control]?.done)return false;return phaseAt(time,h.phase,6)>=3.8;}
  function updateWorld(world,time){
    world.platforms.filter(p=>p.type==='phase').forEach(p=>{const phase=phaseAt(time,p.phase,6);p.active=world.objectives[p.control]?.done||phase<4.5;p.warning=!world.objectives[p.control]?.done&&phase>=3.8&&phase<4.5;});
    world.carriedFuse=carriedFuse(world);world.evacuated=world.spec.kind==='evac'?world.objectives.filter(n=>n.done).length:0;
    const boss=world.enemies.find(e=>e.type==='boss');
    if(boss){const enraged=boss.hp<boss.maxHp*.5,phase=phaseAt(time,0,enraged?5.5:7),open=enraged?2.6:3.5;boss.shielded=!aegisDown(world)||phase>=open;boss.coreWarning=aegisDown(world)&&phase>=open-.7&&phase<open;world.escapeReady=!boss.alive;}
  }
  function damageMultiplier(enemy,world){return enemy.type==='boss'&&(!aegisDown(world)||enemy.shielded!==false)?0:1;}
  return {levels,createLevel,interact,ready,hazardActive,updateWorld,carriedFuse,damageMultiplier,aegisDown,commanderAlive,shieldHint:'Cut Aegis feeds, then fire during blue core windows',name:'NOVA-X',offset:25,previousName:'Verdantis',previousKey:'wga_space_pilot_verdantis_v1',saveKey:'wga_space_pilot_novax_v1',winTitle:'Starfall Network Restored'};
});
