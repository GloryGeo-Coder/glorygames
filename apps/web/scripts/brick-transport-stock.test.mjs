import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import {
  citySave,
  moveIn,
  restoreMarket
} from '../public/games/brick-playground-3d/settlement.mjs';
import { newTrip, entrance } from '../public/games/brick-playground-3d/resident-trip.mjs';
import {
  openMarket,
  marketCounter,
  serveCustomer,
  nextCustomer,
  waitingAtTill
} from '../public/games/brick-playground-3d/market-day.mjs';
import { starterBuggy } from '../public/games/brick-playground-3d/freight.mjs';
import {
  newTransport,
  transportRun,
  transportPoint,
  serviceTransport,
  chooseTransportStop
} from '../public/games/brick-playground-3d/transport.mjs';
import {
  shopStock,
  restoreShopStock,
  stockTarget
} from '../public/games/brick-playground-3d/shop-stock.mjs';
const pickup = 'h-3-4',
  dropoff = 'h-4-4',
  other = 'h-5-4',
  buggy = starterBuggy();
function fixture(supplied = true) {
  const town = world('city');
  const [home, shop, secondHome] = [-13, 11, 35].map((x, i) => ({
    id: 'stock-door-' + i,
    type: 'door',
    color: 'Lagoon',
    x,
    y: 0,
    z: 4,
    r: 0
  }));
  town.pieces = [home, shop, secondHome];
  town.streets = [pickup, dropoff, other];
  town.resident = newTrip(home, shop);
  moveIn(town, 'Ayanda', 'spaza', newTrip(secondHome, shop));
  openMarket(town, shop.id, supplied);
  const till = { ...marketCounter(town).inside, y: 0 };
  for (const t of [town.resident, town.family1]) Object.assign(t, till, { phase: 'shopping' });
  town.transport = newTransport(pickup, dropoff, other);
  const run = transportRun(buggy, town.transport, [], town);
  return { town, run, shop, till };
}
function deliver(town, run, key = dropoff) {
  if (town.transport.stage === 1) serviceTransport(run, town.transport, town, []);
  chooseTransportStop(town.transport, key);
  Object.assign(run, transportPoint(key));
  return serviceTransport(run, town.transport, town, []);
}
function reopen(town) {
  return loadWorld('city', {
    getItem: (key) => (key === saveKey('city') ? citySave(town) : null)
  });
}
test('a successful frontage drop-off stocks two supplies exactly once; pickup and other stops do not', () => {
  const { town, run } = fixture();
  assert.equal(stockTarget(town).street, dropoff);
  assert.equal(shopStock(town), 0);
  assert.ok(serviceTransport(run, town.transport, town, []));
  assert.equal(shopStock(town), 0, 'collecting crates never restocks');
  deliver(town, run, other);
  assert.equal(shopStock(town), 0, 'an unrelated street never restocks');
  deliver(town, run);
  assert.equal(shopStock(town), 2);
  assert.ok(!serviceTransport(run, town.transport, town, []));
  assert.equal(shopStock(town), 2, 'repeated handover cannot duplicate supplies');
  assert.equal(town.transport.stage, 3);
});
test('out-of-stock shoppers wait; real purchases consume one unit and retain the remaining delivery', () => {
  const { town, run, till } = fixture();
  const waiting = nextCustomer(town);
  assert.ok(waitingAtTill(town, waiting, town[waiting.key]));
  assert.equal(serveCustomer(town, till, true), null);
  assert.deepEqual(town.market.receipts, []);
  assert.ok(deliver(town, run));
  assert.equal(serveCustomer(town, till, false), null, 'cannot serve while driving');
  assert.equal(
    serveCustomer(town, { ...till, x: till.x + 4 }, true),
    null,
    'cannot serve remotely'
  );
  assert.equal(shopStock(town), 2);
  assert.equal(serveCustomer(town, till, true).name, 'Lebo');
  assert.equal(shopStock(town), 1);
  const saved = reopen(town);
  assert.equal(shopStock(saved), 1);
  assert.equal(saved.market.supplied, true);
  assert.deepEqual(saved.transport, town.transport);
  const recovery = transportRun(buggy, saved.transport, [], saved);
  assert.equal(recovery.x, transportPoint(dropoff).x);
  assert.equal(serveCustomer(saved, till, true).name, 'Ayanda');
  assert.equal(shopStock(saved), 0);
  assert.equal(serveCustomer(saved, till, true), null);
  assert.equal(saved.market.receipts.length, 2);
  assert.equal(saved.transport.stage, 2, 'serving does not complete the other delivery');
});
test('failed unloading never creates stock and repairing the street allows the same loaded crate', () => {
  const { town, run } = fixture();
  serviceTransport(run, town.transport, town, []);
  Object.assign(run, transportPoint(dropoff), { speed: 2 });
  assert.ok(!serviceTransport(run, town.transport, town, []));
  run.speed = 0;
  const road = town.streets;
  town.streets = [pickup, other];
  assert.ok(!serviceTransport(run, town.transport, town, []));
  town.streets = road;
  assert.ok(!serviceTransport(run, town.transport, town, [{ ...run, w: 1, d: 1 }]));
  assert.equal(shopStock(town), 0);
  assert.ok(serviceTransport(run, town.transport, town, []));
  assert.equal(shopStock(town), 2);
});
test('stock belongs to the shop ID across market days, moving, removal/undo and reload', () => {
  const { town, run, shop, till } = fixture();
  deliver(town, run);
  serveCustomer(town, till, true);
  delete town.market;
  assert.equal(shopStock(town, shop.id), 1);
  assert.ok(openMarket(town, shop.id, true));
  const old = town.pieces;
  town.pieces = old.map((p) => (p.id === shop.id ? { ...p, x: 59 } : p));
  assert.equal(stockTarget(town).street, entrance(town.pieces[1]).street);
  assert.equal(shopStock(reopen(town)), 1);
  town.pieces = town.pieces.filter((p) => p.id !== shop.id);
  assert.equal(stockTarget(town), null);
  assert.equal(shopStock(reopen(town)), 1);
  town.pieces = old;
  assert.equal(stockTarget(town).street, dropoff);
  const copy = { ...shop, id: 'copied-shop', x: 59 };
  town.pieces = [...town.pieces, copy];
  delete town.market;
  openMarket(town, copy.id, true);
  assert.equal(shopStock(town), 0, 'copies get a new identity and no duplicated stock');
});
test('legacy markets remain unlimited and do not consume or create stored supplies', () => {
  const { town, run, till, shop } = fixture(false);
  town.shopStock = [{ shop: shop.id, units: 1 }];
  deliver(town, run);
  assert.equal(shopStock(town), 1);
  assert.ok(serveCustomer(town, till, true));
  assert.ok(serveCustomer(town, till, true));
  assert.equal(shopStock(town), 1);
  assert.equal(reopen(town).market.supplied, undefined);
  assert.deepEqual(restoreMarket({ shop: shop.id, receipts: [], supplied: 'true' }), {
    shop: shop.id,
    receipts: []
  });
});
test('malformed stock records are isolated from buildings, cargo and valid records', () => {
  const { town } = fixture();
  const valid = { shop: town.market.shop, units: 3 };
  town.shopStock = [
    null,
    {},
    { shop: 'negative', units: -1 },
    { shop: 'float', units: 0.5 },
    { shop: 'infinite', units: Infinity },
    { shop: 'overflow', units: Number.MAX_SAFE_INTEGER + 1 },
    { shop: 'string', units: '2' },
    valid,
    { ...valid, units: 99 }
  ];
  const saved = reopen(town);
  assert.deepEqual(saved.shopStock, [valid]);
  assert.deepEqual(saved.pieces, town.pieces);
  assert.deepEqual(saved.transport, town.transport);
  assert.equal(restoreShopStock({}), undefined);
  delete town.shopStock;
  assert.equal(reopen(town).shopStock, undefined);
});
