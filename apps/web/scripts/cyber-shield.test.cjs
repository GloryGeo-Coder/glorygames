const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../public/games/cyber-shield-academy');
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

// Runs the shipped controller through its public inputs. Browser QA checks CSS separately.
function boot(compact = true) {
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
    visualViewport: new Element(), confirm: () => true, postMessage: data => scores.push(data), GG: {} });
  win.parent = win; win.visualViewport.height = 844;
  vm.runInNewContext(readFileSync(path.join(root, 'game.js'), 'utf8'), { document: doc, window: win,
    setInterval(fn, delay) { timers.push({ fn, delay }); return timers.length; }, clearInterval() {} });
  const el = id => elements.get(id);
  el('overlayStartBtn').click();
  return { el, doc, win, media, scores, timers, panes,
    command(value) { el('cmdInput').value = value; el('terminalForm').emit('submit'); },
    get output() { return el('terminalOutput').children.map(el => el.textContent).join('\n'); },
    get score() { return Number(el('scoreValue').textContent); }
  };
}

test('all eight chapters remain completable and award the final bonus once', () => {
  const game = boot();
  campaign.forEach((commands, i) => {
    assert.equal(Number(game.el('levelValue').textContent), i + 1);
    commands.forEach(command => game.command(command));
  });
  assert.match(game.output, /CASE CLOSED/);
  assert.ok(game.scores.every(message => message.gameSlug === 'cyber-shield-academy'));
  const score = game.score;
  game.command('submit report'); game.command('submit report');
  assert.equal(game.score, score);
  assert.match(game.output, /already closed/);
  assert.equal(game.scores.filter(x => x.mode === 'game_won' && x.type === 'GG_SCORE').length, 1);
});

test('a final-host connection cannot bypass the investigation or compile requirement', () => {
  const game = boot();
  campaign.slice(0, 7).flat().forEach(command => game.command(command));
  game.command('connect root-of-trust');
  const score = game.score;
  game.command('submit report');
  assert.equal(game.score, score);
  game.command('run ReportKit');
  const compiledScore = game.score;
  game.command('submit report');
  assert.equal(game.score, compiledScore); // final.txt has not been reviewed
  assert.doesNotMatch(game.output, /CASE CLOSED/);
  game.command('cat final.txt'); game.command('submit report');
  assert.match(game.output, /CASE CLOSED/);
});

test('cipher evidence cannot be collected before decoding', () => {
  const game = boot();
  campaign.slice(0, 5).flat().forEach(command => game.command(command));
  game.command('connect cipher-bay'); game.command('cat cipher.txt');
  const score = game.score;
  game.command('collect decoded_note.txt');
  assert.equal(game.score, score); assert.match(game.output, /decode the note/);
  game.command('run CryptoLens cipher.txt'); game.command('collect decoded_note.txt');
  assert.equal(game.el('levelValue').textContent, '7');
});

test('containment pauses in a hidden tab and enforces lockout until reset', () => {
  const game = boot();
  campaign.slice(0, 6).flat().forEach(command => game.command(command));
  game.command('connect orchid-relay');
  const tick = game.timers.find(timer => timer.delay === 1000).fn;
  const trace = game.el('traceValue').textContent;
  game.doc.hidden = true; for (let n = 0; n < 110; n++) tick();
  assert.equal(game.el('traceValue').textContent, trace);
  game.doc.hidden = false; for (let n = 0; n < 110; n++) tick();
  assert.equal(game.el('traceValue').textContent, '100%');
  const score = game.score; game.command('lock token-orchid');
  assert.equal(game.score, score); assert.match(game.output, /Training locked/);
  game.el('resetBtn').click(); assert.equal(game.el('levelValue').textContent, '1');
});

test('compact panels, keyboard navigation, completion/history, file/tool insertion and resizing use real UI handlers', () => {
  const game = boot();
  assert.deepEqual(game.panes.filter(p => !p.hidden).map(p => p.id), ['panel-terminal']);
  game.el('tab-mission').click(); assert.equal(game.el('panel-mission').hidden, false);
  game.el('tab-mission').emit('keydown', { key: 'End' }); assert.equal(game.el('panel-tools').hidden, false);
  const scanKit = game.el('toolList').children.find(el => el.textContent.includes('ScanKit'));
  scanKit.click(); assert.equal(game.el('cmdInput').value, 'run ScanKit');
  assert.equal(game.el('panel-terminal').hidden, false);
  game.command('ls'); game.command('status');
  game.el('previousBtn').click(); assert.equal(game.el('cmdInput').value, 'status');
  game.el('previousBtn').click(); assert.equal(game.el('cmdInput').value, 'ls');
  game.el('nextBtn').click(); assert.equal(game.el('cmdInput').value, 'status');
  game.el('cmdInput').value = 'cat bri'; game.el('completeBtn').click();
  assert.equal(game.el('cmdInput').value, 'cat briefing.txt ');
  game.el('tab-files').click();
  game.el('fileTree').children.find(el => el.textContent === 'case_bit.txt').click();
  assert.equal(game.el('cmdInput').value, 'cat /home/cadet/case_bit.txt');
  game.media.matches = false; game.media.emit('change'); assert.equal(game.panes.filter(p => p.hidden).length, 0);
  game.win.visualViewport.height = 360; game.win.visualViewport.emit('resize');
  assert.equal(game.doc.documentElement.style['--academy-height'], '360px');
});

test('entry and CSS references resolve and chapter metadata stays consistent', () => {
  const html = readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = readFileSync(path.join(root, 'styles.css'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"?]+)(?:\?[^" ]*)?"/g)].map(x => x[1]);
  refs.push(...[...css.matchAll(/url\('([^']+)'\)/g)].map(x => x[1]));
  for (const ref of refs) assert.ok(existsSync(ref.startsWith('/') ? path.resolve(root, '../..', ref.slice(1)) : path.join(root, ref)), ref);
  const meta = JSON.parse(readFileSync(path.join(root, 'game.json'), 'utf8'));
  assert.equal(meta.slug, 'cyber-shield-academy');
  assert.equal(meta.features.levels, campaign.length); assert.equal(meta.orientation, 'any');
  assert.doesNotMatch(html, /autofocus/);
});
