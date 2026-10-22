const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {boot,root}=require('./helpers/recycle-runtime.cjs');
const L=require('../public/games/recycle-rush/story-data.js');const S=require('../public/games/recycle-rush/story-audio.js');
const freshSave=()=>L.normalize(null);
function prepareItem(s,item){const kind=L.play.kind(item);if(!kind)return;for(const[id]of L.play.activities[kind].steps)assert.ok(L.act(s,'work',id).ok);assert.ok(L.act(s,'prepare',kind).ok);}
function answerRequest(s){if(L.requestReady(s)){const m=L.missions.find(m=>m.id===s.mission);assert.ok(L.act(s,'decision',m.requests[s.stop].answer).ok);}}
function finishDispatch(s){const m=L.missions.find(m=>m.id===s.mission);while(L.dispatchReady(s)){const plan=m.dispatch[s.stop];const job=L.dispatch.next(plan,s.play.dispatch?.[s.stop]);assert.ok(job);assert.ok(L.act(s,'dispatch',job.id).ok);}}
function finishOrders(s){while(L.orderReady(s)){const m=L.missions.find(m=>m.id===s.mission),step=L.orders.next(m.orders[s.stop],s.play.orders?.[s.stop]);assert.ok(step);assert.ok(L.act(s,'order',step.id).ok);}}
function advance(s){answerRequest(s);finishOrders(s);finishDispatch(s);assert.ok(L.act(s,'restore','canopy').ok);return L.nextStop(s);}
function winBattle(s){for(let wave=0;wave<3;wave++){assert.ok(L.act(s,'wisp',wave*2).ok);assert.ok(L.act(s,'wisp',wave*2+1).ok);assert.ok(L.act(s,'pulse').ok);}}
function completeArea(s){const m=L.missions.find(m=>m.id===s.mission);for(const [i,id]of m.sets[s.stop].entries()){const item=L.items[id];assert.ok(L.act(s,'select',i).ok);prepareItem(s,item);assert.ok(L.act(s,'route',item.route).ok);}}
test('all 25 missions require 450 recovery tasks, 60 community requests, 30 work orders, 30 dispatch boards and five showdowns',()=>{const save=freshSave();let count=0;for(const m of L.missions){const s=L.fresh(m.id);assert.equal(L.finish(save,s),false);for(let area=0;area<3;area++){assert.equal(s.stop,area);completeArea(s);answerRequest(s);finishOrders(s);finishDispatch(s);count+=6;if(area<2){assert.equal(s.complete,false);assert.equal(L.finish(save,s),false);assert.ok(advance(s));}}if(L.play.isBattle(m.id)){assert.equal(s.complete,false);winBattle(s);}assert.equal(L.progress(s).fraction,1);assert.equal(L.finish(save,s),3);const score=s.score;assert.equal(L.finish(save,s),3);assert.equal(save.results[m.id].score,score);assert.equal(L.act(s,'route','paper').ok,false);assert.equal(L.nextStop(s),false);}assert.equal(count,450);assert.equal(save.unlocked,25);assert.equal(Object.keys(save.stars).length,25);assert.deepEqual(L.normalize(save),save);});
test('mistakes are recoverable, hints explain condition, and repeated preparation cannot farm points',()=>{const s=L.fresh('lunch');L.act(s,'select',0);assert.equal(L.act(s,'route','containers').ok,false);assert.equal(s.done.length,0);assert.equal(s.mistakes,1);assert.match(L.act(s,'hint').text,/empty/i);assert.equal(s.hints,1);assert.equal(L.act(s,'prepare','flatten').ok,false);prepareItem(s,L.items.juice);const score=s.score;assert.equal(L.act(s,'prepare','empty').ok,false);assert.equal(s.score,score);assert.ok(L.act(s,'route','containers').ok);assert.equal(L.act(s,'route','containers').ok,false);assert.equal(s.score,125);});
test('each stop saves/resumes partial work and retry rolls back only the current area',()=>{const save=freshSave(),s=L.fresh('workshop');completeArea(s);advance(s);const checkpoint=s.score;L.act(s,'select',0);L.act(s,'route','containers');L.act(s,'select',1);L.act(s,'route','paper');L.act(s,'hint');save.session=s;const loaded=L.normalize(JSON.parse(JSON.stringify(save)));assert.deepEqual(loaded.session,s);L.retryStop(loaded.session);assert.equal(loaded.session.stop,1);assert.equal(loaded.session.score,checkpoint);assert.equal(loaded.session.mistakes,0);assert.equal(loaded.session.hints,0);assert.deepEqual(loaded.session.done,[]);assert.equal(L.progress(loaded.session).done,6);});
test('corrupt saves and out-of-order unlocks are bounded without reading or deleting arcade saves',()=>{for(const raw of [null,[],42,{version:8},{version:1,unlocked:99},{version:1,unlocked:5,stars:{'school-tomorrow':3}}])assert.equal(L.normalize(raw).unlocked,0);const save=freshSave();save.session=L.fresh('school-tomorrow');assert.equal(L.normalize(save).session,null);const s=L.fresh('workshop');for(const bad of [{...s,stop:-1},{...s,done:[9]},{...s,score:NaN},{...s,selected:9},{...s,complete:true},{...s,done:[0,0]}])assert.equal(L.validSession(bad),false);const old={wga_recycle_rush_2_save_v1:{unlockedLevel:18,stars:{0:3},loopUnlocked:false}};L.normalize(old);assert.equal(old.wga_recycle_rush_2_save_v1.unlockedLevel,18);});
test('all mission item/route/preparation/asset references and source guidance are valid',()=>{const refs=new Set();for(const m of L.missions){refs.add(m.background);assert.equal(m.sets.length,3);assert.equal(new Set(m.destinations).size,m.destinations.length);for(const set of m.sets){assert.equal(set.length,6);for(const id of set){const item=L.items[id];assert.ok(item);assert.ok(m.destinations.includes(item.route),`${m.id}: ${id}`);assert.ok(item.fact.length>35);if(item.prep)assert.ok(L.preparations[item.prep]);refs.add(item.icon);}}}for(const route of Object.values(L.routes))refs.add(route.icon);for(const ref of refs)assert.ok(fs.existsSync(path.join(root,ref)),ref);assert.match(L.items.battery.fact,/supervisor/);assert.match(L.items.radio.fact,/qualified/);assert.match(L.items.carton.fact,/accept/);assert.equal(L.SOURCES[0],'https://fibrecircle.co.za/zithande_mzansi.html');});
test('all 25 songs have distinct melodies, rhythm and titles; unavailable audio stays playable',()=>{assert.equal(S.themes.length,L.missions.length);assert.equal(new Set(S.themes.map(t=>t.title)).size,L.missions.length);assert.equal(new Set(S.themes.map(t=>JSON.stringify(t.notes))).size,L.missions.length);assert.equal(new Set(S.themes.map(t=>JSON.stringify(t.rhythm))).size,L.missions.length);const audio=S.create({setInterval,clearInterval},{music:.5,sfx:.5});audio.start(4);audio.effect('sort');audio.pause();assert.equal(audio.available,false);const blocked=S.create({AudioContext:class{constructor(){throw Error('blocked');}},setInterval,clearInterval},{music:1,sfx:1});assert.doesNotThrow(()=>blocked.start(0));});
test('real arcade boots with all assets, existing stars/settings and no missing boss sprites',async()=>{const saved=new Map([['wga_recycle_rush_2_save_v1',JSON.stringify({unlockedLevel:19,stars:{0:3,18:2},badges:{boss:true},loopUnlocked:true,settings:{music:0,sfx:0}})]]);const r=await boot({saved});assert.equal(r.probe.save.unlockedLevel,19);assert.equal(r.probe.save.stars[18],2);assert.equal(r.probe.save.loopUnlocked,true);for(const ref of r.requests)assert.ok(fs.existsSync(path.join(root,ref)),ref);r.probe.startLoop();assert.equal(r.probe.state.loop,true);r.probe.draw();assert.ok(r.draws>0);});
test('all eight destinations fit narrow portrait and short landscape canvases',async()=>{for(const [width,height]of [[320,330],[390,500],[832,190],[1000,500]]){const r=await boot({width,height});r.probe.initLevel(19);assert.equal(r.probe.state.bins.length,8);for(const b of r.probe.state.bins){assert.ok(b.x>=0&&b.y>=0);assert.ok(b.x+b.w<=width+1);assert.ok(b.y+b.h<=height+1,`${width}x${height} ${JSON.stringify(b)}`);assert.ok(b.w>=44&&b.h>=44);}}});
test('correct material choice succeeds even far from the physical bin; wrong choice explains material',async()=>{const r=await boot();const p=r.probe;p.initLevel(0);const it={kind:'item',cat:'paper',x:380,y:0,w:50,h:50};p.state.items.push(it);p.handleCatch(it,0);assert.equal(p.state.sorted,1);assert.equal(p.state.wrong,0);const bad={...it,cat:'organic'};p.state.items.push(bad);p.handleCatch(bad,0);assert.equal(p.state.sorted,1);assert.equal(p.state.lives,2);assert.match(r.elements.get('professorBubble').textContent,/Organic/);});
test('boss death cannot bypass target or award repeated kills/completion bonuses',async()=>{const r=await boot();const p=r.probe;p.initLevel(2);p.damageBoss(1000,100,100);assert.equal(p.state.running,true);assert.equal(p.save.bossKills,1);const score=p.state.score;p.damageBoss(1000,100,100);assert.equal(p.state.score,score);assert.equal(p.save.bossKills,1);p.state.sorted=18;p.checkClear();assert.equal(p.state.running,false);assert.equal(p.save.unlockedLevel,3);const cleared=p.state.score;p.completeLevel();p.checkClear();assert.equal(p.state.score,cleared);assert.equal(r.messages.filter(m=>m.type==='submit').length,1);});
test('slow power slows spawns and frame updates stop when a catch ends the mission',async()=>{const r=await boot();const p=r.probe;p.initLevel(0);p.state.slowTime=8;p.state.spawnTimer=1;p.update(.05);assert.ok(p.state.spawnTimer>.97);p.state.sorted=15;p.state.items=[{kind:'item',cat:'organic',x:0,y:999,w:50,h:50,age:0,spin:0,vx:0,vy:0},{kind:'item',cat:'paper',x:0,y:999,w:50,h:50,age:0,spin:0,vx:0,vy:0}];p.update(.01);assert.equal(p.state.completed,true);assert.equal(p.state.lives,3);});
test('touch drag uses capture, ignores second finger, cancels safely and routes to a destination',async()=>{const r=await boot();r.probe.initLevel(0);const it={kind:'item',cat:'paper',x:20,y:20,w:50,h:50};r.probe.state.items.push(it);r.emit('pointerdown',{clientX:30,clientY:30,pointerId:7});assert.ok(r.captures.has(7));r.emit('pointerdown',{clientX:40,clientY:40,pointerId:8});assert.equal(r.probe.state.pointerId,7);r.emit('pointercancel',{pointerId:7});assert.equal(r.probe.state.selectedItem,null);assert.equal(r.probe.state.wrong,0);r.emit('pointerdown',{clientX:30,clientY:30,pointerId:9});const b=r.probe.state.bins[0];r.emit('pointermove',{clientX:b.x+b.w/2,clientY:b.y+20,pointerId:9});r.emit('pointerup',{clientX:b.x+b.w/2,clientY:b.y+20,pointerId:9});assert.equal(r.probe.state.sorted,1);assert.equal(r.captures.size,0);});
test('pause, resize and hidden-tab transitions reset touch without charging a mistake',async()=>{const r=await boot();r.probe.initLevel(0);r.emit('pointerdown',{clientX:20,clientY:20});r.resize(844,210);assert.equal(r.probe.state.pointerId,null);assert.equal(r.probe.state.lives,3);r.document.hidden=true;r.document.emit('visibilitychange');assert.equal(r.probe.state.paused,true);const before=r.probe.state.time;r.step(.05);assert.equal(r.probe.state.time,before);});
test('score publishing uses canonical slug and does not write/emit every frame',async()=>{const r=await boot();r.probe.initLevel(0);const n=r.messages.length;for(let i=0;i<120;i++)r.probe.postScore();assert.equal(r.messages.length,n);r.probe.state.score=100;r.probe.postScore();assert.ok(r.messages.filter(m=>m.gameSlug).every(m=>m.gameSlug==='recycle-rush'));assert.equal(r.saved.get('wga_recycle_rush_2_best'),'100');});
test('blocked storage, unavailable audio and failed images do not prevent arcade play',async()=>{const r=await boot({failStorage:true,failAssets:true,audio:{AudioContext:class{constructor(){throw Error('blocked');}}}});assert.doesNotThrow(()=>{r.probe.initLevel(0);r.probe.update(.05);r.probe.draw();});});
test('every existing arcade mission still advances in order and final completion unlocks Loop Mode',async()=>{const r=await boot();const p=r.probe;for(let n=0;n<20;n++){p.startLevel(n);r.elements.get('comicContinueBtn').onclick();assert.equal(p.state.levelIndex,n);assert.equal(p.state.running,true);const target=[16,20,18,22,24,22,25,27,24,27,30,28,30,32,30,34,34,36,35,45][n];for(let i=0;i<target;i++){const bin=i%p.state.bins.length;const item={kind:'item',cat:p.state.bins[bin].cat,x:300,y:20,w:50,h:50};p.state.items.push(item);p.handleCatch(item,bin);}if(p.state.boss&&p.state.boss.hp>0){assert.equal(p.state.running,true);p.damageBoss(10000,100,100);}assert.equal(p.state.completed,true);assert.equal(p.save.stars[n],3);assert.equal(p.save.unlockedLevel,n+1);}assert.equal(p.save.loopUnlocked,true);p.startLoop();assert.equal(p.state.loop,true);assert.equal(p.state.running,true);});
test('story opening cancels pending arcade recovery and returning restores the map',async()=>{const r=await boot();r.probe.initLevel(2);r.probe.state.rebootTimer=123;r.document.emit('recycle:story-open');assert.equal(r.probe.state.running,false);assert.equal(r.probe.state.paused,true);r.document.emit('recycle:story-exit');assert.equal(r.probe.state.running,false);assert.equal(r.elements.get('levelValue').textContent,'Map');});
test('each music theme plays independently of SFX volume and pause clears its scheduler and active voices',()=>{let next=0;const timers=new Map(),voices=[],gains=[];class Audio{constructor(){this.state='running';this.currentTime=0;this.destination={};}createGain(){const gain={gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};gains.push(gain);return gain;}createDynamicsCompressor(){return{threshold:{},ratio:{},connect(){}};}createOscillator(){const voice={frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){voice.started=true;},stops:[],stop(time){voice.stops.push(time??0);voice.stopped=true;}};voices.push(voice);return voice;}}const audio=S.create({AudioContext:Audio,setInterval(fn){timers.set(++next,fn);return next;},clearInterval(id){timers.delete(id);}},{music:.6,sfx:0});for(let i=0;i<S.themes.length;i++){const count=voices.length;audio.start(i);assert.ok(voices.length>count);assert.equal(timers.size,1);}audio.pause();assert.equal(timers.size,0);assert.ok(voices.every(v=>v.stops.at(-1)===0));audio.volumes({music:.6,sfx:.6});const beforeEffect=voices.length;audio.effect('prepare');const effectVoices=voices.slice(beforeEffect);audio.start(4);assert.ok(effectVoices.length>0);assert.ok(effectVoices.every(v=>v.stops.length===1),'resuming music preserves short effects');audio.pause();assert.ok(effectVoices.every(v=>v.stops.at(-1)===0));audio.mute(true);assert.equal(gains[0].gain.value,0);assert.equal(gains[1].gain.value,0);audio.start(0);const count=voices.length;for(const tick of timers.values())tick();assert.equal(voices.length,count);audio.pause();});
test('all five hands-on activities enforce their steps, persist partial work and award preparation once',()=>{for(const[mission,selected]of[['lunch',0],['lunch',1],['lunch',2],['second-life',0],['second-life',2]]){const s=L.fresh(mission),m=L.missions.find(m=>m.id===mission),item=L.items[m.sets[0][selected]],type=L.play.kind(item),steps=L.play.activities[type].steps;L.act(s,'select',selected);assert.equal(L.act(s,'prepare',type).ok,false);assert.equal(s.score,0);assert.ok(L.act(s,'work',steps[0][0]).ok);assert.equal(L.act(s,'work',steps[0][0]).ok,false);const save=freshSave();save.session=s;save.unlocked=L.missions.indexOf(m);for(let i=0;i<save.unlocked;i++)save.stars[L.missions[i].id]=3;const restored=L.normalize(JSON.parse(JSON.stringify(save))).session;assert.deepEqual(restored.play.work,s.play.work);for(const[id]of steps.slice(1))assert.ok(L.act(restored,'work',id).ok);assert.ok(L.act(restored,'prepare',type).ok);assert.equal(restored.score,25);assert.equal(L.act(restored,'prepare',type).ok,false);assert.ok(L.act(restored,'route',item.route).ok);assert.equal(restored.score,125);}});
test('project choice follows recovery, unlocks the next area and survives retry without duplicate rewards',()=>{const s=L.fresh('workshop');assert.equal(L.act(s,'restore','canopy').ok,false);completeArea(s);assert.equal(L.nextStop(s),false);assert.equal(L.act(s,'restore','constructor').ok,false);assert.ok(L.act(s,'restore','shelf').ok);const points=s.score;assert.equal(L.act(s,'restore','canopy').ok,false);assert.equal(s.score,points);assert.ok(L.nextStop(s));L.act(s,'select',0);L.act(s,'route','containers');assert.equal(s.play.streak,7);L.retryStop(s);assert.equal(s.score,points);assert.equal(s.play.energy,6);assert.equal(s.play.restored[0],'shelf');assert.equal(s.play.streak,0);});
test('finale requires all tasks, six unique clouds and three charged pulses; partial battle resumes and retries',()=>{const s=L.fresh('school-tomorrow');assert.equal(L.act(s,'pulse').ok,false);for(let area=0;area<3;area++){completeArea(s);if(area<2)advance(s);}assert.equal(s.complete,false);assert.equal(s.play.energy,18);assert.equal(L.act(s,'pulse').ok,false);assert.equal(L.act(s,'wisp',4).ok,false);L.act(s,'wisp',0);assert.equal(L.act(s,'wisp',0).ok,false);L.act(s,'wisp',1);assert.ok(L.act(s,'pulse').ok);assert.equal(s.play.energy,12);assert.equal(s.play.bossHits,1);const save=freshSave();save.unlocked=4;for(const m of L.missions.slice(0,4))save.stars[m.id]=3;save.session=s;const resumed=L.normalize(JSON.parse(JSON.stringify(save))).session;assert.deepEqual(resumed,s);L.retryStop(resumed);assert.equal(resumed.play.energy,12);assert.equal(resumed.play.bossHits,0);assert.equal(resumed.play.wisps.length,0);assert.equal(Object.keys(resumed.play.restored).length,2);completeArea(resumed);winBattle(resumed);assert.equal(resumed.complete,true);assert.equal(L.finish(save,resumed),3);const score=resumed.score;assert.equal(L.act(resumed,'pulse').ok,false);assert.equal(resumed.score,score);});
test('v3.0 partial and completed story saves migrate without removing progress or requiring old tasks again',()=>{const s=L.fresh('lunch');L.act(s,'select',0);prepareItem(s,L.items.juice);L.act(s,'route','containers');delete s.play;const save=freshSave();save.unlocked=1;save.stars.workshop=3;save.session=s;const migrated=L.normalize(save);assert.equal(migrated.session.score,125);assert.deepEqual(migrated.session.done,[0]);assert.deepEqual(migrated.session.prepared,[0]);assert.equal(migrated.session.play.energy,1);const finale=L.fresh('school-tomorrow');for(let i=0;i<3;i++){completeArea(finale);if(i<2)advance(finale);}winBattle(finale);delete finale.play;save.unlocked=5;for(const m of L.missions)save.stars[m.id]=3;save.session=finale;const complete=L.normalize(save);assert.equal(complete.unlocked,5);assert.equal(complete.session.complete,true);assert.equal(complete.session.play.bossHits,3);assert.equal(complete.session.score,finale.score);});
test('malformed activity and boss saves fall back without executing inherited object properties',()=>{for(const patch of [{work:{'0-0':{type:'constructor',done:[]}}},{work:'bad'},{restored:{0:'toString'}},{wisps:[0,0]},{bossHits:4},{energy:-1}]){const s=L.fresh('workshop');Object.assign(s.play,patch);assert.equal(L.validSession(s),false);const save=freshSave();save.session=s;assert.equal(L.normalize(save).session,null);}});
test('sprite clips use all 24 bounded frames, deterministic looping and reduced-motion stills',()=>{const A=require('../public/games/recycle-rush/story-sprites.js');for(const[type,sheet]of Object.entries(A.sheets)){assert.ok(fs.existsSync(path.join(root,sheet.src)));for(const[pose,frames]of Object.entries(sheet.clips)){for(let time=0;time<12;time+=.13){const frame=A.frameAt(type,pose,time),rect=A.rect(type,frame);assert.ok(frames.includes(frame));assert.ok(rect.x>=0&&rect.y>=0&&rect.x+256<=sheet.columns*256&&rect.y+256<=sheet.rows*256);assert.equal(A.frameAt(type,pose,time,true),frames[0]);}}assert.equal(A.rect(type,99),null);}assert.equal(new Set(Object.values(A.sheets.circuit.clips).flat()).size,16);assert.equal(new Set(Object.values(A.sheets.grime.clips).flat()).size,8);});
test('new art has exact provenance hashes, valid WebP files and a sub-megabyte total budget',()=>{const crypto=require('node:crypto'),dir=path.join(root,'assets/animated'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));let bytes=0,count=0;for(const[file,entry]of Object.entries(manifest.assets)){if(!file.endsWith('.webp'))continue;const data=fs.readFileSync(path.join(dir,file));assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256);assert.equal(data.length,entry.bytes);bytes+=data.length;count++;}assert.equal(count,24);assert.ok(bytes<1024*1024);assert.equal(manifest.assets.circuit.frames,16);assert.equal(manifest.assets.grime.frames,8);assert.equal(manifest.assets.items.frames,16);assert.equal(manifest.assets.prepared.frames,4);for(const item of Object.values(L.items))assert.ok(fs.existsSync(path.join(root,item.legacyIcon)));});

