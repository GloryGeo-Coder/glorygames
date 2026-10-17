/** Original campaign music and effects. Audio never changes game/save state. */
export const AUDIO_STORAGE_KEY = 'wga_skytemple_audio_v1';
export const MUSIC_TRACKS = Object.freeze({
  garden: { title: 'Winds Above the Ruins', guardian: 'Sentinel of the Sky' },
  crystal: { title: 'Echoes of the Deep', guardian: 'Resonance of the Warden' },
  storm: { title: 'March of the Tempest', guardian: 'Thunder at the Citadel' },
  solar: { title: 'Crown of the First Light', guardian: 'Rise of the Relic Master' },
});
export const SFX_CUES = Object.freeze({
  jump: [.23, [310, 470, 620], .05], land: [.14, [145, 92], .24],
  glide: [.60, [390, 490, 590], .30], blast: [.25, [930, 650, 290], .17],
  hit: [.19, [510, 310], .30], 'drone-down': [.48, [620, 420, 200, 95], .30],
  damage: [.35, [145, 110, 82], .22], fall: [.50, [360, 220, 120, 65], .12],
  relic: [.66, [660, 830, 990, 1320], 0], checkpoint: [.66, [392, 494, 587, 784], 0],
  'boss-awaken': [.90, [98, 147, 196, 247], .08],
  'boss-warn': [.40, [330, 440, 330], .06], 'boss-cast': [.35, [220, 170, 120], .24],
  'boss-phase': [.65, [196, 247, 294, 392], .08],
  'boss-defeated': [1.1, [392, 494, 587, 784, 988], .02],
  'enemy-shot': [.20, [520, 350, 220], .10], hazard: [.32, [180, 360, 180], .15],
  portal: [.85, [294, 440, 587, 880], .03],
  victory: [1.6, [523, 659, 784, 1046, 784, 1046], 0],
  defeat: [1.0, [330, 294, 247, 196], .02], ui: [.12, [660, 880], 0],
});
const DEFAULTS = Object.freeze({ version: 1, muted: false, music: .45, effects: .70 });
const unit = (value, fallback) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
export function normalizeAudioPreferences(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.version !== 1) return { ...DEFAULTS };
  return { version: 1, muted: typeof raw.muted === 'boolean' ? raw.muted : false,
    music: unit(raw.music, DEFAULTS.music), effects: unit(raw.effects, DEFAULTS.effects) };
}

/** Remove residual MP3 boundary transients once after decoding, not per frame. */
export function conditionMusicLoop(buffer) {
  if (!buffer?.getChannelData || !Number.isFinite(buffer.sampleRate)) return buffer;
  for (let channel = 0; channel < (buffer.numberOfChannels || 1); channel++) {
    const data = buffer.getChannelData(channel);
    const edge = Math.min(Math.round(buffer.sampleRate * .012), Math.floor(data.length / 4));
    for (let i = 0; i < edge; i++) {
      const gain = Math.sin(i / Math.max(1, edge - 1) * Math.PI / 2);
      data[i] *= gain; data[data.length - 1 - i] *= gain;
    }
  }
  return buffer;
}

