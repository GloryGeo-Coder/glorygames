(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpacePilotCryon = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const levels = [
    {name:'A Light Beneath the Ice',zone:'Cryon · Aurora Caverns',width:5400,cores:11,enemies:13,boss:false,bg:0,hazard:'frost',objective:'Restore thermal relays',kind:'heater',count:3,
      tip:'Ice carries your momentum. Hold Fire at each thermal relay to thaw its route section and silence its frost jets. Brake before a ledge.',
      briefing:['Mira follows the scholars’ coordinates into Cryon’s frozen orbit. Beneath the ice, a weak expedition beacon still answers the Wayfarer.', 'ORBIT: The heating grid has failed. Restore three relays to melt the route and give the rescue team a safe landing.'],
      report:'Warm light returns to the caverns. The expedition signal leads to a derelict orbital station.'},
    {name:'The Silent Station',zone:'Cryon · Derelict Dock',width:6000,cores:12,enemies:16,boss:false,bg:1,hazard:'frost',objective:'Power docking relays',kind:'airlock',count:3,
      tip:'Restore docking relays from west to east. Each powered relay isolates a frost-jet group. Upper service lifts offer spare cores.',
      briefing:['The station drifts without navigation lights. Its emergency power bus was severed as the Commander’s fleet took Cryon’s core.', 'Mira: Bring the three docking relays online in route order. The next relay cannot start until power reaches it.'],
      report:'The station wakes. A crew manifest identifies four occupied cryopods in the rescue bay.'},
    {name:'Warmth for the Lost',zone:'Cryon · Cryopod Refuge',width:6600,cores:13,enemies:19,boss:false,bg:2,hazard:'frost',objective:'Release expedition cryopods',kind:'rescue',count:4,
      tip:'Clear drones within 200 units before holding Fire at a cryopod. The pod’s heater then isolates nearby frost jets.',
      briefing:['Four expedition specialists survived in emergency cryopods, but the station’s sentry drones still defend the frozen corridors.', 'Nova: Clear the drones before waking anyone. The Wayfarer needs these people, not another abandoned rescue signal.'],
      report:'The specialists join the Wayfarer. Their navigation records reveal the Frost Mothership drawing energy from the station.'},
    {name:'Cold Circuit',zone:'Cryon · Orbital Coolant Spine',width:7200,cores:14,enemies:22,boss:false,bg:3,hazard:'frost',objective:'Isolate coolant valves',kind:'coolant',count:3,
      tip:'Hold Fire at each valve only while its indicator is blue. Amber means wait; white frost is dangerous. Closed valves silence their jet group.',
      briefing:['The Mothership uses the station’s coolant spine to recharge its armour. ORBIT plots a service route along the frozen pipes.', 'Mira: Close each valve during the blue low-pressure interval. Keep the hold steady; amber means pressure is rising.'],
      report:'The coolant supply is isolated. The Frost Mothership retreats into the hangar and seals its armoured hull.'},
    {name:'Winter’s Last Engine',zone:'Cryon · Mothership Hangar',width:7800,cores:16,enemies:25,boss:true,bossName:'Frost Mothership',bossHp:52,bossColor:'#9edfff',bg:4,hazard:'frost',objective:'Open hangar exhaust vents',kind:'vent',count:3,
      tip:'Open all three vents, then fire during the Mothership’s blue hull windows. Amber warns before its armour closes. Dodge its laser volleys.',
      briefing:['The Frost Mothership blocks the escape corridor. Its hull cycles between cooling and sealed armour, drawing on the last stolen reserves.', 'ORBIT: Open all three hangar vents first. Then strike when the hull is blue. We can free the station without taking its remaining power.'],
      report:'The Frost Mothership falls silent. Cryon’s station regains its orbit, the expedition specialists restore the Wayfarer’s navigation room, and Nova guides the rescue convoy into clear space.'}
  ];

  function createLevel(index) {
    const spec=levels[index];
    if(!spec) throw new RangeError('Unknown Cryon mission');
    const platforms=[],cores=[],pickups=[],enemies=[],hazards=[],objectives=[];
    // A guaranteed, gently graded lower route; optional upper routes provide
    // safer combat positions and spare cores without requiring moving lifts.
    for(let x=0,i=0;x<spec.width;i++,x+=300){
      platforms.push({x,y:640+Math.round(Math.sin(i*.72+index)*28),w:250,h:38,type:'ground',icy:true,control:Math.floor(i*spec.count/Math.ceil(spec.width/300))});
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
      objectives.push({x:p.x+175,y:p.y-37,kind:spec.kind,done:false,charge:0,phase:i,cycle:5,label:(spec.kind==='rescue'?'Cryopod ':spec.kind==='airlock'?'Dock relay ':spec.kind==='vent'?'Exhaust vent ':spec.kind==='coolant'?'Coolant valve ':'Thermal relay ')+(i+1)});
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
      hazards.push({x:p.x+270,y:p.y-170,w:34,h:34,type:spec.hazard,phase:i,cycle:5});
      pickups.push({x:p.x+80,y:p.y-38,r:20,type:i%2?'shield':'time',taken:false,phase:i});
    }
    if(spec.boss){
      const arena=route[route.length-3];
      // An unbroken arena floor prevents an unlucky moving-platform phase
      // from stranding a player during the Mothership fight.
      arena.w=spec.width-arena.x+80;
      route.slice(-2).forEach(p=>{p.y=arena.y;});
      enemies.push({x:spec.width-600,y:arena.y-100,homeX:spec.width-600,homeY:arena.y-100,range:135,w:190,h:140,vx:0,hp:spec.bossHp,maxHp:spec.bossHp,type:'boss',name:spec.bossName,bossColor:spec.bossColor,alive:true,shoot:1.6,frame:0,attackAnim:0,hitFlash:0,phase:0});
    }
    hazards.forEach((h,i)=>{h.control=i%objectives.length;h.phase=objectives[h.control].phase;});
    return {spec,width:spec.width,platforms,cores,pickups,enemies,hazards,objectives,projectiles:[],enemyShots:[],particles:[],stars:[],planets:[],portal:{x:Math.max(end.x+25,spec.width-125),y:end.y-125,w:70,h:120,open:false}};
  }
  const phaseAt=(time,phase,cycle)=>{const value=(time+phase)%cycle;return value<0?value+cycle:value;};
  function interact(world,player,held,dt,time=0){
    const near=world.objectives.find(n=>!n.done&&Math.abs(player.x-n.x)<75&&Math.abs(player.y-n.y)<70);
    for(const node of world.objectives){if(node!==near&&!node.done)node.charge=0;}
    if(!near)return {near:null,completed:null};
    const kind=world.spec.kind;
    const blocked=kind==='airlock'&&world.objectives.some(n=>n.x<near.x&&!n.done)?'Power earlier docking relay first':
      kind==='rescue'&&world.enemies.some(e=>e.alive&&Math.abs(e.x-near.x)<200)?'Clear nearby drones first':
      kind==='coolant'&&phaseAt(time,near.phase,5)>=2.8?'Wait for blue valve, then hold Fire':null;
    if(blocked){near.charge=0;return {near,completed:null,blocked};}
    near.charge=held?Math.min(.8,near.charge+dt):0;
    if(near.charge>=.8){near.done=true;return {near:null,completed:near};}
    return {near,completed:null};
  }
  function ready(world){return world.objectives.every(n=>n.done);}
  function hazardActive(h,time,world){if(h.control!==undefined&&world?.objectives[h.control]?.done)return false;return phaseAt(time,h.phase,h.cycle)>=3.5;}
  function updateWorld(world,time){
    // Derive thaw state from saved objectives, rather than storing mutable terrain.
    world.platforms.filter(p=>p.type==='ground').forEach(p=>{p.icy=!(world.spec.kind==='heater'&&world.objectives[p.control]?.done);});
    const boss=world.enemies.find(e=>e.type==='boss');
    if(boss){boss.shielded=!ready(world)||phaseAt(time,0,6)>=2.6;boss.hullWarning=ready(world)&&phaseAt(time,0,6)>=2&&phaseAt(time,0,6)<2.6;}
  }
  function groundDrag(world,player){
    return player.onGround&&world.platforms.some(p=>p.icy&&player.x>=p.x&&player.x<=p.x+p.w&&Math.abs(player.y+29-p.y)<9)?.18:.0009;
  }
  function damageMultiplier(enemy,world){return enemy.type==='boss'&&(!ready(world)||enemy.shielded!==false)?0:1;}
  return {levels,createLevel,interact,ready,hazardActive,updateWorld,groundDrag,damageMultiplier,shieldHint:'Open vents, then fire during blue hull windows',name:'Cryon',offset:15,previousName:'Luminara',previousKey:'wga_space_pilot_luminara_v1',saveKey:'wga_space_pilot_cryon_v1'};
});
