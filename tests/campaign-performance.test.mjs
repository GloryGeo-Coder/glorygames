import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQualityPreference, startingHardwareScale,
  createCampaignPerformanceController } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-performance.mjs';

const engine = () => ({
  level: 1, changes: [],
  setHardwareScalingLevel(n) { this.level = n; this.changes.push(n); },
  getHardwareScalingLevel() { return this.level; },
});

test('unknown quality settings use the safe automatic preset', () => {
  assert.equal(parseQualityPreference('not-valid'), 'auto');
  assert.equal(parseQualityPreference('performance'), 'performance');
  assert.equal(parseQualityPreference('balanced'), 'balanced');
  assert.equal(parseQualityPreference('quality'), 'quality');
});
test('retina phones begin at a bounded hardware scaling level', () => {
  for (const dpr of [1, 2, 3, 4, 5]) {
    const n = startingHardwareScale({mobile:true,dpr,quality:'auto'});
    assert.ok(n >= 1 && n <= 2.25, `Unexpected mobile scale: ${n}`);
  }
});
test('performance preset renders fewer pixels than quality preset', () => {
  const performance = startingHardwareScale({mobile:true,dpr:3,quality:'performance'});
  const quality = startingHardwareScale({mobile:true,dpr:3,quality:'quality'});
  assert.ok(performance > quality);
});
test('controller applies a user-selected fixed quality setting', () => {
  const mock = engine();
  const budget = createCampaignPerformanceController(mock,{mobile:true,dpr:3,quality:'performance'});
  const init = budget.state().scale;
  for(let i=0;i<50;i++) budget.sample({fps:10,time:i*1500});
  assert.equal(mock.getHardwareScalingLevel(),init);
  assert.equal(budget.state().adjustments,0);
});
test('controller does not respond to low FPS during loading and pause', () => {
  const mock = engine();
  const budget = createCampaignPerformanceController(mock,{mobile:true,dpr:2});
  const init = mock.level;
  for(let i=0;i<30;i++) budget.sample({fps:6,time:i*1500,active:false});
  assert.equal(mock.level,init);
});
test('hidden browser tab cannot trigger quality reduction', () => {
  const mock=engine();const budget=createCampaignPerformanceController(mock,{mobile:true,dpr:2});
  const initial=mock.level;
  for(let i=0;i<30;i++) budget.sample({fps:3,time:i*1500,visible:false});
  assert.equal(mock.level,initial);
});
test('short frame drops cannot cause resolution oscillation', () => {
  const mock=engine();const budget=createCampaignPerformanceController(mock,{mobile:true,dpr:2});
  const initial=mock.level;
  for(let i=0;i<5;i++) budget.sample({fps:7,time:i*1500});
  assert.equal(mock.level,initial);
});
test('sustained low phone FPS eventually lowers render resolution', () => {
  const mock=engine();const budget=createCampaignPerformanceController(mock,{mobile:true,dpr:2});
  const initial=mock.level;
  for(let i=0;i<12;i++) budget.sample({fps:20,time:i*1500});
  assert.ok(mock.level>initial, 'expected lower internal rendering resolution');
  assert.ok(budget.state().adjustments>=1);
});
test('scaling has an upper bound on slow phones', () => {
  const mock=engine();const budget=createCampaignPerformanceController(mock,{mobile:true,dpr:3});
  for(let i=0;i<300;i++) budget.sample({fps:14,time:i*1500});
  assert.ok(mock.level<=2.6);
});
test('high sustained FPS can restore visual resolution gradually', () => {
  const mock=engine();const budget=createCampaignPerformanceController(mock,{mobile:true,dpr:3});
  for(let i=0;i<35;i++) budget.sample({fps:15,time:i*1500});
  const slowScale=mock.level;
  for(let i=35;i<90;i++) budget.sample({fps:59,time:i*1500});
  assert.ok(mock.level<slowScale, 'expected visual resolution recovery');
});
test('auto controller avoids downscaling desktop by error-prone touch assumptions', () => {
  const mock=engine();const budget=createCampaignPerformanceController(mock,{mobile:false,dpr:1});
  const initial=mock.level;
  for(let i=0;i<40;i++) budget.sample({fps:12,time:i*1500});
  assert.equal(mock.level,initial);
});
test('a new play session discards old low-FPS history', () => {
  const mock=engine();const budget=createCampaignPerformanceController(mock,{mobile:true,dpr:2});
  for(let i=0;i<5;i++) budget.sample({fps:5,time:i*1500});
  const initial=mock.level;
  budget.reset();
  for(let i=5;i<9;i++) budget.sample({fps:8,time:i*1500});
  assert.equal(mock.level,initial);
});
test('invalid FPS reports do not change quality', () => {
  const mock=engine();const budget=createCampaignPerformanceController(mock,{mobile:true,dpr:2});
  for(let i=0;i<15;i++) budget.sample({fps:NaN,time:i*1500});
  assert.equal(budget.state().adjustments,0);
});
