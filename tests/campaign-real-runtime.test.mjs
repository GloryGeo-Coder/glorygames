import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const helper = fileURLToPath(new URL('./helpers/campaign-real-runtime-probe.mjs', import.meta.url));
for (const world of ['garden', 'crystal', 'storm', 'solar']) {
  test(`${world}: complete authored scene, hero and Guardian run in actual Babylon NullEngine`, () => {
    const result = spawnSync(process.execPath, [helper, world], { encoding: 'utf8', timeout: 12000 });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr?.slice(-3500)}`);
    assert.match(result.stdout, new RegExp(`PASS real runtime ${world}`));
  });
}
