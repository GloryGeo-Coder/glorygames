import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const helper = fileURLToPath(new URL('./helpers/campaign-audio-runtime-probe.mjs', import.meta.url));
for (const world of ['garden', 'crystal', 'storm', 'solar']) {
  test(`${world}: actual runtime starts audio on Play, saves independent sliders, mutes and silences on pause/background`, () => {
    const result = spawnSync(process.execPath, [helper, world], { encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /PASS audio runtime/);
  });
}
test('all original gameplay SFX are replaced with event cues and encounter audio in each world', () => {
  for (const world of ['', 'crystal/', 'storm/', 'solar/']) {
    const source = readFileSync(new URL(`../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/${world}game.js`, import.meta.url), 'utf8');
    for (const event of ['jump', 'land', 'glide', 'blast', 'hit', 'damage', 'relic', 'checkpoint', 'boss-awaken', 'boss-warn', 'boss-cast', 'boss-defeated', 'portal', 'victory', 'defeat']) {
      assert.ok(source.includes(`soundCue('${event}'`), `${world}: ${event}`);
    }
    assert.ok(!source.includes('function beep('));
  }
});
