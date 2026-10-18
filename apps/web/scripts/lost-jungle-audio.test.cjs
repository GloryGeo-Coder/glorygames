const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {boot,root}=require('./helpers/jungle-runtime.cjs');
const {audioEnv}=require('./helpers/jungle-audio-env.cjs');
const {create}=require('../public/games/lost-jungle-3d-temple-of-the-sun/jungle-audio.js');
const tracks=require('../public/games/lost-jungle-3d-temple-of-the-sun/jungle-music.js');
const levels=require('../public/games/lost-jungle-3d-temple-of-the-sun/jungle-campaign.js').levels;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const SAVE='wga_lost_jungle_2d_save_v1';

test('ten distinct original full-length tracks cover all 25 route themes and match their asset manifest',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'assets/music/manifest.json')));assert.equal(m.tracks.length,10);assert.equal(tracks.length,10);
 const hashes=new Set();for(const t of tracks){const a=m.tracks.find(x=>x.id===t.id),b=fs.readFileSync(path.join(root,t.url));assert.equal(b.length,a.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);assert.ok(t.duration>=80&&t.duration<=110);assert.ok(a.encodedDuration>=t.duration&&a.encodedDuration-t.duration<.12);assert.ok(b.length<1.9e6);assert.equal(a.bars,40);hashes.add(a.sha256);assert.equal(b.subarray(0,3).toString(),'ID3');}assert.equal(hashes.size,10);
 for(const l of levels)assert.ok(tracks.some(t=>t.id===l.themeId));assert.match(m.provenance,/no third-party/);assert.equal(m.channels,2);
});

test('boot and muted sessions allocate no audio resources or song downloads',async()=>{
 const f=audioEnv();await boot({audio:f.env});assert.equal(f.contexts.length,0);assert.equal(f.media.length,0);
 const g=audioEnv(),saved=new Map([[SAVE,JSON.stringify({muted:true})]]),s=await boot({audio:g.env,saved});s.startGame();await s.ready();s.continueCutscene();assert.equal(g.contexts.length,0);assert.equal(g.media.length,0);
});

test('one reusable streamed element changes themes without accumulating contexts, sources or active songs',async()=>{
 const f=audioEnv(),a=create(f.env,tracks);a.unlock();assert.equal(f.media[0].src,'');assert.equal(f.media[0].preload,'none');
 for(let id=1;id<=10;id++){a.selectTheme(id);a.playTheme(id);await tick();assert.equal(f.media[0].src,tracks[id-1].url);assert.equal(a.track.id,id);assert.equal(f.media[0].currentTime,0);}
 assert.equal(f.media.length,1);assert.equal(f.contexts.length,1);assert.equal(f.contexts[0].mediaSources,1);assert.equal(f.media[0].loop,true);
});

test('pause and resume retain position while selecting or restarting a route resets it',async()=>{
 const f=audioEnv(),a=create(f.env,tracks);a.playTheme(3);await tick();f.media[0].currentTime=37.5;a.pause();assert.ok(f.media[0].paused);a.playTheme(3);await tick();assert.equal(f.media[0].currentTime,37.5);a.selectTheme(3);assert.equal(f.media[0].currentTime,0);a.selectTheme(7);a.playTheme(7);assert.equal(f.media[0].src,tracks[6].url);
});

test('music/effects gains are independent and master mute silences both including active tails',async()=>{
 const f=audioEnv(),a=create(f.env,tracks);a.playTheme(1);await tick();a.effect('relic');const c=f.contexts[0],[master,music,effects]=c.gains;assert.ok(c.starts.length>0);
 const effectGain=effects.gain.value;a.configure({musicVolume:.2});assert.equal(music.gain.value,.1);assert.equal(effects.gain.value,effectGain);a.configure({effectsVolume:.3});assert.equal(effects.gain.value,.195);assert.equal(music.gain.value,.1);
 a.configure({muted:true});assert.equal(master.gain.value,0);assert.ok(f.media[0].muted);assert.ok(f.media[0].paused);assert.ok(c.starts.every(s=>s.stopped));a.configure({muted:false});assert.equal(master.gain.value,.8);assert.equal(effects.gain.value,.195);assert.equal(music.gain.value,.1);
 a.configure({musicVolume:0});a.playTheme(1);assert.ok(f.media[0].paused);a.configure({effectsVolume:0});const before=c.starts.length;a.effect('jump');assert.equal(c.starts.length,before);
});

for(const options of [{noContext:true},{denyContext:true},{noAudio:true},{rejectPlay:true},{rejectResume:true},{webkitOnly:true}])test('audio degradation remains recoverable: '+JSON.stringify(options),async()=>{
 const f=audioEnv(options),a=create(f.env,tracks);assert.doesNotThrow(()=>{a.playTheme(1);a.effect('jump');a.pause();if(options.webkitOnly)f.contexts[0].state='interrupted';a.playTheme(2);a.configure({muted:true});});await tick();assert.equal(a.track.id,2);if(options.webkitOnly)assert.equal(f.contexts[0].state,'running');if(f.media.length)assert.ok(f.media[0].paused);a.dispose();
});

