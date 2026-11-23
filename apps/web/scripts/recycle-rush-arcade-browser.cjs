/* Optional real-browser arcade art QA. Supplies completed-hub saves, then uses ordinary controls. */
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),os=require('node:os');
const {readGrimeTarget,readSortTarget,readPromptProof,readSortProgress,assertSortProgress,waitForSortTarget}=require('./helpers/recycle-browser-snapshot.cjs');
const A=require('../public/games/recycle-rush/arcade-art.js'),root=path.resolve(__dirname,'../public'),output=process.env.RECYCLE_QA_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'recycle-arcade-'));fs.mkdirSync(output,{recursive:true});
const key='wga_recycle_rush_2_save_v1',bossLevels=[2,5,8,11,14,16,18,19];
const server=http.createServer((req,res)=>{const route=decodeURIComponent(req.url.split('?')[0]),file=path.resolve(root,'.'+route,route.endsWith('/')?'index.html':'');if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
const saved=index=>({unlockedLevel:index,stars:Object.fromEntries(Array.from({length:index},(_,i)=>[i,3])),badges:{},categoryCounts:{},bossKills:0,loopUnlocked:false,settings:{music:0,sfx:0,reducedMotion:false,colorblind:false}});
async function localOnly(context){await context.route('**/*',route=>{const u=new URL(route.request().url());return u.origin===`http://127.0.0.1:${server.address().port}`?route.continue():route.abort();});return context;}
(async()=>{let browser;const results=[];try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,chromiumSandbox:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{channel:process.env.RECYCLE_BROWSER_CHANNEL||'chrome'})});
for(const[width,height,touch]of [[320,568,true],[390,844,true],[844,390,true],[768,1024,true],[1024,768,true],[1160,700,false],[1280,600,false],[1440,900,false]].filter(s=>!process.env.RECYCLE_QA_WIDTH||process.env.RECYCLE_QA_WIDTH.split(',').map(Number).includes(s[0]))){
 console.log(`Arcade ${width}x${height}`);const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,deviceScaleFactor:width===390?3:1}),page=await (await localOnly(context)).newPage(),errors=[];
 await page.clock.install(); // Install before the game creates its animation timers.
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await context.addInitScript(()=>{
  for(const type of ['pointerdown','pointerup','pointercancel','gotpointercapture','lostpointercapture'])document.addEventListener(type,event=>{
   if(event.target?.id!=='gameCanvas')return;
   const trace=window.__nativePointerTrace??=[];trace.push({type,pointerId:event.pointerId,x:event.clientX,y:event.clientY,score:document.getElementById('scoreValue')?.textContent});if(trace.length>24)trace.shift();
  },true);
  const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...options){const ctx=original.apply(this,options);if(this.id==='gameCanvas'&&ctx&&!ctx.__arcadeRecorded){ctx.__arcadeRecorded=true;const text=ctx.fillText;ctx.fillText=function(label,x,y,maxWidth){if(label==='SELECT THE MATCHING MATERIAL')window.__sortPrompt={x,y,maxWidth,fill:this.fillStyle,frame:window.__arcadeFrame,canvasWidth:this.canvas.width,canvasHeight:this.canvas.height};return text.apply(this,arguments);};const draw=ctx.drawImage;ctx.drawImage=function(image,...args){const src=image.src||'';if(src.includes('/backgrounds/')){window.__arcadePaints=[];window.__arcadeFrame=(window.__arcadeFrame||0)+1;}if(args.length===4||args.length===8){const offset=args.length===8?4:0,[x,y,w,h]=args.slice(offset),m=ctx.getTransform(),dpr=ctx.canvas.width/ctx.canvas.getBoundingClientRect().width||1;const paint={src,x:(m.e+m.a*(x+w/2)+m.c*(y+h/2))/dpr,y:(m.f+m.b*(x+w/2)+m.d*(y+h/2))/dpr,w,h,sx:args.length===8?args[0]:null,sy:args.length===8?args[1]:null};(window.__arcadePaints??=[]).push(paint);if(src.includes('/arcade/bosses-')){window.__arcadeSeen??={};const id=src.split('/').at(-1)+':'+paint.sy;(window.__arcadeSeen[id]??=[]).push(paint.sx);window.__arcadeSeen[id]=[...new Set(window.__arcadeSeen[id])];}}return draw.call(this,image,...args);};}return ctx;};
 });
 const activate=async locator=>touch?locator.tap():locator.click(),noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight+1));
 const resizeWithPaint=async viewport=>{
  const previous=await page.evaluate(()=>window.__arcadeFrame||0);
  await page.setViewportSize(viewport);
  await page.waitForFunction(previous=>{
   const p=window.__sortPrompt,c=document.getElementById('gameCanvas');
   return (window.__arcadeFrame||0)>previous&&p?.frame===window.__arcadeFrame&&p.canvasWidth===c.width&&p.canvasHeight===c.height;
  },previous);
 };
 await page.goto(`http://127.0.0.1:${server.address().port}/games/recycle-rush/?scores=0`);await page.waitForFunction(()=>window.RecycleArcade&&window.__wgaGameTab);assert.equal(await page.locator('.arcade-boss-preview').count(),8);
 await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key,save:saved(2)});
 for(let chapter=0;chapter<8;chapter++){
  const level=bossLevels[chapter],boss=A.bosses[chapter];await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key,save:saved(level)});await page.reload();await page.waitForFunction(()=>window.RecycleArcade&&window.__wgaGameTab);
  await activate(page.locator('#startNextBtn'));assert.equal(await page.locator('.arcade-comic-boss').count(),1);await activate(page.locator('#comicContinueBtn'));await noOverflow();
  for(const id of ['leftBtn','rightBtn','powerBtn','pauseBtn','muteBtn','restartBtn']){const b=await page.locator('#'+id).boundingBox();assert.ok(b&&b.width>=44&&b.height>=44&&b.x>=0&&b.y>=0&&b.x+b.width<=page.viewportSize().width+1&&b.y+b.height<=page.viewportSize().height+1,id+' fits '+width);}
  const bins=await page.evaluate(()=>window.__arcadePaints?.filter(p=>p.w===28)||[]);assert.ok(bins.length>=3);const area=await page.locator('#gameCanvas').boundingBox();for(const bin of bins)assert.ok(bin.x>=0&&bin.y>=0&&bin.x<=area.width&&bin.y<=area.height);
  await page.waitForFunction(({sheet,row})=>window.__arcadePaints?.some(p=>p.src.endsWith(sheet)&&p.sy===row*256),{sheet:boss.sheet,row:boss.row});
  const drawn=await page.evaluate(({sheet,row})=>window.__arcadePaints.find(p=>p.src.endsWith(sheet)&&p.sy===row*256),{sheet:boss.sheet,row:boss.row});assert.ok(drawn.x-drawn.w/2>=0&&drawn.x+drawn.w/2<=area.width+1&&drawn.y-drawn.h/2>=0&&drawn.y+drawn.h/2<=area.height+1);
  const mapping=Object.fromEntries(Object.entries(A.variants).flatMap(([cat,list])=>list.map(id=>[id+'.webp',cat]))),binArt=Object.fromEntries(Object.entries(A.variants).map(([cat,list])=>[cat,list[0]+'.webp']));
  await page.waitForFunction(readSortTarget,{mapping,binArt});
  const point=async(x,y)=>{
   assert.ok(Number.isFinite(x)&&Number.isFinite(y),'Finite canvas coordinates required');
   const destination=await page.evaluate(({x,y})=>{
    const canvas=document.getElementById('gameCanvas'),rect=canvas.getBoundingClientRect(),clientX=rect.left+x,clientY=rect.top+y;
    return {clientX,clientY,inside:x>=4&&y>=4&&x<=rect.width-4&&y<=rect.height-4&&clientX>=4&&clientY>=4&&clientX<=innerWidth-4&&clientY<=innerHeight-4,receivesCanvas:document.elementFromPoint(clientX,clientY)===canvas};
   },{x,y});
   assert.ok(destination.inside&&destination.receivesCanvas,'Native tap must hit the current visible canvas: '+JSON.stringify({x,y,...destination}));
   if(touch)await page.touchscreen.tap(destination.clientX,destination.clientY);else await page.mouse.click(destination.clientX,destination.clientY);
  };
  const freezeFrame=async()=>{
   await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now())+250));
   await page.clock.runFor(16);
   assert.equal(await page.locator('#screenOverlay').evaluate(el=>el.classList.contains('active')),false,'Encounter remains active before aiming');
  };
  await freezeFrame();
  try {
   const target=await waitForSortTarget({
    read:()=>page.evaluate(readSortTarget,{mapping,binArt}),
    advance:milliseconds=>page.clock.runFor(milliseconds),
    isActive:()=>page.evaluate(()=>!document.getElementById('screenOverlay').classList.contains('active')&&document.getElementById('pauseBtn').textContent==='Pause')
   });
   const before=await page.evaluate(readSortProgress);
   await page.evaluate(target=>{window.__plannedTarget={kind:'sort',...target};},target);
   await point(target.item.x,target.item.y);await page.clock.runFor(16);await point(target.bin.x,target.bin.y);
   await page.clock.runFor(32);
   assertSortProgress(before,await page.evaluate(readSortProgress));
  } finally {await page.clock.resume();}
  const seenId=boss.sheet.split('/').at(-1)+':'+boss.row*256;await page.waitForFunction(id=>window.__arcadeSeen?.[id]?.includes(768),seenId);await page.waitForFunction(id=>window.__arcadeSeen?.[id]?.includes(512),seenId);
  if(width===390||width===1440||chapter===7){
   await page.waitForFunction(id=>window.__arcadeSeen?.[id]?.includes(256),seenId);await page.waitForFunction(()=>window.__arcadePaints?.some(p=>p.src.includes('grime-atlas')&&p.y>10&&p.w>=40));
   await freezeFrame();
   try {
    let target=await page.evaluate(readGrimeTarget);
    for(let frame=0;frame<60&&!target.hazard;frame++){await page.clock.runFor(16);target=await page.evaluate(readGrimeTarget);}
    assert.ok(target.hazard,'A visible native-tappable Grime hazard is required');
    await page.evaluate(target=>{window.__plannedTarget={kind:'hazard',...target};},target);
    await point(target.hazard.x,target.hazard.y);await page.clock.runFor(32);
    assert.ok(Number(await page.locator('#scoreValue').textContent())>=target.score+30,'Native pointer hit credits hazard points');
    assert.ok(await page.locator('#bossFill').evaluate((el,previous)=>parseFloat(el.style.width)<previous,target.bossWidth),'Native pointer hit damages the boss');
   } finally {await page.clock.resume();}
  }
  await activate(page.locator('#pauseBtn'));assert.equal(await page.locator('#pauseBtn').textContent(),'Resume');const frame=await page.evaluate(({sheet,row})=>window.__arcadePaints.find(p=>p.src.endsWith(sheet)&&p.sy===row*256)?.sx,{sheet:boss.sheet,row:boss.row});await page.waitForTimeout(120);assert.equal(await page.evaluate(({sheet,row})=>window.__arcadePaints.find(p=>p.src.endsWith(sheet)&&p.sy===row*256)?.sx,{sheet:boss.sheet,row:boss.row}),frame);
  if(chapter===7&&width===390){const lives=await page.locator('#livesValue').textContent();await resizeWithPaint({width:844,height:390});await noOverflow();await resizeWithPaint({width,height});assert.equal(await page.locator('#livesValue').textContent(),lives);}
  const proof=await page.evaluate(readPromptProof);
  assert.ok(proof,'Sorting instruction was rendered');
  assert.equal(proof.fill,'#f0fff7','Sorting instruction text stays light');
  assert.deepEqual(proof.rgba,[7,28,35,255],`Opaque sorting panel at ${JSON.stringify(proof)}`);
  await page.screenshot({path:path.join(output,`${width}-${height}-${boss.id}.png`)});console.log(`  ${boss.id}: sprite animation, sort, pause and bounds passed`);
 }
 // A reduced-motion save keeps the idle frame fixed while essential falling gameplay continues.
 const reduced=saved(19);reduced.settings.reducedMotion=true;await page.evaluate(({key,save})=>localStorage.setItem(key,JSON.stringify(save)),{key,save:reduced});await page.reload();await page.waitForFunction(()=>window.RecycleArcade);await activate(page.locator('#startNextBtn'));await activate(page.locator('#comicContinueBtn'));await page.waitForTimeout(750);const frames=await page.evaluate(()=>window.__arcadeSeen?.['bosses-b.webp:768']);assert.deepEqual(frames,[0]);await noOverflow();
 // The existing 25-mission story and the approved service-board resource remain reachable.
 await activate(page.locator('#restartBtn'));await activate(page.locator('#storyStartBtn'));await activate(page.getByRole('button',{name:'Start Mission',exact:true}));assert.match(await page.locator('#storyMissionNumber').textContent(),/1\/25/);await activate(page.locator('#storyBoardBtn'));assert.equal(await page.locator('#storyModalContent a').getAttribute('href'),'https://fibrecircle.co.za/zithande_mzansi.html');
 assert.deepEqual(errors,[]);results.push({width,height,touch,bosses:8,errors});await context.close();
}
fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length,output}));
}catch(error){
 for(const context of browser?.contexts()||[])for(const page of context.pages()){
  try{
   const size=page.viewportSize();await page.screenshot({path:path.join(output,`failure-${size.width}-${size.height}.png`),timeout:5000});
   const diagnostic=await page.evaluate(()=>({score:document.getElementById('scoreValue')?.textContent,lives:document.getElementById('livesValue')?.textContent,objective:document.getElementById('objectiveText')?.textContent,pause:document.getElementById('pauseBtn')?.textContent,overlayActive:document.getElementById('screenOverlay')?.classList.contains('active'),plannedTarget:window.__plannedTarget,pointerTrace:window.__nativePointerTrace,paintedSprites:window.__arcadePaints,visibleGrime:(window.__arcadePaints||[]).filter(p=>p.src.includes('grime-atlas')).map(({x,y,w,h})=>({x,y,w,h}))}));
   fs.writeFileSync(path.join(output,`failure-${size.width}-${size.height}.json`),JSON.stringify(diagnostic,null,2));console.error('BROWSER_DIAGNOSTIC '+JSON.stringify(diagnostic));
  }catch{}
 }
 throw error;
}finally{await browser?.close();await new Promise(r=>server.close(r));}})().catch(error=>{console.error(error);process.exitCode=1;});
