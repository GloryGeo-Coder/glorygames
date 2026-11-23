const trails = [
  ["climate-rescue-quest", "recycle-rush", "bioquest-guardians-of-life", "science-lab-dash"],
  ["science-lab-dash", "physics-force-lab", "math-sprint-arena", "map-master-africa"],
  ["map-master-africa", "bioquest-guardians-of-life", "cyber-shield-academy", "word-dash"],
  ["kasi-quest", "city-quest-rise-of-the-guardian", "lost-jungle-3d-temple-of-the-sun", "sky-temple-3d-rise-of-the-relic-master"],
  ["sky-temple-3d-rise-of-the-relic-master", "space-pilot-platformer", "space-dodger", "neon-orb-defender"],
  ["swipe-racer", "high-spead-racer", "neon-hover-runner", "space-dodger"],
  ["stack-tower", "brick-playground-3d", "physics-force-lab"],
  ["fruit-slice", "bubble-pop-arena", "brick-blaster", "stack-tower"],
  ["word-dash", "math-sprint-arena", "bubble-pop-arena"],
];

export function selectRelated<T extends { slug: string; category?: string | null }>(
  slug: string, category: string | null | undefined, games: T[], limit = 4,
): T[] {
  const available = new Map(games.filter(game => game.slug !== slug).map(game => [game.slug, game]));
  const curated = trails.filter(group => group.includes(slug)).flat();
  const ordered = new Set([...curated, ...games.filter(game => game.category === category).map(game => game.slug), ...available.keys()]);
  return Array.from(ordered).flatMap(key => available.has(key) ? [available.get(key)!] : []).slice(0, limit);
}
