/* Test-only closure access; neither game runtime exposes fixtures in production. */
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public'),errors=[],shots=process.env.PHYSICS_SCREENSHOTS;let browser;
const server=http.createServer((req,res)=>{
  const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{let body=fs.readFileSync(p);
    if(p.endsWith('/physics-force-lab/game.js'))body=body.toString().replace('  boot();','  window.worldQA={state,buildLevel,draw};boot();');
    if(p.endsWith('/physics-force-lab/adventure.js'))body=body.toString().replace("  resize();open('homeDialog');requestAnimationFrame(loop);","  window.worldQA={profile,player,launch,draw,closeAll,freeze(){running=false;}};resize();open('homeDialog');requestAnimationFrame(loop);");
    res.setHeader('Content-Type',p.endsWith('.html')?'text/html':/\.m?js$/.test(p)?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.webp')?'image/webp':'image/png');res.end(body);
  }catch{res.writeHead(404).end();}
});
async function start(page,entry){await page.locator('#startBtn').click();if(entry==='index.html')await page.locator('#storyContinue').click();}
async function fixture(page,entry,index){
  await page.evaluate(({entry,index})=>{
    const q=worldQA;
    if(entry==='index.html'){
      for(const m of PhysicsAdventure.missions)q.profile.completed[m.id]=true;
      q.launch(index);q.closeAll();q.freeze();q.player.x=index===0?360:PhysicsAdventure.route(PhysicsAdventure.missions[index]).stations[0]-60;
    }else{
      q.state.levelIndex=index;q.buildLevel();q.state.paused=true;
      if(index===11){q.state.player.x=q.state.world.boss.x-220;q.state.camera=q.state.world.boss.x-400;}
      for(const d of document.querySelectorAll('dialog'))d.close();
    }
    window.dispatchEvent(new Event('resize'));q.draw();
  },{entry,index});
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
  const base=`http://127.0.0.1:${server.address().port}/games/physics-force-lab/`;
  for(const entry of ['index.html','original-labs.html']){
    const c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),p=await c.newPage(),responses=[];
    p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().includes('/assets/worlds/'))responses.push([r.url(),r.status()]);});
    await p.goto(base+entry+'?scores=0');await start(p,entry);
    const decoded=await p.evaluate(async()=>{
      const W=PhysicsWorldArt,decoded=[];
      for(const name of W.locations){if(!await W.load(name+'.webp'))throw Error('Missing world '+name);if(W.status().entries.length>3)throw Error('Cache exceeded');
        const im=new Image();im.src=W.source(name+'.webp');await im.decode();if(im.naturalWidth!==1024||im.naturalHeight!==576)throw Error('Wrong dimensions '+name);decoded.push(name);
      }return decoded;
    });assert.equal(decoded.length,12);assert.ok(responses.every(r=>r[1]===200));
    for(const [width,height]of [[320,568],[390,844],[568,280],[844,390],[768,1024],[1440,900]]){
      await p.setViewportSize({width,height});await fixture(p,entry,0);
      await p.evaluate(async()=>{await PhysicsWorldArt.load('level-01-force-lab.png');await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);worldQA.draw();});
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      const pixels=await p.locator('canvas').first().evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return [d[3],d[(c.width-1)*4+3],d[((c.height-1)*c.width)*4+3],d[d.length-1]];});assert.ok(pixels.every(v=>v===255),`${entry} transparent edge ${width}x${height}: ${pixels}`);
      if(shots&&[390,1440].includes(width)){fs.mkdirSync(shots,{recursive:true});await p.screenshot({path:path.join(shots,`${entry==='index.html'?'adventure':'original'}-${width}-illustrated.png`)});}
    }
    await p.setViewportSize({width:844,height:390});await fixture(p,entry,entry==='index.html'?29:11);await p.evaluate(async()=>{await PhysicsWorldArt.load('level-12-quantum-core.png');worldQA.draw();});
    if(shots)await p.screenshot({path:path.join(shots,`${entry==='index.html'?'adventure':'original'}-core-illustrated.png`)});
    await c.close();console.log(`${entry}: all twelve backgrounds decode, six layouts fill the viewport, bounded cache and final Core fixture passed.`);
  }
  for(const entry of ['index.html','original-labs.html'])for(const block of ['worlds','all-images','module']){
    const c=await browser.newContext({viewport:{width:390,height:844}});
    await c.route(block==='module'?'**/world-art.js':'**/assets/worlds/*.webp',r=>r.abort());
    if(block==='all-images')await c.route('**/assets/backgrounds/*.png',r=>r.abort());
    const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+entry+'?scores=0');await start(p,entry);
    if(block!=='module')await p.waitForFunction(f=>{const e=PhysicsWorldArt.status().entries[0];return e&&e.fallback&&(f==='all-images'||e.ready);},block);
    const before=await p.evaluate(()=>worldQA.player?.x??worldQA.state.player.x);await p.keyboard.down('d');await p.waitForTimeout(450);await p.keyboard.up('d');assert.ok(await p.evaluate(x=>(worldQA.player?.x??worldQA.state.player.x)>x,before));
    await c.close();
  }
  assert.deepEqual(errors,[]);console.log('Both modes remain playable with new worlds blocked, both background formats blocked, or the world-art module blocked. No uncaught errors.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
