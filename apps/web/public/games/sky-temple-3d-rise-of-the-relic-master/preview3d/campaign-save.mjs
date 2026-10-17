/**
 * Sky Temple 3D — local campaign checkpoints (v0.8)
 *
 * No accounts, network requests, timers, or Babylon.js dependencies.
 * Snapshots are per-world and are validated against the currently shipped
 * relic/checkpoint/enemy definitions before being offered for resume.
 */
export const CAMPAIGN_SAVE_VERSION = 1;
export const CAMPAIGN_WORLD_IDS = Object.freeze(["garden", "crystal", "storm", "solar"]);
export const CAMPAIGN_WORLD_TITLES = Object.freeze({
  garden: "Sky Garden", crystal: "Crystal Caverns",
  storm: "Storm Citadel", solar: "Solar Sanctuary",
});
export const CAMPAIGN_WORLD_PATHS = Object.freeze({
  garden: "./", crystal: "./crystal/", storm: "./storm/", solar: "./solar/",
});
const PREFIX = "wga_skytemple_progress_v1";
const LAST_WORLD_KEY = `${PREFIX}:last-world`;
export const CAMPAIGN_SAVE_INTERVAL_SECONDS = 8;

function getStorage(provided) {
  if (provided !== undefined) return provided;
  try { return globalThis.localStorage ?? null; } catch { return null; }
}
function storageRead(storage, key) {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
}
function storageWrite(storage, key, value) {
  try { if (!storage) return false; storage.setItem(key, value); return true; } catch { return false; }
}
function storageRemove(storage, key) {
  try { if (!storage) return false; storage.removeItem(key); return true; } catch { return false; }
}
function cleanNumber(value, fallback, min, max) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;
}
function matchingIds(value, allowed) {
  return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === "string" && allowed.has(id)))] : [];
}

/** Pure, testable validation. A changed relic list can safely load older saves. */
export function validateCampaignSnapshot(raw, options) {
  const { world, relicIds, checkpointIds, enemyIds, guardianMaxHp = 1 } = options;
  if (!CAMPAIGN_WORLD_IDS.includes(world) || !raw || typeof raw !== "object"
      || raw.version !== CAMPAIGN_SAVE_VERSION || raw.world !== world) return null;
  const knownRelics = new Set(relicIds);
  const knownCheckpoints = new Set(checkpointIds);
  const knownEnemies = new Set(enemyIds);
  const collected = matchingIds(raw.relicIds, knownRelics);
  const allCollected = collected.length === knownRelics.size;
  const checkpointId = knownCheckpoints.has(raw.checkpointId) ? raw.checkpointId : checkpointIds[0];
  if (!checkpointId) return null;
  // The boss cannot be completed or damaged on a partially collected route.
  const guardianDefeated = allCollected && raw.guardianDefeated === true;
  const guardianHp = allCollected && !guardianDefeated
    ? cleanNumber(raw.guardianHp, guardianMaxHp, 1, guardianMaxHp)
    : guardianDefeated ? 0 : guardianMaxHp;
  return {
    version: CAMPAIGN_SAVE_VERSION,
    world,
    checkpointId,
    relicIds: collected,
    defeatedEnemyIds: matchingIds(raw.defeatedEnemyIds, knownEnemies),
    guardianDefeated,
    guardianHp,
    health: cleanNumber(raw.health, 3, 1, 3),
    score: cleanNumber(raw.score, 0, 0, 2000000),
    savedAt: cleanNumber(raw.savedAt, 0, 0, 9999999999999),
  };
}

export function createCampaignSave({world, relicIds, checkpointIds, enemyIds, guardianMaxHp, storage, now = Date.now}) {
  if (!CAMPAIGN_WORLD_IDS.includes(world)) throw new Error(`Unknown campaign world: ${world}`);
  const store = getStorage(storage);
  const key = `${PREFIX}:${world}`;
  const options = { world, relicIds, checkpointIds, enemyIds, guardianMaxHp };
  return {
    key,
    available: Boolean(store),
    load() {
      const data = storageRead(store, key);
      if (!data || data.length > 15000) return null;
      try { return validateCampaignSnapshot(JSON.parse(data), options); } catch { return null; }
    },
    write(progress) {
      const payload = validateCampaignSnapshot({
        ...progress, version: CAMPAIGN_SAVE_VERSION, world, savedAt: now(),
      }, options);
      if (!payload) return false;
      if (!storageWrite(store, key, JSON.stringify(payload))) return false;
      storageWrite(store, LAST_WORLD_KEY, world);
      return true;
    },
    clear() { return storageRemove(store, key); },
    complete(nextWorld = null) {
      // Keep legacy completion flags and best scores owned by the game runtime.
      storageRemove(store, key);
      if (nextWorld && CAMPAIGN_WORLD_IDS.includes(nextWorld))
        storageWrite(store, LAST_WORLD_KEY, nextWorld);
      else storageRemove(store, LAST_WORLD_KEY);
    },
    lastWorld() {
      const value = storageRead(store, LAST_WORLD_KEY);
      return CAMPAIGN_WORLD_IDS.includes(value) ? value : null;
    },
  };
}
