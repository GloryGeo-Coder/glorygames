/* Optional UI QA: PLAYWRIGHT_MODULE=/path/to/playwright-core CHROMIUM_EXECUTABLE=/path/to/chrome node apps/web/scripts/recycle-rush-browser.cjs */
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),os=require('node:os');
const L=require('../public/games/recycle-rush/story-data.js');const root=path.resolve(__dirname,'../public'),output=process.env.RECYCLE_QA_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'recycle-qa-'));fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const route=decodeURIComponent(req.url.split('?')[0]);const file=path.resolve(root,'.'+route,route.endsWith('/')?'index.html':'');if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{let browser;const results=[];try{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});for(const[width,height,touch]of ([[320,568,true],[390,844,true],[844,390,true],[768,1024,true],[1024,768,true],[1160,700,false],[1280,600,false],[1440,900,false]].filter(s=>!process.env.RECYCLE_QA_WIDTH||s[0]===Number(process.env.RECYCLE_QA_WIDTH)))){
 console.log(`Checking ${width}x${height}`);const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('requestfailed',r=>errors.push(r.url()+' '+r.failure()?.errorText));
 await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){const ctx=get.apply(this,args);if(ctx&&args[0]==='2d'&&!ctx.__recorded){ctx.__recorded=true;const draw=ctx.drawImage;ctx.drawImage=function(image,...a){const src=image.src||'';if(src.includes('/backgrounds/'))window.__recyclePaint=[];if(a.length===4&&(src.includes('/sprites/')||src.includes('/animated/'))){const t=ctx.getTransform(),dpr=window.devicePixelRatio||1;window.__recyclePaint??=[];window.__recyclePaint.push({src,x:t.e/dpr,y:t.f/dpr,w:a[2],h:a[3]});}return draw.call(this,image,...a);};}return ctx;};});
 const activate=async s=>touch?page.locator(s).tap():page.locator(s).click();const named=async name=>{const b=page.getByRole('button',{name,exact:true});touch?await b.tap():await b.click();};
 const bounds=async s=>{const b=await page.locator(s).boundingBox();assert.ok(b&&b.width>=1&&b.height>=1,`${s} visible`);assert.ok(b.x>=-1&&b.y>=-1&&b.x+b.width<=page.viewportSize().width+1&&b.y+b.height<=page.viewportSize().height+1,`${width}x${height} ${s} ${JSON.stringify(b)}`);};
 const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight+1),`${width} no page overflow`);
 await page.goto(`http://127.0.0.1:${server.address().port}/games/recycle-rush/?scores=0`);await page.waitForFunction(()=>window.__wgaGameTab&&window.RecycleArcade);await page.locator('#mapGrid .hub-card').first().waitFor();assert.equal(await page.locator('#storyMissionList button:disabled').count(),4);assert.equal(await page.locator('#mapGrid .hub-card').count(),8);
 await activate('#storyStartBtn');await named('Start Mission');await noOverflow();await page.waitForFunction(()=>document.getElementById('storyCircuit').classList.contains('sprite-ready')&&document.getElementById('storyCircuitCanvas').dataset.frame!==undefined);await bounds('#storyScene');await bounds('#storyPauseBtn');
 for(let i=0;i<6;i++){await bounds('#story-item-'+i);const b=await page.locator('#story-item-'+i).boundingBox();assert.ok(b.width>=44&&b.height>=44);}
 await activate('#story-item-0');await bounds('[data-route="paper"]');await activate('[data-route="containers"]');assert.match(await page.locator('#storyStatus').textContent(),/try again/i);await activate('#storyHintBtn');assert.match(await page.locator('#storyStatus').textContent(),/paper/i);assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).session.hints,L.SAVE_KEY),1);
 await page.screenshot({path:path.join(output,`${width}-${height}-story.png`)});
 if(width===390&&await page.locator('#storyFullscreen .wga-tab-fullscreen').count()){await activate('#storyFullscreen .wga-tab-fullscreen');await page.waitForFunction(()=>document.fullscreenElement);await activate('#storyFullscreen .wga-tab-fullscreen');await page.waitForFunction(()=>!document.fullscreenElement);}

 await activate('#storyBoardBtn');assert.match(await page.locator('#storyModalTitle').textContent(),/service/i);assert.match(await page.locator('#storyModalContent').textContent(),/fictional/);await named('Back to Mission');
 await activate('#storyPauseBtn');await page.keyboard.press('Tab');assert.equal(await page.locator('#storyModal').evaluate(el=>el.contains(document.activeElement)),true);await named('Resume');
 if(width===390){await page.setViewportSize({width:844,height:390});await noOverflow();await bounds('[data-route="paper"]');assert.match(await page.locator('#storyItemName').textContent(),/newspaper/i);await page.setViewportSize({width,height});await bounds('#storyPauseBtn');}
 if(width===390){
  const cdp=await context.newCDPSession(page),target=await page.locator('#story-item-0').boundingBox(),route=await page.locator('[data-route="paper"]').boundingBox();
  const start={x:target.x+target.width/2,y:target.y+target.height/2},end={x:route.x+route.width/2,y:route.y+route.height/2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+15,y:start.y+15}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(await page.locator('#storyDragGhost').count(),0);assert.equal(await page.locator('#storyScore').textContent(),'0');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});for(let part=1;part<=6;part++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*part/6,y:start.y+(end.y-start.y)*part/6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();assert.equal(await page.locator('#storyScore').textContent(),'100');assert.equal(await page.locator('#story-item-0').isVisible(),false);await activate('#story-item-1');assert.equal(await page.locator('#storyItemName').textContent(),'Water bottle');
  await activate('#storyPauseBtn');await page.waitForFunction(()=>!document.querySelector('#storyModalShade').hidden);await page.locator('#storyModal input[type="checkbox"]').uncheck();await named('Resume');
  const first=await page.locator('#storyCircuitCanvas').getAttribute('data-frame');await page.waitForFunction(frame=>document.querySelector('#storyCircuitCanvas').dataset.frame!==frame,first);
  await page.evaluate(async()=>{for(const[type,sheet]of Object.entries(window.RecycleSprites.sheets)){const img=await window.RecycleSprites.load(type);if(!img||img.naturalWidth!==sheet.columns*256||img.naturalHeight!==sheet.rows*256)throw Error('Invalid sprite atlas geometry');const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');for(let f=0;f<sheet.columns*sheet.rows;f++){ctx.clearRect(0,0,256,256);const rect=window.RecycleSprites.rect(type,f);ctx.drawImage(img,rect.x,rect.y,256,256,0,0,256,256);const rgba=ctx.getImageData(0,0,256,256).data;let opaque=0;for(let n=3;n<rgba.length;n+=4)if(rgba[n]>32)opaque++;if(opaque<3000||rgba[3]!==0)throw Error('Missing alpha or character in '+type+' frame '+f);}}});
 }
 // Ordinary touch/click actions complete the mission, including preparation and destination paging.
 const full=width===390||width===1440;
 for(let mi=0;mi<(full?5:1);mi++){
  const m=L.missions[mi];assert.equal(await page.locator('#storyTitle').textContent(),m.title);
  for(let stop=0;stop<3;stop++){
   for(let i=0;i<6;i++){
    const item=L.items[m.sets[stop][i]];if(!await page.locator('#story-item-'+i).isVisible())continue;await activate('#story-item-'+i);
    if(L.play.kind(item)){await bounds('#storyPrepareBtn');await activate('#storyPrepareBtn');if(width===390&&mi===1&&stop===0&&i===0){await activate('[data-workstep="tilt"]');await page.reload();await page.waitForFunction(()=>window.__wgaGameTab);await activate('#storyStartBtn');await named('Continue Mission');await activate('#storyPrepareBtn');assert.equal(await page.locator('[data-workstep="tilt"]').isDisabled(),true);}if(full&&stop===0&&i<3)await page.screenshot({path:path.join(output,`${width}-${height}-mission${mi+1}-activity${i}.png`)});for(const[step]of L.play.activities[L.play.kind(item)].steps){if(await page.locator(`[data-workstep="${step}"]`).isDisabled())continue;await bounds(`[data-workstep="${step}"]`);await activate(`[data-workstep="${step}"]`);}assert.match(await page.locator('#storyItemCondition').textContent(),/Activity complete/);}
    if(!await page.locator(`[data-route="${item.route}"]`).count())await activate('#storyRoutesBtn');
    await bounds(`[data-route="${item.route}"]`);await activate(`[data-route="${item.route}"]`);
    if(width===390&&mi===0&&stop===0&&i===2){const score=await page.locator('#storyScore').textContent();await page.reload();await page.waitForFunction(()=>window.__wgaGameTab);await activate('#storyStartBtn');await named('Continue Mission');assert.equal(await page.locator('#storyScore').textContent(),score);assert.equal(await page.locator('.story-object.done').count(),3);}
   }
   if(stop<2){
    if(width===390&&mi===0&&stop===0){await page.reload();await page.waitForFunction(()=>window.__wgaGameTab);await activate('#storyStartBtn');assert.equal(await page.locator('#storyModalTitle').textContent(),'Area restored');}
    assert.equal(await page.getByRole('button',{name:'Next Area',exact:true}).isDisabled(),true);
    await activate(`[data-upgrade="${stop===0?'canopy':'shelf'}"]`);
    await named('Next Area');
    assert.equal(await page.locator('.story-project').count(),stop+1);
   }
  }
  if(mi===4){
   assert.match(await page.locator('#storyModalTitle').textContent(),/Power The Loop/);
   await page.screenshot({path:path.join(output,`${width}-${height}-boss.png`)});if(width===390){await named('Pause Duel');await named('Resume');assert.match(await page.locator('#storyModalTitle').textContent(),/Power The Loop/);}
   for(let wave=0;wave<3;wave++){assert.equal(await page.locator('#loopPulseBtn').isDisabled(),true);for(let n=wave*2;n<wave*2+2;n++){await bounds(`[data-wisp="${n}"]`);await activate(`[data-wisp="${n}"]`);}await bounds('#loopPulseBtn');await activate('#loopPulseBtn');
    if(width===390&&wave===0){await page.reload();await page.waitForFunction(()=>window.__wgaGameTab);await activate('#storyStartBtn');assert.match(await page.locator('#storyModalTitle').textContent(),/Power The Loop/);}
   }
  }
  assert.equal(await page.locator('#storyModalTitle').textContent(),'Mission restored!');await noOverflow();
  if(full&&mi<4){await named('Next Mission');await named('Start Mission');}
 }
 await page.screenshot({path:path.join(output,`${width}-${height}-restored.png`)});
 if(full){const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),L.SAVE_KEY);assert.equal(saved.unlocked,5);assert.equal(Object.keys(saved.stars).length,5);assert.equal(saved.stars['school-tomorrow'],3);}
 // The existing arcade remains reachable from the same map.
 await named(full?'Return to Verdale':'World Map');await activate('#startNextBtn');await activate('#comicContinueBtn');await bounds('#gameCanvas');await bounds('#pauseBtn');await noOverflow();
 await page.waitForFunction(()=>window.__recyclePaint?.some(p=>p.w===50&&p.y>30&&/\/(newspaper|bottle|peel)\.webp$/.test(p.src)));
 const item=await page.evaluate(()=>window.__recyclePaint.find(p=>p.w===50&&p.y>30&&/\/(newspaper|bottle|peel)\.webp$/.test(p.src)));
 const bin=await page.evaluate(src=>window.__recyclePaint.find(p=>p.w===28&&p.src===src),item.src);assert.ok(bin);
 const area=await page.locator('#gameCanvas').boundingBox();
 if(touch){await page.touchscreen.tap(area.x+item.x,area.y+item.y);await page.touchscreen.tap(area.x+bin.x,area.y+bin.y);}else{await page.mouse.click(area.x+item.x,area.y+item.y);await page.mouse.click(area.x+bin.x,area.y+bin.y);}
 await page.waitForFunction(()=>Number(document.getElementById('scoreValue').textContent)>0);
 await activate('#pauseBtn');assert.equal(await page.locator('#pauseBtn').textContent(),'Resume');await activate('#pauseBtn');await activate('#muteBtn');assert.equal(await page.locator('#muteBtn').textContent(),'Unmute');await activate('#restartBtn');
 assert.deepEqual(errors,[]);results.push({width,height,touch,storyMissionsCompleted:full?5:1,errors});await context.close();
 }
 // Storage and audio failures must still allow learning and a clear save status.
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});window.AudioContext=class{constructor(){throw Error('blocked');}};window.webkitAudioContext=undefined;});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${server.address().port}/games/recycle-rush/?scores=0`);await page.locator('#storyStartBtn').tap();await page.getByRole('button',{name:'Start Mission',exact:true}).tap();await page.locator('#story-item-0').tap();await page.locator('[data-route="paper"]').tap();assert.match(await page.locator('#storySaveStatus').textContent(),/unavailable/);assert.equal(await page.locator('#storyScore').textContent(),'100');assert.deepEqual(errors,[]);await context.close();
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length,output}));
 }finally{await browser?.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