test('prepared materials visibly change to empty, cleared or flat art without changing their accepted route',()=>{for(const id of ['box','juice','tray']){const item=L.items[id];assert.ok(item.preparedIcon);assert.notEqual(item.preparedIcon,item.icon);assert.ok(fs.existsSync(path.join(root,item.preparedIcon)));}assert.equal(L.items.juice.preparedIcon,L.items.bottle.icon);});
function touchHarness(){const input=require('../public/games/recycle-rush/story-input.js');class Target{constructor(){this.events={};this.disabled=false;}addEventListener(k,f){(this.events[k]??=[]).push(f);}emit(k,e){for(const f of this.events[k]||[]){if(e.stopped)break;f(e);}}contains(target){return this===target;}}const doc=new Target();let time=1000,dragging=false;doc.elementFromPoint=()=>doc.point;const bind=input.create(doc,()=>time,()=>dragging);const event=(extra={})=>({pointerType:'touch',button:0,pointerId:1,clientX:10,clientY:10,detail:1,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra});return{doc,bind,Target,advance(ms){time+=ms;},drag(value){dragging=value;},emit(target,type,props={}){const e=event(props);doc.point=target;doc.emit(type,e);if(!e.stopped)target.emit(type,e);return e;}};}
test('touch controls activate once when compatibility clicks are present or suppressed; keyboard still works',()=>{const h=touchHarness(),b=new h.Target();let calls=0;h.bind(b,()=>calls++);h.bind.suppressNextClick();h.emit(b,'click');assert.equal(calls,0);h.emit(b,'pointerdown');h.emit(b,'pointerup');assert.equal(calls,1);h.emit(b,'click');assert.equal(calls,1);h.advance(100);h.emit(b,'pointerdown');h.emit(b,'pointerup');assert.equal(calls,2);h.emit(b,'click',{detail:0});assert.equal(calls,3);});
test('closing a touch panel cannot click a control underneath; the next real touch is accepted',()=>{const h=touchHarness(),close=new h.Target(),underneath=new h.Target();let closes=0,sorts=0;h.bind(close,()=>closes++);h.bind(underneath,()=>sorts++);h.emit(close,'pointerdown');h.emit(close,'pointerup');const forwarded=h.emit(underneath,'click');assert.equal(forwarded.prevented,true);assert.equal(closes,1);assert.equal(sorts,0);h.emit(underneath,'pointerdown',{pointerId:2});h.emit(underneath,'pointerup',{pointerId:2});h.emit(underneath,'click');assert.equal(sorts,1);});
test('scroll movement, cancellation, second pointers and active drags cannot activate a touch control',()=>{const h=touchHarness(),b=new h.Target();let calls=0;h.bind(b,()=>calls++);h.emit(b,'pointerdown');h.emit(b,'pointerup',{clientY:60});assert.equal(calls,0);h.emit(b,'pointerdown');h.emit(b,'pointercancel');h.emit(b,'pointerup');assert.equal(calls,0);h.emit(b,'pointerdown',{pointerId:3});h.emit(b,'pointerdown',{pointerId:4});h.emit(b,'pointerup',{pointerId:4});assert.equal(calls,0);h.drag(true);h.emit(b,'pointerup',{pointerId:3});assert.equal(calls,0);h.drag(false);h.emit(b,'pointerdown',{pointerId:5});h.emit(b,'pointerup',{pointerId:5});assert.equal(calls,1);});


