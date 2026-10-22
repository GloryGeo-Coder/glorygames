const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const L=require('../../public/games/math-sprint-arena/learning-data.js');
const A=require('../../public/games/math-sprint-arena/arena-audio.js');
const root=path.resolve(__dirname,'../../public/games/math-sprint-arena');
async function boot({saved=new Map(),failStorage=false,failAssets=false,width=390,height=400}={}){
 const elements=new Map(),messages=[],requests=[];
 class Element{constructor(tag='div'){this.tagName=tag.toUpperCase();this.events={};this.children=[];this.style={};this.dataset={};this.textContent='';this.disabled=false;this.open=false;this.hidden=false;this.classes=new Set();this.classList={add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),contains:k=>this.classes.has(k),toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};}
 addEventListener(k,f){(this.events[k]??=[]).push(f);}emit(k,e={}){for(const f of this.events[k]||[])f({target:this,preventDefault(){},...e});}click(){this.emit('click');}appendChild(e){this.children.push(e);}append(...e){this.children.push(...e);}set innerHTML(v){this.children=[];this.html=v;}get innerHTML(){return this.html||'';}getBoundingClientRect(){return{width,height,x:0,y:0};}}
 for(const m of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<([a-z][\w-]*)\b[^>]*\bid="([^"]+)"[^>]*>/g)){const e=new Element(m[1]);e.id=m[2];elements.set(e.id,e);}
 const ctx=new Proxy({},{get(t,k){return ['createLinearGradient','createRadialGradient'].includes(k)?()=>({addColorStop(){}}):()=>{};}});elements.get('gameCanvas').getContext=()=>ctx;
 const document=new Element();document.body=new Element('body');document.body.dataset.view='home';document.getElementById=id=>elements.get(id);document.createElement=tag=>new Element(tag);document.hidden=false;
 const window=new Element();Object.assign(window,{devicePixelRatio:2,matchMedia:()=>({matches:false}),location:{origin:'https://example.test'},MathLearning:L,MathSound:{start(){},pause(){},effect(){},themes:A.themes},GG:{setScore(score){messages.push({type:'score',score});},submitScore(score){messages.push({type:'submit',score});},endRound(){}},localStorage:{getItem(k){if(failStorage)throw Error('blocked');return saved.get(k)||null;},setItem(k,v){if(failStorage)throw Error('blocked');saved.set(k,v);}}});window.parent=window;window.postMessage=d=>messages.push(d);
 class Image{set src(value){requests.push(value);this.naturalWidth=1000;queueMicrotask(()=>failAssets?this.onerror?.():this.onload?.());}}
 const context=vm.createContext({window,document,localStorage:window.localStorage,Image,console,Math,performance:{now:()=>0},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){}});
 let code=fs.readFileSync(path.join(root,'game.js'),'utf8');code=code.replace('  bindEvents();','  globalThis.probe={state,WORLDS,LEVEL_COUNT,generateQuestion,chooseAnswer,nextRound,completeLevel,startGame,resetGame,hint,skip,update,saveSprint,restoreSprint,draw,get pending(){return pending;}};\n  bindEvents();');vm.runInContext(code,context);
 const initialRequests=requests.length;document.body.dataset.view='sprint';await window.MathSprintLegacy.enter();
 return {probe:context.probe,elements,window,document,messages,requests,saved,initialRequests};
}
module.exports={boot,root};
