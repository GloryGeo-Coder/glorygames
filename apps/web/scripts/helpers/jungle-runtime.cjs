/* Execute the shipped game; DOM/viewport adapters do not emulate browser CSS. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../public/games/lost-jungle-3d-temple-of-the-sun');
async function boot({width=1280,height=720,saved=new Map(),failStorage=false,failAssets=false,nativeCanvas,audio={}}={}){
 let clock=0,doc;const frames=[],calls=[],messages=[],requests=[],canvases=[],captures=new Set(),intervals=new Map(),images=new Map(),elements=new Map(),nodes=[];let intervalId=0;
 class Element{
  constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.attrs=attrs;this.id=attrs.id;this.disabled='disabled'in attrs;this.style={setProperty(k,v){this[k]=v;}};this.events={};this.children=[];this.textContent='';this.value=attrs.value||'';this.dataset={};this.classes=new Set((attrs.class||'').split(' '));this.classList={add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),contains:k=>this.classes.has(k),toggle:(k,on)=>on??!this.classes.has(k)?this.classes.add(k):this.classes.delete(k)};}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
  emit(k,props={}){const e={target:this,code:'',pointerId:1,pointerType:'touch',button:0,preventDefault(){this.prevented=true;},...props};for(const fn of this.events[k]||[])fn(e);return e;}
  click(){if(!this.disabled)this.emit('click');}
  setAttribute(k,v){this.attrs[k]=v;}
  appendChild(el){this.children.push(el);return el;}
  get innerHTML(){return this.html||'';}set innerHTML(v){this.html=v;this.children=[];}
  focus(){doc.activeElement=this;}
  setPointerCapture(id){captures.add(id);}hasPointerCapture(id){return captures.has(id);}
  releasePointerCapture(id){captures.delete(id);this.emit('lostpointercapture',{pointerId:id});}
  closest(selector){return nodes.find(e=>e.classes.has(selector.slice(1)));}
  getBoundingClientRect(){return {x:0,y:0,top:0,left:0,width:win.innerWidth,height:win.innerHeight,bottom:win.innerHeight};}
 }
 const makeContext=()=>new Proxy({}, {get(target,key){if(key in target)return target[key];if(key==='measureText')return s=>({width:String(s).length*8});if(key==='createLinearGradient'||key==='createRadialGradient')return()=>({addColorStop(){}});if(key==='createPattern')return()=>({pattern:true});return(...args)=>calls.push([key,...args]);}});
 function adaptContext(ctx){const draw=ctx.drawImage.bind(ctx);ctx.drawImage=(img,...args)=>draw(images.get(img)||img,...args);return ctx;}
 const ctx=nativeCanvas?adaptContext(nativeCanvas.getContext('2d')):makeContext();
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)){const attrs={};for(const a of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[a[1]]=a[2]??'';const e=new Element(m[1],attrs);nodes.push(e);if(attrs.id)elements.set(attrs.id,e);}
 const canvas=elements.get('gameCanvas');canvas.getContext=()=>ctx;
 if(nativeCanvas)for(const key of ['width','height'])Object.defineProperty(canvas,key,{get:()=>nativeCanvas[key],set:v=>{nativeCanvas[key]=v;}});
 doc=new Element();doc.hidden=false;doc.documentElement=new Element('html');doc.body=new Element('body');doc.head=new Element('head');doc.getElementById=id=>elements.get(id);doc.querySelector=selector=>selector[0]==='.'?nodes.find(n=>n.classes.has(selector.slice(1))):nodes.find(n=>n.tagName===selector.toUpperCase());
 doc.createElement=tag=>{if(tag==='canvas'){let c;if(nativeCanvas){c=require('@napi-rs/canvas').createCanvas(1,1);const get=c.getContext.bind(c);let context;c.getContext=()=>context??=adaptContext(get('2d'));}else{c=new Element('canvas');c.width=1;c.height=1;c.getContext=()=>makeContext();}canvases.push(c);return c;}return new Element(tag);};
 const win=new Element();Object.assign(win,{innerWidth:width,innerHeight:height,devicePixelRatio:2,visualViewport:new Element(),location:{origin:'https://webgamearena.com'},matchMedia:()=>({matches:false})});Object.assign(win,audio);win.visualViewport.height=height;win.parent=win;win.postMessage=(message,origin)=>messages.push({message,origin});
 const sandbox={window:win,document:doc,console:{info(){},warn(){},error(){}},performance:{now:()=>clock},localStorage:{getItem:k=>{if(failStorage)throw Error('storage unavailable');return saved.get(k)??null;},setItem:(k,v)=>{if(failStorage)throw Error('storage unavailable');saved.set(k,String(v));}},setTimeout,clearTimeout,requestAnimationFrame:fn=>frames.push(fn),setInterval:fn=>{intervals.set(++intervalId,fn);return intervalId;},clearInterval:id=>intervals.delete(id),
  Image:class{set src(url){this.url=url;if(!url)return;requests.push(url);const file=path.join(root,url);if(!fs.existsSync(file)||failAssets){queueMicrotask(()=>this.onerror?.());return;}const png=fs.readFileSync(file);this.width=this.naturalWidth=png.readUInt32BE(16);this.height=this.naturalHeight=png.readUInt32BE(20);this.complete=true;if(nativeCanvas)require('@napi-rs/canvas').loadImage(file).then(image=>{images.set(this,image);this.onload?.();}).catch(()=>this.onerror?.());else queueMicrotask(()=>this.onload?.());}}
 };
 const context=vm.createContext(sandbox);for(const file of ['jungle-campaign.js','jungle-animation-data.js','jungle-animation.js','jungle-music.js','jungle-audio.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
 let code=fs.readFileSync(path.join(root,'game.js'),'utf8');code=code.replace('  bindEvents();resizeCanvas();buildLevel();',`globalThis.__jungleProbe={player,game,keys,touch,LEVELS,ASSETS,assetImages,camera,startGame,buildLevel,showCutscene,continueCutscene,jump,dash,shoot,update,updatePlayer,updateWorld,updateBullets,updateMovingPlatforms,collectItems,collectPower,activatePlate,canOpenGate,checkGateAndExit,loseLife,defeatEnemy,damageBoss,bossDefeated,completeLevel,nextLevel,updateAutoAdvance,triggerGameOver,resetRun,setPaused,openMap,closeMap,renderMap,resetInput,saveState,postScore,resizeCanvas,computeCamera,worldToScreen,draw,startNewChallenge,addChallengeProgress,updateChallenge,get state(){return state;},get scale(){return viewScale;},get getW(){return getW();},get getH(){return getH();}};\n  bindEvents();resizeCanvas();buildLevel();`);
 vm.runInContext(code,context,{filename:'lost-jungle/game.js'});const probe=context.__jungleProbe;await probe.game.loading;
 return {...probe,get state(){return probe.state;},get scale(){return probe.scale;},get getW(){return probe.getW;},get getH(){return probe.getH;},elements,win,doc,ctx,calls,saved,messages,requests,canvases,captures,intervals,
  frame(ms=1000/60){clock+=ms;const pending=frames.splice(0);for(const fn of pending)fn(clock);},resize(w,h){win.innerWidth=w;win.innerHeight=h;win.visualViewport.height=h;win.visualViewport.emit('resize');},async ready(){await probe.game.loading;}};
}
module.exports={boot,root};
