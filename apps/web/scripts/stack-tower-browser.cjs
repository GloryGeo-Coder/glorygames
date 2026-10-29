'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public'),errors=[],missing=[];let browser;
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!f.startsWith(root+path.sep))return res.writeHead(403).end();try{let data=fs.readFileSync(f);if(f.endsWith('/stack-tower/game.js'))data=data.toString().replace('  resetGame();\n  requestAnimationFrame(loop);','  window.stackQA={state,images,dropBlock,step,draw,resize};\n  resetGame();\n  requestAnimationFrame(loop);');res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.webp':'image/webp','.png':'image/png','.json':'application/json'})[path.extname(f)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});const context=await browser.newContext({viewport:{width:320,height:568},hasTouch:true,isMobile:true});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&new URL(r.url()).pathname.startsWith('/games/'))missing.push(r.url())});const url=`http://127.0.0.1:${server.address().port}/games/stack-tower/?scores=0`;await p.goto(url);await p.waitForFunction(()=>window.stackQA&&['sky0','sky1','sky2'].every(k=>stackQA.images[k]?.naturalWidth));
for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1440,height:900}]){await p.setViewportSize(size);await p.waitForTimeout(100);const box=await p.locator('#c').boundingBox();assert.ok(box.width>=250&&box.height>=120,JSON.stringify({size,box}));for(const id of ['btnPause','btnDrop','btnRepair','btnSubmit','btnRestart','btnMute','btnMusic']){const b=await p.locator('#'+id).boundingBox();assert.ok(b&&b.x>=0&&b.y>=0&&b.x+b.width<=size.width+1&&b.y+b.height<=size.height+1,JSON.stringify({size,id,b}));}}
await p.setViewportSize({width:390,height:844});await p.locator('#btnStart').click();assert.equal(await p.evaluate(()=>stackQA.state.running),true);
for(let height=1;height<=21;height++){await p.evaluate(()=>{const q=stackQA;q.state.current.x=q.state.stack.at(-1).x;q.dropBlock();});assert.equal(await p.evaluate(()=>stackQA.state.height),height);if([1,10,20].includes(height)){if(process.env.STACK_SCREENSHOTS){fs.mkdirSync(process.env.STACK_SCREENSHOTS,{recursive:true});await p.screenshot({path:path.join(process.env.STACK_SCREENSHOTS,`stage-${height}.png`)});}}}
assert.match(await p.locator('#worldLabel').textContent(),/Aurora Summit/);assert.equal(await p.evaluate(()=>stackQA.state.progress.stage),2);assert.ok(await p.evaluate(()=>stackQA.state.progress.repairs)>0);await p.evaluate(()=>{stackQA.state.stack.at(-1).w=60;stackQA.state.current.w=60;});await p.locator('#btnRepair').click();assert.ok(await p.evaluate(()=>stackQA.state.current.w)>60);
await p.locator('#btnPause').click();const frozen=await p.evaluate(()=>{let q=stackQA;q.state.focusTimer=4;q.step(1);return q.state.focusTimer});assert.equal(frozen,4);await p.locator('#btnStart').click();await p.locator('#btnMute').click();assert.equal(await p.locator('#btnMute').textContent(),'Effects off');await p.locator('#btnMusic').click();assert.equal(await p.locator('#btnMusic').textContent(),'Music off');
await p.evaluate(()=>{const q=stackQA;q.state.current.x=-10000;q.dropBlock()});assert.equal(await p.evaluate(()=>stackQA.state.gameOver),true);assert.ok(Number(await p.evaluate(()=>localStorage.getItem('wga_stack_tower_best_v2')))>=21);await p.reload();assert.ok(Number(await p.locator('#best').textContent())>=21);
// Rotate a genuinely active, narrow tower, not only the idle start screen.
const rotate = async size => {
  await p.setViewportSize(size);
  await p.evaluate(() => stackQA.resize());
};
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
await rotate({width:844,height:390});
await p.locator('#btnStart').click();
await p.evaluate(() => {
  const q = stackQA;
  for (let i = 0; i < 9; i++) { q.state.current.x = q.state.stack.at(-1).x; q.dropBlock(); }
  q.state.stack.at(-1).w = q.state.current.w = 60;
  q.state.current.x = q.state.stack.at(-1).x;
  q.state.current.vx = 0;
});
const beforeRotation = await p.evaluate(() => ({
  width: Math.floor(document.getElementById('c').getBoundingClientRect().width),
  height: stackQA.state.height, score: stackQA.state.score,
  progress: {...stackQA.state.progress}, combo: stackQA.state.combo
}));
await rotate({width:390,height:844});
const rotated = await p.evaluate(() => ({
  width: Math.floor(document.getElementById('c').getBoundingClientRect().width),
  top: stackQA.state.stack.at(-1).w, current: stackQA.state.current.w,
  height: stackQA.state.height, score: stackQA.state.score,
  progress: {...stackQA.state.progress}, combo: stackQA.state.combo
}));
const scale = rotated.width / beforeRotation.width;
near(rotated.top, 60 * scale);
near(rotated.current, rotated.top);
for (const key of ['height', 'score', 'progress', 'combo']) assert.deepEqual(rotated[key], beforeRotation[key]);
assert.ok(rotated.top < 32, 'fixture must reproduce a width that previously lost even after a perfect drop');
await p.evaluate(() => stackQA.dropBlock());
assert.equal(await p.evaluate(() => stackQA.state.gameOver), false, 'rotation must not turn a perfect placement into a loss');
assert.equal(await p.evaluate(() => stackQA.state.height), 10);
assert.equal(await p.evaluate(() => stackQA.state.progress.stage), 1);
near(await p.evaluate(() => stackQA.state.current.w), rotated.top + 2);
near(await p.evaluate(() => stackQA.state.minWidth), 34 * scale);

