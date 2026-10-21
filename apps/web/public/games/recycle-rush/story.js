(() => {
  'use strict';
  const L = window.RecycleLearning;
  const $ = id => document.getElementById(id);
  const root = $('storyRoot');
  let store = L.normalize(read());
  let session = store.session, active = false, paused = true, routePage = 0, returnFocus = null, poseTimer, lastTick = 0, lastSecond = 0, lastPublished = -1;
  const sound = window.RecycleSound.create(window, preferences());
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
    $('storySummary').textContent = `${count}/5 story missions restored · 18 recovery tasks and three saved areas per mission. Your 20 arcade missions remain available below.`;
    $('storyStartBtn').textContent = session && !session.complete ? 'Continue Story' : count === 5 ? 'Replay Story' : count ? 'Next Story Mission' : 'Begin Story';
    const list = $('storyMissionList'); list.replaceChildren();
    L.missions.forEach((m, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.disabled = i > store.unlocked;
      b.textContent = `${i + 1}. ${m.title}${store.stars[m.id] ? ' · ' + '★'.repeat(store.stars[m.id]) : i > store.unlocked ? ' · Locked' : ''}`;
      b.addEventListener('click', () => open(i)); list.append(b);
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
    modal(session.done.length === mission().sets[session.stop].length ? 'checkpoint' : 'briefing');
  }
  function exit() {
    sound.pause(); active = false; paused = true; persist();
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
    paused = false; $('storyModalShade').hidden = true;
    $('storyWorkspace').inert = false; $('storyFooter').inert = false;
    $('storyPauseBtn').textContent = 'Pause / Menu';
    sound.start(index());
    if (returnFocus?.isConnected && !returnFocus.disabled) returnFocus.focus(); else $('story-item-0')?.focus();
    lastTick = 0;
  }
  function action(kind, value) {
    if (!active || paused) return;
    const result = L.act(session, kind, value);
    announce(result.text, result.kind);
    if (result.kind) { if (!['complete', 'checkpoint'].includes(result.kind)) sound.effect(result.kind); pose(result.kind === 'complete' ? 'celebrate' : result.kind === 'retry' ? 'worried' : result.kind); }
    if (kind === 'select' && result.ok) {
      const position = $('story-item-' + value).getBoundingClientRect(), area = $('storyScene').getBoundingClientRect();
      const offset = Math.min(area.width * .25, Math.max(0, position.left - area.left - 70));
      $('storyCircuit').style.setProperty('--circuit-x', `${offset}px`);
    }
    render(); persist();
    if (result.kind === 'complete') {
      L.finish(store, session); persist(); publish('level_clear'); renderMenu(); modal('complete'); sound.effect('complete');
    } else if (result.kind === 'checkpoint') { modal('checkpoint'); sound.effect('checkpoint'); }
    else if (result.ok) publish('live');
    if (kind === 'select' && result.ok) (session.prepared.includes(value) || !L.selectedItem(session)?.prep ? $('storyHintBtn') : $('storyPrepareBtn')).focus({ preventScroll: true });
  }
  function render() {
    const m = mission(), item = L.selectedItem(session), progress = L.progress(session);
    $('storyMissionNumber').textContent = `Restore Verdale · Mission ${index() + 1}/5`;
    $('storyTitle').textContent = m.title; $('storyScore').textContent = session.score;
    $('storyProgress').value = progress.done; $('storyProgress').max = progress.total;
    $('storyProgressText').textContent = `Area ${session.stop + 1}/3 · ${progress.done}/${progress.total}`;
    $('storyPlace').textContent = m.stops[session.stop];
    $('storyScene').style.backgroundImage = `url("${m.background}")`;
    $('storyScene').style.setProperty('--healing', .35 + progress.fraction * .65);
    $('storyRestored').textContent = progress.done === 0 ? 'The recovery station needs your help.' : `${progress.done} items recovered · ${m.id === 'school-tomorrow' ? 'Grime shield: ' + Math.round((1 - progress.fraction) * 100) + '%' : 'The neighbourhood is coming back to life.'}`;
    $('storyGrime').hidden = m.id !== 'school-tomorrow' || session.complete;
    $('storyGrime').style.opacity = String(1 - progress.fraction * .8);
    const objects = $('storyObjects');
    if (objects.dataset.area !== `${m.id}-${session.stop}`) {
      objects.dataset.area = `${m.id}-${session.stop}`; objects.replaceChildren();
      m.sets[session.stop].forEach((id, i) => {
        const data = L.items[id], b = document.createElement('button'); b.type = 'button'; b.id = 'story-item-' + i; b.className = 'story-object';
        const image = document.createElement('img'); image.src = data.icon; image.alt = ''; image.draggable = false;
        const label = document.createElement('span'); label.textContent = data.name;
        b.append(image, label); b.addEventListener('click', () => action('select', i)); objects.append(b);
      });
    }
    [...objects.children].forEach((b, i) => { b.classList.toggle('done', session.done.includes(i)); b.disabled = session.done.includes(i); b.setAttribute('aria-pressed', String(session.selected === i)); });
    $('storyItemName').textContent = item?.name || 'Choose an item';
    $('storyItemCondition').textContent = item ? `${item.material} · ${session.prepared.includes(session.selected) ? 'Prepared for collection' : item.condition}` : 'Tap an object in the scene to collect and inspect it.';
    $('storyItemIcon').src = item?.icon || 'assets/sprites/circuit-neutral.svg';
    $('storyHintBtn').disabled = !item;
    const prep = item?.prep && !session.prepared.includes(session.selected) ? L.preparations[item.prep] : null;
    $('storyPrepareBtn').hidden = !prep; $('storyPrepareBtn').textContent = prep?.label || 'Prepare';
    const pages = Math.ceil(m.destinations.length / 4); routePage %= pages;
    $('storyRoutesBtn').hidden = pages === 1; $('storyRoutesBtn').textContent = `Other routes ${routePage + 1}/${pages}`;
    const destinations = $('storyDestinations'); destinations.replaceChildren();
    m.destinations.slice(routePage * 4, routePage * 4 + 4).forEach(id => {
      const route = L.routes[id], b = document.createElement('button'); b.type = 'button'; b.className = 'story-destination'; b.dataset.route = id;
      b.style.setProperty('--route-color', route.color); b.disabled = !item;
      const image = document.createElement('img'); image.src = route.icon; image.alt = ''; image.draggable = false;
      const label = document.createElement('span'); label.textContent = route.label;
      b.append(image, label); b.addEventListener('click', () => action('route', id)); destinations.append(b);
    });
    sound.setIntensity(progress.fraction);
    root.classList.toggle('reduced', preferences().reducedMotion);
  }
  function button(text, fn, primary = false) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = text;
    if (primary) b.className = 'story-primary'; b.addEventListener('click', fn); return b;
  }
  function paragraph(text, className) { const p = document.createElement('p'); p.textContent = text; if (className) p.className = className; return p; }
  function modal(kind) {
    if (!active) return;
    returnFocus = document.activeElement; paused = true; sound.pause();
    $('storyWorkspace').inert = true; $('storyFooter').inert = true;
    const box = $('storyModalContent'), m = mission(); box.replaceChildren();
    const title = $('storyModalTitle'); const actions = $('storyModalActions'); actions.replaceChildren();
    if (kind === 'briefing') {
      title.textContent = m.title;
      box.append(paragraph(m.subtitle, 'eyebrow'), paragraph(m.intro), paragraph(`${m.ally}: ${m.goal}`), paragraph('Three areas · 18 tasks · no time limit. Each decision is saved. Mistakes give feedback and can be corrected; use a clue whenever you need one.', 'story-help'));
      actions.append(button(session.done.length || session.stop ? 'Continue Mission' : 'Start Mission', () => { announce(m.goal); resume(); }, true));
    } else if (kind === 'checkpoint') {
      title.textContent = 'Area restored';
      box.append(paragraph(`${m.stops[session.stop]} is ready. Your checkpoint is saved.`, 'eyebrow'), paragraph($('storyStatus').textContent), paragraph('Take a breath, then move to the next area. The next checkpoint keeps all your completed work.'));
      actions.append(button('Next Area', () => { if (L.nextStop(session)) { routePage = 0; render(); persist(); announce(m.goal); resume(); } }, true));
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
    else if (session.done.length === mission().sets[session.stop].length) modal('checkpoint');
    else resume();
  }
  root.innerHTML = `
    <header class="story-header"><div><p id="storyMissionNumber">Restore Verdale</p><h2 id="storyTitle">Wake the Workshop</h2></div><div class="story-score"><span>Recovery points</span><strong id="storyScore">0</strong></div></header>
    <div class="story-progress"><span id="storyProgressText"></span><progress id="storyProgress" value="0" max="18" aria-label="Mission recovery progress"></progress></div>
    <div id="storyWorkspace" class="story-workspace">
      <section id="storyScene" class="story-scene" aria-label="Collection area">
        <div class="story-place"><span id="storyPlace"></span><img id="storyGrime" class="story-grime" src="assets/bosses/great-grime.png" alt="Grime’s shield weakens with each completed task" hidden /></div>
        <div id="storyObjects" class="story-objects"></div>
        <div id="storyCircuit" class="story-circuit" data-pose="idle" aria-hidden="true">
          <svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="circuitMetal" x2=".8" y2="1"><stop stop-color="#809c9f"/><stop offset="1" stop-color="#304953"/></linearGradient></defs><ellipse cx="100" cy="196" rx="56" ry="9" fill="#071b22" opacity=".45"/><g class="circuit-leg-left"><rect x="65" y="151" width="24" height="35" rx="8" fill="#426471"/><rect x="57" y="178" width="37" height="17" rx="7" fill="#203b48"/></g><g class="circuit-leg-right"><rect x="110" y="151" width="24" height="35" rx="8" fill="#426471"/><rect x="106" y="178" width="37" height="17" rx="7" fill="#203b48"/></g><g class="circuit-body"><g class="circuit-arm-left"><rect x="30" y="91" width="28" height="52" rx="12" fill="#ecd76c"/><circle cx="42" cy="143" r="13" fill="#809a9c"/></g><g class="circuit-arm-right"><rect x="142" y="91" width="28" height="52" rx="12" fill="#ecd76c"/><circle cx="156" cy="143" r="13" fill="#809a9c"/></g><rect x="52" y="85" width="96" height="79" rx="22" fill="url(#circuitMetal)" stroke="#a5c9b8" stroke-width="3"/><rect x="67" y="103" width="65" height="39" rx="10" fill="#18393b"/><path d="M91 111h17l-3-6m3 6-4 8m-17 4-4 8h10m24-9 4 8h-10" fill="none" stroke="#9dffc1" stroke-width="4" stroke-linecap="round"/><rect x="53" y="28" width="94" height="65" rx="21" fill="url(#circuitMetal)" stroke="#b3dcc6" stroke-width="3"/><path d="M69 30 60 9 82 29M123 30l17-20-4 25" fill="#e5d474"/><rect x="65" y="41" width="70" height="39" rx="14" fill="#09292f"/><g class="circuit-eye" fill="#a3ffd0"><ellipse cx="84" cy="57" rx="7" ry="9"/><ellipse cx="117" cy="57" rx="7" ry="9"/></g><path d="M88 72q12 8 24 0" fill="none" stroke="#a3ffd0" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="91" r="5" fill="#a3ffd0"/></g></svg>
        </div><div id="storyRestored" class="story-restored"></div>
      </section>
      <section id="storyInspector" class="story-inspector" aria-label="Inspect and route an item"><div class="story-card-head"><img id="storyItemIcon" alt=""/><div><h3 id="storyItemName">Choose an item</h3><p id="storyItemCondition"></p></div></div><p id="storyStatus" class="story-status" role="status" aria-live="polite"></p><div id="storyDestinations" class="story-destinations" aria-label="Accepted destinations"></div><div class="story-tools"><button id="storyPrepareBtn" type="button" class="story-primary" hidden>Prepare</button><button id="storyHintBtn" type="button">Clue</button><button id="storyRoutesBtn" type="button" hidden>Other routes</button></div></section>
    </div>
    <footer id="storyFooter" class="story-footer"><span id="storySaveStatus">Checkpoint saved on this device</span><div class="story-footer-actions"><button id="storyPauseBtn" type="button">Pause / Menu</button><button id="storyBoardBtn" type="button">Service Board</button><span id="storyFullscreen"></span></div></footer>
    <div id="storyModalShade" class="story-modal-shade" hidden><section id="storyModal" class="story-modal" role="dialog" aria-modal="true" aria-labelledby="storyModalTitle" tabindex="-1"><h2 id="storyModalTitle"></h2><div id="storyModalContent"></div><div id="storyModalActions" class="story-modal-actions"></div></section></div>`;
  $('storyStartBtn').addEventListener('click', () => open());
  $('storyHintBtn').addEventListener('click', () => action('hint'));
  $('storyPrepareBtn').addEventListener('click', () => action('prepare', L.selectedItem(session)?.prep));
  $('storyRoutesBtn').addEventListener('click', () => { routePage++; render(); $('storyRoutesBtn').focus(); });
  $('storyPauseBtn').addEventListener('click', () => modal('pause'));
  $('storyBoardBtn').addEventListener('click', () => modal('board'));
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
  window.addEventListener('resize', () => { if (active) $('storyCircuit').style.setProperty('--circuit-x', '0px'); });
  document.addEventListener('wga:game-tab-ready', mountFullscreen);
  const observer = new MutationObserver(() => { if (document.querySelector('.wga-tab-fullscreen')) { mountFullscreen(); observer.disconnect(); } });
  observer.observe(document.body, { childList: true, subtree: true });
  function tick(now) {
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
