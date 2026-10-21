const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot, campaign, root } = require('./helpers/cyber-runtime.cjs');
const progress = require(root + '/cyber-progress.js');
const playTo = (game, count) => campaign.slice(0, count).flat().forEach(command => game.command(command));

test('refresh at every chapter restores evidence, objectives, tool prerequisites and exact score', () => {
  const saved = new Map(); let game = boot({ saved });
  campaign.forEach((commands, i) => {
    const middle = Math.floor(commands.length / 2);
    commands.slice(0, middle).forEach(command => game.command(command));
    const score = game.score;
    game = boot({ saved });
    assert.equal(game.el('levelValue').textContent, String(i + 1));
    assert.equal(game.score, score);
    assert.match(game.output, /Resumed chapter/);
    commands.slice(middle).forEach(command => game.command(command));
  });
  assert.match(game.output, /ACADEMY COMPLETE/);
  const final = game.score; game = boot({ saved });
  game.command('submit report'); assert.equal(game.score, final);
  assert.match(game.output, /already closed/);
});

test('retry restores the chapter entry without losing earlier evidence or awarding duplicate points', () => {
  const game = boot(); playTo(game, 6);
  const earlierScore = game.score;
  campaign[6].slice(0, 2).forEach(command => game.command(command));
  const partial = game.score; assert.ok(partial > earlierScore);
  game.win.confirm = () => false; game.el('retryBtn').click(); assert.equal(game.score, partial);
  game.win.confirm = () => true; game.el('retryBtn').click();
  assert.equal(game.score, earlierScore); assert.equal(game.el('levelValue').textContent, '7');
  game.command('inventory'); assert.match(game.output, /kernel-vault:\/warning.memo/);
  campaign[6].forEach(command => game.command(command));
  assert.equal(game.el('levelValue').textContent, '8');
  game.command('debrief'); assert.match(game.output, /Chapter retries: 1/);
});

test('containment lockout survives refresh and a chapter retry recovers only that chapter', () => {
  const saved = new Map(); let game = boot({ saved }); playTo(game, 6);
  const baseline = game.score; game.command('connect orchid-relay');
  const tick = game.timers.find(timer => timer.delay === 1000).fn;
  for (let i = 0; i < 90; i++) tick();
  game = boot({ saved }); game.command('lock token-orchid');
  assert.match(game.output, /Training locked/);
  game.command('retry'); assert.equal(game.el('levelValue').textContent, '7');
  assert.equal(game.score, baseline); assert.equal(game.el('traceValue').textContent, '0%');
  campaign[6].forEach(command => game.command(command)); assert.equal(game.el('levelValue').textContent, '8');
});

test('untimed practice survives refresh, freezes the countdown and never changes campaign scores or unlocks', () => {
  const saved = new Map(); let game = boot({ saved }); playTo(game, 6);
  const campaignScore = game.score;
  game.el('practiceSelect').value = '6'; game.el('startPracticeBtn').click();
  const untouched = saved.get(progress.keys.campaign), messages = game.scores.length;
  game.command('connect orchid-relay');
  for (let i = 0; i < 200; i++) game.timers.find(timer => timer.delay === 1000).fn();
  assert.equal(game.el('traceValue').textContent, 'Off'); assert.doesNotMatch(game.output, /timer expired/);
  campaign[6].slice(1).forEach(command => game.command(command));
  assert.equal(game.el('levelValue').textContent, '7'); assert.match(game.output, /Practice complete/);
  assert.equal(game.scores.length, messages); assert.equal(saved.get(progress.keys.campaign), untouched);
  game = boot({ saved }); assert.match(game.el('sessionLabel').textContent, /Untimed/);
  assert.equal(game.scores.length, 0);
  game.el('returnCampaignBtn').click();
  assert.equal(game.el('levelValue').textContent, '7'); assert.equal(game.score, campaignScore);
  assert.equal(game.el('traceValue').textContent, '0%');
});

test('practice cannot launch a locked chapter, including through a fabricated select value', () => {
  const game = boot(); game.el('practiceSelect').value = '15'; game.el('startPracticeBtn').click();
  assert.match(game.el('sessionLabel').textContent, /Campaign/);
  assert.equal(game.el('levelValue').textContent, '1');
  game.command('connect beacon-response'); assert.match(game.output, /outside current authorization/);
});

test('hints reveal principle, objective and command progressively without awarding points; usage survives retry/refresh', () => {
  const saved = new Map(); let game = boot({ saved });
  for (let n = 1; n <= 3; n++) { game.el('hintBtn').click(); assert.match(game.output, new RegExp(`Hint ${n} / 3`)); }
  assert.match(game.output, /Try: ls/); assert.equal(game.score, 0);
  game.el('retryBtn').click(); game = boot({ saved });
  game.el('hintBtn').click(); assert.match(game.output, /Hint 3 \/ 3/);
  game.command('ls'); game.el('hintBtn').click(); assert.match(game.output, /Hint 1 \/ 3/);
});

