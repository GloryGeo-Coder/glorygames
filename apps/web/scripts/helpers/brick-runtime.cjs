/* Runs shipped Brick Blaster code with input, audio and DOM adapters; CSS is not emulated. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../public/games/brick-blaster');
function boot({width=390,height=650,offsetX=0,offsetY=70,saved=new Map(),failStorage=false,audio={},nativeCanvas,seed=725,dpr=2,reducedMotion=false}={}){
 let clock=0,doc,drawCalls=0;const elements=new Map(),frames=[],messages=[],captures=new Map();
 class Element{
  constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.attrs=attrs;this.id=attrs.id;this.events={};this.style={};this.disabled='disabled'in attrs;this.hidden='hidden'in attrs;this.value=attrs.value||'';this.textContent='';this.className=attrs.class||'';}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}emit(k,props={}){const e={type:k,target:this,currentTarget:this,button:0,pointerId:1,pointerType:'touch',preventDefault(){this.prevented=true;},...props};for(const f of this.events[k]||[])f(e);return e;}
  click(){if(!this.disabled)this.emit('click');}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]??null;}
  getBoundingClientRect(){return {left:offsetX,top:offsetY+(this.id==='controlZone'?height:0),width,height:this.id==='controlZone'?54:height};}
  focus(){doc.activeElement=this;}setPointerCapture(id){captures.set(id,this);}hasPointerCapture(id){return captures.get(id)===this;}releasePointerCapture(id){captures.delete(id);this.emit('lostpointercapture',{pointerId:id});}
 }
 const fake=()=>new Proxy({}, {get(t,k){if(k in t)return t[k];if(['createLinearGradient','createRadialGradient'].includes(k))return()=>({addColorStop(){}});return()=>{drawCalls++;};}});
 const ctx=nativeCanvas?nativeCanvas.getContext('2d'):fake();
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)){const a={};for(const x of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))a[x[1]]=x[2]??'';if(a.id)elements.set(a.id,new Element(m[1],a));}
 const canvas=elements.get('c');canvas.parentElement=new Element();canvas.getContext=()=>ctx;if(nativeCanvas)for(const k of ['width','height'])Object.defineProperty(canvas,k,{get:()=>nativeCanvas[k],set:v=>{nativeCanvas[k]=v;}});
 doc=new Element();doc.hidden=false;doc.getElementById=id=>elements.get(id);doc.activeElement=null;
 const win=new Element();Object.assign(win,{document:doc,devicePixelRatio:dpr,innerWidth:width,innerHeight:height+180,visualViewport:new Element(),matchMedia:()=>({matches:reducedMotion}),location:{origin:'https://webgamearena.com'},GG:{init(){},setSlug(){},setTitle(){},endRound(p){messages.push({type:'final',payload:p});},openOverlay(){messages.push({type:'overlay'});}}},audio);win.parent=win;win.postMessage=(data,origin)=>messages.push({data,origin});
 let rng=seed;const math=Object.create(Math);math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const context=vm.createContext({window:win,document:doc,Math:math,console,CanvasRenderingContext2D:class{},performance:{now:()=>clock},localStorage:{getItem(k){if(failStorage)throw Error('blocked');return saved.get(k)??null;},setItem(k,v){if(failStorage)throw Error('blocked');saved.set(k,String(v));}},fetch:async()=>({json:async()=>JSON.parse(fs.readFileSync(path.join(root,'game.json'),'utf8'))}),requestAnimationFrame:f=>frames.push(f)});
 vm.runInContext(fs.readFileSync(path.join(root,'brick-layout.js'),'utf8'),context,{filename:'brick-layout.js'});
 const code=fs.readFileSync(path.join(root,'game.js'),'utf8').replace('  loadMeta();\n  resize();',`globalThis.__brick={paddle,pointer,prefs,startGame,setPaused,togglePause,resetGame,endGame,nextLevel,buildLevel,step,draw,resize,launchBall,applyPowerUp,updateBall,reflectBall,normalizeBallSpeed,circleRectHit,makeBall,breakBrick,postScore,submitScore,baseBallSpeed,grid,resetInput,ensureAudio,sfx,stopSounds,get balls(){return balls;},get bricks(){return bricks;},get drops(){return drops;},get particles(){return particles;},get state(){return {running,paused,gameOver,score,lives,level,comboCount,comboTimer,maxCombo,fireballUntil,stickyUntil,playTime,boardRows,boardCols,viewW,viewH,DPR,GG_PAUSED,GG_MUTED};},setState(s){if('level'in s)level=s.level;if('lives'in s)lives=s.lives;if('score'in s)score=s.score;if('comboTimer'in s)comboTimer=s.comboTimer;}};\n  loadMeta();\n  resize();`);
 vm.runInContext(code,context,{filename:'brick-blaster/game.js'});const probe=context.__brick;
 return {probe,elements,canvas,doc,win,messages,captures,saved,get drawCalls(){return drawCalls;},
  step(seconds){const n=Math.round(seconds*120);for(let i=0;i<n;i++){clock+=1000/120;probe.step(1/120);}},
  frame(ms=1000/60){clock+=ms;for(const f of frames.splice(0))f(clock);},elapse(ms){clock+=ms;},
  resizeTo(w,h){width=w;height=h;win.innerWidth=w;win.innerHeight=h+180;win.visualViewport.emit('resize');this.frame(0);},
  event(target,type,x,y=25,props={}){const el=elements.get(target),r=el.getBoundingClientRect();return el.emit(type,{clientX:r.left+x,clientY:r.top+y,...props});},
  drag(target,from,to,props={}){this.event(target,'pointerdown',from,25,props);this.event(target,'pointermove',to,25,props);this.event(target,'pointerup',to,25,props);},
  tap(target,x,props={}){this.event(target,'pointerdown',x,25,props);this.event(target,'pointerup',x,25,props);}
 };
}
module.exports={boot,root};
