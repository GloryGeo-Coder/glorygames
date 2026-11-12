import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import {
  citySave,
  moveIn,
  restoreMarket
} from '../public/games/brick-playground-3d/settlement.mjs';
import { newTrip } from '../public/games/brick-playground-3d/resident-trip.mjs';
import {
  openMarket,
  marketCounter,
  serveCustomer
} from '../public/games/brick-playground-3d/market-day.mjs';
import { starterBuggy } from '../public/games/brick-playground-3d/freight.mjs';
import {
  newTransport,
  transportRun,
  transportPoint,
  serviceTransport
} from '../public/games/brick-playground-3d/transport.mjs';
import { shopStock } from '../public/games/brick-playground-3d/shop-stock.mjs';
import {
  keeperStation,
  keeperStatus,
  advanceShopkeeper
} from '../public/games/brick-playground-3d/shopkeeper.mjs';
import {
  restoreShopkeeper,
  SERVICE_SECONDS
} from '../public/games/brick-playground-3d/shopkeeper-save.mjs';
function fixture(rotation = 0) {
  const town = world('city');
  const [home, shop, home2] = [-13, 11, 35].map((x, i) => ({
    id: 'keeper-door-' + i,
    type: 'door',
    color: 'Lagoon',
    x,
    y: 0,
    z: 4,
    r: i === 1 ? rotation : 0
  }));
  town.pieces = [home, shop, home2];
  town.streets = ['h-3-4', 'h-4-4', 'h-5-4'];
  town.resident = newTrip(home, shop);
  moveIn(town, 'Ayanda', 'spaza', newTrip(home2, shop));
  openMarket(town, shop.id, true, 'Thandi');
  const till = { ...marketCounter(town).inside, y: 0 };
  for (const t of [town.resident, town.family1]) Object.assign(t, till, { phase: 'shopping' });
  town.transport = newTransport('h-3-4', 'h-4-4', 'h-5-4');
  return { town, shop, till };
}
const tick = (town, n) => {
  for (let i = 0; i < n; i++) advanceShopkeeper(town, 0.05);
};
const reopen = (town) =>
  loadWorld('city', { getItem: (key) => (key === saveKey('city') ? citySave(town) : null) });
