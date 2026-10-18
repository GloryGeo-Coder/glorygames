/* Executes shipped game code. DOM geometry is supplied; this adapter does not emulate CSS. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../public/games/bubble-pop-arena');
async function boot({width=390,height=690,offsetX=0,offsetY=90,saved=new Map(),failStorage=false,failAssets=false,audio={},nativeCanvas,seed=125}={}){
 let clock=0,doc,drawCalls=0,assetsReady;const elements=new Map(),frames=[],messages=[],requests=[],captures=new Set(),decoded=new Map();
 class Element{
  constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.attrs=attrs;this.id=attrs.id;this.events={};this.style={};this.disabled='disabled'in attrs;this.hidden='hidden'in attrs;this.value=attrs.value||'';this.textContent='';this.className=attrs.class||'';}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}emit(k,props={}){const e={type:k,target:this,button:0,pointerId:1,pointerType:'touch',preventDefault(){this.prevented=true;},...props};for(const f of this.events[k]||[])f(e);return e;}
  click(){if(!this.disabled)this.emit('click');}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]??null;}
  getBoundingClientRect(){return {left:offsetX,top:offsetY,x:offsetX,y:offsetY,width,height,right:offsetX+width,bottom:offsetY+height};}
  setPointerCapture(id){captures.add(id);}hasPointerCapture(id){return captures.has(id);}releasePointerCapture(id){captures.delete(id);this.emit('lostpointercapture',{pointerId:id});}
 }
 const fake=()=>new Proxy({}, {get(t,k){if(k in t)return t[k];if(['createLinearGradient','createRadialGradient'].includes(k))return()=>({addColorStop(){}});if(k==='drawImage')return im=>{if(!im)throw Error('null image');drawCalls++;};return()=>{drawCalls++;};}});
 const ctx=nativeCanvas?nativeCanvas.getContext('2d'):fake();if(nativeCanvas){const draw=ctx.drawImage.bind(ctx);ctx.drawImage=(im,...args)=>draw(decoded.get(im)||im,...args);}
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)){const a={};for(const x of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))a[x[1]]=x[2]??'';const el=new Element(m[1],a);if(a.id)elements.set(a.id,el);}
 const canvas=elements.get('c');canvas.parentElement=new Element();canvas.getContext=()=>ctx;if(nativeCanvas)for(const k of ['width','height'])Object.defineProperty(canvas,k,{get:()=>nativeCanvas[k],set:v=>{nativeCanvas[k]=v;}});
 doc=new Element();doc.hidden=false;doc.getElementById=id=>elements.get(id);doc.activeElement=null;
 const win=new Element();Object.assign(win,{document:doc,devicePixelRatio:2,innerWidth:width,innerHeight:height+150,visualViewport:new Element(),matchMedia:()=>({matches:false}),GG:{init(){},setScore(n){messages.push({type:'setScore',score:n});},submitScore(n){messages.push({type:'submit',score:n});},openOverlay(){messages.push({type:'overlay'});},openChat(){messages.push({type:'chat'});}}},audio);win.parent=win;win.postMessage=data=>messages.push(data);win.dispatchEvent=e=>win.emit(e.type,e);
 class Image{set src(url){this.url=url;requests.push(url);const p=path.join(root,url);if(failAssets||!fs.existsSync(p)){queueMicrotask(()=>this.onerror?.());return;}const b=fs.readFileSync(p);this.width=this.naturalWidth=b.readUInt32BE(16);this.height=this.naturalHeight=b.readUInt32BE(20);if(nativeCanvas)require('@napi-rs/canvas').loadImage(p).then(im=>{decoded.set(this,im);this.onload?.();}).catch(()=>this.onerror?.());else queueMicrotask(()=>this.onload?.());}}
 let rng=seed;const math=Object.create(Math);math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};win.Image=Image;
 const context=vm.createContext({window:win,document:doc,Image,Math:math,console,performance:{now:()=>clock},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail;}},localStorage:{getItem(k){if(failStorage)throw Error('blocked');return saved.get(k)??null;},setItem(k,v){if(failStorage)throw Error('blocked');saved.set(k,String(v));}},requestAnimationFrame:f=>frames.push(f)});
 for(const name of ['bubble-rules.js','bubble-music.js','bubble-audio.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name});
 let code=fs.readFileSync(path.join(root,'game.js'),'utf8').replace('preloadScenes();','globalThis.__assets=preloadScenes();');
 code=code.replace('  boot();',`globalThis.__bubble={startGame,setPaused,togglePause,endGame,submitScore,update,draw,resize,viewport,spawnBubble,onPop,tryPopSegment,resetInput,advanceWave,audio,settings,images,get bubbles(){return bubbles;},get particles(){return particles;},get texts(){return floatingTexts;},get state(){return {running,paused,gameOver,ready,score,combo,timeLeft,freezeTimer,feverMeter,feverTimer,pops,elapsed,wave,sceneIndex,pointerId,best,transition};},setState(s){if('score'in s)score=s.score;if('pops'in s)pops=s.pops;if('elapsed'in s)elapsed=s.elapsed;if('timeLeft'in s)timeLeft=s.timeLeft;if('feverMeter'in s)feverMeter=s.feverMeter;if('freezeTimer'in s)freezeTimer=s.freezeTimer;}};globalThis.__ready=boot();`);
 vm.runInContext(code,context,{filename:'bubble-pop-arena/game.js'});await context.__ready;await context.__assets;const probe=context.__bubble;
 return {probe,elements,canvas,doc,win,messages,requests,captures,saved,get drawCalls(){return drawCalls;},
  step(seconds){const n=Math.round(seconds*120);for(let i=0;i<n;i++){clock+=1000/120;probe.update(1/120);}},
  frame(ms=1000/60){clock+=ms;for(const f of frames.splice(0))f(clock);},
  resizeTo(w,h){width=w;height=h;win.innerWidth=w;win.innerHeight=h+150;win.visualViewport.emit('resize');},
  tap(x,y,id=1){canvas.emit('pointerdown',{clientX:x+offsetX,clientY:y+offsetY,pointerId:id});canvas.emit('pointerup',{clientX:x+offsetX,clientY:y+offsetY,pointerId:id});},
  swipe(ax,ay,bx,by,id=1){canvas.emit('pointerdown',{clientX:ax+offsetX,clientY:ay+offsetY,pointerId:id});canvas.emit('pointermove',{clientX:bx+offsetX,clientY:by+offsetY,pointerId:id});canvas.emit('pointerup',{clientX:bx+offsetX,clientY:by+offsetY,pointerId:id});}
 };
}
module.exports={boot,root};
