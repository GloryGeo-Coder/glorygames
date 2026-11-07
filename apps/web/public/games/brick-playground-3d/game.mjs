import {
  TYPES,
  PALETTE,
  size,
  validPiece,
  snapHeight,
  saveKey,
  loadWorld,
  world,
  avatar,
  advanceAvatar,
  buggy,
  advanceBuggy,
  intervals,
  floorAt
} from './model.mjs';
import { studio } from './scene.mjs';
import { soundtrack } from './audio.mjs';
import { miniature } from './icons.mjs';

const $ = (id) => document.getElementById(id),
  canvas = $('plot'),
  menu = $('menu');
function start() {
  const s = studio(canvas),
    music = soundtrack(),
    keys = new Set(),
    volatile = new Map();
  let kind = 'free',
    data,
    canSave = true,
    history = [],
    selected = null,
    tool = 'add',
    mode = 'build',
    draft,
    person,
    car,
    jump = false;
  let elapsed = 0,
    stepSound = 0,
    noticeTimer,
    top = false,
    activeStick = null;
  const vec = { x: 0, z: 0 },
    pressed = (id, b) => $(id).setAttribute('aria-pressed', String(b));
  const announce = (text) => {
    clearTimeout(noticeTimer);
    $('notice').textContent = text;
    noticeTimer = setTimeout(() => ($('notice').textContent = ''), 3400);
  };
  function save() {
    volatile.set(kind, data);
    if (!canSave) return;
    try {
      localStorage.setItem(saveKey(kind), JSON.stringify(data));
      $('stored').textContent = 'Saved on this device.';
    } catch {
      $('stored').textContent = 'Storage unavailable. This world is open for this session.';
      announce('Device storage unavailable');
    }
  }
  function change(items) {
    history.push(data.pieces);
    if (history.length > 80) history.shift();
    data.pieces = items;
    save();
    s.drawPieces(items, selected);
    refresh();
  }
  function openWorld(next) {
    kind = next;
    canSave = true;
    try {
      data = volatile.get(kind) || loadWorld(kind, localStorage);
      $('stored').textContent = 'Autosaves on this device.';
    } catch {
      data = volatile.get(kind) || world(kind);
      canSave = false;
      $('stored').textContent = 'Saved data unavailable. Changes stay in this session.';
      announce('World storage is unavailable');
    }
    try {
      localStorage.setItem('wga.brick.active', kind);
    } catch {}
    history = [];
    selected = null;
    tool = 'add';
    mode = 'build';
    person = avatar(kind);
    car = buggy();
    draft = {
      type: next === 'bridge' ? 'deck' : 'pair',
      color: next === 'bridge' ? 'Sun' : 'Coral',
      x: next === 'bridge' ? -3 : 0,
      z: next === 'bridge' ? -1 : 0,
      y: 0,
      r: 0
    };
    Object.assign(s.orbit, { pitch: 0.91, yaw: -0.63, zoom: 1, focusX: 0, focusZ: 0 });
    top = false;
    pressed('view', false);
    s.neighbourhood(kind);
    s.drawPieces(data.pieces, null);
    s.chase.yaw = 0;
    $('worldName').textContent = data.name;
    $('name').value = data.name;
    $('delivery').hidden = kind !== 'bridge';
    syncMode();
    updateTest();
    s.view(mode, person);
    menu.open && menu.close();
  }
  function chosen() {
    return data.pieces.find((p) => p.id === selected);
  }
  function adjustHeight() {
    const moving = tool === 'move' ? chosen() : null;
    if (moving) {
      draft.y = moving.y;
      if (validPiece(draft, data.pieces, selected)) return;
    }
    draft.y = snapHeight(draft, data.pieces, moving?.id);
  }
  function refresh() {
    const editable = mode === 'build' && car.state !== 'running';
    const showing = editable && tool !== 'select';
    const ok = showing && validPiece(draft, data.pieces, tool === 'move' ? selected : null);
    s.ghost(showing ? draft : null, ok);
    $('place').disabled = !ok;
    $('place').textContent = tool === 'move' ? 'Set down' : 'Place brick';
    $('undo').disabled = !history.length || !editable;
    $('editTools').hidden = tool !== 'select' || !chosen();
    $('tray').hidden = tool === 'select';
    $('rotate').disabled = !editable || (tool === 'select' && !chosen());
    pressed('select', tool === 'select' || tool === 'move');
    pressed('add', tool === 'add');
    for (const btn of $('tray').children)
      btn.setAttribute('aria-pressed', String(btn.dataset.type === draft.type));
    for (const btn of $('colors').children)
      btn.setAttribute('aria-pressed', String(btn.title === draft.color));
    $('readout').textContent = showing
      ? (ok ? '' : 'Blocked · ') + `(${draft.x}, ${draft.z}) ↑${Number(draft.y.toFixed(2))}`
      : chosen()
        ? TYPES[chosen().type].label
        : data.pieces.length + ' pieces';
  }
  function select(id) {
    selected = id ?? null;
    tool = 'select';
    if (chosen()) draft = { ...chosen() };
    s.drawPieces(data.pieces, selected);
    refresh();
  }
  function place() {
    if (mode !== 'build' || car.state === 'running' || tool === 'select') return;
    const moving = tool === 'move',
      p = { ...draft, id: moving ? selected : crypto.getRandomValues(new Uint32Array(4)).join('-') };
    if (!validPiece(p, data.pieces, moving ? selected : null)) return;
    change(moving ? data.pieces.map((b) => (b.id === selected ? p : b)) : [...data.pieces, p]);
    music.snap();
    if (moving) select(selected);
    else {
      adjustHeight();
      refresh();
    }
  }
  function rotation() {
    if (mode !== 'build' || car.state === 'running') return;
    if (tool === 'select') {
      const current = chosen();
      if (!current) return;
      const p = { ...current, r: (current.r + 1) % 4 };
      if (!validPiece(p, data.pieces, p.id)) {
        announce('Rotation would overlap another brick');
        return;
      }
      change(data.pieces.map((b) => (b.id === p.id ? p : b)));
      select(p.id);
    } else {
      draft.r = (draft.r + 1) % 4;
      adjustHeight();
      refresh();
    }
  }
  function aim(x, z) {
    const a = size(draft);
    draft.x = Math.max(-10, Math.min(10 - a.w, x));
    draft.z = Math.max(-10, Math.min(10 - a.d, z));
    adjustHeight();
    refresh();
  }
  function clearInputs() {
    vec.x = vec.z = 0;
    jump = false;
    activeStick = null;
    keys.clear();
    $('stick').firstElementChild.style.transform = '';
  }
  function syncMode() {
    const edit = mode === 'build';
    pressed('build', edit);
    pressed('play', !edit);
    $('bench').hidden = !edit || car.state === 'running';
    $('walk').hidden = edit;
    for (const id of ['view', 'closer', 'farther', 'center']) $(id).hidden = !edit;
    $('home').hidden = edit;
    $('play').disabled = car.state === 'running';
    refresh();
  }
  function rescue() {
    const candidates = [
      avatar(kind),
      ...Array.from({ length: 400 }, (_, i) => ({
        ...avatar(kind),
        x: (i % 20) - 9.5,
        z: Math.floor(i / 20) - 9.5
      }))
    ];
    const safe = candidates.find(
      (a) =>
        Number.isFinite(floorAt(kind, a.x, a.z)) &&
        !data.pieces.some((p) => intervals(p, a.x, a.z).some(([lo, hi]) => lo < 1.66 && hi > 0))
    );
    person = safe || { ...avatar(kind), y: Math.max(0, ...data.pieces.map((p) => p.y + size(p).h)) };
    s.chase.yaw = 0;
    clearInputs();
  }
  function switchMode(to) {
    if (car.state === 'running' || mode === to) return;
    mode = to;
    clearInputs();
    if (
      to === 'play' &&
      data.pieces.some((p) =>
        intervals(p, person.x, person.z).some(
          ([lo, hi]) => lo < person.y + 1.65 && hi > person.y + 0.01
        )
      )
    )
      rescue();
    syncMode();
    s.view(mode, person);
  }
  function updateTest() {
    const copy = {
      ready: data.complete
        ? 'Delivery complete. Try another crossing.'
        : 'Bridge both wheel tracks between the dashed lines.',
      running: 'Out for delivery…',
      fell: 'A wheel lost the deck. Fill the gap here.',
      stopped: 'The step is too high. Try a plate or ramp.',
      won: 'Delivered! The buggy reached the spaza shop.'
    };
    $('result').textContent = copy[car.state];
    $('test').textContent = car.state === 'ready' ? 'Test buggy' : 'Retry';
  }
  $('build').onclick = () => switchMode('build');
  $('play').onclick = () => switchMode('play');
  $('test').onclick = () => {
    if (car.state !== 'ready') {
      Object.assign(car, buggy());
      updateTest();
      syncMode();
      announce('Buggy back at the start');
      return;
    }
    switchMode('build');
    // Keep both banks in sight even if the last edit was made while zoomed in.
    Object.assign(s.orbit, { focusX: 0, focusZ: 0, zoom: 1 });
    car.state = 'running';
    clearInputs();
    syncMode();
    updateTest();
  };
  $('home').onclick = () => {
    rescue();
    announce('Back on the plot');
  };
  $('select').onclick = () => select(null);
  $('add').onclick = () => {
    selected = null;
    tool = 'add';
    s.drawPieces(data.pieces, null);
    adjustHeight();
    refresh();
  };
  $('rotate').onclick = rotation;
  $('place').onclick = place;
  $('undo').onclick = () => {
    if (!history.length || car.state === 'running') return;
    data.pieces = history.pop();
    selected = null;
    tool = 'add';
    save();
    s.drawPieces(data.pieces, null);
    adjustHeight();
    refresh();
  };
  $('move').onclick = () => {
    draft = { ...chosen() };
    tool = 'move';
    refresh();
    announce('Aim at the new stud, then Set down');
  };
  $('duplicate').onclick = () => {
    draft = { ...chosen() };
    selected = null;
    tool = 'add';
    s.drawPieces(data.pieces, null);
    aim(draft.x + 1, draft.z);
  };
  $('paint').onclick = () => {
    change(data.pieces.map((p) => (p.id === selected ? { ...p, color: draft.color } : p)));
    music.snap();
  };
  $('remove').onclick = () => {
    const id = selected;
    selected = null;
    change(data.pieces.filter((p) => p.id !== id));
  };
  function zoom(scale) {
    s.orbit.zoom = Math.max(0.32, Math.min(1.65, s.orbit.zoom * scale));
  }
  $('closer').onclick = () => zoom(0.82);
  $('farther').onclick = () => zoom(1.22);
  $('center').onclick = () => {
    s.orbit.focusX = draft.x + size(draft).w / 2;
    s.orbit.focusZ = draft.z + size(draft).d / 2;
  };
  $('view').onclick = () => {
    top = !top;
    s.orbit.pitch = top ? Math.PI / 2 - 0.001 : 0.91;
    s.orbit.yaw = top ? 0 : -0.63;
    pressed('view', top);
  };
  $('worlds').onclick = () => {
    clearInputs();
    menu.showModal();
  };
  $('name').oninput = () => {
    data.name = $('name').value.trim().slice(0, 40) || world(kind).name;
    $('worldName').textContent = data.name;
    save();
  };
  $('freeWorld').onclick = () => openWorld('free');
  $('bridgeWorld').onclick = () => openWorld('bridge');
  $('audio').onclick = () => {
    music.toggle();
    audioLabel();
  };
  function audioLabel() {
    $('audio').textContent = music.muted ? 'Enable audio' : 'Mute audio';
  }
  audioLabel();
  $('fullscreen').hidden = !document.documentElement.requestFullscreen;
  $('fullscreen').onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      announce('Fullscreen unavailable');
    }
  };
  for (const [id, t] of Object.entries(TYPES)) {
    const b = document.createElement('button');
    b.dataset.type = id;
    b.title = t.label + ' · ' + t.w + ' × ' + t.d;
    b.append(
      miniature(
        id,
        ['#d66a4c', '#e9ac38', '#458f82', '#599eaf'][Object.keys(TYPES).indexOf(id) % 4]
      ),
      document.createTextNode(t.label)
    );
    b.onclick = () => {
      selected = null;
      tool = 'add';
      draft.type = id;
      draft.r = 0;
      s.drawPieces(data.pieces, null);
      aim(draft.x, draft.z);
    };
    $('tray').append(b);
  }
  for (const [name, hex] of Object.entries(PALETTE)) {
    const b = document.createElement('button');
    b.title = name;
    b.setAttribute('aria-label', name);
    b.style.background = hex;
    b.onclick = () => {
      draft.color = name;
      refresh();
    };
    $('colors').append(b);
  }
  // A tap only moves the preview. Camera gestures never commit edits.
  const touches = new Map();
  let gesture = false,
    previousPinch;
  const pinch = () => {
    const [a, b] = touches.values();
    return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  canvas.onpointerdown = (e) => {
    canvas.setPointerCapture(e.pointerId);
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY });
    if (touches.size === 1) gesture = false;
    if (touches.size === 2) {
      gesture = true;
      previousPinch = pinch();
    }
  };
  canvas.onpointermove = (e) => {
    const pt = touches.get(e.pointerId);
    if (!pt) return;
    const dx = e.clientX - pt.x,
      dy = e.clientY - pt.y;
    pt.x = e.clientX;
    pt.y = e.clientY;
    if (Math.hypot(pt.x - pt.startX, pt.y - pt.startY) > 5) gesture = true;
    if (!gesture) return;
    if (touches.size === 2 && mode === 'build') {
      const n = pinch();
      if (previousPinch?.d && n.d) {
        zoom(previousPinch.d / n.d);
        const scale = (s.orbit.zoom * 28) / canvas.clientHeight;
        const px = (n.x - previousPinch.x) * scale,
          pz = (n.y - previousPinch.y) * scale;
        const c = Math.cos(s.orbit.yaw),
          t = Math.sin(s.orbit.yaw);
        s.orbit.focusX = Math.max(-10, Math.min(10, s.orbit.focusX - px * c + pz * t));
        s.orbit.focusZ = Math.max(-10, Math.min(10, s.orbit.focusZ - px * t + pz * c));
      }
      previousPinch = n;
      return;
    }
    if (mode === 'play') s.chase.yaw += dx * 0.009;
    else {
      s.orbit.yaw -= dx * 0.009;
      s.orbit.pitch = Math.max(0.32, Math.min(1.57, s.orbit.pitch + dy * 0.006));
      top = false;
      pressed('view', false);
    }
  };
  canvas.onpointerup = (e) => {
    const pt = touches.get(e.pointerId);
    touches.delete(e.pointerId);
    if (!pt || gesture || e.button !== 0 || mode !== 'build' || car.state === 'running') return;
    const hit = s.pick(e.clientX, e.clientY);
    if (!hit) return;
    if (tool === 'select') select(hit.id);
    else aim(Math.floor(hit.x + 0.00001), Math.floor(hit.z + 0.00001));
  };
  canvas.onpointercancel = (e) => {
    touches.delete(e.pointerId);
    gesture = true;
  };
  canvas.onwheel = (e) => {
    if (mode === 'build') {
      e.preventDefault();
      zoom(Math.exp(e.deltaY * 0.001));
    }
  };
  const stick = $('stick');
  function steer(e) {
    const r = stick.getBoundingClientRect(),
      x = (e.clientX - r.left - r.width / 2) / 32,
      z = -(e.clientY - r.top - r.height / 2) / 32;
    const n = Math.max(1, Math.hypot(x, z));
    vec.x = x / n;
    vec.z = z / n;
    stick.firstElementChild.style.transform = `translate(${vec.x * 28}px,${-vec.z * 28}px)`;
  }
  stick.onpointerdown = (e) => {
    activeStick = e.pointerId;
    stick.setPointerCapture(e.pointerId);
    steer(e);
  };
  stick.onpointermove = (e) => {
    if (activeStick === e.pointerId) steer(e);
  };
  stick.onpointerup = stick.onpointercancel = () => {
    activeStick = null;
    vec.x = vec.z = 0;
    stick.firstElementChild.style.transform = '';
  };
  $('jump').onpointerdown = () => {
    jump = true;
  };
  $('jump').onclick = (e) => {
    if (!e.detail) jump = true;
  };
  window.addEventListener('keydown', (e) => {
    if (menu.open || e.target.tagName === 'INPUT') return;
    const k = e.key.toLowerCase();
    if (k === 'tab') return;
    if (k === 'b' && !e.ctrlKey && !e.metaKey) {
      switchMode(mode === 'build' ? 'play' : 'build');
      return;
    }
    if (mode === 'play') {
      if (
        ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)
      ) {
        if (k === ' ' && !e.repeat) jump = true;
        keys.add(k);
        e.preventDefault();
      }
      return;
    }
    if (car.state === 'running') return;
    if (k === 'r') rotation();
    if (k === 'enter' && !['BUTTON', 'A'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      place();
    }
    if (k === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      $('undo').click();
    }
    if (k.startsWith('arrow') && tool !== 'select') {
      e.preventDefault();
      aim(
        draft.x + (k === 'arrowright') - (k === 'arrowleft'),
        draft.z + (k === 'arrowup') - (k === 'arrowdown')
      );
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', clearInputs);
  document.addEventListener('visibilitychange', () => {
    clearInputs();
    if (document.hidden) music.quiet();
  });
  document.addEventListener('pointerdown', () => music.unlock());
  document.addEventListener('keydown', () => music.unlock());
  let first = 'free';
  try {
    if (localStorage.getItem('wga.brick.active') === 'bridge') first = 'bridge';
  } catch {}
  openWorld(first);
  announce('Tap a stud, then Place brick');
  window.addEventListener('resize', () => s.engine.resize());
  s.engine.runRenderLoop(() => {
    if (document.hidden) return;
    const dt = Math.min(0.1, s.engine.getDeltaTime() / 1000);
    elapsed += dt;
    let walking = false;
    if (!menu.open) {
      const count = Math.max(1, Math.ceil(dt / 0.0167)),
        delta = dt / count;
      for (let i = 0; i < count; i++) {
        if (mode === 'play') {
          const x =
            vec.x +
            Number(keys.has('d') || keys.has('arrowright')) -
            Number(keys.has('a') || keys.has('arrowleft'));
          const z =
            vec.z +
            Number(keys.has('w') || keys.has('arrowup')) -
            Number(keys.has('s') || keys.has('arrowdown'));
          walking = !!(x || z);
          const frontYaw = s.chase.yaw;
          advanceAvatar(
            person,
            kind,
            data.pieces,
            x * Math.cos(frontYaw) + z * Math.sin(frontYaw),
            z * Math.cos(frontYaw) - x * Math.sin(frontYaw),
            jump,
            delta
          );
          jump = false;
          if (person.y < -5) rescue();
        }
        if (car.state === 'running') {
          advanceBuggy(car, data.pieces, delta);
          if (car.state !== 'running') {
            if (car.state === 'won') {
              data.complete = true;
              save();
            }
            updateTest();
            syncMode();
          }
        }
      }
      if (walking && person.grounded && elapsed > stepSound) {
        music.foot();
        stepSound = elapsed + 0.31;
      }
      music.tick(elapsed, car.state === 'running');
    } else music.tick(elapsed, false);
    s.actors(mode, person, car, walking, elapsed);
    s.view(mode, person);
    s.scene.render();
  });
}
try {
  start();
} catch (e) {
  console.error(e);
  $('bench').hidden = true;
  $('notice').textContent = 'The 3D workshop could not start. Enable WebGL and refresh this tab.';
}
