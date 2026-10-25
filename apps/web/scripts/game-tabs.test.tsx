import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
require.extensions[".css"] = (module: any) => { module.exports = new Proxy({}, { get: (_target, key) => key === "__esModule" ? false : String(key) }); };
const React = require("react"), { renderToStaticMarkup } = require("react-dom/server");
const PlayClient = require("../src/app/play/[slug]/play-client.tsx").default;
const { fallbackGames } = require("../src/lib/fallbackGames.ts");
const { SKY_TEMPLE } = require("../src/lib/skyTempleLaunch.ts");

for (const game of fallbackGames.filter((g: any) => g.slug !== SKY_TEMPLE.slug)) {
  test(`${game.slug}: actual play page retains thumbnail, scores and chat with a safe direct-game link`, () => {
    const html = renderToStaticMarkup(React.createElement(PlayClient, game));
    assert.ok(!html.includes("<iframe"));
    assert.ok(html.includes(`href="/games/${game.slug}/index.html" target="_blank" rel="noopener noreferrer"`));
    assert.ok(html.includes(`/games/${game.slug}/thumb.${game.slug === "science-lab-dash" ? "png" : "webp"}`));
    assert.match(html, /Play Game/); assert.match(html, /Game Chat/); assert.match(html, /Live score/);
    assert.ok(!html.includes(SKY_TEMPLE.href));
  });
}
test("Sky Temple's rendered launch/sidebar matches the working previous PlayClient snapshot", () => {
  // Captured after byte-comparing the rendering with commit 9748d99's PlayClient.
  const props = { slug: SKY_TEMPLE.slug, title: SKY_TEMPLE.title };
  const html = renderToStaticMarkup(React.createElement(PlayClient, props));
  assert.equal(createHash("sha256").update(html).digest("hex"), "8b750071fd15097837e714efeac38fe8265156d4194f0e68dbb855282a87217a");
});
test("the server information page still includes its editorial, FAQs and related-games components", () => {
  const source = readFileSync("src/app/play/[slug]/page.tsx", "utf8");
  assert.match(source, /GameEditorial/); assert.match(source, /getRelatedGames/); assert.match(source, /jsonLd/);
});
