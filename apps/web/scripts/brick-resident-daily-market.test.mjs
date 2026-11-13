import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import {
  citySave,
  moveIn,
  restoreMarket,
  householdsFor
} from '../public/games/brick-playground-3d/settlement.mjs';
import { newTrip, tripRuntime } from '../public/games/brick-playground-3d/resident-trip.mjs';
import {
  openMarket,
  marketCounter,
  stepHousehold,
  serveCustomer
} from '../public/games/brick-playground-3d/market-day.mjs';
import { advanceShopkeeper } from '../public/games/brick-playground-3d/shopkeeper.mjs';
import {
  advanceDailyMarket,
  dailyMarketStatus
} from '../public/games/brick-playground-3d/daily-market.mjs';
import { restoreDailyMarket } from '../public/games/brick-playground-3d/daily-market-save.mjs';
import {
  tickRoutines,
  nextIdleDeparture,
  skipToDeparture
} from '../public/games/brick-playground-3d/resident-routines.mjs';
import { restockShop, shopStock } from '../public/games/brick-playground-3d/shop-stock.mjs';
function fixture(staffed = true) {
  const city = world('city');
  const [home, shop, home2] = [-13, 11, 35].map((x, i) => ({
    id: 'daily-door-' + i,
    type: 'door',
    color: 'Lagoon',
    x,
    y: 0,
    z: 4,
    r: 0
  }));
  city.pieces = [home, shop, home2];
  city.streets = ['h-3-4', 'h-4-4', 'h-5-4'];
  city.resident = newTrip(home, shop);
  moveIn(city, 'Ayanda', 'spaza', newTrip(home2, shop));
  city.resident.phase = city.family1.phase = 'done';
  city.clockMinutes = 450;
  openMarket(city, shop.id, true, staffed ? 'Sipho' : '', 8);
  return city;
}
const reopen = (city) =>
  loadWorld('city', { getItem: (key) => (key === saveKey('city') ? citySave(city) : null) });
