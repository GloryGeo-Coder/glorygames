(() => {
  'use strict';

  const GAME_SLUG = 'cyber-shield-academy';
  const BEST_KEY = 'gg_cyber_shield_academy_best_v1';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const ui = {
    scoreValue: document.getElementById('scoreValue'),
    levelValue: document.getElementById('levelValue'),
    livesValue: document.getElementById('livesValue'),
    comboValue: document.getElementById('comboValue'),
    missionText: document.getElementById('missionText'),
    objectiveText: document.getElementById('objectiveText'),
    factText: document.getElementById('factText'),
    progressBar: document.getElementById('progressBar'),
    firewallState: document.getElementById('firewallState'),
    scanState: document.getElementById('scanState'),
    freezeState: document.getElementById('freezeState'),
    startOverlay: document.getElementById('startOverlay'),
    helpOverlay: document.getElementById('helpOverlay'),
    quizOverlay: document.getElementById('quizOverlay'),
    levelOverlay: document.getElementById('levelOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    quizTitle: document.getElementById('quizTitle'),
    quizQuestion: document.getElementById('quizQuestion'),
    quizChoices: document.getElementById('quizChoices'),
    quizFeedback: document.getElementById('quizFeedback'),
    levelTitle: document.getElementById('levelTitle'),
    levelSummary: document.getElementById('levelSummary'),
    rewardText: document.getElementById('rewardText'),
    starRow: document.getElementById('starRow'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverSummary: document.getElementById('gameOverSummary'),
    muteBtn: document.getElementById('muteBtn'),
    pauseBtn: document.getElementById('pauseBtn')
  };

  const spriteDefs = {
    hero: ['./assets/sprites/hero_01.png','./assets/sprites/hero_02.png','./assets/sprites/hero_03.png'],
    shield: ['./assets/sprites/shield_01.png','./assets/sprites/shield_02.png'],
    lock: ['./assets/sprites/lock_01.png','./assets/sprites/lock_02.png'],
    key: ['./assets/sprites/key_01.png','./assets/sprites/key_02.png'],
    update: ['./assets/sprites/update_01.png','./assets/sprites/update_02.png'],
    backup: ['./assets/sprites/backup_01.png','./assets/sprites/backup_02.png'],
    wifi: ['./assets/sprites/wifi_01.png','./assets/sprites/wifi_02.png'],
    bug: ['./assets/sprites/bug_01.png','./assets/sprites/bug_02.png'],
    phishing: ['./assets/sprites/phishing_01.png','./assets/sprites/phishing_02.png'],
    weak_pass: ['./assets/sprites/weak_pass_01.png','./assets/sprites/weak_pass_02.png'],
    tracker: ['./assets/sprites/tracker_01.png','./assets/sprites/tracker_02.png']
  };

  const backgrounds = Array.from({length: 10}, (_, i) => `./assets/backgrounds/level-${String(i+1).padStart(2,'0')}.png`);

  const levels = [
    {
      id: 1,
      title: 'Password Vault',
      mission: 'Collect locks and keys. Avoid weak password traps.',
      fact: 'Strong, unique passwords reduce the chance that one compromised account affects others.',
      target: 10,
      good: ['lock','key','shield'],
      hazard: ['weak_pass','phishing'],
      speed: 168,
      quiz: {
        q: 'Which password habit is safest?',
        options: ['Use a unique strong password', 'Reuse the same password everywhere', 'Use 123456', 'Share passwords in group chats'],
        answer: 'Use a unique strong password',
        explain: 'A unique strong password protects each account separately.'
      }
    },
    {
      id: 2,
      title: 'Phishing Patrol',
      mission: 'Collect shields and locks. Avoid suspicious messages.',
      fact: 'Phishing messages often try to make you click quickly. Pause and verify before trusting links.',
      target: 12,
      good: ['shield','lock','key'],
      hazard: ['phishing','tracker'],
      speed: 180,
      quiz: {
        q: 'What should you do before clicking a suspicious link?',
        options: ['Verify the source first', 'Click quickly', 'Forward it to everyone', 'Enter your password'],
        answer: 'Verify the source first',
        explain: 'Checking the sender and link destination helps avoid phishing.'
      }
    },
    {
      id: 3,
      title: 'Update Rush',
      mission: 'Collect update icons and backups. Avoid bugs.',
      fact: 'Software updates often fix security weaknesses and improve reliability.',
      target: 13,
      good: ['update','backup','shield'],
      hazard: ['bug','weak_pass'],
      speed: 190,
      quiz: {
        q: 'Why are software updates important?',
        options: ['They can fix security weaknesses', 'They make passwords public', 'They remove backups', 'They create phishing emails'],
        answer: 'They can fix security weaknesses',
        explain: 'Updates often include security fixes and stability improvements.'
      }
    },
    {
      id: 4,
      title: 'Privacy Dome',
      mission: 'Collect shields, keys, and secure Wi‑Fi. Avoid trackers.',
      fact: 'Privacy settings help control what information apps and websites can access.',
      target: 14,
      good: ['shield','key','wifi'],
      hazard: ['tracker','phishing'],
      speed: 200,
      quiz: {
        q: 'What is a good privacy habit?',
        options: ['Review app permissions', 'Share private codes online', 'Ignore privacy settings', 'Post personal details everywhere'],
        answer: 'Review app permissions',
        explain: 'Reviewing permissions helps limit unnecessary access to your data.'
      }
    },
    {
      id: 5,
      title: 'Backup Bay',
      mission: 'Collect backups, locks, and updates. Avoid bugs.',
      fact: 'Backups help recover important data after device loss, damage, or account problems.',
      target: 15,
      good: ['backup','lock','update'],
      hazard: ['bug','phishing'],
      speed: 210,
      quiz: {
        q: 'Why are backups useful?',
        options: ['They help recover lost data', 'They weaken accounts', 'They delete all files', 'They replace safe passwords'],
        answer: 'They help recover lost data',
        explain: 'Backups make recovery easier when something goes wrong.'
      }
    },
    {
      id: 6,
      title: 'Firewall Forge',
      mission: 'Collect shields and updates. Avoid malware bugs and fake messages.',
      fact: 'Firewalls and security tools can help block unwanted traffic and suspicious activity.',
      target: 16,
      good: ['shield','update','key'],
      hazard: ['bug','phishing','tracker'],
      speed: 220,
      quiz: {
        q: 'What does a firewall generally help with?',
        options: ['Blocking unwanted network traffic', 'Creating weak passwords', 'Sharing private files', 'Turning off updates'],
        answer: 'Blocking unwanted network traffic',
        explain: 'A firewall can help control network access and reduce unwanted traffic.'
      }
    },
    {
      id: 7,
      title: 'Secure Wi‑Fi',
      mission: 'Collect secure Wi‑Fi and lock icons. Avoid trackers.',
      fact: 'Secure Wi‑Fi and careful network choices help protect your online activity.',
      target: 17,
      good: ['wifi','lock','shield'],
      hazard: ['tracker','weak_pass','phishing'],
      speed: 230,
      quiz: {
        q: 'Which network choice is usually safer?',
        options: ['A trusted secure network', 'An unknown open network', 'Any network with a funny name', 'A random hotspot asking for passwords'],
        answer: 'A trusted secure network',
        explain: 'Trusted secure networks reduce unnecessary risk.'
      }
    },
    {
      id: 8,
      title: 'Data Defense',
      mission: 'Collect backups, keys, and shields. Avoid data trackers.',
      fact: 'Good data habits include protecting sensitive information and sharing only what is necessary.',
      target: 18,
      good: ['backup','key','shield'],
      hazard: ['tracker','bug','phishing'],
      speed: 238,
      quiz: {
        q: 'Which is a good data protection habit?',
        options: ['Share only what is needed', 'Post all private details', 'Send passwords in plain messages', 'Ignore privacy notices'],
        answer: 'Share only what is needed',
        explain: 'Limiting what you share helps protect personal information.'
      }
    },
    {
      id: 9,
      title: 'Incident Response',
      mission: 'Collect backups, updates, and shields. Avoid all threats.',
      fact: 'When something suspicious happens, report it quickly and preserve useful evidence.',
      target: 20,
      good: ['backup','update','shield','lock'],
      hazard: ['bug','phishing','weak_pass','tracker'],
      speed: 248,
      quiz: {
        q: 'What is a good first step after noticing suspicious account activity?',
        options: ['Report it and secure the account', 'Ignore it forever', 'Share the issue publicly with passwords', 'Click more suspicious links'],
        answer: 'Report it and secure the account',
        explain: 'Reporting and securing the account helps limit harm.'
      }
    },
    {
      id: 10,
      title: 'Breach Boss',
      mission: 'Final exam: collect every cyber defense item and survive the toughest wave.',
      fact: 'Cyber defense works best through layered habits: strong passwords, updates, backups, privacy checks, and careful clicking.',
      target: 24,
      good: ['lock','key','shield','update','backup','wifi'],
      hazard: ['bug','phishing','weak_pass','tracker'],
      speed: 262,
      boss: true,
      quiz: {
        q: 'Which answer is the best overall cyber defense approach?',
        options: ['Use layered safe habits', 'Only use one password', 'Ignore updates and backups', 'Trust every message'],
        answer: 'Use layered safe habits',
        explain: 'Cyber safety works best when multiple good habits are used together.'
      }
    }
  ];

  const defaultState = () => ({
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    levelIndex: 0,
    lives: 3,
    combo: 1,
    comboChain: 0,
    collected: 0,
    started: false,
    paused: false,
    muted: false,
    levelComplete: false,
    gameOver: false,
    firewall: 1,
    scan: 1,
    freeze: 1,
    firewallActive: false,
    firewallTimer: 0,
    freezeTimer: 0,
    items: [],
    particles: [],
    floats: [],
    stars: 3,
    time: 0
  });

  let state = defaultState();
  const images = {};
  let last = performance.now();
  let lastLiveScore = -1;
  let lastLiveAt = 0;
  let dragActive = false;
  let dragOffsetX = 0;

  const player = { x: 0, y: 0, w: 112, h: 112, bob: 0 };

  function playerBottomOffset() {
    const h = getH();
    // Keep the player comfortably above the footer/controls on large screens,
    // while preserving enough play space on small mobile screens.
    return h >= 760 ? 240 : h >= 620 ? 210 : 158;
  }

  function updatePlayerFloor() {
    player.y = Math.max(118, getH() - playerBottomOffset());
    player.x = clamp(player.x, 16, getW() - player.w - 16);
  }

  function allImages() {
    const sprites = [];
    Object.values(spriteDefs).forEach(frames => sprites.push(...frames));
    return [...sprites, ...backgrounds];
  }

  function loadImages() {
    return Promise.all(allImages().map(src => new Promise(resolve => {
      const img = new Image();
      images[src] = img;
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    })));
  }

  function currentLevel() { return levels[Math.min(state.levelIndex, levels.length - 1)]; }
  function getW() { return canvas.getBoundingClientRect().width || 960; }
  function getH() { return canvas.getBoundingClientRect().height || 540; }
  function rand(a,b) { return a + Math.random() * (b-a); }
  function pick(arr) { return arr[(Math.random()*arr.length)|0]; }
  function clamp(v,a,b) { return Math.max(a, Math.min(b, v)); }

  // Audio
  let AC = null, master = null, musicInt = null, musicStep = 0;
  function ensureAudio() {
    if (state.muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.11;
      master.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  }
  function tone(freq, dur = 0.08, type = 'sine', gain = 0.04, delay = 0) {
    const ac = ensureAudio();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  function sfx(type) {
    if (type === 'good') { tone(620,.05,'triangle',.05); tone(940,.08,'sine',.035,.05); }
    if (type === 'bad') tone(170,.12,'sawtooth',.045);
    if (type === 'power') { tone(470,.06,'triangle',.05); tone(760,.09,'sine',.04,.05); }
    if (type === 'level') { tone(392,.06,'triangle',.05); tone(554,.08,'triangle',.04,.06); tone(784,.1,'sine',.03,.13); }
    if (type === 'move') tone(520,.03,'sine',.025);
  }
  function musicTick() {
    if (!state.started || state.paused || state.levelComplete || state.gameOver || state.muted) return;
    const notes = [196,247,294,330,392,330,294,247];
    const n = notes[musicStep++ % notes.length];
    tone(n,.08,'triangle',.008);
    if (musicStep % 2 === 0) tone(n/2,.12,'sine',.006);
  }
  function startMusic() { if (!musicInt && !state.muted) musicInt = setInterval(musicTick, 260); }
  function stopMusic() { if (musicInt) clearInterval(musicInt); musicInt = null; }

  function spriteFrame(kind, speed = 170) {
    const frames = spriteDefs[kind];
    if (!frames) return null;
    const idx = Math.floor((performance.now() / speed) % frames.length);
    return images[frames[idx]];
  }

  function syncUI() {
    const lv = currentLevel();
    ui.scoreValue.textContent = Math.floor(state.score);
    ui.levelValue.textContent = lv.id;
    ui.livesValue.textContent = state.lives;
    ui.comboValue.textContent = `x${state.combo}`;
    ui.missionText.textContent = lv.mission;
    ui.objectiveText.textContent = `${state.collected} / ${lv.target}`;
    ui.factText.textContent = lv.fact;
    ui.progressBar.style.width = `${Math.min(100, state.collected / lv.target * 100)}%`;
    ui.firewallState.textContent = `Firewall: ${state.firewall}${state.firewallActive ? ' (ON)' : ''}`;
    ui.scanState.textContent = `Scan: ${state.scan}`;
    ui.freezeState.textContent = `Freeze: ${state.freeze}${state.freezeTimer > 0 ? ' (ON)' : ''}`;
    ui.muteBtn.textContent = state.muted ? 'Sound Off' : 'Sound On';
    ui.pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
  }

  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 150) return;
    lastLiveScore = clean;
    lastLiveAt = now;
    const payload = {
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score: clean,
      best: Math.max(state.best, clean),
      level: currentLevel().id,
      mode
    };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type:'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type:'gg:score', ...payload, payload }, '*'); } catch {}
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    player.x = clamp(player.x || (rect.width - player.w) / 2, 16, getW() - player.w - 16);
    updatePlayerFloor();
  }

  function startGame() {
    state = defaultState();
    state.started = true;
    state.levelIndex = 0;
    state.best = Number(localStorage.getItem(BEST_KEY) || '0') || 0;
    loadLevel(0, true);
    ui.startOverlay.classList.remove('active');
    ui.gameOverOverlay.classList.remove('active');
    ui.levelOverlay.classList.remove('active');
    ui.quizOverlay.classList.remove('active');
    startMusic();
  }

  function loadLevel(index, fresh = false) {
    state.levelIndex = clamp(index, 0, levels.length - 1);
    state.levelComplete = false;
    state.gameOver = false;
    state.paused = false;
    state.items = [];
    state.particles = [];
    state.floats = [];
    state.combo = 1;
    state.comboChain = 0;
    state.collected = 0;
    state.firewall = 1;
    state.scan = 1;
    state.freeze = 1;
    state.firewallActive = false;
    state.firewallTimer = 0;
    state.freezeTimer = 0;
    if (fresh) state.lives = 3;
    syncUI();
  }

  function spawnItem() {
    const lv = currentLevel();
    const hazardChance = lv.boss ? 0.38 : 0.25 + state.levelIndex * 0.008;
    const isHazard = Math.random() < hazardChance;
    const kind = isHazard ? pick(lv.hazard) : pick(lv.good);
    const size = rand(62, 88);
    state.items.push({
      kind,
      good: !isHazard,
      x: rand(40, getW() - 90),
      y: -90,
      w: size,
      h: size,
      vy: rand(lv.speed, lv.speed + 90) * (state.freezeTimer > 0 ? 0.45 : 1),
      drift: rand(-18, 18),
      rot: rand(-0.3, 0.3),
      vr: rand(-0.8, 0.8),
      pulse: rand(0, Math.PI * 2),
      scanned: false
    });
  }

  function addParticles(x,y,color,n=18) {
    for (let i=0;i<n;i++) {
      const a = Math.random()*Math.PI*2;
      const s = rand(40,160);
      state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.45,.9),ttl:.9,size:rand(3,8),color});
    }
  }
  function addFloat(x,y,text,color='#fff') {
    state.floats.push({x,y,text,color,life:1,ttl:1});
  }

  function movePlayer(delta) {
    if (!state.started || state.paused) return;
    player.x = clamp(player.x + delta, 16, getW() - player.w - 16);
    sfx('move');
  }

  function activateFirewall() {
    if (state.firewall <= 0 || state.firewallActive || !state.started || state.paused || state.levelComplete || state.gameOver) return;
    state.firewall--;
    state.firewallActive = true;
    state.firewallTimer = 7;
    sfx('power');
    addFloat(getW()/2, getH()*.3, 'Firewall Active', '#d4fff0');
    syncUI();
  }

  function activateScan() {
    if (state.scan <= 0 || !state.started || state.paused || state.levelComplete || state.gameOver) return;
    state.scan--;
    sfx('power');
    let converted = 0;
    state.items.forEach(item => {
      item.scanned = true;
      if (!item.good && converted < 2) {
        item.vy *= 0.45;
        converted++;
      }
    });
    addParticles(getW()/2, getH()/2, '#55eaff', 35);
    addFloat(getW()/2, getH()*.3, 'Threats Scanned', '#d9fbff');
    syncUI();
  }

  function activateFreeze() {
    if (state.freeze <= 0 || state.freezeTimer > 0 || !state.started || state.paused || state.levelComplete || state.gameOver) return;
    state.freeze--;
    state.freezeTimer = 5;
    sfx('power');
    addFloat(getW()/2, getH()*.3, 'Threats Slowed', '#fff1b6');
    syncUI();
  }

  function intersects(a,b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function collectItem(item, idx) {
    if (item.good) {
      state.collected++;
      state.comboChain++;
      state.combo = Math.min(10, 1 + Math.floor(state.comboChain / 3));
      const gain = 80 * state.combo;
      state.score += gain;
      addFloat(item.x, item.y - 12, `+${gain}`, '#d9ffef');
      addParticles(item.x + item.w/2, item.y + item.h/2, '#5dffbd', 18);
      sfx('good');
      if (currentLevel().boss && state.collected % 6 === 0) {
        state.score += 150;
        addFloat(getW()/2, 92, 'Breach Boss weakened!', '#ffe79d');
      }
      if (state.collected >= currentLevel().target) openQuiz();
    } else {
      state.comboChain = 0;
      state.combo = 1;
      if (state.firewallActive) {
        state.firewallActive = false;
        state.firewallTimer = 0;
        addFloat(item.x, item.y - 10, 'Firewall blocked!', '#fff0af');
        addParticles(item.x + item.w/2, item.y + item.h/2, '#ffd36b', 18);
        sfx('power');
      } else {
        state.lives--;
        state.score = Math.max(0, state.score - 80);
        addFloat(item.x, item.y - 10, 'Threat hit! -1 life', '#ffc0ca');
        addParticles(item.x + item.w/2, item.y + item.h/2, '#ff6478', 22);
        sfx('bad');
        if (state.lives <= 0) gameOver(false);
      }
    }
    state.items.splice(idx, 1);
    syncUI();
    postScore('live');
  }

  function openQuiz() {
    state.levelComplete = true;
    state.paused = true;
    stopMusic();
    const lv = currentLevel();
    ui.quizTitle.textContent = `${lv.title} Debrief`;
    ui.quizQuestion.textContent = lv.quiz.q;
    ui.quizFeedback.textContent = '';
    ui.quizChoices.innerHTML = '';
    lv.quiz.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => answerQuiz(btn, opt));
      ui.quizChoices.appendChild(btn);
    });
    ui.quizOverlay.classList.add('active');
  }

  function answerQuiz(btn, opt) {
    const lv = currentLevel();
    const correct = opt === lv.quiz.answer;
    [...ui.quizChoices.children].forEach(b => {
      b.disabled = true;
      if (b.textContent === lv.quiz.answer) b.classList.add('correct');
      if (b === btn && !correct) b.classList.add('wrong');
    });
    ui.quizFeedback.textContent = lv.quiz.explain;
    const bonus = correct ? 350 : 160;
    state.score += bonus;
    setTimeout(() => {
      ui.quizOverlay.classList.remove('active');
      completeLevel(bonus, correct);
    }, 1300);
  }

  function completeLevel(quizBonus=0, quizCorrect=true) {
    const bonus = 300 + state.lives * 120 + state.combo * 50 + quizBonus;
    state.score += bonus;
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(BEST_KEY, String(Math.floor(state.best)));
    state.stars = state.lives === 3 && quizCorrect ? 3 : state.lives >= 2 ? 2 : 1;
    ui.levelTitle.textContent = `${currentLevel().title} Complete`;
    ui.levelSummary.textContent = currentLevel().boss
      ? 'You passed the final Breach Boss defensive training mission.'
      : 'You cleared the mission and unlocked the next defensive skill.';
    ui.rewardText.textContent = `Bonus +${bonus} • Best ${Math.floor(state.best)}`;
    ui.starRow.textContent = '★ '.repeat(state.stars).trim();
    ui.levelOverlay.classList.add('active');
    sfx('level');
    postScore('level_complete');
  }

  function nextLevel() {
    ui.levelOverlay.classList.remove('active');
    if (state.levelIndex >= levels.length - 1) {
      gameOver(true);
      return;
    }
    loadLevel(state.levelIndex + 1);
    state.paused = false;
    startMusic();
  }

  function replayLevel() {
    ui.levelOverlay.classList.remove('active');
    loadLevel(state.levelIndex);
    state.paused = false;
    startMusic();
  }

  function gameOver(win) {
    state.gameOver = true;
    state.paused = true;
    stopMusic();
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(BEST_KEY, String(Math.floor(state.best)));
    ui.gameOverTitle.textContent = win ? 'Academy Cleared!' : 'Training Failed';
    ui.gameOverSummary.textContent = win
      ? `Excellent defensive work. Final score: ${Math.floor(state.score)}`
      : `Final score: ${Math.floor(state.score)}. Try again and strengthen your cyber defense habits.`;
    ui.gameOverOverlay.classList.add('active');
    postScore(win ? 'game_won' : 'game_over');
  }

  function update(dt) {
    updatePlayerFloor();
    if (!state.started || state.paused || state.gameOver) return;
    const lv = currentLevel();
    state.time += dt;
    player.bob += dt * 7;

    if (Math.random() < (lv.boss ? 0.038 : 0.028) + state.levelIndex * 0.003) spawnItem();

    if (state.firewallTimer > 0) {
      state.firewallTimer -= dt;
      if (state.firewallTimer <= 0) {
        state.firewallActive = false;
        state.firewallTimer = 0;
      }
    }
    if (state.freezeTimer > 0) state.freezeTimer = Math.max(0, state.freezeTimer - dt);

    for (let i=state.items.length-1;i>=0;i--) {
      const item = state.items[i];
      const speedFactor = state.freezeTimer > 0 ? 0.46 : 1;
      item.y += item.vy * dt * speedFactor;
      item.x += Math.sin(item.y * 0.015 + item.pulse) * item.drift * dt;
      item.rot += item.vr * dt;

      if (item.scanned && !item.good) {
        item.x += Math.sin(state.time * 8) * 0.8;
      }

      if (intersects(item, player)) {
        collectItem(item, i);
        continue;
      }
      if (item.y > getH() + 120) state.items.splice(i, 1);
    }

    state.particles.forEach(p => {
      p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= .985; p.vy *= .985;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    state.floats.forEach(f => { f.life -= dt; f.y -= 44*dt; });
    state.floats = state.floats.filter(f => f.life > 0);
    syncUI();
  }

  function drawBackground() {
    const w = getW(), h = getH();
    const bg = images[backgrounds[state.levelIndex]];
    if (bg && bg.width) {
      const ratio = Math.max(w/bg.width, h/bg.height);
      const dw = bg.width * ratio, dh = bg.height * ratio;
      ctx.drawImage(bg, (w-dw)/2, (h-dh)/2, dw, dh);
    } else {
      ctx.fillStyle = '#07111f';
      ctx.fillRect(0,0,w,h);
    }
    const grd = ctx.createLinearGradient(0,0,0,h);
    grd.addColorStop(0,'rgba(255,255,255,.02)');
    grd.addColorStop(1,'rgba(0,0,0,.28)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);
  }

  function drawItems() {
    state.items.forEach(item => {
      const img = spriteFrame(item.kind, item.good ? 175 : 210);
      const pulse = 1 + Math.sin(item.pulse + performance.now()*0.004) * 0.06;
      const w = item.w * pulse, h = item.h * pulse;
      ctx.save();
      ctx.translate(item.x + item.w/2, item.y + item.h/2);
      ctx.rotate(item.rot);
      ctx.shadowColor = item.good ? '#5dffbd' : '#ff6478';
      ctx.shadowBlur = item.good ? 18 : 20;
      if (img && img.width) ctx.drawImage(img, -w/2, -h/2, w, h);
      else {
        ctx.fillStyle = item.good ? '#5dffbd' : '#ff6478';
        ctx.beginPath(); ctx.arc(0,0,w/2,0,Math.PI*2); ctx.fill();
      }
      if (item.scanned && !item.good) {
        ctx.strokeStyle = 'rgba(255,211,107,.9)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0,0,w*.58,0,Math.PI*2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawHero() {
    const img = spriteFrame('hero', 160);
    const bobY = Math.sin(player.bob) * 4;
    ctx.save();
    if (state.firewallActive) {
      ctx.beginPath();
      ctx.arc(player.x + player.w/2, player.y + player.h/2 + bobY, 72 + Math.sin(player.bob*1.5)*4, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(93,255,189,.88)';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#5dffbd';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    if (img && img.width) ctx.drawImage(img, player.x, player.y + bobY, player.w, player.h);
    else {
      ctx.fillStyle = '#55eaff';
      ctx.beginPath(); ctx.arc(player.x + player.w/2, player.y + player.h/2, 44, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawEffects() {
    state.particles.forEach(p => {
      const a = p.life / p.ttl;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    });
    state.floats.forEach(f => {
      ctx.save();
      ctx.globalAlpha = f.life / f.ttl;
      ctx.fillStyle = f.color;
      ctx.font = '900 22px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    });
  }

  function drawCanvasHud() {
    const w = getW();
    ctx.save();
    ctx.fillStyle = 'rgba(6,12,22,.48)';
    ctx.strokeStyle = 'rgba(235,255,255,.12)';
    roundRect(16,16,w-32,62,18);
    ctx.fill(); ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f4feff';
    ctx.font = '900 20px Inter, system-ui, sans-serif';
    ctx.fillText(currentLevel().title, 32, 44);
    ctx.font = '700 14px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(224,240,248,.82)';
    ctx.fillText(`Best ${Math.floor(Math.max(state.best, state.score))}`, 32, 64);
    ctx.textAlign = 'right';
    ctx.font = '900 18px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#ffd36b';
    ctx.fillText(`Target ${state.collected}/${currentLevel().target}`, w-28, 44);
    ctx.fillStyle = '#dfffea';
    ctx.fillText(`Combo x${state.combo}`, w-28, 66);
    ctx.restore();
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

  function draw() {
    ctx.clearRect(0,0,getW(),getH());
    drawBackground();
    drawItems();
    drawHero();
    drawEffects();
    drawCanvasHud();
  }

  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now-last)/1000));
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function bindEvents() {
    document.getElementById('playBtn').addEventListener('click', startGame);
    document.getElementById('howBtn').addEventListener('click', () => ui.helpOverlay.classList.add('active'));
    document.getElementById('closeHelpBtn').addEventListener('click', () => ui.helpOverlay.classList.remove('active'));
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    document.getElementById('replayBtn').addEventListener('click', replayLevel);
    document.getElementById('restartBtn').addEventListener('click', () => {
      ui.gameOverOverlay.classList.remove('active');
      startGame();
    });

    document.getElementById('leftBtn').addEventListener('click', () => movePlayer(-78));
    document.getElementById('rightBtn').addEventListener('click', () => movePlayer(78));
    document.getElementById('firewallBtn').addEventListener('click', activateFirewall);
    document.getElementById('scanBtn').addEventListener('click', activateScan);
    document.getElementById('freezeBtn').addEventListener('click', activateFreeze);
    document.getElementById('submitScoreBtn').addEventListener('click', () => postScore('manual_submit'));

    ui.muteBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      if (state.muted) stopMusic(); else startMusic();
      syncUI();
    });
    ui.pauseBtn.addEventListener('click', () => {
      state.paused = !state.paused;
      if (state.paused) stopMusic(); else startMusic();
      syncUI();
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') movePlayer(-58);
      if (e.key === 'ArrowRight') movePlayer(58);
      if (e.key.toLowerCase() === 'f') activateFirewall();
      if (e.key.toLowerCase() === 's') activateScan();
      if (e.key.toLowerCase() === 'z') activateFreeze();
    });

    canvas.addEventListener('pointerdown', e => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= player.x && x <= player.x + player.w && y >= player.y && y <= player.y + player.h) {
        dragActive = true;
        dragOffsetX = x - player.x;
      }
    });
    canvas.addEventListener('pointermove', e => {
      if (!dragActive) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      player.x = clamp(x - dragOffsetX, 16, getW() - player.w - 16);
    });
    canvas.addEventListener('pointerup', () => dragActive = false);
    canvas.addEventListener('pointercancel', () => dragActive = false);

    let swipeStartX = null;
    canvas.addEventListener('touchstart', e => {
      if (e.touches && e.touches[0]) swipeStartX = e.touches[0].clientX;
    }, {passive:true});
    canvas.addEventListener('touchend', e => {
      if (swipeStartX == null || !e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - swipeStartX;
      if (Math.abs(dx) > 25) movePlayer(dx > 0 ? 78 : -78);
      swipeStartX = null;
    }, {passive:true});

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('message', ev => {
      const data = ev.data || {};
      const type = data.type || data.event;
      if (type === 'GG_PAUSE') {
        state.paused = !!(data.payload?.paused ?? data.paused);
        if (state.paused) stopMusic(); else startMusic();
        syncUI();
      }
      if (type === 'GG_RESTART') startGame();
      if (type === 'GG_MUTE') {
        state.muted = !!(data.payload?.muted ?? data.muted);
        if (state.muted) stopMusic(); else startMusic();
        syncUI();
      }
    });
  }

  loadImages().then(() => {
    bindEvents();
    resizeCanvas();
    syncUI();
    requestAnimationFrame(loop);
  });
})();