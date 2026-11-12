import { intervals } from './model.mjs';
import { HALF } from './settlement.mjs';
import { marketCounter, nextCustomer, completePurchase } from './market-day.mjs';
import { shopStock } from './shop-stock.mjs';
import { SERVICE_SECONDS } from './shopkeeper-save.mjs';
const stations = new WeakMap();
const samples = [
  [0, 0],
  [0.27, 0],
  [-0.27, 0],
  [0, 0.27],
  [0, -0.27],
  [0.19, 0.19],
  [-0.19, 0.19],
  [0.19, -0.19],
  [-0.19, -0.19]
];
// A fixed spot beside the till: geometry changes invalidate the cached clearance check.
export function keeperStation(city) {
  const counter = marketCounter(city);
  if (!city.market?.keeper || !counter) return null;
  const cached = stations.get(city.pieces);
  if (cached?.shop === city.market.shop) return cached.station;
  const angle = (counter.r * Math.PI) / 2,
    c = Math.cos(angle),
    s = Math.sin(angle);
  const x = counter.inside.x + 0.85 * c - 0.65 * s;
  const z = counter.inside.z + 0.85 * s + 0.65 * c;
  const solids = samples.flatMap(([dx, dz]) =>
    city.pieces.flatMap((p) => intervals(p, x + dx, z + dz))
  );
  const y = Math.max(
    0,
    ...solids.filter(([, top]) => top <= counter.y + 0.365).map(([, top]) => top)
  );
  const clear =
    Math.abs(x) <= HALF - 0.27 &&
    Math.abs(z) <= HALF - 0.27 &&
    !solids.some(([bottom, top]) => bottom < y + 1.65 - 0.001 && top > y + 0.001);
  const station = clear
    ? { x, y, z, heading: Math.atan2(counter.inside.x - x, counter.inside.z - z) }
    : null;
  stations.set(city.pieces, { shop: city.market.shop, station });
  return station;
}
export function keeperStatus(city) {
  const market = city?.market,
    keeper = market?.keeper;
  if (!keeper) return 'none';
  if (market.receipts.length >= 2) return 'complete';
  if (keeper.paused) return 'paused';
  if (!marketCounter(city)) return 'missing';
  if (!keeperStation(city)) return 'blocked';
  if (!shopStock(city)) return 'stock';
  return nextCustomer(city) ? 'serving' : 'waiting';
}
export function advanceShopkeeper(city, dt) {
  const keeper = city.market?.keeper;
  if (!keeper || !city.market.supplied) return null;
  const guest = nextCustomer(city),
    home = guest ? city[guest.key].home : '';
  if (keeper.customer !== home) {
    keeper.customer = home;
    keeper.wait = 0;
  }
  if (keeperStatus(city) !== 'serving') return null;
  // Hidden tabs and dialogs do not call this; a slow frame cannot complete an entire shift.
  keeper.wait += Math.max(0, Math.min(Number.isFinite(dt) ? dt : 0, 0.1));
  if (keeper.wait < SERVICE_SECONDS) return null;
  return completePurchase(city, guest);
}
