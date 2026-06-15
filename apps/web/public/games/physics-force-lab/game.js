(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const $ = id => document.getElementById(id);

  const ui = {
    storyText: $("storyText"),
    score: $("scoreValue"),
    level: $("levelValue"),
    health: $("healthValue"),
    tool: $("toolValue"),
    stars: $("starsValue"),
    badge: $("badgeValue"),
    topicLabel: $("topicLabel"),
    progressLabel: $("progressLabel"),
    objectiveText: $("objectiveText"),
    progressFill: $("progressFill"),
    conceptText: $("conceptText"),
    overlay: $("overlay"),
    overlayTitle: $("overlayTitle"),
    overlayText: $("overlayText"),
    startBtn: $("startBtn"),
    howBtn: $("howBtn"),
    quizPanel: $("quizPanel"),
    quizTopic: $("quizTopic"),
    quizQuestion: $("quizQuestion"),
    quizAnswers: $("quizAnswers"),
    toast: $("toast"),
    pauseBtn: $("pauseBtn"),
    muteBtn: $("muteBtn"),
    restartBtn: $("restartBtn"),
    leftBtn: $("leftBtn"),
    rightBtn: $("rightBtn"),
    jumpBtn: $("jumpBtn"),
    toolBtn: $("toolBtn"),
    blastBtn: $("blastBtn")
  };

  const GAME_SLUG = "physics-force-lab";
  const BEST_KEY = "wga_physics_force_lab_v3_best";

  const ASSETS = {
    backgrounds: [
      "./assets/backgrounds/level-01-force-lab.png",
      "./assets/backgrounds/level-02-motion-track.png",
      "./assets/backgrounds/level-03-gravity-chamber.png",
      "./assets/backgrounds/level-04-friction-factory.png",
      "./assets/backgrounds/level-05-energy-reactor.png",
      "./assets/backgrounds/level-06-machines-workshop.png",
      "./assets/backgrounds/level-07-circuit-lab.png",
      "./assets/backgrounds/level-08-magnet-zone.png",
      "./assets/backgrounds/level-09-wave-tunnel.png",
      "./assets/backgrounds/level-10-pressure-dome.png",
      "./assets/backgrounds/level-11-space-lab.png",
      "./assets/backgrounds/level-12-quantum-core.png"
    ],
    sprites: {
      idle: "./assets/sprites/player-idle.png",
      run: "./assets/sprites/player-run.png",
      jump: "./assets/sprites/player-jump.png",
      professor: "./assets/sprites/professor-newtonia.png",
      helper: "./assets/sprites/friendly-lab-bot.png",
      glitch: "./assets/sprites/glitch-bot.png",
      drone: "./assets/sprites/lab-drone.png",
      magnetBot: "./assets/sprites/magnetic-bot.png",
      boss: "./assets/sprites/boss-glitchbot.png"
    },
    items: {
      coin: "./assets/items/science-coin.png",
      force: "./assets/items/force-token.png",
      crystal: "./assets/items/energy-crystal.png",
      battery: "./assets/items/battery-cell.png",
      magnet: "./assets/items/magnet-shard.png",
      wave: "./assets/items/wave-orb.png",
      gravity: "./assets/items/gravity-star.png",
      key: "./assets/items/lab-key.png",
      card: "./assets/items/knowledge-card.png",
      health: "./assets/items/health-kit.png",
      jump: "./assets/items/super-jump.png",
      slow: "./assets/items/slow-motion.png",
      shield: "./assets/items/energy-shield.png",
      hint: "./assets/items/hint-orb.png"
    },
    effects: {
      blast: "./assets/effects/force-blast.png",
      gravity: "./assets/effects/gravity-field.png",
      beam: "./assets/effects/energy-beam.png",
      spark: "./assets/effects/spark.png",
      wave: "./assets/effects/wave-pulse.png",
      magnet: "./assets/effects/magnet-pulse.png"
    }
  };

  const LEVELS = [
    {
      name: "Force Starter Lab",
      topic: "Force is a push or pull.",
      story: "Professor Newtonia opens the academy doors. The first lab teaches the young physicist how pushes and pulls move objects.",
      objective: "Collect 8 science coins, push crates onto plates and solve the force challenge.",
      bg: 0,
      tool: "Force Glove",
      gravity: 1500,
      friction: 0.84,
      item: "force",
      targetCoins: 8,
      targetCards: 1,
      enemies: ["glitch"],
      quiz: {
        q: "Which statement best describes force?",
        a: ["A push or pull that can change motion", "A colour of light", "A type of food", "A kind of map"],
        correct: 0,
        fact: "Force can start, stop, speed up, slow down or change the direction of an object."
      }
    },
    {
      name: "Motion Track",
      topic: "Speed = distance ÷ time.",
      story: "The motion track activates. Moving platforms test timing, speed and distance.",
      objective: "Race through the track, collect 10 coins and solve the speed puzzle.",
      bg: 1,
      tool: "Speed Boots",
      gravity: 1500,
      friction: 0.88,
      item: "coin",
      targetCoins: 10,
      enemies: ["drone"],
      movingPlatforms: true,
      quiz: {
        q: "A learner travels 20 metres in 5 seconds. What is the speed?",
        a: ["4 m/s", "10 m/s", "25 m/s", "100 m/s"],
        correct: 0,
        fact: "Speed is calculated using distance divided by time."
      }
    },
    {
      name: "Gravity Chamber",
      topic: "Gravity pulls objects toward the centre of a planet.",
      story: "The gravity chamber malfunctions. Low-gravity pads and falling rocks turn the lab into a jumping experiment.",
      objective: "Collect 8 gravity stars and stabilise the gravity lift.",
      bg: 2,
      tool: "Gravity Shield",
      gravity: 1160,
      friction: 0.86,
      item: "gravity",
      targetCoins: 8,
      enemies: ["drone","glitch"],
      lowGravity: true,
      quiz: {
        q: "What does gravity do?",
        a: ["Pulls objects toward Earth", "Turns magnets off", "Creates paper", "Makes sound louder"],
        correct: 0,
        fact: "Gravity is the force that pulls objects with mass toward each other."
      }
    },
    {
      name: "Friction Factory",
      topic: "Friction is a force that opposes motion.",
      story: "Slippery panels and grip pads teach how surfaces affect movement.",
      objective: "Collect 9 science coins and cross low-friction platforms safely.",
      bg: 3,
      tool: "Grip Boots",
      gravity: 1500,
      friction: 0.72,
      item: "coin",
      targetCoins: 9,
      enemies: ["glitch"],
      slippery: true,
      quiz: {
        q: "Which surface usually has more friction?",
        a: ["Rough rubber", "Smooth ice", "Air", "A mirror"],
        correct: 0,
        fact: "Rougher surfaces usually create more friction than smooth surfaces."
      }
    },
    {
      name: "Energy Reactor",
      topic: "Energy changes form but is not destroyed.",
      story: "The academy reactor needs energy crystals. Stored energy becomes motion through launch pads and ramps.",
      objective: "Collect 7 energy crystals and restart the reactor.",
      bg: 4,
      tool: "Energy Beam",
      gravity: 1500,
      friction: 0.86,
      item: "crystal",
      targetCoins: 7,
      enemies: ["drone","glitch"],
      quiz: {
        q: "A ball at the top of a ramp has what kind of stored energy?",
        a: ["Potential energy", "No energy", "Sound energy only", "Friction energy"],
        correct: 0,
        fact: "Potential energy can change into kinetic energy when the ball moves."
      }
    },
    {
      name: "Machines Workshop",
      topic: "Simple machines make work easier.",
      story: "Broken gears, levers and pulleys block the workshop.",
      objective: "Collect 8 machine tokens and repair the gear gate.",
      bg: 5,
      tool: "Machine Master",
      gravity: 1500,
      friction: 0.84,
      item: "key",
      targetCoins: 8,
      enemies: ["drone","glitch"],
      movingPlatforms: true,
      quiz: {
        q: "Which item is a simple machine?",
        a: ["Lever", "Cloud", "Battery acid", "Song"],
        correct: 0,
        fact: "Levers, pulleys, wheels, axles, ramps and gears are simple machines."
      }
    },
    {
      name: "Electric Circuit Lab",
      topic: "A closed circuit allows electric current to flow.",
      story: "The lights go out. Battery cells and circuit panels bring the lab back online.",
      objective: "Collect 8 battery cells and complete the circuit challenge.",
      bg: 6,
      tool: "Circuit Tool",
      gravity: 1500,
      friction: 0.84,
      item: "battery",
      targetCoins: 8,
      enemies: ["drone","glitch"],
      electric: true,
      quiz: {
        q: "What is needed for current to flow in a simple circuit?",
        a: ["A complete closed path", "An open switch only", "No battery", "Only a magnet"],
        correct: 0,
        fact: "Current flows when there is a source and a complete path."
      }
    },
    {
      name: "Magnet Zone",
      topic: "Magnets can attract or repel.",
      story: "Magnetic bots drag metal crates across the lab. The young physicist uses magnetic pulses to control them.",
      objective: "Collect 8 magnet shards and unlock the magnetic gate.",
      bg: 7,
      tool: "Magnet Pulse",
      gravity: 1500,
      friction: 0.86,
      item: "magnet",
      targetCoins: 8,
      enemies: ["magnetBot","drone"],
      quiz: {
        q: "What happens when two north poles of magnets face each other?",
        a: ["They repel", "They disappear", "They melt", "They become batteries"],
        correct: 0,
        fact: "Like poles repel. Opposite poles attract."
      }
    },
    {
      name: "Wave Tunnel",
      topic: "Waves carry energy through vibrations.",
      story: "Light and sound signals are out of sync. Wave orbs tune the tunnel.",
      objective: "Collect 8 wave orbs and match the signal pattern.",
      bg: 8,
      tool: "Wave Scanner",
      gravity: 1500,
      friction: 0.84,
      item: "wave",
      targetCoins: 8,
      enemies: ["drone","glitch"],
      waveHazards: true,
      quiz: {
        q: "What does wave amplitude describe?",
        a: ["Wave height", "Object mass", "Circuit resistance", "Friction surface"],
        correct: 0,
        fact: "Amplitude is related to how tall or strong a wave is."
      }
    },
    {
      name: "Pressure Dome",
      topic: "Pressure = force ÷ area.",
      story: "Air and water pressure systems surge across the dome.",
      objective: "Collect 8 science coins and balance the pressure valves.",
      bg: 9,
      tool: "Pressure Valve",
      gravity: 1420,
      friction: 0.86,
      item: "coin",
      targetCoins: 8,
      enemies: ["drone","glitch"],
      pressure: true,
      quiz: {
        q: "How can you increase pressure when force stays the same?",
        a: ["Use a smaller area", "Use a bigger area", "Remove force", "Turn off gravity"],
        correct: 0,
        fact: "The same force over a smaller area creates higher pressure."
      }
    },
    {
      name: "Space Physics Lab",
      topic: "Objects in orbit are falling around a planet.",
      story: "The academy’s space simulator needs satellite stabilisation.",
      objective: "Collect 8 star particles and restore the satellite orbit.",
      bg: 10,
      tool: "Astro Boots",
      gravity: 760,
      friction: 0.93,
      item: "gravity",
      targetCoins: 8,
      enemies: ["drone","magnetBot"],
      lowGravity: true,
      quiz: {
        q: "Why do astronauts feel lighter in orbit?",
        a: ["They are in continuous free fall", "They have no mass", "Earth disappears", "Air pushes them up"],
        correct: 0,
        fact: "Orbit is a balance of forward motion and gravity pulling inward."
      }
    },
    {
      name: "Quantum Core Finale",
      topic: "Revision: combine all physics concepts.",
      story: "Professor GlitchBot guards the Quantum Core. The final mission combines force, motion, energy, circuits, waves and gravity.",
      objective: "Collect 10 science rewards, defeat GlitchBot and answer the final physics challenge.",
      bg: 11,
      tool: "Physics Guardian Kit",
      gravity: 1280,
      friction: 0.86,
      item: "card",
      targetCoins: 10,
      enemies: ["drone","glitch","magnetBot"],
      boss: true,
      quiz: {
        q: "Which idea connects most physics topics in the game?",
        a: ["Forces and energy explain changes in motion", "Physics is only guessing", "Circuits do not need energy", "Gravity only works in games"],
        correct: 0,
        fact: "Forces, motion and energy are central ideas that help explain many physical systems."
      }
    }
  ];

  const MUSIC = [
    {bpm:112,bass:[110,147,165,147],lead:[440,494,587,494,440,330,392,440],wave:"triangle"},
    {bpm:122,bass:[123,165,196,165],lead:[494,587,659,587,494,392,440,494],wave:"square"},
    {bpm:108,bass:[98,147,196,147],lead:[392,494,587,659,587,494,392,294],wave:"triangle"},
    {bpm:118,bass:[110,139,165,139],lead:[330,392,440,494,440,392,330,277],wave:"sawtooth"},
    {bpm:126,bass:[82,123,165,123],lead:[415,523,622,523,415,330,415,523],wave:"square"},
    {bpm:120,bass:[92,138,184,138],lead:[370,466,554,466,370,277,370,466],wave:"triangle"},
    {bpm:128,bass:[98,130,196,130],lead:[392,523,659,523,392,330,392,523],wave:"square"},
    {bpm:124,bass:[110,147,220,147],lead:[440,554,660,554,440,349,440,554],wave:"sawtooth"},
    {bpm:116,bass:[87,130,174,130],lead:[349,440,523,587,523,440,349,261],wave:"triangle"},
    {bpm:121,bass:[104,156,208,156],lead:[415,523,622,698,622,523,415,311],wave:"square"},
    {bpm:105,bass:[73,110,147,110],lead:[294,370,440,554,440,370,294,220],wave:"triangle"},
    {bpm:134,bass:[82,123,164,220],lead:[330,415,523,659,784,659,523,415],wave:"sawtooth"}
  ];


  const HARDMODE = {
    baseLength: 5600,
    lengthStep: 360,
    basePlatformCount: 14,
    coinBonus: 6,
    enemyBase: 8
  };

  const EXTRA_QUIZZES = [
    [
      {q:"When you push a crate harder in the same direction, what usually happens?",a:["It accelerates more","It loses all mass","It stops being affected by forces","It becomes weightless"],correct:0,fact:"A larger unbalanced force causes a larger acceleration."},
      {q:"Two equal forces act in opposite directions on a box. What is the net force?",a:["0 N","2 N","10 m/s","Gravity disappears"],correct:0,fact:"Balanced forces cancel out, so the object keeps its current motion."},
      {q:"What unit is commonly used to measure force?",a:["Newton (N)","Metre (m)","Second (s)","Degree Celsius"],correct:0,fact:"Force is measured in newtons, named after Isaac Newton."}
    ],
    [
      {q:"A runner moves 45 metres in 9 seconds. What is the speed?",a:["5 m/s","36 m/s","54 m/s","405 m/s"],correct:0,fact:"Speed = distance ÷ time, so 45 ÷ 9 = 5 m/s."},
      {q:"Which graph clue shows a faster object on a distance-time graph?",a:["A steeper line","A flat line","A smaller label","A darker colour"],correct:0,fact:"A steeper distance-time line means distance is changing faster."},
      {q:"What happens to speed if the same distance is covered in less time?",a:["Speed increases","Speed becomes zero","Mass disappears","Friction stops"],correct:0,fact:"Less time for the same distance means a greater speed."}
    ],
    [
      {q:"Which object experiences gravity?",a:["Every object with mass","Only metal objects","Only objects on Earth","Only moving objects"],correct:0,fact:"All objects with mass attract each other through gravity."},
      {q:"Why does a jump feel higher in low gravity?",a:["Gravity pulls down less strongly","Air becomes solid","Friction becomes zero","Mass doubles"],correct:0,fact:"Lower gravity means the same jump speed keeps you in the air longer."},
      {q:"On Earth, gravity gives falling objects an acceleration close to:",a:["9.8 m/s²","1 m/s","100 kg","0 volts"],correct:0,fact:"Near Earth’s surface, gravitational acceleration is about 9.8 m/s²."}
    ],
    [
      {q:"What does friction usually do to a moving object?",a:["Opposes its motion","Makes it invisible","Removes gravity","Creates electricity only"],correct:0,fact:"Friction acts against motion between surfaces in contact."},
      {q:"Why are icy surfaces harder to stop on?",a:["They have lower friction","They have more mass","They remove air","They reverse gravity"],correct:0,fact:"Low friction means there is less grip to slow you down."},
      {q:"What is a useful effect of friction?",a:["Shoes grip the ground","All motion stops forever","Electric current vanishes","Magnets turn off"],correct:0,fact:"Friction can be useful because it provides grip and control."}
    ],
    [
      {q:"Kinetic energy is energy of:",a:["Motion","Height only","Colour","Silence"],correct:0,fact:"Kinetic energy is the energy an object has because it is moving."},
      {q:"What energy store increases when you lift an object higher?",a:["Gravitational potential energy","Sound energy","Chemical waste","Static friction"],correct:0,fact:"Higher objects have more gravitational potential energy."},
      {q:"When a cart rolls down a ramp, potential energy changes mainly into:",a:["Kinetic energy","No energy","Only light","Mass"],correct:0,fact:"As the cart loses height, stored potential energy becomes motion energy."}
    ],
    [
      {q:"What does a pulley help with?",a:["Changing the direction of a force","Deleting mass","Stopping gravity forever","Making sound visible"],correct:0,fact:"A pulley can change the direction of a force and make lifting easier."},
      {q:"A ramp is also called:",a:["An inclined plane","A closed circuit","A north pole","A wave crest"],correct:0,fact:"An inclined plane lets you raise objects over a longer, easier path."},
      {q:"Why do machines make work easier?",a:["They change force size or direction","They remove all energy","They make objects weightless","They stop motion"],correct:0,fact:"Simple machines trade force and distance to help us do work."}
    ],
    [
      {q:"What component supplies energy in a simple circuit?",a:["Battery or cell","Open switch","Plastic ruler","Magnet only"],correct:0,fact:"A cell or battery provides energy that drives current around a closed circuit."},
      {q:"What happens in an open circuit?",a:["Current stops flowing","Current doubles forever","Gravity increases","Light becomes mass"],correct:0,fact:"An open circuit has a break in the path, so current cannot flow."},
      {q:"Which material usually conducts electricity well?",a:["Copper","Dry wood","Rubber","Plastic"],correct:0,fact:"Metals such as copper are good electrical conductors."}
    ],
    [
      {q:"Which poles attract each other?",a:["North and south","North and north","South and south","No poles ever attract"],correct:0,fact:"Opposite magnetic poles attract; like poles repel."},
      {q:"Where is a magnet’s pull usually strongest?",a:["Near its poles","At the centre of the table","Only in water","Only in darkness"],correct:0,fact:"Magnetic effects are strongest near the poles of a magnet."},
      {q:"Which item is most likely to be attracted by a magnet?",a:["Iron nail","Wooden spoon","Plastic cup","Paper towel"],correct:0,fact:"Iron, nickel and cobalt are common magnetic materials."}
    ],
    [
      {q:"Frequency describes:",a:["How many waves pass each second","How heavy the wave is","The colour of a battery","The force of gravity"],correct:0,fact:"Frequency is the number of wave cycles each second."},
      {q:"A louder sound wave usually has greater:",a:["Amplitude","Mass","Resistance","Friction"],correct:0,fact:"Greater amplitude is linked to a louder sound or stronger wave."},
      {q:"What do waves transfer from place to place?",a:["Energy","Only mass","Only magnets","Nothing"],correct:0,fact:"Waves transfer energy without needing to transfer matter overall."}
    ],
    [
      {q:"Pressure is calculated using:",a:["Force ÷ area","Mass × colour","Speed + sound","Voltage ÷ magnet"],correct:0,fact:"Pressure = force divided by area."},
      {q:"Why does a sharp pin create high pressure?",a:["Small contact area","No force","Large flat surface","No gravity"],correct:0,fact:"The same force over a smaller area creates higher pressure."},
      {q:"What happens to pressure if area increases while force stays the same?",a:["Pressure decreases","Pressure increases forever","Current stops","Mass becomes zero"],correct:0,fact:"Spreading a force over a larger area lowers the pressure."}
    ],
    [
      {q:"What keeps a satellite in orbit?",a:["Forward motion plus gravity","No forces at all","Friction with clouds","A very long rope"],correct:0,fact:"A satellite keeps moving forward while gravity pulls it inward."},
      {q:"Why is there less air resistance in space?",a:["There is very little air","There is more friction","Gravity is absent everywhere","Mass is impossible"],correct:0,fact:"Space has very little air, so drag is much smaller."},
      {q:"In orbit, astronauts appear weightless because they are:",a:["Falling around Earth","Without mass","Outside all gravity","Made of gas"],correct:0,fact:"Astronauts and their spacecraft are in continuous free fall."}
    ],
    [
      {q:"Which statement best joins force and motion?",a:["Unbalanced forces change motion","Forces never affect objects","Only colour changes speed","Energy cannot move"],correct:0,fact:"An unbalanced force changes an object’s speed or direction."},
      {q:"What should you do first when solving a physics problem?",a:["Identify knowns, unknowns and the principle","Guess quickly","Ignore units","Remove the diagram"],correct:0,fact:"Good physics problem-solving starts by identifying variables and the correct principle."},
      {q:"Why are units important?",a:["They show what the numbers mean","They are decorations","They always cancel science","They replace formulas"],correct:0,fact:"Units keep calculations meaningful and help catch mistakes."}
    ]
  ];

  const LESSON_STEPS = [
    ["Balanced forces keep motion unchanged; unbalanced forces cause acceleration.","A force meter reads in newtons. Direction matters as much as size.","Puzzle tip: push crates from the correct side so the net force points toward the plate."],
    ["Speed compares distance with time. Watch moving platforms like distance-time graphs.","A faster object covers more distance in the same time.","Puzzle tip: wait for the platform cycle, then use speed boots to cross the timed gap."],
    ["Gravity is a pulling force between masses. Lower gravity means longer jumps.","Weight depends on gravity, but mass stays the same.","Puzzle tip: use the gravity shield at the top of your jump to extend airtime."],
    ["Friction gives grip, but it also slows motion.","Low-friction ice keeps you sliding, so plan your landing early.","Puzzle tip: grip boots increase control on slippery surfaces."],
    ["Energy changes form: stored energy can become motion energy.","Reactors need energy crystals because energy must be transferred to do work.","Puzzle tip: launch pads convert stored energy into kinetic energy."],
    ["Simple machines trade distance for force. They do not create free energy.","Levers and pulleys help redirect force through mechanisms.","Puzzle tip: trigger machine terminals in order to open gear gates."],
    ["A circuit needs a closed conducting path and an energy source.","Insulators block current; conductors let current flow.","Puzzle tip: avoid sparks while the circuit is open, then solve the terminal to close it."],
    ["Magnetic fields can push or pull without direct contact.","Opposite poles attract and like poles repel.","Puzzle tip: magnet pulse can move magnetic enemies and clear a safe path."],
    ["Waves carry energy through vibrations and patterns.","Amplitude measures wave height; frequency measures cycles per second.","Puzzle tip: move between pulses and answer wave questions to tune the tunnel."],
    ["Pressure rises when the same force acts over a smaller area.","Fluids push in all directions, which is why pressure domes are tricky.","Puzzle tip: pressure bursts can launch you, but they can also damage your suit."],
    ["Orbit combines forward motion with inward gravity.","Low drag in space means objects keep moving for longer.","Puzzle tip: small corrections work better than over-steering in low gravity."],
    ["Real physics problems combine forces, motion, energy and systems thinking.","Use units, diagrams and evidence to choose the right principle.","Final tip: defeat GlitchBot, then solve the combined revision challenge."]
  ];

  function targetCoins(){
    return level().targetCoins + HARDMODE.coinBonus + Math.floor(state.levelIndex * 1.5);
  }

  function targetCards(){
    return 2 + (state.levelIndex >= 4 ? 1 : 0) + (state.levelIndex >= 9 ? 1 : 0);
  }

  function requiredQuizzes(){
    return 2 + (state.levelIndex >= 5 ? 1 : 0) + (state.levelIndex >= 10 ? 1 : 0);
  }

  function currentQuizFor(index){
    const bank = EXTRA_QUIZZES[state.levelIndex] || [];
    if(index === 0) return level().quiz;
    return bank[(index - 1) % bank.length] || level().quiz;
  }

  function missionTargets(){
    return {
      coins: targetCoins(),
      cards: targetCards(),
      quizzes: requiredQuizzes()
    };
  }

  const state = {
    started:false,
    paused:false,
    muted:false,
    won:false,
    levelIndex:0,
    score:0,
    best:Number(localStorage.getItem(BEST_KEY)||0),
    stars:0,
    camera:0,
    t:0,
    musicStep:0,
    keys:{},
    player:{x:90,y:0,w:58,h:92,vx:0,vy:0,onGround:false,jumps:0,health:100,maxHealth:100,toolCd:0,blastCd:0,shield:0,superJump:0,slow:0,anim:0,invuln:0,facing:1},
    mission:{coins:0,cards:0,quizzes:0,quiz:false,complete:false,bossDown:false,conceptIndex:0,requiredCoins:0,requiredCards:0,requiredQuizzes:0},
    world:{length:3200,platforms:[],items:[],enemies:[],hazards:[],terminals:[],gates:[],particles:[],floaters:[],boss:null,portal:null},
    audio:{ctx:null,master:null,timer:null},
    activeQuiz:null
  };

  let W=1280,H=720,DPR=1,last=performance.now();
  const images={};

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rand=(a,b)=>a+Math.random()*(b-a);
  const choose=a=>a[Math.floor(Math.random()*a.length)];
  const groundY=()=>H*0.80;

  function level(){return LEVELS[state.levelIndex]||LEVELS[0];}

  function resize(){
    const rect=canvas.getBoundingClientRect();
    DPR=Math.min(2,window.devicePixelRatio||1);
    W=Math.max(1,Math.floor(rect.width));
    H=Math.max(1,Math.floor(rect.height));
    canvas.width=Math.floor(W*DPR);
    canvas.height=Math.floor(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function loadImage(src){
    return new Promise(resolve=>{
      const im=new Image();
      im.onload=()=>resolve(im);
      im.onerror=()=>resolve(null);
      im.src=src;
    });
  }

  async function loadAssets(){
    const paths=[...ASSETS.backgrounds,...Object.values(ASSETS.sprites),...Object.values(ASSETS.items),...Object.values(ASSETS.effects)];
    const loaded=await Promise.all(paths.map(loadImage));
    paths.forEach((p,i)=>images[p]=loaded[i]);
  }

  function image(src){return images[src]||null;}

  function drawImage(src,x,y,w,h,alpha=1,rot=0){
    const im=image(src);
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.translate(x+w/2,y+h/2);
    ctx.rotate(rot);
    if(im) ctx.drawImage(im,-w/2,-h/2,w,h);
    else{ctx.fillStyle="#4bdcff";ctx.fillRect(-w/2,-h/2,w,h);}
    ctx.restore();
  }

  function showOverlay(title,text,button="Continue"){
    ui.overlayTitle.textContent=title;
    ui.overlayText.textContent=text;
    ui.startBtn.textContent=button;
    ui.overlay.classList.add("active");
  }
  function hideOverlay(){ui.overlay.classList.remove("active");}

  function toast(text){
    ui.toast.textContent=text;
    ui.toast.classList.add("active");
    clearTimeout(toast._t);
    toast._t=setTimeout(()=>ui.toast.classList.remove("active"),1700);
  }

  function ensureAudio(){
    if(state.muted) return null;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return null;
    if(!state.audio.ctx){
      state.audio.ctx=new AC();
      state.audio.master=state.audio.ctx.createGain();
      state.audio.master.gain.value=0.12;
      state.audio.master.connect(state.audio.ctx.destination);
    }
    if(state.audio.ctx.state==="suspended") state.audio.ctx.resume().catch(()=>{});
    return state.audio.ctx;
  }

  function tone(freq,dur=.08,type="triangle",gain=.03,delay=0){
    const ac=ensureAudio();
    if(!ac||state.muted) return;
    const t=ac.currentTime+delay;
    const o=ac.createOscillator();
    const g=ac.createGain();
    o.type=type;
    o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain,t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(state.audio.master);
    o.start(t); o.stop(t+dur+.04);
  }

  function noise(dur=.08,gain=.025){
    const ac=ensureAudio();
    if(!ac||state.muted) return;
    const buffer=ac.createBuffer(1,Math.floor(ac.sampleRate*dur),ac.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length);
    const src=ac.createBufferSource(); src.buffer=buffer;
    const g=ac.createGain(); g.gain.value=gain;
    src.connect(g); g.connect(state.audio.master);
    src.start(); src.stop(ac.currentTime+dur);
  }

  function sfx(kind){
    if(kind==="jump"){tone(420,.06,"sine",.03);tone(700,.05,"triangle",.018,.03);}
    if(kind==="collect"){tone(880,.055,"triangle",.035);tone(1320,.055,"sine",.018,.035);}
    if(kind==="tool"){tone(360,.06,"square",.025);tone(540,.08,"triangle",.015,.04);}
    if(kind==="blast"){tone(220,.055,"sawtooth",.035);tone(660,.055,"square",.015,.03);}
    if(kind==="hit"){noise(.10,.045);tone(160,.12,"sawtooth",.030);}
    if(kind==="correct"){tone(440,.07);tone(660,.08,"triangle",.025,.06);tone(880,.12,"sine",.018,.13);}
    if(kind==="wrong"){tone(190,.13,"sawtooth",.035);tone(120,.18,"sine",.02,.08);}
    if(kind==="level"){tone(392,.08);tone(523,.10,"triangle",.025,.06);tone(784,.15,"sine",.018,.14);}
    if(kind==="start"){tone(220,.08);tone(330,.08,"triangle",.025,.05);tone(550,.12,"sine",.018,.11);}
  }

  function musicProfile(){return MUSIC[state.levelIndex%MUSIC.length];}
  function musicTick(){
    if(!state.started||state.paused||state.muted) return;
    const m=musicProfile();
    const step=state.musicStep++;
    const beat=step%16;
    if(beat%4===0){tone(m.bass[Math.floor(beat/4)%m.bass.length],.13,"sawtooth",.010);tone(48,.05,"sine",.018);}
    if(beat%2===1) noise(.025,.007);
    const lead=m.lead[beat%m.lead.length];
    if(lead) tone(lead,.055,m.wave,.006,.02);
    if(beat%4===2) tone(lead*1.5,.04,"triangle",.004,.06);
  }
  function startMusic(){
    if(state.audio.timer||state.muted) return;
    const delay=Math.round(60000/musicProfile().bpm/2);
    state.audio.timer=setInterval(musicTick,delay);
  }
  function stopMusic(){
    if(state.audio.timer) clearInterval(state.audio.timer);
    state.audio.timer=null;
  }

  function postScore(mode="live"){
    const payload={type:"GG_SCORE",gameSlug:GAME_SLUG,slug:GAME_SLUG,score:Math.floor(state.score),best:state.best,level:state.levelIndex+1,mode};
    try{window.GG?.setSlug?.(GAME_SLUG);}catch{}
    try{window.GG?.setScore?.(payload.score,{gameSlug:GAME_SLUG});}catch{}
    if(mode!=="live"){
      try{window.GG?.submitScore?.(payload.score,{gameSlug:GAME_SLUG});}catch{}
      try{window.GG?.endRound?.(payload);}catch{}
    }
    try{window.parent?.postMessage?.(payload,"*");}catch{}
    try{window.parent?.postMessage?.({...payload,type:"gg:score"},"*");}catch{}
  }

  function setKey(k,v){state.keys[k]=v;}

  window.addEventListener("keydown",e=>{
    const k=e.key.toLowerCase();
    if(["a","arrowleft"].includes(k)) setKey("left",true);
    if(["d","arrowright"].includes(k)) setKey("right",true);
    if(["w","arrowup"," "].includes(k)){e.preventDefault();jump();}
    if(k==="f") useTool();
    if(k==="e") forceBlast();
    if(k==="p") togglePause();
  });
  window.addEventListener("keyup",e=>{
    const k=e.key.toLowerCase();
    if(["a","arrowleft"].includes(k)) setKey("left",false);
    if(["d","arrowright"].includes(k)) setKey("right",false);
  });

  function bindHold(btn,on,off){
    if(!btn) return;
    btn.addEventListener("pointerdown",e=>{e.preventDefault();ensureAudio();on();},{passive:false});
    btn.addEventListener("pointerup",e=>{e.preventDefault();off&&off();},{passive:false});
    btn.addEventListener("pointercancel",()=>off&&off());
    btn.addEventListener("pointerleave",()=>off&&off());
  }
  bindHold(ui.leftBtn,()=>setKey("left",true),()=>setKey("left",false));
  bindHold(ui.rightBtn,()=>setKey("right",true),()=>setKey("right",false));
  bindHold(ui.jumpBtn,()=>jump(),()=>{});
  bindHold(ui.toolBtn,()=>useTool(),()=>{});
  bindHold(ui.blastBtn,()=>forceBlast(),()=>{});

  ui.startBtn.addEventListener("click",()=>{
    ensureAudio();
    if(!state.started||state.won) newGame();
    else continueGame();
  });
  ui.howBtn.addEventListener("click",()=>{
    state.paused=true;
    showOverlay("How to Play","Move with A/D or the arrow keys. Jump with W, Up or Space. Use the current physics tool with F or the Tool button. Use force blast with E or Blast. Collect science rewards, avoid hazards, defeat glitch bots and answer each experiment challenge to unlock the next lab.","Continue");
  });
  ui.pauseBtn.addEventListener("click",togglePause);
  ui.restartBtn.addEventListener("click",newGame);
  ui.muteBtn.addEventListener("click",()=>{
    state.muted=!state.muted;
    ui.muteBtn.textContent=state.muted?"Muted":"Sound";
    if(state.muted) stopMusic(); else if(state.started&&!state.paused) startMusic();
  });
  window.addEventListener("resize",resize);

  function newGame(){
    state.started=true;state.paused=false;state.won=false;
    state.score=0;state.stars=0;state.levelIndex=0;
    state.player.health=state.player.maxHealth;state.player.shield=0;state.player.superJump=0;state.player.slow=0;
    buildLevel();
    hideOverlay();
    startMusic();
    sfx("start");
  }

  function continueGame(){
    if(!state.started){newGame();return;}
    state.paused=false;
    hideOverlay();
    startMusic();
    last=performance.now();
  }

  function togglePause(){
    if(!state.started) return;
    state.paused=!state.paused;
    if(state.paused){stopMusic();showOverlay("Paused","Take a quick break from the lab. Continue when ready.","Continue");}
    else{hideOverlay();startMusic();last=performance.now();}
  }

  function gameOver(msg){
    state.started=false;state.paused=true;stopMusic();
    state.best=Math.max(state.best,Math.floor(state.score));
    localStorage.setItem(BEST_KEY,String(state.best));
    postScore("game_over");
    showOverlay("Experiment Failed",`${msg}\n\nScore: ${Math.floor(state.score)}\nBest: ${state.best}`,"Restart");
  }

  function winGame(){
    state.started=false;state.paused=true;state.won=true;stopMusic();
    state.score+=2000;
    state.best=Math.max(state.best,Math.floor(state.score));
    localStorage.setItem(BEST_KEY,String(state.best));
    postScore("game_won");
    sfx("level");
    showOverlay("Junior Physics Guardian!",`The Quantum Core is stable. Professor Newtonia celebrates your physics journey.\n\nFinal Score: ${Math.floor(state.score)}\nStars: ${state.stars}`,"Play Again");
  }

  function buildLevel(){
    state.transitioning=false;
    const lv=level();
    const targets=missionTargets();
    state.camera=0;
    state.activeQuiz=null;
    state.mission={coins:0,cards:0,quizzes:0,quiz:false,complete:false,bossDown:false,conceptIndex:0,requiredCoins:targets.coins,requiredCards:targets.cards,requiredQuizzes:targets.quizzes};
    state.world={length:HARDMODE.baseLength+state.levelIndex*HARDMODE.lengthStep,platforms:[],items:[],enemies:[],hazards:[],terminals:[],gates:[],particles:[],floaters:[],boss:null,portal:null};
    state.player.x=90;state.player.y=groundY()-state.player.h;state.player.vx=0;state.player.vy=0;state.player.onGround=true;state.player.jumps=0;state.player.invuln=1.2;
    state.musicStep=0;
    stopMusic();startMusic();

    const gy=groundY();
    state.world.platforms.push({x:-200,y:gy,w:state.world.length+650,h:90,type:"ground"});

    const platformCount=HARDMODE.basePlatformCount+Math.floor(state.levelIndex*1.25);
    const usable=state.world.length-1050;
    for(let i=0;i<platformCount;i++){
      const x=430+i*(usable/platformCount)+rand(-70,75);
      const y=gy-rand(95,260)-(i%4===2?45:0);
      const w=rand(150,270);
      const moving=(lv.movingPlatforms || state.levelIndex>2) && i%3===0;
      state.world.platforms.push({x,y,w,h:22,type:moving?"moving":"normal", ox:x, amp:moving?rand(45,115):0, phase:i});
    }

    const hazardCount=4+Math.floor(state.levelIndex*0.9);
    for(let i=0;i<hazardCount;i++){
      const x=650+i*((state.world.length-1450)/Math.max(1,hazardCount));
      const kind=choose(["spark","pressure","wave"]);
      state.world.hazards.push({x:x+rand(-100,120),y:gy-rand(65,140),w:kind==="wave"?190:115,h:kind==="wave"?78:70,type:kind,phase:i});
    }

    if(lv.slippery){
      for(let i=0;i<4;i++) state.world.hazards.push({x:780+i*900,y:gy-12,w:430,h:12,type:"ice"});
    }
    if(lv.lowGravity){
      for(let i=0;i<3;i++) state.world.hazards.push({x:820+i*1250,y:gy-180,w:430,h:175,type:"lowgrav"});
    }
    if(lv.electric){
      for(let i=0;i<8;i++) state.world.hazards.push({x:700+i*520,y:gy-52,w:118,h:52,type:"spark",phase:i});
    }
    if(lv.waveHazards){
      for(let i=0;i<8;i++) state.world.hazards.push({x:650+i*560,y:gy-110,w:210,h:90,type:"wave",phase:i});
    }
    if(lv.pressure){
      for(let i=0;i<7;i++) state.world.hazards.push({x:850+i*610,y:gy-128,w:135,h:128,type:"pressure",phase:i});
    }

    for(let i=0;i<targets.coins+10;i++){
      state.world.items.push({x:360+i*(state.world.length-900)/(targets.coins+9),y:gy-rand(145,360),w:38,h:38,type:i<targets.coins?lv.item:"coin",collected:false,vy:0,age:i*.3});
    }

    for(let i=0;i<targets.cards;i++){
      state.world.items.push({x:760+i*((state.world.length-1500)/Math.max(1,targets.cards-1)),y:gy-rand(230,365),w:48,h:48,type:"card",collected:false,age:i});
    }

    const powers=["jump","shield","health","slow","hint"];
    for(let i=0;i<5;i++){
      state.world.items.push({x:980+i*((state.world.length-1800)/4),y:gy-rand(260,395),w:48,h:48,type:powers[i%powers.length],collected:false,age:i*.5});
    }

    const enemyCount=HARDMODE.enemyBase+Math.floor(state.levelIndex*1.7);
    for(let i=0;i<enemyCount;i++){
      const type=choose(lv.enemies);
      spawnEnemy(760+i*((state.world.length-1450)/Math.max(1,enemyCount-1))+rand(-90,90),type);
    }

    for(let i=0;i<targets.quizzes;i++){
      const x=1050+i*((state.world.length-1900)/Math.max(1,targets.quizzes-1));
      const coinNeed=Math.floor(targets.coins*((i+1)/(targets.quizzes+1)));
      state.world.terminals.push({x,y:gy-130,w:86,h:130,active:false,solved:false,quizId:i,coinNeed});
      if(i<targets.quizzes-1){
        state.world.gates.push({x:x+360,y:gy-210,w:34,h:210,quizNeed:i+1,open:false});
      }
    }

    state.world.portal={x:state.world.length-210,y:gy-150,w:100,h:150,open:false};

    if(lv.boss){
      state.world.boss={x:state.world.length-900,y:gy-190,w:170,h:170,hp:760,maxHp:760,fire:0.9,phase:0,age:0,img:ASSETS.sprites.boss};
    }

    const firstLesson=(LESSON_STEPS[state.levelIndex]||[])[0]||lv.topic;
    ui.conceptText.textContent="Concept: " + firstLesson;
    toast(lv.name + " expanded: longer route, more puzzles.");
    updateHUD();
  }

  function spawnEnemy(x,type){
    const gy=groundY();
    const defs={
      glitch:{w:62,h:82,hp:58,speed:72,img:ASSETS.sprites.glitch,score:130,shot:"pink"},
      drone:{w:58,h:58,hp:44,speed:88,img:ASSETS.sprites.drone,fly:true,score:145,shot:"cyan"},
      magnetBot:{w:70,h:74,hp:76,speed:62,img:ASSETS.sprites.magnetBot,magnet:true,score:180,shot:"green"}
    };
    const d=defs[type]||defs.glitch;
    const fireCd=rand(1.0,2.2)-Math.min(.55,state.levelIndex*.035);
    state.world.enemies.push({...d,type,x,y:d.fly?gy-rand(200,330):gy-d.h,dir:-1,age:0,hit:0,fireCd});
  }

  function jump(){
    if(!state.started||state.paused) return;
    const p=state.player;
    if(p.onGround||p.jumps<2){
      p.vy=-(p.superJump>0?850:680);
      p.onGround=false;p.jumps++;
      sfx("jump");
    }
  }

  function useTool(){
    if(!state.started||state.paused) return;
    const p=state.player;
    if(p.toolCd>0) return;
    const lv=level();
    p.toolCd=.8;
    sfx("tool");
    addParticles(p.x+p.w/2,p.y+p.h/2,toolColor(),22,260);
    if(lv.tool.includes("Speed")){p.vx+=p.facing*480;p.superJump=Math.max(p.superJump,.8);toast("Speed Boots burst!");}
    else if(lv.tool.includes("Gravity")){p.vy=-540;p.shield=Math.max(p.shield,2.2);toast("Gravity Shield lift!");}
    else if(lv.tool.includes("Grip")){p.superJump=Math.max(p.superJump,1.2);toast("Grip Boots activated!");}
    else if(lv.tool.includes("Energy")){fireToolBeam("energy");}
    else if(lv.tool.includes("Circuit")){fireToolBeam("spark");}
    else if(lv.tool.includes("Magnet")){fireToolBeam("magnet");}
    else if(lv.tool.includes("Wave")){fireToolBeam("wave");}
    else if(lv.tool.includes("Pressure")){state.world.enemies.forEach(e=>{if(Math.abs(e.x-p.x)<230)e.vy=-280;});toast("Pressure burst!");}
    else{fireToolBeam("force");}
  }

  function forceBlast(){
    if(!state.started||state.paused) return;
    const p=state.player;
    if(p.blastCd>0) return;
    p.blastCd=.55;
    sfx("blast");
    const b={x:p.x+p.w*.5,y:p.y+p.h*.43,w:28,h:14,vx:p.facing*640,life:.95,damage:26,type:"blast"};
    state.world.particles.push(b);
    addParticles(b.x,b.y,"rgba(75,220,255,.9)",10,170);
  }

  function fireToolBeam(kind){
    const p=state.player;
    const color=toolColor();
    state.world.particles.push({x:p.x+p.w*.5,y:p.y+p.h*.42,w:36,h:18,vx:p.facing*560,life:1.0,damage:34,type:kind,color});
  }

  function toolColor(){
    const idx=state.levelIndex;
    return ["rgba(75,220,255,.95)","rgba(255,145,80,.95)","rgba(178,119,255,.95)","rgba(255,216,107,.95)","rgba(255,190,70,.95)","rgba(90,245,210,.95)","rgba(75,215,255,.95)","rgba(255,90,150,.95)","rgba(100,230,255,.95)","rgba(95,255,190,.95)","rgba(255,215,90,.95)","rgba(255,90,220,.95)"][idx]||"rgba(75,220,255,.95)";
  }

  function addParticles(x,y,color,count=14,speed=180){
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2,s=rand(speed*.2,speed);
      state.world.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rand(2,5),life:rand(.35,.85),age:0,color,type:"dot"});
    }
  }

  function addFloater(x,y,text,color="#fff",size=18){
    state.world.floaters.push({x,y,text,color,size,age:0,life:1.1});
  }

  function rect(a,b){return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;}

  function update(dt){
    if(!state.started||state.paused) return;
    const lv=level(), p=state.player;
    state.t+=dt;
    p.anim+=dt;
    p.toolCd=Math.max(0,p.toolCd-dt);
    p.blastCd=Math.max(0,p.blastCd-dt);
    p.invuln=Math.max(0,p.invuln-dt);
    p.shield=Math.max(0,p.shield-dt);
    p.superJump=Math.max(0,p.superJump-dt);
    p.slow=Math.max(0,p.slow-dt);

    let dir=0;
    if(state.keys.left) dir--;
    if(state.keys.right) dir++;
    if(dir) p.facing=dir;
    const localFriction = onIce() ? .975 : lv.friction;
    const accel = p.superJump>0?2300:1850;
    p.vx += dir*accel*dt;
    p.vx *= Math.pow(localFriction,dt*60);
    p.vx=clamp(p.vx,-420,420);

    let gravity=lv.gravity;
    if(inZone("lowgrav")) gravity*=.45;
    p.vy += gravity*dt;
    p.x += p.vx*dt;
    p.y += p.vy*dt;

    handlePlatforms();

    if(p.y>H+300) damagePlayer(35,"Careful! You fell into the experiment pit.",true);
    p.x=clamp(p.x,20,state.world.length-130);
    state.camera=clamp(p.x-W*.35,0,Math.max(0,state.world.length-W));

    updateItems(dt);
    updateEnemies(dt);
    updateBoss(dt);
    updateHazards(dt);
    updateGates(dt);
    updateParticles(dt);
    updateTerminal();
    updateLessons();
    checkMission();
    updateHUD();
  }

  function onIce(){
    const p=state.player;
    return state.world.hazards.some(h=>h.type==="ice" && p.x+p.w>h.x && p.x<h.x+h.w && Math.abs((p.y+p.h)-h.y)<25);
  }
  function inZone(type){
    const p=state.player;
    return state.world.hazards.some(h=>h.type===type && p.x+p.w>h.x && p.x<h.x+h.w && p.y+p.h>h.y && p.y<h.y+h.h);
  }

  function handlePlatforms(){
    const p=state.player;
    p.onGround=false;
    for(const pl of state.world.platforms){
      if(pl.type==="moving") pl.x=pl.ox+Math.sin(state.t*1.2+pl.phase)*pl.amp;
      const prevY=p.y-p.vy*(1/60);
      if(p.x+p.w>pl.x && p.x<pl.x+pl.w && p.y+p.h>=pl.y && prevY+p.h<=pl.y+18 && p.vy>=0){
        p.y=pl.y-p.h;p.vy=0;p.onGround=true;p.jumps=0;
        if(pl.type==="moving") p.x+=Math.cos(state.t*1.2+pl.phase)*pl.amp*.015;
      }
    }
  }

  function updateItems(dt){
    const p=state.player;
    for(let i=state.world.items.length-1;i>=0;i--){
      const it=state.world.items[i];
      it.age=(it.age||0)+dt;
      const bob=Math.sin(it.age*4)*5;
      const box={x:it.x,y:it.y+bob,w:it.w,h:it.h};
      if(rect(p,box)){
        collect(it);
        state.world.items.splice(i,1);
      }
    }
  }

  function collect(it){
    const lv=level();
    state.score+=it.type==="card"?200:80;
    if(it.type==="card") state.mission.cards++;
    else state.mission.coins++;
    if(it.type==="health") state.player.health=Math.min(state.player.maxHealth,state.player.health+28);
    if(it.type==="shield") state.player.shield=Math.max(state.player.shield,5);
    if(it.type==="jump") state.player.superJump=Math.max(state.player.superJump,7);
    if(it.type==="slow") state.player.slow=Math.max(state.player.slow,6);
    if(it.type==="hint") toast(lv.quiz.fact);
    addFloater(it.x,it.y,it.type.toUpperCase(),"#ffd86b",18);
    addParticles(it.x,it.y,"rgba(255,216,107,.95)",16,220);
    sfx("collect");
  }

  function updateEnemies(dt){
    const p=state.player;
    const slow = p.slow>0?.45:1;
    for(let i=state.world.enemies.length-1;i>=0;i--){
      const e=state.world.enemies[i];
      e.age+=dt;
      e.hit=Math.max(0,(e.hit||0)-dt);
      if(e.fly){
        e.x-=e.speed*dt*slow;
        e.y+=Math.sin(e.age*2.5)*38*dt;
      }else{
        e.x+=e.dir*e.speed*dt*slow;
        if(e.x<state.camera-90 || e.x>state.camera+W+350) e.dir*=-1;
      }
      if(e.magnet && Math.abs(e.x-p.x)<260){
        p.vx += Math.sign(e.x-p.x)*135*dt;
      }

      e.fireCd=(e.fireCd ?? rand(1,2))-dt*slow;
      const dist=Math.hypot((p.x+p.w/2)-(e.x+e.w/2),(p.y+p.h/2)-(e.y+e.h/2));
      if(e.fireCd<=0 && dist<760 && e.x>state.camera-80 && e.x<state.camera+W+120){
        enemyShoot(e);
        e.fireCd=rand(1.15,2.0)-Math.min(.45,state.levelIndex*.03);
      }

      if(rect(p,e)){
        damagePlayer(15+Math.floor(state.levelIndex/3),"A glitch bot disrupted your lab suit.");
        e.hp-=14;
      }
      for(let j=state.world.particles.length-1;j>=0;j--){
        const b=state.world.particles[j];
        if(!b.damage) continue;
        const box={x:b.x,y:b.y,w:b.w||12,h:b.h||12};
        if(rect(box,e)){
          e.hp-=b.damage;
          e.hit=.18;
          addParticles(b.x,b.y,toolColor(),10,180);
          state.world.particles.splice(j,1);
          if(e.hp<=0){
            state.score+=e.score||100;
            addFloater(e.x,e.y,`+${e.score||100}`,"#72ffc4",18);
            addParticles(e.x,e.y,"rgba(114,255,196,.95)",20,240);
            state.world.enemies.splice(i,1);
          }
          break;
        }
      }
    }
  }

  function enemyShoot(e){
    const p=state.player;
    const sx=e.x+e.w/2, sy=e.y+e.h/2;
    const tx=p.x+p.w/2, ty=p.y+p.h/2;
    const a=Math.atan2(ty-sy,tx-sx);
    const speed=e.fly?310:255;
    const color=e.shot==="pink"?"rgba(255,90,190,.95)":e.shot==="green"?"rgba(95,255,190,.95)":"rgba(75,220,255,.95)";
    state.world.particles.push({x:sx,y:sy,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:5.5,life:2.4,age:0,type:"enemyShot",color,damagePlayer:9+Math.floor(state.levelIndex/4)});
    if(Math.random()<.25) state.world.particles.push({x:sx,y:sy,vx:Math.cos(a+.12)*speed*.9,vy:Math.sin(a+.12)*speed*.9,r:4.5,life:2.1,age:0,type:"enemyShot",color,damagePlayer:7});
  }

  function updateBoss(dt){
    const b=state.world.boss;
    if(!b) return;
    const p=state.player;
    b.age+=dt;b.fire-=dt;
    b.y=groundY()-b.h-20+Math.sin(b.age*1.5)*10;
    if(b.fire<=0){
      b.fire=1.0;
      for(let i=0;i<4;i++){
        const ang=Math.atan2((p.y+p.h/2)-(b.y+b.h/2),(p.x+p.w/2)-b.x)+(i-1.5)*.18;
        state.world.particles.push({x:b.x+b.w*.2,y:b.y+b.h*.45,vx:Math.cos(ang)*260,vy:Math.sin(ang)*260,r:6,life:2.2,age:0,type:"enemyShot",color:"rgba(255,90,160,.95)",damagePlayer:13});
      }
    }
    for(let j=state.world.particles.length-1;j>=0;j--){
      const q=state.world.particles[j];
      if(!q.damage) continue;
      if(rect({x:q.x,y:q.y,w:q.w||14,h:q.h||14},b)){
        b.hp-=q.damage;
        addParticles(q.x,q.y,toolColor(),10,220);
        state.world.particles.splice(j,1);
        if(b.hp<=0){
          state.world.boss=null;
          state.mission.bossDown=true;
          state.score+=1500;
          sfx("level");
          toast("GlitchBot defeated!");
        }
        break;
      }
    }
    if(rect(p,b)) damagePlayer(20,"Professor GlitchBot knocked you back.");
  }

  function updateHazards(dt){
    const p=state.player;
    for(const h of state.world.hazards){
      if(h.type==="spark"){
        const active=Math.sin(state.t*3+h.phase)>0.25;
        if(active && rect(p,h)) damagePlayer(10,"Electric spark! Complete the circuit safely.");
      }
      if(h.type==="wave"){
        const y=h.y+Math.sin(state.t*4+h.phase)*40;
        if(rect(p,{x:h.x,y,w:h.w,h:h.h})) damagePlayer(8,"Wave pulse hit! Time your movement.");
      }
      if(h.type==="pressure"){
        const active=Math.sin(state.t*2.2+h.phase)>0.55;
        if(active && rect(p,h)){p.vy=-350;p.vx+=Math.sign((p.x+p.w/2)-(h.x+h.w/2))*240;damagePlayer(6,"Pressure burst!");}
      }
    }
  }


  function updateGates(dt){
    const p=state.player;
    for(const g of state.world.gates){
      g.open = state.mission.quizzes >= g.quizNeed;
      if(!g.open && rect(p,g)){
        p.x = g.x - p.w - 4;
        p.vx = Math.min(0,p.vx) - 170*dt;
        if(!g.warned || state.t-g.warned>2.2){
          g.warned=state.t;
          toast(`Solve ${g.quizNeed} experiment puzzle${g.quizNeed>1?"s":""} to open this gate.`);
          addFloater(g.x,g.y-20,"LOCKED","#ff5f84",18);
        }
      }
    }
  }

  function updateLessons(){
    const p=state.player;
    const lessons=LESSON_STEPS[state.levelIndex] || [level().topic, level().quiz.fact];
    const next=state.mission.conceptIndex;
    if(next>=lessons.length) return;
    const trigger=(next+1)/(lessons.length+1);
    const progress=p.x/Math.max(1,state.world.length);
    if(progress>=trigger){
      const text=lessons[next];
      state.mission.conceptIndex++;
      state.score+=75;
      ui.conceptText.textContent="Principle unlocked: " + text;
      toast(text);
      addFloater(p.x+p.w/2,p.y-42,"PRINCIPLE +75","#72ffc4",18);
      addParticles(p.x+p.w/2,p.y+p.h/2,toolColor(),18,190);
    }
  }

  function updateParticles(dt){
    const p=state.player;
    for(let i=state.world.particles.length-1;i>=0;i--){
      const q=state.world.particles[i];
      q.age=(q.age||0)+dt;
      if(q.type==="dot"){
        q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=120*dt;
        if(q.age>q.life) state.world.particles.splice(i,1);
      }else if(q.type==="enemyShot"){
        q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;
        if(rect(p,{x:q.x-q.r,y:q.y-q.r,w:q.r*2,h:q.r*2})){damagePlayer(q.damagePlayer||10,"Boss energy pulse!");state.world.particles.splice(i,1);}
        else if(q.life<=0) state.world.particles.splice(i,1);
      }else{
        q.x+=q.vx*dt;q.life-=dt;
        if(q.life<=0) state.world.particles.splice(i,1);
      }
    }
    for(let i=state.world.floaters.length-1;i>=0;i--){
      const f=state.world.floaters[i];f.age+=dt;f.y-=45*dt;
      if(f.age>f.life) state.world.floaters.splice(i,1);
    }
  }

  function updateTerminal(){
    const p=state.player;
    for(const t of state.world.terminals){
      const near=Math.abs((p.x+p.w/2)-(t.x+t.w/2))<105 && Math.abs((p.y+p.h/2)-(t.y+t.h/2))<130;
      t.active=near;
      if(near && !t.solved && !state.activeQuiz){
        if(state.mission.coins>=t.coinNeed){
          openQuiz(t);
        }else if(!t.warned || state.t-t.warned>2){
          t.warned=state.t;
          toast(`Collect ${t.coinNeed} rewards before this experiment terminal.`);
        }
      }
    }
  }

  function openQuiz(terminal=null){
    const lv=level();
    const quizId=terminal?.quizId ?? state.mission.quizzes;
    const q=currentQuizFor(quizId);
    state.activeQuiz={terminal,quizId,q};
    state.paused=true;stopMusic();
    ui.quizTopic.textContent=`${lv.name} • Experiment ${quizId+1}/${state.mission.requiredQuizzes}`;
    ui.quizQuestion.textContent=q.q;
    ui.quizAnswers.innerHTML="";
    q.a.forEach((answer,i)=>{
      const btn=document.createElement("button");
      btn.textContent=answer;
      btn.addEventListener("click",()=>answerQuiz(i));
      ui.quizAnswers.appendChild(btn);
    });
    ui.quizPanel.classList.add("active");
  }

  function answerQuiz(i){
    const active=state.activeQuiz || {q:level().quiz,terminal:null,quizId:0};
    const q=active.q;
    ui.quizPanel.classList.remove("active");
    if(i===q.correct){
      if(active.terminal) active.terminal.solved=true;
      state.mission.quizzes=Math.max(state.mission.quizzes,(active.quizId||0)+1);
      state.mission.quiz=state.mission.quizzes>=state.mission.requiredQuizzes;
      state.score+=650+state.levelIndex*35;
      state.stars++;
      sfx("correct");
      toast("Correct! " + q.fact);
      addFloater(state.player.x,state.player.y-40,"PUZZLE SOLVED","#72ffc4",22);
      addParticles(state.player.x+state.player.w/2,state.player.y+state.player.h/2,"rgba(114,255,196,.95)",24,260);
    }else{
      sfx("wrong");
      damagePlayer(14+Math.floor(state.levelIndex/4),"Try again. Professor Newtonia gives you a hint.");
      toast("Hint: " + q.fact);
    }
    state.activeQuiz=null;
    state.paused=false;startMusic();last=performance.now();
    checkMission();
  }

  function damagePlayer(amount,msg,reset=false){
    const p=state.player;
    if(p.invuln>0 && !reset) return;
    if(p.shield>0 && !reset){p.shield=Math.max(0,p.shield-1.4);toast("Energy Shield protected you!");return;}
    p.health-=amount;
    p.invuln=.8;
    addParticles(p.x+p.w/2,p.y+p.h/2,"rgba(255,95,132,.95)",20,240);
    sfx("hit");
    if(reset){p.x=Math.max(80,p.x-220);p.y=groundY()-p.h;p.vy=0;}
    if(msg) toast(msg);
    if(p.health<=0) gameOver("Your lab suit ran out of energy.");
  }

  function checkMission(){
    const lv=level(), p=state.player;
    const portal=state.world.portal;
    const allCoins=state.mission.coins>=state.mission.requiredCoins;
    const allCards=state.mission.cards>=state.mission.requiredCards;
    const allQuizzes=state.mission.quizzes>=state.mission.requiredQuizzes;
    const bossOk=!lv.boss || state.mission.bossDown;
    state.mission.quiz=allQuizzes;
    if(portal && !portal.open && allCoins && allCards && allQuizzes && bossOk){
      portal.open=true;
      state.score+=350;
      toast("Exit portal unlocked. All physics evidence collected!");
      addFloater(p.x,p.y-70,"PORTAL OPEN","#ffd86b",22);
    }
    if(portal && portal.open && rect(p,portal) && !state.transitioning){
      state.transitioning=true;
      nextLevel();
    }
  }

  function nextLevel(){
    state.score+=800+Math.max(0,Math.floor(state.player.health))*2;
    sfx("level");
    state.levelIndex++;
    if(state.levelIndex>=LEVELS.length){winGame();return;}

    buildLevel();

    // buildLevel() resets the mission targets for the new level.
    // Read them after building the level so the overlay uses valid values.
    const lv=level();
    const reqCoins=state.mission.requiredCoins||targetCoins();
    const reqCards=state.mission.requiredCards||targetCards();
    const reqQuizzes=state.mission.requiredQuizzes||requiredQuizzes();

    state.paused=true;
    stopMusic();
    showOverlay(lv.name,`${lv.story}\n\nHard Mode Objective: collect ${reqCoins} rewards, ${reqCards} knowledge cards and solve ${reqQuizzes} experiment puzzles. Enemies now shoot, gates require quiz progress and physics principles unlock as you travel.\n\nNew tool: ${lv.tool}`,"Start Lab");
  }

  function progressRatio(){
    const lv=level();
    let parts=[
      clamp(state.mission.coins/Math.max(1,state.mission.requiredCoins),0,1),
      clamp(state.mission.cards/Math.max(1,state.mission.requiredCards),0,1),
      clamp(state.mission.quizzes/Math.max(1,state.mission.requiredQuizzes),0,1)
    ];
    if(lv.boss) parts.push(state.mission.bossDown?1:0);
    return parts.reduce((a,b)=>a+b,0)/parts.length;
  }

  function updateHUD(){
    const lv=level();
    const lesson=(LESSON_STEPS[state.levelIndex]||[])[Math.min(state.mission.conceptIndex,(LESSON_STEPS[state.levelIndex]||[]).length-1)] || lv.topic;
    const reqCoins=state.mission.requiredCoins||targetCoins();
    const reqCards=state.mission.requiredCards||targetCards();
    const reqQuizzes=state.mission.requiredQuizzes||requiredQuizzes();
    ui.storyText.textContent=lv.story;
    ui.topicLabel.textContent=lv.name;
    ui.objectiveText.textContent=`${lv.objective} Hard Mode: collect ${reqCoins} rewards, ${reqCards} knowledge cards and solve ${reqQuizzes} experiment puzzles${lv.boss?" before defeating GlitchBot":""}.`;
    ui.conceptText.textContent=`Principle ${Math.min(state.mission.conceptIndex+1,(LESSON_STEPS[state.levelIndex]||[]).length)}/${(LESSON_STEPS[state.levelIndex]||[]).length || 1}: ${lesson}`;
    ui.score.textContent=Math.floor(state.score);
    ui.level.textContent=`${state.levelIndex+1}/12`;
    ui.health.textContent=Math.max(0,Math.ceil(state.player.health));
    ui.tool.textContent=lv.tool;
    ui.stars.textContent=state.stars;
    const badge=state.levelIndex<3?"Trainee":state.levelIndex<6?"Lab Explorer":state.levelIndex<9?"Science Solver":"Physics Guardian";
    ui.badge.textContent=badge;
    const r=progressRatio();
    ui.progressFill.style.width=`${Math.round(r*100)}%`;
    ui.progressLabel.textContent=`${Math.round(r*100)}% • ${state.mission.coins}/${reqCoins} rewards • ${state.mission.cards}/${reqCards} cards • ${state.mission.quizzes}/${reqQuizzes} puzzles`;
    state.best=Math.max(state.best,Math.floor(state.score));
    postScore("live");
  }

  function drawCover(src){
    const im=image(src);
    if(!im){ctx.fillStyle="#06122a";ctx.fillRect(0,0,W,H);return;}
    const r=Math.max(W/im.naturalWidth,H/im.naturalHeight);
    const dw=im.naturalWidth*r,dh=im.naturalHeight*r;
    ctx.drawImage(im,(W-dw)/2,(H-dh)/2,dw,dh);
  }

  function draw(){
    const lv=level();
    drawCover(ASSETS.backgrounds[lv.bg]);
    ctx.save();
    ctx.translate(-state.camera,0);

    drawWorld();
    drawItems();
    drawHazards();
    drawGates();
    drawEnemies();
    drawBoss();
    drawTerminals();
    drawPortal();
    drawParticles();
    drawPlayer();
    drawFloaters();

    ctx.restore();

    if(!state.started){
      ctx.fillStyle="rgba(0,0,0,.15)";
      ctx.fillRect(0,0,W,H);
    }
  }

  function drawWorld(){
    for(const pl of state.world.platforms){
      if(pl.type==="ground"){
        ctx.fillStyle="rgba(3,8,18,.78)";
        ctx.fillRect(pl.x,pl.y,pl.w,pl.h);
        ctx.strokeStyle=toolColor();
        ctx.globalAlpha=.55;
        ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(pl.x,pl.y);ctx.lineTo(pl.x+pl.w,pl.y);ctx.stroke();
        ctx.globalAlpha=1;
      }else{
        ctx.fillStyle=pl.type==="moving"?"rgba(255,216,107,.88)":"rgba(75,220,255,.80)";
        ctx.shadowColor=pl.type==="moving"?"#ffd86b":"#4bdcff";
        ctx.shadowBlur=12;
        roundRect(pl.x,pl.y,pl.w,pl.h,10,true,false);
        ctx.shadowBlur=0;
      }
    }
  }

  function roundRect(x,y,w,h,r,fill,stroke){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);
    if(fill) ctx.fill();
    if(stroke) ctx.stroke();
  }

  function drawItems(){
    for(const it of state.world.items){
      const src=ASSETS.items[it.type]||ASSETS.items.coin;
      drawImage(src,it.x,it.y+Math.sin(state.t*4+it.age)*6,it.w,it.h,1,Math.sin(state.t+it.age)*.08);
    }
  }

  function drawHazards(){
    for(const h of state.world.hazards){
      if(h.type==="ice"){
        ctx.fillStyle="rgba(140,230,255,.35)";
        ctx.fillRect(h.x,h.y,h.w,h.h);
      }
      if(h.type==="lowgrav"){
        drawImage(ASSETS.effects.gravity,h.x,h.y,h.w,h.h,.55);
      }
      if(h.type==="spark"){
        const active=Math.sin(state.t*3+h.phase)>0.25;
        if(active) drawImage(ASSETS.effects.spark,h.x,h.y,h.w,h.h,.9);
      }
      if(h.type==="wave"){
        drawImage(ASSETS.effects.wave,h.x,h.y+Math.sin(state.t*4+h.phase)*40,h.w,h.h,.72);
      }
      if(h.type==="pressure"){
        const active=Math.sin(state.t*2.2+h.phase)>0.55;
        if(active){
          ctx.fillStyle="rgba(95,255,190,.35)";
          ctx.fillRect(h.x,h.y,h.w,h.h);
          drawImage(ASSETS.effects.beam,h.x-40,h.y+15,h.w+80,70,.65);
        }
      }
    }
  }

  function drawGates(){
    for(const g of state.world.gates){
      const open=state.mission.quizzes>=g.quizNeed;
      ctx.save();
      ctx.globalAlpha=open?0.18:0.9;
      ctx.fillStyle=open?"rgba(114,255,196,.25)":"rgba(255,95,132,.55)";
      ctx.shadowColor=open?"#72ffc4":"#ff5f84";
      ctx.shadowBlur=open?8:22;
      roundRect(g.x,g.y,g.w,g.h,12,true,false);
      ctx.strokeStyle=open?"rgba(114,255,196,.7)":"rgba(255,255,255,.75)";
      ctx.lineWidth=3;
      roundRect(g.x,g.y,g.w,g.h,12,false,true);
      ctx.font="900 15px system-ui";
      ctx.textAlign="center";
      ctx.fillStyle="#fff";
      if(!open) ctx.fillText(`Q${g.quizNeed}`,g.x+g.w/2,g.y-10);
      ctx.restore();
    }
  }

  function drawEnemies(){
    for(const e of state.world.enemies){
      drawImage(e.img,e.x,e.y+Math.sin(e.age*3)*(e.fly?8:0),e.w,e.h,e.hit>0?.7:1,Math.sin(e.age*2)*.04);
      ctx.fillStyle="rgba(0,0,0,.45)";
      ctx.fillRect(e.x,e.y-9,e.w,5);
      ctx.fillStyle="#ff5f84";
      ctx.fillRect(e.x,e.y-9,e.w*clamp(e.hp/70,0,1),5);
    }
  }

  function drawBoss(){
    const b=state.world.boss;
    if(!b)return;
    drawImage(b.img,b.x,b.y,b.w,b.h,1,Math.sin(b.age)*.03);
    const w=360,x=b.x-100,y=b.y-35;
    ctx.fillStyle="rgba(0,0,0,.55)";ctx.fillRect(x,y,w,12);
    ctx.fillStyle="#ff5cc8";ctx.fillRect(x,y,w*clamp(b.hp/b.maxHp,0,1),12);
    ctx.strokeStyle="rgba(255,255,255,.4)";ctx.strokeRect(x,y,w,12);
  }

  function drawTerminals(){
    for(const t of state.world.terminals){
      ctx.save();
      ctx.shadowColor=t.solved?"#72ffc4":(t.active?"#ffd86b":"#4bdcff");
      ctx.shadowBlur=t.active?22:10;
      ctx.fillStyle=t.solved?"rgba(114,255,196,.9)":(t.active?"rgba(255,216,107,.9)":"rgba(75,220,255,.72)");
      roundRect(t.x,t.y,t.w,t.h,15,true,false);
      ctx.fillStyle="#06122a";
      roundRect(t.x+12,t.y+18,t.w-24,46,10,true,false);
      ctx.fillStyle="#fff";ctx.font="900 18px system-ui";ctx.textAlign="center";
      ctx.fillText(t.solved?"✓":`Q${(t.quizId||0)+1}`,t.x+t.w/2,t.y+48);
      ctx.font="800 11px system-ui";
      ctx.fillStyle="rgba(255,255,255,.86)";
      ctx.fillText(`${Math.min(state.mission.coins,t.coinNeed)}/${t.coinNeed}`,t.x+t.w/2,t.y+82);
      ctx.restore();
    }
  }

  function drawPortal(){
    const p=state.world.portal;
    if(!p)return;
    ctx.save();
    ctx.globalAlpha=p.open?1:.35;
    ctx.strokeStyle=p.open?toolColor():"rgba(255,255,255,.35)";
    ctx.lineWidth=8;ctx.shadowColor=p.open?toolColor():"#fff";ctx.shadowBlur=p.open?25:5;
    ctx.beginPath();
    ctx.ellipse(p.x+p.w/2,p.y+p.h/2,p.w/2,p.h/2,0,0,Math.PI*2);
    ctx.stroke();
    ctx.font="900 16px system-ui";ctx.textAlign="center";ctx.fillStyle="#fff";
    ctx.fillText(p.open?"NEXT LAB":"LOCKED",p.x+p.w/2,p.y-12);
    ctx.restore();
  }

  function drawParticles(){
    for(const q of state.world.particles){
      if(q.type==="dot"){
        ctx.save();ctx.globalAlpha=1-q.age/q.life;ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();ctx.restore();
      }else if(q.type==="enemyShot"){
        ctx.save();ctx.fillStyle=q.color;ctx.shadowColor=q.color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();ctx.restore();
      }else{
        const src=q.type==="magnet"?ASSETS.effects.magnet:q.type==="wave"?ASSETS.effects.wave:q.type==="energy"?ASSETS.effects.beam:q.type==="spark"?ASSETS.effects.spark:ASSETS.effects.blast;
        drawImage(src,q.x-20,q.y-25,80,55,.8);
      }
    }
  }

  function drawPlayer(){
    const p=state.player;
    const src=!p.onGround?ASSETS.sprites.jump:Math.abs(p.vx)>20?ASSETS.sprites.run:ASSETS.sprites.idle;
    const a=p.invuln>0&&Math.sin(state.t*28)>0?.55:1;
    if(p.shield>0){
      ctx.save();ctx.strokeStyle="rgba(114,255,196,.8)";ctx.lineWidth=4;ctx.shadowColor="#72ffc4";ctx.shadowBlur=18;
      ctx.beginPath();ctx.arc(p.x+p.w/2,p.y+p.h/2,70,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    drawImage(src,p.x-32,p.y-38,p.w+64,p.h+58,a,Math.sin(p.anim*8)*.015);
  }

  function drawFloaters(){
    for(const f of state.world.floaters){
      ctx.save();ctx.globalAlpha=1-f.age/f.life;ctx.font=`1000 ${f.size}px system-ui`;ctx.textAlign="center";ctx.lineWidth=4;
      ctx.strokeStyle="rgba(0,0,0,.55)";ctx.strokeText(f.text,f.x,f.y);
      ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.restore();
    }
  }

  function loop(now){
    const dt=Math.min(.034,Math.max(.001,(now-last)/1000));
    last=now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  async function boot(){
    resize();
    await loadAssets();
    updateHUD();
    try{window.GG?.setSlug?.(GAME_SLUG);}catch{}
    requestAnimationFrame(loop);
  }
  boot();
})();