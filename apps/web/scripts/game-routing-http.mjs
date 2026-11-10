// Read-only HTTP regression for the built app behind the local Cloudflare Worker.
import assert from 'node:assert/strict';
import { GAME_EDITORIALS } from '../src/content/gameEditorials.ts';
import { gamePagePath } from '../src/lib/gamePaths.ts';
const origin = process.env.GAME_ORIGIN || 'http://127.0.0.1:8787';
async function get(path) {
  const r = await fetch(origin + path, { signal: AbortSignal.timeout(20000) });
  return { r, body: await r.text() };
}
for (const category of ['educational', 'adventure', 'racing', 'arcade']) {
  const { r, body } = await get('/categories/' + category);
  assert.equal(r.status, 200);
  assert.match(
    body,
    new RegExp(
      '<link rel=\"canonical\" href=\"https://webgamearena.com/categories/' + category + '\"'
    )
  );
  assert.doesNotMatch(body, /<meta name="robots" content="[^"]*noindex/);
  assert.doesNotMatch(r.headers.get('x-robots-tag') || '', /noindex/);
  assert.match(body, /<title>/);
  console.log('PASS category ' + category);
}
assert.equal((await get('/categories/not-a-category')).r.status, 404);
const guide = await get('/games/brick-playground-3d');
assert.equal(guide.r.status, 200);
assert.match(
  guide.body,
  /<link rel="canonical" href="https:\/\/webgamearena.com\/games\/brick-playground-3d"/
);
assert.match(guide.body, /Complete game guide/);
assert.doesNotMatch(guide.r.headers.get('x-robots-tag') || '', /noindex/);
console.log('PASS guide canonical and editorial');
for (const path of ['/play/brick-playground-3d', '/play/brick-playground-3d.html']) {
  const { r, body } = await get(path);
  assert.equal(r.status, 200);
  assert.match(body, /id="transportButton"/);
  assert.match(body, /id="gardenHud"/);
  assert.doesNotMatch(body, /Complete game guide/);
  if (process.env.TEST_WORKER) assert.match(r.headers.get('x-robots-tag') || '', /noindex/);
  console.log('PASS workshop ' + path + ' ' + r.headers.get('x-robots-tag'));
}
const raw = await get('/games/fruit-slice/index.html');
assert.equal(raw.r.status, 200);
assert.doesNotMatch(raw.body, /Complete game guide/);
if (process.env.TEST_WORKER) assert.match(raw.r.headers.get('x-robots-tag') || '', /noindex/);
console.log('PASS explicit raw game index ' + raw.r.headers.get('x-robots-tag'));
const duplicate = await get('/games/fruit-slice');
assert.equal(duplicate.r.status, 200);
assert.match(duplicate.body, /<meta name="robots" content="[^"]*noindex/);
assert.match(
  duplicate.body,
  /<link rel="canonical" href="https:\/\/webgamearena.com\/play\/fruit-slice"/
);
console.log('PASS duplicate guide does not collide with raw game');
const module = await get('/games/brick-playground-3d/transport.mjs');
assert.equal(module.r.status, 200);
assert.match(module.body, /advanceTransport/);
console.log('PASS transport asset');
const map = await get('/sitemap.xml');
assert.equal(map.r.status, 200);
assert.match(map.body, /<loc>https:\/\/webgamearena.com\/games\/brick-playground-3d<\/loc>/);
assert.doesNotMatch(map.body, /brick-playground-3d\/<\/loc>/);
console.log('PASS sitemap canonical');

for (const path of [
  ...Object.keys(GAME_EDITORIALS).map(gamePagePath),
  ...[
    'about',
    'contact',
    'privacy',
    'terms',
    'cookies',
    'community-guidelines',
    'parents-safety',
    'accessibility'
  ].map((p) => '/' + p)
]) {
  const { r, body } = await get(path);
  assert.equal(r.status, 200, path);
  const canonical = body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  assert.ok(canonical, path + ' has canonical');
  assert.equal(
    new URL(canonical[1], 'https://webgamearena.com' + path).href,
    'https://webgamearena.com' + path
  );
  assert.doesNotMatch(body, /<meta name="robots" content="[^"]*noindex/);
  assert.doesNotMatch(r.headers.get('x-robots-tag') || '', /noindex/);
  console.log('PASS indexable canonical ' + path);
}
console.log(
  'PASS built routing, ' +
    (process.env.TEST_WORKER ? 'Worker asset headers, ' : '') +
    'all 24 game guides and eight information pages'
);
