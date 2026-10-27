'use strict';
// Continuous campaign regression. Completion is earned through interactions,
// core collection, real laser damage and portal entry, never seeded save flags.
// Positioning and invulnerability isolate progression; the chapter suites test
// physical routes, hazards, touch and damage separately. This is not a human run.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public'),names=['asterion','vulcanis','luminara','cryon','verdantis','novax'];
const files=['index.html',...names.slice(1).map(n=>n+'.html')],errors=[],failedAssets=[];
let browser;
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 try{
  let data=fs.readFileSync(file);
  if(file.endsWith('/space-pilot-platformer/game.js'))data=data.toString().replace('  state.world=buildLevel(profile.current);','  window.pilotQA={state,PLAYER,view,audio,images,chapter,Progress,get profile(){return profile;},get point(){return point;},update,draw,persist,shoot,jump,clearInput};\n  state.world=buildLevel(profile.current);');
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);
 }catch{res.writeHead(404).end();}
});
async function shot(page,name){
 if(!process.env.PILOT_SCREENSHOTS)return;
 await page.evaluate(async()=>{await document.fonts.ready;for(let i=0;i<3;i++)await new Promise(r=>requestAnimationFrame(r));});
 await page.waitForFunction(()=>{const c=document.querySelector('#gameCanvas');return c?.getContext('2d').getImageData(c.width>>1,c.height>>1,1,1).data[3]>0;});
 fs.mkdirSync(process.env.PILOT_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.PILOT_SCREENSHOTS,'campaign-'+name+'.png')});
}
async function hold(page,index){
 const result=await page.evaluate(index=>{
  const q=pilotQA,w=q.state.world,n=w.objectives[index];q.clearInput();q.PLAYER.invuln=10000;q.state.keys.KeyE=true;
  for(let frame=0;frame<1200&&!n.done;frame++){q.PLAYER.x=n.x;q.PLAYER.y=n.y+8;q.PLAYER.vx=q.PLAYER.vy=0;q.update(1/60);}
  q.clearInput();return {done:n.done,hint:q.state.interactionHint};
 },index);assert.equal(result.done,true,JSON.stringify({index,...result}));
}
async function fight(page,boss){
 const result=await page.evaluate(boss=>{
  const q=pilotQA,w=q.state.world,targets=w.enemies.filter(e=>e.alive&&(e.type==='boss')===boss);let shots=0;
  q.clearInput();q.PLAYER.invuln=10000;q.state.touch.shoot=true;
  for(const e of targets){
   for(let frame=0;frame<12000&&e.alive;frame++){
    q.PLAYER.x=e.x-180;q.PLAYER.y=e.y+7;q.PLAYER.vx=q.PLAYER.vy=0;q.PLAYER.dir=1;
    q.update(1/60);shots=Math.max(shots,w.enemyShots.length);
   }
   if(e.alive)return {alive:e.name||e.type,hp:e.hp,shielded:e.shielded,shots};
  }
  q.clearInput();return {alive:null,shots,toast:document.querySelector('#toast').textContent};
 },boss);assert.equal(result.alive,null,JSON.stringify(result));return result;
}
async function recover(page){
 const before=await page.evaluate(()=>{
  const q=pilotQA,p=q.state.world.platforms.find(p=>p.type==='ground'&&p.x>1200);q.clearInput();q.PLAYER.x=p.x+100;q.PLAYER.y=p.y-30;q.PLAYER.vx=0;q.PLAYER.vy=90;q.update(1/60);q.persist();
  return {score:q.state.score,point:q.point.platform,enemies:q.state.world.enemies.map(e=>e.hp),objectives:q.state.world.objectives.map(n=>n.done)};
 });
 await page.reload();await page.waitForFunction(()=>!!window.pilotQA);await page.locator('#startBtn').click();
 const after=await page.evaluate(()=>{const q=pilotQA;q.PLAYER.invuln=10000;return {score:q.state.score,point:q.point.platform,enemies:q.state.world.enemies.map(e=>e.hp),objectives:q.state.world.objectives.map(n=>n.done)};});assert.deepEqual(after,before);
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 const base=`http://127.0.0.1:${server.address().port}/games/space-pilot-platformer/`,context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&new URL(r.url()).pathname.startsWith('/games/'))failedAssets.push(r.url());});
 await page.goto(base+'novax.html?scores=0');assert.equal(await page.locator('#startBtn').isDisabled(),true);
 await page.goto(base+'original-route.html?scores=0');await page.locator('#startBtn').click();await page.locator('#menuBtn').click();const original=await page.evaluate(()=>localStorage.getItem('wga_space_pilot_campaign_v1'));
 await page.goto(base+'index.html?scores=0');await page.waitForFunction(()=>!!window.pilotQA);
 for(let chapterIndex=0;chapterIndex<6;chapterIndex++){
  if(chapterIndex===0)await page.goto(base+files[0]+'?scores=0');
  await page.waitForFunction(()=>!!window.pilotQA&&Object.values(pilotQA.images).every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.locator('#startBtn').isDisabled(),false);assert.equal(await page.locator('#missionList button:disabled').count(),4);
  if(chapterIndex>0)assert.deepEqual(await page.evaluate(()=>pilotQA.profile.settings),{music:.2,effects:.34,buttonScale:1.25,leftHanded:true,reducedMotion:true,aimAssist:true});
  await page.setViewportSize([{width:390,height:844},{width:844,height:390},{width:320,height:568},{width:1440,height:900},{width:390,height:844},{width:844,height:390}][chapterIndex]);
  await page.locator('#startBtn').click();await page.locator('#launchMission').click();
  if(chapterIndex===0){
   await page.locator('#menuBtn').click();
   if(await page.evaluate(()=>document.fullscreenEnabled&&!!document.documentElement.requestFullscreen)){
    const fullscreen=page.locator('#menuDialog [data-pilot-fullscreen]');
    await fullscreen.click();await page.waitForFunction(()=>!!document.fullscreenElement);
    await fullscreen.click();await page.waitForFunction(()=>!document.fullscreenElement);console.log('Actual pause-menu fullscreen enter/exit passed.');
   }
   await page.locator('#musicVolume').fill('0');assert.equal(await page.evaluate(()=>pilotQA.audio.music),null);
   await page.locator('#musicVolume').fill('20');await page.locator('#effectsVolume').fill('34');await page.locator('#buttonScale').fill('125');
   for(const id of ['leftHanded','reducedMotion','aimAssist'])await page.locator('#'+id).check();await page.locator('#resumeBtn').click();
  }
  for(let mission=0;mission<5;mission++){
   if(mission>0)await page.locator('#launchMission').click();
   assert.equal(await page.evaluate(()=>pilotQA.state.level),mission);
   assert.deepEqual(await page.evaluate(()=>pilotQA.profile.completed),Array.from({length:5},(_,i)=>i<mission));
   await fight(page,false);
   const count=await page.evaluate(()=>pilotQA.state.world.objectives.length),preBoss=chapterIndex===5&&mission===4?3:count;
   for(let i=0;i<preBoss;i++){await hold(page,i);if(mission===2&&i===0)await recover(page);}
   {
    const battle=await fight(page,true);assert.ok(battle.shots>0,'Boss must fire during the full-health fight');
    if(chapterIndex===5&&mission===4){assert.match(battle.toast,/secure the escape sequence/);assert.equal(await page.evaluate(()=>pilotQA.state.world.portal.open),false);await recover(page);for(let i=3;i<count;i++)await hold(page,i);}
   }
   const result=await page.evaluate(()=>{
    const q=pilotQA,w=q.state.world;q.PLAYER.invuln=10000;
    for(const core of w.cores){q.PLAYER.x=core.x;q.PLAYER.y=core.y;q.PLAYER.vx=q.PLAYER.vy=0;q.update(0);}
    q.update(0);const ready=w.portal.open;q.PLAYER.x=w.portal.x+35;q.PLAYER.y=w.portal.y+60;q.PLAYER.vx=q.PLAYER.vy=0;q.update(0);
    return {ready,status:q.state.status,completed:q.profile.completed.filter(Boolean).length,score:q.state.score,display:Number(document.querySelector('#scoreText').textContent)};
   });
   assert.equal(result.ready,true);assert.equal(result.completed,mission+1);assert.equal(result.status,mission===4?'ended':'briefing');assert.equal(result.score,result.display);
   console.log(`Continuous campaign ${chapterIndex*5+mission+1}/30: full-health laser combat, timed objectives, collected cores and portal transition passed.`);
  }
  const key='wga_space_pilot_'+names[chapterIndex]+'_v1';assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).completed.every(Boolean),key),true);
  await shot(page,names[chapterIndex]+'-report');
  const next=page.locator('#gameOverOverlay [data-chapter-continue]');
  if(chapterIndex<5){assert.equal(await next.isVisible(),true);assert.ok((await next.getAttribute('href')).endsWith(files[chapterIndex+1]));await next.click();}
  else {assert.equal(await next.count(),0);assert.equal(await page.locator('#endTitle').textContent(),'Starfall Network Restored');}
 }
 assert.equal(await page.evaluate(()=>localStorage.getItem('wga_space_pilot_campaign_v1')),original);
 for(const name of names)assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).completed.filter(Boolean).length,'wga_space_pilot_'+name+'_v1'),5);
 assert.deepEqual(errors,[]);assert.deepEqual(failedAssets,[]);
 await context.close();
 // Render every actual composer and all effects, with a virtual scheduling
 // clock feeding real OfflineAudioContext nodes. No substitute waveforms.
 const audioPage=await browser.newPage();const signatures=[];
 for(const file of files){
  await audioPage.goto(base+file+'?scores=0');
  const rendered=await audioPage.evaluate(async()=>{
   const composer=SpacePilotChapterAudio,result=[];
   for(let level=0;level<5;level++){
    const ctx=new OfflineAudioContext(1,44100*6,44100),gain=ctx.createGain();gain.connect(ctx.destination);let clock=0;const schedules=[];
    const wrapped=new Proxy(ctx,{get:(target,key)=>{if(key==='currentTime')return clock;if(key==='state')return 'running';const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
    const originalInterval=window.setInterval;window.setInterval=callback=>{schedules.push(callback);return schedules.length;};
    try{composer.music({ctx:wrapped,musicGain:gain},level,()=>.8);for(clock=.07;clock<5.6;clock+=.07)for(const schedule of schedules)schedule();}finally{window.setInterval=originalInterval;}
    const data=(await ctx.startRendering()).getChannelData(0);let peak=0,power=0,signature=0;
    for(let i=0;i<data.length;i++){if(!Number.isFinite(data[i]))throw Error('Nonfinite music');peak=Math.max(peak,Math.abs(data[i]));power+=data[i]*data[i];signature+=data[i]*(i%97);}
    result.push({level,peak,power:power/data.length,signature:signature.toFixed(4)});
   }
   for(const name of ['jump','collect','shoot','hurt','boom','boss','power']){
    const ctx=new OfflineAudioContext(1,44100,44100),gain=ctx.createGain();gain.connect(ctx.destination);composer.effect({ctx,sfxGain:gain},name);
    const data=(await ctx.startRendering()).getChannelData(0);let peak=0;for(const v of data){if(!Number.isFinite(v))throw Error('Nonfinite '+name);peak=Math.max(peak,Math.abs(v));}if(!(peak>.001&&peak<.98))throw Error('Effect '+name+' peak '+peak);
   }
   return result;
  });
  for(const track of rendered){assert.ok(track.peak>.01&&track.peak<.98&&track.power>.000001,JSON.stringify(track));signatures.push(track.signature);}
  console.log(file+': five audible music renders and seven finite effects passed.');
 }
 assert.equal(new Set(signatures).size,30);await audioPage.close();console.log('All 30 missions completed in one storage context; 30 distinct tracks and 42 chapter effect renders passed.');
})().catch(e=>{console.error(e);console.error({errors,failedAssets});process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
