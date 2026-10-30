(() => {
  'use strict';

  /*
    Lost Jungle 2D: Temple of the Sun
    Version 2.4 — long-form story expedition, animated actors and mobile viewport controls.
    Keeps the existing assets, textures, backgrounds, sprites, items, effects,
    mobile controls, sounds, levels, score bridge, cutscenes, and map system.
  */

  const GAME_SLUG = 'lost-jungle-3d-temple-of-the-sun';
  const SAVE_KEY = 'wga_lost_jungle_2d_save_v1';
  const BEST_KEY = 'wga_lost_jungle_2d_best_v1';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const AUTO_ADVANCE_SECONDS = 2.8;
  const SHOOT_COOLDOWN = 0.26;
  const MAX_AMMO = 35;
  const GRAVITY = 1550;
  const DESIGN_W = 1280;
  const DESIGN_H = 720;

  const ui = {
    scoreValue: document.getElementById('scoreValue'),
    coinsValue: document.getElementById('coinsValue'),
    relicValue: document.getElementById('relicValue'),
    keysValue: document.getElementById('keysValue'),
    livesValue: document.getElementById('livesValue'),
    levelValue: document.getElementById('levelValue'),
    missionText: document.getElementById('missionText'),
    storyText: document.getElementById('storyText'),
    progressBar: document.getElementById('progressBar'),
    powerText: document.getElementById('powerText'),
    startOverlay: document.getElementById('startOverlay'),
    helpOverlay: document.getElementById('helpOverlay'),
    cutsceneOverlay: document.getElementById('cutsceneOverlay'),
    cutsceneLabel: document.getElementById('cutsceneLabel'),
    cutsceneTitle: document.getElementById('cutsceneTitle'),
    cutsceneText: document.getElementById('cutsceneText'),
    mapOverlay: document.getElementById('mapOverlay'),
    mapGrid: document.getElementById('mapGrid'),
    completeOverlay: document.getElementById('completeOverlay'),
    completeTitle: document.getElementById('completeTitle'),
    completeSummary: document.getElementById('completeSummary'),
    rewardText: document.getElementById('rewardText'),
    starRow: document.getElementById('starRow'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverSummary: document.getElementById('gameOverSummary'),
    muteBtn: document.getElementById('muteBtn'),
    pauseBtn: document.getElementById('pauseBtn')
  };

  const ASSETS = {
    backgrounds: {
      1: './assets/backgrounds/level-01-jungle-entrance.png',
      2: './assets/backgrounds/level-02-river-crossing.png',
      3: './assets/backgrounds/level-03-waterfall-ruins.png',
      4: './assets/backgrounds/level-04-spider-cave.png',
      5: './assets/backgrounds/level-05-monkey-bridge.png',
      6: './assets/backgrounds/level-06-stone-puzzle-temple.png',
      7: './assets/backgrounds/level-07-crystal-cave.png',
      8: './assets/backgrounds/level-08-lost-village.png',
      9: './assets/backgrounds/level-09-volcano-path.png',
      10: './assets/backgrounds/level-10-sun-temple-boss.png'
    },
    textures: {
      1: './assets/textures/platform-jungle.png',
      2: './assets/textures/platform-river.png',
      3: './assets/textures/platform-ruins.png',
      4: './assets/textures/platform-cave.png',
      5: './assets/textures/platform-bridge.png',
      6: './assets/textures/platform-puzzle.png',
      7: './assets/textures/platform-crystal.png',
      8: './assets/textures/platform-village.png',
      9: './assets/textures/platform-volcano.png',
      10: './assets/textures/platform-sun-temple.png'
    },
    sprites: {
      player: './assets/sprites/player-explorer.png',
      snake: './assets/sprites/enemy-snake.png',
      spider: './assets/sprites/enemy-spider.png',
      bat: './assets/sprites/enemy-bat.png',
      monkey: './assets/sprites/enemy-monkey.png',
      frog: './assets/sprites/enemy-frog.png',
      boar: './assets/sprites/enemy-boar.png',
      crawler: './assets/sprites/enemy-crawler.png',
      'Monkey King': './assets/sprites/boss-monkey-king.png',
      'Spider Queen': './assets/sprites/boss-spider-queen.png',
      'Sun Guardian': './assets/sprites/boss-sun-guardian.png'
    },
    items: {
      relic: './assets/items/relic-sun.png',
      coin: './assets/items/coin.png',
      key: './assets/items/key.png',
      plate: './assets/items/pressure-plate.png',
      dash: './assets/items/power-dash.png',
      torch: './assets/items/power-torch.png',
      shield: './assets/items/power-shield.png',
      heart: './assets/items/heart.png',
      gold: './assets/items/item-gold-sun-coins.png',
      emerald: './assets/items/item-emerald-relic.png',
      blaster: './assets/items/item-weapon-temple-blaster.png',
      doubleJump: './assets/items/item-boots-jump.png',
      magnet: './assets/items/item-magnet-sun.png',
      ammo: './assets/items/item-ammo-crystal-bolts.png'
    },
    effects: {
      portal: './assets/effects/portal-sun.png',
      vine: './assets/effects/vine-swing.png'
    }
  };

  const LEVELS=window.JungleCampaign.levels;
  const art=window.JungleAnimation;
  for(const lv of LEVELS){ASSETS.backgrounds[lv.id]=lv.bg;ASSETS.textures[lv.id]=lv.texture;}
  ASSETS.sprites.wasp=ASSETS.sprites.bat;ASSETS.sprites.sentry=ASSETS.sprites.crawler;

  const assetImages = {};
  let assetEpoch=0,viewScale=1,pixelRatio=1,cssWidth=1280,cssHeight=720;
  let jumpBuffer=0,coyote=0,riding=null,shootHeld=false,mapReturn='play',accumulator=0;
  const pointers=new Map();

  const keys = {};
  const touch = { left:false, right:false, forward:false, back:false };

  const stateDefaults = () => ({
    score: 0,
    best: readBest(),
    coins: 0,
    lives: 3,
    levelIndex: 0,
    unlockedLevel: 1,
    started: false,
    paused: false,
    muted: false,
    musicVolume: .55,
    effectsVolume: .8,
    gameOver: false,
    completed: false
  });

  let state = loadState();
  let last = performance.now();
  let lastLiveScore = -1;
  let lastLiveAt = 0;

  const camera = { x:0, y:0, shake:0 };

  const player = {
    x:120, y:0, w:54, h:86,
    vx:0, vy:0,
    dir:1,
    speed:300,
    jump:650,
    airJump:580,
    canDoubleJump:false,
    onGround:false,
    invuln:0,
    dashTimer:0,
    dashCooldown:0,
    torchTimer:0,
    shootTimer:0,
    shootPowerTimer:0,
    magnetTimer:0,
    shield:0,
    ammo:14,
    anim:0, jumpBootsTimer:0, hurt:0
  };

  const game = {
    platforms: [],
    hazards: [],
    items: [],
    enemies: [],
    darts: [],
    bullets: [],
    fallingRocks: [],
    particles: [],
    boss: null,
    exit: null,
    boulder: null,
    relics: 0,
    keys: 0,
    plateActive: false,
    gateOpen: false,
    gate: null,
    speech: '',
    speechTimer: 0,
    time: 0,
    levelComplete: false,
    levelCompleteTimer: 0,
    autoAdvanceQueued: false,
    challenge: null,
    challengeCooldown: 2,
    challengeHistory: [], checkpoints:[],checkpointIndex:0,storyMarks:[],storyOpen:false,onMap:false,loading:null
  };

  function currentLevel(){ return LEVELS[state.levelIndex] || LEVELS[0]; }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function rand(a,b){ return a + Math.random() * (b-a); }
  function choose(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function rects(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function centerRect(x,y,w,h){ return {x:x-w/2,y:y-h/2,w,h}; }

  function readBest(){try{return Math.max(0,Number(localStorage.getItem(BEST_KEY))||0);}catch{return 0;}}
  function loadState(){
    let raw={};try{const value=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(value&&typeof value==='object'&&!Array.isArray(value))raw=value;}catch{}
    const out={...stateDefaults(),...raw};
    for(const key of ['score','coins','best'])out[key]=clamp(Math.floor(Number(out[key])||0),0,1e9);
    out.best=Math.max(out.best,out.score,readBest());
    out.unlockedLevel=clamp(Math.floor(Number(out.unlockedLevel)||1),1,LEVELS.length);
    out.levelIndex=clamp(Math.floor(Number(out.levelIndex)||0),0,out.unlockedLevel-1);
    out.completedLevels=clamp(Math.floor(Number(out.completedLevels)||out.unlockedLevel-1),0,LEVELS.length);
    out.lives=clamp(Math.floor(Number(out.lives)||3),1,5);out.muted=!!out.muted;
    for(const key of ['musicVolume','effectsVolume'])out[key]=typeof raw[key]==='number'&&Number.isFinite(raw[key])?clamp(raw[key],0,1):stateDefaults()[key];
    out.started=false;out.paused=false;out.gameOver=false;out.completed=false;out.campaignVersion=24;
    return out;
  }

  function saveState(){
    state.best=Math.max(state.best,state.score);
    try{localStorage.setItem(BEST_KEY,String(Math.floor(state.best)));localStorage.setItem(SAVE_KEY,JSON.stringify({...state,started:false,paused:false,gameOver:false,completed:false}));}catch{}
  }

  async function loadAssets(){
    const epoch=++assetEpoch,lv=currentLevel(),kinds=['player',...lv.enemies,...(lv.boss?[lv.boss]:[])];
    const atlases=new Set(kinds.map(k=>art.source(k)).filter(Boolean));
    const needed=new Set([lv.bg,lv.texture,...Object.values(ASSETS.items),...Object.values(ASSETS.effects),...kinds.map(k=>ASSETS.sprites[k]).filter(Boolean),...atlases]);
    for(const url of Object.keys(assetImages))if(!needed.has(url))delete assetImages[url];
    art.retain(atlases);
    const queue=[...needed].filter(url=>!assetImages[url]);
    async function loadOne(url){return new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>{
        if(epoch===assetEpoch){
          if(atlases.has(url)){art.prepare(img,url,document);assetImages[url]={width:1,height:1,atlas:true};}
          else{
            const crop=art.original(url)||[0,0,img.naturalWidth||img.width,img.naturalHeight||img.height];
            const bound=url.includes('/backgrounds/')?1920:url.includes('/textures/')?256:192;
            const scale=Math.min(1,bound/Math.max(crop[2],crop[3]));
            const cached=document.createElement('canvas');cached.width=Math.max(1,Math.round(crop[2]*scale));cached.height=Math.max(1,Math.round(crop[3]*scale));
            const painter=cached.getContext?.('2d');
            if(painter){painter.drawImage(img,...crop,0,0,cached.width,cached.height);assetImages[url]=cached;}else assetImages[url]=img;
          }
        }
        img.onload=null;img.onerror=null;if(assetImages[url]!==img)img.src='';resolve();
      };
      img.onerror=()=>{if(epoch===assetEpoch)assetImages[url]=null;resolve();};img.src=url;
    });}
    await Promise.all(Array.from({length:3},async()=>{while(queue.length&&epoch===assetEpoch)await loadOne(queue.shift());}));
    if(epoch===assetEpoch){document.getElementById('continueCutsceneBtn').disabled=false;}
  }

  function hasAsset(src){const image=assetImages[src];return !!(image&&(image.naturalWidth||image.width));}

  function fitCanvasToViewport(){
    cssWidth=Math.max(240,window.innerWidth||1280);cssHeight=Math.max(240,window.visualViewport?.height||window.innerHeight||720);
    document.documentElement.style.setProperty('--viewport-height',cssHeight+'px');
    viewScale=cssWidth<cssHeight?clamp(cssWidth/620,.55,.8):clamp(cssHeight/720,.55,1.15);
  }

  function resizeCanvas(){
    fitCanvasToViewport();pixelRatio=Math.min(window.devicePixelRatio||1,2,Math.sqrt(3000000/(cssWidth*cssHeight)));
    canvas.width=Math.round(cssWidth*pixelRatio);canvas.height=Math.round(cssHeight*pixelRatio);
    ctx.setTransform(pixelRatio*viewScale,0,0,pixelRatio*viewScale,0,0);computeCamera(true);
  }

  function getW(){return cssWidth/viewScale;}
  function getH(){return cssHeight/viewScale;}

  function worldToScreen(x,y){return {x:x-camera.x+(camera.shakeX||0),y:y-camera.y+(camera.shakeY||0)};}
  function computeCamera(snap=false,dt=1/120){
    const lv=currentLevel(),targetX=clamp(player.x-getW()*.28,0,Math.max(0,lv.length+400-getW()));
    const safeTop=(cssHeight<500?95:150)/viewScale,groundCamera=570-getH()*.74;
    const targetY=Math.min(groundCamera,player.y-safeTop);
    const blend=snap?1:Math.min(1,dt*10);camera.x+=(targetX-camera.x)*blend;camera.y+=(targetY-camera.y)*blend;
  }

  function createPatternForLevel() {
    const img=assetImages[currentLevel().texture];if(!img)return null;
    if(game.patternImage!==img){game.patternImage=img;try{game.pattern=ctx.createPattern(img,'repeat');}catch{game.pattern=null;}}
    return game.pattern;
  }

  // The soundtrack streams one biome at a time; effects keep their existing cues.
  const audio=window.JungleAudio.create(window);
  function applyAudioSettings(){audio.configure({muted:state.muted,musicVolume:state.musicVolume,effectsVolume:state.effectsVolume});}
  function ensureAudio(){applyAudioSettings();return audio.unlock();}
  function sfx(kind){audio.effect(kind);}
  function startMusic(){applyAudioSettings();if(activePlay()&&!document.hidden)audio.playTheme(currentLevel().themeId);}
  function stopMusic(){audio.pause();}

  function postScore(mode='live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now-lastLiveAt < 150) return;
    lastLiveScore = clean;
    lastLiveAt = now;

    const payload = {gameSlug:GAME_SLUG, slug:GAME_SLUG, score:clean, best:Math.max(state.best,clean), level:currentLevel().id, mode};
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, {gameSlug:GAME_SLUG}); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, {gameSlug:GAME_SLUG}); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({type:'GG_SCORE', ...payload, payload}, '*'); } catch {}
    try { window.parent?.postMessage?.({type:'gg:score', ...payload, payload}, '*'); } catch {}
  }

  function startGame(){
    state=loadState();state.started=true;state.paused=false;state.completed=false;state.gameOver=false;state.lives=Math.max(3,state.lives);
    for(const id of ['startOverlay','completeOverlay','gameOverOverlay','mapOverlay','pauseOverlay'])document.getElementById(id).classList.remove('active');
    ensureAudio();buildLevel();showCutscene();saveState();
  }

  function showCutscene(){
    const lv=currentLevel();resetInput();state.paused=true;game.storyOpen=true;stopMusic();
    ui.cutsceneLabel.textContent='CHAPTER '+Math.ceil(lv.id/5)+' · '+lv.chapter+' · LEVEL '+lv.id+'/25';
    ui.cutsceneTitle.textContent=lv.title;ui.cutsceneText.textContent=lv.story;ui.cutsceneOverlay.classList.add('active');
  }

  function continueCutscene(){
    ui.cutsceneOverlay.classList.remove('active');game.storyOpen=false;state.paused=false;resetInput();startMusic();canvas.focus();
  }

  function addPlatform(x,y,w,h,type='solid', props={}) {
    game.platforms.push({
      id: game.platforms.length,
      x, y, w, h, type,
      baseX: x,
      baseY: y,
      prevX: x,
      prevY: y,
      moveAxis: props.moveAxis || null,
      moveRange: props.moveRange || 0,
      moveSpeed: props.moveSpeed || 0,
      phase: props.phase || Math.random() * Math.PI * 2,
      ...props
    });
  }

  function addItem(type,x,y,props={}) {
    game.items.push({id:game.items.length,type,x,y,w:52,h:52,taken:false,...props});
  }

  function addHazard(type,x,y,w,h,props={}) {
    game.hazards.push({id:game.hazards.length,type,x,y,w,h,active:true,...props});
  }

  function addEnemy(type,x,y,props={}) {
    const baseHp = type === 'monkey' ? 3 : type === 'spider' ? 2 : type === 'boar' ? 3 : type === 'crawler' ? 2 : 1;
    const enemyW = type === 'bat' ? 86 : type === 'boar' ? 96 : type === 'frog' ? 74 : type === 'crawler' ? 84 : 72;
    const enemyH = type === 'bat' ? 62 : type === 'boar' ? 76 : type === 'frog' ? 58 : type === 'crawler' ? 54 : 76;
    game.enemies.push({
      id:game.enemies.length,type,x,y,w:enemyW,h:enemyH,
      vx:type === 'bat' ? 110 : type === 'boar' ? 135 : type === 'frog' ? 95 : type === 'crawler' ? 80 : 80,
      baseX:x,baseY:y,range:props.range || 150,
      hp:props.hp || baseHp,
      dead:false,
      dir:Math.random()>.5?1:-1,
      shootTimer:1.4 + Math.random(),
      bob:Math.random()*Math.PI*2,
      ...props
    });
  }

  function buildLevel(){
    state.levelIndex=clamp(state.levelIndex,0,state.unlockedLevel-1);
    const lv=currentLevel(),world=window.JungleCampaign.build(lv);
    audio.selectTheme(lv.themeId);applyAudioSettings();
    Object.assign(game,world,{darts:[],bullets:[],fallingRocks:[],particles:[],relics:0,keys:0,plateActive:!lv.plateRequired,gateOpen:false,speech:lv.story,speechTimer:5,time:0,levelComplete:false,levelCompleteTimer:0,autoAdvanceQueued:false,challenge:null,challengeCooldown:4,checkpointIndex:0,storyOpen:false,onMap:false});
    Object.assign(player,{x:120,y:484,vx:0,vy:0,dir:1,onGround:false,invuln:0,dashTimer:0,dashCooldown:0,torchTimer:0,shootTimer:0,shootPowerTimer:0,magnetTimer:0,shield:0,ammo:14,canDoubleJump:false,jumpBootsTimer:0,hurt:0});
    resetInput();riding=null;camera.shake=0;computeCamera(true);
    document.getElementById('continueCutsceneBtn').disabled=true;game.loading=loadAssets();syncUI();renderMap();
  }

  function updateMovingPlatforms(dt) {
    for (const p of game.platforms) {
      p.prevX = p.x;
      p.prevY = p.y;
      if (p.type !== 'moving') continue;
      const wave = Math.sin(game.time * p.moveSpeed + p.phase) * p.moveRange;
      if (p.moveAxis === 'x') p.x = p.baseX + wave;
      if (p.moveAxis === 'y') p.y = p.baseY + wave;
    }
  }

  function shoot() {
    if (!state.started || state.paused || state.gameOver || state.completed || game.levelComplete) return;
    if (player.shootTimer > 0) return;
    if (player.ammo <= 0 && player.shootPowerTimer <= 0) {
      game.speech = 'No relic shots. Collect ammo or blaster power.';
      game.speechTimer = 1.4;
      return;
    }

    player.shootTimer = SHOOT_COOLDOWN;
    if (player.shootPowerTimer <= 0) player.ammo = Math.max(0, player.ammo - 1);

    const speed = 760;
    const power = player.shootPowerTimer > 0 ? 2 : 1;
    game.bullets.push({
      x: player.x + player.w/2 + player.dir * 35,
      y: player.y + player.h * .42,
      w: player.shootPowerTimer > 0 ? 28 : 20,
      h: player.shootPowerTimer > 0 ? 16 : 12,
      vx: player.dir * speed,
      life: 1.25,
      power,
      color: player.shootPowerTimer > 0 ? '#ffd66f' : '#66e7ff'
    });
    addParticles(player.x + player.w/2 + player.dir * 38, player.y + player.h*.42, player.shootPowerTimer > 0 ? '#ffd66f' : '#66e7ff', 5);
    sfx('power');
  }

  function powerLabel(power) {
    if (power === 'dash') return 'Dash';
    if (power === 'torch') return 'Torch';
    if (power === 'shield') return 'Shield';
    if (power === 'heart') return 'Healing Fruit';
    if (power === 'blaster') return 'Relic Blaster';
    if (power === 'doubleJump') return 'Double Jump';
    if (power === 'magnet') return 'Treasure Magnet';
    if (power === 'ammo') return 'Relic Ammo';
    return 'Power';
  }


  function jump(){
    if(!activePlay())return;
    if(player.onGround||coyote>0){player.vy=-player.jump;player.onGround=false;player.canDoubleJump=player.jumpBootsTimer>0||player.shootPowerTimer>0||player.magnetTimer>0;coyote=0;jumpBuffer=0;riding=null;addChallengeProgress('jump',1);sfx('jump');}
    else if(player.canDoubleJump){player.vy=-player.airJump;player.canDoubleJump=false;jumpBuffer=0;addChallengeProgress('jump',1);sfx('jump');}
    else jumpBuffer=.13;
  }
  function activePlay(){return state.started&&!state.paused&&!state.gameOver&&!state.completed&&!game.levelComplete&&!game.onMap&&!game.storyOpen;}

  function dash() {
    if (!state.started || state.paused || state.gameOver || state.completed || game.levelComplete) return;
    if (player.dashCooldown > 0) return;
    player.dashTimer = .22;
    player.dashCooldown = .8;
    player.invuln = Math.max(player.invuln, .24);
    player.vx = player.dir * 850;
    addParticles(player.x + player.w/2, player.y + 60, '#57d9ff', 16);
    sfx('dash');
  }

  function updatePlayer(dt){
    jumpBuffer=Math.max(0,jumpBuffer-dt);coyote=Math.max(0,coyote-dt);
    const left=keys.ArrowLeft||keys.KeyA||touch.left||touch.back,right=keys.ArrowRight||keys.KeyD||touch.right||touch.forward;
    const dir=(right?1:0)-(left?1:0),accel=player.onGround?3000:2100;
    if(dir){player.vx+=dir*accel*dt;player.dir=dir;}else player.vx*=Math.pow(player.onGround?.015:.2,dt);
    const speed=player.dashTimer>0?720:player.speed*(player.torchTimer>0?1.06:1);
    if(player.dashTimer>0)player.vx=player.dir*speed;else player.vx=clamp(player.vx,-speed,speed);
    if(riding){player.x+=riding.x-riding.prevX;player.y+=riding.y-riding.prevY;}
    const oldX=player.x,oldY=player.y;player.vy+=GRAVITY*dt;player.x+=player.vx*dt;player.y+=player.vy*dt;player.onGround=false;riding=null;
    for(const p of game.platforms){
      if(!rects(player,p))continue;
      if(oldY+player.h<=p.prevY+3&&player.vy>=0){player.y=p.y-player.h;player.vy=0;player.onGround=true;riding=p.type==='moving'?p:null;player.canDoubleJump=player.jumpBootsTimer>0||player.shootPowerTimer>0||player.magnetTimer>0;}
      else if(p.type==='ground'){
        if(oldX+player.w<=p.x+2&&player.vx>0){player.x=p.x-player.w;player.vx=0;}
        else if(oldX>=p.x+p.w-2&&player.vx<0){player.x=p.x+p.w;player.vx=0;}
      }
    }
    if(player.onGround){coyote=.10;if(jumpBuffer>0)jump();}
    player.x=clamp(player.x,0,currentLevel().length+300);
    if(player.y>900){loseLife('You fell into the jungle depths.',true);return;}
    for(const key of ['invuln','dashTimer','dashCooldown','torchTimer','shootTimer','shootPowerTimer','magnetTimer','jumpBootsTimer','hurt'])player[key]=Math.max(0,player[key]-dt);
    player.anim+=dt*(Math.abs(player.vx)>20?10:2);
    for(let i=game.checkpointIndex+1;i<game.checkpoints.length;i++){
      const c=game.checkpoints[i];if(player.x>=c.x&&Math.abs(player.y-c.y)<155){game.checkpointIndex=i;game.speech='Checkpoint reached';game.speechTimer=2;saveState();sfx('power');}
    }
    for(const note of game.storyMarks)if(!note.read&&player.x>=note.x){note.read=true;game.speech=note.text;game.speechTimer=5;}
    computeCamera(false,dt);camera.shake=Math.max(0,camera.shake-dt*28);
    if(shootHeld)shoot();
  }

  function updateWorld(dt){
    const lv=currentLevel();updateBullets(dt);updateMagnet(dt);
    const near=x=>Math.abs(x-player.x)<getW()+550;
    for(const h of game.hazards){
      if(!h.active||!near(h.x))continue;
      if(h.type==='dartTrap'){
        if(h.windup>0){h.windup-=dt;if(h.windup<=0){game.darts.push({x:h.x-12,y:h.y+22,w:28,h:12,vx:-360-Math.min(100,lv.id*3),vy:0,life:2.6});h.timer=Math.max(1.8,3-lv.id*.035);}}
        else{h.timer-=dt;if(h.timer<=0&&Math.abs(h.x-player.x)<520)h.windup=.65;}
      }
      if(h.type==='fallingRock'){
        if(h.falling){h.y+=(330+lv.id*4)*dt;if(h.y>630){h.y=h.baseY;h.falling=false;h.timer=2.5;}}
        else{h.timer-=dt;h.windup=h.timer<.65?.65-h.timer:0;if(h.timer<=0){h.falling=true;h.windup=0;}}
      }
      if(h.type==='rollingBoulder'){h.x+=h.vx*dt;if(h.x<h.minX||h.x>h.maxX){h.x=clamp(h.x,h.minX,h.maxX);h.vx*=-1;}}
    }
    for(const d of game.darts){d.x+=d.vx*dt;d.y+=(d.vy||0)*dt;d.vy=(d.vy||0)+(d.gravity||0)*dt;d.life-=dt;
      if(game.platforms.some(p=>p.type==='ground'&&rects(d,p)))d.life=0;
      if(d.life>0&&rects(d,player)&&player.invuln<=0){d.life=0;loseLife('A guardian shot hit you.');}}
    game.darts=game.darts.filter(d=>d.life>0&&Math.abs(d.x-player.x)<getW()+600).slice(-80);
    for(const e of game.enemies){
      e.hurt=Math.max(0,e.hurt-dt);if(e.dead){e.deadTime+=dt;continue;}if(!near(e.x))continue;
      const dx=player.x-e.x,dy=player.y+player.h*.45-(e.y+e.h*.5);e.bob+=dt;
      let movement=e.vx*e.dir;
      if(e.windup>0){e.windup-=dt;movement=0;
        if(e.windup<=0){e.attackTimer=e.type==='boar'?.6:.48;
          if(['monkey','wasp','sentry'].includes(e.type)||e.type==='snake'&&lv.id>=9){
            const speed=290+Math.min(110,lv.id*4),distance=Math.max(1,Math.hypot(e.aimX,e.aimY));
            game.darts.push({x:e.x+e.w/2,y:e.y+e.h*.45,w:22,h:12,vx:e.aimX/distance*speed,vy:e.aimY/distance*speed,life:2.8});
            if(e.type==='sentry'&&lv.id>=20)game.darts.push({x:e.x+e.w/2,y:e.y+e.h*.45,w:22,h:12,vx:e.aimX/distance*speed,vy:e.aimY/distance*speed-70,life:2.8});
          }
        }
      }else if(e.attackTimer>0){e.attackTimer=Math.max(0,e.attackTimer-dt);if(e.type==='boar')movement=e.attackDir*370;if(e.type==='spider')movement=e.attackDir*230;}
      else{e.shootTimer-=dt;const threat=Math.abs(dx)<(e.type==='boar'?400:510)&&Math.abs(dy)<200;
        if(e.shootTimer<=0&&threat&&['boar','spider','bat','monkey','wasp','sentry','snake'].includes(e.type)){
          e.windup=e.type==='boar'?.7:.55;e.attackDir=Math.sign(dx)||-1;e.dir=e.attackDir;e.aimX=dx;e.aimY=dy;e.shootTimer=Math.max(1.8,3.8-lv.id*.045);
        }
      }
      if(e.type==='sentry')movement=0;
      e.x=clamp(e.x+movement*dt,e.minX,e.maxX);if(e.x<=e.minX)e.dir=1;if(e.x>=e.maxX)e.dir=-1;
      if(e.type==='bat'||e.type==='wasp')e.y=e.baseY+Math.sin(e.bob*3)*22+(e.type==='bat'&&e.attackTimer>0?Math.sin(e.attackTimer/.48*Math.PI)*95:0);
      else if(e.type==='frog')e.y=e.baseY-Math.max(0,Math.sin(e.bob*3.2))*48;
      else if(e.type==='spider')e.y=e.baseY-(e.attackTimer>0?Math.sin(e.attackTimer/.48*Math.PI)*55:0);
      if(rects(player,e)){
        if(player.dashTimer>0||player.torchTimer>0)defeatEnemy(e);
        else if(player.vy>150&&player.y+player.h<e.y+24){defeatEnemy(e,2);player.vy=-410;}
        else if(player.invuln<=0)loseLife(enemyLabel(e.type)+' hit you.');
      }
    }
    game.enemies=game.enemies.filter(e=>!e.dead||e.deadTime<.55);
    const b=game.boss;
    if(b?.alive&&near(b.x)){
      b.hurt=Math.max(0,b.hurt-dt);const pace=b.originalBoss?.9:b.name==='Spider Queen'?1.35:b.name==='Monkey King'?1.1:.8;b.x=b.baseX+Math.sin(game.time*pace)*65;b.dir=player.x<b.x?-1:1;
      if(b.windup>0){b.windup-=dt;if(b.windup<=0){b.attackCount++;const dx=player.x-b.x,dy=player.y+player.h*.5-(b.y+b.h*.45),len=Math.max(1,Math.hypot(dx,dy)),speed=330+lv.id*3;
        const spreads=b.hp<b.maxHp*.5?[-.14,0,.14]:!b.originalBoss&&lv.id>=16&&b.name==='Sun Guardian'?[-.10,.10]:[0];
        for(const spread of spreads){const a=Math.atan2(dy,dx)+spread;game.darts.push({x:b.x+b.w/2,y:b.y+b.h*.45,w:30,h:15,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:3,boss:true});}
        b.shootTimer=Math.max(1.2,2.4-lv.id*.025)+(b.originalBoss?0:b.name==='Spider Queen'?.15:b.name==='Monkey King'?.3:0);
      }}else{b.shootTimer-=dt;if(b.shootTimer<=0&&Math.abs(player.x-b.x)<700)b.windup=.8;}
      if(rects(player,b)){if(player.dashTimer>0||player.torchTimer>0)damageBoss();else if(player.invuln<=0)loseLife((b.displayName||b.name)+' slammed you.');}
    }
    if(game.boulder?.active){const b=game.boulder;b.x+=b.vx*(b.x<player.x-760?1:.32)*dt;if(rects(player,b)&&player.invuln<=0)loseLife('Rolling boulder!');}
    for(const h of game.hazards){if(!h.active||h.type==='dartTrap'||h.type==='fallingRock'&&!h.falling)continue;
      const hit=h.type==='swingBlade'?{x:h.baseX+Math.sin(game.time*2.1+h.phase)*64,y:h.y+h.h*.45-12,w:h.w,h:26}:h;
      if(rects(player,hit)&&player.invuln<=0)loseLife(h.type==='water'?'River pit.':h.type==='lava'?'Lava pit.':h.type==='pit'?'Temple gap.':'Jungle trap.');
    }
    collectItems();checkGateAndExit();
  }

  function updateBullets(dt){
    for(const b of game.bullets){b.x+=b.vx*dt;b.life-=dt;if(game.platforms.some(p=>p.type==='ground'&&rects(b,p)))b.life=0;
      if(b.life<=0)continue;
      for(const e of game.enemies)if(!e.dead&&rects(b,e)){e.hp-=b.power;e.hurt=.2;b.life=0;addChallengeProgress('shoot',1);addParticles(e.x+e.w/2,e.y+e.h/2,b.color,8);if(e.hp<=0){e.dead=true;e.deadTime=0;state.score+=e.type==='boar'?300:200;addChallengeProgress('dash',1);sfx('hit');}break;}
      if(b.life>0&&game.boss?.alive&&rects(b,game.boss)){b.life=0;game.boss.hp-=b.power;game.boss.hurt=.2;addChallengeProgress('shoot',1);if(game.boss.hp<=0)bossDefeated();else sfx('boss');}
    }
    game.bullets=game.bullets.filter(b=>b.life>0&&Math.abs(b.x-player.x)<getW()+400);
  }

  function updateMagnet(dt) {
    if (player.magnetTimer <= 0) return;
    const px = player.x + player.w/2;
    const py = player.y + player.h/2;
    for (const it of game.items) {
      if (it.taken || !['coin','gold','emerald','relic','key'].includes(it.type)) continue;
      const cx = it.x + (it.w || 52)/2;
      const cy = it.y + (it.h || 52)/2;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 280 && dist > 1) {
        it.x += dx / dist * 280 * dt;
        it.y += dy / dist * 280 * dt;
      }
    }
  }


  function collectItems() {
    for (const it of game.items) {
      if (it.taken) continue;
      const box = {x:it.x,y:it.y,w:it.w||52,h:it.h||52};
      const magneticHit = player.magnetTimer > 0 && ['coin','gold','emerald','relic','key'].includes(it.type) &&
        Math.hypot((player.x+player.w/2)-(it.x+(it.w||52)/2),(player.y+player.h/2)-(it.y+(it.h||52)/2)) < 92;
      if (!rects(player, box) && !magneticHit) continue;
      if (it.type === 'coin') collectCoin(it);
      if (it.type === 'gold') collectGold(it);
      if (it.type === 'emerald') collectEmerald(it);
      if (it.type === 'relic') collectRelic(it);
      if (it.type === 'key') collectKey(it);
      if (it.type === 'power') collectPower(it);
      if (it.type === 'plate') activatePlate(it);
    }
  }

  function collectCoin(it) {
    it.taken = true;
    state.coins++;
    state.score += 60;
    addChallengeProgress('coins',1);
    addParticles(it.x+25,it.y+25,'#ffd66f',10);
    sfx('coin');
    postScore('live');
  }

  function collectGold(it) {
    it.taken = true;
    state.coins += 2;
    state.score += it.value || 120;
    addChallengeProgress('coins',2);
    addParticles(it.x+25,it.y+25,'#ffd66f',14);
    sfx('coin');
    postScore('live');
  }

  function collectEmerald(it) {
    it.taken = true;
    state.coins += 3;
    state.score += it.value || 240;
    addChallengeProgress('coins',3);
    addParticles(it.x+25,it.y+25,'#74f2a8',18);
    sfx('relic');
    postScore('live');
  }

  function collectRelic(it) {
    it.taken = true;
    game.relics++;
    state.score += 350;
    addChallengeProgress('relics',1);
    game.speech = `Sun Relic ${game.relics}/${currentLevel().relicTarget} recovered.`;
    game.speechTimer = 2;
    addParticles(it.x+25,it.y+25,currentLevel().theme,22);
    sfx('relic');
    postScore('live');
  }

  function collectKey(it) {
    it.taken = true;
    game.keys++;
    state.score += 160;
    game.speech = `Temple Key ${game.keys}/${currentLevel().keyTarget} collected.`;
    game.speechTimer = 2;
    addParticles(it.x+25,it.y+25,'#ffd66f',18);
    sfx('key');
    postScore('live');
  }

  function collectPower(it) {
    it.taken = true;
    state.score += 120;
    if (it.power === 'dash') {
      player.dashCooldown = 0;
      game.speech = 'Dash power ready.';
    }
    if (it.power === 'torch') {
      player.torchTimer = 10;
      game.speech = 'Torch power active.';
    }
    if (it.power === 'shield') {
      player.shield = 1;
      game.speech = 'Jungle shield active.';
    }
    if (it.power === 'heart') {
      state.lives = Math.min(5, state.lives+1);
      game.speech = 'Healing fruit restored one life.';
    }
    if (it.power === 'blaster') {
      player.shootPowerTimer = 12;
      player.ammo = Math.min(MAX_AMMO, player.ammo + 10);
      game.speech = 'Relic blaster powered up. Press Shoot / K to fire.';
    }
    if (it.power === 'doubleJump') {
      player.canDoubleJump = true;player.jumpBootsTimer=14;
      player.shootPowerTimer = Math.max(player.shootPowerTimer, 5);
      game.speech = 'Double jump power active.';
    }
    if (it.power === 'magnet') {
      player.magnetTimer = 12;
      game.speech = 'Treasure magnet active. Collectibles move toward you.';
    }
    if (it.power === 'ammo') {
      player.ammo = Math.min(MAX_AMMO, player.ammo + 12);
      game.speech = 'Relic ammo collected.';
    }
    game.speechTimer = 2.2;
    addParticles(it.x+25,it.y+25,currentLevel().theme,18);
    sfx('power');
    postScore('live');
  }

  function activatePlate(it) {
    if (game.plateActive) return;
    it.taken = true;
    game.plateActive = true;
    state.score += 260;
    game.speech = 'Pressure plate activated. The stone gate mechanism unlocks.';
    game.speechTimer = 2.4;
    addParticles(it.x+40,it.y+20,'#ffb347',25);
    sfx('plate');
  }

  function defeatEnemy(e,amount=player.dashTimer>0?2:1){
    if(e.dead||e.hurt>0)return;e.hp-=amount;e.hurt=.25;addParticles(e.x+e.w/2,e.y+e.h/2,'#ffb347',10);
    if(e.hp<=0){e.dead=true;e.deadTime=0;state.score+=200;addChallengeProgress('dash',1);sfx('hit');postScore('live');}
  }

  function damageBoss(){
    const b=game.boss;if(!b?.alive||b.hurt>0)return;b.hp-=player.dashTimer>0?2:1;b.hurt=.35;player.invuln=Math.max(player.invuln,.4);camera.shake=6;state.score+=90;addChallengeProgress('dash',1);
    if(b.hp<=0)bossDefeated();else sfx('boss');
  }
  function bossDefeated(){
    const b=game.boss;if(!b?.alive)return;b.alive=false;state.score+=1500;game.darts=[];game.speech=(b.displayName||b.name)+' is freed from the broken signal. The portal awakens.';game.speechTimer=4;sfx('win');postScore('live');
  }

  function enemyLabel(t) {
    if (t === 'snake') return 'Snake';
    if (t === 'spider') return 'Spider';
    if (t === 'bat') return 'Bat';
    if (t === 'monkey') return 'Monkey';
    if (t === 'frog') return 'Frog';
    if (t === 'boar') return 'Boar';
    if (t === 'crawler') return 'Plated crawler';
    if (t === 'wasp') return 'Sun wasp';
    if (t === 'sentry') return 'Stone sentry';
    return 'Enemy';
  }

  function canOpenGate() {
    const lv = currentLevel();
    return game.relics >= lv.relicTarget && game.keys >= lv.keyTarget && game.plateActive;
  }

  function gateMessage() {
    const lv = currentLevel();
    if (game.relics < lv.relicTarget) return `Find ${lv.relicTarget - game.relics} more Sun Relic(s).`;
    if (game.keys < lv.keyTarget) return `Find ${lv.keyTarget - game.keys} more Temple Key(s).`;
    if (!game.plateActive) return 'Step on the glowing pressure plate first.';
    return 'The gate is opening.';
  }

  function checkGateAndExit() {
    if (game.gate) {
      game.gate.locked = !canOpenGate();
      game.gateOpen = !game.gate.locked;
      if (game.gate.locked && rects(player, game.gate)) {
        player.x = game.gate.x - player.w - 4;
        player.vx = 0;
        game.speech = gateMessage();
        game.speechTimer = 1.7;
      }
      if (!game.gate.locked && Math.abs(player.x - game.gate.x) < 100) {
        game.speech = game.boss?.alive ? `Defeat ${game.boss.displayName||game.boss.name}.` : 'Gate open. Reach the sun portal.';
        game.speechTimer = 1.1;
      }
    }

    if (game.exit && rects(player, game.exit) && canOpenGate() && !(game.boss?.alive)) {
      completeLevel();
    }
  }

  function loseLife(message,fall=false){
    if(state.gameOver||state.completed||game.levelComplete||!fall&&player.invuln>0)return;
    if(!fall&&player.shield>0){player.shield=0;player.invuln=1;game.speech='Shield blocked the danger.';game.speechTimer=2;sfx('power');return;}
    if(game.challenge?.type==='survive')failChallenge('Survival challenge ended. Regroup at the beacon.');
    state.lives=Math.max(0,state.lives-1);state.score=Math.max(0,state.score-120);
    const c=game.checkpoints[game.checkpointIndex];Object.assign(player,{x:c.x,y:c.y,vx:0,vy:0,onGround:false,invuln:1.6,hurt:.4,dashTimer:0});riding=null;game.darts=[];resetInput();computeCamera(true);
    game.speech=message+' Return to the last checkpoint.';game.speechTimer=3;camera.shake=7;sfx('hit');
    if(state.lives<=0)triggerGameOver(false);syncUI();saveState();postScore('live');
  }

  function addParticles(x,y,color,n=16) {
    for (let i=0;i<n;i++) {
      game.particles.push({
        x,y,color,
        vx:rand(-140,140),
        vy:rand(-240,-40),
        size:rand(4,10),
        life:.85,
        ttl:.85
      });
    }
  }

  function updateParticles(dt) {
    for (const p of game.particles) {
      p.life -= dt;
      p.x += p.vx*dt;
      p.y += p.vy*dt;
      p.vy += 550*dt;
    }
    game.particles = game.particles.filter(p=>p.life>0).slice(-180);
  }

  // Continuous challenge system
  function ensureChallengeUI() {
    if (document.getElementById('challengeCard')) return;
    const shell = document.querySelector('.canvas-shell');
    if (!shell) return;
    const style = document.createElement('style');
    style.textContent = `
      .challenge-card-v2{position:absolute;right:14px;bottom:14px;z-index:7;width:min(360px,calc(100% - 28px));padding:12px;border-radius:18px;background:rgba(7,23,14,.64);border:1px solid rgba(255,214,111,.30);box-shadow:0 18px 48px rgba(0,0,0,.28),inset 0 0 20px rgba(255,214,111,.08);backdrop-filter:blur(12px);color:#fff8d8;pointer-events:none}
      .challenge-card-v2 strong{display:block;color:#ffd66f;font-size:12px;text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px}
      .challenge-card-v2 p{margin:0 0 8px;color:rgba(235,255,231,.88);font-weight:800;line-height:1.3;font-size:12px}
      .challenge-card-v2 .bar{height:9px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.13)}
      .challenge-card-v2 .bar span{display:block;height:100%;width:0%;background:linear-gradient(90deg,#74f2a8,#ffd66f,#ffb347);box-shadow:0 0 16px rgba(255,214,111,.35)}
      .challenge-card-v2 small{display:block;margin-top:6px;color:rgba(255,248,218,.76);font-weight:900}
      @media(max-width:980px){.challenge-card-v2{right:10px;bottom:156px;width:calc(100% - 20px)}}
    `;
    document.head.appendChild(style);
    const card = document.createElement('div');
    card.id = 'challengeCard';
    card.className = 'challenge-card-v2';
    card.innerHTML = `<strong>Continuous Challenge</strong><p id="challengeText">Complete jungle challenges while you run.</p><div class="bar"><span id="challengeBar"></span></div><small id="challengeMeta">Preparing challenge...</small>`;
    shell.appendChild(card);
  }

  function updateChallengeUI() {
    ensureChallengeUI();
    const card = document.getElementById('challengeCard');
    const text = document.getElementById('challengeText');
    const bar = document.getElementById('challengeBar');
    const meta = document.getElementById('challengeMeta');
    if (!card || !text || !bar || !meta) return;
    if (!state.started || state.gameOver || state.completed) {
      card.style.display = 'none';
      return;
    }
    card.style.display = state.paused||game.levelComplete?'none':'block';
    if (!game.challenge) {
      text.textContent = 'Next jungle challenge incoming...';
      bar.style.width = '0%';
      meta.textContent = 'Stay ready';
      return;
    }
    const ch = game.challenge;
    const progress = ch.target ? clamp(ch.progress / ch.target, 0, 1) : 0;
    text.textContent = ch.label;
    bar.style.width = `${Math.round(progress*100)}%`;
    meta.textContent = `${ch.progress}/${ch.target} • ${Math.ceil(ch.timeLeft)}s left • Reward ${ch.reward}`;
  }

  function startNewChallenge() {
    const pool = [
      {type:'coins', label:'Collect 8 coins before the timer ends.', target:8, reward:420},
      {type:'relics', label:'Recover 2 Sun Relics during this route.', target:2, reward:520},
      {type:'distance', label:'Run 700 metres through the jungle.', target:700, reward:460},
      {type:'jump', label:'Jump 3 times to clear danger.', target:3, reward:430},
      {type:'dash', label:'Dash through or defeat 2 enemies.', target:2, reward:520},
      {type:'shoot', label:'Land 3 relic shots before the timer ends.', target:3, reward:620},
      {type:'survive', label:'Survive without taking damage.', target:1, reward:560}
    ];
    let ch = choose(pool);
    if (game.challengeHistory.length && ch.type === game.challengeHistory[game.challengeHistory.length-1]) ch = choose(pool);
    game.challenge = {...ch, progress:0, timeLeft:ch.type==='survive'?26:38, startX:player.x};
    game.speech = `Challenge started: ${game.challenge.label}`;
    game.speechTimer = 2.2;
  }

  function addChallengeProgress(type,amount=1) {
    if (!game.challenge || game.challenge.type !== type) return;
    game.challenge.progress = Math.min(game.challenge.target, game.challenge.progress + amount);
    if (game.challenge.progress >= game.challenge.target) completeChallenge();
  }

  function completeChallenge() {
    const ch = game.challenge;
    if (!ch) return;
    state.score += ch.reward;
    state.coins += Math.max(1, Math.floor(ch.reward/140));
    game.challengeHistory.push(ch.type);
    if (game.challengeHistory.length > 5) game.challengeHistory.shift();
    game.challenge = null;
    game.challengeCooldown = 1.2;
    game.speech = `Challenge complete! Bonus +${ch.reward}`;
    game.speechTimer = 2.4;
    addParticles(player.x+player.w/2, player.y, '#ffd66f', 34);
    sfx('win');
    postScore('challenge_complete');
  }

  function failChallenge(reason) {
    if (!game.challenge) return;
    game.challengeHistory.push(game.challenge.type);
    if (game.challengeHistory.length > 5) game.challengeHistory.shift();
    game.challenge = null;
    game.challengeCooldown = 2.2;
    game.speech = reason;
    game.speechTimer = 2;
  }

  function updateChallenge(dt) {
    if (!state.started || state.paused || state.gameOver || state.completed || game.levelComplete) return;
    if (!game.challenge) {
      game.challengeCooldown -= dt;
      if (game.challengeCooldown <= 0) startNewChallenge();
      updateChallengeUI();
      return;
    }
    const ch = game.challenge;
    ch.timeLeft -= dt;
    if (ch.type === 'distance') {
      ch.progress = Math.min(ch.target, Math.max(0, Math.floor(player.x - ch.startX)));
      if (ch.progress >= ch.target) completeChallenge();
    }
    if (ch.type === 'survive') {
      ch.progress = ch.timeLeft <= 0 ? 1 : 0;
      if (ch.timeLeft <= 0) completeChallenge();
    }
    if (ch.timeLeft <= 0 && game.challenge) failChallenge('Challenge expired. A new one will appear soon.');
    updateChallengeUI();
  }

  function update(dt){
    if(game.levelComplete&&game.autoAdvanceQueued&&!state.paused&&!game.onMap&&!document.hidden)updateAutoAdvance(dt);
    if(!activePlay())return;game.time+=dt;
    if(game.speechTimer>0){game.speechTimer-=dt;if(game.speechTimer<=0)game.speech='';}
    updateMovingPlatforms(dt);updatePlayer(dt);if(!activePlay())return;updateWorld(dt);updateChallenge(dt);updateParticles(dt);
    game.uiTimer=(game.uiTimer||0)+dt;if(game.uiTimer>=.08){game.uiTimer=0;syncUI();}
  }

  function completeLevel() {
    if (game.levelComplete) return;
    game.levelComplete = true;resetInput();
    stopMusic();
    const stars = state.lives >= 3 ? 3 : state.lives === 2 ? 2 : 1;
    const bonus = 900 + stars*280 + game.relics*100 + game.keys*120;
    state.score += bonus;
    state.best = Math.max(state.best, state.score);
    state.completedLevels=Math.max(state.completedLevels,currentLevel().id);
    state.unlockedLevel=Math.min(LEVELS.length,Math.max(state.unlockedLevel,currentLevel().id+1));
    saveState();

    ui.completeTitle.textContent = currentLevel().id === LEVELS.length ? 'Temple of the Sun Cleared!' : `${currentLevel().title} Complete`;
    ui.completeSummary.textContent = currentLevel().id === LEVELS.length ? 'The five Sun Seals reunite. Mara and Ari watch the valley welcome its first true dawn.' : "Mara's trail continues. The next jungle route is open.";
    ui.rewardText.textContent = `Bonus +${bonus} • Score ${Math.floor(state.score)}`;
    ui.starRow.textContent = '★ '.repeat(stars).trim();
    ui.completeOverlay.classList.add('active');

    const nextBtn = document.getElementById('nextLevelBtn');
    if (nextBtn) nextBtn.textContent = currentLevel().id === LEVELS.length ? 'Finish Expedition' : `Auto-advancing in ${AUTO_ADVANCE_SECONDS}s`;
    game.levelCompleteTimer = AUTO_ADVANCE_SECONDS;
    game.autoAdvanceQueued = true;

    sfx('win');
    postScore(currentLevel().id === LEVELS.length ? 'game_won' : 'level_complete');
  }

  function updateAutoAdvance(dt) {
    if (!game.levelComplete || !game.autoAdvanceQueued) return;
    game.levelCompleteTimer -= dt;
    const nextBtn = document.getElementById('nextLevelBtn');
    if (nextBtn) nextBtn.textContent = currentLevel().id >= LEVELS.length ? 'Finish Expedition' : `Auto-advancing in ${Math.max(1, Math.ceil(game.levelCompleteTimer))}s`;
    if (game.levelCompleteTimer <= 0) {
      game.autoAdvanceQueued = false;
      nextLevel();
    }
  }

  function nextLevel() {
    if(!game.levelComplete||game.onMap)return;
    const nextBtn = document.getElementById('nextLevelBtn');
    if (nextBtn) nextBtn.textContent = 'Next Level';
    ui.completeOverlay.classList.remove('active');
    if (state.levelIndex >= LEVELS.length-1) {
      triggerGameOver(true);
      return;
    }
    state.levelIndex++;
    state.lives = Math.max(3, state.lives);
    buildLevel();
    showCutscene();
    saveState();
  }

  function triggerGameOver(win=false) {
    resetInput();game.autoAdvanceQueued=false;
    state.gameOver = !win;
    state.completed = win;
    stopMusic();
    saveState();
    ui.gameOverTitle.textContent = win ? 'Expedition Complete' : 'Expedition Failed';
    ui.gameOverSummary.textContent = win ? `Final score: ${Math.floor(state.score)}.` : `Final score: ${Math.floor(state.score)}. Try again and master the jungle route.`;
    ui.gameOverOverlay.classList.add('active');
    postScore(win ? 'game_won' : 'game_over');
  }

  function resetRun() {
    for(const id of ['mapOverlay','completeOverlay','pauseOverlay','cutsceneOverlay'])document.getElementById(id).classList.remove('active');
    state.levelIndex = 0;
    state.score = 0;
    state.lives = 3;
    state.started = true;
    state.gameOver = false;
    state.completed = false;
    state.paused = false;
    ui.gameOverOverlay.classList.remove('active');
    buildLevel();
    showCutscene();
    saveState();
  }

  // Drawing
  function draw() {
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    camera.shakeX=reduce?0:rand(-camera.shake,camera.shake);camera.shakeY=reduce?0:rand(-camera.shake,camera.shake);
    drawBackground();
    drawPlatforms();
    drawItems();
    drawHazards();
    drawEnemies();
    drawBoss();
    drawExitAndGate();
    drawPlayer();
    drawBullets();
    drawDarts();
    drawBoulder();
    drawParticles();
    drawForeground();
    drawCheckpoints();
  }

  function drawBackground(){
    const w=getW(),h=getH(),lv=currentLevel(),img=assetImages[lv.bg];
    if(hasAsset(lv.bg)){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,ratio=Math.max(w/iw,h/ih),dw=iw*ratio,dh=ih*ratio;ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);}
    else{const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#12351f');g.addColorStop(1,'#335d37');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
    if(lv.dark){ctx.fillStyle=player.torchTimer>0?'#05080c15':'#05080c35';ctx.fillRect(0,0,w,h);}
  }

  function drawPlatforms() {
    const pattern = createPatternForLevel();
    for (const p of game.platforms) {
      if (p.x+p.w < camera.x-120 || p.x > camera.x+getW()+420) continue;
      const s = worldToScreen(p.x,p.y);
      ctx.save();
      if (pattern) {
        ctx.translate(-camera.x*.42,0);
        ctx.fillStyle = pattern;
        ctx.fillRect(s.x + camera.x*.42, s.y, p.w, p.h);
      } else {
        ctx.fillStyle = currentLevel().id === 9 ? '#87351f' : '#5d7d3a';
        ctx.fillRect(s.x,s.y,p.w,p.h);
      }
      ctx.restore();
      const shade = ctx.createLinearGradient(0,s.y,0,s.y+p.h);
      shade.addColorStop(0,'rgba(255,255,255,.16)');
      shade.addColorStop(.55,'rgba(0,0,0,.02)');
      shade.addColorStop(1,'rgba(0,0,0,.35)');
      ctx.fillStyle = shade;
      ctx.fillRect(s.x,s.y,p.w,p.h);
      ctx.strokeStyle = 'rgba(255,214,111,.22)';
      ctx.lineWidth = 2;
      ctx.strokeRect(s.x,s.y,p.w,p.h);
    }
  }

  function drawItems() {
    for (const it of game.items) {
      if (it.taken || it.x < camera.x-160 || it.x > camera.x+getW()+220) continue;
      const src = it.type === 'coin' ? ASSETS.items.coin :
        it.type === 'gold' ? ASSETS.items.gold :
        it.type === 'emerald' ? ASSETS.items.emerald :
        it.type === 'relic' ? ASSETS.items.relic :
        it.type === 'key' ? ASSETS.items.key :
        it.type === 'plate' ? ASSETS.items.plate :
        ASSETS.items[it.power] || ASSETS.items.dash;
      drawImageOrOrb(src,it.x,it.y,it.w||54,it.h||54,currentLevel().theme,true);
    }
  }

  function drawHazards() {
    for (const h of game.hazards) {
      if (h.x+h.w < camera.x-160 || h.x > camera.x+getW()+220) continue;
      const s = worldToScreen(h.x,h.y);
      if (h.type === 'spikes' || h.type === 'spikePit') {
        ctx.fillStyle = h.type === 'spikePit' ? 'rgba(25,12,6,.78)' : 'rgba(235,235,220,.94)';
        if (h.type === 'spikePit') {
          roundRect(s.x, s.y, h.w, h.h, 16);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,248,218,.25)';
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(235,235,220,.94)';
        const spikeCount = h.type === 'spikePit' ? 8 : 5;
        for (let i=0;i<spikeCount;i++) {
          const x = s.x + i*(h.w/spikeCount);
          ctx.beginPath();
          ctx.moveTo(x,s.y+(h.type==='spikePit'?h.h*.45:h.h));
          ctx.lineTo(x+h.w/(spikeCount*2),s.y+(h.type==='spikePit'?h.h*.10:0));
          ctx.lineTo(x+h.w/spikeCount,s.y+(h.type==='spikePit'?h.h*.45:h.h));
          ctx.closePath();
          ctx.fill();
        }
      } else if (h.type === 'swingBlade') {
        const bladeX = s.x + Math.sin(game.time*2.1 + (h.phase||0)) * 64;
        ctx.strokeStyle = 'rgba(255,214,111,.65)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(s.x + h.w/2, s.y - 70);
        ctx.lineTo(bladeX + h.w/2, s.y + h.h*.45);
        ctx.stroke();
        ctx.fillStyle = 'rgba(230,230,230,.95)';
        ctx.beginPath();
        ctx.ellipse(bladeX + h.w/2, s.y + h.h*.45, h.w/2, 13, 0, 0, Math.PI*2);
        ctx.fill();
      } else if (h.type === 'fallingRock' || h.type === 'rollingBoulder') {
        if (h.type === 'fallingRock' && h.windup > 0) {
          const landing = worldToScreen(h.x, h.baseY + 300);
          ctx.strokeStyle = '#ffd66f';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(landing.x+h.w/2, landing.y-3, h.w*.7, 8, 0, 0, Math.PI*2);
          ctx.stroke();
        }
        ctx.fillStyle = '#594d3d';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x+h.w/2, s.y+h.h/2, h.w/2, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,214,111,.35)';
        ctx.stroke();
      } else if (h.type === 'dartTrap') {
        ctx.fillStyle = h.windup>0?'#ffb347':'rgba(95,63,28,.92)';
        roundRect(s.x,s.y,h.w,h.h,12);
        ctx.fill();
        ctx.strokeStyle = '#ffd66f';
        ctx.stroke();
      } else {
        ctx.fillStyle = h.type === 'lava' ? 'rgba(255,86,25,.70)' : h.type === 'water' ? 'rgba(87,217,255,.58)' : 'rgba(25,12,6,.70)';
        roundRect(s.x,s.y,h.w,h.h,16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,248,218,.25)';
        ctx.stroke();
      }
    }
  }


  function enemySpriteFor(type) {
    const fallback = {
      frog: ASSETS.sprites.snake,
      boar: ASSETS.sprites.monkey,
      crawler: ASSETS.sprites.spider
    };

    const preferred = ASSETS.sprites[type];
    if (preferred && hasAsset(preferred)) return preferred;

    const fallbackSrc = fallback[type];
    if (fallbackSrc && hasAsset(fallbackSrc)) return fallbackSrc;

    if (ASSETS.sprites.snake && hasAsset(ASSETS.sprites.snake)) return ASSETS.sprites.snake;
    if (ASSETS.sprites.monkey && hasAsset(ASSETS.sprites.monkey)) return ASSETS.sprites.monkey;
    return preferred || fallbackSrc || null;
  }

  function enemyTint(type) {
    if (type === 'frog') return '#74f2a8';
    if (type === 'boar') return '#ffb347';
    if (type === 'crawler') return '#be6eff';
    if (type === 'bat') return '#66e7ff';
    if (type === 'spider') return '#be6eff';
    if (type === 'monkey') return '#ffd66f';
    return '#ffb347';
  }


  function drawEnemies(){
    for(const e of game.enemies){if(e.x+e.w<camera.x-140||e.x>camera.x+getW()+180)continue;
      const s=worldToScreen(e.x,e.y),clip=e.hurt>0?'hurt':e.windup>0?'windup':e.attackTimer>0?'attack':'run';
      ctx.save();if(e.dead){ctx.globalAlpha=Math.max(0,1-e.deadTime/.55);ctx.translate(0,e.deadTime*30);}
      if(!art.draw(ctx,e.type,clip,s.x,s.y,e.w,e.h,e.dir,game.time))drawImageOrOrb(enemySpriteFor(e.type),e.x,e.y,e.w,e.h,enemyTint(e.type),false,e.dir);
      ctx.restore();
      if(e.windup>0){ctx.fillStyle='#ffb347';ctx.beginPath();ctx.arc(s.x+e.w/2,s.y-12,7+Math.sin(game.time*20)*2,0,Math.PI*2);ctx.fill();}
    }
  }

  function drawBoss(){
    const b=game.boss;if(!b?.alive||b.x>camera.x+getW()+300||b.x+b.w<camera.x-200)return;
    const s=worldToScreen(b.x,b.y),clip=b.hurt>0?'hurt':b.windup>0?'windup':b.shootTimer>1?'attack':'run';
    if(!art.draw(ctx,b.name,clip,s.x,s.y,b.w,b.h,b.dir,game.time))drawImageOrOrb(ASSETS.sprites[b.name],b.x,b.y,b.w,b.h,currentLevel().theme,false,b.dir);
    ctx.fillStyle='#06130cbb';ctx.fillRect(s.x,s.y-26,b.w,10);ctx.fillStyle=b.windup>0?'#ffd66f':'#ff6b6b';ctx.fillRect(s.x,s.y-26,b.w*Math.max(0,b.hp/b.maxHp),10);
    ctx.fillStyle='#fff8d8';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(b.displayName||b.name,s.x+b.w/2,s.y-34);
    if(b.windup>0){ctx.strokeStyle='#ffd66f';ctx.lineWidth=3;ctx.strokeRect(s.x-5,s.y-5,b.w+10,b.h+10);}
  }

  function drawExitAndGate() {
    if (game.gate && game.gate.locked) {
      const s = worldToScreen(game.gate.x,game.gate.y);
      ctx.fillStyle = 'rgba(82,58,33,.94)';
      roundRect(s.x,s.y,game.gate.w,game.gate.h,18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,214,111,.75)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#ffd66f';
      ctx.font = '900 20px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('LOCKED', s.x+game.gate.w/2, s.y+game.gate.h/2);
    }
    if (game.exit && canOpenGate() && !(game.boss?.alive)) {
      const src = ASSETS.effects.portal;
      drawImageOrOrb(src,game.exit.x,game.exit.y,game.exit.w,game.exit.h,'#ffd66f',true);
      const s = worldToScreen(game.exit.x,game.exit.y-14);
      ctx.fillStyle = '#fff8d8';
      ctx.font = '900 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT',s.x+game.exit.w/2,s.y);
    }
  }

  function drawPlayer(){
    const s=worldToScreen(player.x,player.y),clip=player.hurt>0?'hurt':player.shootTimer>.12||player.dashTimer>0?'shoot':!player.onGround?(player.vy<0?'rise':'fall'):Math.abs(player.vx)>25?'run':'idle';
    ctx.save();if(player.invuln>0&&Math.floor(game.time*18)%2===0)ctx.globalAlpha=.5;
    if(!art.draw(ctx,'player',clip,s.x,s.y,player.w,player.h,player.dir,game.time))drawImageOrOrb(ASSETS.sprites.player,player.x,player.y,player.w,player.h,'#74f2a8',false,player.dir);ctx.restore();
    if(player.shield>0){ctx.strokeStyle='#74f2a8cc';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(s.x+player.w/2,s.y+player.h/2,player.w*.8,player.h*.65,0,0,Math.PI*2);ctx.stroke();}
    if(player.torchTimer>0){const flame=ctx.createRadialGradient(s.x+player.w/2,s.y+player.h*.4,4,s.x+player.w/2,s.y+player.h*.4,100);flame.addColorStop(0,'#ffe79988');flame.addColorStop(1,'#ff8b2900');ctx.fillStyle=flame;ctx.fillRect(s.x-80,s.y-70,220,230);}
  }


  function drawBullets() {
    for (const b of game.bullets) {
      const s = worldToScreen(b.x,b.y);
      ctx.save();
      ctx.fillStyle = b.color || '#66e7ff';
      ctx.shadowColor = b.color || '#66e7ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(s.x + b.w/2, s.y + b.h/2, b.w, b.h*.7, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }


  function drawDarts() {
    ctx.fillStyle = '#ffb347';
    ctx.shadowColor = '#ffb347';
    ctx.shadowBlur = 12;
    for (const d of game.darts) {
      const s = worldToScreen(d.x,d.y);
      ctx.beginPath();
      ctx.moveTo(s.x,s.y);
      ctx.lineTo(s.x+d.w,s.y+d.h/2);
      ctx.lineTo(s.x,s.y+d.h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function drawBoulder() {
    const b = game.boulder;
    if (!b?.active) return;
    const s = worldToScreen(b.x,b.y);
    ctx.fillStyle = '#594d3d';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(s.x+b.w/2,s.y+b.h/2,b.w/2,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,214,111,.35)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  function drawImageOrOrb(src,x,y,w,h,color='#ffd66f',glow=false,dir=1) {
    const s = worldToScreen(x,y);
    if (hasAsset(src)) {
      ctx.save();
      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
      }
      ctx.translate(s.x+w/2,s.y+h/2);
      ctx.scale(dir < 0 ? -1 : 1,1);
      ctx.drawImage(assetImages[src], -w/2, -h/2, w, h);
      ctx.restore();
    } else {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s.x+w/2,s.y+h/2,Math.max(w,h)/2,0,Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,248,218,.70)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of game.particles) {
      const s = worldToScreen(p.x,p.y);
      const a = p.life/p.ttl;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(s.x,s.y,Math.max(1,p.size*a),0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawForeground() {
    const w = getW(), h = getH();
    ctx.save();
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    for(let i=0;i<12;i++){
      const drift=reduce?0:game.time*5;
      const x=(i*137+drift)%(w+20),y=(i*89+Math.sin(reduce?0:game.time*.4+i)*8)%h;
      ctx.fillStyle=currentLevel().dark?'#ffd88775':'#fff7bd45';ctx.beginPath();ctx.arc(x,y,1+i%2,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
    if (currentLevel().dark) {
      const s = worldToScreen(player.x+player.w/2, player.y+player.h/2);
      const radius = player.torchTimer > 0 ? 330 : 210;
      const vignette = ctx.createRadialGradient(s.x,s.y,radius*.25,s.x,s.y,radius);
      vignette.addColorStop(0,'rgba(0,0,0,0)');
      vignette.addColorStop(.55,'rgba(0,0,0,.25)');
      vignette.addColorStop(1,'rgba(0,0,0,.72)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0,0,w,h);
    }
  }

  function drawCheckpoints(){
    for(let i=1;i<game.checkpoints.length;i++){const c=game.checkpoints[i];if(c.x<camera.x-100||c.x>camera.x+getW()+100)continue;const s=worldToScreen(c.x,c.y);ctx.fillStyle=i<=game.checkpointIndex?'#74f2a8':'#ffd66f';ctx.fillRect(s.x,s.y+18,4,68);ctx.beginPath();ctx.moveTo(s.x+4,s.y+18);ctx.lineTo(s.x+30,s.y+30);ctx.lineTo(s.x+4,s.y+42);ctx.closePath();ctx.fill();}
  }

  function roundRect(x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function syncUI() {
    const lv = currentLevel();
    ui.scoreValue.textContent = Math.floor(state.score);
    ui.coinsValue.textContent = state.coins;
    ui.relicValue.textContent = `${game.relics}/${lv.relicTarget}`;
    ui.keysValue.textContent = `${game.keys}/${lv.keyTarget}`;
    ui.livesValue.textContent = state.lives;
    ui.levelValue.textContent = lv.id+'/25';
    document.getElementById('bestValue').textContent=Math.floor(state.best);
    document.getElementById('sealCount').textContent=[5,10,15,20,25].filter(id=>id<=state.completedLevels).length+' / 5';
    ui.progressBar.style.width = `${Math.min(100, game.relics/lv.relicTarget*100)}%`;

    let tools = [];
    if (player.dashCooldown <= 0) tools.push('Dash ready');
    if (player.torchTimer > 0) tools.push(`Torch ${Math.ceil(player.torchTimer)}s`);
    if (player.shootPowerTimer > 0) tools.push(`Blaster ${Math.ceil(player.shootPowerTimer)}s`);
    if (player.magnetTimer > 0) tools.push(`Magnet ${Math.ceil(player.magnetTimer)}s`);
    if (player.shield > 0) tools.push('Shield');
    tools.push(`Ammo ${player.ammo}`);
    ui.powerText.textContent = `Tool: ${tools.length ? tools.join(' • ') : 'None'}`;

    let mission;
    if (game.relics < lv.relicTarget) mission = `Collect ${lv.relicTarget - game.relics} more Sun Relic(s).`;
    else if (game.keys < lv.keyTarget) mission = `Find ${lv.keyTarget - game.keys} more Temple Key(s).`;
    else if (!game.plateActive) mission = 'Step on the glowing pressure plate.';
    else if (game.boss?.alive) mission = `Defeat ${game.boss.displayName||game.boss.name}.`;
    else mission = 'Reach the glowing exit portal.';
    ui.missionText.textContent = mission;
    ui.storyText.textContent = game.speech || lv.discovery;
    document.querySelector('.story-card').classList.toggle('speaking',game.speechTimer>0&&state.started&&!state.paused);
    ui.muteBtn.textContent = state.muted ? 'Sound Off' : 'Sound On';
    ui.muteBtn.setAttribute('aria-pressed',String(state.muted));
    document.getElementById('musicTrack').textContent=audio.track?.title||'Jungle Adventure';
    for(const key of ['musicVolume','effectsVolume']){
      document.getElementById(key).value=String(Math.round(state[key]*100));
      document.getElementById(key+'Value').textContent=Math.round(state[key]*100)+'%';
    }
    ui.pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
    updateChallengeUI();
  }

  function renderMap() {
    ui.mapGrid.innerHTML = '';
    for (const lv of LEVELS) {
      const unlocked = lv.id <= state.unlockedLevel;
      const btn = document.createElement('button');
      btn.className = `map-node ${unlocked ? 'unlocked' : 'locked'}`;
      btn.disabled = !unlocked;
      btn.innerHTML = `<strong>${lv.id}. ${lv.title}</strong><small>${lv.chapter}<br>${lv.relicTarget} relics • ${lv.keyTarget} key(s)${lv.boss?' • '+(lv.bossTitle||lv.boss):''}</small>`;
      btn.addEventListener('click',()=>{
        if(lv.id>state.unlockedLevel)return;state.started=true;game.onMap=false;
        state.levelIndex = lv.id - 1;
        ui.mapOverlay.classList.remove('active');
        state.paused = false;
        buildLevel();
        showCutscene();
        saveState();
      });
      ui.mapGrid.appendChild(btn);
    }
  }


  function resetInput(){for(const key of Object.keys(keys))delete keys[key];for(const key of Object.keys(touch))touch[key]=false;shootHeld=false;pointers.clear();jumpBuffer=0;coyote=0;for(const id of ['leftBtn','rightBtn','jumpBtn','dashBtn','shootBtn'])document.getElementById(id)?.classList.remove('held');}
  function setPaused(value){
    if(!state.started||game.storyOpen||game.onMap||state.gameOver||state.completed||game.levelComplete)return;
    state.paused=!!value;resetInput();document.getElementById('pauseOverlay').classList.toggle('active',state.paused);
    if(state.paused){stopMusic();document.getElementById('resumeBtn').focus();}else{startMusic();canvas.focus();}syncUI();
  }
  function openMap(){
    if(game.onMap)return;mapReturn=game.storyOpen?'story':game.levelComplete?'complete':state.gameOver||state.completed?'over':state.paused?'pause':'play';
    resetInput();state.paused=true;game.onMap=true;stopMusic();
    for(const id of ['cutsceneOverlay','completeOverlay','gameOverOverlay','pauseOverlay'])document.getElementById(id).classList.remove('active');
    renderMap();ui.mapOverlay.classList.add('active');document.getElementById('closeMapBtn').focus();
  }
  function closeMap(){
    game.onMap=false;ui.mapOverlay.classList.remove('active');resetInput();
    state.paused=['story','pause'].includes(mapReturn);
    const overlay={story:'cutsceneOverlay',complete:'completeOverlay',over:'gameOverOverlay',pause:'pauseOverlay'}[mapReturn];
    if(overlay)document.getElementById(overlay).classList.add('active');else if(activePlay())startMusic();
  }
  function bindEvents(){
    document.getElementById('playBtn').addEventListener('click',startGame);
    document.getElementById('howBtn').addEventListener('click',()=>ui.helpOverlay.classList.add('active'));
    document.getElementById('closeHelpBtn').addEventListener('click',()=>ui.helpOverlay.classList.remove('active'));
    document.getElementById('continueCutsceneBtn').addEventListener('click',continueCutscene);
    document.getElementById('submitScoreBtn').addEventListener('click',()=>postScore('manual_submit'));
    document.getElementById('mapBtn').addEventListener('click',openMap);document.getElementById('pauseMapBtn').addEventListener('click',openMap);
    document.getElementById('mapAfterBtn').addEventListener('click',openMap);document.getElementById('closeMapBtn').addEventListener('click',closeMap);
    document.getElementById('nextLevelBtn').addEventListener('click',()=>{if(game.levelComplete){game.autoAdvanceQueued=false;nextLevel();}});
    document.getElementById('retryBtn').addEventListener('click',()=>{ui.gameOverOverlay.classList.remove('active');state.gameOver=false;state.completed=false;state.lives=3;buildLevel();showCutscene();});
    document.getElementById('resetRunBtn').addEventListener('click',resetRun);document.getElementById('resumeBtn').addEventListener('click',()=>setPaused(false));
    ui.muteBtn.addEventListener('click',()=>{state.muted=!state.muted;ensureAudio();if(state.muted)stopMusic();else startMusic();saveState();syncUI();});
    for(const key of ['musicVolume','effectsVolume'])document.getElementById(key).addEventListener('input',e=>{
      state[key]=clamp(Number(e.target.value)/100,0,1);applyAudioSettings();
      if(activePlay())startMusic();saveState();syncUI();
    });
    ui.pauseBtn.addEventListener('click',()=>setPaused(!state.paused));
    const refresh=()=>{touch.left=[...pointers.values()].includes('leftBtn');touch.right=[...pointers.values()].includes('rightBtn');shootHeld=[...pointers.values()].includes('shootBtn');for(const id of ['leftBtn','rightBtn','jumpBtn','dashBtn','shootBtn'])document.getElementById(id).classList.toggle('held',[...pointers.values()].includes(id));};
    for(const id of ['leftBtn','rightBtn','jumpBtn','dashBtn','shootBtn']){
      const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{if(e.button!==0||!activePlay())return;e.preventDefault();startMusic();pointers.set(e.pointerId,id);el.setPointerCapture(e.pointerId);refresh();if(id==='jumpBtn')jump();if(id==='dashBtn')dash();if(id==='shootBtn')shoot();});
      const release=e=>{e.preventDefault();pointers.delete(e.pointerId);refresh();};for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,release);
    }
    window.addEventListener('keydown',e=>{
      if(e.target?.tagName==='INPUT'||e.target?.tagName==='TEXTAREA'||e.target?.isContentEditable)return;
      if(e.code==='Escape'||e.code==='KeyP'){if(!e.repeat){if(game.onMap)closeMap();else setPaused(!state.paused);}e.preventDefault();return;}
      if(!activePlay())return;startMusic();if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;
      if(!e.repeat&&['Space','ArrowUp','KeyW'].includes(e.code))jump();if(!e.repeat&&['ShiftLeft','ShiftRight','KeyJ'].includes(e.code))dash();if(!e.repeat&&['KeyK','KeyF'].includes(e.code))shoot();if(!e.repeat&&e.code==='KeyM')openMap();
    });
    window.addEventListener('keyup',e=>{delete keys[e.code];});
    const interrupt=()=>{resetInput();stopMusic();setPaused(true);last=performance.now();accumulator=0;};
    window.addEventListener('blur',interrupt);document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();});window.addEventListener('pagehide',()=>{interrupt();saveState();});
    window.addEventListener('resize',resizeCanvas);window.visualViewport?.addEventListener('resize',resizeCanvas);
    window.addEventListener('message',ev=>{
      if(ev.source!==window.parent||ev.origin!==window.location.origin)return;const data=ev.data||{},type=data.type||data.event;
      if(type==='GG_PAUSE')setPaused(!!(data.payload?.paused??data.paused));
      if(type==='GG_RESTART'&&state.started)resetRun();
      if(type==='GG_MUTE'){state.muted=!!(data.payload?.muted??data.muted);applyAudioSettings();if(state.muted)stopMusic();else startMusic();saveState();syncUI();}
    });
  }

  function loop(now){
    accumulator+=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    while(accumulator>=1/120){update(1/120);accumulator-=1/120;}draw();requestAnimationFrame(loop);
  }

  bindEvents();resizeCanvas();buildLevel();
  game.loading.then(()=>{
    document.getElementById('playBtn').disabled=false;
    document.getElementById('playBtn').textContent=state.levelIndex>0?'Continue Expedition':'Start Expedition';
    resizeCanvas();requestAnimationFrame(loop);
  });
})();