test('market requests gate every checkpoint, explain wrong plans, save choices and cannot farm score',()=>{
 for(const m of L.missions.slice(5,10)){
  const save=freshSave(),s=L.fresh(m.id);save.unlocked=L.missions.indexOf(m);for(const old of L.missions.slice(0,save.unlocked))save.stars[old.id]=3;
  assert.equal(L.act(s,'decision',m.requests[0].answer).ok,false);
  for(let stop=0;stop<3;stop++){
   completeArea(s);assert.equal(s.complete,false);assert.equal(L.finish(save,s),false);assert.equal(L.nextStop(s),false);assert.equal(L.act(s,'restore','canopy').ok,false);assert.equal(L.act(s,'pulse').ok,false);
   const q=m.requests[stop],wrong=q.choices.find(c=>c.id!==q.answer);const before=s.score,mistakes=s.mistakes;
   const result=L.act(s,'decision',wrong.id);assert.equal(result.ok,false);assert.match(result.text,/Try another plan/);assert.equal(s.mistakes,mistakes+1);assert.equal(s.score,before);
   assert.ok(L.act(s,'decision-hint').ok);assert.equal(s.hints,stop+1);save.session=s;
   const loaded=L.normalize(JSON.parse(JSON.stringify(save))).session;assert.deepEqual(loaded,s);
   assert.ok(L.act(s,'decision',q.answer).ok);assert.equal(s.score,before+50);assert.equal(L.act(s,'decision',q.answer).ok,false);assert.equal(s.score,before+50);
   assert.ok(L.validSession(s));save.session=s;assert.deepEqual(L.normalize(JSON.parse(JSON.stringify(save))).session,s);
   if(stop<2){assert.ok(advance(s));assert.equal(s.play.decisions[stop],q.answer);}
  }
  if(L.play.isBattle(m.id))winBattle(s);
  assert.equal(L.finish(save,s),2);
 }
});
test('retrying a market checkpoint resets only its decision and score, leaving earlier neighbours helped',()=>{
 const m=L.missions[5],s=L.fresh(m.id);completeArea(s);advance(s);const checkpoint=s.score;
 completeArea(s);answerRequest(s);assert.equal(s.score,checkpoint+725);assert.ok(s.play.decisions[1]);
 L.retryStop(s);assert.equal(s.score,checkpoint);assert.equal(s.play.decisions[0],m.requests[0].answer);assert.equal(s.play.decisions[1],undefined);assert.deepEqual(s.done,[]);assert.equal(s.play.energy,6);
 completeArea(s);assert.equal(L.nextStop(s),false);answerRequest(s);assert.equal(s.score,checkpoint+725);
});
test('v3.1 completed school campaign unlocks Market Morning without changing achievements or arcade keys',()=>{
 const save=freshSave();save.unlocked=5;for(const m of L.missions.slice(0,5)){save.stars[m.id]=3;save.results[m.id]={score:2000};}
 const s=L.fresh('school-tomorrow');for(let i=0;i<3;i++){completeArea(s);if(i<2)advance(s);}winBattle(s);delete s.play.decisions;save.session=s;
 const restored=L.normalize(JSON.parse(JSON.stringify(save)));assert.equal(restored.unlocked,5);assert.deepEqual(restored.stars,save.stars);assert.deepEqual(restored.results,save.results);assert.equal(restored.session.complete,true);assert.equal(L.missions[restored.unlocked].id,'market-morning');
 restored.session=L.fresh('market-morning');assert.ok(L.normalize(restored).session);restored.session=L.fresh('food-loop');assert.equal(L.normalize(restored).session,null);
});
test('forged community completion and malformed decision state are rejected; current mission counts stay consistent',()=>{
 const s=L.fresh('market-morning');for(let i=0;i<3;i++){completeArea(s);if(i<2)advance(s);}assert.equal(L.validSession({...s,complete:true}),false);
 for(const decisions of [[],null,JSON.parse('{"__proto__":"flatten"}'),{0:'constructor'},{2:'flatten'},{3:'flatten'}]){const altered=JSON.parse(JSON.stringify(s));altered.play.decisions=decisions;assert.equal(L.validSession(altered),false);}
 const metadata=JSON.parse(fs.readFileSync(path.join(root,'game.json')));assert.equal(metadata.features.storyMissions,L.missions.length);assert.equal(metadata.features.levels,L.missions.length+20);assert.equal(metadata.features.originalStoryMusicTracks,S.themes.length);assert.equal(metadata.features.communityRequests,L.missions.reduce((n,m)=>n+(m.requests?.length||0),0));
 for(const m of L.missions.slice(5))for(const q of m.requests){assert.equal(q.choices.length,3);assert.equal(new Set(q.choices.map(c=>c.id)).size,3);assert.equal(q.choices.filter(c=>c.id===q.answer).length,1);assert.ok(q.success.length>30);assert.ok(q.choices.every(c=>c.feedback.length>20));}
});

