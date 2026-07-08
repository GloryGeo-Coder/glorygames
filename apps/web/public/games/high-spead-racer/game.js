(() => {
  "use strict";

  const GAME_SLUG = "high-spead-racer";
  const canvas = document.getElementById("application-canvas");

  if (!canvas || typeof pc === "undefined") {
    const msg = document.createElement("div");
    msg.style.cssText = "position:fixed;inset:0;display:grid;place-items:center;background:#050816;color:white;font-family:system-ui;padding:24px;text-align:center;z-index:9999";
    msg.innerHTML = "<div><h2>High Spead Racer</h2><p>PlayCanvas could not load. Check that playcanvas-stable.min.js is included before game.js.</p></div>";
    document.body.appendChild(msg);
    return;
  }

  const $ = (id) => document.getElementById(id);
  const ui = {
    score: $("scoreValue"),
    speed: $("speedValue"),
    distance: $("distanceValue"),
    nitroFill: $("nitroFill"),
    startOverlay: $("startOverlay"),
    gameOverOverlay: $("gameOverOverlay"),
    startBtn: $("startBtn"),
    restartBtn: $("restartBtn"),
    gameOverTitle: $("gameOverTitle"),
    finalStats: $("finalStats"),
    leftBtn: $("leftBtn"),
    rightBtn: $("rightBtn"),
    nitroBtn: $("nitroBtn")
  };

  function makeUi(id, css, html = "") {
    let el = $(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.innerHTML = html;
      document.body.appendChild(el);
    }
    el.style.cssText = css;
    return el;
  }

  const countdownEl = makeUi(
    "countdownOverlay",
    "position:absolute;inset:0;display:none;place-items:center;z-index:4;pointer-events:none;color:white;font:900 82px/1 system-ui;text-shadow:0 0 30px #3be1ff,0 8px 32px rgba(0,0,0,.65);"
  );

  const levelOverlay = makeUi(
    "levelOverlay",
    "position:absolute;left:50%;top:18%;transform:translateX(-50%);z-index:4;display:none;width:min(88vw,460px);padding:14px 16px;border-radius:18px;background:rgba(8,14,28,.78);border:1px solid rgba(120,180,255,.28);box-shadow:0 12px 34px rgba(0,0,0,.35);backdrop-filter:blur(8px);font-family:system-ui;color:white;text-align:center;pointer-events:none;",
    `<div id="levelKicker" style="color:#77b8ff;text-transform:uppercase;font-size:11px;letter-spacing:.16em;font-weight:900">Level 1</div>
     <div id="levelTitle" style="font-size:24px;font-weight:900;margin:4px 0 2px">Coastal Sprint</div>
     <div id="levelText" style="font-size:13px;color:#d4e6ff">Warm up and dodge early traffic.</div>`
  );

  const pauseOverlay = makeUi(
    "pauseOverlay",
    "position:absolute;inset:0;display:none;place-items:center;z-index:5;background:rgba(5,8,22,.45);backdrop-filter:blur(6px);color:white;font-family:system-ui;text-align:center;padding:24px;",
    `<div style="width:min(92vw,420px);padding:24px;border-radius:24px;background:rgba(8,14,28,.9);border:1px solid rgba(120,180,255,.25);box-shadow:0 16px 40px rgba(0,0,0,.4)">
       <div style="color:#77b8ff;text-transform:uppercase;font-size:12px;letter-spacing:.14em;font-weight:900">Race Paused</div>
       <h2 style="margin:8px 0 10px;font-size:36px">High Spead Racer</h2>
       <p style="margin:0 0 16px;color:#d4e6ff">Press P / Esc or tap Resume to continue.</p>
       <button id="resumeBtn" style="border:0;border-radius:16px;padding:14px 18px;width:100%;font-size:16px;font-weight:900;color:white;background:linear-gradient(135deg,#28a8ff,#6d4dff);box-shadow:0 10px 24px rgba(70,110,255,.35)">Resume</button>
     </div>`
  );

  const pauseBtn = makeUi(
    "pauseBtn",
    "position:absolute;top:12px;right:12px;z-index:2;width:48px;height:48px;border-radius:16px;border:1px solid rgba(120,180,255,.25);background:rgba(8,14,28,.78);color:white;font:900 18px system-ui;display:grid;place-items:center;box-shadow:0 8px 22px rgba(0,0,0,.25);cursor:pointer;",
    "Ⅱ"
  );

  const muteBtn = makeUi(
    "muteBtn",
    "position:absolute;top:66px;right:12px;z-index:2;width:48px;height:48px;border-radius:16px;border:1px solid rgba(120,180,255,.25);background:rgba(8,14,28,.78);color:white;font:900 18px system-ui;display:grid;place-items:center;box-shadow:0 8px 22px rgba(0,0,0,.25);cursor:pointer;",
    "♪"
  );

  const toastEl = makeUi(
    "raceToast",
    "position:absolute;left:50%;top:28%;transform:translateX(-50%);z-index:3;display:none;padding:10px 14px;border-radius:999px;background:rgba(8,14,28,.78);border:1px solid rgba(120,180,255,.25);color:white;font:800 14px system-ui;text-shadow:0 1px 8px rgba(0,0,0,.5);pointer-events:none;"
  );

  function toast(text) {
    toastEl.textContent = text;
    toastEl.style.display = "block";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => (toastEl.style.display = "none"), 1050);
  }

  function setOverlayState() {
    document.body.classList.toggle("is-playing", state.mode === "running" || state.mode === "countdown" || state.mode === "paused");
    document.body.classList.toggle("is-menu", state.mode === "menu");
  }

  function updatePremiumHud() {
    const levelLabel = $("premiumLevel");
    const progressFill = $("premiumProgressFill");
    const miniMapDots = document.querySelectorAll(".map-dot");
    if (levelLabel) levelLabel.textContent = `LEVEL ${state.level + 1}/${LEVELS.length}`;
    if (progressFill) {
      progressFill.style.width = `${Math.max(0, Math.min(100, (state.lapDistance / levelLapLength()) * 100))}%`;
    }
    miniMapDots.forEach((d, i) => d.classList.toggle("active", i === state.level));
  }


  const app = new pc.Application(canvas, {
    mouse: new pc.Mouse(canvas),
    touch: new pc.TouchDevice(canvas),
    keyboard: new pc.Keyboard(window)
  });

  app.start();
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  app.scene.gammaCorrection = pc.GAMMA_SRGB;
  app.scene.toneMapping = pc.TONEMAP_ACES;
  const resize = () => app.resizeCanvas(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
  window.addEventListener("resize", resize);
  resize();

  const LEVELS = [
    { title:"Coastal Sprint", mission:"Palm trees, smooth roads, and light traffic.", targetDistance:1200, baseSpeed:36, maxSpeed:62, spawnBase:1.16, pickupRate:2.0, hazardRate:999, curve:1.0, sky:new pc.Color(0.035,0.07,0.14), fog:new pc.Color(0.18,0.34,0.55), road:new pc.Color(0.11,0.115,0.13), shoulder:new pc.Color(0.16,0.28,0.16), terrainA:new pc.Color(0.1,0.4,0.18), terrainB:new pc.Color(0.45,0.34,0.2), env:"coast", musicRoot:110, bonus:800 },
    { title:"Desert Boostway", mission:"Cacti, rocks, faster traffic, and wider sightlines.", targetDistance:1500, baseSpeed:42, maxSpeed:72, spawnBase:0.98, pickupRate:1.85, hazardRate:4.4, curve:1.15, sky:new pc.Color(0.09,0.06,0.035), fog:new pc.Color(0.55,0.38,0.18), road:new pc.Color(0.095,0.085,0.08), shoulder:new pc.Color(0.35,0.25,0.15), terrainA:new pc.Color(0.55,0.34,0.15), terrainB:new pc.Color(0.28,0.18,0.1), env:"desert", musicRoot:123.47, bonus:1100 },
    { title:"Metro Night Run", mission:"Neon towers, billboards, and hazard gates.", targetDistance:1800, baseSpeed:48, maxSpeed:80, spawnBase:0.86, pickupRate:1.7, hazardRate:3.4, curve:1.25, sky:new pc.Color(0.018,0.025,0.07), fog:new pc.Color(0.12,0.2,0.55), road:new pc.Color(0.04,0.05,0.09), shoulder:new pc.Color(0.12,0.11,0.22), terrainA:new pc.Color(0.08,0.1,0.16), terrainB:new pc.Color(0.11,0.07,0.16), env:"metro", musicRoot:130.81, bonus:1500 },
    { title:"Alpine Hyperpass", mission:"Pine forests, cool colors, and sharper curves.", targetDistance:2100, baseSpeed:54, maxSpeed:88, spawnBase:0.78, pickupRate:1.6, hazardRate:2.8, curve:1.55, sky:new pc.Color(0.045,0.07,0.09), fog:new pc.Color(0.4,0.55,0.68), road:new pc.Color(0.075,0.08,0.1), shoulder:new pc.Color(0.34,0.38,0.42), terrainA:new pc.Color(0.55,0.6,0.62), terrainB:new pc.Color(0.24,0.28,0.31), env:"alpine", musicRoot:146.83, bonus:1900 },
    { title:"Jungle Storm Route", mission:"Dense foliage, glowing pickups, and high pressure traffic.", targetDistance:2400, baseSpeed:58, maxSpeed:94, spawnBase:0.72, pickupRate:1.52, hazardRate:2.45, curve:1.7, sky:new pc.Color(0.018,0.06,0.045), fog:new pc.Color(0.12,0.38,0.24), road:new pc.Color(0.05,0.065,0.055), shoulder:new pc.Color(0.1,0.23,0.12), terrainA:new pc.Color(0.08,0.32,0.1), terrainB:new pc.Color(0.03,0.16,0.08), env:"jungle", musicRoot:164.81, bonus:2300 },
    { title:"Final Velocity", mission:"Neon arches, hyper-road textures, and maximum speed.", targetDistance:2800, baseSpeed:64, maxSpeed:106, spawnBase:0.64, pickupRate:1.42, hazardRate:2.05, curve:1.85, sky:new pc.Color(0.06,0.015,0.09), fog:new pc.Color(0.48,0.12,0.72), road:new pc.Color(0.05,0.04,0.07), shoulder:new pc.Color(0.18,0.08,0.24), terrainA:new pc.Color(0.18,0.08,0.25), terrainB:new pc.Color(0.08,0.06,0.12), env:"final", musicRoot:196.0, bonus:3000 }
  ];


  // ---------- garage, coins, unlocks and upgrades ----------
  const GARAGE_CARS = [
    { id: "mclaren-senna", name: "McLaren Senna", model: "mclaren", price: 0, speed: 7, handling: 5, nitro: 4, label: "Hypercar" },
    { id: "dodge-challenger", name: "Dodge Challenger", model: "challenger", price: 850, speed: 4, handling: 1, nitro: 6, label: "Muscle" },
    { id: "porsche-911-gt2", name: "Porsche 911 GT2", model: "porsche", price: 1500, speed: 6, handling: 5, nitro: 3, label: "Track Focused" },
    { id: "audi-r8", name: "Audi R8", model: "audi", price: 2200, speed: 5, handling: 4, nitro: 5, label: "Balanced Supercar" }
  ];

  const PROFILE_KEY = "high-spead-racer-profile-v1";

  const profile = {
    coins: 0,
    bestScore: 0,
    owned: { "mclaren-senna": true },
    selectedCar: "mclaren-senna",
    upgrades: { speed: 0, handling: 0, nitro: 0 }
  };

  function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      profile.coins = clampNumber(saved.coins, 0, 9999999);
      profile.bestScore = clampNumber(saved.bestScore, 0, 999999999);
      profile.selectedCar = saved.selectedCar || profile.selectedCar;
      profile.owned = { ...profile.owned, ...(saved.owned || {}) };
      profile.upgrades = {
        speed: clampNumber(saved.upgrades?.speed, 0, 5),
        handling: clampNumber(saved.upgrades?.handling, 0, 5),
        nitro: clampNumber(saved.upgrades?.nitro, 0, 5)
      };
      const carIdMap = {
        "red-viper": "mclaren-senna",
        "blue-bolt": "dodge-challenger",
        "cargo-blast": "porsche-911-gt2",
        "purple-phantom": "audi-r8"
      };
      Object.entries(carIdMap).forEach(([oldId, newId]) => {
        if (profile.owned[oldId]) profile.owned[newId] = true;
      });
      if (carIdMap[profile.selectedCar]) profile.selectedCar = carIdMap[profile.selectedCar];
      profile.owned["mclaren-senna"] = true;
      if (!profile.owned[profile.selectedCar]) profile.selectedCar = "mclaren-senna";
    } catch {}
  }

  function saveProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
  }

  function getSelectedCar() {
    return GARAGE_CARS.find((c) => c.id === profile.selectedCar) || GARAGE_CARS[0];
  }

  function selectedModelIndex() {
    const model = getSelectedCar().model;
    if (model === "mclaren") return 0;
    if (model === "challenger") return 1;
    if (model === "porsche") return 2;
    if (model === "audi") return 3;
    return 0;
  }

  function upgradeCost(type) {
    return 350 + (profile.upgrades[type] || 0) * 450;
  }

  function selectedCarStats() {
    const car = getSelectedCar();
    return {
      speed: car.speed + profile.upgrades.speed * 2,
      handling: car.handling + profile.upgrades.handling * 2,
      nitro: car.nitro + profile.upgrades.nitro * 2
    };
  }

  function refreshGarageUi() {
    const coinsEl = $("coinValue");
    const bestEl = $("bestScoreValue");
    if (coinsEl) coinsEl.textContent = Math.floor(profile.coins).toLocaleString();
    if (bestEl) bestEl.textContent = Math.floor(profile.bestScore).toLocaleString();

    const selected = getSelectedCar();
    const nameEl = $("selectedCarName");
    const statEl = $("selectedCarStats");
    if (nameEl) nameEl.textContent = selected.name;
    if (statEl) {
      const stats = selectedCarStats();
      statEl.textContent = `Speed +${stats.speed} • Handling +${stats.handling} • Nitro +${stats.nitro}`;
    }

    const list = $("garageCarList");
    if (list) {
      list.innerHTML = GARAGE_CARS.map((car) => {
        const owned = !!profile.owned[car.id];
        const selectedClass = car.id === profile.selectedCar ? " selected" : "";
        const lockedClass = owned ? "" : " locked";
        const priceText = owned ? (car.id === profile.selectedCar ? "Selected" : "Select") : `${car.price} coins`;
        return `
          <button class="garage-car${selectedClass}${lockedClass}" data-car="${car.id}">
            <span class="car-name">${car.name}</span>
            <span class="car-label">${car.label}</span>
            <span class="car-stats">SPD ${car.speed >= 0 ? "+" : ""}${car.speed} • HND ${car.handling >= 0 ? "+" : ""}${car.handling} • NTR +${car.nitro}</span>
            <span class="car-action">${priceText}</span>
          </button>
        `;
      }).join("");
    }

    ["speed", "handling", "nitro"].forEach((type) => {
      const lvl = profile.upgrades[type] || 0;
      const lvlEl = $(`${type}Level`);
      const costEl = $(`${type}Cost`);
      const btn = $(`${type}UpgradeBtn`);
      if (lvlEl) lvlEl.textContent = `${lvl}/5`;
      if (costEl) costEl.textContent = lvl >= 5 ? "MAX" : `${upgradeCost(type)} coins`;
      if (btn) btn.disabled = lvl >= 5 || profile.coins < upgradeCost(type);
    });
  }

  function selectOrBuyCar(carId) {
    const car = GARAGE_CARS.find((c) => c.id === carId);
    if (!car) return;
    if (profile.owned[car.id]) {
      profile.selectedCar = car.id;
      saveProfile();
      refreshGarageUi();
      refreshPlayerCarModel();
      toast(`${car.name} selected`);
      return;
    }
    if (profile.coins >= car.price) {
      profile.coins -= car.price;
      profile.owned[car.id] = true;
      profile.selectedCar = car.id;
      saveProfile();
      refreshGarageUi();
      refreshPlayerCarModel();
      toast(`${car.name} unlocked`);
    } else {
      toast(`Need ${car.price - profile.coins} more coins`);
    }
  }

  function buyUpgrade(type) {
    const lvl = profile.upgrades[type] || 0;
    if (lvl >= 5) return;
    const cost = upgradeCost(type);
    if (profile.coins < cost) {
      toast(`Need ${cost - profile.coins} more coins`);
      return;
    }
    profile.coins -= cost;
    profile.upgrades[type] = lvl + 1;
    saveProfile();
    refreshGarageUi();
    toast(`${type.toUpperCase()} upgraded`);
  }

  function refreshPlayerCarModel() {
    if (typeof playerCar === "undefined" || !playerCar) return;
    if (playerCar.importedModel) {
      playerCar.importedModel.destroy();
      playerCar.importedModel = null;
    }
    playerCar.modelIndex = selectedModelIndex();
    applyImportedCarModel(playerCar);
  }

  function awardCoins(amount) {
    profile.coins += Math.max(0, Math.floor(amount));
    saveProfile();
    refreshGarageUi();
  }

  loadProfile();

  const state = {
    mode: "menu",
    elapsed: 0,
    level: 0,
    levelDistance: 0,
    levelBanner: 0,
    score: 0,
    distance: 0,
    lastPostedScore: 0,
    countdown: 0,
    trafficTimer: 0,
    pickupTimer: 0,
    hazardTimer: 0,
    difficultyTimer: 0,
    baseSpeed: LEVELS[0].baseSpeed,
    roadSpeed: LEVELS[0].baseSpeed,
    maxBaseSpeed: LEVELS[0].maxSpeed,
    laneIndex: 1,
    targetLaneIndex: 1,
    laneX: [-4.35, 0, 4.35],
    nitro: 100,
    nitroHeld: false,
    boostFactor: 1,
    cameraShake: 0,
    nearMissChain: 0,
    roadPhase: 0,
    finishedCampaign: false,
    racePosition: 1,
    previousRacePosition: 1,
    overtakes: 0,
    rivalsTotal: 7,
    totalLaps: 3,
    currentLap: 1,
    lapDistance: 0,
    checkpointIndex: 0,
    checkpointCount: 4,
    nextCheckpointDistance: 0,
    passedCheckpoints: 0,
    passedFinishLines: 0,
    checkpointCombo: 0
  };

  const trafficCars = [];
  const rivalCars = [];
  const pickups = [];
  const hazards = [];
  const roadSegments = [];
  const roadsideLights = [];
  const mountains = [];
  const particles = [];
  const scenery = [];
  const speedLines = [];
  const signs = [];
  const courseGates = [];

  const root = new pc.Entity("root");
  app.root.addChild(root);

  const camera = new pc.Entity("camera");
  camera.addComponent("camera", {
    clearColor: LEVELS[0].sky.clone(),
    fov: 58,
    nearClip: 0.1,
    farClip: 600
  });
  root.addChild(camera);

  const sun = new pc.Entity("sun");
  sun.addComponent("light", {
    type: "directional",
    color: new pc.Color(1, 0.96, 0.9),
    intensity: 1.7,
    castShadows: false
  });
  sun.setLocalEulerAngles(45, 25, 0);
  root.addChild(sun);

  const neon = new pc.Entity("neonFill");
  neon.addComponent("light", {
    type: "omni",
    color: new pc.Color(0.2, 0.45, 1),
    intensity: 0.9,
    range: 48
  });
  neon.setLocalPosition(0, 9, 7);
  root.addChild(neon);

  // ---------- audio ----------
  const audio = {
    ctx: null,
    muted: false,
    master: null,
    musicGain: null,
    sfxGain: null,
    engineGain: null,
    engineOsc: null,
    music: null,
    currentLevel: -1,
    ensure() {
      if (this.muted) return false;
      try {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
          this.master = this.ctx.createGain();
          this.musicGain = this.ctx.createGain();
          this.sfxGain = this.ctx.createGain();
          this.engineGain = this.ctx.createGain();
          this.master.gain.value = 0.9;
          this.musicGain.gain.value = 0.12;
          this.sfxGain.gain.value = 0.8;
          this.engineGain.gain.value = 0;
          this.musicGain.connect(this.master);
          this.sfxGain.connect(this.master);
          this.engineGain.connect(this.master);
          this.master.connect(this.ctx.destination);
        }
        if (this.ctx.state === "suspended") this.ctx.resume?.();
        return true;
      } catch {
        this.muted = true;
        muteBtn.textContent = "×";
        return false;
      }
    },
    toggleMute() {
      this.muted = !this.muted;
      muteBtn.textContent = this.muted ? "×" : "♪";
      if (this.muted) {
        this.stopMusic();
        this.stopEngine();
      } else {
        this.ensure();
        if (state.mode === "running" || state.mode === "countdown") {
          this.startMusic(state.level);
          this.startEngine();
        }
      }
    },
    tone(freq=440, dur=0.08, type="sine", gain=0.035, dest=null, slideTo=null) {
      if (!this.ensure() || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), now + dur);
      amp.gain.setValueAtTime(Math.max(0.0001, gain), now);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(amp).connect(dest || this.sfxGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.03);
    },
    noise(dur=0.08, gain=0.04) {
      if (!this.ensure() || !this.ctx) return;
      const now = this.ctx.currentTime;
      const buffer = this.ctx.createBuffer(1, Math.max(1, Math.floor(this.ctx.sampleRate * dur)), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.6);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const amp = this.ctx.createGain();
      amp.gain.setValueAtTime(gain, now);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      src.connect(amp).connect(this.sfxGain || this.ctx.destination);
      src.start(now);
      src.stop(now + dur);
    },
    startMusic(levelIndex=0) {
      if (!this.ensure() || this.currentLevel === levelIndex) return;
      this.stopMusic();
      const spec = LEVELS[levelIndex] || LEVELS[0];
      const now = this.ctx.currentTime;
      const rootFreq = spec.musicRoot || 130.81;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1200 + levelIndex * 120;
      filter.Q.value = 0.8;

      const padGain = this.ctx.createGain();
      padGain.gain.value = 0.0001;
      padGain.gain.exponentialRampToValueAtTime(0.42, now + 0.9);
      filter.connect(padGain).connect(this.musicGain);

      const delay = this.ctx.createDelay(0.8);
      const fb = this.ctx.createGain();
      delay.delayTime.value = 0.26;
      fb.gain.value = 0.22;
      delay.connect(fb).connect(delay);
      delay.connect(this.musicGain);

      const nodes = [filter, padGain, delay, fb];
      [rootFreq, rootFreq * 1.5, rootFreq * 2, rootFreq * 2.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = i % 2 ? "triangle" : "sawtooth";
        osc.frequency.value = freq;
        osc.detune.value = (i - 1.5) * 5;
        g.gain.value = 0.045 / (i + 1);
        osc.connect(g).connect(filter);
        osc.start(now);
        nodes.push(osc, g);
      });

      let step = 0;
      const melody = [0,3,5,7,10,7,5,3,0,5,7,12,10,7,3,5];
      const bassPattern = [0,0,7,0,5,5,7,10];
      const timer = setInterval(() => {
        if (!this.ctx || !this.music || this.muted) return;
        const speedLift = Math.min(10, Math.floor((state.roadSpeed - 36) / 6));
        const note = rootFreq * Math.pow(2, (melody[step % melody.length] + speedLift * 0.35) / 12);
        const bass = rootFreq / 2 * Math.pow(2, bassPattern[step % bassPattern.length] / 12);
        this.tone(note, 0.14, "triangle", 0.012, delay);
        if (step % 2 === 0) this.tone(bass, 0.16, "sine", 0.016, this.musicGain);
        if (step % 4 === 3) this.tone(rootFreq * 4, 0.05, "square", 0.006, delay);
        step++;
      }, Math.max(210, 330 - levelIndex * 14));

      this.music = { nodes, timer, padGain };
      this.currentLevel = levelIndex;
    },
    stopMusic() {
      if (!this.music) return;
      const m = this.music;
      if (m.timer) clearInterval(m.timer);
      try {
        const now = this.ctx?.currentTime || 0;
        if (m.padGain && this.ctx) {
          m.padGain.gain.cancelScheduledValues(now);
          m.padGain.gain.setValueAtTime(Math.max(0.0001, m.padGain.gain.value || 0.0001), now);
          m.padGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        }
        setTimeout(() => {
          for (const n of m.nodes || []) {
            try { n.stop?.(); } catch {}
            try { n.disconnect?.(); } catch {}
          }
        }, 320);
      } catch {}
      this.music = null;
      this.currentLevel = -1;
    },
    startEngine() {
      if (!this.ensure() || this.engineOsc) return;
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 72;
      lfo.type = "sine";
      lfo.frequency.value = 9;
      lfoGain.gain.value = 9;
      lfo.connect(lfoGain).connect(osc.frequency);
      osc.connect(this.engineGain);
      osc.start();
      lfo.start();
      this.engineOsc = { osc, lfo };
    },
    stopEngine() {
      if (!this.engineOsc) return;
      try {
        this.engineOsc.osc.stop();
        this.engineOsc.lfo.stop();
        this.engineOsc.osc.disconnect();
        this.engineOsc.lfo.disconnect();
      } catch {}
      this.engineOsc = null;
      if (this.engineGain) this.engineGain.gain.value = 0;
    },
    updateEngine() {
      if (!this.ctx || !this.engineOsc || this.muted) return;
      const now = this.ctx.currentTime;
      const targetFreq = 55 + state.roadSpeed * 1.65;
      const targetGain = state.mode === "running" ? 0.026 + (state.boostFactor - 1) * 0.045 : 0.005;
      this.engineOsc.osc.frequency.setTargetAtTime(targetFreq, now, 0.045);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.06);
    },
    sfxLane() { this.tone(420, 0.055, "triangle", 0.025, this.sfxGain, 620); },
    sfxNitro() { this.tone(180, 0.12, "sawtooth", 0.035, this.sfxGain, 460); },
    sfxPickup() { this.tone(720, 0.07, "sine", 0.03); this.tone(1080, 0.09, "triangle", 0.02); },
    sfxNearMiss() { this.tone(980, 0.06, "square", 0.018, this.sfxGain, 1240); },
    sfxCrash() { this.noise(0.35, 0.09); this.tone(120, 0.22, "sawtooth", 0.055, this.sfxGain, 38); },
    sfxLevel() { this.tone(440, 0.1, "triangle", 0.03); setTimeout(() => this.tone(660, 0.12, "triangle", 0.03), 120); setTimeout(() => this.tone(880, 0.16, "triangle", 0.025), 260); },
    sfxHazard() { this.tone(220, 0.08, "square", 0.02, this.sfxGain, 140); }
  };
  muteBtn.addEventListener("click", () => audio.toggleMute());

  // ---------- real audio file layer ----------
  // These WAV files are included in assets/audio/. The procedural WebAudio layer
  // remains as fallback/detail, while these real files add stronger game feel.
  const REAL_AUDIO = {
    engine: new Audio("assets/audio/engine_loop.wav"),
    nitro: new Audio("assets/audio/nitro_loop.wav"),
    crash: new Audio("assets/audio/crash_hit.wav"),
    lane: new Audio("assets/audio/lane_whoosh.wav"),
    pickup: new Audio("assets/audio/pickup_chime.wav"),
    level: new Audio("assets/audio/level_complete.wav")
  };

  REAL_AUDIO.engine.loop = true;
  REAL_AUDIO.nitro.loop = true;
  REAL_AUDIO.engine.volume = 0.22;
  REAL_AUDIO.nitro.volume = 0.0;
  REAL_AUDIO.crash.volume = 0.8;
  REAL_AUDIO.lane.volume = 0.42;
  REAL_AUDIO.pickup.volume = 0.5;
  REAL_AUDIO.level.volume = 0.58;

  function safePlayAudio(a, restart = false) {
    if (!a || audio.muted) return;
    try {
      if (restart) a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch {}
  }

  function safePauseAudio(a) {
    try { a?.pause?.(); } catch {}
  }

  function setRealAudioMuted(muted) {
    Object.values(REAL_AUDIO).forEach((a) => {
      try { a.muted = muted; } catch {}
    });
    if (muted) {
      safePauseAudio(REAL_AUDIO.engine);
      safePauseAudio(REAL_AUDIO.nitro);
    }
  }

  const originalToggleMute = audio.toggleMute.bind(audio);
  audio.toggleMute = function () {
    originalToggleMute();
    setRealAudioMuted(this.muted);
  };

  const originalStartEngine = audio.startEngine.bind(audio);
  audio.startEngine = function () {
    originalStartEngine();
    safePlayAudio(REAL_AUDIO.engine);
  };

  const originalStopEngine = audio.stopEngine.bind(audio);
  audio.stopEngine = function () {
    originalStopEngine();
    safePauseAudio(REAL_AUDIO.engine);
    safePauseAudio(REAL_AUDIO.nitro);
  };

  const originalUpdateEngine = audio.updateEngine.bind(audio);
  audio.updateEngine = function () {
    originalUpdateEngine();
    if (audio.muted) return;
    try {
      REAL_AUDIO.engine.volume = state.mode === "running" ? 0.17 + Math.min(0.12, state.roadSpeed / 850) : 0.05;
      REAL_AUDIO.engine.playbackRate = Math.max(0.75, Math.min(1.8, state.roadSpeed / 58));
      if (state.mode === "running" && REAL_AUDIO.engine.paused) safePlayAudio(REAL_AUDIO.engine);

      if (state.mode === "running" && state.nitroHeld && state.nitro > 0) {
        REAL_AUDIO.nitro.volume = Math.min(0.62, REAL_AUDIO.nitro.volume + 0.08);
        REAL_AUDIO.nitro.playbackRate = 1.0 + Math.min(0.45, state.roadSpeed / 250);
        if (REAL_AUDIO.nitro.paused) safePlayAudio(REAL_AUDIO.nitro);
      } else {
        REAL_AUDIO.nitro.volume = Math.max(0, REAL_AUDIO.nitro.volume - 0.08);
        if (REAL_AUDIO.nitro.volume <= 0.02) safePauseAudio(REAL_AUDIO.nitro);
      }
    } catch {}
  };

  const originalLaneSfx = audio.sfxLane.bind(audio);
  audio.sfxLane = function () { safePlayAudio(REAL_AUDIO.lane, true); originalLaneSfx(); };

  const originalPickupSfx = audio.sfxPickup.bind(audio);
  audio.sfxPickup = function () { safePlayAudio(REAL_AUDIO.pickup, true); originalPickupSfx(); };

  const originalCrashSfx = audio.sfxCrash.bind(audio);
  audio.sfxCrash = function () { safePlayAudio(REAL_AUDIO.crash, true); originalCrashSfx(); };

  const originalLevelSfx = audio.sfxLevel.bind(audio);
  audio.sfxLevel = function () { safePlayAudio(REAL_AUDIO.level, true); originalLevelSfx(); };


  // ---------- textures/materials ----------
  function createTexture(width, height, painter) {
    const cvs = document.createElement("canvas");
    cvs.width = width;
    cvs.height = height;
    const ctx = cvs.getContext("2d");
    painter(ctx, width, height);
    const tex = new pc.Texture(app.graphicsDevice, {
      width,
      height,
      format: pc.PIXELFORMAT_R8_G8_B8_A8,
      autoMipmap: true
    });
    tex.minFilter = pc.FILTER_LINEAR_MIPMAP_LINEAR;
    tex.magFilter = pc.FILTER_LINEAR;
    tex.addressU = pc.ADDRESS_REPEAT;
    tex.addressV = pc.ADDRESS_REPEAT;
    tex.setSource(cvs);
    return tex;
  }

  const TEX = {
    asphalt: createTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = "#272b31";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2200; i++) {
        const x = Math.random() * w, y = Math.random() * h, a = 0.05 + Math.random() * 0.18;
        const g = 40 + Math.random() * 55;
        ctx.fillStyle = `rgba(${g},${g},${g},${a})`;
        ctx.fillRect(x, y, 2 + Math.random() * 2, 2 + Math.random() * 2);
      }
      for (let i = 0; i < 70; i++) {
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.beginPath();
        ctx.moveTo(Math.random() * w, Math.random() * h);
        ctx.lineTo(Math.random() * w, Math.random() * h);
        ctx.stroke();
      }
    }),
    lane: createTexture(64, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fillRect(w * 0.36, 0, w * 0.28, h * 0.42);
      ctx.fillRect(w * 0.36, h * 0.58, w * 0.28, h * 0.42);
    }),
    metal: createTexture(128, 128, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#8891a6");
      g.addColorStop(0.5, "#535d72");
      g.addColorStop(1, "#a7afc0");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < h; i += 16) {
        ctx.beginPath();
        ctx.moveTo(0, i + 0.5);
        ctx.lineTo(w, i + 0.5);
        ctx.stroke();
      }
    }),
    glass: createTexture(128, 128, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#11243f");
      g.addColorStop(0.4, "#1c5fbd");
      g.addColorStop(1, "#79c8ff");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(0, 0, w * 0.26, h);
    }),
    bark: createTexture(128, 256, (ctx, w, h) => {
      ctx.fillStyle = "#6a4527";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 80; i++) {
        ctx.strokeStyle = `rgba(40,20,8,${0.2 + Math.random() * 0.2})`;
        ctx.beginPath();
        const x = Math.random() * w;
        ctx.moveTo(x, 0);
        ctx.lineTo(x + Math.random() * 8 - 4, h);
        ctx.stroke();
      }
    }),
    leaves: createTexture(128, 128, (ctx, w, h) => {
      ctx.fillStyle = "#39b85d";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 120; i++) {
        ctx.fillStyle = `rgba(${20 + Math.random()*40},${120 + Math.random()*110},${40 + Math.random()*60},0.18)`;
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }),
    sand: createTexture(128, 128, (ctx, w, h) => {
      ctx.fillStyle = "#c98f43";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 700; i++) {
        const c = 180 + Math.random() * 50;
        ctx.fillStyle = `rgba(${c},${c-40},${60},${0.15 + Math.random() * 0.18})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
    }),
    rock: createTexture(128, 128, (ctx, w, h) => {
      ctx.fillStyle = "#6b6258";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 180; i++) {
        const c = 90 + Math.random() * 80;
        ctx.fillStyle = `rgba(${c},${c},${c},${0.12 + Math.random() * 0.24})`;
        ctx.fillRect(Math.random() * w, Math.random() * h, 6, 6);
      }
    }),
    panel: createTexture(256, 256, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#0b1022");
      g.addColorStop(1, "#1b1a48");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let y = 12; y < h; y += 24) {
        for (let x = 12; x < w; x += 24) {
          const hue = ["#3be1ff", "#6d4dff", "#ff55d0"][Math.floor(Math.random() * 3)];
          ctx.fillStyle = hue;
          ctx.globalAlpha = 0.35 + Math.random() * 0.25;
          ctx.fillRect(x, y, 12 + Math.random() * 6, 10 + Math.random() * 6);
        }
      }
      ctx.globalAlpha = 1;
    }),
    glow: createTexture(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w/2, h/2, 4, w/2, h/2, w/2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.18, "rgba(100,225,255,0.9)");
      g.addColorStop(0.5, "rgba(60,160,255,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }),
    leafPalm: createTexture(128, 128, (ctx, w, h) => {
      ctx.clearRect(0,0,w,h);
      ctx.strokeStyle = "#2fdc78";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(w*0.1, h*0.8);
      ctx.quadraticCurveTo(w*0.35, h*0.4, w*0.9, h*0.1);
      ctx.stroke();
      ctx.lineWidth = 3;
      for (let i = 0; i < 7; i++) {
        const t = i / 6;
        const x = w*0.18 + t*w*0.62;
        const y = h*0.72 - t*h*0.52;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 18, y - 8);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 14, y + 6);
        ctx.stroke();
      }
    })
  };

  function makeMaterial(opts = {}) {
    const m = new pc.StandardMaterial();
    if (opts.diffuse) m.diffuse = opts.diffuse.clone ? opts.diffuse.clone() : opts.diffuse;
    if (opts.emissive) {
      m.emissive = opts.emissive.clone ? opts.emissive.clone() : opts.emissive;
      m.emissiveIntensity = opts.emissiveIntensity ?? 1;
    }
    if (opts.diffuseMap) m.diffuseMap = opts.diffuseMap;
    if (opts.emissiveMap) m.emissiveMap = opts.emissiveMap;
    if (opts.opacityMap) m.opacityMap = opts.opacityMap;
    if (opts.opacity !== undefined) m.opacity = opts.opacity;
    if (opts.blendType !== undefined) m.blendType = opts.blendType;
    if (opts.cull !== undefined) m.cull = opts.cull;
    if (opts.useLighting === false) m.useLighting = false;
    if (opts.depthWrite === false) m.depthWrite = false;
    if (opts.tiling) {
      m.diffuseMapTiling = opts.tiling.clone ? opts.tiling.clone() : opts.tiling;
      m.emissiveMapTiling = opts.tiling.clone ? opts.tiling.clone() : opts.tiling;
      m.opacityMapTiling = opts.tiling.clone ? opts.tiling.clone() : opts.tiling;
    }
    m.metalness = opts.metalness ?? 0.25;
    m.shininess = opts.shininess ?? 70;
    m.update();
    return m;
  }

  const mat = {
    road: makeMaterial({ diffuse: LEVELS[0].road, diffuseMap: TEX.asphalt, tiling: new pc.Vec2(1, 8), shininess: 25 }),
    shoulder: makeMaterial({ diffuse: LEVELS[0].shoulder, diffuseMap: TEX.sand, tiling: new pc.Vec2(2, 8), shininess: 18 }),
    lane: makeMaterial({ diffuse: new pc.Color(1,1,1), diffuseMap: TEX.lane, emissive:new pc.Color(0.2,0.3,0.45), emissiveMap:TEX.lane, emissiveIntensity:0.35, tiling:new pc.Vec2(1, 8), shininess: 5 }),
    player: makeMaterial({ diffuse:new pc.Color(1,0.1,0.08), diffuseMap:TEX.metal, emissive:new pc.Color(0.36,0.04,0.04), emissiveIntensity:0.5 }),
    playerTrim: makeMaterial({ diffuse:new pc.Color(0.05,0.08,0.1), diffuseMap:TEX.metal, emissive:new pc.Color(0.08,0.42,1), emissiveIntensity:0.6 }),
    windshield: makeMaterial({ diffuse:new pc.Color(0.04,0.08,0.12), diffuseMap:TEX.glass, emissive:new pc.Color(0.12,0.48,1), emissiveIntensity:1.0, shininess: 85 }),
    wheel: makeMaterial({ diffuse:new pc.Color(0.05,0.05,0.06), diffuseMap:TEX.rock, shininess: 10 }),
    blue: makeMaterial({ diffuse:new pc.Color(0.18,0.45,1), diffuseMap:TEX.metal }),
    green: makeMaterial({ diffuse:new pc.Color(0.1,0.9,0.35), diffuseMap:TEX.metal }),
    yellow: makeMaterial({ diffuse:new pc.Color(1,0.83,0.12), diffuseMap:TEX.metal }),
    purple: makeMaterial({ diffuse:new pc.Color(0.63,0.25,1), diffuseMap:TEX.metal }),
    orange: makeMaterial({ diffuse:new pc.Color(1,0.46,0.12), diffuseMap:TEX.metal }),
    building: makeMaterial({ diffuse:new pc.Color(0.1,0.12,0.2), diffuseMap:TEX.panel, emissive:new pc.Color(0.1,0.14,0.3), emissiveMap:TEX.panel, emissiveIntensity:0.8, shininess: 40 }),
    bark: makeMaterial({ diffuse:new pc.Color(0.46,0.3,0.17), diffuseMap:TEX.bark, shininess: 8 }),
    leaves: makeMaterial({ diffuse:new pc.Color(0.18,0.65,0.22), diffuseMap:TEX.leaves, shininess: 8 }),
    nitro: makeMaterial({ diffuse:new pc.Color(0.08,0.9,1), emissive:new pc.Color(0.08,1,1), emissiveMap:TEX.glow, opacityMap:TEX.glow, opacity:0.92, blendType: pc.BLEND_ADDITIVE, cull: pc.CULLFACE_NONE, depthWrite:false, useLighting:false, shininess:1 }),
    danger: makeMaterial({ diffuse:new pc.Color(1,0.1,0.12), diffuseMap:TEX.panel, emissive:new pc.Color(1,0.08,0.05), emissiveIntensity:1.0 }),
    coin: makeMaterial({ diffuse:new pc.Color(0.15,0.8,1), diffuseMap:TEX.glow, emissive:new pc.Color(0.2,0.9,1), emissiveIntensity:1.5 }),
    mountainA: makeMaterial({ diffuse:LEVELS[0].terrainA, diffuseMap:TEX.rock, tiling:new pc.Vec2(2,2), shininess: 12 }),
    mountainB: makeMaterial({ diffuse:LEVELS[0].terrainB, diffuseMap:TEX.rock, tiling:new pc.Vec2(2,2), shininess: 12 }),
    sign: makeMaterial({ diffuse:new pc.Color(0.22,0.22,0.26), diffuseMap:TEX.panel, emissive:new pc.Color(0.18,0.6,0.9), emissiveIntensity:0.6 }),
    palmLeaf: makeMaterial({ diffuse:new pc.Color(0.2,0.8,0.35), diffuseMap:TEX.leafPalm, opacityMap:TEX.leafPalm, opacity:0.98, cull: pc.CULLFACE_NONE, depthWrite:true, useLighting:true, shininess: 5 })
  };
  const trafficMats = [mat.yellow, mat.blue, mat.green, mat.purple, mat.orange];

  // ---------- imported GLB car models ----------
  // These are real local GLB files inside assets/models/. The game still keeps
  // the old procedural car meshes as a fallback while the GLB files load.
  const MODEL_URLS = {
    player: "assets/models/vehicle_mclaren_senna.glb",
    playerVariants: [
      "assets/models/vehicle_mclaren_senna.glb",
      "assets/models/vehicle_challenger.glb",
      "assets/models/vehicle_porsche_911_gt2.glb",
      "assets/models/vehicle_audi_r8.glb"
    ],
    traffic: [
      "assets/models/vehicle_mclaren_senna.glb",
      "assets/models/vehicle_challenger.glb",
      "assets/models/vehicle_porsche_911_gt2.glb",
      "assets/models/vehicle_audi_r8.glb"
    ]
  };
  const BUILDING_MODEL_URLS = [
    "assets/models/roadside_bauhaus.glb",
    "assets/models/roadside_urban_block.glb",
    "assets/models/roadside_bamboo_house.glb"
  ];

  const importedSceneryModels = {
    buildings: []
  };


  const importedModels = {
    player: null,
    playerVariants: [],
    traffic: []
  };

  const modelCars = {
    player: [],
    traffic: []
  };

  function instantiateGlb(asset) {
    if (!asset || !asset.resource) return null;
    try {
      if (asset.resource.instantiateRenderEntity) return asset.resource.instantiateRenderEntity();
      if (asset.resource.instantiateModelEntity) return asset.resource.instantiateModelEntity();
    } catch (err) {
      console.warn("GLB instantiate failed", err);
    }
    return null;
  }

  function applyImportedCarModel(car) {
    if (!car || car.importedModel) return false;
    const asset = car.modelType === "player"
      ? (car.modelIndex >= 0 ? importedModels.playerVariants[car.modelIndex] : importedModels.player)
      : importedModels.traffic[car.modelIndex % importedModels.traffic.length];

    const model = instantiateGlb(asset);
    if (!model) return false;

    model.name = car.modelType === "player" ? "importedPlayerCarGLB" : "importedTrafficCarGLB";
    car.addChild(model);
    model.setLocalPosition(0, 0, 0);
    model.setLocalEulerAngles(0, 0, 0);
    model.setLocalScale(1, 1, 1);

    model.forEach((node) => {
      if (!node.render || !node.render.meshInstances) return;
      node.render.meshInstances.forEach((mi) => {
        if (!mi.material) return;
        mi.material.cull = pc.CULLFACE_NONE;
        mi.material.depthWrite = true;
        mi.material.update();
      });
    });

    car.importedModel = model;
    if (car.fallbackMesh) car.fallbackMesh.enabled = false;
    return true;
  }

  function registerCarForModel(car, type, modelIndex = 0) {
    car.modelType = type;
    car.modelIndex = modelIndex;
    car.importedModel = null;
    modelCars[type].push(car);
    applyImportedCarModel(car);
  }

  function loadGlbCarModels() {
    const load = (url, onDone) => {
      try {
        app.assets.loadFromUrl(url, "container", (err, asset) => {
          if (err) {
            console.warn("Could not load GLB model:", url, err);
            return;
          }
          onDone(asset);
        });
      } catch (err) {
        console.warn("GLB model request failed:", url, err);
      }
    };

    load(MODEL_URLS.player, (asset) => {
      importedModels.player = asset;
      importedModels.playerVariants[0] = asset;
      modelCars.player.forEach(applyImportedCarModel);
    });

    MODEL_URLS.playerVariants.forEach((url, i) => {
      if (i === 0) return;
      load(url, (asset) => {
        importedModels.playerVariants[i] = asset;
        modelCars.player.forEach(applyImportedCarModel);
      });
    });

    MODEL_URLS.traffic.forEach((url, i) => {
      load(url, (asset) => {
        importedModels.traffic[i] = asset;
        modelCars.traffic.forEach(applyImportedCarModel);
      });
    });
  }


  function applyLevelTheme(levelIndex) {
    const spec = LEVELS[levelIndex] || LEVELS[0];
    app.scene.fog = pc.FOG_LINEAR;
    app.scene.fogColor = spec.fog.clone();
    app.scene.fogStart = 58;
    app.scene.fogEnd = 230;
    camera.camera.clearColor = spec.sky.clone();
    neon.light.color = spec.env === "metro" || spec.env === "final" ? new pc.Color(0.42,0.2,1) : new pc.Color(0.2,0.45,1);

    mat.road.diffuse = spec.road.clone();
    mat.road.update();
    mat.shoulder.diffuse = spec.shoulder.clone();
    mat.shoulder.diffuseMap = spec.env === "desert" ? TEX.sand : (spec.env === "metro" || spec.env === "final" ? TEX.panel : TEX.leaves);
    mat.shoulder.update();
    mat.mountainA.diffuse = spec.terrainA.clone();
    mat.mountainA.update();
    mat.mountainB.diffuse = spec.terrainB.clone();
    mat.mountainB.update();

    rebuildScenery(spec.env);
    audio.startMusic(levelIndex);
  }


  // ---------- PNG sprite billboards/effects ----------
  const SPRITE_URLS = {
    glow: "assets/sprites/effect_glow_cyan.png",
    nitro: "assets/sprites/effect_nitro_flame.png",
    speed: "assets/sprites/effect_speed_line.png",
    pickup: "assets/sprites/effect_pickup_ring.png",
    signRace: "assets/sprites/billboard_race.png",
    signNitro: "assets/sprites/billboard_nitro.png",
    signBoost: "assets/sprites/billboard_boost.png",
    driverPlayer0: "assets/sprites/driver_player_0.png",
    driverPlayer1: "assets/sprites/driver_player_1.png",
    driverPlayer2: "assets/sprites/driver_player_2.png",
    driverPlayer3: "assets/sprites/driver_player_3.png",
    driverTraffic0: "assets/sprites/driver_traffic_0.png",
    driverTraffic1: "assets/sprites/driver_traffic_1.png",
    driverTraffic2: "assets/sprites/driver_traffic_2.png",
    driverTraffic3: "assets/sprites/driver_traffic_3.png"
  };

  const spriteTextures = {};
  const spriteMaterialCache = {};
  const spriteTargets = [];

  function createSpriteMaterial(texture, additive = false) {
    const m = new pc.StandardMaterial();
    m.diffuse = new pc.Color(1, 1, 1);
    m.emissive = new pc.Color(1, 1, 1);
    m.emissiveIntensity = additive ? 1.8 : 0.45;
    m.useLighting = false;
    m.cull = pc.CULLFACE_NONE;
    m.depthWrite = !additive;
    m.opacity = 1;
    m.blendType = additive ? pc.BLEND_ADDITIVE : pc.BLEND_NORMAL;
    m.diffuseMap = texture;
    m.emissiveMap = texture;
    m.opacityMap = texture;
    m.update();
    return m;
  }

  function getSpriteMaterial(key, additive = false) {
    const cacheKey = `${key}|${additive ? "a" : "n"}`;
    if (!spriteTextures[key]) return null;
    if (!spriteMaterialCache[cacheKey]) {
      spriteMaterialCache[cacheKey] = createSpriteMaterial(spriteTextures[key], additive);
    }
    return spriteMaterialCache[cacheKey];
  }

  function applySpriteTarget(entity) {
    if (!entity || !entity.render || !entity.spriteKey) return;
    const m = getSpriteMaterial(entity.spriteKey, !!entity.spriteAdditive);
    if (m) entity.render.material = m;
  }

  function registerSpriteTarget(entity, key, additive = false) {
    if (!entity) return entity;
    entity.spriteKey = key;
    entity.spriteAdditive = additive;
    spriteTargets.push(entity);
    applySpriteTarget(entity);
    return entity;
  }

  function loadSpriteAssets() {
    Object.entries(SPRITE_URLS).forEach(([key, url]) => {
      try {
        app.assets.loadFromUrl(url, "texture", (err, asset) => {
          if (err) {
            console.warn("Could not load sprite texture:", url, err);
            return;
          }
          spriteTextures[key] = asset.resource || asset;
          spriteTargets.forEach((entity) => {
            if (entity.spriteKey === key) applySpriteTarget(entity);
          });
        });
      } catch (err) {
        console.warn("Sprite request failed:", url, err);
      }
    });
  }





  function loadRoadsideBuildingModels() {
    const load = (url, onDone) => {
      try {
        app.assets.loadFromUrl(url, "container", (err, asset) => {
          if (err) {
            console.warn("Could not load roadside building GLB:", url, err);
            return;
          }
          onDone(asset);
        });
      } catch (err) {
        console.warn("Roadside building GLB request failed:", url, err);
      }
    };

    BUILDING_MODEL_URLS.forEach((url, index) => {
      load(url, (asset) => {
        importedSceneryModels.buildings[index] = asset;
        console.log("Roadside building GLB loaded:", url);
        refreshRoadsideBuildings();

        // If scenery already exists, rebuild it once so the current level
        // immediately uses the real building models instead of waiting for
        // the next level/theme change.
        const spec = LEVELS[state.level] || LEVELS[0];
        if (scenery.length) {
          rebuildScenery(spec.env);
        }
      });
    });
  }


  // ---------- continuous GLB road track ----------
  // Real road model generated as: assets/models/continuous_road_track.glb
  // It contains a long road mesh with lane markings, shoulders, rails,
  // corner chevrons, bends and crests. The old procedural road remains as
  // fallback until this GLB finishes loading.
  const CONTINUOUS_ROAD = {
    url: "assets/models/uploaded_road_track.glb",
    asset: null,
    instances: [],
    length: 492.800,
    loaded: false,
    instanceCount: 4,
    startZ: 8
  };

  function continuousRoadCenterX(s) {
    return 0;
  }

  function continuousRoadCrestY(s) {
    return 0;
  }

  function continuousRoadYaw(s) {
    return 0;
  }

  function roadTrackSAt(z = 0) {
    // Prefer the currently visible GLB segment so objects match the model.
    for (const inst of CONTINUOUS_ROAD.instances) {
      if (!inst || !inst.enabled) continue;
      const segZ = inst.getLocalPosition().z;
      const s = segZ - z;
      if (s >= -2 && s <= CONTINUOUS_ROAD.length + 2) {
        return Math.max(0, Math.min(CONTINUOUS_ROAD.length, s));
      }
    }

    // Fallback before the GLB loads.
    return ((state.distance + (CONTINUOUS_ROAD.startZ - z)) % CONTINUOUS_ROAD.length + CONTINUOUS_ROAD.length) % CONTINUOUS_ROAD.length;
  }

  function instantiateContinuousRoadSegment(index) {
    if (!CONTINUOUS_ROAD.asset || !CONTINUOUS_ROAD.asset.resource) return null;
    let e = null;
    try {
      if (CONTINUOUS_ROAD.asset.resource.instantiateRenderEntity) {
        e = CONTINUOUS_ROAD.asset.resource.instantiateRenderEntity();
      } else if (CONTINUOUS_ROAD.asset.resource.instantiateModelEntity) {
        e = CONTINUOUS_ROAD.asset.resource.instantiateModelEntity();
      }
    } catch (err) {
      console.warn("continuous road instantiate failed", err);
    }
    if (!e) return null;

    e.name = `continuousRoadTrack_${index}`;
    root.addChild(e);
    e.setLocalScale(1, 1, 1);
    e.setLocalPosition(0, 0.02, CONTINUOUS_ROAD.startZ - index * CONTINUOUS_ROAD.length);
    e.setLocalEulerAngles(0, 0, 0);

    // Make imported road materials visible from above and below.
    e.forEach((node) => {
      if (!node.render || !node.render.meshInstances) return;
      node.render.meshInstances.forEach((mi) => {
        if (!mi.material) return;
        mi.material.cull = pc.CULLFACE_NONE;
        mi.material.depthWrite = true;
        mi.material.useLighting = true;
        mi.material.update();
      });
    });

    return e;
  }

  function loadContinuousRoadTrack() {
    try {
      app.assets.loadFromUrl(CONTINUOUS_ROAD.url, "container", (err, asset) => {
        if (err) {
          console.warn("Could not load continuous road GLB:", CONTINUOUS_ROAD.url, err);
          roadSegments.forEach((seg) => (seg.enabled = true));
          floor.enabled = true;
          toast("Road GLB failed - using fallback road");
          return;
        }

        CONTINUOUS_ROAD.asset = asset;
        CONTINUOUS_ROAD.instances = Array.from(
          { length: CONTINUOUS_ROAD.instanceCount },
          (_, i) => instantiateContinuousRoadSegment(i)
        ).filter(Boolean);

        if (CONTINUOUS_ROAD.instances.length) {
          CONTINUOUS_ROAD.loaded = true;

          // Keep the procedural road available as a safety fallback for one moment.
          // The imported GLB road is positioned slightly above it and should be visible.
          roadSegments.forEach((seg) => (seg.enabled = true));
          floor.enabled = false;

          setTimeout(() => {
            if (CONTINUOUS_ROAD.loaded && CONTINUOUS_ROAD.instances.some((seg) => seg && seg.enabled)) {
              roadSegments.forEach((seg) => (seg.enabled = false));
            }
          }, 1400);

          console.log("Uploaded road model loaded:", CONTINUOUS_ROAD.url, CONTINUOUS_ROAD.instances.length, "segments");
          toast("Uploaded road fixed: lights moved to roadside");
        }
      });
    } catch (err) {
      console.warn("continuous road request failed", err);
    }
  }

  function updateContinuousRoadTrack(dt) {
    if (!CONTINUOUS_ROAD.loaded || !CONTINUOUS_ROAD.instances.length) return;

    const recycleDistance = CONTINUOUS_ROAD.length * CONTINUOUS_ROAD.instances.length;

    CONTINUOUS_ROAD.instances.forEach((seg) => {
      const p = seg.getLocalPosition();
      p.z += state.roadSpeed * dt;
      if (p.z > CONTINUOUS_ROAD.startZ + CONTINUOUS_ROAD.length) {
        p.z -= recycleDistance;
      }
      seg.setLocalPosition(p);
    });
  }


  // ---------- entity builders ----------
  function makeBox(parent, name, scale, pos, material) {
    const e = new pc.Entity(name || "box");
    e.addComponent("render", { type: "box", material });
    e.setLocalScale(scale.x, scale.y, scale.z);
    e.setLocalPosition(pos.x, pos.y, pos.z);
    parent.addChild(e);
    return e;
  }

  function makeCylinder(parent, name, scale, pos, material) {
    const e = new pc.Entity(name || "cylinder");
    e.addComponent("render", { type: "cylinder", material });
    e.setLocalScale(scale.x, scale.y, scale.z);
    e.setLocalPosition(pos.x, pos.y, pos.z);
    parent.addChild(e);
    return e;
  }

  function makeSphere(parent, name, scale, pos, material) {
    const e = new pc.Entity(name || "sphere");
    e.addComponent("render", { type: "sphere", material });
    e.setLocalScale(scale.x, scale.y, scale.z);
    e.setLocalPosition(pos.x, pos.y, pos.z);
    parent.addChild(e);
    return e;
  }

  function makeCone(parent, name, scale, pos, material) {
    const e = new pc.Entity(name || "cone");
    e.addComponent("render", { type: "cone", material });
    e.setLocalScale(scale.x, scale.y, scale.z);
    e.setLocalPosition(pos.x, pos.y, pos.z);
    parent.addChild(e);
    return e;
  }

  function makePlane(parent, name, scale, pos, material) {
    const e = new pc.Entity(name || "plane");
    e.addComponent("render", { type: "plane", material });
    e.setLocalScale(scale.x, scale.y, scale.z);
    e.setLocalPosition(pos.x, pos.y, pos.z);
    parent.addChild(e);
    return e;
  }

  function roadCenterAt(z) {
    return continuousRoadCenterX(roadTrackSAt(z));
  }

  function trackSampleProgress(z = 0) {
    return roadTrackSAt(z);
  }

  function trackCurveAt(z = 0) {
    return continuousRoadYaw(trackSampleProgress(z));
  }

  function trackBankAt(z = 0) {
    return -trackCurveAt(z) * 0.32;
  }

  function trackCrestAt(z = 0) {
    return continuousRoadCrestY(trackSampleProgress(z));
  }

  function laneWorldX(lane, z) {
    return roadCenterAt(z) + state.laneX[lane];
  }

  const floor = makeBox(root, "floor", new pc.Vec3(240, 0.2, 540), new pc.Vec3(0, -0.55, -100), makeMaterial({ diffuse:new pc.Color(0.05,0.08,0.08) }));

  
  function tuneImportedSceneryMaterials(model) {
    if (!model || !model.forEach) return;
    model.forEach((node) => {
      if (!node.render || !node.render.meshInstances) return;
      node.render.meshInstances.forEach((mi) => {
        if (!mi.material) return;
        mi.material.cull = pc.CULLFACE_NONE;
        mi.material.depthWrite = true;
        mi.material.useLighting = true;
        mi.material.update();
      });
    });
  }

  function buildPremiumBuildingFallback() {
    // Visible, detailed fallback while GLBs are loading.
    // It is marked as sceneryKind="building" so refreshRoadsideBuildings()
    // can replace it once the imported GLBs are ready.
    const e = new pc.Entity("roadsideBuildingFallback");
    root.addChild(e);

    const floors = 4 + Math.floor(Math.random() * 5);
    const width = 3.8 + Math.random() * 2.4;
    const depth = 2.8 + Math.random() * 2.0;
    const height = floors * 1.45;

    makeBox(e, "mainTower", new pc.Vec3(width, height, depth), new pc.Vec3(0, height * 0.5, 0), mat.building);
    makeBox(e, "roofTrim", new pc.Vec3(width + 0.35, 0.18, depth + 0.35), new pc.Vec3(0, height + 0.12, 0), mat.sign);
    makeBox(e, "sideTrimL", new pc.Vec3(0.16, height * 0.92, depth + 0.14), new pc.Vec3(-width * 0.52, height * 0.5, 0), mat.sign);
    makeBox(e, "sideTrimR", new pc.Vec3(0.16, height * 0.92, depth + 0.14), new pc.Vec3(width * 0.52, height * 0.5, 0), mat.sign);

    for (let row = 0; row < floors; row++) {
      const y = 0.95 + row * 1.35;
      for (let col = -1; col <= 1; col++) {
        const x = col * (width * 0.24);
        const w = makePlane(e, `frontWindow_${row}_${col}`, new pc.Vec3(0.62, 0.52, 1), new pc.Vec3(x, y, depth * 0.51 + 0.03), mat.nitro);
        w.setLocalEulerAngles(0, 0, 0);
        registerSpriteTarget(w, "glow", true);
      }
    }

    const signFace = makePlane(e, "buildingNeonSign", new pc.Vec3(width * 0.74, 0.7, 1), new pc.Vec3(0, height * 0.42, depth * 0.53), mat.sign);
    signFace.setLocalEulerAngles(0, 0, 0);
    registerSpriteTarget(signFace, "signRace", false);

    e.sceneryKind = "building";
    e.hasImportedBuilding = false;
    e.anim = "none";
    e.turnToRoad = true;
    e.roadsideMinOffset = 11.5;
    e.roadsideOffsetRange = 10.5;
    e.buildingBaseScale = 1.15;
    return addSceneryProp(e);
  }

  function attachImportedRoadsideBuilding(entity, assetIndex = -1) {
    if (!entity) return false;

    const loaded = importedSceneryModels.buildings.filter(Boolean);
    if (!loaded.length) return false;

    const index = assetIndex >= 0
      ? assetIndex
      : Math.floor(Math.random() * loaded.length);
    const asset = loaded[index % loaded.length];
    const model = instantiateGlb(asset);
    if (!model) return false;

    // Remove old fallback children before attaching the real model.
    const children = entity.children ? [...entity.children] : [];
    children.forEach((c) => c.destroy());

    entity.buildingModelIndex = index;
    entity.hasImportedBuilding = true;
    entity.sceneryKind = "building";
    entity.anim = "none";
    entity.turnToRoad = true;
    entity.roadsideMinOffset = 11.5;
    entity.roadsideOffsetRange = 10.5;
    entity.buildingBaseScale = index === 2 ? 1.45 : (index === 0 ? 1.35 : 1.2);

    entity.addChild(model);
    model.setLocalPosition(0, 0, 0);
    model.setLocalEulerAngles(0, 0, 0);
    model.setLocalScale(1, 1, 1);
    tuneImportedSceneryMaterials(model);
    return true;
  }

  function buildBuilding() {
    const e = new pc.Entity("roadsideBuilding");
    root.addChild(e);
    e.sceneryKind = "building";
    if (!attachImportedRoadsideBuilding(e)) {
      e.destroy();
      return buildPremiumBuildingFallback();
    }
    return addSceneryProp(e);
  }

  function refreshRoadsideBuildings() {
    if (!importedSceneryModels.buildings.filter(Boolean).length) return;

    let converted = 0;
    scenery.forEach((obj) => {
      if (obj.sceneryKind !== "building" || obj.hasImportedBuilding) return;
      if (attachImportedRoadsideBuilding(obj)) {
        converted += 1;
        const scale = (obj.baseScale || 1) * (obj.buildingBaseScale || 1);
        obj.setLocalScale(scale, scale, scale);
        if (obj.side) obj.setLocalEulerAngles(0, obj.side > 0 ? -90 : 90, 0);
      }
    });

    if (converted) console.log("Roadside buildings upgraded to GLB:", converted);
  }

  function buildPlayerCar() {
    const car = new pc.Entity("playerCar");
    root.addChild(car);

    const fallback = new pc.Entity("playerFallbackMesh");
    car.addChild(fallback);
    car.fallbackMesh = fallback;

    makeBox(fallback, "body", new pc.Vec3(2.55,0.52,4.85), new pc.Vec3(0,0.72,0), mat.player);
    makeBox(fallback, "cabin", new pc.Vec3(1.75,0.55,2.05), new pc.Vec3(0,1.14,-0.25), mat.player);
    makeBox(fallback, "windshield", new pc.Vec3(1.45,0.3,1.05), new pc.Vec3(0,1.31,-0.35), mat.windshield);
    makeBox(fallback, "nose", new pc.Vec3(1.45,0.18,0.7), new pc.Vec3(0,0.98,-2.2), mat.playerTrim);
    makeBox(fallback, "spoiler", new pc.Vec3(2.05,0.1,0.28), new pc.Vec3(0,1.33,2.15), mat.playerTrim);
    makeBox(fallback, "spoilerL", new pc.Vec3(0.12,0.34,0.1), new pc.Vec3(-0.72,1.12,2.08), mat.playerTrim);
    makeBox(fallback, "spoilerR", new pc.Vec3(0.12,0.34,0.1), new pc.Vec3(0.72,1.12,2.08), mat.playerTrim);
    const playerGlowL = makePlane(fallback, "headGlowL", new pc.Vec3(0.5,0.5,0.5), new pc.Vec3(-0.58,0.85,-2.35), mat.nitro); playerGlowL.setLocalEulerAngles(-90, 0, 0); registerSpriteTarget(playerGlowL, "glow", true);
    const playerGlowR = makePlane(fallback, "headGlowR", new pc.Vec3(0.5,0.5,0.5), new pc.Vec3(0.58,0.85,-2.35), mat.nitro); playerGlowR.setLocalEulerAngles(-90, 0, 0); registerSpriteTarget(playerGlowR, "glow", true);

    const wheels = [];
    [[-1.15,0.33,-1.45],[1.15,0.33,-1.45],[-1.15,0.33,1.45],[1.15,0.33,1.45]].forEach(([x,y,z]) => {
      const wheel = makeCylinder(fallback, "wheel", new pc.Vec3(0.5,0.26,0.5), new pc.Vec3(x,y,z), mat.wheel);
      wheel.setLocalEulerAngles(90,0,0);
      wheels.push(wheel);
    });

    const flameL = makePlane(car, "flameL", new pc.Vec3(0.65,0.65,0.65), new pc.Vec3(-0.45,0.68,2.55), mat.nitro);
    const flameR = makePlane(car, "flameR", new pc.Vec3(0.65,0.65,0.65), new pc.Vec3(0.45,0.68,2.55), mat.nitro);
    registerSpriteTarget(flameL, "nitro", true); registerSpriteTarget(flameR, "nitro", true);
    flameL.setLocalEulerAngles(-90,0,0);
    flameR.setLocalEulerAngles(-90,0,0);
    flameL.enabled = false;
    flameR.enabled = false;

    const driver = makePlane(car, "playerDriverSprite", new pc.Vec3(1.18,0.58,1), new pc.Vec3(0,1.55,0.35), mat.nitro);
    driver.setLocalEulerAngles(-90, 0, 0);
    registerSpriteTarget(driver, "driverPlayer0", false);
    car.driverSprite = driver;
    car.driverFrames = ["driverPlayer0", "driverPlayer1", "driverPlayer2", "driverPlayer3"];

    car.flames = [flameL, flameR];
    car.wheels = wheels;
    car.wheelSpin = 0;
    registerCarForModel(car, "player", selectedModelIndex());
    car.setLocalPosition(0,0,8);
    return car;
  }

  function buildTrafficCar(material) {
    const car = new pc.Entity("trafficCar");
    root.addChild(car);

    const fallback = new pc.Entity("trafficFallbackMesh");
    car.addChild(fallback);
    car.fallbackMesh = fallback;

    makeBox(fallback, "body", new pc.Vec3(2.25,0.5,4.2), new pc.Vec3(0,0.67,0), material);
    makeBox(fallback, "cabin", new pc.Vec3(1.55,0.5,1.8), new pc.Vec3(0,1.05,-0.25), material);
    makeBox(fallback, "glass", new pc.Vec3(1.25,0.27,1.0), new pc.Vec3(0,1.2,-0.25), mat.windshield);
    const headL = makePlane(fallback, "headL", new pc.Vec3(0.4,0.4,0.4), new pc.Vec3(-0.55,0.8,-2.15), mat.nitro);
    const headR = makePlane(fallback, "headR", new pc.Vec3(0.4,0.4,0.4), new pc.Vec3(0.55,0.8,-2.15), mat.nitro);
    headL.setLocalEulerAngles(-90,0,0);
    headR.setLocalEulerAngles(-90,0,0);
    registerSpriteTarget(headL, "glow", true); registerSpriteTarget(headR, "glow", true);

    const wheels = [];
    [[-1,0.31,-1.3],[1,0.31,-1.3],[-1,0.31,1.3],[1,0.31,1.3]].forEach(([x,y,z]) => {
      const wheel = makeCylinder(fallback, "wheel", new pc.Vec3(0.45,0.25,0.45), new pc.Vec3(x,y,z), mat.wheel);
      wheel.setLocalEulerAngles(90,0,0);
      wheels.push(wheel);
    });

    const driver = makePlane(car, "trafficDriverSprite", new pc.Vec3(1.05,0.52,1), new pc.Vec3(0,1.42,0.25), mat.nitro);
    driver.setLocalEulerAngles(-90, 0, 0);
    registerSpriteTarget(driver, "driverTraffic0", false);
    car.driverSprite = driver;
    car.driverFrames = ["driverTraffic0", "driverTraffic1", "driverTraffic2", "driverTraffic3"];

    car.wheels = wheels;
    car.wheelSpin = 0;
    const modelIndex = Math.floor(Math.random() * MODEL_URLS.traffic.length);
    registerCarForModel(car, "traffic", modelIndex);
    return car;
  }

  function buildPickup() {
    const p = new pc.Entity("pickup");
    root.addChild(p);
    makeSphere(p, "core", new pc.Vec3(0.7,0.7,0.7), new pc.Vec3(0,0,0), mat.coin);
    const ringA = makePlane(p, "ringA", new pc.Vec3(1.6,1.6,1.6), new pc.Vec3(0,0,0), mat.nitro);
    const ringB = makePlane(p, "ringB", new pc.Vec3(1.2,1.2,1.2), new pc.Vec3(0,0,0), mat.nitro);
    ringA.setLocalEulerAngles(0,0,0);
    ringB.setLocalEulerAngles(90,0,0);
    registerSpriteTarget(ringA, "pickup", true); registerSpriteTarget(ringB, "pickup", true);
    p.rings = [ringA, ringB];
    return p;
  }

  function buildHazard() {
    const h = new pc.Entity("hazardGate");
    root.addChild(h);
    makeBox(h, "bar", new pc.Vec3(3.2,0.14,0.28), new pc.Vec3(0,0,0), mat.danger);
    const hazardGlow = makePlane(h, "glow", new pc.Vec3(3.8,0.6,0.6), new pc.Vec3(0,0,0), mat.nitro); hazardGlow.setLocalEulerAngles(-90,0,0); registerSpriteTarget(hazardGlow, "speed", true);
    return h;
  }

  loadGlbCarModels();
  loadRoadsideBuildingModels();
  loadSpriteAssets();
  loadContinuousRoadTrack();

  function signSpriteKey(text = "") {
    const t = String(text || "").toUpperCase();
    if (t.includes("NITRO")) return "signNitro";
    if (t.includes("BOOST")) return "signBoost";
    return "signRace";
  }

  const playerCar = buildPlayerCar();
  const checkpointGate = buildCourseGate("checkpoint");
  const finishGate = buildCourseGate("finish");

  function createRoadSegment(z) {
    const seg = new pc.Entity("roadSegment");
    root.addChild(seg);
    makeBox(seg, "road", new pc.Vec3(12.2,0.08,64), new pc.Vec3(0,0,0), mat.road);
    makeBox(seg, "leftShoulder", new pc.Vec3(1.55,0.09,64), new pc.Vec3(-6.9,0.015,0), mat.shoulder);
    makeBox(seg, "rightShoulder", new pc.Vec3(1.55,0.09,64), new pc.Vec3(6.9,0.015,0), mat.shoulder);
    for (let i = 0; i < 11; i++) {
      const dashL = makePlane(seg, "dashL", new pc.Vec3(0.34,2.4,2.4), new pc.Vec3(-2.18,0.085,-30 + i * 6), mat.lane);
      const dashR = makePlane(seg, "dashR", new pc.Vec3(0.34,2.4,2.4), new pc.Vec3(2.18,0.085,-30 + i * 6), mat.lane);
      dashL.setLocalEulerAngles(-90,0,0);
      dashR.setLocalEulerAngles(-90,0,0);
    }
    seg.setLocalPosition(roadCenterAt(z), 0, z);
    return seg;
  }
  for (let i = 0; i < 7; i++) roadSegments.push(createRoadSegment(i * -64));

  function createRoadsideLight(side, z) {
    const e = new pc.Entity("roadLight");
    root.addChild(e);
    makeBox(e, "pole", new pc.Vec3(0.11,3.3,0.11), new pc.Vec3(0,1.65,0), makeMaterial({ diffuse:new pc.Color(0.54,0.58,0.65), diffuseMap:TEX.metal }));
    const lamp = makePlane(e, "lamp", new pc.Vec3(0.8,0.8,0.8), new pc.Vec3(0,3.35,0), mat.nitro); lamp.setLocalEulerAngles(-90,0,0); registerSpriteTarget(lamp, "glow", true);
    e.side = side;
    e.setLocalPosition(roadCenterAt(z) + side * 9.4, 0, z);
    return e;
  }
  for (let i = 0; i < 24; i++) {
    roadsideLights.push(createRoadsideLight(-1, -i * 17));
    roadsideLights.push(createRoadsideLight(1, -i * 17 - 8.5));
  }

  function createMountain(side, z, i) {
    const e = new pc.Entity("mountain");
    e.addComponent("render", { type: "box", material: i % 2 ? mat.mountainA : mat.mountainB });
    const sx = 8 + (i % 3) * 3;
    const sy = 3.4 + (i % 5) * 1.1;
    const sz = 12 + (i % 4) * 2;
    e.setLocalScale(sx, sy, sz);
    e.side = side;
    e.offset = side * (23 + (i % 3) * 6);
    e.setLocalPosition(roadCenterAt(z) + e.offset, sy * 0.5 - 0.4, z);
    root.addChild(e);
    return e;
  }
  for (let i = 0; i < 18; i++) {
    mountains.push(createMountain(-1, -35 - i * 20, i));
    mountains.push(createMountain(1, -45 - i * 20, i + 3));
  }

  function createSign(side, z, text = "RACE") {
    const e = new pc.Entity("sign");
    root.addChild(e);
    makeBox(e, "post", new pc.Vec3(0.1,2,0.1), new pc.Vec3(0,1,0), mat.lane);
    makeBox(e, "board", new pc.Vec3(2.2,0.7,0.12), new pc.Vec3(0,2.15,0), mat.sign);
    const signFace = makePlane(e, "signFace", new pc.Vec3(2.35,1.05,1), new pc.Vec3(0,2.15,0.09), mat.sign);
    signFace.setLocalEulerAngles(0, 0, 0);
    registerSpriteTarget(signFace, signSpriteKey(text), false);
    const glow = makePlane(e, "glow", new pc.Vec3(2.8,1.0,1), new pc.Vec3(0,2.15,0.08), mat.nitro);
    glow.setLocalEulerAngles(0, 0, 0);
    registerSpriteTarget(glow, "glow", true);
    e.side = side;
    e.offset = side * 11.8;
    e.label = text;
    e.setLocalPosition(roadCenterAt(z) + e.offset, 0, z);
    return e;
  }
  for (let i = 0; i < 8; i++) {
    const label = i % 3 === 0 ? "BOOST" : (i % 2 ? "NITRO" : "RACE");
    signs.push(createSign(i % 2 ? -1 : 1, -60 - i * 48, label));
  }

  // ---------- scenery ----------
  function destroyScenery() {
    while (scenery.length) scenery.pop().destroy();
  }

  function addSceneryProp(ent) {
    scenery.push(ent);
    return ent;
  }

  function buildPalm() {
    const e = new pc.Entity("palm");
    root.addChild(e);
    makeCylinder(e, "trunk", new pc.Vec3(0.32,2.8,0.32), new pc.Vec3(0,1.4,0), mat.bark);
    for (let i = 0; i < 5; i++) {
      const leaf = makePlane(e, "leaf", new pc.Vec3(2.8,1.2,1.2), new pc.Vec3(0,2.95,0), mat.palmLeaf);
      leaf.setLocalEulerAngles(0, i * 72, -12 + (i % 2 ? 10 : -10));
    }
    e.anim = "sway";
    return addSceneryProp(e);
  }

  function buildCactus() {
    const e = new pc.Entity("cactus");
    root.addChild(e);
    const cactusMat = makeMaterial({ diffuse:new pc.Color(0.18,0.55,0.18), diffuseMap:TEX.leaves });
    makeCylinder(e, "main", new pc.Vec3(0.42,2.2,0.42), new pc.Vec3(0,1.1,0), cactusMat);
    makeCylinder(e, "armL", new pc.Vec3(0.22,0.8,0.22), new pc.Vec3(-0.45,1.2,0), cactusMat).setLocalEulerAngles(0,0,90);
    makeCylinder(e, "armR", new pc.Vec3(0.22,0.8,0.22), new pc.Vec3(0.45,1.6,0), cactusMat).setLocalEulerAngles(0,0,-90);
    return addSceneryProp(e);
  }

  function buildPine() {
    const e = new pc.Entity("pine");
    root.addChild(e);
    makeCylinder(e, "trunk", new pc.Vec3(0.24,1.6,0.24), new pc.Vec3(0,0.8,0), mat.bark);
    makeCone(e, "cone1", new pc.Vec3(1.8,1.8,1.8), new pc.Vec3(0,2.0,0), mat.leaves);
    makeCone(e, "cone2", new pc.Vec3(1.3,1.4,1.3), new pc.Vec3(0,2.9,0), mat.leaves);
    makeCone(e, "cone3", new pc.Vec3(0.9,1.0,0.9), new pc.Vec3(0,3.6,0), mat.leaves);
    return addSceneryProp(e);
  }

  function buildJungleTree() {
    const e = new pc.Entity("jungleTree");
    root.addChild(e);
    makeCylinder(e, "trunk", new pc.Vec3(0.28,2.4,0.28), new pc.Vec3(0,1.2,0), mat.bark);
    makeSphere(e, "crown1", new pc.Vec3(1.8,1.4,1.8), new pc.Vec3(-0.3,3.0,0), mat.leaves);
    makeSphere(e, "crown2", new pc.Vec3(2.0,1.6,2.0), new pc.Vec3(0.5,3.2,0), mat.leaves);
    makeSphere(e, "crown3", new pc.Vec3(1.5,1.2,1.5), new pc.Vec3(0,4.0,0), mat.leaves);
    e.anim = "sway";
    return addSceneryProp(e);
  }

  function buildNeonArch() {
    const e = new pc.Entity("neonArch");
    root.addChild(e);
    makeBox(e, "legL", new pc.Vec3(0.18,2.4,0.18), new pc.Vec3(-0.9,1.2,0), mat.sign);
    makeBox(e, "legR", new pc.Vec3(0.18,2.4,0.18), new pc.Vec3(0.9,1.2,0), mat.sign);
    makeBox(e, "beam", new pc.Vec3(2.1,0.18,0.18), new pc.Vec3(0,2.35,0), mat.sign);
    makePlane(e, "glowL", new pc.Vec3(1.1,1.1,1.1), new pc.Vec3(-0.9,2.35,0), mat.nitro).setLocalEulerAngles(-90,0,0);
    makePlane(e, "glowR", new pc.Vec3(1.1,1.1,1.1), new pc.Vec3(0.9,2.35,0), mat.nitro).setLocalEulerAngles(-90,0,0);
    makePlane(e, "glowC", new pc.Vec3(2.4,1.0,1.0), new pc.Vec3(0,2.35,0), mat.nitro).setLocalEulerAngles(-90,0,0);
    e.anim = "pulse";
    return addSceneryProp(e);
  }

  function buildRockProp() {
    const e = new pc.Entity("rock");
    root.addChild(e);
    makeBox(e, "rockA", new pc.Vec3(1.6 + Math.random(), 1.0 + Math.random() * 1.2, 1.5 + Math.random()), new pc.Vec3(0, 0.6, 0), mat.mountainA);
    makeBox(e, "rockB", new pc.Vec3(1.1, 0.8, 1.1), new pc.Vec3(0.6, 1.0, 0.1), mat.mountainB);
    return addSceneryProp(e);
  }


  function rebuildScenery(env) {
    destroyScenery();

    const count = 46;
    for (let i = 0; i < count; i++) {
      let e;

      // Ensure visible buildings on every level. Metro/final are dense city,
      // while other themes mix real buildings with theme props.
      const forceBuilding = i % 3 === 0 || i % 7 === 0;

      if (env === "metro" || env === "final") {
        e = i % 4 === 0 ? buildNeonArch() : buildBuilding();
      } else if (forceBuilding) {
        e = buildBuilding();
      } else if (env === "coast") {
        e = Math.random() > 0.35 ? buildPalm() : buildRockProp();
      } else if (env === "desert") {
        e = Math.random() > 0.42 ? buildCactus() : buildRockProp();
      } else if (env === "alpine") {
        e = Math.random() > 0.28 ? buildPine() : buildBuilding();
      } else if (env === "jungle") {
        e = Math.random() > 0.32 ? buildJungleTree() : buildBuilding();
      } else {
        e = Math.random() > 0.35 ? buildBuilding() : buildNeonArch();
      }

      e.side = i % 2 ? -1 : 1;
      const minOffset = e.roadsideMinOffset ?? 12;
      const offsetRange = e.roadsideOffsetRange ?? 9;
      e.offset = e.side * (minOffset + Math.random() * offsetRange);
      e.baseZ = -22 - i * 11.5;
      e.setLocalPosition(roadCenterAt(e.baseZ) + e.offset, Math.max(0, trackCrestAt(e.baseZ) * 0.22), e.baseZ);

      e.baseScale = e.sceneryKind === "building"
        ? 1.35 + Math.random() * 0.55
        : 0.9 + Math.random() * 0.55;

      const finalScale = e.baseScale * (e.buildingBaseScale || 1);
      e.setLocalScale(finalScale, finalScale, finalScale);

      if (e.turnToRoad) {
        e.setLocalEulerAngles(0, e.side > 0 ? -90 : 90, 0);
      }

      e.phase = Math.random() * Math.PI * 2;
    }

    refreshRoadsideBuildings();
  }


  function showLevelBanner(levelIndex) {
    const spec = LEVELS[levelIndex] || LEVELS[0];
    $("levelKicker").textContent = `Level ${levelIndex + 1}/${LEVELS.length}`;
    $("levelTitle").textContent = spec.title;
    $("levelText").textContent = spec.mission;
    levelOverlay.style.display = "block";
    state.levelBanner = 3.2;
  }

  // ---------- gameplay spawns ----------


  // ---------- laps, checkpoints, finish lines and road sections ----------
  function levelLapLength() {
    const spec = LEVELS[state.level] || LEVELS[0];
    return spec.targetDistance;
  }

  function levelRaceDistance() {
    return levelLapLength() * state.totalLaps;
  }

  function checkpointSpacing() {
    return levelLapLength() / state.checkpointCount;
  }

  function setupLapState() {
    state.currentLap = 1;
    state.lapDistance = 0;
    state.checkpointIndex = 0;
    state.nextCheckpointDistance = checkpointSpacing();
    state.passedCheckpoints = 0;
    state.passedFinishLines = 0;
    state.checkpointCombo = 0;
  }

  function updateLapState(distanceStep) {
    const before = state.levelDistance - distanceStep;
    const after = state.levelDistance;
    const lapLength = levelLapLength();

    const beforeLap = Math.floor(before / lapLength) + 1;
    const afterLap = Math.floor(after / lapLength) + 1;
    state.currentLap = Math.min(state.totalLaps, Math.max(1, afterLap));
    state.lapDistance = after % lapLength;

    // Checkpoint gate every quarter lap.
    while (state.nextCheckpointDistance <= after && state.nextCheckpointDistance < levelRaceDistance()) {
      const checkpointWithinLap = Math.floor((state.nextCheckpointDistance % lapLength) / checkpointSpacing()) + 1;
      const checkpointBonus = 220 + state.level * 65 + state.checkpointCombo * 45;
      state.checkpointCombo += 1;
      state.passedCheckpoints += 1;
      state.checkpointIndex = Math.floor((state.nextCheckpointDistance % lapLength) / checkpointSpacing()) % state.checkpointCount;
      state.score += checkpointBonus;
      state.nitro = Math.min(100, state.nitro + 8);
      createPopText(`CHECKPOINT +${checkpointBonus}`, playerCar.getLocalPosition().x, 3.2, playerCar.getLocalPosition().z - 6, "#36e5ff");
      toast(`Checkpoint ${Math.min(checkpointWithinLap, state.checkpointCount)}/${state.checkpointCount} • Lap ${Math.min(state.currentLap, state.totalLaps)}/${state.totalLaps}`);
      audio.sfxPickup();

      state.nextCheckpointDistance += checkpointSpacing();
    }

    // Finish line at the end of each lap.
    if (afterLap > beforeLap && after <= levelRaceDistance() + 5) {
      const lapCompleted = Math.min(beforeLap, state.totalLaps);
      const lapBonus = 750 + state.level * 150 + lapCompleted * 120;
      state.passedFinishLines += 1;
      state.checkpointIndex = 0;
      state.checkpointCombo = 0;
      state.score += lapBonus;
      state.nitro = Math.min(100, state.nitro + 20);
      createPopText(`LAP ${lapCompleted} COMPLETE +${lapBonus}`, playerCar.getLocalPosition().x, 3.5, playerCar.getLocalPosition().z - 8, "#ff2ed1");
      toast(lapCompleted >= state.totalLaps ? "Final lap complete!" : `Lap ${lapCompleted}/${state.totalLaps} complete`);
      audio.sfxLevel();
    }
  }

  function nextGateDistance() {
    const raceDistance = levelRaceDistance();
    const lapLength = levelLapLength();
    const nextFinish = Math.ceil(Math.max(1, state.levelDistance + 1) / lapLength) * lapLength;
    const nextCheckpoint = state.nextCheckpointDistance;
    const target = Math.min(nextCheckpoint, nextFinish, raceDistance);
    return target - state.levelDistance;
  }

  function isNextGateFinish() {
    const lapLength = levelLapLength();
    const nextFinish = Math.ceil(Math.max(1, state.levelDistance + 1) / lapLength) * lapLength;
    return nextFinish <= state.nextCheckpointDistance + 2;
  }

  function buildCourseGate(kind = "checkpoint") {
    const gate = new pc.Entity(`${kind}Gate`);
    root.addChild(gate);

    const colorMat = kind === "finish" ? mat.danger : mat.sign;
    makeBox(gate, "leftPost", new pc.Vec3(0.22, 3.2, 0.22), new pc.Vec3(-6.2, 1.6, 0), colorMat);
    makeBox(gate, "rightPost", new pc.Vec3(0.22, 3.2, 0.22), new pc.Vec3(6.2, 1.6, 0), colorMat);
    makeBox(gate, "topBeam", new pc.Vec3(12.8, 0.3, 0.28), new pc.Vec3(0, 3.15, 0), colorMat);

    const glow = makePlane(gate, "gateGlow", new pc.Vec3(9.8, 2.1, 1), new pc.Vec3(0, 2.2, 0.05), mat.nitro);
    glow.setLocalEulerAngles(0, 0, 0);
    registerSpriteTarget(glow, kind === "finish" ? "signBoost" : "glow", true);

    const label = makePlane(gate, "gateLabel", new pc.Vec3(4.2, 1.2, 1), new pc.Vec3(0, 3.18, 0.12), mat.sign);
    label.setLocalEulerAngles(0, 0, 0);
    registerSpriteTarget(label, kind === "finish" ? "signRace" : "signNitro", false);

    gate.kind = kind;
    gate.enabled = false;
    courseGates.push(gate);
    return gate;
  }

  function updateCourseGates(dt) {
    if (!checkpointGate || !finishGate) return;

    const gateDistance = nextGateDistance();
    const visible = gateDistance > 0 && gateDistance < 720;
    const gateZ = pc.math.clamp(8 - gateDistance * 0.16, -108, 18);
    const y = Math.max(0, trackCrestAt(gateZ));
    const yaw = trackCurveAt(gateZ);

    checkpointGate.enabled = visible && !isNextGateFinish();
    finishGate.enabled = visible && isNextGateFinish();

    const activeGate = checkpointGate.enabled ? checkpointGate : (finishGate.enabled ? finishGate : null);
    if (activeGate) {
      activeGate.setLocalPosition(roadCenterAt(gateZ), y, gateZ);
      activeGate.setLocalEulerAngles(0, yaw, Math.sin(state.elapsed * 4.5) * 1.2);
      const pulse = 1 + Math.sin(state.elapsed * 6) * 0.03;
      activeGate.setLocalScale(pulse, pulse, pulse);
    }
  }

  // ---------- racing rivals, positions and overtaking ----------
  const RIVAL_NAMES = [
    "Blaze",
    "Nova",
    "Volt",
    "Rex",
    "Phantom",
    "Turbo",
    "Viper"
  ];

  function initRivals() {
    while (rivalCars.length) {
      const r = rivalCars.pop();
      r.destroy();
    }

    const startingOffsets = [130, 70, 25, -35, -85, -140, -205];

    for (let i = 0; i < state.rivalsTotal; i++) {
      const rival = buildTrafficCar(trafficMats[(i + 1) % trafficMats.length]);
      rival.name = `rival-${RIVAL_NAMES[i] || i}`;
      rival.isRival = true;
      rival.rivalName = RIVAL_NAMES[i] || `Rival ${i + 1}`;
      rival.laneIndex = i % 3;
      rival.progress = state.levelDistance + startingOffsets[i];
      rival.lastProgress = rival.progress;
      rival.rivalSpeed = state.baseSpeed * (0.86 + i * 0.018 + Math.random() * 0.08);
      rival.aggression = 0.22 + i * 0.055;
      rival.overtakeTimer = 0.4 + Math.random() * 1.6;
      rival.wobble = Math.random() * Math.PI * 2;
      rival.setLocalPosition(laneWorldX(rival.laneIndex, -20 - i * 6), 0, -20 - i * 6);
      rival.setLocalEulerAngles(0, 180, 0);
      rivalCars.push(rival);
    }

    state.racePosition = calculateRacePosition();
    state.previousRacePosition = state.racePosition;
  }

  function resetRivalsForLevel() {
    const offsets = [95, 45, 10, -30, -75, -125, -180];
    rivalCars.forEach((rival, i) => {
      rival.progress = state.levelDistance + offsets[i] + Math.random() * 30;
      rival.lastProgress = rival.progress;
      rival.rivalSpeed = state.baseSpeed * (0.9 + i * 0.018 + Math.random() * 0.06);
      rival.laneIndex = i % 3;
      rival.overtakeTimer = 0.3 + Math.random() * 1.2;
      const z = 8 - (rival.progress - state.levelDistance) * 0.16;
      rival.setLocalPosition(laneWorldX(rival.laneIndex, z), 0, z);
    });
    state.racePosition = calculateRacePosition();
    state.previousRacePosition = state.racePosition;
  }

  function calculateRacePosition() {
    let ahead = 0;
    for (const rival of rivalCars) {
      if (rival.progress > state.levelDistance + 4) ahead++;
    }
    return Math.max(1, Math.min(state.rivalsTotal + 1, ahead + 1));
  }

  function chooseRivalLane(rival, z) {
    const blocked = new Set();

    // Avoid regular traffic close to the rival.
    for (const traffic of trafficCars) {
      const tp = traffic.getLocalPosition();
      if (Math.abs(tp.z - z) < 18) blocked.add(traffic.laneIndex);
    }

    // Avoid the player if side-by-side.
    const playerPos = playerCar.getLocalPosition();
    if (Math.abs(playerPos.z - z) < 7) blocked.add(state.laneIndex);

    // Try to move to a free lane.
    const options = [0, 1, 2].filter((lane) => lane !== rival.laneIndex && !blocked.has(lane));
    if (options.length) {
      // Prefer the middle lane if possible, otherwise random free lane.
      if (options.includes(1) && Math.random() > 0.35) return 1;
      return options[Math.floor(Math.random() * options.length)];
    }

    return rival.laneIndex;
  }

  function updateRivals(dt) {
    const playerPos = playerCar.getLocalPosition();
    const playerProgress = state.levelDistance;
    const stats = selectedCarStats();

    for (let i = rivalCars.length - 1; i >= 0; i--) {
      const rival = rivalCars[i];
      const gap = rival.progress - playerProgress; // positive means rival ahead

      // Rubber-band AI: racers behind push harder, racers far ahead ease off.
      const targetSpeed =
        state.baseSpeed *
        (0.9 + i * 0.015 + state.level * 0.018 + rival.aggression * 0.16) +
        (gap < -80 ? 12 : 0) -
        (gap > 260 ? 10 : 0) +
        Math.sin(state.elapsed * 0.8 + rival.wobble) * 2.6;

      rival.rivalSpeed += (targetSpeed - rival.rivalSpeed) * Math.min(1, dt * 0.8);
      rival.lastProgress = rival.progress;
      rival.progress += rival.rivalSpeed * dt * 0.92;

      // Keep rivals close enough to stay visually and competitively relevant.
      if (rival.progress - playerProgress > 430) rival.progress = playerProgress + 430;
      if (rival.progress - playerProgress < -280) rival.progress = playerProgress - 280;

      const z = pc.math.clamp(8 - (rival.progress - playerProgress) * 0.16, -92, 24);

      rival.overtakeTimer -= dt;
      if (rival.overtakeTimer <= 0) {
        const closeToPlayer = Math.abs(z - playerPos.z) < 17;
        const trafficPressure = trafficCars.some((traffic) => {
          const tp = traffic.getLocalPosition();
          return traffic.laneIndex === rival.laneIndex && Math.abs(tp.z - z) < 22;
        });

        if (closeToPlayer || trafficPressure || Math.random() < 0.34 + rival.aggression * 0.4) {
          rival.laneIndex = chooseRivalLane(rival, z);
        }
        rival.overtakeTimer = 0.55 + Math.random() * (1.4 - Math.min(0.8, rival.aggression));
      }

      const targetX = laneWorldX(rival.laneIndex, z);
      const p = rival.getLocalPosition();
      p.z += (z - p.z) * Math.min(1, dt * 5.5);
      p.x += (targetX - p.x) * Math.min(1, dt * (3.8 + state.level * 0.28 + stats.handling * 0.08));
      p.y = trackCrestAt(z) * 0.22 + Math.sin(state.elapsed * 8 + i) * 0.025;
      rival.setLocalPosition(p);

      const lateralTilt = (targetX - p.x) * -4.5;
      rival.setLocalEulerAngles(0, 180 + Math.sin(state.elapsed * 2.5 + i) * 1.4, lateralTilt);

      rival.wheelSpin += state.roadSpeed * dt * 220;
      rival.wheels?.forEach((w) => w.setLocalEulerAngles(90 + rival.wheelSpin, 0, 0));
      animateDriverSprite(rival, i + rival.laneIndex, rival.aggression > 0.3);

      // Rival collision: a direct hit ends the run, but slight passes become overtakes.
      if (rectHit(playerPos.x, playerPos.z, 2.12, 4.0, p.x, p.z, 2.1, 4.0)) {
        state.cameraShake = 0.46;
        endGame(false);
        return;
      }
    }

    const newPosition = calculateRacePosition();

    if (newPosition < state.racePosition) {
      const gained = state.racePosition - newPosition;
      state.overtakes += gained;
      const bonus = 350 * gained + state.level * 90;
      state.score += bonus;
      state.nitro = Math.min(100, state.nitro + 10 * gained);
      createPopText(`OVERTAKE +${bonus}`, playerPos.x, 3.0, playerPos.z - 5, "#ff2ed1");
      toast(`Overtake! Position ${newPosition}/${state.rivalsTotal + 1}`);
      audio.sfxNearMiss();
    }

    state.previousRacePosition = state.racePosition;
    state.racePosition = newPosition;
  }

  function spawnTrafficCar() {
    const lane = Math.floor(Math.random() * 3);
    const car = buildTrafficCar(trafficMats[Math.floor(Math.random() * trafficMats.length)]);
    const z = -135 - Math.random() * 45;
    car.laneIndex = lane;
    car.baseSpeed = state.roadSpeed * (0.50 + Math.random() * 0.35);
    car.nearMissAwarded = false;
    car.aiAggression = 0.18 + state.level * 0.07;
    car.setLocalPosition(laneWorldX(lane, z), 0, z);
    car.setLocalEulerAngles(0, 180, 0);
    trafficCars.push(car);
  }

  function spawnPickup() {
    const lane = Math.floor(Math.random() * 3);
    const pickup = buildPickup();
    const z = -120 - Math.random() * 30;
    pickup.laneIndex = lane;
    pickup.setLocalPosition(laneWorldX(lane, z), 1.15, z);
    pickups.push(pickup);
  }

  function spawnHazard() {
    const lane = Math.floor(Math.random() * 3);
    const h = buildHazard();
    const z = -125 - Math.random() * 30;
    h.laneIndex = lane;
    h.setLocalPosition(laneWorldX(lane, z), 1.1, z);
    hazards.push(h);
    audio.sfxHazard();
  }

  function createPopText(text, x, y, z, color = "#3be1ff") {
    particles.push({ text, x, y, z, color, life: 1.1, maxLife: 1.1 });
  }

  function postScore(final = false) {
    const score = Math.max(0, Math.floor(state.score));
    if (!final && Math.abs(score - state.lastPostedScore) < 120) return;
    state.lastPostedScore = score;
    try {
      window.parent?.postMessage({ type: "GG_SCORE", game: GAME_SLUG, score, final }, "*");
      window.parent?.postMessage({ type: "gg:score", slug: GAME_SLUG, score, final }, "*");
    } catch {}
  }

  // ---------- state management ----------
  function resetWorld() {
    [...trafficCars, ...rivalCars, ...pickups, ...hazards].forEach((e) => e.destroy());
    trafficCars.length = 0;
    rivalCars.length = 0;
    pickups.length = 0;
    hazards.length = 0;
    particles.forEach((p) => p.el?.remove?.());
    particles.length = 0;

    state.mode = "countdown";
    state.elapsed = 0;
    state.level = 0;
    state.levelDistance = 0;
    state.levelBanner = 0;
    state.countdown = 3.4;
    state.score = 0;
    state.distance = 0;
    state.lastPostedScore = 0;
    state.trafficTimer = 0.6;
    state.pickupTimer = 0;
    state.hazardTimer = 0;
    state.difficultyTimer = 0;
    const stats = selectedCarStats();
    state.baseSpeed = LEVELS[0].baseSpeed + stats.speed;
    state.roadSpeed = LEVELS[0].baseSpeed + stats.speed;
    state.maxBaseSpeed = LEVELS[0].maxSpeed + stats.speed;
    state.laneIndex = 1;
    state.targetLaneIndex = 1;
    state.nitro = 100;
    state.nitroHeld = false;
    state.boostFactor = 1;
    state.cameraShake = 0;
    state.nearMissChain = 0;
    state.roadPhase = 0;
    state.finishedCampaign = false;
    setupLapState();
    state.racePosition = 1;
    state.previousRacePosition = 1;
    state.overtakes = 0;

    playerCar.setLocalPosition(laneWorldX(1, 8), 0, 8);
    playerCar.setLocalEulerAngles(0, 0, 0);
    playerCar.flames.forEach((f) => (f.enabled = false));
    courseGates.forEach((g) => (g.enabled = false));
    if (CONTINUOUS_ROAD.loaded) {
      CONTINUOUS_ROAD.instances.forEach((seg, i) => {
        seg.enabled = true;
        seg.setLocalPosition(0, 0.02, CONTINUOUS_ROAD.startZ - i * CONTINUOUS_ROAD.length);
      });
      roadSegments.forEach((seg) => (seg.enabled = true));
      floor.enabled = false;
      setTimeout(() => {
        if (CONTINUOUS_ROAD.loaded) roadSegments.forEach((seg) => (seg.enabled = false));
      }, 1400);
    } else {
      roadSegments.forEach((seg) => (seg.enabled = true));
      floor.enabled = true;
    }

    ui.gameOverOverlay?.classList.add("hidden");
    countdownEl.style.display = "grid";
    pauseOverlay.style.display = "none";
    pauseBtn.textContent = "Ⅱ";

    applyLevelTheme(0);
    showLevelBanner(0);
    initRivals();
    audio.startEngine();
    updateHUD();
    setOverlayState();
  }

  function startGame() {
    audio.ensure();
    ui.startOverlay?.classList.add("hidden");
    resetWorld();
    setOverlayState();
  }

  function endGame(win = false) {
    if (state.mode === "ended") return;
    state.mode = "ended";
    playerCar.flames.forEach((f) => (f.enabled = false));
    countdownEl.style.display = "none";
    levelOverlay.style.display = "none";
    pauseOverlay.style.display = "none";
    audio.sfxCrash();
    audio.stopEngine();
    if (ui.gameOverTitle) ui.gameOverTitle.textContent = win ? "Campaign Complete!" : "Crash!";
    const coinReward = Math.max(20, Math.floor(state.score / 320) + state.level * 35 + (win ? 500 : 0));
    awardCoins(coinReward);
    profile.bestScore = Math.max(profile.bestScore, Math.floor(state.score));
    saveProfile();
    refreshGarageUi();
    if (ui.finalStats) {
      ui.finalStats.textContent =
        `Final Score: ${Math.floor(state.score)} • Position: ${state.racePosition}/${state.rivalsTotal + 1} • Laps: ${state.passedFinishLines}/${state.totalLaps} • Checkpoints: ${state.passedCheckpoints} • Overtakes: ${state.overtakes} • Coins Earned: ${coinReward} • Total Coins: ${Math.floor(profile.coins)} • Level: ${state.level + 1}/${LEVELS.length}`;
    }
    ui.gameOverOverlay?.classList.remove("hidden");
    setOverlayState();
    postScore(true);
  }

  function advanceLevel() {
    const current = LEVELS[state.level];
    state.score += current.bonus;
    state.nitro = Math.min(100, state.nitro + 45);
    audio.sfxLevel();

    if (state.level >= LEVELS.length - 1) {
      state.finishedCampaign = true;
      state.score += 5000;
      endGame(true);
      return;
    }

    state.level += 1;
    state.levelDistance = 0;
    setupLapState();
    const next = LEVELS[state.level];
    const stats = selectedCarStats();
    state.baseSpeed = next.baseSpeed + stats.speed;
    state.maxBaseSpeed = next.maxSpeed + stats.speed;
    applyLevelTheme(state.level);
    showLevelBanner(state.level);
    resetRivalsForLevel();
    createPopText(`LEVEL ${state.level + 1}`, playerCar.getLocalPosition().x, 3.2, playerCar.getLocalPosition().z - 8, "#ffffff");
    postScore(false);
  }

  function togglePause(force = null) {
    if (state.mode !== "running" && state.mode !== "paused") return;
    const shouldPause = force === null ? state.mode === "running" : !!force;
    state.mode = shouldPause ? "paused" : "running";
    pauseOverlay.style.display = shouldPause ? "grid" : "none";
    pauseBtn.textContent = shouldPause ? "▶" : "Ⅱ";
    if (shouldPause) audio.stopEngine();
    else audio.startEngine();
  }

  function moveLeft() {
    if (state.mode !== "running" && state.mode !== "countdown") return;
    state.targetLaneIndex = Math.max(0, state.targetLaneIndex - 1);
    audio.sfxLane();
  }

  function moveRight() {
    if (state.mode !== "running" && state.mode !== "countdown") return;
    state.targetLaneIndex = Math.min(2, state.targetLaneIndex + 1);
    audio.sfxLane();
  }

  function setNitro(on) {
    if (state.mode !== "running") {
      state.nitroHeld = false;
      return;
    }
    if (on && !state.nitroHeld && state.nitro > 4) audio.sfxNitro();
    state.nitroHeld = on;
  }

  function bindPress(btn, onDown, onUp) {
    if (!btn) return;
    const down = (e) => {
      e.preventDefault();
      audio.ensure();
      onDown();
    };
    const up = (e) => {
      e.preventDefault();
      onUp?.();
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", up);
  }

  bindPress(ui.leftBtn, moveLeft);
  bindPress(ui.rightBtn, moveRight);
  bindPress(ui.nitroBtn, () => setNitro(true), () => setNitro(false));
  ui.startBtn?.addEventListener("click", startGame);
  ui.restartBtn?.addEventListener("click", resetWorld);
  pauseBtn.addEventListener("click", () => togglePause());
  $("resumeBtn")?.addEventListener("click", () => togglePause(false));

  let touchStart = null;
  canvas.addEventListener("pointerdown", (e) => { touchStart = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener("pointerup", (e) => {
    if (!touchStart) return;
    const dx = e.clientX - touchStart.x;
    const dy = e.clientY - touchStart.y;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2) dx < 0 ? moveLeft() : moveRight();
    touchStart = null;
  });

  document.addEventListener("keydown", (e) => {
    if (["ArrowLeft","ArrowRight","KeyA","KeyD","Space","ShiftLeft","ShiftRight","KeyP","Escape","KeyM"].includes(e.code)) e.preventDefault();
    audio.ensure();
    if (e.code === "KeyP" || e.code === "Escape") togglePause();
    if (e.code === "KeyM") audio.toggleMute();
  });

  function handleKeyboard() {
    if (app.keyboard.wasPressed(pc.KEY_LEFT) || app.keyboard.wasPressed(pc.KEY_A)) moveLeft();
    if (app.keyboard.wasPressed(pc.KEY_RIGHT) || app.keyboard.wasPressed(pc.KEY_D)) moveRight();
    state.nitroHeld = app.keyboard.isPressed(pc.KEY_SPACE) || app.keyboard.isPressed(pc.KEY_SHIFT);
  }

  function rectHit(ax, az, aw, al, bx, bz, bw, bl) {
    return Math.abs(ax - bx) < (aw + bw) * 0.5 && Math.abs(az - bz) < (al + bl) * 0.5;
  }

  function updateHUD() {
    const coinHud = $("coinHudValue");
    const posEl = $("positionValue");
    const rivalEl = $("rivalValue");
    const overtakesEl = $("overtakeValue");
    if (coinHud) coinHud.textContent = Math.floor(profile.coins).toLocaleString();
    if (posEl) posEl.textContent = `${state.racePosition}/${state.rivalsTotal + 1}`;
    if (rivalEl) rivalEl.textContent = `${Math.max(0, state.racePosition - 1)} ahead`;
    if (overtakesEl) overtakesEl.textContent = `${state.overtakes} overtakes`;
    if (ui.score) ui.score.textContent = Math.floor(state.score).toString();
    if (ui.speed) ui.speed.textContent = Math.floor(state.roadSpeed * 6).toString();
    const lapEl = $("lapValue");
    const checkpointEl = $("checkpointValue");
    if (lapEl) lapEl.textContent = `LAP ${state.currentLap}/${state.totalLaps}`;
    if (checkpointEl) checkpointEl.textContent = `CP ${Math.min(state.checkpointIndex + 1, state.checkpointCount)}/${state.checkpointCount}`;
    if (ui.distance) {
      ui.distance.textContent = `${Math.floor(state.lapDistance)}/${levelLapLength()} m`;
    }
    if (ui.nitroFill) ui.nitroFill.style.transform = `scaleX(${Math.max(0, state.nitro / 100)})`;
    updatePremiumHud();
  }

  function updateCountdown(dt) {
    if (state.mode !== "countdown") return;
    state.countdown -= dt;
    if (state.countdown > 2.4) countdownEl.textContent = "3";
    else if (state.countdown > 1.4) countdownEl.textContent = "2";
    else if (state.countdown > 0.4) countdownEl.textContent = "1";
    else if (state.countdown > 0) countdownEl.textContent = "GO!";
    else {
      countdownEl.style.display = "none";
      state.mode = "running";
      toast("Race started!");
    }
  }

  function updateLevelBanner(dt) {
    if (state.levelBanner <= 0) return;
    state.levelBanner -= dt;
    levelOverlay.style.display = "block";
    levelOverlay.style.opacity = String(Math.min(1, state.levelBanner));
    if (state.levelBanner <= 0) {
      levelOverlay.style.display = "none";
      levelOverlay.style.opacity = "1";
    }
  }


  function animateDriverSprite(car, seed = 0, aggressive = false) {
    if (!car || !car.driverSprite || !car.driverFrames) return;
    const speedFrame = state.nitroHeld && car === playerCar ? 2 : Math.floor((state.elapsed * (aggressive ? 4.4 : 3.1) + seed) % car.driverFrames.length);
    const key = car.driverFrames[speedFrame];
    if (car.driverSprite.spriteKey !== key) {
      car.driverSprite.spriteKey = key;
      applySpriteTarget(car.driverSprite);
    }
    // Small cockpit motion so the driver feels alive.
    const lean = Math.sin(state.elapsed * 5 + seed) * (aggressive ? 1.6 : 0.9);
    car.driverSprite.setLocalEulerAngles(-90, 0, lean);
  }

  function updatePlayer(dt) {
    const pos = playerCar.getLocalPosition();
    const targetZ = 8;
    const targetX = laneWorldX(state.targetLaneIndex, targetZ);
    const oldX = pos.x;
    pos.x += (targetX - pos.x) * Math.min(1, dt * (10.5 + selectedCarStats().handling * 0.55));
    pos.z += (targetZ - pos.z) * Math.min(1, dt * 5);
    const bob = Math.sin(state.elapsed * state.roadSpeed * 0.22) * 0.035;
    pos.y = trackCrestAt(targetZ) * 0.22 + bob;
    playerCar.setLocalPosition(pos);

    const lateralVel = (pos.x - oldX) / Math.max(0.001, dt);
    const tilt = pc.math.clamp(-lateralVel * 0.045, -14, 14);
    playerCar.setLocalEulerAngles(0, Math.sin(state.elapsed * 3) * 0.6, tilt);

    playerCar.wheelSpin += state.roadSpeed * dt * 260;
    playerCar.wheels.forEach((w) => w.setLocalEulerAngles(90 + playerCar.wheelSpin, 0, 0));
    animateDriverSprite(playerCar, 0, state.nitroHeld);

    if (state.nitroHeld && state.nitro > 0) {
      state.nitro -= dt * Math.max(16, 26 - selectedCarStats().nitro * 0.9);
      state.boostFactor = 1.48 + selectedCarStats().nitro * 0.018;
      playerCar.flames.forEach((f, i) => {
        f.enabled = true;
        f.setLocalScale(0.75 + Math.random() * 0.16, 0.75 + Math.random() * 0.16, 0.75);
        f.setLocalPosition(i ? 0.45 : -0.45, 0.68, 2.55 + Math.random() * 0.18);
      });
      camera.camera.fov += (64 - camera.camera.fov) * Math.min(1, dt * 4);
    } else {
      state.boostFactor = 1;
      state.nitro += dt * (9.5 + selectedCarStats().nitro * 0.45);
      playerCar.flames.forEach((f) => (f.enabled = false));
      camera.camera.fov += (58 - camera.camera.fov) * Math.min(1, dt * 3);
    }

    state.nitro = pc.math.clamp(state.nitro, 0, 100);
    state.roadSpeed = state.baseSpeed * state.boostFactor;
    if (Math.abs(pos.x - targetX) < 0.24) state.laneIndex = state.targetLaneIndex;
  }

  function updateRoad(dt) {
    updateContinuousRoadTrack(dt);
    state.roadPhase += dt * state.roadSpeed * 0.018;

    roadSegments.forEach((seg) => {
      const p = seg.getLocalPosition();
      p.z += state.roadSpeed * dt;
      if (p.z > 54) p.z -= 448;
      p.x = roadCenterAt(p.z);
      p.y = trackCrestAt(p.z) * 0.28;
      seg.setLocalPosition(p);
      seg.setLocalEulerAngles(trackCrestAt(p.z) * -2.6, trackCurveAt(p.z), trackBankAt(p.z));
    });

    roadsideLights.forEach((l) => {
      const p = l.getLocalPosition();
      p.z += state.roadSpeed * dt;
      if (p.z > 28) p.z -= 420;
      p.x = roadCenterAt(p.z) + l.side * 9.4;
      p.y = trackCrestAt(p.z) * 0.24;
      l.setLocalPosition(p);
      l.setLocalEulerAngles(0, trackCurveAt(p.z) * 0.4, 0);
      const pulse = 0.86 + Math.sin(state.elapsed * 8 + p.z) * 0.12;
      l.setLocalScale(pulse, 1, pulse);
    });

    signs.forEach((sign) => {
      const p = sign.getLocalPosition();
      p.z += state.roadSpeed * dt;
      if (p.z > 28) p.z -= 390;
      p.x = roadCenterAt(p.z) + sign.offset;
      p.y = trackCrestAt(p.z) * 0.25;
      sign.setLocalPosition(p);
      sign.setLocalEulerAngles(0, (sign.side > 0 ? -12 : 12) + trackCurveAt(p.z) * 0.35, 0);
    });

    mountains.forEach((m) => {
      const p = m.getLocalPosition();
      p.z += state.roadSpeed * dt * 0.48;
      if (p.z > 34) p.z -= 390;
      p.x = roadCenterAt(p.z) + m.offset;
      p.y = Math.max(0, trackCrestAt(p.z) * 0.2);
      m.setLocalPosition(p);
    });

    scenery.forEach((obj, i) => {
      const p = obj.getLocalPosition();
      p.z += state.roadSpeed * dt * 0.62;
      if (p.z > 30) p.z -= 510;
      p.x = roadCenterAt(p.z) + obj.offset;
      p.y = Math.max(0, trackCrestAt(p.z) * 0.22);
      obj.setLocalPosition(p);
      if (obj.anim === "sway") {
        obj.setLocalEulerAngles(Math.sin(state.elapsed * 1.2 + obj.phase) * 2.2, 0, Math.sin(state.elapsed * 1.4 + i) * 1.4);
      } else if (obj.anim === "pulse") {
        const s = obj.baseScale * (0.96 + Math.sin(state.elapsed * 4 + obj.phase) * 0.06);
        obj.setLocalScale(s, obj.baseScale, s);
      } else if (obj.turnToRoad) {
        obj.setLocalEulerAngles(0, obj.side > 0 ? -90 : 90, 0);
      } else if (obj.turnToRoad) {
        obj.setLocalEulerAngles(0, obj.side > 0 ? -90 : 90, 0);
      }
    });

    // Speed line glows
    for (let i = speedLines.length - 1; i >= 0; i--) {
      const sl = speedLines[i];
      sl.life -= dt;
      sl.entity.setLocalPosition(sl.x, 1.2 + Math.random() * 1.2, sl.z);
      sl.z += state.roadSpeed * dt * 2.6;
      sl.entity.setLocalScale(0.08, 1.6 + Math.random() * 0.4, 1);
      if (sl.z > 16 || sl.life <= 0) {
        sl.entity.enabled = false;
        speedLines.splice(i, 1);
      }
    }
    if (state.mode === "running" && state.boostFactor > 1.1 && speedLines.length < 14) {
      const e = makePlane(root, "speedLine", new pc.Vec3(0.12, 1.9, 1), new pc.Vec3((Math.random()-0.5) * 6, 1.6, -12 - Math.random() * 12), mat.nitro);
      e.setLocalEulerAngles(0, 0, 0);
      registerSpriteTarget(e, "speed", true);
      speedLines.push({ entity: e, x: (Math.random()-0.5) * 6, z: -12 - Math.random() * 12, life: 0.5 });
    }
  }

  function updateSpawns(dt) {
    const spec = LEVELS[state.level] || LEVELS[0];
    state.trafficTimer += dt;
    state.pickupTimer += dt;
    state.hazardTimer += dt;
    state.difficultyTimer += dt;

    const spawnInterval = Math.max(0.34, spec.spawnBase - (state.baseSpeed - spec.baseSpeed) * 0.0125);
    if (state.trafficTimer >= spawnInterval) {
      state.trafficTimer = 0;
      spawnTrafficCar();
      if (state.baseSpeed > spec.baseSpeed + 12 && Math.random() > 0.62) spawnTrafficCar();
    }

    if (state.pickupTimer >= spec.pickupRate) {
      state.pickupTimer = 0;
      if (Math.random() > 0.18) spawnPickup();
    }

    if (state.hazardTimer >= spec.hazardRate) {
      state.hazardTimer = 0;
      if (state.level > 0 && Math.random() > 0.28) spawnHazard();
    }

    if (state.difficultyTimer >= 3.4) {
      state.difficultyTimer = 0;
      state.baseSpeed = Math.min(state.maxBaseSpeed, state.baseSpeed + 1.65 + state.level * 0.08);
    }
  }

  function updateTraffic(dt) {
    const playerPos = playerCar.getLocalPosition();

    for (let i = trafficCars.length - 1; i >= 0; i--) {
      const car = trafficCars[i];
      const p = car.getLocalPosition();
      p.z += (state.roadSpeed - car.baseSpeed) * dt;
      const targetX = laneWorldX(car.laneIndex, p.z);

      if (!car.nextLaneTimer) car.nextLaneTimer = 1.2 + Math.random() * 2.8;
      car.nextLaneTimer -= dt;
      if (car.nextLaneTimer <= 0 && p.z < -20 && Math.random() < car.aiAggression) {
        car.laneIndex = pc.math.clamp(car.laneIndex + (Math.random() > 0.5 ? 1 : -1), 0, 2);
        car.nextLaneTimer = 1.1 + Math.random() * 2.8;
      }

      p.x += (targetX - p.x) * Math.min(1, dt * (3.2 + state.level * 0.28));
      p.y = trackCrestAt(p.z) * 0.22;
      car.setLocalPosition(p);
      car.setLocalEulerAngles(0, 180 + Math.sin(state.elapsed * 3 + p.z) * 1.2, (targetX - p.x) * -4);
      car.wheelSpin += state.roadSpeed * dt * 220;
      car.wheels?.forEach((w) => w.setLocalEulerAngles(90 + car.wheelSpin, 0, 0));
      animateDriverSprite(car, i + car.laneIndex, car.aiAggression > 0.3);

      if (!car.nearMissAwarded && p.z > playerPos.z - 2.8 && p.z < playerPos.z + 4.8) {
        const dx = Math.abs(p.x - playerPos.x);
        if (dx > 2.05 && dx < 3.85) {
          car.nearMissAwarded = true;
          state.nearMissChain += 1;
          const bonus = 120 + state.nearMissChain * 25 + state.level * 30;
          state.score += bonus;
          state.nitro = Math.min(100, state.nitro + 7);
          createPopText(`NEAR MISS +${bonus}`, playerPos.x, 2.6, playerPos.z - 4, "#3be1ff");
          toast(`Near miss chain x${Math.floor(state.nearMissChain)}`);
          audio.sfxNearMiss();
        }
      }

      if (p.z > 24) {
        car.destroy();
        trafficCars.splice(i, 1);
        state.score += 35 + state.level * 8;
        continue;
      }

      if (rectHit(playerPos.x, playerPos.z, 2.18, 4.15, p.x, p.z, 2.16, 4.05)) {
        state.cameraShake = 0.5;
        endGame(false);
        return;
      }
    }
  }

  function updatePickups(dt) {
    const playerPos = playerCar.getLocalPosition();
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pickup = pickups[i];
      const p = pickup.getLocalPosition();
      p.z += state.roadSpeed * dt;
      p.x += (laneWorldX(pickup.laneIndex, p.z) - p.x) * Math.min(1, dt * 6);
      p.y = 1.15 + trackCrestAt(p.z) * 0.22 + Math.sin(state.elapsed * 6 + i) * 0.22;
      pickup.setLocalPosition(p);
      pickup.setLocalEulerAngles(state.elapsed * 50, state.elapsed * 120, state.elapsed * 20);
      pickup.rings?.forEach((r, idx) => r.setLocalScale(1.2 + Math.sin(state.elapsed * 4 + idx) * 0.22, 1.2 + Math.sin(state.elapsed * 4 + idx) * 0.22, 1.2));

      if (p.z > 24) {
        pickup.destroy();
        pickups.splice(i, 1);
        continue;
      }

      if (rectHit(playerPos.x, playerPos.z, 2.0, 3.8, p.x, p.z, 1.45, 1.45)) {
        state.nitro = Math.min(100, state.nitro + 35);
        state.score += 90 + state.level * 20;
        createPopText("NITRO +35", p.x, 2.5, p.z, "#7ffcff");
        audio.sfxPickup();
        pickup.destroy();
        pickups.splice(i, 1);
      }
    }
  }

  function updateHazards(dt) {
    const playerPos = playerCar.getLocalPosition();
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      const p = h.getLocalPosition();
      p.z += state.roadSpeed * dt;
      p.x += (laneWorldX(h.laneIndex, p.z) - p.x) * Math.min(1, dt * 5);
      p.y = 1.1 + trackCrestAt(p.z) * 0.22 + Math.sin(state.elapsed * 8 + i) * 0.08;
      const blink = 0.82 + Math.sin(state.elapsed * 14 + i) * 0.18;
      h.setLocalScale(blink, blink, blink);
      h.setLocalPosition(p);
      h.setLocalEulerAngles(0, Math.sin(state.elapsed * 4 + p.z) * 8, 0);

      if (p.z > 24) {
        h.destroy();
        hazards.splice(i, 1);
        continue;
      }

      if (rectHit(playerPos.x, playerPos.z, 2.05, 3.8, p.x, p.z, 2.7, 0.95)) {
        state.cameraShake = 0.42;
        endGame(false);
        return;
      }
    }
  }

  function updateParticles(dt) {
    const screen = (world) => {
      const v = new pc.Vec3(world.x, world.y, world.z);
      return camera.camera.worldToScreen(v);
    };
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.y += dt * 1.3;
      const sp = screen(p);
      if (!p.el) {
        p.el = document.createElement("div");
        p.el.style.cssText = "position:absolute;z-index:3;pointer-events:none;font:900 15px system-ui;text-shadow:0 0 12px currentColor,0 3px 10px rgba(0,0,0,.7);white-space:nowrap;";
        document.body.appendChild(p.el);
      }
      p.el.textContent = p.text;
      p.el.style.color = p.color;
      p.el.style.opacity = String(Math.max(0, p.life / p.maxLife));
      p.el.style.left = `${sp.x}px`;
      p.el.style.top = `${sp.y}px`;
      p.el.style.transform = "translate(-50%,-50%)";
      if (p.life <= 0) {
        p.el.remove();
        particles.splice(i, 1);
      }
    }
  }

  function updateCamera(dt) {
    const pos = playerCar.getLocalPosition();
    const bendLook = trackCurveAt(-42) * 0.045;
    const crestLift = trackCrestAt(-35) * 0.55;
    const desired = new pc.Vec3(pos.x * 0.55 + bendLook, 4.35 + crestLift, pos.z + 10.2);
    const cp = camera.getLocalPosition();
    cp.lerp(cp, desired, Math.min(1, dt * 5.3));
    if (state.cameraShake > 0) {
      cp.x += (Math.random() - 0.5) * state.cameraShake;
      cp.y += (Math.random() - 0.5) * state.cameraShake * 0.8;
      state.cameraShake = Math.max(0, state.cameraShake - dt * 1.8);
    }
    camera.setLocalPosition(cp);
    camera.lookAt(pos.x * 0.7 + trackCurveAt(-55) * 0.05, 1.15 + trackCrestAt(-55) * 0.4, pos.z - 17);
  }

  function updateGame(dt) {
    state.elapsed += dt;
    updateCountdown(dt);
    updateLevelBanner(dt);
    audio.updateEngine();

    if (state.mode !== "running") {
      updateCamera(dt);
      return;
    }

    handleKeyboard();
    updatePlayer(dt);
    updateRoad(dt);
    updateSpawns(dt);
    updateTraffic(dt);
    updateRivals(dt);
    updatePickups(dt);
    updateHazards(dt);
    updateCourseGates(dt);
    updateParticles(dt);
    updateCamera(dt);

    const distanceStep = state.roadSpeed * dt * 0.92;
    state.distance += distanceStep;
    state.levelDistance += distanceStep;
    updateLapState(distanceStep);
    state.score += dt * state.roadSpeed * (1.75 + (state.boostFactor - 1) * 1.2) + state.level * dt * 14;
    state.nearMissChain = Math.max(0, state.nearMissChain - dt * 0.18);

    if (state.levelDistance >= levelRaceDistance()) {
      advanceLevel();
      return;
    }

    updateHUD();
    postScore(false);
  }

  app.on("update", (dt) => updateGame(Math.min(dt, 1/30)));


  function bindGarageControls() {
    const garageBtn = $("garageBtn");
    const garagePanel = $("garagePanel");
    const garageCloseBtn = $("garageCloseBtn");

    garageBtn?.addEventListener("click", () => {
      refreshGarageUi();
      garagePanel?.classList.remove("hidden");
    });

    garageCloseBtn?.addEventListener("click", () => {
      garagePanel?.classList.add("hidden");
    });

    $("garageCarList")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-car]");
      if (!btn) return;
      selectOrBuyCar(btn.dataset.car);
    });

    $("speedUpgradeBtn")?.addEventListener("click", () => buyUpgrade("speed"));
    $("handlingUpgradeBtn")?.addEventListener("click", () => buyUpgrade("handling"));
    $("nitroUpgradeBtn")?.addEventListener("click", () => buyUpgrade("nitro"));
  }

  bindGarageControls();
  refreshGarageUi();

  camera.setLocalPosition(0, 4.35, 17.8);
  camera.lookAt(0, 1, -8);
  applyLevelTheme(0);
  updateHUD();
  setOverlayState();
})();