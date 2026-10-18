const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {create}=require('../public/games/city-quest-rise-of-the-guardian/city-audio.js');
const tracks=require('../public/games/city-quest-rise-of-the-guardian/city-music.js');
const {audioEnv}=require('./helpers/city-audio-env.cjs');
const {boot,root}=require('./helpers/city-runtime.cjs');
const saveKey='gg_city_quest_guardian_save_v2';
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('25 distinct complete music files match their catalogue, level IDs and source manifest',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/music/manifest.json'))),hashes=new Set(),phrases=new Set();
 assert.equal(tracks.length,25);assert.equal(manifest.tracks.length,25);
 for(let i=0;i<25;i++){const t=tracks[i],m=manifest.tracks[i],bytes=fs.readFileSync(path.join(root,t.url));assert.equal(t.id,i+1);assert.equal(m.id,t.id);assert.equal(m.title,t.title);assert.equal(m.url,t.url);assert.equal(bytes.length,m.bytes);assert.ok(bytes.length>800000);assert.ok(t.duration>65&&t.duration<73);assert.ok(t.bpm>=108&&t.bpm<=116);assert.equal(bytes.subarray(0,3).toString(),'ID3');const hash=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(hash,m.sha256);hashes.add(hash);phrases.add(m.score.phrase);}
 assert.equal(hashes.size,25);assert.equal(phrases.size,25);assert.match(manifest.provenance,/no third-party/);
});

test('audio allocates nothing before a gesture and uses a single current-level stream',()=>{
 const a=audioEnv(),sound=create(a.env,tracks);assert.equal(a.media.length,0);assert.equal(a.contexts.length,0);
 sound.playLevel(0);assert.equal(a.media.length,1);assert.equal(a.media[0].loop,true);assert.equal(a.media[0].preload,'none');assert.deepEqual(a.media[0].requests,[tracks[0].url]);
 sound.selectLevel(24);assert.equal(a.media[0].paused,true);sound.playLevel(24);assert.equal(a.media.length,1);assert.equal(a.contexts.length,1);assert.equal(a.contexts[0].mediaSources,1);assert.equal(a.media[0].src,tracks[24].url);
});

test('music pause/resume keeps its position; choosing a mission restarts its own track',()=>{
 const a=audioEnv(),sound=create(a.env,tracks);sound.playLevel(10);a.media[0].currentTime=23;sound.pause();sound.playLevel(10);assert.equal(a.media[0].currentTime,23);sound.selectLevel(11);assert.equal(a.media[0].currentTime,0);sound.playLevel(11);assert.equal(sound.track.id,12);
});

test('music and effects controls are independent, routed through gains for mobile browsers',()=>{
 const a=audioEnv(),sound=create(a.env,tracks);sound.configure({musicVolume:.2,effectsVolume:.7});sound.playLevel(0);
 const [master,music,effects]=a.contexts[0].gains;assert.equal(master.gain.value,.8);assert.equal(music.gain.value,.2);assert.equal(effects.gain.value,.7);assert.equal(a.media[0].volume,1);
 sound.configure({musicVolume:0,effectsVolume:.9});assert.equal(a.media[0].paused,true);assert.equal(effects.gain.value,.9);sound.effect('shoot');assert.ok(a.contexts[0].starts.length>0);
 sound.configure({musicVolume:.4,effectsVolume:0});sound.playLevel(0);const count=a.contexts[0].starts.length;sound.effect('jump');assert.equal(a.contexts[0].starts.length,count);assert.equal(a.media[0].paused,false);
});

test('master mute suppresses both buses and cannot be undone by a volume update',()=>{
 const a=audioEnv(),sound=create(a.env,tracks);sound.playLevel(0);sound.effect('jump');sound.configure({muted:true});assert.equal(a.media[0].paused,true);assert.equal(a.contexts[0].gains[0].gain.value,0);assert.ok(a.contexts[0].starts.every(s=>s.stopped));const count=a.media[0].playCalls;sound.configure({musicVolume:.7});sound.playLevel(0);sound.effect('shoot');assert.equal(a.media[0].playCalls,count);
 sound.configure({muted:false});sound.playLevel(0);assert.equal(a.media[0].paused,false);
});

test('a delayed play resolution cannot restart a song after pause',async()=>{
 const a=audioEnv({deferredPlay:true}),sound=create(a.env,tracks);sound.playLevel(0);sound.pause();a.pending.shift()();await tick();assert.equal(a.media[0].paused,true);
});

test('rejected autoplay can be retried on the next gesture without an unhandled rejection',async()=>{
 const a=audioEnv({rejectPlay:true}),sound=create(a.env,tracks);sound.playLevel(3);await tick();sound.playLevel(3);await tick();assert.equal(a.media[0].playCalls,2);sound.pause();
});

for(const options of [{noContext:true},{webkitOnly:true},{denyContext:true}])test(`audio fallback preserves transport: ${JSON.stringify(options)}`,async()=>{
 const a=audioEnv(options),sound=create(a.env,tracks);sound.playLevel(2);sound.effect('hit');await tick();assert.equal(a.media[0].src,tracks[2].url);sound.pause();assert.equal(a.media[0].paused,true);
});