test('market backdrop is a bounded WebP with a matching provenance record and no replacement of old backgrounds',()=>{
 const crypto=require('node:crypto'),dir=path.join(root,'assets/backgrounds'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'market-art.json'))),data=fs.readFileSync(path.join(dir,manifest.asset));
 assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(crypto.createHash('sha256').update(data).digest('hex'),manifest.sha256);assert.equal(data.length,manifest.bytes);assert.ok(data.length<350000);assert.equal(manifest.width,1600);assert.equal(manifest.height,900);assert.ok(fs.existsSync(path.join(dir,'bg-community-day.png')));
});

function unlockedSave(index){const save=freshSave();save.unlocked=index;for(const m of L.missions.slice(0,index)){save.stars[m.id]=3;save.results[m.id]={score:2000};}return save;}
function dispatchArea(s){completeArea(s);answerRequest(s);assert.equal(L.dispatchReady(s),true);}
test('every collection plan has feasible visits, respects capacity and supports either load first',()=>{
 const D=L.dispatch;let boards=0;
 const permutations=values=>values.length?values.flatMap((v,i)=>permutations(values.filter((_,j)=>i!==j)).map(rest=>[v,...rest])):[[]];
 for(const m of L.missions.filter(m=>m.dispatch))for(const plan of m.dispatch){
  boards++;assert.equal(plan.loads.length,2);assert.ok(plan.loads.every(load=>load.spaces<=plan.capacity&&L.items[load.item]&&L.routes[load.route]&&m.destinations.includes(load.route)));
  const jobs=D.jobs(plan);assert.equal(new Set(jobs.map(j=>j.id)).size,4);
  const valid=permutations(jobs.map(j=>j.id)).filter(order=>D.read(plan,{done:order}));assert.ok(valid.length>=2,plan.title);
  for(const load of plan.loads)assert.ok(valid.some(order=>order[0]==='pickup-'+load.id),'either pickup can start');
  for(const order of valid)for(let n=0;n<=4;n++){const state=D.read(plan,{done:order.slice(0,n)});assert.ok(state.used>=0&&state.used<=plan.capacity);if(plan.separate)assert.ok(state.cargo.length<=1);assert.equal(D.complete(plan,{done:order.slice(0,n)}),n===4);}
  assert.equal(D.read(plan,{done:[jobs[1].id]}),null);assert.equal(D.read(plan,{done:[jobs[0].id,jobs[0].id]}),null);
  if(plan.capacity<4||plan.separate)assert.equal(D.read(plan,{done:[jobs[0].id,jobs[2].id]}),null);
 }
 assert.equal(boards,30);
});
test('dispatch gates progress, gives recoverable feedback and saves each real visit without duplicate score',()=>{
 for(const m of L.missions.filter(m=>m.dispatch)){
  const s=L.fresh(m.id),save=unlockedSave(L.missions.indexOf(m));
  assert.equal(L.act(s,'dispatch','pickup-paper').ok,false);
  for(let stop=0;stop<3;stop++){
   completeArea(s);const plan=m.dispatch[stop],jobs=L.dispatch.jobs(plan);assert.equal(L.act(s,'dispatch',jobs[0].id).ok,false);answerRequest(s);finishOrders(s);
   assert.equal(L.nextStop(s),false);assert.equal(L.act(s,'restore','canopy').ok,false);assert.equal(L.act(s,'pulse').ok,false);assert.equal(s.complete,false);
   let score=s.score;const wrong=L.act(s,'dispatch',jobs[1].id);assert.equal(wrong.ok,false);assert.match(wrong.text,/Collect/);assert.equal(s.score,score);assert.equal(s.mistakes,stop+1);
   assert.ok(L.act(s,'dispatch-hint').ok);assert.equal(s.hints,stop+1);
   for(const job of jobs){
    assert.ok(L.act(s,'dispatch',job.id).ok);score+=25;assert.equal(s.score,score);assert.equal(L.act(s,'dispatch',job.id).ok,false);assert.equal(s.score,score);
    save.session=s;const restored=L.normalize(JSON.parse(JSON.stringify(save))).session;assert.deepEqual(restored,s);assert.ok(L.validSession(s));
   }
   assert.ok(L.dispatch.complete(plan,s.play.dispatch[stop]));if(stop<2)assert.ok(advance(s));
  }
  if(L.play.isBattle(m.id))winBattle(s);assert.equal(L.finish(save,s),2);
 }
});
test('full and separate-load dispatch rejects the second pickup without losing the first load',()=>{
 for(const id of ['dry-store','centre-connections']){
  const s=L.fresh(id);dispatchArea(s);const m=L.missions.find(m=>m.id===id),jobs=L.dispatch.jobs(m.dispatch[0]);L.act(s,'dispatch',jobs[0].id);const saved=JSON.stringify(s.play.dispatch),score=s.score;
  const result=L.act(s,'dispatch',jobs[2].id);assert.equal(result.ok,false);assert.match(result.text,/room|apart/);assert.equal(JSON.stringify(s.play.dispatch),saved);assert.equal(s.score,score);
  assert.ok(L.act(s,'dispatch',jobs[1].id).ok);assert.ok(L.act(s,'dispatch',jobs[2].id).ok);assert.ok(L.act(s,'dispatch',jobs[3].id).ok);
 }
});
test('retry removes only the current dispatch and its rewards; previous records and accepted decisions survive',()=>{
 const s=L.fresh('collection-round');dispatchArea(s);finishDispatch(s);advance(s);const checkpoint=s.score,earlier=JSON.stringify(s.play.dispatch[0]);
 dispatchArea(s);const m=L.missions[10],job=L.dispatch.jobs(m.dispatch[1])[0];L.act(s,'dispatch',job.id);assert.ok(s.score>checkpoint);L.retryStop(s);
 assert.equal(s.score,checkpoint);assert.equal(s.play.dispatch[1],undefined);assert.equal(s.play.decisions[1],undefined);assert.equal(JSON.stringify(s.play.dispatch[0]),earlier);assert.ok(L.validSession(s));dispatchArea(s);finishDispatch(s);assert.ok(L.nextStop({...s,play:{...s.play,restored:{...s.play.restored,1:'shelf'}}}));
});
test('v3.2 completed market campaign unlocks mission eleven and keeps completed and partial market sessions',()=>{
 const save=unlockedSave(10),s=L.fresh('market-lights');for(let stop=0;stop<3;stop++){completeArea(s);answerRequest(s);if(stop<2)advance(s);}winBattle(s);save.session=s;
 const loaded=L.normalize(JSON.parse(JSON.stringify(save)));assert.equal(loaded.unlocked,10);assert.deepEqual(loaded.stars,save.stars);assert.deepEqual(loaded.results,save.results);assert.deepEqual(loaded.session,s);assert.equal(L.missions[loaded.unlocked].id,'collection-round');
 loaded.session=L.fresh('collection-round');assert.ok(L.normalize(loaded).session);loaded.session=L.fresh('dry-store');assert.equal(L.normalize(loaded).session,null);
 save.session=L.fresh('market-morning');completeArea(save.session);const pending=L.normalize(JSON.parse(JSON.stringify(save)));assert.equal(L.requestReady(pending.session),true);
});
test('forged or corrupt dispatch sequences cannot skip requests, capacity or earlier rounds',()=>{
 const m=L.missions[10],s=L.fresh(m.id),jobs=L.dispatch.jobs(m.dispatch[0]);dispatchArea(s);
 for(const map of [null,[],{0:{done:[jobs[1].id]}},{0:{done:[jobs[0].id,jobs[0].id]}},{0:{done:['constructor']}},{1:{done:[]}},{0:{done:'bad'}},JSON.parse('{"__proto__":{"done":[]}}')]){const altered=JSON.parse(JSON.stringify(s));altered.play.dispatch=map;assert.equal(L.validSession(altered),false);}
 const early=L.fresh(m.id);early.play.dispatch={0:{done:[]}};assert.equal(L.validSession(early),false);
 const f=L.fresh('recovery-rise');for(let stop=0;stop<3;stop++){completeArea(f);answerRequest(f);if(stop<2){finishDispatch(f);advance(f);}}
 assert.equal(L.act(f,'pulse').ok,false);assert.equal(L.validSession({...f,complete:true}),false);finishDispatch(f);winBattle(f);assert.equal(f.complete,true);
 delete f.play.dispatch[1];assert.equal(L.validSession(f),false);
 const metadata=JSON.parse(fs.readFileSync(path.join(root,'game.json')));assert.equal(metadata.features.collectionDispatchBoards,30);assert.equal(metadata.features.collectionDispatchVisits,120);assert.equal(metadata.features.storyShowdowns,Object.keys(L.play.battles).length);
});

