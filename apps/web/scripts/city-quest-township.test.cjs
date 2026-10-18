const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {boot,root}=require('./helpers/city-runtime.cjs');
const baseline=JSON.parse(fs.readFileSync(path.join(root,'campaign-v22-baseline.json')));
const {expand}=require('../public/games/city-quest-rise-of-the-guardian/city-township.js');
const saveKey='gg_city_quest_guardian_save_v2';
const savedAt=(levelIndex,unlockedLevels=25)=>new Map([[saveKey,JSON.stringify({levelIndex,unlockedLevels})]]);

test('all ten existing stages double current-release lengths and regular enemy counts exactly',async()=>{
 const r=await boot();assert.equal(r.levelDefs.length,25);
 for(const old of baseline.levels){const lv=r.levelDefs[old.id-1];assert.equal(lv.width,old.width*2);assert.equal(lv.enemies.length,old.enemies*2);assert.equal(lv.bg,old.bg);assert.equal(!!lv.boss,old.boss);assert.equal(lv.previousWidth,old.width);assert.equal(lv.previousEnemyCount,old.enemies);}
 assert.equal(r.levelDefs.slice(0,10).reduce((n,l)=>n+l.enemies.length,0),baseline.levels.reduce((n,l)=>n+l.enemies,0)*2);
});

test('new stages have distinct identities, long routes, growing enemy budgets and five total boss milestones',async()=>{
 const r=await boot(),newLevels=r.levelDefs.slice(10);assert.equal(newLevels.length,15);assert.equal(new Set(newLevels.map(l=>l.title)).size,15);assert.equal(new Set(newLevels.map(l=>l.bg)).size,15);
 for(const lv of newLevels){assert.ok(lv.width>=11000);assert.equal(lv.enemies.length,lv.enemyBudget);assert.ok(lv.enemies.length>=24);assert.ok(lv.enemies.some(e=>e.type==='drone'));assert.ok(lv.enemies.some(e=>e.role==='sentry'));assert.ok(lv.enemies.some(e=>e.role==='burst'));assert.ok(lv.npcs.length>=2);assert.ok(lv.checkpoints.length>=9);assert.ok(lv.powers.some(p=>p[0]==='heart'));}
 assert.deepEqual(Array.from(r.levelDefs.filter(l=>l.boss),l=>l.id),[6,10,15,20,25]);
});

test('fresh campaign locks all twenty-four later stages, including direct load calls',async()=>{
 const r=await boot();r.startGame();assert.equal(r.elements.get('mapGrid').children.length,25);assert.ok(r.elements.get('mapGrid').children.slice(1).every(e=>e.disabled));r.loadLevel(24);assert.equal(r.state.levelIndex,0);
});

test('legacy v2.1 saves retain progress, currency, outfit, record and sound settings',async()=>{
 const saved=new Map([[saveKey,JSON.stringify({levelIndex:9,unlockedLevels:10,coins:128,score:52300,best:65000,skin:'hero_shadow',muted:true})]]);
 const r=await boot({saved});r.startGame();assert.equal(r.state.levelIndex,9);assert.equal(r.state.unlockedLevels,10);assert.equal(r.state.coins,128);assert.equal(r.state.score,52300);assert.equal(r.state.best,65000);assert.equal(r.state.skin,'hero_shadow');assert.equal(r.state.muted,true);assert.equal(r.state.completedLevels,9);
 r.loadLevel(10);assert.equal(r.state.levelIndex,9);r.completeLevel();assert.equal(r.state.completedLevels,10);assert.equal(r.state.unlockedLevels,11);
 const again=await boot({saved});assert.equal(again.state.unlockedLevels,11);assert.equal(again.state.coins,128);
});

test('clearing stage ten opens eleven and preserves the expanded campaign',async()=>{
 const r=await boot({saved:savedAt(9,10)});r.startGame();r.completeLevel();assert.equal(r.state.unlockedLevels,11);r.nextLevel();assert.equal(r.state.levelIndex,10);assert.equal(r.game.gameOver,false);
});

test('clearing stage twenty-four opens the true finale and only stage twenty-five ends the story',async()=>{
 const r=await boot({saved:savedAt(23,24)});r.startGame();r.completeLevel();assert.equal(r.state.unlockedLevels,25);r.nextLevel();assert.equal(r.state.levelIndex,24);assert.equal(r.game.gameOver,false);
 r.completeLevel();r.nextLevel();assert.equal(r.game.gameOver,true);assert.equal(r.state.completedLevels,25);assert.equal(r.elements.get('gameOverTitle').textContent,'Guardian Rises!');
});

test('later-stage saves round-trip without truncating back to ten levels',async()=>{
 const r=await boot({saved:savedAt(22,24)});r.startGame();r.saveState();const again=await boot({saved:r.saved});assert.equal(again.state.levelIndex,22);assert.equal(again.state.unlockedLevels,24);assert.equal(again.state.campaignVersion,22);
});

test('expansion is deterministic and idempotent, so retries cannot duplicate stages or enemies',async()=>{
 const a=await boot(),b=await boot();const before=JSON.stringify(a.levelDefs);expand(a.levelDefs);assert.equal(JSON.stringify(a.levelDefs),before);assert.equal(JSON.stringify(b.levelDefs),before);assert.throws(()=>expand([]),/complete ten-level/);
});

test('every checkpoint has stable footing and boss recovery beacons remain outside the final arena',async()=>{
 const r=await boot();for(const lv of r.levelDefs){const stable=lv.platforms.filter(p=>!p.move&&!p.ledge);for(const c of lv.checkpoints){assert.ok(stable.some(p=>c.x>=p.x&&c.x+62<=p.x+p.w&&Math.abs(c.y+82-p.y)<.01));assert.ok(!lv.obstacles.some(o=>o.type==='spikes'&&c.x<o.x+o.w&&c.x+62>o.x));}if(lv.boss)assert.ok(lv.checkpoints.at(-1).x<lv.boss.minX-150);}
});

test('guides remain interactive after mission acceptance on the longer routes',async()=>{
 const r=await boot({saved:savedAt(10)});r.startGame();r.game.missionAccepted=true;const guide=r.levelDefs[10].npcs[1];Object.assign(r.player,{x:guide.x-20,y:guide.y-82});r.tryAction();assert.equal(r.game.speechText,guide.text);assert.ok(r.game.speechTimer>0);
});

test('fifteen actual township images match references, distinct pixel data, dimensions and the creation manifest',async()=>{
 const r=await boot(),manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/backgrounds/township-manifest.json')));assert.equal(manifest.assets.length,15);
 const pixels=new Set();for(const a of manifest.assets){const file=path.join(root,'assets/backgrounds',a.file),png=fs.readFileSync(file);assert.equal(png.subarray(1,4).toString(),'PNG');assert.ok(png.readUInt32BE(16)>=1280);assert.ok(png.readUInt32BE(20)>=720);assert.equal(png.readUInt32BE(16),a.width);assert.equal(png.readUInt32BE(20),a.height);assert.equal(crypto.createHash('sha256').update(png).digest('hex'),a.sha256);assert.ok(a.prompt.includes('township'));
  const idat=[];for(let p=8;p<png.length;){const n=png.readUInt32BE(p),type=png.toString('ascii',p+4,p+8);if(type==='IDAT')idat.push(png.subarray(p+8,p+8+n));p+=n+12;}pixels.add(crypto.createHash('sha256').update(Buffer.concat(idat)).digest('hex'));assert.equal(r.levelDefs[a.id-1].bg,'./assets/backgrounds/'+a.file);
 }assert.equal(pixels.size,15);
});
