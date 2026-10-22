/* Original, procedurally performed recovery themes. No external audio downloads. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RecycleSound = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const themes = [
    { title: 'Workshop Sunrise', bpm: 96, root: 130.81, bass: [0, 0, 5, 7], notes: [12, 16, 19, 24, 19, 16, 14, 19, 12, 7, 16, 19, 21, 19, 16, 14], rhythm: [0, 3, 6, 8, 11, 14], wave: 'triangle' },
    { title: 'Clean Stream', bpm: 108, root: 146.83, bass: [0, 7, 9, 5], notes: [12, 19, 16, 14, 21, 19, 16, 12, 14, 16, 19, 26, 24, 21, 19, 14], rhythm: [0, 2, 5, 8, 10, 13, 15], wave: 'sine' },
    { title: 'Second Life Swing', bpm: 100, root: 110, bass: [0, 5, 3, 7], notes: [12, 15, 19, 22, 19, 15, 17, 19, 24, 22, 19, 17, 15, 12, 10, 7], rhythm: [0, 3, 7, 8, 11, 14], wave: 'triangle' },
    { title: 'Neighbourhood Circuit', bpm: 116, root: 123.47, bass: [0, 3, 8, 5], notes: [12, 19, 15, 22, 24, 19, 17, 15, 12, 15, 20, 24, 22, 20, 19, 15], rhythm: [0, 2, 4, 7, 8, 11, 12, 14], wave: 'sine' },
    { title: 'The Loop Returns', bpm: 124, root: 130.81, bass: [0, 5, 9, 7], notes: [12, 16, 19, 24, 28, 24, 21, 19, 17, 21, 24, 29, 28, 24, 19, 16], rhythm: [0, 2, 3, 6, 8, 10, 11, 14], wave: 'triangle' },
    { title: 'Market Morning Groove', bpm: 112, root: 174.61, bass: [0, 5, 2, 7], notes: [12, 17, 21, 19, 14, 17, 24, 21, 19, 14, 12, 17, 26, 24, 21, 19], rhythm: [0, 1, 4, 6, 9, 12, 14], wave: 'triangle' },
    { title: 'Garden Table', bpm: 92, root: 164.81, bass: [0, 3, 5, 10], notes: [12, 15, 17, 22, 24, 22, 17, 15, 19, 17, 15, 12, 10, 15, 17, 19], rhythm: [0, 3, 5, 9, 11, 15], wave: 'sine' },
    { title: 'Swap Day Shuffle', bpm: 106, root: 196, bass: [0, 7, 5, 9], notes: [12, 19, 24, 21, 16, 19, 26, 24, 21, 16, 14, 19, 24, 28, 26, 21], rhythm: [0, 2, 6, 7, 10, 12, 15], wave: 'triangle' },
    { title: 'Shelter Before Rain', bpm: 98, root: 138.59, bass: [0, 8, 3, 7], notes: [12, 15, 20, 19, 22, 20, 15, 12, 15, 19, 24, 22, 20, 19, 15, 10], rhythm: [0, 4, 5, 8, 11, 13, 14], wave: 'sine' },
    { title: 'Verdale Afterglow', bpm: 128, root: 146.83, bass: [0, 5, 7, 2], notes: [12, 19, 24, 26, 21, 24, 28, 26, 24, 19, 17, 21, 26, 28, 31, 24], rhythm: [0, 1, 3, 4, 8, 9, 11, 12, 14], wave: 'triangle' },
    { title: 'Musa’s Morning Round', bpm: 110, root: 155.56, bass: [0, 5, 10, 7], notes: [12, 17, 19, 22, 24, 19, 17, 15, 12, 19, 22, 27, 24, 22, 19, 17], rhythm: [0, 2, 3, 7, 9, 10, 14], wave: 'triangle' },
    { title: 'Under the Canopy', bpm: 94, root: 130.81, bass: [0, 9, 5, 2], notes: [12, 16, 21, 19, 17, 16, 14, 9, 12, 17, 21, 24, 21, 19, 16, 14], rhythm: [0, 3, 4, 8, 10, 12, 15], wave: 'sine' },
    { title: 'Connected Streams', bpm: 118, root: 164.81, bass: [0, 7, 2, 5], notes: [12, 19, 26, 24, 19, 16, 17, 21, 24, 26, 28, 24, 21, 17, 16, 19], rhythm: [0, 1, 5, 6, 8, 12, 13, 15], wave: 'triangle' },
    { title: 'Load by Load', bpm: 114, root: 116.54, bass: [0, 3, 7, 10], notes: [12, 15, 22, 19, 24, 22, 19, 17, 15, 19, 22, 27, 26, 22, 19, 12], rhythm: [0, 2, 5, 7, 9, 11, 13, 14], wave: 'triangle' },
    { title: 'Recovery Rising', bpm: 130, root: 196, bass: [0, 5, 2, 9], notes: [12, 16, 19, 26, 24, 21, 28, 26, 24, 19, 21, 29, 28, 26, 24, 16], rhythm: [0, 1, 2, 6, 8, 9, 10, 13, 15], wave: 'sine' }
  ];
  function create(environment, settings) {
    let ac, music, effects, timer, step = 0, index = 0, intensity = 0, muted = false;
    const nodes = new Map();
    function ensure() {
      if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return ac; }
      try {
        const AC = environment.AudioContext || environment.webkitAudioContext;
        if (!AC) return null;
        ac = new AC();
        music = ac.createGain(); effects = ac.createGain();
        const limiter = ac.createDynamicsCompressor();
        limiter.threshold.value = -18; limiter.ratio.value = 6;
        music.connect(limiter); effects.connect(limiter); limiter.connect(ac.destination);
        volumes(settings);
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      } catch { ac = null; return null; }
    }
    function volumes(next) {
      settings = next;
      if (music) music.gain.value = muted ? 0 : Math.max(0, Math.min(1, Number(settings.music) || 0)) * .32;
      if (effects) effects.gain.value = muted ? 0 : Math.max(0, Math.min(1, Number(settings.sfx) || 0)) * .36;
    }
    function note(freq, duration, wave, gain, bus, delay = 0, endFreq) {
      if (!ac || muted) return;
      const now = ac.currentTime + delay;
      const osc = ac.createOscillator(), envelope = ac.createGain();
      osc.type = wave; osc.frequency.setValueAtTime(freq, now);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
      envelope.gain.setValueAtTime(.0001, now);
      envelope.gain.exponentialRampToValueAtTime(gain, now + .012);
      envelope.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.connect(envelope); envelope.connect(bus);
      nodes.set(osc, bus);
      osc.onended = () => { nodes.delete(osc); osc.disconnect(); envelope.disconnect(); };
      osc.start(now); osc.stop(now + duration + .03);
    }
    function tick() {
      if (!ac || ac.state !== 'running' || muted || settings.music <= 0) return;
      const theme = themes[index], beat = step++ % 32;
      const frequency = n => theme.root * 2 ** (n / 12);
      if (beat % 8 === 0) {
        const chord = theme.bass[(beat / 8) % 4];
        note(frequency(chord - 12), .42, 'triangle', .11, music);
        [chord + 12, chord + 16, chord + 19].forEach(n => note(frequency(n), .68, 'sine', .012, music));
      }
      if (theme.rhythm.includes(beat % 16)) note(frequency(theme.notes[beat % 16]), .18, theme.wave, .035, music, beat % 2 ? .025 : 0);
      if (beat % 4 === 0) note(110, .11, 'sine', .09, music, 0, 42);
      if (beat % 4 === 2) { note(1800, .024, 'triangle', .012, music); note(980, .04, 'triangle', .009, music, .018); }
      if (intensity > .5 && beat % 2) note(frequency(theme.notes[beat % 16] + 12), .06, 'sine', .012, music);
    }
    function pause(musicOnly = false) {
      if (timer) environment.clearInterval(timer);
      timer = null;
      for (const [node, bus] of nodes) if (!musicOnly || bus === music) { try { node.stop(); } catch {} nodes.delete(node); }
    }
    function start(missionIndex) {
      pause(true); const next = Math.max(0, Math.min(themes.length - 1, missionIndex)); if (next !== index) step = 0; index = next;
      if (!ensure()) return;
      tick(); timer = environment.setInterval(tick, 60000 / themes[index].bpm / 2);
    }
    function effect(kind) {
      if (!ensure() || settings.sfx <= 0 || muted) return;
      if (kind === 'collect') { note(440, .09, 'triangle', .06, effects); note(660, .08, 'sine', .04, effects, .06); }
      if (kind === 'wisp') { note(720, .1, 'sine', .05, effects, 0, 330); }
      if (kind === 'pulse') { note(180, .22, 'triangle', .08, effects, 0, 720); note(1046, .18, 'sine', .04, effects, .12); }
      if (kind === 'dispatch') { note(392, .12, 'triangle', .05, effects); note(587, .15, 'sine', .04, effects, .08); }
      if (kind === 'build') [392, 523, 659, 784].forEach((n, i) => note(n, .17, 'triangle', .04, effects, i * .07));
      if (kind === 'prepare') { note(260, .1, 'triangle', .06, effects); note(520, .13, 'triangle', .04, effects, .07); }
      if (kind === 'retry') { note(220, .16, 'sine', .06, effects, 0, 165); }
      if (kind === 'sort' || kind === 'checkpoint' || kind === 'complete') [523, 659, 784].forEach((n, i) => note(n, .14, 'sine', .045, effects, i * .055));
      if (kind === 'complete') [784, 988, 1046].forEach((n, i) => note(n, .3, 'triangle', .04, effects, .25 + i * .09));
    }
    return { start, pause, effect, volumes, setIntensity(value) { intensity = value; }, mute(value) { muted = value; volumes(settings); }, get available() { return !!ac; } };
  }
  return { themes, create };
});