test('recovery-district art decodes as bounded WebP bytes with a matching provenance record',()=>{
 const crypto=require('node:crypto'),dir=path.join(root,'assets/backgrounds'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'recovery-art.json'))),data=fs.readFileSync(path.join(dir,manifest.asset));
 assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(crypto.createHash('sha256').update(data).digest('hex'),manifest.sha256);assert.equal(data.length,manifest.bytes);assert.ok(data.length<350000);assert.equal(manifest.width,1600);assert.equal(manifest.height,900);
});


test('all 30 work orders support both check orders and reject premature approval, skipped handovers and shortcuts',()=>{
 const O=L.orders;let boards=0;
 for(const m of L.missions.filter(m=>m.orders))for(const plan of m.orders){
  boards++;assert.equal(plan.steps.length,4);assert.equal(plan.pitfalls.length,2);assert.deepEqual(new Set(plan.actions),new Set([...plan.steps,...plan.pitfalls].map(s=>s.id)));assert.ok(L.items[plan.item]);
  for(const checks of [['check','confirm'],['confirm','check']]){
   const order=[...checks,'team','record'];for(let n=0;n<=4;n++){const record={done:order.slice(0,n)};assert.ok(O.read(plan,record));assert.equal(O.complete(plan,record),n===4);if(n<4)assert.ok(O.next(plan,record));else assert.equal(O.next(plan,record),undefined);}
  }
  for(const done of [['team'],['record'],['check','team'],['confirm','team'],['check','check'],['unsafe'],['skip'],['constructor']])assert.equal(O.read(plan,{done}),null);
 }
 assert.equal(boards,30);
});
test('work-order actions gate progress, save partial checks, teach recoverable mistakes and reward each action once',()=>{
 for(const m of L.missions.filter(m=>m.orders)){
  const save=unlockedSave(L.missions.indexOf(m)),s=L.fresh(m.id);
  assert.equal(L.act(s,'order','check').ok,false);
  for(let stop=0;stop<3;stop++){
   completeArea(s);assert.equal(L.act(s,'order','check').ok,false);answerRequest(s);assert.equal(L.orderReady(s),true);
   assert.equal(L.act(s,'restore','canopy').ok,false);assert.equal(L.nextStop(s),false);assert.equal(L.act(s,'pulse').ok,false);if(m.dispatch)assert.equal(L.act(s,'dispatch',L.dispatch.jobs(m.dispatch[stop])[0].id).ok,false);
   const score=s.score;assert.match(L.act(s,'order','team').text,/both/);assert.equal(s.score,score);assert.equal(s.mistakes,stop+1);assert.ok(L.act(s,'order-hint').ok);assert.equal(s.hints,stop+1);
   for(const id of ['confirm','check','team','record']){
    const before=s.score;assert.ok(L.act(s,'order',id).ok);assert.equal(s.score,before+25);assert.equal(L.act(s,'order',id).ok,false);assert.equal(s.score,before+25);
    save.session=s;assert.deepEqual(L.normalize(JSON.parse(JSON.stringify(save))).session,s);
   }
   assert.equal(L.orderReady(s),false);finishDispatch(s);if(stop<2)assert.ok(advance(s));
  }
  if(L.play.isBattle(m.id))winBattle(s);assert.equal(L.finish(save,s),2);
 }
});
test('work-order retry resets only current checks, decisions and dispatch, preserving earlier projects and checkpoints',()=>{
 const s=L.fresh('school-to-square');completeArea(s);advance(s);const checkpoint=s.score,previous=JSON.stringify(s.play);
 completeArea(s);answerRequest(s);L.act(s,'order','unsafe');L.act(s,'order-hint');finishOrders(s);L.act(s,'dispatch',L.dispatch.jobs(L.missions[20].dispatch[1])[0].id);
 assert.ok(s.score>checkpoint);assert.ok(L.retryStop(s));assert.equal(s.score,checkpoint);assert.equal(s.mistakes,0);assert.equal(s.hints,0);assert.equal(s.play.orders[1],undefined);assert.equal(s.play.dispatch[1],undefined);assert.equal(s.play.decisions[1],undefined);
 const earlier=JSON.parse(previous);assert.deepEqual(s.play.orders[0],earlier.orders[0]);assert.deepEqual(s.play.dispatch[0],earlier.dispatch[0]);assert.equal(s.play.restored[0],earlier.restored[0]);assert.ok(L.validSession(s));
 completeArea(s);answerRequest(s);finishOrders(s);finishDispatch(s);assert.ok(advance(s));
});
test('v3.3 finished and partial recovery saves retain progress and unlock Repair Row without repeating old objectives',()=>{
 const save=unlockedSave(15),s=L.fresh('recovery-rise');for(let i=0;i<3;i++){completeArea(s);answerRequest(s);finishDispatch(s);if(i<2)advance(s);}winBattle(s);save.session=s;
 const loaded=L.normalize(JSON.parse(JSON.stringify(save)));assert.equal(loaded.unlocked,15);assert.equal(L.missions[loaded.unlocked].id,'repair-row');assert.deepEqual(loaded.session,s);assert.deepEqual(loaded.stars,save.stars);assert.deepEqual(loaded.results,save.results);
 loaded.session=L.fresh('repair-row');assert.ok(L.normalize(loaded).session);loaded.session=L.fresh('sharing-shelves');assert.equal(L.normalize(loaded).session,null);
 const old=L.fresh('load-by-load');completeArea(old);answerRequest(old);const job=L.dispatch.jobs(L.missions[13].dispatch[0])[0];L.act(old,'dispatch',job.id);save.session=old;assert.deepEqual(L.normalize(save).session,old);
});
test('forged work orders cannot skip checks, requests, prior areas, final deliveries or the last Grime showdown',()=>{
 const s=L.fresh('verdale-together');completeArea(s);answerRequest(s);
 for(const orders of [null,[],{0:{done:['team']}},{0:{done:['check','check']}},{0:{done:['constructor']}},{1:{done:[]}},{0:{done:'bad'}},JSON.parse('{"__proto__":{"done":[]}}')]){const altered=JSON.parse(JSON.stringify(s));altered.play.orders=orders;assert.equal(L.validSession(altered),false);}
 const early=L.fresh('repair-row');early.play.orders={0:{done:['check']}};assert.equal(L.validSession(early),false);
 const delivery=JSON.parse(JSON.stringify(s));delivery.play.dispatch={0:{done:[]}};assert.equal(L.validSession(delivery),false);
 for(let stop=0;stop<3;stop++){
  if(stop) {completeArea(s);answerRequest(s);}
  assert.equal(L.act(s,'wisp',0).ok,false);assert.equal(L.validSession({...s,complete:true}),false);finishOrders(s);assert.equal(L.act(s,'pulse').ok,false);finishDispatch(s);if(stop<2)advance(s);
 }
 assert.equal(s.complete,false);assert.equal(L.act(s,'pulse').ok,false);winBattle(s);assert.equal(s.complete,true);assert.ok(L.validSession(s));const save=unlockedSave(24);assert.equal(L.finish(save,s),3);assert.equal(L.normalize(save).unlocked,25);assert.equal(Object.keys(save.stars).length,25);
 for(const key of ['orders','dispatch']){const broken=JSON.parse(JSON.stringify(s));delete broken.play[key][1];assert.equal(L.validSession(broken),false);}
});
test('work-order metadata and two final chapter backgrounds match the shipped assets and bounded art budget',()=>{
 const metadata=JSON.parse(fs.readFileSync(path.join(root,'game.json'))),boards=L.missions.reduce((n,m)=>n+(m.orders?.length||0),0);assert.equal(metadata.features.communityWorkOrders,boards);assert.equal(metadata.features.communityWorkOrderActions,boards*4);assert.equal(metadata.features.completeStoryEnding,true);assert.equal(L.missions.at(-1).id,'verdale-together');assert.match(L.missions.at(-1).restoration,/whole|everyone/);
 const crypto=require('node:crypto'),dir=path.join(root,'assets/backgrounds'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'finale-art.json')));let bytes=0;for(const[file,entry]of Object.entries(manifest.assets)){const data=fs.readFileSync(path.join(dir,file));assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256);assert.equal(data.length,entry.bytes);assert.equal(entry.width,1600);assert.equal(entry.height,900);assert.ok(data.length<350000);bytes+=data.length;}assert.equal(Object.keys(manifest.assets).length,2);assert.ok(bytes<700000);
});

