(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const stage = $('stage');
  const fxLayer = $('fxLayer');

  const elScore = $('score');
  const elTime = $('time');
  const elStreak = $('streak');
  const elBest = $('best');
  const elLevelBadge = $('levelBadge');
  const elMissionText = $('missionText');
  const elMissionProgress = $('missionProgress');
  const elMissionFill = $('missionFill');
  const elPowerStatus = $('powerStatus');
  const elDifficultyLabel = $('difficultyLabel');

  const elTitle = $('ggTitle');
  const elSub = $('ggSub');
  const panel = $('panel');
  const panelTitle = $('panelTitle');
  const panelText = $('panelText');

  const elTarget = $('target');
  const elEntry = $('entry');
  const elHint = $('hint');
  const elToast = $('toast');
  const elKeys = $('keys');
  const elSlots = $('letterSlots');

  const btnStart = $('btnStart');
  const btnInfo = $('btnInfo');
  const btnPause = $('btnPause');
  const btnSubmit = $('btnSubmit');
  const btnRestart = $('btnRestart');
  const btnMute = $('btnMute');

  const btnBack = $('btnBack');
  const btnEnter = $('btnEnter');
  const btnClear = $('btnClear');
  const btnHint = $('btnHint');
  const btnFreeze = $('btnFreeze');
  const btnTime = $('btnTime');

  const GAME_SLUG = 'word-dash';
  const BEST_KEY = 'gg_word_dash_best_v2';

  let META = { title: 'Word Dash', description: '' };
  async function loadMeta() {
    try {
      const res = await fetch('./game.json', { cache: 'no-store' });
      META = (await res.json()) || META;
      const title = META.title || 'Word Dash';
      document.title = title;
      if (elTitle) elTitle.textContent = title;
      if (panelTitle) panelTitle.textContent = title;
      if (META.description && panelText) panelText.textContent = META.description;
      if (elSub) elSub.textContent = 'Type fast • Keep streaks • Complete missions';
      try { window.GG?.init?.({ title }); } catch {}
      try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    } catch {}
  }
  loadMeta();

  const LEVELS = [
    {
      name: 'Neon Library',
      bg: './assets/backgrounds/bg-library.png',
      time: 45,
      goalWords: 8,
      goalScore: 450,
      maxMisses: 5,
      minStreak: 3,
      label: 'Easy words',
      words: ['PLAN','MAP','CODE','GAME','DASH','WORD','TYPE','FAST','DATA','FOCUS','SMART','SCORE','LEVEL','SKILL','POWER','BRAIN']
    },
    {
      name: 'City Billboard Sprint',
      bg: './assets/backgrounds/bg-city-words.png',
      time: 48,
      goalWords: 10,
      goalScore: 850,
      maxMisses: 4,
      minStreak: 4,
      label: 'Medium words',
      words: ['GLORY','RACER','SWIPE','TOWER','BRICK','PIXEL','ARENA','QUEST','CRAFT','BOOST','SYSTEM','VECTOR','ROBOT','LASER','MOTION','SPRINT']
    },
    {
      name: 'Mountain Focus Trail',
      bg: './assets/backgrounds/bg-mountain-focus.png',
      time: 52,
      goalWords: 12,
      goalScore: 1350,
      maxMisses: 3,
      minStreak: 5,
      label: 'Longer words',
      words: ['FUSION','ORBIT','VORTEX','SPARK','STORM','FLAME','FROST','BLADE','SHIELD','COMBO','BONUS','MATRIX','GALAXY','ROCKET','PLAYER','TARGET']
    },
    {
      name: 'Cosmic Word Grid',
      bg: './assets/backgrounds/bg-neon-letters.png',
      time: 58,
      goalWords: 15,
      goalScore: 2100,
      maxMisses: 2,
      minStreak: 6,
      label: 'Expert words',
      words: ['HYPERDRIVE','ASTEROID','NEBULA','KEYBOARD','VICTORY','CHAMPION','MISSION','LANGUAGE','VELOCITY','QUANTUM','STREAK','PERFECT','REACTOR','COMMAND','LEGEND']
    }
  ];

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    levelClear: false,
    victory: false,
    levelIndex: 0,
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    timeLeft: 45,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    misses: 0,
    target: 'READY',
    entry: '',
    hintUsed: false,
    freezeCharges: 1,
    hintCharges: 1,
    timeCharges: 1,
    freezeTimer: 0,
    lastToastT: 0,
    roundWords: [],
  };

  // ---------------- Score bridge ----------------
  let lastLiveScore = -1, lastLiveAt = 0;
  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 140) return;
    if (mode === 'live' && now - lastLiveAt < 90) return;
    lastLiveScore = clean;
    lastLiveAt = now;
    const payload = {
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score: clean,
      best: state.best,
      level: state.levelIndex + 1,
      streak: state.streak,
      correct: state.correct,
      misses: state.misses,
      mode,
    };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type: 'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type: 'gg:score', ...payload, payload }, '*'); } catch {}
  }

  // ---------------- Audio ----------------
  let AC = null, master = null, musicTimer = null, musicStep = 0, muted = false;
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
  function tone(freq, dur = 0.08, type = 'sine', gain = 0.05, delay = 0) {
    const ac = ensureAudio();
    if (!ac || muted) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master || ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  function noise(dur = 0.12, gain = 0.04) {
    const ac = ensureAudio();
    if (!ac || muted) return;
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource();
    const g = ac.createGain();
    src.buffer = buf;
    g.gain.value = gain;
    src.connect(g); g.connect(master || ac.destination);
    src.start(); src.stop(ac.currentTime + dur);
  }
  function sfx(name) {
    if (name === 'start') { tone(320,.05,'triangle',.05); tone(520,.06,'triangle',.04,.05); return; }
    if (name === 'type') { tone(620,.025,'sine',.018); return; }
    if (name === 'correct') { tone(700,.04,'triangle',.045); tone(1050,.05,'triangle',.035,.035); return; }
    if (name === 'perfect') { tone(820,.05,'triangle',.05); tone(1230,.06,'triangle',.045,.04); tone(1640,.08,'sine',.035,.09); return; }
    if (name === 'wrong') { noise(.11,.04); tone(170,.12,'sawtooth',.045); return; }
    if (name === 'power') { tone(460,.06,'triangle',.045); tone(760,.08,'sine',.035,.05); return; }
    if (name === 'level') { tone(420,.05,'triangle',.05); tone(660,.08,'triangle',.04,.05); tone(980,.1,'sine',.035,.11); return; }
    if (name === 'gameover') { tone(220,.12,'sawtooth',.055); tone(160,.16,'sine',.045,.1); tone(110,.2,'sine',.04,.22); return; }
  }
  function musicTick() {
    if (!state.running || state.paused || muted) return;
    const notes = [147, 196, 247, 294, 247, 196, 220, 294];
    const n = notes[musicStep++ % notes.length];
    tone(n, .10, 'triangle', .010);
    if (musicStep % 2 === 0) tone(n * 2, .05, 'sine', .007, .03);
  }
  function startMusic() { if (!musicTimer && !muted) musicTimer = setInterval(musicTick, 250); }
  function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; }

  function currentLevel() { return LEVELS[state.levelIndex]; }
  function levelTitle() { return `Level ${state.levelIndex + 1} • ${currentLevel().name}`; }
  function missionText() {
    const lvl = currentLevel();
    return `Words ${state.correct}/${lvl.goalWords} • Score ${Math.floor(state.score)}/${lvl.goalScore} • Best streak ${state.bestStreak}/${lvl.minStreak} • Misses ${state.misses}/${lvl.maxMisses}`;
  }
  function missionProgress() {
    const lvl = currentLevel();
    return Math.min(
      state.correct / lvl.goalWords,
      state.score / lvl.goalScore,
      state.bestStreak / lvl.minStreak,
      1 - Math.min(1, state.misses / Math.max(1, lvl.maxMisses + 1))
    );
  }
  function isMissionComplete() {
    const lvl = currentLevel();
    return state.correct >= lvl.goalWords &&
      state.score >= lvl.goalScore &&
      state.bestStreak >= lvl.minStreak &&
      state.misses <= lvl.maxMisses;
  }
  function setStageBackground() {
    if (stage) stage.style.setProperty('--stage-bg', `url("${currentLevel().bg}")`);
    if (elLevelBadge) elLevelBadge.textContent = levelTitle();
    if (elDifficultyLabel) elDifficultyLabel.textContent = currentLevel().label;
  }

  function pickWord() {
    const words = currentLevel().words;
    let w = words[(Math.random() * words.length) | 0];
    let guard = 0;
    while (w === state.target && guard++ < 10) w = words[(Math.random() * words.length) | 0];
    return w;
  }
  function setTarget(word) {
    state.target = word.toUpperCase();
    if (elTarget) elTarget.textContent = state.target;
    renderSlots();
  }
  function setEntry(s) {
    state.entry = String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 18);
    if (elEntry) {
      elEntry.textContent = state.entry || ' ';
      elEntry.classList.remove('good', 'bad');
    }
    renderSlots();
  }
  function renderSlots() {
    if (!elSlots) return;
    elSlots.innerHTML = '';
    const typed = state.entry;
    [...state.target].forEach((ch, i) => {
      const slot = document.createElement('div');
      slot.className = 'slot' + (typed[i] === ch ? ' done' : '');
      slot.textContent = typed[i] || '';
      elSlots.appendChild(slot);
    });
  }
  function toast(message, kind = 'neutral') {
    if (!elToast) return;
    elToast.textContent = message;
    elToast.style.color = kind === 'good' ? 'rgba(34,197,94,.95)' : kind === 'bad' ? 'rgba(244,63,94,.95)' : 'rgba(255,255,255,.86)';
    state.lastToastT = performance.now();
  }
  function showPanel(title, text, startLabel = 'Start') {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (btnStart) btnStart.textContent = startLabel;
    if (panel) panel.style.display = 'flex';
  }
  function hidePanel() {
    if (panel) panel.style.display = 'none';
  }
  function updateHUD() {
    if (elScore) elScore.textContent = String(Math.floor(state.score));
    if (elTime) elTime.textContent = Math.max(0, state.timeLeft).toFixed(1);
    if (elStreak) elStreak.textContent = String(state.streak);
    if (elBest) elBest.textContent = String(state.best);
    if (elMissionText) elMissionText.textContent = missionText();
    const prog = Math.max(0, Math.min(1, missionProgress()));
    if (elMissionProgress) elMissionProgress.textContent = `${Math.round(prog * 100)}%`;
    if (elMissionFill) elMissionFill.style.width = `${Math.round(prog * 100)}%`;
    if (elPowerStatus) elPowerStatus.textContent = `Hint ${state.hintCharges} • Freeze ${state.freezeCharges} • +Time ${state.timeCharges}`;
    if (btnHint) btnHint.disabled = !state.running || state.paused || state.hintCharges <= 0;
    if (btnFreeze) btnFreeze.disabled = !state.running || state.paused || state.freezeCharges <= 0;
    if (btnTime) btnTime.disabled = !state.running || state.paused || state.timeCharges <= 0;
    postScore('live');
  }

  function resetLevelState() {
    const lvl = currentLevel();
    state.running = false;
    state.paused = false;
    state.gameOver = false;
    state.levelClear = false;
    state.victory = false;
    state.timeLeft = lvl.time;
    state.streak = 0;
    state.bestStreak = 0;
    state.correct = 0;
    state.misses = 0;
    state.entry = '';
    state.target = 'READY';
    state.hintUsed = false;
    state.freezeCharges = 1 + (state.levelIndex < 2 ? 1 : 0);
    state.hintCharges = 1;
    state.timeCharges = 1;
    state.freezeTimer = 0;
    setStageBackground();
    setEntry('');
    setTarget('READY');
    toast('Tap Start to begin.', 'neutral');
  }
  function resetRun() {
    state.levelIndex = 0;
    state.score = 0;
    lastLiveScore = -1;
    resetLevelState();
    updateHUD();
    showPanel(META.title || 'Word Dash', META.description || 'Match target words, clear missions, and unlock every level.', 'Start');
  }
  function startLevel() {
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    state.levelClear = false;
    state.victory = false;
    setEntry('');
    setTarget(pickWord());
    hidePanel();
    toast('Go!', 'neutral');
    ensureAudio();
    sfx('start');
    startMusic();
    updateHUD();
  }
  function loadNextLevel() {
    state.levelIndex += 1;
    resetLevelState();
    updateHUD();
    showPanel(levelTitle(), `Mission:\n${missionText()}\n\nClear this route before time runs out.`, 'Start next level');
  }
  function completeLevel() {
    state.running = false;
    state.levelClear = true;
    stopMusic();
    sfx('level');
    spawnFx(window.innerWidth / 2, window.innerHeight * 0.35, 'LEVEL CLEAR!', '#ffe08a', 34);
    if (state.score > state.best) {
      state.best = Math.floor(state.score);
      localStorage.setItem(BEST_KEY, String(state.best));
    }
    if (state.levelIndex >= LEVELS.length - 1) {
      state.victory = true;
      postScore('victory');
      showPanel('Word Dash Champion!', `You cleared all ${LEVELS.length} levels.\n\nFinal score: ${Math.floor(state.score)} • Best: ${state.best}\nTap Start to play again.`, 'Play again');
    } else {
      showPanel('Level Complete!', `${levelTitle()} cleared.\n\nScore: ${Math.floor(state.score)}\nNext: Level ${state.levelIndex + 2} • ${LEVELS[state.levelIndex + 1].name}`, 'Next level');
    }
    updateHUD();
  }
  function endGame(reason) {
    state.gameOver = true;
    state.running = false;
    state.paused = false;
    stopMusic();
    if (state.score > state.best) {
      state.best = Math.floor(state.score);
      localStorage.setItem(BEST_KEY, String(state.best));
    }
    sfx('gameover');
    postScore('game_over');
    showPanel('Time!', `${reason}\n\nScore: ${Math.floor(state.score)} • Best: ${state.best}\nReached: ${levelTitle()}\nTap Start to try again.`, 'Restart run');
    updateHUD();
  }
  function togglePause() {
    if (!state.running || state.gameOver || state.levelClear || state.victory) return;
    state.paused = !state.paused;
    if (state.paused) { stopMusic(); showPanel('Paused', 'Tap Start or Pause to continue.', 'Resume'); }
    else { hidePanel(); startMusic(); }
  }

  function multiplierForStreak(s) {
    if (s >= 15) return 2.5;
    if (s >= 10) return 2.0;
    if (s >= 6) return 1.6;
    if (s >= 3) return 1.3;
    return 1;
  }
  function submitWord() {
    if (!state.running || state.paused || state.gameOver || state.levelClear) return;
    const typed = state.entry.trim().toUpperCase();
    const targ = state.target.toUpperCase();
    if (!typed) { toast('Type the word first.', 'bad'); sfx('wrong'); return; }

    if (typed === targ) {
      state.correct += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      const mult = multiplierForStreak(state.streak);
      const base = Math.max(3, targ.length);
      let gained = Math.round(base * 18 * mult);
      if (!state.hintUsed) gained += 20;
      state.score += gained;
      const bonusTime = Math.min(2.5, 0.8 + targ.length * 0.08 + state.streak * 0.03);
      state.timeLeft += bonusTime;
      toast(`+${gained}  x${mult.toFixed(1)}  +${bonusTime.toFixed(1)}s`, 'good');
      sfx(state.streak >= 3 ? 'perfect' : 'correct');
      if (elEntry) { elEntry.classList.add('good'); setTimeout(() => elEntry.classList.remove('good'), 170); }
      spawnFx(window.innerWidth / 2, window.innerHeight * 0.38, `+${gained}`, '#8dffcc', 24);
      burst(window.innerWidth / 2, window.innerHeight * 0.42, 'rgba(34,197,94,.9)');
      state.hintUsed = false;
      setEntry('');
      setTarget(pickWord());
      if (isMissionComplete()) completeLevel();
    } else {
      state.streak = 0;
      state.misses += 1;
      state.timeLeft -= 1.4;
      toast(`Wrong — ${state.misses}/${currentLevel().maxMisses} misses`, 'bad');
      sfx('wrong');
      if (elEntry) { elEntry.classList.add('bad'); setTimeout(() => elEntry.classList.remove('bad'), 170); }
      spawnFx(window.innerWidth / 2, window.innerHeight * 0.42, 'MISS', '#ff8aa0', 22);
      setEntry('');
      if (state.misses > currentLevel().maxMisses) {
        endGame('Too many missed words.');
      }
    }
    updateHUD();
  }

  function addLetter(ch) {
    if (!state.running || state.paused || state.gameOver || state.levelClear) return;
    setEntry(state.entry + ch);
    sfx('type');
    // auto-submits when exact length is reached, but allows wrong words to be corrected if not full length yet
    if ((state.entry + ch).length === state.target.length) setTimeout(() => submitWord(), 80);
  }
  function backspace() {
    if (!state.running || state.paused || state.gameOver || state.levelClear) return;
    if (!state.entry) return;
    setEntry(state.entry.slice(0, -1));
  }
  function clearEntry() {
    if (!state.running || state.paused || state.gameOver || state.levelClear) return;
    setEntry('');
  }

  function useHint() {
    if (!state.running || state.paused || state.hintCharges <= 0) return;
    state.hintCharges -= 1;
    state.hintUsed = true;
    const next = state.target[state.entry.length] || state.target[0];
    setEntry(state.entry + next);
    toast('Hint added a letter.', 'neutral');
    sfx('power');
    updateHUD();
  }
  function useFreeze() {
    if (!state.running || state.paused || state.freezeCharges <= 0) return;
    state.freezeCharges -= 1;
    state.freezeTimer = 5.0;
    toast('Timer frozen for 5 seconds.', 'neutral');
    spawnFx(window.innerWidth / 2, window.innerHeight * 0.35, 'FREEZE', '#9ed7ff', 28);
    sfx('power');
    updateHUD();
  }
  function useTime() {
    if (!state.running || state.paused || state.timeCharges <= 0) return;
    state.timeCharges -= 1;
    state.timeLeft += 6;
    toast('+6 seconds added.', 'good');
    spawnFx(window.innerWidth / 2, window.innerHeight * 0.35, '+6s', '#ffe08a', 28);
    sfx('power');
    updateHUD();
  }

  function buildKeys() {
    if (!elKeys) return;
    elKeys.innerHTML = '';
    const rows = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['Z','X','C','V','B','N','M']
    ];
    rows.forEach((row, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'krow';
      if (idx === 1) wrap.style.paddingLeft = '4%';
      if (idx === 2) wrap.style.paddingLeft = '9%';
      row.forEach((ch) => {
        const btn = document.createElement('button');
        btn.className = 'key';
        btn.textContent = ch;
        btn.type = 'button';
        btn.addEventListener('click', () => addLetter(ch));
        wrap.appendChild(btn);
      });
      elKeys.appendChild(wrap);
    });
  }

  function spawnFx(x, y, text, color = '#fff', size = 24) {
    if (!fxLayer) return;
    const el = document.createElement('div');
    el.className = 'fx';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    el.style.fontSize = `${size}px`;
    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
  function burst(x, y, color = 'rgba(255,255,255,.9)') {
    if (!fxLayer) return;
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('div');
      el.className = 'spark';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.background = color;
      const a = Math.random() * Math.PI * 2;
      const d = 40 + Math.random() * 110;
      el.style.setProperty('--dx', `${Math.cos(a) * d}px`);
      el.style.setProperty('--dy', `${Math.sin(a) * d}px`);
      fxLayer.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }
  }

  btnStart?.addEventListener('click', () => {
    ensureAudio();
    if (state.victory || state.gameOver) { resetRun(); startLevel(); return; }
    if (state.levelClear) { loadNextLevel(); startLevel(); return; }
    if (!state.running) startLevel();
    else if (state.paused) { state.paused = false; hidePanel(); startMusic(); }
  });
  btnInfo?.addEventListener('click', () => {
    if (state.running && !state.paused) { state.paused = true; stopMusic(); }
    showPanel('How to play', 'Type the target word using your keyboard or the on-screen keypad.\n\n• Correct words build streak multipliers\n• Wrong words cost time and increase misses\n• Complete each level mission to unlock the next word world\n• Hint adds the next letter\n• Freeze stops the timer briefly\n• +Time adds six seconds');
  });
  btnPause?.addEventListener('click', togglePause);
  btnSubmit?.addEventListener('click', () => postScore('manual_submit'));
  btnRestart?.addEventListener('click', () => { resetRun(); startLevel(); });
  btnMute?.addEventListener('click', () => {
    muted = !muted;
    btnMute.textContent = muted ? 'Muted' : 'Sound';
    if (muted) stopMusic(); else if (state.running && !state.paused) startMusic();
  });
  btnBack?.addEventListener('click', backspace);
  btnEnter?.addEventListener('click', submitWord);
  btnClear?.addEventListener('click', clearEntry);
  btnHint?.addEventListener('click', useHint);
  btnFreeze?.addEventListener('click', useFreeze);
  btnTime?.addEventListener('click', useTime);

  window.addEventListener('keydown', (e) => {
    if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) addLetter(e.key.toUpperCase());
    else if (e.key === 'Backspace') { e.preventDefault(); backspace(); }
    else if (e.key === 'Enter') { e.preventDefault(); submitWord(); }
    else if (e.key === 'Escape') clearEntry();
    else if (e.key.toLowerCase() === 'p') togglePause();
    else if (e.key.toLowerCase() === 'r') { resetRun(); startLevel(); }
  });

  window.addEventListener('message', (ev) => {
    const data = ev.data || {};
    const type = data.type || data.event;
    if (type === 'GG_PAUSE') {
      state.paused = !!(data.payload?.paused ?? data.paused);
      if (state.paused) stopMusic(); else if (state.running) startMusic();
    }
    if (type === 'GG_MUTE') {
      muted = !!(data.payload?.muted ?? data.muted);
      if (btnMute) btnMute.textContent = muted ? 'Muted' : 'Sound';
      if (muted) stopMusic();
    }
    if (type === 'GG_RESTART') { resetRun(); startLevel(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { state.paused = true; stopMusic(); } });

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (state.running && !state.paused && !state.gameOver && !state.levelClear && !state.victory) {
      if (state.freezeTimer > 0) state.freezeTimer = Math.max(0, state.freezeTimer - dt);
      else state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        endGame('You ran out of time.');
      }
    }
    // clear old toast
    if (performance.now() - state.lastToastT > 1900 && elToast && state.running) {
      if (!elToast.textContent.includes('Tap')) elToast.textContent = '';
    }
    updateHUD();
    requestAnimationFrame(loop);
  }

  buildKeys();
  resetRun();
  requestAnimationFrame(loop);
})();