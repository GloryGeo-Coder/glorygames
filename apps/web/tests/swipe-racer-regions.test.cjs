'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../public/games/swipe-racer');

function game(storage = new Map()) {
  const ui = new Map();
  const scores = [];
  function element(key) {
    if (!ui.has(key)) ui.set(key, { style: {}, focus() {}, addEventListener() {},
      getBoundingClientRect: () => ({ width: 390, height: 844 }), getContext: () => ({setTransform() {}}) });
    return ui.get(key);
  }
  const context = vm.createContext({
    document: {querySelector: element, addEventListener() {}},
    window: {addEventListener() {}, GG: {endRound: value => scores.push(value)}},
    localStorage: {getItem: key => storage.get(key), setItem: (key,value) => storage.set(key,value)},
    Image: class {}, devicePixelRatio: 1, requestAnimationFrame() {}
  });
  vm.runInContext(fs.readFileSync(path.join(root,'game.js'),'utf8'), context);
  return {run: expr => vm.runInContext(expr,context), scores};
}

test('both courses are available on first visit and keep independent records', () => {
  const storage = new Map([['wga_swipe_racer_horizon_v1','legacy campaign']]);
  const {run, scores} = game(storage);
  for (const [id,time] of [['harbour',31],['frostline',34]]) {
    run(`showCourse('${id}'); begin(); race.time=${time}; done()`);
    assert.equal(run('best'),time);
  }
  assert.equal(scores.length,2);
  for (const result of scores) {
    assert.equal(result.gameSlug,'swipe-racer');
    assert.ok(Number.isInteger(result.score) && result.score>0);
  }
  const reopened=game(storage);
  assert.equal(reopened.run('courseId'),'frostline');
  assert.equal(reopened.run('best'),34);
  assert.equal(reopened.run("showCourse('harbour'); best"),31);
  assert.equal(storage.get('wga_swipe_racer_horizon_v1'),'legacy campaign');
});

test('coasting the full ice strip awards one charge and boosting on the strip skids', () => {
  const {run}=game();
  run("showCourse('frostline'); setMode('race'); race.dist=231; crossIce(229); race.dist=304; crossIce(303)");
  assert.equal(run('race.cleanStrips'),1);
  assert.equal(run('race.charges'),2);
  run("race.x=lanes[0]; race.dist=466; crossIce(464); boost(); race.dist=525; crossIce(524)");
  assert.equal(run('race.skids'),1);
  assert.equal(run('race.cleanStrips'),1);
  assert.equal(run('race.charges'),1);
});

test('the playable entry uses the existing bridge and bundled course artwork', () => {
  const js=fs.readFileSync(path.join(root,'game.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/id="btnStart"/);
  assert.match(html,/game-tab\.mjs\?v=1/);
  const assets=[...js.matchAll(/'\.\/(assets\/[^']+)'/g)].map(match=>match[1]);
  assert.equal(assets.length,2);
  for (const asset of assets) assert.ok(fs.existsSync(path.join(root,asset)));
});
