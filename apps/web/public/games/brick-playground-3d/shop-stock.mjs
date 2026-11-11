// Stock belongs to an entrance ID, so moving a shop or ending a market keeps its supplies.
import { blockAt, streetKeys } from './settlement.mjs';
export const SUPPLIES_PER_CRATE = 2;
export function restoreShopStock(value) {
  if (!Array.isArray(value)) return undefined;
  const kept = [],
    ids = new Set();
  for (const row of value) {
    if (
      !row ||
      typeof row.shop !== 'string' ||
      !row.shop ||
      !Number.isSafeInteger(row.units) ||
      row.units < 0 ||
      ids.has(row.shop)
    )
      continue;
    ids.add(row.shop);
    kept.push({ shop: row.shop, units: row.units });
  }
  return kept.length ? kept : undefined;
}
export function shopStock(city, shop = city.market?.shop) {
  return city.shopStock?.find((row) => row.shop === shop)?.units || 0;
}
const targets = new WeakMap();
export function stockTarget(city) {
  if (!city?.market?.supplied) return null;
  const cached = targets.get(city.pieces);
  if (cached?.shop === city.market.shop) return cached.target;
  const door = city.pieces.find(
    (piece) =>
      piece.id === city.market.shop && ['door', 'arch'].includes(piece.type) && piece.y <= 0.365
  );
  const target = door
    ? {
        shop: door.id,
        street: streetKeys(blockAt(door.x, door.z))[['south', 'east', 'north', 'west'][door.r]]
      }
    : null;
  targets.set(city.pieces, { shop: city.market.shop, target });
  return target;
}
export function restockShop(city, street) {
  const target = stockTarget(city);
  if (!target || target.street !== street || !city.streets.includes(street)) return false;
  const units = shopStock(city, target.shop);
  if (!Number.isSafeInteger(units + SUPPLIES_PER_CRATE)) return false;
  city.shopStock = [
    ...(city.shopStock || []).filter((row) => row.shop !== target.shop),
    { shop: target.shop, units: units + SUPPLIES_PER_CRATE }
  ];
  return true;
}
export function useShopStock(city) {
  if (!city.market?.supplied) return true;
  const units = shopStock(city);
  if (!units) return false;
  city.shopStock = city.shopStock.map((row) =>
    row.shop === city.market.shop ? { ...row, units: units - 1 } : row
  );
  return true;
}
