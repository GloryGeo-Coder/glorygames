'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public'),shots=process.env.SWIPE_SCREENSHOTS,errors=[],missing=[];
let browser;
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try {
    let data=fs.readFileSync(file);
    if(file.endsWith(path.join('swipe-racer','game.js')))data=data.toString().replace(/\r\n/g,'\n').replace('  resetRun();\n  showCampaignMenu();','  window.swipeQA={state,player,images,step,currentLevel,loadLevel,completeLevel,endGame,projectEntity,getCampaign:()=>campaign,getMode:()=>mode};\n  resetRun();\n  showCampaignMenu();');
    res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.webp':'image/webp','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(data);
  }catch{res.writeHead(404).end();}
});
async function capture(page,name){if(shots){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,name+'.png')});}}
async function finish(page){await page.evaluate(()=>{const q=swipeQA;q.state.distance=q.currentLevel().targetDistance;q.state.elapsed=20;q.completeLevel();});}
async function click(page,selector){await page.locator(selector).scrollIntoViewIfNeeded();await page.locator(selector).click();}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
  const url='http://127.0.0.1:'+server.address().port+'/games/swipe-racer/?scores=0';
  for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1440,height:900}]){
    const context=await browser.newContext({viewport:size,hasTouch:true});
    const p=await context.newPage(),label=size.width+'x'+size.height;
    p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&new URL(r.url()).pathname.startsWith('/games/'))missing.push(r.url());});
    await p.goto(url);await p.waitForFunction(()=>window.swipeQA&&swipeQA.images.cityHorizon&&swipeQA.images.racerV2&&swipeQA.images.truckV2);
    assert.equal(await p.locator('.eventCard:disabled').count(),4);await capture(p,label+'-events');
    await click(p,'[data-event="0"]');assert.match(await p.locator('#panelText').textContent(),/Nia/);await capture(p,label+'-briefing');
    await click(p,'#btnMute');await click(p,'#btnStart');
    await p.waitForFunction(()=>swipeQA.state.distance>5);
    await p.evaluate(()=>{swipeQA.state.spawnT=999;swipeQA.state.pickupT=999;});
    const canvas=await p.locator('#c').boundingBox();assert.ok(canvas.height>180);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await p.keyboard.press('ArrowLeft');await p.waitForFunction(()=>swipeQA.player.x<innerWidth/2-5);
    await p.evaluate(()=>{const c=document.querySelector('#c'),r=c.getBoundingClientRect();for(const [type,x] of [['pointerdown',100],['pointermove',140],['pointermove',180],['pointercancel',180]])c.dispatchEvent(new PointerEvent(type,{clientX:x,clientY:r.y+r.height*.7,pointerId:1,pointerType:'touch',bubbles:true}));});
    assert.equal(await p.evaluate(()=>swipeQA.state.boostsUsed),0);
    await click(p,'#btnBoost');assert.equal(await p.evaluate(()=>swipeQA.state.boostsUsed),1);await capture(p,label+'-driving');
    await click(p,'#btnPause');const before=await p.evaluate(()=>swipeQA.state.elapsed);
    await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>swipeQA.state.elapsed),before);
    await p.setViewportSize({width:size.height,height:size.width});await click(p,'#btnStart');await p.setViewportSize(size);
    await p.waitForFunction(t=>swipeQA.state.elapsed>t,before);
    await p.evaluate(()=>{const q=swipeQA;q.player.x=q.player.targetX=innerWidth/2;q.state.invuln=0;q.state.traffic=[];const tr={type:'car',key:'red',lane:1,t:.1,speedF:1,nearGiven:false};for(let t=.1;t<1;t+=.002){tr.t=t;if(Math.abs(q.projectEntity(tr).y-q.player.y)<2)break;}q.state.traffic=[tr];});
    await p.waitForFunction(()=>swipeQA.state.hits===1);assert.ok(await p.evaluate(()=>swipeQA.state.collisionSlow)>0);
    await finish(p);await capture(p,label+'-result');await click(p,'#btnEvents');
    assert.equal(await p.locator('.eventCard:disabled').count(),3);
    await p.reload();await p.waitForFunction(()=>window.swipeQA);assert.equal(await p.locator('.eventCard:disabled').count(),3);
    for(let i=1;i<5;i++){
      await click(p,'[data-event="'+i+'"]');await click(p,'#btnStart');
      if(i===2){await p.evaluate(()=>{swipeQA.state.distance=700;swipeQA.step(.01);});assert.equal(await p.evaluate(()=>swipeQA.state.deliveryMarker),2);}
      await finish(p);await click(p,'#btnEvents');
    }
    assert.equal(await p.locator('.eventCard:disabled').count(),0);await capture(p,label+'-metro-complete');
    await click(p,'[data-event="1"]');await click(p,'#btnStart');await p.evaluate(()=>{swipeQA.state.elapsed=33;swipeQA.step(.001);});assert.equal(await p.evaluate(()=>swipeQA.state.gameOver),true);
    await click(p,'#btnStart');assert.equal(await p.evaluate(()=>swipeQA.state.levelIndex),1);assert.ok(await p.evaluate(()=>swipeQA.state.elapsed)<1);
    await click(p,'#btnEvents');await click(p,'#btnClassic');assert.equal(await p.evaluate(()=>swipeQA.getMode()),'classic');
    for(let i=0;i<4;i++){await p.evaluate(i=>swipeQA.loadLevel(i),i);await click(p,'#btnStart');await p.waitForTimeout(60);await capture(p,label+'-classic-'+i);}
    assert.deepEqual(errors,[]);await context.close();console.log('PASS Metro browser '+label);
  }
  for(const failure of ['blocked','corrupt']){
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.addInitScript(failure=>{if(failure==='blocked')Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});else{localStorage.setItem('wga_swipe_racer_campaign_v1','{bad');localStorage.setItem('wga_swipe_racer_best_v2','9876');}},failure);
    const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await click(p,'[data-event="0"]');await click(p,'#btnStart');await finish(p);
    if(failure==='blocked')assert.match(await p.locator('#panelText').textContent(),/storage is unavailable/);else assert.equal(await p.locator('#best').textContent(),'9876');
    await context.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS storage fallback and retained assets');
})().catch(e=>{console.error(e,errors,missing);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
