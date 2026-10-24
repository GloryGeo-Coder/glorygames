/* Run with PLAYWRIGHT_PATH and CHROME_BIN, or an installed playwright + browser. */
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const A=require('../public/games/physics-force-lab/adventure-data.js'),root=path.resolve(__dirname,'../public');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}if(file.endsWith(path.sep))file+='index.html';try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
const errors=[],shots=process.env.PHYSICS_SCREENSHOTS;
let browser;
async function begin(page){await page.locator('#startBtn').click();await page.locator('#storyContinue').click();}
async function moveTo(page,text){await page.keyboard.down('d');try{await page.waitForFunction(t=>document.getElementById('prompt').textContent.includes(t),text,{timeout:16000});}finally{await page.keyboard.up('d');}await page.waitForTimeout(100);}
async function setRange(page,value){const range=page.locator('#equipment input[type=range]');await range.focus();await range.press('Home');const min=Number(await range.getAttribute('min')),step=Number(await range.getAttribute('step'))||1;for(let n=min;n<value;n+=step)await range.press('ArrowRight');}
async function setWires(page,value){for(let i=0;i<9;i++){const tile=page.locator(`[data-wire="${i}"]`);if(await tile.isDisabled())continue;const current=Number(await tile.getAttribute('data-rotation'));for(let turn=0;turn<(Number(value[i])-current+4)%4;turn++)await tile.tap();}}
async function setSupplyRoute(page,target){
  const first=page.locator(`[data-stage="${target[0]}"][data-shift="-1"]`);if(await first.isEnabled()){await first.focus();await first.press('Enter');}
  for(let i=0;i<3;i++){
    const stage=target[i];
    while(await page.locator('#equipment .supply-order li').evaluateAll((rows,id)=>rows.findIndex(row=>row.querySelector('button').dataset.stage===id),stage)>i)await page.locator(`[data-stage="${stage}"][data-shift="-1"]`).click();
  }
}
async function solve(page,mi,si,first=false){
  const m=A.missions[mi],e=A.experiment(m,si);await page.locator('#interactAdventure').click();assert.equal(await page.locator('#labTitle').textContent(),m.stations[si].name);
  await page.getByRole('button',{name:e.predictions[0],exact:true}).click();
  if(first){await page.locator('#runTest').click();assert.match(await page.locator('#testResult').textContent(),/not reached/);await page.locator('#hintBtn').click();assert.ok((await page.locator('#labHint').textContent()).length>20);}
  if(e.needsComparison){await page.locator('#runTest').click();assert.equal(await page.locator('#reflectStep').isVisible(),false);}
  if(mi===7&&si===0){
    const firstWire=page.locator('[data-wire="0"]');await firstWire.focus();await firstWire.press('Enter');assert.equal(await firstWire.getAttribute('data-rotation'),'1');await page.locator('#hintBtn').click();await page.locator('#hintBtn').click();
    await page.locator('#leaveLab').click();await page.reload();await begin(page);await page.locator('#interactAdventure').click();assert.equal(await page.locator('[data-wire="0"]').getAttribute('data-rotation'),'1');assert.match(await page.locator('#labHint').textContent(),/above the middle row/);
  }
  const values=[[3,4,6],[20,15,12],['free','free','free'],[5,7,9],['copper','copper','copper'],[2,3,4],[4,6,8],[],[0,180,90],[6,'120301003',180],[25,75,100],['copper','wood','steel'],['bottom','top','black'],['wool','wool','wool'],['wood','shiny','wool'],['gain','gain','lose'],[2,3,3],['middle','smooth','water'],['glass','prism','overlap'],[5,'parallel-break','wide'],[40,60,20],['moon',5,'S'],[2,2,120],[2,'parallel','low-high'],['copper','012','led']];
  if(e.type==='supply-route')await setSupplyRoute(page,values[mi][si]);else if(e.type==='grid')await setWires(page,m.stations[si].board.solution);else if(e.options)await page.locator('#equipment select').selectOption(values[mi][si]);else await setRange(page,values[mi][si]);
  await page.locator('#runTest').click();assert.match(await page.locator('#testResult').textContent(),/Target reached/);
  if(mi===15&&si===0){
    assert.match(await page.locator('#labVisual').getAttribute('aria-label'),/Only electrons transfer/);
    await page.locator('#hintBtn').click();await page.locator('#hintBtn').click();
    await page.getByRole('button',{name:e.answers[1],exact:true}).click();assert.equal(await page.locator('#finishLab').isVisible(),false);
    await page.locator('#leaveLab').click();await page.reload();await begin(page);await page.locator('#interactAdventure').click();
    assert.equal(await page.locator('#equipment select').inputValue(),'gain');assert.equal(await page.locator('#trialHistory li').count(),2);assert.match(await page.locator('#labHint').textContent(),/negative rod/);
    await page.locator('#runTest').click();
  }
  if(mi>=15&&si===0){
    for(const [width,height]of [[320,568],[360,740],[375,667],[568,320],[844,390],[768,1024],[1024,768],[1440,900],[390,844]]){
      await page.setViewportSize({width,height});await page.locator('#labVisual').scrollIntoViewIfNeeded();
      const b=await page.locator('#labVisual').boundingBox();assert.ok(b.x>=0&&b.x+b.width<=width+1);assert.equal(await page.locator('#labVisual svg').count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      const select=page.locator('#equipment select');if(await select.count()){const box=await select.boundingBox();assert.ok(box.width<=width&&box.height>=44);}
    }
    if(shots){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,`grade${e.grade}-mission-${mi+1}.png`)});}
  }
  if(mi===24&&si===1){
    assert.match(await page.locator('#testResult').textContent(),/3\/3 stages/);
    await page.locator('#hintBtn').click();await page.locator('#hintBtn').click();await page.getByRole('button',{name:e.answers[1],exact:true}).click();assert.equal(await page.locator('#finishLab').isVisible(),false);
    await page.locator('#leaveLab').click();await page.reload();await begin(page);await page.locator('#interactAdventure').click();
    assert.deepEqual(await page.locator('.supply-order li').evaluateAll(rows=>rows.map(row=>row.querySelector('button').dataset.stage)),['0','1','2']);assert.equal(await page.locator('#trialHistory li').count(),2);assert.match(await page.locator('#labHint').textContent(),/Generator first/);
    await page.locator('#runTest').click();
    for(const [width,height]of [[320,568],[360,740],[375,667],[568,320],[844,390],[768,1024],[1024,768],[1440,900],[390,844]]){
      await page.setViewportSize({width,height});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      for(const b of await page.locator('.supply-order button').all()){const rect=await b.boundingBox();assert.ok(rect.width>=44&&rect.height>=44);}
      await page.locator('.supply-order').scrollIntoViewIfNeeded();await page.locator('.supply-order li').last().scrollIntoViewIfNeeded();
    }
    if(shots){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,'grade9-supply-route.png')});}
  }
  if(mi===13&&si===0){
    assert.equal(await page.locator('#measurementTable tbody tr').count(),6);assert.equal(await page.locator('#measurementTable tbody tr').last().locator('td').first().textContent(),'66.7');
    await page.locator('#hintBtn').click();await page.locator('#hintBtn').click();await page.getByRole('button',{name:e.answers[1],exact:true}).click();assert.equal(await page.locator('#finishLab').isVisible(),false);
    await page.locator('#leaveLab').click();await page.reload();await begin(page);await page.locator('#interactAdventure').click();assert.equal(await page.locator('#equipment select').inputValue(),'wool');assert.equal(await page.locator('#trialHistory li').count(),2);assert.match(await page.locator('#labHint').textContent(),/no extra wrap with wool/);assert.equal(await page.locator('#measurementTable tbody tr').count(),6);
    await page.locator('#runTest').click();
    for(const [width,height]of [[320,568],[360,740],[375,667],[390,844],[568,320],[844,390],[768,1024],[1024,768],[1440,900]]){
      await page.setViewportSize({width,height});await page.locator('#measurementTable').scrollIntoViewIfNeeded();const b=await page.locator('#measurementTable').boundingBox();assert.ok(b.x>=0&&b.x+b.width<=width+1);await page.locator('#measurementTable tbody tr').last().scrollIntoViewIfNeeded();const last=await page.locator('#measurementTable tbody tr').last().boundingBox();assert.ok(last.y>=0&&last.y+last.height<=height+1);
    }
    await page.setViewportSize({width:390,height:844});if(shots){fs.mkdirSync(shots,{recursive:true});await page.locator('#labVisual').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(shots,'grade7-temperature-table.png')});}
  }
  if(first){
    await page.getByRole('button',{name:e.answers[1],exact:true}).click();assert.equal(await page.locator('#finishLab').isVisible(),false);
    await page.locator('#leaveLab').click();await page.reload();await begin(page);await page.locator('#interactAdventure').click();
    assert.equal(await page.locator('#equipment input').inputValue(),'3');assert.equal(await page.locator('#trialHistory li').count(),2);
    await page.locator('#runTest').click();
  }
  if(mi===7&&si===0){
    for(const [width,height]of [[320,568],[568,320],[1440,900],[390,844]]){
      await page.setViewportSize({width,height});await page.locator('.wire-board').scrollIntoViewIfNeeded();const b=await page.locator('.wire-board').boundingBox();assert.ok(b.x>=0&&b.x+b.width<=width+1);assert.equal(await page.locator('.wire-tile').count(),9);
      for(const tile of await page.locator('.wire-tile').all()){const rect=await tile.boundingBox();assert.ok(rect.width>=44&&rect.height>=44);}
    }
    if(shots){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,'recovery-wire-board.png')});}
  }
  await page.getByRole('button',{name:e.answers[0],exact:true}).click();await page.locator('#finishLab').click();
  assert.match(await page.locator('#missionStats').textContent(),new RegExp(`${si+1}/3 repairs`));
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/games/physics-force-lab/index.html?scores=0`;
  browser=await chromium.launch({headless:true,...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{}),args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const start=process.env.PHYSICS_CHAPTER?(Number(process.env.PHYSICS_CHAPTER)-1)*5:0;
  if(start){
    const old={version:1,current:start-1,completed:{},records:{},checkpoints:{},settings:{music:.45,effects:.7,reduced:false}};
    for(const mission of A.missions.slice(0,start)){old.completed[mission.id]=true;old.checkpoints[mission.id]={x:A.route(mission).end,solved:[0,1,2],cells:[],labs:{}};}
    await context.addInitScript(({key,old})=>{if(!localStorage.getItem(key)){localStorage.setItem(key,JSON.stringify(old));localStorage.setItem('wga_physics_force_lab_v3_best','98765');}},{key:A.SAVE_KEY,old});
  }
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await begin(page);
  if(!process.env.PHYSICS_SMOKE){for(let mi=start;mi<A.missions.length;mi++){
    for(let si=0;si<3;si++){await moveTo(page,A.missions[mi].stations[si].name);await solve(page,mi,si,mi===0&&si===0);
      if(mi===5&&si===0){await page.keyboard.down('d');await page.waitForTimeout(1150);await page.keyboard.press('Space');await page.waitForTimeout(1050);await page.keyboard.up('d');await page.locator('#pauseAdventure').click();const p=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),A.SAVE_KEY);if(shots){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,'platform-check.png')});}assert.ok(p.checkpoints['sound-garden'].cells.includes(3),`jump did not reach optional platform cell: ${JSON.stringify(p.checkpoints['sound-garden'])}`);await page.locator('#resumeAdventure').click();}
    }
    await moveTo(page,'Restore district');await page.locator('#interactAdventure').click();
    assert.equal(await page.locator('#storyGrade').textContent(),'DISTRICT RESTORED');
    const p=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),A.SAVE_KEY);assert.equal(p.completed[A.missions[mi].id],true);
    console.log(`Phone campaign: mission ${mi+1} completed through real movement and experiment controls`);
    await page.locator('#storyContinue').click();if(mi<A.missions.length-1)await page.locator('#storyContinue').click();
  }
  assert.equal((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),A.SAVE_KEY)).completed[A.missions.at(-1).id],true);
  await page.locator('[data-close="mapDialog"]').click();await page.locator('#pauseAdventure').click();await page.locator('#pauseNotebook').click();assert.equal(await page.locator('#notebookEntries details').count(),A.missions.length*3);await page.locator('#notebookEntries summary').last().click();assert.ok((await page.locator('#notebookEntries details').last().textContent()).includes(A.experiment(A.missions.length-1,2).concept));await page.locator('[data-close="notebookDialog"]').click();await page.locator('#retryMission').click();await page.locator('#storyContinue').click();await page.locator('#pauseAdventure').click();await page.locator('#pauseNotebook').click();assert.equal(await page.locator('#notebookEntries details').count(),A.missions.length*3);
  if(start)assert.equal(await page.evaluate(()=>localStorage.getItem('wga_physics_force_lab_v3_best')),'98765');
  }
  await context.close();
  const sizes=process.env.PHYSICS_SMOKE?[[390,844],[568,320]]:[[320,568],[360,740],[375,667],[390,844],[568,320],[844,390],[768,1024],[1024,768],[1440,900]];
  for(const [w,h]of sizes){
    const c=await browser.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<900}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow ${w}x${h}`);
    await begin(p);
    if(w===390){
      await p.locator('#settingsBtn').click();
      const full=p.locator('#settingsDialog .wga-tab-fullscreen');
      if(await full.count()){await full.click();await p.waitForFunction(()=>!!document.fullscreenElement);await full.click();await p.waitForFunction(()=>!document.fullscreenElement);}
      await p.locator('#musicVolume').focus();await p.locator('#musicVolume').press('Home');assert.equal(await p.locator('#musicOutput').textContent(),'0%');
      await p.locator('[data-close="settingsDialog"]').click();
    }
    for(const id of ['moveLeft','moveRight','jumpAdventure','interactAdventure','missionsBtn','settingsBtn','pauseAdventure']){const b=await p.locator('#'+id).boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=w+1&&b.y+b.height<=h+1,`${id} outside ${w}x${h}`);assert.ok(b.height>=44,`${id} too short`);}
    const play=await p.locator('.playfield').boundingBox(),controls=await p.locator('.controlbar').boundingBox();assert.ok(play.y+play.height<=controls.y+1);assert.ok(play.height>=150);
    // Two concurrent touches must independently reach movement and jump.
    const cd=await c.newCDPSession(p),right=await p.locator('#moveRight').boundingBox(),jump=await p.locator('#jumpAdventure').boundingBox();
    await p.evaluate(()=>{window.touchLog=[];for(const id of ['moveRight','jumpAdventure'])document.getElementById(id).addEventListener('pointerdown',()=>window.touchLog.push(id));});
    const points=[{x:right.x+right.width/2,y:right.y+right.height/2,id:1},{x:jump.x+jump.width/2,y:jump.y+jump.height/2,id:2}];
    await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await p.waitForTimeout(2300);await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.deepEqual(await p.evaluate(()=>touchLog),['moveRight','jumpAdventure']);
    await p.locator('#pauseAdventure').click();const before=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).checkpoints.cargo.x,A.SAVE_KEY);assert.ok(before>100);await p.locator('#resumeAdventure').click();
    await p.setViewportSize({width:h,height:w});await p.waitForTimeout(100);await p.locator('#pauseAdventure').click();const after=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).checkpoints.cargo.x,A.SAVE_KEY);assert.ok(Math.abs(after-before)<2,'rotation changed world position');await p.locator('#resumeAdventure').click();await p.setViewportSize({width:w,height:h});
    if(shots&&w===390){fs.mkdirSync(shots,{recursive:true});await p.screenshot({path:path.join(shots,'phone-adventure.png')});}
    await moveTo(p,'Medical supplies');await p.locator('#interactAdventure').click();
    await p.getByRole('button',{name:A.missions[0].predictions[0],exact:true}).click();await setRange(p,3);await p.locator('#runTest').click();await p.getByRole('button',{name:A.missions[0].answers[0],exact:true}).click();
    await p.locator('#finishLab').scrollIntoViewIfNeeded();const b=await p.locator('#finishLab').boundingBox();assert.ok(b.y>=0&&b.y+b.height<=h+1,'repair unreachable in scrollable experiment');
    if(shots&&w===390)await p.screenshot({path:path.join(shots,'phone-experiment.png')});await p.locator('#finishLab').click();
    console.log(`Layout/input/rotation/experiment: ${w}×${h} passed`);await c.close();
  }
  const denied=await browser.newContext({viewport:{width:390,height:844}});await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});window.AudioContext=undefined;window.webkitAudioContext=undefined;});const p=await denied.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await begin(p);await moveTo(p,'Medical supplies');await solve(p,0,0);await denied.close();
  // A failed optional diagram download must not prevent an evidence-based repair.
  const noVisual=await browser.newContext({viewport:{width:390,height:844}}),previous=A.blank();
  for(const m of A.missions.slice(0,15))previous.completed[m.id]=true;
  previous.current=15;previous.checkpoints['charge-yard']={x:900,solved:[],cells:[],labs:{}};
  await noVisual.addInitScript(({key,previous})=>localStorage.setItem(key,JSON.stringify(previous)),{key:A.SAVE_KEY,previous});
  await noVisual.route('**/adventure-signal-ui.js',route=>route.abort());const fallback=await noVisual.newPage();fallback.on('pageerror',e=>errors.push(e.message));
  await fallback.goto(base);await begin(fallback);await moveTo(fallback,'Attraction gate');await fallback.locator('#interactAdventure').click();
  assert.match(await fallback.locator('#labVisual').textContent(),/written observations/);
  await fallback.getByRole('button',{name:A.experiment(15,0).predictions[0],exact:true}).click();await fallback.locator('#runTest').click();await fallback.locator('#equipment select').selectOption('gain');await fallback.locator('#runTest').click();await fallback.getByRole('button',{name:A.experiment(15,0).answers[0],exact:true}).click();await fallback.locator('#finishLab').click();assert.match(await fallback.locator('#missionStats').textContent(),/1\/3 repairs/);await noVisual.close();
  const noPowerVisual=await browser.newContext({viewport:{width:390,height:844}}),powerSave=A.blank();
  for(const m of A.missions.slice(0,20))powerSave.completed[m.id]=true;
  powerSave.current=20;powerSave.checkpoints['force-yard']={x:900,solved:[],cells:[],labs:{}};
  await noPowerVisual.addInitScript(({key,powerSave})=>localStorage.setItem(key,JSON.stringify(powerSave)),{key:A.SAVE_KEY,powerSave});await noPowerVisual.route('**/adventure-power-ui.js',route=>route.abort());
  const noPower=await noPowerVisual.newPage();noPower.on('pageerror',e=>errors.push(e.message));await noPower.goto(base);await begin(noPower);await moveTo(noPower,'Balanced inspection cart');await noPower.locator('#interactAdventure').click();assert.match(await noPower.locator('#labVisual').textContent(),/written observations/);
  await noPower.getByRole('button',{name:A.experiment(20,0).predictions[0],exact:true}).click();await noPower.locator('#runTest').click();await setRange(noPower,40);await noPower.locator('#runTest').click();await noPower.getByRole('button',{name:A.experiment(20,0).answers[0],exact:true}).click();await noPower.locator('#finishLab').click();assert.match(await noPower.locator('#missionStats').textContent(),/1\/3 repairs/);await noPowerVisual.close();
  // Existing campaign still starts and reaches a live HUD under its own entry.
  const old=await browser.newPage({viewport:{width:1024,height:768}});old.on('pageerror',e=>errors.push(e.message));await old.goto(base.replace('index.html','original-labs.html'));await old.locator('#startBtn').click();await old.waitForTimeout(1000);assert.equal(await old.locator('#overlay').evaluate(el=>el.classList.contains('active')),false);assert.match(await old.locator('#levelValue').textContent(),/1.*12/);assert.ok(await old.locator('.wga-tab-fullscreen').count());await old.close();
  assert.deepEqual(errors,[]);console.log('All browser checks passed; no uncaught JavaScript errors.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
