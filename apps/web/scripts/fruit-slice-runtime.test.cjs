const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./helpers/fruit-runtime.cjs');
const {levels}=require('../public/games/fruit-slice/fruit-levels.js');
const SAVE='gg_fruit_slice_progress_v1',BEST='gg_fruit_slice_best_v2';
function launch(r,index=0,mode='campaign'){r.startRound(index,mode);r.step(2.5);}
function fruit(r,x=r.viewport().W/2,y=320,key='apple'){const o=r.spawnOne(false,false,x,0,key);assert.ok(o);Object.assign(o,{x,y,vy:0,vx:0,g:1728,age:1});return o;}
function clear(r){r.game.objects.length=0;r.game.nextWave=9999;}
function autoPlay(r){let ticks=0;while(r.game.running&&ticks++<120*80){r.step(1/120);for(const o of [...r.game.objects]){if(!r.game.running)break;if(o.kind==='fruit'&&!o.sliced&&o.y<r.viewport().H-75/r.viewport().scale&&o.y>r.viewport().topSafe+o.r)r.swipe(o.x-o.r*.35,o.y,o.x+o.r*.35,o.y);}}return ticks;}

for(const [width,height] of [[390,844],[844,390],[1366,768]])for(const lv of levels)test(`trial ${lv.id} at ${width}×${height}: real swipe events meet every goal before timeout`,async()=>{
 const r=await boot({width,height});r.progress.unlocked=25;launch(r,lv.id-1);autoPlay(r);assert.equal(r.game.phase,'complete',JSON.stringify({reason:r.game.endReason,stats:r.game.stats,score:r.game.score}));assert.ok(r.game.elapsed<lv.duration);assert.ok(r.progress.stars[lv.id]>=1);assert.ok(r.game.lives>0);
});

for(const [width,height] of [[320,568],[320,1000],[390,844],[844,390],[1024,768],[3840,2160]])test(`viewport ${width}×${height}: bounded pixels, reachable launch height and readable targets`,async()=>{
 const r=await boot({width,height});launch(r);const v=r.viewport();assert.ok(r.canvas.width*r.canvas.height<=3e6);assert.equal(v.H,720);assert.ok(v.W>150);
 for(const o of r.game.objects){const apex=o.y-o.vy*o.vy/(2*o.g);assert.ok(apex>=v.topSafe+o.r*1.5);assert.ok(apex<v.H-v.bottomSafe-o.r);assert.ok(o.r*v.scale>=23.9);assert.ok(o.x>=o.r&&o.x<=v.W-o.r);}
});

test('new campaign levels unlock only by completing the current trial, and best survives old saves',async()=>{
 const saved=new Map([[BEST,'5432']]),r=await boot({saved});assert.equal(r.best,5432);assert.equal(r.progress.unlocked,1);r.renderMap();const grid=r.elements.get('levelMap');assert.equal(grid.children.length,25);assert.ok(grid.children[1].disabled);grid.children[20].emit('click');assert.equal(r.game.levelIndex,0);launch(r,24);assert.equal(r.game.levelIndex,0);autoPlay(r);assert.equal(r.progress.unlocked,2);assert.ok(r.progress.stars[1]>=1);assert.equal(JSON.parse(saved.get(BEST)),5432);const restored=await boot({saved});assert.equal(restored.progress.unlocked,2);assert.equal(restored.progress.selected,1);
});

test('two fingers have independent paths, captures and lifetimes without connecting distant fruit',async()=>{
 const r=await boot();launch(r);clear(r);const a=fruit(r,70,300),b=fruit(r,260,300),middle=fruit(r,165,300),s=r.viewport().scale;
 const emit=(type,id,x,y)=>r.canvas.emit(type,{pointerId:id,clientX:x*s,clientY:y*s});emit('pointerdown',1,40,300);emit('pointerdown',2,290,300);emit('pointermove',1,90,300);emit('pointerup',1,90,300);assert.ok(r.game.blades.get(2).down);assert.ok(r.captures.has(2));emit('pointermove',2,240,300);assert.ok(a.sliced&&b.sliced);assert.ok(!middle.sliced);assert.equal(r.game.stats.sliced,2);emit('pointercancel',2,240,300);assert.ok(!r.game.blades.has(2));assert.ok(!r.captures.has(2));r.step(.2);assert.equal(r.game.blades.size,0);
});

test('coalesced touch samples follow the actual curved stroke instead of cutting across a bomb',async()=>{
 const r=await boot();launch(r);clear(r);const f=fruit(r,210,210),b={...f,kind:'bomb',key:'bomb',x:150,y:260,r:24,vy:0,golden:false};r.game.objects.push(b);const s=r.viewport().scale,p=(x,y)=>({clientX:x*s,clientY:y*s});r.canvas.emit('pointerdown',{...p(100,310),pointerId:3});r.canvas.emit('pointermove',{...p(210,210),pointerId:3,getCoalescedEvents:()=>[p(100,210),p(210,210)]});assert.ok(f.sliced);assert.ok(!b.sliced);assert.ok(r.game.running);
});

