// Match the deployed catalogue assets so first paint never depends on failed image requests.
const PRIMARY_FORMATS: Record<string, string> = {
  "brick-playground-3d": "webp",
  "bioquest-guardians-of-life": "webp",
  "brick-blaster": "svg",
  "bubble-pop-arena": "svg",
  "city-quest-rise-of-the-guardian": "png",
  "climate-rescue-quest": "png",
  "cyber-shield-academy": "png",
  "fruit-slice": "png",
  "high-spead-racer": "png",
  "kasi-quest": "png",
  "lost-jungle-3d-temple-of-the-sun": "png",
  "map-master-africa": "png",
  "math-sprint-arena": "png",
  "neon-hover-runner": "png",
  "neon-orb-defender": "png",
  "physics-force-lab": "webp",
  "recycle-rush": "png",
  "science-lab-dash": "png",
  "sky-temple-3d-rise-of-the-relic-master": "png",
  "space-dodger": "png",
  "space-pilot-platformer": "png",
  "stack-tower": "png",
  "swipe-racer": "png",
  "word-dash": "png"
};

export function gameThumbnailSources(slug: string) {
  const primary = PRIMARY_FORMATS[slug] ?? "webp";
  return [primary, ...["webp", "png", "svg", "jpg", "jpeg"].filter(ext => ext !== primary)]
    .map(ext => `/games/${slug}/thumb.${ext}`);
}
