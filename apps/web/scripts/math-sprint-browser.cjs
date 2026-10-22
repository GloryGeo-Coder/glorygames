/* Optional browser QA: PLAYWRIGHT_MODULE=/path/to/playwright-core CHROMIUM_EXECUTABLE=/path/to/chrome node apps/web/scripts/math-sprint-browser.cjs */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),os=require('node:os');
const L=require('../public/games/math-sprint-arena/learning-data.js'),root=path.resolve(__dirname,'../public');
const output=process.env.MATH_QA_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'math-sprint-qa-'));fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const route=decodeURIComponent(req.url.split('?')[0]);const file=path.resolve(root,'.'+route,route.endsWith('/')?'index.html':'');if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{let browser;const results=[];try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});
 const url=`http://127.0.0.1:${server.address().port}/games/math-sprint-arena/?scores=0`;
 for(const[width,height,touch]of [[320,568,true],[568,320,true],[390,844,true],[844,390,true],[768,1024,true],[1024,768,true],[1160,700,false],[1280,600,false],[1440,900,false]].filter(s=>!process.env.MATH_QA_WIDTH||process.env.MATH_QA_WIDTH.split(',').map(Number).includes(s[0]))){
  console.log(`Checking ${width}x${height}`);const context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch,reducedMotion:'reduce'}),page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>{if(!r.failure()?.errorText.includes('ERR_ABORTED'))errors.push(`${r.url()}: ${r.failure()?.errorText}`);});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const tap=async sel=>touch?page.locator(sel).tap():page.locator(sel).click();
  const bounds=async selector=>{const b=await page.locator(selector).boundingBox();assert.ok(b&&b.width>0&&b.height>0,`${width} ${selector} visible`);assert.ok(b.x>=-1&&b.y>=-1&&b.x+b.width<=width+1&&b.y+b.height<=page.viewportSize().height+1,`${width} ${selector}: ${JSON.stringify(b)}`);};
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight+1),`${width}: page overflow`);
  const enter=async t=>{
   if(t.kind==='place'){const digits=String(t.value).padStart(4,'0').split('').map(Number),current=String(await page.locator('#entryValue').textContent()).padStart(4,'0').split('').map(Number);for(let i=0;i<4;i++){const delta=(digits[i]-current[i]+10)%10,dir=delta<=5?0:1,count=Math.min(delta,10-delta);for(let n=0;n<count;n++)await tap(`.place-column:nth-child(${i+1}) button:nth-of-type(${dir+1})`);}}
   else if(t.kind==='fraction'){for(let i=0;i<t.take;i++)await tap(`.fraction-parts button:nth-child(${i+1})`);}
   else{const old=await page.locator('#entryValue').textContent();if(old!=='…')for(let i=0;i<old.length;i++)await tap('[data-key="delete"]');for(const key of t.answer)await tap(`[data-key="${key}"]`);}
   await tap('#learningCheck');assert.match(await page.locator('#feedbackText').textContent(),/Solved/);await bounds('#learningNext');
  };
  await page.goto(url);await page.waitForFunction(()=>window.__wgaGameTab&&window.MathArenaApp);assert.equal(await page.locator('.mission-choice:disabled').count(),9);await page.screenshot({path:path.join(output,`${width}-home.png`)});
  await tap('#adventureStart');await noOverflow();await bounds('#learningPrompt');await bounds('#learningCheck');await bounds('#responsePanel');
  await tap('#learningCheck');assert.match(await page.locator('#feedbackText').textContent(),/Not quite/);await tap('#learningHint');assert.match(await page.locator('#feedbackText').textContent(),/Hint 1\/3/);await page.screenshot({path:path.join(output,`${width}-place.png`)});
  // An in-progress manipulative and hint checkpoint survives a real reload.
  await tap('.place-column:nth-child(1) button:first-of-type');await page.reload();await tap('#adventureStart');assert.equal(await page.locator('#entryValue').textContent(),'1000');assert.match(await page.locator('#feedbackText').textContent(),/Hint 1\/3/);
  for(const t of L.missions[0].tasks){await enter(t);await tap('#learningNext');}
  assert.match(await page.locator('#summaryResult').textContent(),/4 independent · 1 with support/);await tap('#summaryHome');assert.equal(await page.locator('.mission-choice:disabled').count(),8);
  const full=width===390;
  if(full){
   for(let m=1;m<L.missions.length;m++){
    await tap(`.mission-choice[data-mission="${m}"]`);
    for(let j=0;j<5;j++){
     const t=L.missions[m].tasks[j];await bounds('#learningPrompt');await bounds('#learningCheck');await noOverflow();
     if(m===1&&j===1){await tap('[data-key="5"]');await page.reload();await tap('#adventureStart');assert.equal(await page.locator('#entryValue').textContent(),'5');assert.equal(await page.locator('#taskCount').textContent(),'2 / 5');}
     await enter(t);await tap('#learningNext');
    }
    if(m===8)await page.screenshot({path:path.join(output,'390-fraction-complete.png')});await tap('#summaryHome');
   }
   assert.equal(await page.locator('.mission-choice:disabled').count(),0);assert.equal(await page.locator('#chapterProgress').textContent(),'10 / 10');
  }
  // Every visual type must fit the current viewport, including the longest word problems.
  await page.locator('#practiceBrowse').check();
  for(const [m,task]of [[1,0],[2,0],[4,4],[5,0],[6,0],[7,4],[8,0],[9,4]]){
   await tap(`.mission-choice[data-mission="${m}"]`);
   for(let j=0;j<task;j++){await enter(L.missions[m].tasks[j]);await tap('#learningNext');}
   await noOverflow();await bounds('#learningPrompt');await bounds('#learningCheck');await bounds('#responsePanel');
   for(const b of await page.locator('#responsePanel button').all()){const box=await b.boundingBox();assert.ok(box.y>=0&&box.y+box.height<=height+1&&box.width>=43&&box.height>=43,`${width}: touch target ${JSON.stringify(box)}`);}
   await page.screenshot({path:path.join(output,`${width}-mission-${m+1}.png`)});await tap('#arenaHome');await page.locator('#practiceBrowse').check();
  }
  // Practice has separate checkpoints and never submits learning results to the score bridge.
  const before=await page.evaluate(()=>({results:window.MathArenaApp.profile.results,best:window.__wgaGameTab.scoreBridge.state().best}));
  await tap('.mission-choice[data-mission="8"]');for(const t of L.missions[8].tasks){await enter(t);await tap('#learningNext');}
  assert.match(await page.locator('#summaryMode').textContent(),/Learn/);assert.deepEqual(await page.evaluate(()=>window.MathArenaApp.profile.results),before.results);assert.equal(await page.evaluate(()=>window.__wgaGameTab.scoreBridge.state().best),before.best);await tap('#summaryHome');
  // Actual audio unlock, independent volumes and one platform fullscreen control.
  await tap('#arenaMenu > summary');await page.locator('#musicVolume').focus();await page.keyboard.press('Home');for(let n=0;n<4;n++)await page.keyboard.press('ArrowRight');await page.locator('#effectsVolume').focus();await page.keyboard.press('Home');for(let n=0;n<10;n++)await page.keyboard.press('ArrowRight');assert.deepEqual(await page.evaluate(()=>window.MathArenaApp.profile.settings),{music:.2,sfx:.5});
  if(await page.locator('.wga-tab-fullscreen').count()){assert.equal(await page.locator('#arenaMenuBody .wga-tab-fullscreen').count(),1);await tap('.wga-tab-fullscreen');await page.waitForFunction(()=>document.fullscreenElement);await tap('.wga-tab-fullscreen');await page.waitForFunction(()=>!document.fullscreenElement);}
  await tap('#arenaMenu > summary');await tap('#sprintStart');await page.waitForFunction(()=>window.MathSprintLegacy.ready);await tap('#startBtn');await bounds('#answerPad');await bounds('#pauseBtn');await bounds('#questionText');await noOverflow();await page.screenshot({path:path.join(output,`${width}-sprint.png`)});
  const question=await page.locator('#questionText').textContent(),[a,b]=question.match(/\d+/g).map(Number);await page.locator('#answerPad button').filter({hasText:new RegExp(`^${a+b}$`)}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('wga_math_sprint_arena_v4_sprint'))?.round===1);
  await tap('#pauseBtn');const checkpoint=await page.evaluate(()=>JSON.parse(localStorage.getItem('wga_math_sprint_arena_v4_sprint')));await page.reload();await tap('#sprintStart');await page.waitForFunction(()=>window.MathSprintLegacy.ready);assert.equal(await page.locator('#questionText').textContent(),checkpoint.question.text);await tap('#startBtn');await tap('#skipBtn');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('wga_math_sprint_arena_v4_sprint')).round),checkpoint.round);
  await tap('#arenaHome');assert.deepEqual(errors,[]);results.push({width,height,errors:errors.length});await context.close();
 }
 // Storage and Web Audio can both be denied without preventing learning or Sprint.
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});window.AudioContext=class{constructor(){throw Error('blocked');}};window.webkitAudioContext=undefined;});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.locator('#adventureStart').tap();await page.locator('#learningHint').tap();assert.match(await page.locator('#saveStatus').textContent(),/unavailable/);await page.locator('#arenaHome').tap();await page.locator('#sprintStart').tap();await page.waitForFunction(()=>window.MathSprintLegacy.ready);await page.locator('#startBtn').tap();assert.deepEqual(errors,[]);await context.close();
 // Normal-motion animation, real Web Audio unlock and live orientation changes retain the task.
 const rotating=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const rotated=await rotating.newPage();await rotated.goto(url);await rotated.locator('#adventureStart').tap();await rotated.locator('#learningHint').tap();await rotated.waitForFunction(()=>document.getElementById('coachSprite').naturalWidth>0);assert.equal(await rotated.evaluate(()=>window.MathSound.available),true);assert.equal(await rotated.locator('#coachSprite').evaluate(e=>getComputedStyle(e).animationName),'float-bot');await rotated.locator('.place-column:first-child button:first-of-type').tap();
 for(const size of [{width:844,height:390},{width:568,height:320},{width:320,height:568}]){await rotated.setViewportSize(size);assert.equal(await rotated.locator('#entryValue').textContent(),'1000');assert.equal(await rotated.locator('#taskCount').textContent(),'1 / 5');for(const selector of ['#learningPrompt','#learningCheck','#learningHint']){const b=await rotated.locator(selector).boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=size.width+1&&b.y+b.height<=size.height+1);}}
 await rotated.emulateMedia({reducedMotion:'reduce'});assert.equal(await rotated.locator('#coachSprite').evaluate(e=>getComputedStyle(e).animationName),'none');await rotating.close();results.push({check:'normal animation, live rotation, Web Audio and reduced motion',passed:true});
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({output,results}));
 }finally{await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
