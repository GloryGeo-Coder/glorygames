const {test}=require('node:test'),assert=require('node:assert/strict');
const {audioEnv}=require('./helpers/bubble-audio-env.cjs'),{boot}=require('./helpers/bubble-runtime.cjs');
const {create}=require('../public/games/bubble-pop-arena/bubble-audio.js'),tracks=require('../public/games/bubble-pop-arena/bubble-music.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve)),SAVE='gg_bubble_pop_audio_v1';

test('loading, muted saved sessions and idle screens request no music or contexts',async()=>{const f=audioEnv();await boot({audio:f.env});assert.equal(f.media.length,0);assert.equal(f.contexts.length,0);const g=audioEnv(),r=await boot({audio:g.env,saved:new Map([[SAVE,JSON.stringify({muted:true})]])});r.probe.startGame();r.step(3);assert.equal(g.media.length,0);assert.equal(g.contexts.length,0);});

test('all six arena waves select their own song with one stream and media source',async()=>{const f=audioEnv(),r=await boot({audio:f.env});r.probe.startGame();for(let i=0;i<6;i++){r.probe.setState({pops:i*20});r.probe.advanceWave();await tick();assert.equal(f.media[0].src,tracks[i].url);assert.equal(r.elements.get('musicTrack').textContent,tracks[i].title);}assert.equal(f.media.length,1);assert.equal(f.contexts.length,1);assert.equal(f.contexts[0].mediaSources,1);assert.equal(f.media[0].preload,'none');assert.equal(f.media[0].loop,true);});

test('pause, scoreboard, chat, hidden tabs and round end stop music; resume retains position',async()=>{const f=audioEnv(),r=await boot({audio:f.env});r.probe.startGame();await tick();const m=f.media[0];m.currentTime=20;r.probe.setPaused(true);assert.ok(m.paused);r.elements.get('btnStart').click();await tick();assert.equal(m.currentTime,20);assert.ok(!m.paused);r.elements.get('btnOverlay').click();assert.ok(m.paused);r.elements.get('btnStart').click();r.doc.hidden=true;r.doc.emit('visibilitychange');assert.ok(m.paused);r.doc.hidden=false;r.probe.setPaused(false);await tick();r.probe.endGame();assert.ok(m.paused);});

test('music/effects controls and master mute persist independently without restarting a paused game',async()=>{const saved=new Map(),f=audioEnv(),r=await boot({audio:f.env,saved});r.probe.startGame();await tick();r.probe.setPaused(true);const m=r.elements.get('musicVolume'),e=r.elements.get('effectsVolume');m.value='24';m.emit('input');e.value='63';e.emit('input');assert.ok(f.media[0].paused);const [master,musicGain,effectsGain]=f.contexts[0].gains;assert.equal(musicGain.gain.value,.12);assert.ok(Math.abs(effectsGain.gain.value-.4095)<1e-10);r.elements.get('btnMute').click();assert.equal(master.gain.value,0);const restored=await boot({saved});assert.equal(restored.probe.settings.musicVolume,.24);assert.equal(restored.probe.settings.effectsVolume,.63);assert.ok(restored.probe.settings.muted);});

for(const options of [{noContext:true},{denyContext:true},{noAudio:true},{rejectPlay:true},{rejectResume:true},{webkitOnly:true}])test('audio failure/support fallback '+JSON.stringify(options),async()=>{
 const f=audioEnv(options),a=create(f.env,tracks);assert.doesNotThrow(()=>{a.playScene(1);a.effect('pop');a.pause();if(options.webkitOnly)f.contexts[0].state='interrupted';a.playScene(2);a.configure({muted:true});});await tick();assert.equal(a.track.id,2);if(options.webkitOnly)assert.equal(f.contexts[0].state,'running');if(f.media.length)assert.ok(f.media[0].paused);a.dispose();
});

test('delayed play promises and media errors cannot restart playback after pause, mute or dispose',async()=>{
 const f=audioEnv({deferredPlay:true}),a=create(f.env,tracks);a.playScene(1);a.pause();f.pending.shift()();await tick();assert.ok(f.media[0].paused);a.playScene(2);a.configure({muted:true});f.pending.shift()();await tick();assert.ok(f.media[0].paused);a.configure({muted:false});a.playScene(3);f.media[0].emit('error');f.pending.shift()();await tick();assert.ok(f.media[0].paused);a.dispose();assert.equal(f.media[0].src,'');a.playScene(4);assert.ok(f.media[0].paused);
});

test('effects cover pops, power-ups, bombs, wave changes, fever, countdown and results with bounded cleanup',()=>{
 const f=audioEnv(),a=create(f.env,tracks);a.unlock();const c=f.contexts[0];for(const kind of ['pop','time','freeze','bonus','bomb','start','gameover','fever','scene','warning']){const n=c.starts.length;c.currentTime+=.1;a.effect(kind);assert.ok(c.starts.length>n,kind);}assert.equal(c.bufferCount,1);for(let i=0;i<200;i++){c.currentTime+=.03;a.effect(i%2?'bomb':'bonus');}assert.ok(c.starts.filter(s=>!s.stopped).length<=24);assert.equal(c.bufferCount,1);a.pause();assert.ok(c.starts.every(s=>s.stopped&&s.connections.length===0));
});

test('zero music volume stays silent while effects work; zero effects does not mute music',async()=>{
 const f=audioEnv(),a=create(f.env,tracks);a.configure({musicVolume:0});a.playScene(1);assert.equal(f.media.length,0);a.unlock();a.effect('pop');assert.ok(f.contexts[0].starts.length>0);a.configure({musicVolume:.4,effectsVolume:0});a.playScene(1);await tick();assert.ok(!f.media[0].paused);const before=f.contexts[0].starts.length;a.effect('bomb');assert.equal(f.contexts[0].starts.length,before);
});