export function createCampaignAudio({ world = 'garden', storage, contextFactory, fetcher,
  assetBase = new URL('./assets/audio/', import.meta.url), timers = globalThis } = {}) {
  if (!MUSIC_TRACKS[world]) throw new Error(`Unknown audio world: ${world}`);
  if (storage === undefined) { try { storage = globalThis.localStorage; } catch { storage = null; } }
  let prefs;
  try { prefs = normalizeAudioPreferences(JSON.parse(storage?.getItem(AUDIO_STORAGE_KEY) || 'null')); }
  catch { prefs = { ...DEFAULTS }; }
  let context = null, master = null, musicBus = null, effectBus = null, limiter = null;
  let mode = 'menu', visible = true, battle = false, unlocked = false, disposed = false;
  let status = 'idle', generation = 0, loadingKey = null, currentTrack = null, lastError = '';
  const listeners = new Set(), buffers = new Map(), pending = new Map(), requests = new Set();
  const musicVoices = new Set(), effectVoices = new Set(), effectBuffers = new Map();
  const playedAt = new Map(), offsets = new Map();
  const desiredKey = () => `${world}-${battle ? 'guardian' : 'exploration'}`;
  const allowed = () => !disposed && unlocked && visible && mode === 'playing' && !prefs.muted;
  const state = () => ({ ...prefs, world, mode, visible, battle, unlocked, status,
    title: battle ? MUSIC_TRACKS[world].guardian : MUSIC_TRACKS[world].title,
    musicPlaying: Boolean(allowed() && currentTrack && context?.state === 'running'), lastError });
  function notify() { for (const fn of listeners) { try { fn(state()); } catch {} } }
  function ramp(param, value, seconds = .07) {
    if (!param || !context) return;
    param.cancelScheduledValues(context.currentTime);
    param.setValueAtTime(param.value, context.currentTime);
    param.linearRampToValueAtTime(value, context.currentTime + seconds);
  }
  function disconnect(record) {
    try { record.source.disconnect(); record.gain.disconnect(); } catch {}
  }
  function stopEffects() {
    for (const rec of effectVoices) { try { rec.source.stop(); } catch {} disconnect(rec); }
    effectVoices.clear();
  }
  function stopMusic() {
    generation++;
    loadingKey = null;
    if (status === 'loading') status = 'idle';
    if (context) for (const rec of musicVoices) {
      if (!rec.stopping) offsets.set(rec.key, (rec.offset + Math.max(0, context.currentTime - rec.started)) % rec.duration);
      try { rec.source.stop(); } catch {}
      disconnect(rec);
    }
    musicVoices.clear();
    currentTrack = null;
  }
  function ensureContext() {
    if (context) return context;
    try {
      const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!contextFactory && !Ctor) throw new Error('Web Audio is not supported');
      context = contextFactory ? contextFactory() : new Ctor({ latencyHint: 'interactive' });
      master = context.createGain(); musicBus = context.createGain(); effectBus = context.createGain();
      master.gain.value = prefs.muted ? 0 : .82;
      musicBus.gain.value = prefs.music * .62; effectBus.gain.value = prefs.effects * .70;
      musicBus.connect(master); effectBus.connect(master);
      limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -8; limiter.knee.value = 12; limiter.ratio.value = 5;
      limiter.attack.value = .005; limiter.release.value = .18;
      master.connect(limiter); limiter.connect(context.destination);
      context.addEventListener?.('statechange', notify);
      return context;
    } catch {
      status = 'unavailable'; lastError = 'Audio is unavailable in this browser.';
      try { context?.close()?.catch?.(() => {}); } catch {}
      context = null; notify(); return null;
    }
  }
  async function loadMusic(key) {
    if (buffers.has(key)) return buffers.get(key);
    if (pending.has(key)) return pending.get(key);
    const abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
    if (abort) requests.add(abort);
    const deadline = abort ? timers.setTimeout(() => abort.abort(), 12000) : null;
    const task = (async () => {
      const fetchAudio = fetcher || globalThis.fetch;
      if (!fetchAudio) throw new Error('Audio loading is unavailable');
      const response = await fetchAudio(new URL(`${key}.mp3`, assetBase), abort ? { signal: abort.signal } : undefined);
      if (!response.ok) throw new Error('Audio file could not be loaded');
      const bytes = await response.arrayBuffer();
      if (disposed || !context) throw new Error('Audio closed');
      const buffer = await context.decodeAudioData(bytes);
      if (!Number.isFinite(buffer.duration) || buffer.duration <= 0) throw new Error('Audio file is empty');
      conditionMusicLoop(buffer);
      if (!disposed) buffers.set(key, buffer);
      return buffer;
    })();
    pending.set(key, task);
    try { return await task; }
    finally { if (deadline !== null) timers.clearTimeout(deadline); requests.delete(abort); pending.delete(key); }
  }
  function syncMusic() {
    if (!allowed() || prefs.music <= 0) { stopMusic(); notify(); return; }
    const key = desiredKey();
    // Returning to a still-playing theme must invalidate the pending other one.
    if (loadingKey && loadingKey !== key) { generation++; loadingKey = null; }
    if (currentTrack?.key === key) {
      status = 'ready'; lastError = ''; notify(); return;
    }
    if (loadingKey === key) return;
    const token = ++generation;
    loadingKey = key; status = 'loading'; notify();
    loadMusic(key).then(buffer => {
      if (disposed || token !== generation || !allowed() || prefs.music <= 0) return;
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer; source.loop = true; source.loopStart = 0; source.loopEnd = buffer.duration;
      gain.gain.value = 0; source.connect(gain); gain.connect(musicBus);
      const offset = (offsets.get(key) || 0) % buffer.duration;
      const rec = { source, gain, key, offset, duration: buffer.duration, started: context.currentTime, stopping: false };
      source.onended = () => { musicVoices.delete(rec); disconnect(rec); };
      for (const old of musicVoices) {
        if (old.stopping) continue;
        old.stopping = true;
        offsets.set(old.key, (old.offset + context.currentTime - old.started) % old.duration);
        ramp(old.gain.gain, 0, .8);
        try { old.source.stop(context.currentTime + .85); } catch {}
      }
      musicVoices.add(rec); currentTrack = rec;
      source.start(0, offset); ramp(gain.gain, 1, .8);
      loadingKey = null; status = 'ready'; lastError = ''; notify();
    }).catch(() => {
      if (disposed || token !== generation) return;
      loadingKey = null; status = 'music-error';
      lastError = 'Music could not load. Sound effects are still available.'; notify();
    });
  }
  function setState(next = {}) {
    if (disposed) return;
    if (typeof next.mode === 'string') mode = next.mode;
    if (typeof next.visible === 'boolean') visible = next.visible;
    if (typeof next.battle === 'boolean') battle = next.battle;
    if (!allowed()) {
      stopMusic(); stopEffects();
      if (context && (!visible || mode === 'paused')) {
        try { Promise.resolve(context.suspend()).catch(() => {}); } catch {}
      }
    } else syncMusic();
    notify();
  }
  /** Only call from Play, Resume or an audio-control gesture. No autoplay. */
  function unlock() {
    if (disposed || prefs.muted || !visible) return Promise.resolve(false);
    const ctx = ensureContext();
    if (!ctx) return Promise.resolve(false);
    // resume() must be invoked synchronously in the user gesture, before fetch/decode.
    let resuming;
    try { resuming = ctx.resume(); } catch { resuming = Promise.reject(new Error('Resume blocked')); }
    return Promise.resolve(resuming).then(() => {
      if (disposed) return false;
      unlocked = true;
      if (!visible || mode === 'paused') {
        return Promise.resolve(ctx.suspend()).then(() => false).catch(() => false);
      }
      syncMusic(); notify(); return true;
    }).catch(() => {
      if (!disposed) { status = 'blocked'; lastError = 'Press Play or Resume to enable audio.'; notify(); }
      return false;
    });
  }
  function setPreferences(change = {}) {
    if (disposed) return;
    prefs = normalizeAudioPreferences({ ...prefs, ...change, version: 1 });
    try { storage?.setItem(AUDIO_STORAGE_KEY, JSON.stringify(prefs)); } catch {}
    ramp(master?.gain, prefs.muted ? 0 : .82);
    ramp(musicBus?.gain, prefs.music * .62); ramp(effectBus?.gain, prefs.effects * .70);
    if (prefs.muted) { stopMusic(); stopEffects(); }
    else syncMusic();
    notify();
  }
  function makeEffect(name) {
    if (effectBuffers.has(name)) return effectBuffers.get(name);
    const [duration, notes, noiseLevel] = SFX_CUES[name];
    const rate = 24000, count = Math.ceil(duration * rate);
    const buffer = context.createBuffer(1, count, rate), data = buffer.getChannelData(0);
    let phase = 0, random = 571 + name.length;
    for (let i = 0; i < count; i++) {
      const t = i / rate, segment = Math.min(notes.length - 1, Math.floor(t / duration * notes.length));
      phase += 2 * Math.PI * notes[segment] / rate;
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      const noise = random / 2147483648 - 1;
      const local = (t / duration * notes.length) % 1;
      const attack = Math.min(1, t / .008), tail = Math.min(1, (duration - t) / .045);
      const noteTime = duration / notes.length;
      const articulation = Math.min(1, local * noteTime / .006) * Math.min(1, (1 - local) * noteTime / .012);
      const envelope = attack * tail * articulation * (.35 + .65 * Math.exp(-local * 4)) * Math.exp(-t / duration * .8);
      data[i] = ((Math.sin(phase) + .18 * Math.sin(phase * 2)) * (1 - noiseLevel) + noise * noiseLevel) * envelope * .55;
    }
    effectBuffers.set(name, buffer); return buffer;
  }
  function play(name, { terminal = false } = {}) {
    if (!SFX_CUES[name] || !context || !unlocked || disposed || prefs.muted || prefs.effects <= 0 || !visible) return false;
    if (mode !== 'playing' && !(terminal && (mode === 'won' || mode === 'lost'))) return false;
    if (effectVoices.size >= 12) return false;
    const now = context.currentTime;
    if (now - (playedAt.get(name) ?? -100) < (name === 'glide' ? .8 : .065)) return false;
    playedAt.set(name, now);
    try {
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = makeEffect(name); gain.gain.value = name === 'land' ? .35 : .82;
      source.connect(gain); gain.connect(effectBus);
      const rec = { source, gain }; effectVoices.add(rec);
      source.onended = () => { effectVoices.delete(rec); disconnect(rec); };
      source.start(); return true;
    } catch { return false; }
  }
  function dispose() {
    if (disposed) return;
    stopMusic(); stopEffects(); disposed = true;
    for (const request of requests) request.abort();
    requests.clear(); buffers.clear(); effectBuffers.clear(); listeners.clear();
    if (context) {
      context.removeEventListener?.('statechange', notify);
      try { Promise.resolve(context.close()).catch(() => {}); } catch {}
    }
  }
  return { state, setState, unlock, setPreferences, play, dispose,
    subscribe(fn) { listeners.add(fn); try { fn(state()); } catch {} return () => listeners.delete(fn); } };
}
