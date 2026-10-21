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
    { title: 'The Loop Returns', bpm: 124, root: 130.81, bass: [0, 5, 9, 7], notes: [12, 16, 19, 24, 28, 24, 21, 19, 17, 21, 24, 29, 28, 24, 19, 16], rhythm: [0, 2, 3, 6, 8, 10, 11, 14], wave: 'triangle' }
  ];
  function create(environment, settings) {
    let ac, music, effects, timer, step = 0, index = 0, intensity = 0, muted = false;
    const nodes = new Set();
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
      nodes.add(osc);
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
    function pause() {
      if (timer) environment.clearInterval(timer);
      timer = null;
      for (const node of nodes) { try { node.stop(); } catch {} }
      nodes.clear();
    }
    function start(missionIndex) {
      pause(); index = Math.max(0, Math.min(themes.length - 1, missionIndex)); step = 0;
      if (!ensure()) return;
      tick(); timer = environment.setInterval(tick, 60000 / themes[index].bpm / 2);
    }
    function effect(kind) {
      if (!ensure() || settings.sfx <= 0 || muted) return;
      if (kind === 'collect') { note(440, .09, 'triangle', .06, effects); note(660, .08, 'sine', .04, effects, .06); }
      if (kind === 'prepare') { note(260, .1, 'triangle', .06, effects); note(520, .13, 'triangle', .04, effects, .07); }
      if (kind === 'retry') { note(220, .16, 'sine', .06, effects, 0, 165); }
      if (kind === 'sort' || kind === 'checkpoint' || kind === 'complete') [523, 659, 784].forEach((n, i) => note(n, .14, 'sine', .045, effects, i * .055));
      if (kind === 'complete') [784, 988, 1046].forEach((n, i) => note(n, .3, 'triangle', .04, effects, .25 + i * .09));
    }
    return { start, pause, effect, volumes, setIntensity(value) { intensity = value; }, mute(value) { muted = value; volumes(settings); }, get available() { return !!ac; } };
  }
  return { themes, create };
});
