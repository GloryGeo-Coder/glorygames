/** Browser lifecycle controls independent of the game rules and saved progress. */
export function describeCampaignLoadError(error) {
  if (/webgl|graphics context|context creation/i.test(String(error?.message || error || ''))) {
    return { label: '3D GRAPHICS UNAVAILABLE', message: 'This browser could not start 3D graphics. Enable hardware acceleration and reload, or try another browser with WebGL support.' };
  }
  return { label: 'LOADING ISSUE', message: 'The game could not load its 3D assets. Check your connection and try again.' };
}

export async function toggleCampaignFullscreen({ document: doc = globalThis.document,
  onStatus = () => {} } = {}) {
  try {
    if (doc.fullscreenElement && doc.exitFullscreen) { await doc.exitFullscreen(); return true; }
    if (doc.documentElement?.requestFullscreen) { await doc.documentElement.requestFullscreen(); return true; }
  } catch {}
  onStatus('The game already fills this window.');
  return false;
}

export function bindCampaignRuntime({ document: doc = globalThis.document, window: win = globalThis.window,
  onGraphicsLost = () => {}, onGraphicsRestored = () => {}, onStatus = () => {} } = {}) {
  const canvas = doc?.getElementById('gameCanvas'), button = doc?.getElementById('fullscreenBtn');
  function fullscreen() { void toggleCampaignFullscreen({ document: doc, onStatus }); }
  function changed() {
    if (!button) return;
    button.textContent = doc.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
    button.setAttribute('aria-pressed', String(Boolean(doc.fullscreenElement)));
  }
  function lost(event) { event.preventDefault(); onGraphicsLost(); }
  function restored() { onGraphicsRestored(); }
  function shown(event) {
    // The existing game disposes its renderer on pagehide. Reload a restored
    // back/forward-cache page so its saved campaign gets a fresh renderer.
    if (event.persisted) win?.location?.reload?.();
  }
  button?.addEventListener('click', fullscreen);
  canvas?.addEventListener('webglcontextlost', lost);
  canvas?.addEventListener('webglcontextrestored', restored);
  doc?.addEventListener('fullscreenchange', changed);
  win?.addEventListener('pageshow', shown);
  return { dispose() {
    button?.removeEventListener?.('click', fullscreen);
    canvas?.removeEventListener?.('webglcontextlost', lost);
    canvas?.removeEventListener?.('webglcontextrestored', restored);
    doc?.removeEventListener?.('fullscreenchange', changed);
    // Keep pageshow through pagehide/renderer disposal so a bfcache restoration
    // can reload. A normal navigation destroys this document and its listener.
  } };
}
