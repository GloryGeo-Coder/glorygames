import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
require.extensions[".css"] = (module: any) => { module.exports = new Proxy({}, { get: (_target, key) => key === "__esModule" ? false : String(key) }); };
const { gameThumbnailSources } = require("../src/lib/gameThumbnails.ts");
const React = require("react"), { renderToStaticMarkup } = require("react-dom/server");
const PlayClient = require("../src/app/play/[slug]/play-client.tsx").default;
const { fallbackGames } = require("../src/lib/fallbackGames.ts");
const { SKY_TEMPLE } = require("../src/lib/skyTempleLaunch.ts");

for (const game of fallbackGames.filter((g: any) => g.slug !== SKY_TEMPLE.slug)) {
  test(`${game.slug}: actual play page retains thumbnail, scores and available chat with a safe direct-game link`, () => {
    const html = renderToStaticMarkup(React.createElement(PlayClient, game));
    assert.ok(!html.includes("<iframe"));
    const launchPath = game.slug === "brick-playground-3d" ? `/play/${game.slug}` : `/games/${game.slug}/index.html`;
    assert.ok(html.includes(`href="${launchPath}" target="_blank" rel="noopener noreferrer"`));
    assert.ok(html.includes(gameThumbnailSources(game.slug)[0]));
    assert.match(html, /Play Game/); assert.match(html, /Game Chat/); assert.match(html, /ggChatInput/); assert.match(html, /Chat rules/); assert.doesNotMatch(html, /Chat is paused/); assert.match(html, /Live score/);
    assert.ok(!html.includes(SKY_TEMPLE.href));
  });
}
test("Sky Temple retains its campaign launch with the shared community sidebar available", () => {
  const props = { slug: SKY_TEMPLE.slug, title: SKY_TEMPLE.title };
  const html = renderToStaticMarkup(React.createElement(PlayClient, props));
  assert.ok(html.includes(`href="${SKY_TEMPLE.href}" target="_blank" rel="noopener noreferrer"`));
  assert.ok(html.includes(gameThumbnailSources(SKY_TEMPLE.slug)[0]));
  assert.match(html, /Game Chat/); assert.match(html, /ggChatInput/); assert.match(html, /Chat rules/); assert.doesNotMatch(html, /Chat is paused/);
  assert.doesNotMatch(html, /Online score submissions are paused/);
  assert.doesNotMatch(html, /<iframe/);
});
test("the server information page still includes its editorial, FAQs and related-games components", () => {
  const source = readFileSync("src/app/play/[slug]/page.tsx", "utf8");
  assert.match(source, /GameEditorial/); assert.match(source, /getRelatedGames/); assert.match(source, /jsonLd/);
});
