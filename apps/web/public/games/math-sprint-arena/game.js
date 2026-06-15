(() => {
  'use strict';

  const GAME_SLUG = 'math-sprint-arena';
  const BEST_KEY = 'wga_math_sprint_arena_v3_best';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const ui = {
    score: document.getElementById('scoreValue'),
    level: document.getElementById('levelValue'),
    xp: document.getElementById('xpValue'),
    streak: document.getElementById('streakValue'),
    lives: document.getElementById('livesValue'),
    worldBadge: document.getElementById('worldBadge'),
    missionTitle: document.getElementById('missionTitle'),
    missionText: document.getElementById('missionText'),
    worldProgress: document.getElementById('worldProgress'),
    worldProgressText: document.getElementById('worldProgressText'),
    curriculumText: document.getElementById('curriculumText'),
    difficultyText: document.getElementById('difficultyText'),
    lessonText: document.getElementById('lessonText'),
    coinValue: document.getElementById('coinValue'),
    gemValue: document.getElementById('gemValue'),
    starValue: document.getElementById('starValue'),
    gateCount: document.getElementById('gateCount'),
    gateList: document.getElementById('gateList'),
    questionPop: document.getElementById('questionPop'),
    questionTopic: document.getElementById('questionTopic'),
    questionText: document.getElementById('questionText'),
    timerText: document.getElementById('timerText'),
    toast: document.getElementById('toast'),
    answerPad: document.getElementById('answerPad'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayText: document.getElementById('overlayText'),
    startBtn: document.getElementById('startBtn'),
    howBtn: document.getElementById('howBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    hintBtn: document.getElementById('hintBtn'),
    skipBtn: document.getElementById('skipBtn'),
    submitBtn: document.getElementById('submitBtn'),
    restartBtn: document.getElementById('restartBtn'),
    muteBtn: document.getElementById('muteBtn')
  };

  const WORLDS = [
    {
      key: 'arithmetic',
      name: 'Arithmetic',
      range: '1–10',
      color: '#52f47f',
      icon: '+−',
      levels: 10,
      story: 'Power the first Number Gate by mastering addition and subtraction.',
      lesson: 'Addition, subtraction, number bonds and quick mental maths.'
    },
    {
      key: 'fractions',
      name: 'Fractions',
      range: '11–20',
      color: '#b85cff',
      icon: '¾',
      levels: 10,
      story: 'Repair the Fraction Bridge by comparing and simplifying parts of a whole.',
      lesson: 'Fractions, equivalent values and simple fraction operations.'
    },
    {
      key: 'multiplication',
      name: 'Multiplication',
      range: '21–30',
      color: '#ff4ea3',
      icon: '×',
      levels: 10,
      story: 'Charge the Times Tower by solving products, factors and division links.',
      lesson: 'Times tables, division facts, factors, multiples and order of operations.'
    },
    {
      key: 'geometry',
      name: 'Geometry',
      range: '31–40',
      color: '#42e6ff',
      icon: '△',
      levels: 10,
      story: 'Unlock the Shape Gate through angles, area, perimeter and patterns.',
      lesson: 'Shapes, angles, perimeter, area, symmetry and coordinate thinking.'
    },
    {
      key: 'algebra',
      name: 'Algebra',
      range: '41+',
      color: '#ffd650',
      icon: 'x',
      levels: 12,
      story: 'Enter the Champion Gate and solve for unknowns to restore the arena.',
      lesson: 'Patterns, equations, expressions, inequalities and mixed challenges.'
    }
  ];

  const LEVEL_COUNT = WORLDS.reduce((sum, w) => sum + w.levels, 0);

  const ASSETS = {
    backgrounds: {
      arithmetic: './assets/backgrounds/bg-arithmetic.png',
      fractions: './assets/backgrounds/bg-fractions.png',
      multiplication: './assets/backgrounds/bg-multiplication.png',
      geometry: './assets/backgrounds/bg-geometry.png',
      algebra: './assets/backgrounds/bg-algebra.png'
    },
    player: {
      idle: './assets/sprites/player/player-idle.png',
      run1: './assets/sprites/player/player-run-1.png',
      run2: './assets/sprites/player/player-run-2.png',
      jump: './assets/sprites/player/player-jump.png',
      slide: './assets/sprites/player/player-slide.png',
      celebrate: './assets/sprites/player/player-celebrate.png',
      think: './assets/sprites/player/player-think.png',
      point: './assets/sprites/player/player-point.png'
    },
    bot: {
      idle: './assets/sprites/bot/bot-idle.png',
      wave: './assets/sprites/bot/bot-wave.png',
      teach: './assets/sprites/bot/bot-teach.png',
      point: './assets/sprites/bot/bot-point.png',
      alert: './assets/sprites/bot/bot-alert.png',
      celebrate: './assets/sprites/bot/bot-celebrate.png',
      sleep: './assets/sprites/bot/bot-sleep.png',
      boost: './assets/sprites/bot/bot-boost.png'
    },
    items: {
      coin: './assets/items/coin-pi.png',
      gem: './assets/items/gem-blue.png',
      star: './assets/items/star-gold.png',
      energy: './assets/items/power-energy.png',
      medal: './assets/items/medal-star.png',
      trophy: './assets/items/trophy-gold.png',
      orb: './assets/items/orb-cosmic.png',
      shield: './assets/items/shield-puzzle.png'
    },
    sheets: {
      platforms: './assets/platforms/platforms-and-gates-sheet.png',
      obstacles: './assets/obstacles/math-obstacles-sheet.png'
    }
  };

  const images = {};

  function loadGameAssets() {
    const paths = new Set();
    Object.values(ASSETS.backgrounds).forEach(p => paths.add(p));
    Object.values(ASSETS.player).forEach(p => paths.add(p));
    Object.values(ASSETS.bot).forEach(p => paths.add(p));
    Object.values(ASSETS.items).forEach(p => paths.add(p));
    Object.values(ASSETS.sheets).forEach(p => paths.add(p));

    return Promise.all([...paths].map(src => new Promise(resolve => {
      const img = new Image();
      images[src] = img;
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    })));
  }

  function drawCoverImage(img, w, h, alpha = 1) {
    if (!img || !img.naturalWidth) return false;
    const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * ratio;
    const dh = img.naturalHeight * ratio;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.restore();
    return true;
  }

  function drawAsset(src, x, y, w, h, alpha = 1) {
    const img = images[src];
    if (!img || !img.naturalWidth) return false;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    return true;
  }


  const state = {
    started: false,
    paused: false,
    muted: false,
    level: 1,
    round: 0,
    score: 0,
    xp: 0,
    streak: 0,
    lives: 3,
    coins: 0,
    gems: 0,
    stars: 0,
    best: Number(localStorage.getItem(BEST_KEY) || 0),
    question: null,
    options: [],
    timeLeft: 20,
    maxTime: 20,
    answered: false,
    particles: [],
    pickups: [],
    lanes: [],
    playerLane: 1,
    playerX: 0,
    playerY: 0,
    playerBob: 0,
    botBob: 0,
    time: 0,
    worldUnlocked: 0,
    levelResults: {},
    comboFlash: 0
  };

  let last = performance.now();
  let AC = null;
  let master = null;
  let musicTimer = null;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getWorldByLevel(level = state.level) {
    let start = 1;
    for (let i = 0; i < WORLDS.length; i++) {
      const end = start + WORLDS[i].levels - 1;
      if (level >= start && level <= end) return { ...WORLDS[i], index: i, localLevel: level - start + 1, start, end };
      start = end + 1;
    }
    const lastWorld = WORLDS[WORLDS.length - 1];
    return { ...lastWorld, index: WORLDS.length - 1, localLevel: lastWorld.levels, start: LEVEL_COUNT - lastWorld.levels + 1, end: LEVEL_COUNT };
  }

  function difficultyName() {
    const level = state.level;
    if (level <= 10) return 'Rookie';
    if (level <= 20) return 'Explorer';
    if (level <= 30) return 'Sprinter';
    if (level <= 40) return 'Strategist';
    return 'Champion';
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildLanes();
  }

  function getW() { return canvas.getBoundingClientRect().width || 900; }
  function getH() { return canvas.getBoundingClientRect().height || 540; }

  function buildLanes() {
    const w = getW();
    const h = getH();
    const baseY = h * 0.78;
    state.lanes = [
      { x: w * 0.24, y: baseY + 12, scale: 0.84 },
      { x: w * 0.50, y: baseY - 16, scale: 1.00 },
      { x: w * 0.76, y: baseY + 12, scale: 0.84 }
    ];
    const lane = state.lanes[state.playerLane] || state.lanes[1];
    state.playerX = lane.x;
    state.playerY = lane.y - 78;
  }

  function generateQuestion() {
    const world = getWorldByLevel();
    const local = world.localLevel;
    const level = state.level;
    let q, answer, topic = world.name, explanation = '';

    if (world.key === 'arithmetic') {
      const max = 8 + local * 3;
      if (local <= 3) {
        const a = randInt(1, max);
        const b = randInt(1, max);
        q = `${a} + ${b}`;
        answer = a + b;
        explanation = `Addition combines ${a} and ${b}.`;
      } else if (local <= 6) {
        const a = randInt(10, max + 12);
        const b = randInt(1, Math.min(a - 1, max));
        q = `${a} − ${b}`;
        answer = a - b;
        explanation = `Subtraction finds the difference between ${a} and ${b}.`;
      } else {
        const a = randInt(6, max);
        const b = randInt(4, max);
        const c = randInt(2, 12);
        q = `${a} + ${b} − ${c}`;
        answer = a + b - c;
        explanation = `Work left to right: ${a}+${b}=${a+b}, then subtract ${c}.`;
      }
    }

    if (world.key === 'fractions') {
      const pairs = [
        ['1/2', 0.5], ['1/3', 1/3], ['2/3', 2/3], ['1/4', 0.25], ['3/4', 0.75],
        ['1/5', 0.2], ['2/5', 0.4], ['4/5', 0.8], ['1/10', 0.1], ['7/10', 0.7]
      ];
      if (local <= 4) {
        const [f, val] = pairs[randInt(0, Math.min(5, pairs.length - 1))];
        q = `Which is equal to ${f}?`;
        answer = val;
        topic = 'Fractions';
        explanation = `${f} can be written as ${val}.`;
      } else if (local <= 7) {
        const a = randInt(1, 5);
        const b = [2, 3, 4, 5, 6, 8, 10][randInt(0, 6)];
        const mult = randInt(2, 4);
        q = `${a}/${b} = ?/${b * mult}`;
        answer = a * mult;
        explanation = `Multiply numerator and denominator by ${mult}.`;
      } else {
        const denom = [4, 5, 6, 8, 10][randInt(0, 4)];
        const a = randInt(1, denom - 2);
        const b = randInt(1, denom - a);
        q = `${a}/${denom} + ${b}/${denom}`;
        answer = `${a + b}/${denom}`;
        explanation = `Same denominator: add numerators ${a}+${b}.`;
      }
    }

    if (world.key === 'multiplication') {
      if (local <= 5) {
        const a = randInt(2, 12);
        const b = randInt(2, Math.min(12, 4 + local * 2));
        q = `${a} × ${b}`;
        answer = a * b;
        explanation = `${a} groups of ${b} equals ${answer}.`;
      } else if (local <= 8) {
        const b = randInt(2, 12);
        const answerBase = randInt(2, 12);
        const a = b * answerBase;
        q = `${a} ÷ ${b}`;
        answer = answerBase;
        explanation = `Division asks how many ${b}s fit into ${a}.`;
      } else {
        const a = randInt(2, 10);
        const b = randInt(2, 10);
        const c = randInt(2, 9);
        q = `${a} × ${b} + ${c}`;
        answer = a * b + c;
        explanation = `Order of operations: multiply first, then add.`;
      }
    }

    if (world.key === 'geometry') {
      const shapes = [
        ['triangle sides', 3],
        ['square sides', 4],
        ['pentagon sides', 5],
        ['hexagon sides', 6],
        ['octagon sides', 8]
      ];
      if (local <= 3) {
        const [name, sides] = shapes[randInt(0, shapes.length - 1)];
        q = `How many ${name}?`;
        answer = sides;
        explanation = `A ${name.split(' ')[0]} has ${sides} sides.`;
      } else if (local <= 6) {
        const l = randInt(3, 14);
        const w = randInt(2, 10);
        q = `Area: ${l} × ${w}`;
        answer = l * w;
        explanation = `Rectangle area is length × width.`;
      } else if (local <= 9) {
        const l = randInt(3, 15);
        const w = randInt(2, 12);
        q = `Perimeter: ${l}, ${w}`;
        answer = 2 * (l + w);
        explanation = `Rectangle perimeter is 2 × (${l}+${w}).`;
      } else {
        const a = randInt(20, 80);
        q = `Triangle angles: ${a}° + ? + ${100-a}° = 180°`;
        answer = 80;
        explanation = `Angles in a triangle add to 180°.`;
      }
    }

    if (world.key === 'algebra') {
      if (local <= 4) {
        const x = randInt(2, 16);
        const b = randInt(3, 20);
        q = `x + ${b} = ${x + b}`;
        answer = x;
        explanation = `Subtract ${b} from both sides.`;
      } else if (local <= 8) {
        const x = randInt(2, 12);
        const a = randInt(2, 9);
        q = `${a}x = ${a * x}`;
        answer = x;
        explanation = `Divide both sides by ${a}.`;
      } else {
        const x = randInt(2, 12);
        const a = randInt(2, 6);
        const b = randInt(1, 15);
        q = `${a}x + ${b} = ${a * x + b}`;
        answer = x;
        explanation = `Subtract ${b}, then divide by ${a}.`;
      }
    }

    const options = makeOptions(answer, world.key);
    state.question = { text: q, answer, topic, explanation };
    state.options = options;
    state.maxTime = Math.max(8, 22 - Math.floor(level / 4));
    state.timeLeft = state.maxTime;
    state.answered = false;
    spawnPickups();
    renderAnswers();
  }

  function makeOptions(answer, type) {
    if (typeof answer === 'string') {
      const [n, d] = answer.split('/').map(Number);
      const wrong = new Set([`${n+1}/${d}`, `${Math.max(1,n-1)}/${d}`, `${n}/${d+1}`, `${n+2}/${d}`]);
      return shuffle([answer, ...[...wrong].filter(x => x !== answer).slice(0, 3)]);
    }
    if (type === 'fractions' && answer < 1) {
      const options = new Set([answer]);
      [0.1,0.2,0.25,0.3,0.4,0.5,0.6,0.7,0.75,0.8,0.9].forEach(v => {
        if (options.size < 4 && Math.abs(v-answer) > 0.001) options.add(v);
      });
      return shuffle([...options]).map(v => Number.isInteger(v) ? v : String(v));
    }
    const options = new Set([answer]);
    const deltas = [-12,-10,-8,-5,-3,-2,-1,1,2,3,4,5,8,10,12];
    while (options.size < 4) {
      const v = answer + deltas[randInt(0,deltas.length-1)] + randInt(-1,1);
      if (v >= 0 && v !== answer) options.add(v);
    }
    return shuffle([...options]);
  }

  function spawnPickups() {
    state.pickups = [];
    const world = getWorldByLevel();
    const laneIndexes = shuffle([0,1,2]);
    const kinds = ['star','coin','gem'];
    for (let i = 0; i < 3; i++) {
      const lane = state.lanes[laneIndexes[i]] || state.lanes[i];
      state.pickups.push({
        lane: laneIndexes[i],
        x: lane.x,
        y: lane.y - 150 - i * 18,
        kind: i === 0 ? 'star' : kinds[randInt(0, kinds.length - 1)],
        color: i === 0 ? '#ffd650' : (i === 1 ? world.color : '#b85cff'),
        bob: Math.random() * Math.PI * 2,
        collected: false
      });
    }
  }

  function renderAnswers() {
    ui.answerPad.innerHTML = '';
    state.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = String(opt);
      btn.addEventListener('click', () => chooseAnswer(opt));
      ui.answerPad.appendChild(btn);
    });
  }

  function chooseAnswer(value) {
    if (!state.started || state.paused || state.answered) return;
    state.answered = true;
    const correct = String(value) === String(state.question.answer);
    if (correct) {
      const timeBonus = Math.ceil(state.timeLeft * 4);
      const streakBonus = Math.min(250, state.streak * 18);
      const earned = 100 + timeBonus + streakBonus;
      state.score += earned;
      state.xp += 25 + Math.floor(earned / 15);
      state.streak += 1;
      state.coins += 3 + Math.floor(state.streak / 3);
      state.comboFlash = 1;
      collectLanePickups();
      makeParticles('#52f47f', 34);
      toast(`Correct! +${earned}. ${state.question.explanation}`, 'good');
      sfx('good');

      setTimeout(nextRound, 650);
    } else {
      state.lives -= 1;
      state.streak = 0;
      makeParticles('#ff496e', 28);
      toast(`Not quite. Correct answer: ${state.question.answer}. ${state.question.explanation}`, 'bad');
      sfx('bad');
      if (state.lives <= 0) setTimeout(gameOver, 900);
      else setTimeout(() => { state.answered = false; syncUI(); }, 900);
    }
    syncUI();
    postScore('live');
  }

  function collectLanePickups() {
    state.pickups.forEach(p => {
      if (p.lane !== state.playerLane || p.collected) return;
      p.collected = true;
      if (p.kind === 'star') state.stars += 1;
      if (p.kind === 'coin') state.coins += 5;
      if (p.kind === 'gem') state.gems += 1;
      makeParticles(p.color, 12, p.x, p.y);
    });
  }

  function nextRound() {
    state.round += 1;
    if (state.round >= 5) {
      completeLevel();
    } else {
      generateQuestion();
      syncUI();
    }
  }

  function completeLevel() {
    const levelStars = state.lives >= 3 ? 3 : state.lives === 2 ? 2 : 1;
    state.stars += levelStars;
    state.gems += levelStars >= 3 ? 2 : 1;
    state.coins += 25 + levelStars * 10;
    state.score += 400 + levelStars * 125;
    state.levelResults[state.level] = levelStars;
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(BEST_KEY, String(state.best));
    sfx('level');

    const oldWorld = getWorldByLevel();
    if (state.level < LEVEL_COUNT) {
      state.level += 1;
      state.round = 0;
      state.lives = 3;
      state.streak = 0;
      const newWorld = getWorldByLevel();
      const changedWorld = oldWorld.index !== newWorld.index;
      generateQuestion();
      syncUI();
      showOverlay(
        changedWorld ? `Gate Unlocked: ${newWorld.name}` : 'Level Complete!',
        changedWorld
          ? `${oldWorld.name} cleared. Enter ${newWorld.name} and continue the curriculum.`
          : `You earned ${levelStars} star(s). Next level: ${state.level}.`,
        'Continue'
      );
    } else {
      victory();
    }
    postScore('level_complete');
  }

  function gameOver() {
    state.paused = true;
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(BEST_KEY, String(state.best));
    showOverlay('Sprint Failed', `You ran out of lives. Final score: ${state.score}. Train again and beat your best.`, 'Restart');
    postScore('game_over');
  }

  function victory() {
    state.paused = true;
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(BEST_KEY, String(state.best));
    state.score += 1500;
    showOverlay('Arena Champion!', `You cleared every Math Gate and became the Arena Champion. Final score: ${state.score}.`, 'Play Again');
    postScore('game_won');
  }

  function showOverlay(title, text, button) {
    ui.overlayTitle.textContent = title;
    ui.overlayText.textContent = text;
    ui.startBtn.textContent = button;
    ui.overlay.classList.add('active');
  }

  function hideOverlay() {
    ui.overlay.classList.remove('active');
  }

  function startGame() {
    if (!state.started || ui.startBtn.textContent.toLowerCase().includes('restart') || ui.startBtn.textContent.toLowerCase().includes('play again')) {
      resetGame();
    }
    state.started = true;
    state.paused = false;
    hideOverlay();
    startMusic();
    generateQuestion();
    syncUI();
    toast('Sprint started. Choose the correct answer tile!', 'good');
  }

  function resetGame() {
    state.started = true;
    state.paused = false;
    state.level = 1;
    state.round = 0;
    state.score = 0;
    state.xp = 0;
    state.streak = 0;
    state.lives = 3;
    state.coins = 0;
    state.gems = 0;
    state.stars = 0;
    state.playerLane = 1;
    state.levelResults = {};
    state.particles = [];
    state.pickups = [];
    generateQuestion();
    syncUI();
  }

  function hint() {
    if (!state.question) return;
    const answer = state.question.answer;
    toast(`Hint: Think step by step. This one is about ${state.question.topic}.`, 'warn');
    state.score = Math.max(0, state.score - 20);
    syncUI();
  }

  function skip() {
    if (!state.started || state.paused) return;
    state.score = Math.max(0, state.score - 50);
    state.streak = 0;
    toast(`Skipped. Answer was ${state.question.answer}. -50 points.`, 'warn');
    nextRound();
    syncUI();
  }

  function moveLane(delta) {
    state.playerLane = clamp(state.playerLane + delta, 0, 2);
    sfx('tap');
  }

  function syncUI() {
    const world = getWorldByLevel();
    const totalWorldAnswered = Math.min(world.levels, Math.max(0, state.level - world.start)) * 5 + state.round;
    const totalWorldQuestions = world.levels * 5;
    const progress = clamp((totalWorldAnswered / totalWorldQuestions) * 100, 0, 100);

    ui.score.textContent = Math.floor(state.score);
    ui.level.textContent = state.level;
    ui.xp.textContent = state.xp;
    ui.streak.textContent = state.streak;
    ui.lives.textContent = state.lives;
    ui.worldBadge.textContent = world.name;
    ui.missionTitle.textContent = `${world.name} Gate`;
    ui.missionText.textContent = world.story;
    ui.worldProgress.style.width = `${progress}%`;
    ui.worldProgressText.textContent = `${Math.round(progress)}%`;
    ui.curriculumText.textContent = `${world.name} ${world.range}`;
    ui.difficultyText.textContent = difficultyName();
    ui.lessonText.textContent = world.lesson;
    ui.coinValue.textContent = state.coins;
    ui.gemValue.textContent = state.gems;
    ui.starValue.textContent = state.stars;
    ui.gateCount.textContent = `${world.index + 1} / ${WORLDS.length}`;
    ui.questionTopic.textContent = world.name;
    ui.questionText.textContent = state.question ? `${state.question.text} = ?` : 'Ready?';
    ui.timerText.textContent = `${Math.ceil(state.timeLeft)}s`;
    ui.muteBtn.textContent = state.muted ? 'Sound Off' : 'Sound On';
    ui.pauseBtn.textContent = state.paused && state.started ? 'Resume' : 'Pause';

    renderGates();
  }

  function renderGates() {
    const active = getWorldByLevel();
    ui.gateList.innerHTML = '';
    let start = 1;
    WORLDS.forEach((w, i) => {
      const end = start + w.levels - 1;
      const unlocked = state.level >= start;
      const done = state.level > end;
      const div = document.createElement('div');
      div.className = `gate ${unlocked ? 'unlocked' : ''} ${active.index === i ? 'active' : ''}`;
      const icon = document.createElement('div');
      icon.className = 'gate-icon';
      icon.style.background = `linear-gradient(145deg, ${w.color}, #1b1d62)`;
      icon.textContent = w.icon;
      const label = document.createElement('div');
      label.innerHTML = `<strong>${w.name}</strong><span>Levels ${w.range}</span>`;
      const em = document.createElement('em');
      em.textContent = done ? '✓' : active.index === i ? 'RUN' : 'LOCK';
      div.append(icon, label, em);
      ui.gateList.appendChild(div);
      start = end + 1;
    });
  }

  function draw() {
    const w = getW(), h = getH();
    const world = getWorldByLevel();

    drawBackground(w, h, world);
    drawArenaPath(w, h, world);
    drawGates(w, h, world);
    drawPickups(world);
    drawPlayer(world);
    drawBot(world);
    drawParticles();
    drawForegroundHud(w, h, world);
  }

  function drawBackground(w, h, world) {
    const bgSrc = ASSETS.backgrounds[world.key] || ASSETS.backgrounds.arithmetic;
    const bg = images[bgSrc];

    if (!drawCoverImage(bg, w, h, 1)) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#07052b');
      g.addColorStop(.45, '#11105a');
      g.addColorStop(1, '#22002f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Keep a light animated maths overlay so the level still feels alive.
    ctx.save();
    ctx.fillStyle = 'rgba(4, 4, 24, .22)';
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = .20;
    for (let x = -80; x < w + 120; x += 70) {
      ctx.strokeStyle = 'rgba(66,230,255,.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(state.time*.3)*20, 0);
      ctx.lineTo(x - 220, h);
      ctx.stroke();
    }

    const symbols = ['+', '−', '×', '÷', 'π', '△', 'x', '%'];
    ctx.font = '900 26px system-ui';
    for (let i = 0; i < 28; i++) {
      const x = ((i * 179 + state.time * (16 + i % 4) * 10) % (w + 80)) - 40;
      const y = (i * 97) % h;
      ctx.fillStyle = i % 4 === 0 ? world.color : (i % 3 === 0 ? '#ffd650' : '#42e6ff');
      ctx.globalAlpha = .18 + (i % 5) * .025;
      ctx.fillText(symbols[i % symbols.length], x, y);
    }
    ctx.restore();

    const glow = ctx.createRadialGradient(w*.55, h*.45, 0, w*.55, h*.45, h*.72);
    glow.addColorStop(0, hexToRgba(world.color, .20));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0,0,w,h);
  }

  function drawArenaPath(w, h, world) {
    const floorY = h * .78;
    ctx.save();
    ctx.strokeStyle = 'rgba(66,230,255,.34)';
    ctx.lineWidth = 4;
    ctx.shadowColor = world.color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(w*.08, floorY);
    ctx.bezierCurveTo(w*.25, h*.58, w*.42, h*.90, w*.60, h*.64);
    ctx.bezierCurveTo(w*.78, h*.43, w*.86, h*.72, w*.95, h*.56);
    ctx.stroke();

    state.lanes.forEach((lane, idx) => {
      drawPlatform(lane.x, lane.y, 150 * lane.scale, 54 * lane.scale, world.color, idx === state.playerLane);
    });
    ctx.restore();
  }

  function drawPlatform(x, y, width, height, color, active) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = color;
    ctx.shadowBlur = active ? 28 : 13;
    const grd = ctx.createLinearGradient(-width/2, -height/2, width/2, height/2);
    grd.addColorStop(0, active ? '#ffffff' : color);
    grd.addColorStop(.15, color);
    grd.addColorStop(1, '#14135b');
    ctx.fillStyle = grd;
    roundRect(-width/2, -height/2, width, height, 16);
    ctx.fill();
    ctx.strokeStyle = active ? '#fff' : color;
    ctx.lineWidth = active ? 3 : 2;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = active ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,.44)';
    ctx.font = `900 ${Math.max(16, height*.42)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const symbols = ['+ −', '× ÷', 'π'];
    ctx.fillText(symbols[(state.playerLane + Math.round(state.time)) % symbols.length], 0, 0);
    ctx.restore();
  }

  function drawGates(w, h, activeWorld) {
    const startX = w * .50;
    const y = h * .22;
    const gap = Math.min(118, w * .115);
    WORLDS.forEach((world, i) => {
      const x = startX + (i - 2) * gap;
      const unlocked = activeWorld.index >= i;
      const active = activeWorld.index === i;
      ctx.save();
      ctx.translate(x, y + Math.sin(state.time*1.2 + i)*4);
      ctx.globalAlpha = unlocked ? 1 : .45;
      ctx.shadowColor = world.color;
      ctx.shadowBlur = active ? 30 : 16;
      ctx.fillStyle = active ? world.color : 'rgba(8,13,48,.88)';
      roundRect(-43, -66, 86, 132, 22);
      ctx.fill();
      ctx.strokeStyle = world.color;
      ctx.lineWidth = active ? 4 : 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(0,0,0,.45)';
      ctx.beginPath();
      ctx.arc(0, 17, 31, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = unlocked ? '#fff' : world.color;
      ctx.stroke();

      ctx.fillStyle = unlocked ? '#fff' : world.color;
      ctx.font = '900 28px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(world.icon, 0, 17);

      ctx.fillStyle = '#fff';
      ctx.font = '900 10px system-ui';
      ctx.fillText(world.name.toUpperCase(), 0, -46);
      ctx.fillText(world.range, 0, -31);
      ctx.restore();
    });
  }

  function drawPickups(world) {
    const map = {
      star: ASSETS.items.star,
      gem: ASSETS.items.gem,
      coin: ASSETS.items.coin
    };

    state.pickups.forEach(p => {
      if (p.collected) return;
      p.bob += .05;
      const y = p.y + Math.sin(p.bob) * 9;
      const src = map[p.kind];

      ctx.save();
      ctx.translate(p.x, y);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;

      if (src && images[src] && images[src].naturalWidth) {
        drawAsset(src, -30, -30, 60, 60);
      } else if (p.kind === 'star') {
        drawStar(0, 0, 18, 8, p.color);
      } else if (p.kind === 'gem') {
        drawGem(0, 0, 18, p.color);
      } else {
        drawCoin(0, 0, 18, p.color);
      }
      ctx.restore();
    });
  }

  function drawPlayer(world) {
    const lane = state.lanes[state.playerLane] || state.lanes[1];
    state.playerX += (lane.x - state.playerX) * .16;
    state.playerY += (lane.y - 102 - state.playerY) * .14;
    state.playerBob += .12;

    const runFrame = Math.floor(state.time * 10) % 2 ? ASSETS.player.run1 : ASSETS.player.run2;
    let src = runFrame;
    if (!state.started) src = ASSETS.player.idle;
    if (state.answered && state.streak > 0) src = ASSETS.player.celebrate;
    if (state.timeLeft < 5 && !state.answered) src = ASSETS.player.think;

    ctx.save();
    ctx.translate(state.playerX, state.playerY + Math.sin(state.playerBob)*5);
    ctx.shadowColor = '#42e6ff';
    ctx.shadowBlur = 20;

    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.beginPath();
    ctx.ellipse(0, 122, 52, 15, 0, 0, Math.PI*2);
    ctx.fill();

    if (drawAsset(src, -62, -142, 124, 172)) {
      ctx.restore();
      return;
    }

    // Fallback vector player if the sprite image is missing.
    ctx.strokeStyle = '#ffd650';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    const run = Math.sin(state.playerBob);
    ctx.beginPath();
    ctx.moveTo(-18, 62);
    ctx.lineTo(-38 - run*8, 105);
    ctx.moveTo(18, 62);
    ctx.lineTo(43 + run*8, 102);
    ctx.stroke();

    ctx.strokeStyle = '#42e6ff';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(-38, -4);
    ctx.lineTo(-78 + run*8, 37);
    ctx.moveTo(38, -4);
    ctx.lineTo(78 - run*8, 35);
    ctx.stroke();

    ctx.fillStyle = '#1f5ce8';
    roundRect(-42, -30, 84, 96, 28);
    ctx.fill();
    ctx.strokeStyle = '#42e6ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffd650';
    ctx.font = '900 44px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('π', 0, 30);

    ctx.fillStyle = '#5bdfff';
    ctx.beginPath();
    ctx.arc(0, -66, 43, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#06072b';
    ctx.beginPath();
    ctx.arc(-15, -73, 7, 0, Math.PI*2);
    ctx.arc(15, -73, 7, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawBot(world) {
    const w = getW(), h = getH();
    const x = w * .88;
    const y = h * .64 + Math.sin(state.time*2.2)*12;

    let src = ASSETS.bot.idle;
    if (state.round === 0) src = ASSETS.bot.wave;
    if (state.timeLeft < 6 && !state.answered) src = ASSETS.bot.alert;
    if (state.answered && state.streak > 0) src = ASSETS.bot.celebrate;
    if (state.level > 30) src = ASSETS.bot.teach;

    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = '#42e6ff';
    ctx.shadowBlur = 22;

    if (drawAsset(src, -58, -100, 116, 130)) {
      ctx.restore();
      return;
    }

    // Fallback vector Pi-Bot if the sprite image is missing.
    ctx.fillStyle = '#122a70';
    roundRect(-34, -42, 68, 84, 22);
    ctx.fill();
    ctx.strokeStyle = '#42e6ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#07111f';
    ctx.beginPath();
    ctx.arc(0, -70, 42, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#42e6ff';
    ctx.stroke();

    ctx.fillStyle = '#42e6ff';
    ctx.beginPath();
    ctx.arc(-14, -75, 6, 0, Math.PI*2);
    ctx.arc(14, -75, 6, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#ffd650';
    ctx.font = '900 34px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('π', 0, 20);
    ctx.restore();
  }

  function drawForegroundHud(w, h, world) {
    if (state.comboFlash > 0) {
      ctx.save();
      ctx.globalAlpha = state.comboFlash;
      ctx.fillStyle = hexToRgba(world.color, .10);
      ctx.fillRect(0,0,w,h);
      state.comboFlash *= .92;
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.30)';
    ctx.strokeStyle = 'rgba(255,214,80,.28)';
    roundRect(18, 18, 185, 72, 18);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd650';
    ctx.font = '900 16px system-ui';
    ctx.fillText('MISSION', 38, 45);
    ctx.fillStyle = '#fff';
    ctx.font = '1000 22px system-ui';
    ctx.fillText(`${world.name} ${world.range}`, 38, 70);
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    state.particles.forEach(p => {
      ctx.globalAlpha = clamp(p.life / p.ttl, 0, 1);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.life--;
    });
    state.particles = state.particles.filter(p => p.life > 0);
    ctx.restore();
  }

  function makeParticles(color, n = 22, x = getW()/2, y = getH()/2) {
    for (let i = 0; i < n; i++) {
      state.particles.push({
        x: x + Math.random()*80 - 40,
        y: y + Math.random()*80 - 40,
        vx: Math.random()*6 - 3,
        vy: Math.random()*-6 - 1,
        r: Math.random()*4 + 2,
        color,
        life: 35 + Math.random()*20,
        ttl: 58
      });
    }
  }

  function drawStar(x, y, r, inset, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i=0; i<10; i++) {
      const a = -Math.PI/2 + i*Math.PI/5;
      const rr = i % 2 ? inset : r;
      const px = x + Math.cos(a)*rr;
      const py = y + Math.sin(a)*rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    ctx.stroke();
  }

  function drawGem(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y-r);
    ctx.lineTo(x+r, y-r*.25);
    ctx.lineTo(x+r*.55, y+r);
    ctx.lineTo(x-r*.55, y+r);
    ctx.lineTo(x-r, y-r*.25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.stroke();
  }

  function drawCoin(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.75)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('π', x, y+1);
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

  function hexToRgba(hex, alpha) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function toast(message, type='') {
    ui.toast.textContent = message;
    ui.toast.className = 'toast show';
    if (type) ui.toast.classList.add(type);
    clearTimeout(toast._t);
    toast._t = setTimeout(() => ui.toast.classList.remove('show'), 2500);
  }

  function update(dt) {
    if (!state.started || state.paused) return;
    state.time += dt;
    state.timeLeft -= dt;
    if (!state.answered && state.timeLeft <= 0) {
      state.answered = true;
      state.lives--;
      state.streak = 0;
      toast(`Time up! Answer: ${state.question.answer}`, 'bad');
      sfx('bad');
      if (state.lives <= 0) setTimeout(gameOver, 850);
      else setTimeout(nextRound, 700);
      syncUI();
    }
    const lane = state.lanes[state.playerLane] || state.lanes[1];
    state.playerX += (lane.x - state.playerX) * .2;
  }

  function loop(now) {
    const dt = Math.min(.05, Math.max(.001, (now - last)/1000));
    last = now;
    update(dt);
    draw();
    if (state.question) {
      ui.timerText.textContent = `${Math.max(0, Math.ceil(state.timeLeft))}s`;
    }
    requestAnimationFrame(loop);
  }

  function bindEvents() {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 160));
    if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(canvas.parentElement);

    ui.startBtn.addEventListener('click', startGame);
    ui.howBtn.addEventListener('click', () => {
      ui.overlayTitle.textContent = 'How to Play';
      ui.overlayText.textContent = 'Solve 5 rounds per level. Choose the correct answer, build streaks, collect coins, gems and stars, and unlock all math gates from Arithmetic to Algebra.';
      ui.startBtn.textContent = state.started ? 'Continue' : 'Start Sprint';
    });
    ui.pauseBtn.addEventListener('click', () => {
      if (!state.started) return;
      state.paused = !state.paused;
      if (state.paused) showOverlay('Paused', 'Take a quick breather. Your arena run is waiting.', 'Continue');
      else hideOverlay();
      syncUI();
    });
    ui.hintBtn.addEventListener('click', hint);
    ui.skipBtn.addEventListener('click', skip);
    ui.restartBtn.addEventListener('click', () => {
      resetGame();
      hideOverlay();
      toast('Sprint restarted.', 'warn');
    });
    ui.submitBtn.addEventListener('click', () => postScore('manual_submit'));
    ui.muteBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      if (state.muted) stopMusic();
      else startMusic();
      syncUI();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') moveLane(-1);
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') moveLane(1);
      if (/^[1-4]$/.test(e.key)) {
        const index = Number(e.key) - 1;
        const btn = ui.answerPad.children[index];
        if (btn) btn.click();
      }
      if (e.key === ' ') {
        e.preventDefault();
        state.paused = !state.paused;
        syncUI();
      }
    });

    let startX = 0;
    canvas.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    canvas.addEventListener('pointerup', (e) => {
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 35) moveLane(dx > 0 ? 1 : -1);
    });

    window.addEventListener('message', ev => {
      const data = ev.data || {};
      const type = data.type || data.event;
      if (type === 'GG_RESTART') {
        resetGame();
        startGame();
      }
      if (type === 'GG_MUTE') {
        state.muted = !!(data.payload?.muted ?? data.muted);
        if (state.muted) stopMusic(); else startMusic();
        syncUI();
      }
      if (type === 'GG_PAUSE') {
        state.paused = !!(data.payload?.paused ?? data.paused);
        syncUI();
      }
    });
  }

  function postScore(mode = 'live') {
    const payload = {
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score: Math.floor(state.score),
      best: state.best,
      level: state.level,
      xp: state.xp,
      coins: state.coins,
      gems: state.gems,
      stars: state.stars,
      mode
    };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(payload.score, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(payload.score, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type: 'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type: 'gg:score', ...payload, payload }, '*'); } catch {}
  }

  function ensureAudio() {
    if (state.muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = .13;
      master.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  }

  function tone(freq, dur=.08, type='sine', gain=.04, delay=0) {
    const ac = ensureAudio();
    if (!ac) return;
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + .015);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + dur + .04);
  }

  function sfx(kind) {
    if (kind === 'good') { tone(520,.06,'triangle',.05); tone(820,.09,'sine',.035,.05); }
    if (kind === 'bad') tone(145,.16,'sawtooth',.05);
    if (kind === 'level') { tone(392,.08,'triangle',.05); tone(554,.11,'triangle',.04,.08); tone(784,.15,'sine',.03,.18); }
    if (kind === 'tap') tone(330,.045,'square',.018);
  }

  function startMusic() {
    if (state.muted || musicTimer) return;
    let step = 0;
    const notes = [196,247,294,330,392,440,392,330,294,247,262,330];
    musicTimer = setInterval(() => {
      if (!state.started || state.paused || state.muted || document.hidden) return;
      const n = notes[step++ % notes.length];
      tone(n,.08,'triangle',.007);
      if (step % 2 === 0) tone(n/2,.13,'sine',.004,.03);
    }, 250);
  }

  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  loadGameAssets().finally(() => {
    resizeCanvas();
    bindEvents();
    buildLanes();
    generateQuestion();
    syncUI();
    requestAnimationFrame(loop);
  });
})();