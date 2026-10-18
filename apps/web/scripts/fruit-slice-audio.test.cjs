const {test}=require('node:test'),assert=require('node:assert/strict');
const {audioEnv}=require('./helpers/fruit-audio-env.cjs'),{boot}=require('./helpers/fruit-runtime.cjs');
const {create}=require('../public/games/fruit-slice/fruit-audio.js'),tracks=require('../public/games/fruit-slice/fruit-music.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve)),SAVE='gg_fruit_slice_progress_v1';

test('initial loading and a saved muted session request no songs or audio contexts',async()=>{
 const f=audioEnv();await boot({audio:f.env});assert.equal(f.media.length,0);assert.equal(f.contexts.length,0);
 const g=audioEnv(),r=await boot({audio:g.env,saved:new Map([[SAVE,JSON.stringify({muted:true})]])});r.startRound();r.step(3);assert.equal(g.media.length,0);assert.equal(g.contexts.length,0);
});

test('each of 25 actual rounds selects its unique song while reusing one media element and source',async()=>{
 const f=audioEnv(),r=await boot({audio:f.env});r.progress.unlocked=25;
 for(let i=0;i<25;i++){r.startRound(i);await tick();assert.equal(f.media[0].src,tracks[i].url);assert.equal(r.elements.get('musicTrack').textContent,tracks[i].title);assert.equal(f.media[0].currentTime,0);}
 assert.equal(f.media.length,1);assert.equal(f.contexts.length,1);assert.equal(f.contexts[0].mediaSources,1);assert.equal(f.media[0].preload,'none');assert.equal(f.media[0].loop,true);
});

test('pause/map/help, hidden tabs and completion stop music; resume retains the current play position',async()=>{
 const f=audioEnv(),r=await boot({audio:f.env});r.startRound();r.step(2.5);await tick();const m=f.media[0];m.currentTime=24;r.setPaused(true);assert.ok(m.paused);r.elements.get('btnLevels').click();r.elements.get('btnStart').click();assert.ok(m.paused);r.elements.get('btnHow').click();r.elements.get('btnStart').click();assert.ok(m.paused);r.elements.get('btnStart').click();await tick();assert.equal(m.currentTime,24);assert.ok(!m.paused);r.doc.hidden=true;r.doc.emit('visibilitychange');assert.ok(m.paused);r.doc.hidden=false;r.setPaused(false);await tick();r.endRound(true);assert.ok(m.paused);
});

test('music/effects volumes persist independently of master mute and do not resume a paused round',async()=>{
 const saved=new Map(),f=audioEnv(),r=await boot({audio:f.env,saved});r.startRound();await tick();r.setPaused(true);const music=r.elements.get('musicVolume'),effects=r.elements.get('effectsVolume');music.value='21';music.emit('input');effects.value='64';effects.emit('input');assert.ok(f.media[0].paused);const [master,musicGain,effectsGain]=f.contexts[0].gains;assert.equal(musicGain.gain.value,.105);assert.ok(Math.abs(effectsGain.gain.value-.416)<1e-10);r.elements.get('btnMute').click();assert.equal(master.gain.value,0);assert.ok(f.media[0].muted);const restored=await boot({saved});assert.equal(restored.progress.musicVolume,.21);assert.equal(restored.progress.effectsVolume,.64);assert.ok(restored.progress.muted);
});

for(const options of [{noContext:true},{denyContext:true},{noAudio:true},{rejectPlay:true},{rejectResume:true},{webkitOnly:true}])test('audio failure/support fallback '+JSON.stringify(options),async()=>{
 const f=audioEnv(options),a=create(f.env,tracks);assert.doesNotThrow(()=>{a.playLevel(1);a.effect('slice');a.pause();if(options.webkitOnly)f.contexts[0].state='interrupted';a.playLevel(2);a.configure({muted:true});});await tick();assert.equal(a.track.id,2);if(options.webkitOnly)assert.equal(f.contexts[0].state,'running');if(f.media.length)assert.ok(f.media[0].paused);a.dispose();
});

test('delayed play promises and media errors cannot restart playback after pause, mute or dispose',async()=>{
 const f=audioEnv({deferredPlay:true}),a=create(f.env,tracks);a.playLevel(1);a.pause();f.pending.shift()();await tick();assert.ok(f.media[0].paused);a.playLevel(2);a.configure({muted:true});f.pending.shift()();await tick();assert.ok(f.media[0].paused);a.configure({muted:false});a.playLevel(3);f.media[0].emit('error');f.pending.shift()();await tick();assert.ok(f.media[0].paused);a.dispose();assert.equal(f.media[0].src,'');a.playLevel(4);assert.ok(f.media[0].paused);
});

test('effects cover slice, combo, gold, miss, bomb, start, frenzy and results with bounded cleanup',()=>{
 const f=audioEnv(),a=create(f.env,tracks);a.unlock();const c=f.contexts[0];for(const kind of ['slice','combo','gold','miss','boom','start','count','gameover','frenzy','level']){const n=c.starts.length;c.currentTime+=.1;a.effect(kind);assert.ok(c.starts.length>n,kind);}assert.equal(c.bufferCount,1);for(let i=0;i<200;i++){c.currentTime+=.03;a.effect(i%2?'boom':'gold');}assert.ok(c.starts.filter(s=>!s.stopped).length<=24);assert.equal(c.bufferCount,1);a.pause();assert.ok(c.starts.every(s=>s.stopped&&s.connections.length===0));
});

test('zero music volume stays silent while effects work; zero effects does not mute music',async()=>{
 const f=audioEnv(),a=create(f.env,tracks);a.configure({musicVolume:0});a.playLevel(1);assert.equal(f.media.length,0);a.unlock();a.effect('slice');assert.ok(f.contexts[0].starts.length>0);a.configure({musicVolume:.4,effectsVolume:0});a.playLevel(1);await tick();assert.ok(!f.media[0].paused);const before=f.contexts[0].starts.length;a.effect('boom');assert.equal(f.contexts[0].starts.length,before);
});
