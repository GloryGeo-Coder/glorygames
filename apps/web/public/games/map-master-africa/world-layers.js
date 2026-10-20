/* Original, explicitly fictional comparison profiles; never real station measurements. */
(function(root){
 'use strict';
 const sites=[
  {id:'A',point:[-60,-3],region:'South America',vegetation:'Tropical rainforest',jan:27,jul:26,rain:2400},
  {id:'B',point:[23,0],region:'Africa',vegetation:'Tropical rainforest',jan:26,jul:25,rain:1800},
  {id:'C',point:[20,25],region:'Africa',vegetation:'Desert',jan:14,jul:34,rain:60},
  {id:'D',point:[90,60],region:'Asia',vegetation:'Coniferous forest',jan:-22,jul:17,rain:500},
  {id:'E',point:[135,-25],region:'Oceania',vegetation:'Desert',jan:31,jul:16,rain:180},
  {id:'F',point:[10,60],region:'Europe',vegetation:'Coniferous forest',jan:-5,jul:16,rain:700},
  {id:'G',point:[-105,55],region:'North America',vegetation:'Coniferous forest',jan:-18,jul:18,rain:450}
 ];
 const layers={none:'Countries and territories',january:'January temperature',july:'July temperature',rainfall:'Annual rainfall',vegetation:'Vegetation profiles'};
 const legends={january:'Dots: blue below 0 °C; green 0–19 °C; rust 20 °C or warmer.',july:'Dots: blue below 0 °C; green 0–19 °C; rust 20 °C or warmer.',rainfall:'Dots: ochre below 300 mm; green 300–1499 mm; blue 1500 mm or more per year.',vegetation:'Dots: green rainforest; ochre desert; blue coniferous forest.'};
 const note='Fictional practice profiles at map points A–G, not measured station records or whole-country values. Country colours identify geographic regions.';
 const value=(s,layer)=>layer==='january'?s.jan+' °C':layer==='july'?s.jul+' °C':layer==='rainfall'?s.rain+' mm':s.vegetation;
 function colour(s,layer){if(layer==='vegetation')return {'Tropical rainforest':'#23734f',Desert:'#a46826','Coniferous forest':'#3e5d86'}[s.vegetation];const n=layer==='january'?s.jan:layer==='july'?s.jul:s.rain;return layer==='rainfall'?(n>=1500?'#246d9d':n>=300?'#527e72':'#a46826'):(n<0?'#3e5d86':n<20?'#527e72':'#a45032');}
 function draw(svg,layer){let group=svg.querySelector('#worldStudyLayers');if(!group){group=svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('id','worldStudyLayers');group.setAttribute('pointer-events','none');svg.appendChild(group);}group.replaceChildren();if(!layers[layer]||layer==='none')return;
  const add=(tag,attrs,parent=group)=>{const el=svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,String(v));parent.appendChild(el);return el;};
  for(const s of sites){const g=add('g',{'data-study-site':s.id,'aria-label':s.id+': '+value(s,layer)});const title=add('title',{},g);title.textContent=s.id+' · '+s.region+' · '+value(s,layer);add('circle',{cx:s.point[0],cy:-s.point[1],r:3.8,class:'study-dot',fill:colour(s,layer),stroke:'#fff9e8','stroke-width':.7},g);const label=add('text',{x:s.point[0],y:-s.point[1]+1.4,'text-anchor':'middle','font-size':4,'font-weight':800,fill:'#fff',class:'study-letter'},g);label.textContent=s.id;}
 }
 function evidence(layer){return {title:layers[layer]+' · comparison points',text:note,columns:['Point · region',layers[layer]],rows:sites.map(s=>[s.id+' · '+s.region,value(s,layer)]),visual:'weather'};}
 const api={sites,layers,legends,note,value,draw,evidence};if(typeof module==='object'&&module.exports)module.exports=api;else root.WorldStudyLayers=api;
})(typeof window!=='undefined'?window:globalThis);
