import test from "node:test";
import assert from "node:assert/strict";
import { GAME_CATALOG, catalogGame } from "../src/lib/gameCatalog";
import { fallbackGames } from "../src/lib/fallbackGames";
import { GAME_EDITORIALS } from "../src/content/gameEditorials";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import GameEditorial from "../src/components/GameEditorial";

test("all 22 public catalog summaries and information-page summaries agree", () => {
  assert.equal(Object.keys(GAME_CATALOG).length, 22);
  assert.deepEqual(Object.keys(GAME_EDITORIALS).sort(), Object.keys(GAME_CATALOG).sort());
  for (const [slug, entry] of Object.entries(GAME_CATALOG)) {
    const guide = GAME_EDITORIALS[slug];
    assert.equal(guide.summary, entry.description, slug);
    assert.equal(fallbackGames.find(g => g.slug === slug)?.description, entry.description);
    const rendered = renderToStaticMarkup(React.createElement(GameEditorial, { slug, title: fallbackGames.find(g => g.slug === slug)!.title }));
    const escapedOverview = guide.overview[0].replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    assert.ok(rendered.includes(escapedOverview), slug);
    assert.match(rendered, /Frequently asked questions/);
    for (const field of [guide.overview, guide.story, guide.howToPlay, guide.desktop, guide.mobile, guide.progression, guide.tips, guide.faqs]) assert.ok(field.length > 0, slug);
    assert.doesNotMatch(JSON.stringify(guide), /coming soon|prototype|development placeholder|no long scripted campaign|six-level campaign|ten-level sequence|game contains ten levels|game has ten stages/i, slug);
  }
});

test("published progression facts match the implemented finite paths and continuous modes", () => {
  const facts: Record<string, RegExp[]> = {
    "brick-blaster": [/five|5/i, /Neon Grid/, /Classic Arcade/],
    "bubble-pop-arena": [/six|6/i, /45 seconds/, /continuous/],
    "city-quest-rise-of-the-guardian": [/25/, /Amapiano/],
    "climate-rescue-quest": [/25/, /five|5/i],
    "cyber-shield-academy": [/16|Sixteen/i, /untimed/],
    "fruit-slice": [/25|Twenty-five/i, /Endless Arcade/],
    "high-spead-racer": [/six|6/i, /twelve|12/i, /recover/i],
    "kasi-quest": [/20/, /daily challenge/],
    "lost-jungle-3d-temple-of-the-sun": [/25/, /2D/, /five story chapters/],
    "map-master-africa": [/84/, /504/, /56/, /Grades 4–10/],
    "math-sprint-arena": [/140/, /1 400/, /52/, /Grade 10/, /selected CAPS/],
    "neon-hover-runner": [/five|5/i, /Apex Night Run/],
    "neon-orb-defender": [/25/, /15/, /one per mission/],
    "physics-force-lab": [/twelve|12/i],
    "recycle-rush": [/25/, /20/, /450/],
    "science-lab-dash": [/20/, /Glitch Experiment/],
    "sky-temple-3d-rise-of-the-relic-master": [/four|4/i, /Solar Sanctuary/, /five relics/],
    "space-dodger": [/18|eighteen/i, /GLB/, /escort/],
    "space-pilot-platformer": [/eight|8/i, /Final Gate/],
    "stack-tower": [/endless/, /Focus Mode/],
    "swipe-racer": [/four|4/i],
    "word-dash": [/four|4/i],
  };
  for (const [slug, patterns] of Object.entries(facts)) {
    const copy = JSON.stringify(GAME_EDITORIALS[slug]);
    for (const pattern of patterns) assert.match(copy, pattern, slug);
  }
});

test("final game names override legacy database names without changing routes or unknown games", () => {
  for (const [slug, title] of Object.entries({
    "high-spead-racer": "High Speed Racer: City of Legends",
    "map-master-africa": "Map Master Africa: World Explorer",
    "recycle-rush": "Recycle Rush: Restore Verdale",
  })) {
    const normalized = catalogGame({ id: "existing-id", slug, title: "Legacy name", category: "ARCADE", description: "Old description" });
    assert.equal(normalized.title, title); assert.equal(normalized.slug, slug); assert.equal(normalized.id, "existing-id");
    assert.equal(fallbackGames.find(g => g.slug === slug)?.title, title);
  }
  const unknown = { slug: "another-game", title: "Another Game", category: "ACTION", description: "Original description" };
  assert.deepEqual(catalogGame(unknown), unknown);
});

test("Recycle Rush retains Fibre Circle sponsorship and its final story and arcade scope", () => {
  const guide = GAME_EDITORIALS["recycle-rush"], copy = JSON.stringify(guide);
  assert.equal(guide.sponsor, "Fibre Circle"); assert.match(copy, /Verdale/); assert.match(copy, /25/); assert.match(copy, /20/);
  assert.doesNotMatch(copy, /PETCO|Polyco|Polyco SA|MetPac|eWASA/i);
});
