import { newDailyMarket } from './daily-market-save.mjs';
import { restoreShopkeeper } from './shopkeeper-save.mjs';
import { useShopStock } from './shop-stock.mjs';
import { blockAt, householdsFor } from './settlement.mjs';
import { advanceTrip, entrance, isEntrance } from './resident-trip.mjs';
const counters = new WeakMap();
export function marketCounter(city) {
  const id = city.market?.shop;
  if (!id) return null;
  const cached = counters.get(city.pieces);
  if (cached?.id === id) return cached.counter;
  const door = city.pieces.find((p) => p.id === id && isEntrance(p));
  const counter = door ? { ...entrance(door), y: door.y, r: door.r } : null;
  counters.set(city.pieces, { id, counter });
  return counter;
}
export function openMarket(city, id, supplied = false, keeperName = '', dailyHour = null) {
  if (city.market || !city.pieces.some((p) => p.id === id && isEntrance(p))) return false;
  const keeper = supplied && restoreShopkeeper({ name: keeperName });
  const daily = supplied && newDailyMarket(dailyHour, city.clockMinutes ?? 450);
  if (daily) city.clockMinutes ??= 450;
  city.market = {
    shop: id,
    receipts: [],
    ...(supplied ? { supplied: true } : {}),
    ...(keeper ? { keeper } : {}),
    ...(daily ? { daily } : {})
  };
  return true;
}
function eligible(city, p, t) {
  const market = city.market;
  return (
    market &&
    market.receipts.length < 2 &&
    t &&
    p.destination === 'Spaza' &&
    t.shop === market.shop &&
    !market.receipts.some(
      (r) => r.home === t.home || r.name.toLowerCase() === p.name.toLowerCase()
    )
  );
}
function inReach(counter, actor, radius) {
  return (
    counter &&
    Math.abs(actor.y - counter.y) < 0.65 &&
    Math.hypot(actor.x - counter.inside.x, actor.z - counter.inside.z) <= radius
  );
}
export function waitingAtTill(city, p, t) {
  return (
    t?.phase === 'shopping' && eligible(city, p, t) && inReach(marketCounter(city), t, 0.12)
  );
}
export function stepHousehold(city, p, t, runtime, dt) {
  if (waitingAtTill(city, p, t)) {
    runtime.moving = false;
    return;
  }
  advanceTrip(city, t, runtime, dt);
}
export function shoppers(city) {
  return householdsFor(city).filter((p) => eligible(city, p, city[p.key]));
}
export function callShoppers(city) {
  if (!marketCounter(city)) return 0;
  let departed = 0;
  for (const p of shoppers(city)) {
    const t = city[p.key];
    if (t.paused || t.phase !== 'done') continue;
    Object.assign(t, { phase: 'leave', returning: false, wait: 0 });
    departed++;
  }
  return departed;
}
export function nextCustomer(city) {
  return shoppers(city).find((p) => !city[p.key].paused && waitingAtTill(city, p, city[p.key]));
}
export function canServe(city, player, playing) {
  return playing && inReach(marketCounter(city), player, 1.15);
}
export function serveCustomer(city, player, playing) {
  if (!canServe(city, player, playing)) return null;
  return completePurchase(city, nextCustomer(city));
}
// Shared by the player and shopkeeper; a receipt and supply are committed together.
export function completePurchase(city, p) {
  if (
    !p ||
    !city[p.key] ||
    city[p.key].paused ||
    !waitingAtTill(city, p, city[p.key]) ||
    !useShopStock(city)
  )
    return null;
  const t = city[p.key];
  const home = city.pieces.find((b) => b.id === t.home);
  city.market.receipts.push({
    name: p.name,
    home: t.home,
    block: home ? blockAt(home.x, home.z).code : ''
  });
  t.wait = 0;
  if (city.market.daily)
    city.market.daily.served = Math.min(Number.MAX_SAFE_INTEGER, city.market.daily.served + 1);
  if (city.market.keeper) Object.assign(city.market.keeper, { customer: '', wait: 0 });
  return p;
}
