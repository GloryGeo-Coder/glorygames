import {
  canalState,
  canEditCanal,
  attachmentIssue,
  fitsLeaf,
  mountOf,
  advanceMotor,
  sendBoat,
  advanceBoat
} from './canal.mjs';
import {
  canMount,
  mountHeight,
  drivingSeat,
  buildProblem,
  bodyLoad,
  TYRES,
  GATES,
  newRun,
  advanceVehicle
} from './vehicle.mjs';
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
    jump = false,
    run = newRun(),
    driverSeat = null,
    canal = canalState(),
    braking = false;
  let elapsed = 0,
    stepSound = 0,
    noticeTimer,
    top = false,
    activeStick = null;
  const unreadable = new Set();
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
    resetTrafficOnEdit(items);
    data.pieces = items;
    save();
    s.drawPieces(items, selected);
    refresh();
  }
  function openWorld(next) {
    clearTimeout(noticeTimer);
    $('notice').textContent = '';
    kind = next;
    canSave = !unreadable.has(kind);
    try {
      data = volatile.get(kind) || loadWorld(kind, localStorage);
      $('stored').textContent = canSave
        ? 'Autosaves on this device.'
        : 'Saved data unavailable. Changes stay in this session.';
    } catch {
      data = volatile.get(kind) || world(kind);
      canSave = false;
      unreadable.add(kind);
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
    canal = canalState();
    if (kind === 'canal' && data.boatPassed) canal.boatZ = 8;
    if (kind === 'canal' && data.complete) canal.traffic = 'done';
    run = newRun();
    if (kind === 'garage' && !Object.hasOwn(TYRES, data.tyres)) data.tyres = 'road';
    draft = {
      type: next === 'garage' ? 'cab' : next === 'bridge' ? 'deck' : 'pair',
      color: next === 'garage' ? 'Lagoon' : next === 'bridge' ? 'Sun' : 'Coral',
      x: next === 'garage' ? -1 : next === 'bridge' ? -3 : 0,
      z: next === 'bridge' ? -1 : 0,
      y: 0,
      r: 0
    };
    if (kind === 'canal')
      Object.assign(draft, { type: 'deck', mount: 'east', color: 'Sun', x: 0, z: -1 });
    Object.assign(s.orbit, { pitch: 0.91, yaw: -0.63, zoom: 1, focusX: 0, focusZ: 0 });
    if (kind === 'garage') s.orbit.zoom = 0.45;
    top = false;
    pressed('view', false);
    s.neighbourhood(kind);
    s.workshop(false, run, data.tyres);
    s.drawPieces(data.pieces, null);
    s.chase.yaw = 0;
    $('worldName').textContent = data.name;
    $('name').value = data.name;
    $('delivery').hidden = kind !== 'bridge';
    for (const btn of $('tray').children) {
      const t = TYPES[btn.dataset.type];
      btn.hidden = kind === 'garage' ? t.w > 4 || t.d > 4 : t.garageOnly;
      btn.style.order = t.garageOnly ? -1 : 0;
    }
    $('canalPanel').hidden = kind !== 'canal';
    $('garagePanel').hidden = kind !== 'garage';
    if (kind === 'garage') $('tyres').value = data.tyres;
    $('play').textContent = kind === 'garage' ? 'Drive' : 'Play';
    adjustHeight();
    syncMode();
    updateTest();
    s.view(mode, person, run);
    menu.open && menu.close();
  }
  function editorAvailable() {
    return mode === 'build' && car.state !== 'running' && (kind !== 'canal' || canEditCanal(canal));
  }
  function resetTrafficOnEdit(next) {
    if (kind !== 'canal') return;
    // Paint alone does not invalidate a successful clearance test.
    const prev = new Map(data.pieces.map((p) => [p.id, p]));
    const unchanged =
      next.length === prev.size &&
      next.every((p) => {
        const b = prev.get(p.id);
        return (
          b && ['x', 'y', 'z', 'r', 'type'].every((k) => p[k] === b[k]) && mountOf(p) === mountOf(b)
        );
      });
    if (unchanged) return;
    resetCanalTests();
  }
  function resetCanalTests() {
    const retest = data.boatPassed;
    data.boatPassed = data.complete = false;
    car = buggy();
    canal = canalState();
    if (retest) canal.reason = 'Crossing changed. Raise the bridge and test the ferry again.';
  }
  function chosen() {
    return data.pieces.find((p) => p.id === selected);
  }
  function canPlace(p, ignore) {
    return kind === 'garage'
      ? canMount(p, data.pieces, ignore)
      : validPiece(p, data.pieces, ignore) && (kind !== 'canal' || fitsLeaf(p));
  }
  function adjustHeight() {
    const moving = tool === 'move' ? chosen() : null;
    if (moving) {
      draft.y = moving.y;
      if (canPlace(draft, selected)) return;
    }
    draft.y =
      kind === 'garage'
        ? mountHeight(draft, data.pieces, moving?.id)
        : snapHeight(draft, data.pieces, moving?.id);
  }
  function refresh() {
    const editable = editorAvailable();
    const showing = editable && tool !== 'select';
    const ok = showing && canPlace(draft, tool === 'move' ? selected : null);
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
    if (kind === 'garage') {
      const problem = buildProblem(data.pieces);
      $('play').disabled = Boolean(problem);
      $('tyreLabel').hidden = mode === 'drive';
      if (mode !== 'drive')
        $('garageStatus').textContent =
          problem ||
          (data.complete
            ? 'Course cleared. Edit or drive again.'
            : 'Body ready. Drive through the numbered gates.');
    }
    if (kind === 'canal') {
      $('mount').value = mountOf(draft);
      $('mount').disabled = tool === 'select';
      canalPanel();
    }
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
    if (!editorAvailable() || tool === 'select') return;
    const moving = tool === 'move',
      p = {
        ...draft,
        id: moving ? selected : crypto.getRandomValues(new Uint32Array(4)).join('-')
      };
    if (!canPlace(p, moving ? selected : null)) return;
    change(moving ? data.pieces.map((b) => (b.id === selected ? p : b)) : [...data.pieces, p]);
    music.snap();
    if (moving) select(selected);
    else {
      adjustHeight();
      refresh();
    }
  }
  function rotation() {
    if (!editorAvailable()) return;
    if (tool === 'select') {
      const current = chosen();
      if (!current) return;
      const p = { ...current, r: (current.r + 1) % 4 };
      if (!canPlace(p, p.id)) {
        announce('No room to rotate here');
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
    const edge = kind === 'garage' ? 2 : 10;
    draft.x = Math.max(-edge, Math.min(edge - a.w, x));
    draft.z = Math.max(-edge, Math.min(edge - a.d, z));
    adjustHeight();
    refresh();
  }
  function clearInputs() {
    vec.x = vec.z = 0;
    jump = false;
    activeStick = null;
    braking = false;
    keys.clear();
    $('stick').firstElementChild.style.transform = '';
  }
  function syncMode() {
    const edit = mode === 'build';
    pressed('build', edit);
    pressed('play', !edit);
    $('bench').hidden = !editorAvailable();
    $('walk').hidden = edit;
    for (const id of ['view', 'closer', 'farther', 'center']) $(id).hidden = !edit;
    $('home').hidden = edit;
    $('home').textContent = kind === 'garage' ? 'Restart' : 'Return';
    $('routeMap').hidden = mode !== 'drive';
    $('jump').hidden = mode === 'drive';
    $('brake').hidden = mode !== 'drive';
    $('stick').setAttribute(
      'aria-label',
      kind === 'garage' ? 'Driving joystick' : 'Movement joystick'
    );
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
    person = safe || {
      ...avatar(kind),
      y: Math.max(0, ...data.pieces.map((p) => p.y + size(p).h))
    };
    s.chase.yaw = 0;
    clearInputs();
  }
  function switchMode(to) {
    if (kind === 'garage' && to === 'play') to = 'drive';
    if (car.state === 'running' || mode === to || (kind === 'canal' && !canEditCanal(canal)))
      return;
    if (to === 'drive') {
      const problem = buildProblem(data.pieces);
      if (problem) {
        announce(problem);
        return;
      }
      driverSeat = drivingSeat(data.pieces);
      run = newRun(bodyLoad(data.pieces));
      s.chase.yaw = 0;
    }
    mode = to;
    clearTimeout(noticeTimer);
    $('notice').textContent = '';
    if (kind === 'garage') {
      s.workshop(mode === 'drive', run, data.tyres);
      if (mode === 'drive') routeStatus();
    }

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
    s.view(mode, person, run);
  }
  const map = $('routeMap').getContext('2d');
  function drawMap() {
    const scale = 6,
      c = 67;
    map.clearRect(0, 0, 134, 134);
    map.fillStyle = '#234a44';
    map.fillRect(5, 5, 124, 124);
    map.lineWidth = 2;
    map.strokeStyle = '#83a496';
    map.setLineDash([3, 4]);
    map.beginPath();
    map.moveTo(c - 5 * scale, c + 5 * scale);
    for (const g of GATES) map.lineTo(c + g.x * scale, c - g.z * scale);
    map.stroke();
    map.setLineDash([]);
    GATES.forEach((g, i) => {
      const x = c + g.x * scale,
        y = c - g.z * scale;
      map.fillStyle = i === run.gate ? '#ffd45c' : i < run.gate ? '#87ddbf' : '#b0bcb3';
      map.beginPath();
      map.arc(x, y, 8, 0, Math.PI * 2);
      map.fill();
      map.fillStyle = '#183936';
      map.font = 'bold 11px sans-serif';
      map.textAlign = 'center';
      map.fillText(String(i + 1), x, y + 4);
    });
    map.save();
    map.translate(c + run.x * scale, c - run.z * scale);
    map.rotate(run.yaw);
    map.fillStyle = '#fff9e3';
    map.strokeStyle = '#152d28';
    map.beginPath();
    map.moveTo(0, -8);
    map.lineTo(5, 5);
    map.lineTo(0, 3);
    map.lineTo(-5, 5);
    map.closePath();
    map.fill();
    map.stroke();
    map.restore();
  }
  function routeStatus() {
    $('garageStatus').textContent =
      run.gate < GATES.length
        ? `Gate ${run.gate + 1} of ${GATES.length} · ${GATES[run.gate].name}. Follow the amber markers.`
        : 'Test lap complete! Build to edit, or Restart to drive again.';
  }
  function canalPanel() {
    $('canalPanel').hidden = mode !== 'build';
    const moving = canal.angle !== canal.target;
    const stopped = ['boatStopped', 'buggyStopped'].includes(canal.traffic);
    const busy = ['boat', 'buggy'].includes(canal.traffic);
    const closed = canal.angle === 0;
    $('play').disabled = !canEditCanal(canal);
    $('canalSettings').hidden = !editorAvailable();
    $('liftLimit').value = String(data.liftDegrees);
    $('lever').disabled = moving || busy || stopped || canal.traffic === 'done';
    $('lever').textContent = closed ? 'Raise bridge' : 'Lower bridge';
    $('dispatch').disabled = moving || busy || (!stopped && data.boatPassed && !closed);
    $('dispatch').textContent = stopped
      ? 'Retry'
      : canal.traffic === 'done'
        ? 'Retest crossing'
        : data.boatPassed
          ? 'Send buggy'
          : 'Send boat';
    let message = canal.reason;
    if (!message) {
      if (moving)
        message = canal.target > canal.angle ? 'Raising the bridge…' : 'Lowering the bridge…';
      else if (canal.traffic === 'boat') message = 'Ferry approaching the crossing.';
      else if (canal.traffic === 'buggy') message = 'Buggy travelling to the shop.';
      else if (canal.traffic === 'done')
        message = 'Both deliveries complete. The canal is open for business!';
      else if (data.boatPassed)
        message = closed
          ? 'Ferry clear. Send the buggy across your deck.'
          : 'Ferry clear. Lower the bridge for the buggy.';
      else if (!closed) message = 'Check the raised leaves. Send the ferry down the channel.';
      else
        message = 'Build from the bearings across the marked lane. Raise the leaves for the ferry.';
    }
    $('canalStatus').textContent = message;
  }
  $('mount').onchange = () => {
    if (!editorAvailable() || kind !== 'canal' || tool === 'select') return;
    draft.mount = $('mount').value;
    if (tool === 'add' && draft.mount !== 'fixed') {
      draft.x = draft.mount === 'west' ? -3 : 0;
      draft.z = -1;
    }
    adjustHeight();
    refresh();
  };
  $('liftLimit').onchange = () => {
    const degrees = Number($('liftLimit').value);
    if (
      kind !== 'canal' ||
      !editorAvailable() ||
      ![10, 40, 80].includes(degrees) ||
      degrees === data.liftDegrees
    )
      return;
    data.liftDegrees = degrees;
    resetCanalTests();
    save();
    refresh();
  };
  $('lever').onclick = () => {
    if (kind !== 'canal' || mode !== 'build' || $('lever').disabled) return;
    const issue = canal.angle === 0 ? attachmentIssue(data.pieces) : '';
    canal.reason = issue;
    if (!issue) canal.target = canal.angle === 0 ? (data.liftDegrees * Math.PI) / 180 : 0;
    clearInputs();
    syncMode();
  };
  $('dispatch').onclick = () => {
    if (kind !== 'canal' || mode !== 'build' || $('dispatch').disabled) return;
    if (canal.traffic === 'done') {
      data.boatPassed = data.complete = false;
      save();
      canal = canalState();
      car = buggy();
    } else if (canal.traffic === 'boatStopped' || canal.traffic === 'buggyStopped') {
      canal.traffic = 'ready';
      canal.reason = '';
      canal.boatZ = data.boatPassed ? 8 : -8;
      car = buggy();
    } else if (data.boatPassed) {
      car = buggy();
      car.state = 'running';
      canal.traffic = 'buggy';
      canal.reason = '';
    } else {
      sendBoat(canal);
    }
    clearInputs();
    syncMode();
  };
  function tickCanal(dt) {
    if (canal.angle !== canal.target) {
      advanceMotor(canal, data.pieces, dt);
      if (canal.angle === canal.target) {
        music.snap();
        syncMode();
      }
    }
    if (canal.traffic === 'boat') {
      advanceBoat(canal, data.pieces, dt);
      if (canal.traffic === 'boatPassed') {
        // Only an operated drawbridge qualifies the road delivery.
        if (canal.angle === 0) {
          canal.traffic = 'boatStopped';
          canal.reason = 'The ferry passed an open gap. Raise a connected bridge to qualify.';
        } else {
          canal.traffic = 'ready';
          data.boatPassed = true;
          save();
        }
      }
      if (canal.traffic !== 'boat') syncMode();
    }
    if (canal.traffic === 'buggy') {
      advanceBuggy(car, data.pieces, dt);
      if (car.state === 'won') {
        data.complete = true;
        save();
        canal.traffic = 'done';
        syncMode();
      } else if (car.state !== 'running') {
        canal.traffic = 'buggyStopped';
        canal.reason = car.reason + '. Retry, repair the deck and test again.';
        syncMode();
      }
    }
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
    if (mode === 'drive') {
      run = newRun(bodyLoad(data.pieces));
      clearInputs();
      s.chase.yaw = 0;
      routeStatus();
      return;
    }
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
    if (!history.length || !editorAvailable()) return;
    const previous = history.pop();
    resetTrafficOnEdit(previous);
    data.pieces = previous;
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
  $('canalWorld').onclick = () => openWorld('canal');
  $('garageWorld').onclick = () => openWorld('garage');
  for (const [id, t] of Object.entries(TYRES)) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = t.label + ' · ' + t.note;
    $('tyres').append(opt);
  }
  $('tyres').onchange = () => {
    if (kind === 'garage' && mode === 'build' && Object.hasOwn(TYRES, $('tyres').value)) {
      data.tyres = $('tyres').value;
      save();
      s.workshop(false, run, data.tyres);
    }
  };
  $('brake').onpointerdown = (e) => {
    braking = true;
    $('brake').setPointerCapture(e.pointerId);
  };
  $('brake').onpointerup =
    $('brake').onpointercancel =
    $('brake').onlostpointercapture =
      () => {
        braking = false;
      };
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
  let lastSelectionStud = '';
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
    if (mode !== 'build') s.chase.yaw += dx * 0.009;
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
    if (!pt || gesture || e.button !== 0 || !editorAvailable()) return;
    const hit = s.pick(e.clientX, e.clientY);
    if (!hit) return;
    if (tool === 'select') {
      let id = hit.id;
      if (kind === 'garage' && id) {
        const stud = Math.floor(hit.x) + ',' + Math.floor(hit.z);
        if (lastSelectionStud === stud && selected) {
          const stack = data.pieces
            .filter((p) => {
              const { w, d } = size(p);
              return hit.x >= p.x && hit.x < p.x + w && hit.z >= p.z && hit.z < p.z + d;
            })
            .sort((a, b) => b.y + size(b).h - (a.y + size(a).h));
          const current = stack.findIndex((p) => p.id === selected);
          if (current !== -1) id = stack[(current + 1) % stack.length].id;
        }
        lastSelectionStud = stud;
      }
      select(id);
    } else aim(Math.floor(hit.x + 0.00001), Math.floor(hit.z + 0.00001));
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
    if (menu.open || ['INPUT', 'SELECT'].includes(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === 'tab') return;
    if (k === 'b' && !e.ctrlKey && !e.metaKey) {
      switchMode(mode === 'build' ? 'play' : 'build');
      return;
    }
    if (mode !== 'build') {
      if (
        ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)
      ) {
        if (k === ' ' && !e.repeat) jump = true;
        keys.add(k);
        e.preventDefault();
      }
      return;
    }
    if (!editorAvailable()) return;
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
    const last = localStorage.getItem('wga.brick.active');
    if (['bridge', 'garage', 'canal'].includes(last)) first = last;
  } catch {}
  openWorld(first);
  if (first !== 'canal')
    announce(
      first === 'garage'
        ? 'Build on the chassis, then choose Drive'
        : 'Tap a stud, then Place brick'
    );
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
        if (mode === 'drive') {
          const gas =
            vec.z +
            Number(keys.has('w') || keys.has('arrowup')) -
            Number(keys.has('s') || keys.has('arrowdown'));
          const steer =
            vec.x +
            Number(keys.has('d') || keys.has('arrowright')) -
            Number(keys.has('a') || keys.has('arrowleft'));
          const old = run.gate;
          advanceVehicle(
            run,
            data.tyres,
            Math.max(-1, Math.min(1, gas)),
            Math.max(-1, Math.min(1, steer)),
            braking || keys.has(' '),
            delta
          );
          if (old !== run.gate) {
            music.snap();
            routeStatus();
            if (run.gate === GATES.length) {
              data.complete = true;
              save();
              clearInputs();
            }
          }
        }
        if (kind === 'canal') tickCanal(delta);
        else if (car.state === 'running') {
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
      music.tick(
        elapsed,
        car.state === 'running' ||
          (mode === 'drive' && Math.abs(run.speed) > 0.1) ||
          (kind === 'canal' && (canal.angle !== canal.target || canal.traffic === 'boat'))
      );
    } else music.tick(elapsed, false);
    if (kind === 'garage') s.workshop(mode === 'drive', run, data.tyres);
    if (mode === 'drive') drawMap();
    if (kind === 'canal') {
      s.canalMechanism(canal.angle, canal.boatZ, canal.angle !== canal.target);
      const angle = Math.round((canal.angle * 180) / Math.PI) + '°';
      if ($('angleReadout').textContent !== angle) $('angleReadout').textContent = angle;
    }
    s.actors(mode, person, car, walking, elapsed, driverSeat);
    s.view(mode, person, run);
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
