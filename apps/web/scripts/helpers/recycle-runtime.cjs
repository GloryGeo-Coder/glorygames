/* Runs the shipped arcade code with deterministic time and supplied canvas geometry. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../public/games/recycle-rush');
async function boot({width=390,height=440,saved=new Map(),failStorage=false,failAssets=false,audio={}}={}){
 let clock=0,draws=0;const elements=new Map(),events={},frames=[],messages=[],requests=[],timers=new Map(),captures=new Set();let nextTimer=1;
 class Element{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.style={setProperty(){}};this.events={};this.children=[];this.hidden=false;this.disabled=false;this.textContent='';this._classes=new Set();this.classList={add:k=>this._classes.add(k),remove:k=>this._classes.delete(k),contains:k=>this._classes.has(k),toggle:(k,v)=>{if(v===undefined)v=!this._classes.has(k);v?this._classes.add(k):this._classes.delete(k);}};}
  addEventListener(k,f){(this.events[k]??=[]).push(f);}emit(k,e={}){for(const f of this.events[k]||[])f({target:this,button:0,pointerId:1,pointerType:'touch',preventDefault(){},...e});}appendChild(e){this.children.push(e);}set innerHTML(v){this.children=[];this._html=v;}get innerHTML(){return this._html||'';}
  getBoundingClientRect(){return{left:0,top:0,width,height};}setPointerCapture(id){captures.add(id);}hasPointerCapture(id){return captures.has(id);}releasePointerCapture(id){captures.delete(id);this.emit('lostpointercapture',{pointerId:id});}
 }
 const ctx=new Proxy({},{get(t,k){if(k in t)return t[k];if(['createRadialGradient','createLinearGradient'].includes(k))return()=>({addColorStop(){}});return()=>{draws++;};}});
 for(const m of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<([a-z][\w-]*)\b[^>]*\bid="([^"]+)"[^>]*>/g)){const e=new Element(m[1]);e.id=m[2];e.hidden=m[0].includes(' hidden');elements.set(e.id,e);}
 const canvas=elements.get('gameCanvas');canvas.getContext=()=>ctx;
 const document=new Element();document.body=new Element('body');document.hidden=false;document.getElementById=id=>elements.get(id);document.createElement=tag=>new Element(tag);document.querySelectorAll=()=>[];
 const window=new Element();Object.assign(window,{devicePixelRatio:2,matchMedia:()=>({matches:false}),localStorage:{getItem(k){if(failStorage)throw Error('blocked');return saved.get(k)||null;},setItem(k,v){if(failStorage)throw Error('blocked');saved.set(k,String(v));}},GG:{setScore(score){messages.push({type:'setScore',score});},submitScore(score){messages.push({type:'submit',score});}},...audio});window.parent=window;window.postMessage=p=>messages.push(p);
 class Image{set src(v){this.srcValue=v;requests.push(v);this.naturalWidth=1024;this.naturalHeight=576;queueMicrotask(()=>{if(failAssets||!fs.existsSync(path.join(root,v)))this.onerror?.();else this.onload?.();});}}
 const timer=(f,ms)=>{const id=nextTimer++;timers.set(id,{f,at:clock+ms,ms});return id;};
 const context=vm.createContext({window,document,Image,console,Math,performance:{now:()=>clock},requestAnimationFrame:f=>frames.push(f),setTimeout:timer,clearTimeout:id=>timers.delete(id),setInterval:timer,clearInterval:id=>timers.delete(id),confirm:()=>true});
 let code=fs.readFileSync(path.join(root,'game.js'),'utf8');code=code.replace('  loadAssets().then(() => {', '  globalThis.probe={state,save,startLevel,initLevel,startLoop,buildBins,spawnItem,handleCatch,damageBoss,checkClear,completeLevel,update,draw,resize,postScore,renderMap,togglePause,usePower}; globalThis.ready=loadAssets().then(() => {');vm.runInContext(code,context);await context.ready;
 return{probe:context.probe,elements,window,document,canvas,messages,requests,captures,saved,get draws(){return draws;},step(dt){clock+=dt*1000;context.probe.update(dt);},resize(w,h){width=w;height=h;context.probe.resize();},emit(k,e){canvas.emit(k,e);},fireTimers(){for(const [id,t]of timers){if(clock>=t.at){timers.delete(id);t.f();}}}};
}
module.exports={boot,root};
