/** Read-only account integration and device scores while the campaign awaits release. */
export const DEVICE_SCORE_PREFIX = 'wga_skytemple_practice_v1:';
const WORLDS = new Set(['garden', 'crystal', 'storm', 'solar']);
const cleanName = value => typeof value === 'string' ? value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 40) : '';

export function createCampaignPlatform({ world, storage, fetcher = globalThis.fetch,
  origin = globalThis.location?.origin, enabled = false, timers = globalThis } = {}) {
  if (!WORLDS.has(world)) throw new Error('Unknown campaign world');
  if (storage === undefined) { try { storage = globalThis.localStorage; } catch { storage = null; } }
  let player = 'Guest Player', best = 0, disposed = false, connected = false, pending = null, abort = null;
  const listeners = new Set(), key = DEVICE_SCORE_PREFIX + world;
  try {
    player = cleanName(storage?.getItem('wga_guest_player_name')) || player;
    const prior = Number(storage?.getItem(key));
    if (Number.isSafeInteger(prior) && prior >= 0 && prior <= 1_000_000) best = prior;
  } catch {}
  const state = () => ({ player, best, world, connected, scoreMode: 'device', scoreSubmission: false });
  function notify() { for (const fn of listeners) { try { fn(state()); } catch {} } }
  function connect() {
    if (disposed || connected || !enabled || !fetcher || !/^https?:\/\//.test(origin || '')) return Promise.resolve(false);
    if (pending) return pending;
    abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const request = abort;
    const deadline = request ? timers.setTimeout(() => request.abort(), 4500) : null;
    pending = Promise.resolve().then(async () => {
      try {
        const response = await fetcher(new URL('/api/me', origin), { method: 'GET', credentials: 'same-origin',
          cache: 'no-store', ...(request ? { signal: request.signal } : {}) });
        if (!response.ok) return false;
        const data = await response.json();
        if (disposed) return false;
        player = cleanName(data?.user?.displayName) || player;
        connected = true; notify(); return true;
      } catch { return false; }
      finally {
        if (deadline !== null) timers.clearTimeout(deadline);
        pending = null;
        if (abort === request) abort = null;
      }
    });
    return pending;
  }
  function recordScore(value) {
    if (disposed || !Number.isSafeInteger(value) || value <= best || value > 1_000_000) return false;
    best = value;
    try { storage?.setItem(key, String(best)); } catch {}
    // No POST, parent/opener message, daily challenge or global leaderboard writes.
    notify(); return true;
  }
  return { state, connect, recordScore,
    subscribe(fn) { listeners.add(fn); try { fn(state()); } catch {} return () => listeners.delete(fn); },
    dispose() { disposed = true; abort?.abort(); listeners.clear(); } };
}
