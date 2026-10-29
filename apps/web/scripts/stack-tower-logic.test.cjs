const {test}=require('node:test');const assert=require('node:assert/strict');const game=require('../public/games/stack-tower/skyline-logic.js');
test('three environments unlock by ten-floor stages and the final skyline continues',()=>{assert.equal(game.worldForStage(game.stageForHeight(0)).name,'Harbour Heights');assert.equal(game.worldForStage(game.stageForHeight(10)).name,'Cloud Gardens');assert.equal(game.worldForStage(game.stageForHeight(20)).name,'Aurora Summit');assert.equal(game.worldForStage(game.stageForHeight(300)).name,'Aurora Summit');});
test('contracts pay once per stage and reset at the boundary',()=>{const p=game.create();assert.equal(game.placement(p,true,1).contract,false);game.placement(p,true,2);assert.equal(game.placement(p,true,3).contract,true);assert.equal(game.placement(p,true,4).contract,false);assert.equal(p.repairs,1);assert.equal(game.placement(p,false,10).stage,true);assert.equal(p.perfects,0);assert.equal(p.rewarded,false);assert.equal(p.repairs,1);game.placement(p,true,11);game.placement(p,true,12);assert.equal(game.placement(p,true,13).contract,true);});
test('repairs widen the moving and settled blocks, respect limits and are never wasted',()=>{const p=game.create(),top={w:80},current={w:80};assert.equal(game.repair(p,top,current,150),false);p.repairs=2;assert.equal(game.repair(p,top,current,150),true);assert.equal(top.w,current.w);assert.ok(top.w>80);assert.equal(p.repairs,1);top.w=150;assert.equal(game.repair(p,top,current,150),false);assert.equal(p.repairs,1);});
test('repair inventory cannot exceed two and missed contracts do not block progression',()=>{const p=game.create();for(let i=1;i<=9;i++)game.placement(p,true,i);assert.equal(p.repairs,2);game.placement(p,false,10);assert.equal(p.stage,1);for(let i=11;i<=20;i++)game.placement(p,false,i);assert.equal(p.stage,2);});

// Exercise the real runtime without rendering or an audio device.
const fs = require('node:fs');
const vm = require('node:vm');
function runtime() {
  const elements = new Map();
  let width = 844, height = 390;
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      style: {}, textContent: '', addEventListener() {}, replaceChildren() {},
      getContext: () => ({setTransform() {}}),
      getBoundingClientRect: () => ({width, height}),
    });
    return elements.get(id);
  };
  const window = {StackSkyline: game, StackChallenges: require('../public/games/stack-tower/challenges.js'), addEventListener() {}};
  const context = vm.createContext({
    window, document: {getElementById: element, addEventListener() {}, createElement: () => ({})},
    localStorage: {getItem: () => null, setItem() {}},
    performance: {now: () => 0}, requestAnimationFrame() {},
    setInterval: () => 1, clearInterval() {}, Image: class {},
    fetch: async () => { throw Error('offline fixture'); },
  });
  const source = fs.readFileSync(require.resolve('../public/games/stack-tower/game.js'), 'utf8');
  const hook = '  resetGame();\n  requestAnimationFrame(loop);';
  assert.ok(source.includes(hook));
  vm.runInContext(source.replace(hook, '  window.qa = {state, resize, resetGame, startGame, dropBlock};\n' + hook), context);
  const q = window.qa;
  q.resize();
  q.startGame();
  return {...q, elements, resize: (w, h) => { width = w; height = h; q.resize(); }};
}
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
const narrow = (q, width = 60) => {
  const top = q.state.stack.at(-1);
  top.w = q.state.current.w = width;
  q.state.current.x = top.x;
};

test('active narrow tower survives a perfect drop after landscape-to-portrait rotation', () => {
  const q = runtime();
  for (let i = 0; i < 9; i++) { q.state.current.x = q.state.stack.at(-1).x; q.dropBlock(); }
  narrow(q);
  const progress = JSON.stringify(q.state.progress), score = q.state.score;
  q.resize(390, 844);
  near(q.state.stack.at(-1).w, 60 * 390 / 844);
  assert.equal(JSON.stringify(q.state.progress), progress);
  assert.equal(q.state.score, score);
  q.dropBlock();
  assert.equal(q.state.gameOver, false, 'rotation alone must not make the tower unplayable');
  assert.equal(q.state.height, 10);
  assert.equal(q.state.progress.stage, 1);
  near(q.state.current.w, 60 * 390 / 844 + 2);
  near(q.state.minWidth, 34 * 390 / 844);
});

test('paused repeated rotations and height-only resize preserve the run threshold', () => {
  const q = runtime();
  narrow(q);
  q.state.paused = true;
  for (let i = 0; i < 3; i++) {
    q.resize(390, 844);
    near(q.state.minWidth, 34 * 390 / 844);
    q.resize(390, 700);
    near(q.state.minWidth, 34 * 390 / 844);
    q.resize(844, 390);
    near(q.state.minWidth, 34);
  }
  near(q.state.stack.at(-1).w, 60);
  assert.equal(q.state.paused, true);
  q.state.paused = false;
  q.dropBlock();
  assert.equal(q.state.gameOver, false);
});

test('real narrow placements still lose after either rotation direction', () => {
  for (const portrait of [true, false]) {
    const q = runtime();
    narrow(q);
    q.resize(390, 844);
    if (!portrait) q.resize(844, 390);
    const top = q.state.stack.at(-1);
    q.state.current.x = top.x + top.w - q.state.minWidth / 2;
    q.dropBlock();
    assert.equal(q.state.gameOver, true);
    assert.match(q.elements.get('panelText').textContent, /too narrow/);
  }
});

test('restart resets the minimum width in the current viewport', () => {
  const q = runtime();
  q.resize(390, 844);
  q.resetGame();
  q.startGame();
  near(q.state.minWidth, 34);
  narrow(q, 50);
  q.state.current.x += 20;
  q.dropBlock();
  assert.equal(q.state.gameOver, true);
  assert.match(q.elements.get('panelText').textContent, /too narrow/);
});
