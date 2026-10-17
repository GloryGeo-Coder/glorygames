import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const helper=fileURLToPath(new URL('./helpers/campaign-runtime-probe.mjs',import.meta.url));
for(const world of ['garden','crystal','storm','solar']) {
  for(const scenario of ['fresh','restore','boss','defeated','newrun']) {
    test(`${world}: complete runtime ${scenario} scenario`, ()=>{
      const cp=spawnSync(process.execPath,[helper,world,scenario],{encoding:'utf8',timeout:8000});
      assert.equal(cp.status,0,`Runtime ${world}/${scenario} failed:\nSTDOUT:\n${cp.stdout}\nSTDERR:\n${cp.stderr}`);
      assert.match(cp.stdout, /PASS runtime/);
    });
  }
}
test('Garden menu can continue the campaign in the last active world',()=>{
  const cp=spawnSync(process.execPath,[helper,'garden','campaign'],{encoding:'utf8',timeout:8000});
  assert.equal(cp.status,0,`Garden recent-world link failed:\n${cp.stdout}\n${cp.stderr}`);
});
