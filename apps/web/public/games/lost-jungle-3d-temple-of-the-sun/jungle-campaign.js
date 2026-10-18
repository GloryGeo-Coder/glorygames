/* Lost Jungle: deterministic long-form expedition, built over the existing game. */
(function(root){
  'use strict';
  const chapters=['The Missing Cartographer','Echoes below the Roots','The Broken Sun Roads','The Heartwood Signal','Return the Light'];
  const routes=[
    ['Jungle Entrance',1,'snake,frog',null,'Mara, your mentor, vanished while mapping the Sun Temple. You are Ari, her apprentice. Her last note says the jungle is losing its light. Follow her trail and recover the scattered Sun Relics.','Mara marked the safe ledges with sun coins. Gather the relics and key before the gate.'],
    ['River Crossing',2,'snake,frog,bat',null,'A torn map waits beside the river. The temple once guided rain through the valley; someone has removed its five Sun Seals. Cross the flooded paths to find where Mara went.','The river follows channels carved centuries ago. The damage is recent.'],
    ['Waterfall Ruins',3,'snake,frog,bat',null,'Behind the falls, Mara left a warning: the relic hunter Voss has broken the Sun Lattice. Recover the gate keys and activate the old pressure plate to follow her underground.','A plate carries Mara\'s chalk mark. Stand on it to wake the mechanism.'],
    ['Spider Cave',4,'spider,bat,snake',null,'The first tunnel is alive with disturbed guardians. Mara\'s lantern lies empty, but fresh footprints lead deeper. Watch the spiders prepare their leaps.','The creatures react to the broken lattice. Their warnings give you time to move.'],
    ['Monkey Bridge',5,'monkey,bat,snake,frog','Monkey King','The Monkey King holds the Canopy Seal. He mistakes you for another relic hunter. Cross the rope-road, withstand his challenge and prove that you came to restore the forest.','The first seal belongs in the temple, not in a trophy case.'],
    ['Stone Puzzle Temple',6,'monkey,spider,snake',null,'The Canopy Seal reveals a hidden route on Mara\'s map. Voss passed this way with a stone case. Search the temple terraces and open the pressure-plate gate.','The map brightens near each recovered relic. Mara was following the same signal.'],
    ['Underground Crystal Cave',7,'bat,spider,boar',null,'Below the roots, crystals repeat Mara\'s radio message: do not let Voss open the heart chamber. Follow the echoes through the crystal galleries.','Listen to the pauses between attacks. The caverns reward patience.'],
    ['Lost Village',8,'spider,monkey,bat,crawler','Spider Queen','The Spider Queen guards an abandoned village, not a treasure vault. Her webs protect the water channels. Calm the corrupted guardian and recover Mara\'s field journal.','Mara wrote that the guardians were protectors before the lattice broke.'],
    ['Volcano Path',9,'boar,bat,crawler,monkey',null,'Voss has forced open a volcanic sluice. The rising heat threatens the jungle. Cross the basalt paths and carry Mara\'s journal to the outer sun gate.','The warm ground warns of the vents ahead. Supplies wait beside the next beacon.'],
    ['Outer Sun Gate',10,'monkey,boar,crawler,bat','Sun Guardian','The outer Sun Guardian carries the River Seal. Its light is fractured, but the heart chamber remains closed. Free it from the broken signal and reveal the lost aqueduct roads.','Two seals are safe. The route on the far side of this gate is missing from every map.'],
    ['Mist Aqueduct',2,'bat,frog,monkey,crawler',null,'Water runs uphill through the ancient aqueduct. Mara has left a fresh ribbon on a checkpoint post. Follow the channel into the unmapped forest.','Mara is alive. The ribbon points toward the orchid gorge.'],
    ['Orchid Gorge',1,'wasp,bat,frog,boar',null,'Bright wasps defend the gorge. They flash before firing; use the stone ledges to break their aim. Mara\'s trail climbs toward a canopy settlement.','These roads were made to carry water and light together.'],
    ['Canopy Settlement',8,'monkey,wasp,spider',null,'The canopy homes are empty, but their signal lamps still work. Restore the route by collecting the keys and waking its pressure plate.','A lamp answers from the observatory. Someone is trying to guide you.'],
    ['Moonlit Rootways',4,'crawler,wasp,spider,bat',null,'Night falls before its time. Giant roots hide a path beneath the observatory. Follow the pale relic glow and keep your escape route clear.','The missing seals are pulling daylight out of the valley.'],
    ['Canopy Observatory',5,'monkey,wasp,boar','Monkey King','The Monkey King returns to test your resolve at the observatory. Earn the Storm Seal and use its lens to locate the heartwood signal.','Three seals now answer your staff. The storm road opens to the east.'],
    ['Mossbound Archives',6,'sentry,crawler,spider',null,'Stone sentries have awakened inside the archives. Their eyes glow before a burst. Read Mara\'s final page: the heart chamber can be restored only from within.','Voss wanted the temple\'s power. Mara stayed to keep it contained.'],
    ['Thunderfall Ravine',3,'wasp,boar,bat,sentry',null,'Storm rain cuts through the ravine. Keep a measured pace across the broken channels, and follow the signal beneath the thunderfall.','The checkpoint beacons still hold a steady light.'],
    ['Amber Caverns',7,'crawler,spider,bat,sentry',null,'Amber crystals preserve the voices of earlier cartographers. They describe a guardian pact, not a curse. Carry their warning through the sealed cavern route.','The lattice can heal. The five seals must return together.'],
    ['Flooded Sanctuary',2,'frog,wasp,sentry,monkey',null,'The sanctuary is filling with water diverted by Voss. Work through its gate mechanism before following the signal into the heartwood.','Mara\'s voice breaks through the static: Ari, the roots are still alive.'],
    ['Heartwood Shrine',8,'spider,crawler,sentry','Spider Queen','Mara is trapped beyond the Heartwood Shrine. The Spider Queen holds the Root Seal and the last barrier is unstable. Free the guardian and open Mara\'s escape route.','Mara is safe at the shrine. She gives you her compass: finish the road we started.'],
    ['Ashen Causeway',9,'boar,sentry,wasp,monkey',null,'With Mara safe, you cross the ashen causeway alone. Voss has fled; his damaged pumps still threaten the temple. Follow the final seal\'s pulse through the heat.','Mara guides you by radio. Save your dash for the open landing after each trap.'],
    ['Sunken Sun Gardens',1,'frog,wasp,spider,sentry',null,'The sun gardens are half drowned, yet new shoots push through the stone. Return their relics to the gate and reconnect the old irrigation road.','The first flowers turn toward your staff. The valley is beginning to answer.'],
    ['Serpent Crown Pass',5,'snake,boar,crawler,sentry',null,'The crown pass narrows between carved serpent towers. Expect layered patrols and use the beacons to plan each crossing. Beyond it waits the eclipse stair.','There is no shortcut through the pact. Every seal must reach the heart chamber.'],
    ['Eclipse Stair',6,'wasp,monkey,sentry,crawler',null,'The last light drains from the stair. Mara\'s compass points straight toward the Sun Guardian. Carry the recovered relics through the final locks.','Mara: You are not taking the jungle\'s light, Ari. You are bringing it home.'],
    ['Temple of the Returning Sun',10,'sentry,wasp,boar,crawler','Sun Guardian','The final Sun Guardian holds the Dawn Seal at the broken heart chamber. Break its corrupted shell, reunite the five seals and restore the Sun Lattice before the valley loses its last dawn.','Mara: You know the road now. Let the jungle see the sunrise.']
  ];
  const oldBackgrounds=['jungle-entrance','river-crossing','waterfall-ruins','spider-cave','monkey-bridge','stone-puzzle-temple','crystal-cave','lost-village','volcano-path','sun-temple-boss'];
  const textureNames=['jungle','river','ruins','cave','bridge','puzzle','crystal','village','volcano','sun-temple'];
  const colors=['#74f2a8','#57d9ff','#6ee6ff','#be6eff','#ffd66f','#ffb347','#66e7ff','#ffb347','#ff6f47','#ffd66f'];
  const levels=routes.map((r,i)=>({id:i+1,title:r[0],themeId:r[1],enemies:r[2].split(','),boss:r[3],story:r[4],discovery:r[5],chapter:chapters[Math.floor(i/5)],length:9600+i*480,relicTarget:6+Math.floor(i/3),keyTarget:1+Math.floor(i/8),plateRequired:i%3===2||[6,10,15,20,25].includes(i+1),theme:colors[r[1]-1],dark:[4,7,14,18].includes(i+1),
    bg:i<10?'./assets/backgrounds/level-'+String(i+1).padStart(2,'0')+'-'+oldBackgrounds[i]+'.png':'./assets/backgrounds/level-'+(i+1)+'-expedition.png',texture:'./assets/textures/platform-'+textureNames[r[1]-1]+'.png',hazards:i<2?['spikes','water']:i<5?['spikes','water','dart']:i<8?['spikes','pit','dart','fallingRock']:['spikes','pit','dart','fallingRock','swingBlade',...(r[1]===9?['lava','rollingBoulder']:[])]}));
  const enemySizes={snake:[74,56],frog:[66,54],bat:[78,52],spider:[78,58],monkey:[68,82],boar:[94,66],crawler:[84,52],wasp:[72,54],sentry:[72,92]};
  function build(lv){
    const world={platforms:[],items:[],hazards:[],enemies:[],checkpoints:[],storyMarks:[],boss:null,exit:null,gate:null,boulder:null};
    let seed=2400+lv.id;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const platform=(x,y,w,type='ground',more={})=>{const p={id:world.platforms.length,x,y,w,h:type==='ground'?1200:28,type,baseX:x,baseY:y,prevX:x,prevY:y,phase:0,moveAxis:null,moveRange:0,moveSpeed:0,...more};world.platforms.push(p);return p;};
    const item=(type,x,y,more={})=>world.items.push({id:world.items.length,type,x,y,w:44,h:44,taken:false,...more});
    const hazard=(type,x,y,w,h,more={})=>world.hazards.push({id:world.hazards.length,type,x,y,w,h,active:true,...more});
    const floors=[platform(0,570,760)];let x=760,n=0;
    const end=lv.length-1300;
    while(x<end-600){
      const gap=76+Math.min(48,Math.floor((lv.id-1)/5)*10)+(n%3)*6;
      const w=350+(n%3)*55,y=[570,540,580,550,570][(n+Math.floor((lv.id-1)/5))%5];
      const p=platform(x+gap,y,w);floors.push(p);
      hazard(lv.themeId===9?'lava':lv.themeId===2||lv.themeId===3?'water':'pit',x+4,650,gap-8,200);
      if(n%3===1)platform(p.x+210,p.y-96,130,'stone',{optional:true});
      if(n%7===4)platform(p.x+230,p.y-90,130,'moving',{optional:true,moveAxis:'y',moveRange:32,moveSpeed:1+lv.id*.012,phase:n*.6});
      for(let c=0;c<3;c++)item('coin',p.x+48+c*56,p.y-65);
      if(n%3===0)item('gold',p.x+245,p.y-150,{value:120});
      if(n%6===1)item('emerald',p.x+270,p.y-155,{value:240});
      if(n%4===1)item('power',p.x+46,p.y-52,{power:n%8===1?'heart':'shield'});
      if(n%5===3)item('power',p.x+52,p.y-52,{power:'ammo'});
      if(n%8===2)item('power',p.x+250,p.y-150,{power:['blaster','doubleJump','magnet','torch'][Math.floor(n/8)%4]});
      if(n%4===2)hazard('spikes',p.x+p.w-140,p.y-27,62+Math.min(16,lv.id),30);
      if(lv.id>=3&&n%6===4)hazard('dartTrap',p.x+p.w-64,p.y-70,48,55,{timer:2.4,windup:0});
      if(lv.id>=7&&n%9===7)hazard('fallingRock',p.x+210,p.y-300,58,58,{baseY:p.y-300,timer:2.5,windup:0,falling:false});
      if(lv.id>=9&&n%10===5)hazard('swingBlade',p.x+195,p.y-240,54,135,{baseX:p.x+195,phase:n*.7});
      if(lv.themeId===9&&n%9===3)hazard('rollingBoulder',p.x+140,p.y-70,65,65,{baseX:p.x+140,vx:95,minX:p.x+20,maxX:p.x+p.w-80});
      if(n%4===0)world.checkpoints.push({x:p.x+25,y:p.y-86,index:world.checkpoints.length+1});
      if(n>0&&(n*37)%100<100*Math.min(1,.38+lv.id*.055)){
        const type=lv.enemies[(n+lv.id)%lv.enemies.length],[ew,eh]=enemySizes[type],flying=type==='bat'||type==='wasp';
        const ex=p.x+p.w-95-eySafe(type),ey=p.y-eh-(flying?115:0);
        world.enemies.push({id:world.enemies.length,type,x:ex,y:ey,w:ew,h:eh,baseX:ex,baseY:ey,minX:p.x+18,maxX:p.x+p.w-ew-18,range:80,hp:type==='boar'||type==='crawler'||type==='sentry'?3:lv.id>=16&&type==='monkey'?3:type==='monkey'||type==='spider'?2:1,vx:Math.min(145,62+lv.id*2),dir:-1,bob:random()*6,shootTimer:2+random(),windup:0,attackTimer:0,hurt:0,dead:false,deadTime:0,attackDir:-1});
      }
      x=p.x+p.w;n++;
    }
    // A continuous final approach prevents a hard jump immediately before a boss.
    hazard(lv.themeId===9?'lava':lv.themeId===2?'water':'pit',x+4,650,78,200);
    const finalStart=x+86;floors.push(platform(finalStart,570,lv.length+620-finalStart));
    const pick=(fraction)=>floors[Math.max(1,Math.min(floors.length-2,Math.round((floors.length-2)*fraction)))];
    for(let i=0;i<lv.relicTarget+2;i++){const p=pick((i+1)/(lv.relicTarget+3));item('relic',p.x+125+(i%2)*35,p.y-52);}
    for(let i=0;i<lv.keyTarget;i++){const p=pick((i+1)/(lv.keyTarget+1));item('key',p.x+160,p.y-52);}
    if(lv.plateRequired)item('plate',lv.length-1130,570-24,{w:82,h:26});
    item('power',520,518,{power:'ammo'});item('power',lv.length-950,518,{power:'ammo'});item('power',lv.length-840,518,{power:'shield'});
    world.checkpoints.unshift({x:120,y:484,index:0});world.checkpoints.push({x:finalStart+40,y:484,index:world.checkpoints.length});
    world.storyMarks=[{x:lv.length*.32,text:lv.discovery,read:false},{x:lv.length*.69,text:'Ari\'s field note: '+lv.chapter+'. The next beacon marks a safe place to regroup.',read:false}];
    world.gate={x:lv.length-650,y:390,w:110,h:180,locked:true};world.exit={x:lv.length+110,y:420,w:110,h:150};
    if(lv.boss){const hp=16+Math.floor(lv.id*.7);world.boss={name:lv.boss,x:lv.length-350,y:350,w:180,h:220,baseX:lv.length-350,baseY:350,hp,maxHp:hp,dir:-1,alive:true,shootTimer:2.1,windup:0,hurt:0,attackCount:0,attackDir:-1};}
    if(lv.themeId===9)world.boulder={x:-600,y:450,w:115,h:115,vx:170,active:true};
    return world;
  }
  function eySafe(type){return type==='boar'?20:10;}
  const api={levels,build,chapters,enemySizes};if(typeof module==='object'&&module.exports)module.exports=api;else root.JungleCampaign=api;
})(typeof window!=='undefined'?window:globalThis);
