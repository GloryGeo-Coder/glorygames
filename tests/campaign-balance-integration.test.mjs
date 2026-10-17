import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {createCampaignSave, CAMPAIGN_SAVE_VERSION} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-save.mjs';

const base=resolve(dirname(fileURLToPath(import.meta.url)),
  '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d');
const worlds=['garden','crystal','storm','solar'];

for (const world of worlds){
  const folder=world==='garden'?base:resolve(base,world);
  const js=readFileSync(resolve(folder,'game.js'),'utf8');
  const html=readFileSync(resolve(folder,'index.html'),'utf8');
  test(`${world}: gameplay actually uses the new shared balance controls`,()=>{
    for(const hook of [
      'worldBalance(CAMPAIGN_WORLD)','jumpAssist.step({','nextForwardCheckpoint(checkpoints, checkpoint, hero, 3.1)',
      'canChargeDrone(tuning,','droneWarningTime(tuning, enemy.role)',
      'enemyCooldown(enemy.role) * tuning.droneCooldownScale',
      'tuning.droneProjectileSpeed','tuning.hitGraceBonus','tuning.guardianClock',
      'questDirection(hero, relics, relicSet, cameraYaw)',
    ])assert.ok(js.includes(hook),`${world}: missing ${hook}`);
    assert.match(html,/game\.js\?v=0\.13/);
  });
  test(`${world}: gameplay input, boss events and saves remain wired`,()=>{
    for(const hook of ['createCampaignSave','saveProgress()','restoreProgress(',
      'buttons.jumpQueued = true','buttons.blastQueued = true',
      'pointerdown','joystickPad','syncTouchControls','stepGuardian(guardian',
      'portalAvailable(','healthCount.textContent', 'getHardwareScalingLevel',
    ])assert.ok(js.includes(hook),`${world}: missing ${hook}`);
    assert.ok(js.includes('if (ui.questText.textContent !== nextQuestText)'));
  });
}

test('balancing does not change save schema version or a saved world',()=>{
  assert.equal(CAMPAIGN_SAVE_VERSION,1);
  const memory=new Map();
  const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
  const store=createCampaignSave({world:'garden',relicIds:['a','b'],checkpointIds:['start','finish'],enemyIds:['x'],guardianMaxHp:12,storage});
  const input={checkpointId:'finish',relicIds:['a'],defeatedEnemyIds:['x'],guardianHp:12,guardianDefeated:false,health:2,score:450};
  assert.equal(store.write(input),true);
  const actual=store.load();
  for(const key of ['checkpointId','relicIds','defeatedEnemyIds','guardianHp','guardianDefeated','health','score'])assert.deepEqual(actual[key],input[key]);
  assert.equal(actual.version,1);
});