test('all gameplay cues schedule finite bounded voices, reuse noise, and release connections',()=>{
 const a=audioEnv(),sound=create(a.env,tracks);sound.playLevel(0);const c=a.contexts[0];
 for(const kind of ['coin','token','jump','land','shoot','enemyShoot','hit','shield','boss','enemyDefeat','power','checkpoint','level','victory','gameOver','npc']){const before=c.starts.length;c.currentTime+=1;sound.effect(kind);assert.ok(c.starts.length>before,kind);}
 assert.equal(c.bufferCount,1);assert.ok(c.starts.every(s=>Number.isFinite(s.at)&&s.end>s.at));assert.ok(c.starts.filter(s=>!s.stopped).length<=32);
 for(const source of c.starts)source.finish();assert.ok(c.starts.every(s=>s.connections.length===0));
});

test('continuous combat is rate limited and effects stop with pause',()=>{
 const a=audioEnv(),sound=create(a.env,tracks);sound.playLevel(0);const c=a.contexts[0];for(let i=0;i<100;i++)sound.effect('enemyShoot');assert.equal(c.starts.length,2);
 for(let i=0;i<100;i++){c.currentTime+=.15;sound.effect('enemyShoot');}assert.ok(c.starts.filter(s=>!s.stopped).length<=32);sound.pause();assert.ok(c.starts.every(s=>s.stopped));
});

test('suspended and interrupted contexts resume from a new play gesture',()=>{
 const a=audioEnv(),sound=create(a.env,tracks);sound.playLevel(0);for(const state of ['suspended','interrupted']){a.contexts[0].state=state;sound.playLevel(0);assert.equal(a.contexts[0].state,'running');}
});

test('missing media/audio support does not prevent the campaign from starting',async()=>{
 const r=await boot();r.startGame();r.jump();r.shoot();r.setPaused(true);r.setPaused(false);assert.equal(r.state.started,true);
});

test('game starts only its selected song, silences map/pause/interrupt, and changes track after completion',async()=>{
 const a=audioEnv(),r=await boot({audioEnv:a.env});assert.equal(a.media.length,0);r.startGame();assert.equal(a.media[0].src,tracks[0].url);r.openMap();assert.equal(a.media[0].paused,true);r.closeMap();assert.equal(a.media[0].paused,false);r.setPaused(true);assert.equal(a.media[0].paused,true);r.setPaused(false);assert.equal(a.media[0].paused,false);
 r.completeLevel();assert.equal(a.media[0].paused,true);r.nextLevel();assert.equal(a.media[0].src,tracks[1].url);r.win.emit('blur');assert.equal(a.media[0].paused,true);assert.ok(a.contexts[0].starts.every(s=>s.stopped));
});

test('new volume settings preserve progress, survive reload, clamp malformed values, and default old saves',async()=>{
 const saved=new Map([[saveKey,JSON.stringify({levelIndex:17,unlockedLevels:20,coins:86,skin:'hero_shadow'})]]),r=await boot({saved});r.startGame();assert.equal(r.state.musicVolume,.55);assert.equal(r.state.effectsVolume,.8);
 r.setPaused(true);const music=r.elements.get('musicVolume'),effects=r.elements.get('effectsVolume');music.value='23';music.emit('input');effects.value='67';effects.emit('input');const again=await boot({saved});assert.equal(again.state.musicVolume,.23);assert.equal(again.state.effectsVolume,.67);assert.equal(again.state.levelIndex,17);assert.equal(again.state.unlockedLevels,20);assert.equal(again.state.coins,86);assert.equal(again.state.skin,'hero_shadow');
 const bad=await boot({saved:new Map([[saveKey,JSON.stringify({musicVolume:900,effectsVolume:'broken'})]])});assert.equal(bad.state.musicVolume,1);assert.equal(bad.state.effectsVolume,.8);
});

test('muted saves never request a song, and bridge mute stays effective while paused',async()=>{
 const a=audioEnv(),r=await boot({audioEnv:a.env,saved:new Map([[saveKey,JSON.stringify({muted:true})]])});r.startGame();assert.equal(a.media.length,0);r.elements.get('muteBtn').click();assert.equal(a.media[0].paused,false);r.setPaused(true);r.win.emit('message',{origin:'https://webgamearena.com',source:r.win,data:{type:'GG_MUTE',muted:true}});r.setPaused(false);assert.equal(a.media[0].paused,true);
});

test('unmuting with music set to zero still enables gameplay effects without requesting music',async()=>{
 const a=audioEnv(),r=await boot({audioEnv:a.env,saved:new Map([[saveKey,JSON.stringify({muted:true,musicVolume:0})]])});r.startGame();assert.equal(a.contexts.length,0);r.elements.get('muteBtn').click();r.shoot();assert.equal(a.media[0].requests.length,0);assert.ok(a.contexts[0].starts.length>0);
});

test('all 25 map descriptions report actual enemy and checkpoint totals in the same format',async()=>{
 const r=await boot();r.openMap();for(const l of r.levelDefs){const expected=`Extended city route. ${l.enemies.length} enemies across ${l.checkpoints.length} checkpoint beacons.`;assert.equal(l.subtitle,expected);assert.ok(r.elements.get('mapGrid').children[l.id-1].innerHTML.includes(expected));}
});
