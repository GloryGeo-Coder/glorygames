(() => {
  'use strict';

  const GAME_SLUG = 'city-quest-rise-of-the-guardian';
  const SAVE_KEY = 'gg_city_quest_guardian_save_v2';
  const BEST_KEY = 'gg_city_quest_guardian_best_v2';
  const DESIGN_H = 720;

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const ui = {
    scoreValue: document.getElementById('scoreValue'),
    coinsValue: document.getElementById('coinsValue'),
    livesValue: document.getElementById('livesValue'),
    levelValue: document.getElementById('levelValue'),
    missionText: document.getElementById('missionText'),
    storyText: document.getElementById('storyText'),
    objectiveText: document.getElementById('objectiveText'),
    progressBar: document.getElementById('progressBar'),
    skinHint: document.getElementById('skinHint'),
    skinBlueBtn: document.getElementById('skinBlueBtn'),
    skinGreenBtn: document.getElementById('skinGreenBtn'),
    skinShadowBtn: document.getElementById('skinShadowBtn'),
    startOverlay: document.getElementById('startOverlay'),
    helpOverlay: document.getElementById('helpOverlay'),
    mapOverlay: document.getElementById('mapOverlay'),
    mapGrid: document.getElementById('mapGrid'),
    levelOverlay: document.getElementById('levelOverlay'),
    levelTitle: document.getElementById('levelTitle'),
    levelSummary: document.getElementById('levelSummary'),
    rewardText: document.getElementById('rewardText'),
    starRow: document.getElementById('starRow'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverSummary: document.getElementById('gameOverSummary'),
    muteBtn: document.getElementById('muteBtn'),
    pauseBtn: document.getElementById('pauseBtn')
  };

  const spriteGroups = {
    hero_blue: ['./assets/sprites/hero_blue_01.png','./assets/sprites/hero_blue_02.png','./assets/sprites/hero_blue_03.png'],
    hero_green: ['./assets/sprites/hero_green_01.png','./assets/sprites/hero_green_02.png','./assets/sprites/hero_green_03.png'],
    hero_shadow: ['./assets/sprites/hero_shadow_01.png','./assets/sprites/hero_shadow_02.png','./assets/sprites/hero_shadow_03.png'],
    npc: ['./assets/sprites/npc_01.png','./assets/sprites/npc_02.png'],
    npc_elder: ['./assets/sprites/npc_elder_01.png'],
    walker: ['./assets/sprites/walker_01.png','./assets/sprites/walker_02.png'],
    drone: ['./assets/sprites/drone_01.png','./assets/sprites/drone_02.png'],
    boss_taxi: ['./assets/sprites/boss_taxi_01.png','./assets/sprites/boss_taxi_02.png'],
    coin: ['./assets/sprites/coin_01.png','./assets/sprites/coin_02.png'],
    token: ['./assets/sprites/token_01.png','./assets/sprites/token_02.png'],
    badge: ['./assets/sprites/badge_01.png','./assets/sprites/badge_02.png'],
    taxi: ['./assets/sprites/taxi_01.png','./assets/sprites/taxi_02.png'],
    crate: ['./assets/sprites/crate.png'],
    bolt: ['./assets/sprites/energy_bolt.png'],
    enemyBolt: ['./assets/sprites/enemy_bolt.png'],
    shieldPower: ['./assets/sprites/power_shield.png'],
    blasterPower: ['./assets/sprites/power_blaster.png'],
    heartPower: ['./assets/sprites/power_heart.png'],
    spikes: ['./assets/sprites/spikes.png'],
    lift: ['./assets/sprites/moving_lift.png']
  };

  const makeCoins = (points) => points.map(([x,y]) => ({x,y,w:34,h:34,taken:false,type:'coin'}));
  const makeTokens = (points) => points.map(([x,y]) => ({x,y,w:40,h:40,taken:false,type:'token'}));
  const makeBadges = (points) => points.map(([x,y]) => ({x,y,w:40,h:40,taken:false,type:'badge'}));
  const makePowers = (items) => items.map(([type,x,y]) => ({type,x,y,w:42,h:42,taken:false}));

  const levelDefs = [
    {
      id: 1, title: 'Rooftop Dawn', subtitle: 'Meet the mentor and learn guardian movement.',
      mission: 'Talk to the mentor, collect 8 coins and 1 token, then reach the glowing exit.',
      story: 'The guardian journey begins on the rooftops. The mentor will guide your first mission.',
      bg: './assets/backgrounds/level-01.png', width: 2800, target: 9,
      start:{x:120,y:100}, exit:{x:2640,y:470,w:62,h:100},
      npcs:[{x:300,y:476,kind:'npc',text:'Guardian, collect coins and the first taxi token. Reach the glowing exit when ready.'}],
      platforms:[
        {x:0,y:590,w:620,h:110},{x:700,y:540,w:360,h:160},{x:1130,y:510,w:280,h:190},
        {x:1510,y:560,w:440,h:140},{x:2010,y:540,w:310,h:160},{x:2370,y:560,w:430,h:140}
      ],
      coins:[[470,430],[620,398],[760,366],[920,336],[1180,336],[1450,366],[1820,406],[2290,416]],
      tokens:[[2080,392]], badges:[[2480,398]], powers:[['shield',1320,452]],
      enemies:[{type:'walker',x:860,y:466,minX:760,maxX:1060,speed:70,hp:1},{type:'walker',x:1580,y:486,minX:1450,maxX:1700,speed:72,hp:1}],
      obstacles:[{type:'crate',x:1290,y:498,w:60,h:60}]
    },
    {
      id: 2, title: 'Main Street Dash', subtitle: 'Patrol walkers and the first shooting drone.',
      mission: 'Collect 10 coins and a token. Use Shoot to disable enemies safely.',
      story: 'The main street is tense. Drones now guard the route.',
      bg: './assets/backgrounds/level-02.png', width: 3200, target: 11,
      start:{x:90,y:100}, exit:{x:3020,y:468,w:62,h:100},
      npcs:[{x:250,y:486,kind:'npc',text:'Some drones fire energy bolts. Move, jump, and shoot back.'},{x:1320,y:456,kind:'npc_elder',text:'Power-ups can save your run. Collect the blaster when you see it.'}],
      platforms:[{x:0,y:590,w:980,h:110},{x:1090,y:560,w:380,h:140},{x:1600,y:540,w:460,h:160},{x:2180,y:590,w:1020,h:110}],
      coins:[[420,470],[560,470],[810,470],[940,470],[1240,440],[1480,410],[1760,410],[2080,440],[2430,470],[2780,470]],
      tokens:[[1620,376]], badges:[], powers:[['blaster',1960,484]],
      enemies:[
        {type:'walker',x:740,y:516,minX:620,maxX:930,speed:80,hp:1},
        {type:'walker',x:1190,y:516,minX:1080,maxX:1360,speed:86,hp:1},
        {type:'drone',x:1700,y:260,minX:1620,maxX:1880,minY:210,maxY:320,speed:72,hp:1,shoot:true,cooldown:1.5},
        {type:'walker',x:2500,y:516,minX:2360,maxX:2700,speed:90,hp:1}
      ],
      obstacles:[{type:'taxi',x:1940,y:534,w:88,h:54,moving:true,minX:1880,maxX:2200,speed:95}]
    },
    {
      id: 3, title: 'Market Maze', subtitle: 'Crowded stalls, crates, and shooting drones.',
      mission: 'Collect 12 coins, 1 token, and 1 badge. Watch the drones above the market.',
      story: 'The market is full of hidden platforms and helpful citizens.',
      bg:'./assets/backgrounds/level-03.png', width:3400, target:14,
      start:{x:100,y:100}, exit:{x:3220,y:468,w:62,h:100},
      npcs:[{x:340,y:486,kind:'npc',text:'The badge is hidden above the market route. Look for higher platforms.'},{x:1160,y:436,kind:'npc_elder',text:'Shoot enemies from a distance, but keep moving.'}],
      platforms:[
        {x:0,y:590,w:700,h:110},{x:760,y:540,w:320,h:160},{x:1140,y:500,w:360,h:200},
        {x:1570,y:560,w:420,h:140},{x:2080,y:500,w:360,h:200},{x:2540,y:560,w:360,h:140},{x:2960,y:590,w:440,h:110}
      ],
      coins:[[440,470],[620,470],[780,430],[960,390],[1180,430],[1360,470],[1600,470],[1860,430],[2120,390],[2380,430],[2720,450],[2980,470]],
      tokens:[[2080,352]], badges:[[2860,430]], powers:[['heart',1500,450]],
      enemies:[
        {type:'walker',x:830,y:516,minX:710,maxX:1000,speed:80,hp:1},
        {type:'walker',x:1740,y:516,minX:1540,maxX:1920,speed:90,hp:1},
        {type:'drone',x:2260,y:260,minX:2180,maxX:2450,minY:210,maxY:300,speed:74,hp:1,shoot:true,cooldown:1.4}
      ],
      obstacles:[{type:'crate',x:1460,y:498,w:60,h:60},{type:'crate',x:2640,y:498,w:60,h:60},{type:'spikes',x:1980,y:548,w:110,h:42}]
    },
    {
      id: 4, title: 'Taxi Rank Run', subtitle: 'Moving taxis and moving platforms.',
      mission: 'Collect 12 coins and survive the taxi rank. Use moving platforms to cross gaps.',
      story: 'The busiest rank is in chaos. Timing matters more than speed.',
      bg:'./assets/backgrounds/level-04.png', width:3600, target:13,
      start:{x:120,y:100}, exit:{x:3410,y:468,w:62,h:100},
      npcs:[{x:300,y:486,kind:'npc',text:'Taxis move fast. Jump over them or shoot hazards before they corner you.'},{x:2460,y:506,kind:'npc_elder',text:'Moving platforms carry you. Stand still for a moment and ride.'}],
      platforms:[
        {x:0,y:590,w:1220,h:110},{x:1280,y:590,w:560,h:110},{x:1940,y:590,w:500,h:110},
        {x:2520,y:535,w:220,h:36,move:{axis:'x',min:2480,max:2880,speed:95}},
        {x:2980,y:590,w:620,h:110}
      ],
      coins:[[470,470],[690,470],[890,470],[1100,430],[1290,390],[1510,430],[1700,470],[1940,470],[2200,430],[2470,390],[2810,430],[3150,470]],
      tokens:[[2380,350]], badges:[], powers:[['shield',1760,434],['blaster',3000,530]],
      enemies:[{type:'walker',x:980,y:516,minX:860,maxX:1120,speed:86,hp:1},{type:'walker',x:2860,y:516,minX:2720,maxX:3020,speed:96,hp:1}],
      obstacles:[
        {type:'taxi',x:1400,y:534,w:88,h:54,moving:true,minX:1300,maxX:1660,speed:110},
        {type:'taxi',x:2060,y:534,w:88,h:54,moving:true,minX:1980,maxX:2260,speed:115},
        {type:'spikes',x:2890,y:548,w:120,h:42}
      ]
    },
    {
      id: 5, title: 'Hidden Cave', subtitle: 'Vertical jumps and ambush drones.',
      mission: 'Collect 10 coins, a badge, and the relic token inside the cave.',
      story: 'Below the city, glowing relics reveal the origin of the guardian power.',
      bg:'./assets/backgrounds/level-05.png', width:3300, target:12,
      start:{x:120,y:100}, exit:{x:3120,y:418,w:62,h:100},
      npcs:[{x:280,y:506,kind:'npc_elder',text:'The cave has layered routes. Use platforms above you and keep the blaster ready.'}],
      platforms:[
        {x:0,y:610,w:760,h:90},{x:820,y:560,w:360,h:140},{x:1230,y:510,w:360,h:190},
        {x:1670,y:560,w:380,h:140},{x:2120,y:510,w:420,h:190},{x:2630,y:470,w:300,h:230},{x:3000,y:560,w:300,h:140}
      ],
      coins:[[520,490],[710,450],[880,410],[1060,370],[1250,410],[1450,450],[1680,490],[1960,450],[2230,410],[2550,370]],
      tokens:[[2860,332]], badges:[[2080,374]], powers:[['heart',1550,452],['shield',2350,450]],
      enemies:[
        {type:'drone',x:980,y:250,minX:900,maxX:1140,minY:180,maxY:290,speed:74,hp:1,shoot:true,cooldown:1.2},
        {type:'walker',x:1540,y:536,minX:1440,maxX:1700,speed:88,hp:1},
        {type:'drone',x:2460,y:280,minX:2350,maxX:2600,minY:220,maxY:320,speed:80,hp:1,shoot:true,cooldown:1.1}
      ],
      obstacles:[{type:'crate',x:1830,y:528,w:60,h:60},{type:'spikes',x:1180,y:568,w:130,h:42}]
    },
    {
      id: 6, title: 'Guardian Showdown', subtitle: 'First boss duel.',
      mission: 'Defeat the rogue taxi boss with jumps or energy shots, then reach the final gate.',
      story: 'The rogue taxi boss blocks the route, but this is only the first showdown.',
      bg:'./assets/backgrounds/level-06.png', width:3000, target:10,
      start:{x:110,y:100}, exit:{x:2820,y:468,w:62,h:100},
      npcs:[{x:250,y:486,kind:'npc',text:'Jump on the boss or fire energy bolts. Watch its movement before attacking.'}],
      platforms:[{x:0,y:590,w:1140,h:110},{x:1220,y:590,w:720,h:110},{x:2030,y:590,w:970,h:110}],
      coins:[[520,470],[780,470],[1040,430],[1280,430],[1520,470],[1860,470],[2140,430],[2440,430]],
      tokens:[], badges:[[2660,470]], powers:[['heart',940,530],['blaster',1420,530]],
      enemies:[{type:'drone',x:1320,y:240,minX:1240,maxX:1520,minY:210,maxY:300,speed:75,hp:1,shoot:true,cooldown:1.2}],
      obstacles:[{type:'spikes',x:1950,y:548,w:120,h:42}],
      boss:{type:'boss_taxi',x:1960,y:468,w:132,h:96,minX:1600,maxX:2360,speed:96,hp:7}
    },
    {
      id: 7, title: 'Rail Yard Chase', subtitle: 'Fast moving lifts and drone shots.',
      mission: 'Collect 14 items while crossing lifts and rail-yard hazards.',
      story: 'The guardian follows the enemy trail through the old rail yard.',
      bg:'./assets/backgrounds/level-07.png', width:3900, target:15,
      start:{x:100,y:100}, exit:{x:3700,y:470,w:62,h:100},
      npcs:[{x:300,y:486,kind:'npc',text:'The lifts move quickly. Time your jumps and shoot down drones before crossing.'},{x:2220,y:420,kind:'npc_elder',text:'The shield power-up can block one hit.'}],
      platforms:[
        {x:0,y:590,w:760,h:110},{x:840,y:545,w:260,h:36,move:{axis:'x',min:820,max:1180,speed:110}},
        {x:1240,y:590,w:420,h:110},{x:1740,y:500,w:260,h:36,move:{axis:'y',min:460,max:590,speed:80}},
        {x:2100,y:560,w:520,h:140},{x:2720,y:520,w:240,h:36,move:{axis:'x',min:2680,max:3100,speed:120}},
        {x:3200,y:590,w:700,h:110}
      ],
      coins:[[440,470],[680,470],[960,490],[1320,470],[1520,470],[1840,430],[2140,450],[2380,450],[2760,470],[3020,470],[3260,470],[3440,470],[3600,470]],
      tokens:[[2500,420]], badges:[[1120,470]], powers:[['shield',1680,452],['heart',2940,480]],
      enemies:[
        {type:'drone',x:960,y:230,minX:860,maxX:1220,minY:190,maxY:300,speed:92,hp:2,shoot:true,cooldown:1.0},
        {type:'walker',x:1440,y:516,minX:1280,maxX:1600,speed:95,hp:1},
        {type:'drone',x:2360,y:250,minX:2240,maxX:2620,minY:210,maxY:310,speed:90,hp:2,shoot:true,cooldown:0.95},
        {type:'walker',x:3400,y:516,minX:3280,maxX:3600,speed:105,hp:1}
      ],
      obstacles:[{type:'spikes',x:1160,y:548,w:140,h:42},{type:'taxi',x:3060,y:534,w:88,h:54,moving:true,minX:3000,maxX:3300,speed:128}]
    },
    {
      id: 8, title: 'Skyline Bridge', subtitle: 'Open air jumps and flying enemies.',
      mission: 'Cross the skyline bridge and collect 16 items.',
      story: 'High above the city, flying drones guard the bridge.',
      bg:'./assets/backgrounds/level-08.png', width:4100, target:16,
      start:{x:100,y:100}, exit:{x:3920,y:468,w:62,h:100},
      npcs:[{x:280,y:486,kind:'npc',text:'Shoot while moving. Some drones need two hits.'},{x:1800,y:455,kind:'npc_elder',text:'Blaster power gives faster shots for a short time.'}],
      platforms:[
        {x:0,y:590,w:760,h:110},{x:860,y:540,w:320,h:160},{x:1280,y:490,w:260,h:36,move:{axis:'x',min:1240,max:1620,speed:105}},
        {x:1720,y:560,w:420,h:140},{x:2260,y:510,w:300,h:36,move:{axis:'y',min:470,max:590,speed:75}},
        {x:2700,y:560,w:460,h:140},{x:3260,y:520,w:260,h:36,move:{axis:'x',min:3200,max:3600,speed:115}},
        {x:3720,y:590,w:380,h:110}
      ],
      coins:[[430,470],[650,470],[900,440],[1160,430],[1360,410],[1780,450],[2020,450],[2300,460],[2520,460],[2780,450],[3020,450],[3300,430],[3520,430],[3770,470]],
      tokens:[[1540,400]], badges:[[3400,390]], powers:[['blaster',2180,456],['shield',3120,500]],
      enemies:[
        {type:'drone',x:1040,y:230,minX:920,maxX:1260,minY:190,maxY:300,speed:94,hp:2,shoot:true,cooldown:0.95},
        {type:'drone',x:2000,y:250,minX:1880,maxX:2180,minY:205,maxY:315,speed:98,hp:2,shoot:true,cooldown:0.9},
        {type:'drone',x:3000,y:230,minX:2860,maxX:3240,minY:190,maxY:300,speed:102,hp:2,shoot:true,cooldown:0.85},
        {type:'walker',x:3840,y:516,minX:3740,maxX:4020,speed:105,hp:1}
      ],
      obstacles:[{type:'spikes',x:1640,y:548,w:150,h:42},{type:'spikes',x:2580,y:548,w:140,h:42}]
    },
    {
      id: 9, title: 'Underground Vault', subtitle: 'Puzzle-like lifts, narrow routes, and enemy fire.',
      mission: 'Recover vault badges and reach the secure chamber.',
      story: 'The city vault holds the source of the guardian emblem.',
      bg:'./assets/backgrounds/level-09.png', width:4000, target:17,
      start:{x:100,y:100}, exit:{x:3820,y:430,w:62,h:100},
      npcs:[{x:300,y:506,kind:'npc_elder',text:'The vault tests patience. Use lifts, clear drones, and collect the relics.'}],
      platforms:[
        {x:0,y:610,w:760,h:90},{x:880,y:560,w:300,h:36,move:{axis:'y',min:500,max:620,speed:70}},
        {x:1280,y:510,w:360,h:190},{x:1740,y:460,w:260,h:36,move:{axis:'x',min:1680,max:2100,speed:95}},
        {x:2220,y:540,w:420,h:160},{x:2760,y:490,w:300,h:36,move:{axis:'y',min:450,max:610,speed:85}},
        {x:3180,y:560,w:360,h:140},{x:3640,y:520,w:360,h:180}
      ],
      coins:[[460,490],[700,490],[920,510],[1320,410],[1540,410],[1820,380],[2060,380],[2260,430],[2480,430],[2820,400],[3060,400],[3260,450],[3480,450],[3720,430]],
      tokens:[[1980,340]], badges:[[1600,360],[2980,358]], powers:[['heart',1140,500],['blaster',2620,470],['shield',3380,510]],
      enemies:[
        {type:'walker',x:1420,y:436,minX:1300,maxX:1580,speed:96,hp:1},
        {type:'drone',x:1900,y:220,minX:1780,maxX:2120,minY:180,maxY:300,speed:94,hp:2,shoot:true,cooldown:0.85},
        {type:'walker',x:2400,y:516,minX:2260,maxX:2600,speed:108,hp:1},
        {type:'drone',x:3040,y:230,minX:2880,maxX:3200,minY:180,maxY:310,speed:100,hp:2,shoot:true,cooldown:0.8},
        {type:'drone',x:3540,y:260,minX:3380,maxX:3720,minY:210,maxY:320,speed:104,hp:2,shoot:true,cooldown:0.78}
      ],
      obstacles:[{type:'spikes',x:1190,y:568,w:160,h:42},{type:'spikes',x:2660,y:548,w:140,h:42},{type:'crate',x:3360,y:498,w:60,h:60}]
    },
    {
      id: 10, title: 'Final Guardian Trial', subtitle: 'Boss, drones, moving platforms, and full guardian power.',
      mission: 'Defeat the final boss, survive drones, and claim the guardian gate.',
      story: 'The final trial begins. The city watches as the guardian faces the last challenge.',
      bg:'./assets/backgrounds/level-10.png', width:4300, target:18,
      start:{x:100,y:100}, exit:{x:4100,y:468,w:62,h:100},
      npcs:[{x:280,y:486,kind:'npc_elder',text:'Use everything: jump, shoot, power-ups, and timing. The city believes in you.'}],
      platforms:[
        {x:0,y:590,w:780,h:110},{x:900,y:540,w:280,h:36,move:{axis:'x',min:860,max:1260,speed:105}},
        {x:1340,y:590,w:460,h:110},{x:1900,y:520,w:260,h:36,move:{axis:'y',min:480,max:610,speed:85}},
        {x:2300,y:560,w:520,h:140},{x:2920,y:520,w:280,h:36,move:{axis:'x',min:2860,max:3360,speed:122}},
        {x:3480,y:590,w:820,h:110}
      ],
      coins:[[420,470],[620,470],[960,480],[1180,480],[1400,470],[1660,470],[1960,440],[2200,440],[2420,450],[2660,450],[2960,450],[3220,450],[3520,470],[3760,470]],
      tokens:[[1740,430]], badges:[[3060,400],[3940,450]], powers:[['shield',1260,490],['heart',2100,470],['blaster',2840,475],['heart',3680,530]],
      enemies:[
        {type:'drone',x:1100,y:230,minX:940,maxX:1320,minY:190,maxY:310,speed:108,hp:2,shoot:true,cooldown:0.78},
        {type:'walker',x:1560,y:516,minX:1380,maxX:1740,speed:108,hp:1},
        {type:'drone',x:2480,y:230,minX:2340,maxX:2720,minY:190,maxY:310,speed:110,hp:2,shoot:true,cooldown:0.72},
        {type:'drone',x:3300,y:250,minX:3120,maxX:3500,minY:200,maxY:320,speed:116,hp:2,shoot:true,cooldown:0.7}
      ],
      obstacles:[{type:'spikes',x:1800,y:548,w:150,h:42},{type:'taxi',x:3600,y:534,w:88,h:54,moving:true,minX:3500,maxX:3880,speed:140}],
      boss:{type:'boss_taxi',x:3720,y:468,w:144,h:104,minX:3420,maxX:3920,speed:112,hp:10,shoot:true,cooldown:1.1}
    }
  ];


  function addExtraWalker(levelId, x, y, minX, maxX, speed=92, hp=1, cooldown=1.85) {
    const level = levelDefs.find(l => l.id === levelId);
    if (!level) return;
    level.enemies = level.enemies || [];
    level.enemies.push({
      type: 'walker',
      x, y, minX, maxX, speed, hp,
      shoot: true,
      cooldown,
      shootRange: 640
    });
  }

  function enrichWalkerThreats() {
    // Make all walkers capable of firing aimed energy bolts.
    levelDefs.forEach(level => {
      (level.enemies || []).forEach(enemy => {
        if (enemy.type === 'walker') {
          enemy.shoot = enemy.shoot ?? true;
          enemy.cooldown = enemy.cooldown ?? 1.85;
          enemy.shootRange = enemy.shootRange ?? 620;
          enemy.hp = enemy.hp ?? 1;
        }
      });
    });

    // Extra walkers added across the city so levels feel more alive and challenging.
    addExtraWalker(1, 2140, 466, 2020, 2290, 82, 1, 2.05);
    addExtraWalker(2, 2860, 516, 2760, 3040, 96, 1, 1.85);
    addExtraWalker(3, 2320, 426, 2140, 2420, 90, 1, 1.75);
    addExtraWalker(3, 3100, 516, 2980, 3300, 94, 1, 1.7);
    addExtraWalker(4, 2220, 516, 2040, 2380, 108, 1, 1.65);
    addExtraWalker(5, 2820, 396, 2660, 2920, 96, 1, 1.65);
    addExtraWalker(6, 2260, 516, 2100, 2580, 108, 2, 1.55);
    addExtraWalker(7, 2520, 486, 2180, 2620, 104, 1, 1.55);
    addExtraWalker(7, 3640, 516, 3440, 3820, 112, 1, 1.45);
    addExtraWalker(8, 2840, 486, 2720, 3120, 112, 1, 1.45);
    addExtraWalker(9, 3500, 486, 3220, 3720, 114, 2, 1.35);
    addExtraWalker(10, 2520, 486, 2320, 2800, 118, 2, 1.3);
    addExtraWalker(10, 3920, 516, 3600, 4100, 120, 2, 1.2);
  }

  enrichWalkerThreats();

  const imageSources = new Set();
  Object.values(spriteGroups).flat().forEach(s => imageSources.add(s));
  levelDefs.forEach(l => imageSources.add(l.bg));

  const images = {};
  const keys = {};
  let last = performance.now();
  let touchDir = 0;
  let dragMode = false;
  let dragStart = null;
  let lastLiveScore = -1;
  let lastLiveAt = 0;

  function defaultState() {
    return {
      score: 0,
      coins: 0,
      best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
      lives: 3,
      levelIndex: 0,
      unlockedLevels: 1,
      skin: 'hero_blue',
      started: false,
      paused: false,
      muted: false,
      onMap: false
    };
  }

  let state = loadState();

  const game = {
    cameraX: 0,
    levelComplete: false,
    gameOver: false,
    missionAccepted: false,
    missionShown: false,
    objectiveCount: 0,
    speechTimer: 0,
    speechText: '',
    stars: 3,
    coins: [],
    tokens: [],
    badges: [],
    powers: [],
    enemies: [],
    obstacles: [],
    platforms: [],
    projectiles: [],
    enemyProjectiles: [],
    particles: [],
    boss: null
  };

  const player = {
    x: 0, y: 0, w: 62, h: 82,
    vx: 0, vy: 0, speed: 235, jump: -500,
    onGround: false, dir: 1, invuln: 0, anim: 0,
    shootCooldown: 0, shield: 0, blasterTimer: 0
  };

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      return raw ? {...defaultState(), ...raw} : defaultState();
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    localStorage.setItem(BEST_KEY, String(Math.floor(state.best)));
  }

  function loadImages() {
    return Promise.all([...imageSources].map(src => new Promise(resolve => {
      const img = new Image();
      images[src] = img;
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    })));
  }

  function currentLevel() { return levelDefs[state.levelIndex]; }
  function screenW() { return canvas.getBoundingClientRect().width || 960; }
  function screenH() { return canvas.getBoundingClientRect().height || 540; }
  function scaleY() { return screenH() / DESIGN_H; }
  function viewW() { return screenW() / scaleY(); }
  function clamp(v,a,b) { return Math.max(a, Math.min(b, v)); }
  function rectsIntersect(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function spriteFrame(group, speed=160) {
    const arr = spriteGroups[group];
    if (!arr) return null;
    const idx = Math.floor((performance.now()/speed) % arr.length);
    return images[arr[idx]];
  }

  function spriteImage(group, frameIndex=0) {
    const arr = spriteGroups[group];
    if (!arr || !arr.length) return null;
    const index = Math.max(0, Math.min(arr.length - 1, frameIndex));
    return images[arr[index]];
  }

  function hasLeftRightInput() {
    return !!(
      keys['ArrowLeft'] || keys['KeyA'] ||
      keys['ArrowRight'] || keys['KeyD'] ||
      touchDir !== 0
    );
  }

  function heroFrameForState() {
    // Hero image order:
    // 01 = standing / pose, 02 = running, 03 = jump.
    if (!player.onGround) return spriteImage(state.skin, 2);
    if (hasLeftRightInput() && Math.abs(player.vx) > 5) return spriteImage(state.skin, 1);
    return spriteImage(state.skin, 0);
  }


  // Audio
  let AC = null, master = null, musicInt = null, musicStep = 0;
  function ensureAudio() {
    if (state.muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.12;
      master.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  }
  function tone(freq, dur=0.08, type='sine', gain=0.04, delay=0) {
    const ac = ensureAudio();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    osc.connect(g); g.connect(master); osc.start(t0); osc.stop(t0+dur+0.03);
  }
  function sfx(kind) {
    if (kind === 'coin') { tone(720,.05,'triangle',.05); tone(980,.06,'sine',.03,.04); }
    if (kind === 'jump') tone(420,.05,'triangle',.045);
    if (kind === 'shoot') tone(760,.05,'triangle',.035);
    if (kind === 'enemyShoot') tone(300,.05,'square',.025);
    if (kind === 'hit') tone(160,.14,'sawtooth',.05);
    if (kind === 'boss') { tone(210,.08,'square',.05); tone(320,.08,'square',.04,.08); }
    if (kind === 'power') { tone(520,.06,'triangle',.05); tone(820,.08,'sine',.035,.05); }
    if (kind === 'level') { tone(392,.08,'triangle',.05); tone(554,.09,'triangle',.04,.06); tone(784,.12,'sine',.03,.14); }
    if (kind === 'npc') { tone(520,.05,'triangle',.03); tone(640,.05,'triangle',.02,.05); }
  }
  function musicTick() {
    if (!state.started || state.paused || game.levelComplete || game.gameOver || state.onMap || state.muted) return;
    const mood = state.levelIndex < 4 ? [220,262,330,392,330,294] : state.levelIndex < 7 ? [196,247,294,370,294,247] : [175,220,262,330,262,220];
    const n = mood[musicStep++ % mood.length];
    tone(n,.09,'triangle',.009);
    if (musicStep % 2 === 0) tone(n/2,.12,'sine',.006);
  }
  function startMusic() { if (!musicInt && !state.muted) musicInt = setInterval(musicTick, 270); }
  function stopMusic() { if (musicInt) clearInterval(musicInt); musicInt = null; }

  function postScore(mode='live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 150) return;
    lastLiveScore = clean; lastLiveAt = now;
    const payload = { gameSlug: GAME_SLUG, slug: GAME_SLUG, score: clean, best: Math.max(state.best, clean), level: currentLevel().id, mode };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, {gameSlug: GAME_SLUG}); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, {gameSlug: GAME_SLUG}); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({type:'GG_SCORE', ...payload, payload}, '*'); } catch {}
    try { window.parent?.postMessage?.({type:'gg:score', ...payload, payload}, '*'); } catch {}
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function syncUI() {
    const lv = currentLevel();
    ui.scoreValue.textContent = Math.floor(state.score);
    ui.coinsValue.textContent = state.coins;
    ui.livesValue.textContent = state.lives;
    ui.levelValue.textContent = lv.id;
    ui.missionText.textContent = lv.mission;
    const powerInfo = player.shield > 0 ? ' Shield active.' : player.blasterTimer > 0 ? ' Blaster active.' : '';
    ui.storyText.textContent = game.speechText || (game.missionAccepted ? 'Mission active: collect items, use Shoot on enemies, use moving platforms, then reach the glowing exit.' + powerInfo : lv.story);
    ui.objectiveText.textContent = `${game.objectiveCount} / ${lv.target}`;
    ui.progressBar.style.width = `${Math.min(100, game.objectiveCount / lv.target * 100)}%`;
    ui.skinHint.textContent = `Green unlocks at 25 coins • Shadow unlocks at 60 coins • Current: ${state.skin.replace('hero_','').toUpperCase()}`;
    ui.muteBtn.textContent = state.muted ? 'Sound Off' : 'Sound On';
    ui.pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
    ui.skinGreenBtn.classList.toggle('locked', state.coins < 25);
    ui.skinShadowBtn.classList.toggle('locked', state.coins < 60);
  }

  function makeRuntimeItems(points, type) {
    const size = type === 'coin' ? 34 : 40;
    return points.map(([x,y]) => ({x,y,w:size,h:size,taken:false,type}));
  }

  function resetLevelRuntime() {
    const lv = currentLevel();
    game.cameraX = 0;
    game.levelComplete = false;
    game.gameOver = false;
    game.missionAccepted = false;
    game.missionShown = false;
    game.objectiveCount = 0;
    game.speechTimer = 0;
    game.speechText = '';
    game.stars = 3;
    game.coins = makeRuntimeItems(lv.coins || [], 'coin');
    game.tokens = makeRuntimeItems(lv.tokens || [], 'token');
    game.badges = makeRuntimeItems(lv.badges || [], 'badge');
    game.powers = (lv.powers || []).map(([type,x,y]) => ({type,x,y,w:42,h:42,taken:false}));
    game.enemies = (lv.enemies || []).map(e => ({...e, w:e.type === 'drone' ? 72 : 64, h:e.type === 'drone' ? 54 : 74, dir:1, dead:false, shootTimer:e.cooldown || 1.5}));
    game.obstacles = (lv.obstacles || []).map(o => ({...o, dir:1}));
    game.platforms = (lv.platforms || []).map(p => ({...p, baseX:p.x, baseY:p.y, dir:1, prevX:p.x, prevY:p.y}));
    game.projectiles = [];
    game.enemyProjectiles = [];
    game.particles = [];
    game.boss = lv.boss ? {...lv.boss, dir:1, alive:true, shootTimer:lv.boss.cooldown || 1.4, stompTimer:0} : null;

    player.x = lv.start.x; player.y = lv.start.y;
    player.vx = 0; player.vy = 0; player.onGround = false; player.invuln = 0; player.dir = 1;
    player.shootCooldown = 0; player.shield = 0; player.blasterTimer = 0;
  }

  function startGame() {
    state = loadState();
    state.started = true;
    state.onMap = false;
    state.paused = false;
    state.lives = Math.max(3, state.lives || 3);
    ui.startOverlay.classList.remove('active');
    ui.levelOverlay.classList.remove('active');
    ui.gameOverOverlay.classList.remove('active');
    ui.mapOverlay.classList.remove('active');
    loadLevel(state.levelIndex || 0, true);
    startMusic();
    saveState();
  }

  function loadLevel(index, preserveLives=false) {
    state.levelIndex = clamp(index, 0, levelDefs.length - 1);
    if (!preserveLives) state.lives = 3;
    state.paused = false;
    state.onMap = false;
    resetLevelRuntime();
    syncUI();
    renderMap();
    saveState();
  }

  function renderMap() {
    ui.mapGrid.innerHTML = '';
    levelDefs.forEach((lv, i) => {
      const btn = document.createElement('button');
      btn.className = 'map-node ' + (i < state.unlockedLevels ? 'unlocked' : 'locked');
      btn.innerHTML = `<strong>${lv.id}. ${lv.title}</strong><br><small>${lv.subtitle}</small>`;
      btn.disabled = i >= state.unlockedLevels;
      btn.addEventListener('click', () => {
        ui.mapOverlay.classList.remove('active');
        state.onMap = false;
        loadLevel(i);
        startMusic();
      });
      ui.mapGrid.appendChild(btn);
    });
  }

  function openMap() {
    state.onMap = true; state.paused = true; stopMusic();
    renderMap();
    ui.mapOverlay.classList.add('active');
  }

  function closeMap() {
    state.onMap = false; state.paused = false;
    ui.mapOverlay.classList.remove('active');
    if (state.started && !game.levelComplete && !game.gameOver) startMusic();
  }

  function movePlayer(dir) {
    player.vx = dir * player.speed;
    if (dir !== 0) player.dir = Math.sign(dir);
  }

  function jump() {
    if (!state.started || state.paused || game.levelComplete || game.gameOver) return;
    if (player.onGround) {
      player.vy = player.jump;
      player.onGround = false;
      sfx('jump');
    }
  }

  function shoot() {
    if (!state.started || state.paused || game.levelComplete || game.gameOver) return;
    if (player.shootCooldown > 0) return;
    const fast = player.blasterTimer > 0;
    player.shootCooldown = fast ? 0.15 : 0.34;
    game.projectiles.push({
      x: player.x + (player.dir > 0 ? player.w - 6 : -20),
      y: player.y + 34,
      w: 34, h: 16,
      vx: player.dir * (fast ? 620 : 500),
      life: 1.2,
      power: fast ? 2 : 1
    });
    sfx('shoot');
  }

  function tryAction() {
    const lv = currentLevel();
    for (const npc of lv.npcs || []) {
      if (!game.missionAccepted && Math.abs((player.x+player.w/2)-npc.x) < 100) {
        game.missionAccepted = true;
        game.missionShown = true;
        game.speechTimer = 4.4;
        game.speechText = npc.text;
        sfx('npc');
        syncUI();
        return;
      }
    }
    if (canCompleteAtExit()) completeLevel();
  }

  function canCompleteAtExit() {
    const lv = currentLevel();
    const exitBox = {x:lv.exit.x,y:lv.exit.y,w:lv.exit.w,h:lv.exit.h};
    const playerBox = {x:player.x,y:player.y,w:player.w,h:player.h};
    return rectsIntersect(playerBox, exitBox) && game.objectiveCount >= lv.target && (!game.boss || !game.boss.alive);
  }

  function updateMovingPlatforms(dt) {
    for (const p of game.platforms) {
      p.prevX = p.x; p.prevY = p.y;
      if (!p.move) continue;
      if (p.move.axis === 'x') {
        p.x += p.move.speed * p.dir * dt;
        if (p.x < p.move.min || p.x > p.move.max) { p.dir *= -1; p.x = clamp(p.x, p.move.min, p.move.max); }
      } else {
        p.y += p.move.speed * p.dir * dt;
        if (p.y < p.move.min || p.y > p.move.max) { p.dir *= -1; p.y = clamp(p.y, p.move.min, p.move.max); }
      }
    }
  }

  function applyPhysics(dt) {
    const lv = currentLevel();
    player.vy += 990 * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.onGround = false;

    if (player.x < 0) player.x = 0;
    if (player.x + player.w > lv.width) player.x = lv.width - player.w;

    for (const p of game.platforms) {
      const wasAbove = player.y + player.h - player.vy*dt <= p.y + 12;
      if (player.x < p.x + p.w && player.x + player.w > p.x && player.y < p.y + p.h && player.y + player.h > p.y) {
        if (wasAbove && player.vy >= 0) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;
          if (p.move) {
            player.x += (p.x - p.prevX);
            player.y += (p.y - p.prevY);
          }
        } else if (player.vx > 0) player.x = p.x - player.w;
        else if (player.vx < 0) player.x = p.x + p.w;
      }
    }

    if (player.y > DESIGN_H + 220) loseLife('You fell!');
    player.vx *= player.onGround ? 0.76 : 0.94;
    if (Math.abs(player.vx) < 6) player.vx = 0;
    game.cameraX = clamp(player.x - viewW()*0.35, 0, Math.max(0, lv.width - viewW()));
  }

  function loseLife(msg='Hit!') {
    if (player.invuln > 0 || game.levelComplete || game.gameOver) return;
    if (player.shield > 0) {
      player.shield = 0;
      player.invuln = 0.7;
      game.speechText = 'Shield blocked the hit!';
      game.speechTimer = 1.3;
      sfx('power');
      syncUI();
      return;
    }
    state.lives--;
    player.invuln = 1.4;
    player.x = Math.max(30, player.x - 80);
    player.y = Math.max(60, player.y - 40);
    player.vx = 0; player.vy = -220;
    game.speechText = msg;
    game.speechTimer = 1.6;
    sfx('hit');
    state.score = Math.max(0, state.score - 80);
    if (state.lives <= 0) triggerGameOver();
    syncUI();
    postScore('live');
  }

  function addObjective(points=1) {
    game.objectiveCount += points;
  }

  function collectThings() {
    const box = {x:player.x,y:player.y,w:player.w,h:player.h};
    for (const c of game.coins) if (!c.taken && rectsIntersect(box,c)) {
      c.taken = true; state.coins++; state.score += 50; addObjective();
      addParticles(c.x+18,c.y+18,'#ffd36b'); sfx('coin'); syncUI(); postScore('live');
    }
    for (const t of game.tokens) if (!t.taken && rectsIntersect(box,t)) {
      t.taken = true; state.score += 150; addObjective();
      addParticles(t.x+20,t.y+20,'#78b4ff'); sfx('coin'); syncUI(); postScore('live');
    }
    for (const b of game.badges) if (!b.taken && rectsIntersect(box,b)) {
      b.taken = true; state.score += 200; addObjective();
      addParticles(b.x+20,b.y+20,'#66ddb0'); sfx('coin'); syncUI(); postScore('live');
    }
    for (const p of game.powers) if (!p.taken && rectsIntersect(box,p)) {
      p.taken = true; activatePower(p.type);
      addParticles(p.x+20,p.y+20, p.type==='heart' ? '#ff6c76' : p.type==='shield' ? '#66ddb0' : '#78b4ff', 24);
      syncUI(); postScore('live');
    }
  }

  function activatePower(type) {
    if (type === 'heart') {
      state.lives = Math.min(5, state.lives + 1);
      game.speechText = 'Extra life gained!';
    } else if (type === 'shield') {
      player.shield = 1;
      game.speechText = 'Shield ready. It blocks one hit.';
    } else if (type === 'blaster') {
      player.blasterTimer = 8;
      game.speechText = 'Blaster active. Shoot faster!';
    }
    game.speechTimer = 2.2;
    state.score += 100;
    sfx('power');
  }

  function updateEnemies(dt) {
    const playerBox = {x:player.x,y:player.y,w:player.w,h:player.h};
    for (const e of game.enemies) {
      if (e.dead) continue;
      if (e.type === 'walker') {
        e.x += e.speed * e.dir * dt;
        if (e.x < e.minX || e.x > e.maxX) { e.dir *= -1; e.x = clamp(e.x, e.minX, e.maxX); }
      } else {
        e.x += e.speed * e.dir * dt;
        if (e.x < e.minX || e.x > e.maxX) { e.dir *= -1; e.x = clamp(e.x, e.minX, e.maxX); }
        e.y += Math.sin(performance.now()*0.003 + e.x*0.01) * 20 * dt;
      }
      if (e.shoot) {
        e.shootTimer -= dt;
        const distanceToPlayer = Math.abs((player.x + player.w / 2) - (e.x + e.w / 2));
        if (e.shootTimer <= 0 && distanceToPlayer <= (e.shootRange || 680)) {
          e.shootTimer = e.cooldown || (e.type === 'walker' ? 1.75 : 1.3);
          const originX = e.x + e.w / 2;
          const originY = e.type === 'walker' ? e.y + e.h * 0.45 : e.y + e.h / 2;
          fireEnemyProjectile(originX, originY, e.type === 'walker' ? 275 : 320);
        }
      }

      if (rectsIntersect(playerBox, {x:e.x,y:e.y,w:e.w,h:e.h})) {
        const stomp = player.vy > 0 && (player.y + player.h - 14) < (e.y + 18);
        if (stomp) damageEnemy(e, 2, e.x+e.w/2, e.y+e.h/2);
        else loseLife('Enemy hit!');
      }
    }
    game.enemies = game.enemies.filter(e => !e.dead);
  }

  function damageEnemy(e, amount, x, y) {
    e.hp -= amount;
    player.vy = Math.min(player.vy, -260);
    addParticles(x,y,'#ff9f52',18);
    sfx('boss');
    if (e.hp <= 0) {
      e.dead = true;
      state.score += e.type === 'drone' ? 180 : 120;
    }
  }

  function updateObstacles(dt) {
    const playerBox = {x:player.x,y:player.y,w:player.w,h:player.h};
    for (const o of game.obstacles) {
      if (o.moving) {
        o.x += o.speed * o.dir * dt;
        if (o.x < o.minX || o.x > o.maxX) { o.dir *= -1; o.x = clamp(o.x,o.minX,o.maxX); }
      }
      const box = {x:o.x,y:o.y,w:o.w,h:o.h};
      if (!rectsIntersect(playerBox, box)) continue;
      if (o.type === 'crate') {
        const wasAbove = player.y + player.h - player.vy*dt <= o.y + 10;
        if (wasAbove && player.vy >= 0) { player.y = o.y - player.h; player.vy = 0; player.onGround = true; }
        else if (player.vx > 0) player.x = o.x - player.w;
        else if (player.vx < 0) player.x = o.x + o.w;
      } else if (o.type === 'spikes') loseLife('Spikes!');
      else loseLife(o.type === 'taxi' ? 'Taxi crash!' : 'Obstacle hit!');
    }
  }

  function updateBoss(dt) {
    if (!game.boss || !game.boss.alive) return;
    const b = game.boss;
    b.x += b.speed * b.dir * dt;
    if (b.x < b.minX || b.x > b.maxX) { b.dir *= -1; b.x = clamp(b.x,b.minX,b.maxX); }
    if (b.stompTimer > 0) b.stompTimer -= dt;
    if (b.shoot) {
      b.shootTimer -= dt;
      if (b.shootTimer <= 0) {
        b.shootTimer = b.cooldown || 1.2;
        fireEnemyProjectile(b.x + b.w/2, b.y + 40, 360);
      }
    }
    const playerBox = {x:player.x,y:player.y,w:player.w,h:player.h};
    const bossBox = {x:b.x,y:b.y,w:b.w,h:b.h};
    if (rectsIntersect(playerBox,bossBox)) {
      const stomp = player.vy > 0 && (player.y + player.h - 10) < (b.y + 24) && b.stompTimer <= 0;
      if (stomp) {
        b.hp -= 2; b.stompTimer = 0.8; player.vy = -360; addObjective(); state.score += 260;
        addParticles(b.x+b.w/2,b.y+b.h/2,'#ff6c76',28); sfx('boss');
        if (b.hp <= 0) defeatBoss();
      } else loseLife('Boss slammed you!');
    }
  }

  function defeatBoss() {
    if (!game.boss || !game.boss.alive) return;
    game.boss.alive = false;
    state.score += 1000;
    addObjective(2);
    game.speechText = 'Boss defeated! Reach the glowing exit gate.';
    game.speechTimer = 4;
    sfx('level');
  }

  function fireEnemyProjectile(x,y,speed=320) {
    const dx = (player.x + player.w/2) - x;
    const dy = (player.y + player.h/2) - y;
    const len = Math.max(1, Math.hypot(dx,dy));
    game.enemyProjectiles.push({x,y,w:28,h:14,vx:dx/len*speed,vy:dy/len*speed,life:2.5});
    sfx('enemyShoot');
  }

  function updateProjectiles(dt) {
    for (const p of game.projectiles) {
      p.x += p.vx * dt;
      p.life -= dt;
      for (const e of game.enemies) {
        if (!e.dead && rectsIntersect(p,{x:e.x,y:e.y,w:e.w,h:e.h})) {
          p.life = 0;
          e.hp -= p.power;
          addParticles(e.x+e.w/2,e.y+e.h/2,'#78b4ff',18);
          if (e.hp <= 0) { e.dead = true; state.score += e.type==='drone'?180:120; sfx('boss'); }
          break;
        }
      }
      if (game.boss && game.boss.alive && rectsIntersect(p,{x:game.boss.x,y:game.boss.y,w:game.boss.w,h:game.boss.h})) {
        p.life = 0;
        game.boss.hp -= p.power;
        state.score += 70;
        addParticles(game.boss.x+game.boss.w/2,game.boss.y+game.boss.h/2,'#78b4ff',18);
        if (game.boss.hp <= 0) defeatBoss(); else sfx('boss');
      }
    }
    game.projectiles = game.projectiles.filter(p => p.life > 0 && p.x > game.cameraX-120 && p.x < game.cameraX + viewW() + 120);

    const playerBox = {x:player.x,y:player.y,w:player.w,h:player.h};
    for (const p of game.enemyProjectiles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (rectsIntersect(playerBox,p)) {
        p.life = 0;
        loseLife('Enemy shot!');
      }
    }
    game.enemyProjectiles = game.enemyProjectiles.filter(p => p.life > 0);
  }

  function checkExitAutoComplete() {
    if (canCompleteAtExit()) completeLevel();
  }

  function completeLevel() {
    if (game.levelComplete) return;
    game.levelComplete = true;
    stopMusic();
    const lv = currentLevel();
    const bonus = 300 + state.lives * 100 + game.objectiveCount * 20 + (player.shield ? 100 : 0);
    state.score += bonus;
    state.best = Math.max(state.best, state.score);
    state.unlockedLevels = Math.max(state.unlockedLevels, state.levelIndex + 2);
    state.unlockedLevels = Math.min(state.unlockedLevels, levelDefs.length);
    game.stars = state.lives === 3 ? 3 : state.lives === 2 ? 2 : 1;
    ui.levelTitle.textContent = `${lv.title} Complete`;
    ui.levelSummary.textContent = state.levelIndex === levelDefs.length - 1
      ? 'You completed the final trial and rose as the city guardian.'
      : 'Mission cleared. The next part of the city is now open.';
    ui.rewardText.textContent = `Bonus +${bonus} • Best ${Math.floor(Math.max(state.best,state.score))}`;
    ui.starRow.textContent = '★ '.repeat(game.stars).trim();
    ui.levelOverlay.classList.add('active');
    saveState(); syncUI(); sfx('level'); postScore('level_complete');
  }

  function nextLevel() {
    if (state.levelIndex >= levelDefs.length - 1) { triggerGameOver(true); return; }
    ui.levelOverlay.classList.remove('active');
    loadLevel(state.levelIndex + 1);
    state.paused = false; state.onMap = false;
    startMusic(); postScore('next_level');
  }

  function triggerGameOver(win=false) {
    game.gameOver = true;
    stopMusic();
    state.best = Math.max(state.best, state.score);
    saveState();
    ui.gameOverTitle.textContent = win ? 'Guardian Rises!' : 'Mission Failed';
    ui.gameOverSummary.textContent = win ? `Final score: ${Math.floor(state.score)}. You restored the city and rose as guardian.` : `Final score: ${Math.floor(state.score)}. Try again and reclaim the city.`;
    ui.gameOverOverlay.classList.add('active');
    postScore(win ? 'game_won' : 'game_over');
  }

  function addParticles(x,y,color='#fff',n=18) {
    for (let i=0;i<n;i++) {
      const a = Math.random()*Math.PI*2, s = 50 + Math.random()*135;
      game.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0.9,ttl:0.9,size:3+Math.random()*5,color});
    }
  }

  function updateParticles(dt) {
    for (const p of game.particles) {
      p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= 0.985; p.vy *= 0.985;
    }
    game.particles = game.particles.filter(p => p.life > 0);
  }

  function update(dt) {
    if (!state.started || state.paused || state.onMap || game.levelComplete || game.gameOver) return;
    if (player.invuln > 0) player.invuln -= dt;
    if (player.shootCooldown > 0) player.shootCooldown -= dt;
    if (player.blasterTimer > 0) player.blasterTimer = Math.max(0, player.blasterTimer - dt);
    if (game.speechTimer > 0) {
      game.speechTimer -= dt;
      if (game.speechTimer <= 0) game.speechText = '';
    }
    player.anim += dt * Math.abs(player.vx) * 0.04 + dt * 4;

    const move = (keys['ArrowLeft'] || keys['KeyA'] ? -1 : 0) + (keys['ArrowRight'] || keys['KeyD'] ? 1 : 0) + touchDir;
    const horizontalInput = clamp(move, -1, 1);
    movePlayer(horizontalInput);
    if (horizontalInput === 0) player.vx = 0;

    updateMovingPlatforms(dt);
    applyPhysics(dt);
    collectThings();
    checkExitAutoComplete();
    updateEnemies(dt);
    updateObstacles(dt);
    updateBoss(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    syncUI();
  }

  function drawBackground() {
    const bg = images[currentLevel().bg];
    const w = viewW(), h = DESIGN_H;
    if (bg && bg.width) {
      const ratio = Math.max(w/bg.width, h/bg.height);
      const dw = bg.width * ratio, dh = bg.height * ratio;
      const parallax = game.cameraX * 0.12;
      ctx.drawImage(bg, -parallax % Math.max(1,dw-w), (h-dh)/2, dw, dh);
      if (dw < w*1.5) ctx.drawImage(bg, dw - (parallax % dw), (h-dh)/2, dw, dh);
    } else {
      ctx.fillStyle = '#0b1021'; ctx.fillRect(0,0,w,h);
    }
  }

  function roundRect(x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }

  function drawWorld() {
    const cam = game.cameraX;
    const lv = currentLevel();

    // platforms
    for (const p of game.platforms) {
      const x = p.x - cam;
      if (p.move) {
        const img = spriteFrame('lift', 260);
        if (img && img.width) ctx.drawImage(img, x, p.y-12, p.w, Math.max(56,p.h+24));
        else { ctx.fillStyle = '#69778f'; roundRect(x,p.y,p.w,p.h,14); ctx.fill(); }
      } else {
        ctx.fillStyle = '#3a3342'; roundRect(x,p.y,p.w,p.h,12); ctx.fill();
        ctx.strokeStyle = 'rgba(255,250,235,0.2)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(255,220,170,0.08)'; ctx.fillRect(x+10,p.y+12,Math.max(0,p.w-20),12);
      }
    }

    // exit
    const ex = lv.exit.x - cam;
    ctx.fillStyle = 'rgba(255,246,220,0.18)'; roundRect(ex,lv.exit.y,lv.exit.w,lv.exit.h,14); ctx.fill();
    ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#fff5d6'; ctx.font = '900 16px Inter, system-ui, sans-serif'; ctx.fillText('EXIT', ex-2, lv.exit.y-12);

    // NPCs slowly hover up and down to make guides feel alive.
    for (const npc of lv.npcs || []) {
      const img = spriteFrame(npc.kind || 'npc', 280);
      const hover = Math.sin(performance.now() * 0.0018 + npc.x * 0.01) * 7;
      const x = npc.x - 30 - cam;
      const y = npc.y - 54 + hover;
      if (img && img.width) ctx.drawImage(img, x, y, 60, 60);
      if (!game.missionAccepted && Math.abs((player.x+player.w/2)-npc.x) < 130) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '900 16px Inter, system-ui, sans-serif';
        ctx.fillText('Action', npc.x-cam-24, npc.y-62 + hover);
      }
    }

    const drawCollect = (arr, group, size) => {
      const img = spriteFrame(group, 180);
      for (const c of arr) {
        if (c.taken) continue;
        const x = c.x - cam, y = c.y + Math.sin(performance.now()*0.004 + c.x*0.02)*5;
        if (img && img.width) ctx.drawImage(img,x,y,size,size);
      }
    };
    drawCollect(game.coins,'coin',28); drawCollect(game.tokens,'token',34); drawCollect(game.badges,'badge',34);

    for (const p of game.powers) {
      if (p.taken) continue;
      const group = p.type === 'shield' ? 'shieldPower' : p.type === 'heart' ? 'heartPower' : 'blasterPower';
      const img = spriteFrame(group, 220);
      const x = p.x - cam, y = p.y + Math.sin(performance.now()*0.005+p.x)*4;
      if (img && img.width) ctx.drawImage(img,x,y,38,38);
    }

    // obstacles
    for (const o of game.obstacles) {
      const group = o.type === 'taxi' ? 'taxi' : o.type === 'spikes' ? 'spikes' : 'crate';
      const img = spriteFrame(group, 220);
      const x = o.x - cam, y = o.y;
      if (img && img.width) ctx.drawImage(img,x,y,o.w,o.h);
      else { ctx.fillStyle = o.type==='spikes' ? '#c0c8d0' : '#8a6042'; ctx.fillRect(x,y,o.w,o.h); }
    }

    // enemies
    for (const e of game.enemies) {
      const img = spriteFrame(e.type === 'drone' ? 'drone' : 'walker', e.type === 'drone' ? 220 : 180);
      if (img && img.width) ctx.drawImage(img,e.x-cam,e.y,e.w,e.h);
      if (e.hp > 1) {
        ctx.fillStyle = 'rgba(0,0,0,.45)'; roundRect(e.x-cam,e.y-12,e.w,7,4); ctx.fill();
        ctx.fillStyle = '#ff9f52'; roundRect(e.x-cam,e.y-12,e.w*(e.hp/2),7,4); ctx.fill();
      }
    }

    // boss
    if (game.boss && game.boss.alive) {
      const b = game.boss, img = spriteFrame('boss_taxi', 220);
      if (img && img.width) ctx.drawImage(img,b.x-cam,b.y,b.w,b.h);
      ctx.fillStyle = 'rgba(0,0,0,.45)'; roundRect(b.x-cam-10,b.y-28,160,14,7); ctx.fill();
      ctx.fillStyle = '#ff6c76'; roundRect(b.x-cam-10,b.y-28,160 * (b.hp/(currentLevel().boss.hp)),14,7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.stroke();
    }

    // projectiles
    const bolt = spriteFrame('bolt', 120);
    for (const p of game.projectiles) {
      if (bolt && bolt.width) ctx.drawImage(bolt, p.x-cam, p.y-7, 38, 24);
      else { ctx.fillStyle = '#78b4ff'; ctx.fillRect(p.x-cam,p.y,p.w,p.h); }
    }
    const ebolt = spriteFrame('enemyBolt', 120);
    for (const p of game.enemyProjectiles) {
      if (ebolt && ebolt.width) ctx.drawImage(ebolt, p.x-cam, p.y-7, 34, 22);
      else { ctx.fillStyle = '#ff6c76'; ctx.fillRect(p.x-cam,p.y,p.w,p.h); }
    }

    // player: 01 standing/pose, 02 running only while left/right is pressed, 03 jump while airborne.
    const hero = heroFrameForState();
    ctx.save();
    ctx.translate(player.x-cam+player.w/2, player.y+player.h/2);
    ctx.scale(player.dir < 0 ? -1 : 1, 1);
    if (player.invuln > 0 && Math.floor(performance.now()/80)%2 === 0) ctx.globalAlpha = 0.35;
    if (hero && hero.width) ctx.drawImage(hero,-player.w/2-6,-player.h/2-8,player.w+12,player.h+12);
    ctx.restore();

    if (player.shield > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(102,221,176,.85)';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(player.x-cam+player.w/2, player.y+player.h/2, 56, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }

    // Particles
    for (const p of game.particles) {
      const a = p.life / p.ttl;
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x-cam,p.y,p.size*a,0,Math.PI*2); ctx.fill(); ctx.restore();
    }

    // speech
    if (game.speechTimer > 0 && game.speechText) {
      ctx.save();
      ctx.font = '900 16px Inter, system-ui, sans-serif';
      const tw = Math.min(viewW()-100, ctx.measureText(game.speechText).width + 28);
      const tx = 30, ty = 80;
      ctx.fillStyle = 'rgba(12,14,22,0.78)';
      roundRect(tx,ty,tw,56,16); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
      ctx.fillStyle = '#fff8ed'; wrapText(game.speechText,tx+14,ty+22,tw-28,18);
      ctx.restore();
    }

    // HUD
    ctx.save();
    ctx.fillStyle = 'rgba(10,12,22,.44)'; roundRect(16,16,viewW()-32,50,14); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
    ctx.fillStyle = '#fff8ed'; ctx.font = '900 18px Inter, system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(lv.title, 28, 46);
    ctx.textAlign = 'right';
    ctx.fillStyle = player.blasterTimer > 0 ? '#78b4ff' : player.shield > 0 ? '#66ddb0' : '#ffd36b';
    const power = player.blasterTimer > 0 ? `Blaster ${Math.ceil(player.blasterTimer)}s` : player.shield > 0 ? 'Shield ON' : 'Power Ready';
    ctx.fillText(power, viewW()-28, 46);
    ctx.restore();
  }

  function wrapText(text,x,y,maxWidth,lineHeight) {
    const words = text.split(' ');
    let line = '', yy = y;
    for (let n=0;n<words.length;n++) {
      const test = line + words[n] + ' ';
      if (ctx.measureText(test).width > maxWidth && n > 0) {
        ctx.fillText(line,x,yy);
        line = words[n] + ' ';
        yy += lineHeight;
      } else line = test;
    }
    ctx.fillText(line,x,yy);
  }

  function draw() {
    ctx.clearRect(0,0,screenW(),screenH());
    const s = scaleY();
    ctx.save();
    ctx.scale(s,s);
    drawBackground();
    drawWorld();
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now-last)/1000));
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function setSkin(skin) {
    if (skin === 'hero_green' && state.coins < 25) return;
    if (skin === 'hero_shadow' && state.coins < 60) return;
    state.skin = skin;
    saveState();
    syncUI();
  }

  function bindEvents() {
    document.getElementById('playBtn').addEventListener('click', startGame);
    document.getElementById('howBtn').addEventListener('click', () => ui.helpOverlay.classList.add('active'));
    document.getElementById('closeHelpBtn').addEventListener('click', () => ui.helpOverlay.classList.remove('active'));
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    document.getElementById('mapBtn').addEventListener('click', () => { ui.levelOverlay.classList.remove('active'); openMap(); });
    document.getElementById('restartBtn').addEventListener('click', () => { ui.gameOverOverlay.classList.remove('active'); loadLevel(state.levelIndex); startMusic(); });
    document.getElementById('gameOverMapBtn').addEventListener('click', () => { ui.gameOverOverlay.classList.remove('active'); openMap(); });
    document.getElementById('closeMapBtn').addEventListener('click', closeMap);
    document.getElementById('mapOpenBtn').addEventListener('click', openMap);

    ui.skinBlueBtn.addEventListener('click', () => setSkin('hero_blue'));
    ui.skinGreenBtn.addEventListener('click', () => setSkin('hero_green'));
    ui.skinShadowBtn.addEventListener('click', () => setSkin('hero_shadow'));

    const bindHold = (id, down, up=()=>{}) => {
      const el = document.getElementById(id);
      el.addEventListener('pointerdown', e => { e.preventDefault(); down(); });
      el.addEventListener('pointerup', e => { e.preventDefault(); up(); });
      el.addEventListener('pointerleave', up);
      el.addEventListener('pointercancel', up);
    };
    bindHold('leftBtn', () => touchDir = -1, () => touchDir = 0);
    bindHold('rightBtn', () => touchDir = 1, () => touchDir = 0);
    document.getElementById('jumpBtn').addEventListener('click', jump);
    document.getElementById('shootBtn').addEventListener('click', shoot);
    document.getElementById('actionBtn').addEventListener('click', tryAction);

    document.getElementById('submitScoreBtn').addEventListener('click', () => postScore('manual_submit'));
    ui.muteBtn.addEventListener('click', () => { state.muted = !state.muted; if (state.muted) stopMusic(); else startMusic(); syncUI(); saveState(); });
    ui.pauseBtn.addEventListener('click', () => { state.paused = !state.paused; if (state.paused) stopMusic(); else if (!state.onMap) startMusic(); syncUI(); });

    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); jump(); }
      if (e.code === 'KeyJ' || e.code === 'ControlLeft' || e.code === 'ControlRight') shoot();
      if (e.code === 'KeyE' || e.code === 'Enter') tryAction();
      if (e.code === 'KeyM') openMap();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    // Canvas dragging is disabled for movement.
    // The player moves only while Left/Right buttons or left/right keyboard keys are pressed.
    canvas.addEventListener('pointerdown', () => { dragMode = false; dragStart = null; });
    canvas.addEventListener('pointermove', () => {});
    canvas.addEventListener('pointerup', () => {});
    canvas.addEventListener('pointercancel', () => {});

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('message', ev => {
      const data = ev.data || {};
      const type = data.type || data.event;
      if (type === 'GG_PAUSE') {
        state.paused = !!(data.payload?.paused ?? data.paused);
        if (state.paused) stopMusic(); else if (!state.onMap) startMusic();
        syncUI();
      }
      if (type === 'GG_RESTART') { loadLevel(state.levelIndex); startMusic(); }
      if (type === 'GG_MUTE') {
        state.muted = !!(data.payload?.muted ?? data.muted);
        if (state.muted) stopMusic(); else if (!state.onMap) startMusic();
        syncUI();
      }
    });
  }

  loadImages().then(() => {
    bindEvents();
    resizeCanvas();
    syncUI();
    renderMap();
    requestAnimationFrame(loop);
  });
})();