function queue(city) {
  const till = marketCounter(city).inside;
  for (const p of householdsFor(city))
    if (city[p.key])
      Object.assign(city[p.key], till, { y: 0, phase: 'shopping', returning: false });
}
function servePair(city) {
  queue(city);
  const till = { ...marketCounter(city).inside, y: 0 };
  assert.equal(serveCustomer(city, till, true).name, 'Lebo');
  assert.equal(serveCustomer(city, till, true).name, 'Ayanda');
}
function leaveTill(city) {
  for (const p of householdsFor(city))
    if (city[p.key]) Object.assign(city[p.key], { phase: 'leave', returning: true });
}
test('daily shops invite actual resting households without teleporting or giving away stock', () => {
  const city = fixture(),
    before = { x: city.resident.x, z: city.resident.z };
  assert.ok(advanceDailyMarket(city));
  assert.equal(city.resident.phase, 'leave');
  assert.deepEqual({ x: city.resident.x, z: city.resident.z }, before);
  queue(city);
  for (let i = 0; i < 100; i++) advanceShopkeeper(city, 0.1);
  assert.equal(city.market.receipts.length, 0);
  assert.equal(shopStock(city), 0);
  assert.equal(city.market.daily.served, 0);
});
test('a new opening preserves stock and staff but waits for served customers to leave the till', () => {
  const city = fixture();
  restockShop(city, 'h-4-4');
  restockShop(city, 'h-4-4');
  servePair(city);
  city.market.keeper.paused = true;
  city.clockMinutes = city.market.daily.next;
  assert.equal(dailyMarketStatus(city), 'leaving');
  assert.equal(advanceDailyMarket(city), false);
  assert.equal(city.market.receipts.length, 2);
  leaveTill(city);
  assert.ok(advanceDailyMarket(city));
  assert.equal(city.market.daily.round, 2);
  assert.equal(city.market.daily.served, 2);
  assert.deepEqual(city.market.daily.recent, [{ round: 1, names: ['Lebo', 'Ayanda'] }]);
  assert.equal(city.market.keeper.name, 'Sipho');
  assert.equal(city.market.keeper.paused, true);
  assert.equal(city.market.receipts.length, 0);
  assert.equal(shopStock(city), 2);
  assert.equal(serveCustomer(city, { ...marketCounter(city).inside, y: 0 }, true), null);
  assert.equal(city.market.daily.next, 2 * 1440 + 480);
});
test('unfinished sales carry across days, and a late reopening does not manufacture missed rounds', () => {
  const city = fixture(false);
  restockShop(city, 'h-4-4');
  queue(city);
  serveCustomer(city, { ...marketCounter(city).inside, y: 0 }, true);
  city.clockMinutes = 20 * 1440;
  advanceDailyMarket(city);
  assert.equal(city.market.daily.round, 1);
  assert.equal(city.market.receipts.length, 1);
  serveCustomer(city, { ...marketCounter(city).inside, y: 0 }, true);
  leaveTill(city);
  advanceDailyMarket(city);
  assert.equal(city.market.daily.round, 2);
  assert.equal(city.market.daily.served, 2);
  assert.equal(city.market.daily.next, 21 * 1440 + 480);
});
test('pause, missing doorway and reload preserve history, cargo, buildings and unused stock', () => {
  const city = fixture();
  restockShop(city, 'h-4-4');
  servePair(city);
  leaveTill(city);
  city.clockMinutes = city.market.daily.next;
  city.market.daily.paused = true;
  const saved = reopen(city),
    before = citySave(saved);
  advanceDailyMarket(saved);
  assert.equal(citySave(saved), before);
  assert.equal(nextIdleDeparture(saved), null);
  saved.market.daily.paused = false;
  const pieces = saved.pieces;
  saved.pieces = pieces.filter((p) => p.id !== saved.market.shop);
  assert.equal(dailyMarketStatus(saved), 'missing');
  assert.equal(advanceDailyMarket(saved), false);
  saved.pieces = pieces;
  assert.ok(advanceDailyMarket(saved));
  const again = reopen(saved);
  assert.deepEqual(again.market, saved.market);
  assert.deepEqual(again.pieces, city.pieces);
  assert.deepEqual(again.transport, city.transport);
  assert.deepEqual(again.shopStock, saved.shopStock);
});
test('actual walks, two trading rounds and a stock shortage share the settlement clock', () => {
  const city = fixture();
  restockShop(city, 'h-4-4');
  restockShop(city, 'h-4-4');
  const runtime = new Map();
  function tick() {
    tickRoutines(city, 0.05);
    for (const p of householdsFor(city)) {
      const trip = city[p.key];
      if (!trip || trip.paused || trip.phase === 'done') continue;
      if (!runtime.has(p.key)) runtime.set(p.key, tripRuntime());
      stepHousehold(city, p, trip, runtime.get(p.key), 0.05);
    }
    advanceDailyMarket(city);
    advanceShopkeeper(city, 0.05);
  }
  for (
    let i = 0;
    i < 6000 &&
    !(
      city.market.daily.round === 3 &&
      city.resident.phase === 'shopping' &&
      city.family1.phase === 'shopping'
    );
    i++
  )
    tick();
  assert.equal(city.market.daily.round, 3);
  assert.equal(city.market.daily.served, 4);
  assert.equal(shopStock(city), 0);
  assert.equal(city.market.receipts.length, 0);
  assert.equal(city.resident.phase, 'shopping');
  assert.equal(city.family1.phase, 'shopping');
  restockShop(city, 'h-4-4');
  for (let i = 0; i < 130; i++) tick();
  assert.equal(city.market.daily.served, 6);
  assert.equal(city.market.receipts.length, 2);
});
test('skip to next opening only works when households are home; manual markets remain single-round', () => {
  const city = fixture();
  restockShop(city, 'h-4-4');
  servePair(city);
  assert.equal(skipToDeparture(city), false);
  city.resident.phase = city.family1.phase = 'done';
  assert.equal(nextIdleDeparture(city), city.market.daily.next);
  assert.ok(skipToDeparture(city));
  advanceDailyMarket(city);
  assert.equal(city.market.daily.round, 2);
  assert.equal(city.resident.phase, 'leave');
  delete city.market.daily;
  assert.equal(advanceDailyMarket(city), false);
  assert.equal(dailyMarketStatus(city), 'none');
});
test('history is bounded and malformed daily settings cannot discard an existing market', () => {
  const city = fixture();
  for (let n = 0; n < 8; n++) {
    restockShop(city, 'h-4-4');
    servePair(city);
    leaveTill(city);
    city.clockMinutes = city.market.daily.next;
    advanceDailyMarket(city);
  }
  assert.equal(city.market.daily.round, 9);
  assert.equal(city.market.daily.served, 16);
  assert.deepEqual(
    city.market.daily.recent.map((r) => r.round),
    [4, 5, 6, 7, 8]
  );
  assert.deepEqual(reopen(city).market, city.market);
  for (const daily of [
    null,
    {},
    { hour: 8, next: -1 },
    { hour: 9, next: 100 },
    { hour: 8, next: Infinity }
  ]) {
    assert.equal(restoreDailyMarket(daily), null);
    const loaded = restoreMarket({ ...city.market, daily });
    assert.equal(loaded.daily, undefined);
    assert.equal(loaded.keeper.name, 'Sipho');
  }
  const parsed = restoreDailyMarket({
    hour: 8,
    next: 1920,
    recent: [{ round: 0, names: ['x', 'y'] }],
    round: 'bad',
    served: -2
  });
  assert.equal(parsed.round, 1);
  assert.equal(parsed.served, 0);
  assert.deepEqual(parsed.recent, []);
  assert.equal(restoreMarket({ ...city.market, supplied: false }).daily, undefined);
});
