export function soundtrack() {
  let context,
    muted = false,
    beat = 0,
    next = 0,
    engine;
  try {
    muted = localStorage.getItem('wga.brick.mute') === 'yes';
  } catch {}
  function unlock() {
    if (!context && (window.AudioContext || window.webkitAudioContext))
      context = new (window.AudioContext || window.webkitAudioContext)();
    if (context?.state === 'suspended') context.resume().catch(() => {});
  }
  function note(freq, length, volume, wave = 'sine', end = freq) {
    if (!context || muted || context.state !== 'running') return;
    const o = context.createOscillator(),
      g = context.createGain(),
      t = context.currentTime;
    o.type = wave;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(end, t + length);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    o.connect(g);
    g.connect(context.destination);
    o.start(t);
    o.stop(t + length + 0.02);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  function motor(on) {
    if (on && !engine && !muted && context?.state === 'running') {
      const o = context.createOscillator(),
        g = context.createGain();
      o.type = 'triangle';
      o.frequency.value = 73;
      g.gain.value = 0.035;
      o.connect(g);
      g.connect(context.destination);
      o.start();
      engine = { o, g };
    } else if ((!on || muted) && engine) {
      engine.o.stop();
      engine.o.disconnect();
      engine.g.disconnect();
      engine = null;
    }
  }
  return {
    unlock,
    get muted() {
      return muted;
    },
    toggle() {
      muted = !muted;
      motor(false);
      try {
        localStorage.setItem('wga.brick.mute', muted ? 'yes' : 'no');
      } catch {}
      return muted;
    },
    snap() {
      note(950, 0.07, 0.13, 'triangle', 310);
    },
    foot() {
      note(105, 0.05, 0.045, 'sine', 50);
    },
    tick(t, running) {
      motor(running);
      if (t < next || !context || muted) return;
      next = t + 0.39;
      const melody = [392, 0, 494, 587, 0, 494, 440, 0, 349, 0, 440, 523, 0, 440, 392, 0];
      const f = melody[beat++ % melody.length];
      if (f) note(f, 0.29, 0.023, 'sine');
    },
    quiet() {
      motor(false);
      context?.suspend().catch(() => {});
    }
  };
}
