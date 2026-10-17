import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignAudio, normalizeAudioPreferences, conditionMusicLoop, AUDIO_STORAGE_KEY, SFX_CUES } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-audio.mjs';
import { FakeAudioContext, nextTurn, memoryStorage } from './helpers/audio-test-context.mjs';

function setup(t, options = {}) {
  const ctx = new FakeAudioContext(), calls = [], storage = memoryStorage();
  let created = 0;
  const audio = createCampaignAudio({ world: 'garden', storage,
    contextFactory: () => { created++; return ctx; },
    fetcher: async url => { calls.push(String(url)); return { ok: true, arrayBuffer: async () => new ArrayBuffer(10) }; }, ...options });
  t.after(() => audio.dispose());
  return { audio, ctx, calls, storage, created: () => created };
}
async function start(audio) { audio.setState({ mode: 'playing' }); await audio.unlock(); await nextTurn(); }
const liveMusic = ctx => ctx.sources.filter(s => s.loop && s.starts.length && !s.stops.length);
const liveEffects = ctx => ctx.sources.filter(s => !s.loop && s.starts.length && !s.stops.length);

test('opening a game or setting its mode cannot create audio or download music without a gesture', t => {
  const { audio, calls, created } = setup(t);
  audio.setState({ mode: 'playing' });
  assert.equal(created(), 0); assert.equal(calls.length, 0); assert.equal(audio.play('jump'), false);
});
for (const world of ['garden', 'crystal', 'storm', 'solar']) {
  test(`${world}: only this world's exploration and Guardian tracks are loaded and cached`, async t => {
    const { audio, ctx, calls, created } = setup(t, { world });
    await start(audio);
    assert.match(calls[0], new RegExp(`${world}-exploration.mp3$`));
    assert.equal(liveMusic(ctx).length, 1);
    audio.setState({ battle: true }); await nextTurn();
    assert.match(calls[1], new RegExp(`${world}-guardian.mp3$`));
    assert.equal(liveMusic(ctx).length, 1);
    assert.ok(ctx.gains.some(g => g.gain.automation.some(a => a[0] === 'ramp' && a[2] === .8)));
    audio.setState({ battle: false }); await nextTurn();
    assert.equal(calls.length, 2); assert.equal(ctx.decodeCalls, 2); assert.equal(created(), 1);
    assert.equal(liveMusic(ctx).length, 1);
  });
}
test('context resume is called synchronously in the user action and gameplay does not await downloads', async t => {
  let resolveFetch;
  const { audio, ctx } = setup(t, { fetcher: () => new Promise(resolve => { resolveFetch = resolve; }) });
  audio.setState({ mode: 'playing' });
  const activation = audio.unlock();
  assert.equal(ctx.resumeCalls, 1);
  await activation; assert.equal(audio.state().status, 'loading');
  assert.equal(audio.play('jump'), true);
  resolveFetch({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }); await nextTurn();
  assert.equal(liveMusic(ctx).length, 1);
});
test('pause stops music/effects, suspends the context and resumes one loop at its previous offset', async t => {
  const { audio, ctx } = setup(t); await start(audio);
  assert.equal(audio.play('blast'), true); ctx.currentTime = 7;
  audio.setState({ mode: 'paused' });
  assert.equal(liveMusic(ctx).length, 0); assert.equal(liveEffects(ctx).length, 0);
  assert.equal(ctx.state, 'suspended'); assert.equal(audio.play('jump'), false);
  audio.setState({ mode: 'playing' }); await audio.unlock(); await nextTurn();
  assert.equal(liveMusic(ctx).length, 1); assert.equal(liveMusic(ctx)[0].starts[0][1], 7);
});
test('a music download completing after pause cannot start late playback', async t => {
  let finish;
  const { audio, ctx } = setup(t, { fetcher: () => new Promise(r => { finish = r; }) });
  audio.setState({ mode: 'playing' }); await audio.unlock();
  audio.setState({ mode: 'paused' });
  finish({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }); await nextTurn();
  assert.equal(liveMusic(ctx).length, 0); assert.equal(ctx.state, 'suspended');
});
test('a stale Guardian response cannot replace the exploration theme after the encounter ends', async t => {
  let finishBoss;
  const { audio, ctx } = setup(t, { fetcher: async url => {
    if (String(url).includes('guardian')) return new Promise(r => { finishBoss = r; });
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) };
  } });
  await start(audio); audio.setState({ battle: true }); await nextTurn();
  audio.setState({ battle: false }); await nextTurn();
  finishBoss({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }); await nextTurn();
  assert.equal(liveMusic(ctx).length, 1); assert.equal(audio.state().battle, false);
  assert.equal(ctx.sources.filter(s => s.loop && s.starts.length).length, 1);
});
test('backgrounding also silences victory stingers; returning to a paused game cannot resume music', async t => {
  const { audio, ctx } = setup(t); await start(audio);
  audio.setState({ mode: 'won' }); assert.equal(audio.play('victory', { terminal: true }), true);
  audio.setState({ visible: false }); assert.equal(liveEffects(ctx).length, 0);
  assert.equal(audio.play('victory', { terminal: true }), false);
  audio.setState({ mode: 'paused', visible: true }); await nextTurn();
  assert.equal(liveMusic(ctx).length, 0);
});
test('music and effects volumes are independent; mute persists without touching campaign saves', async t => {
  const { audio, ctx, storage } = setup(t); storage.setItem('wga_skytemple_save_v1:garden', 'existing-progress');
  await start(audio); audio.setPreferences({ music: 0, effects: .25 });
  assert.equal(liveMusic(ctx).length, 0); assert.equal(audio.play('relic'), true);
  audio.setPreferences({ muted: true }); assert.equal(liveEffects(ctx).length, 0); assert.equal(audio.play('jump'), false);
  const second = createCampaignAudio({ world: 'solar', storage }); t.after(() => second.dispose());
  assert.equal(second.state().muted, true); assert.equal(second.state().music, 0); assert.equal(second.state().effects, .25);
  assert.equal(storage.getItem('wga_skytemple_save_v1:garden'), 'existing-progress');
  assert.equal(JSON.parse(storage.getItem(AUDIO_STORAGE_KEY)).version, 1);
});
test('corrupt settings, future versions and unavailable storage fail safely', t => {
  assert.deepEqual(normalizeAudioPreferences({ version: 99, muted: true }), normalizeAudioPreferences(null));
  assert.equal(normalizeAudioPreferences({ version: 1, music: 4, effects: -1 }).music, 1);
  assert.equal(normalizeAudioPreferences({ version: 1, music: 4, effects: -1 }).effects, 0);
  const { audio } = setup(t, { storage: { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } } });
  assert.doesNotThrow(() => audio.setPreferences({ muted: true }));
});
test('music network failure leaves effects usable and can be retried by the next gesture', async t => {
  let fail = true;
  const { audio, ctx } = setup(t, { fetcher: async () => { if (fail) throw Error('offline');
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) }; } });
  await start(audio); assert.equal(audio.state().status, 'music-error'); assert.equal(audio.play('jump'), true);
  fail = false; await audio.unlock(); await nextTurn(); assert.equal(audio.state().status, 'ready');
  assert.equal(liveMusic(ctx).length, 1);
});
test('SFX use bounded, finite buffers and throttle repeat events and simultaneous voices', async t => {
  const { audio, ctx } = setup(t); await start(audio);
  assert.equal(audio.play('blast'), true); assert.equal(audio.play('blast'), false);
  for (const cue of Object.keys(SFX_CUES)) audio.play(cue);
  assert.ok(liveEffects(ctx).length <= 12);
  for (const source of liveEffects(ctx)) {
    const samples = source.buffer.getChannelData(0);
    assert.ok(samples.every(Number.isFinite)); assert.ok(samples.some(x => Math.abs(x) > .01));
    assert.ok(samples.every(x => Math.abs(x) < 1));
  }
});
test('unsupported audio and rejected resume never throw into gameplay', async t => {
  const { audio } = setup(t, { contextFactory() { throw Error('unsupported'); } });
  audio.setState({ mode: 'playing' }); assert.equal(await audio.unlock(), false);
  assert.equal(audio.state().status, 'unavailable'); assert.equal(audio.play('jump'), false);
  const failing = new FakeAudioContext(); failing.resume = () => Promise.reject(Error('denied'));
  const other = setup(t, { contextFactory: () => failing }).audio;
  other.setState({ mode: 'playing' }); assert.equal(await other.unlock(), false); assert.equal(other.state().status, 'blocked');
});
test('disposing during a pending decode cannot resurrect playback or leave a running context', async t => {
  let decode;
  const ctx = new FakeAudioContext(); ctx.decodeAudioData = () => new Promise(r => { decode = r; });
  const { audio } = setup(t, { contextFactory: () => ctx });
  audio.setState({ mode: 'playing' }); await audio.unlock(); await nextTurn();
  audio.dispose(); decode({ duration: 22 }); await nextTurn();
  assert.equal(ctx.state, 'closed'); assert.equal(liveMusic(ctx).length, 0); assert.equal(audio.play('jump'), false);
});
test('every gameplay cue produces a non-silent, finite effect below clipping', async t => {
  const { audio, ctx } = setup(t); await start(audio);
  for (const cue of Object.keys(SFX_CUES)) {
    assert.equal(audio.play(cue), true, cue);
    const source = ctx.sources.at(-1), samples = source.buffer.getChannelData(0);
    assert.ok(samples.some(x => Math.abs(x) > .01), cue);
    assert.ok(samples.every(x => Number.isFinite(x) && Math.abs(x) < 1), cue);
    assert.ok(Math.abs(samples[0]) < .001 && Math.abs(samples.at(-1)) < .01, cue);
    source.onended(); ctx.currentTime += 2;
  }
});
test('decoded stereo loops have silent join endpoints without changing their duration or middle', () => {
  const channels = [new Float32Array(2400).fill(.4), new Float32Array(2400).fill(-.3)];
  const buffer = { sampleRate: 24000, numberOfChannels: 2, duration: .1, getChannelData: i => channels[i] };
  assert.equal(conditionMusicLoop(buffer), buffer);
  for (const data of channels) { assert.ok(Math.abs(data[0]) === 0); assert.ok(Math.abs(data.at(-1)) === 0); }
  assert.ok(Math.abs(channels[0][1200] - .4) < .00001); assert.equal(buffer.duration, .1);
});
