import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGameScore, createStandaloneScoreBridge, createGameScoreTransport, subscribeGameTabScores, STORAGE_PREFIX } from '../public/games/_shared/game-tab-score.mjs';

function clock() { let id = 0; const tasks = new Map(); return { tasks, setTimeout(fn, delay) { tasks.set(++id, { fn, delay }); return id; }, clearTimeout(key) { tasks.delete(key); } }; }
const event = (score, final = false) => ({ type: 'GG_SCORE', slug: 'brick-blaster', score, final });
const response = (ok = true, user = null) => ({ ok, async json() { return { user }; } });

test('legacy flat/nested SDK payloads and the Space Dodger alias map to their canonical game', () => {
  for (const data of [event(12), { type: 'gg:score', payload: { value: '12', gameSlug: 'brick-blaster' } }, { type: 'GG_SUBMIT_DAILY_SCORE', score: 12 }]) assert.equal(parseGameScore(data, 'brick-blaster').score, 12);
  assert.deepEqual(parseGameScore({ type: 'GG_SCORE', game: 'space-dodger-starfall-odyssey', score: 41, final: true }, 'space-dodger'), { score: 41, final: true });
  for (const data of [event(NaN), event(Infinity), event(-1), event(''), event({}), event(Number.MAX_SAFE_INTEGER + 1), { ...event(2), slug: 'word-dash' }, { ...event(2), type: 'chat' }]) assert.equal(parseGameScore(data, 'brick-blaster'), null);
});

test('guests submit once to daily challenge; duplicate event variants and lower rounds do not duplicate writes', async () => {
  const calls = [], timers = clock();
  const bridge = createStandaloneScoreBridge({ slug: 'brick-blaster', origin: 'https://example.test', timers,
    fetcher: async (url, options) => { calls.push({ path: url.pathname, options }); return response(); } });
  await bridge.connect(); assert.equal(calls.length, 1);
  bridge.report(event(0)); assert.equal(timers.tasks.size, 0);
  bridge.report(event(20)); bridge.report({ type: 'gg:score', payload: { value: 20 } });
  assert.equal(timers.tasks.size, 1); await bridge.flush();
  assert.equal(calls.filter(c => c.options.method === 'POST').length, 1);
  assert.equal(JSON.parse(calls[1].options.body).score, 20);
  assert.equal(calls[1].options.credentials, 'same-origin');
  assert.equal(calls[1].options.keepalive, true);
  bridge.report(event(0)); bridge.report(event(9, true)); await bridge.flush();
  assert.equal(calls.filter(c => c.options.method === 'POST').length, 1);
  bridge.dispose();
});

test('signed-in games retain both endpoints and retry only a failed board', async () => {
  const calls = [], timers = clock(); let dailyFails = true;
  const bridge = createStandaloneScoreBridge({ slug: 'brick-blaster', origin: 'https://example.test', timers,
    fetcher: async (url, options) => {
      calls.push({ path: url.pathname, options });
      return response(options.method === 'GET' || !url.pathname.includes('daily-challenge') || !dailyFails, { id: 'player-1', displayName: 'Player One' });
    } });
  await bridge.connect(); bridge.report(event(35, true)); await bridge.flush();
  assert.equal(bridge.state().lastGlobal, 35); assert.equal(bridge.state().lastDaily, 0);
  dailyFails = false; await bridge.flush();
  assert.equal(calls.filter(c => c.path.endsWith('/score')).length, 1);
  assert.equal(calls.filter(c => c.path.includes('daily-challenge')).length, 2);
  assert.equal(JSON.parse(calls.find(c => c.path.includes('daily-challenge')).options.body).playerName, 'Player One');
  bridge.dispose();
});

test('an identity response arriving after a final score still schedules the authenticated board', async () => {
  const timers = clock(); let resolveUser; const posts = [];
  const bridge = createStandaloneScoreBridge({ slug: 'brick-blaster', origin: 'https://example.test', timers,
    fetcher: (url, options) => options.method === 'GET' ? new Promise(resolve => { resolveUser = resolve; }) : (posts.push(url.pathname), Promise.resolve(response())) });
  const connecting = bridge.connect(); await Promise.resolve();
  bridge.report(event(22, true)); await bridge.flush();
  assert.equal(posts.length, 1);
  resolveUser(response(true, { id: 'u', displayName: 'A' })); await connecting;
  assert.equal(timers.tasks.size, 1); await bridge.flush();
  assert.equal(posts.filter(p => p.endsWith('/score')).length, 1); bridge.dispose();
});

