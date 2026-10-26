import { createGameScoreTransport, createStandaloneScoreBridge } from './game-tab-score.mjs?v=1';

// Explicitly excludes Sky Temple: its existing campaign/launcher stays separate.
export const GAME_START_BUTTONS = {
  'brick-blaster': 'btnStart', 'bubble-pop-arena': 'btnStart',
  'city-quest-rise-of-the-guardian': 'playBtn', 'climate-rescue-quest': 'playBtn',
  'cyber-shield-academy': 'overlayStartBtn', 'fruit-slice': 'btnStart',
  'high-spead-racer': 'startBtn', 'kasi-quest': 'btnStart',
  'lost-jungle-3d-temple-of-the-sun': 'playBtn', 'map-master-africa': 'startBtn',
  'math-sprint-arena': 'startBtn', 'neon-hover-runner': 'btnStart',
  'neon-orb-defender': 'startBtn', 'physics-force-lab': 'startBtn',
  'recycle-rush': 'startNextBtn', 'science-lab-dash': 'overlayPrimary',
  'space-dodger': 'startBtn', 'space-pilot-platformer': 'startBtn',
  'stack-tower': 'btnStart', 'swipe-racer': 'btnStart', 'word-dash': 'btnStart',
};

export function bindGameFullscreen({ document: doc, window: win, host } = {}) {
  const root = doc.documentElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  if (typeof request !== 'function' || (doc.fullscreenEnabled === false && !doc.webkitFullscreenEnabled)) return { dispose() {} };
  const button = doc.createElement('button'), status = doc.createElement('span');
  button.type = 'button'; button.className = 'wga-tab-fullscreen';
  button.title = 'Enter Fullscreen (Alt+Enter)'; button.textContent = 'Enter Fullscreen';
  button.setAttribute('aria-pressed', 'false');
  status.className = 'wga-tab-status'; status.setAttribute('role', 'status');
  host.append(button, status);
  const active = () => Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
  const changed = () => { button.textContent = active() ? 'Exit Fullscreen' : 'Enter Fullscreen'; button.setAttribute('aria-pressed', String(active())); status.textContent = ''; };
  async function toggle() {
    try {
      if (active()) { const exit = doc.exitFullscreen || doc.webkitExitFullscreen; if (exit) await exit.call(doc); }
      else await request.call(root);
      changed();
    } catch { status.textContent = 'Your game fills this tab. Browser fullscreen is unavailable here.'; }
  }
  const click = event => { event.preventDefault(); event.stopPropagation(); void toggle(); };
  const stopPointer = event => event.stopPropagation();
  const key = event => {
    if (event.altKey && event.key === 'Enter' && !['INPUT', 'TEXTAREA'].includes(event.target?.tagName) && !event.target?.isContentEditable) {
      event.preventDefault(); event.stopPropagation(); void toggle();
    }
  };
  button.addEventListener('click', click); button.addEventListener('pointerdown', stopPointer);
  doc.addEventListener('fullscreenchange', changed); doc.addEventListener('webkitfullscreenchange', changed);
  win.addEventListener('keydown', key, true);
  return { dispose() {
    button.removeEventListener('click', click); button.removeEventListener('pointerdown', stopPointer);
    doc.removeEventListener('fullscreenchange', changed); doc.removeEventListener('webkitfullscreenchange', changed);
    win.removeEventListener('keydown', key, true); button.remove(); status.remove();
  } };
}

export function mountGameTab(win = globalThis.window) {
  if (!win || win.top !== win.self || win.__wgaGameTab) return;
  const match = win.location.pathname.match(/^\/games\/([a-z0-9-]+)\/(?:index\.html)?$/);
  const originalPhysics = win.location.pathname === '/games/physics-force-lab/original-labs.html';
  const originalScience = win.location.pathname === '/games/science-lab-dash/original-dash.html';
  const originalPilot = ['/games/space-pilot-platformer/original-route.html','/games/space-pilot-platformer/vulcanis.html','/games/space-pilot-platformer/luminara.html','/games/space-pilot-platformer/cryon.html'].includes(win.location.pathname);
  const slug = originalPhysics ? 'physics-force-lab' : originalScience ? 'science-lab-dash' : originalPilot ? 'space-pilot-platformer' : match?.[1], startId = GAME_START_BUTTONS[slug];
  if (!startId) return;
  const doc = win.document;
  doc.documentElement.dataset.wgaTab = slug;
  const transport = createGameScoreTransport({ window: win, slug });
  let storage = null; try { storage = win.localStorage; } catch {}
  const scoreBridge = createStandaloneScoreBridge({ slug, origin: win.location.origin, storage,
    fetcher: new URLSearchParams(win.location.search).get('scores') === '0' ? null : win.fetch?.bind(win),
    onScore: score => transport.emit(score), onStatus: (score, status) => transport.emit(score, status) });
  const message = event => { if (event.source === win && event.origin === win.location.origin) scoreBridge.report(event.data); };
  win.addEventListener('message', message);
  const GG = win.GG = win.GG || {};
  const finalScore = (input, options = {}) => scoreBridge.report({
    ...(input && typeof input === 'object' ? input : { score: input }), type: 'GG_SUBMIT_DAILY_SCORE', gameSlug: options.gameSlug || input?.gameSlug || slug });
  // Adapt the existing SDK instead of requiring every game to change its calls.
  GG.submitScore = finalScore; GG.reportScore = finalScore; GG.endRound = finalScore;
  GG.setScore = score => scoreBridge.report({ type: 'gg:score', gameSlug: slug, score });
  win.ggSubmitDailyScore = payload => finalScore(payload);
  GG.openOverlay = () => win.open(`/play/${encodeURIComponent(slug)}`, '_blank', 'noopener,noreferrer');
  const host = doc.getElementById(startId)?.parentElement;
  const fullscreen = host ? bindGameFullscreen({ document: doc, window: win, host }) : null;
  const focus = () => { void scoreBridge.connect().then(() => scoreBridge.flush()); };
  const hidden = () => { if (doc.hidden) void scoreBridge.flush(); };
  function hide() { void scoreBridge.flush(); }
  function shown(event) { if (event.persisted) focus(); }
  win.addEventListener('focus', focus); win.addEventListener('pagehide', hide); win.addEventListener('pageshow', shown);
  doc.addEventListener('visibilitychange', hidden);
  win.__wgaGameTab = { slug, scoreBridge, fullscreen };
  transport.emit(0); void scoreBridge.connect();
  // Existing games keep ownership of their canvas resolution and resize logic.
  win.dispatchEvent(new win.Event('resize'));
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mountGameTab(), { once: true });
  else mountGameTab();
}

