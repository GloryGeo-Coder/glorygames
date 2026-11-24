import { SKY_TEMPLE } from "@/lib/skyTempleLaunch";

/** Launch the actual game rather than returning to its information page. */
export function gameLaunchPath(slug: string) {
  if (slug === SKY_TEMPLE.slug) return SKY_TEMPLE.href;
  if (slug === "brick-playground-3d") return `/play/${slug}`;
  return `/games/${encodeURIComponent(slug)}/index.html`;
}
