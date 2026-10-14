#!/usr/bin/env node
/**
 * Production SEO and AdSense readiness checks for WebGameArena.
 * No Google account access, secrets or third-party packages required.
 *
 * Usage:
 *   npm run audit:seo
 *   npm run audit:seo -- --site https://webgamearena.com --require-ads
 *   npm run audit:seo -- --site https://preview.example.com
 */
import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const valueAfter = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const rawOrigin = valueAfter("--site") || "https://webgamearena.com";
let origin;
try {
  origin = new URL(rawOrigin).origin;
  if (!["https:", "http:"].includes(new URL(rawOrigin).protocol)) throw Error("Unsupported URL protocol");
} catch {
  console.error("Use --site with a valid https:// URL");
  process.exit(2);
}
const requireAds = args.includes("--require-ads");
const timeoutMs = 15000;
const issues = [];
let checked = 0;

function report(level, path, detail) {
  issues.push({ level, path, detail });
  console.log(`[${level}] ${path} — ${detail}`);
}
function error(path, detail) { report("FAIL", path, detail); }
function warn(path, detail) { report("WARN", path, detail); }
function pass(path, detail) {
  checked += 1;
  console.log(`[PASS] ${path} — ${detail}`);
}
function url(path) { return new URL(path, origin).toString(); }
async function get(path) {
  const res = await fetch(url(path), {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": "WebGameArena-SEO-Readiness/1.0", "Accept": "text/html, text/plain, application/xml, */*" },
    redirect: "follow",
  });
  return { response: res, text: await res.text() };
}
function attribute(element, key) {
  return element.match(new RegExp(`\\b${key}=(?:"([^"]*)"|'([^']*)')`, "i"))?.slice(1).find((part) => part !== undefined) ?? null;
}
function tagWithAttribute(html, elementName, name, expectedValue) {
  const tags = html.match(new RegExp(`<${elementName}\\b[^>]*>`, "ig")) ?? [];
  return tags.find((tag) => (attribute(tag, name) ?? "").toLowerCase() === expectedValue.toLowerCase()) ?? null;
}
function canonical(html) {
  const tag = tagWithAttribute(html, "link", "rel", "canonical");
  return tag ? attribute(tag, "href") : null;
}
function metaRobots(html) {
  const tag = tagWithAttribute(html, "meta", "name", "robots");
  return tag ? (attribute(tag, "content") ?? "").toLowerCase() : "";
}
function title(html) {
  return html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1]?.trim() ?? "";
}
function expectedCanonical(path) { return url(path); }

const src = await readFile(new URL("../src/content/gameEditorials.ts", import.meta.url), "utf8");
const prefix = "export const GAME_EDITORIALS: Record<string, GameEditorial> = ";
const start = src.indexOf(prefix);
const stop = src.indexOf("\n\nexport function getGameEditorial(", start);
if (start < 0 || stop < 0) {
  console.error("Unable to extract the editorial registry; update the audit script when its format changes.");
  process.exit(2);
}
const games = JSON.parse(src.slice(start + prefix.length, stop).trim().replace(/;$/, ""));
const slugs = Object.keys(games).sort();
const categories = ["educational", "adventure", "racing", "arcade"];
const sitePages = ["/", "/games", ...categories.map((category) => `/categories/${category}`),
  "/about", "/contact", "/privacy", "/terms", "/cookies",
  "/community-guidelines", "/parents-safety", "/accessibility",
  ...slugs.map((slug) => `/play/${slug}`)];
console.log(`SEO audit of ${origin} — ${slugs.length} game pages and ${sitePages.length - slugs.length} other pages\n`);

try {
  const { response, text } = await get("/robots.txt");
  if (!response.ok) error("/robots.txt", `HTTP ${response.status}`);
  else {
    if (!text.includes(`Sitemap: ${url("/sitemap.xml")}`)) warn("/robots.txt", "Expected sitemap declaration not found");
    if (/Disallow:\\s*\\/(?:play|categories)(?:\\/|\\s|$)/im.test(text)) error("/robots.txt", "Public content appears blocked");
    else pass("/robots.txt", "Crawl directives received");
  }
} catch (e) { error("/robots.txt", String(e)); }

try {
  const { response, text } = await get("/sitemap.xml");
  if (!response.ok) error("/sitemap.xml", `HTTP ${response.status}`);
  else {
    const locs = new Set([...text.matchAll(/<loc>([\\s\\S]*?)<\\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&").trim()));
    const missing = sitePages.filter((p) => !locs.has(url(p)));
    const unwanted = [...locs].filter((loc) => /\\/games\\/[^/?]+(?:[?#]|$)/.test(loc));
    if (missing.length) error("/sitemap.xml", `Missing ${missing.length} expected canonical pages: ${missing.slice(0, 7).join(", ")}`);
    else pass("/sitemap.xml", `Includes all ${sitePages.length} expected pages`);
    if (unwanted.length) warn("/sitemap.xml", `Noncanonical game-detail URLs detected: ${unwanted.slice(0, 3).join(", ")}`);
  }
} catch (e) { error("/sitemap.xml", String(e)); }

for (let startAt = 0; startAt < sitePages.length; startAt += 4) {
  const batch = sitePages.slice(startAt, startAt + 4);
  await Promise.all(batch.map(async (path) => {
    try {
      const { response, text: html } = await get(path);
      if (!response.ok) return error(path, `HTTP ${response.status}`);
      if (!(response.headers.get("content-type") || "").includes("text/html")) return error(path, "Response is not HTML");
      const got = canonical(html);
      const expected = expectedCanonical(path);
      const canonicalUrl = got ? new URL(got, response.url).toString() : "";
      if (canonicalUrl !== expected) error(path, `Canonical mismatch: ${got || "missing"} (expected ${expected})`);
      else if (/(^|[,\\s])noindex([,\\s]|$)/.test(metaRobots(html))) error(path, "Canonical page is marked noindex");
      else if (!title(html)) error(path, "Page title is missing");
      else if (/^\\/play\\//.test(path) && !/Complete game guide/i.test(html)) warn(path, "The server HTML does not contain the complete game guide heading");
      else pass(path, "HTTP 200, indexable, title and canonical verified");
    } catch (e) { error(path, String(e)); }
  }));
}

for (const path of ["/games/fruit-slice", "/games?q=fruit", "/games?category=educational"]) {
  try {
    const { response, text: html } = await get(path);
    if (!response.ok) error(path, `HTTP ${response.status}`);
    else if (!metaRobots(html).includes("noindex")) error(path, "Duplicate or filtered URL is not marked noindex");
    else pass(path, "Duplicate or filtered URL marked noindex");
  } catch (e) { error(path, String(e)); }
}

try {
  const { response, text } = await get("/ads.txt");
  const hasValidSeller = /^google\\.com,\\s*pub-\\d{16},\\s*DIRECT,\\s*f08c47fec0942fa0\\s*$/m.test(text);
  if (response.ok && hasValidSeller) pass("/ads.txt", "Valid AdSense seller record");
  else if (requireAds) error("/ads.txt", response.ok ? "Missing valid publisher record" : `HTTP ${response.status}; configure the publisher ID`);
  else warn("/ads.txt", response.ok ? "No valid AdSense seller record yet" : `HTTP ${response.status}; configure AdSense publisher ID before review`);
} catch (e) { if (requireAds) error("/ads.txt", String(e)); else warn("/ads.txt", String(e)); }

const failures = issues.filter((x) => x.level === "FAIL");
const warnings = issues.filter((x) => x.level === "WARN");
console.log(`\nAudit finished: ${checked} passed, ${failures.length} failed, ${warnings.length} warnings.`);
console.log("This validates public HTTP responses and markup, not Search Console indexing status or AdSense policy approval.");
process.exitCode = failures.length ? 1 : 0;
