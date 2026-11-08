// Observe the same on-screen builder through real walking, jumping, delivery and driving controls.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function inspect(browser, mobile) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    const p = await ctx.newPage(),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const touch = mobile && (await ctx.newCDPSession(p));
    const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
    const shot = async (name) => {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await p.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'builder-' + name + (mobile ? '-phone' : '-desktop') + '.png'
        )
      });
    };
    async function walkTo(z, sign, counter = false) {
      const key = sign > 0 ? 'w' : 's';
      if (mobile) {
        const r = await p.locator('#stick').boundingBox();
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [
            { x: r.x + r.width / 2, y: r.y + r.height / 2 - (counter ? 16 : 30) * sign }
          ]
        });
      } else await p.keyboard.down(key);
      try {
        await p.waitForFunction(
          ({ z, sign, counter }) => {
            if (counter) return !document.getElementById('shopAction').disabled;
            const scene = BABYLON.EngineStore.LastCreatedScene;
            return (
              (scene.getTransformNodeByName('Builder').position.z - z) * sign >= 0 &&
              Math.abs(scene.getTransformNodeByName('Builder hip').rotation.x) > 0.1
            );
          },
          { z, sign, counter },
          { timeout: 60000 }
        );
      } finally {
        if (mobile)
          await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        else await p.keyboard.up(key);
      }
    }
    await p.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await p.locator('#tray button').first().waitFor();
    await tap('play');
    await shot('braids');
    await walkTo(-7.7, -1);
    await p.waitForFunction(
      () =>
        BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder hip').rotation.x === 0
    );
    const portrait = await p.evaluate(() => {
      const s = BABYLON.EngineStore.LastCreatedScene,
        root = s.getTransformNodeByName('Builder'),
        head = s.getMeshByName('Builder face');
      const meshes = root.getChildMeshes().filter((m) => m.isEnabled());
      const { min, max } = root.getHierarchyBoundingVectors(true, (m) => m.isEnabled());
      return {
        art: head.material.diffuseTexture.isReady(),
        meshes: meshes.length,
        height: max.y - min.y,
        hair: s.getMeshByName('Twisted braids and cuffs').isDescendantOf(root)
      };
    });
    assert.ok(portrait.art && portrait.hair);
    assert.ok(portrait.height > 1.6 && portrait.height < 1.72, JSON.stringify(portrait));
    assert.ok(portrait.meshes <= 16, 'main model uses a small set of rigid batches');
    await p.waitForFunction(
      () =>
        BABYLON.EngineStore.LastCreatedScene.getMeshByName('Builder face').material.diffuseTexture
          .vOffset === 0.5
    );
    await shot('portrait');
    await tap('jump');
    await p.waitForFunction(
      () =>
        BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder knee').rotation.x > 0.6
    );
    await tap('worlds');
    await tap('shopWorld');
    await tap('shopAction');
    await walkTo(2.35, 1, true);
    await tap('shopAction');
    await p.waitForFunction(() => {
      const s = BABYLON.EngineStore.LastCreatedScene;
      return (
        s.getTransformNodeByName('Flat delivery parcel').isEnabled() &&
        s.getTransformNodeByName('Builder elbow').rotation.x < -0.9
      );
    });
    await shot('parcel');
    await tap('worlds');
    await tap('garageWorld');
    await tap('starterBuggy');
    await tap('play');
    await p.waitForFunction(() => {
      const s = BABYLON.EngineStore.LastCreatedScene;
      return (
        s.getTransformNodeByName('Builder').parent?.name === 'Workshop chassis' &&
        s.getTransformNodeByName('Builder hip').rotation.x < -1 &&
        s.getTransformNodeByName('Builder knee').rotation.x > 1
      );
    });
    await shot('driver');
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop keyboard') +
        ': verified the textured face, full-height articulated builder, walking, jumping, parcel hold and seated driver.'
    );
  } finally {
    await ctx.close();
  }
}
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: [
      '--no-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader'
    ]
  });
  try {
    for (const mobile of [true, false]) await inspect(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
