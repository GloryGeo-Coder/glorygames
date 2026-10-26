(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpacePilotAsterion = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const levels = [
    {name:'A Signal in the Dust', zone:'Asterion · Crash Valley', width:4400, cores:8, enemies:8, boss:false, bg:0, hazard:'meteor', objective:'Restore ORBIT links', kind:'link', count:3,
      tip:'Hold Fire beside a marked link until its ring fills. Double jump crosses the broken moon path.',
      briefing:['The Starfall Gate fractures around the Wayfarer. Nova wakes beneath a shattered moon, with only a damaged radio for company.', 'ORBIT: Navigation is offline. Restore three emergency links and I can trace the crew. Gather eight star cores to power the exit beacon.'],
      report:'ORBIT is back online. A weak rescue signal points beyond a graveyard of ships.'},
    {name:'The Silent Shipyard', zone:'Asterion · Debris Harbour', width:5100, cores:10, enemies:12, boss:false, bg:1, hazard:'laser', objective:'Recover drive parts', kind:'salvage', count:4,
      tip:'Hold Fire near the cyan salvage markers. Crawler sentries patrol platforms; drones fire from above.',
      briefing:['The Wayfarer cannot leave Asterion without a working drive. Its broken parts have scattered through an abandoned orbital shipyard.', 'ORBIT: Four drive assemblies are still transmitting. Recover them while I follow Mira’s signal. Pirate machines have found them too.'],
      report:'The drive has power again. A rescue capsule sends a human heartbeat from the crystal refuge.'},
    {name:'Voices Beneath the Moon', zone:'Asterion · Crystal Refuge', width:5700, cores:11, enemies:15, boss:false, bg:2, hazard:'plasma', objective:'Rescue survivors', kind:'rescue', count:3,
      tip:'Hold Fire beside each rescue capsule to release its survivor. Cleared capsules remain rescued after refresh.',
      briefing:['Inside a crystal cavern, Nova discovers the expedition’s escape capsules. Their occupants cannot survive another moonquake.', 'Survivor: The gates aren’t collapsing. Someone is moving them. We saw machines hauling star cores towards the old relay.'],
      report:'Three survivors reach the Wayfarer. Mira is still missing, but a relay log records her ship heading for the rift.'},
    {name:'Across the Broken Relay', zone:'Asterion · Sunward Array', width:6400, cores:12, enemies:18, boss:false, bg:3, hazard:'laser', objective:'Align relay dishes', kind:'relay', count:3,
      tip:'Approach the relay markers and hold Fire. Optional upper paths reward double jumps; stable lower platforms offer checkpoints.',
      briefing:['The last transmissions are buried in a damaged relay. Nova must cross its broken gantries and align three dishes to recover them.', 'Mira, recorded: Nova… the gates aren’t collapsing. Someone is moving them. Find the core extractor before it tears Asterion apart.'],
      report:'The recording names the NOVA-X Commander. The Asteroid Warden is guarding the extractor at the sanctuary.'},
    {name:'The Heart of Asterion', zone:'Asterion · Rift Sanctuary', width:7000, cores:14, enemies:21, boss:true, bossName:'Asteroid Warden', bossHp:32, bossColor:'#fb4bde', bg:4, hazard:'plasma', objective:'Disable rift anchors', kind:'anchor', count:2,
      tip:'Disable both anchors and gather fourteen cores. The Warden flashes before firing; jump through gaps in its laser fan.',
      briefing:['A giant machine draws the moon’s star core towards the Rift Engine. Nova has one chance to sever its anchors and stop the extraction.', 'ORBIT: Two anchors hold the gate. The Warden will defend them. Keep moving, watch its reactor and bring our people home.'],
      report:'The Warden falls. Asterion’s core settles and the rescued crew restores the Wayfarer’s navigation. Mira’s signal returns: “Vulcanis. Pirate foundries. I’m alive.” Nova sets a course through the stabilised gate.'}
  ];

  function createLevel(index) {
    const spec=levels[index];
    if(!spec) throw new RangeError('Unknown Asterion mission');
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
      if(i%4===0)platforms.push({x:p.x+180,y:p.y-285,ox:p.x+180,oy:p.y-285,w:155,h:24,type:'moving',range:35,speed:.7,phase:i});
    }
    // Every required core is on the reachable lower route; upper-route extras
    // allow missed or contested cores to be replaced without a full backtrack.
    for(let i=0;i<spec.cores+6;i++){
      const p=i<spec.cores?route[1+Math.floor(i*(route.length-3)/spec.cores)]:platforms[route.length+(i-spec.cores)%(platforms.length-route.length)];
      cores.push({x:p.x+100+(i%2)*50,y:p.y-57,r:17,taken:false,phase:i});
    }
    for(let i=0;i<spec.count;i++){
      const p=route[2+Math.floor(i*(route.length-5)/spec.count)];
      objectives.push({x:p.x+175,y:p.y-37,kind:spec.kind,done:false,charge:0,label:spec.kind==='rescue'?'Rescue capsule':spec.kind==='salvage'?'Drive assembly':spec.kind==='anchor'?'Rift anchor':spec.kind==='relay'?'Relay dish':'ORBIT link'});
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
      hazards.push({x:p.x+270,y:p.y-170,w:34,h:34,type:spec.hazard,phase:i});
      pickups.push({x:p.x+80,y:p.y-38,r:20,type:i%2?'shield':'time',taken:false,phase:i});
    }
    if(spec.boss){
      const arena=route[route.length-3];
      // An unbroken arena floor prevents an unlucky moving-platform phase
      // from stranding a player during the Warden fight.
      arena.w=spec.width-arena.x+80;
      route.slice(-2).forEach(p=>{p.y=arena.y;});
      enemies.push({x:spec.width-600,y:arena.y-100,homeX:spec.width-600,homeY:arena.y-100,range:135,w:190,h:140,vx:0,hp:spec.bossHp,maxHp:spec.bossHp,type:'boss',name:spec.bossName,bossColor:spec.bossColor,alive:true,shoot:1.6,frame:0,attackAnim:0,hitFlash:0,phase:0});
    }
    return {spec,width:spec.width,platforms,cores,pickups,enemies,hazards,objectives,projectiles:[],enemyShots:[],particles:[],stars:[],planets:[],portal:{x:Math.max(end.x+25,spec.width-125),y:end.y-125,w:70,h:120,open:false}};
  }
  function interact(world,player,held,dt){
    const near=world.objectives.find(n=>!n.done&&Math.abs(player.x-n.x)<75&&Math.abs(player.y-n.y)<70);
    for(const node of world.objectives){if(node!==near&&!node.done)node.charge=0;}
    if(!near)return {near:null,completed:null};
    near.charge=held?Math.min(.8,near.charge+dt):0;
    if(near.charge>=.8){near.done=true;return {near:null,completed:near};}
    return {near,completed:null};
  }
  function ready(world){return world.objectives.every(n=>n.done);}
  return {levels,createLevel,interact,ready,saveKey:'wga_space_pilot_asterion_v1'};
});
