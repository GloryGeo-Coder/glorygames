/* Actual pinned PlayCanvas engine with its NullGraphicsDevice. DOM/audio are adapters;
 * glTF parsing, scene entities, transforms and geometry use the shipped engine. */
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const base=path.resolve(__dirname,'../../public/games/high-spead-racer');
class Element {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.style={};this.dataset={};this.listeners={};this.children=[];this.textContent='';this.clientWidth=1280;this.clientHeight=720;this.width=1280;this.height=720;this.attributes={};this.value='';this.disabled=false;
    const set=new Set();this.classList={add:v=>set.add(v),remove:v=>set.delete(v),contains:v=>set.has(v),toggle(v,on){on??=!set.has(v);if(on)set.add(v);else set.delete(v);}};}
  addEventListener(t,f){(this.listeners[t]??=[]).push(f);} removeEventListener(){}
  emit(t,props={}){for(const f of this.listeners[t]||[])f({type:t,target:this,preventDefault(){},stopPropagation(){},...props});}
  appendChild(e){e.parentElement=this;this.children.push(e);return e;} append(...e){e.forEach(x=>this.appendChild(x));}
  remove(){} setAttribute(k,v){this.attributes[k]=v;} getAttribute(k){return this.attributes[k]??null;}
  getBoundingClientRect(){return {left:0,top:0,width:this.width,height:this.height};}
  querySelector(){return new Element('button');} querySelectorAll(){return [];} focus(){} setPointerCapture(){}
  set innerHTML(s){this.html=s;for(const m of s.matchAll(/id="([^"]+)"/g))elements.set(m[1],new Element());} get innerHTML(){return this.html||'';}
}
class Canvas extends Element {constructor(){super('canvas');} getContext(){return new Proxy({canvas:this,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]??(()=>{})});}}
const elements=new Map();
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
for(const m of html.matchAll(/id="([^"]+)"/g))elements.set(m[1],new Element());
const canvas=new Canvas();canvas.id='application-canvas';elements.set(canvas.id,canvas);
const win=new Element();win.innerWidth=1280;win.innerHeight=720;win.devicePixelRatio=1;win.matchMedia=()=>({matches:false});win.visualViewport=new Element();win.parent=win;win.messages=[];win.postMessage=d=>win.messages.push(d);
const document=new Element();document.body=new Element('body');document.documentElement=new Element('html');document.hidden=false;
document.getElementById=id=>elements.get(id)||null;document.createElement=t=>t==='canvas'?new Canvas():new Element(t);document.querySelectorAll=()=>[];document.createEvent=()=>({initMouseEvent(){}});
const saved=new Map(); const storage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v))};
Object.assign(globalThis,{window:win,document,HTMLCanvasElement:Canvas,HTMLImageElement:class{},HTMLVideoElement:class{},ImageBitmap:class{},Image:class{},screen:{width:1280,height:720},localStorage:storage,ResizeObserver:class{observe(){} disconnect(){}},Audio:class {constructor(){this.volume=0;this.paused=true;this.duration=1;}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}addEventListener(){}},requestAnimationFrame:()=>0,cancelAnimationFrame(){}});
const pc=require(path.join(base,'vendor/playcanvas-2.23.1.min.js'));
let app;
class Application extends pc.Application {
  constructor(c,o){super(c,{...o,graphicsDevice:new pc.NullGraphicsDevice(c)});app=this;}
  start(){} resizeCanvas(w,h){this.graphicsDevice.resizeCanvas(w,h);}
}
const wrapped={...pc,Application}; globalThis.pc=wrapped;
pc.http.get=(url,options,callback)=>{
  if(typeof options==='function'){callback=options;options={};}
  try{if(globalThis.__failRacerAssets)throw Error('Asset failure test');const b=fs.readFileSync(path.resolve(base,url.split('?')[0]));queueMicrotask(()=>callback(null,b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)));}
  catch(e){queueMicrotask(()=>callback(e));}
};
const realLoad=pc.AssetRegistry.prototype.loadFromUrl;
pc.AssetRegistry.prototype.loadFromUrl=function(url,type,cb){
  if(type==='texture'){
    const asset=new pc.Asset(url,'texture',{url});asset.resource=new pc.Texture(this._loader._app.graphicsDevice,{width:1,height:1});queueMicrotask(()=>cb(null,asset));return asset;
  }
  return realLoad.call(this,url,type,cb);
};
function boot(profile,{failAssets=false}={}){
  globalThis.__failRacerAssets=failAssets;
  if(profile) storage.setItem('high-spead-racer-profile-v1',JSON.stringify(profile));
  vm.runInThisContext(fs.readFileSync(path.join(base,'racer-3d.js'),'utf8'),{filename:'racer-3d.js'});
  let code=fs.readFileSync(path.join(base,'game.js'),'utf8');
  code=code.replace(/\}\)\(\);\s*$/,`globalThis.__racerProbe={state,profile,LEVELS,app,playerCar,trafficCars,rivalCars,pickups,hazards,modelCars,CONTINUOUS_ROAD,presentation,startGame,resetWorld,updateGame,updatePlayer,updateTraffic,updatePickups,updateLapState,handleKeyboard,moveLeft,moveRight,setNitro,togglePause,advanceLevel,endGame,spawnTrafficCar,rectHit,selectOrBuyCar,buyUpgrade,postScore};})();`);
  vm.runInThisContext(code,{filename:'game.js'});
  return globalThis.__racerProbe;
}
module.exports={boot,elements,win,document,storage,saved,pc,base};