test('in-flight flush coalesces newer scores; request failures and unavailable storage never break gameplay', async () => {
  let release; const timers = clock(), updates = [], scores = [];
  const bridge = createStandaloneScoreBridge({ slug: 'brick-blaster', origin: 'https://example.test', timers,
    storage: { getItem() { throw Error('blocked'); } }, onScore: s => updates.push(s),
    fetcher: async (_url, options) => {
      if (options.method === 'GET') return response();
      const value = JSON.parse(options.body).score; scores.push(value);
      if (value === 10) await new Promise(resolve => { release = resolve; });
      return response();
    } });
  await bridge.connect(); bridge.report(event(10)); const first = bridge.flush(); await Promise.resolve();
  bridge.report(event(25)); release(); await first; await bridge.flush();
  assert.deepEqual(scores, [10, 25]); assert.deepEqual(updates, [10, 25]); bridge.dispose();
  const offline = createStandaloneScoreBridge({ slug: 'brick-blaster', origin: 'https://example.test', timers: clock(), fetcher: async () => { throw Error('offline'); } });
  await offline.connect(); offline.report(event(3)); await offline.flush(); assert.equal(offline.state().best, 3); offline.dispose();
});

test('practice/unsupported protocols produce no API calls, and disposal blocks later scores', async () => {
  let calls = 0;
  const bridge = createStandaloneScoreBridge({ slug: 'brick-blaster', origin: 'file://', timers: clock(), fetcher: async () => { calls++; } });
  await bridge.connect(); bridge.report(event(10)); await bridge.flush(); bridge.dispose();
  assert.equal(bridge.report(event(20)), false); assert.equal(calls, 0);
});

test('storage fallback recovers scores, validates game identity/age and removes subscriptions', () => {
  const handlers = new Map(), store = new Map(), values = [];
  const win = { localStorage: { setItem(k, v) { store.set(k, v); }, getItem: k => store.get(k) }, addEventListener: (k, fn) => handlers.set(k, fn), removeEventListener: k => handlers.delete(k) };
  const transport = createGameScoreTransport({ window: win, slug: 'brick-blaster' });
  transport.emit(17); const close = subscribeGameTabScores({ window: win, slug: 'brick-blaster', onScore: e => values.push(e) });
  assert.equal(values[0].score, 17);
  transport.emit(23, 'submitted'); handlers.get('storage')({ key: STORAGE_PREFIX + 'brick-blaster', newValue: store.get(STORAGE_PREFIX + 'brick-blaster') });
  assert.equal(values.at(-1).status, 'submitted');
  const stored = JSON.parse(store.get(STORAGE_PREFIX + 'brick-blaster'));
  for (const bad of [{ ...stored, slug: 'word-dash' }, { ...stored, score: Infinity }, { ...stored, at: 0 }]) handlers.get('storage')({ key: STORAGE_PREFIX + 'brick-blaster', newValue: JSON.stringify(bad) });
  assert.equal(values.length, 2); close(); transport.close(); assert.equal(handlers.size, 0);
});

test('BroadcastChannel carries current scores when device storage is blocked', () => {
  const channels = [], received = [];
  class Channel {
    constructor(name) { this.name = name; channels.push(this); }
    postMessage(data) { for (const peer of channels) if (peer !== this && !peer.closed) peer.onmessage?.({ data }); }
    close() { this.closed = true; }
  }
  const win = { BroadcastChannel: Channel, get localStorage() { throw Error('unavailable'); }, addEventListener() {}, removeEventListener() {} };
  const close = subscribeGameTabScores({ window: win, slug: 'brick-blaster', onScore: data => received.push(data) });
  const transport = createGameScoreTransport({ window: win, slug: 'brick-blaster' });
  transport.emit(42); transport.emit(42, 'submitted');
  assert.deepEqual(received.map(data => [data.score, data.status]), [[42, 'live'], [42, 'submitted']]);
  close(); transport.close(); assert.ok(channels.every(channel => channel.closed));
});
