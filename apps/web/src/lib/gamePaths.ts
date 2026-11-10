// Most titles use /play as their information page. Brick Playground reserves it for the full-viewport workshop.
export function gamePagePath(slug: string) {
  return slug === "brick-playground-3d" ? `/games/${slug}` : `/play/${slug}`;
}
