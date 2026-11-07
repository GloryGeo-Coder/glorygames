'use strict';
// Artwork-specific checks supplement the full campaign browser suite.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'../public');
const key = 'bioquest.guardians.grade4.v1';
const errors = [];
const server = http.createServer((req,res) => {
 const file = path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if (!file.startsWith(root+path.sep)) return res.writeHead(403).end();
 try { res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.webp')?'image/webp':'application/octet-stream'); res.end(fs.readFileSync(file)); }
 catch {res.writeHead(404).end();}
});
let browser;
async function loaded(page) {
 await page.locator('.scene-image').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 assert.equal(await page.locator('.scene-image').evaluateAll(imgs=>imgs.every(i=>i.naturalWidth>=600)),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
}
async function shot(page,name) {
 if (!process.env.BIOQUEST_SCREENSHOTS) return;
 fs.mkdirSync(process.env.BIOQUEST_SCREENSHOTS,{recursive:true});
 await page.screenshot({path:path.join(process.env.BIOQUEST_SCREENSHOTS,name+'.png'),fullPage:true});
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
 const url=`http://127.0.0.1:${server.address().port}/games/bioquest-guardians-of-life/index.html`;
 for (const [width,height] of [[320,568],[390,844],[600,900],[844,390],[1440,900]]) {
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<1000});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.on('response',res=>{if(res.url().includes('/assets/')&&res.status()!==200)errors.push(`${res.status()} ${res.url()}`);});
  await page.goto(url);await loaded(page);
  const spriteSizes=await page.evaluate(async()=>Promise.all(['nala','pip'].map(async name=>{const image=new Image();image.src=`assets/sprites/${name}.webp`;await image.decode();return [image.naturalWidth,image.naturalHeight];})));
  assert.deepEqual(spriteSizes,[[1536,512],[1280,320]]);
  // Fixture unlocks locations for a visual tour; normal unlocking is tested by the campaign suite.
  await page.evaluate(k=>{const completed=[window.BIOQUEST_MISSIONS,...[5,6,7,8,9,10].map(g=>window['BIOQUEST_GRADE'+g])].flat().map(m=>m.id);localStorage.setItem(k,JSON.stringify({completed,checkpoints:{},selectedGrade:4,sound:false}));},key);
  await page.reload();
  const visited=new Set();
  for(const grade of [4,5,6,7,8,9,10]) {
   await page.locator('#grade'+grade).click();await loaded(page);await shot(page,`art-home-grade${grade}-${width}`);
   for(let i=0;i<5;i++) {
    await page.locator('.mission-card').nth(i).click();await loaded(page);
    const scene=page.locator('.scene'); const id=await scene.getAttribute('data-scene');visited.add(id);
    assert.ok((await page.locator('.scene-image').getAttribute('src')).endsWith('/'+id+'.webp'));
    assert.equal(await page.locator('.sprite.nala').evaluate(e=>getComputedStyle(e).animationName),'nala-frames');
    const before=await page.locator('.sprite.nala').evaluate(e=>{const a=e.getAnimations()[0];a.pause();a.currentTime=0;return getComputedStyle(e).backgroundPositionX;});
    const after=await page.locator('.sprite.nala').evaluate(e=>{e.getAnimations()[0].currentTime=1900;return getComputedStyle(e).backgroundPositionX;});
    assert.notEqual(before,after,'Nala must display distinct animation frames');
    const pipFrames=await page.locator('.sprite.pip').evaluate(e=>{const a=e.getAnimations().find(a=>a.animationName==='pip-frames');a.pause();a.currentTime=0;const first=getComputedStyle(e).backgroundPositionX;a.currentTime=1500;return [first,getComputedStyle(e).backgroundPositionX];});
    assert.notEqual(pipFrames[0],pipFrames[1],'Pip must display distinct animation frames');
    for(const name of ['nala','pip']) {
     const bounds=await page.locator('.sprite.'+name).boundingBox();const frame=await scene.boundingBox();
     assert.ok(bounds.x>=frame.x-1&&bounds.x+bounds.width<=frame.x+frame.width+1,`${name} clipped horizontally`);
     assert.ok(bounds.y>=frame.y-1&&bounds.y+bounds.height<=frame.y+frame.height+1,`${name} clipped vertically`);
     assert.ok(Math.abs(bounds.width/bounds.height-(name==='nala'?.75:1))<.01,`${name} frame is distorted`);
    }
    await shot(page,`art-${id}-${width}`);
    if(width===390) {
      await page.locator('#survey-site').click();
      const stage=page.locator('#survey-stage');
      await stage.locator('.scan-base').evaluate(img=>img.decode());
      await stage.scrollIntoViewIfNeeded();
      const box=await stage.boundingBox();
      const target=await page.evaluate(id=>({x:BioFieldwork.entries[id].x,y:BioFieldwork.entries[id].y}),id);
      await page.touchscreen.tap(box.x+box.width*target.x/100,box.y+box.height*target.y/100);
      await page.locator('#scan').click();
      assert.ok(await page.locator('#survey-done').isVisible(),id+' must be scannable');
      await page.locator('#exit-survey').click();
    }
    await page.locator('#start').click();await loaded(page);
    await page.locator('#hint').click();assert.equal(await page.locator('#hint-text').isVisible(),true);
    if(i===0)await shot(page,`art-task-grade${grade}-${width}`);
    await page.locator('#back').click();
   }
  }
  assert.equal(visited.size,35);
  console.log(`${width}x${height}: 35 unique backgrounds decoded, frame animation and mission navigation verified`);
  await context.close();
 }
 const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const rp=await reduced.newPage();await rp.goto(url);await rp.locator('#continue').click();await loaded(rp);
 for(const selector of ['.sprite.nala','.sprite.pip','.scene-glow'])assert.equal(await rp.locator(selector).evaluate(e=>getComputedStyle(e).animationName),'none');
 await reduced.close();
 const offline=await browser.newContext({viewport:{width:320,height:568}});
 await offline.route('**/*.webp',route=>route.abort());
 const op=await offline.newPage();await op.goto(url);await op.locator('#continue').click();
 await op.locator('#survey-site').click();await op.locator('#guide').click();await op.locator('#scan').click();
 await op.locator('#survey-done').click();await op.locator('#hint').click();
 assert.equal(await op.locator('#hint-text').isVisible(),true);assert.equal(await op.locator('#choices button:enabled').count()>0,true);
 assert.equal(await op.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await offline.close();assert.deepEqual(errors,[]);console.log('Reduced motion and missing-art fallback passed');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
