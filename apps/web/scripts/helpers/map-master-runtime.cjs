/* Runs the shipped DOM/SVG controller. This adapter does not emulate browser CSS. */
const fs=require('node:fs'),path=require('node:path'),html=require('htmlparser2');
const root=path.resolve(__dirname,'../../public/games/map-master-africa');
const G=require(path.join(root,'atlas-geometry.js')),C=require(path.join(root,'academy-content.js')),D=require(path.join(root,'atlas-data.js'));
function boot({width=376,height=350,left=7,top=60,viewportWidth=390,viewportHeight=844,saved=new Map(),failStorage=false,audio={}}={}){
 let doc,win,clock=0,id=0;const frames=new Map(),messages=[],captures=new Set();
 class Target{
  constructor(){this.listeners={};}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}removeEventListener(type,fn){this.listeners[type]=(this.listeners[type]||[]).filter(x=>x!==fn);}
  dispatchEvent(e){if(!e.target)e.target=this;e.preventDefault??=()=>{e.defaultPrevented=true;};e.stopPropagation??=()=>{e.stopped=true;};let node=this;do{e.currentTarget=node;for(const fn of [...node.listeners?.[e.type]||[]])fn(e);node=e.bubbles===false||e.stopped?null:node.parentNode;}while(node);return !e.defaultPrevented;}
  emit(type,props={}){const e={type,button:0,pointerId:1,pointerType:'touch',...props};this.dispatchEvent(e);return e;}
 }
 const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 class Text{constructor(value){this.value=value;this.parentNode=null;}get textContent(){return this.value;}get outerHTML(){return escape(this.value);}}
 function matches(n,selector){if(!(n instanceof Element))return false;let s=selector.trim();if(s===':disabled')return n.disabled;for(const x of [...s.matchAll(/:not\(([^)]+)\)/g)]){if(matches(n,x[1]))return false;s=s.replace(x[0],'');}const tag=s.match(/^[\w-]+/);if(tag&&n.localName.toLowerCase()!==tag[0].toLowerCase())return false;for(const x of s.matchAll(/#([\w-]+)/g))if(n.id!==x[1])return false;for(const x of s.matchAll(/\.([\w-]+)/g))if(!n.className.split(/\s+/).includes(x[1]))return false;for(const x of s.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)){const value=n.getAttribute(x[1]);if(value===null||(x[2]!==undefined&&value!==x[2]))return false;}return true;}
 class Element extends Target{
  constructor(tag,attrs={}){super();this.localName=tag;this.tagName=tag.toUpperCase();this.attrs={...attrs};this.childNodes=[];this.parentNode=null;this.ownerDocument=doc;this.style={};Object.defineProperty(this.style,'setProperty',{value:(k,v)=>{this.style[k]=v;}});this.inert=false;this._value=null;this.dataset=new Proxy({},{get:(_,k)=>this.getAttribute('data-'+String(k).replace(/[A-Z]/g,c=>'-'+c.toLowerCase())),set:(_,k,v)=>{this.setAttribute('data-'+String(k).replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),v);return true;}});}
  get children(){return this.childNodes.filter(n=>n instanceof Element);}get parentElement(){return this.parentNode instanceof Element?this.parentNode:null;}
  get id(){return this.attrs.id||'';}get className(){return this.attrs.class||'';}set className(v){this.attrs.class=String(v);}
  get classList(){return {toggle:(name,force)=>{const list=new Set(this.className.split(/\s+/).filter(Boolean)),add=force??!list.has(name);add?list.add(name):list.delete(name);this.className=[...list].join(' ');return add;},contains:name=>this.className.split(/\s+/).includes(name)};}
  get hidden(){return 'hidden'in this.attrs;}set hidden(v){v?this.attrs.hidden='':delete this.attrs.hidden;}
  get disabled(){return 'disabled'in this.attrs;}set disabled(v){v?this.attrs.disabled='':delete this.attrs.disabled;}
  get open(){return 'open'in this.attrs;}set open(v){v?this.attrs.open='':delete this.attrs.open;}
  get value(){return this._value??this.attrs.value??(this.localName==='select'?this.children[0]?.value:'')??'';}set value(v){this._value=String(v);}
  setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];}
  appendChild(n){if(n.parentNode)n.parentNode.childNodes=n.parentNode.childNodes.filter(c=>c!==n);n.parentNode=this;n.ownerDocument=doc;this.childNodes.push(n);return n;}append(...nodes){for(const n of nodes)this.appendChild(typeof n==='string'?new Text(n):n);}
  replaceChildren(...nodes){for(const n of this.childNodes)n.parentNode=null;this.childNodes=[];this.append(...nodes);}
  get textContent(){return this.childNodes.map(n=>n.textContent).join('');}set textContent(v){this.replaceChildren(new Text(String(v)));}
  get innerHTML(){return this.childNodes.map(n=>n.outerHTML).join('');}set innerHTML(value){this.replaceChildren(...parse(value));}
  get outerHTML(){const attrs={...this.attrs};const style=Object.entries(this.style).map(([k,v])=>k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+':'+v).join(';');if(style)attrs.style=style;return '<'+this.localName+Object.entries(attrs).map(([k,v])=>' '+k+'="'+escape(v)+'"').join('')+'>'+this.innerHTML+'</'+this.localName+'>';}
  querySelectorAll(selector){const terms=selector.split(','),result=[];function walk(node){for(const n of node.children){if(terms.some(s=>matches(n,s)))result.push(n);walk(n);}}walk(this);return result;}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}closest(selector){for(let n=this;n instanceof Element;n=n.parentNode)if(matches(n,selector))return n;return null;}
  contains(n){for(;n;n=n.parentNode)if(n===this)return true;return false;}
  focus(){doc.activeElement=this;}click(){if(!this.disabled)this.emit('click',{detail:0});}
  getBoundingClientRect(){return {left,top,width,height,right:left+width,bottom:top+height};}
  setPointerCapture(pointerId){captures.add(pointerId);}hasPointerCapture(pointerId){return captures.has(pointerId);}releasePointerCapture(pointerId){captures.delete(pointerId);this.emit('lostpointercapture',{pointerId});}
 }
 function parse(text){const convert=n=>{if(n.type==='text')return new Text(n.data);if(!n.name)return null;const node=new Element(n.name,n.attribs);for(const child of n.children||[]){const value=convert(child);if(value)node.appendChild(value);}return node;};return html.parseDOM(text,{decodeEntities:true,recognizeSelfClosing:true,lowerCaseAttributeNames:false}).map(convert).filter(Boolean);}
 doc=new Element('document');doc.ownerDocument=doc;doc.createElement=tag=>new Element(tag);doc.createElementNS=(_,tag)=>new Element(tag);doc.hidden=false;doc.getElementById=id=>doc.querySelector('#'+id);doc.append(...parse(fs.readFileSync(path.join(root,'index.html'),'utf8')));
 win=new Target();win.parentNode=null;doc.parentNode=win;Object.assign(win,{document:doc,innerWidth:viewportWidth,innerHeight:viewportHeight,location:{origin:'https://webgamearena.com'},AtlasGeometry:G,AcademyContent:C,MapAtlasData:D,ProvinceAtlasData:require(path.join(root,'province-data.js')),AtlasFieldNotes:require(path.join(root,'field-notes.js')),AtlasView:require(path.join(root,'atlas-view.js')),AcademyEngine:require(path.join(root,'academy-engine.js')),AcademyAudio:require(path.join(root,'academy-audio.js')),
  requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:id=>frames.delete(id),postMessage:(data,origin)=>messages.push({data,origin}),GG:{setScore:score=>messages.push({type:'set',score}),submitScore:data=>messages.push({type:'submit',data}),openOverlay:()=>messages.push({type:'overlay'})},...audio});win.parent=win;
 const storage={getItem(k){if(failStorage)throw Error('denied');return saved.get(k)??null;},setItem(k,v){if(failStorage)throw Error('denied');saved.set(k,String(v));}};
 Object.defineProperty(win,'localStorage',{get(){if(failStorage)throw Error('denied');return storage;}});
 const app=require(path.join(root,'game.js')).create(win,doc),svg=doc.getElementById('atlas');
 return {app,doc,win,svg,messages,saved,captures,element:id=>doc.getElementById(id),click:id=>doc.getElementById(id).click(),event:(id,type,props)=>doc.getElementById(id).emit(type,props),
  point(point){const p=G.screen(point,width,height,app.view.view);return {clientX:left+p.x,clientY:top+p.y};},
  tap(point,pointerId=1){const p=this.point(point);svg.emit('pointerdown',{...p,pointerId});svg.emit('pointerup',{...p,pointerId});},
  key(el,key,props={}){const node=typeof el==='string'?doc.getElementById(el):el,e=node.emit('keydown',{key,...props});if(!e.defaultPrevented&&['Enter',' '].includes(key)&&node.tagName==='BUTTON')node.click();return e;},
  resize(w,h){win.innerWidth=w;win.innerHeight=h;win.emit('resize');},setMapSize(w,h){width=w;height=h;},
  frame(ms=16){clock+=ms;const batch=[...frames.values()];frames.clear();for(const fn of batch)fn(clock);},dispose(){app.dispose();}};
}
module.exports={boot,root,G,C,D};