test('new investigations gate tools and decisions on evidence; wrong choices give explanations and bounded penalties', () => {
  const saved = new Map(); let game = boot({ saved }); playTo(game, 8);
  game.command('connect mail-room'); const before = game.score;
  game.command('decide quarantine-message'); assert.equal(game.score, before); assert.match(game.output, /required evidence/);
  game.command('run MailLens'); assert.equal(game.score, before);
  game.command('cat message.eml'); game.command('cat directory.txt'); game.command('run MailLens'); game.command('preserve message.eml');
  const ready = game.score; game.command('decide pay-link'); game.command('decide pay-link');
  assert.equal(game.score, ready); assert.equal(game.el('trustValue').textContent, '98');
  assert.match(game.el('learningFeedback').textContent, /actual domain differs/);
  game = boot({ saved }); game.command('decide quarantine-message');
  assert.equal(game.el('levelValue').textContent, '10'); game.command('debrief');
  assert.match(game.output, /choices to revisit: 1/);
});

test('empty/generated evidence and unverified backups cannot bypass the recovery and privacy missions', () => {
  const game = boot(); playTo(game, 11); game.command('connect recovery-vault');
  const before = game.score; game.command('restore backup-latest.snap'); game.command('collect restore-report.txt');
  assert.equal(game.score, before);
  campaign[11].slice(1).forEach(command => game.command(command));
  assert.equal(game.el('levelValue').textContent, '13');
  campaign.slice(12, 14).flat().forEach(command => game.command(command));
  game.command('connect privacy-desk'); game.command('run PrivacyLens');
  assert.match(game.output, /required decision first/);
  campaign[14].slice(1).forEach(command => game.command(command));
  game.command('connect privacy-desk'); game.command('cat public-summary.txt');
  assert.match(game.output, /North: 2 requests/);
  game.command('cat residents.csv'); assert.match(game.output, /Resident A,North/);
});

test('unavailable or corrupt storage cannot block an investigation or its in-memory chapter retry', () => {
  const blocked = boot({ failStorage: true }); blocked.command('ls');
  assert.match(blocked.el('saveStatus').textContent, /unavailable/);
  assert.match(blocked.el('sessionLabel').textContent, /Saving unavailable/);
  blocked.el('retryBtn').click(); assert.equal(blocked.score, 0);
  const saved = new Map([[progress.keys.campaign, '{bad json']]);
  const recovered = boot({ saved }); assert.equal(recovered.el('levelValue').textContent, '1');
  recovered.command('ls'); assert.ok(recovered.score > 0);
  assert.equal(progress.read({ getItem: () => '{"version":99,"state":{}}' }, progress.keys.campaign, recovered.chapters), null);
  const clean = progress.snapshot({ levelIndex: 99, completed: { fake: true }, score: Infinity, trust: -9, history: ['help'], connected: 'external-host' }, recovered.chapters);
  assert.equal(clean.levelIndex, 0); assert.equal(clean.score, 0); assert.equal(clean.trust, 0); assert.equal(clean.connected, 'local');
});

test('chapter-sixteen report requires preserved timeline, collected evidence and scoped containment', () => {
  const game = boot(); playTo(game, 15); game.command('connect beacon-response');
  const score = game.score; game.command('run ReportKit'); game.command('submit report');
  assert.equal(game.score, score); assert.doesNotMatch(game.output, /ACADEMY COMPLETE/);
  campaign[15].slice(1).forEach(command => game.command(command));
  assert.match(game.output, /ACADEMY COMPLETE/);
});

test('final chapter retry keeps the collected recovery and privacy evidence and remains completable', () => {
  const saved = new Map(); let game = boot({ saved }); playTo(game, 15);
  const baseline = game.score; campaign[15].slice(0, 5).forEach(command => game.command(command));
  game.el('retryBtn').click(); assert.equal(game.score, baseline);
  game = boot({ saved }); game.command('inventory');
  assert.match(game.output, /identity-desk:\/identity-report.txt/);
  assert.match(game.output, /recovery-vault:\/restore-report.txt/);
  assert.match(game.output, /privacy-desk:\/public-summary.txt/);
  campaign[15].forEach(command => game.command(command)); assert.match(game.output, /ACADEMY COMPLETE/);
});

test('sound preference survives refresh and switching between campaign and practice', () => {
  const saved = new Map(); let game = boot({ saved }); game.el('muteBtn').click();
  game = boot({ saved }); assert.equal(game.el('muteBtn').textContent, 'Sound Off');
  game.el('startPracticeBtn').click(); assert.equal(game.el('muteBtn').textContent, 'Sound Off');
  game.el('returnCampaignBtn').click(); assert.equal(game.el('muteBtn').textContent, 'Sound Off');
});

test('foreign frame messages cannot reset or mute an active investigation', () => {
  const game = boot(); game.command('ls'); const score = game.score;
  game.win.emit('message', { origin: 'https://other.invalid', source: {}, data: { type: 'GG_RESTART' } });
  game.win.emit('message', { origin: 'https://other.invalid', source: {}, data: { type: 'GG_MUTE', muted: true } });
  assert.equal(game.score, score); assert.equal(game.el('muteBtn').textContent, 'Sound On');
});

test('permission, restoration and segmentation actions change the simulated files and survive refresh', () => {
  const saved = new Map(); let game = boot({ saved }); playTo(game, 14);
  game = boot({ saved });
  game.command('connect access-office'); game.command('cat permissions.txt');
  assert.match(game.output, /payroll=none backups=none/);
  game.command('connect recovery-vault'); game.command('cat restored-timetable.csv');
  assert.match(game.output, /SIM-048,restored/);
  game.command('connect segment-hub'); game.command('cat routes.txt');
  assert.match(game.output, /kiosk-net -> internal-net: blocked/);
  assert.match(game.output, /clinic-net -> appointments: authorised/);
});
