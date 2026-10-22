(() => {
  'use strict';
  const L = window.RecycleLearning;
  const $ = id => document.getElementById(id);
  const root = $('storyRoot');
  const P = L.play;
  let modalKind = '', circuitPainter, grimePainter, battlePainter, workPainter, walkTimer, drag = null;
  let store = L.normalize(read());
  let session = store.session, active = false, paused = true, routePage = 0, returnFocus = null, poseTimer, lastTick = 0, lastSecond = 0, lastPublished = -1;
  const sound = window.RecycleSound.create(window, preferences());
  const onPress = window.RecycleInput.create(document, () => performance.now(), () => !!drag?.moved);
  function read() { try { return JSON.parse(localStorage.getItem(L.SAVE_KEY)); } catch { return null; } }
  function preferences() { return window.RecycleArcade?.preferences() || { music: .45, sfx: .75, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }; }
  function persist() {
    store.session = session;
    try { localStorage.setItem(L.SAVE_KEY, JSON.stringify(store)); $('storySaveStatus').textContent = 'Checkpoint saved on this device'; }
    catch { $('storySaveStatus').textContent = 'Saving unavailable · keep this tab open'; }
  }
  function mission() { return L.missions.find(m => m.id === session?.mission) || L.missions[0]; }
  function index() { return L.missions.indexOf(mission()); }
  function pose(name) {
    clearTimeout(poseTimer); $('storyCircuit').dataset.pose = name;
    if (name !== 'celebrate') poseTimer = setTimeout(() => { $('storyCircuit').dataset.pose = 'idle'; }, 900);
  }
  function announce(text, kind = '') { $('storyStatus').textContent = text; $('storyStatus').dataset.kind = kind; }
  function publish(mode) {
    if (lastPublished === session.score && mode === 'live') return;
    lastPublished = session.score;
    const payload = { type: 'GG_SCORE', gameSlug: 'recycle-rush', slug: 'recycle-rush', score: session.score, level: `story-${index() + 1}`, mode };
    try { window.GG?.setScore?.(session.score, { gameSlug: 'recycle-rush' }); } catch {}
    if (mode !== 'live') { try { window.GG?.submitScore?.(session.score, { gameSlug: 'recycle-rush' }); } catch {} }
    try { window.parent.postMessage(payload, '*'); } catch {}
  }
  function renderMenu() {
    const count = Object.keys(store.stars).length;
    $('storySummary').textContent = `${count}/${L.missions.length} story missions restored · 18 recovery tasks and three saved areas per mission. Your 20 arcade missions remain available below.`;
    $('storyStartBtn').textContent = session && !session.complete ? 'Continue Story' : count === L.missions.length ? 'Replay Story' : count ? 'Next Story Mission' : 'Begin Story';
    const list = $('storyMissionList'); list.replaceChildren();
    L.missions.forEach((m, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.disabled = i > store.unlocked;
      b.textContent = `${i + 1}. ${m.title}${store.stars[m.id] ? ' · ' + '★'.repeat(store.stars[m.id]) : i > store.unlocked ? ' · Locked' : ''}`;
      onPress(b, () => open(i)); list.append(b);
    });
  }
  function open(requested) {
    document.dispatchEvent(new Event('recycle:story-open'));
    const next = Math.min(store.unlocked, L.missions.length - 1);
    const chosen = Number.isInteger(requested) ? requested : session && !session.complete ? L.missions.findIndex(m => m.id === session.mission) : next;
    if (chosen < 0 || chosen > Math.min(store.unlocked, L.missions.length - 1)) return;
    if (!session || session.mission !== L.missions[chosen].id || session.complete) session = L.fresh(L.missions[chosen].id);
    active = true; paused = true; routePage = 0;
    document.body.classList.add('story-active'); root.hidden = false;
    document.querySelector('.game-shell').inert = true; $('screenOverlay').inert = true;
    sound.volumes(preferences());
    mountFullscreen();
    render(); persist();
    modal(L.requestReady(session) ? 'request' : battleReady() ? 'battle' : session.done.length === mission().sets[session.stop].length ? 'checkpoint' : 'briefing');
  }
  function exit() {
    cancelDrag(); clearTimeout(walkTimer); sound.pause(); active = false; paused = true; persist();
    root.hidden = true; $('storyModalShade').hidden = true;
    document.body.classList.remove('story-active'); document.querySelector('.game-shell').inert = false; $('screenOverlay').inert = false;
    renderMenu(); document.dispatchEvent(new Event('recycle:story-exit'));
    mountFullscreen(); $('storyStartBtn').focus();
  }
  function mountFullscreen() {
    const control = document.querySelector('.wga-tab-fullscreen');
    if (control) (active ? $('storyFullscreen') : document.querySelector('.top-actions')).append(control);
    const status = document.querySelector('.wga-tab-status');
    if (status) (active ? $('storyFullscreen') : document.querySelector('.top-actions')).append(status);
  }
  function resume() {
    modalKind = ''; paused = false; $('storyModalShade').hidden = true;
    $('storyWorkspace').inert = false; $('storyFooter').inert = false;
    $('storyPauseBtn').textContent = 'Pause / Menu';
    sound.start(index());
    if (returnFocus?.isConnected && !returnFocus.disabled) returnFocus.focus(); else $('story-item-0')?.focus();
    lastTick = 0;
  }
  function action(kind, value) {
    if (!active || paused) return;
    if (kind !== 'select') clearTimeout(walkTimer);
    const result = L.act(session, kind, value);
    announce(result.text, result.kind);
    if (result.kind) { if (!['complete', 'checkpoint'].includes(result.kind)) sound.effect(result.kind); pose(result.kind === 'complete' ? 'celebrate' : result.kind === 'retry' ? 'worried' : result.kind); }
    if (kind === 'select' && result.ok) moveCircuit(value);
    render(); persist();
    if (result.kind === 'complete') {
      L.finish(store, session); persist(); publish('level_clear'); renderMenu(); modal('complete'); sound.effect('complete');
    } else if (result.kind === 'request') { modal('request'); }
    else if (result.kind === 'battle') { modal('battle'); }
    else if (result.kind === 'checkpoint') { modal('checkpoint'); sound.effect('checkpoint'); }
    else if (result.ok) publish('live');
    if (kind === 'select' && result.ok) (session.prepared.includes(value) || !P.kind(L.selectedItem(session)) ? $('storyHintBtn') : $('storyPrepareBtn')).focus({ preventScroll: true });
  }
  function render() {
    const m = mission(), item = L.selectedItem(session), progress = L.progress(session);
    $('storyMissionNumber').textContent = `Restore Verdale · Mission ${index() + 1}/${L.missions.length}`;
    $('storyTitle').textContent = m.title; $('storyScore').textContent = session.score;
    $('storyProgress').value = progress.done; $('storyProgress').max = progress.total;
    const play = P.hydrate(session);
    $('storyProgressText').textContent = `Area ${session.stop + 1}/3 · ${progress.done}/${progress.total} · Clean streak ${play.streak}`;
    $('storyPlace').textContent = m.stops[session.stop];
    $('storyScene').style.backgroundImage = `url("${m.background}")`;
    $('storyScene').style.setProperty('--healing', .35 + progress.fraction * .65);
    $('storyRestored').textContent = progress.done === 0 ? 'The recovery station needs your help.' : `${progress.done} items recovered · ${P.isBattle(m.id) ? 'Grime shield: ' + Math.round((1 - progress.fraction) * 100) + '%' : 'The neighbourhood is coming back to life.'}`;
    $('storyGrime').hidden = !P.isBattle(m.id) || session.complete;
    $('storyGrime').style.opacity = String(1 - progress.fraction * .8);
    const objects = $('storyObjects');
    if (objects.dataset.area !== `${m.id}-${session.stop}`) {
      objects.dataset.area = `${m.id}-${session.stop}`; objects.replaceChildren();
      m.sets[session.stop].forEach((id, i) => {
        const data = L.items[id], b = document.createElement('button'); b.type = 'button'; b.id = 'story-item-' + i; b.className = 'story-object'; b.dataset.item = String(i);
        const image = document.createElement('img'); image.src = data.icon; image.alt = ''; image.draggable = false; image.onerror = () => { image.onerror = null; image.src = data.legacyIcon; };
        const label = document.createElement('span'); label.textContent = data.name;
        b.append(image, label); onPress(b, () => action('select', i)); objects.append(b);
      });
    }
    [...objects.children].forEach((b, i) => { const data = L.items[m.sets[session.stop][i]]; const art = session.prepared.includes(i) ? data.preparedIcon || data.icon : data.icon; const image = b.querySelector('img'); if (image.getAttribute('src') !== art) image.src = art; b.classList.toggle('done', session.done.includes(i)); b.disabled = session.done.includes(i); b.setAttribute('aria-pressed', String(session.selected === i)); });
    $('storyItemName').textContent = item?.name || 'Choose an item';
    $('storyItemCondition').textContent = item ? `${item.material} · ${session.prepared.includes(session.selected) ? 'Activity complete · ready to route' : item.condition}` : 'Tap an object in the scene to collect and inspect it.';
    $('storyItemIcon').onerror = () => { $('storyItemIcon').onerror = null; $('storyItemIcon').src = item?.legacyIcon || 'assets/sprites/circuit-neutral.svg'; };
    const selectedArt = item && session.prepared.includes(session.selected) ? item.preparedIcon || item.icon : item?.icon;
    $('storyItemIcon').src = selectedArt || 'assets/animated/circuit-idle.webp';
    $('storyCarried').hidden = !item; if (item) { $('storyCarried').src = selectedArt; $('storyCarried').onerror = () => { $('storyCarried').hidden = true; }; }
    $('storyHintBtn').disabled = !item;
    const prep = P.kind(item) && !session.prepared.includes(session.selected) ? P.activities[P.kind(item)] : null;
    $('storyPrepareBtn').hidden = !prep; $('storyPrepareBtn').textContent = prep?.title || 'Prepare';
    const pages = Math.ceil(m.destinations.length / 4); routePage %= pages;
    $('storyRoutesBtn').hidden = pages === 1; $('storyRoutesBtn').textContent = `Other routes ${routePage + 1}/${pages}`;
    const destinations = $('storyDestinations'); destinations.replaceChildren();
    m.destinations.slice(routePage * 4, routePage * 4 + 4).forEach(id => {
      const route = L.routes[id], b = document.createElement('button'); b.type = 'button'; b.className = 'story-destination'; b.dataset.route = id;
      b.style.setProperty('--route-color', route.color); b.disabled = !item;
      const image = document.createElement('img'); image.src = route.icon; image.alt = ''; image.draggable = false; image.onerror = () => { image.onerror = null; image.src = route.legacyIcon; };
      const label = document.createElement('span'); label.textContent = route.label;
      b.append(image, label); onPress(b, () => action('route', id)); destinations.append(b);
    });
    const builds = $('storyBuilds'); builds.replaceChildren();
    Object.values(play.restored).forEach(id => { const node = document.createElement('span'); node.className = 'story-project project-' + id; node.title = P.projects[id].title; node.setAttribute('aria-label', P.projects[id].title); const img = document.createElement('img'); img.src = P.projects[id].icon; img.alt = ''; node.append(img); builds.append(node); });
    sound.setIntensity(progress.fraction);
    root.classList.toggle('reduced', preferences().reducedMotion);
  }
  function button(text, fn, primary = false) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = text;
    if (primary) b.className = 'story-primary'; onPress(b, fn); return b;
  }
  function paragraph(text, className) { const p = document.createElement('p'); p.textContent = text; if (className) p.className = className; return p; }
  function modal(kind) {
    if (!active) return;
    cancelDrag(); modalKind = kind;
    returnFocus = document.activeElement; paused = true; sound.pause();
    $('storyWorkspace').inert = true; $('storyFooter').inert = true;
    const box = $('storyModalContent'), m = mission(); box.replaceChildren();
    const title = $('storyModalTitle'); const actions = $('storyModalActions'); actions.replaceChildren();
    if (kind === 'briefing') {
      title.textContent = m.title;
      box.append(paragraph(m.subtitle, 'eyebrow'), paragraph(m.intro), paragraph(`${m.ally}: ${m.goal}`), ...(m.requests ? [paragraph('Community requests: after each area, help a neighbour choose a plan. Read the feedback, retry or use a clue. Each choice saves.', 'story-help')] : []), paragraph('Three areas · 18 tasks · no time limit. Tap to collect, or drag to sort. Prepare items with short hands-on activities, choose community upgrades and power The Loop. Each action saves; mistakes can be corrected.', 'story-help'));
      actions.append(button(session.done.length || session.stop || session.selected !== null || Object.keys(session.play.work).length ? 'Continue Mission' : 'Start Mission', () => { announce(m.goal); resume(); }, true));
    } else if (kind === 'request') {
      renderRequest(); return;
    } else if (kind === 'activity') {
      renderWork(); return;
    } else if (kind === 'battle') {
      renderBattle(); return;
    } else if (kind === 'checkpoint') {
      title.textContent = 'Area restored';
      box.append(paragraph(`${m.stops[session.stop]} is ready. Your checkpoint is saved.`, 'eyebrow'), paragraph($('storyStatus').textContent), paragraph('Take a breath, then move to the next area. The next checkpoint keeps all your completed work.'));
      const projects = document.createElement('div'); projects.className = 'restore-choices';
      box.append(paragraph('Use the materials you recovered to install one community project. Choose what your neighbourhood needs next.'));
      for (const [id, project] of Object.entries(P.projects)) { const b = button(project.title, () => { const result = L.act(session, 'restore', id); if (result.ok) { persist(); render(); modal('checkpoint'); sound.effect('build'); } }); b.dataset.upgrade = id; b.disabled = !!session.play.restored[session.stop]; const img = document.createElement('img'); img.src = project.icon; img.alt = ''; b.prepend(img); projects.append(b); }
      box.append(projects);
      const built = session.play.restored[session.stop]; if (built) box.append(paragraph(P.projects[built].fact, 'story-upgrade-status'));
      const next = button('Next Area', () => { if (L.nextStop(session)) { routePage = 0; render(); persist(); announce(m.goal); resume(); } }, true); next.disabled = !built; actions.append(next);
    } else if (kind === 'complete') {
      title.textContent = 'Mission restored!';
      box.append(paragraph('★'.repeat(store.stars[m.id] || 1), 'story-stars'), paragraph(m.restoration), paragraph(`${session.score} points · ${session.mistakes} corrections · ${session.hints} clues. ${session.mistakes === 0 && session.hints === 0 ? 'A clean recovery run!' : 'Replay for three stars by finishing without corrections or clues.'}`));
      if (index() < L.missions.length - 1) actions.append(button('Next Mission', () => open(index() + 1), true));
      else actions.append(button('Return to Verdale', exit, true));
      actions.append(button('Replay Mission', () => { session = L.fresh(m.id); open(index()); }));
    } else if (kind === 'board') {
      title.textContent = 'Local service board';
      box.append(paragraph('These destinations describe this fictional community’s collection services. Bin colours are clues for this game, not a universal recycling code.'));
      for (const id of m.destinations) {
        const examples = [...new Set(m.sets.flat())].map(id => L.items[id]).filter(it => it.route === id).map(it => it.name.toLowerCase());
        box.append(paragraph(`${L.routes[id].label}: ${examples.join(', ')}.`));
      }
      box.append(paragraph('In real life, check your packaging label and collector’s current acceptance list. Ask an adult or trained worker about batteries, electronics, chemicals or broken glass. Never open or dismantle them.', 'story-help'));
      const link = document.createElement('a'); link.href = L.SOURCES[0]; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Recycling guidance · Petco'; box.append(link);
      actions.append(button('Back to Mission', backFromMenu, true));
    } else {
      title.textContent = 'Mission paused';
      box.append(paragraph(`${m.title} · ${m.stops[session.stop]}. Your progress is saved.`));
      const settings = preferences();
      for (const [key, label] of [['music', 'Music'], ['sfx', 'Sound effects']]) {
        const row = document.createElement('label'); row.textContent = label;
        const input = document.createElement('input'); input.type = 'range'; input.min = 0; input.max = 1; input.step = .05; input.value = settings[key]; input.setAttribute('aria-label', label);
        input.addEventListener('input', () => { window.RecycleArcade?.setPreferences({ [key]: Number(input.value) }); sound.volumes(preferences()); }); row.append(input); box.append(row);
      }
      const row = document.createElement('label'), input = document.createElement('input'); input.type = 'checkbox'; input.checked = settings.reducedMotion;
      input.addEventListener('change', () => { window.RecycleArcade?.setPreferences({ reducedMotion: input.checked }); render(); }); row.append(input, ' Reduced motion'); box.append(row);
      box.append(paragraph(`Music: ${window.RecycleSound.themes[index()].title}. Each story mission has its own original music.`, 'story-help'));
      actions.append(button('Resume', backFromMenu, true), button('Retry This Area', () => {
        if (confirm('Retry this area? Points and corrections from this area will reset. Earlier areas and arcade saves are kept.')) { L.retryStop(session); routePage = 0; render(); persist(); announce(m.goal); resume(); }
      }), button('Service Board', () => modal('board')));
    }
    if (kind !== 'complete' || index() < L.missions.length - 1) actions.append(button('World Map', exit));
    $('storyModalShade').hidden = false; $('storyModal').focus();
  }
  function backFromMenu() {
    if (session.complete) modal('complete');
    else if (L.requestReady(session)) modal('request');
    else if (battleReady()) modal('battle');
    else if (session.done.length === mission().sets[session.stop].length) modal('checkpoint');
    else resume();
  }
  function battleReady() { return session && P.isBattle(session.mission) && !session.complete && !L.requestReady(session) && L.progress(session).fraction === 1; }
  function moveCircuit(value) {
    clearTimeout(walkTimer);
    const target = $('story-item-' + value).getBoundingClientRect(), area = $('storyScene').getBoundingClientRect();
    const hero = $('storyCircuit').getBoundingClientRect();
    const x = Math.max(0, Math.min(area.width - hero.width, target.left - area.left - hero.width * .25));
    const y = Math.min(0, target.bottom - area.bottom + hero.height * .25);
    $('storyCircuit').style.setProperty('--circuit-x', `${x}px`); $('storyCircuit').style.setProperty('--circuit-y', `${y}px`);
    pose('walk');
    walkTimer = setTimeout(() => { if (session.selected === value) pose('collect'); }, preferences().reducedMotion ? 0 : 380);
  }
  function renderWork() {
    const item = L.selectedItem(session), state = item && P.entry(session, item);
    if (!state) { resume(); return; }
    const spec = P.activities[state.type], box = $('storyModalContent'), actions = $('storyModalActions');
    const previousStep = document.activeElement?.dataset.workstep;
    $('storyModalTitle').textContent = spec.title; box.replaceChildren(); actions.replaceChildren();
    box.append(paragraph(spec.help, 'work-help'));
    const stage = document.createElement('div'); stage.className = `work-stage work-${state.type}`; stage.id = 'workStage'; stage.dataset.steps = String(state.done.length);
    const image = document.createElement('img'); image.className = 'work-item'; image.src = item.icon; image.alt = item.name; image.draggable = false;
    image.onerror = () => { image.onerror = null; image.src = item.legacyIcon; };
    const destination = document.createElement('span'); destination.className = 'work-destination'; destination.textContent = state.type === 'scrape' ? 'Food caddy' : state.type === 'empty' ? 'Sink' : state.type === 'repair' ? 'Sam’s bench' : state.type === 'reuse' ? 'Exchange shelf' : 'Flat stack';
    stage.append(image, destination);
    const helper = document.createElement('span'); helper.className = 'work-helper'; helper.innerHTML = '<canvas id="workCircuitCanvas" aria-hidden="true"></canvas><img class="sprite-fallback" src="assets/sprites/circuit-neutral.svg" alt=""/>';
    stage.append(helper); box.append(stage); workPainter = window.RecycleSprites.create($('workCircuitCanvas'), 'circuit');
    const progress = document.createElement('p'); progress.className = 'work-progress'; progress.textContent = `${state.done.length}/${spec.steps.length} actions complete · Tap the actions, or swipe across the item.`; box.append(progress);
    const controls = document.createElement('div'); controls.className = 'work-actions';
    for (const [id, label] of spec.steps) {
      const b = button((state.done.includes(id) ? '✓ ' : '') + label, () => workAction(id)); b.dataset.workstep = id; b.disabled = state.done.includes(id); controls.append(b);
    }
    box.append(controls);
    const feedback = paragraph('Follow the item’s condition, then route the prepared material.', 'work-feedback'); feedback.id = 'workFeedback'; feedback.setAttribute('role', 'status'); box.append(feedback);
    actions.append(button('Back to Mission', () => { render(); persist(); resume(); }));
    let pointer;
    stage.addEventListener('pointerdown', event => { if (pointer || event.button !== 0) return; pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }; stage.setPointerCapture(event.pointerId); });
    stage.addEventListener('pointerup', event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const moved = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) >= 24; pointer = null;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      if (moved) workAction(spec.steps.find(([id]) => !state.done.includes(id))?.[0]);
    });
    stage.addEventListener('pointercancel', event => { if (pointer?.id === event.pointerId) pointer = null; });
    $('storyModalShade').hidden = false;
    const next = [...controls.children].find(b => !b.disabled);
    if (previousStep || state.done.length) next?.focus({ preventScroll: true }); else $('storyModal').focus();
    sound.start(index());
  }
  function workAction(step) {
    if (modalKind !== 'activity' || !step) return;
    const result = L.act(session, 'work', step);
    if (!result.ok) { $('workFeedback').textContent = result.text; sound.effect('retry'); return; }
    sound.effect('prepare');
    if (result.finished) {
      const prepared = L.act(session, 'prepare', P.kind(L.selectedItem(session)));
      announce(prepared.text, prepared.kind); pose('prepare'); render(); persist(); publish('live'); resume();
    } else { persist(); renderWork(); $('workFeedback').textContent = result.text; }
  }
  function renderRequest(feedback = '') {
    const m = mission(), q = m.requests[session.stop], box = $('storyModalContent'), actions = $('storyModalActions');
    box.replaceChildren(); actions.replaceChildren();
    $('storyModalTitle').textContent = 'Community request';
    box.append(paragraph(`${m.ally} · ${m.stops[session.stop]}`, 'eyebrow'), paragraph(q.prompt, 'request-prompt'));
    const choices = document.createElement('div'); choices.className = 'community-choices';
    for (const choice of q.choices) {
      const b = button(choice.label, () => {
        const result = L.act(session, 'decision', choice.id);
        persist();
        if (!result.ok) { renderRequest(result.text); sound.effect('retry'); return; }
        announce(result.text, result.kind); render();
        if (result.kind === 'complete') { L.finish(store, session); persist(); publish('level_clear'); renderMenu(); modal('complete'); sound.effect('complete'); }
        else { modal(result.kind); sound.effect(result.kind); }
      }); b.dataset.decision = choice.id; choices.append(b);
    }
    box.append(choices);
    const status = paragraph(feedback || 'Choose a plan. There is no time limit; feedback helps you try again.', 'request-feedback');
    status.id = 'requestFeedback'; status.setAttribute('role', 'status'); box.append(status);
    actions.append(button('Request Clue', () => { const result = L.act(session, 'decision-hint'); persist(); $('requestFeedback').textContent = result.text; }), button('Pause Request', () => modal('pause')), button('Save & World Map', exit));
    $('storyModalShade').hidden = false; $('storyModal').focus();
  }
  function renderBattle() {
    const play = P.hydrate(session), box = $('storyModalContent'), actions = $('storyModalActions'); box.replaceChildren(); actions.replaceChildren();
    $('storyModalTitle').textContent = 'Clear Grime · Power The Loop';
    box.append(paragraph('Your correctly recovered materials have removed Grime’s shield. Clear two purple clouds, then fire a Loop Pulse. Repeat three times to restore the community station.', 'battle-help'));
    const field = document.createElement('div'); field.className = 'battle-field'; field.innerHTML = '<span id="battleMonster" class="battle-monster" data-pose="idle"><canvas id="battleGrimeCanvas" aria-hidden="true"></canvas><img class="sprite-fallback" src="assets/bosses/great-grime.png" alt="Grime"/></span>';
    field.style.setProperty('--boss-scale', String(1 - play.bossHits * .12));
    for (let i = play.bossHits * 2; i < (play.bossHits + 1) * 2; i++) {
      const b = button('Clear Grime cloud ' + (i + 1), () => { const result = L.act(session, 'wisp', i); if (result.ok) { persist(); sound.effect('wisp'); renderBattle(); } });
      b.className = 'grime-wisp'; b.dataset.wisp = String(i); b.hidden = play.wisps.includes(i); field.append(b);
    }
    box.append(field); battlePainter = window.RecycleSprites.create($('battleGrimeCanvas'), 'grime');
    const status = paragraph(`${3 - play.bossHits} cores remain · ${play.energy} recovered energy cells · ${play.wisps.length % 2 || (play.wisps.length > play.bossHits * 2 ? 2 : 0)}/2 clouds cleared`, 'battle-progress'); status.setAttribute('role', 'status'); box.append(status);
    const fire = button('Fire Loop Pulse', () => {
      const result = L.act(session, 'pulse'); if (!result.ok) return;
      persist(); render(); sound.effect(result.kind === 'complete' ? 'complete' : 'pulse');
      if (result.kind === 'complete') { L.finish(store, session); persist(); publish('level_clear'); renderMenu(); modal('complete'); sound.effect('complete'); }
      else { renderBattle(); $('battleMonster').dataset.pose = 'hurt'; }
    }, true); fire.id = 'loopPulseBtn'; fire.disabled = play.wisps.length < (play.bossHits + 1) * 2; actions.append(fire, button('Pause Duel', () => modal('pause')), button('Save & World Map', exit));
    $('storyModalShade').hidden = false; $('storyModal').focus(); sound.start(index());
  }
  function cancelDrag() {
    const current = drag; drag = null; $('storyDragGhost')?.remove();
    if (current?.target.hasPointerCapture?.(current.id)) current.target.releasePointerCapture(current.id);
  }
  function installDrag() {
    const objects = $('storyObjects');
    objects.addEventListener('pointerdown', event => {
      const target = event.target.closest('[data-item]');
      if (!target || target.disabled || drag || paused || event.button !== 0) return;
      drag = { id: event.pointerId, target, item: Number(target.dataset.item), x: event.clientX, y: event.clientY, moved: false }; target.setPointerCapture(event.pointerId);
    });
    objects.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId || paused) return;
      if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 9) return;
      if (!drag.moved) { drag.moved = true; action('select', drag.item); const ghost = document.createElement('img'); ghost.id = 'storyDragGhost'; ghost.src = L.selectedItem(session).icon; ghost.alt = ''; root.append(ghost); }
      const ghost = $('storyDragGhost'); if (ghost) { ghost.style.left = event.clientX + 'px'; ghost.style.top = event.clientY + 'px'; }
    });
    objects.addEventListener('pointerup', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const moved = drag.moved; if (moved) onPress.suppressNextClick();
      const route = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-route]')?.dataset.route;
      cancelDrag();
      if (moved && route) {
        const item = L.selectedItem(session);
        if (P.kind(item) && !session.prepared.includes(session.selected)) modal('activity'); else action('route', route);
      }
    });
    objects.addEventListener('pointercancel', event => { if (drag?.id === event.pointerId) cancelDrag(); });
    objects.addEventListener('lostpointercapture', event => { if (drag?.id === event.pointerId) cancelDrag(); });
  }
  root.innerHTML = `
    <header class="story-header"><div><p id="storyMissionNumber">Restore Verdale</p><h2 id="storyTitle">Wake the Workshop</h2></div><div class="story-score"><span>Recovery points</span><strong id="storyScore">0</strong></div></header>
    <div class="story-progress"><span id="storyProgressText"></span><progress id="storyProgress" value="0" max="18" aria-label="Mission recovery progress"></progress></div>
    <div id="storyWorkspace" class="story-workspace">
      <section id="storyScene" class="story-scene" aria-label="Collection area">
        <div class="story-place"><span id="storyPlace"></span><span id="storyGrime" class="story-grime" aria-label="Grime’s shield weakens with each completed task" hidden><canvas id="storyGrimeCanvas" aria-hidden="true"></canvas><img class="sprite-fallback" src="assets/bosses/great-grime.png" alt=""/></span></div>
        <div id="storyObjects" class="story-objects"></div><div id="storyBuilds" class="story-builds" aria-label="Community projects installed"></div>
        <div id="storyCircuit" class="story-circuit" data-pose="idle" aria-hidden="true">
          <canvas id="storyCircuitCanvas" aria-hidden="true"></canvas><img class="sprite-fallback" src="assets/sprites/circuit-neutral.svg" alt=""/><img id="storyCarried" class="story-carried" alt="" hidden />
        </div><div id="storyRestored" class="story-restored"></div>
      </section>
      <section id="storyInspector" class="story-inspector" aria-label="Inspect and route an item"><div class="story-card-head"><img id="storyItemIcon" alt=""/><div><h3 id="storyItemName">Choose an item</h3><p id="storyItemCondition"></p></div></div><p id="storyStatus" class="story-status" role="status" aria-live="polite"></p><div id="storyDestinations" class="story-destinations" aria-label="Accepted destinations"></div><div class="story-tools"><button id="storyPrepareBtn" type="button" class="story-primary" hidden>Prepare</button><button id="storyHintBtn" type="button">Clue</button><button id="storyRoutesBtn" type="button" hidden>Other routes</button></div></section>
    </div>
    <footer id="storyFooter" class="story-footer"><span id="storySaveStatus">Checkpoint saved on this device</span><div class="story-footer-actions"><button id="storyPauseBtn" type="button">Pause / Menu</button><button id="storyBoardBtn" type="button">Service Board</button><span id="storyFullscreen"></span></div></footer>
    <div id="storyModalShade" class="story-modal-shade" hidden><section id="storyModal" class="story-modal" role="dialog" aria-modal="true" aria-labelledby="storyModalTitle" tabindex="-1"><h2 id="storyModalTitle"></h2><div id="storyModalContent"></div><div id="storyModalActions" class="story-modal-actions"></div></section></div>`;
  onPress($('storyStartBtn'), () => open());
  onPress($('storyHintBtn'), () => action('hint'));
  onPress($('storyPrepareBtn'), () => modal('activity'));
  onPress($('storyRoutesBtn'), () => { routePage++; render(); $('storyRoutesBtn').focus(); });
  onPress($('storyPauseBtn'), () => modal('pause'));
  onPress($('storyBoardBtn'), () => modal('board'));
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); if (paused) backFromMenu(); else modal('pause'); }
    if (e.key === 'Tab' && !$('storyModalShade').hidden) {
      const focusable = [...$('storyModal').querySelectorAll('button, input, a[href]')].filter(el => !el.hidden && !el.disabled);
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && (document.activeElement === first || document.activeElement === $('storyModal'))) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && active) { persist(); if (!paused) modal('pause'); else sound.pause(); } });
  window.addEventListener('pagehide', () => { if (active) persist(); sound.pause(); });
  // Layout changes cannot lose an item or turn a correct choice into a miss.
  window.addEventListener('resize', () => { cancelDrag(); clearTimeout(walkTimer); if (active) { $('storyCircuit').style.setProperty('--circuit-x', '0px'); $('storyCircuit').style.setProperty('--circuit-y', '0px'); } });
  document.addEventListener('wga:game-tab-ready', mountFullscreen);
  const observer = new MutationObserver(() => { if (document.querySelector('.wga-tab-fullscreen')) { mountFullscreen(); observer.disconnect(); } });
  observer.observe(document.body, { childList: true, subtree: true });
  circuitPainter = window.RecycleSprites.create($('storyCircuitCanvas'), 'circuit');
  grimePainter = window.RecycleSprites.create($('storyGrimeCanvas'), 'grime');
  installDrag();
  function tick(now) {
    if (active) { const reduced = preferences().reducedMotion; const time = now / 1000; circuitPainter.paint(paused ? 'idle' : $('storyCircuit').dataset.pose, time, reduced); grimePainter.paint('idle', time, reduced); if (modalKind === 'battle' && battlePainter) battlePainter.paint($('battleMonster')?.dataset.pose || 'idle', time, reduced); if (modalKind === 'activity' && workPainter) workPainter.paint('prepare', time, reduced); }
    if (active && !paused && session && !session.complete) {
      if (lastTick) session.elapsed += Math.min(.25, (now - lastTick) / 1000);
      lastTick = now;
      if (Math.floor(session.elapsed / 10) !== lastSecond) { lastSecond = Math.floor(session.elapsed / 10); persist(); }
    } else lastTick = 0;
    requestAnimationFrame(tick);
  }
  window.RecycleStory = { open, renderMenu };
  renderMenu(); requestAnimationFrame(tick);
})();
