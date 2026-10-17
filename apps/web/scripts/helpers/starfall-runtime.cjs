/* Browser adapters around the shipped Babylon engine. Geometry, glTF, transforms and disposal are real. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../public/games/space-dodger');
const B=require(path.join(root,'vendor/babylon-9.31.0.js'));
vm.runInNewContext(fs.readFileSync(path.join(root,'vendor/babylon-loaders-9.31.0.min.js'),'utf8'),{BABYLON:B,module:{exports:{}},exports:{},require:()=>B,console,TextDecoder,TextEncoder,URL,Blob,ArrayBuffer,Uint8Array,setTimeout,clearTimeout});
class Element{
 constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.style={};this.dataset={};this.events={};this.textContent='';this.value='';this.checked=false;this.disabled=false;this.children=[];this.attrs={};this.classSet=new Set();this.classList={add:v=>this.classSet.add(v),remove:v=>this.classSet.delete(v),contains:v=>this.classSet.has(v),toggle:(v,on)=>{if(on??!this.classSet.has(v))this.classSet.add(v);else this.classSet.delete(v);}};
  for(const [k,v] of Object.entries(attrs)){this.attrs[k]=v;if(k==='id')this.id=v;if(k==='class')v.split(' ').forEach(c=>this.classSet.add(c));if(k==='checked')this.checked=true;if(k==='value')this.value=v;if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;}}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}removeEventListener(){}
 emit(k,props={}){for(const fn of this.events[k]||[])fn({target:this,preventDefault(){},stopPropagation(){},pointerId:1,...props});}
 click(){this.emit('click');}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}
 focus(){globalThis.document.activeElement=this;}setPointerCapture(){}appendChild(el){this.children.push(el);return el;}append(...els){this.children.push(...els);}prepend(el){this.children.unshift(el);}
 getBoundingClientRect(){return {left:0,top:0,width:window.innerWidth,height:window.innerHeight};}
 set innerHTML(v){this.html=v;}get innerHTML(){return this.html||'';}
}
class Canvas extends Element{constructor(webgl){super('canvas');this.webgl=webgl;this.width=1280;this.height=720;}
 getContext(kind){if(kind!=='2d')return this.webgl?{}:null;if(this.context)return this.context;const calls=[];this.context=new Proxy({canvas:this,calls,drawImage:(...args)=>calls.push(['drawImage',...args]),fillRect:(...args)=>calls.push(['fillRect',...args]),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),measureText:s=>({width:s.length*7})},{get:(o,k)=>o[k]??(()=>{})});return this.context;}}
function boot({webgl=true,failAssets=false,saved=new Map(),width=1280,height=720,AudioContext,deferTextures=false,failTextures=false}={}){
 const elements=new Map(),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const match of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/g)){const attrs={};for(const a of match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[a[1]]=a[2]??'';if(attrs.id||attrs['data-dir'])elements.set(attrs.id||attrs['data-dir'],new Element(match[1],attrs));}
 const canvas=new Canvas(webgl);canvas.id='renderCanvas';elements.set(canvas.id,canvas);
 const doc=new Element();doc.hidden=false;doc.body=new Element();doc.documentElement=new Element();doc.getElementById=id=>elements.get(id);doc.querySelector=()=>canvas;
 doc.querySelectorAll=selector=>selector.includes('data-dir')?[...elements.values()].filter(e=>e.dataset.dir||['fireBtn','boostBtn'].includes(e.id)):[];
 doc.createElement=tag=>tag==='canvas'?new Canvas(webgl):new Element(tag);
 const win=new Element();Object.assign(win,{innerWidth:width,innerHeight:height,devicePixelRatio:1,matchMedia:q=>({matches:q.includes('coarse')&&width<760}),visualViewport:new Element(),messages:[]});win.parent=win;win.postMessage=m=>win.messages.push(m);if(AudioContext)win.AudioContext=AudioContext;
 const store={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v))};let frame;
 Object.assign(globalThis,{window:win,document:doc,localStorage:store,HTMLCanvasElement:Canvas,Image:class{constructor(){this.complete=false;this.naturalWidth=0;}},requestAnimationFrame:f=>{frame=f;return 0;},cancelAnimationFrame(){}});
 class Engine extends B.NullEngine{constructor(){super({renderWidth:width,renderHeight:height});}static isSupported(){return webgl;}runRenderLoop(f){this.frame=f;}resize(){}getRenderWidth(){return win.innerWidth;}getRenderHeight(){return win.innerHeight;}getDeltaTime(){return 1000/60;}}
 const textures=[];
 class Texture extends B.RawTexture{
  constructor(url,scene,noMipmap,invertY,sampling,onLoad,onError){
   super(new Uint8Array([60,70,110,255]),1,1,B.Engine.TEXTUREFORMAT_RGBA,scene,false,false,B.Texture.NEAREST_SAMPLINGMODE);
   this.url=url;this.requestInvertY=invertY;this.failLoad=()=>onError?.();this.disposed=false;this._texture.isReady=!deferTextures&&!failTextures;textures.push(this);
   if(failTextures)queueMicrotask(()=>onError?.('test image failure'));else if(!deferTextures)queueMicrotask(()=>this.onLoadObservable.notifyObservers(this));
  }
  getSize(){return {width:1672,height:941};}
  getBaseSize(){return this.getSize();}
  finish(){if(!this.disposed){this._texture.isReady=true;this.onLoadObservable.notifyObservers(this);}}
  dispose(){this.disposed=true;super.dispose();}
 }
 const original=B.SceneLoader.LoadAssetContainerAsync.bind(B.SceneLoader),imports=[];
 const wrapped={...B,Engine,Texture,SceneLoader:{...B.SceneLoader,LoadAssetContainerAsync:async(dir,file,scene)=>{imports.push(file);if(failAssets)throw Error('Test download failure');return original('',new Uint8Array(fs.readFileSync(path.join(root,dir,file.split('?')[0]))),scene,undefined,'.glb');}}};
 win.BABYLON=wrapped;globalThis.BABYLON=wrapped;
 for(const file of ['starfall-systems.js','starfall-space.js','starfall-3d.js'])vm.runInThisContext(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
 let code=fs.readFileSync(path.join(root,'game.js'),'utf8');
 code=code.replace('    resizeFallback();\n    window.addEventListener',`    globalThis.__starfallProbe={state,LEVELS,campaign,systems,quality,fb,ship,fallbackSky,startGameFallback,retryFallback,endFallback,nextLevelFallback,damageFallback,spawnObject,spawnBossFallback,updateFallback,drawFallback,input:()=>inputControls};\n    resizeFallback();\n    window.addEventListener`);
 code=code.replace('  init();\n})();',`  init();globalThis.__starfallProbe={state,LEVELS,campaign,systems,quality,scene,engine,presentation,playerRoot,pools,beginLevel,startGame,completeLevel,endGame,retryMission,damagePlayer,spawnAsteroid,spawnEnemy,spawnPowerup,spawnGate,spawnRelay,spawnBoss,createExplosionSprite,makeRingEffect,updateSpawns,updateObjects,updateLasers,updateBoss,updateTimers,updatePlayer,updateEncounters,step,clearWorld,updateParticles,resizeFlight,camera,space,planetMeshes,warpStreaks,updateWorld,PLAYER_LIMIT,launchPlasma,collectPickup,checkLevelComplete,firePlayerLaser,mats,audio,music,input:()=>inputControls};})();`);
 vm.runInThisContext(code,{filename:'space-dodger/game.js'});
 return {...globalThis.__starfallProbe,elements,win,doc,saved,imports,textures,frame:()=>frame};
}
module.exports={boot,B,root};