test('a late play promise and a failed track cannot restart music after pause or mute',async()=>{
 const f=audioEnv({deferredPlay:true}),a=create(f.env,tracks);a.playTheme(1);a.pause();f.pending.shift()();await tick();assert.ok(f.media[0].paused);a.playTheme(2);a.configure({muted:true});f.pending.shift()();await tick();assert.ok(f.media[0].paused);a.configure({muted:false});a.playTheme(3);f.media[0].emit('error');f.pending.shift()();await tick();assert.ok(f.media[0].paused);a.dispose();assert.equal(f.media[0].src,'');assert.equal(f.contexts[0].state,'closed');a.playTheme(4);assert.ok(f.media[0].paused);
});

test('dense pickups/combat keep effect voices bounded, then release every node on pause',()=>{
 const f=audioEnv(),a=create(f.env,tracks);a.unlock();const c=f.contexts[0];for(let i=0;i<200;i++){c.currentTime+=.03;a.effect('relic');}assert.ok(c.starts.filter(s=>!s.stopped).length<=24);a.pause();assert.ok(c.starts.every(s=>s.stopped&&s.connections.length===0));
});

test('the shipped game selects the right track for every route without changing progress or requiring extra downloads',async()=>{
 const f=audioEnv(),r=await boot({audio:f.env});r.startGame();await r.ready();assert.equal(f.media[0].requests.length,0);r.continueCutscene();await tick();
 for(const l of levels){r.state.unlockedLevel=25;r.state.levelIndex=l.id-1;r.buildLevel();await r.ready();r.showCutscene();assert.ok(f.media[0].paused);r.continueCutscene();await tick();assert.equal(f.media[0].src,tracks.find(t=>t.id===l.themeId).url);assert.equal(r.elements.get('musicTrack').textContent,tracks.find(t=>t.id===l.themeId).title);}
 assert.equal(f.media.length,1);assert.equal(f.contexts.length,1);assert.equal(f.contexts[0].mediaSources,1);assert.equal(r.state.unlockedLevel,25);
});

test('actual pause, map, tab hiding, completion and game-over stop music; resume uses the same song position',async()=>{
 const f=audioEnv(),r=await boot({audio:f.env});r.startGame();await r.ready();r.continueCutscene();await tick();const m=f.media[0];m.currentTime=19;r.setPaused(true);assert.ok(m.paused);r.setPaused(false);await tick();assert.equal(m.currentTime,19);r.openMap();assert.ok(m.paused);r.closeMap();await tick();assert.equal(m.currentTime,19);r.doc.hidden=true;r.doc.emit('visibilitychange');assert.ok(m.paused);assert.ok(r.state.paused);r.doc.hidden=false;r.setPaused(false);await tick();r.completeLevel();assert.ok(m.paused);r.triggerGameOver();assert.ok(m.paused);
});

test('volume controls persist with old saves, preserve mute/unlocks and remain silent while paused',async()=>{
 const saved=new Map([[SAVE,JSON.stringify({unlockedLevel:17,levelIndex:16,coins:74,score:4312,muted:false})]]),f=audioEnv(),r=await boot({audio:f.env,saved});assert.equal(r.state.musicVolume,.55);assert.equal(r.state.effectsVolume,.8);r.startGame();await r.ready();r.continueCutscene();await tick();r.setPaused(true);
 const music=r.elements.get('musicVolume'),effects=r.elements.get('effectsVolume');music.value='23';music.emit('input');effects.value='61';effects.emit('input');assert.ok(f.media[0].paused);assert.equal(r.elements.get('musicVolumeValue').textContent,'23%');const d=JSON.parse(saved.get(SAVE));assert.equal(d.musicVolume,.23);assert.equal(d.effectsVolume,.61);assert.equal(d.unlockedLevel,17);assert.equal(d.coins,74);assert.equal(d.score,4312);
 const loaded=await boot({saved});assert.equal(loaded.state.musicVolume,.23);assert.equal(loaded.state.effectsVolume,.61);r.elements.get('muteBtn').click();assert.ok(f.media[0].muted);assert.equal(JSON.parse(saved.get(SAVE)).muted,true);
});

test('corrupt volume values are sanitized and zero settings survive reload',async()=>{
 const r=await boot({saved:new Map([[SAVE,JSON.stringify({musicVolume:'loud',effectsVolume:3})]])});assert.equal(r.state.musicVolume,.55);assert.equal(r.state.effectsVolume,1);
 const s=await boot({saved:new Map([[SAVE,JSON.stringify({musicVolume:0,effectsVolume:0})]])});assert.equal(s.state.musicVolume,0);assert.equal(s.state.effectsVolume,0);
});

test('all prior jungle artwork and campaign data are byte-identical and audio controls have accessible labels',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const name of ['musicVolume','effectsVolume'])assert.match(html,new RegExp('label for="'+name+'"'));assert.ok(html.indexOf('jungle-audio.js')<html.indexOf('src="./game.js'));
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'release-v25-baseline.json')));for(const [file,sha] of Object.entries(baseline.unchanged))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,file);
});
