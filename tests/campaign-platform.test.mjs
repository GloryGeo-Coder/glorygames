import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignPlatform, DEVICE_SCORE_PREFIX } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-platform.mjs';
import { memoryStorage, nextTurn } from './helpers/audio-test-context.mjs';

test('candidate scores are local only, bounded, monotonic and cannot submit through the legacy score flag', async () => {
  const storage = memoryStorage(), calls = [];
  storage.setItem('existing-campaign-save', 'untouched');
  const bridge = createCampaignPlatform({ world: 'garden', storage, enabled: true, origin: 'https://webgamearena.com',
    fetcher: async (url, options) => { calls.push({ url: String(url), options });
      return { ok: true, json: async () => ({ user: { displayName: 'Glory', email: 'unused@example.com' } }) }; } });
  await bridge.connect();
  assert.equal(bridge.state().player, 'Glory');
  for (const invalid of [NaN, Infinity, -1, 2.5, 1_000_001, '500']) assert.equal(bridge.recordScore(invalid), false);
  assert.equal(bridge.recordScore(520), true); assert.equal(bridge.recordScore(400), false);
  assert.equal(storage.getItem(DEVICE_SCORE_PREFIX + 'garden'), '520');
  assert.equal(storage.getItem('existing-campaign-save'), 'untouched');
  assert.equal(calls.length, 1); assert.ok(calls.every(c => c.options.method === 'GET'));
  assert.equal(bridge.state().scoreSubmission, false); assert.ok(!JSON.stringify([...storage.map]).includes('unused@example.com'));
  bridge.dispose();
});
test('world bests do not overwrite one another, and unavailable storage does not stop a run', () => {
  const storage = memoryStorage();
  for (const [i, world] of ['garden', 'crystal', 'storm', 'solar'].entries()) {
    const bridge = createCampaignPlatform({ world, storage }); bridge.recordScore(100 + i); bridge.dispose();
  }
  assert.equal(new Set([...storage.map.values()]).size, 4);
  const bridge = createCampaignPlatform({ world: 'garden', storage: { getItem() { throw Error(); }, setItem() { throw Error(); } } });
  assert.equal(bridge.recordScore(500), true); assert.equal(bridge.state().best, 500); bridge.dispose();
});
test('offline identity lookup retries safely, and concurrent requests are coalesced', async () => {
  let attempts = 0;
  const bridge = createCampaignPlatform({ world: 'storm', enabled: true, origin: 'http://localhost:8080',
    fetcher: () => { attempts++; if (attempts === 1) throw Error('offline');
      return Promise.resolve({ ok: true, json: async () => ({ user: null }) }); } });
  assert.equal(await bridge.connect(), false);
  const a = bridge.connect(), b = bridge.connect(); await Promise.all([a, b]);
  assert.equal(attempts, 2); assert.equal(bridge.state().connected, true); bridge.dispose();
});
test('late identity response after disposal cannot change UI state', async () => {
  let finish;
  const bridge = createCampaignPlatform({ world: 'solar', enabled: true, origin: 'https://webgamearena.com',
    fetcher: () => new Promise(r => { finish = r; }) });
  const pending = bridge.connect(); await nextTurn(); bridge.dispose();
  finish({ ok: true, json: async () => ({ user: { displayName: 'Late user' } }) });
  await pending; assert.equal(bridge.state().player, 'Guest Player');
});