// Repeat a full rotation while paused. It must preserve the run and its threshold.
await p.locator('#btnPause').click();
await rotate({width:844,height:390});
near(await p.evaluate(() => stackQA.state.minWidth), 34);
await rotate({width:390,height:844});
near(await p.evaluate(() => stackQA.state.minWidth), 34 * scale);
assert.equal(await p.evaluate(() => stackQA.state.paused), true);
await p.evaluate(() => { const q = stackQA; q.state.current.x = q.state.stack.at(-1).x; q.state.current.vx = 0; });
await p.locator('#btnStart').click();
await p.locator('#btnDrop').click();
assert.equal(await p.evaluate(() => stackQA.state.height), 11);
assert.equal(await p.evaluate(() => stackQA.state.gameOver), false);

// A real bad placement still loses against the scaled minimum.
await p.evaluate(() => {
  const q = stackQA, top = q.state.stack.at(-1);
  q.state.current.x = top.x + top.w - q.state.minWidth / 2;
  q.dropBlock();
});
assert.equal(await p.evaluate(() => stackQA.state.gameOver), true);
assert.match(await p.locator('#panelText').textContent(), /too narrow/);

// Restart is a fresh run: neither rotation nor height-only resizing leaks a smaller minimum.
await p.locator('#btnRestart').click();
near(await p.evaluate(() => stackQA.state.minWidth), 34);
await rotate({width:390,height:700});
near(await p.evaluate(() => stackQA.state.minWidth), 34);
await p.evaluate(() => {
  const q = stackQA, top = q.state.stack.at(-1);
  top.w = q.state.current.w = 50;
  q.state.current.x = top.x + 20;
  q.dropBlock();
});
assert.equal(await p.evaluate(() => stackQA.state.gameOver), true);
assert.match(await p.locator('#panelText').textContent(), /too narrow/);
console.log('Stack Tower: active/paused narrow-tower rotation, continued placement, scaled loss and restart regression passed.');

assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('Stack Tower: portrait/landscape/desktop controls, 21 placements, worlds, contracts, repairs, pause, audio and saved best passed.');await context.close();
const blocked=await browser.newContext({viewport:{width:320,height:568}});await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}});window.AudioContext=undefined;window.webkitAudioContext=undefined;});const b=await blocked.newPage();b.on('pageerror',e=>errors.push(e.message));await b.goto(url);await b.locator('#btnStart').click();assert.equal(await b.evaluate(()=>stackQA.state.running),true);assert.deepEqual(errors,[]);await blocked.close();
})().catch(e=>{console.error(e,errors,missing);process.exitCode=1}).finally(async()=>{await browser?.close();server.close();});
