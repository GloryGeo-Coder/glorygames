(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SpacePilotVulcanis = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const levels = [
    {name:'Cinders at the Landing Dock',zone:'Vulcanis · Ash Harbour',width:5000,cores:10,enemies:12,boss:false,bg:0,hazard:'crusher',objective:'Recover docking codes',kind:'salvage',count:3,
      tip:'Hold Fire beside three cargo terminals. Amber machinery lights warn before the red cutting cycle; stay on the lower gantries.',
      briefing:['Mira’s signal leads the Wayfarer into the smoke above Vulcanis. Pirate patrols control the landing docks and every route into the foundries.', 'ORBIT: Recover three docking codes. We can follow the cargo trail without leaving our rescued crew exposed.'],
      report:'The codes reveal a convoy carrying stolen star cores into the deep foundry.'},
    {name:'The Mining Line',zone:'Vulcanis · Ironworks',width:5600,cores:11,enemies:15,boss:false,bg:1,hazard:'crusher',objective:'Stop mining relays',kind:'relay',count:3,
      tip:'Disable relays in route order: each shuts down its cutter group. Double jump to upper platforms when cutters are safe.',
      briefing:['Giant mining presses feed the pirates’ core transports. Their machinery is tearing through the inhabited planet below.', 'ORBIT: Shut down three relay controls. The lower service gantries give you a clear route past the presses.'],
      report:'The mining line falls silent. A trapped work crew answers from the furnace shelters.'},
    {name:'Under the Furnace',zone:'Vulcanis · Ember Shelters',width:6200,cores:12,enemies:18,boss:false,bg:2,hazard:'crusher',objective:'Free foundry workers',kind:'rescue',count:4,
      tip:'Clear pirate patrols within 200 units of each shelter, then hold Fire to free the workers. Rescues stay complete after recovery.',
      briefing:['Workers are sealed inside heat shelters while pirate drones search the gantries. Nova cannot leave them behind.', 'Worker: Mira helped us hide. They took her towards the captain’s command rig. Open these four shelters and we will clear your route.'],
      report:'The workers reach safety. Their route map leads Nova to the captain’s communications tower.'},
    {name:'Mira on the Wire',zone:'Vulcanis · Signal Spire',width:6800,cores:13,enemies:21,boss:false,bg:3,hazard:'crusher',objective:'Restore signal links',kind:'link',count:3,
      tip:'Restore the three links with a Fire hold. Drones flash before firing; shield dash through pressure and use cover below.',
      briefing:['Across the smoke, a familiar voice breaks through the pirate transmission. Mira is alive inside the command rig.', 'Mira: Nova, the captain is shipping cores to the Rift Engine. Restore the links and I can break the locks from this side.'],
      report:'Mira opens the command approach. The Rogue Captain starts the last core shipment.'},
    {name:'The Captain’s Last Shipment',zone:'Vulcanis · Core Foundry',width:7400,cores:15,enemies:24,boss:true,bossName:'Rogue Captain',bossHp:40,bossColor:'#ff8b45',bg:4,hazard:'crusher',objective:'Sever cargo anchors',kind:'anchor',count:3,
      tip:'Sever all three anchors and defeat the Rogue Captain. Watch the orange firing ring, then jump between the laser volleys.',
      briefing:['The Rogue Captain blocks the loading gantry as the core transport begins to rise. Mira needs Nova to sever its three cargo anchors.', 'ORBIT: Keep the star cores on Vulcanis. The captain’s cannon charges before each volley. Keep moving and bring Mira home.'],
      report:'The Rogue Captain falls and the shipment is grounded. Mira rejoins the Wayfarer while the freed workers restore the foundry’s safety systems. The crew recovers a fragment of the portal network leading towards Luminara.'}
  ];

  function createLevel(index) {
    const spec=levels[index];
    if(!spec) throw new RangeError('Unknown Vulcanis mission');
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
      objectives.push({x:p.x+175,y:p.y-37,kind:spec.kind,done:false,charge:0,label:spec.kind==='rescue'?'Worker shelter':spec.kind==='salvage'?'Cargo terminal':spec.kind==='anchor'?'Cargo anchor':spec.kind==='relay'?'Mining relay':'Signal link'});
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
      hazards.push({x:p.x+270,y:p.y-170,w:34,h:34,type:spec.hazard,phase:i,cycle:3.6});
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
    hazards.forEach((h,i)=>{if(index===1)h.control=i%objectives.length;});
    objectives.forEach((n,i)=>{if(index===1)n.label='Mining relay '+(i+1);});
    return {spec,width:spec.width,platforms,cores,pickups,enemies,hazards,objectives,projectiles:[],enemyShots:[],particles:[],stars:[],planets:[],portal:{x:Math.max(end.x+25,spec.width-125),y:end.y-125,w:70,h:120,open:false}};
  }
  function interact(world,player,held,dt){
    const near=world.objectives.find(n=>!n.done&&Math.abs(player.x-n.x)<75&&Math.abs(player.y-n.y)<70);
    for(const node of world.objectives){if(node!==near&&!node.done)node.charge=0;}
    if(!near)return {near:null,completed:null};
    const blocked=world.spec.kind==='relay'&&world.objectives.some(n=>n.x<near.x&&!n.done)?'Restore earlier relay first':world.spec.kind==='rescue'&&world.enemies.some(e=>e.alive&&Math.abs(e.x-near.x)<200)?'Clear nearby patrol first':null;
    if(blocked){near.charge=0;return {near,completed:null,blocked};}
    near.charge=held?Math.min(.8,near.charge+dt):0;
    if(near.charge>=.8){near.done=true;return {near:null,completed:near};}
    return {near,completed:null};
  }
  function ready(world){return world.objectives.every(n=>n.done);}
  function hazardActive(h,time,world){if(h.control!==undefined&&world?.objectives[h.control]?.done)return false;return ((time+h.phase)%h.cycle+h.cycle)%h.cycle>=2.2;}
  return {levels,createLevel,interact,ready,hazardActive,name:'Vulcanis',offset:5,saveKey:'wga_space_pilot_vulcanis_v1'};
});

