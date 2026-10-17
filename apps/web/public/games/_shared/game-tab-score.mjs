/** Same-origin score transport for standalone games and their information pages. */
export const CHANNEL_NAME = 'wga-game-tabs-v1';
export const STORAGE_PREFIX = 'wga-game-tab-v1:';
const SCORE_TYPES = new Set(['GG_SCORE', 'gg:score', 'score', 'score_live', 'GG_SUBMIT_DAILY_SCORE']);
const cleanName = value => String(value || '').replace(/[^\w\s.-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40) || 'Guest Player';
const timeout = milliseconds => typeof globalThis.AbortSignal?.timeout === 'function' ? { signal: globalThis.AbortSignal.timeout(milliseconds) } : {};

export function parseGameScore(data, slug) {
  if (!data || typeof data !== 'object' || !SCORE_TYPES.has(data.type)) return null;
  const payload = data.payload && typeof data.payload === 'object' ? data.payload : {};
  const claimed = data.gameSlug || data.slug || data.game || payload.gameSlug || payload.slug || payload.game;
  if (claimed && claimed !== slug && !(slug === 'space-dodger' && claimed === 'space-dodger-starfall-odyssey')) return null;
  const value = data.score ?? data.value ?? payload.score ?? payload.value;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const score = Math.floor(Number(value));
  if (!Number.isSafeInteger(score) || score < 0) return null;
  return { score, final: Boolean(data.final || payload.final || ['final', 'submit', 'gameover', 'complete'].includes(data.mode || payload.mode) || data.type === 'GG_SUBMIT_DAILY_SCORE') };
}

export function createGameScoreTransport({ window: win = globalThis.window, slug } = {}) {
  let storage = null, channel = null;
  try { storage = win.localStorage; } catch {}
  try { if (win.BroadcastChannel) channel = new win.BroadcastChannel(CHANNEL_NAME); } catch {}
  const key = STORAGE_PREFIX + slug;
  return {
    emit(score, status = 'live') {
      const event = { type: 'wga:game-score', version: 1, slug, score, status, at: Date.now() };
      try { channel?.postMessage(event); } catch {}
      try { storage?.setItem(key, JSON.stringify(event)); } catch {}
    },
    close() { try { channel?.close(); } catch {} },
  };
}

/** @param {{window?: Window, slug: string, onScore: (event: {score: number, status: string, slug: string, at: number}) => void}} options */
export function subscribeGameTabScores({ window: win = globalThis.window, slug, onScore } = {}) {
  let channel = null, storage = null, last = '';
  const key = STORAGE_PREFIX + slug;
  function receive(value) {
    if (!value || value.type !== 'wga:game-score' || value.version !== 1 || value.slug !== slug ||
      !Number.isSafeInteger(value.score) || value.score < 0 || !['live', 'submitted', 'error'].includes(value.status) ||
      !Number.isFinite(value.at) || Math.abs(Date.now() - value.at) > 24 * 60 * 60 * 1000) return;
    const stamp = `${value.at}:${value.score}:${value.status}`;
    if (stamp === last) return;
    last = stamp; onScore(value);
  }
  function stored() { try { receive(JSON.parse(storage?.getItem(key) || 'null')); } catch {} }
  function storageEvent(event) { if (event.key === key && event.newValue) { try { receive(JSON.parse(event.newValue)); } catch {} } }
  try { storage = win.localStorage; } catch {}
  try { if (win.BroadcastChannel) { channel = new win.BroadcastChannel(CHANNEL_NAME); channel.onmessage = event => receive(event.data); } } catch {}
  win.addEventListener('storage', storageEvent); win.addEventListener('focus', stored); stored();
  return () => { channel?.close(); win.removeEventListener('storage', storageEvent); win.removeEventListener('focus', stored); };
}

/** Existing daily/global endpoints remain the only server score writers. */
export function createStandaloneScoreBridge({ slug, origin, fetcher = globalThis.fetch, storage,
  timers = globalThis, onScore = () => {}, onStatus = () => {}, interval = 5000 } = {}) {
  let playerName = 'Guest Player', signedIn = false, identity = null, disposed = false, identityKey = null, failures = 0;
  let latest = 0, best = 0, lastDaily = 0, lastGlobal = 0, timer = null, sending = null;
  const network = typeof fetcher === 'function' && /^https?:\/\//.test(origin || '');
  try { playerName = cleanName(storage?.getItem('wga_guest_player_name') || storage?.getItem('gg_player_name')); } catch {}
  function connect() {
    if (!network || disposed) return Promise.resolve();
    if (identity) return identity;
    identity = Promise.resolve().then(async () => {
      try {
        const response = await fetcher(new URL('/api/me', origin), { method: 'GET', credentials: 'same-origin', cache: 'no-store', ...timeout(4500) });
        if (!response.ok) return;
        const data = await response.json();
        if (disposed) return;
        const nextSignedIn = Boolean(data?.user?.id);
        const nextName = cleanName(data?.user?.displayName || playerName);
        const nextKey = data?.user?.id || `guest:${nextName}`;
        if (identityKey !== null && identityKey !== nextKey) { lastDaily = 0; lastGlobal = 0; best = latest; }
        identityKey = nextKey;
        signedIn = nextSignedIn; playerName = nextName;
        if (best > lastDaily || (signedIn && best > lastGlobal)) schedule(50);
      } catch {} finally { identity = null; }
    });
    return identity;
  }
  function schedule(delay = interval) {
    if (disposed || timer !== null) return;
    timer = timers.setTimeout(() => { timer = null; void flush(); }, delay);
  }
  async function flush() {
    if (timer !== null) { timers.clearTimeout(timer); timer = null; }
    if (!network || disposed || best <= 0) return;
    if (sending) return sending;
    const score = best;
    sending = Promise.resolve().then(async () => {
      const requests = [];
      async function post(path, body, board) {
        try {
          const response = await fetcher(new URL(path, origin), { method: 'POST', credentials: 'same-origin', cache: 'no-store', keepalive: true,
            headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...timeout(8000) });
          if (!response.ok) return false;
          if (board === 'daily') lastDaily = score; else lastGlobal = score;
          return true;
        } catch { return false; }
      }
      if (score > lastDaily) requests.push(post('/api/daily-challenge/submit', { gameSlug: slug, score, playerName }, 'daily'));
      if (signedIn && score > lastGlobal) requests.push(post(`/api/games/${encodeURIComponent(slug)}/score`, { score, mode: 'global' }, 'global'));
      if (!requests.length) return;
      const results = await Promise.all(requests);
      const ok = results.every(Boolean);
      failures = ok ? 0 : failures + 1;
      if (!disposed) {
        onStatus(latest, ok ? 'submitted' : 'error');
        if (!ok && failures <= 2) schedule(Math.min(30000, interval * 2 ** failures));
      }
    }).finally(() => {
      sending = null;
      if (!disposed && best > score) schedule();
    });
    return sending;
  }
  function report(data) {
    if (disposed) return false;
    const parsed = parseGameScore(data, slug);
    if (!parsed) return false;
    if (latest !== parsed.score) { latest = parsed.score; onScore(latest); }
    best = Math.max(best, latest);
    if (best > lastDaily || (signedIn && best > lastGlobal)) {
      if (parsed.final && timer !== null) { timers.clearTimeout(timer); timer = null; }
      schedule(parsed.final ? 50 : interval);
    }
    return true;
  }
  return { connect, report, flush, state: () => ({ latest, best, lastDaily, lastGlobal, signedIn }),
    dispose() { disposed = true; if (timer !== null) timers.clearTimeout(timer); timer = null; } };
}
