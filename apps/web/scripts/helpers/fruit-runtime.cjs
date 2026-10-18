/* Run shipped Fruit Slice code with DOM/input adapters; CSS is not emulated. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../public/games/fruit-slice');
async function boot({width=390,height=844,saved=new Map(),failStorage=false,failAssets=false,audio={},nativeCanvas,offsetX=0,offsetY=0}={}){
 let clock=0,doc;const nodes=[],elements=new Map(),frames=[],messages=[],requests=[],canvases=[],captures=new Set(),decoded=new Map(),released=[];let drawCalls=0;
 class Element{
  constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.id=attrs.id;this.attrs=attrs;this.events={};this.children=[];this.style={setProperty(k,v){this[k]=v;}};this.disabled='disabled'in attrs;this.hidden='hidden'in attrs;this.value=attrs.value||'';this.textContent='';this.className=attrs.class||'';this.dataset={};}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
  emit(k,props={}){const e={type:k,target:this,button:0,pointerId:1,pointerType:'touch',preventDefault(){this.prevented=true;},...props};for(const fn of this.events[k]||[])fn(e);return e;}
  click(){if(!this.disabled)this.emit('click');}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]??null;}
  appendChild(e){this.children.push(e);return e;}get innerHTML(){return this.html||'';}set innerHTML(s){this.html=s;this.children=[];}
  focus(){doc.activeElement=this;}setPointerCapture(id){captures.add(id);}hasPointerCapture(id){return captures.has(id);}releasePointerCapture(id){captures.delete(id);this.emit('lostpointercapture',{pointerId:id});}
  getBoundingClientRect(){return {left:offsetX,top:offsetY,x:offsetX,y:offsetY,width:win.innerWidth,height:win.visualViewport.height,right:offsetX+win.innerWidth,bottom:offsetY+win.visualViewport.height};}
 }
 const fakeContext=()=>new Proxy({}, {get(t,k){if(k in t)return t[k];if(['createLinearGradient','createRadialGradient'].includes(k))return()=>({addColorStop(){}});if(k==='measureText')return x=>({width:String(x).length*8});if(k==='drawImage')return im=>{if(!im)throw Error('null sprite');drawCalls++;};return()=>{drawCalls++;};}});
 function adapt(ctx){const draw=ctx.drawImage.bind(ctx);ctx.drawImage=(im,...args)=>draw(decoded.get(im)||im,...args);return ctx;}
 const ctx=nativeCanvas?adapt(nativeCanvas.getContext('2d')):fakeContext();
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)){const attrs={};for(const a of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[a[1]]=a[2]??'';const el=new Element(m[1],attrs);nodes.push(el);if(attrs.id)elements.set(attrs.id,el);}
 const canvas=elements.get('c');canvas.getContext=()=>ctx;if(nativeCanvas)for(const key of ['width','height'])Object.defineProperty(canvas,key,{get:()=>nativeCanvas[key],set:v=>{nativeCanvas[key]=v;}});
 doc=new Element();doc.hidden=false;doc.documentElement=new Element('html');doc.body=new Element('body');doc.getElementById=id=>elements.get(id);
 doc.createElement=tag=>{if(tag==='canvas'){let c;if(nativeCanvas){c=require('@napi-rs/canvas').createCanvas(1,1);const get=c.getContext.bind(c);let context;c.getContext=()=>context??=adapt(get('2d'));}else{c=new Element('canvas');c.width=1;c.height=1;c.getContext=()=>fakeContext();}canvases.push(c);return c;}return new Element(tag);};
 const win=new Element();Object.assign(win,{innerWidth:width,innerHeight:height,devicePixelRatio:2,document:doc,visualViewport:new Element(),location:{origin:'https://webgamearena.com'},matchMedia:()=>({matches:false})},audio);win.visualViewport.height=height;win.parent=win;win.postMessage=(data,origin)=>messages.push({data,origin});win.dispatchEvent=e=>win.emit(e.type,e);
 class Image{
  set src(url){this.url=url;if(!url){released.push(this);decoded.delete(this);return;}requests.push(url);const file=path.join(root,url);if(failAssets||!fs.existsSync(file)){queueMicrotask(()=>this.onerror?.());return;}const b=fs.readFileSync(file);this.width=this.naturalWidth=b.readUInt32BE(16);this.height=this.naturalHeight=b.readUInt32BE(20);if(nativeCanvas)require('@napi-rs/canvas').loadImage(file).then(im=>{decoded.set(this,im);this.onload?.();}).catch(()=>this.onerror?.());else queueMicrotask(()=>this.onload?.());}
 }
 win.Image=Image;
 const sandbox={window:win,document:doc,console,Image,performance:{now:()=>clock},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail;}},localStorage:{getItem(k){if(failStorage)throw Error('storage denied');return saved.get(k)??null;},setItem(k,v){if(failStorage)throw Error('storage denied');saved.set(k,String(v));}},requestAnimationFrame:fn=>frames.push(fn)};
 const context=vm.createContext(sandbox);for(const file of ['fruit-levels.js','fruit-animation-data.js','fruit-render.js','fruit-music.js','fruit-audio.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 let code=fs.readFileSync(path.join(root,'game.js'),'utf8');code=code.replace(' boot();',`globalThis.__fruit={game,progress,renderer,audio,LEVELS,FRUITS,viewport,resize,startRound,setPaused,goMenu,renderPanel,openAux,renderMap,endRound,update,draw,spawnWave,spawnOne,trySliceSegment,sliceObject,triggerFrenzy,missed,pointLineDist,posFromEvent,resetInput,save,get best(){return best;}};globalThis.__ready=boot();`);
 vm.runInContext(code,context,{filename:'fruit-slice/game.js'});await context.__ready;const probe=context.__fruit;
 return {...probe,elements,win,doc,canvas,ctx,saved,messages,requests,canvases,released,captures,get best(){return probe.best;},get drawCalls(){return drawCalls;},
  step(seconds){const n=Math.round(seconds*120);for(let i=0;i<n;i++){clock+=1000/120;probe.update(1/120);}},
  frame(ms=1000/60){clock+=ms;for(const fn of frames.splice(0))fn(clock);},
  resizeTo(w,h){win.innerWidth=w;win.innerHeight=h;win.visualViewport.height=h;win.visualViewport.emit('resize');},
  swipe(ax,ay,bx,by,id=1){const v=probe.viewport(),p=(x,y)=>({pointerId:id,clientX:offsetX+x*v.scale,clientY:offsetY+y*v.scale});canvas.emit('pointerdown',p(ax,ay));canvas.emit('pointermove',p(bx,by));canvas.emit('pointerup',p(bx,by));}
 };
}
module.exports={boot,root};
