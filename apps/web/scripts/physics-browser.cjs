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
async function setRange(page,value){const range=page.locator('#equipment input[type=range]');await range.focus();await range.press('Home');const min=Number(await range.getAttribute('min'));for(let n=min;n<value;n++)await range.press('ArrowRight');}
async function solve(page,mi,si,first=false){
  const m=A.missions[mi];await page.locator('#interactAdventure').click();assert.equal(await page.locator('#labTitle').textContent(),m.stations[si].name);
  await page.getByRole('button',{name:m.predictions[0],exact:true}).click();
  if(first){await page.locator('#runTest').click();assert.match(await page.locator('#testResult').textContent(),/not reached/);await page.locator('#hintBtn').click();assert.ok((await page.locator('#labHint').textContent()).length>20);}
  const values=[[3,4,6],[20,15,12],['free','free','free'],[5,7,9],['copper','copper','copper']];
  if(m.options)await page.locator('#equipment select').selectOption(values[mi][si]);else await setRange(page,values[mi][si]);
  await page.locator('#runTest').click();assert.match(await page.locator('#testResult').textContent(),/Target reached/);
  if(first){
    await page.getByRole('button',{name:m.answers[1],exact:true}).click();assert.equal(await page.locator('#finishLab').isVisible(),false);
    await page.locator('#leaveLab').click();await page.reload();await begin(page);await page.locator('#interactAdventure').click();
    assert.equal(await page.locator('#equipment input').inputValue(),'3');assert.equal(await page.locator('#trialHistory li').count(),2);
    await page.locator('#runTest').click();
  }
  await page.getByRole('button',{name:m.answers[0],exact:true}).click();await page.locator('#finishLab').click();
  assert.match(await page.locator('#missionStats').textContent(),new RegExp(`${si+1}/3 repairs`));
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/games/physics-force-lab/index.html?scores=0`;
  browser=await chromium.launch({headless:true,...(process.env.CHROME_BIN?{executablePath:process.env.CHROME_BIN}:{}),args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await begin(page);
  if(!process.env.PHYSICS_SMOKE){for(let mi=0;mi<5;mi++){
    for(let si=0;si<3;si++){await moveTo(page,A.missions[mi].stations[si].name);await solve(page,mi,si,mi===0&&si===0);}
    await moveTo(page,'Restore district');await page.locator('#interactAdventure').click();
    assert.equal(await page.locator('#storyGrade').textContent(),'DISTRICT RESTORED');
    const p=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),A.SAVE_KEY);assert.equal(p.completed[A.missions[mi].id],true);
    console.log(`Phone campaign: mission ${mi+1} completed through real movement and experiment controls`);
    await page.locator('#storyContinue').click();if(mi<4)await page.locator('#storyContinue').click();
  }
  assert.equal((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),A.SAVE_KEY)).completed.circuit,true);}
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
  // Existing campaign still starts and reaches a live HUD under its own entry.
  const old=await browser.newPage({viewport:{width:1024,height:768}});old.on('pageerror',e=>errors.push(e.message));await old.goto(base.replace('index.html','original-labs.html'));await old.locator('#startBtn').click();await old.waitForTimeout(1000);assert.equal(await old.locator('#overlay').evaluate(el=>el.classList.contains('active')),false);assert.match(await old.locator('#levelValue').textContent(),/1.*12/);assert.ok(await old.locator('.wga-tab-fullscreen').count());await old.close();
  assert.deepEqual(errors,[]);console.log('All browser checks passed; no uncaught JavaScript errors.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