test('all eight arcade bosses use bounded idle, attack and hurt frames with reduced-motion stills',()=>{
 const A=require('../public/games/recycle-rush/arcade-art.js');assert.equal(A.bosses.length,8);assert.equal(new Set(A.bosses.map(b=>b.id)).size,8);
 for(let i=0;i<8;i++)for(const pose of ['idle','attack','hurt']){const frames=new Set();for(let t=0;t<3;t+=.07){const r=A.bossFrame(i,pose,t);frames.add(r.frame);assert.ok(r.x>=0&&r.x+256<=1024&&r.y===i%4*256&&r.y+256<=1024);assert.equal(r.src,A.bosses[i].sheet);assert.deepEqual(A.bossFrame(i,pose,t,true),A.bossFrame(i,pose,0,true));}assert.ok(pose==='hurt'?frames.size===1:frames.size>=2);}
 for(const[width,height,line]of[[320,180,90],[390,450,290],[844,150,90],[1440,650,540]]){const b=A.bossLayout(width,height,line);assert.ok(b.x-b.size/2>=0&&b.x+b.size/2<=width);assert.ok(b.y>=0&&b.y+b.size<=height);}
});
test('arcade drawing is read-only, consumes no gameplay randomness and keeps every boss on its own atlas row',async()=>{
 for(const level of [2,5,8,11,14,16,18,19]){
  const r=await boot(),p=r.probe;p.initLevel(level);p.spawnItem();const snapshot=JSON.stringify(p.state),random=r.randomCalls;r.paints.length=0;p.draw();p.draw();assert.equal(JSON.stringify(p.state),snapshot);assert.equal(r.randomCalls,random);
  const A=require('../public/games/recycle-rush/arcade-art.js'),boss=r.paints.find(paint=>paint.src===A.bosses[[2,5,8,11,14,16,18,19].indexOf(level)].sheet);assert.ok(boss);assert.equal(boss.args.length,8);assert.equal(boss.args[1],[2,5,8,11,14,16,18,19].indexOf(level)%4*256);
 }
});
test('arcade effects stay bounded, expire on simulation time and reset without touching gameplay or saves',()=>{
 const A=require('../public/games/recycle-rush/arcade-art.js');const context=new Proxy({},{get:()=>()=>{}}),settings={reducedMotion:false},art=A.create(context,()=>null,()=>settings,()=>null);
 for(let i=0;i<300;i++)art.emit('sort',{x:20,y:20,toX:40,toY:80,color:'#ffffff',text:'+108'},1);assert.equal(art.eventCount,16);art.advance(1.3);assert.equal(art.eventCount,16);art.advance(2);assert.equal(art.eventCount,0);settings.reducedMotion=true;art.emit('sort',{},3);art.advance(3.3);assert.equal(art.eventCount,0);art.emit('attack',{},4);art.reset();assert.equal(art.eventCount,0);
});
test('all four power sprites preserve pickup points, single activation and their original effects',async()=>{
 const A=require('../public/games/recycle-rush/arcade-art.js');for(const power of ['magnet','slow','shield','double']){
  const r=await boot(),p=r.probe;p.initLevel(9);const item={kind:'power',power,x:30,y:20,w:50,h:50,age:0,spin:0};p.state.items.push(item);p.handleCatch(item);assert.equal(p.state.score,75);assert.equal(p.state.power,power);p.update(.001);assert.equal(r.elements.get('powerIcon').src,A.icons[power]);assert.equal(r.elements.get('powerIcon').hidden,false);assert.equal(r.elements.get('powerBtn').disabled,false);
  p.usePower();assert.equal(p.state.power,null);const key={magnet:'magnetCharges',slow:'slowTime',shield:'shield',double:'doubleTime'}[power],amount=p.state[key];assert.equal(amount,{magnet:6,slow:8,shield:1,double:8}[power]);p.usePower();assert.equal(p.state[key],amount);p.update(.001);assert.equal(r.elements.get('powerBtn').disabled,true);
 }
});
test('sprite variations keep their original material and failed new art falls back without blocking arcade or story',async()=>{
 const A=require('../public/games/recycle-rush/arcade-art.js');assert.notEqual(A.itemArt('paper',0),A.itemArt('paper',1));assert.notEqual(A.itemArt('organic',0),A.itemArt('organic',1));assert.notEqual(A.itemArt('plastic',0),A.itemArt('plastic',1));assert.equal(A.itemArt('unknown'),null);
 for(const[category,list]of Object.entries(A.variants))for(let i=0;i<list.length;i++){const src=A.itemArt(category,i);assert.ok(fs.existsSync(path.join(root,src)));assert.match(src,/assets\/animated\//);}
 const normal=await boot();assert.equal(normal.requests.filter(src=>src.startsWith('assets/bosses/')).length,0);const r=await boot({failAssets:src=>src.startsWith('assets/arcade/')});assert.ok(r.requests.includes('assets/bosses/great-grime.png'));r.probe.initLevel(19);assert.doesNotThrow(()=>r.probe.draw());assert.ok(r.paints.some(p=>p.src==='assets/bosses/great-grime.png'));r.document.emit('recycle:story-open');assert.equal(r.probe.state.running,false);r.document.emit('recycle:story-exit');assert.equal(r.elements.get('levelValue').textContent,'Map');
});
test('new arcade art provenance, entry references and budget cover 32 boss frames and eight HUD/power icons',()=>{
 const A=require('../public/games/recycle-rush/arcade-art.js'),crypto=require('node:crypto'),dir=path.join(root,'assets/arcade'),manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));let bytes=0;
 for(const[file,entry]of Object.entries(manifest.assets)){const data=fs.readFileSync(path.join(dir,file));assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WEBP');assert.equal(data.length,entry.bytes);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256);bytes+=data.length;}
 assert.equal(Object.keys(manifest.assets).length,10);assert.ok(bytes<1024*1024);assert.equal(manifest.assets['bosses-a.webp'].frames+manifest.assets['bosses-b.webp'].frames,32);for(const src of A.assetPaths)assert.ok(fs.existsSync(path.join(root,src)));
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(html.indexOf('arcade-art.js')<html.indexOf('src="game.js"'));assert.ok(html.includes('id="powerSlotText"'));const metadata=JSON.parse(fs.readFileSync(path.join(root,'game.json')));assert.equal(metadata.features.arcadeBossFrames,32);assert.equal(metadata.features.arcadeBosses,8);assert.equal(metadata.features.arcadePowerSprites,4);
});
