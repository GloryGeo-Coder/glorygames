const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../../public/games/cyber-shield-academy');
const campaign = [
  ['ls', 'cat briefing.txt', 'cat case_bit.txt'],
  ['connect atlas-gateway', 'scan atlas-gateway', 'probe atlas-gateway', 'run PortPatch'],
  ['connect archive-node', 'scan archive-node', 'cat /logs/access.log', 'preserve /logs/access.log'],
  ['connect kernel-vault', 'hash kernel.sig', 'analyze warning.memo', 'collect warning.memo'],
  ['connect proxy-ring', 'scan proxy-ring', 'probe proxy-ring', 'run ProxyBalance alpha beta gamma'],
  ['connect cipher-bay', 'cat cipher.txt', 'run CryptoLens cipher.txt', 'collect decoded_note.txt'],
  ['connect orchid-relay', 'run LogAudit', 'lock token-orchid', 'preserve /logs/session.log'],
  ['connect root-of-trust', 'cat final.txt', 'run ReportKit', 'submit report']
];

campaign.push(
  ['connect mail-room', 'cat message.eml', 'cat directory.txt', 'run MailLens', 'preserve message.eml', 'decide quarantine-message'],
  ['connect identity-desk', 'cat signins.log', 'cat recovery.txt', 'run AccessReview', 'decide revoke-and-reset', 'collect identity-report.txt'],
  ['connect access-office', 'cat roles.txt', 'cat permissions.txt', 'run AccessReview', 'decide read-timetable'],
  ['connect recovery-vault', 'cat manifest.txt', 'cat restore-plan.txt', 'run RestoreLab', 'decide verified-backup', 'restore backup-clean.snap'],
  ['connect update-station', 'cat advisories.txt', 'cat inventory.txt', 'run PatchPlan', 'decide tested-portal'],
  ['connect segment-hub', 'cat routes.txt', 'cat services.txt', 'run SegmentSim', 'decide isolate-kiosk'],
  ['connect privacy-desk', 'cat sharing-brief.txt', 'cat residents.csv', 'decide aggregate-counts', 'run PrivacyLens', 'collect public-summary.txt'],
  ['connect beacon-response', 'cat incident.log', 'cat response-plan.txt', 'preserve incident.log', 'decide scoped-response', 'run ReportKit', 'submit report']
);

// Public input adapter; browser QA checks the real layout separately.
function boot({ compact = true, saved = new Map(), failStorage = false, start = true } = {}) {
  let doc;
  class Element {
    constructor(attrs = {}) {
      this.attrs = attrs; this.id = attrs.id; this.dataset = {};
      if (attrs['data-panel']) this.dataset.panel = attrs['data-panel'];
      this.children = []; this.value = ''; this.textContent = ''; this.events = {};
      this.style = { setProperty: (k, v) => { this.style[k] = v; } };
      this.classList = { add() {}, remove() {} };
    }
    set innerHTML(v) { this.children = []; }
    addEventListener(k, fn) { (this.events[k] ||= []).push(fn); }
    emit(k, extra = {}) { for (const fn of this.events[k] || []) fn({ preventDefault() {}, ...extra }); }
    setAttribute(k, v) { this.attrs[k] = v; }
    appendChild(el) { this.children.push(el); }
    focus() { doc.activeElement = this; }
    click() { if (!this.disabled) this.emit('click'); }
  }
  const html = readFileSync(path.join(root, 'index.html'), 'utf8');
  const elements = new Map();
  for (const tag of html.matchAll(/<[a-z][\w-]*\b([^>]*)>/g)) {
    const attrs = Object.fromEntries([...tag[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(x => [x[1], x[2]]));
    if (attrs.id) elements.set(attrs.id, new Element(attrs));
  }
  const tabs = [...elements.values()].filter(el => el.dataset.panel);
  const panes = [...elements.values()].filter(el => el.attrs.role === 'tabpanel');
  doc = new Element(); doc.documentElement = new Element(); doc.hidden = false;
  doc.createElement = () => new Element();
  doc.querySelector = sel => elements.get(sel.slice(1));
  doc.querySelectorAll = sel => sel === '[data-panel]' ? tabs : sel === '[role="tabpanel"]' ? panes : [];
  const media = new Element(); media.matches = compact;
  const win = new Element(); const scores = []; const timers = [];
  Object.assign(win, { matchMedia: query => query.includes('max-width') ? media : { matches: false }, innerHeight: 844,
    visualViewport: new Element(), confirm: () => true, postMessage: data => scores.push(data), GG: {}, location: { origin: 'https://webgamearena.com' },
    CyberCampaign: require(path.join(root, 'cyber-campaign.js')), CyberProgress: require(path.join(root, 'cyber-progress.js')),
    localStorage: { getItem(key) { if (failStorage) throw Error('blocked'); return saved.get(key) || null; }, setItem(key, value) { if (failStorage) throw Error('blocked'); saved.set(key, value); }, removeItem(key) { saved.delete(key); } } });
  win.parent = win; win.visualViewport.height = 844;
  const source = readFileSync(path.join(root, 'game.js'), 'utf8').replace('  setup();\n  bind();', '  globalThis.__chapters = chapters; setup();\n  bind();');
  const context = { document: doc, window: win,
    setInterval(fn, delay) { timers.push({ fn, delay }); return timers.length; }, clearInterval() {} };
  vm.runInNewContext(source, context);
  const el = id => elements.get(id);
  if (start) el('overlayStartBtn').click();
  return { el, doc, win, media, scores, timers, panes, saved, chapters: context.__chapters,
    command(value) { el('cmdInput').value = value; el('terminalForm').emit('submit'); },
    get output() { return el('terminalOutput').children.map(el => el.textContent).join('\n'); },
    get score() { return Number(el('scoreValue').textContent); }
  };
}

module.exports = { boot, campaign, root };
