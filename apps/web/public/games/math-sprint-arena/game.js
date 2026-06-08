(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d');

  const overlay = $('overlay');
  const overlayTitle = $('overlayTitle');
  const overlayText = $('overlayText');
  const startBtn = $('startBtn');
  const helpBtn = $('helpBtn');
  const pauseBtn = $('pauseBtn');
  const powerTimeBtn = $('powerTimeBtn');
  const powerShieldBtn = $('powerShieldBtn');
  const submitBtn = $('submitBtn');
  const restartBtn = $('restartBtn');
  const muteBtn = $('muteBtn');

  const scoreValue = $('scoreValue');
  const livesValue = $('livesValue');
  const streakValue = $('streakValue');
  const bestValue = $('bestValue');
  const levelPill = $('levelPill');
  const missionText = $('missionText');
  const missionPct = $('missionPct');
  const missionFill = $('missionFill');
  const questionText = $('questionText');
  const questionType = $('questionType');
  const learningTip = $('learningTip');
  const answerRow = $('answerRow');

  const GAME_SLUG = 'math-sprint-arena';
  const BEST_KEY = 'gg_math_sprint_arena_best_v1';

  const ASSETS = {
    runner: './assets/sprites/math-runner.png',
    orbA: './assets/sprites/answer-orb-a.png',
    orbB: './assets/sprites/answer-orb-b.png',
    orbC: './assets/sprites/answer-orb-c.png',
    powerTime: './assets/ui/power-time.png',
    powerShield: './assets/ui/power-shield.png',
  };

  const LEVELS = [
    {
      name: 'Arithmetic Warm-up',
      type: 'Arithmetic',
      background: './assets/backgrounds/bg-arithmetic-school.png',
      target: 8,
      lives: 3,
      timeLimit: 9.2,
      levelBonus: 0,
      tip: 'Start with simple addition and subtraction. Break numbers into tens and ones.',
      gen: () => {
        const a = randInt(4, 20), b = randInt(2, 15);
        const op = Math.random() < 0.55 ? '+' : '−';
        const hi = Math.max(a, b), lo = Math.min(a, b);
        return op === '+' ? makeProblem(`${a} + ${b}`, a + b, 'Add tens and ones separately.')
                          : makeProblem(`${hi} − ${lo}`, hi - lo, 'Subtract the smaller number from the larger number.');
      }
    },
    {
      name: 'Subtraction Speed Lane',
      type: 'Subtraction',
      background: './assets/backgrounds/bg-number-city.png',
      target: 10,
      lives: 3,
      timeLimit: 8.7,
      levelBonus: 10,
      tip: 'For subtraction, count backwards or use a nearby round number.',
      gen: () => {
        const a = randInt(20, 70), b = randInt(3, 25);
        return makeProblem(`${a} − ${b}`, a - b, 'Use round numbers to subtract quickly.');
      }
    },
    {
      name: 'Times Table City',
      type: 'Multiplication',
      background: './assets/backgrounds/bg-number-city.png',
      target: 12,
      lives: 3,
      timeLimit: 8.1,
      levelBonus: 18,
      tip: 'Use multiplication patterns. 6 × 8 is the same as 8 × 6.',
      gen: () => {
        const a = randInt(2, 12), b = randInt(2, 12);
        return makeProblem(`${a} × ${b}`, a * b, 'Use times-table patterns.');
      }
    },
    {
      name: 'Division Dome',
      type: 'Division',
      background: './assets/backgrounds/bg-division-dome.png',
      target: 12,
      lives: 3,
      timeLimit: 7.7,
      levelBonus: 26,
      tip: 'Division is the inverse of multiplication. If 6 × 7 = 42, then 42 ÷ 6 = 7.',
      gen: () => {
        const divisor = randInt(2, 12);
        const answer = randInt(2, 12);
        const total = divisor * answer;
        return makeProblem(`${total} ÷ ${divisor}`, answer, 'Think of the matching multiplication fact.');
      }
    },
    {
      name: 'Fractions & Percentages',
      type: 'Fractions',
      background: './assets/backgrounds/bg-geometry-grid.png',
      target: 13,
      lives: 3,
      timeLimit: 7.6,
      levelBonus: 34,
      tip: 'Convert simple fractions into percentages: 1/2 = 50%, 1/4 = 25%, 3/4 = 75%.',
      gen: () => {
        const qs = [
          ['1/2 of 40', 20], ['1/4 of 80', 20], ['3/4 of 60', 45], ['10% of 90', 9],
          ['25% of 48', 12], ['50% of 76', 38], ['20% of 50', 10], ['1/3 of 30', 10],
          ['2/5 of 100', 40], ['75% of 80', 60], ['1/5 of 75', 15], ['30% of 90', 27]
        ];
        const [q,a] = pick(qs);
        return makeProblem(q, a, 'Use fraction and percentage shortcuts.');
      }
    },
    {
      name: 'Decimal Lab',
      type: 'Decimals',
      background: './assets/backgrounds/bg-decimal-lab.png',
      target: 13,
      lives: 3,
      timeLimit: 7.2,
      levelBonus: 42,
      tip: 'Line up decimal places carefully. 1.5 + 2.25 = 3.75.',
      gen: () => {
        const qs = [
          ['0.5 + 0.25', 0.75], ['1.5 + 2.5', 4], ['3.2 + 1.8', 5], ['4.5 − 1.5', 3],
          ['2.25 + 0.75', 3], ['6.0 − 2.5', 3.5], ['0.75 + 0.25', 1], ['1.2 + 3.3', 4.5],
          ['5.5 − 1.25', 4.25], ['2.5 × 2', 5]
        ];
        const [q,a] = pick(qs);
        return makeProblem(q, a, 'Pay attention to decimal place value.');
      }
    },
    {
      name: 'Integer Ice Track',
      type: 'Integers',
      background: './assets/backgrounds/bg-integer-ice-track.png',
      target: 14,
      lives: 3,
      timeLimit: 7.0,
      levelBonus: 50,
      tip: 'When adding a negative number, move left on the number line.',
      gen: () => {
        const a = randInt(-12, 18);
        const b = randInt(-10, 10);
        const sign = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
        return makeProblem(`${a} ${sign}`, a + b, 'Use the number line to handle positive and negative values.');
      }
    },
    {
      name: 'Geometry Grid',
      type: 'Geometry',
      background: './assets/backgrounds/bg-geometry-grid.png',
      target: 14,
      lives: 3,
      timeLimit: 7.0,
      levelBonus: 58,
      tip: 'Area of a rectangle = length × width. Perimeter = 2 × (length + width).',
      gen: () => {
        if (Math.random() < 0.55) {
          const l = randInt(3, 14), w = randInt(2, 10);
          return makeProblem(`Area: ${l} × ${w}`, l*w, 'Area = length × width.');
        } else {
          const l = randInt(3, 14), w = randInt(2, 10);
          return makeProblem(`Perimeter: ${l} by ${w}`, 2*(l+w), 'Perimeter = 2 × (length + width).');
        }
      }
    },
    {
      name: 'Pattern Portal',
      type: 'Patterns',
      background: './assets/backgrounds/bg-pattern-portal.png',
      target: 14,
      lives: 3,
      timeLimit: 6.8,
      levelBonus: 66,
      tip: 'Look for the rule: adding, subtracting, multiplying, or alternating.',
      gen: () => {
        const start = randInt(2, 12);
        const step = randInt(2, 8);
        if (Math.random() < 0.55) {
          const answer = start + step * 4;
          return makeProblem(`${start}, ${start+step}, ${start+step*2}, ${start+step*3}, ?`, answer, 'Find the constant difference.');
        }
        const mult = randInt(2, 3);
        const a2 = start * mult, a3 = a2 * mult, answer = a3 * mult;
        return makeProblem(`${start}, ${a2}, ${a3}, ?`, answer, 'Find the multiplication pattern.');
      }
    },
    {
      name: 'Money Market Maths',
      type: 'Money',
      background: './assets/backgrounds/bg-money-market.png',
      target: 15,
      lives: 3,
      timeLimit: 6.7,
      levelBonus: 74,
      tip: 'Money maths uses addition, change, discounts, and multiplication.',
      gen: () => {
        const qs = [
          ['R20 − R7', 13], ['R50 − R18', 32], ['3 × R12', 36], ['R100 − R65', 35],
          ['2 items at R15', 30], ['R40 + R25', 65], ['10% of R80', 8], ['25% of R60', 15],
          ['R75 − R27', 48], ['4 × R9', 36]
        ];
        const [q,a] = pick(qs);
        return makeProblem(q, a, 'Use money shortcuts and change calculation.');
      }
    },
    {
      name: 'Algebra Space',
      type: 'Algebra',
      background: './assets/backgrounds/bg-algebra-space.png',
      target: 15,
      lives: 3,
      timeLimit: 6.5,
      levelBonus: 84,
      tip: 'To solve x + a = b, subtract a from both sides. To solve ax = b, divide by a.',
      gen: () => {
        if (Math.random() < 0.65) {
          const x = randInt(2, 22), a = randInt(2, 24);
          return makeProblem(`x + ${a} = ${x+a}`, x, 'Find the value of x by subtracting.');
        } else {
          const x = randInt(2, 12), a = randInt(2, 10);
          return makeProblem(`${a}x = ${a*x}`, x, 'Divide both sides to find x.');
        }
      }
    },
    {
      name: 'Final Boss Mixed Arena',
      type: 'Mixed',
      background: './assets/backgrounds/bg-final-boss-arena.png',
      target: 18,
      lives: 3,
      timeLimit: 6.0,
      levelBonus: 100,
      tip: 'The final level mixes everything: arithmetic, tables, division, fractions, decimals, integers, geometry, patterns, money, and algebra.',
      gen: () => {
        const pool = LEVELS.slice(0, 11);
        return pick(pool).gen();
      }
    }
  ];

  const images = {};
  function loadImages() {
    const paths = [...new Set([...Object.values(ASSETS), ...LEVELS.map(l => l.background)])];
    return Promise.all(paths.map((src) => new Promise((resolve) => {
      const img = new Image();
      images[src] = img;
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    })));
  }

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    levelClear: false,
    victory: false,
    levelIndex: 0,
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    lives: 3,
    streak: 0,
    correct: 0,
    problem: null,
    options: [],
    selectedLane: 1,
    targetLane: 1,
    timeLeft: 8,
    roundAnswered: false,
    runnerX: 0,
    runnerY: 0,
    lanePulse: 0,
    particles: [],
    floatTexts: [],
    speedLines: [],
    shake: 0,
    time: 0,
    shield: 1,
    timePower: 1,
    shieldActive: false,
    feedback: '',
    feedbackTimer: 0,
  };

  function randInt(a,b){ return Math.floor(a + Math.random() * (b-a+1)); }
  function pick(arr){ return arr[(Math.random()*arr.length)|0]; }
  function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const rand = (a,b) => a + Math.random() * (b-a);
  const currentLevel = () => LEVELS[state.levelIndex];

  function makeProblem(question, answer, tip) {
    const wrong = new Set();
    while (wrong.size < 2) {
      let delta = randInt(-12, 12);
      if (delta === 0) delta = randInt(1, 4);
      let val = answer + delta;
      if (val !== answer && Number.isFinite(val) && val >= -99 && val <= 999) wrong.add(val);
    }
    return { question, answer, tip, options: shuffle([answer, ...wrong]) };
  }

  // Audio
  let AC = null, master = null, muted = false, musicHandle = null, musicStep = 0;
  function ensureAudio() {
    if (muted) return null;
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
  function tone(freq, dur = 0.08, type = 'sine', gain = 0.04, delay = 0) {
    const ac = ensureAudio(); if (!ac || muted) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator(); const g = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master || ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  function noise(dur = 0.1, gain = 0.04) {
    const ac = ensureAudio(); if (!ac || muted) return;
    const b = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = b.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1) * (1 - i/data.length);
    const src = ac.createBufferSource(); const g = ac.createGain();
    src.buffer = b; g.gain.value = gain; src.connect(g); g.connect(master || ac.destination);
    src.start(); src.stop(ac.currentTime + dur);
  }
  function sfx(type) {
    if (type === 'start') { tone(360,.05,'triangle',.05); tone(560,.07,'triangle',.04,.05); return; }
    if (type === 'select') { tone(520,.03,'sine',.025); return; }
    if (type === 'right') { tone(620,.05,'triangle',.05); tone(940,.06,'sine',.036,.05); return; }
    if (type === 'wrong') { noise(.13,.045); tone(160,.12,'sawtooth',.045); return; }
    if (type === 'power') { tone(480,.05,'triangle',.05); tone(780,.08,'sine',.04,.05); return; }
    if (type === 'level') { tone(390,.06,'triangle',.05); tone(650,.08,'triangle',.04,.06); tone(960,.11,'sine',.03,.13); return; }
    if (type === 'gameover') { tone(200,.12,'sawtooth',.055); tone(140,.16,'sine',.04,.1); return; }
  }
  function musicTick() {
    if (!state.running || state.paused || muted) return;
    const notes = [196, 247, 294, 330, 294, 247, 220, 262];
    const n = notes[musicStep++ % notes.length];
    tone(n,.08,'triangle',.009);
    if (musicStep % 2 === 0) tone(n/2,.12,'sine',.007);
  }
  function startMusic() { if (!musicHandle && !muted) musicHandle = setInterval(musicTick, 240); }
  function stopMusic() { if (musicHandle) clearInterval(musicHandle); musicHandle = null; }

  // Score bridge
  let lastLiveScore = -1, lastLiveAt = 0;
  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 120) return;
    lastLiveScore = clean; lastLiveAt = now;
    const payload = { gameSlug: GAME_SLUG, slug: GAME_SLUG, score: clean, best: state.best, level: state.levelIndex+1, streak: state.streak, correct: state.correct, mode };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type:'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type:'gg:score', ...payload, payload }, '*'); } catch {}
  }

  function updateBest() {
    if (state.score > state.best) {
      state.best = Math.floor(state.score);
      localStorage.setItem(BEST_KEY, String(state.best));
    }
  }

  function progress() {
    return clamp(state.correct / currentLevel().target, 0, 1);
  }

  function updateHUD() {
    scoreValue.textContent = Math.floor(state.score);
    livesValue.textContent = state.lives;
    streakValue.textContent = state.streak;
    bestValue.textContent = state.best;
    levelPill.textContent = `Level ${state.levelIndex + 1} • ${currentLevel().name}`;
    missionText.textContent = `Answer ${currentLevel().target} correctly to clear the level. Correct: ${state.correct}/${currentLevel().target}`;
    const pct = Math.round(progress()*100);
    missionPct.textContent = `${pct}%`;
    missionFill.style.width = `${pct}%`;
    questionText.textContent = state.problem?.question || 'Tap Start';
    questionType.textContent = currentLevel().type;
    learningTip.textContent = state.problem?.tip || currentLevel().tip;
    powerTimeBtn.textContent = `+Time ${state.timePower}`;
    powerShieldBtn.textContent = state.shieldActive ? 'Shield ON' : `Shield ${state.shield}`;
    powerTimeBtn.disabled = !state.running || state.paused || state.timePower <= 0 || state.roundAnswered;
    powerShieldBtn.disabled = !state.running || state.paused || state.shield <= 0 || state.shieldActive;
    postScore('live');
  }

  function showOverlay(title, text, label = 'Start') {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    startBtn.textContent = label;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() { overlay.classList.add('hidden'); }

  function resetLevel() {
    const level = currentLevel();
    state.running = false;
    state.paused = false;
    state.gameOver = false;
    state.levelClear = false;
    state.victory = false;
    state.lives = level.lives;
    state.streak = 0;
    state.correct = 0;
    state.selectedLane = 1;
    state.targetLane = 1;
    state.timeLeft = level.timeLimit;
    state.problem = null;
    state.options = [];
    state.roundAnswered = false;
    state.particles = [];
    state.floatTexts = [];
    state.speedLines = [];
    state.shake = 0;
    state.shield = 1;
    state.timePower = 1;
    state.shieldActive = false;
    nextProblem();
    updateHUD();
  }

  function resetGame() {
    state.levelIndex = 0;
    state.score = 0;
    resetLevel();
    showOverlay('Math Sprint Arena', 'Solve the maths problem by choosing the correct answer lane.\\n\\nTap the answer button or press 1, 2, or 3. Build streaks to earn bonus points and clear each educational level.', 'Start');
  }

  function begin() {
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    ensureAudio();
    startMusic();
    hideOverlay();
    sfx('start');
  }

  function nextLevel() {
    if (state.levelIndex >= LEVELS.length - 1) {
      state.running = false;
      state.victory = true;
      stopMusic();
      updateBest();
      postScore('victory');
      showOverlay('Math Champion!', `You completed all ${LEVELS.length} levels.\\n\\nFinal score: ${Math.floor(state.score)}\\nBest: ${state.best}\\nTap Start to play again.`, 'Play again');
      return;
    }
    state.levelIndex += 1;
    resetLevel();
    showOverlay(`Level ${state.levelIndex + 1}: ${currentLevel().name}`, `${currentLevel().tip}\\n\\nGoal: ${currentLevel().target} correct answers.`, 'Start level');
  }

  function completeLevel() {
    state.running = false;
    state.levelClear = true;
    stopMusic();
    sfx('level');
    updateBest();
    postScore('level_clear');
    showOverlay('Level Complete!', `${currentLevel().name} cleared.\\n\\nScore: ${Math.floor(state.score)}\\nStreak: ${state.streak}\\nTap Start for the next level.`, 'Next level');
  }

  function endGame(reason) {
    state.running = false;
    state.gameOver = true;
    stopMusic();
    sfx('gameover');
    updateBest();
    postScore('game_over');
    showOverlay('Run Over', `${reason}\\n\\nScore: ${Math.floor(state.score)}\\nBest: ${state.best}\\nTap Start to try again.`, 'Restart');
  }

  function nextProblem() {
    state.problem = currentLevel().gen();
    state.options = state.problem.options;
    state.targetLane = state.options.findIndex(v => v === state.problem.answer);

    // Safety fallback in case a future problem generator returns unusual values.
    if (state.targetLane < 0) state.targetLane = 0;

    state.selectedLane = 1;
    state.timeLeft = currentLevel().timeLimit;
    state.roundAnswered = false;
    renderAnswerButtons();
    updateHUD();
  }

  function renderAnswerButtons() {
    answerRow.innerHTML = '';
    state.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => answerLane(i, btn));
      answerRow.appendChild(btn);
    });
  }

  function answerLane(i, btn = null) {
    if (!state.running || state.paused || state.roundAnswered) return;
    state.selectedLane = i;
    sfx('select');

    // Submit immediately on tap/click so the game cannot feel stuck in an iframe/mobile browser.
    submitLane(i, btn);
  }

  function submitLane(i, btn = null) {
    if (!state.running || state.paused || state.roundAnswered) return;

    state.roundAnswered = true;

    const selectedIndex = Number.isInteger(i) && i >= 0 && i < state.options.length ? i : -1;
    const correct = selectedIndex === state.targetLane;

    [...answerRow.children].forEach((b, idx) => {
      b.disabled = true;
      if (idx === state.targetLane) b.classList.add('correct');
      if (idx === selectedIndex && !correct) b.classList.add('wrong');
    });

    const { h } = getMetrics();
    const laneForEffects = selectedIndex >= 0 ? selectedIndex : state.targetLane;
    const laneX = laneCenter(laneForEffects);
    const y = h * 0.58;

    if (correct) {
      state.streak += 1;
      state.correct += 1;

      const mult = state.streak >= 12 ? 2.4 : state.streak >= 8 ? 1.9 : state.streak >= 4 ? 1.45 : 1;
      const gained = Math.round(70 * mult + (currentLevel().levelBonus || 0) + Math.max(0, state.timeLeft) * 5);

      state.score += gained;
      updateBest();
      sfx('right');
      addParticles(laneX, y, '#47e78d', 24);
      addFloatText(laneX, y - 20, `+${gained}`, '#dfffea');
      spawnSpeedLines(10);
      updateHUD();

      if (state.correct >= currentLevel().target) {
        setTimeout(() => completeLevel(), 360);
      } else {
        setTimeout(() => nextProblem(), 520);
      }

      return;
    }

    state.streak = 0;

    if (state.shieldActive) {
      state.shieldActive = false;
      addFloatText(laneX, y - 20, 'Shield saved you!', '#ffe48a');
      sfx('power');
    } else {
      state.lives -= 1;
      state.shake = 14;
      sfx('wrong');
      addFloatText(laneX, y - 20, '-1 life', '#ffb9c2');
    }

    addParticles(laneX, y, '#ff6075', 18);
    updateHUD();

    if (state.lives <= 0) {
      setTimeout(() => endGame('You ran out of lives.'), 360);
    } else {
      setTimeout(() => nextProblem(), 680);
    }
  }

  function useTimePower() {
    if (!state.running || state.paused || state.timePower <= 0 || state.roundAnswered) return;
    state.timePower -= 1;
    state.timeLeft += 4;
    sfx('power');
    addFloatText(getMetrics().w * 0.5, getMetrics().h * 0.28, '+4 seconds', '#ffe48a');
    updateHUD();
  }
  function useShieldPower() {
    if (!state.running || state.paused || state.shield <= 0 || state.shieldActive) return;
    state.shield -= 1;
    state.shieldActive = true;
    sfx('power');
    addFloatText(getMetrics().w * 0.5, getMetrics().h * 0.28, 'Shield ready', '#baffcf');
    updateHUD();
  }

  function getMetrics() {
    const rect = canvas.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }

  function laneCenter(i) {
    const { w } = getMetrics();
    const pad = w * 0.16;
    const laneW = (w - pad * 2) / 3;
    return pad + laneW * i + laneW / 2;
  }

  function addParticles(x,y,color,count=18) {
    for (let i=0;i<count;i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 190;
      state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.45+Math.random()*.4,ttl:.7,size:3+Math.random()*6,color});
    }
  }

  function addFloatText(x,y,text,color) {
    state.floatTexts.push({x,y,text,color,life:.95,ttl:.95});
  }

  function spawnSpeedLines(count=6) {
    const { w,h } = getMetrics();
    for (let i=0;i<count;i++) {
      state.speedLines.push({x: rand(w*0.1,w*0.9), y: rand(h*0.18,h*0.75), len: rand(50,130), life: .35, ttl:.35});
    }
  }

  function update(dt) {
    state.time += dt;
    if (state.running && !state.paused && !state.roundAnswered && !state.levelClear && !state.gameOver && !state.victory) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        submitLane(-1);
      }
    }
    state.shake *= 0.88;
    updateHUD();
  }

  function drawBackground() {
    const {w,h}=getMetrics();
    const bg=images[currentLevel().background];
    if (bg && bg.width) {
      const ratio=Math.max(w/bg.width,h/bg.height);
      const dw=bg.width*ratio, dh=bg.height*ratio;
      ctx.drawImage(bg,(w-dw)/2,(h-dh)/2,dw,dh);
    } else {
      ctx.fillStyle='#07111f';
      ctx.fillRect(0,0,w,h);
    }
    const vignette=ctx.createRadialGradient(w*.5,h*.35,40,w*.5,h*.45,h*.82);
    vignette.addColorStop(0,'rgba(255,255,255,.03)');
    vignette.addColorStop(1,'rgba(0,0,0,.40)');
    ctx.fillStyle=vignette;
    ctx.fillRect(0,0,w,h);
  }

  function roundedRectPath(x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
  }

  function drawTrack() {
    const {w,h}=getMetrics();
    const yTop=h*0.30, yBot=h*0.82;
    ctx.save();
    for (let i=0;i<3;i++) {
      const x=laneCenter(i);
      const laneW=(w*0.68)/3;
      ctx.fillStyle = i===state.selectedLane ? 'rgba(54,214,255,.16)' : 'rgba(255,255,255,.04)';
      roundedRectPath(x-laneW*.42,yTop,laneW*.84,yBot-yTop,22);
      ctx.fill();
      ctx.strokeStyle=i===state.selectedLane?'rgba(54,214,255,.42)':'rgba(255,255,255,.12)';
      ctx.lineWidth=2;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTopProblem() {
    const {w}=getMetrics();
    ctx.save();
    roundedRectPath(22,20,w-44,78,20);
    ctx.fillStyle='rgba(5,10,18,.50)';
    ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.12)';
    ctx.stroke();
    ctx.textAlign='center';
    ctx.fillStyle='rgba(255,255,255,.96)';
    ctx.font='900 34px Inter, system-ui, sans-serif';
    ctx.fillText(state.problem?.question || 'Ready?', w/2, 58);
    ctx.font='700 13px Inter, system-ui, sans-serif';
    ctx.fillStyle='rgba(255,255,255,.72)';
    ctx.fillText(state.problem?.tip || currentLevel().tip, w/2, 84);
    ctx.restore();
  }

  function drawTimerBar() {
    const {w}=getMetrics();
    const pct=clamp(state.timeLeft / currentLevel().timeLimit,0,1);
    ctx.save();
    roundedRectPath(24,108,w-48,14,8);
    ctx.fillStyle='rgba(255,255,255,.10)';
    ctx.fill();
    roundedRectPath(24,108,(w-48)*pct,14,8);
    ctx.fillStyle=pct<.25?'rgba(255,96,117,.90)':'rgba(71,231,141,.90)';
    ctx.fill();
    ctx.restore();
  }

  function drawOrbs() {
    const {h}=getMetrics();
    const orbImgs=[images[ASSETS.orbA],images[ASSETS.orbB],images[ASSETS.orbC]];
    const y=h*0.47;
    state.options.forEach((opt,i)=>{
      const x=laneCenter(i);
      const selected=i===state.selectedLane;
      const size=selected?86:74;
      const pulse=1+Math.sin(state.time*5+i)*0.035;
      ctx.save();
      ctx.translate(x,y);
      ctx.shadowColor=selected?'#36d6ff':'rgba(0,0,0,.4)';
      ctx.shadowBlur=selected?22:8;
      const img=orbImgs[i];
      if(img && img.width) ctx.drawImage(img,-size*pulse/2,-size*pulse/2,size*pulse,size*pulse);
      else {
        ctx.fillStyle='rgba(54,214,255,.8)';
        ctx.beginPath(); ctx.arc(0,0,size/2,0,Math.PI*2); ctx.fill();
      }
      ctx.shadowBlur=0;
      ctx.fillStyle='#fff';
      ctx.font='900 24px Inter, system-ui, sans-serif';
      ctx.textAlign='center';
      ctx.fillText(String(opt),0,8);
      ctx.restore();
    });
  }

  function drawRunner() {
    const {h}=getMetrics();
    const x = laneCenter(state.selectedLane);
    const targetY = h*0.66 + Math.sin(state.time*12)*5;
    const runner=images[ASSETS.runner];
    const size=120;
    ctx.save();
    ctx.translate(x,targetY);
    if(state.shieldActive) {
      ctx.beginPath();
      ctx.arc(0,0,76+Math.sin(state.time*6)*4,0,Math.PI*2);
      ctx.strokeStyle='rgba(71,231,141,.85)';
      ctx.lineWidth=5;
      ctx.shadowColor='#47e78d';
      ctx.shadowBlur=18;
      ctx.stroke();
      ctx.shadowBlur=0;
    }
    if(runner && runner.width) ctx.drawImage(runner,-size/2,-size/2,size,size);
    else {
      ctx.fillStyle='#36d6ff';
      ctx.beginPath(); ctx.arc(0,0,42,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawSpeedLines(dt) {
    for (let i=state.speedLines.length-1;i>=0;i--) {
      const l=state.speedLines[i];
      l.life-=dt;
      if(l.life<=0){state.speedLines.splice(i,1);continue;}
      ctx.save();
      ctx.globalAlpha=l.life/l.ttl;
      ctx.strokeStyle='rgba(255,255,255,.55)';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(l.x,l.y);
      ctx.lineTo(l.x-l.len,l.y+20);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles(dt) {
    for (let i=state.particles.length-1;i>=0;i--) {
      const p=state.particles[i];
      p.life-=dt;
      if(p.life<=0){state.particles.splice(i,1);continue;}
      p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=.985; p.vy*=.985;
      const a=p.life/p.ttl;
      ctx.save(); ctx.globalAlpha=a; ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  function drawFloatTexts(dt) {
    for (let i=state.floatTexts.length-1;i>=0;i--) {
      const f=state.floatTexts[i];
      f.life-=dt;
      if(f.life<=0){state.floatTexts.splice(i,1);continue;}
      f.y-=42*dt;
      ctx.save(); ctx.globalAlpha=f.life/f.ttl; ctx.fillStyle=f.color; ctx.font='900 24px Inter, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillText(f.text,f.x,f.y); ctx.restore();
    }
  }

  function render(dt) {
    const {w,h}=getMetrics();
    ctx.clearRect(0,0,w,h);
    ctx.save();
    if(state.shake>0) ctx.translate(rand(-state.shake,state.shake), rand(-state.shake,state.shake));
    drawBackground();
    drawTrack();
    drawSpeedLines(dt);
    drawTopProblem();
    drawTimerBar();
    drawOrbs();
    drawRunner();
    drawParticles(dt);
    drawFloatTexts(dt);
    ctx.restore();
  }

  function togglePause() {
    if(!state.running && !state.paused) return;
    state.paused=!state.paused;
    if(state.paused) {
      stopMusic();
      showOverlay('Paused','Math Sprint Arena is paused. Tap Start or Pause to continue.','Resume');
    } else {
      hideOverlay();
      startMusic();
    }
  }

  startBtn.addEventListener('click', ()=>{
    ensureAudio();
    if(state.victory || state.gameOver){ resetGame(); begin(); return; }
    if(state.levelClear){ nextLevel(); return; }
    if(!state.running) begin();
    else if(state.paused){ state.paused=false; hideOverlay(); startMusic(); }
  });
  helpBtn.addEventListener('click', ()=>{
    state.paused=true; stopMusic();
    showOverlay('How to Play','Read the maths problem, then choose the correct answer lane.\\n\\n• Tap an answer button or press 1, 2, or 3\\n• Correct answers build streak multipliers\\n• Wrong answers cost lives\\n• Use +Time or Shield once per level\\n• Clear all levels to become Math Champion','Resume');
  });
  pauseBtn.addEventListener('click', togglePause);
  powerTimeBtn.addEventListener('click', useTimePower);
  powerShieldBtn.addEventListener('click', useShieldPower);
  submitBtn.addEventListener('click', ()=>postScore('manual_submit'));
  restartBtn.addEventListener('click', ()=>{ resetGame(); begin(); });
  muteBtn.addEventListener('click', ()=>{
    muted=!muted;
    muteBtn.textContent=muted?'Muted':'Sound';
    if(muted) stopMusic(); else if(state.running && !state.paused) startMusic();
  });

  window.addEventListener('keydown', (e)=>{
    if(e.key==='1') answerLane(0);
    if(e.key==='2') answerLane(1);
    if(e.key==='3') answerLane(2);
    if(e.key==='ArrowLeft') { state.selectedLane = clamp(state.selectedLane-1,0,2); sfx('select'); }
    if(e.key==='ArrowRight') { state.selectedLane = clamp(state.selectedLane+1,0,2); sfx('select'); }
    if(e.key==='Enter') answerLane(state.selectedLane);
    if(e.key.toLowerCase()==='p') togglePause();
    if(e.key.toLowerCase()==='r') { resetGame(); begin(); }
  });

  window.addEventListener('message', (ev)=>{
    const data=ev.data||{};
    const type=data.type||data.event;
    if(type==='GG_PAUSE'){
      state.paused=!!(data.payload?.paused ?? data.paused);
      if(state.paused) stopMusic(); else if(state.running) startMusic();
    }
    if(type==='GG_RESTART'){ resetGame(); begin(); }
    if(type==='GG_MUTE'){
      muted=!!(data.payload?.muted ?? data.muted);
      if(muted) stopMusic(); else if(state.running && !state.paused) startMusic();
      muteBtn.textContent=muted?'Muted':'Sound';
    }
  });

  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden && state.running){
      state.paused=true;
      stopMusic();
      showOverlay('Paused','Math Sprint Arena is paused. Tap Start or Pause to continue.','Resume');
    }
  });

  function resizeCanvas() {
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(rect.width*dpr);
    canvas.height=Math.round(rect.height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resizeCanvas);

  let last=performance.now();
  function loop(now) {
    const dt=Math.min(.05, Math.max(.001,(now-last)/1000));
    last=now;
    update(dt);
    render(dt);
    requestAnimationFrame(loop);
  }

  loadImages().then(()=>{
    resizeCanvas();
    resetGame();
    requestAnimationFrame(loop);
  });
})();