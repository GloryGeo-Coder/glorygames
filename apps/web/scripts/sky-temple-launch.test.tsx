import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
// CSS modules do not affect server-rendered element/link behavior.
require.extensions[".css"] = (module: any) => {
  module.exports = new Proxy({}, { get: (_target, key) => key === "__esModule" ? false : String(key) });
};
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const PlayClient = require("../src/app/play/[slug]/play-client.tsx").default;
const { SKY_TEMPLE } = require("../src/lib/skyTempleLaunch.ts");
const render = (slug: string) => renderToStaticMarkup(React.createElement(PlayClient, { slug, title: "Adventure" }));

test("Sky Temple's actual play page opens the deployed campaign without an old-game iframe", () => {
  const html = render(SKY_TEMPLE.slug);
  assert.ok(!html.includes("<iframe"));
  assert.ok(html.includes(`href="${SKY_TEMPLE.href}" target="_blank" rel="noopener noreferrer"`));
  assert.match(html, /Play Game/);
  assert.match(html, /Game Chat/);
  assert.ok(html.includes(`/games/${SKY_TEMPLE.slug}/thumb.webp`));
  assert.ok(existsSync(path.resolve("public", SKY_TEMPLE.href.slice(1))));
  assert.ok(!html.includes("Exit Fullscreen"));
});
test("other games retain their iframe, fullscreen control and chat", () => {
  const html = render("brick-blaster");
  assert.match(html, /<iframe[^>]*src="\/games\/brick-blaster\/index.html"/);
  assert.match(html, /Expand the game/);
  assert.match(html, /Game Chat/);
  assert.ok(!html.includes(SKY_TEMPLE.href));
});
