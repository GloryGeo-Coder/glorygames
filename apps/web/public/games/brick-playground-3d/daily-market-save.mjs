// Dependency-free save parsing: a malformed schedule must not discard a player's shop.
export const OPENING_HOURS = [8, 12, 16];
export function nextMarketOpening(now, hour) {
  return (Math.floor(now / 1440) + 1) * 1440 + hour * 60;
}
export function newDailyMarket(hour, now) {
  return OPENING_HOURS.includes(hour)
    ? {
        hour,
        next: nextMarketOpening(now, hour),
        round: 1,
        served: 0,
        paused: false,
        recent: []
      }
    : null;
}
export function restoreDailyMarket(value) {
  if (
    !OPENING_HOURS.includes(value?.hour) ||
    !Number.isFinite(value.next) ||
    value.next < 0 ||
    value.next >= Number.MAX_SAFE_INTEGER / 2
  )
    return null;
  const round = Number.isSafeInteger(value.round) && value.round >= 1 ? value.round : 1;
  const served = Number.isSafeInteger(value.served) && value.served >= 0 ? value.served : 0;
  const recent = [];
  for (const row of Array.isArray(value.recent) ? value.recent : []) {
    if (
      !Number.isSafeInteger(row?.round) ||
      row.round < 1 ||
      row.round >= round ||
      recent.some((r) => r.round === row.round) ||
      !Array.isArray(row.names) ||
      row.names.length !== 2 ||
      row.names.some((n) => typeof n !== 'string' || !n.trim() || n.length > 28) ||
      row.names[0].trim().toLowerCase() === row.names[1].trim().toLowerCase()
    )
      continue;
    recent.push({ round: row.round, names: row.names.map((n) => n.trim()) });
  }
  recent.sort((a, b) => a.round - b.round);
  return {
    hour: value.hour,
    next: value.next,
    round,
    served,
    paused: value.paused === true,
    recent: recent.slice(-5)
  };
}
