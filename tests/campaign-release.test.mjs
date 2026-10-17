import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditCampaign, campaignPath } from '../tools/audit-sky-temple.mjs';
const base = new URL('../' + campaignPath + '/', import.meta.url);
test('candidate references resolve and engine/music bytes match their pinned manifests', () => {
  const audit = auditCampaign();
  assert.deepEqual(audit.errors, []);
  assert.ok(audit.references > 30);
  assert.ok(audit.largestBytes < 25 * 1024 * 1024);
});
test('full-window launch offers all four worlds with a narrow-screen layout', () => {
  const html = readFileSync(new URL('launch.html', base), 'utf8');
  const css = readFileSync(new URL('launch.css', base), 'utf8');
  for (const href of ['./index.html', './crystal/index.html', './storm/index.html', './solar/index.html']) assert.ok(html.includes(`href="${href}"`));
  assert.match(html, /viewport-fit=cover/);
  assert.match(css, /max-width: 600px/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.ok(!html.includes('<iframe'));
});
test('no legacy parent leaderboard bridge remains in any campaign world', () => {
  for (const world of ['', 'crystal/', 'storm/', 'solar/']) {
    const source = readFileSync(new URL(world + 'game.js', base), 'utf8');
    assert.ok(!/postMessage|SEND_SCORES_TO_PARENT|\/score["'`]|daily-challenge/.test(source));
    assert.match(source, /function submitScore\(\)\s*\{\s*campaignPlatform.recordScore\(score\);?\s*\}/);
  }
});
