const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const {spawn}=require('node:child_process');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const web=path.resolve(__dirname,'..'),base='http://127.0.0.1:3017',shots=process.env.SCIENCE_SCREENSHOTS;
let browser,server;
async function screenshot(page,name){if(shots){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,name+'.png')});}}
(async()=>{
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','-p','3017'],{
    cwd:web,env:{...process.env,DATABASE_URL:''},stdio:['ignore','pipe','pipe']
  });
  let logs='';server.stderr.on('data',d=>logs+=d.toString());
  await new Promise((resolve,reject)=>{
    let ready=false;
    const timer=setTimeout(()=>reject(Error('Next server readiness timeout: '+logs.slice(-1500))),15000);
    server.stdout.on('data',d=>{if(d.toString().includes('Ready')){ready=true;clearTimeout(timer);resolve();}});
    server.on('error',e=>{clearTimeout(timer);reject(e);});
    server.on('exit',code=>{if(!ready){clearTimeout(timer);reject(Error('Next exited '+code+': '+logs.slice(-1500)));}});
  });
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
  for(const [width,height]of [[320,568],[390,844],[1440,900]]){
    const context=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:true}),page=await context.newPage();
    for(const route of ['/play/science-lab-dash','/games/science-lab-dash','/categories/educational']){
      const response=await page.goto(base+route);assert.equal(response.status(),200);
      const body=await page.locator('body').innerText();assert.match(body,/35/);assert.match(body,/105/);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Overflow '+route+' '+width);
      if(route.includes('science-lab-dash')){
        assert.match(body,/Grade 10:/);assert.match(body,/Element Core Investigator/);
        assert.match(await page.locator('meta[name=description]').getAttribute('content'),/35 untimed adventure missions and 105 investigations/);
        assert.equal(await page.locator('iframe').count(),0);
        const image=page.locator('img[src="/games/science-lab-dash/thumb.png"]').first();
        await image.scrollIntoViewIfNeeded();await image.evaluate(im=>im.decode());
        assert.ok(await image.evaluate(im=>im.naturalWidth>0),'Science thumbnail did not load');
        assert.equal((await context.request.get(base+'/games/science-lab-dash/thumb.png')).status(),200);
      }
      if(route.startsWith('/play')){
        assert.match(body,/Game Chat/);assert.match(body,/Live score/);
        await page.evaluate(()=>scrollTo(0,0));await screenshot(page,'information-'+width);
        if(width===390){
          const [popup]=await Promise.all([page.waitForEvent('popup'),page.locator('a[href="/games/science-lab-dash/index.html"][target="_blank"]').first().click()]);
          await popup.waitForLoadState('domcontentloaded');assert.match(await popup.locator('body').innerText(),/35 story missions/);
          assert.equal(await popup.evaluate(()=>typeof window.scienceQA),'undefined');assert.equal(await popup.evaluate(()=>opener),null);
          await popup.locator('#overlayPrimary').click();await popup.locator('#storyContinue').click();
          assert.equal(await popup.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
          assert.equal(await popup.locator('#adventureCanvas').isVisible(),true);await popup.close();
        }
      }
      console.log('Built Next page: '+route+' '+width+'x'+height+' passed.');
    }
    await context.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server?.kill('SIGTERM');});
