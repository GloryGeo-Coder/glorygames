import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const base = new URL('../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('assets/audio/music-manifest.json', base), 'utf8'));
test('all eight original tracks exist, match checksums and have verified stereo MP3 decode measurements', () => {
  assert.equal(manifest.tracks.length, 8); assert.equal(manifest.channels, 2);
  const names = new Set();
  for (const track of manifest.tracks) {
    const bytes = readFileSync(new URL(`assets/audio/${track.file}`, base));
    assert.equal(bytes.length, track.bytes); assert.equal(createHash('sha256').update(bytes).digest('hex'), track.sha256);
    assert.ok(track.loop_seconds > 15 && track.loop_seconds < 30);
    assert.ok(Math.abs(track.loop_seconds - track.decoded_seconds) < .005);
    assert.ok(track.peak < .9 && track.rms > .08 && track.rms < .3);
    names.add(`${track.world}/${track.kind}`);
  }
  assert.equal(names.size, 8);
});
test('each level has labelled independent controls in a compact details panel without adding HUD buttons', () => {
  for (const world of ['', 'crystal/', 'storm/', 'solar/']) {
    const html = readFileSync(new URL(`${world}index.html`, base), 'utf8');
    for (const id of ['musicVolume', 'effectsVolume', 'musicVolumeValue', 'effectsVolumeValue', 'audioSettings', 'audioStatus', 'chapterLabel']) {
      assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, id);
    }
    assert.match(html, /for="musicVolume"/); assert.match(html, /for="effectsVolume"/);
    assert.match(html, /<details class="audioSettings"/);
    assert.match(html, /campaign-polish.css\?v=0\.13/);
    assert.ok(html.indexOf('id="audioSettings"') > html.indexOf('id="primaryBtn"'));
    assert.ok(!html.includes('audioMenuBtn'));
  }
});
