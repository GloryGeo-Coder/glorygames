import './model.mjs';
import { householdsFor } from './settlement.mjs';
import { marketCounter, callShoppers } from './market-day.mjs';
import { START_TIME } from './resident-routines.mjs';
import { nextMarketOpening } from './daily-market-save.mjs';

export function dailyMarketStatus(city) {
  const market = city?.market,
    daily = market?.daily;
  if (!daily) return 'none';
  if (daily.paused) return 'paused';
  if (!marketCounter(city)) return 'missing';
  if (market.receipts.length < 2) return 'trading';
  if ((city.clockMinutes ?? START_TIME) < daily.next) return 'overnight';
  // A served shopper must leave the till before receipts can be cleared.
  // Otherwise a day boundary could sell to the very same visit twice.
  const waiting = householdsFor(city).some((p) => {
    const t = city[p.key];
    return (
      t?.shop === market.shop &&
      t.phase === 'shopping' &&
      market.receipts.some((r) => r.home === t.home)
    );
  });
  return waiting ? 'leaving' : 'ready';
}
export function advanceDailyMarket(city) {
  const market = city?.market,
    daily = market?.daily;
  if (!daily || daily.paused || !marketCounter(city)) return false;
  let changed = false;
  if (dailyMarketStatus(city) === 'ready' && daily.round < Number.MAX_SAFE_INTEGER) {
    daily.recent = [
      ...daily.recent,
      { round: daily.round, names: market.receipts.map((r) => r.name) }
    ].slice(-5);
    daily.round++;
    daily.next = nextMarketOpening(city.clockMinutes ?? START_TIME, daily.hour);
    market.receipts = [];
    if (market.keeper) Object.assign(market.keeper, { customer: '', wait: 0 });
    changed = true;
  }
  // Only resting, unpaused, eligible households depart. No teleporting or stock grants.
  return !!callShoppers(city) || changed;
}
