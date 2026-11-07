'use strict';
(() => {
  const missions = window.BIOQUEST_MISSIONS;
  const KEY = 'bioquest.guardians.grade4.v1';
  const app = document.getElementById('app');
  const soundButton = document.getElementById('sound');
  const fullscreen = document.getElementById('fullscreen');
  const initial = () => ({ completed: [], checkpoint: null, sound: false });
  let state = initial();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
      state.completed = Array.isArray(saved.completed) ? saved.completed.filter(id => missions.some(m => m.id === id)) : [];
      state.checkpoint = saved.checkpoint && typeof saved.checkpoint === 'object' ? saved.checkpoint : null;
      state.sound = saved.sound === true;
    }
  } catch (_) { /* The game remains playable when storage is blocked. */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
  let audio, musicTimer, tuneStep = 0, currentTheme = 0;
  const melodies = [[0,4,7,4,9,7,4,2],[0,3,7,10,7,3,5,7],[0,5,9,7,5,2,4,7],[0,3,7,5,10,7,3,2],[0,4,7,11,9,7,5,4]];
  function tone(freq, duration, volume, type = 'sine') {
    if (!state.sound || !audio) return;
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audio.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration + .03);
  }
  function music() {
    clearInterval(musicTimer);
    if (!state.sound || !audio) return;
    musicTimer = setInterval(() => {
      if (document.hidden || !state.sound) return;
      const notes = melodies[currentTheme % melodies.length];
      tone(220 * Math.pow(2, notes[tuneStep++ % notes.length] / 12), .65, .035, 'sine');
    }, 450);
  }
  function soundLabel() { soundButton.innerHTML = `♪ <span>Sound ${state.sound ? 'on' : 'off'}</span>`; soundButton.setAttribute('aria-label', `Turn sound ${state.sound ? 'off' : 'on'}`); }
  soundButton.addEventListener('click', async () => {
    state.sound = !state.sound;
    if (state.sound) {
      try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); await audio.resume(); music(); tone(660,.14,.055); }
      catch (_) { state.sound = false; }
    } else clearInterval(musicTimer);
    save(); soundLabel();
  });
  // Browsers require a gesture before audio can resume, even when a preference was saved.
  document.addEventListener('pointerdown', () => { if (state.sound && !audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); music(); } catch (_) {} } }, {once:true});
  soundLabel();
  if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
    fullscreen.hidden = false;
    fullscreen.addEventListener('click', () => { const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); Promise.resolve(request).catch(() => {}); });
    document.addEventListener('fullscreenchange', () => { fullscreen.innerHTML = document.fullscreenElement ? '⛶ <span>Exit fullscreen</span>' : '⛶ <span>Fullscreen</span>'; });
  }
  function unlocked(index) { return index === 0 || missions.slice(0,index).every(m => state.completed.includes(m.id)); }
  function home() {
    currentTheme = 0; tuneStep = 0;
    app.innerHTML = ''; app.append(document.getElementById('home-template').content.cloneNode(true));
    const completed = missions.filter(m => state.completed.includes(m.id)).length;
    document.getElementById('progress').textContent = `${completed} / ${missions.length} restored`;
    const list = document.getElementById('missions');
    missions.forEach((m,i) => {
      const done = state.completed.includes(m.id), open = unlocked(i);
      const button = document.createElement('button'); button.type = 'button'; button.className = `mission-card ${m.theme}`; button.disabled = !open;
      button.innerHTML = `<span class="card-number">${String(i+1).padStart(2,'0')}</span><span class="card-icon" aria-hidden="true">${m.icon}</span><span class="card-place">${m.place}</span><strong>${m.title}</strong><span class="card-status">${done ? '✓ Completed · Replay' : open ? 'Explore mission →' : '🔒 Complete previous mission'}</span>`;
      button.addEventListener('click', () => begin(i, false)); list.append(button);
    });
    const next = missions.findIndex((m,i) => unlocked(i) && !state.completed.includes(m.id));
    const checkpoint = state.checkpoint;
    const resume = checkpoint && missions.findIndex((m,i) => m.id === checkpoint.mission && unlocked(i));
    const index = Number.isInteger(resume) && resume >= 0 ? resume : next >= 0 ? next : 0;
    const btn = document.getElementById('continue');
    btn.firstChild.textContent = checkpoint && index === resume ? 'Continue mission ' : completed ? 'Continue exploring ' : 'Start exploring ';
    btn.addEventListener('click', () => begin(index, true));
  }
  let index = 0, task = 0, item = 0, mistakes = 0;
  function begin(i, resume) {
    if (!unlocked(i)) return;
    index = i; task = 0; item = 0; mistakes = 0; currentTheme = i; tuneStep = 0;
    const cp = state.checkpoint;
    if (resume && cp && cp.mission === missions[i].id && Number.isInteger(cp.task) && cp.task >= 0 && cp.task < missions[i].tasks.length) {
      task = cp.task; item = Number.isInteger(cp.item) && cp.item >= 0 && cp.item < (missions[i].tasks[task].items?.length || 1) ? cp.item : 0;
      mistakes = Number.isInteger(cp.mistakes) && cp.mistakes >= 0 ? cp.mistakes : 0;
      renderTask();
    } else intro();
  }
  function checkpoint() { state.checkpoint = {mission:missions[index].id, task, item, mistakes}; save(); }
  function intro() {
    const m = missions[index];
    app.innerHTML = `<section class="mission-shell"><button class="back" id="back">← Field journal</button><div class="brief ${m.theme}"><div class="brief-art" aria-hidden="true"><span>${m.icon}</span><i>✦</i></div><div><p class="eyebrow">MISSION ${index+1} · ${m.place.toUpperCase()}</p><h1>${m.title}</h1><p>${m.intro}</p><div class="dialogue"><span>👩🏽‍🔬</span><p><strong>Nala says</strong><br>${m.learn}</p></div><button class="primary" id="start">Begin investigation →</button></div></div></section>`;
    document.getElementById('back').onclick = home;
    document.getElementById('start').onclick = () => { checkpoint(); renderTask(); };
    app.focus({preventScroll:true});
  }
  function renderTask() {
    checkpoint();
    const m = missions[index], t = m.tasks[task], sorted = t.kind === 'sort', current = sorted ? t.items[item] : null;
    app.innerHTML = `<section class="mission-shell"><div class="mission-nav"><button class="back" id="back">← Field journal</button><span>MISSION ${index+1} / ${missions.length}</span></div><div class="task-layout"><aside class="field-card ${m.theme}"><span class="field-icon" aria-hidden="true">${m.icon}</span><p class="eyebrow">${m.place}</p><h2>${m.title}</h2><p>${m.learn}</p><div class="steps">${m.tasks.map((_,i)=>`<span class="${i<task?'done':i===task?'active':''}">${i<task?'✓':i+1}</span>`).join('')}</div></aside><div class="question-card"><div class="question-top"><span>INVESTIGATION ${task+1} / ${m.tasks.length}</span><span>${sorted ? `DISCOVERY ${item+1} / ${t.items.length}` : 'THINK IT THROUGH'}</span></div><h1>${t.prompt}</h1>${sorted ? `<div class="specimen"><span aria-hidden="true">${current.icon}</span><strong>${current.name}</strong></div><p class="choose-label">Choose a match</p>` : ''}<div class="choices" id="choices"></div><button class="hint" id="hint">✦ Ask Pip for a hint</button><p class="hint-text" id="hint-text" hidden></p><div id="feedback" class="feedback" aria-live="polite"></div></div></div></section>`;
    document.getElementById('back').onclick = home;
    const choices = sorted ? t.groups : t.options;
    choices.forEach((label, n) => { const b = document.createElement('button'); b.className = 'choice'; b.type='button'; b.textContent=label; b.onclick=()=>answer(sorted ? label === current.group : n === t.answer); document.getElementById('choices').append(b); });
    document.getElementById('hint').onclick = () => { document.getElementById('hint-text').textContent = `Pip: ${t.hint}`; document.getElementById('hint-text').hidden = false; };
    app.focus({preventScroll:true});
  }
  function answer(correct) {
    const t = missions[index].tasks[task], feedback = document.getElementById('feedback');
    if (!correct) { mistakes++; checkpoint(); tone(180,.16,.04,'triangle'); feedback.className='feedback retry'; feedback.textContent='Not quite. Look at the clue and try again — you can ask Pip for help.'; return; }
    tone(660,.16,.05); setTimeout(()=>tone(880,.22,.04),120);
    for (const b of document.querySelectorAll('#choices button')) b.disabled = true;
    if (t.kind === 'sort' && item < t.items.length-1) { item++; checkpoint(); feedback.className='feedback success'; feedback.innerHTML='<strong>Great match!</strong> <button class="next" id="next">Next discovery →</button>'; document.getElementById('next').onclick=renderTask; }
    else { feedback.className='feedback success'; feedback.innerHTML=`<strong>Discovery recorded!</strong><p>${t.explain}</p><button class="next" id="next">${task < missions[index].tasks.length-1 ? 'Next investigation' : 'Complete mission'} →</button>`; document.getElementById('next').onclick=()=>{ task++; item=0; if(task < missions[index].tasks.length) renderTask(); else complete(); }; }
  }
  function complete() {
    const m = missions[index];
    if (!state.completed.includes(m.id)) state.completed.push(m.id);
    state.checkpoint = null; save(); tone(523,.3,.05); setTimeout(()=>tone(784,.4,.05),180);
    const last = index === missions.length - 1;
    app.innerHTML = `<section class="complete"><span class="celebrate" aria-hidden="true">${last?'🏡':'🌟'}</span><p class="eyebrow">MISSION COMPLETE</p><h1>${last?'The centre is coming to life!':'A new discovery!'}</h1><p>${last?'Nala and Pip have reopened the nature research centre. Your observations will help the team protect the living world.':`You helped restore the ${m.place.toLowerCase()} and recorded three investigations in your field journal.`}</p><div class="reward">✦ ${mistakes === 0 ? 'Careful observer' : 'Persistent explorer'} · ${mistakes === 1 ? '1 retry' : `${mistakes} retries`}</div><div class="complete-actions">${last?'': '<button class="primary" id="next-mission">Next mission →</button>'}<button class="secondary" id="journal">Return to journal</button></div></section>`;
    document.getElementById('journal').onclick=home;
    if (!last) document.getElementById('next-mission').onclick=()=>begin(index+1,false);
    app.focus({preventScroll:true});
  }
  home();
})();
