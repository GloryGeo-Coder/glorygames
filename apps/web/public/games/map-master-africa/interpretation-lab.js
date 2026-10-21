/* Original metric teaching map; separately sourced USGS imagery uses image coordinates only. */
(function(root){
 'use strict';
 const contours=[
  {height:100,cx:1400,cy:1200,rx:1200,ry:1000},
  {height:120,cx:1500,cy:1200,rx:950,ry:800},
  {height:140,cx:1600,cy:1200,rx:700,ry:600},
  {height:160,cx:1650,cy:1200,rx:450,ry:400},
  {height:180,cx:1680,cy:1200,rx:210,ry:190}
 ];
 const terrain=[
  {id:'A',name:'Western slope',x:700,y:1200},
  {id:'B',name:'Eastern slope',x:2375,y:1200},
  {id:'C',name:'West road junction',x:500,y:2500},
  {id:'D',name:'School',x:1500,y:2500},
  {id:'E',name:'Woodland',x:3100,y:650},
  {id:'F',name:'River',x:3500,y:1500},
  {id:'G',name:'Bridge',x:3500,y:2500},
  {id:'H',name:'Spot height 192 m',x:1680,y:1200}
 ];
 const image=[{id:'P',name:'Image sample P',x:400,y:300},{id:'Q',name:'Image sample Q',x:635,y:468},{id:'R',name:'Image sample R',x:1060,y:275},{id:'S',name:'Image sample S',x:320,y:440}];
 const extents={topo:{x:-220,y:-200,w:4440,h:3400},photo:{x:-35,y:-35,w:1406,h:762}};
 const features=mode=>mode==='photo'?image:terrain;
 function featureAt(point,tolerance,mode='topo'){return [...features(mode)].sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y)).find(n=>Math.hypot(n.x-point.x,n.y-point.y)<=tolerance)?.id||null;}
 function distance(ids,mode='topo'){if(mode!=='topo'||!Array.isArray(ids)||ids.length!==2||ids[0]===ids[1])return null;const a=terrain.find(n=>n.id===ids[0]),b=terrain.find(n=>n.id===ids[1]);return a&&b?Math.hypot(a.x-b.x,a.y-b.y):null;}
 function inspect(ids,q){return Array.isArray(ids)&&ids.length===2&&new Set(ids).size===2&&q.answer.every(id=>ids.includes(id))&&distance(ids,q.surface||'topo')!==null;}
 function nextFeature(id,dx,dy,mode){const list=features(mode),p=list.find(n=>n.id===id);if(!p)return null;return list.filter(n=>(n.x-p.x)*dx+(n.y-p.y)*dy>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]?.id||id;}
 function painter(svg){const doc=svg.ownerDocument;function add(tag,attrs={},parent=svg){const n=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));parent.appendChild(n);return n;}return {add,text(value,x,y,attrs={},parent=svg){const n=add('text',{x,y,...attrs},parent);n.textContent=value;return n;}};}
 function draw(svg,{mode='topo',selected=null,measure=[],radius:targetRadius,transect}={}){
  const{add,text}=painter(svg);svg.replaceChildren();
  if(mode==='photo'){
   add('rect',{x:-35,y:-35,width:1406,height:762,fill:'#d6e3d8'});
   add('image',{href:'./assets/learning/usgs-washington-ortho.jpg',x:0,y:0,width:1336,height:692,preserveAspectRatio:'xMidYMid meet','aria-label':'USGS historical orthoimage of Washington, D.C.; river, crossings, street blocks and tree cover'});
  }else{
   add('rect',{x:0,y:0,width:4000,height:3000,fill:'#eef0dd',stroke:'#527c63','stroke-width':2,'vector-effect':'non-scaling-stroke'});
   for(let x=0;x<=4000;x+=1000){add('path',{d:`M${x},0V3000`,stroke:'#c0d0bf','stroke-width':1,'vector-effect':'non-scaling-stroke'});text(x/1000,x,-90,{class:'terrain-note','text-anchor':'middle'});}
   for(let y=0;y<=3000;y+=1000){add('path',{d:`M0,${y}H4000`,stroke:'#c0d0bf','stroke-width':1,'vector-effect':'non-scaling-stroke'});if(y>0&&y<3000)text((3000-y)/1000,-115,y,{class:'terrain-note','text-anchor':'middle'});}
   add('path',{d:'M3900,500V200L3830,300M3900,200L3970,300',stroke:'#244f43','stroke-width':2,fill:'none','vector-effect':'non-scaling-stroke'});text('N',3900,110,{class:'terrain-note','text-anchor':'middle'});
   text('Fictional plan',2500,2720,{class:'terrain-note','text-anchor':'middle'});
   add('path',{d:'M2900,220Q3320,100 3370,600L3310,1000L2860,950Z',fill:'#bdd0a6',stroke:'#78935e','stroke-width':1,'vector-effect':'non-scaling-stroke'});
   for(const c of contours){add('ellipse',{cx:c.cx,cy:c.cy,rx:c.rx,ry:c.ry,fill:'none',stroke:'#9b6e3b','stroke-width':1.7,'vector-effect':'non-scaling-stroke','data-elevation':c.height});text(c.height+' m',c.cx,c.cy-c.ry+50,{class:'terrain-note','text-anchor':'middle'});}
   add('path',{d:'M3500,0V3000',fill:'none',stroke:'#5296b2','stroke-width':6,'vector-effect':'non-scaling-stroke'});
   add('path',{d:'M500,2500H3800',fill:'none',stroke:'#c5ac7e','stroke-width':8,'vector-effect':'non-scaling-stroke'});
   add('path',{d:'M3420,2430H3580M3420,2570H3580',stroke:'#566d65','stroke-width':2,'vector-effect':'non-scaling-stroke'});
   add('rect',{x:1420,y:2320,width:160,height:110,fill:'#d8a179',stroke:'#73553f','stroke-width':1,'vector-effect':'non-scaling-stroke'});
   add('path',{d:'M100,2820V2890M100,2855H2100M1100,2820V2890M2100,2820V2890',stroke:'#244f43','stroke-width':2,'vector-effect':'non-scaling-stroke'});
   for(const[v,x]of [['0',100],['1000',1100],['2000 m',2100]])text(v,x,3070,{class:'terrain-note','text-anchor':'middle'});
  }
  if(mode==='topo'&&Array.isArray(transect)&&transect.length===2&&transect.every(p=>Array.isArray(p)&&p.length===2&&[p[0],p[1]].every(Number.isFinite))){add('path',{d:`M${transect[0][0]},${transect[0][1]}L${transect[1][0]},${transect[1][1]}`,stroke:'#8d5b98','stroke-width':3,'stroke-dasharray':'8 5','vector-effect':'non-scaling-stroke','pointer-events':'none','data-transect':'X-Z'});for(const[i,label]of ['X','Z'].entries())text(label,transect[i][0],transect[i][1]-Math.max(110,2*(targetRadius||60)),{class:'terrain-note','text-anchor':'middle'});}
  const radius=targetRadius||(mode==='photo'?14:60);
  for(const n of features(mode)){const chosen=n.id===selected||measure.includes(n.id),group=add('g',{'data-feature':n.id,role:'button',tabindex:0,'aria-label':n.id+' · '+n.name});add('circle',{cx:n.x,cy:n.y,r:radius,fill:chosen?'#e8b342':'#fffdf1',stroke:'#244f43','stroke-width':2,'vector-effect':'non-scaling-stroke'},group);text(n.id,n.x,n.y,{class:'terrain-letter','text-anchor':'middle','dominant-baseline':'middle'},group);}
  const layer=add('g',{id:'atlasMarkers','pointer-events':'none'});
  if(mode==='topo'&&distance(measure)!==null){const [a,b]=measure.map(id=>terrain.find(n=>n.id===id));add('path',{d:`M${a.x},${a.y}L${b.x},${b.y}`,stroke:'#176b83','stroke-width':4,'stroke-dasharray':'8 5','vector-effect':'non-scaling-stroke'},layer);}
 }
 function landforms(svg){const{add,text}=painter(svg);svg.setAttribute('viewBox','0 0 360 200');svg.setAttribute('role','img');svg.setAttribute('aria-label','Schematic contour comparison: valley Vs point upstream, spur Vs point downslope. Heights fall from 120 to 80 metres towards the bottom.');add('rect',{width:360,height:200,fill:'#fffdf5',rx:10});text('Valley',85,22,{'font-size':16,'text-anchor':'middle',fill:'#244f43'});text('Spur',265,22,{'font-size':16,'text-anchor':'middle',fill:'#244f43'});for(let i=0;i<3;i++){const y=68+i*35;add('path',{d:`M15,${y}L85,${y-22}L155,${y}M195,${y-22}L265,${y}L335,${y-22}`,fill:'none',stroke:'#9b6e3b','stroke-width':2});text(120-i*20,158,y,{'font-size':12,fill:'#745b3b'});}add('path',{d:'M85,36V164L78,154M85,164L92,154',stroke:'#5296b2','stroke-width':3,fill:'none'});text('River flows down',85,188,{'font-size':14,'text-anchor':'middle',fill:'#244f43'});text('Lower ground ↓',265,188,{'font-size':14,'text-anchor':'middle',fill:'#244f43'});}
 const api={contours,terrain,image,extents,features,featureAt,distance,inspect,nextFeature,draw,landforms};if(typeof module==='object'&&module.exports)module.exports=api;else root.AtlasInterpretationLab=api;
})(typeof window!=='undefined'?window:globalThis);