test('offset CSS coordinates and pixel density map to the visible fruit; a stationary finger cannot auto-slice',async()=>{
 const r=await boot({width:844,height:390,offsetX:18,offsetY:31});launch(r);clear(r);const f=fruit(r,500,330),s=r.viewport().scale;r.canvas.emit('pointerdown',{pointerId:1,clientX:18+500*s,clientY:31+330*s});r.canvas.emit('pointermove',{pointerId:1,clientX:18+500*s+.5,clientY:31+330*s});assert.ok(!f.sliced);r.canvas.emit('pointermove',{pointerId:1,clientX:18+530*s,clientY:31+330*s});assert.ok(f.sliced);
});

test('a swipe that includes a bomb cannot win by processing the last required fruit first',async()=>{
 const r=await boot();launch(r);clear(r);const v=r.viewport(),f=fruit(r,v.W*.3,320),b=r.spawnOne(true,false,v.W*.7);Object.assign(b,{x:v.W*.7,y:320,vy:0});r.game.score=999;r.game.stats.sliced=99;const unlocked=r.progress.unlocked;r.swipe(20,320,v.W-20,320);assert.equal(r.game.endReason,'Bomb hit');assert.equal(r.game.score,999);assert.ok(!f.sliced);assert.equal(r.progress.unlocked,unlocked);assert.ok(r.game.finalSubmitted);
});

test('classic combo, golden-fruit and frenzy scoring remains intact, and frenzy must be earned again',async()=>{
 const r=await boot();launch(r,0,'endless');clear(r);const scoreFruit=(gold=false)=>{const f=fruit(r);f.value=gold?34:20;f.golden=gold;r.swipe(f.x-10,f.y,f.x+10,f.y);r.game.objects.length=0;};scoreFruit();scoreFruit();scoreFruit();assert.equal(r.game.score,66);assert.equal(r.game.combo,3);scoreFruit(true);assert.equal(r.game.score,132);r.triggerFrenzy();scoreFruit();assert.equal(r.game.score,180);r.step(7.1);assert.equal(r.game.frenzyTimer,0);assert.ok(r.game.frenzyMeter<.01);scoreFruit();assert.equal(r.game.frenzyTimer,0);assert.ok(r.game.frenzyMeter>0&&r.game.frenzyMeter<.1);
});

test('Endless keeps three lives, all five fruits, increasing pace and fatal bombs',async()=>{
 const r=await boot();launch(r,0,'endless');assert.equal(r.game.lives,3);const keys=new Set();for(let n=0;n<100;n++){r.game.objects.length=0;r.spawnWave();for(const o of r.game.objects)if(o.kind==='fruit')keys.add(o.key);}assert.equal(keys.size,5);clear(r);const b=r.spawnOne(true);Object.assign(b,{y:300,vy:0});r.swipe(b.x-10,b.y,b.x+10,b.y);assert.equal(r.game.endReason,'Bomb hit');assert.equal(r.game.phase,'over');
});

test('fruit is not missed on its launch frame; dropped bombs cost no life and simultaneous misses submit once',async()=>{
 const r=await boot();launch(r,0,'endless');clear(r);const f=r.spawnOne(false);r.update(1/120);assert.equal(r.game.lives,3);assert.ok(r.game.running);clear(r);const b=r.spawnOne(true);Object.assign(b,{y:900,vy:200});r.update(1/120);assert.equal(r.game.lives,3);clear(r);r.game.lives=1;for(let i=0;i<3;i++){const o=fruit(r,70+i*80,900);o.vy=200;}r.update(1/120);assert.equal(r.game.lives,0);assert.equal(r.game.stats.missed,1);const before=r.messages.length;r.endRound(false);assert.equal(r.messages.length,before);
});

for(const type of ['blur','visibilitychange','pagehide'])test(`${type}: clear input, freeze the clock and require an explicit resume`,async()=>{
 const r=await boot();launch(r);const s=r.viewport().scale;r.canvas.emit('pointerdown',{clientX:80*s,clientY:350*s,pointerId:8});const before=r.game.elapsed;if(type==='visibilitychange'){r.doc.hidden=true;r.doc.emit(type);}else r.win.emit(type);assert.ok(r.game.paused);assert.equal(r.game.blades.size,0);assert.equal(r.captures.size,0);r.step(3);assert.equal(r.game.elapsed,before);r.doc.hidden=false;r.doc.emit('visibilitychange');assert.ok(r.game.paused);r.elements.get('btnStart').click();assert.ok(!r.game.paused);r.step(.2);assert.ok(r.game.elapsed>before);
});

test('rotating the viewport preserves the round, moves fruit safely and clears the old blade position',async()=>{
 const r=await boot();launch(r);const score=r.game.score,o=r.game.objects[0],relative=o.x/r.viewport().W;r.resizeTo(844,390);assert.ok(r.game.paused);assert.equal(r.game.score,score);assert.ok(Math.abs(o.x/r.viewport().W-relative)<1e-9);assert.ok(o.r*r.viewport().scale>=24);r.setPaused(false);r.swipe(o.x-10,o.y,o.x+10,o.y);assert.ok(o.sliced);
});

