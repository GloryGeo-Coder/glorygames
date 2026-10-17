import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignSave, validateCampaignSnapshot, CAMPAIGN_SAVE_VERSION, CAMPAIGN_WORLD_PATHS } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-save.mjs';

function memoryStore() {
  const contents = new Map();
  return {
    contents,
    getItem: key => contents.get(key) ?? null,
    setItem: (key, val) => contents.set(key, String(val)),
    removeItem: key => contents.delete(key),
  };
}
const config = (world, storage) => ({
  world, storage, relicIds:['a','b','c','d','e'], checkpointIds:['entrance','middle','final'],
  enemyIds:['scout','bulwark','skimmer'], guardianMaxHp:15,
  now:()=>1790000000123,
});
const base = {
  checkpointId:'middle', relicIds:['a','b'], defeatedEnemyIds:['scout'],
  guardianDefeated:false, guardianHp:15, health:2, score:380,
};

test('save writes a versioned per-world snapshot and reads it after a reload', ()=>{
  const storage=memoryStore();
  const first=createCampaignSave(config('crystal',storage));
  assert.equal(first.write(base), true);
  const second=createCampaignSave(config('crystal',storage));
  assert.deepEqual(second.load(), {
    version:CAMPAIGN_SAVE_VERSION,world:'crystal',checkpointId:'middle',
    relicIds:['a','b'],defeatedEnemyIds:['scout'],guardianDefeated:false,
    guardianHp:15,health:2,score:380,savedAt:1790000000123,
  });
  assert.equal(second.lastWorld(), 'crystal');
});
test('four world snapshots do not overwrite each other', ()=>{
  const storage=memoryStore();
  const g=createCampaignSave(config('garden',storage));
  const c=createCampaignSave(config('crystal',storage));
  g.write({...base,score:999});c.write(base);
  assert.equal(g.load().score,999);
  assert.equal(c.load().score,380);
  assert.equal(c.lastWorld(),'crystal');
});
test('completed world clears only its own in-progress save and advances campaign', ()=>{
  const storage=memoryStore();
  const garden=createCampaignSave(config('garden',storage));
  const crystal=createCampaignSave(config('crystal',storage));
  garden.write(base);crystal.write(base);
  garden.complete('storm');
  assert.equal(garden.load(),null);
  assert.equal(crystal.load().score,380);
  assert.equal(garden.lastWorld(),'storm');
});
test('finishing the final world clears the resume pointer', ()=>{
  const storage=memoryStore();
  const solar=createCampaignSave(config('solar',storage));
  solar.write(base);solar.complete(null);
  assert.equal(solar.load(),null);
  assert.equal(solar.lastWorld(),null);
});
test('starting a new run clears one world without touching other worlds', ()=>{
  const storage=memoryStore();
  const a=createCampaignSave(config('garden',storage)),b=createCampaignSave(config('crystal',storage));
  a.write(base);b.write(base);a.clear();
  assert.equal(a.load(),null);assert.ok(b.load());
});
test('relic IDs are deduplicated and unknown/old IDs are discarded on migration', ()=>{
  const res=validateCampaignSnapshot({version:1, world:'garden', relicIds:['a','x','a','c'],
    checkpointId:'old-location', defeatedEnemyIds:['skimmer','unknown','skimmer'],guardianDefeated:true,
    guardianHp:0,health:5,score:Infinity,savedAt:-1},config('garden'));
  assert.deepEqual(res.relicIds,['a','c']);
  assert.equal(res.checkpointId,'entrance');
  assert.deepEqual(res.defeatedEnemyIds,['skimmer']);
  assert.equal(res.guardianDefeated,false);
  assert.equal(res.guardianHp,15);
  assert.equal(res.health,3);
  assert.equal(res.score,0);
});
test('all five relics allow resume with a defeated boss and open portal', ()=>{
  const data=validateCampaignSnapshot({version:1,world:'solar', checkpointId:'final',
    relicIds:['a','b','c','d','e'], guardianDefeated:true,guardianHp:0,
    health:1,score:4321},config('solar'));
  assert.equal(data.guardianDefeated,true);
  assert.equal(data.guardianHp,0);
  assert.equal(data.health,1);
});
test('partially damaged boss health is clamped and resumes only after full relic collection', ()=>{
  const full=validateCampaignSnapshot({version:1,world:'storm', checkpointId:'middle',
    relicIds:['a','b','c','d','e'],guardianHp:7},config('storm'));
  assert.equal(full.guardianHp,7);
  const partial=validateCampaignSnapshot({version:1,world:'storm',checkpointId:'middle',
    relicIds:['a','b','c','d'],guardianHp:7},config('storm'));
  assert.equal(partial.guardianHp,15);
});
test('unknown schema versions, other-world saves, and malformed JSON are safely ignored',()=>{
  const storage=memoryStore();const save=createCampaignSave(config('garden',storage));
  storage.setItem(save.key,'{not a json value');assert.equal(save.load(),null);
  storage.setItem(save.key,JSON.stringify({version:2,world:'garden',checkpointId:'middle'}));assert.equal(save.load(),null);
  storage.setItem(save.key,JSON.stringify({version:1,world:'solar',checkpointId:'middle'}));assert.equal(save.load(),null);
  storage.setItem(save.key,' '.repeat(15001));assert.equal(save.load(),null);
});
test('blocked browser storage does not break gameplay',()=>{
  const storage={getItem(){throw Error('denied')},setItem(){throw Error('quota exceeded')},removeItem(){throw Error('blocked')}};
  const save=createCampaignSave(config('garden',storage));
  assert.equal(save.load(),null);assert.equal(save.write(base),false);
  assert.equal(save.clear(),false);assert.doesNotThrow(()=>save.complete('crystal'));
});
test('missing storage gracefully disables persistence',()=>{
  const save=createCampaignSave(config('garden',null));
  assert.equal(save.available,false);assert.equal(save.load(),null);assert.equal(save.write(base),false);
});
test('campaign destinations are defined for every world',()=>{
  assert.deepEqual(Object.keys(CAMPAIGN_WORLD_PATHS),['garden','crystal','storm','solar']);
});