function deliver(town) {
  const run = transportRun(starterBuggy(), town.transport, [], town);
  serviceTransport(run, town.transport, town, []);
  Object.assign(run, transportPoint('h-4-4'));
  serviceTransport(run, town.transport, town, []);
}
test('staff wait for stock, then serve two real arrivals while the remaining delivery stays intact', () => {
  const { town } = fixture();
  assert.equal(keeperStatus(town), 'stock');
  tick(town, 200);
  assert.equal(town.market.receipts.length, 0);
  deliver(town);
  const cargo = structuredClone(town.transport);
  assert.equal(keeperStatus(town), 'serving');
  tick(town, 59);
  assert.equal(town.market.receipts.length, 0);
  tick(town, 2);
  assert.deepEqual(
    town.market.receipts.map((r) => r.name),
    ['Lebo']
  );
  assert.equal(shopStock(town), 1);
  tick(town, 61);
  assert.deepEqual(
    town.market.receipts.map((r) => r.name),
    ['Lebo', 'Ayanda']
  );
  assert.equal(shopStock(town), 0);
  assert.equal(keeperStatus(town), 'complete');
  tick(town, 500);
  assert.equal(town.market.receipts.length, 2);
  assert.deepEqual(town.transport, cargo);
});
test('service cannot start for absent, paused, wrong-shop or upstairs shoppers', () => {
  const { town } = fixture();
  deliver(town);
  town.family1.paused = true;
  const original = { ...town.resident };
  for (const patch of [
    { phase: 'leave' },
    { paused: true },
    { shop: 'another' },
    { y: 3 },
    { x: 70 }
  ]) {
    Object.assign(town.resident, original, patch);
    tick(town, 100);
    assert.equal(town.market.receipts.length, 0);
    assert.equal(shopStock(town), 2);
  }
  Object.assign(town.resident, original);
  tick(town, 61);
  assert.equal(town.market.receipts.length, 1);
});
test('pause and reload preserve partial service without counting offline or oversized frame time', () => {
  const { town } = fixture();
  deliver(town);
  tick(town, 20);
  const partial = town.market.keeper.wait;
  town.market.keeper.paused = true;
  tick(town, 200);
  assert.equal(town.market.keeper.wait, partial);
  const saved = reopen(town);
  assert.deepEqual(saved.market.keeper, town.market.keeper);
  assert.equal(saved.market.receipts.length, 0);
  saved.market.keeper.paused = false;
  advanceShopkeeper(saved, 100000);
  assert.ok(saved.market.keeper.wait <= partial + 0.1 + 1e-9);
  for (const dt of [NaN, Infinity, -10]) advanceShopkeeper(saved, dt);
  assert.equal(saved.market.receipts.length, 0);
  tick(saved, 39);
  assert.equal(saved.market.receipts.length, 1);
  assert.equal(shopStock(saved), 1);
});
test('blocked standing space, low ceilings and a removed door stop work until the same shop is repaired', () => {
  const { town, shop } = fixture();
  deliver(town);
  const clear = town.pieces,
    station = keeperStation(town);
  tick(town, 20);
  for (const piece of [
    { id: 'standing-block', type: 'single', color: 'Sun', x: 13, y: 0, z: 6, r: 0 },
    { id: 'low-ceiling', type: 'floor', color: 'Sun', x: 12, y: 1.3, z: 5, r: 0 }
  ]) {
    town.pieces = [...clear, piece];
    assert.equal(keeperStation(town), null);
    assert.equal(keeperStatus(town), 'blocked');
    tick(town, 100);
    assert.equal(town.market.receipts.length, 0);
    assert.equal(shopStock(town), 2);
  }
  town.pieces = clear.filter((p) => p.id !== shop.id);
  assert.equal(keeperStatus(town), 'missing');
  tick(town, 100);
  town.pieces = clear;
  assert.deepEqual(keeperStation(town), station);
  tick(town, 61);
  assert.equal(town.market.receipts.length, 1);
});
test('manual service and staff service share receipts and never sell the same purchase twice', () => {
  const { town, till } = fixture();
  deliver(town);
  tick(town, 58);
  assert.equal(serveCustomer(town, till, true).name, 'Lebo');
  assert.equal(town.market.keeper.wait, 0);
  tick(town, 2);
  assert.equal(
    town.market.receipts.length,
    1,
    'the second customer needs their own full service'
  );
  tick(town, 60);
  assert.equal(town.market.receipts.length, 2);
  assert.equal(shopStock(town), 0);
  assert.equal(serveCustomer(town, till, true), null);
});
test('the station follows each doorway rotation and supports a floor plate without entering solids', () => {
  for (let rotation = 0; rotation < 4; rotation++) {
    const { town, till } = fixture(rotation);
    const station = keeperStation(town);
    assert.ok(station);
    assert.ok(
      Math.abs(Math.hypot(station.x - till.x, station.z - till.z) - Math.hypot(0.85, 0.65)) <
        1e-8
    );
  }
  const { town } = fixture();
  town.pieces = [
    ...town.pieces,
    { id: 'floor', type: 'floor', color: 'Sun', x: 12, y: 0, z: 5, r: 0 }
  ];
  assert.equal(keeperStation(town).y, 1 / 3);
});
test('malformed staff saves are isolated from the market, cargo and buildings; old markets stay manual', () => {
  const { town } = fixture();
  for (const keeper of [null, {}, { name: '' }, { name: 'x'.repeat(25) }, { name: 4 }]) {
    assert.equal(restoreShopkeeper(keeper), null);
    assert.equal(restoreMarket({ ...town.market, keeper }).keeper, undefined);
  }
  for (const wait of [-1, NaN, Infinity, SERVICE_SECONDS, '2'])
    assert.equal(restoreShopkeeper({ name: ' Thandi ', customer: 'home', wait }).wait, 0);
  assert.equal(restoreShopkeeper({ name: 'Thandi', wait: 2 }).wait, 0);
  assert.equal(restoreMarket({ ...town.market, supplied: false }).keeper, undefined);
  delete town.market.keeper;
  const saved = reopen(town);
  assert.equal(keeperStatus(saved), 'none');
  assert.deepEqual(saved.transport, town.transport);
  assert.deepEqual(saved.pieces, town.pieces);
  delete saved.market;
  assert.equal(advanceShopkeeper(saved, 0.1), null);
});