test('map/help return to pause without secretly resuming, restarting the round or changing its score',async()=>{
 const r=await boot();launch(r);r.game.score=321;r.setPaused(true);r.elements.get('btnHow').click();assert.equal(r.game.panel,'help');r.elements.get('btnStart').click();assert.equal(r.game.panel,'pause');assert.ok(r.game.paused);r.elements.get('btnLevels').click();assert.equal(r.game.panel,'map');r.elements.get('btnStart').click();assert.equal(r.game.panel,'pause');assert.equal(r.game.score,321);r.elements.get('btnStart').click();assert.ok(!r.game.paused);
});

test('blocked/corrupt storage never prevents a round and invalid save values cannot unlock beyond 25',async()=>{
 const r=await boot({failStorage:true});launch(r);assert.doesNotThrow(()=>r.save());const malformed=await boot({saved:new Map([[SAVE,'{bad'],[BEST,'not a number']])});assert.equal(malformed.best,0);assert.equal(malformed.progress.unlocked,1);const huge=await boot({saved:new Map([[SAVE,JSON.stringify({unlocked:999,selected:999,stars:{1:99},scores:{1:-10},musicVolume:0,effectsVolume:0})]])});assert.equal(huge.progress.unlocked,25);assert.equal(huge.progress.selected,24);assert.equal(huge.progress.stars[1],3);assert.equal(huge.progress.scores[1],0);assert.equal(huge.progress.musicVolume,0);
});

test('trusted host controls work while foreign messages cannot pause, mute or restart a round',async()=>{
 const r=await boot();launch(r);r.game.score=99;r.win.emit('message',{source:{},origin:'https://evil.invalid',data:{type:'GG_RESTART'}});assert.equal(r.game.score,99);r.win.emit('message',{source:r.win,origin:'https://webgamearena.com',data:{type:'GG_PAUSE',paused:true}});assert.ok(r.game.paused);r.win.emit('message',{source:r.win,origin:'https://webgamearena.com',data:{type:'GG_MUTE',muted:true}});assert.ok(r.progress.muted);assert.ok(r.messages.some(m=>m.data.slug==='fruit-slice'&&m.data.score===0));
});

test('missing images use safe fallback sprites, including cut halves, without breaking rendering',async()=>{
 const r=await boot({failAssets:true});launch(r);clear(r);const f=fruit(r);r.swipe(f.x-10,f.y,f.x+10,f.y);assert.equal(r.game.halves.length,2);assert.doesNotThrow(()=>r.draw());assert.ok(r.game.loaded);
});

test('all 25 objectives remain achievable on a very narrow tall phone',async()=>{
 for(let index=0;index<25;index++){const r=await boot({width:320,height:1000});r.progress.unlocked=25;launch(r,index);autoPlay(r);assert.equal(r.game.phase,'complete','trial '+(index+1));}
});

for(const [width,height] of [[390,844],[844,390],[1366,768]])test(`bombs retain a clear physical gap from fruit during active play at ${width}×${height}`,async()=>{
 const r=await boot({width,height});launch(r,0,'endless');r.game.lives=1000;let bombs=0,minGap=Infinity;
 for(let i=0;i<120*30;i++){r.step(1/120);for(const b of r.game.objects.filter(o=>o.kind==='bomb'))for(const f of r.game.objects.filter(o=>o.kind==='fruit'&&!o.sliced)){if(b.y<720&&f.y<720){bombs++;minGap=Math.min(minGap,Math.hypot(b.x-f.x,b.y-f.y)-b.r-f.r);}}
  for(const o of [...r.game.objects])if(o.kind==='fruit'&&!o.sliced&&o.y<720-75/r.viewport().scale&&o.y>r.viewport().topSafe+o.r)r.swipe(o.x-o.r*.25,o.y,o.x+o.r*.25,o.y);
 }assert.ok(bombs>0);assert.ok(minGap>6,minGap);assert.ok(r.game.running);
});

test('fixed-step motion and timing stay consistent at 20, 60 and 120 render frames per second',async()=>{
 const snapshots=[];for(const fps of [20,60,120]){const r=await boot();r.startRound();for(let i=0;i<4*fps;i++)r.frame(1000/fps);snapshots.push({elapsed:r.game.elapsed,objects:r.game.objects.map(o=>({x:o.x,y:o.y,key:o.key}))});}
 for(const s of snapshots.slice(1)){assert.ok(Math.abs(s.elapsed-snapshots[0].elapsed)<.02);assert.equal(s.objects.length,snapshots[0].objects.length);for(let i=0;i<s.objects.length;i++){assert.equal(s.objects[i].key,snapshots[0].objects[i].key);assert.ok(Math.abs(s.objects[i].x-snapshots[0].objects[i].x)<1);assert.ok(Math.abs(s.objects[i].y-snapshots[0].objects[i].y)<12);}}
});
