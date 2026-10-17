import test from 'node:test';
import assert from 'node:assert/strict';
import { toggleCampaignFullscreen, bindCampaignRuntime, describeCampaignLoadError } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-runtime.mjs';

test('graphics initialization failures are distinguished from asset loading failures', () => {
  for (const message of ['WebGL not supported', 'Unable to create graphics context']) {
    const failure = describeCampaignLoadError(new Error(message));
    assert.equal(failure.label, '3D GRAPHICS UNAVAILABLE');
    assert.match(failure.message, /hardware acceleration/);
    assert.ok(!failure.message.includes('connection'));
  }
  const failure = describeCampaignLoadError(new Error('404 world.glb'));
  assert.equal(failure.label, 'LOADING ISSUE');
  assert.match(failure.message, /3D assets/);
});

test('fullscreen works when supported and preserves full-window fallback when denied', async () => {
  let requested = 0, exited = 0, notice = '';
  const doc = { documentElement: { async requestFullscreen() { requested++; } }, async exitFullscreen() { exited++; } };
  assert.equal(await toggleCampaignFullscreen({ document: doc }), true); assert.equal(requested, 1);
  doc.fullscreenElement = {}; await toggleCampaignFullscreen({ document: doc }); assert.equal(exited, 1);
  doc.fullscreenElement = null; doc.documentElement.requestFullscreen = () => Promise.reject(Error('unavailable'));
  assert.equal(await toggleCampaignFullscreen({ document: doc, onStatus: v => { notice = v; } }), false);
  assert.match(notice, /fills this window/);
});
test('graphics loss pauses via callback, restoration never auto-resumes, and bfcache reload survives disposal', () => {
  const listeners = new Map(); let lost = 0, restored = 0, prevented = 0, reloaded = 0;
  const target = { addEventListener(k, fn) { listeners.set(k, fn); }, removeEventListener(k) { listeners.delete(k); }, setAttribute() {} };
  const doc = { ...target, getElementById: () => target };
  const win = { ...target, location: { reload() { reloaded++; } } };
  const controls = bindCampaignRuntime({ document: doc, window: win, onGraphicsLost: () => lost++, onGraphicsRestored: () => restored++ });
  listeners.get('webglcontextlost')({ preventDefault() { prevented++; } });
  listeners.get('webglcontextrestored')(); assert.equal(lost, 1); assert.equal(restored, 1); assert.equal(prevented, 1);
  controls.dispose(); assert.equal(listeners.has('webglcontextlost'), false);
  listeners.get('pageshow')({ persisted: true }); assert.equal(reloaded, 1);
  listeners.get('pageshow')({ persisted: false }); assert.equal(reloaded, 1);
});
